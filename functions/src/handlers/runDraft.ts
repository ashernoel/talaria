import * as admin from "firebase-admin";
import * as crypto from "crypto";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import {
  DEFAULT_VOICE_PROFILE,
  DEFAULT_EMAIL_ETA_MS,
  type BootstrapEmail,
  type DraftRecord,
  type PublicResearchDoc,
  type ResearchDoc,
  type VoiceProfile,
} from "../_shared";
import { runDraftModel, FAST_MODEL_ID } from "../anthropic";
import { scrapeCompanySite } from "../scrape";
import { buildSystemPrompt, buildUserPrompt } from "../prompt";
import { runResearchModel } from "../research";
import { logError, logInfo } from "../logging";

const MAX_EXAMPLES = 6;
const RESEARCH_SITE_BASE =
  (process.env.TALARIA_PUBLIC_BASE_URL ?? process.env.TAMARIA_PUBLIC_BASE_URL)?.replace(/\/$/, "") ||
  "https://talaria-app.web.app";

export const runDraftHandler = onDocumentCreated(
  {
    document: "users/{uid}/drafts/{draftId}",
    region: "us-central1",
    memory: "1GiB",
    timeoutSeconds: 540,
    concurrency: 10,
    maxInstances: 10,
    secrets: ["ANTHROPIC_API_KEY"],
  },
  async (event) => {
    const snap = event.data;
    if (!snap) return;
    const uid = event.params.uid;
    const draftId = event.params.draftId;

    const ref = snap.ref;
    const db = admin.firestore();

    let draft: DraftRecord;
    try {
      draft = await db.runTransaction(async (tx) => {
        const current = await tx.get(ref);
        if (!current.exists) throw new Error("missing");
        const data = current.data() as DraftRecord;
        if (data.status !== "queued") throw new Error(`status:${data.status}`);
        tx.update(ref, {
          status: "running",
          phase: "scraping",
          progress: 0.05,
          startedAt: Date.now(),
        });
        return data;
      });
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      logInfo("runDraft.skip", { uid, draftId, reason });
      return;
    }

    try {
      // Parallelize the three independent warm-up reads.
      const [site, userDocSnap, examples] = await Promise.all([
        scrapeCompanySite(draft.inputs.url),
        db.doc(`users/${uid}`).get(),
        loadExamples(uid),
      ]);

      // Effort knob: 1 = fast path (haiku draft, skip research unless explicitly requested).
      // >=2 = full pipeline with opus + research.
      const effort = Math.max(1, draft.inputs.effortMinutes ?? 1);
      const wantsResearchOutputs =
        !!draft.inputs.includeResearchSite || !!draft.inputs.includePdfReport;
      const needsResearch = wantsResearchOutputs || effort >= 2;
      const fastDraft = effort <= 1;

      // Pre-generate the public research ID so the draft prompt can weave in the URL
      // before the research call has returned — lets both Claude calls run concurrently.
      const researchPublicId =
        needsResearch && draft.inputs.includeResearchSite
          ? crypto.randomBytes(10).toString("base64url")
          : undefined;
      const researchSiteUrl = researchPublicId
        ? `${RESEARCH_SITE_BASE}/research/?id=${researchPublicId}`
        : undefined;

      await ref.update({
        phase: needsResearch ? "researching" : "generating",
        progress: 0.2,
        companyName: site.companyName,
        companyDomain: site.domain,
        companyUrl: site.finalUrl,
      });

      const voice: VoiceProfile = {
        ...DEFAULT_VOICE_PROFILE,
        ...((userDocSnap.data() ?? {}).voiceProfile ?? {}),
      };

      const system = buildSystemPrompt(voice);
      const user = buildUserPrompt({
        site,
        voice,
        examples,
        userNotes: draft.inputs.notes,
        salesforceLog: draft.inputs.salesforceLog,
        researchSiteUrl,
      });

      // Heartbeat: tick the progress bar every 2s while the model calls are running,
      // so the UI doesn't sit still for 30+ seconds.
      const heartbeatStart = Date.now();
      const expectedMs = fastDraft ? 15_000 : needsResearch ? 35_000 : 20_000;
      const heartbeat = setInterval(() => {
        const elapsed = Date.now() - heartbeatStart;
        const frac = Math.min(elapsed / expectedMs, 0.95);
        const progress = 0.2 + frac * 0.65; // 0.2 → 0.85
        const phase = frac < 0.55 && needsResearch ? "researching" : "generating";
        ref
          .update({
            progress,
            phase,
            etaMs: Math.max(0, expectedMs - elapsed),
          })
          .catch(() => {});
      }, 2000);

      // Fire research and draft in parallel — the dominant cost of the pipeline.
      // Research is allowed to fail; we fall back to a minimal doc rather than crash the run.
      const researchPromise: Promise<Awaited<ReturnType<typeof runResearchModel>> | null> = needsResearch
        ? runResearchModel({
            site,
            userNotes: draft.inputs.notes,
            salesforceLog: draft.inputs.salesforceLog,
            researchSiteExample: draft.inputs.researchSiteExample,
            pdfReportExample: draft.inputs.pdfReportExample,
          }).catch((err) => {
            logError("runDraft.research.failed", err, { uid, draftId });
            return null;
          })
        : Promise.resolve(null);
      const draftPromise = runDraftModel({
        system,
        user,
        model: fastDraft ? FAST_MODEL_ID : undefined,
      });

      let researchBody: Awaited<typeof researchPromise> = null;
      let draftResult: Awaited<typeof draftPromise>;
      try {
        [researchBody, draftResult] = await Promise.all([researchPromise, draftPromise]);
      } finally {
        clearInterval(heartbeat);
      }
      const { output } = draftResult;

      let researchDoc: ResearchDoc | undefined;
      if (researchBody) {
        researchDoc = {
          id: draftId,
          companyName: site.companyName || site.domain,
          companyDomain: site.domain,
          companyUrl: site.finalUrl,
          tagline: researchBody.tagline,
          generatedAt: Date.now(),
          sourcesConsulted: [
            { url: site.finalUrl, summary: site.description || site.title || site.domain },
          ],
          whyChat: researchBody.whyChat,
          companyStrengths: researchBody.companyStrengths,
          bottomLine: researchBody.bottomLine,
          battlegrounds: researchBody.battlegrounds,
          personas: researchBody.personas,
          milestones: researchBody.milestones,
          whitespace: researchBody.whitespace,
          whyNow: researchBody.whyNow,
        };

        if (researchPublicId) {
          const publicDoc: PublicResearchDoc = {
            ...researchDoc,
            id: researchPublicId,
            ownerUid: uid,
            sourceDraftId: draftId,
          };
          await db.doc(`publicResearch/${researchPublicId}`).set(publicDoc);
        }
      }

      await ref.update({
        phase: "writing",
        progress: 0.9,
      });

      const patch: Partial<DraftRecord> = {
        status: "done",
        progress: 1,
        completedAt: Date.now(),
        generatedAt: Date.now(),
        generatedSubject: output.subject,
        generatedBody: output.body,
        sourcesConsulted: [
          { url: site.finalUrl, summary: site.description || site.title || site.domain },
        ],
      };
      if (researchDoc) patch.researchDoc = researchDoc;
      if (researchPublicId) patch.researchPublicId = researchPublicId;
      if (researchSiteUrl) patch.researchSiteUrl = researchSiteUrl;
      await ref.update(patch);

      logInfo("runDraft.success", {
        uid,
        draftId,
        domain: site.domain,
        elapsedMs: Date.now() - (draft.queuedAt ?? Date.now()),
      });
    } catch (err) {
      logError("runDraft.failed", err, { uid, draftId });
      const message = err instanceof Error ? err.message : String(err);
      await ref.update({
        status: "failed",
        error: message.slice(0, 500),
        completedAt: Date.now(),
        etaMs: DEFAULT_EMAIL_ETA_MS,
      });
    }
  },
);

async function loadExamples(uid: string): Promise<Array<BootstrapEmail | DraftRecord>> {
  const db = admin.firestore();
  const approved = await db
    .collection(`users/${uid}/drafts`)
    .where("action", "==", "approved")
    .orderBy("generatedAt", "desc")
    .limit(MAX_EXAMPLES)
    .get()
    .catch(() => null);

  const approvedDocs = approved?.docs.map((d) => d.data() as DraftRecord) ?? [];
  if (approvedDocs.length >= MAX_EXAMPLES) return approvedDocs;

  const remaining = MAX_EXAMPLES - approvedDocs.length;
  const bootstrap = await db
    .collection(`users/${uid}/bootstrap`)
    .orderBy("submittedAt", "desc")
    .limit(remaining)
    .get();
  return [...approvedDocs, ...bootstrap.docs.map((d) => d.data() as BootstrapEmail)];
}

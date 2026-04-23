import * as admin from "firebase-admin";
import {
  RegenerateRequestSchema,
  type RegenerateResponse,
  DEFAULT_VOICE_PROFILE,
  type VoiceProfile,
  type DraftRecord,
  type BootstrapEmail,
} from "../_shared";
import { HandlerError, withAuth } from "../auth";
import { runDraftModel } from "../anthropic";
import { scrapeCompanySite } from "../scrape";
import { buildSystemPrompt, buildUserPrompt } from "../prompt";
import { logInfo } from "../logging";

const MAX_EXAMPLES = 6;
const EST_COST_PER_REGENERATE = 0.08;

export const regenerateWithFeedbackHandler = withAuth(
  RegenerateRequestSchema,
  async (body, ctx): Promise<RegenerateResponse> => {
    const db = admin.firestore();
    const userRef = db.doc(`users/${ctx.uid}`);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
      throw new HandlerError(409, "not_onboarded", "Finish onboarding before drafting");
    }
    const userDoc = userSnap.data() ?? {};
    const voice: VoiceProfile = { ...DEFAULT_VOICE_PROFILE, ...(userDoc.voiceProfile ?? {}) };

    const draftRef = db.doc(`users/${ctx.uid}/drafts/${body.draftId}`);
    const draftSnap = await draftRef.get();
    if (!draftSnap.exists) {
      throw new HandlerError(404, "draft_not_found", "That draft no longer exists");
    }
    const draft = draftSnap.data() as DraftRecord;
    if (draft.status !== "done") {
      throw new HandlerError(409, "draft_not_ready", "This draft is still running. Wait for it to finish.");
    }

    const site = await scrapeCompanySite(draft.companyUrl);

    const examples = await loadExamples(ctx.uid);

    const system = buildSystemPrompt(voice);
    const user = buildUserPrompt({
      site,
      voice,
      examples,
      userNotes: draft.notes,
      salesforceLog: draft.salesforceContext,
      researchSiteUrl: draft.researchSiteUrl,
      regenerationFeedback: body.feedback,
      previousAttempt: {
        subject: draft.finalSubject ?? draft.generatedSubject ?? "",
        body: draft.finalBody ?? draft.generatedBody ?? "",
      },
    });

    const { output } = await runDraftModel({ system, user });

    const feedbackChain = [...(draft.feedbackChain ?? []), body.feedback];
    await draftRef.set(
      {
        generatedSubject: output.subject,
        generatedBody: output.body,
        generatedAt: Date.now(),
        feedbackChain,
      },
      { merge: true },
    );

    logInfo("draft.regenerated", { uid: ctx.uid, draftId: body.draftId, feedbackChainLen: feedbackChain.length });

    return {
      draftId: body.draftId,
      subject: output.subject,
      body: output.body,
      sourcesConsulted: draft.sourcesConsulted ?? [],
      warnings: site.warnings.length > 0 ? site.warnings : undefined,
    };
  },
  { rateLimitKey: "regenerate", costDollars: EST_COST_PER_REGENERATE },
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

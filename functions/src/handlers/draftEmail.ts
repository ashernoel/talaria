import * as admin from "firebase-admin";
import {
  DraftEmailRequestSchema,
  type DraftEmailResponse,
  type DraftRecord,
  type DraftInputs,
  type DraftOutputsFlags,
  MAX_ACTIVE_RUNS_PER_USER,
  DEFAULT_EMAIL_ETA_MS,
} from "../_shared";
import { HandlerError, withAuth } from "../auth";
import { logInfo } from "../logging";

export const draftEmailHandler = withAuth(
  DraftEmailRequestSchema,
  async (body, ctx): Promise<DraftEmailResponse> => {
    const db = admin.firestore();
    const userRef = db.doc(`users/${ctx.uid}`);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
      throw new HandlerError(409, "not_onboarded", "Finish onboarding before drafting");
    }
    const userDoc = userSnap.data() ?? {};
    if (!userDoc.bootstrapComplete) {
      throw new HandlerError(409, "not_onboarded", "Finish onboarding before drafting");
    }

    const draftsCol = db.collection(`users/${ctx.uid}/drafts`);
    const activeSnap = await draftsCol.where("status", "in", ["queued", "running"]).get();
    if (activeSnap.size >= MAX_ACTIVE_RUNS_PER_USER) {
      throw new HandlerError(
        429,
        "too_many_active_runs",
        `You have ${activeSnap.size} runs in flight. Wait for some to finish (limit ${MAX_ACTIVE_RUNS_PER_USER}).`,
      );
    }

    const inputs: DraftInputs = {
      url: body.url.trim(),
      notes: body.notes?.trim() || undefined,
      salesforceLog: body.salesforceLog?.trim() || undefined,
      includeResearchSite: body.includeResearchSite ?? false,
      researchSiteExample: body.researchSiteExample?.trim() || undefined,
      includePdfReport: body.includePdfReport ?? false,
      pdfReportExample: body.pdfReportExample?.trim() || undefined,
      effortMinutes: body.effortMinutes ?? 1,
    };
    const outputs: DraftOutputsFlags = {
      email: true,
      researchSite: inputs.includeResearchSite ?? false,
      pdfReport: inputs.includePdfReport ?? false,
    };

    const draftRef = draftsCol.doc();
    const record: DraftRecord = {
      id: draftRef.id,
      status: "queued",
      progress: 0,
      etaMs: DEFAULT_EMAIL_ETA_MS,
      queuedAt: Date.now(),
      inputs,
      outputs,
      companyUrl: inputs.url,
      notes: inputs.notes,
      salesforceContext: inputs.salesforceLog,
    };
    await draftRef.set(record);

    logInfo("draft.queued", { uid: ctx.uid, draftId: draftRef.id, url: inputs.url });

    return { draftId: draftRef.id, status: "queued" };
  },
  { rateLimitKey: "draftEmail" },
);

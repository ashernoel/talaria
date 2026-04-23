import * as admin from "firebase-admin";
import { LogEditRequestSchema, type LogEditResponse, type DraftRecord } from "../_shared";
import { HandlerError, withAuth } from "../auth";
import { logInfo } from "../logging";

export const logEditHandler = withAuth(
  LogEditRequestSchema,
  async (body, ctx): Promise<LogEditResponse> => {
    const db = admin.firestore();
    const draftRef = db.doc(`users/${ctx.uid}/drafts/${body.draftId}`);
    const snap = await draftRef.get();
    if (!snap.exists) {
      throw new HandlerError(404, "draft_not_found", "That draft no longer exists");
    }
    const draft = snap.data() as DraftRecord;

    const patch: Partial<DraftRecord> & { actionAt: number } = {
      action: body.action,
      actionAt: Date.now(),
    };
    if (body.finalSubject !== undefined) patch.finalSubject = body.finalSubject;
    if (body.finalBody !== undefined) patch.finalBody = body.finalBody;
    await draftRef.set(patch, { merge: true });

    let voiceProfileUpdated = false;
    if (body.action === "approved" || (body.action === "edited" && isSignificantEdit(draft, body))) {
      voiceProfileUpdated = await nudgeVoiceProfile(ctx.uid);
    }

    logInfo("draft.action", { uid: ctx.uid, draftId: body.draftId, action: body.action });

    return { ok: true, voiceProfileUpdated };
  },
  { rateLimitKey: "logEdit" },
);

function isSignificantEdit(
  draft: DraftRecord,
  body: { finalSubject?: string; finalBody?: string },
): boolean {
  const origBody = draft.generatedBody ?? "";
  const newBody = body.finalBody ?? origBody;
  if (!origBody || !newBody) return false;
  if (origBody === newBody) return false;
  const lenDelta = Math.abs(newBody.length - origBody.length) / Math.max(origBody.length, 1);
  return lenDelta > 0.15;
}

async function nudgeVoiceProfile(uid: string): Promise<boolean> {
  const db = admin.firestore();
  const ref = db.doc(`users/${uid}`);
  await ref.set({ voiceProfile: { updatedAt: Date.now() } }, { merge: true });
  return true;
}

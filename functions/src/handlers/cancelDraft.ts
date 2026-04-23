import * as admin from "firebase-admin";
import {
  CancelDraftRequestSchema,
  type CancelDraftResponse,
  type DraftRecord,
} from "../_shared";
import { HandlerError, withAuth } from "../auth";
import { logInfo } from "../logging";

export const cancelDraftHandler = withAuth(
  CancelDraftRequestSchema,
  async (body, ctx): Promise<CancelDraftResponse> => {
    const db = admin.firestore();
    const ref = db.doc(`users/${ctx.uid}/drafts/${body.draftId}`);

    const finalStatus = await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) {
        throw new HandlerError(404, "draft_not_found", "That draft no longer exists");
      }
      const draft = snap.data() as DraftRecord;
      if (draft.status !== "queued") {
        throw new HandlerError(
          409,
          "not_cancellable",
          `Can't stop a run that's already ${draft.status}.`,
        );
      }
      tx.update(ref, {
        status: "cancelled",
        completedAt: Date.now(),
      });
      return "cancelled" as const;
    });

    logInfo("draft.cancelled", { uid: ctx.uid, draftId: body.draftId });
    return { ok: true, status: finalStatus };
  },
  { rateLimitKey: "cancelDraft" },
);

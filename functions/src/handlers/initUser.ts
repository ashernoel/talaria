import * as admin from "firebase-admin";
import { z } from "zod";
import { DEFAULT_VOICE_PROFILE } from "../_shared";
import { withAuth } from "../auth";
import { logInfo } from "../logging";

export const initUserHandler = withAuth(
  z.object({}).passthrough(),
  async (_body, ctx) => {
    const db = admin.firestore();
    const ref = db.doc(`users/${ctx.uid}`);
    const snap = await ref.get();
    if (!snap.exists) {
      await ref.set({
        email: ctx.email,
        createdAt: Date.now(),
        bootstrapComplete: false,
        voiceProfile: { ...DEFAULT_VOICE_PROFILE, updatedAt: Date.now() },
      });
      logInfo("user.initialized", { uid: ctx.uid });
      return { created: true, bootstrapComplete: false };
    }
    const doc = snap.data() ?? {};
    return { created: false, bootstrapComplete: doc.bootstrapComplete === true };
  },
  { rateLimitKey: "initUser" },
);

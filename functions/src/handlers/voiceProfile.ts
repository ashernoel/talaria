import * as admin from "firebase-admin";
import {
  VoiceProfileUpdateRequestSchema,
  type VoiceProfileResponse,
  DEFAULT_VOICE_PROFILE,
  type VoiceProfile,
} from "../_shared";
import { withAuth } from "../auth";
import { z } from "zod";
import { logInfo } from "../logging";

export const getVoiceProfileHandler = withAuth(
  z.object({}).passthrough(),
  async (_body, ctx): Promise<VoiceProfileResponse> => {
    const db = admin.firestore();
    const snap = await db.doc(`users/${ctx.uid}`).get();
    const doc = snap.data() ?? {};
    const voice: VoiceProfile = { ...DEFAULT_VOICE_PROFILE, ...(doc.voiceProfile ?? {}) };
    return { voiceProfile: voice, bootstrapComplete: doc.bootstrapComplete === true };
  },
  { rateLimitKey: "voiceProfileGet" },
);

export const updateVoiceProfileHandler = withAuth(
  VoiceProfileUpdateRequestSchema,
  async (body, ctx): Promise<VoiceProfileResponse> => {
    const db = admin.firestore();
    const ref = db.doc(`users/${ctx.uid}`);
    const voice: VoiceProfile = { ...body.voiceProfile, updatedAt: Date.now() };
    await ref.set({ voiceProfile: voice }, { merge: true });
    const snap = await ref.get();
    const doc = snap.data() ?? {};
    logInfo("voiceProfile.updated", { uid: ctx.uid });
    return { voiceProfile: voice, bootstrapComplete: doc.bootstrapComplete === true };
  },
  { rateLimitKey: "voiceProfilePut" },
);

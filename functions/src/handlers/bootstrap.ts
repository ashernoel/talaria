import * as admin from "firebase-admin";
import {
  BootstrapSubmitRequestSchema,
  type BootstrapSubmitResponse,
  DEFAULT_VOICE_PROFILE,
  type BootstrapEmail,
} from "../_shared";
import { withAuth } from "../auth";
import { logInfo } from "../logging";

export const bootstrapSubmitHandler = withAuth(
  BootstrapSubmitRequestSchema,
  async (body, ctx): Promise<BootstrapSubmitResponse> => {
    const db = admin.firestore();
    const userRef = db.doc(`users/${ctx.uid}`);
    const userSnap = await userRef.get();
    const userDoc = userSnap.data() ?? {};

    const existing = { ...DEFAULT_VOICE_PROFILE, ...(userDoc.voiceProfile ?? {}) };
    const voice = {
      ...existing,
      tone: body.voicePrompt.trim() || existing.tone,
      signatureClose: body.signatureClose.trim() || existing.signatureClose,
      firmInfo: body.firmInfo.trim() || existing.firmInfo,
      updatedAt: Date.now(),
    };

    const batch = db.batch();
    batch.set(
      userRef,
      {
        email: ctx.email,
        createdAt: userDoc.createdAt ?? Date.now(),
        bootstrapComplete: true,
        voiceProfile: voice,
      },
      { merge: true },
    );

    const bootstrapCol = db.collection(`users/${ctx.uid}/bootstrap`);
    for (const email of body.emails) {
      const ref = bootstrapCol.doc();
      const record: BootstrapEmail = {
        id: ref.id,
        subject: email.subject,
        body: email.body,
        recipient: email.recipient,
        submittedAt: Date.now(),
      };
      batch.set(ref, record);
    }

    await batch.commit();
    logInfo("bootstrap.submitted", { uid: ctx.uid, count: body.emails.length });

    return { ok: true, count: body.emails.length };
  },
  { rateLimitKey: "bootstrap" },
);

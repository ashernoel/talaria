import * as admin from "firebase-admin";

const DAILY_REQUEST_LIMIT = 10000;
const DAILY_COST_LIMIT_DOLLARS = 100;
const WINDOW_MS = 24 * 60 * 60 * 1000;

export interface LimitResult {
  ok: boolean;
  reason?: string;
}

function todayBucket(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function checkRateLimit(uid: string, action: string, estCostDollars: number): Promise<LimitResult> {
  const bucket = todayBucket();
  const ref = admin.firestore().doc(`users/${uid}/rateLimits/${bucket}`);
  try {
    const result = await admin.firestore().runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const data = snap.exists ? snap.data() ?? {} : {};
      const count = (data.count as number | undefined) ?? 0;
      const spend = (data.spend as number | undefined) ?? 0;
      if (count >= DAILY_REQUEST_LIMIT) {
        return { ok: false, reason: `Daily limit of ${DAILY_REQUEST_LIMIT} requests reached. Resets at midnight UTC.` };
      }
      if (spend + estCostDollars > DAILY_COST_LIMIT_DOLLARS) {
        return { ok: false, reason: `Daily spend cap of $${DAILY_COST_LIMIT_DOLLARS} reached. Resets at midnight UTC.` };
      }
      tx.set(
        ref,
        {
          count: count + 1,
          spend: spend + estCostDollars,
          expiresAt: Date.now() + WINDOW_MS,
          lastAction: action,
          lastAt: Date.now(),
        },
        { merge: true },
      );
      return { ok: true };
    });
    return result;
  } catch {
    // If the rate-limit machinery itself fails, fail open so the user isn't locked out.
    return { ok: true };
  }
}

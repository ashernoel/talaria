import { logger } from "firebase-functions/v2";

export function logInfo(event: string, fields: Record<string, unknown> = {}): void {
  logger.info(event, sanitize(fields));
}

export function logError(event: string, err: unknown, fields: Record<string, unknown> = {}): void {
  const e = err instanceof Error ? { message: err.message, stack: err.stack, name: err.name } : { value: String(err) };
  logger.error(event, { ...sanitize(fields), error: e });
}

export function logWarn(event: string, fields: Record<string, unknown> = {}): void {
  logger.warn(event, sanitize(fields));
}

// Scrub fields that can contain free-form PII (email bodies, scraped content).
// Keep metadata (uid, action, latency) for debugging.
const SENSITIVE_KEYS = new Set(["body", "finalBody", "emailBody", "scrapedContent", "feedback", "notes"]);

function sanitize(fields: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(fields)) {
    if (SENSITIVE_KEYS.has(k) && typeof v === "string") {
      out[k] = `<redacted ${v.length}b>`;
    } else {
      out[k] = v;
    }
  }
  return out;
}

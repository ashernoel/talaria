import type { Request } from "firebase-functions/v2/https";
import type { Response } from "express";
import * as admin from "firebase-admin";
import { z, ZodError } from "zod";
import { logError, logInfo } from "./logging";
import { checkRateLimit } from "./rateLimit";

export interface AuthedContext {
  uid: string;
  email: string | null;
}

type Handler<TBody, TOut> = (
  body: TBody,
  ctx: AuthedContext,
  req: Request,
) => Promise<TOut>;

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:5000",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5000",
  process.env.ALLOWED_ORIGIN ?? "",
].filter(Boolean);

function applyCors(req: Request, res: Response): boolean {
  const origin = req.get("Origin") ?? "";
  const isAllowed = ALLOWED_ORIGINS.includes(origin) || origin.endsWith(".web.app") || origin.endsWith(".firebaseapp.com");
  if (isAllowed) {
    res.set("Access-Control-Allow-Origin", origin);
    res.set("Vary", "Origin");
  }
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
  res.set("Access-Control-Max-Age", "3600");
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return true;
  }
  return false;
}

export function withAuth<TSchema extends z.ZodTypeAny, TOut>(
  schema: TSchema,
  handler: Handler<z.infer<TSchema>, TOut>,
  opts: { rateLimitKey: string; costDollars?: number } = { rateLimitKey: "default" },
) {
  return async (req: Request, res: Response): Promise<void> => {
    if (applyCors(req, res)) return;

    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const authHeader = req.get("Authorization") ?? "";
    const match = authHeader.match(/^Bearer (.+)$/);
    if (!match) {
      res.status(401).json({ error: "Missing bearer token" });
      return;
    }

    let decoded: admin.auth.DecodedIdToken;
    try {
      decoded = await admin.auth().verifyIdToken(match[1]);
    } catch (err) {
      logError("auth.verifyIdToken.failed", err);
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    if (!decoded.email_verified) {
      res.status(403).json({ error: "Please verify your Google email before using talaria." });
      return;
    }

    const ctx: AuthedContext = { uid: decoded.uid, email: decoded.email ?? null };

    const limitCheck = await checkRateLimit(ctx.uid, opts.rateLimitKey, opts.costDollars ?? 0);
    if (!limitCheck.ok) {
      res.status(429).json({ error: limitCheck.reason, code: "rate_limited" });
      return;
    }

    let parsed: z.infer<TSchema>;
    try {
      parsed = schema.parse(req.body ?? {}) as z.infer<TSchema>;
    } catch (err) {
      if (err instanceof ZodError) {
        const issue = err.issues[0];
        res.status(400).json({ error: issue?.message ?? "Invalid request", code: "invalid_request" });
        return;
      }
      res.status(400).json({ error: "Invalid JSON body" });
      return;
    }

    const start = Date.now();
    try {
      const out = await handler(parsed, ctx, req);
      const latency = Date.now() - start;
      logInfo("handler.success", { uid: ctx.uid, path: req.path, latency_ms: latency });
      res.status(200).json(out);
    } catch (err) {
      const latency = Date.now() - start;
      const message = err instanceof Error ? err.message : String(err);
      const code = err instanceof HandlerError ? err.code : "internal_error";
      const status = err instanceof HandlerError ? err.status : 500;
      logError("handler.error", err, { uid: ctx.uid, path: req.path, latency_ms: latency, code });
      res.status(status).json({ error: message, code });
    }
  };
}

export class HandlerError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

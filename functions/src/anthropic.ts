import Anthropic from "@anthropic-ai/sdk";
import { HandlerError } from "./auth";

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (client) return client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new HandlerError(500, "missing_api_key", "ANTHROPIC_API_KEY is not configured");
  }
  client = new Anthropic({ apiKey });
  return client;
}

export const MODEL_ID = "claude-opus-4-7";
export const FAST_MODEL_ID = "claude-haiku-4-5-20251001";

export interface DraftOutput {
  subject: string;
  body: string;
}

export async function runDraftModel(params: {
  system: string;
  user: string;
  maxTokens?: number;
  model?: string;
}): Promise<{ output: DraftOutput; rawText: string }> {
  const c = getClient();
  const resp = await c.messages.create({
    model: params.model ?? MODEL_ID,
    max_tokens: params.maxTokens ?? 1200,
    system: params.system,
    messages: [{ role: "user", content: params.user }],
  });
  const text = resp.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
  if (!text) {
    throw new HandlerError(502, "empty_model_response", "Model returned no text");
  }
  return { output: parseSubjectAndBody(text), rawText: text };
}

// We ask the model to emit:
//   Subject: <one line>
//   <blank line>
//   <body paragraphs>
// This is simpler than JSON (which Opus sometimes wraps in fences) and is tolerant.
function parseSubjectAndBody(text: string): DraftOutput {
  const trimmed = text.replace(/^```[a-zA-Z0-9]*\n?|\n?```$/g, "").trim();
  const match = trimmed.match(/^subject\s*:\s*(.+?)\s*\n+([\s\S]+)$/i);
  if (match) {
    return { subject: match[1].trim(), body: match[2].trim() };
  }
  // Fallback: first line = subject, remainder = body. Not ideal, but shows the user something.
  const lines = trimmed.split(/\n+/);
  const subject = (lines[0] ?? "Introduction").trim().slice(0, 200);
  const body = lines.slice(1).join("\n").trim() || trimmed;
  return { subject, body };
}

import Anthropic from "@anthropic-ai/sdk";
import { PDFParse } from "pdf-parse";
import { ExtractReferenceRequestSchema, type ExtractReferenceResponse } from "../_shared";
import { HandlerError, withAuth } from "../auth";
import { MODEL_ID } from "../anthropic";
import { logInfo } from "../logging";

const EST_COST = 0.05;
const MIN_TEXT_CHARS = 40;
const MAX_VISION_PAGES = 4;

type ImageMime = Anthropic.ImageBlockParam["source"]["media_type"];

const ALLOWED_IMAGE: ImageMime[] = ["image/jpeg", "image/png", "image/gif", "image/webp"];

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

export const extractReferenceHandler = withAuth(
  ExtractReferenceRequestSchema,
  async (body): Promise<ExtractReferenceResponse> => {
    if (body.kind === "pdf") {
      const buffer = Buffer.from(body.dataBase64, "base64");
      const fromText = await extractPdfText(buffer);
      if (fromText.length >= MIN_TEXT_CHARS) {
        const clipped = fromText.slice(0, 20_000);
        logInfo("extractReference.pdf.text", { chars: clipped.length });
        return { text: clipped, kind: "pdf" };
      }
      const fromVision = await extractPdfViaVision(buffer);
      if (!fromVision) {
        throw new HandlerError(
          422,
          "no_text_in_pdf",
          "Could not read any text from that PDF. Try screenshotting a page and pasting the image instead.",
        );
      }
      const clipped = fromVision.slice(0, 20_000);
      logInfo("extractReference.pdf.vision", { chars: clipped.length });
      return { text: clipped, kind: "pdf" };
    }

    const text = await extractImageText(body.mimeType, body.dataBase64);
    if (!text) {
      throw new HandlerError(502, "no_text_extracted", "Could not read any text from that image.");
    }
    const clipped = text.slice(0, 20_000);
    logInfo("extractReference.image", { chars: clipped.length });
    return { text: clipped, kind: "image" };
  },
  { rateLimitKey: "extractReference", costDollars: EST_COST },
);

async function extractPdfText(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return (result.text ?? "").trim();
  } catch {
    return "";
  } finally {
    await parser.destroy().catch(() => {});
  }
}

async function extractPdfViaVision(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });
  try {
    const shot = await parser.getScreenshot({
      scale: 1.5,
      first: MAX_VISION_PAGES,
      imageDataUrl: false,
      imageBuffer: true,
    });
    const pages = (shot.pages ?? []).slice(0, MAX_VISION_PAGES);
    if (pages.length === 0) return "";
    const parts: string[] = [];
    for (const page of pages) {
      const data = page.data;
      if (!data) continue;
      const bytes = Buffer.isBuffer(data) ? data : Buffer.from(data as Uint8Array);
      const b64 = bytes.toString("base64");
      const text = await transcribeImageBase64("image/png", b64);
      if (text) parts.push(text);
    }
    return parts.join("\n\n").trim();
  } finally {
    await parser.destroy().catch(() => {});
  }
}

async function extractImageText(mimeType: string, dataBase64: string): Promise<string> {
  const mt = mimeType.toLowerCase();
  if (!ALLOWED_IMAGE.includes(mt as ImageMime)) {
    throw new HandlerError(400, "bad_image_type", `Unsupported image type: ${mimeType}`);
  }
  return transcribeImageBase64(mt as ImageMime, dataBase64);
}

async function transcribeImageBase64(mediaType: ImageMime, dataBase64: string): Promise<string> {
  const resp = await getClient().messages.create({
    model: MODEL_ID,
    max_tokens: 4000,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mediaType, data: dataBase64 },
          },
          {
            type: "text",
            text:
              "Transcribe all readable text in this image verbatim. If the text is rotated or sideways, mentally rotate to read it. Preserve paragraph structure and headings. Output only the transcription — no commentary.",
          },
        ],
      },
    ],
  });
  return resp.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
}

import { z } from "zod";

export const VoiceProfileSchema = z.object({
  tone: z.string().max(2000),
  signatureClose: z.string().max(500),
  firmInfo: z.string().max(2000),
  explicitPrefs: z.string().max(4000),
  updatedAt: z.number(),
});

export const DraftEmailRequestSchema = z.object({
  url: z
    .string()
    .trim()
    .min(4, "URL is required")
    .max(2048, "URL is too long")
    .refine((v) => {
      try {
        const u = new URL(v.startsWith("http") ? v : `https://${v}`);
        return !!u.hostname && u.hostname.includes(".");
      } catch {
        return false;
      }
    }, "Invalid URL"),
  notes: z.string().max(4000).optional(),
  salesforceLog: z.string().max(20000).optional(),
  includeResearchSite: z.boolean().optional(),
  researchSiteExample: z.string().max(20000).optional(),
  includePdfReport: z.boolean().optional(),
  pdfReportExample: z.string().max(20000).optional(),
  effortMinutes: z.number().int().min(1).max(10).optional(),
});

export const RegenerateRequestSchema = z.object({
  draftId: z.string().min(1).max(128),
  feedback: z.string().trim().min(5, "Give at least a sentence of feedback").max(4000),
});

export const CancelDraftRequestSchema = z.object({
  draftId: z.string().min(1).max(128),
});

export const LogEditRequestSchema = z.object({
  draftId: z.string().min(1).max(128),
  action: z.enum(["approved", "edited", "rejected"]),
  finalSubject: z.string().max(500).optional(),
  finalBody: z.string().max(20000).optional(),
});

export const VoiceProfileUpdateRequestSchema = z.object({
  voiceProfile: VoiceProfileSchema,
});

export const ExtractReferenceRequestSchema = z.object({
  kind: z.enum(["image", "pdf"]),
  mimeType: z.string().min(3).max(64),
  dataBase64: z.string().min(16).max(12_000_000),
});

export const BootstrapSubmitRequestSchema = z.object({
  emails: z
    .array(
      z.object({
        subject: z.string().trim().min(1).max(500),
        body: z.string().trim().min(1).max(20000),
        recipient: z.string().max(500).optional(),
      }),
    )
    .max(50),
  voicePrompt: z.string().trim().max(4000),
  signatureClose: z.string().trim().max(500),
  firmInfo: z.string().trim().max(2000),
});

export type DraftEmailRequestInput = z.infer<typeof DraftEmailRequestSchema>;
export type RegenerateRequestInput = z.infer<typeof RegenerateRequestSchema>;
export type CancelDraftRequestInput = z.infer<typeof CancelDraftRequestSchema>;
export type LogEditRequestInput = z.infer<typeof LogEditRequestSchema>;
export type VoiceProfileUpdateRequestInput = z.infer<typeof VoiceProfileUpdateRequestSchema>;
export type BootstrapSubmitRequestInput = z.infer<typeof BootstrapSubmitRequestSchema>;
export type ExtractReferenceRequestInput = z.infer<typeof ExtractReferenceRequestSchema>;

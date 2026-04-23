export type DraftAction = "approved" | "edited" | "rejected";

export type DraftStatus = "queued" | "running" | "done" | "failed" | "cancelled";
export type DraftPhase = "scraping" | "researching" | "generating" | "writing";

export interface VoiceProfile {
  tone: string;
  signatureClose: string;
  firmInfo: string;
  explicitPrefs: string;
  updatedAt: number;
}

export interface BootstrapEmail {
  id: string;
  subject: string;
  body: string;
  recipient?: string;
  submittedAt: number;
}

export interface SourceCitation {
  url: string;
  summary: string;
}

export interface DraftInputs {
  url: string;
  notes?: string;
  salesforceLog?: string;
  includeResearchSite?: boolean;
  researchSiteExample?: string;
  includePdfReport?: boolean;
  pdfReportExample?: string;
  effortMinutes?: number;
}

export interface DraftOutputsFlags {
  email: boolean;
  researchSite: boolean;
  pdfReport: boolean;
}

export interface DraftRecord {
  id: string;
  status: DraftStatus;
  phase?: DraftPhase;
  progress?: number;
  etaMs?: number;
  queuedAt: number;
  startedAt?: number;
  completedAt?: number;
  error?: string;

  inputs: DraftInputs;
  outputs: DraftOutputsFlags;

  companyUrl: string;
  companyName?: string;
  companyDomain?: string;

  generatedAt?: number;
  generatedSubject?: string;
  generatedBody?: string;
  finalSubject?: string;
  finalBody?: string;
  action?: DraftAction;

  notes?: string;
  salesforceContext?: string;
  sourcesConsulted?: SourceCitation[];
  feedbackChain?: string[];

  researchDoc?: ResearchDoc;
  researchPublicId?: string;
  researchSiteUrl?: string;
}

export type BattlegroundStatus = "settled" | "contested" | "falling";

export interface CompanyRef {
  name: string;
  domain?: string;
}

export interface ResearchBattleground {
  title: string;
  status: BattlegroundStatus;
  storyline: string;
  incumbents: CompanyRef[];
  challengers: CompanyRef[];
}

export interface ResearchPersona {
  role: string;
  orgLabel: string;
  estimatedCount: number;
  dayInLife: string;
  pressure: string;
  primaryTools: string[];
}

export type MilestoneKind =
  | "regulation"
  | "funding"
  | "acquisition"
  | "benchmark"
  | "launch"
  | "milestone";

export interface ResearchMilestone {
  date: string;
  title: string;
  kind: MilestoneKind;
}

export interface ResearchNote {
  title: string;
  body: string;
}

export interface ResearchDoc {
  id: string;
  companyName: string;
  companyDomain: string;
  companyUrl: string;
  tagline: string;
  generatedAt: number;
  sourcesConsulted: SourceCitation[];
  whyChat: string;
  companyStrengths: ResearchNote[];
  bottomLine: string;
  battlegrounds: ResearchBattleground[];
  personas: ResearchPersona[];
  milestones: ResearchMilestone[];
  whitespace: ResearchNote[];
  whyNow: ResearchNote[];
}

export interface PublicResearchDoc extends ResearchDoc {
  ownerUid: string;
  sourceDraftId: string;
}

export interface UserDoc {
  email: string;
  displayName?: string;
  createdAt: number;
  bootstrapComplete: boolean;
  voiceProfile: VoiceProfile;
}

export interface DraftEmailRequest {
  url: string;
  notes?: string;
  salesforceLog?: string;
  includeResearchSite?: boolean;
  researchSiteExample?: string;
  includePdfReport?: boolean;
  pdfReportExample?: string;
  effortMinutes?: number;
}

export interface DraftEmailResponse {
  draftId: string;
  status: DraftStatus;
  subject?: string;
  body?: string;
  sourcesConsulted?: SourceCitation[];
  companyName?: string;
  warnings?: string[];
}

export interface RegenerateRequest {
  draftId: string;
  feedback: string;
}

export interface RegenerateResponse {
  draftId: string;
  subject: string;
  body: string;
  sourcesConsulted: SourceCitation[];
  warnings?: string[];
}

export interface CancelDraftRequest {
  draftId: string;
}

export interface CancelDraftResponse {
  ok: true;
  status: DraftStatus;
}

export interface LogEditRequest {
  draftId: string;
  action: DraftAction;
  finalSubject?: string;
  finalBody?: string;
}

export interface LogEditResponse {
  ok: true;
  voiceProfileUpdated: boolean;
}

export interface VoiceProfileUpdateRequest {
  voiceProfile: VoiceProfile;
}

export interface VoiceProfileResponse {
  voiceProfile: VoiceProfile;
  bootstrapComplete: boolean;
}

export interface ExtractReferenceRequest {
  kind: "image" | "pdf";
  mimeType: string;
  dataBase64: string;
}

export interface ExtractReferenceResponse {
  text: string;
  kind: "image" | "pdf";
}

export interface BootstrapSubmitRequest {
  emails: Array<{ subject: string; body: string; recipient?: string }>;
  voicePrompt: string;
  signatureClose: string;
  firmInfo: string;
}

export interface BootstrapSubmitResponse {
  ok: true;
  count: number;
}

export interface ApiError {
  error: string;
  code?: string;
  warnings?: string[];
}

export const DEFAULT_VOICE_PROFILE: VoiceProfile = {
  tone: "",
  signatureClose: "Best,\nAsher",
  firmInfo:
    "Insight Partners — a growth-stage software investor. We back teams we believe in at the inflection point.",
  explicitPrefs: "",
  updatedAt: 0,
};

export const MAX_ACTIVE_RUNS_PER_USER = 5;

export const DEFAULT_EMAIL_ETA_MS = 30_000;

"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { doc, onSnapshot } from "firebase/firestore";
import { AuthGate } from "@/components/AuthGate";
import { Spinner } from "@/components/Spinner";
import { useToast } from "@/components/Toast";
import { DownloadPdfButton } from "@/components/research/DownloadPdfButton";
import { useAuth } from "@/lib/auth-context";
import { getFirebaseDb } from "@/lib/firebase";
import { api, ApiClientError } from "@/lib/api";
import type { DraftRecord } from "@talaria/shared";
import clsx from "clsx";
import {
  BlinkCaret,
  Chip,
  FooterRail,
  Heading,
  PrimaryButton,
  Row,
  SectionMark,
  SectionRule,
  TerminalChrome,
  TerminalShell,
} from "@/components/notebook";

export default function DraftPage() {
  return (
    <AuthGate>
      <DraftInner />
    </AuthGate>
  );
}

function DraftInner() {
  const toast = useToast();
  const { state } = useAuth();
  const uid = state.status === "signed-in" ? state.user.uid : null;

  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [salesforceLog, setSalesforceLog] = useState("");
  const [showSalesforce, setShowSalesforce] = useState(false);

  const [includeResearchSite, setIncludeResearchSite] = useState(false);
  const [researchSiteExample, setResearchSiteExample] = useState("");
  const [includePdfReport, setIncludePdfReport] = useState(false);
  const [pdfReportExample, setPdfReportExample] = useState("");
  const [effortMinutes, setEffortMinutes] = useState<number>(1);

  const [queueing, setQueueing] = useState(false);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [activeDraft, setActiveDraft] = useState<DraftRecord | null>(null);

  useEffect(() => {
    if (!uid || !activeDraftId) return;
    const db = getFirebaseDb();
    const unsub = onSnapshot(
      doc(db, `users/${uid}/drafts/${activeDraftId}`),
      (snap) => {
        if (snap.exists()) setActiveDraft(snap.data() as DraftRecord);
      },
    );
    return () => unsub();
  }, [uid, activeDraftId]);

  async function handleDraft() {
    if (!url.trim()) return;
    setQueueing(true);
    setActiveDraft(null);
    setActiveDraftId(null);
    try {
      const res = await api.draftEmail({
        url: url.trim(),
        notes: notes.trim() || undefined,
        salesforceLog: salesforceLog.trim() || undefined,
        includeResearchSite,
        researchSiteExample:
          includeResearchSite && researchSiteExample.trim()
            ? researchSiteExample.trim()
            : undefined,
        includePdfReport,
        pdfReportExample:
          includePdfReport && pdfReportExample.trim() ? pdfReportExample.trim() : undefined,
        effortMinutes,
      });
      setActiveDraftId(res.draftId);
      toast.show("success", "Queued. Watch it render →");
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : "Could not queue";
      toast.show("error", message);
    } finally {
      setQueueing(false);
    }
  }

  function resetForNext() {
    setActiveDraftId(null);
    setActiveDraft(null);
    setUrl("");
    setNotes("");
    setSalesforceLog("");
  }

  const host = url.trim()
    ? url.trim().replace(/^https?:\/\//, "").replace(/\/$/, "")
    : activeDraft?.companyDomain || activeDraft?.companyName || "—";

  return (
    <div className="-mx-6 -my-10">
      <SectionRule />
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-0 px-6 lg:grid-cols-[minmax(0,460px)_minmax(0,1fr)]">
        <LeftLedger
          url={url} setUrl={setUrl}
          notes={notes} setNotes={setNotes}
          effortMinutes={effortMinutes} setEffortMinutes={setEffortMinutes}
          includeResearchSite={includeResearchSite} setIncludeResearchSite={setIncludeResearchSite}
          researchSiteExample={researchSiteExample} setResearchSiteExample={setResearchSiteExample}
          includePdfReport={includePdfReport} setIncludePdfReport={setIncludePdfReport}
          pdfReportExample={pdfReportExample} setPdfReportExample={setPdfReportExample}
          showSalesforce={showSalesforce} setShowSalesforce={setShowSalesforce}
          salesforceLog={salesforceLog} setSalesforceLog={setSalesforceLog}
          queueing={queueing}
          handleDraft={handleDraft}
        />
        <RightPane
          host={host}
          activeId={activeDraftId}
          draft={activeDraft}
          queueing={queueing}
          onReset={resetForNext}
        />
      </div>
      <SectionRule />
      <FooterRail status={footerStatus(queueing, activeDraft)} />
    </div>
  );
}

function footerStatus(queueing: boolean, draft: DraftRecord | null): string {
  if (queueing) return "Queueing";
  if (!draft) return "Idle";
  if (draft.status === "queued") return "Queued";
  if (draft.status === "running") return `Running · ${draft.phase ?? ""}`.trim();
  if (draft.status === "failed") return "Failed";
  return "Ready";
}

/* --------------------------- Left ledger --------------------------- */

function LeftLedger(p: {
  url: string; setUrl: (v: string) => void;
  notes: string; setNotes: (v: string) => void;
  effortMinutes: number; setEffortMinutes: (v: number) => void;
  includeResearchSite: boolean; setIncludeResearchSite: (v: boolean) => void;
  researchSiteExample: string; setResearchSiteExample: (v: string) => void;
  includePdfReport: boolean; setIncludePdfReport: (v: boolean) => void;
  pdfReportExample: string; setPdfReportExample: (v: string) => void;
  showSalesforce: boolean; setShowSalesforce: (v: boolean) => void;
  salesforceLog: string; setSalesforceLog: (v: string) => void;
  queueing: boolean;
  handleDraft: () => void;
}) {
  return (
    <aside className="lg:border-r lg:border-ink-200 lg:pr-8 lg:py-10 py-6">
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <SectionMark>§ 01 — Brief</SectionMark>
            <Heading>Break through the noise.</Heading>
            <p className="mt-3 max-w-[38ch] text-sm leading-relaxed text-ink-600">
              One URL. Talaria reads the site, cross-references your voice, and queues the email.
            </p>
          </div>
          <Link
            href="/runs"
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-500 hover:text-accent-400"
          >
            Queue →
          </Link>
        </div>

        <div className="border-t border-ink-200">
          <Row n="01" label="URL">
            <input
              className="w-full bg-transparent font-mono text-sm text-ink-900 placeholder:text-ink-500 focus:outline-none"
              placeholder="acme-robotics.com"
              value={p.url}
              onChange={(e) => p.setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  p.handleDraft();
                }
              }}
              disabled={p.queueing}
              autoFocus
            />
          </Row>
          <Row n="02" label="Notes">
            <textarea
              className="w-full resize-none bg-transparent text-sm leading-relaxed text-ink-900 placeholder:text-ink-500 focus:outline-none"
              placeholder="Why now? Any angle, person, context."
              rows={3}
              value={p.notes}
              onChange={(e) => p.setNotes(e.target.value)}
              disabled={p.queueing}
            />
          </Row>
          <Row n="03" label="Depth">
            <DepthStepper
              value={p.effortMinutes}
              onChange={p.setEffortMinutes}
              disabled={p.queueing}
            />
          </Row>
          <Row n="04" label="Outputs">
            <div className="flex flex-wrap gap-2">
              <Chip active disabled>Email</Chip>
              <Chip
                active={p.includeResearchSite}
                onClick={() => !p.queueing && p.setIncludeResearchSite(!p.includeResearchSite)}
                disabled={p.queueing}
              >
                + Site
              </Chip>
              <Chip
                active={p.includePdfReport}
                onClick={() => !p.queueing && p.setIncludePdfReport(!p.includePdfReport)}
                disabled={p.queueing}
              >
                + PDF
              </Chip>
            </div>
            {(p.includeResearchSite || p.includePdfReport) && (
              <div className="mt-3 space-y-3">
                {p.includeResearchSite && (
                  <QualityExample
                    id="site-example"
                    hint="(site) paste/drop a reference section."
                    value={p.researchSiteExample}
                    onChange={p.setResearchSiteExample}
                    disabled={p.queueing}
                  />
                )}
                {p.includePdfReport && (
                  <QualityExample
                    id="pdf-example"
                    hint="(pdf) paste/drop reference content."
                    value={p.pdfReportExample}
                    onChange={p.setPdfReportExample}
                    disabled={p.queueing}
                  />
                )}
              </div>
            )}
          </Row>
          <Row
            n="05"
            label="Log"
            collapsible
            expanded={p.showSalesforce}
            onToggle={() => p.setShowSalesforce(!p.showSalesforce)}
          >
            {p.showSalesforce ? (
              <textarea
                className="w-full resize-none bg-transparent font-mono text-xs text-ink-700 placeholder:text-ink-500 focus:outline-none"
                placeholder="Paste Salesforce activity block…"
                rows={3}
                value={p.salesforceLog}
                onChange={(e) => p.setSalesforceLog(e.target.value)}
                disabled={p.queueing}
              />
            ) : (
              <span className="text-xs text-ink-500">Optional · Salesforce activity</span>
            )}
          </Row>
        </div>

        <div className="pt-3">
          <PrimaryButton
            onClick={p.handleDraft}
            disabled={!p.url.trim() || p.queueing}
            trailing={p.queueing ? null : "⏎"}
          >
            {p.queueing ? (
              <>
                <Spinner size={12} />
                <span className="text-ink-700">Queueing…</span>
              </>
            ) : (
              <>
                <span>Compile · Queue</span>
                <span className="text-ink-600">·</span>
                <span className="text-ink-600">
                  {outputsLabel(p.includeResearchSite, p.includePdfReport)}
                </span>
              </>
            )}
          </PrimaryButton>
        </div>
      </div>
    </aside>
  );
}

function outputsLabel(site: boolean, pdf: boolean) {
  const extras: string[] = [];
  if (site) extras.push("site");
  if (pdf) extras.push("pdf");
  return extras.length === 0 ? "email" : `email + ${extras.join(" + ")}`;
}

/* --------------------------- Depth stepper --------------------------- */

function effortDescriptor(m: number): { label: string; detail: string } {
  if (m <= 2) return { label: "Quick", detail: "Homepage + one or two linked pages." };
  if (m <= 5) return { label: "Standard", detail: "Site crawl + recent press + one angle pass." };
  if (m <= 8) return { label: "Thorough", detail: "Deeper crawl, filings, news, multi-step reasoning." };
  return { label: "Exhaustive", detail: "Full dossier — people, product, competitors, signals." };
}

function DepthStepper({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  const { label, detail } = effortDescriptor(value);
  const pct = ((value - 1) / 9) * 100;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-ink-900">~{value} min</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-400">
          {label}
        </span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        step={1}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        disabled={disabled}
        className="effort-range w-full"
        style={{ ["--pct" as string]: `${pct}%` }}
        aria-label={`Effort: ${value} minutes (${label})`}
      />
      <p className="text-[11px] leading-relaxed text-ink-600">{detail}</p>
    </div>
  );
}

/* --------------------------- Quality example --------------------------- */

function QualityExample({
  id,
  hint,
  value,
  onChange,
  disabled,
}: {
  id: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const [dragging, setDragging] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [extractSource, setExtractSource] = useState<string | null>(null);
  const toast = useToast();

  const extract = useCallback(
    async (file: File) => {
      if (!file) return;
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      const isImage = file.type.startsWith("image/");
      if (!isPdf && !isImage) {
        setExtractError("Only images or PDFs are supported.");
        return;
      }
      if (file.size > 9_000_000) {
        setExtractError("File is too large (max ~9 MB).");
        return;
      }
      setExtracting(true);
      setExtractError(null);
      setExtractSource(file.name);
      try {
        const dataBase64 = await fileToBase64(file);
        const mimeType = isPdf ? "application/pdf" : file.type || "image/png";
        const res = await api.extractReference({
          kind: isPdf ? "pdf" : "image",
          mimeType,
          dataBase64,
        });
        const existing = value.trim();
        const merged = existing ? `${existing}\n\n${res.text}` : res.text;
        onChange(merged);
        toast.show("success", `Pulled text from ${file.name}.`);
      } catch (err) {
        const msg = err instanceof ApiClientError ? err.message : "Could not read that file.";
        setExtractError(msg);
      } finally {
        setExtracting(false);
      }
    },
    [onChange, toast, value],
  );

  return (
    <div
      className={clsx(
        "border-l-2 pl-3 transition-colors",
        dragging ? "border-accent-400 bg-accent-400/5" : "border-accent-300/40",
      )}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={async (e) => {
        e.preventDefault();
        setDragging(false);
        if (disabled) return;
        const file = e.dataTransfer.files?.[0];
        if (file) await extract(file);
      }}
    >
      <textarea
        id={id}
        className={clsx(
          "w-full resize-none bg-transparent text-xs leading-relaxed text-ink-700 placeholder:text-ink-500 focus:outline-none",
          extracting && "cursor-wait opacity-70",
        )}
        placeholder={hint}
        rows={2}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPaste={async (e) => {
          if (disabled) return;
          const items = Array.from(e.clipboardData?.items ?? []);
          const fileItem = items.find(
            (it) => it.kind === "file" && (it.type.startsWith("image/") || it.type === "application/pdf"),
          );
          if (!fileItem) return;
          const file = fileItem.getAsFile();
          if (!file) return;
          e.preventDefault();
          await extract(file);
        }}
        disabled={disabled || extracting}
      />
      <div className="mt-1 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.18em] text-ink-500">
        <label className={clsx("cursor-pointer hover:text-accent-400", disabled && "cursor-not-allowed opacity-60")}>
          <input
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            disabled={disabled || extracting}
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f) await extract(f);
              e.target.value = "";
            }}
          />
          + image/pdf
        </label>
        {extracting && (
          <span className="flex items-center gap-1.5 text-ink-600 normal-case tracking-normal">
            <Spinner size={10} /> Reading {extractSource}…
          </span>
        )}
        {extractError && <span className="text-danger-400 normal-case tracking-normal">{extractError}</span>}
      </div>
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error ?? new Error("read failed"));
    reader.readAsDataURL(file);
  });
}

/* --------------------------- Right pane --------------------------- */

function RightPane({
  host,
  activeId,
  draft,
  queueing,
  onReset,
}: {
  host: string;
  activeId: string | null;
  draft: DraftRecord | null;
  queueing: boolean;
  onReset: () => void;
}) {
  return (
    <section className="lg:pl-8 lg:py-10 py-6 lg:sticky lg:top-20 lg:self-start">
      <TerminalShell>
        <TerminalChrome
          host={`COMPILE · ${host}`}
          status={chromeStatus(queueing, activeId, draft)}
          badge={chromeBadge(draft)}
        />
        <Body activeId={activeId} draft={draft} queueing={queueing} onReset={onReset} />
      </TerminalShell>
    </section>
  );
}

function chromeStatus(queueing: boolean, activeId: string | null, draft: DraftRecord | null): string {
  if (queueing) return "queueing…";
  if (!activeId) return "awaiting submission";
  if (!draft) return "connecting…";
  if (draft.status === "queued") return "queued";
  if (draft.status === "running") return draft.phase ?? "running";
  if (draft.status === "failed") return "failed";
  return "ready";
}

function chromeBadge(draft: DraftRecord | null): { label: string; tone: "ok" | "err" | "warn" } | undefined {
  if (!draft) return undefined;
  if (draft.status === "failed") return { label: "FAILED", tone: "err" };
  if (draft.status === "running" || draft.status === "queued") return { label: "LIVE", tone: "warn" };
  return { label: "GROUNDED", tone: "ok" };
}

function Body({
  activeId,
  draft,
  queueing,
  onReset,
}: {
  activeId: string | null;
  draft: DraftRecord | null;
  queueing: boolean;
  onReset: () => void;
}) {
  if (!activeId && !queueing) return <IdleBody />;
  if (!draft) return <ConnectingBody />;
  if (draft.status === "queued" || draft.status === "running") return <WorkingBody draft={draft} />;
  if (draft.status === "failed") return <FailedBody draft={draft} onReset={onReset} />;
  return <DoneBody draft={draft} onReset={onReset} />;
}

function IdleBody() {
  return (
    <div className="flex min-h-[520px] flex-col items-center justify-center px-10 py-16 text-center">
      <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-500">§ Output</div>
      <h3 className="mt-4 font-display text-2xl font-medium tracking-tight text-ink-800">
        Your next email here.
      </h3>
      <p className="mt-3 max-w-[44ch] text-sm text-ink-600">
        Submit the brief on the left. Talaria reads the site, cross-references your voice, and renders
        the email here with sources.
      </p>
      <div className="mt-8 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-500">
        awaiting · url
        <BlinkCaret />
      </div>
    </div>
  );
}

function ConnectingBody() {
  return (
    <div className="flex min-h-[520px] flex-col items-center justify-center gap-3 text-sm text-ink-600">
      <Spinner size={14} /> connecting to run…
    </div>
  );
}

const PHASES = [
  { key: "scraping", n: "→ 01", label: "Fetch site" },
  { key: "researching", n: "→ 02", label: "Research" },
  { key: "generating", n: "→ 03", label: "Cross-ref voice" },
  { key: "writing", n: "→ 04", label: "Compile + cite" },
] as const;

function phaseOrder(p: string | undefined): number {
  const idx = PHASES.findIndex((x) => x.key === p);
  return idx < 0 ? -1 : idx;
}
function matchesPhase(draft: DraftRecord, key: (typeof PHASES)[number]["key"]): boolean {
  return draft.status === "running" && draft.phase === key;
}
function pastPhase(draft: DraftRecord, key: (typeof PHASES)[number]["key"]): boolean {
  if (draft.status === "done") return true;
  return phaseOrder(draft.phase) > phaseOrder(key);
}

function WorkingBody({ draft }: { draft: DraftRecord }) {
  const progress = typeof draft.progress === "number" ? draft.progress : 0;
  const phaseLabel =
    draft.status === "queued"
      ? "queued"
      : draft.phase === "scraping"
      ? "reading the site"
      : draft.phase === "researching"
      ? "researching"
      : draft.phase === "generating"
      ? "compiling"
      : draft.phase === "writing"
      ? "writing"
      : "running";
  const pct = Math.max(0, Math.min(1, progress)) * 100;

  return (
    <div className="min-h-[520px] px-6 py-8">
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-500">
        § Working · {draft.companyName || draft.companyDomain || draft.companyUrl}
      </div>
      <div className="mt-6 h-1 w-full overflow-hidden bg-ink-200">
        <div className="h-full bg-accent-400 transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-3 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.18em]">
        <span className="text-accent-400">{phaseLabel}</span>
        <span className="text-ink-500">{Math.round(pct)}%</span>
      </div>

      <div className="mt-8 grid grid-cols-4 gap-0 border border-ink-200">
        {PHASES.map((phase, i) => {
          const active = matchesPhase(draft, phase.key);
          const done = pastPhase(draft, phase.key);
          return (
            <div
              key={phase.key}
              className={clsx("px-3 py-3", i < PHASES.length - 1 && "border-r border-ink-200")}
            >
              <div className={clsx(
                "font-mono text-[10px] uppercase tracking-[0.22em]",
                done ? "text-accent-400" : active ? "text-ink-900" : "text-ink-500",
              )}>
                {phase.n}
              </div>
              <div className={clsx(
                "mt-1 text-xs",
                done ? "text-ink-700" : active ? "text-ink-900" : "text-ink-500",
              )}>
                {phase.label}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-xs text-ink-600">
        Fire-and-forget. You can leave this page — it'll keep running in the queue.
      </p>
    </div>
  );
}

function FailedBody({ draft, onReset }: { draft: DraftRecord; onReset: () => void }) {
  return (
    <div className="min-h-[520px] px-6 py-8">
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-danger-400">
        § Failed · {draft.companyName || draft.companyUrl}
      </div>
      <p className="mt-4 text-sm text-danger-400">{draft.error ?? "Unknown error"}</p>
      <div className="mt-6 flex gap-3">
        <button onClick={onReset} className="btn-secondary text-xs">
          Try another
        </button>
        <Link href={`/runs/?id=${encodeURIComponent(draft.id)}`} className="btn-ghost text-xs">
          Open in queue →
        </Link>
      </div>
    </div>
  );
}

function DoneBody({ draft, onReset }: { draft: DraftRecord; onReset: () => void }) {
  const subject = draft.finalSubject ?? draft.generatedSubject ?? "";
  const body = draft.finalBody ?? draft.generatedBody ?? "";
  const elapsed =
    draft.completedAt && draft.startedAt
      ? Math.max(1, Math.round((draft.completedAt - draft.startedAt) / 1000))
      : null;

  return (
    <div>
      <div className="flex items-center justify-between px-5 py-3">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-500">
          § Email · {draft.companyName || draft.companyDomain}
          {elapsed && <span className="ml-2 text-ink-700 normal-case tracking-normal">{elapsed}s</span>}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-500 hover:text-ink-800"
          >
            ← new
          </button>
          <Link
            href={`/runs/?id=${encodeURIComponent(draft.id)}`}
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent-400 hover:text-accent-300"
          >
            review & send →
          </Link>
        </div>
      </div>

      <div className="h-px bg-ink-200" />

      <div className="px-5 py-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-500">Subject</div>
        <div className="mt-2 text-[17px] font-medium tracking-[-0.015em] text-ink-900">{subject}</div>

        <div className="mt-5 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-500">Body</div>
        <pre className="mt-2 whitespace-pre-wrap font-sans text-[15px] leading-[1.7] text-ink-800">
          {body}
        </pre>
      </div>

      {(draft.researchSiteUrl || draft.researchDoc) && (
        <>
          <div className="h-px bg-ink-200" />
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-500">
                § Research brief
              </div>
              <p className="mt-1 text-xs text-ink-600">
                {draft.researchSiteUrl ? "Share the site, attach the PDF." : "PDF is yours to attach."}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {draft.researchSiteUrl && (
                <a
                  href={draft.researchSiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent-400 hover:text-accent-300"
                >
                  open site ↗
                </a>
              )}
              {draft.researchDoc && <DownloadPdfButton doc={draft.researchDoc} />}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

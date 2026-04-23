"use client";

import { Suspense, useEffect, useMemo, useState, type MouseEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthGate } from "@/components/AuthGate";
import { Spinner } from "@/components/Spinner";
import { useToast } from "@/components/Toast";
import { DownloadPdfButton } from "@/components/research/DownloadPdfButton";
import { CompanyLogo, domainFromUrl } from "@/components/CompanyLogo";
import { useAuth } from "@/lib/auth-context";
import { getFirebaseDb } from "@/lib/firebase";
import { api, ApiClientError } from "@/lib/api";
import { collection, doc, onSnapshot, orderBy, query } from "firebase/firestore";
import type { DraftAction, DraftRecord } from "@talaria/shared";
import clsx from "clsx";
import {
  SectionRule,
  SectionMark,
  Heading,
  Row,
  Chip,
  PrimaryButton,
  TerminalChrome,
  TerminalShell,
  FooterRail,
  BlinkCaret,
} from "@/components/notebook";

export default function RunsPage() {
  return (
    <AuthGate>
      <Suspense fallback={<Spinner size={18} />}>
        <RunsInner />
      </Suspense>
    </AuthGate>
  );
}

function RunsInner() {
  const search = useSearchParams();
  const id = search.get("id");
  if (id) return <RunDetail id={id} />;
  return <RunsList />;
}

function useRuns(uid: string | null) {
  const [runs, setRuns] = useState<DraftRecord[] | null>(null);
  useEffect(() => {
    if (!uid) return;
    const db = getFirebaseDb();
    const q = query(
      collection(db, `users/${uid}/drafts`),
      orderBy("queuedAt", "desc"),
    );
    const unsub = onSnapshot(
      q,
      (snap) => setRuns(snap.docs.map((d) => d.data() as DraftRecord)),
      () => setRuns([]),
    );
    return () => unsub();
  }, [uid]);
  return runs;
}

function RunsList() {
  const { state } = useAuth();
  const uid = state.status === "signed-in" ? state.user.uid : null;
  const runs = useRuns(uid);

  const grouped = useMemo(() => {
    const active: DraftRecord[] = [];
    const finished: DraftRecord[] = [];
    for (const r of runs ?? []) {
      if (r.status === "queued" || r.status === "running") active.push(r);
      else finished.push(r);
    }
    return { active, finished };
  }, [runs]);

  const activeCount = grouped.active.length;
  const doneCount = grouped.finished.filter((r) => r.status === "done").length;
  const failedCount = grouped.finished.filter((r) => r.status === "failed").length;
  const statusLine =
    activeCount > 0
      ? `${activeCount} in flight`
      : runs && runs.length > 0
      ? `${doneCount} done · ${failedCount} failed`
      : "idle";

  return (
    <div className="-mx-6 -my-10 animate-fadeIn">
      <SectionRule />
      <div className="mx-auto max-w-[1280px] px-6 pt-10 pb-16">
        <div className="flex items-start justify-between">
          <div>
            <SectionMark>§ 02 — Queue</SectionMark>
            <Heading>All runs.</Heading>
            <p className="mt-3 max-w-[52ch] text-sm leading-relaxed text-ink-600">
              Fire and forget. Come back when they&rsquo;re done.
            </p>
          </div>
          <Link href="/draft">
            <div className="w-[220px]">
              <PrimaryButton trailing="+">Break through the noise</PrimaryButton>
            </div>
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-3 border-y border-ink-200">
          <StatCell n={activeCount} label="active" tone="accent" />
          <StatCell n={doneCount} label="done" tone="muted" />
          <StatCell n={failedCount} label="failed" tone={failedCount > 0 ? "danger" : "muted"} />
        </div>

        {runs === null && (
          <div className="mt-8 flex items-center gap-3 border border-ink-200 bg-ink-50 px-5 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500" style={{ borderRadius: 2 }}>
            <Spinner size={12} /> loading
          </div>
        )}

        {runs?.length === 0 && (
          <EmptyQueue />
        )}

        {grouped.active.length > 0 && (
          <div className="mt-10">
            <SectionMark>§ In flight · {grouped.active.length}</SectionMark>
            <div className="mt-3 border-t border-ink-200">
              {grouped.active.map((r, i) => (
                <RunRow key={r.id} run={r} n={rowNum(i)} />
              ))}
            </div>
          </div>
        )}

        {grouped.finished.length > 0 && (
          <div className="mt-10">
            <SectionMark>§ History · {grouped.finished.length}</SectionMark>
            <div className="mt-3 border-t border-ink-200">
              {grouped.finished.map((r, i) => (
                <RunRow key={r.id} run={r} n={rowNum(i)} />
              ))}
            </div>
          </div>
        )}
      </div>
      <SectionRule />
      <FooterRail status={statusLine} />
    </div>
  );
}

function rowNum(i: number) {
  return String(i + 1).padStart(2, "0");
}

function StatCell({
  n,
  label,
  tone,
}: {
  n: number;
  label: string;
  tone: "accent" | "muted" | "danger";
}) {
  const cls =
    tone === "accent" ? "text-accent-400" : tone === "danger" ? "text-danger-400" : "text-ink-800";
  return (
    <div className="flex flex-col gap-1 border-r border-ink-200 px-5 py-4 last:border-r-0">
      <span className={clsx("font-display text-[28px] font-medium leading-none tracking-[-0.02em]", cls)}>
        {n.toString().padStart(2, "0")}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-500">
        {label}
      </span>
    </div>
  );
}

function EmptyQueue() {
  return (
    <div className="mt-10 border border-ink-200 bg-ink-50" style={{ borderRadius: 2 }}>
      <div className="flex flex-col items-center justify-center gap-3 px-8 py-16 text-center">
        <SectionMark>§ Empty</SectionMark>
        <h3 className="mt-2 font-display text-[24px] font-medium tracking-[-0.02em] text-ink-800">
          Nothing in flight.
        </h3>
        <p className="max-w-[44ch] text-sm text-ink-600">
          Kick one off to break through the noise. It&rsquo;ll appear here and run in the background.
        </p>
        <div className="mt-5 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-500">
          awaiting · url
          <BlinkCaret />
        </div>
        <Link href="/draft" className="mt-6">
          <div className="w-[200px]">
            <PrimaryButton>Compile the first one</PrimaryButton>
          </div>
        </Link>
      </div>
    </div>
  );
}

function RunRow({ run, n }: { run: DraftRecord; n: string }) {
  const href = `/runs/?id=${encodeURIComponent(run.id)}`;
  const label = run.companyName || run.companyDomain || run.companyUrl || run.inputs?.url || "—";
  const domain = run.companyDomain ?? domainFromUrl(run.companyUrl ?? run.inputs?.url);
  const now = useNow(run.status === "running" ? 500 : 0);
  const elapsedMs = run.startedAt ? Math.max(0, now - run.startedAt) : 0;
  const progress = typeof run.progress === "number" ? run.progress : run.status === "done" ? 1 : 0;
  const isActive = run.status === "queued" || run.status === "running";
  const isFailed = run.status === "failed";
  const toast = useToast();
  const [cancelling, setCancelling] = useState(false);

  async function handleStop(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (cancelling) return;
    setCancelling(true);
    try {
      await api.cancelDraft({ draftId: run.id });
      toast.show("info", "Stopped.");
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : "Couldn't stop that run";
      toast.show("error", message);
    } finally {
      setCancelling(false);
    }
  }

  return (
    <Link
      href={href}
      className={clsx(
        "block border-b border-ink-200 py-3 transition-colors hover:bg-ink-50/60",
      )}
    >
      <div className="grid grid-cols-[28px,1fr,auto] items-baseline gap-4 px-1">
        <span className="font-mono text-[10px] tracking-[0.18em] text-accent-400">{n}</span>
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <CompanyLogo domain={domain} name={run.companyName} size={20} />
            <span className="truncate font-display text-[15px] font-medium tracking-[-0.01em] text-ink-900">
              {label}
            </span>
            <StatusTag status={run.status} />
            {run.status === "queued" && (
              <button
                type="button"
                onClick={handleStop}
                disabled={cancelling}
                className="border border-danger-400/50 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.22em] text-danger-400 transition-colors hover:bg-danger-500/5 disabled:cursor-not-allowed disabled:opacity-40"
                style={{ borderRadius: 2 }}
                aria-label="Stop queued run"
              >
                {cancelling ? "…" : "× stop"}
              </button>
            )}
          </div>
          <div className="mt-1 grid grid-cols-[80px,1fr] gap-3">
            <span />
            <span className="truncate font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
              {domain ?? run.inputs?.url}
            </span>
          </div>
          {run.generatedSubject && !isActive && (
            <div className="mt-1 grid grid-cols-[80px,1fr] gap-3">
              <span />
              <span className="truncate text-xs text-ink-700">{run.generatedSubject}</span>
            </div>
          )}
          {run.error && isFailed && (
            <div className="mt-1 grid grid-cols-[80px,1fr] gap-3">
              <span />
              <span className="truncate text-xs text-danger-400">{run.error}</span>
            </div>
          )}
          {isActive && (
            <div className="mt-2 grid grid-cols-[80px,1fr] items-center gap-3">
              <span />
              <div className="flex items-center gap-3">
                <div className="h-[3px] w-full max-w-[260px] bg-ink-200">
                  <div
                    className="h-full bg-accent-400 transition-all duration-300"
                    style={{ width: `${Math.max(4, Math.min(100, progress * 100))}%` }}
                  />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-400">
                  {run.status === "queued" ? "queued" : run.phase ?? "running"}
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="shrink-0 text-right">
          <TimingText run={run} elapsedMs={elapsedMs} />
          {run.action && run.status === "done" && (
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
              {run.action}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

function RunDetail({ id }: { id: string }) {
  const { state } = useAuth();
  const uid = state.status === "signed-in" ? state.user.uid : null;
  const router = useRouter();
  const toast = useToast();

  const [run, setRun] = useState<DraftRecord | null | undefined>(undefined);
  useEffect(() => {
    if (!uid) return;
    const db = getFirebaseDb();
    const unsub = onSnapshot(
      doc(db, `users/${uid}/drafts/${id}`),
      (snap) => {
        if (!snap.exists()) {
          setRun(null);
          return;
        }
        setRun(snap.data() as DraftRecord);
      },
      () => setRun(null),
    );
    return () => unsub();
  }, [uid, id]);

  const [editedSubject, setEditedSubject] = useState("");
  const [editedBody, setEditedBody] = useState("");
  const [feedback, setFeedback] = useState("");
  const [acting, setActing] = useState<"approve" | "reject" | "regenerate" | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!run || hydrated) return;
    if (run.status === "done") {
      setEditedSubject(run.generatedSubject ?? "");
      setEditedBody(run.generatedBody ?? "");
      setHydrated(true);
    }
  }, [run, hydrated]);

  async function handleRegenerate() {
    if (!run || feedback.trim().length < 5) {
      toast.show("info", "Give a sentence of feedback — what to change.");
      return;
    }
    setActing("regenerate");
    try {
      const res = await api.regenerateWithFeedback({
        draftId: run.id,
        feedback: feedback.trim(),
      });
      setEditedSubject(res.subject);
      setEditedBody(res.body);
      setFeedback("");
      toast.show("success", "Reworked.");
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : "Regenerate failed";
      toast.show("error", message);
    } finally {
      setActing(null);
    }
  }

  async function handleAction(action: DraftAction) {
    if (!run) return;
    setActing(action === "approved" ? "approve" : "reject");
    try {
      const origSubject = run.generatedSubject ?? "";
      const origBody = run.generatedBody ?? "";
      const edited = editedSubject !== origSubject || editedBody !== origBody;
      const effectiveAction: DraftAction = action === "approved" && edited ? "edited" : action;
      await api.logEdit({
        draftId: run.id,
        action: effectiveAction,
        finalSubject: edited ? editedSubject : undefined,
        finalBody: edited ? editedBody : undefined,
      });
      if (action === "approved") {
        const plain = `Subject: ${editedSubject}\n\n${editedBody}`;
        try {
          await navigator.clipboard.writeText(plain);
          toast.show("success", "Approved and copied to clipboard.");
        } catch {
          toast.show("success", "Approved. Copy it manually.");
        }
      } else {
        toast.show("info", "Rejected. The model will try harder next time.");
      }
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : "Action failed";
      toast.show("error", message);
    } finally {
      setActing(null);
    }
  }

  if (run === undefined) {
    return (
      <div className="-mx-6 -my-10">
        <SectionRule />
        <div className="mx-auto max-w-[1280px] px-6 py-16">
          <div className="flex items-center gap-3 border border-ink-200 bg-ink-50 px-5 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500" style={{ borderRadius: 2 }}>
            <Spinner size={12} /> loading
          </div>
        </div>
        <SectionRule />
      </div>
    );
  }
  if (run === null) {
    return (
      <div className="-mx-6 -my-10">
        <SectionRule />
        <div className="mx-auto max-w-[1280px] px-6 py-16 text-center">
          <SectionMark>§ Not found</SectionMark>
          <p className="mt-4 text-sm text-ink-600">No run under this id.</p>
          <Link href="/runs" className="mt-6 inline-block">
            <div className="w-[200px]">
              <PrimaryButton trailing="←">Back to queue</PrimaryButton>
            </div>
          </Link>
        </div>
        <SectionRule />
      </div>
    );
  }

  const domain = run.companyDomain ?? domainFromUrl(run.companyUrl ?? run.inputs?.url);
  const host = domain ? `talaria.run / ${domain}` : "talaria.run / compile";
  const badge = deriveBadge(run);
  const statusLine =
    run.status === "done"
      ? "ready for review"
      : run.status === "failed"
      ? "failed"
      : run.status === "running"
      ? run.phase ?? "running"
      : "queued";

  return (
    <div className="-mx-6 -my-10 animate-fadeIn">
      <SectionRule />
      <div className="mx-auto max-w-[1280px] px-6 pt-10 pb-16">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <SectionMark>§ Run · {run.id.slice(0, 8)}</SectionMark>
            <Heading>{run.companyName || domain || "Untitled run"}</Heading>
            <p className="mt-3 max-w-[52ch] font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
              {run.companyUrl ?? run.inputs?.url ?? "—"}
            </p>
          </div>
          <button
            onClick={() => router.push("/runs")}
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-600 hover:text-ink-900"
          >
            ← queue
          </button>
        </div>

        <div className="mt-8">
          <TerminalShell>
            <TerminalChrome host={host} status={statusLine} badge={badge} />
            <div className="bg-ink-0">
              {(run.status === "queued" || run.status === "running") && (
                <WorkingBody run={run} />
              )}
              {run.status === "failed" && <FailedBody run={run} />}
              {run.status === "done" && (
                <DoneBody
                  run={run}
                  editedSubject={editedSubject}
                  setEditedSubject={setEditedSubject}
                  editedBody={editedBody}
                  setEditedBody={setEditedBody}
                  feedback={feedback}
                  setFeedback={setFeedback}
                  acting={acting}
                  onRegenerate={handleRegenerate}
                  onAction={handleAction}
                />
              )}
            </div>
          </TerminalShell>
        </div>
      </div>
      <SectionRule />
      <FooterRail status={statusLine} />
    </div>
  );
}

function deriveBadge(run: DraftRecord): { label: string; tone: "ok" | "err" | "warn" } | undefined {
  if (run.status === "failed") return { label: "FAILED", tone: "err" };
  if (run.status === "running" || run.status === "queued") return { label: "LIVE", tone: "warn" };
  if (run.status === "done") return { label: "READY", tone: "ok" };
  return undefined;
}

const PHASE_STEPS: Array<{ key: NonNullable<DraftRecord["phase"]>; n: string; label: string; sub: string }> = [
  { key: "scraping", n: "→ 01", label: "Fetch site", sub: "Pages, press, filings" },
  { key: "researching", n: "→ 02", label: "Research", sub: "Competitors, milestones, personas" },
  { key: "generating", n: "→ 03", label: "Cross-ref voice", sub: "Anchor tone in your examples" },
  { key: "writing", n: "→ 04", label: "Compile + cite", sub: "Compose, tighten, source" },
];

function phaseIndex(phase: DraftRecord["phase"] | undefined): number {
  if (!phase) return -1;
  return PHASE_STEPS.findIndex((s) => s.key === phase);
}

function WorkingBody({ run }: { run: DraftRecord }) {
  const idx = run.status === "queued" ? -1 : phaseIndex(run.phase);
  const progress = typeof run.progress === "number" ? run.progress : 0;
  const pct = Math.max(4, Math.min(100, progress * 100));

  return (
    <div className="min-h-[520px] px-6 py-8">
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-500">
        {run.status === "queued" ? "queued" : run.phase ?? "running"}
        <BlinkCaret />
      </div>
      <div className="mt-4 h-[3px] w-full bg-ink-200">
        <div
          className="h-full bg-accent-400 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <RunningTimer run={run} />

      <div className="mt-8 grid grid-cols-1 gap-0 sm:grid-cols-2">
        {PHASE_STEPS.map((step, i) => {
          const state: "done" | "active" | "pending" =
            i < idx ? "done" : i === idx ? "active" : "pending";
          return (
            <div
              key={step.key}
              className={clsx(
                "border-ink-200 px-4 py-4",
                "border-b",
                i % 2 === 0 ? "sm:border-r" : "",
                i < 2 ? "" : "sm:border-b-0",
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={clsx(
                    "font-mono text-[10px] uppercase tracking-[0.22em]",
                    state === "active" ? "text-accent-400" : state === "done" ? "text-ink-500" : "text-ink-400",
                  )}
                >
                  {step.n}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                  {state === "done" ? "done" : state === "active" ? "in progress" : "pending"}
                </span>
              </div>
              <div
                className={clsx(
                  "mt-2 font-display text-[15px] font-medium tracking-[-0.01em]",
                  state === "pending" ? "text-ink-500" : "text-ink-900",
                )}
              >
                {step.label}
              </div>
              <div className="mt-1 text-[12px] text-ink-600">{step.sub}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 border-t border-ink-200 pt-6">
        <SectionMark>§ Email · compiling</SectionMark>
        <div className="mt-3 space-y-2">
          <SkeletonLine w="60%" />
          <div className="h-2" />
          <SkeletonLine w="94%" />
          <SkeletonLine w="88%" />
          <SkeletonLine w="92%" />
          <SkeletonLine w="48%" />
          <div className="h-2" />
          <SkeletonLine w="90%" />
          <SkeletonLine w="72%" />
        </div>
        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
          fire-and-forget · safe to leave this page
        </p>
      </div>
    </div>
  );
}

function SkeletonLine({ w }: { w: string }) {
  return (
    <div
      className="h-3 shimmer"
      style={{ width: w, backgroundColor: "rgb(var(--ink-200))", borderRadius: 2 }}
    />
  );
}

function RunningTimer({ run }: { run: DraftRecord }) {
  const now = useNow(500);
  if (!run.startedAt) return null;
  const elapsed = Math.max(0, Math.round((now - run.startedAt) / 1000));
  const eta = Math.round((run.etaMs ?? 30_000) / 1000);
  return (
    <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
      {elapsed}s elapsed · ~{eta}s expected
    </p>
  );
}

function FailedBody({ run }: { run: DraftRecord }) {
  return (
    <div className="min-h-[420px] px-6 py-10">
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-danger-400">
        § Error
      </div>
      <h3 className="mt-3 font-display text-[22px] font-medium tracking-[-0.01em] text-ink-800">
        The run failed.
      </h3>
      <p className="mt-3 max-w-[52ch] text-sm text-danger-400">{run.error ?? "Unknown error"}</p>
      <div className="mt-8 flex items-center gap-3">
        <Link href="/draft">
          <div className="w-[200px]">
            <PrimaryButton>Try again</PrimaryButton>
          </div>
        </Link>
        <Link href="/runs" className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-600 hover:text-ink-900">
          ← queue
        </Link>
      </div>
    </div>
  );
}

function DoneBody({
  run,
  editedSubject,
  setEditedSubject,
  editedBody,
  setEditedBody,
  feedback,
  setFeedback,
  acting,
  onRegenerate,
  onAction,
}: {
  run: DraftRecord;
  editedSubject: string;
  setEditedSubject: (v: string) => void;
  editedBody: string;
  setEditedBody: (v: string) => void;
  feedback: string;
  setFeedback: (v: string) => void;
  acting: "approve" | "reject" | "regenerate" | null;
  onRegenerate: () => void;
  onAction: (action: DraftAction) => void;
}) {
  const edited =
    editedSubject !== (run.generatedSubject ?? "") ||
    editedBody !== (run.generatedBody ?? "");
  const wordCount = editedBody.trim().split(/\s+/).filter(Boolean).length;
  const generatedSeconds =
    run.completedAt && run.startedAt
      ? Math.round((run.completedAt - run.startedAt) / 1000)
      : null;

  return (
    <div className="px-6 py-8">
      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
        <span>
          {generatedSeconds !== null ? `generated in ${generatedSeconds}s` : "generated"}
        </span>
        <span>{run.action ? `status · ${run.action}` : edited ? "edited" : "unedited"}</span>
      </div>

      <div className="mt-6">
        <SectionMark>§ Subject</SectionMark>
        <input
          className="mt-3 w-full border border-ink-200 bg-ink-0 px-4 py-3 font-display text-[18px] font-medium tracking-[-0.01em] text-ink-900 focus:border-accent-400 focus:outline-none"
          style={{ borderRadius: 2 }}
          value={editedSubject}
          onChange={(e) => setEditedSubject(e.target.value)}
        />
      </div>

      <div className="mt-6">
        <SectionMark>§ Body</SectionMark>
        <textarea
          className="mt-3 min-h-[340px] w-full border border-ink-200 bg-ink-0 px-4 py-3 text-[15px] leading-[1.7] text-ink-900 focus:border-accent-400 focus:outline-none"
          style={{ borderRadius: 2 }}
          value={editedBody}
          onChange={(e) => setEditedBody(e.target.value)}
        />
        <div className="mt-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
          <span>{wordCount} words</span>
          <span>{edited ? "edited" : "unedited"}</span>
        </div>
      </div>

      {(run.researchDoc || run.researchSiteUrl) && (
        <div className="mt-6 border-t border-ink-200 pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <SectionMark>§ Research brief</SectionMark>
              <p className="mt-2 text-xs text-ink-600">
                {run.researchSiteUrl
                  ? "Linked in the email body. PDF is yours to attach."
                  : "PDF is yours to attach to the email."}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {run.researchSiteUrl && (
                <a
                  href={run.researchSiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="border border-ink-300 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-700 hover:border-ink-400 hover:text-ink-900"
                  style={{ borderRadius: 2 }}
                >
                  Open site ↗
                </a>
              )}
              {run.researchDoc && <DownloadPdfButton doc={run.researchDoc} />}
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 border-t border-ink-200 pt-6">
        <SectionMark>§ Regenerate with feedback</SectionMark>
        <p className="mt-2 text-xs text-ink-600">
          &ldquo;Close, but shorter.&rdquo; &ldquo;Lead with their Series B.&rdquo; &ldquo;Less corporate.&rdquo;
        </p>
        <div className="mt-3 flex gap-2">
          <input
            className="flex-1 border border-ink-200 bg-ink-0 px-3 py-2.5 text-sm text-ink-900 focus:border-accent-400 focus:outline-none"
            style={{ borderRadius: 2 }}
            placeholder="What should change?"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && feedback.trim().length >= 5) {
                e.preventDefault();
                onRegenerate();
              }
            }}
            disabled={acting === "regenerate"}
          />
          <Chip
            onClick={onRegenerate}
            disabled={feedback.trim().length < 5 || acting === "regenerate"}
          >
            {acting === "regenerate" ? "…" : "Rework ⏎"}
          </Chip>
        </div>
      </div>

      {run.sourcesConsulted && run.sourcesConsulted.length > 0 && (
        <div className="mt-6 border-t border-ink-200 pt-6">
          <SectionMark>§ Sources consulted</SectionMark>
          <ul className="mt-3 space-y-3">
            {run.sourcesConsulted.map((s, i) => (
              <li key={i} className="border-l border-accent-400 pl-3">
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all font-mono text-[11px] text-accent-400 hover:underline"
                >
                  {s.url}
                </a>
                {s.summary && <p className="mt-1 text-[12px] text-ink-600">{s.summary}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 flex items-center justify-end gap-3 border-t border-ink-200 pt-6">
        <button
          className={clsx(
            "border border-danger-400/50 px-3.5 py-2.5 font-mono text-[11px] uppercase tracking-[0.22em] text-danger-400 transition-colors hover:bg-danger-500/5",
            "disabled:cursor-not-allowed disabled:opacity-40",
          )}
          style={{ borderRadius: 2 }}
          onClick={() => onAction("rejected")}
          disabled={acting !== null}
        >
          Reject
        </button>
        <div className="w-[260px]">
          <PrimaryButton onClick={() => onAction("approved")} disabled={acting !== null}>
            {acting === "approve" ? "Approving…" : "Approve & copy"}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

function StatusTag({ status }: { status: DraftRecord["status"] }) {
  const map: Record<DraftRecord["status"], { label: string; cls: string }> = {
    queued: { label: "queued", cls: "text-ink-600 border-ink-300" },
    running: { label: "running", cls: "text-accent-400 border-accent-400/50" },
    done: { label: "done", cls: "text-ink-700 border-ink-300" },
    failed: { label: "failed", cls: "text-danger-400 border-danger-400/50" },
    cancelled: { label: "stopped", cls: "text-ink-500 border-ink-300" },
  };
  const { label, cls } = map[status];
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.22em]",
        cls,
      )}
      style={{ borderRadius: 2 }}
    >
      {(status === "queued" || status === "running") && (
        <span
          className="h-1 w-1 bg-current"
          style={{ animation: "pulseDot 1.4s ease-in-out infinite" }}
        />
      )}
      {label}
    </span>
  );
}

function TimingText({ run, elapsedMs }: { run: DraftRecord; elapsedMs: number }) {
  if (run.status === "done" && run.completedAt && run.startedAt) {
    const s = Math.max(1, Math.round((run.completedAt - run.startedAt) / 1000));
    return (
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-600">
        {s}s · done
      </span>
    );
  }
  if (run.status === "failed") {
    return (
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-danger-400">
        failed
      </span>
    );
  }
  if (run.status === "cancelled") {
    return (
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
        stopped · {formatClockTime(run.queuedAt)}
      </span>
    );
  }
  if (run.status === "running") {
    const s = Math.round(elapsedMs / 1000);
    const etaS = Math.round((run.etaMs ?? 30_000) / 1000);
    return (
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-600">
        {s}s / ~{etaS}s
      </span>
    );
  }
  return (
    <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-600">
      queued · {formatClockTime(run.queuedAt)}
    </span>
  );
}

function formatClockTime(ms: number | undefined): string {
  if (!ms) return "—";
  return new Date(ms).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function useNow(interval: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (interval <= 0) return;
    const id = setInterval(() => setNow(Date.now()), interval);
    return () => clearInterval(id);
  }, [interval]);
  return now;
}

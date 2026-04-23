"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { AuthGate } from "@/components/AuthGate";
import { Spinner } from "@/components/Spinner";
import { useToast } from "@/components/Toast";
import { useAuth } from "@/lib/auth-context";
import { getFirebaseDb } from "@/lib/firebase";
import { api, ApiClientError } from "@/lib/api";
import type { DraftRecord, VoiceProfile } from "@talaria/shared";
import clsx from "clsx";
import {
  SectionRule,
  SectionMark,
  Heading,
  Row,
  PrimaryButton,
  TerminalChrome,
  TerminalShell,
  FooterRail,
  BlinkCaret,
} from "@/components/notebook";

export default function SettingsPage() {
  return (
    <AuthGate>
      <SettingsInner />
    </AuthGate>
  );
}

function SettingsInner() {
  const toast = useToast();
  const [voice, setVoice] = useState<VoiceProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.getVoiceProfile();
        if (!cancelled) setVoice(res.voiceProfile);
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof ApiClientError ? err.message : "Could not load style";
          setLoadError(message);
          setVoice({
            tone: "",
            signatureClose: "",
            firmInfo: "",
            explicitPrefs: "",
            updatedAt: 0,
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // Intentionally empty deps: fetch once on mount. Toast ref changes would loop and hit the rate limit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function update<K extends keyof VoiceProfile>(key: K, value: VoiceProfile[K]) {
    setVoice((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSave() {
    if (!voice) return;
    setSaving(true);
    try {
      await api.updateVoiceProfile({ voiceProfile: voice });
      toast.show("success", "Style updated.");
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : "Save failed";
      toast.show("error", message);
    } finally {
      setSaving(false);
    }
  }

  if (loading || !voice) {
    return (
      <div className="-mx-6 -my-10">
        <SectionRule />
        <div className="mx-auto max-w-[1280px] px-6 py-16">
          <div className="flex items-center gap-3 border border-ink-200 bg-ink-50 px-5 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500" style={{ borderRadius: 2 }}>
            <Spinner size={12} /> loading style
          </div>
        </div>
        <SectionRule />
      </div>
    );
  }

  const updatedLabel = voice.updatedAt
    ? new Date(voice.updatedAt).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "never";

  return (
    <div className="-mx-6 -my-10 animate-fadeIn">
      <SectionRule />
      <div className="mx-auto max-w-[1280px] px-6 pt-10 pb-16">
        {loadError && (
          <div
            className="mb-8 border border-danger-400/40 bg-danger-500/5 px-4 py-3"
            style={{ borderRadius: 2 }}
          >
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-danger-400">
              § Unable to load style
            </div>
            <p className="mt-1.5 text-sm text-ink-800">{loadError}</p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
              you can still edit fields and save — or retry later
            </p>
          </div>
        )}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,460px)_minmax(0,1fr)]">
          <VoiceLedger
            voice={voice}
            update={update}
            onSave={handleSave}
            saving={saving}
            updatedLabel={updatedLabel}
          />
          <ReferencesPane />
        </div>
      </div>
      <SectionRule />
      <FooterRail status={`last updated · ${updatedLabel}`} />
    </div>
  );
}

function VoiceLedger({
  voice,
  update,
  onSave,
  saving,
  updatedLabel,
}: {
  voice: VoiceProfile;
  update: <K extends keyof VoiceProfile>(key: K, value: VoiceProfile[K]) => void;
  onSave: () => void;
  saving: boolean;
  updatedLabel: string;
}) {
  return (
    <div className="self-start">
      <SectionMark>§ 01 — Voice</SectionMark>
      <Heading>How talaria sounds.</Heading>
      <p className="mt-3 max-w-[52ch] text-sm leading-relaxed text-ink-600">
        Shape the voice. Watch it evolve on the right, one edit at a time.
      </p>

      <div className="mt-6 border-t border-ink-200">
        <Row n="01" label="Tone">
          <textarea
            className="w-full resize-none border border-ink-200 bg-ink-0 px-3 py-2.5 text-[14px] leading-[1.6] text-ink-900 focus:border-accent-400 focus:outline-none"
            style={{ borderRadius: 2 }}
            rows={4}
            value={voice.tone}
            onChange={(e) => update("tone", e.target.value)}
            placeholder="One paragraph. First person. Be specific."
          />
        </Row>
        <Row n="02" label="Signature">
          <textarea
            className="w-full resize-none border border-ink-200 bg-ink-0 px-3 py-2.5 font-mono text-[12px] leading-[1.6] text-ink-900 focus:border-accent-400 focus:outline-none"
            style={{ borderRadius: 2 }}
            rows={3}
            value={voice.signatureClose}
            onChange={(e) => update("signatureClose", e.target.value)}
            placeholder={`Best,\nYour name`}
          />
        </Row>
        <Row n="03" label="Firm">
          <textarea
            className="w-full resize-none border border-ink-200 bg-ink-0 px-3 py-2.5 text-[14px] leading-[1.6] text-ink-900 focus:border-accent-400 focus:outline-none"
            style={{ borderRadius: 2 }}
            rows={3}
            value={voice.firmInfo}
            onChange={(e) => update("firmInfo", e.target.value)}
            placeholder="One sentence on what the firm does."
          />
        </Row>
        <Row n="04" label="Prefs">
          <p className="mb-2 text-[11px] text-ink-600">
            Sentences the model must obey. E.g., &ldquo;Never use &lsquo;ecosystem&rsquo;&rdquo;.
          </p>
          <textarea
            className="w-full resize-none border border-ink-200 bg-ink-0 px-3 py-2.5 text-[14px] leading-[1.6] text-ink-900 focus:border-accent-400 focus:outline-none"
            style={{ borderRadius: 2 }}
            rows={5}
            value={voice.explicitPrefs}
            onChange={(e) => update("explicitPrefs", e.target.value)}
          />
        </Row>
      </div>

      <div className="mt-6">
        <PrimaryButton onClick={onSave} disabled={saving} trailing={saving ? "…" : "⏎"}>
          {saving ? "Saving" : "Save style"}
        </PrimaryButton>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
          last updated · {updatedLabel}
          <BlinkCaret />
        </p>
      </div>
    </div>
  );
}

function ReferencesPane() {
  const { state } = useAuth();
  const uid = state.status === "signed-in" ? state.user.uid : null;
  const [drafts, setDrafts] = useState<DraftRecord[] | null>(null);

  useEffect(() => {
    if (!uid) return;
    const db = getFirebaseDb();
    const q = query(collection(db, `users/${uid}/drafts`), orderBy("queuedAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => setDrafts(snap.docs.map((d) => d.data() as DraftRecord)),
      () => setDrafts([]),
    );
    return () => unsub();
  }, [uid]);

  const learnings = useMemo(() => {
    if (!drafts) return null;
    return drafts.filter(
      (d) =>
        d.action === "approved" ||
        d.action === "edited" ||
        d.action === "rejected" ||
        (d.feedbackChain && d.feedbackChain.length > 0),
    );
  }, [drafts]);

  const status =
    learnings === null
      ? "loading…"
      : learnings.length === 0
      ? "empty · awaiting"
      : `${learnings.length} references`;

  return (
    <div className="lg:sticky lg:top-20 lg:self-start">
      <TerminalShell>
        <TerminalChrome
          host="talaria.style / references"
          status={status}
          badge={
            learnings && learnings.length > 0
              ? { label: "LIVE", tone: "ok" }
              : { label: "EMPTY", tone: "warn" }
          }
        />
        <div className="bg-ink-0">
          {learnings === null ? (
            <div className="flex min-h-[420px] items-center justify-center gap-3 text-sm text-ink-600">
              <Spinner size={14} /> loading references…
            </div>
          ) : learnings.length === 0 ? (
            <EmptyReferences />
          ) : (
            <ul className="divide-y divide-ink-200">
              {learnings.map((d) => (
                <li key={d.id}>
                  <LearningCard draft={d} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </TerminalShell>
    </div>
  );
}

function EmptyReferences() {
  return (
    <div className="flex min-h-[480px] flex-col items-center justify-center px-8 py-14 text-center">
      <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-accent-400">
        § Nothing yet
      </div>
      <h3 className="mt-5 font-display text-[24px] font-medium tracking-[-0.02em] text-ink-800">
        Your edits show up here.
      </h3>
      <p className="mt-3 max-w-[44ch] text-sm leading-relaxed text-ink-600">
        Approve, tweak, or rework an email. Talaria will remember it, timestamp it, and lean on
        it next time.
      </p>

      <div className="mt-8 grid grid-cols-[auto,16px,auto,16px,auto] items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-500">
        <TimelineDot label="Compile" />
        <span className="text-ink-400">─</span>
        <TimelineDot label="Edit" />
        <span className="text-ink-400">─</span>
        <TimelineDot label="Learn" active />
      </div>
      <div className="mt-10 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-500">
        awaiting · edit
        <BlinkCaret />
      </div>
    </div>
  );
}

function TimelineDot({ label, active }: { label: string; active?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span
        className={clsx(
          "inline-block h-1.5 w-1.5",
          active ? "bg-accent-400" : "bg-ink-400",
        )}
        style={{
          animation: active ? "pulseDot 1.4s ease-in-out infinite" : undefined,
          borderRadius: 1,
        }}
      />
      <span className={active ? "text-accent-400" : "text-ink-500"}>{label}</span>
    </div>
  );
}

function LearningCard({ draft }: { draft: DraftRecord }) {
  const [open, setOpen] = useState(false);
  const ts = (draft as DraftRecord & { actionAt?: number }).actionAt ?? draft.completedAt ?? draft.queuedAt;
  const label = draft.companyName || draft.companyDomain || draft.companyUrl || "—";
  const origSubject = draft.generatedSubject ?? "";
  const origBody = draft.generatedBody ?? "";
  const finalSubject = draft.finalSubject ?? origSubject;
  const finalBody = draft.finalBody ?? origBody;
  const edited =
    (draft.finalSubject !== undefined && draft.finalSubject !== origSubject) ||
    (draft.finalBody !== undefined && draft.finalBody !== origBody);
  const feedbacks = draft.feedbackChain ?? [];

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-5 py-3 text-left transition-colors hover:bg-ink-50/60"
      >
        <div className="flex min-w-0 items-center gap-3">
          <ActionTag action={draft.action} hasFeedback={feedbacks.length > 0} edited={edited} />
          <div className="min-w-0">
            <p className="truncate font-display text-[14px] font-medium tracking-[-0.01em] text-ink-900">
              {label}
            </p>
            <p className="mt-0.5 truncate font-mono text-[11px] text-ink-600">
              {finalSubject || origSubject || "—"}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
            {ts ? formatStamp(ts) : "—"}
          </span>
          <span className={clsx("text-ink-500 transition-transform", open && "rotate-90")}>›</span>
        </div>
      </button>

      {open && (
        <div className="space-y-4 border-t border-ink-200 bg-ink-50/40 p-5">
          {feedbacks.length > 0 && (
            <section>
              <SectionMark>§ Your feedback</SectionMark>
              <ul className="mt-2 space-y-1.5">
                {feedbacks.map((f, i) => (
                  <li
                    key={i}
                    className="border-l-2 border-accent-400 pl-3 text-sm leading-relaxed text-ink-800"
                  >
                    &ldquo;{f}&rdquo;
                  </li>
                ))}
              </ul>
            </section>
          )}

          {edited ? (
            <DiffView
              origSubject={origSubject}
              origBody={origBody}
              finalSubject={finalSubject}
              finalBody={finalBody}
            />
          ) : (
            <section>
              <SectionMark>§ Approved as compiled</SectionMark>
              <pre className="mt-2 whitespace-pre-wrap font-sans text-[13px] leading-[1.7] text-ink-800">
                {origBody || <span className="text-ink-500">(no body)</span>}
              </pre>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function DiffView({
  origSubject,
  origBody,
  finalSubject,
  finalBody,
}: {
  origSubject: string;
  origBody: string;
  finalSubject: string;
  finalBody: string;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section>
        <SectionMark>§ Compiled</SectionMark>
        {origSubject && (
          <p className="mt-2 mb-1.5 text-xs font-medium text-ink-900">{origSubject}</p>
        )}
        <pre
          className="max-h-[320px] overflow-auto whitespace-pre-wrap border border-ink-200 bg-ink-0 p-3 font-sans text-[12.5px] leading-[1.65] text-ink-700"
          style={{ borderRadius: 2 }}
        >
          {origBody || <span className="text-ink-500">(no body)</span>}
        </pre>
      </section>
      <section>
        <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-accent-400">
          § You sent
        </div>
        {finalSubject && (
          <p className="mt-2 mb-1.5 text-xs font-medium text-ink-900">{finalSubject}</p>
        )}
        <pre
          className="max-h-[320px] overflow-auto whitespace-pre-wrap border border-accent-400/60 bg-ink-0 p-3 font-sans text-[12.5px] leading-[1.65] text-ink-800"
          style={{ borderRadius: 2 }}
        >
          {finalBody || <span className="text-ink-500">(no body)</span>}
        </pre>
      </section>
    </div>
  );
}

function ActionTag({
  action,
  hasFeedback,
  edited,
}: {
  action?: DraftRecord["action"];
  hasFeedback: boolean;
  edited: boolean;
}) {
  let label = "—";
  let cls = "text-ink-600 border-ink-300";
  if (action === "approved" && !edited) {
    label = "Approved";
    cls = "text-ink-700 border-ink-300";
  } else if (action === "edited" || (action === "approved" && edited)) {
    label = "Edited";
    cls = "text-accent-400 border-accent-400/60";
  } else if (action === "rejected") {
    label = "Rejected";
    cls = "text-danger-400 border-danger-400/50";
  } else if (hasFeedback) {
    label = "Reworked";
    cls = "text-accent-400 border-accent-400/60";
  }
  return (
    <span
      className={clsx(
        "shrink-0 border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.22em]",
        cls,
      )}
      style={{ borderRadius: 2 }}
    >
      {label}
    </span>
  );
}

function formatStamp(ms: number): string {
  const d = new Date(ms);
  const today = new Date();
  const sameDay =
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();
  if (sameDay) {
    return `Today · ${d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`;
  }
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

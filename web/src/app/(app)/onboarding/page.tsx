"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGate } from "@/components/AuthGate";
import { Spinner } from "@/components/Spinner";
import { useToast } from "@/components/Toast";
import { api, ApiClientError } from "@/lib/api";
import {
  SectionRule,
  SectionMark,
  Heading,
  Row,
  PrimaryButton,
  Chip,
  FooterRail,
  BlinkCaret,
} from "@/components/notebook";

interface EmailRow {
  subject: string;
  body: string;
  recipient: string;
}

const EMPTY: EmailRow = { subject: "", body: "", recipient: "" };

export default function OnboardingPage() {
  return (
    <AuthGate requireOnboarding={false}>
      <OnboardingInner />
    </AuthGate>
  );
}

function OnboardingInner() {
  const router = useRouter();
  const toast = useToast();
  const [voicePrompt, setVoicePrompt] = useState(
    "I'm direct and specific. I lead with the 'why now'. I close with 'Best,' and my first name. I avoid corporate phrasing and AI tells.",
  );
  const [signatureClose, setSignatureClose] = useState("Best,\nAsher");
  const [firmInfo, setFirmInfo] = useState(
    "Insight Partners — growth-stage software investor. We back teams we believe in at the inflection point.",
  );
  const [emails, setEmails] = useState<EmailRow[]>([{ ...EMPTY }, { ...EMPTY }, { ...EMPTY }]);
  const [submitting, setSubmitting] = useState(false);

  const filledEmails = emails.filter((e) => e.subject.trim() && e.body.trim());

  function updateRow(index: number, patch: Partial<EmailRow>) {
    setEmails((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setEmails((prev) => [...prev, { ...EMPTY }]);
  }

  function removeRow(i: number) {
    setEmails((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(mode: "save" | "skip" = "save") {
    setSubmitting(true);
    try {
      const isSkip = mode === "skip";
      await api.bootstrapSubmit({
        emails: isSkip
          ? []
          : filledEmails.map((e) => ({
              subject: e.subject.trim(),
              body: e.body.trim(),
              recipient: e.recipient.trim() || undefined,
            })),
        voicePrompt: isSkip ? "" : voicePrompt.trim(),
        signatureClose: isSkip ? "" : signatureClose.trim(),
        firmInfo: isSkip ? "" : firmInfo.trim(),
      });
      toast.show(
        "success",
        isSkip ? "Using defaults. You can add style later." : "Style saved. Let's break through the noise.",
      );
      router.replace("/draft");
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : "Onboarding failed";
      toast.show("error", message);
    } finally {
      setSubmitting(false);
    }
  }

  const statusLine = submitting
    ? "submitting"
    : filledEmails.length > 0
    ? `${filledEmails.length} example${filledEmails.length === 1 ? "" : "s"} ready`
    : "awaiting input";

  return (
    <div className="-mx-6 -my-10 animate-fadeIn">
      <SectionRule />
      <div className="mx-auto max-w-[820px] px-6 pt-10 pb-16">
        <div>
          <SectionMark>§ 00 — Bootstrap</SectionMark>
          <Heading>Teach talaria how you sound.</Heading>
          <p className="mt-3 max-w-[58ch] text-sm leading-relaxed text-ink-600">
            Paste a few recent emails you&rsquo;re proud of. The model uses them as style examples, never
            as content to copy. More examples = tighter style. Edit this later in My Style.
          </p>
        </div>

        <div className="mt-8 border-t border-ink-200">
          <Row n="01" label="Tone">
            <p className="mb-2 text-[11px] text-ink-600">
              One paragraph on how you write. First person. Be specific.
            </p>
            <textarea
              className="w-full resize-none border border-ink-200 bg-ink-0 px-3 py-2.5 text-[14px] leading-[1.6] text-ink-900 focus:border-accent-400 focus:outline-none"
              style={{ borderRadius: 2 }}
              rows={4}
              value={voicePrompt}
              onChange={(e) => setVoicePrompt(e.target.value)}
            />
          </Row>

          <Row n="02" label="Sign-off">
            <textarea
              className="w-full resize-none border border-ink-200 bg-ink-0 px-3 py-2.5 font-mono text-[12px] leading-[1.6] text-ink-900 focus:border-accent-400 focus:outline-none"
              style={{ borderRadius: 2 }}
              rows={3}
              value={signatureClose}
              onChange={(e) => setSignatureClose(e.target.value)}
            />
          </Row>

          <Row n="03" label="Firm">
            <textarea
              className="w-full resize-none border border-ink-200 bg-ink-0 px-3 py-2.5 text-[14px] leading-[1.6] text-ink-900 focus:border-accent-400 focus:outline-none"
              style={{ borderRadius: 2 }}
              rows={3}
              value={firmInfo}
              onChange={(e) => setFirmInfo(e.target.value)}
            />
          </Row>

          <Row n="04" label="Examples">
            <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
              <span>{filledEmails.length} filled · 3–10 is ideal</span>
              <Chip onClick={addRow}>+ add</Chip>
            </div>
            <div className="flex flex-col gap-3">
              {emails.map((row, i) => (
                <ExampleCard
                  key={i}
                  i={i}
                  row={row}
                  canRemove={emails.length > 1}
                  onChange={(patch) => updateRow(i, patch)}
                  onRemove={() => removeRow(i)}
                />
              ))}
            </div>
          </Row>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-ink-200 pt-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-500">
            blanks are fine · edit anytime in My Style
            <BlinkCaret />
          </p>
          <div className="flex items-center justify-end gap-4">
            <button
              onClick={() => handleSubmit("skip")}
              disabled={submitting}
              className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-600 transition-colors hover:text-ink-900 disabled:opacity-40"
            >
              skip for now
            </button>
            <div className="w-[260px]">
              <PrimaryButton
                onClick={() => handleSubmit("save")}
                disabled={submitting}
                trailing={submitting ? "…" : "→"}
              >
                {submitting ? "Saving" : "Save style profile"}
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
      <SectionRule />
      <FooterRail status={statusLine} />
    </div>
  );
}

function ExampleCard({
  i,
  row,
  canRemove,
  onChange,
  onRemove,
}: {
  i: number;
  row: EmailRow;
  canRemove: boolean;
  onChange: (patch: Partial<EmailRow>) => void;
  onRemove: () => void;
}) {
  return (
    <div
      className="border border-ink-200 bg-ink-50/40 p-4"
      style={{ borderRadius: 2 }}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent-400">
          § {String(i + 1).padStart(2, "0")} · example
        </span>
        {canRemove && (
          <button
            onClick={onRemove}
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 transition-colors hover:text-danger-400"
          >
            remove
          </button>
        )}
      </div>
      <div className="mt-3 grid gap-2">
        <input
          className="w-full border border-ink-200 bg-ink-0 px-3 py-2 text-[13px] text-ink-900 focus:border-accent-400 focus:outline-none"
          style={{ borderRadius: 2 }}
          placeholder="Subject"
          value={row.subject}
          onChange={(e) => onChange({ subject: e.target.value })}
        />
        <input
          className="w-full border border-ink-200 bg-ink-0 px-3 py-2 font-mono text-[11px] text-ink-900 focus:border-accent-400 focus:outline-none"
          style={{ borderRadius: 2 }}
          placeholder="Recipient (optional — e.g., Jane at Acme)"
          value={row.recipient}
          onChange={(e) => onChange({ recipient: e.target.value })}
        />
        <textarea
          className="w-full resize-none border border-ink-200 bg-ink-0 px-3 py-2 text-[13px] leading-[1.6] text-ink-900 focus:border-accent-400 focus:outline-none"
          style={{ borderRadius: 2 }}
          rows={6}
          placeholder="Paste the body of a past email…"
          value={row.body}
          onChange={(e) => onChange({ body: e.target.value })}
        />
      </div>
    </div>
  );
}

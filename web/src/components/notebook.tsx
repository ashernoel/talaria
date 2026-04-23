"use client";

import clsx from "clsx";
import type { ReactNode } from "react";

export function SectionRule() {
  return <div className="h-px w-full bg-accent-400" />;
}

export function SectionMark({ children }: { children: ReactNode }) {
  return (
    <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-accent-400">
      {children}
    </div>
  );
}

export function Heading({ children }: { children: ReactNode }) {
  return (
    <h1 className="mt-3 font-display text-[34px] font-medium leading-[1.02] tracking-[-0.025em] text-ink-900">
      {children}
    </h1>
  );
}

export function Row({
  n,
  label,
  children,
  collapsible,
  expanded,
  onToggle,
}: {
  n: string;
  label: string;
  children: ReactNode;
  collapsible?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
}) {
  return (
    <div className="border-b border-ink-200 py-3">
      <div className="grid grid-cols-[28px,80px,1fr] items-baseline gap-3">
        <span className="font-mono text-[10px] tracking-[0.18em] text-accent-400">{n}</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-600">
          {collapsible ? (
            <button type="button" onClick={onToggle} className="hover:text-ink-900">
              {label} <span className="text-ink-500">{expanded ? "−" : "+"}</span>
            </button>
          ) : (
            label
          )}
        </span>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}

export function Chip({
  children,
  active,
  onClick,
  disabled,
  title,
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={clsx(
        "border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors",
        active
          ? "border-accent-400 text-accent-400 bg-accent-400/5"
          : "border-ink-300 text-ink-600 hover:border-ink-400 hover:text-ink-800",
        disabled && !active && "cursor-not-allowed opacity-50",
      )}
      style={{ borderRadius: 2 }}
    >
      {children}
    </button>
  );
}

export function PrimaryButton({
  onClick,
  disabled,
  children,
  trailing = "⏎",
  type = "button",
}: {
  onClick?: () => void;
  disabled?: boolean;
  children: ReactNode;
  trailing?: ReactNode;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "group flex w-full items-center justify-between border px-4 py-3 transition-colors",
        "border-accent-400 text-accent-400 hover:bg-accent-400/10",
        "disabled:cursor-not-allowed disabled:opacity-40",
      )}
      style={{ borderRadius: 2 }}
    >
      <span className="inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em]">
        {children}
      </span>
      {trailing && <span className="font-mono text-xs text-accent-400">{trailing}</span>}
    </button>
  );
}

export function TerminalChrome({
  host,
  status,
  badge,
}: {
  host: string;
  status?: string;
  badge?: { label: string; tone: "ok" | "err" | "warn" };
}) {
  const badgeStyle =
    badge?.tone === "ok"
      ? { color: "#27C93F", background: "rgba(39,201,63,0.08)", border: "1px solid rgba(39,201,63,0.35)" }
      : badge?.tone === "err"
      ? { color: "rgb(var(--danger-400))", background: "rgb(var(--danger-500) / 0.08)", border: "1px solid rgb(var(--danger-500) / 0.35)" }
      : badge?.tone === "warn"
      ? { color: "#FFBD2E", background: "rgba(255,189,46,0.08)", border: "1px solid rgba(255,189,46,0.35)" }
      : undefined;

  return (
    <div className="flex items-center justify-between border-b border-ink-200 px-4 py-2.5">
      <div className="flex min-w-0 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
        <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: "#FF5F56" }} />
        <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: "#FFBD2E" }} />
        <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: "#27C93F" }} />
        <span className="ml-3 truncate text-ink-700">{host}</span>
        {badge && (
          <span
            className="ml-1 px-1.5 py-0.5 font-mono text-[9px] tracking-[0.18em]"
            style={{ ...badgeStyle, borderRadius: 2 }}
          >
            {badge.label}
          </span>
        )}
      </div>
      {status && (
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
          {status}
        </div>
      )}
    </div>
  );
}

export function TerminalShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={clsx("overflow-hidden border border-ink-200 bg-ink-50", className)}
      style={{
        borderRadius: 3,
        boxShadow: "0 30px 60px -30px rgba(0,0,0,0.35), inset 0 1px 0 rgb(var(--ink-300) / 0.12)",
      }}
    >
      {children}
    </div>
  );
}

export function FooterRail({
  center,
  status,
}: {
  center?: ReactNode;
  status?: ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-500">
      <div>NYC · Insight Partners</div>
      <div className="flex gap-6">
        {center ?? (
          <>
            <span>Private beta</span>
            <span>·</span>
            <span className="text-ink-700">{status ?? "Idle"}</span>
          </>
        )}
      </div>
      <div>© MMXXVI</div>
    </div>
  );
}

export function BlinkCaret({ className }: { className?: string }) {
  return (
    <span
      className={clsx("ml-1 inline-block h-3 w-[6px] align-middle", className)}
      style={{
        backgroundColor: "rgb(var(--accent-400))",
        animation: "blink 1.05s steps(2) infinite",
      }}
    />
  );
}

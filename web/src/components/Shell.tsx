"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import clsx from "clsx";
import { WingMark } from "./Wings";
import { ThemeToggle } from "./ThemeToggle";

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="flex items-center justify-center rounded-[10px] border border-ink-300 bg-ink-100"
        style={{ width: size, height: size }}
      >
        <WingMark size={Math.round(size * 0.68)} />
      </div>
      <span className="font-display text-lg font-semibold tracking-tight text-ink-900">talaria</span>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { state, signOutUser } = useAuth();
  const pathname = usePathname();

  const nav: Array<{ href: string; label: string; icon: React.ReactNode }> = [
    { href: "/draft", label: "Draft", icon: <DraftIcon /> },
    { href: "/runs", label: "Queue", icon: <QueueIcon /> },
    { href: "/settings", label: "My Style", icon: <StyleIcon /> },
  ];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-ink-200 bg-ink-0/75 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/draft" className="flex items-center">
            <Logo />
          </Link>
          <nav className="flex items-center gap-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors",
                  pathname?.startsWith(item.href)
                    ? "bg-ink-100 text-ink-900"
                    : "text-ink-600 hover:bg-ink-100 hover:text-ink-900",
                )}
              >
                <span className="text-ink-500">{item.icon}</span>
                {item.label}
              </Link>
            ))}
            <a
              href="https://salesforce.com"
              target="_blank"
              rel="noreferrer"
              className="ml-1 inline-flex items-center gap-1.5 rounded-md border border-accent-300 bg-accent-400/10 px-3 py-1.5 text-sm text-accent-400 transition-colors hover:bg-accent-400/20"
            >
              <span className="text-accent-400">
                <NextActionsIcon />
              </span>
              My Next Actions
            </a>
            {state.status === "signed-in" && (
              <>
                <div className="mx-2 h-5 w-px bg-ink-200" />
                <span className="hidden text-xs text-ink-600 sm:inline">
                  {state.user.email}
                </span>
                <button onClick={signOutUser} className="btn-ghost ml-1 px-2.5 py-1.5 text-xs">
                  Sign out
                </button>
              </>
            )}
            <div className="mx-2 h-5 w-px bg-ink-200" />
            <ThemeToggle />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10 animate-fadeIn">{children}</main>
    </div>
  );
}

function DraftIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 20h4l10-10-4-4L4 16v4Z M13.5 6.5l4 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function QueueIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 7h12 M4 12h12 M4 17h8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="19.5" cy="7" r="1.2" fill="currentColor" />
      <circle cx="19.5" cy="12" r="1.2" fill="currentColor" />
    </svg>
  );
}

function NextActionsIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12h12 M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StyleIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 19l8-8 M13 11l3-3 4 4-3 3 M9 15l-3 3v2h2l3-3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Logo } from "@/components/Shell";
import { Spinner } from "@/components/Spinner";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  SectionRule,
  SectionMark,
  Heading,
  TerminalChrome,
  TerminalShell,
  FooterRail,
  BlinkCaret,
} from "@/components/notebook";

export default function LoginPage() {
  const { state, signIn } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (state.status === "signed-in") router.replace("/draft");
  }, [state, router]);

  async function handleSignIn() {
    setError(null);
    setSubmitting(true);
    try {
      await signIn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setSubmitting(false);
    }
  }

  const statusLine = submitting
    ? "opening google"
    : state.status === "blocked"
    ? "blocked"
    : "awaiting sign-in";

  return (
    <div className="relative flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-ink-200 bg-ink-0/75 px-6 py-4 backdrop-blur-xl">
        <Link href="/" className="flex items-center">
          <Logo />
        </Link>
        <ThemeToggle />
      </header>

      <SectionRule />

      <main className="flex flex-1 items-center justify-center px-6 py-14">
        <div className="w-full max-w-[520px] animate-fadeIn">
          <SectionMark>§ Access</SectionMark>
          <Heading>Welcome back.</Heading>
          <p className="mt-3 max-w-[52ch] text-sm leading-relaxed text-ink-600">
            Sign in to break through the noise in your voice. Your work stays in your Firebase
            project.
          </p>

          <div className="mt-8">
            <TerminalShell>
              <TerminalChrome
                host="talaria.auth / oauth"
                status={statusLine}
                badge={
                  state.status === "blocked"
                    ? { label: "BLOCKED", tone: "err" }
                    : submitting
                    ? { label: "LIVE", tone: "warn" }
                    : { label: "READY", tone: "ok" }
                }
              />
              <div className="bg-ink-0 p-6">
                {state.status === "blocked" ? (
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-danger-400">
                      § Access denied
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-ink-800">{state.reason}</p>
                  </div>
                ) : (
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-500">
                      awaiting · google
                      <BlinkCaret />
                    </div>
                    <button
                      onClick={handleSignIn}
                      disabled={submitting}
                      className="group mt-5 flex w-full items-center justify-between border border-accent-400 px-4 py-3 text-accent-400 transition-colors hover:bg-accent-400/10 disabled:cursor-not-allowed disabled:opacity-40"
                      style={{ borderRadius: 2 }}
                    >
                      <span className="inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em]">
                        {submitting ? <Spinner size={14} /> : <GoogleMark />}
                        {submitting ? "Opening Google…" : "Continue with Google"}
                      </span>
                      <span className="font-mono text-xs text-accent-400">⏎</span>
                    </button>

                    {error && (
                      <p className="mt-3 font-mono text-[11px] text-danger-400">{error}</p>
                    )}

                    <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                      V1 · private beta · insight partners
                    </p>
                  </div>
                )}
              </div>
            </TerminalShell>
          </div>
        </div>
      </main>

      <SectionRule />
      <FooterRail status={statusLine} />
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M21.6 12.23c0-.66-.06-1.29-.17-1.9H12v3.59h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 3-4.33 3-7.21Z"
      />
      <path
        fill="currentColor"
        d="M12 22c2.7 0 4.97-.9 6.62-2.43l-3.24-2.5c-.9.6-2.05.95-3.38.95-2.6 0-4.8-1.75-5.58-4.11H3.06v2.58A10 10 0 0 0 12 22Z"
      />
      <path
        fill="currentColor"
        d="M6.42 13.91A6 6 0 0 1 6.1 12c0-.66.11-1.3.32-1.91V7.5H3.06A10 10 0 0 0 2 12c0 1.63.39 3.17 1.06 4.5l3.36-2.59Z"
      />
      <path
        fill="currentColor"
        d="M12 6c1.47 0 2.78.5 3.82 1.5l2.87-2.87C16.97 3.05 14.7 2 12 2A10 10 0 0 0 3.06 7.5l3.36 2.59C7.2 7.75 9.4 6 12 6Z"
      />
    </svg>
  );
}

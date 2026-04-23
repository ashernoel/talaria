"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Spinner } from "./Spinner";

export function AuthGate({
  children,
  requireOnboarding = true,
}: {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}) {
  const { state } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (state.status !== "signed-in") return;
    if (!requireOnboarding) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await api.initUser();
        if (cancelled) return;
        if (!res.bootstrapComplete) router.replace("/onboarding");
      } catch {
        // If the initUser call fails (functions not deployed yet, etc.), let the page show its own error.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [state, requireOnboarding, router]);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-ink-600">
        <Spinner size={22} />
      </div>
    );
  }
  if (state.status === "signed-out") {
    if (typeof window !== "undefined") router.replace("/");
    return null;
  }
  if (state.status === "blocked") {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <h2 className="font-display text-2xl">Access restricted</h2>
        <p className="mt-3 text-sm text-ink-600">{state.reason}</p>
      </div>
    );
  }

  return <>{children}</>;
}

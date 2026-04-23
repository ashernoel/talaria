"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { Spinner } from "@/components/Spinner";
import { ResearchView } from "@/components/research/ResearchView";
import { DownloadPdfButton } from "@/components/research/DownloadPdfButton";
import type { PublicResearchDoc } from "@talaria/shared";

export default function ResearchPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ResearchPageInner />
    </Suspense>
  );
}

function ResearchPageInner() {
  const search = useSearchParams();
  const id = search.get("id");
  const [state, setState] = useState<
    { kind: "loading" } | { kind: "found"; doc: PublicResearchDoc } | { kind: "missing" }
  >({ kind: "loading" });

  useEffect(() => {
    if (!id) {
      setState({ kind: "missing" });
      return;
    }
    const db = getFirebaseDb();
    getDoc(doc(db, `publicResearch/${id}`))
      .then((snap) => {
        if (!snap.exists()) {
          setState({ kind: "missing" });
          return;
        }
        setState({ kind: "found", doc: snap.data() as PublicResearchDoc });
      })
      .catch(() => setState({ kind: "missing" }));
  }, [id]);

  if (state.kind === "loading") return <LoadingState />;
  if (state.kind === "missing") return <MissingState />;

  return (
    <div className="min-h-screen bg-ink-50 text-ink-900">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-6 flex items-center justify-end">
          <DownloadPdfButton doc={state.doc} />
        </div>
        <ResearchView doc={state.doc} />
        <footer className="mt-12 flex items-center justify-between border-t border-ink-200 pt-4 text-[11px] text-ink-500">
          <span className="font-mono">talaria · research brief</span>
          <span>
            Generated {new Date(state.doc.generatedAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </footer>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-ink-600">
      <Spinner size={16} /> <span className="ml-2">Loading research…</span>
    </div>
  );
}

function MissingState() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="panel max-w-md p-8 text-center">
        <p className="label mb-2">Not found</p>
        <p className="text-sm text-ink-600">
          This research link is invalid or the brief has been removed.
        </p>
      </div>
    </div>
  );
}

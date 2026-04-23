"use client";

import { useState } from "react";
import type { CompanyRef, ResearchDoc } from "@talaria/shared";

function faviconUrl(domain: string, size = 64): string {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${size}`;
}

async function fetchAsDataUrl(url: string): Promise<string | null> {
  try {
    const resp = await fetch(url, { cache: "force-cache" });
    if (!resp.ok) return null;
    const blob = await resp.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error);
      reader.onload = () => resolve(String(reader.result));
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function collectDomains(doc: ResearchDoc): string[] {
  const domains = new Set<string>();
  if (doc.companyDomain) domains.add(doc.companyDomain);
  const add = (refs: CompanyRef[] | undefined) =>
    (refs ?? []).forEach((r) => r.domain && domains.add(r.domain));
  doc.battlegrounds?.forEach((b) => {
    add(b.incumbents);
    add(b.challengers);
  });
  return [...domains];
}

export function DownloadPdfButton({ doc }: { doc: ResearchDoc }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onClick = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const domains = collectDomains(doc);
      const entries = await Promise.all(
        domains.map(async (d) => [d, await fetchAsDataUrl(faviconUrl(d, 128))] as const),
      );
      const logoMap: Record<string, string> = {};
      for (const [d, data] of entries) if (data) logoMap[d] = data;

      const [{ pdf }, { ResearchPdfDoc }, { ResearchPdfDocSimple }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("./ResearchPdfDoc"),
        import("./ResearchPdfDocSimple"),
      ]);
      let blob: Blob;
      try {
        blob = await pdf(<ResearchPdfDoc doc={doc} logoMap={logoMap} />).toBlob();
      } catch (renderErr) {
        console.warn("Editorial PDF failed, falling back to plain layout", renderErr);
        blob = await pdf(<ResearchPdfDocSimple doc={doc} />).toBlob();
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const date = new Date().toISOString().slice(0, 10);
      const slug = (doc.companyDomain || doc.companyName || "research")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      a.href = url;
      a.download = `research-${slug}-${date}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    } catch (err) {
      console.error("PDF render failed", err);
      setError(err instanceof Error ? err.message : "PDF render failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onClick}
          disabled={loading}
          className="btn-ghost text-xs"
        >
          {loading ? "Rendering…" : "Download PDF"}
        </button>
        <a
          href="/sample-research.pdf"
          target="_blank"
          rel="noreferrer"
          className="btn-ghost text-xs"
        >
          Backup PDF
        </a>
      </div>
      {error && <span className="text-xs text-danger-400">{error}</span>}
    </div>
  );
}

export default DownloadPdfButton;

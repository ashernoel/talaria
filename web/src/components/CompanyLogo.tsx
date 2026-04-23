"use client";

import { useState } from "react";
import clsx from "clsx";

export function domainFromUrl(raw?: string): string | undefined {
  if (!raw) return undefined;
  try {
    const s = raw.startsWith("http") ? raw : `https://${raw}`;
    return new URL(s).hostname.replace(/^www\./, "");
  } catch {
    return raw.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0] || undefined;
  }
}

function initialFrom(name?: string, domain?: string): string {
  const source = (name || domain || "").trim();
  const m = source.match(/[a-zA-Z0-9]/);
  return m ? m[0].toUpperCase() : "•";
}

export function CompanyLogo({
  domain,
  url,
  name,
  size = 40,
  className,
  rounded = "md",
}: {
  domain?: string;
  url?: string;
  name?: string;
  size?: number;
  className?: string;
  rounded?: "sm" | "md" | "lg" | "full";
}) {
  const clean = domain ?? domainFromUrl(url);
  const [primaryFailed, setPrimaryFailed] = useState(false);
  const [secondaryFailed, setSecondaryFailed] = useState(false);
  const initial = initialFrom(name, clean);

  const src = clean
    ? primaryFailed
      ? `https://www.google.com/s2/favicons?domain=${clean}&sz=128`
      : `https://logo.clearbit.com/${clean}`
    : null;

  const showFallback = !clean || (primaryFailed && secondaryFailed);
  const radius =
    rounded === "full"
      ? "rounded-full"
      : rounded === "lg"
        ? "rounded-xl"
        : rounded === "sm"
          ? "rounded"
          : "rounded-lg";

  return (
    <div
      style={{ width: size, height: size }}
      className={clsx(
        "relative shrink-0 overflow-hidden border border-ink-200 bg-ink-100",
        "flex items-center justify-center",
        radius,
        className,
      )}
    >
      {showFallback ? (
        <span
          className="font-display font-semibold text-ink-700"
          style={{ fontSize: Math.max(11, Math.round(size * 0.42)) }}
        >
          {initial}
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src as string}
          alt=""
          width={size}
          height={size}
          className="h-full w-full object-contain"
          onError={() => {
            if (!primaryFailed) setPrimaryFailed(true);
            else setSecondaryFailed(true);
          }}
          referrerPolicy="no-referrer"
        />
      )}
    </div>
  );
}

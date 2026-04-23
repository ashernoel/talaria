"use client";

import clsx from "clsx";
import type {
  CompanyRef,
  PublicResearchDoc,
  ResearchBattleground,
  ResearchMilestone,
  ResearchNote,
  ResearchPersona,
} from "@talaria/shared";

function faviconUrl(domain: string, size = 64): string {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${size}`;
}

export function ResearchView({ doc }: { doc: PublicResearchDoc }) {
  const acquirableCount = doc.battlegrounds.filter((b) => b.status !== "settled").length;
  const strengths = doc.companyStrengths ?? [];
  return (
    <article className="space-y-10">
      <Masthead
        companyName={doc.companyName}
        companyDomain={doc.companyDomain}
        tagline={doc.tagline}
        bottomLine={doc.bottomLine}
        battleCount={doc.battlegrounds.length}
        contestedCount={acquirableCount}
        companyUrl={doc.companyUrl}
      />

      {doc.whyChat?.trim() && (
        <section>
          <SectionHeader title="Why I want to chat" />
          <p className="mt-3 text-base leading-relaxed text-ink-800">{doc.whyChat}</p>
        </section>
      )}

      {strengths.length > 0 && (
        <Section title={`What's great about ${doc.companyName}`}>
          <div className="grid gap-3 md:grid-cols-2">
            {strengths.map((s, i) => (
              <div
                key={i}
                className="rounded-xl border border-ink-200 bg-ink-50 p-4 border-l-4 border-l-accent-400"
              >
                <h3 className="font-display text-sm font-semibold text-ink-900">{s.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-700">{s.body}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {doc.battlegrounds.length > 0 && (
        <Section title="Where the battles are" kicker="Fronts this company competes on">
          <div className="grid gap-4 md:grid-cols-2">
            {doc.battlegrounds.map((b, i) => (
              <BattlegroundCard key={i} bg={b} />
            ))}
          </div>
        </Section>
      )}

      {doc.personas.length > 0 && (
        <Section title="Who uses what, all day" kicker="Buyers and users">
          <div className="grid gap-4 md:grid-cols-2">
            {doc.personas.map((p, i) => (
              <PersonaCard key={i} persona={p} />
            ))}
          </div>
        </Section>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {doc.whitespace.length > 0 && (
          <NotesColumn title="Whitespace" tone="amber" notes={doc.whitespace} />
        )}
        {doc.whyNow.length > 0 && (
          <NotesColumn title="Why now" tone="brand" notes={doc.whyNow} />
        )}
        {doc.milestones.length > 0 && (
          <div>
            <SectionHeader title="Recent milestones" />
            <ul className="mt-3 space-y-2">
              {doc.milestones.map((m, i) => (
                <MilestoneRow key={i} milestone={m} />
              ))}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
}

function Masthead({
  companyName,
  companyDomain,
  tagline,
  bottomLine,
  battleCount,
  contestedCount,
  companyUrl,
}: {
  companyName: string;
  companyDomain: string;
  tagline: string;
  bottomLine: string;
  battleCount: number;
  contestedCount: number;
  companyUrl: string;
}) {
  return (
    <header className="border-b-2 border-accent-400 pb-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          {companyDomain && (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-ink-200 bg-ink-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={faviconUrl(companyDomain, 128)}
                alt={`${companyName} logo`}
                className="h-10 w-10 object-contain"
              />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-400">
              {tagline || "Company research brief"}
            </p>
            <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight text-ink-900">
              {companyName}
            </h1>
            <a
              href={companyUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-1 block font-mono text-[11px] text-ink-500 hover:text-accent-400"
            >
              {companyUrl}
            </a>
          </div>
        </div>
        {battleCount > 0 && (
          <div className="text-right">
            <div className="font-display text-3xl font-semibold text-accent-400">
              {contestedCount}
              <span className="text-base text-ink-500"> / {battleCount}</span>
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-500">
              Contested fronts
            </div>
          </div>
        )}
      </div>
      {bottomLine && (
        <p className="mt-5 border-l-4 border-accent-400 bg-ink-50 p-4 text-base leading-relaxed text-ink-800">
          {bottomLine}
        </p>
      )}
    </header>
  );
}

function Section({
  title,
  kicker,
  children,
}: {
  title: string;
  kicker?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <SectionHeader title={title} kicker={kicker} />
      <div className="mt-4">{children}</div>
    </section>
  );
}

function SectionHeader({ title, kicker }: { title: string; kicker?: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <h2 className="font-display text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-400">
        {title}
      </h2>
      {kicker && (
        <span className="font-mono text-[10px] uppercase tracking-wider text-ink-500">{kicker}</span>
      )}
    </div>
  );
}

const BATTLE_STATUS_STYLE: Record<
  ResearchBattleground["status"],
  { label: string; bar: string; text: string }
> = {
  settled: { label: "SETTLED", bar: "bg-ink-400", text: "text-ink-600" },
  contested: { label: "CONTESTED", bar: "bg-accent-400", text: "text-accent-400" },
  falling: { label: "FALLING", bar: "bg-danger-400", text: "text-danger-400" },
};

function coerceRefs(raw: unknown): CompanyRef[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((x): CompanyRef | null => {
      if (typeof x === "string") {
        const name = x.trim();
        return name ? { name } : null;
      }
      if (x && typeof x === "object" && typeof (x as CompanyRef).name === "string") {
        const r = x as CompanyRef;
        return r.domain ? { name: r.name, domain: r.domain } : { name: r.name };
      }
      return null;
    })
    .filter((x): x is CompanyRef => x !== null);
}

function BattlegroundCard({ bg }: { bg: ResearchBattleground }) {
  const style = BATTLE_STATUS_STYLE[bg.status];
  const incumbents = coerceRefs(bg.incumbents);
  const challengers = coerceRefs(bg.challengers);
  return (
    <div className="overflow-hidden rounded-xl border border-ink-200 bg-ink-50">
      <div className={clsx("h-1 w-full", style.bar)} />
      <div className="p-4">
        <div className="flex items-baseline gap-3">
          <span className={clsx("font-mono text-[10px] font-semibold tracking-[0.15em]", style.text)}>
            {style.label}
          </span>
          <h3 className="flex-1 font-display text-base font-semibold text-ink-900">{bg.title}</h3>
        </div>
        {bg.storyline && (
          <p className="mt-2 text-sm italic leading-relaxed text-ink-600">{bg.storyline}</p>
        )}
        <div className="mt-3 space-y-2">
          <ChipRow label="OWNS" refs={incumbents} tone="muted" />
          <ChipRow label="RISING" refs={challengers} tone="accent" />
        </div>
      </div>
    </div>
  );
}

function ChipRow({
  label,
  refs,
  tone,
}: {
  label: string;
  refs: CompanyRef[];
  tone: "muted" | "accent";
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="w-14 shrink-0 pt-1 font-mono text-[10px] font-semibold tracking-wider text-ink-500">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {refs.length === 0 ? (
          <span className="text-[11px] italic text-ink-500">—</span>
        ) : (
          refs.map((r, i) => (
            <span
              key={i}
              className={clsx(
                "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[11px] font-medium",
                tone === "accent"
                  ? "border-accent-300/50 bg-accent-50/40 text-accent-400"
                  : "border-ink-200 bg-ink-100 text-ink-700",
              )}
            >
              {r.domain && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={faviconUrl(r.domain, 32)}
                  alt=""
                  className="h-3 w-3 object-contain"
                />
              )}
              {r.name}
            </span>
          ))
        )}
      </div>
    </div>
  );
}

function PersonaCard({ persona }: { persona: ResearchPersona }) {
  return (
    <div className="rounded-xl border border-ink-200 bg-ink-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-base font-semibold text-ink-900">{persona.role}</h3>
          <p className="mt-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-accent-400">
            {persona.orgLabel}
          </p>
        </div>
        {persona.estimatedCount > 0 && (
          <span className="shrink-0 rounded-md bg-accent-400 px-2 py-0.5 font-mono text-[11px] font-semibold text-ink-0">
            ~{persona.estimatedCount.toLocaleString()}
          </span>
        )}
      </div>
      {persona.dayInLife && (
        <p className="mt-3 text-sm leading-relaxed text-ink-700">
          <span className="font-semibold text-ink-900">Does. </span>
          {persona.dayInLife}
        </p>
      )}
      {persona.pressure && (
        <p className="mt-1.5 text-sm leading-relaxed text-ink-700">
          <span className="font-semibold text-accent-400">Pressure. </span>
          {persona.pressure}
        </p>
      )}
      {persona.primaryTools.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {persona.primaryTools.slice(0, 8).map((t, i) => (
            <span
              key={i}
              className="rounded-md border border-ink-200 bg-ink-100 px-2 py-0.5 font-mono text-[11px] text-ink-700"
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function NotesColumn({
  title,
  tone,
  notes,
}: {
  title: string;
  tone: "amber" | "brand";
  notes: ResearchNote[];
}) {
  return (
    <div>
      <SectionHeader title={title} />
      <ul className="mt-3 space-y-2">
        {notes.map((n, i) => (
          <li
            key={i}
            className={clsx(
              "border-l-2 pl-3 text-sm leading-relaxed text-ink-700",
              tone === "amber" ? "border-accent-400" : "border-ink-400",
            )}
          >
            <span className="font-semibold text-ink-900">{n.title}. </span>
            {n.body}
          </li>
        ))}
      </ul>
    </div>
  );
}

const MILESTONE_KIND_LABEL: Record<ResearchMilestone["kind"], string> = {
  regulation: "REG",
  funding: "$",
  acquisition: "M&A",
  benchmark: "BNCH",
  launch: "SHIP",
  milestone: "MILE",
};

function MilestoneRow({ milestone }: { milestone: ResearchMilestone }) {
  return (
    <li className="flex items-baseline gap-2 text-sm text-ink-700">
      <span className="w-16 shrink-0 font-mono text-[11px] font-semibold text-accent-400">
        {milestone.date}
      </span>
      <span className="w-12 shrink-0 rounded bg-ink-100 px-1 py-0.5 text-center font-mono text-[10px] font-semibold text-ink-600">
        {MILESTONE_KIND_LABEL[milestone.kind]}
      </span>
      <span className="flex-1 leading-snug">{milestone.title}</span>
    </li>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";

const BODY = `Hi Priya — congrats on closing the $42M round last month. I saw the piece on your pilot with Maersk, and the 23% dwell-time reduction caught my eye given how much capex we're seeing flow into automated handling.

I lead logistics at Insight. Would love to learn how you're thinking about the next 18 months — specifically whether the yard-scheduling layer sits inside the core product or spins out.

If useful, I can share what we're hearing from three other ports in Northern Europe.`;

type Citation = { n: string; label: string; source: string; trigger: number };

const CITATIONS: Citation[] = [
  { n: "01", label: "$42M Series B announcement", source: "press release, Mar 2026", trigger: 60 },
  { n: "02", label: "Maersk pilot case study", source: "/customers/maersk", trigger: 165 },
  { n: "03", label: "Yard-scheduling roadmap hint", source: "careers page, SRE listing", trigger: 340 },
];

const SUBJECT = "Your Series B and the warehouse-density problem";

export default function LandingPage() {
  const { state } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (state.status === "signed-in") router.replace("/draft");
  }, [state, router]);

  const [phase, setPhase] = useState<"idle" | "fetching" | "typing" | "done">("idle");
  const [fetchStep, setFetchStep] = useState(0);
  const [typed, setTyped] = useState("");
  const [subjectTyped, setSubjectTyped] = useState("");
  const [voice, setVoice] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const activeCitations = useMemo(() => {
    if (phase === "idle" || phase === "fetching") return 0;
    return CITATIONS.filter((c) => typed.length >= c.trigger).length;
  }, [typed, phase]);

  useEffect(() => {
    const t = (ms: number, fn: () => void) => {
      const h = setTimeout(fn, ms);
      timers.current.push(h);
      return h;
    };

    const run = () => {
      setPhase("fetching");
      setFetchStep(0);
      setTyped("");
      setSubjectTyped("");
      setVoice(0);

      t(600, () => setFetchStep(1));
      t(1200, () => setFetchStep(2));
      t(1800, () => setFetchStep(3));
      t(2300, () => setPhase("typing"));

      SUBJECT.split("").forEach((_, i) => {
        t(2300 + i * 22, () => setSubjectTyped(SUBJECT.slice(0, i + 1)));
      });
      const afterSubject = 2300 + SUBJECT.length * 22 + 350;

      BODY.split("").forEach((_, i) => {
        t(afterSubject + i * 14, () => setTyped(BODY.slice(0, i + 1)));
      });
      const afterBody = afterSubject + BODY.length * 14;

      const voiceStart = afterBody + 250;
      const steps = 34;
      for (let i = 1; i <= steps; i++) {
        t(voiceStart + i * 22, () => setVoice((i / steps) * 0.86));
      }

      t(voiceStart + steps * 22 + 200, () => setPhase("done"));
      t(voiceStart + steps * 22 + 4200, () => run());
    };

    run();
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, []);

  const cursorOn = phase === "typing" || phase === "fetching";

  return (
    <>
      <style>{`html,body{background:#0B0C0E !important;background-image:none !important;color:#EDEBE6 !important}`}</style>
      <main
        className="relative mx-auto flex min-h-screen max-w-[1440px] flex-col"
        style={{ color: "#EDEBE6" }}
      >
        <div style={{ height: 1, backgroundColor: "#E8A550" }} />

        <div
          className="flex items-center justify-between px-10"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#9B978E",
            height: 44,
            borderBottom: "1px solid #1A1B1F",
          }}
        >
          <div className="flex items-center gap-6">
            <span style={{ color: "#EDEBE6", letterSpacing: "0.26em" }}>TALARIA</span>
            <span style={{ color: "#4A4C51" }}>|</span>
            <span>OUTREACH · RESEARCH INSTRUMENT</span>
          </div>
          <div className="flex items-center gap-6">
            <span>v1.0.0</span>
            <span style={{ color: "#4A4C51" }}>·</span>
            <span>PRIVATE BETA</span>
            <span style={{ color: "#4A4C51" }}>·</span>
            <span style={{ color: "#E8A550" }}>
              <span
                className="inline-block mr-1.5 rounded-full align-middle"
                style={{
                  width: 6,
                  height: 6,
                  backgroundColor: "#E8A550",
                  boxShadow: "0 0 8px #E8A550",
                  animation: "pulse 1.8s ease-in-out infinite",
                }}
              />
              LIVE
            </span>
          </div>
        </div>

        <section
          className="grid flex-1 items-center"
          style={{ gridTemplateColumns: "1.05fr 1.25fr", gap: 72, padding: "72px 56px" }}
        >
          <div className="flex flex-col gap-8">
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "#E8A550",
              }}
            >
              § 01 — Compile
            </div>
            <h1
              style={{
                fontFamily: "var(--font-inter)",
                fontWeight: 500,
                fontSize: "clamp(48px, 5.2vw, 76px)",
                lineHeight: 0.98,
                letterSpacing: "-0.035em",
                color: "#F4F2ED",
              }}
            >
              Instant email
              <br />
              credibility,
              <br />
              <span style={{ color: "#E8A550", fontStyle: "italic", fontWeight: 400 }}>in your voice.</span>
            </h1>
            <div
              className="flex items-center gap-3"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.26em",
                textTransform: "uppercase",
                color: "#E8A550",
                marginTop: -8,
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 22,
                  height: 1,
                  backgroundColor: "#E8A550",
                }}
              />
              <span>Break through the noise</span>
            </div>
            <p
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: 17,
                lineHeight: 1.55,
                color: "#B8B4AC",
                maxWidth: "48ch",
                fontWeight: 400,
              }}
            >
              Paste a company URL. Get an email you&apos;d actually send — grounded in the entire
              internet, not just their site — plus a brief love letter and market report, written
              the way <span style={{ color: "#EDEBE6" }}>you</span> write.
            </p>

            <div className="mt-2 flex flex-col gap-4" style={{ maxWidth: 420 }}>
              <Link
                href="/login"
                className="group flex items-center justify-between"
                style={{
                  padding: "18px 22px",
                  border: "1px solid #E8A550",
                  backgroundColor: "rgba(232,165,80,0.07)",
                  color: "#F4F2ED",
                  textDecoration: "none",
                  fontFamily: "var(--font-inter)",
                  fontSize: 15,
                  fontWeight: 500,
                  letterSpacing: "0.005em",
                  borderRadius: 2,
                }}
              >
                <span className="inline-flex items-center gap-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
                    <path fill="#E8A550" d="M21.35 11.1H12v2.9h5.35c-.23 1.4-1.62 4.1-5.35 4.1-3.22 0-5.84-2.66-5.84-5.95s2.62-5.95 5.84-5.95c1.83 0 3.06.78 3.76 1.45l2.57-2.47C16.82 3.6 14.64 2.6 12 2.6 6.92 2.6 2.8 6.72 2.8 11.8c0 5.08 4.12 9.2 9.2 9.2 5.31 0 8.83-3.73 8.83-8.98 0-.6-.06-1.06-.15-1.52Z" />
                  </svg>
                  <span>Continue with Google</span>
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#E8A550" }}>⏎</span>
              </Link>
              <div
                className="flex items-center gap-2"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10.5,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#6B6860",
                }}
              >
                <span>⚿ ENCRYPTED</span>
                <span>·</span>
                <span>EMAILS STAY IN YOUR FIREBASE PROJECT</span>
              </div>
            </div>
          </div>

          <div
            className="relative flex flex-col"
            style={{
              border: "1px solid #1F2024",
              backgroundColor: "#0F1013",
              borderRadius: 4,
              boxShadow: "0 40px 60px -30px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,0.02)",
              minHeight: 580,
            }}
          >
            <div
              className="flex items-center justify-between px-4"
              style={{
                height: 36,
                borderBottom: "1px solid #1F2024",
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#6B6860",
              }}
            >
              <div className="flex items-center gap-2">
                <span className="inline-block rounded-full" style={{ width: 8, height: 8, backgroundColor: "#FF5F56" }} />
                <span className="inline-block rounded-full" style={{ width: 8, height: 8, backgroundColor: "#FFBD2E" }} />
                <span className="inline-block rounded-full" style={{ width: 8, height: 8, backgroundColor: "#27C93F" }} />
                <span className="ml-3">COMPILE · acme-robotics.com</span>
                <span
                  style={{
                    marginLeft: 10,
                    fontSize: 9,
                    color: "#27C93F",
                    border: "1px solid #1e3a22",
                    backgroundColor: "rgba(39,201,63,0.08)",
                    padding: "2px 6px",
                    letterSpacing: "0.18em",
                  }}
                >
                  GROUNDED
                </span>
              </div>
              <span>
                {phase === "fetching" ? "analyzing…" : phase === "typing" ? "compiling…" : "0.42 s · OPUS 4.7"}
              </span>
            </div>

            <div className="px-5 py-4" style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#9B978E" }}>
              <div
                style={{
                  color: "#6B6860",
                  fontSize: 10,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                INPUT
              </div>
              <div style={{ color: "#E8A550" }}>$ talaria compile https://acme-robotics.com</div>
              <div className="mt-2" style={{ color: "#6B6860", minHeight: 18 }}>
                {fetchStep >= 1 && <span>↳ fetching ssr, 14.2kb </span>}
                {fetchStep >= 2 && <span style={{ color: "#27C93F" }}>ok</span>}
                {fetchStep >= 2 && <span style={{ color: "#6B6860" }}> · parsing press, careers, customers</span>}
                {fetchStep >= 3 && <span style={{ color: "#27C93F" }}> · ok</span>}
              </div>
            </div>

            <div style={{ height: 1, backgroundColor: "#1F2024" }} />

            <div className="flex-1 px-5 py-5" style={{ fontFamily: "var(--font-inter)" }}>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#6B6860",
                  marginBottom: 14,
                }}
              >
                SUBJECT
              </div>
              <div
                style={{
                  fontSize: 17,
                  color: "#F4F2ED",
                  fontWeight: 500,
                  letterSpacing: "-0.015em",
                  marginBottom: 22,
                  minHeight: 24,
                }}
              >
                {subjectTyped}
                {phase === "typing" && subjectTyped.length < SUBJECT.length && <Caret />}
              </div>

              <div
                style={{
                  fontSize: 14.5,
                  color: "#C9C5BC",
                  lineHeight: 1.7,
                  whiteSpace: "pre-wrap",
                  minHeight: 220,
                }}
              >
                {typed}
                {cursorOn && subjectTyped.length === SUBJECT.length && typed.length < BODY.length && <Caret />}
              </div>
            </div>

            <div style={{ height: 1, backgroundColor: "#1F2024" }} />

            <div className="px-5 py-4">
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#6B6860",
                  marginBottom: 10,
                }}
              >
                CITATIONS
              </div>
              <div className="flex flex-col gap-2">
                {CITATIONS.map((c, i) => {
                  const live = i < activeCitations;
                  return (
                    <div
                      key={c.n}
                      className="flex items-baseline gap-3"
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 12,
                        opacity: live ? 1 : 0.18,
                        transform: live ? "translateY(0)" : "translateY(2px)",
                        transition: "opacity 320ms ease, transform 320ms ease",
                      }}
                    >
                      <span style={{ color: "#E8A550", width: 22, display: "inline-block" }}>{c.n}</span>
                      <span style={{ color: "#C9C5BC" }}>{c.label}</span>
                      <span style={{ color: "#6B6860" }}>· {c.source}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ height: 1, backgroundColor: "#1F2024" }} />

            <div
              className="flex items-center justify-between px-5"
              style={{
                height: 54,
                fontFamily: "var(--font-mono)",
                fontSize: 10.5,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#6B6860",
              }}
            >
              <div className="flex items-center gap-3">
                <span>STYLE MATCH</span>
                <span
                  style={{
                    fontSize: 18,
                    letterSpacing: "0",
                    color: "#F4F2ED",
                    textTransform: "none",
                    fontFeatureSettings: '"tnum" 1',
                  }}
                >
                  {voice.toFixed(2)}
                </span>
                <span
                  className="inline-block"
                  style={{ width: 96, height: 4, backgroundColor: "#1F2024", position: "relative" }}
                >
                  <span
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: `${(voice / 0.86) * 100}%`,
                      backgroundColor: "#E8A550",
                      transition: "width 80ms linear",
                    }}
                  />
                </span>
                <span style={{ color: "#6B6860", textTransform: "none", letterSpacing: "0.02em" }}>
                  close-range · last 14 sent
                </span>
              </div>
              <div className="flex gap-4">
                <span>[A]PPROVE</span>
                <span>[E]DIT</span>
                <span>[R]EGENERATE</span>
              </div>
            </div>
          </div>
        </section>

        <ResearchShowcase />

        <div
          className="flex items-center justify-between px-10"
          style={{
            height: 44,
            borderTop: "1px solid #1A1B1F",
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#6B6860",
          }}
        >
          <div>NYC · INSIGHT PARTNERS</div>
          <div className="flex gap-6">
            <span>PRIVACY</span>
            <span>CHANGELOG</span>
            <span>
              STATUS · <span style={{ color: "#27C93F" }}>OPERATIONAL</span>
            </span>
          </div>
          <div>© MMXXVI</div>
        </div>

        <style>{`
          @keyframes blink { 50% { opacity: 0; } }
          @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: .35; } }
          ::selection { background-color: rgba(232,165,80,.25); color: #F4F2ED; }
        `}</style>
      </main>
    </>
  );
}

function Caret() {
  return (
    <span
      className="inline-block align-[-1px] ml-[2px]"
      style={{ width: 7, height: 14, backgroundColor: "#E8A550", animation: "blink 1.05s steps(2) infinite" }}
    />
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   § 02 — Research
   Animated mock of a gridbottlenecks.fyi/research-style landscape site.
   ──────────────────────────────────────────────────────────────────────────── */

type Rising = { name: string; glyph: "↑" | "↑↑" };
type Battleground = {
  status: "CONTESTED" | "FALLING" | "SETTLED";
  title: string;
  owns: string[];
  rising: Rising[];
};

const BATTLEGROUNDS: Battleground[] = [
  {
    status: "CONTESTED",
    title: "Real-time yard optimization",
    owns: ["Stackyard", "MarinePlan"],
    rising: [
      { name: "Portstream", glyph: "↑↑" },
      { name: "Harbour", glyph: "↑" },
    ],
  },
  {
    status: "FALLING",
    title: "Gate-appointment operations",
    owns: ["Spreadsheets + email"],
    rising: [
      { name: "DockPilot", glyph: "↑↑" },
      { name: "Laneloop", glyph: "↑" },
    ],
  },
  {
    status: "CONTESTED",
    title: "Crane dispatch & slotting",
    owns: ["KranOS", "Quayware"],
    rising: [{ name: "Liftgrid", glyph: "↑" }],
  },
];

const STATUS_COLOR: Record<Battleground["status"], { fg: string; bd: string }> = {
  CONTESTED: { fg: "#6FB4D4", bd: "#1d3d4f" },
  FALLING: { fg: "#D4A150", bd: "#3d2f1a" },
  SETTLED: { fg: "#9B978E", bd: "#2A2C32" },
};

const QUADS = [
  { label: "↑ RISING · NARROW", sub: "Challengers to watch", color: "#27C93F", dots: 3 },
  { label: "↑ RISING · BROAD", sub: "Incumbents with momentum", color: "#6FB4D4", dots: 2 },
  { label: "→ STABLE · NARROW", sub: "Niches + at-risk", color: "#6B6860", dots: 4 },
  { label: "→ STABLE · BROAD", sub: "Sleeping giants", color: "#D4A150", dots: 2 },
];

const ALLOCATION = [
  { label: "Manifest intake", pct: 22 },
  { label: "Live slotting runs", pct: 34 },
  { label: "Exception handling", pct: 18 },
  { label: "Shift handoff + audit", pct: 26 },
];

const SECTORS = [
  { label: "YARD AUTOMATION", active: true },
  { label: "DOCK SCHEDULING" },
  { label: "CRANE TELEMATICS" },
  { label: "CUSTOMS + CLEARANCE" },
  { label: "COLD-CHAIN VISIBILITY" },
];

function ResearchShowcase() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setPlay(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.18 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={play ? "rs-play" : ""}
      style={{
        padding: "96px 56px 72px",
        borderTop: "1px solid #1A1B1F",
        position: "relative",
        backgroundImage:
          "radial-gradient(ellipse 70% 60% at 12% 40%, rgba(232,165,80,0.045), transparent 60%)," +
          "linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px)," +
          "linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)",
        backgroundSize: "auto, 48px 48px, 48px 48px",
        backgroundPosition: "0 0, 0 0, 0 0",
      }}
    >
      {/* Editorial header band — full width, not side-by-side */}
      <div
        className="flex items-end justify-between gap-12 flex-wrap"
        style={{ marginBottom: 40 }}
      >
        <div className="flex flex-col gap-6" style={{ flex: "1 1 560px" }}>
          <div
            className="flex items-center gap-3"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: "#9B978E",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 28,
                height: 1,
                backgroundColor: "#9B978E",
              }}
            />
            <span>Exhibit B &mdash; § 02 / Research</span>
          </div>
          <h2
            style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 400,
              fontSize: "clamp(34px, 3.6vw, 52px)",
              lineHeight: 1.08,
              letterSpacing: "-0.01em",
              color: "#F4F2ED",
              textTransform: "uppercase",
              maxWidth: "22ch",
            }}
          >
            Shown,
            <br />
            <span style={{ color: "#E8A550" }}>not told.</span>
          </h2>
        </div>

        <p
          style={{
            flex: "0 1 420px",
            fontFamily: "var(--font-inter)",
            fontSize: 15,
            lineHeight: 1.6,
            color: "#B8B4AC",
            fontWeight: 400,
            borderLeft: "1px solid #2A2C32",
            paddingLeft: 22,
          }}
        >
          Point Talaria at a sector. It renders a live site{" "}
          <span style={{ color: "#EDEBE6" }}>or</span> a polished PDF — battlegrounds,
          positioning, where the hours actually go. The kind of artifact that shows a founder,
          partner, or LP you&apos;ve already read the room.
        </p>
      </div>

      {/* Divider with doc-metadata */}
      <div
        className="flex items-center justify-between"
        style={{
          borderTop: "1px solid #2A2C32",
          borderBottom: "1px solid #2A2C32",
          padding: "10px 0",
          marginBottom: 32,
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "#6B6860",
        }}
      >
        <span>FIG. 02 &nbsp;·&nbsp; Site + PDF specimen</span>
        <span className="flex items-center gap-6">
          <span>BUILT IN 4 MIN</span>
          <span style={{ color: "#2A2C32" }}>|</span>
          <span>52 TOOLS MAPPED</span>
          <span style={{ color: "#2A2C32" }}>|</span>
          <span style={{ color: "#27C93F" }}>READY TO SHARE</span>
        </span>
      </div>

      {/* Full-width dashboard */}
      <div>
        <div
          className="relative flex flex-col"
          style={{
            border: "1px solid #1F2024",
            backgroundColor: "#0F1013",
            borderRadius: 2,
            boxShadow: "0 40px 80px -40px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,0.02)",
            minHeight: 620,
            overflow: "hidden",
          }}
        >
          {/* Chrome — report header, no traffic lights */}
          <div
            className="flex items-center justify-between px-5"
            style={{
              height: 38,
              borderBottom: "1px solid #1F2024",
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#6B6860",
              position: "relative",
              zIndex: 2,
              background:
                "linear-gradient(180deg, rgba(232,165,80,0.03), transparent)",
            }}
          >
            <div className="flex items-center gap-3">
              <span
                style={{
                  display: "inline-block",
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: "#E8A550",
                  boxShadow: "0 0 6px #E8A550",
                }}
              />
              <span style={{ color: "#EDEBE6", letterSpacing: "0.26em" }}>
                REPORT &nbsp;/&nbsp; YARD-AUTOMATION
              </span>
              <span style={{ color: "#2A2C32" }}>·</span>
              <span>rendered 14:32 UTC</span>
              <span style={{ color: "#2A2C32" }}>·</span>
              <span>v.07</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                style={{
                  padding: "3px 9px",
                  border: "1px solid #E8A550",
                  backgroundColor: "rgba(232,165,80,0.1)",
                  color: "#F4F2ED",
                  letterSpacing: "0.22em",
                  fontSize: 9.5,
                }}
              >
                SITE
              </span>
              <span style={{ color: "#2A2C32", fontSize: 9 }}>/</span>
              <span
                style={{
                  padding: "3px 9px",
                  border: "1px dashed #2A2C32",
                  color: "#6B6860",
                  letterSpacing: "0.22em",
                  fontSize: 9.5,
                }}
              >
                PDF
              </span>
            </div>
          </div>

          {/* Scan line */}
          <div className="rs-scan" aria-hidden />

          {/* Sector pills */}
          <div className="px-5 py-3 flex gap-1.5 flex-wrap">
            {SECTORS.map((p, i) => (
              <span
                key={p.label}
                className="rs-fade"
                style={{
                  padding: "3px 8px",
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  border: `1px ${p.active ? "solid #E8A550" : "dashed #2A2C32"}`,
                  color: p.active ? "#F4F2ED" : "#6B6860",
                  background: p.active ? "rgba(232,165,80,0.08)" : "transparent",
                  borderRadius: 3,
                  animationDelay: `${80 + i * 80}ms`,
                }}
              >
                {p.label}
              </span>
            ))}
          </div>

          <div style={{ height: 1, backgroundColor: "#1F2024" }} />

          {/* Battlegrounds */}
          <div className="px-5 py-4">
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#6B6860",
                marginBottom: 10,
              }}
            >
              WHERE THE BATTLES ARE
            </div>
            <div className="flex flex-col gap-2">
              {BATTLEGROUNDS.map((b, i) => {
                const sc = STATUS_COLOR[b.status];
                return (
                  <div
                    key={b.title}
                    className="rs-fade"
                    style={{
                      padding: "10px 12px",
                      background: "#131418",
                      border: "1px solid #1F2024",
                      borderRadius: 3,
                      animationDelay: `${500 + i * 180}ms`,
                    }}
                  >
                    <div className="flex items-baseline gap-2 mb-2 flex-wrap">
                      <span
                        style={{
                          fontSize: 9,
                          color: sc.fg,
                          letterSpacing: "0.18em",
                          fontFamily: "var(--font-mono)",
                          padding: "2px 6px",
                          border: `1px solid ${sc.bd}`,
                        }}
                      >
                        {b.status}
                      </span>
                      <span
                        style={{
                          fontSize: 12.5,
                          color: "#F4F2ED",
                          fontWeight: 500,
                          fontFamily: "var(--font-inter)",
                        }}
                      >
                        {b.title}
                      </span>
                    </div>
                    <div
                      className="flex items-baseline gap-2 mb-1"
                      style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}
                    >
                      <span style={{ color: "#6B6860", width: 52, display: "inline-block" }}>
                        Owns:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {b.owns.map((name, ci) => (
                          <span
                            key={name}
                            className="rs-chip"
                            style={{
                              padding: "1px 6px",
                              borderRadius: 2,
                              background: "rgba(155,151,142,0.08)",
                              color: "#C9C5BC",
                              animationDelay: `${600 + i * 180 + ci * 70}ms`,
                            }}
                          >
                            → {name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div
                      className="flex items-baseline gap-2"
                      style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}
                    >
                      <span style={{ color: "#6B6860", width: 52, display: "inline-block" }}>
                        Rising:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {b.rising.map((r, ci) => (
                          <span
                            key={r.name}
                            className="rs-chip"
                            style={{
                              padding: "1px 6px",
                              borderRadius: 2,
                              background: "rgba(39,201,63,0.08)",
                              color: "#C9E5C2",
                              animationDelay: `${700 + i * 180 + ci * 70}ms`,
                            }}
                          >
                            <span
                              className={r.glyph === "↑↑" ? "rs-glyph-fast" : "rs-glyph"}
                              style={{
                                color: r.glyph === "↑↑" ? "#27C93F" : "#6FB4D4",
                                fontWeight: 700,
                                marginRight: 3,
                              }}
                            >
                              {r.glyph}
                            </span>
                            {r.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ height: 1, backgroundColor: "#1F2024" }} />

          {/* Positioning matrix */}
          <div className="px-5 py-4">
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#6B6860",
                marginBottom: 10,
              }}
            >
              POSITIONING · FOOTPRINT × MOMENTUM
            </div>
            <div
              className="grid grid-cols-2"
              style={{ border: "1px solid #1F2024", borderRadius: 3 }}
            >
              {QUADS.map((q, qi) => (
                <div
                  key={q.label}
                  style={{
                    padding: "10px 12px",
                    borderLeft: qi % 2 === 1 ? "1px solid #1F2024" : undefined,
                    borderTop: qi >= 2 ? "1px solid #1F2024" : undefined,
                    minHeight: 62,
                  }}
                >
                  <div
                    style={{
                      fontSize: 9.5,
                      color: q.color,
                      fontFamily: "var(--font-mono)",
                      letterSpacing: "0.14em",
                    }}
                  >
                    {q.label}
                  </div>
                  <div
                    style={{
                      fontSize: 9,
                      color: "#4A4C51",
                      fontFamily: "var(--font-mono)",
                      marginBottom: 8,
                      letterSpacing: "0.02em",
                    }}
                  >
                    {q.sub} · {q.dots}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {Array.from({ length: q.dots }).map((_, di) => (
                      <span
                        key={di}
                        className="rs-dot"
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: q.color,
                          boxShadow: `0 0 6px ${q.color}`,
                          display: "inline-block",
                          animationDelay: `${1200 + qi * 90 + di * 70}ms`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div
              className="flex justify-between mt-1"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                color: "#4A4C51",
                letterSpacing: "0.1em",
              }}
            >
              <span>← narrow · broad →</span>
              <span>top = rising · bottom = stable</span>
            </div>
          </div>

          <div style={{ height: 1, backgroundColor: "#1F2024" }} />

          {/* Time allocation */}
          <div className="px-5 py-4">
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#6B6860",
                marginBottom: 10,
              }}
            >
              WHERE THE HOURS GO
            </div>
            <div className="flex flex-col gap-1.5">
              {ALLOCATION.map((a, i) => (
                <div
                  key={a.label}
                  className="flex items-center gap-2"
                  style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}
                >
                  <div style={{ width: 128, color: "#C9C5BC" }}>{a.label}</div>
                  <div
                    className="flex-1 relative"
                    style={{
                      height: 14,
                      background: "#131418",
                      border: "1px solid #1F2024",
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      className="rs-bar"
                      style={{
                        ["--w" as string]: `${a.pct}%`,
                        height: "100%",
                        background:
                          "linear-gradient(90deg, rgba(232,165,80,0.55), rgba(232,165,80,0.28))",
                        animationDelay: `${1700 + i * 110}ms`,
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        padding: "0 7px",
                        fontSize: 10,
                        color: "#F4F2ED",
                        fontWeight: 600,
                        letterSpacing: "0.02em",
                      }}
                    >
                      {a.pct}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes rsFadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: none; }
        }
        @keyframes rsPop {
          0%   { opacity: 0; transform: scale(0.3); }
          70%  { opacity: 1; transform: scale(1.2); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes rsBar {
          from { width: 0; }
          to   { width: var(--w); }
        }
        @keyframes rsScan {
          0%   { top: 36px; opacity: 0; }
          6%   { opacity: 0.9; }
          94%  { opacity: 0.9; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes rsGlyph {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-1.5px); }
        }
        @keyframes rsGlyphFast {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50%      { transform: translateY(-2px); opacity: 0.7; }
        }
        .rs-fade { opacity: 0; }
        .rs-chip { display: inline-block; opacity: 0; }
        .rs-dot  { opacity: 0; transform: scale(0); }
        .rs-bar  { width: 0; }
        .rs-glyph, .rs-glyph-fast { display: inline-block; }
        .rs-scan {
          position: absolute;
          left: 0;
          right: 0;
          top: 36px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(232,165,80,0.6), transparent);
          pointer-events: none;
          opacity: 0;
          z-index: 1;
        }
        .rs-play .rs-fade {
          animation: rsFadeUp 560ms cubic-bezier(.2,.8,.2,1) both;
        }
        .rs-play .rs-chip {
          animation: rsFadeUp 440ms cubic-bezier(.2,.8,.2,1) both;
        }
        .rs-play .rs-dot {
          animation: rsPop 560ms cubic-bezier(.2,.8,.2,1) both;
        }
        .rs-play .rs-bar {
          animation: rsBar 820ms cubic-bezier(.2,.8,.2,1) both;
        }
        .rs-play .rs-glyph {
          animation: rsGlyph 2s ease-in-out infinite;
        }
        .rs-play .rs-glyph-fast {
          animation: rsGlyphFast 1.2s ease-in-out infinite;
        }
        .rs-play .rs-scan {
          animation: rsScan 4.8s ease-in-out 2s infinite;
        }
      `}</style>
    </section>
  );
}

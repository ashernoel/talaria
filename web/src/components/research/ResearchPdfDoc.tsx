import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type {
  CompanyRef,
  ResearchBattleground,
  ResearchDoc,
  ResearchMilestone,
  ResearchPersona,
} from "@talaria/shared";

const C = {
  ink: "#0b1220",
  inkSoft: "#1e293b",
  inkMuted: "#475569",
  inkDim: "#94a3b8",
  rule: "#cbd5e1",
  ruleSoft: "#e2e8f0",
  bg: "#ffffff",
  bgSoft: "#f8fafc",

  brand: "#0c4a6e",
  brandInk: "#ffffff",

  acq: "#d97706",
  acqInk: "#7c2d12",
  acqBg: "#fef3c7",
  acqSoft: "#fff7ed",
  acqBorder: "#f59e0b",

  contestedBar: "#0891b2",
  fallingBar: "#d97706",
  settledBar: "#94a3b8",
};

const BATTLE_BAR: Record<ResearchBattleground["status"], string> = {
  settled: C.settledBar,
  contested: C.contestedBar,
  falling: C.fallingBar,
};
const BATTLE_LABEL: Record<ResearchBattleground["status"], string> = {
  settled: "SETTLED",
  contested: "CONTESTED",
  falling: "FALLING",
};
const BATTLE_TEXT: Record<ResearchBattleground["status"], string> = {
  settled: C.inkMuted,
  contested: C.contestedBar,
  falling: C.fallingBar,
};

const MILESTONE_KIND_LABEL: Record<ResearchMilestone["kind"], string> = {
  regulation: "REG",
  funding: "$",
  acquisition: "M&A",
  benchmark: "BNCH",
  launch: "SHIP",
  milestone: "MILE",
};

const s = StyleSheet.create({
  page: {
    backgroundColor: C.bg,
    color: C.ink,
    paddingTop: 28,
    paddingBottom: 24,
    paddingHorizontal: 28,
    fontSize: 8,
    fontFamily: "Helvetica",
    lineHeight: 1.35,
  },

  masthead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: C.brand,
  },
  mastheadL: { flex: 1 },
  mastheadKicker: {
    fontSize: 7,
    color: C.acq,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1.6,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  mastheadTitle: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: C.ink,
    lineHeight: 1.05,
    letterSpacing: -0.6,
  },
  mastheadUrl: {
    fontSize: 7,
    color: C.inkDim,
    marginTop: 2,
    fontFamily: "Courier",
    letterSpacing: 0.2,
  },
  mastheadR: {
    alignItems: "flex-end",
    paddingLeft: 16,
  },
  mastheadStatN: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: C.acq,
    letterSpacing: -0.4,
    lineHeight: 1,
  },
  mastheadStatLabel: {
    fontSize: 6.5,
    color: C.inkMuted,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginTop: 1,
  },

  miniHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: C.brand,
  },
  miniHeadL: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: C.brand,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  miniHeadR: {
    fontSize: 7,
    color: C.inkDim,
    fontFamily: "Courier",
  },

  whyChat: {
    fontSize: 8.5,
    lineHeight: 1.45,
    color: C.inkSoft,
    backgroundColor: C.acqSoft,
    padding: 7,
    borderLeftWidth: 3,
    borderLeftColor: C.acq,
    marginBottom: 6,
  },
  whyChatKicker: {
    fontSize: 6.5,
    fontFamily: "Helvetica-Bold",
    color: C.acq,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 2,
  },

  bottomLine: {
    fontSize: 8.5,
    lineHeight: 1.45,
    color: C.inkSoft,
    backgroundColor: C.bgSoft,
    padding: 7,
    borderLeftWidth: 3,
    borderLeftColor: C.brand,
    marginBottom: 8,
  },
  bottomLineKicker: {
    fontSize: 6.5,
    fontFamily: "Helvetica-Bold",
    color: C.brand,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 2,
  },

  h2: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: C.brand,
    marginTop: 4,
    marginBottom: 4,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },

  twoCol: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  twoColCell: { width: "49%" },

  strengthCard: {
    padding: 6,
    marginBottom: 5,
    backgroundColor: C.bgSoft,
    borderLeftWidth: 2,
    borderLeftColor: C.acq,
  },
  strengthTitle: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: C.ink,
    marginBottom: 2,
    lineHeight: 1.2,
  },
  strengthBody: {
    fontSize: 7.5,
    color: C.inkSoft,
    lineHeight: 1.4,
  },

  bgCard: {
    padding: 6,
    marginBottom: 5,
    backgroundColor: C.bg,
    borderWidth: 0.5,
    borderColor: C.rule,
    borderTopWidth: 2,
  },
  bgHead: { flexDirection: "row", alignItems: "baseline", marginBottom: 2 },
  bgStatusLabel: {
    fontSize: 6,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
    marginRight: 5,
  },
  bgTitle: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: C.ink,
    flex: 1,
    lineHeight: 1.2,
  },
  bgRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 2,
  },
  bgRowLabel: {
    width: 28,
    fontSize: 6,
    fontFamily: "Helvetica-Bold",
    color: C.inkDim,
    letterSpacing: 0.4,
    paddingTop: 2,
  },
  bgRowChips: { flex: 1, flexDirection: "row", flexWrap: "wrap" },
  bgStoryline: {
    marginTop: 3,
    fontSize: 7.5,
    color: C.inkMuted,
    lineHeight: 1.4,
    fontStyle: "italic",
  },

  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginRight: 3,
    marginBottom: 2,
    borderWidth: 0.5,
  },
  chipText: { fontSize: 7, fontFamily: "Helvetica-Bold" },

  pCard: {
    padding: 6,
    marginBottom: 5,
    backgroundColor: C.bgSoft,
    borderTopWidth: 2,
    borderTopColor: C.brand,
    borderRightWidth: 0.5,
    borderRightColor: C.rule,
    borderBottomWidth: 0.5,
    borderBottomColor: C.rule,
    borderLeftWidth: 0.5,
    borderLeftColor: C.rule,
  },
  pHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 3,
  },
  pName: { fontSize: 9, fontFamily: "Helvetica-Bold", color: C.ink, lineHeight: 1.15 },
  pOrg: {
    fontSize: 6.5,
    color: C.brand,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.4,
    textTransform: "uppercase",
    marginTop: 1,
  },
  pBadge: {
    backgroundColor: C.brand,
    color: C.brandInk,
    paddingHorizontal: 4,
    paddingVertical: 1,
    fontSize: 6.5,
    fontFamily: "Helvetica-Bold",
  },
  pField: { fontSize: 7.5, color: C.inkSoft, marginBottom: 2, lineHeight: 1.35 },
  pLabel: { fontFamily: "Helvetica-Bold", color: C.ink },
  pPressure: { fontFamily: "Helvetica-Bold", color: C.acq },

  bottomStrip: {
    flexDirection: "row",
    gap: 6,
    marginTop: 6,
  },
  bottomStripCol: { flex: 1 },

  noteItem: {
    fontSize: 7.5,
    color: C.inkSoft,
    lineHeight: 1.4,
    marginBottom: 3,
    paddingLeft: 6,
    borderLeftWidth: 2,
    borderLeftColor: C.acq,
  },
  noteItemNeutral: {
    fontSize: 7.5,
    color: C.inkSoft,
    lineHeight: 1.4,
    marginBottom: 3,
    paddingLeft: 6,
    borderLeftWidth: 2,
    borderLeftColor: C.brand,
  },
  noteTitle: { fontFamily: "Helvetica-Bold", color: C.ink },

  mileRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 2,
  },
  mileDate: {
    width: 36,
    fontSize: 7,
    color: C.brand,
    fontFamily: "Helvetica-Bold",
  },
  mileKind: {
    width: 28,
    fontSize: 6,
    color: C.inkDim,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.3,
  },
  mileTitle: {
    fontSize: 7.5,
    color: C.ink,
    fontFamily: "Helvetica-Bold",
    flex: 1,
    lineHeight: 1.3,
  },

  footer: {
    position: "absolute",
    left: 28,
    right: 28,
    bottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 6.5,
    color: C.inkDim,
    letterSpacing: 0.4,
  },
});

function todayStr(): string {
  const d = new Date();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function formatMilestoneDate(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2}|Q\d)$/);
  if (!m) return iso;
  const [, year, part] = m;
  const yy = year.slice(2);
  if (part.startsWith("Q")) return `${part} '${yy}`;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const mi = parseInt(part, 10);
  return mi >= 1 && mi <= 12 ? `${months[mi - 1]} '${yy}` : iso;
}

function ChipRef({ company, accent }: { company: CompanyRef; accent?: boolean }) {
  const bg = accent ? C.acqBg : C.bgSoft;
  const border = accent ? C.acqBorder : C.ruleSoft;
  const color = accent ? C.acqInk : C.inkSoft;
  return (
    <View style={[s.chip, { backgroundColor: bg, borderColor: border }]} wrap={false}>
      <Text style={[s.chipText, { color }]}>{company.name}</Text>
    </View>
  );
}

function BattlegroundCard({ bg }: { bg: ResearchBattleground }) {
  const bar = BATTLE_BAR[bg.status];
  return (
    <View style={[s.bgCard, { borderTopColor: bar }]} wrap={false}>
      <View style={s.bgHead}>
        <Text style={[s.bgStatusLabel, { color: BATTLE_TEXT[bg.status] }]}>
          {BATTLE_LABEL[bg.status]}
        </Text>
        <Text style={s.bgTitle}>{bg.title}</Text>
      </View>
      <View style={s.bgRow}>
        <Text style={s.bgRowLabel}>OWNS</Text>
        <View style={s.bgRowChips}>
          {bg.incumbents.length === 0 ? (
            <Text style={{ fontSize: 7, color: C.inkDim, fontStyle: "italic", paddingTop: 2 }}>—</Text>
          ) : (
            bg.incumbents.map((r, i) => <ChipRef key={i} company={r} />)
          )}
        </View>
      </View>
      <View style={s.bgRow}>
        <Text style={s.bgRowLabel}>RISING</Text>
        <View style={s.bgRowChips}>
          {bg.challengers.length === 0 ? (
            <Text style={{ fontSize: 7, color: C.inkDim, fontStyle: "italic", paddingTop: 2 }}>—</Text>
          ) : (
            bg.challengers.map((r, i) => <ChipRef key={i} company={r} accent />)
          )}
        </View>
      </View>
      {bg.storyline ? <Text style={s.bgStoryline}>{bg.storyline}</Text> : null}
    </View>
  );
}

function PersonaCard({ p }: { p: ResearchPersona }) {
  return (
    <View style={s.pCard} wrap={false}>
      <View style={s.pHead}>
        <View style={{ flex: 1, paddingRight: 4 }}>
          <Text style={s.pName}>{p.role}</Text>
          <Text style={s.pOrg}>{p.orgLabel}</Text>
        </View>
        {p.estimatedCount > 0 ? (
          <Text style={s.pBadge}>~{p.estimatedCount.toLocaleString()}</Text>
        ) : null}
      </View>
      {p.dayInLife ? (
        <Text style={s.pField}>
          <Text style={s.pLabel}>Does. </Text>
          {p.dayInLife}
        </Text>
      ) : null}
      {p.pressure ? (
        <Text style={s.pField}>
          <Text style={s.pPressure}>Pressure. </Text>
          {p.pressure}
        </Text>
      ) : null}
      {p.primaryTools.length > 0 ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 2 }}>
          {p.primaryTools.slice(0, 6).map((n, i) => (
            <ChipRef key={i} company={{ name: n }} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

// logoMap is accepted for API compatibility with the download button but unused —
// the design no longer relies on external images, so the PDF always renders.
export function ResearchPdfDoc({
  doc,
}: {
  doc: ResearchDoc;
  logoMap?: Record<string, string>;
}) {
  const battlegrounds = doc.battlegrounds.slice(0, 8);
  const personas = doc.personas.slice(0, 6);
  const milestones = [...doc.milestones]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6);
  const whitespace = doc.whitespace.slice(0, 3);
  const whyNow = doc.whyNow.slice(0, 3);
  const contestedCount = doc.battlegrounds.filter((b) => b.status !== "settled").length;
  const strengths = (doc.companyStrengths ?? []).slice(0, 4);
  const footerPath = doc.companyDomain ? `talaria / ${doc.companyDomain}` : "talaria";

  return (
    <Document
      title={`${doc.companyName} — research brief`}
      author="Talaria"
      subject={doc.tagline}
    >
      <Page size="LETTER" style={s.page}>
        <View style={s.masthead}>
          <View style={s.mastheadL}>
            {doc.tagline ? <Text style={s.mastheadKicker}>{doc.tagline}</Text> : null}
            <Text style={s.mastheadTitle}>{doc.companyName}</Text>
            {doc.companyUrl ? <Text style={s.mastheadUrl}>{doc.companyUrl}</Text> : null}
          </View>
          {battlegrounds.length > 0 ? (
            <View style={s.mastheadR}>
              <Text style={s.mastheadStatN}>
                {contestedCount}
                <Text style={{ fontSize: 10, color: C.inkMuted }}> / {battlegrounds.length}</Text>
              </Text>
              <Text style={s.mastheadStatLabel}>Contested fronts</Text>
            </View>
          ) : null}
        </View>

        {doc.whyChat?.trim() ? (
          <View wrap={false}>
            <Text style={s.whyChatKicker}>Why I want to chat</Text>
            <Text style={s.whyChat}>{doc.whyChat}</Text>
          </View>
        ) : null}

        {strengths.length > 0 ? (
          <>
            <Text style={s.h2}>What&apos;s great about {doc.companyName}</Text>
            <View style={s.twoCol}>
              {strengths.map((n, i) => (
                <View key={i} style={s.twoColCell}>
                  <View style={s.strengthCard} wrap={false}>
                    <Text style={s.strengthTitle}>{n.title}</Text>
                    <Text style={s.strengthBody}>{n.body}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        ) : null}

        {doc.bottomLine ? (
          <View wrap={false}>
            <Text style={s.bottomLineKicker}>The analyst take</Text>
            <Text style={s.bottomLine}>{doc.bottomLine}</Text>
          </View>
        ) : null}

        {battlegrounds.length > 0 ? (
          <>
            <Text style={s.h2}>Where the battles are</Text>
            <View style={s.twoCol}>
              {battlegrounds.map((b, i) => (
                <View key={i} style={s.twoColCell}>
                  <BattlegroundCard bg={b} />
                </View>
              ))}
            </View>
          </>
        ) : null}

        <View style={s.footer} fixed>
          <Text>{footerPath}</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `${todayStr()}  ·  Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>

      <Page size="LETTER" style={s.page}>
        <View style={s.miniHead}>
          <Text style={s.miniHeadL}>
            {doc.companyName}  —  who, what&rsquo;s changing, where the gaps are
          </Text>
          <Text style={s.miniHeadR}>{todayStr()}</Text>
        </View>

        {personas.length > 0 ? (
          <>
            <Text style={s.h2}>Who uses what, all day</Text>
            <View style={s.twoCol}>
              {personas.map((p, i) => (
                <View key={i} style={s.twoColCell}>
                  <PersonaCard p={p} />
                </View>
              ))}
            </View>
          </>
        ) : null}

        <View style={s.bottomStrip}>
          {whitespace.length > 0 ? (
            <View style={s.bottomStripCol}>
              <Text style={s.h2}>Whitespace</Text>
              {whitespace.map((w, i) => (
                <Text key={i} style={s.noteItem}>
                  <Text style={s.noteTitle}>{w.title}. </Text>
                  {w.body}
                </Text>
              ))}
            </View>
          ) : null}

          {whyNow.length > 0 ? (
            <View style={s.bottomStripCol}>
              <Text style={s.h2}>Why now</Text>
              {whyNow.map((w, i) => (
                <Text key={i} style={s.noteItemNeutral}>
                  <Text style={s.noteTitle}>{w.title}. </Text>
                  {w.body}
                </Text>
              ))}
            </View>
          ) : null}

          {milestones.length > 0 ? (
            <View style={s.bottomStripCol}>
              <Text style={s.h2}>Recent milestones</Text>
              {milestones.map((m, i) => (
                <View key={i} style={s.mileRow}>
                  <Text style={s.mileDate}>{formatMilestoneDate(m.date)}</Text>
                  <Text style={s.mileKind}>{MILESTONE_KIND_LABEL[m.kind]}</Text>
                  <Text style={s.mileTitle}>{m.title}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        <View style={s.footer} fixed>
          <Text>{footerPath}</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `${todayStr()}  ·  Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}

export default ResearchPdfDoc;

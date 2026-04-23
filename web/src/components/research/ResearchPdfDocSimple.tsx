import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { ResearchDoc } from "@talaria/shared";

// Plain-text fallback PDF used when the editorial layout fails to render.
// Deliberately boring: no images, no custom fonts, minimal flex math.

const s = StyleSheet.create({
  page: {
    padding: 48,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#111827",
    lineHeight: 1.45,
  },
  h1: { fontSize: 22, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  kicker: { fontSize: 9, color: "#6b7280", marginBottom: 14, fontFamily: "Helvetica-Oblique" },
  h2: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 6,
    color: "#9c723c",
  },
  p: { marginBottom: 6 },
  strong: { fontFamily: "Helvetica-Bold" },
  item: { marginBottom: 4 },
  rule: { borderBottomWidth: 0.75, borderBottomColor: "#e5e7eb", marginBottom: 10 },
});

export function ResearchPdfDocSimple({ doc }: { doc: ResearchDoc }) {
  return (
    <Document title={`${doc.companyName} — research brief`}>
      <Page size="LETTER" style={s.page} wrap>
        <Text style={s.h1}>{doc.companyName}</Text>
        {doc.tagline ? <Text style={s.kicker}>{doc.tagline}</Text> : null}
        <View style={s.rule} />

        {doc.whyChat?.trim() ? (
          <>
            <Text style={s.h2}>Why I want to chat</Text>
            <Text style={s.p}>{doc.whyChat}</Text>
          </>
        ) : null}

        {(doc.companyStrengths ?? []).length > 0 ? (
          <>
            <Text style={s.h2}>What&apos;s great about {doc.companyName}</Text>
            {(doc.companyStrengths ?? []).map((n, i) => (
              <Text key={i} style={s.item}>
                <Text style={s.strong}>{n.title}. </Text>
                {n.body}
              </Text>
            ))}
          </>
        ) : null}

        {doc.bottomLine ? (
          <>
            <Text style={s.h2}>The analyst take</Text>
            <Text style={s.p}>{doc.bottomLine}</Text>
          </>
        ) : null}

        {doc.battlegrounds.length > 0 ? (
          <>
            <Text style={s.h2}>Where the battles are</Text>
            {doc.battlegrounds.map((b, i) => {
              const incs = b.incumbents.map((r) => r.name).join(", ") || "—";
              const chs = b.challengers.map((r) => r.name).join(", ") || "—";
              return (
                <View key={i} style={{ marginBottom: 8 }} wrap={false}>
                  <Text>
                    <Text style={s.strong}>{b.title}</Text>
                    <Text style={{ color: "#6b7280" }}> · {b.status.toUpperCase()}</Text>
                  </Text>
                  {b.storyline ? <Text style={{ color: "#4b5563" }}>{b.storyline}</Text> : null}
                  <Text>Owns: {incs}</Text>
                  <Text>Rising: {chs}</Text>
                </View>
              );
            })}
          </>
        ) : null}

        {doc.personas.length > 0 ? (
          <>
            <Text style={s.h2}>Personas</Text>
            {doc.personas.map((p, i) => (
              <View key={i} style={{ marginBottom: 6 }} wrap={false}>
                <Text>
                  <Text style={s.strong}>{p.role}</Text>
                  <Text style={{ color: "#6b7280" }}> · {p.orgLabel}</Text>
                </Text>
                {p.dayInLife ? <Text>{p.dayInLife}</Text> : null}
                {p.pressure ? <Text>Pressure: {p.pressure}</Text> : null}
              </View>
            ))}
          </>
        ) : null}

        {doc.whitespace.length > 0 ? (
          <>
            <Text style={s.h2}>Whitespace</Text>
            {doc.whitespace.map((n, i) => (
              <Text key={i} style={s.item}>
                <Text style={s.strong}>{n.title}. </Text>
                {n.body}
              </Text>
            ))}
          </>
        ) : null}

        {doc.whyNow.length > 0 ? (
          <>
            <Text style={s.h2}>Why now</Text>
            {doc.whyNow.map((n, i) => (
              <Text key={i} style={s.item}>
                <Text style={s.strong}>{n.title}. </Text>
                {n.body}
              </Text>
            ))}
          </>
        ) : null}

        {doc.milestones.length > 0 ? (
          <>
            <Text style={s.h2}>Recent milestones</Text>
            {doc.milestones.map((m, i) => (
              <Text key={i} style={s.item}>
                <Text style={s.strong}>{m.date}</Text>
                <Text style={{ color: "#6b7280" }}> · {m.kind.toUpperCase()} </Text>
                {m.title}
              </Text>
            ))}
          </>
        ) : null}
      </Page>
    </Document>
  );
}

export default ResearchPdfDocSimple;

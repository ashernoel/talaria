import * as cheerio from "cheerio";
import { logWarn } from "./logging";

export interface SiteSnapshot {
  url: string;
  finalUrl: string;
  domain: string;
  title: string;
  description: string;
  text: string;
  teamText: string;
  companyName?: string;
  warnings: string[];
}

const FETCH_TIMEOUT_MS = 10_000;
const MAX_TEXT_CHARS = 8_000;
const TEAM_FETCH_TIMEOUT_MS = 6_000;
const MAX_TEAM_TEXT_CHARS = 6_000;
const TEAM_PATHS = [
  "/about",
  "/about-us",
  "/team",
  "/leadership",
  "/company",
  "/company/team",
  "/people",
];

export function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export async function scrapeCompanySite(rawUrl: string): Promise<SiteSnapshot> {
  const url = normalizeUrl(rawUrl);
  const warnings: string[] = [];
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let html = "";
  let finalUrl = url;
  try {
    const resp = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "TalariaBot/0.1 (+https://talaria.app; research fetch)",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    finalUrl = resp.url || url;
    if (!resp.ok) {
      warnings.push(`Company site returned HTTP ${resp.status}. Draft will rely on your notes.`);
    } else {
      html = await resp.text();
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    warnings.push(`Could not reach the company site (${msg}). Draft will rely on your notes.`);
    logWarn("scrape.fetch.failed", { url, error: msg });
  } finally {
    clearTimeout(timer);
  }

  const domain = extractDomain(finalUrl);

  if (!html) {
    return {
      url,
      finalUrl,
      domain,
      title: "",
      description: "",
      text: "",
      teamText: "",
      warnings,
    };
  }

  const $ = cheerio.load(html);
  $("script, style, noscript, iframe, svg, form, nav, footer, header").remove();

  const title = ($("meta[property='og:title']").attr("content") ||
    $("meta[name='twitter:title']").attr("content") ||
    $("title").first().text() ||
    "").trim();

  const description = ($("meta[name='description']").attr("content") ||
    $("meta[property='og:description']").attr("content") ||
    $("meta[name='twitter:description']").attr("content") ||
    "").trim();

  const main = $("main, article, [role='main']").first();
  const scope = main.length ? main : $("body");
  const text = scope
    .text()
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_TEXT_CHARS);

  const companyName = (title.split(/[|—–:·-]/)[0] ?? "").trim() || extractCompanyFromDomain(domain);

  const teamText = await fetchTeamText(finalUrl);

  return { url, finalUrl, domain, title, description, text, teamText, companyName, warnings };
}

async function fetchTeamText(baseUrl: string): Promise<string> {
  let origin: string;
  try {
    origin = new URL(baseUrl).origin;
  } catch {
    return "";
  }

  const results = await Promise.all(
    TEAM_PATHS.map((path) => fetchAndExtract(`${origin}${path}`)),
  );

  const combined = results
    .filter((r): r is string => typeof r === "string" && r.length > 0)
    .join("\n\n")
    .slice(0, MAX_TEAM_TEXT_CHARS);

  return combined;
}

async function fetchAndExtract(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TEAM_FETCH_TIMEOUT_MS);
  try {
    const resp = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "TalariaBot/0.1 (+https://talaria.app; team fetch)",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    if (!resp.ok) return null;
    const html = await resp.text();
    const $ = cheerio.load(html);
    $("script, style, noscript, iframe, svg, form, nav, footer, header").remove();
    const main = $("main, article, [role='main']").first();
    const scope = main.length ? main : $("body");
    const text = scope.text().replace(/\s+/g, " ").trim();
    if (!text) return null;
    return `[${url}]\n${text.slice(0, 3_000)}`;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function extractCompanyFromDomain(domain: string): string {
  const parts = domain.split(".");
  const base = parts.length >= 2 ? parts[parts.length - 2] : domain;
  return base.charAt(0).toUpperCase() + base.slice(1);
}

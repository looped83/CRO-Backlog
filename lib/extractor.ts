import * as cheerio from "cheerio";
import type { ExtractedPageData } from "./schemas";

const CTA_KEYWORDS = [
  "get started",
  "start free",
  "try free",
  "sign up",
  "sign-up",
  "get access",
  "get demo",
  "book demo",
  "request demo",
  "schedule demo",
  "contact us",
  "contact sales",
  "talk to sales",
  "buy now",
  "purchase",
  "subscribe",
  "download",
  "learn more",
  "see pricing",
  "view pricing",
  "start trial",
  "free trial",
  "claim",
  "join",
  "register",
];

const TRUST_PATTERNS = [
  /\btrusted by\b/i,
  /\b\d[\d,]+\s*(customers?|users?|companies|teams|businesses)\b/i,
  /\b(soc\s?2|gdpr|iso\s?27001|hipaa|pci[\s-]?dss)\b/i,
  /\b(ssl|https|secure|encrypted)\b/i,
  /\b(award|certified|featured in|as seen in|backed by)\b/i,
  /\b(money.?back|satisfaction guarantee|guarantee)\b/i,
];

const RISK_REDUCER_PATTERNS = [
  /\bno\s+credit\s+card\b/i,
  /\bfree\s+trial\b/i,
  /\bcancel\s+anytime\b/i,
  /\b(30|14|7|60|90)[- ]day\s+(free\s+trial|money.?back|trial|guarantee)\b/i,
  /\bmoney.?back\s+guarantee\b/i,
  /\bno\s+contract\b/i,
  /\bno\s+commitment\b/i,
  /\bfree\s+forever\b/i,
  /\bcancel\s+anytime\b/i,
  /\bno\s+setup\s+fee\b/i,
];

const SOCIAL_PROOF_SELECTORS = [
  '[class*="testimonial"]',
  '[class*="review"]',
  '[class*="quote"]',
  '[class*="customer"]',
  '[class*="case-study"]',
  '[class*="logo"]',
  '[class*="partner"]',
  '[class*="client"]',
  "blockquote",
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractText($el: cheerio.Cheerio<any>): string {
  return $el.text().replace(/\s+/g, " ").trim();
}

function matchPatterns(text: string, patterns: RegExp[]): string[] {
  const matches: string[] = [];
  for (const pattern of patterns) {
    const m = text.match(pattern);
    if (m) matches.push(m[0]);
  }
  return [...new Set(matches)];
}

export function extractPageData(
  html: string,
  url: string,
  httpStatus: number
): ExtractedPageData {
  const $ = cheerio.load(html);

  // Remove script/style/noscript from text extraction
  $("script, style, noscript, [aria-hidden=true]").remove();

  const title = $("title").first().text().trim() || "";
  const metaDesc =
    $('meta[name="description"]').attr("content") ||
    $('meta[property="og:description"]').attr("content") ||
    null;
  const canonical = $('link[rel="canonical"]').attr("href") || null;
  const hasNoindex =
    $('meta[name="robots"]').attr("content")?.toLowerCase().includes("noindex") ||
    false;

  // Headings
  const h1: string[] = [];
  $("h1").each((_, el) => {
    const t = extractText($(el));
    if (t) h1.push(t);
  });

  const h2h3: string[] = [];
  $("h2, h3").each((_, el) => {
    const t = extractText($(el));
    if (t) h2h3.push(t);
  });

  // Hero: first section/div near top with h1 or large text
  let heroText: string | null = null;
  const heroEl =
    $("section").first().length
      ? $("section").first()
      : $('[class*="hero"]').first().length
      ? $('[class*="hero"]').first()
      : $("main > *").first();
  if (heroEl.length) {
    heroText = extractText(heroEl).slice(0, 500) || null;
  }

  // CTAs
  const ctaTexts: string[] = [];
  const ctaLinks: string[] = [];

  $("a, button").each((_, el) => {
    const text = extractText($(el)).toLowerCase();
    const isCtaText = CTA_KEYWORDS.some((kw) => text.includes(kw));
    const classes = ($(el).attr("class") || "").toLowerCase();
    const isCtaClass =
      classes.includes("cta") ||
      classes.includes("btn") ||
      classes.includes("button") ||
      classes.includes("primary");

    if (isCtaText || isCtaClass) {
      const rawText = extractText($(el));
      if (rawText && rawText.length < 100) {
        ctaTexts.push(rawText);
        const href = $(el).attr("href");
        if (href) ctaLinks.push(href);
      }
    }
  });

  const uniqueCtaTexts = [...new Set(ctaTexts)].slice(0, 15);
  const uniqueCtaLinks = [...new Set(ctaLinks)].slice(0, 15);

  // Nav
  const navLinks: string[] = [];
  $("nav a, header a").each((_, el) => {
    const t = extractText($(el));
    if (t && t.length < 60) navLinks.push(t);
  });

  // Forms
  const formFields: string[] = [];
  $("input, select, textarea").each((_, el) => {
    const label =
      $(el).attr("placeholder") ||
      $(el).attr("aria-label") ||
      $(el).attr("name") ||
      $(el).attr("type") ||
      "";
    if (label && label !== "hidden") formFields.push(label);
  });

  // Full page text for pattern matching
  const bodyText = $("body").text().replace(/\s+/g, " ").trim();
  const wordCount = bodyText.split(/\s+/).filter(Boolean).length;

  // Trust indicators
  const trustIndicators = matchPatterns(bodyText, TRUST_PATTERNS);
  SOCIAL_PROOF_SELECTORS.forEach((sel) => {
    if ($(sel).length > 0) {
      trustIndicators.push(`${sel} elements present`);
    }
  });

  // Pricing
  const pricingMentions: string[] = [];
  const priceMatches = bodyText.match(
    /\$[\d,]+(?:\.\d{2})?(?:\s*\/\s*(?:mo|month|yr|year|user|seat))?|\bfree\b|\bpro\b|\benterprise\b|\bstarter\b|\bbasic\b|\bpremium\b/gi
  );
  if (priceMatches) {
    pricingMentions.push(...[...new Set(priceMatches)].slice(0, 10));
  }

  // Risk reducers
  const riskReducers = matchPatterns(bodyText, RISK_REDUCER_PATTERNS);

  // Social proof
  const socialProof: string[] = [];
  $('[class*="testimonial"], [class*="review"], blockquote').each((_, el) => {
    const t = extractText($(el)).slice(0, 200);
    if (t) socialProof.push(t);
  });

  // FAQ
  const hasFaq =
    !!$('[class*="faq"], [id*="faq"]').length ||
    bodyText.toLowerCase().includes("frequently asked") ||
    bodyText.toLowerCase().includes("faq");

  // Links
  const internalLinks: string[] = [];
  const externalLinks: string[] = [];
  let baseHost = "";
  try {
    baseHost = new URL(url).hostname;
  } catch {}

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    if (href.startsWith("http")) {
      try {
        const h = new URL(href).hostname;
        if (h === baseHost) internalLinks.push(href);
        else externalLinks.push(href);
      } catch {}
    } else if (href.startsWith("/")) {
      internalLinks.push(href);
    }
  });

  return {
    url,
    title,
    meta_description: metaDesc,
    canonical_url: canonical,
    h1,
    h2_h3: h2h3.slice(0, 20),
    hero_text: heroText,
    cta_texts: uniqueCtaTexts,
    cta_links: uniqueCtaLinks,
    cta_count: uniqueCtaTexts.length,
    nav_links: [...new Set(navLinks)].slice(0, 20),
    form_fields: [...new Set(formFields)].slice(0, 20),
    trust_indicators: [...new Set(trustIndicators)].slice(0, 15),
    pricing_mentions: pricingMentions,
    risk_reducers: riskReducers,
    social_proof: socialProof.slice(0, 5),
    has_faq: hasFaq,
    body_copy: bodyText.slice(0, 5000),
    word_count: wordCount,
    internal_links: [...new Set(internalLinks)].slice(0, 30),
    external_links: [...new Set(externalLinks)].slice(0, 20),
    http_status: httpStatus,
    load_success: true,
    has_noindex: hasNoindex,
  };
}

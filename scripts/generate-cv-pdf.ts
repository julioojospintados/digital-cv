/**
 * generate-cv-pdf.ts
 * Genera il CV knolling in PDF (A4, una pagina) con QR code verso il sito.
 * Pensato per le candidature LinkedIn che chiedono un CV in formato PDF:
 * il foglio è il piano fotografico, gli oggetti knolling sono l'inventario,
 * il QR è il portale verso il CV interattivo.
 *
 * Output:
 *   cv-site/public/cv/Giulio_Occhipinti_CV.pdf     (IT)
 *   cv-site/public/cv/Giulio_Occhipinti_CV_EN.pdf  (EN)
 *
 * Uso:
 *   npm run pdf:cv
 *   (equivale a: node --import tsx/esm scripts/generate-cv-pdf.ts)
 */

import { chromium } from "playwright";
import { readFileSync, mkdirSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import QRCode from "qrcode";
import { cvData } from "../src/data/cv.js";
import { cvDataEn } from "../src/data/cv.en.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const OUT_DIR = process.env.CV_PDF_OUT_DIR
  ? resolve(ROOT, process.env.CV_PDF_OUT_DIR)
  : resolve(ROOT, "cv-site/public/cv");
const PREVIEW_DIR = process.env.CV_PDF_PREVIEW_DIR ?? "";

const SITE_URL = "https://giulio-occhipinti.com";

// ── Asset helpers ────────────────────────────────────────────────────────────

const b64 = (path: string, mime: string): string =>
  `data:${mime};base64,${readFileSync(path).toString("base64")}`;

const knolling = (name: string): string =>
  b64(resolve(ROOT, `cv-site/public/knolling/${name}.webp`), "image/webp");

const fontLexend = (weight: number): string =>
  b64(
    resolve(
      ROOT,
      `cv-site/node_modules/@fontsource/lexend/files/lexend-latin-${weight}-normal.woff2`,
    ),
    "font/woff2",
  );

const fontMono = (weight: number): string =>
  b64(
    resolve(
      ROOT,
      `cv-site/node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-${weight}-normal.woff2`,
    ),
    "font/woff2",
  );

// ── Locale content ───────────────────────────────────────────────────────────

interface Caption {
  n: string;
  word: string;
  img?: string;
}

interface LocaleContent {
  lang: "it" | "en";
  file: string;
  docTitle: string;
  eyebrow: string;
  name: string;
  title: string;
  bioLabel: string;
  bio: string;
  stageLeft: string;
  stageRight: string;
  captions: Caption[];
  qrCaption: string;
  qrMicro: string;
  qrUrlLabel: string;
  legendLabel: string;
  legendChips: string[];
  spine: string;
  availability: string;
  location: string;
}

const socialUrl = (platform: string): string =>
  cvData.social.find((s) => s.platform === platform)?.url ?? "";

const EMAIL = socialUrl("Email").replace("mailto:", "");
const LINKEDIN = socialUrl("LinkedIn");
const GITHUB = socialUrl("GitHub");

const now = new Date();
const STAMP = `${String(now.getMonth() + 1).padStart(2, "0")}.${now.getFullYear()}`;

/** Spezza il titolo su due righe in un punto intenzionale, non dove capita. */
const breakTitle = (title: string): string =>
  title
    .replace(" per piccole e grandi realtà", "<br/>per piccole e grandi realtà")
    .replace(" for businesses of all sizes", "<br/>for businesses of all sizes");

const locales: LocaleContent[] = [
  {
    lang: "it",
    file: "Giulio_Occhipinti_CV.pdf",
    docTitle: "Giulio Occhipinti · Digital CV",
    eyebrow: "DIGITAL CV · EDIZIONE KNOLLING",
    name: cvData.personal.name,
    title: cvData.personal.title,
    bioLabel: "PROFILO",
    bio: cvData.personal.summary,
    stageLeft: "FLAT LAY · 09 OGGETTI CATALOGATI",
    stageRight: "SUPERFICIE OTTANIO · GAP COSTANTE",
    captions: [
      { n: "01", word: "COMUNICAZIONE", img: "megaphone" },
      { n: "02", word: "SVILUPPO", img: "laptop" },
      { n: "03", word: "ORIENTAMENTO", img: "compass" },
      { n: "04", word: "VISIONE", img: "camera" },
      { n: "05", word: "PORTALE" },
      { n: "06", word: "CURA", img: "plant" },
      { n: "07", word: "FOCUS", img: "flashlight" },
      { n: "08", word: "STRATEGIA", img: "chess" },
      { n: "09", word: "VERSATILITÀ", img: "multitool" },
    ],
    qrCaption: "05 · PORTALE",
    qrMicro: "INQUADRA · IL CV COMPLETO VIVE QUI",
    qrUrlLabel: "giulio-occhipinti.com",
    legendLabel: "QUATTRO LETTURE",
    legendChips: [
      "Software Developer",
      "Web & UX Designer",
      "AI & Digital Specialist",
      "Project Manager",
    ],
    spine: "QUESTO FOGLIO È SOLO L'INVENTARIO · GLI OGGETTI VERI SI MUOVONO",
    availability: "Disponibile per nuovi progetti",
    location: cvData.personal.location,
  },
  {
    lang: "en",
    file: "Giulio_Occhipinti_CV_EN.pdf",
    docTitle: "Giulio Occhipinti · Digital CV",
    eyebrow: "DIGITAL CV · KNOLLING EDITION",
    name: cvDataEn.personal.name,
    title: cvDataEn.personal.title,
    bioLabel: "PROFILE",
    bio: cvDataEn.personal.summary,
    stageLeft: "FLAT LAY · 09 CATALOGUED OBJECTS",
    stageRight: "TEAL SURFACE · CONSTANT GAP",
    captions: [
      { n: "01", word: "COMMUNICATION", img: "megaphone" },
      { n: "02", word: "DEVELOPMENT", img: "laptop" },
      { n: "03", word: "DIRECTION", img: "compass" },
      { n: "04", word: "VISION", img: "camera" },
      { n: "05", word: "PORTAL" },
      { n: "06", word: "CARE", img: "plant" },
      { n: "07", word: "FOCUS", img: "flashlight" },
      { n: "08", word: "STRATEGY", img: "chess" },
      { n: "09", word: "VERSATILITY", img: "multitool" },
    ],
    qrCaption: "05 · PORTAL",
    qrMicro: "SCAN · THE FULL CV LIVES HERE",
    qrUrlLabel: "giulio-occhipinti.com",
    legendLabel: "FOUR READINGS",
    legendChips: [
      "Software Developer",
      "Web & UX Designer",
      "AI & Digital Specialist",
      "Project Manager",
    ],
    spine: "THIS SHEET IS ONLY THE INVENTORY · THE REAL OBJECTS MOVE",
    availability: "Available for new projects",
    location: cvDataEn.personal.location,
  },
];

// ── Template ─────────────────────────────────────────────────────────────────

function objectCell(c: Caption, assets: Record<string, string>): string {
  return `
    <div class="cell">
      <img class="obj obj--${c.img}" src="${assets[c.img!]}" alt="" />
      <span class="caption"><em>${c.n}</em>&thinsp;·&thinsp;${c.word}</span>
    </div>`;
}

function qrCell(c: LocaleContent, qrSvg: string): string {
  return `
    <a class="cell qr-card" href="${SITE_URL}">
      <span class="qr-caption">${c.qrCaption}</span>
      <div class="qr-box">
        ${qrSvg}
        <span class="qr-go">GO</span>
      </div>
      <span class="qr-micro">${c.qrMicro}</span>
      <span class="qr-url">${c.qrUrlLabel}</span>
    </a>`;
}

function buildHtml(
  c: LocaleContent,
  qrSvg: string,
  assets: Record<string, string>,
  grain: string,
): string {
  const cells = c.captions
    .map((cap) => (cap.img ? objectCell(cap, assets) : qrCell(c, qrSvg)))
    .join("\n");

  const chips = c.legendChips
    .map((label, i) => `<span class="chip"><i class="chip-dot chip-dot--${i}"></i>${label}</span>`)
    .join("\n");

  return `<!doctype html>
<html lang="${c.lang}">
<head>
<meta charset="utf-8" />
<title>${c.docTitle}</title>
<style>
  @font-face { font-family: "Lexend"; font-weight: 400; src: url(${fontLexend(400)}) format("woff2"); }
  @font-face { font-family: "Lexend"; font-weight: 500; src: url(${fontLexend(500)}) format("woff2"); }
  @font-face { font-family: "Lexend"; font-weight: 700; src: url(${fontLexend(700)}) format("woff2"); }
  @font-face { font-family: "Lexend"; font-weight: 800; src: url(${fontLexend(800)}) format("woff2"); }
  @font-face { font-family: "JetBrains Mono"; font-weight: 500; src: url(${fontMono(500)}) format("woff2"); }
  @font-face { font-family: "JetBrains Mono"; font-weight: 600; src: url(${fontMono(600)}) format("woff2"); }
  @font-face { font-family: "JetBrains Mono"; font-weight: 700; src: url(${fontMono(700)}) format("woff2"); }

  :root {
    --color-bg: rgba(8, 73, 67, 1);
    --color-surface: rgba(12, 95, 87, 0.5);
    --color-border: rgba(255, 255, 255, 0.12);
    --color-text-primary: rgba(245, 240, 230, 1);
    --color-text-muted: rgba(192, 220, 215, 0.85);
    --color-cream: rgba(245, 240, 230, 1);
    --accent-tech: rgba(0, 255, 200, 1);
    --accent-creative: rgba(255, 107, 53, 1);
    --accent-human: rgba(240, 200, 127, 1);
    --accent-management: rgba(180, 100, 255, 1);
    --color-available: rgba(127, 217, 154, 1);
    --font-display: "Lexend", sans-serif;
    --font-mono: "JetBrains Mono", monospace;
    --gap: 14px;
  }

  @page { size: A4; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

  body {
    width: 210mm;
    height: 297mm;
    overflow: hidden;
    background: var(--color-bg);
    font-family: var(--font-display);
    color: var(--color-text-primary);
    position: relative;
  }

  /* ── Set fotografico: cornice, crop marks, grana ── */

  .frame {
    position: absolute;
    inset: 24px;
    border: 1px solid var(--color-border);
    pointer-events: none;
    z-index: 3;
  }

  .crop { position: absolute; width: 15px; height: 15px; z-index: 3; }
  .crop::before, .crop::after { content: ""; position: absolute; background: rgba(245, 240, 230, 0.5); }
  .crop::before { width: 15px; height: 1px; }
  .crop::after { width: 1px; height: 15px; }
  .crop--tl { top: 11px; left: 11px; }
  .crop--tr { top: 11px; right: 11px; transform: scaleX(-1); }
  .crop--bl { bottom: 11px; left: 11px; transform: scaleY(-1); }
  .crop--br { bottom: 11px; right: 11px; transform: scale(-1); }
  .crop--tl::before, .crop--tr::before { top: 0; left: 0; }
  .crop--tl::after, .crop--tr::after { top: 0; left: 0; }
  .crop--bl::before, .crop--br::before { bottom: 0; left: 0; }
  .crop--bl::after, .crop--br::after { bottom: 0; left: 0; }

  .grain {
    position: absolute;
    inset: 0;
    background: url("${grain}");
    background-size: 160px 160px;
    pointer-events: none;
    z-index: 2;
  }

  /* Luce da studio fotografico: alto centrale, vignetta sui bordi */
  .light {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 90% 55% at 50% 18%, rgba(255, 255, 255, 0.045), transparent 70%),
      radial-gradient(ellipse 130% 120% at 50% 50%, transparent 62%, rgba(0, 0, 0, 0.14) 100%);
    pointer-events: none;
    z-index: 2;
  }

  .spine {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%) rotate(180deg);
    writing-mode: vertical-rl;
    font-family: var(--font-mono);
    font-weight: 500;
    font-size: 7.5px;
    letter-spacing: 0.32em;
    color: rgba(192, 220, 215, 0.4);
    z-index: 3;
    white-space: nowrap;
  }

  /* ── Layout ── */

  .page {
    position: relative;
    height: 100%;
    padding: 46px 54px 42px;
    display: flex;
    flex-direction: column;
    z-index: 1;
  }

  /* Header */
  .header { display: flex; justify-content: space-between; align-items: flex-start; }
  .eyebrow {
    font-family: var(--font-mono);
    font-weight: 600;
    font-size: 9px;
    letter-spacing: 0.24em;
    color: var(--color-text-muted);
  }
  .name {
    margin-top: 10px;
    font-weight: 800;
    font-size: 50px;
    line-height: 1.02;
    letter-spacing: -0.025em;
    text-transform: uppercase;
  }
  .role {
    margin-top: 9px;
    font-weight: 500;
    font-size: 13.5px;
    line-height: 1.4;
    color: var(--color-text-muted);
  }
  .go-badge {
    width: 62px;
    height: 62px;
    border: 1.5px solid rgba(245, 240, 230, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 23px;
    letter-spacing: 0.02em;
    flex-shrink: 0;
  }
  .go-meta {
    margin-top: 7px;
    text-align: center;
    font-family: var(--font-mono);
    font-weight: 500;
    font-size: 7.5px;
    letter-spacing: 0.2em;
    color: rgba(192, 220, 215, 0.55);
  }

  /* Linea dei 4 mode: knolling di colori, gap costante */
  .mode-line { display: flex; gap: 8px; margin-top: 20px; }
  .mode-line i { flex: 1; height: 3px; }
  .mode-line i:nth-child(1) { background: var(--accent-tech); }
  .mode-line i:nth-child(2) { background: var(--accent-creative); }
  .mode-line i:nth-child(3) { background: var(--accent-human); }
  .mode-line i:nth-child(4) { background: var(--accent-management); }

  /* Bio */
  .bio-row { display: grid; grid-template-columns: 96px 1fr; gap: 16px; margin-top: 18px; }
  .bio-label {
    font-family: var(--font-mono);
    font-weight: 600;
    font-size: 8.5px;
    letter-spacing: 0.24em;
    color: rgba(192, 220, 215, 0.6);
    padding-top: 3px;
  }
  .bio {
    font-weight: 400;
    font-size: 11.5px;
    line-height: 1.6;
    color: rgba(245, 240, 230, 0.92);
  }

  /* Stage knolling */
  .stage-meta {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
    font-family: var(--font-mono);
    font-weight: 500;
    font-size: 7.5px;
    letter-spacing: 0.22em;
    color: rgba(192, 220, 215, 0.45);
  }
  .stage {
    position: relative;
    margin-top: 8px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 200px);
    gap: var(--gap);
  }
  .cell {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .obj {
    max-width: 78%;
    max-height: 150px;
    object-fit: contain;
    filter: drop-shadow(0 10px 14px rgba(0, 0, 0, 0.35));
  }
  /* La torcia è fotografata orizzontale: ruotata torna verticale
     come nella referenza knolling, fascio verso l'alto. */
  .obj--flashlight {
    width: 146px;
    max-width: none;
    max-height: none;
    transform: rotate(90deg);
  }
  .caption {
    position: absolute;
    bottom: 2px;
    left: 50%;
    transform: translateX(-50%);
    font-family: var(--font-mono);
    font-weight: 600;
    font-size: 8px;
    letter-spacing: 0.16em;
    color: rgba(245, 240, 230, 0.85);
    white-space: nowrap;
  }
  .caption em { font-style: normal; color: rgba(192, 220, 215, 0.55); }

  /* Croci alle intersezioni della griglia */
  .cross { position: absolute; width: 11px; height: 11px; transform: translate(-50%, -50%); z-index: 0; }
  .cross::before, .cross::after { content: ""; position: absolute; background: rgba(255, 255, 255, 0.2); }
  .cross::before { left: 0; top: 5px; width: 11px; height: 1px; }
  .cross::after { left: 5px; top: 0; width: 1px; height: 11px; }

  /* Card QR: l'unico oggetto stampato, appoggiato sul piano */
  .qr-card {
    background: var(--color-cream);
    border-radius: 10px;
    box-shadow: 0 14px 26px rgba(0, 0, 0, 0.34);
    flex-direction: column;
    justify-content: flex-start;
    padding: 11px 14px 10px;
    text-decoration: none;
    z-index: 4;
  }
  .qr-caption {
    align-self: flex-start;
    font-family: var(--font-mono);
    font-weight: 600;
    font-size: 7.5px;
    letter-spacing: 0.16em;
    color: rgba(8, 73, 67, 0.55);
  }
  /* Quiet zone: almeno 12px di crema tra i moduli QR e qualsiasi inchiostro */
  .qr-box { position: relative; width: 116px; height: 116px; margin-top: 13px; }
  .qr-box svg { width: 100%; height: 100%; display: block; }
  .qr-go {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 28px;
    height: 28px;
    background: var(--color-cream);
    border: 1.5px solid var(--color-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 11px;
    color: var(--color-bg);
  }
  .qr-micro {
    margin-top: 13px;
    font-family: var(--font-mono);
    font-weight: 600;
    font-size: 6.5px;
    letter-spacing: 0.18em;
    color: rgba(8, 73, 67, 0.6);
  }
  .qr-url {
    margin-top: 2px;
    font-weight: 700;
    font-size: 11.5px;
    letter-spacing: -0.01em;
    color: var(--color-bg);
  }

  /* Legenda dei 4 mode */
  .legend {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 18px;
  }
  .legend-label {
    font-family: var(--font-mono);
    font-weight: 600;
    font-size: 8.5px;
    letter-spacing: 0.24em;
    color: rgba(192, 220, 215, 0.6);
  }
  .chips { display: flex; gap: 18px; }
  .chip {
    display: flex;
    align-items: center;
    gap: 7px;
    font-family: var(--font-mono);
    font-weight: 500;
    font-size: 8px;
    letter-spacing: 0.08em;
    color: var(--color-text-muted);
    white-space: nowrap;
  }
  .chip-dot { width: 8px; height: 8px; flex-shrink: 0; }
  .chip-dot--0 { background: var(--accent-tech); }
  .chip-dot--1 { background: var(--accent-creative); }
  .chip-dot--2 { background: var(--accent-human); }
  .chip-dot--3 { background: var(--accent-management); }

  /* Footer */
  .footer {
    margin-top: auto;
    border-top: 1px solid var(--color-border);
    padding-top: 12px;
  }
  .contacts {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 0;
    font-family: var(--font-mono);
    font-weight: 500;
    font-size: 8.5px;
    letter-spacing: 0.04em;
    color: var(--color-text-muted);
  }
  .contacts a { color: var(--color-text-muted); text-decoration: none; }
  .contacts .sep { margin: 0 9px; color: rgba(192, 220, 215, 0.4); }
  .footer-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-top: 9px;
  }
  .availability {
    display: flex;
    align-items: center;
    gap: 7px;
    font-family: var(--font-mono);
    font-weight: 500;
    font-size: 8px;
    letter-spacing: 0.1em;
    color: var(--color-text-muted);
  }
  .availability i {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--color-available);
    box-shadow: 0 0 6px 1px rgba(127, 217, 154, 0.6);
  }
  .site-link {
    font-weight: 700;
    font-size: 12px;
    color: var(--color-text-primary);
    text-decoration: none;
    letter-spacing: -0.01em;
  }
</style>
</head>
<body>
  <div class="crop crop--tl"></div>
  <div class="crop crop--tr"></div>
  <div class="crop crop--bl"></div>
  <div class="crop crop--br"></div>
  <div class="frame"></div>
  <div class="light"></div>
  <div class="grain"></div>
  <div class="spine">${c.spine}</div>

  <div class="page">
    <header class="header">
      <div>
        <p class="eyebrow">${c.eyebrow} · ${STAMP}</p>
        <h1 class="name">${c.name}</h1>
        <p class="role">${breakTitle(c.title)}</p>
      </div>
      <div>
        <div class="go-badge">GO</div>
        <p class="go-meta">TORINO / IT</p>
      </div>
    </header>

    <div class="mode-line"><i></i><i></i><i></i><i></i></div>

    <section class="bio-row">
      <span class="bio-label">${c.bioLabel}</span>
      <p class="bio">${c.bio}</p>
    </section>

    <div class="stage-meta">
      <span>${c.stageLeft}</span>
      <span>${c.stageRight}</span>
    </div>

    <section class="stage">
      ${cells}
      <div class="cross" style="left: calc(33.333% + 2px); top: calc(200px + 7px);"></div>
      <div class="cross" style="left: calc(66.666% - 2px); top: calc(200px + 7px);"></div>
      <div class="cross" style="left: calc(33.333% + 2px); top: calc(414px + 7px);"></div>
      <div class="cross" style="left: calc(66.666% - 2px); top: calc(414px + 7px);"></div>
    </section>

    <section class="legend">
      <span class="legend-label">${c.legendLabel}</span>
      <div class="chips">${chips}</div>
    </section>

    <footer class="footer">
      <div class="contacts">
        <a href="mailto:${EMAIL}">${EMAIL}</a><span class="sep">·</span>
        <a href="${LINKEDIN}">${LINKEDIN.replace("https://www.", "")}</a><span class="sep">·</span>
        <a href="${GITHUB}">${GITHUB.replace("https://", "")}</a>
      </div>
      <div class="footer-row">
        <span class="availability"><i></i>${c.availability} · ${c.location}</span>
        <a class="site-link" href="${SITE_URL}">giulio-occhipinti.com</a>
      </div>
    </footer>
  </div>
</body>
</html>`;
}

// ── Render ───────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  mkdirSync(OUT_DIR, { recursive: true });

  const qrSvg = await QRCode.toString(SITE_URL, {
    type: "svg",
    errorCorrectionLevel: "H",
    margin: 0,
    color: { dark: "#084943", light: "#0000" },
  });

  // CV_PDF_CHANNEL: usa un browser di sistema (es. "chrome") invece del
  // Chromium bundled da Playwright, utile quando quest'ultimo non è
  // installabile (rete ristretta) ma un browser reale è già presente.
  const browser = await chromium.launch(
    process.env.CV_PDF_CHANNEL ? { channel: process.env.CV_PDF_CHANNEL } : undefined,
  );
  const page = await browser.newPage({
    viewport: { width: 794, height: 1123 },
    deviceScaleFactor: 2,
  });

  // Pass di preprocessing: ridimensiona gli oggetti knolling via canvas
  // (le webp originali sono più grandi del necessario e gonfiano il PDF)
  // e genera il tile di grana con l'alpha già nei pixel, così Chromium
  // non deve comporre un layer trasparente a pagina intera.
  await page.setContent("<!doctype html><html><body></body></html>");

  const sources: Record<string, string> = {};
  for (const cap of locales[0]!.captions) {
    if (cap.img) sources[cap.img] = knolling(cap.img);
  }

  const assets = await page.evaluate(
    async ({ sources, maxSide }: { sources: Record<string, string>; maxSide: number }) => {
      const out: Record<string, string> = {};
      for (const [name, uri] of Object.entries(sources)) {
        const img = new Image();
        img.src = uri;
        await img.decode();
        const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
        const w = Math.round(img.naturalWidth * scale);
        const h = Math.round(img.naturalHeight * scale);
        const cv = document.createElement("canvas");
        cv.width = w;
        cv.height = h;
        cv.getContext("2d")!.drawImage(img, 0, 0, w, h);
        out[name] = cv.toDataURL("image/png");
      }
      return out;
    },
    { sources, maxSide: 420 },
  );

  const grain = await page.evaluate((size: number) => {
    const cv = document.createElement("canvas");
    cv.width = size;
    cv.height = size;
    const ctx = cv.getContext("2d")!;
    const im = ctx.createImageData(size, size);
    for (let i = 0; i < im.data.length; i += 4) {
      const v = Math.random() < 0.5 ? 255 : 0;
      im.data[i] = v;
      im.data[i + 1] = v;
      im.data[i + 2] = v;
      im.data[i + 3] = Math.random() < 0.42 ? 13 : 0;
    }
    ctx.putImageData(im, 0, 0);
    return cv.toDataURL("image/png");
  }, 160);

  for (const locale of locales) {
    const html = buildHtml(locale, qrSvg, assets, grain);
    await page.setContent(html, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);

    const outPath = resolve(OUT_DIR, locale.file);
    await page.pdf({
      path: outPath,
      format: "A4",
      printBackground: true,
      pageRanges: "1",
      preferCSSPageSize: true,
    });
    console.log(`PDF generato: ${outPath}`);

    if (PREVIEW_DIR) {
      const previewPath = resolve(PREVIEW_DIR, locale.file.replace(".pdf", ".png"));
      await page.screenshot({ path: previewPath, fullPage: false });
      console.log(`Preview: ${previewPath}`);
    }
  }

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

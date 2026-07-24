/**
 * generate-cover-letter.ts
 * Genera la cover letter (lettera di presentazione) in PDF A4, una pagina,
 * IT + EN. Coordinata con il CV UX: header ottanio con nome, ruolo, contatti e
 * QR (lente creative del Design System), corpo su fondo chiaro per la
 * leggibilità (una lettera si legge tutta, non si scansiona).
 *
 * Nessun nome dell'azienda destinataria: testo evergreen per candidature
 * LinkedIn. Stile scrittorio: prima persona, sintassi diretta, verbi d'impatto,
 * niente aggettivi da marketing, niente trattini come stacco.
 *
 * Output (cartella gitignorata: documenti personali, non vanno pushati):
 *   cv-output/Giulio_Occhipinti_Cover_Letter.pdf     (IT)
 *   cv-output/Giulio_Occhipinti_Cover_Letter_EN.pdf  (EN)
 *
 * Uso:
 *   npm run pdf:cover
 *   (equivale a: node --import tsx/esm scripts/generate-cover-letter.ts)
 *
 * In ambienti dove il Chromium di Playwright non è nella posizione di default,
 * passare il percorso via env PLAYWRIGHT_CHROMIUM_EXECUTABLE.
 */

import { chromium } from "playwright";
import { readFileSync, mkdirSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const OUT_DIR = resolve(ROOT, "cv-output");

const SITE = "https://giulio-occhipinti.com";

const b64 = (path: string, mime: string): string =>
  `data:${mime};base64,${readFileSync(path).toString("base64")}`;

const qr = b64(resolve(ROOT, "cv-site/public/qr/site-qr-dark.png"), "image/png");

const lex = (weight: number): string =>
  b64(
    resolve(
      ROOT,
      `cv-site/node_modules/@fontsource/lexend/files/lexend-latin-${weight}-normal.woff2`,
    ),
    "font/woff2",
  );
const jb = (weight: number): string =>
  b64(
    resolve(
      ROOT,
      `cv-site/node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-${weight}-normal.woff2`,
    ),
    "font/woff2",
  );

// ── Locale content ───────────────────────────────────────────────────────────

interface Locale {
  lang: "it" | "en";
  file: string;
  positioning: string;
  linkedinUrl: string;
  siteLabel: string;
  greeting: string;
  paragraphs: string[];
  signoff: string;
}

const EN: Locale = {
  lang: "en",
  file: "Giulio_Occhipinti_Cover_Letter_EN.pdf",
  positioning: "UX/UI Designer · Frontend Developer",
  linkedinUrl: "https://www.linkedin.com/in/giulio-occhipinti?locale=en_US",
  siteLabel: "Website",
  greeting: "Dear Hiring Team,",
  paragraphs: [
    "My name is Giulio and I design digital interfaces, but I got here by a long road. I did theatre and improvisation, I lived in three countries before moving back to Italy, and I worked many different jobs, some of them far from anything digital. I don't treat them as a footnote. They taught me to listen to people, to sense what they don't say, and to adapt quickly when things don't go as planned. It's the same thing I do when I design an interface.",
    "Today I work as a UX/UI Designer, with an IBM certification and a Master's in Digital Communication from IED, and I have six years of frontend development behind me. This is what makes the difference for me: I design interfaces and I can build them too, so when I propose a solution I already know the way to make it real.",
    "I always start from people and their real needs, not from my own idea. On a product discovery project I studied user behaviour, interviewed users and narrowed seventeen hypotheses down to the one that held. On an enterprise design system I built a library of over a hundred components, together with the design team. For a smaller client I handled everything myself, from research to prototype to a handover built so they could update the site on their own.",
    "Outside work I tend my plants, take photographs and play chess. They say a lot about how I think: patience, attention to detail, and the wish to think a few moves ahead. I bring the same care to my projects and to the people I work with.",
    "If you think a profile like this could be useful to you, I'd be glad to talk. You'll find my work and my full story at <a class=\"lnk\" href=\"" + SITE + "\">giulio-occhipinti.com</a>.",
  ],
  signoff: "Best,",
};

const IT: Locale = {
  lang: "it",
  file: "Giulio_Occhipinti_Cover_Letter.pdf",
  positioning: "UX/UI Designer · Frontend Developer",
  linkedinUrl: "https://www.linkedin.com/in/giulio-occhipinti?locale=it_IT",
  siteLabel: "Sito",
  greeting: "Gentile team,",
  paragraphs: [
    "Mi chiamo Giulio e progetto interfacce digitali, ma ci sono arrivato per una strada lunga. Ho fatto teatro e improvvisazione, ho vissuto in tre paesi prima di tornare in Italia e ho cambiato molti lavori, alcuni lontanissimi dal digitale. Non li considero un dettaglio del passato. Mi hanno insegnato ad ascoltare le persone, a intuire quello che non dicono e ad adattarmi in fretta quando le cose non vanno come previsto. È la stessa cosa che faccio quando progetto un'interfaccia.",
    "Oggi lavoro come UX/UI Designer, con certificazione IBM e un Master in Comunicazione Digitale allo IED, e ho alle spalle sei anni di sviluppo frontend. Per me questo fa la differenza: disegno le interfacce e so anche costruirle, quindi quando propongo una soluzione conosco già la strada per realizzarla davvero.",
    "Parto sempre dalle persone e dai loro bisogni reali, non dalla mia idea. In un progetto di product discovery ho studiato i comportamenti degli utenti, li ho intervistati e ho ridotto diciassette ipotesi a quella che reggeva. Su un design system enterprise ho costruito una libreria di oltre cento componenti, insieme al team di design. Per un cliente più piccolo ho seguito tutto io, dalla ricerca al prototipo fino alla consegna, pensata perché potesse aggiornare il sito da solo.",
    "Fuori dal lavoro curo le mie piante, scatto fotografie e gioco a scacchi. Sono cose che dicono molto di come ragiono: pazienza, attenzione ai dettagli e la voglia di pensare qualche mossa in avanti. La stessa cura la porto nei progetti e nel rapporto con le persone con cui lavoro.",
    "Se pensate che un profilo così possa esservi utile, mi farebbe piacere parlarne. Trovate il mio lavoro e la mia storia per esteso su <a class=\"lnk\" href=\"" + SITE + "\">giulio-occhipinti.com</a>.",
  ],
  signoff: "A presto,",
};

const locales: Locale[] = [IT, EN];

// ── Template ─────────────────────────────────────────────────────────────────

export { locales };
export function buildHtml(L: Locale): string {
  return `<!doctype html><html lang="${L.lang}"><head><meta charset="utf-8"><style>
@font-face{font-family:'Lexend';font-weight:400;src:url(${lex(400)}) format('woff2');}
@font-face{font-family:'Lexend';font-weight:600;src:url(${lex(600)}) format('woff2');}
@font-face{font-family:'Lexend';font-weight:700;src:url(${lex(700)}) format('woff2');}
@font-face{font-family:'Lexend';font-weight:800;src:url(${lex(800)}) format('woff2');}
@font-face{font-family:'JetBrains Mono';font-weight:500;src:url(${jb(500)}) format('woff2');}
@font-face{font-family:'JetBrains Mono';font-weight:700;src:url(${jb(700)}) format('woff2');}

:root{
  --ott:rgb(8,73,67); --cream:rgb(245,240,230); --cream-mut:rgba(214,232,228,.85);
  --or-dark:rgb(255,138,84);   /* accent su ottanio */
  --or-light:#bf4a16;          /* accent su fondo chiaro (contrasto WCAG) */
  --bg:#f7f5f0; --ink:#182320; --mut:#5a6a63; --line:rgba(8,73,67,.16);
  --sans:'Lexend',system-ui,sans-serif; --mono:'JetBrains Mono',ui-monospace,monospace;
}
@page{size:A4;margin:0;}
*{box-sizing:border-box;margin:0;padding:0;}
html{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
body{font-family:var(--sans);color:var(--ink);background:var(--bg);}

.page{width:210mm;min-height:297mm;background:var(--bg);display:flex;flex-direction:column;}

/* ── Header band (ottanio, coordinato al CV) ── */
.band{background:var(--ott);color:var(--cream);padding:14mm 18mm 10mm;
  display:grid;grid-template-columns:1fr auto;gap:10mm;align-items:start;}
.name{font-weight:800;font-size:25pt;line-height:1;letter-spacing:-.02em;}
.posit{font-weight:700;font-size:11.5pt;color:var(--or-dark);margin-top:2.5mm;letter-spacing:-.01em;}
.contacts{display:flex;flex-wrap:wrap;gap:2.4mm 5.5mm;margin-top:5mm;
  font-family:var(--mono);font-weight:500;font-size:8pt;}
.contacts .ct{display:inline-flex;align-items:baseline;gap:1.6mm;}
.contacts .lab{font-size:6.4pt;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--or-dark);}
.contacts .plain{color:var(--cream-mut);}
.contacts a{color:var(--cream);text-decoration:underline;text-decoration-color:var(--or-dark);
  text-decoration-thickness:.8pt;text-underline-offset:1.8pt;}
.qr{width:24mm;height:24mm;display:block;border-radius:2.5mm;}

/* ── Letter body (fondo chiaro, leggibile) ── */
.letter{padding:11mm 18mm 12mm;display:flex;flex-direction:column;gap:2.8mm;max-width:180mm;}
.greeting{font-weight:700;font-size:11pt;color:var(--ink);}
.letter p{font-size:10.4pt;line-height:1.5;color:var(--ink);max-width:64em;}
.letter a.lnk{color:var(--or-light);font-weight:600;text-decoration:underline;
  text-decoration-thickness:.6pt;text-underline-offset:1.6pt;}
.sign{margin-top:3mm;display:flex;flex-direction:column;gap:1mm;}
.sign .off{font-size:10.8pt;color:var(--ink);}
.sign .who{font-family:var(--sans);font-weight:800;font-size:13pt;letter-spacing:-.01em;color:var(--ink);}
.sign .who .dot{color:var(--or-light);}

/* filo d'accento sotto la firma, chiude la pagina coordinato al brand */
.foot{margin-top:auto;padding:0 18mm 12mm;}
.foot .rule{height:2px;background:var(--line);margin-bottom:3mm;}
.foot .go{font-family:var(--sans);font-weight:800;font-size:12pt;letter-spacing:-.04em;color:var(--ink);}
.foot .go .o{color:var(--or-light);}
.foot .site{float:right;font-family:var(--mono);font-size:8pt;color:var(--mut);}
.foot .site a{color:var(--or-light);text-decoration:underline;text-underline-offset:1.6pt;}
</style></head><body>

<div class="page">
  <header class="band">
    <div>
      <h1 class="name">Giulio Occhipinti</h1>
      <p class="posit">${L.positioning}</p>
      <div class="contacts">
        <span class="ct"><span class="lab">Email</span> <a href="mailto:giulio.occhipinti.g@gmail.com">giulio.occhipinti.g@gmail.com</a></span>
        <span class="ct"><span class="lab">LinkedIn</span> <a href="${L.linkedinUrl}">in/giulio-occhipinti</a></span>
        <span class="ct"><span class="lab">${L.siteLabel}</span> <a href="${SITE}">giulio-occhipinti.com</a></span>
      </div>
    </div>
    <a href="${SITE}"><img class="qr" src="${qr}" alt="QR code — ${SITE}"></a>
  </header>

  <section class="letter">
    <p class="greeting">${L.greeting}</p>
    ${L.paragraphs.map((p) => `<p>${p}</p>`).join("\n    ")}
    <div class="sign">
      <span class="off">${L.signoff}</span>
      <span class="who">Giulio Occhipinti<span class="dot">.</span></span>
    </div>
  </section>

  <footer class="foot">
    <div class="rule"></div>
    <span class="go">G<span class="o">O</span></span>
    <span class="site"><a href="${SITE}">giulio-occhipinti.com</a></span>
  </footer>
</div>

</body></html>`;
}

async function main(): Promise<void> {
  mkdirSync(OUT_DIR, { recursive: true });
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
  const browser = await chromium.launch(
    executablePath ? { executablePath } : {},
  );
  const page = await browser.newPage();

  for (const L of locales) {
    await page.setContent(buildHtml(L), { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const outPath = resolve(OUT_DIR, L.file);
    await page.pdf({
      path: outPath,
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
    });
    console.log(`PDF generato: ${outPath}`);
  }

  await browser.close();
}

const invokedDirectly =
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

/**
 * generate-ux-cv.ts
 * Genera il CV in versione UX/UI Designer in PDF A4, due pagine, IT + EN.
 * Pensato per le candidature come UX/UI Designer: lente "creative" del
 * Design System (ottanio + accent arancione), contenuti scannabili e ATS-safe
 * (testo reale, non immagini), link e QR cliccabili, portfolio come CTA.
 *
 * Fondo ottanio a tutti i bordi (full bleed) con margine interno uniforme di
 * 15mm su ogni pagina, ottenuto con due fogli A4 espliciti (.sheet).
 *
 * Output (cartella gitignorata: sono documenti personali, non vanno pushati):
 *   cv-output/Giulio_Occhipinti_UX_Designer_CV.pdf     (IT)
 *   cv-output/Giulio_Occhipinti_UX_Designer_CV_EN.pdf  (EN)
 *
 * Uso:
 *   npm run pdf:ux
 *   (equivale a: node --import tsx/esm scripts/generate-ux-cv.ts)
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

interface Experience {
  yr: string;
  loc: string;
  role: string;
  org: string;
  bullets: string[];
}
interface Work {
  title: string;
  desc: string;
  outcome: string;
  url: string;
}
interface SkillGroup {
  label: string;
  chips: string[];
  key?: boolean;
}
interface Cert {
  by: string;
  name: string;
  strong?: boolean;
}
interface Edu {
  yr: string;
  /** HTML: contiene già <b>…</b> ed eventuale suffisso non-bold. */
  title: string;
  sub: string;
}
interface Lang {
  name: string;
  level: string;
}

interface Locale {
  lang: "it" | "en";
  file: string;
  positioning: string;
  creds: string;
  location: string;
  linkedinUrl: string;
  siteLabel: string;
  workLinkLabel: string;
  qrCap: string;
  visitBtn: string;
  profileLead: string;
  profile: string;
  secExperience: string;
  expEyebrow: string;
  earlier: string;
  secWork: string;
  workEyebrow: string;
  secSkills: string;
  skillsEyebrow: string;
  secCerts: string;
  secEdu: string;
  secLangs: string;
  experiences: Experience[];
  works: Work[];
  skills: SkillGroup[];
  certs: Cert[];
  edu: Edu[];
  langs: Lang[];
  ctaTitle: string;
  ctaSub: string;
  portfolioBtn: string;
}

const EN: Locale = {
  lang: "en",
  file: "Giulio_Occhipinti_UX_Designer_CV_EN.pdf",
  positioning: "UX/UI Designer · Frontend Developer",
  creds:
    "IBM-certified in UX/UI · IED Master's in Digital Communication · Frontend developer, 6+ years on enterprise products · More on the site",
  location: "Turin, Italy",
  linkedinUrl: "https://www.linkedin.com/in/giulio-occhipinti?locale=en_US",
  siteLabel: "Website",
  workLinkLabel: "Read the case study",
  qrCap: "Scan the code or tap the button —<br>the whole site is interactive",
  visitBtn: "Visit the site",
  profileLead: "Cultivating empathy, with jokes in my pocket.",
  profile:
    "Countless different jobs behind me, a few plants at home, and a well-stamped passport. I lived in three different countries before moving back to Italy, but I did manage to swim in all three swimmable oceans — the other two are just too cold. An improviser of jokes and journeys, I've put down roots in the digital world while keeping a strong sensitivity — people tell me about it often — toward others and myself, with a wink toward poetry and photography. These days I'm trying to connect the dots across UX/UI design, software development, and digital strategy, applying the same logic chess requires. I play looking for the move that sees ahead.",
  secExperience: "Experience",
  expEyebrow: "selected · most recent first",
  earlier:
    "Earlier — Frontend Developer at ForgeLab (2021–22) and Consoft (2019–21) · Freelance photographer since 2009.",
  secWork: "Selected Work",
  workEyebrow: "full case studies online",
  secSkills: "Skills",
  skillsEyebrow: "tools of the trade",
  secCerts: "Certifications",
  secEdu: "Education",
  secLangs: "Languages",
  experiences: [
    {
      yr: "2026 — present",
      loc: "Turin / Remote",
      role: "UX Researcher &amp; Product Strategist",
      org: "Independent product discovery",
      bullets: [
        "Flipped ideation to <b>research-first</b>: behavioural needs mapped on Miro, classified by severity, before any idea.",
        "Validated with <b>7 target-user interviews</b> and competitor analysis; a Value/Effort matrix narrowed <b>17 concepts to 1</b>, now in a high-fidelity Figma prototype.",
      ],
    },
    {
      yr: "2026",
      loc: "Italy / Remote",
      role: "UX/UI Designer",
      org: "Bambagia Design Lab (freelance)",
      bullets: [
        "Designed a client's website interfaces: <b>studied the client and competitors before designing</b> — every interface choice motivated, not aesthetic.",
        "Wireframes, prototype and hand-coded HTML/CSS; palette variants converted to <b>Figma</b> via plugins, with a delivery flow the client can edit independently.",
      ],
    },
    {
      yr: "2024 — present",
      loc: "Turin / Remote",
      role: "UX/UI Designer &amp; Developer",
      org: "Digital CV — self-initiated open-source project",
      bullets: [
        "Research-led: defined the <b>3 real readers</b> (recruiter, CTO, art director) and their 3-second needs; every choice defensible in an interview.",
        "Knolling information architecture (one profile, four lenses) and a <b>WCAG-AA design system</b>; built AI-augmented (Copilot, Claude) with <b>&gt;80% test coverage</b>.",
      ],
    },
    {
      yr: "2019 — present",
      loc: "Turin, Italy",
      role: "Frontend Developer",
      org: "ALTEN Italia @ Aruba &amp; Intesa San Paolo",
      bullets: [
        "For <b>Aruba</b> I built the design system: a <b>100+ component library</b> in Lit, with the design team, honouring the typography, spacing and states defined in Figma.",
        "On the Aruba design system I was <b>Tech Lead and, in that role, Scrum Master</b>; for <b>Intesa San Paolo</b> I worked as a frontend developer on enterprise Angular, with systematic testing (Jest).",
      ],
    },
    {
      yr: "2023 — 2024",
      loc: "Italy / Remote",
      role: "Digital Strategist",
      org: "Music Agency",
      bullets: [
        "Content strategy aimed at the industry, not a generic audience; <b>doubled a targeted following</b> (musicians, labels, promoters) organically.",
        "Conceived a <b>targeted playlist</b> to involve musicians and industry insiders — more followers, collaborations and industry contacts; organised a live event end-to-end.",
      ],
    },
  ],
  works: [
    {
      title: "Product Discovery — UX Research",
      desc: "A behavioural needs map, user interviews and competitor analysis to validate real demand before a single line of code.",
      outcome: "17 concepts → 1, user-validated",
      url: `${SITE}/work/product-discovery`,
    },
    {
      title: "Interactive Digital CV",
      desc: "Research-led IA (one profile, four lenses), a WCAG-AA design system and an AI-augmented build. The live twin of this document.",
      outcome: "Design system · WCAG AA · &gt;80% coverage",
      url: `${SITE}/work/digital-cv`,
    },
  ],
  skills: [
    {
      label: "UX / UI",
      key: true,
      chips: [
        "UX Research",
        "User Interviews",
        "Wireframing",
        "Prototyping",
        "Usability",
        "Information Architecture",
        "Design Systems",
        "Accessibility · WCAG AA",
        "Interaction Design",
      ],
    },
    {
      label: "Design tools",
      chips: ["Figma", "Miro", "Visily", "UX Pilot", "Google Stitch", "GSAP", "WordPress", "Wix", "AI", "Claude"],
    },
    {
      label: "Frontend",
      chips: ["HTML5", "CSS / SCSS", "TypeScript", "Angular", "React", "Lit", "WebComponents", "Astro"],
    },
    {
      label: "AI workflow",
      chips: ["MCP Protocol", "Prompt Engineering", "GitHub Copilot", "Claude"],
    },
  ],
  certs: [
    { by: "IBM", name: "UX Design Professional Certificate", strong: true },
    { by: "IBM", name: "Introduction to UX/UI Design" },
    { by: "IBM", name: "Agile Development &amp; Scrum" },
    { by: "SkillUp", name: "UX/UI Design Fundamentals: Usability &amp; Visual Principles" },
    { by: "SkillUp", name: "UI/UX Wireframing &amp; Prototyping with Figma" },
    { by: "SkillUp", name: "Generative AI: The Future of UX/UI Design" },
  ],
  edu: [
    {
      yr: "2023",
      title: "<b>Master's — Digital Communication &amp; Media</b>",
      sub: "Istituto Europeo di Design (IED), Turin",
    },
    {
      yr: "2019",
      title: "<b>Software Development</b> (Specialisation)",
      sub: "Immaginazione e Lavoro, Turin",
    },
    { yr: "2018", title: "<b>Graphic Design</b>", sub: "Immaginazione e Lavoro, Turin" },
  ],
  langs: [
    { name: "Italian", level: "Native" },
    { name: "English", level: "B2" },
    { name: "Spanish", level: "B1" },
    { name: "French", level: "A2" },
  ],
  ctaTitle: "Take a look.",
  ctaSub:
    "Interactive CV, live case studies and design system — the links in this PDF are clickable.",
  portfolioBtn: "Open the portfolio",
};

const IT: Locale = {
  lang: "it",
  file: "Giulio_Occhipinti_UX_Designer_CV.pdf",
  positioning: "UX/UI Designer · Frontend Developer",
  creds:
    "UX/UI certificato IBM · Master IED in Comunicazione Digitale · Frontend developer, 6+ anni su prodotti enterprise · Altro nel sito",
  location: "Torino, Italia",
  linkedinUrl: "https://www.linkedin.com/in/giulio-occhipinti?locale=it_IT",
  siteLabel: "Sito",
  workLinkLabel: "Leggi il case study",
  qrCap: "Inquadra il codice o tocca il pulsante,<br>tutto il sito è interattivo",
  visitBtn: "Visita il sito",
  profileLead: "Coltivatore di empatia e battute in tasca.",
  profile:
    "Tantissimi lavori diversi alle spalle, alcune piante in casa e un passaporto ben timbrato. Ho vissuto in tre Stati diversi prima di tornare in Italia, ma sono riuscito a fare il bagno nei tre oceani balneabili, gli altri due sono troppo freddi. Improvvisatore di battute e in viaggio, ho messo radici nel digitale, mantenendo una forte sensibilità, caratteristica che le persone mi fanno notare spesso, verso gli altri e me stesso, strizzando l'occhiolino alla poesia e alla fotografia. Attualmente cerco di unire i puntini nel mondo UX/UI design, sviluppo software e strategie digitali, applicando la stessa logica che serve negli scacchi. Gioco cercando la mossa che anticipa.",
  secExperience: "Esperienza",
  expEyebrow: "selezione · più recenti prima",
  earlier:
    "Prima — Frontend Developer in ForgeLab (2021–22) e Consoft (2019–21) · Fotografo freelance dal 2009.",
  secWork: "Lavori selezionati",
  workEyebrow: "case study completi online",
  secSkills: "Competenze",
  skillsEyebrow: "gli strumenti del mestiere",
  secCerts: "Certificazioni",
  secEdu: "Formazione",
  secLangs: "Lingue",
  experiences: [
    {
      yr: "2026 — oggi",
      loc: "Torino / Remoto",
      role: "UX Researcher &amp; Product Strategist",
      org: "Product discovery indipendente",
      bullets: [
        "Ho capovolto l'ideazione mettendo la <b>ricerca prima</b>: bisogni comportamentali mappati su Miro, classificati per gravità, prima di ogni idea.",
        "Validazione con <b>7 interviste a utenti target</b> e analisi dei competitor; una matrice Valore/Sforzo ha ridotto <b>17 concept a 1</b>, ora in un prototipo Figma ad alta fedeltà.",
      ],
    },
    {
      yr: "2026",
      loc: "Italia / Remoto",
      role: "UX/UI Designer",
      org: "Bambagia Design Lab (freelance)",
      bullets: [
        "Ho progettato le interfacce del sito di un cliente: <b>ricerca su cliente e competitor prima di disegnare</b>, ogni scelta di interfaccia motivata, non estetica.",
        "Wireframe, prototipo e HTML/CSS scritti a mano; varianti di palette convertite in <b>Figma</b> con plugin, e un flusso di consegna che il cliente modifica in autonomia.",
      ],
    },
    {
      yr: "2024 — oggi",
      loc: "Torino / Remoto",
      role: "UX/UI Designer &amp; Developer",
      org: "Digital CV, progetto open-source personale",
      bullets: [
        "Guidato dalla ricerca: ho definito i <b>3 lettori reali</b> (recruiter, CTO, art director) e i loro bisogni in 3 secondi; ogni scelta difendibile in un colloquio.",
        "Architettura dell'informazione knolling (un profilo, quattro lenti) e un <b>design system WCAG-AA</b>; costruito AI-augmented (Copilot, Claude) con <b>oltre 80% di copertura test</b>.",
      ],
    },
    {
      yr: "2019 — oggi",
      loc: "Torino, Italia",
      role: "Frontend Developer",
      org: "ALTEN Italia @ Aruba &amp; Intesa San Paolo",
      bullets: [
        "Per <b>Aruba</b> ho costruito il design system: una <b>libreria di 100+ componenti</b> in Lit, insieme al team di design, nel rispetto di tipografia, spaziature e stati definiti in Figma.",
        "Sul design system Aruba ero <b>Tech Lead e, in quel ruolo, Scrum Master</b>; per <b>Intesa San Paolo</b> ho lavorato come frontend developer su Angular enterprise, con test sistematici (Jest).",
      ],
    },
    {
      yr: "2023 — 2024",
      loc: "Italia / Remoto",
      role: "Digital Strategist",
      org: "Music Agency",
      bullets: [
        "Content strategy rivolta al settore, non a un pubblico generico; ho <b>raddoppiato un seguito mirato</b> (musicisti, etichette, promoter) in modo organico.",
        "Ho ideato una <b>playlist mirata</b> per coinvolgere musicisti e addetti ai lavori: più follower, collaborazioni e contatti di settore; ho organizzato un evento live end-to-end.",
      ],
    },
  ],
  works: [
    {
      title: "Product Discovery — UX Research",
      desc: "Mappa dei bisogni comportamentali, interviste utente e analisi dei competitor per validare la domanda reale prima di una riga di codice.",
      outcome: "17 concept → 1, validati con gli utenti",
      url: `${SITE}/work/product-discovery`,
    },
    {
      title: "CV Digitale Interattivo",
      desc: "IA guidata dalla ricerca (un profilo, quattro lenti), design system WCAG-AA e build AI-augmented. Il gemello live di questo documento.",
      outcome: "Design system · WCAG AA · &gt;80% copertura",
      url: `${SITE}/work/digital-cv`,
    },
  ],
  skills: [
    {
      label: "UX / UI",
      key: true,
      chips: [
        "UX Research",
        "Interviste utente",
        "Wireframing",
        "Prototipazione",
        "Usabilità",
        "Architettura dell'informazione",
        "Design system",
        "Accessibilità · WCAG AA",
        "Interaction Design",
      ],
    },
    {
      label: "Strumenti di design",
      chips: ["Figma", "Miro", "Visily", "UX Pilot", "Google Stitch", "GSAP", "WordPress", "Wix", "AI", "Claude"],
    },
    {
      label: "Frontend",
      chips: ["HTML5", "CSS / SCSS", "TypeScript", "Angular", "React", "Lit", "WebComponents", "Astro"],
    },
    {
      label: "Flusso AI",
      chips: ["MCP Protocol", "Prompt Engineering", "GitHub Copilot", "Claude"],
    },
  ],
  certs: [
    { by: "IBM", name: "UX Design Professional Certificate", strong: true },
    { by: "IBM", name: "Introduction to UX/UI Design" },
    { by: "IBM", name: "Agile Development &amp; Scrum" },
    { by: "SkillUp", name: "UX/UI Design Fundamentals: Usability &amp; Visual Principles" },
    { by: "SkillUp", name: "UI/UX Wireframing &amp; Prototyping with Figma" },
    { by: "SkillUp", name: "Generative AI: The Future of UX/UI Design" },
  ],
  edu: [
    {
      yr: "2023",
      title: "<b>Master — Comunicazione Digitale &amp; Media</b>",
      sub: "Istituto Europeo di Design (IED), Torino",
    },
    {
      yr: "2019",
      title: "<b>Sviluppo Software</b> (Specializzazione)",
      sub: "Immaginazione e Lavoro, Torino",
    },
    { yr: "2018", title: "<b>Graphic Design</b>", sub: "Immaginazione e Lavoro, Torino" },
  ],
  langs: [
    { name: "Italiano", level: "Madrelingua" },
    { name: "Inglese", level: "B2" },
    { name: "Spagnolo", level: "B1" },
    { name: "Francese", level: "A2" },
  ],
  ctaTitle: "Dai un'occhiata.",
  ctaSub:
    "CV interattivo, case study live e design system: i link in questo PDF sono cliccabili.",
  portfolioBtn: "Apri il portfolio",
};

const locales: Locale[] = [IT, EN];

// ── Template ─────────────────────────────────────────────────────────────────

const expHtml = (e: Experience): string => `
  <div class="entry">
    <div class="entry__meta"><span class="yr">${e.yr}</span><span class="loc">${e.loc}</span></div>
    <div class="entry__body">
      <div class="entry__head"><span class="entry__role">${e.role}</span> · <span class="entry__org">${e.org}</span></div>
      <ul>${e.bullets.map((b) => `<li>${b}</li>`).join("")}</ul>
    </div>
  </div>`;

const workHtml = (w: Work, linkLabel: string): string => `
    <article class="wcard">
      <div class="wt">${w.title}</div>
      <div class="wd">${w.desc}</div>
      <div class="wo">${w.outcome}</div>
      <div class="wl"><a class="lnk" href="${w.url}">${linkLabel}</a></div>
    </article>`;

const skillHtml = (g: SkillGroup): string => `
  <div class="grp"><div class="lbl">${g.label}</div><div class="chips">${g.chips
    .map((c) => `<span class="chip${g.key ? " key" : ""}">${c}</span>`)
    .join("")}</div></div>`;

const certHtml = (c: Cert): string =>
  `<div class="li"><span class="b">${c.by}</span><span class="t">${
    c.strong ? `<b>${c.name}</b>` : c.name
  }</span></div>`;

const eduHtml = (e: Edu): string =>
  `<div class="li"><span class="b">${e.yr}</span><span class="t">${e.title}<br><span>${e.sub}</span></span></div>`;

const langHtml = (l: Lang): string =>
  `<span class="lg"><b>${l.name}</b> <span>${l.level}</span></span>`;

export { locales };
export function buildHtml(L: Locale): string {
  return `<!doctype html><html lang="${L.lang}"><head><meta charset="utf-8"><title>Giulio Occhipinti — UX/UI Designer</title><style>
@font-face{font-family:'Lexend';font-weight:400;src:url(${lex(400)}) format('woff2');}
@font-face{font-family:'Lexend';font-weight:600;src:url(${lex(600)}) format('woff2');}
@font-face{font-family:'Lexend';font-weight:700;src:url(${lex(700)}) format('woff2');}
@font-face{font-family:'Lexend';font-weight:800;src:url(${lex(800)}) format('woff2');}
@font-face{font-family:'JetBrains Mono';font-weight:500;src:url(${jb(500)}) format('woff2');}
@font-face{font-family:'JetBrains Mono';font-weight:700;src:url(${jb(700)}) format('woff2');}

/* ── Design System tokens (creative lens) ── */
:root{
  --bg:rgb(8,73,67); --cream:rgb(245,240,230);
  --mut:rgba(192,220,215,.85); --mut-or:rgba(255,195,155,.82);
  --accent:rgb(255,107,53);
  --line:rgba(255,255,255,.14); --line-or:rgba(255,107,53,.30);
  --surface:rgba(255,255,255,.045);
  --sans:'Lexend',system-ui,sans-serif; --mono:'JetBrains Mono',ui-monospace,monospace;
}
@page{size:A4;margin:0;}
*{box-sizing:border-box;margin:0;padding:0;}
html{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
body{font-family:var(--sans);color:var(--cream);background:var(--bg);font-size:9.3pt;line-height:1.44;}
a{color:inherit;text-decoration:none;}

/* Foglio A4: ottanio a tutti i bordi + padding interno uniforme, uguale su ogni pagina */
.sheet{width:210mm;height:297mm;box-sizing:border-box;padding:15mm 15mm 14mm;
  background:var(--bg);overflow:hidden;position:relative;}
.sheet > section:first-child,.sheet > .head:first-child{margin-top:0;}

/* link = accent + underline (clickable, no icon) */
a.lnk{color:var(--accent);text-decoration:underline;text-decoration-thickness:.8pt;
  text-underline-offset:1.8pt;font-weight:600;}
.btn{display:inline-flex;align-items:center;justify-content:center;font-family:var(--sans);
  font-weight:700;font-size:10pt;letter-spacing:-.01em;padding:3.2mm 6mm;border-radius:2mm;
  background:var(--accent);color:var(--bg);text-decoration:none;}

/* ── HEADER ── */
.head{margin:0 0 5mm;padding:0 0 6mm;
  display:grid;grid-template-columns:1fr auto;gap:11mm;align-items:start;
  border-bottom:1.5px solid var(--line);}
.name{font-weight:800;font-size:27pt;line-height:1;letter-spacing:-.02em;}
.posit{font-weight:700;font-size:12pt;color:var(--accent);margin-top:2mm;letter-spacing:-.01em;}
.creds{font-family:var(--mono);font-weight:500;font-size:7.6pt;line-height:1.5;letter-spacing:.02em;
  color:var(--mut);margin-top:3mm;max-width:52em;}
.contacts{display:flex;flex-wrap:wrap;gap:2.4mm 5.5mm;margin-top:4.5mm;
  font-family:var(--mono);font-weight:500;font-size:8.2pt;}
.contacts .ct{display:inline-flex;align-items:baseline;gap:1.6mm;}
.contacts .lab{font-size:6.6pt;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--accent);}
.contacts .plain{color:var(--mut);}
.contacts a.on-dark{color:var(--cream);text-decoration:underline;
  text-decoration-color:var(--accent);text-decoration-thickness:.8pt;text-underline-offset:1.8pt;}

.qcol{display:flex;flex-direction:column;align-items:center;gap:3.5mm;width:42mm;}
.qcol img{width:42mm;height:42mm;display:block;border-radius:3mm;}
.qcol .cap{font-family:var(--mono);font-weight:500;font-size:6.6pt;letter-spacing:.03em;
  color:var(--mut);text-align:center;line-height:1.4;}
.qcol .btn{width:100%;}

/* ── SECTIONS ── */
section{margin-top:4mm;}
.sec-h{display:flex;align-items:baseline;gap:3mm;margin-bottom:3mm;
  border-bottom:1.5px solid var(--line);padding-bottom:1.8mm;}
.sec-h h2{font-weight:800;font-size:11pt;letter-spacing:-.01em;}
.sec-h span{font-family:var(--mono);font-weight:700;font-size:6.6pt;letter-spacing:.16em;
  text-transform:uppercase;color:var(--accent);}

.profile-lead{font-weight:700;font-size:11.5pt;letter-spacing:-.01em;color:var(--cream);margin-bottom:1.3mm;}
.profile{font-size:9.1pt;line-height:1.36;max-width:64em;color:var(--cream);}

/* Experience */
.entry{display:grid;grid-template-columns:34mm 1fr;gap:6mm;padding:1.5mm 0;
  break-inside:avoid;border-top:1px solid var(--line);}
.entry:first-of-type{border-top:0;padding-top:.5mm;}
.entry__meta{font-family:var(--mono);font-size:7.4pt;line-height:1.5;color:var(--mut);}
.entry__meta .yr{display:block;font-weight:700;color:var(--cream);font-size:7.8pt;letter-spacing:.02em;}
.entry__meta .loc{display:block;margin-top:.8mm;}
.entry__head{margin-bottom:1.2mm;}
.entry__role{font-weight:700;font-size:10pt;letter-spacing:-.01em;color:var(--cream);}
.entry__org{font-weight:600;font-size:9.4pt;color:var(--accent);}
.entry ul{list-style:none;display:flex;flex-direction:column;gap:.9mm;}
.entry li{position:relative;padding-left:4.2mm;font-size:9pt;line-height:1.32;}
.entry li::before{content:"";position:absolute;left:0;top:1.4mm;width:1.6mm;height:1.6mm;
  border-radius:50%;background:var(--accent);}
.entry li b{font-weight:700;}
.earlier{margin-top:1.8mm;padding-top:1.8mm;border-top:1px solid var(--line);
  font-family:var(--mono);font-size:7.6pt;line-height:1.45;color:var(--mut);}

/* Selected work */
.work{display:grid;grid-template-columns:1fr 1fr;gap:5mm;}
.wcard{border:1.5px solid var(--line-or);border-radius:2.5mm;padding:4mm;break-inside:avoid;
  background:var(--surface);display:flex;flex-direction:column;gap:2mm;}
.wcard .wt{font-weight:700;font-size:9.6pt;letter-spacing:-.01em;color:var(--cream);}
.wcard .wd{font-size:8.6pt;line-height:1.42;color:var(--cream);}
.wcard .wo{font-family:var(--mono);font-weight:700;font-size:7.6pt;color:var(--accent);}
.wcard .wl{margin-top:auto;border-top:1px solid var(--line);padding-top:2mm;font-size:7.8pt;}

/* Skills */
.grp{margin-bottom:3mm;break-inside:avoid;}
.grp:last-child{margin-bottom:0;}
.grp .lbl{font-family:var(--mono);font-weight:700;font-size:6.8pt;letter-spacing:.12em;
  text-transform:uppercase;color:var(--mut);margin-bottom:1.8mm;}
.chips{display:flex;flex-wrap:wrap;gap:1.8mm;}
.chip{font-family:var(--mono);font-weight:500;font-size:7.6pt;padding:1mm 2.4mm;
  border:1px solid var(--line);border-radius:1.6mm;color:var(--cream);}
.chip.key{border-color:var(--line-or);color:var(--accent);font-weight:700;}

/* Certs / Edu / Languages */
.twoup{display:grid;grid-template-columns:1fr 1fr;gap:6mm;}
.list{display:flex;flex-direction:column;gap:1.8mm;}
.li{display:grid;grid-template-columns:15mm 1fr;gap:3mm;font-size:8.6pt;line-height:1.4;break-inside:avoid;}
.li .b{font-family:var(--mono);font-weight:700;font-size:7pt;color:var(--accent);white-space:nowrap;padding-top:.4mm;}
.li .t b{font-weight:700;color:var(--cream);} .li .t span{color:var(--mut);}
.langs{display:flex;flex-wrap:wrap;gap:2.4mm 5mm;font-size:8.8pt;margin-top:.5mm;}
.langs .lg b{font-weight:700;} .langs .lg span{font-family:var(--mono);font-size:7.4pt;color:var(--accent);}

/* CTA */
.cta{margin-top:6mm;border:1.5px solid var(--line-or);background:var(--surface);border-radius:3mm;
  padding:5mm;display:flex;justify-content:space-between;align-items:center;gap:6mm;break-inside:avoid;}
.cta__t{font-weight:700;font-size:11pt;letter-spacing:-.01em;color:var(--cream);}
.cta__s{font-family:var(--mono);font-size:7.6pt;color:var(--mut);margin-top:2mm;line-height:1.4;}

</style></head><body>

<div class="sheet">
<header class="head">
  <div>
    <h1 class="name">Giulio Occhipinti</h1>
    <p class="posit">${L.positioning}</p>
    <p class="creds">${L.creds}</p>
    <div class="contacts">
      <span class="ct"><span class="lab">Email</span> <a class="on-dark" href="mailto:giulio.occhipinti.g@gmail.com">giulio.occhipinti.g@gmail.com</a></span>
      <span class="ct"><span class="lab">LinkedIn</span> <a class="on-dark" href="${L.linkedinUrl}">in/giulio-occhipinti</a></span>
      <span class="ct"><span class="lab">${L.siteLabel}</span> <a class="on-dark" href="${SITE}">giulio-occhipinti.com</a></span>
      <span class="ct plain">${L.location}</span>
    </div>
  </div>
  <figure class="qcol">
    <a href="${SITE}"><img src="${qr}" alt="QR code — ${SITE}"></a>
    <div class="cap">${L.qrCap}</div>
    <a class="btn" href="${SITE}">${L.visitBtn}</a>
  </figure>
</header>

<section>
  <p class="profile-lead">${L.profileLead}</p>
  <p class="profile">${L.profile}</p>
</section>

<section>
  <div class="sec-h"><h2>${L.secExperience}</h2><span>${L.expEyebrow}</span></div>
  ${L.experiences.map(expHtml).join("\n")}
  <div class="earlier">${L.earlier}</div>
</section>

</div><!-- /sheet 1 -->

<div class="sheet">
<section>
  <div class="sec-h"><h2>${L.secWork}</h2><span>${L.workEyebrow}</span></div>
  <div class="work">${L.works.map((w) => workHtml(w, L.workLinkLabel)).join("\n")}</div>
</section>

<section>
  <div class="sec-h"><h2>${L.secSkills}</h2><span>${L.skillsEyebrow}</span></div>
  ${L.skills.map(skillHtml).join("\n")}
</section>

<section>
  <div class="twoup">
    <div>
      <div class="sec-h"><h2>${L.secCerts}</h2></div>
      <div class="list">${L.certs.map(certHtml).join("")}</div>
    </div>
    <div>
      <div class="sec-h"><h2>${L.secEdu}</h2></div>
      <div class="list">${L.edu.map(eduHtml).join("")}</div>
      <div class="sec-h" style="margin-top:5mm"><h2>${L.secLangs}</h2></div>
      <div class="langs">${L.langs.map(langHtml).join("")}</div>
    </div>
  </div>
</section>

<div class="cta">
  <div>
    <div class="cta__t">${L.ctaTitle}</div>
    <div class="cta__s">${L.ctaSub}</div>
  </div>
  <a class="btn" href="${SITE}/work">${L.portfolioBtn}</a>
</div>
</div><!-- /sheet 2 -->

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

// Esegui solo se invocato direttamente (non all'import, così i preview/test
// possono importare buildHtml senza lanciare Chromium).
const invokedDirectly =
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

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
 * Il template HTML vive in cv-pdf-template.ts (buildHtml/buildHtmlAts, puro,
 * nessun fs) — questo file resta il proprietario dei contenuti IT/EN e del
 * CLI Playwright, così lo stesso template è riusabile anche dalla funzione
 * serverless del tool mobile (cv-site/src/server/cv-recruiter/render-pdf.ts).
 *
 * Output (cartella gitignorata: sono documenti personali, non vanno pushati):
 *   cv-output/Giulio_Occhipinti_UX_Designer_CV.pdf                (IT)
 *   cv-output/Giulio_Occhipinti_UX_Designer_CV_EN.pdf             (EN)
 *   cv-output/Giulio_Occhipinti_UX_Designer_CV_ATS_DRAFT.pdf      (IT, draft single-column ATS-safe)
 *   cv-output/Giulio_Occhipinti_UX_Designer_CV_EN_ATS_DRAFT.pdf   (EN, draft single-column ATS-safe)
 *
 * Uso:
 *   npm run pdf:ux
 *   (equivale a: node --import tsx/esm scripts/generate-ux-cv.ts)
 *
 * In ambienti dove il Chromium di Playwright non è nella posizione di default,
 * passare il percorso via env PLAYWRIGHT_CHROMIUM_EXECUTABLE.
 */

import { chromium } from "playwright";
import { mkdirSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { buildHtml, buildHtmlAts, type Locale } from "./cv-pdf-template.js";
import { loadPdfAssets } from "./load-pdf-assets.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const OUT_DIR = resolve(ROOT, "cv-output");
const ASSETS = loadPdfAssets(ROOT);

export type { Locale };

// ── Locale content ───────────────────────────────────────────────────────────

const SITE = "https://giulio-occhipinti.com";

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
    "Earlier — Frontend Developer at Forge Lab (2021–22) and Consoft (2019–21) · Freelance photographer since 2009.",
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
      loc: "Italy / Remote",
      role: "UX/UI Designer",
      org: "Bambagia Design Lab (freelance)",
      bullets: [
        "Designed a client's website interfaces: <b>studied the client and competitors before designing</b> — every interface choice motivated, not aesthetic.",
        "Wireframes, prototype and hand-coded HTML/CSS; palette variants converted to <b>Figma</b> via plugins, with a delivery flow the client can edit independently.",
      ],
    },
    {
      yr: "2026 — present",
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
      yr: "2025 — present",
      loc: "Turin / Remote",
      role: "Digital Innovation Consultant &amp; Lead Developer",
      org: "Internal project — business management platform",
      bullets: [
        "Designed and built an internal business platform end-to-end, process analysis to deploy: an <b>MCP architecture</b> (tools/resources/prompts as APIs for AI agents) integrated with VS Code Copilot and Cursor.",
        "Automated the <b>Cursor → GitLab CI/CD → deploy</b> pipeline (zero manual steps) and designed the flows for non-technical operators, working in <b>1–2 week sprints</b> with impact measured at every release.",
      ],
    },
    {
      yr: "2026",
      loc: "Turin / Remote",
      role: "UX Researcher &amp; Product Strategist",
      org: "Independent product discovery",
      bullets: [
        "With a technical partner, applied <b>Design Thinking</b> and <b>Effectuation</b> to invert classic ideation — research into real behavioural needs first, the idea after — mapped on Miro through the <b>Four Forces</b> (Jobs to Be Done) lens.",
        "Validated with <b>7 target-user interviews</b> and competitor analysis; broke down the strongest ideas with the <b>Value Proposition Canvas</b>, narrowing <b>17 concepts to 1</b> with a Value/Effort matrix.",
        "Built the <b>pPoC Engine</b>: a Probabilistic Proof of Concept in a high-fidelity Figma prototype, now validating real behaviour before writing any code.",
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
      desc: "With a technical partner: a behavioural needs map, user interviews and competitor analysis to validate real demand before a single line of code.",
      outcome: "17 concepts → 1, user-validated",
      url: `${SITE}/work/product-discovery`,
    },
    {
      title: "Interactive Digital CV",
      desc: "Research-led IA (one profile, four lenses), a WCAG-AA design system and an AI-augmented build. The live twin of this document.",
      outcome: "Design system · WCAG AA · &gt;80% coverage",
      url: `${SITE}/work/digital-cv`,
    },
    {
      title: "trip-runway — Travel Budget Yield App",
      desc: "Turned a personal flight-price script into a web app that crosses flight cost with cost of living to calculate the maximum sustainable trip length on a fixed budget.",
      outcome: "Next.js · Supabase · anti-abuse API architecture",
      url: `${SITE}/work/trip-runway`,
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
        "Design Thinking",
        "Effectuation",
        "Value Proposition Canvas",
        "Four Forces (JTBD)",
      ],
    },
    {
      label: "Design tools",
      chips: [
        "Figma",
        "Miro",
        "Visily",
        "UX Pilot",
        "Google Stitch",
        "GSAP",
        "WordPress",
        "Wix",
        "AI",
        "Claude",
      ],
    },
    {
      label: "Frontend",
      chips: [
        "HTML5",
        "CSS / SCSS",
        "TypeScript",
        "Angular",
        "React",
        "Lit",
        "WebComponents",
        "Astro",
      ],
    },
    {
      label: "AI workflow",
      chips: ["MCP", "Prompt Engineering", "GitHub Copilot", "Cursor", "Claude"],
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
    "Prima — Frontend Developer in Forge Lab (2021–22) e Consoft (2019–21) · Fotografo freelance dal 2009.",
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
      loc: "Italia / Remoto",
      role: "UX/UI Designer",
      org: "Bambagia Design Lab (freelance)",
      bullets: [
        "Ho progettato le interfacce del sito di un cliente: <b>ricerca su cliente e competitor prima di disegnare</b>, ogni scelta di interfaccia motivata, non estetica.",
        "Wireframe, prototipo e HTML/CSS scritti a mano; varianti di palette convertite in <b>Figma</b> con plugin, e un flusso di consegna che il cliente modifica in autonomia.",
      ],
    },
    {
      yr: "2026 — oggi",
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
      yr: "2025 — oggi",
      loc: "Torino / Remoto",
      role: "Consulente per l'Innovazione Digitale &amp; Lead Developer",
      org: "Progetto interno — gestionale aziendale",
      bullets: [
        "Ho progettato e sviluppato un gestionale aziendale interno end-to-end, dall'analisi dei processi al deploy: un'<b>architettura MCP</b> (tool/resource/prompt come API per agenti AI) integrata con VS Code Copilot e Cursor.",
        "Ho automatizzato la pipeline <b>Cursor → GitLab CI/CD → deploy</b> (zero interventi manuali) e progettato i flussi per operatori non tecnici, in <b>sprint da 1-2 settimane</b> con impactScore misurato a ogni rilascio.",
      ],
    },
    {
      yr: "2026",
      loc: "Torino / Remoto",
      role: "UX Researcher &amp; Product Strategist",
      org: "Product discovery indipendente",
      bullets: [
        "Con un socio tecnico, ho applicato <b>Design Thinking</b> ed <b>Effectuation</b> per invertire l'ideazione classica: prima la ricerca sui bisogni comportamentali reali, poi l'idea — mappati su Miro con la lente delle <b>Four Forces</b> (Jobs to Be Done).",
        "Validazione con <b>7 interviste a utenti target</b> e analisi dei competitor; ho destrutturato le idee più forti con il <b>Value Proposition Canvas</b>, riducendo <b>17 concept a 1</b> con una matrice Valore/Sforzo.",
        "Ho costruito il <b>pPoC Engine</b>: un Probabilistic Proof of Concept in un prototipo Figma ad alta fedeltà, oggi al lavoro per validare il comportamento reale prima di scrivere codice.",
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
      desc: "Con un socio tecnico: mappa dei bisogni comportamentali, interviste utente e analisi dei competitor per validare la domanda reale prima di una riga di codice.",
      outcome: "17 concept → 1, validati con gli utenti",
      url: `${SITE}/work/product-discovery`,
    },
    {
      title: "CV Digitale Interattivo",
      desc: "IA guidata dalla ricerca (un profilo, quattro lenti), design system WCAG-AA e build AI-augmented. Il gemello live di questo documento.",
      outcome: "Design system · WCAG AA · &gt;80% copertura",
      url: `${SITE}/work/digital-cv`,
    },
    {
      title: "trip-runway — Travel Budget Yield App",
      desc: "Ho trasformato uno script personale di ricerca voli in una web app che incrocia il costo del volo con il costo della vita per calcolare i giorni massimi di viaggio sostenibili con un budget fisso.",
      outcome: "Next.js · Supabase · architettura API anti-abuso",
      url: `${SITE}/work/trip-runway`,
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
        "Design Thinking",
        "Effectuation",
        "Value Proposition Canvas",
        "Four Forces (JTBD)",
      ],
    },
    {
      label: "Strumenti di design",
      chips: [
        "Figma",
        "Miro",
        "Visily",
        "UX Pilot",
        "Google Stitch",
        "GSAP",
        "WordPress",
        "Wix",
        "AI",
        "Claude",
      ],
    },
    {
      label: "Frontend",
      chips: [
        "HTML5",
        "CSS / SCSS",
        "TypeScript",
        "Angular",
        "React",
        "Lit",
        "WebComponents",
        "Astro",
      ],
    },
    {
      label: "Flusso AI",
      chips: ["MCP", "Prompt Engineering", "GitHub Copilot", "Cursor", "Claude"],
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
  ctaSub: "CV interattivo, case study live e design system: i link in questo PDF sono cliccabili.",
  portfolioBtn: "Apri il portfolio",
};

const locales: Locale[] = [IT, EN];

export { locales };

async function main(): Promise<void> {
  mkdirSync(OUT_DIR, { recursive: true });
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
  const browser = await chromium.launch(executablePath ? { executablePath } : {});
  const page = await browser.newPage();

  for (const L of locales) {
    await page.setContent(buildHtml(L, ASSETS), { waitUntil: "networkidle" });
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

  // Draft ATS-puro — file separato, non sostituisce quello disegnato sopra.
  for (const L of locales) {
    await page.setContent(buildHtmlAts(L, ASSETS), { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const atsFile = L.file.replace(".pdf", "_ATS_DRAFT.pdf");
    const outPath = resolve(OUT_DIR, atsFile);
    await page.pdf({ path: outPath, format: "A4", printBackground: true });
    console.log(`PDF generato (draft ATS-puro): ${outPath}`);
  }

  await browser.close();
}

// Esegui solo se invocato direttamente (non all'import, così i preview/test
// possono importare buildHtml senza lanciare Chromium).
const invokedDirectly =
  process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

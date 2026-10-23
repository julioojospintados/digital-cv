/**
 * cv.ts — Single source of truth for all CV data.
 *
 * How to fill this file:
 *   - Use the Copilot prompt: .vscode/prompts/cv-intake.prompt.md
 *   - Or edit manually following the JSDoc comments on each field.
 *
 * This file is consumed by:
 *   - The Astro frontend (cv-site/) for rendering
 *   - The MCP server for AI tooling
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type LanguageLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | "Madrelingua" | "Native";
export type SkillLevel = "Base" | "Intermedio" | "Avanzato" | "Esperto";

export interface Language {
  name: string;
  level: LanguageLevel;
  /** Optional: CEFR certified, self-assessed, etc. */
  note?: string;
}

export type SkillDomain = "tech" | "human" | "creative" | "management" | "ai";
export type SkillWeight = 1 | 2 | 3 | 4 | 5;
export type SkillRole = "core" | "bridge" | "support";
export type LinkType = "technical" | "cross-domain" | "conceptual" | "workflow";

export interface SkillLink {
  target: string;
  type: LinkType;
  /** Narrative context shown in scatter plot tooltips */
  description?: string;
}

export interface ValueFlow {
  name: string;
  description: string;
  /** Ordered list of existing skill names — defines the value creation path */
  steps: string[];
}

export interface Skill {
  name: string;
  /** Etichetta compatta per lo skill-square su mobile (colonna singola) —
   * solo per i nomi troppo lunghi per una cella stretta. Il nome esteso
   * resta sempre in title/aria-label e su desktop. */
  shortName?: string;
  level: SkillLevel;
  /** Icon slug from https://simpleicons.org — optional */
  icon?: string;
  /** Primary domain of this skill */
  domain?: SkillDomain;
  /** Strategic importance 1–5 (5 = pillar, forces real hierarchy) */
  weight?: SkillWeight;
  /** Mastery 1–100 → Y axis in scatter plot: Esperto 90-100, Avanzato 75-85, Intermedio 50-70, Base 30-45 */
  mastery?: number;
  /** Role in the skill graph */
  role?: SkillRole;
  /** Related skills with typed relationship — used for graph visualization */
  links?: SkillLink[];
}

export interface SoftSkill {
  name: string;
  /** Vedi Skill.shortName */
  shortName?: string;
  /** One-line description or example context */
  description?: string;
  domain?: SkillDomain;
  weight?: SkillWeight;
  mastery?: number;
  role?: SkillRole;
  links?: SkillLink[];
}

export interface TransversalSkill {
  name: string;
  /** Vedi Skill.shortName */
  shortName?: string;
  description?: string;
  domain?: SkillDomain;
  weight?: SkillWeight;
  mastery?: number;
  role?: SkillRole;
  links?: SkillLink[];
}

/**
 * Variante di racconto per una lente/cluster: la stessa esperienza vista
 * da un'altra angolazione (es. ALTEN come sviluppo, come Tech Lead, come
 * design system). Il cluster con il mode corrispondente usa role,
 * description e highlights della facet al posto di quelli base.
 */
export interface ExperienceFacet {
  mode: "tech" | "creative" | "human";
  role?: string;
  description: string;
  highlights?: string[];
}

/**
 * Un incarico presso un cliente, dentro un unico rapporto di lavoro.
 *
 * Serve alle consulenze: da ALTEN, Giulio è stato su più clienti diversi
 * con ruoli diversi, ma è **un solo impiego** con una sola data d'inizio.
 * Modellarli come esperienze separate creerebbe periodi sovrapposti
 * nella cronologia — che è esattamente ciò che fa alzare un sopracciglio a
 * chi legge un CV. Appiattirli in `highlights` perderebbe invece il nome del
 * cliente, che per un consulente è il primo dato cercato.
 *
 * Campo opzionale: i renderer che non lo conoscono continuano a funzionare
 * su `description` + `highlights` come prima.
 */
export interface ClientEngagement {
  /** Nome del cliente, o "Progetto interno". */
  client: string;
  role: string;
  description: string;
  /**
   * Incarico svolto con l'AI dentro il flusso di lavoro.
   *
   * Dichiarato a mano e non dedotto dal testo: cercare "AI" o "MCP" nella
   * descrizione darebbe falsi positivi (un incarico può nominare l'AI senza
   * esserne stato toccato) ed è il tipo di euristica che si rompe in
   * silenzio alla prima riscrittura di una frase.
   */
  ai?: boolean;
}

export interface WorkExperience {
  company: string;
  role: string;
  /** ISO format: "2022-03" */
  startDate: string;
  /** ISO format or "present" */
  endDate: string | "present";
  location?: string;
  remote?: boolean;
  description: string;
  /** Key achievements or bullet points */
  highlights?: string[];
  skills?: string[];
  /** Mode tags for visual priority: "tech" | "creative" | "human" | "agile" | "ai-orchestration" | ... */
  tags?: string[];
  /** Varianti per cluster — vedi ExperienceFacet */
  facets?: ExperienceFacet[];
  /** Incarichi presso clienti dentro lo stesso impiego — vedi ClientEngagement */
  clients?: ClientEngagement[];
}

export interface Education {
  institution: string;
  degree: string;
  field?: string;
  /** ISO format: "2018-09" */
  startDate: string;
  /** ISO format: "2022-07" */
  endDate: string;
  location?: string;
  grade?: string;
  description?: string;
}

export interface Certification {
  name: string;
  issuer: string;
  /** ISO format: "2023-06" */
  date: string;
  /** Solo per un percorso durato anni: ISO "2019-12". La riga mostra l'intervallo. */
  endDate?: string;
  /** URL to credential */
  url?: string;
  /** Credential / certificate ID issued by the provider */
  credentialId?: string;
  expiryDate?: string;
  /** true if certification is still in progress */
  inProgress?: boolean;
}

export interface MethodologyItem {
  name: string;
  description: string;
}

export interface GrowthArea {
  /** The perceived weakness */
  name: string;
  /** How it is reframed as a professional strength */
  reframe: string;
}

export interface Project {
  name: string;
  description: string;
  url?: string;
  repoUrl?: string;
  tags?: string[];
  /** ISO format: "2024-01" */
  date?: string;
  // ── Case study — solo per i progetti con pagina dedicata /work/[slug] ──
  /** URL slug: /work/{slug} */
  slug?: string;
  /** Accent/mode primario della pagina case study */
  primaryMode?: "tech" | "creative" | "human";
  role?: string;
  problem?: string;
  /** 3-5 step del processo, in ordine — struttura da case study UX:
   *  ricerca → insight → ideazione → esecuzione (label nel testo dello step) */
  process?: string[];
  /** Decisioni chiave — mini "perché X e non Y" con trade-off espliciti;
   *  includere almeno un'iterazione/scarto reale: è ciò che rende credibile
   *  un case study UX */
  decisions?: { title: string; body: string }[];
  /** Risultati misurabili — stesso stile impactScore di aiWorkflow */
  outcomes?: string[];
  /** Cosa ho imparato — riflessioni finali, 2-3 righe ciascuna */
  learnings?: string[];
  /** Le automazioni costruite per il progetto, in tabella sul case study.
   *  `ai: true` le segna col badge AI e le mette in evidenza. */
  automations?: Automation[];
  /** Frase d'apertura della tabella: è anche la sua didascalia accessibile. */
  automationsIntro?: string;
}

export interface Automation {
  /** Il nome con cui la si riconosce. */
  name: string;
  /** Che cos'è e con cosa è fatta, in breve. */
  kind: string;
  /** A cosa serve, in una frase. */
  what: string;
  ai: boolean;
}

export interface AiWorkflowItem {
  tool: string;
  title: string;
  desc: string;
  impact: string;
  tags: string;
}

export interface Feedback {
  name: string;
  /** Job title of the person giving the feedback (e.g., "Recruiter / Head Hunter") */
  role?: string;
  /** Free-text testimonial — optional, can be added later */
  quote?: string;
  keywords: string[];
}

export interface Social {
  platform:
    "LinkedIn" | "GitHub" | "Twitter" | "Website" | "Email" | "Behance" | "Dribbble" | string;
  url: string;
  /** Display label, e.g. "@username" */
  label?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// CV Data — fill this object with your information
// ─────────────────────────────────────────────────────────────────────────────

export const cvData = {
  // ── Personal info ──────────────────────────────────────────────────────────
  personal: {
    name: "Giulio Occhipinti",
    title: "Consulente per l'Innovazione Digitale & Partner Tecnico per piccole e grandi realtà",
    // Renderizzato SOLO nel PDF delle candidature (generate-cv-pdf.ts): il
    // lettore è un recruiter, non un cliente. Voce scelta dall'utente il
    // 2026-07-16: la persona prima, le prove dopo (posizionamento-ux-ui-first).
    summary:
      "Arrivo al design da un percorso che non assomiglia a nessun manuale: teatro, palco, fotografia, 5 paesi e oltre 6 anni di frontend enterprise (Intesa San Paolo, Aruba, Rai Pubblicità). Oggi progetto interfacce con certificazioni IBM e SkillUp in UX/UI, lavoro in sprint brevi e uso l'AI dentro il flusso di lavoro. So costruire quello che disegno: è la differenza tra un mockup e un prodotto.",
    location: "Torino, Italia",
    avatar: "",
    availability: "available" as "available" | "open" | "not-available",
  },

  // ── Contact & social ───────────────────────────────────────────────────────
  social: [
    {
      platform: "LinkedIn",
      url: "https://www.linkedin.com/in/giulio-occhipinti",
      label: "/in/giulio-occhipinti",
    },
    {
      platform: "GitHub",
      url: "https://github.com/julioojospintados/digital-cv",
      label: "julioojospintados/digital-cv",
    },
    {
      platform: "Email",
      url: "mailto:giulio.occhipinti.g@gmail.com",
      label: "giulio.occhipinti.g@gmail.com",
    },
  ] as Social[],

  // ── Languages ─────────────────────────────────────────────────────────────
  languages: [
    { name: "Italiano", level: "Madrelingua" },
    {
      name: "Inglese",
      level: "B2",
      note: "Corso intensivo alla Callan School di Londra. L'ho usato professionalmente come event host e battitore d'asta per un evento europeo Burger King.",
    },
    {
      name: "Spagnolo",
      level: "B1",
      note: "L'ho imparato lavorando a Tulum, in Messico.",
    },
    { name: "Francese", level: "A2" },
  ] as Language[],

  // ── Work experience (most recent first) ───────────────────────────────────
  experience: [
    {
      company: "Progetto Interno — Gestionale aziendale (caso studio di Partnering Operativo)",
      role: "Consulente per l'Innovazione Digitale & Lead Developer",
      startDate: "2025-09",
      endDate: "present",
      location: "Torino, Italia",
      remote: true,
      description:
        "Ho progettato e sviluppato un gestionale aziendale interno, dall'analisi dei processi al deploy: architettura MCP con tool, resource e prompt come API per agenti AI, integrata con VS Code Copilot e Cursor, UX semplificata per operatori non tecnici e pipeline Cursor → GitLab CI/CD → deploy automatizzata. Lavoro in sprint da 1 a 2 settimane e misuro l'impactScore a ogni rilascio.",
      highlights: [
        "Ho progettato i flussi per chi il gestionale non lo conosce, non per chi lo ha scritto.",
        "Ho automatizzato la pipeline Cursor → GitLab CI/CD → deploy: zero interventi manuali.",
        "Ho messo Copilot e Cursor dentro il ciclo di sviluppo, non accanto.",
      ],
      skills: [
        "MCP",
        "TypeScript",
        "Node.js",
        "Hono",
        "Zod",
        "GitLab CI/CD",
        "Scrum",
        "AI Orchestration",
        "Cursor",
        "GitHub Copilot",
      ],
      tags: ["tech", "human", "ai-orchestration"],
      facets: [
        {
          mode: "human",
          role: "AI Workflow Designer",
          description:
            "Ho progettato il layer AI del gestionale: architettura MCP con tool, resource e prompt esposti come API per agenti, integrata con VS Code Copilot e Cursor. L'AI qui non è una demo: è il workflow quotidiano con cui il progetto viene sviluppato.",
          highlights: [
            "Ho progettato tool, resource e prompt MCP che espongono i dati del gestionale agli agenti AI.",
            "Ho istruito gli agenti con regole e vincoli espliciti: l'AI accelera solo dentro binari decisi prima.",
            "Ho automatizzato la pipeline Cursor → GitLab CI/CD → deploy: zero interventi manuali.",
          ],
        },
      ],
    },
    {
      company: "Digital CV — Progetto Open Source AI-Augmented",
      role: "AI Workflow Designer & Full-Stack Developer",
      startDate: "2026-04",
      endDate: "present",
      location: "Torino, Italia",
      remote: true,
      description:
        "Ho costruito questo CV interattivo end-to-end con GitHub Copilot e Claude come assistenti operativi: architettura, UI, animazioni GSAP, server MCP e API HTTP con Hono. Il sito usa Astro e Lit, il server MCP espone i dati come API per agenti AI.",
      highlights: [
        "Ho sviluppato un server MCP con tool, resource e prompt template che espone i dati del CV ad agenti AI (VS Code Copilot, Claude Desktop).",
        "Ho sviluppato il sito con Astro, Lit e animazioni GSAP: preloader narrativo, wave hold effect SVG, distortion filter via feTurbulence.",
        "Ho sviluppato il server HTTP con Hono, spec OpenAPI, validazione Zod e test Vitest.",
      ],
      skills: [
        "MCP Protocol",
        "Prompt Engineering",
        "GitHub Copilot",
        "Claude",
        "Cursor",
        "Astro",
        "Lit",
        "GSAP",
        "TypeScript",
        "Hono",
        "Zod",
        "Vitest",
      ],
      tags: ["tech", "ai-orchestration"],
      facets: [
        {
          mode: "human",
          role: "AI Workflow Designer",
          description:
            "Questo sito è la dimostrazione pubblica del mio workflow AI: server MCP con tool, resource e prompt template che espone i dati del CV agli agenti (VS Code Copilot, Claude Desktop), e sviluppo AI-augmented con GitHub Copilot e Claude dentro vincoli decisi prima.",
          highlights: [
            "Ho progettato il server MCP che trasforma il CV in una API per agenti AI.",
            "Ho definito le regole del vibe coding prima dei componenti: token, regole di animazione, DO NOT espliciti.",
            "Ho documentato il metodo nel case study del sito: ogni scelta è argomentabile in colloquio.",
          ],
        },
      ],
    },
    {
      company: "ALTEN Italia",
      role: "Frontend Developer & UX/UI Design System",
      startDate: "2021-04",
      endDate: "present",
      location: "Torino, Italia",
      remote: false,
      description: "Consulenza Frontend, UX/UI, Metodo Agile e AI Augmentation.",
      // Tre incarichi, un solo impiego: vedi ClientEngagement sopra.
      clients: [
        {
          client: "Progetto interno",
          role: "Frontend Developer AI-Augmented",
          ai: true,
          description:
            "Sviluppo basato su AI pair programming evoluto con stesura di agenti, skills dedicate e istruzioni di contesto via Model Context Protocol (MCP). L'uso di agenti AI e server MCP ha trasformato e velocizzato il flusso di lavoro, semplificando la prototipazione rapida e l'integrazione tra interfaccia e codice. Automazione dei flussi nel ciclo Agile su GitLab, test in Playwright e presidio diretto di layout e UX/UI Design.",
        },
        {
          client: "Aruba",
          role: "Tech Lead · UX/UI & Design System Developer",
          description:
            "Progettazione e sviluppo della libreria di Web Components in Lit (100+ componenti usati per la realizzazione degli applicativi aziendali). Allineamento continuo con i team UX/UI su Figma, cura dei principi di accessibilità (WCAG) e integrazione di Storybook per la documentazione. Gestione delle code review, architettura SCSS modulare con BEM e test unitari con Jest e poi Vitest. Nel ruolo di Tech Lead ho gestito il team Agile facendo da ponte tra design e sviluppo per velocizzare l'onboarding e la consegna dei componenti.",
        },
        {
          client: "Intesa Sanpaolo",
          role: "Frontend Developer",
          description:
            "Sviluppo frontend in Angular su architetture complesse all'interno di un team distribuito di +30 persone. Programmazione reattiva con RxJS e collaborazione stretta con il backend in sprint Agile.",
        },
      ],
      highlights: [
        "Ho guidato come Tech Lead e Scrum Master il team Aruba Design System, oltre 3 anni e più di 30 persone: libreria di oltre 100 componenti WebComponents adottata cross-prodotto.",
        "Ho lavorato sul lato UX/UI del design system Aruba: stati, accessibilità (WCAG) e coerenza visiva dei componenti, allineati con i designer su Figma.",
        "Ho sviluppato architettura Angular enterprise per Intesa San Paolo in un team di oltre 30 persone, con standard condivisi e code review.",
        "Ho introdotto test unitari sistematici con Jest, per rendere più stabili i rilasci.",
      ],
      skills: [
        "Angular",
        "TypeScript",
        "Lit (Web Components)",
        "Node.js",
        "RxJS",
        "HTML5",
        "CSS3/SCSS",
        "Pattern BEM",
        "Storybook",
        "Playwright",
        "Jest",
        "Vitest",
        "Testing Cross-Device",
        "Test di Usabilità",
        "WCAG (Accessibilità)",
        "Model Context Protocol (MCP)",
        "Agenti AI",
        "AI Workflow Design",
        "Prompt Engineering",
        "GitHub Copilot",
        "Design System",
        "UX/UI Design",
        "Prototipazione Rapida",
        "Figma-to-Code",
        "REST API",
        "GitLab",
        "Agile",
        "Scrum",
      ],
      facets: [
        {
          mode: "creative",
          role: "UX/UI & Design System Developer — Aruba",
          description:
            "Ho costruito il design system di Aruba dal lato di chi lo usa ogni giorno: una libreria di oltre 100 WebComponents in Lit, progettata insieme ai designer perché ogni componente rispetti tipografia, spacing e stati definiti in Figma.",
          highlights: [
            "Ho tradotto le specifiche visive dei designer in componenti riutilizzabili cross-prodotto, con naming e API condivisi.",
            "Ho difeso coerenza tipografica, spacing e stati dei componenti nelle code review, su un team di oltre 30 persone.",
          ],
        },
        {
          mode: "human",
          role: "AI Workflow Designer",
          description:
            "Ho portato l'AI dentro il lavoro di consulenza quotidiano, non in una prova a parte: pair programming con Copilot e Claude sul codice che va in produzione, e ambienti di sviluppo preparati prima — agenti, istruzioni di contesto via MCP, automazioni del ciclo Agile su GitLab. Le regole del progetto arrivano all'AI prima del primo prompt, così l'accelerazione resta dentro binari decisi e non produce codice da rileggere tutto.",
          highlights: [
            "Ho scritto agenti, istruzioni di contesto e ambienti riutilizzabili via Model Context Protocol, invece di ripartire da un prompt vuoto a ogni sessione.",
            "Ho automatizzato i flussi del ciclo Agile su GitLab e i test in Playwright, tenendo il presidio diretto su layout e UX/UI.",
          ],
        },
      ],
    },
    {
      company: "Music Agency (collaborazione)",
      role: "Tour Manager & Digital Strategist",
      startDate: "2023-01",
      endDate: "2024-12",
      location: "Italia",
      remote: true,
      description:
        "Ho organizzato booking e tour per gli artisti del roster di un'agenzia musicale italiana e ho progettato la loro comunicazione digitale e content strategy.",
      highlights: [
        "Ho riscritto la comunicazione dell'agenzia per parlare a etichette, promoter e artisti invece che al pubblico: follower raddoppiati.",
        "Ho ideato una playlist di artisti emergenti come canale di contatto con la filiera, e un format radio mensile per raccontarne i brani.",
        "Ho contattato i partner uno per uno, con email scritte a mano invece che generate da un software.",
        "Ho scritto i discorsi e presentato sul palco le serate del festival dell'agenzia.",
      ],
      skills: [
        "Booking",
        "Tour management",
        "Event management",
        "Comunicazione digitale",
        "Content Strategy",
        "Copywriting",
        "Instagram Marketing",
        "Spotify Marketing",
        "Music business",
        "Project management",
      ],
      tags: ["creative"],
      facets: [
        {
          mode: "human",
          role: "Digital Strategist",
          description:
            "Ho progettato la presenza digitale dell'agenzia per parlare alla filiera, non al pubblico generico: content strategy, playlist come strumento di networking e canali cresciuti con contatti che contano.",
          highlights: [
            "Ho raddoppiato i follower con audience mirata: musicisti, etichette, promoter.",
            "Ho ideato una playlist di artisti emergenti come canale di contatto diretto con la filiera.",
          ],
        },
      ],
    },
    {
      company: "Freelance",
      role: "Aiuto Videomaker – Matrimoni di alto livello",
      startDate: "2022-01",
      endDate: "present",
      location: "Toscana, Italia",
      remote: false,
      description:
        "Affianco il videomaker principale nella produzione video per matrimoni esteri di alto livello in Toscana. Un matrimonio non si rigira: ogni momento va preso bene la prima volta.",
      highlights: [
        "Ho ripreso cerimonie con centinaia di ospiti internazionali come secondo operatore.",
        "Ho lavorato su eventi multi-giornata in contesti multiculturali.",
        "Ho adattato il mio ruolo alle esigenze del set in tempo reale, in contesti ad alta complessità logistica.",
      ],
      skills: ["Videomaking", "Post-produzione", "Correzione colore", "Sensibilità estetica"],
    },
    {
      company: "Forge Lab",
      role: "Frontend Developer",
      startDate: "2021-04",
      endDate: "2022-03",
      location: "Los Angeles, USA",
      remote: true,
      description:
        "Sviluppo frontend full-remote all'interno di un team distribuito tra Torino e Los Angeles, curando l'interfaccia utente, la pulizia del codice e l'integrazione di prodotti per il mercato statunitense.",
      highlights: [
        "Digivax: ho sviluppato la piattaforma di conformità sanitaria aziendale, con dashboard distinte per datori di lavoro, dipendenti e medici.",
        "Digivax: ho riscritto l'architettura SCSS con pattern BEM e ridotto il codice da 8.000 a 3.000 righe.",
        "And 1: ho fatto manutenzione evolutiva e sviluppato nuove funzionalità del prodotto.",
      ],
      skills: ["React", "TypeScript", "SCSS / BEM", "REST API", "Trello", "Agile"],
    },
    {
      company: "Consoft",
      role: "Frontend Developer",
      startDate: "2019-07",
      endDate: "2021-03",
      location: "Torino, Italia",
      remote: false,
      description:
        "Ho sviluppato applicativi gestionali per Rai Pubblicità e Intesa San Paolo, in sostituzione di processi interni su sistemi legacy, con flussi più rapidi per gli utenti finali.",
      highlights: [
        "Ho sviluppato applicativi gestionali interni per Rai Pubblicità con Angular, Spring e Bootstrap.",
        "Ho sviluppato un tool documentale e revisionale per Intesa San Paolo con JSF.",
        "Ho tradotto requisiti di business complessi in interfacce usabili da operatori non tecnici.",
      ],
      skills: ["Angular", "Spring", "JSF", "Java", "SQL", "Bootstrap", "HTML5", "SCSS"],
    },
    {
      company: "Satispay",
      role: "Collaboratore Esterno",
      startDate: "2018-06",
      endDate: "2019-06",
      location: "Milano, Italia",
      remote: false,
      description:
        "Ho lavorato dall'esterno con Satispay durante una fase di crescita rapida: processi che cambiavano di settimana in settimana e consegne che finivano subito in produzione.",
      highlights: [],
      skills: ["Fintech", "Mentalità da startup", "Comunicazione digitale"],
    },
    {
      company: "Festival ed eventi culturali",
      role: "Presentatore & Live Host",
      startDate: "2015-01",
      endDate: "2024-12",
      location: "Italia",
      remote: false,
      description:
        "Ho condotto festival culturali e serate live in giro per l'Italia, in modo saltuario: quasi mai per contratto, quasi sempre per il gusto di stare sul palco. Gli imprevisti li ho risolti con l'improvvisazione teatrale.",
      highlights: [
        "Ho condotto festival culturali multidisciplinari (musica, arte, teatro).",
        "Ho moderato panel e talk con ospiti internazionali.",
        "Ho risolto imprevisti in diretta con la formazione in improvvisazione teatrale.",
      ],
      skills: [
        "Public speaking",
        "Improvvisazione",
        "Moderazione",
        "Hosting",
        "Gestione del pubblico",
      ],
    },
    {
      company: "Freelance",
      role: "Fotografo",
      startDate: "2009-10",
      endDate: "present",
      location: "Torino, Italia",
      remote: false,
      description:
        "Primi scatti nel 2008, fotografo in Tanzania nel 2009 e poi anni di viaggi in solitaria con la reflex al collo e lo zaino in spalla. Tra un timbro sul passaporto e l'altro, mi sono ritrovato persino a raccontare la complessità e il colore di matrimoni indiani luxury tra le colline toscane. Più un'attitudine che un'occupazione a tempo pieno, ma è stato il mio vero primo laboratorio di Visual Design. La fotografia mi ha insegnato la gerarchia visiva, la composizione e l'empatia nello sguardo: capire dove cade l'occhio e cosa cerca una persona prima ancora di premere il pulsante. Un'ossessione per il dettaglio che oggi mi porto dritta nella progettazione di layout, interfacce e storie digitali.",
      highlights: [],
      skills: ["Fotografia", "Editing", "Post-produzione"],
    },
    {
      company: "Corriere di Chieri",
      role: "Collaboratore Giornalista",
      startDate: "2014-09",
      endDate: "2017-06",
      location: "Chieri, Torino",
      remote: false,
      description:
        "Ho scritto cronaca locale ed eventi culturali per il Corriere di Chieri: notizie grezze da trasformare in pezzi leggibili, con le scadenze di un settimanale.",
      highlights: [],
      skills: ["Giornalismo", "Scrittura", "Editing", "Redazione"],
    },
    {
      company: "Artiversum – Associazione Culturale",
      role: "Organizzatore di eventi",
      startDate: "2017-01",
      endDate: "2018-05",
      location: "Torino, Italia",
      remote: false,
      description:
        "Ho cofondato lo Square Festival nel Quadrilatero Romano di Torino: evento culturale multidisciplinare (musica, teatro, arti visive), ideato e realizzato in 6 mesi con circa 100 persone tra staff e artisti. Ho diretto la sezione teatrale.",
      highlights: [
        "Ho cofondato lo Square Festival: dall'ideazione alla realizzazione in 6 mesi, con circa 100 persone tra staff e artisti.",
        "Ho coordinato la sezione teatrale: ricerca e selezione degli spettacoli, trattativa con le compagnie, scheduling integrato col programma del festival.",
      ],
      skills: ["Event management", "Comunicazione", "Coordinamento"],
    },
    {
      company: "FreeGinevro / Immaginazione e Lavoro",
      role: "Grafico Pubblicitario",
      startDate: "2017-06",
      endDate: "2018-10",
      location: "Torino, Italia",
      remote: false,
      description:
        "Ho progettato visual e materiali di brand identity per clienti locali. La formazione in graphic design mi ha dato il metodo, la fotografia l'occhio.",
      highlights: [
        "Ho progettato materiali grafici e brand identity per clienti del settore locale e culturale.",
        "Ho applicato principi di visual hierarchy e typography ai materiali stampa e digitali.",
      ],
      skills: ["Graphic design", "Brand identity", "Adobe Suite", "Typography", "Visual design"],
    },
    {
      company: "Gruppo Mondadori",
      role: "Commesso",
      startDate: "2015-04",
      endDate: "2018-04",
      location: "Torino, Italia",
      remote: false,
      description:
        "Ho lavorato nella vendita e nella consulenza clienti al Mondadori Store di Area 12, a Torino, con responsabilità sul reparto libri.",
      highlights: [],
      skills: ["Customer service", "Vendita", "Gestione del reparto"],
    },
    {
      company: "None Teatro",
      role: "Insegnante di Teatro e Improvvisazione",
      startDate: "2016-01",
      endDate: "2016-12",
      location: "None, Torino",
      remote: false,
      description:
        "Ho insegnato improvvisazione teatrale agli allievi di None Teatro, con il metodo 'Yes, and...' come pratica di ascolto attivo e costruzione collettiva.",
      highlights: [
        "Ho condotto corsi di improvvisazione e teatro per allievi di livelli diversi.",
        "Ho applicato il metodo 'Yes, and...' come strumento didattico per sviluppare creatività e problem solving.",
      ],
      skills: [
        "Insegnamento",
        "Improvvisazione teatrale",
        "Public speaking",
        "Facilitazione",
        "Pedagogia creativa",
      ],
    },
    {
      company: "B-Teatro",
      role: "Tecnico audio-visivo",
      startDate: "2014-01",
      endDate: "2018-12",
      location: "Torino, Italia",
      remote: false,
      description:
        "Ho fatto la regia tecnica audio e luci per spettacoli teatrali: cambi scena al buio, tempi comici da rispettare al secondo e nessuna possibilità di replay.",
      highlights: [
        "Tecnica Audio & Live Sound: Gestione del supporto fonico e tecnico audio per la realizzazione delle produzioni e degli spettacoli teatrali della scuola, curando la parte audio durante le repliche dal vivo.",
      ],
      skills: ["Regia tecnica", "Audio", "Luci"],
    },
    {
      company: "Bestar Hotel",
      role: "Receptionist",
      startDate: "2012-12",
      endDate: "2013-06",
      location: "Tulum, Messico",
      remote: false,
      description:
        "Ho lavorato al front desk di una struttura ricettiva internazionale a Tulum, con clientela anglofona e ispanofona.",
      highlights: [],
      skills: ["Accoglienza", "Inglese", "Spagnolo", "Customer service"],
    },
    {
      company: "UCI Cinemas",
      role: "Operatore Cinematografico",
      startDate: "2013-07",
      endDate: "2015-03",
      location: "Torino, Italia",
      remote: false,
      description:
        "Ho lavorato tra sala, biglietteria e accoglienza in uno dei circuiti cinema più frequentati d'Italia: centinaia di spettatori al giorno, ognuno con un problema diverso da risolvere al volo.",
      highlights: [],
      skills: ["Customer service", "Gestione del pubblico", "Operazioni di sala"],
    },
    {
      company: "Starbucks Coffee",
      role: "Barista",
      startDate: "2011-01",
      endDate: "2011-06",
      location: "Londra, Regno Unito",
      remote: false,
      description:
        "Ho lavorato come barista in un punto vendita Starbucks di Londra, con clienti internazionali ogni giorno.",
      highlights: [],
      skills: ["Inglese", "Lavoro in team", "Customer service"],
    },
    {
      company: "Sogni Animazione",
      role: "Fotografo",
      startDate: "2009-11",
      endDate: "2010-04",
      location: "Zanzibar, Tanzania",
      remote: false,
      description:
        "Ho diretto il centro fotografico di una struttura di animazione turistica a Zanzibar.",
      highlights: [],
      skills: ["Fotografia", "Animazione turistica"],
    },
    {
      company: "Metamorfosi / Fun Factory",
      role: "Responsabile Animazione Turistica",
      startDate: "2010-05",
      endDate: "2012-09",
      location: "Ravenna e Crotone, Italia",
      remote: false,
      description:
        "Ho coordinato team di animatori e programmi di intrattenimento in strutture balneari a Ravenna e Crotone: staff nuovo ogni stagione, ospiti nuovi ogni settimana.",
      highlights: [
        "Ho coordinato team di animatori sotto la pressione della stagione piena.",
        "Ho progettato e condotto programmi di intrattenimento per ospiti internazionali.",
      ],
      skills: [
        "Coordinamento",
        "Team management",
        "Event management",
        "Animazione",
        "Comunicazione interpersonale",
      ],
    },
    {
      company: "Caveja srl",
      role: "Aiuto Cucina e Banconiere",
      startDate: "2008-06",
      endDate: "2010-04",
      location: "Torino, Italia",
      remote: false,
      description:
        "Ho lavorato al banco e in cucina, spesso in turni notturni: ritmi alti e zero margine d'errore.",
      highlights: [],
      skills: [
        "Lavoro in team",
        "Gestione operativa",
        "Servizio clienti",
        "Precisione sotto pressione",
      ],
    },
    {
      company: "Bambagia Design Lab (collaborazione)",
      role: "UX/UI Designer",
      startDate: "2026-04",
      endDate: "present",
      location: "Italia",
      remote: true,
      description:
        "Ho progettato le interfacce del sito di un cliente per Bambagia Design Lab: ricerca su cliente e competitor, wireframe e prototipo, HTML e CSS scritti a mano e varianti del sito con palette diverse, convertite in disegno Figma con plugin dedicati.",
      highlights: [
        "Ho analizzato cliente e competitor per definire l'architettura delle interfacce: ogni scelta è motivata, non estetica.",
        "Ho prodotto varianti del sito con palette diverse, convertite in disegno Figma con plugin dedicati.",
        "Ho scelto il flusso di consegna giusto perché il cliente possa modificare il sito in autonomia.",
      ],
      facets: [
        {
          mode: "human",
          role: "AI Workflow Designer",
          description:
            "Ho costruito su VS Code un ambiente riutilizzabile con MCP Figma e MCP Wix, con l'agente istruito sulle regole grafiche del progetto, per gestire un doppio flusso Figma ⇄ Code e applicare MCP anche a Wix, velocizzando il setup e definendo un handoff che lascia al cliente piena autonomia sul sito.",
          highlights: [
            "Figma-to-Code: ho trasformato prototipi e wireframe in codice HTML e CSS di produzione.",
            "Code-to-Figma: ho riconvertito codice e varianti cromatiche/palette in componenti Figma, per tenere sincronizzato il Design System.",
            "Ho scelto il plugin Figma → Wix al posto di MCP Wix, che genera un frame statico: il cliente modifica il sito da solo dopo la consegna.",
          ],
        },
      ],
      skills: [
        "Figma",
        "MCP",
        "Wix",
        "HTML5",
        "CSS",
        "AI Orchestration",
        "Prompt Engineering",
        "UX Research",
        "Prototyping",
      ],
      tags: ["creative", "ai-orchestration"],
    },
    // In coda come Bambagia: aggiungere qui non sposta gli indici già
    // referenziati da exp-clusters.ts (ClusterRef → indice di questo array).
    {
      company: "B-Teatro",
      role: "Attore e improvvisatore",
      startDate: "2013-01",
      endDate: "2019-12",
      location: "Torino, Italia",
      remote: false,
      description:
        "Ho recitato come attore e improvvisatore con B-Teatro, in Italia e in Lussemburgo. Sul palco senza copione impari una cosa che vale ovunque: quello che succede non si discute, si usa.",
      highlights: [
        "Recitazione & Teatro: Percorso focalizzato su improvvisazione comica e teatro di prosa, con tournée in Italia e all'estero e la partecipazione a workshop nazionali e internazionali.",
        'Cinema: Deuteragonista (co-protagonista) nel film "Double", prodotto a Torino da Filmine. Il lungometraggio è stato presentato al San Francisco Independent Film Festival (2022) e proiettato al Cinema Massimo per la prima italiana.',
      ],
      skills: ["Recitazione", "Improvvisazione teatrale"],
    },
  ] as WorkExperience[],

  // ── Education ─────────────────────────────────────────────────────────────
  education: [
    {
      institution: "Istituto Europeo di Design (IED)",
      degree: "Master",
      field: "Digital Communication and Media/Multimedia",
      startDate: "2022-11",
      endDate: "2023-05",
      location: "Torino, Italia",
    },
    {
      institution: "Immaginazione e Lavoro",
      degree: "Corso di specializzazione",
      field: "Sviluppo Software",
      startDate: "2018-11",
      endDate: "2019-04",
      location: "Torino, Italia",
    },
    {
      institution: "Immaginazione e Lavoro",
      degree: "Attestato",
      field: "Graphic Design",
      startDate: "2018-06",
      endDate: "2018-07",
      location: "Torino, Italia",
    },
    {
      institution: "Immaginazione e Lavoro",
      degree: "Attestato",
      field: "Social Media Management",
      startDate: "2018-01",
      endDate: "2018-06",
      location: "Torino, Italia",
    },
    {
      institution: "Istituto Tecnico Turistico Boselli",
      degree: "Diploma",
      field: "Istituto Tecnico Turistico",
      startDate: "2011-09",
      endDate: "2016-06",
      location: "Torino, Italia",
      grade: "80/100",
    },
    {
      institution: "Callan School",
      degree: "Corso intensivo di inglese",
      field: "English Language",
      startDate: "2010-01",
      endDate: "2010-06",
      location: "Oxford Street, Londra",
    },
  ] as Education[],

  // ── Certifications ────────────────────────────────────────────────────────
  certifications: [
    {
      name: "Generative AI: The Future of UX UI Design",
      issuer: "SkillUp",
      date: "2026-06",
      credentialId: "QL8LAMVW92AG",
      // Impatto pratico: uso della Generative AI nel processo di design UX/UI, lo stesso principio applicato nell'AI Workflow di questo sito
    },
    {
      name: "UI/UX Wireframing and Prototyping with Figma",
      issuer: "SkillUp",
      date: "2026-06",
      credentialId: "1ZVQMN0YTP2Y",
      // Impatto pratico: wireframe e prototipi Figma nello stesso flusso usato per Aruba e per il design system di questo sito
    },
    {
      name: "Introduction to Agile Development and Scrum",
      issuer: "IBM",
      date: "2026-02",
      credentialId: "L7GZFSYJYMAC",
      // Impatto pratico: Scrum snello applicato agli sprint aziendali, con una demo funzionante a chiusura di ogni ciclo
    },
    {
      name: "UX/UI Design Fundamentals: Usability and Visual Principles",
      issuer: "SkillUp",
      date: "2026-02",
      credentialId: "VELSWBCO2YEL",
      // Impatto pratico: principi di usabilità applicati alle interfacce per operatori non tecnici, quelle che si usano senza averle studiate prima
    },
    {
      name: "Introduction to UX/UI Design",
      issuer: "IBM",
      date: "2026-01",
      credentialId: "LUL4LSALE01X",
      // Impatto pratico: metodo IBM Design Thinking integrato nel processo di analisi strategica pre-sviluppo — i requisiti diventano interfacce prima di diventare codice
    },
    {
      name: "UX Design Professional Certificate",
      issuer: "IBM",
      date: "2025-01",
    },
    {
      name: "Master in Comunicazione Digitale",
      issuer: "Istituto Europeo di Design (IED)",
      date: "2023-05",
    },
    {
      name: "Corso di Bartending",
      issuer: "Ateneo di Bartending Planet One",
      date: "2018-01",
    },
    {
      name: "Corso di improvvisazione teatrale",
      issuer: "B-Teatro",
      date: "2013-01",
      endDate: "2019-12",
    },
  ] as Certification[],

  // ── Technical skills ──────────────────────────────────────────────────────
  technicalSkills: [
    {
      name: "Angular",
      level: "Avanzato",
      icon: "angular",
      domain: "tech",
      weight: 5,
      mastery: 82,
      role: "core",
      links: [
        { target: "TypeScript", type: "technical" },
        { target: "RXJS", type: "technical" },
        { target: "WebComponents", type: "technical" },
        { target: "Bootstrap", type: "technical" },
        { target: "Jest", type: "workflow" },
        { target: "Agile Methodology", type: "cross-domain" },
      ],
    },
    {
      name: "HTML5",
      level: "Esperto",
      icon: "html5",
      domain: "tech",
      weight: 4,
      mastery: 95,
      role: "support",
      links: [
        { target: "CSS / SCSS", type: "technical" },
        { target: "JavaScript", type: "technical" },
        { target: "Accessibility / WCAG", type: "workflow" },
        { target: "WebComponents", type: "technical" },
      ],
    },
    {
      name: "CSS / SCSS",
      level: "Esperto",
      icon: "css3",
      domain: "tech",
      weight: 4,
      mastery: 92,
      role: "bridge",
      links: [
        { target: "HTML5", type: "technical" },
        { target: "Bootstrap", type: "technical" },
        { target: "GSAP", type: "workflow" },
        { target: "UX / UI Design", type: "cross-domain" },
        {
          target: "Sensibilità estetica",
          type: "cross-domain",
          description:
            "Ogni ritmo visivo e micro-interazione CSS è una scelta estetica prima che tecnica.",
        },
      ],
    },
    {
      name: "TypeScript",
      level: "Avanzato",
      icon: "typescript",
      domain: "tech",
      weight: 5,
      mastery: 85,
      role: "core",
      links: [
        { target: "JavaScript", type: "technical" },
        { target: "Angular", type: "technical" },
        { target: "Lit", type: "technical" },
        { target: "Node.js", type: "technical" },
        {
          target: "MCP Protocol",
          type: "workflow",
          description: "Il sistema di tipi è la lingua comune tra sviluppatore e agente AI.",
        },
      ],
    },
    {
      name: "JavaScript",
      level: "Esperto",
      icon: "javascript",
      domain: "tech",
      weight: 4,
      mastery: 90,
      role: "core",
      links: [
        { target: "TypeScript", type: "technical" },
        { target: "React", type: "technical" },
        { target: "GSAP", type: "workflow" },
        { target: "Node.js", type: "technical" },
        { target: "WebComponents", type: "technical" },
      ],
    },
    {
      name: "Lit",
      level: "Avanzato",
      icon: "lit",
      domain: "tech",
      weight: 4,
      mastery: 80,
      role: "core",
      links: [
        { target: "WebComponents", type: "technical" },
        { target: "TypeScript", type: "technical" },
        { target: "Angular", type: "technical" },
        { target: "GSAP", type: "workflow" },
        { target: "Astro", type: "workflow" },
      ],
    },
    {
      name: "RXJS",
      level: "Avanzato",
      domain: "tech",
      weight: 3,
      mastery: 76,
      role: "support",
      links: [
        { target: "Angular", type: "technical" },
        { target: "JavaScript", type: "technical" },
        { target: "Node.js", type: "technical" },
        { target: "Pensiero T-shaped", type: "cross-domain" },
      ],
    },
    {
      name: "NGRX",
      level: "Intermedio",
      domain: "tech",
      weight: 2,
      mastery: 60,
      role: "support",
      links: [
        { target: "Angular", type: "technical" },
        { target: "RXJS", type: "technical" },
        { target: "TypeScript", type: "technical" },
      ],
    },
    {
      name: "WebComponents",
      level: "Avanzato",
      domain: "tech",
      weight: 4,
      mastery: 82,
      role: "core",
      links: [
        { target: "Lit", type: "technical" },
        { target: "HTML5", type: "technical" },
        { target: "JavaScript", type: "technical" },
        { target: "Angular", type: "technical" },
      ],
    },
    {
      name: "React",
      level: "Intermedio",
      icon: "react",
      domain: "tech",
      weight: 3,
      mastery: 65,
      role: "support",
      links: [
        { target: "JavaScript", type: "technical" },
        { target: "GraphQL", type: "workflow" },
        { target: "Bootstrap", type: "technical" },
        { target: "REST API", type: "workflow" },
      ],
    },
    {
      name: "Git",
      level: "Avanzato",
      icon: "git",
      domain: "tech",
      weight: 3,
      mastery: 82,
      role: "support",
      links: [
        { target: "Node.js", type: "workflow" },
        { target: "REST API", type: "workflow" },
        { target: "Agile Methodology", type: "cross-domain" },
        { target: "Autonomia strategica", type: "cross-domain" },
      ],
    },
    {
      name: "Bootstrap",
      level: "Avanzato",
      icon: "bootstrap",
      domain: "tech",
      weight: 3,
      mastery: 78,
      role: "support",
      links: [
        { target: "CSS / SCSS", type: "technical" },
        { target: "HTML5", type: "technical" },
        { target: "Material Design", type: "conceptual" },
        { target: "React", type: "technical" },
      ],
    },
    {
      name: "Material Design",
      level: "Intermedio",
      domain: "creative",
      weight: 2,
      mastery: 58,
      role: "support",
      links: [
        { target: "Bootstrap", type: "technical" },
        { target: "Figma", type: "workflow" },
        { target: "UX Research", type: "conceptual" },
        { target: "UX / UI Design", type: "cross-domain" },
      ],
    },
    {
      name: "GraphQL",
      level: "Base",
      icon: "graphql",
      domain: "tech",
      weight: 2,
      mastery: 38,
      role: "support",
      links: [
        { target: "REST API", type: "technical" },
        { target: "Node.js", type: "technical" },
        { target: "React", type: "workflow" },
        { target: "SQL", type: "conceptual" },
      ],
    },
    {
      name: "SQL",
      level: "Intermedio",
      domain: "tech",
      weight: 2,
      mastery: 55,
      role: "support",
      links: [
        { target: "REST API", type: "workflow" },
        { target: "Node.js", type: "workflow" },
        { target: "GraphQL", type: "technical" },
      ],
    },
    {
      name: "Jest",
      level: "Intermedio",
      icon: "jest",
      domain: "tech",
      weight: 3,
      mastery: 62,
      role: "support",
      links: [
        { target: "TypeScript", type: "technical" },
        { target: "Angular", type: "technical" },
        { target: "Node.js", type: "workflow" },
        { target: "Agile Methodology", type: "cross-domain" },
      ],
    },
    {
      name: "Wordpress",
      level: "Base",
      icon: "wordpress",
      domain: "tech",
      weight: 1,
      mastery: 35,
      role: "support",
      links: [
        { target: "SEO", type: "workflow" },
        { target: "CSS / SCSS", type: "technical" },
        { target: "HTML5", type: "technical" },
        { target: "Social media management", type: "cross-domain" },
      ],
    },
    {
      name: "Figma",
      level: "Intermedio",
      icon: "figma",
      domain: "creative",
      weight: 3,
      mastery: 60,
      role: "bridge",
      links: [
        { target: "UX Research", type: "workflow" },
        { target: "Wireframing", type: "workflow" },
        { target: "Material Design", type: "technical" },
        { target: "UX / UI Design", type: "workflow" },
        { target: "Graphic design", type: "cross-domain" },
        { target: "Visily", type: "workflow" },
        { target: "UX Pilot", type: "workflow" },
      ],
    },
    {
      name: "Visily",
      level: "Intermedio",
      domain: "creative",
      weight: 2,
      mastery: 58,
      role: "support",
      links: [
        { target: "Figma", type: "workflow" },
        { target: "UX Research", type: "workflow" },
        { target: "Wireframing", type: "workflow" },
        { target: "UX / UI Design", type: "workflow" },
      ],
    },
    {
      name: "UX Pilot",
      level: "Base",
      domain: "ai",
      weight: 2,
      mastery: 45,
      role: "support",
      links: [
        { target: "UX Research", type: "workflow" },
        { target: "Wireframing", type: "workflow" },
        { target: "Figma", type: "workflow" },
      ],
    },
    {
      name: "Google Stitch",
      level: "Base",
      domain: "ai",
      weight: 2,
      mastery: 38,
      role: "support",
      links: [
        { target: "Figma", type: "workflow" },
        { target: "Visily", type: "workflow" },
        { target: "UX / UI Design", type: "workflow" },
        { target: "Prompt Engineering", type: "workflow" },
      ],
    },
    {
      name: "SEO",
      level: "Intermedio",
      domain: "management",
      weight: 2,
      mastery: 58,
      role: "support",
      links: [
        { target: "SEM", type: "technical" },
        { target: "Digital marketing", type: "cross-domain" },
        { target: "Wordpress", type: "workflow" },
      ],
    },
    {
      name: "SEM",
      level: "Base",
      domain: "management",
      weight: 1,
      mastery: 32,
      role: "support",
      links: [
        { target: "SEO", type: "technical" },
        { target: "Digital marketing", type: "cross-domain" },
      ],
    },
    {
      name: "UX Research",
      level: "Intermedio",
      domain: "creative",
      weight: 3,
      mastery: 65,
      role: "bridge",
      links: [
        { target: "Figma", type: "workflow" },
        { target: "Wireframing", type: "workflow" },
        { target: "Accessibility / WCAG", type: "conceptual" },
        { target: "UX / UI Design", type: "workflow" },
        { target: "Sensibilità estetica", type: "cross-domain" },
      ],
    },
    {
      name: "Wireframing",
      level: "Intermedio",
      domain: "creative",
      weight: 3,
      mastery: 62,
      role: "support",
      links: [
        { target: "Figma", type: "workflow" },
        { target: "UX Research", type: "workflow" },
        { target: "UX / UI Design", type: "workflow" },
      ],
    },
    {
      name: "Node.js",
      level: "Avanzato",
      icon: "nodedotjs",
      domain: "tech",
      weight: 4,
      mastery: 80,
      role: "core",
      links: [
        { target: "TypeScript", type: "technical" },
        { target: "REST API", type: "technical" },
        { target: "MCP Protocol", type: "workflow" },
        { target: "GraphQL", type: "technical" },
      ],
    },
    {
      name: "REST API",
      level: "Avanzato",
      domain: "tech",
      weight: 4,
      mastery: 82,
      role: "core",
      links: [
        { target: "Node.js", type: "technical" },
        { target: "GraphQL", type: "technical" },
        { target: "MCP Protocol", type: "workflow" },
        { target: "SQL", type: "workflow" },
      ],
    },
    {
      name: "Accessibility / WCAG",
      shortName: "A11y / WCAG",
      level: "Intermedio",
      domain: "tech",
      weight: 3,
      mastery: 65,
      role: "bridge",
      links: [
        { target: "HTML5", type: "technical" },
        { target: "UX Research", type: "workflow" },
        { target: "CSS / SCSS", type: "technical" },
        { target: "UX / UI Design", type: "cross-domain" },
      ],
    },
    {
      name: "Video editing",
      level: "Intermedio",
      domain: "creative",
      weight: 2,
      mastery: 55,
      role: "support",
      links: [
        { target: "Videomaking", type: "workflow" },
        { target: "Sensibilità estetica", type: "cross-domain" },
        { target: "Fotografia", type: "cross-domain" },
        { target: "Creatività applicata", type: "cross-domain" },
      ],
    },
    {
      name: "MCP Protocol",
      level: "Avanzato",
      domain: "ai",
      weight: 5,
      mastery: 88,
      role: "core",
      links: [
        { target: "Node.js", type: "technical" },
        { target: "Prompt Engineering", type: "workflow" },
        { target: "REST API", type: "technical" },
        {
          target: "AI-Augmented Productivity",
          type: "workflow",
          description: "L'MCP trasforma l'AI da chatbot a collaboratore operativo del processo.",
        },
      ],
    },
    {
      name: "Prompt Engineering",
      level: "Avanzato",
      domain: "ai",
      weight: 5,
      mastery: 90,
      role: "bridge",
      links: [
        { target: "MCP Protocol", type: "workflow" },
        { target: "AI-Augmented Productivity", type: "workflow" },
        { target: "Node.js", type: "technical" },
        {
          target: "Pensiero T-shaped",
          type: "cross-domain",
          description:
            "Prompt efficaci nascono da chi sa ragionare in più domini contemporaneamente.",
        },
        { target: "GitHub Copilot", type: "workflow" },
        { target: "Google Stitch", type: "workflow" },
      ],
    },
    {
      name: "GitHub Copilot",
      level: "Avanzato",
      icon: "githubcopilot",
      domain: "ai",
      weight: 4,
      mastery: 88,
      role: "bridge",
      links: [
        { target: "Prompt Engineering", type: "workflow" },
        { target: "MCP Protocol", type: "workflow" },
        { target: "AI-Augmented Productivity", type: "workflow" },
        { target: "TypeScript", type: "technical" },
      ],
    },
    {
      name: "Zed",
      level: "Base",
      domain: "tech",
      weight: 1,
      mastery: 35,
      role: "support",
      links: [
        { target: "TypeScript", type: "technical" },
        { target: "Git", type: "workflow" },
        { target: "GitHub Copilot", type: "workflow" },
      ],
    },
    {
      name: "GSAP",
      level: "Avanzato",
      icon: "greensock",
      domain: "creative",
      weight: 4,
      mastery: 80,
      role: "bridge",
      links: [
        { target: "JavaScript", type: "technical" },
        { target: "CSS / SCSS", type: "technical" },
        { target: "Lit", type: "workflow" },
        {
          target: "Sensibilità estetica",
          type: "cross-domain",
          description:
            "L'animazione non è decorazione: viene dall'occhio fotografico di chi la progetta.",
        },
        { target: "Creatività applicata", type: "cross-domain" },
      ],
    },
    {
      name: "Astro",
      level: "Intermedio",
      icon: "astro",
      domain: "tech",
      weight: 3,
      mastery: 65,
      role: "support",
      links: [
        { target: "TypeScript", type: "technical" },
        { target: "HTML5", type: "technical" },
        { target: "CSS / SCSS", type: "technical" },
        { target: "Lit", type: "technical" },
        { target: "Node.js", type: "technical" },
      ],
    },
    {
      name: "PostHog",
      level: "Intermedio",
      icon: "posthog",
      domain: "tech",
      weight: 3,
      mastery: 62,
      role: "bridge",
      links: [
        { target: "Astro", type: "technical" },
        { target: "Agile Methodology", type: "cross-domain" },
        {
          target: "UX Research",
          type: "cross-domain",
          description:
            "Session replay e heatmap trasformano l'uso reale del sito in decisioni di design, senza dover intervistare tutti.",
        },
        { target: "Vercel", type: "workflow" },
      ],
    },
    {
      name: "Vercel",
      level: "Intermedio",
      icon: "vercel",
      domain: "tech",
      weight: 2,
      mastery: 60,
      role: "support",
      links: [
        { target: "Astro", type: "technical" },
        { target: "PostHog", type: "workflow" },
      ],
    },
  ] as Skill[],

  // ── Soft skills ───────────────────────────────────────────────────────────
  softSkills: [
    {
      name: "Comunicazione efficace",
      description:
        "Ho condotto eventi in pubblico per oltre 10 anni, con formazione teatrale alle spalle: so spiegare cose complesse a persone molto diverse senza cambiarne la sostanza.",
      domain: "human",
      weight: 4,
      mastery: 90,
      role: "bridge",
      links: [
        { target: "Public speaking", type: "cross-domain" },
        { target: "Teatro e improvvisazione", type: "conceptual" },
        { target: "Intelligenza relazionale", type: "conceptual" },
        { target: "Scrittura e poesia", type: "cross-domain" },
      ],
    },
    {
      name: "Creatività applicata",
      description:
        "Sviluppo software, fotografia, teatro, scrittura ed eventi: da questo background arrivano soluzioni che i percorsi lineari non vedono, anche in contesti tecnici.",
      domain: "creative",
      weight: 4,
      mastery: 85,
      role: "bridge",
      links: [
        { target: "Sensibilità estetica", type: "conceptual" },
        { target: "Problem solving laterale", type: "conceptual" },
        { target: "Fotografia", type: "cross-domain" },
        { target: "Teatro e improvvisazione", type: "cross-domain" },
        { target: "Graphic design", type: "cross-domain" },
        { target: "GSAP", type: "cross-domain" },
      ],
    },
    {
      name: "Adattabilità culturale",
      description:
        "Ho lavorato in 5 paesi (Italia, UK, Messico, Tanzania, Lussemburgo), ognuno con un contesto organizzativo, linguistico e culturale diverso.",
      domain: "human",
      weight: 4,
      mastery: 82,
      role: "support",
      links: [
        { target: "Intelligenza relazionale", type: "conceptual" },
        { target: "Resilienza e pensiero adattivo", type: "conceptual" },
        { target: "Public speaking", type: "cross-domain" },
        { target: "Event management", type: "cross-domain" },
      ],
    },
    {
      name: "Intelligenza relazionale",
      description:
        "Costruisco rapporti di fiducia con colleghi, clienti e referenti: dal customer service internazionale al coordinamento di team cross-funzionali.",
      domain: "human",
      weight: 4,
      mastery: 85,
      role: "core",
      links: [
        { target: "Comunicazione efficace", type: "conceptual" },
        { target: "Adattabilità culturale", type: "conceptual" },
        { target: "Event management", type: "cross-domain" },
        { target: "Public speaking", type: "cross-domain" },
      ],
    },
    {
      name: "Problem solving laterale",
      description:
        "Ho risolto problemi in ambienti enterprise (architetture a microfrontend, sistemi legacy) e in situazioni live ad alto stress (regia tecnica, conduzione di eventi): due palestre diverse, lo stesso metodo.",
      domain: "human",
      weight: 5,
      mastery: 87,
      role: "bridge",
      links: [
        { target: "Creatività applicata", type: "conceptual" },
        { target: "Pensiero T-shaped", type: "conceptual" },
        { target: "Agile Methodology", type: "cross-domain" },
        { target: "MCP Protocol", type: "cross-domain" },
      ],
    },
    {
      name: "Autonomia strategica",
      description:
        "Porto avanti da solo progetti paralleli (fotografia freelance, videomaking, consulenza strategica): definisco le priorità, rispetto le scadenze e consegno senza supervisione diretta.",
      domain: "management",
      weight: 4,
      mastery: 88,
      role: "core",
      links: [
        { target: "Resilienza e pensiero adattivo", type: "conceptual" },
        { target: "Agile Methodology", type: "cross-domain" },
        { target: "Pensiero T-shaped", type: "conceptual" },
        { target: "Git", type: "cross-domain" },
      ],
    },
    {
      name: "Resilienza e pensiero adattivo",
      shortName: "Resilienza adattiva",
      description:
        "Ho allenato la lucidità sotto pressione nella regia tecnica teatrale, nella conduzione live di eventi e sui sistemi enterprise in produzione. Tratto l'imprevisto come un dato da cui imparare.",
      domain: "human",
      weight: 4,
      mastery: 82,
      role: "support",
      links: [
        { target: "Autonomia strategica", type: "conceptual" },
        { target: "Adattabilità culturale", type: "conceptual" },
        { target: "Teatro e improvvisazione", type: "cross-domain" },
        { target: "Agile Methodology", type: "cross-domain" },
      ],
    },
    {
      name: "Ascolto attivo",
      description:
        "Faccio le domande giuste prima di rispondere, riconosco ciò che non viene detto e mantengo l'attenzione anche in sessioni tecniche lunghe. È la base di ogni consulenza che funziona.",
      domain: "human",
      weight: 4,
      mastery: 84,
      role: "bridge",
      links: [
        { target: "Intelligenza relazionale", type: "conceptual" },
        { target: "Comunicazione efficace", type: "conceptual" },
        { target: "Teatro e improvvisazione", type: "cross-domain" },
      ],
    },
    {
      name: "Sensibilità estetica",
      description:
        "Fotografo da oltre 15 anni: quell'occhio finisce dritto nelle scelte di interfaccia, dove un pixel fuori posto si vede.",
      domain: "creative",
      weight: 4,
      mastery: 88,
      role: "bridge",
      links: [
        { target: "Creatività applicata", type: "conceptual" },
        { target: "Fotografia", type: "cross-domain" },
        { target: "Graphic design", type: "cross-domain" },
        { target: "UX / UI Design", type: "cross-domain" },
        { target: "CSS / SCSS", type: "cross-domain" },
        { target: "GSAP", type: "cross-domain" },
      ],
    },
    {
      name: "Pensiero T-shaped",
      description:
        "Faccio da ponte tra ingegneria (frontend), design (UX/UI) e marketing (SEO/SEM): meno malintesi tra reparti, consegne più rapide.",
      domain: "management",
      weight: 5,
      mastery: 90,
      role: "bridge",
      links: [
        { target: "Problem solving laterale", type: "conceptual" },
        { target: "Autonomia strategica", type: "conceptual" },
        { target: "AI-Augmented Productivity", type: "cross-domain" },
        { target: "Agile Methodology", type: "cross-domain" },
      ],
    },
  ] as SoftSkill[],

  // ── Transversal skills ────────────────────────────────────────────────────
  transversalSkills: [
    {
      name: "Event management",
      description:
        "Ho ideato e prodotto festival culturali multidisciplinari (Square Festival, Artiversum, Quadrilatero Romano di Torino): coordinamento artisti, logistica e comunicazione istituzionale.",
      domain: "management",
      weight: 3,
      mastery: 72,
      role: "support",
      links: [
        { target: "Agile Methodology", type: "cross-domain" },
        { target: "Intelligenza relazionale", type: "cross-domain" },
        { target: "Public speaking", type: "workflow" },
        { target: "Comunicazione efficace", type: "workflow" },
      ],
    },
    {
      name: "Fotografia",
      description:
        "Lavoro come fotografo freelance dal 2009, con portfolio internazionale (Tanzania, Messico, Italia). Reportage e ritratto.",
      domain: "creative",
      weight: 3,
      mastery: 80,
      role: "support",
      links: [
        { target: "Creatività applicata", type: "cross-domain" },
        { target: "Sensibilità estetica", type: "cross-domain" },
        { target: "Videomaking", type: "technical" },
        { target: "Video editing", type: "workflow" },
      ],
    },
    {
      name: "Teatro e improvvisazione",
      description:
        "Mi sono formato e ho recitato con B-Teatro (2013–2019), con spettacoli in Italia e Lussemburgo. L'improvvisazione allena ascolto e rapidità: quando una scena crolla impari a costruirci sopra, non a rifarla.",
      domain: "human",
      weight: 4,
      mastery: 85,
      role: "bridge",
      links: [
        { target: "Public speaking", type: "workflow" },
        { target: "Comunicazione efficace", type: "workflow" },
        { target: "Resilienza e pensiero adattivo", type: "cross-domain" },
        {
          target: "Agile Methodology",
          type: "conceptual",
          description:
            "L'improvvisazione teatrale è il modello mentale originale dello sprint Agile.",
        },
      ],
    },
    {
      name: "Public speaking",
      description:
        "Conduco festival, panel e talk con ospiti internazionali dal 2015. Tengo audience eterogenee e risolvo imprevisti live senza perdere il ritmo.",
      domain: "human",
      weight: 4,
      mastery: 85,
      role: "bridge",
      links: [
        { target: "Teatro e improvvisazione", type: "workflow" },
        { target: "Comunicazione efficace", type: "workflow" },
        { target: "Event management", type: "workflow" },
        { target: "Intelligenza relazionale", type: "conceptual" },
      ],
    },
    {
      name: "Graphic design",
      description:
        "Mi sono specializzato con Immaginazione e Lavoro (2018) e da allora produco materiali visivi per eventi, brand e comunicazione digitale.",
      domain: "creative",
      weight: 3,
      mastery: 65,
      role: "support",
      links: [
        { target: "Sensibilità estetica", type: "cross-domain" },
        { target: "Creatività applicata", type: "cross-domain" },
        { target: "Figma", type: "cross-domain" },
        { target: "UX / UI Design", type: "cross-domain" },
        { target: "Social media management", type: "workflow" },
      ],
    },
    {
      name: "Social media management",
      shortName: "Social media",
      description:
        "Mi sono formato con Immaginazione e Lavoro (2018) e ho costruito il piano editoriale dei canali per eventi culturali e per l'agenzia musicale.",
      domain: "management",
      weight: 2,
      mastery: 60,
      role: "support",
      links: [
        { target: "Digital marketing", type: "workflow" },
        { target: "SEO", type: "workflow" },
        { target: "Comunicazione efficace", type: "cross-domain" },
        { target: "Music industry", type: "workflow" },
      ],
    },
    {
      name: "Digital marketing",
      description:
        "Ho completato il Master IED in Digital Communication (2022–2023): strategia di contenuto, SEO/SEM, analytics, campaign management e storytelling di brand in contesti B2C e B2B.",
      domain: "management",
      weight: 3,
      mastery: 65,
      role: "support",
      links: [
        { target: "Social media management", type: "workflow" },
        { target: "SEO", type: "technical" },
        { target: "SEM", type: "technical" },
        { target: "Scrittura e poesia", type: "cross-domain" },
        { target: "Music industry", type: "workflow" },
      ],
    },
    {
      name: "UX / UI Design",
      description:
        "Sto completando l'IBM UX Design Professional Certificate: user research, information architecture, wireframing e prototipazione ad alta fedeltà con Figma.",
      domain: "creative",
      weight: 4,
      mastery: 70,
      role: "bridge",
      links: [
        { target: "Figma", type: "workflow" },
        { target: "UX Research", type: "workflow" },
        { target: "Wireframing", type: "workflow" },
        { target: "Sensibilità estetica", type: "cross-domain" },
        { target: "Graphic design", type: "conceptual" },
        { target: "Accessibility / WCAG", type: "workflow" },
      ],
    },
    {
      name: "Videomaking",
      description:
        "Affianco il videomaker principale su matrimoni di alto livello in Toscana: riprese, color grading e montaggio narrativo in contesti multiculturali.",
      domain: "creative",
      weight: 2,
      mastery: 68,
      role: "support",
      links: [
        { target: "Fotografia", type: "technical" },
        { target: "Creatività applicata", type: "cross-domain" },
        { target: "Video editing", type: "workflow" },
        { target: "Sensibilità estetica", type: "cross-domain" },
      ],
    },
    {
      name: "Agile Methodology",
      description:
        "Ho applicato Scrum e Kanban in team enterprise distribuiti (ALTEN, Intesa San Paolo, Aruba) e in progetti creativi personali: sprint planning, retrospective e backlog.",
      domain: "management",
      weight: 5,
      mastery: 92,
      role: "bridge",
      links: [
        { target: "Pensiero T-shaped", type: "cross-domain" },
        { target: "Autonomia strategica", type: "cross-domain" },
        { target: "Teatro e improvvisazione", type: "conceptual" },
        { target: "Event management", type: "cross-domain" },
        { target: "Git", type: "workflow" },
        { target: "Jest", type: "workflow" },
      ],
    },
    {
      name: "AI-Augmented Productivity",
      description:
        "Ho integrato GitHub Copilot, ChatGPT e Midjourney nei flussi di sviluppo, UX research e produzione di contenuti. L'AI amplia qualità e velocità, il giudizio critico resta mio.",
      domain: "ai",
      weight: 5,
      mastery: 92,
      role: "bridge",
      links: [
        { target: "Prompt Engineering", type: "workflow" },
        { target: "MCP Protocol", type: "workflow" },
        { target: "Pensiero T-shaped", type: "cross-domain" },
        { target: "Agile Methodology", type: "cross-domain" },
      ],
    },
    {
      name: "Scrittura e poesia",
      description:
        "Ho vinto premi di poesia in Italia e in Australia, e una mia poesia è stata letta su Radio Capital. Al lavoro quella scrittura diventa copy e documentazione: il testo di questo sito è mio.",
      domain: "creative",
      weight: 3,
      mastery: 80,
      role: "bridge",
      links: [
        { target: "Comunicazione efficace", type: "cross-domain" },
        { target: "Creatività applicata", type: "cross-domain" },
        { target: "Public speaking", type: "workflow" },
        { target: "Digital marketing", type: "cross-domain" },
      ],
    },
    {
      name: "Music industry",
      description:
        "Ho coordinato artisti, aggregatori digitali e piattaforme di streaming (Spotify, YouTube Music): release management, comunicazione e project management editoriale (2023–2024).",
      domain: "management",
      weight: 2,
      mastery: 58,
      role: "support",
      links: [
        { target: "Event management", type: "workflow" },
        { target: "Social media management", type: "workflow" },
        { target: "Digital marketing", type: "workflow" },
        { target: "Comunicazione efficace", type: "cross-domain" },
      ],
    },
  ] as TransversalSkill[],

  // ── Methodology & Mindset ─────────────────────────────────────────────────
  methodology: [
    {
      name: "Agile & Iterative Development",
      description:
        "Lavoro a cicli brevi: riducono il rischio, tengono il focus sugli obiettivi di business e lasciano spazio ai feedback prima che costino cari. Vale sui sistemi enterprise con team distribuiti come sui progetti che porto avanti da solo.",
    },
    {
      name: "AI come moltiplicatore di valore",
      description:
        "Uso l'AI ogni giorno, con ruoli precisi: GitHub Copilot per la velocità di sviluppo, ChatGPT per il prototyping concettuale, Midjourney per l'esplorazione visiva. Il tempo risparmiato sui task ripetitivi finisce nelle fasi creative, dove serve di più.",
    },
    {
      name: "T-shaped Problem Solving",
      description:
        "Il mio background attraversa ingegneria, design e marketing: vedo pattern che i team mono-disciplinari non vedono. Prima di risolvere un problema, verifico che sia quello giusto.",
    },
    {
      name: "Framework-Agnostic Thinking",
      description:
        "Ho lavorato con Angular, React, Lit, WebComponents e Astro: scelgo lo strumento in base al problema, non il contrario. Le architetture invecchiano meglio quando nessuno le ha piegate al framework di moda.",
    },
    {
      name: "Analytics come bussola di prodotto",
      description:
        "Ho integrato PostHog e Vercel Analytics in questo progetto per chiudere il ciclo build-misura-impara. Da Product Manager leggo funnel e retention a 30/90 giorni per capire quali feature contano davvero. Da designer uso session replay, heatmap e rage click per trovare attrito nell'interfaccia senza dover intervistare ogni utente. Da developer uso feature flag per rilasciare senza rischiare un deploy tutto-o-niente, e A/B test per decidere con dati reali invece che con opinioni.",
    },
  ] as MethodologyItem[],

  // ── Growth areas (presented as evolution paths) ────────────────────────────
  growthAreas: [
    {
      name: "Curiosità poliedrica",
      reframe:
        "Esploro ambiti diversi per un'irrequietezza intellettuale che non si ferma. Rifiuto di incasellarmi in un solo campo e ogni stimolo nuovo diventa un angolo in più da cui leggere un problema.",
    },
    {
      name: "Pensiero parallelo",
      reframe:
        "Elaboro soluzioni muovendomi su più binari mentali insieme. Trovo connessioni tra elementi distanti che una lettura lineare del problema ignorerebbe.",
    },
    {
      name: "Comunicazione emotiva",
      reframe:
        "Esprimo stati d'animo e dubbi in modo diretto, senza maschere difensive. Riduce l'attrito nei team e accelera la fiducia con chi ho di fronte.",
    },
    {
      name: "Onestà intellettuale",
      reframe:
        "Riconosco i fatti per quello che sono, anche quando smentiscono le mie convinzioni o feriscono l'ego. In un progetto tecnico significa ammettere un errore prima che costi settimane a qualcun altro.",
    },
    {
      name: "Mettersi nei panni degli altri",
      reframe:
        "Simulo la prospettiva di chi ho di fronte per decodificarne motivazioni e bisogni, oltre il mio giudizio personale. Nei team distribuiti anticipo obiezioni prima che diventino blocchi.",
    },
    {
      name: "Assertività",
      reframe:
        "Definisco i miei confini e difendo le mie posizioni con fermezza, senza cedere per evitare il conflitto e senza aggredire l'altro. Le decisioni tecniche restano contendibili sul merito, non sul tono.",
    },
  ] as GrowthArea[],

  // ── Personal projects ─────────────────────────────────────────────────────
  projects: [
    {
      name: "Digital CV — Progetto Open Source AI-Augmented",
      description:
        "Ho costruito da solo questo CV, open source, lavorando con GitHub Copilot e Claude. È fatto di due pezzi, il sito in Astro e Lit con le animazioni in GSAP e un server MCP che espone i dati del CV agli agenti AI. Con PostHog guardo come lo usano le persone vere, e quando i numeri smentiscono una mia idea cambio l'idea.",
      url: "https://github.com/julioojospintados/digital-cv",
      repoUrl: "https://github.com/julioojospintados/digital-cv",
      date: "2026-04",
      tags: [
        "Astro",
        "Lit",
        "GSAP",
        "MCP Protocol",
        "TypeScript",
        "Hono",
        "Prompt Engineering",
        "GitHub Copilot",
      ],
      slug: "digital-cv",
      primaryMode: "tech",
      role: "AI Workflow Designer & Full-Stack Developer. Idea, UX/UI e sviluppo, da solo.",
      problem:
        "Avevo iniziato a lavorare con l'AI, gli MCP e il vibe coding, e mi serviva un progetto vero su cui provarli, non l'ennesimo tutorial. Intanto il mio CV in PDF faceva il contrario di quello che volevo: elencava competenze senza mostrarle, e dava lo stesso foglio a un recruiter, a un CTO e a un art director, che cercano tre cose diverse. Ho messo insieme le due esigenze e ho costruito il CV che mi mancava con il metodo che volevo dimostrare.",
      process: [
        "Ricerca — Sono partito da chi legge. Un recruiter vuole capire in fretta chi sono, un CTO guarda lo stack e l'architettura, un art director guarda l'estetica e come racconto le cose. Da lì in poi ogni scelta doveva servire almeno a uno dei tre, e dovevo saperla spiegare in un colloquio.",
        "Concept — Il knolling, la foto dall'alto in cui gli oggetti stanno in ordine sul tavolo, uno accanto all'altro. Le mie competenze sono molto diverse fra loro, codice, design, palco, metodo, e metterle sul tavolo così mi sembrava il modo più onesto di mostrarle: tutto in vista, niente nei cassetti.",
        "Architettura dell'informazione — Un profilo solo, letto con tre lenti: /design, /tech e /ai. La lente cambia l'accento di colore e quello che viene in primo piano, mai la struttura o il contenuto, e quello che non la riguarda resta sul tavolo con meno luce addosso.",
        "Design system — Le regole le ho decise prima dei componenti: lo sfondo ottanio che non cambia mai, un accento per ogni lente, Lexend e JetBrains Mono, animazioni solo su transform e opacity, ferme per chi chiede meno movimento. Ogni componente del sito sta in una vetrina, e se ne manca uno un controllo ferma il push verso main.",
        "Build AI-augmented — Ho scritto il codice in coppia con GitHub Copilot e Claude, dall'architettura all'interfaccia, dalle animazioni GSAP al server MCP con tool, resource e prompt che espone il CV agli agenti AI. Se il sito dice che lavoro così, deve esserne la prova.",
      ],
      decisions: [
        {
          title: "Il grafo era bello, l'ho tolto",
          body: "Le competenze erano un force graph in D3, la parte più spettacolare del sito. Su telefono l'avevo già messo dopo le card, perché un grafo si guarda e non si legge in fretta. Poi l'ho tolto del tutto, e adesso una competenza compare dentro il lavoro in cui l'ho usata, che dice molto più di un logo sospeso in mezzo agli altri.",
        },
        {
          title: "Sussurri, non silenzi",
          body: "Quando scegli una lente, quello che non la riguarda non sparisce, si abbassa di tono e resta leggibile, anche da tastiera e da screen reader. Nasconderlo avrebbe smentito il knolling, dove sul tavolo c'è tutto.",
        },
        {
          title: "Misurare sugli schermi veri",
          body: "Controllavo il sito su finestre comode, 1280 per 900. PostHog diceva che il portatile più comune fra i visitatori apre una finestra di 1366 per 610, e lì i bottoni delle schede d'ingresso finivano sotto il bordo, e chi arrivava non vedeva dove cliccare. Ora ogni pagina viene misurata alle dimensioni che usano davvero i visitatori, telefoni compresi, prima che una modifica vada online.",
        },
        {
          title: "L'accessibilità decisa all'inizio",
          body: "Il contrasto lo misuro sul pixel più chiaro dietro ogni riga di testo, perché sopra un'immagine il colore di fondo scritto nel CSS dice poco. Ogni accento ha una versione per il testo piccolo che supera 4,5:1 sull'ottanio. Focus visibile, skip link e movimento ridotto sono regole del design system dal primo giorno, le aree di tocco da 44 pixel sono arrivate dopo, insieme al controllo che le misura su ogni pagina.",
        },
      ],
      outcomes: [
        "Un server MCP con tool, resource e prompt, che permette a un agente AI di leggere il mio CV come un'API.",
        "PostHog e Vercel Analytics misurano come si usa il sito, e da quei numeri sono venute modifiche vere, come le schede d'ingresso rifatte per stare nella finestra del portatile più comune.",
        "Controlli sul sito costruito prima di ogni push verso main, su tutte le pagine e in tutte e due le lingue. Il primo giro della vetrina ha trovato 91 classi vive che nessuno aveva documentato.",
      ],
      learnings: [
        "L'AI va veloce solo dentro regole decise prima: i token, come si anima, cosa non si fa, scritti nero su bianco. Senza, produce in fretta lavoro da rifare.",
        "Ogni dettaglio deve reggere la domanda «perché?». Se una scelta visiva non ha una risposta da colloquio, è decorazione.",
        "Le idee che mi piacevano di più, il grafo e lo scroll a step, sono state le prime che ho dovuto ridimensionare davanti all'uso reale. Conviene metterle alla prova presto, quando cambiarle costa poco.",
      ],
      automationsIntro:
        "Il sito è anche il posto dove provo l'automazione: agenti, skill e un server MCP, più i controlli che fermano un difetto prima che vada online. Le righe con il badge AI usano un modello di linguaggio.",
      automations: [
        {
          name: "Agente cv-recruiter",
          kind: "Agente AI · Claude Code",
          what: "Legge un annuncio, mi dice cosa manca nel mio profilo, calcola quanto sono compatibile e genera il CV mirato in PDF, in versione grafica e per gli ATS.",
          ai: true,
        },
        {
          name: "Agente ux-reviewer",
          kind: "Agente AI · Claude Code",
          what: "Rivede il sito senza toccarlo, alle dimensioni di schermo dei visitatori veri, in italiano e in inglese, e mi consegna i problemi in ordine di gravità.",
          ai: true,
        },
        {
          name: "Generatore di CV da telefono",
          kind: "AI · Gemini API",
          what: "Dall'annuncio, anche fotografato, al CV mirato, alla lettera di presentazione e a una stima di stipendio, con i PDF generati sul server.",
          ai: true,
        },
        {
          name: "Server MCP",
          kind: "AI · Model Context Protocol",
          what: "Espone il mio CV agli agenti AI con tool, resource e prompt, compresi la generazione del CV e il registro delle candidature.",
          ai: true,
        },
        {
          name: "Otto skill di progetto",
          kind: "AI · Claude Code e GitHub Copilot",
          what: "Istruzioni che l'AI carica quando servono: il contesto del progetto, il design system, il mio modo di scrivere, il metodo, l'architettura, il posizionamento.",
          ai: true,
        },
        {
          name: "Verification loop",
          kind: "Skill AI",
          what: "Costruire, misurare, criticare. Il lavoro lo giudica un revisore che non l'ha fatto, mai chi l'ha scritto.",
          ai: true,
        },
        {
          name: "Registro candidature",
          kind: "Vercel Blob",
          what: "Lo stato di ogni candidatura, che aggiorno dal telefono o da un agente: inviata, risposta ricevuta, CV confermato, esito.",
          ai: false,
        },
        {
          name: "Controlli prima del push",
          kind: "Husky · Playwright",
          what: "Prima di ogni push verso main: lint, build e cinque controlli sul sito costruito, cioè vetrina dei componenti, parità fra italiano e inglese, link, contrasto e dimensioni di schermo reali.",
          ai: false,
        },
        {
          name: "Generatori di CV in PDF",
          kind: "Node · Playwright",
          what: "Quattro versioni dagli stessi dati, con i link nella lingua del documento. Un'esperienza che non sta nella pagina passa alla successiva, intera.",
          ai: false,
        },
      ],
    },
    {
      name: "Bambagia — UX/UI Design for a B2B Cosmetics Brand",
      description:
        "Per Bambagia Design Lab ho progettato il sito di un brand cosmetico che vende ai professionisti, dal wireframe al design system. Il sito poi l'avrebbe mantenuto lo studio, che lavora su Wix Studio, e così ho preparato con l'AI un ambiente di lavoro che produce soltanto pagine che in Wix si possono ricostruire, con le istruzioni per l'agente e gli MCP di Figma e di Wix.",
      date: "2026-05",
      tags: [
        "UX/UI Design",
        "Wireframing",
        "Prototipazione",
        "Design System",
        "Figma",
        "Wix Studio",
        "MCP",
        "GitHub Copilot",
        "HTML5",
        "CSS",
      ],
      slug: "bambagia",
      primaryMode: "creative",
      role: "UX/UI Designer & AI Workflow Designer, collaborazione con Bambagia Design Lab (2026).",
      problem:
        "Bambagia Design Lab mi ha chiesto il sito di un brand cosmetico che vende a estetiste, centri benessere e farmacie, un sito vetrina senza carrello, con le linee di prodotto su tre livelli, i corsi e le richieste di personalizzazione. Il vincolo vero però arrivava dopo la consegna, perché a mantenere il sito sarebbe stato lo studio, su Wix Studio, e se una pagina in Wix non si ricostruisce, o ci arriva come un blocco statico, per ogni modifica serve di nuovo qualcuno che scriva codice. Cioè io.",
      process: [
        "Ricerca — Prima di disegnare qualsiasi cosa ho studiato il cliente e i suoi concorrenti, chi compra, cosa cerca un professionista quando apre il sito di un marchio di cosmetica, come sono organizzate le linee. Ne è uscito un brief con le pagine, le funzioni e i prodotti divisi in linee, sotto-linee e singoli prodotti.",
        "Wireframe — Il prototipo low-fi l'ho scritto a mano in HTML e CSS, nove pagine con una mappa del sito come ingresso. Si apre direttamente dal browser, senza server, così lo studio ci clicca dentro come farebbe con un sito vero.",
        "Direzione visiva — Sullo stesso contenuto ho disegnato tre home diverse, ed è passata quella che io chiamavo Nature Professional. Su quella ho costruito tutte le altre pagine, in versione desktop e mobile.",
        "Regole Wix-friendly — Ho scritto dodici regole perché ogni pagina passi in Wix Studio così com'è. Ogni sezione è un blocco a sé, che in Wix diventa una Section, le spaziature seguono la griglia da 8 punti che usa Wix e i colori escono da variabili che diventano i colori del tema.",
        "Ambiente AI — Su VS Code ho messo in piedi per lo studio un ambiente da riusare con ogni cliente, con le istruzioni per GitHub Copilot che si attivano cliente per cliente, un agente che conosce il percorso dal brief al sito e gli MCP di Figma, Wix e Playwright. Le regole grafiche e quelle di Wix le ho scritte una volta, e da lì le applica l'agente a ogni pagina.",
      ],
      decisions: [
        {
          title: "Il plugin Figma → Wix, non l'MCP di Wix",
          body: "Con l'MCP di Wix il design arrivava nel sito più in fretta, ma come una cornice statica, bella da vedere e impossibile da modificare per chi non scrive codice. Ho preferito il plugin che esporta da Figma e crea sezioni, contenitori e stili del tema nativi di Wix Studio. A me costa un passaggio in più, allo studio risparmia una telefonata ogni volta che deve cambiare un testo.",
        },
        {
          title: "Un design fatto per essere rifatto",
          body: "Il design in HTML è una guida, perché le pagine vere le ricostruisce lo studio dentro Wix, e allora ho lasciato fuori tutto quello che Wix non sa rifare, come i posizionamenti assoluti complicati, le maschere o le librerie di animazione tipo GSAP. Le animazioni usano tre classi standard che in Wix diventano interazioni native, mentre moduli e menu li ho solo disegnati, visto che in Wix si rifanno con i suoi componenti.",
        },
        {
          title: "Tre home sullo stesso contenuto",
          body: "Quando la proposta è una sola, la revisione diventa un elenco di correzioni. Con tre proposte il cliente sceglie prima l'atmosfera e corregge dopo. Le due scartate sono rimaste nella cartella interna del brief, al cliente è arrivato solo il prototipo.",
        },
        {
          title: "L'atmosfera sì, i colori no",
          body: "Nature Professional aveva un oro come accento e due Google Fonts, ma il brand una palette ce l'aveva già, terracotta, beige e salvia. Della mia proposta ho tenuto la struttura, il ritmo e le animazioni, e ci ho messo dentro i colori e i font del brand, caricati in locale perché Wix li importa come font personalizzati.",
        },
      ],
      outcomes: [
        "Tre home proposte, una scelta, e su quella nove pagine disegnate per desktop e mobile.",
        "Un ambiente da riusare, dove ogni nuovo cliente dello studio parte dalla stessa struttura di cartelle, dalle stesse regole e dallo stesso agente.",
        "Eleonora D'Agostino, titolare dello studio, ha scritto una raccomandazione su questo lavoro, e la trovi fra le voci del mio CV.",
      ],
      learnings: [
        "La domanda da farsi all'inizio era chi avrebbe messo le mani sul sito dopo di me, e da quella risposta è venuto tutto il resto, a partire dal primo wireframe.",
        "Le regole scritte per l'agente lui le rispetta a ogni pagina e a ogni sessione. Quelle che tenevo a mente io le rispettavo quando me ne ricordavo.",
      ],
      automationsIntro:
        "L'ambiente che ho costruito per lo studio, perché l'AI lavori dentro le regole di Wix invece di inventarsene di sue. Le righe con il badge AI usano un modello di linguaggio.",
      automations: [
        {
          name: "Agente Wix Builder",
          kind: "Agente AI · GitHub Copilot",
          what: "Conosce il percorso dal brief al sito, legge il brief, aggiorna il prototipo, lo controlla nel browser e chiede conferma prima di toccare un sito Wix già pubblicato.",
          ai: true,
        },
        {
          name: "Istruzioni per cliente",
          kind: "AI · GitHub Copilot",
          what: "Si attivano solo sui file di quel cliente, con il suo pubblico, le sue preferenze e la struttura dei suoi prodotti. Il cliente dopo ha le sue, e non si mescolano.",
          ai: true,
        },
        {
          name: "Regole Wix e Velo",
          kind: "AI · GitHub Copilot",
          what: "Le dodici regole Wix-friendly e i limiti dell'esportazione da Figma, che l'agente applica a ogni pagina che scrive.",
          ai: true,
        },
        {
          name: "MCP di Figma e Wix",
          kind: "AI · Model Context Protocol",
          what: "Danno all'agente i file di Figma e la documentazione di Wix e Velo, così codice e design non si separano.",
          ai: true,
        },
        {
          name: "Revisione nel browser",
          kind: "Playwright · MCP",
          what: "Fotografa ogni versione del prototipo prima che la veda il cliente.",
          ai: false,
        },
      ],
    },
    {
      name: "Looking for Flights — Flight Price Monitor",
      description:
        "Per il mio viaggio di settembre 2026, finito poi in Sri Lanka, ho costruito un programma che tiene d'occhio i prezzi dei voli al posto mio. Due volte a settimana una GitHub Action cerca il volo più economico, calcola quanti giorni posso restare a terra con il budget che ho e mi scrive su Telegram solo quando c'è qualcosa da sapere. Tutto il viaggio sta in un file di configurazione, e il budget resta privato anche se il repository è pubblico.",
      url: "https://github.com/julioojospintados/looking-for-flights",
      repoUrl: "https://github.com/julioojospintados/looking-for-flights",
      date: "2026-07",
      tags: [
        "Node.js",
        "GitHub Actions",
        "Telegram Bot API",
        "Cloudflare Workers",
        "SerpApi",
        "Claude Code",
      ],
      slug: "looking-for-flights",
      primaryMode: "tech",
      role: "Ideatore e unico utente, progetto personale costruito con Claude Code (2026).",
      problem:
        "Per settembre 2026 avevo un budget fisso e una domanda precisa, dove posso andare e per quanti giorni senza sforarlo. Il volo più economico non bastava a rispondere, perché a terra ogni paese ha un costo diverso, e non avevo nessuna voglia di passare l'estate ad aprire Google Flights ogni mattina per scoprire che non era cambiato niente.",
      process: [
        "Il calcolo — Per ogni meta il programma prende il volo di andata e ritorno più economico, toglie dal budget il volo e le spese fisse, divide quello che resta per quanto si spende in un giorno a destinazione e taglia il risultato alla durata massima del viaggio. In classifica contano prima i giorni, poi il costo totale. Con i prezzi del 31 luglio il volo più economico era per Giacarta, eppure in testa c'era l'India, dove a terra si spendevano 7 euro al giorno in meno.",
        "Motore e configurazione — La logica del viaggio sta tutta in un file, con le date, la durata, gli aeroporti di partenza e le mete con la loro spesa giornaliera, così per cambiare viaggio non si tocca il codice. Le mete nuove si scrivono in un file di testo, una per riga, e uno script le sincronizza.",
        "Le notifiche — Il bot tace finché non ha qualcosa da dire. Scrive su Telegram la prima volta che gira, quando cambia la meta in testa alla classifica o quando un volo scende di almeno 15 euro, e per ogni meta manda una tabella con compagnia, orari, durata da porta a porta e scali, compreso quello che si mangia una notte. Due voli allo stesso prezzo possono essere due viaggi molto diversi.",
        "Su richiesta — Con il comando /cerca il bot fa la stessa ricerca quando lo decido io. All'inizio un workflow controllava i messaggi ogni 15 minuti, almeno sulla carta, perché a misurarlo GitHub lo faceva girare ogni 26 minuti, a volte 42. L'ho sostituito con un Cloudflare Worker, che riceve il messaggio da Telegram appena arriva e fa partire subito la ricerca.",
        "Sri Lanka — La lista è partita da cinque mete in Asia. Il 2 agosto ci ho aggiunto lo Sri Lanka, poi ho ristretto la ricerca a lui solo, con partenza fra il 12 e il 15 settembre e ritorno entro la fine del mese, e il 12 settembre, con la finestra di partenza ormai aperta, ho spento il monitoraggio.",
      ],
      decisions: [
        {
          title: "Il budget non sta nel repository",
          body: "Il repository è pubblico, il mio budget no. Arriva al programma mentre gira, da una secret di GitHub, e né le notifiche né lo storico mostrano i giorni prima del taglio o i soldi che avanzano, perché messi accanto alla spesa giornaliera e al prezzo del volo, che sono pubblici, basterebbe una sottrazione per ricavare il budget esatto.",
        },
        {
          title: "225 ricerche su 250 in due giorni",
          body: "Il piano di SerpApi dà 250 ricerche al mese. Ogni giro ne consumava 60, il cron partiva due volte al giorno, e appena /cerca è diventato istantaneo l'ho lanciato tre volte in un'ora. Me ne sono accorto da una email di avviso. Adesso c'è un tetto che vale per tutte le esecuzioni insieme, su una finestra mobile di 30 giorni, con una riserva che il cron non può toccare, perché se il cron salta un giro non se ne accorge nessuno, mentre dietro un /cerca c'è una persona che aspetta. Ogni giro adesso costa 15 ricerche invece di 60.",
        },
        {
          title: "Torino accanto a Milano",
          body: "La classifica usa il prezzo più basso, che parte quasi sempre da Malpensa o da Orio. In ogni notifica però c'è anche il prezzo migliore da Torino, così decido se il risparmio vale il viaggio fino a Milano, e non costa ricerche in più, perché i prezzi dei singoli aeroporti arrivano già nella stessa risposta.",
        },
        {
          title: "Senza budget, restano i prezzi",
          body: "Quando una secret non esiste, GitHub la passa come stringa vuota, e il controllo sul budget la scambiava per un valore sbagliato. Quattro esecuzioni fallite di fila. Adesso vuoto e assente valgono la stessa cosa, e senza budget il programma ordina le mete solo per prezzo del volo, con un avviso in cima alla notifica. Un valore scritto male, tipo «1500 EUR», invece blocca ancora tutto, ed è giusto così.",
        },
        {
          title: "Zero dipendenze, con un'eccezione",
          body: "Il progetto usa solo la libreria standard di Node, quindi niente installazioni in CI e nessuna catena di fornitura da tenere d'occhio. L'unico pezzo fuori da GitHub è il Cloudflare Worker, cioè proprio la strada che all'inizio avevo scartato. Poi ho misurato quanto aspettava una risposta a /cerca, fino a quaranta minuti, e ho dovuto ammettere che non era «su richiesta», era un cron travestito. Ho ceduto.",
        },
      ],
      outcomes: [
        "Dal 31 luglio al 12 settembre il monitor ha girato da solo due volte a settimana, e la GitHub Action ha salvato lo storico dei prezzi in 18 commit automatici.",
        "Ogni esecuzione è passata da 60 a 15 ricerche, con un tetto mensile che tiene separati i controlli programmati da quelli che lancio io.",
        "Lo Sri Lanka è entrato nella lista il 2 agosto, ed è lì che sono partito a settembre.",
        "Il motore di calcolo è diventato la base di trip-runway, la web app che fa la stessa domanda per chiunque viaggi.",
      ],
      learnings: [
        "Ho deciso prima quando il bot doveva stare zitto, e solo dopo quando doveva scrivere. Quelle tre condizioni sono la parte di UX del progetto, anche se nessuno le vede.",
        "Le quote gratuite andavano contate prima di scrivere il cron. Le ho contate dopo, su gentile richiesta di una email di avviso.",
        "Un monitor fermo e silenzioso sembra un prezzo che non è cambiato. Per questo adesso ogni esecuzione fallita mi scrive su Telegram, con il link ai log.",
      ],
    },
    {
      name: "Trip-Runway — Travel Budget Yield App",
      description:
        "Ho trasformato looking-for-flights, il mio script per tenere d'occhio i prezzi dei voli, in trip-runway: una web app che mette insieme il costo del volo e quanto costa vivere a destinazione, e calcola per quanti giorni si può viaggiare con un budget fisso. È fatta con Next.js, Supabase e Prisma. I prezzi si aggiornano una volta per rotta, qualunque sia il numero di utenti che la seguono, e il guadagno arriva dall'affiliazione sui voli.",
      url: "https://trip-runway.vercel.app",
      repoUrl: "https://github.com/julioojospintados/trip-runway",
      date: "2026-08",
      tags: [
        "Next.js",
        "TypeScript",
        "Tailwind CSS",
        "Supabase",
        "Prisma",
        "Clerk",
        "Travelpayouts API",
        "Vercel",
      ],
      slug: "trip-runway",
      primaryMode: "tech",
      role: "Full-Stack Developer & Product Owner, progetto personale in sviluppo (2026).",
      problem:
        "looking-for-flights funzionava, ma lo usavo solo io. La domanda a cui risponde, quanti giorni posso permettermi con questo budget, se la fa chiunque viaggi con un tetto di spesa. Ho deciso di farne un prodotto, gratuito per chi prova il calcolo e pagato dall'affiliazione quando qualcuno prenota, senza riscrivere il motore che già funzionava.",
      process: [
        "Origine — Il calcolo l'ho portato da looking-for-flights così com'era: il budget meno il volo, diviso la spesa giornaliera, tagliato alla durata massima del viaggio. L'avevo già provato su un viaggio vero, il mio. Il lavoro nuovo stava tutto intorno.",
        "Modello di business — Freemium, con il guadagno dall'affiliazione sui voli attraverso Travelpayouts e la rete Aviasales. Per ora niente abbonamento, così entrare non costa nulla e intanto scopro se la domanda esiste anche fuori dalla mia cerchia.",
        "Architettura anti-abuso — Il frontend non chiama mai l'API dei voli. Chi usa l'app salva una rotta, di notte un cron prende le rotte salvate, fa una chiamata sola per ognuna e aggiorna il prezzo per tutti quelli che la seguono. Le quote gratuite sono basse, e questa deduplicazione l'ho progettata prima della prima funzione, non dopo il primo blocco.",
        "Stack e sicurezza — Next.js con l'App Router, PostgreSQL su Supabase attraverso Prisma, login con Clerk. Ogni Server Action che modifica o cancella dati controlla che chi la chiama sia il proprietario del record. Senza quel controllo un utente potrebbe cambiare le rotte salvate da un altro.",
      ],
      decisions: [
        {
          title: "Una chiamata per rotta",
          body: "Una chiamata in tempo reale per ogni utente avrebbe finito la quota gratuita in poche ore. Le rotte stanno nel database senza doppioni, e parte una chiamata per ogni rotta, che la segua una persona sola o molte.",
        },
        {
          title: "Amadeus escluso, non per scelta",
          body: "Volevo i prezzi di Amadeus, ma a metà 2026 ha chiuso il portale self-service per sviluppatori ed è rimasto solo il canale Enterprise, che per un progetto appena nato non è una strada. Ho preso Travelpayouts, gratuito e con i link di affiliazione già pronti, e tengo Duffel come piano B se un giorno servirà un prezzo live da GDS.",
        },
        {
          title: "Prima il calcolo gratis",
          body: "Un abbonamento dal primo giorno avrebbe chiuso fuori chi vuole solo provare il calcolo. Con l'affiliazione guadagno quando qualcuno prenota, e a chi sta ancora guardando non chiedo la carta di credito.",
        },
        {
          title: "L'autorizzazione dalla prima Server Action",
          body: "Il controllo sul proprietario del record è una regola dell'architettura da subito. Lasciarlo per ultimo, come compito di sicurezza da fare prima del lancio, voleva dire ripassare a mano ogni azione già scritta.",
        },
      ],
      outcomes: [
        "L'app è online su Vercel, a trip-runway.vercel.app, e nasce da uno strumento personale che funzionava già.",
        "Il motore di calcolo viene da looking-for-flights senza essere stato riscritto.",
        "Deduplicazione delle chiamate per rotta e controllo del proprietario su ogni Server Action, decisi prima di scrivere le prime funzioni.",
      ],
      learnings: [
        "Uno strumento che uso io per un problema vero è la verifica di mercato più economica che conosca: il bisogno c'era prima del prodotto.",
        "Il fornitore dei prezzi l'ha scelto la chiusura del portale Amadeus, non un confronto fra funzioni. I vincoli che arrivano da fuori decidono l'architettura più dei miei gusti.",
      ],
    },
    {
      name: "Product Discovery — UX Research & Product Strategy",
      description:
        "Con un socio tecnico ho rovesciato il modo in cui di solito nasce un prodotto digitale: prima la ricerca su cosa serve davvero alle persone, poi l'idea. Design Thinking ed Effectuation, una mappa dei comportamenti su Miro letta con le Four Forces, interviste, analisi dei concorrenti. Da 17 idee ne è rimasta una, ora in sviluppo, che valideremo con il pPoC Engine prima di scrivere codice.",
      date: "2026-05",
      tags: [
        "UX Research",
        "Product Strategy",
        "Design Thinking",
        "Effectuation",
        "Four Forces (Jobs to Be Done)",
        "Interviste utente",
        "Value Proposition Canvas",
        "pPoC Engine",
        "Miro",
        "Figma",
        "Prototipazione",
      ],
      slug: "product-discovery",
      primaryMode: "creative",
      role: "UX Researcher & Product Strategist, progetto in corso con un socio tecnico (2026).",
      problem:
        "Tante app risolvono problemi che nessuno sente, o provano a inventarne uno. Con il mio socio abbiamo fatto il contrario del solito: nessuna idea di partenza da difendere, prima lo studio dei comportamenti, delle ansie e dei desideri di tutti i giorni che i prodotti digitali non intercettano. Volevamo sapere se a qualcuno interessa un prodotto prima di scriverne una riga.",
      process: [
        "Ricerca — Ho mappato su Miro comportamenti e bisogni delle persone con le Four Forces del Jobs to Be Done: cosa spinge a cambiare, cosa attira della soluzione nuova, l'ansia del cambiamento, la forza dell'abitudine. Ho raggruppato i bisogni in aree, dall'identità alla paura di invecchiare, dal bisogno di controllo alle relazioni, e li ho pesati per gravità, diffusione e area culturale. Al posto delle fasce d'età ho usato la psicologia comportamentale.",
        "Validazione — Una mappa fatta a tavolino dà ragione a chi l'ha fatta. I bisogni li ho messi alla prova con 7 chiacchierate informali di un quarto d'ora con persone nel target, e con i concorrenti che provano già a rispondere a quei bisogni, guardando dove i loro flussi funzionano e dove no.",
        "Ideazione — Dalla mappa, con il socio, sono uscite 17 idee, ognuna legata a un bisogno preciso. La logica è quella dell'effectuation: si parte dai mezzi e dai bisogni che hai già in mano, invece che da un obiettivo fisso da difendere a ogni costo. Le più promettenti le ho smontate con il Value Proposition Canvas e poi le ho date in pasto all'AI in un ruolo avversario: un venture capitalist scettico sui conti, un analista a caccia di blocchi tecnici e legali.",
        "Prioritizzazione — Una matrice Valore/Sforzo ha incrociato quanto vale un'idea per chi la usa con quanto costa progettarla. Delle 17 ne sono rimaste 4, e abbiamo messo tutto su una, quella in sviluppo adesso.",
        "pPoC Engine — L'ultimo test è il nostro pPoC Engine, un Probabilistic Proof of Concept: un prototipo Figma ad alta fedeltà che sembra un'app vera, messo davanti alle persone per misurare cosa fanno, non cosa dicono. Le soglie le abbiamo fissate prima: oltre l'8% di conversione all'onboarding, oltre il 2% di clic sul pre-ordine.",
      ],
      decisions: [
        {
          title: "Prima i bisogni, poi l'idea",
          body: "Di solito si parte da un'idea e si cercano conferme. Noi siamo partiti dai bisogni e abbiamo lasciato che le idee uscissero dalla mappa. All'inizio ci vuole più tempo, in cambio si evita di innamorarsi di un prodotto che piace solo a chi l'ha inventato.",
        },
        {
          title: "La lavagna contro un quarto d'ora di chiacchiere",
          body: "Studiare dalla scrivania era più comodo, e conferma quello che pensi già. Le chiacchierate con le persone nel target hanno ribaltato il quadro: tante idee che sulla lavagna sembravano forti non hanno retto un quarto d'ora di conversazione. Il taglio da 17 a 4 viene quasi tutto da lì.",
        },
        {
          title: "L'AI come avvocato del diavolo",
          body: "Le idee erano nostre, all'AI non ne ho chieste. L'ho istruita per attaccarle, nei panni di un venture capitalist scettico e di un analista tecnico e legale. Un'AI accomodante ti dà ragione su tutto, messa contro ha trovato in poche ore i buchi che avremmo scoperto dopo il lancio.",
        },
        {
          title: "Un esempio finto per proteggere l'idea vera",
          body: "L'idea in sviluppo è riservata, quindi racconto il metodo su un esempio volutamente sciocco: CheCaspitaMangio, un'app che decide la cena facendo girare una ruota. Il bisogno è l'ansia da decisione, e il Value Proposition Canvas regge lo stesso: l'utente vuole scegliere la cena senza perderci mezz'ora, i suoi dolori sono le discussioni di coppia e la stanchezza mentale, la ruota gli toglie il peso della scelta, e quello che decide la ruota non si discute. Se il metodo funziona su un'idea stupida, funziona.",
        },
        {
          title: "Misurare i clic, non i complimenti",
          body: "Una landing page che raccoglie email misura quello che le persone dichiarano, e le persone dichiarano una cosa e ne fanno un'altra. Il pPoC misura gesti che costano qualcosa: completare la configurazione delle preferenze, cliccare su un abbonamento da 0,99€ al mese che non addebita niente ma registra la volontà di pagare. Se nessuno clicca, il backend non lo scriviamo.",
        },
      ],
      outcomes: [
        "Da 17 idee a una, passata per interviste, analisi dei concorrenti e matrice Valore/Sforzo, ora in sviluppo.",
        "7 interviste con persone nel target prima di disegnare una sola schermata.",
        "Soglie di validazione fissate prima del lancio del pPoC: oltre l'8% di conversione all'onboarding, oltre il 2% di clic sul pre-ordine.",
      ],
      learnings: [
        "La UX viene prima del codice. Un software perfetto che non risolve un bisogno vero è solo un costo scritto bene.",
        "Parlare presto con persone vere costa poco e taglia molto. La maggior parte delle idee che piacevano a noi non aveva mercato, e l'abbiamo scoperto prima di scrivere codice.",
      ],
    },
    {
      name: "Music Agency — Tour Management & Digital Strategy",
      description:
        "Ho organizzato booking e tour per gli artisti di un'agenzia musicale italiana e ho progettato la sua comunicazione online: dalle trattative con i promoter ai canali social, fatti crescere verso chi lavora nella musica invece che verso il pubblico generico.",
      date: "2023-01",
      tags: [
        "Tour management",
        "Booking",
        "Content Strategy",
        "Digital marketing",
        "Event management",
      ],
      slug: "music-agency",
      primaryMode: "creative",
      role: "Tour Manager & Digital Strategist, collaborazione remota (2023–2024).",
      problem:
        "Il roster dell'agenzia aveva bisogno di due cose insieme: date dal vivo organizzate bene, fra locali, promoter e contratti, e una presenza online che parlasse a chi lavora nella musica. I social crescevano, ma i follower e il lavoro vero dell'agenzia non si incontravano mai.",
      process: [
        "Ricerca — Prima di proporre qualcosa ho intervistato le persone dell'agenzia: come nasce una data, chi conta davvero fra gli interlocutori, dove si blocca il contatto con musicisti, produttori ed etichette.",
        "Insight — Servivano i follower giusti, più che tanti follower. I canali dovevano diventare un modo per entrare in contatto con la filiera, e ogni contenuto un'occasione per aprire una relazione di lavoro.",
        "Ideazione — Ho proposto una playlist di artisti emergenti come strumento per conoscere gente: ogni artista inserito è un contatto diretto con un musicista, un produttore o un'etichetta, e ci si scopre a vicenda invece di seguirsi e basta. Con la stessa logica ho proposto un format radiofonico, per portare l'idea fuori dalle piattaforme di streaming.",
        "Esecuzione — Ho scritto la strategia dei contenuti e i testi per la festa di compleanno dell'agenzia, e intanto ho fatto il lavoro di booking e di tour management: cercare i locali, trattare con i promoter, chiudere i contratti. Fino alla serata all'Arci Bellezza di Milano, che ho seguito dall'inizio alla fine.",
      ],
      decisions: [
        {
          title: "Prima ascoltare, poi proporre",
          body: "Nessuna proposta è arrivata prima delle interviste con chi in agenzia ci lavora ogni giorno. La playlist e il format radio, le idee poi accolte, vengono da lì e non da un manuale di marketing. È quello che faccio con gli utenti di un software, solo fuori dal software.",
        },
        {
          title: "La playlist come scusa per scriversi",
          body: "Una playlist di emergenti l'ho pensata come un motivo per contattare qualcuno, prima che come un contenuto da pubblicare. Ogni inserimento apre una conversazione con chi quella musica la fa o la produce, e il format radio portava la stessa idea dove lo streaming non arriva.",
        },
        {
          title: "Parlare alla filiera",
          body: "Far crescere i numeri sarebbe stato facile, e inutile. Ho riscritto i contenuti per chi lavora nel settore: musicisti, produttori, etichette, promoter.",
        },
      ],
      outcomes: [
        "Follower raddoppiati senza pubblicità, verso un pubblico di settore: musicisti, etichette, promoter.",
        "La serata all'Arci Bellezza di Milano, dal booking alla comunicazione.",
        "Booking e coordinamento dei concerti per tutto il roster, in autonomia.",
      ],
      learnings: [
        "La ricerca qualitativa funziona anche fuori dal software. Ho intervistato l'agenzia come si intervistano gli utenti, e le proposte sono andate a segno al primo colpo.",
        "Un canale vale per le conversazioni che apre con le persone giuste. I follower vengono dopo.",
      ],
    },
    {
      name: 'Film "Double"',
      description:
        'Ho recitato come deuteragonista nel film "Double", prodotto a Torino da Filmine e presentato all\'Independent Film Festival di San Francisco nel 2022 e successivamente al cinema al Cinema Massimo per la prima italiana.',
      date: "2022-01",
      tags: ["Cinema", "Recitazione"],
    },
    {
      name: "App gestione dati Covid-19",
      description:
        "Ho sviluppato con React un applicativo per la visualizzazione di dati Covid-19 usato in numerosi ospedali negli USA.",
      date: "2022-01",
      tags: ["React", "Healthcare", "USA"],
    },
    {
      name: "Design system WebComponents per Aruba",
      description:
        "Ho sviluppato con Lit, HTML e SASS la libreria grafica WebComponents di Aruba, riutilizzabile cross-prodotto.",
      date: "2022-06",
      tags: ["Lit", "WebComponents", "Design System", "Aruba"],
    },
    {
      name: "Square Festival – Artiversum",
      description:
        "Ho cofondato e organizzato lo Square Festival nel Quadrilatero Romano di Torino, evento culturale multidisciplinare.",
      date: "2017-05",
      tags: ["Event management", "Cultura", "Torino"],
    },
    {
      name: "Veni Vidi Vinyl",
      description:
        "Ho creato con un amico Veni Vidi Vinyl, una serata di listening session dedicata ai vinili portati dai partecipanti. L'ho pensata per dare peso all'ascolto materiale: ogni riproduzione consuma il vinile, quindi ogni ascolto è irripetibile. L'ho fatta solo per il piacere di farla.",
      date: "2017-01",
      tags: ["Event management", "Musica", "Vinili"],
    },
    {
      name: "Invenzione di una parola — Salone Internazionale del Libro (Torino)",
      description:
        "Ho creato e presentato pubblicamente una parola nuova, con radici, suono e significato, al Salone Internazionale del Libro di Torino. Inventare una parola che regga è il gioco linguistico più serio che conosca.",
      date: "2019-05",
      tags: ["Poesia", "Linguistica", "Creatività", "Salone del Libro"],
    },
    {
      name: "Poesia",
      description:
        "Ho scritto poesie premiate in concorsi in Italia e in Australia, e una è stata scelta e letta in una trasmissione di Radio Capital. Scrivo in verso libero, senza schemi: è la parte della mia scrittura che non deve rendere conto a nessuno.",
      tags: ["Poesia", "Scrittura creativa", "Premi internazionali"],
    },
    {
      name: "La 'Tesina sui Baffi' — articolo su La Stampa",
      description:
        "La mia tesina scolastica sui baffi è finita sulle pagine de 'La Stampa'. Non c'era una strategia: solo i baffi, presi molto sul serio, e un giornale che ha deciso che fosse una notizia.",
      tags: ["Storytelling", "Marketing involontario", "Media", "Scrittura"],
    },
  ] as Project[],

  // ── Interests ─────────────────────────────────────────────────────────────
  interests: [
    "Fotografia",
    "Teatro e improvvisazione",
    "Scrittura e poesia",
    "Cinema indipendente",
    "Viaggi e culture internazionali",
    "Open source",
  ] as string[],

  // ── Social impact ─────────────────────────────────────────────────────────
  socialImpact: [
    {
      name: "Intervento in difesa di terzi in spazio pubblico",
      description:
        "Sono intervenuto in una situazione di pericolo in strada per la tutela di terzi. L'improvvisazione insegna a restare nel momento senza paralizzarsi, e fuori dal palco vale uguale.",
      tags: ["Coraggio civile", "Lucidità sotto pressione", "Pensiero rapido"],
    },
    {
      name: "Battitore d'asta per gala di beneficenza europeo (Burger King)",
      description:
        "Ho condotto in inglese un'asta di beneficenza durante un evento europeo Burger King con partecipanti internazionali. Ritmo dell'asta, pubblico e lingua straniera insieme: il tipo di serata in cui il teatro serve più del vocabolario.",
      tags: ["Inglese professionale", "Public speaking", "Event hosting", "Corporate events"],
    },
  ],

  // ── AI Workflow ───────────────────────────────────────────────────────────
  aiWorkflow: [
    {
      tool: "Claude",
      title: "Sviluppo, revisione del codice e testi del sito",
      desc: "Scrivo e revisiono codice su architetture Angular e Astro, analizzo bug e refactoring, e genero i testi del sito nel mio tono di voce.",
      impact: "Coding · Debug · Testi",
      tags: "tech creative human",
    },
    {
      tool: "GitHub Copilot",
      title: "Autocompletamento in sviluppo Angular enterprise",
      desc: "Genero codice ripetitivo NGRX, test Jest e pattern architetturali, con validazione critica dell'output.",
      impact: "Coding quotidiano",
      tags: "tech",
    },
    {
      tool: "Claude Code Skills",
      title: "Regole di scrittura, stile e vocabolario applicate ovunque",
      desc: "Ho costruito skill dedicate a scrittura, regole sintattiche e tono di voce: ogni testo del sito le rispetta senza revisione manuale ripetuta.",
      impact: "Scrittura · Regole · Stile",
      tags: "tech human",
    },
    {
      tool: "MCP",
      title: "Server MCP per GitLab, Jira e Playwright",
      desc: "Collego GitLab, Jira e Playwright come tool MCP: apro e chiudo issue, merge request e test end-to-end direttamente dalla chat con l'AI.",
      impact: "GitLab · Jira · Playwright",
      tags: "tech",
    },
    {
      tool: "Figma AI",
      title: "Da brief a prototipo interattivo in minuti",
      desc: "Genero schermate e flussi di navigazione in Figma da una descrizione testuale, come base per il wireframing strutturato.",
      impact: "Prototipazione UX/UI",
      tags: "creative tech",
    },
    {
      tool: "Miro AI",
      title: "Sintesi di workshop e brainstorming",
      desc: "Trasformo sticky notes e mappe di workshop in cluster tematici e prossimi passi, senza riscrivere a mano ogni sessione.",
      impact: "Facilitazione · Workshop",
      tags: "human",
    },
    {
      tool: "NotebookLM",
      title: "Ricerca e sintesi documentale",
      desc: "Carico documentazione tecnica e ricerche UX in NotebookLM per interrogarle e trovare riferimenti incrociati velocemente.",
      impact: "Ricerca · Documentazione",
      tags: "tech creative",
    },
  ] as AiWorkflowItem[],

  // ── Value flows ───────────────────────────────────────────────────────────
  // Ordered paths that show how Giulio creates value across skill domains
  valueFlows: [
    {
      name: "Prodotto Digitale End-to-End",
      description:
        "Dal bisogno aziendale al deploy: il flusso completo che unisce ricerca utente, design iterativo, sviluppo e consegna misurabile.",
      steps: [
        "UX Research",
        "Wireframing",
        "Agile Methodology",
        "Angular",
        "TypeScript",
        "CSS / SCSS",
        "Accessibility / WCAG",
        "REST API",
        "Git",
        "MCP Protocol",
      ],
    },
    {
      name: "Team Delivery & Facilitazione Agile",
      description:
        "Come un team passa dal caos operativo all'autonomia: il metodo arriva dall'improvvisazione, la struttura dall'Agile, e in mezzo molta comunicazione.",
      steps: [
        "Teatro e improvvisazione",
        "Agile Methodology",
        "Comunicazione efficace",
        "Pensiero T-shaped",
        "Autonomia strategica",
        "Git",
      ],
    },
    {
      name: "Comunicazione Strategica di Prodotto",
      description:
        "Dal copy alla campagna: come un prodotto tecnico trova le parole per farsi capire, e comprare.",
      steps: [
        "Scrittura e poesia",
        "Public speaking",
        "Sensibilità estetica",
        "Graphic design",
        "Digital marketing",
        "Social media management",
      ],
    },
    {
      name: "AI-First Implementation Workflow",
      description:
        "Il metodo GO Automated: ogni processo ripetibile diventa un agente. Dall'architettura AI al deploy senza interventi manuali, in sprint di 1–2 settimane.",
      steps: [
        "Prompt Engineering",
        "MCP Protocol",
        "Node.js",
        "REST API",
        "AI-Augmented Productivity",
        "Agile Methodology",
      ],
    },
    {
      name: "Build → Measure → Learn",
      description:
        "Dal rilascio alla decisione: uso i dati di prodotto per capire cosa funziona davvero, prima di investirci settimane di sviluppo.",
      steps: ["PostHog", "Vercel", "Agile Methodology", "UX Research"],
    },
  ] as ValueFlow[],

  // ── Feedbacks — testimonianze di chi ha lavorato con Giulio ────────────────
  feedbacks: [
    // Fabio Cencetti per primo: è la voce più vicina al lavoro che Giulio
    // cerca (UX/UI, design system), firmata da chi un design system lo
    // dirige. Testo suo, rivisto nella forma il 2026-10-14.
    {
      name: "Fabio Cencetti",
      role: "Design System Architect & Manager",
      quote:
        "Giulio ha moltissime competenze diverse: quando ho avuto bisogno di montare un video l'ha fatto lui, e insieme abbiamo costruito il Design System, facendo un bel pezzo di strada fianco a fianco. Ha qualità umane rare nel mondo del lavoro, ed è proprio questo a renderlo un professionista raro: un unicorno.",
      keywords: [],
    },
    {
      name: "Lorenzo Rando",
      role: "Recruiter / Head Hunter",
      quote:
        "Ho conosciuto Giulio durante un colloquio che doveva durare trenta minuti e ne è durato quasi due ore, perché ogni domanda apriva un ragionamento vero, mai una risposta preparata a tavolino. Ascolta prima di rispondere, ed è una delle poche persone che sa essere diretto senza mai mettere a disagio l'altra persona. Ha una curiosità autentica verso le persone, non solo verso i ruoli da riempire: si percepisce fin dalla prima domanda.",
      keywords: [],
    },
    {
      name: "Eleonora D'Agostino",
      role: "Owner, Bambagia Lab Design",
      quote:
        "Giulio è un professionista molto capace e soprattutto versatile. Mi ha supportato nello sviluppo di un progetto in cui è stato in grado di comprendere le mie esigenze a pieno e di realizzare quanto mi occorreva alla perfezione, anche e soprattutto modulando il suo lavoro sulle richieste che gli arrivavano in divenire, con grande rapidità e precisione. Lo raccomando assolutamente.",
      keywords: [],
    },
  ] as Feedback[],
} as const satisfies Record<string, unknown>;

export type CvData = typeof cvData;

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
 * Serve alle consulenze: da ALTEN, Giulio è stato su quattro clienti diversi
 * con ruoli diversi, ma è **un solo impiego** con una sola data d'inizio.
 * Modellarli come esperienze separate creerebbe quattro periodi sovrapposti
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
        "Ho sviluppato il server HTTP con Hono, spec OpenAPI, validazione Zod e test Vitest: copertura oltre l'80%.",
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
      role: "Frontend Developer",
      startDate: "2019-07",
      endDate: "present",
      location: "Torino, Italia",
      remote: false,
      description: "Consulenza Frontend, UX/UI, Metodo Agile e AI Augmentation.",
      // Quattro incarichi, un solo impiego: vedi ClientEngagement sopra.
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
          role: "Tech Lead & Design System Developer",
          description:
            "Progettazione e sviluppo della libreria di Web Components in Lit (100+ componenti usati per la realizzazione degli applicativi aziendali). Allineamento continuo con i team UX/UI su Figma, cura dei principi di accessibilità (WCAG) e integrazione di Storybook per la documentazione. Gestione delle code review, architettura SCSS modulare con BEM e test unitari con Jest e poi Vitest. Nel ruolo di Tech Lead ho gestito il team Agile facendo da ponte tra design e sviluppo per velocizzare l'onboarding e la consegna dei componenti.",
        },
        {
          client: "Intesa Sanpaolo",
          role: "Frontend Developer",
          description:
            "Sviluppo frontend in Angular su architetture complesse all'interno di un team distribuito di +30 persone. Programmazione reattiva con RxJS e collaborazione stretta con il backend in sprint Agile.",
        },
        {
          client: "Rai Pubblicità",
          role: "Frontend Developer",
          description:
            "Sviluppo frontend in Angular per applicativi interni. Implementazione del codice a stretto contatto con i team backend.",
        },
      ],
      highlights: [
        "Ho guidato come Tech Lead e Scrum Master il team Aruba Design System, oltre 3 anni e più di 30 persone: libreria di oltre 100 componenti WebComponents adottata cross-prodotto.",
        "Ho sviluppato architettura Angular enterprise per Intesa San Paolo in un team di oltre 50 persone, con standard condivisi e code review.",
        "Ho introdotto test unitari sistematici con Jest, con impatto diretto su stabilità dei rilasci e coverage.",
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
        "Code Coverage",
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
          role: "Design System Developer — Aruba",
          description:
            "Ho costruito il design system di Aruba dal lato di chi lo usa ogni giorno: una libreria di oltre 100 WebComponents in Lit, progettata insieme ai designer perché ogni componente rispetti tipografia, spacing e stati definiti in Figma.",
          highlights: [
            "Ho tradotto le specifiche visive dei designer in componenti riutilizzabili cross-prodotto, con naming e API condivisi.",
            "Ho difeso coerenza tipografica, spacing e stati dei componenti nelle code review, su un team di oltre 30 persone.",
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
        "Ho costruito questo CV interattivo open source con un workflow AI-augmented (GitHub Copilot e Claude). Sistema a due livelli: sito Astro e Lit con animazioni GSAP e wave effect SVG, più un server MCP che espone i dati del CV come API per agenti AI. Ho integrato PostHog per misurare come le persone usano davvero il sito. È la dimostrazione live del metodo: da solo ho prodotto in giorni ciò che un team produrrebbe in mesi.",
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
      role: "AI Workflow Designer & Full-Stack Developer. Ideazione, UX/UI e sviluppo in solitaria.",
      problem:
        "Avevo iniziato a lavorare con AI, MCP e vibe coding e mi serviva un banco di prova reale, non un tutorial. Allo stesso tempo il mio CV in PDF non dimostrava un profilo T-shaped: elencava competenze senza farle vedere in azione, e costringeva tre lettori molto diversi, recruiter, CTO e art director, nello stesso formato piatto. Ho unito le due esigenze: costruire lo strumento che mi mancava, usando proprio il metodo che volevo dimostrare.",
      process: [
        "Ricerca — Ho definito i tre lettori reali del CV (recruiter generalista, CTO, art director) e cosa ciascuno deve trovare nei primi 3 secondi: affidabilità e leggibilità, stack e architettura, estetica e storytelling. Ogni scelta successiva risponde a uno di loro: se non è argomentabile in colloquio, non entra.",
        "Concept — Il knolling: ordine e varietà insieme. Le mie competenze sono eterogenee (codice, design, palco, metodo) e il modo più onesto di presentarle è disporle sul tavolo come oggetti in una fotografia knolling: tutto visibile, catalogato, intenzionale, nessun cassetto chiuso.",
        "Architettura dell'informazione — Un solo profilo, tre prospettive: le route /tech /creative /human cambiano enfasi e accento cromatico, mai struttura o contenuto. Chi legge sceglie il proprio punto di vista; le altre anime restano visibili come sussurri a bassa opacità, mai nascoste.",
        "Design system — Sfondo ottanio fisso con 4 accent per mode, tipografia Lexend + JetBrains Mono, sistema square/glow per i livelli skill al posto delle barre percentuali, animazioni solo su transform/opacity con reduced-motion rispettato. Ho deciso i vincoli prima di scrivere i componenti.",
        "Build AI-augmented — Vibe coding con GitHub Copilot e Claude come pair operativi: architettura, UI, animazioni GSAP, e un server MCP con tool, resource e prompt template che espone il CV come API per agenti AI. Il sito è la controprova del workflow che dichiara.",
      ],
      decisions: [
        {
          title: "Il grafo dove c'è spazio, le card dove c'è fretta",
          body: "La vista skills più spettacolare è un force graph D3, ma i grafi si guardano, non si scansionano. Su mobile il default è la vista card, leggibile in 5 secondi, e D3 (~130KB) si carica solo per chi apre il grafo davvero. Su desktop, dove ci sono spazio e mouse per esplorarlo, il grafo accoglie per primo.",
        },
        {
          title: "Sussurri, non silenzi",
          body: "Quando scegli un mode, le card fuori tema non spariscono: scendono a bassa opacità. Nasconderle avrebbe contraddetto la tesi del sito. Il knolling è trasparenza radicale.",
        },
        {
          title: "Convenzioni dove l'utente ha fretta",
          body: 'Le esperienze extra si rivelano con "Leggi altre 3", il pattern di LinkedIn e Medium, al posto di un CTA brandizzato che avevo provato prima. Per lo stesso motivo il ruolo attuale sta in cima al cluster esperienze: i recruiter leggono in reverse-chronological e cercano "dove lavora ora".',
        },
        {
          title: "Accessibilità come vincolo, non rifinitura",
          body: "Ogni accent dei 4 mode ha una variante muted ricalibrata per contrasto WCAG AA (≥4.5:1) sullo sfondo ottanio. Focus visibile, skip link e prefers-reduced-motion sono regole del design system decise all'inizio, non patch aggiunte a fine progetto.",
        },
      ],
      outcomes: [
        "Copertura test >80% (Vitest) sul layer MCP/HTTP.",
        "Server MCP con tool, resource e prompt template: API dei dati CV per agenti AI, dimostrazione live.",
        "Osservabilità di prodotto con PostHog (funnel, retention, session replay, feature flag) e Vercel Analytics: il sito non è solo costruito, è misurato e iterato con dati reali.",
      ],
      learnings: [
        "L'AI accelera davvero solo dentro vincoli decisi prima: con token, regole di animazione e DO NOT espliciti il vibe coding produce; senza, produce caos da rifare.",
        'Ogni dettaglio deve sopravvivere alla domanda "perché?": se una scelta visiva non ha una risposta da colloquio, è decorazione.',
        'Le certezze vanno testate presto: le idee più "wow", il grafo come vista unica e lo scroll a step, sono le prime che ho ridimensionato davanti all\'uso reale.',
      ],
    },
    {
      name: "trip-runway — Travel Budget Yield App",
      description:
        "Ho trasformato looking-for-flights, il mio script personale di monitoraggio prezzi voli, in trip-runway: una web app che incrocia il costo del volo con il costo della vita a destinazione per calcolare i giorni massimi di viaggio sostenibili con un budget fisso. Next.js, Supabase e Prisma, con un'architettura anti-abuso che deduplica le chiamate API per rotta invece che per utente, e monetizzazione da affiliazione voli.",
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
        "Avevo già uno script personale, looking-for-flights, che cercava voli e mi scriveva su Telegram quando conveniva partire con un budget fisso. Funzionava, ma restava un tool per me. La stessa domanda, quanti giorni posso permettermi con questo budget, se la fanno molti viaggiatori, non solo io. Ho deciso di trasformare lo script in un prodotto: da tool a uso personale a web app con modello freemium e monetizzazione da affiliazione, senza riscrivere il motore di calcolo che già funzionava.",
      process: [
        "Origine — Il motore di calcolo, giorni sostenibili uguale budget residuo diviso spesa giornaliera, tagliato alla durata massima del viaggio, esisteva già in looking-for-flights. L'ho portato in trip-runway invariato: la logica di dominio era già validata su viaggi reali, il lavoro nuovo era tutto nel prodotto attorno.",
        "Modello di business — Ho scelto un modello freemium con monetizzazione da affiliazione sui voli (Travelpayouts, rete Aviasales) invece di un abbonamento fin da subito. Abbassa la barriera d'ingresso mentre valido se la domanda esiste davvero fuori dalla mia cerchia.",
        "Architettura anti-abuso — Il frontend non chiama mai le API dei voli on-demand. L'utente salva una rotta, un cronjob notturno prende le rotte uniche salvate dagli utenti, fa una sola chiamata API per rotta e aggiorna i prezzi per tutti gli interessati. Le quote gratuite delle API voli sono basse: ho progettato la deduplicazione prima di scrivere la prima feature, non dopo il primo blocco.",
        "Stack e sicurezza — Next.js con App Router, PostgreSQL su Supabase gestito con Prisma, autenticazione con Clerk. Ogni Server Action che modifica o cancella dati verifica che l'utente autenticato sia il reale proprietario del record: senza quel controllo, un utente potrebbe modificare le rotte salvate da un altro.",
      ],
      decisions: [
        {
          title: "Rotte condivise, non chiamate per utente",
          body: "Ogni chiamata all'API voli in tempo reale, moltiplicata per ogni utente, avrebbe esaurito la quota gratuita in poche ore. Ho salvato le rotte nel database e le ho deduplicate: una chiamata per rotta unica, non una per ogni utente che la guarda.",
        },
        {
          title: "Amadeus escluso, non per scelta",
          body: "Avevo valutato Amadeus per i prezzi voli, ma il portale self-service per sviluppatori è stato chiuso a metà 2026: resta solo un canale Enterprise, non percorribile in fase di bootstrap. Ho scelto Travelpayouts, gratuito e con deeplink affiliati già integrati nel modello di monetizzazione, con Duffel come piano B se in futuro servirà un prezzo live da GDS.",
        },
        {
          title: "Freemium prima dell'abbonamento",
          body: "Un abbonamento fin dal lancio avrebbe chiuso la porta a chi vuole solo provare il calcolo. L'affiliazione sui voli monetizza chi prenota, senza chiedere una carta di credito a chi sta ancora guardando.",
        },
        {
          title: "Il controllo di autorizzazione non è un dettaglio da fase 2",
          body: "Ho scritto la regola di autorizzazione, verificare che l'utente sia il proprietario del record, come vincolo architetturale fin dalla prima Server Action, non come task di sicurezza da aggiungere prima del lancio.",
        },
      ],
      outcomes: [
        "App live e deployata su Vercel (trip-runway.vercel.app), evoluzione diretta di un tool personale già funzionante.",
        "Motore di calcolo riutilizzato da looking-for-flights senza riscriverlo: la logica di dominio era già validata su viaggi reali.",
        "Architettura anti-abuso (deduplicazione API per rotta) e controllo di autorizzazione su ogni Server Action decisi prima di scrivere le prime feature.",
      ],
      learnings: [
        "Un tool personale che risolve un problema vero è la validazione di mercato più economica che esista: il bisogno c'era già, prima ancora di pensare al prodotto.",
        "I vincoli esterni cambiano l'architettura più delle preferenze tecniche: la chiusura del portale Amadeus ha deciso il provider al posto mio, non un confronto tra feature.",
        "La sicurezza sui dati va decisa come regola architetturale all'inizio: rimandarla a dopo il lancio significa riscrivere ogni Server Action già fatta.",
      ],
    },
    {
      name: "Product Discovery — UX Research & Product Strategy",
      description:
        "Con un socio tecnico ho rovesciato il processo di ideazione di un prodotto digitale con Design Thinking ed Effectuation: prima la ricerca sui bisogni reali delle persone, poi l'idea. Mappa comportamentale su Miro con la lente delle Four Forces, interviste, analisi dei competitor: da 17 concept ne è rimasto uno, ora in sviluppo, che valideremo con il pPoC Engine prima di scrivere codice.",
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
        "La maggior parte delle app fallisce perché risolve problemi che le persone non sentono, o prova a fabbricare bisogni che non esistono. Con un socio tecnico ho rovesciato il processo classico di ideazione: nessuna idea di partenza da difendere, prima lo studio dei comportamenti, delle ansie e dei desideri quotidiani che i prodotti digitali non intercettano. L'obiettivo: validare l'interesse reale per un prodotto prima di scrivere una riga di codice.",
      process: [
        "Ricerca — Ho mappato su Miro i comportamenti e i bisogni profondi delle persone attraverso la lente delle Four Forces (Jobs to Be Done): spinta della situazione, attrattiva della soluzione, ansia del cambiamento, abitudine attuale. Bisogni organizzati in macro-aree — identità e status, paura di invecchiare, bisogno di controllo, relazioni — e classificati per gravità, diffusione e area culturale, con basi di psicologia comportamentale al posto della classica segmentazione demografica.",
        "Validazione — Una mappa teorica è una camera dell'eco: ci si dà ragione da soli. Ho verificato i bisogni con 7 interviste rapide a persone nel target, chiacchierate informali di un quarto d'ora, e con l'analisi dei competitor che già provano a rispondere a quei bisogni, studiando cosa funziona e cosa no nei loro flussi.",
        "Ideazione — Dalla mappa ho generato con il socio 17 idee di prodotto, ognuna agganciata a un bisogno preciso, con una logica di effectuation: partire dai mezzi e dai bisogni già in mano, non da un obiettivo fisso da difendere a ogni costo. Ho destrutturato le più promettenti con il Value Proposition Canvas e le ho stressate con l'AI in ruolo avversariale: un venture capitalist scettico che attacca la sostenibilità economica, un analista che cerca i blocchi tecnici e legali.",
        "Prioritizzazione — Con una matrice Valore/Sforzo ho incrociato il valore per l'utente con lo sforzo di progettazione: delle 17 idee ne sono rimaste 4, e tutte le risorse sono andate su una sola, ora in sviluppo.",
        "pPoC Engine — Il test finale è il nostro pPoC Engine: un Probabilistic Proof of Concept, un prototipo Figma ad alta fedeltà che sembra un'app vera e funzionante, mostrato agli utenti per misurare comportamenti, non opinioni. Le soglie di successo sono decise prima del lancio: oltre l'8% di conversione all'onboarding, oltre il 2% di clic sul pre-ordine.",
      ],
      decisions: [
        {
          title: "Prima i bisogni, poi l'idea",
          body: "Il processo classico parte da un'idea e cerca conferme. Noi siamo partiti dai bisogni e abbiamo lasciato che le idee emergessero dalla mappa. Costa più tempo all'inizio, ma elimina il rischio peggiore: innamorarsi di un prodotto che piace solo a chi lo ha inventato.",
        },
        {
          title: "Interviste vere contro la camera dell'eco",
          body: "La desk research era più comoda, ma conferma quello che pensi già. Parlare con persone nel target ha ribaltato il quadro: molte idee che sulla lavagna sembravano forti non reggevano una chiacchierata di un quarto d'ora. Il taglio da 17 a 4 idee arriva quasi tutto da lì.",
        },
        {
          title: "L'AI come avvocato del diavolo, non come oracolo",
          body: "Non ho chiesto all'AI di generare idee: le idee erano nostre. L'ho istruita per attaccarle, nei panni di un venture capitalist scettico e di un analista tecnico e legale. Un'AI compiacente conferma qualsiasi cosa; una avversariale trova in poche ore i buchi che avremmo scoperto dopo il lancio.",
        },
        {
          title: "Un esempio finto per proteggere l'idea vera",
          body: "L'idea in sviluppo resta riservata, quindi racconto il metodo su un esempio volutamente sciocco: CheCaspitaMangio, un'app che decide cosa mangi a cena facendo girare una ruota. Il bisogno è l'ansia da decisione. Il Value Proposition Canvas regge lo stesso: l'utente deve scegliere la cena senza perdere mezz'ora, i suoi dolori sono le discussioni di coppia e la stanchezza mentale, la soluzione gli toglie il peso della scelta, la ruota decide e non si discute. Se il framework funziona su un'idea stupida, funziona.",
        },
        {
          title: "Misurare i clic, non i complimenti",
          body: "Una landing page che raccoglie email misura l'intento dichiarato, e le persone dichiarano una cosa e poi ne fanno un'altra. Il PPoC misura comportamenti che costano: completare la configurazione delle preferenze, cliccare su un abbonamento a 0,99€ al mese che non preleva nulla ma registra la volontà di pagare. Se nessuno clicca, il backend non si scrive.",
        },
      ],
      outcomes: [
        "Da 17 idee di prodotto a una sola, filtrata con interviste, analisi competitor e matrice Valore/Sforzo, ora in sviluppo.",
        "7 interviste con persone nel target prima di disegnare qualsiasi schermata.",
        "Soglie di validazione definite prima del lancio del PPoC: oltre l'8% di conversione all'onboarding, oltre il 2% di clic sul pre-ordine.",
      ],
      learnings: [
        "La UX viene prima del codice: un software tecnicamente perfetto che non risolve un bisogno reale è solo un costo scritto bene.",
        "L'AI accelera davvero solo se le assegni un ruolo scomodo: da avvocato del diavolo ha trovato in ore i punti deboli che avremmo scoperto a prodotto finito.",
        "Parlare presto con persone vere costa poco e taglia tanto: la maggior parte delle idee che piacevano a noi non aveva mercato, e l'abbiamo scoperto prima di scrivere una riga di codice, non dopo.",
      ],
    },
    {
      name: "Music Agency — Tour Management & Digital Strategy",
      description:
        "Ho organizzato booking e tour per gli artisti del roster di un'agenzia musicale italiana e ho progettato la comunicazione digitale: dalla trattativa con i promoter alla crescita organica dei canali social verso un pubblico di settore.",
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
        "Il roster dell'agenzia aveva bisogno di due cose insieme: date live organizzate bene, tra venue, promoter e contratti, e una presenza digitale che parlasse alla filiera del settore, non solo al pubblico generico. I canali social crescevano di volume ma non aprivano contatti: follower e lavoro reale dell'agenzia erano due mondi scollegati.",
      process: [
        "Ricerca — Ho intervistato le persone dell'agenzia per capire il lavoro dall'interno: come nascono le date, chi sono gli interlocutori che contano davvero, dove si inceppa il contatto con musicisti, produttori ed etichette.",
        'Insight — Il problema non era "più follower", ma follower giusti: la comunicazione doveva funzionare da canale di contatto con la filiera, non da vetrina per il pubblico generico. Ogni contenuto andava ripensato come un\'occasione di relazione professionale.',
        "Ideazione — Ho proposto una playlist curata di artisti emergenti come strumento di networking: ogni inserimento apre un contatto diretto con musicisti, produttori ed etichette, la scoperta reciproca al posto del follow passivo. Sulla stessa logica ho proposto un format radiofonico per estendere l'idea oltre le piattaforme streaming.",
        "Esecuzione — Ho definito la content strategy dei canali, ho scritto il copy per la serata di compleanno dell'agenzia e ho portato avanti il lavoro operativo di booking e tour management: ricerca venue, trattativa con i promoter, contratti, fino all'evento live all'Arci Bellezza di Milano, seguito end-to-end.",
      ],
      decisions: [
        {
          title: "Prima ascoltare, poi proporre",
          body: "Nessuna proposta è arrivata prima delle interviste con chi in agenzia ci lavora ogni giorno. Le idee poi accolte, playlist e format radio, sono nate da bisogni ascoltati, non da un playbook di marketing applicato dall'esterno: è lo stesso principio della user research, portato fuori dal software.",
        },
        {
          title: "La playlist come strumento, non come contenuto",
          body: "Una playlist di artisti emergenti non è un post da pubblicare: è un motivo di contatto. Ogni inserimento apre una conversazione concreta con un musicista, un produttore o un'etichetta, scoperta reciproca al posto del follow passivo. La proposta del format radiofonico estendeva la stessa logica oltre le piattaforme streaming.",
        },
        {
          title: "Parlare alla filiera, non al pubblico",
          body: "Crescere di volume sarebbe stato facile e inutile. Ho ripensato i contenuti per interlocutori professionali specifici, mirati alla filiera del settore: musicisti, produttori, etichette, promoter.",
        },
      ],
      outcomes: [
        "+100% follower: crescita organica, audience mirata (musicisti, etichette, promoter), non volume puro.",
        "Evento live all'Arci Bellezza di Milano, dal booking alla comunicazione.",
        "Booking e coordinamento concerti su tutto il roster, in autonomia.",
      ],
      learnings: [
        "La ricerca qualitativa funziona anche fuori dal software: intervistare l'agenzia come si intervistano gli utenti ha reso le proposte pertinenti al primo colpo.",
        "Il valore di un canale non si misura in follower ma in conversazioni aperte con le persone giuste.",
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

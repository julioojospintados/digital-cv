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

export type LanguageLevel =
  | "A1"
  | "A2"
  | "B1"
  | "B2"
  | "C1"
  | "C2"
  | "Madrelingua"
  | "Native";
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
  description?: string;
  domain?: SkillDomain;
  weight?: SkillWeight;
  mastery?: number;
  role?: SkillRole;
  links?: SkillLink[];
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
  primaryMode?: "tech" | "creative" | "human" | "management";
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
  | "LinkedIn"
  | "GitHub"
  | "Twitter"
  | "Website"
  | "Email"
  | "Behance"
  | "Dribbble"
  | string;
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
    summary:
      "Supporto piccole e grandi realtà su tre pilastri integrati: Design (UX/UI, certificazioni IBM e SkillUp), Tecnologia (Angular, Lit, MCP, Node.js) e Metodo (Agile snello, sprint brevi, autonomia del team). Ho progettato e costruito interfacce web per oltre 6 anni in contesti enterprise (Intesa San Paolo, Aruba, Rai Pubblicità). Scelgo lo strumento in base al problema e ho lavorato in 5 paesi. Non consegno slide: entro in azienda, capisco il problema reale, costruisco la soluzione e la faccio girare.",
    location: "Torino, Italia",
    age: 36,
    avatar: "",
    availability: "available" as "available" | "open" | "not-available",
    phone: "+39 373 800 5769",
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
      url: "https://github.com/julioojospintados",
      label: "julioojospintados",
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
      company:
        "Progetto Interno — Gestionale aziendale (caso studio di Partnering Operativo)",
      role: "Consulente per l'Innovazione Digitale & Lead Developer",
      startDate: "2025-09",
      endDate: "present",
      location: "Torino, Italia",
      remote: true,
      description:
        "Ho progettato e sviluppato un gestionale aziendale interno, dall'analisi dei processi al deploy: architettura MCP con tool, resource e prompt come API per agenti AI, integrata con VS Code Copilot e Cursor, UX semplificata per operatori non tecnici e pipeline Cursor → GitLab CI/CD → deploy automatizzata. Lavoro in sprint da 1 a 2 settimane e misuro l'impactScore a ogni rilascio.",
      highlights: [
        "Ho semplificato la UX per operatori non tecnici: –40% tempo di formazione sui nuovi flussi.",
        "Ho automatizzato la pipeline Cursor → GitLab CI/CD → deploy: zero interventi manuali.",
        "–80% tempo medio di sviluppo con workflow AI-augmented, progetto in corso.",
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
    },
    {
      company: "Digital CV — Progetto Open Source AI-Augmented",
      role: "AI Workflow Designer & Full-Stack Developer",
      startDate: "2024-11",
      endDate: "present",
      location: "Torino, Italia",
      remote: true,
      description:
        "Ho costruito questo CV interattivo end-to-end con GitHub Copilot e Claude come assistenti operativi: architettura, UI, animazioni GSAP, server MCP e API HTTP con Hono. Il sito usa Astro e Lit, il server MCP espone i dati come API per agenti AI. L'ho consegnato in 5 giorni, contro una stima tradizionale di oltre un mese.",
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
    },
    {
      company: "ALTEN Italia",
      role: "Frontend Developer",
      startDate: "2019-07",
      endDate: "present",
      location: "Torino, Italia",
      remote: false,
      description:
        "Sviluppo sistemi enterprise per Intesa San Paolo e Aruba: design system, librerie WebComponents e architetture a microfrontend usate da milioni di persone.",
      highlights: [
        "Ho guidato come Tech Lead e Scrum Master il team Aruba Design System, oltre 3 anni e più di 30 persone: libreria di oltre 100 componenti WebComponents adottata cross-prodotto.",
        "Ho sviluppato architettura Angular enterprise per Intesa San Paolo in un team di oltre 50 persone, con standard condivisi e code review.",
        "Ho introdotto test unitari sistematici con Jest, con impatto diretto su stabilità dei rilasci e coverage.",
      ],
      skills: [
        "Angular",
        "Lit",
        "TypeScript",
        "HTML5",
        "SCSS",
        "RXJS",
        "NGRX",
        "WebComponents",
        "GraphQL",
        "Bootstrap",
        "Material Design",
        "Jest",
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
        "Ho raddoppiato i follower con audience mirata (musicisti, etichette, promoter): crescita organica, non volume puro.",
        "Ho organizzato un evento live all'Arci Bellezza di Milano, dal booking alla comunicazione.",
        "Ho coordinato booking e concerti: ricerca venue, trattativa con i promoter, contratti.",
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
      tags: ["creative", "management"],
    },
    {
      company: "Freelance",
      role: "Aiuto Videomaker – Matrimoni di alto livello",
      startDate: "2022-01",
      endDate: "present",
      location: "Toscana, Italia",
      remote: false,
      description:
        "Affianco il videomaker principale nella produzione video per matrimoni esteri di alto livello in Toscana, un settore che richiede attenzione estrema ai dettagli.",
      highlights: [
        "Ho ripreso cerimonie con centinaia di ospiti internazionali come secondo operatore.",
        "Ho lavorato su eventi multi-giornata in contesti multiculturali.",
        "Ho adattato il mio ruolo alle esigenze del set in tempo reale, in contesti ad alta complessità logistica.",
      ],
      skills: [
        "Videomaking",
        "Post-produzione",
        "Correzione colore",
        "Sensibilità estetica",
      ],
    },
    {
      company: "ForgeLab",
      role: "Frontend Developer",
      startDate: "2021-04",
      endDate: "2022-03",
      location: "Los Angeles, USA",
      remote: true,
      description:
        "Ho sviluppato frontend full remote in un team distribuito tra Torino e Los Angeles, su un'applicazione web di dati clinici per strutture ospedaliere statunitensi: codebase React consolidata, refactoring CSS su larga scala e integrazione con API cliniche in tempo reale.",
      highlights: [
        "Ho sviluppato dashboard React per la visualizzazione e il monitoraggio di dati clinici Covid-19 in ospedali USA.",
        "Ho riscritto il CSS con pattern BEM su una codebase da 20.000 righe: –800 righe duplicate.",
        "Ho integrato API REST e GraphQL per la visualizzazione di dati clinici in tempo reale.",
      ],
      skills: [
        "React",
        "TypeScript",
        "CSS / BEM",
        "GraphQL",
        "REST API",
        "Data Visualization",
        "Agile",
      ],
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
      skills: [
        "Angular",
        "Spring",
        "JSF",
        "Java",
        "SQL",
        "Bootstrap",
        "HTML5",
        "SCSS",
      ],
    },
    {
      company: "Satispay",
      role: "Collaboratore Esterno",
      startDate: "2018-06",
      endDate: "2019-06",
      location: "Milano, Italia",
      remote: false,
      description:
        "Ho lavorato dall'esterno con Satispay durante una fase di rapida crescita, dentro processi ancora in evoluzione e con consegne a impatto immediato.",
      highlights: [],
      skills: ["Fintech", "Mentalità da startup", "Comunicazione digitale"],
    },
    {
      company: "Festival ed eventi culturali",
      role: "Presentatore & Live Host",
      startDate: "2015-01",
      endDate: "present",
      location: "Italia",
      remote: false,
      description:
        "Conduco festival culturali e serate live in tutta Italia e risolvo gli imprevisti di palco con le tecniche dell'improvvisazione teatrale.",
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
        "Lavoro come fotografo freelance dal 2009, in parallelo alle altre esperienze, con progetti in Italia, Tanzania e altri paesi.",
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
        "Ho scritto cronaca locale ed eventi culturali per il Corriere di Chieri. Lì ho imparato a trasformare informazioni grezze in storie leggibili, una capacità che uso ancora oggi nel copy e nella documentazione tecnica.",
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
        "Ho progettato visual e materiali di brand identity per clienti locali, unendo la formazione tecnica in graphic design all'occhio maturato in anni di fotografia.",
      highlights: [
        "Ho progettato materiali grafici e brand identity per clienti del settore locale e culturale.",
        "Ho applicato principi di visual hierarchy e typography ai materiali stampa e digitali.",
      ],
      skills: [
        "Graphic design",
        "Brand identity",
        "Adobe Suite",
        "Typography",
        "Visual design",
      ],
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
      startDate: "2016-09",
      endDate: "2020-02",
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
      role: "Tecnico audio-visivo e Attore",
      startDate: "2014-10",
      endDate: "2018-02",
      location: "Torino, Italia",
      remote: false,
      description:
        "Ho fatto la regia tecnica audio e luci per spettacoli teatrali. Ho recitato come attore e improvvisatore in Italia e in Lussemburgo.",
      highlights: [
        "Ho recitato in spettacoli di improvvisazione teatrale in Italia e in Lussemburgo.",
      ],
      skills: [
        "Regia tecnica",
        "Audio",
        "Luci",
        "Recitazione",
        "Improvvisazione teatrale",
      ],
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
        "Ho lavorato tra sala, biglietteria e accoglienza in uno dei circuiti cinema più frequentati d'Italia, centinaia di spettatori al giorno. Da lì viene la mia attenzione a ogni touchpoint utente in ambito UX.",
      highlights: [],
      skills: [
        "Customer service",
        "Gestione del pubblico",
        "Operazioni di sala",
      ],
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
        "Ho coordinato team di animatori e programmi di intrattenimento in strutture balneari a Ravenna e Crotone, in contesti stagionali ad alta variabilità.",
      highlights: [
        "Ho coordinato team di animatori in contesti ad alta variabilità e pressione stagionale.",
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
        "Ho lavorato al banco e in cucina, spesso in turni notturni, in un contesto ad alto ritmo e margini di errore minimi.",
      highlights: [],
      skills: [
        "Lavoro in team",
        "Gestione operativa",
        "Servizio clienti",
        "Precisione sotto pressione",
      ],
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
      name: "Introduction to Agile Development and Scrum",
      issuer: "IBM",
      date: "2026-02",
      credentialId: "L7GZFSYJYMAC",
      // Impatto pratico: framework Scrum snello applicato a sprint aziendali — garantisce ROI misurabile a ogni rilascio e riduce il time-to-market del 30–40% rispetto a progetti waterfall
    },
    {
      name: "UX/UI Design Fundamentals: Usability and Visual Principles",
      issuer: "SkillUp",
      date: "2026-02",
      credentialId: "VELSWBCO2YEL",
      // Impatto pratico: principi di usabilità applicati a interfacce per operatori non tecnici — riduzione tempi di formazione e tasso di errore operativo
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
      inProgress: true,
    },
    {
      name: "Digital Marketing Specialist",
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
          description:
            "Il sistema di tipi è la lingua comune tra sviluppatore e agente AI.",
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
        { target: "Autonomia e ownership", type: "cross-domain" },
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
        { target: "Hono", type: "technical" },
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
        { target: "Hono", type: "technical" },
        { target: "SQL", type: "workflow" },
      ],
    },
    {
      name: "Accessibility / WCAG",
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
        { target: "Hono", type: "technical" },
        {
          target: "AI-Augmented Productivity",
          type: "workflow",
          description:
            "L'MCP trasforma l'AI da chatbot a collaboratore operativo del processo.",
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
      name: "Hono",
      level: "Intermedio",
      domain: "tech",
      weight: 3,
      mastery: 65,
      role: "support",
      links: [
        { target: "Node.js", type: "technical" },
        { target: "REST API", type: "technical" },
        { target: "MCP Protocol", type: "workflow" },
        { target: "TypeScript", type: "technical" },
      ],
    },
  ] as Skill[],

  // ── Soft skills ───────────────────────────────────────────────────────────
  softSkills: [
    {
      name: "Comunicazione efficace",
      description:
        "Ho condotto eventi in pubblico per oltre 10 anni, con formazione teatrale alle spalle: trasmetto messaggi complessi in modo chiaro e calibrato su ogni tipo di audience.",
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
        "Costruisco rapporti di fiducia con colleghi, clienti e referenti, in ambienti ad alta variabilità: dal customer service internazionale al coordinamento di team cross-funzionali.",
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
      name: "Autonomia e ownership",
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
      description:
        "Ho allenato la lucidità sotto pressione nella regia tecnica teatrale, nella conduzione live di eventi e sui sistemi enterprise in produzione. Tratto l'imprevisto come un dato da cui imparare.",
      domain: "human",
      weight: 4,
      mastery: 82,
      role: "support",
      links: [
        { target: "Autonomia e ownership", type: "conceptual" },
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
      name: "Assertività",
      description:
        "Esprimo posizioni tecniche e strategiche con chiarezza e rispetto, anche in disaccordo. Uso la dialettica per far avanzare il progetto, non per vincere la discussione.",
      domain: "human",
      weight: 3,
      mastery: 80,
      role: "support",
      links: [
        { target: "Comunicazione efficace", type: "conceptual" },
        { target: "Autonomia e ownership", type: "conceptual" },
        { target: "Problem solving laterale", type: "cross-domain" },
      ],
    },
    {
      name: "Sensibilità estetica",
      description:
        "Fotografo da oltre 15 anni: quell'occhio si traduce in scelte UI più precise, con impatto diretto sulla percezione del brand e sulla qualità dell'esperienza utente.",
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
        "Faccio da ponte tra ingegneria (frontend), design (UX/UI) e marketing (SEO/SEM): meno silos comunicativi, time-to-market più rapido.",
      domain: "management",
      weight: 5,
      mastery: 90,
      role: "bridge",
      links: [
        { target: "Problem solving laterale", type: "conceptual" },
        { target: "Autonomia e ownership", type: "conceptual" },
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
        "Mi sono formato e ho recitato con B-Teatro (2013–2020), con spettacoli in Italia e Lussemburgo. L'improvvisazione allena l'ascolto attivo, il pensiero rapido e la capacità di trasformare il fallimento in risorsa.",
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
        { target: "Autonomia e ownership", type: "cross-domain" },
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
        "Ho vinto premi di poesia in Italia e in Australia. La scrittura creativa si traduce in copy più preciso, storytelling di prodotto e sintesi.",
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
        "Ogni progetto è un'opportunità di apprendimento incrementale. I cicli brevi di consegna riducono il rischio, mantengono il focus sugli obiettivi di business e permettono di adattarsi rapidamente ai feedback. Ho applicato questo mindset sia su sistemi enterprise con team distribuiti, sia su progetti creativi in autonomia.",
    },
    {
      name: "AI come moltiplicatore di valore",
      description:
        "Integro l'intelligenza artificiale come estensione del processo cognitivo, non come scorciatoia. GitHub Copilot per la velocità di sviluppo, ChatGPT per il rapid prototyping concettuale, Midjourney per l'esplorazione visiva. L'obiettivo è ridurre il tempo sui task ripetitivi e ampliare lo spazio esplorabile nelle fasi creative.",
    },
    {
      name: "T-shaped Problem Solving",
      description:
        "Il mio background attraversa ingegneria, design e marketing: individuo pattern di soluzione invisibili ai team mono-disciplinari. Non solo eseguo, identifico il problema corretto da risolvere.",
    },
    {
      name: "Framework-Agnostic Thinking",
      description:
        "Ho lavorato con Angular, React, Lit, WebComponents, Astro e paradigmi creativi eterogenei: scelgo lo strumento in base al problema, non il contrario. Questo evita il soluzionismo tecnico e produce architetture manutenibili nel lungo periodo.",
    },
  ] as MethodologyItem[],

  // ── Growth areas (presented as evolution paths) ────────────────────────────
  growthAreas: [
    {
      name: "Curiosità poliedrica",
      reframe:
        "Esploro campi diversi per natura e questo richiede una gestione consapevole del focus. Non è dispersione: ogni competenza acquisita diventa un nuovo angolo da cui leggere i problemi tecnici e creativi, e genera soluzioni che chi conosce un solo dominio non vede.",
    },
    {
      name: "Pensiero parallelo",
      reframe:
        "Tengo attivi in parallelo più scenari e connessioni non lineari, una cosa che dall'esterno può sembrare mancanza di linearità. In fase di design di sistema o di debug complesso è ciò che mi porta a identificare il problema corretto da risolvere, non solo il sintomo più visibile.",
    },
    {
      name: "Comunicazione emotiva",
      reframe:
        "Presto attenzione alle dinamiche relazionali e agli stati emotivi delle persone, una cosa che può sembrare lontana dal mondo tecnico. In pratica accelera la delivery nei team distribuiti e con referenti non tecnici: riduce l'attrito nei code review, fa emergere i requisiti reali, quelli non dichiarati, e costruisce fiducia più velocemente di qualsiasi presentazione.",
    },
  ] as GrowthArea[],

  // ── Personal projects ─────────────────────────────────────────────────────
  projects: [
    {
      name: "Digital CV — Progetto Open Source AI-Augmented",
      description:
        "Ho costruito questo CV interattivo open source con un workflow AI-augmented (GitHub Copilot e Claude). Sistema a due livelli: sito Astro e Lit con animazioni GSAP e wave effect SVG, più un server MCP che espone i dati del CV come API per agenti AI. È la dimostrazione live del metodo: da solo ho prodotto in giorni ciò che un team produrrebbe in mesi.",
      url: "https://github.com/julioojospintados/digital-cv",
      repoUrl: "https://github.com/julioojospintados/digital-cv",
      date: "2024-11",
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
        "Architettura dell'informazione — Un solo profilo, quattro prospettive: le route /tech /creative /human /management cambiano enfasi e accento cromatico, mai struttura o contenuto. Chi legge sceglie il proprio punto di vista; le altre anime restano visibili come sussurri a bassa opacità, mai nascoste.",
        "Design system — Sfondo ottanio fisso con 4 accent per mode, tipografia Lexend + JetBrains Mono, sistema square/glow per i livelli skill al posto delle barre percentuali, animazioni solo su transform/opacity con reduced-motion rispettato. Ho deciso i vincoli prima di scrivere i componenti.",
        "Build AI-augmented — Vibe coding con GitHub Copilot e Claude come pair operativi: architettura, UI, animazioni GSAP, e un server MCP con tool, resource e prompt template che espone il CV come API per agenti AI. Il sito è la controprova del workflow che dichiara.",
      ],
      decisions: [
        {
          title: "Card di default, grafo come premio",
          body: "La vista skills più spettacolare è un force graph D3, ma i grafi si guardano, non si scansionano. Il default è diventato la vista card, leggibile in 5 secondi (Legge di Jakob); il grafo resta come esplorazione opt-in, e D3 (~130KB) si carica solo per chi lo apre davvero. Il \"wow\" non deve mai costare la leggibilità a chi ha 30 secondi.",
        },
        {
          title: "Sussurri, non silenzi",
          body: "Quando scegli un mode, le card fuori tema non spariscono: scendono a bassa opacità. Nasconderle avrebbe contraddetto la tesi del sito. Il knolling è trasparenza radicale, e chi valuta un profilo T-shaped deve poter vedere l'ampiezza anche mentre esamina la profondità.",
        },
        {
          title: "Convenzioni dove l'utente ha fretta",
          body: "Le esperienze extra si rivelano con \"Leggi altre 3\", il pattern di LinkedIn e Medium, al posto di un CTA brandizzato che avevo provato prima: dove chi legge ha fretta, la convenzione batte l'originalità. Per lo stesso motivo il ruolo attuale sta in cima al cluster esperienze: i recruiter leggono in reverse-chronological e cercano \"dove lavora ora\".",
        },
        {
          title: "Accessibilità come vincolo, non rifinitura",
          body: "Ogni accent dei 4 mode ha una variante muted ricalibrata per contrasto WCAG AA (≥4.5:1) sullo sfondo ottanio. Focus visibile, skip link e prefers-reduced-motion sono regole del design system decise all'inizio, non patch aggiunte a fine progetto.",
        },
        {
          title: "Iterazione: lo scroll sbagliato",
          body: "La prima versione della home usava scroll-snap nativo \"a step\": al test reale risultava rigido e incoerente con lo scroll fluido delle pagine CV. L'ho scartato e sostituito con smooth scroll unico su tutto il sito e reveal per sezione: la coerenza del gesto vale più dell'effetto singolo.",
        },
      ],
      outcomes: [
        "Consegnato in 5 giorni, contro una stima tradizionale di oltre un mese.",
        "Copertura test >80% (Vitest) sul layer MCP/HTTP.",
        "Server MCP con tool, resource e prompt template: API dei dati CV per agenti AI, dimostrazione live.",
      ],
      learnings: [
        "L'AI accelera davvero solo dentro vincoli decisi prima: con token, regole di animazione e DO NOT espliciti il vibe coding produce; senza, produce caos da rifare.",
        "Ogni dettaglio deve sopravvivere alla domanda \"perché?\": se una scelta visiva non ha una risposta da colloquio, è decorazione.",
        "Le certezze vanno testate presto: le idee più \"wow\", il grafo come vista di default e lo scroll a step, sono le prime che ho ridimensionato davanti all'uso reale.",
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
        "Insight — Il problema non era \"più follower\", ma follower giusti: la comunicazione doveva funzionare da canale di contatto con la filiera, non da vetrina per il pubblico generico. Ogni contenuto andava ripensato come un'occasione di relazione professionale.",
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
          body: "Crescere di volume sarebbe stato facile e inutile. Ho ripensato i contenuti per interlocutori professionali specifici: è la differenza tra una vetrina e un canale che apre porte, ed è il motivo per cui il +100% di follower è fatto di contatti che contano, non di numeri.",
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
        'Ho recitato come deuteragonista nel film "Double", presentato all\'Independent Film Festival di San Francisco nel 2022.',
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
      name: "Invenzione di una parola — Salone Internazionale del Libro (Torino)",
      description:
        "Ho creato e presentato pubblicamente una parola nuova, con radici, suono e significato, al Salone Internazionale del Libro di Torino. Un esercizio estremo di sintesi linguistica e poetica: la stessa capacità di dire il massimo con il minimo che applico ogni giorno nel codice pulito e nella comunicazione di prodotto.",
      date: "2019-05",
      tags: ["Poesia", "Linguistica", "Creatività", "Salone del Libro"],
    },
    {
      name: "Poesia premiata a livello internazionale",
      description:
        "Ho scritto poesie premiate in concorsi nazionali e internazionali (Italia e Australia). La scrittura creativa e lo sviluppo software condividono la stessa radice: sintesi, precisione formale e significato dentro vincoli espliciti.",
      tags: ["Poesia", "Scrittura creativa", "Premi internazionali"],
    },
    {
      name: "La 'Tesina sui Baffi' — articolo su La Stampa",
      description:
        "La mia tesina scolastica sui baffi, caso involontario di marketing e curiosità antropologica, è finita sulle pagine de 'La Stampa'. La prova pratica che l'originalità del pensiero genera attenzione imprevista, e che la narrativa conta più del formato.",
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
      name: "Prevenzione in situazione di crisi",
      description:
        "Sono intervenuto in una situazione di rischio suicidio: ho riconosciuto i segnali, ho ascoltato e ho accompagnato la persona verso un supporto professionale. Una delle esperienze più formative in termini di presenza piena. 'Yes, and...' nella sua forma più radicale: accettare la realtà dell'altro e aggiungere presenza.",
      tags: [
        "Empatia",
        "Ascolto attivo",
        "Gestione della crisi",
        "Human skills",
      ],
    },
    {
      name: "Assistenza legale a immigrato in difficoltà",
      description:
        "Ho aiutato un ragazzo bangladese in difficoltà con il sistema legale italiano: orientamento nel labirinto burocratico, traduzione del contesto normativo e raccordo con le risorse disponibili. Il 'Yes, and...' applicato alla vita reale: accettare la situazione senza tirarsi fuori e aggiungere valore dove gli altri passano oltre.",
      tags: [
        "Solidarietà",
        "Interculturalità",
        "Assistenza",
        "Civic engagement",
      ],
    },
    {
      name: "Intervento in difesa di terzi in spazio pubblico",
      description:
        "Sono intervenuto in una situazione di pericolo in strada per la tutela di terzi. L'improvvisazione teatrale insegna a stare nel momento senza paralizzarsi: fuori dal palco si traduce in lucidità e azione quando gli altri esitano.",
      tags: ["Coraggio civile", "Lucidità sotto pressione", "Pensiero rapido"],
    },
    {
      name: "Battitore d'asta per gala di beneficenza europeo (Burger King)",
      description:
        "Ho condotto in inglese un'asta di beneficenza durante un evento europeo Burger King con partecipanti internazionali. Pubblico, ritmo dell'asta e comunicazione in lingua straniera sotto pressione: improvvisazione teatrale e inglese fusi in un'unica performance live.",
      tags: [
        "Inglese professionale",
        "Public speaking",
        "Event hosting",
        "Corporate events",
      ],
    },
  ],

  // ── AI Workflow ───────────────────────────────────────────────────────────
  aiWorkflow: [
    {
      tool: "GitHub Copilot",
      title: "Accelerazione sviluppo Angular enterprise",
      desc: "Genero codice ripetitivo NGRX, test Jest e pattern architetturali, con validazione critica dell'output.",
      impact: "-87% codice ripetitivo",
      tags: "tech",
    },
    {
      tool: "ChatGPT / Claude",
      title: "Prompt Engineering per prototipazione UX",
      desc: "Ricavo user personas, flussi di navigazione e scenari di test da brief testuali. L'ho applicato nella fase UX Research IBM.",
      impact: "-90% discovery time",
      tags: "creative tech",
    },
    {
      tool: "Claude / GPT-4",
      title: "Revisione del codice e architettura Angular",
      desc: "Analizzo problemi di qualità del codice, refactoring e architetture a microfrontend con un LLM come revisore tecnico.",
      impact: "-60% tempo di debug",
      tags: "tech",
    },
    {
      tool: "Midjourney",
      title: "Esplorazione visiva per brief UX/UI",
      desc: "Genero moodboard e concept visivi per allineare i referenti prima del wireframing, senza iterazioni costose.",
      impact: "-70% cicli allineamento",
      tags: "creative",
    },
    {
      tool: "AI Tools",
      title: "Copywriting e documentazione tecnica",
      desc: "Produco SEO copy, varianti A/B per landing page e documentazione tecnica da codice annotato.",
      impact: "+3x velocità contenuti",
      tags: "creative",
    },
    {
      tool: "Figma Make",
      title: "Da brief a prototipo interattivo in minuti",
      desc: "Genero schermate e flussi di navigazione direttamente in Figma da una descrizione in linguaggio naturale. L'ho applicato nella prototipazione rapida prima del wireframing strutturato.",
      impact: "-75% tempo prototipazione",
      tags: "creative tech",
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
      name: "Team Delivery & Leadership Agile",
      description:
        "Come porto un team da 'caos operativo' ad 'autonomia consapevole': improvvisazione come metodo, Agile come struttura, comunicazione come collante.",
      steps: [
        "Teatro e improvvisazione",
        "Agile Methodology",
        "Comunicazione efficace",
        "Pensiero T-shaped",
        "Autonomia e ownership",
        "Git",
      ],
    },
    {
      name: "Comunicazione Strategica di Prodotto",
      description:
        "Dal copy alla campagna: il flusso narrativo che porta un prodotto tecnico a diventare una storia che il cliente vuole ascoltare.",
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
        "Il metodo GO Automated: ogni processo ripetibile diventa un agente. Dall'architettura AI al deploy zero-touch in sprint di 1–2 settimane.",
      steps: [
        "Prompt Engineering",
        "MCP Protocol",
        "Node.js",
        "Hono",
        "REST API",
        "AI-Augmented Productivity",
        "Agile Methodology",
      ],
    },
  ] as ValueFlow[],

  // ── Feedbacks — dati parcheggiati per futura sezione UI ────────────────────
  // Non renderizzati. Keyword descrittive da persone che hanno lavorato con Giulio.
  feedbacks: [
    {
      name: "Lorenzo Rando",
      role: "Recruiter / Head Hunter",
      keywords: [
        "dialettica",
        "umorismo",
        "attenzione",
        "ascolto attivo",
        "empatia",
        "creatività",
        "rispetto",
        "lealtà",
        "affidabilità",
        "sincerità",
        "curiosità",
        "assertività",
      ],
    },
  ] as Feedback[],
} as const satisfies Record<string, unknown>;

export type CvData = typeof cvData;

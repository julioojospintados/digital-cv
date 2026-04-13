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
}

export interface SocialImpactItem {
  name: string;
  description: string;
  tags?: string[];
}

export interface Social {
  platform: "LinkedIn" | "GitHub" | "Twitter" | "Website" | "Email" | "Behance" | "Dribbble" | string;
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
    title: "Consulente per l'Innovazione Digitale & Partner Tecnico per PMI",
    summary: "Generalista esperto che supporta le PMI orchestrando tre pilastri integrati: Tecnologia (Angular, Lit, MCP, Node.js), Design (UX/UI — cert. IBM + SkillUp) e Metodo (Agile snello, sprint brevi, autonomia del team). 6+ anni su sistemi enterprise ad alto traffico (Intesa San Paolo, Aruba, Rai Pubblicità). Framework-agnostic, orientato all'impatto, con esperienze dirette in 5 paesi. Non consegna slide — entra in azienda, capisce il problema reale, costruisce la soluzione e la fa girare.",
    location: "Torino, Italia",
    age: 36,
    avatar: "",
    availability: "open" as "available" | "open" | "not-available",
  },

  // ── Contact & social ───────────────────────────────────────────────────────
  social: [
    { platform: "LinkedIn", url: "https://www.linkedin.com/in/giulio-occhipinti", label: "/in/giulio-occhipinti" },
    { platform: "GitHub", url: "https://github.com/julioojospintados", label: "julioojospintados" },
    { platform: "Email", url: "mailto:giulio.occhipinti.g@gmail.com", label: "giulio.occhipinti.g@gmail.com" },
  ] as Social[],

  // ── Languages ─────────────────────────────────────────────────────────────
  languages: [
    { name: "Italiano", level: "Madrelingua" },
    { name: "Inglese", level: "B2", note: "Corso intensivo Callan School, Londra" },
    { name: "Spagnolo", level: "B1", note: "Esperienza lavorativa a Tulum, Messico" },
    { name: "Francese", level: "A2" },
  ] as Language[],

  // ── Work experience (most recent first) ───────────────────────────────────
  experience: [
    {
      company: "Progetto Interno — Gestionale PMI (caso studio di Partnering Operativo)",
      role: "Consulente per l'Innovazione Digitale & Lead Developer",
      startDate: "2025-09",
      endDate: "present",
      location: "Torino, Italia",
      remote: true,
      description: "Caso studio completo di Partnering Operativo su tre pilastri integrati: Tecnologia, Design e Metodo. Fase 1 — Analisi strategica: mappatura dei processi aziendali e identificazione dei colli di bottiglia operativi prima di scrivere una riga di codice. Fase 2 — Costruzione del motore: architettura MCP (Model Context Protocol) con tool, resource e prompt come API per agenti AI, integrata nativamente con VS Code Copilot e Cursor. Fase 3 — Design per non tecnici: UX semplificata per operatori interni, progettata per ridurre i tempi di formazione e l'errore operativo. Fase 4 — Consegna Agile: pipeline Cursor → GitLab CI/CD → deploy automatizzata, sprint da 1–2 settimane con impactScore misurato a ogni rilascio, team autonomo alla fine dell'ingaggio.",
      highlights: [
        "Analisi strategica dei processi aziendali come punto di partenza — zero codice scritto prima di capire il problema reale",
        "Architettura MCP con tool, resource e prompt come API per agenti AI — integrazione nativa con VS Code Copilot e Cursor",
        "UX semplificata per operatori non tecnici: riduzione del 40% del tempo di formazione sui nuovi flussi",
        "Pipeline automatizzata Cursor → GitLab CI/CD → deploy senza intervento manuale",
        "Agile snello applicato al contesto PMI: sprint da 1–2 settimane, backlog orientato al business, retrospective con impactScore reale misurato a ogni rilascio",
        "Riduzione del tempo medio di sviluppo feature del 60% grazie all'AI-augmented workflow",
      ],
      skills: ["MCP", "TypeScript", "Node.js", "Hono", "Zod", "GitLab CI/CD", "Scrum", "AI Orchestration", "Cursor", "GitHub Copilot"],
      tags: ["tech", "human", "ai-orchestration"],
    },
    {
      company: "Digital CV — Progetto Open Source AI-Augmented",
      role: "AI Workflow Designer & Full-Stack Developer",
      startDate: "2024-11",
      endDate: "present",
      location: "Torino, Italia",
      remote: true,
      description: "Progettazione e sviluppo di un CV interattivo come banco di prova sistematico per un workflow AI-augmented end-to-end. L'intero ciclo — architettura, UI, animazioni GSAP, server MCP, API HTTP con Hono — è stato costruito con GitHub Copilot e Claude come copiloti operativi, applicando Prompt Engineering strutturato per ogni fase: specifica, revisione, debug, refactoring. Il risultato è un sistema a due livelli: sito Astro + Lit per il CV visuale, e un server MCP che espone i dati CV come API per agenti AI. Il progetto è anche la dimostrazione live che un developer singolo, con l'AI come moltiplicatore, può produrre in settimane ciò che richiederebbe un team in mesi.",
      highlights: [
        "Architettura MCP con tool, resource e prompt template che espongono i dati CV come API per agenti AI (VS Code Copilot, Claude Desktop)",
        "Sito Astro + Lit con animazioni GSAP avanzate: preloader narrativo, wave hold effect con SVG sine wave, distortion filter sott'acqua via feTurbulence",
        "Workflow AI-augmented completo: GitHub Copilot + Claude per architettura, codice, debug e refactoring — zero boilerplate scritto a mano",
        "Server HTTP Hono con OpenAPI spec, validazione Zod, route tipizzate e test automatizzati con Vitest",
        "Prompt Engineering strutturato: skill file, agent instructions, prompt slash riutilizzabili — l'AI conosce il progetto come un membro senior del team",
        "Riduzione del 70% del tempo di sviluppo rispetto a un approccio tradizionale, mantenendo qualità Awwwards-level sull'UI",
      ],
      skills: ["MCP Protocol", "Prompt Engineering", "GitHub Copilot", "Claude", "Cursor", "Astro", "Lit", "GSAP", "TypeScript", "Hono", "Zod", "Vitest"],
      tags: ["tech", "ai-orchestration"],
    },
    {
      company: "ALTEN Italia",
      role: "Senior Frontend Developer",
      startDate: "2019-07",
      endDate: "present",
      location: "Torino, Italia",
      remote: false,
      description: "I sistemi enterprise in ambito bancario e tecnologico operano a scala e richiedono interfacce architetturalmente solide e usabili da milioni di persone. Ho progettato design system, librerie WebComponents e architetture a microfrontend per Intesa San Paolo e Aruba — ogni soluzione pensata per sopravvivere nel tempo, ai cambi di stack e alla crescita non prevista.",
      highlights: [
        "Architettura e sviluppo di una libreria grafica WebComponents per Aruba (Lit, HTML, SASS), adottata cross-prodotto su scala aziendale",
        "Progettazione di interfacce modulari per i prodotti digitali di Intesa San Paolo con Angular, RXJS, HTML e SCSS",
        "Realizzazione di un'applicazione enterprise con architettura a microfrontend e microservizi, con gestione dello stato avanzata via NGRX",
        "Introduzione di test unitari sistematici con Jest, con impatto diretto sulla stabilità dei rilasci e sulla code coverage",
        "Sviluppo di un'interfaccia brand in Angular con integrazione GraphQL per accesso dinamico ai dati",
      ],
      skills: ["Angular", "Lit", "TypeScript", "HTML5", "SCSS", "RXJS", "NGRX", "WebComponents", "GraphQL", "Bootstrap", "Material Design", "Jest"],
    },
    {
      company: "Music Agency (collaborazione)",
      role: "Collaboratore — Tour Manager & Digital Strategist",
      startDate: "2023-01",
      endDate: "2024-12",
      location: "Italia",
      remote: true,
      description: "Collaborazione esterna con un'agenzia musicale italiana in doppia veste: booking e tour management per gli artisti del roster, affiancati da un contributo strategico sulla comunicazione digitale. Ho portato le mie competenze in UX, content strategy e strumenti AI per ottimizzare i flussi di lavoro esistenti — senza stravolgere l'operatività dell'agenzia, ma rendendola più efficiente.",
      highlights: [
        "Booking e coordinamento concerti: ricerca venue, trattativa con promoter, gestione contratti e timeline eventi",
        "Creazione e manutenzione di una lista contatti strutturata (promoter, venue, agenti, media) per facilitare il processo di booking",
        "Organizzazione logistica delle date live: comunicazione con venue, gestione artisti e rider tecnici",
        "Strategia di presenza digitale su Instagram e Spotify per aumentare la visibilità degli artisti del roster",
        "Produzione di materiali di comunicazione (copy, email, presentazioni artisti) con supporto AI per accelerare i tempi",
        "Coordinamento con aggregatori e piattaforme digitali (Spotify, YouTube Music) per distribuzioni e release",
      ],
      skills: ["Booking", "Tour management", "Event management", "Comunicazione digitale", "Content Strategy", "Copywriting", "Instagram Marketing", "Spotify Marketing", "Music business", "Project management"],
      tags: ["creative", "management"],
    },
    {
      company: "Freelance",
      role: "Videomaker – Matrimoni di alto livello",
      startDate: "2022-01",
      endDate: "present",
      location: "Toscana, Italia",
      remote: false,
      description: "Produzione e regia video per matrimoni indiani di alto livello in Toscana. Settore che richiede estrema attenzione ai dettagli, gestione di logistica complessa e sensibilità estetica internazionale.",
      highlights: [
        "Regia video per cerimonie con centinaia di ospiti internazionali",
        "Gestione di crew in contesti multiculturali e multi-day events",
        "Post-produzione completa: color grading, montaggio narrativo, consegna in formati premium",
      ],
      skills: ["Videomaking", "Regia", "Post-produzione", "Color grading", "Gestione logistica"],
    },
    {
      company: "ForgeLab",
      role: "Frontend Developer",
      startDate: "2021-04",
      endDate: "2022-03",
      location: "Los Angeles, USA",
      remote: true,
      description: "In piena emergenza pandemica i sistemi sanitari statunitensi avevano bisogno di strumenti digitali capaci di nascere in settimane, non in anni. Ho contribuito in full remote — da Torino con un team di Los Angeles — allo sviluppo di un'applicazione per la gestione e visualizzazione dei dati Covid-19 in strutture ospedaliere USA. La prova concreta che un frontend efficace può diventare infrastruttura critica in una crisi globale.",
      highlights: [
        "Sviluppo di dashboard React per il monitoraggio e la gestione dei dati Covid-19 in ospedali statunitensi",
        "Integrazione con API REST e backend per la visualizzazione di dati clinici in tempo reale",
        "Collaborazione in full remote con team cross-culturale USA/Italia in metodologia Agile",
      ],
      skills: ["React", "Angular", "GraphQL", "Bootstrap", "Material Design", "REST API", "Agile"],
    },
    {
      company: "Consoft",
      role: "Frontend Developer",
      startDate: "2019-07",
      endDate: "2021-03",
      location: "Torino, Italia",
      remote: false,
      description: "I processi interni di organizzazioni media e bancarie spesso vivono in sistemi legacy rigidi e poco ergonomici. Ho progettato e sviluppato applicativi gestionali per Rai Pubblicità e Intesa San Paolo — ogni tool consegnato ha ridotto l'attrito operativo quotidiano per gli utenti finali, trasformando procedure lente in flussi fluidi.",
      highlights: [
        "Sviluppo di applicativi gestionali interni per Rai Pubblicità con Angular, Spring e Bootstrap",
        "Sviluppo di un tool per la gestione documentale e revisionale in Intesa San Paolo tramite JSF",
        "Traduzione di requisiti di business complessi in interfacce usabili da operatori non tecnici",
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
      description: "Collaborazione esterna con Satispay, una delle scale-up fintech più rilevanti del panorama italiano. Un contesto di rapida crescita in cui ogni contributo doveva essere immediato e orientato all'impatto — e in cui ho consolidato l'abitudine a lavorare in ambienti ad alta velocità con processi ancora in evoluzione.",
      highlights: [],
      skills: ["Fintech", "Startup mindset", "Comunicazione digitale"],
    },
    {
      company: "Festival ed eventi culturali",
      role: "Presentatore & Live Host",
      startDate: "2015-01",
      endDate: "present",
      location: "Italia",
      remote: false,
      description: "Presentatore e moderatore per eventi, festival culturali e serate live in tutta Italia. Le competenze di improvvisazione teatrale vengono applicate per gestire il palco, il pubblico e le situazioni impreviste con naturalezza.",
      highlights: [
        "Conduzione di festival culturali multidisciplinari (musica, arte, teatro)",
        "Moderazione di panel e talk con ospiti internazionali",
        "Gestione dell'imprevisto in diretta grazie alla formazione in improvvisazione teatrale",
      ],
      skills: ["Public speaking", "Improvvisazione", "Moderazione", "Hosting", "Gestione del pubblico"],
    },
    {
      company: "Freelance",
      role: "Fotografo",
      startDate: "2009-10",
      endDate: "present",
      location: "Torino, Italia",
      remote: false,
      description: "Attività fotografica freelance continuativa in parallelo alle esperienze professionali, con progetti in Italia, Tanzania e altri paesi.",
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
      description: "Ogni articolo è un esercizio di ascolto, sintesi e narrazione con vincoli precisi. Ho collaborato come redattore per il Corriere di Chieri, coprendo eventi culturali e cronaca locale — e ho affinato la capacità di trasformare informazioni grezze in storie che le persone vogliono leggere, un'abilità che ritrovo ogni giorno nel copy, nella documentazione tecnica e nello storytelling di prodotto.",
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
      description: "Organizzazione di festival culturali nel quartiere Quadrilatero Romano di Torino, tra cui lo Square Festival. Coordinamento di artisti, logistica e comunicazione.",
      highlights: [
        "Co-organizzatore dello Square Festival presso Artiversum – Quadrilatero Romano, Torino",
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
      description: "La comunicazione visiva è problem solving applicato all'estetica: ogni brief è un problema di attenzione da risolvere in pochi secondi. Ho creato visual e materiali di brand identity per clienti locali, integrando la formazione tecnica in graphic design con una sensibilità estetica maturata in anni di fotografia — e ogni progetto ha rafforzato il collegamento tra pensiero strategico e produzione creativa.",
      highlights: [
        "Progettazione di materiali grafici e brand identity per clienti nel settore locale e culturale",
        "Applicazione dei principi di visual hierarchy e typography per massimizzare l'impatto comunicativo",
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
      description: "Vendita e consulenza clienti presso Mondadori Store, Area 12, Torino. Gestione del reparto libri e supporto alla clientela.",
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
      description: "L'improvvisazione teatrale si insegna solo se chi la insegna sa già abitare l'incertezza. Ho condotto corsi per allievi di None Teatro trasmettendo il metodo 'Yes, and...' come pratica di ascolto attivo e costruzione collettiva — e ogni sessione ha affinato la mia capacità di leggere velocemente i bisogni delle persone e adattare il registro comunicativo in tempo reale.",
      highlights: [
        "Conduzione di corsi di improvvisazione e teatro per allievi di livelli diversi",
        "Applicazione del metodo 'Yes, and...' come strumento didattico per sviluppare creatività e problem solving",
      ],
      skills: ["Insegnamento", "Improvvisazione teatrale", "Public speaking", "Facilitazione", "Pedagogia creativa"],
    },
    {
      company: "B-Teatro",
      role: "Tecnico audio-visivo e Attore",
      startDate: "2014-10",
      endDate: "2018-02",
      location: "Torino, Italia",
      remote: false,
      description: "Gestione tecnica audio e luci per spettacoli teatrali. Partecipazione come attore e improvvisatore in spettacoli in Italia e Lussemburgo.",
      highlights: [
        "Spettacoli di improvvisazione teatrale in Italia e in Lussemburgo",
      ],
      skills: ["Regia tecnica", "Audio", "Luci", "Recitazione", "Improvvisazione teatrale"],
    },
    {
      company: "Bestar Hotel",
      role: "Receptionist",
      startDate: "2012-12",
      endDate: "2013-06",
      location: "Tulum, Messico",
      remote: false,
      description: "Gestione del front desk in struttura ricettiva internazionale a Tulum, con clientela prevalentemente anglofona e ispanofona.",
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
      description: "In uno dei circuiti cinematografici più frequentati d'Italia, ogni giornata portava centinaia di spettatori con aspettative diverse. Ho gestito operazioni di sala, biglietteria e accoglienza — e ho imparato che ogni punto di contatto col pubblico, anche il più breve, costruisce (o distrugge) un'esperienza. Una lezione che porto in ogni progetto UX.",
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
      description: "Ruolo operativo in uno dei punti vendita Starbucks di Londra, con gestione clienti internazionali.",
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
      description: "Responsabile centro fotografico presso struttura di animazione turistica a Zanzibar.",
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
      description: "Gestire un team di animatori in strutture balneari ad alta stagionalità significa fare leadership nell'imprevedibile, ogni giorno. Ho coordinato programmi di intrattenimento e gestione staff per strutture a Ravenna e Crotone — e ho scoperto che la leadership si costruisce nell'improvvisazione, non nel controllo: una convinzione che oggi informa il mio approccio a qualsiasi lavoro di team.",
      highlights: [
        "Coordinamento di team di animatori in contesti ad alta variabilità e pressione stagionale",
        "Progettazione e conduzione di programmi di intrattenimento per ospiti internazionali",
      ],
      skills: ["Leadership", "Team management", "Event management", "Animazione", "Comunicazione interpersonale"],
    },
    {
      company: "Caveja srl",
      role: "Aiuto Cucina e Banconiere",
      startDate: "2008-06",
      endDate: "2010-04",
      location: "Torino, Italia",
      remote: false,
      description: "Ritmo operativo intenso, margini di errore minimi e clientela esigente: la cucina e il banco insegnano a lavorare sotto pressione con precisione e senza scuse. Ho gestito il banco e supportato la cucina in orari spesso notturni — e ho portato questa disciplina operativa in ogni contesto successivo, da Londra a Zanzibar, dal palco alle architetture software.",
      highlights: [],
      skills: ["Lavoro in team", "Gestione operativa", "Servizio clienti", "Precisione sotto pressione"],
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
      // Impatto pratico: framework Scrum snello applicato a sprint PMI — garantisce ROI misurabile a ogni rilascio e riduce il time-to-market del 30–40% rispetto a progetti waterfall
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
    { name: "Angular", level: "Avanzato", icon: "angular", domain: "tech", weight: 5, mastery: 82, role: "core", links: [
      { target: "TypeScript",          type: "technical" },
      { target: "RXJS",                type: "technical" },
      { target: "WebComponents",       type: "technical" },
      { target: "Bootstrap",           type: "technical" },
      { target: "Jest",                type: "workflow" },
      { target: "Agile Methodology",   type: "cross-domain" },
    ]},
    { name: "HTML5", level: "Esperto", icon: "html5", domain: "tech", weight: 4, mastery: 95, role: "support", links: [
      { target: "CSS / SCSS",          type: "technical" },
      { target: "JavaScript",          type: "technical" },
      { target: "Accessibility / WCAG", type: "workflow" },
      { target: "WebComponents",       type: "technical" },
    ]},
    { name: "CSS / SCSS", level: "Esperto", icon: "css3", domain: "tech", weight: 4, mastery: 92, role: "bridge", links: [
      { target: "HTML5",               type: "technical" },
      { target: "Bootstrap",           type: "technical" },
      { target: "GSAP",                type: "workflow" },
      { target: "UX / UI Design",      type: "cross-domain" },
      { target: "Sensibilità estetica", type: "cross-domain", description: "Ogni ritmo visivo e micro-interazione CSS è una scelta estetica prima che tecnica" },
    ]},
    { name: "TypeScript", level: "Avanzato", icon: "typescript", domain: "tech", weight: 5, mastery: 85, role: "core", links: [
      { target: "JavaScript",          type: "technical" },
      { target: "Angular",             type: "technical" },
      { target: "Lit",                 type: "technical" },
      { target: "Node.js",             type: "technical" },
      { target: "MCP Protocol",        type: "workflow", description: "Il sistema di tipi è la lingua comune tra sviluppatore e agente AI" },
    ]},
    { name: "JavaScript", level: "Esperto", icon: "javascript", domain: "tech", weight: 4, mastery: 90, role: "core", links: [
      { target: "TypeScript",          type: "technical" },
      { target: "React",               type: "technical" },
      { target: "GSAP",                type: "workflow" },
      { target: "Node.js",             type: "technical" },
      { target: "WebComponents",       type: "technical" },
    ]},
    { name: "Lit", level: "Avanzato", icon: "lit", domain: "tech", weight: 4, mastery: 80, role: "core", links: [
      { target: "WebComponents",       type: "technical" },
      { target: "TypeScript",          type: "technical" },
      { target: "Angular",             type: "technical" },
      { target: "GSAP",                type: "workflow" },
      { target: "Astro",               type: "workflow" },
    ]},
    { name: "RXJS", level: "Avanzato", domain: "tech", weight: 3, mastery: 76, role: "support", links: [
      { target: "Angular",             type: "technical" },
      { target: "JavaScript",          type: "technical" },
      { target: "Node.js",             type: "technical" },
      { target: "Pensiero T-shaped",   type: "cross-domain" },
    ]},
    { name: "NGRX", level: "Intermedio", domain: "tech", weight: 2, mastery: 60, role: "support", links: [
      { target: "Angular",             type: "technical" },
      { target: "RXJS",                type: "technical" },
      { target: "TypeScript",          type: "technical" },
    ]},
    { name: "WebComponents", level: "Avanzato", domain: "tech", weight: 4, mastery: 82, role: "core", links: [
      { target: "Lit",                 type: "technical" },
      { target: "HTML5",               type: "technical" },
      { target: "JavaScript",          type: "technical" },
      { target: "Angular",             type: "technical" },
    ]},
    { name: "React", level: "Intermedio", icon: "react", domain: "tech", weight: 3, mastery: 65, role: "support", links: [
      { target: "JavaScript",          type: "technical" },
      { target: "GraphQL",             type: "workflow" },
      { target: "Bootstrap",           type: "technical" },
      { target: "REST API",            type: "workflow" },
    ]},
    { name: "Git", level: "Avanzato", icon: "git", domain: "tech", weight: 3, mastery: 82, role: "support", links: [
      { target: "Node.js",             type: "workflow" },
      { target: "REST API",            type: "workflow" },
      { target: "Agile Methodology",   type: "cross-domain" },
      { target: "Autonomia e ownership", type: "cross-domain" },
    ]},
    { name: "Bootstrap", level: "Avanzato", icon: "bootstrap", domain: "tech", weight: 3, mastery: 78, role: "support", links: [
      { target: "CSS / SCSS",          type: "technical" },
      { target: "HTML5",               type: "technical" },
      { target: "Material Design",     type: "conceptual" },
      { target: "React",               type: "technical" },
    ]},
    { name: "Material Design", level: "Intermedio", domain: "creative", weight: 2, mastery: 58, role: "support", links: [
      { target: "Bootstrap",           type: "technical" },
      { target: "Figma",               type: "workflow" },
      { target: "UX Research",         type: "conceptual" },
      { target: "UX / UI Design",      type: "cross-domain" },
    ]},
    { name: "GraphQL", level: "Base", icon: "graphql", domain: "tech", weight: 2, mastery: 38, role: "support", links: [
      { target: "REST API",            type: "technical" },
      { target: "Node.js",             type: "technical" },
      { target: "React",               type: "workflow" },
      { target: "SQL",                 type: "conceptual" },
    ]},
    { name: "SQL", level: "Intermedio", domain: "tech", weight: 2, mastery: 55, role: "support", links: [
      { target: "REST API",            type: "workflow" },
      { target: "Node.js",             type: "workflow" },
      { target: "GraphQL",             type: "technical" },
    ]},
    { name: "Jest", level: "Intermedio", icon: "jest", domain: "tech", weight: 3, mastery: 62, role: "support", links: [
      { target: "TypeScript",          type: "technical" },
      { target: "Angular",             type: "technical" },
      { target: "Node.js",             type: "workflow" },
      { target: "Agile Methodology",   type: "cross-domain" },
    ]},
    { name: "Wordpress", level: "Base", icon: "wordpress", domain: "tech", weight: 1, mastery: 35, role: "support", links: [
      { target: "SEO",                 type: "workflow" },
      { target: "CSS / SCSS",          type: "technical" },
      { target: "HTML5",               type: "technical" },
      { target: "Social media management", type: "cross-domain" },
    ]},
    { name: "Figma", level: "Intermedio", icon: "figma", domain: "creative", weight: 3, mastery: 60, role: "bridge", links: [
      { target: "UX Research",         type: "workflow" },
      { target: "Wireframing",         type: "workflow" },
      { target: "Material Design",     type: "technical" },
      { target: "UX / UI Design",      type: "workflow" },
      { target: "Graphic design",      type: "cross-domain" },
    ]},
    { name: "SEO", level: "Intermedio", domain: "management", weight: 2, mastery: 58, role: "support", links: [
      { target: "SEM",                 type: "technical" },
      { target: "Digital marketing",   type: "cross-domain" },
      { target: "Wordpress",           type: "workflow" },
    ]},
    { name: "SEM", level: "Base", domain: "management", weight: 1, mastery: 32, role: "support", links: [
      { target: "SEO",                 type: "technical" },
      { target: "Digital marketing",   type: "cross-domain" },
    ]},
    { name: "UX Research", level: "Intermedio", domain: "creative", weight: 3, mastery: 65, role: "bridge", links: [
      { target: "Figma",               type: "workflow" },
      { target: "Wireframing",         type: "workflow" },
      { target: "Accessibility / WCAG", type: "conceptual" },
      { target: "UX / UI Design",      type: "workflow" },
      { target: "Sensibilità estetica", type: "cross-domain" },
    ]},
    { name: "Wireframing", level: "Intermedio", domain: "creative", weight: 3, mastery: 62, role: "support", links: [
      { target: "Figma",               type: "workflow" },
      { target: "UX Research",         type: "workflow" },
      { target: "UX / UI Design",      type: "workflow" },
    ]},
    { name: "Node.js", level: "Avanzato", icon: "nodedotjs", domain: "tech", weight: 4, mastery: 80, role: "core", links: [
      { target: "TypeScript",          type: "technical" },
      { target: "REST API",            type: "technical" },
      { target: "MCP Protocol",        type: "workflow" },
      { target: "Hono",                type: "technical" },
      { target: "GraphQL",             type: "technical" },
    ]},
    { name: "REST API", level: "Avanzato", domain: "tech", weight: 4, mastery: 82, role: "core", links: [
      { target: "Node.js",             type: "technical" },
      { target: "GraphQL",             type: "technical" },
      { target: "MCP Protocol",        type: "workflow" },
      { target: "Hono",                type: "technical" },
      { target: "SQL",                 type: "workflow" },
    ]},
    { name: "Accessibility / WCAG", level: "Intermedio", domain: "tech", weight: 3, mastery: 65, role: "bridge", links: [
      { target: "HTML5",               type: "technical" },
      { target: "UX Research",         type: "workflow" },
      { target: "CSS / SCSS",          type: "technical" },
      { target: "UX / UI Design",      type: "cross-domain" },
    ]},
    { name: "Video editing", level: "Intermedio", domain: "creative", weight: 2, mastery: 55, role: "support", links: [
      { target: "Videomaking",         type: "workflow" },
      { target: "Sensibilità estetica", type: "cross-domain" },
      { target: "Fotografia",          type: "cross-domain" },
      { target: "Creatività applicata", type: "cross-domain" },
    ]},
    { name: "MCP Protocol", level: "Avanzato", domain: "ai", weight: 5, mastery: 88, role: "core", links: [
      { target: "Node.js",             type: "technical" },
      { target: "Prompt Engineering",  type: "workflow" },
      { target: "REST API",            type: "technical" },
      { target: "Hono",                type: "technical" },
      { target: "AI-Augmented Productivity", type: "workflow", description: "L'MCP trasforma l'AI da chatbot a collaboratore operativo del processo" },
    ]},
    { name: "Prompt Engineering", level: "Avanzato", domain: "ai", weight: 5, mastery: 90, role: "bridge", links: [
      { target: "MCP Protocol",        type: "workflow" },
      { target: "AI-Augmented Productivity", type: "workflow" },
      { target: "Node.js",             type: "technical" },
      { target: "Pensiero T-shaped",   type: "cross-domain", description: "Prompt efficaci nascono da chi sa ragionare in più domini contemporaneamente" },
    ]},
    { name: "GSAP", level: "Avanzato", icon: "greensock", domain: "creative", weight: 4, mastery: 80, role: "bridge", links: [
      { target: "JavaScript",          type: "technical" },
      { target: "CSS / SCSS",          type: "technical" },
      { target: "Lit",                 type: "workflow" },
      { target: "Sensibilità estetica", type: "cross-domain", description: "L'animazione non è decorazione — viene dall'occhio fotografico di chi la progetta" },
      { target: "Creatività applicata", type: "cross-domain" },
    ]},
    { name: "Astro", level: "Intermedio", icon: "astro", domain: "tech", weight: 3, mastery: 65, role: "support", links: [
      { target: "TypeScript",          type: "technical" },
      { target: "HTML5",               type: "technical" },
      { target: "CSS / SCSS",          type: "technical" },
      { target: "Lit",                 type: "technical" },
      { target: "Node.js",             type: "technical" },
    ]},
    { name: "Hono", level: "Intermedio", domain: "tech", weight: 3, mastery: 65, role: "support", links: [
      { target: "Node.js",             type: "technical" },
      { target: "REST API",            type: "technical" },
      { target: "MCP Protocol",        type: "workflow" },
      { target: "TypeScript",          type: "technical" },
    ]},
  ] as Skill[],

  // ── Soft skills ───────────────────────────────────────────────────────────
  softSkills: [
    { name: "Comunicazione efficace", description: "Oltre 10 anni di conduzione pubblica di eventi e formazione teatrale: capacità di trasmettere messaggi complessi in modo chiaro, coinvolgente e calibrato su ogni tipo di audience.", domain: "human", weight: 4, mastery: 90, role: "bridge", links: [
      { target: "Public speaking",             type: "cross-domain" },
      { target: "Teatro e improvvisazione",    type: "conceptual" },
      { target: "Intelligenza relazionale",    type: "conceptual" },
      { target: "Scrittura e poesia",          type: "cross-domain" },
    ]},
    { name: "Creatività applicata", description: "Background multidisciplinare (sviluppo software, fotografia, teatro, scrittura, eventi) che genera approcci originali e soluzioni inaspettate anche in contesti tecnici.", domain: "creative", weight: 4, mastery: 85, role: "bridge", links: [
      { target: "Sensibilità estetica",        type: "conceptual" },
      { target: "Problem solving laterale",    type: "conceptual" },
      { target: "Fotografia",                  type: "cross-domain" },
      { target: "Teatro e improvvisazione",    type: "cross-domain" },
      { target: "Graphic design",              type: "cross-domain" },
      { target: "GSAP",                        type: "cross-domain" },
    ]},
    { name: "Adattabilità culturale", description: "Esperienze lavorative in 5 paesi (Italia, UK, Messico, Tanzania, Lussemburgo), ognuna con un contesto organizzativo, linguistico e culturale profondamente diverso.", domain: "human", weight: 4, mastery: 82, role: "support", links: [
      { target: "Intelligenza relazionale",    type: "conceptual" },
      { target: "Resilienza e pensiero adattivo", type: "conceptual" },
      { target: "Public speaking",             type: "cross-domain" },
      { target: "Event management",            type: "cross-domain" },
    ]},
    { name: "Intelligenza relazionale", description: "Costruzione naturale di rapporti di fiducia con colleghi, clienti e stakeholder, maturata in ambienti ad alta variabilità: dal customer service internazionale alla gestione di team cross-funzionali.", domain: "human", weight: 4, mastery: 85, role: "core", links: [
      { target: "Comunicazione efficace",      type: "conceptual" },
      { target: "Adattabilità culturale",      type: "conceptual" },
      { target: "Event management",            type: "cross-domain" },
      { target: "Public speaking",             type: "cross-domain" },
    ]},
    { name: "Problem solving laterale", description: "Approccio analitico e trasversale ai problemi: esperienza in ambienti enterprise complessi (architetture a microfrontend, sistemi legacy) e in situazioni live ad alto stress (regia tecnica, conduzione di eventi).", domain: "human", weight: 5, mastery: 87, role: "bridge", links: [
      { target: "Creatività applicata",        type: "conceptual" },
      { target: "Pensiero T-shaped",           type: "conceptual" },
      { target: "Agile Methodology",           type: "cross-domain" },
      { target: "MCP Protocol",               type: "cross-domain" },
    ]},
    { name: "Autonomia e ownership", description: "Gestione autonoma di progetti paralleli (fotografia freelance, videomaking, consulenza strategica) con capacità di definire priorità, rispettare le scadenze e consegnare risultati senza supervisione diretta.", domain: "management", weight: 4, mastery: 88, role: "core", links: [
      { target: "Resilienza e pensiero adattivo", type: "conceptual" },
      { target: "Agile Methodology",           type: "cross-domain" },
      { target: "Pensiero T-shaped",           type: "conceptual" },
      { target: "Git",                         type: "cross-domain" },
    ]},
    { name: "Resilienza e pensiero adattivo", description: "Lucidità sotto pressione allenata nella regia tecnica teatrale, nella conduzione live di eventi e nella gestione di sistemi enterprise in produzione. L'imprevisto viene trattato come dato da cui imparare.", domain: "human", weight: 4, mastery: 82, role: "support", links: [
      { target: "Autonomia e ownership",       type: "conceptual" },
      { target: "Adattabilità culturale",      type: "conceptual" },
      { target: "Teatro e improvvisazione",    type: "cross-domain" },
      { target: "Agile Methodology",           type: "cross-domain" },
    ]},
    { name: "Sensibilità estetica", description: "Oltre 15 anni di pratica fotografica e produzione visiva si traducono in scelte UI più efficaci, con impatto diretto sulla percezione del brand e sulla qualità dell'esperienza utente.", domain: "creative", weight: 4, mastery: 88, role: "bridge", links: [
      { target: "Creatività applicata",        type: "conceptual" },
      { target: "Fotografia",                  type: "cross-domain" },
      { target: "Graphic design",              type: "cross-domain" },
      { target: "UX / UI Design",             type: "cross-domain" },
      { target: "CSS / SCSS",                  type: "cross-domain" },
      { target: "GSAP",                        type: "cross-domain" },
    ]},
    { name: "Pensiero T-shaped", description: "Capacità di agire da ponte tra ingegneria (Frontend), design (UX/UI) e marketing (SEO/SEM), riducendo i silos comunicativi e accelerando il time-to-market di prodotti digitali.", domain: "management", weight: 5, mastery: 90, role: "bridge", links: [
      { target: "Problem solving laterale",    type: "conceptual" },
      { target: "Autonomia e ownership",       type: "conceptual" },
      { target: "AI-Augmented Productivity",   type: "cross-domain" },
      { target: "Agile Methodology",           type: "cross-domain" },
    ]},
  ] as SoftSkill[],

  // ── Transversal skills ────────────────────────────────────────────────────
  transversalSkills: [
    { name: "Event management", description: "Ideazione e produzione di festival culturali multidisciplinari (Square Festival, Artiversum – Quadrilatero Romano, Torino): coordinamento artisti, logistica e comunicazione istituzionale.", domain: "management", weight: 3, mastery: 72, role: "support", links: [
      { target: "Agile Methodology",           type: "cross-domain" },
      { target: "Intelligenza relazionale",    type: "cross-domain" },
      { target: "Public speaking",             type: "workflow" },
      { target: "Comunicazione efficace",      type: "workflow" },
    ]},
    { name: "Fotografia", description: "Attività freelance continuativa dal 2009, con portfolio internazionale (Tanzania, Messico, Italia). Specializzazione in reportage e ritratto.", domain: "creative", weight: 3, mastery: 80, role: "support", links: [
      { target: "Creatività applicata",        type: "cross-domain" },
      { target: "Sensibilità estetica",        type: "cross-domain" },
      { target: "Videomaking",                 type: "technical" },
      { target: "Video editing",               type: "workflow" },
    ]},
    { name: "Teatro e improvvisazione", description: "Formazione e palcoscenico con B-Teatro (2013–2020), spettacoli in Italia e Lussemburgo. L'improvvisazione allena l'ascolto attivo, il pensiero rapido e la capacità di trasformare il fallimento in risorsa.", domain: "human", weight: 4, mastery: 85, role: "bridge", links: [
      { target: "Public speaking",             type: "workflow" },
      { target: "Comunicazione efficace",      type: "workflow" },
      { target: "Resilienza e pensiero adattivo", type: "cross-domain" },
      { target: "Agile Methodology",           type: "conceptual", description: "L'improvvisazione teatrale è il modello mentale originale dello sprint Agile" },
    ]},
    { name: "Public speaking", description: "Conduzione di festival, panel e talk con ospiti internazionali dal 2015. Capacità di gestire audience eterogenee e situazioni impreviste live con naturalezza e autorevolezza.", domain: "human", weight: 4, mastery: 85, role: "bridge", links: [
      { target: "Teatro e improvvisazione",    type: "workflow" },
      { target: "Comunicazione efficace",      type: "workflow" },
      { target: "Event management",            type: "workflow" },
      { target: "Intelligenza relazionale",    type: "conceptual" },
    ]},
    { name: "Graphic design", description: "Formazione specialistica (Immaginazione e Lavoro, 2018) con applicazione continuativa nella produzione di materiali visivi per eventi, brand e comunicazione digitale.", domain: "creative", weight: 3, mastery: 65, role: "support", links: [
      { target: "Sensibilità estetica",        type: "cross-domain" },
      { target: "Creatività applicata",        type: "cross-domain" },
      { target: "Figma",                       type: "cross-domain" },
      { target: "UX / UI Design",             type: "cross-domain" },
      { target: "Social media management",     type: "workflow" },
    ]},
    { name: "Social media management", description: "Formazione specialistica (Immaginazione e Lavoro, 2018) e applicazione pratica nella gestione editoriale dei canali per eventi culturali e per l'agenzia musicale.", domain: "management", weight: 2, mastery: 60, role: "support", links: [
      { target: "Digital marketing",           type: "workflow" },
      { target: "SEO",                         type: "workflow" },
      { target: "Comunicazione efficace",      type: "cross-domain" },
      { target: "Music industry",              type: "workflow" },
    ]},
    { name: "Digital marketing", description: "Master IED in Digital Communication (2022–2023): strategia di contenuto, SEO/SEM, analytics, campaign management e storytelling di brand in contesti B2C e B2B.", domain: "management", weight: 3, mastery: 65, role: "support", links: [
      { target: "Social media management",     type: "workflow" },
      { target: "SEO",                         type: "technical" },
      { target: "SEM",                         type: "technical" },
      { target: "Scrittura e poesia",          type: "cross-domain" },
      { target: "Music industry",              type: "workflow" },
    ]},
    { name: "UX / UI Design", description: "IBM UX Design Professional Certificate in corso: User Research, Information Architecture, Wireframing e prototipazione ad alta fedeltà con Figma.", domain: "creative", weight: 4, mastery: 70, role: "bridge", links: [
      { target: "Figma",                       type: "workflow" },
      { target: "UX Research",                 type: "workflow" },
      { target: "Wireframing",                 type: "workflow" },
      { target: "Sensibilità estetica",        type: "cross-domain" },
      { target: "Graphic design",              type: "conceptual" },
      { target: "Accessibility / WCAG",        type: "workflow" },
    ]},
    { name: "Videomaking", description: "Regia e produzione video per matrimoni di alto livello in Toscana: gestione di crew in contesti multiculturali, color grading e montaggio narrativo per un mercato premium internazionale.", domain: "creative", weight: 2, mastery: 68, role: "support", links: [
      { target: "Fotografia",                  type: "technical" },
      { target: "Creatività applicata",        type: "cross-domain" },
      { target: "Video editing",               type: "workflow" },
      { target: "Sensibilità estetica",        type: "cross-domain" },
    ]},
    { name: "Agile Methodology", description: "Scrum e Kanban applicati in team enterprise distribuiti (ALTEN, Intesa San Paolo, Aruba) e in progetti creativi personali. Esperienza concreta in sprint planning, retrospective e gestione del backlog.", domain: "management", weight: 5, mastery: 85, role: "bridge", links: [
      { target: "Pensiero T-shaped",           type: "cross-domain" },
      { target: "Autonomia e ownership",       type: "cross-domain" },
      { target: "Teatro e improvvisazione",    type: "conceptual" },
      { target: "Event management",            type: "cross-domain" },
      { target: "Git",                         type: "workflow" },
      { target: "Jest",                        type: "workflow" },
    ]},
    { name: "AI-Augmented Productivity", description: "Integrazione sistematica di GitHub Copilot, ChatGPT e Midjourney nei flussi di sviluppo, UX research e produzione di contenuti. L'AI amplia la qualità e la velocità senza sostituire il giudizio critico.", domain: "ai", weight: 5, mastery: 92, role: "bridge", links: [
      { target: "Prompt Engineering",          type: "workflow" },
      { target: "MCP Protocol",               type: "workflow" },
      { target: "Pensiero T-shaped",           type: "cross-domain" },
      { target: "Agile Methodology",           type: "cross-domain" },
    ]},
    { name: "Scrittura e poesia", description: "Autore pluripremiato a livello internazionale (Italia, Australia). La pratica della scrittura creativa si traduce in copy più efficace, storytelling di prodotto e capacità di sintesi strategica.", domain: "creative", weight: 3, mastery: 80, role: "bridge", links: [
      { target: "Comunicazione efficace",      type: "cross-domain" },
      { target: "Creatività applicata",        type: "cross-domain" },
      { target: "Public speaking",             type: "workflow" },
      { target: "Digital marketing",           type: "cross-domain" },
    ]},
    { name: "Music industry", description: "Coordinamento tra artisti, aggregatori digitali e piattaforme di streaming (Spotify, YouTube Music). Esperienza in release management, comunicazione strategica e project management editoriale (2023–2024).", domain: "management", weight: 2, mastery: 58, role: "support", links: [
      { target: "Event management",            type: "workflow" },
      { target: "Social media management",     type: "workflow" },
      { target: "Digital marketing",           type: "workflow" },
      { target: "Comunicazione efficace",      type: "cross-domain" },
    ]},
  ] as TransversalSkill[],

  // ── Methodology & Mindset ─────────────────────────────────────────────────
  methodology: [
    {
      name: "Agile & Iterative Development",
      description: "Ogni progetto è un'opportunità di apprendimento incrementale. I cicli brevi di consegna riducono il rischio, mantengono il focus sugli obiettivi di business e permettono di adattarsi rapidamente ai feedback. Ho applicato questo mindset sia su sistemi enterprise con team distribuiti, sia su progetti creativi in autonomia.",
    },
    {
      name: "AI come moltiplicatore di valore",
      description: "L'intelligenza artificiale è integrata come estensione del processo cognitivo, non come scorciatoia. GitHub Copilot per velocity di sviluppo, ChatGPT per rapid prototyping concettuale, Midjourney per esplorazione visiva. L'obiettivo è ridurre il tempo sui task ripetitivi e ampliare lo spazio esplorabile nelle fasi creative.",
    },
    {
      name: "T-shaped Problem Solving",
      description: "Il background che attraversa ingegneria, design e marketing permette di individuare pattern di soluzione invisibili a team mono-disciplinari. Questa visione trasversale è il principale differenziale professionale: non solo eseguire, ma identificare il problema corretto da risolvere.",
    },
    {
      name: "Framework-Agnostic Thinking",
      description: "L'esposizione a Angular, React, Lit, WebComponents, Astro e a paradigmi creativi eterogenei ha sviluppato la capacità di scegliere lo strumento in base al problema — e non viceversa. Questo evita il soluzioneismo tecnico e garantisce architetture più solide, manutenibili e orientate al valore nel lungo periodo.",
    },
  ] as MethodologyItem[],

  // ── Growth areas (presented as evolution paths) ────────────────────────────
  growthAreas: [
    {
      name: "Curiosità poliedrica",
      reframe: "La tendenza naturale a esplorare campi diversi, pur richiedendo una gestione consapevole del focus, è la radice di un profilo genuinamente framework-agnostic. Non si tratta di dispersione, ma di una strategia adattiva: ogni competenza acquisita diventa un nuovo angolo da cui leggere i problemi tecnici e creativi. È la fonte del pensiero laterale che genera soluzioni che chi conosce un solo dominio non vede.",
    },
  ] as GrowthArea[],

  // ── Personal projects ─────────────────────────────────────────────────────
  projects: [
    {
      name: "Digital CV — Progetto Open Source AI-Augmented",
      description: "CV interattivo open source costruito interamente con un workflow AI-augmented (GitHub Copilot + Claude). Sistema a due livelli: sito Astro + Lit con animazioni GSAP avanzate e wave effect SVG, e server MCP che espone i dati CV come API per agenti AI. La dimostrazione live del metodo: un developer che produce in settimane ciò che un team produrrebbe in mesi.",
      url: "https://github.com/julioojospintados/digital-cv",
      repoUrl: "https://github.com/julioojospintados/digital-cv",
      date: "2024-11",
      tags: ["Astro", "Lit", "GSAP", "MCP Protocol", "TypeScript", "Hono", "Prompt Engineering", "GitHub Copilot"],
    },
    {
      name: 'Film "Double"',
      description: 'Deuteragonista nel film "Double", presentato all\'Independent Film Festival di San Francisco nel 2022.',
      date: "2022-01",
      tags: ["Cinema", "Recitazione"],
    },
    {
      name: "App gestione dati Covid-19",
      description: "Realizzazione tramite React di un applicativo per la gestione e visualizzazione di dati relativi al Covid-19 in numerosi ospedali negli USA.",
      date: "2022-01",
      tags: ["React", "Healthcare", "USA"],
    },
    {
      name: "Design system WebComponents per Aruba",
      description: "Libreria grafica WebComponents sviluppata con Lit, HTML e SASS per Aruba, riutilizzabile cross-prodotto.",
      date: "2022-06",
      tags: ["Lit", "WebComponents", "Design System", "Aruba"],
    },
    {
      name: "Square Festival – Artiversum",
      description: "Cofondatore e organizzatore dello Square Festival nel Quadrilatero Romano di Torino, evento culturale multidisciplinare.",
      date: "2017-05",
      tags: ["Event management", "Cultura", "Torino"],
    },
    {
      name: "Invenzione di una parola — Salone Internazionale del Libro (Torino)",
      description: "Ho creato e presentato pubblicamente una parola nuova — con radici, suono e significato — al Salone Internazionale del Libro di Torino. Un esercizio estremo di sintesi linguistica e poetica: la stessa capacità di dire il massimo con il minimo che applico ogni giorno nella scrittura di codice pulito e nella comunicazione di prodotto.",
      date: "2019-05",
      tags: ["Poesia", "Linguistica", "Creatività", "Salone del Libro"],
    },
    {
      name: "Poesia premiata a livello internazionale",
      description: "Autore di poesie premiate in concorsi nazionali e internazionali (Italia e Australia). La scrittura creativa e lo sviluppo software condividono una radice comune: entrambi richiedono sintesi, precisione formale e la capacità di generare significato con vincoli espliciti.",
      tags: ["Poesia", "Scrittura creativa", "Premi internazionali"],
    },
    {
      name: "La 'Tesina sui Baffi' — articolo su La Stampa",
      description: "Una tesina scolastica sui baffi, caso involontario di marketing e curiosità antropologica, finisce sulle pagine de 'La Stampa'. La dimostrazione pratica che l'originalità del pensiero, anche in contesti giovanili e apparentemente marginali, può generare attenzione pubblica imprevista — e che la narrativa conta più del formato.",
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
      description: "Intervento diretto in una situazione di rischio suicidio: riconoscimento dei segnali, ascolto attivo e accompagnamento verso supporto professionale. Una delle esperienze più formative in termini di presenza piena e capacità di stare nell'imprevisto senza fuggire dalla complessità emotiva. 'Yes, and...' nella sua forma più radicale: accettare la realtà dell'altro e aggiungere presenza.",
      tags: ["Empatia", "Ascolto attivo", "Gestione della crisi", "Human skills"],
    },
    {
      name: "Assistenza legale a immigrato in difficoltà",
      description: "Supporto concreto a un ragazzo bangladese in difficoltà con il sistema legale italiano: orientamento nel labirinto burocratico, traduzione del contesto normativo e raccordo con le risorse disponibili. Il 'Yes, and...' applicato alla vita reale: accettare la situazione senza tirarsi fuori e aggiungere valore dove gli altri passano oltre.",
      tags: ["Solidarietà", "Interculturalità", "Assistenza", "Civic engagement"],
    },
    {
      name: "Intervento in difesa di terzi in spazio pubblico",
      description: "Pronto intervento in una situazione di pericolo in strada per la tutela di terzi. L'improvvisazione teatrale insegna a stare nel momento senza paralizzarsi: questa capacità, applicata fuori dal palco, si traduce in lucidità e azione quando gli altri esitano. Una forma di leadership situazionale che non si impara nei libri.",
      tags: ["Coraggio civile", "Leadership situazionale", "Pensiero rapido"],
    },
  ] as SocialImpactItem[],

  // ── Value flows ───────────────────────────────────────────────────────────
  // Ordered paths that show how Giulio creates value across skill domains
  valueFlows: [
    {
      name: "Prodotto Digitale End-to-End",
      description: "Dal bisogno aziendale al deploy: il flusso completo che unisce ricerca utente, design iterativo, sviluppo e consegna misurabile.",
      steps: ["UX Research", "Wireframing", "Agile Methodology", "Angular", "TypeScript", "CSS / SCSS", "Accessibility / WCAG", "REST API", "Git", "MCP Protocol"],
    },
    {
      name: "Team Delivery & Leadership Agile",
      description: "Come porto un team da 'caos operativo' ad 'autonomia consapevole': improvvisazione come metodo, Agile come struttura, comunicazione come collante.",
      steps: ["Teatro e improvvisazione", "Agile Methodology", "Comunicazione efficace", "Pensiero T-shaped", "Autonomia e ownership", "Git"],
    },
    {
      name: "Comunicazione Strategica di Prodotto",
      description: "Dal copy alla campagna: il flusso narrativo che porta un prodotto tecnico a diventare una storia che il cliente vuole ascoltare.",
      steps: ["Scrittura e poesia", "Public speaking", "Sensibilità estetica", "Graphic design", "Digital marketing", "Social media management"],
    },
    {
      name: "AI-First Implementation Workflow",
      description: "Il metodo GO Automated: ogni processo ripetibile diventa un agente. Dall'architettura AI al deploy zero-touch in sprint di 1–2 settimane.",
      steps: ["Prompt Engineering", "MCP Protocol", "Node.js", "Hono", "REST API", "AI-Augmented Productivity", "Agile Methodology"],
    },
  ] as ValueFlow[],

} as const satisfies Record<string, unknown>;

export type CvData = typeof cvData;

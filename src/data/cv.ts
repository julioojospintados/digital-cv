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

export interface Skill {
  name: string;
  level: SkillLevel;
  /** Icon slug from https://simpleicons.org — optional */
  icon?: string;
}

export interface SoftSkill {
  name: string;
  /** One-line description or example context */
  description?: string;
}

export interface TransversalSkill {
  name: string;
  description?: string;
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
    title: "Frontend Developer · UX/UI · Digital Strategist",
    summary: "Frontend Developer con 6+ anni di esperienza su sistemi enterprise ad alto traffico (Intesa San Paolo, Aruba, Rai Pubblicità). Profilo T-shaped con expertise verticale in Angular, WebComponents e architetture a microfrontend, e competenze orizzontali in UX/UI Design, digital strategy e arti creative. Framework-agnostic, orientato all'impatto, con esperienze dirette in 5 paesi.",
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
      company: "ALTEN Italia",
      role: "Frontend Developer",
      startDate: "2019-07",
      endDate: "present",
      location: "Torino, Italia",
      remote: false,
      description: "Sviluppo Frontend per clienti enterprise in ambito bancario, media e tecnologico. Progettazione e implementazione di interfacce modulari, design system e WebComponents ad alta scalabilità, adottati da prodotti con milioni di utenti attivi.",
      highlights: [
        "Progettazione e sviluppo di interfacce modulari per i prodotti digitali di Intesa San Paolo, garantendo scalabilità e coerenza del codice con Angular, RXJS, HTML e SCSS",
        "Architettura e sviluppo di una libreria grafica WebComponents per Aruba (Lit, HTML, SASS), adottata trasversalmente su più prodotti aziendali",
        "Realizzazione di un'applicazione enterprise con architettura a microfrontend e microservizi, con state management avanzato tramite NGRX (Angular + Lit)",
        "Implementazione di test unitari con Jest, con impatto diretto sulla copertura del codice e sulla stabilità dei rilasci",
        "Sviluppo di applicativi gestionali interni per Rai Pubblicità con Angular, Spring e Bootstrap (tramite Consoft)",
        "Sviluppo di un tool interno per la gestione documentale e revisionale in Intesa San Paolo (JSF), ottimizzando i flussi operativi a uso degli operatori",
        "Sviluppo di un'app React per la gestione e visualizzazione dei dati Covid-19 in strutture ospedaliere negli USA (client ForgeLab)",
        "Sviluppo di un'interfaccia brand in Angular con integrazione GraphQL per l'accesso e la visualizzazione dati da database",
      ],
      skills: ["Angular", "Lit", "TypeScript", "HTML5", "SCSS", "RXJS", "NGRX", "WebComponents", "React", "GraphQL", "Bootstrap", "Material Design", "Jest", "Spring", "JSF"],
    },
    {
      company: "Music Agency (collaborazione)",
      role: "Supporto Operativo & Strategico",
      startDate: "2023-01",
      endDate: "2024-12",
      location: "Italia",
      remote: true,
      description: "Supporto operativo e strategico per agenzia musicale: gestione della comunicazione, coordinamento di progetti tra artisti e piattaforme digitali, pianificazione editoriale e interfaccia con distributori.",
      highlights: [
        "Coordinamento tra artisti e piattaforme digitali (Spotify, YouTube, distribuzioni)",
        "Gestione della comunicazione istituzionale e social dell'agenzia",
        "Project management di release e campagne promozionali",
      ],
      skills: ["Project management", "Comunicazione digitale", "Social media", "Music business"],
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
    { name: "Angular", level: "Esperto", icon: "angular" },
    { name: "HTML5", level: "Esperto", icon: "html5" },
    { name: "CSS / SCSS", level: "Esperto", icon: "css3" },
    { name: "TypeScript", level: "Avanzato", icon: "typescript" },
    { name: "JavaScript", level: "Avanzato", icon: "javascript" },
    { name: "Lit", level: "Avanzato", icon: "lit" },
    { name: "RXJS", level: "Avanzato" },
    { name: "NGRX", level: "Intermedio" },
    { name: "WebComponents", level: "Avanzato" },
    { name: "React", level: "Intermedio", icon: "react" },
    { name: "Git", level: "Avanzato", icon: "git" },
    { name: "Bootstrap", level: "Avanzato", icon: "bootstrap" },
    { name: "Material Design", level: "Intermedio" },
    { name: "GraphQL", level: "Base", icon: "graphql" },
    { name: "SQL", level: "Intermedio" },
    { name: "Jest", level: "Intermedio", icon: "jest" },
    { name: "Wordpress", level: "Base", icon: "wordpress" },
    { name: "Figma", level: "Intermedio", icon: "figma" },
    { name: "SEO", level: "Intermedio" },
    { name: "SEM", level: "Base" },
    { name: "UX Research", level: "Intermedio" },
    { name: "Wireframing", level: "Intermedio" },
    { name: "Node.js", level: "Avanzato", icon: "nodedotjs" },
    { name: "REST API", level: "Avanzato" },
    { name: "Accessibility / WCAG", level: "Intermedio" },
    { name: "Video editing", level: "Intermedio" },
  ] as Skill[],

  // ── Soft skills ───────────────────────────────────────────────────────────
  softSkills: [
    { name: "Comunicazione efficace", description: "Oltre 10 anni di conduzione pubblica di eventi e formazione teatrale: capacità di trasmettere messaggi complessi in modo chiaro, coinvolgente e calibrato su ogni tipo di audience." },
    { name: "Creatività applicata", description: "Background multidisciplinare (sviluppo software, fotografia, teatro, scrittura, eventi) che genera approcci originali e soluzioni inaspettate anche in contesti tecnici." },
    { name: "Adattabilità culturale", description: "Esperienze lavorative in 5 paesi (Italia, UK, Messico, Tanzania, Lussemburgo), ognuna con un contesto organizzativo, linguistico e culturale profondamente diverso." },
    { name: "Intelligenza relazionale", description: "Costruzione naturale di rapporti di fiducia con colleghi, clienti e stakeholder, maturata in ambienti ad alta variabilità: dal customer service internazionale alla gestione di team cross-funzionali." },
    { name: "Problem solving laterale", description: "Approccio analitico e trasversale ai problemi: esperienza in ambienti enterprise complessi (architetture a microfrontend, sistemi legacy) e in situazioni live ad alto stress (regia tecnica, conduzione di eventi)." },
    { name: "Autonomia e ownership", description: "Gestione autonoma di progetti paralleli (fotografia freelance, videomaking, consulenza strategica) con capacità di definire priorità, rispettare le scadenze e consegnare risultati senza supervisione diretta." },
    { name: "Resilienza e pensiero adattivo", description: "Lucidità sotto pressione allenata nella regia tecnica teatrale, nella conduzione live di eventi e nella gestione di sistemi enterprise in produzione. L'imprevisto viene trattato come dato da cui imparare." },
    { name: "Sensibilità estetica", description: "Oltre 15 anni di pratica fotografica e produzione visiva si traducono in scelte UI più efficaci, con impatto diretto sulla percezione del brand e sulla qualità dell'esperienza utente." },
    { name: "Pensiero T-shaped", description: "Capacità di agire da ponte tra ingegneria (Frontend), design (UX/UI) e marketing (SEO/SEM), riducendo i silos comunicativi e accelerando il time-to-market di prodotti digitali." },
  ] as SoftSkill[],

  // ── Transversal skills ────────────────────────────────────────────────────
  transversalSkills: [
    { name: "Event management", description: "Ideazione e produzione di festival culturali multidisciplinari (Square Festival, Artiversum – Quadrilatero Romano, Torino): coordinamento artisti, logistica e comunicazione istituzionale." },
    { name: "Fotografia", description: "Attività freelance continuativa dal 2009, con portfolio internazionale (Tanzania, Messico, Italia). Specializzazione in reportage e ritratto." },
    { name: "Teatro e improvvisazione", description: "Formazione e palcoscenico con B-Teatro (2013–2020), spettacoli in Italia e Lussemburgo. L'improvvisazione allena l'ascolto attivo, il pensiero rapido e la capacità di trasformare il fallimento in risorsa." },
    { name: "Public speaking", description: "Conduzione di festival, panel e talk con ospiti internazionali dal 2015. Capacità di gestire audience eterogenee e situazioni impreviste live con naturalezza e autorevolezza." },
    { name: "Graphic design", description: "Formazione specialistica (Immaginazione e Lavoro, 2018) con applicazione continuativa nella produzione di materiali visivi per eventi, brand e comunicazione digitale." },
    { name: "Social media management", description: "Formazione specialistica (Immaginazione e Lavoro, 2018) e applicazione pratica nella gestione editoriale dei canali per eventi culturali e per l'agenzia musicale." },
    { name: "Digital marketing", description: "Master IED in Digital Communication (2022–2023): strategia di contenuto, SEO/SEM, analytics, campaign management e storytelling di brand in contesti B2C e B2B." },
    { name: "UX / UI Design", description: "IBM UX Design Professional Certificate in corso: User Research, Information Architecture, Wireframing e prototipazione ad alta fedeltà con Figma." },
    { name: "Videomaking", description: "Regia e produzione video per matrimoni di alto livello in Toscana: gestione di crew in contesti multiculturali, color grading e montaggio narrativo per un mercato premium internazionale." },
    { name: "Agile Methodology", description: "Scrum e Kanban applicati in team enterprise distribuiti (ALTEN, Intesa San Paolo, Aruba) e in progetti creativi personali. Esperienza concreta in sprint planning, retrospective e gestione del backlog." },
    { name: "AI-Augmented Productivity", description: "Integrazione sistematica di GitHub Copilot, ChatGPT e Midjourney nei flussi di sviluppo, UX research e produzione di contenuti. L'AI amplia la qualità e la velocità senza sostituire il giudizio critico." },
    { name: "Scrittura e poesia", description: "Autore pluripremiato a livello internazionale (Italia, Australia). La pratica della scrittura creativa si traduce in copy più efficace, storytelling di prodotto e capacità di sintesi strategica." },
    { name: "Music industry", description: "Coordinamento tra artisti, aggregatori digitali e piattaforme di streaming (Spotify, YouTube Music). Esperienza in release management, comunicazione strategica e project management editoriale (2023–2024)." },
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
      name: 'Film "Double"',
      description: 'Deuteragonista nel cortometraggio "Double", presentato all\'Independent Film Festival di San Francisco nel 2022.',
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

} as const satisfies Record<string, unknown>;

export type CvData = typeof cvData;

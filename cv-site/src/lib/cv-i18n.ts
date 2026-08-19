/**
 * cv-i18n.ts — tutto ciò che cambia da una lingua all'altra nelle pagine CV.
 *
 * Le pagine CV (`[mode].astro` per l'italiano, `en/cv.astro` per l'inglese)
 * condividono la stessa logica: vive in `cv-view-model.ts` ed è scritta una
 * volta sola. Qui restano soltanto le stringhe.
 *
 * AGGIUNGERE UNA LINGUA
 * 1. Aggiungi il codice a `Locale`.
 * 2. Aggiungi il blocco corrispondente a `LOCALES` — il compilatore elenca
 *    da solo i campi mancanti.
 * 3. Crea la pagina (copia `en/cv.astro`, cambia locale e sorgente dati).
 * Nessuna logica da duplicare: se ti ritrovi a copiare una funzione da una
 * pagina all'altra, quella funzione va in `cv-view-model.ts`.
 */

export type Locale = "it" | "en";

export type Mode = "tech" | "creative" | "human";

export const MODES: readonly Mode[] = ["creative", "tech", "human"] as const;

/**
 * Mode mostrato quando la route non ne indica uno (`/en/cv`, `/cv`, store
 * vuoto). Design-first, identico in tutte le lingue.
 *
 * Cambiarlo richiede di allineare anche: `DEFAULT_MODE` in
 * `scripts/cv-init.ts`, i fallback in `islands/stores/modeStore.ts`
 * (`getInitialMode` e `initMode`) e il redirect in `pages/cv.astro`.
 */
export const DEFAULT_MODE: Mode = "creative";

/**
 * Slug di URL per ogni lente — **separati dalle chiavi interne, di proposito**.
 *
 * Le chiavi `tech | creative | human` compaiono 427 volte nel progetto: nei
 * dati (`cv.ts` e `cv.en.ts`), nelle regole CSS `[data-mode]`, in
 * `exp-clusters.ts`, nello store, nei test. Rinominarle per cambiare un
 * indirizzo sarebbe un intervento a quattrocento punti su file di dati, con
 * la parità IT/EN in mezzo, per ottenere una cosa che l'utente non vede
 * nemmeno.
 *
 * Quindi: l'URL cambia qui e basta, le chiavi restano dove sono. `creative`
 * si serve su /design perché il nome della disciplina dice più
 * dell'attitudine, e `human` su /ai perché è il termine con cui quel profilo
 * viene cercato. Il ruolo per esteso lo dice comunque il titolo della pagina.
 */
export const LENS_SLUGS: Record<Mode, string> = {
  tech: "tech",
  creative: "design",
  human: "ai",
};

/** Slug → chiave interna. Costruita dalla mappa sopra: una sola fonte. */
export const MODE_BY_SLUG: Record<string, Mode> = Object.fromEntries(
  (Object.entries(LENS_SLUGS) as [Mode, string][]).map(([mode, slug]) => [slug, mode]),
) as Record<string, Mode>;

/** Percorso della pagina CV per una lente, nella lingua data. */
export function lensPath(mode: Mode, locale: Locale = "it"): string {
  return locale === "en" ? `/en/${LENS_SLUGS[mode]}` : `/${LENS_SLUGS[mode]}`;
}

export interface LocaleStrings {
  /** Abbreviazioni dei mesi, indice 0 = gennaio. Usate nella timeline. */
  months: readonly string[];
  /**
   * Livelli skill tradotti. `deriveSkillLevel` in `cv-view-model.ts` produce
   * sempre le chiavi italiane (sono i valori che stanno in `cv.ts`): qui si
   * traducono per la visualizzazione.
   */
  levels: Record<string, string>;
  /** Etichetta per un'esperienza ancora in corso (`endDate: "present"`). */
  present: string;
  /** Toggle di vista della sezione skill. */
  skillView: { graph: string; cards: string };
  /** Nome del profilo per ogni mode — usato nel `<title>` e nella nav. */
  modeLabels: Record<Mode, string>;
  /** Meta description per mode. */
  modeDescriptions: Record<Mode, string>;
  /** Fallback quando il mode non è tra quelli previsti. */
  fallbackDescription: string;
  /** Titolo dell'hero per mode. */
  heroTitles: Record<Mode, string>;
  /** Sommario dell'hero per mode. */
  heroSummaries: Record<Mode, string>;
  /**
   * Tag dei progetti → mode in cui il progetto è attivo. Le chiavi sono i tag
   * così come compaiono nel dataset di quella lingua (`cv.ts` usa "Poesia",
   * `cv.en.ts` usa "Poetry"), quindi la mappa non è condivisibile.
   */
  projectTags: Record<string, string>;
}

const IT: LocaleStrings = {
  months: ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"],
  levels: {
    Base: "Base",
    Intermedio: "Intermedio",
    Avanzato: "Avanzato",
    Esperto: "Esperto",
  },
  present: "oggi",
  skillView: { graph: "Grafico", cards: "Card" },
  modeLabels: {
    tech: "Software Developer",
    creative: "Web & UX Designer",
    human: "AI & Digital Specialist",
  },
  modeDescriptions: {
    tech: "Angular, Lit e TypeScript al servizio del design. Progetto interfacce e le porto in produzione: disegnarle e costruirle sono lo stesso lavoro.",
    creative:
      "UX/UI & Web Designer certificato IBM, Creative Technologist. Progetto interfacce belle da vedere e pensate per essere usate: le due cose insieme, o non escono.",
    human:
      "Consulente per l'Innovazione Digitale. Design, sviluppo, teatro e comunicazione nello stesso percorso: i workflow AI li costruisco e li so raccontare.",
  },
  fallbackDescription:
    "CV interattivo di Giulio Occhipinti: Consulente per l'Innovazione Digitale & Partner Tecnico per piccole e grandi realtà.",
  // Hero mode-aware: chi arriva su /tech o /creative cercando un profilo
  // specifico non deve leggere il posizionamento generico da partner tecnico
  // (quello resta sulla home) — vedi memoria "posizionamento-ux-ui-first":
  // Design/UX-UI sempre prima, Tecnologia come strumento, mai "Senior
  // Frontend Developer" come identità.
  heroTitles: {
    tech: "Sviluppo al servizio del design: Angular, Lit, AI Workflow.",
    creative: "UX/UI & Web Designer certificato IBM, Creative Technologist.",
    human: "Consulente per l'Innovazione Digitale: comunicazione e impatto.",
  },
  heroSummaries: {
    tech: "Costruisco interfacce con Angular, Lit e TypeScript, e integro strumenti AI per velocizzare senza perdere qualità. In ALTEN Italia ho sviluppato design system e architetture per Aruba e Intesa San Paolo. Questo sito, ad esempio, l'ho realizzato con GitHub Copilot e Claude come assistenti operativi.",
    creative:
      "Progetto interfacce curate fino al dettaglio, con certificazioni IBM e SkillUp in UX/UI Design e in Generative AI applicata al design. Per Aruba ho sviluppato una libreria di componenti riutilizzabile cross-prodotto; in questo sito ho progettato animazioni GSAP e un sistema knolling documentato passo per passo nel design system.",
    human:
      "Il mio percorso unisce design, sviluppo, teatro e comunicazione. La formazione in improvvisazione teatrale con B-Teatro mi ha insegnato ad ascoltare prima di rispondere, un'attitudine che porto anche nella progettazione dei workflow AI. Ho condotto festival e panel con ospiti internazionali e ho progettato la comunicazione digitale del roster di un'agenzia musicale.",
  },
  projectTags: {
    Cinema: "creative",
    React: "tech",
    Lit: "tech",
    WebComponents: "tech",
    "Event management": "human",
    Poesia: "creative human",
    Creatività: "creative",
    "Tour management": "creative",
    "Content Strategy": "creative",
    "Digital marketing": "creative",
  },
};

const EN: LocaleStrings = {
  months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  levels: {
    Base: "Basic",
    Intermedio: "Intermediate",
    Avanzato: "Advanced",
    Esperto: "Expert",
  },
  present: "present",
  skillView: { graph: "Graph", cards: "Cards" },
  modeLabels: {
    tech: "Software Developer",
    creative: "Web & UX Designer",
    human: "AI & Digital Specialist",
  },
  modeDescriptions: {
    tech: "Angular, Lit and TypeScript in service of design. I design interfaces and ship them: drawing them and building them are the same job.",
    creative:
      "IBM-certified UX/UI & Web Designer, Creative Technologist. I design interfaces that look good and are built to be used: both at once, or they don't ship.",
    human:
      "Digital Innovation Consultant. Design, development, theatre and communication in one path: I build AI workflows and I can tell the story behind them.",
  },
  fallbackDescription:
    "Interactive CV of Giulio Occhipinti: Digital Innovation Consultant & Technical Partner for businesses large and small.",
  heroTitles: {
    tech: "Development in service of design: Angular, Lit, AI Workflow.",
    creative: "IBM-certified UX/UI & Web Designer, Creative Technologist.",
    human: "Digital Innovation Consultant: communication and impact.",
  },
  heroSummaries: {
    tech: "I build interfaces with Angular, Lit and TypeScript, and I integrate AI tooling to move faster without losing quality. At ALTEN Italia I developed design systems and architecture for Aruba and Intesa San Paolo. This site, for example, I built with GitHub Copilot and Claude as operational assistants.",
    creative:
      "I design interfaces polished down to the last detail, with IBM and SkillUp certifications in UX/UI Design and in Generative AI applied to design. For Aruba I built a reusable cross-product component library; on this site I designed the GSAP animations and a knolling system documented step by step in the design system.",
    human:
      "My path brings together design, development, theatre and communication. Training in theatrical improvisation with B-Teatro taught me to listen before answering, an attitude I carry into designing AI workflows too. I have hosted festivals and panels with international guests, and designed the digital communication for a music agency's roster.",
  },
  projectTags: {
    Cinema: "creative",
    React: "tech",
    Lit: "tech",
    WebComponents: "tech",
    "Event management": "human",
    Poetry: "creative human",
    Creativity: "creative",
    "Tour management": "creative",
    "Content Strategy": "creative",
    "Digital marketing": "creative",
  },
};

export const LOCALES: Record<Locale, LocaleStrings> = { it: IT, en: EN };

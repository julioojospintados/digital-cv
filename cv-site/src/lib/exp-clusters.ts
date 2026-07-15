/**
 * exp-clusters.ts — definizione condivisa dei cluster Esperienze.
 *
 * Unica fonte per [mode].astro (IT) e en/cv.astro (EN): chiavi, apertura per
 * mode, ordine e provenienza delle card. Prima questa mappa viveva duplicata
 * nelle due pagine come array posizionali (EXP_MODE_TAGS + EXP_CLUSTER_DEFS)
 * da tenere sincronizzati a mano: era già stata fonte di drift.
 *
 * Ogni ref punta a un indice di cvData.experience (`exp`) o di
 * cvData.projects (`proj`) — gli indici coincidono tra cv.ts e cv.en.ts,
 * che sono mirror 1:1. `facet` seleziona la variante (role/description/
 * highlights) dichiarata nell'esperienza per quella lente: la stessa
 * esperienza può comparire in più cluster con racconti diversi
 * (es. ALTEN come sviluppo, come Tech Lead, come design system).
 *
 * Il cluster `personal` non è legato a nessun mode: si apre dalla voce
 * "Fuori orario" in navbar/dropdown (cv-init.ts) e mostra la persona fuori
 * dal contesto lavorativo. UCI Cinemas (17) e Caveja (21) restano in cv.ts
 * ma fuori da ogni cluster (scelta del 2026-07-15).
 */

export type ClusterMode = "tech" | "creative" | "management" | "human";

export type ClusterRef =
  | { exp: number; facet?: ClusterMode }
  | { proj: number };

export interface ExpClusterDef {
  key: ClusterMode | "personal";
  labels: { it: string; en: string };
  /** data-tags delle card del cluster (stato active/passive per mode) */
  tags: string;
  openForModes: string[];
  refs: ClusterRef[];
}

/**
 * Metadati di presentazione per i progetti mostrati come card esperienza
 * nel cluster personale (il tipo Project non ha ruolo né durata).
 * Chiave = indice in cvData.projects.
 */
export const PROJ_CARD_META: Record<
  number,
  {
    role: { it: string; en: string };
    startYear?: string;
    endYear?: string;
    location?: { it: string; en: string };
  }
> = {
  // Film "Double" — prodotto a Torino da Filmine, proiettato a San Francisco
  3: {
    role: {
      it: "Attore deuteragonista, produzione Filmine",
      en: "Deuteragonist actor, produced by Filmine",
    },
    startYear: "2022",
    endYear: "2022",
    location: { it: "Torino · San Francisco", en: "Turin · San Francisco" },
  },
  // Veni Vidi Vinyl
  7: {
    role: { it: "Co-ideatore della serata", en: "Co-creator of the night" },
    startYear: "2017",
    endYear: "2018",
    location: { it: "Torino", en: "Turin" },
  },
  // Poesia premiata — nessuna data singola: la card nasconde l'intervallo
  9: {
    role: { it: "Poeta", en: "Poet" },
    location: { it: "Italia · Australia", en: "Italy · Australia" },
  },
};

export const EXP_CLUSTER_DEFS: ExpClusterDef[] = [
  {
    key: "tech",
    labels: { it: "Sviluppo Software", en: "Software Development" },
    tags: "tech",
    openForModes: ["tech"],
    // ALTEN (2) per primo: i recruiter cercano "dove lavora ora" in cima
    // (reverse-chronological, Legge di Jakob).
    refs: [
      { exp: 2 }, // ALTEN Italia
      { exp: 0 }, // Progetto Interno — gestionale
      { exp: 1 }, // Digital CV
      { exp: 5 }, // ForgeLab
      { exp: 6 }, // Consoft
    ],
  },
  {
    key: "creative",
    labels: { it: "Design & UX", en: "Design & UX" },
    tags: "creative",
    openForModes: ["creative"],
    refs: [
      { exp: 22 }, // Bambagia Design Lab (base: interfacce)
      { exp: 2, facet: "creative" }, // ALTEN — Aruba Design System
      { exp: 3 }, // Music Agency (base: comunicazione)
      { exp: 4 }, // Freelance Videomaker
      { exp: 9 }, // Freelance Fotografo
      { exp: 12 }, // FreeGinevro — Grafico Pubblicitario
      { exp: 10 }, // Corriere di Chieri
    ],
  },
  {
    key: "management",
    labels: { it: "Metodo & Gestione", en: "Method & Management" },
    tags: "management",
    openForModes: ["management"],
    refs: [
      { exp: 2, facet: "management" }, // ALTEN — Tech Lead & Scrum Master
      { exp: 0, facet: "management" }, // Progetto Interno — referente unico
      { exp: 3, facet: "management" }, // Music Agency — tour manager
      { exp: 11 }, // Artiversum — Square Festival
      { exp: 20 }, // Metamorfosi — coordinamento team
    ],
  },
  {
    key: "human",
    labels: { it: "AI & Digital", en: "AI & Digital" },
    tags: "human",
    openForModes: ["human"],
    refs: [
      { exp: 0, facet: "human" }, // Progetto Interno — layer MCP
      { exp: 1, facet: "human" }, // Digital CV — AI workflow
      { exp: 22, facet: "human" }, // Bambagia — MCP Figma/Wix
      { exp: 3, facet: "human" }, // Music Agency — digital strategy
      { exp: 7 }, // Satispay
    ],
  },
  {
    key: "personal",
    labels: { it: "Fuori orario", en: "Off the clock" },
    // Sempre attive: è contenuto di persona, non una lente professionale.
    tags: "tech creative human management",
    openForModes: [],
    refs: [
      { exp: 8 }, // Presentatore & Live Host
      { proj: 3 }, // Film "Double"
      { proj: 7 }, // Veni Vidi Vinyl
      { proj: 9 }, // Poesia premiata
      { exp: 15 }, // B-Teatro — attore e improvvisazione
      { exp: 14 }, // None Teatro — insegnante di impro
      { exp: 18 }, // Starbucks — Londra
      { exp: 16 }, // Bestar Hotel — Tulum
      { exp: 19 }, // Sogni Animazione — Zanzibar
      { exp: 13 }, // Mondadori
    ],
  },
];

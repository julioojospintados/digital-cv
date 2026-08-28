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
 * Il cluster `personal` non è legato a nessun mode: mostra la persona fuori
 * dal contesto lavorativo, ed è attivo in tutte e tre le lenti. Dal
 * 2026-08-27 lo rende di nuovo una pagina — la sezione "Fuori orario" in
 * fondo a CvLensPage, chiusa di default. Per un anno era rimasto nei dati
 * senza che niente lo leggesse: è il motivo per cui i suoi tre riferimenti
 * ai progetti erano sfasati e nessuno se n'era accorto (vedi l'avviso su
 * PROJ_CARD_META). UCI Cinemas (17) e Caveja (21) restano in cv.ts ma fuori
 * da ogni cluster (scelta del 2026-07-15).
 */

import type { Locale, Mode } from "./cv-i18n";

export type ClusterMode = Mode;

/**
 * Testo declinato per lingua. Tipizzato su `Locale`, non su `{ it, en }`:
 * aggiungendo una lingua a `Locale` il compilatore segnala ogni voce da
 * tradurre invece di lasciarla passare in silenzio.
 */
type Localized = Record<Locale, string>;

export type ClusterRef = { exp: number; facet?: ClusterMode } | { proj: number };

export interface ExpClusterDef {
  /**
   * `method` e `personal` non sono lenti: sono raggruppamenti di contenuto
   * che restano visibili in tutte. Il primo è nato quando il mode
   * "management" è stato rimosso (2026-08-16) e le sue esperienze andavano
   * comunque tenute nel CV.
   */
  key: ClusterMode | "personal" | "method";
  labels: Localized;
  /** data-tags delle card del cluster (stato active/passive per mode) */
  tags: string;
  openForModes: string[];
  refs: ClusterRef[];
}

/**
 * Metadati di presentazione per i progetti mostrati come card esperienza
 * nel cluster personale (il tipo Project non ha ruolo né durata).
 * Chiave = indice in cvData.projects.
 *
 * ⚠️ Queste chiavi sono INDICI POSIZIONALI, e un indice posizionale si rompe
 * in silenzio. È già successo: le tre voci erano su 3, 7 e 9, e qualcuno ha
 * inserito "Music Agency" in posizione 3 spostando di uno tutto il resto.
 * Da quel momento la chiave 3 puntava a Music Agency invece che al film
 * "Double", la 7 al Square Festival invece che a Veni Vidi Vinyl, la 9 al
 * Salone del Libro invece che alla poesia. Nessuno se n'è accorto perché il
 * cluster `personal` non era reso da nessuna pagina — l'errore aspettava il
 * giorno in cui qualcuno lo riaccendeva. Corretto il 2026-08-27 (3→4, 7→8,
 * 9→10) insieme ai refs qui sotto, che avevano lo stesso sfasamento.
 *
 * Il controllo che impedisce il bis è in cv-view-model.test.ts: verifica per
 * NOME che ogni chiave punti al progetto giusto. Se sposti un progetto in
 * cvData.projects, quel test cade prima del push invece che in produzione.
 */
export const PROJ_CARD_META: Record<
  number,
  {
    role: Localized;
    startYear?: string;
    endYear?: string;
    location?: Localized;
  }
> = {
  // Film "Double" — prodotto a Torino da Filmine, proiettato a San Francisco
  4: {
    role: {
      it: "Attore deuteragonista, produzione Filmine",
      en: "Deuteragonist actor, produced by Filmine",
    },
    startYear: "2022",
    endYear: "2022",
    location: { it: "Torino · San Francisco", en: "Turin · San Francisco" },
  },
  // Veni Vidi Vinyl
  8: {
    role: { it: "Co-ideatore della serata", en: "Co-creator of the night" },
    startYear: "2017",
    endYear: "2018",
    location: { it: "Torino", en: "Turin" },
  },
  // Poesia  — nessuna data singola: la card nasconde l'intervallo
  10: {
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
      // Corriere di Chieri (exp 10) stava qui fino al 2026-08-28: e' un
      // lavoro di scrittura giornalistica, non di design, e senza un
      // `facet` che lo riformulasse la sua descrizione base — cronaca
      // locale, scadenze settimanali — finiva letta dentro "Esperienza —
      // Design & UX" senza dire niente di design. Resta nella cronologia
      // completa (lane "design" = "Design e comunicazione" in
      // exp-lanes.ts, che e' un'etichetta piu' larga apposta) e non e'
      // referenziata da nessun altro cluster: e' lo stesso trattamento gia'
      // dato a UCI Cinemas e Caveja, fuori da ogni cluster per scelta.
    ],
  },
  {
    // Il mode "management" non esiste più (2026-08-16): questo cluster però
    // NON è stato rimosso con lui, perché due esperienze vivono solo qui —
    // Artiversum (exp 11) e Metamorfosi (exp 20). Cancellarlo avrebbe tolto
    // due lavori dal CV per rimuovere una lente.
    //
    // Sganciato dal mode invece che eliminato, con lo stesso schema già usato
    // dal cluster "personal" più sotto: attivo in tutte le lenti,
    // `openForModes` vuoto perché non è più la vista privilegiata di nessuno.
    // I `facet: "management"` sono caduti insieme al mode, quindi i tre
    // riferimenti tornano alla descrizione base dell'esperienza.
    key: "method",
    labels: { it: "Metodo & Gestione", en: "Method & Management" },
    tags: "tech creative human",
    openForModes: [],
    refs: [
      { exp: 2 }, // ALTEN — Tech Lead & Scrum Master
      { exp: 0 }, // Progetto Interno — referente unico
      { exp: 3 }, // Music Agency — tour manager
      { exp: 11 }, // Artiversum — Square Festival
      { exp: 20 }, // Metamorfosi — coordinamento team
    ],
  },
  {
    key: "human",
    // Stesso nome dell'etichetta di lente in cv-i18n.ts, e non per pigrizia:
    // il titolo di questa sezione e la pastiglia in testata parlano della
    // stessa cosa, e due nomi diversi si leggono come due cose diverse.
    labels: { it: "Comunicazione & AI", en: "Communication & AI" },
    tags: "human",
    openForModes: ["human"],
    refs: [
      { exp: 0, facet: "human" }, // Progetto Interno — layer MCP
      { exp: 1, facet: "human" }, // Digital CV — AI workflow
      // ALTEN entra in questa lente il 2026-08-26. Aveva il solo facet
      // `creative` (il design system di Aruba), quindi su /ai il datore di
      // lavoro attuale — l'esperienza più lunga del CV — semplicemente non
      // compariva. Terza e non prima: davanti restano i due progetti nati
      // AI-native, che su questa lente sono la prova più forte.
      { exp: 2, facet: "human" }, // ALTEN — pair programming e agenti
      { exp: 22, facet: "human" }, // Bambagia — MCP Figma/Wix
      { exp: 3, facet: "human" }, // Music Agency — digital strategy
      { exp: 7 }, // Satispay
    ],
  },
  {
    key: "personal",
    labels: { it: "Fuori orario", en: "Off the clock" },
    // Sempre attive: è contenuto di persona, non una lente professionale.
    tags: "tech creative human",
    openForModes: [],
    refs: [
      { exp: 8 }, // Presentatore & Live Host
      { proj: 4 }, // Film "Double" — era 3, vedi l'avviso su PROJ_CARD_META
      { proj: 8 }, // Veni Vidi Vinyl — era 7
      { proj: 10 }, // Poesia — era 9
      { exp: 23 }, // B-Teatro — attore e improvvisatore (2013–2019)
      { exp: 15 }, // B-Teatro — tecnico audio-visivo (2014–2018)
      { exp: 14 }, // None Teatro — insegnante di impro
      { exp: 18 }, // Starbucks — Londra
      { exp: 16 }, // Bestar Hotel — Tulum
      { exp: 19 }, // Sogni Animazione — Zanzibar
      { exp: 13 }, // Mondadori
    ],
  },
];

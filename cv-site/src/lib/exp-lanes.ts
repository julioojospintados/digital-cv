/**
 * exp-lanes.ts — le tre corsie della cronologia.
 *
 * "Tutti i ruoli" esiste per provare date, traiettoria e assenza di buchi, e
 * lo faceva con ventiquattro righe di testo: il lettore doveva fare
 * l'aritmetica da solo, e non la faceva. I numeri veri dicono un'altra cosa,
 * che quell'elenco non riusciva a far vedere: dal 2009 non c'è mai stato meno
 * di tre ruoli in parallelo, con un picco di otto fra il 2017 e il 2018.
 *
 * Le corsie sono tre e non quattro. L'oro di "Comunicazione & AI" non ne ha una
 * perché non è un periodo: è un modo di lavorare che attraversa gli altri due,
 * e sulle schede lo dice già il badge AI. Metterlo qui lo farebbe leggere come
 * una fase iniziata nel 2025, che è falso.
 *
 * ⚠️ Questa è l'unica parte del sito dove **due accenti si accendono
 * insieme**. Ovunque altrove la lente ne accende uno solo (vedi DESIGN.md).
 * Qui il ciano e l'arancio distinguono due mestieri, non due lenti, e la terza
 * corsia resta in inchiostro muto proprio per non sembrare una terza lente.
 * È un'eccezione voluta: se un giorno sembrerà una svista, è scritta qui.
 */

import type { Locale } from "./cv-i18n";

export type LaneKey = "tech" | "design" | "off";

export interface LaneDef {
  key: LaneKey;
  labels: Record<Locale, string>;
}

/** Ordine di stampa: i due mestieri in alto, il resto sotto. */
export const LANE_DEFS: readonly LaneDef[] = [
  { key: "tech", labels: { it: "Sviluppo software", en: "Software development" } },
  { key: "design", labels: { it: "Design e comunicazione", en: "Design and communication" } },
  { key: "off", labels: { it: "Fuori orario", en: "Off the clock" } },
];

/**
 * Una voce per ogni elemento di `cv.ts` → `experience`, **nello stesso
 * ordine**. Come SOFT_MODE_TAGS in cv-view-model.ts: un array parallelo, non
 * un campo nei dati, perché la corsia è una scelta di racconto di questa
 * pagina e non un fatto del lavoro. `cv.en.ts` ha lo stesso ordine (lo
 * verificano i test di parità), quindi vale per entrambe le lingue.
 *
 * Un ruolo sta in una corsia sola: qui conta dove il lettore lo cercherebbe,
 * non quante etichette gli si possono attaccare.
 */
export const EXP_LANES: readonly LaneKey[] = [
  "tech", // 0  Progetto Interno — gestionale
  "tech", // 1  Digital CV
  "tech", // 2  ALTEN Italia
  "design", // 3  Music Agency
  "design", // 4  Freelance — videomaker
  "tech", // 5  Forge Lab
  "tech", // 6  Consoft
  "tech", // 7  Satispay
  "design", // 8  Festival ed eventi — presentatore
  "design", // 9  Freelance — fotografo
  "design", // 10 Corriere di Chieri
  "off", // 11 Artiversum
  "design", // 12 FreeGinevro — grafico
  "off", // 13 Gruppo Mondadori
  "off", // 14 None Teatro
  "off", // 15 B-Teatro — tecnico
  "off", // 16 Bestar Hotel
  "off", // 17 UCI Cinemas
  "off", // 18 Starbucks
  "off", // 19 Sogni Animazione
  "off", // 20 Metamorfosi
  "off", // 21 Caveja
  "design", // 22 Bambagia Design Lab
  "off", // 23 B-Teatro — attore
];

/** Il mese in frazione d'anno: 2019-07 → 2019.5. */
export function isoToYear(iso: string, fine = false): number {
  const [y, m] = iso.split("-");
  const mese = m ? parseInt(m, 10) : 1;
  return parseInt(y, 10) + (fine ? mese : mese - 1) / 12;
}

/**
 * Gli intervalli di una corsia, uniti. Serve alla barra riassuntiva della
 * corsia chiusa: una barra sola dal primo all'ultimo giorno salterebbe i
 * buchi veri, che è esattamente il dato che questa sezione deve provare.
 */
export function mergeSpans(spans: readonly (readonly [number, number])[]): [number, number][] {
  const out: [number, number][] = [];
  for (const [da, a] of [...spans].sort((x, y) => x[0] - y[0])) {
    const ultimo = out[out.length - 1];
    // Meno di un mese di stacco non è un buco, è come si scrivono le date.
    if (ultimo && da <= ultimo[1] + 1 / 12) {
      ultimo[1] = Math.max(ultimo[1], a);
    } else {
      out.push([da, a]);
    }
  }
  return out;
}

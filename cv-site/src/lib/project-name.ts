/**
 * project-name.ts — spezza il nome di un progetto nelle sue due parti.
 *
 * In `cv.ts` i quattro case study hanno un nome solo, che però ne contiene
 * due: `"Trip-Runway — Travel Budget Yield App"`. La prima parte è il nome
 * del progetto, la seconda dice che cos'è. Fino al 2026-09-02 uscivano
 * insieme su una riga sola, sotto un occhiello che diceva "CASE STUDY" —
 * cioè la cosa che il visitatore aveva già capito, visto che stava
 * guardando l'indice dei case study.
 *
 * Adesso l'occhiello non c'è più e le due parti stanno su due righe, così
 * la prima riga è il nome e basta. Richiesta di Giulio, e regge da sola:
 * su una card il nome è ciò che si cerca con gli occhi, e affiancargli un
 * sottotitolo con un trattino in mezzo lo allunga fino a farlo sparire.
 *
 * ── Perché si spezza qui e non nei dati ──────────────────────────────
 * Aggiungere un campo `tagline` a `Project` avrebbe voluto dire cambiare
 * l'interfaccia, quindi anche `cv.en.ts`, e soprattutto i tre generatori
 * di PDF che leggono `name` e si aspettano la stringa intera. Il separatore
 * è già un elemento strutturale dichiarato del progetto: `writing-style.md`
 * ammette il trattungo lungo come separatore NON discorsivo, e lo stesso
 * `cv.ts` lo usa già così nel prefisso `"Ricerca — "` degli step di
 * processo, che è parsato dal codice di `/work/[slug]`. Questo è lo stesso
 * meccanismo, applicato al nome.
 *
 * Il separatore è il trattungo lungo con gli spazi (` — `), non un trattino
 * qualunque: `"Trip-Runway"` ne ha uno corto dentro, e spezzare su quello
 * darebbe `"Trip"` e `"Runway"`.
 */

/** Il separatore usato in `cv.ts` fra nome e descrittore. */
const SEP = " — ";

export interface NomeProgetto {
  /** Il nome vero e proprio: "Trip-Runway", "Digital CV". */
  readonly nome: string;
  /** Che cosa è, quando il nome lo dichiara: "Travel Budget Yield App".
   *  `null` per un progetto il cui nome non porta un descrittore. */
  readonly descrittore: string | null;
}

/**
 * Un nome senza separatore torna intero, con `descrittore` a `null`: i
 * progetti minori di `cv.ts` sono così, e la card deve reggerli senza
 * inventare una seconda riga vuota.
 *
 * Si divide alla PRIMA occorrenza: se un descrittore contenesse a sua volta
 * un trattungo, resta tutto nella seconda parte invece di perdersi.
 */
export function splitProjectName(name: string): NomeProgetto {
  const i = name.indexOf(SEP);
  if (i < 0) return { nome: name.trim(), descrittore: null };
  return {
    nome: name.slice(0, i).trim(),
    descrittore: name.slice(i + SEP.length).trim() || null,
  };
}

/**
 * La sigla che va in filigrana sulla card dell'indice, dietro al testo.
 *
 * Si CALCOLA dal nome, non si scrive nei dati, ed è la risposta all'unica
 * obiezione seria a questa soluzione: se le sigle andassero inventate,
 * qualcuno dovrebbe deciderle e poi mantenerle allineate al nome. Così no.
 * Un progetto nuovo ha la sua sigla il giorno in cui entra in `cv.ts`.
 *
 * La regola è la prima lettera di ogni parola del NOME (non del descrittore),
 * al massimo due. Le parole si separano su spazi e trattini corti, perché
 * "Trip-Runway" è due parole scritte attaccate:
 *
 *   Digital CV — Progetto Open Source…   →  DC
 *   Trip-Runway — Travel Budget…         →  TR
 *   Product Discovery — UX Research…     →  PD
 *   Music Agency — Tour Management…      →  MA
 *
 * Due lettere e non tre: la sigla è un appiglio per l'occhio, non una parola
 * da leggere, e a tre caratteri comincia a competere col nome vero che le sta
 * davanti. Un nome di una parola sola dà una sigla di una lettera, ed è
 * corretto: meglio una lettera onesta che due inventate.
 *
 * Resta un limite noto, e non è risolvibile qui: due progetti che iniziassero
 * con le stesse due lettere avrebbero la stessa sigla e tornerebbero a
 * somigliarsi. Oggi i quattro case study sono distinti; se un giorno non lo
 * fossero, la cura è cambiare il nome del progetto, non la regola.
 */
export function projectInitials(name: string): string {
  const { nome } = splitProjectName(name);
  return nome
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

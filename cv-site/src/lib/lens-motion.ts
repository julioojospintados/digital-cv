/**
 * lens-motion.ts — le manopole della transizione fra l'ingresso e le lenti.
 *
 * Qui non c'è nessuna animazione: ci sono i **numeri**, in un posto solo, con
 * scritto accanto cosa succede se li si muove. Il codice che li usa sta in tre
 * punti e nessuno di quei tre contiene una costante:
 *
 *   - `CvLensPage.astro`, script inline di testa — legge la distanza percorsa e
 *     scrive `--vt-object` prima che il browser costruisca le animazioni della
 *     view transition (dopo sarebbe tardi: le durate sono già decise). È anche
 *     l'unico posto dove sta la formula che lega distanza e durata, e il
 *     motivo per cui non sta qui è di ordine, non di gusto: quello script gira
 *     prima che qualunque modulo sia stato caricato, quindi non può importare;
 *   - `scripts/lens-arrival.ts` — corregge l'atterraggio dell'oggetto;
 *   - `styles/global.css` — i valori di partenza, per quando JavaScript non c'è.
 *
 * ⚠️ I valori di riposo in `global.css` (`--vt-fade`, `--vt-object`) devono
 * restare allineati a `fade` e alla media di `objectNear`/`objectFar`: sono la
 * stessa transizione vista da chi non esegue script.
 */

/** Dove l'ingresso lascia detto da dove partiva l'oggetto. */
export const LENS_HANDOFF_KEY = "lens:handoff";

/**
 * Oltre questo tempo la consegna è scaduta: si è tornati indietro col
 * pulsante del browser, o si è aperta la lente da un link diretto in una
 * scheda rimasta aperta da ieri. In quel caso la distanza non significa
 * niente e si usa la durata di riposo.
 */
export const LENS_HANDOFF_TTL = 5000;

export const LENS_MOTION = {
  /**
   * Quanto ci mette la pagina nuova a coprire quella vecchia.
   *
   * È **la** manopola della dissolvenza. Le due schermate condividono lo
   * stesso ottanio, quindi di questa dissolvenza si vede una cosa sola: i due
   * testi sovrapposti. Più è lunga, più a lungo si leggono insieme — che è
   * esattamente ciò che si percepisce come sfarfallio. A 220ms con una curva
   * che sale presto la finestra in cui sono entrambi leggibili è di ~80ms.
   * Sopra i 400ms il difetto torna.
   */
  fade: 220,

  /**
   * Durata del volo dell'oggetto quando parte da vicino — le sezioni che
   * hanno già l'oggetto a destra, dalla stessa parte in cui atterra.
   */
  objectNear: 420,

  /**
   * Durata del volo quando parte dalla parte opposta dello schermo. Le
   * sezioni alternano l'oggetto a sinistra e a destra (`lab-home.css`
   * § Desktop), e chi parte da sinistra ha quasi tutta la larghezza da
   * attraversare: a durata fissa i due voli hanno velocità molto diverse, e
   * quello lungo sembra scattoso mentre quello corto sembra pigro.
   */
  objectFar: 700,

  /** Sotto questa distanza (px percorsi dal centro dell'oggetto) vale `objectNear`. */
  distNear: 260,

  /** Sopra questa distanza vale `objectFar`. In mezzo si interpola. */
  distFar: 1100,

  /**
   * Curva del volo. Parte decisa e si posa: è un oggetto che viene raccolto e
   * appoggiato, non un pannello che scorre.
   */
  easeObject: "cubic-bezier(0.32, 0.72, 0, 1)",

  /** Curva della dissolvenza: sale presto, così i due testi si incrociano poco. */
  easeFade: "cubic-bezier(0.23, 1, 0.32, 1)",
} as const;

/**
 * lens-arrival.ts — l'oggetto arriva dove si ferma davvero, non dove il
 * browser credeva che si sarebbe fermato.
 *
 * ── Il difetto, misurato ─────────────────────────────────────────────────
 * Una view transition congela il fotogramma finale **una volta sola**, al
 * primo disegno della pagina nuova. Da quel momento anima verso quel punto e
 * non lo rivede più. Ma la pagina di arrivo, nei suoi primi 150 millisecondi,
 * si muove ancora — e non per un difetto: perché è viva.
 *
 * Misurato il 2026-08-27 su `/design`, finestra 1440×900, oggetto `.lc-obj`:
 *
 *   dt 15ms   y 200.0   la deriva allo scroll (`lc-float`) non è ancora
 *                        risolta: `transform: none`
 *   dt 25ms   y 193.4   si applica, −6.6px
 *   dt ~98ms  y 182.1   arriva Lexend, `.lc-now__what` passa da due righe a
 *                        una, l'intestazione si accorcia di 21.6px e
 *                        l'oggetto — centrato in quella riga di griglia —
 *                        sale di altri 11.2
 *
 * Il fotogramma finale registrato dal browser diceva y ≈ 194.5. Il posto vero
 * è 182.15. Per mezzo secondo l'oggetto vola verso un bersaglio che si è
 * spostato dopo un decimo di secondo, e quando la pseudo-elemento sparisce
 * l'immagine salta di dodici pixel. È il salto che si legge come "non è
 * fluida": non la curva, la destinazione.
 *
 * ── La cura ──────────────────────────────────────────────────────────────
 * Invece di inseguire le singole cause (i webfont, la deriva, le chip che si
 * richiudono — e domani qualcos'altro), si guarda il risultato: si misura
 * dov'è l'oggetto quando la pagina smette di muoversi, si calcola di quanto
 * il bersaglio si è spostato, e si somma quello scarto al gruppo con il tempo
 * che resta. `translate` e non `transform`: sono due proprietà distinte e si
 * compongono, quindi la correzione si aggiunge al morph del browser invece di
 * sostituirlo.
 *
 * La correzione va in `linear`: parte a metà del volo, e una curva che
 * riaccelera si sentirebbe come un secondo movimento. Uno scarto di dodici
 * pixel distribuito linearmente sul tempo rimasto non si vede — è esattamente
 * il punto.
 *
 * Se qualcosa non c'è (niente transizione, niente oggetto, un browser senza
 * `pseudoElement` in `animate`), non succede niente e resta il comportamento
 * di prima. Nessun ramo di questo file può rompere la pagina.
 */

const GROUP = "::view-transition-group(lens-object)";

/** Sotto questa soglia lo scarto è rumore di arrotondamento, non un salto. */
const SOGLIA = 0.5;

/**
 * Per quanti fotogrammi di fila la posizione deve restare ferma prima di
 * dichiarare che il layout si è assestato. Tre e non uno: fra l'arrivo del
 * webfont e il riflusso che ne consegue passa un fotogramma, e con uno solo
 * si misurerebbe la posizione intermedia.
 */
const FERMI = 3;

type LensReveal = {
  transition: ViewTransition | null;
  /** `performance.now()` all'inizio del volo — misurato dallo script inline. */
  at?: number;
  /** Dov'era l'oggetto quando il browser ha congelato il fotogramma finale. */
  previsto?: { x: number; y: number };
};

declare global {
  interface Window {
    /** Depositato dallo script inline in testa a CvLensPage.astro. */
    __lensReveal?: LensReveal;
  }
}

function correggiAtterraggio(stato: LensReveal, vt: ViewTransition, obj: HTMLElement): void {
  void vt.ready
    .then(() => {
      // Non `performance.now()` e non una misura presa qui: questo modulo è
      // differito e può girare a pagina già assestata, dove lo scarto è
      // sparito dentro la posizione finale. I due valori arrivano dallo script
      // inline di testa, che era in esecuzione quando il volo è cominciato.
      const partenza = stato.at;
      const previsto = stato.previsto;
      if (partenza === undefined || previsto === undefined) return;

      // La durata la decide il gruppo, che a questo punto esiste già: si legge
      // da lì invece di ricalcolarla, così la correzione finisce insieme al
      // volo anche se qualcuno cambia i numeri in lens-motion.ts.
      const gruppo = document
        .getAnimations()
        .find((a) => a.effect instanceof KeyframeEffect && a.effect.pseudoElement === GROUP);
      const totale = Number(gruppo?.effect?.getComputedTiming().duration) || 0;
      if (!totale) return;

      let ultimo = obj.getBoundingClientRect();
      let fermi = 0;

      const applica = (vero: DOMRect) => {
        const dx = vero.x - previsto.x;
        const dy = vero.y - previsto.y;
        if (Math.abs(dx) < SOGLIA && Math.abs(dy) < SOGLIA) return;

        // Un margine di un fotogramma: una correzione che finisce insieme
        // alla transizione rischia di non essere mai disegnata.
        const resta = totale - (performance.now() - partenza) - 16;
        if (resta <= 0) return;

        document.documentElement.animate([{ translate: "0 0" }, { translate: `${dx}px ${dy}px` }], {
          duration: resta,
          easing: "linear",
          fill: "both",
          pseudoElement: GROUP,
        });
      };

      const guarda = () => {
        const ora = obj.getBoundingClientRect();
        fermi =
          Math.abs(ora.x - ultimo.x) < SOGLIA && Math.abs(ora.y - ultimo.y) < SOGLIA
            ? fermi + 1
            : 0;
        ultimo = ora;

        // Oltre la fine del volo non c'è più niente da correggere: quello che
        // si muove dopo si muove a transizione finita, e lì è la pagina vera.
        if (fermi >= FERMI || performance.now() - partenza >= totale) {
          applica(ora);
          return;
        }
        requestAnimationFrame(guarda);
      };

      requestAnimationFrame(guarda);
    })
    .catch(() => {
      // `ready` viene rifiutata se la transizione viene saltata: non è un
      // errore, è la pagina che è arrivata senza volo.
    });
}

export function initLensArrival(): void {
  // Speculare alla guardia in lens-transition.ts: a movimento ridotto non
  // c'è nessun oggetto che attraversa, quindi non c'è nessun atterraggio da
  // correggere.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // `pagereveal` scatta prima che i moduli differiti abbiano girato: chi lo
  // ascolta è lo script inline in testa, che lo deposita qui. Se non c'è —
  // pagina aperta senza transizione, o script inline non eseguito — non c'è
  // niente da fare.
  const stato = window.__lensReveal;
  const vt = stato?.transition;
  if (!stato || !vt) return;

  const obj = document.querySelector<HTMLElement>(".lc-obj__img");
  if (!obj) return;

  // `animate` con `pseudoElement` è ciò che rende possibile tutto questo: se
  // il browser non lo supporta, meglio accorgersene qui che a metà volo.
  if (typeof document.documentElement.animate !== "function") return;

  correggiAtterraggio(stato, vt, obj);
}

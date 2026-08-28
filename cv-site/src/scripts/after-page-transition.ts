/**
 * after-page-transition.ts — rimanda un lavoro pesante a transizione finita.
 *
 * Il difetto che questo file esiste per chiudere, misurato con Playwright
 * sulla build vera (Chromium con GPU, 1440x900, traccia `devtools.timeline`):
 * arrivando su una lente dalla home, la transizione parte **mentre la pagina
 * di arrivo sta ancora nascendo**. Nella traccia, dentro il mezzo secondo del
 * passaggio, cadevano un Layout da 57,6ms, un altro da 26,8ms, un Paint da
 * 32,9ms e la valutazione di un modulo da 36,2ms. Un fotogramma dura 16,7ms:
 * ognuno di quei numeri e' due, tre, quattro fotogrammi che non vengono
 * disegnati. L'oggetto in volo restava fermo per i primi ~300ms e poi
 * attraversava lo schermo in due scatti — che e' precisamente il "non e'
 * fluida" di chi guarda.
 *
 * Gli script differiti (`<script>` in Astro) non bloccano il primo disegno:
 * il browser puo' rivelare la pagina, e quindi avviare la transizione, prima
 * che siano stati eseguiti. Nessuno lo sta facendo apposta — e' l'ordine di
 * serie. Qui si rimette l'ordine giusto: prima il passaggio, poi il resto.
 *
 * Cosa NON va messo qui dentro: qualsiasi cosa cambi il layout o l'aspetto
 * della pagina. Rimandata, si vedrebbe scattare *dopo* l'atterraggio, che e'
 * un difetto peggiore di quello che si sta togliendo. Qui ci stanno solo i
 * comportamenti — scorrimento morbido, cursore, ticker — che nei primi tre
 * decimi di secondo nessuno usa perche' sta ancora guardando.
 */

/** Le animazioni della transizione di pagina, se ce n'e' una in corso. */
const inVolo = (): Animation[] =>
  document.getAnimations().filter((a) => a.effect?.pseudoElement?.startsWith("::view-transition"));

/**
 * Rete di sicurezza. `finished` di una transizione puo' non risolversi mai —
 * scheda nascosta, navigazione interrotta a meta' — e in quel caso senza un
 * tetto lo scorrimento morbido non partirebbe piu' per il resto della visita.
 * Un secondo e' il triplo abbondante della transizione piu' lunga.
 */
const TETTO_MS = 1000;

const attendi = (animazioni: Animation[], fn: () => void): void => {
  void Promise.race([
    Promise.allSettled(animazioni.map((a) => a.finished)),
    new Promise((r) => setTimeout(r, TETTO_MS)),
  ]).then(fn);
};

/**
 * Esegue `fn` quando la transizione di pagina e' finita — subito, se non ce
 * n'e' nessuna.
 *
 * Il controllo e' in due tempi apposta: questo modulo puo' essere valutato
 * prima o dopo che la transizione sia cominciata, e i due casi hanno risposte
 * diverse. Se e' gia' in corso la si aspetta; se non c'e' ancora nulla si
 * riguarda al primo fotogramma, che e' garantito cadere **dopo** il momento
 * in cui il browser rivela la pagina (e quindi dopo che le animazioni, se
 * devono esistere, esistono). Il costo del caso senza transizione e' un
 * fotogramma: 16,7ms prima di avviare uno scorrimento morbido che nessuno ha
 * ancora chiesto.
 */
export function afterPageTransition(fn: () => void): void {
  const ora = inVolo();
  if (ora.length) {
    attendi(ora, fn);
    return;
  }
  requestAnimationFrame(() => {
    const poi = inVolo();
    if (poi.length) attendi(poi, fn);
    else fn();
  });
}

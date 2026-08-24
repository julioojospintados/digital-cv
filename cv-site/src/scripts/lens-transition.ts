/**
 * lens-transition.ts — l'oggetto della lente attraversa fra le due pagine.
 *
 * La fotocamera che sta nella sezione "design" della home è la stessa che
 * accoglie su `/design` — laptop per tech, bussola per ai. Dandole lo stesso
 * `view-transition-name` su entrambe le pagine, il browser le tratta come UN
 * elemento che cambia posizione e forma, invece di dissolvere due pagine
 * scorrelate. Fra due schermate che condividono lo stesso ottanio, una
 * dissolvenza non si vede: questa sì.
 *
 * L'aggancio è già acceso per tutto il sito — `@view-transition
 * { navigation: auto }` in global.css — e il morph lo calcola il browser.
 * Qui non c'è nessuna animazione: c'è solo chi decide *quando* quel nome
 * esiste.
 *
 * ⚠️ E il quando è tutto il punto. Il nome NON può stare nel CSS di questa
 * pagina: lo stesso oggetto compare in tre sezioni, e un nome fisso farebbe
 * leggere al browser qualunque navigazione come "stesso oggetto, nuova
 * posizione" — anche quelle che non c'entrano niente, con l'oggetto che vola
 * verso una posizione fuori schermo. Non è un'ipotesi: è il bug trovato il
 * 2026-07-27 sulla card del portfolio, raccontato per esteso nel commento di
 * `global.css` sopra `@view-transition`. Lì la cura fu la stessa — assegnare
 * al clic, e solo quando la destinazione è davvero quella giusta.
 *
 * Sulla pagina di arrivo invece il nome è statico (`.lc-obj__img` in
 * lab-cv.css), e lì è corretto: non c'è nessun clic da intercettare, il primo
 * fotogramma deve già averlo. È sicuro perché l'unica altra pagina che porta
 * quel nome è questa, e qui compare solo al clic.
 */

/** Lo stesso nome su entrambe le pagine: è ciò che le lega. */
const NAME = "lens-object";

export function initLensTransition(): void {
  // A movimento ridotto non si assegna niente: senza nome condiviso il
  // browser fa la sua transizione di default e nessun oggetto attraversa lo
  // schermo. Riduzione, non eliminazione — la pagina cambia comunque.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // Solo le CTA che portano a una lente. La gemella `--ghost` della sezione
  // design va a /work, dove quel nome non esiste: assegnarlo lì lascerebbe
  // l'oggetto in un morph che non ha una controparte.
  const ctas = document.querySelectorAll<HTMLAnchorElement>(".lh-cta:not(.lh-cta--ghost)");

  ctas.forEach((cta) => {
    cta.addEventListener("click", () => {
      const section = cta.closest<HTMLElement>(".lh-section");
      // `:not(.lh-obj__shadow)` — dentro il riquadro ci sono due immagini, la
      // sagoma annerita e quella vera. A viaggiare dev'essere la seconda: la
      // prima è un'ombra, e portarsela dietro come elemento a sé la farebbe
      // muovere per conto suo.
      const obj = section?.querySelector<HTMLElement>(
        ".lh-section__object img:not(.lh-obj__shadow)",
      );
      if (obj) obj.style.viewTransitionName = NAME;
    });
  });
}

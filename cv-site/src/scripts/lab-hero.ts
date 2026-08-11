/**
 * lab-hero.ts — parallasse della still-life del prototipo /lab/hero.
 *
 * Scrive due sole variabili CSS (--mx, --my, in −1…1) sullo stage; la
 * profondità del singolo oggetto è già nel CSS. Un rAF per l'intera scena
 * invece di una animazione per elemento, e nessuna dipendenza: GSAP qui
 * servirebbe solo per un lerp da quindici righe.
 *
 * Desktop: puntatore. Mobile: scroll (il giroscopio su iOS richiede un
 * permesso esplicito dopo un gesto — non vale il costo per un effetto
 * decorativo).
 */

// Alzato da 0.08 a 0.11 insieme all'ampiezza (--lh-par-x/y in lab-home.css):
// con una corsa più lunga lo stesso inseguimento lento diventa ritardo, non
// peso. Resta comunque sotto il "attaccato al mouse".
const LERP = 0.11; // quanto insegue il puntatore: basso = più pesante, più fisico
const EPS = 0.0005; // sotto questa soglia la scena è ferma e il loop si spegne

export function initLabHero(): void {
  const stage = document.querySelector<HTMLElement>("[data-lab-stage]");
  if (!stage) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let running = false;

  const clamp = (v: number) => Math.max(-1, Math.min(1, v));

  const frame = () => {
    currentX += (targetX - currentX) * LERP;
    currentY += (targetY - currentY) * LERP;

    stage.style.setProperty("--mx", currentX.toFixed(4));
    stage.style.setProperty("--my", currentY.toFixed(4));

    if (Math.abs(targetX - currentX) < EPS && Math.abs(targetY - currentY) < EPS) {
      running = false; // scena a riposo: niente rAF finché non si muove qualcosa
      return;
    }
    requestAnimationFrame(frame);
  };

  const kick = () => {
    if (running) return;
    running = true;
    requestAnimationFrame(frame);
  };

  // ── Puntatore (solo dispositivi che ne hanno uno fine) ──
  const finePointer = window.matchMedia("(pointer: fine)");

  const onPointerMove = (e: PointerEvent) => {
    targetX = clamp((e.clientX / window.innerWidth) * 2 - 1);
    targetY = clamp((e.clientY / window.innerHeight) * 2 - 1);
    kick();
  };

  // ── Scroll (mobile e tablet): la scena si inclina mentre l'hero esce ──
  const onScroll = () => {
    const scene = stage.parentElement;
    if (!scene) return;
    const rect = scene.getBoundingClientRect();
    const progress = (rect.top + rect.height / 2) / window.innerHeight; // 1 → 0 uscendo
    targetY = clamp((progress - 0.5) * -1.4);
    targetX = clamp((progress - 0.5) * 0.5);
    kick();
  };

  // Sotto questa soglia gli oggetti dell'ingresso non sono più sparsi: stanno
  // in griglia (vedi lab-home.css § Mobile) e il CSS azzera la loro
  // trasformazione. Scrivere --mx/--my lì non muove niente — sarebbe un rAF
  // per fotogramma a ogni scroll, sul dispositivo che meno se lo può
  // permettere. La soglia è la stessa della media query: se cambia una, va
  // cambiata l'altra.
  const gridLayout = window.matchMedia("(max-width: 55.99rem)");

  const bind = () => {
    if (gridLayout.matches) {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
      stage.style.removeProperty("--mx");
      stage.style.removeProperty("--my");
      return;
    }
    if (finePointer.matches) {
      window.removeEventListener("scroll", onScroll);
      window.addEventListener("pointermove", onPointerMove, { passive: true });
    } else {
      window.removeEventListener("pointermove", onPointerMove);
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
  };

  bind();
  finePointer.addEventListener("change", bind);
  gridLayout.addEventListener("change", bind);
}

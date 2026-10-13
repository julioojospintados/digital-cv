// ── La profondità di una pila di schede sticky ───────────────────────────
// La usano la home (le sezioni IO, WD, SD, AI) e l'indice di /work (le card
// dei case study): stessa pila sfalsata, stesso modo di andare in fondo.
// Scelta di Giulio il 2026-10-13, fra dodici alternative messe a confronto:
// niente ombra sopra la scheda che arriva (si leggeva come una macchia), la
// profondità la dà la scheda coperta che va fuori fuoco e si spegne.
//
// Quanto una scheda è coperta si ricava dalle posizioni VERE, quelle che
// rende il browser: per due schede sticky, la distanza fra la cima della
// successiva e la cima di questa dice esattamente quanta parte ne resta in
// vista. Niente ScrollTrigger, niente posizioni nel flusso da tenere
// allineate: è la geometria che si vede.
//
// Senza JavaScript non succede niente di rotto: la pila resta, solo senza
// sfocatura. Il filtro si scrive solo quando serve e si toglie a zero,
// perché un filter: blur(0) su un elemento a tutto schermo costa comunque
// un livello di composizione.

interface StackDepthOptions {
  /** Sfocatura massima della scheda del tutto coperta, in px. */
  blur?: number;
  /** Quanto si spegne la scheda del tutto coperta, da 0 a 1. */
  dim?: number;
}

const clamp = (v: number) => Math.max(0, Math.min(1, v));

export function initStackDepth(
  cards: HTMLElement[],
  { blur = 6, dim = 0.3 }: StackDepthOptions = {},
): void {
  const list = cards.filter((c) => c.getClientRects().length);
  if (list.length < 2) return;

  let raf = 0;
  const paint = () => {
    raf = 0;
    for (let i = 0; i < list.length - 1; i++) {
      const cur = list[i].getBoundingClientRect();
      const next = list[i + 1].getBoundingClientRect();
      // In vista resta la striscia fra la cima di questa e quella della
      // successiva. Coperta del tutto quando ne resta solo il gradino.
      const covered = clamp((cur.height - (next.top - cur.top)) / (cur.height * 0.9));
      list[i].style.filter =
        covered > 0.01
          ? `blur(${(covered * blur).toFixed(2)}px) brightness(${(1 - covered * dim).toFixed(3)})`
          : "";
    }
  };
  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(paint);
  };

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  paint();
}

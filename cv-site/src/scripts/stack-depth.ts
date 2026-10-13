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
// sfocatura.
//
// Ogni scheda tiene `will-change: filter` per tutta la vita della pagina, e
// non è una pignoleria di prestazioni: è la correzione di un difetto visto
// su telefono il 2026-10-13. Il filtro si accende nell'istante in cui la
// scheda successiva entra dal fondo, e accenderlo su un elemento a tutto
// schermo che non aveva un livello suo obbliga il browser a crearne uno e a
// ridisegnarlo da capo, mentre lo scroll corre. Per qualche fotogramma si
// vedevano pezzi non ancora ridisegnati: l'oggetto della scheda tagliato a
// metà da una riga orizzontale. Con il livello già pronto, cambiare il
// filtro è lavoro del compositore e non tocca il disegno. Il costo è un
// livello per scheda: sono quattro o cinque, e il browser tiene in memoria
// solo le parti vicine alla finestra.

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

  for (const card of list) card.style.willChange = "filter";

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

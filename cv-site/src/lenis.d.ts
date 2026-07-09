// Tipo globale per Lenis — evita `(window as any).__lenis` ovunque nel codice.
// L'istanza viene creata in Layout.astro (tutte le pagine) e esposta su
// window per i page scripts. Opzionale solo perché lo script che la crea
// gira in un modulo separato — nel dubbio i chiamanti verificano `if (lenis)`.
import type Lenis from 'lenis';

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

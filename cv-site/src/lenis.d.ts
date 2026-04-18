// Tipo globale per Lenis — evita `(window as any).__lenis` ovunque nel codice.
// L'istanza viene creata in Layout.astro e esposta su window per i page scripts.
import type Lenis from 'lenis';

declare global {
  interface Window {
    __lenis: Lenis;
  }
}

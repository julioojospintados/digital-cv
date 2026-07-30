// Gate di consenso analytics — tipi globali per gli hook esposti su window.
//
// L'inizializzatore vive nello script is:inline di Layout.astro (PostHog):
// è definito là perché deve girare come snippet raw non bundlato, e il
// banner (ConsentBanner.astro) lo richiama al click su "Accetta". Non
// essendoci un import diretto, il collegamento passa da window —
// dichiararlo qui evita il cast `as any` da entrambe le parti.
//
// Opzionale per costruzione: in dev e nei preview Vercel il blocco analytics
// non viene emesso (import.meta.env.PROD), quindi la funzione non esiste e
// i chiamanti usano l'optional call `?.()`.
//
// Microsoft Clarity (stesso pattern, __cvInitClarity) è stato rimosso il
// 2026-07-30 — sostituito dalla notifica di engagement PostHog (vedi
// engagement-tracking.ts).
export {};

declare global {
  interface Window {
    /** Inizializza PostHog. Definito solo in build di produzione. */
    __cvInitPostHog?: () => void;
    /** Client PostHog: esiste solo dopo che __cvInitPostHog ha girato (consenso
     * concesso) — vedi engagement-tracking.ts, che lo chiama in modo opzionale
     * proprio per questo. */
    posthog?: {
      capture: (event: string, properties?: Record<string, unknown>) => void;
    };
  }
}

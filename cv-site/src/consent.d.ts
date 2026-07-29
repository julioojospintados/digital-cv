// Gate di consenso analytics — tipi globali per gli hook esposti su window.
//
// I due inizializzatori vivono negli script is:inline di Layout.astro (PostHog
// e Microsoft Clarity): sono definiti là perché devono girare come snippet raw
// non bundlati, e il banner (ConsentBanner.astro) li richiama al click su
// "Accetta". Non essendoci un import fra i due, il collegamento passa da
// window — dichiararlo qui evita il cast `as any` da entrambe le parti.
//
// Opzionali per costruzione: in dev e nei preview Vercel i blocchi analytics
// non vengono emessi (import.meta.env.PROD), quindi le funzioni non esistono e
// i chiamanti usano l'optional call `?.()`.
export {};

declare global {
  interface Window {
    /** Inizializza PostHog. Definito solo in build di produzione. */
    __cvInitPostHog?: () => void;
    /** Inietta lo snippet Microsoft Clarity. Definito solo in build di produzione. */
    __cvInitClarity?: () => void;
  }
}

/**
 * mode-helpers.ts
 * Funzioni pure legate al mode system — esportate per essere testabili.
 * Nessuna dipendenza da GSAP, ScrollTrigger o Lenis.
 */

/** Mappa mode → chiavi cluster che devono essere aperti (coerente con EXP_CLUSTER_DEFS in [mode].astro) */
export const CLUSTER_OPEN_FOR: Record<string, string[]> = {
  tech: ["tech"],
  creative: ["creative", "roots"],
  human: ["human", "roots"],
  management: ["tech", "human"],
};

/**
 * Apre i cluster corrispondenti al mode e chiude gli altri.
 * Aggiorna data-open e aria-expanded sugli header.
 */
export function applyAccordions(mode: string): void {
  const shouldOpen = new Set(CLUSTER_OPEN_FOR[mode] ?? ["tech"]);
  document.querySelectorAll<HTMLElement>(".exp-cluster").forEach((cluster) => {
    const key = cluster.dataset.cluster ?? "";
    const header = cluster.querySelector<HTMLElement>(".exp-cluster__header");
    if (shouldOpen.has(key)) {
      cluster.setAttribute("data-open", "");
      header?.setAttribute("aria-expanded", "true");
    } else {
      cluster.removeAttribute("data-open");
      header?.setAttribute("aria-expanded", "false");
    }
  });
}

/**
 * Imposta data-state="active"|"passive" su ogni .cv-card in base al mode.
 * Pura funzione DOM — non chiama GSAP né ScrollTrigger.
 */
export function applyCardStates(mode: string): void {
  document.querySelectorAll<HTMLElement>(".cv-card[data-tags]").forEach((card) => {
    const tags = card.dataset.tags?.split(" ") ?? [];
    card.dataset.state = tags.includes(mode) ? "active" : "passive";
  });
}

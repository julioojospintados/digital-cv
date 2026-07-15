/**
 * mode-helpers.ts
 * Funzioni pure legate al mode system — esportate per essere testabili.
 * Nessuna dipendenza da GSAP, ScrollTrigger o Lenis.
 */

/**
 * Mappa mode → chiavi cluster da aprire (coerente con lib/exp-clusters.ts).
 * Mapping 1:1 dal 2026-07-15: prima "human" apriva il vecchio cluster
 * "Facilitazione & Cultura" e "management" quelli degli altri — chi cliccava
 * "AI & Digital" atterrava su contenuti fuori tema. Il cluster "personal"
 * non appartiene a nessun mode: si apre dalla voce "Fuori orario" (cv-init).
 */
export const CLUSTER_OPEN_FOR: Record<string, string[]> = {
  tech: ["tech"],
  creative: ["creative"],
  human: ["human"],
  management: ["management"],
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

/**
 * Riordina le .skill-sq dentro .skills-grid: skill del mode attivo in cima,
 * poi per area (weight × spessore bordo/livello), poi alfabetico — stessa
 * identica logica del .sort() lato Astro in [mode].astro, ma eseguita
 * client-side. Il cambio mode dal dropdown non ricarica la pagina, quindi
 * senza questo il sort server-side non verrebbe mai rieseguito e le card
 * del nuovo mode non salirebbero in cima finché non si ricarica.
 * Pura funzione DOM — non chiama GSAP né ScrollTrigger (l'eventuale
 * animazione del movimento è responsabilità del chiamante, in cv-init.ts).
 */
export function reorderSkillSquares(mode: string): void {
  const grid = document.querySelector<HTMLElement>(".skills-grid");
  if (!grid) return;

  const items = Array.from(grid.querySelectorAll<HTMLElement>(".skill-sq"));

  items.sort((a, b) => {
    const tagsA = a.dataset.tags?.split(" ") ?? [];
    const tagsB = b.dataset.tags?.split(" ") ?? [];
    const activeDelta = Number(tagsB.includes(mode)) - Number(tagsA.includes(mode));
    if (activeDelta !== 0) return activeDelta;

    const areaA = Number(a.dataset.weight ?? 1) * Number(a.dataset.border ?? 1);
    const areaB = Number(b.dataset.weight ?? 1) * Number(b.dataset.border ?? 1);
    if (areaA !== areaB) return areaB - areaA;

    return (a.dataset.name ?? "").localeCompare(b.dataset.name ?? "");
  });

  const frag = document.createDocumentFragment();
  items.forEach((el) => frag.appendChild(el));
  grid.appendChild(frag);
}

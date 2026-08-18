/**
 * lens-dropdown.ts — chiude la tendina di lente quando si clicca fuori.
 *
 * `<details>` nativo non lo fa da solo: si chiude solo ri-cliccando il
 * proprio `<summary>`. Mancava dappertutto — sia nella pagina vera
 * (/lab/<lente>) sia nel selettore d'accento della vetrina — ed era un
 * comando che restava aperto sopra il resto della pagina finché non lo si
 * richiudeva a mano.
 *
 * `skipSelector` esclude le istanze che sono demo statiche (dentro
 * `.ds-stage`, aperte apposta per documentare lo stato "aperto"): quelle
 * restano com'erano, un click altrove sulla pagina non deve richiuderle.
 */
export function initLensDropdownAutoClose(skipSelector?: string): void {
  const shouldSkip = (details: HTMLDetailsElement) =>
    !!skipSelector && !!details.closest(skipSelector);

  document.addEventListener("click", (e) => {
    const target = e.target as Node;
    document.querySelectorAll<HTMLDetailsElement>(".lc-lens[open]").forEach((details) => {
      if (shouldSkip(details)) return;
      // Un click dentro la tendina (sul summary, su un'opzione) resta cosa
      // sua: qui si gestisce solo il click che cade fuori da entrambi.
      if (details.contains(target)) return;
      details.open = false;
    });
  });

  // Esc è l'altra via di uscita da tastiera per chi non vuole tabbare fino
  // al summary per richiuderla.
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    document.querySelectorAll<HTMLDetailsElement>(".lc-lens[open]").forEach((details) => {
      if (shouldSkip(details)) return;
      details.open = false;
    });
  });
}

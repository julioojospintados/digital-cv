# Proposta UX — Pagine `mode`

Data: 16/04/2026
Autore: Team (proposta generata dal dev-agent)

Scopo
- Fornire due opzioni praticabili per migliorare l'usabilità e la leggibilità delle pagine `mode` (`/tech`, `/creative`, `/human`, `/management`).
- Consentire una scelta rapida (tu approvi) seguita da un piccolo PR/prototipo.

Vincoli e principi (estratti dalle SKILL)
- Manteniamo il sistema Knolling e il mode system (non cambiare template).
- Usare CSS custom properties e rispettare `prefers-reduced-motion`.
- Performance first: animare solo `transform` e `opacity`.
- Accessibilità: focus-visible, skip link, contrasti WCAG AA.

Opzione A — Desktop-first (raccomandata per recruiter/CTO)
- Strategia: Griglia responsive a 3 colonne (desktop) → 2 (tablet) → 1 (mobile). Aggiunta di filtri sticky per tag e un "sticky top" con conteggio risultati.
- Reveal: usare `GSAP ScrollTrigger.batch` per i reveal delle card (stagger 40–60ms).
- Interazione: on-hover card subtle lift (`transform: translateY(-6px) scale(1.02)`) solo su pointer:fine.
- Pro: rapido valore percepibile su desktop, mantiene look professionale, compatibile con visual design Awwwards.
- Contro: richiede lavoro CSS/JS su breakpoint e filtro sticky.

Opzione B — Mobile-first (raccomandata per usabilità su schermi piccoli)
- Strategia: vista a pagine/cluster con accordion per ogni sezione tematica; primo cluster espanso (focus-first). Pagine swipeable (optional) o caricamento progressivo.
- Reveal: reveal locale all'apertura accordion; mantenere il grafico e le call-to-action in top fixed.
- Interazione: touch-first, gestire overscroll e `touch-action` correttamente.
- Pro: esperienza mobile più semplice e veloce, migliore discoverability su schermo piccolo.
- Contro: perdita della vista d'insieme che la griglia offre su desktop.

Raccomandazione
- Se l'obiettivo principale è impressionare recruiter/CTO su desktop: **Opzione A**.
- Se priorità è mobile-first discovery e operatori sul campo: **Opzione B**.

Implementazione proposta (stages)
1. Proposta finale (1 pagina) — OGGI (questo documento) ✓
2. Revisione e scelta (tu) — 10–20 minuti
3. Prototipo rapido (branch `ux/mode-pages-proto`) — 2–4 ore
   - Implementare: CSS grid + sticky filters (Opzione A) *o* accordion + cluster (Opzione B)
   - Aggiungere: `ScrollTrigger.batch` in `cv-site/src/scripts/cv-init.ts` o `cv-site/src/scripts/mode-reveal.ts`
   - CSS tokens: `--mode-grid-gap`, `--card-gap`, `--card-columns-desktop` (global style)
4. PR code + testing (1–2 giorni) — include cross-browser mobile checks

Checklist tecnica (per implementare Opzione A)
- [ ] Aggiornare `cv-site/src/pages/[mode].astro` per il wrapper grid e la barra sticky
- [ ] Aggiungere CSS tokens in `cv-site/src/styles/global.css` e `cv-site/src/styles/index-page.css`
- [ ] Implementare `ScrollTrigger.batch` reveals in `cv-site/src/scripts/cv-init.ts` (o nuovo file `mode-reveal.ts`)
- [ ] Aggiornare componenti card (`cv-site/src/components/cards/ExpCard.astro`, `ProjectCard.astro`) per supportare low-cost reveal (add `data-reveal` class)
- [ ] Testare performance (Lighthouse) su desktop e mobile
- [ ] Aggiungere test visuals su 360/768/1024 breakpoints
- [ ] Update `.todo.md` con outcome

Checklist tecnica (per implementare Opzione B)
- [ ] Convertire sezioni in cluster/accordion (create `Cluster` wrapper)
- [ ] Implementare `focus-first` per primo cluster aperto
- [ ] Mantenere `ScrollTrigger.refresh()` dopo apertura accordion
- [ ] Add touch hints & `touch-action` styles
- [ ] Testare su iOS Safari e Android Chrome

Metriche di successo
- Riduzione del tempo medio per trovare una skill/esperienza del 30% (misurazione manuale prima/dopo)
- Aumento tempo medio in pagina (desktop) +10% per Opzione A
- Riduzione bounce su mobile per Opzione B

Stima tempi
- Revisione e scelta: 10–20 minuti
- Prototipo rapido: 2–4 ore
- PR e rifinitura: 1–2 giorni (dipende dalla scelta)

Prossimi passi (per me)
1. Aspetto tua preferenza: `Opzione A` o `Opzione B`.
2. Dopo approvazione: creo il branch `ux/mode-pages-proto` e implemento il prototipo rapido.

---

File rilevanti (risorse per sviluppare)
- `cv-site/src/pages/[mode].astro`
- `cv-site/src/styles/index-page.css`
- `cv-site/src/styles/global.css`
- `cv-site/src/scripts/cv-init.ts` (or add `mode-reveal.ts`)
- `cv-site/src/components/cards/*` (ExpCard.astro, ProjectCard.astro, SkillSquare.astro)

---

Se vuoi, procedo subito a creare il branch e implementare il prototipo per l'opzione che scegli.

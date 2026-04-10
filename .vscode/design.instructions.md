---
applyTo: "cv-site/src/**"
---

# Design conventions — Digital CV (Knolling / Flat Lay)

> Full spec in `cv-site/DESIGN.md`. This file contains the operative rules for implementation.

## Stack

- **Astro** (static shell, routing, page structure)
- **Lit** (interactive islands: card, skill grid, mode switcher, AI workflow)
- **Tailwind CSS** (utility classes, grid, spacing)
- **NanoStores** (`@nanostores/persistent`) for global mode state
- **View Transitions API** for mode and page transitions

## Mode system

The site has 3 modes: `tech | creative | human`.
- Store: `src/islands/stores/modeStore.ts` — export a `nanostores/persistent` atom
- URL: always reflect mode as `?mode=tech` (use `URLSearchParams` on load + on change)
- DOM: set `document.documentElement.dataset.mode = mode` — CSS tokens handle the rest
- Persist: `localStorage` via NanoStores persistent
- Transitions: ALWAYS wrap mode changes in `document.startViewTransition(() => { ... })`

## CSS tokens — never hardcode colors

Use CSS custom properties from `src/styles/global.css`:
- `--color-bg`, `--color-surface`, `--color-border`
- `--color-text-primary`, `--color-text-muted`
- `--color-accent`, `--color-accent-2`
- `--card-opacity-active`, `--card-opacity-passive`, `--card-scale-passive`

Never write `bg-black`, `text-white` etc. directly. Use `bg-[var(--color-bg)]`.

## Components

### Astro components (`src/components/`)
- Static shell only — no interactive state
- Pass data from `cvData` / `cvDataEn` as props
- Use `<client:idle>` or `<client:visible>` for Lit islands

### Lit islands (`src/islands/`)
- One file per interactive component
- Always use `@customElement('kebab-case-name')`
- Subscribe to `modeStore` inside `connectedCallback` for reactivity
- Emit `CustomEvent` for cross-component communication (do not use global variables)
- Clean up store subscriptions in `disconnectedCallback`

## Card states

Every card has a `state: "active" | "passive"` property.
- `active`: `opacity: 1`, full content visible, accent border
- `passive`: `opacity: var(--card-opacity-passive)`, reduced content, no border accent
- Transition: `transition: opacity 300ms ease, transform 300ms ease`

A card is `active` when its tag array intersects the current mode's tag set:
```typescript
const modeTags: Record<string, string[]> = {
  tech: ["tech", "logic", "agile"],
  creative: ["creative", "storytelling", "marketing"],
  human: ["human", "solving", "international"],
};
```

## Skill grid — no progress bars

Skill items are squares (`aspect-ratio: 1`) — never use `<progress>` or width-percentage bars.
Skill level maps to border weight and glow:
- `"Base"` → `border: 1px solid var(--color-border)`
- `"Intermedio"` → `border: 2px solid var(--color-border)`
- `"Avanzato"` → `border: 3px solid var(--color-accent); box-shadow: 0 0 6px var(--color-accent)`
- `"Esperto"` → `border: 4px solid var(--color-accent); box-shadow: 0 0 12px var(--color-accent); transform: scale(1.1)`

## AI Workflow section

Each AI workflow item MUST have:
- `tool`: name of AI tool used
- `title`: concise action label
- `description`: how it is used in practice
- `example`: before/after concrete case
- `impactScore`: concise string (`-50% development time`, `+3x output speed`)

`impactScore` is displayed as a badge. Color: green for time saved, blue for multiplied output.
Never present it as scientific data — it is a narrative estimate, visually styled as data.

## X-Factor badge

Show the `<xfactor-badge>` on cards with:
- International location (not Italy)
- `socialImpact` items (always)
- Skills from `transversalSkills` with tags `human`, `international`
- "Scrittura e poesia" and "Teatro e improvvisazione" entries

In HUMAN mode: always visible. In TECH/CREATIVE: visible on hover only (`opacity: 0` → `opacity: 1` on `:hover`).

## View Transitions

- Add `<meta name="view-transition" />` in `Layout.astro`
- Every navigation and mode switch MUST use `document.startViewTransition()`
- Assign `view-transition-name` to hero elements (name card, main title, mode switcher)
- Duration: `150ms` micro, `300ms` state change, `500ms` page transition
- ALWAYS add `@media (prefers-reduced-motion: reduce)` override with `duration: 0ms`

## Typography rules

- Headings: `Inter` (all modes) except CREATIVE where `Playfair Display` is used for H1/H2
- Body: `Inter` always
- Technical data / code snippets: `JetBrains Mono`
- Quotes / narrative text: `font-style: italic` with `Georgia` in HUMAN mode
- Labels / badges: `text-xs font-medium tracking-widest uppercase`

## Accessibility

- All cards: `role="article"`, descriptive `aria-label`
- Mode switcher buttons: `aria-pressed={isActive}`, `aria-label="Switch to [MODE] mode"`
- Skill squares: `role="button"`, `aria-expanded`, `aria-label="[Skill] — [Level] level"`
- Focus ring: always `outline: 2px solid var(--color-accent); outline-offset: 2px`
- Contrast: minimum 4.5:1 ratio — verify all mode themes, especially TECH dark mode

## File structure

```
cv-site/src/
  islands/
    stores/
      modeStore.ts        ← NanoStore persistent atom for mode
    ModeStore.ts          ← Lit element wrapping the store
    EntryPortal.ts        ← Landing 3-card portal
    KnollingGrid.ts       ← Main grid container
    CvCard.ts             ← Single card with active/passive states
    SkillBento.ts         ← Bento grid of skills
    SkillItem.ts          ← Single clickable skill square
    AiWorkflow.ts         ← AI section container
    AiWorkflowItem.ts     ← Single AI card with impact score
    ModeSwitcher.ts       ← Navbar mode toggle
    LangToggle.ts         ← IT/EN language switch
    ImpactBadge.ts        ← Impact score badge
    XFactorBadge.ts       ← X-Factor badge with tooltip
  pages/
    index.astro           ← Entry portal (mode=null)
    cv.astro              ← Main CV page (reads ?mode param)
    en/
      index.astro         ← EN entry portal
      cv.astro            ← EN CV page
```

## Data import

- Italian: `import { cvData } from '@cv-data'`
- English: `import { cvDataEn } from '@cv-data-en'`
  Add to `astro.config.mjs`: `'@cv-data': '../../src/data/cv.js'`, `'@cv-data-en': '../../src/data/cv.en.js'`

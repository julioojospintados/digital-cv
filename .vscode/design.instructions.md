---
applyTo: "cv-site/src/**"
---

# Design conventions — Digital CV (Knolling / Flat Lay)

> Full spec in `cv-site/DESIGN.md`. This file contains the operative rules for implementation.

## Stack

- **Astro** (static shell, routing, page structure)
- **Lit** (interactive islands — only 3 exist, see below)
- **NanoStores** (`@nanostores/persistent`) for global mode state
- **GSAP** + **ScrollTrigger** for animations (in `cv-init.ts` / `index-init.ts`)
- **D3** for the force-directed skill graph (inside `SkillForceGraph.lit.ts`)
- **View Transitions API** for page transitions

## Mode system

The site has **4 modes**: `tech | creative | human | management`.

Mode = Astro route, not URL param. Each mode is a static page at `/<mode>`:
- `/tech` → `[mode].astro` with `mode = 'tech'`
- `/creative` → `[mode].astro` with `mode = 'creative'`
- `/human` → `[mode].astro` with `mode = 'human'`
- `/management` → `[mode].astro` with `mode = 'management'`

Mode state is also stored in `modeStore.ts` (NanoStores) and `localStorage`.
Navigation from home uses a GSAP warp animation then `window.location.href`.

The `data-mode` attribute is set on `<html>` — CSS custom properties handle all visual changes.
**Never set mode via URL query string** — use the static route instead.

### CSS accent tokens per mode

| Mode | `--color-accent` | `--color-text-muted` |
|---|---|---|
| `tech` | `rgba(0,255,200,1)` | `rgba(0,255,200,0.70)` |
| `creative` | `rgba(255,107,53,1)` | `rgba(255,195,155,0.82)` |
| `human` | `rgba(240,200,127,1)` | `rgba(240,210,148,0.75)` |
| `management` | `rgba(180,100,255,1)` | `rgba(200,170,255,0.78)` |

Background is always ottanio `rgba(8,73,67,1)` in every mode.

## CSS tokens — never hardcode colors

Use CSS custom properties from `src/styles/global.css`:
- `--color-bg`, `--color-surface`, `--color-border`
- `--color-text-primary`, `--color-text-muted`
- `--color-accent`
- `--card-opacity-active`, `--card-opacity-passive`, `--card-scale-passive`

Never write `bg-black`, `text-white` etc. directly.

## Routing

| URL | File | Purpose |
|---|---|---|
| `/` | `index.astro` | Preloader GO — navigates to `/home` |
| `/home` | `home.astro` | 4-card mode selector (knolling layout) |
| `/tech` `/creative` `/human` `/management` | `[mode].astro` | Full CV page filtered by mode |
| `/en/cv` | `en/cv.astro` | English version of the CV |
| `/cv` | redirect | → `/tech` |

## Components

### Astro components (`src/components/cards/`)
- `ExpCard.astro` — experience card (mode tags, highlights, skills)
- `AiCard.astro` — AI workflow card (impactScore badge, tool name)
- `ProjectCard.astro` — project card (tech stack, links)
- `SkillSquare.astro` — skill square with border/glow (NO progress bars)
- `SoftItem.astro` — soft/transversal skill list item

### Lit islands (`src/islands/`) — only 3 exist

| File | Custom element | Purpose |
|---|---|---|
| `GoLogo.lit.ts` | `<go-logo>` | Animated logo, click = `/`, mode-reactive color |
| `FloatingMenu.lit.ts` | `<floating-menu>` | FAB: contact, feedback, AI-section link |
| `SkillForceGraph.lit.ts` | `<skill-force-graph>` | D3 force-directed skill network |

**DO NOT reference** `ModeSwitcher.ts`, `EduItem.astro`, `EntryPortal.ts`, `KnollingGrid.ts`,
`CvCard.ts`, `SkillBento.ts`, `XFactorBadge.ts`, `ImpactBadge.ts` — these do NOT exist.

### Mode-reactive nav buttons (in `[mode].astro`)
Mode switching on the CV page uses `<button data-nav-mode="tech">` buttons + `cv-init.ts`.
GSAP handles width morph and label crossfade. No Lit component wraps this.

## Card states — mode tag system

Cards have `data-tags="tech creative"` (space-separated). `cv-init.ts` sets `data-state`:
- `data-state="active"` → `opacity: 1`
- `data-state="passive"` → `opacity: var(--card-opacity-passive)` (0.2) — NEVER `display:none`

Valid tags: `tech` `creative` `human` `management` (align with mode names).

## Skill grid — no progress bars

Skill items are squares — never use `<progress>` or width-percentage bars.
Border weight + glow maps to level:
- `"Base"` → `border: 1px solid var(--color-border)`
- `"Intermedio"` → `border: 2px solid var(--color-border)`
- `"Avanzato"` → `border: 3px solid var(--color-accent); box-shadow: 0 0 6px var(--color-accent)`
- `"Esperto"` → `border: 4px solid var(--color-accent); box-shadow: 0 0 12px var(--color-accent)`

## AI Workflow section

Each `AiCard` item has: `tool`, `title`, `desc`, `impact`, `tags`.
`impact` is displayed as a badge (font mono, accent color) — narrative estimate framed as data.

## View Transitions

- `<meta name="view-transition" />` is in `Layout.astro`
- ALWAYS add `@media (prefers-reduced-motion: reduce)` override with `duration: 0ms`

## Typography rules

- All headings/body: `Lexend` (preloaded — weight 800 critical for preloader)
- Technical data / code snippets: `JetBrains Mono`
- Labels / badges: font mono, `text-transform: uppercase`, `letter-spacing`
- **Font-size scale (2026-07-14):** never a literal rem/px `font-size` outside
  a `clamp()`. Always `var(--fs-N)` from `global.css` — 10/12/14/16/18/20/24/
  28/32/36/40/48px. `--fs-12` is the absolute floor for any text users read;
  `--fs-10` is an exception only for short ALL CAPS + bold badges (2-4 chars).
  Full rule set in `design-system/SKILL.md` → "Typography Scale".

## Accessibility

Target: **WCAG 2.2 level AA** (EU harmonised standard: EN 301 549).
Full rule set in `design-system/SKILL.md` → "Accessibilità".

- All interactive cards: `role="button"` or `role="article"` with `aria-label`
- Nav mode buttons: `aria-pressed={isActive}`
- Focus ring: `outline: 2px solid var(--color-accent); outline-offset: 2px` (in global.css).
  Must itself reach 3:1 against its surroundings (1.4.11), and must not end up
  hidden behind sticky nav, FAB or consent banner (2.4.11)
- Text contrast 4.5:1. The 3:1 exception starts at **24px, or 18.66px bold** —
  not 18px. Compute the ratio on the **composited** color (alpha counts) and on
  the **actual** background (any light overlay above the ottanio changes it)
- **Never use `creative` orange (3.62:1) or `management` purple (3.04:1) as a
  text color** on the ottanio — fills, borders and rules only. Lighten toward
  white if the color must carry text (`--accent` vs `--accent-text`)
- Non-text contrast 3:1 for control borders and informative icons (1.4.11)
- Tap targets ≥24×24 CSS px (2.5.8)
- No minimum font size exists in WCAG. What is binding: 200% zoom (1.4.4),
  reflow at 320px (1.4.10), user text spacing (1.4.12) — hence `rem`, never `px`.
  The project's 12px floor is our own convention, not the standard
- Never block paste in the `tools/` passphrase fields (3.3.8)

## Data import

- Italian: `import { cvData } from '@cv-data'`
- English: `import { cvDataEn } from '@cv-data-en'`

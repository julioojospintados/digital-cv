---
name: design-system
description: "Regole visual e tecniche del Digital CV. Carica quando: crei componenti UI, animazioni GSAP, layout, card, skill grid, knolling, mode system, colori, tipografia, responsive, mobile, GoLogo, ModeSwitcher, Lit islands, Tailwind 4, Awwwards, cursor custom, smooth scroll, bento grid, preloader, View Transitions, ottanio, accent."
---

# Design System — Knolling CV

## Riferimento Visivo Knolling — CARICA SEMPRE

**BLOCKING:** Prima di qualsiasi lavoro su layout, card, griglia o mobile — usa `view_image` per caricare:
`.github/skills/design-system/knolling-reference.jpg`

Questa foto mostra i TUOI oggetti (megafono, laptop, bussola, fotocamera, torcia, scacchi, pianta, multitool)
disposti in una fotografia knolling reale. È la **referenza visiva assoluta** per ogni decisione di layout.

**Regole estratte dalla foto:**

- Tutti gli oggetti sono **paralleli o perpendicolari** al bordo — zero angolature casuali
- **Gap costante** tra ogni oggetto — identico in tutte le direzioni
- Gli oggetti grandi (laptop) dominano il centro, i piccoli ai bordi
- Il **bianco (o sfondo) tra gli oggetti è parte del design**, non spazio vuoto
- Nessun oggetto si tocca, nessuno si sovrappone
- La percezione di "ordine" deriva dalla **ripetizione ritmica dello spazio**

## Colori — Sistema Fisso

Lo sfondo è **sempre ottanio** `rgba(8,73,67,1)` in tutti e 3 i mode. Solo `--color-accent` cambia.
**Mai colori hardcoded — sempre CSS custom properties.**

```css
/* Token attivi in global.css — NON aggiungere altri senza usarli */
--color-bg: rgba(8, 73, 67, 1) /* ottanio — invariabile */
  --color-surface: rgba(12, 95, 87, 0.5) /* superfici card */
  --color-border: rgba(255, 255, 255, 0.12)
  --color-text-primary: rgba(245, 240, 230, 1)
  --color-text-muted: rgba(192, 220, 215, 0.85)
  /* WCAG AA ~5.7:1 su bg ottanio */ --color-accent: /* vedi tabella mode */;
```

| Mode       | `--color-accent`        | `--color-text-muted` (WCAG AA verificato) | Target                   |
| ---------- | ----------------------- | ----------------------------------------- | ------------------------ |
| default    | `rgba(255,255,255,0.9)` | `rgba(192,220,215,0.85)` — ~5.7:1 ✅      | nessun mode attivo       |
| `tech`     | `rgba(0,255,200,1)`     | `rgba(0,255,200,0.70)` — ~4.8:1 ✅        | CTO, recruiter tecnico   |
| `creative` | `rgba(255,107,53,1)`    | `rgba(255,195,155,0.82)` — ~4.9:1 ✅      | Art director, agenzia    |
| `human`    | `rgba(240,200,127,1)`   | `rgba(240,210,148,0.75)` — ~4.6:1 ✅      | HR, fondatore, no-profit |

### Token NON esistenti — non usarli mai

- ~~`--color-ottanio-dark`~~ — rimosso (era inutilizzato)
- ~~`--color-ottanio-light`~~ — rimosso (era inutilizzato)
- ~~`--color-accent-2`~~ — rimosso (era inutilizzato in tutti i mode)

---

## Accessibilità — Regole Obbligatorie (WCAG AA)

**Contrasto testo (1.4.3):** ratio minimo **4.5:1** per testo normale, **3:1** per testo grande (≥18px bold).
→ Verificare sempre `--color-text-muted` su `--color-bg` — i valori nei token sono già calibrati.
→ Non aumentare la trasparenza di `--color-text-muted` senza ricalcolare il ratio.

**Focus visible (2.4.7):** `focus-visible` è definito in global.css — **non sovrascriverlo mai** con `outline:none`.

```css
/* NON fare questo */
:focus {
  outline: none;
} /* senza :focus-visible — cieco da tastiera */

/* Corretto — già in global.css */
:focus {
  outline: none;
}
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
}
```

**Skip link (2.4.1):** presente in `Layout.astro`. Ogni `<main>` deve avere `id="main-content"`.

**Uso del colore (1.4.1):** il colore NON può essere l'unico differenziatore — le mode card usano anche label testuale (01/02/03) + descrizione. Non usare solo accent color per comunicare stato attivo.

**Animazioni (2.3.3):** `@media (prefers-reduced-motion: reduce)` è già in global.css — rispettarlo sempre con `!important` su duration.

---

## Mode System — Regola Fondamentale

Il mode NON cambia template, NON cambia pagina.
Cambia solo l'**enfasi visiva** tramite `data-state="active|passive"`:

```html
<div class="cv-card" data-tags="tech creative">...</div>
```

- Card con tag corrispondente al mode → `opacity: 1` (active)
- Altre card → `opacity: var(--card-opacity-passive)` — mai `display:none` (sono sussurri)

Il JavaScript in `cv.astro` applica `data-state` confrontando i `data-tags` con il mode corrente.
Il CSS gestisce `opacity` e `transform` in base a `data-state`.

---

## Oggetti Knolling

8 PNG con sfondo trasparente in `cv-site/public/knolling/`:

| File              | Mode             | Significato simbolico         |
| ----------------- | ---------------- | ----------------------------- |
| `laptop.png`      | tech             | Il lavoro digitale, il codice |
| `flashlight.webp` | tech             | Illuminare problemi complessi |
| `multitool.png`   | tech + creative  | Versatilità, problem solving  |
| `camera.png`      | creative         | Fotografia, visione estetica  |
| `megaphone.png`   | creative + human | Comunicazione, palco, voce    |
| `chess.png`       | human            | Strategia, pensiero laterale  |
| `plant.png`       | human            | Crescita, cura, impatto       |
| `compass.png`     | creative + human | Orientamento, esplorazione    |

Posizionamento via CSS custom properties `--kx`, `--ky`, `--kr`, `--ks` (e `--kfx` per flip X).
GSAP anima ingresso (`.do-enter`) e cambio mode (`.is-hero` / `.is-dim`).
Mobile `@media (max-width: 639px)`: riposiziona nei corner estremi, lontano dal contenuto centrale.
Tutti con `alt=""` — sono decorativi, il knolling-stage ha `aria-hidden="true"`.

---

## Skill Grid

**Mai barre percentuali.** Quadrati con bordo proporzionale al livello:

- Bordo: 1px / 2px / 3px / 4px (Base → Esperto)
- Glow: solo Avanzato e Esperto — `box-shadow: 0 0 12px 3px var(--color-accent)`

---

## AI Workflow — Sezione Dedicata

Sempre visibile indipendentemente dal mode.
Badge `impactScore`: font mono, colore accent, sembra un dato — non marketing.
Esempi: `-87% boilerplate` · `+3x velocità` · `-50% costo sviluppo`.
La sezione mostra il badge `MCP` come firma del metodo.

---

## Flusso Utente

```
/ (index.astro)
  → Preloader: GO appare, barra si riempie (1.0s)
  → GSAP: G e O "atterrano" nel nome → iulio/cchipinti appaiono char-by-char
  → Utente sceglie: TECH / CREATIVE / HUMAN (knolling reagisce, GO button appare)
  → CTA "GO Tech/Creative/Human" → launchJourney() → /cv?mode=X

/cv (cv.astro)
  → Dati da cv.ts via @cv-data
  → Navbar sticky con toggle mode (cambia mode senza ricaricare)
  → Sezioni: Hero · Skills Bento · Esperienze · AI Workflow · Soft Skills · Mindset · Progetti · Formazione
  → Mode persiste in localStorage via modeStore.ts
```

---

## Componenti Gamification

| Componente                   | Ruolo narrativo                                                                  |
| ---------------------------- | -------------------------------------------------------------------------------- |
| `<go-logo>`                  | Ancora universale — click = Master Reset a `/`. Mode-reactivo (cyan/orange/gold) |
| Mode cards (`index.astro`)   | Non pulsanti: **portali** — sensazione di "entrare in un mondo"                  |
| GSAP Flip bento (`cv.astro`) | Ribilanciamento spazio al cambio mode — "Yes, And..." della griglia              |
| Knolling objects             | Risposta ambientale alla scelta: `is-hero` / `is-dim`                            |
| Preloader GO                 | Rituale iniziatico — GSAP timeline: glow flash → sfuma → G/O atterrano nel nome  |

---

## Standard Awwwards — Checklist

| Pattern                 | Libreria / Metodo                              | Stato                           |
| ----------------------- | ---------------------------------------------- | ------------------------------- |
| Smooth scroll           | `Lenis` (`lerp: 0.08`)                         | ✅ implementato in Layout.astro |
| Custom cursor           | CSS + GSAP follower (dot + ring)               | ✅ implementato in Layout.astro |
| ScrollTrigger reveals   | GSAP ScrollTrigger + `.reveal` / `.is-visible` | ✅ parziale (cv.astro)          |
| Split text hero         | char-by-char stagger (G/O separati)            | ✅ implementato in index.astro  |
| Noise grain overlay     | SVG `feTurbulence` filter + CSS `body::after`  | ✅ implementato in global.css   |
| Preloader brandizzato   | GSAP timeline (GO → nome)                      | ✅ implementato in index.astro  |
| Magnetic buttons        | `mousemove` + GSAP translate                   | ✅ implementato sulle mode card |
| View Transitions        | `astro:transitions` meta tag                   | ✅ presente nel Layout          |
| Responsive Mobile-First | Tailwind breakpoints                           | ✅ parziale                     |
| Skip link               | `.skip-link` in Layout.astro                   | ✅ implementato                 |
| Focus visible           | `:focus-visible` in global.css                 | ✅ implementato                 |

### Principi Awwwards

- **Ogni sezione ha "un dettaglio con cui giocare"** — interazione = messaggio
- **Preloader → Identity → Transition** è il framework narrativo award
- **Tipografia display bold + tracking stretto** — non body font standard per i titoli
- **Transizioni di pagina fluide** — mai un flash bianco o un caricamento abrupt
- **Cursor come firma visiva** — il cursore è parte del brand
- **Impatto verticale nel fold iniziale** — il recruiter deve restare nei primi 3 secondi

---

## Typography Scale

```css
/* h1 hero (entry-name): clamp(3rem, 10vw, 7rem) — font-weight 800 */
/* h1 display (cv.astro): clamp(3.5rem, 10vw, 9rem) — font-weight 800 */
/* h2 sezione: clamp(2rem, 5vw, 4.5rem) — font-weight 700 */
/* Label uppercase (entry-label): 0.65rem, letter-spacing: 0.25em */
/* Body: max 1.1rem, line-height: 1.65 */
/* Tagline/italic: 0.9rem */
```

**Font coppia tecnica — self-hosted via Fontsource (nessuna richiesta esterna, GDPR compliant):**

| Famiglia         | Uso                                      | CSS var                         | Pesi installati     |
| ---------------- | ---------------------------------------- | ------------------------------- | ------------------- |
| `Lexend`         | Titoli, testo, tutto ciò che è "parlato" | `--font-display`, `--font-sans` | 400 500 600 700 800 |
| `JetBrains Mono` | Tag, label, numeri, dati tecnici         | `--font-mono`                   | 400 500 600 700     |

**Regola FOUC — obbligatoria:**

- Il peso 800 di Lexend ha `font-display: block` con path statico (`/fonts/Lexend/lexend-latin-800-normal.woff2`) — previene il flash durante il preloader
- `<link rel="preload">` per il woff2-800 è in `Layout.astro` — deve rimanere
- Gli altri pesi usano Fontsource con `font-display: swap` (non critici per il primo frame)
- Il file fisico `public/fonts/Lexend/lexend-latin-800-normal.woff2` è tracciato nel repo

**DO NOT:** non rimuovere il `@font-face` esplicito con `font-display: block` per il peso 800 — causerebbe FOUC nel preloader.

---

## Cursor Custom

- Default: dot 8px pieno `var(--color-accent)` + ring 40px outline
- Hover interattivo (`.cursor--hover`): dot 12px, ring 56px
- `mix-blend-mode: difference` sul dot — effetto invertito su sfondi chiari
- Nascosto su touch (`@media (hover: none), (pointer: coarse)`)
- MAI mostrare `cursor: auto` su elementi interattivi (solo mobile eccezione)

---

## Smooth Scroll

- `Lenis` in `Layout.astro`, integrato con GSAP ticker via `gsap.ticker.add()`
- `data-lenis-prevent` su modal/overlays che hanno scroll interno
- Velocità: `lerp: 0.08` — più lento = più premium
- `(window as any).__lenis` esposto globalmente per pagine che ne hanno bisogno

---

## CSS — Regole di Igiene

- **Un solo blocco per selettore** — niente `.reveal` definito due volte con varianti diverse
- **La classe `.reveal`** usa `.is-visible` (GSAP, cv.astro) E `.visible` (componenti statici) — entrambe già coperte in global.css
- **I token definiti devono essere usati** — se non sono referenziati con `var()`, rimuoverli
- **Nessun colore inline** — neanche negli `style=""` degli oggetti knolling (solo `--kx`, `--ky`, ecc.)

---

## Regole per il Codice UI

- **Mobile-First** — costruisci sempre dal mobile, poi scala a desktop
- **Tailwind 4** per lo styling — non CSS inline, non classi inventate
- `will-change: transform` solo sugli elementi animati da GSAP
- Feedback visivo "wow ma leggero" — nessuna animazione pesante
- Pixel Perfect: spacing, kerning, allineamenti intenzionali, non approssimativi
- Tutta la logica TypeScript va nel frontmatter `---` di Astro, non nel template JSX
- Immagini knolling: `loading="eager"` solo above-fold, resto `lazy`

---

## Do NOT

- `display:none` per le card passive — sono sussurri, non silenzi
- Colori hardcoded — sempre CSS custom properties
- Barre percentuali per le skill — usa il sistema Square/Glow
- Cambiare template/layout al cambio mode — solo opacity/scale
- Modificare la struttura dei tipi in `cv.ts` senza aggiornare `cv.en.ts`
- Aggiungere token CSS (`--color-*`) senza usarli immediatamente nei componenti
- Aumentare la trasparenza di `--color-text-muted` senza ricalcolare il ratio WCAG
- Sovrascrivere `:focus-visible` con `outline: none` senza alternativa visibile

Lo sfondo è **sempre ottanio** `rgba(8,73,67,1)` in tutti e 3 i mode. Solo `--color-accent` cambia.
**Mai colori hardcoded — sempre CSS custom properties.**

```css
--color-bg: rgba(8, 73, 67, 1) /* ottanio — invariabile */
  --color-surface: rgba(12, 95, 87, 0.5) /* superfici card */
  --color-border: rgba(255, 255, 255, 0.12)
  --color-text-primary: rgba(245, 240, 230, 1)
  --color-text-muted: rgba(180, 210, 205, 0.7)
  --color-accent: /* vedi tabella mode */;
```

| Mode       | `--color-accent`                 | Target                   |
| ---------- | -------------------------------- | ------------------------ |
| `tech`     | `rgba(0,255,200,1)` — Cyan       | CTO, recruiter tecnico   |
| `creative` | `rgba(255,107,53,1)` — Arancione | Art director, agenzia    |
| `human`    | `rgba(240,200,127,1)` — Oro      | HR, fondatore, no-profit |

---

## Mode System — Regola Fondamentale

Il mode NON cambia template, NON cambia pagina.
Cambia solo l'**enfasi visiva** tramite `data-state="active|passive"`:

```html
<div class="cv-card" data-tags="tech creative">...</div>
```

- Card con tag corrispondente al mode → `opacity: 1` (active)
- Altre card → `opacity: var(--card-opacity-passive)` — mai `display:none` (sono sussurri)

Il JavaScript in `cv.astro` applica `data-state` confrontando i `data-tags` con il mode corrente.
Il CSS gestisce `opacity` e `transform` in base a `data-state`.

---

## Oggetti Knolling

8 PNG con sfondo trasparente in `cv-site/public/knolling/`:

| File             | Mode             | Significato simbolico         |
| ---------------- | ---------------- | ----------------------------- |
| `laptop.png`     | tech             | Il lavoro digitale, il codice |
| `flashlight.png` | tech             | Illuminare problemi complessi |
| `multitool.png`  | tech + creative  | Versatilità, problem solving  |
| `camera.png`     | creative         | Fotografia, visione estetica  |
| `megaphone.png`  | creative + human | Comunicazione, palco, voce    |
| `chess.png`      | human            | Strategia, pensiero laterale  |
| `plant.png`      | human            | Crescita, cura, impatto       |
| `compass.png`    | creative + human | Orientamento, esplorazione    |

Posizionamento via CSS custom properties `--kx`, `--ky`, `--kr`, `--ks`.
GSAP anima ingresso e cambio mode (`is-hero` / `is-dim`).
Mobile `@media (max-width: 639px)`: riposiziona nei corner estremi, lontano dal contenuto centrale.

---

## Skill Grid

**Mai barre percentuali.** Quadrati con bordo proporzionale al livello:

- Bordo: 1px / 2px / 3px / 4px (Base → Esperto)
- Glow: solo Avanzato e Esperto — `box-shadow: 0 0 12px 3px var(--color-accent)`

---

## AI Workflow — Sezione Dedicata

Sempre visibile indipendentemente dal mode.
Badge `impactScore`: font mono, colore accent, sembra un dato — non marketing.
Esempi: `-87% boilerplate` · `+3x velocità` · `-50% costo sviluppo`.
La sezione mostra il badge `MCP` come firma del metodo.

---

## Flusso Utente

```
/ (index.astro)
  → Attiva un'identità: TECH / CREATIVE / HUMAN
  → GSAP: oggetti knolling "rispondono" alla scelta (is-hero / is-dim)
  → CTA "GO Tech/Creative/Human" → /cv?mode=X (Astro View Transition)

/cv (cv.astro)
  → Dati da cv.ts via @cv-data
  → Navbar sticky con toggle mode (cambia mode senza ricaricare)
  → Sezioni: Hero · Skills Bento · Esperienze · AI Workflow · Soft Skills · Mindset · Progetti · Formazione
  → Mode persiste in localStorage via modeStore.ts
```

---

## Componenti Gamification

| Componente                   | Ruolo narrativo                                                                  |
| ---------------------------- | -------------------------------------------------------------------------------- |
| `<go-logo>`                  | Ancora universale — click = Master Reset a `/`. Mode-reactivo (cyan/orange/gold) |
| Mode cards (`index.astro`)   | Non pulsanti: **portali** — sensazione di "entrare in un mondo"                  |
| GSAP Flip bento (`cv.astro`) | Ribilanciamento spazio al cambio mode — "Yes, And..." della griglia              |
| Knolling objects             | Risposta ambientale alla scelta: `is-hero` / `is-dim`                            |
| Preloader GO                 | Rituale iniziatico — evento narrativo fondante, non animazione decorativa        |

---

## Standard Awwwards — Checklist

| Pattern                 | Libreria / Metodo               | Stato           |
| ----------------------- | ------------------------------- | --------------- |
| Smooth scroll           | `Lenis` (`lerp: 0.08`)          | da implementare |
| Custom cursor           | CSS + GSAP follower             | da implementare |
| ScrollTrigger reveals   | GSAP ScrollTrigger              | da implementare |
| Split text hero         | char-by-char stagger            | da implementare |
| Noise grain overlay     | SVG `feTurbulence` filter + CSS | da implementare |
| Preloader brandizzato   | GSAP timeline                   | da implementare |
| Magnetic buttons        | `mousemove` + GSAP translate    | da implementare |
| View Transitions        | `astro:transitions`             | ✅ presente     |
| Responsive Mobile-First | Tailwind breakpoints            | ✅ parziale     |

### Principi Awwwards

- **Ogni sezione ha "un dettaglio con cui giocare"** — interazione = messaggio
- **Preloader → Identity → Transition** è il framework narrativo award
- **Tipografia display bold + tracking stretto** — non body font standard per i titoli
- **Transizioni di pagina fluide** — mai un flash bianco o un caricamento abrupt
- **Cursor come firma visiva** — il cursore è parte del brand
- **Impatto verticale nel fold iniziale** — il recruiter deve restare nei primi 3 secondi

---

## Typography Scale

```css
/* h1 hero: clamp(4rem, 12vw, 10rem) — bold/black weight */
/* h2 sezione: clamp(2rem, 5vw, 4.5rem) — bold */
/* Label uppercase: 0.65rem, letter-spacing: 0.3em */
/* Body: max 1.1rem, line-height: 1.65 */
```

Non usare Inter regular per h1/h2 grandi — servono font display bold.

---

## Cursor Custom

- Default: 12px cerchio pieno (colore `--color-accent`)
- Hover interattivo: si espande a 40px, outline, lieve blur
- Su testo: custom si rimpicciolisce, cursore browser visibile
- Mai mostrare il cursore di default su elementi interattivi
- Il cursore cambia colore con il mode

---

## Smooth Scroll

- `Lenis` in `Layout.astro`, integrato con GSAP ticker
- `data-lenis-prevent` su modal/overlays
- Velocità: `lerp: 0.08` (più lento = più premium)

---

## Regole per il Codice UI

- **Mobile-First** — costruisci sempre dal mobile, poi scala a desktop
- **Tailwind 4** per lo styling — non CSS inline, non classi inventate
- `will-change: transform` solo sugli elementi animati da GSAP
- Feedback visivo "wow ma leggero" — nessuna animazione pesante
- Pixel Perfect: spacing, kerning, allineamenti intenzionali, non approssimativi
- Tutta la logica TypeScript va nel frontmatter `---` di Astro, non nel template JSX
- Immagini knolling: `loading="eager"` solo above-fold, resto `lazy`

---

## Do NOT

- `display:none` per le card passive — sono sussurri, non silenzi
- Colori hardcoded — sempre CSS custom properties
- Barre percentuali per le skill — usa il sistema Square/Glow
- Cambiare template/layout al cambio mode — solo opacity/scale
- Modificare la struttura dei tipi in `cv.ts` senza aggiornare `cv.en.ts`

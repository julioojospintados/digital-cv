---
name: design-system
description: "Regole visual e tecniche del Digital CV. Carica quando: crei componenti UI, animazioni GSAP, layout, card, skill grid, knolling, mode system (4 mode: tech/creative/human/management), colori, tipografia, responsive, mobile, GoLogo, FloatingMenu, SkillForceGraph, Lit islands, Awwwards, cursor custom, smooth scroll, bento grid, preloader, View Transitions, ottanio, accent, viola management."
---

# Design System — Knolling CV

## Riferimento Visivo Knolling — CARICA SEMPRE

**BLOCKING:** Prima di qualsiasi lavoro su layout, card, griglia o mobile — usa `view_image` per caricare:
`.claude/skills/design-system/knolling-reference.png`

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

| Mode         | `--color-accent`        | `--color-text-muted` (WCAG AA verificato) | Target                      |
| ------------ | ----------------------- | ----------------------------------------- | --------------------------- |
| default      | `rgba(255,255,255,0.9)` | `rgba(192,220,215,0.85)` — ~5.7:1 ✅      | nessun mode attivo          |
| `tech`       | `rgba(0,255,200,1)`     | `rgba(0,255,200,0.70)` — ~4.8:1 ✅        | CTO, recruiter tecnico      |
| `creative`   | `rgba(255,107,53,1)`    | `rgba(255,195,155,0.82)` — ~4.9:1 ✅      | Art director, agenzia       |
| `human`      | `rgba(240,200,127,1)`   | `rgba(240,210,148,0.75)` — ~4.6:1 ✅      | HR, fondatore, no-profit    |
| `management` | `rgba(180,100,255,1)`   | `rgba(200,170,255,0.78)` — ~4.6:1 ✅      | Recruiter, aziende, innovazione |

### Token NON esistenti — non usarli mai

- ~~`--color-ottanio-dark`~~ — rimosso (era inutilizzato)
- ~~`--color-ottanio-light`~~ — rimosso (era inutilizzato)
- ~~`--color-accent-2`~~ — rimosso (era inutilizzato in tutti i mode)

### Mode `management` — Spec

Accent viola `rgba(180,100,255,1)`. Target: recruiter, aziende, contenuti su metodo e consulenza.
Le card con `data-tags="management"` sono attive in questo mode.
L'oggetto knolling associato al management è `chess.webp` (strategia) e `compass.webp` (orientamento).

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

| File              | Mode                    | Significato simbolico         |
| ----------------- | ----------------------- | ----------------------------- |
| `laptop.webp`      | tech + management       | Il lavoro digitale, il codice |
| `flashlight.webp` | tech + management       | Illuminare problemi complessi |
| `multitool.webp`   | tech + creative + mgmt  | Versatilità, problem solving  |
| `camera.webp`      | creative                | Fotografia, visione estetica  |
| `megaphone.webp`   | creative + human + mgmt | Comunicazione, palco, voce    |
| `chess.webp`       | human + management      | Strategia, pensiero laterale  |
| `plant.webp`       | human + management      | Crescita, cura, impatto       |
| `compass.webp`     | creative + human + mgmt | Orientamento, esplorazione    |

Posizionamento via CSS custom properties `--kx`, `--ky`, `--kr`, `--ks` (e `--kfx` per flip X).
GSAP anima ingresso (`.do-enter`) e cambio mode (`.is-hero` / `.is-dim`).
Mobile `@media (max-width: 639px)`: riposiziona nei corner estremi, lontano dal contenuto centrale.
Tutti con `alt=""` — sono decorativi, il knolling-stage ha `aria-hidden="true"`.

---

## UX & Cognitive Load

- **Leggi della Gestalt:** Usa la prossimità degli oggetti nel Knolling per far percepire i servizi come un unico ecosistema armonico.
- **Social Proof Visiva:** Le card devono mostrare "dati di impatto" (es. -80% tempo) accanto al design, unendo l'estetica alla prova concreta.
- **F-Pattern:** Disponi le informazioni nelle card seguendo la lettura naturale dell'utente per massimizzare la ritenzione dei messaggi chiave.

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
  → Utente sceglie: Software Developer / Web & UX Designer / Project Manager / AI & Digital Specialist (knolling reagisce, GO button appare)
  → CTA "GO Software Developer / Web & UX Designer / etc." → launchJourney() → /cv?mode=X

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

## Animation Engineering — Regole Emil Kowalski

Principi estratti da `emilkowalski/skill` (591★, MIT). Applicabili direttamente al stack Astro + GSAP + CSS.

### Easing Curves Custom — aggiungere in `global.css`

I built-in CSS (`ease`, `ease-out`) sono troppo deboli. Usare sempre variabili custom:

```css
--ease-out: cubic-bezier(0.23, 1, 0.32, 1); /* enters, UI interactions */
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1); /* movimenti su schermo */
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1); /* slide drawer mobile */
```

In GSAP: `'power3.out'` ≈ `--ease-out` forte. `'power3.inOut'` ≈ `--ease-in-out` forte.

### Mai `scale(0)` in Entrata

Nulla nel mondo reale appare dal nulla. Sempre partire da `scale(0.92–0.95) + opacity: 0`.

```css
/* ❌ Sbagliato */
.entering {
  transform: scale(0);
}
/* ✅ Corretto  */
.entering {
  transform: scale(0.95);
  opacity: 0;
}
```

In GSAP: il `mode-card__go` usa `scale: 0.82` come start — portare a `scale: 0.92` minimo.

### Solo `transform` e `opacity` — Regola GPU

Animare solo queste due proprietà (girano su GPU, saltano layout e paint).
**Mai animare:** `padding`, `margin`, `height`, `width`, `top`, `left`.

```css
/* ❌ */
transition: all 300ms ease;
/* ✅ */
transition:
  transform 200ms var(--ease-out),
  opacity 200ms ease;
```

### Durazioni per Tipo di Elemento

| Elemento                     | Durata         |
| ---------------------------- | -------------- |
| Button press (`:active`)     | 100–160ms      |
| Tooltip, small popover       | 125–200ms      |
| Dropdown, select             | 150–250ms      |
| Modal, drawer                | 200–500ms      |
| Marketing / preloader / hero | Oltre 300ms ok |

**Regola UI: mai oltre 300ms.** Preloader e animazioni hero sono eccezioni.

### `scale(0.97)` su `:active` — Feedback Immediato

Ogni elemento pressabile deve rispondere fisicamente al click:

```css
.mode-card__go,
.mode-card,
button {
  transition: transform 160ms var(--ease-out);
}

.mode-card__go:active,
.mode-card:active {
  transform: scale(0.97);
}
```

### Hover Gated — Obbligatorio su Touch

Su touch il `:hover` si attiva al tap. Sempre wrappare:

```css
@media (hover: hover) and (pointer: fine) {
  .mode-card:hover {
    transform: scale(1.02);
  }
  .knoll-item:hover {
    opacity: 0.9;
  }
}
```

### `prefers-reduced-motion` — Rispettare Sempre

Riduzione ≠ eliminazione. Mantenere opacity/color, rimuovere i transform.
La regola è già in `global.css` — non aggiungere nuove animazioni senza verificarla.

### Asimmetria Enter/Exit

Entrata lenta (deliberata) → uscita veloce (il sistema risponde). Mai stessa durata per entrambe.

```css
.overlay {
  transition: clip-path 200ms var(--ease-out);
} /* exit: veloce */
.button:active .overlay {
  transition: clip-path 2s linear;
} /* enter: lento */
```

Il `mode-card__go` già rispetta il principio (`0.6s` in entrata, `0.2s` in uscita).

### Stagger per Gruppi (30–80ms per item)

```css
.skill-square:nth-child(1) {
  animation-delay: 0ms;
}
.skill-square:nth-child(2) {
  animation-delay: 50ms;
}
.skill-square:nth-child(3) {
  animation-delay: 100ms;
}
```

In GSAP: `gsap.from('.skill-square', { stagger: 0.05, opacity: 0, y: 8 })`.
Oltre 80ms per item si percepisce come lentezza, non coreografia.

### `clip-path: inset()` per Reveal on Scroll

```css
.cv-section {
  clip-path: inset(0 0 100% 0);
  transition: clip-path 600ms var(--ease-out);
}
.cv-section.is-visible {
  clip-path: inset(0 0 0 0);
}
```

Hardware-accelerato. Applicabile alle sezioni di `cv.astro` con `IntersectionObserver`.

### CSS vs GSAP — Quando Usare Cosa

| Scenario                                    | Soluzione                        |
| ------------------------------------------- | -------------------------------- |
| Animazione predeterminata (preloader, idle) | CSS puro — off main thread       |
| Animazione interrompibile (hover, drag)     | CSS `transition` — retargetabile |
| Animazione dinamica con logica JS           | GSAP — controllo completo        |
| Reveal on scroll                            | GSAP ScrollTrigger + CSS class   |

---

## Typography Scale — regola ferrea (decisione 2026-07-14)

**Mai un font-size "a caso".** Ogni `font-size` fisso (non fluido) nel progetto
deve essere uno dei token `--fs-*` definiti in `global.css`, mai un rem
calcolato a occhio (`0.68rem`, `0.82rem`, `0.58rem`...). Il "rumore" di rem
non tondi è esattamente il difetto che questa scala elimina: prima della
normalizzazione del 2026-07-14 il progetto aveva oltre 30 valori diversi di
font-size, molti sotto la soglia minima di leggibilità.

### La scala — sempre via `var(--fs-N)`, mai il rem letterale

| Token         | rem      | px  | Uso tipico                                          |
| ------------- | -------- | --- | ---------------------------------------------------- |
| `--fs-10`     | 0.625rem | 10  | **Eccezione**, vedi sotto — mai testo che si legge   |
| `--fs-12`     | 0.75rem  | 12  | **Pavimento assoluto** — eyebrow, chip, meta, badge  |
| `--fs-14`     | 0.875rem | 14  | Label secondarie, sub-title, testo desktop compatto  |
| `--fs-16`     | 1rem     | 16  | Body — minimo per il testo principale su mobile      |
| `--fs-18`     | 1.125rem | 18  | Body enfatizzato, sub-heading piccolo                |
| `--fs-20`     | 1.25rem  | 20  | Titoli di card (es. project title)                   |
| `--fs-24`     | 1.5rem   | 24  | Titoli di sezione piccoli                            |
| `--fs-28`     | 1.75rem  | 28  | —                                                     |
| `--fs-32`     | 2rem     | 32  | —                                                     |
| `--fs-36`     | 2.25rem  | 36  | —                                                     |
| `--fs-40`     | 2.5rem   | 40  | Numeri/display di medio impatto (es. step numerati)  |
| `--fs-48`     | 3rem     | 48  | Display, specimen tipografico                        |

Quando un valore esistente non è già su uno di questi step, va sempre
arrotondato al più vicino (nearest-neighbor in px) — mai lasciato "in mezzo".
Esempio: `0.82rem` (13.12px) è più vicino a 14px che a 12px → `var(--fs-14)`.

**Eccezione — titoli/hero fluidi:** i `font-size: clamp(...)` per h1/h2 hero e
display (es. `clamp(2rem, 5vw, 4.5rem)`) restano fuori da questa scala: sono
deliberatamente continui/responsivi, il loro valore giusto dipende dal
viewport reale, non da un token fisso. Il pavimento dei 12px vale comunque
anche lì — nessun bound minimo di un clamp può scendere sotto `var(--fs-12)`
(vedi `SkillSquare.astro`, i due clamp con `cqi` hanno pavimento a
`--fs-12`/`--fs-10` per lo stesso motivo).

### Regole di accessibilità (non negoziabili)

- **12px è il minimo assoluto** per qualunque testo che l'utente deve
  effettivamente leggere: label di form, didascalie, micro-help, note. Mai
  scendere sotto `var(--fs-12)` per prosa, nomi, descrizioni, dati.
- **10px (`var(--fs-10)`) è un'eccezione**, non uno step normale: si usa SOLO
  per badge/timestamp brevissimi (2-4 caratteri) in ALL CAPS + bold + alto
  contrasto — es. l'abbreviazione di 3 lettere del livello skill
  (`EXP`/`AVA`/`BAS`). Se il testo è una frase o una parola intera, non
  qualifica per l'eccezione: va a `--fs-12`.
- **Body mobile:** minimo 16px (`var(--fs-16)`) — standard iOS/Material.
- **Body desktop:** 14-16px accettabili (`var(--fs-14)`/`var(--fs-16)`).
- **Testo secondario (entrambi i device):** minimo 12px (`var(--fs-12)`).
- **Contrasto:** sotto i 18px bold / 14px normal serve un rapporto WCAG
  ≥4.5:1 (già verificato per `--color-text-muted` su tutti i mode — vedi
  tabella colori sopra). Non abbassare l'opacità di un colore già a 12px.
- **Line-height:** più piccolo è il font, più deve respirare — 140-150% del
  font-size per qualunque blocco a `--fs-12` o `--fs-14`. Mai line-height
  <1.3 sotto i 14px.
- **Font-weight:** mai `font-weight: 300`/`400` sotto i 14px su questo sito —
  i micro-label usano già 500-700 (JetBrains Mono compensa bene grazie
  all'x-height alta; Lexend idem).

### DO NOT (typography)

- Scrivere un `font-size` in rem/px letterale fuori da un `clamp()` — usa
  sempre `var(--fs-N)`.
- Introdurre un nuovo step nella scala senza motivo — se serve una taglia
  intermedia, verifica prima se lo step vicino (12/14/16...) funziona.
- Scendere sotto `var(--fs-12)` per qualunque prosa/label/nome — l'unica
  eccezione è `var(--fs-10)` per badge cortissimi ALL CAPS + bold.
- Alzare l'opacità/abbassare il contrasto per "far stare" un testo piccolo —
  se il contrasto non regge a quella dimensione, la dimensione è sbagliata.

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
- `font-size` in rem/px letterale fuori da un `clamp()` — usa sempre `var(--fs-N)` (vedi "Typography Scale")
- Scendere sotto `var(--fs-12)` per prosa/label/nomi — l'eccezione `var(--fs-10)` è solo per badge cortissimi ALL CAPS + bold


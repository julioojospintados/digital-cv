# DESIGN.md — Digital CV · Visual System & Architecture

> **Philosophy**: "Yes, and..." — ogni elemento si collega al successivo in modo fluido.
> Ogni componente accetta il contesto attuale e lo amplifica. Nessun dead-end.

---

## 1. Concept visivo: Knolling / Flat Lay

Il sito si ispira alla fotografia **Knolling** (oggetti disposti su un piano come un inventario):
- Tutto è visibile, catalogato, disposto con intenzione.
- Gli oggetti (card, skill, esperienze) vivono su un **piano neutro** come attrezzi su un banco da lavoro.
- Il movimento è **traslazione e scala** — niente rotazioni caotiche, niente profondità esagerata.
- L'ordine visivo comunica competenza; il dettaglio comunica profondità.

### Regole stilistiche Knolling
- Elementi allineati a griglia rigorosa (multipli di 8px / Tailwind spacing scale).
- Sfondo: tono neutro spento (cream, warm gray o white off).
- Bordi sottili, ombre piatte (no `box-shadow` con blur alto).
- Ogni card è un "oggetto": ha peso visivo proporzionale alla sua importanza.
- Quando un oggetto è inattivo, **non sparisce** — sbiadisce, rimane presente come inventario.

---

## 2. Modalità (Stato Globale)

L'interfaccia ha **3 modalità** gestite via NanoStore (`@nanostores/react` o store Lit).
Il valore è persistito in `localStorage` + parametro URL (`?mode=tech|creative|human`).

| Modalità | Chiave URL | Tema | Elementi in evidenza |
|---|---|---|---|
| **TECH** | `?mode=tech` | Scuro, neon, griglia densa | Tag: `tech`, `logic`, `agile` |
| **CREATIVE** | `?mode=creative` | Caldo, editoriale, ampio respiro | Tag: `creative`, `storytelling`, `marketing` |
| **HUMAN** | `?mode=human` | Neutro, calore umano, dettaglio | Tag: `human`, `solving`, `international` |

### Comportamento per modalità

**TECH**
- Background: `#0a0a0f` (quasi nero)
- Accent: `#00ff88` (neon verde) + `#0066ff` (neon blu)
- Card attive: bordi neon, `opacity: 1`, leggero `glow` in `box-shadow`
- Card inattive: `opacity: 0.25`, bordi `#333`, testo desaturato
- Font: `JetBrains Mono` per dati tecnici, `Inter` per testo corrente
- Layout: griglia densa, colonne strette, spazio ridotto

**CREATIVE**
- Background: `#fdfaf5` (cream caldo)
- Accent: `#e85d04` (arancione bruciato) + `#9b2226` (rosso tiziano)
- Card attive: bordi colorati, layout editoriale asimmetrico, immagini/video in primo piano
- Card inattive: `opacity: 0.4`, scala ridotta (`scale: 0.92`)
- Font: `Playfair Display` per titoli, `Inter` per testo
- Layout: grid ampia, colonne variabili, spazio generoso

**HUMAN**
- Background: `#f5f0eb` (warm paper)
- Accent: `#2d6a4f` (verde salvia) + `#403d39` (marrone corda)
- Card attive: bordi solidi, contenuto narrativo espanso, X-Factor badge visibili
- Card inattive: `opacity: 0.35`, senza bordi
- Font: `Inter` per tutto, `Georgia` per le citazioni
- Layout: layout misto, blocchi larghi con testo narrativo

---

## 3. Struttura delle pagine

### 3.1 Entry Portal (`/` o `/entry`)

Una landing **minimal** con 3 scelte. Prima interazione, nessun contenuto CV visibile.

```
┌─────────────────────────────────────────┐
│                                         │
│         GIULIO OCCHIPINTI               │
│   "Chi sei, dipende da come mi guardi." │
│                                         │
│  ┌────────┐  ┌──────────┐  ┌────────┐  │
│  │ [TECH] │  │[CREATIVE]│  │[HUMAN] │  │
│  └────────┘  └──────────┘  └────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

- Le 3 card sono grandi, cliccabili, con micro-descrizione sotto:
  - TECH → "Architetture, codice, sistemi"
  - CREATIVE → "Racconto, immagine, suono"
  - HUMAN → "Impatto, relazione, presenza"
- Al click: View Transition animata verso la main page con il mode impostato.
- Stile: sfondo neutro, card monocromatiche con hover che anticipa il tema del mode.

### 3.2 The Knolling Grid (main page)

La pagina principale è una **griglia dinamica** che cambia layout e priorità in base al mode.

Struttura base (desktop, 12 colonne):

```
[NAVBAR / MODE SWITCHER sempre visibile]

[HERO CARD — 4col]  [SUMMARY CARD — 4col]  [AVAILABILITY — 4col]

[EXPERIENCE CARDS — 8col]  [SKILLS BENTO — 4col]

[PROJECTS — 6col]  [TRANSVERSAL — 6col]

[AI-ENHANCED WORKFLOW — 12col]

[SOCIAL IMPACT — 6col]  [METHODOLOGY — 6col]

[FOOTER — 12col]
```

Su mobile: single column, ordine gestito da `order` Tailwind in base al mode.

---

## 4. Sistema delle Card (Knolling Objects)

Ogni card è un "oggetto" con stati ben definiti:

```typescript
type CardState = "active" | "passive" | "hidden";
type CardSize = "xs" | "sm" | "md" | "lg" | "hero";
```

### Anatomia di una card

```
┌──────────────────────┐
│ [TAG BADGE] [X-FACTOR?] │  ← header row
│                      │
│  TITLE               │  ← nome skill / ruolo / progetto
│  company / context   │  ← subtitle
│                      │
│  description (passiv:│  ← visibile solo se active o expanded
│  si rivela al hover) │
│                      │
│  [skill pills]       │  ← chips tecnologie / tag
│  [impact score]      │  ← solo AI-Enhanced section
└──────────────────────┘
```

### Regole card sizing (Bento Grid)

| Tipo di contenuto | Size | Colonne Tailwind |
|---|---|---|
| Hero / Nome | `hero` | `col-span-4 row-span-2` |
| Esperienza primaria (ALTEN) | `lg` | `col-span-4` |
| Esperienza secondaria | `md` | `col-span-2` |
| Esperienza minore | `sm` | `col-span-1` |
| Skill tecnica | `sm` | `col-span-1` (quadrato) |
| Social impact | `md` | `col-span-2` |
| AI workflow item | `lg` | `col-span-3` |

---

## 5. Skills — Bento Grid (niente barre percentuali)

Le skill **non usano progress bar**. Ogni skill è un **quadrato cliccabile**.

### Visualizzazione skill

```
┌────────┐  ┌────────┐  ┌────────┐  ┌────────────────┐
│ Angular│  │  Lit   │  │TypeScr.│  │  WebComponents │
│ EXPERT │  │  ADV   │  │  ADV   │  │     ADV        │
└────────┘  └────────┘  └────────┘  └────────────────┘
```

- Dimensione quadrato: `w-16 h-16` (base) — le skill "Esperto" sono `w-20 h-20`
- Icona da SimpleIcons (se disponibile via `icon` field in cv.ts)
- Livello mostrato come **numero di punti** o **colore di bordo** (non testo):
  - Base → bordo `1px`
  - Intermedio → bordo `2px`
  - Avanzato → bordo `3px` + leggero glow
  - Esperto → bordo `4px` + glow forte + dimensione aumentata
- Al click: espansione inline con contesto d'uso (da `transversalSkills` corrispondente)

### Raggruppamento per mode

- **TECH mode**: mostra prima Angular/Lit/TS/WebComp/NGRX/RXJS, poi gli altri
- **CREATIVE mode**: mostra prima Figma/UX/Video editing/Adobe Suite/Fotografia
- **HUMAN mode**: mostra prima Improv/Public speaking/Leadership/Agile

---

## 6. Sezione AI-Enhanced Workflow

Sezione dedicata, sempre visibile a prescindere dal mode (ma il layout cambia).

### Struttura

Per ogni item AI workflow:

```
┌────────────────────────────────────────────┐
│ 🤖 [TOOL USATO]             [IMPACT SCORE] │
│                                            │
│  TITOLO WORKFLOW                           │
│  Descrizione concreta di come viene usato │
│                                            │
│  Esempio pratico / output tipo             │
│  Prima: [x tempo]  →  Dopo: [y tempo]     │
└────────────────────────────────────────────┘
```

### Items AI Workflow (da implementare come componenti)

```typescript
const aiWorkflowItems = [
  {
    tool: "GitHub Copilot",
    title: "Accelerazione sviluppo Angular enterprise",
    description: "Generazione di boilerplate NGRX, testing Jest e pattern architetturali ripetitivi, con validazione critica dell'output.",
    example: "Scaffold completo di un feature module NGRX in 3 minuti vs 40 minuti",
    impactScore: "-87% tempo boilerplate",
    tags: ["tech", "agile"],
  },
  {
    tool: "ChatGPT / Claude",
    title: "Prompt Engineering per prototipazione UX rapida",
    description: "Generazione di user personas, flussi di navigazione e scenari di test a partire da brief testuali. Usato nella fase di UX Research IBM.",
    example: "5 user personas dettagliate in 20 minuti vs 2 giorni di ricerca",
    impactScore: "-90% tempo fase discovery",
    tags: ["creative", "tech"],
  },
  {
    tool: "Claude / GPT-4",
    title: "Ottimizzazione architetture Angular tramite LLM",
    description: "Analisi di code smell, refactoring suggerito e revisione di architetture a microfrontend con LLM come pair reviewer.",
    example: "Identificazione di memory leak in observable chain — diagnosi in 5 min",
    impactScore: "-60% tempo debug",
    tags: ["tech", "logic"],
  },
  {
    tool: "Midjourney",
    title: "Esplorazione visiva per brief UX/UI",
    description: "Generazione rapida di moodboard e concept visivi prima della fase di wireframing, per allineare stakeholder senza iterazioni costose.",
    example: "10 direzioni visive per un design system in 30 minuti",
    impactScore: "-70% cicli di allineamento visivo",
    tags: ["creative", "tech"],
  },
  {
    tool: "AI Tools (vari)",
    title: "Copywriting e storytelling di prodotto",
    description: "Ottimizzazione SEO di copy, generazione di varianti A/B per landing page e redazione di documentazione tecnica accessibile.",
    example: "Documentazione API da codice annotato in 10 minuti",
    impactScore: "+3x velocità contenuti",
    tags: ["creative", "marketing"],
  },
]
```

### Impact Score — regole di visualizzazione

- Visualizzato come **badge** colorato in alto a destra della card
- Colore: verde per risparmio tempo, blu per moltiplicatore di output
- Formato: sempre una stringa concisa (`-50% tempo`, `+3x output`, `-80% cicli`)
- Non è un dato scientifico — è una stima narrativa. Visivamente deve sembrare data, non marketing.

---

## 7. Navbar / Mode Switcher

La navbar è **sticky**, sottile, sempre visibile. Contiene:

```
[GIULIO]  ·  [TECH] [CREATIVE] [HUMAN]  ·  [IT | EN]
```

- Il mode attivo è marcato (colore o underline animato)
- Il cambio mode usa **View Transitions API** (`document.startViewTransition`)
- Il toggle lingua (IT/EN) usa le stesse transizioni

---

## 8. Tipografia

| Ruolo | Font | Peso | Tailwind class |
|---|---|---|---|
| Heading principale | Inter / Playfair (CREATIVE) | 700 | `text-4xl font-bold` |
| Heading sezione | Inter | 600 | `text-2xl font-semibold` |
| Body | Inter | 400 | `text-base` |
| Mono / Dati tecnici | JetBrains Mono | 400 | `font-mono text-sm` |
| Quote / Impatto | Georgia (italic) | 400 italic | `italic` |
| Badge / Label | Inter | 500 uppercase | `text-xs font-medium tracking-widest uppercase` |

---

## 9. Palette colori per mode

### Tokens condivisi (CSS custom properties)

```css
:root {
  --color-bg: #fafaf8;
  --color-surface: #ffffff;
  --color-border: #e2e2dc;
  --color-text-primary: #1a1a18;
  --color-text-muted: #6b6b65;
  --color-accent: #1a1a18;
  --card-opacity-active: 1;
  --card-opacity-passive: 0.28;
  --card-scale-passive: 1;
}

[data-mode="tech"] {
  --color-bg: #0a0a0f;
  --color-surface: #12121a;
  --color-border: #1e1e2e;
  --color-text-primary: #e8e8f0;
  --color-text-muted: #6b6b88;
  --color-accent: #00ff88;
  --color-accent-2: #0066ff;
  --card-opacity-passive: 0.2;
  --card-scale-passive: 1;
}

[data-mode="creative"] {
  --color-bg: #fdfaf5;
  --color-surface: #ffffff;
  --color-border: #e8ddd0;
  --color-text-primary: #2c1810;
  --color-text-muted: #8b7355;
  --color-accent: #e85d04;
  --color-accent-2: #9b2226;
  --card-opacity-passive: 0.35;
  --card-scale-passive: 0.95;
}

[data-mode="human"] {
  --color-bg: #f5f0eb;
  --color-surface: #faf7f2;
  --color-border: #d4c9b8;
  --color-text-primary: #2d2926;
  --color-text-muted: #7a6e62;
  --color-accent: #2d6a4f;
  --color-accent-2: #403d39;
  --card-opacity-passive: 0.3;
  --card-scale-passive: 0.97;
}
```

---

## 10. Animazioni e View Transitions

### Regole di animazione

- **Nessuna animazione decorativa senza scopo** — ogni movimento comunica un cambiamento di stato.
- Duration: `150ms` per micro-interazioni, `300ms` per transizioni di stato, `500ms` per page transition.
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)` (Material standard) per tutto.
- **Rispetta `prefers-reduced-motion`**: se attivo, tutte le animazioni → `duration: 0ms`.

### View Transitions

```astro
<!-- In Layout.astro -->
<meta name="view-transition" />
```

```typescript
// Cambio mode
document.startViewTransition(() => {
  document.documentElement.dataset.mode = newMode;
  updateURL(newMode);
});
```

### Transizioni card (mode switch)

Le card inattive non spariscono — transitano verso `opacity: var(--card-opacity-passive)`.
Le card attive scalano lievemente verso l'alto (`transform: translateY(-2px)`).

---

## 11. X-Factor Badge

Alcune card mostrano un badge **X-FACTOR** — segnala competenze non convenzionali ad alto valore.

- Appare sulle card con `socialImpact`, `transversalSkills` non tech, esperienze internazionali.
- In HUMAN mode: sempre visibile.
- In TECH/CREATIVE mode: visibile al hover.
- Visual: piccolo rettangolo colorato, testo `X` bold, tooltip con descrizione al hover.

Trigger per X-Factor badge:
- Esperienze con location internazionali (≠ Italia)
- Skill con categoria `human` o `international`
- Social impact items (sempre)
- Voce "Scrittura e poesia" (premio internazionale)
- Voce "Teatro e improvvisazione"

---

## 12. Componenti Astro + Lit richiesti

| Componente | Tipo | Responsabilità |
|---|---|---|
| `<mode-store>` | Lit | NanoStore wrapper, emette `mode-change` event |
| `<entry-portal>` | Astro + Lit | Landing con 3 card giganti |
| `<knolling-grid>` | Astro | Grid container, legge mode da store |
| `<cv-card>` | Lit | Card singola con stati active/passive |
| `<skill-bento>` | Lit | Grid di skill quadrati cliccabile |
| `<skill-item>` | Lit | Singolo quadrato skill espandibile |
| `<ai-workflow>` | Lit | Sezione AI con impact score |
| `<ai-workflow-item>` | Lit | Singola card AI con before/after |
| `<mode-switcher>` | Lit | Navbar toggle TECH/CREATIVE/HUMAN |
| `<lang-toggle>` | Lit | Switch IT/EN con View Transition |
| `<impact-badge>` | Lit | Badge impact score per AI section |
| `<xfactor-badge>` | Lit | Badge X-Factor con tooltip |

---

## 13. Routing e URL structure

```
/             → Entry portal (scelta mode)
/?mode=tech   → Main page in TECH mode
/?mode=creative → Main page in CREATIVE mode
/?mode=human  → Main page in HUMAN mode
/en/          → Entry portal EN
/en/?mode=tech → Main page EN in TECH mode
```

---

## 14. Accessibilità

- Tutte le card hanno `role="article"` e `aria-label` descrittivo.
- Il mode switcher ha `aria-pressed` sul bottone attivo, `aria-label="Modalità [NOME]"`.
- I quadrati skill hanno `role="button"`, `aria-expanded` quando aperti, `aria-label="[Skill] — livello [Level]"`.
- Contrasto: verificare ratio minimo 4.5:1 su tutti i temi. Il TECH mode scuro richiede attenzione particolare.
- Focus ring: sempre visibile, `outline: 2px solid var(--color-accent)`.

---

## File di riferimento

| File | Contenuto |
|---|---|
| `src/data/cv.ts` | Dati IT — source of truth |
| `src/data/cv.en.ts` | Dati EN |
| `src/styles/global.css` | CSS custom properties (tokens per mode) |
| `src/components/` | Componenti Astro |
| `src/islands/` | Componenti Lit interattivi (da creare) |
| `.vscode/design.instructions.md` | Istruzioni auto-iniettate in Copilot |

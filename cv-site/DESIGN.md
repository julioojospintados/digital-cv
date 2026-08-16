# DESIGN.md — Digital CV · Visual System & Architecture

> Riscritto il 2026-07-23: la versione precedente era lo spec pre-implementazione
> (3 mode, sfondi chiari, font Inter/Playfair/Georgia, `?mode=` come URL param,
> `--color-accent-2`) e non rifletteva più il sito reale da anni. Questo
> documento descrive il sito **com'è oggi**, verificato riga per riga contro
> `global.css`, i componenti Astro/Lit e gli script client. Fonte di verità
> gerarchica: `global.css` (codice) → `.claude/skills/design-system/SKILL.md`
> (regole operative sintetiche) → questo file (spec estesa/narrativa).
> Se in futuro questo file diverge dal codice, il codice vince sempre.

> **Philosophy**: "Yes, and..." — ogni elemento si collega al successivo in modo fluido.
> Ogni componente accetta il contesto attuale e lo amplifica. Nessun dead-end.

---

## 1. Concept visivo: Knolling / Flat Lay

Il sito si ispira alla fotografia **Knolling** (oggetti disposti su un piano come un inventario):
- Tutto è visibile, catalogato, disposto con intenzione.
- Gli oggetti (card, skill, esperienze) vivono su un **piano neutro** — qui il piano è
  letteralmente lo sfondo ottanio fisso, mai il bianco/cream della versione originale del sito.
- Il movimento è **traslazione, scala, opacità** — niente rotazioni caotiche a runtime
  (gli 8 oggetti knolling della home hanno una rotazione statica via `--kr`, decisa in
  markup, non animata).
- L'ordine visivo comunica competenza; il dettaglio comunica profondità.
- Quando un oggetto è inattivo, **non sparisce** — sbiadisce (`opacity`), resta presente
  come inventario. Regola non negoziabile: mai `display:none` per le card passive.

### Regole stilistiche Knolling
- Elementi allineati a griglia rigorosa, gap costante in tutte le direzioni.
- Sfondo: **ottanio** `rgba(8,73,67,1)`, fisso in ogni mode e in ogni pagina.
- Bordi sottili (1px, `--color-border`), ombre/glow piatti — mai blur eccessivo che
  simuli profondità 3D vera.
- Ogni card è un "oggetto": ha peso visivo proporzionale alla sua importanza (weight
  in `cv.ts` guida lo span in griglia delle skill square).
- Il bianco/vuoto tra gli oggetti è parte del design, non spazio di scarto.

---

## 2. Mode System (Stato Globale)

L'interfaccia ha **3 mode**: `tech`, `creative`, `human`. Il valore
è persistito in `localStorage` via NanoStore (`cv-site/src/islands/stores/modeStore.ts`),
letto/scritto da `mode-helpers.ts` e applicato ad ogni card con classe `.cv-card`.

Il mode **non è un `?mode=` query param**: su `/[mode].astro` è la route stessa
(`/tech`, `/creative`, `/human`) a fissare il mode iniziale via SSR;
il cambio successivo (dropdown/pillole in navbar) aggiorna solo CSS custom property
e `data-state` delle card, senza ricaricare la pagina. La pagina inglese (`en/cv.astro`)
è single-page: il mode è solo client-side, non c'è una route `en/[mode]` per persona
(vedi `todo.md` #40 per la decisione ancora aperta su questo punto).

### Comportamento per mode — whisper, non silenzio

Il mode **non cambia mai template o layout**, solo enfasi visiva:
- Card con `data-tags` che combacia col mode attivo → `data-state="active"`,
  `opacity: var(--card-opacity-active)` (1).
- Le altre → `data-state="passive"`, opacity ridotta (0.2–0.28 a seconda del token
  di mode, mai 0, mai `display:none`) — sono "sussurri", restano leggibili e
  utilizzabili da tastiera/screen reader.

Lo sfondo ottanio `rgba(8,73,67,1)` **non cambia mai**. Cambiano invece — per ogni mode,
non solo l'accent — questi 4 token: `--color-surface`, `--color-border`,
`--color-text-primary`, `--color-text-muted`, oltre a `--color-accent` stesso. Vedi
tabella completa in §9.

| Mode | Persona | Target | Oggetto knolling |
|---|---|---|---|
| `tech` | Software Developer | CTO, recruiter tecnico | `laptop.webp`, `flashlight.webp` |
| `creative` | Web & UX Designer | Art director, agenzia | `camera.webp`, `multitool.webp` |
| `human` | AI & Digital Specialist | HR, fondatore, no-profit | `plant.webp`, `megaphone.webp` |
---

## 3. Struttura del sito

Flusso reale (non "Entry Portal" generico — la home ha un nome e un rituale precisi):

```
/ (index.astro)
  → Preloader: "GO" appare, G/O atterrano nel nome "Giulio Occhipinti" (GSAP, char-by-char)
  → 8 oggetti knolling disposti in scena (knolling-stage), reattivi al mode scelto
  → 4 mode-card (griglia 2×2 su mobile, riga su desktop) — non sono bottoni, sono "portali"
  → Sezione "Chi sono" + 4 profile-section (una per mode), dot-nav laterale per saltare
  → Ogni profile-section ha una CTA "GO to <persona>" → naviga a /<mode>

/tech /creative /human ([mode].astro, stesso template)
  → Hero con titolo/summary mode-aware, blocco T-shaped (profondità/ampiezza)
  → Skills — vista Square di default (Grafico D3 come opt-in, non default)
  → Esperienze — cluster/accordion per dominio, featured + "Leggi altre N" incrementale
  → AI-Enhanced Workflow — sempre a piena opacità, indipendente dal mode
  → Soft skills / Mindset, Progetti (indice case study), Formazione, Feedback carousel
  → Footer con contatti reali (da cvData.personal/social, non hardcoded)

/cv → redirect legacy a /tech

/work → indice case study (WorkIndexCard per progetto con slug)
/work/[slug] → case study dedicato: hero, ruolo+team, problema, processo, risultato
  misurabile, sezione Design System (questo componente, WorkDesignSystem.astro),
  CTA contatto in fondo

/en/* → mirror inglese di index/cv/work (cv.astro è single-mode, vedi §2)
```

Nessuna griglia Tailwind a 12 colonne generica: ogni sezione ha il proprio CSS
dedicato (`cv-page.css`, `index-page.css`, `work-page.css`), niente `col-span-N`
riusato ovunque.

---

## 4. Sistema delle Card

Ogni card che partecipa al sistema mode ha classe `.cv-card` + attributo
`data-tags="tech creative ..."` (una o più chiavi mode). Lo stato viene scritto da
`applyCardStates()` (`mode-helpers.ts`), mai deciso lato server:

```ts
// data-state, non una classe: più facile da leggere in CSS e devtools
type CardState = "active" | "passive";
```

Card che **non** entrano nel sistema mode (restano sempre a piena opacità): le card
della sezione AI-Enhanced Workflow (`AiCard.astro` — la regola "sempre visibile"
è più importante del whisper system lì).

### Anatomia reale di una card esperienza (`ExpCard.astro`)

```
┌───────────────────────────────┐
│                    [AI clip]  │ ← badge opzionale, solo se aiAugmented
│ COMPANY               2024–26 │
│ Ruolo                         │
│ Location · Remote  [Estero]   │
│                                │
│ Descrizione (line-clamp 4,     │
│ 10 se card attiva; su mobile   │
│ nessun clamp, single-column)   │
│                                │
│ • highlight 1                 │
│ • highlight 2 (max 3)          │
│                                │
│ [skill-chip] [skill-chip] ...  │
└───────────────────────────────┘
```

Niente `CardSize`/`col-span` generico: la griglia esperienze (`.exp-grid`) è
1 colonna su mobile, 2 da 48rem, 3 da 68.75rem — layout responsive via CSS grid
diretto, non un sistema di taglie astratto per card.

---

## 5. Skills — Square & Glow (niente barre percentuali)

Le skill **non usano progress bar** (regola non negoziabile). Ogni skill è un
quadrato (`SkillSquare.astro`) con due segnali **indipendenti**:

1. **Bordo — il vero segnale di livello.** Cresce da 1 a 4px (Base→Esperto),
   sempre visibile a riposo. Su mobile (`<40rem`) è fisso a 1px: lo spazio in
   griglia stretta non basta a far percepire la differenza, e i bordi spessi
   affollavano più del testo stesso.
2. **Glow — segnale di pertinenza al mode, non di livello.** Spento (`box-shadow`
   trasparente) a riposo per *tutti*, anche gli square "Esperto". Si accende solo
   con `:hover` **oppure** quando `data-state="active"` (lo skill combacia col mode
   che stai guardando) — e solo gli square di livello Avanzato/Esperto sono
   *idonei* ad accendersi (`isGlow` prop, classe `.skill-sq--glow`). I due segnali
   non vanno confusi: "il glow marca la padronanza" è impreciso — marca la
   pertinenza contestuale, disponibile solo per chi ha già superato una soglia
   di padronanza.

Dimensione della cella in griglia (`.skill-sq--w1..w5`) segue `weight` (1–5) da
`cv.ts`, non una taglia decisa a mano per skill.

### Vista alternativa: Force Graph

Esiste una seconda visualizzazione, `<skill-force-graph>` (Lit + D3, lazy-loaded
solo al primo click su "Grafico"): rete di connessioni tra skill. **Non è la vista
di default** — le card square lo sono, scansionabili in ~5s (Legge di Jakob);
il grafo è un "wow" opt-in, non il primo contatto.

---

## 6. Sezione AI-Enhanced Workflow

Sempre visibile a piena opacità, **indipendentemente dal mode attivo** — non entra
nel sistema whisper (vedi §4). Ogni `AiCard.astro` mostra: tool, titolo, descrizione,
e un badge `impactScore` in font mono (es. `-87% boilerplate`, `+3x velocità`) che
deve leggersi come un dato, non come marketing. La sezione porta anche il badge
`MCP` come firma del metodo (architettura MCP = API per agenti AI, non solo per
umani — è il vantaggio competitivo che il sito stesso dimostra).

---

## 7. Navbar / Mode Switcher

Due varianti per viewport, stesso stato sorgente (`modeStore.ts`):
- **Desktop** (`.mode-btn`): pulsanti pieni con label a 3 lettere quando compressi
  (`<374px` di larghezza bottone), bordo/testo tinti nell'accent del proprio mode
  a bassa intensità quando non attivi, piena intensità su `aria-pressed="true"`.
- **Mobile** (`<=640px`): dropdown con `role="listbox"`/`option` — **nota**: la
  navigazione da tastiera (frecce/Enter/Esc) non è ancora implementata, vedi
  `todo.md` #54. Label compresse per non troncare in ellissi: "Software Dev",
  "Web & UX", "AI & Digital", "Project Manager" (`MODE_LABELS` in `cv-init.ts`).

Al cambio mode: nessuna `View Transitions API` — un "stamp" fullscreen editoriale
(overlay con la label del mode in maiuscolo, `MODE_LABELS[mode]`) accompagna il
cambio, poi CSS custom property e `data-state` delle card si aggiornano. La
scelta di non usare `document.startViewTransition` è esplicita: un crossfade
full-page (~300ms) è stato scartato a favore dell'aggiornamento immediato di
CSS var + card state (vedi commento in `modeStore.ts`).

---

## 8. Tipografia

Due famiglie, due mestieri, entrambe self-hosted via Fontsource (nessuna
richiesta a Google Fonts, GDPR compliant):

| Famiglia | Ruolo | CSS var | Pesi installati |
|---|---|---|---|
| **Lexend** | Titoli, testo, tutto ciò che è "parlato" | `--font-display`, `--font-sans` | 400 500 600 700 800 |
| **JetBrains Mono** | Tag, label, numeri, dati tecnici, "misurato" | `--font-mono` | 400 500 600 700 |

Il peso 800 di Lexend ha `font-display: block` + `<link rel="preload">` in
`Layout.astro`: previene il FOUC durante il preloader/nome hero (il browser
trattiene il testo invisibile invece di fare swap col fallback di sistema).

### Scala tipografica fissa

Ogni `font-size` non fluido nel progetto è un token `--fs-N` (mai un rem "a
occhio" tipo `0.68rem`): `--fs-10` (eccezione, solo badge cortissimi ALL CAPS +
bold), `--fs-12` (pavimento assoluto per prosa/label/nomi), poi `--fs-14/16/18/
20/24/28/32/36/40/48`. I `clamp()` di hero/display restano fluidi di proposito,
ma il loro floor non scende mai sotto `--fs-12` (eccetto `--fs-10` per badge).
Regola completa: `.claude/skills/design-system/SKILL.md` → "Typography Scale".

---

## 9. Palette colori per mode

**Un solo token è davvero invariante**: `--color-bg` (ottanio, `rgba(8,73,67,1)`
in ogni mode, ogni pagina). Tutti gli altri 4 token cambiano per mode — un
componente o un documento che li mostra come costanti fisse (es. sempre gli
stessi valori `:root`) mostra dati sbagliati appena gira in un mode diverso dal
default. Bug reale trovato e corretto il 2026-07-23 in `WorkDesignSystem.astro`
(leggeva `:root` invece del mode attivo della pagina che lo ospitava).

| Mode | `--color-accent` | `--color-text-muted` (WCAG AA) | `--color-surface` | `--color-border` | `--color-text-primary` |
|---|---|---|---|---|---|
| default (`:root`) | `rgba(255,255,255,0.9)` | `rgba(192,220,215,0.85)` — ~5.7:1 ✅ | `rgba(12,95,87,0.5)` | `rgba(255,255,255,0.12)` | `rgba(245,240,230,1)` |
| `tech` | `rgba(0,255,200,1)` | `rgba(0,255,200,0.70)` — ~4.8:1 ✅ | `rgba(5,50,45,0.6)` | `rgba(0,255,200,0.2)` | `rgba(220,255,245,1)` |
| `creative` | `rgba(255,107,53,1)` | `rgba(255,195,155,0.82)` — ~4.9:1 ✅ | `rgba(40,20,5,0.5)` | `rgba(255,107,53,0.25)` | `rgba(255,240,220,1)` |
| `human` | `rgba(240,200,127,1)` | `rgba(240,210,148,0.75)` — ~4.6:1 ✅ | `rgba(20,60,30,0.4)` | `rgba(240,200,127,0.25)` | `rgba(250,240,215,1)` |
> Nota storica: fino al 2026-08-16 esisteva un quarto mode `management` (viola),
> il cui `--color-text-muted` era dichiarato "~4.6:1 ✅" per anni senza essere mai
> ricalcolato — in realtà 3.76:1, sotto il 4.5:1 di 1.4.3. Scoperto il 2026-07-31
> ricontrollando i mode uno per uno invece di fidarsi della tabella. Il mode è
> stato poi rimosso dal sito; la lezione resta: un valore in tabella non è una
> misura finché qualcuno non la rifà.

### Token rimossi — non esistono più, non reintrodurli

- ~~`--color-accent-2`~~ — era nella versione originaria del sito (Blu/Rosso
  tiziano/Marrone per secondo accent), mai portato nella redesign ottanio.
- ~~`--color-ottanio-dark`~~ / ~~`--color-ottanio-light`~~ — rimossi, inutilizzati.

---

## 10. Raggi e forme

Un raggio per ruolo, deciso una volta (2026-07-10), mai a occhio:

| Token | Valore | Ruolo |
|---|---|---|
| `--radius-16` | 1rem | Card, sezioni, sottosezioni |
| `--radius-4` | 0.25rem | Bottoni |
| — | 1px | Tag/chip netti (es. `.skill-chip`) |
| — | pillola piena (999px) | Toggle mode, chip "about" tratteggiati |

---

## 11. Bottoni e controlli — gerarchia, non decorazione

Una sola azione primaria per vista: bordo accent + glow che pulsa finché non
ci interagisci (`.profile-cta`, `.exp-deeper-btn` per il "leggi altro"). Le
azioni secondarie restano sobrie (`.about-action`: bordo neutro, raggio card).
I toggle di mode si riempiono solo da attivi (`.mode-btn.is-active`). I tag
sono etichette d'inventario, non pulsanti (`.skill-chip` bordo 1px netto,
`.about-chip` bordo tratteggiato + pillola — fatti concreti, non categorie
generiche). Tutti i controlli testuali usano JetBrains Mono, maiuscolo,
tracking largo.

---

## 12. Animazioni — Regole (Emil Kowalski)

Riferimento operativo completo: `.claude/skills/design-system/SKILL.md` →
"Animation Engineering". Sintesi:

- Easing custom (`--ease-out`, `--ease-in-out`, `--ease-drawer`), mai gli
  ease-out/ease-in CSS di base, troppo deboli.
- Mai `scale(0)` in entrata — si parte da `scale(0.92–0.95) + opacity:0`.
- Si anima **solo** `transform` e `opacity` (GPU) — mai `padding`, `margin`,
  `height`, `width`, `top`, `left`.
- Durate: 100–160ms per `:active`, 125–250ms per tooltip/dropdown, 200–500ms
  per modal/drawer. Oltre 300ms solo per hero/preloader/marketing.
- Hover sempre dietro `@media (hover: hover) and (pointer: fine)` — niente
  hover appiccicosi su touch.
- `prefers-reduced-motion: reduce` sempre rispettato (regola globale in
  `global.css`, `!important` sulle duration).
- Asimmetria enter/exit: entrata lenta e deliberata, uscita veloce.

### Smooth scroll

**Lenis** (`lerp: 0.15`, `Layout.astro`), integrato con `gsap.ticker`. Niente
`scroll-behavior: smooth` CSS in parallelo (rimosso il 2026-07-23: confliggeva
con Lenis, animava scroll di correzione pensati per essere istantanei). Lo
smooth scroll intenzionale passa sempre da `lenis.scrollTo()` o da un
`behavior:"smooth"` esplicito sulla singola chiamata.

### Cursor custom

Dot 8px pieno accent + ring 40px outline, mix-blend-mode difference. Segue il
mouse via `gsap.quickTo()` (non un tween nuovo per ogni evento). Nascosto su
touch, parcheggiato invisibile a `(0,0)` finché il mouse non si muove la
prima volta.

### View Transitions — non usate

Nessuna pagina usa `astro:transitions`/`document.startViewTransition`, né per
la navigazione tra route né per il cambio mode (vedi §7). Se in futuro si
introduce, aggiornare questa sezione — è stata una scelta esplicita, non
un'omissione, quindi non va assunta come "ancora da fare".

---

## 13. Componenti Astro + Lit reali

```
components/
  ContactFooter.astro       ← footer contatti condiviso
  WorkDesignSystem.astro    ← questa sezione, dentro /work/[slug]
  cards/
    ExpCard.astro           ← card esperienza (§4)
    AiCard.astro             ← card AI workflow (§6)
    ProjectCard.astro        ← card progetto (tech stack, link)
    SkillSquare.astro        ← square skill (§5)
    SoftItem.astro           ← soft/transversal skill
    WorkIndexCard.astro      ← card indice case study

islands/                     ← Lit web components
  GoLogo.lit.ts               ← <go-logo>: logo animato, click = reset a /
  FloatingMenu.lit.ts         ← <floating-menu>: FAB contatti/feedback
  SkillForceGraph.lit.ts      ← <skill-force-graph>: rete D3 (lazy, §5)
  stores/modeStore.ts         ← NanoStore stato mode globale
```

Nessun componente "Navbar.astro"/"HeroSection.astro"/"ExperienceSection.astro"
generico: il markup delle sezioni vive direttamente in `[mode].astro`/
`en/cv.astro` (duplicazione nota, vedi `todo.md` #47 per il piano di
unificazione in un `CvPage.astro` condiviso).

---

## 14. Routing e URL structure reali

| Route | File | Note |
|---|---|---|
| `/` | `pages/index.astro` | Home, preloader, mode-card, profile-section |
| `/home` | `pages/home.astro` | — |
| `/tech` `/creative` `/human` | `pages/[mode].astro` | Stesso template, mode via SSR |
| `/cv` | `pages/cv.astro` | Redirect legacy → `/tech` |
| `/work` | `pages/work/index.astro` | Indice case study |
| `/work/[slug]` | `pages/work/[slug].astro` | Case study dedicato |
| `/en/*` | `pages/en/**` | Mirror inglese (cv.astro è single-mode, §2) |

Nessun `?mode=` query param in nessuna route.

---

## 15. Accessibilità (WCAG 2.2 AA)

Riferimento: **WCAG 2.2 livello AA**. In Europa la norma armonizzata è
**EN 301 549** (la v3.2.1, citata dalla Direttiva (UE) 2016/2102, recepisce
WCAG 2.1 AA; le revisioni successive si allineano a 2.2). L'**European
Accessibility Act** (Dir. (UE) 2019/882, dal 28 giugno 2025) non copre un CV
personale: qui lo standard è una scelta, non un obbligo — ma vale per intero.

Regole operative complete → `.claude/skills/design-system/SKILL.md`
§ Accessibilità. Qui il riassunto:

- **Contrasto testo (1.4.3)**: ≥4.5:1 normale. Il 3:1 vale solo da **24px**,
  o **18.66px se bold** — non "18px bold", errore corretto il 2026-08-11.
  Il rapporto va calcolato sul colore **composto** (l'alpha conta) e sul fondo
  **effettivo** (un velo chiaro sopra l'ottanio lo cambia).
- **Contrasto non testuale (1.4.11)**: ≥3:1 per bordi di controlli, icone
  informative e **indicatori di focus**.
- **Accento come testo**: `creative` (3.62:1) **non è conforme** come colore di
  un testo su ottanio — solo come riempimento, bordo o linea. Vedi §9.
- **Dimensione del testo**: WCAG **non impone un minimo**. I vincoli reali
  sono **1.4.4** (zoom 200%), **1.4.10** (reflow a 320px) e **1.4.12**
  (spaziatura imposta dall'utente). Il pavimento dei 12px del progetto è una
  convenzione nostra, e i `rem` sono ciò che rende il testo conforme.
- **Target tattili (2.5.8)**: ≥24×24 px CSS.
- **Focus visible (2.4.7)**: `:focus-visible` in `global.css`, mai sovrascritto
  con `outline:none` senza alternativa. E **2.4.11**: il focus non deve finire
  nascosto sotto navbar sticky, FAB o banner di consenso.
- **Skip link (2.4.1)**: in `Layout.astro`, ogni `<main>` ha `id="main-content"`.
- **Uso del colore (1.4.1)**: mai l'unico differenziatore — le mode-card hanno
  anche label testuale, non solo colore.
- **Lingua della pagina (3.1.1)**: `<html lang>` corretto su IT e su `/en`.
- **Autenticazione (3.3.8)**: le pagine `tools/` non devono mai bloccare
  l'incolla nel campo passphrase.
- **Riduzione movimento**: `prefers-reduced-motion: reduce` rispettato ovunque
  con `!important` sulle durate. Nota: **2.3.3 è AAA**, non AA — resta regola
  di progetto, ma non è un obbligo AA. I criteri AA sul movimento sono
  **2.2.2** (fermare ciò che si anima da solo oltre 5s) e **2.3.1** (niente
  lampeggi >3/s).
- **Difetti noti aperti** (vedi `todo.md`): dropdown mode mobile non ancora
  navigabile da tastiera (#54); carousel feedback senza indicatore di
  posizione/`aria-live` (#55).

---

## File di riferimento

- `cv-site/src/styles/global.css` — fonte di verità per ogni token (colori,
  tipografia, raggi, durate).
- `.claude/skills/design-system/SKILL.md` (+ mirror `.github/skills/design-system/SKILL.md`)
  — regole operative sintetiche, stessa fonte di questo documento.
- `.vscode/design.instructions.md` — versione compatta per Copilot,
  auto-iniettata su `cv-site/src/**`.
- `AGENTS.md` (root) — mappa completa dei file del progetto.
- `todo.md` (root) — stato di avanzamento, decisioni prese/aperte, bug noti.
  **File di lavoro locale, non versionato** (è in `.gitignore`): i riferimenti
  del tipo `todo.md #40` o `todo #51` sparsi nel codice e in questo documento
  sono numeri di appunto interni e non sono risolvibili da chi legge il
  repository pubblico. Il motivo della scelta è sempre riportato per esteso
  nel commento stesso, quindi il rimando è tracciabilità, non contesto mancante.

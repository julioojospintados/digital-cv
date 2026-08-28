---
name: design-system
description: "Regole visual e tecniche del Digital CV. Carica quando: crei componenti UI, animazioni GSAP, layout, card, skill grid, knolling, mode system (3 mode: tech/creative/human), colori, tipografia, responsive, mobile, GoLogo, FloatingMenu, Lit islands, Awwwards, cursor custom, smooth scroll, intro dell'ingresso, View Transitions, ottanio, accent."
---

# Design System — Knolling CV

## Riferimento Visivo Knolling — CARICA SEMPRE

**BLOCKING:** Prima di qualsiasi lavoro su layout, card, griglia o mobile — usa `view_image` per caricare:
`.github/skills/design-system/knolling-reference.png`

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

Lo sfondo è **sempre ottanio** `rgba(8,73,67,1)` in tutti e 4 i mode — è l'unico token
davvero invariante. **Tutti gli altri 4 token** (`--color-surface`, `--color-border`,
`--color-text-primary`, `--color-text-muted`, oltre ad `--color-accent`) **cambiano per mode**:
non sono valori fissi, sono ridefiniti dentro ogni blocco `[data-mode="..."]` in `global.css`.
Un componente/doc che li mostra come costanti (es. sempre gli stessi valori `:root`) mostra
dati sbagliati ogni volta che gira in un mode diverso dal default — bug reale trovato e
corretto il 2026-07-23 in `WorkDesignSystem.astro`, che leggeva `:root` invece del mode
attivo. Quel componente è stato cancellato il 2026-08-26 con il resto del sito storico:
la lezione resta, il file no.
**Mai colori hardcoded — sempre CSS custom properties.**

```css
/* Token attivi in global.css — NON aggiungere altri senza usarli.
   Questi sono i valori :root (nessun mode attivo) — vedi tabella sotto
   per i valori reali per mode, diversi da questi per 4 token su 5. */
--color-bg: rgba(8, 73, 67, 1) /* ottanio — invariabile, unico fisso */
  --color-surface: rgba(12, 95, 87, 0.5)
  --color-border: rgba(255, 255, 255, 0.12)
  --color-text-primary: rgba(245, 240, 230, 1)
  --color-text-muted: rgba(192, 220, 215, 0.85)
  /* WCAG AA ~5.7:1 su bg ottanio */ --color-accent: rgba(255, 255, 255, 0.9);
```

| Mode         | `--color-accent`        | `--color-text-muted` (WCAG AA verificato) | `--color-surface`      | `--color-border`        | `--color-text-primary`  | Target                      |
| ------------ | ----------------------- | ----------------------------------------- | ----------------------- | ------------------------ | ------------------------ | ---------------------------- |
| default      | `rgba(255,255,255,0.9)` | `rgba(192,220,215,0.85)` — ~5.7:1 ✅      | `rgba(12,95,87,0.5)`   | `rgba(255,255,255,0.12)` | `rgba(245,240,230,1)`   | nessun mode attivo          |
| `tech`       | `rgba(0,255,200,1)`     | `rgba(0,255,200,0.70)` — ~4.8:1 ✅        | `rgba(5,50,45,0.6)`    | `rgba(0,255,200,0.2)`    | `rgba(220,255,245,1)`   | CTO, recruiter tecnico      |
| `creative`   | `rgba(255,107,53,1)`    | `rgba(255,195,155,0.82)` — ~4.9:1 ✅      | `rgba(40,20,5,0.5)`    | `rgba(255,107,53,0.25)`  | `rgba(255,240,220,1)`   | Art director, agenzia       |
| `human`      | `rgba(240,200,127,1)`   | `rgba(240,210,148,0.75)` — ~4.6:1 ✅      | `rgba(20,60,30,0.4)`   | `rgba(240,200,127,0.25)` | `rgba(250,240,215,1)`   | HR, fondatore, no-profit    |
Nota storica: il quarto mode `management` (viola) è stato rimosso il
2026-08-16. Il suo muted era dichiarato "~4.6:1 ✅" senza essere mai
ricalcolato — in realtà 3.76:1. La lezione resta: un valore in tabella non è
una misura finché qualcuno non la rifà.

### L'accento come TESTO: due dei quattro non si possono usare

Verificato a calcolo il 2026-08-11 (formula ufficiale di luminanza relativa,
alpha composto sull'ottanio):

| Accento su ottanio | Rapporto | Come testo <24px | Come bordo/icona (3:1) |
| ------------------ | -------- | ---------------- | ---------------------- |
| tech ciano         | **7.89:1** | ✅ | ✅ |
| human oro          | **6.49:1** | ✅ | ✅ |
| creative arancione | **3.62:1** | ❌ | ✅ |
→ **Arancione e viola non vanno usati come colore di un testo** su ottanio:
  occhielli, link, etichette, numeri. Vanno benissimo come **riempimento** di
  un bottone con sopra l'inchiostro scuro `rgba(10,38,34,1)` (arancione
  5.64:1, viola 4.73:1 — entrambi conformi), come bordo, come linea.
→ Se serve quel colore come testo, va **schiarito verso il bianco del minimo
  necessario**: arancione al 50%, viola al 45% (→ 4.70:1 e 4.75:1 sul fondo
  dell'ingresso). Ciano e oro restano interi. Il pattern è in
  `lab-home.css`: token `--accent` per i riempimenti, `--accent-text` per il
  testo.
→ Questo è anche il motivo per cui i bottoni dell'ingresso sono pieni e non
  fantasma: con il testo colorato su fondo trasparente due mode su quattro
  sarebbero fuori norma.

### Chiunque aggiunga un velo sopra l'ottanio rifà i conti

Un gradiente, un bagliore, una luce d'ambiente: qualunque strato chiaro alza
la luminanza del fondo e **abbassa il contrasto di tutto il testo sopra**.
Caso reale (2026-08-11, sull'ingresso): un fondale con lampada bianca al 16% +
velo d'accento al 9% ha portato il testo secondario da 5.32:1 a **3.15:1** —
sotto soglia, per un effetto puramente decorativo. Corretto scendendo a 8% e
6% e togliendo l'alpha al testo.
Regola: il rapporto si calcola **nel punto in cui il velo è più intenso**, non
al centro e non a occhio.

### Token NON esistenti — non usarli mai

- ~~`--color-ottanio-dark`~~ — rimosso (era inutilizzato)
- ~~`--color-ottanio-light`~~ — rimosso (era inutilizzato)
- ~~`--color-accent-2`~~ — rimosso (era inutilizzato in tutti i mode)


---

## Accessibilità — Regole Obbligatorie

### Quale norma vale, e da dove viene

Il riferimento è **WCAG 2.2 livello AA** (W3C). In Europa la norma armonizzata
è **EN 301 549**: la v3.2.1, quella citata dalla Direttiva (UE) 2016/2102 sul
settore pubblico, recepisce WCAG 2.1 AA per intero; le revisioni successive si
allineano a 2.2. Puntare a **2.2 AA** copre entrambe — 2.2 aggiunge criteri
senza toglierne, con l'unica eccezione di 4.1.1 Parsing, dichiarato obsoleto
perché i parser moderni lo rendono un non-problema.

L'**European Accessibility Act** (Direttiva (UE) 2019/882, in applicazione dal
**28 giugno 2025**) riguarda prodotti e servizi come e-commerce, banche,
trasporti, e-book. **Un CV personale non rientra nel suo campo di
applicazione**: qui lo standard è una scelta del progetto, non un obbligo di
legge. Vale comunque per intero — è anche il lavoro che Giulio vende.

### 1.4.3 Contrasto minimo (AA)

| Testo | Rapporto richiesto |
| ----- | ------------------ |
| Normale | **4.5:1** |
| Grande — **≥24px** (18pt), oppure **≥18.66px se bold** (14pt bold) | **3:1** |

⚠️ **La soglia del testo grande è 18.66px in grassetto, non 18px.** Questa
guida ha detto "≥18px bold" fino al 2026-08-11: era sbagliato, e sbagliato
dalla parte pericolosa — un titolo a 18px bold cade fra le due soglie e gli
serve 4.5:1, non 3:1.

→ Verificare sempre `--color-text-muted` su `--color-bg`.
→ Non aumentare la trasparenza di `--color-text-muted` senza ricalcolare il ratio.
→ **L'alpha conta.** Su fondo scuro un testo chiaro con alpha < 1 si spegne
  verso lo sfondo: il rapporto va calcolato sul colore **composto**, non su
  quello dichiarato.
→ **Anche il fondo conta.** Qualunque velo chiaro sopra l'ottanio (un
  gradiente, un bagliore, un overlay) alza la luminanza dello sfondo e toglie
  contrasto a tutto il testo che ci sta sopra. Se si aggiunge un velo, il
  rapporto va rifatto **nel punto in cui il velo è più intenso**.

### 1.4.11 Contrasto non testuale (AA) — spesso dimenticato

**3:1** per: bordi di campi e controlli, icone che portano informazione,
**indicatori di focus**, confini di componenti. Non si applica a decorazioni
pure (una linea sfumata, un glow) né a loghi.

### Le dimensioni del testo: cosa dice davvero la norma

**WCAG non impone nessuna dimensione minima del carattere.** Non esiste un
criterio che dica 12px, 14px o 16px. Chi cita "minimo 16px" sta citando il
default dei browser o le linee guida di Apple/Google, non lo standard.

Quello che la norma richiede davvero sul testo è:

| Criterio | Cosa impone |
| -------- | ----------- |
| **1.4.4** Ridimensionamento (AA) | Il testo deve arrivare al **200%** senza perdere contenuto o funzionalità |
| **1.4.10** Reflow (AA) | Contenuto utilizzabile a **320px** di larghezza equivalente senza scorrimento su due assi |
| **1.4.12** Spaziatura del testo (AA) | Non deve rompersi con interlinea **1.5×**, spaziatura lettere **0.12em**, parole **0.16em**, paragrafi **2×** |

→ **Il meccanismo che conta è `rem`, non il numero di px.** Un testo di 12px
  in rem, che a zoom 200% diventa 24px, è conforme; un 16px in px fisso che
  non scala non lo è. È il motivo per cui in questo progetto i px sono
  banditi (vedi memoria `feedback-rem-non-px`).
→ Il pavimento dei 12px più giù è una **convenzione di progetto**, non un
  requisito di legge. È una buona convenzione — ma non va difesa citando
  WCAG, e non va anteposta a una scelta di leggibilità migliore.
→ Fra i due, **1.4.12 è il criterio che questo sito rischia di più**: layout
  a griglia con altezze fisse e testo in maiuscolo spaziato si rompono
  esattamente lì.

### 2.5.8 Dimensione del target (AA, nuovo in 2.2)

Ogni bersaglio toccabile almeno **24×24 px CSS**, salvo eccezioni (link
inline nel testo, spaziatura equivalente). Vale per i toggle delle pagine
`tools/`, per lo switch di mode e di lingua, per il FAB.

### Focus — tre criteri, non uno

**2.4.7 Focus Visible (AA):** `focus-visible` è definito in global.css — **non sovrascriverlo mai** con `outline:none`.
**1.4.11 (AA):** l'indicatore di focus deve avere **3:1** rispetto a ciò che lo circonda — non basta che ci sia, deve vedersi.

⚠️ L'anello di focus del sito usa `--color-accent`, e su ottanio i margini
sono stretti: **creative 3.62:1** contro una soglia di 3.00:1.
Conforme, ma con poco margine — una schiarita del fondo lo fa cadere. È esattamente quello che è successo sull'ingresso, dove col fondale
illuminato l'anello arancione è sceso a **2.57:1**: lì è stato portato
all'inchiostro chiaro (6.4:1 su tutte e quattro le schede). **Un anello di
focus non è un elemento di marca** — è l'unica cosa che dice a chi naviga da
tastiera dove si trova. Se serve il colore, va accompagnato da un secondo
anello di contrasto opposto (`box-shadow: 0 0 0 4px` scuro).
**2.4.11 Focus Not Obscured, Minimum (AA, nuovo in 2.2):** l'elemento che riceve il focus non può restare **nascosto** dietro barre sticky, FAB o banner di consenso. Su questo sito è un rischio concreto: c'è una navbar sticky, un FAB e un banner.

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

**Movimento:** `@media (prefers-reduced-motion: reduce)` è già in global.css — rispettarlo sempre con `!important` su duration.
Il criterio che lo riguarda, **2.3.3 Animation from Interactions, è AAA**, non AA: questa guida lo ha etichettato AA fino al 2026-08-11. Rispettarlo resta la regola del progetto, ma non va citato come obbligo AA.
Il criterio AA sul movimento è un altro: **2.2.2 Pause, Stop, Hide** — qualunque animazione automatica che duri più di 5 secondi e parta da sola deve poter essere fermata.
E **2.3.1 Tre lampeggi (A)**: niente che lampeggi più di 3 volte al secondo.

**3.3.8 Autenticazione accessibile, minimo (AA, nuovo in 2.2):** un campo
password non può vietare **incolla** né richiedere di trascrivere a memoria.
Riguarda direttamente le pagine `tools/` con la passphrase: non aggiungere mai
`onpaste="return false"` o simili.

**3.1.1 Lingua della pagina (A):** `<html lang>` corretto su ogni route — `it`
sulle pagine IT, `en` su quelle `/en`. Con due alberi di pagine è una
divergenza facile da introdurre.

---

## Mode System — Regola Fondamentale

Il mode NON cambia template, NON cambia pagina.
Cambia solo l'**enfasi visiva** tramite `data-state="active|passive"`:

```html
<div class="cv-card" data-tags="tech creative">...</div>
```

- Card con tag corrispondente al mode → `opacity: 1` (active)
- Altre card → `opacity: var(--card-opacity-passive)` — mai `display:none` (sono sussurri)

⚠️ Il meccanismo `data-state` / `data-tags` descritto qui **non è più vivo**: lo
guidava `cv.astro`, cancellato il 2026-08-26 col resto del sito storico. Ne
restano solo le regole in `global.css`, che oggi nessun elemento indossa. La
regola di disegno invece vale ancora, ed è quella che conta: una card fuori
lente si abbassa di opacità, non sparisce. Chi la reimplementerà parta da lì,
non dal CSS orfano.

---

## Oggetti Knolling

8 PNG con sfondo trasparente in `cv-site/public/knolling/`:

| File              | Mode                    | Significato simbolico         |
| ----------------- | ----------------------- | ----------------------------- |
| `laptop.webp`      | tech       | Il lavoro digitale, il codice |
| `flashlight.webp` | tech       | Illuminare problemi complessi |
| `multitool.webp`   | tech + creative  | Versatilità, problem solving  |
| `camera.webp`      | creative                | Fotografia, visione estetica  |
| `megaphone.webp`   | creative + human | Comunicazione, palco, voce    |
| `chess.webp`       | human      | Strategia, pensiero laterale  |
| `plant.webp`       | human      | Crescita, cura, impatto       |
| `compass.webp`     | creative + human | Orientamento, esplorazione    |

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
/ · /en   (components/HomeEntryPage.astro)
  → Intro GO: le due lettere atterrano nel nome, il resto compare
    carattere per carattere, gli oggetti si posano a onda (lab-home-intro.ts).
    Tornando è compressa a 20ms: un clic sul logo l'ha già marcata come vista.
  → Una schermata per volta, con aggancio (lab-home-scroll.ts): il piano
    knolling con gli otto oggetti, "Chi sono", poi le tre sezioni-lente.
  → CTA "GO to …" → l'oggetto della sezione riceve il nome condiviso
    (lens-transition.ts) e vola nella testata della lente.

/design · /tech · /ai   (+ /en/…)   (components/CvLensPage.astro)
  → Dati da cv.ts / cv.en.ts via @cv-data
  → La lente cambia SOLO l'enfasi visiva: stesso template, stessa struttura,
    stesso ottanio. Si sceglie dalla tendina in barra, ed è un indirizzo —
    non uno stato in localStorage.
  → Il logo GO riporta all'ingresso e l'oggetto rivola al suo posto nel
    knolling (script inline in HomeEntryPage.astro).
```

⚠️ Nessuna di queste due pagine è un file di rotta: sono componenti che
ricevono `locale`, e le quattro rotte sono gusci da otto righe. Vedi
`AGENTS.md` § "IT ↔ EN parity" prima di aggiungerci un `if`.

---

## Componenti Gamification

| Componente                   | Ruolo narrativo                                                                  |
| ---------------------------- | -------------------------------------------------------------------------------- |
| `<go-logo>`                  | Ancora universale — click = ritorno all'ingresso, con l'oggetto che rivola al suo posto. Mode-reattivo (ciano/arancio/oro) |
| Sezioni-lente (ingresso)     | Non pulsanti: **portali** — una schermata per lente, e l'oggetto che attraversa è ciò che rende il passaggio un ingresso e non un salto |
| Oggetti knolling             | Ognuno è un mestiere posato sul tavolo: sono loro a viaggiare fra le pagine, non le card |
| Knolling objects             | Risposta ambientale alla scelta: `is-hero` / `is-dim`                            |
| Preloader GO                 | Rituale iniziatico — GSAP timeline: glow flash → sfuma → G/O atterrano nel nome  |

---

## Standard Awwwards — Checklist

| Pattern                 | Libreria / Metodo                              | Stato                           |
| ----------------------- | ---------------------------------------------- | ------------------------------- |
| Smooth scroll           | `Lenis` (`lerp: 0.15`)                         | ✅ implementato in Layout.astro |
| Custom cursor           | Lampada: punto + alone, GSAP quickTo           | ✅ implementato in Layout.astro |
| ScrollTrigger reveals   | GSAP ScrollTrigger, parallasse e ingressi      | ✅ in lab-home-scroll.ts        |
| Split text hero         | char-by-char stagger (G/O separati)            | ✅ in lab-home-intro.ts         |
| Noise grain overlay     | SVG `feTurbulence` filter + CSS `body::after`  | ✅ implementato in global.css   |
| Intro brandizzata       | GSAP timeline (GO → nome)                      | ✅ in lab-home-intro.ts         |
| Magnetic buttons        | `mousemove` + GSAP translate                   | ❌ mai implementati             |
| View Transitions        | `@view-transition` fra documenti, oggetto condiviso | ✅ sono LA transizione del sito |
| Responsive Mobile-First | Named media query (`@custom-media`, postcss)   | ✅ parziale                     |
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

Hardware-accelerato. Applicabile a una sezione con `IntersectionObserver`.

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
| `--fs-12`     | 0.75rem  | 12  | **Pavimento assoluto** — solo meta/UI-chrome, mai un dato che l'utente deve leggere (vedi criterio sotto) |
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
(lo faceva anche `SkillSquare.astro`, con due clamp in `cqi` e pavimento a
`--fs-12`/`--fs-10`: componente cancellato il 2026-08-26, regola invariata).

### Il criterio giusto per `--fs-12`: natura del dato, non tipo di componente

Il vecchio criterio ("eyebrow, chip, meta, badge" — un elenco di **nomi di
classe**) ha causato un bug reale (2026-07-30, feedback esterno): il livello
CEFR delle lingue (`B2`, `C1`...) era a `--fs-12` perché il blocco si chiamava
`.lang-chip` — ma non era meta decorativa, era il dato stesso che un recruiter
cerca. Chiamarsi "chip" non basta a qualificare per il pavimento.

**Il criterio è**: *l'utente deve leggerlo per informarsi su qualcosa*, non
*che classe/componente lo contiene*. In pratica:

- **Resta a `--fs-12`**: controlli di navigazione (switch mode/lingua, tab,
  trigger di dropdown), badge di stato brevi, tag/chip di parole singole a
  basso rischio (interessi, keyword feedback), eyebrow puramente
  decorativi, meta di sistema (footer credit, page-number, legend).
- **Sale almeno a `--fs-14`**: nomi propri (istituzioni, cluster, progetti,
  persone), date/timeline, descrizioni anche brevi, credenziali/ID
  verificabili, risultati misurabili, qualunque frase che spiega un concetto
  (es. le label degli assi del T-shape).
- Nel dubbio: chiedersi se qualcuno con un lieve difetto visivo, leggendo
  solo quell'elemento isolato, capirebbe l'informazione che porta. Se la
  risposta è "solo se lo ingrandisce", non è al pavimento giusto.

### Regole di dimensione — cosa è norma e cosa è convenzione

Distinzione da tenere ferma, perché la guida le ha confuse fino al 2026-08-11
e la confusione ha prodotto una scelta peggiore in nome di una regola
inesistente:

**Norma (WCAG 2.2 AA — non negoziabile):**

- Il testo deve reggere **zoom 200%** (1.4.4) e **reflow a 320px** (1.4.10)
  → in pratica: sempre `rem`, mai `px`, mai altezze fisse che tagliano.
- Il testo deve sopravvivere a **interlinea 1.5 / lettere 0.12em / parole
  0.16em / paragrafi 2×** (1.4.12) applicati dall'esterno.
- **Contrasto 4.5:1**, o 3:1 solo sopra 24px (18.66px se bold) — vedi
  § Accessibilità. **Non esiste una soglia di dimensione minima nella norma.**

**Convenzione di progetto (buona, ma è una scelta nostra):**

- **12px come pavimento** per qualunque testo che l'utente deve leggere.
  Motivo reale: sotto quella soglia la resa di JetBrains Mono e Lexend
  peggiora e il testo secondario diventa faticoso — non "lo dice WCAG".
- **10px (`var(--fs-10)`) è un'eccezione**, non uno step normale: SOLO
  badge/timestamp brevissimi (2-4 caratteri) in ALL CAPS + bold + alto
  contrasto — es. `EXP`/`AVA`/`BAS`. Una frase o una parola intera non
  qualifica: va a `--fs-12`.
- **Body:** 16px su mobile, 14-16px su desktop.
- **Line-height:** 140-150% per qualunque blocco a `--fs-12`/`--fs-14`. Mai
  sotto 1.3 ai corpi piccoli. (Questo sì tocca la norma: 1.4.12 chiede che
  1.5 non rompa il layout.)
- **Font-weight:** mai 300/400 sotto i 14px.

### Prima del corpo, guarda il trattamento

A parità di pixel, quello che decide la leggibilità è spesso il trattamento,
non la dimensione — e la guida non lo diceva:

- **ALL CAPS** toglie alla parola il suo profilo (ascendenti e discendenti):
  si legge compitando invece che riconoscendo. Su una frase è un costo vero;
  su una parola di etichetta è trascurabile.
- **Tracking largo** (≥0.15em) scolla le lettere e allarga la riga anche del
  20%: peggiora la lettura **e** fa andare a capo di più.
- **Monospaziato in prosa** ha lettere meno differenziate del proporzionale.

Quindi: se una riga è poco leggibile, prima di alzare il corpo, prova a
togliere il maiuscolo o a stringere il tracking. Alzare il corpo di una riga
in mono maiuscolo spaziato la rende **più larga** senza renderla molto più
leggibile — errore commesso il 2026-08-11 su `.lh-cred` nell'ingresso.

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
- Velocità: `lerp: 0.15`. Questa guida ha detto `0.08` fino al 2026-08-26,
  ed era sbagliato: il valore è stato alzato in `ab113a9` perché a 0,08 lo
  scorrimento continuava per troppo tempo dopo il gesto, e su trackpad
  sembrava che la pagina non rispondesse. Fra doc e codice vince il codice.
- `(window as any).__lenis` esposto globalmente per pagine che ne hanno bisogno

---

## CSS — Regole di Igiene

- **Un solo blocco per selettore** — niente `.reveal` definito due volte con varianti diverse
- **`.reveal` / `.is-visible` / `.visible` in `global.css` non le indossa più nessuno**: erano del sito cancellato il 2026-08-26. Non costruirci sopra credendole vive — o si tolgono, o si riusano sapendo che partono da zero
- **I token definiti devono essere usati** — se non sono referenziati con `var()`, rimuoverli
- **Nessun colore inline** — neanche negli `style=""` degli oggetti knolling (solo `--kx`, `--ky`, ecc.)

---

## Regole per il Codice UI

- **Mobile-First** — costruisci sempre dal mobile, poi scala a desktop
- **CSS custom properties + file CSS per-sezione** (`global` / `cv-page` / `index-page` / `work-page`) — mai colori hardcoded, mai CSS inline, mai classi utility inventate
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


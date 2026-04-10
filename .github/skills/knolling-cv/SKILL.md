---
name: knolling-cv
description: "Regole concettuali e strategia del Digital CV di Giulio Occhipinti. Carica quando: devi costruire una nuova sezione, aggiungere animazioni, decidere il comportamento delle card, scegliere colori o layout, gestire i 3 mode (tech/creative/human), capire come i dati in cv.ts si traducono in UI, o ragionare sull'esperienza utente complessiva del sito."
---

# Giulio Occhipinti Digital CV — "The Explorer's Journey"

## 1. Obiettivo Strategico

Trasformare un curriculum statico in un'**esperienza di esplorazione interattiva**.
Il sito non deve "elencare", deve **"dimostrare"**.

- **Target:** Recruiter stanchi, CTO in cerca di leadership, Clienti in cerca di visione creativa.
- **Tone of Voice:** Professionale, innovativo, audace ma estremamente curato nei dettagli (**Pixel Perfect**).
- **Frase guida:** "Chi sei, dipende da come mi guardi." — Lo stesso profilo, tre prospettive, tre storie vere.

---

## 2. Filosofia "Yes, And..." (Impro Logic)

Il progetto applica la logica dell'improvvisazione teatrale al software:
- Ogni competenza tecnica (Angular, Lit, AI) è collegata a una soft skill umana o creativa.
- Il codice deve essere **"accogliente"**: se l'utente sceglie una prospettiva, il sito risponde
  **"Sì, e..."** — aggiungendo dettagli rilevanti di quell'anima **senza nascondere il resto**.
- Le card passive diventano **sussurri** (bassa opacity), non silenzio: invitano alla scoperta.

Il sito è anche ispirato alla **fotografia Knolling**: ogni elemento (card, skill, esperienza) è un
"oggetto" disposto su un piano visivo come un inventario. Tutto è visibile, catalogato, intenzionale.

---

## 3. Journey Map & Gamification

- **EntryPoint — The Choice:** 8 oggetti knolling su sfondo Ottanio `#084943`.
  L'utente non clicca solo un tasto: **"attiva" un'identità**.
- **The Mode System:**

| Mode | Colore accent | Target | Cosa enfatizza |
|---|---|---|---|
| `tech` | Cyan `rgba(0,255,200,1)` | CTO, recruiter tecnico | Precisione, architettura, Angular, Lit, AI, microfrontend |
| `creative` | Arancione `rgba(255,107,53,1)` | Art director, agenzia creativa | Storytelling, estetica, fotografia, video, teatro, "X-Factor" |
| `human` | Oro `rgba(240,200,127,1)` | HR, fondatore, no-profit | Etica, leadership, problem solving, impatto sociale |

- **Gamification:** Il passaggio tra modalità è fluido (GSAP). Le card passive non scompaiono
  del tutto — diventano **sussurri** (bassa opacity), invitando alla scoperta.

**Regola fondamentale**: il mode NON cambia template, NON cambia pagina.
Cambia solo l'**enfasi visiva**: le card con `data-tags` che includono il mode attivo
vanno a `opacity: 1` (active), le altre a `--card-opacity-passive` (mai `display:none`).

---

## 4. Architettura Tecnica

- **Data-Driven:** `src/data/cv.ts` è il cuore pulsante. Ogni componente Lit o pagina Astro
  consuma questi dati in modo tipizzato via alias `@cv-data`.
- **UI Stack:** Bento Grid per le skills · GSAP per le animazioni knolling · Astro View Transitions
  tra `index.astro` e `cv.astro` · NanoStores persistent per il mode.
- **MCP Integration:** Il CV è leggibile dalle macchine (AI) tanto quanto dagli umani.
  `src/data/cv.ts` alimenta sia il sito che i tool MCP.

### Colori — sistema fisso

Lo sfondo è **sempre ottanio** `rgba(8,73,67,1)` in tutti e 3 i mode.
Solo `--color-accent` cambia. Mai usare colori hardcoded — sempre CSS custom properties.

```css
--color-bg: rgba(8, 73, 67, 1)          /* ottanio — invariabile */
--color-surface: rgba(12, 95, 87, 0.5)  /* superfici card */
--color-border: rgba(255, 255, 255, 0.12)
--color-text-primary: rgba(245, 240, 230, 1)
--color-text-muted: rgba(180, 210, 205, 0.7)
--color-accent: /* cambia per mode — vedi tabella §3 */
```

### Architettura card `.cv-card`

```html
<div class="cv-card" data-tags="tech creative">...</div>
```

Il JavaScript in `cv.astro` applica `data-state="active|passive"` confrontando
i tag con il mode corrente. Il CSS gestisce `opacity` e `transform` in base a `data-state`.

### Oggetti knolling (immagini PNG)

8 PNG con sfondo trasparente in `cv-site/public/knolling/`:

| File | Mode | Significato simbolico |
|---|---|---|
| `laptop.png` | tech | Il lavoro digitale, il codice |
| `flashlight.png` | tech | Illuminare problemi complessi |
| `multitool.png` | tech + creative | Versatilità, problem solving |
| `camera.png` | creative | Fotografia, visione estetica |
| `megaphone.png` | creative + human | Comunicazione, palco, voce |
| `chess.png` | human | Strategia, pensiero laterale |
| `plant.png` | human | Crescita, cura, impatto |
| `compass.png` | creative + human | Orientamento, esplorazione |

Posizionamento via CSS custom properties `--kx`, `--ky`, `--kr`, `--ks`. GSAP anima
ingresso e cambio mode (`is-hero` / `is-dim`). Su mobile: `@media (max-width: 639px)`
riposiziona nei corner estremi, lontano dal contenuto centrale.

### Flusso utente

```
/ (index.astro)
  → Attiva un'identità: TECH / CREATIVE / HUMAN
  → GSAP: oggetti knolling "rispondono" alla scelta
  → CTA "Entra nella prospettiva X" → /cv?mode=X (Astro View Transition)

/cv (cv.astro)
  → Dati da cv.ts via @cv-data
  → Navbar sticky con toggle mode (cambia mode senza ricaricare)
  → Sezioni: Hero · Skills Bento · Esperienze · AI Workflow ·
             Soft Skills · Mindset · Progetti · Formazione
  → Mode persiste in localStorage via modeStore.ts
```

### Dati — source of truth

I dati stanno **solo** in `src/data/cv.ts` (IT) e `src/data/cv.en.ts` (EN).
Mai hardcodare testi di contenuto nelle pagine Astro.

Sezioni: `personal` · `social` · `languages` · `experience` · `education` · `certifications`
· `technicalSkills` · `softSkills` · `transversalSkills` · `methodology`
· `growthAreas` · `projects` · `interests` · `socialImpact`

### Skill grid

**Mai barre percentuali.** Quadrati con bordo proporzionale al livello:
- Bordo: 1px / 2px / 3px / 4px (Base → Esperto)
- Glow: solo Avanzato e Esperto, colore `--color-accent`

### AI Workflow — sezione dedicata

Sempre visibile indipendentemente dal mode. Mostra l'uso concreto dell'AI
con `impactScore` come badge (es. `-87% boilerplate`, `+3x velocità`).
Il badge deve sembrare un dato, non marketing — font mono, colore accent.

---

## 5. Istruzioni per l'Agent

Quando scrivi codice per questo progetto:

- **Mobile-First** — costruisci sempre dal mobile, poi scala a desktop.
- **Tailwind 4** per lo styling (non CSS inline, non classi inventate).
- Ogni interazione deve avere un **feedback visivo "wow" ma leggero** — nessuna animazione pesante.
- Se suggerisci testi, **enfatizza l'impatto reale e le storie uniche**:
  es. Film a San Francisco, Torneo di Scacchi, Soccorso Sociale, improvvisazione teatrale.
- Pixel Perfect: spacing, kerning e allineamenti devono essere intenzionali, non approssimativi.
- Tutta la logica TypeScript va nel frontmatter `---` di Astro, non nel template JSX.

---

## 6. THE "GO" CONCEPT (Giulio Occhipinti)
Il brand "GO" è il filo conduttore dell'interfaccia e della logica:
- **GO come Azione:** Ogni interazione deve trasmettere velocità e reattività (Performance First).
- **GO come Interfaccia:** Il logo "GO" funge da pulsante di reset o "Home" universale.
- **GO come Stato:** - [G] = Grounded (L'esperienza solida, il Tech).
    - [O] = Open (L'apertura mentale, la Creatività e l'Umano).
- **CTA Semantica:** Non usare "Scopri di più", usa "GO Tech", "GO Creative", "GO Human".

### Istruzione per il Codice:
Ogni volta che generi un componente di navigazione, usa il prefisso `go-` (es. `<go-button>`, `<go-card>`) e implementa micro-interazioni che diano la sensazione di "partenza/lancio".

---

## 7. Standard Awwwards — Checklist Tecnica

Questi pattern differenziano un sito "buono" da uno che vince premi. **Tutti devono essere presenti.**

### Must-Have
| Pattern | Libreria / Metodo | Stato |
|---|---|---|
| Smooth scroll | `Lenis` | da implementare |
| Custom cursor | CSS + GSAP follower | da implementare |
| ScrollTrigger reveals | GSAP ScrollTrigger | da implementare |
| Split text hero | carattere per carattere stagger | da implementare |
| Noise grain overlay | SVG `feTurbulence` filter + CSS | da implementare |
| Preloader brandizzato | GSAP timeline | da implementare |
| Magnetic buttons | `mousemove` + GSAP translate | da implementare |
| View Transitions | `astro:transitions` | ✅ presente |
| Responsive Mobile-First | Tailwind breakpoints | ✅ parziale |

### Principi Awwwards osservati (Ravi Klaassens HM Apr 2026 + Pedro's CV Nominee 2023)
- **Ogni sezione ha "un dettaglio con cui giocare"** — interazione = messaggio
- **Preloader → Identity → Transition** è il framework narrativo della struttura siti award
- **Tipografia display bold + tracking stretto** — non body font standard per i titoli
- **Transizioni di pagina fluide** — mai un flash bianco o un caricamento abrupt
- **Cursor come firma visiva** — il cursore è parte del brand, non solo chrome
- **Impatto verticale nel fold iniziale** — il recruiter deve restare nei primi 3 secondi

### Typography Scale (Awwwards-grade)
```css
/* Titoli display — non usare Inter regular per h1, h2 grandi */
/* h1 hero: clamp(4rem, 12vw, 10rem) — bold/black weight */
/* h2 sezione: clamp(2rem, 5vw, 4.5rem) — bold */
/* Tagline/label uppercase: 0.65rem, letter-spacing: 0.3em */
/* Body text: max 1.1rem, line-height: 1.65 */
```

### Cursor Custom — Regole
- Dimensione default: 12px cerchio pieno (colore accent)
- Su hover interattivo: si espande a 40px, outline, lieve blur
- Su testo: cursore visibile normale, il custom si rimpicciolisce
- Non mostrare mai il cursore di default del browser su elementi interattivi
- Il cursore cambia colore con il mode (`--color-accent`)

### Smooth Scroll — Regole
- `Lenis` in `Layout.astro`, integrato con GSAP ticker
- `data-lenis-prevent` su modal/overlays
- Velocità: `lerp: 0.08` (più lento = più premium)

### Performance Checklist
- Immagini knolling: `loading="eager"` solo above-fold, resto `lazy`
- Font: subset inter già caricato. **Da aggiungere**: font display per titoli hero
- GSAP: usare `will-change: transform` solo sugli elementi animati
- Preloader: blocca render → mostra tutto insieme dopo load (no FOUC)


- Non usare `display:none` per le card passive — sono sussurri, non silenzi
- Non hardcodare colori — sempre CSS custom properties
- Non aggiungere barre percentuali per le skill
- Non cambiare template/layout al cambio mode — solo opacity/scale
- Non modificare la struttura dei tipi in `cv.ts` senza aggiornare `cv.en.ts`
- Non scrivere su `stdout` nel layer MCP (`src/`) — usare il logger
- Non fare `git commit` o `git push` senza richiesta esplicita dell'utente

---
name: knolling-cv
description: "CARICA SEMPRE per qualsiasi richiesta su questo progetto. Regole concettuali, design system e strategia del Digital CV di Giulio Occhipinti per trovare lavoro. Carica quando: animazioni, preloader, GO, logo, gamification, journey, knolling, card, mode tech/creative/human, skill grid, bento, GSAP, Flip, Lit, GoLogo, NavBar, colori, tipografia, layout, /cv, /index, mobile, responsive, Awwwards, job hunting, recruiter, CTO, art director, nuova sezione, dati cv.ts, UI, UX, esperienza utente, ottanio, accent, modeStore, ModeSwitcher, islands, animazione, interazione, componente, sezione, pagina."
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

---

## 10. Regole per i Test

I test esistono **solo per il corretto funzionamento del codice in sviluppo** — non vengono mai deployati.

### Principi

- **Mai committare test rotti.** Se un test fallisce, correggi il codice o il test prima di pushare.
- **I test non sono documentazione** — non aggiungere docstring ai test se non esistevano.
- **I test non modificano i dati di produzione** (`cv.ts`, `cv.en.ts`) — li leggono e ne verificano l'integrità.
- **Nessun file di test viene incluso nel build di produzione.**

### Struttura dei test

| Layer | Tool | Cartella | Env |
|---|---|---|---|
| MCP/HTTP (`src/`) | Vitest | `src/**/*.test.ts` | Node |
| cv-site logic (stores) | Vitest + jsdom | `cv-site/src/**/*.test.ts` | jsdom |

### Regola `.gitignore` e build
- I file `*.test.ts` sono esclusi dal `tsconfig.json` build output (`dist/`)
- Il `vitest.config.ts` di root include solo `src/**/*.test.ts`
- Il build Astro non include test (Astro ignora i file `.test.ts` per default)

### Cosa testare (priorità)
1. **Error classes** (`src/http/errors.ts`) — costruttori, statusCode, toJSON
2. **HTTP routes** (`src/http/app.ts`) — health, openapi.json, 404, error handler
3. **MCP tools** (`src/tools/*.ts`) — registrazione e handler logica
4. **CV data integrity** (`src/data/cv.ts`) — campi required, formati date, valori enum
5. **CV parity EN/IT** (`src/data/cv.en.ts`) — stessa struttura dell'italiano
6. **modeStore logic** (`cv-site/src/islands/stores/modeStore.ts`) — setMode, initMode, guardie

### Cosa NON testare
- Componenti Lit (GoLogo, ModeSwitcher) — dipendono dal browser reale
- Pagine Astro (index.astro, cv.astro) — dipendono dal build Astro
- Animazioni GSAP — impossibili da testare in unit test

---

## 8. Scopo Professionale — Job Hunting

Il sito **non è un portfolio sperimentale**: è uno strumento attivo di ricerca lavoro.
Giulio Occhipinti è un Senior Frontend Developer con ~12 anni di esperienza.

**Il sito deve convincere questi tre profili in ≤ 3 secondi:**

| Profilo | Cosa cerca | Cosa deve vedere subito |
|---|---|---|
| **Recruiter generalista** | Affidabilità, seniorità, comunicazione | Label "Digital CV", layout pulito, leggibile |
| **CTO / Tech Lead** | Architettura, AI workflow, stack moderno | Angular, Lit, microfrontend, impactScore |
| **Art Director / Agenzia** | Estetica, storytelling, "X-Factor" | Fotografia, teatro, audio/video, knolling |

**Regola d'oro:** ogni elemento UI deve essere sia **bello** che **argomentabile in un colloquio**.
- Se un recruiter chiede "perché knolling?": "visualizzazione come inventario intenzionale — trasparenza radicale sul profilo"
- Se chiede "perché 3 mode?": "lo stesso profilo, tre frame narrativi — rispetto per il tempo di chi guarda"
- Se chiede "perché il preloader con GO?": "il brand si fonde con la persona prima che l'utente interagisca — coerenza narrativa"

---

## 9. GO come Journey — Struttura Gamification

### La Narrativa in 3 Atti

**Atto 0 — Inizializzazione (Preloader)**
Le lettere `G` e `O` appaiono grandi a schermo. Mentre la barra cresce, volano verso il nome:
`G` → si unisce a "**G**iulio", `O` → si unisce a "**O**cchipinti".
È il **rituale iniziatico**: il brand fagocita la persona. Il viaggio ha già inizio.

**Atto 1 — La Scelta (Landing `/`)**
8 oggetti knolling su sfondo ottanio, 3 card mode, nessuna istruzione esplicita.
L'utente è curioso, non guidato. Scegliere TECH / CREATIVE / HUMAN è come **scegliere il proprio personaggio** in un RPG — la scelta rivela chi è chi guarda, non solo chi è Giulio.

**Atto 2 — Il Viaggio (`/cv`)**
Le card passive diventano **sussurri** (opacity bassa, blur): non spariscono ma si fanno da parte.
L'utente esplora o torna senza mai ricominciare da zero. Il `<go-logo>` è il portale di ritorno.

### Componenti Gamification e Responsabilità Narrativa

| Componente | Ruolo narrativo |
|---|---|
| `<go-logo>` | Ancora universale — click = Master Reset a `/`. Mode-reactivo (cyan/orange/gold) |
| Mode cards (`index.astro`) | Non pulsanti: **portali**. Devono dare sensazione di "entrare in un mondo" |
| GSAP Flip bento (`cv.astro`) | Ribilanciamento dello spazio al cambio mode — "Yes, And..." della griglia |
| Knolling objects | "Risposta ambientale" alla scelta: `is-hero` / `is-dim` (come un ambiente che reagisce) |
| Preloader GO animation | Rituale iniziatico — non animazione decorativa, ma evento narrativo fondante |

### Regole di Coerenza Narrativa

1. Non usare "Vedi", "Scopri", "Leggi" come CTA — usa `GO`, "Esplora", "Entra"
2. Ogni sezione di `/cv` deve avere un **micro-dettaglio con cui giocare** (hover, reveal, glow)
3. Il mode cambia il **focus e l'umore** della pagina — mai la struttura o il template
4. Il `<go-logo>` deve essere sempre visibile e sempre cliccabile — è l'ancora narrativa
5. Le card passive sono **susurri**, non silenzi — mai `display:none`, sempre `opacity` ridotta

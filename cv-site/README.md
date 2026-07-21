# cv-site — Digital CV di Giulio Occhipinti

Sito Astro statico che costituisce il CV interattivo. Visuale, esplorabile, costruito come un'esperienza
narrativa in **quattro modalità**: TECH, CREATIVE, HUMAN, MANAGEMENT.

Il design si ispira alla fotografia **knolling / flat lay**: ogni elemento del CV (esperienza, skill, progetto)
è un "oggetto" disposto su un piano visivo, cliccabile e contestuale alla modalità attiva.

> Questo è il frontend del progetto. Il layer MCP/HTTP si trova nella root (`../src/`).

---

## Quickstart

```bash
cd cv-site
npm install
npm run dev      # dev server su http://localhost:4321
npm run build    # build statica → dist/
npm run preview  # anteprima del build
```

---

## Stack tecnologico

| Tecnologia           | Versione   | Ruolo                                                          |
| -------------------- | ---------- | -------------------------------------------------------------- |
| **Astro**            | 5.x        | Shell statica, routing, rendering SSG, `compressHTML`          |
| **Lit**              | 3.x        | Web components interattivi (islands pattern)                   |
| **Tailwind CSS**     | 4.x        | Grid, spacing, utilities — zero hardcode CSS                   |
| **NanoStores**       | —          | Stato globale mode (`tech/creative/human/management`)          |
| **GSAP**             | 3.x        | Animazioni: timeline, ScrollTrigger, `back.out`, `elastic.out` |
| **View Transitions** | API nativa | Transizioni tra pagine (disabilitata per click mode)           |

---

## Mode system — 4 modalità globali

Ogni mode è una **route statica Astro** (`[mode].astro`), non un URL param. Lo sfondo è
sempre ottanio `rgba(8,73,67,1)` — cambia solo `--color-accent`:

| Mode         | Route         | Persona                 | Accent                       |
| ------------ | ------------- | ----------------------- | ---------------------------- |
| `tech`       | `/tech`       | Software Developer      | Cyan `rgba(0,255,200,1)`     |
| `creative`   | `/creative`   | Web & UX Designer       | Arancione `rgba(255,107,53,1)` |
| `human`      | `/human`      | AI & Digital Specialist | Oro `rgba(240,200,127,1)`    |
| `management` | `/management` | Project Manager         | Viola `rgba(180,100,255,1)`  |

Il mode attivo porta le card con tag corrispondente a `opacity: 1`, le altre a `opacity: var(--card-opacity-passive)`.
Stato sincronizzato via `modeStore.ts` (nanostores/persistent); su `/en/cv` (pagina statica
senza mode nel path) il mode è un filtro puramente client-side letto da localStorage.

---

## Struttura del progetto

```
cv-site/
│
├── public/
│   ├── og-cover.jpg             ← Immagine Open Graph (screenshot reale della home)
│   ├── cv/                      ← PDF del CV generati da ../scripts/generate-cv-pdf.ts (IT + EN)
│   ├── qr/                      ← QR code statici (varianti chiare/scure, firma, biglietto)
│   ├── fonts/
│   │   └── Lexend/              ← lexend-latin-800-normal.woff2 (preloaded, font-display: block)
│   ├── knolling/                ← Asset visivi knolling (camera, compass, laptop, plant, ecc.)
│   └── photos/                  ← Foto personali (trip/, belongings/) per la sezione "Chi sono"
│
└── src/
    ├── components/              ← Componenti Astro (server-rendered, statici)
    │   ├── ContactFooter.astro  ← Footer contatti condiviso
    │   ├── WorkDesignSystem.astro ← Sezione design system nei case study /work
    │   └── cards/               ← Card componenti riutilizzabili
    │       ├── ExpCard.astro    ← Card esperienza lavorativa (tag mode, companyLogo, impactScore)
    │       ├── AiCard.astro     ← Card AI-enhanced workflow (badge impactScore, mode-aware)
    │       ├── ProjectCard.astro← Card progetto (tech stack, link, tag)
    │       ├── SkillSquare.astro← Skill quadrato con glow proporzionale al livello (NO barre %)
    │       ├── SoftItem.astro   ← Item soft/transversal skill (tag mode)
    │       └── WorkIndexCard.astro ← Card indice dei case study /work
    │
    ├── islands/                 ← Lit web components (client-side hydration)
    │   ├── GoLogo.lit.ts        ← <go-logo>: logo animato, click = reset a /, colore per mode
    │   ├── FloatingMenu.lit.ts  ← <floating-menu>: FAB contatti / feedback
    │   ├── SkillForceGraph.lit.ts ← <skill-force-graph>: grafo D3 force-directed (lazy-loaded)
    │   └── stores/
    │       ├── modeStore.ts     ← NanoStore globale mode (tech/creative/human/management)
    │       └── modeStore.test.ts
    │
    ├── layouts/
    │   └── Layout.astro         ← Layout base (head/SEO/JSON-LD, font preload, Lenis, cursor, FAB)
    │
    ├── lib/
    │   └── exp-clusters.ts      ← Definizione condivisa dei cluster esperienza (IT/EN, refs exp+proj)
    │
    ├── pages/
    │   ├── index.astro          ← Entry IT: preloader GO + knolling + scelta del mode
    │   ├── home.astro           ← Landing alternativa con le 4 mode-card
    │   ├── [mode].astro         ← Pagina CV per /tech /creative /human /management
    │   ├── cv.astro             ← Legacy — redirect a /tech
    │   ├── work/                ← index.astro + [slug].astro (case study progetti)
    │   └── en/                  ← Versione inglese (index.astro, cv.astro, work/)
    │
    ├── scripts/                 ← Logica client condivisa (vanilla TS + GSAP)
    │   ├── cv-init.ts           ← Init pagina CV: mode switch, scroll, accordion, carousel feedback
    │   ├── index-init.ts        ← Init home: preloader, knolling, mode card, launch journey
    │   ├── mode-helpers.ts      ← Funzioni pure del mode system (+ mode-helpers.test.ts)
    │   ├── work-journey.ts      ← Animazioni pagine /work
    │   ├── memory-drawer.ts     ← Drawer foto/racconto "Chi sono" (page-flip 3D)
    │   └── intro-seen.ts        ← Flag sessionStorage per saltare l'intro GO al ritorno
    │
    └── styles/
        ├── global.css           ← CSS custom properties per i 4 mode, reset, cursor, focus
        ├── cv-page.css          ← Stili pagina CV ([mode].astro / en/cv.astro)
        ├── index-page.css       ← Stili home/entry
        └── work-page.css        ← Stili pagine /work
```

---

## Regole design — punti chiave

- **Mai barre percentuali per le skill** → usa `SkillSquare` con glow proporzionale al livello
- **Mai hardcode colori** → usa sempre CSS custom properties (`--color-bg`, `--color-accent`, ecc.)
- **CTA knolling landing** → pulsanti `.mode-card__go` con GSAP `back.out(3)` + box-shadow pulse
- **Mobile** → CSS Grid a 15 colonne, item posizionati con `grid-column` + `grid-row`
- **Animazioni** → GPU-only (`transform`, `opacity`), `prefers-reduced-motion` rispettato
- **Entry/Exit asimmetrici** → entrata lenta + ease-out, uscita veloce + ease-in

Specifica completa: [DESIGN.md](./DESIGN.md)

---

## Comandi npm

| Comando              | Azione                                        |
| -------------------- | --------------------------------------------- |
| `npm run dev`        | Dev server Astro con hot reload               |
| `npm run build`      | Build statica produzione → `dist/`            |
| `npm run preview`    | Anteprima del build statico                   |
| `npm test`           | Test Vitest (`mode-helpers`, `modeStore`)     |
| `npm run test:watch` | Test in watch mode                            |

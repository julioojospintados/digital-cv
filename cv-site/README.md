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

| Mode         | URL param          | Focus visivo                     | Tema                  |
| ------------ | ------------------ | -------------------------------- | --------------------- |
| `tech`       | `?mode=tech`       | Architetture, codice, sistemi    | Scuro, neon verde/blu |
| `creative`   | `?mode=creative`   | Racconto, immagine, suono        | Caldo, editoriale     |
| `human`      | `?mode=human`      | Impatto, relazione, presenza     | Neutro carta          |
| `management` | `?mode=management` | Strategia, Agile, consulenza PMI | Blu notte, gold       |

Il mode attivo porta le card con tag corrispondente a `opacity: 1`, le altre a `opacity: var(--card-opacity-passive)`.
Stato sincronizzato via `modeStore.ts` (nanostores/persistent) + URL param.

---

## Struttura del progetto

```
cv-site/
│
├── public/
│   ├── fonts/
│   │   └── Lexend/              ← lexend-latin-800-normal.woff2 (preloaded, font-display: block)
│   └── knolling/                ← Asset visivi knolling (camera, compass, laptop, planter, ecc.)
│       └── knolling-reference.png  ← Foto di riferimento per il layout knolling
│
└── src/
    ├── components/              ← Componenti Astro (server-rendered, statici)
    │   ├── HeroSection.astro    ← Sezione hero della landing page
    │   ├── Navbar.astro         ← Barra di navigazione con <go-logo>
    │   ├── ExperienceSection.astro
    │   ├── EducationSection.astro
    │   ├── SkillsSection.astro
    │   ├── ProjectsSection.astro
    │   └── cards/               ← Card componenti riutilizzabili
    │       ├── ExpCard.astro    ← Card esperienza lavorativa (tag mode, companyLogo, impactScore)
    │       ├── AiCard.astro     ← Card AI-enhanced workflow (badge impactScore, mode-aware)
    │       ├── ProjectCard.astro← Card progetto (tech stack, link, tag)
    │       ├── SkillSquare.astro← Skill quadrato con glow proporzionale al livello (NO barre %)
    │       ├── SoftItem.astro   ← Item soft/transversal skill (tag mode)
    │       └── EduItem.astro    ← Item formazione / certificazione
    │
    ├── islands/                 ← Lit web components (client-side hydration)
    │   ├── GoLogo.lit.ts        ← <go-logo>: logo animato, click = reset a /, colore per mode
    │   ├── ModeSwitcher.ts      ← <mode-switcher>: switcher TECH/CREATIVE/HUMAN/MANAGEMENT
    │   └── stores/
    │       ├── modeStore.ts     ← NanoStore globale mode (tech/creative/human/management)
    │       └── modeStore.test.ts
    │
    ├── layouts/
    │   └── Layout.astro         ← Layout base (head, font preload, global CSS, view transitions)
    │
    ├── pages/
    │   ├── index.astro          ← Landing: knolling layout + CTA GO Tech/Creative/Human/Management
    │   ├── cv.astro             ← Pagina CV completa in italiano
    │   └── en/                  ← (placeholder) Versione inglese
    │
    └── styles/
        └── global.css           ← CSS custom properties per i 4 mode (colori, opacity, ecc.)
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

| Comando           | Azione                             |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Dev server Astro con hot reload    |
| `npm run build`   | Build statica produzione → `dist/` |
| `npm run preview` | Anteprima del build statico        |
| `npm test`        | Esegui test Vitest (`modeStore`)   |

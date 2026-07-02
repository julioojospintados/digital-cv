---
name: knolling-cv
description: "Contesto globale del Digital CV di Giulio Occhipinti. Carica SEMPRE come prima skill per qualsiasi richiesta su questo progetto. Regole trasversali, puntatori alle skill specializzate e DO NOT fondamentali."
---

# Digital CV — Contesto Globale

Questo progetto ha 4 skill specializzate. Carica quella piu pertinente alla richiesta:

| Skill | Quando caricare |
|---|---|
| **identity** `.github/skills/identity/SKILL.md` | Testi, bio, tone of voice, narrativa GO, job hunting |
| **design-system** `.github/skills/design-system/SKILL.md` | UI, animazioni, card, knolling, GSAP, Awwwards |
| **agile-methodology** `.github/skills/agile-methodology/SKILL.md` | Esperienze, Agile, UX/UI, certificazioni, sprint |
| **mcp-architecture** `.github/skills/mcp-architecture/SKILL.md` | Backend, MCP tools, Hono, test, cv.ts, env |
| **partnership-strategy** `.github/skills/partnership-strategy/SKILL.md` | Offerta Fractional, bio servizi, tono PMI, posizionamento |

---

## Regole Trasversali (sempre valide)

### I due sistemi del progetto

| Entry point | Scopo |
|---|---|
| cv-site/ | Sito Astro statico — il CV visuale e interattivo |
| src/ | Server MCP (stdio) + HTTP API (Hono) |

### Mode System — Core

4 mode globali (URL `/<mode>` — route statica Astro):

| Mode | Accent | Focus |
|---|---|---|
| tech (Software Developer) | Cyan `rgba(0,255,200,1)` | Architetture, codice, AI |
| creative (Web & UX Designer) | Arancione `rgba(255,107,53,1)` | Storytelling, estetica, fotografia |
| human (AI & Digital Specialist) | Oro `rgba(240,200,127,1)` | Impatto, relazione, autonomia strategica |
| management (Project Manager) | Viola `rgba(180,100,255,1)` | Metodo, Agile, PMI, consulenza strategica |

Il mode cambia **solo l'enfasi visiva** — mai il template, mai la struttura.
Lo sfondo è **sempre ottanio** rgba(8,73,67,1). Mai hardcodare colori.

### Routing del sito (Astro)

| URL | File | Ruolo |
|---|---|---|
| `/` | `index.astro` | Entry con preloader GO |
| `/home` | `home.astro` | Landing con le 4 mode-card (knolling) |
| `/tech` `/creative` `/human` `/management` | `[mode].astro` | Pagina CV filtrata per mode |
| `/en/cv` | `en/cv.astro` | Versione inglese del CV |
| `/cv` | redirect → `/tech` | Legacy |

### Islands Lit attive

| File | Custom element | Scopo |
|---|---|---|
| `GoLogo.lit.ts` | `<go-logo>` | Logo animato, click = reset a `/`, colore mode-reactive |
| `FloatingMenu.lit.ts` | `<floating-menu>` | FAB: contatti, feedback, AI-section |
| `SkillForceGraph.lit.ts` | `<skill-force-graph>` | Grafo D3 force-directed delle skill |

### Data Source of Truth

### Data Source of Truth

- `src/data/cv.ts` — dati IT (unica fonte di verità)
- `src/data/cv.en.ts` — dati EN (importa i tipi da cv.ts)
- Non modificare i tipi in cv.ts senza aggiornare cv.en.ts.

Sezioni esportate: `personal` · `social` · `languages` · `experience` · `education`
· `certifications` · `technicalSkills` · `softSkills` · `transversalSkills`
· `methodology` · `growthAreas` · `projects` · `interests` · `socialImpact`
· `aiWorkflow` · `valueFlows` · `feedbacks`

L'interfaccia `Feedback` ha: `name`, `role?`, `quote?`, `keywords[]`.

---

## DO NOT — Regole Non Negoziabili

- No display:none per le card passive — sono sussurri, non silenzi (usa opacity ridotta)
- No colori hardcoded — sempre CSS custom properties (--color-accent, --color-bg, ecc.)
- No barre percentuali per le skill — usa il sistema Square/Glow
- No stdout nel layer MCP (src/) — usa logger da src/utils/logger.ts
- No git commit o git push senza richiesta esplicita dell'utente
- No modifiche ai tipi di cv.ts senza aggiornare cv.en.ts
- No logica HTTP in src/index.ts ne logica MCP in src/http.ts

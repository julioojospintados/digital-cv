---
name: knolling-cv
description: "Contesto globale del Digital CV di Giulio Occhipinti. Carica SEMPRE come prima skill per qualsiasi richiesta su questo progetto. Regole trasversali, identità, vocabolario, puntatori alle skill specializzate e DO NOT fondamentali."
---

# Digital CV — Contesto Globale

Questo progetto ha 5 skill specializzate. Carica quella più pertinente alla richiesta:

| Skill | Quando caricare |
|---|---|
| **identity** `.claude/skills/identity/SKILL.md` | Testi, bio, tone of voice, narrativa GO, job hunting — per QUALSIASI testo leggi anche `identity/writing-style.md` (regole mandatorie di scrittura) |
| **design-system** `.claude/skills/design-system/SKILL.md` | UI, animazioni, card, knolling, GSAP, Awwwards |
| **agile-methodology** `.claude/skills/agile-methodology/SKILL.md` | Esperienze, Agile, UX/UI, certificazioni, sprint |
| **mcp-architecture** `.claude/skills/mcp-architecture/SKILL.md` | Backend, MCP tools, Hono, test, cv.ts, env |
| **partnership-strategy** `.claude/skills/partnership-strategy/SKILL.md` | Offerta Fractional, bio servizi, tono per le aziende, posizionamento |

---

## Chi è Giulio (in breve)

**Giulio Occhipinti** — Consulente per l'Innovazione Digitale & Partner Tecnico per piccole e grandi realtà.
Generalista esperto che supporta le aziende a 360° orchestrando **Tecnologia + Design + Metodo**
in un unico ingaggio — mai un solo pilastro isolato. Non un manager da organigramma: entra
nell'azienda, capisce il problema reale, costruisce la soluzione e la fa girare, con le proprie
mani e con l'AI come moltiplicatore. Target: realtà che vogliono scalare senza assumere 10 persone.
Il termine "PMI" è bandito dai testi (decisione 2026-07-12, vedi `identity/writing-style.md`):
usare "realtà" con un qualificatore o "aziende"; in inglese "businesses".

Descrizione lunga, storytelling e narrativa GO → `identity/SKILL.md`.
Posizionamento commerciale e offerta Fractional → `partnership-strategy/SKILL.md`.

## Vocabolario — Regola Ferrea (vale per tutti i testi del progetto)

**EVITA sempre**: "alignment", "stakeholder management", "vertical growth", "ownership",
"KPI-driven", "governance framework", "scalability roadmap", "Team Lead / Manager / Owner",
e qualunque descrizione che riduca Giulio a "developer freelance" o "AI specialist".

**USA sempre**: risoluzione, automazione, velocità di rilascio, impatto sul business,
autonomia strategica, Tecnologia / Design / Metodo (come etichette dei 3 pilastri),
Partner Tecnico, Referente Unico, Facilitatore, fractional, risultato misurabile.

Le skill specializzate possono aggiungere varianti di tono per il proprio contesto
(es. vocabolario Agile in `agile-methodology`, vocabolario tecnico in `mcp-architecture`),
ma la regola base è questa — non ripeterla, solo estenderla se serve un termine specifico.

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
| management (Project Manager) | Viola `rgba(180,100,255,1)` | Metodo, Agile, aziende, consulenza strategica |

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
| `FloatingMenu.lit.ts` | `<floating-menu>` | FAB: contatti, feedback |
| `SkillForceGraph.lit.ts` | `<skill-force-graph>` | Grafo D3 force-directed delle skill |

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
- No logica HTTP in src/index.ts né logica MCP in src/http.ts

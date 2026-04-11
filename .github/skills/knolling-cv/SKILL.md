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

3 mode globali (URL `?mode=...` + localStorage):

| Mode | Accent | Focus |
|---|---|---|
| tech | Cyan rgba(0,255,200,1) | Architetture, codice, AI |
| creative | Arancione rgba(255,107,53,1) | Storytelling, estetica, fotografia |
| human | Oro rgba(240,200,127,1) | Impatto, relazione, autonomia strategica |

Il mode cambia **solo l'enfasi visiva** — mai il template, mai la struttura.
Lo sfondo e **sempre ottanio** rgba(8,73,67,1). Mai hardcodare colori.

### Data Source of Truth

- src/data/cv.ts — dati IT (unica fonte di verita)
- src/data/cv.en.ts — dati EN (importa i tipi da cv.ts)
- Non modificare i tipi in cv.ts senza aggiornare cv.en.ts.

---

## DO NOT — Regole Non Negoziabili

- No display:none per le card passive — sono sussurri, non silenzi (usa opacity ridotta)
- No colori hardcoded — sempre CSS custom properties (--color-accent, --color-bg, ecc.)
- No barre percentuali per le skill — usa il sistema Square/Glow
- No stdout nel layer MCP (src/) — usa logger da src/utils/logger.ts
- No git commit o git push senza richiesta esplicita dell'utente
- No modifiche ai tipi di cv.ts senza aggiornare cv.en.ts
- No logica HTTP in src/index.ts ne logica MCP in src/http.ts

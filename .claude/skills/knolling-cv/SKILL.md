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

3 mode globali (URL `/<mode>` — route statica Astro):

| Mode | Accent | Focus |
|---|---|---|
| tech (Software Developer) | Cyan `rgba(0,255,200,1)` | Architetture, codice, AI |
| creative (Web & UX Designer) | Arancione `rgba(255,107,53,1)` | Storytelling, estetica, fotografia |
| human (Comunicazione & AI) | Oro `rgba(240,200,127,1)` | Impatto, relazione, autonomia strategica |
Il mode cambia **solo l'enfasi visiva** — mai il template, mai la struttura.
Lo sfondo è **sempre ottanio** rgba(8,73,67,1). Mai hardcodare colori.

### Routing del sito (Astro)

| URL | File | Ruolo |
|---|---|---|
| `/` · `/en` | `index.astro` · `en/index.astro` | Ingresso — gusci di `components/HomeEntryPage.astro` |
| `/design` `/tech` `/ai` | `[lens].astro` | Pagina CV — guscio di `components/CvLensPage.astro` |
| `/en/design` `/en/tech` `/en/ai` | `en/[lens].astro` | Le stesse, in inglese: **stesso componente** |
| `/work` · `/work/<slug>` | `work/index.astro` · `work/[slug].astro` | Indice e case study |
| `/en/work` · `/en/work/<slug>` · `/en/privacy` | `en/…` | Controparti EN (ancora file separati) |
| `/privacy` | `privacy.astro` | Informativa |
| `/home` `/cv` `/creative` `/human` `/en/cv` | `astro.config.mjs` | Legacy — 301 di rete, non pagine |

⚠️ **Il sito storico non esiste più** (2026-08-26). `/old-version` e tutto
ciò che serviva solo a lui — cinque pagine, cinque componenti card, l'isola
`SkillForceGraph` con D3, `cv-init.ts`, `index-init.ts`, `mode-helpers.ts`,
tre fogli di stile e `WorkDesignSystem.astro` — è stato cancellato. Vive in
`github.com/julioojospintados/old-digital-cv`. Non ricrearlo qui: se serve
mostrarlo, si deploya quel repo.

⚠️ **Lo slug dell'URL non è la chiave interna.** `creative` si serve su
`/design`, `human` su `/ai`. Le chiavi compaiono ~427 volte nei dati, nel CSS
`[data-mode]`, nei test: la mappa sta in `LENS_SLUGS` / `MODE_BY_SLUG` /
`lensPath()` in `cv-i18n.ts`, ed è l'unico posto dove si costruisce un URL.

### Islands Lit attive

| File | Custom element | Scopo |
|---|---|---|
| `GoLogo.lit.ts` | `<go-logo>` | Logo animato, click = reset a `/`, colore mode-reactive |
| `FloatingMenu.lit.ts` | `<floating-menu>` | FAB: contatti, feedback |


### Parità IT ↔ EN — non solo i testi

**Le pagine EN devono differire dalle IT solo per la lingua.** Nient'altro:
non l'ordine degli elementi, non lo stato di default, non il comportamento,
non la logica che li calcola. Vale per ordine DOM dei mode, voce attiva o
accordion aperto di default, ordinamenti, contenuto delle dropdown.

**Dal 2026-08 non esiste più un'asimmetria legittima.** Ingresso e pagina CV
sono un componente solo che riceve `locale` e rende entrambe le lingue; le
quattro rotte sono gusci da otto righe. Le stringhe stanno in tabelle
tipizzate (`LocaleStrings.ui` in `cv-i18n.ts`, `lab-copy.ts` per la voce):
una chiave che manca in una lingua è un **errore di compilazione**. Se ti
trovi a scrivere `=== "tech"` o `locale === "en" ? A : B` attorno a qualcosa
che non sia un **percorso** o una **stringa**, fermati.

Restano separate `/work` e `/privacy`: lì la parità è ancora tenuta a mano.

Il mode di default è **`creative`** (Design-first). Cambiarlo tocca più file
insieme — l'elenco completo è in `AGENTS.md` → "IT ↔ EN parity".

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
- No divergenze IT/EN oltre la lingua — ordine, default, comportamento e logica devono essere identici (vedi sezione "Parità IT ↔ EN")
- No logica HTTP in src/index.ts né logica MCP in src/http.ts

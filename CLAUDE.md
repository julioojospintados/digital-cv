# Digital CV — Claude Code Instructions

@AGENTS.md

---

## Skills — carica sempre `knolling-cv` per prima

Prima di rispondere a **qualsiasi richiesta** su questo progetto, leggi:

- **`.claude/skills/knolling-cv/SKILL.md`** — contesto globale, identità, vocabolario, mode system, DO NOT trasversali

Poi carica la skill specializzata pertinente alla richiesta (i puntatori completi sono già dentro `knolling-cv/SKILL.md`):

| Skill | Quando |
|---|---|
| `.claude/skills/identity/SKILL.md` | testi, bio, tone of voice, narrativa GO, job hunting |
| `.claude/skills/design-system/SKILL.md` | UI, animazioni, card, knolling, GSAP, Tailwind 4, Awwwards |
| `.claude/skills/agile-methodology/SKILL.md` | esperienze, Agile, UX/UI, certificazioni, sprint |
| `.claude/skills/mcp-architecture/SKILL.md` | backend, MCP tools, Hono, test, cv.ts |
| `.claude/skills/partnership-strategy/SKILL.md` | offerta Fractional, bio servizi, tono per le aziende, posizionamento |

Skill di utilità (non di dominio, non caricare di default):

- `.claude/skills/caveman/SKILL.md` — modalità di risposta ultra-compressa. Invocabile con `/caveman` (livelli: lite/full/ultra/wenyan-*) quando l'utente chiede di ridurre i token o "parlare da caveman". Torna a prosa normale con "stop caveman".

## MCP

Server MCP di progetto dichiarati in `.mcp.json` (root, letto da Claude Code): `mcp-base-template` (server locale che espone i dati di `cv.ts` come tool/resource) e `sequential-thinking`.
`.vscode/mcp.json` è l'equivalente per Copilot/VS Code e include un set più ampio di server — non è letto da Claude Code.

## Comportamento

- Per domande **non legate al codice o al progetto corrente** (ricerche, confronti, decisioni), chiedi prima se conviene ragionare con **Sequential Thinking** step-by-step. Non fare questa domanda per operazioni di codice, build, file, git o MCP: procedi direttamente.
- Gestione `.todo.md`: quando l'utente chiede di analizzarlo, depenna i punti completati (✅/❌ accanto al numero) ma non forzare il completamento di tutto in un colpo solo — se un punto richiede chiarimenti, commentalo o chiedi prima di procedere. Se l'utente chiede solo di **analizzare**: non modificare codice, riporta solo osservazioni, consigli e migliorie.

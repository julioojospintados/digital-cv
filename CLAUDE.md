# Digital CV — Claude Code Instructions

## ⚠️ RAMO DI PROVA `test/new-layout` — leggere prima di tutto il resto

Questo ramo serve a provare un design tutto nuovo per il sito (Giulio,
2026-10-27). **Non si fonde mai su `main` così com'è**: porterebbe con sé
queste regole sospese. Se la prova convince, il sistema nuovo arriva su `main`
per intero, con le sue regole scritte, in un lavoro a parte.

Qui sotto, quando una regola del resto di questo file, di `AGENTS.md` o di una
skill contraddice questa sezione, **vince questa sezione**.

### Sospeso su questo ramo

- La skill `design-system`, `cv-site/DESIGN.md` e la parte visiva di
  `knolling-cv`: fondo ottanio, knolling, Square/Glow, i tre accenti. Si
  leggono solo per sapere da cosa ci si allontana, mai per seguirli. Niente vie
  di mezzo fra il look vecchio e il nuovo.
- La regola «ogni componente sta in vetrina» e `/design-system`: la vetrina
  non si aggiorna.
- La parità IT ↔ EN: **la prova è solo in italiano**. Le pagine `/en` restano
  col design attuale e non si toccano. Il guscio IT (`index.astro`,
  `[lens].astro`, `work/`) può puntare a un componente nuovo mentre quello EN
  resta sul vecchio: è l'unico caso in cui un guscio diverge, e solo qui.
- `analisi.md`, `qa:units`, `QA=1` sul push. Un push su questo ramo è un
  `git push` normale (lint e format), mai `QA=1`: la vetrina e la parità
  fallirebbero per costruzione.
- La regola sugli screenshot si allenta: per giudicare un design servono.
  Si fanno a giro di modifiche, non dopo ogni ritocco.

### Resta valido

- **Dati solo da `src/data/cv.ts`.** Niente numeri, clienti, testimonianze o
  risultati inventati. I testi sono quelli che ci sono già (`cv.ts`,
  `lab-copy.ts`, `cv-i18n.ts`); se il design chiede un testo nuovo, si scrive
  con `identity/writing-style.md` e si segnala a Giulio come bozza.
- Vocabolario e posizionamento di `knolling-cv` e `identity`.
- Le lenti `/design` `/tech` `/ai` restano come **struttura dei contenuti**:
  il design nuovo decide come mostrarle, non se esistono. Toglierle è una
  decisione di posizionamento, da chiedere a Giulio.
- Non si tocca: `src/` (server MCP e API), `cv-site/src/pages/api/`,
  `cv-site/src/pages/tools/`, i generatori di PDF.
- **Non si cancella il vecchio.** I componenti e i fogli nuovi stanno in
  `cv-site/src/components/prova/` e `cv-site/src/styles/prova/`; i vecchi
  restano, perché li usano ancora le pagine EN e `/design-system`.
- Verifica dopo una modifica: `npm run lint && npm run format:check && npm
  test`, poi `cd cv-site && npx astro check && npx astro build`.
- Leggibilità prima dell'effetto: chi apre il sito è spesso un recruiter su un
  portatile da 1366×610 (PostHog). L'effetto non deve nascondere il contenuto,
  e il primo schermo deve dire chi è Giulio.

### Skill e agenti per la prova, in quest'ordine

1. `taste` sui siti di riferimento (sotto), con il Playwright MCP di
   `.mcp.json`. I file che produce vanno in `prova/riferimenti/`, non nella
   root.
2. L'agente `devils-advocate` sulla direzione scelta, **prima** di costruirla:
   un pre-mortem rispetto allo scopo del sito, cioè far trovare lavoro a
   Giulio.
3. `hallmark`: `study` sui riferimenti, poi la direzione e il design. Vale la
   conferma di Giulio a rifare tutto lo strato visivo, entro i confini sopra.
4. `impeccable` (`critique`, `audit`) e l'agente `ux-reviewer` per criticare.
   Chi ha costruito il design non lo giudica da solo.
5. La skill `esperimento` prima di portare online il design nuovo: soglie
   fissate prima, test dei cinque secondi sul vecchio e sul nuovo. Schede ed
   esiti in `prova/decisioni.md`.

`devils-advocate` ed `esperimento` vengono da `eventy`, riscritti per il CV.

### Riferimenti scelti da Giulio (2026-10-28)

I primi cinque della classifica in `prova/riferimenti/awwwards-analisi.md`
(35 portfolio Awwwards analizzati; galleria privata con le schermate:
https://claude.ai/artifact/9RGpdMU68wbhNRUJzuLMiS):

- https://jithinrp.com/ — frase col risultato nel primo schermo, ruolo e
  strumenti per progetto, chiusura che chiede una cosa sola.
- https://www.sebg.ch/ — il personaggio guida: per Giulio è GO.
- https://www.gianlucaboccia.me/ — la carriera come una linea sola.
- https://sankar.work/ — «Chiedi a GO» (qui come domande da cliccare).
- https://samgoddard.co.uk/ — chiarezza e leggerezza (90 KB).

---

@AGENTS.md

---

## Skills — carica sempre `knolling-cv` per prima

Prima di rispondere a **qualsiasi richiesta** su questo progetto, leggi:

- **`.claude/skills/knolling-cv/SKILL.md`** — contesto globale, identità, vocabolario, mode system, DO NOT trasversali

Poi carica la skill specializzata pertinente alla richiesta (i puntatori completi sono già dentro `knolling-cv/SKILL.md`):

| Skill | Quando |
|---|---|
| `.claude/skills/identity/SKILL.md` | testi, bio, tone of voice, narrativa GO, job hunting |
| `.claude/skills/design-system/SKILL.md` | UI, animazioni, card, knolling, GSAP, CSS custom properties, Awwwards |
| `.claude/skills/agile-methodology/SKILL.md` | esperienze, Agile, UX/UI, certificazioni, sprint |
| `.claude/skills/mcp-architecture/SKILL.md` | backend, MCP tools, Hono, test, cv.ts |
| `.claude/skills/partnership-strategy/SKILL.md` | offerta Fractional, bio servizi, tono per le aziende, posizionamento |

Agenti (`.claude/agents/`):

- `ux-reviewer` — revisione UX/UI in sola lettura, alle misure di schermo dei
  visitatori veri (PostHog), IT ed EN, con report Blocker/High/Medium/Nit.
  Si usa quando Giulio chiede una review UX e **prima di portare su `main`
  una modifica al layout di una pagina pubblica**. Nato il 2026-10-20: i
  bottoni delle schede dell'ingresso erano sotto il bordo sul portatile più
  comune, e nessun controllo misurava a quelle finestre.

Skill di utilità (non di dominio):

- `.claude/skills/verification-loop/SKILL.md` — il gauntlet loop del progetto. **Solo su richiesta esplicita**: caricala quando l'utente la nomina ("gauntlet", "fai il loop", "verifica a fondo", `/verification-loop`), mai di tua iniziativa e mai perché ha detto "verifica" o "controlla". Costa molti token e serve per interventi ampi.
- `.claude/skills/humanizer/SKILL.md` — toglie i tic da AI da un testo.
  Lavora sotto `identity/writing-style.md` e i campioni di
  `identity/voice-samples.md`, che hanno la precedenza.
- `.claude/skills/impeccable/SKILL.md` — critica e audit di interfaccia
  (`critique`, `audit`, `polish`…). Solo per valutare: non scrive un suo
  `DESIGN.md` né hook, il sistema vero resta quello del progetto.
- `.claude/skills/ponytail/`, `ponytail-review/`, `ponytail-audit/` — codice:
  la modifica minima, la review di un diff, l'audit del repo (solo report).
- `.claude/skills/diagram-design/SKILL.md` — diagrammi in SVG, già con i token
  del sito. Per un diagramma che va sul sito: due lingue, contrasto sul fondo
  vero, pannello in vetrina.
- Le sei skill qui sopra vengono da `julioojospintados/agents-environment`
  (2026-10-23), ognuna con la sua licenza in `LICENSE.upstream`; in testa a
  ognuna c'è una sezione «Nel Digital CV» con le regole del progetto.
- `.claude/skills/caveman/SKILL.md` — modalità di risposta ultra-compressa. Invocabile con `/caveman` (livelli: lite/full/ultra/wenyan-*) quando l'utente chiede di ridurre i token o "parlare da caveman". Torna a prosa normale con "stop caveman".

## MCP

Server MCP di progetto dichiarati in `.mcp.json` (root, letto da Claude Code): `mcp-base-template` (server locale che espone i dati di `cv.ts` come tool/resource) e `sequential-thinking`.
`.vscode/mcp.json` è l'equivalente per Copilot/VS Code e include un set più ampio di server — non è letto da Claude Code.

## Verifica dopo una modifica — livello base

Dopo una modifica normale, anche non banale, questo è tutto ciò che serve. È
testo, non immagini, e costa poco:

```bash
npm run lint && npm run format:check && npm test
npm run qa:units
cd cv-site && npx astro check && npx astro build
```

Se hai toccato `/design-system`, aggiungi `npm run qa:ds` (serve il dev server
sulla 4321): sono una trentina di righe e nessuna immagine.

**Gli screenshot no.** Una schermata costa più di tutto il resto messo insieme:
falli solo se servono a decidere qualcosa che dai numeri non si vede, o se
l'utente li chiede. Vale anche per i dump lunghi — `console.table` su decine di
righe si riassume in una riga di conteggi.

**I controlli da browser girano solo quando Giulio chiede il push** (regola
del 2026-10-22). `.husky/pre-push` li lancia da solo se il push porta qualcosa
su `main`; sul ramo di lavoro, quando è lui a chiedere il push, usa
`QA=1 git push`. Un push di salvataggio fa solo lint e format. I controlli
girano su tutte le pagine del build: l'elenco lo legge `scripts/qa-pages.mjs`,
non si scrive a mano.

Se dopo questo resta un dubbio che nessuno script scioglie, **chiedi** invece di
aprire il ciclo completo: «questo non lo decido da solo, vuoi che passi il
gauntlet?».

## Tre regole vincolanti, prima di chiudere un lavoro

1. **Ogni componente creato o modificato va creato o modificato anche in
   `/design-system`**, nello stesso lavoro: pannello, demo, scheda di
   specifica, voce d'indice. Non è un consiglio — `npm run qa:showcase` gira
   nel pre-push e ferma il push se una classe viva non è nominata dalla
   vetrina. Il perché, il perimetro e come si dichiara un'eccezione stanno in
   `AGENTS.md` § "Ogni componente sta in vetrina".

2. **`analisi.md` (root, gitignored) va aggiornato prima di un push che
   introduce una macrofunzionalità**: una libreria nuova, una pagina, una
   rotta API, un tool MCP, un agente, una skill, un sottosistema, una regola
   ferrea. Non per una correzione CSS o un ritocco di copy — per quello c'è
   git. Serve a Giulio per raccontare il progetto come esperienza di lavoro,
   quindi si scrive in quel registro: cosa fa, per chi, con quale tecnologia.
   Dettagli in `AGENTS.md` § "`analisi.md`".

3. **Quando Giulio chiede un CV, le esperienze sono tutte visibili e non si
   tagliano mai perché sforano la pagina.** Vale per ogni CV prodotto da
   questo progetto: `pdf:ux`, `pdf:targeted`, `pdf:full`, `pdf:cv`, l'agente
   `cv-recruiter`, il tool web e il tool MCP. Quello che non sta va alla
   pagina dopo, intero. Ogni generatore controlla i testi tagliati prima del
   PDF e, se ne trova, si ferma invece di consegnare: non aggirarlo. Se il CV
   supera le pagine previste, **dillo a Giulio** con il numero e proponi cosa
   accorciare: decide lui, non si accorcia in silenzio. Dettagli in
   `AGENTS.md` § "Un CV non taglia mai un'esperienza".

## Comportamento

- Per domande **non legate al codice o al progetto corrente** (ricerche, confronti, decisioni), chiedi prima se conviene ragionare con **Sequential Thinking** step-by-step. Non fare questa domanda per operazioni di codice, build, file, git o MCP: procedi direttamente.
- Gestione `.todo.md`: quando l'utente chiede di analizzarlo, depenna i punti completati (✅/❌ accanto al numero) ma non forzare il completamento di tutto in un colpo solo — se un punto richiede chiarimenti, commentalo o chiedi prima di procedere. Se l'utente chiede solo di **analizzare**: non modificare codice, riporta solo osservazioni, consigli e migliorie.
- Agisci anche da **consulente**, non solo da esecutore: se una richiesta, un feedback ricevuto o un'idea nuova rischia di confliggere con il posizionamento del CV (vedi memoria `posizionamento-ux-ui-first` e `.claude/skills/identity/SKILL.md`) o con la sua fruibilità/coerenza di design (`.claude/skills/design-system/SKILL.md`, `cv-site/DESIGN.md`), sollevalo come obiezione motivata **prima** di implementare — spiega il trade-off, non bloccare la conversazione e non decidere al posto dell'utente. Quando l'utente esplora un dubbio strategico (positioning, priorità, architettura dei contenuti), fai da spalla di brainstorming: proponi alternative concrete con pro/contro, verifica sui dati reali (PostHog/GSC) quando disponibili, invece di limitarti a eseguire o rassicurare.

# Document & Code Authoring
- All created files, documents, and code must be attributed strictly to Giulio Occhipinti.
- Do NOT include any AI disclaimers, "Generated by Claude" headers, or Anthropic footers in generated files or documentation.

Voglio fare un nuovo CV digitale, con portfolio, che mi faccia trovare lavoro.
Procedi a step. A ogni scelta che spetta a me fammi una domanda con un form a
opzioni (massimo 4 domande per volta), e rispondimi in modo breve e sincero:
se un'idea è debole dimmelo, non assecondarmi.

## Obiettivo

- Un CV digitale unico, da Awwwards (livello Sito del Giorno, voto della giuria
  sopra 7,3), con animazioni e un effetto «wow» vero, non da template.
- Deve sembrare fatto da una persona, non «da macchina»: niente look da AI.
- Lettore: un recruiter o un responsabile italiano che assume, spesso da un
  portatile 1366×610 o dal telefono via LinkedIn. Nome, ruolo e azioni (CV,
  LinkedIn, email) devono essere visibili entro 1 secondo. Effetto massimo, ma
  niente caricamenti lunghi né schermate da cliccare per entrare.
- Ruoli, a rotazione: UX/UI Designer · Creative Developer · AI Product Engineer.

## Fonti

- `julioojospintados/digital-cv`: tutte le mie esperienze in `src/data/cv.ts`
  (unica fonte di verità, niente dati inventati), le regole in `CLAUDE.md` e
  `AGENTS.md`, la mia voce in `.claude/skills/identity/`.
- Ramo `test/new-layout` dello stesso repo: il lavoro già fatto. Leggi prima:
  - `prova/decisioni.md`;
  - `prova/riferimenti/awwwards-analisi.md` (classifica di 59 portfolio);
  - `prova/riferimenti/awwwards-tecniche.md` (come sono fatti 9 siti premiati
    e i voti della giuria);
  - la galleria con le schermate: https://claude.ai/artifact/9RGpdMU68wbhNRUJzuLMiS
- `julioojospintados/agents-environment`: skill e agenti utili (`hallmark`,
  `taste`, `impeccable`, `ui-ux-pro-max`, `reverse-engineer-anything`,
  `scrapling`, `humanizer`).
- `julioojospintados/eventy`: gli agenti `devils-advocate`, `user-research`,
  `ux-accessibility` e le skill `ppoc-score` ed `esperimento`.

## Cosa ho già imparato (non ripetere)

- Il design editoriale chiaro (crema, serif, vermiglio) è stato bocciato:
  piatto, senza effetto.
- Tre prototipi statici (GO 3D, muro di lettere, oggetto 3D) e una versione con
  shader liquido: bocciati, «non è ancora un Awwwards».
- Dai siti premiati: il wow viene da una **scena firma** (spesso un 3D
  renderizzato in Blender e mostrato come video comandato dallo scroll, come
  Metalab e Studio Null), dalla **regia del movimento** (GSAP con SplitText e
  Lenis), dal **suono** opzionale. Il 3D in tempo reale (Bruno Simon, Igloo)
  prende i voti più alti, ma costa mesi.
- Tutti i premiati sono deboli in usabilità e accessibilità: è lì che posso
  distinguermi, come UX/UI.
- Riferimenti che mi piacciono: wodniack.dev, metalab.com. Idea da tenere: GO
  (il mio simbolo) come personaggio guida, alla caffe.design o sebg.ch.
- Decisioni chiuse: knolling abbandonato, un solo pubblico (chi assume), niente
  AI generativa nel sito (niente Gemini), solo italiano nella prima versione.

## Come lavorare

1. **Prepara gli strumenti.** Porta nel repo `digital-cv`, su un ramo nuovo
   (te lo dico io), `ppoc-score` ed `esperimento` da `eventy`, riscritti per
   questo progetto: Desiderabilità = quanto aiuta a farmi assumere,
   Fattibilità = quanto è realizzabile da me con l'AI, Viabilità = tempo e
   costi. `devils-advocate` è già nel ramo `test/new-layout`.
2. **Ogni proposta passa dal filtro prima di essere costruita.**
   - Calcola il pPoC con l'evidenza a supporto: sotto 0,6 la scarti, fra 0,6 e
     0,79 fai prima un test economico, da 0,8 si costruisce.
   - Fai attaccare la proposta da `devils-advocate`, in un contesto separato.
   - Mostrami proposta, punteggio e obiezioni in un form, e decido io.
3. **Costruisci per gradi.**
   - Prima la direzione, con 2–3 prototipi navigabili (artifact).
   - Poi la scena firma, poi le sezioni, infine il portfolio con i case study.
   - Ogni prototipo deve reggere il confronto con i riferimenti. Altrimenti
     dimmelo tu prima che lo faccia io.
4. **Chi costruisce non si dà il voto.**
   - A ogni giro, critica indipendente con `impeccable` (critique) e
     `ux-reviewer`, alle misure dei miei visitatori reali.
   - Contrasto WCAG 2.2 AA, telefono completo, reduced motion.
5. **Prima di andare online**, test dei cinque secondi (skill `esperimento`):
   almeno 4 persone su 5 devono capire cosa faccio e che sono disponibile.
6. **Registra ogni decisione** in un file `decisioni.md` nel ramo, e mandami
   ogni file da leggere direttamente, non solo il percorso.

Comincia leggendo le fonti, poi fammi le prime domande.

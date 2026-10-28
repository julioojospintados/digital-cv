# Decisioni del ramo di prova

Giulio Occhipinti. Ramo `test/new-layout`.

## 2026-10-27 — dopo l'analisi Awwwards

- **Knolling: abbandonato** nel redesign. Direzione visiva del tutto nuova; il
  knolling resta solo su `main`.
- **«Chiedi a GO»: solo mock statico.** Domande e risposte predefinite, prese
  da `cv.ts`. Nessuna API, nessun costo.
- **Personaggio GO: placeholder.** Una sagoma semplice per provare la
  struttura; il personaggio vero si disegna dopo.
- **Un solo pubblico: chi assume.** Il sito serve a Giulio per trovare lavoro.
  Niente ingresso «ho un progetto»; tutto è rivolto a recruiter e aziende che
  assumono. Le tre lenti restano come struttura dei contenuti.

## 2026-10-27 — dopo il pre-mortem di devils-advocate

Verdetto: «regge a condizione che» nel test dei cinque secondi almeno 4 persone
su 5 dicano ruolo e disponibilità senza aiuto, e GO non abbassi il punteggio.

- **Ruolo: tre a rotazione, nessuno fisso**, uno per lente: UX/UI Designer
  (`/design`), Creative Developer (`/tech`), AI Product Engineer (`/ai`). Non
  «AI specialist», che è nel vocabolario vietato. Per limitare il rischio che
  il recruiter veda la parola sbagliata: la rotazione parte dal ruolo della
  lente aperta, quella parola è nell'HTML statico (senza JS e con reduced
  motion resta lei), la rotazione si ferma al passaggio del mouse, e il
  `<title>` nomina tutti e tre.
- **GO dopo il primo schermo.** Il primo schermo è per nome, ruolo e
  disponibilità.
- **Titoli dei case study: il problema risolto**, non numeri che `cv.ts` non
  ha.
- **«Chiedi a GO»: domande da cliccare**, nessun campo di testo.
- **Tempi di risposta** nella chiusura: testo nuovo, da confermare con Giulio.

## 2026-10-27 — tono e primo schermo

- **Tono: editoriale chiaro**, con WCAG 2.2 AA come vincolo. Carta chiara,
  inchiostro scuro, un solo accento vermiglio. Contrasti misurati: testo
  16,2:1, testo secondario 8,4:1, accento 6,5:1, testo del bottone 6,7:1.
- **Primo schermo sulla home «/»** (solo IT): `components/prova/ProvaHome.astro`.
  Nome, ruolo a rotazione, la frase di `cv.ts` («So costruire quello che
  disegno…»), le aziende, «Disponibile · Torino», Scarica il CV / Scrivimi /
  LinkedIn, i tre ruoli come link alle lenti. Nessun caricamento.
- **Testi nuovi in bozza** (`lib/prova-copy.ts`): «Disponibile», «Scarica il
  CV», «Scrivimi», «Leggi il CV come», «Case study».

## 2026-10-27 — dopo la review UX e la critica di design

- **Rotazione del ruolo: resta**, con un bottone «Tutti i ruoli» che la ferma
  e li mostra insieme (WCAG 2.2.2). Si ferma anche col mouse sopra; un lettore
  di schermo sente sempre i tre ruoli.
- **GO provvisorio a destra** nel primo schermo (sagoma SVG), sotto i bottoni
  su telefono.
- **«Disponibile» tolto**: non serve.
- **«Intesa San Paolo» resta com'è** in `cv.ts`.
- Correzioni della review: cursore di sistema al posto di quello crema
  (invisibile sulla carta chiara), link di salto funzionante, bersagli da
  44px su telefono, niente preload dei font vecchi (prop
  `preloadLegacyFonts` del Layout, default invariato per le altre pagine),
  nome una volta sola, bottoni e lenti in colonna su telefono.

## 2026-10-28 — la carriera

- **Tre linee che diventano una**, con le corsie esistenti (`exp-lanes.ts`):
  sviluppo, design e comunicazione, fuori orario. Tutte e 24 le esperienze.
- **Dalla più recente**: in alto «oggi», una linea che si apre nelle corsie
  ancora vive. Chi assume legge prima ciò che conta.
- **Fuori orario compatto**: una riga sola per esperienza, più piccola.
- **GO scende con lo scroll** nella colonna di sinistra (sticky, niente JS).
  Su telefono una colonna sola, con il nome della corsia su ogni scheda.

## 2026-10-28 — GO guida, senza AI

- **Niente Gemini.** GO fa da guida con domande da cliccare e risposte
  scritte da `cv.ts`, ognuna con il case study giusto. Nessuna API.

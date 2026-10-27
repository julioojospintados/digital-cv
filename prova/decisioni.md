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

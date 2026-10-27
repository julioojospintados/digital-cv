# Awwwards, categoria portfolio: cosa prendere per il Digital CV

Giulio Occhipinti, 2026-10-27. Ramo `test/new-layout`.

## Come è stata fatta

- **33 portfolio** dalla categoria Portfolio di Awwwards (prima e seconda pagina
  delle nomination, più i Siti del Giorno recenti). Soprattutto persone singole
  con un profilo vicino al mio: product designer, design engineer, AI product
  manager, sviluppatori creativi. Qualche studio, per i pezzi utili.
- Ogni sito aperto con Playwright **a 1366×610**, il portatile più comune dei
  visitatori veri del sito (PostHog): schermate a 0,5, 1,5, 3 e 6 secondi
  dall'apertura (per vedere intro e caricamenti), dopo un passaggio del mouse,
  in 8 passi di scroll, con `prefers-reduced-motion` e su telefono 390×844.
  Dalla pagina: librerie (GSAP, Three.js, Lenis…), peso, testo visibile nel
  primo schermo a ogni istante, presenza di email, CV e LinkedIn.
- Limiti: il WebGL gira in software, quindi qualche effetto 3D è più lento che
  su un computer vero. Un sito (seitaro) non ha mostrato niente in headless ed è
  escluso; altri quattro (allanleone, urbik, jesperlandberg, emotion-agency)
  andavano in timeout. Le nomination di Awwwards misurano il giudizio di
  designer, **non** quanto un sito fa assumere chi lo possiede: nessuno di
  questi dati dice chi ha trovato lavoro.

## Il dato che pesa più di tutti

**17 siti su 33 non dicono chi sei né cosa fai nei primi 3 secondi**: un
contatore di caricamento (0→100), uno schermo vuoto, un «click to enter», una
finestra sul suono. Fra questi c'è ingrassiadaniel.it: a 1366×610 restano
6 secondi di schermo scuro prima delle particelle, e il ruolo è scritto in un
corpo piccolissimo. Pesa 44 MB.

Per chi assume è il difetto più costoso. Il primo giudizio su una pagina si
forma in circa 50 millisecondi (Lindgaard e altri, 2006); un recruiter dedica
in media 7,4 secondi alla prima lettura di un CV (eye tracking di Ladders,
2018, misurato sui CV e non sui siti, ma è lo stesso lettore); oltre il secondo
di attesa l'attenzione comincia a scivolare (Nielsen, limiti dei tempi di
risposta). Un'intro di 4 secondi spende metà del tempo che ti danno.

I siti che funzionano meglio per lo scopo «farsi assumere» dicono ruolo e
risultato **entro 1,5 secondi**, e mettono l'effetto accanto al contenuto, non
davanti.

## I pezzi da prendere

Ognuno con: da dove viene, perché funziona sul piano psicologico, come si
traduce per me, quanto costa.

### 1. Il primo schermo dice ruolo, risultato e per chi, subito

- **Da:** jithinrp.com («I designed products used by 5M+ people, turning
  complex workflows into measurable business growth», con ruolo, anni e città
  in una riga), samgoddard.co.uk («Staff Design Engineer. Currently helping
  humans bridge the gap between design and code»), mikewilcockdesign.com
  («Startups, small businesses and fellow studios, mostly»: dice **per chi**),
  dejiajetomobi.com (bio, case study, esperienze e talk tutti nel primo
  schermo).
- **Perché:** fluidità cognitiva (Reber): ciò che si capisce senza fatica
  sembra più credibile. Un numero specifico convince più di un aggettivo.
- **Per me:** il posizionamento di `identity` in una frase, il pubblico
  esplicito («realtà che vogliono crescere senza assumere dieci persone»), e
  solo numeri veri presi da `cv.ts`.
- **Costo:** basso. È testo e gerarchia.

### 2. Un personaggio che accompagna: GO

- **Da:** sebg.ch (il migliore dei 33), nesilnoble.com, shelbykho.com (il
  robottino MINICOM), francescanoemimarconi.it («Have you met your little
  scroll guide?»), huyml.co (il personaggio che spinge via il pannello nero per
  rivelare il nome).
- **Come lo fa sebg.ch bene:** il contenuto c'è a 0,5 secondi; il personaggio
  saluta e a 1,5 secondi compare il fumetto «Hi, I'm Seb. Scroll down and I'll
  show you around». Poi entra in ogni case study e lo commenta in una frase
  («They share one styleguide, but each…»); propone microgiochi («Scratch me»
  su una scheda, «Psst. You can grab me»); torna alla fine accanto a «Got a
  project? I'm taking on new work.» e all'email. Con reduced motion mostra lo
  stato finale; su telefono funziona tutto.
- **Perché:** il modello del contenuto degli stereotipi (Fiske): le persone si
  giudicano prima sul **calore**, poi sulla **competenza**. Il personaggio
  porta il calore, i case study la competenza; quasi tutti i siti ne danno
  solo uno dei due. Il fumetto apre un vuoto di curiosità (Loewenstein, 1994)
  che spinge a scorrere.
- **Per me:** GO esiste già come logo e come narrativa. Deve guidare, non fare
  da cancello: mai davanti al contenuto, mai un'attesa.
- **Costo:** alto. Serve animazione vera (Rive o Lottie, oppure illustrazione a
  stati), e un'illustrazione fatta bene: un personaggio mediocre fa più danno
  di nessun personaggio. Si fa dopo aver fissato la direzione visiva.

### 3. «Chiedi a GO»: un assistente che risponde sul mio CV

- **Da:** sankar.work («Ask My Twin», con domande suggerite: «What have you
  built with AI?», «Biggest enterprise win?»), raomuhammadhamza.tech («Hey,
  I'm Hamza's AI… ask me about him»), dopaminestudio.io («Ask me anything»
  sempre in basso, e il loro assistente NOVA presentato come case study).
- **Perché:** chi assume fa **la sua** domanda invece di cercare la risposta
  nella pagina (rilevanza per sé). E per me è anche una **prova**: il pilastro
  Tecnologia e AI dimostrato invece che dichiarato.
- **Per me:** è il pezzo più mio dei 33. Ho già i dati strutturati in `cv.ts`,
  un server MCP che li espone, Gemini già in produzione su Vercel. Le risposte
  vanno ancorate solo a `cv.ts`, con un limite di uso e una riga di
  informativa.
- **Costo:** medio. Ma serve una rotta API nuova, e sul ramo di prova
  `cv-site/src/pages/api/` non si tocca: **va deciso a parte**.

### 4. «Cosa ti porta qui?»: lo scambio che smista

- **Da:** sankar.work (alla fine: «I'm hiring», «Let's build something»,
  «About your skills», «Just saying hi»), zarcerog.com (due biglietti, due
  spettacoli), stefanobg.com («I design *interfaces / games / brands* people
  remember», con la parola che cambia), kigo.studio («Make your *website
  cool / app profitable / tasks automatic*»).
- **Perché:** legge di Hick: meno scelte e più chiare fanno decidere prima. Chi
  si riconosce in un'opzione legge il resto come scritto per sé.
- **Per me:** sono le tre lenti, più la divisione che conta davvero: «sto
  cercando qualcuno da assumere» e «ho un progetto». Due ingressi, ognuno con
  il suo percorso e la sua chiusura.
- **Costo:** basso. Struttura e testi esistono già.

### 5. Case study con l'esito nel titolo e il mio ruolo a fianco

- **Da:** vanessacosta.com.br («Repositioning a Product Worth Millions», «A
  Fintech Web Experience Brought Back to Life»), jithinrp.com (barra laterale
  con Ruolo, Durata, Strumenti), raomuhammadhamza.tech (ogni progetto in
  quattro voci: perché l'ho fatto, cosa fa, come è costruito, decisioni da
  notare, più un video breve), giordanobetti.com (i crediti di ogni lavoro:
  «Cinematographer, 1AC, Colorist»), francescanoemimarconi.it (brief, ricerca,
  risultato come post-it).
- **Perché:** chi legge un case study vuole sapere cosa hai fatto **tu**, non
  il team. Il titolo con l'esito è il beneficio prima della storia.
- **Per me:** i case study di `/work` esistono; cambiano titolo, ruolo e
  ordine. Dentro il percorso, il caso più forte va primo e un altro forte
  ultimo (effetto di posizione seriale: si ricordano l'inizio e la fine).
- **Costo:** basso o medio. È lavoro di testi, da scrivere in italiano e poi
  tradurre.

### 6. La carriera come una linea sola

- **Da:** gianlucaboccia.me («A story in one line»: un'unica linea disegnata
  che diventa ponte, mano, persona, e attraversa capitoli di colore diverso,
  da «From a basement to the 82nd floor» a «Eight months. Looking for work.»).
- **Perché:** un percorso non lineare (il mio: musica, design, sviluppo,
  metodo) si legge come incoerente in un elenco e come coerente in un
  racconto. Il capitolo onesto sui mesi senza lavoro rende più simpatico chi è
  già competente (effetto pratfall, Aronson 1966).
- **Per me:** è la narrativa GO in forma visiva, e GO può camminare sulla
  linea.
- **Costo:** medio. SVG animato allo scroll, con fallback statico.

### 7. Gli oggetti sulla scrivania: il knolling, evoluto

- **Da:** shelbykho.com («Shelby's desk»: una scrivania illustrata con oggetti
  che si spostano; il robottino avverte «se sposti le sue cose non glielo
  dico»; «Desk last tidied Oct 2026»), a24.raviklaassens.com (Sito del Giorno
  il 26 ottobre: i film come DVD fisici che rotolano allo scroll).
- **Perché:** manipolare un oggetto fa ricordare quello che c'è dietro (effetto
  di generazione) e gli dà valore agli occhi di chi l'ha toccato (effetto
  IKEA).
- **Per me, ed è un'obiezione al redesign:** l'idea del knolling non è
  superata. Due dei siti più curati della categoria fanno proprio «oggetti
  disposti su una superficie», ma **interattivi**. Prima di buttarla, vale la
  pena chiedersi se il passo giusto è farla muovere invece di cambiarla.
- **Costo:** medio o alto, secondo quanta fisica.

### 8. «Disponibile» sempre visibile

- **Da:** nesilnoble.com («Open to roles and freelance» fisso in alto),
  shelbykho.com («Open to design roles in the US» nella barra in basso),
  sankar.work («Available for opportunities»), stefanobg.com («Available for
  select projects»).
- **Perché:** toglie a chi legge il dubbio «è libero?», che altrimenti fa
  rimandare il contatto.
- **Per me:** una pillola che dice cosa cerco (ruolo o collaborazione
  fractional) e dove.
- **Costo:** quasi zero.

### 9. Una chiusura che chiede una cosa sola

- **Da:** jithinrp.com («Looking for your next product designer?» con tre
  bottoni: Email, LinkedIn, Resume), david-estrada.dev («Tell me what you need
  the site to do. I'll show you how I'd approach it.» e «Rispondo di solito in
  giornata»), sebg.ch («Got a project? I'm taking on new work.»).
- **Perché:** regola del picco e della fine (Kahneman): di un'esperienza si
  ricordano il momento più intenso e l'ultimo. Dire quanto ci metti a
  rispondere toglie un'incertezza.
- **Per me:** due chiusure, una per chi assume (CV, LinkedIn, email) e una per
  chi ha un progetto, coerenti con il pezzo 4.
- **Costo:** basso.

### 10. La frase che si riempie mentre la leggi

- **Da:** two26.studio, stefanobg.com («Fourteen years turning complex systems
  into simple designs…»), mikewilcockdesign.com: le parole passano da tenui a
  piene man mano che si scorre.
- **Perché:** detta il ritmo di lettura della frase che conta di più. Usato
  una volta sola è un momento memorabile (effetto Von Restorff); usato dappertutto
  stanca.
- **Per me:** una volta sola, sulla frase di posizionamento. Con reduced
  motion il testo è pieno da subito, e il testo vero è sempre nel DOM.
- **Costo:** basso (GSAP ScrollTrigger).

### 11. Dettagli umani dal vivo

- **Da:** samgoddard.co.uk («1 human is here», l'ultimo brano ascoltato),
  carterogunsola.com (i cursori degli altri visitatori in tempo reale),
  shelbykho.com («You're visitor #1329», «Leave a note»), l'ora locale in
  molti.
- **Perché:** presenza sociale: il sito sembra abitato da una persona, non da
  un template.
- **Per me:** facoltativo e in fondo alla lista. Al massimo uno, ed è
  decorazione.
- **Costo:** variabile.

### 12. Prova sociale vera

- **Da:** vanessacosta.com.br (testimonianze in un carosello, poi i loghi:
  «Brands & teams I've helped move forward»), sankar.work (raccomandazioni
  LinkedIn), stefanobg.com (tabella dei riconoscimenti), jithinrp.com
  (testimonianze dei responsabili).
- **Perché:** riprova sociale (Cialdini). Funziona solo se è verificabile:
  nome, ruolo, azienda.
- **Per me:** ci sono già i `feedbacks` in `cv.ts`. Niente loghi o numeri che
  non ho.
- **Costo:** basso.

## Da non copiare (visto nei 33)

- **Caricamenti e cancelli**: contatori 0→100, «Click to enter» (tommybiglow),
  «Enter the experience» (aengel.io, che non va oltre), la finestra sul suono
  davanti a tutto (cagdascecen.com), il biglietto da scegliere prima di vedere
  qualcosa (zarcerog.com). Bellissimi da guardare una volta; per chi ha trenta
  profili aperti sono un'uscita.
- **Il banner dei cookie che resta sopra il contenuto per tutta la visita**
  (gianlucaboccia.me, david-estrada.dev, anthracitestudio.be,
  mikewilcockdesign.com).
- **Titoli che non dicono niente**: «Inspire, Collaborate, and Create»,
  «Building web experiences».
- **Nessun ruolo dichiarato** (brandonyasin.com, Sito del Giorno: solo
  immagini; mathiasadolfsson.dev). Funziona per un art director famoso, non
  per chi cerca lavoro.
- **Il telefono bloccato** («9 years of work deserves more screen space»,
  jithinrp.com; nesilnoble.com). Chi arriva da LinkedIn arriva spesso dal
  telefono.
- **Il peso**: ingrassiadaniel.it 44 MB, mathiasadolfsson.dev e
  brandonyasin.com 26 MB. samgoddard.co.uk fa un ottimo primo schermo con
  90 KB.
- **Il reduced motion ignorato**: quasi tutti mostrano lo stesso caricamento.
  sebg.ch è l'eccezione da imitare.

## La ricombinazione che propongo

Un pezzo di uno e un pezzo dell'altro, nell'ordine in cui li incontra chi
visita:

1. **Primo schermo, entro 1 secondo:** la frase di posizionamento con il
   pubblico esplicito (pezzo 1), GO accanto che saluta e apre il fumetto «ti
   faccio vedere» (pezzo 2), la pillola «disponibile» (pezzo 8). Nessun
   caricamento.
2. **Subito sotto:** «Cosa ti porta qui?» con due ingressi, assumere o
   progetto, e le tre lenti dentro (pezzo 4).
3. **Il percorso:** la linea della carriera con GO che ci cammina sopra
   (pezzo 6), la frase che si riempie una volta sola (pezzo 10).
4. **I case study:** esito nel titolo, ruolo e strumenti a lato, il più forte
   primo (pezzo 5), GO che ne commenta ognuno in una frase (pezzo 2).
5. **Chi sono:** la scrivania con gli oggetti da toccare, che è il knolling
   reso interattivo (pezzo 7).
6. **Prove:** le testimonianze vere di `cv.ts` (pezzo 12).
7. **«Chiedi a GO»** sempre raggiungibile (pezzo 3), se si decide la rotta
   API.
8. **Chiusura:** la domanda giusta per chi è arrivato dall'ingresso «assumere»
   o «progetto», con i tempi di risposta (pezzo 9).

Regole che valgono per tutto: niente attese oltre il secondo, niente cancelli,
reduced motion con lo stato finale, telefono completo, un budget di peso.

## Le decisioni che spettano a Giulio

1. **Knolling interattivo o abbandono del knolling** (pezzo 7). I dati dicono
   che l'idea regge; la prova era nata per cambiarla.
2. **«Chiedi a GO»** richiede una rotta API nuova, fuori dai confini del ramo.
3. **Il personaggio GO**: chi lo disegna. È il pezzo che fa la differenza fra
   memorabile e infantile, e non si improvvisa.
4. **Due ingressi** (assumere o progetto) cambiano la struttura dell'ingresso,
   non solo l'aspetto.

Le schermate di ogni sito sono fuori dal repository (il repo è pubblico e non
sono nostre).

---
name: esperimento
description: Progetta e legge un esperimento a costo quasi zero per capire se un cambiamento al Digital CV funziona davvero (il design nuovo del ramo test/new-layout, un titolo dell'ingresso, un case study), fissando prima soglie di successo e di stop. Usala prima di portare online un design o un testo nuovo, dopo un parere di devils-advocate, o quando Giulio chiede «come facciamo a sapere se funziona?».
---

# Esperimento

Lo scopo del sito è far trovare lavoro a Giulio. Un design «funziona» se chi
lo visita capisce cosa fa e fa un passo verso di lui (apre un case study,
scarica il CV, scrive), non se è bello. Questa skill serve a deciderlo con un
comportamento osservato invece che con un'impressione.

## Prima del test (scheda)

Compila tutto **prima** di iniziare. Una soglia decisa dopo aver visto i dati
non vale.

```
Ipotesi: <chi> farà <cosa> perché <motivo>
Metrica: <una sola metrica principale, misurabile>
Soglia di successo: <valore>
Soglia di stop: <valore>
Campione: <quante persone o sessioni, da dove arrivano>
Durata: <giorni>
Costo massimo: <euro e ore>
Cosa facciamo se passa / se fallisce: <decisione già scritta>
```

## I tre test, dal più economico

**1. Test dei cinque secondi (prima di andare online).** Si mostra la prima
schermata per cinque secondi a cinque persone che non conoscono il progetto,
meglio se recruiter o persone che assumono, poi si chiede: «cosa fa questa
persona? per chi lavorerebbe?». Si fa sul vecchio e sul nuovo. Costa un'ora e
dice già moltissimo.

```
Ipotesi: chi vede per 5 secondi la prima schermata del design nuovo sa dire cosa fa Giulio
Metrica: persone che descrivono correttamente il ruolo (Tecnologia + Design + Metodo, o Partner Tecnico) su 5
Soglia di successo: almeno 4 su 5, e non meno del design attuale
Soglia di stop: 2 su 5 o meno
Campione: 5 persone fuori dalla cerchia del progetto, stesse per i due design
Durata: un giorno
Costo massimo: 0 € e 1 ora
Se passa: si va al test 2
Se fallisce: prima di toccare il design si riscrive il messaggio della prima schermata
```

**2. Prima e dopo su PostHog (dopo andare online).** Si confrontano due
periodi, il design attuale e quello nuovo, sulla stessa metrica. Prima di
sceglierla **si guarda quali eventi PostHog registra davvero**: una metrica
che non viene tracciata non si inventa, si aggiunge l'evento prima di partire.
Candidate:

- % di sessioni che aprono almeno un case study `/work/<slug>`;
- % di sessioni con un'azione di contatto (email, LinkedIn, CV scaricato);
- % di sessioni che escono dalla prima schermata senza far niente.

**3. Il risultato vero: le risposte alle candidature.** Il ledger delle
candidature (`cv-applications-list`) ha `emailReceived` e `outcome`. È la
metrica che conta, ma è lenta e dipende da troppe cose oltre al sito
(l'annuncio, il CV, il momento): si guarda, non decide da sola.

## Regole

- **Una metrica principale.** Le altre si guardano, ma non decidono.
- **Comportamento, non opinioni:** un click su un case study vale più di un
  «bel sito». Nel test dei cinque secondi conta cosa la persona sa dire, non
  se le piace.
- **Il traffico dipende dalle candidature.** Chi visita il sito arriva quasi
  sempre da un CV o da un messaggio di Giulio: una settimana con più
  candidature ha più visite, non per merito del design. Nel prima e dopo si
  confrontano percentuali, mai visite assolute, e si annota quante candidature
  sono partite in ciascun periodo.
- **Campioni piccoli:** con 20 sessioni una percentuale del 50% ha un margine
  di circa ±22 punti; con 50 circa ±14; con 150 circa ±8. Si decide sulle
  differenze grandi, mai sui decimali. Se i numeri sono troppo pochi, il test
  è «non conclusivo» e si dice.
- **Amici ≠ recruiter:** chi conosce Giulio è più gentile e sa già cosa fa. Un
  test con gli amici è un limite superiore.
- **Le visite di Giulio non contano:** vanno escluse dai dati (filtro su
  PostHog), o il test misura lui.

## Dopo il test (lettura)

```
Risultato: <valore osservato> su <n> persone o sessioni
Esito: passa | fallisce | non conclusivo
Cosa abbiamo imparato: <una o due frasi>
Decisione: <come previsto nella scheda, o motivazione se cambia>
```

Registra scheda ed esito in `prova/decisioni.md`, sul ramo di prova.

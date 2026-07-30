# Audit UX & Accessibilità — luglio 2026

Origine: feedback esterno di Federico Amato (30/07/2026) su `cv-site`, verificato
riga per riga sul codice e ampliato con un controllo rispetto a **WCAG 2.2 AA** e
alle **10 euristiche di Nielsen Norman**.

Legenda: ✅ fatto in questo passaggio · 🔴 bloccante · 🟠 importante · 🟡 miglioria

> **Nota sul file**: l'audit sta qui e non in `todo.md` perché quest'ultimo è in
> `.gitignore` (file di lavoro locale, vedi `DESIGN.md` → "File di riferimento").
> Un backlog che deve sopravvivere al push e restare leggibile da chi rivede il
> repo va versionato.

---

## Premessa: cosa era già a posto

Vale la pena dirlo, perché restringe il campo di ciò che serve davvero. Il
controllo sui fondamentali **non ha trovato problemi**:

- `lang` corretto per pagina (`it` sulle pagine IT, `en` su `/en/*`)
- skip link presente (`href="#main-content"`), `<main id="main-content">`
- gerarchia heading senza salti su tutte le pagine (`h1` → `h2` → `h3`)
- `prefers-reduced-motion` rispettato, `:focus-visible` mai azzerato
- scala tipografica già tokenizzata in `rem` (`--fs-*`), niente rem "a occhio"

Il portfolio parte quindi da una base migliore della media. I problemi reali
sono più specifici di "manca l'accessibilità".

---

## 1. Skill linguistiche — il punto segnalato ✅ 🔴

**Feedback**: *"il testo delle skill linguistiche è piccolino in confronto al
resto; bene che l'AI ti abbia messo il bold anziché il regular, ma le dimensioni
contano se vuoi farlo leggere da persone con difetti visivi."*

Osservazione corretta, e la causa era un **errore di categoria** nel design
system, non una svista isolata.

`.lang-chip` (`cv-page.css`) stava a `--fs-12`. Secondo la regola del progetto
(`design-system/SKILL.md` → "Typography Scale") `--fs-12` è il *pavimento*
riservato a **eyebrow, chip, meta, badge**. Il blocco lingue è stato classificato
come "chip" — lo dice il nome della classe — ma non è meta decorativa: è
**contenuto**, ed è tra le prime cose che un recruiter cerca. Applicata la regola
giusta alla natura reale dell'elemento.

Sul bold: alza il contrasto *percepito*, non l'acuità visiva richiesta per
risolvere glifi da 12px. Era la mossa giusta ma non sufficiente da sola.

### Trovato in più: il livello CEFR non era leggibile affatto

Guardando il markup è emerso un problema più grave della dimensione. Il livello
(`B2`, `C1`, `Madrelingua`) **non veniva reso visivamente in nessun modo**:
esisteva solo come `aria-label` sui sei quadratini da 5px.

Conseguenza: uno screen reader annunciava "Inglese, B2" correttamente, mentre chi
guarda lo schermo — inclusa esattamente la persona ipovedente del feedback —
doveva **contare sei quadratini da 5px** per distinguere un B2 da un C1. Un caso
da manuale di informazione accessibile all'assistive tech ma non all'occhio.

In più i quadratini vuoti avevano bordo `rgba(192, 220, 215, 0.25)` = **~1,75:1**
sul fondo ottanio, contro il **3:1** che WCAG 1.4.11 (*Non-text Contrast*)
richiede alla grafica che porta informazione — e questa la porta, è la scala del
livello.

### Modifiche applicate

| Elemento | Prima | Dopo |
|---|---|---|
| `.lang-chip` (riga) | `--fs-12` (12px) | `--fs-14` (14px) |
| `.lang-chip b` (nome lingua) | 12px | `--fs-16` (16px) |
| Livello CEFR | solo `aria-label` | **testo visibile** `--fs-14` |
| Quadratini | 5px, bordo ~1,75:1 | 6px, bordo ~3,3:1 |
| Colori del blocco | hardcoded `rgba(...)` | token `--color-text-muted` |

Dettagli:

- **Livello in chiaro**: i quadratini diventano `aria-hidden="true"` e il codice
  CEFR è testo reale. Il testo è ora fonte unica — visibile e annunciato una
  volta sola, senza il doppione `aria-label` + testo.
- **`.lang-level` era CSS morto**: la classe esisteva in `cv-page.css` ma nessun
  markup la usava. Aveva `opacity: 0.6` che, moltiplicata per l'alpha 0.85 del
  colore, avrebbe dato **~3:1** — sotto il 4.5:1 di 1.4.3. Riattivata *senza*
  l'opacity: la gerarchia la fa già la dimensione rispetto al nome.
- **Colori hardcoded → token**: il blocco usava `rgba(192, 220, 215, 0.85)`, cioè
  il valore di `--color-text-muted` del **solo mode default**. Negli altri quattro
  mode (tech/creative/human/management) il colore non seguiva — lo stesso bug già
  documentato in `DESIGN.md` §9 per `WorkDesignSystem.astro`.
- **Soglia del 70%** sul bordo dei quadratini scelta perché è la minima che tiene
  ≥3:1 in **tutti** i mode: verificato ~3,6:1 sul default e ~3,2:1 su `tech`, che
  è il più critico partendo da un muted già ad alpha 0.7.

File toccati: `cv-site/src/styles/cv-page.css`,
`cv-site/src/pages/[mode].astro`, `cv-site/src/pages/en/cv.astro`.

---

## 2. `--fs-12` come pavimento: da rivedere 🟠

Il caso delle lingue **non è isolato**: `--fs-12` è usato **99 volte** tra
`cv-page.css`, `index-page.css`, `work-page.css` e `global.css`. La regola del
design system lo autorizza per "eyebrow, chip, meta, badge", ma il confine tra
"meta" e "contenuto" è stato tirato largo, e ogni volta che scivola dalla parte
sbagliata si ripete il problema appena corretto.

Non è una correzione da fare a tappeto — 99 sostituzioni cieche romperebbero
layout in cui 12px è legittimo. Serve una passata mirata:

- [ ] Elencare le 99 occorrenze e classificarle: *decorativa* (badge, timestamp,
      tag) vs *contenuto* (qualcosa che l'utente deve leggere per informarsi).
- [ ] Portare le "contenuto" ad almeno `--fs-14`.
- [ ] Aggiornare la regola in `design-system/SKILL.md`: il criterio non è il
      **tipo di componente** ("è un chip") ma la **natura del dato** ("è
      un'informazione che il visitatore deve leggere"). È la distinzione che è
      mancata sulle lingue.
- [ ] Verificare che `SkillSquare.astro:142`
      (`clamp(var(--fs-10), 6.5cqi, var(--fs-12))`) non scenda a 10px per nomi di
      skill reali: `--fs-10` è documentato come riservato a badge ALL CAPS
      cortissimi, e un nome di skill non lo è.

---

## 3. Sezione Tools 🟠

**Feedback**: *"non vedo una sezione tools. Un'azienda guarda subito cosa sai
usare... se cercano Figma users, o motion design (After Effects, Protopie,
Lottie), indicali in chiaro."*

Il feedback è centrato, ma la diagnosi va precisata: **i tool ci sono già nei
dati**. In `src/data/cv.ts` sono presenti Figma, Visily, UX Pilot, Google Stitch,
Wireframing, UX Research, Video editing, GSAP, Git, GitHub Copilot, Zed, PostHog,
Vercel, MCP Protocol e altri.

Il problema è **di tassonomia, non di contenuto**. Le skill sono classificate per
`domain` (`tech` / `creative` / `human` / `management` / `ai`) e rese in un unico
mosaico. Risultato: **"Figma" e "Teatro e improvvisazione" sono entrambe
`creative` e hanno lo stesso aspetto**. Chi scansiona in 5 secondi cercando "che
software sa usare" deve leggere 60 caselle e separarle a mente.

Manca cioè l'asse **strumento vs. capacità**, che è ortogonale al dominio.

- [ ] Aggiungere a `Skill` un campo tipo `kind: "tool" | "capability"` — così una
      vista Tools si **deriva** dai dati esistenti, senza duplicare nulla e senza
      rischio di disallineamento tra due liste.
- [ ] Raggruppare la vista Tools per famiglia d'uso, non per dominio interno:
      *Design & UI* · *Prototipazione & Motion* · *Research* · *Dev* · *AI*.
- [ ] Rendere il livello **testuale** (`Base`/`Intermedio`/`Avanzato`/`Esperto`,
      già in `SkillLevel`). ⚠️ Attenzione a non ripetere l'errore delle lingue: se
      il livello resta affidato solo a glow/dimensione del quadrato, torna a
      essere illeggibile per chi ha difetti visivi. **Il livello va scritto.**
- [ ] Sul motion design: After Effects, ProtoPie, Lottie e Rive **non sono nei
      dati**. Se li hai usati vanno aggiunti; se non li hai usati, meglio non
      inventarli — l'assenza dichiarata è più credibile di una lista gonfiata.

---

## 4. UX Research, UI e UX — esistono ma sono sepolte 🟠

**Feedback**: *"hai fatto/partecipato/studiato qualcosa di UX Research? Se sì,
indicalo. Idem per UI e UX, anche in ambito DEV."*

Anche qui: **il materiale c'è**, la findability no. Nei dati sono già presenti:

- `UX Research` e `Wireframing` come skill, con link a Figma
- certificazioni: *UX Design Professional Certificate*, *Introduction to UX/UI
  Design*, *UX/UI Design Fundamentals: Usability and Visual Principles*,
  *UI/UX Wireframing and Prototyping with Figma*, *Generative AI: The Future of
  UX UI Design*
- il progetto Bambagia Design Lab: *"ricerca su cliente e competitor, wireframe e
  prototipo"* — descrizione di un processo di research vero
- Aruba: design system da 100+ WebComponents progettato **insieme ai designer**
  a partire da Figma — è UX/UI in ambito dev, esattamente il punto di Federico

Il problema è che tutto questo vive dentro **descrizioni di progetto in prosa** e
dentro le relazioni dello skill graph. Chi scansiona non lo trova.

- [ ] Dare a UX Research una **collocazione esplicita e nominata**, non solo un
      nodo nel grafo.
- [ ] Per ogni attività di research, esplicitare il **metodo** (ricerca su
      competitor, interviste, usability test, wireframing, prototipazione) e il
      **contesto**. "Ricerca su cliente e competitor" è già buono: va reso
      visibile, non riscritto.
- [ ] Rendere le certificazioni UX **scansionabili** e non solo elencate insieme a
      bartending e improvvisazione teatrale — che sono ottimi elementi di
      carattere, ma in una sezione diversa da quella che risponde a "sa fare UX?".
- [ ] Dichiarare esplicitamente l'**UX in ambito dev** (Aruba): è un
      differenziale competitivo, oggi leggibile solo a chi apre la card.
- [ ] Aggiungere **esiti** dove esistono. Se non ci sono numeri, raccontare cosa è
      cambiato nel design *dopo* la ricerca: è la prova che la ricerca ha avuto un
      effetto.

---

## 5. Competenze AI — quali, dove, come 🟠

**Feedback**: *"idem le competenze AI (quali? Dove? Come?)"*.

Questa è la parte messa **meglio** del portfolio: `AiCard.astro` ha già i campi
`tool` / `title` / `desc` / `impact` / `tags`, cioè esattamente la struttura
"quale strumento, per fare cosa, con che risultato". Il flusso MCP Figma ⇄ Code
descritto nel progetto Bambagia è un esempio concreto e verificabile.

- [ ] Verificare che `impact` sia **sempre** valorizzato e specifico: è il campo
      che risponde al "come" e distingue la sezione da un elenco di loghi.
- [ ] Assicurarsi che la sezione AI sia raggiungibile dalla navigazione senza
      scroll esplorativo.

---

## 6. Tono: alleggerire le aree tecniche 🟡

**Feedback**: *"se vuoi puntare a UX pura, alleggeriscilo togliendo quello che non
serve (aree molto tecniche → rendile più discorsive)."*

- [ ] Rivedere le descrizioni a densità tecnica alta (MCP, WebComponents, RXJS,
      NGRX) e riscriverle **dal problema e dalla decisione**, non dallo stack.
- [ ] Valutare `<details>` per il dettaglio implementativo: chi lo vuole lo apre,
      gli altri non lo subiscono. Se lo fai, `<summary>` descrittivo.
- [ ] ⚠️ Da bilanciare: il profilo reale è **T-shaped** — è dichiarato nelle skill
      e sostanziato dal progetto Aruba. Nascondere del tutto il lato dev
      indebolirebbe proprio la posizione "UX che sa parlare con gli sviluppatori",
      che è il differenziale. L'obiettivo è **subordinare**, non **rimuovere**.

---

## 7. Euristiche Nielsen Norman — da verificare 🟡

- [ ] **Visibilità dello stato** — indicatore di sezione attiva in nav; feedback
      sullo switch di mode.
- [ ] **Corrispondenza col mondo reale** — i quattro mode (Tech / Creative /
      Human / Management / "Fuori orario") sono un'idea forte, ma vanno testati
      su un utente esterno: è chiaro **al primo colpo** che cambiano la lettura
      del profilo e non il tema grafico?
- [ ] **Controllo e libertà** — ritorno facile da ogni case study; nessun
      autoplay non interrompibile.
- [ ] **Coerenza** — già forte grazie ai token; mantenerla sulle nuove sezioni.
- [ ] **Riconoscere anziché ricordare** — nei case study lunghi, sommario o
      titolo di sezione persistente.
- [ ] **Design minimalista** — con l'aggiunta della sezione Tools, valutare cosa
      **togliere**: aggiungere senza sottrarre è il modo classico di appesantire.
- [ ] **Recupero dagli errori** — verificare che la 404 abbia rotte d'uscita reali.

### Difetti noti già tracciati

Da `DESIGN.md` §15, ancora aperti:

- [ ] carousel feedback senza indicatore di posizione / `aria-live` (#55)

---

## 8. Verifica 🟡

- [ ] axe DevTools o Lighthouse su `/`, `/tech`, `/work/[slug]`, `/en/cv`.
- [ ] **Navigazione solo da tastiera** su tutto il sito, mode switch incluso.
- [ ] **Screen reader** (VoiceOver/NVDA) su home + un case study.
- [ ] **Zoom 200%** e viewport **320px**.
- [ ] ⚠️ **Ripetere le verifiche di contrasto in tutti e 5 i mode.** I token
      `--color-text-muted` cambiano per mode e sono documentati come verificati,
      ma il bug dei colori hardcoded nel blocco lingue dimostra che il valore
      *dichiarato* nel token e quello *effettivamente renderizzato* possono
      divergere. Va controllato il rendering, non la tabella.

---

## Stato delle modifiche di questo passaggio

Applicate e verificate: `npm run build` ✓ · `format:check` ✓ · `lint` ✓ ·
104/104 test ✓.

Tutto il resto di questo documento è backlog: le voci §3 e §4 richiedono
decisioni di contenuto e di priorità che spettano a Giulio, non deducibili dal
codice.

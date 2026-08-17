---
name: verification-loop
description: >
  Gauntlet loop del Digital CV: costruisci, misura, critica, ricomincia — con la
  regola che chi implementa non si dà il voto da solo. Carica quando lavori su UI
  o testi di cv-site/ e vuoi chiudere davvero il lavoro invece di dichiararlo
  chiuso, quando cambi la vetrina /design-system o le pagine /lab, quando devi
  scegliere fra due direzioni di layout, o quando l'utente dice "verifica",
  "controlla in browser", "gauntlet", "loop", "sei sicuro?", "ricontrolla".
---

# Verification Loop — il gauntlet del Digital CV

Adattamento al progetto della tecnica **Gauntlet Loop** (di Matt Shumer;
implementazioni skill in circolazione:
[NicholasSpisak/gauntlet-loop](https://github.com/NicholasSpisak/gauntlet-loop),
[duolahypercho/gauntlet-loop](https://github.com/duolahypercho/gauntlet-loop),
[robonuggets/gauntlet-loop](https://github.com/robonuggets/gauntlet-loop) — MIT).
Il nucleo che si prende in prestito è uno solo, e vale più di tutto il resto:

> **Chi implementa non si dà il voto. La sbarra è una misura, non un aggettivo.
> Chi ha già visto una bozza non giudica il tentativo dopo.**

Quelle skill generano un *prompt* da incollare, con delega a Codex e sub-agent
critici. Qui non serve: il ciclo lo si esegue e basta, e metà della sbarra in
questo progetto è già scritta e già misurabile. Questa skill dice **dove sta la
sbarra**, **cosa si misura da solo** e **cosa richiede un critico**.

---

## Le due metà, e il confine fra loro

| | **Decidibile** | **Di giudizio** |
|---|---|---|
| Chi giudica | `npm run qa:ds` | un critico a contesto fresco |
| Esempi | parità IT/EN, indice ↔ pannelli, console pulita, nessuna barra orizzontale, snippet senza `data-ds-` | il componente è documentato con la classe giusta? la demo è fedele al contesto vero? il testo suona come Giulio? |
| Costo di sbagliare | una regressione silenziosa | una vetrina che insegna l'errore |

**Non chiedere a un critico ciò che uno script decide meglio**, e non chiedere a
uno script ciò che richiede giudizio. Il difetto peggiore trovato in questa
vetrina (`lab-label` mostrata come etichetta di testo quando è il blocco caption
del caso) nessuno script lo avrebbe visto: serviva leggere il CSS e accorgersi
che il nome mentiva. Al contrario, l'ordine dei pannelli scollato dall'indice era
lì da settimane senza che nessuno lo notasse a occhio — e lo script lo ha trovato
alla prima esecuzione.

---

## Il ciclo

### 1 · Fissa la sbarra *prima* di scrivere

Non «fallo bene». Criteri concreti, presi da dove sono già scritti:

- `cv-site/DESIGN.md` + `.claude/skills/design-system/SKILL.md` — regole visive,
  mode system, movimento, DO NOT
- `AGENTS.md` § "IT ↔ EN parity" — copy **e** struttura, ordine, stato iniziale
- `.claude/skills/identity/writing-style.md` — obbligatorio per qualsiasi testo
- WCAG 2.2 AA, **misurato sui pixel resi**, mai dichiarato
- gli esemplari di riferimento: i componenti che nel sistema già funzionano

Se un criterio non ha un numero o un file dietro, marcalo `DA CONFERMARE` e
chiedi. Una sbarra inventata è peggio di nessuna sbarra.

### 2 · Costruisci

Normale. Un pezzo per volta, verificabile separatamente.

### 3 · Misura — il gauntlet deterministico

```bash
npm run dev --prefix cv-site        # server sulla 4321
npm run qa:ds                       # vetrina /design-system, IT + EN
npm run qa:mobile                   # emulazione mobile sul sito
npm run lint && npm run format:check && npm test
cd cv-site && npx astro check && npx astro build
```

`qa:ds` esce con codice 1 se qualcosa fallisce e dice **cosa**, non «qualcosa non
va». Se tocchi la vetrina e il gauntlet non copre ciò che hai cambiato, **aggiungi
il controllo** a `scripts/qa-design-system.mjs`: il ciclo cresce col progetto,
altrimenti invecchia come una fotografia.

Regola d'ambiente: `PLAYWRIGHT_CHROMIUM_EXECUTABLE` se `playwright` non trova il
browser; `QA_BASE_URL` per puntare a un build statico invece del dev server.

### 4 · Critica — quello che lo script non vede

Rileggi il diff **con addosso il ruolo del critico**, non quello di chi l'ha
scritto. Le domande che hanno già pescato difetti veri qui:

1. **La classe dice la verità?** Il nome del componente corrisponde a cosa fa nel
   CSS, o l'ho dedotto dal nome? (`lab-label` → non era un'etichetta.)
2. **La demo è fedele al contesto?** Un componente estratto dal suo contenitore
   può perdere il colore, l'ereditarietà, l'hover del genitore. Se la demo ha uno
   `style` inline per stare in piedi, quello `style` è un sintomo.
3. **IT ed EN divergono in qualcosa che non è la lingua?** Ordine, default, cosa
   è aperto, cosa è attivo.
4. **Sto affermando un numero che non ho misurato?** Ogni contrasto, ogni
   percentuale, ogni «più veloce» va misurato o tolto.
5. **Cosa succede senza JavaScript?** In questo progetto la regola è degrado
   verboso, mai vuoto: a nascondere è sempre lo script, quindi senza script non
   si nasconde niente.
6. **Il testo passa `writing-style.md`?** Vocabolario bandito, «PMI», tono.

Se hai appena scritto tu quel codice, il modo migliore di prendere il ruolo è
**farlo guardare a un sub-agent a contesto fresco**, dandogli la sbarra e il
diff, non la tua spiegazione. Un critico che ha letto le tue motivazioni le
ripete invece di verificarle.

### 5 · Chiudi il ciclo o ricomincia

- Fallito qualcosa → **torna al 2**, non al 4. Non si negozia con la sbarra.
- Passato tutto → il lavoro è chiuso. Dillo con le misure, non con gli aggettivi.

### 6 · Le fermate dure — valgono più del ciclo

Il ciclo non decide da solo su:

- **push e branch** — mai senza richiesta esplicita (regola di `knolling-cv`)
- **merge su `main`** e promozione in produzione
- **posizionamento e contenuti del CV** — se una modifica confligge con
  `identity/SKILL.md` o con il posizionamento UX/UI-first, si solleva
  l'obiezione *prima*, non si implementa e basta
- **la bio** — protetta da riscrittura, decisione dell'11/07

---

## Come si legge un fallimento

Il gauntlet non dice «rifai». Dice quale invariante è caduta:

| Fallimento | Cosa significa davvero |
|---|---|
| `indice e pannelli sono nello stesso ordine` | senza JavaScript la pagina si legge in un ordine diverso da quello che l'indice promette |
| `nessuno snippet porta attributi data-ds-` | l'impalcatura della vetrina sta finendo nel codice che un frontend si porta via |
| `parti marcate e voci d'elenco coincidono` | l'anatomia numera qualcosa che non c'è, o ne salta una |
| `stessi pannelli, stesso ordine nelle due lingue` | la parità IT/EN ha ceduto — è già successo più volte in questo progetto |
| `nessun pannello sfora in larghezza` | qualcosa esce dal contenitore su mobile, e su mobile arriva metà del traffico |

---

## Quando *non* serve

Su una modifica di una riga a un testo già approvato, il ciclo intero è
sproporzionato: `format:check` e una rilettura bastano. Il gauntlet serve quando
la superficie toccata è più grande di quella che si può ricontrollare a occhio —
e in `cv-site/` lo diventa quasi subito, perché ogni pagina esiste due volte.

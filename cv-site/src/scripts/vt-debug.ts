/**
 * vt-debug.ts — la transizione di pagina raccontata alla console.
 *
 * Si accende con `?vt=debug` su un qualunque indirizzo del sito e resta
 * acceso per la sessione; `?vt=off` lo spegne. `?vt=slowdebug` accende anche
 * il rallentatore, che e' il modo giusto di usarli: uno per guardare, l'altro
 * per contare.
 *
 * ⚠️ Qui NON si misura: si racconta. I numeri li raccoglie l'interruttore
 * inline in Layout.astro, in testa al documento, e il motivo e' scritto li' —
 * uno <script> a modulo come questo gira dopo `pagereveal`, cioe' dopo
 * l'istante di questa transizione che interessa di piu'. Un misuratore che
 * arriva tardi misura solo la parte che gia' andava bene, ed e' esattamente
 * l'errore che ha tenuto in piedi il difetto per tre giri.
 *
 * Perche' esiste: di questa transizione si e' discusso tre volte a memoria di
 * un'impressione — "non e' fluida" — e la misura che si aveva sotto mano era
 * la MEDIANA dei fotogrammi. E' il numero sbagliato: quando un'animazione si
 * pianta all'inizio e poi recupera, i pochi fotogrammi rimasti sono
 * regolarissimi e la mediana dice 16,7ms mentre l'occhio vede uno scatto. Le
 * righe che contano sono le prime due del riepilogo — il buco piu' lungo e
 * quanto sta ferma la cosa che si guarda — e la quarta: quante posizioni
 * distinte ha toccato l'oggetto. Se quel numero cambia a ogni prova,
 * l'animazione dipende da quanto e' occupato il browser, e si vede.
 */

interface Campione {
  /** ms dall'inizio dell'animazione */
  t: number;
  /** ascissa del gruppo in volo, in px */
  x: number;
}

interface Registro {
  campioni: Campione[];
  nome: string | null;
  durata: number;
  fine: Promise<void>;
}

/** Soglie del semaforo. 16,7ms = un fotogramma pieno a 60Hz. */
const BUCO_OK = 34; // due fotogrammi: oltre, si vede
const FERMA_OK = 50;
const POSIZIONI_OK = 15;

export function initVtDebug(): void {
  const reg = (window as Window & { __vt?: Registro }).__vt;
  if (!reg) return;

  void reg.fine.then(() => {
    const { campioni, nome, durata } = reg;
    if (!nome || campioni.length < 2) {
      console.log(
        "%c⟶ transizione di pagina — niente in volo, la pagina e' cambiata e basta",
        "font-weight:700",
      );
      return;
    }

    // I buchi si contano da quando l'oggetto si MUOVE: prima e' l'attesa
    // voluta (--delay-page), e un fotogramma perso mentre nulla si sposta non
    // e' un difetto, e' il motivo per cui quell'attesa esiste.
    const partenza = campioni[0].x;
    const i0 = campioni.findIndex((c) => Math.abs(c.x - partenza) > 2);
    const volo = i0 < 0 ? campioni : campioni.slice(Math.max(0, i0 - 1));
    const gaps = volo.slice(1).map((c, i) => +(c.t - volo[i].t).toFixed(1));

    const buco = gaps.length ? Math.max(...gaps) : 0;
    const persi = gaps.filter((g) => g > 20).length;
    const posizioni = new Set(campioni.map((c) => Math.round(c.x))).size;
    const ferma = i0 < 0 ? durata : campioni[i0].t;

    const semaforo = (ok: boolean) => `color:${ok ? "#0a0" : "#c00"};font-weight:700`;
    console.groupCollapsed(`%c⟶ transizione di pagina — ${nome}`, "font-weight:700");
    console.log(
      `%cbuco piu' lungo   ${buco}ms`,
      semaforo(buco <= BUCO_OK),
      "· il fotogramma piu' lento DURANTE il volo. 16,7 = pieno regime.",
    );
    console.log(
      `%cfotogrammi persi  ${persi} su ${gaps.length}`,
      semaforo(persi === 0),
      "· intervalli sopra i 20ms, sempre durante il volo.",
    );
    console.log(
      `%cposizioni viste   ${posizioni}`,
      semaforo(posizioni >= POSIZIONI_OK),
      "· punti distinti toccati dall'oggetto. Se cambia a ogni prova, e' a scatti.",
    );
    console.log(
      `%cattesa prima      ${Math.round(ferma)}ms`,
      semaforo(true),
      `· voluta (--delay-page): la pagina nasce, poi l'oggetto parte. Sopra i ${FERMA_OK}ms sarebbe un difetto solo se NON fosse dichiarata.`,
    );
    console.log(`durata totale     ${Math.round(durata)}ms`);
    console.table(
      campioni.map((c, i) => ({
        "#": i,
        "t (ms)": Math.round(c.t),
        "gap (ms)": i ? +(c.t - campioni[i - 1].t).toFixed(1) : "",
        "x (px)": Math.round(c.x),
        "passo (px)": i ? Math.round(c.x - campioni[i - 1].x) : "",
      })),
    );
    console.log("dati grezzi in window.__vt");
    console.groupEnd();
  });
}

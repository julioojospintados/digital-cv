/**
 * lab-hero.ts — parallasse della still-life del prototipo /lab/hero.
 *
 * Scrive due sole variabili CSS (--mx, --my, in −1…1) sullo stage; la
 * profondità del singolo oggetto è già nel CSS. Un rAF per l'intera scena
 * invece di una animazione per elemento, e nessuna dipendenza: GSAP qui
 * servirebbe solo per un lerp da quindici righe.
 *
 * Tre sorgenti, una sola uscita:
 *   desktop        → puntatore
 *   tablet          → scroll (la scena si inclina mentre l'hero esce)
 *   telefono        → inclinazione del dispositivo, dove non serve un permesso
 *
 * ── Perché il giroscopio non c'è su iPhone ──────────────────────────────
 * Da iOS 13 `DeviceOrientationEvent.requestPermission()` è obbligatoria e va
 * chiamata da un gesto dell'utente, con un prompt di sistema. Non è un
 * capriccio di Apple: dai sensori di movimento si ricostruisce cosa si digita
 * sulla tastiera a schermo, e la calibrazione di fabbrica di ogni MEMS è un
 * identificativo hardware stabile che permette di riconoscere quel singolo
 * telefono senza cookie (Cambridge, 2019 — è la ricerca che ha fatto scattare
 * il blocco in iOS 12.2).
 *
 * Scelta di Giulio (2026-08-25): niente prompt su una home. Quindi su iPhone
 * l'effetto semplicemente non esiste, e la pagina resta esattamente com'era.
 * Il metodo `requestPermission` è anche il modo standard di riconoscere il
 * caso: se c'è, serve il permesso e ci fermiamo.
 */

// Alzato da 0.08 a 0.11 insieme all'ampiezza (--lh-par-x/y in lab-home.css):
// con una corsa più lunga lo stesso inseguimento lento diventa ritardo, non
// peso. Resta comunque sotto il "attaccato al mouse".
const LERP = 0.11; // quanto insegue il puntatore: basso = più pesante, più fisico
const EPS = 0.0005; // sotto questa soglia la scena è ferma e il loop si spegne

// Quanti gradi di inclinazione servono per arrivare a fondo corsa. 18° è un
// movimento di polso, non di braccio: chi legge sta guardando lo schermo, e
// oltre quella soglia lo schermo non lo vede più.
const TILT = 18;

export function initLabHero(): void {
  const stage = document.querySelector<HTMLElement>("[data-lab-stage]");
  if (!stage) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let running = false;

  const clamp = (v: number) => Math.max(-1, Math.min(1, v));

  const frame = () => {
    currentX += (targetX - currentX) * LERP;
    currentY += (targetY - currentY) * LERP;

    stage.style.setProperty("--mx", currentX.toFixed(4));
    stage.style.setProperty("--my", currentY.toFixed(4));

    if (Math.abs(targetX - currentX) < EPS && Math.abs(targetY - currentY) < EPS) {
      running = false; // scena a riposo: niente rAF finché non si muove qualcosa
      return;
    }
    requestAnimationFrame(frame);
  };

  const kick = () => {
    if (running) return;
    running = true;
    requestAnimationFrame(frame);
  };

  // ── Puntatore (solo dispositivi che ne hanno uno fine) ──
  const finePointer = window.matchMedia("(pointer: fine)");

  const onPointerMove = (e: PointerEvent) => {
    targetX = clamp((e.clientX / window.innerWidth) * 2 - 1);
    targetY = clamp((e.clientY / window.innerHeight) * 2 - 1);
    kick();
  };

  // ── Scroll (mobile e tablet): la scena si inclina mentre l'hero esce ──
  const onScroll = () => {
    const scene = stage.parentElement;
    if (!scene) return;
    const rect = scene.getBoundingClientRect();
    const progress = (rect.top + rect.height / 2) / window.innerHeight; // 1 → 0 uscendo
    targetY = clamp((progress - 0.5) * -1.4);
    targetX = clamp((progress - 0.5) * 0.5);
    kick();
  };

  // ── Inclinazione (telefono) ────────────────────────────────────────
  // Lo zero non è 0°: un telefono in mano sta inclinato di 40-50 gradi, e
  // senza un riferimento catturato alla prima lettura la scena resterebbe
  // incollata al bordo. Il primo evento fa da neutro, e si ricattura al
  // cambio di orientamento — dove beta e gamma si scambiano anche i ruoli.
  let zeroBeta: number | null = null;
  let zeroGamma: number | null = null;

  const onOrientation = (e: DeviceOrientationEvent) => {
    const { beta, gamma } = e;
    // Su alcuni dispositivi i primi eventi arrivano vuoti: non sono uno zero,
    // sono un "non lo so ancora".
    if (beta === null || gamma === null) return;

    if (zeroBeta === null || zeroGamma === null) {
      zeroBeta = beta;
      zeroGamma = gamma;
      return;
    }

    const db = beta - zeroBeta;
    const dg = gamma - zeroGamma;

    // In verticale gamma è il rollio (sinistra-destra) e beta il beccheggio
    // (avanti-indietro). Ruotando lo schermo i due si scambiano e cambiano
    // segno: senza questo, da orizzontale la scena si muove di traverso.
    const angolo = screen.orientation?.angle ?? 0;
    let ax = dg;
    let ay = db;
    if (angolo === 90) {
      ax = db;
      ay = -dg;
    } else if (angolo === 180) {
      ax = -dg;
      ay = -db;
    } else if (angolo === 270) {
      ax = -db;
      ay = dg;
    }

    targetX = clamp(ax / TILT);
    targetY = clamp(ay / TILT);
    kick();
  };

  const ricalibra = () => {
    zeroBeta = null;
    zeroGamma = null;
  };

  // `requestPermission` esiste solo dove il permesso serve (iOS 13+, e quindi
  // anche Chrome e Firefox su iPhone, che sono WebKit sotto). Dove non esiste
  // gli eventi arrivano da soli, in contesto sicuro.
  const gyroSenzaPermesso =
    typeof DeviceOrientationEvent !== "undefined" &&
    typeof (DeviceOrientationEvent as unknown as { requestPermission?: unknown })
      .requestPermission !== "function";

  // Sotto questa soglia gli oggetti dell'ingresso non sono più sparsi: stanno
  // in griglia (vedi lab-home.css § Mobile). Il CSS lì dà loro una corsa
  // molto più corta del desktop — frazioni di rem invece di 3rem — perché in
  // griglia gli oggetti sono a contatto e qualche rem li farebbe accavallare.
  // Il puntatore e lo scroll restano staccati: sotto questa soglia comanda
  // l'inclinazione, e solo dove non serve un permesso.
  // La soglia è la stessa della media query: se cambia una, va cambiata
  // l'altra.
  const gridLayout = window.matchMedia("(max-width: 55.99rem)");

  const bind = () => {
    if (gridLayout.matches) {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
      if (gyroSenzaPermesso) {
        window.addEventListener("deviceorientation", onOrientation, { passive: true });
        window.addEventListener("orientationchange", ricalibra);
        return;
      }
      // iPhone, o un dispositivo senza sensore: nessuna sorgente, e la scena
      // torna ferma invece di restare bloccata sull'ultimo valore scritto.
      targetX = 0;
      targetY = 0;
      stage.style.removeProperty("--mx");
      stage.style.removeProperty("--my");
      return;
    }
    window.removeEventListener("deviceorientation", onOrientation);
    window.removeEventListener("orientationchange", ricalibra);
    ricalibra();
    if (finePointer.matches) {
      window.removeEventListener("scroll", onScroll);
      window.addEventListener("pointermove", onPointerMove, { passive: true });
    } else {
      window.removeEventListener("pointermove", onPointerMove);
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
  };

  bind();
  finePointer.addEventListener("change", bind);
  gridLayout.addEventListener("change", bind);
}

/**
 * lab-home-scroll.ts — movimento allo scroll della prova /lab/home.
 *
 * Tre cose, in ordine di importanza:
 *  1. l'indicatore "Scorri" sparisce appena si scorre e torna in cima;
 *  2. parallasse: sigla, oggetto e testo di ogni sezione si muovono a
 *     velocità diverse mentre la sezione attraversa lo schermo — è la
 *     differenza di velocità a dare profondità, non il movimento in sé;
 *  3. bounce: all'ingresso ogni sezione arriva con un piccolo scatto oltre
 *     la misura e poi si assesta (ease back.out).
 *
 * Lenis e ScrollTrigger sono già agganciati fra loro in Layout.astro
 * (`lenis.on("scroll", ScrollTrigger.update)`): qui si registra solo il
 * plugin, che è idempotente, e si creano i trigger.
 *
 * Regola tenuta apposta: **lo stato iniziale nascosto lo imposta GSAP, non il
 * CSS**. Se lo script non parte, il contenuto resta visibile invece di
 * sparire — è il difetto che avevo segnalato sul sito vero, dove alcune
 * sezioni esistono solo dopo che un trigger è scattato.
 */

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function initLabHomeScroll(): void {
  const hero = document.querySelector<HTMLElement>(".lh-hero");
  if (!hero) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── 1. L'indicatore "Scorri" ──
  // Comportamento funzionale, non decorazione: vale anche a movimento
  // ridotto, solo senza transizione.
  const cue = document.querySelector<HTMLElement>(".lh-scroll");
  if (cue) {
    const duration = reduced ? 0 : 0.35;
    ScrollTrigger.create({
      trigger: hero,
      start: "top+=80 top",
      onEnter: () => gsap.to(cue, { autoAlpha: 0, y: 12, duration, overwrite: true }),
      onLeaveBack: () => gsap.to(cue, { autoAlpha: 1, y: 0, duration, overwrite: true }),
    });
  }

  if (reduced) return;

  // ── 2. Deriva degli oggetti dell'ingresso mentre l'hero esce ──
  // Non tocca `transform` degli oggetti: quello è già occupato dalla
  // parallasse del puntatore (lab-hero.ts). Si scrive una variabile CSS, che
  // la regola in lab-home.css somma alla propria trasformazione — così le due
  // parallassi convivono invece di sovrascriversi.
  const stage = document.querySelector<HTMLElement>(".lh-stage");
  if (stage) {
    const drift = { value: 0 };
    gsap.to(drift, {
      value: -5,
      ease: "none",
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: "bottom top",
        scrub: 0.6,
      },
      onUpdate: () => stage.style.setProperty("--sy", String(drift.value)),
    });
  }

  // ── 3. Le sezioni ──
  const sections = document.querySelectorAll<HTMLElement>(".lh-section");

  sections.forEach((section) => {
    // Sezione non disegnata ("Chi sono" sotto i 56rem): si salta. Non è solo
    // lavoro sprecato — è il `gsap.set(..., autoAlpha: 0)` qui sotto che non
    // deve partire, altrimenti resterebbe applicato e, tornando sopra il
    // breakpoint, la sezione ricomparirebbe vuota. Saltandola il contenuto
    // resta visibile, che è il verso giusto in cui rompersi (vedi l'intestazione
    // di questo file).
    if (!section.getClientRects().length) return;

    const initial = section.querySelector<HTMLElement>(".lh-section__initial");
    const object = section.querySelector<HTMLElement>(".lh-section__object");
    const copy = section.querySelector<HTMLElement>(".lh-section__copy");
    // La sigla ora vive dentro la colonna di testo, ma ha un'animazione sua:
    // va esclusa da qui, altrimenti due tween si contendono la stessa opacità.
    const copyChildren = copy ? Array.from(copy.children).filter((el) => el !== initial) : [];

    // ── Parallasse (scrub) ──
    // La sigla si muove molto, l'oggetto poco, il testo pochissimo: sono tre
    // "distanze" diverse dall'osservatore. Solo `y`, così l'animazione di
    // ingresso qui sotto può usare scale e opacity senza contendersi la
    // stessa proprietà.
    const layers: [HTMLElement | null, number][] = [
      [initial, 90],
      [object, 40],
      [copy, 14],
    ];

    for (const [el, distance] of layers) {
      if (!el) continue;
      gsap.fromTo(
        el,
        { y: distance },
        {
          y: -distance,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.8,
          },
        },
      );
    }

    // ── Ingresso: due timeline, non una ──────────────────────────────────
    // Stesso punto d'innesco, ma vite diverse: l'oggetto rigioca lo scatto a
    // ogni passaggio, le parole entrano una volta sola.
    //
    // Il motivo della separazione è la regola in testa a questo file — il
    // movimento sta sulla decorazione, mai sulle parole — ed è misurato, non
    // di principio: al punto d'innesco il blocco di testo è già dentro la
    // finestra da mobile (581px su 667, cioè 86px visibili), mentre l'oggetto
    // è sotto la piega su entrambi i formati (1062px su una finestra da 900,
    // 1013 su 667). Rigiocare tutto insieme farebbe lampeggiare il titolo a
    // schermo; rigiocare il solo oggetto lo fa ripartire sempre fuori campo.
    const OBJECT_START = "top 78%";

    // Le parole: una volta sola, come prima.
    const enterCopy = gsap.timeline({
      scrollTrigger: { trigger: section, start: OBJECT_START, once: true },
    });

    // L'oggetto: lo scatto si ripete. Prima questa timeline era la stessa di
    // sopra con `once: true`, e l'effetto si vedeva una volta per sezione —
    // dal secondo passaggio gli oggetti restavano fermi a scala 1 (misurato:
    // escursione 0,154 al primo ingresso, 0,000 ai successivi).
    //
    // "restart none none none" = riparte da capo ogni volta che la sezione
    // entra scendendo, e non tocca nulla negli altri tre casi. Il `reset` su
    // onLeaveBack, l'altra scelta idiomatica, qui farebbe danno: riporterebbe
    // l'oggetto a 0,86 mentre la sezione sta ancora attraversando il bordo
    // basso della finestra, cioè con un lampo a metà transizione.
    const enterObject = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: OBJECT_START,
        toggleActions: "restart none none none",
      },
    });

    if (object) {
      gsap.set(object, { autoAlpha: 0, scale: 0.86 });
      enterObject.to(object, {
        autoAlpha: 1,
        scale: 1,
        duration: 0.9,
        ease: "back.out(1.7)",
      });
    }

    if (copyChildren.length) {
      gsap.set(copyChildren, { autoAlpha: 0, scale: 0.98 });
      enterCopy.to(
        copyChildren,
        {
          autoAlpha: 1,
          scale: 1,
          duration: 0.6,
          stagger: 0.08,
          ease: "back.out(1.4)",
        },
        0.12,
      );
    }

    if (initial) {
      gsap.set(initial, { autoAlpha: 0 });
      enterCopy.to(initial, { autoAlpha: 1, duration: 1.1, ease: "power2.out" }, 0);
    }
  });

  // Le immagini sono lazy: l'altezza della pagina cambia mentre arrivano, e
  // senza questo i trigger resterebbero calcolati su misure vecchie.
  window.addEventListener("load", () => ScrollTrigger.refresh());
}

/**
 * L'ambiente segue la scheda: entrando in una modalità la luce della stanza
 * ne prende il colore (arancione design, ciano tech, viola management, oro
 * AI). All'ingresso non c'è ancora nessuna scelta, quindi la luce resta
 * neutra.
 *
 * Qui si scrive **solo il nome della modalità** su .lh: i colori, la loro
 * intensità e la transizione stanno tutti in lab-home.css (--lh-mood). Il
 * giorno in cui un accento cambia, si cambia in un posto solo.
 *
 * Il margine -50%/-50% riduce l'area di osservazione a una riga a metà
 * finestra: siccome ogni pannello è alto almeno una schermata, ne attraversa
 * quella riga **uno per volta**. Niente soglie da tarare, niente conteggi di
 * quanto è visibile: entra uno, esce l'altro.
 */
export function initLabHomeMood(): void {
  const root = document.querySelector<HTMLElement>(".lh");
  const panels = document.querySelectorAll<HTMLElement>(".lh-hero, .lh-section");
  if (!root || !panels.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        // L'hero non ha data-mode: nessuna modalità scelta, ambiente neutro.
        const mode = (entry.target as HTMLElement).dataset.mode;
        if (mode) root.dataset.mood = mode;
        else delete root.dataset.mood;
      }
    },
    { rootMargin: "-50% 0px -50% 0px", threshold: 0 },
  );

  panels.forEach((panel) => observer.observe(panel));
}

/**
 * Aggancio delle sezioni: **una scrollata, una sezione**.
 *
 * Prima versione, scartata: si lasciava scorrere liberamente e si agganciava
 * alla sezione più vicina quando il movimento si fermava. Funzionava, ma il
 * momento in cui "il movimento si ferma" arriva tardissimo — con l'inerzia di
 * un trackpad Lenis continua a emettere eventi per quasi un secondo, e nel
 * frattempo la pagina scorre libera. L'impressione era di uno scroll normale
 * con una correzione tardiva appiccicata in coda.
 *
 * Questa versione intercetta il gesto invece di aspettarne la fine: rotella,
 * dito e tastiera vengono presi al volo e tradotti in "vai alla sezione
 * successiva". Non esiste posizione intermedia, mai.
 *
 * Nota sull'ordine degli ascoltatori: gli eventi vengono presi in **fase di
 * cattura** e fermati lì. Lenis ascolta la rotella in fase di risalita, quindi
 * senza `stopPropagation` scorrerebbe anche lui e i due movimenti si
 * sommerebbero.
 */
export function initLabHomeSnap(): void {
  const hero = document.querySelector<HTMLElement>(".lh-hero");
  const sectionEls = Array.from(document.querySelectorAll<HTMLElement>(".lh-section"));
  if (!hero || !sectionEls.length) return;

  const allPanels = [hero, ...sectionEls];
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /**
   * I pannelli **effettivamente disegnati**.
   *
   * "Chi sono" è sospesa sotto i 56rem (`display: none` in lab-home.css), e
   * un elemento non disegnato ha rettangolo nullo: lasciarlo nella lista
   * falserebbe sia le posizioni di arrivo sia il conteggio dei passi, cioè
   * produrrebbe di nuovo un aggancio che porta nel posto sbagliato.
   *
   * Si ricalcola a ogni gesto invece di fissarla all'avvio: così ruotare il
   * telefono — che attraversa il breakpoint — non lascia in uso una lista
   * vecchia.
   */
  const livePanels = (): HTMLElement[] => allPanels.filter((el) => el.getClientRects().length > 0);

  const DURATION = reduced ? 0.01 : 0.8;

  /**
   * Quanto silenzio serve, dopo l'arrivo, prima di riaprire ai gesti.
   *
   * Prima qui c'era una pausa fissa di 260ms, e non funzionava con il
   * trackpad. Un dito su un trackpad — e un dito su un telefono — non emette
   * un evento: ne emette una scia che decade per quasi un secondo. Con una
   * pausa fissa la scia arrivava a pausa scaduta e valeva come un gesto
   * nuovo: si partiva per una scheda e se ne saltavano due o tre.
   *
   * Adesso non si aspetta un tempo, si aspetta il **silenzio**: finché
   * continuano ad arrivare eventi la riapertura viene rimandata. L'inerzia
   * si esaurisce da sola e il gesto successivo — quello vero, dopo una
   * pausa umana — trova la pagina pronta.
   */
  const QUIET_MS = reduced ? 60 : 220;

  /**
   * Il rimbalzo finale. La sezione supera di poco il punto d'arrivo e ci
   * rientra: è quello che dà la sensazione di peso, invece di una frenata
   * liscia che si spegne e basta.
   *
   * BOUNCE regola il sorpasso. A 0.8 la pagina va oltre di circa il 2,3%
   * della distanza percorsa — una ventina di pixel su una sezione da 900.
   * Alzarlo lo rende più marcato, abbassarlo più discreto; sopra 1.5
   * comincia a sembrare un errore invece che un'intenzione.
   *
   * A x = 1 la funzione vale esattamente 1, quindi si atterra sul bersaglio
   * preciso: il rimbalzo è dentro il percorso, non un residuo alla fine.
   */
  const BOUNCE = 0.8;
  const easeOutBack = (x: number): number => {
    const u = x - 1;
    return 1 + (BOUNCE + 1) * u * u * u + BOUNCE * u * u;
  };
  const SWIPE_MIN = 45; // px di dito prima di considerarlo uno swipe
  const EDGE = 2; // tolleranza sui bordi, per gli arrotondamenti

  let busy = false;
  let lastGestureTs = 0;

  /** Riapre ai gesti solo quando la scia si è spenta (vedi QUIET_MS). */
  const release = () => {
    const quiet = performance.now() - lastGestureTs;
    if (quiet < QUIET_MS) {
      window.setTimeout(release, QUIET_MS - quiet);
      return;
    }
    busy = false;
  };

  /** Ferma l'evento qui: Lenis ascolta in risalita e senza questo scorrerebbe
   *  anche lui, sommandosi all'animazione in corso. */
  const swallow = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;

  /** Le posizioni di arrivo: l'inizio di ogni pannello disegnato, più il fondo
   *  pagina — senza quest'ultimo la nota di chiusura resterebbe
   *  irraggiungibile. Prende la lista in ingresso perché chi la chiama deve
   *  poter indicizzare gli stessi pannelli a cui le posizioni si riferiscono. */
  const stops = (list: HTMLElement[]): number[] => {
    const max = maxScroll();
    const tops = list.map((el) =>
      Math.max(0, Math.min(Math.round(el.getBoundingClientRect().top + window.scrollY), max)),
    );
    if (max - tops[tops.length - 1] > 4) tops.push(max);
    return tops;
  };

  /** Da dove si parte: si ricava dalla posizione reale, non da un indice
   *  tenuto in memoria — così restano corretti anche i salti fatti da un
   *  link con l'ancora, dalla tastiera o dal ripristino del browser. */
  const currentIndex = (list: number[]): number => {
    const y = window.scrollY;
    let best = 0;
    for (let i = 0; i < list.length; i++) {
      if (Math.abs(list[i] - y) < Math.abs(list[best] - y)) best = i;
    }
    return best;
  };

  const step = (direction: 1 | -1): void => {
    if (busy) return;
    const live = livePanels();
    const list = stops(live);
    const from = currentIndex(list);
    const to = from + direction;
    if (to < 0 || to >= list.length) return;

    // ── Il punto di riposo del pannello corrente, NEL VERSO in cui si va ──
    // Per un pannello più alto della finestra non coincide col suo inizio:
    // scendendo è il suo fondo allineato al fondo della finestra, cioè
    // l'inizio più la parte che eccede.
    //
    // Misurare sempre dall'inizio era il bug del "doppio rimbalzo" trovato da
    // mobile su "Chi sono" (925px in una finestra da 667): arrivati in fondo
    // alla sezione il gesto veniva catturato — giustamente, siamo al bordo —
    // ma la distanza dall'inizio (258px) superava la soglia di deriva, quindi
    // `destination` tornava a essere l'inizio della sezione stessa. Ogni
    // swipe in giù riportava in cima alla sezione e le successive erano
    // irraggiungibili.
    const panel = live[Math.min(from, live.length - 1)];
    const overflow = Math.max(
      0,
      Math.round(panel.getBoundingClientRect().height - window.innerHeight),
    );
    const anchor = direction > 0 ? list[from] + overflow : list[from];

    // Quanto siamo avanti (positivo) o indietro (negativo) rispetto al punto
    // di riposo, misurato nel verso in cui si sta andando.
    const lead = (window.scrollY - anchor) * direction;

    // Si torna sul punto di riposo solo se lo si deve ancora RAGGIUNGERE.
    // Averlo superato non è deriva: è aver già letto la sezione, e lì il
    // gesto deve portare avanti. Senza questa direzionalità la pagina veniva
    // tirata indietro ogni volta che lo scorrimento libero passava di slancio
    // oltre il fondo di una sezione lunga — il rimbalzo all'indietro che
    // restava anche dopo aver corretto l'ancoraggio.
    const drifted = lead < -window.innerHeight * 0.15;
    const destination = drifted ? anchor : list[to];

    busy = true;
    const lenis = window.__lenis;
    if (lenis) {
      lenis.scrollTo(destination, {
        duration: DURATION,
        // Niente rimbalzo a movimento ridotto: lì lo spostamento è istantaneo
        // e un sorpasso sarebbe solo uno scatto in più da subire.
        easing: reduced ? (x: number) => x : easeOutBack,
        lock: true,
        force: true,
        onComplete: () => {
          requestAnimationFrame(() => {
            if (Math.abs(window.scrollY - destination) > EDGE) {
              lenis.scrollTo(destination, { immediate: true, force: true });
            }
            release();
          });
        },
      });
    } else {
      // Senza Lenis (script non ancora eseguito, o disattivato) il
      // comportamento resta lo stesso, con lo scorrimento nativo.
      window.scrollTo({ top: destination, behavior: reduced ? "auto" : "smooth" });
      window.setTimeout(release, DURATION * 1000);
    }
  };

  /** Una sezione più alta della finestra va letta scorrendo: si cattura il
   *  gesto solo quando si è già al suo bordo, nel verso in cui si sta andando.
   *  Senza questo, su schermi bassi il contenuto in eccesso sarebbe
   *  irraggiungibile. */
  const shouldCapture = (direction: 1 | -1): boolean => {
    const live = livePanels();
    const list = stops(live);
    const el = live[Math.min(currentIndex(list), live.length - 1)];
    const r = el.getBoundingClientRect();
    if (r.height <= window.innerHeight + EDGE) return true;
    return direction > 0 ? r.bottom <= window.innerHeight + EDGE : r.top >= -EDGE;
  };

  const take = (e: Event, direction: 1 | -1): void => {
    if (!shouldCapture(direction)) return;
    swallow(e);
    step(direction);
  };

  // ── Rotella e trackpad ──
  window.addEventListener(
    "wheel",
    (e) => {
      if (Math.abs(e.deltaY) < 2) return;
      // Va segnato **sempre**, anche quando l'evento verrà ignorato: è
      // proprio la scia che si vuole misurare per sapere quando è finita.
      lastGestureTs = performance.now();
      // Durante l'animazione l'evento si ferma qui e basta. Prima passava da
      // `take`, che prima di fermarlo consultava `shouldCapture` — e a pagina
      // in movimento quel controllo può dire di no, lasciando filtrare
      // l'inerzia a Lenis: la pagina scorreva sotto l'animazione.
      if (busy) {
        swallow(e);
        return;
      }
      take(e, e.deltaY > 0 ? 1 : -1);
    },
    { capture: true, passive: false },
  );

  // ── Dito ──
  let touchStartY: number | null = null;

  // Azzerare qui è necessario, non igiene: senza, dopo uno swipe più corto
  // della soglia `touchStartY` restava quello del gesto precedente, e il
  // tocco successivo veniva misurato da un punto di partenza vecchio — da
  // cui swipe che non facevano niente e swipe che partivano da soli.
  const endTouch = () => {
    touchStartY = null;
  };
  window.addEventListener("touchend", endTouch, { capture: true, passive: true });
  window.addEventListener("touchcancel", endTouch, { capture: true, passive: true });

  window.addEventListener(
    "touchstart",
    (e) => {
      touchStartY = e.touches[0]?.clientY ?? null;
    },
    { capture: true, passive: true },
  );

  window.addEventListener(
    "touchmove",
    (e) => {
      if (touchStartY === null) return;
      lastGestureTs = performance.now();
      if (busy) {
        swallow(e);
        return;
      }
      const delta = touchStartY - (e.touches[0]?.clientY ?? touchStartY);
      if (Math.abs(delta) < SWIPE_MIN) {
        // Sotto la soglia il gesto non è ancora uno swipe, ma va comunque
        // fermato: altrimenti Lenis lo fa scorrere e si vede la pagina
        // muoversi di un po' prima dello scatto.
        if (shouldCapture(delta > 0 ? 1 : -1)) swallow(e);
        return;
      }
      touchStartY = null;
      take(e, delta > 0 ? 1 : -1);
    },
    { capture: true, passive: false },
  );

  // ── Tastiera: deve restare navigabile senza mouse ──
  window.addEventListener("keydown", (e) => {
    const list = stops(livePanels());
    if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") {
      e.preventDefault();
      step(1);
    } else if (e.key === "ArrowUp" || e.key === "PageUp") {
      e.preventDefault();
      step(-1);
    } else if (e.key === "Home") {
      e.preventDefault();
      window.__lenis?.scrollTo(list[0], { duration: DURATION, force: true });
    } else if (e.key === "End") {
      e.preventDefault();
      window.__lenis?.scrollTo(list[list.length - 1], { duration: DURATION, force: true });
    }
  });
}

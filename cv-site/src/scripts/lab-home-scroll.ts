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

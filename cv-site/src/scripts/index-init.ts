import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { setMode } from "../islands/stores/modeStore.ts";

gsap.registerPlugin(ScrollTrigger);

// ── Reduced motion: GSAP bypassa le regole CSS, occorre controllo JS ────────
// Accelera tutte le timeline a x50 → effetto "immediato" senza rimuovere la
// logica degli stati. I callbacks (onComplete, launchJourney) girano comunque.
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  gsap.globalTimeline.timeScale(50);
}

// ── DOM refs ─────────────────────────────────────────────
const preloader = document.getElementById("preloader")!;
const header = document.getElementById("entry-header")!;
const nameEl = document.getElementById("entry-name")!;
const cards = document.querySelectorAll<HTMLButtonElement>(".mode-card");
const knolls = document.querySelectorAll<HTMLImageElement>(
  ".knoll-item, .knoll-m",
);

// ── Immagini knolling cliccabili — seguono l'istinto dell'utente ──────────
// Desktop (.knoll-item): listener sull'img — area precisa via clip-path CSS.
// Mobile (.knoll-wrap): listener sul div wrapper — evita che la zona
//   trasparente dell'img intercetti il click sulle celle adiacenti.
// Torcia (flashlight): solo click entro 1rem dal centro attivano la card,
//   così le zone trasparenti intorno al corpo della torcia non interferiscono.

// Utility: distanza in px del click dal centro dell'elemento.
function _distFromCenter(rect: DOMRect, clientX: number, clientY: number): number {
  return Math.hypot(clientX - (rect.left + rect.width / 2), clientY - (rect.top + rect.height / 2));
}
const _1rem = (): number => parseFloat(getComputedStyle(document.documentElement).fontSize);

document.querySelectorAll<HTMLImageElement>(".knoll-item").forEach((img) => {
  const primaryMode = img.dataset.modes?.split(" ")[0];
  if (!primaryMode) return;
  const targetCard = document.querySelector<HTMLButtonElement>(
    `.mode-card[data-mode="${primaryMode}"]`,
  );
  if (!targetCard) return;

  if (img.src.includes("flashlight")) {
    // Flashlight desktop: solo 1rem dal centro è cliccabile
    img.addEventListener("click", (e) => {
      if (_distFromCenter(img.getBoundingClientRect(), e.clientX, e.clientY) <= _1rem()) {
        targetCard.click();
      }
    });
  } else {
    img.addEventListener("click", () => targetCard.click());
  }
});

document.querySelectorAll<HTMLElement>(".knoll-wrap").forEach((wrap) => {
  const img = wrap.querySelector<HTMLImageElement>(".knoll-m");
  const primaryMode = img?.dataset.modes?.split(" ")[0];
  if (!primaryMode) return;
  const targetCard = document.querySelector<HTMLButtonElement>(
    `.mode-card[data-mode="${primaryMode}"]`,
  );
  if (!targetCard) return;

  if (img?.src.includes("flashlight")) {
    // Flashlight mobile: solo 1rem dal centro dell'immagine è cliccabile
    wrap.addEventListener("click", (e) => {
      if (_distFromCenter(img.getBoundingClientRect(), e.clientX, e.clientY) <= _1rem()) {
        targetCard.click();
      }
    });
  } else {
    wrap.addEventListener("click", () => targetCard.click());
  }
});

let selectedMode: string | null = null;
// Tweens del pulse sulle card — salvati per poterli killare alla selezione
const cardPulseTweens: gsap.core.Tween[] = [];

// ── Mobile grid expansion — stato modulo ─────────────────────────────────
// Quando l'utente seleziona una card su touch, il grid si espande (60/40)
// invece di usare scale() che causa overflow interno nella cella.
const modeCardsEl = document.getElementById("mode-cards") as HTMLElement;
let _gridLocked = false;  // true dopo la prima selezione (fr → px bloccati)
let _lockedH = 0;         // altezza totale del container (meno il gap)
let _lockedW = 0;         // larghezza totale del container (meno il gap)

/**
 * Converti la griglia da fr a px (no-op visivo), poi anima la distribuzione
 * in modo che la cella selezionata ottenga il 60% dello spazio disponibile.
 * Chiamate successive tweenano direttamente px→px senza reset.
 * Ordine auto-placement: tech(0)=r0c0, creative(1)=r0c1, management(2)=r1c0, human(3)=r1c1
 */
function expandMobileGrid(cardIndex: number) {
  const EXPAND = 0.60;
  const SHRINK = 1 - EXPAND;
  const GRID_GAP = 6; // corrisponde a gap: 0.4rem nel CSS

  if (!_gridLocked) {
    const rect = modeCardsEl.getBoundingClientRect();
    _lockedH = rect.height - GRID_GAP;
    _lockedW = rect.width - GRID_GAP;
    // Blocca il grid su pixel espliciti → identico visivamente, tweenabile da GSAP
    gsap.set(modeCardsEl, {
      gridTemplateRows: `${_lockedH / 2}px ${_lockedH / 2}px`,
      gridTemplateColumns: `${_lockedW / 2}px ${_lockedW / 2}px`,
    });
    _gridLocked = true;
  }

  const selRow = cardIndex < 2 ? 0 : 1;
  const selCol = cardIndex % 2;

  const r1 = selRow === 0 ? _lockedH * EXPAND : _lockedH * SHRINK;
  const r2 = selRow === 1 ? _lockedH * EXPAND : _lockedH * SHRINK;
  const c1 = selCol === 0 ? _lockedW * EXPAND : _lockedW * SHRINK;
  const c2 = selCol === 1 ? _lockedW * EXPAND : _lockedW * SHRINK;

  gsap.to(modeCardsEl, {
    gridTemplateRows: `${r1}px ${r2}px`,
    gridTemplateColumns: `${c1}px ${c2}px`,
    duration: 0.52,
    ease: "expo.out",
    overwrite: "auto",
  });
}

// Reset su resize per evitare valori px obsoleti dopo rotazione schermo
window.addEventListener(
  "resize",
  () => {
    if (_gridLocked) {
      gsap.set(modeCardsEl, {
        clearProps: "gridTemplateRows,gridTemplateColumns",
      });
      _gridLocked = false;
      _lockedH = 0;
      _lockedW = 0;
    }
  },
  { passive: true },
);

// ── Split nome in chars individuali — G di Giulio e O di Occhipinti sono le iniziali GO ──
let firstGChar: HTMLElement | null = null;
let firstOChar: HTMLElement | null = null;

document.querySelectorAll<HTMLElement>(".name-word").forEach((word, wi) => {
  const text = word.textContent ?? "";
  word.textContent = "";
  text.split("").forEach((char, ci) => {
    const s = document.createElement("span");
    s.className = "name-char";
    s.textContent = char === " " ? "\u00A0" : char;
    if (wi === 0 && ci === 0) firstGChar = s;
    if (wi === 1 && ci === 0) firstOChar = s;
    word.appendChild(s);
  });
});

const allChars = Array.from(nameEl.querySelectorAll<HTMLElement>(".name-char"));
const goChars: HTMLElement[] = [];
if (firstGChar) goChars.push(firstGChar);
if (firstOChar) goChars.push(firstOChar);
const otherChars = allChars.filter((c) => c !== firstGChar && c !== firstOChar);

// ── Stato iniziale: tutto nascosto — GSAP gestisce la rivelazione ──────────
// G e O: partono grandi e in alto (stessa fromTo della hero di cv.astro)
gsap.set(goChars, { opacity: 0, scale: 1.8, y: -20 });
// Resto del nome: 18px sotto (semplice fade-up, senza clip)
gsap.set(otherChars, { opacity: 0, y: 18 });
// Label e tagline
gsap.set(["#entry-label", "#entry-tagline", "#lang-switch"], { opacity: 0, y: 10 });

// ── Preloader refs ────────────────────────────────────────────────────────
const preGEl = document.getElementById("pre-G")!;
const preOEl = document.getElementById("pre-O")!;

// La barra CSS impiega 0.2s (delay) + 0.7s (fill) = 0.9s. Partiamo a 0.9s.
gsap.delayedCall(0.9, () => {
  const tl = gsap.timeline();

  // 1. Glow flash sulle lettere del preloader — identità rivelata
  tl.to([preGEl, preOEl], {
    textShadow: "0 0 40px rgba(255,255,255,0.75)",
    duration: 0.15,
    stagger: 0.06,
    ease: "power2.out",
  });
  tl.to([preGEl, preOEl], {
    textShadow: "0 0 0px transparent",
    duration: 0.1,
    ease: "power2.in",
  });

  // 2. Preloader sfuma — G e O si "trasformano" nel nome
  tl.to(preloader, {
    opacity: 0,
    duration: 0.3,
    ease: "power2.inOut",
    onComplete: () => {
      preloader.style.display = "none";
    },
  });

  // 3. Header torna visibile (era opacity:0 via CSS)
  tl.set(header, { opacity: 1 });

  // 4. G e O "atterrano" nel nome — punch identico alla hero di cv.astro
  tl.fromTo(
    goChars,
    { opacity: 0, scale: 1.8, y: -20 },
    {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.45,
      stagger: 0.12,
      ease: "back.out(1.7)",
    },
    "+=0.02",
  );

  // 5. Glow pulse su G e O nel nome (identico cv.astro)
  tl.to(
    goChars,
    {
      textShadow:
        "0 0 28px rgba(255,255,255,0.65), 0 0 12px rgba(255,255,255,0.4)",
      duration: 0.2,
      ease: "power2.out",
    },
    "-=0.1",
  );
  tl.to(goChars, {
    textShadow: "0 0 0px transparent",
    duration: 0.45,
    ease: "power2.in",
  });

  // 6. "iulio" e "cchipinti" — stagger identico cv.astro hero
  tl.to(
    otherChars,
    {
      opacity: 1,
      y: 0,
      duration: 0.45,
      stagger: { each: 0.04, from: "start" },
      ease: "power3.out",
    },
    "-=0.35",
  );

  // 7. Tag G e O per il glow mode-reactive (hover sulle card)
  tl.call(() => {
    if (firstGChar) firstGChar.classList.add("name-go-g");
    if (firstOChar) firstOChar.classList.add("name-go-o");
  });

  // 8. "Digital CV" + tagline + lang-switch compaiono insieme, subito dopo il nome completo
  tl.to(
    ["#entry-label", "#entry-tagline", "#lang-switch"],
    {
      opacity: 1,
      y: 0,
      duration: 0.35,
      stagger: 0,
      ease: "power3.out",
    },
  );

  // 9. Mode cards — ordine spaziale TL→BR (ordine DOM = tech→creative→management→human)
  // Segue la diagonale naturale di lettura: l'occhio è guidato senza sorprese.
  const orderedCards = Array.from(cards); // già in ordine DOM row-by-row (2x2 grid)
  tl.fromTo(
    orderedCards,
    { y: 30, opacity: 0, scale: 0.94 },
    {
      y: 0,
      opacity: 1,
      scale: 1,
      duration: 0.6,
      stagger: 0.05, // 50ms — quasi simultanee, sembrano un gruppo compatto
      ease: "back.out(1.4)",
    },
    "+=0.05",
  );

  // 10. Knolling — ordine spaziale: sort per posizione Y (peso 0.7) + X (peso 0.3)
  // Crea un'onda diagonale TL→BR: prima le immagini in alto, poi quelle in basso.
  // offsetTop/offsetLeft invece di getBoundingClientRect → immune ai GSAP transform.
  // Inizia 0.25s dopo l'inizio delle card (overlap parziale: le ultime card escono
  // mentre le prime immagini entrano — composizione knolling che si assembla).
  tl.call(() => {
    const sortedKnolls = Array.from(knolls).sort((a, b) => {
      const scoreA = a.offsetTop * 0.7 + a.offsetLeft * 0.3;
      const scoreB = b.offsetTop * 0.7 + b.offsetLeft * 0.3;
      return scoreA - scoreB;
    });
    sortedKnolls.forEach((knoll, i) => {
      knoll.style.setProperty("--knoll-delay", `${i * 45}ms`);
      knoll.classList.add("do-enter");
    });
  }, undefined, "-=0.55");

   // 10b. Pulse attenzione sulle card — bordo che pulsa ogni 1.5s in loop
   // per comunicare interattività persistente. Si ferma quando una card viene selezionata.
   // Inizia 0.6s dopo che le card sono apparse (durata entrata = 0.8s + stagger 0.36s ≈ 1.16s totale).
   tl.call(() => {
     if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
     // up (0.32s) + down (0.32s) = 0.64s — repeatDelay = 1.5 - 0.64 = 0.86s → ciclo totale 1.5s
     cards.forEach((card, i) => {
       const style = getComputedStyle(card);
       const goColor = style.getPropertyValue("--card-go-color").trim() || "rgba(255,255,255,1)";
       const goShadow = style.getPropertyValue("--card-go-shadow").trim() || "rgba(255,255,255,0.12)";
       const tw = gsap.fromTo(
         card,
         { boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.08)` },
         {
           boxShadow: `inset 0 0 0 1.5px ${goColor.replace("1)", "0.55)")}, 0 0 14px 2px ${goShadow.replace("0.35)", "0.18)")}`,
           duration: 0.32,
           delay: i * 0.12,
           ease: "power2.out",
           yoyo: true,
           repeat: -1,
           repeatDelay: 0.86,
         },
       );
       cardPulseTweens.push(tw);
     });
   }, undefined, "+=0.6");

   // 10c. Pulse attenzione sulle profile-cta — stesso effetto delle mode-card
   // Inizia quando le card sono completamente visibili
   tl.call(() => {
     if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
     document.querySelectorAll<HTMLElement>(".profile-cta").forEach((cta, i) => {
       const section = cta.closest<HTMLElement>(".profile-section");
       if (!section) return;
       const style = getComputedStyle(section);
       const psAccent = style.getPropertyValue("--ps-accent").trim() || "rgba(255,255,255,1)";
       const tw = gsap.fromTo(
         cta,
         { boxShadow: `0 0 0 1px color-mix(in srgb, ${psAccent} 20%, transparent)` },
         {
           boxShadow: `0 0 0 1.5px color-mix(in srgb, ${psAccent} 50%, transparent), 0 0 14px 2px color-mix(in srgb, ${psAccent} 14%, transparent)`,
           duration: 0.32,
           delay: i * 0.12,
           ease: "power2.out",
           yoyo: true,
           repeat: -1,
           repeatDelay: 0.86,
         },
       );
     });
   }, undefined, "+=0.6");

  // 11. FAB compare dopo le card — rimuove data-fab-hidden → CSS transition anima ingresso
  tl.call(() => {
    document.documentElement.removeAttribute("data-fab-hidden");
  }, undefined, "+=0.35");
});

// ── Magnetic effect on mode cards ────────────────────────
cards.forEach((card) => {
  const strength = 12;

  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = ((e.clientX - cx) / rect.width) * strength;
    const dy = ((e.clientY - cy) / rect.height) * strength;
    gsap.to(card, { x: dx, y: dy, duration: 0.4, ease: "power2.out" });
  });

  card.addEventListener("mouseleave", (event) => {
    if (!card.classList.contains("is-selected")) {
      gsap.to(card, {
        x: 0,
        y: 0,
        scale: 1,
        duration: 0.5,
        ease: "elastic.out(1, 0.4)",
      });
    }
    const relatedTarget = event.relatedTarget as Node | null;
    const isMovingWithinCards =
      !!relatedTarget && relatedTarget instanceof Node
        ? card.parentElement?.contains(relatedTarget) ?? false
        : false;

    // Rimuovi preview mode solo quando il puntatore lascia davvero l'area delle card.
    if (!selectedMode && !isMovingWithinCards) {
      nameEl.removeAttribute("data-mode-preview");
    }
  });

  card.addEventListener("mouseenter", () => {
    if (selectedMode && card.dataset.mode !== selectedMode) return;
    gsap.to(card, { scale: 1.03, duration: 0.3, ease: "power2.out" });
    // Anteprima: G e O del nome reagiscono come GoLogo
    nameEl.setAttribute("data-mode-preview", card.dataset.mode!);
  });
});

// ── Launch journey animation ──────────────────────────────
function launchJourney(href: string) {
  document.body.style.pointerEvents = "none";
  const overlay = document.getElementById("launch-overlay")!;
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  const lineCount = 28;
  const lineEls: HTMLElement[] = [];

  for (let i = 0; i < lineCount; i++) {
    const angle = (i / lineCount) * 360;
    const rad = (angle * Math.PI) / 180;
    const dist = Math.random() * 60 + 10;
    const len = Math.random() * 200 + 80;
    const thick = Math.random() * 1.5 + 0.5;
    const line = document.createElement("div");
    Object.assign(line.style, {
      position: "fixed",
      left: `${cx + Math.cos(rad) * dist}px`,
      top: `${cy + Math.sin(rad) * dist}px`,
      width: `${len}px`,
      height: `${thick}px`,
      background: "rgba(255,255,255,0.9)",
      transform: `rotate(${angle}deg)`,
      transformOrigin: "left center",
      opacity: "0",
      zIndex: "99997",
      pointerEvents: "none",
    });
    document.body.appendChild(line);
    lineEls.push(line);
  }

  const journey = gsap.timeline({
    onComplete: () => {
      lineEls.forEach((l) => l.remove());
    },
  });

  const isTouchDevice = !window.matchMedia("(hover: hover) and (pointer: fine)")
    .matches;

  // Speed lines sparano verso l'esterno (warp speed)
  // Su touch: durate bilanciate per visibilità senza ritardo eccessivo
  const phase1Duration = isTouchDevice ? 0.55 : 0.6;
  const phase1Stagger = isTouchDevice ? 0.02 : 0.018;
  const phase2Duration = isTouchDevice ? 0.25 : 0.5;
  const phase3Duration = isTouchDevice ? 0.35 : 0.35;
  const phase3Stagger = isTouchDevice ? 0.012 : 0.009;
  const blurStart = isTouchDevice ? 0.4 : 0.5;
  const vignetteStart = isTouchDevice ? 0.75 : 0.9;
  // Naviga quando la vignette è abbastanza scura (non aspettare onComplete)
  const navigateAt = isTouchDevice ? vignetteStart + 0.28 : vignetteStart + 0.4;

  // Fase 1: comparsa — rimangono visibili per ~1s totale
  journey.fromTo(
    lineEls,
    { scaleX: 0, opacity: 0 },
    {
      scaleX: 1,
      opacity: 0.85,
      duration: phase1Duration,
      stagger: { each: phase1Stagger, from: "random" },
      ease: "power2.out",
    },
  );
  // Fase 2: hold visibile (opacity stabile) prima di sparire
  journey.to(
    lineEls,
    { opacity: 0.85, duration: phase2Duration, ease: "none" },
    "-=0",
  );
  // Fase 3: allontanamento warp e dissolvenza
  journey.to(
    lineEls,
    {
      scaleX: 6,
      opacity: 0,
      duration: phase3Duration,
      stagger: { each: phase3Stagger, from: "random" },
      ease: "power4.in",
    },
    "-=0",
  );

  // Il mondo si allontana mentre acceleri
  journey.to(
    [header, cards],
    {
      opacity: 0,
      scale: 0.85,
      filter: "blur(10px)",
      duration: phase3Duration,
      ease: "power3.in",
    },
    blurStart,
  );
  journey.to(
    knolls,
    {
      opacity: 0,
      filter: "blur(10px)",
      duration: phase3Duration,
      ease: "power3.in",
    },
    blurStart,
  );

  // Vignette scura chiude la scena
  journey.to(
    overlay,
    { opacity: 1, duration: 0.5, ease: "power2.inOut" },
    vignetteStart,
  );

  // Naviga quando la vignette è abbastanza scura — non aspettare il completamento
  journey.call(() => { window.location.href = href; }, undefined, navigateAt);
}

// ── Scroll alla profile-section — hero card ancora la preview sotto ────────
// invece di lasciare la pagina con launchJourney(). Il vero "commit" di
// navigazione resta solo sul .profile-cta in fondo a ogni sezione: così
// chi tocca la card in hero vede prima un'anteprima del mode, a costo zero.
function getOffsetTop(el: HTMLElement): number {
  let top = 0;
  let current: HTMLElement | null = el;
  while (current) {
    top += current.offsetTop;
    current = current.offsetParent as HTMLElement | null;
  }
  return top;
}

function scrollToProfile(mode: string) {
  const target = document.querySelector<HTMLElement>(
    `.profile-section[data-mode="${mode}"]`,
  );
  if (!target) {
    window.location.href = `/${mode}`;
    return;
  }
  const absoluteTop = getOffsetTop(target);
  const lenis = window.__lenis;
  if (lenis && typeof lenis.scrollTo === "function") {
    lenis.scrollTo(absoluteTop, { duration: 1.2 });
  } else {
    window.scrollTo({ top: absoluteTop, behavior: "smooth" });
  }
}

// ── Seleziona mode: aggiorna card UI, knolling, modeStore ───────────────
const modeGlow: Record<string, string> = {
  tech: "0 0 24px 4px rgba(0,255,200,0.45)",
  creative: "0 0 24px 4px rgba(255,107,53,0.45)",
  human: "0 0 24px 4px rgba(240,200,127,0.45)",
  management: "0 0 24px 4px rgba(180,100,255,0.45)",
};

function selectMode(targetCard: HTMLButtonElement, mode: string) {
  selectedMode = mode;
  setMode(mode as "tech" | "creative" | "human" | "management");
  nameEl.setAttribute("data-mode-preview", mode);
  const isMobile = !window.matchMedia("(min-width: 56.25rem)").matches;
  // Ferma il pulse sulle card e rimuove il boxShadow residuo
  if (cardPulseTweens.length) {
    cardPulseTweens.forEach((tw) => tw.kill());
    cardPulseTweens.length = 0;
    cards.forEach((c) => gsap.set(c, { clearProps: "boxShadow" }));
  }
  cards.forEach((c) => {
    const goBtn = c.querySelector<HTMLElement>(".mode-card__go");
    if (c === targetCard) {
      c.classList.add("is-selected");
      c.classList.remove("is-passive");
      // Ingrandimento visibile (knolling effect) — prendi lo strumento dal tavolo
      // Stesso comportamento su mobile e desktop, solo la forma cambia (orizzontale vs quadrata)
      gsap.to(c, { scaleX: 1.05, scaleY: 1.18,  duration: 0.4, ease: "back.out(1.8)" });
      if (goBtn) {
        goBtn.setAttribute("tabindex", "0");
        goBtn.removeAttribute("aria-hidden");
        // Aggiunge is-ready subito: rimuove height:0/margin:0 dal CSS touch
        // così GSAP anima da uno stato "visibile nel layout" e non c'è jump.
        goBtn.classList.add("is-ready");
        gsap
          .timeline({ delay: 0.2 })
          .fromTo(
            goBtn,
            { opacity: 0, y: 20, scale: 0.92 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.6,
              ease: "back.out(3)",
            },
          )
          .to(
            goBtn,
            {
              boxShadow: modeGlow[mode] ?? modeGlow.management,
              duration: 0.28,
              ease: "power2.out",
              yoyo: true,
              repeat: 1,
            },
            0.5,
          );
        if (isMobile) {
          goBtn.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "nearest",
          });
        }
      }
    } else {
      c.classList.add("is-passive");
      c.classList.remove("is-selected");
      // Su mobile: scale: 1 (il grid riduce la cella, scale causerebbe overflow)
      gsap.to(c, { scale: isMobile ? 1 : 0.96, duration: 0.25, ease: "power2.out" });
      if (goBtn && goBtn.classList.contains("is-ready")) {
        goBtn.setAttribute("tabindex", "-1");
        goBtn.setAttribute("aria-hidden", "true");
        gsap.to(goBtn, {
          opacity: 0,
          y: 5,
          duration: 0.2,
          ease: "power2.in",
          onComplete: () => goBtn.classList.remove("is-ready"),
        });
      }
    }
  });

  // Mobile: espandi la cella del grid + scan sweep per feedback tattile
  if (isMobile) {
    const idx = Array.from(cards).indexOf(targetCard);
    expandMobileGrid(idx);

    // Scan sweep — linea luminosa che scorre dall'alto al basso sulla card
    const scanEl = document.createElement("div");
    scanEl.className = "mode-card-scan";
    targetCard.appendChild(scanEl);
    const cardH = targetCard.getBoundingClientRect().height;
    gsap.fromTo(
      scanEl,
      { y: 0, opacity: 0.9 },
      {
        y: cardH + 4,
        opacity: 0,
        duration: 0.5,
        ease: "power2.in",
        onComplete: () => scanEl.remove(),
      },
    );
  }

  // Knolling: evidenzia le immagini associate al mode selezionato
  knolls.forEach((knoll) => {
    const modes = knoll.dataset.modes?.split(" ") || [];
    if (modes.includes(mode)) {
      knoll.classList.add("is-hero");
      knoll.classList.remove("is-dim");
      gsap.to(knoll, { scale: 1.15, duration: 0.4, ease: "back.out(1.7)" });
    } else {
      knoll.classList.add("is-dim");
      knoll.classList.remove("is-hero");
      gsap.to(knoll, { scale: 0.85, duration: 0.3, ease: "power2.out" });
    }
  });
}

// ── Per-card: un solo click = seleziona ED effettua lo scroll alla preview ──
cards.forEach((card) => {
  const mode = card.dataset.mode ?? "tech";
  card.addEventListener("click", (e) => {
    // Ripple
    const rect = card.getBoundingClientRect();
    const clickEvent = e as MouseEvent;
    const cx =
      Number.isFinite(clickEvent.clientX) && clickEvent.clientX > 0
        ? clickEvent.clientX
        : rect.left + rect.width / 2;
    const cy =
      Number.isFinite(clickEvent.clientY) && clickEvent.clientY > 0
        ? clickEvent.clientY
        : rect.top + rect.height / 2;
    const ripple = document.createElement("span");
    ripple.className = "ripple";
    ripple.style.left = `${cx - rect.left - 30}px`;
    ripple.style.top = `${cy - rect.top - 30}px`;
    card.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove());

    selectMode(card, mode);
    scrollToProfile(mode);
  });
});

// GO button desktop: click → scrolla alla preview — stopPropagation evita il double-fire con card click
document.querySelectorAll<HTMLElement>(".mode-card__go").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const mode = btn.closest<HTMLElement>(".mode-card")?.dataset.mode ?? "tech";
    scrollToProfile(mode);
  });
});

// ── Profile CTA: click → launchJourney (stessa animazione delle mode-card) ───────────────────────
document.querySelectorAll<HTMLElement>(".profile-cta").forEach((cta) => {
  cta.addEventListener("click", (e) => {
    e.preventDefault();
    const href = cta.getAttribute("href") ?? "/";
    launchJourney(href);
  });
});

// ── Skills Marquee: duplica il contenuto per loop infinito ───────────────────────
document.querySelectorAll<HTMLElement>(".skills-marquee__track").forEach((track) => {
  const content = track.innerHTML;
  track.innerHTML = content + content; // Duplica il contenuto per loop seamless
});

// Bfcache restore (swipe-back mobile): forza ricaricamento pulito + replays GO animation
window.addEventListener("pageshow", (e) => {
  if (e.persisted) window.location.reload();
});


// ── Profile sections — reveal + parallax doppia profondità ────────────────────────
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const isDesktopView = window.matchMedia("(min-width: 56.25rem)").matches;
  // Rotazioni solo desktop (su mobile l'img è bg assoluto, la rotazione disturba)
  if (isDesktopView) {
    gsap.set('.profile-section[data-mode="tech"] .profile-knoll-img', { rotation: -5 });
    gsap.set('.profile-section[data-mode="creative"] .profile-knoll-img', { rotation: 8 });
    gsap.set('.profile-section[data-mode="human"] .profile-knoll-img', { rotation: -4 });
  }

  // Fade-up del contenuto testo al primo enter della sezione
  document.querySelectorAll<HTMLElement>(".profile-content").forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el.closest(".profile-section"),
          start: "top 78%",
          once: true,
        },
      },
    );
  });

  // Luce ambientale — l'alone accent (--ps-glow via ::before) sale mentre
  // la sezione entra: stesso linguaggio della pagina [mode] (cv-init.ts).
  document.querySelectorAll<HTMLElement>(".profile-section").forEach((section) => {
    gsap.fromTo(
      section,
      { "--ambient": 0 },
      {
        "--ambient": 1,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top 85%",
          end: "top 25%",
          scrub: true,
        },
      },
    );
  });

  // Parallax immagini — delta ampio: desktop 160px, mobile 90px
  // L'overflow:hidden della section crea un reveal dai bordi (effetto voluto)
  const profileDelta = isDesktopView ? 300 : 90;
  document.querySelectorAll<HTMLElement>(".profile-knoll-img").forEach((img) => {
    const section = img.closest<HTMLElement>(".profile-section");
    if (!section) return;
    gsap.fromTo(
      img,
      { y: profileDelta },
      {
        y: -profileDelta,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      },
    );
  });
}

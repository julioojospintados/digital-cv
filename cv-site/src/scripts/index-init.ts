import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { setMode } from "../islands/stores/modeStore.ts";
import { isIntroSeen, markIntroSeen } from "./intro-seen.ts";

gsap.registerPlugin(ScrollTrigger);

// ── Reduced motion: GSAP bypassa le regole CSS, occorre controllo JS ────────
// Accelera tutte le timeline a x50 → effetto "immediato" senza rimuovere la
// logica degli stati. I callbacks (onComplete, launchJourney) girano comunque.
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  gsap.globalTimeline.timeScale(50);
}

// ── Preloader: rituale solo alla prima visita di questa sessione ───────────
// Il GO che atterra nel nome, le card e il knolling che appaiono in stagger
// sono un'introduzione, non un caricamento reale — ha senso raccontarla una
// volta, non ogni volta che si torna alla home dal resto del sito (click sul
// logo GO = master reset, cv-site/src/islands/GoLogo.lit.ts, nuovo page
// load). Il preloader stesso, su un ritorno, non arriva nemmeno al primo
// paint: lo script inline in index.astro setta data-intro-seen su <html>
// durante il parse e il CSS lo tiene a display:none — qui gestiamo solo
// la coreografia GSAP.
const introAlreadySeen = isIntroSeen();
markIntroSeen();

// tl.timeScale(60) qui sotto comprime solo i tween GSAP: l'atterraggio degli
// oggetti knolling (.do-enter → @keyframes knollLand, index-page.css) è
// un'animazione CSS pura, invisibile al clock di GSAP — su un ritorno alla
// home restava alla sua durata piena (0.45s + stagger) anche a intro "vista".
// Stessa tecnica del resto del file: comprimere il tempo, non saltarlo.
if (introAlreadySeen) {
  document.documentElement.style.setProperty("--knoll-land-duration", "20ms");
}
const knollDelayStep = introAlreadySeen ? 2 : 45;

// ── DOM refs ─────────────────────────────────────────────
const preloader = document.getElementById("preloader")!;
const header = document.getElementById("entry-header")!;
const nameEl = document.getElementById("entry-name")!;
const cards = document.querySelectorAll<HTMLButtonElement>(".mode-card");
const knolls = document.querySelectorAll<HTMLImageElement>(".knoll-item, .knoll-m");

// ── Badge "ciclo di sistemazione" (Testing → Correggendo → Migliorando) — una volta a sessione ──
// Trigger agganciato alla stessa callback che fa entrare il knolling in
// scena (step 10 della timeline d'ingresso, sotto) — richiesta esplicita
// 2026-07-27: il badge deve comparire nello stesso istante delle immagini
// knolling, non a coreografia già assestata. La finestra di visibilità (8s)
// e l'uscita usano setTimeout, non gsap.delayedCall: sotto
// prefers-reduced-motion il globalTimeline gira a x50 (vedi sopra), il che
// comprimerebbe gli 8s di lettura a ~160ms — la riduzione del movimento non
// deve ridurre anche il tempo per leggere il contenuto.
const WIP_BADGE_SEEN_KEY = "wip-badge-seen";
// Deve restare allineata all'animation-duration di .wip-badge__bar-fill
// (index-page.css) — la barra è la rappresentazione visiva di questo timer.
const WIP_BADGE_VISIBLE_MS = 8000;
// Deve restare allineata alla transition di uscita in index-page.css (1s).
const WIP_BADGE_EXIT_MS = 1000;
// Stesso breakpoint di @media (max-width: 40rem) in index-page.css, dove il
// badge è display:none — su mobile il nome hero occupa quasi tutta la
// larghezza a ridosso del bordo alto e nessun angolo resta libero (vedi
// screenshot utente 2026-07-27). Il check qui, non solo in CSS, evita di
// consumare il flag "visto in questa sessione" su mobile: se la finestra
// viene poi allargata a desktop nella stessa sessione, il badge può ancora
// comparire.
const WIP_BADGE_MOBILE_QUERY = "(max-width: 40rem)";
const wipBadge = document.getElementById("wip-badge");
function showWipBadge() {
  if (!wipBadge) return;
  if (window.matchMedia(WIP_BADGE_MOBILE_QUERY).matches) return;
  try {
    if (sessionStorage.getItem(WIP_BADGE_SEEN_KEY) === "1") return;
    sessionStorage.setItem(WIP_BADGE_SEEN_KEY, "1");
  } catch {
    // Storage bloccato: lo mostriamo comunque, non c'è modo di ricordare la sessione.
  }
  wipBadge.removeAttribute("aria-hidden");
  wipBadge.classList.add("is-visible");
  setTimeout(() => {
    wipBadge.classList.remove("is-visible");
    setTimeout(() => wipBadge.setAttribute("aria-hidden", "true"), WIP_BADGE_EXIT_MS);
  }, WIP_BADGE_VISIBLE_MS);
}

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

  // Click sull'oggetto knolling = solo "giochino" (attiva la card, come un
  // hover fisico) — mai scrollToProfile: quello resta un'azione esplicita
  // sulla card stessa. selectMode è hoisted (function declaration), quindi
  // richiamabile qui anche se definita più sotto nel file.
  if (img.src.includes("flashlight")) {
    // Flashlight desktop: solo 1rem dal centro è cliccabile
    img.addEventListener("click", (e) => {
      if (_distFromCenter(img.getBoundingClientRect(), e.clientX, e.clientY) <= _1rem()) {
        selectMode(targetCard, primaryMode);
      }
    });
  } else {
    img.addEventListener("click", () => selectMode(targetCard, primaryMode));
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
        selectMode(targetCard, primaryMode);
      }
    });
  } else {
    wrap.addEventListener("click", () => selectMode(targetCard, primaryMode));
  }
});

let selectedMode: string | null = null;
// Tweens del pulse sulle card — salvati per poterli killare alla selezione
const cardPulseTweens: gsap.core.Tween[] = [];

// ── Mobile grid expansion — stato modulo ─────────────────────────────────
// Quando l'utente seleziona una card su touch, il grid si espande (60/40)
// invece di usare scale() che causa overflow interno nella cella.
const modeCardsEl = document.getElementById("mode-cards") as HTMLElement;
let _gridLocked = false; // true dopo la prima selezione (fr → px bloccati)
let _lockedH = 0; // altezza totale del container (meno il gap)
let _lockedW = 0; // larghezza totale del container (meno il gap)

/**
 * Converti la griglia da fr a px (no-op visivo), poi anima la distribuzione
 * in modo che la cella selezionata ottenga il 60% dello spazio disponibile.
 * Chiamate successive tweenano direttamente px→px senza reset.
 * Ordine auto-placement: creative(0)=r0c0, tech(1)=r0c1, human(2)=r1c0
 */
function expandMobileGrid(cardIndex: number) {
  const EXPAND = 0.6;
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
gsap.set(["#entry-label", "#entry-tagline", "#entry-cred", "#lang-switch"], { opacity: 0, y: 10 });

// ── Preloader refs ────────────────────────────────────────────────────────
const preGEl = document.getElementById("pre-G")!;
const preOEl = document.getElementById("pre-O")!;

// La barra CSS impiega 0.2s (delay) + 0.7s (fill) = 0.9s. Partiamo a 0.9s.
// Su un ritorno alla home (intro già vista in questa sessione) non aspettiamo:
// il delayedCall parte al frame successivo e il preloader è già display:none
// dal primo paint (script inline + html[data-intro-seen] in index-page.css) —
// gli step 1-2 della timeline animano un elemento nascosto, innocuo, e il
// resto della coreografia (nome, card, knolling) si risolve in ~10 frame.
gsap.delayedCall(introAlreadySeen ? 0 : 0.9, () => {
  const tl = gsap.timeline();
  // Ritorno alla home in questa sessione: NON saltiamo la timeline con un
  // progress(1) secco (seek sincrono che tocca in un colpo solo ogni
  // tl.call/getComputedStyle/DOM sort — rischioso e già causa di un bug
  // reale su return visit: il preloader restava bloccato a schermo). Stessa
  // tecnica già in produzione per prefers-reduced-motion qui sopra:
  // comprimere il tempo, non saltarlo — ogni step passa comunque dal
  // normale ciclo di render di GSAP, solo in ~10 frame invece di ~150.
  if (introAlreadySeen) tl.timeScale(60);

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
      textShadow: "0 0 28px rgba(255,255,255,0.65), 0 0 12px rgba(255,255,255,0.4)",
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

  // 6. "iulio" e "cchipinti" — stagger accorciato (30ms, pavimento della
  // regola Emil Kowalski in design-system/SKILL.md) per liberare prima le
  // card mode: la scia resta leggibile, solo più compatta.
  tl.to(
    otherChars,
    {
      opacity: 1,
      y: 0,
      duration: 0.45,
      stagger: { each: 0.03, from: "start" },
      ease: "power3.out",
    },
    "-=0.35",
  );

  // 7. Tag G e O per il glow mode-reactive (hover sulle card)
  tl.call(() => {
    if (firstGChar) firstGChar.classList.add("name-go-g");
    if (firstOChar) firstOChar.classList.add("name-go-o");
  });

  // 8. "Digital CV" + tagline + lang-switch — sovrapposti alla coda del nome
  // invece che in sequenza: riduce il tempo prima che le card diventino
  // interagibili senza tagliare nessun beat del rituale (richiesta 2026-07-28,
  // feedback Bojan su performance/bounce risk del preloader).
  tl.to(
    ["#entry-label", "#entry-tagline", "#entry-cred", "#lang-switch"],
    {
      opacity: 1,
      y: 0,
      duration: 0.35,
      stagger: 0,
      ease: "power3.out",
    },
    "-=0.25",
  );

  // 9. Mode cards — ordine spaziale TL→BR (ordine DOM = creative→tech→human)
  // Segue la diagonale naturale di lettura: l'occhio è guidato senza sorprese.
  // Partono mentre tagline/label stanno ancora completandosi (overlap, non
  // sequenza) — stesso motivo dello step 8: prima interazione possibile prima.
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
    "-=0.2",
  );

  // 9b. Scroll cue — arriva subito dopo le card, come ultimo tocco della
  // composizione (solo opacity: il transform di .entry-scroll-cue è già
  // occupato dal translateX(-50%) di centratura, in index-page.css).
  const entryScrollCue = document.querySelector<HTMLElement>(".entry-scroll-cue");
  if (entryScrollCue) {
    tl.to(entryScrollCue, { opacity: 1, duration: 0.35, ease: "power2.out" }, "-=0.1");
    // Sparisce al primo scroll, non ha senso oltre quel punto (richiesta
    // esplicita 2026-07-29). Registrato con .call() dopo il reveal, non da
    // subito: uno scroll durante l'entrata delle card consumerebbe il
    // listener {once:true} prima ancora che la cue sia comparsa.
    tl.call(() => {
      window.addEventListener(
        "scroll",
        () => gsap.to(entryScrollCue, { opacity: 0, duration: 0.3, ease: "power2.out" }),
        { once: true, passive: true },
      );
    });
  }

  // 10. Knolling — ordine spaziale: sort per posizione Y (peso 0.7) + X (peso 0.3)
  // Crea un'onda diagonale TL→BR: prima le immagini in alto, poi quelle in basso.
  // offsetTop/offsetLeft invece di getBoundingClientRect → immune ai GSAP transform.
  // Inizia 0.25s dopo l'inizio delle card (overlap parziale: le ultime card escono
  // mentre le prime immagini entrano — composizione knolling che si assembla).
  tl.call(
    () => {
      const sortedKnolls = Array.from(knolls).sort((a, b) => {
        const scoreA = a.offsetTop * 0.7 + a.offsetLeft * 0.3;
        const scoreB = b.offsetTop * 0.7 + b.offsetLeft * 0.3;
        return scoreA - scoreB;
      });
      sortedKnolls.forEach((knoll, i) => {
        knoll.style.setProperty("--knoll-delay", `${i * knollDelayStep}ms`);
        knoll.classList.add("do-enter");
      });
      // Badge "ciclo di sistemazione" nella stessa callback, non in un tl.call
      // separato più avanti nella timeline — richiesta esplicita 2026-07-27:
      // deve comparire nello stesso istante in cui il knolling entra in scena,
      // non a coreografia già assestata. Il timer di visibilità (8s) resta
      // reale (setTimeout dentro showWipBadge), non legato al clock GSAP.
      showWipBadge();
      // ConsentBanner (PostHog) ascolta questo evento per comparire
      // con lo stesso tempismo della card "ultime modifiche" — richiesta
      // esplicita 2026-07-28. Sparato qui, non dentro showWipBadge(): quella
      // funzione può fare early-return su mobile o se il badge è già stato
      // visto in questa sessione, ma il banner deve comparire comunque, con
      // lo stesso beat della timeline, a prescindere da quei guard.
      window.dispatchEvent(new CustomEvent("cv:wip-badge-shown"));
    },
    undefined,
    "-=0.55",
  );

  // 10b. Pulse attenzione sulle card — bordo che pulsa ogni 1.5s in loop
  // per comunicare interattività persistente. Si ferma quando una card viene selezionata.
  // Inizia 0.6s dopo che le card sono apparse (durata entrata = 0.8s + stagger 0.36s ≈ 1.16s totale).
  tl.call(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      // up (0.32s) + down (0.32s) = 0.64s — repeatDelay = 1.5 - 0.64 = 0.86s → ciclo totale 1.5s
      cards.forEach((card, i) => {
        const style = getComputedStyle(card);
        const goColor = style.getPropertyValue("--card-go-color").trim() || "rgba(255,255,255,1)";
        const goShadow =
          style.getPropertyValue("--card-go-shadow").trim() || "rgba(255,255,255,0.12)";
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
    },
    undefined,
    "+=0.6",
  );

  // Il nudge orizzontale della freccia .profile-cta__arrow è CSS puro
  // (@keyframes cta-arrow-nudge in index-page.css) — un tween GSAP infinito
  // scriverebbe uno style inline che vince sempre su :hover/:focus-visible,
  // rendendo l'hover incoerente. Animazione predeterminata → CSS, non GSAP.
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
        ? (card.parentElement?.contains(relatedTarget) ?? false)
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

  const isTouchDevice = !window.matchMedia("(hover: hover) and (pointer: fine)").matches;

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
  journey.to(lineEls, { opacity: 0.85, duration: phase2Duration, ease: "none" }, "-=0");
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

  // Vignette scura chiude la scena — l'overlay è full-viewport e opaco
  // (#launch-overlay, background pieno), quindi copre qualunque contenuto sia
  // a schermo indipendentemente dallo scroll. La sua durata deve però finire
  // esattamente quando scatta la navigazione: prima andava a 1 in 0.5s fissi,
  // mentre navigateAt arriva dopo solo 0.28s (touch) / 0.4s (desktop) da
  // vignetteStart — l'overlay era ancora semi-trasparente alla navigazione,
  // lasciando intravedere il contenuto sotto (es. la card portfolio in una
  // profile-section scrollata, mai toccata dal fade di header/cards sopra).
  journey.to(
    overlay,
    { opacity: 1, duration: navigateAt - vignetteStart, ease: "power2.inOut" },
    vignetteStart,
  );

  // Naviga quando la vignette è ormai completamente opaca
  journey.call(
    () => {
      window.location.href = href;
    },
    undefined,
    navigateAt,
  );
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

function scrollToElement(target: HTMLElement) {
  const absoluteTop = getOffsetTop(target);
  const lenis = window.__lenis;
  if (lenis && typeof lenis.scrollTo === "function") {
    lenis.scrollTo(absoluteTop, { duration: 0.8 });
  } else {
    window.scrollTo({ top: absoluteTop, behavior: "smooth" });
  }
}

function scrollToProfile(mode: string) {
  const target = document.querySelector<HTMLElement>(`.profile-section[data-mode="${mode}"]`);
  if (!target) {
    window.location.href = `/${mode}`;
    return;
  }
  scrollToElement(target);
}

// ── Seleziona mode: aggiorna card UI, knolling, modeStore ───────────────
function selectMode(targetCard: HTMLButtonElement, mode: string) {
  selectedMode = mode;
  setMode(mode as "tech" | "creative" | "human");
  nameEl.setAttribute("data-mode-preview", mode);
  const isMobile = !window.matchMedia("(min-width: 56.25rem)").matches;
  // Ferma il pulse sulle card e rimuove il boxShadow residuo
  if (cardPulseTweens.length) {
    cardPulseTweens.forEach((tw) => tw.kill());
    cardPulseTweens.length = 0;
    cards.forEach((c) => gsap.set(c, { clearProps: "boxShadow" }));
  }
  cards.forEach((c) => {
    if (c === targetCard) {
      c.classList.add("is-selected");
      c.classList.remove("is-passive");
      // Ingrandimento visibile (knolling effect) — prendi lo strumento dal tavolo
      // Stesso comportamento su mobile e desktop, solo la forma cambia (orizzontale vs quadrata)
      gsap.to(c, { scaleX: 1.05, scaleY: 1.18, duration: 0.4, ease: "back.out(1.8)" });
    } else {
      c.classList.add("is-passive");
      c.classList.remove("is-selected");
      // Su mobile: scale: 1 (il grid riduce la cella, scale causerebbe overflow)
      gsap.to(c, { scale: isMobile ? 1 : 0.96, duration: 0.25, ease: "power2.out" });
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

// ── Profile CTA: click → launchJourney (stessa animazione delle mode-card) ───────────────────────
document.querySelectorAll<HTMLElement>(".profile-cta").forEach((cta) => {
  cta.addEventListener("click", (e) => {
    e.preventDefault();
    const href = cta.getAttribute("href") ?? "/";
    launchJourney(href);
  });
});

// ── View transition solo verso /work ────────────────────────────────────
// view-transition-name assegnato via JS al click, non in CSS: la stessa
// card vive anche su [mode].astro/en/cv.astro, quindi un nome statico
// farebbe scattare il morph nativo anche sul cambio mode via launchJourney
// qui sopra (destinazione /tech /creative ecc., mai /work) — un morph tra
// due istanze scorrelate della card, mai richiesto, che si sovrapponeva
// senza coordinamento alla vignette/speed-line di launchJourney. Assegnarlo
// solo qui, al click sulla card stessa, lo mantiene attivo solo quando la
// destinazione è davvero /work (vedi global.css per il resto).
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.querySelectorAll<HTMLAnchorElement>(".hero-portfolio-card").forEach((card) => {
    card.addEventListener("click", () => {
      card.style.viewTransitionName = "portfolio-hero";
    });
  });
}

// ── Dot "Chi sono": stesso jump smooth via Lenis degli altri dot, ma senza
// data-mode/stato attivo (non è un mode, non entra nel loop sotto). Serve
// esplicitamente da quando html non ha più scroll-behavior:smooth (todo #48):
// senza questo handler il salto nativo dell'anchor sarebbe tornato istantaneo.
document.querySelectorAll<HTMLAnchorElement>(".section-dot:not([data-mode])").forEach((dot) => {
  dot.addEventListener("click", (e) => {
    e.preventDefault();
    const id = dot.getAttribute("href")?.slice(1);
    const target = id ? document.getElementById(id) : null;
    if (target) scrollToElement(target);
  });
});

// ── Dot-nav profili: jump diretto (click) + stato attivo (ScrollTrigger) ──
document.querySelectorAll<HTMLAnchorElement>(".section-dot[data-mode]").forEach((dot) => {
  const mode = dot.dataset.mode;
  if (!mode) return;

  dot.addEventListener("click", (e) => {
    e.preventDefault();
    scrollToProfile(mode);
  });

  const section = document.querySelector<HTMLElement>(`.profile-section[data-mode="${mode}"]`);
  if (!section) return;
  ScrollTrigger.create({
    trigger: section,
    start: "top center",
    end: "bottom center",
    onToggle: (self) => dot.classList.toggle("is-active", self.isActive),
  });
});

// ── Skills Marquee: duplica il contenuto per loop infinito ───────────────────────
document.querySelectorAll<HTMLElement>(".skills-marquee__track").forEach((track) => {
  const content = track.innerHTML;
  track.innerHTML = content + content; // Duplica il contenuto per loop seamless

  // Il CSS anima verso var(--marquee-shift), non verso -50%: con `gap` la
  // larghezza raddoppiata è 2×(un set) + UN gap di raccordo, quindi 50% della
  // larghezza totale non coincide con la fine del primo set — lo scroll
  // "saltava" di mezzo gap ad ogni loop. Calcoliamo qui il valore esatto dopo
  // che il layout del contenuto duplicato si è assestato.
  requestAnimationFrame(() => {
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const shift = (track.scrollWidth + gap) / 2;
    track.style.setProperty("--marquee-shift", `-${shift}px`);
  });
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

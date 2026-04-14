import { gsap } from "gsap";
import { setMode } from "../islands/stores/modeStore.ts";

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

let selectedMode: string | null = null;

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
gsap.set(["#entry-label", "#entry-tagline"], { opacity: 0, y: 10 });

// ── Preloader refs ────────────────────────────────────────────────────────
const preGEl = document.getElementById("pre-G")!;
const preOEl = document.getElementById("pre-O")!;

// La barra CSS impiega 0.2s (delay) + 1.0s (fill) = 1.2s. Partiamo a 1.25s.
gsap.delayedCall(1.25, () => {
  const tl = gsap.timeline();

  // 1. Glow flash sulle lettere del preloader — identità rivelata
  tl.to([preGEl, preOEl], {
    textShadow: "0 0 40px rgba(255,255,255,0.75)",
    duration: 0.2,
    stagger: 0.08,
    ease: "power2.out",
  });
  tl.to([preGEl, preOEl], {
    textShadow: "0 0 0px transparent",
    duration: 0.15,
    ease: "power2.in",
  });

  // 2. Preloader sfuma — G e O si "trasformano" nel nome
  tl.to(preloader, {
    opacity: 0,
    duration: 0.45,
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
      duration: 0.55,
      stagger: 0.18,
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
      duration: 0.3,
      ease: "power2.out",
    },
    "-=0.1",
  );
  tl.to(goChars, {
    textShadow: "0 0 0px transparent",
    duration: 0.65,
    ease: "power2.in",
  });

  // 6. "iulio" e "cchipinti" — stagger identico cv.astro hero
  tl.to(
    otherChars,
    {
      opacity: 1,
      y: 0,
      duration: 0.55,
      stagger: { each: 0.05, from: "start" },
      ease: "power3.out",
    },
    "-=0.55",
  );

  // 7. Tag G e O per il glow mode-reactive (hover sulle card)
  tl.call(() => {
    if (firstGChar) firstGChar.classList.add("name-go-g");
    if (firstOChar) firstOChar.classList.add("name-go-o");
  });

  // 8. Label + tagline
  tl.to(
    ["#entry-label", "#entry-tagline"],
    {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger: 0.1,
      ease: "power3.out",
    },
    "-=0.3",
  );

  // 9. Mode cards (GO concept — entrano dal basso)
  tl.fromTo(
    Array.from(cards),
    { y: 30, opacity: 0, scale: 0.94 },
    {
      y: 0,
      opacity: 1,
      scale: 1,
      duration: 0.65,
      stagger: 0.08,
      ease: "back.out(1.4)",
    },
    "-=0.2",
  );

  // 10. Oggetti knolling atterrano sul tavolo
  tl.call(() => {
    knolls.forEach((knoll, i) => {
      knoll.style.setProperty("--knoll-delay", `${i * 65}ms`);
      knoll.classList.add("do-enter");
    });
  });
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
      background: "rgba(255,255,255,0.12)",
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
      window.location.href = href;
    },
  });

  const isTouchDevice = !window.matchMedia("(hover: hover) and (pointer: fine)")
    .matches;

  // Speed lines sparano verso l'esterno (warp speed)
  // Su touch: durate più lunghe per percepire l'animazione
  const phase1Duration = isTouchDevice ? 0.9 : 0.6;
  const phase1Stagger = isTouchDevice ? 0.028 : 0.018;
  const phase2Duration = isTouchDevice ? 0.7 : 0.5;
  const phase3Duration = isTouchDevice ? 0.55 : 0.35;
  const phase3Stagger = isTouchDevice ? 0.016 : 0.009;
  const blurStart = isTouchDevice ? 0.75 : 0.5;
  const vignetteStart = isTouchDevice ? 1.3 : 0.9;

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
  const isMobile = !window.matchMedia("(min-width: 900px)").matches;
  cards.forEach((c) => {
    const goBtn = c.querySelector<HTMLElement>(".mode-card__go");
    if (c === targetCard) {
      c.classList.add("is-selected");
      c.classList.remove("is-passive");
      gsap.to(c, { scale: isMobile ? 1.06 : 1.04, duration: 0.3, ease: "back.out(2)" });
      if (goBtn) {
        goBtn.setAttribute("tabindex", "0");
        goBtn.removeAttribute("aria-hidden");
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
              onStart: () => goBtn.classList.add("is-ready"),
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
      gsap.to(c, { scale: isMobile ? 0.94 : 0.96, duration: 0.25, ease: "power2.out" });
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
  knolls.forEach((img) => {
    const modes = img.dataset.modes?.split(" ") ?? [];
    const isRelated = modes.includes(mode);
    img.classList.remove("do-enter");
    img.classList.toggle("is-hero", isRelated);
    img.classList.toggle("is-dim", !isRelated);
    gsap.to(img, {
      opacity: isRelated ? 0.8 : 0.18,
      duration: 0.5,
      ease: "power2.out",
    });
  });
}

// ── Per-card: tap/click = selezione, GO button = navigazione ───────────────
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
  });
});

// GO button desktop: click → naviga — stopPropagation evita il double-fire con card click
document.querySelectorAll<HTMLElement>(".mode-card__go").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const href = btn.dataset.href ?? "/cv";
    launchJourney(href);
  });
});

// Bfcache restore (swipe-back mobile): forza ricaricamento pulito + replays GO animation
window.addEventListener("pageshow", (e) => {
  if (e.persisted) window.location.reload();
});

// ── Scroll cue: scompare al primo evento scroll/wheel/touch ───────────────
const scrollCue = document.querySelector<HTMLElement>(".scroll-cue");
if (scrollCue) {
  const hideScrollCue = () => {
    scrollCue.classList.add("is-hidden");
    window.removeEventListener("scroll", hideScrollCue, {
      passive: true,
    } as EventListenerOptions);
    window.removeEventListener("wheel", hideScrollCue, {
      passive: true,
    } as EventListenerOptions);
    window.removeEventListener("touchmove", hideScrollCue, {
      passive: true,
    } as EventListenerOptions);
  };
  window.addEventListener("scroll", hideScrollCue, { passive: true });
  window.addEventListener("wheel", hideScrollCue, { passive: true });
  window.addEventListener("touchmove", hideScrollCue, { passive: true });
}

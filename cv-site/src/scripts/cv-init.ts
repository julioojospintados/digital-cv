import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { modeStore, setMode } from "../islands/stores/modeStore.ts";
import "../islands/GoLogo.lit.ts";

gsap.registerPlugin(ScrollTrigger);

// ── Mode route constants — usati per URL-init e nav-navigation ──────────────
const CV_MODES = ["tech", "creative", "human", "management"] as const;
type CVMode = (typeof CV_MODES)[number];

// ── Hero entrance — G and O first, then the rest ──────────────────────
const heroEl = document.querySelector<HTMLElement>(".hero-section")!;
const allChars = document.querySelectorAll<HTMLElement>(".hero-char");
const goChars = document.querySelectorAll<HTMLElement>(".hero-char--go");
const restChars = [...allChars].filter(
  (el) => !el.classList.contains("hero-char--go"),
);
const heroTitle = heroEl.querySelector<HTMLElement>(".hero-title");
const heroSummary = heroEl.querySelector<HTMLElement>(".hero-summary");
const heroFooter = heroEl.querySelector<HTMLElement>(".hero-footer");

// Initial states are set in CSS (.hero-section, .hero-char, .hero-title, etc.)
// GSAP only needs to animate: opacity → 1, y → 0

const heroTl = gsap.timeline({ delay: 0 });

// 1. Hero section surfaces
heroTl.to(heroEl, { opacity: 1, duration: 0.4, ease: "power2.out" });

// 2. G and O arrivano per primi — punch + scala (come volano verso il nome nel preloader)
heroTl.fromTo(
  goChars,
  { opacity: 0, scale: 1.5, y: -12 },
  {
    opacity: 1,
    scale: 1,
    y: 0,
    duration: 0.55,
    stagger: 0.18,
    ease: "back.out(1.7)",
  },
  "+=0.05",
);

// 3. Glow pulse accent su G e O
heroTl.to(
  goChars,
  {
    textShadow: "0 0 28px var(--color-accent), 0 0 10px var(--color-accent)",
    duration: 0.3,
    ease: "power2.out",
  },
  "-=0.15",
);
heroTl.to(goChars, {
  textShadow: "0 0 0px transparent",
  duration: 0.7,
  ease: "power2.in",
});

// 4. Le altre lettere scorrono in sequenza — stagger simile alle speed lines
heroTl.to(
  restChars,
  {
    opacity: 1,
    y: 0,
    duration: 0.55,
    stagger: { each: 0.05, from: "start" },
    ease: "power3.out",
  },
  "-=0.5",
);

// 5. Resto della sezione hero (titolo, summary, footer)
heroTl.to(
  [heroTitle, heroSummary, heroFooter],
  {
    opacity: 1,
    y: 0,
    duration: 0.55,
    stagger: 0.09,
    ease: "power2.out",
  },
  "-=0.25",
);

// ── Scroll progress bar ───────────────────────────────────────────────
const progressBar = document.createElement("div");
progressBar.className = "scroll-progress";
document.body.prepend(progressBar);

ScrollTrigger.create({
  start: 0,
  end: "max",
  invalidateOnRefresh: true,
  onUpdate: ({ progress }) => {
    progressBar.style.width = `${progress * 100}%`;
  },
});

// ── Apply mode: aggiorna data-state su tutte le card ────────────────
// CSS transitions già definite su ogni card (opacity, border-color, transform).
// Rimosso GSAP Flip: catturare computed styles di ogni card è CPU-intensivo
// quando il layout non cambia — solo gli stati visivi. CSS gestisce da solo.
function applyMode(mode: string) {
  document
    .querySelectorAll<HTMLElement>(".cv-card[data-tags]")
    .forEach((card) => {
      const tags = card.dataset.tags?.split(" ") ?? [];
      card.dataset.state = tags.includes(mode) ? "active" : "passive";
    });
  updateNavButtons(mode);
  // Refresh ScrollTrigger dopo CSS transition (~300ms) — usato per in-page
  // switching (es. /en/cv). Su route IT il nav naviga, quindi non serve qui.
  setTimeout(() => ScrollTrigger.refresh(), 320);
}

// ── Apply accordions: apre/chiude i cluster di esperienza ────────────
// Mappa mode → quali cluster devono essere aperti (coerente con EXP_CLUSTER_DEFS in [mode].astro)
const CLUSTER_OPEN_FOR: Record<string, string[]> = {
  tech: ["tech"],
  creative: ["creative", "roots"],
  human: ["human", "roots"],
  management: ["tech", "human"],
};

function applyAccordions(mode: string) {
  const shouldOpen = new Set(CLUSTER_OPEN_FOR[mode] ?? ["tech"]);
  document.querySelectorAll<HTMLElement>(".exp-cluster").forEach((cluster) => {
    const key = cluster.dataset.cluster ?? "";
    const header = cluster.querySelector<HTMLElement>(".exp-cluster__header");
    if (shouldOpen.has(key)) {
      cluster.setAttribute("data-open", "");
      header?.setAttribute("aria-expanded", "true");
    } else {
      cluster.removeAttribute("data-open");
      header?.setAttribute("aria-expanded", "false");
    }
  });
}

// ── Skills view toggle: graph default, cards optional ─────────────
const skillsSection = document.querySelector<HTMLElement>(".skills-section");
const skillsViewButtons = document.querySelectorAll<HTMLElement>(
  "[data-skills-view-button]",
);

function applySkillsView(view: "graph" | "cards") {
  if (!skillsSection) return;

  skillsSection.dataset.skillsView = view;

  skillsViewButtons.forEach((button) => {
    const isActive = button.dataset.skillsViewButton === view;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

skillsViewButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const view = button.dataset.skillsViewButton as
      | "graph"
      | "cards"
      | undefined;
    if (!view) return;
    applySkillsView(view);
  });
});

applySkillsView("graph");

// ── Update nav buttons: morph larghezza + crossfade testo ───────────
// Larghezze FISSE anche su desktop: evitano jitter e tengono le 4 voci allineate.
// CSS transition rimossa dal .mode-btn: GSAP controlla tutto.
// killTweensOf previene ghosting su click rapido.
const INACTIVE_W = "2.2rem";
const DESKTOP_W = "7.75rem";
// Su schermi <= 374px comprimiamo la label del bottone attivo
function getActiveW(): string {
  return window.innerWidth <= 374 ? "5.5rem" : "7.5rem";
}
let navInitialized = false;

function updateNavButtons(mode: string) {
  const isDesktop = window.matchMedia("(min-width: 641px)").matches;

  document.querySelectorAll<HTMLElement>("[data-nav-mode]").forEach((btn) => {
    const isActive = btn.dataset.navMode === mode;
    const abbr = btn.querySelector<HTMLElement>(".mode-btn__abbr")!;
    const label = btn.querySelector<HTMLElement>(".mode-btn__label")!;

    gsap.killTweensOf([btn, abbr, label]);

    // Colore/bordo: cambio immediato via classe — zero ritardo, zero desincronizzazione
    btn.classList.toggle("is-active", isActive);
    btn.setAttribute("aria-pressed", String(isActive));

    if (isDesktop) {
      // Desktop: label visibile, abbr nascosta, width uniforme per tutte le voci.
      gsap.set(btn, { width: DESKTOP_W });
      gsap.set(abbr, { clearProps: "opacity" });
      gsap.set(label, { clearProps: "opacity" });
      return;
    }

    // ── Mobile: morph abbreviazione ↔ label completa ───────────────
    if (!navInitialized) {
      gsap.set(btn, { width: isActive ? getActiveW() : INACTIVE_W });
      gsap.set(abbr, { opacity: isActive ? 0 : 1 });
      gsap.set(label, { opacity: isActive ? 1 : 0 });
      return;
    }

    if (isActive) {
      gsap.to(btn, {
        width: getActiveW(),
        duration: 0.36,
        ease: "power3.inOut",
      });
      gsap.to(abbr, { opacity: 0, duration: 0.1, ease: "power2.in" });
      gsap.to(label, {
        opacity: 1,
        duration: 0.22,
        delay: 0.14,
        ease: "power2.out",
      });
      // Nessun punch qui — il feedback fisico è solo sul secondo tap (scroll confirm)
    } else {
      gsap.to(label, { opacity: 0, duration: 0.1, ease: "power2.in" });
      gsap.to(btn, {
        width: INACTIVE_W,
        duration: 0.36,
        delay: 0.06,
        ease: "power3.inOut",
      });
      gsap.to(abbr, {
        opacity: 1,
        duration: 0.22,
        delay: 0.22,
        ease: "power2.out",
      });
    }
  });
  navInitialized = true;
}

// ── Nav button clicks + magnetic ─────────────────────────────────────
document
  .querySelectorAll<HTMLButtonElement>("[data-nav-mode]")
  .forEach((btn) => {
    btn.addEventListener("click", () => {
      const mode = btn.dataset.navMode as
        | "tech"
        | "creative"
        | "human"
        | "management";
      if (!mode) return;

      const isMobile = !window.matchMedia("(min-width: 641px)").matches;
      const isAlreadyActive = btn.classList.contains("is-active");

      // Mobile: primo tap = attiva il mode; secondo tap = scroll al contenuto
      if (isMobile && isAlreadyActive) {
        gsap.fromTo(
          btn,
          { scale: 0.88 },
          { scale: 1, duration: 0.5, ease: "elastic.out(2, 0.4)" },
        );
        document
          .querySelector<HTMLElement>(".skills-section")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }

      setMode(mode);
      // In-page update: colori + accordion + scroll alla sezione rilevante.
      // Rimossa navigazione window.location.href che causava un full reload.
      const currentSegment = window.location.pathname.split("/").filter(Boolean)[0];
      if ((CV_MODES as readonly string[]).includes(currentSegment)) {
        applyMode(mode);
        applyAccordions(mode);

        // ── Animazione 2+3: Mode stamp fullscreen → Scan laser reveal ────
        //
        // Fase 1 (0ms): il nome del mode appare a caratteri enormi (fullscreen stamp)
        //   con clip-path che si apre dal centro — effetto editorial magazine.
        // Fase 2 (300ms): lo stamp esplode verso l'esterno e svanisce.
        //   Contemporaneamente applyMode/applyAccordions.
        // Fase 3 (450ms): laser accent scorre dall'alto verso il basso della pagina,
        //   ogni card che tocca "si accende" nel suo nuovo stato (glow flash).
        // Fase 4 (650ms layout stabile): scroll Lenis al cluster target.
        // Fase 5 (dopo scroll): spotlight glow sul target, poi spegni.

        const primaryClusterKey = (CLUSTER_OPEN_FOR[mode] ?? ["tech"])[0];
        const scanTarget = document.querySelector<HTMLElement>(
          `.exp-cluster[data-cluster="${primaryClusterKey}"]`,
        );
        const allClusters = document.querySelectorAll<HTMLElement>(".exp-cluster");

        // ── Crea stamp fullscreen ──────────────────────────────────────────
        const stamp = document.createElement("div");
        stamp.textContent = mode.toUpperCase();
        Object.assign(stamp.style, {
          position: "fixed",
          inset: "0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "clamp(4rem, 22vw, 18rem)",
          fontFamily: "Lexend, sans-serif",
          fontWeight: "800",
          letterSpacing: "-0.04em",
          color: "var(--color-accent)",
          opacity: "0",
          zIndex: "9998",
          pointerEvents: "none",
          clipPath: "inset(50% 50% 50% 50%)",
          userSelect: "none",
        });
        document.body.appendChild(stamp);

        // ── Timeline principale ────────────────────────────────────────────
        const tl = gsap.timeline();

        // Fase 1 — stamp appare: clip-path si apre dal centro
        tl.to(stamp, {
          opacity: 0.1,
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 0.28,
          ease: "expo.out",
        });

        // Fase 2 — stamp esplode fuori schermo (scale + opacity 0)
        tl.to(stamp, {
          scale: 1.6,
          opacity: 0,
          duration: 0.38,
          ease: "expo.in",
          onComplete: () => {
            stamp.remove();
            // Aggiorna accordion durante l'esplosione (invisibile all'utente)
          },
        });

        // ── Fase 3: laser scan (parte a ~450ms, dopo lo stamp) ────────────
        setTimeout(() => {
          const scanner = document.createElement("div");
          Object.assign(scanner.style, {
            position: "fixed",
            left: "0",
            right: "0",
            height: "2px",
            background: "var(--color-accent)",
            zIndex: "9999",
            boxShadow: "0 0 22px 8px var(--color-accent)",
            top: "0",
            pointerEvents: "none",
          });
          document.body.appendChild(scanner);

          const pageHeight = document.documentElement.scrollHeight;

          gsap.fromTo(
            scanner,
            { top: 0 },
            {
              top: pageHeight,
              duration: 0.85,
              ease: "none",
              onUpdate() {
                const scanY = parseFloat(scanner.style.top);
                // Flash accent su ogni card che il laser attraversa
                document.querySelectorAll<HTMLElement>(".cv-card").forEach((card) => {
                  const rect = card.getBoundingClientRect();
                  const cardAbsTop = rect.top + window.scrollY;
                  if (
                    cardAbsTop <= scanY &&
                    cardAbsTop >= scanY - 60 &&
                    !card.dataset.scanned
                  ) {
                    card.dataset.scanned = "1";
                    gsap.fromTo(
                      card,
                      { filter: "brightness(2.2)" },
                      { filter: "brightness(1)", duration: 0.4, ease: "power2.out" },
                    );
                  }
                });
              },
              onComplete() {
                scanner.remove();
                // Pulisci flag
                document.querySelectorAll<HTMLElement>(".cv-card[data-scanned]").forEach((c) => {
                  delete c.dataset.scanned;
                });
              },
            },
          );
        }, 450);

        // ── Fase 4+5: scroll + spotlight (layout stabile a 650ms) ─────────
        if (scanTarget) {
          setTimeout(() => {
            const lenis = (window as any).__lenis;
            const NAV_HEIGHT = 72;
            const absoluteTop =
              scanTarget.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT;

            // Spotlight: dim gli altri, glow sul target
            gsap.to(allClusters, { opacity: 0.2, duration: 0.25 });
            gsap.to(scanTarget, {
              opacity: 1,
              boxShadow:
                "0 0 0 2px var(--color-accent), 0 0 28px color-mix(in srgb, var(--color-accent) 35%, transparent)",
              duration: 0.25,
            });

            if (lenis) {
              lenis.scrollTo(absoluteTop, { duration: 1.1 });
            } else {
              window.scrollTo({ top: absoluteTop, behavior: "smooth" });
            }

            // Fase 5 — spegni spotlight dopo l'arrivo
            setTimeout(() => {
              gsap.to(allClusters, { opacity: 1, duration: 0.5, ease: "power2.out" });
              gsap.to(scanTarget, { boxShadow: "none", duration: 0.5 });
            }, 1000);
          }, 650);
        }
      } else {
        applyMode(mode);
      }
    });

    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const dx = ((e.clientX - rect.left - rect.width / 2) / rect.width) * 6;
      const dy = ((e.clientY - rect.top - rect.height / 2) / rect.height) * 6;
      gsap.to(btn, { x: dx, y: dy, duration: 0.3, ease: "power2.out" });
    });

    btn.addEventListener("mouseleave", () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.4)" });
    });
  });

// ── Magnetic hover on GO logo + lang switcher ────────────────────────
(
  [
    document.querySelector<HTMLElement>("go-logo"),
    document.querySelector<HTMLElement>(".cv-nav__lang"),
  ] as (HTMLElement | null)[]
).forEach((el) => {
  if (!el) return;
  el.addEventListener("mousemove", (e) => {
    const rect = el.getBoundingClientRect();
    const dx = ((e.clientX - rect.left - rect.width / 2) / rect.width) * 6;
    const dy = ((e.clientY - rect.top - rect.height / 2) / rect.height) * 6;
    gsap.to(el, { x: dx, y: dy, duration: 0.3, ease: "power2.out" });
  });
  el.addEventListener("mouseleave", () => {
    gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.4)" });
  });
});

// ── Forza il mode dalla route Astro (source of truth) ─────────────────────
// La persistentAtom legge localStorage ma la route IS la fonte corretta.
// setMode PRIMA del subscribe → la prima emissione del subscribe è già giusta,
// nessun doppio applyMode con mode sbagliato da localStorage stale.
const initialRouteMode = window.location.pathname
  .split("/")
  .filter(Boolean)[0] as CVMode;
if ((CV_MODES as readonly string[]).includes(initialRouteMode)) {
  setMode(initialRouteMode);
}

// ── Subscribe to modeStore (fires immediately with current value) ─────
modeStore.subscribe((mode) => {
  applyMode(mode ?? "tech");
});

// ── GSAP ScrollTrigger reveals (replaces IntersectionObserver) ───────
document.querySelectorAll<HTMLElement>(".reveal").forEach((el, i) => {
  gsap.fromTo(
    el,
    { opacity: 0, y: 32 },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power3.out",
      delay: (i % 3) * 0.08,
      scrollTrigger: {
        trigger: el,
        start: "top 88%",
        toggleActions: "play none none none",
      },
    },
  );
  el.classList.add("is-visible");
});

// ── Timeline stagger (separate from .reveal — items start invisible) ────
const tlItems = document.querySelectorAll<HTMLElement>(".tl-item");
if (tlItems.length) {
  ScrollTrigger.create({
    trigger: ".timeline",
    start: "top 88%",
    once: true,
    onEnter() {
      gsap.fromTo(
        tlItems,
        { opacity: 0, x: -8 },
        {
          opacity: 1,
          x: 0,
          duration: 0.5,
          stagger: 0.04,
          ease: "power3.out",
        },
      );
    },
  });
}

// ── 3D tilt on cards ─────────────────────────────────────────────────
document
  .querySelectorAll<HTMLElement>(".exp-card, .skill-square, .project-card")
  .forEach((card) => {
    card.style.transformStyle = "preserve-3d";

    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const rx = ((e.clientY - rect.top) / rect.height - 0.5) * -8;
      const ry = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
      gsap.to(card, {
        rotateX: rx,
        rotateY: ry,
        scale: 1.02,
        duration: 0.3,
        ease: "power2.out",
        transformPerspective: 800,
      });
    });

    card.addEventListener("mouseleave", () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        duration: 0.6,
        ease: "elastic.out(1, 0.4)",
      });
    });
  });

// ── Animated counters on AI impact badges ────────────────────────────────
// Parses strings like "-87% boilerplate" or "+3x velocità contenuti"
// and counts from 0 → target when the badge enters the viewport.
const counterRe = /^([+\-]?)(\d+(?:\.\d+)?)(.*)$/;
document
  .querySelectorAll<HTMLElement>(".ai-card__impact[data-count]")
  .forEach((el) => {
    const raw = el.dataset.count!;
    const match = raw.match(counterRe);
    if (!match) return;
    const [, sign, numStr, suffix] = match;
    const target = parseFloat(numStr);
    ScrollTrigger.create({
      trigger: el,
      start: "top 88%",
      once: true,
      onEnter() {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 1.2,
          ease: "power2.out",
          onUpdate() {
            const v = Number.isInteger(target)
              ? Math.round(obj.val)
              : obj.val.toFixed(1);
            el.textContent = `${sign}${v}${suffix}`;
          },
        });
      },
    });
  });

// ── ScrollTrigger refresh — fixes Lit web components (GoLogo, FloatingMenu etc.)
// expanding after init and pushing bottom sections out of calculated trigger range.
// On window.load all resources (including custom elements) are settled;
// the 500ms fallback covers slow Lit hydration on low-end devices.
// NOTE: SkillForceGraph is lazy-loaded below — its own .then() calls refresh.
window.addEventListener("load", () => ScrollTrigger.refresh());
setTimeout(() => ScrollTrigger.refresh(), 500);

// ── Experience cluster accordion ──────────────────────────────────────────
document
  .querySelectorAll<HTMLElement>(".exp-cluster__header")
  .forEach((header) => {
    header.addEventListener("click", () => {
      const cluster = header.closest<HTMLElement>(".exp-cluster");
      if (!cluster) return;
      const isOpen = cluster.hasAttribute("data-open");
      if (isOpen) {
        cluster.removeAttribute("data-open");
        header.setAttribute("aria-expanded", "false");
      } else {
        cluster.setAttribute("data-open", "");
        header.setAttribute("aria-expanded", "true");
        // Move focus into the opened body for keyboard users
        const body = cluster.querySelector<HTMLElement>(".exp-cluster__body");
        if (body) {
          body.setAttribute("tabindex", "-1");
          body.focus({ preventScroll: true });
        }
      }
    });
  });

// ── Lazy-load SkillForceGraph — D3 (~130 KB gzip) fuori dal percorso critico ──
// Il grafo viene importato solo quando .skills-section entra nel viewport
// (con 200px di anticipo), così D3 non blocca il caricamento iniziale.
if (skillsSection) {
  const graphObserver = new IntersectionObserver(
    (entries, obs) => {
      if (!entries[0].isIntersecting) return;
      obs.disconnect();
      import("../islands/SkillForceGraph.lit.ts").then(() => {
        // Custom element ora registrato — ricalcola trigger ScrollTrigger
        requestAnimationFrame(() => ScrollTrigger.refresh());
      });
    },
    { rootMargin: "200px 0px" },
  );
  graphObserver.observe(skillsSection);
}

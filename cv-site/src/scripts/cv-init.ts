import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { modeStore, setMode } from "../islands/stores/modeStore.ts";
import { applyAccordions, applyCardStates, reorderSkillSquares, reorderProjectCards, CLUSTER_OPEN_FOR } from "./mode-helpers.ts";
import "../islands/GoLogo.lit.ts";
// FAB contatti — solo le pagine CV lo renderizzano (Layout, prop showFab)
import "../islands/FloatingMenu.lit.ts";

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
const heroStats = heroEl.querySelector<HTMLElement>(".hero-stats");
const heroPortfolioCard = heroEl.querySelector<HTMLElement>(".hero-portfolio-card");
const heroFooter = heroEl.querySelector<HTMLElement>(".hero-footer");

// Initial states are set in CSS (.hero-section, .hero-char, .hero-title, etc.)
// GSAP only needs to animate: opacity → 1, y → 0

const heroTl = gsap.timeline({ delay: 0 });

// 1. Hero section surfaces
heroTl.to(heroEl, { opacity: 1, duration: 0.3, ease: "power2.out" });

// 2. G and O arrivano per primi — punch + scala (come volano verso il nome nel preloader)
heroTl.fromTo(
  goChars,
  { opacity: 0, scale: 1.5, y: -12 },
  {
    opacity: 1,
    scale: 1,
    y: 0,
    duration: 0.45,
    stagger: 0.12,
    ease: "back.out(1.7)",
  },
  "+=0.05",
);

// 2b. Controlli nav (mode buttons, dropdown mobile, lang switch) — entrano
// insieme al GO, stesso punch back.out. Partono opacity:0 da CSS
// (cv-page.css): maschera il FOUC delle label a larghezza naturale.
const navControls = [
  document.querySelector<HTMLElement>(".cv-nav .mode-buttons"),
  document.querySelector<HTMLElement>("#mode-dropdown"),
  document.querySelector<HTMLElement>(".cv-nav .lang-switch"),
  document.querySelector<HTMLElement>(".cv-nav .lang-dropdown"),
].filter((el): el is HTMLElement => el !== null);
if (navControls.length) {
  heroTl.fromTo(
    navControls,
    { opacity: 0, y: -10, scale: 0.94 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.45,
      stagger: 0.08,
      ease: "back.out(1.7)",
      // via il transform residuo: la dropdown list è position:absolute
      // dentro il trigger — un transform sul parent ne sposterebbe l'ancora
      clearProps: "transform",
    },
    "<",
  );
}

// 3. Glow pulse accent su G e O
heroTl.to(
  goChars,
  {
    textShadow: "0 0 28px var(--color-accent), 0 0 10px var(--color-accent)",
    duration: 0.2,
    ease: "power2.out",
  },
  "-=0.15",
);
heroTl.to(goChars, {
  textShadow: "0 0 0px transparent",
  duration: 0.5,
  ease: "power2.in",
});

// 4. Le altre lettere scorrono in sequenza — stagger simile alle speed lines
heroTl.to(
  restChars,
  {
    opacity: 1,
    y: 0,
    duration: 0.45,
    stagger: { each: 0.04, from: "start" },
    ease: "power3.out",
  },
  "-=0.4",
);

// 5. Resto della sezione hero (titolo, summary, card portfolio, footer)
heroTl.to(
  [heroTitle, heroSummary, heroPortfolioCard, heroFooter, heroStats].filter(
    (el): el is HTMLElement => el !== null,
  ),
  {
    opacity: 1,
    y: 0,
    duration: 0.45,
    stagger: 0.07,
    ease: "power2.out",
  },
  "-=0.2",
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
// ── Riordino skill-grid al cambio mode ──────────────────────────────────────
// reorderSkillSquares (mode-helpers.ts) è una funzione DOM pura, senza GSAP:
// qui la richiamiamo dentro un mini-FLIP manuale (First-Last-Invert-Play) così
// lo spostamento delle card è animato invece di un salto secco. clearProps
// rilascia il transform inline al termine, altrimenti resterebbe sopra a
// scale/translateY di .cv-card[data-state] (stessa proprietà, l'inline vince).
function reorderSkillsAnimated(mode: string) {
  const grid = document.querySelector<HTMLElement>(".skills-grid");
  if (!grid) return;

  const items = Array.from(grid.querySelectorAll<HTMLElement>(".skill-sq"));
  const firstRects = new Map(items.map((el) => [el, el.getBoundingClientRect()] as const));

  reorderSkillSquares(mode);

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  items.forEach((el) => {
    const first = firstRects.get(el);
    if (!first) return;
    const last = el.getBoundingClientRect();
    const dx = first.left - last.left;
    const dy = first.top - last.top;
    if (!dx && !dy) return;
    gsap.fromTo(
      el,
      { x: dx, y: dy },
      {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "power3.out",
        onComplete: () => {
          gsap.set(el, { clearProps: "transform" });
        },
      },
    );
  });
}

// ── Riordino projects-grid al cambio mode ───────────────────────────────────
// Stessa tecnica FLIP di reorderSkillsAnimated: reorderProjectCards (pura,
// mode-helpers.ts) sposta i nodi, qui si anima solo il delta di posizione.
function reorderProjectsAnimated(mode: string) {
  const grid = document.querySelector<HTMLElement>(".projects-grid");
  if (!grid) return;

  const items = Array.from(grid.querySelectorAll<HTMLElement>(".project-card"));
  const firstRects = new Map(items.map((el) => [el, el.getBoundingClientRect()] as const));

  reorderProjectCards(mode);

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  items.forEach((el) => {
    const first = firstRects.get(el);
    if (!first) return;
    const last = el.getBoundingClientRect();
    const dx = first.left - last.left;
    const dy = first.top - last.top;
    if (!dx && !dy) return;
    gsap.fromTo(
      el,
      { x: dx, y: dy },
      {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "power3.out",
        onComplete: () => {
          gsap.set(el, { clearProps: "transform" });
        },
      },
    );
  });
}

function applyMode(mode: string) {
  applyCardStates(mode);
  updateNavButtons(mode);
  reorderSkillsAnimated(mode);
  reorderProjectsAnimated(mode);
  // ScrollTrigger.refresh() rimosso da qui — il subscribe lo chiama già una sola volta.
}

// CLUSTER_OPEN_FOR, applyAccordions e applyCardStates sono importati da ./mode-helpers.ts
// ── Apply accordions: apre/chiude i cluster di esperienza ────────────
// La funzione è definita in mode-helpers.ts per essere testabile indipendentemente.

// Scroll helper: scroll fino a `targetY` e risolve quando la pagina è arrivata vicino alla posizione.
function scrollToPositionThen(targetY: number, maxWait = 2200): Promise<void> {
  const lenis = window.__lenis;
  return new Promise((resolve) => {
    let rafId: number | null = null;
    let timeoutId: number | null = null;

    function cleanup() {
      if (rafId) cancelAnimationFrame(rafId);
      if (timeoutId) clearTimeout(timeoutId);
    }

    function check() {
      const currentY = window.scrollY;
      if (Math.abs(currentY - targetY) <= 4 || (window.innerHeight + currentY) >= document.body.scrollHeight) {
        timeoutId = window.setTimeout(() => {
          cleanup();
          resolve();
        }, 60);
        return;
      }
      rafId = requestAnimationFrame(check);
    }

    if (lenis) {
      try {
        lenis.scrollTo(targetY, { duration: 1.1 });
      } catch (e) {
        try { lenis.scrollTo(targetY); } catch (_) { window.scrollTo({ top: targetY, behavior: "smooth" }); }
      }
    } else {
      window.scrollTo({ top: targetY, behavior: "smooth" });
    }

    rafId = requestAnimationFrame(check);
    timeoutId = window.setTimeout(() => { cleanup(); resolve(); }, maxWait);
  });
}
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

  // Gestione fullscreen + landscape su mobile per il grafico
  const isMobile = window.matchMedia("(max-width: 40rem)").matches;
  if (isMobile && view === "graph") {
    const panel = skillsSection.querySelector(
      ".skills-stage__panel--graph",
    ) as HTMLElement | null;
    if (panel && panel.requestFullscreen && !document.fullscreenElement) {
      panel.requestFullscreen().catch(() => {
        /* fullscreen non disponibile — rimane inline */
      });
    }
    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock("landscape").catch(() => {
        /* orientation lock non supportato */
      });
    }
  } else if (isMobile && view === "cards" && document.fullscreenElement) {
    document.exitFullscreen?.().catch(() => {});
  }
}

// Resync view → cards quando l'utente esce dal fullscreen via ESC
document.addEventListener("fullscreenchange", () => {
  if (!document.fullscreenElement) {
    const isMobile = window.matchMedia("(max-width: 40rem)").matches;
    if (isMobile && skillsSection?.dataset.skillsView === "graph") {
      applySkillsView("cards");
    }
    // Rilascia orientation lock se supportato
    if (screen.orientation && screen.orientation.unlock) {
      screen.orientation.unlock();
    }
  }
});

// ── Lazy-load SkillForceGraph — D3 (~130 KB gzip) fuori dal percorso critico ──
// Su mobile il grafo resta opt-in: D3 si carica solo al primo click su
// "Grafico". Su desktop è la vista di default (vedi sotto) quindi si carica
// subito — niente click necessario per vederlo.
let _graphLoadStarted = false;
function ensureGraphLoaded(): void {
  if (_graphLoadStarted) return;
  _graphLoadStarted = true;
  import("../islands/SkillForceGraph.lit.ts").then(() => {
    // Custom element ora registrato — ricalcola trigger ScrollTrigger
    requestAnimationFrame(() => ScrollTrigger.refresh());
  });
}

skillsViewButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const view = button.dataset.skillsViewButton as
      | "graph"
      | "cards"
      | undefined;
    if (!view) return;
    // Avvia l'import PRIMA dello switch: se l'utente clicca "Grafico" da
    // mobile (dove non è ancora caricato) il pannello passa a display:block
    // nello stesso istante in cui parte il fetch di D3, non dopo.
    if (view === "graph") ensureGraphLoaded();
    applySkillsView(view);
  });
});

// Default view dipende dal viewport (stesso breakpoint —min-width:56.25rem—
// che SkillForceGraph usa internamente per isMobile, custom media --desktop
// in index-page.css): desktop ha spazio e mouse per il grafico e lo mostra
// da subito; mobile resta su CARD, scannabile in 5s (Legge di Jakob), il
// grafico resta un opt-in dietro al tasto "Grafico".
const isDesktopViewport = window.matchMedia("(min-width: 56.25rem)").matches;
applySkillsView(isDesktopViewport ? "graph" : "cards");
if (isDesktopViewport) ensureGraphLoaded();

// ── Skills-grid: "Mostra tutte" — espande la griglia oltre l'altezza
// collassata (skills-collapsible + dissolvenza in cv-page.css). Le card
// restano tutte nel DOM anche da collassate — solo altezza/opacity della
// dissolvenza cambiano, mai display:none (sussurri, non silenzi). ──────────
const skillsExpandBtn = document.querySelector<HTMLButtonElement>(
  "[data-skills-expand-toggle]",
);
const skillsCollapsible = document.querySelector<HTMLElement>(".skills-collapsible");
if (skillsExpandBtn && skillsCollapsible) {
  skillsExpandBtn.addEventListener("click", () => {
    const expanded = skillsCollapsible.dataset.skillsExpanded === "true";
    skillsCollapsible.dataset.skillsExpanded = String(!expanded);
    skillsExpandBtn.setAttribute("aria-expanded", String(!expanded));
    skillsExpandBtn.textContent = expanded
      ? skillsExpandBtn.dataset.labelCollapsed ?? skillsExpandBtn.textContent ?? ""
      : skillsExpandBtn.dataset.labelExpanded ?? skillsExpandBtn.textContent ?? "";
    // La griglia cresce/si contrae (max-height) — ScrollTrigger deve
    // ricalcolare le posizioni delle sezioni sottostanti.
    requestAnimationFrame(() => ScrollTrigger.refresh());
  });
}

// ── Timeline formazione: "Mostra tutta la cronologia" — stessa meccanica
// della skills-grid (tl-collapsible + dissolvenza in cv-page.css). ─────────
const tlExpandBtn = document.querySelector<HTMLButtonElement>(
  "[data-tl-expand-toggle]",
);
const tlCollapsible = document.querySelector<HTMLElement>(".tl-collapsible");
if (tlExpandBtn && tlCollapsible) {
  tlExpandBtn.addEventListener("click", () => {
    const expanded = tlCollapsible.dataset.tlExpanded === "true";
    tlCollapsible.dataset.tlExpanded = String(!expanded);
    tlExpandBtn.setAttribute("aria-expanded", String(!expanded));
    tlExpandBtn.textContent = expanded
      ? tlExpandBtn.dataset.labelCollapsed ?? tlExpandBtn.textContent ?? ""
      : tlExpandBtn.dataset.labelExpanded ?? tlExpandBtn.textContent ?? "";
    requestAnimationFrame(() => ScrollTrigger.refresh());
  });
}


// ── Update nav buttons: morph larghezza + crossfade testo ───────────
// Larghezze FISSE anche su desktop: evitano jitter e tengono le 4 voci allineate.
// CSS transition rimossa dal .mode-btn: GSAP controlla tutto.
// killTweensOf previene ghosting su click rapido.
const INACTIVE_W = "2.2rem";
const DESKTOP_W = "7.75rem";
const MODE_LABELS: Record<string, string> = {
  tech: "Software Dev",
  creative: "Web & UX",
  management: "Project Manager",
  human: "AI & Digital",
};
// Su schermi <= 374px comprimiamo la label del bottone attivo
function getActiveW(): string {
  return window.innerWidth <= 374 ? "5.5rem" : "7.5rem";
}
let navInitialized = false;

function updateNavButtons(mode: string) {
  const isDesktop = window.matchMedia("(min-width: 40.0625rem)").matches;

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
      // Testo istantaneo: niente finestra di tempo tra abbr e label.
      gsap.set(abbr, { opacity: 0 });
      gsap.set(label, { opacity: 1 });
      // Larghezza istantanea sul bottone attivo: evita fase intermedia con label "tagliata".
      gsap.set(btn, { width: getActiveW() });
      // Nessun punch qui — il feedback fisico è solo sul secondo tap (scroll confirm)
    } else {
      gsap.set(label, { opacity: 0 });
      gsap.set(abbr, { opacity: 1 });
      gsap.to(btn, {
        width: INACTIVE_W,
        duration: 0.36,
        delay: 0,
        ease: "power3.inOut",
      });
    }
  });
  // Sync mobile dropdown label + selected option
  const dropdownLabel = document.querySelector<HTMLElement>("#mode-dropdown-label");
  if (dropdownLabel) dropdownLabel.textContent = MODE_LABELS[mode] ?? mode;
  document.querySelectorAll<HTMLElement>("#mode-dropdown-list [data-dropdown-mode]").forEach((opt) => {
    opt.classList.toggle("is-selected", opt.dataset.dropdownMode === mode);
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

      const isMobile = !window.matchMedia("(min-width: 40.0625rem)").matches;
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
      // setMode → subscribe → applyMode + applyAccordions già eseguiti (sincrono).
      // Il button handler gestisce solo l'animazione visiva (stamp + scan + scroll).
      const currentSegment = window.location.pathname.split("/").filter(Boolean)[0];
      if ((CV_MODES as readonly string[]).includes(currentSegment)) {

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
        // Lo scroll si ferma sul titolo della sezione Esperienze, non sul
        // cluster: il cluster resta più in basso della viewport, il titolo
        // (contesto "Esperienze") altrimenti finirebbe nascosto sotto la
        // navbar e chi arriva dalla dropdown perderebbe l'orientamento.
        const scrollTarget =
          scanTarget
            ?.closest<HTMLElement>(".exp-section")
            ?.querySelector<HTMLElement>(".section-title") ?? scanTarget;

        // ── Crea stamp fullscreen ──────────────────────────────────────────
        const stamp = document.createElement("div");
        stamp.textContent = (MODE_LABELS[mode] ?? mode).toUpperCase();
        Object.assign(stamp.style, {
          position: "fixed",
          inset: "0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          /* Reduce base font-size and allow wrapping for long labels */
          fontSize: "clamp(3rem, 16vw, 12rem)",
          fontFamily: "Lexend, sans-serif",
          fontWeight: "800",
          letterSpacing: "-0.02em",
          color: "var(--color-accent)",
          opacity: "0",
          zIndex: "9998",
          pointerEvents: "none",
          clipPath: "inset(50% 50% 50% 50%)",
          userSelect: "none",
          textAlign: "center",
          whiteSpace: "pre-wrap",
          overflowWrap: "break-word",
          wordBreak: "break-word",
          paddingLeft: "1rem",
          paddingRight: "1rem",
          lineHeight: "0.9",
          maxWidth: "calc(100% - 2rem)",
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
          // Rispetta preferenze reduce-motion
          if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            // minimal visual feedback
            if (!isMobile && scanTarget) {
              gsap.to(scanTarget, { boxShadow: "0 0 0 6px var(--color-accent)", duration: 0.18, yoyo: true, repeat: 1 });
            }
            return;
          }

          const isDesktop = !isMobile;

          // Prima del feedback visivo: rivela tutte le sezioni ancora nascoste (opacity:0
          // da gsap.set al init). Se l'utente non ha ancora scrollato oltre la hero,
          // exp-section e sezioni successive sarebbero invisibili indipendentemente
          // da qualsiasi manipolazione dei cluster figli.
          document.querySelectorAll<HTMLElement>(".reveal:not(.is-visible)").forEach((el) => {
            gsap.set(el, { opacity: 1, y: 0 });
            el.classList.add("is-visible");
          });

          // Mobile: mostra un breve highlight sul cluster target, niente scanner pesante
          if (!isDesktop) {
            if (scanTarget) {
              gsap.fromTo(
                scanTarget,
                { boxShadow: "0 0 0 0 rgba(0,0,0,0)" },
                { boxShadow: "0 0 0 12px var(--color-accent)", duration: 0.34, yoyo: true, repeat: 1, ease: "power2.out" },
              );
            }
            return;
          }

          // Desktop: scanner ottimizzato — calcola posizioni una sola volta e avanza un indice
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

          const cards = Array.from(document.querySelectorAll<HTMLElement>(".cv-card"));
          const cardPositions = cards.map((el) => ({ el, top: el.getBoundingClientRect().top + window.scrollY }));
          cardPositions.sort((a, b) => a.top - b.top);
          let scanIndex = 0;
          const pageHeight = document.documentElement.scrollHeight;

          // Proxy object: evita DOM read (parseFloat(el.style.top)) in ogni frame.
          const scanProxy = { y: 0 };
          gsap.to(scanProxy, {
            y: pageHeight,
            duration: 0.85,
            ease: "none",
            onUpdate() {
              scanner.style.top = scanProxy.y + "px";
              // Avanza l'indice finché le card sono sopra la linea di scansione
              while (scanIndex < cardPositions.length && cardPositions[scanIndex].top <= scanProxy.y) {
                const card = cardPositions[scanIndex].el;
                if (!card.dataset.scanned) {
                  card.dataset.scanned = "1";
                  // box-shadow invece di filter: brightness — evita compositing layer per ogni card
                  gsap.fromTo(
                    card,
                    { boxShadow: "0 0 0 1px var(--color-accent), 0 0 16px var(--color-accent)" },
                    { boxShadow: "0 0 0 0 transparent", duration: 0.45, ease: "power2.out" },
                  );
                }
                scanIndex += 1;
              }
            },
            onComplete() {
              scanner.remove();
              cardPositions.forEach((p) => { delete p.el.dataset.scanned; });
            },
          });
        }, 450);

        // ── Fase 4+5: scroll + spotlight (layout stabile a 650ms) ─────────
        if (scanTarget) {
          setTimeout(() => {
            // 1. Svela PRIMA le sezioni .reveal ancora nascoste (y:32 da gsap.set al init).
            //    Questo deve accadere PRIMA del calcolo della posizione —
            //    se una sezione sopra il target ha ancora transform:translateY(32px),
            //    getBoundingClientRect() restituirebbe una posizione errata (32px in più).
            //    Sul primo click il timeout a 450ms può arrivare tardi (main thread occupato),
            //    quindi qui è il posto sicuro per garantire il flush prima del calcolo.
            document.querySelectorAll<HTMLElement>(".reveal:not(.is-visible)").forEach((el) => {
              gsap.set(el, { opacity: 1, y: 0 });
              el.classList.add("is-visible");
            });

            // 2. Attendi il prossimo frame di layout per garantire che i transform
            //    rimossi siano stati applicati prima di leggere getBoundingClientRect().
            requestAnimationFrame(() => {
              const navEl = document.querySelector<HTMLElement>("#cv-nav");
              const NAV_HEIGHT = navEl ? navEl.getBoundingClientRect().height : 52;
              const absoluteTop =
                (scrollTarget ?? scanTarget).getBoundingClientRect().top + window.scrollY - NAV_HEIGHT;

              // Spotlight: dim gli altri, glow sul target
              gsap.to(allClusters, { opacity: 0.2, duration: 0.25 });
              gsap.to(scanTarget, {
                opacity: 1,
                boxShadow:
                  "0 0 0 2px var(--color-accent), 0 0 28px color-mix(in srgb, var(--color-accent) 35%, transparent)",
                duration: 0.25,
              });

              // Usa helper scrollToPositionThen per attendere l'arrivo e spegnere
              // lo spotlight in modo affidabile (gestisce Lenis o fallback).
              scrollToPositionThen(absoluteTop).then(() => {
                // Correzione finale: l'apertura/chiusura dei cluster (CSS
                // max-height, ~550ms) e le re-reveal dell'accordion possono
                // continuare a leggero spostare il layout durante lo scroll
                // stesso — ricalcola e correggi in un colpo solo, senza
                // animazione, così il titolo non resta mai sotto la navbar.
                const settledTop =
                  (scrollTarget ?? scanTarget).getBoundingClientRect().top +
                  window.scrollY -
                  NAV_HEIGHT;
                if (Math.abs(settledTop - window.scrollY) > 4) {
                  const lenis = window.__lenis;
                  if (lenis && typeof lenis.scrollTo === "function") {
                    lenis.scrollTo(settledTop, { immediate: true });
                  } else {
                    window.scrollTo({ top: settledTop });
                  }
                }
                gsap.to(allClusters, { opacity: 1, duration: 0.5, ease: "power2.out" });
                gsap.to(scanTarget, { boxShadow: "none", duration: 0.5 });
              });
            }); // end requestAnimationFrame
          }, 650);
        }
      }
      // else: non su pagina mode — subscribe ha già chiamato applyMode.
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

// ── Voce "Fuori orario" — navigazione, non mode ─────────────────────────
// Sync visivo tra lo stato realmente aperto del cluster "personal" e il
// bottone/voce dropdown che lo aprono. Chiamata da tre punti: apertura da
// "Fuori orario", click diretto sull'header del cluster, e chiusura
// automatica quando si cambia mode (applyAccordions non include mai
// "personal" in nessun mode — vedi mode-helpers.ts).
function syncPersonalNavState() {
  const cluster = document.querySelector<HTMLElement>(
    '.exp-cluster[data-cluster="personal"]',
  );
  const isOpen = !!cluster?.hasAttribute("data-open");
  document.querySelectorAll<HTMLElement>("[data-nav-personal]").forEach((btn) => {
    btn.classList.toggle("is-active", isOpen);
    btn.setAttribute("aria-pressed", String(isOpen));
  });
}

// Apre il cluster personale e ci scrolla a filo navbar. Riusa il click
// sull'header (non ne duplica la logica): quello stesso click è anche
// l'unico punto che richiama initFeaturedCardReveal() dopo l'apertura —
// senza, le featured card del cluster restano a opacity:0 (regola CSS
// ".exp-grid--featured .exp-card:not(.is-revealed)"), perché a inizio
// pagina initFeaturedCardReveal() le salta: il cluster "personal" non è
// mai aperto di default, quindi non le trova.
function openPersonalCluster() {
  const cluster = document.querySelector<HTMLElement>(
    '.exp-cluster[data-cluster="personal"]',
  );
  const header = cluster?.querySelector<HTMLElement>(".exp-cluster__header");
  if (!cluster || !header) return;

  if (!cluster.hasAttribute("data-open")) {
    header.click();
  } else {
    // Già aperto — richiamo di scroll, nessun toggle (evita di richiuderlo).
    const navEl = document.querySelector<HTMLElement>("#cv-nav");
    const navH = navEl ? navEl.getBoundingClientRect().height : 52;
    const targetY = header.getBoundingClientRect().top + window.scrollY - navH - 8;
    scrollToPositionThen(targetY);
  }
  syncPersonalNavState();
}

document
  .querySelectorAll<HTMLElement>("[data-nav-personal]")
  .forEach((btn) => btn.addEventListener("click", openPersonalCluster));

// ── Mode dropdown (mobile) ──────────────────────────────────────────────
{
  const dropdownBtn = document.querySelector<HTMLButtonElement>("#mode-dropdown-btn");
  const dropdownList = document.querySelector<HTMLElement>("#mode-dropdown-list");
  if (dropdownBtn && dropdownList) {
    dropdownBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = dropdownList.classList.toggle("is-open");
      dropdownBtn.setAttribute("aria-expanded", String(isOpen));
    });

    dropdownList.querySelectorAll<HTMLElement>("[data-dropdown-mode]").forEach((opt) => {
      opt.addEventListener("click", () => {
        const mode = opt.dataset.dropdownMode;
        if (!mode) return;
        dropdownList.classList.remove("is-open");
        dropdownBtn.setAttribute("aria-expanded", "false");
        // Proxy: click sul pulsante nascosto — riusa tutta la logica mode + animazioni
        document.querySelector<HTMLButtonElement>(`button[data-nav-mode="${mode}"]`)?.click();
      });
    });

    // Voce personale: apre il cluster "Fuori orario", nessun cambio mode
    dropdownList.querySelectorAll<HTMLElement>("[data-dropdown-personal]").forEach((opt) => {
      opt.addEventListener("click", () => {
        dropdownList.classList.remove("is-open");
        dropdownBtn.setAttribute("aria-expanded", "false");
        openPersonalCluster();
      });
    });

    // Chiudi al click fuori
    document.addEventListener("click", () => {
      if (dropdownList.classList.contains("is-open")) {
        dropdownList.classList.remove("is-open");
        dropdownBtn.setAttribute("aria-expanded", "false");
      }
    });
  }
}

// ── Language dropdown (mobile, <details> nativo) ────────────────────────
// Apertura/chiusura è gratis (comportamento nativo dell'elemento) — l'unica
// cosa che serve è chiudere quando l'utente clicca fuori, per coerenza con
// il mode-dropdown accanto (che ha lo stesso comportamento).
{
  const langDropdown = document.querySelector<HTMLDetailsElement>(".lang-dropdown");
  if (langDropdown) {
    document.addEventListener("click", (e) => {
      if (langDropdown.open && !langDropdown.contains(e.target as Node)) {
        langDropdown.open = false;
      }
    });
  }
}

// ── Magnetic hover on GO logo + lang switcher ────────────────────────
(
  [
    document.querySelector<HTMLElement>("go-logo"),
    document.querySelector<HTMLElement>(".lang-switch"),
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
} else {
  // Pagina mode-aware senza route di mode (es. /en/cv) — usa lo store (già inizializzato
  // da initMode() in Layout.astro) oppure default 'tech'.
  const stored = modeStore.get();
  if (!(CV_MODES as readonly string[]).includes(stored)) {
    setMode("tech");
  }
}

// ── Subscribe to modeStore (fires immediately with current value) ─────
modeStore.subscribe((mode) => {
  const m = mode ?? "tech";
  applyMode(m);
  applyAccordions(m);
  // Nessun mode apre mai "personal" (mode-helpers.ts): un cambio mode lo
  // chiude sempre. Sincronizza il bottone "Fuori orario" di conseguenza.
  syncPersonalNavState();

  // Mobile-first: focus the first open cluster body so keyboard/touch users
  // land inside content immediately (only on small screens).
  try {
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 40rem)").matches) {
      const openBody = document.querySelector<HTMLElement>(
        ".exp-cluster[data-open] .exp-cluster__body",
      );
      if (openBody) {
        openBody.setAttribute("tabindex", "-1");
        openBody.focus({ preventScroll: true });
      }
    }
  } catch {
    /* noop */
  }

  // Un solo ScrollTrigger.refresh() per ciclo mode — qui nel subscribe, non in applyMode.
  // Dopo il refresh, forza la visibilità degli elementi .reveal già nel viewport
  // (possono essere "saltati" da ScrollTrigger quando l'accordion si chiude e le sezioni
  // sottostanti si trovano già sopra il threshold senza aver mai triggerato onEnter).
  setTimeout(() => {
    ScrollTrigger.refresh();
    // Breve attesa per lasciar riposizionare i trigger dopo il refresh
    requestAnimationFrame(() => {
      const unrevealedEls = document.querySelectorAll<HTMLElement>(".reveal:not(.is-visible)");
      const viewH = window.innerHeight;
      unrevealedEls.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < viewH * 0.95) {
          gsap.to(el, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" });
          el.classList.add("is-visible");
        }
      });
    });
  }, 320);

  // Re-init featured card reveal dopo il cambio mode: applyAccordions ha aperto
  // nuovi cluster — le loro card devono essere resettate e rianiimate.
  // Il delay 660ms > 550ms (durata CSS max-height transition) garantisce che le
  // posizioni getBoundingClientRect siano calcolate sull'accordion completamente aperto.
  setTimeout(() => {
    initFeaturedCardReveal();
    ScrollTrigger.refresh();
  }, 660);
});

// ── GSAP ScrollTrigger reveals — batch (1 istanza vs N) ────────────────────
const revealEls = document.querySelectorAll<HTMLElement>(".reveal");
if (revealEls.length) {
  gsap.set(revealEls, { opacity: 0, y: 32 });
  ScrollTrigger.batch(revealEls, {
    start: "top 88%",
    onEnter(batch) {
      // Filtra solo gli elementi non ancora animati
      const fresh = batch.filter((el) => !el.classList.contains("is-visible"));
      if (!fresh.length) return;
      gsap.to(fresh, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.08,
      });
      fresh.forEach((el) => el.classList.add("is-visible"));
    },
  });
}

// ── Section dot-nav — jump diretto + stato attivo (nessuno scroll-jacking) ──
const sectionDots = document.querySelectorAll<HTMLAnchorElement>(".section-dot");
sectionDots.forEach((dot) => {
  const targetId = dot.getAttribute("href")?.slice(1);
  const target = targetId ? document.getElementById(targetId) : null;
  if (!target) return;

  dot.addEventListener("click", (e) => {
    e.preventDefault();
    const lenis = window.__lenis;
    const targetY = target.getBoundingClientRect().top + window.scrollY;
    if (lenis && typeof lenis.scrollTo === "function") {
      lenis.scrollTo(targetY, { duration: 0.8 });
    } else {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  ScrollTrigger.create({
    trigger: target,
    start: "top center",
    end: "bottom center",
    onToggle: (self) => dot.classList.toggle("is-active", self.isActive),
  });
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
      const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 40rem)").matches;

      if (isOpen) {
        cluster.removeAttribute("data-open");
        header.setAttribute("aria-expanded", "false");
      } else {
        // On mobile behave like a true accordion: close others
        if (isMobile) {
          document.querySelectorAll<HTMLElement>(".exp-cluster").forEach((c) => {
            if (c !== cluster) {
              c.removeAttribute("data-open");
              const h = c.querySelector<HTMLElement>(".exp-cluster__header");
              if (h) h.setAttribute("aria-expanded", "false");
            }
          });
        }

        cluster.setAttribute("data-open", "");
        header.setAttribute("aria-expanded", "true");

        // Move focus into the opened body for keyboard users
        const body = cluster.querySelector<HTMLElement>(".exp-cluster__body");
        if (body) {
          body.setAttribute("tabindex", "-1");
          body.focus({ preventScroll: true });
        }

        // Il body transiziona max-height 0 → 9000px (cv-page.css) per permettere
        // contenuto di altezza arbitraria: durante quella transizione alcuni
        // browser "inseguono" l'elemento a fuoco e finiscono per allineare la
        // FINE del contenuto appena aperto invece dell'inizio. Controlliamo lo
        // scroll esplicitamente sull'header (che non si sposta) una volta che
        // la transizione (0.55s) e l'eventuale chiusura di altri cluster
        // (mobile) si sono assestate.
        setTimeout(() => {
          const navEl = document.querySelector<HTMLElement>("#cv-nav");
          const navHeight = navEl ? navEl.getBoundingClientRect().height : 52;
          const targetY = header.getBoundingClientRect().top + window.scrollY - navHeight - 8;
          scrollToPositionThen(targetY);
        }, 600);
      }

      // After layout change, refresh ScrollTrigger to recompute offsets
      setTimeout(() => ScrollTrigger.refresh(), 320);

      // Click diretto sull'header del cluster personale (non passando dalla
      // voce "Fuori orario"): sincronizza comunque lo stato del bottone.
      if (cluster.dataset.cluster === "personal") syncPersonalNavState();
    });
  });

// ── "Leggi altro" — reveal incrementale delle card extra (3 per click) ────
// Pattern read-more (Legge di Jakob): ogni click rivela il batch successivo;
// quando non resta nulla il bottone scompare. Nessuno stato "chiudi".
// Le card partono con [hidden] (display:none via CSS) — il drawer non ha più
// height animata: l'altezza segue naturalmente le card visibili.
const REVEAL_BATCH = 3;
const isEnglishPage = document.documentElement.lang.startsWith("en");
document
  .querySelectorAll<HTMLElement>(".exp-deeper-btn")
  .forEach((btn) => {
    const key = btn.dataset.drawer;
    const drawer = key ? document.getElementById(`exp-drawer-${key}`) : null;
    if (!drawer) return;

    const cards = Array.from(drawer.querySelectorAll<HTMLElement>(".exp-card"));
    cards.forEach((card) => card.setAttribute("hidden", ""));
    // La visibilità è per-card via [hidden] — il drawer stesso resta nel flusso
    drawer.removeAttribute("aria-hidden");

    const label = btn.querySelector<HTMLElement>(".exp-deeper-btn__label");
    const updateLabel = () => {
      const remaining = cards.filter((c) => c.hasAttribute("hidden")).length;
      const next = Math.min(REVEAL_BATCH, remaining);
      if (label)
        label.textContent = isEnglishPage
          ? `Read ${next} more`
          : `Leggi altre ${next}`;
    };
    updateLabel();

    btn.addEventListener("click", () => {
      const batch = cards
        .filter((c) => c.hasAttribute("hidden"))
        .slice(0, REVEAL_BATCH);
      if (!batch.length) return;

      batch.forEach((card) => {
        card.removeAttribute("hidden");
        card.classList.add("is-revealed");
      });
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(batch, { opacity: 1, y: 0 });
      } else {
        gsap.fromTo(
          batch,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.45,
            stagger: { each: 0.07, from: "start" },
            ease: "power3.out",
          },
        );
      }

      const remaining = cards.filter((c) => c.hasAttribute("hidden")).length;
      if (remaining === 0) {
        btn.setAttribute("hidden", "");
      } else {
        updateLabel();
      }
      setTimeout(() => ScrollTrigger.refresh(), 100);
    });
  });

// ── ScrollTrigger stagger for featured exp cards ──────────────────────────
function initFeaturedCardReveal() {
  // Ripristina tutte le featured card: rimuove inline GSAP opacity/y da init precedenti.
  document.querySelectorAll<HTMLElement>(".exp-grid--featured .exp-card").forEach((card) => {
    gsap.killTweensOf(card);
    gsap.set(card, { clearProps: "opacity,y" });
    card.classList.remove("is-revealed");
  });

  const featuredCards = Array.from(document.querySelectorAll<HTMLElement>(
    ".exp-cluster[data-open] .exp-grid--featured .exp-card",
  ));
  if (!featuredCards.length) return;

  gsap.set(featuredCards, { opacity: 0, y: 24 });

  const viewH = window.innerHeight;
  const inView: HTMLElement[] = [];
  const belowFold: HTMLElement[] = [];

  featuredCards.forEach((card) => {
    // getBoundingClientRect().top è affidabile anche dentro overflow:hidden
    if (card.getBoundingClientRect().top < viewH * 0.92) {
      inView.push(card);
    } else {
      belowFold.push(card);
    }
  });

  // Card già nel viewport → animazione diretta (ScrollTrigger.batch non fa scattare
  // onEnter per elementi già visibili al momento della creazione del batch).
  if (inView.length) {
    inView.forEach((card) => card.classList.add("is-revealed"));
    gsap.to(inView, {
      opacity: 1,
      y: 0,
      duration: 0.55,
      stagger: { each: 0.08, from: "start" },
      ease: "power3.out",
    });
  }

  // Card sotto il fold → ScrollTrigger.batch (si attiva allo scroll)
  if (belowFold.length) {
    ScrollTrigger.batch(belowFold, {
      start: "top 92%",
      onEnter(batch) {
        batch.forEach((card) => card.classList.add("is-revealed"));
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: { each: 0.08, from: "start" },
          ease: "power3.out",
        });
      },
    });
  }
}
initFeaturedCardReveal();

// Re-init stagger when a cluster is opened so newly visible cards animate in.
document.querySelectorAll<HTMLElement>(".exp-cluster__header").forEach((header) => {
  header.addEventListener("click", () => {
    // 600ms > 550ms CSS max-height transition — posizioni affidabili solo dopo
    setTimeout(() => {
      initFeaturedCardReveal();
      ScrollTrigger.refresh();
    }, 600);
  });
});

// ── Parallax bg-knoll — movimento verticale sfalsato durante lo scroll ──────
// GSAP gestisce l'intero transform (rotation + y) — il CSS non ha più transform sui bg-knoll.
// La rotation viene impostata con gsap.set() prima di fromTo, così non va persa.
// delta: desktop 500px (grande, visibile), mobile 300px (~50% meno).
// scrub: true = risposta 1:1 allo scroll in entrambe le direzioni.
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {

  // Imposta le rotazioni: GSAP prende ownership del transform prima dell'animazione
  gsap.set(".bg-knoll--laptop", { rotation: -10 });
  gsap.set(".bg-knoll--multitool", { rotation: 8 });
  gsap.set(".bg-knoll--flashlight", { rotation: 45 });
  gsap.set(".bg-knoll--chess", { rotation: -8 });
  gsap.set(".bg-knoll--plant", { rotation: 6 });
  gsap.set(".bg-knoll--compass", { rotation: 15 });

  const isDesktop = window.matchMedia("(min-width: 56.25rem)").matches;
  const delta = isDesktop ? 500 : 300;

  const knollParallax: Array<{ selector: string; trigger: string }> = [
    { selector: ".bg-knoll--laptop", trigger: ".hero-section" },
    { selector: ".bg-knoll--flashlight", trigger: ".exp-section" },
    { selector: ".bg-knoll--multitool", trigger: ".skills-section" },
    { selector: ".bg-knoll--chess", trigger: ".ai-section" },
    { selector: ".bg-knoll--plant", trigger: ".soft-section" },
    { selector: ".bg-knoll--compass", trigger: ".projects-section" },
  ];

  knollParallax.forEach(({ selector, trigger }) => {
    const el = document.querySelector<HTMLElement>(selector);
    const triggerEl = document.querySelector<HTMLElement>(trigger);
    if (!el || !triggerEl) return;

    gsap.fromTo(el,
      { y: delta },
      {
        y: -delta,
        ease: "none",
        scrollTrigger: {
          trigger: triggerEl,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      }
    );
  });

  // ── Luce ambientale — l'alone accent (::before in cv-page.css) sale
  // mentre la sezione entra: il passaggio di sezione è un cambio di luce.
  document
    .querySelectorAll<HTMLElement>(
      ".skills-section, .exp-section, .ai-section, .soft-section, .projects-section, .edu-section",
    )
    .forEach((section) => {
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

}

// ── Skills toggle hint: pulse glow (A) + scan sweep (C) ───────────────────
// A: pulse glow sui due bottoni → cattura l'attenzione periferica.
// C: scan sweep via CSS custom property --sweep-x animata da GSAP CSSPlugin.
// Una sola volta (once: true). Rispetta prefers-reduced-motion.
if (skillsViewButtons.length) {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!prefersReduced) {
    ScrollTrigger.create({
      trigger: ".skills-view-toggle",
      start: "top 82%",
      once: true,
      onEnter() {
        const btns = Array.from(skillsViewButtons);
        const tl = gsap.timeline({ delay: 0.35 });

        // ── A: Pulse glow — entrambi i bottoni, stagger 0.15s ────────────
        tl.fromTo(
          btns,
          { boxShadow: "0 0 0px transparent" },
          {
            boxShadow: "0 0 14px color-mix(in srgb, var(--color-accent) 55%, transparent)",
            duration: 0.45,
            stagger: 0.15,
            ease: "power2.inOut",
            yoyo: true,
            repeat: 1,
          },
        );

        // ── C: Scan sweep — --sweep-x da -110% → 110%, stagger 0.2s ─────
        // GSAP CSSPlugin supporta nativamente l'animazione di CSS custom
        // properties su elementi — nessun plugin aggiuntivo richiesto.
        tl.add(() => {
          btns.forEach((btn, i) => {
            gsap.delayedCall(i * 0.2, () => {
              gsap.fromTo(
                btn,
                { "--sweep-x": "-110%" },
                { "--sweep-x": "110%", duration: 0.55, ease: "power2.inOut" },
              );
            });
          });
        }, "+=0.15");
      },
    });
  }
}

// ── Card peek → Mode Connectors (bracket + thread) ───────────────────────────
// Bracket: SVG iniettato come figlio DIRETTO della card (position:absolute).
//   Usa offsetWidth/offsetHeight → segue automaticamente la card su scroll
//   e scala con qualsiasi CSS transform applicato alla card.
//   LinearGradient stroke: bottom=dim → top=bright (effetto "bordo che sale").
//   Dot luminoso al top-inner come giunzione visibile col thread.
// Thread: SVG position:fixed separato (non soggetto a overflow:hidden della card).
//   Parte dalla posizione viewport del top-inner del bracket verso il nav button.
//   Viene cancellato su scroll via listener passivo once:true.
// Reset: auto 3.5s o click fuori o scroll.
{
  const PEEK_ACCENT: Record<string, string> = {
    tech: "rgba(0,255,200,1)",
    creative: "rgba(255,107,53,1)",
    human: "rgba(240,200,127,1)",
    management: "rgba(180,100,255,1)",
  };
  const CV_MODE_KEYS = ["tech", "creative", "human", "management"] as const;
  const O = 4;  // px fuori dal bordo card
  const CW = 18; // lunghezza ala orizzontale del bracket

  let _peekCard: HTMLElement | null = null;
  let _peekEls: Element[] = [];
  let _peekTimer: ReturnType<typeof setTimeout> | null = null;
  let _scrollCancel: (() => void) | null = null;

  const resetPeek = () => {
    if (_peekTimer) { clearTimeout(_peekTimer); _peekTimer = null; }
    if (_scrollCancel) { window.removeEventListener("scroll", _scrollCancel); _scrollCancel = null; }
    _peekEls.forEach((el) => el.remove());
    _peekEls = [];
    if (_peekCard) {
      const card = _peekCard;
      _peekCard = null;
      gsap.killTweensOf(card);
      // Rimuove tutti gli inline style impostati da GSAP durante il peek.
      // CSS transitions su .cv-card animano automaticamente verso i valori
      // corretti del mode attivo: var(--card-opacity-passive) e var(--card-scale-passive).
      gsap.set(card, { clearProps: "opacity,scale,transform,boxShadow,borderColor" });
      // Ricalcola lo stato vero invece di forzare "passive": una card può
      // entrare in peek mentre è passiva e poi, nel frattempo (mode switch,
      // o un data-state già disallineato a monte), essere di nuovo rilevante
      // per il mode corrente — forzare "passive" la lasciava dimmed/rotta
      // anche quando in realtà apparteneva al mode attivo (bug segnalato:
      // la card sparisce dopo il primo peek e il click successivo la
      // ripesca in loop). Stessa logica di applyCardStates (mode-helpers.ts).
      const tags = card.dataset.tags?.split(" ") ?? [];
      const currentMode = document.documentElement.dataset.mode;
      card.dataset.state = currentMode && tags.includes(currentMode) ? "active" : "passive";
    }
  };

  const reducedMotionPeek = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /**
   * Disegna:
   *  - bracket SVG come figlio absolute della card (allineamento perfetto)
   *  - thread SVG come fixed overlay verso il nav button (solo se withThreads)
   *
   * rect = card.getBoundingClientRect() già letto DOPO scale:1 (viewport coords corretti).
   */
  function drawConnectors(
    card: HTMLElement,
    rect: DOMRect,
    modes: readonly string[],
    withThreads: boolean,
    managed: boolean,
  ) {
    if (reducedMotionPeek) return;
    const ns = "http://www.w3.org/2000/svg";
    const W = card.offsetWidth;
    const H = card.offsetHeight;
    const svgW = W + 2 * O;
    const svgH = H + 2 * O;

    // Assicura che la card sia positioning context
    if (getComputedStyle(card).position === "static") {
      card.style.position = "relative";
    }

    modes.forEach((mode, i) => {
      const accent = PEEK_ACCENT[mode];
      const accentDim = accent.replace("1)", "0.22)");

      const side: "left" | "right" | "center" =
        modes.length === 1 ? "left" :
          i === 0 ? "left" :
            i === modes.length - 1 ? "right" :
              "center";

      // ── BRACKET: figlio absolute della card ─────────────────────────────
      if (side !== "center") {
        const gradId = `pkg-${mode}-${i}-${Date.now()}`;

        const bSvg = document.createElementNS(ns, "svg") as SVGSVGElement;
        Object.assign(bSvg.style, {
          position: "absolute",
          top: `${-O}px`,
          left: `${-O}px`,
          width: `${svgW}px`,
          height: `${svgH}px`,
          overflow: "visible",
          pointerEvents: "none",
          zIndex: "10",
        });

        // Gradient stroke: bottom dim → top bright
        const defs = document.createElementNS(ns, "defs");
        const grad = document.createElementNS(ns, "linearGradient");
        grad.setAttribute("id", gradId);
        grad.setAttribute("x1", "0"); grad.setAttribute("y1", "1");
        grad.setAttribute("x2", "0"); grad.setAttribute("y2", "0");
        grad.setAttribute("gradientUnits", "objectBoundingBox");
        const s0 = document.createElementNS(ns, "stop");
        s0.setAttribute("offset", "0%");
        s0.setAttribute("stop-color", accent);
        s0.setAttribute("stop-opacity", "0.2");
        const s1 = document.createElementNS(ns, "stop");
        s1.setAttribute("offset", "100%");
        s1.setAttribute("stop-color", accent);
        s1.setAttribute("stop-opacity", "0.92");
        grad.appendChild(s0); grad.appendChild(s1);
        defs.appendChild(grad); bSvg.appendChild(defs);

        // Path del bracket in coordinate locali SVG
        let d: string;
        let tipX: number;
        if (side === "left") {
          // bottom-inner → bottom-corner → top-corner → top-inner
          d = `M ${CW} ${svgH} L 0 ${svgH} L 0 0 L ${CW} 0`;
          tipX = CW;
        } else {
          d = `M ${svgW - CW} ${svgH} L ${svgW} ${svgH} L ${svgW} 0 L ${svgW - CW} 0`;
          tipX = svgW - CW;
        }

        const bPath = document.createElementNS(ns, "path") as SVGPathElement;
        bPath.setAttribute("d", d);
        bPath.setAttribute("fill", "none");
        bPath.setAttribute("stroke", `url(#${gradId})`);
        bPath.setAttribute("stroke-width", "2.5");
        bPath.setAttribute("stroke-linecap", "round");
        bPath.setAttribute("stroke-linejoin", "round");
        bPath.style.filter = `drop-shadow(0 0 5px ${accentDim})`;

        // Dot luminoso al top-inner (giunzione con thread)
        const dot = document.createElementNS(ns, "circle") as SVGCircleElement;
        dot.setAttribute("cx", String(tipX));
        dot.setAttribute("cy", "0");
        dot.setAttribute("r", "3.5");
        dot.setAttribute("fill", accent);
        dot.style.opacity = "0";
        dot.style.filter = `drop-shadow(0 0 7px ${accent})`;

        bSvg.appendChild(bPath); bSvg.appendChild(dot);
        card.appendChild(bSvg);
        if (managed) _peekEls.push(bSvg);

        const len = bPath.getTotalLength();
        bPath.setAttribute("stroke-dasharray", String(len));
        bPath.setAttribute("stroke-dashoffset", String(len));

        const holdDelay = withThreads ? 1.1 : 0.5;
        const bTl = gsap.timeline({ delay: i * 0.14 });
        bTl.to(bPath, { attr: { "stroke-dashoffset": 0 }, duration: 0.65, ease: "power2.inOut" });
        bTl.set(dot, { opacity: 1 }, "-=0.08");
        bTl.fromTo(dot, { attr: { r: "0" } }, { attr: { r: "3.5" }, duration: 0.22, ease: "back.out(3)" }, "<");
        bTl.to({}, { duration: holdDelay });
        bTl.to([bPath, dot], {
          opacity: 0, duration: 0.3, ease: "power2.in",
          onComplete() {
            bSvg.remove();
            if (managed) _peekEls = _peekEls.filter((el) => el !== bSvg);
          },
        });
      }

      // ── THREAD: fixed overlay da bracket-top-inner → nav button / dropdown ──
      if (withThreads) {
        const isMobileThread = window.matchMedia("(max-width: 40rem)").matches;
        // Mobile: un solo thread verso il dropdown trigger; saltiamo i mode successivi
        if (isMobileThread && i > 0) return;

        const targetBtn = isMobileThread
          ? document.querySelector<HTMLElement>("#mode-dropdown-btn")
          : document.querySelector<HTMLElement>(`[data-nav-mode="${mode}"]`);
        if (!targetBtn) return;

        const nRect = targetBtn.getBoundingClientRect();
        if (!nRect.width && !nRect.height) return; // elemento nascosto
        const nx = nRect.left + nRect.width / 2;
        const ny = nRect.top + nRect.height / 2;

        // Posizione viewport del top-inner del bracket
        // (rect è già letto dopo scale:1, quindi è accurata)
        let startX: number;
        if (side === "left") startX = rect.left - O + CW;
        else if (side === "right") startX = rect.right + O - CW;
        else startX = rect.left + rect.width / 2;
        const startY = rect.top - O;

        const cpx = startX + (nx - startX) * 0.25;
        const cpy = startY - Math.abs(startY - ny) * 0.45;

        const tSvg = document.createElementNS(ns, "svg") as SVGSVGElement;
        const tPath = document.createElementNS(ns, "path") as SVGPathElement;
        Object.assign(tSvg.style, {
          position: "fixed",
          inset: "0",
          width: "100dvw",
          height: "100dvh",
          pointerEvents: "none",
          zIndex: "9991",
          overflow: "visible",
        });

        tPath.setAttribute("d", `M ${startX} ${startY} Q ${cpx} ${cpy} ${nx} ${ny}`);
        tPath.setAttribute("fill", "none");
        tPath.setAttribute("stroke", accent);
        tPath.setAttribute("stroke-width", "1.5");
        tPath.setAttribute("stroke-linecap", "round");
        tPath.style.opacity = "0.8";
        tPath.style.filter = `drop-shadow(0 0 4px ${accent.replace("1)", "0.5)")})`;

        tSvg.appendChild(tPath);
        document.body.appendChild(tSvg);
        if (managed) _peekEls.push(tSvg);

        const tLen = tPath.getTotalLength();
        tPath.setAttribute("stroke-dasharray", String(tLen));
        tPath.setAttribute("stroke-dashoffset", String(tLen));

        // Il thread parte dopo che il bracket ha raggiunto il top (~0.65s + stagger)
        const tDelay = (i * 0.14) + 0.55;
        gsap.to(tPath, {
          attr: { "stroke-dashoffset": 0 },
          duration: 0.45,
          delay: tDelay,
          ease: "power2.inOut",
          onComplete() {
            gsap.to(tPath, {
              attr: { "stroke-dashoffset": -tLen },
              duration: 0.35,
              delay: 0.9,
              ease: "power2.in",
              onComplete() {
                tSvg.remove();
                if (managed) _peekEls = _peekEls.filter((el) => el !== tSvg);
              },
            });
          },
        });
      }
    });
  }

  document.querySelectorAll<HTMLElement>(".cv-card[data-tags]").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (card.dataset.state === "peeking") return;

      // Il toggle "Leggi tutto" (project-card__desc) e il link titolo devono
      // solo espandere/navigare, mai innescare il peek: altrimenti il click
      // per leggere la descrizione lanciava anche l'animazione verso la
      // navbar, mascherando l'espansione (bug segnalato: "non espandibili").
      const target = e.target as HTMLElement;
      if (target.closest(".project-card__desc, .project-card__name a")) return;

      const tags = (card.dataset.tags ?? "").split(" ");
      // Ricalcolato dai tag reali vs il mode corrente, MAI fidato del solo
      // data-state: è lo stesso identico controllo di applyCardStates
      // (mode-helpers.ts), che è la fonte di verità per active/passive.
      // Leggere data-state qui duplicava quella logica con un'copia che
      // poteva disallinearsi (es. dopo un resetPeek) — una card già attiva
      // per il mode corrente finiva comunque trattata come "passiva" e
      // faceva scattare il peek/freccia verso la navbar anche se non doveva.
      const currentMode = document.documentElement.dataset.mode;
      const isPassive = !currentMode || !tags.includes(currentMode);
      const modes = CV_MODE_KEYS.filter((m) => tags.includes(m));
      if (!modes.length) return;

      e.stopPropagation();

      if (isPassive) {
        resetPeek();
        _peekCard = card;
        card.dataset.state = "peeking";

        // Porta subito la card a scale:1 e opacity:1 per leggere il rect corretto,
        // poi anima solo le proprietà visive (box-shadow, borderColor).
        gsap.set(card, { scale: 1, opacity: 1 });
        const rect = card.getBoundingClientRect();

        if (!reducedMotionPeek) {
          const glowLayers = modes.map((m) => {
            const c = PEEK_ACCENT[m];
            return `0 0 22px ${c.replace("1)", "0.22)")}, 0 0 8px ${c.replace("1)", "0.1)")}`;
          }).join(", ");
          gsap.fromTo(card,
            { borderColor: "rgba(255,255,255,0.12)", boxShadow: "none" },
            { borderColor: PEEK_ACCENT[modes[0]], boxShadow: glowLayers, duration: 0.4, ease: "power2.out" },
          );
        }

        // Nav punch: desktop → ogni pulsante; mobile → dropdown trigger (una sola volta)
        if (!reducedMotionPeek) {
          const isMobileNavPunch = window.matchMedia("(max-width: 40rem)").matches;
          if (isMobileNavPunch) {
            const dropdownTrigger = document.querySelector<HTMLElement>("#mode-dropdown-btn");
            if (dropdownTrigger) {
              const accent = PEEK_ACCENT[modes[0]];
              gsap.timeline()
                .to(dropdownTrigger, { scale: 1.08, duration: 0.18, ease: "power2.out" })
                .to(dropdownTrigger, { scale: 1, duration: 0.4, ease: "elastic.out(1.8, 0.4)" })
                .to(dropdownTrigger, { boxShadow: `0 0 20px ${accent.replace("1)", "0.55)")}`, duration: 0.28, yoyo: true, repeat: 1, repeatDelay: 1.2 }, "<");
            }
          } else {
            modes.forEach((mode, i) => {
              const navBtn = document.querySelector<HTMLElement>(`[data-nav-mode="${mode}"]`);
              if (!navBtn) return;
              const accent = PEEK_ACCENT[mode];
              const abbr = navBtn.querySelector<HTMLElement>(".mode-btn__abbr");
              const label = navBtn.querySelector<HTMLElement>(".mode-btn__label");
              const tl = gsap.timeline({ delay: i * 0.12 });
              tl.to(navBtn, { scale: 1.15, duration: 0.18, ease: "power2.out" })
                .to(navBtn, { scale: 1, duration: 0.4, ease: "elastic.out(1.8, 0.4)" });
              if (abbr) tl.to(abbr, { color: accent, duration: 0.28, yoyo: true, repeat: 1, repeatDelay: 1.55 }, "<");
              if (label) tl.to(label, { color: accent, duration: 0.28, yoyo: true, repeat: 1, repeatDelay: 1.55 }, "<");
            });
          }
        }

        drawConnectors(card, rect, modes, true, true);
        _peekTimer = setTimeout(resetPeek, 3500);
        _scrollCancel = () => resetPeek();
        window.addEventListener("scroll", _scrollCancel, { once: true, passive: true });

      }
    });
  });

  document.addEventListener("click", () => { if (_peekCard) resetPeek(); });
}

// (Lazy-load di SkillForceGraph + listener dei bottoni vista skill: vedi
// ensureGraphLoaded/applySkillsView più in alto in questo file.)

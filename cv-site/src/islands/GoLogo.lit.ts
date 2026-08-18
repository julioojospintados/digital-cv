import { LitElement, html, css } from "lit";
import { gsap } from "gsap";
import { modeStore, type Mode } from "./stores/modeStore.ts";
import { markIntroSeen } from "../scripts/intro-seen.ts";

/**
 * <go-logo>
 *
 * Brand logo "GO" (Giulio Occhipinti) che reagisce al mode attivo:
 *  - TECH       → G e O con bagliore cyan
 *  - CREATIVE   → G e O con gradiente orange animato
 *  - HUMAN      → G e O con glow gold
 *  - MANAGEMENT → G e O con glow violet
 *
 * Click → Master Reset: torna alla landing / con gli oggetti knolling in stato neutro.
 */
class GoLogo extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
    }

    button {
      background: transparent;
      border: 1px solid transparent;
      border-radius: 1px;
      padding: 0.25rem 0.4rem;
      /* cursor: none segue il cursore custom globale */
      cursor: none;
      display: inline-flex;
      align-items: baseline;
      gap: 0;
      font-family: var(--font-display, "Lexend", ui-sans-serif, sans-serif);
      line-height: 1;
      transition:
        border-color 0.2s ease,
        background-color 0.2s ease;
    }

    button:hover {
      border-color: var(--color-accent, rgba(0, 255, 200, 1));
      background-color: rgba(255, 255, 255, 0.06);
    }

    .go-g,
    .go-o {
      display: inline-block;
      font-size: var(--fs-24);
      font-weight: 800;
      letter-spacing: -0.03em;
      color: var(--color-text-primary, rgba(245, 240, 230, 1));
      transition:
        color 0.4s ease,
        text-shadow 0.4s ease,
        filter 0.4s ease;
      will-change: filter, text-shadow, color;
    }

    /* ── TECH: G e O brilla cyan ─────────────────────────────── */
    :host([data-mode="tech"]) .go-g,
    :host([data-mode="tech"]) .go-o {
      color: rgba(0, 255, 200, 1);
      text-shadow:
        0 0 0.375rem rgba(0, 255, 200, 1),
        0 0 1.125rem rgba(0, 255, 200, 0.55),
        0 0 2.25rem rgba(0, 255, 200, 0.2);
    }

    /* ── CREATIVE: G e O con gradiente orange animato ─────────── */
    :host([data-mode="creative"]) .go-g,
    :host([data-mode="creative"]) .go-o {
      color: transparent;
      background: linear-gradient(135deg, rgba(255, 107, 53, 1) 0%, rgba(255, 200, 50, 1) 100%);
      -webkit-background-clip: text;
      background-clip: text;
      animation: go-orange-pulse 2.2s ease-in-out infinite;
    }

    @keyframes go-orange-pulse {
      0%,
      100% {
        filter: brightness(1) drop-shadow(0 0 0 rgba(255, 107, 53, 0));
      }
      50% {
        filter: brightness(1.3) drop-shadow(0 0 0.5rem rgba(255, 107, 53, 0.75));
      }
    }

    /* ── HUMAN: G e O entrambe gold ──────────────────────────── */
    :host([data-mode="human"]) .go-g,
    :host([data-mode="human"]) .go-o {
      color: rgba(240, 200, 127, 1);
      text-shadow:
        0 0 0.3125rem rgba(240, 200, 127, 0.6),
        0 0 0.875rem rgba(240, 200, 127, 0.3);
    }

    /* ── MANAGEMENT: G e O entrambe violet ──────────────────── */
  `;

  private _mode: Mode = modeStore.get();
  private _unsub?: () => void;

  connectedCallback() {
    super.connectedCallback();
    // Imposta data-mode sull'host subito (prima del render) per evitare flash
    this.setAttribute("data-mode", this._mode);

    this._unsub = modeStore.subscribe((m) => {
      this._mode = m;
      this.setAttribute("data-mode", m);
      this.requestUpdate();
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._unsub?.();
  }

  private _launching = false;

  private _handleClick() {
    // Master Reset: torna alla landing con stato neutro. Stessa animazione
    // "warp launch" dei bottoni "GO to..." della home (index-init.ts
    // launchJourney) — un reload nudo lasciava vedere GO comparire subito e
    // nome/card "assestarsi" con un beat di ritardo dietro: un transition
    // intenzionale maschera quel riassemblaggio invece di esporlo.
    if (this._launching) return;
    this._launching = true;
    this._launchHome();
  }

  private _launchHome() {
    // Un ritorno via logo non è mai un primo atterraggio: marca l'intro come
    // vista PRIMA di navigare, così la home salta il rituale G-O anche se in
    // questa sessione non è ancora stata visitata (es. arrivo diretto su
    // /tech da un link esterno). Il warp qui sotto È la transizione: farla
    // seguire dal preloader sarebbe raccontare due arrivi di fila.
    markIntroSeen();

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.location.href = "/";
      return;
    }

    document.body.style.pointerEvents = "none";

    // Overlay e speed-line vivono fuori da <body> (figli diretti di <html>):
    // così restano nitidi anche se sfumiamo/scaliamo #main-content, e
    // funzionano identici su qualunque pagina (mode, work, case study) senza
    // dipendere da markup home-specifico come #launch-overlay.
    const overlay = document.createElement("div");
    Object.assign(overlay.style, {
      position: "fixed",
      inset: "0",
      background: "rgba(0,0,0,0.92)",
      opacity: "0",
      zIndex: "99998",
      pointerEvents: "none",
    });
    document.documentElement.appendChild(overlay);

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
      document.documentElement.appendChild(line);
      lineEls.push(line);
    }

    // #main-content (presente su ogni pagina, obbligatorio per lo skip-link)
    // invece di document.body: scalare/sfumare l'intero body sposterebbe il
    // containing block degli elementi position:fixed (cursor custom, FAB,
    // nav) causando salti visivi — #main-content è sempre un sibling di nav/FAB.
    const main = document.getElementById("main-content");

    const journey = gsap.timeline({
      onComplete: () => {
        lineEls.forEach((l) => l.remove());
        overlay.remove();
      },
    });

    const isTouchDevice = !window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    const phase1Duration = isTouchDevice ? 0.55 : 0.6;
    const phase1Stagger = isTouchDevice ? 0.02 : 0.018;
    const phase2Duration = isTouchDevice ? 0.25 : 0.5;
    const phase3Duration = isTouchDevice ? 0.35 : 0.35;
    const phase3Stagger = isTouchDevice ? 0.012 : 0.009;
    const blurStart = isTouchDevice ? 0.4 : 0.5;
    const vignetteStart = isTouchDevice ? 0.75 : 0.9;
    const navigateAt = isTouchDevice ? vignetteStart + 0.28 : vignetteStart + 0.4;

    // Fase 1: comparsa — le speed-line "sparano" verso l'esterno
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
    // Fase 2: hold visibile prima di sparire
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
    if (main) {
      journey.to(
        main,
        {
          opacity: 0,
          scale: 0.85,
          filter: "blur(10px)",
          duration: phase3Duration,
          ease: "power3.in",
        },
        blurStart,
      );
    }

    // Vignette scura chiude la scena
    journey.to(overlay, { opacity: 1, duration: 0.5, ease: "power2.inOut" }, vignetteStart);

    // Naviga quando la vignette è abbastanza scura — non aspettare il completamento
    journey.call(
      () => {
        window.location.href = "/";
      },
      undefined,
      navigateAt,
    );
  }

  render() {
    return html`
      <button
        @click=${this._handleClick}
        aria-label="GO — Torna all'ingresso"
        title="Master Reset — torna alla landing"
      >
        <span class="go-g">G</span><span class="go-o">O</span>
      </button>
    `;
  }
}

if (!customElements.get("go-logo")) {
  customElements.define("go-logo", GoLogo);
}

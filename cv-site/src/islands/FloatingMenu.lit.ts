import { LitElement, html, css } from "lit";
import { modeStore } from "./stores/modeStore.js";

/**
 * <floating-menu>
 *
 * FAB (Floating Action Button) con 3 voci espandibili:
 *  - Contattami → mailto
 *  - Feedback    → mailto pre-compilata
 *  - AI Workflow → ancora alla sezione AI della pagina corrente
 *
 * Mode-reactive: colore del trigger segue --color-accent.
 * Chiude con click fuori o con Escape.
 */
class FloatingMenu extends LitElement {
  static styles = css`
    :host {
      /* Posizionamento gestito dal light DOM CSS in global.css.            */
      /* display: block — il trigger occupa solo 3.1rem x 3.1rem.          */
      /* .fab-items e .feedback-panel sono position:absolute e NON occupano */
      /* spazio nel flusso (evita il box invisibile di ~110px sopra il FAB).*/
      display: block;
      pointer-events: none;
    }

    /* ── Trigger button ── */
    .fab-trigger {
      width: 3.1rem;
      height: 3.1rem;
      border-radius: 50%;
      /* Gradient radiale: luce accent in alto + ottanio base — comunica
         chiaramente che il FAB è cliccabile senza perdere il contrasto. */
      background: radial-gradient(
        circle at 46% 38%,
        color-mix(in srgb, var(--color-accent, rgba(0, 255, 200, 1)) 33%, rgba(14, 90, 82, 0.98)),
        rgba(8, 73, 67, 0.97)
      );
      border: none;
      cursor: none;
      pointer-events: all;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow:
        0 0 18px color-mix(in srgb, var(--color-accent, rgba(0,255,200,1)) 38%, transparent),
        0 4px 18px rgba(0, 0, 0, 0.45);
      transition:
        transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
        box-shadow 0.3s ease;
      will-change: transform;
      flex-shrink: 0;
      position: relative;
    }

    .fab-trigger:hover {
      transform: scale(1.1);
      background: radial-gradient(
        circle at 46% 38%,
        color-mix(in srgb, var(--color-accent, rgba(0, 255, 200, 1)) 26%, rgba(14, 90, 82, 0.98)),
        rgba(8, 73, 67, 0.97) 58%
      );
      box-shadow:
        0 0 32px color-mix(in srgb, var(--color-accent, rgba(0,255,200,1)) 55%, transparent),
        0 4px 22px rgba(0, 0, 0, 0.5);
    }

    /* ── Icon swap (✦ ↔ ✕) ── */
    .fab-icon {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-accent, rgba(0, 255, 200, 1)); /* accent su ottanio — legibile in tutti i mode */
      font-size: 1.25rem;
      font-weight: 900;
      line-height: 1.5;
      transition:
        opacity 0.18s ease,
        transform 0.28s ease;
    }

    .fab-icon--open {
      opacity: 0;
      transform: rotate(-45deg) scale(0.7);
    }
    .fab-icon--close {
      opacity: 0;
      transform: rotate(45deg) scale(0.7);
    }

    :host([open]) .fab-icon--open {
      opacity: 1;
      transform: rotate(0deg) scale(1);
    }
    :host([open]) .fab-icon--close {
      opacity: 0;
    }
    :host(:not([open])) .fab-icon--open {
      opacity: 0;
    }
    :host(:not([open])) .fab-icon--close {
      opacity: 1;
      transform: rotate(0deg) scale(1);
    }

    /* ── Items container — absolute per non occupare spazio nel flusso ── */
    /* bottom: 3.1rem (trigger) + 0.65rem (gap) = 3.75rem                  */
    .fab-items {
      position: absolute;
      right: 0;
      bottom: 3.75rem;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.5rem;
      pointer-events: none;
    }

    /* ── Single item ── */
    .fab-item {
      display: flex;
      align-items: center;
      gap: 0.55rem;
      padding: 0.42rem 1.05rem;
      border-radius: 100px;
      background: rgba(8, 73, 67, 0.96);
      border: 1px solid
        color-mix(
          in srgb,
          var(--color-accent, rgba(0, 255, 200, 1)) 40%,
          transparent
        );
      color: var(--color-text-primary, rgba(245, 240, 230, 1));
      font-family: "Lexend", ui-sans-serif, sans-serif;
      font-size: 0.875rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      text-decoration: none;
      cursor: none;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      white-space: nowrap;
      pointer-events: none;

      /* Hidden state */
      opacity: 0;
      transform: translateY(12px) scale(0.88);
      transition:
        opacity 0.24s ease,
        transform 0.24s cubic-bezier(0.34, 1.56, 0.64, 1),
        border-color 0.2s ease,
        background 0.2s ease;
    }

    .fab-item:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: var(--color-accent, rgba(0, 255, 200, 0.7));
    }

    .fab-item__icon {
      font-size: 1rem;
      line-height: 1.5;
    }

    /* ── Open state: items appear with stagger ── */
    :host([open]) .fab-items {
      pointer-events: all;
    }

    :host([open]) .fab-item {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: all;
    }

    :host([open]) .fab-item:nth-child(1) {
      transition-delay: 0.04s;
    }
    :host([open]) .fab-item:nth-child(2) {
      transition-delay: 0.08s;
    }
    :host([open]) .fab-item:nth-child(3) {
      transition-delay: 0.12s;
    }

    /* ── Pulse ring (attrae l'attenzione quando chiuso) ── */
    @keyframes fab-ring-pulse {
      0% {
        box-shadow:
          0 0 0 0 color-mix(in srgb, var(--color-accent, rgba(0,255,200,1)) 45%, transparent),
          0 0 18px color-mix(in srgb, var(--color-accent, rgba(0,255,200,1)) 22%, transparent);
      }
      70% {
        box-shadow:
          0 0 0 14px transparent,
          0 0 0px transparent;
      }
      100% {
        box-shadow:
          0 0 0 0 transparent,
          0 0 0px transparent;
      }
    }

    :host(:not([open])) .fab-trigger {
      animation: fab-ring-pulse 3.5s ease-in-out infinite;
      animation-delay: 2s;
    }

    /* ── Mobile adjustments ── */
    @media (max-width: 40rem) {
      .fab-trigger {
        width: 3rem;
        height: 3rem;
        touch-action: manipulation;
      }
      .fab-item {
        touch-action: manipulation;
      }
    }

    /* ── Feedback panel — absolute come .fab-items ── */
    .feedback-panel {
      position: absolute;
      right: 0;
      bottom: 3.75rem;
      width: 15rem;
      background: rgba(8, 73, 67, 0.97);
      border: 1px solid
        color-mix(
          in srgb,
          var(--color-accent, rgba(0, 255, 200, 1)) 40%,
          transparent
        );
      /* custom property attraversa lo Shadow DOM — token in global.css */
      border-radius: var(--radius-16, 1rem);
      padding: 1rem;
      backdrop-filter: blur(16px);
      pointer-events: all;
    }
    .fp-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.65rem;
    }
    .fp-title {
      font-family: "Lexend", sans-serif;
      font-size: 0.875rem;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--color-accent, rgba(0, 255, 200, 1));
    }
    .fp-close {
      background: none;
      border: none;
      cursor: pointer;
      color: rgba(192, 220, 215, 0.6);
      font-size: 0.875rem;
      line-height: 1.5;
      padding: 0;
      display: flex;
      align-items: center;
    }
    .fp-close:hover {
      color: rgba(245, 240, 230, 1);
    }
    .fp-input,
    .fp-textarea {
      width: 100%;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 0.35rem;
      color: rgba(245, 240, 230, 1);
      font-family: "Lexend", sans-serif;
      font-size: 0.875rem;
      padding: 0.45rem 0.6rem;
      margin-bottom: 0.5rem;
      box-sizing: border-box;
      transition: border-color 0.2s ease;
      resize: none;
    }
    .fp-input {
      cursor: text;
    }
    .fp-textarea {
      height: 4rem;
      cursor: text;
    }
    .fp-input::placeholder,
    .fp-textarea::placeholder {
      color: rgba(192, 220, 215, 0.4);
    }
    .fp-input:focus,
    .fp-textarea:focus {
      outline: none;
      border-color: color-mix(
        in srgb,
        var(--color-accent, rgba(0, 255, 200, 1)) 60%,
        transparent
      );
    }
    .fp-submit {
      width: 100%;
      background: color-mix(
        in srgb,
        var(--color-accent, rgba(0, 255, 200, 1)) 20%,
        transparent
      );
      border: 1px solid var(--color-accent, rgba(0, 255, 200, 1));
      border-radius: 0.35rem;
      color: var(--color-accent, rgba(0, 255, 200, 1));
      font-family: "Lexend", sans-serif;
      font-size: 0.875rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 0.5rem;
      cursor: pointer;
      transition: background 0.2s ease;
    }
    .fp-submit:hover {
      background: color-mix(
        in srgb,
        var(--color-accent, rgba(0, 255, 200, 1)) 35%,
        transparent
      );
    }
    .fp-sent {
      text-align: center;
      font-family: "Lexend", sans-serif;
      font-size: 0.875rem;
      color: var(--color-accent, rgba(0, 255, 200, 1));
      padding: 0.5rem 0;
    }
    .fp-hint {
      font-family: "Lexend", sans-serif;
      font-size: 0.875rem;
      color: rgba(192, 220, 215, 0.4);
      text-align: center;
      margin-top: 0.45rem;
    }
    /* ── Session badge ── */
    .fab-badge {
      position: absolute;
      top: -3px;
      right: -3px;
      width: 1rem;
      height: 1rem;
      border-radius: 50%;
      background: rgba(0, 255, 200, 1);
      color: rgba(8, 73, 67, 1);
      font-family: "Lexend", sans-serif;
      font-size: 0.875rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1.5px solid rgba(8, 73, 67, 1);
    }
  `;

  private _open = false;
  private _unsub?: () => void;
  private _showFeedback = false;
  private _feedbackSent = false;
  private _draftName = "";
  private _draftNote = "";
  private static DRAFT_KEY = "cv-feedback-draft";

  connectedCallback() {
    super.connectedCallback();
    this._unsub = modeStore.subscribe(() => {
      this.requestUpdate();
    });
    document.addEventListener("click", this._handleOutsideClick);
    document.addEventListener("keydown", this._handleKeydown);

    // Load saved draft (if any) from sessionStorage so the input is preserved
    if (typeof window !== "undefined") {
      try {
        const draft = JSON.parse(
          sessionStorage.getItem(FloatingMenu.DRAFT_KEY) ?? "null",
        );
        if (draft && typeof draft === "object") {
          this._draftName = draft.name ?? "";
          this._draftNote = draft.note ?? "";
        }
      } catch {
        /* noop */
      }
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._unsub?.();
    document.removeEventListener("click", this._handleOutsideClick);
    document.removeEventListener("keydown", this._handleKeydown);
  }

  private _toggle() {
    this._open = !this._open;
    if (this._open) {
      this.setAttribute("open", "");
    } else {
      this.removeAttribute("open");
      this._showFeedback = false;
      this._feedbackSent = false;
    }
    this.requestUpdate();
  }

  private _handleOutsideClick = (e: Event) => {
    if (this._open && !e.composedPath().includes(this)) {
      this._open = false;
      this.removeAttribute("open");
      this._showFeedback = false;
      this._feedbackSent = false;
      this.requestUpdate();
    }
  };

  private _handleKeydown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && this._open) {
      this._open = false;
      this.removeAttribute("open");
      this._showFeedback = false;
      this._feedbackSent = false;
      this.requestUpdate();
    }
  };

  private _closeOnNav() {
    this._open = false;
    this.removeAttribute("open");
    this._showFeedback = false;
    this._feedbackSent = false;
    this.requestUpdate();
  }

  private _handleContact = (e: Event) => {
    // Avoid flaky behavior caused by menu re-render before anchor default navigation.
    e.preventDefault();
    this._closeOnNav();
    try {
      window.location.href = "mailto:giulio.occhipinti.g@gmail.com";
    } catch {
      window.open("mailto:giulio.occhipinti.g@gmail.com", "_self");
    }
  };

  private _openFeedback() {
    // Ensure draft is loaded before showing the panel
    this._loadDraft();
    this._showFeedback = true;
    this._feedbackSent = false;
    this.requestUpdate();
  }

  private _closeFeedback() {
    this._showFeedback = false;
    this._feedbackSent = false;
    this.requestUpdate();
  }

  private _saveDraft() {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.setItem(
        FloatingMenu.DRAFT_KEY,
        JSON.stringify({ name: this._draftName, note: this._draftNote }),
      );
    } catch {
      // ignore storage errors
    }
  }

  private _loadDraft() {
    if (typeof window === "undefined") return;
    try {
      const draft = JSON.parse(
        sessionStorage.getItem(FloatingMenu.DRAFT_KEY) ?? "null",
      );
      if (draft && typeof draft === "object") {
        this._draftName = draft.name ?? "";
        this._draftNote = draft.note ?? "";
      }
    } catch {
      /* noop */
    }
  }

  private _onNameInput = (e: Event) => {
    const t = e.target as HTMLInputElement;
    this._draftName = t?.value ?? "";
    this._saveDraft();
  };

  private _onNoteInput = (e: Event) => {
    const t = e.target as HTMLTextAreaElement;
    this._draftNote = t?.value ?? "";
    this._saveDraft();
  };

  private _submitFeedback() {
    const nameInput =
      this.renderRoot.querySelector<HTMLInputElement>("#fp-name");
    const noteInput =
      this.renderRoot.querySelector<HTMLTextAreaElement>("#fp-note");
    const name = nameInput?.value.trim() ?? "";
    const note = noteInput?.value.trim() ?? "";
    if (!note) return;

    // Persist to sessionStorage so the badge updates
    try {
      const feedbacks: unknown[] = JSON.parse(
        sessionStorage.getItem("cv-feedbacks") ?? "[]",
      );
      feedbacks.push({ timestamp: new Date().toISOString(), name, note });
      sessionStorage.setItem("cv-feedbacks", JSON.stringify(feedbacks));
    } catch {
      // sessionStorage blocked — proceed anyway
    }

    // Open mailto with pre-filled content — zero infrastructure required
    const subject = encodeURIComponent(
      "Feedback — CV Digitale Giulio Occhipinti",
    );
    const nameStr = name ? `Da: ${name}` : "Feedback anonimo";
    const body = encodeURIComponent(`${nameStr}\n\n${note}`);
    window.open(
      `mailto:giulio.occhipinti.g@gmail.com?subject=${subject}&body=${body}`,
      "_blank",
    );

    // Clear saved draft after sending
    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem(FloatingMenu.DRAFT_KEY);
      } catch { }
    }
    this._draftName = "";
    this._draftNote = "";

    this._feedbackSent = true;
    this.requestUpdate();
  }

  private async _handleAI(e: Event) {
    // Robust navigation to #ai-section: prevent default, close menu,
    // wait a frame for layout, then smooth-scroll (Lenis aware) and focus.
    if (typeof window === "undefined") return;
    e.preventDefault();

    this._closeOnNav();

    // Allow potential layout changes to settle (one RAF)
    await new Promise((res) => requestAnimationFrame(res));

    const target = document.getElementById("ai-section");
    if (!target) {
      // Fallback: navigate via href if section missing
      const href = (e.currentTarget as HTMLAnchorElement)?.getAttribute("href");
      if (href) window.location.href = href;
      return;
    }

    const NAV_HEIGHT = (() => {
      const nav = document.querySelector("#cv-nav");
      return nav ? (nav as HTMLElement).getBoundingClientRect().height : 52;
    })();
    const lenis = window.__lenis;

    // Calcola absoluteTop usando offsetTop (non affetto da GSAP transform: translateY)
    // getBoundingClientRect() includerebbe il translateY(32px) degli elementi pre-reveal
    // causando una destinazione sbagliata al primo click.
    const getOffsetTop = (el: HTMLElement): number => {
      let top = 0;
      let current: HTMLElement | null = el;
      while (current) {
        top += current.offsetTop;
        current = current.offsetParent as HTMLElement | null;
      }
      return top;
    };
    const absoluteTop = getOffsetTop(target) - NAV_HEIGHT;

    const waitForArrival = (targetY: number) =>
      new Promise<void>((resolve) => {
        let rafId: number | null = null;
        const timeoutId = window.setTimeout(() => {
          if (rafId) cancelAnimationFrame(rafId);
          resolve();
        }, 1600);

        const check = () => {
          const currentY = window.scrollY || window.pageYOffset || 0;
          if (Math.abs(currentY - targetY) <= 6 || (window.innerHeight + currentY) >= document.body.scrollHeight) {
            clearTimeout(timeoutId);
            if (rafId) cancelAnimationFrame(rafId);
            resolve();
            return;
          }
          rafId = requestAnimationFrame(check);
        };
        rafId = requestAnimationFrame(check);
      });

    try {
      if (lenis && typeof lenis.scrollTo === "function") {
        lenis.scrollTo(absoluteTop, { duration: 1.0 });
        await waitForArrival(absoluteTop);
      } else {
        window.scrollTo({ top: absoluteTop, behavior: "smooth" });
        await waitForArrival(absoluteTop);
      }
    } catch {
      window.scrollTo({ top: absoluteTop, behavior: "smooth" });
      await waitForArrival(absoluteTop);
    }

    try {
      target.setAttribute("tabindex", "-1");
      (target as HTMLElement).focus({ preventScroll: true });
    } catch {
      /* noop */
    }
  }

  render() {
    // Guard window/sessionStorage access for SSR compatibility (window is undefined in Node.js)
    const isClient = typeof window !== "undefined";

    // i18n: legge il lang dal <html lang="..."> — fallback IT
    const lang = isClient ? (document.documentElement.lang ?? "it") : "it";
    const isEN = lang === "en";

    const t = {
      contactLabel: isEN ? "Contact me" : "Contattami",
      contactAriaLabel: isEN ? "Send email to Giulio" : "Invia email a Giulio",
      feedbackLabel: isEN ? "Feedback" : "Feedback",
      feedbackAriaLabel: isEN ? "Leave feedback" : "Lascia un feedback",
      aiLabel: isEN ? "AI Workflow" : "AI Workflow",
      aiAriaLabel: isEN ? "AI Workflow — how AI amplifies the work" : "AI Workflow — come l'AI amplifica il lavoro",
      fpAriaLabel: isEN ? "Feedback form" : "Modulo feedback",
      fpClose: isEN ? "Close" : "Chiudi",
      fpSent: isEN ? "✓ Thanks! Opening email…" : "✓ Grazie! Apertura email…",
      fpHintSent: isEN ? "Send the message in your email client." : "Invia il messaggio nel client di posta che si è aperto.",
      fpNamePlaceholder: isEN ? "Name (optional)" : "Nome (opzionale)",
      fpNotePlaceholder: isEN ? "Leave a comment…" : "Lascia un commento…",
      fpSubmit: isEN ? "Send" : "Invia",
      fpHint: isEN ? "Opens your email client — no database, no account required." : "Apre il tuo client email — nessun DB, nessun account richiesto.",
      menuOpen: isEN ? "Open contacts" : "Apri contatti",
      menuClose: isEN ? "Close contacts" : "Chiudi contatti",
      badgeTitle: (n: number) => isEN ? `${n} feedback sent this session` : `${n} feedback inviati in questa sessione`,
    };

    const isHome =
      isClient &&
      (window.location.pathname === "/" ||
        window.location.pathname === "/index" ||
        window.location.pathname === "/index.html");

    const href =
      isClient &&
        window.location.pathname.match(/^\/(tech|creative|human|management|cv|en)/)
        ? "#ai-section"
        : "/tech#ai-section";

    let feedbackCount = 0;
    if (isClient) {
      try {
        const stored = JSON.parse(
          sessionStorage.getItem("cv-feedbacks") ?? "[]",
        );
        feedbackCount = Array.isArray(stored) ? stored.length : 0;
      } catch {
        /* noop */
      }
    }

    return html`
      ${this._showFeedback
        ? html`
            <div
              class="feedback-panel"
              role="dialog"
              aria-label="${t.fpAriaLabel}"
            >
              <div class="fp-header">
                <span class="fp-title">✦ Feedback</span>
                <button
                  class="fp-close"
                  @click=${this._closeFeedback}
                  aria-label="${t.fpClose}"
                >
                  ✕
                </button>
              </div>
              ${this._feedbackSent
            ? html`
                    <p class="fp-sent">${t.fpSent}</p>
                    <p class="fp-hint">${t.fpHintSent}</p>
                  `
            : html`
                    <input
                      class="fp-input"
                      type="text"
                      id="fp-name"
                      placeholder="${t.fpNamePlaceholder}"
                      autocomplete="off"
                      .value=${this._draftName}
                      @input=${this._onNameInput}
                    />
                    <textarea
                      class="fp-textarea"
                      id="fp-note"
                      placeholder="${t.fpNotePlaceholder}"
                      .value=${this._draftNote}
                      @input=${this._onNoteInput}
                    ></textarea>
                    <button
                      class="fp-submit"
                      @click=${this._submitFeedback}
                      type="button"
                    >
                      ${t.fpSubmit}
                    </button>
                    <p class="fp-hint">${t.fpHint}</p>
                  `}
            </div>
          `
        : html`
            <div class="fab-items" ?inert="${!this._open}" aria-hidden="${!this._open}">
              <a
                class="fab-item"
                href="mailto:giulio.occhipinti.g@gmail.com"
                aria-label="${t.contactAriaLabel}"
                @click=${this._handleContact}
              >
                <span class="fab-item__icon">✉</span>
                <span>${t.contactLabel}</span>
              </a>
              <button
                class="fab-item"
                @click=${this._openFeedback}
                aria-label="${t.feedbackAriaLabel}"
                type="button"
              >
                <span class="fab-item__icon">✦</span>
                <span>${t.feedbackLabel}</span>
              </button>
              ${!isHome
            ? html`<a
                    class="fab-item"
                    href="${href}"
                    aria-label="${t.aiAriaLabel}"
                    @click=${this._handleAI}
                  >
                    <span class="fab-item__icon">✦</span>
                    <span>${t.aiLabel}</span>
                  </a>`
            : ""}
            </div>
          `}

      <button
        class="fab-trigger"
        @click=${this._toggle}
        aria-label="${this._open ? t.menuClose : t.menuOpen}"
        aria-expanded="${this._open}"
        aria-haspopup="menu"
        type="button"
      >
        <span class="fab-icon fab-icon--open" aria-hidden="true">✕</span>
        <span class="fab-icon fab-icon--close" aria-hidden="true">
          <!-- Icona contatti: il FAB è l'hub per mail/telefono/canali futuri -->
          <svg viewBox="0 0 24 24" width="21" height="21" fill="currentColor">
            <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2.5c-3.34 0-10 1.67-10 5V21h20v-1.5c0-3.33-6.66-5-10-5z"/>
          </svg>
        </span>
        ${feedbackCount > 0
        ? html`
              <span
                class="fab-badge"
                title="${t.badgeTitle(feedbackCount)}"
              >
                ${feedbackCount}
              </span>
            `
        : ""}
      </button>
    `;
  }
}

customElements.define("floating-menu", FloatingMenu);

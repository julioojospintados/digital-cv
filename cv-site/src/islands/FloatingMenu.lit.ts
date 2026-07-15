import { LitElement, html, css } from "lit";
import { modeStore } from "./stores/modeStore.js";

/**
 * <floating-menu>
 *
 * FAB (Floating Action Button) con 4 voci espandibili:
 *  - WhatsApp   → wa.me (nuova scheda)
 *  - Chiamami   → tel:
 *  - Contattami → mailto (nuova scheda: se il gestore è webmail,
 *                 _self sostituirebbe il CV con la composizione)
 *  - Portfolio  → /work (o /en/work)
 *
 * (Le voci "AI Workflow" e "Feedback" sono state rimosse su richiesta,
 * 2026-07-13 e 2026-07-15: azioni di contatto immediato al loro posto.)
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
      font-size: var(--fs-20);
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
      font-size: var(--fs-14);
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
      font-size: var(--fs-16);
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
    :host([open]) .fab-item:nth-child(4) {
      transition-delay: 0.16s;
    }

    .fab-item__icon svg {
      display: block;
      width: 1rem;
      height: 1rem;
      fill: currentColor;
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

  `;

  private _open = false;
  private _unsub?: () => void;

  connectedCallback() {
    super.connectedCallback();
    this._unsub = modeStore.subscribe(() => {
      this.requestUpdate();
    });
    document.addEventListener("click", this._handleOutsideClick);
    document.addEventListener("keydown", this._handleKeydown);
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
    }
    this.requestUpdate();
  }

  private _handleOutsideClick = (e: Event) => {
    if (this._open && !e.composedPath().includes(this)) {
      this._closeOnNav();
    }
  };

  private _handleKeydown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && this._open) {
      this._closeOnNav();
    }
  };

  private _closeOnNav() {
    this._open = false;
    this.removeAttribute("open");
    this.requestUpdate();
  }

  private _handleContact = (e: Event) => {
    // Avoid flaky behavior caused by menu re-render before anchor default navigation.
    e.preventDefault();
    this._closeOnNav();
    // _blank: se il gestore di posta è webmail (Gmail nel browser), _self
    // sostituirebbe il CV con la composizione — il lettore non torna più.
    window.open("mailto:giulio.occhipinti.g@gmail.com", "_blank", "noopener");
  };

  render() {
    // Guard window access for SSR compatibility (window is undefined in Node.js)
    const isClient = typeof window !== "undefined";

    // i18n: legge il lang dal <html lang="..."> — fallback IT
    const lang = isClient ? (document.documentElement.lang ?? "it") : "it";
    const isEN = lang === "en";

    const t = {
      whatsappLabel: "WhatsApp",
      whatsappAria: isEN
        ? "Message Giulio on WhatsApp (opens in a new tab)"
        : "Scrivi a Giulio su WhatsApp (apre in nuova scheda)",
      callLabel: isEN ? "Call me" : "Chiamami",
      callAria: isEN ? "Call Giulio" : "Chiama Giulio",
      contactLabel: isEN ? "E-mail" : "E-mail",
      contactAriaLabel: isEN ? "Send email to Giulio" : "Invia email a Giulio",
      portfolioLabel: "Portfolio",
      portfolioAria: isEN ? "Explore the portfolio" : "Esplora il portfolio",
      menuOpen: isEN ? "Open contacts" : "Apri contatti",
      menuClose: isEN ? "Close contacts" : "Chiudi contatti",
    };

    // Icone inline currentColor: nessun glifo Unicode (il tratto dipenderebbe
    // dal font di sistema — stessa regola dei chevron nel design system).
    const icons = {
      whatsapp: html`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.6-6.1c-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.3-.6.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.4-3c-.3-.4 0-.5.1-.7l.4-.5c.1-.2.2-.3.3-.5v-.5c0-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5 0-.7.3-.2.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.8 2.8 4.4 3.9.6.3 1.1.4 1.5.6.6.2 1.2.2 1.6.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2 0-.1-.2-.2-.4-.3z"/></svg>`,
      phone: html`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15.9 15.9 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.3 0 .7-.2 1l-2.3 2.2z"/></svg>`,
      mail: html`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/></svg>`,
      folder: html`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-8l-2-2z"/></svg>`,
    };

    return html`
      <div class="fab-items" ?inert="${!this._open}" aria-hidden="${!this._open}">
        <a
          class="fab-item"
          href="https://wa.me/393738005769"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="${t.whatsappAria}"
          @click=${() => this._closeOnNav()}
        >
          <span class="fab-item__icon">${icons.whatsapp}</span>
          <span>${t.whatsappLabel}</span>
        </a>
        <a
          class="fab-item"
          href="tel:+393738005769"
          aria-label="${t.callAria}"
          @click=${() => this._closeOnNav()}
        >
          <span class="fab-item__icon">${icons.phone}</span>
          <span>${t.callLabel}</span>
        </a>
        <a
          class="fab-item"
          href="mailto:giulio.occhipinti.g@gmail.com"
          target="_blank"
          rel="noopener"
          aria-label="${t.contactAriaLabel}"
          @click=${this._handleContact}
        >
          <span class="fab-item__icon">${icons.mail}</span>
          <span>${t.contactLabel}</span>
        </a>
        <a
          class="fab-item"
          href="${isEN ? "/en/work" : "/work"}"
          aria-label="${t.portfolioAria}"
          @click=${() => this._closeOnNav()}
        >
          <span class="fab-item__icon">${icons.folder}</span>
          <span>${t.portfolioLabel}</span>
        </a>
      </div>

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
          <!-- Nuvoletta di messaggio con 3 puntini: comunica "contattami",
               non "profilo". I puntini sono subpath ritagliati via evenodd,
               nessun colore hardcoded. -->
          <svg viewBox="0 0 24 24" width="21" height="21" fill="currentColor">
            <path fill-rule="evenodd" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM8 9.6a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8zm4 0a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8zm4 0a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8z"/>
          </svg>
        </span>
      </button>
    `;
  }
}

customElements.define("floating-menu", FloatingMenu);

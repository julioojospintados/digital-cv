import { LitElement, html, css } from 'lit';
import { modeStore, type Mode } from './stores/modeStore.js';

/**
 * <go-logo>
 *
 * Brand logo "GO" (Giulio Occhipinti) che reagisce al mode attivo:
 *  - TECH       → G con bagliore cyan
 *  - CREATIVE   → O con gradiente orange animato
 *  - HUMAN      → entrambe le lettere con glow gold
 *  - MANAGEMENT → entrambe le lettere con glow violet
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
      font-family: var(--font-display, 'Lexend', ui-sans-serif, sans-serif);
      line-height: 1;
      transition: border-color 0.2s ease, background-color 0.2s ease;
    }

    button:hover {
      border-color: var(--color-accent, rgba(0, 255, 200, 1));
      background-color: rgba(255, 255, 255, 0.06);
    }

    .go-g,
    .go-o {
      display: inline-block;
      font-size: 1.5rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      color: var(--color-text-primary, rgba(245, 240, 230, 1));
      transition:
        color 0.4s ease,
        text-shadow 0.4s ease,
        filter 0.4s ease;
      will-change: filter, text-shadow, color;
    }

    /* ── TECH: G brilla cyan ─────────────────────────────────── */
    :host([data-mode='tech']) .go-g {
      color: rgba(0, 255, 200, 1);
      text-shadow:
        0 0 6px rgba(0, 255, 200, 1),
        0 0 18px rgba(0, 255, 200, 0.55),
        0 0 36px rgba(0, 255, 200, 0.2);
    }

    /* ── CREATIVE: O con gradiente orange animato ─────────────── */
    :host([data-mode='creative']) .go-o {
      color: transparent;
      background: linear-gradient(
        135deg,
        rgba(255, 107, 53, 1) 0%,
        rgba(255, 200, 50, 1) 100%
      );
      -webkit-background-clip: text;
      background-clip: text;
      animation: go-orange-pulse 2.2s ease-in-out infinite;
    }

    @keyframes go-orange-pulse {
      0%,
      100% {
        filter: brightness(1) drop-shadow(0 0 0px rgba(255, 107, 53, 0));
      }
      50% {
        filter: brightness(1.3)
          drop-shadow(0 0 8px rgba(255, 107, 53, 0.75));
      }
    }

    /* ── HUMAN: G e O entrambe gold ──────────────────────────── */
    :host([data-mode='human']) .go-g,
    :host([data-mode='human']) .go-o {
      color: rgba(240, 200, 127, 1);
      text-shadow:
        0 0 5px rgba(240, 200, 127, 0.6),
        0 0 14px rgba(240, 200, 127, 0.3);
    }

    /* ── MANAGEMENT: G e O entrambe violet ──────────────────── */
    :host([data-mode='management']) .go-g,
    :host([data-mode='management']) .go-o {
      color: rgba(180, 100, 255, 1);
      text-shadow:
        0 0 6px rgba(180, 100, 255, 1),
        0 0 18px rgba(180, 100, 255, 0.55),
        0 0 36px rgba(180, 100, 255, 0.2);
    }
  `;

  private _mode: Mode = modeStore.get();
  private _unsub?: () => void;

  connectedCallback() {
    super.connectedCallback();
    // Imposta data-mode sull'host subito (prima del render) per evitare flash
    this.setAttribute('data-mode', this._mode);

    this._unsub = modeStore.subscribe(m => {
      this._mode = m;
      this.setAttribute('data-mode', m);
      this.requestUpdate();
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._unsub?.();
  }

  private _handleClick() {
    // Master Reset: torna alla landing con stato neutro
    window.location.href = '/';
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

customElements.define('go-logo', GoLogo);

import { LitElement, html, css } from 'lit';
import { modeStore, type Mode } from './stores/modeStore.js';

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
      position: fixed;
      bottom: 1.75rem;
      right: 1.5rem;
      z-index: 200;
      display: flex;
      flex-direction: column-reverse;
      align-items: flex-end;
      gap: 0.65rem;
      pointer-events: none; /* let individual elements capture events */
    }

    /* ── Trigger button ── */
    .fab-trigger {
      width: 3.1rem;
      height: 3.1rem;
      border-radius: 50%;
      background: var(--color-accent, rgba(0, 255, 200, 1));
      border: none;
      cursor: none;
      pointer-events: all;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow:
        0 0 22px color-mix(in srgb, var(--color-accent, rgba(0,255,200,1)) 60%, transparent),
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
      box-shadow:
        0 0 36px color-mix(in srgb, var(--color-accent, rgba(0,255,200,1)) 80%, transparent),
        0 4px 22px rgba(0, 0, 0, 0.5);
    }

    /* ── Icon swap (⚡ ↔ ✕) ── */
    .fab-icon {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(8, 73, 67, 1); /* ottanio — high contrast on accent */
      font-size: 1.25rem;
      font-weight: 900;
      line-height: 1;
      transition: opacity 0.18s ease, transform 0.28s ease;
    }

    .fab-icon--open  { opacity: 0; transform: rotate(-45deg) scale(0.7); }
    .fab-icon--close { opacity: 0; transform: rotate(45deg)  scale(0.7); }

    :host([open]) .fab-icon--open  { opacity: 1; transform: rotate(0deg) scale(1); }
    :host([open]) .fab-icon--close { opacity: 0; }
    :host(:not([open])) .fab-icon--open  { opacity: 0; }
    :host(:not([open])) .fab-icon--close { opacity: 1; transform: rotate(0deg) scale(1); }

    /* ── Items container ── */
    .fab-items {
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
      border: 1px solid color-mix(in srgb, var(--color-accent, rgba(0,255,200,1)) 40%, transparent);
      color: var(--color-text-primary, rgba(245, 240, 230, 1));
      font-family: 'Lexend', ui-sans-serif, sans-serif;
      font-size: 0.68rem;
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
      font-size: 0.9rem;
      line-height: 1;
    }

    /* ── Open state: items appear with stagger ── */
    :host([open]) .fab-items { pointer-events: all; }

    :host([open]) .fab-item {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: all;
    }

    :host([open]) .fab-item:nth-child(1) { transition-delay: 0.04s; }
    :host([open]) .fab-item:nth-child(2) { transition-delay: 0.08s; }
    :host([open]) .fab-item:nth-child(3) { transition-delay: 0.12s; }

    /* ── Pulse ring (attrae l'attenzione quando chiuso) ── */
    @keyframes fab-ring-pulse {
      0%   { box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-accent, rgba(0,255,200,1)) 40%, transparent); }
      70%  { box-shadow: 0 0 0 14px transparent; }
      100% { box-shadow: 0 0 0 0 transparent; }
    }

    :host(:not([open])) .fab-trigger {
      animation: fab-ring-pulse 3.5s ease-in-out infinite;
      animation-delay: 2s;
    }

    /* ── Mobile adjustments ── */
    @media (max-width: 640px) {
      :host {
        bottom: 1.25rem;
        right: 1.25rem;
      }
      .fab-trigger {
        width: 2.8rem;
        height: 2.8rem;
      }
    }
  `;

  private _open = false;
  private _mode: Mode = 'tech';
  private _unsub?: () => void;

  connectedCallback() {
    super.connectedCallback();
    this._mode = modeStore.get();
    this._unsub = modeStore.subscribe((m) => { this._mode = m; this.requestUpdate(); });
    document.addEventListener('click', this._handleOutsideClick);
    document.addEventListener('keydown', this._handleKeydown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._unsub?.();
    document.removeEventListener('click', this._handleOutsideClick);
    document.removeEventListener('keydown', this._handleKeydown);
  }

  private _toggle() {
    this._open = !this._open;
    if (this._open) {
      this.setAttribute('open', '');
    } else {
      this.removeAttribute('open');
    }
    this.requestUpdate();
  }

  private _handleOutsideClick = (e: Event) => {
    if (this._open && !e.composedPath().includes(this)) {
      this._open = false;
      this.removeAttribute('open');
      this.requestUpdate();
    }
  };

  private _handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this._open) {
      this._open = false;
      this.removeAttribute('open');
      this.requestUpdate();
    }
  };

  private _closeOnNav() {
    this._open = false;
    this.removeAttribute('open');
    this.requestUpdate();
  }

  render() {
    const href = window.location.pathname.match(/^\/(tech|creative|human|management|cv)/)
      ? '#ai-section'
      : '/tech#ai-section';

    return html`
      <div class="fab-items" aria-hidden="${!this._open}">
        <a
          class="fab-item"
          href="mailto:giulio.occhipinti.g@gmail.com"
          aria-label="Invia email a Giulio"
          @click=${this._closeOnNav}
        >
          <span class="fab-item__icon">✉</span>
          <span>Contattami</span>
        </a>
        <a
          class="fab-item"
          href="mailto:giulio.occhipinti.g@gmail.com?subject=Feedback%20CV%20Digitale&body=Ciao%20Giulio,"
          aria-label="Invia feedback"
          @click=${this._closeOnNav}
        >
          <span class="fab-item__icon">✦</span>
          <span>Feedback</span>
        </a>
        <a
          class="fab-item"
          href="${href}"
          aria-label="AI Workflow — come l'AI amplifica il lavoro"
          @click=${this._closeOnNav}
        >
          <span class="fab-item__icon">⚡</span>
          <span>AI Workflow</span>
        </a>
      </div>

      <button
        class="fab-trigger"
        @click=${this._toggle}
        aria-label="${this._open ? 'Chiudi menu' : 'Apri menu interazioni'}"
        aria-expanded="${this._open}"
        aria-haspopup="menu"
        type="button"
      >
        <span class="fab-icon fab-icon--open" aria-hidden="true">✕</span>
        <span class="fab-icon fab-icon--close" aria-hidden="true">⚡</span>
      </button>
    `;
  }
}

customElements.define('floating-menu', FloatingMenu);

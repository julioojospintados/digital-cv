import { LitElement, html, css } from 'lit';
import { type Mode, modeStore, setMode } from './stores/modeStore.js';

export class ModeSwitcher extends LitElement {
  static styles = css`
    :host {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    button {
      padding: 0.25rem 0.75rem;
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      cursor: pointer;
      border: 1px solid transparent;
      border-radius: 2px;
      background: none;
      font-family: 'Inter', system-ui, sans-serif;
      transition:
        color 150ms,
        border-color 150ms,
        background-color 150ms;
      color: var(--color-text-muted);
    }

    button[aria-pressed="true"] {
      color: var(--color-accent);
      border-color: var(--color-accent);
    }

    button:hover:not([aria-pressed="true"]) {
      color: var(--color-text-primary);
      border-color: var(--color-border);
    }
  `;

  private _mode: Mode = modeStore.get();
  private _unsub?: () => void;

  connectedCallback() {
    super.connectedCallback();
    this._unsub = modeStore.subscribe((m) => {
      this._mode = m;
      this.requestUpdate();
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._unsub?.();
  }

  render() {
    const modes: { id: Mode; label: string }[] = [
      { id: 'tech', label: 'TECH' },
      { id: 'creative', label: 'CREATIVE' },
      { id: 'management', label: 'MANAGEMENT' },
      { id: 'human', label: 'HUMAN' },
    ];

    return html`
      ${modes.map((m) => html`
        <button
          aria-pressed=${this._mode === m.id ? 'true' : 'false'}
          aria-label="Modalità ${m.label}"
          @click=${() => setMode(m.id)}
        >${m.label}</button>
      `)}
    `;
  }
}

customElements.define('mode-switcher', ModeSwitcher);


import { LitElement, html, css } from 'lit';
import { type Mode, setMode } from './stores/modeStore.js';

interface ModeCard {
  id: Mode;
  label: string;
  subtitle: string;
  description: string;
  accentColor: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
}

const MODES: ModeCard[] = [
  {
    id: 'tech',
    label: 'TECH',
    subtitle: 'Architetture, codice, sistemi',
    description: 'Angular · Lit · TypeScript · NGRX · AI Tools',
    accentColor: '#00ff88',
    bgColor: '#0a0a0f',
    borderColor: '#1e1e2e',
    textColor: '#e8e8f0',
  },
  {
    id: 'creative',
    label: 'CREATIVE',
    subtitle: 'Racconto, immagine, suono',
    description: 'UX · Video · Fotografia · Copywriting · Teatro',
    accentColor: '#e85d04',
    bgColor: '#fdfaf5',
    borderColor: '#e8ddd0',
    textColor: '#2c1810',
  },
  {
    id: 'human',
    label: 'HUMAN',
    subtitle: 'Impatto, relazione, presenza',
    description: 'Agile · Mentoring · Improv · Social Impact · Lingue',
    accentColor: '#2d6a4f',
    bgColor: '#f5f0eb',
    borderColor: '#d4c9b8',
    textColor: '#2d2926',
  },
];

export class EntryPortal extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .cards {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      width: 100%;
      max-width: 900px;
      margin: 0 auto;
    }

    @media (max-width: 640px) {
      .cards {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
    }

    .card {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding: 2rem 1.5rem;
      border: 1px solid;
      border-radius: 2px;
      cursor: pointer;
      background: none;
      transition:
        transform 150ms cubic-bezier(0.4, 0, 0.2, 1),
        box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1),
        border-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
      user-select: none;
    }

    .card:hover,
    .card:focus-visible {
      transform: translateY(-4px);
      outline: none;
    }

    .card:active {
      transform: translateY(-1px);
    }

    .label {
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      font-family: 'Inter', system-ui, sans-serif;
    }

    .subtitle {
      font-size: 1rem;
      font-weight: 600;
      line-height: 1.3;
      font-family: 'Inter', system-ui, sans-serif;
    }

    .description {
      font-size: 0.78rem;
      opacity: 0.65;
      line-height: 1.5;
      font-family: 'Inter', system-ui, sans-serif;
    }

    .arrow {
      margin-top: auto;
      font-size: 1.25rem;
      opacity: 0.5;
      transition: opacity 150ms, transform 150ms;
    }

    .card:hover .arrow {
      opacity: 1;
      transform: translateX(4px);
    }
  `;

  private _hoveredMode: Mode | null = null;

  private _handleClick(mode: Mode): void {
    setMode(mode);
    window.location.href = `/cv?mode=${mode}`;
  }

  render() {
    return html`
      <div class="cards" role="list">
        ${MODES.map((m) => html`
          <button
            class="card"
            role="listitem"
            tabindex="0"
            style="background-color: ${m.bgColor}; border-color: ${this._hoveredMode === m.id ? m.accentColor : m.borderColor}; color: ${m.textColor}; box-shadow: ${this._hoveredMode === m.id ? `0 0 20px color-mix(in srgb, ${m.accentColor} 25%, transparent)` : 'none'};"
            @click=${() => this._handleClick(m.id)}
            @mouseenter=${() => { this._hoveredMode = m.id; this.requestUpdate(); }}
            @mouseleave=${() => { this._hoveredMode = null; this.requestUpdate(); }}
            aria-label="Entra in modalità ${m.label}: ${m.subtitle}"
          >
            <span class="label" style="color: ${m.accentColor}">${m.label}</span>
            <span class="subtitle">${m.subtitle}</span>
            <span class="description">${m.description}</span>
            <span class="arrow">→</span>
          </button>
        `)}
      </div>
    `;
  }
}

customElements.define('entry-portal', EntryPortal);

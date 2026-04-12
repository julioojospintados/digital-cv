import { LitElement, html, css, svg } from 'lit';
import { gsap } from 'gsap';
import { modeStore, type Mode } from './stores/modeStore.js';
import {
  NODES, EDGES, MODE_COLOR, VW, VH,
} from './constellation-data.js';

// ── Lit Element ───────────────────────────────────────────────────────────
class SkillConstellation extends LitElement {
  static styles = css`
    :host { display: block; width: 100%; }

    .cs-wrapper {
      position: relative;
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 2px;
      background: rgba(0, 0, 0, 0.18);
      overflow: hidden;
    }

    .cs-svg {
      width: 100%;
      height: auto;
      display: block;
    }

    .quadrant-label {
      font-family: 'Lexend', ui-sans-serif, sans-serif;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.22em;
      fill: rgba(192, 220, 215, 0.28);
    }

    .divider {
      stroke: rgba(255, 255, 255, 0.04);
      stroke-width: 1;
      stroke-dasharray: 4 6;
    }

    .sk-circle {
      transition: filter 0.45s ease;
    }

    .sk-label {
      font-family: 'Lexend', ui-sans-serif, sans-serif;
      pointer-events: none;
      user-select: none;
    }

    .cs-legend {
      display: flex;
      gap: 1.25rem;
      flex-wrap: wrap;
      justify-content: center;
      padding: 0.55rem 1rem 0.7rem;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }

    .cs-legend-item {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-family: 'Lexend', sans-serif;
      font-size: 0.52rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: rgba(192, 220, 215, 0.55);
    }

    .cs-legend-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .cs-hint {
      font-family: 'Lexend', sans-serif;
      font-size: 0.48rem;
      letter-spacing: 0.05em;
      color: rgba(192, 220, 215, 0.3);
    }
  `;

  private _mode: Mode = 'tech';
  private _unsub?: () => void;
  private _animated = false;

  connectedCallback() {
    super.connectedCallback();
    this._mode = modeStore.get();
    this._unsub = modeStore.subscribe((m) => {
      this._mode = m;
      if (this._animated) this._applyMode();
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._unsub?.();
  }

  private _getColor(group: string): string {
    return MODE_COLOR[group as Mode] ?? 'rgba(255,255,255,0.6)';
  }

  firstUpdated() {
    requestAnimationFrame(() => this._animate());
  }

  private _animate() {
    const root = this.renderRoot;
    const groups    = Array.from(root.querySelectorAll<SVGGElement>('.sk-node-g'));
    const lines     = Array.from(root.querySelectorAll<SVGLineElement>('.sk-line:not(.sk-line--cross)'));
    const crossLines = Array.from(root.querySelectorAll<SVGLineElement>('.sk-line--cross'));

    // 1. Non-cross lines draw in via attr stroke-dashoffset (SVG-safe)
    gsap.to(lines, {
      attr: { 'stroke-dashoffset': 0 },
      opacity: 0.5,
      duration: 1.8,
      stagger: { each: 0.025, from: 'random' },
      ease: 'power2.inOut',
      delay: 0.25,
    });

    // 2. Nodes fade in (opacity only — no SVG scale issues in shadow DOM)
    //    _applyMode fires only after ALL nodes finish to avoid tween conflict
    let done = 0;
    const total = groups.length;
    groups.forEach((g) => {
      gsap.fromTo(g,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.5,
          delay: 0.4 + Math.random() * 0.55,
          ease: 'power2.out',
          onComplete: () => {
            done++;
            if (done === total) {
              this._animated = true;
              this._applyMode();
            }
          },
        }
      );
    });

    // 3. Cross lines fade in last
    gsap.to(crossLines, {
      opacity: 0.12,
      duration: 0.8,
      stagger: 0.05,
      ease: 'power1.out',
      delay: 1.2,
    });

    // Safety: fire _applyMode even if some nodes never complete
    gsap.delayedCall(2.2, () => {
      if (!this._animated) {
        this._animated = true;
        this._applyMode();
      }
    });
  }

  private _applyMode() {
    const root = this.renderRoot;
    const mode = this._mode;

    root.querySelectorAll<SVGGElement>('.sk-node-g').forEach(g => {
      const isActive = g.dataset.group === mode;
      const circle = g.querySelector<SVGCircleElement>('.sk-circle');
      const label  = g.querySelector<SVGTextElement>('.sk-label');

      if (circle) {
        gsap.to(circle, {
          opacity: isActive ? 1 : 0.1,
          attr: { 'stroke-width': isActive ? 2.2 : 1.5 },
          duration: 0.45,
          ease: 'power2.out',
        });
        gsap.to(circle, {
          filter: isActive ? `drop-shadow(0 0 8px ${this._getColor(mode)})` : 'none',
          duration: 0.45,
        });
      }

      if (label) {
        gsap.to(label, {
          opacity: isActive ? 0.92 : 0,
          duration: 0.4,
          ease: 'power2.out',
        });
      }
    });

    root.querySelectorAll<SVGLineElement>('.sk-line').forEach(line => {
      const isActive = line.dataset.group === mode;
      const isCross  = line.classList.contains('sk-line--cross');
      gsap.to(line, {
        opacity: isActive ? 0.65 : (isCross ? 0.08 : 0.03),
        duration: 0.45,
      });
    });
  }

  render() {
    const nodesById = new Map(NODES.map(n => [n.id, n]));

    return html`
      <div class="cs-wrapper">
        <svg
          class="cs-svg"
          viewBox="0 0 ${VW} ${VH}"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Mappa delle competenze di Giulio Occhipinti: Tech, Creative, Human, Management"
        >
          <!-- Quadrant labels -->
          <text class="quadrant-label" x="14" y="20">TECH</text>
          <text class="quadrant-label" x="412" y="20">CREATIVE</text>
          <text class="quadrant-label" x="14" y="273">MANAGEMENT</text>
          <text class="quadrant-label" x="412" y="273">HUMAN</text>

          <!-- Divider lines (dashed) -->
          <line class="divider" x1="400" y1="0" x2="400" y2="${VH}" />
          <line class="divider" x1="0" y1="260" x2="${VW}" y2="260" />

          <!-- Edges -->
          ${EDGES.map(edge => {
            const a = nodesById.get(edge.a);
            const b = nodesById.get(edge.b);
            if (!a || !b) return svg``;
            const len = Math.hypot(b.x - a.x, b.y - a.y);
            const color = edge.cross
              ? 'rgba(255,255,255,0.18)'
              : this._getColor(a.group);
            return svg`<line
              class="sk-line ${edge.cross ? 'sk-line--cross' : ''}"
              data-group="${edge.cross ? '_cross' : a.group}"
              x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"
              stroke="${color}"
              stroke-width="${edge.cross ? 0.6 : 0.9}"
              stroke-dasharray="${edge.cross ? '4 5' : String(Math.ceil(len))}"
              stroke-dashoffset="${edge.cross ? '0' : String(Math.ceil(len))}"
              opacity="0"
            />`;
          })}

          <!-- Nodes -->
          ${NODES.map(node => {
            const color = this._getColor(node.group);
            return svg`
              <g
                class="sk-node-g"
                data-group="${node.group}"
                data-id="${node.id}"
                opacity="0"
              >
                <circle
                  class="sk-circle"
                  cx="${node.x}" cy="${node.y}" r="${node.r}"
                  fill="rgba(8,73,67,0.88)"
                  stroke="${color}"
                  stroke-width="1.5"
                />
                <text
                  class="sk-label"
                  x="${node.x}"
                  y="${node.y + node.r + 11}"
                  text-anchor="middle"
                  font-size="${node.r >= 10 ? 8 : 7}"
                  font-weight="600"
                  fill="${color}"
                  opacity="0"
                >${node.label}</text>
              </g>
            `;
          })}
        </svg>

        <!-- Legend -->
        <div class="cs-legend">
          ${(['tech', 'creative', 'management', 'human'] as Mode[]).map(m => html`
            <span class="cs-legend-item">
              <span class="cs-legend-dot" style="background:${this._getColor(m)}"></span>
              ${m}
            </span>
          `)}
          <span class="cs-hint">— connessione diretta &nbsp;╌ cross-domain</span>
        </div>
      </div>
    `;
  }
}

customElements.define('skill-constellation', SkillConstellation);

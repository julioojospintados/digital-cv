import { LitElement, html, css, svg } from 'lit';
import { gsap } from 'gsap';
import { modeStore, type Mode } from './stores/modeStore.js';
import {
  DOMAIN_NODES, DOMAIN_COLOR, QLABELS, VW, VH,
  type DomainNode, type SkillDomain,
} from './skill-domain-data.js';

// ── Domain label display names ─────────────────────────────────────────────
const QLABEL_TEXT: Record<SkillDomain, string> = {
  tech:       'TECH',
  creative:   'CREATIVE',
  management: 'MANAGEMENT',
  human:      'HUMAN',
  ai:         'AI BRIDGE',
};

// ── Lit Element ───────────────────────────────────────────────────────────
class SkillDomainBubbles extends LitElement {
  static styles = css`
    :host { display: block; width: 100%; }

    .sdb-wrapper {
      position: relative;
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 2px;
      background: rgba(0, 0, 0, 0.18);
      overflow: hidden;
    }

    .sdb-svg {
      display: block;
      width: 100%;
      height: auto;
      min-width: 600px;
    }

    .qa-area { fill-opacity: 0.035; }

    .qa-label {
      font-family: 'Lexend', ui-sans-serif, sans-serif;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.22em;
    }

    .h-divider, .v-divider {
      stroke: rgba(255, 255, 255, 0.05);
      stroke-width: 1;
      stroke-dasharray: 4 6;
    }

    .ai-area {
      fill-opacity: 0.09;
      stroke-width: 0.5;
      stroke-opacity: 0.35;
    }

    .dn-group { cursor: default; }

    /* filled circle */
    .dn-circle { stroke-width: 1.5; }

    /* dashed ring for bridge nodes */
    .dn-ring {
      fill: none;
      stroke-width: 1.5;
      stroke-dasharray: 3 2.5;
      stroke-opacity: 0.65;
    }

    .dn-label {
      font-family: 'Lexend', ui-sans-serif, sans-serif;
      font-size: 6.5px;
      font-weight: 600;
      fill: rgba(245, 240, 230, 0.88);
      pointer-events: none;
      user-select: none;
      text-anchor: middle;
    }

    /* hover glow */
    @media (hover: hover) and (pointer: fine) {
      .dn-group:hover .dn-circle {
        filter: drop-shadow(0 0 5px currentColor);
      }
    }

    /* Mode-state controlled by GSAP (not CSS class) */

    /* Legend */
    .sdb-legend {
      display: flex;
      gap: 1.25rem;
      flex-wrap: wrap;
      justify-content: center;
      padding: 0.5rem 1rem 0.65rem;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }

    .sdb-legend-item {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-family: 'Lexend', sans-serif;
      font-size: 0.5rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: rgba(192, 220, 215, 0.55);
    }

    .sdb-legend-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .sdb-role-divider {
      margin-left: 1rem;
      padding-left: 1rem;
      border-left: 1px solid rgba(255, 255, 255, 0.1);
    }

    .sdb-hint {
      font-family: 'Lexend', sans-serif;
      font-size: 0.5rem;
      letter-spacing: 0.08em;
      color: rgba(192, 220, 215, 0.38);
      text-align: center;
      padding: 0 1rem 0.5rem;
    }
  `;

  private _mode: Mode = 'tech';
  private _firstRendered = false;
  private _unsub?: () => void;

  connectedCallback() {
    super.connectedCallback();
    // Read initial mode
    this._mode = modeStore.get();
    // Subscribe to future changes — GSAP handles them, no re-render needed
    this._unsub = modeStore.subscribe(m => {
      this._mode = m;
      if (this._firstRendered) this._animateMode(m);
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._unsub?.();
  }

  firstUpdated() {
    this._firstRendered = true;

    // Entrance: scale from 0, staggered
    const circles = this.renderRoot.querySelectorAll<SVGElement>('.dn-circle');
    const rings   = this.renderRoot.querySelectorAll<SVGElement>('.dn-ring');
    const labels  = this.renderRoot.querySelectorAll<SVGElement>('.dn-label');

    gsap.set([...circles, ...rings], { scale: 0, transformOrigin: '50% 50%', opacity: 0 });
    gsap.set(labels, { opacity: 0 });

    gsap.to([...circles, ...rings], {
      scale: 1,
      opacity: 1,
      duration: 0.5,
      stagger: 0.012,
      ease: 'back.out(1.5)',
      delay: 0.25,
      onComplete: () => {
        // Apply mode state after entrance
        this._animateMode(this._mode);
        gsap.to(labels, { opacity: 1, duration: 0.3, stagger: 0.008, ease: 'power2.out' });
      },
    });
  }

  // ── Mode reactivity: dim non-matching domains ──────────────────────────
  private _animateMode(mode: Mode) {
    const groups = this.renderRoot.querySelectorAll<SVGGElement>('.dn-group');
    groups.forEach(g => {
      const domain = g.dataset.domain as SkillDomain;
      // ai bridge is active in tech and management modes
      const isActive = domain === mode
        || (domain === 'ai' && (mode === 'tech' || mode === 'management'));
      gsap.to(g, {
        opacity: isActive ? 1 : 0.15,
        duration: 0.4,
        ease: 'power2.out',
      });
    });
  }

  // ── Render ────────────────────────────────────────────────────────────
  render() {
    const domains: SkillDomain[] = ['tech', 'creative', 'management', 'human'];

    return html`
      <div class="sdb-wrapper" role="img" aria-label="Mappa di tutte le competenze per dominio">
        <svg
          class="sdb-svg"
          viewBox="0 0 ${VW} ${VH}"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <!-- ── Quadrant areas ──────────────────────────────── -->
          <!-- tech -->
          <rect class="qa-area" x="16"  y="36"  width="474" height="244" rx="2"
                style="fill:${DOMAIN_COLOR.tech}"/>
          <!-- creative -->
          <rect class="qa-area" x="520" y="36"  width="464" height="244" rx="2"
                style="fill:${DOMAIN_COLOR.creative}"/>
          <!-- management -->
          <rect class="qa-area" x="16"  y="320" width="474" height="244" rx="2"
                style="fill:${DOMAIN_COLOR.management}"/>
          <!-- human -->
          <rect class="qa-area" x="520" y="320" width="464" height="244" rx="2"
                style="fill:${DOMAIN_COLOR.human}"/>

          <!-- ── AI bridge centre area ──────────────────────── -->
          <rect class="ai-area" x="388" y="262" width="224" height="56" rx="3"
                style="fill:${DOMAIN_COLOR.ai};stroke:${DOMAIN_COLOR.ai}"/>

          <!-- ── Dividers ───────────────────────────────────── -->
          <line class="h-divider" x1="16"  y1="290" x2="984" y2="290"/>
          <line class="v-divider" x1="500" y1="36"  x2="500" y2="564"/>

          <!-- ── Quadrant labels ────────────────────────────── -->
          ${domains.map(d => svg`
            <text class="qa-label"
                  x="${QLABELS[d].x}" y="${QLABELS[d].y}"
                  style="fill:${DOMAIN_COLOR[d].replace('1)', '0.45)')}">
              ${QLABEL_TEXT[d]}
            </text>
          `)}
          <!-- AI bridge label (center, small) -->
          <text class="qa-label"
                x="${QLABELS.ai.x}" y="${QLABELS.ai.y}"
                style="fill:${DOMAIN_COLOR.ai.replace('1)','0.65)')}; font-size:7px; text-anchor:middle">
            ${QLABEL_TEXT.ai}
          </text>

          <!-- ── Skill nodes ────────────────────────────────── -->
          ${DOMAIN_NODES.map(node => {
            const col   = DOMAIN_COLOR[node.domain];
            const fill  = col.replace('1)', '0.22)');
            const ringR = node.r + 4;

            return svg`
              <g class="dn-group"
                 data-domain="${node.domain}"
                 data-role="${node.role}">

                <!-- Filled circle -->
                <circle class="dn-circle"
                        cx="${node.x}" cy="${node.y}" r="${node.r}"
                        style="fill:${fill}; stroke:${col}; color:${col}"/>

                <!-- Bridge: dashed outer ring -->
                ${node.role === 'bridge' ? svg`
                  <circle class="dn-ring"
                          cx="${node.x}" cy="${node.y}" r="${ringR}"
                          style="stroke:${col}"/>
                ` : ''}

                <!-- Label below circle -->
                <text class="dn-label"
                      x="${node.x}"
                      y="${node.y + node.r + 9}">
                  ${node.label}
                </text>
              </g>
            `;
          })}
        </svg>

        <!-- ── Legend ─────────────────────────────────────────── -->
        <div class="sdb-legend" aria-hidden="true">
          ${(Object.entries(DOMAIN_COLOR) as [SkillDomain, string][]).map(([d, col]) => html`
            <span class="sdb-legend-item">
              <span class="sdb-legend-dot" style="background:${col}"></span>
              ${QLABEL_TEXT[d]}
            </span>
          `)}
          <span class="sdb-legend-item sdb-role-divider">
            ${svg`<svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="4" stroke="currentColor" stroke-width="1.5"
                      stroke-dasharray="2.5 2"/>
            </svg>`}
            Bridge
          </span>
          <span class="sdb-legend-item">
            ${svg`<svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="4" stroke="currentColor" stroke-width="2"/>
            </svg>`}
            Core
          </span>
        </div>

        <p class="sdb-hint">Dimensione proporzionale al peso · il mode attivo illumina il dominio</p>
      </div>
    `;
  }
}

customElements.define('skill-domain-bubbles', SkillDomainBubbles);

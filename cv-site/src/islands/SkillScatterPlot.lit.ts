import { LitElement, html, css } from 'lit';
import { modeStore, type Mode } from './stores/modeStore.js';
import { cvData } from '@cv-data';

// ── Domain palette — matches global.css mode accents ─────────────────────────
const DOMAIN_COLOR: Record<string, string> = {
  tech:       'rgba(0,255,200,1)',
  creative:   'rgba(255,107,53,1)',
  human:      'rgba(240,200,127,1)',
  management: 'rgba(180,100,255,1)',
  ai:         'rgba(0,220,255,1)',
};

const DOMAIN_LABEL: Record<string, string> = {
  tech:       'Tech',
  creative:   'Creative',
  human:      'Human',
  management: 'Management',
  ai:         'AI',
};

// ── SVG layout ────────────────────────────────────────────────────────────────
const VW  = 900;
const VH  = 520;
const PL  = 90;    // left padding (Y-axis labels)
const PR  = 30;
const PT  = 36;
const PB  = 64;    // bottom padding (X-axis labels)
const CW  = VW - PL - PR;  // chart width  = 780
const CH  = VH - PT - PB;  // chart height = 420
const CX  = VW / 2;
const CY  = VH / 2;

// ── Helpers ───────────────────────────────────────────────────────────────────
function toSvgX(weight: number): number {
  return PL + ((weight - 1) / 4) * CW;
}
function toSvgY(mastery: number): number {
  return PT + (1 - mastery / 100) * CH;
}
function toRadius(weight: number): number {
  return 4 + (weight - 1) * 2.2;  // 4 → 12.8 px
}

// ── Unified node type ─────────────────────────────────────────────────────────
interface PlotNode {
  name:   string;
  domain: string;
  weight: number;
  mastery: number;
  role:   string;
  links:  ReadonlyArray<{ target: string; type: string; description?: string }>;
  x: number;
  y: number;
  r: number;
}

// ── Build flat array once at module level (no per-instance cost) ───────────────
function buildNodes(): PlotNode[] {
  const nodes: PlotNode[] = [];

  const add = (
    s: { name: string; domain?: string; weight?: number; mastery?: number; role?: string; links?: ReadonlyArray<{ target: string; type: string; description?: string }> },
  ) => {
    const w = (s.weight as number) ?? 3;
    const m = (s.mastery as number) ?? 60;
    nodes.push({
      name:   s.name,
      domain: s.domain ?? 'tech',
      weight: w,
      mastery: m,
      role:   s.role ?? 'support',
      links:  s.links ?? [],
      x: toSvgX(w),
      y: toSvgY(m),
      r: toRadius(w),
    });
  };

  (cvData.technicalSkills  as unknown as Parameters<typeof add>[0][]).forEach(s => add(s));
  (cvData.softSkills       as unknown as Parameters<typeof add>[0][]).forEach(s => add(s));
  (cvData.transversalSkills as unknown as Parameters<typeof add>[0][]).forEach(s => add(s));

  return nodes;
}

const NODES     = buildNodes();
const NAME_IDX  = new Map(NODES.map((n, i) => [n.name, i]));

// Build deduplicated edge list
interface Edge { a: number; b: number; desc?: string }
function buildEdges(): Edge[] {
  const seen = new Set<string>();
  const edges: Edge[] = [];
  NODES.forEach((node, i) => {
    node.links.forEach(link => {
      const j = NAME_IDX.get(link.target);
      if (j === undefined) return;
      const key = `${Math.min(i, j)}-${Math.max(i, j)}`;
      if (seen.has(key)) return;
      seen.add(key);
      edges.push({ a: i, b: j, desc: link.description });
    });
  });
  return edges;
}

const EDGES = buildEdges();

// ── Component ─────────────────────────────────────────────────────────────────
class SkillScatterPlot extends LitElement {
  static styles = css`
    :host { display: block; width: 100%; max-width: 100%; overflow: hidden; }

    .sp-wrapper {
      position: relative;
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 2px;
      background: rgba(0, 0, 0, 0.15);
      overflow: hidden;
    }

    .sp-svg {
      width: 100%;
      height: auto;
      display: block;
      cursor: default;
    }

    /* Grid lines */
    .sp-grid-h, .sp-grid-v {
      stroke: rgba(255, 255, 255, 0.04);
      stroke-width: 1;
      stroke-dasharray: 3 5;
    }

    /* Axis lines */
    .sp-axis {
      stroke: rgba(255, 255, 255, 0.12);
      stroke-width: 1;
    }

    /* Labels */
    .sp-tick-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px;
      fill: rgba(192, 220, 215, 0.35);
      user-select: none;
    }

    .sp-axis-label {
      font-family: 'Lexend', sans-serif;
      font-size: 8px;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      fill: rgba(192, 220, 215, 0.30);
      user-select: none;
    }

    /* Edges (links) */
    .sp-edge {
      fill: none;
      stroke: rgba(192, 220, 215, 0.07);
      stroke-width: 0.8;
      transition: stroke 0.25s ease, stroke-opacity 0.25s ease, stroke-width 0.25s ease;
      pointer-events: none;
    }
    .sp-edge--active {
      stroke-width: 1.8;
      stroke-opacity: 0.9;
    }
    .sp-edge--dimmed {
      stroke-opacity: 0.03;
    }

    /* Nodes */
    .sp-node-group {
      cursor: pointer;
      /* CSS transition handles smooth opacity changes on mode switch.
         Opacity is declared in the template (style attr) — no GSAP needed. */
      transition: opacity 0.4s ease;
    }
    .sp-node {
      transition: filter 0.25s ease, opacity 0.25s ease;
    }
    .sp-node--dimmed {
      opacity: 0.12;
    }
    .sp-node--active {
      filter: brightness(1.4) drop-shadow(0 0 6px currentColor);
    }

    /* Node label (shown on hover) */
    .sp-label {
      font-family: 'Lexend', sans-serif;
      font-size: 8.5px;
      font-weight: 600;
      fill: rgba(245, 240, 230, 0.92);
      pointer-events: none;
      user-select: none;
    }
    .sp-label-bg {
      fill: rgba(8, 73, 67, 0.88);
      rx: 3px;
      pointer-events: none;
    }

    /* Tooltip */
    .sp-tooltip {
      pointer-events: none;
    }
    .sp-tooltip-bg {
      fill: rgba(8, 73, 67, 0.96);
      stroke: rgba(255, 255, 255, 0.12);
      stroke-width: 0.5;
      rx: 5px;
    }
    .sp-tooltip-title {
      font-family: 'Lexend', sans-serif;
      font-size: 8px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    .sp-tooltip-line {
      font-family: 'Lexend', sans-serif;
      font-size: 7.5px;
      fill: rgba(192, 220, 215, 0.8);
    }

    /* Legend */
    .sp-legend {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      justify-content: center;
      padding: 0.5rem 1rem 0.65rem;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }
    .sp-legend-item {
      display: flex;
      align-items: center;
      gap: 0.3rem;
      font-family: 'Lexend', sans-serif;
      font-size: 0.52rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: rgba(192, 220, 215, 0.5);
    }
    .sp-legend-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .sp-hint {
      font-family: 'Lexend', sans-serif;
      font-size: 0.48rem;
      color: rgba(192, 220, 215, 0.3);
      text-align: center;
      padding: 0.2rem 0 0.4rem;
      letter-spacing: 0.05em;
    }
  `;

  private _mode: Mode       = 'tech';
  private _hoveredIdx: number | null = null;
  private _unsub?: () => void;

  override connectedCallback() {
    super.connectedCallback();
    this._mode = modeStore.get();
    // requestUpdate() triggers re-render; Lit sets opacity via template style attr;
    // CSS transition: opacity 0.4s on .sp-node-group animates the change smoothly.
    this._unsub = modeStore.subscribe(m => {
      this._mode = m;
      this.requestUpdate();
    });
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this._unsub?.();
  }

  // ── Interaction ─────────────────────────────────────────────────────────────
  private _onNodeEnter(idx: number) {
    this._hoveredIdx = idx;
    this.requestUpdate();
  }

  private _onNodeLeave() {
    this._hoveredIdx = null;
    this.requestUpdate();
  }

  // ── Rendering helpers ───────────────────────────────────────────────────────
  private _renderGrid() {
    const lines: ReturnType<typeof html>[] = [];

    // Horizontal grid lines (mastery 0%, 25%, 50%, 75%, 100%)
    [0, 25, 50, 75, 100].forEach(m => {
      const y = toSvgY(m);
      lines.push(html`
        <line class="sp-grid-h" x1="${PL}" y1="${y}" x2="${VW - PR}" y2="${y}"/>
        <text class="sp-tick-label" x="${PL - 6}" y="${y + 3}" text-anchor="end">${m}</text>
      `);
    });

    // Vertical grid lines (weight 1–5)
    [1, 2, 3, 4, 5].forEach(w => {
      const x = toSvgX(w);
      lines.push(html`
        <line class="sp-grid-v" x1="${x}" y1="${PT}" x2="${x}" y2="${VH - PB}"/>
        <text class="sp-tick-label" x="${x}" y="${VH - PB + 14}" text-anchor="middle">${w}</text>
      `);
    });

    // Axis lines
    lines.push(html`
      <line class="sp-axis" x1="${PL}" y1="${PT}" x2="${PL}" y2="${VH - PB}"/>
      <line class="sp-axis" x1="${PL}" y1="${VH - PB}" x2="${VW - PR}" y2="${VH - PB}"/>
    `);

    // Axis labels
    lines.push(html`
      <text class="sp-axis-label" x="${VW - PR}" y="${VH - PB + 30}" text-anchor="end">
        Strategicit\u00e0 →
      </text>
      <text class="sp-axis-label"
        x="${PL - 14}" y="${PT}"
        text-anchor="middle"
        transform="rotate(-90, ${PL - 14}, ${PT + CH / 2})"
        y="${PT + CH / 2}">
        ↑ Padronanza
      </text>
    `);

    return lines;
  }

  private _renderEdge(edge: Edge) {
    const a = NODES[edge.a];
    const b = NODES[edge.b];
    if (!a || !b) return '';

    const hovered = this._hoveredIdx;
    const isActive = hovered !== null && (edge.a === hovered || edge.b === hovered);
    const isDimmed  = hovered !== null && !isActive;

    // cubic bezier with perpendicular offset
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx  = -dy / len;
    const ny  =  dx / len;
    const curve = Math.min(len * 0.28, 70);
    const cp1x  = a.x + dx * 0.3 + nx * curve;
    const cp1y  = a.y + dy * 0.3 + ny * curve;
    const cp2x  = b.x - dx * 0.3 + nx * curve;
    const cp2y  = b.y - dy * 0.3 + ny * curve;
    const d     = `M ${a.x} ${a.y} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${b.x} ${b.y}`;

    // color for active edge: blend the two domain colors
    const strokeColor = isActive
      ? (DOMAIN_COLOR[a.domain] ?? 'rgba(192,220,215,0.5)')
      : undefined;

    const cls = [
      'sp-edge',
      isActive ? 'sp-edge--active' : '',
      isDimmed ? 'sp-edge--dimmed'  : '',
    ].filter(Boolean).join(' ');

    return html`<path class="${cls}" d="${d}" style="${isActive ? `stroke:${strokeColor}` : ''}"/>`;
  }

  private _renderNode(node: PlotNode, idx: number) {
    const hovered  = this._hoveredIdx;
    const isHovered = idx === hovered;
    const isDimmed  = hovered !== null && !isHovered;
    const color     = DOMAIN_COLOR[node.domain] ?? 'rgba(192,220,215,1)';

    // Opacity declared here — Lit sets it on every render.
    // CSS transition: opacity 0.4s on .sp-node-group handles smooth mode changes.
    // No GSAP needed — eliminates all timing/animation race conditions.
    const isActive = node.domain === this._mode
      || (this._mode === 'management' && node.domain === 'management')
      || (this._mode === 'tech' && node.domain === 'ai');
    const groupOpacity = isActive ? 1 : 0.22;

    const nodeCls = [
      'sp-node',
      isDimmed  ? 'sp-node--dimmed' : '',
      isHovered ? 'sp-node--active' : '',
    ].filter(Boolean).join(' ');

    // Label shown on hover
    const labelText  = node.name;
    const labelPad   = 5;
    const labelW     = labelText.length * 5.2 + labelPad * 2;
    const labelH     = 14;
    // position label to avoid going off-screen right
    const labelX     = node.x + node.r + 4;
    const labelShift = (labelX + labelW > VW - PR) ? -(node.r + 4 + labelW) : 0;

    return html`
      <g
        class="sp-node-group"
        transform="translate(${node.x},${node.y})"
        style="opacity: ${groupOpacity}"
        data-idx="${idx}"
        @mouseenter=${() => this._onNodeEnter(idx)}
        @mouseleave=${this._onNodeLeave}
        role="img"
        aria-label="${node.name} — ${node.domain}, strategicit\u00e0 ${node.weight}/5, padronanza ${node.mastery}%"
      >
        <circle
          class="${nodeCls}"
          cx="0"
          cy="0"
          r="${node.r}"
          fill="${color}"
          fill-opacity="${isHovered ? '1' : '0.82'}"
          style="color:${color}"
        />

        ${isHovered ? html`
          <rect
            class="sp-label-bg"
            x="${node.r + 4 + labelShift}"
            y="${-labelH / 2}"
            width="${labelW}"
            height="${labelH}"
          />
          <text
            class="sp-label"
            x="${node.r + 4 + labelPad + labelShift}"
            y="4"
          >${labelText}</text>
        ` : ''}
      </g>
    `;
  }

  private _renderTooltip(idx: number) {
    const node = NODES[idx];
    if (!node) return '';

    // Collect connected link descriptions
    const descs = node.links
      .filter(l => l.description)
      .slice(0, 3)
      .map(l => `${l.target}: ${l.description}`);

    const lines  = [`${node.domain.toUpperCase()} · w${node.weight} · ${node.mastery}%`, ...descs];
    const tW     = 240;
    const lineH  = 13;
    const tH     = 14 + lines.length * lineH + 8;
    const margin = 12;

    // Position: prefer below+right, flip if near edge
    let tx = node.x + node.r + margin;
    let ty = node.y - tH / 2;
    if (tx + tW > VW - PR) tx = node.x - node.r - margin - tW;
    if (ty < PT) ty = PT;
    if (ty + tH > VH - PB) ty = VH - PB - tH;

    return html`
      <g class="sp-tooltip" transform="translate(${tx},${ty})" pointer-events="none">
        <rect class="sp-tooltip-bg" x="0" y="0" width="${tW}" height="${tH}"/>
        <text
          class="sp-tooltip-title"
          x="10" y="14"
          fill="${DOMAIN_COLOR[node.domain] ?? 'rgba(0,255,200,1)'}"
        >${node.name}</text>
        ${lines.map((line, i) => html`
          <text class="sp-tooltip-line" x="10" y="${14 + (i + 1) * lineH + 4}">${line}</text>
        `)}
      </g>
    `;
  }

  override render() {
    const hovered = this._hoveredIdx;

    return html`
      <div class="sp-wrapper">
        <svg
          viewBox="0 0 ${VW} ${VH}"
          class="sp-svg"
          role="img"
          aria-label="Scatter plot delle competenze — asse X Strategicit\u00e0 (weight), asse Y Padronanza (mastery)"
        >
          <!-- Grid & Axes -->
          ${this._renderGrid()}

          <!-- Edges -->
          <g class="sp-edges">
            ${EDGES.map(e => this._renderEdge(e))}
          </g>

          <!-- Nodes -->
          <g class="sp-nodes">
            ${NODES.map((node, i) => this._renderNode(node, i))}
          </g>

          <!-- Tooltip -->
          ${hovered !== null ? this._renderTooltip(hovered) : ''}
        </svg>

        <!-- Legend -->
        <div class="sp-legend" aria-hidden="true">
          ${Object.entries(DOMAIN_COLOR).map(([domain, color]) => html`
            <div class="sp-legend-item">
              <span class="sp-legend-dot" style="background:${color}"></span>
              <span>${DOMAIN_LABEL[domain] ?? domain}</span>
            </div>
          `)}
        </div>
        <p class="sp-hint">hover per esplorare connessioni &amp; context</p>
      </div>
    `;
  }
}

customElements.define('skill-scatter-plot', SkillScatterPlot);

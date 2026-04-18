import { LitElement, html, css, render as litRender } from "lit";
import {
  drag,
  easeCubicOut,
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  pointer,
  select,
  zoom,
  zoomIdentity,
  type D3DragEvent,
  type D3ZoomEvent,
  type Selection,
  type Simulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
  type ZoomBehavior,
} from "d3";
import { cvData } from "@cv-data";
import { modeStore, type Mode } from "./stores/modeStore.ts";

type SkillDomain = "tech" | "creative" | "human" | "management" | "ai";

type RawSkill = {
  name: string;
  domain?: SkillDomain;
  weight?: number;
  mastery?: number;
  links?: ReadonlyArray<{ target: string; type: string; description?: string }>;
};

interface GraphNode extends SimulationNodeDatum {
  id: string;
  label: string;
  domain: SkillDomain;
  weight: number;
  mastery: number;
  r: number;
}

interface GraphLink extends SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  type: string;
  description?: string;
}

interface TooltipState {
  nodeId: string;
  x: number;
  y: number;
}

interface LinkInsight {
  id: string;
  type: string;
  description?: string;
}

const WIDTH = 1080;
const HEIGHT = 760;
const INITIAL_ZOOM = 1;

const DOMAIN_COLOR: Record<SkillDomain, string> = {
  tech: "rgba(0,255,200,1)",
  creative: "rgba(255,107,53,1)",
  human: "rgba(240,200,127,1)",
  management: "rgba(180,100,255,1)",
  ai: "rgba(0,220,255,1)",
};

const DOMAIN_LABEL: Record<SkillDomain, string> = {
  tech: "Tech",
  creative: "Creative",
  human: "Human",
  management: "Management",
  ai: "AI",
};

const LINK_TYPE_LABEL: Record<string, string> = {
  technical: "Tecnico",
  "cross-domain": "Trasversale",
  conceptual: "Concettuale",
  workflow: "Workflow",
};

const PIN_DURATION_MS = 1600;

const DOMAIN_ANCHOR: Record<SkillDomain, { x: number; y: number }> = {
  tech: { x: WIDTH * 0.16, y: HEIGHT * 0.26 },
  creative: { x: WIDTH * 0.84, y: HEIGHT * 0.26 },
  management: { x: WIDTH * 0.18, y: HEIGHT * 0.8 },
  human: { x: WIDTH * 0.82, y: HEIGHT * 0.8 },
  ai: { x: WIDTH * 0.5, y: HEIGHT * 0.5 },
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function toRadius(weight: number, mastery: number): number {
  return 6 + weight * 2.1 + (mastery / 100) * 4.5;
}

function normalizeDomain(domain?: SkillDomain): SkillDomain {
  if (!domain) return "tech";
  return domain;
}

function collectSkills(): RawSkill[] {
  return [
    ...(cvData.technicalSkills as RawSkill[]),
    ...(cvData.softSkills as RawSkill[]),
    ...(cvData.transversalSkills as RawSkill[]),
  ];
}

function nodeIdFromEndpoint(endpoint: string | GraphNode): string {
  return typeof endpoint === "string" ? endpoint : endpoint.id;
}

function buildGraphData(): { nodes: GraphNode[]; links: GraphLink[] } {
  const rawSkills = collectSkills();
  const nodesById = new Map<string, GraphNode>();

  rawSkills.forEach((skill) => {
    const id = skill.name.trim();
    if (!id || nodesById.has(id)) return;

    const domain = normalizeDomain(skill.domain);
    const weight = clamp(skill.weight ?? 3, 1, 5);
    const mastery = clamp(skill.mastery ?? 65, 1, 100);
    const anchor = DOMAIN_ANCHOR[domain];

    nodesById.set(id, {
      id,
      label: id,
      domain,
      weight,
      mastery,
      r: toRadius(weight, mastery),
      x: anchor.x + (Math.random() - 0.5) * 90,
      y: anchor.y + (Math.random() - 0.5) * 90,
    });
  });

  const links: GraphLink[] = [];
  const seen = new Set<string>();

  rawSkills.forEach((skill) => {
    const sourceId = skill.name.trim();
    if (!nodesById.has(sourceId)) return;

    (skill.links ?? []).forEach((link) => {
      const targetId = link.target.trim();
      if (!nodesById.has(targetId) || sourceId === targetId) return;

      const key = [sourceId, targetId]
        .sort((a, b) => a.localeCompare(b))
        .join("::");
      if (seen.has(key)) return;

      seen.add(key);
      links.push({
        source: sourceId,
        target: targetId,
        type: link.type,
        description: link.description,
      });
    });
  });

  if (links.length === 0) {
    const byDomain = new Map<SkillDomain, GraphNode[]>();
    nodesById.forEach((node) => {
      const bucket = byDomain.get(node.domain) ?? [];
      bucket.push(node);
      byDomain.set(node.domain, bucket);
    });

    byDomain.forEach((nodes) => {
      for (let i = 1; i < nodes.length; i += 1) {
        links.push({
          source: nodes[i - 1].id,
          target: nodes[i].id,
          type: "conceptual",
        });
      }
    });
  }

  return { nodes: Array.from(nodesById.values()), links };
}

class SkillForceGraph extends LitElement {
  static styles = css`
    :host {
      display: block;
      position: relative;
      width: 100%;
      max-width: 100%;
      overflow: visible;
      margin: 0 1rem;
    }

    .graph-wrap {
      position: relative;
      border: 0;
      background: transparent;
      border-radius: 0;
    }

    /* Isola il clipping solo all'SVG — il bottone vive dentro ma non viene clippato */
    .graph-svg-clip {
      position: relative;
      overflow: visible;
    }

    .graph-svg {
      display: block;
      width: 100%;
      height: auto;
      cursor: grab;
      aspect-ratio: 1080 / 760;
      touch-action: none; /* necessario per pinch-to-zoom via D3 */
      background: var(
        --skills-panel-overlay,
        radial-gradient(
          circle at 50% 35%,
          rgba(255, 255, 255, 0.03),
          transparent 45%
        ),
        linear-gradient(160deg, rgba(255, 255, 255, 0.02), transparent 60%)
      );
    }

    .graph-svg:active {
      cursor: grabbing;
    }

    .force-link {
      transition:
        opacity 220ms ease,
        stroke 220ms ease,
        stroke-width 220ms ease;
    }

    .force-node {
      transition: opacity 220ms ease;
      cursor: pointer;
    }

    .force-node-dot {
      transition:
        filter 220ms ease,
        stroke-width 220ms ease,
        opacity 220ms ease,
        transform 150ms ease;
      transform-box: fill-box;
      transform-origin: center;
    }

    .force-node:hover .force-node-dot {
      transform: scale(1.25);
    }

    .force-node-label {
      font-family: "Lexend", sans-serif;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.02em;
      fill: rgba(245, 240, 230, 0.92);
      text-anchor: middle;
      pointer-events: none;
      user-select: none;
      paint-order: stroke;
      stroke: rgba(8, 73, 67, 0.9);
      stroke-width: 3px;
      stroke-linejoin: round;
    }

    .graph-legend {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.9rem;
      padding: 0.55rem 1rem 0.6rem;
      border-top: 1px solid
        var(--skills-panel-border, rgba(255, 255, 255, 0.05));
    }

    .graph-legend-item {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-family: "Lexend", sans-serif;
      font-size: 0.52rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: rgba(192, 220, 215, 0.6);
    }

    .graph-legend-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .graph-meta {
      padding: 0.5rem;
      margin: 0;
      border-top: 1px solid
        var(--skills-panel-border, rgba(255, 255, 255, 0.05));
      font-family: "JetBrains Mono", monospace;
      font-size: 0.56rem;
      color: rgba(192, 220, 215, 0.58);
      text-align: center;
    }

    /* Mobile: il viewBox (1080×760) porta le label a ~4px reali su 390px.
       Si aumenta la dimensione SVG e si usa uno stroke più spesso.
       Lo zoom iniziale 1.9× porta le label a ~9px effettivi. */
    @media (max-width: 899px) {
      .force-node-label {
        font-size: 13px;
        font-weight: 400;
        stroke-width: 2.5px;
      }
      .graph-meta {
        padding: 0.1rem 0.65rem 0.15rem;
        font-size: 0.5rem;
      }
    }

    /* ── Expand button — position:absolute relativo a graph-svg-clip ── */
    .graph-expand-btn {
      position: absolute;
      bottom: 0.5rem;
      right: 1.5rem;
      width: 2rem;
      height: 2rem;
      border-radius: 4px;
      border: 1px solid rgba(255,255,255,0.18);
      background: rgba(8,73,67,0.92);
      color: rgba(192,220,215,0.8);
      font-size: 0.9rem;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      transition: border-color 0.2s ease, color 0.2s ease, background 0.2s ease;
      z-index: 3;
    }
    .graph-expand-btn:hover {
      border-color: var(--color-accent, rgba(0,255,200,1));
      color: var(--color-accent, rgba(0,255,200,1));
      background: rgba(8,73,67,0.98);
    }
    .graph-expand-btn:focus-visible {
      outline: 2px solid var(--color-accent, rgba(0,255,200,1));
      outline-offset: 2px;
    }

    /* ── Touch hint ── */
    .graph-touch-hint {
      position: absolute;
      bottom: 0.5rem;
      left: 50%;
      transform: translateX(-50%);
      font-family: "Lexend", sans-serif;
      font-size: 0.48rem;
      letter-spacing: 0.09em;
      color: rgba(192,220,215,0.38);
      pointer-events: none;
      white-space: nowrap;
      transition: opacity 0.4s ease;
      z-index: 2;
    }
    .graph-touch-hint--hidden {
      opacity: 0;
    }

    /* ── Fullscreen dialog ── */
    .graph-dialog {
      position: fixed;
      inset: 0;
      width: 100dvw;
      height: 100dvh;
      max-width: 100dvw;
      max-height: 100dvh;
      margin: 0;
      padding: 0;
      border: none;
      background: rgba(8,73,67,1);
      display: flex;
      flex-direction: column;
      z-index: 9999;
    }
    .graph-dialog::backdrop {
      background: rgba(0,0,0,0.7);
    }
    .graph-dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.6rem 1rem;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      flex-shrink: 0;
    }
    .graph-dialog-title {
      font-family: "Lexend", sans-serif;
      font-size: 0.58rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--color-accent, rgba(0,255,200,1));
    }
    .graph-dialog-close {
      background: none;
      border: none;
      color: rgba(192,220,215,0.7);
      font-size: 1.1rem;
      line-height: 1;
      cursor: pointer;
      padding: 0.2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: color 0.2s ease;
    }
    .graph-dialog-close:hover {
      color: rgba(245,240,230,1);
    }
    .graph-dialog-close:focus-visible {
      outline: 2px solid var(--color-accent, rgba(0,255,200,1));
      outline-offset: 2px;
    }
    .graph-dialog-body {
      flex: 1;
      overflow: hidden;
      position: relative;
    }
    .graph-dialog-svg {
      display: block;
      width: 100%;
      height: 100%;
      cursor: grab;
      touch-action: none;
    }
    .graph-dialog-svg:active {
      cursor: grabbing;
    }
    /* In full-screen dialog make labels normal weight for readability */
    .graph-dialog-svg .force-node-label {
      font-weight: 400;
    }
    .graph-dialog-meta {
      padding: 0.3rem 1rem;
      font-family: "JetBrains Mono", monospace;
      font-size: 0.5rem;
      color: rgba(192,220,215,0.5);
      text-align: center;
      border-top: 1px solid rgba(255,255,255,0.05);
      flex-shrink: 0;
    }
  `;

  private _mode: Mode = "tech";
  private _hoveredNodeId: string | null = null;
  private _selectedNodeId: string | null = null;
  private _tooltip: TooltipState | null = null;
  private _tooltipPortal: HTMLElement | null = null;
  private _intersectionObserver: IntersectionObserver | null = null;
  private _nodes: GraphNode[] = [];
  private _links: GraphLink[] = [];
  private _nodeById = new Map<string, GraphNode>();
  private _adjacency = new Map<string, Set<string>>();
  private _autoPinnedNodeIds = new Set<string>();
  private _dialogOpen = false;
  private _touchHintHidden = false;

  private _simulation?: Simulation<GraphNode, GraphLink>;
  private _nodeSelection?: Selection<
    SVGGElement,
    GraphNode,
    SVGGElement,
    unknown
  >;
  private _linkSelection?: Selection<
    SVGLineElement,
    GraphLink,
    SVGGElement,
    unknown
  >;
  private _unsub?: () => void;
  private _releasePinTimer?: number;
  private _zoomBehavior?: ZoomBehavior<SVGSVGElement, unknown>;

  // Dialog fullscreen
  private _dialogSimulation?: Simulation<GraphNode, GraphLink>;
  private _dialogNodeSel?: Selection<SVGGElement, GraphNode, SVGGElement, unknown>;
  private _dialogLinkSel?: Selection<SVGLineElement, GraphLink, SVGGElement, unknown>;
  private _dialogZoom?: ZoomBehavior<SVGSVGElement, unknown>;

  override connectedCallback() {
    super.connectedCallback();
    this._mode = modeStore.get();
    this._unsub = modeStore.subscribe((mode) => {
      this._mode = mode;
      this._applyVisualState();
      this._pinActiveClustersTemporarily();
      this.requestUpdate();
    });
    this._mountTooltipPortal();
  }

  override disconnectedCallback() {
    if (this._releasePinTimer) {
      window.clearTimeout(this._releasePinTimer);
      this._releasePinTimer = undefined;
    }
    this._releasePinnedNodes();
    this._simulation?.stop();
    this._dialogSimulation?.stop();
    this._unsub?.();
    this._destroyTooltipPortal();
    super.disconnectedCallback();
  }

  override firstUpdated() {
    this._buildGraph();
    this._mountGraph();

    // Restore touch hint visibility from sessionStorage
    try {
      if (sessionStorage.getItem("graph-hint-seen")) {
        this._touchHintHidden = true;
      }
    } catch { /* noop */ }
  }

  override updated() {
    this._syncTooltipPortal();
  }

  private _mountTooltipPortal() {
    if (this._tooltipPortal) return;

    /* Inietta il CSS una sola volta nel <head> globale. */
    if (!document.getElementById("skill-graph-tooltip-styles")) {
      const style = document.createElement("style");
      style.id = "skill-graph-tooltip-styles";
      style.textContent = `
        @keyframes skill-graph-tooltip-in {
          from { opacity: 0; transform: translateX(12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .skill-graph-tooltip-portal {
          position: fixed;
          top: 5rem;
          right: 1.25rem;
          z-index: 9999;
          width: min(300px, calc(100vw - 2.5rem));
          padding: 0.75rem 0.85rem;
          border-radius: 3px;
          border-top: 1px solid rgba(255,255,255,0.12);
          border-right: 1px solid rgba(255,255,255,0.12);
          border-bottom: 1px solid rgba(255,255,255,0.12);
          border-left: 3px solid rgba(0,255,200,1);
          background: rgba(6,58,53,0.97);
          box-shadow: 0 12px 40px rgba(0,0,0,0.5);
          pointer-events: none;
          font-family: 'Lexend', sans-serif;
          animation: skill-graph-tooltip-in 200ms ease forwards;
        }
        .skill-graph-tooltip-portal .graph-tooltip__title {
          margin: 0;
          font-size: 0.66rem;
          font-weight: 700;
          letter-spacing: 0.03em;
          color: rgba(245,240,230,0.96);
        }
        .skill-graph-tooltip-portal .graph-tooltip__meta {
          margin: 0.2rem 0 0;
          font-size: 0.56rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(192,220,215,0.82);
        }
        .skill-graph-tooltip-portal .graph-tooltip__list {
          margin: 0.5rem 0 0;
          padding: 0;
          list-style: none;
          display: grid;
          gap: 0.36rem;
        }
        .skill-graph-tooltip-portal .graph-tooltip__item {
          border-top: 1px solid rgba(255,255,255,0.08);
          padding-top: 0.36rem;
        }
        .skill-graph-tooltip-portal .graph-tooltip__row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          font-size: 0.56rem;
          color: rgba(245,240,230,0.9);
        }
        .skill-graph-tooltip-portal .graph-tooltip__type {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.5rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: rgba(192,220,215,0.88);
        }
        .skill-graph-tooltip-portal .graph-tooltip__desc {
          margin: 0.15rem 0 0;
          font-size: 0.5rem;
          color: rgba(192,220,215,0.68);
          line-height: 1.35;
        }
      `;
      document.head.appendChild(style);
    }

    this._tooltipPortal = document.createElement("aside");
    this._tooltipPortal.className = "skill-graph-tooltip-portal";
    this._tooltipPortal.setAttribute("aria-hidden", "true");
    this._tooltipPortal.hidden = true;
    document.body.appendChild(this._tooltipPortal);

    /* Nasconde il tooltip quando il componente esce dal viewport. */
    this._intersectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            if (this._tooltipPortal) this._tooltipPortal.hidden = true;
            this._tooltip = null;
            this._selectedNodeId = null;
            this._applyVisualState();
            this.requestUpdate();
          }
        }
      },
      { threshold: 0.05 },
    );
    this._intersectionObserver.observe(this);
  }

  private _destroyTooltipPortal() {
    this._tooltipPortal?.remove();
    this._tooltipPortal = null;
    this._intersectionObserver?.disconnect();
    this._intersectionObserver = null;
  }

  private _syncTooltipPortal() {
    const portal = this._tooltipPortal;
    if (!portal) return;

    const tooltip = this._tooltip;
    if (!tooltip) {
      portal.hidden = true;
      return;
    }

    const node = this._nodeById.get(tooltip.nodeId);
    if (!node) {
      portal.hidden = true;
      return;
    }

    const insights = this._getLinkInsights(node.id).slice(0, 5);
    const domainLabel = DOMAIN_LABEL[node.domain] ?? node.domain;

    portal.style.borderLeftColor = DOMAIN_COLOR[node.domain];
    litRender(
      html`
        <p class="graph-tooltip__title">${node.label}</p>
        <p class="graph-tooltip__meta">
          ${domainLabel} · peso ${node.weight}/5 · padronanza ${node.mastery}%
        </p>
        <ul class="graph-tooltip__list">
          ${insights.length > 0
          ? insights.map(
            (insight) => html`
                  <li class="graph-tooltip__item">
                    <div class="graph-tooltip__row">
                      <span>${insight.id}</span>
                      <span class="graph-tooltip__type">${insight.type}</span>
                    </div>
                    ${insight.description
                ? html`<p class="graph-tooltip__desc">${insight.description}</p>`
                : null}
                  </li>
                `,
          )
          : html`
                <li class="graph-tooltip__item">
                  <p class="graph-tooltip__desc">
                    Nessuna relazione collegata a questo nodo.
                  </p>
                </li>
              `}
        </ul>
      `,
      portal,
    );
    /* Ri-triggera l’animazione ad ogni cambio nodo */
    portal.hidden = false;
  }

  private _hideTouchHint() {
    if (this._touchHintHidden) return;
    this._touchHintHidden = true;
    try { sessionStorage.setItem("graph-hint-seen", "1"); } catch { /* noop */ }
    this.requestUpdate();
  }

  private _openDialog() {
    this._dialogOpen = true;
    this.requestUpdate();
    // Mount dialog graph after render
    this.updateComplete.then(() => {
      this._mountDialogGraph();
      const dialog = this.renderRoot.querySelector<HTMLDialogElement>(".graph-dialog");
      dialog?.showModal();
    });
  }

  private _closeDialog() {
    const dialog = this.renderRoot.querySelector<HTMLDialogElement>(".graph-dialog");
    dialog?.close();
    this._dialogSimulation?.stop();
    this._dialogOpen = false;
    this.requestUpdate();
  }

  private _mountDialogGraph() {
    const svg = this.renderRoot.querySelector<SVGSVGElement>(".graph-dialog-svg");
    if (!svg) return;

    const root = select(svg);
    root.selectAll("*").remove();

    const zoomRoot = root.append("g").attr("class", "zoom-root");
    const linksLayer = zoomRoot.append("g").attr("class", "force-links");
    const nodesLayer = zoomRoot.append("g").attr("class", "force-nodes");

    const mobileZoom = window.innerWidth < 900 ? 1.6 : INITIAL_ZOOM;
    this._dialogZoom = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.85, 6])
      .on("zoom", (event: D3ZoomEvent<SVGSVGElement, unknown>) => {
        zoomRoot.attr("transform", event.transform.toString());
      });
    root.call(this._dialogZoom);
    root.call(
      this._dialogZoom.transform,
      zoomIdentity
        .translate((WIDTH * (1 - mobileZoom)) / 2, (HEIGHT * (1 - mobileZoom)) / 2)
        .scale(mobileZoom),
    );
    root.on("dblclick.zoom", null);

    // Clone shared node/link data — positions are already settled from main simulation
    const clonedNodes: GraphNode[] = this._nodes.map((n) => ({ ...n }));
    const nodeMap = new Map(clonedNodes.map((n) => [n.id, n]));

    const clonedLinks: GraphLink[] = this._links.map((l) => ({
      source: nodeIdFromEndpoint(l.source),
      target: nodeIdFromEndpoint(l.target),
      type: l.type,
      description: l.description,
    }));

    this._dialogLinkSel = linksLayer
      .selectAll<SVGLineElement, GraphLink>("line")
      .data(clonedLinks)
      .join("line")
      .attr("class", "force-link")
      .attr("stroke-width", 1.1)
      .attr("stroke-linecap", "round")
      .attr("opacity", 0.3)
      .attr("stroke", (l) => {
        const s = nodeMap.get(typeof l.source === "string" ? l.source : l.source.id);
        return s ? DOMAIN_COLOR[s.domain] : "rgba(192,220,215,0.42)";
      });

    this._dialogNodeSel = nodesLayer
      .selectAll<SVGGElement, GraphNode>("g")
      .data(clonedNodes)
      .join((enter) => {
        const g = enter.append("g").attr("class", "force-node");
        g.append("circle")
          .attr("class", "force-node-dot")
          .attr("r", (n) => n.r)
          .attr("fill", (n) => DOMAIN_COLOR[n.domain])
          .attr("fill-opacity", 0.88)
          .attr("stroke", "rgba(8,73,67,0.9)")
          .attr("stroke-width", 1.2);
        g.append("text")
          .attr("class", "force-node-label")
          .attr("dy", (n) => n.r + 11)
          .attr("opacity", 1)
          .text((n) => n.label);
        return g;
      });

    // Abilita tap/click selezione anche su mobile fullscreen
    this._dialogNodeSel
      .on("mouseenter", (_event: MouseEvent, node) => {
        if (window.innerWidth >= 900) {
          this._hoveredNodeId = node.id;
          this._applyVisualState();
          this.requestUpdate();
        }
      })
      .on("mouseleave", () => {
        if (window.innerWidth >= 900) {
          this._hoveredNodeId = null;
          this._applyVisualState();
          this.requestUpdate();
        }
      })
      .on("click", (event: MouseEvent, node) => {
        event.stopPropagation();
        if (this._selectedNodeId === node.id) {
          this._selectedNodeId = null;
          this._tooltip = null;
        } else {
          this._selectedNodeId = node.id;
          this._updateTooltip(event, node.id);
        }
        this._applyVisualState();
        this.requestUpdate();
      });

    // Click/tap su sfondo SVG chiude la selezione
    root.on("click", () => {
      if (this._selectedNodeId) {
        this._selectedNodeId = null;
        this._tooltip = null;
        this.requestUpdate();
      }
    });

    // Apply mode visual state
    this._dialogNodeSel.attr("opacity", (n) =>
      this._isModeActive(n.domain) ? 1 : 0.22,
    );

    this._dialogSimulation = forceSimulation<GraphNode>(clonedNodes)
      .force("link", forceLink<GraphNode, GraphLink>(clonedLinks)
        .id((n) => n.id)
        .distance((l) => {
          const s = nodeMap.get(typeof l.source === "string" ? l.source : (l.source as GraphNode).id);
          const t = nodeMap.get(typeof l.target === "string" ? l.target : (l.target as GraphNode).id);
          return s && t && s.domain === t.domain ? 90 : 142;
        })
        .strength(0.2))
      .force("charge", forceManyBody<GraphNode>().strength((n) => -48 - n.weight * 12))
      .force("collide", forceCollide<GraphNode>().radius((n) => n.r + 16).strength(0.95))
      .force("center", forceCenter(WIDTH / 2, HEIGHT / 2))
      .force("x", forceX<GraphNode>((n) => DOMAIN_ANCHOR[n.domain].x).strength(0.06))
      .force("y", forceY<GraphNode>((n) => DOMAIN_ANCHOR[n.domain].y).strength(0.06))
      .alpha(0.3)
      .alphaDecay(0.04)
      .alphaMin(0.01)
      .on("tick", () => {
        this._dialogLinkSel
          ?.attr("x1", (l) => { const n = nodeMap.get(typeof l.source === "string" ? l.source : (l.source as GraphNode).id); return clamp(n?.x ?? WIDTH / 2, n?.r ?? 0, WIDTH - (n?.r ?? 0)); })
          .attr("y1", (l) => { const n = nodeMap.get(typeof l.source === "string" ? l.source : (l.source as GraphNode).id); return clamp(n?.y ?? HEIGHT / 2, n?.r ?? 0, HEIGHT - (n?.r ?? 0)); })
          .attr("x2", (l) => { const n = nodeMap.get(typeof l.target === "string" ? l.target : (l.target as GraphNode).id); return clamp(n?.x ?? WIDTH / 2, n?.r ?? 0, WIDTH - (n?.r ?? 0)); })
          .attr("y2", (l) => { const n = nodeMap.get(typeof l.target === "string" ? l.target : (l.target as GraphNode).id); return clamp(n?.y ?? HEIGHT / 2, n?.r ?? 0, HEIGHT - (n?.r ?? 0)); });
        this._dialogNodeSel?.attr("transform", (n) =>
          `translate(${clamp(n.x ?? WIDTH / 2, n.r, WIDTH - n.r)},${clamp(n.y ?? HEIGHT / 2, n.r, HEIGHT - n.r)})`,
        );
      });
  }

  private _buildGraph() {
    const { nodes, links } = buildGraphData();
    this._nodes = nodes;
    this._links = links;
    this._nodeById = new Map(this._nodes.map((node) => [node.id, node]));

    this._adjacency.clear();
    this._nodes.forEach((node) => {
      this._adjacency.set(node.id, new Set());
    });

    this._links.forEach((link) => {
      const sourceId = nodeIdFromEndpoint(link.source);
      const targetId = nodeIdFromEndpoint(link.target);
      this._adjacency.get(sourceId)?.add(targetId);
      this._adjacency.get(targetId)?.add(sourceId);
    });
  }

  private _mountGraph() {
    const svg = this.renderRoot.querySelector<SVGSVGElement>(".graph-svg");
    if (!svg) return;

    const root = select(svg);
    root.selectAll("*").remove();

    // Zoom root — wraps all layers so pan/zoom is applied to a single group
    const zoomRoot = root.append("g").attr("class", "zoom-root");
    const linksLayer = zoomRoot.append("g").attr("class", "force-links");
    const nodesLayer = zoomRoot.append("g").attr("class", "force-nodes");

    // D3 zoom behavior — supports pinch-to-zoom natively on touch devices
    this._zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.85, 5])
      .on("zoom", (event: D3ZoomEvent<SVGSVGElement, unknown>) => {
        zoomRoot.attr("transform", event.transform.toString());
      });
    root.call(this._zoomBehavior);
    const mobileZoom = window.innerWidth < 900 ? 1.9 : INITIAL_ZOOM;
    root.call(
      this._zoomBehavior.transform,
      zoomIdentity
        .translate((WIDTH * (1 - mobileZoom)) / 2, (HEIGHT * (1 - mobileZoom)) / 2)
        .scale(mobileZoom),
    );
    // Double-click zooms in by default — disable to avoid conflict with node selection
    root.on("dblclick.zoom", null);
    // Click on the SVG background closes the open tooltip
    root.on("click", () => {
      if (this._selectedNodeId) {
        this._selectedNodeId = null;
        this._tooltip = null;
        this.requestUpdate();
      }
    });

    this._linkSelection = linksLayer
      .selectAll<SVGLineElement, GraphLink>("line")
      .data(this._links)
      .join("line")
      .attr("class", "force-link")
      .attr("stroke-width", 1.1)
      .attr("stroke-linecap", "round")
      .attr("stroke-dasharray", "6 8")
      .attr("stroke-dashoffset", 24);

    this._nodeSelection = nodesLayer
      .selectAll<SVGGElement, GraphNode>("g")
      .data(this._nodes)
      .join((enter) => {
        const g = enter.append("g").attr("class", "force-node");

        g.append("circle")
          .attr("class", "force-node-dot")
          .attr("r", 1.8)
          .attr("fill", (node) => DOMAIN_COLOR[node.domain])
          .attr("fill-opacity", 0.22)
          .attr("stroke", "rgba(8,73,67,0.9)")
          .attr("stroke-width", 0.85)
          .attr("filter", "blur(0.8px)");

        g.append("text")
          .attr("class", "force-node-label")
          .attr("dy", (node) => node.r + 11)
          .attr("opacity", 0)
          .text((node) => node.label);

        return g;
      });

    this._nodeSelection
      .on("mouseenter", (_event: MouseEvent, node) => {
        this._hoveredNodeId = node.id;
        this._applyVisualState();
        this.requestUpdate();
      })
      .on("mouseleave", () => {
        this._hoveredNodeId = null;
        this._applyVisualState();
        this.requestUpdate();
      })
      .on("click", (event: MouseEvent, node) => {
        event.stopPropagation();
        if (this._selectedNodeId === node.id) {
          // Toggle off
          this._selectedNodeId = null;
          this._tooltip = null;
        } else {
          this._selectedNodeId = node.id;
          this._updateTooltip(event, node.id);
        }
        this._applyVisualState();
        this.requestUpdate();
      });

    this._nodeSelection.call(
      drag<SVGGElement, GraphNode>()
        .on(
          "start",
          (event: D3DragEvent<SVGGElement, GraphNode, GraphNode>, node) => {
            if (!event.active) this._simulation?.alphaTarget(0.25).restart();
            this._tooltip = null;
            node.fx = node.x;
            node.fy = node.y;
          },
        )
        .on(
          "drag",
          (event: D3DragEvent<SVGGElement, GraphNode, GraphNode>, node) => {
            node.fx = clamp(event.x, node.r, WIDTH - node.r);
            node.fy = clamp(event.y, node.r, HEIGHT - node.r);
          },
        )
        .on(
          "end",
          (event: D3DragEvent<SVGGElement, GraphNode, GraphNode>, node) => {
            if (!event.active) this._simulation?.alphaTarget(0);
            node.fx = null;
            node.fy = null;
          },
        ),
    );

    this._simulation = forceSimulation<GraphNode>(this._nodes)
      .force(
        "link",
        forceLink<GraphNode, GraphLink>(this._links)
          .id((node) => node.id)
          .distance((link) => {
            const source = this._resolveNode(link.source);
            const target = this._resolveNode(link.target);
            if (!source || !target) return 96;
            return source.domain === target.domain ? 90 : 142;
          })
          .strength((link) => {
            const source = this._resolveNode(link.source);
            const target = this._resolveNode(link.target);
            if (!source || !target) return 0.14;
            return source.domain === target.domain ? 0.34 : 0.12;
          }),
      )
      .force(
        "charge",
        forceManyBody<GraphNode>().strength((node) => -48 - node.weight * 12),
      )
      .force(
        "collide",
        forceCollide<GraphNode>()
          .radius((node) => node.r + 16)
          .strength(0.95),
      )
      .force("center", forceCenter(WIDTH / 2, HEIGHT / 2))
      .force(
        "x",
        forceX<GraphNode>((node) => DOMAIN_ANCHOR[node.domain].x).strength(
          (node) => {
            return node.domain === "ai" ? 0.04 : 0.06;
          },
        ),
      )
      .force(
        "y",
        forceY<GraphNode>((node) => DOMAIN_ANCHOR[node.domain].y).strength(
          (node) => {
            return node.domain === "ai" ? 0.04 : 0.06;
          },
        ),
      )
      .alpha(1.1)
      .alphaDecay(0.028)
      .alphaMin(0.01)
      .on("tick", () => {
        this._linkSelection
          ?.attr("x1", (link) => this._safeX(this._resolveNode(link.source)))
          .attr("y1", (link) => this._safeY(this._resolveNode(link.source)))
          .attr("x2", (link) => this._safeX(this._resolveNode(link.target)))
          .attr("y2", (link) => this._safeY(this._resolveNode(link.target)));

        this._nodeSelection?.attr("transform", (node) => {
          const x = this._safeX(node);
          const y = this._safeY(node);
          return `translate(${x},${y})`;
        });
      });

    this._runCinematicEntryAnimation();
    this._pinActiveClustersTemporarily(1200);
    this._applyVisualState();
  }

  private _runCinematicEntryAnimation() {
    const indexById = new Map(
      this._nodes.map((node, index) => [node.id, index]),
    );

    this._nodeSelection
      ?.select<SVGCircleElement>(".force-node-dot")
      .transition()
      .delay((node) => {
        const lane = this._isModeActive(node.domain) ? 0 : 180;
        const idx = indexById.get(node.id) ?? 0;
        return lane + idx * 28;
      })
      .duration(800)
      .ease(easeCubicOut)
      .attr("r", (node) => node.r)
      .attr("fill-opacity", 0.88)
      .attr("stroke-width", 1.2)
      .attr("filter", "none");

    this._nodeSelection
      ?.select<SVGTextElement>(".force-node-label")
      .transition()
      .delay((node) => {
        const lane = this._isModeActive(node.domain) ? 110 : 260;
        const idx = indexById.get(node.id) ?? 0;
        return lane + idx * 28;
      })
      .duration(360)
      .ease(easeCubicOut)
      .attr("opacity", 1);

    this._linkSelection
      ?.transition()
      .delay((_link, index) => 180 + index * 8)
      .duration(560)
      .ease(easeCubicOut)
      .attr("stroke-dashoffset", 0)
      .on("end", function () {
        select(this).attr("stroke-dasharray", null);
      });
  }

  private _releasePinnedNodes() {
    this._autoPinnedNodeIds.forEach((nodeId) => {
      const node = this._nodeById.get(nodeId);
      if (!node) return;
      node.fx = null;
      node.fy = null;
    });
    this._autoPinnedNodeIds.clear();
  }

  private _pinActiveClustersTemporarily(duration = PIN_DURATION_MS) {
    if (!this._simulation || this._nodes.length === 0) return;

    if (this._releasePinTimer) {
      window.clearTimeout(this._releasePinTimer);
      this._releasePinTimer = undefined;
    }

    this._releasePinnedNodes();

    const activeNodes = this._nodes.filter((node) =>
      this._isModeActive(node.domain),
    );
    if (activeNodes.length === 0) return;

    activeNodes.forEach((node, index) => {
      const anchor = DOMAIN_ANCHOR[node.domain];
      const orbit = 24 + (index % 6) * 7;
      const angle = (index / activeNodes.length) * Math.PI * 2;
      node.fx = clamp(
        anchor.x + Math.cos(angle) * orbit,
        node.r,
        WIDTH - node.r,
      );
      node.fy = clamp(
        anchor.y + Math.sin(angle) * orbit,
        node.r,
        HEIGHT - node.r,
      );
      this._autoPinnedNodeIds.add(node.id);
    });

    this._simulation.alphaTarget(0.24).restart();

    this._releasePinTimer = window.setTimeout(() => {
      this._releasePinnedNodes();
      this._simulation?.alphaTarget(0).alpha(0.42).restart();
      this._releasePinTimer = undefined;
    }, duration);
  }

  private _updateTooltip(_event: MouseEvent, nodeId: string) {
  /* Su mobile non mostriamo la scheda. */
    if (window.innerWidth < 900) return;
    /* Posizione fissa top-right — nessun calcolo coordinate necessario. */
    this._tooltip = { nodeId, x: 0, y: 0 };
  }

  private _getLinkInsights(nodeId: string): LinkInsight[] {
    const insights: LinkInsight[] = [];

    this._links.forEach((link) => {
      const sourceId = nodeIdFromEndpoint(link.source);
      const targetId = nodeIdFromEndpoint(link.target);

      if (sourceId !== nodeId && targetId !== nodeId) return;

      const peerId = sourceId === nodeId ? targetId : sourceId;
      const peerNode = this._nodeById.get(peerId);
      if (!peerNode) return;

      insights.push({
        id: peerNode.label,
        type: LINK_TYPE_LABEL[link.type] ?? link.type,
        description: link.description,
      });
    });

    return insights.sort((a, b) => a.id.localeCompare(b.id));
  }

  private _resolveNode(endpoint: string | GraphNode): GraphNode | undefined {
    if (typeof endpoint !== "string") return endpoint;
    return this._nodeById.get(endpoint);
  }

  private _safeX(node: GraphNode | undefined): number {
    if (!node) return WIDTH / 2;
    return clamp(node.x ?? WIDTH / 2, node.r, WIDTH - node.r);
  }

  private _safeY(node: GraphNode | undefined): number {
    if (!node) return HEIGHT / 2;
    return clamp(node.y ?? HEIGHT / 2, node.r, HEIGHT - node.r);
  }

  private _isModeActive(domain: SkillDomain): boolean {
    if (this._mode === "tech") {
      return domain === "tech" || domain === "ai";
    }
    return domain === this._mode;
  }

  private _isConnectedToHovered(nodeId: string): boolean {
    const ref = this._hoveredNodeId ?? this._selectedNodeId;
    if (!ref) return false;
    return this._adjacency.get(ref)?.has(nodeId) ?? false;
  }

  private _applyVisualState() {
    const hoveredId = this._hoveredNodeId;
    const selectedId = this._selectedNodeId;
    const activeId = hoveredId ?? selectedId;

    // Inline graph
    this._nodeSelection?.attr("opacity", (node) => {
      const modeOpacity = this._isModeActive(node.domain) ? 1 : 0.22;
      if (!activeId) return modeOpacity;
      if (node.id === activeId) return 1;
      if (this._isConnectedToHovered(node.id))
        return Math.max(0.75, modeOpacity);
      return Math.min(0.12, modeOpacity);
    });
    this._nodeSelection
      ?.select<SVGCircleElement>(".force-node-dot")
      .attr("stroke-width", (node) => {
        if (node.id === selectedId) return 2.8;
        if (node.id === hoveredId) return 2.3;
        if (activeId && this._isConnectedToHovered(node.id)) return 2.1;
        return 1.2;
      })
      .attr("stroke", (node) => {
        if (node.id === selectedId || node.id === hoveredId)
          return "rgba(245,240,230,0.98)";
        if (activeId && this._isConnectedToHovered(node.id))
          return DOMAIN_COLOR[node.domain];
        return "rgba(8,73,67,0.9)";
      })
      .attr("filter", (node) => {
        if (node.id === selectedId) {
          return `drop-shadow(0 0 12px ${DOMAIN_COLOR[node.domain]})`;
        }
        if (node.id === hoveredId) {
          return `drop-shadow(0 0 8px ${DOMAIN_COLOR[node.domain]})`;
        }
        if (activeId && this._isConnectedToHovered(node.id)) {
          return `drop-shadow(0 0 6px ${DOMAIN_COLOR[node.domain]})`;
        }
        return "none";
      });
    this._linkSelection
      ?.attr("opacity", (link) => {
        const sourceId = nodeIdFromEndpoint(link.source);
        const targetId = nodeIdFromEndpoint(link.target);
        const sourceNode = this._resolveNode(link.source);
        const targetNode = this._resolveNode(link.target);
        const modeActive =
          !!sourceNode && !!targetNode
            ? this._isModeActive(sourceNode.domain) ||
            this._isModeActive(targetNode.domain)
            : true;
        const baseOpacity = modeActive ? 0.4 : 0.14;
        if (!activeId) return baseOpacity;
        if (sourceId === activeId || targetId === activeId) return 0.9;
        return 0.05;
      })
      .attr("stroke-width", (link) => {
        const sourceId = nodeIdFromEndpoint(link.source);
        const targetId = nodeIdFromEndpoint(link.target);
        if (activeId && (sourceId === activeId || targetId === activeId))
          return 1.8;
        return 1.1;
      })
      .attr("stroke", (link) => {
        const sourceNode = this._resolveNode(link.source);
        if (!sourceNode) return "rgba(192,220,215,0.42)";
        return DOMAIN_COLOR[sourceNode.domain];
      });

    // Dialog fullscreen graph
    this._dialogNodeSel?.attr("opacity", (node) => {
      const modeOpacity = this._isModeActive(node.domain) ? 1 : 0.22;
      if (!activeId) return modeOpacity;
      if (node.id === activeId) return 1;
      if (this._isConnectedToHovered(node.id))
        return Math.max(0.75, modeOpacity);
      return Math.min(0.12, modeOpacity);
    });
    this._dialogNodeSel
      ?.select<SVGCircleElement>(".force-node-dot")
      .attr("stroke-width", (node) => {
        if (node.id === selectedId) return 2.8;
        if (node.id === hoveredId) return 2.3;
        if (activeId && this._isConnectedToHovered(node.id)) return 2.1;
        return 1.2;
      })
      .attr("stroke", (node) => {
        if (node.id === selectedId || node.id === hoveredId)
          return "rgba(245,240,230,0.98)";
        if (activeId && this._isConnectedToHovered(node.id))
          return DOMAIN_COLOR[node.domain];
        return "rgba(8,73,67,0.9)";
      })
      .attr("filter", (node) => {
        if (node.id === selectedId) {
          return `drop-shadow(0 0 12px ${DOMAIN_COLOR[node.domain]})`;
        }
        if (node.id === hoveredId) {
          return `drop-shadow(0 0 8px ${DOMAIN_COLOR[node.domain]})`;
        }
        if (activeId && this._isConnectedToHovered(node.id)) {
          return `drop-shadow(0 0 6px ${DOMAIN_COLOR[node.domain]})`;
        }
        return "none";
      });
    this._dialogLinkSel
      ?.attr("opacity", (link) => {
        const sourceId = nodeIdFromEndpoint(link.source);
        const targetId = nodeIdFromEndpoint(link.target);
        const sourceNode = this._resolveNode(link.source);
        const targetNode = this._resolveNode(link.target);
        const modeActive =
          !!sourceNode && !!targetNode
            ? this._isModeActive(sourceNode.domain) ||
              this._isModeActive(targetNode.domain)
            : true;
        const baseOpacity = modeActive ? 0.4 : 0.14;
        if (!activeId) return baseOpacity;
        if (sourceId === activeId || targetId === activeId) return 0.9;
        return 0.05;
      })
      .attr("stroke-width", (link) => {
        const sourceId = nodeIdFromEndpoint(link.source);
        const targetId = nodeIdFromEndpoint(link.target);
        if (activeId && (sourceId === activeId || targetId === activeId))
          return 1.8;
        return 1.1;
      })
      .attr("stroke", (link) => {
        const sourceNode = this._resolveNode(link.source);
        if (!sourceNode) return "rgba(192,220,215,0.42)";
        return DOMAIN_COLOR[sourceNode.domain];
      });
  }

  private _getMetaText(): string {
    const isMobile = window.innerWidth < 640;
    const baseHint = isMobile
      ? "Tocca un nodo per esplorare"
      : "Tocca un nodo per esplorare le connessioni \u00b7 Trascina per riorganizzare la rete";
    if (!this._hoveredNodeId) return baseHint;

    const node = this._nodeById.get(this._hoveredNodeId);
    if (!node) return baseHint;

    if (isMobile) {
      return `${node.label} \u00b7 peso ${node.weight}/5 \u00b7 padronanza ${node.mastery}%`;
    }

    const linkedNames = Array.from(this._adjacency.get(node.id) ?? [])
      .slice(0, 6)
      .join(", ");

    const domainLabel = DOMAIN_LABEL[node.domain] ?? node.domain;
    const connectionLabel =
      linkedNames.length > 0 ? linkedNames : "nessuna connessione diretta";
    return `${node.label} · ${domainLabel} · peso ${node.weight}/5 · padronanza ${node.mastery}% · connessioni: ${connectionLabel}`;
  }

  private _renderTooltip() {
    const tooltip = this._tooltip;
    if (!tooltip) return null;

    const node = this._nodeById.get(tooltip.nodeId);
    if (!node) return null;

    const insights = this._getLinkInsights(node.id).slice(0, 5);
    const domainLabel = DOMAIN_LABEL[node.domain] ?? node.domain;

    return html`
      <aside
        class="graph-tooltip"
        style="border-left-color:${DOMAIN_COLOR[node.domain]};"
        aria-hidden="true"
      >
        <p class="graph-tooltip__title">${node.label}</p>
        <p class="graph-tooltip__meta">
          ${domainLabel} · peso ${node.weight}/5 · padronanza ${node.mastery}%
        </p>
        <ul class="graph-tooltip__list">
          ${insights.length > 0
            ? insights.map(
                (insight) => html`
                  <li class="graph-tooltip__item">
                    <div class="graph-tooltip__row">
                      <span>${insight.id}</span>
                      <span class="graph-tooltip__type">${insight.type}</span>
                    </div>
                    ${insight.description
                  ? html`<p class="graph-tooltip__desc">${insight.description}</p>`
                  : null}
                  </li>
                `,
              )
            : html`
                <li class="graph-tooltip__item">
                  <p class="graph-tooltip__desc">
                    Nessuna relazione collegata a questo nodo.
                  </p>
                </li>
              `}
        </ul>
      </aside>
    `;
  }

  override render() {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 900;

    return html`
      <div class="graph-wrap">
        <div class="graph-svg-clip">
          <svg
            class="graph-svg"
            viewBox="0 0 ${WIDTH} ${HEIGHT}"
            role="img"
            aria-label="Force-directed network graph of skills"
            @touchstart=${this._hideTouchHint}
          ></svg>

          ${isMobile ? html`
            <span class="graph-touch-hint ${this._touchHintHidden ? "graph-touch-hint--hidden" : ""}">
              Trascina · Pizzica per zoom
            </span>
            <button
              class="graph-expand-btn"
              @click=${this._openDialog}
              aria-label="Espandi grafico a schermo intero"
              title="Schermo intero"
              type="button"
            >⛶</button>
          ` : ""}
        </div>

        <p class="graph-meta">${this._getMetaText()}</p>
      </div>

      ${this._dialogOpen ? html`
        <dialog
          class="graph-dialog"
          aria-label="Grafico skill — schermo intero"
          @cancel=${this._closeDialog}
          @click=${(e: MouseEvent) => { if (e.target === e.currentTarget) this._closeDialog(); }}
        >
          <div class="graph-dialog-header">
            <span class="graph-dialog-title">✦ Mappa delle Skill</span>
            <button
              class="graph-dialog-close"
              @click=${this._closeDialog}
              aria-label="Chiudi schermo intero"
              type="button"
            >✕</button>
          </div>
          <div class="graph-dialog-body">
            <svg
              class="graph-dialog-svg"
              viewBox="0 0 ${WIDTH} ${HEIGHT}"
              role="img"
              aria-label="Grafico skill a schermo intero"
            ></svg>
          </div>
          <p class="graph-dialog-meta">Trascina · Pizzica per zoom · Premi Esc per chiudere</p>
        </dialog>
      ` : ""}
    `;
  }
}

if (!customElements.get("skill-force-graph")) {
  customElements.define("skill-force-graph", SkillForceGraph);
}

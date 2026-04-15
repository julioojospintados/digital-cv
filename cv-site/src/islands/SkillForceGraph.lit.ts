import { LitElement, html, css } from "lit";
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
      overflow: hidden;
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
        opacity 220ms ease;
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

    .graph-tooltip {
      position: absolute;
      z-index: 4;
      width: min(320px, calc(100% - 1.25rem));
      padding: 0.6rem 0.7rem;
      border-radius: 2px;
      border: 1px solid rgba(255, 255, 255, 0.18);
      background: rgba(8, 73, 67, 0.96);
      box-shadow: 0 8px 28px rgba(0, 0, 0, 0.38);
      pointer-events: none;
      font-family: "Lexend", sans-serif;
    }

    .graph-tooltip__title {
      margin: 0;
      font-size: 0.66rem;
      font-weight: 700;
      letter-spacing: 0.03em;
      color: rgba(245, 240, 230, 0.96);
    }

    .graph-tooltip__meta {
      margin: 0.2rem 0 0;
      font-size: 0.56rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: rgba(192, 220, 215, 0.82);
    }

    .graph-tooltip__list {
      margin: 0.5rem 0 0;
      padding: 0;
      list-style: none;
      display: grid;
      gap: 0.36rem;
    }

    .graph-tooltip__item {
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 0.36rem;
    }

    .graph-tooltip__row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      font-size: 0.56rem;
      color: rgba(245, 240, 230, 0.9);
    }

    .graph-tooltip__type {
      font-family: "JetBrains Mono", monospace;
      font-size: 0.5rem;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: rgba(192, 220, 215, 0.88);
    }

    .graph-tooltip__desc {
      margin: 0.15rem 0 0;
      font-size: 0.5rem;
      color: rgba(192, 220, 215, 0.68);
      line-height: 1.35;
    }

    /* Mobile: il viewBox (1080×760) porta le label a ~4px reali su 390px.
       Si aumenta la dimensione SVG e si usa uno stroke più spesso.
       Lo zoom iniziale 1.9× porta le label a ~9px effettivi. */
    @media (max-width: 899px) {
      .force-node-label {
        font-size: 13px;
        font-weight: 500;
        stroke-width: 4px;
      }
      .graph-meta {
        padding: 0.1rem 0.65rem 0.15rem;
        font-size: 0.5rem;
      }
      .graph-tooltip {
        width: min(220px, calc(100% - 1rem));
        padding: 0.42rem 0.5rem;
      }
    }
  `;

  private _mode: Mode = "tech";
  private _hoveredNodeId: string | null = null;
  private _tooltip: TooltipState | null = null;
  private _nodes: GraphNode[] = [];
  private _links: GraphLink[] = [];
  private _nodeById = new Map<string, GraphNode>();
  private _adjacency = new Map<string, Set<string>>();
  private _autoPinnedNodeIds = new Set<string>();

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

  override connectedCallback() {
    super.connectedCallback();
    this._mode = modeStore.get();
    this._unsub = modeStore.subscribe((mode) => {
      this._mode = mode;
      this._applyVisualState();
      this._pinActiveClustersTemporarily();
      this.requestUpdate();
    });
  }

  override disconnectedCallback() {
    if (this._releasePinTimer) {
      window.clearTimeout(this._releasePinTimer);
      this._releasePinTimer = undefined;
    }
    this._releasePinnedNodes();
    this._simulation?.stop();
    this._unsub?.();
    super.disconnectedCallback();
  }

  override firstUpdated() {
    this._buildGraph();
    this._mountGraph();
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
      .scaleExtent([0.5, 5])
      .on("zoom", (event: D3ZoomEvent<SVGSVGElement, unknown>) => {
        zoomRoot.attr("transform", event.transform.toString());
      });
    root.call(this._zoomBehavior);
    // const mobileZoom = window.innerWidth < 640 ? 1.9 : INITIAL_ZOOM;
    root.call(
      this._zoomBehavior.transform,
      zoomIdentity
        .translate((WIDTH * (1 - INITIAL_ZOOM)) / 2, (HEIGHT * (1 - INITIAL_ZOOM)) / 2)
        .scale(INITIAL_ZOOM),
    );
    // Double-click zooms in by default — disable to avoid conflict with node selection
    root.on("dblclick.zoom", null);

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
      .on("mouseenter", (event: MouseEvent, node) => {
        this._hoveredNodeId = node.id;
        this._updateTooltip(event as MouseEvent, node.id);
        this._applyVisualState();
        this.requestUpdate();
      })
      .on("mousemove", (event: MouseEvent, node) => {
        this._updateTooltip(event as MouseEvent, node.id);
        this.requestUpdate();
      })
      .on("mouseleave", () => {
        this._hoveredNodeId = null;
        this._tooltip = null;
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

  private _updateTooltip(event: MouseEvent, nodeId: string) {
    /* Su mobile mostriamo solo il highlight dei collegamenti — niente scheda. */
    if (window.innerWidth < 900) return;

    const svg = this.renderRoot.querySelector<SVGSVGElement>(".graph-svg");
    if (!svg) return;

    const [px, py] = pointer(event, svg);
    const x = clamp(px + 14, 12, Math.max(12, svg.clientWidth - 326));
    const y = clamp(py + 16, 12, Math.max(12, svg.clientHeight - 194));
    this._tooltip = { nodeId, x, y };
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
    if (!this._hoveredNodeId) return false;
    return this._adjacency.get(this._hoveredNodeId)?.has(nodeId) ?? false;
  }

  private _applyVisualState() {
    const hoveredId = this._hoveredNodeId;

    this._nodeSelection?.attr("opacity", (node) => {
      const modeOpacity = this._isModeActive(node.domain) ? 1 : 0.22;
      if (!hoveredId) return modeOpacity;
      if (node.id === hoveredId) return 1;
      if (this._isConnectedToHovered(node.id))
        return Math.max(0.75, modeOpacity);
      return Math.min(0.12, modeOpacity);
    });

    this._nodeSelection
      ?.select<SVGCircleElement>(".force-node-dot")
      .attr("stroke-width", (node) => (node.id === hoveredId ? 2.3 : 1.2))
      .attr("stroke", (node) => {
        if (node.id === hoveredId) return "rgba(245,240,230,0.95)";
        return "rgba(8,73,67,0.9)";
      })
      .attr("filter", (node) => {
        if (node.id === hoveredId) {
          return `drop-shadow(0 0 8px ${DOMAIN_COLOR[node.domain]})`;
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

        if (!hoveredId) return baseOpacity;
        if (sourceId === hoveredId || targetId === hoveredId) return 0.9;
        return 0.05;
      })
      .attr("stroke-width", (link) => {
        const sourceId = nodeIdFromEndpoint(link.source);
        const targetId = nodeIdFromEndpoint(link.target);
        if (hoveredId && (sourceId === hoveredId || targetId === hoveredId))
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
        style="left:${tooltip.x}px; top:${tooltip.y}px; border-color:${DOMAIN_COLOR[
          node.domain
        ]};"
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
    return html`
      <div class="graph-wrap">
        <svg
          class="graph-svg"
          viewBox="0 0 ${WIDTH} ${HEIGHT}"
          role="img"
          aria-label="Force-directed network graph of skills"
        ></svg>

        ${this._renderTooltip()}

        <p class="graph-meta">${this._getMetaText()}</p>
      </div>
    `;
  }
}

if (!customElements.get("skill-force-graph")) {
  customElements.define("skill-force-graph", SkillForceGraph);
}

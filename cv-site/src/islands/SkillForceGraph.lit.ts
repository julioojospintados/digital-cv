import { LitElement, html, css } from "lit";
import {
  drag,
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  select,
  type Selection,
  type Simulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
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

const WIDTH = 920;
const HEIGHT = 560;

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

const DOMAIN_ANCHOR: Record<SkillDomain, { x: number; y: number }> = {
  tech: { x: WIDTH * 0.26, y: HEIGHT * 0.32 },
  creative: { x: WIDTH * 0.74, y: HEIGHT * 0.32 },
  management: { x: WIDTH * 0.29, y: HEIGHT * 0.76 },
  human: { x: WIDTH * 0.74, y: HEIGHT * 0.76 },
  ai: { x: WIDTH * 0.5, y: HEIGHT * 0.5 },
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function toRadius(weight: number, mastery: number): number {
  return 4 + weight * 1.5 + (mastery / 100) * 2;
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
      overflow: hidden;
    }

    .graph-wrap {
      border: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(0, 0, 0, 0.14);
      border-radius: 2px;
      overflow: hidden;
    }

    .graph-svg {
      display: block;
      width: 100%;
      height: auto;
      cursor: grab;
      background:
        radial-gradient(
          circle at 50% 35%,
          rgba(255, 255, 255, 0.03),
          transparent 45%
        ),
        linear-gradient(160deg, rgba(255, 255, 255, 0.02), transparent 60%);
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
      font-size: 8px;
      font-weight: 600;
      letter-spacing: 0.02em;
      fill: rgba(245, 240, 230, 0.88);
      text-anchor: middle;
      pointer-events: none;
      user-select: none;
    }

    .graph-legend {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.9rem;
      padding: 0.55rem 1rem 0.6rem;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
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
      padding: 0.35rem 0.9rem 0.65rem;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      font-family: "JetBrains Mono", monospace;
      font-size: 0.56rem;
      color: rgba(192, 220, 215, 0.58);
      text-align: center;
      min-height: 2.1rem;
    }
  `;

  private _mode: Mode = "tech";
  private _hoveredNodeId: string | null = null;

  private _nodes: GraphNode[] = [];
  private _links: GraphLink[] = [];
  private _nodeById = new Map<string, GraphNode>();
  private _adjacency = new Map<string, Set<string>>();

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

  override connectedCallback() {
    super.connectedCallback();
    this._mode = modeStore.get();
    this._unsub = modeStore.subscribe((mode) => {
      this._mode = mode;
      this._applyVisualState();
      this.requestUpdate();
    });
  }

  override disconnectedCallback() {
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

    const linksLayer = root.append("g").attr("class", "force-links");
    const nodesLayer = root.append("g").attr("class", "force-nodes");

    this._linkSelection = linksLayer
      .selectAll<SVGLineElement, GraphLink>("line")
      .data(this._links)
      .join("line")
      .attr("class", "force-link")
      .attr("stroke-width", 1.1)
      .attr("stroke-linecap", "round");

    this._nodeSelection = nodesLayer
      .selectAll<SVGGElement, GraphNode>("g")
      .data(this._nodes)
      .join((enter) => {
        const g = enter.append("g").attr("class", "force-node");

        g.append("circle")
          .attr("class", "force-node-dot")
          .attr("r", (node) => node.r)
          .attr("fill", (node) => DOMAIN_COLOR[node.domain])
          .attr("fill-opacity", 0.88)
          .attr("stroke", "rgba(8,73,67,0.9)")
          .attr("stroke-width", 1.2);

        g.append("text")
          .attr("class", "force-node-label")
          .attr("dy", (node) => node.r + 11)
          .text((node) => node.label);

        return g;
      });

    this._nodeSelection
      .on("mouseenter", (_event, node) => {
        this._hoveredNodeId = node.id;
        this._applyVisualState();
        this.requestUpdate();
      })
      .on("mouseleave", () => {
        this._hoveredNodeId = null;
        this._applyVisualState();
        this.requestUpdate();
      });

    this._nodeSelection.call(
      drag<SVGGElement, GraphNode>()
        .on("start", (event, node) => {
          if (!event.active) this._simulation?.alphaTarget(0.25).restart();
          node.fx = node.x;
          node.fy = node.y;
        })
        .on("drag", (event, node) => {
          node.fx = clamp(event.x, node.r, WIDTH - node.r);
          node.fy = clamp(event.y, node.r, HEIGHT - node.r);
        })
        .on("end", (event, node) => {
          if (!event.active) this._simulation?.alphaTarget(0);
          node.fx = null;
          node.fy = null;
        }),
    );

    this._simulation = forceSimulation<GraphNode>(this._nodes)
      .force(
        "link",
        forceLink<GraphNode, GraphLink>(this._links)
          .id((node) => node.id)
          .distance((link) => {
            const source = this._resolveNode(link.source);
            const target = this._resolveNode(link.target);
            if (!source || !target) return 70;
            return source.domain === target.domain ? 54 : 82;
          })
          .strength((link) => {
            const source = this._resolveNode(link.source);
            const target = this._resolveNode(link.target);
            if (!source || !target) return 0.2;
            return source.domain === target.domain ? 0.45 : 0.18;
          }),
      )
      .force(
        "charge",
        forceManyBody<GraphNode>().strength((node) => -30 - node.weight * 8),
      )
      .force(
        "collide",
        forceCollide<GraphNode>()
          .radius((node) => node.r + 3)
          .strength(0.95),
      )
      .force("center", forceCenter(WIDTH / 2, HEIGHT / 2))
      .force(
        "x",
        forceX<GraphNode>((node) => DOMAIN_ANCHOR[node.domain].x).strength(
          (node) => {
            return node.domain === "ai" ? 0.045 : 0.1;
          },
        ),
      )
      .force(
        "y",
        forceY<GraphNode>((node) => DOMAIN_ANCHOR[node.domain].y).strength(
          (node) => {
            return node.domain === "ai" ? 0.045 : 0.1;
          },
        ),
      )
      .alpha(0.95)
      .alphaDecay(0.04)
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

    this._applyVisualState();
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
    if (!this._hoveredNodeId) {
      return "Hover a node to inspect links. Drag nodes to reshape the network.";
    }

    const node = this._nodeById.get(this._hoveredNodeId);
    if (!node)
      return "Hover a node to inspect links. Drag nodes to reshape the network.";

    const linkedNames = Array.from(this._adjacency.get(node.id) ?? [])
      .slice(0, 6)
      .join(", ");

    const domainLabel = DOMAIN_LABEL[node.domain] ?? node.domain;
    const connectionLabel =
      linkedNames.length > 0 ? linkedNames : "no direct links";
    return `${node.label} | ${domainLabel} | weight ${node.weight}/5 | mastery ${node.mastery}% | links: ${connectionLabel}`;
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

        <div class="graph-legend" aria-hidden="true">
          ${Object.entries(DOMAIN_LABEL).map(
            ([domain, label]) => html`
              <span class="graph-legend-item">
                <span
                  class="graph-legend-dot"
                  style="background:${DOMAIN_COLOR[domain as SkillDomain]}"
                ></span>
                ${label}
              </span>
            `,
          )}
        </div>

        <p class="graph-meta">${this._getMetaText()}</p>
      </div>
    `;
  }
}

if (!customElements.get("skill-force-graph")) {
  customElements.define("skill-force-graph", SkillForceGraph);
}

import { LitElement, html, css } from "lit";
import { treemap, hierarchy } from "d3";
import { cvData } from "@cv-data";
import { modeStore, type Mode } from "./stores/modeStore.ts";

/**
 * Weighted Tile Matrix Knolling — D3 Treemap with responsive proportional tiles.
 * Skills are sized by weight × mastery, positioned without overlap.
 */

interface SkillNode {
  name: string;
  level: string;
  weight: number;
  mastery: number;
  value: number;
}

class SkillTreemap extends LitElement {
  private _skills: SkillNode[] = [];
  private _treemapNodes: any[] = [];
  private _mode: Mode = "tech";
  private _unsub?: () => void;

  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 400px;
      margin-bottom: 1.5rem;
    }

    .treemap-container {
      width: 100%;
      height: 100%;
      position: relative;
      background: rgba(8, 73, 67, 0.08);
      border: 1px solid rgba(192, 220, 215, 0.12);
      border-radius: 2px;
      overflow: hidden;
    }

    .skill-tile {
      position: absolute;
      border: var(--skill-border, 1px) solid var(--color-accent, #00ffc8);
      background: rgba(0, 255, 200, 0.06);
      backdrop-filter: blur(2px);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      font-size: 11px;
      font-weight: 600;
      color: rgba(192, 220, 215, 0.88);
      transition: all 180ms ease;
      cursor: default;
    }

    .skill-tile:hover {
      background: rgba(0, 255, 200, 0.14);
      box-shadow: 0 0 12px rgba(0, 255, 200, 0.18);
      transform: scale(1.02);
      z-index: 10;
    }

    .skill-tile[data-mode="passive"] {
      opacity: 0.28;
      border-color: rgba(192, 220, 215, 0.2);
    }

    .skill-tile[data-mode="active"] {
      opacity: 1;
      border-color: rgba(0, 255, 200, 0.6);
    }

    .skill-name {
      line-height: 1.2;
      letter-spacing: 0.02em;
    }

    .skill-level {
      font-size: 9px;
      opacity: 0.72;
      margin-top: 0.15rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
  `;

  override connectedCallback() {
    super.connectedCallback();
    // Only subscribe to modeStore in browser (not SSR)
    if (typeof window !== "undefined") {
      this._mode = modeStore.get();
      this._unsub = modeStore.subscribe((mode) => {
        this._mode = mode;
        this.requestUpdate();
      });
    }
  }

  override disconnectedCallback() {
    this._unsub?.();
    super.disconnectedCallback();
  }

  override firstUpdated() {
    this._buildTreemap();
  }

  private _buildTreemap() {
    // Only build treemap in browser (not SSR)
    if (typeof window === "undefined") {
      return;
    }
    const rawSkills = cvData.technicalSkills || [];

    this._skills = rawSkills.map((skill: any) => ({
      name: skill.name,
      level: skill.level,
      weight: this._getWeight(skill.name),
      mastery: this._getMastery(skill.level),
      value: 0,
    }));

    this._skills.forEach((skill) => {
      skill.value = skill.weight * skill.mastery;
    });

    this._generateTreemap();
    // requestUpdate() is called automatically when _treemapNodes changes
  }

  private _getWeight(name: string): number {
    const weights: Record<string, number> = {
      TypeScript: 10,
      "Node.js": 9,
      Angular: 8,
      JavaScript: 8,
      "HTML/CSS": 7,
      Git: 8,
      Python: 6,
      SQL: 6,
    };
    return weights[name] || 5;
  }

  private _getMastery(level: string): number {
    const mastery: Record<string, number> = {
      Base: 1,
      Intermedio: 2,
      Avanzato: 3,
      Esperto: 4,
    };
    return mastery[level] || 2;
  }

  private _generateTreemap() {
    const width = 800;
    const height = 400;

    const data = { name: "skills", children: this._skills };
    const root = hierarchy(data)
      .sum((d: any) => d.value)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    const treemapLayout = treemap()
      .size([width, height])
      .padding(3)
      .round(true);

    treemapLayout(root);
    // Force re-render by reassigning array (creates new reference)
    this._treemapNodes = [...root.leaves()];
  }

  private _isModeActive(): boolean {
    return this._mode === "tech";
  }

  override render() {
    if (!this._treemapNodes || this._treemapNodes.length === 0) {
      return html`<div class="treemap-container">Loading treemap...</div>`;
    }

    return html`
      <div class="treemap-container">
        ${this._treemapNodes.map(
          (node) => html`
            <div
              class="skill-tile"
              data-mode=${this._isModeActive() ? "active" : "passive"}
              style="
                left: ${node.x0}px;
                top: ${node.y0}px;
                width: ${node.x1 - node.x0}px;
                height: ${node.y1 - node.y0}px;
                --skill-border: ${node.data.mastery}px;
              "
              title="${node.data.name} (${node.data.level})"
            >
              <span class="skill-name">${node.data.name}</span>
              <span class="skill-level">${node.data.level}</span>
            </div>
          `,
        )}
      </div>
    `;
  }
}

console.log("[SkillTreemap] Registering custom element...");
if (!customElements.get("skill-treemap")) {
  customElements.define("skill-treemap", SkillTreemap);
} else {
  console.warn("[SkillTreemap] Custom element already registered");
}

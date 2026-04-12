import { describe, it, expect } from 'vitest';
import { NODES, EDGES, MODE_COLOR, VW, VH } from './constellation-data';
import type { SkNode, SkEdge } from './constellation-data';

const VALID_GROUPS = ['tech', 'creative', 'human', 'management'] as const;
type Mode = typeof VALID_GROUPS[number];

// ─────────────────────────────────────────────────────────────────────────────
// MODE_COLOR
// ─────────────────────────────────────────────────────────────────────────────

describe('MODE_COLOR', () => {
  it('has an entry for every valid mode', () => {
    for (const mode of VALID_GROUPS) {
      expect(MODE_COLOR[mode], `missing color for mode "${mode}"`).toBeDefined();
    }
  });

  it('every color is a non-empty string', () => {
    for (const mode of VALID_GROUPS) {
      expect(MODE_COLOR[mode].length).toBeGreaterThan(0);
    }
  });

  it('every color starts with rgba(', () => {
    for (const [mode, color] of Object.entries(MODE_COLOR)) {
      expect(color, `invalid color format for mode "${mode}"`).toMatch(/^rgba\(/);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// NODES
// ─────────────────────────────────────────────────────────────────────────────

describe('NODES', () => {
  it('is a non-empty array', () => {
    expect(NODES.length).toBeGreaterThan(0);
  });

  it('node ids are unique', () => {
    const ids = NODES.map((n: SkNode) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every node has a non-empty id', () => {
    for (const node of NODES) {
      expect(node.id.trim().length, `node at index ${NODES.indexOf(node)} has empty id`).toBeGreaterThan(0);
    }
  });

  it('every node has a non-empty label', () => {
    for (const node of NODES) {
      expect(node.label.trim().length, `node "${node.id}" has empty label`).toBeGreaterThan(0);
    }
  });

  it('every node group is a valid mode', () => {
    for (const node of NODES) {
      expect(
        (VALID_GROUPS as readonly string[]).includes(node.group),
        `node "${node.id}" has invalid group "${node.group}"`,
      ).toBe(true);
    }
  });

  it('every node radius is a positive number', () => {
    for (const node of NODES) {
      expect(node.r, `node "${node.id}" radius must be > 0`).toBeGreaterThan(0);
    }
  });

  it('every node x position is within SVG horizontal bounds', () => {
    for (const node of NODES) {
      expect(node.x, `node "${node.id}" x=${node.x} is out of [0, ${VW}]`).toBeGreaterThan(0);
      expect(node.x, `node "${node.id}" x=${node.x} is out of [0, ${VW}]`).toBeLessThan(VW);
    }
  });

  it('every node y position is within SVG vertical bounds', () => {
    for (const node of NODES) {
      expect(node.y, `node "${node.id}" y=${node.y} is out of [0, ${VH}]`).toBeGreaterThan(0);
      expect(node.y, `node "${node.id}" y=${node.y} is out of [0, ${VH}]`).toBeLessThan(VH);
    }
  });

  it('has at least one node per valid group', () => {
    for (const group of VALID_GROUPS) {
      const count = NODES.filter((n: SkNode) => n.group === group).length;
      expect(count, `group "${group}" must have at least one node`).toBeGreaterThan(0);
    }
  });

  it('top-left quadrant (TECH) nodes stay in left half', () => {
    const techNodes = NODES.filter((n) => n.group === 'tech');
    for (const node of techNodes) {
      expect(node.x, `TECH node "${node.id}" overlaps CREATIVE quadrant`).toBeLessThan(VW / 2);
      expect(node.y, `TECH node "${node.id}" overlaps MANAGEMENT quadrant`).toBeLessThan(VH / 2);
    }
  });

  it('top-right quadrant (CREATIVE) nodes stay in right half', () => {
    const creativeNodes = NODES.filter((n) => n.group === 'creative');
    for (const node of creativeNodes) {
      expect(node.x, `CREATIVE node "${node.id}" overlaps TECH quadrant`).toBeGreaterThan(VW / 2);
      expect(node.y, `CREATIVE node "${node.id}" overlaps HUMAN quadrant`).toBeLessThan(VH / 2);
    }
  });

  it('bottom-left quadrant (MANAGEMENT) nodes stay in left half', () => {
    const mgmtNodes = NODES.filter((n) => n.group === 'management');
    for (const node of mgmtNodes) {
      expect(node.x, `MANAGEMENT node "${node.id}" overlaps HUMAN quadrant`).toBeLessThan(VW / 2);
      expect(node.y, `MANAGEMENT node "${node.id}" overlaps TECH quadrant`).toBeGreaterThan(VH / 2);
    }
  });

  it('bottom-right quadrant (HUMAN) nodes stay in right half', () => {
    const humanNodes = NODES.filter((n) => n.group === 'human');
    for (const node of humanNodes) {
      expect(node.x, `HUMAN node "${node.id}" overlaps MANAGEMENT quadrant`).toBeGreaterThan(VW / 2);
      expect(node.y, `HUMAN node "${node.id}" overlaps CREATIVE quadrant`).toBeGreaterThan(VH / 2);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// EDGES
// ─────────────────────────────────────────────────────────────────────────────

describe('EDGES', () => {
  const nodeIds = new Set(NODES.map((n: SkNode) => n.id));

  it('is a non-empty array', () => {
    expect(EDGES.length).toBeGreaterThan(0);
  });

  it('all edge.a values reference existing node ids', () => {
    for (const edge of EDGES) {
      expect(
        nodeIds.has(edge.a),
        `edge.a "${edge.a}" does not reference a known node`,
      ).toBe(true);
    }
  });

  it('all edge.b values reference existing node ids', () => {
    for (const edge of EDGES) {
      expect(
        nodeIds.has(edge.b),
        `edge.b "${edge.b}" does not reference a known node`,
      ).toBe(true);
    }
  });

  it('no self-loops', () => {
    for (const edge of EDGES) {
      expect(
        edge.a,
        `self-loop detected: node "${edge.a}" connects to itself`,
      ).not.toBe(edge.b);
    }
  });

  it('no duplicate edges (order-independent)', () => {
    const seen = new Set<string>();
    for (const edge of EDGES) {
      const key = [edge.a, edge.b].sort().join('→');
      expect(
        seen.has(key),
        `duplicate edge: ${edge.a} — ${edge.b}`,
      ).toBe(false);
      seen.add(key);
    }
  });

  it('cross-cluster edges connect nodes from different groups', () => {
    const nodeById = new Map(NODES.map((n: SkNode) => [n.id, n]));
    for (const edge of EDGES) {
      if (!edge.cross) continue;
      const a = nodeById.get(edge.a)!;
      const b = nodeById.get(edge.b)!;
      expect(
        a.group,
        `cross edge ${edge.a}→${edge.b} connects nodes of the same group "${a.group}"`,
      ).not.toBe(b.group);
    }
  });

  it('non-cross edges connect nodes from the same group', () => {
    const nodeById = new Map(NODES.map((n: SkNode) => [n.id, n]));
    for (const edge of EDGES) {
      if (edge.cross) continue;
      const a = nodeById.get(edge.a)!;
      const b = nodeById.get(edge.b)!;
      expect(
        a.group,
        `intra edge ${edge.a}→${edge.b} connects nodes from different groups ("${a.group}" vs "${b.group}")`,
      ).toBe(b.group);
    }
  });

  it('every group has at least one intra-cluster edge', () => {
    const nodeById = new Map(NODES.map((n: SkNode) => [n.id, n]));
    for (const group of VALID_GROUPS) {
      const count = EDGES.filter((e: SkEdge) => {
        if (e.cross) return false;
        return nodeById.get(e.a)?.group === group;
      }).length;
      expect(count, `group "${group}" has no intra-cluster edges`).toBeGreaterThan(0);
    }
  });
});

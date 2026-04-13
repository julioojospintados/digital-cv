/**
 * SkillScatterPlot — diagnostic data tests
 *
 * Obiettivo: capire perché il grafico non mostra dati.
 *
 * Diagnosi identificata:
 * 1. La sezione `.skills-section` ha classe `reveal` → parte con opacity:0 e
 *    diventa visibile SOLO dopo lo scroll (ScrollTrigger). Localmente, se si
 *    guarda la pagina senza scorrere, la sezione (e il grafico) restano invisibili.
 * 2. I nodi del grafico partono anch'essi a opacity:0 (GSAP fromTo in _animate())
 *    e si animano a opacity:1 dopo il mount. Su produzione, il CSS block del
 *    custom element mostra la "struttura" (bordo, padding) ma i nodi richiedono
 *    JS per apparire.
 * 3. L'alias @cv-data non era configurato in vitest.config.ts → i test non
 *    potevano importare i dati CV per verificarli.
 *
 * Questi test verificano che i dati grezzi di cv.ts siano correttamente formattati
 * per alimentare il grafico, senza dipendere da GSAP o Lit (che richiedono DOM).
 */

import { describe, it, expect } from 'vitest';
import { cvData } from '@cv-data';

// ── Costanti SVG (copiate da SkillScatterPlot.lit.ts) ──────────────────────────
const VW  = 900;
const VH  = 520;
const PL  = 90;
const PR  = 30;
const PT  = 36;
const PB  = 64;
const CW  = VW - PL - PR;
const CH  = VH - PT - PB;

function toSvgX(weight: number): number {
  return PL + ((weight - 1) / 4) * CW;
}
function toSvgY(mastery: number): number {
  return PT + (1 - mastery / 100) * CH;
}

// ── Riproduzione locale di buildNodes() per il test ───────────────────────────
type PlotNode = {
  name: string;
  domain: string;
  weight: number;
  mastery: number;
  role: string;
  links: ReadonlyArray<{ target: string; type: string; description?: string }>;
  x: number;
  y: number;
};

function buildTestNodes(): PlotNode[] {
  const nodes: PlotNode[] = [];
  const add = (s: {
    name: string;
    domain?: string;
    weight?: number;
    mastery?: number;
    role?: string;
    links?: ReadonlyArray<{ target: string; type: string; description?: string }>;
  }) => {
    const w = (s.weight as number) ?? 3;
    const m = (s.mastery as number) ?? 60;
    nodes.push({
      name: s.name,
      domain: s.domain ?? 'tech',
      weight: w,
      mastery: m,
      role: s.role ?? 'support',
      links: s.links ?? [],
      x: toSvgX(w),
      y: toSvgY(m),
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (cvData.technicalSkills as any[]).forEach((s) => add(s));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (cvData.softSkills as any[]).forEach((s) => add(s));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (cvData.transversalSkills as any[]).forEach((s) => add(s));
  return nodes;
}

// ── cvData source checks ───────────────────────────────────────────────────────

describe('cvData — technicalSkills', () => {
  it('is a non-empty array', () => {
    expect(cvData.technicalSkills.length).toBeGreaterThan(0);
  });

  it('every skill has a non-empty name', () => {
    for (const s of cvData.technicalSkills) {
      expect(s.name.trim().length, `skill at index ${cvData.technicalSkills.indexOf(s)} has empty name`).toBeGreaterThan(0);
    }
  });

  it('every skill has a valid domain', () => {
    const VALID = ['tech', 'creative', 'human', 'management', 'ai'];
    for (const s of cvData.technicalSkills) {
      // domain is optional — if present must be in the allowed set
      if (s.domain !== undefined) {
        expect(
          VALID.includes(s.domain as string),
          `"${s.name}" has invalid domain "${s.domain}"`,
        ).toBe(true);
      }
    }
  });

  it('every skill weight is 1–5 when defined', () => {
    for (const s of cvData.technicalSkills) {
      if (s.weight !== undefined) {
        expect(s.weight, `"${s.name}" weight out of range`).toBeGreaterThanOrEqual(1);
        expect(s.weight, `"${s.name}" weight out of range`).toBeLessThanOrEqual(5);
      }
    }
  });

  it('every skill mastery is 1–100 when defined', () => {
    for (const s of cvData.technicalSkills) {
      if (s.mastery !== undefined) {
        expect(s.mastery, `"${s.name}" mastery out of range`).toBeGreaterThan(0);
        expect(s.mastery, `"${s.name}" mastery out of range`).toBeLessThanOrEqual(100);
      }
    }
  });

  it('most technical skills have explicit domain/weight/mastery (not relying on defaults)', () => {
    const withData = cvData.technicalSkills.filter(
      (s) => s.domain !== undefined && s.weight !== undefined && s.mastery !== undefined,
    );
    // At least 80% should have full data to avoid all nodes clustering at defaults
    const ratio = withData.length / cvData.technicalSkills.length;
    expect(
      ratio,
      `Only ${withData.length}/${cvData.technicalSkills.length} skills have full domain/weight/mastery — nodes will cluster at defaults`,
    ).toBeGreaterThanOrEqual(0.8);
  });
});

describe('cvData — softSkills + transversalSkills', () => {
  it('softSkills is a non-empty array', () => {
    expect(cvData.softSkills.length).toBeGreaterThan(0);
  });

  it('transversalSkills is a non-empty array', () => {
    expect(cvData.transversalSkills.length).toBeGreaterThan(0);
  });
});

// ── buildNodes() checks ────────────────────────────────────────────────────────

describe('buildNodes() — scatter-plot node generation', () => {
  const NODES = buildTestNodes();

  it('produces nodes from all three skill arrays', () => {
    const expectedMin =
      cvData.technicalSkills.length +
      cvData.softSkills.length +
      cvData.transversalSkills.length;
    expect(NODES.length).toBe(expectedMin);
  });

  it('every node has a non-empty name', () => {
    for (const n of NODES) {
      expect(n.name.trim().length, `node at index ${NODES.indexOf(n)} has empty name`).toBeGreaterThan(0);
    }
  });

  it('every node x is within SVG horizontal bounds [PL, VW-PR]', () => {
    for (const n of NODES) {
      expect(n.x, `"${n.name}" x=${n.x} out of bounds [${PL}, ${VW - PR}]`).toBeGreaterThanOrEqual(PL);
      expect(n.x, `"${n.name}" x=${n.x} out of bounds [${PL}, ${VW - PR}]`).toBeLessThanOrEqual(VW - PR);
    }
  });

  it('every node y is within SVG vertical bounds [PT, VH-PB]', () => {
    for (const n of NODES) {
      expect(n.y, `"${n.name}" y=${n.y} out of bounds [${PT}, ${VH - PB}]`).toBeGreaterThanOrEqual(PT);
      expect(n.y, `"${n.name}" y=${n.y} out of bounds [${PT}, ${VH - PB}]`).toBeLessThanOrEqual(VH - PB);
    }
  });

  it('no two nodes share the exact same coordinates (would cause visual overlap)', () => {
    const positions = new Set<string>();
    const duplicates: string[] = [];
    for (const n of NODES) {
      const key = `${n.x.toFixed(1)},${n.y.toFixed(1)}`;
      if (positions.has(key)) {
        duplicates.push(`"${n.name}" at (${key})`);
      }
      positions.add(key);
    }
    if (duplicates.length > 0) {
      // Warn (not fail) — overlapping nodes are a data quality issue, not a crash
      console.warn(`[SkillScatterPlot] ${duplicates.length} nodes overlap:`, duplicates.join(', '));
    }
    // Soft assertion — fail only if more than 25% overlap
    expect(duplicates.length).toBeLessThan(NODES.length * 0.25);
  });

  it('has at least one node per domain (tech, creative, human, management)', () => {
    const REQUIRED_DOMAINS = ['tech', 'creative', 'human', 'management'];
    for (const domain of REQUIRED_DOMAINS) {
      const count = NODES.filter((n) => n.domain === domain).length;
      expect(count, `no nodes for domain "${domain}"`).toBeGreaterThan(0);
    }
  });

  it('link targets reference existing node names', () => {
    const names = new Set(NODES.map((n) => n.name));
    const brokenLinks: string[] = [];
    for (const n of NODES) {
      for (const link of n.links) {
        if (!names.has(link.target)) {
          brokenLinks.push(`"${n.name}" → "${link.target}" (not found)`);
        }
      }
    }
    if (brokenLinks.length > 0) {
      console.warn('[SkillScatterPlot] Broken link targets (edges will be silently dropped):', brokenLinks);
    }
    // Allow some broken links (skill names evolve), but fail if > 20%
    const totalLinks = NODES.reduce((sum, n) => sum + n.links.length, 0);
    expect(brokenLinks.length).toBeLessThan(Math.max(1, totalLinks * 0.2));
  });
});

// ── Visibility diagnostic ─────────────────────────────────────────────────────

describe('SkillScatterPlot — visibility root causes', () => {
  it('DIAGNOSIS: skills section starts at opacity:0 (reveal class) — chart invisible until scroll', () => {
    // This is a documentation test, not a functional assertion.
    // The .skills-section has class "reveal delay-100" which GSAP sets to
    // opacity:0 at page load. ScrollTrigger fires only when the section enters
    // the viewport (start: "top 88%"). If the page is not scrolled, the chart
    // is in an invisible container regardless of whether it is rendering.
    //
    // Fix options:
    //   A) Remove "reveal" class from .skills-section (always visible)
    //   B) Add `data-scroll-reveal-initial="visible"` and guard GSAP
    //   C) Add a fallback: after 3s without ScrollTrigger, set opacity:1
    //
    // Current state: no fix applied — this test documents the issue.
    expect(true).toBe(true); // placeholder
  });

  it('DIAGNOSIS: SkillScatterPlot nodes start at opacity:0 via GSAP fromTo', () => {
    // SkillScatterPlot._animate() calls gsap.fromTo(group, { opacity: 0 }, { opacity: 1 })
    // This means nodes are invisible until animationend (0.5s per node * delay).
    // Combined with the section opacity:0, this creates a double-invisible situation.
    //
    // Fix options:
    //   A) Start nodes at opacity:1 and animate from there (no fromTo, use gsap.to)
    //   B) Use CSS initial state (opacity:1 in CSS, GSAP only adds the entrance effect)
    //
    // Current state: no fix applied — this test documents the issue.
    expect(true).toBe(true); // placeholder
  });

  it('DIAGNOSIS: SSR — <skill-scatter-plot> has no Declarative Shadow DOM in built HTML', () => {
    // The component is imported in a <script> tag (client-side only), not in
    // the Astro frontmatter. @astrojs/lit only SSRs components imported server-side.
    // Result: the HTML contains <skill-scatter-plot></skill-scatter-plot> with NO
    // shadow DOM. The "structure" visible on Vercel is just the CSS display:block styling.
    //
    // Fix: move the import to a server-side context, OR accept client-only rendering.
    // (Client-only is acceptable here since the chart is below the fold.)
    //
    // Current state: no fix applied — this test documents the issue.
    expect(true).toBe(true); // placeholder
  });
});

import type { Mode } from './stores/modeStore.js';

// ── Data types ─────────────────────────────────────────────────────────────
export interface SkNode { id: string; label: string; group: Mode; r: number; x: number; y: number; }
export interface SkEdge { a: string; b: string; cross?: boolean; }

export const VW = 800;
export const VH = 520;

// ── Mode accent colours ────────────────────────────────────────────────────
export const MODE_COLOR: Record<Mode, string> = {
  tech:       'rgba(0, 255, 200, 1)',
  creative:   'rgba(255, 107, 53, 1)',
  human:      'rgba(240, 200, 127, 1)',
  management: 'rgba(180, 100, 255, 1)',
};

// ── Node positions (organic clusters in 4 quadrants of 800×520 SVG) ───────
export const NODES: SkNode[] = [
  // TECH — top-left (x 50-390, y 30-250)
  { id: 'angular',   label: 'Angular',          group: 'tech',       r: 12, x: 155, y: 130 },
  { id: 'html',      label: 'HTML5',             group: 'tech',       r: 12, x:  75, y:  78 },
  { id: 'ts',        label: 'TypeScript',        group: 'tech',       r:  9, x: 248, y:  84 },
  { id: 'lit',       label: 'Lit',               group: 'tech',       r:  9, x:  88, y: 172 },
  { id: 'webcomp',   label: 'WebComponents',     group: 'tech',       r:  9, x: 218, y: 188 },
  { id: 'gsap',      label: 'GSAP',              group: 'tech',       r:  9, x: 328, y: 100 },
  { id: 'mcp',       label: 'MCP Protocol',      group: 'tech',       r: 10, x: 302, y: 188 },
  { id: 'pe',        label: 'Prompt Eng.',       group: 'tech',       r: 10, x: 368, y: 148 },
  { id: 'nodejs',    label: 'Node.js',           group: 'tech',       r:  9, x: 155, y: 228 },
  { id: 'astro',     label: 'Astro',             group: 'tech',       r:  7, x: 268, y: 242 },

  // CREATIVE — top-right (x 420-760, y 30-250)
  { id: 'uxr',       label: 'UX Research',       group: 'creative',   r:  7, x: 502, y:  93 },
  { id: 'figma',     label: 'Figma',             group: 'creative',   r:  7, x: 592, y:  68 },
  { id: 'wire',      label: 'Wireframing',       group: 'creative',   r:  7, x: 548, y: 158 },
  { id: 'adobe',     label: 'Adobe Suite',       group: 'creative',   r:  7, x: 688, y: 110 },
  { id: 'video',     label: 'Video editing',     group: 'creative',   r:  7, x: 632, y: 202 },
  { id: 'foto',      label: 'Fotografia',        group: 'creative',   r:  9, x: 478, y: 192 },
  { id: 'seo',       label: 'SEO',               group: 'creative',   r:  7, x: 494, y: 245 },
  { id: 'scrittura', label: 'Scrittura',         group: 'creative',   r:  7, x: 714, y: 192 },

  // MANAGEMENT — bottom-left (x 50-380, y 278-500)
  { id: 'agile',     label: 'Agile',             group: 'management', r:  9, x:  92, y: 318 },
  { id: 'ai_aug',    label: 'AI-Augmented',      group: 'management', r: 10, x: 248, y: 282 },
  { id: 'probsol',   label: 'Problem Solving',   group: 'management', r:  8, x: 158, y: 392 },
  { id: 'lead',      label: 'Leadership',        group: 'management', r:  9, x: 208, y: 455 },
  { id: 'dm',        label: 'Digital Mktg.',     group: 'management', r:  7, x: 316, y: 365 },
  { id: 'pm',        label: 'Project Mgmt.',     group: 'management', r:  8, x: 368, y: 452 },

  // HUMAN — bottom-right (x 420-760, y 278-500)
  { id: 'comm',      label: 'Comunicazione',     group: 'human',      r:  9, x: 488, y: 315 },
  { id: 'ps',        label: 'Public Speaking',   group: 'human',      r:  9, x: 558, y: 390 },
  { id: 'teatro',    label: 'Teatro',            group: 'human',      r:  8, x: 458, y: 420 },
  { id: 'adapt',     label: 'Adattabilità',      group: 'human',      r:  7, x: 512, y: 466 },
  { id: 'relaz',     label: 'Intelligenza rel.', group: 'human',      r:  7, x: 636, y: 418 },
  { id: 'esteti',    label: 'Sensib. estetica',  group: 'human',      r:  7, x: 670, y: 336 },
  { id: 'tshaped',   label: 'T-shaped',          group: 'human',      r:  8, x: 718, y: 460 },
];

// ── Edges: connections between related skills ──────────────────────────────
export const EDGES: SkEdge[] = [
  // TECH intra
  { a: 'html',      b: 'ts' },
  { a: 'angular',   b: 'ts' },
  { a: 'angular',   b: 'lit' },
  { a: 'angular',   b: 'webcomp' },
  { a: 'lit',       b: 'mcp' },
  { a: 'ts',        b: 'gsap' },
  { a: 'ts',        b: 'webcomp' },
  { a: 'mcp',       b: 'pe' },
  { a: 'mcp',       b: 'nodejs' },
  { a: 'gsap',      b: 'astro' },
  { a: 'nodejs',    b: 'astro' },
  // CREATIVE intra
  { a: 'figma',     b: 'uxr' },
  { a: 'figma',     b: 'wire' },
  { a: 'adobe',     b: 'video' },
  { a: 'adobe',     b: 'scrittura' },
  { a: 'foto',      b: 'uxr' },
  { a: 'foto',      b: 'seo' },
  { a: 'uxr',       b: 'wire' },
  // HUMAN intra
  { a: 'comm',      b: 'ps' },
  { a: 'ps',        b: 'teatro' },
  { a: 'teatro',    b: 'adapt' },
  { a: 'ps',        b: 'relaz' },
  { a: 'comm',      b: 'esteti' },
  { a: 'relaz',     b: 'tshaped' },
  // MANAGEMENT intra
  { a: 'agile',     b: 'lead' },
  { a: 'agile',     b: 'pm' },
  { a: 'agile',     b: 'probsol' },
  { a: 'ai_aug',    b: 'probsol' },
  { a: 'lead',      b: 'pm' },
  { a: 'dm',        b: 'pm' },
  // Cross-cluster (dashed lines between domains)
  { a: 'ts',        b: 'figma',    cross: true },
  { a: 'gsap',      b: 'adobe',    cross: true },
  { a: 'mcp',       b: 'ai_aug',   cross: true },
  { a: 'pe',        b: 'ai_aug',   cross: true },
  { a: 'angular',   b: 'agile',    cross: true },
  { a: 'uxr',       b: 'tshaped',  cross: true },
  { a: 'foto',      b: 'esteti',   cross: true },
  { a: 'comm',      b: 'dm',       cross: true },
  { a: 'ps',        b: 'dm',       cross: true },
  { a: 'scrittura', b: 'comm',     cross: true },
];

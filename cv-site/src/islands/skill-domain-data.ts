// ── Domain node data for SkillDomainBubbles ──────────────────────────────
// All 53 skills (technical + soft + transversal) with SVG positions computed
// at module-load time using a row-packing algorithm. Add skills here — positions
// adapt automatically.

export type SkillDomain = 'tech' | 'creative' | 'human' | 'management' | 'ai';
export type SkillRole   = 'core' | 'bridge' | 'support';

export interface DomainNode {
  id:     string;
  label:  string;
  domain: SkillDomain;
  weight: number;  // 1–5
  role:   SkillRole;
  x:      number;
  y:      number;
  r:      number;
}

// ── SVG canvas ────────────────────────────────────────────────────────────
export const VW = 1000;
export const VH = 580;

// ── Domain accent colours (matches design system) ─────────────────────────
export const DOMAIN_COLOR: Record<SkillDomain, string> = {
  tech:       'rgba(0,255,200,1)',
  creative:   'rgba(255,107,53,1)',
  human:      'rgba(240,200,127,1)',
  management: 'rgba(180,100,255,1)',
  ai:         'rgba(100,220,255,1)',
};

// ── Quadrant bounding boxes ───────────────────────────────────────────────
// Layout: top-left=tech | top-right=creative
//         ─────────  AI CENTER BRIDGE  ─────────
//         bot-left=management | bot-right=human
const Q: Record<SkillDomain, { x: number; y: number; w: number; h: number }> = {
  tech:       { x:  16, y:  36, w: 474, h: 244 },
  creative:   { x: 520, y:  36, w: 464, h: 244 },
  management: { x:  16, y: 320, w: 474, h: 244 },
  human:      { x: 520, y: 320, w: 464, h: 244 },
  ai:         { x: 388, y: 262, w: 224, h:  56 }, // straddles the centre
};

// ── Raw skill list ────────────────────────────────────────────────────────
const RAW: Array<{ id: string; label: string; domain: SkillDomain; weight: number; role: SkillRole }> = [
  // ── Technical skills ──
  { id: 'angular',    label: 'Angular',         domain: 'tech',       weight: 5, role: 'core'    },
  { id: 'ts',         label: 'TypeScript',       domain: 'tech',       weight: 5, role: 'core'    },
  { id: 'html5',      label: 'HTML5',            domain: 'tech',       weight: 4, role: 'core'    },
  { id: 'css',        label: 'CSS / SCSS',       domain: 'tech',       weight: 4, role: 'bridge'  },
  { id: 'js',         label: 'JavaScript',       domain: 'tech',       weight: 4, role: 'core'    },
  { id: 'lit',        label: 'Lit',              domain: 'tech',       weight: 4, role: 'core'    },
  { id: 'nodejs',     label: 'Node.js',          domain: 'tech',       weight: 4, role: 'core'    },
  { id: 'restapi',    label: 'REST API',         domain: 'tech',       weight: 4, role: 'core'    },
  { id: 'webcomp',    label: 'WebComponents',    domain: 'tech',       weight: 4, role: 'core'    },
  { id: 'rxjs',       label: 'RXJS',             domain: 'tech',       weight: 3, role: 'core'    },
  { id: 'git',        label: 'Git',              domain: 'tech',       weight: 3, role: 'core'    },
  { id: 'jest',       label: 'Jest',             domain: 'tech',       weight: 3, role: 'core'    },
  { id: 'react',      label: 'React',            domain: 'tech',       weight: 3, role: 'support' },
  { id: 'a11y',       label: 'Accessibility',    domain: 'tech',       weight: 3, role: 'bridge'  },
  { id: 'astro',      label: 'Astro',            domain: 'tech',       weight: 3, role: 'support' },
  { id: 'hono',       label: 'Hono',             domain: 'tech',       weight: 3, role: 'support' },
  { id: 'ngrx',       label: 'NGRX',             domain: 'tech',       weight: 2, role: 'support' },
  { id: 'bootstrap',  label: 'Bootstrap',        domain: 'tech',       weight: 2, role: 'support' },
  { id: 'matdesign',  label: 'Material Design',  domain: 'tech',       weight: 2, role: 'support' },
  { id: 'graphql',    label: 'GraphQL',          domain: 'tech',       weight: 2, role: 'support' },
  { id: 'sql',        label: 'SQL',              domain: 'tech',       weight: 2, role: 'support' },
  { id: 'wordpress',  label: 'Wordpress',        domain: 'tech',       weight: 2, role: 'support' },

  // ── Creative/design technical ──
  { id: 'gsap',       label: 'GSAP',             domain: 'creative',   weight: 4, role: 'bridge'  },
  { id: 'figma',      label: 'Figma',            domain: 'creative',   weight: 3, role: 'bridge'  },
  { id: 'uxresearch', label: 'UX Research',      domain: 'creative',   weight: 3, role: 'bridge'  },
  { id: 'wireframe',  label: 'Wireframing',      domain: 'creative',   weight: 2, role: 'support' },
  { id: 'videoedit',  label: 'Video editing',    domain: 'creative',   weight: 2, role: 'support' },

  // ── Management technical ──
  { id: 'seo',        label: 'SEO',              domain: 'management', weight: 2, role: 'support' },
  { id: 'sem',        label: 'SEM',              domain: 'management', weight: 1, role: 'support' },

  // ── AI ──
  { id: 'mcp',        label: 'MCP Protocol',     domain: 'ai',         weight: 5, role: 'core'    },
  { id: 'prompteng',  label: 'Prompt Eng.',      domain: 'ai',         weight: 5, role: 'bridge'  },

  // ── Soft skills ──
  { id: 'probsol',    label: 'Problem Solving',  domain: 'human',      weight: 5, role: 'bridge'  },
  { id: 'tshaped',    label: 'T-shaped',         domain: 'management', weight: 5, role: 'bridge'  },
  { id: 'comm',       label: 'Comunicazione',    domain: 'human',      weight: 4, role: 'bridge'  },
  { id: 'relaz',      label: 'Intelligenza rel.',domain: 'human',      weight: 4, role: 'core'    },
  { id: 'resilienza', label: 'Resilienza',       domain: 'human',      weight: 4, role: 'core'    },
  { id: 'creativity', label: 'Creatività Appl.', domain: 'creative',   weight: 4, role: 'bridge'  },
  { id: 'esthetic',   label: 'Sensib. Estetica', domain: 'creative',   weight: 4, role: 'bridge'  },
  { id: 'autonomy',   label: 'Autonomia',        domain: 'management', weight: 4, role: 'core'    },
  { id: 'adapt',      label: 'Adattabilità',     domain: 'human',      weight: 3, role: 'core'    },

  // ── Transversal skills ──
  { id: 'agile',      label: 'Agile',            domain: 'management', weight: 5, role: 'bridge'  },
  { id: 'aiaugm',     label: 'AI-Augmented',     domain: 'ai',         weight: 5, role: 'bridge'  },
  { id: 'teatro',     label: 'Teatro',           domain: 'human',      weight: 4, role: 'bridge'  },
  { id: 'pubspeak',   label: 'Public Speaking',  domain: 'human',      weight: 4, role: 'bridge'  },
  { id: 'uxui',       label: 'UX / UI Design',   domain: 'creative',   weight: 4, role: 'bridge'  },
  { id: 'eventmgmt',  label: 'Event Mgmt.',      domain: 'management', weight: 3, role: 'support' },
  { id: 'foto',       label: 'Fotografia',       domain: 'creative',   weight: 3, role: 'support' },
  { id: 'graphdes',   label: 'Graphic Design',   domain: 'creative',   weight: 3, role: 'support' },
  { id: 'scrittura',  label: 'Scrittura',        domain: 'creative',   weight: 3, role: 'bridge'  },
  { id: 'digmkt',     label: 'Digital Mktg.',    domain: 'management', weight: 3, role: 'support' },
  { id: 'socmed',     label: 'Social Media',     domain: 'management', weight: 2, role: 'support' },
  { id: 'videomaking',label: 'Videomaking',      domain: 'creative',   weight: 2, role: 'support' },
  { id: 'music',      label: 'Music Industry',   domain: 'management', weight: 2, role: 'support' },
];

// ── Row-packing layout algorithm ──────────────────────────────────────────
function packDomain(
  items: typeof RAW,
  bounds: { x: number; y: number; w: number; h: number },
  isAi = false,
): DomainNode[] {
  // Sort by weight desc so large nodes are placed first
  const sorted = [...items].sort((a, b) => b.weight - a.weight);

  // radius by weight: 1→11, 2→14, 3→17, 4→21, 5→26
  const rOf = (w: number) => [11, 14, 17, 21, 26][w - 1] ?? 11;

  const PAD       = 6;
  const TOP_LABEL = isAi ? 0 : 18; // space for domain label

  let cx = bounds.x + PAD;
  let cy = bounds.y + TOP_LABEL + PAD;
  let rowH = 0;

  return sorted.map(item => {
    const r = rOf(item.weight);

    if (cx + r * 2 + PAD > bounds.x + bounds.w) {
      cx = bounds.x + PAD;
      cy += rowH + PAD;
      rowH = 0;
    }

    const x = cx + r;
    const y = cy + r;
    cx += r * 2 + PAD;
    rowH = Math.max(rowH, r * 2);

    return { ...item, x, y, r };
  });
}

// ── Compute all positions ─────────────────────────────────────────────────
function computeAll(): DomainNode[] {
  const groups: Record<SkillDomain, typeof RAW> = {
    tech: [], creative: [], human: [], management: [], ai: [],
  };
  for (const n of RAW) groups[n.domain].push(n);

  return [
    ...packDomain(groups.tech,       Q.tech),
    ...packDomain(groups.creative,   Q.creative),
    ...packDomain(groups.management, Q.management),
    ...packDomain(groups.human,      Q.human),
    ...packDomain(groups.ai,         Q.ai, true),
  ];
}

export const DOMAIN_NODES: DomainNode[] = computeAll();

// ── Quadrant label positions ───────────────────────────────────────────────
export const QLABELS: Record<SkillDomain, { x: number; y: number }> = {
  tech:       { x:  28, y:  28 },
  creative:   { x: 532, y:  28 },
  management: { x:  28, y: 312 },
  human:      { x: 532, y: 312 },
  ai:         { x: 490, y: 258 },
};

import { describe, it, expect, beforeEach } from "vitest";
import {
  applyAccordions,
  applyCardStates,
  reorderSkillSquares,
  reorderProjectCards,
  CLUSTER_OPEN_FOR,
} from "./mode-helpers";

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Crea N elementi .exp-cluster con data-cluster e un header dentro. */
function makeCluster(clusterKey: string, isOpen = false): HTMLElement {
  const cluster = document.createElement("div");
  cluster.className = "exp-cluster";
  cluster.dataset.cluster = clusterKey;
  if (isOpen) cluster.setAttribute("data-open", "");

  const header = document.createElement("button");
  header.className = "exp-cluster__header";
  header.setAttribute("aria-expanded", isOpen ? "true" : "false");
  cluster.appendChild(header);

  return cluster;
}

/** Crea una .cv-card con data-tags. */
function makeCard(tags: string): HTMLElement {
  const card = document.createElement("div");
  card.className = "cv-card";
  card.dataset.tags = tags;
  return card;
}

/** Crea una .skill-sq con i data-attribute usati da reorderSkillSquares. */
function makeSkillSquare(opts: {
  name: string;
  tags: string;
  weight?: number;
  border?: number;
}): HTMLElement {
  const el = document.createElement("div");
  el.className = "skill-sq";
  el.dataset.tags = opts.tags;
  el.dataset.name = opts.name;
  el.dataset.weight = String(opts.weight ?? 1);
  el.dataset.border = String(opts.border ?? 1);
  return el;
}

/** Crea .skills-grid con dentro le skill-sq passate, nell'ordine dato. */
function makeSkillsGrid(items: HTMLElement[]): HTMLElement {
  const grid = document.createElement("div");
  grid.className = "skills-grid";
  items.forEach((el) => grid.appendChild(el));
  return grid;
}

/** Nomi delle .skill-sq dentro .skills-grid, nell'ordine DOM attuale. */
function gridOrder(grid: HTMLElement): string[] {
  return Array.from(grid.querySelectorAll<HTMLElement>(".skill-sq")).map(
    (el) => el.dataset.name ?? "",
  );
}

/** Crea una .project-card con data-tags e un nome leggibile via data-name. */
function makeProjectCard(name: string, tags: string): HTMLElement {
  const el = document.createElement("div");
  el.className = "project-card cv-card";
  el.dataset.tags = tags;
  el.dataset.name = name;
  return el;
}

/** Crea .projects-grid con dentro le project-card passate, nell'ordine dato. */
function makeProjectsGrid(items: HTMLElement[]): HTMLElement {
  const grid = document.createElement("div");
  grid.className = "projects-grid";
  items.forEach((el) => grid.appendChild(el));
  return grid;
}

/** Nomi delle .project-card dentro .projects-grid, nell'ordine DOM attuale. */
function projectsGridOrder(grid: HTMLElement): string[] {
  return Array.from(grid.querySelectorAll<HTMLElement>(".project-card")).map(
    (el) => el.dataset.name ?? "",
  );
}

// ── CLUSTER_OPEN_FOR ─────────────────────────────────────────────────────────

describe("CLUSTER_OPEN_FOR", () => {
  // Mapping 1:1 dal 2026-07-15: ogni mode apre solo il proprio cluster.
  // Il cluster "personal" non appartiene a nessun mode (voce "Fuori orario").
  it("tech apre solo il cluster 'tech'", () => {
    expect(CLUSTER_OPEN_FOR["tech"]).toEqual(["tech"]);
  });

  it("creative apre solo 'creative'", () => {
    expect(CLUSTER_OPEN_FOR["creative"]).toEqual(["creative"]);
  });

  it("human apre solo 'human' (AI & Digital)", () => {
    expect(CLUSTER_OPEN_FOR["human"]).toEqual(["human"]);
  });

  it("management apre solo 'management'", () => {
    expect(CLUSTER_OPEN_FOR["management"]).toEqual(["management"]);
  });

  it("nessun mode apre 'personal'", () => {
    for (const clusters of Object.values(CLUSTER_OPEN_FOR))
      expect(clusters).not.toContain("personal");
  });

  it("ha esattamente 4 mode definiti", () => {
    expect(Object.keys(CLUSTER_OPEN_FOR)).toHaveLength(4);
  });
});

// ── applyAccordions ───────────────────────────────────────────────────────────

describe("applyAccordions", () => {
  const ALL_CLUSTERS = ["tech", "creative", "management", "human", "personal"];

  function setupClusters(): HTMLElement[] {
    const clusters = ALL_CLUSTERS.map((key) => makeCluster(key));
    clusters.forEach((c) => document.body.appendChild(c));
    return clusters;
  }

  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("mode=tech: apre 'tech', chiude gli altri", () => {
    const clusters = setupClusters();
    applyAccordions("tech");

    expect(clusters[0].hasAttribute("data-open")).toBe(true); // tech
    expect(clusters[1].hasAttribute("data-open")).toBe(false); // creative
    expect(clusters[2].hasAttribute("data-open")).toBe(false); // management
    expect(clusters[3].hasAttribute("data-open")).toBe(false); // human
    expect(clusters[4].hasAttribute("data-open")).toBe(false); // personal
  });

  it("mode=creative: apre solo 'creative'", () => {
    const clusters = setupClusters();
    applyAccordions("creative");

    expect(clusters[0].hasAttribute("data-open")).toBe(false); // tech
    expect(clusters[1].hasAttribute("data-open")).toBe(true); // creative
    expect(clusters[2].hasAttribute("data-open")).toBe(false); // management
    expect(clusters[3].hasAttribute("data-open")).toBe(false); // human
    expect(clusters[4].hasAttribute("data-open")).toBe(false); // personal
  });

  it("mode=human: apre solo 'human' (AI & Digital)", () => {
    const clusters = setupClusters();
    applyAccordions("human");

    expect(clusters[0].hasAttribute("data-open")).toBe(false); // tech
    expect(clusters[1].hasAttribute("data-open")).toBe(false); // creative
    expect(clusters[2].hasAttribute("data-open")).toBe(false); // management
    expect(clusters[3].hasAttribute("data-open")).toBe(true); // human
    expect(clusters[4].hasAttribute("data-open")).toBe(false); // personal
  });

  it("mode=management: apre solo 'management'", () => {
    const clusters = setupClusters();
    applyAccordions("management");

    expect(clusters[0].hasAttribute("data-open")).toBe(false); // tech
    expect(clusters[1].hasAttribute("data-open")).toBe(false); // creative
    expect(clusters[2].hasAttribute("data-open")).toBe(true); // management
    expect(clusters[3].hasAttribute("data-open")).toBe(false); // human
    expect(clusters[4].hasAttribute("data-open")).toBe(false); // personal
  });

  it("il cambio mode chiude il cluster 'personal' se era aperto", () => {
    const clusters = setupClusters();
    clusters[4].setAttribute("data-open", "");

    applyAccordions("tech");
    expect(clusters[4].hasAttribute("data-open")).toBe(false);
  });

  it("aggiorna aria-expanded sull'header del cluster aperto", () => {
    const clusters = setupClusters();
    applyAccordions("tech");

    const techHeader = clusters[0].querySelector(".exp-cluster__header")!;
    expect(techHeader.getAttribute("aria-expanded")).toBe("true");
  });

  it("aggiorna aria-expanded='false' sugli header chiusi", () => {
    const clusters = setupClusters();
    applyAccordions("tech");

    const creativeHeader = clusters[1].querySelector(".exp-cluster__header")!;
    expect(creativeHeader.getAttribute("aria-expanded")).toBe("false");
  });

  it("chiude un cluster precedentemente aperto quando si cambia mode", () => {
    const clusters = setupClusters();
    applyAccordions("tech");
    expect(clusters[0].hasAttribute("data-open")).toBe(true);

    applyAccordions("creative");
    expect(clusters[0].hasAttribute("data-open")).toBe(false);
    expect(clusters[1].hasAttribute("data-open")).toBe(true);
  });

  it("mode sconosciuto: fallback su 'tech' (apre solo 'tech')", () => {
    const clusters = setupClusters();
    applyAccordions("nonexistent");

    expect(clusters[0].hasAttribute("data-open")).toBe(true); // tech (fallback)
    expect(clusters[1].hasAttribute("data-open")).toBe(false);
  });

  it("non tocca cluster senza data-cluster", () => {
    const cluster = makeCluster("");
    document.body.appendChild(cluster);
    applyAccordions("tech");
    // Cluster senza key non ha data-cluster che corrisponde a "tech" → chiuso
    expect(cluster.hasAttribute("data-open")).toBe(false);
  });
});

// ── applyCardStates ───────────────────────────────────────────────────────────

describe("applyCardStates", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("imposta data-state='active' su card con tag corrispondente al mode", () => {
    const card = makeCard("tech creative");
    document.body.appendChild(card);

    applyCardStates("tech");
    expect(card.dataset.state).toBe("active");
  });

  it("imposta data-state='passive' su card senza tag corrispondente", () => {
    const card = makeCard("creative human");
    document.body.appendChild(card);

    applyCardStates("tech");
    expect(card.dataset.state).toBe("passive");
  });

  it("gestisce card con tag singolo", () => {
    const card = makeCard("management");
    document.body.appendChild(card);

    applyCardStates("management");
    expect(card.dataset.state).toBe("active");
  });

  it("aggiorna più card contemporaneamente", () => {
    const cardA = makeCard("tech");
    const cardB = makeCard("creative");
    const cardC = makeCard("tech creative");
    document.body.appendChild(cardA);
    document.body.appendChild(cardB);
    document.body.appendChild(cardC);

    applyCardStates("tech");

    expect(cardA.dataset.state).toBe("active");
    expect(cardB.dataset.state).toBe("passive");
    expect(cardC.dataset.state).toBe("active");
  });

  it("aggiorna correttamente passando da un mode all'altro", () => {
    const card = makeCard("creative");
    document.body.appendChild(card);

    applyCardStates("tech");
    expect(card.dataset.state).toBe("passive");

    applyCardStates("creative");
    expect(card.dataset.state).toBe("active");
  });

  it("ignora elementi senza .cv-card", () => {
    const div = document.createElement("div");
    div.dataset.tags = "tech";
    document.body.appendChild(div);

    // Non deve lanciare errori
    expect(() => applyCardStates("tech")).not.toThrow();
    // L'elemento senza .cv-card non viene toccato
    expect(div.dataset.state).toBeUndefined();
  });
});

// ── reorderSkillSquares ────────────────────────────────────────────────────

describe("reorderSkillSquares", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("porta in cima le skill del mode attivo", () => {
    const a = makeSkillSquare({ name: "Figma", tags: "creative" });
    const b = makeSkillSquare({ name: "Angular", tags: "tech" });
    const grid = makeSkillsGrid([a, b]);
    document.body.appendChild(grid);

    reorderSkillSquares("tech");

    expect(gridOrder(grid)).toEqual(["Angular", "Figma"]);
  });

  it("a parità di mode, ordina per area (weight × border) decrescente", () => {
    const small = makeSkillSquare({ name: "SEO", tags: "tech", weight: 1, border: 1 });
    const big = makeSkillSquare({ name: "Angular", tags: "tech", weight: 5, border: 4 });
    const grid = makeSkillsGrid([small, big]);
    document.body.appendChild(grid);

    reorderSkillSquares("tech");

    expect(gridOrder(grid)).toEqual(["Angular", "SEO"]);
  });

  it("a parità di mode e area, ordina alfabeticamente", () => {
    const z = makeSkillSquare({ name: "Zod", tags: "tech", weight: 2, border: 2 });
    const a = makeSkillSquare({ name: "Astro", tags: "tech", weight: 2, border: 2 });
    const grid = makeSkillsGrid([z, a]);
    document.body.appendChild(grid);

    reorderSkillSquares("tech");

    expect(gridOrder(grid)).toEqual(["Astro", "Zod"]);
  });

  it("aggiorna l'ordine quando il mode cambia", () => {
    const tech = makeSkillSquare({ name: "Angular", tags: "tech" });
    const creative = makeSkillSquare({ name: "Figma", tags: "creative" });
    const grid = makeSkillsGrid([tech, creative]);
    document.body.appendChild(grid);

    reorderSkillSquares("tech");
    expect(gridOrder(grid)).toEqual(["Angular", "Figma"]);

    reorderSkillSquares("creative");
    expect(gridOrder(grid)).toEqual(["Figma", "Angular"]);
  });

  it("non lancia errori se .skills-grid non è nel DOM", () => {
    expect(() => reorderSkillSquares("tech")).not.toThrow();
  });
});

// ── reorderProjectCards ──────────────────────────────────────────────────────

describe("reorderProjectCards", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("porta in cima i progetti del mode attivo", () => {
    const passive = makeProjectCard("Product Discovery", "creative");
    const active = makeProjectCard("Digital CV", "tech");
    const grid = makeProjectsGrid([passive, active]);
    document.body.appendChild(grid);

    reorderProjectCards("tech");

    expect(projectsGridOrder(grid)).toEqual(["Digital CV", "Product Discovery"]);
  });

  it("preserva l'ordine originale dentro ciascun gruppo", () => {
    const a = makeProjectCard("Digital CV", "tech");
    const b = makeProjectCard("App Covid", "tech");
    const c = makeProjectCard("Product Discovery", "creative");
    const grid = makeProjectsGrid([c, a, b]);
    document.body.appendChild(grid);

    reorderProjectCards("tech");

    expect(projectsGridOrder(grid)).toEqual(["Digital CV", "App Covid", "Product Discovery"]);
  });

  it("aggiorna l'ordine quando il mode cambia", () => {
    const tech = makeProjectCard("Digital CV", "tech");
    const creative = makeProjectCard("Product Discovery", "creative");
    const grid = makeProjectsGrid([tech, creative]);
    document.body.appendChild(grid);

    reorderProjectCards("tech");
    expect(projectsGridOrder(grid)).toEqual(["Digital CV", "Product Discovery"]);

    reorderProjectCards("creative");
    expect(projectsGridOrder(grid)).toEqual(["Product Discovery", "Digital CV"]);
  });

  it("non lancia errori se .projects-grid non è nel DOM", () => {
    expect(() => reorderProjectCards("tech")).not.toThrow();
  });
});

import { describe, it, expect, beforeEach } from "vitest";
import { applyAccordions, applyCardStates, CLUSTER_OPEN_FOR } from "./mode-helpers";

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

// ── CLUSTER_OPEN_FOR ─────────────────────────────────────────────────────────

describe("CLUSTER_OPEN_FOR", () => {
  it("tech apre solo il cluster 'tech'", () => {
    expect(CLUSTER_OPEN_FOR["tech"]).toEqual(["tech"]);
  });

  it("creative apre 'creative' e 'roots'", () => {
    expect(CLUSTER_OPEN_FOR["creative"]).toEqual(["creative", "roots"]);
  });

  it("human apre 'human' e 'roots'", () => {
    expect(CLUSTER_OPEN_FOR["human"]).toEqual(["human", "roots"]);
  });

  it("management apre 'tech' e 'human'", () => {
    expect(CLUSTER_OPEN_FOR["management"]).toEqual(["tech", "human"]);
  });

  it("ha esattamente 4 mode definiti", () => {
    expect(Object.keys(CLUSTER_OPEN_FOR)).toHaveLength(4);
  });
});

// ── applyAccordions ───────────────────────────────────────────────────────────

describe("applyAccordions", () => {
  const ALL_CLUSTERS = ["tech", "creative", "human", "roots"];

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

    expect(clusters[0].hasAttribute("data-open")).toBe(true);   // tech
    expect(clusters[1].hasAttribute("data-open")).toBe(false);  // creative
    expect(clusters[2].hasAttribute("data-open")).toBe(false);  // human
    expect(clusters[3].hasAttribute("data-open")).toBe(false);  // roots
  });

  it("mode=creative: apre 'creative' e 'roots', chiude gli altri", () => {
    const clusters = setupClusters();
    applyAccordions("creative");

    expect(clusters[0].hasAttribute("data-open")).toBe(false);  // tech
    expect(clusters[1].hasAttribute("data-open")).toBe(true);   // creative
    expect(clusters[2].hasAttribute("data-open")).toBe(false);  // human
    expect(clusters[3].hasAttribute("data-open")).toBe(true);   // roots
  });

  it("mode=human: apre 'human' e 'roots', chiude gli altri", () => {
    const clusters = setupClusters();
    applyAccordions("human");

    expect(clusters[0].hasAttribute("data-open")).toBe(false);
    expect(clusters[1].hasAttribute("data-open")).toBe(false);
    expect(clusters[2].hasAttribute("data-open")).toBe(true);
    expect(clusters[3].hasAttribute("data-open")).toBe(true);
  });

  it("mode=management: apre 'tech' e 'human', chiude gli altri", () => {
    const clusters = setupClusters();
    applyAccordions("management");

    expect(clusters[0].hasAttribute("data-open")).toBe(true);   // tech
    expect(clusters[1].hasAttribute("data-open")).toBe(false);  // creative
    expect(clusters[2].hasAttribute("data-open")).toBe(true);   // human
    expect(clusters[3].hasAttribute("data-open")).toBe(false);  // roots
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

    expect(clusters[0].hasAttribute("data-open")).toBe(true);   // tech (fallback)
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

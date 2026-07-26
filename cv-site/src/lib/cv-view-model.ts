/**
 * cv-view-model.ts — la logica delle pagine CV, scritta una volta sola.
 *
 * `[mode].astro` (IT) e `en/cv.astro` (EN) rendono la stessa pagina in lingue
 * diverse. Prima ognuna aveva la propria copia di queste funzioni: le due
 * versioni divergevano in silenzio (l'hero inglese è rimasto fermo sul
 * profilo tech per mesi) e una terza lingua avrebbe triplicato il problema.
 *
 * Qui sta tutto ciò che NON dipende dalla lingua. Le stringhe stanno in
 * `cv-i18n.ts`. Le pagine si limitano a chiamare `buildCvViewModel` e a
 * renderizzare il risultato.
 *
 * REGOLA: se stai per copiare una funzione da una pagina CV all'altra,
 * il suo posto è qui.
 */

import type {
  Certification,
  Education,
  Language,
  Project,
  Skill,
  SoftSkill,
  TransversalSkill,
  WorkExperience,
} from "@cv-data";
import {
  EXP_CLUSTER_DEFS,
  PROJ_CARD_META,
  type ClusterRef,
} from "./exp-clusters";
import { LOCALES, type Locale, type Mode } from "./cv-i18n";

// ── Forma dei dati richiesta al dataset ────────────────────────────────────
// Le interfacce degli elementi (Skill, WorkExperience, …) sono già condivise:
// cv.en.ts le importa da cv.ts, e ogni sezione è chiusa con `as <Tipo>[]`.
// Le riusiamo invece di ridichiararle, così un campo aggiunto ai dati arriva
// qui senza passaggi manuali.
//
// Serve comunque un'interfaccia a parte anziché `typeof cvData`: entrambi i
// dataset sono `as const`, quindi hanno tipi letterali diversi e nessuno dei
// due è assegnabile all'altro. Qui elenchiamo solo le sezioni che questa
// logica legge davvero — qualunque dataset che le soddisfi va bene, incluse
// le lingue future.

/** Denominatore comune delle tre famiglie di skill mostrate nella griglia. */
export type SkillSource = Skill | SoftSkill | TransversalSkill;

export interface CvSource {
  readonly personal: { readonly title: string; readonly summary: string };
  readonly technicalSkills: readonly Skill[];
  readonly softSkills: readonly SoftSkill[];
  readonly transversalSkills: readonly TransversalSkill[];
  readonly experience: readonly WorkExperience[];
  readonly projects: readonly Project[];
  readonly education: readonly Education[];
  readonly certifications: readonly Certification[];
  readonly languages: readonly Language[];
}

// ── Skill mode-tag sets ────────────────────────────────────────────────────
// Nomi di tecnologie e strumenti: identici in ogni lingua, non vanno tradotti.

const TECH_SKILL_SET = new Set([
  "Angular",
  "HTML5",
  "CSS / SCSS",
  "TypeScript",
  "JavaScript",
  "Lit",
  "RXJS",
  "NGRX",
  "WebComponents",
  "React",
  "Git",
  "Bootstrap",
  "Material Design",
  "GraphQL",
  "SQL",
  "Jest",
  "Node.js",
  "REST API",
  "Spring",
  "JSF",
  "MCP Protocol",
  "Prompt Engineering",
  "GSAP",
  "Astro",
  "Hono",
]);

const CREATIVE_SKILL_SET = new Set([
  "Figma",
  "SEO",
  "SEM",
  "UX Research",
  "Wireframing",
  "Video editing",
  "Wordpress",
  "Adobe Suite",
  "Typography",
]);

const DUAL_SKILL_SET = new Set([
  "Accessibility / WCAG",
  "UX Research",
  "Wireframing",
  "Figma",
]);

/**
 * Livello di padronanza a partire dal punteggio. Restituisce sempre le chiavi
 * italiane, che sono i valori presenti in `cv.ts`: la traduzione avviene in
 * fase di render tramite `LocaleStrings.levels`.
 */
export function deriveSkillLevel(mastery = 65): string {
  if (mastery >= 85) return "Esperto";
  if (mastery >= 70) return "Avanzato";
  if (mastery >= 50) return "Intermedio";
  return "Base";
}

/** Spessore del bordo della SkillSquare, per livello. */
const LEVEL_BORDERS: Record<string, number> = {
  Base: 1,
  Intermedio: 2,
  Avanzato: 3,
  Esperto: 4,
};

export function skillModeTags(skill: SkillSource): string {
  const tags = new Set<string>();

  if (skill.domain) {
    tags.add(skill.domain === "ai" ? "tech" : skill.domain);
  }

  if (TECH_SKILL_SET.has(skill.name)) {
    tags.add("tech");
  }

  if (CREATIVE_SKILL_SET.has(skill.name) || DUAL_SKILL_SET.has(skill.name)) {
    tags.add("creative");
  }

  if (tags.size === 0) {
    tags.add("tech");
    tags.add("creative");
    tags.add("human");
    tags.add("management");
  }

  return Array.from(tags).join(" ");
}

/** Il tag "ai" conta come attivo solo in mode tech. */
export function isActiveSkill(modeTags: string, mode: Mode): boolean {
  const tags = modeTags.split(" ");
  return tags.includes(mode) || (mode === "tech" && tags.includes("ai"));
}

const AI_SKILL_HINTS = [
  "MCP Protocol",
  "Prompt Engineering",
  "GitHub Copilot",
  "Claude",
  "Cursor",
  "AI Orchestration",
  "MCP",
];

// Una voce per ogni elemento di softSkills, nello stesso ordine. I valori sono
// mode, non testo: identici in tutte le lingue.
// Prima erano 9 tag per 11 skill: "Ascolto attivo" e "Assertività" (aggiunte
// dopo) rubavano i tag di "Sensibilità estetica" e "Pensiero T-shaped", e le
// ultime due finivano nel fallback attivo-ovunque.
const SOFT_MODE_TAGS = [
  "human creative", // Comunicazione efficace
  "creative human", // Creatività applicata
  "human", // Adattabilità culturale
  "human management", // Intelligenza relazionale
  "tech human management", // Problem solving laterale
  "tech human management", // Autonomia strategica
  "human management", // Resilienza e pensiero adattivo
  "human management", // Ascolto attivo
  "creative", // Sensibilità estetica
  "tech creative human management", // Pensiero T-shaped
];

const CEFR_STEPS: Record<string, number> = {
  Madrelingua: 6,
  Native: 6,
  C2: 6,
  C1: 5,
  B2: 4,
  B1: 3,
  A2: 2,
  A1: 1,
};

const FEATURED_N = 3;

/**
 * Le mappe per indice devono restare allineate ai dati: meglio far fallire la
 * build che spedire un'enfasi visiva silenziosamente sbagliata. Gira una volta
 * per lingua, quindi un disallineamento introdotto in un solo dataset viene
 * comunque intercettato.
 */
function assertDataIntegrity(data: CvSource, locale: Locale): void {
  const where = `dataset "${locale}"`;

  for (const cluster of EXP_CLUSTER_DEFS)
    for (const ref of cluster.refs) {
      if ("exp" in ref && !data.experience[ref.exp])
        throw new Error(
          `Cluster "${cluster.key}": ref exp ${ref.exp} fuori da ${where}.experience — aggiorna lib/exp-clusters.ts.`,
        );
      if ("proj" in ref && !data.projects[ref.proj])
        throw new Error(
          `Cluster "${cluster.key}": ref proj ${ref.proj} fuori da ${where}.projects — aggiorna lib/exp-clusters.ts.`,
        );
      if (
        "exp" in ref &&
        ref.facet &&
        !data.experience[ref.exp].facets?.some((f) => f.mode === ref.facet)
      )
        throw new Error(
          `Cluster "${cluster.key}": l'esperienza ${ref.exp} non ha la facet "${ref.facet}" in ${where} — aggiungila nei dati.`,
        );
    }

  if (SOFT_MODE_TAGS.length !== data.softSkills.length)
    throw new Error(
      `SOFT_MODE_TAGS (${SOFT_MODE_TAGS.length}) non allineato a ${where}.softSkills (${data.softSkills.length}): aggiorna la mappa in lib/cv-view-model.ts.`,
    );
}

export interface BuildOptions {
  data: CvSource;
  locale: Locale;
  /**
   * Mode reso lato server. Le route IT lo prendono dal path; le pagine senza
   * mode nel path (`/en/cv`) passano `DEFAULT_MODE` e cambiano lato client.
   */
  mode: Mode;
}

export function buildCvViewModel({ data, locale, mode }: BuildOptions) {
  const t = LOCALES[locale];
  assertDataIntegrity(data, locale);

  // ── Skill grid ───────────────────────────────────────────────────────────
  const toSkillSquare = (skill: SkillSource) => {
    // Solo `Skill` dichiara `level`: soft e transversal lo derivano da mastery.
    const level =
      ("level" in skill ? skill.level : undefined) ??
      deriveSkillLevel(skill.mastery);
    return {
      name: skill.name,
      shortName: skill.shortName,
      level: t.levels[level] ?? level,
      borderPx: LEVEL_BORDERS[level] ?? 1,
      isGlow: level === "Avanzato" || level === "Esperto",
      modeTags: skillModeTags(skill),
      weight: skill.weight ?? 1,
      // Livello non tradotto: l'ordinamento per area deve dare lo stesso
      // risultato in tutte le lingue.
      sortLevel: level,
    };
  };

  const isRelational = (s: SkillSource) =>
    s.domain === "human" || s.domain === "management";

  const skillSquares = [
    ...data.technicalSkills.map(toSkillSquare),
    ...data.softSkills.filter(isRelational).map(toSkillSquare),
    ...data.transversalSkills.filter(isRelational).map(toSkillSquare),
  ].sort((a, b) => {
    const activeDelta =
      Number(isActiveSkill(b.modeTags, mode)) -
      Number(isActiveSkill(a.modeTags, mode));
    if (activeDelta !== 0) return activeDelta;

    const areaA = (a.weight ?? 1) * (LEVEL_BORDERS[a.sortLevel] ?? 1);
    const areaB = (b.weight ?? 1) * (LEVEL_BORDERS[b.sortLevel] ?? 1);
    if (areaA !== areaB) return areaB - areaA;

    return a.name.localeCompare(b.name);
  });

  // ── Experience clusters ──────────────────────────────────────────────────
  // Definizione condivisa in lib/exp-clusters.ts. Ogni ref diventa una card:
  // la stessa esperienza può comparire in più cluster con la facet giusta
  // (ruolo/descrizione/highlight per quella lente).
  const refToCard = (ref: ClusterRef, clusterTags: string) => {
    if ("proj" in ref) {
      const p = data.projects[ref.proj];
      const meta = PROJ_CARD_META[ref.proj];
      if (!p) return null;
      return {
        company: p.name,
        role: meta?.role[locale] ?? "",
        startYear: meta?.startYear ?? "",
        endYear: meta?.endYear ?? meta?.startYear ?? "",
        location: meta?.location?.[locale] ?? "",
        remote: false,
        description: p.description,
        highlights: [] as string[],
        skills: p.tags ?? [],
        modeTags: clusterTags,
        aiAugmented: false,
      };
    }
    const exp = data.experience[ref.exp];
    if (!exp) return null;
    const facet = ref.facet
      ? exp.facets?.find((f) => f.mode === ref.facet)
      : undefined;
    return {
      company: exp.company,
      role: facet?.role ?? exp.role,
      startYear: exp.startDate.substring(0, 4),
      endYear:
        exp.endDate === "present" ? t.present : exp.endDate.substring(0, 4),
      location: exp.location ?? "",
      remote: exp.remote ?? false,
      description: facet?.description ?? exp.description,
      highlights: facet?.highlights ?? exp.highlights ?? [],
      skills: exp.skills ?? [],
      modeTags: clusterTags,
      aiAugmented: !!(
        exp.tags?.includes("ai-orchestration") ||
        exp.skills?.some((s) => AI_SKILL_HINTS.includes(s))
      ),
    };
  };

  const expClusters = EXP_CLUSTER_DEFS.map((cluster) => {
    const items = cluster.refs
      .map((r) => refToCard(r, cluster.tags))
      .filter((c): c is NonNullable<typeof c> => c !== null);
    return {
      key: cluster.key,
      label: cluster.labels[locale],
      isDefaultOpen: cluster.openForModes.includes(mode),
      items,
      featured: items.slice(0, FEATURED_N),
      extra: items.slice(FEATURED_N),
    };
  });

  // ── Soft skills ──────────────────────────────────────────────────────────
  const softSkillsData = data.softSkills.map((skill, i) => ({
    name: skill.name,
    description: skill.description ?? "",
    modeTags: SOFT_MODE_TAGS[i] ?? "tech creative human",
  }));

  // ── Timeline (formazione + certificazioni) ───────────────────────────────
  const isoToLabel = (iso: string): string => {
    const [y, m] = iso.split("-");
    return m ? `${t.months[parseInt(m, 10) - 1]} ${y}` : y;
  };

  const timelineItems = [
    ...data.education.map((e) => ({
      date: e.endDate,
      dateLabel: isoToLabel(e.endDate),
      title: `${e.degree}${e.field ? ` — ${e.field}` : ""}`,
      institution: e.institution,
      type: "edu" as const,
      inProgress: false,
      credentialId: undefined as string | undefined,
    })),
    ...data.certifications.map((c) => ({
      date: c.date,
      dateLabel: isoToLabel(c.date),
      title: c.name,
      institution: c.issuer,
      type: "cert" as const,
      inProgress: c.inProgress ?? false,
      credentialId: c.credentialId,
    })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  // ── Lingue ───────────────────────────────────────────────────────────────
  const langsWithSteps = data.languages.map((l) => ({
    ...l,
    steps: CEFR_STEPS[l.level] ?? 3,
  }));

  // ── Progetti ─────────────────────────────────────────────────────────────
  const projectsData = data.projects
    .slice(0, 6)
    .map((p) => {
      const modes = new Set<string>();
      (p.tags ?? []).forEach((tag) => {
        const mapped = t.projectTags[tag];
        if (mapped) mapped.split(" ").forEach((m) => modes.add(m));
      });
      if (p.primaryMode) modes.add(p.primaryMode);
      const modeTags =
        modes.size > 0 ? Array.from(modes).join(" ") : "tech creative human";
      return {
        name: p.name,
        description: p.description,
        modeTags,
        slug: p.slug,
      };
    })
    // Mode first al primo paint (prima che il JS lato client riordini col
    // cambio mode): stessa logica di reorderProjectCards in mode-helpers.ts.
    .sort(
      (a, b) =>
        Number(b.modeTags.includes(mode)) - Number(a.modeTags.includes(mode)),
    );

  // ── Testi ────────────────────────────────────────────────────────────────
  const modeLabel = t.modeLabels[mode] ?? mode;

  return {
    strings: t,
    mode,
    modeLabel,
    modeDescription: t.modeDescriptions[mode] ?? t.fallbackDescription,
    heroTitle: t.heroTitles[mode] ?? data.personal.title,
    heroSummary: t.heroSummaries[mode] ?? data.personal.summary,
    heroTitles: t.heroTitles,
    heroSummaries: t.heroSummaries,
    skillViewLabels: t.skillView,
    skillSquares,
    expClusters,
    softSkillsData,
    timelineItems,
    langsWithSteps,
    projectsData,
  };
}

export type CvViewModel = ReturnType<typeof buildCvViewModel>;

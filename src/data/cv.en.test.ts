import { describe, it, expect } from "vitest";
import { cvData } from "./cv.js";
import { cvDataEn } from "./cv.en.js";

/**
 * Structural parity tests: the English CV must mirror the Italian CV exactly.
 * If cv.ts gains a new entry, cv.en.ts must be updated too.
 */

describe("cvDataEn structural parity with cvData", () => {
  it("personal.name matches", () => {
    expect(cvDataEn.personal.name).toBe(cvData.personal.name);
  });

  it("personal.availability matches", () => {
    expect(cvDataEn.personal.availability).toBe(cvData.personal.availability);
  });

  it("personal.location is non-empty", () => {
    expect(cvDataEn.personal.location.length).toBeGreaterThan(0);
  });

  it("personal.summary is non-empty", () => {
    expect(cvDataEn.personal.summary.length).toBeGreaterThan(0);
  });

  it("social has same number of entries", () => {
    expect(cvDataEn.social.length).toBe(cvData.social.length);
  });

  it("social platforms match (order-independent)", () => {
    const itPlatforms = cvData.social.map((s) => s.platform).sort();
    const enPlatforms = cvDataEn.social.map((s) => s.platform).sort();
    expect(enPlatforms).toEqual(itPlatforms);
  });

  it("social urls match", () => {
    const itUrls = cvData.social.map((s) => s.url).sort();
    const enUrls = cvDataEn.social.map((s) => s.url).sort();
    expect(enUrls).toEqual(itUrls);
  });

  it("languages has same number of entries", () => {
    expect(cvDataEn.languages.length).toBe(cvData.languages.length);
  });

  it("language levels match (order-independent)", () => {
    // "Madrelingua" (IT) and "Native" (EN) are valid translations of the same level.
    // Normalise before comparing so the check is language-agnostic.
    const normalise = (l: string) => (l === "Madrelingua" ? "Native" : l);
    const itLevels = cvData.languages.map((l) => normalise(l.level)).sort();
    const enLevels = cvDataEn.languages.map((l) => normalise(l.level)).sort();
    expect(enLevels).toEqual(itLevels);
  });

  it("experience has same number of entries", () => {
    expect(cvDataEn.experience.length).toBe(cvData.experience.length);
  });

  it("experience dates match per-entry", () => {
    for (let i = 0; i < cvData.experience.length; i++) {
      expect(cvDataEn.experience[i]!.startDate).toBe(cvData.experience[i]!.startDate);
      expect(cvDataEn.experience[i]!.endDate).toBe(cvData.experience[i]!.endDate);
    }
  });

  it("education has same number of entries", () => {
    expect(cvDataEn.education.length).toBe(cvData.education.length);
  });

  it("certifications has same number of entries", () => {
    expect(cvDataEn.certifications.length).toBe(cvData.certifications.length);
  });

  it("technicalSkills has same number of entries", () => {
    expect(cvDataEn.technicalSkills.length).toBe(cvData.technicalSkills.length);
  });

  it("technicalSkills levels match (same order)", () => {
    for (let i = 0; i < cvData.technicalSkills.length; i++) {
      expect(cvDataEn.technicalSkills[i]!.level).toBe(cvData.technicalSkills[i]!.level);
    }
  });

  it("softSkills has same number of entries", () => {
    expect(cvDataEn.softSkills.length).toBe(cvData.softSkills.length);
  });

  it("methodology has same number of entries", () => {
    expect(cvDataEn.methodology.length).toBe(cvData.methodology.length);
  });

  it("growthAreas has same number of entries", () => {
    expect(cvDataEn.growthAreas.length).toBe(cvData.growthAreas.length);
  });

  it("projects has same number of entries", () => {
    expect(cvDataEn.projects.length).toBe(cvData.projects.length);
  });

  it("project urls match (same order)", () => {
    for (let i = 0; i < cvData.projects.length; i++) {
      expect(cvDataEn.projects[i]!.url).toBe(cvData.projects[i]!.url);
    }
  });
});

/**
 * Counting entries is not enough. The English CV once had the right number of
 * skills while silently missing `domain`, `weight` and `role` on every single
 * one — which dropped all soft and transversal skills from the rendered grid,
 * flattened every square to the smallest size and made mode filtering
 * meaningless. The checks below compare the fields themselves, not the totals.
 *
 * These fields describe the skill, not its wording, so they must be identical
 * in every language. cv.en.ts inherits them from cv.ts (see inheritSkillMeta);
 * these tests are the guard that the inheritance keeps working.
 */
describe("cvDataEn skill metadata parity (non-translatable fields)", () => {
  const SKILL_SECTIONS = ["technicalSkills", "softSkills", "transversalSkills"] as const;

  const META_FIELDS = ["domain", "weight", "mastery", "role", "level"] as const;

  for (const section of SKILL_SECTIONS) {
    for (const field of META_FIELDS) {
      it(`${section}: every entry keeps the same '${field}' as cv.ts`, () => {
        const itList = cvData[section] as unknown as readonly Record<string, unknown>[];
        const enList = cvDataEn[section] as unknown as readonly Record<string, unknown>[];
        const mismatches = itList
          .map((entry, i) => ({
            name: entry.name as string,
            it: entry[field],
            en: enList[i]?.[field],
          }))
          .filter((r) => JSON.stringify(r.it) !== JSON.stringify(r.en));
        expect(mismatches).toEqual([]);
      });
    }

    it(`${section}: no entry lost its domain`, () => {
      const enList = cvDataEn[section] as unknown as readonly Record<string, unknown>[];
      const itList = cvData[section] as unknown as readonly Record<string, unknown>[];
      // Only assert where the Italian source actually declares one.
      const missing = enList
        .map((entry, i) => ({ name: entry.name, i }))
        .filter(({ i }) => itList[i]!.domain !== undefined)
        .filter(({ i }) => enList[i]!.domain === undefined);
      expect(missing).toEqual([]);
    });
  }

  it("every section present in cv.ts also exists in cv.en.ts", () => {
    const itKeys = Object.keys(cvData).sort();
    const enKeys = Object.keys(cvDataEn).sort();
    const missing = itKeys.filter((k) => !enKeys.includes(k));
    expect(missing).toEqual([]);
  });

  it("every array section has the same length in both languages", () => {
    const mismatches = Object.entries(cvData)
      .filter(([, v]) => Array.isArray(v))
      .map(([k, v]) => ({
        section: k,
        it: (v as unknown[]).length,
        en: ((cvDataEn as Record<string, unknown>)[k] as unknown[])?.length,
      }))
      .filter((r) => r.it !== r.en);
    expect(mismatches).toEqual([]);
  });
});

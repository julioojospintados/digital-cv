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

  it("personal.age matches", () => {
    expect(cvDataEn.personal.age).toBe(cvData.personal.age);
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
      expect(cvDataEn.experience[i].startDate).toBe(
        cvData.experience[i].startDate,
      );
      expect(cvDataEn.experience[i].endDate).toBe(
        cvData.experience[i].endDate,
      );
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
      expect(cvDataEn.technicalSkills[i].level).toBe(
        cvData.technicalSkills[i].level,
      );
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
      expect(cvDataEn.projects[i].url).toBe(cvData.projects[i].url);
    }
  });

});

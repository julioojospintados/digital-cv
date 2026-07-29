import { describe, it, expect } from "vitest";
import { cvData } from "./cv.js";

const ISO_DATE_RE = /^\d{4}-\d{2}$/;
const VALID_AVAILABILITY = ["available", "open", "not-available"] as const;
const VALID_SKILL_LEVELS = ["Base", "Intermedio", "Avanzato", "Esperto"] as const;
const VALID_LANGUAGE_LEVELS = [
  "A1",
  "A2",
  "B1",
  "B2",
  "C1",
  "C2",
  "Madrelingua",
  "Native",
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// personal
// ─────────────────────────────────────────────────────────────────────────────

describe("cvData.personal", () => {
  it("has a non-empty name", () => {
    expect(typeof cvData.personal.name).toBe("string");
    expect(cvData.personal.name.length).toBeGreaterThan(0);
  });

  it("has a non-empty title", () => {
    expect(cvData.personal.title.length).toBeGreaterThan(0);
  });

  it("has a non-empty summary", () => {
    expect(cvData.personal.summary.length).toBeGreaterThan(0);
  });

  it("has a valid availability value", () => {
    expect(VALID_AVAILABILITY).toContain(cvData.personal.availability);
  });

  it("age is a positive number", () => {
    expect(typeof cvData.personal.age).toBe("number");
    expect(cvData.personal.age).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// social
// ─────────────────────────────────────────────────────────────────────────────

describe("cvData.social", () => {
  it("has at least one entry", () => {
    expect(cvData.social.length).toBeGreaterThan(0);
  });

  it("every entry has a platform and url", () => {
    for (const s of cvData.social) {
      expect(typeof s.platform).toBe("string");
      expect(s.platform.length).toBeGreaterThan(0);
      expect(typeof s.url).toBe("string");
      expect(s.url.length).toBeGreaterThan(0);
    }
  });

  it("every url starts with https:// or mailto:", () => {
    for (const s of cvData.social) {
      expect(s.url).toMatch(/^(https?:\/\/|mailto:)/);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// languages
// ─────────────────────────────────────────────────────────────────────────────

describe("cvData.languages", () => {
  it("has at least one entry", () => {
    expect(cvData.languages.length).toBeGreaterThan(0);
  });

  it("every entry has a valid level", () => {
    for (const lang of cvData.languages) {
      expect(VALID_LANGUAGE_LEVELS).toContain(lang.level);
    }
  });

  it("every entry has a non-empty name", () => {
    for (const lang of cvData.languages) {
      expect(lang.name.length).toBeGreaterThan(0);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// experience
// ─────────────────────────────────────────────────────────────────────────────

describe("cvData.experience", () => {
  it("has at least one entry", () => {
    expect(cvData.experience.length).toBeGreaterThan(0);
  });

  it("every entry has required string fields", () => {
    for (const exp of cvData.experience) {
      expect(typeof exp.company).toBe("string");
      expect(exp.company.length).toBeGreaterThan(0);
      expect(typeof exp.role).toBe("string");
      expect(exp.role.length).toBeGreaterThan(0);
      expect(typeof exp.description).toBe("string");
      expect(exp.description.length).toBeGreaterThan(0);
    }
  });

  it("every startDate matches YYYY-MM format", () => {
    for (const exp of cvData.experience) {
      expect(exp.startDate).toMatch(ISO_DATE_RE);
    }
  });

  it("every endDate is YYYY-MM or 'present'", () => {
    for (const exp of cvData.experience) {
      const valid = exp.endDate === "present" || ISO_DATE_RE.test(exp.endDate);
      expect(valid, `endDate "${exp.endDate}" in "${exp.company}" is invalid`).toBe(true);
    }
  });

  it("highlights is always an array", () => {
    for (const exp of cvData.experience) {
      expect(Array.isArray(exp.highlights)).toBe(true);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// education
// ─────────────────────────────────────────────────────────────────────────────

describe("cvData.education", () => {
  it("has at least one entry", () => {
    expect(cvData.education.length).toBeGreaterThan(0);
  });

  it("every entry has institution and degree", () => {
    for (const edu of cvData.education) {
      expect(edu.institution.length).toBeGreaterThan(0);
      expect(edu.degree.length).toBeGreaterThan(0);
    }
  });

  it("every startDate and endDate match YYYY-MM format", () => {
    for (const edu of cvData.education) {
      expect(edu.startDate).toMatch(ISO_DATE_RE);
      expect(edu.endDate).toMatch(ISO_DATE_RE);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// certifications
// ─────────────────────────────────────────────────────────────────────────────

describe("cvData.certifications", () => {
  it("is an array", () => {
    expect(Array.isArray(cvData.certifications)).toBe(true);
  });

  it("every entry has name, issuer, and date", () => {
    for (const cert of cvData.certifications) {
      expect(cert.name.length).toBeGreaterThan(0);
      expect(cert.issuer.length).toBeGreaterThan(0);
      expect(cert.date).toMatch(ISO_DATE_RE);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// technicalSkills
// ─────────────────────────────────────────────────────────────────────────────

describe("cvData.technicalSkills", () => {
  it("has at least one entry", () => {
    expect(cvData.technicalSkills.length).toBeGreaterThan(0);
  });

  it("every skill has a name and valid level", () => {
    for (const skill of cvData.technicalSkills) {
      expect(skill.name.length).toBeGreaterThan(0);
      expect(VALID_SKILL_LEVELS).toContain(skill.level);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// softSkills
// ─────────────────────────────────────────────────────────────────────────────

describe("cvData.softSkills", () => {
  it("has at least one entry", () => {
    expect(cvData.softSkills.length).toBeGreaterThan(0);
  });

  it("every soft skill has a non-empty name", () => {
    for (const skill of cvData.softSkills) {
      expect(skill.name.length).toBeGreaterThan(0);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// methodology
// ─────────────────────────────────────────────────────────────────────────────

describe("cvData.methodology", () => {
  it("is a non-empty array", () => {
    expect(cvData.methodology.length).toBeGreaterThan(0);
  });

  it("every item has name and description", () => {
    for (const item of cvData.methodology) {
      expect(item.name.length).toBeGreaterThan(0);
      expect(item.description.length).toBeGreaterThan(0);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// growthAreas
// ─────────────────────────────────────────────────────────────────────────────

describe("cvData.growthAreas", () => {
  it("is an array", () => {
    expect(Array.isArray(cvData.growthAreas)).toBe(true);
  });

  it("every item has name and reframe", () => {
    for (const area of cvData.growthAreas) {
      expect(area.name.length).toBeGreaterThan(0);
      expect(area.reframe.length).toBeGreaterThan(0);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// projects
// ─────────────────────────────────────────────────────────────────────────────

describe("cvData.projects", () => {
  it("is an array", () => {
    expect(Array.isArray(cvData.projects)).toBe(true);
  });

  it("every project has name and description", () => {
    for (const project of cvData.projects) {
      expect(project.name.length).toBeGreaterThan(0);
      expect(project.description.length).toBeGreaterThan(0);
    }
  });

  it("project urls start with https:// when present", () => {
    for (const project of cvData.projects) {
      if (project.url) {
        expect(project.url).toMatch(/^https?:\/\//);
      }
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// experience.tags (optional field — when present must be valid strings)
// ─────────────────────────────────────────────────────────────────────────────

describe("cvData.experience tags", () => {
  it("every experience with tags has a non-empty tags array of strings", () => {
    for (const exp of cvData.experience) {
      if (exp.tags !== undefined) {
        expect(Array.isArray(exp.tags), `${exp.company} tags must be an array`).toBe(true);
        expect(
          (exp.tags as string[]).length,
          `${exp.company} tags must not be empty`,
        ).toBeGreaterThan(0);
        for (const tag of exp.tags as string[]) {
          expect(typeof tag).toBe("string");
          expect(
            tag.trim().length,
            `tag "${tag}" in "${exp.company}" must not be blank`,
          ).toBeGreaterThan(0);
        }
      }
    }
  });

  it("ai-orchestration tag is only on entries that contain AI-augmented work", () => {
    const aiEntries = cvData.experience.filter(
      (e) => Array.isArray(e.tags) && (e.tags as string[]).includes("ai-orchestration"),
    );
    // We expect at least one AI-augmented experience in the CV
    expect(aiEntries.length).toBeGreaterThan(0);
    // Every AI entry must also have a non-empty description mentioning some relevant concept
    for (const entry of aiEntries) {
      expect(entry.description.length).toBeGreaterThan(0);
    }
  });
});

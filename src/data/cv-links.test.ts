import { describe, it, expect } from "vitest";
import { cvData } from "./cv.js";
import { cvDataEn } from "./cv.en.js";
import {
  CASE_STUDY_SLUGS,
  resolveWorkUrl,
  siteUrl,
  workIndexUrl,
} from "../../scripts/cv-pdf-template.js";

// I link dei CV in PDF (scripts/cv-pdf-template.ts). Nati il 2026-10-21, dopo
// che un CV inglese è uscito con /work/cHJvZHVjdC al posto di
// /work/product-discovery, e con tutti i link verso le pagine italiane.

describe("link dei CV", () => {
  it("la lista degli slug coincide con i case study di cv.ts e cv.en.ts", () => {
    const it_ = cvData.projects.flatMap((p) => (p.slug ? [p.slug] : [])).sort();
    const en = cvDataEn.projects.flatMap((p) => (p.slug ? [p.slug] : [])).sort();
    expect([...CASE_STUDY_SLUGS].sort()).toEqual(it_);
    expect(en).toEqual(it_);
  });

  it("un CV italiano porta alle pagine italiane, uno inglese a /en", () => {
    const w = { title: "x", desc: "", outcome: "", slug: "product-discovery" as const };
    expect(resolveWorkUrl(w, "it")).toBe("https://giulio-occhipinti.com/work/product-discovery");
    expect(resolveWorkUrl(w, "en")).toBe("https://giulio-occhipinti.com/en/work/product-discovery");
    expect(siteUrl("it")).toBe("https://giulio-occhipinti.com");
    expect(siteUrl("en")).toBe("https://giulio-occhipinti.com/en");
    expect(workIndexUrl("en")).toBe("https://giulio-occhipinti.com/en/work");
  });

  it("un indirizzo inventato non arriva mai nel PDF", () => {
    const rotto = {
      title: "Product Discovery — UX Research",
      desc: "",
      outcome: "",
      url: "https://giulio-occhipinti.com/work/cHJvZHVjdC",
    };
    expect(resolveWorkUrl(rotto, "en")).toBe(
      "https://giulio-occhipinti.com/en/work/product-discovery",
    );
    const ignoto = { title: "Altro progetto", desc: "", outcome: "", url: "https://example.com/x" };
    expect(resolveWorkUrl(ignoto, "it")).toBe("https://giulio-occhipinti.com/work");
  });

  it("un vecchio JSON con l'indirizzo italiano, in un CV inglese, va a /en", () => {
    const vecchio = {
      title: "Interactive Digital CV",
      desc: "",
      outcome: "",
      url: "https://giulio-occhipinti.com/work/digital-cv",
    };
    expect(resolveWorkUrl(vecchio, "en")).toBe("https://giulio-occhipinti.com/en/work/digital-cv");
  });
});

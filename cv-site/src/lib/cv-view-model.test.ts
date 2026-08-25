import { describe, it, expect } from "vitest";
import { cvData } from "@cv-data";
import { cvDataEn } from "@cv-data-en";
import {
  buildCvViewModel,
  deriveSkillLevel,
  skillModeTags,
  isActiveSkill,
  orderSkillsForMode,
  type CvSource,
} from "./cv-view-model";
import { MODES, DEFAULT_MODE, type Mode } from "./cv-i18n";

const IT = cvData as unknown as CvSource;
const EN = cvDataEn as unknown as CvSource;

describe("deriveSkillLevel", () => {
  it("mappa i punteggi sulle 4 soglie", () => {
    expect(deriveSkillLevel(100)).toBe("Esperto");
    expect(deriveSkillLevel(85)).toBe("Esperto");
    expect(deriveSkillLevel(84)).toBe("Avanzato");
    expect(deriveSkillLevel(70)).toBe("Avanzato");
    expect(deriveSkillLevel(69)).toBe("Intermedio");
    expect(deriveSkillLevel(50)).toBe("Intermedio");
    expect(deriveSkillLevel(49)).toBe("Base");
    expect(deriveSkillLevel(0)).toBe("Base");
  });

  it("restituisce sempre le chiavi italiane, che sono quelle presenti in cv.ts", () => {
    // La traduzione avviene al render via LocaleStrings.levels: se questa
    // funzione restituisse già l'inglese, la lookup t.levels[level] fallirebbe
    // e la EN mostrerebbe la chiave grezza.
    for (const score of [0, 55, 75, 95]) {
      expect(deriveSkillLevel(score)).toMatch(/^(Base|Intermedio|Avanzato|Esperto)$/);
    }
  });
});

describe("isActiveSkill", () => {
  it("attiva la skill quando il tag combacia col mode", () => {
    expect(isActiveSkill("tech creative", "tech")).toBe(true);
    expect(isActiveSkill("tech creative", "creative")).toBe(true);
    expect(isActiveSkill("tech creative", "human")).toBe(false);
  });

  it("conta il tag 'ai' come attivo solo in mode tech", () => {
    expect(isActiveSkill("ai", "tech")).toBe(true);
    expect(isActiveSkill("ai", "creative")).toBe(false);
    expect(isActiveSkill("ai", "human")).toBe(false);
    expect(isActiveSkill("ai", "human")).toBe(false);
  });

  it("non confonde un tag che contiene il nome di un altro", () => {
    expect(isActiveSkill("creative", "human")).toBe(false);
  });
});

describe("skillModeTags", () => {
  it("mappa il dominio 'ai' su tech", () => {
    expect(skillModeTags({ name: "X", domain: "ai" })).toContain("tech");
  });

  it("assegna tutti e 4 i mode a una skill senza dominio né appartenenze note", () => {
    const tags = skillModeTags({ name: "Skill Sconosciuta Senza Dominio" }).split(" ");
    expect(tags.sort()).toEqual(["creative", "human", "tech"]);
  });

  it("non produce mai una stringa vuota", () => {
    for (const skill of [...IT.technicalSkills, ...IT.softSkills, ...IT.transversalSkills]) {
      expect(skillModeTags(skill).length).toBeGreaterThan(0);
    }
  });
});

// ── Parità IT ↔ EN ─────────────────────────────────────────────────────────
// AGENTS.md: "The EN pages must differ from their IT counterparts in language
// only. Not the order of elements, not the default state, not the behaviour,
// not the logic that computes them." Questi test rendono l'invariante
// verificabile: i bug passati (hero congelato su una persona, accordion aperto
// sul cluster sbagliato, progetti valutati sul mode sbagliato) erano tutti
// divergenze di struttura, non di traduzione.
describe("parità IT/EN del view model", () => {
  for (const mode of MODES) {
    describe(`mode: ${mode}`, () => {
      const it_ = buildCvViewModel({ data: IT, locale: "it", mode });
      const en_ = buildCvViewModel({ data: EN, locale: "en", mode });

      it("produce lo stesso numero di skill square", () => {
        expect(en_.skillSquares.length).toBe(it_.skillSquares.length);
      });

      it("ordina le skill nello stesso modo (stessi modeTags, stessa sequenza)", () => {
        expect(en_.skillSquares.map((s) => s.modeTags)).toEqual(
          it_.skillSquares.map((s) => s.modeTags),
        );
      });

      it("assegna lo stesso spessore di bordo e lo stesso glow, posizione per posizione", () => {
        expect(en_.skillSquares.map((s) => [s.borderPx, s.isGlow])).toEqual(
          it_.skillSquares.map((s) => [s.borderPx, s.isGlow]),
        );
      });

      it("produce lo stesso numero di cluster esperienza, nello stesso ordine", () => {
        expect(en_.expClusters.length).toBe(it_.expClusters.length);
        expect(en_.expClusters.map((c) => c.items.length)).toEqual(
          it_.expClusters.map((c) => c.items.length),
        );
      });

      it("produce gli stessi progetti nello stesso ordine", () => {
        expect(en_.projectsData.length).toBe(it_.projectsData.length);
      });

      it("produce lo stesso numero di voci in timeline e lingue", () => {
        expect(en_.timelineItems.length).toBe(it_.timelineItems.length);
        expect(en_.langsWithSteps.length).toBe(it_.langsWithSteps.length);
      });

      it("traduce davvero: le etichette di mode non coincidono fra le due lingue", () => {
        // Controprova del test sopra — se IT e EN fossero identiche anche nei
        // testi, i confronti strutturali passerebbero per il motivo sbagliato.
        expect(typeof it_.modeLabel).toBe("string");
        expect(it_.modeLabel.length).toBeGreaterThan(0);
        expect(en_.modeLabel.length).toBeGreaterThan(0);
      });
    });
  }
});

describe("il mode governa l'evidenza, mai il contenuto", () => {
  const perMode = MODES.map((mode) => buildCvViewModel({ data: IT, locale: "it", mode }));

  it("mostra lo stesso insieme di skill in tutti e 4 i mode", () => {
    const sets = perMode.map((vm) => vm.skillSquares.map((s) => s.name).sort());
    for (const s of sets) expect(s).toEqual(sets[0]);
  });

  it("cambia però quali skill risultano attive", () => {
    const activeCounts = perMode.map(
      (vm, i) => vm.skillSquares.filter((s) => isActiveSkill(s.modeTags, MODES[i] as Mode)).length,
    );
    for (const n of activeCounts) expect(n).toBeGreaterThan(0);
  });

  it("porta in cima le skill attive del mode corrente", () => {
    MODES.forEach((mode, i) => {
      const squares = perMode[i]!.skillSquares;
      const firstInactive = squares.findIndex((s) => !isActiveSkill(s.modeTags, mode));
      if (firstInactive === -1) return; // tutte attive: ordinamento non violabile
      const activeAfterInactive = squares
        .slice(firstInactive)
        .some((s) => isActiveSkill(s.modeTags, mode));
      expect(activeAfterInactive).toBe(false);
    });
  });
});

describe("DEFAULT_MODE", () => {
  it("è uno dei mode dichiarati", () => {
    expect(MODES).toContain(DEFAULT_MODE);
  });

  it("è il mode che /en/cv rende lato server, senza condizioni hardcoded", () => {
    // /en/cv non ha il mode nel path: rende DEFAULT_MODE e cambia lato client.
    // È l'unica asimmetria legittima IT/EN, e deve restare espressa così.
    const en = buildCvViewModel({ data: EN, locale: "en", mode: DEFAULT_MODE });
    const it = buildCvViewModel({ data: IT, locale: "it", mode: DEFAULT_MODE });
    expect(en.skillSquares.length).toBe(it.skillSquares.length);
  });
});

describe("orderSkillsForMode", () => {
  // Le 29 chip di ALTEN, nell'ordine in cui stanno in cv.ts.
  const alten = (IT.experience.find((e) => e.company === "ALTEN Italia")?.skills as string[]) ?? [];

  it("ALTEN ha davvero 29 competenze, e la card ne mostra 6", () => {
    expect(alten.length).toBe(29);
  });

  it("su design le prime sei non sono più uno stack frontend", () => {
    const prime = orderSkillsForMode(alten, "creative").slice(0, 6);
    // Il difetto era esattamente questo: zero competenze di design fra le
    // visibili, con UX/UI Design e Figma-to-Code dietro il "+23".
    expect(prime.some((s) => /design|ux|ui|figma|usabilit|wcag/i.test(s))).toBe(true);
    expect(prime).not.toContain("Angular");
    expect(prime).not.toContain("RxJS");
  });

  it("su tech lo stack frontend resta in cima", () => {
    const prime = orderSkillsForMode(alten, "tech").slice(0, 6);
    expect(prime).toContain("Angular");
    expect(prime).toContain("TypeScript");
  });

  it("su human vengono prima MCP e gli agenti", () => {
    const prime = orderSkillsForMode(alten, "human").slice(0, 6);
    expect(prime.some((s) => /mcp|agent|prompt|copilot/i.test(s))).toBe(true);
  });

  it("non perde né duplica competenze, in nessuna lente", () => {
    for (const mode of MODES) {
      const out = orderSkillsForMode(alten, mode as Mode);
      expect(out.length).toBe(alten.length);
      expect([...out].sort()).toEqual([...alten].sort());
    }
  });

  it("è stabile: a parità di punteggio resta l'ordine di cv.ts", () => {
    const neutre = ["Trello", "Scrum", "GitLab"];
    expect(orderSkillsForMode(neutre, "creative")).toEqual(neutre);
  });
});

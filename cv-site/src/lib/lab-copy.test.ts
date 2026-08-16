import { describe, it, expect } from "vitest";
import { LAB_MODES, PROFILE_COPY } from "./lab-copy";
import { MODES } from "./cv-i18n";

// LAB_MODES è un sottoinsieme scelto di MODES: tre professioni su quattro,
// "management" esclusa di proposito (2026-08-16). Non deve tornare a essere
// un riordino delle stesse quattro per errore, e non deve perdere o
// duplicare le tre che restano: da qui in poi lo dice un test invece di una
// route 404 o di una lente doppia nella tendina.
describe("LAB_MODES", () => {
  it("è un sottoinsieme proprio di MODES: le stesse lenti meno 'management'", () => {
    expect([...LAB_MODES].sort()).toEqual([...MODES].filter((m) => m !== "management").sort());
  });

  it("esclude 'management' di proposito", () => {
    expect(LAB_MODES).not.toContain("management");
  });

  it("non contiene duplicati", () => {
    expect(new Set(LAB_MODES).size).toBe(LAB_MODES.length);
  });

  it("ha una copia scritta per ogni lente, 'management' compresa (i dati restano)", () => {
    for (const mode of MODES) {
      expect(PROFILE_COPY[mode], `manca la copy per "${mode}"`).toBeDefined();
    }
  });
});

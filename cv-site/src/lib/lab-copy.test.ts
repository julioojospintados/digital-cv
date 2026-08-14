import { describe, it, expect } from "vitest";
import { LAB_MODES, PROFILE_COPY } from "./lab-copy";
import { MODES } from "./cv-i18n";

// LAB_MODES è una seconda lista delle stesse quattro lenti, con un ordine suo
// (vedi il commento in lab-copy.ts). Due liste che devono contenere le stesse
// cose sono esattamente ciò che diverge in silenzio: da qui in poi, se una
// lente sparisce o si scrive storta, lo dice un test invece di una route 404.
describe("LAB_MODES", () => {
  it("contiene le stesse lenti di MODES, né una in più né una in meno", () => {
    expect([...LAB_MODES].sort()).toEqual([...MODES].sort());
  });

  it("le ordina in modo diverso dal sito in produzione", () => {
    // Non è pignoleria: se un giorno i due ordini coincidono, LAB_MODES non
    // serve più e va tolta invece di restare lì a duplicare MODES.
    expect([...LAB_MODES]).not.toEqual([...MODES]);
  });

  it("ha una copia scritta per ogni lente", () => {
    for (const mode of LAB_MODES) {
      expect(PROFILE_COPY[mode], `manca la copy per "${mode}"`).toBeDefined();
    }
  });
});

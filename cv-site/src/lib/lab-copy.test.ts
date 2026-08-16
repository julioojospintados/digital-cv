import { describe, it, expect } from "vitest";
import { PROFILE_COPY } from "./lab-copy";
import { MODES } from "./cv-i18n";

// Fino al 2026-08-16 qui si controllava anche `LAB_MODES`, una seconda lista
// delle stesse lenti con un ordine suo. È stata rimossa insieme al mode
// "management": con tre lenti il suo ordine coincideva con quello di `MODES`,
// e il test che lo verificava diceva già cosa fare in quel caso — «se un
// giorno i due ordini coincidono, LAB_MODES non serve più e va tolta invece
// di restare lì a duplicare MODES».
//
// Resta il controllo che conta: /lab non può nascere con una lente priva di
// testi. Senza, la lente mancante si scopre come pagina vuota in produzione.
describe("PROFILE_COPY", () => {
  it("ha una copia scritta per ogni lente di MODES", () => {
    for (const mode of MODES) {
      expect(PROFILE_COPY[mode], `manca la copy per "${mode}"`).toBeDefined();
    }
  });

  it("non ha voci che non corrispondono a nessuna lente", () => {
    expect(Object.keys(PROFILE_COPY).sort()).toEqual([...MODES].sort());
  });

  it("ogni voce porta titolo su due righe, sigla e oggetto", () => {
    for (const mode of MODES) {
      const c = PROFILE_COPY[mode];
      expect(c.title, `titolo malformato per "${mode}"`).toHaveLength(2);
      expect(c.initial.length, `sigla vuota per "${mode}"`).toBeGreaterThan(0);
      expect(c.object.length, `oggetto mancante per "${mode}"`).toBeGreaterThan(0);
    }
  });
});

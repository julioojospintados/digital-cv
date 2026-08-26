import { describe, it, expect } from "vitest";
import { PROFILE_OBJECT, PROFILE_TEXT, profileCopy } from "./lab-copy";
import { MODES, type Locale } from "./cv-i18n";

// Fino al 2026-08-16 qui si controllava anche `LAB_MODES`, una seconda lista
// delle stesse lenti con un ordine suo. È stata rimossa insieme al mode
// "management": con tre lenti il suo ordine coincideva con quello di `MODES`,
// e il test che lo verificava diceva già cosa fare in quel caso — «se un
// giorno i due ordini coincidono, LAB_MODES non serve più e va tolta invece
// di restare lì a duplicare MODES».
//
// Riscritto il 2026-08-26. Cercava `PROFILE_COPY`, un export che non esiste
// più: quando l'inglese è rientrato nel sito la copia è stata spezzata in
// due — `PROFILE_OBJECT` (sigla e oggetto, uguali in tutte le lingue) e
// `PROFILE_TEXT` (titolo e paragrafo, per lingua) — con `profileCopy()` a
// rimetterle insieme. Il test non era stato aggiornato e falliva da allora,
// per lo stesso motivo per cui `astro check` segnalava un ts(2724).
//
// Resta il controllo che conta, ora su due lingue invece che su una: nessuna
// lente può nascere priva di testi. Senza, la lente mancante si scopre come
// pagina vuota in produzione.
const LOCALI: Locale[] = ["it", "en"];

describe("profileCopy", () => {
  it("ha un oggetto e una sigla per ogni lente di MODES", () => {
    expect(Object.keys(PROFILE_OBJECT).sort()).toEqual([...MODES].sort());
  });

  it("ha i testi per ogni lente, in tutte e due le lingue", () => {
    for (const locale of LOCALI) {
      expect(Object.keys(PROFILE_TEXT[locale]).sort(), `lingua "${locale}"`).toEqual(
        [...MODES].sort(),
      );
    }
  });

  it("ogni voce porta titolo su due righe, sigla, oggetto e proporzioni", () => {
    for (const locale of LOCALI) {
      for (const mode of MODES) {
        const c = profileCopy(mode, locale);
        expect(c.title, `titolo malformato per "${mode}" (${locale})`).toHaveLength(2);
        expect(
          c.title.every((r) => r.length > 0),
          `riga vuota in "${mode}" (${locale})`,
        ).toBe(true);
        expect(c.initial.length, `sigla vuota per "${mode}"`).toBeGreaterThan(0);
        expect(c.object.length, `oggetto mancante per "${mode}"`).toBeGreaterThan(0);
        expect(c.ratio, `proporzioni malformate per "${mode}"`).toMatch(/^\d+ \/ \d+$/);
        expect(c.desc.length, `paragrafo vuoto per "${mode}" (${locale})`).toBeGreaterThan(0);
      }
    }
  });
});

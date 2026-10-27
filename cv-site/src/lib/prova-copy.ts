// Testi del ramo di prova `test/new-layout` (solo italiano).
//
// Dove possibile sono frasi già scritte da Giulio, prese alla lettera da
// `cv.ts` (personal.summary): il redesign cambia l'aspetto, non la voce.
// I pochi testi nuovi sono segnati come BOZZA e vanno confermati da Giulio.
import type { Mode } from "./cv-i18n";

/** I tre ruoli a rotazione, uno per lente (decisione del 2026-10-27). */
export const PROVA_ROLES: { mode: Mode; label: string }[] = [
  { mode: "creative", label: "UX/UI Designer" },
  { mode: "tech", label: "Creative Developer" },
  { mode: "human", label: "AI Product Engineer" },
];

export const PROVA_HOME = {
  // Verbatim da cv.ts, personal.summary.
  statement: "So costruire quello che disegno: è la differenza tra un mockup e un prodotto.",
  // Verbatim da cv.ts, personal.summary (due frammenti della stessa frase).
  proofEnterprise: "Oltre 6 anni di frontend enterprise",
  proofCompanies: ["Intesa San Paolo", "Aruba", "Rai Pubblicità"],
  proofCerts: "certificazioni IBM e SkillUp in UX/UI",
  // BOZZA: testi nuovi, da confermare.
  available: "Disponibile",
  ctaCv: "Scarica il CV",
  ctaMail: "Scrivimi",
  ctaLinkedin: "LinkedIn",
  lensIntro: "Leggi il CV come",
  work: "Case study",
  rolesSr: "UX/UI Designer, Creative Developer e AI Product Engineer",
} as const;

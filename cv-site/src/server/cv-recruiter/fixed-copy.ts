/**
 * Stringhe di corredo fisse (IT/EN) per il generatore di CV mirati — le
 * stesse già validate in scripts/generate-ux-cv.ts (Locale IT/EN). Duplicate
 * qui invece che importate: generate-ux-cv.ts legge font/QR da disco a livello
 * di modulo (per Playwright), un import diretto in una funzione serverless
 * Vercel proverebbe a leggere file che lì non esistono.
 */

export type CountryBucket = "usa-canada" | "europa" | "italia";

export function bucketFromCountry(country: string): CountryBucket {
  const c = country.trim().toLowerCase();
  if (/\b(usa|u\.s\.a\.|stati uniti|united states|canada)\b/.test(c)) return "usa-canada";
  if (/\b(italia|italy)\b/.test(c)) return "italia";
  return "europa";
}

export function langForBucket(bucket: CountryBucket): "it" | "en" {
  return bucket === "italia" ? "it" : "en";
}

interface FixedCopy {
  linkedinUrl: string;
  siteLabel: string;
  workLinkLabel: string;
  qrCap: string;
  visitBtn: string;
  secExperience: string;
  expEyebrow: string;
  secWork: string;
  workEyebrow: string;
  secSkills: string;
  skillsEyebrow: string;
  secCerts: string;
  secEdu: string;
  secLangs: string;
  ctaTitle: string;
  ctaSub: string;
  portfolioBtn: string;
}

export const FIXED_COPY: Record<"it" | "en", FixedCopy> = {
  en: {
    linkedinUrl: "https://www.linkedin.com/in/giulio-occhipinti?locale=en_US",
    siteLabel: "Website",
    workLinkLabel: "Read the case study",
    qrCap: "Scan the code or tap the button —<br>the whole site is interactive",
    visitBtn: "Visit the site",
    secExperience: "Experience",
    expEyebrow: "selected · most recent first",
    secWork: "Selected Work",
    workEyebrow: "full case studies online",
    secSkills: "Skills",
    skillsEyebrow: "tools of the trade",
    secCerts: "Certifications",
    secEdu: "Education",
    secLangs: "Languages",
    ctaTitle: "Take a look.",
    ctaSub:
      "Interactive CV, live case studies and design system — the links in this PDF are clickable.",
    portfolioBtn: "Open the portfolio",
  },
  it: {
    linkedinUrl: "https://www.linkedin.com/in/giulio-occhipinti?locale=it_IT",
    siteLabel: "Sito",
    workLinkLabel: "Leggi il case study",
    qrCap: "Inquadra il codice o tocca il pulsante,<br>tutto il sito è interattivo",
    visitBtn: "Visita il sito",
    secExperience: "Esperienza",
    expEyebrow: "selezione · più recenti prima",
    secWork: "Lavori selezionati",
    workEyebrow: "case study completi online",
    secSkills: "Competenze",
    skillsEyebrow: "gli strumenti del mestiere",
    secCerts: "Certificazioni",
    secEdu: "Formazione",
    secLangs: "Lingue",
    ctaTitle: "Dai un'occhiata.",
    ctaSub:
      "CV interattivo, case study live e design system: i link in questo PDF sono cliccabili.",
    portfolioBtn: "Apri il portfolio",
  },
};

export const GDPR_FOOTER_IT =
  "Autorizzo il trattamento dei miei dati personali ai sensi del Dlgs 196 del 30 giugno 2003 e del GDPR (Regolamento UE 2016/679).";

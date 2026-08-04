import { Type, type Schema } from "@google/genai";

/**
 * Schema di output strutturato per la chiamata Gemini "di sintesi" (call 2 —
 * niente tool di ricerca, solo responseSchema: l'API di Gemini non supporta
 * combinare tool di ricerca e responseSchema nella stessa richiesta, quindi
 * la ricerca aziendale/stipendio è una chiamata separata, vedi prompt.ts).
 *
 * Contiene SOLO ciò che dipende dalla job description: le stringhe di
 * corredo fisse (label di sezione, CTA, link LinkedIn...) restano in
 * fixed-copy.ts e vengono assemblate lato server — meno superficie per
 * un errore del modello su testo che non dovrebbe mai cambiare.
 */
export const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    anomalies: {
      type: Type.ARRAY,
      description:
        "Anomalie che bloccano la generazione (link portfolio mancante, gap temporali, bullet senza metriche quando la JD le richiede, seniority incoerente, consenso GDPR da confermare per l'Italia). Array vuoto se non ce ne sono.",
      items: { type: Type.STRING },
    },
    report: {
      type: Type.OBJECT,
      nullable: true,
      description: "Null se anomalies non è vuoto. Altrimenti il report di compatibilità.",
      properties: {
        matchPercentage: {
          type: Type.NUMBER,
          description: "0-100, arrotondato. Vedi formula nel system prompt.",
        },
        requirementBreakdown: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              requirement: { type: Type.STRING },
              weight: { type: Type.STRING, enum: ["must-have", "nice-to-have"] },
              score: { type: Type.STRING, enum: ["full", "partial", "none"] },
              note: { type: Type.STRING, description: "Perché questo punteggio, in una riga." },
            },
            required: ["requirement", "weight", "score", "note"],
          },
        },
        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
        painPoints: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              issue: { type: Type.STRING },
              severity: { type: Type.STRING, enum: ["low", "medium", "high"] },
              suggestedAction: { type: Type.STRING },
            },
            required: ["issue", "severity", "suggestedAction"],
          },
        },
        salaryEstimate: {
          type: Type.OBJECT,
          nullable: true,
          description: "Null solo se non stimabile con fonti pubbliche affidabili.",
          properties: {
            text: { type: Type.STRING, description: "Es. '$95k–115k/anno (stimato)'." },
            sources: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["text", "sources"],
        },
      },
      required: ["matchPercentage", "requirementBreakdown", "strengths", "painPoints"],
    },
    cvContent: {
      type: Type.OBJECT,
      nullable: true,
      description: "Null se anomalies non è vuoto.",
      properties: {
        fileSlug: {
          type: Type.STRING,
          description: "kebab-case breve, es. 'acme-frontend', usato per il nome del PDF.",
        },
        positioning: { type: Type.STRING },
        creds: { type: Type.STRING },
        location: { type: Type.STRING },
        profileLead: { type: Type.STRING },
        profile: { type: Type.STRING },
        earlier: { type: Type.STRING },
        experiences: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              yr: { type: Type.STRING },
              loc: { type: Type.STRING },
              role: { type: Type.STRING },
              org: { type: Type.STRING },
              bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["yr", "loc", "role", "org", "bullets"],
          },
        },
        works: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              desc: { type: Type.STRING },
              outcome: { type: Type.STRING },
              url: { type: Type.STRING },
            },
            required: ["title", "desc", "outcome", "url"],
          },
        },
        skills: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              chips: { type: Type.ARRAY, items: { type: Type.STRING } },
              key: { type: Type.BOOLEAN, nullable: true },
            },
            required: ["label", "chips"],
          },
        },
        certs: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              by: { type: Type.STRING },
              name: { type: Type.STRING },
              strong: { type: Type.BOOLEAN, nullable: true },
            },
            required: ["by", "name"],
          },
        },
        edu: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              yr: { type: Type.STRING },
              title: { type: Type.STRING },
              sub: { type: Type.STRING },
            },
            required: ["yr", "title", "sub"],
          },
        },
        langs: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              level: { type: Type.STRING },
            },
            required: ["name", "level"],
          },
        },
      },
      required: [
        "fileSlug",
        "positioning",
        "creds",
        "location",
        "profileLead",
        "profile",
        "earlier",
        "experiences",
        "works",
        "skills",
        "certs",
        "edu",
        "langs",
      ],
    },
  },
  required: ["anomalies"],
};

// ── Tipi TS che rispecchiano lo schema sopra — per la risposta parsata ──────

export interface RequirementScore {
  requirement: string;
  weight: "must-have" | "nice-to-have";
  score: "full" | "partial" | "none";
  note: string;
}

export interface PainPoint {
  issue: string;
  severity: "low" | "medium" | "high";
  suggestedAction: string;
}

export interface SalaryEstimate {
  text: string;
  sources: string[];
}

export interface MatchReport {
  matchPercentage: number;
  requirementBreakdown: RequirementScore[];
  strengths: string[];
  painPoints: PainPoint[];
  salaryEstimate: SalaryEstimate | null;
}

export interface CvContent {
  fileSlug: string;
  positioning: string;
  creds: string;
  location: string;
  profileLead: string;
  profile: string;
  earlier: string;
  experiences: Array<{ yr: string; loc: string; role: string; org: string; bullets: string[] }>;
  works: Array<{ title: string; desc: string; outcome: string; url: string }>;
  skills: Array<{ label: string; chips: string[]; key?: boolean }>;
  certs: Array<{ by: string; name: string; strong?: boolean }>;
  edu: Array<{ yr: string; title: string; sub: string }>;
  langs: Array<{ name: string; level: string }>;
}

export interface StructuredResult {
  anomalies: string[];
  report: MatchReport | null;
  cvContent: CvContent | null;
}

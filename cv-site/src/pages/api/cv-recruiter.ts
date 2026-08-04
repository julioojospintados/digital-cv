import type { APIRoute } from "astro";
import { GoogleGenAI } from "@google/genai";
import { cvData } from "@cv-data";
import { cvDataEn } from "@cv-data-en";
import {
  bucketFromCountry,
  langForBucket,
  FIXED_COPY,
  GDPR_FOOTER_IT,
} from "../../server/cv-recruiter/fixed-copy.js";
import { RESPONSE_SCHEMA, type StructuredResult } from "../../server/cv-recruiter/schema.js";
import {
  buildResearchPrompt,
  buildStructuredSystemPrompt,
  buildStructuredUserContent,
} from "../../server/cv-recruiter/prompt.js";

// Funzione serverless Vercel — chiamata da /tools/cv-recruiter (form privato
// dietro passphrase). Vedi .claude/agents/cv-recruiter.md per l'equivalente
// usato da Claude Code: stesse regole di audit/analisi JD, motore diverso
// (Gemini invece di Claude, per restare gratuito) e output diverso (JSON da
// scaricare e portare su desktop per `npm run pdf:targeted`, non file scritti
// su disco — una funzione serverless non ha accesso al filesystem locale).
export const prerender = false;

interface RequestBody {
  passphrase?: string;
  country?: string;
  company?: string;
  jobDescription?: string;
  extraContext?: string;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const POST: APIRoute = async ({ request }) => {
  const configuredPassphrase = import.meta.env.CV_TOOL_PASSPHRASE;
  const apiKey = import.meta.env.GEMINI_API_KEY;
  const model = import.meta.env.GEMINI_MODEL || "gemini-flash-latest";

  // Fail closed: se la passphrase non è configurata sul server, nessuna
  // richiesta passa — non esiste uno stato "aperto a tutti" per errore.
  if (!configuredPassphrase || !apiKey) {
    return jsonResponse({ ok: false, error: "Tool non configurato lato server." }, 503);
  }

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return jsonResponse({ ok: false, error: "JSON non valido." }, 400);
  }

  if (body.passphrase !== configuredPassphrase) {
    return jsonResponse({ ok: false, error: "Passphrase errata." }, 401);
  }

  const country = body.country?.trim();
  const company = body.company?.trim();
  const jobDescription = body.jobDescription?.trim();
  const extraContext = body.extraContext?.trim() ?? "";

  if (!country || !company || !jobDescription) {
    return jsonResponse(
      { ok: false, error: "Paese, azienda e job description sono obbligatori." },
      400,
    );
  }

  const bucket = bucketFromCountry(country);
  const lang = langForBucket(bucket);
  const cvGroundingData = lang === "it" ? cvData : cvDataEn;

  const ai = new GoogleGenAI({ apiKey });

  try {
    // Call 1 — ricerca (Google Search grounding). Va separata dalla call 2:
    // l'API di Gemini non supporta tool di ricerca e responseSchema nella
    // stessa richiesta.
    const researchResponse = await ai.models.generateContent({
      model,
      contents: buildResearchPrompt({ company, jobDescription, bucket }),
      config: { tools: [{ googleSearch: {} }] },
    });
    const researchFindings = researchResponse.text ?? "(nessun risultato di ricerca)";

    // Call 2 — sintesi strutturata (audit anomalie, match%, CV tarato).
    const structuredResponse = await ai.models.generateContent({
      model,
      contents: buildStructuredUserContent({
        bucket,
        lang,
        company,
        jobDescription,
        extraContext,
        cvGroundingData,
        researchFindings,
      }),
      config: {
        systemInstruction: buildStructuredSystemPrompt(),
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    const raw = structuredResponse.text;
    if (!raw) {
      return jsonResponse({ ok: false, error: "Risposta vuota dal modello." }, 502);
    }
    const result = JSON.parse(raw) as StructuredResult;

    if (result.anomalies.length > 0 || !result.report || !result.cvContent) {
      return jsonResponse({
        ok: true,
        anomalies: result.anomalies,
        report: null,
        cv: null,
        insightEntry: null,
      });
    }

    const { report, cvContent } = result;
    const copy = FIXED_COPY[lang];

    const cv = {
      _meta: {
        company,
        role: cvContent.positioning,
        countryBucket: bucket,
        matchPercentage: String(report.matchPercentage),
        salaryEstimate: report.salaryEstimate?.text ?? "non disponibile",
      },
      lang,
      file: `Giulio_Occhipinti_CV_${cvContent.fileSlug}.pdf`,
      positioning: cvContent.positioning,
      creds: cvContent.creds,
      location: cvContent.location,
      linkedinUrl: copy.linkedinUrl,
      siteLabel: copy.siteLabel,
      workLinkLabel: copy.workLinkLabel,
      qrCap: copy.qrCap,
      visitBtn: copy.visitBtn,
      profileLead: cvContent.profileLead,
      profile: cvContent.profile,
      secExperience: copy.secExperience,
      expEyebrow: copy.expEyebrow,
      earlier: cvContent.earlier,
      secWork: copy.secWork,
      workEyebrow: copy.workEyebrow,
      secSkills: copy.secSkills,
      skillsEyebrow: copy.skillsEyebrow,
      secCerts: copy.secCerts,
      secEdu: copy.secEdu,
      secLangs: copy.secLangs,
      experiences: cvContent.experiences,
      works: cvContent.works,
      skills: cvContent.skills,
      certs: cvContent.certs,
      edu: cvContent.edu,
      langs: cvContent.langs,
      ctaTitle: copy.ctaTitle,
      ctaSub: copy.ctaSub,
      portfolioBtn: copy.portfolioBtn,
      ...(bucket === "italia" ? { gdprFooter: GDPR_FOOTER_IT } : {}),
    };

    const insightEntry = `## ${new Date().toISOString().slice(0, 10)} — ${company} — ${cvContent.positioning}

- Must-have ricorrenti: ${report.requirementBreakdown
      .filter((r) => r.weight === "must-have")
      .map((r) => r.requirement)
      .join(", ")}
- Gap rilevati: ${report.painPoints.map((p) => `${p.issue} (${p.severity})`).join(", ") || "nessuno"}
- Match%: ${report.matchPercentage}
- Stipendio: ${report.salaryEstimate?.text ?? "non disponibile"}
`;

    return jsonResponse({ ok: true, anomalies: [], report, cv, insightEntry });
  } catch (err) {
    console.error("[cv-recruiter]", err);
    return jsonResponse({ ok: false, error: "Errore nella generazione. Riprova." }, 502);
  }
};

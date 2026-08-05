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
  type ImageInput,
} from "../../server/cv-recruiter/prompt.js";
import { renderPdfs } from "../../server/cv-recruiter/render-pdf.js";
import { readEnv, jsonResponse } from "../../server/cv-recruiter/http-helpers.js";
import type { CoverLetterMeta } from "@cv-pdf-template";

// Funzione serverless Vercel — chiamata da /tools/cv-recruiter (form privato
// dietro passphrase). Vedi .claude/agents/cv-recruiter.md per l'equivalente
// usato da Claude Code: stesse regole di audit/analisi JD, motore diverso
// (Gemini invece di Claude, per restare gratuito). A differenza del subagent
// Claude Code (che scrive il JSON su disco e lancia pdf:targeted lui
// stesso), qui il PDF viene renderizzato server-side (render-pdf.ts) e
// tornato in base64 nella risposta — se quel rendering fallisce (vedi il
// commento in render-pdf.ts sul perché è la parte più a rischio), la
// risposta include comunque report + JSON scaricabile, mai un 500 secco.
export const prerender = false;

// Limite reale di Vercel sul body delle funzioni: 4.5MB, non aggirabile da
// codice. Il client comprime gli screenshot lato browser prima di inviarli
// (vedi cv-recruiter.astro), questo è solo un ultimo controllo difensivo.
const MAX_BODY_BYTES = 4.4 * 1024 * 1024;

/** Passato alla call 2 quando la ricerca web non è disponibile — vedi il
 *  commento sulla call 1. Formulato come istruzione, non come dato mancante,
 *  così il modello non prova a compensare inventando cifre. */
const NO_RESEARCH =
  "Ricerca web non disponibile per questa richiesta. Non hai dati pubblici su azienda o stipendi: NON inventare cifre né dettagli aziendali, e imposta salaryEstimate a null a meno che la fascia non sia dichiarata esplicitamente nella job description.";

interface RequestBody {
  passphrase?: string;
  country?: string;
  company?: string;
  jobTitle?: string;
  jobDescription?: string;
  extraContext?: string;
  images?: ImageInput[];
}

export const POST: APIRoute = async ({ request }) => {
  const configuredPassphrase = readEnv("CV_TOOL_PASSPHRASE");
  const apiKey = readEnv("GEMINI_API_KEY");
  const model = readEnv("GEMINI_MODEL") || "gemini-flash-latest";

  // Fail closed: se la passphrase non è configurata sul server, nessuna
  // richiesta passa — non esiste uno stato "aperto a tutti" per errore.
  if (!configuredPassphrase || !apiKey) {
    return jsonResponse({ ok: false, error: "Tool non configurato lato server." }, 503);
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return jsonResponse(
      { ok: false, error: "Richiesta troppo grande (immagini troppo pesanti)." },
      413,
    );
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
  const company = body.company?.trim() ?? "";
  const jobTitle = body.jobTitle?.trim() ?? "";
  const jobDescription = body.jobDescription?.trim() ?? "";
  const extraContext = body.extraContext?.trim() ?? "";
  const images = Array.isArray(body.images) ? body.images : [];

  if (!country || (!jobDescription && images.length === 0)) {
    return jsonResponse(
      {
        ok: false,
        error: "Paese obbligatorio, più job description testuale o almeno uno screenshot.",
      },
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
    //
    // BEST-EFFORT, non bloccante: il grounding con Google Search ha una quota
    // separata da quella del modello e sul piano gratuito può non essercene
    // affatto (verificato: stessa identica richiesta senza `googleSearch`
    // passa, con `googleSearch` risponde 429 RESOURCE_EXHAUSTED). Prima
    // questo faceva fallire l'intera richiesta con un 502 — cioè il tool era
    // inutilizzabile in toto per colpa della sola parte accessoria.
    // Se la ricerca non è disponibile si prosegue senza: il report esce
    // comunque, con salaryEstimate null e nessun dato aziendale (il prompt
    // della call 2 è già istruito a non inventare numeri).
    let researchFindings: string;
    try {
      const researchResponse = await ai.models.generateContent({
        model,
        contents: [
          {
            role: "user",
            parts: buildResearchPrompt({ company, jobTitle, jobDescription, images, bucket }),
          },
        ],
        config: { tools: [{ googleSearch: {} }] },
      });
      researchFindings = researchResponse.text ?? NO_RESEARCH;
    } catch (err) {
      console.warn("[cv-recruiter] ricerca web non disponibile, proseguo senza:", err);
      researchFindings = NO_RESEARCH;
    }

    // Call 2 — sintesi strutturata (audit anomalie, match%, CV tarato).
    const structuredResponse = await ai.models.generateContent({
      model,
      contents: [
        {
          role: "user",
          parts: buildStructuredUserContent({
            bucket,
            lang,
            company,
            jobTitle,
            jobDescription,
            images,
            extraContext,
            cvGroundingData,
            researchFindings,
          }),
        },
      ],
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
        coverLetter: null,
        insightEntry: null,
      });
    }

    const { report, cvContent } = result;
    const copy = FIXED_COPY[lang];
    const resolvedCompany = company || cvContent.companyResolved || "azienda non specificata";

    const cv = {
      _meta: {
        company: resolvedCompany,
        jobTitle: jobTitle || cvContent.positioning,
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

    const insightEntry = `## ${new Date().toISOString().slice(0, 10)} — ${resolvedCompany} — ${cvContent.positioning}

- Azienda: ${report.companyProfile ?? "profilo non disponibile (ricerca web non riuscita)"}
- Must-have ricorrenti: ${report.requirementBreakdown
      .filter((r) => r.weight === "must-have")
      .map((r) => r.requirement)
      .join(", ")}
- Gap rilevati: ${report.painPoints.map((p) => `${p.issue} (${p.severity})`).join(", ") || "nessuno"}
- Match%: ${report.matchPercentage}
- Stipendio: ${report.salaryEstimate?.text ?? "non disponibile"}
`;

    // Dati mittente per la cover letter — dalla stessa fonte di verità del
    // CV (cvGroundingData), mai inventati: se l'indirizzo Email non c'è nei
    // dati, il template la omette invece di inventarne una.
    const senderEmail = cvGroundingData.social.find((s) => s.platform === "Email")?.label ?? "";
    const coverLetterMeta: CoverLetterMeta = {
      lang,
      senderName: cvGroundingData.personal.name,
      senderEmail,
      senderLocation: cvContent.location,
      linkedinUrl: copy.linkedinUrl,
      company: resolvedCompany,
      role: cv._meta.jobTitle,
    };

    // Rendering PDF best-effort — non blocca né rompe la risposta se fallisce
    // (vedi il commento in cima a render-pdf.ts).
    const pdfs = await renderPdfs(cv, result.coverLetter, coverLetterMeta);

    return jsonResponse({
      ok: true,
      anomalies: [],
      report,
      cv,
      coverLetter: result.coverLetter,
      insightEntry,
      // false quando il grounding Google Search non era disponibile: senza
      // questo, l'assenza di stima salariale sembrerebbe un dato di fatto
      // invece che una capacità mancante.
      researchAvailable: researchFindings !== NO_RESEARCH,
      pdf: pdfs
        ? {
            designed: pdfs.designed.toString("base64"),
            atsDraft: pdfs.atsDraft.toString("base64"),
            coverLetter: pdfs.coverLetter ? pdfs.coverLetter.toString("base64") : null,
          }
        : null,
    });
  } catch (err) {
    console.error("[cv-recruiter]", err);
    return jsonResponse({ ok: false, error: "Errore nella generazione. Riprova." }, 502);
  }
};

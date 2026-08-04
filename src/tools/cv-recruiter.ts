import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { readFileSync, writeFileSync, mkdirSync, existsSync, appendFileSync } from "fs";
import { dirname, resolve, extname } from "path";
import { fileURLToPath } from "url";
import { env } from "../config/env.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "../..");
const TARGETED_DIR = resolve(ROOT, "cv-output/targeted");
const INSIGHTS_DIR = resolve(ROOT, "cv-output/jd-insights");

const MIME_BY_EXT: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

/**
 * Espone a Claude Code lo stesso flusso Gemini usato da /tools/cv-recruiter
 * (form mobile) — audit, match% contro la job description, e CV tarato.
 * A differenza del subagent .claude/agents/cv-recruiter.md (che usa Claude
 * e scrive/lancia tutto in locale), questa chiama l'endpoint deployato via
 * HTTP: stesso motore gratuito che usa Giulio da telefono, utile per
 * verificare dal vivo il tool web o per generare senza spendere sulla API
 * Claude. Se l'endpoint ritorna anche i PDF (rendering server-side riuscito
 * — non garantito, vedi cv-site/src/server/cv-recruiter/render-pdf.ts), li
 * salva qui; altrimenti salva solo il JSON e lo dice esplicitamente.
 */
export function registerCvRecruiterTool(server: McpServer): void {
  server.tool(
    "cv-recruiter",
    "Genera un CV tarato su una job description reale (paese, azienda opzionale, job description testuale e/o screenshot) chiamando il tool web Gemini-powered di Giulio Occhipinti. Ritorna un report di compatibilità (match%, punti di forza, pain point, stipendio stimato) e salva CV JSON (+ PDF se il rendering server-side riesce) in cv-output/targeted/, più una voce di memoria in cv-output/jd-insights/. Se l'endpoint segnala anomalie (dati mancanti, gap temporali, ecc.), le ritorna come domande da girare all'utente invece di generare.",
    {
      country: z
        .string()
        .min(1)
        .describe("Paese target, testo libero (es. 'USA', 'Germania', 'Italia')"),
      company: z.string().optional().describe("Nome azienda, se noto"),
      jobTitle: z.string().optional().describe("Titolo del ruolo, se noto"),
      jobDescription: z
        .string()
        .optional()
        .describe("Testo della job description — obbligatorio se non si passano imagePaths"),
      imagePaths: z
        .array(z.string())
        .optional()
        .describe(
          "Path locali a screenshot dell'annuncio (png/jpg/webp), letti e allegati alla richiesta",
        ),
      extraContext: z
        .string()
        .optional()
        .describe(
          "Contesto aggiuntivo o risposte a un giro precedente che aveva segnalato anomalie",
        ),
    },
    async ({ country, company, jobTitle, jobDescription, imagePaths, extraContext }) => {
      if (!env.CV_TOOL_PASSPHRASE) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: "CV_TOOL_PASSPHRASE non configurata nell'ambiente del server MCP — impostala in .env (stessa passphrase usata dal tool web) e riavvia.",
            },
          ],
        };
      }
      if (!jobDescription && (!imagePaths || imagePaths.length === 0)) {
        return {
          isError: true,
          content: [
            { type: "text", text: "Serve jobDescription (testo) o almeno un path in imagePaths." },
          ],
        };
      }

      const images = (imagePaths ?? []).map((p) => {
        const mimeType = MIME_BY_EXT[extname(p).toLowerCase()];
        if (!mimeType) throw new Error(`Estensione immagine non supportata: ${p}`);
        return { mimeType, data: readFileSync(p).toString("base64") };
      });

      const res = await fetch(`${env.CV_TOOL_BASE_URL}/api/cv-recruiter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passphrase: env.CV_TOOL_PASSPHRASE,
          country,
          company,
          jobTitle,
          jobDescription,
          extraContext,
          images,
        }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        error?: string;
        anomalies?: string[];
        report?: {
          matchPercentage: number;
          strengths: string[];
          painPoints: Array<{ issue: string; severity: string; suggestedAction: string }>;
          salaryEstimate: { text: string; sources: string[] } | null;
        } | null;
        cv?: (Record<string, unknown> & { file: string; _meta: Record<string, string> }) | null;
        insightEntry?: string | null;
        pdf?: { designed: string; atsDraft: string } | null;
      };

      if (!res.ok || !data.ok) {
        return {
          isError: true,
          content: [{ type: "text", text: data.error ?? `Errore HTTP ${res.status}.` }],
        };
      }

      if (data.anomalies && data.anomalies.length > 0) {
        return {
          content: [
            {
              type: "text",
              text: `Anomalie da chiarire prima di generare:\n${data.anomalies.map((a) => `- ${a}`).join("\n")}\n\nRichiama questo tool con extraContext valorizzato per proseguire.`,
            },
          ],
        };
      }

      const { report, cv, insightEntry, pdf } = data;
      if (!report || !cv) {
        return { isError: true, content: [{ type: "text", text: "Risposta inattesa dal tool." }] };
      }

      mkdirSync(TARGETED_DIR, { recursive: true });
      const jsonPath = resolve(TARGETED_DIR, cv.file.replace(".pdf", ".json"));
      writeFileSync(jsonPath, JSON.stringify(cv, null, 2), "utf-8");

      const savedFiles = [jsonPath];
      if (pdf) {
        const designedPath = resolve(TARGETED_DIR, cv.file);
        const atsPath = resolve(TARGETED_DIR, cv.file.replace(".pdf", "_ATS_DRAFT.pdf"));
        writeFileSync(designedPath, Buffer.from(pdf.designed, "base64"));
        writeFileSync(atsPath, Buffer.from(pdf.atsDraft, "base64"));
        savedFiles.push(designedPath, atsPath);
      }

      if (insightEntry) {
        mkdirSync(INSIGHTS_DIR, { recursive: true });
        const insightPath = resolve(INSIGHTS_DIR, `${cv._meta.countryBucket}.md`);
        if (!existsSync(insightPath)) writeFileSync(insightPath, "", "utf-8");
        appendFileSync(insightPath, `${insightEntry}\n`, "utf-8");
        savedFiles.push(insightPath);
      }

      const painPointsText = report.painPoints
        .map((p) => `- ${p.issue} (${p.severity}) → ${p.suggestedAction}`)
        .join("\n");

      return {
        content: [
          {
            type: "text",
            text: `Match: ${report.matchPercentage}%

Punti di forza:
${report.strengths.map((s) => `- ${s}`).join("\n")}

Pain point:
${painPointsText || "nessuno"}

Stipendio stimato: ${report.salaryEstimate?.text ?? "non disponibile"}

File salvati:
${savedFiles.map((f) => `- ${f}`).join("\n")}
${pdf ? "" : "\n(Rendering PDF server-side non riuscito questa volta — genera i PDF in locale con: npm run pdf:targeted -- " + jsonPath + ")"}`,
          },
        ],
      };
    },
  );
}

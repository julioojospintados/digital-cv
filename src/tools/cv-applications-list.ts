import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { env } from "../config/env.js";

/**
 * Legge il ledger candidature (candidato/mail ricevuta/conferma CV/esito)
 * popolato in automatico da /api/cv-recruiter.ts ad ogni generazione riuscita
 * — vedi cv-applications-update.ts per aggiornare lo stato e AGENTS.md per
 * l'architettura completa (Blob condiviso con il tool mobile /tools/applications).
 */
export function registerCvApplicationsListTool(server: McpServer): void {
  server.tool(
    "cv-applications-list",
    "Elenca il ledger candidature (azienda, ruolo, match%, stipendio stimato, stato: candidato/mail ricevuta/conferma CV/esito), lo stesso che vedi in /tools/applications da telefono. Usalo prima di un cv-applications-update per trovare l'id della candidatura giusta.",
    {},
    async () => {
      if (!env.CV_TOOL_PASSPHRASE) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: "CV_TOOL_PASSPHRASE non configurata nell'ambiente del server MCP — impostala in .env e riavvia.",
            },
          ],
        };
      }

      const res = await fetch(`${env.CV_TOOL_BASE_URL}/api/cv-recruiter-applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passphrase: env.CV_TOOL_PASSPHRASE, action: "list" }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        error?: string;
        applications?: Array<{
          id: string;
          createdAt: string;
          bucket: string;
          company: string;
          role: string;
          matchPercentage: number;
          salaryEstimate: string;
          status: {
            applied: boolean;
            emailReceived: boolean;
            cvConfirmationReceived: boolean;
            outcome: string;
          };
        }>;
      };

      if (!res.ok || !data.ok) {
        return {
          isError: true,
          content: [{ type: "text", text: data.error ?? `Errore HTTP ${res.status}.` }],
        };
      }

      const applications = data.applications ?? [];
      if (applications.length === 0) {
        return { content: [{ type: "text", text: "Nessuna candidatura nel ledger." }] };
      }

      const rows = applications.map((a) => {
        const s = a.status;
        const flags = [
          s.applied ? "candidato" : null,
          s.emailReceived ? "mail ricevuta" : null,
          s.cvConfirmationReceived ? "conferma CV" : null,
        ]
          .filter(Boolean)
          .join(", ");
        return `- [${a.id}] ${a.company} — ${a.role} (${a.bucket}, match ${a.matchPercentage}%, ${a.createdAt.slice(0, 10)}) — esito: ${s.outcome}${flags ? ` — ${flags}` : ""}`;
      });

      return { content: [{ type: "text", text: rows.join("\n") }] };
    },
  );
}

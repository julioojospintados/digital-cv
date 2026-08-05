import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { env } from "../config/env.js";

/**
 * Aggiorna lo stato di una candidatura nel ledger (vedi cv-applications-list.ts
 * per trovare l'id). Stessa route HTTP del tool mobile /tools/applications —
 * Blob è l'unica fonte di verità condivisa, nessuna scrittura locale.
 */
export function registerCvApplicationsUpdateTool(server: McpServer): void {
  server.tool(
    "cv-applications-update",
    "Aggiorna lo stato di una candidatura nel ledger: candidato, mail ricevuta, conferma CV ricevuta, esito. Passa solo i campi che vuoi cambiare. Usa cv-applications-list per trovare l'id.",
    {
      id: z.string().min(1).describe("id della candidatura, da cv-applications-list"),
      applied: z
        .boolean()
        .optional()
        .describe("true quando la candidatura è stata effettivamente inviata"),
      emailReceived: z
        .boolean()
        .optional()
        .describe("true quando arriva una prima mail dall'azienda"),
      cvConfirmationReceived: z
        .boolean()
        .optional()
        .describe("true quando arriva la mail di conferma ricezione CV"),
      outcome: z
        .enum(["pending", "rejected", "offer", "ghosted"])
        .optional()
        .describe(
          "esito finale: pending (default) | rejected | offer | ghosted (nessuna risposta)",
        ),
    },
    async ({ id, applied, emailReceived, cvConfirmationReceived, outcome }) => {
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

      const patch: Record<string, boolean | string> = {};
      if (applied !== undefined) patch.applied = applied;
      if (emailReceived !== undefined) patch.emailReceived = emailReceived;
      if (cvConfirmationReceived !== undefined)
        patch.cvConfirmationReceived = cvConfirmationReceived;
      if (outcome !== undefined) patch.outcome = outcome;

      if (Object.keys(patch).length === 0) {
        return {
          isError: true,
          content: [{ type: "text", text: "Passa almeno un campo da aggiornare." }],
        };
      }

      const res = await fetch(`${env.CV_TOOL_BASE_URL}/api/cv-recruiter-applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passphrase: env.CV_TOOL_PASSPHRASE, action: "update", id, patch }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        error?: string;
        application?: {
          id: string;
          company: string;
          role: string;
          status: Record<string, unknown>;
        };
      };

      if (!res.ok || !data.ok || !data.application) {
        return {
          isError: true,
          content: [{ type: "text", text: data.error ?? `Errore HTTP ${res.status}.` }],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `Aggiornato: ${data.application.company} — ${data.application.role}\n${JSON.stringify(data.application.status, null, 2)}`,
          },
        ],
      };
    },
  );
}

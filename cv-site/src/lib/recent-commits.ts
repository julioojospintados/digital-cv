/**
 * recent-commits.ts — ultimi commit letti da git in fase di build, per il
 * badge "ciclo di sistemazione" in home (index.astro / en/index.astro).
 *
 * Le date/orari mostrati non sono hardcoded nel markup: ogni build (ogni
 * push → nuovo deploy → nuova `astro build`) legge di nuovo `git log` e
 * riflette automaticamente gli ultimi commit reali, senza hook o passaggi
 * manuali da tenere sincronizzati.
 */

import { execSync } from "node:child_process";
import { LOCALES } from "./cv-i18n";

export interface RecentCommit {
  day: number;
  /** 0-based, come Date.getMonth() — indicizza LOCALES[locale].months. */
  month: number;
  hour: number;
  minute: number;
}

/**
 * Ritorna [] se il build non gira dentro un repo git (checkout senza
 * `.git`, zip scaricato) — il badge nasconde la lista invece di far
 * fallire la build per un dettaglio cosmetico.
 */
export function getRecentCommits(count = 3): RecentCommit[] {
  try {
    const out = execSync(`git log -${count} --format=%cI`, {
      encoding: "utf-8",
    }).trim();
    if (!out) return [];
    return out.split("\n").map((iso) => {
      // "2026-07-27T12:08:45+02:00" — i numeri prima dell'offset sono l'ora
      // locale registrata da git al momento del commit. Estrarli per stringa
      // invece di costruire un Date: un Date normalizza al timezone della
      // macchina che fa il build (es. UTC su Vercel), spostando l'orario
      // mostrato rispetto a quello che Giulio ha davvero visto committare.
      const [datePart, timePart] = iso.split("T");
      const [, month, day] = datePart.split("-").map(Number);
      const [hour, minute] = timePart.split(":").map(Number);
      return { day, month: month - 1, hour, minute };
    });
  } catch {
    return [];
  }
}

export function formatRecentCommit(c: RecentCommit, locale: "it" | "en"): string {
  const hh = String(c.hour).padStart(2, "0");
  const mm = String(c.minute).padStart(2, "0");
  if (locale === "it") {
    const dd = String(c.day).padStart(2, "0");
    const mo = String(c.month + 1).padStart(2, "0");
    return `${dd}/${mo} · ${hh}:${mm}`;
  }
  return `${c.day} ${LOCALES.en.months[c.month]} · ${hh}:${mm}`;
}

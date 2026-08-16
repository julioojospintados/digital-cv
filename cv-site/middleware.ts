// Vercel Routing Middleware — smista IT/EN in base al paese del visitatore.
// File framework-agnostic letto da Vercel a livello di edge, indipendente
// dall'output "static" di Astro (nessun adapter richiesto): vercel.com/docs/routing-middleware.
//
// Regole decise con l'utente (2026-07-27):
// - Solo visitatori reali: i crawler (Googlebot ecc.) vedono sempre l'IT,
//   così l'indicizzazione non dipende da dove Vercel pensa che giri il bot.
// - Nessuna route EN per-mode oggi (/en/tech ecc. non esistono — vedi
//   todo.md #40): chi arriva da fuori Italia su /tech /creative /human
//   atterra su /en/cv, l'unica pagina EN esistente.
// - Un solo redirect automatico per visitatore: dopo il primo, il cookie
//   lang-pref lo ricorda e la navigazione successiva (anche manuale, es.
//   tornare all'IT dal lang-switch) non viene più toccata da qui.
import { geolocation } from "@vercel/functions";

const IT_ONLY_TO_EN_CV = new Set(["/", "/cv", "/tech", "/creative", "/human"]);

const COOKIE_NAME = "lang-pref";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 anno

// Copre i crawler principali (motori di ricerca + preview link di social/chat).
const BOT_UA_RE =
  /bot|crawler|spider|slurp|bingpreview|facebookexternalhit|whatsapp|telegrambot|discordbot|applebot|duckduckbot|baiduspider|yandex(bot)?|semrush|ahrefs|mj12bot|petalbot|linkedinbot|twitterbot|pinterest/i;

export default function middleware(request: Request) {
  const url = new URL(request.url);
  const { pathname } = url;

  // Già deciso in una visita precedente (redirect fatto, o mai necessario
  // perché il cookie è stato settato solo sul ramo di redirect sotto) —
  // non ridecidere ad ogni pagina, rispetta la navigazione successiva.
  if (request.headers.get("cookie")?.includes(`${COOKIE_NAME}=`)) return;

  const ua = request.headers.get("user-agent") ?? "";
  if (BOT_UA_RE.test(ua)) return;

  const { country } = geolocation(request);
  if (!country || country === "IT") return;

  let target: string | null = null;
  if (pathname === "/work") target = "/en/work";
  else if (pathname.startsWith("/work/")) target = `/en${pathname}`;
  else if (IT_ONLY_TO_EN_CV.has(pathname)) target = pathname === "/" ? "/en" : "/en/cv";

  if (!target) return;

  // Response.redirect() restituisce headers immutabili per spec Fetch API:
  // .append() successivo lanciava sempre "TypeError: immutable" (500 in prod,
  // vedi todo.md #67). Costruendo la Response a mano gli header restano scrivibili.
  return new Response(null, {
    status: 307,
    headers: {
      Location: new URL(target, request.url).toString(),
      "Set-Cookie": `${COOKIE_NAME}=en; Max-Age=${COOKIE_MAX_AGE}; Path=/; SameSite=Lax; Secure`,
    },
  });
}

export const config = {
  matcher: ["/", "/cv", "/tech", "/creative", "/human", "/work", "/work/:slug*"],
};

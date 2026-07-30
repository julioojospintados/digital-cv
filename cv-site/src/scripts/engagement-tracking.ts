// Notifica di engagement — evento PostHog quando il visitatore accumula
// almeno 20s di tempo REALMENTE visibile (tab in primo piano, non a
// orologio) nel corso dell'INTERA sessione, non della singola pagina:
// navigare più pagine dello stesso sito somma il tempo, e la notifica parte
// una volta sola per sessione — mai più, anche continuando a navigare per
// altri 10 minuti. Richiesta esplicita 2026-07-30, dopo aver scoperto che
// una destinazione PostHog preesistente ("Pageview -> Slack") notificava ad
// ogni singolo pageview della stessa sessione, producendo una notifica per
// pagina invece di una per visita.
//
// Persistenza in sessionStorage (si azzera da sola alla chiusura del tab,
// niente da ripulire manualmente): il tempo accumulato e il conteggio pagine
// sopravvivono alla navigazione, perché ogni pagina di questo sito è un
// reload completo (Astro multi-page, non una SPA) — lo stato del modulo non
// sopravviverebbe altrimenti. Il flag "già notificato" impedisce un secondo
// invio nella stessa sessione.
//
// Nessun gate di consenso da gestire qui: se PostHog non è ancora
// inizializzato (consenso non ancora dato), window.posthog non esiste e la
// capture viene silenziosamente saltata — stesso principio "niente tracking
// prima del consenso" già applicato al resto del sito (vedi Layout.astro).
// Se l'utente accetta il consenso dopo aver già superato i 20s complessivi,
// l'evento semplicemente non parte per quella sessione: nessun invio
// retroattivo.

const ENGAGED_THRESHOLD_MS = 20_000;
const STORAGE_MS_KEY = "cv-engaged-ms";
const STORAGE_NOTIFIED_KEY = "cv-engaged-notified";
const STORAGE_PAGES_KEY = "cv-engaged-pages";

function readStoredMs(): number {
  return Number(sessionStorage.getItem(STORAGE_MS_KEY)) || 0;
}

function incrementPagesViewed(): number {
  const pages = (Number(sessionStorage.getItem(STORAGE_PAGES_KEY)) || 0) + 1;
  sessionStorage.setItem(STORAGE_PAGES_KEY, String(pages));
  return pages;
}

const pagesViewed = incrementPagesViewed();

if (sessionStorage.getItem(STORAGE_NOTIFIED_KEY) !== "1") {
  const baselineMs = readStoredMs();
  let pageVisibleMs = 0;
  let visibleSince: number | null =
    document.visibilityState === "visible" ? performance.now() : null;
  let fired = false;

  function currentPageVisibleMs(): number {
    return visibleSince !== null ? pageVisibleMs + (performance.now() - visibleSince) : pageVisibleMs;
  }

  function persist(totalMs: number): void {
    sessionStorage.setItem(STORAGE_MS_KEY, String(totalMs));
  }

  function checkEngaged(): void {
    if (fired) return;
    const totalMs = baselineMs + currentPageVisibleMs();
    if (totalMs < ENGAGED_THRESHOLD_MS) {
      persist(totalMs);
      return;
    }
    fired = true;
    clearInterval(intervalId);
    persist(totalMs);
    sessionStorage.setItem(STORAGE_NOTIFIED_KEY, "1");
    window.posthog?.capture("engaged_visit_20s", {
      engaged_seconds: Math.round(totalMs / 1000),
      pages_viewed: pagesViewed,
    });
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      visibleSince = performance.now();
    } else if (visibleSince !== null) {
      pageVisibleMs += performance.now() - visibleSince;
      visibleSince = null;
      persist(baselineMs + pageVisibleMs);
    }
  });

  const intervalId = setInterval(checkEngaged, 1000);
}

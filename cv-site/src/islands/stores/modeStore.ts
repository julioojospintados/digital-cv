import { persistentAtom } from "@nanostores/persistent";

export type Mode = "tech" | "creative" | "human";

const VALID_MODES: Mode[] = ["tech", "creative", "human"];

// Slug di URL → chiave interna. Duplica di proposito LENS_SLUGS di
// `lib/cv-i18n.ts`: questo file è un island Lit che finisce in ogni pagina, e
// importare il modulo i18n (con dentro tutte le stringhe delle due lingue)
// solo per tre coppie di parole costerebbe più del bene che fa. Se cambia
// uno slug, vanno cambiati tutti e due i punti — sono due righe, e questo
// commento è il promemoria.
const MODE_BY_SLUG: Record<string, Mode> = {
  tech: "tech",
  design: "creative",
  ai: "human",
};

/** Risolve la lente dal primo segmento del path, per slug o per chiave. */
function modeFromSegment(seg: string): Mode | null {
  if (MODE_BY_SLUG[seg]) return MODE_BY_SLUG[seg];
  return VALID_MODES.includes(seg as Mode) ? (seg as Mode) : null;
}

function getInitialMode(): Mode {
  if (typeof window !== "undefined") {
    const urlParam = new URLSearchParams(window.location.search).get("mode");
    if (urlParam && VALID_MODES.includes(urlParam as Mode)) {
      return urlParam as Mode;
    }
    // Il path: /design, /tech, /ai (slug) — e le chiavi, che restano valide
    // perché /old-version/<chiave> le usa ancora.
    const pathSegment = window.location.pathname.split("/").filter(Boolean)[0] ?? "";
    const fromPath = modeFromSegment(pathSegment);
    if (fromPath) return fromPath;
  }
  // Default 'creative': il posizionamento del CV è Design-first, quindi chi
  // arriva senza un mode esplicito (link diretto, QR del PDF) vede la lente
  // UX/UI. Stesso default in IT e EN — vedi DEFAULT_MODE in cv-init.ts.
  return "creative";
}

export const modeStore = persistentAtom<Mode>("cv-mode", getInitialMode(), {
  listen: false,
});

export function setMode(mode: Mode): void {
  if (!VALID_MODES.includes(mode)) return;

  const run = () => {
    modeStore.set(mode);
    document.documentElement.dataset.mode = mode;
    const url = new URL(window.location.href);
    const pathSegment = url.pathname.split("/").filter(Boolean)[0] ?? "";
    if (VALID_MODES.includes(pathSegment as Mode)) {
      // On a path-based mode page — update the path instead of query param
      url.pathname = `/${mode}`;
      url.searchParams.delete("mode");
    } else {
      url.searchParams.set("mode", mode);
    }
    window.history.replaceState({}, "", url.toString());
  };

  if ("startViewTransition" in document) {
    // Non usiamo ViewTransition per il cambio mode:
    // avvolgerebbe ogni click in un crossfade dell'intera pagina (~300ms di lock)
    // invece di aggiornare CSS variables + card states immediatamente.
    run();
  } else {
    run();
  }
}

// Pagine che usano il mode system ma non hanno una route di mode nel path
// (es. /en/cv, /cv) — leggono il mode da localStorage invece di azzerarlo.
const MODE_AWARE_PATHS = ["/old-version/en/cv"];

// Pagine che dichiarano il proprio mode lato server (data-mode SSR nel
// markup): il mode è del contenuto (primaryMode del case study), non
// dell'utente — initMode non deve né cancellarlo né sovrascriverlo.
const SSR_MODE_PATHS = ["/work", "/en/work"];

// Route con la lente nel path ma non nel primo segmento: `/en/design`,
// `/old-version/creative`, `/lab/...`. Il controllo standard qui sotto guarda
// `pathname.split("/")[0]`, che lì vale "en", "old-version" o "lab" e non è
// una lente — la pagina finiva quindi nel ramo `else`, quello che AZZERA
// data-mode: colore giusto in SSR, pagina bianca dopo l'idratazione.
//
// Sintomo osservato e misurato con Playwright su tutte e quattro le lenti:
// colore corretto al readyState "interactive" (è l'SSR), bianco a
// "complete" (dopo l'idratazione). Sparito data-mode, ogni variabile di mode
// ripiega su :root, dove `--color-accent` è rgba(255,255,255,0.9).
//
// Trattarla come una route di mode a tutti gli effetti — invece di limitarsi
// a non cancellare l'attributo — allinea anche il `modeStore`, da cui
// <go-logo> prende il proprio colore: altrimenti il logo resta sull'ultima
// lente memorizzata mentre il resto della pagina è già cambiato.
// L'ordine conta: /old-version/en/... deve essere riconosciuto dal prefisso
// più lungo, non da "/en/" — altrimenti la versione storica passerebbe per
// una pagina del sito nuovo.
const LENS_ROUTE_PREFIXES = ["/old-version/", "/lab/", "/en/"];

function lensFromPath(pathname: string): Mode | null {
  const prefix = LENS_ROUTE_PREFIXES.find((p) => pathname.startsWith(p));
  if (!prefix) return null;
  // `/lab/hero` e `/old-version/home` passano di qui: modeFromSegment li
  // scarta, e restano quindi pagine senza lente.
  const seg = pathname.slice(prefix.length).split("/").filter(Boolean)[0] ?? "";
  return modeFromSegment(seg);
}

export function initMode(): void {
  if (typeof window === "undefined") return;
  // La route è la source of truth: se siamo su /tech, usiamo 'tech'
  // indipendentemente da cosa c'è in localStorage.
  // Evita il flash di colore sbagliato quando localStorage ha un mode diverso.
  const pathname = window.location.pathname;
  const pathSegment = pathname.split("/").filter(Boolean)[0] ?? "";
  const routeMode = modeFromSegment(pathSegment) ?? lensFromPath(pathname);

  if (routeMode) {
    // Siamo su una pagina di lente (/design, /tech, /ai) — applica
    document.documentElement.dataset.mode = routeMode;
    modeStore.set(routeMode);
  } else if (MODE_AWARE_PATHS.some((p) => pathname.startsWith(p))) {
    // Pagina mode-aware senza route di mode (/en/cv) — usa localStorage o default 'creative'
    const stored = modeStore.get();
    const mode = VALID_MODES.includes(stored) ? stored : "creative";
    document.documentElement.dataset.mode = mode;
  } else if (SSR_MODE_PATHS.some((p) => pathname.startsWith(p))) {
    // Case study (/work/*) — il data-mode SSR del progetto resta com'è
  } else {
    // Home (/) o altre route non-mode — torna a neutro
    delete document.documentElement.dataset.mode;
  }
}

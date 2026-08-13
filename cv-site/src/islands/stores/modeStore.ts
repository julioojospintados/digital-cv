import { persistentAtom } from "@nanostores/persistent";

export type Mode = "tech" | "creative" | "human" | "management";

const VALID_MODES: Mode[] = ["tech", "creative", "human", "management"];

function getInitialMode(): Mode {
  if (typeof window !== "undefined") {
    const urlParam = new URLSearchParams(window.location.search).get("mode");
    if (urlParam && VALID_MODES.includes(urlParam as Mode)) {
      return urlParam as Mode;
    }
    // Check URL path for /tech, /creative, /human, /management
    const pathSegment = window.location.pathname.split("/").filter(Boolean)[0] ?? "";
    if (VALID_MODES.includes(pathSegment as Mode)) {
      return pathSegment as Mode;
    }
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
const MODE_AWARE_PATHS = ["/en/cv", "/cv"];

// Pagine che dichiarano il proprio mode lato server (data-mode SSR nel
// markup): il mode è del contenuto (primaryMode del case study), non
// dell'utente — initMode non deve né cancellarlo né sovrascriverlo.
const SSR_MODE_PATHS = ["/work", "/en/work"];

// Route di prova con la lente nel path, ma non nel primo segmento:
// `/lab/creative`. Il controllo standard qui sotto guarda
// `pathname.split("/")[0]`, che qui vale "lab" e non è un mode valido — la
// pagina finiva quindi nel ramo `else`, quello che AZZERA data-mode.
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
const LENS_ROUTE_PREFIX = "/lab/";

function lensFromPath(pathname: string): Mode | null {
  if (!pathname.startsWith(LENS_ROUTE_PREFIX)) return null;
  // `/lab/home` e `/lab/hero` passano di qui: il controllo su VALID_MODES
  // piu' sotto li scarta, e restano quindi pagine senza lente.
  const seg = pathname.slice(LENS_ROUTE_PREFIX.length).split("/").filter(Boolean)[0] ?? "";
  return VALID_MODES.includes(seg as Mode) ? (seg as Mode) : null;
}

export function initMode(): void {
  if (typeof window === "undefined") return;
  // La route è la source of truth: se siamo su /tech, usiamo 'tech'
  // indipendentemente da cosa c'è in localStorage.
  // Evita il flash di colore sbagliato quando localStorage ha un mode diverso.
  const pathname = window.location.pathname;
  const pathSegment = pathname.split("/").filter(Boolean)[0] ?? "";
  const routeMode = VALID_MODES.includes(pathSegment as Mode)
    ? (pathSegment as Mode)
    : lensFromPath(pathname);

  if (routeMode) {
    // Siamo su una pagina di mode (/tech, /creative, ecc.) — applica
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

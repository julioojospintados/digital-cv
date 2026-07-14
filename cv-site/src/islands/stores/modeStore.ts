import { persistentAtom } from '@nanostores/persistent';

export type Mode = 'tech' | 'creative' | 'human' | 'management';

const VALID_MODES: Mode[] = ['tech', 'creative', 'human', 'management'];

function getInitialMode(): Mode {
  if (typeof window !== 'undefined') {
    const urlParam = new URLSearchParams(window.location.search).get('mode');
    if (urlParam && VALID_MODES.includes(urlParam as Mode)) {
      return urlParam as Mode;
    }
    // Check URL path for /tech, /creative, /human, /management
    const pathSegment = window.location.pathname.split('/').filter(Boolean)[0] ?? '';
    if (VALID_MODES.includes(pathSegment as Mode)) {
      return pathSegment as Mode;
    }
  }
  return 'tech';
}

export const modeStore = persistentAtom<Mode>('cv-mode', getInitialMode(), {
  listen: false,
});

export function setMode(mode: Mode): void {
  if (!VALID_MODES.includes(mode)) return;

  const run = () => {
    modeStore.set(mode);
    document.documentElement.dataset.mode = mode;
    const url = new URL(window.location.href);
    const pathSegment = url.pathname.split('/').filter(Boolean)[0] ?? '';
    if (VALID_MODES.includes(pathSegment as Mode)) {
      // On a path-based mode page — update the path instead of query param
      url.pathname = `/${mode}`;
      url.searchParams.delete('mode');
    } else {
      url.searchParams.set('mode', mode);
    }
    window.history.replaceState({}, '', url.toString());
  };

  if ('startViewTransition' in document) {
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
const MODE_AWARE_PATHS = ['/en/cv', '/cv'];

// Pagine che dichiarano il proprio mode lato server (data-mode SSR nel
// markup): il mode è del contenuto (primaryMode del case study), non
// dell'utente — initMode non deve né cancellarlo né sovrascriverlo.
const SSR_MODE_PATHS = ['/work', '/en/work'];

export function initMode(): void {
  if (typeof window === 'undefined') return;
  // La route è la source of truth: se siamo su /tech, usiamo 'tech'
  // indipendentemente da cosa c'è in localStorage.
  // Evita il flash di colore sbagliato quando localStorage ha un mode diverso.
  const pathname = window.location.pathname;
  const pathSegment = pathname.split('/').filter(Boolean)[0] ?? '';
  const routeMode = VALID_MODES.includes(pathSegment as Mode) ? (pathSegment as Mode) : null;

  if (routeMode) {
    // Siamo su una pagina di mode (/tech, /creative, ecc.) — applica
    document.documentElement.dataset.mode = routeMode;
    modeStore.set(routeMode);
  } else if (MODE_AWARE_PATHS.some(p => pathname.startsWith(p))) {
    // Pagina mode-aware senza route di mode (/en/cv) — usa localStorage o default 'tech'
    const stored = modeStore.get();
    const mode = VALID_MODES.includes(stored) ? stored : 'tech';
    document.documentElement.dataset.mode = mode;
  } else if (SSR_MODE_PATHS.some(p => pathname.startsWith(p))) {
    // Case study (/work/*) — il data-mode SSR del progetto resta com'è
  } else {
    // Home (/) o altre route non-mode — torna a neutro
    delete document.documentElement.dataset.mode;
  }
}

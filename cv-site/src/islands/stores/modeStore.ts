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

export function initMode(): void {
  if (typeof window === 'undefined') return;
  // La route è la source of truth: se siamo su /tech, usiamo 'tech'
  // indipendentemente da cosa c'è in localStorage.
  // Evita il flash di colore sbagliato quando localStorage ha un mode diverso.
  const pathSegment = window.location.pathname.split('/').filter(Boolean)[0] ?? '';
  const routeMode = VALID_MODES.includes(pathSegment as Mode) ? (pathSegment as Mode) : null;
  const mode = routeMode ?? modeStore.get();
  document.documentElement.dataset.mode = mode;
  if (routeMode) modeStore.set(routeMode);
}

import { persistentAtom } from '@nanostores/persistent';

export type Mode = 'tech' | 'creative' | 'human';

const VALID_MODES: Mode[] = ['tech', 'creative', 'human'];

function getInitialMode(): Mode {
  if (typeof window !== 'undefined') {
    const urlParam = new URLSearchParams(window.location.search).get('mode');
    if (urlParam && VALID_MODES.includes(urlParam as Mode)) {
      return urlParam as Mode;
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
    url.searchParams.set('mode', mode);
    window.history.replaceState({}, '', url.toString());
  };

  if ('startViewTransition' in document) {
    document.startViewTransition(run);
  } else {
    run();
  }
}

export function initMode(): void {
  if (typeof window === 'undefined') return;
  const stored = modeStore.get();
  document.documentElement.dataset.mode = stored;
}

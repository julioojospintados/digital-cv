// ScreenOrientation.lock() — API reale (Screen Orientation API), ma con
// "limited availability": non è nei lib DOM di TypeScript perché Safari non
// la implementa. Il codice che la usa (cv-init.ts, SkillForceGraph.lit.ts)
// fa già feature-detection prima di chiamarla, quindi la dichiarazione qui
// descrive il runtime senza introdurre rischi: dove `lock` non esiste il
// ramo non viene eseguito, e dove esiste può comunque rifiutare la Promise
// (già gestito con .catch()).
//
// Alternativa scartata: `(screen.orientation as any).lock` nei tre punti
// d'uso — sposta il problema invece di descriverlo, e disattiva il
// type-check anche sugli argomenti.
type OrientationLockType =
  | "any"
  | "natural"
  | "landscape"
  | "portrait"
  | "portrait-primary"
  | "portrait-secondary"
  | "landscape-primary"
  | "landscape-secondary";

interface ScreenOrientation {
  lock?: (orientation: OrientationLockType) => Promise<void>;
  unlock?: () => void;
}

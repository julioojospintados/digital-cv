/**
 * Oggetto knolling di un case study — scelto per **slug**, non per mode.
 *
 * Prima la scelta passava da `primaryMode` con una mappa di 3 voci
 * (tech→laptop, creative→camera, human→plant), duplicata in tre file. Ma i
 * quattro case study sono tech, tech, creative, creative: laptop e camera
 * uscivano due volte ciascuno e `plant` non compariva mai, perché nessun
 * case study è `human`. Quattro schede, due immagini.
 *
 * Legare l'oggetto allo slug non serve solo a variare: ogni oggetto dice
 * qualcosa del progetto, che è il punto del knolling — sul tavolo ci sono le
 * cose vere, non un colore di categoria.
 *
 * `compass.webp` non è disponibile per un case study, per quanto calzi a
 * trip-runway: è già il viaggiatore che percorre la strada del processo in
 * work/[slug].astro. Usarlo anche come oggetto del progetto farebbe
 * collidere due metafore nella stessa pagina.
 */
export const WORK_KNOLL_ICON: Record<string, string> = {
  "digital-cv": "laptop.webp", // il lavoro digitale, il codice
  "trip-runway": "multitool.webp", // uno script personale diventato prodotto
  "product-discovery": "flashlight.webp", // illuminare problemi complessi
  "music-agency": "megaphone.webp", // palco, voce, filiera
};

/** Case study senza voce in mappa: non resta senza oggetto sul tavolo. */
export const WORK_KNOLL_FALLBACK = "laptop.webp";

/**
 * Rapporto larghezza/altezza **reale** di ogni file — ogni oggetto ha un crop
 * diverso e serve a riservare lo spazio giusto (CLS) prima che l'immagine
 * carichi. Misurati dagli header WebP, non a occhio: `flashlight` è largo più
 * del triplo della sua altezza, `megaphone` è quasi quadrato.
 */
export const WORK_KNOLL_RATIO: Record<string, string> = {
  "camera.webp": "327 / 221",
  "chess.webp": "177 / 274",
  "compass.webp": "208 / 341",
  "flashlight.webp": "1187 / 350",
  "laptop.webp": "524 / 476",
  "megaphone.webp": "389 / 393",
  "multitool.webp": "226 / 293",
  "plant.webp": "226 / 250",
};

export function workKnollIcon(slug?: string): string {
  return (slug && WORK_KNOLL_ICON[slug]) || WORK_KNOLL_FALLBACK;
}

export function workKnollRatio(iconFile: string): string {
  return WORK_KNOLL_RATIO[iconFile] ?? WORK_KNOLL_RATIO[WORK_KNOLL_FALLBACK];
}

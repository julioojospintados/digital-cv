/**
 * lab-copy.ts — la voce della home e della pagina CV, nelle due lingue.
 *
 * Nasce per smettere di moltiplicare le copie: gli stessi paragrafi erano
 * ricopiati a mano in più pagine, e un ritocco alla bio andava replicato in
 * ogni punto. Da qui li prendono la home ("/") e le pagine per lente, sia
 * italiane sia inglesi.
 *
 * I testi inglesi NON sono nuovi: sono quelli della home EN storica (oggi
 * sotto /old-version/en), spostati qui perché ora li serve la stessa pagina
 * che serve l'italiano.
 *
 * ⚠️ Sono VOCE PERSONALE, non descrizioni di prodotto. Non riscriverli senza
 * chiedere: una riscrittura silenziosa è una perdita di identità, e una
 * traduzione "corretta ma piatta" lo è quanto un errore.
 */

import type { Locale, Mode } from "./cv-i18n";

/**
 * Ciò che NON cambia con la lingua: l'oggetto della lente e le sue misure.
 * Tenuto separato dai testi di proposito — così è strutturalmente impossibile
 * che italiano e inglese finiscano con due oggetti diversi o due proporzioni
 * diverse, che è esattamente il tipo di divergenza che questo repo ha già
 * pagato più volte (vedi AGENTS.md § "IT ↔ EN parity").
 */
export interface ProfileObject {
  /** Sigla grande, decorativa (aria-hidden). */
  initial: string;
  /** Oggetto knolling associato alla lente. */
  object: string;
  /**
   * Proporzioni native del webp — lette dagli header dei file, non stimate a
   * occhio. Servono a occupare il posto giusto prima che l'immagine arrivi.
   * Attenzione: bussola e scacchi sono **verticali** (208×341, 177×274),
   * quindi a parità di larghezza sono alti il doppio della macchina
   * fotografica — per questo il CSS li dimensiona per altezza e non per
   * larghezza, altrimenti l'intestazione si allungherebbe fino a spingere il
   * contenuto sotto la piega.
   */
  ratio: string;
}

export const PROFILE_OBJECT: Record<Mode, ProfileObject> = {
  creative: { initial: "WD", object: "camera", ratio: "327 / 221" },
  tech: { initial: "SD", object: "laptop", ratio: "524 / 476" },
  human: { initial: "AI", object: "compass", ratio: "208 / 341" },
};

/** Ciò che cambia con la lingua. */
export interface ProfileText {
  /** Titolo su due righe — la frase che porta il carattere della lente. */
  title: [string, string];
  /** Il paragrafo lungo. Non va nella fascia dei primi 7 secondi. */
  desc: string;
}

export const PROFILE_TEXT: Record<Locale, Record<Mode, ProfileText>> = {
  it: {
    creative: {
      title: ["Brand,", "estetica e interfacce."],
      desc: `Di natura cerco di risolvere problemi: che siano di un amico, di un passante per strada o di un collega. Questa "deformazione" professionale mi ha portato ad appassionarmi alla UX/UI e a unirla all'estetica. Formazione IBM e SkillUp, con un interesse attento a come la Generative AI sta ridisegnando il settore.`,
    },
    tech: {
      title: ["Automazione,", "AI e architetture."],
      desc: `Sviluppo da anni per il mondo enterprise, muovendomi tra TypeScript, Angular e React. Sono passato da team di 30 persone a progetti in solitaria potenziati dall'AI, dove creo workflow e integrazioni MCP su misura. Tutta la lista di tecnologie e sigle la trovi cliccando qua sotto.`,
    },
    human: {
      title: ["Storytelling", "e strategia."],
      desc: `L'AI esegue, calcola e velocizza, ma non comprende intrinsecamente le persone. Unisco la progettazione di workflow automatizzati alla sensibilità narrativa che mi arriva dal marketing, dalla scrittura e dal teatro. L'AI fa davvero un gran lavoro, ma senza un pilota potrebbe non farti mai arrivare a Itaca.`,
    },
  },
  en: {
    creative: {
      title: ["Brand,", "aesthetics and interfaces."],
      desc: "I'm a problem solver by nature—whether it's helping a friend, a stranger on the street, or a colleague. It's almost a force of habit, and it's what naturally led me to UX/UI design and blending function with aesthetics. IBM and SkillUp certified, with a keen eye on how Generative AI is reshaping the industry.",
    },
    tech: {
      title: ["Automation,", "AI and architectures."],
      desc: "I've spent years building for the enterprise world, moving between TypeScript, Angular and React. I went from 30-person teams to solo, AI-powered projects, where I build custom workflows and MCP integrations. Find the full list of technologies and acronyms by clicking below.",
    },
    human: {
      title: ["Storytelling", "and strategy."],
      desc: "AI executes, calculates and speeds things up, but it doesn't intrinsically understand people. I combine automated workflow design with a narrative sensibility shaped by marketing, writing and theatre. AI does a great job, but without a pilot at the helm, it might never get you to Ithaca.",
    },
  },
};

/** Comodità: oggetto e testo della lente insieme, nella lingua giusta. */
export function profileCopy(mode: Mode, locale: Locale) {
  return { ...PROFILE_OBJECT[mode], ...PROFILE_TEXT[locale][mode] };
}

/**
 * Le tre card di "Chi sono".
 *
 * La bio non e' piu' un paragrafo: e' tagliata in tre pezzi ai confini di
 * frase, uno per card. Il taglio e' **senza perdite** — i tre `text` riuniti
 * danno esattamente il paragrafo di prima, parola per parola. Non e' una
 * promessa: `ABOUT_TEXT.desc` qui sotto e' *calcolato* riunendoli, quindi non
 * esiste un modo di farli divergere. Se un domani si riscrive un pezzo, il
 * paragrafo lungo cambia con lui.
 *
 * Perche' tre card e non un blocco: su schermo stretto il paragrafo intero
 * faceva un pannello da ~930px in una finestra da 667, e per questo la
 * sezione era spenta sotto i 56rem. Chiuse le card misurano ~170px.
 *
 * ⚠️ Testo di VOCE, come il resto di questo file: non riscriverlo senza
 * chiedere. Qui in piu' c'e' il vincolo del taglio — vale per l'italiano e
 * per l'inglese insieme, o le due lingue smettono di dire la stessa cosa.
 */

/**
 * La foto di ogni card. Fuori dalle tabelle per lingua di proposito, come
 * PROFILE_OBJECT: cosi' e' strutturalmente impossibile che l'italiano e
 * l'inglese finiscano con due foto diverse. Percorsi da `public/`.
 */
export const ABOUT_CARD_PHOTOS = [
  "/photos/trip/cave.webp",
  "/photos/belongings/square-festival.webp",
  "/photos/belongings/libreria.webp",
] as const;

/**
 * La miniatura da 640px al posto della sorgente 1500x2000.
 *
 * Qui dentro la foto si vede al massimo a 576px — la modale di lettura e'
 * larga 36rem — quindi l'originale sarebbe da tre a cinque volte i pixel
 * necessari: `cave.webp` da solo pesa 599 KB contro i circa 60 della sua
 * miniatura. Le miniature le genera `scripts/gen-photo-thumbs.mjs`.
 *
 * Il percorso pieno resta la fonte in ABOUT_CARD_PHOTOS: e' quello che
 * identifica la foto, e da li' si ricava la variante — non il contrario.
 */
export const photoThumb = (path: string): string => path.replace(/\/([^/]+)$/, "/thumb/$1");

export interface AboutCard {
  /** L'etichetta sul bottone chiuso. */
  label: string;
  /** Un pezzo VERBATIM della bio, tagliato a fine frase. */
  text: string;
  /** La foto descritta a chi non la vede. Cambia con la lingua, la foto no. */
  alt: string;
}

export const ABOUT_CARDS: Record<Locale, readonly AboutCard[]> = {
  it: [
    {
      label: "Da dove vengo",
      text: `Tantissimi lavori diversi alle spalle, alcune piante in casa e un passaporto ben timbrato. Ho vissuto in tre Stati diversi prima di tornare in Italia, ma sono riuscito a fare il bagno nei tre oceani balneabili, gli altri due sono troppo freddi.`,
      alt: "L'imbocco di una grotta, con una tenda montata sotto.",
    },
    {
      label: "Cosa mi porto dietro",
      text: `Improvvisatore di battute e in viaggio, ho messo radici nel digitale, mantenendo una forte sensibilità, caratteristica che le persone mi fanno notare spesso, verso gli altri e me stesso, strizzando l'occhiolino alla poesia e alla fotografia.`,
      alt: "Con il microfono in mano davanti a un piccolo pubblico.",
    },
    {
      label: "Come ragiono",
      text: `Attualmente cerco di unire i puntini nel mondo UX/UI design, sviluppo software e strategie digitali, applicando la stessa logica che serve negli scacchi. Gioco cercando la mossa che anticipa.`,
      alt: "Una scala a chiocciola vista dall'alto, dentro una libreria.",
    },
  ],
  en: [
    {
      label: "Where I come from",
      text: "Countless different jobs behind me, a few plants at home, and a well-stamped passport. I lived in three different countries before moving back to Italy, but I did manage to swim in all three swimmable oceans — the other two are just too cold.",
      alt: "The mouth of a cave, with a tent pitched under it.",
    },
    {
      label: "What I carry with me",
      text: "An improviser of jokes and journeys, I've put down roots in the digital world while keeping a strong sensitivity — people tell me about it often — toward others and myself, with a wink toward poetry and photography.",
      alt: "Holding a microphone in front of a small audience.",
    },
    {
      label: "How I think",
      text: "These days I'm trying to connect the dots across UX/UI design, software development, and digital strategy, applying the same logic chess requires. I play looking for the move that sees ahead.",
      alt: "A spiral staircase seen from above, inside a bookshop.",
    },
  ],
};

/** I pezzi riuniti: il paragrafo intero, senza poterlo far divergere. */
const joinCards = (l: Locale): string => ABOUT_CARDS[l].map((c) => c.text).join(" ");

/** Oggetto e misure della sezione "Chi sono" — la persona, non la lente. */
export const ABOUT_OBJECT = { object: "plant", ratio: "226 / 250" } as const;

export interface AboutText {
  eyebrow: string;
  title: string;
  desc: string;
  chips: readonly string[];
}

export const ABOUT_TEXT: Record<Locale, AboutText> = {
  it: {
    eyebrow: "Chi sono",
    title: "Coltivatore di empatia e battute in tasca.",
    desc: joinCards("it"),
    chips: [
      "Film a San Francisco",
      "Improvvisazione teatrale",
      "Poesia",
      "Fotografia",
      "Scacchi",
      "Piante d'appartamento",
    ],
  },
  en: {
    eyebrow: "About me",
    title: "Cultivating empathy, with jokes in my pocket.",
    desc: joinCards("en"),
    chips: [
      "Film in San Francisco",
      "Improv theatre",
      "Poetry",
      "Photography",
      "Chess",
      "House plants",
    ],
  },
};

/** La frase dell'ingresso, in cima alla home e nella barra della pagina CV. */
export const TAGLINE: Record<Locale, string> = {
  it: "Se esiste una verità assoluta, dev'essere molto annoiata.",
  en: "If there is an absolute truth, it must be very bored.",
};

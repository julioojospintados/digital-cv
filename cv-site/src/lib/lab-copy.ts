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
    desc: `Tantissimi lavori diversi alle spalle, alcune piante in casa e un passaporto ben timbrato. Ho vissuto in tre Stati diversi prima di tornare in Italia, ma sono riuscito a fare il bagno nei tre oceani balneabili, gli altri due sono troppo freddi. Improvvisatore di battute e in viaggio, ho messo radici nel digitale, mantenendo una forte sensibilità, caratteristica che le persone mi fanno notare spesso, verso gli altri e me stesso, strizzando l'occhiolino alla poesia e alla fotografia. Attualmente cerco di unire i puntini nel mondo UX/UI design, sviluppo software e strategie digitali, applicando la stessa logica che serve negli scacchi. Gioco cercando la mossa che anticipa.`,
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
    desc: "Countless different jobs behind me, a few plants at home, and a well-stamped passport. I lived in three different countries before moving back to Italy, but I did manage to swim in all three swimmable oceans — the other two are just too cold. An improviser of jokes and journeys, I've put down roots in the digital world while keeping a strong sensitivity — people tell me about it often — toward others and myself, with a wink toward poetry and photography. These days I'm trying to connect the dots across UX/UI design, software development, and digital strategy, applying the same logic chess requires. I play looking for the move that sees ahead.",
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

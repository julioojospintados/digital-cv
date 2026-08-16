/**
 * lab-copy.ts — la voce della home, resa riutilizzabile.
 *
 * Questi testi vivono oggi in `pages/index.astro` (§ .profile-section e
 * § .profile-section--about) e sono già stati ricopiati a mano dentro
 * `pages/lab/home.astro`. Questa è la terza copia, ed è una copia di troppo:
 * il motivo per cui esiste questo file è smettere di moltiplicarle.
 *
 * ⚠️ Fonte di verità provvisoria. Quando il nuovo layout esce dal /lab e
 * arriva in produzione, `index.astro` e `lab/home.astro` devono importare da
 * qui (e la variante EN va aggiunta accanto, come per ogni altro testo —
 * vedi AGENTS.md § "IT ↔ EN parity"). Finché restano tre copie, un ritocco
 * alla bio va replicato a mano in tre punti: è esattamente il tipo di drift
 * che AGENTS.md chiede di evitare.
 *
 * I testi sono VERBATIM da index.astro. Non riscriverli qui: sono voce
 * personale, e una riscrittura silenziosa è una perdita di identità.
 */

import type { Mode } from "./cv-i18n";

/**
 * L'ordine (e l'insieme) in cui le lenti si presentano **dentro /lab**, e
 * solo lì.
 *
 * Non è `MODES` di `cv-i18n.ts`: quello serve il sito in produzione, dove
 * restano tutte e quattro le modalità (creative → tech → management →
 * human) e non va toccato finché il nuovo layout è ancora una prova.
 *
 * Qui invece "Project Manager" è stata tolta di proposito (2026-08-16): il
 * banco di prova valuta tre professioni, non quattro. I dati restano intatti
 * — `cv.ts` e `PROFILE_COPY` qui sotto tengono ancora la voce "management" —
 * semplicemente non genera più una rotta `/lab/management` né compare nella
 * tendina o fra le sezioni di `/lab/home`. `LAB_MODES` è quindi un
 * sottoinsieme proprio di `MODES`, non più lo stesso insieme in un altro
 * ordine — vedi il test aggiornato in `lab-copy.test.ts`.
 */
export const LAB_MODES: readonly Mode[] = ["creative", "tech", "human"] as const;

export interface ProfileCopy {
  /** Titolo su due righe — la frase che porta il carattere della lente. */
  title: [string, string];
  /** Il paragrafo lungo. Non va nella fascia dei primi 7 secondi. */
  desc: string;
  /** Sigla grande, decorativa (aria-hidden). */
  initial: string;
  /** Oggetto knolling associato alla lente. */
  object: string;
  /**
   * Proporzioni native del webp — lette dagli header dei file, non stimate
   * a occhio. Servono a occupare il posto giusto prima che l'immagine
   * arrivi. Attenzione: scacchi e bussola sono **verticali** (177×274,
   * 208×341), quindi a parità di larghezza sono alti il doppio della
   * macchina fotografica — per questo il CSS li dimensiona per altezza e
   * non per larghezza, altrimenti l'intestazione di /management e /human
   * si allungherebbe fino a spingere il contenuto sotto la piega.
   */
  ratio: string;
}

export const PROFILE_COPY: Record<Mode, ProfileCopy> = {
  creative: {
    title: ["Brand,", "estetica e interfacce."],
    desc: `Di natura cerco di risolvere problemi: che siano di un amico, di un passante per strada o di un collega. Questa "deformazione" professionale mi ha portato ad appassionarmi alla UX/UI e a unirla all'estetica. Formazione IBM e SkillUp, con un interesse attento a come la Generative AI sta ridisegnando il settore.`,
    initial: "WD",
    object: "camera",
    ratio: "327 / 221",
  },
  tech: {
    title: ["Automazione,", "AI e architetture."],
    desc: `Sviluppo da anni per il mondo enterprise, muovendomi tra TypeScript, Angular e React. Sono passato da team di 30 persone a progetti in solitaria potenziati dall'AI, dove creo workflow e integrazioni MCP su misura. Tutta la lista di tecnologie e sigle la trovi cliccando qua sotto.`,
    initial: "SD",
    object: "laptop",
    ratio: "524 / 476",
  },
  management: {
    title: ["Agile snello", "e sprint brevi."],
    desc: `Opero come partner tecnico per aziende e progetti digitali. Lavoro con metodo Agile, concentrandomi sul risolvere i problemi reali e nel fare da ponte tra i diversi ruoli del team. Il mio obiettivo è semplice: trovare soluzioni efficaci e rendere le persone autonome, senza creare dipendenze. Quanto è bello facilitare il lavoro alle persone?`,
    initial: "PM",
    object: "chess",
    ratio: "177 / 274",
  },
  human: {
    title: ["Storytelling", "e strategia."],
    desc: `L'AI esegue, calcola e velocizza, ma non comprende intrinsecamente le persone. Unisco la progettazione di workflow automatizzati alla sensibilità narrativa che mi arriva dal marketing, dalla scrittura e dal teatro. L'AI fa davvero un gran lavoro, ma senza un pilota potrebbe non farti mai arrivare a Itaca.`,
    initial: "AI",
    object: "compass",
    ratio: "208 / 341",
  },
};

/** § .profile-section--about di index.astro — la persona, non la lente. */
export const ABOUT_COPY = {
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
  object: "plant",
  ratio: "226 / 250",
} as const;

/** La frase dell'ingresso, da lab/home.astro. */
export const TAGLINE = "Se esiste una verità assoluta, dev'essere molto annoiata.";

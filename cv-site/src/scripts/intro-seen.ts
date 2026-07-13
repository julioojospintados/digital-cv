// Flag "rituale GO già visto" — condiviso tra index-init.ts (lo legge e lo
// setta all'arrivo in home), GoLogo.lit.ts (lo setta PRIMA di navigare: un
// click sul logo è un ritorno, mai un primo atterraggio, anche se la home
// non è ancora stata visitata in questa sessione) e lo script inline
// anti-flash in index.astro / en/index.astro (che duplica la chiave come
// literal perché gli script is:inline non possono importare moduli — se
// cambia qui, va cambiata anche lì).
export const INTRO_SEEN_KEY = "go-intro-seen";

// sessionStorage sopravvive alla navigazione ma si azzera a nuova tab/
// sessione: distingue "primo arrivo" da "sto tornando indietro". Storage
// bloccato (privacy mode/quota) → tratta sempre come prima visita, mai il
// contrario: meglio un'intro di troppo che sparire il branding.
export function isIntroSeen(): boolean {
  try {
    return sessionStorage.getItem(INTRO_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

export function markIntroSeen(): void {
  try {
    sessionStorage.setItem(INTRO_SEEN_KEY, "1");
  } catch {
    // Storage bloccato: il flag non persiste, l'intro rigiocherà — accettabile.
  }
}

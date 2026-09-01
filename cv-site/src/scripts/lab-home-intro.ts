/**
 * lab-home-intro.ts — la comparsa all'atterraggio su /lab/home.
 *
 * È la coreografia d'ingresso della home vera (index-init.ts, step 4→10),
 * riportata sulle classi di questa pagina: G e O che atterrano dall'alto con
 * un punch, il lampo bianco sulle due iniziali, il resto del nome che risale
 * lettera per lettera, tagline e riga dei ruoli, e infine gli otto oggetti che
 * si posano uno dopo l'altro in diagonale. Durate, stagger e curve sono le
 * stesse — se lì cambiano, vanno cambiate anche qui.
 *
 * Tre cose sono diverse, e sono differenze della pagina, non della regia:
 *
 *  1. **Niente preloader GO.** Questa prova nasce senza (vedi l'intestazione
 *     di home.astro): non c'è un G e un O a schermo da cui il nome si forma,
 *     quindi gli step 1-3 della home vera qui non esistono e la timeline parte
 *     direttamente dall'atterraggio delle due lettere.
 *  2. **Niente card mode.** Sono proprio ciò che questa prova toglie: al loro
 *     posto la timeline rivela l'invito a scorrere, che qui è l'unico invito.
 *  3. **Il salto degli oggetti sta nel CSS** (@keyframes lhLand in
 *     lab-home.css) e non in GSAP, esattamente come nella home vera: `transform`
 *     su .lh-obj è già occupato dalle due parallassi, e un tween GSAP ci
 *     scriverebbe sopra uno stile inline che le spegne.
 *
 * Sullo stato iniziale vale la regola già scritta in lab-home-scroll.ts: **a
 * nascondere è GSAP, non il CSS**. Se questo script non parte, l'ingresso
 * resta visibile e fermo invece di restare vuoto.
 */

import { gsap } from "gsap";

/**
 * Chiave sua, **non** quella della home vera (go-intro-seen).
 *
 * Condividerla sembrava giusto — è lo stesso rituale, e una volta a sessione
 * basta — ma in pratica rendeva la coreografia invisibile proprio nel percorso
 * che conta: si arriva qui dalla home, la home ha appena marcato il flag, e
 * l'ingresso si risolve in venti millesimi. Misurato: dal chip di sviluppo non
 * si vedeva mai un'animazione.
 *
 * Sono due pagine e due composizioni diverse: chi ha visto entrare le quattro
 * card non ha visto entrare questa. Il "una volta a sessione" resta, ma
 * ciascuna se lo conta per conto proprio.
 */
const LAB_INTRO_KEY = "lab-intro-seen";

/**
 * `?intro` nell'indirizzo forza la versione piena, ignorando il flag: è quello
 * che usa il chip di sviluppo sulla home, che esiste apposta per venire a
 * guardare questa prova. Senza, ogni ricaricamento avrebbe richiesto una
 * scheda nuova per rivedere ciò che si sta ancora disegnando.
 */
function shouldPlayInFull(): boolean {
  if (new URLSearchParams(window.location.search).has("intro")) return true;
  try {
    return sessionStorage.getItem(LAB_INTRO_KEY) !== "1";
  } catch {
    // Storage bloccato: si rigioca. Meglio un'intro di troppo che nessuna.
    return true;
  }
}

export function initLabHomeIntro(): void {
  const name = document.querySelector<HTMLElement>(".lh-name");
  if (!name) return;

  // Cambio lingua: questa pagina è quella di prima, tradotta. L'attributo lo
  // mette lo script inline di HomeEntryPage.astro, che è il solo posto in cui
  // si può decidere prima del primo disegno — lì c'è anche il perché e il
  // numero che l'ha motivato. Qui la conseguenza: non si nasconde niente e non
  // si anima niente, la pagina è già tutta a schermo dal primo fotogramma.
  //
  // L'unica cosa che si muove in un cambio lingua è il cursore
  // dell'interruttore, e quella la disegna la transizione fra i due documenti
  // (Layout.astro, § "Il cambio lingua attraversa invece di tagliare").
  //
  // `data-lh-armed` non è stato messo, quindi non c'è da toglierlo; e le
  // lettere non vengono divise in .name-char, che è corretto — quella
  // divisione serve solo a questa coreografia.
  if (document.documentElement.hasAttribute("data-lh-nointro")) return;

  const introAlreadySeen = !shouldPlayInFull();
  try {
    sessionStorage.setItem(LAB_INTRO_KEY, "1");
  } catch {
    // Storage bloccato: il flag non persiste, l'intro rigiocherà — accettabile.
  }

  // A movimento ridotto non si salta la coreografia, si comprime: gli stati
  // si risolvono comunque, in una manciata di fotogrammi. Stessa tecnica di
  // index-init.ts, ma su questa timeline soltanto e non su gsap.globalTimeline
  // — lì travolgerebbe anche le animazioni allo scroll di lab-home-scroll.ts,
  // che il movimento ridotto se lo gestiscono già da sole.
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const compress = reduced || introAlreadySeen;

  // L'atterraggio degli oggetti è un'animazione CSS, invisibile al clock di
  // GSAP: per comprimerla si accorcia la sua durata, non il tempo della
  // timeline. Stesso problema, stessa cura della home vera.
  if (compress) {
    document.documentElement.style.setProperty("--lh-land-duration", "20ms");
  }
  const landDelayStep = compress ? 2 : 45; // ms fra un oggetto e il successivo

  // ── Il nome, lettera per lettera ────────────────────────────────────────
  // Le parole arrivano già divise dal markup (.name-word). Qui si scende al
  // singolo carattere, perché G e O hanno un'animazione loro.
  let firstGChar: HTMLElement | null = null;
  let firstOChar: HTMLElement | null = null;

  name.querySelectorAll<HTMLElement>(".name-word").forEach((word, wi) => {
    const text = word.textContent ?? "";
    word.textContent = "";
    text.split("").forEach((char, ci) => {
      const s = document.createElement("span");
      s.className = "name-char";
      s.textContent = char === " " ? " " : char;
      if (wi === 0 && ci === 0) firstGChar = s;
      if (wi === 1 && ci === 0) firstOChar = s;
      word.appendChild(s);
    });
  });

  const allChars = Array.from(name.querySelectorAll<HTMLElement>(".name-char"));
  const goChars: HTMLElement[] = [];
  if (firstGChar) goChars.push(firstGChar);
  if (firstOChar) goChars.push(firstOChar);
  const otherChars = allChars.filter((c) => c !== firstGChar && c !== firstOChar);

  // ── Il lampo su G e O ───────────────────────────────────────────────────
  // Due stati con la stessa forma — due bagliori per parte — perché GSAP
  // interpola text-shadow numero per numero: liste di lunghezza diversa si
  // interpolano male.
  // C'era un terzo strato in coda a entrambi, l'alone scuro del nome letto da
  // --lh-name-halo, per non lasciare G e O senza ombra a lampo finito. Quel
  // token non esiste più (vedi .lh-name in lab-home.css, § "Niente ombra
  // dietro al nome"): a lampo spento il nome torna semplicemente senza ombra,
  // come tutte le altre lettere.
  const glowOff = "0 0 0 rgba(255, 255, 255, 0), 0 0 0 rgba(255, 255, 255, 0)";
  const glowOn = "0 0 28px rgba(255, 255, 255, 0.65), 0 0 12px rgba(255, 255, 255, 0.4)";

  // ── Stato iniziale ──────────────────────────────────────────────────────
  const copyGroup = [".lh-tagline", ".lh-cred", ".lh-bar"];
  const cue = document.querySelector<HTMLElement>(".lh-scroll");
  // `:not([data-vt-landing])` — tornando da una lente, uno di questi oggetti
  // non sta entrando: sta ATTERRANDO, portato dalla transizione di pagina.
  // Nasconderlo per rigiocargli l'ingresso addosso significherebbe spegnere a
  // meta' volo la cosa che si sta guardando. Chi lo marca e' lo script inline
  // in HomeEntryPage.astro, prima del primo disegno.
  const objects = Array.from(
    document.querySelectorAll<HTMLElement>(".lh-obj:not([data-vt-landing])"),
  );

  gsap.set(goChars, { opacity: 0, scale: 1.8, y: -20 });
  gsap.set(otherChars, { opacity: 0, y: 18 });
  gsap.set(copyGroup, { opacity: 0, y: 10 });
  if (cue) gsap.set(cue, { opacity: 0 });
  // Gli oggetti li nasconde @keyframes lhLand dal suo primo fotogramma, ma
  // l'animazione parte solo quando la classe arriva: senza questo, fino a lì
  // resterebbero a schermo e poi sparirebbero per riapparire.
  gsap.set(objects, { opacity: 0 });

  // Da qui in poi a nascondere è GSAP, con stili inline che battono comunque
  // il foglio di stile: la rete di sicurezza messa in home.astro ha finito il
  // suo turno e va tolta, o resterebbe a nascondere il nome anche dopo che la
  // timeline l'ha rivelato.
  document.documentElement.removeAttribute("data-lh-armed");

  const tl = gsap.timeline();
  if (compress) tl.timeScale(60);

  // 1. G e O atterrano — è il punch che nella home vera raccoglie le due
  //    lettere del preloader. Qui non c'è niente da raccogliere, ma il gesto
  //    resta: sono le iniziali, arrivano prima e da più in alto.
  tl.fromTo(
    goChars,
    { opacity: 0, scale: 1.8, y: -20 },
    { opacity: 1, scale: 1, y: 0, duration: 0.45, stagger: 0.12, ease: "back.out(1.7)" },
  );

  // 2. Il lampo, e il suo rientro.
  tl.fromTo(
    goChars,
    { textShadow: glowOff },
    { textShadow: glowOn, duration: 0.2, ease: "power2.out" },
    "-=0.1",
  );
  tl.to(goChars, { textShadow: glowOff, duration: 0.45, ease: "power2.in" });
  // Tolto lo stile inline, G e O tornano a quello che dice il foglio di stile.
  tl.set(goChars, { clearProps: "textShadow" });

  // 3. "iulio" e "cchipinti" — stagger a 30ms, il pavimento della regola
  //    Emil Kowalski: la scia si legge, senza far aspettare.
  tl.to(
    otherChars,
    {
      opacity: 1,
      y: 0,
      duration: 0.45,
      stagger: { each: 0.03, from: "start" },
      ease: "power3.out",
    },
    "-=0.35",
  );

  // 4. Tagline, ruoli e barra in alto — sovrapposti alla coda del nome, non
  //    in fila: è il taglio già fatto sulla home vera per accorciare l'attesa
  //    prima che la pagina sia usabile.
  tl.to(copyGroup, { opacity: 1, y: 0, duration: 0.35, ease: "power3.out" }, "-=0.25");

  // 5. Gli oggetti — ordine spaziale: prima i più in alto, a parità i più a
  //    sinistra (peso 0.7 la Y, 0.3 la X). Ne esce un'onda diagonale, la
  //    composizione che si assembla invece di comparire tutta insieme.
  //    offsetTop/offsetLeft e non getBoundingClientRect: i primi ignorano le
  //    trasformazioni, e questi oggetti ne hanno addosso due di parallasse.
  tl.call(
    () => {
      objects
        .slice()
        .sort(
          (a, b) =>
            a.offsetTop * 0.7 + a.offsetLeft * 0.3 - (b.offsetTop * 0.7 + b.offsetLeft * 0.3),
        )
        .forEach((obj, i) => {
          obj.style.setProperty("--lh-land-delay", `${i * landDelayStep}ms`);
          obj.classList.add("do-enter");
        });
    },
    undefined,
    "-=0.55",
  );

  // 6. L'invito a scorrere, per ultimo: nella home vera qui ci sono le quattro
  //    card, e la cue arriva subito dopo come chiusura della composizione.
  //    Qui le card non ci sono — l'invito a scorrere è tutto ciò che resta, ed
  //    è anche l'unica cosa da fare in questa pagina.
  if (cue) {
    tl.to(cue, { opacity: 1, duration: 0.35, ease: "power2.out" }, "-=0.1");
  }
}

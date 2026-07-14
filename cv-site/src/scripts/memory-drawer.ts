import { gsap } from "gsap";
import { Flip } from "gsap/Flip";

gsap.registerPlugin(Flip);

// ── Memory drawers — bottoni "Fun fact / Cose mie / Viaggio" sotto Chi sono ──
// <dialog> nativo per ogni categoria: showModal()/close() danno gratis focus
// trap, ESC e ::backdrop. Qui: wiring bottone→dialog, scatter d'ingresso in
// stile knolling, lightbox foto (Flip). Lo spread a due pagine di Budapest
// Drift è puro CSS (index-page.css), nessuna interazione da gestire qui.

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isEN = document.documentElement.lang === "en";

document.querySelectorAll<HTMLButtonElement>("[data-drawer-open]").forEach((btn) => {
  const key = btn.dataset.drawerOpen;
  const dialog = document.getElementById(`dialog-${key}`) as HTMLDialogElement | null;
  if (!dialog) return;

  btn.addEventListener("click", () => {
    dialog.showModal();
    document.documentElement.classList.add("dialog-open");
    animateScatterIn(dialog);
  });

  // Il <dialog> aperto vive nel top layer del browser: il cursore custom
  // (div fixed, global.css) resta sempre coperto per specifica, non per un
  // bug di stacking — .dialog-open lo nasconde finché il dialog è aperto
  // (il CSS scoped su .memory-dialog ripristina il cursore nativo).
  dialog.addEventListener("close", () => {
    document.documentElement.classList.remove("dialog-open");
    closeLightbox(dialog, true);
  });

  // Click sul backdrop (::backdrop non è cliccabile via CSS, ma un click che
  // atterra sul <dialog> stesso — fuori dal contenuto interno — sì: il
  // browser considera il backdrop parte dell'elemento dialog).
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) dialog.close();
  });

  dialog.querySelectorAll<HTMLButtonElement>("[data-drawer-close]").forEach((closeBtn) => {
    closeBtn.addEventListener("click", () => dialog.close());
  });

  // Click su una foto → lightbox. L'aria-label ("Espandi la foto"/"Expand
  // photo") è già nel markup statico sul <button> che la avvolge — qui solo
  // il wiring del click, Enter/Spazio sono già nativi su <button>.
  dialog.querySelectorAll<HTMLButtonElement>(".memory-photo-btn").forEach((btn) => {
    const img = btn.querySelector<HTMLImageElement>(".memory-photo");
    if (!img) return;
    btn.addEventListener("click", () => openLightbox(dialog, img));
  });
});

function animateScatterIn(dialog: HTMLDialogElement) {
  const items = dialog.querySelectorAll<HTMLElement>(".memory-photo, .memory-fact");
  if (reduced || items.length === 0) return;

  // Sotto i 40rem lo scatter ruotato affolla la lettura: la CSS azzera il
  // transform a riposo (vedi index-page.css), qui allineiamo il target GSAP
  // altrimenti l'animazione lo ruoterebbe comunque via inline style.
  const isMobile = window.matchMedia("(max-width: 40rem)").matches;

  gsap.fromTo(
    items,
    { opacity: 0, scale: 0.8, y: 24, rotate: 0 },
    {
      opacity: 1,
      scale: 1,
      y: 0,
      rotate: isMobile ? 0 : (_i, target) => target.style.getPropertyValue("--mr") || "0deg",
      duration: 0.5,
      stagger: { each: 0.045, from: "random" },
      ease: "back.out(1.6)",
    },
  );
}

// ── Photo lightbox — la foto si stacca dal tavolo, non un clone ────────────
// Appesa DENTRO il <dialog> aperto (mai a document.body): un <dialog> in
// showModal() vive nel top layer, che dipinge sempre sopra i fixed regolari
// del resto della pagina — un lightbox fuori dal dialog resterebbe coperto.
const lightboxState = new WeakMap<
  HTMLDialogElement,
  { img: HTMLImageElement; parent: HTMLElement; next: ChildNode | null }
>();

function ensureLightbox(dialog: HTMLDialogElement): HTMLDivElement {
  let box = dialog.querySelector<HTMLDivElement>(":scope > .photo-lightbox");
  if (box) return box;

  box = document.createElement("div");
  box.className = "photo-lightbox";
  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "photo-lightbox__close";
  closeBtn.setAttribute("aria-label", isEN ? "Close" : "Chiudi");
  closeBtn.textContent = "✕";
  closeBtn.addEventListener("click", () => closeLightbox(dialog));
  box.appendChild(closeBtn);

  box.addEventListener("click", (e) => {
    if (e.target === box) closeLightbox(dialog);
  });

  dialog.appendChild(box);
  return box;
}

function openLightbox(dialog: HTMLDialogElement, img: HTMLImageElement) {
  if (lightboxState.has(dialog)) return; // già aperta

  const box = ensureLightbox(dialog);
  const parent = img.parentElement!;
  const next = img.nextSibling;
  lightboxState.set(dialog, { img, parent, next });

  // Se l'utente clicca la foto mentre lo scatter d'ingresso (animateScatterIn)
  // sta ancora animando quello stesso <img> (opacity/scale/y/rotate), le due
  // tween GSAP finiscono a scrivere sullo stesso transform nello stesso
  // frame: il risultato è un movimento a scatti, non il Flip che stona da
  // solo. killTweensOf ferma qualunque tween residuo prima di leggere lo
  // stato "First" — la causa più probabile della non-fluidità segnalata.
  gsap.killTweensOf(img);

  // .is-flipping forza transition:none sulla foto (index-page.css): la
  // regola CSS `.memory-photo { transition: transform .25s }` altrimenti
  // rincorre ogni frame che GSAP scrive sull'inline transform durante il
  // Flip, sommando una seconda easing sopra la prima — il movimento
  // "gommoso"/non fluido segnalato era quasi certamente questo, due sistemi
  // di animazione che si contendevano la stessa proprietà nello stesso istante.
  img.classList.add("is-flipping");

  const state = Flip.getState(img);
  box.appendChild(img);
  img.classList.add("is-lightbox-active");
  box.classList.add("is-active");

  // Niente `absolute: true`: non c'è nessun sibling da tenere fermo mentre
  // la foto si sposta, e forzare position:absolute durante il tween per poi
  // farla rientrare nel flex-centering di .photo-lightbox a fine animazione
  // è esattamente ciò che causava lo scatto laterale finale — Flip la
  // rimetteva in flow un istante dopo l'arrivo, il centraggio flex la
  // "correggeva" con un secondo scatto visibile. Senza absolute la foto
  // resta in flow per tutta la durata: il tween anima verso la posizione
  // già corretta, nessuna correzione a posteriori.
  Flip.from(state, {
    duration: reduced ? 0 : 0.55,
    ease: "power3.inOut",
    scale: true,
    onComplete: () => img.classList.remove("is-flipping"),
  });

  img.addEventListener("click", () => closeLightbox(dialog), { once: true });
}

function closeLightbox(dialog: HTMLDialogElement, instant = false) {
  const entry = lightboxState.get(dialog);
  if (!entry) return;
  const { img, parent, next } = entry;
  const box = dialog.querySelector<HTMLDivElement>(":scope > .photo-lightbox");

  gsap.killTweensOf(img);
  img.classList.add("is-flipping");

  const state = Flip.getState(img);
  parent.insertBefore(img, next);
  img.classList.remove("is-lightbox-active");
  box?.classList.remove("is-active");
  lightboxState.delete(dialog);

  Flip.from(state, {
    duration: instant || reduced ? 0 : 0.4,
    ease: "power2.in",
    scale: true,
    onComplete: () => img.classList.remove("is-flipping"),
  });
}

// ESC deve chiudere prima la lightbox (se aperta) e NON anche il <dialog>
// sottostante — cattura in fase di capture, prima che il browser applichi
// il comportamento nativo "ESC chiude il dialog più in alto".
document.addEventListener(
  "keydown",
  (e) => {
    if (e.key !== "Escape") return;
    for (const dialog of document.querySelectorAll<HTMLDialogElement>(".memory-dialog[open]")) {
      if (lightboxState.has(dialog)) {
        e.preventDefault();
        e.stopPropagation();
        closeLightbox(dialog);
        return;
      }
    }
  },
  true,
);

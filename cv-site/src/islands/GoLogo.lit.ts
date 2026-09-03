import { LitElement, html, css } from "lit";
import { modeStore, type Mode } from "./stores/modeStore.ts";
import { markIntroSeen } from "../scripts/intro-seen.ts";

/**
 * <go-logo>
 *
 * Brand logo "GO" (Giulio Occhipinti) che reagisce al mode attivo:
 *  - TECH       → G e O con bagliore cyan
 *  - CREATIVE   → G e O con gradiente orange animato
 *  - HUMAN      → G e O con glow gold
 *  - MANAGEMENT → G e O con glow violet
 *
 * Click → Master Reset: torna alla landing / con gli oggetti knolling in stato neutro.
 */
class GoLogo extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
    }

    /* ── Il filo a riposo ──────────────────────────────────────
       Era trasparente: il marchio si accendeva solo sotto il puntatore,
       quindi su un telefono — dove un puntatore non esiste — "GO" restava
       due lettere, e niente diceva che si potessero premere. Richiesta di
       Giulio (2026-09-03): deve dichiararsi comando da fermo.

       Il filo e' inchiostro al 44%, non accento, ed e' la stessa ricetta e
       lo stesso valore di --ls-line (lang-switch.css). La ragione sta
       scritta li' ed e' la stessa qui: un contorno che IDENTIFICA un
       controllo deve tenere il 3:1 di 1.4.11, e un accento da un pixel non
       ci arriva sull'arancione della lente design. L'accento resta la
       risposta al passaggio, dove il contrasto lo porta gia' il filo di
       prima. */
    button {
      position: relative;
      background: transparent;
      border: 1px solid
        color-mix(in srgb, var(--color-text-primary, rgba(245, 240, 230, 1)) 44%, transparent);
      border-radius: var(--radius-4, 0.25rem);
      padding: 0.3rem 0.5rem;
      /* cursor: none segue il cursore custom globale */
      cursor: none;
      display: inline-flex;
      align-items: baseline;
      gap: 0;
      font-family: var(--font-display, "Lexend", ui-sans-serif, sans-serif);
      line-height: 1;
      transition:
        border-color 0.2s ease,
        background-color 0.2s ease,
        transform var(--duration-micro, 150ms) var(--ease-standard, ease);
    }

    /* ── Il flusso ─────────────────────────────────────────────
       Una banda di luce che attraversa la superficie e poi si ferma per tre
       secondi e mezzo. Non e' un pulse, ed e' una distinzione voluta: il
       pulse del sistema (.work-index-card--pulse, .profile-cta) chiama
       l'attenzione su UNA cosa dentro una pagina, mentre questo marchio sta
       in cima a OGNI pagina del sito — un respiro perpetuo lassu' diventa
       rumore che si impara a ignorare in due schermate. Un passaggio ogni
       quattro secondi e mezzo dice "sono vivo" senza chiedere niente.

       Si muove background-position, non transform, e non e' un dettaglio:
       cosi' la banda resta dentro il riquadro senza bisogno di overflow
       hidden, che taglierebbe l'alone delle lettere — in lente tech il
       text-shadow arriva a 2,25rem fuori dal bordo, quindi il logo si
       spegnerebbe per fare posto a un'animazione. Ed e' una proprieta' che
       il compositore anima da solo, stessa ragione per cui il pulse delle
       card anima opacity e non box-shadow.

       Passa DIETRO alle lettere. Un pseudo-elemento posizionato dipinge
       sopra al contenuto inline, quindi senza il position/z-index che .go-g
       e .go-o portano qui sotto la banda passerebbe davanti al marchio
       invece che sotto. */
    button::before {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: inherit;
      pointer-events: none;
      background-image: linear-gradient(
        105deg,
        transparent 44%,
        color-mix(in srgb, var(--color-accent, rgba(0, 255, 200, 1)) 26%, transparent) 50%,
        transparent 56%
      );
      background-size: 300% 100%;
      background-position: 120% 0;
      animation: go-flow 4.5s var(--ease-standard, ease) infinite;
    }

    /* Con l'immagine larga il triplo del riquadro, il 100% incolla il bordo
       destro dell'immagine al bordo destro del riquadro: la banda, che sta a
       meta' immagine, finisce fuori a SINISTRA. Lo 0% e' l'opposto. Quindi
       si va da oltre-100 a sotto-zero, ed e' la banda che scorre da sinistra
       a destra. I due valori fuori dai limiti sono il margine che la tiene
       fuori campo durante la pausa. */
    @keyframes go-flow {
      0% {
        background-position: 120% 0;
      }
      26%,
      100% {
        background-position: -20% 0;
      }
    }

    @media (hover: hover) and (pointer: fine) {
      button:hover {
        border-color: var(--color-accent, rgba(0, 255, 200, 1));
        background-color: rgba(255, 255, 255, 0.06);
      }

      /* Sotto il puntatore la banda si fa piu' netta. Non cambia durata:
         cambiarla a meta' corsa fa saltare la banda al fotogramma
         corrispondente della nuova durata, e un salto e' proprio cio' che
         questo effetto esiste per non fare. */
      button:hover::before {
        background-image: linear-gradient(
          105deg,
          transparent 40%,
          color-mix(in srgb, var(--color-accent, rgba(0, 255, 200, 1)) 45%, transparent) 50%,
          transparent 60%
        );
      }
    }

    /* Alla pressione rientra e si incava: la ricetta del sistema, identica a
       .lc-btn e .lh-cta. Mai uno scurimento del riempimento — li' il motivo
       e' il contrasto dell'etichetta, qui sarebbe l'alone delle lettere. */
    button:active {
      transform: scale(0.98);
      box-shadow: inset 0 2px 0.375rem rgba(0, 0, 0, 0.35);
    }

    /* Anello INCHIOSTRO con stacco, non accento: con l'offset l'anello
       confina con la pagina e non col riquadro. Stessa regola di
       .lc a:focus-visible. */
    button:focus-visible {
      outline: 2px solid var(--color-text-primary, rgba(245, 240, 230, 1));
      outline-offset: 3px;
    }

    .go-g,
    .go-o {
      /* Sopra la banda del flusso — vedi button::before. */
      position: relative;
      z-index: 1;
      display: inline-block;
      font-size: var(--fs-28, 1.75rem);
      font-weight: 800;
      letter-spacing: -0.03em;
      color: var(--color-text-primary, rgba(245, 240, 230, 1));
      transition:
        color 0.4s ease,
        text-shadow 0.4s ease,
        filter 0.4s ease;
      will-change: filter, text-shadow, color;
    }

    /* ── TECH: G e O brilla cyan ─────────────────────────────── */
    :host([data-mode="tech"]) .go-g,
    :host([data-mode="tech"]) .go-o {
      color: rgba(0, 255, 200, 1);
      text-shadow:
        0 0 0.375rem rgba(0, 255, 200, 1),
        0 0 1.125rem rgba(0, 255, 200, 0.55),
        0 0 2.25rem rgba(0, 255, 200, 0.2);
    }

    /* ── CREATIVE: G e O con gradiente orange animato ─────────── */
    :host([data-mode="creative"]) .go-g,
    :host([data-mode="creative"]) .go-o {
      color: transparent;
      background: linear-gradient(135deg, rgba(255, 107, 53, 1) 0%, rgba(255, 200, 50, 1) 100%);
      -webkit-background-clip: text;
      background-clip: text;
      animation: go-orange-pulse 2.2s ease-in-out infinite;
    }

    @keyframes go-orange-pulse {
      0%,
      100% {
        filter: brightness(1) drop-shadow(0 0 0 rgba(255, 107, 53, 0));
      }
      50% {
        filter: brightness(1.3) drop-shadow(0 0 0.5rem rgba(255, 107, 53, 0.75));
      }
    }

    /* ── HUMAN: G e O entrambe gold ──────────────────────────── */
    :host([data-mode="human"]) .go-g,
    :host([data-mode="human"]) .go-o {
      color: rgba(240, 200, 127, 1);
      text-shadow:
        0 0 0.3125rem rgba(240, 200, 127, 0.6),
        0 0 0.875rem rgba(240, 200, 127, 0.3);
    }

    /* ── Movimento ridotto ─────────────────────────────────────
       Il flusso e il respiro della lente design spariscono, il filo e
       l'incavo restano: il primo e' decorazione, il secondo dice che il
       comando esiste e che la pressione e' arrivata.

       Questa regola serve davvero, e non e' una ripetizione di quella
       globale: quella azzera le durate con l'universale, che non attraversa
       lo shadow root — fino a oggi il gradiente della lente design pulsava
       anche a chi aveva chiesto di non vedere animazioni. */
    @media (prefers-reduced-motion: reduce) {
      button::before {
        animation: none;
      }

      button:active {
        transform: none;
      }

      :host([data-mode="creative"]) .go-g,
      :host([data-mode="creative"]) .go-o {
        animation: none;
      }
    }
  `;

  private _mode: Mode = modeStore.get();
  private _unsub?: () => void;

  connectedCallback() {
    super.connectedCallback();
    // Imposta data-mode sull'host subito (prima del render) per evitare flash
    this.setAttribute("data-mode", this._mode);

    this._unsub = modeStore.subscribe((m) => {
      this._mode = m;
      this.setAttribute("data-mode", m);
      this.requestUpdate();
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._unsub?.();
  }

  private _handleClick() {
    // Un ritorno via logo non e' mai un primo atterraggio: marca l'intro come
    // vista PRIMA di navigare, cosi' l'ingresso salta il rituale G-O anche se
    // in questa sessione non e' ancora stato visitato (arrivo diretto su /tech
    // da un link esterno, per dire).
    markIntroSeen();

    // E poi naviga, e basta. Qui c'era un "warp launch": ventotto speed-line
    // che sparavano dal centro, il contenuto sfocato e rimpicciolito, una
    // vignetta nera, e la navigazione lanciata a meta' animazione. Era un
    // residuo del sito precedente, ed era l'unico posto del sistema con una
    // transizione tutta sua — per giunta incompatibile con quella vera: la
    // pagina veniva fotografata gia' sfocata e coperta dal nero.
    //
    // Adesso il ritorno usa la stessa transizione dell'andata, ed e' proprio
    // simmetrica: l'oggetto della lente rivola al suo posto nel piano
    // knolling dell'ingresso. Il pezzo che lo rende possibile non e' qui —
    // e' lo script inline in HomeEntryPage.astro, che al risveglio della
    // pagina d'arrivo da' il nome condiviso all'oggetto giusto. Qui non
    // serve fare niente: il nome sulla pagina che parte c'e' gia'.
    window.location.href = "/";
  }

  render() {
    return html`
      <button
        @click=${this._handleClick}
        aria-label="GO — Torna all'ingresso"
        title="Master Reset — torna alla landing"
      >
        <span class="go-g">G</span><span class="go-o">O</span>
      </button>
    `;
  }
}

if (!customElements.get("go-logo")) {
  customElements.define("go-logo", GoLogo);
}

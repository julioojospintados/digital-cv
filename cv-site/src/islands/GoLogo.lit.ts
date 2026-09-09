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

    /* ── Il marchio è nudo ────────────────────────────────────
       Nessun contorno: né a riposo né sotto il puntatore. A rispondere sono
       le lettere. Il 3 settembre il filo c'era — inchiostro al 44%, per dire
       «qui si preme» anche dove un puntatore non esiste — e il 4 Giulio l'ha
       tolto: due lettere alte 28px in cima alla pagina sono già un marchio, e
       un riquadro attorno le fa sembrare un bottone qualunque.

       Il costo, scritto perché non venga riscoperto fra un mese come se fosse
       una svista: su un touch screen il marchio non dichiara più di essere
       premibile. Regge per due ragioni, non per una. La funzione non si perde
       — è il ritorno all'ingresso, che sta anche nel menu contatti e nel logo
       di ogni altra pagina — e il nome accessibile («GO — Torna
       all'ingresso») la dichiara comunque a chi naviga a voce, da tastiera o
       con lo screen reader. È il puntatore che perde un invito, non la
       navigazione che perde una strada.

       Il passo interno resta e non è decorazione: è ciò che tiene l'area
       premibile sopra i 24×24 di 2.5.8 ora che non c'è più un bordo a
       disegnarla. */
    button {
      background: transparent;
      border: 0;
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
        filter var(--duration-state, 240ms) var(--ease-standard, ease),
        transform var(--duration-micro, 150ms) var(--ease-standard, ease);
    }

    /* Qui stava il flusso: una banda di luce che attraversava il riquadro
       ogni quattro secondi e mezzo, dipinta da un ::before. Senza riquadro non
       ha più una superficie da attraversare — era luce sul bordo di una cosa
       che il bordo non ce l'ha più. Tolta il 2026-09-04 con lo stesso taglio. */

    /* La risposta al passaggio sta sul BOTTONE, non sulle lettere, ed è
       l'unico posto dove funziona in tutte e tre le lenti: in lente design le
       lettere hanno già un'animazione su "filter", e un'animazione batte una
       dichiarazione normale nella cascata — un "brightness" scritto lì non si
       vedrebbe mai. Sul genitore i due filtri si compongono invece di
       contendersi la stessa proprietà. */
    @media (hover: hover) and (pointer: fine) {
      button:hover {
        filter: brightness(1.22);
      }
    }

    /* Alla pressione il marchio rientra. Niente ombra interna, che è la
       ricetta di .lc-btn e .lh-cta: quella si dipinge su una superficie, e
       questo bottone non ne ha una. E lo scatto è 0,96 invece di 0,98 perché
       senza riquadro manca il riferimento fermo che rende leggibile uno
       scarto del 2%. */
    button:active {
      transform: scale(0.96);
    }

    /* Anello INCHIOSTRO con stacco, non accento: con l'offset l'anello
       confina con la pagina e non col riquadro. Stessa regola di
       .lc a:focus-visible. Ed è l'unico contorno rimasto: da fermo il marchio
       è nudo, ma sotto il fuoco da tastiera deve dichiararsi comando. */
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

    /* ── CREATIVE: G e O con gradiente orange animato ───────────
       Il respiro è calmo, e le tre cifre sono una scelta di Giulio
       (2026-09-04): 3,6s invece di 2,2, luminosità +12% invece di +30%, alone
       al 30% invece che al 75%. Prima era un flash — e un lampeggio in cima a
       una pagina ferma si nota a ogni giro, cioè chiede attenzione a chi sta
       leggendo altro. Questo si vede solo se lo si guarda, che è quanto deve
       fare un marchio: dire che la pagina è viva, non chiamare. */
    :host([data-mode="creative"]) .go-g,
    :host([data-mode="creative"]) .go-o {
      color: transparent;
      background: linear-gradient(135deg, rgba(255, 107, 53, 1) 0%, rgba(255, 200, 50, 1) 100%);
      -webkit-background-clip: text;
      background-clip: text;
      animation: go-orange-pulse 3.6s ease-in-out infinite;
    }

    @keyframes go-orange-pulse {
      0%,
      100% {
        filter: brightness(1) drop-shadow(0 0 0 rgba(255, 107, 53, 0));
      }
      50% {
        filter: brightness(1.12) drop-shadow(0 0 0.5rem rgba(255, 107, 53, 0.3));
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
       Sparisce il respiro della lente design, resta l'incavo alla pressione:
       il primo è decorazione, il secondo dice che il comando esiste e che la
       pressione è arrivata.

       Questa regola serve davvero, e non è una ripetizione di quella globale:
       quella azzera le durate con l'universale, che non attraversa lo shadow
       root — fino al 3 settembre il gradiente della lente design pulsava
       anche a chi aveva chiesto di non vedere animazioni. */
    @media (prefers-reduced-motion: reduce) {
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

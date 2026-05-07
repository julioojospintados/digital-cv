import{i as u,a as h}from"./lit-element.Bb84fZc7.js";import{b as c}from"./lit-html.BmVY9FNG.js";import{m as g}from"./modeStore.D0teS_Wn.js";class l extends u{static styles=h`
    :host {
      /* Posizionamento gestito dal light DOM CSS in global.css.            */
      /* display: block — il trigger occupa solo 3.1rem x 3.1rem.          */
      /* .fab-items e .feedback-panel sono position:absolute e NON occupano */
      /* spazio nel flusso (evita il box invisibile di ~110px sopra il FAB).*/
      display: block;
      pointer-events: none;
    }

    /* ── Trigger button ── */
    .fab-trigger {
      width: 3.1rem;
      height: 3.1rem;
      border-radius: 50%;
      /* Gradient radiale: luce accent in alto + ottanio base — comunica
         chiaramente che il FAB è cliccabile senza perdere il contrasto. */
      background: radial-gradient(
        circle at 46% 38%,
        color-mix(in srgb, var(--color-accent, rgba(0, 255, 200, 1)) 33%, rgba(14, 90, 82, 0.98)),
        rgba(8, 73, 67, 0.97)
      );
      border: 1.5px solid var(--color-accent, rgba(0, 255, 200, 1));
      cursor: none;
      pointer-events: all;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow:
        0 0 18px color-mix(in srgb, var(--color-accent, rgba(0,255,200,1)) 38%, transparent),
        0 4px 18px rgba(0, 0, 0, 0.45);
      transition:
        transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
        box-shadow 0.3s ease,
        border-color 0.3s ease;
      will-change: transform;
      flex-shrink: 0;
      position: relative;
    }

    .fab-trigger:hover {
      transform: scale(1.1);
      background: radial-gradient(
        circle at 46% 38%,
        color-mix(in srgb, var(--color-accent, rgba(0, 255, 200, 1)) 26%, rgba(14, 90, 82, 0.98)),
        rgba(8, 73, 67, 0.97) 58%
      );
      box-shadow:
        0 0 32px color-mix(in srgb, var(--color-accent, rgba(0,255,200,1)) 55%, transparent),
        0 4px 22px rgba(0, 0, 0, 0.5);
    }

    /* ── Icon swap (⚡ ↔ ✕) ── */
    .fab-icon {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-accent, rgba(0, 255, 200, 1)); /* accent su ottanio — legibile in tutti i mode */
      font-size: 1.25rem;
      font-weight: 900;
      line-height: 1;
      transition:
        opacity 0.18s ease,
        transform 0.28s ease;
    }

    .fab-icon--open {
      opacity: 0;
      transform: rotate(-45deg) scale(0.7);
    }
    .fab-icon--close {
      opacity: 0;
      transform: rotate(45deg) scale(0.7);
    }

    :host([open]) .fab-icon--open {
      opacity: 1;
      transform: rotate(0deg) scale(1);
    }
    :host([open]) .fab-icon--close {
      opacity: 0;
    }
    :host(:not([open])) .fab-icon--open {
      opacity: 0;
    }
    :host(:not([open])) .fab-icon--close {
      opacity: 1;
      transform: rotate(0deg) scale(1);
    }

    /* ── Items container — absolute per non occupare spazio nel flusso ── */
    /* bottom: 3.1rem (trigger) + 0.65rem (gap) = 3.75rem                  */
    .fab-items {
      position: absolute;
      right: 0;
      bottom: 3.75rem;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.5rem;
      pointer-events: none;
    }

    /* ── Single item ── */
    .fab-item {
      display: flex;
      align-items: center;
      gap: 0.55rem;
      padding: 0.42rem 1.05rem;
      border-radius: 100px;
      background: rgba(8, 73, 67, 0.96);
      border: 1px solid
        color-mix(
          in srgb,
          var(--color-accent, rgba(0, 255, 200, 1)) 40%,
          transparent
        );
      color: var(--color-text-primary, rgba(245, 240, 230, 1));
      font-family: "Lexend", ui-sans-serif, sans-serif;
      font-size: 0.68rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      text-decoration: none;
      cursor: none;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      white-space: nowrap;
      pointer-events: none;

      /* Hidden state */
      opacity: 0;
      transform: translateY(12px) scale(0.88);
      transition:
        opacity 0.24s ease,
        transform 0.24s cubic-bezier(0.34, 1.56, 0.64, 1),
        border-color 0.2s ease,
        background 0.2s ease;
    }

    .fab-item:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: var(--color-accent, rgba(0, 255, 200, 0.7));
    }

    .fab-item__icon {
      font-size: 0.9rem;
      line-height: 1;
    }

    /* ── Open state: items appear with stagger ── */
    :host([open]) .fab-items {
      pointer-events: all;
    }

    :host([open]) .fab-item {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: all;
    }

    :host([open]) .fab-item:nth-child(1) {
      transition-delay: 0.04s;
    }
    :host([open]) .fab-item:nth-child(2) {
      transition-delay: 0.08s;
    }
    :host([open]) .fab-item:nth-child(3) {
      transition-delay: 0.12s;
    }

    /* ── Pulse ring (attrae l'attenzione quando chiuso) ── */
    @keyframes fab-ring-pulse {
      0% {
        box-shadow:
          0 0 0 0 color-mix(in srgb, var(--color-accent, rgba(0,255,200,1)) 45%, transparent),
          0 0 18px color-mix(in srgb, var(--color-accent, rgba(0,255,200,1)) 22%, transparent);
      }
      70% {
        box-shadow:
          0 0 0 14px transparent,
          0 0 0px transparent;
      }
      100% {
        box-shadow:
          0 0 0 0 transparent,
          0 0 0px transparent;
      }
    }

    :host(:not([open])) .fab-trigger {
      animation: fab-ring-pulse 3.5s ease-in-out infinite;
      animation-delay: 2s;
    }

    /* ── Mobile adjustments ── */
    @media (max-width: 40rem) {
      .fab-trigger {
        width: 3rem;
        height: 3rem;
        touch-action: manipulation;
      }
      .fab-item {
        touch-action: manipulation;
      }
    }

    /* ── Feedback panel — absolute come .fab-items ── */
    .feedback-panel {
      position: absolute;
      right: 0;
      bottom: 3.75rem;
      width: 15rem;
      background: rgba(8, 73, 67, 0.97);
      border: 1px solid
        color-mix(
          in srgb,
          var(--color-accent, rgba(0, 255, 200, 1)) 40%,
          transparent
        );
      border-radius: 0.75rem;
      padding: 1rem;
      backdrop-filter: blur(16px);
      pointer-events: all;
    }
    .fp-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.65rem;
    }
    .fp-title {
      font-family: "Lexend", sans-serif;
      font-size: 0.6rem;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--color-accent, rgba(0, 255, 200, 1));
    }
    .fp-close {
      background: none;
      border: none;
      cursor: pointer;
      color: rgba(192, 220, 215, 0.6);
      font-size: 0.85rem;
      line-height: 1;
      padding: 0;
      display: flex;
      align-items: center;
    }
    .fp-close:hover {
      color: rgba(245, 240, 230, 1);
    }
    .fp-input,
    .fp-textarea {
      width: 100%;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 0.35rem;
      color: rgba(245, 240, 230, 1);
      font-family: "Lexend", sans-serif;
      font-size: 0.62rem;
      padding: 0.45rem 0.6rem;
      margin-bottom: 0.5rem;
      box-sizing: border-box;
      transition: border-color 0.2s ease;
      resize: none;
    }
    .fp-input {
      cursor: text;
    }
    .fp-textarea {
      height: 4rem;
      cursor: text;
    }
    .fp-input::placeholder,
    .fp-textarea::placeholder {
      color: rgba(192, 220, 215, 0.4);
    }
    .fp-input:focus,
    .fp-textarea:focus {
      outline: none;
      border-color: color-mix(
        in srgb,
        var(--color-accent, rgba(0, 255, 200, 1)) 60%,
        transparent
      );
    }
    .fp-submit {
      width: 100%;
      background: color-mix(
        in srgb,
        var(--color-accent, rgba(0, 255, 200, 1)) 20%,
        transparent
      );
      border: 1px solid var(--color-accent, rgba(0, 255, 200, 1));
      border-radius: 0.35rem;
      color: var(--color-accent, rgba(0, 255, 200, 1));
      font-family: "Lexend", sans-serif;
      font-size: 0.6rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 0.5rem;
      cursor: pointer;
      transition: background 0.2s ease;
    }
    .fp-submit:hover {
      background: color-mix(
        in srgb,
        var(--color-accent, rgba(0, 255, 200, 1)) 35%,
        transparent
      );
    }
    .fp-sent {
      text-align: center;
      font-family: "Lexend", sans-serif;
      font-size: 0.62rem;
      color: var(--color-accent, rgba(0, 255, 200, 1));
      padding: 0.5rem 0;
    }
    .fp-hint {
      font-family: "Lexend", sans-serif;
      font-size: 0.5rem;
      color: rgba(192, 220, 215, 0.4);
      text-align: center;
      margin-top: 0.45rem;
    }
    /* ── Session badge ── */
    .fab-badge {
      position: absolute;
      top: -3px;
      right: -3px;
      width: 1rem;
      height: 1rem;
      border-radius: 50%;
      background: rgba(0, 255, 200, 1);
      color: rgba(8, 73, 67, 1);
      font-family: "Lexend", sans-serif;
      font-size: 0.45rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1.5px solid rgba(8, 73, 67, 1);
    }
  `;_open=!1;_unsub;_showFeedback=!1;_feedbackSent=!1;_draftName="";_draftNote="";static DRAFT_KEY="cv-feedback-draft";connectedCallback(){if(super.connectedCallback(),this._unsub=g.subscribe(()=>{this.requestUpdate()}),document.addEventListener("click",this._handleOutsideClick),document.addEventListener("keydown",this._handleKeydown),typeof window<"u")try{const e=JSON.parse(sessionStorage.getItem(l.DRAFT_KEY)??"null");e&&typeof e=="object"&&(this._draftName=e.name??"",this._draftNote=e.note??"")}catch{}}disconnectedCallback(){super.disconnectedCallback(),this._unsub?.(),document.removeEventListener("click",this._handleOutsideClick),document.removeEventListener("keydown",this._handleKeydown)}_toggle(){this._open=!this._open,this._open?this.setAttribute("open",""):(this.removeAttribute("open"),this._showFeedback=!1,this._feedbackSent=!1),this.requestUpdate()}_handleOutsideClick=e=>{this._open&&!e.composedPath().includes(this)&&(this._open=!1,this.removeAttribute("open"),this._showFeedback=!1,this._feedbackSent=!1,this.requestUpdate())};_handleKeydown=e=>{e.key==="Escape"&&this._open&&(this._open=!1,this.removeAttribute("open"),this._showFeedback=!1,this._feedbackSent=!1,this.requestUpdate())};_closeOnNav(){this._open=!1,this.removeAttribute("open"),this._showFeedback=!1,this._feedbackSent=!1,this.requestUpdate()}_openFeedback(){this._loadDraft(),this._showFeedback=!0,this._feedbackSent=!1,this.requestUpdate()}_closeFeedback(){this._showFeedback=!1,this._feedbackSent=!1,this.requestUpdate()}_saveDraft(){if(!(typeof window>"u"))try{sessionStorage.setItem(l.DRAFT_KEY,JSON.stringify({name:this._draftName,note:this._draftNote}))}catch{}}_loadDraft(){if(!(typeof window>"u"))try{const e=JSON.parse(sessionStorage.getItem(l.DRAFT_KEY)??"null");e&&typeof e=="object"&&(this._draftName=e.name??"",this._draftNote=e.note??"")}catch{}}_onNameInput=e=>{const i=e.target;this._draftName=i?.value??"",this._saveDraft()};_onNoteInput=e=>{const i=e.target;this._draftNote=i?.value??"",this._saveDraft()};_submitFeedback(){const e=this.renderRoot.querySelector("#fp-name"),i=this.renderRoot.querySelector("#fp-note"),a=e?.value.trim()??"",t=i?.value.trim()??"";if(!t)return;try{const o=JSON.parse(sessionStorage.getItem("cv-feedbacks")??"[]");o.push({timestamp:new Date().toISOString(),name:a,note:t}),sessionStorage.setItem("cv-feedbacks",JSON.stringify(o))}catch{}const p=encodeURIComponent("Feedback — CV Digitale Giulio Occhipinti"),n=a?`Da: ${a}`:"Feedback anonimo",r=encodeURIComponent(`${n}

${t}`);if(window.open(`mailto:giulio.occhipinti.g@gmail.com?subject=${p}&body=${r}`,"_blank"),typeof window<"u")try{sessionStorage.removeItem(l.DRAFT_KEY)}catch{}this._draftName="",this._draftNote="",this._feedbackSent=!0,this.requestUpdate()}async _handleAI(e){if(typeof window>"u")return;e.preventDefault(),this._closeOnNav(),await new Promise(o=>requestAnimationFrame(o));const i=document.getElementById("ai-section");if(!i){const o=e.currentTarget?.getAttribute("href");o&&(window.location.href=o);return}const a=(()=>{const o=document.querySelector("#cv-nav");return o?o.getBoundingClientRect().height:52})(),t=window.__lenis,n=(o=>{let d=0,s=o;for(;s;)d+=s.offsetTop,s=s.offsetParent;return d})(i)-a,r=o=>new Promise(d=>{let s=null;const m=window.setTimeout(()=>{s&&cancelAnimationFrame(s),d()},1600),f=()=>{const b=window.scrollY||window.pageYOffset||0;if(Math.abs(b-o)<=6||window.innerHeight+b>=document.body.scrollHeight){clearTimeout(m),s&&cancelAnimationFrame(s),d();return}s=requestAnimationFrame(f)};s=requestAnimationFrame(f)});try{t&&typeof t.scrollTo=="function"?(t.scrollTo(n,{duration:1}),await r(n)):(window.scrollTo({top:n,behavior:"smooth"}),await r(n))}catch{window.scrollTo({top:n,behavior:"smooth"}),await r(n)}try{i.setAttribute("tabindex","-1"),i.focus({preventScroll:!0})}catch{}}render(){const e=typeof window<"u",a=(e?document.documentElement.lang??"it":"it")==="en",t={contactLabel:a?"Contact me":"Contattami",contactAriaLabel:a?"Send email to Giulio":"Invia email a Giulio",feedbackLabel:"Feedback",feedbackAriaLabel:a?"Leave feedback":"Lascia un feedback",aiLabel:"AI Workflow",aiAriaLabel:a?"AI Workflow — how AI amplifies the work":"AI Workflow — come l'AI amplifica il lavoro",fpAriaLabel:a?"Feedback form":"Modulo feedback",fpClose:a?"Close":"Chiudi",fpSent:a?"✓ Thanks! Opening email…":"✓ Grazie! Apertura email…",fpHintSent:a?"Send the message in your email client.":"Invia il messaggio nel client di posta che si è aperto.",fpNamePlaceholder:a?"Name (optional)":"Nome (opzionale)",fpNotePlaceholder:a?"Leave a comment…":"Lascia un commento…",fpSubmit:a?"Send":"Invia",fpHint:a?"Opens your email client — no database, no account required.":"Apre il tuo client email — nessun DB, nessun account richiesto.",menuOpen:a?"Open menu":"Apri menu interazioni",menuClose:a?"Close menu":"Chiudi menu",badgeTitle:r=>a?`${r} feedback sent this session`:`${r} feedback inviati in questa sessione`},p=e&&window.location.pathname.match(/^\/(tech|creative|human|management|cv|en)/)?"#ai-section":"/tech#ai-section";let n=0;if(e)try{const r=JSON.parse(sessionStorage.getItem("cv-feedbacks")??"[]");n=Array.isArray(r)?r.length:0}catch{}return c`
      ${this._showFeedback?c`
            <div
              class="feedback-panel"
              role="dialog"
              aria-label="${t.fpAriaLabel}"
            >
              <div class="fp-header">
                <span class="fp-title">✦ Feedback</span>
                <button
                  class="fp-close"
                  @click=${this._closeFeedback}
                  aria-label="${t.fpClose}"
                >
                  ✕
                </button>
              </div>
              ${this._feedbackSent?c`
                    <p class="fp-sent">${t.fpSent}</p>
                    <p class="fp-hint">${t.fpHintSent}</p>
                  `:c`
                    <input
                      class="fp-input"
                      type="text"
                      id="fp-name"
                      placeholder="${t.fpNamePlaceholder}"
                      autocomplete="off"
                      .value=${this._draftName}
                      @input=${this._onNameInput}
                    />
                    <textarea
                      class="fp-textarea"
                      id="fp-note"
                      placeholder="${t.fpNotePlaceholder}"
                      .value=${this._draftNote}
                      @input=${this._onNoteInput}
                    ></textarea>
                    <button
                      class="fp-submit"
                      @click=${this._submitFeedback}
                      type="button"
                    >
                      ${t.fpSubmit}
                    </button>
                    <p class="fp-hint">${t.fpHint}</p>
                  `}
            </div>
          `:c`
            <div class="fab-items" ?inert="${!this._open}" aria-hidden="${!this._open}">
              <a
                class="fab-item"
                href="mailto:giulio.occhipinti.g@gmail.com"
                aria-label="${t.contactAriaLabel}"
                @click=${this._closeOnNav}
              >
                <span class="fab-item__icon">✉</span>
                <span>${t.contactLabel}</span>
              </a>
              <button
                class="fab-item"
                @click=${this._openFeedback}
                aria-label="${t.feedbackAriaLabel}"
                type="button"
              >
                <span class="fab-item__icon">✦</span>
                <span>${t.feedbackLabel}</span>
              </button>
              <a
                class="fab-item"
                href="${p}"
                aria-label="${t.aiAriaLabel}"
                @click=${this._handleAI}
              >
                <span class="fab-item__icon">⚡</span>
                <span>${t.aiLabel}</span>
              </a>
            </div>
          `}

      <button
        class="fab-trigger"
        @click=${this._toggle}
        aria-label="${this._open?t.menuClose:t.menuOpen}"
        aria-expanded="${this._open}"
        aria-haspopup="menu"
        type="button"
      >
        <span class="fab-icon fab-icon--open" aria-hidden="true">✕</span>
        <span class="fab-icon fab-icon--close" aria-hidden="true">⚡</span>
        ${n>0?c`
              <span
                class="fab-badge"
                title="${t.badgeTitle(n)}"
              >
                ${n}
              </span>
            `:""}
      </button>
    `}}customElements.define("floating-menu",l);

import { gsap } from 'gsap';
import { setMode } from '../islands/stores/modeStore.ts';

// ── DOM refs ─────────────────────────────────────────────
const preloader    = document.getElementById('preloader')!;
const header       = document.getElementById('entry-header')!;
const nameEl       = document.getElementById('entry-name')!;
const cards        = document.querySelectorAll<HTMLButtonElement>('.mode-card');
const knolls       = document.querySelectorAll<HTMLImageElement>('.knoll-item, .knoll-m');

let selectedMode: string | null = null;

// ── Split nome in chars individuali — G di Giulio e O di Occhipinti sono le iniziali GO ──
let firstGChar: HTMLElement | null = null;
let firstOChar: HTMLElement | null = null;

document.querySelectorAll<HTMLElement>('.name-word').forEach((word, wi) => {
  const text = word.textContent ?? '';
  word.textContent = '';
  text.split('').forEach((char, ci) => {
    const s = document.createElement('span');
    s.className = 'name-char';
    s.textContent = char === ' ' ? '\u00A0' : char;
    if (wi === 0 && ci === 0) firstGChar = s;
    if (wi === 1 && ci === 0) firstOChar = s;
    word.appendChild(s);
  });
});

const allChars   = Array.from(nameEl.querySelectorAll<HTMLElement>('.name-char'));
const goChars    = [firstGChar, firstOChar].filter((c): c is HTMLElement => c !== null);
const otherChars = allChars.filter(c => !goChars.includes(c));

// ── Stato iniziale: tutto nascosto — GSAP gestisce la rivelazione ──────────
// G e O: partono grandi e in alto (stessa fromTo della hero di cv.astro)
gsap.set(goChars,   { opacity: 0, scale: 1.8, y: -20 });
// Resto del nome: 18px sotto (semplice fade-up, senza clip)
gsap.set(otherChars, { opacity: 0, y: 18 });
// Label e tagline
gsap.set(['#entry-label', '#entry-tagline'], { opacity: 0, y: 10 });

// ── Preloader refs ────────────────────────────────────────────────────────
const preGEl = document.getElementById('pre-G')!;
const preOEl = document.getElementById('pre-O')!;

// La barra CSS impiega 0.2s (delay) + 1.0s (fill) = 1.2s. Partiamo a 1.25s.
gsap.delayedCall(1.25, () => {
  const tl = gsap.timeline();

  // 1. Glow flash sulle lettere del preloader — identità rivelata
  tl.to([preGEl, preOEl], {
    textShadow: '0 0 40px rgba(255,255,255,0.75)',
    duration: 0.2, stagger: 0.08, ease: 'power2.out',
  });
  tl.to([preGEl, preOEl], {
    textShadow: '0 0 0px transparent',
    duration: 0.15, ease: 'power2.in',
  });

  // 2. Preloader sfuma — G e O si "trasformano" nel nome
  tl.to(preloader, {
    opacity: 0, duration: 0.45, ease: 'power2.inOut',
    onComplete: () => { preloader.style.display = 'none'; },
  });

  // 3. Header torna visibile (era opacity:0 via CSS)
  tl.set(header, { opacity: 1 });

  // 4. G e O "atterrano" nel nome — punch identico alla hero di cv.astro
  tl.fromTo(goChars,
    { opacity: 0, scale: 1.8, y: -20 },
    { opacity: 1, scale: 1, y: 0, duration: 0.55, stagger: 0.18, ease: 'back.out(1.7)' },
    '+=0.02'
  );

  // 5. Glow pulse su G e O nel nome (identico cv.astro)
  tl.to(goChars, {
    textShadow: '0 0 28px rgba(255,255,255,0.65), 0 0 12px rgba(255,255,255,0.4)',
    duration: 0.3, ease: 'power2.out',
  }, '-=0.1');
  tl.to(goChars, {
    textShadow: '0 0 0px transparent',
    duration: 0.65, ease: 'power2.in',
  });

  // 6. "iulio" e "cchipinti" — stagger identico cv.astro hero
  tl.to(otherChars, {
    opacity: 1, y: 0,
    duration: 0.55,
    stagger: { each: 0.05, from: 'start' },
    ease: 'power3.out',
  }, '-=0.55');

  // 7. Tag G e O per il glow mode-reactive (hover sulle card)
  tl.call(() => {
    if (firstGChar) firstGChar.classList.add('name-go-g');
    if (firstOChar) firstOChar.classList.add('name-go-o');
  });

  // 8. Label + tagline
  tl.to(['#entry-label', '#entry-tagline'], {
    opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out',
  }, '-=0.3');

  // 9. Mode cards (GO concept — entrano dal basso)
  tl.fromTo(Array.from(cards),
    { y: 30, opacity: 0, scale: 0.94 },
    { y: 0, opacity: 1, scale: 1, duration: 0.65, stagger: 0.08, ease: 'back.out(1.4)' },
    '-=0.2'
  );

  // 10. Oggetti knolling atterrano sul tavolo
  tl.call(() => {
    knolls.forEach((knoll, i) => {
      knoll.style.setProperty('--knoll-delay', `${i * 65}ms`);
      knoll.classList.add('do-enter');
    });
  });
});

// ── Magnetic effect on mode cards ────────────────────────
cards.forEach((card) => {
  const strength = 12;

  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / rect.width * strength;
    const dy = (e.clientY - cy) / rect.height * strength;
    gsap.to(card, { x: dx, y: dy, duration: 0.4, ease: 'power2.out' });
  });

  card.addEventListener('mouseleave', () => {
    if (!card.classList.contains('is-selected')) {
      gsap.to(card, { x: 0, y: 0, scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
    }
    // Rimuovi preview mode solo se nessuna card è stata selezionata
    if (!selectedMode) nameEl.removeAttribute('data-mode-preview');
  });

  card.addEventListener('mouseenter', () => {
    if (selectedMode && card.dataset.mode !== selectedMode) return;
    gsap.to(card, { scale: 1.03, duration: 0.3, ease: 'power2.out' });
    // Anteprima: G e O del nome reagiscono come GoLogo
    nameEl.setAttribute('data-mode-preview', card.dataset.mode!);
  });
});

// ── Launch journey animation ──────────────────────────────
function launchJourney(href: string) {
  document.body.style.pointerEvents = 'none';
  const overlay = document.getElementById('launch-overlay')!;
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  const lineCount = 28;
  const lineEls: HTMLElement[] = [];

  for (let i = 0; i < lineCount; i++) {
    const angle = (i / lineCount) * 360;
    const rad   = (angle * Math.PI) / 180;
    const dist  = Math.random() * 60 + 10;
    const len   = Math.random() * 200 + 80;
    const thick = Math.random() * 1.5 + 0.5;
    const line  = document.createElement('div');
    Object.assign(line.style, {
      position:        'fixed',
      left:            `${cx + Math.cos(rad) * dist}px`,
      top:             `${cy + Math.sin(rad) * dist}px`,
      width:           `${len}px`,
      height:          `${thick}px`,
      background:      'rgba(255,255,255,0.12)',
      transform:       `rotate(${angle}deg)`,
      transformOrigin: 'left center',
      opacity:         '0',
      zIndex:          '99997',
      pointerEvents:   'none',
    });
    document.body.appendChild(line);
    lineEls.push(line);
  }

  const journey = gsap.timeline({
    onComplete: () => {
      lineEls.forEach(l => l.remove());
      window.location.href = href;
    },
  });

  // Speed lines sparano verso l'esterno (warp speed)
  // Fase 1: comparsa in 0.5s — rimangono visibili per ~1s totale
  journey.fromTo(lineEls,
    { scaleX: 0, opacity: 0 },
    { scaleX: 1, opacity: 0.85, duration: 0.6, stagger: { each: 0.018, from: 'random' }, ease: 'power2.out' }
  );
  // Fase 2: hold visibile (opacity stabile) per 0.5s prima di sparire
  journey.to(lineEls,
    { opacity: 0.85, duration: 0.5, ease: 'none' },
    '-=0'
  );
  // Fase 3: allontanamento warp e dissolvenza
  journey.to(lineEls,
    { scaleX: 6, opacity: 0, duration: 0.35, stagger: { each: 0.009, from: 'random' }, ease: 'power4.in' },
    '-=0'
  );

  // Il mondo si allontana mentre acceleri (parte dopo che le lines sono pienamente visibili)
  journey.to([header, cards],
    { opacity: 0, scale: 0.85, filter: 'blur(10px)', duration: 0.35, ease: 'power3.in' },
    0.5
  );
  journey.to(knolls,
    { opacity: 0, filter: 'blur(10px)', duration: 0.35, ease: 'power3.in' },
    0.5
  );

  // Vignette scura chiude la scena
  journey.to(overlay,
    { opacity: 1, duration: 0.5, ease: 'power2.inOut' },
    0.9
  );
}

// ── Seleziona mode: aggiorna card UI, knolling, modeStore ───────────────
function selectMode(targetCard: HTMLButtonElement, mode: string) {
  selectedMode = mode;
  setMode(mode as 'tech' | 'creative' | 'human' | 'management');
  nameEl.setAttribute('data-mode-preview', mode);
  cards.forEach(c => {
    const goBtn = c.querySelector<HTMLElement>('.mode-card__go');
    if (c === targetCard) {
      c.classList.add('is-selected'); c.classList.remove('is-passive');
      gsap.to(c, { scale: 1.04, duration: 0.3, ease: 'back.out(2)' });
      if (goBtn) {
        goBtn.setAttribute('tabindex', '0');
        goBtn.removeAttribute('aria-hidden');
        gsap.timeline({ delay: 0.2 })
          .fromTo(goBtn,
            { opacity: 0, y: 28, scale: 0.82 },
            { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(3)',
              onStart: () => goBtn.classList.add('is-ready') }
          )
          .to(goBtn,
            { boxShadow: '0 0 24px 4px rgba(212,168,55,0.45)', duration: 0.28,
              ease: 'power2.out', yoyo: true, repeat: 1 },
            0.5
          );
      }
    } else {
      c.classList.add('is-passive'); c.classList.remove('is-selected');
      gsap.to(c, { scale: 0.96, duration: 0.25, ease: 'power2.out' });
      if (goBtn && goBtn.classList.contains('is-ready')) {
        goBtn.setAttribute('tabindex', '-1');
        goBtn.setAttribute('aria-hidden', 'true');
        gsap.to(goBtn, { opacity: 0, y: 5, duration: 0.2, ease: 'power2.in',
          onComplete: () => goBtn.classList.remove('is-ready') });
      }
    }
  });
  knolls.forEach(img => {
    const modes = img.dataset.modes?.split(' ') ?? [];
    const isRelated = modes.includes(mode);
    img.classList.remove('do-enter');
    img.classList.toggle('is-hero', isRelated);
    img.classList.toggle('is-dim', !isRelated);
    gsap.to(img, { opacity: isRelated ? 0.8 : 0.18, duration: 0.5, ease: 'power2.out' });
  });
}

// ── Hold-to-navigate — liquid fill + implosion/explosion ────────────────
const HOLD_DURATION = 1400;
const HOLD_ACCENT: Record<string, string> = {
  tech:       'rgba(0, 255, 200, 1)',
  creative:   'rgba(255, 107, 53, 1)',
  human:      'rgba(240, 200, 127, 1)',
  management: 'rgba(180, 100, 255, 1)',
};

// ── SVG filter — distorsione sott'acqua sul testo delle card ─────────────
const { waveTurbulence, waveDisplace } = (() => {
  const SN = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(SN, 'svg') as SVGSVGElement;
  svg.setAttribute('aria-hidden', 'true');
  svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none;';
  const defs = document.createElementNS(SN, 'defs');
  const filt = document.createElementNS(SN, 'filter');
  filt.id = 'wave-distort';
  filt.setAttribute('x', '-15%'); filt.setAttribute('y', '-15%');
  filt.setAttribute('width', '130%'); filt.setAttribute('height', '130%');
  filt.setAttribute('color-interpolation-filters', 'sRGB');
  const turb = document.createElementNS(SN, 'feTurbulence');
  turb.setAttribute('type', 'fractalNoise');
  turb.setAttribute('baseFrequency', '0.015 0.025');
  turb.setAttribute('numOctaves', '2');
  turb.setAttribute('seed', '3');
  turb.setAttribute('result', 'noise');
  const disp = document.createElementNS(SN, 'feDisplacementMap');
  disp.setAttribute('in', 'SourceGraphic');
  disp.setAttribute('in2', 'noise');
  disp.setAttribute('scale', '0');
  disp.setAttribute('xChannelSelector', 'R');
  disp.setAttribute('yChannelSelector', 'G');
  filt.appendChild(turb); filt.appendChild(disp);
  defs.appendChild(filt); svg.appendChild(defs);
  document.body.appendChild(svg);
  return { waveTurbulence: turb, waveDisplace: disp };
})();

// ── Per-card: click (selezione) + hold (navigazione Pattern E) ────────────
// tappedOnce: traccia se l'utente ha già deliberatamente toccato+rilasciato una card.
// NON usiamo is-selected perché touchstart→selectMode la imposta PRIMA del click sintetico.
const tappedOnce = new WeakMap<HTMLButtonElement, boolean>();
cards.forEach(c => tappedOnce.set(c, false));

cards.forEach((card) => {
  const mode = card.dataset.mode ?? 'tech';
  const href = `/cv?mode=${mode}`;
  const color = HOLD_ACCENT[mode] ?? 'rgba(255,255,255,1)';
  const indicator = card.querySelector<HTMLElement>('.hold-indicator');
  const tapHint   = card.querySelector<HTMLElement>('.tap-hint');
  let cancelFn: (() => void) | null = null;
  let holdCompleted = false;

  // ── Mostra/nasconde il tap-hint su mobile ───────────────────────────────
  function showTapHint() {
    if (!tapHint) return;
    gsap.killTweensOf(tapHint);
    gsap.fromTo(tapHint,
      { opacity: 0, y: 4 },
      { opacity: 1, y: 0, duration: 0.28, delay: 0.35, ease: 'power2.out' }
    );
  }

  function hideTapHint() {
    if (!tapHint) return;
    gsap.killTweensOf(tapHint);
    gsap.to(tapHint, { opacity: 0, duration: 0.15, ease: 'power2.in' });
  }

  // ── Click handler ────────────────────────────────────────────────────────
  // Su mobile: primo click deliberato = select + mostra hint.
  //            secondo click = navigate con warp.
  // tappedOnce è indipendente dalla classe DOM (evita la race condition touchstart→is-selected→click).
  card.addEventListener('click', (e) => {
    if (holdCompleted) { holdCompleted = false; return; }

    const isMobile = !window.matchMedia('(min-width: 640px)').matches;

    if (isMobile) {
      const wasAlreadyTapped = tappedOnce.get(card) ?? false;

      if (wasAlreadyTapped) {
        // Secondo tap deliberato → animate + navigate
        tappedOnce.set(card, false);
        hideTapHint();
        gsap.timeline()
          .to(card, { scale: 1.07, duration: 0.12, ease: 'power2.out' })
          .to(card, { scale: 1.0,  duration: 0.2,  ease: 'power3.in',
              onComplete: () => launchJourney(href) });
        return;
      }

      // Primo tap: segna questa card come "tapped", azzera tutte le altre
      cards.forEach(c => tappedOnce.set(c, false));
      tappedOnce.set(card, true);
      // Nascondi hint sulle altre card
      cards.forEach(c => {
        if (c !== card) {
          const h = c.querySelector<HTMLElement>('.tap-hint');
          if (h) gsap.to(h, { opacity: 0, duration: 0.12 });
        }
      });
      showTapHint();
    }

    // Ripple
    const rect = card.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.left = `${(e as MouseEvent).clientX - rect.left - 30}px`;
    ripple.style.top  = `${(e as MouseEvent).clientY - rect.top - 30}px`;
    card.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());

    selectMode(card, mode);
  });

  // Hold lungo: water wave sale dal basso → card implode → esplode → naviga
  // GUARD: attivo solo se la card è già stata toccata una volta (tappedOnce)
  function startHold() {
    if (cancelFn) return;
    if (!tappedOnce.get(card)) return; // 🔒 primo tocco = solo select, mai navigate

    holdCompleted = false;
    hideTapHint();

    // ── Water container: translateY 100%→0% (sale dal basso) ──────────────
    const waterInner = document.createElement('div');
    waterInner.style.cssText = 'position:absolute;bottom:0;left:0;right:0;height:100%;pointer-events:none;z-index:1;overflow:visible;';
    gsap.set(waterInner, { y: '100%' });
    card.appendChild(waterInner);

    // ── SVG unico: onda + riempimento — stessa opacità, nessuna riga ───────
    // height: calc(100%+20px) → SVG bottom = waterInner bottom (card bottom).
    // viewBox 400×1000: wave midpoint vb y=133 → ~20px da SVG top → waterline.
    // Riempie fino a vb y=1000 → nessun elemento separato, nessuna seam.
    const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgEl.style.cssText = 'position:absolute;top:-20px;left:0;width:200%;height:calc(100% + 20px);display:block;overflow:visible;';
    svgEl.setAttribute('viewBox', '0 0 400 1000');
    svgEl.setAttribute('preserveAspectRatio', 'none');
    const wavePathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    // Midpoint vb y=133, creste y=88, valli y=178 — ampiezza ~6px su card 130px
    wavePathEl.setAttribute('d', 'M0,133 C25,88 75,88 100,133 C125,178 175,178 200,133 C225,88 275,88 300,133 C325,178 375,178 400,133 L400,1000 L0,1000 Z');
    wavePathEl.setAttribute('fill', color);
    wavePathEl.setAttribute('opacity', '0.25');
    svgEl.appendChild(wavePathEl);
    waterInner.appendChild(svgEl);

    // ── Border fill — sale in sincronia ─────────────────────────────────────
    const borderEl = document.createElement('div');
    borderEl.style.cssText = [
      'position:absolute', 'inset:-1px', 'border-radius:inherit',
      `border:2px solid ${color}`,
      'clip-path:inset(100% 0 0 0)',
      'pointer-events:none', 'z-index:3',
    ].join(';');
    card.appendChild(borderEl);

    // ── Distorsione sott'acqua: feTurbulence+feDisplacementMap sul testo ────
    const contentEls = [
      card.querySelector<HTMLElement>('.mode-card__label'),
      card.querySelector<HTMLElement>('.mode-card__desc'),
    ].filter((el): el is HTMLElement => el !== null);
    const distProxy = { scale: 0, freqX: 0.015, freqY: 0.025 };
    const distAnim = gsap.to(distProxy, {
      scale: 9,
      freqX: 0.042,
      freqY: 0.068,
      duration: HOLD_DURATION / 1000,
      ease: 'power2.in',
      onStart() { contentEls.forEach(el => { el.style.filter = 'url(#wave-distort)'; }); },
      onUpdate() {
        waveDisplace.setAttribute('scale', distProxy.scale.toFixed(1));
        waveTurbulence.setAttribute('baseFrequency', `${distProxy.freqX.toFixed(4)} ${distProxy.freqY.toFixed(4)}`);
      },
    });

    // ── Leggera compressione della card ─────────────────────────────────────
    gsap.to(card, { scale: 0.96, duration: 0.25, ease: 'power2.out' });

    // ── Wave ripple loop — −50% = 1 ciclo seamless ──────────────────────────
    const waveAnim = gsap.to(svgEl, {
      x: '-50%',
      duration: 1.6,
      ease: 'none',
      repeat: -1,
    });

    // ── Water rise: translateY 100% → 0% ────────────────────────────────────
    gsap.to(waterInner, {
      y: '0%',
      duration: HOLD_DURATION / 1000,
      ease: 'power1.inOut',
      onComplete: () => {
        holdCompleted = true;
        cancelFn = null;
        tappedOnce.set(card, false);
        waveAnim.kill();
        distAnim.kill();
        contentEls.forEach(el => { el.style.filter = ''; });
        gsap.timeline()
          .to(card, { scale: 0.80, duration: 0.18, ease: 'power3.in' })
          .to(card, {
            scale: 5,
            opacity: 0,
            duration: 0.42,
            ease: 'power4.in',
            onStart: () => launchJourney(href),
          });
      },
    });

    // ── Border syncronizzato ─────────────────────────────────────────────────
    gsap.to(borderEl, {
      clipPath: 'inset(0% 0 0 0)',
      duration: HOLD_DURATION / 1000,
      ease: 'power1.inOut',
    });

    cancelFn = () => {
      waveAnim.kill();
      distAnim.kill();
      gsap.killTweensOf([waterInner, borderEl, card]);
      // Distorsione ritorna a 0 → rimuovi filtro
      gsap.to(distProxy, {
        scale: 0,
        duration: 0.3,
        ease: 'power2.out',
        onUpdate() { waveDisplace.setAttribute('scale', distProxy.scale.toFixed(1)); },
        onComplete() { contentEls.forEach(el => { el.style.filter = ''; }); },
      });
      gsap.to(waterInner, { y: '100%', duration: 0.3, ease: 'power2.in',
        onComplete: () => waterInner.remove() });
      gsap.to(borderEl, { clipPath: 'inset(100% 0 0 0)', duration: 0.3, ease: 'power2.in',
        onComplete: () => borderEl.remove() });
      gsap.to(card, { scale: 1.04, duration: 0.35, ease: 'back.out(1.5)' });
      cancelFn = null;
    };
  }

  function endHold() {
    if (cancelFn && !holdCompleted) {
      cancelFn();
      const isMobile = !window.matchMedia('(min-width: 640px)').matches;
      if (isMobile && tappedOnce.get(card)) showTapHint();
    }
  }

  // Hold-to-navigate: SOLO mobile (touch). Desktop usa CTA button.
  card.addEventListener('touchstart', startHold, { passive: true });
  card.addEventListener('touchend', endHold);
  card.addEventListener('touchcancel', endHold);
});

// GO button desktop: click → naviga — stopPropagation evita il double-fire con card click
document.querySelectorAll<HTMLElement>('.mode-card__go').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const href = btn.dataset.href ?? '/cv';
    launchJourney(href);
  });
});

// Bfcache restore (swipe-back mobile): forza ricaricamento pulito + replays GO animation
window.addEventListener('pageshow', (e) => {
  if (e.persisted) window.location.reload();
});

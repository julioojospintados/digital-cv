import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { modeStore, setMode } from '../islands/stores/modeStore.ts';
import '../islands/GoLogo.lit.ts';

gsap.registerPlugin(ScrollTrigger);

// ── Hero entrance — G and O first, then the rest ──────────────────────
const heroEl      = document.querySelector<HTMLElement>('.hero-section')!;
const allChars    = document.querySelectorAll<HTMLElement>('.hero-char');
const goChars     = document.querySelectorAll<HTMLElement>('.hero-char--go');
const restChars   = [...allChars].filter(el => !el.classList.contains('hero-char--go'));
const heroBadges  = heroEl.querySelector<HTMLElement>('.hero-badges');
const heroTitle   = heroEl.querySelector<HTMLElement>('.hero-title');
const heroSummary = heroEl.querySelector<HTMLElement>('.hero-summary');
const heroFooter  = heroEl.querySelector<HTMLElement>('.hero-footer');

// Initial states are set in CSS (.hero-section, .hero-char, .hero-badges etc.)
// GSAP only needs to animate: opacity → 1, y → 0

const heroTl = gsap.timeline({ delay: 0 });

// 1. Hero section surfaces
heroTl.to(heroEl, { opacity: 1, duration: 0.4, ease: 'power2.out' });

// 2. G and O arrivano per primi — punch + scala (come volano verso il nome nel preloader)
heroTl.fromTo(goChars,
  { opacity: 0, scale: 1.5, y: -12 },
  { opacity: 1, scale: 1, y: 0, duration: 0.55, stagger: 0.18, ease: 'back.out(1.7)' },
  '+=0.05'
);

// 3. Glow pulse accent su G e O
heroTl.to(goChars, {
  textShadow: '0 0 28px var(--color-accent), 0 0 10px var(--color-accent)',
  duration: 0.3, ease: 'power2.out',
}, '-=0.15');
heroTl.to(goChars, {
  textShadow: '0 0 0px transparent',
  duration: 0.7, ease: 'power2.in',
});

// 4. Le altre lettere scorrono in sequenza — stagger simile alle speed lines
heroTl.to(restChars, {
  opacity: 1, y: 0,
  duration: 0.55,
  stagger: { each: 0.05, from: 'start' },
  ease: 'power3.out',
}, '-=0.5');

// 5. Resto della sezione hero (badges, titolo, summary, footer)
heroTl.to([heroBadges, heroTitle, heroSummary, heroFooter], {
  opacity: 1, y: 0,
  duration: 0.55,
  stagger: 0.09,
  ease: 'power2.out',
}, '-=0.25');

// ── Scroll progress bar ───────────────────────────────────────────────
const progressBar = document.createElement('div');
progressBar.className = 'scroll-progress';
document.body.prepend(progressBar);

ScrollTrigger.create({
  start: 0,
  end: 'max',
  onUpdate: ({ progress }) => { progressBar.style.width = `${progress * 100}%`; },
});

// ── Apply mode: aggiorna data-state su tutte le card ────────────────
// CSS transitions già definite su ogni card (opacity, border-color, transform).
// Rimosso GSAP Flip: catturare computed styles di ogni card è CPU-intensivo
// quando il layout non cambia — solo gli stati visivi. CSS gestisce da solo.
function applyMode(mode: string) {
  document.querySelectorAll<HTMLElement>('.cv-card[data-tags]').forEach(card => {
    const tags = card.dataset.tags?.split(' ') ?? [];
    card.dataset.state = tags.includes(mode) ? 'active' : 'passive';
  });
  updateNavButtons(mode);
}

// ── Update nav buttons: morph larghezza + crossfade testo ───────────
// Larghezze FISSE (no 'auto' — GSAP non può interpolare verso auto).
// CSS transition rimossa dal .mode-btn: GSAP controlla tutto.
// killTweensOf previene ghosting su click rapido.
const INACTIVE_W = '2.2rem';
const ACTIVE_W   = '7.5rem'; // sufficiente per 'Management' (label più lungo)
let navInitialized = false;

function updateNavButtons(mode: string) {
  const isDesktop = window.matchMedia('(min-width: 641px)').matches;

  document.querySelectorAll<HTMLElement>('[data-nav-mode]').forEach(btn => {
    const isActive = btn.dataset.navMode === mode;
    const abbr  = btn.querySelector<HTMLElement>('.mode-btn__abbr')!;
    const label = btn.querySelector<HTMLElement>('.mode-btn__label')!;

    gsap.killTweensOf([btn, abbr, label]);

    // Colore/bordo: cambio immediato via classe — zero ritardo, zero desincronizzazione
    btn.classList.toggle('is-active', isActive);
    btn.setAttribute('aria-pressed', String(isActive));

    if (isDesktop) {
      // Desktop: CSS gestisce tutto (label visibile, abbr nascosta, width: auto).
      // Rimuoviamo qualsiasi inline style lasciato da GSAP (es. resize mobile→desktop).
      gsap.set(btn,   { clearProps: 'width' });
      gsap.set(abbr,  { clearProps: 'opacity' });
      gsap.set(label, { clearProps: 'opacity' });
      return;
    }

    // ── Mobile: morph abbreviazione ↔ label completa ───────────────
    if (!navInitialized) {
      gsap.set(btn,   { width: isActive ? ACTIVE_W : INACTIVE_W });
      gsap.set(abbr,  { opacity: isActive ? 0 : 1 });
      gsap.set(label, { opacity: isActive ? 1 : 0 });
      return;
    }

    if (isActive) {
      gsap.to(btn,   { width: ACTIVE_W, duration: 0.36, ease: 'power3.inOut' });
      gsap.to(abbr,  { opacity: 0,      duration: 0.1,  ease: 'power2.in' });
      gsap.to(label, { opacity: 1,      duration: 0.22, delay: 0.14, ease: 'power2.out' });
      // Nessun punch qui — il feedback fisico è solo sul secondo tap (scroll confirm)
    } else {
      gsap.to(label, { opacity: 0,        duration: 0.1,  ease: 'power2.in' });
      gsap.to(btn,   { width: INACTIVE_W, duration: 0.36, delay: 0.06, ease: 'power3.inOut' });
      gsap.to(abbr,  { opacity: 1,        duration: 0.22, delay: 0.22, ease: 'power2.out' });
    }
  });
  navInitialized = true;
}

// ── Nav button clicks + magnetic ─────────────────────────────────────
document.querySelectorAll<HTMLButtonElement>('[data-nav-mode]').forEach(btn => {
  btn.addEventListener('click', () => {
    const mode = btn.dataset.navMode as 'tech' | 'creative' | 'human' | 'management';
    if (!mode) return;

    const isMobile = !window.matchMedia('(min-width: 641px)').matches;
    const isAlreadyActive = btn.classList.contains('is-active');

    // Mobile: primo tap = attiva il mode; secondo tap = scroll al contenuto
    if (isMobile && isAlreadyActive) {
      gsap.fromTo(btn,
        { scale: 0.88 },
        { scale: 1, duration: 0.5, ease: 'elastic.out(2, 0.4)' }
      );
      document.querySelector<HTMLElement>('.skills-section')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    setMode(mode);
    applyMode(mode);
  });

  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const dx = (e.clientX - rect.left - rect.width / 2) / rect.width * 6;
    const dy = (e.clientY - rect.top - rect.height / 2) / rect.height * 6;
    gsap.to(btn, { x: dx, y: dy, duration: 0.3, ease: 'power2.out' });
  });

  btn.addEventListener('mouseleave', () => {
    gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
  });
});

// ── Magnetic hover on GO logo + lang switcher ────────────────────────
([
  document.querySelector<HTMLElement>('go-logo'),
  document.querySelector<HTMLElement>('.cv-nav__lang'),
] as (HTMLElement | null)[]).forEach(el => {
  if (!el) return;
  el.addEventListener('mousemove', (e) => {
    const rect = el.getBoundingClientRect();
    const dx = (e.clientX - rect.left - rect.width / 2) / rect.width * 6;
    const dy = (e.clientY - rect.top - rect.height / 2) / rect.height * 6;
    gsap.to(el, { x: dx, y: dy, duration: 0.3, ease: 'power2.out' });
  });
  el.addEventListener('mouseleave', () => {
    gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
  });
});

// ── Subscribe to modeStore (fires immediately with current value) ─────
modeStore.subscribe(mode => {
  applyMode(mode ?? 'tech');
});

// ── GSAP ScrollTrigger reveals (replaces IntersectionObserver) ───────
document.querySelectorAll<HTMLElement>('.reveal').forEach((el, i) => {
  gsap.fromTo(el,
    { opacity: 0, y: 32 },
    {
      opacity: 1, y: 0,
      duration: 0.8,
      ease: 'power3.out',
      delay: (i % 3) * 0.08,
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none none',
      },
    }
  );
  el.classList.add('is-visible');
});

// ── Timeline stagger (separate from .reveal — items start invisible) ────
const tlItems = document.querySelectorAll<HTMLElement>('.tl-item');
if (tlItems.length) {
  ScrollTrigger.create({
    trigger: '.timeline',
    start: 'top 88%',
    once: true,
    onEnter() {
      gsap.fromTo(tlItems,
        { opacity: 0, x: -8 },
        {
          opacity: 1,
          x: 0,
          duration: 0.5,
          stagger: 0.04,
          ease: 'power3.out',
        }
      );
    },
  });
}

// ── 3D tilt on cards ─────────────────────────────────────────────────
document.querySelectorAll<HTMLElement>('.exp-card, .skill-square, .project-card').forEach(card => {
  card.style.transformStyle = 'preserve-3d';

  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const rx = ((e.clientY - rect.top) / rect.height - 0.5) * -8;
    const ry = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
    gsap.to(card, { rotateX: rx, rotateY: ry, scale: 1.02, duration: 0.3, ease: 'power2.out', transformPerspective: 800 });
  });

  card.addEventListener('mouseleave', () => {
    gsap.to(card, { rotateX: 0, rotateY: 0, scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
  });
});

// ── Animated counters on AI impact badges ────────────────────────────────
// Parses strings like "-87% boilerplate" or "+3x velocità contenuti"
// and counts from 0 → target when the badge enters the viewport.
const counterRe = /^([+\-]?)(\d+(?:\.\d+)?)(.*)$/;
document.querySelectorAll<HTMLElement>('.ai-card__impact[data-count]').forEach(el => {
  const raw = el.dataset.count!;
  const match = raw.match(counterRe);
  if (!match) return;
  const [, sign, numStr, suffix] = match;
  const target = parseFloat(numStr);
  ScrollTrigger.create({
    trigger: el,
    start: 'top 88%',
    once: true,
    onEnter() {
      const obj = { val: 0 };
      gsap.to(obj, {
        val: target,
        duration: 1.2,
        ease: 'power2.out',
        onUpdate() {
          const v = Number.isInteger(target) ? Math.round(obj.val) : obj.val.toFixed(1);
          el.textContent = `${sign}${v}${suffix}`;
        },
      });
    },
  });
});

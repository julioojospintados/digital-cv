import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ── /work — journey orizzontale ──────────────────────────────────────────
// Scroll verticale (wheel, trackpad, swipe touch: input naturale ovunque)
// scrubbato in traslazione orizzontale del track pinnato — il pattern
// "strada da percorrere". Senza JS o con prefers-reduced-motion la sezione
// resta lo stack verticale definito dal CSS di default: il journey è
// progressive enhancement, mai un requisito.

const root = document.querySelector<HTMLElement>("[data-journey]");
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (root && !reduced) initJourney(root);

function initJourney(root: HTMLElement) {
  const track = root.querySelector<HTMLElement>("[data-j-track]")!;
  const svg = root.querySelector<SVGSVGElement>("[data-j-road]")!;
  const basePath = svg.querySelector<SVGPathElement>("[data-j-road-base]")!;
  const progPath = svg.querySelector<SVGPathElement>("[data-j-road-progress]")!;
  const traveler = root.querySelector<HTMLElement>("[data-j-traveler]");
  const hudCurrent = root.querySelector<HTMLElement>("[data-j-current]");
  const hudBar = root.querySelector<HTMLElement>("[data-j-bar]");
  const hudKm = root.querySelector<HTMLElement>("[data-j-km]");
  const panels = Array.from(root.querySelectorAll<HTMLElement>(".journey__panel"));
  const stops = Array.from(root.querySelectorAll<HTMLElement>("[data-stop]"));

  root.classList.add("is-active");

  const distance = () => track.scrollWidth - root.clientWidth;

  // ── Strada SVG — path ondulato generato a runtime (la larghezza del
  // track dipende dal numero di tappe e dal viewport, non è nota al build).
  // Curve morbide alternate: la percezione di "strada", non una retta.
  const dots: SVGCircleElement[] = [];
  let pathLen = 0;
  let stopCentersX: number[] = [];

  function buildRoad() {
    const w = track.scrollWidth;
    const h = root.clientHeight;
    const roadY = h * 0.72;
    const amp = Math.min(h * 0.045, 42);

    svg.setAttribute("width", String(w));
    svg.setAttribute("height", String(h));
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);

    const seg = 520;
    let d = `M 0 ${roadY}`;
    let x = 0;
    let up = true;
    while (x < w) {
      const nx = Math.min(x + seg, w);
      const dy = up ? -amp : amp;
      d += ` C ${x + seg * 0.38} ${roadY + dy}, ${nx - seg * 0.38} ${roadY + dy}, ${nx} ${roadY}`;
      x = nx;
      up = !up;
    }
    basePath.setAttribute("d", d);
    progPath.setAttribute("d", d);

    pathLen = progPath.getTotalLength();
    progPath.style.strokeDasharray = String(pathLen);
    progPath.style.strokeDashoffset = String(pathLen);

    // Milestone: un punto sulla strada al centro di ogni tappa
    dots.forEach((c) => c.remove());
    dots.length = 0;
    stopCentersX = stops.map((s) => s.offsetLeft + s.offsetWidth / 2);
    for (const cx of stopCentersX) {
      const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      c.setAttribute("class", "journey__dot");
      c.setAttribute("cx", String(cx));
      c.setAttribute("cy", String(roadY));
      c.setAttribute("r", "7");
      svg.appendChild(c);
      dots.push(c);
    }

    // La bussola "viaggia" appoggiata sulla strada, a sinistra del viewport
    if (traveler) {
      traveler.style.top = `${roadY - traveler.offsetHeight * 0.92}px`;
    }
  }

  buildRoad();
  ScrollTrigger.addEventListener("refreshInit", buildRoad);

  // ── Tween principale: scroll → x del track ──
  const tween = gsap.to(track, {
    x: () => -distance(),
    ease: "none",
    scrollTrigger: {
      trigger: root,
      start: "top top",
      end: () => "+=" + distance(),
      pin: true,
      // Il parent (.work-main) è display:flex — ScrollTrigger in quel caso
      // disattiva pinSpacing di default e il viaggio resta senza pista di
      // scroll. Forzarlo: il journey è l'ultimo figlio, il padding dello
      // spacer estende semplicemente l'altezza del documento.
      pinSpacing: true,
      anticipatePin: 1,
      scrub: 1,
      invalidateOnRefresh: true,
      onUpdate(self) {
        const p = self.progress;
        // Strada che si disegna
        progPath.style.strokeDashoffset = String(pathLen * (1 - p));
        // "Sei qui": centro del viewport proiettato sul mondo del track
        const worldX = p * distance() + root.clientWidth / 2;
        const passed = stopCentersX.filter((c) => c <= worldX).length;
        if (hudCurrent) hudCurrent.textContent = String(passed).padStart(2, "0");
        if (hudBar) hudBar.style.width = `${p * 100}%`;
        // Odometro letterale: 1 pixel percorso = 1 metro. Un dato, non marketing.
        if (hudKm) hudKm.textContent = `${Math.round(p * distance())} m`;
        dots.forEach((c, i) => c.classList.toggle("is-passed", i < passed));
        // La bussola oscilla cercando il nord mentre viaggia
        if (traveler) gsap.set(traveler, { rotation: Math.sin(p * Math.PI * 5) * 7 });
      },
    },
  });

  // ── Reveal delle tappe relative al viaggio (containerAnimation) ──
  for (const panel of panels) {
    gsap.fromTo(
      panel,
      { y: 26, opacity: 0.45, scale: 0.965 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: panel,
          containerAnimation: tween,
          start: "left 88%",
          end: "left 52%",
          scrub: true,
        },
      },
    );
  }

  // Parallasse leggera sui landmark knolling: viaggiano un filo più lenti
  // delle card — profondità da strada, solo transform.
  for (const icon of root.querySelectorAll<HTMLElement>("[data-j-parallax]")) {
    gsap.fromTo(
      icon,
      { xPercent: 14 },
      {
        xPercent: -14,
        ease: "none",
        scrollTrigger: {
          trigger: icon.closest(".journey__panel") as HTMLElement,
          containerAnimation: tween,
          start: "left right",
          end: "right left",
          scrub: true,
        },
      },
    );
  }

  // ── A11y tastiera: il focus su una tappa porta lo scroll alla sua
  // posizione lungo il viaggio (il pin + transform romperebbe lo
  // scroll-into-view nativo del browser).
  track.addEventListener("focusin", (e) => {
    const panel = (e.target as HTMLElement).closest<HTMLElement>(".journey__panel");
    const st = tween.scrollTrigger;
    if (!panel || !st) return;
    const frac = Math.min(
      1,
      Math.max(0, (panel.offsetLeft + panel.offsetWidth / 2 - root.clientWidth / 2) / distance()),
    );
    const y = st.start + frac * (st.end - st.start);
    const lenis = (window as { __lenis?: { scrollTo: (y: number, o?: object) => void } }).__lenis;
    if (lenis) lenis.scrollTo(y, { immediate: true });
    else window.scrollTo(0, y);
  });
}

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ── /work/[slug] — journey verticale ─────────────────────────────────────
// La strada scende con la pagina, in una corsia a sinistra delle tappe, e la
// bussola la percorre restando all'altezza del centro della finestra: dove
// sta chi legge. Fino al 2026-09-30 la sezione si pinnava e lo scroll veniva
// tradotto in orizzontale; l'effetto, visto usare, era strano (la pagina
// smetteva di scendere e andava di lato), quindi il viaggio è tornato sul
// gesto che la pagina ha già. Niente pin: lo scroll resta del browser.
//
// Senza JS o con prefers-reduced-motion la sezione resta lo stack verticale
// del CSS di default, senza strada: il journey è progressive enhancement,
// mai un requisito.

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

  // ── Strada SVG — path ondulato generato a runtime: l'altezza della
  // traccia dipende dal testo, dal viewport e dai font, non è nota al build.
  // Curve morbide alternate dentro la corsia: la percezione di "strada",
  // non una retta.
  const dots: SVGCircleElement[] = [];
  let pathLen = 0;
  let trackH = 0;
  let stopCentersY: number[] = [];

  function laneWidth() {
    // La corsia è il padding-left della traccia meno lo stacco dal testo:
    // leggerla dal CSS evita un secondo numero che possa divergere.
    const pad = parseFloat(getComputedStyle(track).paddingLeft) || 0;
    return Math.max(32, pad - 12);
  }

  function buildRoad() {
    const w = laneWidth();
    const h = track.offsetHeight;
    trackH = h;
    const roadX = w / 2;
    const amp = w * 0.22;

    svg.setAttribute("width", String(w));
    svg.setAttribute("height", String(h));
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);

    const seg = 420;
    let d = `M ${roadX} 0`;
    let y = 0;
    let left = true;
    while (y < h) {
      const ny = Math.min(y + seg, h);
      // Control point proporzionati alla lunghezza REALE del segmento:
      // l'ultimo tratto può essere più corto di `seg`, e control point
      // oltre ny disegnerebbero un ricciolo a fine strada.
      const sh = ny - y;
      const dx = (left ? -amp : amp) * Math.min(1, sh / seg);
      d += ` C ${roadX + dx} ${y + sh * 0.38}, ${roadX + dx} ${ny - sh * 0.38}, ${roadX} ${ny}`;
      y = ny;
      left = !left;
    }
    basePath.setAttribute("d", d);
    progPath.setAttribute("d", d);

    pathLen = progPath.getTotalLength();
    progPath.style.strokeDasharray = String(pathLen);

    // Milestone: un punto sulla strada all'altezza del centro di ogni tappa
    dots.forEach((c) => c.remove());
    dots.length = 0;
    stopCentersY = stops.map((s) => s.offsetTop + s.offsetHeight / 2);
    for (const cy of stopCentersY) {
      const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      c.setAttribute("class", "journey__dot");
      c.setAttribute("cx", String(roadX));
      c.setAttribute("cy", String(cy));
      c.setAttribute("r", "6");
      svg.appendChild(c);
      dots.push(c);
    }
  }

  buildRoad();
  ScrollTrigger.addEventListener("refreshInit", buildRoad);
  // Il testo delle tappe va a capo diversamente quando arrivano i font o
  // cambia la larghezza: la strada va ridisegnata sull'altezza vera.
  let lastH = track.offsetHeight;
  new ResizeObserver(() => {
    if (track.offsetHeight !== lastH) {
      lastH = track.offsetHeight;
      ScrollTrigger.refresh();
    }
  }).observe(track);

  const moveTraveler = traveler
    ? gsap.quickTo(traveler, "y", { duration: 0.45, ease: "power3.out" })
    : null;

  function update(p: number) {
    // Strada che si disegna
    progPath.style.strokeDashoffset = String(pathLen * (1 - p));
    // "Sei qui": il centro della finestra proiettato sulla traccia
    const hereY = p * trackH;
    const passed = stopCentersY.filter((c) => c <= hereY).length;
    if (hudCurrent) hudCurrent.textContent = String(passed).padStart(2, "0");
    if (hudBar) hudBar.style.width = `${p * 100}%`;
    // Odometro letterale: 1 pixel percorso = 1 metro. Un dato, non marketing.
    if (hudKm) hudKm.textContent = `${Math.round(hereY)} m`;
    dots.forEach((c, i) => c.classList.toggle("is-passed", i < passed));
    if (traveler && moveTraveler) {
      const th = traveler.offsetHeight;
      moveTraveler(Math.min(Math.max(hereY - th / 2, 0), Math.max(trackH - th, 0)));
      // La bussola oscilla cercando il nord mentre viaggia
      gsap.set(traveler, { rotation: Math.sin(p * Math.PI * 5) * 7 });
    }
  }

  // ── Scroll → progresso del viaggio. Parte quando la cima della traccia
  // incontra il centro della finestra e finisce quando ci arriva il fondo:
  // così `p * altezza` è esattamente il punto della traccia che sta davanti
  // agli occhi, ed è lì che la bussola deve trovarsi.
  const st = ScrollTrigger.create({
    trigger: track,
    start: "top center",
    end: "bottom center",
    invalidateOnRefresh: true,
    onUpdate: (self) => update(self.progress),
    onRefresh: (self) => update(self.progress),
  });
  update(st.progress);

  // ── Reveal delle tappe mentre entrano in vista ──
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
          start: "top 88%",
          end: "top 60%",
          scrub: true,
        },
      },
    );
  }

  // Qui c'era un listener `focusin` che riportava lo scroll sulla tappa
  // col focus: con il pin e il transform orizzontale lo scroll-into-view
  // nativo del browser non funzionava. Senza pin funziona da solo.
}

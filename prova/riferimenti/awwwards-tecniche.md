# Come sono fatti 9 siti premiati, e perché hanno vinto

Giulio Occhipinti, 2026-10-29. Codice scaricato e analizzato dal browser,
voti presi dalle pagine della giuria Awwwards.

## Voti della giuria

| Sito | Voto | Design | Usabilità | Creatività | Animazioni (dev) | Accessibilità (dev) |
|---|---|---|---|---|---|---|
| bruno-simon.com | 8,11 | 8,05 | 7,83 | 8,62 | 8,6 | 6,6 |
| igloo.inc | 7,92 | 8,05 | 7,50 | 8,31 | 9,6 | 6,6 |
| phantom.land | 7,61 | 7,77 | 7,31 | 7,73 | 8,2 | 6,8 |
| wodniack.dev | 7,56 | 7,53 | 7,30 | 7,96 | 8,4 | 6,2 |
| madebynull.com | 7,45 | 7,58 | 6,85 | 8,02 | 7,8 | 7,6 |
| metalab.com | 7,44 | 7,50 | 7,31 | 7,49 | 7,8 | 6,0 |
| localstudio.fr | 7,44 | 7,66 | 7,06 | 7,59 | 7,8 | 6,6 |
| olhalazarieva.com | 7,29 | 7,44 | 7,05 | 7,44 | 7,4 | 7,0 |
| art-yakushev.com | 7,28 | 7,41 | 7,06 | 7,33 | 7,4 | 6,8 |

- La creatività è sempre il voto più alto, l'usabilità sempre il più basso.
- Nei voti tecnici l'accessibilità è il punto debole di tutti (6,0–7,6).
- Per vincere un Sito del Giorno basta stare sopra 7,2–7,3.

## Come sono fatti

- **metalab.com:** l'oggetto 3D lucido è un **video MP4 da 2,8 MB** in loop,
  non 3D in tempo reale. Usa React/Next, GSAP, Lenis.
- **madebynull.com:** la piramide sono **due video** (avanti e indietro) che
  girano col mouse. Tutto il sito pesa 0,7 MB.
- **wodniack.dev:** Astro, GSAP 3.12 con SplitText, Lenis. Il muro di lettere
  è un **canvas 2D** con skew e prospettiva, senza 3D. 230 KB di JS e 2,3 MB
  in tutto.
- **art-yakushev.com:** Webflow, GSAP con SplitText, Lenis. Le «animazioni»
  dei case study sono **video** (36 MB).
- **bruno-simon.com:** three.js r183, fisica (WebAssembly), 23 modelli `.glb`,
  25 texture compresse `.ktx`, musica. È un videogioco: anni di lavoro.
- **phantom.land:** three.js, 58 shader, un personaggio `.glb`, **suoni**
  (click, whoosh, riser).
- **igloo.inc:** Svelte, three.js, **140 shader**, modelli compressi (Draco e
  KTX2), testo in WebGL (MSDF), 18 suoni. È il lavoro di due studi.
- **olhalazarieva.com:** three.js, un ambiente HDR, un modello `.glb`, GSAP.
- **localstudio.fr:** three.js, 32 shader, due modelli `.glb` (i gettoni).

## Cosa ne esce per il Digital CV

- **Il wow non richiede per forza il 3D in tempo reale.** Metalab e Null usano
  video renderizzati, Wodniack un canvas 2D.
- **Quello che sale davvero il voto:**
  - una regia del movimento (GSAP con SplitText e Lenis, su 8 siti su 9);
  - un oggetto o una scena che è la firma del sito;
  - in quelli più alti, il **suono**.
- **Il 3D vero (Bruno, Igloo, Phantom) vale i voti più alti**, ma richiede
  modelli fatti in Blender, shader e mesi di lavoro.
- **Usabilità e accessibilità sono deboli ovunque.** Un sito che fa wow
  **e** prende 8 in usabilità si distingue proprio dove tu, come UX/UI, sei
  più forte.
- **Strada realistica per GO:**
  - modellare GO in Blender e mostrarlo come video renderizzato, comandato
    dallo scroll (alla Metalab e Null);
  - tipografia cinetica con GSAP e SplitText (alla Wodniack);
  - suoni brevi e opzionali;
  - accessibilità curata, che lì è il punto più debole di tutti.

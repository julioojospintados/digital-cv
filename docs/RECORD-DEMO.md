# Registrare il Prototype Demo (mobile)

Questo documento spiega come visualizzare e registrare il prototype demo creato in `cv-site/public/prototype/mobile-demo/index.html`.

File demo
- `cv-site/public/prototype/mobile-demo/index.html`

Modalità rapida — vedere la demo localmente
1. Build statico (opzionale):

```bash
npm run build --prefix cv-site
# Serve la cartella dist con un server statico (esempio: http-server o serve)
npx http-server cv-site/dist -p 3000
# poi apri http://localhost:3000/prototype/mobile-demo/index.html
```

2. Oppure lancia dev server (serve live-reload):

```bash
npm run dev --prefix cv-site
# di solito il sito è su http://localhost:3000
```

Opzione A — Registrare con Playwright (consigliato per output coerente)
1. Installa Playwright:

```bash
npm i -D playwright
# (su Windows potrebbe essere necessario eseguire: npx playwright install)
```

2. Avvia un server che serva `cv-site/dist` o usa `npm run dev --prefix cv-site`.
3. Esegui lo script fornito:

```bash
node scripts/record-demo-playwright.js
```

Il file verrà salvato nella cartella `videos/` come WebM; poi puoi convertire in GIF con `ffmpeg`.

Opzione B — Registrare con ffmpeg (screen capture)
- Linux/macOS (esempio display):

```bash
# registra una regione 390x844 in (x=100,y=100)
ffmpeg -f x11grab -video_size 390x844 -framerate 15 -i :0.0+100,100 -codec:v libvpx-vp9 demo.webm
# converti a gif
ffmpeg -i demo.webm -vf "fps=15,scale=390:-1:flags=lanczos" -loop 0 demo.gif
```

- Windows (gdigrab):

```powershell
# trova il titolo della finestra del browser e inseriscilo
ffmpeg -f gdigrab -framerate 15 -video_size 390x844 -i title="NomeFinestraBrowser" demo.mp4
# converti a gif
ffmpeg -i demo.mp4 -vf "fps=15,scale=390:-1:flags=lanczos" -loop 0 demo.gif
```

Nota: la cattura screen dipende dalla risoluzione e dal sistema; Playwright è più riproducibile.

Suggerimenti
- Imposta il browser con dimensione viewport 390×844 per mantenere proporzioni telefoniche.
- Aumenta `waitForTimeout` nello script Playwright se desideri registrare una sequenza più lunga.
- Usa `ffmpeg` con `-r 15` e `scale` per avere una GIF fluida e leggera.

Se vuoi, posso provare a generare il video/gif qui se mi autorizzi a installare `playwright` e a eseguire lo script (potrebbero servire alcuni MB di download).

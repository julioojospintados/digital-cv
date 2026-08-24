/**
 * gen-photo-thumbs.mjs — le miniature dei cassetti "Cose mie" e "Viaggio".
 *
 * Perché esiste. Le foto sorgente sono 1500x2000 e pesano fino a 599 KB;
 * nella griglia si vedono a 298px su desktop e 335px su telefono, cioè si
 * scaricano venticinque volte i pixel che servono. E siccome stanno dentro
 * un <dialog> chiuso — che è display:none — il `loading="lazy"` non le
 * precarica mai: all'apertura diventano visibili tutte insieme e partono
 * 2,5 MB in parallelo. Da qui il caricamento a scatti.
 *
 * Due misure, non una. La miniatura serve la griglia e le modali di
 * "Chi sono"; l'originale resta e lo carica solo la lightbox, una foto alla
 * volta, quando la si apre davvero (memory-drawer.ts). Ridurre le sorgenti
 * non era un'opzione: la lightbox le mostra fino a 60rem di larghezza.
 *
 * 640px: copre i 298px della griglia a densità doppia e i 576px della
 * modale di lettura. Le miniature sono file veri sotto public/ e vanno
 * committate — a differenza di src/assets, public/ non passa dalla pipeline
 * di Astro, quindi nessuno le genera al build.
 *
 * Rilanciare solo quando si aggiungono o sostituiscono foto:
 *     npm run gen:thumbs
 */
import sharp from "../cv-site/node_modules/sharp/lib/index.js";
import { readdirSync, mkdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = "cv-site/public/photos";
const WIDTH = 640;
const QUALITY = 72;

let before = 0;
let after = 0;
let count = 0;

for (const group of ["trip", "belongings"]) {
  const dir = join(ROOT, group);
  const out = join(dir, "thumb");
  mkdirSync(out, { recursive: true });

  for (const file of readdirSync(dir).filter((f) => f.endsWith(".webp"))) {
    const src = join(dir, file);
    const dst = join(out, file);
    // `withoutEnlargement` per non gonfiare una foto già più piccola di 640.
    await sharp(src)
      .resize(WIDTH, null, { withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(dst);
    before += statSync(src).size;
    after += statSync(dst).size;
    count++;
  }
}

const kb = (n) => Math.round(n / 1024) + " KB";
console.log(`${count} miniature a ${WIDTH}px`);
console.log(`  originali: ${kb(before)}`);
console.log(`  miniature: ${kb(after)}  (${Math.round((1 - after / before) * 100)}% in meno)`);

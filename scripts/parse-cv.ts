/**
 * parse-cv.ts
 *
 * Legge tutti i PDF presenti in _cv-source/ ed estrae il testo.
 * Output su stdout, pronto da copiare nel prompt /cv-intake di Copilot Chat.
 *
 * Uso:
 *   npm run parse-cv
 *   oppure
 *   npx tsx scripts/parse-cv.ts
 */

import { readdir, readFile, writeFile } from "fs/promises";
import { join, extname, basename, dirname } from "path";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const pdfParse: (buf: Buffer) => Promise<{ text: string; numpages: number }> = require("pdf-parse");

const __dirname = dirname(fileURLToPath(import.meta.url));
const SOURCE_DIR = join(__dirname, "..", "_cv-source");
const OUTPUT_FILE = join(SOURCE_DIR, "extracted-text.txt");

async function main(): Promise<void> {
  let files: string[];

  try {
    files = await readdir(SOURCE_DIR);
  } catch {
    console.error(`❌  Cartella _cv-source/ non trovata. Creala nella root del progetto.`);
    process.exit(1);
  }

  const pdfs = files.filter((f) => extname(f).toLowerCase() === ".pdf");

  if (pdfs.length === 0) {
    console.log("⚠️  Nessun PDF trovato in _cv-source/");
    console.log("   Copia i tuoi file PDF in quella cartella e riprova.");
    process.exit(0);
  }

  const sections: string[] = [];

  for (const filename of pdfs) {
    const filePath = join(SOURCE_DIR, filename);
    console.error(`📄  Elaborazione: ${filename}...`);

    const buffer = await readFile(filePath);
    const result = await pdfParse(buffer);

    sections.push(
      `${"═".repeat(60)}\n` +
        `FILE: ${basename(filename)}  (${result.numpages} pagine)\n` +
        `${"═".repeat(60)}\n\n` +
        result.text.trim(),
    );
  }

  const fullText = sections.join("\n\n\n");

  // Salva su file per comodità
  await writeFile(OUTPUT_FILE, fullText, "utf8");

  // Stampa su stdout
  console.log(fullText);
  console.error(`\n✅  Completato. Testo salvato anche in _cv-source/extracted-text.txt`);
  console.error(`\n👉  Prossimo step:`);
  console.error(`    1. Apri Copilot Chat`);
  console.error(`    2. Scrivi: /cv-intake`);
  console.error(`    3. Quando richiesto, incolla il testo estratto`);
}

main();

// Rimozione dei commenti HTML dall'output di build.
//
// PERCHÉ ESISTE: compressHTML di Astro comprime spazi e newline ma NON rimuove
// i commenti `<!-- -->`. I commenti di sviluppo nei file .astro (nomi di file,
// decisioni implementative, note interne) finivano quindi leggibili da
// "Visualizza sorgente" da qualunque visitatore.
//
// PERCHÉ NON È PIÙ UNA REGEX: la versione precedente faceva due passate
// indipendenti sul testo grezzo — prima "proteggeva" i blocchi script/style,
// poi cancellava i commenti. Con due passate scollegate, un tag script
// *nominato dentro un commento* faceva agganciare alla ricerca della chiusura
// il primo `</script>` reale successivo, cancellando in silenzio tutto ciò che
// stava in mezzo. Il bug si è verificato davvero, su Layout.astro.
//
// La versione qui sotto fa UNA sola passata in ordine di documento: a ogni `<`
// decide se sta entrando in un commento o in un blocco script/style, e consuma
// il costrutto per intero prima di proseguire. Così un `<script>` citato dentro
// un commento viene mangiato dal commento (corretto) e un `<!--` dentro uno
// script resta parte dello script (corretto), senza che i due casi possano
// interferire.
//
// Principio di sicurezza: davanti a un costrutto malformato (commento o tag mai
// chiuso) il testo residuo viene copiato invariato, mai scartato. Perdere un
// commento è accettabile, perdere metà pagina no — ed era esattamente il
// fallimento della versione a regex.

/**
 * Rimuove i commenti HTML preservando intatto il contenuto di script e style.
 * @param {string} html
 * @returns {string}
 */
export function stripHtmlComments(html) {
  const OPEN_TAG_RE = /^<(script|style)\b[^>]*>/i;

  let out = "";
  let i = 0;

  while (i < html.length) {
    const lt = html.indexOf("<", i);
    if (lt === -1) {
      out += html.slice(i);
      break;
    }
    out += html.slice(i, lt);

    // ── Commento: consumato per intero, incluso ciò che contiene ──────────
    if (html.startsWith("<!--", lt)) {
      const end = html.indexOf("-->", lt + 4);
      if (end === -1) {
        // Commento mai chiuso: non si cancella nulla (vedi principio sopra).
        out += html.slice(lt);
        break;
      }
      i = end + 3;
      continue;
    }

    // ── script / style: copiati alla lettera, commenti interni compresi ───
    const open = OPEN_TAG_RE.exec(html.slice(lt));
    if (open) {
      const openTag = open[0];
      // `<script />` non ha contenuto: nessuna chiusura da cercare.
      if (openTag.endsWith("/>")) {
        out += openTag;
        i = lt + openTag.length;
        continue;
      }
      const tagName = open[1].toLowerCase();
      const closeRe = new RegExp(`</${tagName}\\s*>`, "i");
      const afterOpen = lt + openTag.length;
      const close = closeRe.exec(html.slice(afterOpen));
      if (!close) {
        // Blocco mai chiuso: si copia il resto invariato.
        out += html.slice(lt);
        break;
      }
      const end = afterOpen + close.index + close[0].length;
      out += html.slice(lt, end);
      i = end;
      continue;
    }

    // ── `<` qualunque altro: carattere normale ────────────────────────────
    out += "<";
    i = lt + 1;
  }

  return out;
}

import { describe, it, expect } from "vitest";
import { stripHtmlComments } from "./strip-html-comments.js";

describe("stripHtmlComments", () => {
  it("rimuove un commento semplice", () => {
    expect(stripHtmlComments("<p>a</p><!-- nota --><p>b</p>")).toBe("<p>a</p><p>b</p>");
  });

  it("rimuove commenti su più righe", () => {
    const html = "<div>\n<!-- riga uno\n     riga due -->\n</div>";
    expect(stripHtmlComments(html)).toBe("<div>\n\n</div>");
  });

  it("non tocca il contenuto di script", () => {
    const html = '<script>const a = "<!-- non è un commento -->";</script>';
    expect(stripHtmlComments(html)).toBe(html);
  });

  it("non tocca il contenuto di style", () => {
    const html = "<style>/* commento css */ .a { color: red }</style>";
    expect(stripHtmlComments(html)).toBe(html);
  });

  it("preserva il payload JSON-LD, che può contenere '<!--' come stringa", () => {
    const html = '<script type="application/ld+json">{"x":"<!--"}</script>';
    expect(stripHtmlComments(html)).toBe(html);
  });

  // ── Regressione del bug reale ────────────────────────────────────────────
  // La vecchia implementazione a due regex, incontrando un tag script NOMINATO
  // dentro un commento, agganciava il primo </script> reale successivo e
  // cancellava tutto ciò che stava in mezzo. Accaduto su Layout.astro.
  it("non cancella nulla quando un commento nomina un tag script", () => {
    const html =
      "<!-- nel commento si parla di <script> senza chiuderlo -->" +
      "<p>contenuto che deve sopravvivere</p>" +
      "<script>console.log(1)</script>";
    const out = stripHtmlComments(html);
    expect(out).toContain("<p>contenuto che deve sopravvivere</p>");
    expect(out).toContain("<script>console.log(1)</script>");
    expect(out).not.toContain("nel commento si parla");
  });

  it("non cancella nulla quando un commento nomina un tag style", () => {
    const html = "<!-- vedi <style> --><p>vivo</p><style>.a{}</style>";
    const out = stripHtmlComments(html);
    expect(out).toContain("<p>vivo</p>");
    expect(out).toContain("<style>.a{}</style>");
  });

  // ── Robustezza: mai perdere contenuto su input malformato ────────────────
  it("preserva il resto del documento se un commento non è chiuso", () => {
    const html = "<p>prima</p><!-- mai chiuso <p>dopo</p>";
    expect(stripHtmlComments(html)).toContain("<p>prima</p>");
  });

  it("preserva il resto del documento se uno script non è chiuso", () => {
    const html = "<p>prima</p><script>codice senza chiusura";
    const out = stripHtmlComments(html);
    expect(out).toContain("<p>prima</p>");
    expect(out).toContain("codice senza chiusura");
  });

  it("gestisce lo script self-closing senza mangiare ciò che segue", () => {
    const html = '<script src="/a.js" /><p>dopo</p><!-- via -->';
    const out = stripHtmlComments(html);
    expect(out).toContain("<p>dopo</p>");
    expect(out).not.toContain("via");
  });

  it("lascia intatto un documento senza commenti", () => {
    const html = "<!doctype html><html><body><p>1 < 2</p></body></html>";
    expect(stripHtmlComments(html)).toBe(html);
  });

  it("rimuove più commenti in sequenza", () => {
    expect(stripHtmlComments("<!--a--><i>x</i><!--b--><i>y</i><!--c-->")).toBe("<i>x</i><i>y</i>");
  });
});

/**
 * cv-pdf-template.ts
 * Template puro (nessun fs, nessun playwright) per il CV PDF "UX/UI" —
 * estratto da generate-ux-cv.ts perché sia importabile anche da un contesto
 * serverless (cv-site/src/server/cv-recruiter/render-pdf.ts) dove un
 * `readFileSync` a runtime non è affidabile (bundling Vercel). I chiamanti
 * passano gli asset (font/QR in base64) già pronti invece di farli leggere
 * qui — vedi PdfAssets.
 */

export const SITE = "https://giulio-occhipinti.com";

export interface Experience {
  yr: string;
  loc: string;
  role: string;
  org: string;
  bullets: string[];
}
export interface Work {
  title: string;
  desc: string;
  outcome: string;
  url: string;
}
export interface SkillGroup {
  label: string;
  chips: string[];
  key?: boolean;
}
export interface Cert {
  by: string;
  name: string;
  strong?: boolean;
}
export interface Edu {
  yr: string;
  /** HTML: contiene già <b>…</b> ed eventuale suffisso non-bold. */
  title: string;
  sub: string;
}
export interface Lang {
  name: string;
  level: string;
}

export interface Locale {
  lang: "it" | "en";
  file: string;
  positioning: string;
  creds: string;
  location: string;
  linkedinUrl: string;
  siteLabel: string;
  workLinkLabel: string;
  qrCap: string;
  visitBtn: string;
  profileLead: string;
  profile: string;
  secExperience: string;
  expEyebrow: string;
  earlier: string;
  secWork: string;
  workEyebrow: string;
  secSkills: string;
  skillsEyebrow: string;
  secCerts: string;
  secEdu: string;
  secLangs: string;
  experiences: Experience[];
  works: Work[];
  skills: SkillGroup[];
  certs: Cert[];
  edu: Edu[];
  langs: Lang[];
  ctaTitle: string;
  ctaSub: string;
  portfolioBtn: string;
  /** Solo mercato ITALIA — testo di consenso GDPR renderizzato in fondo alla pagina 2. */
  gdprFooter?: string;
}

export interface CoverLetterContent {
  date: string;
  salutation: string;
  paragraphs: string[];
  closing: string;
}

export interface CoverLetterMeta {
  lang: "it" | "en";
  senderName: string;
  senderEmail: string;
  senderLocation: string;
  linkedinUrl: string;
  company: string;
  role: string;
}

/** Font/QR pre-caricati come data: URI — vedi i chiamanti per come li ottengono. */
export interface PdfAssets {
  qr: string;
  lex400: string;
  lex600: string;
  lex700: string;
  lex800: string;
  jb500: string;
  jb700: string;
}

// ── Template ─────────────────────────────────────────────────────────────────

const expHtml = (e: Experience): string => `
  <div class="entry">
    <div class="entry__meta"><span class="yr">${e.yr}</span><span class="loc">${e.loc}</span></div>
    <div class="entry__body">
      <div class="entry__head"><span class="entry__role">${e.role}</span> · <span class="entry__org">${e.org}</span></div>
      <ul>${e.bullets.map((b) => `<li>${b}</li>`).join("")}</ul>
    </div>
  </div>`;

const workHtml = (w: Work, linkLabel: string): string => `
    <article class="wcard">
      <div class="wt">${w.title}</div>
      <div class="wd">${w.desc}</div>
      <div class="wo">${w.outcome}</div>
      <div class="wl"><a class="lnk" href="${w.url}">${linkLabel}</a></div>
    </article>`;

const skillHtml = (g: SkillGroup): string => `
  <div class="grp"><div class="lbl">${g.label}</div><div class="chips">${g.chips
    .map((c) => `<span class="chip${g.key ? " key" : ""}">${c}</span>`)
    .join("")}</div></div>`;

const certHtml = (c: Cert): string =>
  `<div class="li"><span class="b">${c.by}</span><span class="t">${
    c.strong ? `<b>${c.name}</b>` : c.name
  }</span></div>`;

const eduHtml = (e: Edu): string =>
  `<div class="li"><span class="b">${e.yr}</span><span class="t">${e.title}<br><span>${e.sub}</span></span></div>`;

const langHtml = (l: Lang): string =>
  `<span class="lg"><b>${l.name}</b> <span>${l.level}</span></span>`;

export function buildHtml(L: Locale, assets: PdfAssets): string {
  return `<!doctype html><html lang="${L.lang}"><head><meta charset="utf-8"><style>
@font-face{font-family:'Lexend';font-weight:400;src:url(${assets.lex400}) format('woff2');}
@font-face{font-family:'Lexend';font-weight:600;src:url(${assets.lex600}) format('woff2');}
@font-face{font-family:'Lexend';font-weight:700;src:url(${assets.lex700}) format('woff2');}
@font-face{font-family:'Lexend';font-weight:800;src:url(${assets.lex800}) format('woff2');}
@font-face{font-family:'JetBrains Mono';font-weight:500;src:url(${assets.jb500}) format('woff2');}
@font-face{font-family:'JetBrains Mono';font-weight:700;src:url(${assets.jb700}) format('woff2');}

/* ── Design System tokens (creative lens) ── */
:root{
  --bg:rgb(8,73,67); --cream:rgb(245,240,230);
  --mut:rgba(192,220,215,.85); --mut-or:rgba(255,195,155,.82);
  --accent:rgb(255,107,53);
  --line:rgba(255,255,255,.14); --line-or:rgba(255,107,53,.30);
  --surface:rgba(255,255,255,.045);
  --sans:'Lexend',system-ui,sans-serif; --mono:'JetBrains Mono',ui-monospace,monospace;
}
@page{size:A4;margin:0;}
*{box-sizing:border-box;margin:0;padding:0;}
html{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
body{font-family:var(--sans);color:var(--cream);background:var(--bg);font-size:9.3pt;line-height:1.44;}
a{color:inherit;text-decoration:none;}

/* Foglio A4: ottanio a tutti i bordi + padding interno uniforme, uguale su ogni pagina */
.sheet{width:210mm;height:297mm;box-sizing:border-box;padding:15mm 15mm 14mm;
  background:var(--bg);overflow:hidden;position:relative;}
.sheet > section:first-child,.sheet > .head:first-child{margin-top:0;}

/* link = accent + underline (clickable, no icon) */
a.lnk{color:var(--accent);text-decoration:underline;text-decoration-thickness:.8pt;
  text-underline-offset:1.8pt;font-weight:600;}
.btn{display:inline-flex;align-items:center;justify-content:center;font-family:var(--sans);
  font-weight:700;font-size:10pt;letter-spacing:-.01em;padding:3.2mm 6mm;border-radius:2mm;
  background:var(--accent);color:var(--bg);text-decoration:none;}

/* ── HEADER ── */
.head{margin:0 0 5mm;padding:0 0 6mm;
  display:grid;grid-template-columns:1fr auto;gap:11mm;align-items:start;
  border-bottom:1.5px solid var(--line);}
.name{font-weight:800;font-size:27pt;line-height:1;letter-spacing:-.02em;}
.posit{font-weight:700;font-size:12pt;color:var(--accent);margin-top:2mm;letter-spacing:-.01em;}
.creds{font-family:var(--mono);font-weight:500;font-size:7.6pt;line-height:1.5;letter-spacing:.02em;
  color:var(--mut);margin-top:3mm;max-width:52em;}
.contacts{display:flex;flex-wrap:wrap;gap:2.4mm 5.5mm;margin-top:4.5mm;
  font-family:var(--mono);font-weight:500;font-size:8.2pt;}
.contacts .ct{display:inline-flex;align-items:baseline;gap:1.6mm;}
.contacts .lab{font-size:6.6pt;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--accent);}
.contacts .plain{color:var(--mut);}
.contacts a.on-dark{color:var(--cream);text-decoration:underline;
  text-decoration-color:var(--accent);text-decoration-thickness:.8pt;text-underline-offset:1.8pt;}

.qcol{display:flex;flex-direction:column;align-items:center;gap:3.5mm;width:42mm;}
.qcol img{width:42mm;height:42mm;display:block;border-radius:3mm;}
.qcol .cap{font-family:var(--mono);font-weight:500;font-size:6.6pt;letter-spacing:.03em;
  color:var(--mut);text-align:center;line-height:1.4;}
.qcol .btn{width:100%;}

/* ── SECTIONS ── */
section{margin-top:4mm;}
.sec-h{display:flex;align-items:baseline;gap:3mm;margin-bottom:3mm;
  border-bottom:1.5px solid var(--line);padding-bottom:1.8mm;}
.sec-h h2{font-weight:800;font-size:11pt;letter-spacing:-.01em;}
.sec-h span{font-family:var(--mono);font-weight:700;font-size:6.6pt;letter-spacing:.16em;
  text-transform:uppercase;color:var(--accent);}
.sec-h__link{margin-left:auto;font-size:7.8pt;}

.profile-lead{font-weight:700;font-size:11.5pt;letter-spacing:-.01em;color:var(--cream);margin-bottom:1.3mm;}
.profile{font-size:9.1pt;line-height:1.36;max-width:64em;color:var(--cream);}

/* Experience */
.entry{display:grid;grid-template-columns:34mm 1fr;gap:6mm;padding:1.5mm 0;
  break-inside:avoid;border-top:1px solid var(--line);}
.entry:first-of-type{border-top:0;padding-top:.5mm;}
.entry__meta{font-family:var(--mono);font-size:7.4pt;line-height:1.5;color:var(--mut);}
.entry__meta .yr{display:block;font-weight:700;color:var(--cream);font-size:7.8pt;letter-spacing:.02em;}
.entry__meta .loc{display:block;margin-top:.8mm;}
.entry__head{margin-bottom:1.2mm;}
.entry__role{font-weight:700;font-size:10pt;letter-spacing:-.01em;color:var(--cream);}
.entry__org{font-weight:600;font-size:9.4pt;color:var(--accent);}
.entry ul{list-style:none;display:flex;flex-direction:column;gap:.9mm;}
.entry li{position:relative;padding-left:4.2mm;font-size:9pt;line-height:1.32;}
.entry li::before{content:"";position:absolute;left:0;top:1.4mm;width:1.6mm;height:1.6mm;
  border-radius:50%;background:var(--accent);}
.entry li b{font-weight:700;}
.earlier{margin-top:1.8mm;padding-top:1.8mm;border-top:1px solid var(--line);
  font-family:var(--mono);font-size:7.6pt;line-height:1.45;color:var(--mut);}

/* Selected work */
.work{display:grid;grid-template-columns:1fr 1fr;gap:5mm;}
.wcard{border:1.5px solid var(--line-or);border-radius:2.5mm;padding:4mm;break-inside:avoid;
  background:var(--surface);display:flex;flex-direction:column;gap:2mm;}
.wcard .wt{font-weight:700;font-size:9.6pt;letter-spacing:-.01em;color:var(--cream);}
.wcard .wd{font-size:8.6pt;line-height:1.42;color:var(--cream);}
.wcard .wo{font-family:var(--mono);font-weight:700;font-size:7.6pt;color:var(--accent);}
.wcard .wl{margin-top:auto;border-top:1px solid var(--line);padding-top:2mm;font-size:7.8pt;}

/* Skills */
.grp{margin-bottom:3mm;break-inside:avoid;}
.grp:last-child{margin-bottom:0;}
.grp .lbl{font-family:var(--mono);font-weight:700;font-size:6.8pt;letter-spacing:.12em;
  text-transform:uppercase;color:var(--mut);margin-bottom:1.8mm;}
.chips{display:flex;flex-wrap:wrap;gap:1.8mm;}
.chip{font-family:var(--mono);font-weight:500;font-size:7.6pt;padding:1mm 2.4mm;
  border:1px solid var(--line);border-radius:1.6mm;color:var(--cream);}
.chip.key{border-color:var(--line-or);color:var(--accent);font-weight:700;}

/* Certs / Edu / Languages */
.twoup{display:grid;grid-template-columns:1fr 1fr;gap:6mm;}
.list{display:flex;flex-direction:column;gap:1.8mm;}
.li{display:grid;grid-template-columns:15mm 1fr;gap:3mm;font-size:8.6pt;line-height:1.4;break-inside:avoid;}
.li .b{font-family:var(--mono);font-weight:700;font-size:7pt;color:var(--accent);white-space:nowrap;padding-top:.4mm;}
.li .t b{font-weight:700;color:var(--cream);} .li .t span{color:var(--mut);}
.langs{display:flex;flex-wrap:nowrap;gap:8mm;font-size:8.8pt;margin-top:.5mm;}
.langs .lg b{font-weight:700;} .langs .lg span{font-family:var(--mono);font-size:7.4pt;color:var(--accent);}

/* CTA */
.cta{margin-top:6mm;border:1.5px solid var(--line-or);background:var(--surface);border-radius:3mm;
  padding:5mm;display:flex;justify-content:space-between;align-items:center;gap:6mm;break-inside:avoid;}
.cta__t{font-weight:700;font-size:11pt;letter-spacing:-.01em;color:var(--cream);}
.cta__s{font-family:var(--mono);font-size:7.6pt;color:var(--mut);margin-top:2mm;line-height:1.4;}

.gdpr{margin-top:3mm;font-family:var(--mono);font-size:6.6pt;line-height:1.4;color:var(--mut);}

</style></head><body>

<div class="sheet">
<header class="head">
  <div>
    <h1 class="name">Giulio Occhipinti</h1>
    <p class="posit">${L.positioning}</p>
    <p class="creds">${L.creds}</p>
    <div class="contacts">
      <span class="ct"><span class="lab">Email</span> <a class="on-dark" href="mailto:giulio.occhipinti.g@gmail.com">giulio.occhipinti.g@gmail.com</a></span>
      <span class="ct"><span class="lab">LinkedIn</span> <a class="on-dark" href="${L.linkedinUrl}">in/giulio-occhipinti</a></span>
      <span class="ct"><span class="lab">${L.siteLabel}</span> <a class="on-dark" href="${SITE}">giulio-occhipinti.com</a></span>
      <span class="ct plain">${L.location}</span>
    </div>
  </div>
  <figure class="qcol">
    <a href="${SITE}"><img src="${assets.qr}" alt="QR code — ${SITE}"></a>
    <div class="cap">${L.qrCap}</div>
    <a class="btn" href="${SITE}">${L.visitBtn}</a>
  </figure>
</header>

<section>
  <p class="profile-lead">${L.profileLead}</p>
  <p class="profile">${L.profile}</p>
</section>

<section>
  <div class="sec-h"><h2>${L.secExperience}</h2><span>${L.expEyebrow}</span></div>
  ${L.experiences.map(expHtml).join("\n")}
  <div class="earlier">${L.earlier}</div>
</section>

</div><!-- /sheet 1 -->

<div class="sheet">
<section>
  <div class="sec-h"><h2>${L.secWork}</h2><span>${L.workEyebrow}</span><a class="lnk sec-h__link" href="${SITE}/work">${L.portfolioBtn}</a></div>
  <div class="work">${L.works.map((w) => workHtml(w, L.workLinkLabel)).join("\n")}</div>
</section>

<section>
  <div class="sec-h"><h2>${L.secSkills}</h2><span>${L.skillsEyebrow}</span></div>
  ${L.skills.map(skillHtml).join("\n")}
</section>

<section>
  <div class="twoup">
    <div>
      <div class="sec-h"><h2>${L.secCerts}</h2></div>
      <div class="list">${L.certs.map(certHtml).join("")}</div>
    </div>
    <div>
      <div class="sec-h"><h2>${L.secEdu}</h2></div>
      <div class="list">${L.edu.map(eduHtml).join("")}</div>
    </div>
  </div>
  <div class="sec-h" style="margin-top:5mm"><h2>${L.secLangs}</h2></div>
  <div class="langs">${L.langs.map(langHtml).join("")}</div>
</section>

<div class="cta">
  <div>
    <div class="cta__t">${L.ctaTitle}</div>
    <div class="cta__s">${L.ctaSub}</div>
  </div>
  <a class="btn" href="${SITE}/work">${L.portfolioBtn}</a>
</div>
${L.gdprFooter ? `<div class="gdpr">${L.gdprFooter}</div>` : ""}
</div><!-- /sheet 2 -->

</body></html>`;
}

// ── DRAFT: single-column, ATS-pure variant ──────────────────────────────────
// Nessuna colonna (header, certs/edu, work) — solo blocchi impilati verticalmente,
// nessuna immagine/QR (solo URL testuale), nessun chip/pill decorativo (elenco
// testuale semplice), header di sezione convenzionali. Riduce il rischio di un
// parser ATS debole che legge le colonne fuori ordine o scarta il contenuto
// dentro un'immagine — vedi la ricerca 2026 su ATS parsing (single-column è
// tornato lo standard raccomandato). È un DRAFT: non sostituisce la versione
// disegnata, va rivisto prima di usarlo per una candidatura reale.
export function buildHtmlAts(L: Locale, assets: PdfAssets): string {
  const expAts = (e: Experience): string => `
    <div class="entry">
      <div class="entry__head">${e.role} — ${e.org}</div>
      <div class="meta">${e.yr} · ${e.loc}</div>
      <ul>${e.bullets.map((b) => `<li>${b}</li>`).join("")}</ul>
    </div>`;

  const workAts = (w: Work, linkLabel: string): string => `
    <div class="entry">
      <div class="entry__head">${w.title}</div>
      <div>${w.desc}</div>
      <div class="meta">${w.outcome}</div>
      <div><a href="${w.url}">${linkLabel}</a></div>
    </div>`;

  const certAts = (c: Cert): string => `<li>${c.by} — ${c.name}</li>`;
  const eduAts = (e: Edu): string => `<li>${e.yr} — ${e.title} — ${e.sub}</li>`;
  const langAts = (l: Lang): string => `${l.name} (${l.level})`;

  return `<!doctype html><html lang="${L.lang}"><head><meta charset="utf-8"><style>
@font-face{font-family:'Lexend';font-weight:400;src:url(${assets.lex400}) format('woff2');}
@font-face{font-family:'Lexend';font-weight:700;src:url(${assets.lex700}) format('woff2');}
@page{size:A4;margin:18mm 20mm;}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Lexend',Arial,sans-serif;font-size:10.5pt;line-height:1.5;color:#141414;background:#fff;}
a{color:#084943;}
h1{font-size:19pt;font-weight:700;}
.posit{font-size:12pt;font-weight:700;margin-top:1mm;}
.creds{font-size:9.5pt;color:#333;margin-top:2mm;}
.contacts{font-size:9.5pt;margin-top:2mm;}
h2{font-size:12pt;font-weight:700;margin:6mm 0 2mm;border-bottom:1px solid #999;padding-bottom:1mm;}
.meta{font-size:9pt;color:#444;}
.entry{margin-bottom:4mm;}
.entry__head{font-weight:700;}
ul{padding-left:5mm;margin-top:1mm;}
li{margin-bottom:1mm;}
.skill-list{margin-bottom:2mm;}
.skill-list b{display:block;font-size:9.5pt;text-transform:uppercase;margin-bottom:1mm;}
</style></head><body>

<h1>Giulio Occhipinti</h1>
<p class="posit">${L.positioning}</p>
<p class="creds">${L.creds}</p>
<p class="contacts">Email: giulio.occhipinti.g@gmail.com — LinkedIn: ${L.linkedinUrl} — ${L.siteLabel}: ${SITE} — ${L.location}</p>

<h2>${L.profileLead}</h2>
<p>${L.profile}</p>

<h2>${L.secExperience}</h2>
${L.experiences.map(expAts).join("\n")}
<p class="meta">${L.earlier}</p>

<h2>${L.secWork}</h2>
${L.works.map((w) => workAts(w, L.workLinkLabel)).join("\n")}
<p><a href="${SITE}/work">${L.portfolioBtn}</a></p>

<h2>${L.secSkills}</h2>
${L.skills.map((g) => `<div class="skill-list"><b>${g.label}</b>${g.chips.join(", ")}</div>`).join("\n")}

<h2>${L.secCerts}</h2>
<ul>${L.certs.map(certAts).join("")}</ul>

<h2>${L.secEdu}</h2>
<ul>${L.edu.map(eduAts).join("")}</ul>

<h2>${L.secLangs}</h2>
<p>${L.langs.map(langAts).join(" — ")}</p>

${L.gdprFooter ? `<p class="meta" style="margin-top:6mm">${L.gdprFooter}</p>` : ""}

</body></html>`;
}

// Lettera di presentazione — layout da business letter classico, single-column,
// stessa famiglia tipografica (Lexend) dell'ATS draft ma senza gli elementi
// decorativi del CV designed: qui il tono deve restare conservativo, è un
// documento che molti portali richiedono a parte (Word/PDF) accanto al CV.
export function buildCoverLetterHtml(
  letter: CoverLetterContent,
  meta: CoverLetterMeta,
  assets: PdfAssets,
): string {
  const contactLine = [meta.senderEmail, meta.linkedinUrl, meta.senderLocation]
    .filter(Boolean)
    .join(" — ");
  const recipientLine = meta.company ? `${meta.company}` : "";

  return `<!doctype html><html lang="${meta.lang}"><head><meta charset="utf-8"><style>
@font-face{font-family:'Lexend';font-weight:400;src:url(${assets.lex400}) format('woff2');}
@font-face{font-family:'Lexend';font-weight:700;src:url(${assets.lex700}) format('woff2');}
@page{size:A4;margin:22mm 24mm;}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Lexend',Arial,sans-serif;font-size:11pt;line-height:1.65;color:#141414;background:#fff;}
a{color:#084943;}
h1{font-size:15pt;font-weight:700;}
.contacts{font-size:9.5pt;color:#333;margin-top:2mm;}
.date{margin-top:10mm;font-size:10.5pt;}
.recipient{margin-top:4mm;font-size:10.5pt;font-weight:700;}
.role{font-size:10.5pt;color:#333;}
.salutation{margin-top:8mm;}
p.body{margin-top:5mm;text-align:left;}
.closing{margin-top:8mm;}
.signature{margin-top:10mm;font-weight:700;}
</style></head><body>

<h1>${meta.senderName}</h1>
<p class="contacts">${contactLine}</p>

<p class="date">${letter.date}</p>
${recipientLine ? `<p class="recipient">${recipientLine}</p>` : ""}
${meta.role ? `<p class="role">${meta.role}</p>` : ""}

<p class="salutation">${letter.salutation}</p>
${letter.paragraphs.map((p) => `<p class="body">${p}</p>`).join("\n")}

<p class="closing">${letter.closing}</p>
<p class="signature">${meta.senderName}</p>

</body></html>`;
}

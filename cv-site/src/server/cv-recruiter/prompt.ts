import type { CountryBucket } from "./fixed-copy.js";

/** Rileva euristicamente se la job description dichiara già uno stipendio. */
export function jdHasSalary(jobDescription: string): boolean {
  return /(?:[$€£]\s?\d|(?:ral|salary|compensation|stipendio|retribuzione)\D{0,20}\d)/i.test(
    jobDescription,
  );
}

export function buildResearchPrompt(params: {
  company: string;
  jobDescription: string;
  bucket: CountryBucket;
}): string {
  const { company, jobDescription, bucket } = params;
  const salaryAlreadyStated = jdHasSalary(jobDescription);

  return `Sei un ricercatore che raccoglie informazioni pubbliche per preparare una candidatura di lavoro.

Azienda: ${company}
Area geografica target: ${bucket}

Compiti:
1. Cerca in 1-2 query cosa fa l'azienda, settore, dimensione/stage indicativo (startup early-stage, scale-up, enterprise consolidata), e se emerge qualcosa sulla cultura di lavoro (remote-first, ecc.).
${
  salaryAlreadyStated
    ? "2. La job description sembra già dichiarare una fascia di stipendio: NON cercarne una diversa, limitati al punto 1."
    : "2. Cerca fasce salariali pubbliche per il ruolo descritto nella job description, per questa azienda o — se non tracciata — per ruolo simile + settore + dimensione + area geografica, su fonti come Glassdoor, levels.fyi, Payscale, LinkedIn Salary, Indeed Salaries."
}

Rispondi in italiano con un riepilogo breve puntato. Per ogni affermazione numerica (stipendio, dimensione azienda) cita la fonte (URL). Se non trovi nulla di affidabile su un punto, scrivilo esplicitamente invece di indovinare.

Job description (per contesto, non serve ricercarne il contenuto):
"""
${jobDescription.slice(0, 4000)}
"""`;
}

const AUDIT_AND_ANALYSIS_RULES = `Sei un Senior Tech & UX Recruiter e ATS Optimization Specialist con 15+ anni di esperienza internazionale (US, EU, IT), al lavoro sulla candidatura di Giulio Occhipinti.

Non sai e non devi ipotizzare chi leggerà il CV (persona o parser automatico) — non biforcare mai il contenuto su questa base, producine uno solo, chiaro per entrambi.

## Fonti di verità — non inventare esperienza

Ti viene fornito un estratto dei dati CV canonici di Giulio (esperienze, certificazioni, competenze, progetti). Puoi riformulare, riordinare, tagliare ed enfatizzare in base a cosa la job description chiede. Non puoi inventare metriche, ruoli, date o risultati che non trovi in questi dati o nel contesto aggiuntivo fornito dall'utente. Se un requisito della JD chiederebbe un numero che non hai, trattalo come anomalia (vedi sotto) invece di inventarlo.

## 🛑 Anomalie che bloccano la generazione

Verifica questi casi. Se ne trovi anche uno, l'array "anomalies" deve contenere una domanda chiara e specifica per ciascuno, e "report"/"cvContent" devono essere null — non generare comunque un CV parziale.

1. Se il ruolo della JD è design/frontend e nei dati forniti manca un link portfolio pertinente oltre a quello di default (https://giulio-occhipinti.com/work) — nota: quello di default è già sufficiente, non è di per sé un'anomalia.
2. Se l'area geografica è "italia" e serve confermare il testo di consenso GDPR (verrà comunque aggiunto un footer standard automaticamente — segnalalo come nota, non come blocco, a meno che manchi completamente un modo di identificarlo).
3. Periodi scoperti superiori a 6 mesi tra un'esperienza e l'altra nei dati forniti, o date che si sovrappongono in modo anomalo senza spiegazione nei dati.
4. La JD chiede risultati misurabili (KPI, metriche, scala) su un'area dove i dati forniti hanno solo mansioni senza numeri — poni una domanda mirata per estrarli, non inventarli.
5. Seniority incoerente: la JD cerca una seniority molto diversa da quella che emerge dai dati (es. richiede "Junior" con un profilo 5+ anni, o "Senior/Staff" su requisiti che il profilo non copre) — segnalalo esplicitamente.

## Analisi della job description (solo se NESSUNA anomalia)

1. **Estrazione requisiti**: separa i requisiti della JD in must-have (peso 2 — linguaggio "required"/"must"/"X+ years"/elencati come core) e nice-to-have (peso 1 — "preferred"/"bonus"/"a plus"/citati una volta sola).
2. **matchPercentage**: per ogni requisito assegna uno score contro i dati forniti — full (= peso pieno, evidenza diretta e forte), partial (= metà peso, evidenza adiacente/trasferibile), none (= 0, nessuna evidenza). matchPercentage = round(100 × Σ punteggio / Σ peso). Motiva ogni riga di requirementBreakdown in una frase.
3. **strengths**: i must-have coperti pieni, più differenzianti rilevanti anche se non richiesti (es. AI workflow, design system, architetture MCP).
4. **painPoints**: ogni requisito assente o parziale, severità onesta (un nice-to-have mancante è "low", un must-have mancante è "medium"/"high"), con un'azione concreta suggerita quando ha senso.
5. **salaryEstimate**: usa il riepilogo di ricerca fornito in "RICERCA AZIENDALE" più sotto. Se la JD dichiara già uno stipendio, usa quello (non stimare sopra un dato reale). Se non c'è né in JD né nella ricerca fonti affidabili, salaryEstimate deve essere null — mai un numero inventato.
6. **cvContent**: componi il CV tarato sulla JD, nella lingua richiesta, riformulando i dati forniti (non le stringhe di corredo fisse, quelle le aggiunge il sistema dopo). "earlier" è una riga breve con le esperienze meno rilevanti per questa JD, non deve ripetere quelle già in "experiences". "fileSlug" è kebab-case breve (nome azienda + ruolo), userà a costruire il nome del PDF.

Il testo generato in bullets/title/sub/earlier può usare tag <b>...</b> inline per il grassetto, coerente col resto del CV.`;

export function buildStructuredSystemPrompt(): string {
  return AUDIT_AND_ANALYSIS_RULES;
}

export function buildStructuredUserContent(params: {
  bucket: CountryBucket;
  lang: "it" | "en";
  company: string;
  jobDescription: string;
  extraContext: string;
  cvGroundingData: unknown;
  researchFindings: string;
}): string {
  const { bucket, lang, company, jobDescription, extraContext, cvGroundingData, researchFindings } =
    params;

  return `AREA GEOGRAFICA (bucket): ${bucket}
LINGUA OUTPUT: ${lang}
AZIENDA: ${company}

JOB DESCRIPTION:
"""
${jobDescription}
"""

${extraContext ? `CONTESTO AGGIUNTIVO / RISPOSTE ALLE ANOMALIE PRECEDENTI (fornito dall'utente):\n"""\n${extraContext}\n"""\n` : ""}

RICERCA AZIENDALE E STIPENDIO (da Google Search, solo come riferimento — verifica comunque plausibilità):
"""
${researchFindings}
"""

DATI CV CANONICI DI GIULIO OCCHIPINTI (fonte di verità, non inventare oltre questo + il contesto aggiuntivo sopra):
${JSON.stringify(cvGroundingData)}`;
}

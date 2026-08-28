/**
 * issuer-marks.ts — il marchio di chi ha rilasciato il titolo.
 *
 * "Il percorso" erano quindici righe che cominciavano tutte allo stesso modo,
 * con una data e poi del testo. Un marchio in testa alla riga crea un bordo
 * sinistro scansionabile: IBM tre volte di fila si legge senza leggere, e il
 * grappolo di certificazioni UX degli ultimi diciotto mesi emerge da solo,
 * senza bisogno di un secondo grafico che lo spieghi.
 *
 * ── Perché solo due loghi ────────────────────────────────────────────────
 * Perché sono gli unici due che esistono. Verificato: IBM sta in Simple Icons,
 * IED pubblica il proprio SVG; SkillUp, Simplilearn, Planet One e B-Teatro non
 * stanno in nessun set mantenuto e non pubblicano un file utilizzabile. Gli
 * altri prendono una sigla in mono, allineata alla stessa base: la colonna
 * resta un sistema invece di alternare marchi e riquadri.
 *
 * ── Perché una maschera CSS e non una <img> ──────────────────────────────
 * I due file hanno `fill="currentColor"`, ma un `<img src>` non eredita il
 * colore del testo: resterebbero nero su ottanio. Con `mask-image` il file
 * fa da stampo e il colore lo mette `background: currentColor`, così il
 * marchio segue l'inchiostro della pagina in tutte e tre le lenti. È anche il
 * motivo per cui i loghi sono monocromi e non nei colori del marchio: il
 * rosso IED accanto al nero IBM farebbe della colonna un campionario.
 *
 * I marchi appartengono ai rispettivi titolari e compaiono qui per indicare
 * chi ha rilasciato il titolo, non un rapporto di partnership.
 */

export interface IssuerMark {
  /** Nome del file in `public/logos/`, senza estensione. */
  logo?: string;
  /** Il ripiego quando un logo utilizzabile non esiste. Max 8 caratteri. */
  sigla: string;
  /**
   * Altezza della gronda, quando quella di serie non basta.
   *
   * Serve perché `mask-size: contain` non guarda il marchio, guarda il file.
   * Il file IBM ha un viewBox quadrato (24×24) attorno a un lockup largo e
   * basso: dentro una gronda alta una riga il quadrato si riduce a una riga,
   * e il marchio dentro al quadrato resta alto un terzo di quello. Misurato:
   * IBM rendeva 0,45rem contro gli 1,125rem dello IED, in una colonna che
   * esiste apposta per allinearli. Alzando la gronda a 3rem il marchio torna
   * a 1,19rem — la stessa altezza dello IED, che qui è il metro.
   *
   * L'altezza in più NON allarga la riga: ci pensa il margine negativo in
   * `lab-cv.css`. Cresce il glifo, non il ritmo dell'elenco.
   */
  altezza?: string;
}

/**
 * Chiave = pezzo di nome cercato dentro `institution`/`issuer`, in minuscolo.
 * Il confronto è per sottostringa e non per uguaglianza perché i dati scrivono
 * "Istituto Europeo di Design (IED)" e "Ateneo di Bartending Planet One": la
 * forma lunga è quella giusta da mostrare, non quella giusta da confrontare.
 * L'ordine conta, vince la prima che combacia.
 */
const MARKS: readonly (readonly [string, IssuerMark])[] = [
  ["ibm", { logo: "ibm", sigla: "IBM", altezza: "3rem" }],
  ["europeo di design", { logo: "ied", sigla: "IED" }],
  ["skillup", { sigla: "SKILLUP" }],
  ["planet one", { sigla: "PLANET1" }],
  ["b-teatro", { sigla: "B-TEATRO" }],
  ["immaginazione", { sigla: "IMM-LAV" }],
  ["boselli", { sigla: "BOSELLI" }],
  ["callan", { sigla: "CALLAN" }],
];

/**
 * Il ripiego del ripiego: le prime lettere del nome. Non dovrebbe servire
 * mai, ma un ente nuovo in `cv.ts` non deve lasciare un buco nella colonna.
 */
function siglaAutomatica(nome: string): string {
  return nome
    .replace(/[^\p{L}\p{N} ]/gu, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export function issuerMark(nome: string): IssuerMark {
  const cerca = nome.toLowerCase();
  const trovato = MARKS.find(([chiave]) => cerca.includes(chiave));
  return trovato ? trovato[1] : { sigla: siglaAutomatica(nome) };
}

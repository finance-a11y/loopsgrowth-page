// Reglas de copy reutilizables (COPY-02, FND-02, INVERSION). Módulo puro y de solo lectura: recorre el
// documento ya parseado, nunca lo modifica ni cambia un `status` (el texto de Ari lo aprueba
// una persona). `check-copy.mjs` y `list-pending.mjs` comparten `walkClaims`.

/** Única marca permitida de dato faltante; bloquea producción en el YAML y en `dist`. */
export const MISSING_MARK = 'FALTA CONFIRMAR';

/** Claves permitidas en una reclamación: `text` y `status` más los metadatos `confirm_by` y `reason`. */
export const CLAIM_KEYS = ['text', 'status', 'confirm_by', 'reason'];
const META_KEYS = ['confirm_by', 'reason'];
export const STATUSES = ['verified', 'pending'];

// Lista de PITFALLS.md ampliada con las formas de "vos" más comunes en imperativo, en trato directo
// y en presente de indicativo, con y sin pronombre enclítico (llamanos, hablanos, dejanos).
// Es una lista cerrada: una forma que no esté aquí no se detecta. Ampliarla cuando aparezca una nueva.

// Imperativos de vos (con tilde final). Además de ser formas propias, son la base de las formas con
// enclítico: quitar la tilde y añadir el pronombre da "consultanos", "hacelo", "probalo", "pedile".
// Esas formas sin tilde no existen en el español neutro (el imperativo de tú lleva tilde y otra
// vocal: "consúltanos", "hazlo"), así que marcarlas no toca copy legítimo.
const VOSEO_IMPERATIVES = [
  'hacé', 'agendá', 'escribí', 'llená', 'descubrí', 'empezá', 'mirá', 'reservá', 'descargá',
  'conocé', 'completá', 'solicitá', 'pedí', 'consultá', 'elegí', 'probá', 'comenzá', 'aprovechá',
  'ingresá', 'seleccioná', 'enviá', 'dejá', 'vení', 'andá', 'poné', 'mandá', 'resolvé', 'comprá',
  'vendé', 'pagá', 'activá', 'encontrá', 'aprendé', 'creá', 'mejorá', 'potenciá', 'contá', 'cotizá',
  'contactá', 'sabé', 'hablá', 'llamá', 'avisá', 'ayudá', 'mostrá', 'visitá', 'usá', 'buscá',
  'pensá', 'decí', 'esperá', 'tomá', 'bajá', 'generá', 'optimizá', 'analizá', 'diseñá', 'armá',
  'ganá', 'crecé', 'posicioná', 'cambiá', 'traé', 'sumá', 'cuidá', 'leé',
];

// Pronombres enclíticos de los imperativos de vos: "-nos", "-me", "-te", "-lo", "-la", "-le".
const VOSEO_ENCLITICS = ['nos', 'me', 'te', 'lo', 'la', 'le'];

// Palabras reales que coinciden con un imperativo + enclítico generado y no son voseo: inglés
// (create, activate, generate, mandate), "tomate", "mandala", "generala" y "andale" (interjección
// mexicana sin tilde). Si una forma generada choca con una palabra legítima, se añade aquí.
const VOSEO_ENCLITIC_EXCEPTIONS = ['create', 'activate', 'generate', 'mandate', 'tomate', 'mandala', 'generala', 'andale'];

const stripFinalAccent = (word) => word.replace(/[áéíóú]$/u, (c) => 'aeiou'['áéíóú'.indexOf(c)]);

// Formas propias que no salen de un imperativo de la lista anterior.
const VOSEO_OTHER = [
  'vos', 'tenés', 'querés', 'podés', 'sabés', 'sos', 'necesitás', 'contanos', 'contactanos',
  'escribinos', 'registrate', 'sumate',
  // Con pronombre enclítico (reflexivos y de verbos sin imperativo listado)
  'llamanos', 'hablanos', 'dejanos', 'avisanos', 'ayudanos', 'mostranos', 'seguinos', 'visitanos',
  'cotizanos', 'unite', 'animate', 'anotate', 'inscribite', 'quedate', 'fijate', 'acordate',
  'olvidate',
  // Presente de indicativo
  'hacés', 'pensás', 'buscás', 'vendés', 'decís', 'preferís', 'elegís', 'vivís', 'sentís', 'creés',
  'pagás', 'ganás', 'gastás', 'conocés', 'encontrás', 'obtenés', 'recibís', 'lográs',
];

export const VOSEO_WORDS = [
  ...new Set([
    ...VOSEO_OTHER,
    ...VOSEO_IMPERATIVES,
    ...VOSEO_IMPERATIVES.flatMap((word) => VOSEO_ENCLITICS.map((clitic) => `${stripFinalAccent(word)}${clitic}`)),
  ]),
].filter((word) => !VOSEO_ENCLITIC_EXCEPTIONS.includes(word));

// `SOS` en mayúsculas es una sigla ("Llamada SOS"), no el verbo: "sos" se marca solo en minúscula
// ("si sos dueño") o con mayúscula inicial ("¿Sos dueño?"), sin la bandera `i`. Límite conocido:
// un titular todo en mayúsculas ("¿SOS DUEÑO?") se confunde con la sigla y no se detecta.
const CASE_SENSITIVE_VOSEO = ['sos', 'Sos'];

/**
 * Texto que las reglas de contenido evalúan: NFC (un pegado desde macOS o Google Docs puede traer
 * la vocal acentuada descompuesta) y sin caracteres invisibles (espacio de ancho cero, guion
 * blando, unión de palabra) que partirían una palabra sin que se vea.
 * @param {string} text
 */
export const cleanText = (text) => text.normalize('NFC').replace(/[\u00AD\u200B-\u200D\u2060\uFEFF]/gu, '');

// Límites Unicode con lookarounds de largo fijo. `\b` de JavaScript es ASCII: no ve el límite
// tras una vocal acentuada final (agendá, llená, tenés). Alternación simple de palabras: sin
// retroceso catastrófico.
const NOT_WORD_BEFORE = '(?<![\\p{L}\\p{N}_])';
const NOT_WORD_AFTER = '(?![\\p{L}\\p{N}_])';
const voseoPattern = (words) => `${NOT_WORD_BEFORE}(?:${words.join('|')})${NOT_WORD_AFTER}`;
const VOSEO_RE = new RegExp(
  voseoPattern(VOSEO_WORDS.filter((w) => !CASE_SENSITIVE_VOSEO.includes(w))),
  'giu',
);
const VOSEO_CASE_RE = new RegExp(voseoPattern(CASE_SENSITIVE_VOSEO), 'gu');
const AEO_RE = new RegExp(`${NOT_WORD_BEFORE}AEO${NOT_WORD_AFTER}`, 'giu');
// Marca de verificación del doc de Ari: `[VERIFICAR]`, `[VERIFICAR rango]` o `[VERIFICAR: nota]` (la
// nota puede traer paréntesis y saltos de línea). El corchete de cierre es opcional: una marca sin
// cerrar también bloquea. Lineal: una clase negada seguida de un `]` opcional, sin cuantificadores anidados.
const VERIFICAR_RE = /\[VERIFICAR[^\]]*\]?/gi;
const DASH_RE = /[—–]/g;

// INVERSION (hallazgo 6 del UI-SPEC y CONTEXT). El doc de Ari trae rangos de inversión mensual (4 a 5k
// al mes, 1.5k al mes, +1500 al mes) que sirven para pre-calificar al cliente, no para mostrarlos. Ari no los
// aprobó como texto público: en `for_whom.*` y `faq.*` una afirmación que NO está `verified` no puede
// llevar una cifra de inversión. Cuando Ari (una persona) apruebe una cifra, pasa a `verified` y la regla
// deja de marcarla; esta guarda no aprueba nada. Alcance: solo esas dos rutas, solo cifras escritas con
// dígitos (no "cuatro mil") y monto mensual o en moneda. La facturación anual ("USD 200k o más al año",
// "200k al año") y los plazos ("6-12 meses", "2 veces al mes") no son inversión. Lista abierta como las demás.

/** Rutas donde la guarda INVERSION revisa afirmaciones que no están `verified`. */
export const INVERSION_PATH_PREFIXES = ['for_whom.', 'faq.'];

// No sigue una letra, un dígito ni un decimal: impide que el retroceso de la expresión recorte "200k" a "200" o "20".
const NOT_NUMBER_AFTER = '(?![\\p{L}\\p{N}_]|[.,]\\p{N})';
// Monto "grande": miles por punto o coma (2,000), sufijo k o mil (5k, 1.5k, 5 mil) o 3 dígitos o más (1500).
const BIG_AMOUNT = '(?:\\d{1,3}(?:[.,]\\d{3})+(?:[.,]\\d+)?|\\d+(?:[.,]\\d+)?\\s?(?:k|mil)|\\d{3,}(?:[.,]\\d+)?)';
// Primer monto de un rango ("4 a 5k"): cualquier numero, con o sin sufijo.
const ANY_AMOUNT = '\\d+(?:[.,]\\d+)?(?:\\s?(?:k|mil))?';
const MONEY_WORD = '(?:USD|US\\$|\\$|dólares|dolares|pesos|MXN|COP|EUR|euros)';
const MONTHLY_TAIL = '(?:al\\s+mes|por\\s+mes|mensuales?|/\\s?mes)';
// Un monto (o un rango) seguido, con moneda opcional, de una expresión mensual.
export const INVERSION_MONTHLY_RE = new RegExp(
  `${NOT_WORD_BEFORE}(?:${ANY_AMOUNT}\\s*(?:a|-|y|hasta)\\s*)?${BIG_AMOUNT}${NOT_NUMBER_AFTER}(?:\\s*${MONEY_WORD}${NOT_WORD_AFTER})?\\s*${MONTHLY_TAIL}${NOT_WORD_AFTER}`,
  'giu',
);
// Moneda con un monto ("USD 1500", "desde $2,000"), salvo que sea una cifra anual ("USD 200k o más al año").
export const INVERSION_CURRENCY_RE = new RegExp(
  `(?:(?<![\\p{L}\\p{N}_])(?:USD|US\\$)|\\$)\\s?\\d+(?:[.,]\\d{3})*(?:[.,]\\d+)?(?:\\s?(?:k|mil))?${NOT_NUMBER_AFTER}(?!\\s*(?:o\\s+más\\s+)?(?:al\\s+año|anual(?:es)?)${NOT_WORD_AFTER})`,
  'giu',
);

/**
 * Extractos de `text` donde aparece una cifra de inversión (mensual o en moneda).
 * @param {string} text
 */
export function findInversion(text) {
  const clean = cleanText(text);
  return [...matchesOf(INVERSION_MONTHLY_RE, clean), ...matchesOf(INVERSION_CURRENCY_RE, clean)];
}

const inInversionScope = (path) => INVERSION_PATH_PREFIXES.some((prefix) => path.startsWith(prefix));

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

/** Extracto corto alrededor de una coincidencia, en una sola línea. */
function excerpt(text, index, length) {
  const start = Math.max(0, index - 24);
  const end = Math.min(text.length, index + length + 24);
  const body = text.slice(start, end).replace(/\s+/g, ' ');
  return `${start > 0 ? '...' : ''}${body}${end < text.length ? '...' : ''}`;
}

function matchesOf(re, text) {
  re.lastIndex = 0;
  const out = [];
  for (const m of text.matchAll(re)) out.push(excerpt(text, m.index, m[0].length));
  return out;
}

// Sin distinguir mayúsculas y con cualquier espacio (varios, NBSP, U+2009...) entre las dos palabras.
const MISSING_RE = /falta\s+confirmar/giu;

/**
 * Extractos donde aparece `MISSING_MARK`, sin importar mayúsculas ni el tipo o la cantidad de
 * espacios (también `&nbsp;` en HTML). Lo reutiliza el modo `--dist`. @param {string} text
 */
export function findMissingMark(text) {
  const normalized = cleanText(text).replace(/&(?:nbsp|#160|#xa0);/gi, ' ');
  return matchesOf(MISSING_RE, normalized);
}

/** Únicas variables que `fill()` de `src/lib/content.ts` sabe sustituir. */
export const PLACEHOLDER_VARS = ['term', 'duration'];

/**
 * Rutas cuyo texto puede llevar `{term}` o `{duration}` porque la página lo pasa por `fill()`.
 * Además, toda clave que termina en `_template`. Un componente que imprima un texto en bruto
 * (`.text` directo) nunca debe recibir una llave: al añadir una ruta aquí, hay que rellenarla
 * con `fill()` en el componente que la usa.
 */
export const PLACEHOLDER_PATHS = ['hero.subtitle', 'agenda.intro'];

const allowsPlaceholders = (path) => path.endsWith('_template') || PLACEHOLDER_PATHS.includes(path);

/**
 * Problemas de llaves en un texto: llaves sin pareja, variables que `fill()` no conoce y
 * cualquier llave en una ruta que no pasa por `fill()`. @param {string} text @param {string} path
 * @returns {string[]}
 */
function placeholderProblems(text, path) {
  const problems = [];
  const stripped = text.replace(/\{[^{}]*\}/g, (m) => {
    const name = m.slice(1, -1);
    if (!PLACEHOLDER_VARS.includes(name)) {
      problems.push(`Variable desconocida ${m}: las únicas válidas son ${PLACEHOLDER_VARS.map((v) => `{${v}}`).join(' y ')}`);
    } else if (!allowsPlaceholders(path)) {
      problems.push(`Placeholder ${m} en un texto que la página imprime sin fill(): llegaría literal al visitante`);
    }
    return '';
  });
  if (/[{}]/.test(stripped)) problems.push('Llave { o } sin pareja en el texto');
  return problems;
}

const isClaimObject = (node) => isPlainObject(node) && ('text' in node || 'status' in node);

/**
 * Recorre cada sección bajo las claves de idioma de nivel superior (hoy `es`) y devuelve un
 * nodo por reclamación (`kind: 'claim'`) o por texto suelto (`kind: 'bare'`). La sección
 * `config` de primer nivel no es copy (URL y similares) y se ignora. Los nodos salen en el
 * orden del documento; la ruta con puntos no incluye la clave de idioma (`hero.h1`).
 * @param {unknown} doc
 * @returns {Array<{ path: string, kind: 'claim' | 'bare', lang: string, claim?: Record<string, unknown>, value?: unknown }>}
 */
export function walkClaims(doc) {
  const nodes = [];
  if (!isPlainObject(doc)) return nodes;

  const visit = (node, path, lang) => {
    if (isClaimObject(node)) {
      nodes.push({ path, kind: 'claim', lang, claim: node });
    } else if (isPlainObject(node)) {
      for (const [key, child] of Object.entries(node)) visit(child, path ? `${path}.${key}` : key, lang);
    } else if (Array.isArray(node)) {
      node.forEach((child, i) => visit(child, `${path}[${i}]`, lang));
    } else {
      nodes.push({ path, kind: 'bare', lang, value: node });
    }
  };

  for (const [lang, sections] of Object.entries(doc)) {
    if (!isPlainObject(sections)) {
      nodes.push({ path: lang, kind: 'bare', lang, value: sections });
      continue;
    }
    for (const [section, child] of Object.entries(sections)) {
      if (section === 'config') continue;
      visit(child, section, lang);
    }
  }
  return nodes;
}

const nonEmptyString = (v) => typeof v === 'string' && v.trim() !== '';

/**
 * Valida el YAML. `structural` (BARE_STRING, BAD_STATUS, EMPTY_TEXT, BAD_KEY, BAD_META, PLACEHOLDER, INVALID_DOC)
 * es el contrato de FND-02 y falla en cualquier entorno. `content` (PENDING, MISSING, VERIFICAR,
 * VOSEO, DASH, AEO, INVERSION) solo bloquea en producción. `confirm_by` y `reason` son metadatos: no se
 * escanean con las reglas de contenido.
 * @param {unknown} doc
 */
export function checkCopy(doc) {
  const structural = [];
  const content = [];
  let verified = 0;
  let pending = 0;

  if (!isPlainObject(doc)) {
    structural.push({ rule: 'INVALID_DOC', path: '', excerpt: 'El documento no es un objeto YAML' });
    return { structural, content, verified, pending };
  }

  for (const node of walkClaims(doc)) {
    if (node.kind === 'bare') {
      structural.push({
        rule: 'BARE_STRING',
        path: node.path,
        excerpt: `Valor fuera de una reclamación {text, status}: ${String(node.value).slice(0, 60)}`,
      });
      continue;
    }

    const { claim, path } = node;
    for (const key of Object.keys(claim)) {
      if (!CLAIM_KEYS.includes(key)) {
        structural.push({ rule: 'BAD_KEY', path, excerpt: `Clave no permitida: ${key}` });
      }
    }
    for (const key of META_KEYS) {
      if (key in claim && !nonEmptyString(claim[key])) {
        structural.push({ rule: 'BAD_META', path, excerpt: `${key} debe ser una cadena no vacía` });
      }
    }
    const statusOk = STATUSES.includes(claim.status);
    if (!statusOk) {
      structural.push({ rule: 'BAD_STATUS', path, excerpt: `status inválido: ${String(claim.status)}` });
    } else if (claim.status === 'verified') {
      verified += 1;
    } else {
      pending += 1;
    }
    if (!nonEmptyString(claim.text)) {
      structural.push({ rule: 'EMPTY_TEXT', path, excerpt: 'text vacío o de solo espacios' });
      continue;
    }

    const text = cleanText(claim.text);
    for (const problem of placeholderProblems(text, path)) {
      structural.push({ rule: 'PLACEHOLDER', path, excerpt: problem });
    }
    if (claim.status === 'pending') {
      content.push({ rule: 'PENDING', path, excerpt: text.length > 60 ? `${text.slice(0, 60)}...` : text });
    }
    for (const ex of findMissingMark(text)) content.push({ rule: 'MISSING', path, excerpt: ex });
    for (const ex of matchesOf(VERIFICAR_RE, text)) content.push({ rule: 'VERIFICAR', path, excerpt: ex });
    for (const ex of matchesOf(VOSEO_RE, text)) content.push({ rule: 'VOSEO', path, excerpt: ex });
    for (const ex of matchesOf(VOSEO_CASE_RE, text)) content.push({ rule: 'VOSEO', path, excerpt: ex });
    for (const ex of matchesOf(DASH_RE, text)) content.push({ rule: 'DASH', path, excerpt: ex });
    for (const ex of matchesOf(AEO_RE, text)) content.push({ rule: 'AEO', path, excerpt: ex });
    if (claim.status !== 'verified' && inInversionScope(path)) {
      for (const ex of findInversion(text)) content.push({ rule: 'INVERSION', path, excerpt: ex });
    }
  }

  return { structural, content, verified, pending };
}

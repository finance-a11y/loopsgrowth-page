/**
 * Catálogo de las 32 mesas del vectorial oficial de Ari (el `.ai`, un PDF de 32 páginas).
 *
 * Cada mesa es una versión oficial del logo sobre un fondo; la página no recolorea ninguna: el
 * componente `Logo` elige la mesa que corresponde al tono de la superficie donde va. Aquí no hay
 * hex: `fg` es el nombre de un token primitivo de `src/styles/tokens.css` (`purple` o `cream`), el
 * color principal del arte (el aro exterior en isotipo y ojo). La razón `ratio` es `fg` contra la
 * superficie del tono, medida con `contrastRaw`, y la guarda `tests/guards/brand-assets.test.mjs`
 * la recalcula en cada corrida.
 *
 * Umbrales: 4.5 para logotipos con texto, 3 para isotipos y ojos (elementos gráficos).
 *
 * Excepción de marca (mesas 17 y 22, isotipo y ojo sobre oscuro): el aro exterior morado mide 1.88
 * contra el fondo oscuro; la figura se lee por el anillo crema (14.37), el iris y la pupila, y el
 * logo lleva nombre accesible aparte. Es arte oficial de Ari, no un relleno dibujado aquí. Queda
 * registrada para el `EXCEPTIONS.md` de la fase 3 (dueño, aprobador, seguimiento y vencimiento).
 *
 * Mesas sin extraer: 15, cada una con su motivo en `reason`. Un tono sin mesa oficial lanza un
 * error en `resolveLogo` (no se inventa una versión recoloreada).
 */

/** Tonos de la página que tienen superficie propia, en el orden de la hoja de revisión. */
export const LOGO_TONES = ['light', 'yellow', 'dark', 'purple'];

/** Variantes de logo, en el orden en que la hoja de revisión las muestra. */
export const LOGO_VARIANTS = ['apilado', 'horizontal', 'imagotipo', 'emblema', 'isotipo', 'ojo'];

/** Alto mínimo en px por variante (UI-SPEC: 32 y 24; apilado y emblema los fija el plan 02-09). */
export const MIN_HEIGHT_PX = { horizontal: 32, imagotipo: 32, apilado: 48, emblema: 96, isotipo: 24, ojo: 24 };

const EXCEPTION_DARK =
  'El aro exterior morado mide 1.88 contra el fondo oscuro; la figura se lee por el anillo crema, el iris y la pupila. Arte oficial de Ari.';

/**
 * @typedef {object} Artboard
 * @property {number} n Número de mesa en el `.ai` (1 a 32).
 * @property {string} variant Variante del logo.
 * @property {string} bg Fondo de la mesa en el `.ai`.
 * @property {string | null} tone Tono de la página al que sirve, o null si no se extrae.
 * @property {boolean} use Si se extrajo como SVG.
 * @property {string} [file] Nombre del archivo sin extensión en `src/assets/brand`.
 * @property {string} [fg] Token del color principal del arte (`purple` o `cream`).
 * @property {number} [ratio] Contraste medido de `fg` contra la superficie del tono.
 * @property {number} [min] Umbral que aplica a la variante.
 * @property {string} [exception] Excepción de marca escrita, si `ratio` queda bajo `min`.
 * @property {string} [reason] Motivo por el que la mesa no se extrae.
 */

/** @param {number} n @param {string} variant @param {string} bg @param {string} tone @param {string} file @param {string} fg @param {number} ratio @param {number} min @param {string} [exception] @returns {Artboard} */
const used = (n, variant, bg, tone, file, fg, ratio, min, exception) => ({
  n, variant, bg, tone, use: true, file, fg, ratio, min, ...(exception ? { exception } : {}),
});

/** @param {number} n @param {string} variant @param {string} bg @param {string} reason @returns {Artboard} */
const skipped = (n, variant, bg, reason) => ({ n, variant, bg, tone: null, use: false, reason });

const CREAM_REASON =
  'Fondo crema: el crema es un token de superficie de apoyo, no un tono de la página (mide 1.12 contra el blanco).';
const ORANGE_REASON = 'Fondo naranja: el naranja nunca es fondo de sección (UI-SPEC).';
const MONO_REASON = 'Un solo color: mismo trazo que la mesa 1 en un solo color; la página usa la mesa 1.';

/** @type {Artboard[]} */
export const ARTBOARDS = [
  used(1, 'apilado', 'blanco', 'light', 'apilado-01-blanco', 'purple', 8.55, 4.5),
  skipped(2, 'apilado', 'crema', CREAM_REASON),
  used(3, 'apilado', 'morado', 'purple', 'apilado-03-morado', 'cream', 7.63, 4.5),
  skipped(4, 'apilado', 'naranja', `${ORANGE_REASON} Trae amarillo sobre naranja (1.84).`),
  used(5, 'apilado', 'amarillo', 'yellow', 'apilado-05-amarillo', 'purple', 5.43, 4.5),
  used(6, 'horizontal', 'blanco', 'light', 'horizontal-06-blanco', 'purple', 8.55, 4.5),
  used(7, 'imagotipo', 'blanco', 'light', 'imagotipo-07-blanco', 'purple', 8.55, 4.5),
  used(8, 'apilado', 'oscuro', 'dark', 'apilado-08-oscuro', 'cream', 14.37, 4.5),
  skipped(9, 'apilado', 'blanco', `Apilado en un solo color oscuro. ${MONO_REASON}`),
  used(10, 'emblema', 'blanco', 'light', 'emblema-10-blanco', 'purple', 8.55, 4.5),
  skipped(11, 'emblema', 'crema', CREAM_REASON),
  used(12, 'emblema', 'morado', 'purple', 'emblema-12-morado', 'cream', 7.63, 4.5),
  used(13, 'isotipo', 'blanco', 'light', 'isotipo-13-blanco', 'purple', 8.55, 3),
  used(14, 'isotipo', 'morado', 'purple', 'isotipo-14-morado', 'cream', 7.63, 3),
  skipped(15, 'isotipo', 'naranja', ORANGE_REASON),
  used(16, 'isotipo', 'amarillo', 'yellow', 'isotipo-16-amarillo', 'purple', 5.43, 3),
  used(17, 'isotipo', 'oscuro', 'dark', 'isotipo-17-oscuro', 'purple', 1.88, 3, EXCEPTION_DARK),
  used(18, 'ojo', 'blanco', 'light', 'ojo-18-blanco', 'purple', 8.55, 3),
  used(19, 'ojo', 'morado', 'purple', 'ojo-19-morado', 'cream', 7.63, 3),
  skipped(20, 'ojo', 'naranja', ORANGE_REASON),
  used(21, 'ojo', 'amarillo', 'yellow', 'ojo-21-amarillo', 'purple', 5.43, 3),
  used(22, 'ojo', 'oscuro', 'dark', 'ojo-22-oscuro', 'purple', 1.88, 3, EXCEPTION_DARK),
  skipped(23, 'emblema', 'naranja', `${ORANGE_REASON} Trae amarillo sobre naranja (1.84).`),
  used(24, 'emblema', 'amarillo', 'yellow', 'emblema-24-amarillo', 'purple', 5.43, 4.5),
  skipped(25, 'emblema', 'oscuro', 'Texto morado sobre oscuro mide 1.88; se pide a Ari una versión con texto crema (la mesa 12 sirve de referencia).'),
  skipped(26, 'isotipo', 'crema', CREAM_REASON),
  skipped(27, 'ojo', 'crema', CREAM_REASON),
  skipped(28, 'apilado', 'morado', 'Apilado monocromo morado: mismos 11 trazos y un solo relleno que la mesa 1.'),
  skipped(29, 'apilado', 'naranja', `Apilado monocromo naranja. ${ORANGE_REASON} Naranja sobre blanco mide 2.89.`),
  skipped(30, 'apilado', 'amarillo', 'Apilado monocromo amarillo: amarillo sobre claro mide 1.58.'),
  skipped(31, 'apilado', 'negro', `Apilado en negro. ${MONO_REASON}`),
  skipped(32, 'apilado', 'crema', `Apilado monocromo crema: mide 1.12 sobre blanco; sobre oscuro y morado ya existen las mesas 8 y 3.`),
];

/**
 * Tonos con mesa oficial para una variante, en el orden de `LOGO_TONES`.
 * @param {string} variant
 * @returns {string[]}
 */
export function availableTones(variant) {
  return LOGO_TONES.filter((tone) => ARTBOARDS.some((b) => b.use && b.variant === variant && b.tone === tone));
}

/**
 * Devuelve la mesa oficial de una variante sobre un tono. No recolorea: si no existe, lanza.
 * @param {string} variant
 * @param {string} tone
 * @returns {Artboard}
 */
export function resolveLogo(variant, tone) {
  if (!LOGO_VARIANTS.includes(variant)) {
    throw new Error(`Variante de logo desconocida: "${variant}" (válidas: ${LOGO_VARIANTS.join(', ')}).`);
  }
  if (!LOGO_TONES.includes(tone)) {
    throw new Error(`Tono desconocido: "${tone}" (válidos: ${LOGO_TONES.join(', ')}).`);
  }
  const board = ARTBOARDS.find((b) => b.use && b.variant === variant && b.tone === tone);
  if (!board) {
    throw new Error(
      `El logo "${variant}" no tiene mesa oficial para el tono "${tone}" (disponibles: ${availableTones(variant).join(', ')}). No se recolorea: usa una variante con mesa oficial.`,
    );
  }
  return board;
}

// Loopy oficial para el collage (plan 02-10). ESM plano con JSDoc: lo importan Astro, `node --test`
// y Playwright. La geometría sale de las fuentes de `src/assets/loopy` (mesas 13, 14, 18 y 19 del .ai
// de Ari, con las rutas sin unir): un solo dibujo y dos esquemas de color. En el esquema A el aro
// exterior y el mango son morados y el anillo es crema; en el B es al revés. Iris, pupila y brillo
// son iguales en ambos. El arte no se modifica: solo se elige cuál de los dos colores oficiales va
// en cada rol, igual que en las mesas. Ningún color se escribe aquí: los hex llegan de los archivos.
import { readFileSync } from 'node:fs';
import { parseTokens } from '../../../scripts/lib/contrast.mjs';
import { resolveLogo } from '../brand/logo-variants.mjs';

/** @typedef {'ojos' | 'lupa'} LoopyKind */
/** @typedef {'A' | 'B'} LoopyScheme */
/** @typedef {'frame' | 'rim' | 'iris' | 'pupil' | 'glint'} LoopyRole */

/** Ojos es el isotipo de dos ojos con lupa; lupa es el de un ojo con lupa. */
export const LOOPY_KINDS = Object.freeze({
  ojos: Object.freeze({ variant: 'isotipo', paths: 11 }),
  lupa: Object.freeze({ variant: 'ojo', paths: 6 }),
});

/** Rol de cada ruta, en el orden del arte (aro, anillo, iris, pupila, brillo, mango). */
export const LOOPY_ROLES = Object.freeze({
  ojos: Object.freeze(['frame', 'frame', 'rim', 'iris', 'pupil', 'glint', 'rim', 'iris', 'pupil', 'glint', 'frame']),
  lupa: Object.freeze(['frame', 'rim', 'iris', 'pupil', 'glint', 'frame']),
});

const D_CHARS = /^[MmLlHhVvCcSsQqTtAaZz0-9.,\s-]+$/;

/**
 * Lee un SVG de Loopy. Acepta solo `svg` con viewBox y elementos `path` con `fill` y `d`; cualquier
 * otro elemento, atributo o carácter fuera de la lista lanza un Error en español.
 * @param {string} svgText
 * @returns {{ viewBox: number[], paths: { fill: string, d: string }[] }}
 */
export function parsePaths(svgText) {
  const elements = [...svgText.matchAll(/<([a-zA-Z][\w:-]*)/g)].map((m) => m[1]);
  for (const el of elements) {
    if (el !== 'svg' && el !== 'path') throw new Error(`Loopy: el elemento <${el}> no está permitido (solo svg y path).`);
  }
  const root = svgText.match(/<svg\b[^>]*>/)?.[0] ?? '';
  const vbText = root.match(/\sviewBox="([^"]+)"/)?.[1];
  const viewBox = vbText?.trim().split(/[\s,]+/).map(Number) ?? [];
  if (viewBox.length !== 4 || viewBox.some((n) => !Number.isFinite(n))) throw new Error('Loopy: el svg no trae un viewBox de cuatro números.');
  const paths = [];
  for (const m of svgText.matchAll(/<path\b([^>]*?)\/?>/g)) {
    const attrs = [...m[1].matchAll(/\s([\w:-]+)="([^"]*)"/g)];
    for (const [, name] of attrs) {
      if (name !== 'fill' && name !== 'd') throw new Error(`Loopy: el atributo ${name} no está permitido en un path.`);
    }
    const fill = attrs.find((a) => a[1] === 'fill')?.[2] ?? '';
    const d = attrs.find((a) => a[1] === 'd')?.[2] ?? '';
    if (!/^#[0-9a-fA-F]{6}$/.test(fill)) throw new Error(`Loopy: fill "${fill}" no es un hexadecimal de seis dígitos.`);
    if (!D_CHARS.test(d)) throw new Error('Loopy: el atributo d trae caracteres fuera de la lista.');
    paths.push({ fill: fill.toLowerCase(), d });
  }
  if (paths.length === 0) throw new Error('Loopy: el svg no trae rutas.');
  return { viewBox, paths };
}

function assertKind(kind) {
  if (!LOOPY_KINDS[kind]) throw new Error(`Loopy desconocido: "${kind}" (válidos: ${Object.keys(LOOPY_KINDS).join(', ')}).`);
}

/**
 * Esquema de color que le toca a Loopy sobre un tono de fondo: A sobre light y yellow, B sobre purple.
 * @param {LoopyKind} kind
 * @param {string} tone
 * @returns {LoopyScheme}
 */
export function loopyScheme(kind, tone) {
  assertKind(kind);
  if (tone === 'dark') throw new Error('Loopy no va directo sobre oscuro: ponlo sobre un escenario morado o amarillo.');
  const board = resolveLogo(LOOPY_KINDS[kind].variant, tone);
  return board.fg === 'purple' ? 'A' : 'B';
}

/** @type {Map<string, { viewBox: number[], parts: { role: LoopyRole, d: string, fill?: string }[], frameFills: Record<string, string> }>} */
const cache = new Map();
const sourceOf = (kind, tone) => readFileSync(`src/assets/loopy/${resolveLogo(LOOPY_KINDS[kind].variant, tone).file}.svg`, 'utf8');

/**
 * Geometría de Loopy: viewBox del arte y partes con rol, ruta y (solo iris, pupila y brillo) el
 * relleno oficial. Comprueba que los esquemas A y B tengan las mismas rutas, y lanza si difieren.
 * @param {LoopyKind} kind
 */
export function loopyGeometry(kind) {
  assertKind(kind);
  const hit = cache.get(kind);
  if (hit) return hit;
  const a = parsePaths(sourceOf(kind, 'light'));
  const b = parsePaths(sourceOf(kind, 'purple'));
  const roles = LOOPY_ROLES[kind];
  if (a.paths.length !== roles.length || b.paths.length !== roles.length) {
    throw new Error(`Loopy ${kind}: se esperaban ${roles.length} rutas y hay ${a.paths.length} y ${b.paths.length}.`);
  }
  if (a.viewBox.join(' ') !== b.viewBox.join(' ')) throw new Error(`Loopy ${kind}: el viewBox de A y B difiere.`);
  a.paths.forEach((p, i) => {
    if (p.d !== b.paths[i].d) throw new Error(`Loopy ${kind}: la ruta ${i} de A y B difiere.`);
    const fixed = roles[i] !== 'frame' && roles[i] !== 'rim';
    if (fixed && p.fill !== b.paths[i].fill) throw new Error(`Loopy ${kind}: el relleno de ${roles[i]} (ruta ${i}) cambia entre esquemas.`);
    if (!fixed && p.fill === b.paths[i].fill) throw new Error(`Loopy ${kind}: el rol ${roles[i]} (ruta ${i}) no se intercambia entre esquemas.`);
  });
  const geometry = {
    viewBox: a.viewBox,
    parts: a.paths.map((p, i) => ({ role: roles[i], d: p.d, ...(roles[i] === 'frame' || roles[i] === 'rim' ? {} : { fill: p.fill }) })),
    frameFills: { A: a.paths[roles.indexOf('frame')].fill, B: b.paths[roles.indexOf('frame')].fill },
  };
  cache.set(kind, geometry);
  return geometry;
}

/**
 * Colores de aro y anillo de un esquema, como nombre de token (purple o cream), comprobados contra el
 * hex de tokens.css y del archivo oficial. Lanza si un hex no es un primitivo de marca.
 * @param {LoopyKind} kind
 * @param {LoopyScheme} scheme
 * @returns {{ frame: 'purple' | 'cream', rim: 'purple' | 'cream' }}
 */
export function schemeColors(kind, scheme) {
  if (scheme !== 'A' && scheme !== 'B') throw new Error(`Loopy: el esquema "${scheme}" no existe (A o B).`);
  const { theme } = parseTokens(readFileSync('src/styles/tokens.css', 'utf8'));
  const named = (hex) => {
    const name = ['purple', 'cream'].find((n) => theme[`--color-brand-${n}`]?.toLowerCase() === hex);
    if (!name) throw new Error(`Loopy ${kind}: el color ${hex} del aro o del anillo no es un primitivo de marca.`);
    return name;
  };
  const source = parsePaths(sourceOf(kind, scheme === 'A' ? 'light' : 'purple'));
  const roles = LOOPY_ROLES[kind];
  return { frame: named(source.paths[roles.indexOf('frame')].fill), rim: named(source.paths[roles.indexOf('rim')].fill) };
}

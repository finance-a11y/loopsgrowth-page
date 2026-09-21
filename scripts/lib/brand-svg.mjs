/**
 * Limpieza de una mesa del `.ai` de Ari convertida a SVG con `pdftocairo` (plan 02-09, tarea 2).
 *
 * Es una función pura, sin acceso a disco ni a procesos, para poder probarla con cadenas. Lo que
 * hace: quita la declaración XML, todos los `<rect>` (fondo de la mesa; la mesa 24 trae tres),
 * `width`, `height` y `xmlns:xlink` de la raíz, y pasa cada `fill="rgb(p%, p%, p%)"` a hex en
 * minúsculas. Un color que difiere en 2 canales o menos de uno oficial se ajusta a ese (el crema de
 * algunas mesas sale de Illustrator como #f4f3e1); uno más lejano lanza, porque una mesa con un
 * color ajeno a la marca no debe entrar al repositorio. SVGO y la medición del `viewBox` los hace
 * `scripts/brand/extract-artboards.mjs`.
 */

/** Colores oficiales del brandbook más iris y pupila de los ojos, en hex minúsculas. */
export const OFFICIAL_COLORS = {
  purple: '#4228d1',
  cream: '#f4f3e0',
  orange: '#fd6938',
  yellow: '#ffc602',
  dark: '#212121',
  iris: '#6c61db',
  pupil: '#1e1e1e',
};

const OFFICIAL_LIST = Object.values(OFFICIAL_COLORS);
const SNAP_TOLERANCE = 2;

/** @param {string} hex @returns {number[]} */
const channels = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

/**
 * `rgb(25.898743%, 15.699768%, 81.999207%)` a `#4228d1`, con `Math.round(p * 255 / 100)` por canal.
 * @param {string} value
 * @returns {string | null} null si el valor no tiene forma de porcentaje
 */
export function rgbPercentToHex(value) {
  const m = value.match(/^rgb\(\s*([\d.]+)%\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*\)$/);
  if (!m) return null;
  const hex = [m[1], m[2], m[3]]
    .map((p) => Math.round((Number(p) * 255) / 100).toString(16).padStart(2, '0'))
    .join('');
  return `#${hex}`;
}

/**
 * Ajusta un hex al color oficial más cercano si cada canal difiere en 2 o menos.
 * @param {string} hex
 * @returns {string | null} el oficial, o null si ninguno está dentro de la tolerancia
 */
export function snapToOfficial(hex) {
  const own = channels(hex);
  return (
    OFFICIAL_LIST.find((official) => channels(official).every((c, i) => Math.abs(c - own[i]) <= SNAP_TOLERANCE)) ?? null
  );
}

/**
 * Deja la mesa lista para SVGO: sin fondo, sin dimensiones y con rellenos oficiales en hex.
 * @param {string} svgText SVG que produjo `pdftocairo -svg`
 * @param {number} mesa número de mesa, solo para los mensajes
 * @returns {string}
 */
export function cleanArtboard(svgText, mesa) {
  let out = svgText.replace(/<\?xml[^>]*\?>\s*/g, '');
  out = out.replace(/<rect\b[^>]*?(?:\/>|>\s*<\/rect>)/g, '');
  out = out.replace(/<svg\b[^>]*>/, (root) =>
    root.replace(/\s(?:width|height)="[^"]*"/g, '').replace(/\sxmlns:xlink="[^"]*"/g, ''),
  );
  if (/\sstroke=/.test(out)) throw new Error(`mesa ${mesa}: trae stroke; las mesas oficiales son solo rellenos.`);
  out = out.replace(/\sfill="([^"]*)"/g, (whole, value) => {
    const hex = value.startsWith('#') ? value.toLowerCase() : rgbPercentToHex(value);
    const official = hex && snapToOfficial(hex);
    if (!official) {
      throw new Error(`mesa ${mesa}: el color ${hex ?? value} está fuera de la paleta oficial (${OFFICIAL_LIST.join(', ')}).`);
    }
    return ` fill="${official}"`;
  });
  return out;
}

/** Margen del favicon por lado, como fracción del lado del lienzo (4 %). */
export const FAVICON_MARGIN = 0.04;

const round2 = (v) => Number(v.toFixed(2));

/**
 * Lee el viewBox de un SVG ya extraído.
 * @param {string} svgText
 * @returns {{ x: number, y: number, w: number, h: number }}
 */
export function readViewBox(svgText) {
  const match = svgText.match(/viewBox="([^"]+)"/);
  if (!match) throw new Error('el SVG no trae viewBox');
  const [x, y, w, h] = match[1].split(/\s+/).map(Number);
  if ([x, y, w, h].some((n) => !Number.isFinite(n)) || w <= 0 || h <= 0) throw new Error(`viewBox inválido: ${match[1]}`);
  return { x, y, w, h };
}

/**
 * Arma el favicon a partir de una mesa oficial ya extraída: mismos trazos y rellenos, con un
 * viewBox cuadrado centrado en la caja del arte y un margen de 4 % por lado (el lado es el mayor
 * de ancho y alto dividido entre 0.92). No dibuja nada nuevo.
 * @param {string} svgText SVG de `src/assets/brand`
 * @returns {string}
 */
export function buildFaviconSvg(svgText) {
  const { x, y, w, h } = readViewBox(svgText);
  const side = Math.max(w, h) / (1 - 2 * FAVICON_MARGIN);
  const vx = round2(x + w / 2 - side / 2);
  const vy = round2(y + h / 2 - side / 2);
  const viewBox = `${vx} ${vy} ${round2(side)} ${round2(side)}`;
  const out = svgText.trim().replace(/viewBox="[^"]*"/, `viewBox="${viewBox}"`);
  if (!/xmlns="http:\/\/www\.w3\.org\/2000\/svg"/.test(out)) throw new Error('el SVG no trae xmlns');
  return out;
}

/**
 * Empaqueta imágenes PNG en un `.ico` (formato ICO con PNG incrustados, en el orden dado).
 * @param {{ size: number, data: Buffer }[]} images tallas cuadradas de 1 a 255 px
 * @returns {Buffer}
 */
export function packIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  const entries = Buffer.alloc(16 * images.length);
  let offset = 6 + 16 * images.length;
  images.forEach(({ size, data }, i) => {
    if (!(size >= 1 && size <= 255)) throw new Error(`talla ${size} fuera de 1 a 255`);
    const at = i * 16;
    entries.writeUInt8(size, at);
    entries.writeUInt8(size, at + 1);
    entries.writeUInt8(0, at + 2);
    entries.writeUInt8(0, at + 3);
    entries.writeUInt16LE(1, at + 4);
    entries.writeUInt16LE(32, at + 6);
    entries.writeUInt32LE(data.length, at + 8);
    entries.writeUInt32LE(offset, at + 12);
    offset += data.length;
  });
  return Buffer.concat([header, entries, ...images.map((i) => i.data)]);
}

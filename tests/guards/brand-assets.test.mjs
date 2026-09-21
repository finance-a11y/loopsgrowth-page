import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { HTML_GZIP_MAX, HTML_RAW_MAX } from '../e2e/lib/budgets.mjs';
import {
  ALLOWED_FILLS,
  SCENE_PIECES,
  TONES,
  assertToneSafe,
  fillVar,
} from '../../src/components/collage/collage-rules.mjs';

// ---------------------------------------------------------------------------------------------
// (i) Política de color por tono, escrita aparte de la tabla que protege.
// ---------------------------------------------------------------------------------------------

// Pares (tono, color) que el contrato de marca prohíbe. Se listan a mano y no salen de la tabla.
const FORBIDDEN = [
  ['dark', 'purple'],
  ['purple', 'purple'],
  ['yellow', 'yellow'],
  ['dark', 'dark'],
  ['purple', 'dark'],
  ['yellow', 'cream'],
];

const EXPECTED_STROKE = { light: 'dark', yellow: 'dark', dark: 'white', purple: 'white' };

/** Devuelve los pares prohibidos que una tabla de rellenos deja pasar. */
function violations(table) {
  return FORBIDDEN.filter(([tone, color]) => (table[tone] ?? []).includes(color));
}

test('ninguno de los pares prohibidos está en ALLOWED_FILLS', () => {
  assert.deepEqual(violations(ALLOWED_FILLS), []);
});

test('assertToneSafe lanza en cada par prohibido y nombra pieza, tono y color', () => {
  for (const [tone, color] of FORBIDDEN) {
    assert.throws(
      () => assertToneSafe(tone, [color], 'pieza-de-prueba'),
      (error) =>
        error instanceof Error &&
        error.message.includes('pieza-de-prueba') &&
        error.message.includes(tone) &&
        error.message.includes(color),
      `${color} sobre ${tone} debería fallar`,
    );
  }
});

test('assertToneSafe acepta los rellenos permitidos y devuelve el contorno del tono', () => {
  for (const tone of TONES) {
    for (const color of ALLOWED_FILLS[tone]) {
      assert.equal(assertToneSafe(tone, [color], 'p'), EXPECTED_STROKE[tone], `${color} sobre ${tone}`);
    }
    // colores ausentes se ignoran
    assert.equal(assertToneSafe(tone, [undefined, null], 'p'), EXPECTED_STROKE[tone]);
  }
});

test('assertToneSafe rechaza un tono o un color desconocido', () => {
  assert.throws(() => assertToneSafe('neon', ['white'], 'p'), /Tono desconocido/);
  assert.throws(() => assertToneSafe('light', ['rosa'], 'p'), /Color de marca desconocido/);
  assert.throws(() => fillVar('rosa'), /Color de marca desconocido/);
});

// (ii) Mutación: la comprobación no es vacía; una tabla con un par prohibido se detecta.
test('mutación: una tabla con un par prohibido agregado es detectada', () => {
  for (const [tone, color] of FORBIDDEN) {
    const mutated = Object.fromEntries(TONES.map((t) => [t, [...ALLOWED_FILLS[t]]]));
    mutated[tone].push(color);
    assert.deepEqual(violations(mutated), [[tone, color]], `${color} sobre ${tone}`);
  }
});

// ---------------------------------------------------------------------------------------------
// (iii) Símbolos del sprite y catálogo de piezas
// ---------------------------------------------------------------------------------------------

test('el conjunto de ids del sprite es exactamente el de SCENE_PIECES, con w y h iguales al viewBox', () => {
  assert.ok(existsSync('dist/index.html'), 'Falta dist: ejecuta npx astro build antes de estas pruebas');
  const sprite = readFileSync('dist/index.html', 'utf8').match(/<svg class="collage-sprite"[\s\S]*?<\/svg>/)?.[0] ?? '';
  const symbols = [...sprite.matchAll(/<symbol id="([^"]+)" viewBox="([^"]+)"/g)].map((m) => {
    const vb = m[2].trim().split(/\s+/).map(Number);
    assert.equal(vb.length, 4, `${m[1]}: viewBox de cuatro números`);
    return { id: m[1], w: vb[2], h: vb[3] };
  });
  const ids = symbols.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length, 'ids duplicados en el sprite');
  const fresh = Object.values(SCENE_PIECES);
  assert.equal(fresh.length, 8);
  assert.equal(new Set(fresh.map((p) => p.symbol)).size, fresh.length, 'símbolos repetidos en SCENE_PIECES');
  assert.deepEqual([...ids].sort(), fresh.map((p) => p.symbol).sort());
  for (const piece of fresh) {
    const symbol = symbols.find((s) => s.id === piece.symbol);
    assert.ok(Math.abs(symbol.w - piece.w) < 0.01, `${piece.symbol}: ancho del viewBox`);
    assert.ok(Math.abs(symbol.h - piece.h) < 0.01, `${piece.symbol}: alto del viewBox`);
  }
});

// ---------------------------------------------------------------------------------------------
// (iv) Fuentes propias: sin construcciones prohibidas
// ---------------------------------------------------------------------------------------------

// Lista explícita de archivos de este plan. No se barre el directorio: la composición del hero
// (HeroCollage.astro) es de otro plan y trae sus propias reglas.
export const OWNED = [
  'src/components/collage/CollageSprite.astro',
  'src/components/collage/CollagePiece.astro',
  'src/components/collage/collage-rules.mjs',
  'src/components/brand/Logo.astro',
  'src/components/collage/loopy.mjs',
  'src/components/collage/scenes.mjs',
  'src/components/collage/CollageScene.astro',
  'src/components/collage/Pill.astro',
  'src/components/collage/HeroCollage.astro',
];

test('los cinco archivos del mecanismo de escenas existen y están en OWNED', () => {
  for (const f of ['loopy.mjs', 'scenes.mjs', 'CollageScene.astro', 'Pill.astro', 'HeroCollage.astro']) {
    const path = `src/components/collage/${f}`;
    assert.ok(existsSync(path), `falta ${path}`);
    assert.ok(OWNED.includes(path), `${path} no está en OWNED`);
  }
});

// La tarea de composiciones agrega estos dos cuando existen.
for (const extra of ['src/components/collage/AgendaCollage.astro', 'src/components/collage/Avatar.astro', 'src/components/collage/CollagePhoto.astro', 'src/components/collage/photos.mjs']) {
  if (existsSync(extra)) OWNED.push(extra);
}

const RULES = [
  { id: 'hex', re: /#[0-9a-fA-F]{3}(?![0-9a-zA-Z_-])|#[0-9a-fA-F]{6}(?![0-9a-zA-Z_-])/, bad: 'fill="#abc123"' },
  { id: 'html-crudo', re: /set:html/, bad: '<div set:html={x}></div>' },
  { id: 'animaciones', re: /@keyframes|animation|transition/, bad: '.a { transition: fill 1s; }' },
  { id: 'smil', re: /<animate|<set[\s>]/, bad: '<animateTransform />' },
  { id: 'degradados', re: /Gradient/, bad: '<linearGradient id="g" />' },
  { id: 'filtros', re: /<filter|filter\s*:/, bad: '.a { filter: blur(2px); }' },
  { id: 'texto', re: /<text[\s>]/, bad: '<text x="1">a</text>' },
  { id: 'raster', re: /<image|<img[\s>]/, bad: '<image href="a.png" />' },
  { id: 'foreignObject', re: /foreignObject/, bad: '<foreignObject></foreignObject>' },
  { id: 'script', re: /<script/, bad: '<script>1</script>' },
  { id: 'titulo', re: /<title[\s>]/, bad: '<svg><title>x</title></svg>' },
];

const CLEAN = '<svg aria-hidden="true" focusable="false"><path d="M0 0" class="lg-line"></path></svg>';

test('los archivos propios no traen construcciones prohibidas', () => {
  for (const file of OWNED) {
    const source = readFileSync(file, 'utf8');
    for (const rule of RULES) {
      if (rule.id === 'raster' && file.endsWith('CollagePhoto.astro')) continue; // única excepción (plan 02-11), solo para <Image e <img
      assert.ok(!rule.re.test(source), `${file} trae "${rule.id}"`);
    }
  }
});

test('plan 02-11: CollagePhoto.astro y photos.mjs están en OWNED y solo CollagePhoto queda exceptuado de la regla de no imágenes', () => {
  assert.ok(OWNED.includes('src/components/collage/CollagePhoto.astro'), 'CollagePhoto.astro fuera de OWNED');
  assert.ok(OWNED.includes('src/components/collage/photos.mjs'), 'photos.mjs fuera de OWNED');
  const raster = RULES.find((r) => r.id === 'raster');
  assert.ok(raster.re.test('<Image src={x} />'.replace('<Image', '<img')), 'la regla sigue detectando <img');
  assert.ok(raster.re.test('<img src="a.png">'));
  // mutación: un <img en CollageScene.astro seguiría rechazado
  const mutated = `${readFileSync('src/components/collage/CollageScene.astro', 'utf8')}<img src="a.png">`;
  assert.ok(raster.re.test(mutated));
  assert.ok(/<Image|<img/.test(readFileSync('src/components/collage/CollagePhoto.astro', 'utf8')));
  for (const file of OWNED.filter((f) => !f.endsWith('CollagePhoto.astro'))) {
    assert.ok(!/<Image[\s>]|<img[\s>]/.test(readFileSync(file, 'utf8')), `${file}: imagen fuera de CollagePhoto`);
  }
});

test('mutación: cada regla del detector marca su construcción y deja pasar el svg limpio', () => {
  for (const rule of RULES) {
    assert.ok(!rule.re.test(CLEAN), `${rule.id}: el svg limpio no debe marcarse`);
    assert.ok(rule.re.test(CLEAN + rule.bad), `${rule.id}: la mutación debe detectarse`);
  }
});

/** Verdadero si todo `<svg` crudo del texto es decorativo (aria-hidden true y focusable false). */
function everySvgDecorative(source) {
  const tags = source.match(/<svg\b[^>]*>/g) ?? [];
  return tags.every((tag) => /aria-hidden="true"/.test(tag) && /focusable="false"/.test(tag));
}

test('todo <svg de collage lleva aria-hidden true y focusable false', () => {
  for (const file of OWNED.filter((f) => f.includes('/collage/') && f.endsWith('.astro'))) {
    assert.ok(everySvgDecorative(readFileSync(file, 'utf8')), `${file}: svg sin aria-hidden o focusable`);
  }
  // mutación
  assert.equal(everySvgDecorative(CLEAN), true);
  assert.equal(everySvgDecorative('<svg focusable="false"></svg>'), false);
  assert.equal(everySvgDecorative('<svg aria-hidden="true"></svg>'), false);
});

test('el logo es una imagen con nombre: role img, aria-label y nunca aria-hidden', () => {
  const logo = readFileSync('src/components/brand/Logo.astro', 'utf8');
  assert.match(logo, /role="img"/);
  assert.match(logo, /aria-label=\{name\}/);
  assert.doesNotMatch(logo, /aria-hidden/);
});

test('las piezas validan el tono en el build', () => {
  const piece = readFileSync('src/components/collage/CollagePiece.astro', 'utf8');
  assert.match(piece, /assertToneSafe\(/);
  assert.match(readFileSync('src/components/collage/CollageScene.astro', 'utf8'), /assertScene\(/);
  for (const file of ['src/components/collage/AgendaCollage.astro', 'src/components/collage/Avatar.astro']) {
    assert.match(readFileSync(file, 'utf8'), /<CollageScene\b/, `${file} monta el mecanismo de escenas`);
  }
});

// ---------------------------------------------------------------------------------------------
// (v) Sobre el build (dist)
// ---------------------------------------------------------------------------------------------

function readDist(path) {
  assert.ok(existsSync(path), `Falta ${path}: ejecuta npx astro build antes de estas pruebas`);
  return readFileSync(path, 'utf8');
}

const spriteOf = (html) => html.match(/<svg class="collage-sprite"[\s\S]*?<\/svg>/)?.[0] ?? '';

// Tope definitivo del sprite: ocho símbolos lg y nada más (plan 02-10, tarea 3).
test(`dist/index.html trae un solo sprite, pesa menos de ${HTML_RAW_MAX} bytes (${HTML_GZIP_MAX} con gzip) y el sprite menos de 10 KB`, () => {
  const html = readDist('dist/index.html');
  assert.equal((html.match(/class="collage-sprite"/g) ?? []).length, 1);
  // Topes de HTML en tests/e2e/lib/budgets.mjs (única fuente, con su justificación); la misma que leen los specs e2e.
  assert.ok(Buffer.byteLength(html) < HTML_RAW_MAX, `dist/index.html pesa ${Buffer.byteLength(html)} bytes`);
  assert.ok(gzipSync(Buffer.from(html), { level: 9 }).length < HTML_GZIP_MAX, `dist/index.html supera ${HTML_GZIP_MAX} bytes con gzip`);
  assert.ok(Buffer.byteLength(spriteOf(html)) < 10240, `sprite de ${Buffer.byteLength(spriteOf(html))} bytes`);
  assert.equal((html.match(/<symbol id="lg-/g) ?? []).length, 8);
  assert.equal((html.match(/<symbol id="/g) ?? []).length, 8, 'queda un símbolo de otro prefijo');
});

test('en la hoja, cada <use href="#lg-..."> resuelve a un <symbol id> de esa página', (t) => {
  if (!existsSync('dist/marca/hoja/index.html')) {
    t.skip('la hoja no existe en este build (producción)');
    return;
  }
  const html = readDist('dist/marca/hoja/index.html');
  const ids = new Set([...html.matchAll(/<symbol id="([^"]+)"/g)].map((m) => m[1]));
  const uses = [...html.matchAll(/<use[^>]*?\shref="#([^"]+)"/g)].map((m) => m[1]);
  assert.ok(uses.length > 0, 'la hoja no usa ninguna pieza');
  for (const id of uses) assert.ok(id.startsWith('lg-') && ids.has(id), `<use> sin símbolo: ${id}`);
  assert.equal((html.match(/<symbol id="/g) ?? []).length, 8);
  assert.equal(/(id|class|href)="#?cs-/.test(html), false, 'la hoja conserva una pieza del collage viejo');
});

// ---------------------------------------------------------------------------------------------
// (vi) Las 32 mesas oficiales del .ai (plan 02-09, tarea 2): catálogo, archivos, higiene de cada
// SVG, contraste por mesa, resolveLogo, Logo.astro, cleanArtboard y originales fuera del repo.
// ---------------------------------------------------------------------------------------------

import { readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { contrastRaw, parseTokens } from '../../scripts/lib/contrast.mjs';

const CATALOG_PATH = '../../src/components/brand/logo-variants.mjs';
const BRAND_DIR = 'src/assets/brand';

/** Carga el catálogo cuando la prueba corre (así cada prueba falla sola si aún no existe). */
const loadCatalog = () => import(CATALOG_PATH);
const loadClean = () => import('../../scripts/lib/brand-svg.mjs');

const TOKENS = parseTokens(readFileSync('src/styles/tokens.css', 'utf8'));
const svgFiles = () => readdirSync(BRAND_DIR).filter((f) => f.endsWith('.svg')).sort();

// Lista de excepciones escrita aparte del catálogo que protege: ampliarla exige tocar esta prueba.
const EXCEPTION_BOARDS = [17, 22];
// Colores propios de los SVG oficiales: los cuatro tonos de marca que aparecen en las 17 mesas
// (iris y pupila solo se nombran aquí; los tokens no los declaran).
const SVG_FILLS = ['#4228d1', '#6c61db', '#f4f3e0', '#1e1e1e'];

/** Devuelve los problemas de contraste de un catálogo (vacío si todo coincide con tokens.css). */
function contrastProblems(boards, svgTextOf) {
  const problems = [];
  for (const b of boards.filter((x) => x.use)) {
    const fg = TOKENS.theme[`--color-brand-${b.fg}`];
    const surface = TOKENS.tones[b.tone]?.['--surface'];
    if (!fg || !surface) {
      problems.push(`mesa ${b.n}: fg o superficie sin resolver`);
      continue;
    }
    const measured = contrastRaw(fg, surface);
    if (Math.abs(measured - b.ratio) > 0.01) problems.push(`mesa ${b.n}: razón ${b.ratio} no coincide con ${measured.toFixed(2)}`);
    if (!svgTextOf(b).includes(`fill="${fg}"`)) problems.push(`mesa ${b.n}: el SVG no trae el relleno ${fg}`);
    if (measured < b.min !== Boolean(b.exception)) problems.push(`mesa ${b.n}: excepción inconsistente con el umbral`);
  }
  const listed = boards.filter((x) => x.use && x.exception).map((x) => x.n).sort((a, b) => a - b);
  if (JSON.stringify(listed) !== JSON.stringify(EXCEPTION_BOARDS)) problems.push(`excepciones fuera de lista: ${listed}`);
  return problems;
}

test('(vi-i) catálogo: las mesas 1 a 32 una sola vez, cada una usada o con motivo', async () => {
  const { ARTBOARDS } = await loadCatalog();
  assert.deepEqual(ARTBOARDS.map((b) => b.n).sort((a, b) => a - b), Array.from({ length: 32 }, (_, i) => i + 1));
  for (const b of ARTBOARDS) {
    if (b.use) assert.ok(b.file && b.tone && b.fg && b.ratio && b.min, `mesa ${b.n}: falta archivo, tono, fg, razón o umbral`);
    else assert.ok(typeof b.reason === 'string' && b.reason.trim().length > 10, `mesa ${b.n}: sin motivo`);
  }
  assert.equal(ARTBOARDS.filter((b) => b.use).length, 17);
});

test('(vi-ii) archivos: src/assets/brand trae exactamente los 17 del catálogo', async () => {
  const { ARTBOARDS } = await loadCatalog();
  const expected = ARTBOARDS.filter((b) => b.use).map((b) => `${b.file}.svg`).sort();
  assert.equal(expected.length, 17);
  assert.deepEqual(svgFiles(), expected);
});

test('(vi-iii) higiene: cada SVG oficial es solo svg y path, acotado y con rellenos de marca', async () => {
  const files = svgFiles();
  assert.equal(files.length, 17);
  for (const file of files) {
    const text = readFileSync(`${BRAND_DIR}/${file}`, 'utf8');
    const root = text.match(/<svg\b[^>]*>/)?.[0] ?? '';
    const vb = root.match(/viewBox="([^"]+)"/)?.[1].trim().split(/[\s,]+/).map(Number) ?? [];
    assert.equal(vb.length, 4, `${file}: viewBox de cuatro números`);
    const [x, y, w, h] = vb;
    assert.ok(x >= 0 && y >= 0 && w > 0 && h > 0, `${file}: viewBox con origen negativo (fondo sin quitar)`);
    assert.ok(x + w <= 800 && y + h <= 800, `${file}: viewBox fuera de 0 a 800`);
    assert.ok(!/\swidth=|\sheight=/.test(root), `${file}: width o height en la raíz`);
    assert.ok(Buffer.byteLength(text) < 8192, `${file}: pesa ${Buffer.byteLength(text)} bytes`);
    const elements = new Set([...text.matchAll(/<([a-zA-Z][\w:-]*)/g)].map((m) => m[1]));
    assert.deepEqual([...elements].sort(), ['path', 'svg'], `${file}: elementos ${[...elements]}`);
    assert.ok(!/<!--|<\?xml|<!DOCTYPE|<!\[CDATA/i.test(text), `${file}: comentario, declaración o metadato`);
    assert.ok(!/\s(?:xlink:)?href=|\sstyle=|\son\w+=|xlink/i.test(text), `${file}: href, style, on* o xlink`);
    assert.ok(!/https?:\/\/(?!www\.w3\.org\/2000\/svg)/.test(text), `${file}: referencia http`);
    const fills = [...text.matchAll(/\sfill="([^"]*)"/g)].map((m) => m[1]);
    for (const f of fills) assert.ok(SVG_FILLS.includes(f), `${file}: relleno ${f} fuera de la paleta oficial`);
    const paths = text.match(/<path\b[^>]*>/g) ?? [];
    assert.ok(paths.length > 0);
    for (const p of paths) assert.match(p, /\sfill="#[0-9a-f]{6}"/, `${file}: un path sin relleno propio`);
    assert.ok(!/\sstroke=/.test(text), `${file}: trae stroke`);
  }
});

test('(vi-iv) contraste por mesa: fg contra la superficie del tono coincide con el catálogo', async () => {
  const { ARTBOARDS } = await loadCatalog();
  const svgTextOf = (b) => readFileSync(`${BRAND_DIR}/${b.file}.svg`, 'utf8');
  assert.deepEqual(contrastProblems(ARTBOARDS, svgTextOf), []);
  // el mínimo de cada mesa es el de su familia (4.5 texto, 3 isotipo y ojo)
  for (const b of ARTBOARDS.filter((x) => x.use)) {
    assert.equal(b.min, ['isotipo', 'ojo'].includes(b.variant) ? 3 : 4.5, `mesa ${b.n}: umbral de su variante`);
  }
});

test('(vi-viii) mutación: un catálogo sin la excepción de la mesa 17 o con una razón cambiada se detecta', async () => {
  const { ARTBOARDS } = await loadCatalog();
  const svgTextOf = (b) => readFileSync(`${BRAND_DIR}/${b.file}.svg`, 'utf8');
  const withoutException = ARTBOARDS.map((b) => (b.n === 17 ? { ...b, exception: undefined } : b));
  assert.ok(contrastProblems(withoutException, svgTextOf).length > 0, 'quitar la excepción de 17 debe fallar');
  const badRatio = ARTBOARDS.map((b) => (b.n === 1 ? { ...b, ratio: 6 } : b));
  assert.ok(contrastProblems(badRatio, svgTextOf).length > 0, 'cambiar una razón debe fallar');
  const extra = ARTBOARDS.map((b) => (b.n === 5 ? { ...b, exception: 'x' } : b));
  assert.ok(contrastProblems(extra, svgTextOf).length > 0, 'ampliar las excepciones debe fallar');
});

test('(vi-v) resolveLogo devuelve la mesa de cada variante y tono, y falla en español si no existe', async () => {
  const { resolveLogo, availableTones, ARTBOARDS, LOGO_TONES, LOGO_VARIANTS, MIN_HEIGHT_PX } = await loadCatalog();
  const expected = {
    'apilado/light': 1, 'apilado/yellow': 5, 'apilado/dark': 8, 'apilado/purple': 3,
    'horizontal/light': 6, 'imagotipo/light': 7,
    'emblema/light': 10, 'emblema/yellow': 24, 'emblema/purple': 12,
    'isotipo/light': 13, 'isotipo/yellow': 16, 'isotipo/purple': 14, 'isotipo/dark': 17,
    'ojo/light': 18, 'ojo/yellow': 21, 'ojo/purple': 19, 'ojo/dark': 22,
  };
  for (const [key, n] of Object.entries(expected)) {
    const [variant, tone] = key.split('/');
    const board = resolveLogo(variant, tone);
    assert.equal(board.n, n, key);
    assert.equal(board.file, ARTBOARDS.find((b) => b.n === n).file);
  }
  assert.equal(resolveLogo('horizontal', 'light').file, 'horizontal-06-blanco');
  assert.throws(
    () => resolveLogo('horizontal', 'dark'),
    (e) => e instanceof Error && /"horizontal"/.test(e.message) && /"dark"/.test(e.message) && /disponibles: light\)/.test(e.message) && /No se recolorea/.test(e.message),
  );
  assert.throws(() => resolveLogo('imagotipo', 'yellow'), /"imagotipo".*"yellow".*disponibles: light/s);
  assert.throws(() => resolveLogo('emblema', 'dark'), /"emblema".*"dark".*disponibles: light, yellow, purple/s);
  assert.throws(() => resolveLogo('raro', 'light'), /raro/);
  assert.deepEqual(availableTones('emblema'), ['light', 'yellow', 'purple']);
  assert.deepEqual(LOGO_TONES, ['light', 'yellow', 'dark', 'purple']);
  assert.deepEqual([...LOGO_VARIANTS], ['apilado', 'horizontal', 'imagotipo', 'emblema', 'isotipo', 'ojo']);
  assert.deepEqual(MIN_HEIGHT_PX, { horizontal: 32, imagotipo: 32, apilado: 48, emblema: 96, isotipo: 24, ojo: 24 });
});

test('(vi-vi) Logo.astro importa exactamente los archivos del catálogo, sin recolor ni atributo de tono', async () => {
  const { ARTBOARDS } = await loadCatalog();
  const logo = readFileSync('src/components/brand/Logo.astro', 'utf8');
  const imported = [...logo.matchAll(/^import\s+\w+\s+from\s+'\.\.\/\.\.\/assets\/brand\/([\w-]+)\.svg';$/gm)].map((m) => m[1]).sort();
  const expected = ARTBOARDS.filter((b) => b.use).map((b) => b.file).sort();
  assert.deepEqual(imported, expected);
  assert.ok(!/\bfill\s*:/.test(logo), 'Logo.astro declara una regla de relleno por CSS');
  assert.ok(!logo.includes('data-tone'), 'Logo.astro usa el atributo de tono de la página');
  assert.ok(!/import\.meta\.glob/.test(logo));
});

test('(vi-vii) cleanArtboard: quita los rect, ajusta el crema, rechaza colores ajenos y limpia la raíz', async () => {
  const { cleanArtboard } = await loadClean();
  const rect = '<rect x="-80" y="-80" width="960" height="960" fill="rgb(100%, 77.598572%, 0.799561%)" fill-opacity="1"/>';
  const svg = (inner) =>
    `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="800pt" height="800pt" viewBox="0 0 800 800">${inner}</svg>\n`;
  const out = cleanArtboard(
    svg(`${rect}${rect}${rect}<path fill-rule="nonzero" fill="rgb(95.698547%, 95.298767%, 88.198853%)" fill-opacity="1" d="M 0 0 L 1 1 Z"/>`),
    24,
  );
  assert.ok(!/<rect/.test(out), 'quedó un rect');
  assert.ok(out.includes('fill="#f4f3e0"'), 'el crema no salió como el oficial');
  assert.ok(!out.includes('#f4f3e1'));
  assert.ok(!/width=|height=|xmlns:xlink|<\?xml/.test(out), 'la raíz conserva width, height, xlink o declaración');
  assert.ok(out.includes('viewBox="0 0 800 800"'));
  const purple = cleanArtboard(svg('<path fill="rgb(25.898743%, 15.699768%, 81.999207%)" d="M 0 0 Z"/>'), 1);
  assert.ok(purple.includes('fill="#4228d1"'));
  assert.throws(() => cleanArtboard(svg('<path fill="rgb(50%, 50%, 50%)" d="M 0 0 Z"/>'), 9), /mesa 9.*fuera de la paleta/s);
  assert.throws(() => cleanArtboard(svg('<path fill="rgb(50%, 50%, 50%)" d="M 0 0 Z"/>'), 9), /#808080/);
});

test('(vi-ix) los originales (.ai, .pdf, brand-inventory/) no están versionados y .gitignore los cubre', (t) => {
  let tracked;
  try {
    tracked = execFileSync('git', ['ls-files'], { encoding: 'utf8' }).split('\n').filter(Boolean);
  } catch {
    t.skip('no es un repositorio git');
    return;
  }
  assert.deepEqual(tracked.filter((f) => /\.(ai|pdf)$/i.test(f)), []);
  assert.deepEqual(tracked.filter((f) => f.includes('brand-inventory/')), []);
  const ignore = readFileSync('.gitignore', 'utf8').split('\n').map((l) => l.trim());
  for (const pattern of ['*.ai', 'BrandBook*.pdf', '.planning/phases/*/brand-inventory/']) {
    assert.ok(ignore.includes(pattern), `.gitignore sin ${pattern}`);
  }
});

// ---------------------------------------------------------------------------------------------
// (vii) Favicon: sale de la mesa 18 (ojo con lupa), no se redibujó y el .ico trae tres PNG.
// ---------------------------------------------------------------------------------------------

const FAVICON_MAX_BYTES = 3072;
const pathData = (svg) => [...svg.matchAll(/<path\b[^>]*?\sd="([^"]*)"/g)].map((m) => m[1]);

/** Problemas de un favicon.svg frente a la mesa oficial de la que sale. Vacío = correcto. */
function faviconIssues(favicon, source) {
  const issues = [];
  if (JSON.stringify(pathData(favicon)) !== JSON.stringify(pathData(source))) issues.push('los trazos no son los de la mesa oficial');
  if (!/<svg\b[^>]*\sxmlns="http:\/\/www\.w3\.org\/2000\/svg"/.test(favicon)) issues.push('falta xmlns');
  const vb = favicon.match(/viewBox="([^"]+)"/)?.[1].split(/\s+/).map(Number);
  if (!vb || vb.length !== 4 || vb[2] !== vb[3]) issues.push('el viewBox no es cuadrado');
  if (/<script|<style|\shref=|xlink|https?:\/\/(?!www\.w3\.org)/i.test(favicon)) issues.push('trae script, style, href, xlink o una referencia externa');
  if (Buffer.byteLength(favicon) >= FAVICON_MAX_BYTES) issues.push(`pesa ${Buffer.byteLength(favicon)} bytes`);
  return issues;
}

test('(vii-i) favicon.svg sale de la mesa 18: mismos trazos, xmlns, viewBox cuadrado y sin script ni referencias', () => {
  const favicon = readFileSync('public/favicon.svg', 'utf8');
  const source = readFileSync(`${BRAND_DIR}/ojo-18-blanco.svg`, 'utf8');
  assert.deepEqual(faviconIssues(favicon, source), []);
});

test('(vii-ii) favicon.svg es reproducible: buildFaviconSvg(mesa 18) es el archivo publicado y deja 4 % de margen por lado', async () => {
  const { buildFaviconSvg, readViewBox } = await loadClean();
  const source = readFileSync(`${BRAND_DIR}/ojo-18-blanco.svg`, 'utf8');
  const favicon = readFileSync('public/favicon.svg', 'utf8');
  assert.equal(buildFaviconSvg(source), favicon.trim());
  const art = readViewBox(source);
  const box = readViewBox(favicon);
  assert.ok(Math.abs(box.w - Math.max(art.w, art.h) / 0.92) < 0.02, 'el lado no es el mayor del arte entre 0.92');
  assert.ok(Math.abs(box.x + box.w / 2 - (art.x + art.w / 2)) < 0.02, 'no está centrado en x');
  assert.ok(Math.abs(box.y + box.h / 2 - (art.y + art.h / 2)) < 0.02, 'no está centrado en y');
});

test('(vii-iii) mutación: un favicon con un trazo distinto, con script o con viewBox no cuadrado se detecta', () => {
  const source = readFileSync(`${BRAND_DIR}/ojo-18-blanco.svg`, 'utf8');
  const favicon = readFileSync('public/favicon.svg', 'utf8');
  assert.ok(faviconIssues(favicon.replace(/ d="M302\.7 /, ' d="M302.8 '), source).length > 0, 'un trazo cambiado pasó');
  assert.ok(faviconIssues(favicon.replace('</svg>', '<script>1</script></svg>'), source).length > 0, 'un script pasó');
  assert.ok(faviconIssues(favicon.replace(/viewBox="([^"]+) ([^ "]+)"/, 'viewBox="$1 1"'), source).length > 0, 'un viewBox no cuadrado pasó');
  assert.ok(faviconIssues(favicon.replace('<svg ', '<svg data-x="https://example.com" '), source).length > 0, 'una referencia externa pasó');
});

test('(vii-iv) favicon.ico: cabecera ICO, tres imágenes de 16, 32 y 48 px, cada una un PNG completo, más de 655 bytes', () => {
  const ico = readFileSync('public/favicon.ico');
  assert.ok(ico.length > 655);
  assert.deepEqual([...ico.subarray(0, 4)], [0, 0, 1, 0]);
  assert.equal(ico.readUInt16LE(4), 3);
  const seen = [];
  for (let i = 0; i < 3; i += 1) {
    const at = 6 + i * 16;
    const [w, h] = [ico[at], ico[at + 1]];
    const length = ico.readUInt32LE(at + 8);
    const offset = ico.readUInt32LE(at + 12);
    assert.equal(w, h);
    seen.push(w);
    const png = ico.subarray(offset, offset + length);
    assert.equal(png.length, length, `la imagen ${i} se sale del archivo`);
    assert.deepEqual([...png.subarray(0, 8)], [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    assert.equal(png.readUInt32BE(16), w, 'el ancho del PNG no coincide con la entrada');
    assert.equal(png.readUInt32BE(20), h, 'el alto del PNG no coincide con la entrada');
  }
  assert.deepEqual(seen, [16, 32, 48]);
});

test('(vii-v) packIco: rechaza tallas fuera de rango y ordena cabecera, entradas y datos', async () => {
  const { packIco } = await loadClean();
  const out = packIco([{ size: 16, data: Buffer.from('aa') }, { size: 32, data: Buffer.from('bbb') }]);
  assert.equal(out.readUInt16LE(4), 2);
  assert.equal(out.readUInt32LE(6 + 12), 6 + 32);
  assert.equal(out.readUInt32LE(6 + 16 + 12), 6 + 32 + 2);
  assert.equal(out.length, 6 + 32 + 5);
  assert.throws(() => packIco([{ size: 256, data: Buffer.alloc(1) }]), /fuera de 1 a 255/);
});

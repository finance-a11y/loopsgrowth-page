import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { contrastRaw, parseTokens } from '../../scripts/lib/contrast.mjs';

// Guardas del collage de marca (plan 02-10): geometría oficial de Loopy, esquemas de color,
// reglas de píldoras y palabras, ranuras de foto y escenas. Cada regla trae su mutación.

const LOOPY_DIR = 'src/assets/loopy';
const BRAND_DIR = 'src/assets/brand';
const OFFICIAL_FILLS = ['#4228d1', '#6c61db', '#f4f3e0', '#1e1e1e'];
const TOKENS = parseTokens(readFileSync('src/styles/tokens.css', 'utf8'));

const loadLoopy = () => import('../../src/components/collage/loopy.mjs');
const loadRules = () => import('../../src/components/collage/collage-rules.mjs');
const loadScenes = () => import('../../src/components/collage/scenes.mjs');

const read = (dir, file) => readFileSync(`${dir}/${file}.svg`, 'utf8');
const pathsOf = (text) =>
  [...text.matchAll(/<path\b([^>]*?)\/?>/g)].map((m) => ({
    fill: m[1].match(/\sfill="([^"]*)"/)?.[1],
    d: m[1].match(/\sd="([^"]*)"/)?.[1],
  }));
const viewBoxOf = (text) => text.match(/viewBox="([^"]+)"/)[1].trim().split(/[\s,]+/).map(Number);

// ---------------------------------------------------------------------------------------------
// (i) Fuentes de Loopy sin unir rutas
// ---------------------------------------------------------------------------------------------

const SOURCES = [
  ['isotipo-13-blanco', 11],
  ['isotipo-14-morado', 11],
  ['ojo-18-blanco', 6],
  ['ojo-19-morado', 6],
];

test('(i) fuentes: cuatro archivos livianos, solo svg y path, con las rutas esperadas', () => {
  for (const [file, count] of SOURCES) {
    const path = `${LOOPY_DIR}/${file}.svg`;
    assert.ok(existsSync(path), `falta ${path}`);
    const text = readFileSync(path, 'utf8');
    assert.ok(Buffer.byteLength(text) < 4096, `${file}: pesa ${Buffer.byteLength(text)} bytes`);
    assert.equal((text.match(/<svg\b/g) ?? []).length, 1);
    const vb = viewBoxOf(text);
    assert.equal(vb.length, 4);
    assert.ok(vb.every((n) => n >= 0 && n <= 800), `${file}: viewBox fuera de 0 a 800`);
    const elements = new Set([...text.matchAll(/<([a-zA-Z][\w:-]*)/g)].map((m) => m[1]));
    assert.deepEqual([...elements].sort(), ['path', 'svg'], `${file}: elementos ${[...elements]}`);
    assert.ok(!/\s(width|height|href|style)=|xlink|<!--|<\?xml|<metadata/i.test(text), `${file}: atributo o metadato prohibido`);
    const paths = pathsOf(text);
    assert.equal(paths.length, count, `${file}: número de rutas`);
    for (const p of paths) {
      assert.match(p.fill ?? '', /^#[0-9a-f]{6}$/, `${file}: relleno hexadecimal`);
      assert.ok(OFFICIAL_FILLS.includes(p.fill), `${file}: relleno ${p.fill} fuera de los colores oficiales`);
      assert.match(p.d ?? '', /^[MmLlHhVvCcSsQqTtAaZz0-9.,\s-]+$/, `${file}: caracteres extraños en d`);
    }
  }
});

test('(ii) geometría: las rutas de 13 y 14, y de 18 y 19, son idénticas y solo se intercambian roles', async () => {
  const { LOOPY_ROLES } = await loadLoopy();
  for (const [a, b, kind] of [['isotipo-13-blanco', 'isotipo-14-morado', 'ojos'], ['ojo-18-blanco', 'ojo-19-morado', 'lupa']]) {
    const ta = read(LOOPY_DIR, a);
    const tb = read(LOOPY_DIR, b);
    assert.deepEqual(viewBoxOf(ta), viewBoxOf(tb));
    const pa = pathsOf(ta);
    const pb = pathsOf(tb);
    assert.deepEqual(pa.map((p) => p.d), pb.map((p) => p.d), `${kind}: las rutas difieren`);
    LOOPY_ROLES[kind].forEach((role, i) => {
      if (role === 'frame' || role === 'rim') assert.notEqual(pa[i].fill, pb[i].fill, `${kind}[${i}] ${role} debe cambiar`);
      else assert.equal(pa[i].fill, pb[i].fill, `${kind}[${i}] ${role} no debe cambiar`);
    });
    // frame de A es rim de B y al revés
    const frameA = pa[LOOPY_ROLES[kind].indexOf('frame')].fill;
    const rimA = pa[LOOPY_ROLES[kind].indexOf('rim')].fill;
    assert.equal(pb[LOOPY_ROLES[kind].indexOf('frame')].fill, rimA);
    assert.equal(pb[LOOPY_ROLES[kind].indexOf('rim')].fill, frameA);
  }
});

test('(ii) loopyGeometry: partes y roles por tipo, y lanza si A y B difieren en una ruta', async () => {
  const { loopyGeometry, LOOPY_ROLES, parsePaths } = await loadLoopy();
  const ojos = loopyGeometry('ojos');
  const lupa = loopyGeometry('lupa');
  assert.deepEqual(ojos.parts.map((p) => p.role), ['frame', 'frame', 'rim', 'iris', 'pupil', 'glint', 'rim', 'iris', 'pupil', 'glint', 'frame']);
  assert.deepEqual(lupa.parts.map((p) => p.role), ['frame', 'rim', 'iris', 'pupil', 'glint', 'frame']);
  assert.deepEqual(LOOPY_ROLES.ojos.length, 11);
  assert.equal(ojos.viewBox.length, 4);
  for (const p of ojos.parts) {
    assert.ok(p.d.length > 0);
    if (['iris', 'pupil', 'glint'].includes(p.role)) assert.match(p.fill, /^#[0-9a-f]{6}$/);
    else assert.equal(p.fill, undefined);
  }
  assert.throws(() => loopyGeometry('gafas'), /Loopy/);
  // mutación: una ruta distinta entre esquemas se detecta
  const text = read(LOOPY_DIR, 'ojo-19-morado');
  const mutated = text.replace(/ d="M/, ' d="M1');
  const parsed = parsePaths(mutated);
  const original = parsePaths(read(LOOPY_DIR, 'ojo-18-blanco'));
  assert.notDeepEqual(parsed.paths.map((p) => p.d), original.paths.map((p) => p.d));
});

test('(ii) parsePaths rechaza elementos, atributos y caracteres fuera de la lista', async () => {
  const { parsePaths } = await loadLoopy();
  const ok = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="1 2 30 40"><path fill="#4228d1" d="M0 0L1 1Z"/></svg>';
  const parsed = parsePaths(ok);
  assert.deepEqual(parsed.viewBox, [1, 2, 30, 40]);
  assert.equal(parsed.paths.length, 1);
  assert.throws(() => parsePaths(ok.replace('<path', '<rect x="1"/><path')), /rect/);
  assert.throws(() => parsePaths(ok.replace('<path', '<path style="x"')), /style/);
  assert.throws(() => parsePaths(ok.replace('M0 0L1 1Z', 'M0 0<script>')), /d/);
  assert.throws(() => parsePaths(ok.replace('viewBox="1 2 30 40"', '')), /viewBox/);
});

// ---------------------------------------------------------------------------------------------
// (iii) Esquema y fidelidad contra las ocho mesas oficiales de 02-09
// ---------------------------------------------------------------------------------------------

test('(iii) loopyScheme: A en light y yellow, B en purple, error en dark y en lo desconocido', async () => {
  const { loopyScheme } = await loadLoopy();
  for (const kind of ['ojos', 'lupa']) {
    assert.equal(loopyScheme(kind, 'light'), 'A');
    assert.equal(loopyScheme(kind, 'yellow'), 'A');
    assert.equal(loopyScheme(kind, 'purple'), 'B');
    assert.throws(() => loopyScheme(kind, 'dark'), /oscuro/);
    assert.throws(() => loopyScheme(kind, 'neon'), /Tono desconocido/);
  }
  assert.throws(() => loopyScheme('gafas', 'light'), /Loopy/);
});

const BOARD_SCHEME = { 13: 'A', 14: 'B', 16: 'A', 17: 'A', 18: 'A', 19: 'B', 21: 'A', 22: 'A' };
const BOARD_FILE = {
  13: 'isotipo-13-blanco', 14: 'isotipo-14-morado', 16: 'isotipo-16-amarillo', 17: 'isotipo-17-oscuro',
  18: 'ojo-18-blanco', 19: 'ojo-19-morado', 21: 'ojo-21-amarillo', 22: 'ojo-22-oscuro',
};

/** Problemas de una mesa oficial frente al color de aro de su esquema. Vacío = fiel. */
function fidelityIssues(text, scheme, frameHex, sourceFills) {
  const issues = [];
  const paths = pathsOf(text);
  const expected = scheme === 'A' ? frameHex.purple : frameHex.cream;
  if (paths[0].fill !== expected) issues.push(`aro ${paths[0].fill} en vez de ${expected}`);
  const set = [...new Set(paths.map((p) => p.fill))].sort().join();
  if (set !== sourceFills) issues.push(`rellenos ${set} distintos de la fuente`);
  return issues;
}

test('(iii) fidelidad: las ocho mesas de 02-09 usan el color de aro de su esquema y los mismos rellenos que las fuentes', () => {
  const frameHex = { purple: TOKENS.theme['--color-brand-purple'], cream: TOKENS.theme['--color-brand-cream'] };
  const fillsOf = (file) => [...new Set(pathsOf(read(LOOPY_DIR, file)).map((p) => p.fill))].sort().join();
  const bySource = { ojos: fillsOf('isotipo-13-blanco'), lupa: fillsOf('ojo-18-blanco') };
  for (const [n, scheme] of Object.entries(BOARD_SCHEME)) {
    const kind = Number(n) < 18 ? 'ojos' : 'lupa';
    assert.deepEqual(fidelityIssues(read(BRAND_DIR, BOARD_FILE[n]), scheme, frameHex, bySource[kind]), [], `mesa ${n}`);
  }
  // mutación: la mesa 14 con el aro morado se detecta
  const bad = read(BRAND_DIR, BOARD_FILE[14]).replace(new RegExp(`fill="${frameHex.cream}"`), `fill="${frameHex.purple}"`);
  assert.ok(fidelityIssues(bad, 'B', frameHex, bySource.ojos).length > 0, 'una mesa 14 con el aro morado pasó');
});

test('(iii) schemeColors: frame y rim de cada esquema salen del archivo y del token', async () => {
  const { schemeColors } = await loadLoopy();
  for (const kind of ['ojos', 'lupa']) {
    assert.deepEqual(schemeColors(kind, 'A'), { frame: 'purple', rim: 'cream' });
    assert.deepEqual(schemeColors(kind, 'B'), { frame: 'cream', rim: 'purple' });
  }
  assert.throws(() => schemeColors('ojos', 'C'), /esquema/);
});

test('(iii) el sprite: .lp-a y .lp-b coinciden con schemeColors', async () => {
  const { schemeColors } = await loadLoopy();
  const sprite = readFileSync('src/components/collage/CollageSprite.astro', 'utf8');
  for (const [cls, scheme] of [['lp-a', 'A'], ['lp-b', 'B']]) {
    const block = sprite.match(new RegExp(`\\.${cls}\\s*\\{([^}]*)\\}`))?.[1] ?? '';
    const { frame, rim } = schemeColors('ojos', scheme);
    assert.ok(block.includes(`--lp-frame: var(--color-brand-${frame})`), `.${cls}: frame`);
    assert.ok(block.includes(`--lp-rim: var(--color-brand-${rim})`), `.${cls}: rim`);
  }
});

// ---------------------------------------------------------------------------------------------
// (iv) Color: crema
// ---------------------------------------------------------------------------------------------

test('(iv) el crema entra en BRAND_COLORS y en light, dark y purple, nunca en yellow', async () => {
  const { BRAND_COLORS, ALLOWED_FILLS, assertToneSafe, fillVar } = await loadRules();
  assert.ok(BRAND_COLORS.includes('cream'));
  for (const tone of ['light', 'dark', 'purple']) assert.equal(assertToneSafe(tone, ['cream'], 'p') !== undefined, true);
  assert.ok(!ALLOWED_FILLS.yellow.includes('cream'));
  assert.throws(
    () => assertToneSafe('yellow', ['cream'], 'pieza-x'),
    (e) => /pieza-x/.test(e.message) && /yellow/.test(e.message) && /cream/.test(e.message),
  );
  for (const [tone, color] of [['dark', 'purple'], ['purple', 'purple'], ['yellow', 'yellow'], ['dark', 'dark'], ['purple', 'dark']]) {
    assert.throws(() => assertToneSafe(tone, [color], 'p'), undefined, `${color} sobre ${tone}`);
  }
  assert.equal(fillVar('cream'), 'var(--color-brand-cream)');
});

// ---------------------------------------------------------------------------------------------
// (v) Píldoras y palabras
// ---------------------------------------------------------------------------------------------

test('(v) CHIP_WORDS: cinco palabras con idioma y fuente; las del copy están en el texto de Ari', async () => {
  const { CHIP_WORDS } = await loadRules();
  assert.deepEqual(CHIP_WORDS.map((w) => w.word), ['seo', 'geo', 'ads', 'spy', 'team work']);
  for (const w of CHIP_WORDS) {
    assert.ok(['es', 'en'].includes(w.lang), `${w.word}: idioma`);
    assert.ok(['copy', 'moodboard'].includes(w.source), `${w.word}: fuente`);
  }
  assert.deepEqual(CHIP_WORDS.filter((w) => w.lang === 'en').map((w) => w.word), ['geo', 'spy', 'team work']); // geo: decisión de Juan, 2026-09-20
  const copy = readFileSync('.planning/phases/02-secciones-marca-y-copy/02-ARI-COPY-V2.md', 'utf8').toLowerCase();
  for (const w of CHIP_WORDS.filter((x) => x.source === 'copy')) assert.ok(copy.includes(w.word), `${w.word} no está en el copy de Ari`);
});

test('(v) assertChipWord y assertPill: pares aprobados, rechazos y mutación del umbral', async () => {
  const { assertChipWord, assertPill } = await loadRules();
  assert.throws(() => assertChipWord('hola', 'escena'), /hola/);
  assertChipWord('team work', 'escena');
  const ok = [['light', 'yellow', 'dark', 'seo'], ['light', 'purple', 'cream', 'geo'], ['light', 'cream', 'purple', 'ads'],
    ['yellow', 'dark', 'yellow', 'seo'], ['purple', 'cream', 'purple', 'spy'], ['purple', 'yellow', 'dark', 'team work']];
  for (const args of ok) assertPill(...args, 'p');
  assert.throws(() => assertPill('light', 'purple', 'dark', 'seo', 'p'), (e) => /1\.8/.test(e.message) && /p/.test(e.message));
  assert.throws(() => assertPill('dark', 'purple', 'cream', 'seo', 'p'), /purple/);
  assert.throws(() => assertPill('light', 'yellow', 'dark', 'hola', 'p'), /hola/);
  assert.throws(() => assertPill('light', 'yellow', 'yellow', 'seo', 'p'), undefined);
  // razones medidas de los pares que exige el plan
  const c = (a, b) => contrastRaw(TOKENS.theme[`--color-brand-${a}`], TOKENS.theme[`--color-brand-${b}`]);
  assert.ok(c('cream', 'purple') > 7.6 && c('dark', 'yellow') > 10.2 && c('dark', 'orange') > 5.5 && c('white', 'purple') > 8.5);
  // mutación: con el umbral en 1 el par malo pasaría; el propio par mide menos de 4.5
  assert.ok(c('dark', 'purple') < 4.5 && c('dark', 'purple') >= 1);
});

// ---------------------------------------------------------------------------------------------
// (vi) Escenas
// ---------------------------------------------------------------------------------------------

const clone = (x) => structuredClone(x);
const layerOf = (scene, id) => scene.layers.find((l) => l.id === id);

/** Aplica una mutación a una copia de la escena y devuelve lo que assertScene lanza. */
async function mutate(name, fn) {
  const { SCENES, assertScene } = await loadScenes();
  const scene = clone(SCENES[name]);
  fn(scene);
  try {
    assertScene(scene);
    return null;
  } catch (e) {
    return e.message;
  }
}

test('(vi) assertScene pasa en el hero y lanza con cada mutación, nombrando escena, capa y regla', async () => {
  const { SCENES, assertScene } = await loadScenes();
  assert.doesNotThrow(() => assertScene('hero'));
  assert.ok(SCENES.hero);
  const cases = [
    ['R3', (s) => { layerOf(s, 'hero-loopy').cx += 60; }, 'hero-loopy'],
    ['R1', (s) => { layerOf(s, 'hero-destello').color = 'purple'; }, 'hero-destello'],
    // Palabra de tres letras (como 'seo'): una de cuatro con la píldora de fs 36 se solapaba antes (R5) con el destello.
    ['R7', (s) => { layerOf(s, 'hero-pill-seo').word = 'hoy'; }, 'hero-pill-seo'],
    ['R8', (s) => { s.groups.push({ name: 'extra', i: 6, r: 0, rFrom: 0 }); }, 'extra'],
    ['R6', (s) => { layerOf(s, 'hero-puntos').x = -20; }, 'hero-puntos'],
    ['R5', (s) => { Object.assign(layerOf(s, 'hero-mas'), { x: 30, y: 180 }); }, 'hero-mas'],
    ['R2', (s) => { delete layerOf(s, 'hero-panel').shadow; }, 'hero-panel'],
    ['R4', (s) => { layerOf(s, 'hero-flecha').y = 100; }, 'hero-flecha'],
    ['R9', (s) => { layerOf(s, 'hero-panel').name = 'otro'; }, 'hero-panel'],
    ['R10', (s) => { s.layers = s.layers.filter((l) => l.kind !== 'pill'); }, 'hero'],
    ['R11', (s) => { Object.assign(layerOf(s, 'hero-panel'), { h: 60, dots: { x: 358, y: 36, w: 40, color: 'purple' } }); s.layers = s.layers.filter((l) => l.kind !== 'pill'); }, 'hero'],
  ];
  for (const [rule, fn, layer] of cases) {
    const message = await mutate('hero', fn);
    assert.ok(message, `${rule}: la mutación no lanzó`);
    assert.ok(message.startsWith('Escena "hero"'), `${rule}: el mensaje no empieza por la escena: ${message}`);
    assert.ok(message.includes(layer) && message.includes(rule), `${rule}: mensaje sin capa o regla: ${message}`);
  }
});

test('(vi) hero: seis grupos con --i en permutación de 0 a 5 y ranura hero dentro del viewBox', async () => {
  const { SCENES, PHOTO_SLOTS } = await loadScenes();
  const hero = SCENES.hero;
  assert.deepEqual(hero.groups.map((g) => g.name).sort(), ['doodles', 'dots', 'loopy', 'panel', 'pills', 'stage']);
  assert.deepEqual(hero.groups.map((g) => g.i).sort(), [0, 1, 2, 3, 4, 5]);
  const slot = PHOTO_SLOTS.find((s) => s.name === 'hero');
  assert.ok(slot && slot.scene === 'hero');
  assert.ok(slot.x >= 0 && slot.y >= 0 && slot.x + slot.w <= hero.w && slot.y + slot.h <= hero.h);
  assert.ok(Math.abs(slot.aspect - slot.w / slot.h) < 1e-6);
});

test('(vi) SCENE_PIECES: las ocho claves y los tamaños de los garabatos y la retícula', async () => {
  const { SCENE_PIECES } = await loadRules();
  assert.deepEqual(Object.keys(SCENE_PIECES).sort(), ['asterisco', 'destello', 'flecha', 'garabato', 'lupa', 'mas', 'ojos', 'puntos']);
  assert.deepEqual([SCENE_PIECES.flecha.w, SCENE_PIECES.flecha.h], [64, 48]);
  assert.deepEqual([SCENE_PIECES.puntos.w, SCENE_PIECES.puntos.h], [96, 64]);
  for (const [key, p] of Object.entries(SCENE_PIECES)) assert.equal(p.symbol, `lg-${key}`);
});

test('(vi) los archivos del mecanismo no traen hex ni construcciones prohibidas', () => {
  const files = ['loopy.mjs', 'scenes.mjs', 'CollageScene.astro', 'Pill.astro', 'HeroCollage.astro'];
  for (const f of files) {
    const text = readFileSync(`src/components/collage/${f}`, 'utf8');
    assert.ok(!/#[0-9a-fA-F]{3}(?![0-9a-zA-Z_-])|#[0-9a-fA-F]{6}(?![0-9a-zA-Z_-])/.test(text), `${f}: hex`);
    assert.ok(!/set:html|<text[\s>]|<title|<image|<img[\s>]|<script/.test(text), `${f}: construcción prohibida`);
  }
});

// ---------------------------------------------------------------------------------------------
// (vii) Escenas de las tarjetas: Por qué ahora, pegatinas y chips (tarea 2)
// ---------------------------------------------------------------------------------------------

const CARD_SCENES = ['whynow', 'sticker-clic', 'sticker-lupa', 'sticker-ojos', 'chip-lupa', 'chip-ojos', 'chip-loop', 'chip-clic'];
const MINI_WORDS = {
  'sticker-clic': 'ads',
  'sticker-lupa': 'seo',
  'sticker-ojos': 'spy',
  'chip-lupa': 'spy',
  'chip-ojos': 'geo',
  'chip-loop': 'team work',
  'chip-clic': 'seo',
};

test('(vii) escenas de las tarjetas: assertScene pasa y cada mini trae su palabra de la lista', async () => {
  const { SCENES, assertScene } = await loadScenes();
  const { CHIP_WORDS } = await loadRules();
  for (const name of CARD_SCENES) {
    assert.ok(SCENES[name], `falta la escena ${name}`);
    assert.doesNotThrow(() => assertScene(name), name);
  }
  for (const [name, word] of Object.entries(MINI_WORDS)) {
    const scene = SCENES[name];
    assert.equal(scene.kind, 'mini');
    assert.equal([scene.w, scene.h].join('x'), '96x80');
    assert.equal(scene.ground, 'light');
    const pills = scene.layers.filter((l) => l.kind === 'pill');
    assert.deepEqual(pills.map((p) => p.word), [word], `${name}: palabra`);
    assert.ok(CHIP_WORDS.some((c) => c.word === word), `${name}: palabra fuera de la lista`);
  }
  assert.equal(SCENES.whynow.kind, 'full');
  assert.equal([SCENES.whynow.w, SCENES.whynow.h].join('x'), '320x320');
  assert.equal(SCENES.whynow.ground, 'yellow');
});

test('(vii) escenas de las tarjetas: Loopy en cinco de las siete minis y solo dos ranuras de foto', async () => {
  const { SCENES, PHOTO_SLOTS, sceneTraits } = await loadScenes();
  for (const name of Object.keys(MINI_WORDS)) {
    const hasLoopy = sceneTraits(SCENES[name]).has('loopy');
    assert.equal(hasLoopy, name !== 'sticker-clic' && name !== 'chip-clic', `${name}: Loopy`);
    assert.equal(SCENES[name].layers.some((l) => l.kind === 'slot'), false, `${name}: no lleva ranura`);
  }
  assert.ok(sceneTraits(SCENES.whynow).has('loopy') && sceneTraits(SCENES.whynow).has('slot'));
  assert.deepEqual(PHOTO_SLOTS.map((s) => s.name).sort(), ['hero', 'whynow']);
  const wn = PHOTO_SLOTS.find((s) => s.name === 'whynow');
  assert.deepEqual([wn.x, wn.y, wn.w, wn.h], [204, 14, 104, 128]);
});

test('(vii) escenas de las tarjetas: los escenarios de los cuatro chips alternan por posición', async () => {
  const { SCENES } = await loadScenes();
  assert.deepEqual(
    ['chip-lupa', 'chip-ojos', 'chip-loop', 'chip-clic'].map((n) => SCENES[n].stage),
    ['purple', 'yellow', 'purple', 'yellow'],
  );
});

test('(vii) escenas de las tarjetas: cada mutación lanza nombrando escena, capa y regla', async () => {
  const { SCENES } = await loadScenes();
  for (const name of CARD_SCENES) {
    const pill = SCENES[name].layers.find((l) => l.kind === 'pill');
    const doodle = SCENES[name].layers.find((l) => l.kind === 'doodle' && l.on === 'ground');
    const cases = [
      ['R7', (s) => { layerOf(s, pill.id).word = 'xyz'; }, pill.id],
      ['R6', (s) => { layerOf(s, doodle.id).x = -20; }, doodle.id],
    ];
    const loopy = SCENES[name].layers.find((l) => l.kind === 'loopy');
    if (loopy) cases.push(['R3', (s) => { layerOf(s, loopy.id).cx += 40; }, loopy.id]);
    if (name !== 'whynow') {
      cases.push(['R9', (s) => { s.layers.push({ id: `${name}-slot`, kind: 'slot', on: 'ground', name, x: 4, y: 4, w: 20, h: 20, rx: 4, fill: 'white', shadow: [2, 2] }); }, `${name}-slot`]);
    }
    for (const [rule, fn, layer] of cases) {
      const message = await mutate(name, fn);
      assert.ok(message, `${name} ${rule}: la mutación no lanzó`);
      assert.ok(message.startsWith(`Escena "${name}"`), `${name} ${rule}: ${message}`);
      assert.ok(message.includes(layer) && message.includes(rule), `${name} ${rule}: mensaje sin capa o regla: ${message}`);
    }
  }
});

test('(vii) los consumidores de las escenas no traen hex ni set:html', () => {
  for (const f of ['src/components/ui/PainCard.astro', 'src/components/ui/PillarCard.astro', 'src/components/sections/WhyNow.astro']) {
    const text = readFileSync(f, 'utf8');
    assert.ok(!/#[0-9a-fA-F]{3}(?![0-9a-zA-Z_-])|#[0-9a-fA-F]{6}(?![0-9a-zA-Z_-])/.test(text), `${f}: hex`);
    assert.ok(!/set:html/.test(text), `${f}: set:html`);
    assert.ok(/CollageScene/.test(text) && !/CollagePiece/.test(text), `${f}: debe usar CollageScene y no CollagePiece`);
  }
});

// ---------------------------------------------------------------------------------------------
// (viii) Agenda y avatares con el mismo mecanismo, y retiro del collage viejo (tarea 3)
// ---------------------------------------------------------------------------------------------

const AVATAR_SCENES = ['avatar-ojo-morado', 'avatar-ojo-amarillo', 'avatar-ojos-morado', 'avatar-ojos-amarillo'];

test('(viii) agenda: assertScene pasa, sin ranura, con Loopy dentro de su disco y una pildora card', async () => {
  const { SCENES, assertScene, sceneBoxes, boxInsideCircle } = await loadScenes();
  const agenda = SCENES.agenda;
  assert.ok(agenda, 'falta la escena agenda');
  assert.doesNotThrow(() => assertScene('agenda'));
  assert.equal([agenda.kind, agenda.w, agenda.h, agenda.ground, agenda.stage].join(' '), 'full 480 480 purple yellow');
  assert.equal(agenda.layers.some((l) => l.kind === 'slot'), false, 'agenda no lleva ranura');
  const disc = agenda.layers.find((l) => l.kind === 'disc');
  const boxes = sceneBoxes(agenda);
  for (const l of agenda.layers.filter((x) => x.kind === 'loopy')) {
    assert.ok(boxInsideCircle(boxes.find((b) => b.id === l.id).box, disc.cx, disc.cy, disc.r, 4), `${l.id} dentro del disco`);
  }
  assert.deepEqual(agenda.layers.filter((l) => l.kind === 'pill').map((p) => [p.word, p.shape ?? 'pill']).sort(), [['seo', 'pill'], ['team work', 'card']]);
});

test('(viii) avatares: cuatro escenas de 120 x 120, Loopy dentro del disco, sin pildora ni ranura ni garabatos', async () => {
  const { SCENES, assertScene, sceneTraits, PHOTO_SLOTS } = await loadScenes();
  const expected = {
    'avatar-ojo-morado': ['lupa', 'purple'],
    'avatar-ojo-amarillo': ['lupa', 'yellow'],
    'avatar-ojos-morado': ['ojos', 'purple'],
    'avatar-ojos-amarillo': ['ojos', 'yellow'],
  };
  for (const name of AVATAR_SCENES) {
    const scene = SCENES[name];
    assert.ok(scene, `falta la escena ${name}`);
    assert.doesNotThrow(() => assertScene(name), name);
    assert.equal([scene.family, scene.kind, scene.w, scene.h, scene.ground].join(' '), 'avatar avatar 120 120 light', name);
    const loopy = scene.layers.filter((l) => l.kind === 'loopy');
    assert.deepEqual([loopy[0]?.art, scene.stage], expected[name], `${name}: Loopy y escenario`);
    assert.equal(loopy.length, 1);
    const traits = sceneTraits(scene);
    for (const t of ['pill', 'slot', 'doodle', 'dots']) assert.equal(traits.has(t), false, `${name}: no lleva ${t}`);
  }
  assert.equal(new Set(AVATAR_SCENES.map((n) => JSON.stringify(SCENES[n].layers))).size, 4, 'los cuatro avatares son distintos');
  assert.deepEqual(PHOTO_SLOTS.map((s) => s.name).sort(), ['hero', 'whynow'], 'PHOTO_SLOTS sigue con dos entradas');
});

test('(viii) agenda y avatares: cada mutación lanza nombrando escena, capa y regla', async () => {
  const cases = [
    ['agenda', 'R9', (s) => { s.layers.push({ id: 'agenda-slot', kind: 'slot', on: 'ground', name: 'agenda', x: 20, y: 20, w: 40, h: 40, rx: 4, fill: 'white', shadow: [2, 2] }); }, 'agenda-slot'],
    ['agenda', 'R3', (s) => { layerOf(s, 'agenda-loopy').cx += 60; }, 'agenda-loopy'],
    ['agenda', 'R7', (s) => { layerOf(s, 'agenda-pill-seo').word = 'hola'; }, 'agenda-pill-seo'],
    ['agenda', 'R6', (s) => { layerOf(s, 'agenda-puntos').x = 440; }, 'agenda-puntos'],
    ...AVATAR_SCENES.flatMap((name) => [
      [name, 'R10', (s) => { s.layers.push({ id: `${name}-pill`, kind: 'pill', on: 'ground', word: 'seo', bg: 'yellow', fg: 'dark', x: 8, y: 90, anchor: 'left', fs: 10 }); }, 'avatar'],
      [name, 'R3', (s) => { layerOf(s, `${name}-loopy`).cx += 40; }, `${name}-loopy`],
      [name, 'R9', (s) => { s.layers.push({ id: `${name}-slot`, kind: 'slot', on: 'ground', name, x: 4, y: 4, w: 20, h: 20, rx: 4, fill: 'white', shadow: [2, 2] }); }, `${name}-slot`],
    ]),
  ];
  for (const [name, rule, fn, layer] of cases) {
    const message = await mutate(name, fn);
    assert.ok(message, `${name} ${rule}: la mutación no lanzó`);
    assert.ok(message.startsWith(`Escena "${name}"`), `${name} ${rule}: ${message}`);
    assert.ok(message.includes(layer) && message.includes(rule), `${name} ${rule}: mensaje sin capa o regla: ${message}`);
  }
});

test('(viii) retiro del collage viejo: sin PIECES, sprite de ocho simbolos lg y sin clases de contorno', async () => {
  const rules = await loadRules();
  assert.equal('PIECES' in rules, false, 'collage-rules.mjs ya no exporta PIECES');
  assert.equal(Object.keys(rules.SCENE_PIECES).length, 8);
  const sprite = readFileSync('src/components/collage/CollageSprite.astro', 'utf8');
  assert.deepEqual([...sprite.matchAll(/<symbol id="([^"]+)"/g)].map((m) => m[1]).sort(), Object.values(rules.SCENE_PIECES).map((p) => p.symbol).sort());
  assert.ok(!/\bcs-[a-z]/.test(sprite), 'CollageSprite.astro conserva el prefijo antiguo');
  assert.ok(!/vector-effect|--collage-stroke/.test(sprite.replace(/\.lg-line[\s\S]*?\}/, '')), 'clases de contorno viejas fuera de lg-line');
  const rulesText = readFileSync('src/components/collage/collage-rules.mjs', 'utf8');
  for (const gone of ['ojos-izq', 'ojos-der', 'ojos-abajo', "'sticker-", "'chip-", 'fixed:']) assert.ok(!rulesText.includes(gone), `collage-rules.mjs conserva ${gone}`);
  assert.ok(!/(^|[^_A-Z])PIECES/m.test(rulesText), 'queda una tabla PIECES');
});

test('(viii) CollagePiece: funciones puras de simbolo, esquema y color por defecto', async () => {
  const { pieceSymbol, pieceScheme, defaultPieceColor, assertToneSafe } = await loadRules();
  assert.equal(pieceSymbol('lupa').symbol, 'lg-lupa');
  assert.equal(pieceSymbol('garabato').family, 'doodle');
  assert.throws(() => pieceSymbol('loop'), /pieza desconocida/i);
  assert.throws(() => pieceSymbol('ojos-izq'), /pieza desconocida/i);
  assert.equal(pieceScheme('lupa', 'light'), 'A');
  assert.equal(pieceScheme('ojos', 'yellow'), 'A');
  assert.equal(pieceScheme('ojos', 'purple'), 'B');
  assert.throws(() => pieceScheme('lupa', 'dark'), /oscuro/);
  assert.equal(pieceScheme('flecha', 'purple'), null, 'los garabatos no tienen esquema');
  assert.deepEqual(
    ['light', 'yellow', 'dark', 'purple'].map(defaultPieceColor),
    ['purple', 'dark', 'yellow', 'yellow'],
  );
  for (const tone of ['light', 'yellow', 'dark', 'purple']) assert.doesNotThrow(() => assertToneSafe(tone, [defaultPieceColor(tone)], 'p'));
  assert.throws(() => assertToneSafe('dark', ['purple'], 'CollagePiece'), /prohibido/);
  const text = readFileSync('src/components/collage/CollagePiece.astro', 'utf8');
  assert.match(text, /assertToneSafe\(/);
  assert.match(text, /defaultPieceColor\(/);
  assert.match(text, /pieceScheme\(/);
  assert.ok(!/PIECES(?!_)/.test(text.replace(/SCENE_PIECES/g, '')), 'CollagePiece usa la tabla vieja');
});

test('(viii) AgendaCollage, Avatar y CollagePiece montan el mecanismo y no traen hex ni set:html', () => {
  const agenda = readFileSync('src/components/collage/AgendaCollage.astro', 'utf8');
  const avatar = readFileSync('src/components/collage/Avatar.astro', 'utf8');
  assert.match(agenda, /<CollageScene\s+scene="agenda"/);
  assert.match(agenda, /display:\s*none/);
  assert.match(agenda, /min-width:\s*64em/);
  assert.match(avatar, /<CollageScene[^>]*scene=\{`avatar-\$\{variant\}`\}[^>]*\bbare\b/);
  assert.match(avatar, /variant=\{variant\}/);
  for (const f of ['AgendaCollage.astro', 'Avatar.astro', 'CollagePiece.astro', 'CollageSprite.astro']) {
    const text = readFileSync(`src/components/collage/${f}`, 'utf8');
    assert.ok(!/#[0-9a-fA-F]{3}(?![0-9a-zA-Z_-])|#[0-9a-fA-F]{6}(?![0-9a-zA-Z_-])/.test(text), `${f}: hex`);
    assert.ok(!/set:html|<text[\s>]|<title|<image|<img[\s>]|<script|@keyframes|transition/.test(text), `${f}: construccion prohibida`);
  }
  const scene = readFileSync('src/components/collage/CollageScene.astro', 'utf8');
  assert.match(scene, /assertScene\(/);
});

// ---------------------------------------------------------------------------------------------
// (ix) Marco de foto y regla R12 (plan 02-11)
// ---------------------------------------------------------------------------------------------

test('marco de foto: photoFrame trae la caja de la ranura, sus porcentajes y es nulo sin ranura', async () => {
  const { SCENES, PHOTO_SLOTS, photoFrame } = await loadScenes();
  for (const name of ['hero', 'whynow']) {
    const f = photoFrame(name);
    const slot = PHOTO_SLOTS.find((s) => s.name === name);
    const scene = SCENES[name];
    assert.deepEqual([f.x, f.y, f.w, f.h], [slot.x, slot.y, slot.w, slot.h]);
    assert.equal(f.slot, name);
    assert.ok(f.rx > 0 && f.fill && Array.isArray(Object.values(f.shadow)) && f.shadow.dx > 0 && f.shadow.dy > 0);
    assert.equal(f.sceneW, scene.w);
    assert.equal(f.sceneH, scene.h);
    assert.ok(Math.abs(f.pct.left - (slot.x / scene.w) * 100) < 1e-9 && Math.abs(f.pct.height - (slot.h / scene.h) * 100) < 1e-9);
    assert.ok(Math.abs(f.pct.top - (slot.y / scene.h) * 100) < 1e-9 && Math.abs(f.pct.width - (slot.w / scene.w) * 100) < 1e-9);
  }
  assert.equal(photoFrame('agenda'), null);
});

test('R12: un garabato o una retícula sobre la ranura lanza; movidos fuera pasan; una píldora encima pasa', async () => {
  const { SCENES, assertScene } = await loadScenes();
  const copy = () => structuredClone(SCENES.hero);
  assert.doesNotThrow(() => assertScene(copy()));
  const slot = SCENES.hero.layers.find((l) => l.kind === 'slot');
  const onSlot = { x: slot.x + 60, y: slot.y + 120 };
  const doodle = copy();
  doodle.layers.push({ id: 'hero-extra', kind: 'doodle', group: 'doodles', on: 'ground', piece: 'flecha', ...onSlot, w: 60, color: 'purple' });
  assert.throws(() => assertScene(doodle), /Escena "hero", capa "hero-extra".*R12/);
  const dots = copy();
  dots.layers.push({ id: 'hero-extra', kind: 'dots', group: 'dots', on: 'ground', ...onSlot, w: 60, color: 'purple' });
  assert.throws(() => assertScene(dots), /Escena "hero", capa "hero-extra".*R12/);
  const away = copy();
  away.layers.push({ id: 'hero-extra', kind: 'doodle', group: 'doodles', on: 'ground', piece: 'mas', x: 470, y: 470, w: 24, color: 'purple' });
  assert.doesNotThrow(() => assertScene(away));
  const pill = copy();
  const p = pill.layers.find((l) => l.kind === 'pill');
  Object.assign(p, { x: slot.x + slot.w - 4, anchor: 'right', y: slot.y + slot.h - 20 });
  try {
    assertScene(pill);
  } catch (error) {
    assert.ok(!/R12/.test(error.message), `una píldora sobre la ranura no debe lanzar R12: ${error.message}`);
  }
});

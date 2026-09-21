// Guardas de fotos (plan 02-11): registro de licencias, pesos, metadatos, tinta, cobertura, manifiesto,
// componente y dist. Cada regla tiene su mutación.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { parseLicenses, validateLicenses, parseElection, parseLicenseSections, evaluatePhotoGate, isCalendarDate, parseApproval, LICENSE_NAMES } from '../../scripts/lib/photo-licenses.mjs';
import { parseTokens, hexToRgb, contrastRaw } from '../../scripts/lib/contrast.mjs';
import { inkCoverage } from '../../scripts/photos/halftone.mjs';
import { PHOTOS, PHOTO_SLOT_NAMES, PHOTO_LOADING, chosenPhoto, photoById, assertPhotoForSlot } from '../../src/components/collage/photos.mjs';
import { PHOTO_SLOTS, SCENES } from '../../src/components/collage/scenes.mjs';

const LICENSES = readFileSync('src/assets/photos/LICENSES.md', 'utf8');
const TREATED = 'src/assets/photos/treated';
const tokens = parseTokens(readFileSync('src/styles/tokens.css', 'utf8'));
const INK = hexToRgb(tokens.theme['--color-brand-dark']);
const rows = parseLicenses(LICENSES);

const GOOD = {
  id: 'hero-a', derived: 'treated/hero-a.png', source: 'https://unsplash.com/photos/abc', author: 'Alguien',
  license: 'Unsplash License', licenseUrl: LICENSE_NAMES['Unsplash License'], downloaded: '2026-09-19',
  dimensions: '1600x2408', sha256: 'a'.repeat(64), approval: 'pendiente', note: 'ojo',
};

// (i) registro con fixtures en memoria ---------------------------------------------------------
test('registro: una fila válida pasa y cada campo mal formado falla nombrando id y campo', () => {
  assert.deepEqual(validateLicenses([GOOD]), []);
  const mutations = {
    source: 'http://unsplash.com/x', author: '  ', license: 'MIT', licenseUrl: 'https://unsplash.com/otra',
    downloaded: '19-09-2026', dimensions: '1600 x 2408', sha256: 'a'.repeat(63), approval: 'aprobada',
    note: 'nota — con guion largo',
  };
  for (const [field, value] of Object.entries(mutations)) {
    const errors = validateLicenses([{ ...GOOD, [field]: value }]);
    assert.ok(errors.some((e) => e.includes('hero-a') && e.includes(field)), `${field}: ${JSON.stringify(errors)}`);
  }
  assert.ok(validateLicenses([{ ...GOOD, note: 'a – b' }]).length > 0, 'guion corto');
  assert.deepEqual(validateLicenses([{ ...GOOD, approval: 'aprobada por Ari el 2026-09-20' }]), []);
});

// (ii) registro real ---------------------------------------------------------------------------
test('registro real: rasters solo en treated, cada uno con fila, manifiesto y licencia citada', () => {
  assert.deepEqual(validateLicenses(rows), []);
  const found = readdirSync('src/assets/photos', { recursive: true }).filter((f) => /\.(png|jpe?g|webp|avif|gif)$/i.test(f));
  for (const f of found) assert.ok(f.startsWith('treated/'), `${f} fuera de treated/`);
  const ids = rows.map((r) => r.id);
  for (const f of found) assert.ok(ids.includes(f.replace(/^treated\//, '').replace(/\.png$/, '')), `${f} sin fila`);
  const sections = parseLicenseSections(LICENSES);
  for (const row of rows) {
    assert.ok(existsSync(`src/assets/photos/${row.derived}`), `${row.id}: falta el derivado`);
    assert.ok(PHOTOS.some((p) => p.id === row.id), `${row.id}: sin entrada en el manifiesto`);
    const s = sections.find((x) => x.name === row.license);
    assert.ok(s && s.url === row.licenseUrl && /^\d{4}-\d{2}-\d{2}$/.test(s.date) && s.quote.length > 40, `${row.id}: licencia sin cita`);
  }
  assert.ok(['abierta', 'cerrada'].includes(parseElection(LICENSES)));
  assert.ok(!/[–—]/.test(LICENSES), 'LICENSES.md trae guion largo o corto');
});

// (iii) a (vi) PNG tratados ---------------------------------------------------------------------
const treatedFiles = existsSync(TREATED) ? readdirSync(TREATED).filter((f) => f.endsWith('.png')) : [];
async function alphaOf(file) {
  const { data } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return data;
}

test('PNG tratados: peso, sin metadatos, con paleta, tinta del token y cobertura entre 0.12 y 0.55', async () => {
  assert.ok(treatedFiles.length > 0, 'no hay PNG tratados');
  for (const f of treatedFiles) {
    const path = `${TREATED}/${f}`;
    assert.ok(statSync(path).size <= 30720, `${f}: pesa ${statSync(path).size}`);
    const meta = await sharp(path).metadata();
    assert.ok(!meta.exif && !meta.xmp && !meta.icc, `${f}: trae metadatos`);
    assert.ok(meta.isPalette, `${f}: sin paleta`);
    const data = await alphaOf(path);
    let ink = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] === 255) {
        ink += 1;
        assert.deepEqual([data[i], data[i + 1], data[i + 2]], INK, `${f}: tinta distinta del token`);
      } else assert.equal(data[i + 3], 0, `${f}: alfa intermedio`);
    }
    const coverage = ink / (data.length / 4);
    assert.ok(coverage >= 0.12 && coverage <= 0.55, `${f}: cobertura ${coverage}`);
  }
});

test('mutación de cobertura: todo transparente y todo opaco quedan fuera del rango', () => {
  assert.ok(inkCoverage(new Uint8Array(100)) < 0.12);
  assert.ok(inkCoverage(new Uint8Array(100).fill(255)) > 0.55);
});

test('dimensiones: iguales a params.out y con la proporción de la ranura', async () => {
  for (const p of PHOTOS) {
    const meta = await sharp(`${TREATED}/${p.id}.png`).metadata();
    assert.equal(meta.width, p.params.out.w);
    assert.equal(meta.height, p.params.out.h);
    const slot = PHOTO_SLOTS.find((s) => s.name === p.slot);
    assert.ok(Math.abs(meta.width / meta.height / slot.aspect - 1) <= 0.005, `${p.id}: proporción`);
    const row = rows.find((r) => r.id === p.id);
    const [w, h] = row.dimensions.split('x').map(Number);
    const c = p.params.crop;
    assert.ok(Math.abs((c.width * w) / (c.height * h) / (p.params.out.w / p.params.out.h) - 1) <= 0.01, `${p.id}: recorte`);
  }
});

// (viii) manifiesto ----------------------------------------------------------------------------
test('manifiesto: ids, ranuras, una elegida por ranura y política de carga', () => {
  assert.deepEqual([...PHOTO_SLOT_NAMES].sort(), Object.keys(Object.fromEntries(PHOTO_SLOTS.map((s) => [s.name, 1]))).sort());
  for (const p of PHOTOS) {
    assert.match(p.id, /^(hero|whynow)-[a-z]$/);
    assert.ok(PHOTO_SLOT_NAMES.includes(p.slot));
    assert.ok(p.id.startsWith(`${p.slot}-`));
  }
  for (const slot of PHOTO_SLOT_NAMES) {
    const withPhotos = PHOTOS.filter((p) => p.slot === slot);
    if (withPhotos.length) assert.equal(withPhotos.filter((p) => p.chosen).length, 1, `${slot}: una elegida`);
  }
  assert.deepEqual({ ...PHOTO_LOADING }, { hero: 'eager', whynow: 'lazy' });
  assert.equal(chosenPhoto('hero').id, 'hero-a');
  assert.equal(photoById('hero-a').slot, 'hero');
  assert.throws(() => assertPhotoForSlot('hero-a', 'whynow'), /hero-a/);
  assert.throws(() => assertPhotoForSlot('nada-x', 'hero'), /nada-x/);
  assert.doesNotThrow(() => assertPhotoForSlot('hero-a', 'hero'));
});

// (ix) par tinta y relleno ----------------------------------------------------------------------
test('par tinta y relleno de cada ranura: contraste medido de 4.5 o más', () => {
  const ink = tokens.theme['--color-brand-dark'];
  for (const slot of PHOTO_SLOT_NAMES) {
    const layer = SCENES[slot].layers.find((l) => l.kind === 'slot');
    const fill = tokens.theme[`--color-brand-${layer.fill}`];
    assert.ok(contrastRaw(ink, fill) >= 4.5, `${slot}: ${contrastRaw(ink, fill)}`);
  }
});

// (x) texto de los componentes -------------------------------------------------------------------
test('CollagePhoto.astro y CollageScene.astro: contrato de texto', () => {
  const photo = readFileSync('src/components/collage/CollagePhoto.astro', 'utf8');
  assert.ok(!/#[0-9a-fA-F]{3,6}(?![0-9a-zA-Z_-])/.test(photo), 'hex');
  assert.ok(!/\btitle=|\brole=/.test(photo), 'title o role');
  assert.ok(/alt=""/.test(photo) && /format="png"/.test(photo) && /data-photo-frame/.test(photo));
  assert.ok(!/fetchpriority|priority/i.test(photo), 'prioridad de descarga');
  for (const m of photo.matchAll(/from\s+['"]([^'"]+)['"]/g)) assert.ok(!m[1].includes('assets/') || m[1].includes('assets/photos/treated'), m[1]);
  const scene = readFileSync('src/components/collage/CollageScene.astro', 'utf8');
  const iSvg = scene.indexOf('</svg>');
  const iPhoto = scene.indexOf('<CollagePhoto');
  const iPills = scene.indexOf('cw-pills', iPhoto);
  assert.ok(iSvg > 0 && iPhoto > iSvg && iPills > iPhoto, 'CollagePhoto entre la capa svg y las píldoras');
});

// (xi) dist -------------------------------------------------------------------------------------
test('dist: img de las fotos elegidas, locales, con alt vacío, dimensiones y carga según su ranura', { skip: !existsSync('dist/index.html') && 'sin dist' }, () => {
  const html = readFileSync('dist/index.html', 'utf8');
  // Las fotos del equipo (data-team-photo) las guarda tests/guards/team-photos.test.mjs y los logos de clientes
  // (data-client-logo) tests/guards/hero-clients.test.mjs.
  const imgs = (html.match(/<img\b[^>]*>/g) ?? []).filter((t) => !/data-team-photo=|data-client-logo=/.test(t));
  const chosen = PHOTO_SLOTS.map((s) => chosenPhoto(s.name)).filter(Boolean);
  assert.equal(imgs.length, chosen.length, 'una img por foto elegida');
  let total = 0;
  for (const tag of imgs) {
    assert.match(tag, /\balt(=""|\s|>)/);
    assert.ok(!/\balt="[^"]/.test(tag), 'alt con texto');
    assert.match(tag, /\bwidth="\d+"/);
    assert.match(tag, /\bheight="\d+"/);
    const src = /src="([^"]+)"/.exec(tag)[1];
    assert.ok(src.startsWith('/_astro/'), src);
    assert.ok(!/fetchpriority|title=/i.test(tag));
    assert.match(tag, /loading="(eager|lazy)"/);
    const size = statSync(`dist${src}`).size;
    assert.ok(size <= 25600, `${src}: ${size}`);
    total += size;
  }
  assert.ok(total <= 40960, `suma ${total}`);
  assert.ok(!/<source\b[^>]*src(set)?="(https?:)?\/\//.test(html));
  assert.equal(imgs.filter((t) => /loading="eager"/.test(t)).length, chosen.filter((p) => PHOTO_LOADING[p.slot] === 'eager').length);
});

// conjunto de fotos ------------------------------------------------------------------------------
/** Errores del conjunto según la elección: abierta = dos por ranura, cerrada = una por ranura aprobada. */
function photoSetErrors({ photos, rows: licenseRows, election, slots }) {
  const errors = [];
  for (const slot of slots) {
    const inSlot = photos.filter((p) => p.slot === slot);
    const expected = election === 'abierta' ? 2 : 1;
    if (inSlot.length !== expected) errors.push(`${slot}: ${inSlot.length} fotos y con la elección ${election} se esperan ${expected}`);
    if (inSlot.filter((p) => p.chosen).length !== 1) errors.push(`${slot}: debe haber exactamente una elegida`);
    for (const p of inSlot) {
      const row = licenseRows.find((r) => r.id === p.id);
      if (!row) errors.push(`${p.id}: sin fila en LICENSES.md`);
      else if (election === 'cerrada' && !/^aprobada por .+ el \d{4}-\d{2}-\d{2}$/.test(row.approval)) errors.push(`${p.id}: elección cerrada sin aprobación`);
    }
  }
  for (const r of licenseRows) if (!photos.some((p) => p.id === r.id)) errors.push(`${r.id}: fila sin entrada en el manifiesto`);
  return errors;
}

test('conjunto de fotos: dos por ranura con la elección abierta, una elegida por ranura y una fila por foto', () => {
  const election = parseElection(LICENSES);
  const set = { photos: PHOTOS, rows, election, slots: PHOTO_SLOT_NAMES };
  assert.deepEqual(photoSetErrors(set), []);
  assert.deepEqual([...PHOTO_SLOT_NAMES].sort(), PHOTO_SLOTS.map((s) => s.name).sort());
  if (election === 'abierta') {
    assert.deepEqual(PHOTOS.map((p) => p.id).sort(), ['hero-a', 'hero-b', 'whynow-a', 'whynow-b']);
    assert.equal(rows.length, 4);
    assert.deepEqual(PHOTOS.filter((p) => p.chosen).map((p) => p.id).sort(), ['hero-a', 'whynow-a']);
  }
  for (const p of PHOTOS) assert.ok(PHOTO_SLOTS.some((s) => s.name === p.slot), `${p.id}: ranura`);
});

test('conjunto de fotos: mutaciones (dos elegidas, ranura sin candidatas, id sin fila, cerrada sin aprobación)', () => {
  const base = { photos: PHOTOS, rows, election: 'abierta', slots: PHOTO_SLOT_NAMES };
  assert.deepEqual(photoSetErrors(base), []);
  const twoChosen = PHOTOS.map((p) => (p.id === 'hero-b' ? { ...p, chosen: true } : p));
  assert.ok(photoSetErrors({ ...base, photos: twoChosen }).some((e) => e.includes('hero') && e.includes('elegida')));
  const noWhynow = PHOTOS.filter((p) => p.slot !== 'whynow');
  assert.ok(photoSetErrors({ ...base, photos: noWhynow }).some((e) => e.startsWith('whynow')));
  const noRow = rows.filter((r) => r.id !== 'whynow-b');
  assert.ok(photoSetErrors({ ...base, rows: noRow }).some((e) => e.includes('whynow-b')));
  assert.ok(photoSetErrors({ ...base, election: 'cerrada' }).length > 0, 'cerrada con dos por ranura');
  const closed = PHOTOS.filter((p) => p.chosen);
  assert.ok(photoSetErrors({ photos: closed, rows: rows.filter((r) => closed.some((p) => p.id === r.id)), election: 'cerrada', slots: PHOTO_SLOT_NAMES }).some((e) => e.includes('aprobación')));
  const approved = rows.filter((r) => closed.some((p) => p.id === r.id)).map((r) => ({ ...r, approval: 'aprobada por Ari el 2026-09-20' }));
  assert.deepEqual(photoSetErrors({ photos: closed, rows: approved, election: 'cerrada', slots: PHOTO_SLOT_NAMES }), []);
});

// puerta de producción -----------------------------------------------------------------------
test('puerta: en production bloquea aprobación pendiente y candidatas sin elegir; en otro entorno solo advierte', () => {
  const photos = [{ id: 'hero-a', slot: 'hero', chosen: true }, { id: 'hero-b', slot: 'hero', chosen: false }];
  const rowsGate = [{ ...GOOD }, { ...GOOD, id: 'hero-b' }];
  const prod = evaluatePhotoGate({ rows: rowsGate, photos, files: ['hero-a', 'hero-b'], env: 'production' });
  assert.ok(prod.errors.length >= 2 && prod.errors.some((e) => e.includes('hero-a')) && prod.errors.some((e) => e.includes('hero-b')));
  const dev = evaluatePhotoGate({ rows: rowsGate, photos, files: ['hero-a', 'hero-b'], env: 'development' });
  assert.equal(dev.errors.length, 0);
  assert.ok(dev.warnings.length >= 2);
  const ok = evaluatePhotoGate({ rows: [{ ...GOOD, approval: 'aprobada por Ari el 2026-09-20' }], photos: [photos[0]], files: ['hero-a'], env: 'production' });
  assert.deepEqual(ok.errors, []);
});

test('puerta: una elegida sin fila bloquea siempre y una foto aprobada sin sobrantes no bloquea (mutación por regla)', () => {
  const photos = [{ id: 'hero-a', slot: 'hero', chosen: true }];
  for (const env of ['production', 'development']) {
    assert.ok(evaluatePhotoGate({ rows: [], photos, files: ['hero-a'], env }).errors.some((e) => e.includes('hero-a')), `sin fila en ${env}`);
  }
  // pendiente en producción bloquea; la misma foto aprobada no (la prueba distingue las dos)
  assert.ok(evaluatePhotoGate({ rows: [{ ...GOOD }], photos, files: ['hero-a'], env: 'production' }).errors.length >= 1);
  assert.deepEqual(evaluatePhotoGate({ rows: [{ ...GOOD, approval: 'aprobada por Ari el 2026-09-20' }], photos, files: ['hero-a'], env: 'production' }).errors, []);
  // una candidata sobrante en producción bloquea; sin ella no
  const approved = [{ ...GOOD, approval: 'aprobada por Ari el 2026-09-20' }];
  assert.ok(evaluatePhotoGate({ rows: approved, photos, files: ['hero-a', 'hero-b'], env: 'production' }).errors.some((e) => e.includes('hero-b')));
  assert.equal(evaluatePhotoGate({ rows: approved, photos, files: ['hero-a', 'hero-b'], env: 'development' }).errors.length, 0);
});

// WR-05: la puerta hace cumplir lo que prometen las pruebas (una elegida por ranura, aprobación con fecha
// real, derivado, coherencia con `Elección:` y sha256 del original). Cada regla con su mutación.
const APPROVED = 'aprobada por Ari el 2026-09-20';
const gatePhotos = [
  { id: 'hero-a', slot: 'hero', chosen: true },
  { id: 'whynow-a', slot: 'whynow', chosen: true },
];
const gateRows = (approval = APPROVED) => [
  { ...GOOD, approval },
  { ...GOOD, id: 'whynow-a', derived: 'treated/whynow-a.png', approval },
];
const gate = (over = {}) =>
  evaluatePhotoGate({ rows: gateRows(), photos: gatePhotos, files: ['hero-a', 'whynow-a'], env: 'production', slots: ['hero', 'whynow'], ...over });

test('puerta: una y solo una elegida por ranura, con la ranura sin candidatas incluida (bloquea en todo entorno)', () => {
  assert.deepEqual(gate().errors, []);
  for (const env of ['production', 'development']) {
    const twoChosen = [...gatePhotos, { id: 'hero-b', slot: 'hero', chosen: true }];
    const two = gate({ photos: twoChosen, rows: [...gateRows(), { ...GOOD, id: 'hero-b', derived: 'treated/hero-b.png', approval: APPROVED }], files: ['hero-a', 'hero-b', 'whynow-a'], env });
    assert.ok(two.errors.some((e) => e.includes('"hero"') && e.includes('exactamente una')), `dos elegidas en ${env}`);
    const noneChosen = gate({ photos: gatePhotos.map((p) => ({ ...p, chosen: p.slot !== 'hero' })), env });
    assert.ok(noneChosen.errors.some((e) => e.includes('"hero"') && e.includes('tiene 0')), `ninguna elegida en ${env}`);
    const noPhotos = gate({ photos: gatePhotos.filter((p) => p.slot !== 'whynow'), rows: gateRows().slice(0, 1), files: ['hero-a'], env });
    assert.ok(noPhotos.errors.some((e) => e.includes('"whynow"')), `ranura sin fotos en ${env}`);
  }
});

test('aprobación: la fecha debe existir en el calendario y no ser anterior a la descarga (registro y puerta)', () => {
  assert.ok(isCalendarDate('2026-09-20') && isCalendarDate('2028-02-29'));
  for (const bad of ['2026-02-31', '2026-13-01', '2026-00-10', '2026-09-00', '2027-02-29', '0001-01-01', '26-09-20']) assert.ok(!isCalendarDate(bad), bad);
  assert.deepEqual(parseApproval('pendiente'), { pending: true });
  assert.deepEqual(parseApproval(APPROVED), { pending: false, approver: 'Ari', date: '2026-09-20' });
  assert.equal(parseApproval('aprobada por  el 2026-09-20'), null, 'sin nombre');
  assert.equal(parseApproval('aprobada por Ari el 2026-09-20 y más'), null);
  for (const approval of ['aprobada por Ari el 2026-02-31', 'aprobada por Ari el 2026-13-01', 'aprobada por Ari el 2026-09-18', 'aprobada por  el 2026-09-20']) {
    assert.ok(validateLicenses([{ ...GOOD, approval }]).some((e) => e.includes('hero-a') && e.includes('approval')), `registro: ${approval}`);
    for (const env of ['production', 'development']) {
      assert.ok(gate({ rows: gateRows(approval), env }).errors.some((e) => e.includes('hero-a') && e.includes('approval')), `puerta ${env}: ${approval}`);
    }
  }
  assert.deepEqual(validateLicenses([{ ...GOOD, approval: 'aprobada por Ari el 2026-09-19' }]), [], 'el mismo día de la descarga vale');
});

test('puerta: la elegida necesita su derivado y la columna `derived` de su fila', () => {
  assert.ok(gate({ files: ['whynow-a'] }).errors.some((e) => e.includes('hero-a') && e.includes('derivado')));
  assert.ok(gate({ rows: [{ ...GOOD, approval: APPROVED, derived: 'treated/otra.png' }, gateRows()[1]] }).errors.some((e) => e.includes('hero-a') && e.includes('treated/otra.png')));
});

test('puerta: la línea `Elección:` debe ser coherente con el manifiesto y el registro', () => {
  const candidates = [...gatePhotos, { id: 'hero-b', slot: 'hero', chosen: false }];
  const candidateRows = [...gateRows(), { ...GOOD, id: 'hero-b', derived: 'treated/hero-b.png', approval: 'pendiente' }];
  // falta la línea
  assert.ok(gate({ election: null, env: 'development' }).errors.some((e) => e.includes('Elección')));
  // cerrada y limpia: no bloquea
  assert.deepEqual(gate({ election: 'cerrada' }).errors, []);
  // cerrada con una candidata en el manifiesto, con una aprobación pendiente o con una fila huérfana: bloquea también sin producción
  for (const env of ['production', 'development']) {
    assert.ok(gate({ election: 'cerrada', photos: candidates, rows: candidateRows, env }).errors.some((e) => e.includes('candidata "hero-b"')), `candidata en ${env}`);
    assert.ok(gate({ election: 'cerrada', rows: gateRows('pendiente'), env }).errors.some((e) => e.includes('pendiente') && e.includes('cerrada')), `pendiente en ${env}`);
    assert.ok(gate({ election: 'cerrada', rows: candidateRows, env }).errors.some((e) => e.includes('fila "hero-b"')), `huérfana en ${env}`);
  }
  // abierta: solo advierte fuera de producción y bloquea en producción, aunque todo lo demás esté aprobado
  assert.ok(gate({ election: 'abierta' }).errors.some((e) => e.includes('sigue abierta')));
  const dev = gate({ election: 'abierta', env: 'development' });
  assert.deepEqual(dev.errors, []);
  assert.ok(dev.warnings.some((w) => w.includes('sigue abierta')));
});

test('puerta: el sha256 registrado debe coincidir con el original de photo-sources/ cuando existe (mutación por id)', () => {
  assert.deepEqual(gate({ originals: { 'hero-a': GOOD.sha256, 'whynow-a': GOOD.sha256 } }).errors, []);
  assert.deepEqual(gate({ originals: {} }).errors, [], 'sin originales (CI) no se comprueba');
  for (const env of ['production', 'development']) {
    const errors = gate({ originals: { 'hero-a': 'b'.repeat(64) }, env }).errors;
    assert.ok(errors.some((e) => e.includes('hero-a') && e.includes('sha256')), `sha256 distinto en ${env}`);
    assert.ok(!errors.some((e) => e.includes('whynow-a') && e.includes('sha256')));
  }
});

test('puerta: el estado real (elección abierta, aprobación pendiente) no bloquea fuera de producción y sí en production', () => {
  const files = readdirSync(TREATED).filter((f) => f.endsWith('.png')).map((f) => f.replace(/\.png$/, ''));
  const originals = {};
  for (const p of PHOTOS) {
    const src = ['jpg', 'jpeg', 'png', 'webp'].map((e) => `photo-sources/${p.id}.${e}`).find((f) => existsSync(f));
    if (src) originals[p.id] = createHash('sha256').update(readFileSync(src)).digest('hex');
  }
  const input = { rows, photos: PHOTOS, files, slots: PHOTO_SLOT_NAMES, election: parseElection(LICENSES), originals };
  assert.deepEqual(evaluatePhotoGate({ ...input, env: 'development' }).errors, []);
  const pending = rows.filter((r) => PHOTOS.some((p) => p.chosen && p.id === r.id)).some((r) => r.approval === 'pendiente');
  assert.equal(evaluatePhotoGate({ ...input, env: 'production' }).errors.length > 0, pending || parseElection(LICENSES) === 'abierta' || PHOTOS.some((p) => !p.chosen));
});

test('check-photos.mjs: sale 0 sin producción, 1 en production con el estado actual y solo el valor exacto bloquea; el mensaje trae los pasos de cierre', () => {
  const run = (value) => {
    const env = { ...process.env };
    delete env.PUBLIC_ENV;
    if (value !== undefined) env.PUBLIC_ENV = value;
    return spawnSync(process.execPath, ['scripts/check-photos.mjs'], { encoding: 'utf8', env });
  };
  const chosenRows = rows.filter((r) => PHOTOS.some((p) => p.chosen && p.id === r.id));
  const blocked = chosenRows.some((r) => r.approval === 'pendiente') || PHOTOS.some((p) => !p.chosen);
  assert.equal(run().status, 0, 'sin PUBLIC_ENV');
  assert.equal(run('Production').status, 0, 'Production no es production');
  const prod = run('production');
  assert.equal(prod.status, blocked ? 1 : 0, 'production con el estado actual');
  if (blocked) {
    const out = prod.stdout + prod.stderr;
    assert.ok(/FAIL/.test(out) && /Cómo cerrar la elección/.test(out) && /photos\.mjs/.test(out) && /LICENSES\.md/.test(out), out);
  }
  const dev = run();
  assert.ok(/WARN/.test(dev.stdout + dev.stderr) === blocked, 'los avisos salen sin producción solo si hay pendientes');
});

test('package.json: prebuild corre check-photos y CollageScene declara la prop photo con assertPhotoForSlot', () => {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  assert.ok(pkg.scripts.prebuild.includes('check-photos'));
  const scene = readFileSync('src/components/collage/CollageScene.astro', 'utf8');
  assert.ok(/photo\?:\s*string/.test(scene) && scene.includes('assertPhotoForSlot'));
  assert.throws(() => assertPhotoForSlot('hero-a', 'whynow'), /ranura/);
  assert.throws(() => assertPhotoForSlot('no-existe', 'hero'), /no existe/);
});

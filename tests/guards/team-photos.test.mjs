// Guardas de las fotos del equipo (quick 260920-team-photos): registro de procedencia, manifiesto,
// derivados, puerta de producción y contrato de Team.astro. Cada regla tiene su mutación.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import sharp from 'sharp';
import {
  parseTeamProvenance, validateTeamProvenance, evaluateTeamPhotoGate, parseConsent, consentProblem, TEAM_SOURCE_PREFIX,
} from '../../scripts/lib/photo-licenses.mjs';
import { parseTokens, contrastRaw } from '../../scripts/lib/contrast.mjs';
import { TEAM_PHOTOS, TEAM_PHOTO_OUT, TEAM_PNG_MAX, TEAM_DISC_COLORS, teamPhotoAt } from '../../src/components/sections/team-photos.mjs';

const PROVENANCE = readFileSync('src/assets/team/PROVENANCE.md', 'utf8');
const TREATED = 'src/assets/team/treated';
const rows = parseTeamProvenance(PROVENANCE);
const tokens = parseTokens(readFileSync('src/styles/tokens.css', 'utf8'));
const ids = TEAM_PHOTOS.map((p) => p.id);
const treatedIds = () => readdirSync(TREATED).filter((f) => f.endsWith('.png')).map((f) => f.replace(/\.png$/, ''));

const GOOD = {
  id: 'juan', derived: 'treated/juan.png', source: `${TEAM_SOURCE_PREFIX}juan.avif`, downloaded: '2026-09-20',
  dimensions: '500x625', sha256: 'a'.repeat(64), authorizedBy: 'Juan Carlos Angulo, 2026-09-20', approval: 'pendiente',
  consent: 'pendiente', note: 'nota',
};
const gate = (over = {}) => evaluateTeamPhotoGate({
  rows: [GOOD], photos: [{ id: 'juan' }], files: ['juan'], env: 'development', originals: {}, ...over,
});

// (i) registro ----------------------------------------------------------------------------------
test('registro real: una fila por foto del manifiesto, válida, con derivado y sin fila huérfana', () => {
  assert.deepEqual(validateTeamProvenance(rows), []);
  assert.deepEqual(rows.map((r) => r.id).sort(), [...ids].sort());
  for (const r of rows) assert.ok(existsSync(`src/assets/${'team/' + r.derived}`), r.derived);
  assert.deepEqual(treatedIds().sort(), [...ids].sort(), 'rasters en treated distintos del manifiesto');
  for (const r of rows) assert.equal(r.downloaded, '2026-09-20');
});

test('registro: una fila válida pasa y cada campo mal formado falla nombrando id y campo (mutaciones)', () => {
  assert.deepEqual(validateTeamProvenance([GOOD]), []);
  const mutations = {
    id: 'Juan', source: 'https://otro.com/juan.avif', downloaded: '2026-02-31', dimensions: '500 x 625',
    sha256: 'a'.repeat(63), authorizedBy: '  ', approval: 'aprobada', consent: 'dado',
    note: 'nota \u2014 con guion largo',
  };
  for (const [field, value] of Object.entries(mutations)) {
    const errors = validateTeamProvenance([{ ...GOOD, [field]: value }]);
    assert.ok(errors.some((e) => e.includes(field)), `${field}: ${JSON.stringify(errors)}`);
  }
  assert.ok(validateTeamProvenance([{ ...GOOD, note: 'a \u2013 b' }]).length > 0, 'guion corto');
  assert.ok(validateTeamProvenance([{ ...GOOD, source: 'http://aprendoclub.com/api/media/file/juan.avif' }]).length > 0, 'http');
  assert.deepEqual(validateTeamProvenance([{ ...GOOD, approval: 'aprobada por Ari el 2026-09-21', consent: 'dado por Juan Carlos Angulo el 2026-09-20' }]), []);
  assert.ok(validateTeamProvenance([{ ...GOOD, approval: 'aprobada por Ari el 2026-09-19' }]).some((e) => e.includes('anterior')), 'aprobación anterior a la descarga');
  assert.ok(validateTeamProvenance([{ ...GOOD, consent: 'dado por Juan el 2026-09-19' }]).some((e) => e.includes('anterior')), 'consentimiento anterior a la descarga');
});

test('consentimiento: solo "pendiente" o "dado por <nombre> el AAAA-MM-DD" con fecha real', () => {
  assert.deepEqual(parseConsent('pendiente'), { pending: true });
  assert.equal(parseConsent('dado por Ari el 2026-09-21').who, 'Ari');
  for (const bad of ['dado', 'ok', 'dado por el 2026-09-21', 'dado por Ari el 21-09-2026', '']) assert.equal(parseConsent(bad), null, bad);
  assert.ok(consentProblem({ consent: 'dado por Ari el 2026-13-01', downloaded: '2026-09-20' }));
});

// (ii) puerta -------------------------------------------------------------------------------------
test('puerta: aprobación o consentimiento pendientes bloquean en production y solo advierten fuera de ella', () => {
  const dev = gate();
  assert.deepEqual(dev.errors, []);
  assert.equal(dev.warnings.length, 2);
  assert.ok(dev.warnings.some((w) => w.includes('aprobación de Ari')) && dev.warnings.some((w) => w.includes('consentimiento')));
  const prod = gate({ env: 'production' });
  assert.equal(prod.errors.length, 2);
  assert.deepEqual(prod.warnings, []);
  // Solo uno de los dos pendiente sigue bloqueando (mutación por campo).
  assert.equal(gate({ env: 'production', rows: [{ ...GOOD, approval: 'aprobada por Ari el 2026-09-21' }] }).errors.length, 1);
  assert.equal(gate({ env: 'production', rows: [{ ...GOOD, consent: 'dado por Juan Carlos Angulo el 2026-09-21' }] }).errors.length, 1);
  // Las dos dadas: sin errores ni avisos en production.
  const ok = gate({ env: 'production', rows: [{ ...GOOD, approval: 'aprobada por Ari el 2026-09-21', consent: 'dado por Juan Carlos Angulo el 2026-09-21' }] });
  assert.deepEqual(ok, { errors: [], warnings: [] });
});

test('puerta: registro o manifiesto incoherentes bloquean en todo entorno (mutación por regla)', () => {
  for (const env of ['development', 'production']) {
    assert.ok(gate({ env, rows: [] }).errors.some((e) => e.includes('no tiene fila')), `${env}: sin fila`);
    assert.ok(gate({ env, files: [] }).errors.some((e) => e.includes('no tiene su derivado')), `${env}: sin derivado`);
    assert.ok(gate({ env, rows: [{ ...GOOD, derived: 'treated/otra.png' }] }).errors.some((e) => e.includes('declara el derivado')), `${env}: derivado distinto`);
    assert.ok(gate({ env, files: ['juan', 'extra'] }).errors.some((e) => e.includes('extra')), `${env}: raster huérfano`);
    assert.ok(gate({ env, rows: [GOOD, { ...GOOD, id: 'otra' }] }).errors.some((e) => e.includes('"otra"')), `${env}: fila huérfana`);
    assert.ok(gate({ env, originals: { juan: 'b'.repeat(64) } }).errors.some((e) => e.includes('sha256')), `${env}: sha256 distinto`);
  }
  assert.deepEqual(gate({ originals: { juan: 'a'.repeat(64) } }).errors, [], 'sha256 igual no bloquea');
  assert.deepEqual(gate({ originals: {} }).errors, [], 'sin original (CI) se omite');
});

test('check-photos.mjs: 0 sin producción, 1 en production mientras haya pendientes del equipo, con los pasos de cierre', () => {
  const run = (value) => {
    const env = { ...process.env };
    delete env.PUBLIC_ENV;
    if (value !== undefined) env.PUBLIC_ENV = value;
    return spawnSync(process.execPath, ['scripts/check-photos.mjs'], { encoding: 'utf8', env });
  };
  const pending = rows.some((r) => r.approval === 'pendiente' || r.consent === 'pendiente');
  assert.equal(run().status, 0, 'sin PUBLIC_ENV');
  assert.equal(run('Production').status, 0, 'Production no es production');
  const prod = run('production');
  assert.equal(prod.status, pending ? 1 : prod.status);
  if (pending) {
    const out = prod.stdout + prod.stderr;
    assert.ok(/FAIL check-photos \(equipo\)/.test(out) && /PROVENANCE\.md/.test(out) && /Cómo cerrar la aprobación/.test(out), out);
    for (const id of ids) assert.ok(out.includes(`"${id}"`), `${id} sin mensaje`);
  }
  assert.equal(/WARN check-photos: La foto del equipo/.test(run().stdout + run().stderr), pending, 'los avisos salen sin producción solo si hay pendientes');
});

// (iii) manifiesto y derivados ------------------------------------------------------------------
test('manifiesto: ids únicos, posiciones únicas entre 0 y 3, colores de marca y contraste tinta/disco de 4.5 o más', () => {
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(new Set(TEAM_PHOTOS.map((p) => p.index)).size, TEAM_PHOTOS.length);
  assert.ok(TEAM_PHOTOS.length <= 4 && TEAM_PHOTOS.length >= 1);
  const ink = tokens.theme['--color-brand-dark'];
  for (const p of TEAM_PHOTOS) {
    assert.ok(Number.isInteger(p.index) && p.index >= 0 && p.index <= 3, `${p.id}: índice ${p.index}`);
    assert.ok(TEAM_DISC_COLORS.includes(p.disc), `${p.id}: disco ${p.disc}`);
    assert.ok(contrastRaw(ink, tokens.theme[`--color-brand-${p.disc}`]) >= 4.5, `${p.id}: contraste`);
    assert.ok(p.gamma >= 0.5 && p.gamma <= 2, `${p.id}: gamma ${p.gamma}`);
    const { left, top, size } = p.crop;
    assert.ok(left >= 0 && top >= 0 && left + size <= 500 && top + size <= 625, `${p.id}: recorte fuera de 500x625`);
    assert.equal(teamPhotoAt(p.index), p);
  }
  assert.equal(teamPhotoAt(99), undefined);
  assert.equal(TEAM_PHOTOS.some((p) => p.index === 3), false, 'Miguel Pacheco (posición 3) no tiene foto: conserva el avatar Loopy');
});

test('PNG derivados: cuadrados del tamaño del manifiesto, de paleta, sin metadatos y bajo el tope de peso', async () => {
  for (const id of ids) {
    const path = `${TREATED}/${id}.png`;
    assert.ok(statSync(path).size <= TEAM_PNG_MAX, `${id}: pesa ${statSync(path).size} (tope ${TEAM_PNG_MAX})`);
    const meta = await sharp(path).metadata();
    assert.equal(`${meta.width}x${meta.height}`, `${TEAM_PHOTO_OUT}x${TEAM_PHOTO_OUT}`, id);
    assert.ok(meta.isPalette, `${id}: sin paleta`);
    assert.ok(!meta.exif && !meta.xmp && !meta.icc, `${id}: trae metadatos`);
  }
  // Mutación: una foto sin paleta reducida (ruido de 240x240 a 3 canales) rebasa el tope de peso.
  const noise = randomBytes(TEAM_PHOTO_OUT * TEAM_PHOTO_OUT * 3);
  const big = await sharp(noise, { raw: { width: TEAM_PHOTO_OUT, height: TEAM_PHOTO_OUT, channels: 3 } }).png().toBuffer();
  assert.ok(big.length > TEAM_PNG_MAX, `el PNG sin reducir pesa ${big.length}`);
});

test('originales: no se versionan (photo-sources/ ignorado) y ningún AVIF de las fotos entra al repositorio', () => {
  const ignore = readFileSync('.gitignore', 'utf8');
  assert.ok(/^photo-sources\/$/m.test(ignore), 'photo-sources/ debe estar en .gitignore');
  const tracked = spawnSync('git', ['ls-files', 'photo-sources', 'src/assets/team'], { encoding: 'utf8' }).stdout;
  assert.ok(!/\.avif|photo-sources/.test(tracked), tracked);
});

// (iv) Team.astro ----------------------------------------------------------------------------------
test('Team.astro: foto local con alt vacío, ancho, alto y carga diferida; avatar Loopy de respaldo; enlace externo seguro', () => {
  const src = readFileSync('src/components/sections/Team.astro', 'utf8');
  assert.ok(/from 'astro:assets'/.test(src) && /<Image\b/.test(src), 'foto por astro:assets');
  assert.ok(/alt=""/.test(src), 'alt vacío');
  assert.ok(/loading="lazy"/.test(src) && /width=\{/.test(src) && /height=\{/.test(src), 'lazy con dimensiones');
  assert.ok(/<Avatar\b/.test(src), 'avatar Loopy de respaldo');
  assert.ok(/target="_blank"/.test(src) && /rel="noopener noreferrer"/.test(src), 'enlace externo seguro');
  assert.ok(!/https?:\/\//.test(src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '').replace(/---[\s\S]*?---/, '')), 'sin URL escrita en el marcado');
  assert.ok(!/aria-label\s*=/.test(src), 'sin aria-label que reemplace el texto visible');
});

test('esquema y YAML: `link` opcional con url https, label y hint; solo la tarjeta de Juan lo lleva, con el href y el texto exactos', () => {
  const config = readFileSync('src/content.config.ts', 'utf8');
  assert.ok(/link: z\s*\.strictObject\(\{[\s\S]*?url: claim\.extend\(\{ text: z\.url\(\{ protocol: \/\^https\$\/[\s\S]*?\.optional\(\)/.test(config), 'link opcional con url https en el esquema');
  const yaml = readFileSync('src/content/landing.es.yaml', 'utf8');
  const team = yaml.slice(yaml.indexOf('  team:'), yaml.indexOf('  includes:'));
  assert.equal((team.match(/^ {8}link:$/gm) ?? []).length, 1, 'un solo enlace en el equipo');
  const juan = team.slice(team.indexOf('"Juan Carlos Angulo"'), team.indexOf('"Miguel Pacheco"'));
  assert.ok(/text: "https:\/\/juan-tech\.com"\n\s+status: verified\n\s+reason: "[^"]*Juan Carlos Angulo el 2026-09-20/.test(juan), 'url exacta, verified y con reason de Juan');
  assert.ok(/text: "juan-tech\.com"\n\s+status: verified/.test(juan), 'label exacto');
  assert.ok(!/[\u2013\u2014]/.test(team), 'sin guiones largos ni cortos');
  assert.ok(!/\bAEO\b/.test(team), 'sin AEO');
});

/** Tope de peso del WebP emitido por foto del equipo (medido: unos 4 KB) y de la suma de las tres. */
const TEAM_WEBP_MAX = 12288;

test('dist: una img por foto del equipo, local, con alt vacío, 240x240, carga diferida y bajo el tope de peso', { skip: !existsSync('dist/index.html') && 'sin dist' }, () => {
  const html = readFileSync('dist/index.html', 'utf8');
  const imgs = (html.match(/<img\b[^>]*>/g) ?? []).filter((t) => /data-team-photo=/.test(t));
  assert.deepEqual(imgs.map((t) => /data-team-photo="([^"]+)"/.exec(t)[1]), ids, 'orden y conjunto de fotos del equipo');
  let total = 0;
  for (const tag of imgs) {
    assert.match(tag, /\balt(=""|\s|>)/);
    assert.ok(!/\balt="[^"]/.test(tag), 'alt con texto');
    assert.match(tag, new RegExp(`\\bwidth="${TEAM_PHOTO_OUT}"`));
    assert.match(tag, new RegExp(`\\bheight="${TEAM_PHOTO_OUT}"`));
    assert.match(tag, /loading="lazy"/);
    const src = /src="([^"]+)"/.exec(tag)[1];
    assert.ok(src.startsWith('/_astro/') && src.endsWith('.webp'), src);
    const size = statSync(`dist${src}`).size;
    assert.ok(size <= TEAM_WEBP_MAX, `${src}: ${size}`);
    total += size;
  }
  assert.ok(total <= TEAM_WEBP_MAX * 2, `suma ${total}`);
  assert.equal((html.match(/<img\b[^>]*data-team-photo/g) ?? []).length, TEAM_PHOTOS.length);
  // Enlace de Juan: exacto, externo y seguro; el único enlace de la sección.
  const section = html.slice(html.indexOf('id="nosotros"'), html.indexOf('id="incluye"'));
  const links = section.match(/<a\b[^>]*>/g) ?? [];
  assert.equal(links.length, 1, 'un solo enlace en Quiénes somos');
  assert.match(links[0], /href="https:\/\/juan-tech\.com"/);
  assert.match(links[0], /target="_blank"/);
  assert.match(links[0], /rel="noopener noreferrer"/);
  assert.ok(!/aria-label/.test(links[0]));
  assert.ok(!/(src|href)="\/\//.test(section), 'sin recursos de terceros en la sección');
});

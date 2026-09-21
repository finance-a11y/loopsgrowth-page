// Guardas de los logos de clientes del hero (quick 260920-hero-clients): registro de procedencia, manifiesto,
// archivos, puerta de producción, YAML y contrato de Hero.astro. Cada regla tiene su mutación.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  parseClientProvenance, validateClientProvenance, evaluateClientLogoGate, CLIENT_SOURCE_PREFIX,
} from '../../scripts/lib/photo-licenses.mjs';
import { CLIENT_LOGOS, CLIENT_LOGO_SIZE } from '../../src/components/sections/hero-clients.mjs';

const PROVENANCE = readFileSync('src/assets/clients/PROVENANCE.md', 'utf8');
const HERO = readFileSync('src/components/sections/Hero.astro', 'utf8');
const YAML = readFileSync('src/content/landing.es.yaml', 'utf8');
const DIR = 'src/assets/clients';
const rows = parseClientProvenance(PROVENANCE);
const fileIds = () => readdirSync(DIR).filter((f) => f.endsWith('.webp')).map((f) => f.replace(/\.webp$/, ''));
/** Orden del marcado de Hero.astro: h1, subtítulo, descripción, CTA, clientes, collage (aria-hidden, al final). */
const domOrderOk = (src) => {
  const at = ['<h1', 'class="hero-sub"', 'class="hero-desc"', 'class="hero-cta"', 'class="hero-clients"', 'class="hero-art"'].map((k) => src.indexOf(k));
  return at.every((n, i) => n >= 0 && (i === 0 || n > at[i - 1]));
};
const NAMES = ['Holafly', 'HubSpot', 'Unilever', 'Alchemy', 'Ambl', 'TravelPerk', 'Skale', 'Sendlane', 'ChartMogul', 'Holded', 'Flodesk', 'Piktochart'];

const GOOD = {
  id: 'holafly', file: 'holafly.webp', source: `${CLIENT_SOURCE_PREFIX}holafly.webp`, downloaded: '2026-09-20',
  dimensions: '128x128', sha256: 'a'.repeat(64), authorizedBy: 'Juan Carlos Angulo, 2026-09-20', approval: 'pendiente', note: 'nota',
};
const gate = (over = {}) => evaluateClientLogoGate({
  rows: [GOOD], logos: ['holafly'], files: ['holafly'], env: 'development', hashes: {}, ...over,
});

test('registro real: 12 filas válidas, una por logo del manifiesto y del disco, con el sha256 del archivo', () => {
  assert.deepEqual(validateClientProvenance(rows), []);
  assert.deepEqual(rows.map((r) => r.id), [...CLIENT_LOGOS], 'el orden del registro es el del manifiesto');
  assert.deepEqual(fileIds().sort(), [...CLIENT_LOGOS].sort());
  assert.deepEqual(CLIENT_LOGOS, NAMES.map((n) => n.toLowerCase()));
  for (const r of rows) {
    const buf = readFileSync(`${DIR}/${r.file}`);
    assert.equal(createHash('sha256').update(buf).digest('hex'), r.sha256, `sha256 de ${r.id}`);
    assert.equal(r.dimensions, `${CLIENT_LOGO_SIZE}x${CLIENT_LOGO_SIZE}`);
    assert.equal(r.downloaded, '2026-09-20');
    assert.ok(statSync(`${DIR}/${r.file}`).size < 8192, `${r.id} pesa demasiado`);
  }
});

test('registro: una fila válida pasa y cada campo mal formado falla nombrando id y campo (mutaciones)', () => {
  assert.deepEqual(validateClientProvenance([GOOD]), []);
  const mutations = {
    id: 'Holafly', file: 'otro.webp', source: 'https://otro.com/holafly.webp', downloaded: '2026-02-31', dimensions: '128 x 128',
    sha256: 'a'.repeat(63), authorizedBy: '  ', approval: 'aprobada', note: 'nota — con guion largo',
  };
  for (const [field, value] of Object.entries(mutations)) {
    const errors = validateClientProvenance([{ ...GOOD, [field]: value }]);
    assert.ok(errors.some((e) => e.includes(field)), `${field}: ${JSON.stringify(errors)}`);
  }
  assert.deepEqual(validateClientProvenance([{ ...GOOD, approval: 'aprobada por Ari el 2026-09-21' }]), []);
  assert.ok(validateClientProvenance([{ ...GOOD, approval: 'aprobada por Ari el 2026-09-19' }]).some((e) => e.includes('anterior a la descarga')));
});

test('puerta: aprobación pendiente solo advierte fuera de producción y bloquea en production', () => {
  assert.deepEqual(gate().errors, []);
  assert.equal(gate().warnings.length, 1);
  const prod = gate({ env: 'production' });
  assert.equal(prod.errors.length, 1);
  assert.deepEqual(prod.warnings, []);
  assert.deepEqual(gate({ env: 'production', rows: [{ ...GOOD, approval: 'aprobada por Ari el 2026-09-21' }] }).errors, []);
});

test('puerta: registro, manifiesto o archivo incoherentes bloquean en cualquier entorno (mutaciones)', () => {
  const cases = {
    'logo sin fila': gate({ rows: [] }),
    'fila sin logo en el manifiesto': gate({ logos: [] }),
    'logo sin archivo': gate({ files: [] }),
    'archivo huérfano': gate({ files: ['holafly', 'extra'] }),
    'sha256 distinto del archivo real': gate({ hashes: { holafly: 'b'.repeat(64) } }),
  };
  for (const [name, result] of Object.entries(cases)) assert.ok(result.errors.length > 0, name);
  assert.deepEqual(gate({ hashes: { holafly: GOOD.sha256 } }).errors, []);
});

test('check-photos.mjs: sale 0 fuera de producción y 1 en production con la aprobación pendiente', () => {
  const dev = spawnSync('node', ['scripts/check-photos.mjs'], { encoding: 'utf8', env: { ...process.env, PUBLIC_ENV: 'development' } });
  assert.equal(dev.status, 0, dev.stderr);
  assert.match(dev.stdout, /12 logos de clientes/);
  const prod = spawnSync('node', ['scripts/check-photos.mjs'], { encoding: 'utf8', env: { ...process.env, PUBLIC_ENV: 'production' } });
  assert.equal(prod.status, 1);
  assert.match(prod.stderr, /clientes\): El logo de cliente "holafly" tiene la aprobación de Ari pendiente/);
});

test('YAML: 12 clientes verified en el orden de ariannalupi.com y la etiqueta pending para Ari', () => {
  const block = YAML.slice(YAML.indexOf('    clients:'), YAML.indexOf('  problem:'));
  const names = [...block.matchAll(/^ {8}- text: "([^"]+)"/gm)].map((m) => m[1]);
  assert.deepEqual(names, NAMES);
  assert.equal((block.match(/status: verified/g) ?? []).length, 12);
  assert.match(block, /label:\n {8}text: "Marcas que han confiado en nuestro trabajo"\n {8}status: pending\n {8}confirm_by: Ari\n {8}reason: /);
  assert.equal((block.match(/tomado de ariannalupi\.com por indicación de Juan el 2026-09-20/g) ?? []).length, 12);
  assert.doesNotMatch(block, /[–—]|AEO/);
});

test('Hero.astro: ul role="list" con nombre visible, logos alt vacío lazy con dimensiones, sin enlaces ni h2', () => {
  const clients = HERO.slice(HERO.indexOf('<div class="hero-clients">'), HERO.indexOf('<div class="hero-art">'));
  assert.match(clients, /<p class="hero-clients-label" id="hero-clients-label">/);
  assert.match(clients, /<ul class="hero-clients-list" role="list" aria-labelledby="hero-clients-label">/);
  assert.match(clients, /alt=""/);
  assert.match(clients, /loading="lazy"/);
  assert.match(clients, /width=\{CLIENT_LOGO_SIZE\}\s+height=\{CLIENT_LOGO_SIZE\}/);
  assert.doesNotMatch(clients, /<a[\s>]|<h[1-6][\s>]|animation|transition/);
  assert.ok(domOrderOk(HERO), 'orden del DOM: h1, subtítulo, descripción, CTA, clientes, collage');
});

test('mutación del orden: CTA antes de la descripción, clientes antes del CTA o collage antes de los clientes fallan', () => {
  const swap = (src, x, y) => src.replace(x, '@@X@@').replace(y, x).replace('@@X@@', y);
  assert.equal(domOrderOk(swap(HERO, 'class="hero-desc"', 'class="hero-cta"')), false);
  assert.equal(domOrderOk(swap(HERO, 'class="hero-cta"', 'class="hero-clients"')), false);
  assert.equal(domOrderOk(swap(HERO, 'class="hero-clients"', 'class="hero-art"')), false);
});

test('dist: 12 img de logos locales, alt vacío, 128x128, lazy, en el orden del manifiesto y sin terceros', { skip: !existsSync('dist/index.html') && 'sin dist' }, () => {
  const html = readFileSync('dist/index.html', 'utf8');
  const imgs = html.match(/<img\b[^>]*data-client-logo="[^"]+"[^>]*>/g) ?? [];
  assert.deepEqual(imgs.map((t) => /data-client-logo="([^"]+)"/.exec(t)[1]), [...CLIENT_LOGOS]);
  for (const tag of imgs) {
    assert.match(tag, /\balt(=""|\s|>)/);
    assert.ok(!/\balt="[^"]/.test(tag), 'alt con texto');
    assert.match(tag, /\bwidth="128"/);
    assert.match(tag, /\bheight="128"/);
    assert.match(tag, /loading="lazy"/);
    assert.ok(/src="\/_astro\/[^"]+"/.test(tag), 'src local');
    assert.ok(!/fetchpriority/.test(tag));
  }
  assert.match(html, /<ul class="hero-clients-list"[^>]*role="list"[^>]*aria-labelledby="hero-clients-label"/);
});

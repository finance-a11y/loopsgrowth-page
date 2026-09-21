import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { ALLOWED_FILLS } from '../../src/components/collage/collage-rules.mjs';
import { FORBIDDEN_PAIRS, parseTokens } from '../../scripts/lib/contrast.mjs';

// Guarda del morado oficial (decisión de Juan, 2026-09-19): el morado de la página es el azul
// violeta del logo y del BrandBook. El morado anterior salió de una etiqueta errónea del BrandBook
// y no puede volver a ningún archivo de código. Sus dos formas se arman por partes para que este
// archivo no las contenga y el barrido no se detecte a sí mismo.

const OLD_HEX_BODY = ['73', '187f'].join('');
const OLD_RGB = [0x73, 0x18, 0x7f];
const OLD_HEX_RE = new RegExp(OLD_HEX_BODY, 'i');
const OLD_RGB_RE = new RegExp(OLD_RGB.join(',\\s*'));

/** Devuelve las formas del morado anterior que aparecen en un texto. @param {string} text */
function findOldPurple(text) {
  const found = [];
  if (OLD_HEX_RE.test(text)) found.push('hex');
  if (OLD_RGB_RE.test(text)) found.push('rgb');
  return found;
}

const ROOTS = ['src', 'public', 'tests', 'scripts'];
const SKIP_DIRS = new Set(['node_modules', 'dist', '.astro', 'test-results']);
const BINARY = /\.(png|jpe?g|webp|avif|gif|ico|woff2?|ttf|otf|pdf|ai|zip)$/i;

/** Lista de forma recursiva los archivos de texto bajo una raíz. */
function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (!BINARY.test(name)) out.push(full);
  }
  return out;
}

// Misma expresión de hex de la regla `hex` de brand-assets.test.mjs.
const HEX_RE = /#[0-9a-fA-F]{3}(?![0-9a-zA-Z_-])|#[0-9a-fA-F]{6}(?![0-9a-zA-Z_-])/;

const TOKENS = 'src/styles/tokens.css';

test('el morado anterior (hex y forma rgb) no aparece en src, public, tests ni scripts', () => {
  const hits = [];
  for (const root of ROOTS) {
    for (const file of walk(root)) {
      const forms = findOldPurple(readFileSync(file, 'utf8'));
      if (forms.length) hits.push(`${relative('.', file)} (${forms.join(', ')})`);
    }
  }
  assert.deepEqual(hits, [], `el morado anterior sigue en el código:\n${hits.join('\n')}`);
});

test('tokens.css declara exactamente los seis hex de marca y no declara el iris', () => {
  const css = readFileSync(TOKENS, 'utf8');
  const { theme } = parseTokens(css);
  const brand = Object.fromEntries(
    Object.entries(theme).filter(([key]) => key.startsWith('--color-brand-')),
  );
  assert.deepEqual(brand, {
    '--color-brand-purple': '#4228d1',
    '--color-brand-orange': '#fd6938',
    '--color-brand-yellow': '#ffc602',
    '--color-brand-dark': '#212121',
    '--color-brand-white': '#ffffff',
    '--color-brand-cream': '#f4f3e0',
  });
  assert.ok(!/iris/i.test(Object.keys(theme).join(' ')), 'el iris no es un token');
  const hexes = css.match(/#[0-9a-fA-F]{6}(?![0-9a-zA-Z_-])/g) ?? [];
  const allowed = new Set(Object.values(brand));
  for (const hex of hexes) {
    assert.ok(allowed.has(hex.toLowerCase()), `tokens.css trae un hex fuera de la paleta: ${hex}`);
  }
});

test('ningún archivo .astro, .ts ni .mjs de src contiene un hex fuera de tokens.css', () => {
  const offenders = [];
  for (const file of walk('src')) {
    if (!/\.(astro|ts|mjs)$/.test(file)) continue;
    if (HEX_RE.test(readFileSync(file, 'utf8'))) offenders.push(relative('.', file));
  }
  assert.deepEqual(offenders, [], `hex fuera de src/styles/tokens.css: ${offenders.join(', ')}`);
});

test('excepción decorativa: naranja sobre morado vive a la vez en ALLOWED_FILLS y en FORBIDDEN_PAIRS', () => {
  const allowedInCollage = ALLOWED_FILLS.purple.includes('orange');
  const listedAsForbidden = FORBIDDEN_PAIRS.some(
    (p) => p.fg === '--color-brand-orange' && p.bg === '--color-brand-purple',
  );
  assert.ok(
    allowedInCollage && listedAsForbidden,
    'el naranja sobre morado (2.95) es relleno decorativo del collage y par prohibido para texto y UI: ' +
      'ALLOWED_FILLS.purple y FORBIDDEN_PAIRS se cambian juntos, nunca uno solo.',
  );
});

test('el barrido detecta el morado anterior en hex y en rgb y deja pasar el nuevo', () => {
  assert.deepEqual(findOldPurple(`color: #${OLD_HEX_BODY.toUpperCase()};`), ['hex']);
  assert.deepEqual(findOldPurple(`fill: rgb(${OLD_RGB.join(', ')});`), ['rgb']);
  assert.deepEqual(findOldPurple(`fill: rgb(${OLD_RGB.join(',')});`), ['rgb']);
  assert.deepEqual(findOldPurple('color: #4228d1; fill: rgb(66, 40, 209);'), []);
});

test('tests/e2e/lib/brand.ts lee tokens.css y los specs lo importan en vez de repetir el morado', () => {
  assert.ok(existsSync('tests/e2e/lib/brand.ts'), 'falta tests/e2e/lib/brand.ts');
  assert.match(readFileSync('tests/e2e/lib/brand.ts', 'utf8'), /tokens\.css/);
  for (const spec of ['page-structure', 'sections-problem-solution', 'a11y-base']) {
    const text = readFileSync(`tests/e2e/${spec}.spec.ts`, 'utf8');
    assert.match(text, /from '\.\/lib\/brand'/, `${spec}.spec.ts debe importar ./lib/brand`);
    assert.ok(!/const PURPLE\s*=\s*'rgb\(/.test(text), `${spec}.spec.ts define un literal del morado`);
  }
});

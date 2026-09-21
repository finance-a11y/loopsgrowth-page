import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Guarda estática del presupuesto de movimiento (plan 02-07, DSGN-05). Lee el CSS del repositorio
// (los `.css` y los bloques `<style>` de los `.astro` de `src/`) y afirma cuatro reglas:
//   1. Toda `animation*` y `transition*` (salvo `none`) vive dentro de
//      `@media (prefers-reduced-motion: no-preference)`.
//   2. Todo `@keyframes` declara solo `transform` en sus cuadros.
//   3. Ningún valor lleva `infinite` y ninguna propiedad es `animation-timeline`.
//   4. Toda declaración de la familia `animation` (no `transition`) tiene un selector que empieza con
//      `#inicio` y apunta a `[data-piece]`, `[data-piece-of]`, `.hc-pupil` o `[data-pupil]`: el h1, el
//      subtítulo y el CTA no tienen animación de cuadros clave (su hover es una transición y sigue permitido).
// Cada regla se prueba por mutación con cadenas sintéticas: una regla que no muerde es una regla falsa.

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const NO_PREF = '(prefers-reduced-motion: no-preference)';
const PIECE_TARGETS = ['[data-piece]', '[data-piece-of]', '.hc-pupil', '[data-pupil]'];

const norm = (s) => s.replace(/\s+/g, ' ').trim();
const isAnimation = (p) => p === 'animation' || p.startsWith('animation-');
const isTransition = (p) => p === 'transition' || p.startsWith('transition-');

/** Divide una lista de selectores por comas de nivel superior (ignora las de `:is(...)` y `[...]`). */
function splitSelectors(sel) {
  const parts = [];
  let depth = 0;
  let cur = '';
  for (const ch of sel) {
    if (ch === '(' || ch === '[') depth++;
    else if (ch === ')' || ch === ']') depth--;
    if (ch === ',' && depth === 0) {
      parts.push(cur.trim());
      cur = '';
    } else cur += ch;
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
}

/** Devuelve el CSS de un archivo: el texto entero si es `.css`, la unión de sus `<style>` si es `.astro`. */
function cssOf(file) {
  if (file.path.endsWith('.css')) return file.text;
  if (file.path.endsWith('.astro')) {
    return [...file.text.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]).join('\n');
  }
  return '';
}

/**
 * Recorre el CSS con una pila de preámbulos y entrega cada declaración con los `@media` que la encierran,
 * su selector y el `@keyframes` que la contiene (si lo hay).
 */
function declarations(css) {
  const src = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const out = [];
  const stack = [];
  let buf = '';
  let paren = 0;
  const flush = () => {
    const text = norm(buf);
    buf = '';
    if (!text || text.startsWith('@')) return;
    const i = text.indexOf(':');
    if (i < 0) return;
    const prop = text.slice(0, i).trim().toLowerCase();
    if (prop.startsWith('--')) return;
    const value = text.slice(i + 1).trim();
    const at = stack.filter((s) => s.startsWith('@'));
    const media = at.filter((s) => s.toLowerCase().startsWith('@media')).map((s) => s.toLowerCase());
    const kf = at.find((s) => s.toLowerCase().startsWith('@keyframes'));
    const selector = [...stack].reverse().find((s) => !s.startsWith('@')) ?? '';
    out.push({ prop, value, media, keyframes: kf ?? null, selector: kf ? '' : selector });
  };
  for (const ch of src) {
    if (ch === '(') paren++;
    else if (ch === ')') paren = Math.max(0, paren - 1);
    if (paren === 0 && ch === '{') {
      stack.push(norm(buf));
      buf = '';
    } else if (paren === 0 && ch === '}') {
      flush();
      stack.pop();
    } else if (paren === 0 && ch === ';') {
      flush();
    } else buf += ch;
  }
  return out;
}

/**
 * Escanea `files` (`{ path, text }`) y devuelve `{ violations, stats }`. Cada violación:
 * `{ rule, file, selector, prop, value, message }`.
 */
export function scanCss(files) {
  const violations = [];
  const stats = { files: 0, declarations: 0, motion: 0, keyframes: new Set() };
  for (const file of files) {
    const css = cssOf(file);
    if (!css) continue;
    stats.files++;
    for (const d of declarations(css)) {
      stats.declarations++;
      const v = (rule, message) => violations.push({ rule, file: file.path, selector: d.selector || d.keyframes || '', prop: d.prop, value: d.value, message });
      if (d.keyframes) stats.keyframes.add(d.keyframes);
      const motion = isAnimation(d.prop) || isTransition(d.prop);
      if (motion) stats.motion++;

      // 1. Todo movimiento vive bajo `no-preference` (`animation: none` y `transition: none` solo lo apagan).
      const disables = /^(none|0s)$/i.test(d.value);
      if (motion && !disables && !d.media.some((m) => m.includes(NO_PREF))) {
        v(1, `${d.prop} fuera de @media ${NO_PREF}`);
      }
      // 2. Los cuadros clave declaran solo `transform`.
      if (d.keyframes && d.prop !== 'transform') v(2, `${d.keyframes} declara ${d.prop} (solo transform)`);
      // 3. Nada infinito ni ligado al scroll.
      if (/\binfinite\b/i.test(d.value)) v(3, `${d.prop} usa infinite`);
      if (d.prop === 'animation-timeline') v(3, 'animation-timeline no está permitido');
      // 4. La familia `animation` solo apunta a las piezas del collage y las pupilas de #inicio.
      if (isAnimation(d.prop) && !d.keyframes) {
        const parts = splitSelectors(d.selector);
        const ok = parts.length > 0 && parts.every((p) => p.startsWith('#inicio') && PIECE_TARGETS.some((t) => p.includes(t)));
        if (!ok) v(4, `${d.prop} sobre "${d.selector}": solo #inicio con [data-piece], [data-piece-of], .hc-pupil o [data-pupil]`);
      }
    }
  }
  return { violations, stats };
}

/** Lee los `.css` y `.astro` de `dir` (recursivo). */
export function readSources(dir) {
  const files = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) files.push(...readSources(path));
    else if (/\.(css|astro)$/.test(name)) files.push({ path, text: readFileSync(path, 'utf8') });
  }
  return files;
}

const css = (text) => [{ path: 'sintetico.css', text }];
const rules = (text) => scanCss(css(text)).violations.map((x) => x.rule);

// ---- Cadena sintética limpia: la guarda no da falsos positivos ----

test('una hoja sintética que cumple las cuatro reglas no da violaciones', () => {
  const ok = `
    @media (prefers-reduced-motion: no-preference) {
      @keyframes hc-enter { from { transform: scale(0.94); } to { transform: scale(1); } }
      #inicio :is([data-piece], [data-piece-of]) { animation: hc-enter 600ms ease-out backwards; }
      #inicio :is(.hc-pupil, [data-pupil]) { animation: hc-look 400ms ease-out backwards; animation-delay: 1s; }
      .faq-icon-v { transition: transform 150ms ease-out; }
      .cta { transition: background-color 200ms; }
    }
    @media (prefers-reduced-motion: reduce) { .cta { transition: none; } }
    h1 { color: red; background: url(data:image/svg+xml;base64,AAAA); }
  `;
  assert.deepEqual(scanCss(css(ok)).violations, []);
});

// ---- Regla 1: movimiento fuera de no-preference ----

test('regla 1 muerde: una animation fuera del bloque no-preference', () => {
  assert.deepEqual(rules('#inicio [data-piece] { animation: hc-enter 600ms; }'), [1]);
});

test('regla 1 muerde: una transition fuera del bloque no-preference', () => {
  assert.ok(rules('.cta { transition: transform 150ms; }').includes(1));
});

test('regla 1 muerde: el movimiento bajo reduce no cuenta como no-preference', () => {
  assert.ok(rules('@media (prefers-reduced-motion: reduce) { .faq-icon-v { transition: transform 150ms; } }').includes(1));
});

test('regla 1 muerde: una transition-duration suelta y el bloque style de un .astro', () => {
  const astro = [{ path: 'C.astro', text: '<div></div>\n<style>\n  .x { transition-duration: 200ms; }\n</style>' }];
  assert.deepEqual(scanCss(astro).violations.map((x) => x.rule), [1]);
});

// ---- Regla 2: keyframes solo con transform ----

test('regla 2 muerde: un @keyframes con opacity', () => {
  const r = rules('@media (prefers-reduced-motion: no-preference) { @keyframes fade { from { opacity: 0; } to { opacity: 1; } } }');
  assert.deepEqual(r, [2, 2]);
});

test('regla 2 muerde: un @keyframes que mezcla transform con filter', () => {
  const r = rules('@media (prefers-reduced-motion: no-preference) { @keyframes k { to { transform: none; filter: blur(2px); } } }');
  assert.deepEqual(r, [2]);
});

// ---- Regla 3: nada infinito ni animation-timeline ----

test('regla 3 muerde: infinite en el valor de animation', () => {
  const r = rules('@media (prefers-reduced-motion: no-preference) { #inicio [data-piece] { animation: hc-enter 600ms infinite; } }');
  assert.deepEqual(r, [3]);
});

test('regla 3 muerde: animation-iteration-count infinite y animation-timeline', () => {
  const inf = rules('@media (prefers-reduced-motion: no-preference) { #inicio [data-piece] { animation-iteration-count: infinite; } }');
  assert.deepEqual(inf, [3]);
  const tl = rules('@media (prefers-reduced-motion: no-preference) { #inicio [data-piece] { animation-timeline: view(); } }');
  assert.deepEqual(tl, [3]);
});

// ---- Regla 4: el h1, el subtítulo y el CTA no tienen animación de cuadros clave ----

test('regla 4 muerde: una animation sobre el h1 de #inicio', () => {
  const r = rules('@media (prefers-reduced-motion: no-preference) { #inicio h1 { animation: hc-enter 600ms; } }');
  assert.deepEqual(r, [4]);
});

test('regla 4 muerde: una animation sobre un selector que no empieza con #inicio', () => {
  const r = rules('@media (prefers-reduced-motion: no-preference) { .hero-sub { animation: hc-enter 600ms; } }');
  assert.deepEqual(r, [4]);
});

test('regla 4 muerde: una lista de selectores donde una parte apunta al CTA', () => {
  const r = rules('@media (prefers-reduced-motion: no-preference) { #inicio [data-piece], #inicio a[data-cta] { animation: hc-enter 600ms; } }');
  assert.deepEqual(r, [4]);
});

test('regla 4 no bloquea la transición del hover del CTA (es transition, no animation)', () => {
  assert.deepEqual(rules('@media (prefers-reduced-motion: no-preference) { .cta:hover { transition: transform 150ms; } }'), []);
});

// ---- El repositorio real ----

test('el repositorio real cumple las cuatro reglas y la guarda no es vacía', () => {
  const { violations, stats } = scanCss(readSources(join(ROOT, 'src')));
  assert.deepEqual(violations, [], violations.map((x) => `regla ${x.rule} en ${x.file}: ${x.message}`).join('\n'));
  // Que no pase por vacío: la guarda tiene que ver el movimiento que sí existe.
  assert.ok(stats.files > 5, `pocos archivos escaneados: ${stats.files}`);
  assert.ok(stats.motion >= 4, `pocas declaraciones de movimiento: ${stats.motion}`);
  for (const name of ['@keyframes hc-enter', '@keyframes hc-look']) {
    assert.ok(stats.keyframes.has(name), `no se vio ${name}`);
  }
});

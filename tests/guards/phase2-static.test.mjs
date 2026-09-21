import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

// Guarda estática de higiene de la fase 2 (plan 02-07, DSGN-03). Lee el código de `src/` y afirma cinco reglas:
//   1. Sin inyección de HTML en bruto (`set:html`, `innerHTML`, `dangerouslySetInnerHTML`) salvo las rutas de
//      `RAW_HTML_ALLOW` (hoy vacía: todo el marcado sale de plantillas).
//   2. Sin literales hex de color (`#` y 3, 4, 6 u 8 dígitos hexadecimales) en los `.astro` de componentes,
//      páginas y layouts; el color viene de `var(--color-brand-*)`. Se ignoran los que siguen a `href=`,
//      `url(` o `&` (anclas, referencias y entidades). No se escanean los `.mjs` (constantes de
//      `collage-rules.mjs`) ni `src/assets`.
//   3. Sin `outline` en `none` o `0` y sin `outline-style: none` (el foco visible es de A11Y.md).
//   4. Sin `line-height` con `!important` (el espaciado de texto del usuario debe poder ganar, SC 1.4.12).
//   5. Los únicos `<script` de `src` son los dos de `AgendaSection.astro` y `src/scripts` solo contiene
//      `cta-focus.ts`.
// Cada regla se prueba por mutación con cadenas sintéticas: una regla que no muerde es una regla falsa.

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

/** Rutas (relativas a la raíz, con `/`) autorizadas a inyectar HTML en bruto. Vacía a propósito. */
export const RAW_HTML_ALLOW = [];
/** Cantidad de `<script` permitida por archivo. */
export const SCRIPT_ALLOW = { 'src/components/AgendaSection.astro': 2 };
/** Únicos archivos permitidos dentro de `src/scripts`. */
export const SCRIPTS_DIR_ALLOW = ['src/scripts/cta-focus.ts'];

const RAW_HTML_RE = /\bset:html\b|\binnerHTML\b|\bdangerouslySetInnerHTML\b/;
const HEX_RE = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})(?![\w-])/g;
const OUTLINE_OFF_RE = /\boutline\s*:\s*(?:none|0)(?![\w.%-])|\boutline-style\s*:\s*none\b/;
const LINE_HEIGHT_IMPORTANT_RE = /\bline-height\s*:[^;}]*!important/i;
const SCRIPT_RE = /<script\b/g;

const stripComments = (text) => text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/<!--[\s\S]*?-->/g, '');
// Además de los comentarios de bloque y HTML, las líneas que son solo `//` (una nota que menciona
// `<script` o `innerHTML` no es código). No se tocan los `//` de las URL.
const stripAll = (text) => stripComments(text).replace(/^[ \t]*\/\/.*$/gm, '');
const lineOf = (text, index) => text.slice(0, index).split('\n').length;
const isCode = (path) => /\.(astro|css|ts|tsx|js|jsx|mjs)$/.test(path);
const isHexScope = (path) => /^src\/(components|pages|layouts)\/.*\.astro$/.test(path);
const isStyleFile = (path) => /\.(astro|css)$/.test(path);

/**
 * Evalúa las cinco reglas sobre `files` (`{ path, text }`, `path` relativo a la raíz y con `/`).
 * @param {{ path: string, text: string }[]} files
 */
export function scan(files) {
  const violations = [];
  const add = (rule, file, message) => violations.push({ rule, file, message });
  const scriptFiles = new Set();

  for (const { path, text } of files) {
    if (!path.startsWith('src/') || path.startsWith('src/assets/')) continue;
    if (path.startsWith('src/scripts/')) scriptFiles.add(path);

    const code = isCode(path) ? stripAll(text) : '';

    if (isCode(path) && !RAW_HTML_ALLOW.includes(path)) {
      const m = RAW_HTML_RE.exec(code);
      if (m) add(1, path, `HTML en bruto (${m[0]}) en la línea ${lineOf(code, m.index)}`);
    }

    if (isHexScope(path)) {
      const body = stripComments(text);
      for (const m of body.matchAll(HEX_RE)) {
        const before = body.slice(Math.max(0, m.index - 6), m.index);
        if (/href\s*=\s*["']?$/i.test(before) || /url\(\s*["']?$/i.test(before) || before.endsWith('&')) continue;
        add(2, path, `hex de color ${m[0]} en la línea ${lineOf(body, m.index)}: usa var(--color-brand-*)`);
      }
    }

    if (isStyleFile(path)) {
      const body = stripComments(text);
      const outline = OUTLINE_OFF_RE.exec(body);
      if (outline) add(3, path, `outline apagado (${outline[0]}) en la línea ${lineOf(body, outline.index)}`);
      const lh = LINE_HEIGHT_IMPORTANT_RE.exec(body);
      if (lh) add(4, path, `line-height con !important en la línea ${lineOf(body, lh.index)}`);
    }

    if (isCode(path)) {
      const count = [...code.matchAll(SCRIPT_RE)].length;
      const allowed = SCRIPT_ALLOW[path] ?? 0;
      if (count !== allowed) add(5, path, `${count} etiquetas <script> (permitidas: ${allowed})`);
    }
  }

  for (const path of scriptFiles) {
    if (!SCRIPTS_DIR_ALLOW.includes(path)) add(5, path, 'archivo no permitido en src/scripts');
  }
  for (const path of SCRIPTS_DIR_ALLOW) {
    if (!scriptFiles.has(path) && files.length > 20) add(5, path, 'falta el archivo permitido de src/scripts');
  }
  return violations;
}

/** Lee recursivamente los archivos de código de `dir`; `path` sale relativo a la raíz y con `/`. */
export function readSources(dir) {
  const files = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) files.push(...readSources(full));
    else if (isCode(name)) files.push({ path: relative(ROOT, full).split(sep).join('/'), text: readFileSync(full, 'utf8') });
  }
  return files;
}

const one = (path, text) => [{ path, text }];
const rulesOf = (path, text) => scan(one(path, text)).map((v) => v.rule);
const COMPONENT = 'src/components/Sintetico.astro';

// ---- Cadena sintética limpia: la guarda no da falsos positivos ----

test('un componente sintético que cumple las cinco reglas no da violaciones', () => {
  const ok = `---
const label = 'Hola';
---
<a href="#agenda" class="cta">{label}</a>
<svg><use href="#lg-ojos" /></svg>
<p style="background: url(#a1b2c3)">&#123; &#x1F600;</p>
<style>
  /* prohibido outline: none y line-height: 1 !important: solo un comentario */
  .cta { color: var(--color-brand-purple); line-height: 1.5; outline: 2px solid var(--color-brand-yellow); }
  .x:focus-visible { outline-offset: 2px; }
</style>`;
  assert.deepEqual(scan(one(COMPONENT, ok)), []);
});

// ---- Regla 1: HTML en bruto ----

test('regla 1: set:html, innerHTML y dangerouslySetInnerHTML se marcan', () => {
  assert.deepEqual(rulesOf(COMPONENT, '<div set:html={x} />'), [1]);
  assert.deepEqual(rulesOf('src/scripts/cta-focus.ts', 'el.innerHTML = x;'), [1]);
  assert.deepEqual(rulesOf('src/lib/x.ts', 'const p = { dangerouslySetInnerHTML: y };'), [1]);
});

test('regla 1 y 5: una nota en un comentario no es código', () => {
  assert.deepEqual(rulesOf('src/lib/x.ts', '// usa innerHTML y <script> solo aquí\n/* set:html <script> */\nexport {};'), []);
  assert.deepEqual(rulesOf(COMPONENT, '<!-- <script></script> y set:html -->'), []);
});

test('regla 1: una ruta de RAW_HTML_ALLOW queda exenta (y la lista real está vacía)', () => {
  assert.deepEqual(RAW_HTML_ALLOW, []);
  RAW_HTML_ALLOW.push(COMPONENT);
  try {
    assert.deepEqual(rulesOf(COMPONENT, '<div set:html={x} />'), []);
  } finally {
    RAW_HTML_ALLOW.pop();
  }
});

// ---- Regla 2: hex de color ----

test('regla 2: un hex de 3, 4, 6 y 8 dígitos en un .astro se marca', () => {
  for (const hex of ['#fff', '#ffff', '#123ABC', '#123ABCcc']) {
    assert.deepEqual(rulesOf(COMPONENT, `<style>.a { color: ${hex}; }</style>`), [2], hex);
  }
  assert.deepEqual(rulesOf('src/layouts/L.astro', '<path fill="#fd6938" />'), [2]);
  assert.deepEqual(rulesOf('src/pages/index.astro', '---\nconst c = "#212121";\n---'), [2]);
});

test('regla 2: href, url( y & se ignoran; .mjs y src/assets no se escanean', () => {
  assert.deepEqual(rulesOf(COMPONENT, '<a href="#abc">x</a><a href=#a1b2c3>y</a>'), []);
  assert.deepEqual(rulesOf(COMPONENT, '<style>.a { background: url(#fade); }</style>'), []);
  assert.deepEqual(rulesOf(COMPONENT, '<p>&#169;</p>'), []);
  assert.deepEqual(rulesOf('src/components/collage/collage-rules.mjs', "export const c = '#123ABC';"), []);
  assert.deepEqual(rulesOf('src/assets/brand/logo.svg', 'fill="#123ABC"'), []);
  assert.deepEqual(rulesOf('src/styles/tokens.css', ':root { --color-brand-purple: #123abc; }'), []);
});

test('regla 2: un id que empieza con letras hex pero sigue no es un color', () => {
  assert.deepEqual(rulesOf(COMPONENT, '<a class="skip" href="/#agenda">x</a><style>#agenda-title { margin: 0; }</style>'), []);
});

// ---- Regla 3: outline ----

test('regla 3: outline none, outline 0 y outline-style none se marcan en .css y .astro', () => {
  assert.deepEqual(rulesOf('src/styles/a.css', 'a:focus { outline: none; }'), [3]);
  assert.deepEqual(rulesOf('src/styles/a.css', 'a:focus{outline:0}'), [3]);
  assert.deepEqual(rulesOf('src/styles/a.css', 'a:focus { outline-style: none; }'), [3]);
  assert.deepEqual(rulesOf(COMPONENT, '<style>a { outline: none !important; }</style>'), [3]);
});

test('regla 3: un outline real y outline-offset no se marcan', () => {
  assert.deepEqual(rulesOf('src/styles/a.css', 'a:focus-visible { outline: 2px solid red; outline-offset: 0; }'), []);
  assert.deepEqual(rulesOf('src/styles/a.css', 'a { outline: 0.125rem solid red; }'), []);
});

// ---- Regla 4: line-height !important ----

test('regla 4: line-height con !important se marca, sin !important no', () => {
  assert.deepEqual(rulesOf('src/styles/a.css', 'p { line-height: 1.5 !important; }'), [4]);
  assert.deepEqual(rulesOf(COMPONENT, '<style>p { line-height:1.2!important }</style>'), [4]);
  assert.deepEqual(rulesOf('src/styles/a.css', 'p { line-height: 1.5; color: red !important; }'), []);
});

// ---- Regla 5: scripts ----

test('regla 5: un <script> fuera de AgendaSection, o uno de más dentro, se marca', () => {
  assert.deepEqual(rulesOf(COMPONENT, '<script>console.log(1)</script>'), [5]);
  const agenda = 'src/components/AgendaSection.astro';
  assert.deepEqual(rulesOf(agenda, '<script is:inline></script><script></script>'), []);
  assert.deepEqual(rulesOf(agenda, '<script></script><script></script><script></script>'), [5]);
  assert.deepEqual(rulesOf(agenda, '<script></script>'), [5]);
});

test('regla 5: src/scripts solo admite cta-focus.ts', () => {
  assert.deepEqual(rulesOf('src/scripts/cta-focus.ts', 'export {};'), []);
  assert.deepEqual(rulesOf('src/scripts/otro.ts', 'export {};'), [5]);
});

// ---- El repositorio real ----

test('el repositorio real cumple las cinco reglas', () => {
  const files = readSources(join(ROOT, 'src'));
  const violations = scan(files);
  assert.deepEqual(
    violations,
    [],
    violations.map((v) => `regla ${v.rule} en ${v.file}: ${v.message}`).join('\n'),
  );
  // Que no pase por vacío: la guarda tiene que ver los archivos que vigila.
  assert.ok(files.length > 20, `pocos archivos escaneados: ${files.length}`);
  assert.ok(files.some((f) => isHexScope(f.path)), 'ningún .astro de componentes, páginas o layouts');
  assert.ok(files.some((f) => f.path === 'src/components/AgendaSection.astro'), 'falta AgendaSection.astro');
  assert.ok(files.some((f) => f.path === 'src/scripts/cta-focus.ts'), 'falta cta-focus.ts');
});

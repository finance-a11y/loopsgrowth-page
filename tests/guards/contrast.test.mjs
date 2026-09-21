import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  APPROVED_PAIRS,
  FORBIDDEN_PAIRS,
  contrastRaw,
  contrastRatio,
  parseTokens,
} from '../../scripts/lib/contrast.mjs';

const CLI = 'scripts/check-contrast.mjs';
const TOKENS = 'src/styles/tokens.css';

const HEX = {
  purple: '#4228d1',
  cream: '#f4f3e0',
  orange: '#fd6938',
  yellow: '#ffc602',
  dark: '#212121',
  white: '#ffffff',
};

const run = (...args) => spawnSync('node', [CLI, ...args], { encoding: 'utf8' });

function mutatedTokens(mutate) {
  const dir = mkdtempSync(join(tmpdir(), 'contrast-'));
  const file = join(dir, 'tokens.css');
  writeFileSync(file, mutate(readFileSync(TOKENS, 'utf8')));
  return file;
}

// Reemplaza una declaración dentro del bloque de un tono (el bloque `[data-tone="x"] { ... }`).
function replaceInTone(css, tone, prop, value) {
  const re = new RegExp(`(\\[data-tone="${tone}"\\]\\s*\\{[^}]*?${prop}:\\s*)[^;]+;`);
  assert.match(css, re, `no se encontró ${prop} en el tono ${tone}`);
  return css.replace(re, `$1${value};`);
}

test('contrastRatio reproduce los 25 ratios medidos (14 aprobados y 11 prohibidos)', () => {
  // Oráculo escrito a mano e independiente de las listas del código.
  const approved = [
    [HEX.dark, HEX.white, 16.1],
    [HEX.purple, HEX.white, 8.55],
    [HEX.white, HEX.purple, 8.55],
    [HEX.yellow, HEX.purple, 5.43],
    [HEX.dark, HEX.yellow, 10.22],
    [HEX.dark, HEX.orange, 5.56],
    [HEX.yellow, HEX.dark, 10.22],
    [HEX.orange, HEX.dark, 5.56],
    [HEX.purple, HEX.yellow, 5.43],
    [HEX.white, HEX.dark, 16.1],
    [HEX.cream, HEX.purple, 7.63],
    [HEX.purple, HEX.cream, 7.63],
    [HEX.dark, HEX.cream, 14.37],
    [HEX.cream, HEX.dark, 14.37],
  ];
  const forbidden = [
    [HEX.white, HEX.orange, 2.89],
    [HEX.orange, HEX.white, 2.89],
    [HEX.yellow, HEX.white, 1.58],
    [HEX.white, HEX.yellow, 1.58],
    [HEX.purple, HEX.dark, 1.88],
    [HEX.orange, HEX.yellow, 1.84],
    [HEX.dark, HEX.purple, 1.88],
    [HEX.orange, HEX.purple, 2.95],
    [HEX.yellow, HEX.cream, 1.41],
    [HEX.orange, HEX.cream, 2.58],
    [HEX.white, HEX.cream, 1.12],
  ];
  assert.equal(approved.length, 14);
  assert.equal(forbidden.length, 11);
  for (const [fg, bg, expected] of [...approved, ...forbidden]) {
    assert.ok(
      Math.abs(contrastRatio(fg, bg) - expected) <= 0.01 + 1e-9,
      `${fg} sobre ${bg}: se esperaba ${expected} y salió ${contrastRatio(fg, bg)}`,
    );
  }
  for (const [fg, bg] of forbidden) {
    assert.ok(contrastRaw(fg, bg) < 3, `${fg} sobre ${bg} debía medir menos de 3`);
  }
});

test('contrastRaw no redondea: #6473b6 sobre blanco (4.4971) no cumple 4.5 aunque se muestre como 4.5', () => {
  assert.equal(contrastRatio('#6473b6', HEX.white), 4.5);
  assert.ok(contrastRaw('#6473b6', HEX.white) < 4.5);
});

test('un enlace de tono con ratio real 4.4971 falla check-contrast aunque el ratio redondeado sea 4.5', () => {
  const file = mutatedTokens((css) => replaceInTone(css, 'light', '--link', '#6473b6'));
  const res = run('--tokens', file);
  assert.equal(res.status, 1);
  assert.match(res.stderr, /tono light: --link sobre --surface/);
  assert.match(res.stderr, /real 4\.4971/);
});

test('las listas exportadas traen 14 pares aprobados y 11 prohibidos', () => {
  assert.equal(APPROVED_PAIRS.length, 14);
  assert.equal(FORBIDDEN_PAIRS.length, 11);
});

test('parseTokens lee @theme static, resuelve los tonos y no toma un :root suelto por tono', () => {
  const { theme, tones } = parseTokens(readFileSync(TOKENS, 'utf8'));
  assert.equal(theme['--color-brand-purple'], HEX.purple);
  // Comprobación de forma, no de valor: la medida del formulario cambia cada vez que se vuelve a medir.
  assert.match(theme['--form-min-h-sm'], /^\d+px$/, 'el bloque @theme static debe exponer --form-min-h-sm');
  assert.deepEqual(Object.keys(tones).sort(), ['dark', 'light', 'purple', 'yellow']);
  assert.equal(tones.light['--on-cta'], HEX.dark);
  assert.equal(tones.purple['--surface'], HEX.purple);
  assert.equal(tones.purple['--focus-ring'], HEX.yellow);
  assert.equal(tones.light['--dur-1'], undefined);
});

test('parseTokens acepta comillas simples y sin comillas en [data-tone] y no reporta problemas', () => {
  const css = `[data-tone='light'] { --surface: #ffffff; } [data-tone=purple] { --surface: #4228d1; }`;
  const { tones, problems } = parseTokens(css);
  assert.deepEqual(Object.keys(tones).sort(), ['light', 'purple']);
  assert.deepEqual(problems, []);
});

test('un tono con comillas simples sigue verificándose: check-contrast lo evalúa y no lo ignora', () => {
  const file = mutatedTokens((css) =>
    css
      .replace('[data-tone="purple"]', "[data-tone='purple']")
      .replace(/(\[data-tone='purple'\]\s*\{[^}]*?--focus-ring:\s*)[^;]+;/, '$1var(--color-brand-dark);'),
  );
  const res = run('--tokens', file);
  assert.equal(res.status, 1);
  assert.match(res.stderr, /tono purple: --focus-ring sobre --surface/);
});

test('si falta un tono obligatorio (light, purple, yellow o dark) check-contrast sale con 1 y lo nombra', () => {
  for (const tone of ['light', 'purple', 'yellow', 'dark']) {
    const file = mutatedTokens((css) => css.replaceAll(`[data-tone="${tone}"]`, '[data-tono="x"]'));
    const res = run('--tokens', file);
    assert.equal(res.status, 1, `sin el tono ${tone} debía fallar`);
    assert.match(res.stderr, new RegExp(`tono ${tone}: .*no se encontró|tono ${tone} = n/a`));
  }
});

test('CSS anidado dentro de un bloque [data-tone] hace fallar la guarda en vez de pasar en silencio', () => {
  const file = mutatedTokens((css) =>
    css.replace('[data-tone="purple"] {', '[data-tone="purple"] {\n  .card { color: red; }'),
  );
  const res = run('--tokens', file);
  assert.equal(res.status, 1);
  assert.match(res.stderr, /llaves anidadas|no se encontró/);
});

test('un selector descendiente [data-tone="x"] .card no se fusiona con el tono: se reporta y falla', () => {
  const file = mutatedTokens(
    (css) => `${css}\n[data-tone="purple"] .card { --surface: #ffffff; }\n`,
  );
  const res = run('--tokens', file);
  assert.equal(res.status, 1);
  assert.match(res.stderr, /selector de tono no admitido/);
  const { tones } = parseTokens(readFileSync(file, 'utf8'));
  assert.equal(tones.purple['--surface'], HEX.purple);
});

test('ejecución por defecto: código 0 y 14 pares aprobados ok en --json', () => {
  const res = run();
  assert.equal(res.status, 0, res.stderr);
  const json = run('--json');
  assert.equal(json.status, 0, json.stderr);
  const results = JSON.parse(json.stdout);
  const approved = results.filter((r) => r.kind === 'approved');
  const forbidden = results.filter((r) => r.kind === 'forbidden');
  assert.equal(approved.length, 14);
  assert.ok(approved.every((r) => r.ok));
  assert.equal(forbidden.length, 11);
  assert.ok(forbidden.every((r) => r.ok && r.ratio < r.threshold));
  assert.ok(results.filter((r) => r.kind === 'tone').every((r) => r.ok));
});

test('cambiar --color-brand-dark a #777777 rompe check-contrast con código 1', () => {
  const file = mutatedTokens((css) => css.replace(/(--color-brand-dark:\s*)#212121/, '$1#777777'));
  const res = run('--tokens', file);
  assert.equal(res.status, 1);
  assert.match(res.stderr, /FAIL/);
  assert.match(res.stderr, /dark sobre white/);
});

test('apuntar --on-cta del tono claro a blanco rompe con código 1 y menciona 2.89', () => {
  const file = mutatedTokens((css) =>
    replaceInTone(css, 'light', '--on-cta', 'var(--color-brand-white)'),
  );
  const res = run('--tokens', file);
  assert.equal(res.status, 1);
  assert.match(res.stderr, /tono light: --on-cta sobre --cta-bg/);
  assert.match(res.stderr, /2\.89/);
});

test('apuntar --focus-ring del tono morado a oscuro rompe con código 1 y menciona 1.88', () => {
  const file = mutatedTokens((css) =>
    replaceInTone(css, 'purple', '--focus-ring', 'var(--color-brand-dark)'),
  );
  const res = run('--tokens', file);
  assert.equal(res.status, 1);
  assert.match(res.stderr, /tono purple: --focus-ring sobre --surface/);
  assert.match(res.stderr, /1\.88/);
});

test('declarar un par prohibido en un tono (naranja sobre blanco como enlace) falla y lo nombra', () => {
  const file = mutatedTokens((css) =>
    replaceInTone(css, 'light', '--link', 'var(--color-brand-orange)'),
  );
  const res = run('--tokens', file);
  assert.equal(res.status, 1);
  assert.match(res.stderr, /tono light: --link sobre --surface/);
  assert.match(res.stderr, /par prohibido/);
});

test('un token de marca que falta rompe check-contrast con código 1', () => {
  const file = mutatedTokens((css) => css.replace(/--color-brand-yellow:[^;]+;/, ''));
  const res = run('--tokens', file);
  assert.equal(res.status, 1);
});

test('una ruta de tokens inexistente sale con 1', () => {
  const res = run('--tokens', join(tmpdir(), 'no-existe', 'tokens.css'));
  assert.equal(res.status, 1);
});

test('los pares nuevos (morado sobre amarillo y blanco sobre oscuro) están aprobados y morado sobre blanco exige 4.5', () => {
  assert.equal(contrastRatio(HEX.purple, HEX.yellow), 5.43);
  assert.equal(contrastRatio(HEX.white, HEX.dark), 16.1);
  const has = (fg, bg) => APPROVED_PAIRS.find((p) => p.fg === fg && p.bg === bg);
  const purpleOnYellow = has('--color-brand-purple', '--color-brand-yellow');
  const whiteOnDark = has('--color-brand-white', '--color-brand-dark');
  assert.ok(purpleOnYellow, 'falta morado sobre amarillo');
  assert.ok(whiteOnDark, 'falta blanco sobre oscuro');
  assert.equal(purpleOnYellow.min, 4.5);
  assert.equal(whiteOnDark.min, 4.5);
  assert.equal(has('--color-brand-purple', '--color-brand-white').min, 4.5);
});

test('un tono dark con --heading morado sale con 1 y dice par prohibido', () => {
  const file = mutatedTokens((css) => replaceInTone(css, 'dark', '--heading', 'var(--color-brand-purple)'));
  const res = run('--tokens', file);
  assert.equal(res.status, 1);
  assert.match(res.stderr, /tono dark: --heading sobre --surface/);
  assert.match(res.stderr, /par prohibido/);
});

test('un tono dark con --link morado sale con 1 y dice par prohibido', () => {
  const file = mutatedTokens((css) => replaceInTone(css, 'dark', '--link', 'var(--color-brand-purple)'));
  const res = run('--tokens', file);
  assert.equal(res.status, 1);
  assert.match(res.stderr, /tono dark: --link sobre --surface/);
  assert.match(res.stderr, /par prohibido/);
});

test('un tono dark con --collage-stroke morado sale con 1 y dice par prohibido', () => {
  const file = mutatedTokens((css) =>
    replaceInTone(css, 'dark', '--collage-stroke', 'var(--color-brand-purple)'),
  );
  const res = run('--tokens', file);
  assert.equal(res.status, 1);
  assert.match(res.stderr, /tono dark: --collage-stroke sobre --surface/);
  assert.match(res.stderr, /par prohibido/);
});

test('un tono yellow con --heading naranja sale con 1 y nombra el par', () => {
  const file = mutatedTokens((css) => replaceInTone(css, 'yellow', '--heading', 'var(--color-brand-orange)'));
  const res = run('--tokens', file);
  assert.equal(res.status, 1);
  assert.match(res.stderr, /tono yellow: --heading sobre --surface/);
  assert.match(res.stderr, /par prohibido/);
});

test('un tono yellow con --link blanco sale con 1 y nombra el par', () => {
  const file = mutatedTokens((css) => replaceInTone(css, 'yellow', '--link', 'var(--color-brand-white)'));
  const res = run('--tokens', file);
  assert.equal(res.status, 1);
  assert.match(res.stderr, /tono yellow: --link sobre --surface/);
  assert.match(res.stderr, /1\.58/);
});

test('un tono yellow con --on-cta blanco sale con 1 y nombra el par', () => {
  const file = mutatedTokens((css) => replaceInTone(css, 'yellow', '--on-cta', 'var(--color-brand-white)'));
  const res = run('--tokens', file);
  assert.equal(res.status, 1);
  assert.match(res.stderr, /tono yellow: --on-cta sobre --cta-bg/);
  assert.match(res.stderr, /2\.89/);
});

test('cambiar --color-brand-yellow rompe el par morado sobre amarillo', () => {
  const file = mutatedTokens((css) => css.replace(/(--color-brand-yellow:\s*)#ffc602/, '$1#fff000'));
  const res = run('--tokens', file);
  assert.equal(res.status, 1);
  assert.match(res.stderr, /purple sobre yellow/);
});

test('un tono purple con --bar naranja sale con 1, dice par prohibido y menciona 2.95', () => {
  const file = mutatedTokens((css) => replaceInTone(css, 'purple', '--bar', 'var(--color-brand-orange)'));
  const res = run('--tokens', file);
  assert.equal(res.status, 1);
  assert.match(res.stderr, /tono purple: --bar sobre --surface/);
  assert.match(res.stderr, /par prohibido/);
  assert.match(res.stderr, /2\.95/);
});

test('un tono purple con --on-surface oscuro sale con 1 y menciona 1.88', () => {
  const file = mutatedTokens((css) => replaceInTone(css, 'purple', '--on-surface', 'var(--color-brand-dark)'));
  const res = run('--tokens', file);
  assert.equal(res.status, 1);
  assert.match(res.stderr, /tono purple: --on-surface sobre --surface/);
  assert.match(res.stderr, /1\.88/);
});

test('cambiar --color-brand-purple a otro morado rompe check-contrast y nombra purple sobre white', () => {
  const file = mutatedTokens((css) => css.replace(/(--color-brand-purple:\s*)#4228d1/, '$1#7a1f8a'));
  const res = run('--tokens', file);
  assert.equal(res.status, 1);
  assert.match(res.stderr, /purple sobre white/);
});

test('cambiar --color-brand-cream a blanco rompe check-contrast y nombra cream sobre purple', () => {
  const file = mutatedTokens((css) => css.replace(/(--color-brand-cream:\s*)#f4f3e0/, '$1#ffffff'));
  const res = run('--tokens', file);
  assert.equal(res.status, 1);
  assert.match(res.stderr, /cream sobre purple/);
});

test('un tono light con --link crema sale con 1 y menciona 1.12', () => {
  const file = mutatedTokens((css) => replaceInTone(css, 'light', '--link', 'var(--color-brand-cream)'));
  const res = run('--tokens', file);
  assert.equal(res.status, 1);
  assert.match(res.stderr, /tono light: --link sobre --surface/);
  assert.match(res.stderr, /1\.12/);
});

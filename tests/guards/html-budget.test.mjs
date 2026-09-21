// WR-07: los topes de peso del HTML de `/` viven solo en tests/e2e/lib/budgets.mjs. Las cinco pruebas que
// los miden los importan de ahí; ningún archivo de prueba vuelve a escribir el tope crudo.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { HTML_GZIP_MAX, HTML_RAW_MAX } from '../e2e/lib/budgets.mjs';

const CONSUMERS = [
  'tests/e2e/page-structure.spec.ts',
  'tests/e2e/results-cases.spec.ts',
  'tests/e2e/team-includes-how.spec.ts',
  'tests/e2e/phase-closing.spec.ts',
  'tests/guards/brand-assets.test.mjs',
];

test('presupuesto del HTML: los dos topes son enteros positivos y el gzip es menor que el crudo', () => {
  assert.ok(Number.isInteger(HTML_RAW_MAX) && Number.isInteger(HTML_GZIP_MAX));
  assert.ok(HTML_GZIP_MAX > 0 && HTML_GZIP_MAX < HTML_RAW_MAX);
});

test('presupuesto del HTML: las cinco pruebas importan HTML_RAW_MAX y HTML_GZIP_MAX de budgets.mjs y los usan', () => {
  for (const file of CONSUMERS) {
    const src = readFileSync(file, 'utf8');
    assert.ok(/import \{[^}]*\bHTML_GZIP_MAX\b[^}]*\bHTML_RAW_MAX\b[^}]*\} from '(\.\/lib|\.\.\/e2e\/lib)\/budgets\.mjs';/.test(src), `${file}: no importa los topes de budgets.mjs`);
    assert.ok(/toBeLessThan\(HTML_RAW_MAX\)|< HTML_RAW_MAX|HTML_RAW_MAX\)/.test(src), `${file}: no usa HTML_RAW_MAX`);
    assert.ok(/HTML_GZIP_MAX/.test(src.replace(/import[^;]*;/, '')), `${file}: no usa HTML_GZIP_MAX`);
  }
});

test('presupuesto del HTML: ninguna prueba repite el tope crudo (81920 o 80 * 1024) fuera de budgets.mjs', () => {
  const files = [
    ...readdirSync('tests/e2e').filter((f) => f.endsWith('.ts')).map((f) => `tests/e2e/${f}`),
    ...readdirSync('tests/guards').filter((f) => f.endsWith('.mjs')).map((f) => `tests/guards/${f}`),
  ];
  const raw = new RegExp(`\\b${HTML_RAW_MAX}\\b|\\b${HTML_RAW_MAX / 1024} \\* 1024\\b`);
  for (const file of files) {
    if (file.endsWith('html-budget.test.mjs')) continue;
    assert.ok(!raw.test(readFileSync(file, 'utf8')), `${file}: repite el tope crudo del HTML`);
  }
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { parse } from 'yaml';
import { walkClaims } from '../../scripts/lib/copy-rules.mjs';

const CLI = resolve('scripts/list-pending.mjs');
const REAL_YAML = resolve('src/content/landing.es.yaml');
const HEADER = '| Clave | Texto actual | Motivo | Quién confirma |';

const tmp = () => mkdtempSync(join(tmpdir(), 'pending-'));

function run(args, { env = {}, cwd = tmp() } = {}) {
  const childEnv = { ...process.env };
  delete childEnv.PUBLIC_ENV;
  Object.assign(childEnv, env);
  const res = spawnSync('node', [CLI, ...args], { encoding: 'utf8', env: childEnv, cwd });
  return { status: res.status, out: `${res.stdout}\n${res.stderr}`, stdout: res.stdout, stderr: res.stderr };
}

// YAML mínimo con la forma real: cada reclamación queda bajo su clave dentro de una sección.
function yamlDoc(claims) {
  const body = claims
    .map(({ key, text, status, reason, confirm_by }) => {
      let s = `    ${key}:\n      text: ${JSON.stringify(text)}\n      status: ${status}\n`;
      if (reason !== undefined) s += `      reason: ${JSON.stringify(reason)}\n`;
      if (confirm_by !== undefined) s += `      confirm_by: ${JSON.stringify(confirm_by)}\n`;
      return s;
    })
    .join('');
  return `es:\n  sec:\n${body}  config:\n    form_url: "https://forms.example.com/f/abc"\n`;
}

function writeYaml(claims) {
  const file = join(tmp(), 'landing.es.yaml');
  writeFileSync(file, yamlDoc(claims));
  return file;
}

const dataRows = (md) =>
  md.split('\n').filter((l) => l.startsWith('| ') && l !== HEADER && !/^\| -+ /.test(l));
const sha = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');

const THREE = [
  { key: 'first', text: 'Primer texto', status: 'pending', reason: 'Falta respaldo', confirm_by: 'Camila' },
  { key: 'ok', text: 'Texto aprobado', status: 'verified' },
  { key: 'second', text: 'Segundo texto', status: 'pending' },
];

test('1. tabla con el encabezado exacto, la fila separadora y solo las pending en el orden del YAML', () => {
  const yaml = writeYaml(THREE);
  const out = join(tmp(), 'PENDING-COPY.md');
  const res = run(['--file', yaml, '--out', out]);
  assert.equal(res.status, 0, res.out);
  const md = readFileSync(out, 'utf8');
  const lines = md.split('\n');
  const headerAt = lines.indexOf(HEADER);
  assert.ok(headerAt > 0, `sin encabezado exacto:\n${md}`);
  assert.match(lines[headerAt + 1], /^\| -+ \| -+ \| -+ \| -+ \|$/);
  const rows = dataRows(md);
  assert.equal(rows.length, 2);
  assert.match(rows[0], /^\| sec\.first \|/);
  assert.match(rows[1], /^\| sec\.second \|/);
  assert.ok(!md.includes('sec.ok'));
  assert.ok(!md.includes('Texto aprobado'));
  assert.match(md, /^# Textos pendientes de confirmar\n/);
  assert.match(md, /npm run pending/);
});

test('2. confirm_by y reason dan sus valores y, si faltan, Ari y Sin motivo indicado', () => {
  const yaml = writeYaml(THREE);
  const out = join(tmp(), 'PENDING-COPY.md');
  assert.equal(run(['--file', yaml, '--out', out]).status, 0);
  const rows = dataRows(readFileSync(out, 'utf8'));
  assert.equal(rows[0], '| sec.first | Primer texto | Falta respaldo | Camila |');
  assert.equal(rows[1], '| sec.second | Segundo texto | Sin motivo indicado | Ari |');
});

test('3. salida determinista entre entornos y directorios de trabajo, sin fecha ni rutas absolutas', () => {
  const yaml = writeYaml(THREE);
  const outputs = [];
  for (const env of [{ PUBLIC_ENV: 'production' }, { PUBLIC_ENV: 'local' }, {}]) {
    for (const cwd of [tmp(), tmp()]) {
      const out = join(tmp(), 'PENDING-COPY.md');
      assert.equal(run(['--file', yaml, '--out', out], { env, cwd }).status, 0);
      outputs.push(readFileSync(out, 'utf8'));
    }
  }
  assert.equal(outputs.length, 6);
  assert.ok(outputs.every((o) => o === outputs[0]), 'las salidas difieren entre corridas');
  const md = outputs[0];
  assert.ok(!md.includes(tmpdir()), 'trae una ruta absoluta');
  assert.ok(!/\d{4}-\d{2}-\d{2}/.test(md), 'trae una fecha');
  assert.ok(!/\d{2}:\d{2}/.test(md), 'trae una hora');
  assert.ok(!md.includes('\r'));
  assert.ok(md.endsWith('\n') && !md.endsWith('\n\n'), 'debe terminar en un solo salto de línea');
});

test('4. una celda con | sale escapada y un salto de línea sale como espacio, con cuatro columnas por fila', () => {
  const yaml = writeYaml([
    { key: 'tricky', text: 'Uno | dos\ntres', status: 'pending', reason: 'Motivo | con barra\ny salto', confirm_by: 'Ari' },
  ]);
  const out = join(tmp(), 'PENDING-COPY.md');
  assert.equal(run(['--file', yaml, '--out', out]).status, 0);
  const rows = dataRows(readFileSync(out, 'utf8'));
  assert.equal(rows.length, 1);
  assert.equal(rows[0], '| sec.tricky | Uno \\| dos tres | Motivo \\| con barra y salto | Ari |');
  const cells = rows[0].split(/(?<!\\)\|/).slice(1, -1);
  assert.equal(cells.length, 4);
});

test('5. --check sale con 0 si coincide, con 1 si difiere o no existe, y nunca escribe', () => {
  const yaml = writeYaml(THREE);
  const out = join(tmp(), 'PENDING-COPY.md');

  const missing = run(['--file', yaml, '--out', out, '--check']);
  assert.equal(missing.status, 1, missing.out);
  assert.match(missing.out, /npm run pending/);
  assert.equal(existsSync(out), false, '--check no debe crear el archivo');

  assert.equal(run(['--file', yaml, '--out', out]).status, 0);
  const good = run(['--file', yaml, '--out', out, '--check']);
  assert.equal(good.status, 0, good.out);

  writeFileSync(out, `${readFileSync(out, 'utf8')}editado a mano\n`);
  const before = readFileSync(out, 'utf8');
  const stale = run(['--file', yaml, '--out', out, '--check']);
  assert.equal(stale.status, 1, stale.out);
  assert.match(stale.out, /npm run pending/);
  assert.equal(readFileSync(out, 'utf8'), before, '--check no debe modificar el archivo');
});

test('6. sin pendientes: título, línea de generación y "No hay textos pendientes." sin tabla, determinista', () => {
  const yaml = writeYaml([{ key: 'ok', text: 'Texto aprobado', status: 'verified' }]);
  const a = join(tmp(), 'PENDING-COPY.md');
  const b = join(tmp(), 'PENDING-COPY.md');
  assert.equal(run(['--file', yaml, '--out', a]).status, 0);
  assert.equal(run(['--file', yaml, '--out', b], { env: { PUBLIC_ENV: 'production' } }).status, 0);
  const md = readFileSync(a, 'utf8');
  assert.equal(md, readFileSync(b, 'utf8'));
  assert.match(md, /^# Textos pendientes de confirmar\n/);
  assert.match(md, /npm run pending/);
  assert.ok(md.includes('No hay textos pendientes.'));
  assert.ok(!md.includes('| Clave'), 'no debe haber tabla');
});

test('7. una reclamación FALTA CONFIRMAR pending aparece con su texto visible', () => {
  const yaml = writeYaml([{ key: 'gap', text: 'FALTA CONFIRMAR', status: 'pending', reason: 'Dato que falta' }]);
  const out = join(tmp(), 'PENDING-COPY.md');
  assert.equal(run(['--file', yaml, '--out', out]).status, 0);
  const rows = dataRows(readFileSync(out, 'utf8'));
  assert.deepEqual(rows, ['| sec.gap | FALTA CONFIRMAR | Dato que falta | Ari |']);
});

test('8. con el YAML real hay una fila por cada pending de walkClaims y el YAML no se modifica', () => {
  const before = sha(REAL_YAML);
  const out = join(tmp(), 'PENDING-COPY.md');
  const res = run(['--file', REAL_YAML, '--out', out]);
  assert.equal(res.status, 0, res.out);
  const expected = walkClaims(parse(readFileSync(REAL_YAML, 'utf8')))
    .filter((n) => n.kind === 'claim' && n.claim.status === 'pending')
    .map((n) => n.path);
  const rows = dataRows(readFileSync(out, 'utf8'));
  assert.deepEqual(
    rows.map((r) => r.split(' | ')[0].replace(/^\| /, '')),
    expected,
  );
  assert.ok(rows.every((r) => r.endsWith('| Ari |')));
  assert.ok(rows.every((r) => !r.includes('Sin motivo indicado')));
  assert.equal(sha(REAL_YAML), before);
});

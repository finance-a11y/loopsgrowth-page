import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { checkCopy, walkClaims, MISSING_MARK } from '../../scripts/lib/copy-rules.mjs';

// Guarda del copy de Quiénes somos, Qué incluye y Cómo funciona (plan 02-05). Todo se deriva del YAML
// real: ninguna cadena ni lista de rutas pending se escribe a mano (COPY-01).
const doc = parse(readFileSync('src/content/landing.es.yaml', 'utf8'));
const es = doc.es;

// Secciones de este plan y cantidades del contrato (el esquema las impone con `.length()`).
const SECTIONS = ['team', 'includes', 'how_it_works'];
const COUNTS = [
  ['team.members', 4],
  ['includes.items', 6],
  ['how_it_works.steps', 4],
];

const inSections = (path) => SECTIONS.some((s) => path === s || path.startsWith(`${s}.`) || path.startsWith(`${s}[`));
const mine = walkClaims(doc).filter((n) => inSections(n.path));

const lookup = (dotted) => dotted.split('.').reduce((node, key) => node?.[key], es);

test('las secciones del plan existen en el YAML y traen afirmaciones', () => {
  for (const section of SECTIONS) assert.ok(es[section], `falta la clave ${section}`);
  assert.ok(mine.length > 0, 'walkClaims no encontró afirmaciones de las secciones del plan');
});

test('(a) ninguna cadena suelta dentro de las secciones (BARE_STRING)', () => {
  const bare = mine.filter((n) => n.kind === 'bare').map((n) => n.path);
  assert.deepEqual(bare, []);
});

test('(b) toda afirmación verified queda fuera de las violaciones de contenido', () => {
  const { content } = checkCopy(doc);
  const verifiedPaths = new Set(mine.filter((n) => n.claim?.status === 'verified').map((n) => n.path));
  const offenders = content.filter((v) => verifiedPaths.has(v.path)).map((v) => `${v.rule} ${v.path}`);
  assert.deepEqual(offenders, []);
});

test('(c) toda afirmación pending tiene reason no vacío', () => {
  const missing = mine
    .filter((n) => n.claim?.status === 'pending' && !(typeof n.claim.reason === 'string' && n.claim.reason.trim()))
    .map((n) => n.path);
  assert.deepEqual(missing, []);
});

test('(d) si el reason menciona AEO, el text es exactamente FALTA CONFIRMAR', () => {
  const offenders = mine
    .filter((n) => n.claim && /\bAEO\b/.test(n.claim.reason ?? '') && n.claim.text !== MISSING_MARK)
    .map((n) => n.path);
  assert.deepEqual(offenders, []);
});

test('(e) cantidades del contrato', () => {
  for (const [path, expected] of COUNTS) {
    const list = lookup(path);
    assert.ok(Array.isArray(list), `${path} no es una lista`);
    assert.equal(list.length, expected, `${path} debe tener ${expected} elementos`);
  }
});

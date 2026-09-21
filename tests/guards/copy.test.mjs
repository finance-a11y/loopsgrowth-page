import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parse } from 'yaml';
import { checkCopy, walkClaims, MISSING_MARK, findMissingMark } from '../../scripts/lib/copy-rules.mjs';

const CLI = 'scripts/check-copy.mjs';
const FIX = 'tests/guards/fixtures';
const REAL_YAML = 'src/content/landing.es.yaml';

// Raíz vacía y hermética: ningún `.env` del desarrollador cambia el resultado de las pruebas.
const EMPTY_ROOT = mkdtempSync(join(tmpdir(), 'copy-root-'));

function run(args, { env = {}, root = EMPTY_ROOT } = {}) {
  const childEnv = { ...process.env };
  delete childEnv.PUBLIC_ENV;
  Object.assign(childEnv, env);
  const res = spawnSync('node', [CLI, ...args, '--root', root], { encoding: 'utf8', env: childEnv });
  let json = null;
  if (args.includes('--json')) {
    try {
      json = JSON.parse(res.stdout);
    } catch {
      json = null;
    }
  }
  return { status: res.status, stdout: res.stdout, stderr: res.stderr, out: `${res.stdout}\n${res.stderr}`, json };
}

const PROD = { PUBLIC_ENV: 'production' };
const LOCAL = { PUBLIC_ENV: 'local' };
const fixture = (name) => join(FIX, `${name}.yaml`);
const rules = (json) => (json?.content ?? []).map((v) => v.rule);
const structuralRules = (json) => (json?.structural ?? []).map((v) => v.rule);

function tmpYaml(body) {
  const dir = mkdtempSync(join(tmpdir(), 'copy-yaml-'));
  const file = join(dir, 'landing.es.yaml');
  writeFileSync(file, body);
  return file;
}

// YAML mínimo con la forma real; `hero.subtitle` recibe el bloque de la reclamación bajo prueba.
function docWith(claimLines) {
  return `es:
  hero:
    h1:
      text: "Crecemos tu tienda."
      status: verified
    subtitle:
${claimLines}
  config:
    form_url: "https://forms.example.com/f/abc"
`;
}
const claimYaml = (text, status = 'verified', extra = '') =>
  `      text: ${JSON.stringify(text)}\n      status: ${status}${extra ? `\n${extra}` : ''}`;

const sha = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');

test('1a. clean.yaml sale con 0 en producción y reporta los conteos', () => {
  const res = run(['--file', fixture('clean'), '--json'], { env: PROD });
  assert.equal(res.status, 0, res.out);
  assert.deepEqual(res.json?.content, []);
  assert.deepEqual(res.json?.structural, []);
  assert.equal(res.json?.pending, 0);
  assert.ok(res.json?.verified >= 3);
});

test('1b. clean.yaml sale con 0 fuera de producción e imprime los conteos', () => {
  const res = run(['--file', fixture('clean')], { env: LOCAL });
  assert.equal(res.status, 0, res.out);
  assert.match(res.out, /verified/);
  assert.match(res.out, /pending/);
});

test('2a. pending.yaml sale con 1 en producción y lista la ruta YAML', () => {
  const res = run(['--file', fixture('pending'), '--json'], { env: PROD });
  assert.equal(res.status, 1, res.out);
  const hit = (res.json?.content ?? []).find((v) => v.rule === 'PENDING');
  assert.ok(hit, `sin violación PENDING: ${res.out}`);
  assert.equal(hit.path, 'hero.subtitle');
});

test('2b. pending.yaml sale con 0 y advierte fuera de producción', () => {
  const res = run(['--file', fixture('pending')], { env: LOCAL });
  assert.equal(res.status, 0, res.out);
  assert.match(res.out, /WARN/);
  assert.match(res.out, /PENDING/);
  assert.match(res.out, /hero\.subtitle/);
});

test('2c. sin PUBLIC_ENV definido tampoco bloquea y advierte', () => {
  const res = run(['--file', fixture('pending')]);
  assert.equal(res.status, 0, res.out);
  assert.match(res.out, /WARN/);
});

test('2d. solo el valor exacto production bloquea (Production no bloquea)', () => {
  const res = run(['--file', fixture('pending')], { env: { PUBLIC_ENV: 'Production' } });
  assert.equal(res.status, 0, res.out);
  assert.match(res.out, /WARN/);
});

test('3. un marcador de verificación pendiente en text bloquea producción y solo advierte fuera de ella', () => {
  const prod = run(['--file', fixture('verificar'), '--json'], { env: PROD });
  assert.equal(prod.status, 1, prod.out);
  assert.ok(rules(prod.json).includes('VERIFICAR'), prod.out);
  const local = run(['--file', fixture('verificar')], { env: LOCAL });
  assert.equal(local.status, 0, local.out);
  assert.match(local.out, /WARN/);
  assert.match(local.out, /VERIFICAR/);
});

// Formas reales del doc de Ari (líneas 104 y 115 de 02-ARI-COPY-V2.md): la nota con paréntesis dentro y el
// rango. `VERIFICAR_RE` debe reconocer `[VERIFICAR: nota]` y `[VERIFICAR rango]`, no solo `[VERIFICAR]`.
const NOTA_PILAR_4 =
  '[VERIFICAR: solo desglosa por canal (Google vs IA) si de verdad puedes atribuirlo con datos. Si no, repórtalo junto y no inventes el split.]';
const verificarCount = (text, status = 'verified', extra = '') =>
  checkCopy(parse(docWith(claimYaml(text, status, extra)))).content.filter((v) => v.rule === 'VERIFICAR').length;

test('3b. cada forma de la marca VERIFICAR en text da exactamente una violación', () => {
  const forms = {
    'la marca sin nota': 'Reducimos tu presupuesto [VERIFICAR]',
    'la nota real del Pilar 4 (con paréntesis dentro)': `Cada mes ves qué se hizo. ${NOTA_PILAR_4}`,
    'la marca con un rango': 'Varios clientes bajan entre 30% y 50% su presupuesto. [VERIFICAR rango]',
    'la marca en minúsculas con nota': 'Reducimos tu presupuesto [verificar: confirmar la cifra]',
    'una nota que salta de línea': 'Reducimos tu presupuesto [VERIFICAR: confirmar\nla cifra con Ari]',
    'una marca sin corchete de cierre': 'Reducimos tu presupuesto [VERIFICAR: confirmar la cifra',
  };
  for (const [label, text] of Object.entries(forms)) {
    assert.equal(verificarCount(text), 1, `${label}: ${JSON.stringify(text)}`);
  }
});

test('3c. lo que no es una marca no da VERIFICAR', () => {
  assert.equal(verificarCount('Podemos verificar cada cifra contigo.'), 0);
  assert.equal(verificarCount('Cada cifra queda [VERIFICADO] antes de publicarse.'), 0);
  assert.equal(verificarCount('La palabra VERIFICAR sin corchete no es una marca.'), 0);
  // Una nota en `reason` sobre un `text` limpio no bloquea: el patrón de 02-03 guarda la nota literal ahí.
  assert.equal(
    verificarCount('Crecemos tu tienda.', 'pending', '      reason: "[VERIFICAR: nota de Ari]"\n      confirm_by: Ari'),
    0,
  );
});

test('3d. dos marcas en un mismo texto dan dos violaciones', () => {
  assert.equal(verificarCount(`Primero. ${NOTA_PILAR_4} Después, un rango. [VERIFICAR rango]`), 2);
});

test('3e. el fixture con [VERIFICAR: nota] bloquea producción y solo advierte fuera de ella', () => {
  const prod = run(['--file', fixture('verificar-nota'), '--json'], { env: PROD });
  assert.equal(prod.status, 1, prod.out);
  assert.ok(rules(prod.json).includes('VERIFICAR'), prod.out);
  const local = run(['--file', fixture('verificar-nota')], { env: LOCAL });
  assert.equal(local.status, 0, local.out);
  assert.match(local.out, /WARN/);
  assert.match(local.out, /VERIFICAR/);
});

test('4a. voseo (tenés) bloquea producción', () => {
  const res = run(['--file', fixture('voseo'), '--json'], { env: PROD });
  assert.equal(res.status, 1, res.out);
  assert.ok(rules(res.json).includes('VOSEO'), res.out);
});

test('4b. voseo con vocal acentuada final (agendá, llená) se detecta con límites Unicode', () => {
  const res = run(['--file', fixture('voseo-accent-final'), '--json'], { env: PROD });
  assert.equal(res.status, 1, res.out);
  const excerpts = (res.json?.content ?? []).filter((v) => v.rule === 'VOSEO').map((v) => v.excerpt).join(' ');
  assert.match(excerpts, /Agendá/);
  assert.match(excerpts, /llená/);
});

test('4c. "tú" y las formas no voseantes no se marcan', () => {
  const file = tmpYaml(docWith(claimYaml('Tú puedes escribir, sabes que hablamos con honestidad y sosegamos dudas.')));
  const res = run(['--file', file, '--json'], { env: PROD });
  assert.equal(res.status, 0, res.out);
  assert.ok(!rules(res.json).includes('VOSEO'), res.out);
});

test('4d. voseo con formas fuera de la lista original (conocé, completá, llamanos) también se detecta', () => {
  const file = tmpYaml(docWith(claimYaml('Conocé cómo, completá el formulario y llamanos.')));
  const res = run(['--file', file, '--json'], { env: PROD });
  assert.equal(res.status, 1, res.out);
  const excerpts = (res.json?.content ?? []).filter((v) => v.rule === 'VOSEO').map((v) => v.excerpt).join(' ');
  assert.match(excerpts, /Conocé/);
  assert.match(excerpts, /completá/);
  assert.match(excerpts, /llamanos/);
});

test('4e. voseo en Unicode descompuesto (NFD) o con espacio de ancho cero no evade la guarda', () => {
  const nfd = 'Tene\u0301s dudas'; // "Tenés" con la tilde como carácter combinante
  const zw = 'Agen\u200bdá una llamada'; // espacio de ancho cero dentro de la palabra
  for (const text of [nfd, zw]) {
    const file = tmpYaml(docWith(claimYaml(text)));
    const res = run(['--file', file, '--json'], { env: PROD });
    assert.equal(res.status, 1, `${JSON.stringify(text)}: ${res.out}`);
    assert.ok(rules(res.json).includes('VOSEO'), `${JSON.stringify(text)}: ${res.out}`);
  }
});

test('4f. la sigla SOS no se marca como voseo, pero el verbo "sos" en minúscula sí', () => {
  const ok = tmpYaml(docWith(claimYaml('Una llamada SOS para tu tienda.')));
  const resOk = run(['--file', ok, '--json'], { env: PROD });
  assert.equal(resOk.status, 0, resOk.out);
  assert.ok(!rules(resOk.json).includes('VOSEO'), resOk.out);
  const bad = tmpYaml(docWith(claimYaml('Si sos dueño de una tienda, escríbenos.')));
  const resBad = run(['--file', bad, '--json'], { env: PROD });
  assert.equal(resBad.status, 1, resBad.out);
  assert.ok(rules(resBad.json).includes('VOSEO'), resBad.out);
});

// Evalúa un texto suelto con las reglas de contenido, sin lanzar el CLI: devuelve los extractos VOSEO.
const voseoHits = (text) =>
  checkCopy({ es: { hero: { subtitle: { text, status: 'verified' } } } }).content.filter((v) => v.rule === 'VOSEO');

test('4g. "Sos" con mayúscula inicial y "sos" en minúscula se marcan; la sigla SOS no', () => {
  for (const text of ['¿Sos dueño de una tienda?', 'Sos el dueño.', 'Si sos dueño, escríbenos.']) {
    assert.ok(voseoHits(text).length > 0, `no se marcó: ${JSON.stringify(text)}`);
  }
  for (const text of ['Una llamada SOS para tu tienda.', 'SOS', 'Servicio SOS y soporte']) {
    assert.deepEqual(voseoHits(text), [], `falso positivo: ${JSON.stringify(text)}`);
  }
});

test('4h. imperativos de CTA y sus formas con enclítico (Contactá, Consultanos, Hacelo, Ponete, Probalo, Pedile, Sabé) se marcan', () => {
  const bad = [
    'Contactá a un experto', 'Consultanos hoy', 'Hacelo ahora', 'Ponete en contacto', 'Probalo gratis',
    'Pedile una cotización a tu asesor', 'Sabé que tu tienda puede crecer', 'Contactame por acá',
    'Mandale un mensaje al equipo', 'Descargalo aquí', 'Usá la guía',
  ];
  for (const text of bad) assert.ok(voseoHits(text).length > 0, `no se marcó: ${JSON.stringify(text)}`);
});

test('4i. las formas de tú con tilde, "tomate" y las palabras en inglés no se marcan como voseo', () => {
  const ok = [
    'Contáctanos hoy', 'Consúltanos sin costo', 'Hazlo ahora', 'Ponte en contacto', 'Pruébalo gratis',
    'Pídele una cotización a tu asesor', 'Sabe que tu tienda puede crecer', 'Contáctame por aquí',
    'Envíale un mensaje al equipo', 'Descárgalo aquí', 'Usa la guía', 'Ensalada de tomate y mandala',
    'Create, activate y generate son verbos en inglés', 'Ayer pidió una cotización y llamó al equipo',
  ];
  for (const text of ok) assert.deepEqual(voseoHits(text), [], `falso positivo: ${JSON.stringify(text)}`);
});

test('4j. "Sos" con mayúscula inicial bloquea producción desde el CLI', () => {
  const file = tmpYaml(docWith(claimYaml('¿Sos dueño de una tienda? Contactá a Loops Growth.')));
  const res = run(['--file', file, '--json'], { env: PROD });
  assert.equal(res.status, 1, res.out);
  const excerpts = (res.json?.content ?? []).filter((v) => v.rule === 'VOSEO').map((v) => v.excerpt).join(' ');
  assert.match(excerpts, /Sos/);
  assert.match(excerpts, /Contactá/);
});

test('5a. guion largo U+2014 bloquea producción', () => {
  const res = run(['--file', fixture('em-dash'), '--json'], { env: PROD });
  assert.equal(res.status, 1, res.out);
  assert.ok(rules(res.json).includes('DASH'), res.out);
});

test('5b. guion medio U+2013 bloquea producción', () => {
  const res = run(['--file', fixture('en-dash'), '--json'], { env: PROD });
  assert.equal(res.status, 1, res.out);
  assert.ok(rules(res.json).includes('DASH'), res.out);
});

test('6a. el término AEO como palabra completa bloquea producción', () => {
  const res = run(['--file', fixture('aeo'), '--json'], { env: PROD });
  assert.equal(res.status, 1, res.out);
  assert.ok(rules(res.json).includes('AEO'), res.out);
});

test('6b. una palabra que solo contiene AEO dentro de otra no se marca', () => {
  const file = tmpYaml(docWith(claimYaml('Un subaeo y el término AEOLIANO no cuentan.')));
  const res = run(['--file', file, '--json'], { env: PROD });
  assert.equal(res.status, 0, res.out);
  assert.ok(!rules(res.json).includes('AEO'), res.out);
});

test('7a. texto suelto fuera de una reclamación falla en producción y fuera de ella', () => {
  for (const env of [PROD, LOCAL, {}]) {
    const res = run(['--file', fixture('bare-string'), '--json'], { env });
    assert.equal(res.status, 1, res.out);
    assert.ok(structuralRules(res.json).includes('BARE_STRING'), res.out);
    const hit = res.json.structural.find((v) => v.rule === 'BARE_STRING');
    assert.equal(hit.path, 'hero.tagline');
  }
});

test('7b. status distinto de verified o pending falla en cualquier entorno', () => {
  for (const env of [PROD, LOCAL, {}]) {
    const res = run(['--file', fixture('bad-status'), '--json'], { env });
    assert.equal(res.status, 1, res.out);
    assert.ok(structuralRules(res.json).includes('BAD_STATUS'), res.out);
  }
});

test('8. PUBLIC_ENV=production solo en .env dentro de --root también bloquea', () => {
  const root = mkdtempSync(join(tmpdir(), 'copy-envroot-'));
  writeFileSync(join(root, '.env'), 'PUBLIC_ENV=production\n');
  const res = run(['--file', fixture('pending'), '--json'], { root });
  assert.equal(res.status, 1, res.out);
  assert.ok(rules(res.json).includes('PENDING'), res.out);
  assert.equal(res.json?.production, true);
});

test('9a. el YAML real sale con 0 fuera de producción y no se modifica (solo lectura)', () => {
  const before = sha(REAL_YAML);
  const res = run(['--file', REAL_YAML], { env: LOCAL });
  assert.equal(res.status, 0, res.out);
  assert.match(res.out, /WARN/);
  assert.match(res.out, /verified/);
  assert.match(res.out, /pending/);
  assert.equal(sha(REAL_YAML), before);
});

test('9b. sobre el YAML real, producción solo reporta PENDING y MISSING, derivados del propio YAML', () => {
  const before = sha(REAL_YAML);
  const res = run(['--file', REAL_YAML, '--json'], { env: PROD });
  assert.deepEqual(res.json?.structural, []);
  const violations = res.json?.content ?? [];
  // Solo dos reglas de contenido pueden aparecer sobre el YAML real: PENDING y MISSING (dato faltante).
  // VOSEO, DASH, AEO y VERIFICAR nunca: el texto de Ari que las dispararía queda pending con la marca.
  assert.ok(violations.every((v) => v.rule === 'PENDING' || v.rule === 'MISSING'), JSON.stringify(violations));
  // Lo esperado se deriva del YAML: cuando Ari confirma un texto, esta prueba no se rompe.
  const claims = walkClaims(parse(readFileSync(REAL_YAML, 'utf8'))).filter((n) => n.kind === 'claim');
  const pending = claims.filter((n) => n.claim.status === 'pending').map((n) => n.path).sort();
  const missing = claims.filter((n) => findMissingMark(String(n.claim.text)).length > 0).map((n) => n.path).sort();
  const byRule = (rule) => violations.filter((v) => v.rule === rule).map((v) => v.path).sort();
  assert.deepEqual(byRule('PENDING'), pending);
  assert.deepEqual(byRule('MISSING'), missing);
  // Toda reclamación con la marca de dato faltante debe estar pending: nunca se publica como verificada.
  for (const n of claims.filter((c) => c.claim.text === MISSING_MARK)) {
    assert.equal(n.claim.status, 'pending', `${n.path} lleva ${MISSING_MARK} y debe ser pending`);
  }
  assert.equal(res.status, pending.length + missing.length > 0 ? 1 : 0, res.out);
  assert.equal(sha(REAL_YAML), before);
});

test('9c. los textos estructurales pasan por las reglas: voseo en agenda.fallback_lead bloquea producción', () => {
  const original = readFileSync(REAL_YAML, 'utf8');
  const needle = '¿El formulario no carga o prefieres abrirlo aparte?';
  assert.ok(original.includes(needle));
  const file = tmpYaml(original.replace(needle, '¿El formulario no carga? Tenés otra opción.'));
  const res = run(['--file', file, '--json'], { env: PROD });
  assert.equal(res.status, 1, res.out);
  const hit = (res.json?.content ?? []).find((v) => v.rule === 'VOSEO');
  assert.ok(hit, res.out);
  assert.equal(hit.path, 'agenda.fallback_lead');
});

test('10. FALTA CONFIRMAR en text bloquea producción con cualquier status (regla MISSING) y solo advierte fuera de ella', () => {
  for (const status of ['pending', 'verified']) {
    const file = tmpYaml(docWith(claimYaml('FALTA CONFIRMAR', status)));
    const prod = run(['--file', file, '--json'], { env: PROD });
    assert.equal(prod.status, 1, prod.out);
    const hit = (prod.json?.content ?? []).find((v) => v.rule === 'MISSING');
    assert.ok(hit, `${status}: sin violación MISSING: ${prod.out}`);
    assert.equal(hit.path, 'hero.subtitle');
    const local = run(['--file', file], { env: LOCAL });
    assert.equal(local.status, 0, local.out);
    assert.match(local.out, /WARN/);
    assert.match(local.out, /MISSING/);
  }
});

test('10b. FALTA CONFIRMAR con otras mayúsculas o espacios distintos también bloquea producción', () => {
  const variants = ['Falta confirmar', 'falta  confirmar', 'FALTA\u00a0CONFIRMAR', 'FALTA\u2009CONFIRMAR', 'FALTA \u200bCONFIRMAR', 'FAL\u200bTA CONFIRMAR'];
  for (const text of variants) {
    const file = tmpYaml(docWith(claimYaml(`Dato: ${text}`, 'verified')));
    const res = run(['--file', file, '--json'], { env: PROD });
    assert.equal(res.status, 1, `${JSON.stringify(text)}: ${res.out}`);
    assert.ok(rules(res.json).includes('MISSING'), `${JSON.stringify(text)}: ${res.out}`);
  }
});

function makeDist(files) {
  const dir = mkdtempSync(join(tmpdir(), 'copy-dist-'));
  for (const [rel, content] of Object.entries(files)) {
    const full = join(dir, rel);
    mkdirSync(join(full, '..'), { recursive: true });
    writeFileSync(full, content);
  }
  return dir;
}

test('11a. --dist con FALTA CONFIRMAR en un archivo sale con 1 en producción y nombra el archivo', () => {
  const dist = makeDist({
    'index.html': '<p>Hola FALTA CONFIRMAR</p>',
    'sub/about.html': '<p>limpio</p>',
  });
  const res = run(['--dist', dist, '--json'], { env: PROD });
  assert.equal(res.status, 1, res.out);
  const hit = (res.json?.content ?? []).find((v) => v.rule === 'MISSING');
  assert.ok(hit, res.out);
  assert.match(hit.file, /index\.html$/);
  const text = run(['--dist', dist], { env: PROD });
  assert.match(text.out, /index\.html/);
});

test('11a-bis. --dist detecta FALTA CONFIRMAR con mayúsculas, espacios distintos o &nbsp;', () => {
  for (const html of ['<p>Falta confirmar</p>', '<p>FALTA  CONFIRMAR</p>', '<p>FALTA&nbsp;CONFIRMAR</p>', '<p>FALTA\u00a0CONFIRMAR</p>']) {
    const dist = makeDist({ 'index.html': html });
    const res = run(['--dist', dist, '--json'], { env: PROD });
    assert.equal(res.status, 1, `${JSON.stringify(html)}: ${res.out}`);
    assert.ok(rules(res.json).includes('MISSING'), `${JSON.stringify(html)}: ${res.out}`);
  }
});

test('11b. --dist con FALTA CONFIRMAR fuera de producción imprime WARN y sale con 0', () => {
  const dist = makeDist({ 'index.html': '<p>FALTA CONFIRMAR</p>' });
  const res = run(['--dist', dist], { env: LOCAL });
  assert.equal(res.status, 0, res.out);
  assert.match(res.out, /WARN/);
  assert.match(res.out, /index\.html/);
});

test('11c. --dist sin la cadena sale con 0 en ambos entornos', () => {
  const dist = makeDist({ 'index.html': '<p>Todo confirmado</p>', 'robots.txt': 'User-agent: *\n' });
  for (const env of [PROD, LOCAL]) {
    const res = run(['--dist', dist, '--json'], { env });
    assert.equal(res.status, 0, res.out);
    assert.deepEqual(res.json?.content, []);
  }
});

test('11d. --dist con un directorio inexistente sale con 1 en cualquier entorno', () => {
  const missing = join(tmpdir(), 'copy-dist-no-existe-xyz');
  for (const env of [PROD, LOCAL]) {
    const res = run(['--dist', missing], { env });
    assert.equal(res.status, 1, res.out);
    assert.match(res.out, /no existe|inexistente|no se encontr/i);
  }
});

test('11e. --dist ignora archivos binarios y de otras extensiones', () => {
  const dist = makeDist({ 'index.html': '<p>ok</p>', 'font.woff2': 'FALTA CONFIRMAR' });
  const res = run(['--dist', dist, '--json'], { env: PROD });
  assert.equal(res.status, 0, res.out);
});

test('12a. confirm_by y reason son claves permitidas y no se escanean como copy', () => {
  const extra = '      confirm_by: "Camila"\n      reason: "Falta el dato, no el guion — solo un metadato"';
  const file = tmpYaml(docWith(claimYaml('Un equipo dedicado.', 'verified', extra)));
  const res = run(['--file', file, '--json'], { env: PROD });
  assert.equal(res.status, 0, res.out);
  assert.deepEqual(res.json?.structural, []);
  assert.deepEqual(res.json?.content, []);
});

test('12b. una clave extra desconocida falla en cualquier entorno', () => {
  const file = tmpYaml(docWith(claimYaml('Un equipo dedicado.', 'verified', '      foo: "x"')));
  for (const env of [PROD, LOCAL]) {
    const res = run(['--file', file, '--json'], { env });
    assert.equal(res.status, 1, res.out);
    assert.ok(structuralRules(res.json).length > 0, res.out);
  }
});

test('12c. un text vacío o de solo espacios falla en cualquier entorno (EMPTY_TEXT)', () => {
  for (const text of ['', '   ']) {
    const file = tmpYaml(docWith(claimYaml(text)));
    for (const env of [PROD, LOCAL]) {
      const res = run(['--file', file, '--json'], { env });
      assert.equal(res.status, 1, res.out);
      assert.ok(structuralRules(res.json).includes('EMPTY_TEXT'), res.out);
    }
  }
});

test('13a. una llave {term} en un texto que la página imprime en bruto (hero.h1) falla en cualquier entorno', () => {
  const body = docWith(claimYaml('Un equipo dedicado.')).replace('"Crecemos tu tienda."', '"Crecemos tu {term} con Google."');
  const file = tmpYaml(body);
  for (const env of [PROD, LOCAL]) {
    const res = run(['--file', file, '--json'], { env });
    assert.equal(res.status, 1, res.out);
    const hit = (res.json?.structural ?? []).find((v) => v.rule === 'PLACEHOLDER');
    assert.ok(hit, res.out);
    assert.equal(hit.path, 'hero.h1');
  }
});

test('13b. {term} y {duration} siguen permitidos donde la página usa fill() (subtitle, intro, *_template)', () => {
  const file = tmpYaml(docWith(claimYaml('Ejecutamos tu {term} en {duration}.')));
  const res = run(['--file', file, '--json'], { env: LOCAL });
  assert.equal(res.status, 0, res.out);
  assert.deepEqual(res.json?.structural, []);
});

test('13c. una variable desconocida o una llave sin pareja falla aunque la ruta admita placeholders', () => {
  for (const text of ['Ejecutamos tu {foo}.', 'Ejecutamos tu {term.', 'Ejecutamos tu term}.']) {
    const file = tmpYaml(docWith(claimYaml(text)));
    const res = run(['--file', file, '--json'], { env: LOCAL });
    assert.equal(res.status, 1, `${text}: ${res.out}`);
    assert.ok(structuralRules(res.json).includes('PLACEHOLDER'), `${text}: ${res.out}`);
  }
});

// ---------------------------------------------------------------------------------------------
// Plan 02-06, tarea 2: guarda INVERSION (hallazgo 6 del UI-SPEC). Pruebas por mutación sobre las
// rutas `for_whom.*` y `faq.*`. Solo se agregan pruebas al final: la 9b y la 10 son del plan 02-03.
// El espacio de nombres evita que un export ausente rompa la carga de todo el archivo.
import * as copyRules from '../../scripts/lib/copy-rules.mjs';

const INVERSION_MARKED = ['4 a 5k al mes', '4-5k al mes', '1.5k al mes', '+1500 al mes', 'USD 1500', 'desde $2,000'];
const INVERSION_SAFE = ['USD 200k o más al año', 'facturación de 200k al año', '6-12 meses', '2 veces al mes'];

// Una afirmación bajo `for_whom.is_for.items[0]` o `faq.items[0].answer`, con el estado indicado.
function inversionDoc(where, text, status = 'pending') {
  const claim = (pad) =>
    `${pad}text: ${JSON.stringify(text)}\n${pad}status: ${status}${status === 'pending' ? `\n${pad}confirm_by: Ari\n${pad}reason: "prueba"` : ''}`;
  const body = {
    for_whom: `  for_whom:\n    is_for:\n      items:\n        - ${claim('          ').trimStart()}\n`,
    faq: `  faq:\n    items:\n      - question:\n          text: "Pregunta"\n          status: verified\n        answer:\n${claim('          ')}\n`,
    cases: `  cases:\n    items:\n      - figure:\n${claim('          ')}\n`,
  }[where];
  return `es:\n${body}  config:\n    form_url: "https://forms.example.com/f/abc"\n`;
}
const inversionRun = (where, text, status, env) => run(['--file', tmpYaml(inversionDoc(where, text, status)), '--json'], { env });

test('14a. INVERSION marca cada cifra de inversión pending en for_whom y en faq; bloquea en producción y avisa en local', () => {
  for (const [i, text] of INVERSION_MARKED.entries()) {
    const where = i % 2 === 0 ? 'for_whom' : 'faq';
    const prod = inversionRun(where, text, 'pending', PROD);
    assert.equal(prod.status, 1, `${where} ${text}: ${prod.out}`);
    assert.ok(rules(prod.json).includes('INVERSION'), `${where} ${text}: ${prod.out}`);
    assert.deepEqual(prod.json?.structural, [], `${where} ${text}`);
    const local = inversionRun(where, text, 'pending', LOCAL);
    assert.equal(local.status, 0, `${where} ${text}: ${local.out}`);
    assert.ok(rules(local.json).includes('INVERSION'), `${where} ${text}: ${local.out}`);
    const hit = local.json.content.find((v) => v.rule === 'INVERSION');
    assert.match(hit.path, /^(for_whom|faq)\./);
    assert.ok(hit.excerpt.length > 0);
  }
});

test('14b. INVERSION marca la cifra en las dos rutas para cada texto, no solo alternadas', () => {
  for (const text of INVERSION_MARKED) {
    for (const where of ['for_whom', 'faq']) {
      const res = inversionRun(where, `Con ${text} empezamos.`, 'pending', LOCAL);
      assert.ok(rules(res.json).includes('INVERSION'), `${where} ${text}: ${res.out}`);
    }
  }
});

test('14c. la misma cadena con status verified no se marca (la aprobó una persona)', () => {
  for (const text of INVERSION_MARKED) {
    for (const where of ['for_whom', 'faq']) {
      for (const env of [PROD, LOCAL]) {
        const res = inversionRun(where, text, 'verified', env);
        assert.equal(res.status, 0, `${where} ${text}: ${res.out}`);
        assert.ok(!rules(res.json).includes('INVERSION'), `${where} ${text}: ${res.out}`);
      }
    }
  }
});

test('14d. la misma cifra en otra ruta (cases.*: De $41K a $76K en ventas) no se marca', () => {
  for (const text of ['De $41K a $76K en ventas', ...INVERSION_MARKED]) {
    const res = inversionRun('cases', text, 'pending', LOCAL);
    assert.ok(!rules(res.json).includes('INVERSION'), `${text}: ${res.out}`);
  }
});

test('14e. el perfil de facturación y los plazos no se marcan como inversión', () => {
  for (const text of INVERSION_SAFE) {
    for (const where of ['for_whom', 'faq']) {
      const res = inversionRun(where, text, 'pending', LOCAL);
      assert.ok(!rules(res.json).includes('INVERSION'), `${where} ${text}: ${res.out}`);
    }
  }
});

test('14f. un separador invisible dentro de la cifra no la esconde de INVERSION', () => {
  const res = inversionRun('for_whom', '+15​00 al mes', 'pending', LOCAL);
  assert.ok(rules(res.json).includes('INVERSION'), res.out);
});

test('14g. INVERSION_PATH_PREFIXES y findInversion se exportan con el contrato del plan', () => {
  assert.deepEqual(copyRules.INVERSION_PATH_PREFIXES, ['for_whom.', 'faq.']);
  assert.ok(copyRules.INVERSION_MONTHLY_RE instanceof RegExp);
  assert.ok(copyRules.INVERSION_CURRENCY_RE instanceof RegExp);
  for (const text of INVERSION_MARKED) {
    const found = copyRules.findInversion(text);
    assert.ok(Array.isArray(found) && found.length > 0, text);
  }
  for (const text of INVERSION_SAFE) assert.deepEqual(copyRules.findInversion(text), [], text);
});

test('14h. con el YAML real no hay INVERSION y las rutas nuevas solo reportan PENDING y MISSING', () => {
  const res = run(['--file', REAL_YAML, '--json'], { env: PROD });
  assert.deepEqual(res.json?.structural, [], res.out);
  assert.ok(!rules(res.json).includes('INVERSION'), res.out);
  const mine = (res.json?.content ?? []).filter((v) => /^(for_whom|faq)\./.test(v.path));
  assert.ok(mine.length > 0, 'las rutas for_whom y faq deben aparecer en el YAML real');
  assert.ok(mine.every((v) => v.rule === 'PENDING' || v.rule === 'MISSING'), JSON.stringify(mine));
});

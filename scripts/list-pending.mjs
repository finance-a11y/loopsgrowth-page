// Genera PENDING-COPY.md: la lista de textos `pending` que Ari debe confirmar (FND-02).
// Determinista: sin fecha ni hora, sin rutas absolutas, no lee PUBLIC_ENV ni `.env`, y solo
// escribe la ruta de --out. Nunca modifica el YAML ni cambia un `status`.
// Uso: node scripts/list-pending.mjs [--file <ruta>] [--out <ruta>] [--check]
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { parse } from 'yaml';
import { walkClaims } from './lib/copy-rules.mjs';

export const DEFAULT_REASON = 'Sin motivo indicado';
export const DEFAULT_CONFIRM_BY = 'Ari';

const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? undefined : args[i + 1];
};
const file = opt('--file') ?? 'src/content/landing.es.yaml';
const out = opt('--out') ?? 'PENDING-COPY.md';
const check = args.includes('--check');

// Una celda no puede romper la fila: `|` se escapa y un salto de línea pasa a espacio.
const cell = (value) => String(value).replace(/\r\n|\r|\n/g, ' ').replace(/\|/g, '\\|').trim();

let doc;
try {
  doc = parse(readFileSync(file, 'utf8')); // esquema por defecto, sin etiquetas personalizadas
} catch (err) {
  console.error(`FAIL no se pudo leer o parsear ${file}: ${err.message}`);
  process.exit(1);
}

const pending = walkClaims(doc).filter((n) => n.kind === 'claim' && n.claim.status === 'pending');

const lines = [
  '# Textos pendientes de confirmar',
  '',
  'Este archivo se genera con `npm run pending` desde `src/content/landing.es.yaml`. No se edita a mano.',
  '',
];
if (pending.length === 0) {
  lines.push('No hay textos pendientes.');
} else {
  lines.push('| Clave | Texto actual | Motivo | Quién confirma |', '| --- | --- | --- | --- |');
  for (const { path, claim } of pending) {
    const reason = typeof claim.reason === 'string' && claim.reason.trim() ? claim.reason : DEFAULT_REASON;
    const confirmBy = typeof claim.confirm_by === 'string' && claim.confirm_by.trim() ? claim.confirm_by : DEFAULT_CONFIRM_BY;
    lines.push(`| ${cell(path)} | ${cell(claim.text ?? '')} | ${cell(reason)} | ${cell(confirmBy)} |`);
  }
}
const markdown = `${lines.join('\n')}\n`;

if (check) {
  const current = existsSync(out) ? readFileSync(out, 'utf8') : null;
  if (current === markdown) {
    console.log(`OK ${out} está al día (${pending.length} pendientes)`);
    process.exit(0);
  }
  console.error(
    `FAIL ${out} ${current === null ? 'no existe' : 'está desactualizado'}: ejecuta npm run pending y versiona el resultado`,
  );
  process.exit(1);
}

writeFileSync(out, markdown);
console.log(`Escrito ${out} con ${pending.length} textos pendientes`);

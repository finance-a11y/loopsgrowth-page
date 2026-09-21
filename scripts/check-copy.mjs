// Guarda de copy (COPY-02). Solo lectura: valida `landing.es.yaml` o escanea `dist`, nunca escribe
// ni cambia un `status`. Las violaciones estructurales fallan en cualquier entorno; las de
// contenido solo bloquean con PUBLIC_ENV exactamente `production` y en otro entorno son WARN.
// Uso: node scripts/check-copy.mjs [--file <ruta>] [--root <dir>] [--json] [--dist <dir>]
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { loadEnv } from 'vite';
import { parse } from 'yaml';
import { checkCopy, findMissingMark } from './lib/copy-rules.mjs';

const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? undefined : args[i + 1];
};
const file = opt('--file') ?? 'src/content/landing.es.yaml';
const root = opt('--root') ?? process.cwd();
const distDir = opt('--dist');
const asJson = args.includes('--json');

// Mismo criterio que astro.config.mjs: `.env`, `.env.local` y el proceso. Un `production`
// puesto solo en `.env` también bloquea (T-02-02).
const env = { ...loadEnv('production', root, 'PUBLIC_'), ...process.env };
const production = env.PUBLIC_ENV === 'production';

const DIST_EXTENSIONS = new Set(['.html', '.xml', '.txt', '.json', '.svg', '.css', '.js', '.webmanifest']);

function fatal(message) {
  if (asJson) console.log(JSON.stringify({ production, structural: [{ rule: 'FATAL', path: '', excerpt: message }], content: [] }));
  else console.error(`FAIL ${message}`);
  process.exit(1);
}

function* walkFiles(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walkFiles(full);
    else if (entry.isFile()) yield full;
  }
}

let result;
let mode;
if (distDir !== undefined) {
  mode = 'dist';
  if (!existsSync(distDir) || !statSync(distDir).isDirectory()) {
    fatal(`El directorio de salida "${distDir}" no existe: ejecuta el build antes de escanear dist`);
  }
  const content = [];
  for (const path of walkFiles(distDir)) {
    if (!DIST_EXTENSIONS.has(extname(path).toLowerCase())) continue;
    for (const ex of findMissingMark(readFileSync(path, 'utf8'))) {
      content.push({ rule: 'MISSING', file: path, excerpt: ex });
    }
  }
  result = { structural: [], content };
} else {
  mode = 'yaml';
  let text;
  try {
    text = readFileSync(file, 'utf8');
  } catch (err) {
    fatal(`No se pudo leer ${file}: ${err.message}`);
  }
  let doc;
  try {
    doc = parse(text); // esquema por defecto, sin etiquetas personalizadas (T-02-04)
  } catch (err) {
    fatal(`YAML inválido en ${file}: ${err.message}`);
  }
  result = checkCopy(doc);
}

const { structural, content } = result;
const blocking = structural.length > 0 || (production && content.length > 0);

if (asJson) {
  console.log(
    JSON.stringify(
      {
        mode,
        production,
        verified: result.verified ?? null,
        pending: result.pending ?? null,
        structural,
        content,
      },
      null,
      2,
    ),
  );
} else {
  const where = (v) => v.path ?? v.file ?? '';
  for (const v of structural) console.error(`FAIL [${v.rule}] ${where(v)}: ${v.excerpt}`);
  for (const v of content) {
    const line = `[${v.rule}] ${where(v)}: ${v.excerpt}`;
    if (production) console.error(`FAIL ${line}`);
    else console.log(`WARN ${line}`);
  }
  const scope = mode === 'dist' ? `dist "${distDir}"` : file;
  const counts = mode === 'yaml' ? `: ${result.verified} verified, ${result.pending} pending` : '';
  const env_ = production ? 'producción (bloquea)' : 'no productivo (solo advierte)';
  console.log(
    `check-copy ${blocking ? 'FALLA' : 'OK'} en ${scope}${counts}; ` +
      `${structural.length} estructurales, ${content.length} de contenido; entorno ${env_}`,
  );
}

process.exit(blocking ? 1 : 0);

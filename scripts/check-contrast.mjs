// Guarda de contraste (FND-03). Lee tokens.css y falla con código 1 si algún par baja de su umbral.
// Uso: node scripts/check-contrast.mjs [--tokens <ruta>] [--json]
import { readFileSync } from 'node:fs';
import {
  APPROVED_PAIRS,
  FORBIDDEN_PAIRS,
  REQUIRED_TONES,
  TONE_PAIRS,
  contrastRaw,
  contrastRatio,
  parseTokens,
} from './lib/contrast.mjs';

const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? undefined : args[i + 1];
};
const tokensPath = opt('--tokens') ?? 'src/styles/tokens.css';
const asJson = args.includes('--json');

const TOLERANCE = 0.01 + 1e-9;
const short = (token) => token.replace('--color-brand-', '');
const tag = (hex) => hex.toLowerCase();

let css;
try {
  css = readFileSync(tokensPath, 'utf8');
} catch (err) {
  console.error(`FAIL: no se pudo leer ${tokensPath}: ${err.message}`);
  process.exit(1);
}

const { theme, tones, problems } = parseTokens(css);
const results = [];

// (0) La guarda no puede aprobar en silencio lo que no entiende: cada tono obligatorio debe
// existir y todo selector o bloque de tono que no se pudo interpretar cuenta como fallo.
for (const required of REQUIRED_TONES) {
  if (!tones[required]) {
    results.push({
      kind: 'tone', pair: `tono ${required}`, ok: false, ratio: null, threshold: 0,
      detail: 'el tono no se encontró en tokens.css',
    });
  }
}
for (const problem of problems) {
  results.push({ kind: 'tone', pair: 'formato de tokens.css', ok: false, ratio: null, threshold: 0, detail: problem });
}

const hexOf = (token) => theme[token];
const isHex = (value) => typeof value === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value);

// (1) Pares aprobados con los hex leídos de los tokens.
for (const pair of APPROVED_PAIRS) {
  const label = `${short(pair.fg)} sobre ${short(pair.bg)}`;
  const fg = hexOf(pair.fg);
  const bg = hexOf(pair.bg);
  if (!isHex(fg) || !isHex(bg)) {
    results.push({
      kind: 'approved', pair: label, ok: false, ratio: null, threshold: pair.min, expected: pair.ratio,
      detail: `falta o no es un hex el token ${!isHex(fg) ? pair.fg : pair.bg}`,
    });
    continue;
  }
  // El umbral se compara con el valor exacto; el redondeado es solo para mostrar y para
  // contrastarlo con el ratio medido de UI-SPEC.
  const raw = contrastRaw(fg, bg);
  const ratio = contrastRatio(fg, bg);
  const meetsThreshold = raw >= pair.min;
  const matchesMeasured = Math.abs(ratio - pair.ratio) <= TOLERANCE;
  let detail = '';
  if (!meetsThreshold) detail = `bajo el umbral ${pair.min} (real ${raw.toFixed(4)})`;
  else if (!matchesMeasured) detail = `se esperaba ${pair.ratio.toFixed(2)} y un token cambió`;
  results.push({
    kind: 'approved', pair: label, fg: tag(fg), bg: tag(bg), ok: meetsThreshold && matchesMeasured,
    ratio, threshold: pair.min, expected: pair.ratio, detail,
  });
}

// (2) Pares semánticos de cada tono. Un par prohibido declarado en un tono falla aquí.
const forbiddenKeys = new Map(
  FORBIDDEN_PAIRS.map((p) => [`${tag(hexOf(p.fg) ?? '')}|${tag(hexOf(p.bg) ?? '')}`, p]),
);
for (const [tone, vars] of Object.entries(tones)) {
  for (const [fgVar, bgVar, min, use] of TONE_PAIRS) {
    const label = `tono ${tone}: ${fgVar} sobre ${bgVar}`;
    const fg = vars[fgVar];
    const bg = vars[bgVar];
    if (!isHex(fg) || !isHex(bg)) {
      results.push({
        kind: 'tone', pair: label, ok: false, ratio: null, threshold: min,
        detail: `${!isHex(fg) ? fgVar : bgVar} no se resuelve a un hex (${use})`,
      });
      continue;
    }
    const raw = contrastRaw(fg, bg);
    const ratio = contrastRatio(fg, bg);
    const banned = forbiddenKeys.get(`${tag(fg)}|${tag(bg)}`);
    const ok = raw >= min && !banned;
    let detail = '';
    if (banned) detail = `par prohibido (${banned.why})`;
    else if (!ok) detail = `bajo el umbral ${min} (real ${raw.toFixed(4)}; ${use})`;
    results.push({
      kind: 'tone', pair: label, fg: tag(fg), bg: tag(bg), ok, ratio, threshold: min, detail,
    });
  }
}

// (3) Autoverificación: los 6 pares prohibidos deben medirse por debajo de su umbral.
for (const pair of FORBIDDEN_PAIRS) {
  const label = `${short(pair.fg)} sobre ${short(pair.bg)}`;
  const fg = hexOf(pair.fg);
  const bg = hexOf(pair.bg);
  if (!isHex(fg) || !isHex(bg)) {
    results.push({
      kind: 'forbidden', pair: label, ok: false, ratio: null, threshold: pair.min,
      detail: `falta o no es un hex el token ${!isHex(fg) ? pair.fg : pair.bg}`,
    });
    continue;
  }
  const raw = contrastRaw(fg, bg);
  const ratio = contrastRatio(fg, bg);
  const below = raw < pair.min;
  results.push({
    kind: 'forbidden', pair: label, fg: tag(fg), bg: tag(bg), ok: below, ratio,
    threshold: pair.min, expected: pair.ratio,
    detail: below ? '' : `la calculadora lo mide sobre el umbral ${pair.min}: no puede ser un par prohibido`,
  });
}

const failed = results.filter((r) => !r.ok);

if (asJson) {
  console.log(JSON.stringify(results, null, 2));
} else {
  for (const r of results) {
    const ratio = r.ratio === null ? 'n/a' : r.ratio.toFixed(2);
    const line = `[${r.kind}] ${r.pair} = ${ratio} (umbral ${r.threshold})${r.detail ? `: ${r.detail}` : ''}`;
    if (r.ok) console.log(`PASS ${line}`);
    else console.error(`FAIL ${line}`);
  }
  const approved = results.filter((r) => r.kind === 'approved' && r.ok).length;
  console.log(
    failed.length === 0
      ? `check-contrast: OK (${approved}/${APPROVED_PAIRS.length} pares aprobados, ${FORBIDDEN_PAIRS.length} prohibidos verificados)`
      : `check-contrast: ${failed.length} par(es) fallan`,
  );
}

process.exit(failed.length === 0 ? 0 : 1);

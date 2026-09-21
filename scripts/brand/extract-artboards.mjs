#!/usr/bin/env node
/**
 * Extrae las mesas oficiales del logo de Loops Growth del `.ai` de Ari como SVG limpios
 * en `src/assets/brand` (plan 02-09). Solo corre a mano al autorar, cuando Ari entrega un `.ai`
 * nuevo; el sitio no depende de este script en tiempo de build.
 *
 * Uso:
 *   node scripts/brand/extract-artboards.mjs --source <ruta al .ai> [--only 6,13] [--out <dir>] [--keep-paths]
 *   node scripts/brand/extract-artboards.mjs --favicon-evidence
 *   node scripts/brand/extract-artboards.mjs --favicon [archivo del catalogo, por defecto ojo-18-blanco]
 *
 * `--favicon-evidence` y `--favicon` no leen el `.ai`: parten de los SVG ya extraidos en
 * `src/assets/brand`. La evidencia renderiza la mesa 13 y la 18 a 16 y 32 px con 4 % de margen por
 * lado, mide la caja de pixeles opacos y el diametro equivalente de la pupila (#1e1e1e) y aplica la
 * regla de decision del plan. `--favicon` escribe `public/favicon.svg` (mismos trazos, viewBox
 * cuadrado) y `public/favicon.ico` (PNG de 16, 32 y 48 px empaquetados a mano, sin dependencias).
 *
 * `--keep-paths` (plan 02-10) usa `scripts/brand/svgo-keep-paths.config.cjs`: SVGO sin unir rutas, una ruta
 * por elemento del arte. Se usa para las fuentes de Loopy en `src/assets/loopy` (mesas 13, 14, 18 y 19).
 *
 * Requisitos (no se instala nada aquí):
 *   - poppler: `pdftocairo` en el PATH (`brew install poppler`).
 *   - SVGO: el binario de `node_modules/.bin/svgo` (ya viene con las dependencias del repo).
 *   - Chromium de `@playwright/test`, para medir la caja real del dibujo con `getBBox()`.
 *
 * El `.ai` es un PDF de 32 mesas de 800 x 800 y NO se versiona (`.gitignore` cubre `*.ai`). Ari lo
 * comparte en Google Drive; se baja una vez a una carpeta fuera del repositorio:
 *   curl -sL 'https://drive.google.com/uc?export=download&id=<id>' -o /ruta/fuera/del/repo/logo.ai
 * y `file /ruta/fuera/del/repo/logo.ai` debe decir "PDF document". Registra en el SUMMARY el id de
 * Drive y `shasum -a 256` del archivo usado, nunca el archivo.
 *
 * Pasos por mesa: `pdftocairo -svg -f N -l N`; `cleanArtboard` (sin fondo, sin dimensiones,
 * rellenos oficiales en hex; falla si un color queda fuera de la paleta); SVGO; medida de la caja
 * en Chromium y sustitución del `viewBox` por esa caja, sin holgura (el área de salvado del logo es
 * CSS, no arte). Todas las llamadas a procesos usan `spawnSync` con lista de argumentos, sin shell.
 * Sale con 1 si un color queda fuera de la paleta, si queda algún `<rect>` o si la caja se sale
 * de 0 a 800.
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { buildFaviconSvg, cleanArtboard, packIco, readViewBox, FAVICON_MARGIN } from '../lib/brand-svg.mjs';
import { ARTBOARDS } from '../../src/components/brand/logo-variants.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const SVGO = join(ROOT, 'node_modules/.bin/svgo');

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

/** @param {string} cmd @param {string[]} args */
function run(cmd, args) {
  const result = spawnSync(cmd, args, { encoding: 'utf8' });
  if (result.error) fail(`no se pudo ejecutar ${cmd}: ${result.error.message}`);
  if (result.status !== 0) fail(`${cmd} ${args.join(' ')} terminó con ${result.status}: ${result.stderr}`);
  return result.stdout;
}

function parseArgs(argv) {
  const opts = { source: '', only: null, out: join(ROOT, 'src/assets/brand'), favicon: '', evidence: false, keepPaths: false };
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i];
    if (flag === '--favicon') opts.favicon = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : 'ojo-18-blanco';
    else if (flag === '--favicon-evidence') opts.evidence = true;
    else if (flag === '--keep-paths') opts.keepPaths = true;
    else if (flag === '--source') opts.source = argv[++i] ?? '';
    else if (flag === '--only') opts.only = (argv[++i] ?? '').split(',').map((n) => Number(n.trim())).filter(Boolean);
    else if (flag === '--out') opts.out = resolve(argv[++i] ?? '');
    else fail(`opción desconocida: ${flag}`);
  }
  if (!opts.source && !opts.favicon && !opts.evidence) fail('falta --source <ruta al .ai>');
  return opts;
}

const round2 = (v) => Number(v.toFixed(2));

/** Sustituye el viewBox por la caja medida, redondeada hacia afuera a dos decimales. */
function withMeasuredViewBox(svg, box) {
  const x = round2(Math.floor(box.x * 100) / 100);
  const y = round2(Math.floor(box.y * 100) / 100);
  const right = round2(Math.ceil((box.x + box.width) * 100) / 100);
  const bottom = round2(Math.ceil((box.y + box.height) * 100) / 100);
  if (x < 0 || y < 0 || right > 800 || bottom > 800) {
    fail(`la caja ${x} ${y} ${right} ${bottom} se sale de 0 a 800`);
  }
  const viewBox = `${x} ${y} ${round2(right - x)} ${round2(bottom - y)}`;
  return { viewBox, svg: svg.replace(/viewBox="[^"]*"/, `viewBox="${viewBox}"`) };
}


const BRAND_DIR = join(ROOT, 'src/assets/brand');
const PUBLIC_DIR = join(ROOT, 'public');
const FAVICON_SIZES = [16, 32, 48];
const EVIDENCE_BOARDS = [
  { mesa: 13, file: 'isotipo-13-blanco' },
  { mesa: 18, file: 'ojo-18-blanco' },
];
/** Regla del plan: alto de la marca de 12 px o mas y pupila de 3 px o mas, a 16 px. */
const MIN_MARK_PX = 12;
const MIN_PUPIL_PX = 3;

/** Dibuja `svg` en un lienzo de `size` px con el margen de 4 % por lado y mide el resultado. */
async function measureAtSize(page, svg, size) {
  const { w, h } = readViewBox(svg);
  return page.evaluate(
    async ({ svg, size, w, h, margin }) => {
      const inner = size * (1 - 2 * margin);
      const scale = inner / Math.max(w, h);
      const dw = w * scale;
      const dh = h * scale;
      const sized = svg.replace('<svg ', `<svg width="${dw}" height="${dh}" `);
      const img = new Image();
      await new Promise((ok, ko) => {
        img.onload = ok;
        img.onerror = () => ko(new Error('no se pudo cargar el SVG'));
        img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(sized)}`;
      });
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, (size - dw) / 2, (size - dh) / 2, dw, dh);
      const { data } = ctx.getImageData(0, 0, size, size);
      let minX = size;
      let minY = size;
      let maxX = -1;
      let maxY = -1;
      const dark = new Uint8Array(size * size);
      for (let y = 0; y < size; y += 1) {
        for (let x = 0; x < size; x += 1) {
          const i = (y * size + x) * 4;
          if (data[i + 3] >= 128) {
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
            // Pupila: pixeles casi de #1e1e1e (canal maximo <= 60).
            if (Math.max(data[i], data[i + 1], data[i + 2]) <= 60) dark[y * size + x] = 1;
          }
        }
      }
      // Componentes conexas de pixeles oscuros; la pupila es la mayor.
      const seen = new Uint8Array(size * size);
      let biggest = 0;
      for (let start = 0; start < size * size; start += 1) {
        if (!dark[start] || seen[start]) continue;
        let area = 0;
        const stack = [start];
        seen[start] = 1;
        while (stack.length) {
          const at = stack.pop();
          area += 1;
          const x = at % size;
          const y = Math.floor(at / size);
          for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
            if (nx < 0 || ny < 0 || nx >= size || ny >= size) continue;
            const n = ny * size + nx;
            if (dark[n] && !seen[n]) {
              seen[n] = 1;
              stack.push(n);
            }
          }
        }
        biggest = Math.max(biggest, area);
      }
      return {
        width: maxX - minX + 1,
        height: maxY - minY + 1,
        pupil: Number((2 * Math.sqrt(biggest / Math.PI)).toFixed(1)),
      };
    },
    { svg, size, w, h, margin: FAVICON_MARGIN },
  );
}

async function runEvidence() {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.setContent('<!doctype html><body></body>');
    const rows = [];
    for (const { mesa, file } of EVIDENCE_BOARDS) {
      const svg = readFileSync(join(BRAND_DIR, `${file}.svg`), 'utf8');
      for (const size of [16, 32]) {
        const m = await measureAtSize(page, svg, size);
        // Referencia sin antialiasing: la misma medida a 16 veces la resolucion, en px del tamano real.
        const fine = await measureAtSize(page, svg, size * 16);
        rows.push({
          mesa,
          lado_px: size,
          ancho_px: m.width,
          alto_px: m.height,
          pupila_px: m.pupil,
          pupila_vector_px: Number((fine.pupil / 16).toFixed(1)),
        });
      }
    }
    console.table(rows);
    const at16 = (mesa) => rows.find((r) => r.mesa === mesa && r.lado_px === 16);
    const passes = (r) => r.alto_px >= MIN_MARK_PX && r.pupila_px >= MIN_PUPIL_PX;
    const [a, b] = [at16(13), at16(18)];
    let winner;
    if (passes(a) !== passes(b)) winner = passes(a) ? 13 : 18;
    else winner = 18; // ambas o ninguna: gana la de dos ojos por identidad (mesa 18)
    console.log(
      `Regla (a 16 px: alto >= ${MIN_MARK_PX} y pupila >= ${MIN_PUPIL_PX}): mesa 13 ${passes(a) ? 'cumple' : 'no cumple'}, mesa 18 ${passes(b) ? 'cumple' : 'no cumple'}. Gana la mesa ${winner}.`,
    );
  } finally {
    await browser.close();
  }
}

async function runFavicon(name) {
  const sourcePath = join(BRAND_DIR, `${name}.svg`);
  if (!existsSync(sourcePath)) fail(`no existe ${sourcePath}`);
  const svg = buildFaviconSvg(readFileSync(sourcePath, 'utf8'));
  if (Buffer.byteLength(svg) >= 3072) fail(`favicon.svg pesa ${Buffer.byteLength(svg)} bytes (limite 3072)`);
  writeFileSync(join(PUBLIC_DIR, 'favicon.svg'), svg);
  const browser = await chromium.launch();
  try {
    const images = [];
    for (const size of FAVICON_SIZES) {
      const page = await browser.newPage({ viewport: { width: size, height: size } });
      await page.setContent(
        `<!doctype html><body style="margin:0;background:transparent"><img alt="" width="${size}" height="${size}" style="display:block" src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}"></body>`,
      );
      await page.waitForFunction(() => document.images[0].complete && document.images[0].naturalWidth > 0);
      const data = await page.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
      images.push({ size, data });
      await page.close();
    }
    const ico = packIco(images);
    writeFileSync(join(PUBLIC_DIR, 'favicon.ico'), ico);
    console.table([
      { archivo: 'public/favicon.svg', bytes: Buffer.byteLength(svg) },
      { archivo: 'public/favicon.ico', bytes: ico.length },
      ...images.map((i) => ({ archivo: `  png ${i.size} px`, bytes: i.data.length })),
    ]);
  } finally {
    await browser.close();
  }
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.evidence || opts.favicon) {
    if (opts.evidence) await runEvidence();
    if (opts.favicon) await runFavicon(opts.favicon);
    return;
  }
  if (!existsSync(opts.source)) fail(`no existe ${opts.source}`);
  if (!existsSync(SVGO)) fail('falta node_modules/.bin/svgo (ejecuta npm install)');
  if (!/PDF document/.test(run('file', [opts.source]))) fail(`${opts.source} no es un PDF según \`file\``);

  const boards = ARTBOARDS.filter((b) => b.use && (!opts.only || opts.only.includes(b.n)));
  if (boards.length === 0) fail('ninguna mesa seleccionada');
  mkdirSync(opts.out, { recursive: true });

  const work = mkdtempSync(join(tmpdir(), 'brand-extract-'));
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const rows = [];
  try {
    for (const board of boards) {
      const raw = join(work, `${board.n}.svg`);
      const clean = join(work, `${board.n}-clean.svg`);
      const min = join(work, `${board.n}-min.svg`);
      run('pdftocairo', ['-svg', '-f', String(board.n), '-l', String(board.n), opts.source, raw]);
      writeFileSync(clean, cleanArtboard(readFileSync(raw, 'utf8'), board.n));
      run(
        SVGO,
        opts.keepPaths
          ? ['-i', clean, '-o', min, '--config', join(ROOT, 'scripts/brand/svgo-keep-paths.config.cjs'), '-q']
          : ['-i', clean, '-o', min, '-p', '2', '--multipass', '-q'],
      );
      const optimized = readFileSync(min, 'utf8');
      if (/<rect\b/.test(optimized)) fail(`mesa ${board.n}: quedó un <rect> tras la limpieza`);
      await page.setContent(`<!doctype html><body style="margin:0">${optimized}</body>`);
      const box = await page.evaluate(() => {
        const { x, y, width, height } = document.querySelector('svg').getBBox();
        return { x, y, width, height };
      });
      const { viewBox, svg } = withMeasuredViewBox(optimized, box);
      const target = join(opts.out, `${board.file}.svg`);
      writeFileSync(target, svg);
      rows.push({ mesa: board.n, archivo: `${board.file}.svg`, bytes: Buffer.byteLength(svg), rutas: (svg.match(/<path\b/g) ?? []).length, viewBox });
    }
  } finally {
    await browser.close();
    rmSync(work, { recursive: true, force: true });
  }
  console.table(rows);
}

main().catch((error) => fail(error.message));

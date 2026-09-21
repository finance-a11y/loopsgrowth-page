// Tratamiento reproducible de las fotos del collage (plan 02-11): del original con licencia a un PNG de
// media tinta binaria (paleta de 2 colores, sin metadatos) en la tinta oscura del token.
//
// Requisitos: `sharp` (dependencia opcional de astro, ya instalada; no se agrega a package.json), el
// original en photo-sources/<id>.<ext> (ignorado por git) y su fila en src/assets/photos/LICENSES.md.
// Uso: node scripts/photos/treat.mjs --id hero-a [--source ruta] [--preview directorio] [--dry]
//   --preview  escribe además una vista opaca sobre el papel de la ranura (solo fuera del repo)
//   --dry      calcula y valida sin escribir el PNG del repo
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { halftoneAlpha, inkCoverage } from './halftone.mjs';
import { parseLicenses, sha256File } from '../lib/photo-licenses.mjs';
import { parseTokens, hexToRgb } from '../lib/contrast.mjs';
import { photoById } from '../../src/components/collage/photos.mjs';
import { SCENES } from '../../src/components/collage/scenes.mjs';

const args = process.argv.slice(2);
const opt = (name) => (args.includes(`--${name}`) ? args[args.indexOf(`--${name}`) + 1] : undefined);
const fail = (message) => {
  console.error(`treat: ${message}`);
  process.exit(1);
};

const id = opt('id');
if (!id) fail('falta --id <id> (por ejemplo hero-a).');
const photo = photoById(id);
if (!photo) fail(`"${id}" no está en el manifiesto (src/components/collage/photos.mjs).`);
const row = parseLicenses(readFileSync('src/assets/photos/LICENSES.md', 'utf8')).find((r) => r.id === id);
if (!row) fail(`"${id}" no tiene fila en src/assets/photos/LICENSES.md: no se procesa una foto sin licencia registrada.`);

const source =
  opt('source') ?? ['jpg', 'jpeg', 'png', 'webp'].map((e) => `photo-sources/${id}.${e}`).find((p) => existsSync(p));
if (!source || !existsSync(source)) fail(`no encuentro el original de "${id}" en photo-sources/.`);
if (sha256File(source) !== row.sha256) fail(`el sha256 de ${source} no coincide con el registrado en LICENSES.md.`);

const { params } = photo;
const image = sharp(source, { limitInputPixels: 100_000_000 }).rotate();
const meta = await sharp(await image.clone().toBuffer()).metadata();
if (`${meta.width}x${meta.height}` !== row.dimensions) fail(`las dimensiones ${meta.width}x${meta.height} no coinciden con las registradas (${row.dimensions}).`);

const { crop, out, cell, angle, contrast, brightness } = params;
const region = {
  left: Math.round(crop.left * meta.width),
  top: Math.round(crop.top * meta.height),
  width: Math.round(crop.width * meta.width),
  height: Math.round(crop.height * meta.height),
};
if (Math.abs(region.width / region.height / (out.w / out.h) - 1) > 0.01) fail('la proporción del recorte difiere de la de `out` en más del 1 %.');

const { data } = await image
  .clone()
  .extract(region)
  .resize(out.w, out.h, { fit: 'fill' })
  .greyscale()
  .normalise({ lower: 2, upper: 98 })
  .linear(contrast, 128 * (1 - contrast) + brightness)
  .blur(0.35 * cell)
  .raw()
  .toBuffer({ resolveWithObject: true });

const gray = new Uint8Array(out.w * out.h);
for (let i = 0; i < gray.length; i += 1) gray[i] = data[i * (data.length / gray.length)];
const alpha = halftoneAlpha(gray, out.w, out.h, { cell, angle });
const coverage = inkCoverage(alpha);

const tokens = parseTokens(readFileSync('src/styles/tokens.css', 'utf8'));
const ink = hexToRgb(tokens.theme['--color-brand-dark']);
const rgba = Buffer.alloc(out.w * out.h * 4);
for (let i = 0; i < alpha.length; i += 1) {
  rgba[i * 4] = ink[0];
  rgba[i * 4 + 1] = ink[1];
  rgba[i * 4 + 2] = ink[2];
  rgba[i * 4 + 3] = alpha[i];
}
const png = await sharp(rgba, { raw: { width: out.w, height: out.h, channels: 4 } })
  .png({ palette: true, colours: 2, effort: 10, compressionLevel: 9 })
  .toBuffer();

const preview = opt('preview');
if (preview) {
  const fill = tokens.theme[`--color-brand-${SCENES[photo.slot].layers.find((l) => l.kind === 'slot').fill}`];
  mkdirSync(preview, { recursive: true });
  await sharp(png).flatten({ background: fill }).png().toFile(resolve(preview, `${id}-preview.png`));
}
if (!args.includes('--dry')) writeFileSync(`src/assets/photos/treated/${id}.png`, png);

console.log(`${id}: ${png.length} bytes, ${out.w}x${out.h}, cobertura de tinta ${coverage.toFixed(3)}`);
if (coverage < 0.12 || coverage > 0.55) fail(`la cobertura ${coverage.toFixed(3)} queda fuera de 0.12 a 0.55: ajusta contrast, brightness o el recorte.`);
if (png.length > 30720) fail(`el PNG pesa ${png.length} bytes (tope 30720).`);

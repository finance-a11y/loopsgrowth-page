// Tratamiento reproducible de las fotos del equipo (quick 260920-team-photos): del original AVIF a un PNG
// cuadrado en duotono de marca (tinta oscura en las sombras, color del disco en las luces).
//
// Requisitos: `sharp` (dependencia opcional de astro, ya instalada; no se agrega a package.json), el
// original en photo-sources/team/<id>.avif (ignorado por git) y su fila en src/assets/team/PROVENANCE.md.
// Uso: node scripts/photos/treat-team.mjs --id juan [--source ruta] [--preview directorio] [--dry]
//   --preview  escribe además una vista circular sobre blanco a 128 px y a 240 px (solo fuera del repo)
//   --dry      calcula y valida sin escribir el PNG del repo
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { parseTeamProvenance, sha256File } from '../lib/photo-licenses.mjs';
import { parseTokens, hexToRgb } from '../lib/contrast.mjs';
import { TEAM_PHOTOS, TEAM_PHOTO_OUT, TEAM_PNG_MAX } from '../../src/components/sections/team-photos.mjs';

const args = process.argv.slice(2);
const opt = (name) => (args.includes(`--${name}`) ? args[args.indexOf(`--${name}`) + 1] : undefined);
const fail = (message) => {
  console.error(`treat-team: ${message}`);
  process.exit(1);
};

const id = opt('id');
if (!id) fail('falta --id <id> (por ejemplo juan).');
const photo = TEAM_PHOTOS.find((p) => p.id === id);
if (!photo) fail(`"${id}" no está en el manifiesto (src/components/sections/team-photos.mjs).`);
const row = parseTeamProvenance(readFileSync('src/assets/team/PROVENANCE.md', 'utf8')).find((r) => r.id === id);
if (!row) fail(`"${id}" no tiene fila en src/assets/team/PROVENANCE.md: no se procesa una foto sin procedencia registrada.`);

const source = opt('source') ?? `photo-sources/team/${id}.avif`;
if (!existsSync(source)) fail(`no encuentro el original de "${id}" en ${source}.`);
if (sha256File(source) !== row.sha256) fail(`el sha256 de ${source} no coincide con el registrado en PROVENANCE.md.`);

const base = sharp(source, { limitInputPixels: 100_000_000 }).rotate();
const meta = await sharp(await base.clone().toBuffer()).metadata();
if (`${meta.width}x${meta.height}` !== row.dimensions) fail(`las dimensiones ${meta.width}x${meta.height} no coinciden con las registradas (${row.dimensions}).`);

const { crop, disc, gamma } = photo;
if (crop.left < 0 || crop.top < 0 || crop.left + crop.size > meta.width || crop.top + crop.size > meta.height) fail('el recorte se sale de la imagen.');

const tokens = parseTokens(readFileSync('src/styles/tokens.css', 'utf8'));
const dark = hexToRgb(tokens.theme['--color-brand-dark']);
const light = hexToRgb(tokens.theme[`--color-brand-${disc}`]);
if (!light) fail(`el color "${disc}" no existe en tokens.css.`);

// Escala de grises con el contraste estirado y un gamma por foto (abajo): las luces llegan al color del disco (el fondo
// blanco del original desaparece en el disco) y los rasgos de la cara conservan contraste local.
const { data } = await base
  .clone()
  .extract({ left: crop.left, top: crop.top, width: crop.size, height: crop.size })
  .resize(TEAM_PHOTO_OUT, TEAM_PHOTO_OUT, { fit: 'fill', kernel: 'lanczos3' })
  .greyscale()
  .normalise({ lower: 1, upper: 99 })
  .raw()
  .toBuffer({ resolveWithObject: true });

const rgb = Buffer.alloc(TEAM_PHOTO_OUT * TEAM_PHOTO_OUT * 3);
for (let i = 0; i < TEAM_PHOTO_OUT * TEAM_PHOTO_OUT; i += 1) {
  const t = (data[i] / 255) ** gamma;
  for (let c = 0; c < 3; c += 1) rgb[i * 3 + c] = Math.round(dark[c] + (light[c] - dark[c]) * t);
}
const png = await sharp(rgb, { raw: { width: TEAM_PHOTO_OUT, height: TEAM_PHOTO_OUT, channels: 3 } })
  .png({ palette: true, colours: 16, dither: 0.5, effort: 10, compressionLevel: 9 })
  .toBuffer();

const preview = opt('preview');
if (preview) {
  mkdirSync(preview, { recursive: true });
  const disk = (px) =>
    sharp(png)
      .resize(px, px)
      .composite([{ input: Buffer.from(`<svg width="${px}" height="${px}"><circle cx="${px / 2}" cy="${px / 2}" r="${px / 2}"/></svg>`), blend: 'dest-in' }])
      .flatten({ background: '#ffffff' })
      .png();
  await disk(128).toFile(resolve(preview, `${id}-128.png`));
  await disk(240).toFile(resolve(preview, `${id}-240.png`));
}
if (!args.includes('--dry')) {
  mkdirSync('src/assets/team/treated', { recursive: true });
  writeFileSync(`src/assets/team/treated/${id}.png`, png);
}

console.log(`${id}: ${png.length} bytes, ${TEAM_PHOTO_OUT}x${TEAM_PHOTO_OUT}, duotono #212121 a ${disc}`);
if (png.length > TEAM_PNG_MAX) fail(`el PNG pesa ${png.length} bytes (tope ${TEAM_PNG_MAX}).`);

// Puerta de producción de las fotos (plan 02-11), corre en prebuild. Con PUBLIC_ENV=production bloquea
// mientras una foto elegida tenga la aprobación de Ari pendiente, exista un raster de una candidata
// no elegida o la elección siga abierta; en otros entornos solo advierte. Bloquean siempre (en cualquier
// entorno) el registro o el manifiesto incoherentes: no hay exactamente una elegida por ranura, una elegida
// sin fila, sin derivado o con aprobación de fecha inválida, `Elección: cerrada` con candidatas o pendientes,
// y un sha256 registrado que no coincide con el original que exista en photo-sources/ (ignorado por git:
// en CI y en el hosting no está y esa comprobación se omite).
// Fotos reales del equipo (quick 260920-team-photos): mismo criterio con su propio registro,
// src/assets/team/PROVENANCE.md; con PUBLIC_ENV=production bloquea mientras falte la aprobación de Ari o el
// consentimiento de cada persona, y en cualquier entorno bloquea un registro, manifiesto o sha256 incoherentes.
// Logos de clientes del hero (quick 260920-hero-clients): registro src/assets/clients/PROVENANCE.md; con
// PUBLIC_ENV=production bloquea mientras falte la aprobación de Ari y siempre un registro, manifiesto o sha256 incoherentes.
// Mismo criterio de entorno que scripts/check-copy.mjs (.env y proceso; solo el valor exacto `production`).
// Uso: node scripts/check-photos.mjs
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { loadEnv } from 'vite';
import { clientClosingSteps, closingSteps, evaluateClientLogoGate, evaluatePhotoGate, evaluateTeamPhotoGate, parseElection, parseClientProvenance, parseLicenses, parseTeamProvenance, sha256File, teamClosingSteps, validateClientProvenance, validateLicenses, validateTeamProvenance } from './lib/photo-licenses.mjs';
import { PHOTOS, PHOTO_SLOT_NAMES } from '../src/components/collage/photos.mjs';
import { TEAM_PHOTOS } from '../src/components/sections/team-photos.mjs';
import { CLIENT_LOGOS } from '../src/components/sections/hero-clients.mjs';

const text = readFileSync('src/assets/photos/LICENSES.md', 'utf8');
const rows = parseLicenses(text);
const files = existsSync('src/assets/photos/treated')
  ? readdirSync('src/assets/photos/treated').filter((f) => f.endsWith('.png')).map((f) => f.replace(/\.png$/, ''))
  : [];
// sha256 de los originales que existan en photo-sources/ (id -> hash); el registro guarda el hash del original.
const originals = {};
for (const photo of PHOTOS) {
  const source = ['jpg', 'jpeg', 'png', 'webp'].map((e) => `photo-sources/${photo.id}.${e}`).find((p) => existsSync(p));
  if (source) originals[photo.id] = sha256File(source);
}
const env = { ...loadEnv('production', process.cwd(), 'PUBLIC_'), ...process.env }.PUBLIC_ENV ?? 'development';
const invalid = validateLicenses(rows);
const { errors, warnings } = evaluatePhotoGate({
  rows,
  photos: PHOTOS,
  files,
  env,
  slots: PHOTO_SLOT_NAMES,
  election: parseElection(text),
  originals,
});
// Fotos del equipo: registro aparte, originales en photo-sources/team/<id>.avif.
const teamText = readFileSync('src/assets/team/PROVENANCE.md', 'utf8');
const teamRows = parseTeamProvenance(teamText);
const teamFiles = existsSync('src/assets/team/treated')
  ? readdirSync('src/assets/team/treated').filter((f) => f.endsWith('.png')).map((f) => f.replace(/\.png$/, ''))
  : [];
const teamOriginals = {};
for (const photo of TEAM_PHOTOS) {
  const source = `photo-sources/team/${photo.id}.avif`;
  if (existsSync(source)) teamOriginals[photo.id] = sha256File(source);
}
const teamInvalid = validateTeamProvenance(teamRows);
const team = evaluateTeamPhotoGate({ rows: teamRows, photos: TEAM_PHOTOS, files: teamFiles, env, originals: teamOriginals });
// Logos de clientes: el archivo del repositorio es el original, se comprueba su sha256 real.
const clientText = readFileSync('src/assets/clients/PROVENANCE.md', 'utf8');
const clientRows = parseClientProvenance(clientText);
const clientFiles = readdirSync('src/assets/clients').filter((f) => f.endsWith('.webp')).map((f) => f.replace(/\.webp$/, ''));
const clientHashes = Object.fromEntries(clientFiles.map((id) => [id, sha256File(`src/assets/clients/${id}.webp`)]));
const clientInvalid = validateClientProvenance(clientRows);
const clients = evaluateClientLogoGate({ rows: clientRows, logos: CLIENT_LOGOS, files: clientFiles, env, hashes: clientHashes });

for (const w of [...warnings, ...team.warnings, ...clients.warnings]) console.warn(`WARN check-photos: ${w}`);
for (const e of new Set([...invalid, ...errors])) console.error(`FAIL check-photos: ${e}`);
for (const e of new Set([...teamInvalid, ...team.errors])) console.error(`FAIL check-photos (equipo): ${e}`);
for (const e of new Set([...clientInvalid, ...clients.errors])) console.error(`FAIL check-photos (clientes): ${e}`);
const clientBlocked = clientInvalid.length > 0 || clients.errors.length > 0;
const teamBlocked = teamInvalid.length > 0 || team.errors.length > 0;
const blocked = invalid.length > 0 || errors.length > 0;
if (blocked) console.error(`\nCómo cerrar la elección (src/assets/photos/LICENSES.md):\n${closingSteps(text)}`);
if (teamBlocked) console.error(`\nCómo cerrar la aprobación de las fotos del equipo (src/assets/team/PROVENANCE.md):\n${teamClosingSteps(teamText)}`);
if (clientBlocked) console.error(`\nCómo cerrar la aprobación de los logos de clientes (src/assets/clients/PROVENANCE.md):\n${clientClosingSteps(clientText)}`);
if (blocked || teamBlocked || clientBlocked) process.exit(1);
const pendingCount = warnings.length + team.warnings.length + clients.warnings.length;
console.log(`check-photos: ${PHOTOS.filter((p) => p.chosen).length} foto(s) elegida(s), ${TEAM_PHOTOS.length} del equipo y ${CLIENT_LOGOS.length} logos de clientes, entorno ${env}${pendingCount ? ` (${pendingCount} aviso(s), bloquearían en production)` : ''}; sha256 de ${Object.keys(originals).length} de ${PHOTOS.length} original(es) y ${Object.keys(teamOriginals).length} de ${TEAM_PHOTOS.length} del equipo comprobado(s) en photo-sources/.`);

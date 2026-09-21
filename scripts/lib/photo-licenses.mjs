// Registro de licencias de las fotos (plan 02-11): lectura y validación de
// src/assets/photos/LICENSES.md y puerta de producción. Sin dependencias.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

/** Nombre de la licencia y su URL canónica. */
export const LICENSE_NAMES = Object.freeze({
  'Unsplash License': 'https://unsplash.com/license',
  'Pexels License': 'https://www.pexels.com/license/',
  'Pixabay Content License': 'https://pixabay.com/service/license-summary/',
});

const COLUMNS = ['id', 'derived', 'source', 'author', 'license', 'licenseUrl', 'downloaded', 'dimensions', 'sha256', 'approval', 'note'];
const DASH = /[\u2013\u2014]/;

const section = (text, heading) => {
  const m = new RegExp(`^## ${heading}\\s*$`, 'm').exec(text);
  if (!m) return '';
  const rest = text.slice(m.index + m[0].length);
  const next = /^## /m.exec(rest);
  return next ? rest.slice(0, next.index) : rest;
};

/** Filas de la tabla "Registro" (11 columnas). */
export function parseLicenses(text) {
  return section(text, 'Registro')
    .split('\n')
    .filter((line) => line.trim().startsWith('|'))
    .map((line) => line.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim()))
    .filter((cells) => cells.length === COLUMNS.length && !/^-+$/.test(cells[0].replace(/[:\s]/g, '')) && cells[0] !== 'id')
    .map((cells) => {
      const row = Object.fromEntries(COLUMNS.map((c, i) => [c, cells[i]]));
      row.id = row.id.replace(/`/g, '');
      row.derived = row.derived.replace(/`/g, '');
      return row;
    });
}

/** Fecha AAAA-MM-DD que existe en el calendario (rechaza 2026-02-31 y 2026-13-01, que `Date.parse` deja pasar). */
export function isCalendarDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? '');
  if (!m) return false;
  const [y, mo, d] = m.slice(1).map(Number);
  if (y < 2020) return false;
  const date = new Date(Date.UTC(y, mo - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === mo - 1 && date.getUTCDate() === d;
}

/** `{ pending: true }`, `{ pending: false, approver, date }` o nulo si el texto no es ninguna de las dos formas. */
export function parseApproval(text) {
  if (text === 'pendiente') return { pending: true };
  const m = /^aprobada por (\S.*?) el (\d{4}-\d{2}-\d{2})$/.exec(text ?? '');
  return m ? { pending: false, approver: m[1], date: m[2] } : null;
}

/** Motivo por el que la aprobación de una fila no vale, o nulo. La usan `validateLicenses` y la puerta. */
export function approvalProblem(row) {
  const approval = parseApproval(row.approval);
  if (!approval) return 'debe ser "pendiente" o "aprobada por <nombre> el AAAA-MM-DD"';
  if (approval.pending) return null;
  if (!isCalendarDate(approval.date)) return `la fecha ${approval.date} no existe en el calendario`;
  if (isCalendarDate(row.downloaded) && approval.date < row.downloaded) {
    return `la aprobación (${approval.date}) no puede ser anterior a la descarga (${row.downloaded})`;
  }
  return null;
}

/** Errores en español, uno por campo mal formado; lista vacía si todo está bien. */
export function validateLicenses(rows) {
  const errors = [];
  for (const row of rows) {
    const bad = (field, why) => errors.push(`Foto "${row.id}", campo "${field}": ${why}.`);
    if (!/^https:\/\/\S+$/.test(row.source ?? '')) bad('source', 'la URL de la fuente debe ser https');
    if (!(row.author ?? '').trim()) bad('author', 'el autor no puede estar vacío');
    if (!(row.license in LICENSE_NAMES)) bad('license', `debe ser una de: ${Object.keys(LICENSE_NAMES).join(', ')}`);
    else if (row.licenseUrl !== LICENSE_NAMES[row.license]) bad('licenseUrl', `debe ser la canónica ${LICENSE_NAMES[row.license]}`);
    else if (!row.licenseUrl) bad('licenseUrl', 'falta');
    if (row.license in LICENSE_NAMES === false && row.licenseUrl && !Object.values(LICENSE_NAMES).includes(row.licenseUrl)) bad('licenseUrl', 'no es una URL canónica');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(row.downloaded ?? '')) bad('downloaded', 'debe tener la forma AAAA-MM-DD');
    if (!/^\d+x\d+$/.test(row.dimensions ?? '')) bad('dimensions', 'debe tener la forma ANCHOxALTO');
    if (!/^[0-9a-f]{64}$/.test(row.sha256 ?? '')) bad('sha256', 'debe medir 64 hexadecimales');
    const approval = approvalProblem(row);
    if (approval) bad('approval', approval);
    for (const field of COLUMNS) if (DASH.test(row[field] ?? '')) bad(field, 'no se admiten guiones largos ni cortos');
  }
  return errors;
}

/** `abierta` o `cerrada` según la línea `Elección: ...` (nulo si falta). */
export function parseElection(text) {
  return /^Elección:\s*(abierta|cerrada)\s*$/m.exec(text)?.[1] ?? null;
}

/** Subsecciones de "Licencias verificadas": nombre, URL, fecha y cita literal. */
export function parseLicenseSections(text) {
  const body = section(text, 'Licencias verificadas');
  return body
    .split(/^### /m)
    .slice(1)
    .map((chunk) => {
      const [head, ...rest] = chunk.split('\n');
      const lines = rest.join('\n');
      return {
        name: head.trim(),
        url: /^URL:\s*(\S+)/m.exec(lines)?.[1] ?? '',
        date: /^Leída el:\s*(\S+)/m.exec(lines)?.[1] ?? '',
        quote: lines.split('\n').filter((l) => l.startsWith('>')).map((l) => l.replace(/^>\s?/, '')).join(' ').trim(),
      };
    });
}

/** sha256 de un archivo. */
export function sha256File(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

/**
 * Puerta de producción (función pura). Errores que bloquean en TODO entorno (`always`, estado del registro
 * o del manifiesto incoherente) y avisos que solo bloquean con `env === 'production'` (`problems`, lo que
 * falta para cerrar la elección: aprobación pendiente, candidatas sin descartar, elección abierta).
 *
 * Reglas (las mismas que promete tests/guards/photos.test.mjs):
 * - una y solo una foto elegida por ranura (`slots`; por defecto, las ranuras que aparecen en `photos`);
 * - cada foto elegida tiene fila, su derivado `treated/<id>.png` existe (`files`) y coincide con la columna
 *   `derived`, y su aprobación es válida (fecha real y no anterior a la descarga);
 * - con `election` (la línea `Elección:` de LICENSES.md; nulo si falta): `cerrada` exige una sola foto por
 *   ranura en el manifiesto, todas las aprobaciones dadas y ninguna fila huérfana; `abierta` no pasa a producción;
 * - con `originals` (id -> sha256 del original que exista en `photo-sources/`, ignorado por git y ausente en
 *   CI): el sha256 registrado debe coincidir. La columna `sha256` guarda el hash del ORIGINAL, no del PNG derivado.
 */
export function evaluatePhotoGate({ rows, photos, files, env, slots, election, originals }) {
  const always = [];
  const problems = [];
  const chosen = photos.filter((p) => p.chosen);

  for (const slot of slots ?? [...new Set(photos.map((p) => p.slot))]) {
    const count = chosen.filter((p) => p.slot === slot).length;
    if (count !== 1) always.push(`La ranura "${slot}" debe tener exactamente una foto elegida y tiene ${count}.`);
  }

  for (const photo of chosen) {
    const row = rows.find((r) => r.id === photo.id);
    if (!row) {
      always.push(`La foto elegida "${photo.id}" no tiene fila en LICENSES.md.`);
      continue;
    }
    if (row.derived !== `treated/${photo.id}.png`) always.push(`La foto elegida "${photo.id}" declara el derivado "${row.derived}" y debe ser "treated/${photo.id}.png".`);
    if (!files.includes(photo.id)) always.push(`La foto elegida "${photo.id}" no tiene su derivado treated/${photo.id}.png.`);
    const approval = approvalProblem(row);
    if (approval) always.push(`Foto "${row.id}", campo "approval": ${approval}.`);
    else if (row.approval === 'pendiente') problems.push(`La foto elegida "${photo.id}" tiene la aprobación de Ari pendiente.`);
  }

  const chosenIds = new Set(chosen.map((p) => p.id));
  for (const id of files) if (!chosenIds.has(id)) problems.push(`Existe el raster de la candidata "${id}" y no está elegida (Astro lo emitiría en dist).`);

  if (election === null) always.push('Falta la línea "Elección: abierta" o "Elección: cerrada" en LICENSES.md.');
  else if (election === 'abierta') problems.push('La elección sigue abierta ("Elección: abierta" en LICENSES.md).');
  else if (election === 'cerrada') {
    for (const photo of photos.filter((p) => !p.chosen)) always.push(`Elección cerrada, pero el manifiesto conserva la candidata "${photo.id}".`);
    for (const photo of chosen) {
      if (rows.find((r) => r.id === photo.id)?.approval === 'pendiente') always.push(`Elección cerrada, pero la foto "${photo.id}" sigue con la aprobación pendiente.`);
    }
    for (const row of rows) if (!photos.some((p) => p.id === row.id)) always.push(`Elección cerrada, pero la fila "${row.id}" de LICENSES.md no tiene foto en el manifiesto.`);
  }

  for (const row of rows) {
    const hash = originals?.[row.id];
    if (hash !== undefined && hash !== row.sha256) always.push(`Foto "${row.id}", campo "sha256": no coincide con el original de photo-sources/.`);
  }

  return env === 'production' ? { errors: [...always, ...problems], warnings: [] } : { errors: always, warnings: problems };
}

/** Pasos para cerrar la elección, tal como los describe LICENSES.md (sección "Cómo cerrar la elección"). */
export function closingSteps(text) {
  const body = section(text, 'Cómo cerrar la elección').trim();
  return body || 'Consulta la sección "Cómo cerrar la elección" de src/assets/photos/LICENSES.md.';
}

// ---------------------------------------------------------------------------------------------
// Fotos reales del equipo (quick 260920-team-photos). Registro aparte en src/assets/team/PROVENANCE.md:
// no son fotos de stock (sin licencia de Unsplash, Pexels o Pixabay), sino fotos del propio equipo cuya
// aprobación de Ari y consentimiento individual quedan pendientes. Misma política de la puerta anterior:
// pendiente bloquea `PUBLIC_ENV=production` y fuera de producción solo advierte; el registro incoherente
// bloquea siempre.
// ---------------------------------------------------------------------------------------------

const TEAM_COLUMNS = ['id', 'derived', 'source', 'downloaded', 'dimensions', 'sha256', 'authorizedBy', 'approval', 'consent', 'note'];

/** Origen permitido de las fotos del equipo: la API de medios del sitio de Ari. */
export const TEAM_SOURCE_PREFIX = 'https://aprendoclub.com/api/media/file/';

/** Filas de la tabla "Registro" de src/assets/team/PROVENANCE.md (10 columnas). */
export function parseTeamProvenance(text) {
  return section(text, 'Registro')
    .split('\n')
    .filter((line) => line.trim().startsWith('|'))
    .map((line) => line.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim()))
    .filter((cells) => cells.length === TEAM_COLUMNS.length && !/^-+$/.test(cells[0].replace(/[:\s]/g, '')) && cells[0] !== 'id')
    .map((cells) => {
      const row = Object.fromEntries(TEAM_COLUMNS.map((c, i) => [c, cells[i]]));
      row.id = row.id.replace(/`/g, '');
      row.derived = row.derived.replace(/`/g, '');
      return row;
    });
}

/** `{ pending: true }`, `{ pending: false, who, date }` o nulo (forma `dado por <nombre> el AAAA-MM-DD`). */
export function parseConsent(text) {
  if (text === 'pendiente') return { pending: true };
  const m = /^dado por (\S.*?) el (\d{4}-\d{2}-\d{2})$/.exec(text ?? '');
  return m ? { pending: false, who: m[1], date: m[2] } : null;
}

/** Motivo por el que el consentimiento de una fila no vale, o nulo. */
export function consentProblem(row) {
  const consent = parseConsent(row.consent);
  if (!consent) return 'debe ser "pendiente" o "dado por <nombre> el AAAA-MM-DD"';
  if (consent.pending) return null;
  if (!isCalendarDate(consent.date)) return `la fecha ${consent.date} no existe en el calendario`;
  if (isCalendarDate(row.downloaded) && consent.date < row.downloaded) {
    return `el consentimiento (${consent.date}) no puede ser anterior a la descarga (${row.downloaded})`;
  }
  return null;
}

/** Errores en español, uno por campo mal formado; lista vacía si todo está bien. */
export function validateTeamProvenance(rows) {
  const errors = [];
  for (const row of rows) {
    const bad = (field, why) => errors.push(`Foto del equipo "${row.id}", campo "${field}": ${why}.`);
    if (!/^[a-z][a-z0-9-]*$/.test(row.id ?? '')) bad('id', 'debe ser un identificador en minúsculas');
    if (!(row.source ?? '').startsWith(TEAM_SOURCE_PREFIX) || !/^https:\/\/\S+$/.test(row.source)) bad('source', `debe ser una URL https que empiece por ${TEAM_SOURCE_PREFIX}`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(row.downloaded ?? '') || !isCalendarDate(row.downloaded)) bad('downloaded', 'debe ser una fecha AAAA-MM-DD que exista');
    if (!/^\d+x\d+$/.test(row.dimensions ?? '')) bad('dimensions', 'debe tener la forma ANCHOxALTO');
    if (!/^[0-9a-f]{64}$/.test(row.sha256 ?? '')) bad('sha256', 'debe medir 64 hexadecimales');
    if (!(row.authorizedBy ?? '').trim()) bad('authorizedBy', 'debe decir quién autorizó el uso');
    const approval = approvalProblem({ approval: row.approval, downloaded: row.downloaded });
    if (approval) bad('approval', approval);
    const consent = consentProblem(row);
    if (consent) bad('consent', consent);
    for (const field of TEAM_COLUMNS) if (DASH.test(row[field] ?? '')) bad(field, 'no se admiten guiones largos ni cortos');
  }
  return errors;
}

/**
 * Puerta de las fotos del equipo (función pura). `always` bloquea en todo entorno (registro o manifiesto
 * incoherentes, derivado ausente, sha256 distinto del original de photo-sources/team/, raster huérfano);
 * `problems` solo bloquea con `env === 'production'` (aprobación de Ari o consentimiento pendientes).
 * `photos` es el manifiesto (`TEAM_PHOTOS`), `files` los ids de los PNG de `src/assets/team/treated/` y
 * `originals` id -> sha256 de los originales que existan (ignorados por git, ausentes en CI).
 */
export function evaluateTeamPhotoGate({ rows, photos, files, env, originals }) {
  const always = [];
  const problems = [];

  for (const photo of photos) {
    const row = rows.find((r) => r.id === photo.id);
    if (!row) {
      always.push(`La foto del equipo "${photo.id}" no tiene fila en PROVENANCE.md.`);
      continue;
    }
    if (row.derived !== `treated/${photo.id}.png`) always.push(`La foto del equipo "${photo.id}" declara el derivado "${row.derived}" y debe ser "treated/${photo.id}.png".`);
    if (!files.includes(photo.id)) always.push(`La foto del equipo "${photo.id}" no tiene su derivado treated/${photo.id}.png.`);
    if (!approvalProblem({ approval: row.approval, downloaded: row.downloaded }) && row.approval === 'pendiente') problems.push(`La foto del equipo "${photo.id}" tiene la aprobación de Ari pendiente.`);
    if (!consentProblem(row) && row.consent === 'pendiente') problems.push(`La foto del equipo "${photo.id}" tiene el consentimiento de la persona pendiente.`);
  }

  for (const row of rows) if (!photos.some((p) => p.id === row.id)) always.push(`La fila "${row.id}" de PROVENANCE.md no tiene foto en el manifiesto de src/components/sections/team-photos.mjs.`);
  for (const id of files) if (!photos.some((p) => p.id === id)) always.push(`Existe el raster treated/${id}.png y no está en el manifiesto (Astro lo emitiría en dist).`);

  for (const row of rows) {
    const hash = originals?.[row.id];
    if (hash !== undefined && hash !== row.sha256) always.push(`Foto del equipo "${row.id}", campo "sha256": no coincide con el original de photo-sources/team/.`);
  }

  return env === 'production' ? { errors: [...always, ...problems], warnings: [] } : { errors: always, warnings: problems };
}

/** Pasos para cerrar la aprobación, tal como los describe PROVENANCE.md (sección "Cómo cerrar la aprobación"). */
export function teamClosingSteps(text) {
  const body = section(text, 'Cómo cerrar la aprobación').trim();
  return body || 'Consulta la sección "Cómo cerrar la aprobación" de src/assets/team/PROVENANCE.md.';
}

// ---------------------------------------------------------------------------------------------
// Logos de clientes del hero (quick 260920-hero-clients). Registro aparte en src/assets/clients/PROVENANCE.md:
// son marcas registradas de terceros copiadas del sitio de Ari (ariannalupi.com). Misma política de la puerta
// de las fotos: la aprobación de Ari pendiente bloquea `PUBLIC_ENV=production` y fuera de producción solo
// advierte; el registro incoherente bloquea siempre. El archivo del repositorio ES el original, así que su
// sha256 se comprueba siempre (no solo si existe una copia en photo-sources/).
// ---------------------------------------------------------------------------------------------

const CLIENT_COLUMNS = ['id', 'file', 'source', 'downloaded', 'dimensions', 'sha256', 'authorizedBy', 'approval', 'note'];

/** Origen permitido de los logos: los recursos de marcas del sitio de Ari. */
export const CLIENT_SOURCE_PREFIX = 'https://ariannalupi.com/assets/brands/';

/** Filas de la tabla "Registro" de src/assets/clients/PROVENANCE.md (9 columnas). */
export function parseClientProvenance(text) {
  return section(text, 'Registro')
    .split('\n')
    .filter((line) => line.trim().startsWith('|'))
    .map((line) => line.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim()))
    .filter((cells) => cells.length === CLIENT_COLUMNS.length && !/^-+$/.test(cells[0].replace(/[:\s]/g, '')) && cells[0] !== 'id')
    .map((cells) => {
      const row = Object.fromEntries(CLIENT_COLUMNS.map((c, i) => [c, cells[i]]));
      row.id = row.id.replace(/`/g, '');
      row.file = row.file.replace(/`/g, '');
      return row;
    });
}

/** Errores en español, uno por campo mal formado; lista vacía si todo está bien. */
export function validateClientProvenance(rows) {
  const errors = [];
  for (const row of rows) {
    const bad = (field, why) => errors.push(`Logo de cliente "${row.id}", campo "${field}": ${why}.`);
    if (!/^[a-z][a-z0-9-]*$/.test(row.id ?? '')) bad('id', 'debe ser un identificador en minúsculas');
    if (row.file !== `${row.id}.webp`) bad('file', `debe ser "${row.id}.webp"`);
    if (row.source !== `${CLIENT_SOURCE_PREFIX}${row.id}.webp`) bad('source', `debe ser ${CLIENT_SOURCE_PREFIX}${row.id}.webp`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(row.downloaded ?? '') || !isCalendarDate(row.downloaded)) bad('downloaded', 'debe ser una fecha AAAA-MM-DD que exista');
    if (!/^\d+x\d+$/.test(row.dimensions ?? '')) bad('dimensions', 'debe tener la forma ANCHOxALTO');
    if (!/^[0-9a-f]{64}$/.test(row.sha256 ?? '')) bad('sha256', 'debe medir 64 hexadecimales');
    if (!(row.authorizedBy ?? '').trim()) bad('authorizedBy', 'debe decir quién autorizó el uso');
    const approval = approvalProblem({ approval: row.approval, downloaded: row.downloaded });
    if (approval) bad('approval', approval);
    for (const field of CLIENT_COLUMNS) if (DASH.test(row[field] ?? '')) bad(field, 'no se admiten guiones largos ni cortos');
  }
  return errors;
}

/**
 * Puerta de los logos de clientes (función pura). `always` bloquea en todo entorno (registro o manifiesto
 * incoherentes, archivo ausente, sha256 distinto del archivo real, logo huérfano); `problems` solo bloquea con
 * `env === 'production'` (aprobación de Ari pendiente). `logos` es el manifiesto (ids en orden), `files` los ids
 * de los webp de `src/assets/clients/` y `hashes` id -> sha256 del archivo real.
 */
export function evaluateClientLogoGate({ rows, logos, files, env, hashes }) {
  const always = [];
  const problems = [];

  for (const id of logos) {
    const row = rows.find((r) => r.id === id);
    if (!row) {
      always.push(`El logo de cliente "${id}" no tiene fila en PROVENANCE.md.`);
      continue;
    }
    if (!files.includes(id)) always.push(`El logo de cliente "${id}" no tiene su archivo src/assets/clients/${id}.webp.`);
    if (!approvalProblem({ approval: row.approval, downloaded: row.downloaded }) && row.approval === 'pendiente') problems.push(`El logo de cliente "${id}" tiene la aprobación de Ari pendiente.`);
  }

  for (const row of rows) if (!logos.includes(row.id)) always.push(`La fila "${row.id}" de clients/PROVENANCE.md no tiene logo en el manifiesto de src/components/sections/hero-clients.mjs.`);
  for (const id of files) if (!logos.includes(id)) always.push(`Existe el archivo clients/${id}.webp y no está en el manifiesto (Astro lo emitiría en dist).`);

  for (const row of rows) {
    const hash = hashes?.[row.id];
    if (hash !== undefined && hash !== row.sha256) always.push(`Logo de cliente "${row.id}", campo "sha256": no coincide con el archivo de src/assets/clients/.`);
  }

  return env === 'production' ? { errors: [...always, ...problems], warnings: [] } : { errors: always, warnings: problems };
}

/** Pasos para cerrar la aprobación, tal como los describe clients/PROVENANCE.md (sección "Cómo cerrar la aprobación"). */
export function clientClosingSteps(text) {
  const body = section(text, 'Cómo cerrar la aprobación').trim();
  return body || 'Consulta la sección "Cómo cerrar la aprobación" de src/assets/clients/PROVENANCE.md.';
}

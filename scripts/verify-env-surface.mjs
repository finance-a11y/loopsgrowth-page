// Verificación de FND-05: la superficie de entorno (noindex, canonical, sitemap, robots).
// Usa `npx astro build` directo (no `npm run build`) para que siga siendo válida
// aunque el build de npm agregue guardas que bloqueen producción con textos pending.
// Uso: node scripts/verify-env-surface.mjs
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync } from 'node:fs';

const SITE = 'https://loopsgrowth.example';
let failures = 0;

const pass = (msg) => console.log(`PASS: ${msg}`);
const fail = (msg) => {
  failures += 1;
  console.error(`FAIL: ${msg}`);
};
const expect = (cond, msg) => (cond ? pass(msg) : fail(msg));

function build(envOverrides) {
  // Valores explícitos (no `delete`): astro.config.mjs y Vite leen además los archivos de entorno
  // locales, y `process.env` gana sobre ellos. Así un archivo local no cambia el resultado.
  const env = { ...process.env, PUBLIC_ENV: '', PUBLIC_SITE_URL: '', ...envOverrides };
  rmSync('dist', { recursive: true, force: true });
  return spawnSync('npx', ['astro', 'build'], { env, encoding: 'utf8' });
}

const read = (path) => (existsSync(path) ? readFileSync(path, 'utf8') : '');

function checkNonProduction(label, envOverrides) {
  const res = build(envOverrides);
  if (res.status !== 0) {
    fail(`${label}: el build debía pasar y salió con código ${res.status}\n${res.stderr}`);
    return;
  }
  const html = read('dist/index.html');
  const robots = read('dist/robots.txt');
  expect(html.includes('<meta name="robots" content="noindex">'), `${label}: trae noindex`);
  expect(!html.includes('rel="canonical"'), `${label}: sin canonical`);
  expect(!existsSync('dist/sitemap-index.xml'), `${label}: sin sitemap-index.xml`);
  expect(
    robots.includes('Allow: /') && !/Sitemap:/i.test(robots) && !/Disallow/i.test(robots),
    `${label}: robots.txt con Allow, sin Sitemap y sin Disallow`,
  );
}

// (a) sin PUBLIC_ENV
checkNonProduction('(a) sin PUBLIC_ENV', {});

// (b) producción con URL válida
{
  const res = build({ PUBLIC_ENV: 'production', PUBLIC_SITE_URL: SITE });
  if (res.status !== 0) {
    fail(`(b) producción con URL: el build debía pasar y salió con código ${res.status}\n${res.stderr}`);
  } else {
    const html = read('dist/index.html');
    const robots = read('dist/robots.txt');
    expect(!html.includes('noindex'), '(b) producción: sin noindex');
    expect(
      html.includes(`rel="canonical" href="${SITE}/"`),
      `(b) producción: canonical ${SITE}/`,
    );
    expect(existsSync('dist/sitemap-index.xml'), '(b) producción: existe sitemap-index.xml');
    expect(
      robots.includes(`Sitemap: ${SITE}/sitemap-index.xml`),
      '(b) producción: robots.txt apunta a sitemap-index.xml',
    );
  }
}

// (c) producción sin PUBLIC_SITE_URL: el build debe fallar con un mensaje accionable
{
  const res = build({ PUBLIC_ENV: 'production', PUBLIC_SITE_URL: '' });
  const output = `${res.stdout}${res.stderr}`;
  expect(res.status !== 0, '(c) producción sin PUBLIC_SITE_URL: el build falla');
  expect(
    output.includes('PUBLIC_ENV=production requiere PUBLIC_SITE_URL'),
    '(c) producción sin PUBLIC_SITE_URL: mensaje accionable',
  );
}

// (d) `Production` con mayúscula se trata como no productivo (comparación exacta)
checkNonProduction('(d) PUBLIC_ENV=Production', { PUBLIC_ENV: 'Production' });

// (e) fuera de producción pero con PUBLIC_SITE_URL definida: noindex y ningún canonical
checkNonProduction('(e) PUBLIC_ENV=preview con PUBLIC_SITE_URL', {
  PUBLIC_ENV: 'preview',
  PUBLIC_SITE_URL: SITE,
});

if (failures > 0) {
  console.error(`\n${failures} comprobación(es) fallaron.`);
  process.exit(1);
}
console.log('\nOK: verify-env-surface (dist queda reconstruido en modo no productivo)');

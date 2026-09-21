// Verificación de FND-01: `astro dev --host` sirve el sitio en localhost y en la IP de la red local.
// Uso: node scripts/verify-dev-lan.mjs
import { spawn, spawnSync } from 'node:child_process';
import { networkInterfaces } from 'node:os';

const PORT = 4321;
const TIMEOUT_MS = 60_000;
const EXPECTED = ['forms.clickup.com/90131720021', 'lang="es"', 'href="#agenda"'];

// Solo se limpia si este script lanzó el servidor. Si el puerto ya estaba ocupado por el servidor
// de otra persona (por ejemplo su `astro dev` en segundo plano), no se toca.
const fail = (msg) => {
  console.error(`FAIL: ${msg}`);
  if (child) cleanup();
  process.exit(1);
};

let child;
function cleanup() {
  // Astro 7 deja el servidor en segundo plano si detecta un agente de IA:
  // `astro dev stop` lo detiene; en primer plano basta matar al proceso hijo.
  try {
    spawnSync('npx', ['astro', 'dev', 'stop'], { stdio: 'ignore', timeout: 20_000 });
  } catch {}
  if (child && !child.killed) {
    try {
      child.kill('SIGTERM');
    } catch {}
  }
}

async function get(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(5_000) });
  return { status: res.status, body: await res.text() };
}

function lanIPv4() {
  for (const nets of Object.values(networkInterfaces())) {
    for (const net of nets ?? []) {
      if (net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
  return undefined;
}

async function waitFor(url) {
  const deadline = Date.now() + TIMEOUT_MS;
  while (Date.now() < deadline) {
    try {
      const { status } = await get(url);
      if (status === 200) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 750));
  }
  fail(`${url} no respondió 200 dentro de ${TIMEOUT_MS / 1000} s`);
}

function check(label, { status, body }) {
  if (status !== 200) fail(`${label} respondió ${status}`);
  for (const needle of EXPECTED) {
    if (!body.includes(needle)) fail(`${label} no contiene ${needle}`);
  }
  console.log(`PASS: ${label} responde 200 y contiene ${EXPECTED.length} marcas esperadas`);
}

const ip = lanIPv4();
if (!ip) fail('no se encontró una IPv4 de red local (¿sin conexión de red?)');

const busy = await get(`http://localhost:${PORT}/`).then(
  () => true,
  () => false,
);
if (busy) fail(`el puerto ${PORT} ya está ocupado por otro servidor; deténlo (npx astro dev stop) y reintenta`);

child = spawn('npx', ['astro', 'dev', '--host', '--port', String(PORT)], {
  stdio: ['ignore', 'pipe', 'pipe'],
});
child.stderr.on('data', () => {});
child.stdout.on('data', () => {});

await waitFor(`http://localhost:${PORT}/`);
check(`http://localhost:${PORT}/`, await get(`http://localhost:${PORT}/`));
check(`http://${ip}:${PORT}/`, await get(`http://${ip}:${PORT}/`));

cleanup();
console.log('OK: verify-dev-lan');
process.exit(0);

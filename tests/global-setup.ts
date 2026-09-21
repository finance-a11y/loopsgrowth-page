import { existsSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

// `reuseExistingServer` permite reutilizar un `astro preview` que ya corre (obligatorio cuando un
// agente de IA lo deja en segundo plano). Ese servidor sirve el `dist` que existía cuando se
// levantó: si el código cambió después, las pruebas validarían un build viejo sin avisar.
// Esta comprobación falla antes de correr nada si `dist/index.html` es más viejo que cualquier
// archivo de `src/`, `public/` o `astro.config.mjs`. Playwright levanta el `webServer` antes de
// ejecutar `globalSetup`, así que si el servidor lo construyó él mismo, `dist` ya está al día.

function newestMtime(path: string): number {
  const stat = statSync(path);
  if (!stat.isDirectory()) return stat.mtimeMs;
  let newest = stat.mtimeMs;
  for (const name of readdirSync(path)) newest = Math.max(newest, newestMtime(join(path, name)));
  return newest;
}

export default function globalSetup(): void {
  const built = resolve('dist/index.html');
  if (!existsSync(built)) {
    throw new Error('No existe dist/index.html: ejecuta `npx astro build` antes de las pruebas de navegador.');
  }
  const builtAt = statSync(built).mtimeMs;
  for (const source of ['src', 'public', 'astro.config.mjs']) {
    const path = resolve(source);
    if (!existsSync(path)) continue;
    if (newestMtime(path) > builtAt) {
      throw new Error(
        `dist/index.html es más viejo que ${source}/: reconstruye con \`npx astro build\` y reinicia el ` +
          'preview (`npx astro preview stop`) antes de correr las pruebas, o validarían un build viejo.',
      );
    }
  }
}

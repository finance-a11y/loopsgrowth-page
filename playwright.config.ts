import { defineConfig, devices } from '@playwright/test';

// Chromium contra el build de producción servido por `astro preview`.
// Puerto 4322 para no chocar con `astro dev` (4321). Se usa `astro build` directo
// (sin el prebuild de guardas) para que las pruebas de navegador no dependan de ellas.
//
// Nota: si un agente de IA ejecuta esto, Astro 7 deja `astro preview` en segundo plano y
// Playwright ve que el proceso terminó. En ese caso levanta antes el servidor
// (`npx astro build && npx astro preview --port 4322`); `reuseExistingServer` lo reutiliza.
// Termínalo después con `npx astro preview stop`. En CI (`CI` definida) nunca se reutiliza:
// siempre construye y levanta uno propio. Reutilizar un servidor previo es solo para local, y
// `tests/global-setup.ts` falla si `dist` es más viejo que `src/`, para no validar un build viejo:
// reconstruye (`npx astro build`) y reinicia el preview tras cada cambio de código.
const LIVE_SPECS = /form-(live|measure)\.spec\.ts$/;

export default defineConfig({
  testDir: 'tests/e2e',
  reporter: 'list',
  globalSetup: './tests/global-setup.ts',
  use: {
    baseURL: 'http://localhost:4322',
    ...devices['Desktop Chrome'],
  },
  // Dos proyectos: `chromium` no depende de que ClickUp responda y `live` reúne los specs que
  // necesitan el formulario real (forms.clickup.com y app-cdn.clickup.com). Ojo: `chromium` NO
  // corre sin red por sí solo, el iframe sigue pidiendo `forms.clickup.com`; solo garantiza que
  // sus pruebas pasan aunque esa petición falle o tarde. Si ClickUp cae, solo `live` falla.
  // Con `E2E_BLOCK_CLICKUP=1` (`npm run test:e2e:isolated`) el navegador usa un proxy muerto: todo
  // lo que no es localhost falla, y así se comprueba de verdad que `chromium` no depende de ClickUp.
  projects: [
    {
      name: 'chromium',
      testIgnore: LIVE_SPECS,
      use: {
        viewport: { width: 1280, height: 800 },
        // Playwright fuerza el proxy también para localhost salvo que se excluya: `bypass` deja el
        // preview (4322) accesible y todo lo demás (ClickUp incluido) cae en el proxy muerto.
        ...(process.env.E2E_BLOCK_CLICKUP
          ? { proxy: { server: 'http://127.0.0.1:9', bypass: 'localhost,127.0.0.1' } }
          : {}),
      },
    },
    {
      name: 'live',
      testMatch: LIVE_SPECS,
      use: { viewport: { width: 1280, height: 800 } },
    },
  ],
  webServer: {
    command: 'npx astro build && npx astro preview --port 4322',
    url: 'http://localhost:4322',
    reuseExistingServer: !process.env.CI,
    timeout: 180000,
  },
});

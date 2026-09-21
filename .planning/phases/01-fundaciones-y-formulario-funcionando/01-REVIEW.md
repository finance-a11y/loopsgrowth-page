---
phase: 01-fundaciones-y-formulario-funcionando
reviewed: 2026-09-19T00:00:00Z
depth: standard
iteration: 2
files_reviewed: 24
files_reviewed_list:
  - package.json
  - package-lock.json
  - playwright.config.ts
  - astro.config.mjs
  - scripts/check-contrast.mjs
  - scripts/lib/contrast.mjs
  - scripts/lib/copy-rules.mjs
  - scripts/verify-dev-lan.mjs
  - scripts/verify-env-surface.mjs
  - src/components/SkipLinks.astro
  - src/content.config.ts
  - src/content/landing.es.yaml
  - src/layouts/BaseLayout.astro
  - src/lib/content.ts
  - src/lib/site.ts
  - src/scripts/cta-focus.ts
  - tests/global-setup.ts
  - tests/e2e/a11y-base.spec.ts
  - tests/e2e/cta-focus.spec.ts
  - tests/e2e/form-measure.spec.ts
  - tests/guards/contrast.test.mjs
  - tests/guards/copy.test.mjs
  - tests/guards/list-pending.test.mjs
findings:
  critical: 0
  warning: 3
  info: 3
  total: 6
status: issues_found
---

# Fase 1: Informe de revisión de código (iteración 2)

**Depth:** standard
**Status:** issues_found

La iteración 1 (commit 3012361) encontró CR-01 y WR-01 a WR-15; el corrector aplicó 16 commits `fix(01):`. Esta iteración los verifica y busca regresiones.

## Resumen

- `node --test tests/guards/*.test.mjs`: 62 de 62 pasan. `check-contrast`: 9/9 aprobados y 6 prohibidos. `check-copy` en producción falla solo por las 5 PENDING, con 0 estructurales. `list-pending --check`: al día. `npm ci --dry-run`: consistente.
- Resueltos sin regresión observada: CR-01, WR-01, WR-02, WR-03, WR-04, WR-06, WR-07, WR-08 (incluida la prueba `(d2)`), WR-09, WR-10, WR-12, WR-13, WR-14.
- WR-05 resuelto solo en parte (ver WR-03 de esta iteración). WR-11 funciona pero introdujo un fallo de mensajes (ver WR-02). WR-15 se cumple a medias (ver WR-01).
- No hay hallazgos críticos nuevos.

## Warnings

### WR-01: La prueba `(f2)` depende de ClickUp y compite con el salto de ancla, así que el proyecto `chromium` no es "sin conexión"

**File:** `tests/e2e/a11y-base.spec.ts:118-139` (y el comentario de `playwright.config.ts:27-28`, que afirma "corre sin conexión")
**Issue:** La prueba hace `page.goto('/#agenda')` y de inmediato mide si el skip link (fixed) queda sobre `#agenda` (`overAgenda`). Esa medición solo es válida después de que el navegador termine el salto de ancla. Con ClickUp respondiendo, `load` tarda entre 5 y 11 s y para entonces la página ya está desplazada; sin ClickUp, `load` llega antes del salto. Con `chromium` y un proxy que bloquea todo salvo localhost pasan 41 pruebas y falla solo `(f2)`, 6 de 6 corridas en `expect(info.overAgenda).toBe(true)`; con red normal pasó 6 de 6. Sonda directa sin conexión: `scrollY=0`, `agendaTop=528`; con conexión: `scrollY=504`, `agendaTop=24`. `npm run test:e2e:offline` falla cuando ClickUp cae, que es el caso que WR-15 quería aislar.

**Fix:** esperar al salto de ancla antes de medir, o provocarlo.
```ts
await page.goto('/#agenda');
await page.waitForFunction(() => window.scrollY > 0); // el salto de ancla ya ocurrió
// o, sin depender del salto del navegador:
// await page.locator('#agenda').evaluate((el) => el.scrollIntoView());
```
Corregir el comentario de `playwright.config.ts`: con `chromium` el iframe sigue pidiendo `forms.clickup.com`; lo correcto es "no depende de que ClickUp responda". Mantener una comprobación con proxy muerto (o `page.route` abortando ClickUp).

### WR-02: `httpsUrlFrom` lanza `TypeError: Invalid URL` en vez de un error de Zod cuando el valor no es una URL

**File:** `src/content.config.ts:24-31`
**Issue:** `z.url().refine((v) => new URL(v)...)`: en Zod 4 (instalado 4.6.5) el `refine` se ejecuta aunque `z.url()` ya haya fallado. `"nota url"` y `""` dan `THROWS Invalid URL`: se pierde el nombre del campo y el mensaje. `javascript:alert(1)` y `https://forms.clickup.com@evil.com/x` sí se rechazan bien. `landing.es.yaml` lo edita el equipo desde la web de GitHub; antes del arreglo un valor mal escrito daba un error claro y ahora un fallo de build sin ruta ni campo. No hay hueco de seguridad.

**Fix:** dejar que Zod valide protocolo y host (verificado: rechaza los cinco casos y devuelve `false` en vez de lanzar):
```ts
const httpsUrlFrom = (host: string) =>
  z.url({
    protocol: /^https$/,
    hostname: new RegExp(`^${host.replaceAll('.', '\\.')}$`),
  });
```
Otra opción: mantener el `refine` con `URL.canParse(value) && ...`.

### WR-03: La guarda de voseo sigue evadible por "Sos" en mayúscula inicial y por verbos de CTA muy comunes que la lista cerrada no incluye

**File:** `scripts/lib/copy-rules.mjs:13-30` (`VOSEO_WORDS`), `:33-37` (`CASE_SENSITIVE_VOSEO`) y `:55-57` (`VOSEO_CASE_RE`, sin bandera `i`)
**Issue:** El arreglo de WR-05 evitó el falso positivo de la sigla SOS con una regla solo en minúscula, lo que abre un hueco: `checkCopy` deja pasar `¿Sos dueño de una tienda?`, `Sos el dueño.`, `Contactá a un experto`, `Consultanos`, `Hacelo ahora`, `Ponete en contacto`, `Probalo`, `Pedile una cotización` y `Sabé que`. Sí marca `Si sos dueño`, `Vos decidís`, `Escribinos hoy`, `Mirá esto`, `Empezá ya`, `Descubrí cómo`. "Contactá" es de los verbos de CTA más frecuentes y en la lista solo está `contactanos`. La regla del proyecto es "nunca voseo", así que un CTA como "Contactá a Loops Growth" pasaría la guarda de producción.

**Fix:** para `sos`, distinguir la sigla completa de la palabra sin depender de la minúscula:
```js
const VOSEO_CASE_RE = new RegExp(voseoPattern(['sos', 'Sos']), 'gu'); // "SOS" queda fuera
```
Añadir a la lista `contactá`, `ponete`, `consultanos`, `hacelo`, `probalo`, `pedile`, `sabé` y las formas con enclítico de los imperativos que ya están. Forma sostenible: generar `imperativo sin tilde + (nos|me|te|lo|la|le)` desde la lista de imperativos, con pruebas de tres ejemplos nuevos. Añadir además una prueba `Sos` inicial y `Contactá`.

## Info

### IN-01: `pedí` y `elegí` marcan como voseo el pretérito de primera persona del español neutro

**File:** `scripts/lib/copy-rules.mjs:21-22`
**Issue:** `Ayer pedí una cotización y elegí el plan.` produce dos VOSEO. En español neutro "pedí" y "elegí" son "yo pedí" y "yo elegí" (pretérito); un testimonio de cliente los usaría. Solo bloquea producción, pero Ari no reescribe el copy, así que el falso positivo obligaría a una excepción manual.
**Fix:** quitarlos de la lista (`Pedile` y `Pedinos` se cubren por otra vía) o permitir una lista de excepciones por ruta.

### IN-02: `tests/global-setup.ts` puede dar falsos positivos por archivos ocultos y por mtime de carpetas, y no comprueba qué `dist` sirve el servidor reutilizado

**File:** `tests/global-setup.ts:11-16`
**Issue:** `newestMtime` incluye el mtime de los directorios y de cualquier archivo, incluidos `.DS_Store` y archivos temporales de editor; en macOS abrir `src/` en Finder o guardar de forma atómica actualiza el mtime y el setup falla sin cambio real (razonamiento, no reproducido). Con `reuseExistingServer`, si en 4322 queda un preview de otra rama o worktree, las pruebas corren contra otro build y el setup pasa igual. `resolve('dist/index.html')` depende del cwd.
**Fix:** comparar solo archivos (no directorios), ignorando los que empiezan por `.`. Opcionalmente comparar un identificador del build contra lo que responde `http://localhost:4322/`. Usar la ruta del config para `dist`.

### IN-03: `package-lock.json` editado a mano deja `vite` y `yaml` con `"peer": true`, y `vite` fijado exacto puede duplicarse al actualizar Astro

**File:** `package-lock.json` (`node_modules/vite`, `node_modules/yaml`), `package.json:26`
**Issue:** Ambos son dependencias directas de producción pero el lockfile los conserva marcados `peer`. `npm ci --dry-run` lo acepta, pero la próxima `npm install` reescribirá esas líneas. `vite` está fijado a `8.3.0` exacto mientras Astro pide `^8.0.13`; si una versión futura de Astro exige otro vite mayor, npm instalará dos copias.
**Fix:** `npm install --package-lock-only` en un checkout limpio y aceptar solo las líneas de estos dos paquetes. Usar `^8.3.0` para `vite` si no se necesita el pin exacto.

---

_Reviewed: 2026-09-19_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_

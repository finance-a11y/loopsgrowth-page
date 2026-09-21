---
phase: 02-secciones-marca-y-copy
reviewed: 2026-09-19T23:10:00Z
depth: standard
files_reviewed: 83
files_reviewed_list:
  - .gitignore
  - package.json
  - public/favicon.ico
  - public/favicon.svg
  - scripts/brand/extract-artboards.mjs
  - scripts/brand/svgo-keep-paths.config.cjs
  - scripts/check-photos.mjs
  - scripts/lib/brand-svg.mjs
  - scripts/lib/contrast.mjs
  - scripts/lib/copy-rules.mjs
  - scripts/lib/photo-licenses.mjs
  - scripts/photos/halftone.mjs
  - scripts/photos/treat.mjs
  - src/assets/brand/apilado-01-blanco.svg
  - src/assets/brand/apilado-03-morado.svg
  - src/assets/brand/apilado-05-amarillo.svg
  - src/assets/brand/apilado-08-oscuro.svg
  - src/assets/brand/emblema-10-blanco.svg
  - src/assets/brand/emblema-12-morado.svg
  - src/assets/brand/emblema-24-amarillo.svg
  - src/assets/brand/horizontal-06-blanco.svg
  - src/assets/brand/imagotipo-07-blanco.svg
  - src/assets/brand/isotipo-13-blanco.svg
  - src/assets/brand/isotipo-14-morado.svg
  - src/assets/brand/isotipo-16-amarillo.svg
  - src/assets/brand/isotipo-17-oscuro.svg
  - src/assets/brand/ojo-18-blanco.svg
  - src/assets/brand/ojo-19-morado.svg
  - src/assets/brand/ojo-21-amarillo.svg
  - src/assets/brand/ojo-22-oscuro.svg
  - src/assets/loopy/isotipo-13-blanco.svg
  - src/assets/loopy/isotipo-14-morado.svg
  - src/assets/loopy/ojo-18-blanco.svg
  - src/assets/loopy/ojo-19-morado.svg
  - src/assets/photos/LICENSES.md
  - src/assets/photos/treated/hero-a.png
  - src/assets/photos/treated/hero-b.png
  - src/assets/photos/treated/whynow-a.png
  - src/assets/photos/treated/whynow-b.png
  - src/components/AgendaSection.astro
  - src/components/CtaLink.astro
  - src/components/SiteFooter.astro
  - src/components/SiteHeader.astro
  - src/components/SkipLinks.astro
  - src/components/brand/Logo.astro
  - src/components/brand/logo-variants.mjs
  - src/components/collage/AgendaCollage.astro
  - src/components/collage/Avatar.astro
  - src/components/collage/CollagePhoto.astro
  - src/components/collage/CollagePiece.astro
  - src/components/collage/CollageScene.astro
  - src/components/collage/CollageSprite.astro
  - src/components/collage/HeroCollage.astro
  - src/components/collage/Pill.astro
  - src/components/collage/collage-rules.mjs
  - src/components/collage/loopy.mjs
  - src/components/collage/photos.mjs
  - src/components/collage/scenes.mjs
  - src/components/sections/Cases.astro
  - src/components/sections/Faq.astro
  - src/components/sections/ForWhom.astro
  - src/components/sections/Hero.astro
  - src/components/sections/HowItWorks.astro
  - src/components/sections/Includes.astro
  - src/components/sections/Problem.astro
  - src/components/sections/Results.astro
  - src/components/sections/Solution.astro
  - src/components/sections/Team.astro
  - src/components/sections/WhyNow.astro
  - src/components/ui/MetricCard.astro
  - src/components/ui/PainCard.astro
  - src/components/ui/PillarCard.astro
  - src/components/ui/ResultItem.astro
  - src/components/ui/SectionShell.astro
  - src/content.config.ts
  - src/content/landing.es.yaml
  - src/layouts/BaseLayout.astro
  - src/pages/index.astro
  - src/pages/marca/[sheet].astro
  - src/pages/privacidad.astro
  - src/styles/global.css
  - src/styles/motion.css
  - src/styles/tokens.css
findings:
  critical: 0
  warning: 7
  info: 14
  total: 21
status: issues_found
---

# Phase 02: Code Review Report

**Reviewed:** 2026-09-19T23:10:00Z
**Depth:** standard (con comprobaciones cruzadas donde el hallazgo lo exigía)
**Files Reviewed:** 83
**Status:** issues_found

## Summary

Se revisaron los 83 archivos de fuente que cambió la fase 2 (el 84.º del diff, `HeroSkeleton.astro`, fue eliminado y ya no tiene referencias) (componentes, layouts, páginas, estilos, esquema y YAML de contenido, scripts de marca, fotos, contraste y reglas de copy), más `git ls-files`, un build de producción real (`PUBLIC_ENV=production PUBLIC_SITE_URL=https://example.com npx astro build --outDir <scratch>`), la suite `node --test tests/guards/*.test.mjs` (207 pruebas, todas verdes) y `check-contrast` (14/14 pares, 11 prohibidos).

Lo que se verificó como correcto: no hay `set:html`, `innerHTML`, `outline: none`, hex ni `rgb()` en `src/components`, `src/pages` ni `src/layouts`; todos los SVG de `src/assets` y `public` contienen solo `<svg>` y `<path>` (sin script, `foreignObject`, manejadores, referencias externas ni metadatos); los cuatro PNG tratados no traen chunks `tEXt`, `iTXt` ni `eXIf`; `git ls-files` no versiona ningún `.ai`, BrandBook, PDF ni foto original; los únicos hosts externos en runtime son `forms.clickup.com` y `app-cdn.clickup.com` (el esquema Zod fija protocolo y hostname anclados); los `spawnSync` de `extract-artboards.mjs` van con lista de argumentos y sin shell; las expresiones de `copy-rules.mjs` son lineales o de alternación simple (sin retroceso catastrófico) y detectan lo que dicen (probado con 30 cadenas sintéticas).

No hay defectos críticos. Los hallazgos más importantes son de robustez de las puertas de producción (se pueden saltar con `astro build` directo, reproducido), de accesibilidad de idioma (A11Y.md SC 3.1.2) y de higiene del enlace `mailto:`.

## Warnings

### WR-01: Las puertas de producción viven solo en los hooks `prebuild` y `postbuild` de npm y se saltan con `astro build`

**File:** `package.json:11,16,18`
**Issue:** `check-contrast`, `check-copy` y `check-photos` se ejecutan únicamente como `prebuild`, y `check-copy --dist` como `postbuild`. Esos hooks solo corren con `npm run build`. Cualquier otra forma de construir los omite: `npx astro build` (lo usa `playwright.config.ts` a propósito), `astro build` en un panel de hosting, o `pnpm`/`bun` (pnpm no ejecuta `pre*`/`post*` por defecto desde la v7). Se reprodujo: `PUBLIC_ENV=production PUBLIC_SITE_URL=https://example.com npx astro build` termina con éxito y emite `canonical`, sitemap, 32 apariciones de `FALTA CONFIRMAR`, y los PNG de las candidatas no elegidas (`hero-b`, `whynow-b`) en `dist/_astro`, mientras que `npm run build` con el mismo entorno falla por diseño. Es exactamente el caso "puerta que falla abierta por error".
**Fix:** Encadenar las guardas dentro del propio script y dejar el binario crudo con otro nombre:
```json
"build": "node scripts/check-contrast.mjs && node scripts/check-copy.mjs && node scripts/check-photos.mjs && astro build && node scripts/check-copy.mjs --dist dist",
"build:raw": "astro build"
```
y que `playwright.config.ts` use `npm run build:raw`. Alternativa complementaria: una integración Astro (`astro:config:setup` o `astro:build:start`) que ejecute las mismas funciones puras (`checkCopy`, `evaluatePhotoGate`) y lance un `Error` cuando `isProduction`, así ninguna invocación las salta.

### WR-02: Frases en inglés del copy se imprimen sin `lang="en"` (A11Y.md SC 3.1.2, Language of Parts)

**File:** `src/content/landing.es.yaml:126,128,206,250,293,303,367` y los componentes que imprimen `.text` (`src/components/sections/Solution.astro`, `PillarCard.astro`, `Cases.astro`, `MetricCard.astro`)
**Issue:** CLAUDE.md y A11Y.md exigen `lang` propio en pasajes de otro idioma. Solo las píldoras decorativas lo cumplen (`Pill.astro:39`). Las frases "Core Web Vitals", "link building", "keywords", "email marketing (SaaS B2B)", "Meta Ads", "e-commerce" salen como texto plano bajo `<html lang="es">`, así que un lector de pantalla las pronuncia con fonética española. No hay mecanismo para marcarlas: el copy va como cadena y `set:html` está prohibido con razón.
**Fix:** Un componente `Text.astro` (o helper) con una lista cerrada de términos en inglés que parte la cadena en nodos de texto y `<span lang="en">`, sin `set:html` ni cambiar el YAML (el copy sigue verbatim):
```astro
---
const EN_TERMS = ['Core Web Vitals', 'link building', 'keywords', 'email marketing', 'SaaS B2B', 'Meta Ads', 'e-commerce'];
const re = new RegExp(`(${EN_TERMS.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
const parts = Astro.props.text.split(re);
---
{parts.map((p, i) => (i % 2 ? <span lang="en">{p}</span> : p))}
```
Añadir una prueba e2e que compruebe que ningún término de la lista queda fuera de un `[lang="en"]`.

### WR-03: La expresión de correo del pie admite `%`, lo que permite reintroducir parámetros o cabeceras en `mailto:`

**File:** `src/components/SiteFooter.astro:24-26`
**Issue:** El comentario de cabecera (líneas 9-11) promete que ningún valor inyectado puede "armar una URL con parámetros", y la regex excluye `?`, `,`, `;`, `:` y espacio. Pero `EMAIL_RE` permite `%` en la parte local, y `%3F`, `%3A`, `%0D%0A` se decodifican al abrir el cliente de correo. Ejemplo válido para la regex: `a%3Fbcc%3Devil@x.com` (queda `a?bcc=evil@x.com`) o `a%0D%0ABcc%3Aevil@x.com` (cabecera adicional en clientes que no sanean). El valor viene del YAML, que edita el equipo (incluso desde la web de GitHub), por eso el riesgo es bajo, pero contradice la garantía escrita y la solución es de una línea.
**Fix:** Quitar `%` de la clase (casi ningún correo real lo usa) y codificar por si acaso:
```js
const EMAIL_RE = /^[A-Za-z0-9._+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/;
const emailHref = EMAIL_RE.test(email) ? `mailto:${encodeURIComponent(email).replace('%40', '@')}` : undefined;
```
y añadir un caso de mutación en la guarda correspondiente con `%3F` y `%0D%0A`.

### WR-04: `/privacidad/` está en el sitemap de producción aunque es `noindex` (verificado)

**File:** `astro.config.mjs:34` (y `src/pages/privacidad.astro:6,16`)
**Issue:** Con el build de producción real, `sitemap-0.xml` lista `https://example.com/privacidad/` y el HTML de esa ruta lleva `<meta name="robots" content="noindex">` sin canonical. Es una señal contradictoria que Search Console reporta como "URL enviada marcada noindex", en una página que vende SEO técnico. Ya estaba anotado para la fase 3 en el comentario de `privacidad.astro`; se confirma que sigue abierto y que el arreglo es trivial, por lo que conviene cerrarlo antes de que se pueda construir en producción.
**Fix:**
```js
integrations: isProduction && site
  ? [sitemap({ filter: (page) => !page.endsWith('/privacidad/') })]
  : [],
```
y quitar el filtro (con el `noindex`) el día que exista el texto legal.

### WR-05: La puerta de fotos de producción es más débil que sus propias pruebas

**File:** `scripts/lib/photo-licenses.mjs:14,93-104`, `scripts/check-photos.mjs:11-26`
**Issue:** `evaluatePhotoGate` solo comprueba (a) que cada foto elegida tenga fila y no esté `pendiente` y (b) que no existan rasters de candidatas. Las reglas "una elegida por ranura", "cada ranura con foto" y "estado coherente con `Elección: cerrada`" existen solo en `tests/guards/photos.test.mjs`, que no corre en `prebuild`. Consecuencias: con dos `chosen: true` en la misma ranura el build pasa y `chosenPhoto()` usa la primera; con ninguna elegida el build pasa y el panel del collage sale vacío sin aviso. Además, `parseElection` y la columna `derived` no participan en la puerta, `APPROVAL` acepta cualquier nombre (`aprobada por x el 9999-99-99`, la fecha no se valida) y nada compara el `sha256` con el PNG derivado, de modo que la aprobación de Ari es una cadena que cualquiera puede escribir.
**Fix:** Mover a `evaluatePhotoGate` (función pura ya probada) las reglas de una elegida por ranura de `PHOTO_SLOT_NAMES`, de coherencia con `parseElection`, y validar la fecha con `Number.isNaN(Date.parse(...))`. Registrar en LICENSES.md quién puede aprobar (lista cerrada de nombres) o exigir que el commit de aprobación lo firme Ari.

### WR-06: `sharp` se importa sin estar declarado (es dependencia opcional de Astro)

**File:** `scripts/photos/treat.mjs:11`, `tests/guards/photos.test.mjs:7`, `package.json:36`
**Issue:** `treat.mjs` reconoce en su cabecera que `sharp` "ya está instalada; no se agrega a package.json", pero en Astro 7.3.3 `sharp` figura en `optionalDependencies`. Si la instalación opcional falla (musl, CI sin binario precompilado, `--omit=optional`), `treat.mjs` y `tests/guards/photos.test.mjs` fallan al importar, lo que rompe `npm run test:guards` completo para ese archivo y el tratamiento reproducible de fotos. Además el propio `<Image>` de `CollagePhoto.astro` necesita `sharp` en el build.
**Fix:** Declararla explícitamente con la versión que resolvió el lockfile:
```json
"devDependencies": { "sharp": "0.35.4" }
```
(o en `dependencies` si el build de producción va a usar el servicio de imágenes por defecto).

### WR-07: El tope de peso del HTML está copiado en seis sitios y el crudo ya usa el 88 %

**File:** `tests/e2e/page-structure.spec.ts:352-354`, `tests/e2e/results-cases.spec.ts:433-434`, `tests/e2e/team-includes-how.spec.ts:531-532`, `tests/e2e/phase-closing.spec.ts:455-456`, `tests/guards/brand-assets.test.mjs:229-230`
**Issue:** Los valores 81920 (crudo) y 25600 (gzip -9) están repetidos en cinco archivos, en dos formas distintas (`80 * 1024` y `81920`), más el mismo comentario de justificación copiado tres veces (son cinco guardas, no cuatro). Hoy `dist/index.html` de producción mide 71 855 bytes crudos (88 % del tope) y 14 315 con gzip (56 %). El tope crudo se subió de 61 440 a 81 920 para que cupiera el contenido, es decir, funciona como trinquete que se sube cuando estorba, mientras que la métrica que importa (gzip) tiene holgura de sobra. El siguiente cambio de copy exigirá editar cinco archivos y es fácil olvidar uno.
**Fix:** Un único módulo `tests/lib/budgets.mjs` con `HTML_RAW_MAX`, `HTML_GZIP_MAX`, `COLLAGE_MAX`, `INLINE_SCRIPT_MAX` que importen los cinco archivos, y decidir si el tope crudo se mantiene (entonces documentar quién lo autoriza) o se elimina en favor del gzip.

## Info

### IN-01: `dist/_astro` de producción incluye archivos que ningún HTML referencia

**File:** `src/components/brand/Logo.astro:27-43`, `src/pages/marca/[sheet].astro`
**Issue:** `Logo.astro` importa estáticamente las 17 mesas SVG y Vite emite cada una como archivo aparte aunque se pinten en línea. En el build de producción real hay 10 SVG de marca sin referencia (`apilado-01`, `apilado-03`, `emblema-10`, `emblema-12`, `imagotipo-07`, `isotipo-13`, `isotipo-14`, `ojo-18`, `ojo-19`, `horizontal-06`) y `_sheet_.*.css` de una página que en producción no se genera. No es un riesgo (son logos oficiales), pero son descargas públicas huérfanas y contradice "solo emitir lo usado".
**Fix:** Cargar las mesas con `import.meta.glob('../../assets/brand/*.svg', { eager: true, query: '?raw' })` y pintar con `set:html` está prohibido, así que la alternativa es `?component` con `assetsInlineLimit` alto (`vite.build.assetsInlineLimit: 8192`) o filtrar el borrado en un `astro:build:done`. Como mínimo, documentarlo y añadir la lista de huérfanos esperados a `phase-closing.spec.ts`.

### IN-02: Erratas en textos marcados `verified`

**File:** `src/content/landing.es.yaml:59,73,134,549`
**Issue:** Línea 134 "estrategia y direcciôn" (circunflejo por acento agudo); líneas 59 y 549 "te estan buscando" (falta la tilde de "están"); línea 73 doble espacio antes de "y el negocio". El copy es de Ari y no se reescribe, pero `AgendaSection.astro:5` solo reconoce la errata del titular; las otras no están registradas y "verified" transmite que Ari las revisó.
**Fix:** No editar el texto. Pasar las cuatro a `pending` con `reason: "Errata de ortografía, Ari confirma la forma correcta"` o añadirlas a la lista de pendientes que se envía a Ari.

### IN-03: `treat.mjs` escribe el PNG antes de validar cobertura y peso

**File:** `scripts/photos/treat.mjs:86-90`
**Issue:** `writeFileSync` (línea 86) ocurre antes de las comprobaciones de cobertura (89) y tamaño (90). Un tratamiento fuera de rango termina con código 1 pero deja el PNG inválido ya escrito en `src/assets/photos/treated/`. La guarda de pruebas lo detectaría, pero un build sin pruebas lo emitiría.
**Fix:** Mover las dos comprobaciones (líneas 89-90) antes del `writeFileSync`, y escribir solo si pasan y no hay `--dry`.

### IN-04: `extract-artboards.mjs` llama a `process.exit` dentro de `try/finally`

**File:** `scripts/brand/extract-artboards.mjs:51-54,264-296`
**Issue:** `fail()` hace `process.exit(1)`, que no ejecuta el `finally`. Cuando `run()`, `cleanArtboard` o `withMeasuredViewBox` fallan dentro del `try`, el directorio temporal `brand-extract-*` de `mkdtempSync` no se borra y el Chromium queda a cargo del cierre implícito del proceso.
**Fix:** Que `fail` lance `throw new Error(message)` y que solo `main().catch` llame a `process.exit(1)`; así `finally` limpia `work` y cierra el navegador.

### IN-05: Lecturas de `tokens.css` relativas al directorio actual y repetidas por cada píldora

**File:** `src/components/collage/collage-rules.mjs:134`, `src/components/collage/loopy.mjs:79,121`, `src/pages/marca/[sheet].astro`
**Issue:** `readFileSync('src/styles/tokens.css')` y `readFileSync('src/assets/loopy/...')` dependen del `cwd` (un `astro build --root otro` falla) y `assertPill` vuelve a leer y parsear `tokens.css` por cada píldora renderizada.
**Fix:** Cargar `tokens.css` una vez a nivel de módulo (`const TOKENS = parseTokens(...)`) y resolver la ruta con `new URL('../../styles/tokens.css', import.meta.url)` o con `process.cwd()` documentado en un solo lugar.

### IN-06: Ramas muertas y comprobaciones débiles en `validateLicenses`

**File:** `scripts/lib/photo-licenses.mjs:47-50`
**Issue:** La rama de la línea 49 (`else if (!row.licenseUrl)`) es inalcanzable: si la URL coincide con la canónica ya es no vacía. La línea 50 repite lo que ya cubre la 47. `row.license in LICENSE_NAMES` acepta claves del prototipo (`toString`); hoy falla igual por la comparación de URL, pero por casualidad.
**Fix:** `Object.hasOwn(LICENSE_NAMES, row.license)` y eliminar las líneas 49-50.

### IN-07: Tipos JSDoc incorrectos en el manifiesto de fotos y `any` en `CollagePhoto`

**File:** `src/components/collage/photos.mjs:19`, `src/components/collage/CollagePhoto.astro:15`
**Issue:** El `@type` declara `contrast: 1.0, brightness: 165` como tipos literales, pero los datos usan 175, 118, 92 y 105; un `astro check` estricto lo marcaría. `frame: any` en `Props` pierde el contrato que ya ofrece `photoFrame()`.
**Fix:** `contrast: number, brightness: number` y `frame: NonNullable<ReturnType<typeof photoFrame>>`.

### IN-08: Restos y duplicados en CSS y tokens

**File:** `src/styles/tokens.css:119,133,147,161`, `src/styles/global.css:79`, `src/components/AgendaSection.astro:49,133`, `src/components/collage/AgendaCollage.astro:23`
**Issue:** `--collage-stroke` se declara en los cuatro tonos y la guarda de contraste lo mide, pero ningún componente lo consume (0 usos de `var(--collage-stroke)`). `section[id] { scroll-margin-top: 1.5rem }` (global) duplica los de `Hero.astro:42` y `AgendaSection.astro:101`. `.agenda-art` y `.agenda-collage` ocultan lo mismo bajo 64em y ambos wrappers llevan `aria-hidden`.
**Fix:** Borrar el token (y su par en `TONE_PAIRS`) o usarlo, quitar los dos `scroll-margin-top` locales y dejar una sola capa de ocultamiento.

### IN-09: El enlace de privacidad queda bajo la etiqueta "Redes"

**File:** `src/components/SiteFooter.astro:47-51`
**Issue:** El bloque encabezado por `footer.social_label` ("Redes") contiene también el enlace a la política de privacidad. Con las redes reales de Ari (varios enlaces) la política quedaría agrupada como si fuera una red.
**Fix:** Sacar el enlace de privacidad a su propio `footer-block` sin etiqueta de red.

### IN-10: El canal se lee dos veces en cada tarjeta de caso

**File:** `src/components/ui/MetricCard.astro:28,44-45`
**Issue:** `channel` se imprime como chip (`<p class="metric-chip">`) y otra vez como `<dd>` de "Canal". Un lector de pantalla anuncia el dato dos veces por tarjeta.
**Fix:** Marcar el chip `aria-hidden="true"` (es decorativo respecto al `dl`) o quitar la fila "Canal" del `dl`.

### IN-11: Causa de la prueba inestable de `collage-photos` (LCP y CLS 0)

**File:** `tests/e2e/collage-photos.spec.ts:150-166`
**Issue:** La prueba corre `scrollThrough(page)` y luego exige `__cls === 0`. Al recorrer la página se activa el iframe diferido de ClickUp, cuyo script (`iFrameResize`) cambia la altura de 1664 px al valor real y puede desplazar el diseño; sin `E2E_BLOCK_CLICKUP` el resultado depende de la red. Además el LCP se resuelve en la primera devolución del `PerformanceObserver` con `entries.at(-1)`, que puede ser un candidato intermedio.
**Fix:** En esta prueba, abortar `forms.clickup.com` y `app-cdn.clickup.com` con `context.route` (como hace `isolatedContext` en `phase-closing.spec.ts:75`), y medir el LCP con `visibilitychange` o `web-vitals` en lugar del primer callback.

### IN-12: Radios fuera de la escala (avisos del detector, confirmados)

**File:** `src/components/brand/Logo.astro:138`, `src/components/collage/Pill.astro:47,64`, `src/components/sections/Faq.astro:121`
**Issue:** `Logo` usa `0.25rem`, `Pill` repite `999px` (que ya es `--radius-pill`) y `0.45em`, y `Faq` calcula `calc(var(--radius-card) - 3px)`. DESIGN.md solo declara pill, card 1 rem y las variables `--radius-s`, `--radius-m`.
**Fix:** `border-radius: var(--radius-pill)` en `Pill`; añadir `--radius-xs: 0.25rem` a `@theme` si el radio del foco del logo es intencional; en `Faq` mantener el cálculo pero anotarlo como derivado del token.

### IN-13: Tarjeta en blanco de 1664 px cuando el iframe de ClickUp no carga

**File:** `src/styles/tokens.css:73-74`, `src/components/AgendaSection.astro:65-89`
**Issue:** `--form-min-h-sm: 1664px` reserva altura para evitar CLS, pero si ClickUp está bloqueado (bloqueador, red débil del evento) la tarjeta queda como un bloque blanco de 1664 px en móvil. El enlace de respaldo existe arriba y el `<noscript>` cubre solo la ausencia de JS, no un iframe que no responde.
**Fix:** Mensaje de respaldo dentro de la tarjeta (posicionado sobre el fondo del iframe, que queda visible solo si el iframe no pinta) o reducir la reserva y dejar que el script de ClickUp la agrande, aceptando algo de CLS bajo `loading="lazy"` porque queda bajo el pliegue.

### IN-14: Detalles menores de las reglas de copy y del repositorio

**File:** `scripts/lib/copy-rules.mjs:21-29`, `.gitignore:32`, `src/assets/photos/LICENSES.md:56-62`
**Issue:** (a) `pedí`, `escribí`, `elegí`, `descubrí`, `vení` son a la vez imperativo de vos y primera persona del pretérito ("descubrí que..."); la guarda las marca sin excepción por ruta, así que un texto legítimo bloquearía producción sin salida salvo tocar la lista. (b) `BrandBook*.pdf` distingue mayúsculas en sistemas de archivos sensibles; un `Brandbook.pdf` o `brand-book.pdf` escaparía del ignore. (c) La cita de la Unsplash License salió de WebFetch como fragmentos, y la propia nota admite que no es el texto completo; la prueba de procedencia es débil para una foto de un ojo humano "sin permiso de modelo".
**Fix:** (a) Permitir una lista `VOSEO_ALLOW_PATHS` o una marca explícita en el YAML aprobada por Ari; (b) añadir una guarda que falle si `git ls-files` contiene cualquier `.pdf` fuera de una lista blanca; (c) guardar una copia fechada del texto de la licencia (o su hash) en `photo-sources/` y pedir a Ari aprobación expresa de la foto con persona antes de cerrar la elección.

---

_Reviewed: 2026-09-19T23:10:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_

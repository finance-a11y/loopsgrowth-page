---
phase: 01-fundaciones-y-formulario-funcionando
fixed_at: 2026-09-19T04:31:06Z
review_path: .planning/phases/01-fundaciones-y-formulario-funcionando/01-REVIEW.md
iteration: 2
findings_in_scope: 3
fixed: 3
skipped: 0
status: all_fixed
iteration_1_fixed_at: 2026-09-19T03:50:25Z
iteration_1_findings_in_scope: 16
iteration_1_fixed: 16
iteration_1_skipped: 0
---

> El encabezado de arriba describe la iteración más reciente (2). El contenido de la iteración 1 sigue intacto a continuación; la sección "Iteración 2" está al final.

# Fase 1: Informe de corrección de la revisión de código

**Corregido:** 2026-09-19T03:50:25Z
**Revisión de origen:** .planning/phases/01-fundaciones-y-formulario-funcionando/01-REVIEW.md
**Iteración:** 1

**Resumen:**
- Hallazgos en alcance: 16 (CR-01 y WR-01 a WR-15; los siete Info quedaron fuera de alcance)
- Corregidos: 16
- Omitidos: 0

## Verificación final

Dónde corrieron las comprobaciones: en un worktree aislado (`.claude/worktrees/rf-01-40668-1789788252`, rama temporal `gsd-reviewfix/01-40668`), con `node_modules` enlazado al del checkout principal. No se recrearon dependencias ni se ejecutó ningún borrado recursivo sobre ese enlace. Los resultados se reproducen desde el checkout principal una vez que la rama avanza por fast-forward.

| Comprobación | Resultado |
|--------------|-----------|
| `node --test tests/guards/*.test.mjs` | 62 pruebas, 62 pasan, 0 fallan (antes: 47, 46 pasan, 1 falla) |
| `npm run build` (con `prebuild` y `postbuild`) | Pasa |
| `PUBLIC_ENV=production npm run build` | Falla solo por las 5 reclamaciones PENDING (`brand.term`, `call.duration`, `meta.title_template`, `hero.subtitle`, `agenda.intro`); 0 fallos estructurales |
| `npx playwright test` (proyectos `chromium` y `live`, contra `astro preview` en 4322) | 51 pasan, 0 fallan (42 sin red, 9 con el formulario real). `forms.clickup.com` respondía 200 |
| `node scripts/verify-env-surface.mjs` | 18 comprobaciones PASS, incluido el nuevo caso (e) |
| `node scripts/list-pending.mjs --check` | `PENDING-COPY.md` está al día (5 pendientes); no hizo falta `npm run pending` |

Ninguna prueba llenó ni envió el formulario de ClickUp, y no se leyó ningún archivo `.env` (para probar WR-02 se creó un archivo local de entorno temporal con valores no secretos y se eliminó después). Se detuvo el preview (`astro preview stop`) y no quedan servidores propios en marcha.

## Fixed Issues

### CR-01: La suite de guardas ya está en rojo por una aserción obsoleta y acoplada a un token de layout

**Files modified:** `tests/guards/contrast.test.mjs`
**Commit:** caf74c2
**Applied fix:** la aserción de `--form-min-h-sm` pasó de comparar `'1100px'` a comprobar la forma (`/^\d+px$/`). La guarda de color ya no depende de una medida de layout que cambia cada vez que se vuelve a medir el formulario.

### WR-01: `canonical` se emite fuera de producción

**Files modified:** `src/layouts/BaseLayout.astro`, `scripts/verify-env-surface.mjs`
**Commit:** e9837fa
**Applied fix:** `canonical` solo se emite con `isProduction && canonical`. Se añadió el caso (e) a `verify-env-surface.mjs` (`PUBLIC_ENV=preview` con `PUBLIC_SITE_URL`): espera `noindex`, ningún `rel="canonical"`, sin sitemap y `robots.txt` sin `Sitemap`.

### WR-02: `verify-env-surface.mjs` no es hermético

**Files modified:** `scripts/verify-env-surface.mjs`
**Commit:** 4d905bd
**Applied fix:** `build()` fuerza `PUBLIC_ENV` y `PUBLIC_SITE_URL` vacíos y luego aplica los valores del caso, porque `process.env` gana sobre los archivos de entorno locales. Comprobado: con un archivo local que pone `production` y una URL, el script sin el arreglo daba 4 FAIL y con el arreglo pasa.

### WR-03: La guarda de contraste compara el ratio ya redondeado

**Files modified:** `scripts/lib/contrast.mjs`, `scripts/check-contrast.mjs`, `tests/guards/contrast.test.mjs`
**Commit:** 7e3ad90
**Applied fix:** nueva `contrastRaw` sin redondeo, usada en los tres umbrales (aprobados, tonos y prohibidos). `contrastRatio` queda solo para mostrar y para contrastar con el ratio medido de UI-SPEC. El detalle del fallo ahora indica el valor real (`real 4.4971`). Pruebas nuevas con `#6473b6` sobre blanco.

### WR-04: Un tono con comillas simples, anidado o ausente se ignora y la guarda sale con código 0

**Files modified:** `scripts/lib/contrast.mjs`, `scripts/check-contrast.mjs`, `tests/guards/contrast.test.mjs`
**Commit:** d49c21e
**Applied fix:** el selector de tono acepta comillas dobles, simples o ninguna. `parseTokens` devuelve además `problems`: selectores descendientes o compuestos (ya no se fusionan con el tono) y bloques con llaves anidadas. `check-contrast.mjs` falla si falta `light` o `purple` (`REQUIRED_TONES`) o si hay algún problema. Ojo: el selector real de `tokens.css` es `:root, [data-tone="light"]`, así que la regla exige que cada elemento de la lista sea exactamente el atributo (o `:root`), no que el selector completo lo sea.

### WR-05: La guarda de voseo se evade con formas no listadas y con Unicode no normalizado

**Files modified:** `scripts/lib/copy-rules.mjs`, `tests/guards/copy.test.mjs`
**Commit:** 829b3a2
**Estado:** fixed: requires human verification (la lista sigue siendo cerrada; conviene que alguien revise si cubre el copy de Ari)
**Applied fix:** `cleanText` (NFC y sin caracteres invisibles) se aplica al texto antes de todas las reglas de contenido. `VOSEO_WORDS` pasó de 21 a 88 formas (imperativos, presente de indicativo y formas con pronombre enclítico). `sos` solo se marca en minúscula, así que "Llamada SOS" ya no da falso positivo. Pruebas nuevas 4d, 4e y 4f (formas nuevas, NFD y ancho cero, y la sigla).

### WR-06: `FALTA CONFIRMAR` se evade con mayúsculas o espacios distintos

**Files modified:** `scripts/lib/copy-rules.mjs`, `tests/guards/copy.test.mjs`
**Commit:** 64887bd
**Applied fix:** `findMissingMark` usa `/falta\s+confirmar/giu` sobre el texto normalizado, sin distinguir mayúsculas, con cualquier espacio (varios, NBSP, U+2009) y con `&nbsp;` en HTML. Sirve también para `--dist`. Pruebas 10b y 11a-bis. Consecuencia asumida: una frase legítima "falta confirmar" en minúscula también bloquea producción; es lo que pedía el hallazgo.

### WR-07: Un placeholder sin resolver llega a la página si el campo no pasa por `fill()`

**Files modified:** `scripts/lib/copy-rules.mjs`, `tests/guards/copy.test.mjs`
**Commit:** 2b13dc2
**Applied fix:** nueva regla estructural `PLACEHOLDER` (falla en cualquier entorno). Rechaza variables que no sean `{term}` o `{duration}`, llaves sin pareja y cualquier llave en una ruta que la página imprime en bruto. Las rutas que sí pasan por `fill()` son las que terminan en `_template`, `hero.subtitle` y `agenda.intro` (`PLACEHOLDER_PATHS`, exportada y comentada: al añadir una ruta hay que llamar a `fill()` en su componente). Se eligió la regla estructural y no el helper `t()` en los componentes por ser el cambio más pequeño. Pruebas 13a, 13b y 13c.

### WR-08: Con el iframe de ClickUp bloqueado, el foco de `/#agenda` se pierde

**Files modified:** `src/scripts/cta-focus.ts`, `tests/e2e/cta-focus.spec.ts`
**Commit:** a10df0f
**Estado:** fixed: requires human verification (comportamiento de temporización en navegador; conviene probarlo a mano con un bloqueador de terceros y con lector de pantalla)
**Applied fix:** en la carga directa se reintenta cada 150 ms durante 1,5 s, pero solo mientras el foco esté vacío (`body` o nulo), y se detiene si la persona pulsa una tecla o el puntero. Se desvió del código sugerido (que reenfocaba siempre) para no robar el foco a quien ya empezó a tabular. Prueba nueva `(d2)` con las rutas de ClickUp abortadas (3 corridas). Se reprodujo el fallo con el código anterior (falló en la corrida 2) y con el arreglo pasa 3 de 3 varias veces. El script propio pesa 666 bytes, muy por debajo del límite de 3 KB.

### WR-09: `reuseExistingServer: true` incondicional permite validar un build viejo

**Files modified:** `playwright.config.ts`, `tests/global-setup.ts` (archivo nuevo)
**Commit:** 7cd107e
**Applied fix:** `reuseExistingServer: !process.env.CI`. Además, un `globalSetup` nuevo falla si `dist/index.html` es más viejo que cualquier archivo de `src/`, `public/` o `astro.config.mjs` (es la variante opcional del hallazgo; sin ella, en local el arreglo por sí solo no cambia nada, porque `CI` no está definida). Comprobado: tras tocar `src/pages/index.astro` el setup falla con un mensaje accionable, y tras reconstruir pasa. Decisión de criterio: se creó un archivo nuevo porque es la única forma de cubrir el caso de reutilización local, que es el flujo obligatorio de un agente.

### WR-10: Dependencias no declaradas o mal ubicadas

**Files modified:** `package.json`, `package-lock.json`
**Commit:** 912321f
**Applied fix:** `vite` se declara en `dependencies` con el pin exacto `8.3.0` (la misma versión que ya resuelve Astro 7.3.3 y que sigue el estilo de pines exactos del proyecto) y `yaml` pasa de `devDependencies` a `dependencies`. El lockfile se editó a mano (raíz y quitar `devOptional` de `yaml`) porque `npm install --package-lock-only` añadía entradas ajenas de paquetes wasm empaquetados. `npm ls` confirma `vite@8.3.0` deduplicado.

### WR-11: `z.url()` acepta cualquier esquema para un `<script src>` editable por el equipo

**Files modified:** `src/content.config.ts`
**Commit:** f286ee6
**Applied fix:** `form_url` exige `https:` y el host exacto `forms.clickup.com`; `form_script_src` exige `https:` y `app-cdn.clickup.com`. Es coherente con 01-UI-SPEC ("origen fijo"), así que no rompe ninguna decisión bloqueada; si un día se cambia de proveedor, se actualiza el host aquí a propósito. Comprobado con cuatro valores malos (`javascript:`, `http:`, otro host y `data:`): el build falla con "debe ser una URL https://app-cdn.clickup.com/...". El build con los valores reales pasa.

### WR-12: `verify-dev-lan.mjs` detiene el servidor del usuario cuando el puerto está ocupado

**Files modified:** `scripts/verify-dev-lan.mjs`
**Commit:** 16d7525
**Applied fix:** `fail()` solo llama a `cleanup()` si el script lanzó el servidor (`child` definido). Comprobado con un servidor ajeno en 4321: el script sale con 1 y el servidor sigue respondiendo. La ruta normal sigue pasando (localhost y la IP de red local).

### WR-13: Pruebas atadas al contenido vivo

**Files modified:** `tests/guards/copy.test.mjs`, `tests/guards/list-pending.test.mjs`, `tests/e2e/a11y-base.spec.ts`
**Commit:** 8d5b13f
**Applied fix:** la prueba 9b ahora exige que todas las violaciones sean PENDING y que sus rutas coincidan con las `pending` del propio YAML (vía `walkClaims`), con estado 1 solo si hay alguna. Se quitó la aserción `expected.length === 5` de list-pending. En el e2e, `H1_TEXT`, `SUBTITLE_TEXT`, `INTRO_TEXT` y `FORM_URL` se leen del YAML y se resuelven igual que `fill()`. `PENDING-COPY.md` no cambió.

### WR-14: El anillo de foco del skip link es morado fijo y puede quedar invisible sobre `#agenda`

**Files modified:** `src/components/SkipLinks.astro`, `tests/e2e/a11y-base.spec.ts`
**Commit:** 6aff082
**Estado:** fixed: requires human verification (decisión visual distinta a la sugerida; Juan debería revisar la captura `test-results/skip-link-focused-agenda.png`)
**Applied fix:** se desvió de la sugerencia del hallazgo, que cambiaba el contorno a amarillo interior y contradecía 01-UI-SPEC ("contorno de foco `3px solid #73187F` con offset 2 px"). Se conservó el contorno morado de la especificación y se añadió un anillo amarillo de dos tonos con `box-shadow: 0 0 0 var(--focus-offset) var(--color-brand-yellow)`, que rellena el hueco del offset. Sobre blanco se ve el morado (9.69); sobre morado, el amarillo (6.15) contra el morado y 10.22 contra el fondo oscuro del enlace. Los tres pares ya están aprobados. Prueba nueva `(f2)`: con `/#agenda`, el enlace enfocado queda parcialmente sobre la sección morada y conserva ambos colores. La captura confirma que el anillo se ve.

### WR-15: La suite e2e depende de la red viva sin degradación

**Files modified:** `playwright.config.ts`, `package.json`, `tests/e2e/a11y-base.spec.ts`
**Commit:** 7f72893
**Applied fix:** dos proyectos de Playwright: `chromium` (ignora `form-live` y `form-measure`, no toca ClickUp) y `live` (solo esos dos specs). Nuevos scripts `test:e2e:offline` y `test:e2e:live`; `test:e2e` sigue ejecutando ambos. La prueba `(e)` ya no espera 20 s al script de ClickUp: pone `style.overflow = 'auto'` a mano y comprueba que nuestro CSS (`overflow: visible !important`) lo vence. El caso `(d)` de cta-focus queda cubierto sin red por `(d2)` (WR-08). Se descartó mockear con `page.route` el resto de las pruebas porque el `chromium` actual ya no depende del contenido del formulario y conservar la carga real del iframe sigue siendo útil.

## Skipped Issues

Ninguno. Todos los hallazgos en alcance se aplicaron y se confirmaron con pruebas o comprobaciones ejecutables.

## Notas para el orquestador

- Los 7 hallazgos Info (IN-01 a IN-07) quedaron fuera de alcance (`fix_scope: critical_warning`).
- Cada corrección tiene su propio commit atómico con el formato `fix(01): {ID} ...`; ninguno incluye este informe.
- Si un cambio futuro de código no va seguido de `npx astro build` y de reiniciar el preview, el nuevo `globalSetup` (WR-09) avisará antes de validar un build viejo.

---

_Fixed: 2026-09-19T03:50:25Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_

---

# Iteración 2

**Corregido:** 2026-09-19T04:31:06Z
**Revisión de origen:** .planning/phases/01-fundaciones-y-formulario-funcionando/01-REVIEW.md (informe de la iteración 2)
**Iteración:** 2

**Resumen:**
- Hallazgos en alcance: 3 (WR-01, WR-02 y WR-03; los tres Info, IN-01 a IN-03, quedaron fuera de alcance)
- Corregidos: 3
- Omitidos: 0

## Verificación final (iteración 2)

Dónde corrieron las comprobaciones: en un worktree aislado (`.claude/worktrees/rf-01-61552-1789790629`, rama temporal `gsd-reviewfix/01-61552`) con `node_modules` enlazado al del checkout principal. Antes de retirar el worktree se quitó el enlace con `unlink` (sin borrado recursivo). Al cerrar, el fast-forward no fue posible porque el orquestador añadió el commit `c5cbcde` (UAT) a la rama mientras se corregía. Los cambios eran disjuntos (`.planning/` frente a código), así que los tres commits se aplicaron sobre la rama con `cherry-pick`; por eso los hashes de abajo son los de la rama final y no los del worktree. La rama temporal y el worktree ya no existen. El árbol de código de la rama final es idéntico (sin diferencias) al que se probó en el worktree, y las guardas se volvieron a ejecutar desde el checkout principal.

| Comprobación | Resultado |
|--------------|-----------|
| `node --test tests/guards/*.test.mjs` | 66 pruebas, 66 pasan, 0 fallan (antes: 62). Se repitió desde el checkout principal tras el cherry-pick: 66 de 66 |
| `npm run build` (con `prebuild` y `postbuild`) | Pasa |
| `PUBLIC_ENV=production npm run build` | Sale con código 1 solo por las 5 reclamaciones PENDING (`brand.term`, `call.duration`, `meta.title_template`, `hero.subtitle`, `agenda.intro`); 0 fallos estructurales |
| `node scripts/check-copy.mjs` (fuera de producción) | 11 verified, 5 pending; 0 estructurales; solo las 5 advertencias PENDING, ningún VOSEO nuevo sobre el copy real de Ari |
| `npx playwright test --project=chromium` con `E2E_BLOCK_CLICKUP=1` (ClickUp inalcanzable) | 42 de 42 pasan, 3 corridas seguidas antes del commit y una más al final |
| `npx playwright test --project=chromium` con red | 42 de 42 pasan, 3 corridas seguidas (cada una tarda unos 3 minutos porque el iframe real carga) |
| `npx playwright test` (proyectos `chromium` y `live`, con red, contra `astro preview` en 4322) | 51 de 51 pasan, dos veces (una al aplicar WR-01 y otra sobre el build final). `forms.clickup.com` respondía 200 |
| `node scripts/verify-env-surface.mjs` | Todas las comprobaciones PASS, incluido el caso (e) |
| `node scripts/list-pending.mjs --check` y `node scripts/check-contrast.mjs` | `PENDING-COPY.md` al día (5 pendientes); contraste 9/9 aprobados y 6 prohibidos |

Ninguna prueba llenó ni envió el formulario de ClickUp, no se leyó ningún archivo `.env`, se detuvo el preview (`astro preview stop`) y no quedan servidores propios en marcha.

## Fixed Issues (iteración 2)

### WR-01: La prueba `(f2)` depende de ClickUp y compite con el salto de ancla, así que el proyecto `chromium` no es "sin conexión"

**Files modified:** `tests/e2e/a11y-base.spec.ts`, `playwright.config.ts`, `package.json`
**Commit:** ac559ee
**Applied fix:**
- `(f2)` ya no mide justo después de `goto('/#agenda')`. Provoca el desplazamiento con `scrollIntoView({ behavior: 'instant', block: 'start' })` (el `instant` evita el `scroll-behavior: smooth` de `global.css`) y espera con `expect.poll` a que `window.scrollY` sea mayor que 0. Así la medición de `overAgenda` no depende de cuánto tarde `load` ni de la red.
- Se corrigió el comentario de `playwright.config.ts`: `chromium` no corre sin red por sí solo (el iframe sigue pidiendo `forms.clickup.com`); lo correcto es que sus pruebas no dependen de que ClickUp responda.
- Se mantiene una comprobación con ClickUp inalcanzable: con `E2E_BLOCK_CLICKUP=1` (script nuevo `npm run test:e2e:isolated`) el proyecto `chromium` usa un proxy muerto (`http://127.0.0.1:9`) con `bypass: 'localhost,127.0.0.1'`. Sin ese `bypass` Playwright también envía `localhost` al proxy y las 42 pruebas fallan con `ERR_PROXY_CONNECTION_FAILED` (fue el primer intento). `test:e2e:offline` se dejó con su nombre por compatibilidad.

**Comprobado:** con el código anterior de `(f2)` y ClickUp bloqueado la prueba falla 2 de 2 (`Expected: true, Received: false` en `overAgenda`), que reproduce el hallazgo. Con el arreglo: 42/42 bloqueado (4 corridas), 42/42 con red (3 corridas) y suite completa 51/51 con red (2 corridas).
**Nota:** el script `test:e2e:isolated` usa la sintaxis POSIX `VAR=1 comando`, válida en macOS y Linux; en Windows habría que definir la variable aparte.

### WR-02: `httpsUrlFrom` lanza `TypeError: Invalid URL` en vez de un error de Zod cuando el valor no es una URL

**Files modified:** `src/content.config.ts`
**Commit:** b7b41bd
**Applied fix:** `httpsUrlFrom` usa `z.url({ protocol: /^https$/, hostname: /^host$/, error })` en lugar de `z.url().refine(new URL(...))`. Zod valida protocolo y host dentro de `z.url()`, así que un valor que no es URL da un error de Zod con la ruta del campo y el mensaje `debe ser una URL https://{host}/...`. El host se escapa antes de armar la expresión regular.

**Comprobado:**
- Con un script que extrae la definición real de `src/content.config.ts` y usa el `zod` de Astro: `"nota url"`, `""`, `javascript:alert(1)`, `https://forms.clickup.com@evil.com/x`, `http://...`, un host parecido (`forms-clickup.com`) y `data:` se rechazan con un error de Zod cuya ruta es `form_url`; lo mismo para `form_script_src` con sus cuatro casos. Ninguno lanza. Las dos URLs reales del YAML pasan.
- Con `astro build` real y cada valor malo puesto temporalmente en el YAML (restaurado con `git checkout` después de cada uno): el build falla con `config.form_url: debe ser una URL https://forms.clickup.com/...`, con el nombre del campo. `npm run build` con los valores reales pasa.
- Detalle cosmético: para `javascript:` y `data:` el mensaje sale dos veces (protocolo y host fallan a la vez). No afecta al resultado.

### WR-03: La guarda de voseo sigue evadible por "Sos" en mayúscula inicial y por verbos de CTA muy comunes que la lista cerrada no incluye

**Files modified:** `scripts/lib/copy-rules.mjs`, `tests/guards/copy.test.mjs`
**Commit:** 0d97f0c
**Estado:** fixed: requires human verification (la lista sigue siendo cerrada y es una decisión de cobertura; conviene que alguien de contenido la revise)
**Applied fix:**
- `sos` se marca con una expresión sensible a mayúsculas sobre `['sos', 'Sos']`: se detectan `Sos` inicial y `sos`, y la sigla `SOS` sigue fuera. Límite conocido y documentado en el código: un titular entero en mayúsculas (`¿SOS DUEÑO?`) se confunde con la sigla.
- Los imperativos de vos pasaron a una lista base `VOSEO_IMPERATIVES` con los verbos nuevos (`contactá`, `sabé`, `hablá`, `llamá`, `avisá`, `ayudá`, `mostrá`, `visitá`, `usá`, `buscá`, `pensá`, `decí`, `esperá`, `tomá`, `bajá`, `generá`, `optimizá`, `analizá`, `diseñá`, `armá`, `ganá`, `crecé`, `posicioná`, `cambiá`, `traé`, `sumá`, `cuidá`, `leé`). De ella se generan las formas con enclítico `nos`, `me`, `te`, `lo`, `la`, `le` (`consultanos`, `hacelo`, `ponete`, `probalo`, `pedile`, `contactame`, `mandale`...). `VOSEO_WORDS` pasó de 88 a 489 formas sin duplicados y sigue exportada.
- Esas formas sin tilde no existen en español neutro (el imperativo de tú es `consúltanos`, `hazlo`, `ponte`, `pruébalo`, `pídele`), por eso no tocan copy legítimo. Se añadió una lista de excepciones para las palabras reales que coinciden con una forma generada: `tomate`, `mandala`, `generala`, `andale`, `create`, `activate`, `generate` y `mandate`.
- No se añadieron como base los verbos cuyo imperativo de vos coincide con el pretérito de primera persona (`medí`, `sentí`, `viví`, `convertí`, `invertí`, `subí`, `seguí`), para no marcar testimonios en español neutro (mismo problema que IN-01 con `pedí` y `elegí`, que no se tocó).
- Pruebas nuevas: `4g` (`Sos` inicial y `sos` se marcan, `SOS` no), `4h` (`Contactá`, `Consultanos`, `Hacelo`, `Ponete`, `Probalo`, `Pedile`, `Sabé` y otros se marcan), `4i` (las formas de tú con tilde, `tomate`, `mandala` y las palabras en inglés no se marcan) y `4j` (desde el CLI, `Sos` inicial y `Contactá` bloquean producción). Sin el arreglo, `4g`, `4h` y `4j` fallan (3 fallos); con él pasan las 66.

**Comprobado contra el copy real:** `node scripts/check-copy.mjs` sobre `src/content/landing.es.yaml` no da ningún VOSEO nuevo (solo las 5 advertencias PENDING), y la producción sigue fallando únicamente por esas 5 (la prueba 9b lo exige). Las 489 formas se compararon con el diccionario inglés del sistema: quedan como coincidencias deliberadas `probate`, `decile`, `mirate`, `venite` y `generale`, más `unite`, `animate` y `registrate`, que ya estaban en la lista original. Se dejaron marcadas a propósito, porque un voseo colado es peor que un falso positivo raro con una palabra en inglés.

## Notas para el orquestador (iteración 2)

- Los tres Info (IN-01 a IN-03) quedaron fuera de alcance (`fix_scope: critical_warning`).
- Cada corrección tiene su propio commit atómico `fix(01): WR-NN ...` y ninguno incluye este informe.
- Los hashes son los de la rama final (`ac559ee`, `b7b41bd`, `0d97f0c`), aplicados con `cherry-pick` sobre `c5cbcde`. Los commits originales del worktree (`56c9e71`, `3a64321`, `7e3850f`) ya no son alcanzables porque la rama temporal se borró.
- Tras cualquier cambio de código hay que ejecutar `npx astro build` y reiniciar el preview antes de correr Playwright; `tests/global-setup.ts` falla si `dist` está viejo.

---

_Fixed: 2026-09-19T04:31:06Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 2_

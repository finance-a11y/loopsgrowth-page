---
phase: 02-secciones-marca-y-copy
plan: 07
subsystem: ui
tags: [astro, css, motion, prefers-reduced-motion, playwright, collage, tracer, copy-guard, tdd]
status: complete
plan_head_before: 17a0005ef4608b05080cbe7403b5fe059188f83a
commits: 7
completed_tasks: [1, 2, 3]
remaining_tasks: []
requirements-completed: [DSGN-05, DSGN-03, COPY-01]

actuals:
  tokens: 15679   # chars/4 sobre las lineas agregadas fuera de .planning (21 archivos)
  tasks: 3
  commits: 7      # medido: git rev-list --count 17a0005..d9b0f0d; incluye 2 commits de resumen parcial y no el de este resumen final

provides:
  - "src/styles/motion.css: @keyframes hc-enter (solo transform) y la regla `#inicio :is([data-piece], [data-piece-of])`, todo dentro de un unico @media (prefers-reduced-motion: no-preference); propiedades --hc-dur, --hc-step y --hc-end (1000ms)"
  - "src/styles/motion.css: @keyframes hc-look, --look (8px), --look-dx/--look-dy (0/-1 bajo 64em, -1/0 desde 64em) y .faq-icon-v con transicion de transform de --dur-1"
  - "tests/e2e/lib/motion.ts: MOTION_ALLOWLIST, motionSnapshot, expectNoMotion y expectMotionWithinBudget"
  - "tests/e2e/motion.spec.ts: bloques 'entrada del collage del hero', 'pupilas del hero' e 'icono del FAQ' (reduce, no-preference y sin JavaScript)"
  - "tests/guards/motion-budget.test.mjs: scanCss(files), readSources(dir) y las cuatro reglas del presupuesto de movimiento, 14 pruebas"
  - "scripts/lib/copy-rules.mjs: VERIFICAR_RE reconoce [VERIFICAR], [VERIFICAR rango] y [VERIFICAR: nota] (cierre opcional, saltos de linea y parentesis dentro)"
  - "tests/guards/copy.test.mjs pruebas 3b a 3e y tests/guards/fixtures/verificar-nota.yaml"
  - "tests/guards/phase2-static.test.mjs: scan(files) con cinco reglas de higiene (HTML en bruto, hex, outline, line-height !important, scripts), 13 pruebas"
  - "tests/e2e/phase-closing.spec.ts: bloque 'conexiones de fase' (favicon, sprite, collages, CTA); 02-08 lo extiende"
  - "tests/e2e/page-structure.spec.ts: H2_SOURCE, ids exactos de PAGE_ORDER, un h1 en #inicio y 11 h2 del YAML"
  - "src/layouts/BaseLayout.astro: enlaces a /favicon.svg y /favicon.ico en el head de cada pagina"

key-files:
  created:
    - src/styles/motion.css
    - tests/e2e/lib/motion.ts
    - tests/e2e/motion.spec.ts
    - tests/guards/motion-budget.test.mjs
    - tests/guards/fixtures/verificar-nota.yaml
    - tests/guards/phase2-static.test.mjs
    - tests/e2e/phase-closing.spec.ts
  modified:
    - scripts/lib/copy-rules.mjs
    - tests/guards/copy.test.mjs
    - src/components/SiteHeader.astro
    - src/layouts/BaseLayout.astro
    - src/components/sections/Faq.astro
    - src/styles/global.css
    - tests/e2e/a11y-base.spec.ts
    - tests/e2e/page-structure.spec.ts
    - tests/e2e/closing-sections.spec.ts
    - tests/e2e/sections-problem-solution.spec.ts
    - tests/e2e/results-cases.spec.ts
    - tests/e2e/team-includes-how.spec.ts
    - tests/e2e/collage-language.spec.ts
    - tests/e2e/collage-photos.spec.ts

key-decisions:
  - "El movimiento de la pagina es minimo y solo bajo no-preference: entrada del collage (600 ms, fin a 1000 ms), pupilas que miran al CTA y giro del icono del FAQ, todo solo con transform"
  - "VERIFICAR_RE = /\\[VERIFICAR[^\\]]*\\]?/gi: una marca sin cerrar tambien bloquea; el YAML real no traia ninguna en un text, no se convirtio ninguna marca"
  - "La guarda phase2-static ignora comentarios (bloque, HTML y lineas //) al contar HTML en bruto y <script>, porque una nota que menciona <script> no es codigo"
  - "El wrapper .wordmark del header se elimina (Logo queda hijo directo de .bar); medido antes y despues a 320, 390 y 1280 px: cajas identicas al decimo de pixel"

requirements: [DSGN-05, DSGN-03, COPY-01]
---

# Phase 2 Plan 07: Motion Summary

**Entrada del collage del hero con `hc-enter`, pupilas que miran al CTA y giro del icono del FAQ (todo solo con `transform` y solo con `no-preference`), la guarda VERIFICAR que ahora reconoce `[VERIFICAR: nota]`, y el cierre de fase: favicon, estructura de 12 secciones y 11 h2, y dos guardas estaticas que muerden.**

## Estado

| Tarea | Estado | Commit |
|-------|--------|--------|
| 1 Tracer del movimiento (entrada del collage + politica compartida + siete specs) | hecha | 298fab5 |
| 2 Pupilas, giro del icono del FAQ y guarda `motion-budget` | hecha | 39530e8 |
| 3 Regla VERIFICAR (TDD), limpieza de `.wordmark`, estructura y conexiones, guarda `phase2-static` | hecha | c349cdd, 4ad9940, d9b0f0d (correccion de una prueba de la tarea 2) |

## Resultados de la tarea 1

- Ganchos confirmados en el archivo y en el HTML construido: seis `[data-piece]` (stage i0 rFrom -8, panel i1 r2 rFrom 8, loopy i2 rFrom -10, pills i3 r-2 rFrom 6, doodles i4 rFrom 12, dots i5 rFrom -6), marco `[data-photo-frame]` con `data-piece-of="panel"` y los mismos `--i`, `--r`, `--r-from`, y dos `path.hc-pupil[data-pupil]` dentro de `[data-piece="loopy"]`. `--r` y `--r-from` vienen SIN unidad, asi que el CSS usa `calc(var(--r-from, 0) * 1deg)`.
- Pruebas: `motion.spec.ts` 11 pasan (5 fallaron antes del CSS). Los ocho specs de la tarea: 363 pasan, 55 skipped (opt-in de captura e informe). Guardas 176 pasan, 0 fallan.
- Peso: `dist/index.html` sin cambio en esa tarea, `outerHTML` del collage 5480 bytes (tope 8832), 0 `.js` en `dist`.
- `getAnimations()`: 0 con `reduce` en `/`, `/privacidad/` y `/marca/hoja/`; con `no-preference` solo `hc-enter` sobre las siete piezas mientras corre y 0 a los 2,5 s. h1, subtitulo y CTA sin animacion y con opacidad 1. Sin scroll horizontal a 320 px en los cuadros 0, 200, 400 y 700 ms. Con JavaScript desactivado el hero se ve.
- Tracer gate (interactivo, `end-of-phase`, `<verify>` automatizado): re-ejecutado de punta a punta, paso.

## Resultados de la tarea 2

- Skills re-invocadas en ese ejecutor: `impeccable` (animate) y `design-taste-frontend` (MOTION_INTENSITY 3). Lectura: movimiento minimo y motivado (la mirada dirige al CTA, el giro confirma el estado del acordeon), solo `transform`, sin `opacity`.
- Rojo primero: `motion.spec.ts -g "pupilas|icono del FAQ|sin JavaScript el clic"` dio 6 fallas y 5 pasaron (los 5 son comportamiento nativo ya existente: pupilas con `reduce`, muestreo del reloj, Enter/Espacio, icono con `reduce` y sin JavaScript). `motion-budget.test.mjs` en rojo: 13 pasan (las mutaciones muerden desde el primer dia) y 1 falla 'no se vio @keyframes hc-look'.
- Pupilas medidas con el navegador: a 390 px el CTA queda arriba de las pupilas y a 1280 px a la izquierda; por eso `--look-dx: 0; --look-dy: -1` como base y `-1 / 0` desde `min-width: 64em`. `--look` quedo en `8px` (con 4 el desplazamiento era imperceptible: 1 a 1,5 px).
- Icono del FAQ: la barra vertical y la horizontal miden igual, asi que la rotada cubre a la horizontal sin tocar el marcado. La transicion vive solo en `motion.css` (150 ms); con `reduce` no existe.
- Guarda `motion-budget`: lector de CSS con pila de preambulos; cuatro reglas; 14 pruebas (12 de mutacion o limpieza, 1 sobre el repositorio real con cero violaciones).

## Resultados de la tarea 3

**Rojo primero (VERIFICAR).** Con la `VERIFICAR_RE` heredada (`/\[VERIFICAR\]/gi`), `node --test tests/guards/copy.test.mjs` dio 50 pasan y 3 fallan: 3b (las formas con nota, con rango, en minusculas, con salto de linea y sin cierre), 3d (dos marcas daban una sola) y 3e (el fixture `verificar-nota.yaml` salia 0 en produccion). La 3c (lo que no es marca) pasa desde el inicio, como debe: es la prueba que impide ensanchar la expresion de mas. Despues del cambio: 194 pasan, 0 fallan.

**Regla.** `VERIFICAR_RE = /\[VERIFICAR[^\]]*\]?/gi`: corchete abierto, cualquier caracter salvo `]` (saltos de linea y parentesis incluidos) y cierre opcional. Lineal, sin cuantificadores anidados. No se toco `matchesOf` ni las otras reglas; el comentario de cabecera no describia la forma antigua y no cambio.

**YAML real en produccion.** `PUBLIC_ENV=production node scripts/check-copy.mjs --json`: `structural` vacio y `content` solo con `PENDING` y `MISSING`; cero VERIFICAR. Ninguna marca del doc de Ari hubo que convertir, asi que `landing.es.yaml` no cambio y `npm run pending` no cambio nada (`OK PENDING-COPY.md al dia, 61 pendientes`; `--check` sale 0).

**Aserciones de 02-03.** La 9b de `copy.test.mjs` y el bloque 'textos de Ari visibles' de `a11y-base.spec.ts` pasan sin editarse (JavaScript activado y desactivado). `copy.test.mjs` solo gana lineas.

**`.wordmark`.** Retirado de `SiteHeader.astro` (el contenedor, su regla CSS y la mencion del comentario) y de la prueba '(h)' de `a11y-base.spec.ts` (quedan skip 600; CTA, h1 y h2 700; subtitulo y body 400). La constante `tone` se conserva y `.brand-logo` se queda. `git grep -n -F ".wordmark" -- src tests` no devuelve nada (queda la palabra suelta en un comentario de `tokens.css`). Retirar el contenedor no cambia el header: se midieron `.site-header`, `.brand-logo`, su `svg` y `.header-cta` a 320, 390 y 1280 px antes y despues y las cajas son identicas, asi que no hizo falta re-invocar las skills de diseno ni comparar con `ai_a.png`.

**Favicon.** `BaseLayout.astro` agrega `<link rel="icon" href="/favicon.svg" type="image/svg+xml" />` y `<link rel="icon" href="/favicon.ico" sizes="any" />` tras el `<title>`; nada mas del layout cambio. `dist/index.html` paso de 71790 a 71843 bytes (14361 gzip; topes 81920 y 25600), 0 `.js`.

**Estructura.** `page-structure.spec.ts`: `main > section` son exactamente los 12 ids de `PAGE_ORDER` en orden y con su tono; un solo `h1`, dentro de `#inicio`; 11 `h2` cuyos textos, en orden, vienen del YAML por `H2_SOURCE` (`problem.title` a `agenda.title`, todas las claves existen tal cual) y resueltos con el `resolveText` del spec; cada `h2` vive en la seccion que su id nombra. Se conserva la prueba de saltos de nivel.

**Conexiones.** `tests/e2e/phase-closing.spec.ts`, en `/` y `/privacidad/`: dos enlaces de favicon con 200, `image/svg+xml` para el SVG, `image/x-icon` o `image/vnd.microsoft.icon` para el `.ico` y cuerpo no vacio; un solo `svg.collage-sprite` con 8 simbolos `lg-` y todo `use[href^="#"]` resuelto. En `/`: un `div[data-collage="hero"]`, uno `div[data-collage="agenda"]` dentro de `#agenda`, cuatro `svg[data-collage="avatar"]`, y cuatro `a[data-cta]` (header, hero, solucion, casos) con `href="#agenda"`, el texto de `cta.label_template` resuelto del YAML y sin `aria-label`.

**Guarda `phase2-static.test.mjs`.** Cinco reglas sobre `src/`: (1) sin `set:html`, `innerHTML` ni `dangerouslySetInnerHTML` (`RAW_HTML_ALLOW` vacia); (2) sin hex de color en los `.astro` de componentes, paginas y layouts (se ignoran los que siguen a `href=`, `url(` o `&`; no se escanean `.mjs` ni `src/assets`); (3) sin `outline` en `none` o `0` ni `outline-style: none`; (4) sin `line-height` con `!important`; (5) solo dos `<script` en `AgendaSection.astro` y `src/scripts` solo con `cta-focus.ts`. 13 pruebas: 11 de mutacion o limpieza con cadenas sinteticas (una hoja limpia sin falsos positivos, cada regla en ambos sentidos, comentarios ignorados, `RAW_HTML_ALLOW` con una ruta exenta) y la corrida real con cero violaciones. El repositorio real cumplio las cinco reglas sin cambiar codigo ni agregar excepciones.

**Verificacion final.**
- `node --test tests/guards/*.test.mjs`: 207 pasan, 0 fallan. `node scripts/check-contrast.mjs`: OK. `npx astro build`: OK.
- Suite completa de Playwright `--project=chromium` con `E2E_BLOCK_CLICKUP=1`: 481 pasan, 0 fallan, 95 skipped (los specs opt-in de captura e informe que ya existian; ninguno de `phase-closing`, `page-structure` en sus pruebas de estructura ni de `motion`). Los tres specs del `<verify>` de la tarea (`a11y-base`, `page-structure`, `phase-closing`): 73 pasan, 15 skipped opt-in.
- Servidor de preview detenido con `npx astro preview stop`; el `astro dev` del usuario (pid 86100) no se toco.

## Decisiones y observaciones de la tarea 1 (utiles para 02-08)

1. **Lightning CSS reescribe el CSS al construir**: `from` sale como `0%`, `rotate(0deg)` como `rotate(0)` y `transform-origin: center` como `50%`. La prueba de keyframes acepta `/rotate\(0(deg)?\)/` y `['100%','to']` para el ultimo cuadro.
2. **Los helpers `open()` de `collage-language.spec.ts` y `collage-photos.spec.ts` esperan a que `getAnimations()` valga 0** tras `goto`: sus pruebas de geometria fallaban porque median las piezas durante la entrada de 1 s. Ninguna otra asercion cambio. `collage-language` ademas fija `reducedMotion: 'reduce'` en la prueba de ganchos con `transform: none`.
3. **Prueba fragil ajena**: `collage-photos.spec.ts` 'sin JavaScript la foto se pinta' agoto 30 s una vez bajo carga de la corrida completa y paso sola y en las corridas siguientes; no depende de esta tarea.
4. **`closing-sections.spec.ts`**: 'cero animaciones en Para quien es y FAQ' usa `expectNoMotion` con `reduce` y `expectMotionWithinBudget` con `no-preference`.
5. **Lista blanca de movimiento** (`lib/motion.ts`) ya incluye `hc-look`, la `CSSTransition` de `transform` sobre `.faq-icon-v` y las transiciones de `.cta` y `.agenda-link`.
6. `motion.css` define `--hc-end` en `#inicio` (1000 ms) para el retraso de `hc-look`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug de prueba] `closing-sections.spec.ts`, tarea 2 (commit 39530e8):** la prueba de 02-06 'icono de 24 px: la barra vertical se ve cerrado y se oculta abierto' afirmaba `display: none` al abrir, justo lo que esta tarea reemplaza por diseno (giro de 90 grados). Se reescribio para afirmar lo nuevo. `--look` se subio de 4px a 8px (lo preve la propia tarea si resulta imperceptible).

**2. [Rule 1 - Prueba con condicion de carrera] `closing-sections.spec.ts`, tarea 3 (commit d9b0f0d):** la version de la tarea 2 de esa misma prueba esperaba solo `w > 0` tras el clic y median la barra a mitad de la transicion de 150 ms; la corrida completa bajo carga midio 8,8 px contra 9,6 requeridos. Ahora espera con `expect.poll` a que `w >= 2 * h` (transicion terminada) y luego afirma. Comprobado con `--repeat-each=3` y en la suite completa (481 pasan).

**3. Observacion, sin cambio de plan:** el `<fails_when>` de la tarea dice "una prueba de navegador queda en skip". Los 15 skipped de los tres specs (y los 95 de la suite) son los specs opt-in de captura de lote e informe que existian antes de este plan y que se activan con variables de entorno; ninguna prueba nueva de este plan queda en skip.

**4. Observacion, sin cambio de plan:** el `<verify>` y la verificacion piden `npm run pending`; se corrio y no produjo cambios porque ninguna marca `[VERIFICAR` estaba en un `text`. `git diff --name-only 17a0005..HEAD` fuera de `.planning` esta contenido en los `files_modified` de las tres tareas, mas `tests/e2e/closing-sections.spec.ts` (correccion 2, ya modificado por la tarea 2).

## Known Stubs

Ninguno.

## Threat Flags

Ninguno: no se agregaron endpoints, rutas de autenticacion ni acceso a archivos. Los dos enlaces de favicon apuntan a archivos estaticos propios de `public/`.

## Self-Check: PASSED

- FOUND: src/styles/motion.css, tests/e2e/lib/motion.ts, tests/e2e/motion.spec.ts, tests/guards/motion-budget.test.mjs, tests/guards/fixtures/verificar-nota.yaml, tests/guards/phase2-static.test.mjs, tests/e2e/phase-closing.spec.ts
- FOUND commits: 298fab5, 39530e8, c349cdd, 4ad9940, d9b0f0d
- `git grep -n -F ".wordmark" -- src tests`: sin resultados

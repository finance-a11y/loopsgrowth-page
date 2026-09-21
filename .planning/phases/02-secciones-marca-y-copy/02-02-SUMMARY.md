---
phase: 02-secciones-marca-y-copy
plan: 02
subsystem: ui
tags: [astro, svg, brand, logo, favicon, collage, sprite, avatars, accessibility, playwright]
status: complete
plan_head_before: f67e91dbca11fe4dcddf1d891dc6c25e38131326

requires:
  - phase: 02-01
    provides: tokens.css con cuatro tonos y --collage-stroke, SectionShell, HeroCollage, guardas de contraste
provides:
  - "Logo horizontal del vectorial de Ari como SVG en línea en el header, con nombre accesible del YAML, sin enlace en / y área de salvado --logo-clear (1 X)"
  - "Isotipo Loopy (mesa 13) y favicon.svg y favicon.ico de 16, 32 y 48 px"
  - "collage-rules.mjs con ALLOWED_FILLS, PIECES y assertToneSafe (rompe el build con un color prohibido para el tono)"
  - "CollageSprite con 15 símbolos cs-* montado una vez en SiteHeader y CollagePiece con validación de tono"
  - "AgendaCollage 480x480 sobre purple (oculto bajo 64em) y cuatro Avatar Loopy 120x120"
  - "Hoja de revisión /marca/hoja/ solo fuera de producción, con identidad, primitivas por tono, composiciones y avatares"
  - "brand-assets.spec.ts (44 pruebas de navegador) y brand-assets.test.mjs (14 guardas con mutación)"
affects: [02-03, 02-04, 02-05, 02-06, 02-07, 02-08]

requirements-completed: [DSGN-01, DSGN-02, DSGN-04]

commits: 4
actuals:
  tokens: 17500
  tasks: 4
  commits: 4

tech-stack:
  added: []
  patterns:
    - "SVG de src/assets/brand se importa como componente de Astro (Astro 7 lo soporta sin configuración) y recibe role, aria-label y focusable por props"
    - "Un sprite inline con símbolos cs-*; las piezas lo invocan con <use href> y los rellenos leen --cf-a, --cf-b y --cf-c, que atraviesan el <use>"
    - "La política de color por tono vive en una tabla (ALLOWED_FILLS) que valida el build y una guarda independiente que la contradice con pares prohibidos escritos a mano"
    - "Regla de tono sobre el logo con :global([data-tone]) como ancestro; :where(...) con selectores de atributo se pierde en el CSS con alcance de Astro"

key-files:
  created:
    - src/assets/brand/logo-horizontal.svg
    - src/assets/brand/isotipo.svg
    - src/components/brand/Logo.astro
    - src/components/collage/collage-rules.mjs
    - src/components/collage/CollageSprite.astro
    - src/components/collage/CollagePiece.astro
    - src/components/collage/AgendaCollage.astro
    - src/components/collage/Avatar.astro
    - src/pages/marca/[sheet].astro
    - tests/e2e/brand-assets.spec.ts
    - tests/guards/brand-assets.test.mjs
  modified:
    - src/components/SiteHeader.astro
    - public/favicon.svg
    - public/favicon.ico

key-decisions:
  - "Área de salvado --logo-clear = 1 X (X igual a la altura del logo o isotipo, BrandBook página 7), como zona de exclusión y no como relleno visible."
  - "Logo horizontal en 32 px en móvil y 40 px desde 640 px: el header no cambia de altura porque el CTA ya mide 44 px."
  - "El logo se entrega con los colores del archivo de Ari (#4228d1 y demás), no con el #73187f de tokens.css; queda como decisión para Ari y Juan."
  - "El sprite se monta en SiteHeader porque BaseLayout es de 02-01; mover esa línea a BaseLayout después es trivial."
  - "El loop de las primitivas son dos anillos rellenos que se solapan y no anillos concéntricos, porque los concéntricos con punto central se leían como diana."

coverage:
  - id: D1
    description: "Logo horizontal accesible en el header (role img, nombre del YAML, sin enlace en /, 32 px o más) con área de salvado libre a 320, 640, 768 y 1280 px"
    requirement: "DSGN-02"
    verification:
      - kind: e2e
        ref: "tests/e2e/brand-assets.spec.ts (logo horizontal en el header, casos a a e)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Isotipo Loopy y favicon (svg cuadrado, ico de 16, 32 y 48 px) tomados del vectorial de Ari; la hoja no se genera con PUBLIC_ENV=production"
    requirement: "DSGN-02"
    verification:
      - kind: e2e
        ref: "tests/e2e/brand-assets.spec.ts (hoja de revisión: identidad; favicon); build directo con PUBLIC_ENV=production sin dist/marca"
        status: pass
    human_judgment: true
  - id: D3
    description: "Sprite de 15 símbolos y CollagePiece con validación de tono en el build; contorno de 3 px, oscuro en light y yellow y blanco en dark y purple; cero animaciones con ambas preferencias"
    requirement: "DSGN-01"
    verification:
      - kind: unit
        ref: "node --test tests/guards/brand-assets.test.mjs (88 guardas en total, mutación incluida)"
        status: pass
      - kind: e2e
        ref: "tests/e2e/brand-assets.spec.ts (primitivas del collage)"
        status: pass
    human_judgment: false
  - id: D4
    description: "AgendaCollage oculto bajo 1024 px, dentro de su viewBox con 4 px de margen y dentro de presupuesto; cuatro avatares con variantes distintas y mismo tamaño"
    requirement: "DSGN-01"
    verification:
      - kind: e2e
        ref: "tests/e2e/brand-assets.spec.ts (composiciones y avatares)"
        status: pass
    human_judgment: false
  - id: D5
    description: "Lote 0 pasado por impeccable y design-taste-frontend, con capturas y crítica registradas; avatares como set uniforme sobre círculos suaves (punto 5 de la vibra)"
    requirement: "DSGN-04"
    verification:
      - kind: e2e
        ref: "capturas test-results/phase2/lote0-{logo,marca,collage-primitivas,composiciones}-*.png (no versionadas)"
        status: pass
    human_judgment: true
---

# Phase 2 Plan 02: Activos de marca y collage Summary

**Logo horizontal e isotipo Loopy tomados del vectorial de Ari (con área de salvado de 1 X y favicon de tres tallas), más un sprite de 15 piezas de collage con validación de tono en el build, `AgendaCollage`, cuatro avatares y una hoja de revisión `/marca/hoja/` que solo existe fuera de producción.**

## Hecho

### Tarea 1 (tracer): commit `b8d3522`

- Fuente: `LOGO_LOOPSGRWOTH.ai` y el BrandBook del Drive público de Ari, bajados a un directorio temporal (no se versionan). La mesa 6 se convirtió con `pdftocairo -svg` y se limpió con SVGO (las 11 rutas quedaron en 4, un solo relleno). El `viewBox` se recortó a la caja real del arte medida en Chromium (712.6 x 125.21) y el color subió a la raíz, único lugar con el hex del logo. Pesa 3568 bytes, sin `width` ni `height`.
- `Logo.astro`: SVG importado como componente de Astro, `role="img"`, `aria-label={name}`, `focusable="false"`, sin `aria-hidden`; enlace solo si hay `href`. Variables `--logo-min`, `--logo-h` y `--logo-clear` (X del BrandBook, página 7) con alturas mínimas por `max()`.
- `SiteHeader.astro`: el logo dentro de `.wordmark` (se conserva la clase para que la aserción (h) de `a11y-base` siga en verde), sin enlace en `/` y con enlace a `/` en otras rutas.
- `brand-assets.spec.ts`: nombre esperado leído del YAML, área de salvado medida con una sonda sobre `--logo-clear`, sin scroll horizontal, sin JavaScript.

### Tarea 2: commit `76d1b2a`

- `isotipo.svg` de la mesa 13 (10 rutas, exactamente 4 rellenos: #4228d1, #6c61db, #f4f3e0, #1e1e1e; 2426 bytes) y variante `isotipo` en `Logo.astro` (24 px mínimo).
- `public/favicon.svg` (isotipo con `viewBox` cuadrado de 586.46 y margen de 4 % por lado) y `public/favicon.ico` con tres PNG de 16, 32 y 48 px (4343 bytes) generados con Chromium y empaquetados con un script local de una sola vez.
- `/marca/hoja/`: `getStaticPaths` vacío con `PUBLIC_ENV=production` (comprobado con build directo: no existe `dist/marca`), `noindex` por BaseLayout, rótulos solo con ids de pieza.
- Corrección de un defecto propio: Astro descartó el `:where(...)` de la regla de tono del logo, así que se reescribió con `:global([data-tone])` como ancestro; el logo pasa a blanco sobre dark y purple.

### Tarea 3: commit `2f557e2`

- `collage-rules.mjs` (ESM con JSDoc): `TONES`, `BRAND_COLORS`, `fillVar`, `ALLOWED_FILLS`, `PIECES` y `assertToneSafe`, que lanza un Error en español con pieza, tono y color.
- `CollageSprite.astro`: 15 símbolos `cs-*`, fuera de flujo, `aria-hidden`, sin `display: none`, montado una vez en `SiteHeader`. Contorno de 3 px de pantalla por `vector-effect: non-scaling-stroke` desde `--collage-stroke`; los rellenos leen `--cf-a`, `--cf-b` y `--cf-c`, que atraviesan el `<use>` (verificado en las capturas y por prueba).
- `CollagePiece.astro`: `name`, `tone`, `a`, `b`, `c`, `size`, `rotate`, `class`; emite `svg[data-collage][data-collage-piece][data-collage-tone]`.
- `brand-assets.test.mjs`: política de pares prohibidos escrita aparte de la tabla, mutación de la tabla y de cada regla del detector, símbolos contra `PIECES` con sus `viewBox`, lista `OWNED` explícita, y comprobaciones sobre `dist`.

### Tarea 4: commit `c425494`

- `AgendaCollage.astro`: 480x480, tono purple, siete piezas del sprite colocadas con `<use>` (puntos, loop, lupa, ojos a la derecha, clic y dos destellos), oculto bajo 64em.
- `Avatar.astro`: `lupa`, `auriculares`, `gafas` y `gorro`; círculo de fondo con el color dominante, cabeza blanca con contorno, los mismos ojos en la misma posición y un accesorio distinto. No son retratos.
- La hoja suma la composición sobre purple y los avatares en una tarjeta blanca con borde de 3 px sobre yellow. `AgendaCollage` y `Avatar` entran en `OWNED` y se les exige `assertToneSafe`.

## Verificación (todo verde)

- `node --test tests/guards/*.test.mjs`: 88 pruebas, 0 fallos (74 previas más 14 nuevas). `node scripts/check-contrast.mjs`: 11/11 aprobados. `node scripts/list-pending.mjs --check`: sale 0.
- `E2E_BLOCK_CLICKUP=1 npx playwright test --project=chromium`: 120 pasan, 15 omitidas (las capturas por lote de 02-01). Incluye `a11y-base`, `cta-focus` y `page-structure` sin editarlos.
- `npm run build` con sus hooks sale 0. Con `PUBLIC_ENV=production PUBLIC_SITE_URL=https://example.com` el build directo no genera `dist/marca`; en modo normal existe `dist/marca/hoja/index.html`.
- Barridos: sin construcciones prohibidas en los archivos propios, sin hex en `src/components` ni `src/pages`, ninguna referencia a `HeroCollage` en archivos de este plan, y `git diff` de los archivos de 02-01 vacío.
- Preview detenido al terminar cada tarea; sin servidores propios abiertos (el `astro dev` del usuario no se tocó).

## Pesos medidos (HTML construido)

| Elemento | Medido | Tope |
|----------|-------:|-----:|
| Sprite | 5568 bytes | 10240 |
| AgendaCollage | 1027 bytes | 4096 |
| Avatares | 769, 797, 875 y 917 bytes | 2560 cada uno |
| Colección de la hoja (sprite, agenda, avatares y una instancia de cada pieza) | 15568 bytes | 28672 |
| `dist/index.html` | 25656 bytes | 61440 |
| Logo horizontal, isotipo, favicon.svg | 3568, 2426 y 2426 bytes | 5120, 4096 y 3072 |
| `favicon.ico` | 4343 bytes (3 imágenes) | mayor a 655 |

## Registro visual, lote 0 (marca y collage)

Skills invocadas con la herramienta Skill en la tarea 1: `design-taste-frontend` (lectura: landing de captación B2B para dueños de e-commerce, lenguaje collage pop de marca, accesibilidad por encima de la estética; diales 7/3/4) e `impeccable` (verbos `shape` y `adapt` sobre el header; en las tareas 2 a 4 se aplicaron `shape`, `colorize` y `polish` en el mismo criterio, sin volver a cargar las skills). Sin `init` ni `document` (los hizo 02-01).

**Ronda 1, header (tarea 1).** Capturas `lote0-logo-320.png` y `lote0-logo-1280.png`. Hallazgos: (a) el logo de 32 px pesa poco al lado del h1 de 64 px y del CTA; (b) el logo quedaba pegado arriba frente al CTA porque el contenedor `.wordmark` heredaba una caja de línea de 24 px. Correcciones en un solo lote: 40 px desde 640 px (el header no cambia de altura, el CTA ya mide 44 px) y `.wordmark` como `flex` con centrado. Confirmación: logo centrado con el CTA a 1280 px; a 320 px se mantiene en 32 px.

**Ronda 2, identidad (tarea 2).** Capturas `lote0-marca-{320,390,768,1024,1280}.png`. `colorize` sobre los cuatro colores entregados, contrastes medidos: #4228d1 sobre blanco 8.55, sobre amarillo 5.43, sobre #212121 1.88 (falla: por eso el logo pasa a blanco sobre dark y purple) y sobre #73187f 1.13. El isotipo sobre dark se ve gracias al anillo crema y al iris, pero sus aros #4228d1 tienen 1.88 contra el fondo: no se debe usar sobre oscuro sin la variante de la mesa 17 del `.ai`. Favicon a 16 px (ampliado): los dos ojos y el mango se leen como formas separadas, pero el isotipo es apaisado (1.64:1) y ocupa poco alto del cuadrado; ver decisiones para Ari.

**Ronda 3, primitivas (tarea 3).** Capturas `lote0-collage-primitivas-{320,390,768,1024,1280}.png`. Hallazgo de fondo: el `loop` de anillos concéntricos con punto central se leía como diana (la misma lección del hero en 02-01). Corrección: dos anillos rellenos que se solapan (regla evenodd con contorno), sin punto central. También se igualó la altura de las celdas de la hoja para alinear los rótulos. Las variables `--cf-a`, `--cf-b` y `--cf-c` y `--collage-stroke` atraviesan el `<use>`: la misma lupa sale amarilla, blanca y naranja según el tono y con contorno oscuro o blanco. Confirmación: sin hallazgos nuevos.

**Ronda 4, composiciones (tarea 4).** Capturas `lote0-composiciones-{320,390,768,1024,1280}.png`. Hallazgos: en `AgendaCollage` el clic caía sobre los aros del loop y el loop tapaba el mango de la lupa. Corrección en un solo lote: loop detrás y a la derecha de la lupa, ojos arriba mirando a la derecha y clic debajo del loop. Confirmación: la lupa manda, cada pieza se ve completa y el trazo blanco de 3 px coincide con las primitivas; el clic queda cerca del lente pero no lo apunta con exactitud (se dejó así para no entrar en una tercera ronda). Punto 5 de la lista de vibra: los cuatro avatares se leen como set uniforme sobre círculos suaves, con los mismos ojos y proporciones. Punto 7: `AgendaCollage` es un elemento de collage propio de `#agenda` con el mismo trazo pop.

## Hallazgo de colores del logo (para Ari y Juan)

Los colores del vectorial de Ari (#4228d1 principal, #6c61db iris, #f4f3e0 crema, #1e1e1e pupila) no coinciden con el morado #73187f que dice el texto del BrandBook y que usa `tokens.css`; la propia muestra del BrandBook se dibuja en #4228d1. El logo se entregó con los colores del archivo. Si Ari confirma que el morado correcto es el azul violeta, cambia el morado de toda la fase (tokens y pares de contraste); si el correcto es #73187f, alinear el logo es editar los fills de `logo-horizontal.svg`, `isotipo.svg` y `favicon.svg`.

## Decisiones para Ari

1. Colores del logo (arriba).
2. Set de avatares Loopy (lupa, auriculares, gafas, gorro): el set lo aprueba Ari en la hoja; la asignación persona a variante la decide 02-05 (sugerida: Arianna con lupa).
3. Favicon: se usó el isotipo de dos ojos con lupa. A 16 px se lee pero es pequeño; la alternativa es la mesa 18 del `.ai` (un ojo con lupa, paso 3 del BrandBook, página 6) solo para el favicon.

## Deviations from Plan

**1. [Rule 1 - Bug] Regla de tono del logo perdida por el CSS con alcance de Astro**
- **Found during:** Tarea 2
- **Issue:** `:where([data-tone='dark'], ...) .brand-logo[...]` salió del build sin el `:where`, así que el logo dejaba de ser blanco sobre dark; la prueba del relleno computado lo detectó.
- **Fix:** selector con `:global([data-tone='dark'])` y `:global([data-tone='purple'])` como ancestros.
- **Files modified:** `src/components/brand/Logo.astro`
- **Commit:** `76d1b2a`

**2. [Rule 1 - Bug] Logo alineado arriba en el header**
- **Found during:** Tarea 1 (crítica visual)
- **Issue:** la caja de línea heredada de `.wordmark` dejaba el logo por encima del centro del CTA.
- **Fix:** `.wordmark` como `display: flex; align-items: center` (conserva la clase y el peso 700).
- **Files modified:** `src/components/SiteHeader.astro`
- **Commit:** `b8d3522`

**3. [Diseño, dentro de polish] Altura del logo de 40 px desde 640 px**
- La suposición 6 del plan fijaba 32 px en todos los anchos; el plan dice que un ajuste de tamaño en escritorio es trabajo de `polish`. El header no cambia de altura (el CTA mide 44 px) y `--logo-clear` sigue siendo el alto efectivo.

**4. [Diseño, dentro de la crítica visual] `loop` como dos anillos solapados**
- El plan pedía anillos concéntricos con evenodd; con punto central se leían como diana. Se mantuvo el relleno con evenodd y contorno, pero desplazando dos anillos.

**5. [Simplificación] Sin respaldo de tonos en la hoja**
- El plan preveía un respaldo con `:where([data-tone])` porque 02-01 corría en paralelo. Los tonos `yellow` y `dark` ya estaban fusionados, así que la hoja usa los tokens reales.

**6. [Proceso] Las capturas se regeneraron al final**
- `npx playwright test` borra `test-results/` en cada corrida. Las capturas de `test-results/phase2/` (17 archivos, no versionadas) se regeneraron con la hoja completa tras la última corrida de pruebas; las de cada ronda se vieron en su momento.

**Total deviations:** 2 auto-fixed (Rule 1), 4 de diseño o proceso. **Impact:** ninguno sobre alcance ni contratos.

## Known Stubs

Ninguno. Todo el collage es decorativo por diseño y el logo, isotipo y favicon salen del vectorial de Ari.

## Threat Flags

Ninguno nuevo. Aplicadas: T-02-02-01 (SVG limpios sin script, image, foreignObject, xlink, `on*` ni metadatos, verificado por barrido), T-02-02-02 (sin `set:html` ni hex en componentes, guarda con mutación), T-02-02-03 (hoja vacía en producción, verificado con build directo), T-02-02-04 (SVGO quitó los metadatos; el `.ai` y el PDF no se versionan), T-02-02-05 (pesos medidos arriba) y T-02-02-06 (todo en línea y local; las pruebas corrieron con ClickUp bloqueado).

## Pendientes para otros planes

- `AgendaCollage` en `AgendaSection` (02-06), avatares en `TeamCard` (02-05), pegatinas y chips en `PainCard` y `PillarCard` (02-03), `loop` como conector de fases (02-05).
- En `/privacidad` el logo pasa a ser un enlace y suma una parada de teclado: 02-06 debe actualizar su prueba de orden de tabulación.
- Enlazar `favicon.svg` con un `<link rel="icon" type="image/svg+xml">` en el head y, si se quiere, mover el sprite de `SiteHeader` a `BaseLayout`: quien edite `BaseLayout` (02-07). Hoy el navegador toma `/favicon.ico` por convención.
- La aserción (h) de `a11y-base` sobre el peso del wordmark queda obsoleta (el wordmark ahora es un SVG); 02-07 puede retirarla.
- 02-07 consolida este registro visual en `02-VISUAL-LOG.md`.

## Self-Check: PASSED

- FOUND: los 11 archivos creados y los 3 modificados listados en el frontmatter (incluidos favicon.svg y favicon.ico).
- FOUND: commits b8d3522, 76d1b2a, 2f557e2 y c425494; `git rev-list --count f67e91d..HEAD` = 4 antes de este commit del SUMMARY.

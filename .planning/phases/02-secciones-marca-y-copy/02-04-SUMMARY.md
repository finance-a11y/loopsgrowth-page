---
phase: 02-secciones-marca-y-copy
plan: 04
subsystem: ui
tags: [astro, copy, yaml, playwright, results, cases, cards, collage]
status: complete
plan_head_before: 235ffbd1353c71a17e575be24ad8fc9ad53589c6
# commits es el conteo medido del libro (git rev-list --count plan_head_before..HEAD) al escribir este resumen,
# antes de los commits de cierre (este resumen y el de estado y hoja de ruta). Los cinco son de este plan.
commits: 5
tasks_done: [1, 2, 3]
tasks_pending: []
requirements-completed: [CONT-05, CONT-06, COPY-01, DSGN-04]

requires:
  - phase: 02-secciones-marca-y-copy
    provides: "Planes 01 a 03, 09, 10 y 11 (tonos, SectionShell, CtaLink, CollagePiece oficial, brand.ts con PURPLE_RGB)"
provides:
  - "Clave results en el YAML y su esquema estricto de cuatro ítems; ResultItem y Results (#resultados, tono dark, 2x2 desde 640 px)"
  - "Clave cases en el YAML (titular, tres etiquetas y cinco casos) y su esquema con .length(5) y detail opcional"
  - "MetricCard (artículo con h3 de cifra y métrica, chip de canal, detalle opcional y dl de Sector, Plazo y Canal) y Cases (#casos, tono light, rejilla 1, 2 y 3 columnas con la quinta ancha)"
  - "Lupa oficial (CollagePiece, esquema A) solo en la quinta tarjeta y CTA casos, montada tras Results; cta:casos en el orden de tabulación"
  - "results-cases.spec.ts con el bloque de resultados, el de casos (g a o) y el del lote C1 (p a v): mediciones a cinco anchos y capturas por sección"
  - "Lote C1 visual cerrado: 25 capturas, crítica con impeccable y design-taste-frontend, una ronda de corrección y una de confirmación en 02-VISUAL-LOG.md"
affects: [02-05, 02-06, 02-07, 02-08]

actuals:
  tokens: 13200   # chars/4 sobre las líneas añadidas en src, tests y PENDING-COPY.md entre 235ffbd y HEAD (52886 caracteres)
  tasks: 3
  commits: 5

key-files:
  created:
    - src/components/ui/ResultItem.astro
    - src/components/sections/Results.astro
    - src/components/ui/MetricCard.astro
    - src/components/sections/Cases.astro
    - tests/e2e/results-cases.spec.ts
  modified:
    - src/content.config.ts
    - src/content/landing.es.yaml
    - src/pages/index.astro
    - PENDING-COPY.md
    - tests/e2e/a11y-base.spec.ts
    - tests/e2e/collage-language.spec.ts
    - .planning/phases/02-secciones-marca-y-copy/02-VISUAL-LOG.md
---

# Phase 2 Plan 04: Lo que logramos juntos y Casos de éxito Summary

**`#resultados` con los cuatro resultados del doc de Ari (tono dark, 2x2) y `#casos` con cinco tarjetas de métrica (cifra morada con marcador amarillo, chip, dl de Sector, Plazo y Canal), la tarjeta ancha de Meta Ads con la única lupa oficial y el CTA `casos` en el orden de tabulación; verificado de 320 a 1280 px y cerrado con el ciclo visual del lote C1.**

## Estado del plan

Las tres tareas están hechas y en verde. El plan se ejecutó en tres tramos: la tarea 1 (tracer), la tarea 2 (casos) y la tarea 3 (ciclo visual del lote C1) por ejecutores distintos por presupuesto de contexto.

### Tarea 1, commit `d4def27` (tracer, Lo que logramos juntos)

- **YAML `results`** con las 9 afirmaciones del doc, sección 4. `verified` para el titular y los resultados 3 y 4; `pending` con `reason` para el cuerpo del resultado 1 (inferencia "el orgánico se abarata"), el lead del 2 y el cuerpo del 2, que muestra FALTA CONFIRMAR (el rango de presupuesto de ads no se publica; la frase del doc con su marca de verificación vive solo en `reason`). La nota de Ari sobre la fusión de outcomes no se guarda ni se muestra.
- **`ResultItem` y `Results`**: `li.result-item` con borde de 3 px amarillo, disco de check de 32 px en línea, lead 600 y cuerpo 400 en blanco sobre `dark`; rejilla de una columna y 2x2 desde 40 em con alturas parejas.

### Tarea 2, commit `48fc303` (Casos de éxito)

- **Pruebas primero (rojo):** el bloque (g) a (o) de `results-cases.spec.ts` fallaba antes de existir el YAML y los componentes (`es.cases` indefinido). Cubren: sección, tono, fondo blanco y h2 morado; cinco `article` con h3 que es la frase completa del doc y da nombre a la tarjeta; chip, `dl` con las tres etiquetas del YAML, ningún `dd` vacío y `.metric-detail` solo si el YAML trae `detail`; cifra morada con marcador amarillo; rejilla por rectángulos a 390, 640, 768, 1024 y 1280 px; una sola lupa de 96 px dentro de la quinta tarjeta sin cruzar chip, nombre, detalle ni `dl`; CTA `casos` (`href="#agenda"`, etiqueta del YAML resuelta, sin `aria-label`, 48 px o más de alto, 48 px bajo la rejilla, foco en `#agenda-title` tras el clic); tarjetas sin enfocables, sin cursor de puntero y sin cambio de `transform` ni `box-shadow` con hover; HTML menor a 61440 bytes.
- **YAML `cases`:** `title` ("Casos de exito", `pending`), `labels` (Sector, Plazo y Canal, `verified`) y cinco casos con el texto del doc carácter por carácter. Cifra, métrica, detalle y sector de los casos 1 a 4 `verified`; plazos `pending` ("6 meses" y "12 meses" salen del detalle del doc); canal de los casos 1 a 4 con FALTA CONFIRMAR; caso 5 con `figure` `verified` y `metric`, `sector`, `channel` ("Meta Ads") `pending`, plazo FALTA CONFIRMAR y sin `detail` (el doc no trae línea de detalle).
- **Recuento con producción:** `results.` 3 PENDING y 1 MISSING; `cases.` 13 PENDING y 5 MISSING (16 y 6 en total), 0 estructurales y ninguna regla distinta de PENDING o MISSING. `PENDING-COPY.md` pasa de 14 a 27 pendientes.
- **`MetricCard`, `Cases`, página y tabulación:** `article.metric-card` con `aria-labelledby`, chip, `h3` con `.metric-figure` (Display 700, morado, `.metric-mark` con relleno plano) y `.metric-name`, `dl` con tres filas, sin hover ni enfocables; `Cases` con `ul[role="list"]`, el índice 4 con `data-wide` y `CtaLink location="casos"`; `index.astro` monta `<Cases />` tras `<Results />` y `a11y-base.spec.ts` suma `'cta:casos'` tras `'cta:solucion'`.

### Tarea 3, commit `acb8787` (ciclo visual del lote C1)

- **Pruebas (p) a (v) primero.** `results-cases.spec.ts` suma: (p) sin scroll horizontal y rectángulos de secciones y `li` dentro de `[0, innerWidth]` a 320, 390, 768, 1024 y 1280 px; (q) a 320 y 1280 px la cifra "+3.808%" y cada `dd` con el relleno dentro de su tarjeta y sin desborde; (r) padding vertical de 64 px a 390 px y 96 px a 1024 y 1280 px; (s) sin JavaScript, todos los textos del YAML y el CTA `casos` con `href="#agenda"`; (t) espaciado de texto forzado de SC 1.4.12 a 320 y 1280 px sin desborde ni texto fuera de su tarjeta; (u) la cifra es lo más grande de cada tarjeta (mayor que nombre, detalle, `dt`, `dd` y chip), en `PURPLE_RGB` y con marcador amarillo; (v) capturas por sección solo con `PHASE2_BATCH`. **Ninguna falló antes de iterar** (pasaron con la construcción de las tareas 1 y 2 y quedan como regresión); (r) y (u) se definen solo en los anchos que miden, sin `skip`.
- **Capturas con `PHASE2_BATCH=C1`:** 25 archivos (15 de página completa: cinco anchos por base, `-reduce` y `-nojs`, y 10 por sección) en `test-results/phase2/` (no versionadas).
- **Crítica** con `impeccable` (`critique` con `layout`, `typeset`, `colorize` y `adapt` como lente, sin `animate`) y `design-taste-frontend` (diales 7, 3 y 4) por la herramienta Skill, contra el moodboard y `ai_a.png` (Read). Degradada a un solo contexto porque la sesión no expone sub agentes.
- **Corrección (un solo lote, solo estilo local de `MetricCard`):** (1) defecto real: el chip "Meta Ads" de la tarjeta ancha se estiraba a todo el ancho de su columna al ser elemento de rejilla (`justify-self: start`); (2) punto señalado por el ejecutor anterior: la lupa como elemento de la fila del chip dejaba unos 67 px de hueco bajo el chip. **No se revirtió a `position: absolute`** (se perdería el no cruce por construcción): el chip se centra frente a la lupa (fila de cabecera) y, desde 40 em, las filas pasan a `auto auto 1fr` con la cifra y el `dl` anclados abajo. Ningún texto, token, componente de otro plan ni esquema cambió.
- **Ronda de confirmación (1 de 1):** a 320 y 390 px la cabecera es chip más lupa sin hueco; a 1280 px el chip ya no se estira y la composición es diagonal. **Observación abierta:** a 1280 px la tarjeta ancha se estira a la altura de la cuarta y queda un vacío de unos 180 px entre la cabecera y la cifra; se lee como aire intencional y se deja. Ari puede llenarlo con una línea de detalle del caso 5.
- **Lupa frente a la cifra (320 y 1280 px):** no cruza glifos ni el `dl`; a 320 px comparte fila con el chip, a 1280 px queda en la esquina superior derecha lejos de la cifra. El arte oficial no se recolorea ni se redibuja.
- **Lista de vibra (numeración del plan):** rasgos 2 (aire de 96 px, medido por (r)), 3 (borde de 3 px y sombra dura sin sombras difusas en Casos; borde amarillo sin sombra en Lo que logramos juntos por contrato), 4 (cifra dominante con marcador amarillo, medido por (u)) y 7 (2x2 con discos sobre `dark` y rejilla con tarjeta ancha y lupa sobre `light`) cumplidos. Detalle en `02-VISUAL-LOG.md`, "Lote C1, ronda 1".

## Verificación final

- `npm run test:e2e:isolated` (ClickUp bloqueado): **324 pasan, 70 omitidas** (capturas sin `PHASE2_BATCH` y variantes), 0 fallos.
- `PHASE2_BATCH=C1` con `page-structure.spec.ts` y `results-cases.spec.ts` (`-g captura`): 20 pasan; `ls test-results/phase2/C1-*.png | wc -l` devuelve 25.
- `npm run build` pasa; `node --test tests/guards/*.test.mjs`: 162 de 162; `node scripts/check-contrast.mjs`: 14 de 14 pares; `node scripts/list-pending.mjs --check` sale 0 (27 pendientes, sin diferencia en `PENDING-COPY.md`); recuento de `check-copy` con producción: 3 PENDING y 1 MISSING en `results.`, 13 PENDING y 5 MISSING en `cases.`, 0 estructurales.
- Barridos: `set:html` 0, hex en `src/components` y `src/pages` 0, `outline: none` 0, `height:` fijo en los cuatro archivos 0.
- **Criterio BASE2 (`48fc303`)** (`git diff --name-only` sobre el YAML, el esquema, `PENDING-COPY.md`, estilos, collage, marca, `SectionShell` y `CtaLink`): lista vacía; ninguna corrección tocó copy ni esquema.
- **Criterio BASE (`235ffbd`)**: el único archivo fuera de la lista del plan es `tests/e2e/collage-language.spec.ts`, documentado en "Deviations".
- **Peso de `dist/index.html`: 48310 bytes** (la corrección de la tarea 3 solo cambió CSS local, sin efecto medible en el HTML). Tope global de 61440: quedan 13130 bytes para los planes 05 a 08. Ningún tope se subió ni se bajó.
- Servidores: el `astro preview` se detuvo con `npx astro preview stop`; el `astro dev` del usuario (pid 86100) no se tocó.

## Hallazgos para Ari

1. **Rango de presupuesto de ads** ("entre 30% y 50%", `[VERIFICAR rango]`): sin respaldo propio; la página no lo publica y muestra FALTA CONFIRMAR. Ari aporta el dato con su fuente o decide otro texto.
2. **Resultado 2, lead** ("Dependes menos de los ads."): se muestra tal cual pero queda pending, porque resume el resultado cuyo dato falta.
3. **Inferencia "el orgánico se abarata"** y "una fracción" (resultado 1, COPY-VERIFICATION 3d): se muestran tal cual y quedan pending.
4. **Lenguaje de promesa:** "Apareces donde antes no estabas." promete visibilidad. Solo se reporta; no se reescribe (hallazgo 7 del UI-SPEC).
5. **Canal de los casos 1 a 4:** el doc no lo nombra; el chip y el dato de Canal muestran FALTA CONFIRMAR en las cuatro tarjetas. Ari lo entrega por caso (en el caso 3 el detalle dice "tráfico orgánico", pero eso no dice el canal del caso).
6. **Plazo del caso 5:** el doc no lo da; muestra FALTA CONFIRMAR.
7. **Plazos de los casos 1 a 4** ("6 meses" y "12 meses"): salen del detalle de cada caso; el UI-SPEC pide que Ari confirme los cinco.
8. **Caso 5 (Meta Ads):** el doc trae una sola frase ("marca personal referente en Meta Ads"), sin línea de detalle y sin punto final. La página la muestra completa como sector y toma "Meta Ads" como canal; la métrica "en crecimiento de trafico organico" habla de tráfico orgánico en un caso de Meta Ads, y no encaja con el resto (SEO/GEO). Ari confirma cómo se divide la frase y si el caso va. Si aporta una línea de detalle, ocupa el vacío de la tarjeta ancha a 1280 px.
9. **Titular de casos:** el doc no trae titular para la sección 5; se usó su rótulo, "Casos de exito", con la errata.
10. **Cifras sin signo de moneda:** "$41K a $76K" se muestra tal cual; no se agregó ninguna moneda.
11. **Cuatro chips "FALTA CONFIRMAR" iguales** en los casos 1 a 4 (chip y `dd` de Canal): consecuencia del dato pendiente; se resuelve solo al llegar los canales.

## Erratas del doc conservadas (no se corrigieron)

- `results`: ninguna.
- `cases`: "Casos de exito" (sin tilde), "en crecimiento de trafico organico" (sin tilde en trafico y organico) y la falta de punto final del caso 5. Se muestran tal cual y quedan `pending` para que Ari las revise.

## Nota para 02-05

El disco de check de `ResultItem` se dibuja en línea (`svg.result-check` de 32 px con `circle.result-disc` y `path.result-tick`, `aria-hidden`), porque el sprite de 02-10 (ocho símbolos `lg-`) no trae un símbolo de check. Si Qué incluye necesita el mismo disco, puede extraerlo a un componente propio; no se hizo aquí para no tocar componentes fuera del alcance.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Prueba (k) de `a11y-base.spec.ts` contaba una marca por afirmación y el canal se imprime dos veces**
- **Found during:** Tarea 2, primera corrida completa de `a11y-base.spec.ts` (12 marcas en el cuerpo frente a 8 esperadas).
- **Issue:** la prueba deriva de `walkClaims` el número de marcas FALTA CONFIRMAR visibles, y cada afirmación se imprime una vez. El plan 04 imprime el canal de cada caso dos veces (el chip y el dato de Canal; supuesto 8 del plan), así que las cuatro marcas de canal aparecen el doble.
- **Fix:** se suma una constante `CHIP_DUPLICATES` y la prueba espera `VISIBLE_MARKS + CHIP_DUPLICATES`. El plan pedía que en ese archivo solo cambiaran las dos líneas del arreglo; este cambio es adicional.
- **Files modified:** `tests/e2e/a11y-base.spec.ts`
- **Commit:** `48fc303`

**2. [Rule 1 - Bug] Prueba "cada escena existe una vez" de `collage-language.spec.ts` contaba la lupa como una escena**
- **Found during:** Tarea 2, corrida completa del E2E (10 elementos `[data-collage]` frente a los 9 esperados).
- **Issue:** la prueba de un plan anterior cuenta todos los `[data-collage]` y espera nueve escenas; la lupa de Casos es una pieza suelta (`data-collage="piece"`), no una escena.
- **Fix:** la cuenta de escenas excluye las piezas y una segunda aserción fija que hay exactamente una pieza suelta. Este archivo no estaba en `files_modified` del plan: el criterio de alcance de la tarea 3 (`git diff --name-only 235ffbd`) lo lista; es el único archivo fuera de la lista.
- **Files modified:** `tests/e2e/collage-language.spec.ts`
- **Commit:** `48fc303`

**3. [Rule 1 - Bug] Chip de la tarjeta ancha estirado a todo el ancho de su columna**
- **Found during:** Tarea 3, crítica de las capturas `C1-casos-390` y `C1-casos-1280`.
- **Issue:** al convertir la tarjeta ancha en rejilla (ajuste de diseño de la tarea 2), el chip "Meta Ads" perdió el `align-self: flex-start` del flex y ocupaba toda la columna; además la lupa dejaba un hueco bajo el chip.
- **Fix:** ver "Tarea 3": `justify-self: start` y `align-self: center` en el chip, filas `auto auto 1fr` y cifra y `dl` anclados abajo desde 40 em.
- **Files modified:** `src/components/ui/MetricCard.astro`
- **Commit:** `acb8787`

### Ajustes de diseño respecto al texto del plan (mismo resultado medible)

- **Lupa en la fila del chip, no con posición absoluta.** El plan pedía la lupa anclada con `position: absolute` a la esquina de la tarjeta. Se colocó como elemento de la rejilla de la tarjeta ancha, en la fila del chip y a la derecha. Así nunca cruza la cifra, el nombre ni el `dl` por construcción, y las pruebas de no cruce y de apilado son reales. La tarea 3 evaluó revertirlo por el hueco bajo el chip y lo descartó: el hueco se resolvió con la composición de la cabecera.
- **Prueba de la lupa mide el ancho calculado** (`getComputedStyle().width`, 96 px) y no el `boundingBox`, porque con `rotate={6}` el rectángulo de la caja incluye la rotación.

## Known Stubs

- `results.items[1].body` muestra FALTA CONFIRMAR hasta que Ari entregue el dato del presupuesto de ads (tarea 1).
- En `cases`: los canales de los casos 1 a 4 y el plazo del caso 5 muestran FALTA CONFIRMAR (en el chip y en el `dd`). Todos están en `PENDING-COPY.md` (13 filas `cases.`) y no bloquean el objetivo del plan: ningún `dd` queda vacío y ninguna tarjeta se oculta.

## Threat Flags

Ninguno: sin endpoints, rutas de autenticación, acceso a archivos ni peticiones nuevas; el texto sale escapado del YAML y la lupa es un `<use>` interno del sprite.

## Self-Check: PASSED

- Archivos creados existen: `ResultItem.astro`, `Results.astro`, `MetricCard.astro`, `Cases.astro`, `results-cases.spec.ts`.
- Commits `d4def27`, `48fc303` y `acb8787` existen en la rama `gsd/phase-02-secciones-marca-y-copy`.
- 25 capturas `C1-*.png` en `test-results/phase2/`.

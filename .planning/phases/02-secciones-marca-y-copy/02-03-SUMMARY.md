---
phase: 02-secciones-marca-y-copy
plan: 03
subsystem: ui
tags: [astro, copy, yaml, collage, svg, playwright, cards, guards]
status: complete
plan_head_before: ae44486e5062b8a1cfa9f3d018c19b27005b2bea
# commits es el conteo medido del libro (rev-list desde plan_head_before). Incluye los commits de los planes 02-09,
# 02-10 y 02-11, que se ejecutaron entre la tarea 3 y la tarea 4. Los de este plan son 7: d07604f, 1ecebf6, d194134,
# 0d106c2, 9243d2e, 149f172 y el commit de cierre de documentos.
commits_own: 7

requires:
  - phase: 02-secciones-marca-y-copy
    provides: "Plan 01 (tonos, SectionShell, CtaLink, tokens) y plan 02 (CollagePiece, sprite, chips y pegatinas)"
provides:
  - "Claves problem, why_now y solution en el YAML con las 26 afirmaciones del doc de Ari (cuatro pending, dos con la marca FALTA CONFIRMAR) y su esquema estricto"
  - "Prueba 9b de la guarda de copy reescrita: solo PENDING y MISSING, derivada del YAML con walkClaims, y toda marca debe ser pending"
  - "Secciones Problem, WhyNow y Solution completas entre el hero y #agenda; PainCard, PillarCard y la variante split del SectionShell"
  - "CTA de La solución con orden de tabulación actualizado y aserción de marcas visibles del caso k derivada del YAML"
  - "sections-problem-solution.spec.ts con 52 pruebas (estructura, copy del YAML, estilos calculados, columnas, collage, CTA y foco, matriz de cinco anchos, ritmo de 64 y 96 px, SC 1.4.12, cero animaciones, sin JavaScript y capturas del lote B)"
affects: [02-04, 02-05, 02-06, 02-07, 02-08]

actuals:
  tokens: 16200   # 12500 de las tareas 1 a 3 mas 3684 (chars/4 sobre src y tests de la tarea 4)
  tasks: 4
  commits: 41

tech-stack:
  added: []
  patterns:
    - "Ranura sin dato o rechazada por una guarda: text FALTA CONFIRMAR, status pending, confirm_by Ari y reason con la causa y el texto literal del doc; el componente imprime solo .text"
    - "Sombra dura heredada: --card-shadow se declara en el contenedor de la rejilla (lee --pop-shadow-color del tono padre) y la tarjeta de tono anidado la usa"
    - "SectionShell split y slot aside: h2, lead y collage a la izquierda y cuerpo a la derecha desde 64em, compatible hacia atrás"
    - "Numeral por contador de CSS (counter-reset en la rejilla, counter-increment en la tarjeta), decorativo y aria-hidden"

key-files:
  created:
    - src/components/ui/PainCard.astro
    - src/components/ui/PillarCard.astro
    - src/components/sections/Problem.astro
    - src/components/sections/WhyNow.astro
    - src/components/sections/Solution.astro
    - tests/e2e/sections-problem-solution.spec.ts
  modified:
    - src/content/landing.es.yaml
    - src/content.config.ts
    - PENDING-COPY.md
    - tests/guards/copy.test.mjs
    - src/components/ui/SectionShell.astro
    - src/pages/index.astro
    - tests/e2e/a11y-base.spec.ts
    - .planning/phases/02-secciones-marca-y-copy/02-VISUAL-LOG.md

key-decisions:
  - "El titular de La solución y el cuerpo del Pilar 4 se guardan como FALTA CONFIRMAR (pending) con el texto íntegro del doc en reason: la guarda rechaza la sigla de tres letras y la nota entre corchetes, y no se edita el texto de Ari."
  - "Por qué ahora se parte en seis filas, una por oración del doc; solo la segunda oración (clientes que preguntan a ChatGPT o a Gemini) queda pending."
  - "Verónica queda pending: su cargo en La solución difiere del de Quiénes somos."
  - "Numerales de las tarjetas por contador de CSS; la prueba comprueba la expresión y el contador porque getComputedStyle no resuelve el valor."

requirements-completed: [CONT-02, CONT-03, CONT-04, COPY-01, DSGN-04]

coverage:
  - id: D1
    description: "Copy de las tres secciones tal cual del doc: 26 afirmaciones, cada text (salvo las dos marcas) es subcadena literal de 02-ARI-COPY-V2.md; producción reporta solo PENDING y MISSING"
    requirement: "COPY-01"
    verification:
      - kind: unit
        ref: "node --test tests/guards/*.test.mjs (88 pruebas, incluida la 9b reescrita) y el script de subcadenas literales de la tarea 1"
        status: pass
    human_judgment: false
  - id: D2
    description: "Las tres secciones con tono dark, yellow y light, tarjetas y filas con estilos calculados del contrato, columnas por ancho y CTA de La solución a 48 px bajo la rejilla con foco en #agenda-title (a 1280 y 390 px)"
    requirement: "CONT-02, CONT-03, CONT-04"
    verification:
      - kind: e2e
        ref: "npm run test:e2e:isolated -- tests/e2e/sections-problem-solution.spec.ts tests/e2e/page-structure.spec.ts tests/e2e/a11y-base.spec.ts tests/e2e/cta-focus.spec.ts (110 pasan)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Lote B de diseño (ronda de captura, critique, correcciones y verificación de 320 a 1280 px), registrado como Lote B, ronda 1 en 02-VISUAL-LOG.md"
    requirement: "DSGN-04"
    verification:
      - kind: e2e
        ref: "E2E_BLOCK_CLICKUP=1 npx playwright test --project=chromium (276 pasan, 65 omitidas de capturas) y PHASE2_BATCH=B con 21 capturas"
        status: pass
    human_judgment: true
---

# Phase 2 Plan 03: Problema, Por qué ahora y La solución Summary

**Tres secciones de contenido con el texto de Ari tal cual (tarjetas de dolor con sombra naranja, lista de frases con collage oficial de la lupa y foto en media tinta, y cuatro pilares en tablero blanco y crema con chip propio y CTA), con el titular de La solución y el cuerpo del Pilar 4 mostrando FALTA CONFIRMAR, las guardas de copy aceptando solo PENDING y MISSING y todo verificado de 320 a 1280 px (columnas, ritmo de 64 y 96 px, espaciado de texto, cero animaciones y sin JavaScript).**

## Estado: completo

Las cuatro tareas están hechas y en verde. El plan se cortó tras la tarea 3 por presupuesto de contexto; entre esa tarea y la 4 se ejecutaron los planes 02-09 (marca oficial, morado `#4228D1`), 02-10 (collage de marca) y 02-11 (fotos en media tinta), que cambiaron el collage, las pegatinas, los chips y la foto de Por qué ahora. La tarea 4 se hizo sobre ese estado (spec con `PURPLE_RGB` y `rgbOfToken` de `tests/e2e/lib/brand.ts`, sin ningún valor de morado escrito a mano).

### Tarea 4 (lote B), commits `9243d2e` (pruebas) y `149f172` (correcciones)

- **Pruebas primero, en `sections-problem-solution.spec.ts`:** matriz de cinco anchos (320, 390, 768, 1024 y 1280 px) con columnas (dolores en 3 desde 1024 px, pilares en 2 desde 640 px, Por qué ahora en dos columnas desde 1024 px), `scrollWidth` de las tres secciones y de las tarjetas y filas dentro de `[0, innerWidth]`, y `.whynow-art` sin cruzar h2 ni lista; padding de 64 px bajo 1024 px y de 96 px desde 1024 px; SC 1.4.12 a 320 px con `addStyleTag` (interlineado 1.5, letras 0.12em, palabras 0.16em, párrafos 2em) sin recortes ni scroll horizontal; `document.getAnimations().length` en 0 con `reduce` y `no-preference`; las tres secciones y el CTA `solucion` visibles con `javaScriptEnabled: false`; y el bloque de capturas de sección solo con `PHASE2_BATCH`. Nacieron en verde: el código de las tareas 2 y 3 ya cumplía el contrato (se anota como en la tarea 2). La prueba nueva de las reglas del equipo (`las filas del equipo llevan regla de 3 px arriba`) sí nació de una observación del `critique` y se escribió junto con la corrección.
- **Ciclo del lote B:** ronda de captura con `PHASE2_BATCH=B` (21 archivos), `impeccable` (`critique`, `layout`, `colorize`; `bolder` no hizo falta) y `design-taste-frontend` (diales 7, 3 y 4), contra `moodboard.png` y `ai_a.png` de la marca real. Una corrección en un solo lote y una ronda de confirmación (1 de 1). Detalle en `02-VISUAL-LOG.md`, "Lote B, ronda 1".
- **Correcciones:** (1) `WhyNow.astro`: el collage llena su columna desde 64em con tope de 26rem (416 px); antes quedaba a 320 px con el resto de la columna vacía frente a las seis filas. (2) `PillarCard.astro`: tarjetas 2 y 4 sobre crema (par oscuro sobre crema aprobado, 14.37) en tablero con las blancas 1 y 3. (3) `PillarCard.astro`: filas del equipo con `border-top` de 3 px. (4) Los specs `collage-language.spec.ts` y `collage-photos.spec.ts` (planes 02-10 y 02-11) fijaban 320 px desde 64em; ahora aceptan de 320 a 416 px. El fondo esperado de las tarjetas de pilar en este spec pasa a blanco y crema alternados.
- **Decisión sobre el Pilar 4:** el aire bajo FALTA CONFIRMAR se deja. Viene del marcador (cuerpo corto) y de igualar el alto con el Pilar 3, y se cierra solo cuando Ari entregue el texto; romper el alto parejo del contrato o dar estilo propio al marcador (la tarjeta solo imprime `.text`) sería un parche.
- **Registro:** `02-VISUAL-LOG.md` trae "Lote B, ronda 1" con verbos, hallazgos, correcciones, capturas, la nota de las listas con `role="list"` (respaldo de VoiceOver) y los rasgos 2, 3, 7 y 8 de la lista de vibra cumplidos.

### Verificación de cierre

- `E2E_BLOCK_CLICKUP=1 npx playwright test --project=chromium` (preview en 4322, detenido después): 276 pasan, 65 omitidas (capturas e informes, solo con `PHASE2_BATCH`), 0 fallos.
- `PHASE2_BATCH=B` sobre `page-structure` y `sections-problem-solution`: 21 archivos `test-results/phase2/B-*.png` (no versionados).
- `node --test tests/guards/*.test.mjs`: 162 de 162. `node scripts/check-contrast.mjs` y `node scripts/list-pending.mjs --check` salen 0. `npm run build` pasa; `dist/index.html` pesa 39497 bytes (tope 42240).
- `PUBLIC_ENV=production node scripts/check-copy.mjs --dist dist --json`: 0 estructurales y 2 de contenido, todas MISSING, igual a las 2 marcas del YAML.
- Barridos: cero `set:html`, cero hex en `src/components` y `src/pages`, cero `outline: none`, cero `line-height ... !important`; cero `AEO` y cero `[VERIFICAR` en `dist/index.html`; los únicos hosts son `app-cdn.clickup.com`, `forms.clickup.com` y el espacio de nombres de SVG (`www.w3.org`).
- El diff contra `plan_head_before` de los archivos que el plan declara prohibidos (favicon, `scripts/brand`, `scripts/lib`, `scripts/photos`, `check-photos.mjs`) lista archivos de los planes 02-09 a 02-11; ninguno lo tocó este plan (solo cambiaron `PillarCard.astro`, `WhyNow.astro` y tres specs).
- Ningún servidor quedó levantado por este ejecutor (`npx astro preview stop` tras cada ciclo; el `astro dev` del usuario no se tocó).

## Hecho

### Tarea 1 (tracer), commit `d07604f`

- `landing.es.yaml`: claves `problem` (título, tres dolores, frase final), `why_now` (título y seis oraciones) y `solution` (título, lead y cuatro pilares con lista de equipo en el tercero), 26 afirmaciones, con el texto de `02-ARI-COPY-V2.md` carácter por carácter (incluidos el espacio doble de `problem.items[2]`, la errata "direcciôn", los dos puntos finales y la línea de Arianna sin punto).
- Pending: `why_now.items[1]`, `solution.title`, `solution.items[2].list[2]` y `solution.items[3].body`; las dos con `FALTA CONFIRMAR` como texto guardado y el texto literal del doc en `reason`.
- `content.config.ts`: `problem.items` exactamente 3, `solution.items` exactamente 4, `why_now.items` 1 o más, lista de equipo opcional.
- `tests/guards/copy.test.mjs` 9b: acepta solo PENDING y MISSING sobre el YAML real, deriva rutas de `walkClaims` y `findMissingMark`, exige `pending` en toda reclamación con la marca y comprueba el hash del YAML. Guardas: 88 pruebas verdes.
- `a11y-base.spec.ts`: caso a de 1280 y de 390 px con `cta:solucion`; caso k con aserción derivada del YAML (apariciones de la marca en `/` igual a las reclamaciones con la marca fuera de `privacy.`), con y sin JavaScript.
- Secciones en HTML plano, `index.astro` con el orden Problem, WhyNow, Solution entre el hero y `#agenda`, spec nuevo del tracer y "Lote B, ronda 0" en `02-VISUAL-LOG.md`. `PENDING-COPY.md` regenerado (11 pendientes, cuatro nuevos).

### Tarea 2, commit `1ecebf6`

- `SectionShell` con la prop `split` y el slot `aside` (`Astro.slots.has('aside')`), compatible hacia atrás.
- `PainCard` (tono anidado light, borde de 3 px, radio 16, sombra `6px 6px 0 var(--card-shadow)`, numeral por contador, pegatina de 64 px), `Problem` (rejilla de 1 y 3 columnas, `--card-shadow` en el contenedor, frase final en Title 700 a 48 px) y `WhyNow` (`split`, collage compacto de 160 px con lupa y ojos de tono yellow, filas con regla de 3 px y la última con regla inferior).

### Tarea 3, commit `d194134`

- `PillarCard` (chip de 64 px, h3 a 16 px del chip, cuerpo a 8 px del h3, lista opcional del equipo; borde de 3 px y sombra dura de 4 px) y `Solution` (chips lupa, ojos, loop y clic; 1 columna bajo 640 px y 2 desde 640 px; CTA a 48 px bajo la rejilla). El Pilar 4 muestra `FALTA CONFIRMAR`; la errata "direcciôn" sale tal cual.
- Esta tarea sí corrió en rojo primero: cinco pruebas fallaron por contenido (sin `.pillar-card`) antes de construir.

## Verificación histórica (estado tras la tarea 3)

- `npm run test:e2e:isolated -- tests/e2e/sections-problem-solution.spec.ts tests/e2e/page-structure.spec.ts tests/e2e/a11y-base.spec.ts tests/e2e/cta-focus.spec.ts`: 110 pasan, 15 omitidas (capturas de lote sin `PHASE2_BATCH`).
- `node --test tests/guards/*.test.mjs`: 88 pasan. `node scripts/check-contrast.mjs`: 11/11 pares. `npm run build` pasa; `node scripts/list-pending.mjs --check` sale 0 (11 pendientes).
- Producción (`PUBLIC_ENV=production`): solo reglas PENDING y MISSING; cero estructurales.
- `dist/index.html`: 2 apariciones de `FALTA CONFIRMAR`, 3 ids de sección, 4 `<h3>`, `direcciôn` presente, 0 apariciones de `AEO` y 0 de `[VERIFICAR`. Cero `set:html`, cero hex en `src/components` y `src/pages`, cero `outline: none`. Ninguno de los archivos prohibidos (hero, collage, brand, header, layouts, agenda, skip links, `CtaLink`, `styles`, `scripts`, `public`) cambió.
- Ningún servidor quedó levantado por este ejecutor (`npx astro preview stop` tras cada ciclo; el `astro dev` del usuario no se tocó).

## Erratas del doc detectadas en estas secciones (se muestran tal cual)

1. `problem.items[2]`: espacio doble antes de "y" ("no se mueve  y el negocio"). El HTML lo colapsa a uno al mostrarlo; el YAML lo conserva.
2. `solution.items[2].list[3]`: "direcciôn" con circunflejo en lugar de "dirección".
3. La misma línea de Arianna termina sin punto final.
4. Del plan 01 (hero): "estan" sin tilde en `hero.description[1]`.

## Hallazgos para Ari

1. **Titular de La solución** ("Un equipo que ejecuta SEO y AEO, no que te asesora."): la guarda rechaza la sigla de tres letras; queda pending y la página muestra FALTA CONFIRMAR. Ari decide qué término usar.
2. **Pilar 4 (cuerpo):** el doc trae una nota `[VERIFICAR: ...]` sobre el desglose por canal (Google vs IA); queda pending con FALTA CONFIRMAR y el párrafo íntegro en `reason`. Ari lo respalda con datos o lo suaviza.
3. **Verónica:** el cargo de La solución ("Gerente de Proyectos y Consultora SEO") difiere del de Quiénes somos ("Directora de Proyectos"). Ari elige cuál usar.
4. **`why_now.items[1]`:** afirmación de mercado sobre clientes que preguntan a ChatGPT o a Gemini (misma familia que COPY-VERIFICATION 3b, datos de EE.UU.).
5. **Promesa:** "respondemos por el resultado" (lead de La solución) puede leerse como promesa de resultado; solo se reporta, no se edita.
6. **Las cinco afirmaciones de mercado del UI-SPEC** ("los ads se encarecen", "el orgánico se abarata", etc.) no existen en el Copy v2, que trae seis oraciones en dos párrafos; no se inventó ninguna.

Las cuatro rutas pending nuevas: `why_now.items[1]`, `solution.title`, `solution.items[2].list[2]` y `solution.items[3].body`.

## Brecha de la guarda (para el plan 07)

`VERIFICAR_RE` en `scripts/lib/copy-rules.mjs` es `/\[VERIFICAR\]/gi`: no reconoce la forma real del doc, `[VERIFICAR: ...]`. Aquí no importa porque el Pilar 4 se guarda con la marca y la prueba de este plan afirma que ninguna de las tres secciones muestra `[VERIFICAR`. El plan 07 debe ampliar la expresión.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Aserciones del spec que la primera corrida puso en rojo**
- **Found during:** Tarea 2
- **Issue:** (a) `getComputedStyle(el, '::before').content` devuelve la expresión `counter(pain, decimal-leading-zero)` y no el valor resuelto ("01"), así que la comprobación literal del plan no es medible; (b) tras el clic en el CTA, `document.activeElement.id` se leía antes de que el script de foco terminara.
- **Fix:** (a) la prueba comprueba la expresión con dos dígitos, `counter-reset: pain 0` en la rejilla y `counter-increment: pain 1` en cada tarjeta, que producen 01, 02 y 03 en orden; (b) se usa `toBeFocused()` con reintento, igual que `cta-focus.spec.ts`.
- **Files modified:** tests/e2e/sections-problem-solution.spec.ts
- **Commit:** 1ecebf6

### Otras desviaciones

- **Orden TDD en la tarea 2:** los componentes se escribieron antes que las pruebas, así que las pruebas nuevas nacieron en verde (salvo las dos correcciones de arriba) y no se vio el rojo previo. La tarea 3 sí respetó el rojo primero. La cobertura de la tarea 2 es equivalente; se anota por transparencia.
- **Prueba de estilos de La solución:** se añadió `toHaveLength(4)` para que no pase en vacío si no hay tarjetas.
- **`HeroCollage.astro` declarado por 02-01 y 02-02:** este plan no lo toca; el choque de `files_modified` no produjo conflicto (ambos planes ya estaban commiteados antes de esta wave).
- **Corte del plan tras la tarea 3** por presupuesto de contexto; la tarea 4 se hizo en una segunda ejecución sobre el estado posterior a 02-09, 02-10 y 02-11.
- **Los specs de los planes 02-10 y 02-11 se tocaron** (`collage-language.spec.ts` y `collage-photos.spec.ts`) porque afirmaban 320 px para el collage de Por qué ahora desde 64em; el lote B lo llevó a 416 px como máximo.

## Threat Flags

Ninguno: no hay endpoints, rutas de autenticación, acceso a archivos ni cambios de esquema en fronteras de confianza; el texto sale escapado del YAML y las únicas peticiones externas siguen siendo las de ClickUp.

## Known Stubs

Los dos "FALTA CONFIRMAR" (`solution.title` y `solution.items[3].body`) son huecos intencionales del copy, listados en `PENDING-COPY.md` y en `.planning/WINDOWS.md` cuando el libro esté disponible. Los resuelve Ari.

## Self-Check: PASSED

- Archivos creados existen: PainCard, PillarCard, Problem, WhyNow, Solution y sections-problem-solution.spec.ts.
- Commits `d07604f`, `1ecebf6`, `d194134`, `9243d2e` y `149f172` existen en la rama `gsd/phase-02-secciones-marca-y-copy`.

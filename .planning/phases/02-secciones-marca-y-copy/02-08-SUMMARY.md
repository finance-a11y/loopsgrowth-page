---
phase: 02-secciones-marca-y-copy
plan: 08
subsystem: cierre de fase (matriz de medición, cierre visual, hallazgos para Ari, suite completa)
tags: [axe, playwright, contact-sheet, closing, findings, production-gate]
status: complete
requires:
  - phase: 02-07
    provides: phase-closing.spec.ts con 'conexiones de fase', motion.css, guardas motion-budget y phase2-static
provides:
  - "@axe-core/playwright 4.13.0 como dependencia de desarrollo"
  - "bloque 'axe de humo' (/ y /privacidad/ a 320, 390 y 1280 px) y bloque 'hoja de contacto' (PHASE2_BATCH) en phase-closing.spec.ts"
  - "matriz de medición completa en phase-closing.spec.ts (desborde, espaciado SC 1.4.12, sin JavaScript, ClickUp bloqueado, objetivos, sombras, área de salvado, peso y peticiones, CTA en una línea)"
  - "02-VISUAL-LOG.md consolidado: lote 0 de 02-02, CIERRE0, CIERRE1 y CIERRE2, 8 rasgos, 15 filas, conteos de axe y pendientes para Juan"
  - "02-ARI-FINDINGS.md: lista única para Ari con seis secciones (decisiones, faltantes, confirmaciones, erratas, afirmaciones ausentes, cómo se aplica cada respuesta)"
  - "PENDING-COPY.md verificado como determinista (61 textos) y las puertas de producción de copy y fotos comprobadas"
affects: [fase 2 verificación, fase 3 (compuerta de accesibilidad, SEO, dominio)]
tech-stack:
  added: ["@axe-core/playwright 4.13.0 (devDependencies, exacta)"]
  patterns: ["contexto aislado con todo lo que no es localhost abortado", "hoja de contacto por rejilla CSS de <img> en base64"]
key-files:
  created:
    - .planning/phases/02-secciones-marca-y-copy/02-ARI-FINDINGS.md
  modified:
    - tests/e2e/phase-closing.spec.ts
    - src/components/CtaLink.astro
    - package.json
    - package-lock.json
    - .planning/phases/02-secciones-marca-y-copy/02-VISUAL-LOG.md
decisions:
  - "La hoja de contacto deriva los ids de las secciones del DOM (main > section) en lugar de importar PAGE_ORDER, porque page-structure.spec.ts es un spec y no exporta la constante; el aserto de 14 objetivos (header, 12 secciones, footer) cubre la deriva."
  - "La prueba de degradados cuenta como degradado solo el gradient con más de un color o no lineal, porque MetricCard pinta su marcador amarillo con linear-gradient(c, c), un relleno plano."
  - "El hero (subtítulo en Body) y la rejilla de La solución (alto parejo por fila) cumplen el UI-SPEC y sus pruebas; la crítica los deja como propuestas para Juan, no como correcciones."
  - "El archivo de hallazgos reporta y no corrige: el copy de Ari se cita literal, con sus erratas, y landing.es.yaml no cambió en todo el plan."
  - "La suite de navegador se cierra con E2E_BLOCK_CLICKUP=1 (proyecto chromium, que es lo mismo que test:e2e:isolated) y con el proyecto live por separado; las dos pruebas de collage-photos que fallan con el iframe de ClickUp vivo se reportan para Juan (ver Deviations)."
metrics:
  actuals:
    tokens: 20200
    tasks: 3
    commits: 8
  completed: 2026-09-19
requirements-completed: [DSGN-03, DSGN-04, COPY-01]
commits: 8
plan_head_before: d0ac3f720a871fd47e645ac1f133f9b5ea99632e
---

# Phase 2 Plan 08: Cierre de fase Summary

Cierre de la fase 2: matriz de medición completa y axe de humo en verde, ciclo visual `CIERRE1` y `CIERRE2` con un solo defecto de CSS corregido (el CTA a 320 px), lista de pendientes determinista, puertas de producción de copy y fotos comprobadas, `02-ARI-FINDINGS.md` con seis secciones para Ari, y la suite completa sin fallos (207 guardas, contraste, build, 530 pruebas de chromium con ClickUp bloqueado y 9 de `live`). `commits: 8` cuenta desde `plan_head_before` hasta este resumen incluido; el commit posterior de metadatos (STATE, ROADMAP y REQUIREMENTS) no se cuenta.

## Estado de las tareas

| Tarea | Estado | Commit |
|-------|--------|--------|
| 1. Tracer (axe, hoja de contacto, log CIERRE0) | Hecha | b1f3905 |
| 2. Matriz completa, ciclo critique y polish, log consolidado | Hecha | 05919aa (matriz), 3d97955 (CTA a 320 px), 2e37e32 (log) |
| 3. Auditoría de copy y producción, `02-ARI-FINDINGS.md`, suite completa | Hecha | f8d82c5 (hallazgos y ajuste del log), este resumen |

## Tarea 1: resultado

- **Legitimidad del paquete:** `gsd-tools query package-legitimacy check --ecosystem npm @axe-core/playwright` devolvió `OK` el 2026-09-19 (existe, 7 267 599 descargas semanales, repo dequelabs/axe-core-npm, sin postinstall, no obsoleto). Instalado `@axe-core/playwright@4.13.0` con `--save-exact` en `devDependencies`; `git diff` de `package.json` muestra solo esa línea. `npm install` reportó 0 vulnerabilidades.
- **RED antes de instalar:** el spec falló con `Cannot find package '@axe-core/playwright'`.
- **GREEN:** `phase-closing.spec.ts` en chromium: 12 pasan (6 de 'conexiones de fase' y 6 de 'axe de humo') y 2 en skip (la hoja de contacto sin `PHASE2_BATCH`, como debe ser).
- **axe:** `/` y `/privacidad/` a 320, 390 y 1280 px con 0 violaciones en total, sin iframe y con ClickUp bloqueado.
- **Hoja de contacto:** `PHASE2_BATCH=CIERRE0` -> 2 pasan; 30 archivos (14 recortes x 2 anchos + 2 hojas), legibles.
- **Alcance:** el tracer no tocó `src/`.

## Tarea 2: resultado

- **Matriz** (`tests/e2e/phase-closing.spec.ts`, commit 05919aa, 54 pruebas con las del tracer): 24 de desborde (`/` y `/privacidad/`, 6 anchos, `reduce` y `no-preference`), 2 de espaciado SC 1.4.12, 1 sin JavaScript, 2 con ClickUp bloqueado, 4 de objetivos y área de salvado, 2 de sombras y degradados, 5 de peso y peticiones. Topes: HTML 81 920 crudos y 25 600 gzip (medido: 71 843 y 14 274), collage y sprite 42 240 (medido: 24 392), sin `.js` en `dist`, script en línea por debajo de 3 072 bytes, hosts solo localhost, forms.clickup.com y app-cdn.clickup.com.
- **Ciclo visual:** `CIERRE1` y `CIERRE2` con `impeccable` (`context`, `critique`; `audit`, `polish`, `harden` y `adapt` sobre la matriz medida) y `design-taste-frontend`, ambas con la herramienta Skill; la crítica corrió en un solo contexto (sin herramienta de subagentes). Único defecto corregido: el CTA caía a dos líneas a 320 px (73 px de alto); `padding-inline: 1rem` bajo 360 px (`CtaLink.astro`, commit 3d97955) lo deja en una línea (48 px), con prueba nueva a 320, 390 y 1280 px. Propuestas para Juan sin cambiar: subtítulo del hero en Title, tarjeta de equipo de La solución en dos columnas, tres radios fuera de la escala de DESIGN.md.
- **Log:** `02-VISUAL-LOG.md` con el lote 0 de 02-02 consolidado, `CIERRE1`, `CIERRE2`, tabla de los 8 rasgos (todos cumplen, con medidas), tabla de las 15 filas, conteos de axe (0 violaciones en las seis combinaciones) y 10 pendientes para Juan (commit 2e37e32).

## Tarea 3: resultado

**Lista de pendientes (COPY-01).** `npm run pending` dos veces produce el mismo hash de `PENDING-COPY.md` (`1f9cf9d7cc3e6b705f20152f980ed56c5cb42fd6`, 61 textos) y `node scripts/list-pending.mjs --check` sale 0 (`OK PENDING-COPY.md está al día (61 pendientes)`). El archivo ya coincidía con el versionado: no hubo que commitearlo.

**Producción (COPY-02 y COPY-01).**

| Comando | Resultado |
|---------|-----------|
| `PUBLIC_ENV=production node scripts/check-copy.mjs --json` | sale 1; `structural` vacío; `content` solo `PENDING` (61) y `MISSING` (32); 16 primeros segmentos de ruta afectados (`brand`, `call`, `meta`, `hero`, `why_now`, `solution`, `results`, `cases`, `team`, `includes`, `how_it_works`, `for_whom`, `faq`, `agenda`, `footer`, `privacy`) |
| `npm run build` sin `PUBLIC_ENV` | sale 0 (`check-copy OK en dist`, 40 avisos de relleno, solo advierte) |
| `PUBLIC_ENV=production node scripts/check-copy.mjs --dist dist` | sale 1: `dist/index.html` (35 rellenos), `dist/privacidad/index.html` (3) y `dist/marca/hoja/index.html` (2); esta última existe solo en el build no productivo, porque con `PUBLIC_ENV=production` la hoja de revisión no se genera |
| `PUBLIC_ENV=production npm run build` | sale 1 en `prebuild` (93 violaciones de copy: 61 `PENDING` y 32 `MISSING`); `dist/index.html` conserva la misma fecha de modificación (1789875015 antes y después) |
| `PUBLIC_ENV=production node scripts/check-photos.mjs` | sale 1: aprobación de `hero-a` y `whynow-a` pendiente, y existen los rasters de `hero-b` y `whynow-b`, que no están elegidas; imprime los cinco pasos para cerrar la elección |
| `node scripts/check-photos.mjs` (sin `PUBLIC_ENV`) | sale 0, con 4 avisos |

Conclusión: en cuanto al copy, el build de producción falla solo por `PENDING` y `MISSING`; en cuanto a las fotos, la puerta de 02-11 bloquea mientras la aprobación de Ari de la foto elegida de cada ranura siga `pendiente` y la elección siga abierta (`src/assets/photos/LICENSES.md`, "Elección: abierta"). Es el primero de los dos casos del criterio de aceptación: Ari no ha aprobado.

**`02-ARI-FINDINGS.md`** (commit f8d82c5). Seis secciones numeradas, encabezado con las 61 filas: (1) 12 decisiones de alto impacto (morado #4228D1 frente a #73187F, variantes de logo, favicon de la mesa 18, avatares Loopy, crema como superficie, naranja sobre morado sin uso, palabras de las píldoras con `spy` y `team work` del moodboard, fotos de stock con la puerta de producción y la nota de personas reales sin autorización de imagen, 20 frente a 30 minutos, AEO, Hurme y Outfit, consentimiento del equipo y biografías); (2) texto que falta; (3) texto que se muestra pero se confirma; (4) erratas con su ruta y cita literal; (5) afirmaciones que el diseño esperaba; (6) cómo se aplica cada respuesta y otros hallazgos de los planes. Contiene `#4228D1` y `#73187F`. La verificación automática del plan pasa: `structural` vacío, solo `PENDING` y `MISSING`, los 16 primeros segmentos citados en comillas invertidas, seis secciones, `LICENSES.md`, `team work` y `mesa 18`. Cero guiones largos y sin voseo; la prosa propia pasó por `humanizer` con la herramienta Skill (cambios mínimos, porque es una lista de trabajo).

**Suite completa.**

| Comando | Resultado |
|---------|-----------|
| `node --test tests/guards/*.test.mjs` | 207 pasan, 0 fallan, 0 en skip |
| `node scripts/check-contrast.mjs` | sale 0 |
| `npm run build` | sale 0 |
| `npx playwright test --project=chromium` con `E2E_BLOCK_CLICKUP=1` (`npm run test:e2e:isolated`) | 530 pasan, 0 fallan, 97 en skip (herramientas de captura que solo corren con `PHASE2_BATCH`) |
| `npx playwright test --project=live` (`curl https://forms.clickup.com` dio 200) | 9 pasan |
| `git diff d0ac3f7 -- src/content/landing.es.yaml` | vacío |

Los servidores se levantaron con `npx astro preview --port 4322` en segundo plano y se detuvieron con `npx astro preview stop` (pid 56525); `astro dev` (pid 86100) del usuario no se tocó. Nunca se llenó ni se envió el formulario de ClickUp.

## Deviations from Plan

**1. [Prueba frágil ajena, sin cambio de código] `chromium` con el iframe de ClickUp vivo.** `npx playwright test --project=chromium` sin `E2E_BLOCK_CLICKUP` dio 528 pasan y 2 fallan, ambas en `tests/e2e/collage-photos.spec.ts` (archivo de 02-11, no editado aquí): (a) "las peticiones de imagen son del mismo origen" recibió tres peticiones de terceros que dispara el iframe vivo de ClickUp (`google.com/pagead`, `google.com.pe/pagead` y `verifi.pdscrb.com`), y (b) "sin JavaScript la foto se pinta" agota los 30 s por `scrollIntoViewIfNeeded` sobre un elemento "not stable"; se repitió sola y volvió a fallar, y 02-07 ya la había anotado como frágil. Con `E2E_BLOCK_CLICKUP=1` las dos pasan y toda la suite queda en verde, que es como el encargo de esta corrida definió el cierre. Queda para Juan: las dos pruebas deberían bloquear ClickUp ellas mismas (como hace `phase-closing.spec.ts`) para no depender de la variable. No se editó el spec por la regla de este plan de no editar aserciones ajenas.

**2. [Corrección de registros] `02-VISUAL-LOG.md`, pendientes 3 y 4.** Hablaban de un set de avatares con lupa, auriculares, gafas y gorro y de un favicon con el isotipo de dos ojos, ya reemplazados por 02-10 (Loopy oficial) y 02-09 (mesa 18). Se alinearon con el estado real (commit f8d82c5). El archivo estaba en `files_modified`.

**3. [Precisión del hallazgo 5] Afirmaciones de mercado.** El SUMMARY de 02-03 decía que "los ads se encarecen" y "el orgánico se abarata" no existen en el doc. Verificado contra el YAML: existen dentro del paréntesis de `results.items[0].body`; lo que falta es que aparezcan como afirmaciones sueltas en "Por qué ahora". La sección 5 del archivo de hallazgos lo dice con precisión. Del mismo modo, la "brecha de la guarda" `VERIFICAR_RE` que 02-03 reportó ya está corregida en el código (`/\[VERIFICAR[^\]]*\]?/gi`).

**4. [Tope de HTML] Vigente desde 02-06:** 81 920 crudos y 25 600 con gzip, no los 61 440 del texto del plan, como indicó el orquestador. Es un ajuste heredado, no de esta tarea.

**5. [Medición] Degradados.** La prueba cuenta como degradado solo el `gradient` con más de un color o no lineal (ver Decisions). Documentado en el log.

Tarea 1: sin desviaciones; el bloque de axe se dejó desde el tracer en sus tres anchos y dos rutas (más medición, no menos).

## Lo que queda para Juan

Los 10 pendientes de `02-VISUAL-LOG.md` (movimiento real con ambas preferencias, VoiceOver sobre el FAQ y el iframe de ClickUp con teclado, aprobar avatares, favicon, variantes de logo, morado, palabras de las píldoras y fotos, propuestas opcionales de la crítica, fase 3), más la desviación 1 de arriba.

## Lo que queda para Ari

Todo `02-ARI-FINDINGS.md`: las 12 decisiones, el texto que falta, lo que confirma, las erratas y la pregunta de la sección 5. La página sigue mostrando "FALTA CONFIRMAR" donde falta el dato y `PUBLIC_ENV=production npm run build` sigue bloqueado por copy y por fotos hasta que responda.

## Known Stubs

None. Los rellenos "FALTA CONFIRMAR" son intencionales, están en `PENDING-COPY.md` y cada uno aparece en `02-ARI-FINDINGS.md`.

## Threat Flags

None: este plan no añadió endpoints, rutas de autenticación ni acceso a archivos; solo pruebas, un ajuste de CSS y documentos.

## Self-Check: PASSED

- `.planning/phases/02-secciones-marca-y-copy/02-ARI-FINDINGS.md` (f8d82c5), `tests/e2e/phase-closing.spec.ts` (05919aa y 3d97955), `src/components/CtaLink.astro` (3d97955), `02-VISUAL-LOG.md` (2e37e32 y f8d82c5), `package.json` y `package-lock.json` (b1f3905) existen y están commiteados; `git diff --name-only d0ac3f7 HEAD` está contenido en `files_modified` más `src/components/CtaLink.astro` (el único cambio de `polish`).
- Ningún servidor preview quedó corriendo (`lsof -i :4322` vacío); `astro dev` del usuario no se tocó.

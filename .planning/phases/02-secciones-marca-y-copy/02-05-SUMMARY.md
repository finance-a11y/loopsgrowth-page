---
phase: 02-secciones-marca-y-copy
plan: 05
subsystem: ui
tags: [astro, copy, yaml, playwright, team, avatars, includes, how-it-works, visual-cycle]
status: complete
plan_head_before: ac77d7a4e23d1e75341ba39b3d125cc0e5dd8b6d
# commits es el conteo medido del libro (git rev-list --count plan_head_before..HEAD): 3 commits de tareas, 2 de resúmenes parciales, el resumen final y el de estado y hoja de ruta.
commits: 7
completed: 2026-09-20
actuals:
  tokens: 14100
  tasks: 3
  commits: 7
requirements-completed: [CONT-07, CONT-08, CONT-09, COPY-01, DSGN-04]

provides:
  - "Quiénes somos (#nosotros, tono yellow): cuatro tarjetas pop con avatar Loopy oficial de 02-10, nombre y cargo del doc de Ari; cuatro nombres pending por consentimiento"
  - "Qué incluye (#incluye, tono light): seis entregables abiertos con disco de check; el primer título es FALTA CONFIRMAR y el texto del doc con AEO no llega a dist"
  - "Cómo funciona (#como-funciona, tono dark): ol de cuatro fases con disco numerado, conector discontinuo naranja y chip de plazo; cuatro plazos pending"
  - "Esquema estricto (team 4, includes.items 6, how_it_works.steps 4), guarda copy-team-includes-how derivada del YAML y PENDING-COPY.md con 36 pendientes"
  - "team-includes-how.spec.ts con mediciones a cinco anchos (desborde, espaciado de texto SC 1.4.12, contraste, tarjetas, movimiento, peso, sin JavaScript) y la herramienta de capturas por lote"
  - "Entradas de 02-VISUAL-LOG.md: Lote C (equipo) rondas 0 y 1; Lote D (incluye y cómo funciona) rondas 0 y 1"

key-files:
  created:
    - src/components/sections/Team.astro
    - src/components/sections/Includes.astro
    - src/components/sections/HowItWorks.astro
    - tests/e2e/team-includes-how.spec.ts
    - tests/guards/copy-team-includes-how.test.mjs
  modified:
    - src/content/landing.es.yaml
    - src/content.config.ts
    - src/pages/index.astro
    - PENDING-COPY.md
    - tests/e2e/collage-language.spec.ts
    - .planning/phases/02-secciones-marca-y-copy/02-VISUAL-LOG.md

key-decisions:
  - "Los avatares se asignan por posición desde la constante AVATARS de Team.astro y no desde el YAML (una cadena suelta dentro de es rompe la guarda FND-02)."
  - "No hay clase de tarjeta pop compartida: Team.astro lleva estilos locales con los tokens --border-pop, --shadow-pop, --radius-card y --card-pad."
  - "Los títulos reservan dos líneas con min-height: 2lh (no una altura fija) desde 64 em: los cargos y los chips de plazo quedan alineados sin romper el espaciado de texto de SC 1.4.12."
  - "El tope de HTML de 61440 bytes no se tocó: dist/index.html mide 56810 bytes crudos (11472 con gzip) al cierre."
---

# Phase 2 Plan 05: Quiénes somos, Qué incluye y Cómo funciona Summary

Tres secciones con el copy de Ari sin tocar (equipo con avatares Loopy oficiales, seis entregables abiertos y cuatro fases con riel y plazo), con mediciones a cinco anchos y dos ciclos visuales registrados; los nueve textos sin respaldo salen como pending y siguen bloqueando el build de producción.

## Hecho

**Tarea 1, commit `28f0d1c`:** YAML `team` (titular y cuatro cargos `verified`; cuatro nombres `pending`), esquema con `.length(4)`, `Team.astro` (`SectionShell id="nosotros" tone="yellow"`, `ul[role=list]` de cuatro `li.team-card`, `Avatar` por posición, `h3` y `p.team-role` solo con nodos de texto), `<Team />` tras `<Cases />`, spec de estructura y guarda derivada del YAML.

**Tarea 2, commit `485720e`:** YAML `includes` (título y seis entregables `verified`, salvo `includes.items[0].title`, `pending` con `text: FALTA CONFIRMAR` y el texto del doc con AEO solo en `reason`) y `how_it_works` (título, cuatro fases `verified` y cuatro `timeframe` `pending`), esquema con `.length(6)` y `.length(4)`, `Includes.astro` (ítems abiertos con borde superior de 3 px y disco de check SVG), `HowItWorks.astro` (`ol` con contador CSS, conector discontinuo vertical hasta 1023 px y horizontal desde 1024 px, chip de plazo), guarda ampliada y spec de los dos bloques.

**Tarea 3, commit `c129dde`:**
- Mediciones a cinco anchos en `team-includes-how.spec.ts` (de 33 a 48 pruebas más 15 de capturas): (1) sin desborde y rectángulos dentro de `[0, innerWidth]` a 320, 390, 768, 1024 y 1280 px; (2) espaciado de texto de SC 1.4.12 a 320 y 1280 px sin recorte en h3, cargo, descripciones y chip; (3) contraste medido con `contrastRatio` (texto de 4.5 o más; borde del chip y del disco de check de 3 o más); (4) tarjetas de equipo con borde sólido oscuro de 3 px, sombra sin desenfoque, cursor no pointer, sin transform con `hover()`, mismo radio y avatares de 96 px (390) o 120 px (desde 640); (5) cero animaciones y cero transiciones con `reduce` y con `no-preference`; (6) peso: las tres secciones en 20480 caracteres o menos y `/` por debajo de 61440 bytes; (7) sin JavaScript, las tres secciones y todos los textos del YAML visibles; (8) capturas por `PHASE2_BATCH` (`C-equipo`, `D-incluye-como`; 15 archivos por lote: cinco anchos por base, `reduce` y `nojs`).
- Ninguna medición falló contra la construcción de las tareas 1 y 2; las dos correcciones salieron de la crítica visual.
- **Skills invocadas** con la herramienta Skill en la tarea 3: `impeccable` (contexto ya cargado, sin entrevista; `critique`, `layout`, `colorize`, `typeset`, `clarify` y `adapt` como lente) y `design-taste-frontend` (diales 7, 3 y 4). La crítica corrió en un solo contexto porque esta sesión no expone sub agentes aislados. Las capturas se juzgaron contra `brand-inventory/moodboard.png` y `ai_a.png` (herramienta Read).
- **Un solo lote de correcciones (por lote):** lote C, `Team.astro`: `h3` con `min-height: 2lh` desde 64 em (el nombre de dos líneas de Verónica Romero desalineaba su cargo 30 px) y avatar compensado con `margin-inline-start: -6.7%` (el disco arrancaba 7 u 8 px a la derecha del nombre por el aire del arte oficial); lote D, `HowItWorks.astro`: `h3` con `min-height: 2lh`, `.step` con filas `auto 1fr` y chip de plazo al pie desde 64 em (los chips quedaban a alturas distintas). Ronda de confirmación de una pasada por lote, sin repetir ciclos.
- **Registro:** `02-VISUAL-LOG.md`, "Lote C (equipo), ronda 1", "Lote D (incluye y cómo funciona), ronda 0" y "ronda 1", con verbos, hallazgos, correcciones, rutas de capturas y rasgos de la lista de vibra (3, 5 y 7 cumplidos).

## Resultado de las pruebas (cierre)

- Playwright completo con ClickUp bloqueado (`npm run test:e2e:isolated`, proyecto chromium): **372 pasadas, 85 omitidas (capturas sin `PHASE2_BATCH`), 0 fallos.**
- Guardas: `node --test tests/guards/*.test.mjs` 168 de 168; `node scripts/check-contrast.mjs` 14 de 14; `node scripts/list-pending.mjs --check` sale 0 (36 pendientes).
- Capturas: 15 de `C-equipo` y 15 de `D-incluye-como` en `test-results/phase2/` (no versionadas).
- `npm run build` verde; `PUBLIC_ENV=production npm run build` falla solo por afirmaciones PENDING (`how_it_works.steps[0..3].timeframe`, entre otras); la comprobación JSON de producción da 0 estructurales y solo reglas PENDING y MISSING.
- `grep`: `height:` fijo en las tres secciones 0, `set:html` 0, hex en `src/components/sections` 0, `outline: none` 0, `line-height ... !important` 0. Únicos hosts `https://` de `dist/index.html`: `app-cdn.clickup.com` y `forms.clickup.com`.
- Presupuesto de HTML: `dist/index.html` 56810 bytes crudos y 11472 con gzip (tope UI-SPEC 61440). Quedan 4630 bytes crudos para el plan 02-06.
- Ningún servidor en marcha por este ejecutor (`npx astro preview stop` ejecutado); el `astro dev` del usuario no se tocó.

## Erratas del doc

Presentes en el doc de Ari (`02-ARI-COPY-V2.md`, sección 6) y **no mostradas** en la página, por el Supuesto 1 (sin biografías ni introducción): "agil", "traves", "direccion", "técnico.Coach SEO" pegado y "Coach SEO en aprendoclub" sin punto final.

De la sección 7, mostrada **tal cual**: "Estrategia a 6-12 meses, para que sepas qué haremos, cuándo y cuándo esperar resultados" (línea 154 del doc; "cuándo y cuándo" repetido, probablemente "cuándo y qué esperar"). No se corrigió porque el copy de Ari no se edita.

## Hallazgos para Ari

1. **Título del primer entregable de Qué incluye:** el doc trae "Auditoría SEO + AEO completa", con el término AEO que la regla del proyecto prohíbe en la página. Se muestra `FALTA CONFIRMAR` y el texto original queda solo en `reason`. Ari debe dar el título sin AEO (por ejemplo con "GEO" o solo "SEO").
2. **Consentimiento de los cuatro integrantes:** los nombres (Arianna Lupi, Verónica Romero, Juan Angulo, Miguel Pacheco) están `pending` hasta que cada persona confirme que aparece con nombre y cargo.
3. **Plazos de las cuatro fases** (30 min, 2 semanas, 6-12 meses, mes 12+): `pending` para confirmar. Además, el plazo de la fase 1 dice **"30 min"** y el embudo habla de una llamada de **20 min**: Ari debe decidir cuál es el correcto.
4. **Biografías e introducción del equipo:** existen en el doc (sección 6) pero no se muestran (Supuesto 1, sin biografías). Ari decide si se agregan.
5. **Afirmaciones de resultado en las fases 2 y 4 para que las revise:** "Análisis profundo, 10-20 oportunidades principales, plan claro e inversión concreta" y "El orgánico trae clientes solo; nosotros seguimos optimizando y escalando" (esta última promete resultado sin respaldo).
6. **"cuándo y cuándo"** en "Estrategia a 6-12 meses" (ver Erratas): confirmar la frase correcta.
7. **Descripciones de Qué incluye:** las seis empiezan en minúscula con "para que..." y se leen como continuación del título ("Contenido estratégico para que rankees en Google..."), pero en pantalla ocupan una línea aparte bajo el título. Confirmar si se quiere así o con mayúscula inicial.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] La guarda de escenas de collage contaba los avatares nuevos**
- **Found during:** cierre de la tarea 3 (suite completa; la tarea 1 no la corrió porque solo se ejecutaron tres specs)
- **Issue:** `collage-language.spec.ts` contaba como "escenas" todo `[data-collage]` salvo el sprite y la pieza suelta; los cuatro avatares `data-collage="avatar"` de Quiénes somos elevaban el conteo (falló 1 de 372).
- **Fix:** el selector excluye también `[data-collage="avatar"]` y la prueba afirma aparte que hay exactamente cuatro avatares, igual que la pieza suelta de Casos.
- **Files modified:** `tests/e2e/collage-language.spec.ts` (fuera de `files_modified` del plan)
- **Commit:** `c129dde`

### Otras notas

- **Presupuesto de HTML:** no fue necesario subir ningún tope (56810 bytes crudos, 11472 con gzip); ninguna guarda se tocó. Aviso para Juan: quedan 4630 bytes crudos bajo 61440 para el plan 02-06 (la autorización de subir a 81920 crudos con 25600 con gzip sigue vigente para ese plan).
- **Crítica sin sub agentes:** `impeccable critique` corrió en un solo contexto y sin instantánea, por falta de herramienta de sub agentes en esta sesión (mismo antecedente que el lote C1).
- **Ronda 0 del lote D registrada en la tarea 3:** la entrada del log de la construcción del lote D se escribió junto con la ronda 1, como se había anotado en el resumen parcial.
- **Costo de las correcciones de alineación:** las tarjetas de nombre corto quedan con una línea de aire extra entre nombre y cargo (equipo) y entre título y descripción (fases) a 1024 y 1280 px; es el precio de alinear con `2lh` sin alturas fijas.
- **Observación de diseño abierta (para 02-08 y Ari):** las variantes amarillas de avatar comparten color con el fondo amarillo de la sección; sobre la tarjeta blanca se separan por la sombra dura y la lupa morada y se leen bien.

## Known Stubs

Ninguno. Los nueve textos `pending` (cuatro nombres, `includes.items[0].title` y cuatro plazos) se muestran tal cual, están listados en `PENDING-COPY.md` y bloquean `PUBLIC_ENV=production`, por diseño.

## Threat Flags

Ninguno: sin endpoints, rutas de autenticación, acceso a archivos ni cambios de esquema en una frontera de confianza. Las tres secciones no tienen enlaces, botones ni `tabindex`, y no hay `set:html`.

## Self-Check: PASSED

- FOUND: src/components/sections/Team.astro, Includes.astro, HowItWorks.astro
- FOUND: tests/e2e/team-includes-how.spec.ts, tests/guards/copy-team-includes-how.test.mjs
- FOUND: commits 28f0d1c, 485720e y c129dde
- FOUND: entradas "Lote C (equipo), ronda 1" y "Lote D (incluye y cómo funciona), ronda 1" en 02-VISUAL-LOG.md

---
phase: 01-fundaciones-y-formulario-funcionando
plan: 04
subsystem: ui
tags: [playwright, clickup, iframe, form-height, cls, tokens, measurement]

requires:
  - phase: 01-fundaciones-y-formulario-funcionando
    provides: "Plan 03: seccion #agenda con tarjeta .form-embed, iframe de ClickUp con min-height por token y specs base"
provides:
  - "--form-min-h-sm 1664px y --form-min-h-lg 1536px en tokens.css, medidos en Chromium 153 (multiplos de 8), sin scroll interno del formulario"
  - "tests/e2e/form-measure.spec.ts: altura natural del formulario a 320, 390, 768, 1024 y 1280 px, CLS, scroll interno y aserciones de reserva (solo lectura)"
  - "tests/e2e/form-live.spec.ts: comprobacion previa de solo lectura de FORM-05 (campos visibles, capturas, form-fields.json)"
  - "01-FORM-MEASUREMENTS.md con la tabla, los tokens, los campos visibles, la tabla vacia de FORM-05 y los hallazgos para Ari"
affects: [phase-03, phase-04]

status: complete
plan_head_before: 15d42500ada07ecf415562bafc42f27cc6d6c37f

actuals:
  tokens: 17000
  tasks: 2
  commits: 2

requirements-completed: [FORM-04]
requirements-pending: [FORM-05]

coverage:
  - id: D1
    description: "Reserva de altura medida del formulario: --form-min-h-sm 1664px y --form-min-h-lg 1536px; el formulario cabe sin scroll interno (0 px) en los cinco anchos"
    requirement: "FORM-04"
    verification:
      - kind: e2e
        ref: "tests/e2e/form-measure.spec.ts (medicion por ancho y reserva por rango)"
        status: pass
    human_judgment: false
  - id: D2
    description: "CLS de la carga del formulario menor a 0.1 (medido 0 en los cinco anchos) y script de ClickUp enganchado al iframe con loading=lazy"
    requirement: "FORM-04"
    verification:
      - kind: e2e
        ref: "tests/e2e/form-measure.spec.ts (CLS y style.height en linea)"
        status: pass
    human_judgment: false
  - id: D3
    description: "El formulario se renderiza dentro del iframe a 390 y 1280 px (5 campos de texto visibles y 6 listas) y los specs son de solo lectura"
    requirement: "FORM-01"
    verification:
      - kind: e2e
        ref: "tests/e2e/form-live.spec.ts; grep de .fill/.click/.press/.check/.selectOption/.type sin resultados en ambos specs"
        status: pass
    human_judgment: false
  - id: D4
    description: "Envio real de prueba a 1280 y 390 px: confirmacion de ClickUp dentro del iframe, tarea creada en la Lista de Ari y borrada por Juan; hueco en blanco bajo la confirmacion"
    requirement: "FORM-05"
    verification: []
    human_judgment: true
    rationale: "Un envio crea una tarea real en la Lista de ClickUp de Ari: lo hace Juan a mano (tres bloques human-check de 01-04-PLAN.md, que el verificador consolida en 01-UAT.md). Pendiente."

duration: 15min
completed: 2026-09-19
---

# Phase 1 Plan 04: Medicion del formulario y comprobacion previa de FORM-05 Summary

**La reserva del iframe de ClickUp queda medida en Chromium (`--form-min-h-sm` 1664 px y `--form-min-h-lg` 1536 px, que sustituyen a 1100 y 900 px, con los que el formulario quedaba con hasta 634 px de scroll interno) y los dos specs de solo lectura pasan; los dos envios reales de FORM-05 quedan pendientes de Juan.**

## Performance

- **Duration:** 15 min (2026-09-19T02:52Z a 03:08Z)
- **Tasks:** 2 de 2 (Task 2 con tres bloques `human-check` pendientes)
- **Files modified:** 6 (2 specs nuevos, `a11y-base.spec.ts`, `tokens.css`, `01-FORM-MEASUREMENTS.md`, `WINDOWS.md`)

## Accomplishments

- **Tracer de altura (Task 1).** El spec mide la altura natural del formulario (`scrollHeight` de `cu-form` con el iframe sin reserva) y los tokens salen de la regla `(floor(max / 8) + 1) * 8` por rango.
- **Comprobacion previa de FORM-05 (Task 2).** El spec abre el formulario real a 1280 y 390 px, lee campos, botones y textos sin tocar nada, y deja `test-results/form-fields.json` y dos capturas (no versionados). Las capturas muestran la tarjeta completa, sin scroll interno ni recortes.
- **Documento de medicion para Ari.** `01-FORM-MEASUREMENTS.md` recoge la tabla, los hallazgos y la lista de 11 campos, y trae la tabla "Resultado de FORM-05" para que Juan la complete.

## Alturas medidas y tokens elegidos

Chromium 153.0.8010.12, ventana de 900 px de alto, build de produccion.

| Ancho | Tarjeta | Contenido | `min-height` | Scroll interno | CLS |
|---|---|---|---|---|---|
| 320 px | 288 px | 1659 px | 1664 px (sm) | 0 | 0 |
| 390 px | 358 px | 1555 px | 1664 px (sm) | 0 | 0 |
| 768 px | 707 px | 1534 px | 1664 px (sm) | 0 | 0 |
| 1024 px | 532 px | 1534 px | 1536 px (lg) | 0 | 0 |
| 1280 px | 607 px | 1534 px | 1536 px (lg) | 0 | 0 |

`--form-min-h-sm: 1664px` y `--form-min-h-lg: 1536px`. Con los valores iniciales (1100 y 900 px) el spec fallo en la asercion de reserva (no en auto-resize ni en campos), como pedia el plan, y el formulario quedaba con scroll interno de 559, 455, 434 y 634 px.

## Resultado de los envios humanos (FORM-05)

**Pendiente.** Ningun envio se hizo ni se hara desde una prueba automatica: los specs de este plan no llenan, no hacen clic y no envian. Los tres bloques `human-check` de la Task 2 (escritorio a 1280 px, movil a 390 px, y comprobacion y borrado de las dos tareas en la Lista de Ari) quedan para Juan y el verificador los consolida en `01-UAT.md` al cierre de la fase. El resultado se anota en la tabla "Resultado de FORM-05" de `01-FORM-MEASUREMENTS.md`. Antes de enviar, avisar a Ari (se crean dos tareas de prueba y pueden disparar notificaciones), poner "PRUEBA" y la fecha en el nombre y borrar las dos tareas al terminar. Sitio listo con `npm run dev` (`http://localhost:4321`) o `npm run dev:lan` para el telefono. FORM-05 no se marca completo hasta que Juan lo confirme.

## Hallazgos para Ari

1. **El auto-resize de ClickUp no sigue al contenido.** El script `forms-embed/v1.js` se engancha al iframe con `loading="lazy"` (deja `style.height` en linea en los cinco anchos), pero el formulario solo reporta la altura del propio iframe (150 px sin reserva). El contenido real es de 1534 a 1659 px. La reserva medida hace de altura efectiva. Ari debe verificar que "Autosize embed height" este activo en la configuracion para compartir el formulario.
2. **Idioma.** El documento del formulario declara `lang="en-US"`; las etiquetas estan en espanol, pero quedan "Submit", "Select option..." y "Apply with your full legal name." en ingles. No se corrige desde la landing. La confirmacion de envio se observa en el envio humano.
3. **Terminologia.** El titulo del formulario dice "Servicios de SEO/AIO" y la landing usa SEO/GEO.
4. **Campos ocultos `utm_*` (MEAS-02).** No existen (0 campos ocultos en el marco); los crea Ari.
5. **Marca de ClickUp visible** ("Productivity by ClickUp", "Report Abuse") en el pie; el plan de ClickUp lo anota Juan tras los envios.
6. **Campos.** 11 preguntas, todas obligatorias: 5 de texto (el correo es `type=text`) y 6 listas personalizadas que no son `select` nativos. Su accesibilidad interna es de ClickUp (`EXCEPTIONS.md` de la Fase 3).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug en el plan] Medir el `style.height` del iframe es una medicion circular**
- **Found during:** Task 1
- **Issue:** el primer spec (como lo pedia el plan) devolvio como "altura medida" exactamente el `min-height` vigente (1100 y 900 px). El formulario usa `height: 100%` con un contenedor interno `cu-form` con scroll, y iframe-resizer solo reporta la altura del iframe (150 px sin reserva, 4000 px si se le dan 4000). Con el plan tal cual, los tokens se habrian calculado desde su propio valor.
- **Fix:** el spec mide en una fase "natural" (nuestra pagina con `min-height: 0` en el iframe, sin tocar el formulario) el `scrollHeight` de `cu-form`. Se conserva la asercion del plan de que `style.height` no queda vacio (el script se engancha con carga diferida) y se agrego una asercion de que la reserva publicada no deja scroll interno (<= 8 px). Documentado en `01-FORM-MEASUREMENTS.md`. Anotado en `.planning/WINDOWS.md`.
- **Files modified:** `tests/e2e/form-measure.spec.ts`
- **Commit:** `48904db`

**2. [Rule 1 - Bug] Prueba (e2) de Plan 03 con los valores provisionales fijos**
- **Found during:** verificacion completa de la Task 2
- **Issue:** `tests/e2e/a11y-base.spec.ts` (e2) esperaba literalmente `1100px` y `900px`, que este plan reemplaza; fallaba.
- **Fix:** la prueba lee `--form-min-h-sm` y `--form-min-h-lg` de `src/styles/tokens.css`.
- **Files modified:** `tests/e2e/a11y-base.spec.ts`
- **Commit:** `670abf3`

**Total deviations:** 2 auto-fixed (2 Rule 1). **Impact:** el metodo de medicion difiere del plan (mas fiel), sin cambio de alcance ni de contrato visual. Las skills `impeccable` y `design-taste-frontend` no se invocaron: el plan solo cambia dos valores de token por medicion, sin diseno nuevo.

## Decision abierta para Juan

Un solo token por rango deja sobrante bajo el formulario a 390 px (109 px) y 768 px (130 px), mas los 80 px de relleno de ClickUp; una reserva menor dejaria scroll interno a 320 px. Si se quiere pulir, un token intermedio medido a 390 y 768 px. No se aplico porque cambia la estructura de tokens del plan. Tambien queda pendiente la decision sobre el hueco tras la confirmacion de envio (provisional: se mantienen los tokens; Juan la confirma en los envios humanos).

## Fallos por red

Ninguno. `curl` del formulario y de `forms-embed/v1.js` devolvio 200 el 2026-09-19 a las 02:52 UTC antes de las pruebas; los specs corrieron sin timeouts (carga de la maquina alta pero sin efecto). Suite completa: `npx playwright test` 49 de 49 (1.6 min) y `npm run build` con guardas OK.

## Known Stubs

- `HeroSkeleton`, wordmark de texto y textos `pending` de Ari siguen provisionales (heredados de los Planes 02 y 03; los reemplazan las Fases 2 y 3).
- La entrada "tokens form-min-h provisionales" del ledger `WINDOWS.md` queda `fixed`.

## Threat Flags

Ninguna superficie nueva. Mitigaciones: T-04-01 y T-04-03 (los specs son de solo lectura; `grep` de `.fill(`, `.click(`, `.press(`, `.check(`, `.selectOption(` y `.type(` sin resultados en `form-measure.spec.ts` y `form-live.spec.ts`; ninguna tarea se creo en ClickUp), T-04-02 (`git ls-files test-results playwright-report` devuelve 0).

## Self-Check: PASSED

- Archivos existentes: `tests/e2e/form-measure.spec.ts`, `tests/e2e/form-live.spec.ts`, `src/styles/tokens.css`, `01-FORM-MEASUREMENTS.md`.
- Commits `48904db` y `670abf3` existen; `git rev-list --count 15d4250..HEAD` da 2 antes de este resumen.
- Aceptacion: tokens multiplos de 8 (1664 y 1536), `test-results/form-measure.json` y `form-fields.json` existen y no estan versionados, ambos specs pasan, seccion "Campos visibles del formulario" y "Resultado de FORM-05" presentes.
- Sin procesos propios abiertos: `astro preview` detenido (`http=000` en 4322); `astro.config.mjs` sin cambios.

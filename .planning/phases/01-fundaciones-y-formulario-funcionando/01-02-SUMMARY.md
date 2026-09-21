---
phase: 01-fundaciones-y-formulario-funcionando
plan: 02
subsystem: infra
tags: [tokens, tailwind-theme, wcag-contrast, copy-guard, node-test, tdd, prebuild, postbuild, pending-list]

requires:
  - phase: 01-fundaciones-y-formulario-funcionando
    provides: "landing.es.yaml con {text, status, confirm_by?, reason?}, esquema estricto y el proyecto Astro 7 + Tailwind 4"
provides:
  - "src/styles/tokens.css: primitivos de marca en @theme static, tonos semánticos light y purple, escala tipográfica de 4 roles, forma, foco, movimiento y reserva del iframe"
  - "scripts/check-contrast.mjs: 9 pares aprobados con ratios medidos, pares semánticos por tono y 6 pares prohibidos como fixtures negativos"
  - "scripts/check-copy.mjs: guarda de copy (YAML en prebuild, dist en postbuild); bloquea solo con PUBLIC_ENV=production salvo el contrato estructural"
  - "scripts/list-pending.mjs y PENDING-COPY.md versionado con las cinco afirmaciones pending de la Fase 1"
  - "Scripts npm prebuild, postbuild, check:contrast, check:copy, pending y test:guards, con 47 pruebas node:test"
affects: [01-03, 01-04, phase-02, phase-03, phase-04]

plan_head_before: 436014cfc0eaac3997505d08f9003b3d1914e11b

actuals:
  tokens: 14700
  tasks: 3
  commits: 5

tech-stack:
  added: []
  patterns:
    - "Tokens de tres niveles: primitivos en @theme static, semánticos por tono en [data-tone], componentes solo consumen semánticos"
    - "Guardas como CLI de Node con líneas PASS/FAIL o FAIL/WARN, código de salida y --json, más un módulo puro en scripts/lib reutilizable"
    - "Entorno resuelto con loadEnv de vite, igual que astro.config.mjs; solo el valor exacto production bloquea"
    - "Pruebas TDD basadas en el CLI (spawnSync) con fixtures fuera de src y casos armados en os.tmpdir()"

key-files:
  created:
    - src/styles/tokens.css
    - scripts/lib/contrast.mjs
    - scripts/check-contrast.mjs
    - scripts/lib/copy-rules.mjs
    - scripts/check-copy.mjs
    - scripts/list-pending.mjs
    - tests/guards/contrast.test.mjs
    - tests/guards/copy.test.mjs
    - tests/guards/list-pending.test.mjs
    - tests/guards/fixtures/ (diez YAML: clean, pending, verificar, voseo, voseo-accent-final, em-dash, en-dash, aeo, bare-string, bad-status)
    - PENDING-COPY.md
  modified:
    - src/styles/global.css
    - package.json
    - .planning/WINDOWS.md

key-decisions:
  - "Los 6 pares prohibidos se miden contra el umbral más bajo (3), no contra 4.5: un par prohibido debe fallar incluso como UI, lo que refuerza la prueba de la calculadora"
  - "Un par semántico declarado en un tono que coincida con un par prohibido falla con el mensaje 'par prohibido' además del umbral, para que el motivo sea explícito"
  - "parseTokens solo toma como tono un bloque con [data-tone=...]; un :root suelto (movimiento reducido) nunca se toma por el tono claro"
  - "check-copy imprime FAIL a stderr y WARN a stdout; --json siempre imprime un único objeto en stdout con structural y content"
  - "list-pending usa una línea de generación constante (sin la ruta que se pasó a --file) para que la salida no dependa del entorno ni del directorio de trabajo"

patterns-established:
  - "TDD con RED verificado por gsd check tdd-red-evidence (RED_EVIDENCE_OK) y commit test() antes del feat()"
  - "Todo scan del copy pasa por walkClaims: check-copy y list-pending comparten el mismo recorrido, así la lista de pendientes no puede omitir un pending que la guarda ve"

requirements-completed: [FND-02, FND-03, COPY-02]

coverage:
  - id: D1
    description: "tokens.css es la fuente única de los cuatro colores de marca y el blanco, con tonos semánticos light y purple, y Tailwind emite todas las variables en dist"
    requirement: FND-03
    verification:
      - kind: integration
        ref: "npm run build; grep -rl -- --form-min-h-sm dist; grep de --color-brand-purple y --surface en el CSS emitido; grep de hex en src (.astro y .ts) sin resultados"
        status: pass
    human_judgment: false
  - id: D2
    description: "check-contrast verifica los 9 pares aprobados con sus ratios medidos, los pares de cada tono y los 6 prohibidos, y un token cambiado o un par prohibido en un tono rompe el script"
    requirement: FND-03
    verification:
      - kind: unit
        ref: "tests/guards/contrast.test.mjs (10 pruebas: 15 ratios, mutaciones #777777, on-cta blanco 2.89, focus-ring oscuro 1.66, par prohibido en tono)"
        status: pass
    human_judgment: false
  - id: D3
    description: "prebuild encadena contraste y copy antes de astro build y postbuild escanea dist; producción falla con las cinco pending"
    requirement: COPY-02
    verification:
      - kind: integration
        ref: "npm run build sale 0 sin PUBLIC_ENV; PUBLIC_ENV=production npm run build sale 1 en prebuild con las cinco rutas pending; PUBLIC_ENV=production check-copy --dist dist sale 0 sobre el sitio real"
        status: pass
    human_judgment: false
  - id: D4
    description: "check-copy detecta PENDING, MISSING (FALTA CONFIRMAR), VERIFICAR, VOSEO con vocal acentuada final, DASH y AEO; el contrato estructural falla en cualquier entorno; .env y process.env activan el bloqueo; es de solo lectura"
    requirement: COPY-02
    verification:
      - kind: unit
        ref: "tests/guards/copy.test.mjs (29 pruebas, incluidos .env por --root, textos estructurales y modo --dist)"
        status: pass
    human_judgment: false
  - id: D5
    description: "PENDING-COPY.md se genera de forma determinista con una fila por pending y --check detecta un archivo desactualizado"
    requirement: FND-02
    verification:
      - kind: unit
        ref: "tests/guards/list-pending.test.mjs (8 pruebas: encabezado exacto, valores por defecto, determinismo entre entornos y cwd, escape de celdas, --check, lista vacía, FALTA CONFIRMAR y YAML real)"
        status: pass
      - kind: integration
        ref: "npm run pending && node scripts/list-pending.mjs --check y 5 filas con Ari; PUBLIC_ENV=production y local dejan el archivo idéntico"
        status: pass
    human_judgment: false
  - id: D6
    description: "El copy de Ari (h1, subtítulo e intro) no dispara VERIFICAR, VOSEO, DASH, AEO ni MISSING, y la decisión de qué texto se aprueba sigue siendo humana"
    requirement: COPY-02
    verification:
      - kind: integration
        ref: "PUBLIC_ENV=production node scripts/check-copy.mjs --json: 0 estructurales y solo cinco violaciones PENDING"
        status: pass
    human_judgment: true
    rationale: "Que un texto pending pase a verified requiere la aprobación de Ari (Fase 4, LNCH-03); ninguna guarda puede ni debe decidirlo"

duration: 37min
completed: 2026-09-19
status: complete
---

# Phase 1 Plan 02: Guardas de contraste y copy Summary

**Tokens de marca en tokens.css como única fuente de color, con check-contrast (9 pares aprobados, 6 prohibidos) y check-copy (pending, FALTA CONFIRMAR, [VERIFICAR], voseo con límites Unicode, guiones y AEO) encadenados en prebuild y postbuild, más PENDING-COPY.md generado de forma determinista.**

## Performance

- **Duration:** 37 min (incluye una parada transitoria del sistema de unos 110 s en una prueba, sin relación con el código)
- **Started:** 2026-09-19T01:40:43Z
- **Completed:** 2026-09-19T02:17:51Z
- **Tasks:** 3 (Task 1 tracer, Tasks 2 y 3 TDD)
- **Files modified:** 22 archivos del plan (más WINDOWS.md y este SUMMARY)

## Accomplishments

- Los cuatro colores de marca más el blanco existen una sola vez (`tokens.css`); ningún `.astro` ni `.ts` de `src` repite un hex. El CSS emitido en `dist` conserva todas las variables gracias a `@theme static`.
- `check-contrast` reproduce los 15 ratios medidos (9 aprobados, 6 prohibidos) con tolerancia de 0.01 y falla con el par nombrado ante las tres mutaciones exigidas (`#777777`, `--on-cta` blanco sobre naranja 2.89, `--focus-ring` oscuro sobre morado 1.66).
- `PUBLIC_ENV=production npm run build` falla en `prebuild` con las cinco rutas pending; sin producción el build pasa, incluido `postbuild`. El sitio real no contiene `FALTA CONFIRMAR` (`check-copy --dist dist` sale 0 en producción).
- `PENDING-COPY.md` versionado lista exactamente las cinco pending, en el orden del YAML, y `--check` queda listo para la Fase 4.
- 47 pruebas `node:test` (10 de contraste, 29 de copy, 8 de la lista) en verde.

## Task Commits

1. **Task 1: Tracer de contraste** - `d4d6e41` (feat). Tracer verificado de punta a punta (pruebas, `check-contrast`, `npm run build` con `prebuild`); expansión autorizada.
2. **Task 2: Guarda de copy** - RED `11da2bf` (test, RED_EVIDENCE_OK con 29 fallos por aserción), GREEN `6aced84` (feat).
3. **Task 3: Lista de pendientes** - RED `b213ef7` (test, RED_EVIDENCE_OK con 8 fallos por aserción), GREEN `390258f` (feat).

No hubo commit de refactor: el código no lo necesitó.

## Afirmaciones pending que hoy bloquean producción

Son las mismas de `PENDING-COPY.md` (Quién confirma: Ari en las cinco). Ari debe aprobarlas en la Fase 4 (LNCH-03); la aprobación es editar el `status` a `verified` en `landing.es.yaml`, decisión humana.

| Clave | Texto actual | Motivo |
|-------|--------------|--------|
| `brand.term` | SEO/GEO | Terminología por confirmar con Ari |
| `call.duration` | 30 minutos | Duración de la llamada por confirmar |
| `meta.title_template` | Loops Growth: agencia de {term} | Título provisional derivado de brand.term; la Fase 3 lo reemplaza |
| `hero.subtitle` | Un equipo dedicado y especializado que ejecuta tu {term} y tu visibilidad en asistentes de IA (ChatGPT, Gemini). | Texto del Copy v2 de Ari; el término sale de brand.term, que está pending |
| `agenda.intro` | Agenda una llamada de {duration}. Sin costo y sin compromiso. Entendemos tu negocio y te decimos con honestidad si podemos ayudarte. Si no somos el equipo correcto, también te lo decimos. | Cuerpo del CTA final del Copy v2 de Ari; la duración sale de call.duration, que está pending |

## Cadenas de Ari rechazadas por las reglas de contenido

Ninguna. `hero.h1`, `hero.subtitle` y `agenda.intro` no disparan `VERIFICAR`, `VOSEO`, `DASH`, `AEO` ni `MISSING`; con `PUBLIC_ENV=production` la única regla que dispara sobre el YAML real es `PENDING` (cinco veces) y no hay violaciones estructurales. `src/content/landing.es.yaml` no se modificó en este plan.

## Deviations from Plan

None - plan executed exactly as written.

Detalles de implementación dentro del alcance del plan, no desviaciones: (1) `TONE_PAIRS` y la comprobación explícita de "par prohibido" en los tonos se agregaron para que el mensaje nombre el motivo; (2) los 6 pares prohibidos usan umbral 3 (el más bajo), coherente con "por debajo de su umbral"; (3) las pruebas de copy y de la lista se apoyan solo en el CLI para que el RED falle por aserción y no por error de carga.

**Total deviations:** 0.

## Issues Encountered

- Una ejecución de `python3` para generar los fixtures y una prueba de `list-pending` tardaron unos 110 s por una parada transitoria del sistema; el resultado fue correcto y una segunda corrida tardó 1.5 s en total. No requirió cambios.
- El hook de secretos no se activó: ningún comando mencionó `.env` (solo `.env.example` existe en el repo; la prueba de `.env` usa un directorio temporal).

## Known Stubs

- `--form-min-h-sm` (1100px) y `--form-min-h-lg` (900px) en `src/styles/tokens.css` son valores provisionales; el Plan 04 (FORM-04) los reemplaza por los medidos en el navegador. Registrado en `.planning/WINDOWS.md`.
- Los favicons del scaffold (Plan 01) siguen pendientes de reemplazo; no cambió en este plan.

## Threat Flags

Ninguna superficie nueva fuera del modelo de amenazas del plan. Mitigaciones verificadas: T-02-02 (prueba con `.env` solo en un directorio temporal y `--root`), T-02-03 (15 ratios medidos con tolerancia 0.01 en cada corrida), T-02-04 (solo `parse` de `yaml` con el esquema por defecto), T-02-06 (el generador y la guarda comparten `walkClaims`; una prueba compara filas con `pending` del YAML real y `--check` compara byte a byte), T-02-07 (`FALTA CONFIRMAR` rechazada en el YAML por `prebuild` y en `dist` por `postbuild`). T-02-01 sigue aceptada: `status: verified` sin aprobación es control de proceso y `check-copy` imprime los conteos para que la revisión sea visible.

## TDD Gate Compliance

Las Tasks 2 y 3 llevan `tdd="true"`. RED antes de GREEN en ambas: `test(01-02)` `11da2bf` y `b213ef7` preceden a `feat(01-02)` `6aced84` y `390258f`. `gsd check tdd-red-evidence` devolvió `RED_EVIDENCE_OK` en las dos (todas las pruebas nombradas fallaron por aserción, no por error de carga). Sin fase REFACTOR.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Listo para el Plan 03 (skip links, header, hero y foco): los tonos `light` y `purple`, `--focus-ring`, `--cta-bg`, `--cta-bg-hover`, `--on-cta` y la escala tipográfica ya existen y están protegidos por contraste; cualquier tono nuevo se verifica en `prebuild`.
- Listo para el Plan 04 (FORM-04): los tokens `--form-min-h-sm` y `--form-min-h-lg` existen y `AgendaSection` ya los consume; solo falta medirlos.
- Para producción: el build fallará mientras Ari no apruebe las cinco pending (esperado; ver la tabla). `npm run pending -- --check` queda disponible para la verificación de la Fase 4.
- La rama `gsd/phase-01-fundaciones-y-formulario-funcionando` sigue pendiente de integrarse a `master`.

---
*Phase: 01-fundaciones-y-formulario-funcionando*
*Completed: 2026-09-19*

## Self-Check: PASSED

- Archivos: existen los 12 archivos con autoría o cambios de `files_modified` y los diez fixtures (`tests/guards/fixtures` tiene 10).
- Commits: `d4d6e41`, `11da2bf`, `6aced84`, `b213ef7` y `390258f` existen (`git log --oneline --all`); `git rev-list --count 436014c..HEAD` da 5.
- Verificación del plan reejecutada: `node --test tests/guards/*.test.mjs` 47 de 47, `check-contrast` con 9/9, `npm run build` sale 0 sin producción y 1 con `PUBLIC_ENV=production`, `npm run pending` deja `PENDING-COPY.md` sin cambios y `--check` sale 0, y `landing.es.yaml` no aparece en `git diff` del plan.

---
phase: 02-secciones-marca-y-copy
plan: 01
subsystem: ui
tags: [astro, tailwind, hero, collage, svg, copy, playwright, design-tokens, contrast]
status: complete
plan_head_before: 5658481fb6f0e287d4e02cd5ea302bf520047e64

requires:
  - phase: 01-fundacion-y-formulario
    provides: tokens.css con tonos light y purple, CtaLink, #agenda, guardas de copy y de contraste, pruebas e2e de la fase 1
provides:
  - "Hero completo (CONT-01) con h1, subtítulo, CTA, hero.description de Ari y HeroCollage en SVG, verificado de 320 a 1280 px"
  - "hero.description en el YAML y el esquema, y PENDING-COPY.md con siete pendientes"
  - "Cuatro tonos (light, yellow, dark, purple) con --heading, --bar, --mark, --pop-shadow-color y --collage-stroke; escala Title, --card-pad, --card-gap, --radius-card, --space-4xl y --section-y responsivo"
  - "check-contrast con cuatro tonos obligatorios, 11 pares aprobados y pares por tono, probado por mutación"
  - "SectionShell.astro y CtaLink con cuatro ubicaciones, prop href y sombra por tono"
  - "HeroCollage.astro: seis piezas nombradas (loops, lupa, ojos, clic-a, clic-b, destellos) con --i, --r y --r-from listas para que el plan 07 anime la entrada"
  - "page-structure.spec.ts: PAGE_ORDER de las 12 secciones, encabezados, cinco anchos, primer pantallazo, SVG, peso, cero animaciones, sin JavaScript y herramienta de capturas PHASE2_BATCH"
  - "PRODUCT.md, DESIGN.md y 02-VISUAL-LOG.md (lote 0 y lote A)"
affects: [02-02, 02-03, 02-04, 02-05, 02-06, 02-07, 02-08]

actuals:
  tokens: 17000
  tasks: 3
  commits: 5

tech-stack:
  added: []
  patterns:
    - "El hero imprime el texto de cada afirmación como nodo de texto y no lee su estado"
    - "Los componentes leen solo tokens semánticos del tono (--surface, --heading, --bar, --pop-shadow-color, --collage-stroke); nunca un primitivo ni un hex"
    - "Un bloque plano por tono con selector exacto [data-tone=x]; la guarda de contraste rechaza selectores compuestos y CSS anidado"
    - "Collage inline: <g class=hc-piece data-piece> exterior libre para el transform de CSS; la geometría va en un <g> interior"
    - "vector-effect: non-scaling-stroke en todo el SVG para que el trazo mida 3 px de pantalla a cualquier escala"

key-files:
  created:
    - src/components/sections/Hero.astro
    - src/components/collage/HeroCollage.astro
    - src/components/ui/SectionShell.astro
    - tests/e2e/page-structure.spec.ts
    - PRODUCT.md
    - DESIGN.md
    - .planning/phases/02-secciones-marca-y-copy/02-VISUAL-LOG.md
  modified:
    - src/content/landing.es.yaml
    - src/content.config.ts
    - src/pages/index.astro
    - src/styles/tokens.css
    - src/styles/global.css
    - src/components/CtaLink.astro
    - scripts/lib/contrast.mjs
    - tests/guards/contrast.test.mjs
    - PENDING-COPY.md
  deleted:
    - src/components/HeroSkeleton.astro

key-decisions:
  - "Orden del hero h1, subtítulo, CTA, descripción, collage (desviación 1 del plan): el CTA sube sobre la descripción por presupuesto de altura."
  - "hero.description[0] y [2] nacen pending (afirmación de mercado sobre asistentes de IA y credencial de 8 años); la [1] verified."
  - "Sobre el tono dark la tarjeta blanca se distingue por relleno y no lleva borde; la sombra naranja del CTA es decorativa (contrato del UI-SPEC)."
  - "El collage es SVG en línea con aria-hidden, sin texto, sin title y sin raster; la lupa es aro morado, cristal blanco y mango oscuro, con los aros de loop desplazados detrás para que no se lea como diana."
  - "El hero alinea el collage al centro vertical de la rejilla (align-items: center, UI-SPEC); la condición medible (collage completo dentro de 800 px a 1280x800) se cumple sin ajustes."

requirements-completed: [CONT-01, COPY-01, DSGN-03, DSGN-04]

coverage:
  - id: D1
    description: "Hero con h1, subtítulo, CTA y los tres párrafos de hero.description del doc de Ari, con h1 morado (64 px, peso 700) y padding de 64 y 96 px"
    requirement: "CONT-01"
    verification:
      - kind: e2e
        ref: "tests/e2e/page-structure.spec.ts (npm run test:e2e:isolated)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Copy nuevo pasa por esquema, guarda de producción (siete pendientes, todos PENDING) y lista de pendientes determinista"
    requirement: "COPY-01"
    verification:
      - kind: unit
        ref: "node --test tests/guards/*.test.mjs; node scripts/list-pending.mjs --check; PUBLIC_ENV=production node scripts/check-copy.mjs --dist dist"
        status: pass
    human_judgment: false
  - id: D3
    description: "Cuatro tonos con pares de contraste medidos; una mutación de yellow o dark rompe la guarda"
    requirement: "DSGN-03"
    verification:
      - kind: unit
        ref: "node --test tests/guards/contrast.test.mjs; node scripts/check-contrast.mjs (11/11 aprobados, 6 prohibidos)"
        status: pass
    human_judgment: false
  - id: D4
    description: "Sin desborde horizontal a 320, 390, 768, 1024 y 1280 px; .hero-art no se cruza con .hero-copy; primer pantallazo completo a 390x844 y a 1280x800 con el collage a la derecha"
    requirement: "DSGN-03"
    verification:
      - kind: e2e
        ref: "tests/e2e/page-structure.spec.ts (hero a N px, primer pantallazo)"
        status: pass
    human_judgment: false
  - id: D5
    description: "Lote A de diseño pasado por impeccable y design-taste-frontend, con capturas, hallazgos, correcciones y nota de 320 px en 02-VISUAL-LOG.md"
    requirement: "DSGN-04"
    verification:
      - kind: e2e
        ref: "PHASE2_BATCH=A npm run test:e2e:isolated -- tests/e2e/page-structure.spec.ts -g captura (15 capturas)"
        status: pass
    human_judgment: true
---

# Phase 2 Plan 01: Cimientos visuales y Hero Summary

**Hero completo con el texto de Ari y un collage SVG de lupa, ojos y clics, verificado de 320 a 1280 px, sobre cuatro tonos de superficie con contraste medido y probado por mutación, más `SectionShell` y `CtaLink` de cuatro ubicaciones listos para los planes 03 a 06.**

## Hecho

### Tarea 1 (tracer): commit `eff9aee`

- `hero.description` con tres afirmaciones copiadas carácter por carácter de `02-ARI-COPY-V2.md`; la primera y la tercera `pending` con `reason`, la segunda `verified`. Esquema `z.array(claim).min(1)`; `PENDING-COPY.md` regenerado (siete pendientes).
- `--space-4xl`, `--section-y` responsivo (64 px, 96 px desde 1024 px) y `--heading` en `light` y `purple`.
- `Hero.astro` real en lugar de `HeroSkeleton.astro`; `index.astro` con el orden canónico de las 12 secciones.
- `page-structure.spec.ts` (tracer), `PRODUCT.md` y `02-VISUAL-LOG.md` con el lote 0, ronda 0.

### Tarea 2 (TDD): commit `169d9df`

- **Rojo primero:** `tests/guards/contrast.test.mjs` pasó de 17 a 25 pruebas y fallaban por aserciones, no por sintaxis.
- `scripts/lib/contrast.mjs`: cuatro tonos obligatorios, 11 pares aprobados y `TONE_PAIRS` (`--heading`, `--bar`, `--collage-stroke` contra `--surface`).
- `tokens.css`: tonos `yellow` y `dark`, `--text-title`, `--card-pad`, `--card-gap`, `--radius-card`. `global.css`: `h3` en Title, barra de 48x8 px y `scroll-margin-top`.
- `CtaLink.astro` (cuatro ubicaciones, prop `href`, sombra por tono) y `SectionShell.astro`.
- `DESIGN.md`, "Lote 0, ronda 1" con las mediciones de los cuatro tonos; `tone-smoke.astro` creada, medida y borrada antes del commit.

### Tarea 3: commit `81271d1`

- **Rojo primero:** se extendió `page-structure.spec.ts` con los incisos (a) a (j) y, antes de construir el collage, fallaron nueve pruebas (no cruce, primer pantallazo con collage, SVG accesible, piezas, sin JavaScript); pasaban las que no dependen del collage (orden y tono, encabezados, desborde, peso, cero animaciones).
- `HeroCollage.astro`: SVG de 560x520 y 3.8 KB de archivo, seis piezas `loops`, `lupa`, `ojos`, `clic-a`, `clic-b`, `destellos` con `--i`, `--r` y `--r-from`, dos pupilas `hc-pupil`, patrón de puntos, cero hex, cero `title` y cero `text`, rellenos por clases del componente con `var(--color-brand-*)` y trazo de 3 px con `var(--collage-stroke)` y `vector-effect: non-scaling-stroke`.
- `Hero.astro`: `.wrap.hero-grid` con `.hero-copy` y `.hero-art`; una columna hasta 64em (collage de 240 px de alto y de 320 px desde 40em) y `minmax(0, 7fr) minmax(0, 5fr)` con gap de 3rem desde 64em.
- Ciclo del lote A: una ronda de captura (15 capturas), `impeccable critique` con un hallazgo de fondo (la lupa se leía como huevo frito o diana), una corrección en un solo lote y una ronda de confirmación. Detalle en `02-VISUAL-LOG.md`, "Lote A, ronda 1". Rasgos 1 y 7 de la lista de vibra cumplidos para el hero.

## Verificación (todo verde)

- `node --test tests/guards/*.test.mjs`: 74 pruebas, 0 fallos. `node scripts/check-contrast.mjs`: 11/11 aprobados, 6 prohibidos verificados.
- `npm run build` sale 0; `node scripts/list-pending.mjs --check` sale 0 (7 pendientes); `PUBLIC_ENV=production node scripts/check-copy.mjs --dist dist` sin hallazgos en `dist`.
- `test:e2e:isolated` con `page-structure.spec.ts`, `a11y-base.spec.ts` y `cta-focus.spec.ts` y ClickUp bloqueado: 91 pruebas pasan con `PHASE2_BATCH=A` (las 15 de capturas incluidas) y 34 sin él; no se editaron las pruebas de la fase 1.
- Mediciones a 1280 px: h1 de 64 px, peso 700, `rgb(115, 24, 127)`; CTA y collage completos dentro de 800 px; collage a la derecha del texto. A 390x844: h1, subtítulo y CTA completos en el primer pantallazo.
- `outerHTML` de `svg.hero-collage` menor a 8192 caracteres; `dist/index.html` de 12.5 KB (límite 60 KB); hosts en `dist/index.html`: solo `forms.clickup.com`, `app-cdn.clickup.com` y el espacio de nombres de SVG.
- `data-piece` distintos: 6; `hc-pupil`: 3 apariciones; hex en `src/components` y `src/pages`: 0; `set:html`: 0; `outline: none`: 0; `tone-smoke` inexistente en `src` y `dist`; `AgendaSection`, `SiteHeader`, `BaseLayout`, `SkipLinks`, `src/scripts` y `public` sin cambios respecto a `5658481`. Preview detenido.

## Erratas del doc de Ari detectadas (no se corrigieron)

- `hero.description[1]`: "en el momento que te **estan** buscando" (falta la tilde: "están"). Se muestra tal cual y se reporta a Ari. El texto además encadena "con contenido y optimizaciones y estrategias", que Ari puede querer pulir.

## Afirmaciones nuevas en PENDING-COPY.md

- `hero.description[0]`: "Tu cliente te busca en Google y, cada vez más, le pregunta a un asistente de IA." (afirmación de mercado; misma familia que COPY-VERIFICATION 3b, datos de EE.UU.).
- `hero.description[2]`: "Contrata un equipo de especialistas con 8 años de experiencia..." (credencial del equipo; Ari la confirma).

## Deviations from Plan

Ninguna en el código: se aplicaron las desviaciones 1 (CTA sobre la descripción) y 2 (estados `pending` de las líneas 1 y 3) del propio plan. Ninguna medición difirió de la estimada del plan de forma relevante.

Observaciones de proceso, no de alcance:

- `impeccable init` y `impeccable document` piden una entrevista con una persona y este ejecutor corre sin nadie que responda. `PRODUCT.md` y `DESIGN.md` se generaron solo con hechos ya aprobados y lo declaran en su cabecera. Si Juan quiere afinar el lenguaje cualitativo, se corre `/impeccable init` o `/impeccable document` de nuevo.
- Conflicto de skills resuelto a favor del contrato: `design-taste-frontend` pide un tema único de página y desaconseja SVG dibujados a mano; `impeccable` desaconseja la sombra dura fuera de un mundo neobrutalista. El brandbook y el UI-SPEC (aprobados por Juan) fijan cuatro tonos alternados, la sombra dura de 4 px y el collage como SVG en línea. Quedó anotado en el registro visual.
- A 320 px el texto del CTA (de la fase 1) se parte en dos líneas dentro del pill. Es reflujo permitido (sin altura fija ni recorte); no se tocó `CtaLink` por esto.
- `actuals.tokens` se midió como caracteres del diff del plan entre 4 (unos 17 000), no como conteo de un arnés.

**Total deviations:** 0 auto-fixed. **Impact:** ninguno sobre el resultado.

## Known Stubs

Ninguno. El hero no tiene datos vacíos ni marcadores; todo texto sale del YAML y el collage es decorativo por diseño.

## Threat Flags

Ninguno: no hay superficie nueva de red, autenticación ni archivos. Aplicadas T-02-01-01 (texto como nodo, sin `set:html`), T-02-01-02 (`href` de `CtaLink` es una unión literal), T-02-01-04 (`tone-smoke.astro` borrada y `dist` sin su salida), T-02-01-07 (guarda de contraste con cuatro tonos y mutaciones) y T-02-01-08 (`PENDING-COPY.md` regenerado y verificado con `--check`).

## Self-Check: PASSED

- FOUND: src/components/sections/Hero.astro, src/components/collage/HeroCollage.astro, src/components/ui/SectionShell.astro, tests/e2e/page-structure.spec.ts, PRODUCT.md, DESIGN.md, 02-VISUAL-LOG.md; HeroSkeleton.astro y tone-smoke.astro no existen.
- FOUND: commits eff9aee, 3388bfe, 169d9df, 978bc4d y 81271d1; `git rev-list --count 5658481..HEAD` = 5 antes de este commit del SUMMARY.

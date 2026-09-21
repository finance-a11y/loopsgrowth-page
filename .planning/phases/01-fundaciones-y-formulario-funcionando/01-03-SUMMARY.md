---
phase: 01-fundaciones-y-formulario-funcionando
plan: 03
subsystem: ui
tags: [astro, playwright, a11y, focus, skip-links, cta, agenda, iframe, noscript, tokens]

requires:
  - phase: 01-fundaciones-y-formulario-funcionando
    provides: "Plan 01: proyecto Astro 7, landing.es.yaml, iframe de ClickUp. Plan 02: tokens.css, guardas de contraste y copy"
provides:
  - "CtaLink (ancla a #agenda) y HeroSkeleton con el h1, el subtitulo y el CTA, con el texto de Ari del YAML"
  - "src/scripts/cta-focus.ts: mueve el foco al h2 de #agenda tras clic, hashchange y carga con hash (524 bytes, inlinado en dist/index.html)"
  - "SkipLinks, SiteHeader, BaseLayout con <main id=main tabindex=-1> y global.css con foco de 3 px, pesos 400/600/700 y scroll suave solo con no-preference"
  - "AgendaSection completa: h2 con foco programatico, intro, enlace de respaldo siempre visible, tarjeta .form-embed con iframe y noscript, una columna o 5fr/7fr desde 1024 px"
  - "playwright.config.ts (Chromium contra astro preview, puerto 4322) y 40 pruebas e2e en tests/e2e (cta-focus.spec.ts y a11y-base.spec.ts)"
affects: [01-04, phase-02, phase-03]

status: complete
plan_head_before: b30f16c686ee38eeeb8e85217bcbde32c52930d4

actuals:
  tokens: 11000
  tasks: 3
  commits: 4

requirements-completed: [FORM-01, FORM-02, FORM-03, FND-04, A11Y-03]

coverage:
  - id: D1
    description: "CTA a #agenda con foco programatico en el h2 (clic, segundo clic con hash igual, Enter y carga directa con /#agenda), a 1280 y 390 px"
    requirement: "FORM-02"
    verification:
      - kind: e2e
        ref: "tests/e2e/cta-focus.spec.ts (a a d, 1280 y 390 px)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Skip links, orden de tabulacion (skip 1, skip 2, CTA header, CTA hero, respaldo, iframe), contorno de foco de 3 px y objetivos de 44 px o mas"
    requirement: "A11Y-03"
    verification:
      - kind: e2e
        ref: "tests/e2e/a11y-base.spec.ts (a, c, d, f, g a 1280 y 390 px)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Seccion #agenda: enlace de respaldo siempre visible con target y rel seguros, noscript, tarjeta con overflow visible y min-height por token, columnas 5fr/7fr, sin desbordes de 320 a 1280 px, sin JavaScript"
    requirement: "FORM-03"
    verification:
      - kind: e2e
        ref: "tests/e2e/a11y-base.spec.ts (sin desbordes, estructura c/d/e/e2/j, sin JavaScript b/c/k)"
        status: pass
    human_judgment: false
  - id: D4
    description: "Glifos espanoles con Outfit descargada (sin fuente del sistema) y caras 400, 600 y 700"
    requirement: "FND-04"
    verification:
      - kind: e2e
        ref: "tests/e2e/a11y-base.spec.ts (glifos, h); prueba de mutacion con subsets latin-ext falla con Arial custom=false"
        status: pass
    human_judgment: false
  - id: D5
    description: "Iframe de ClickUp con title del YAML embebido y funcional dentro de la tarjeta (carga real y foco interior)"
    requirement: "FORM-01"
    verification:
      - kind: e2e
        ref: "tests/e2e/a11y-base.spec.ts (c, e); Tab llega al IFRAME en (a)"
        status: pass
    human_judgment: true
    rationale: "El interior del formulario es de ClickUp; el envio real y la confirmacion se verifican en FORM-05 (Plan 04) y el hueco bajo la confirmacion es un backstop de UI-SPEC"

duration: 30min
completed: 2026-09-19
---

# Phase 1 Plan 03: Superficie del formulario Summary

**La superficie del formulario queda completa: CTA que baja a `#agenda` con el foco en su h2, skip links, header estatico y una seccion `#agenda` morada con tarjeta blanca de ClickUp, enlace de respaldo siempre visible y `noscript`, verificada con 40 pruebas Playwright en Chromium (foco, teclado, desbordes de 320 a 1280 px, sin JavaScript, movimiento reducido, glifos en Outfit y textos de Ari tal cual).**

## Performance

- **Duration:** 30 min (18 min de los Tasks 1 y 2, 12 min del Task 3 en un ejecutor nuevo)
- **Completed:** 2026-09-19
- **Tasks:** 3 de 3
- **Files modified:** 13 (5 componentes, 1 script, layout, pagina, estilos global, config de Playwright, package.json, 2 specs)

## Accomplishments

- Tracer del foco (Task 1): CTA `a[href="#agenda"]` sin `aria-label`, `cta-focus.ts` con foco al h2 en los 4 casos, JS propio de 524 bytes inlinado.
- Base de accesibilidad (Task 2): dos skip links fuera de pantalla por `transform`, header no sticky, `main` enfocable, foco global de 3 px, subrayado permanente en enlaces, pesos 400/600/700.
- `AgendaSection` completa (Task 3): envoltura `.wrap.agenda-grid`, columna unica hasta 1023 px y `minmax(0, 5fr) minmax(0, 7fr)` con gap de 48 px desde `lg`, hijos con `min-width: 0`, orden del DOM igual al visual. Enlace de respaldo con `target="_blank"`, `rel="noopener noreferrer"`, peso 700, subrayado de 2 px (3 px al hover), hover amarillo, icono externo de 16 px `aria-hidden`. Tarjeta `.form-embed` con fondo blanco, borde pop, radio 16 px, sombra pop y `overflow: visible !important` (vence el `overflow: auto` en linea que el script de ClickUp pone sobre `.form-embed`). Iframe con solo `min-height` (`--form-min-h-sm` y, desde 64em, `--form-min-h-lg`). `noscript` bajo la tarjeta con el mismo enlace.
- Pruebas nuevas del Task 3: desbordes a 5 anchos, espaciado de texto SC 1.4.12 a 320 y 1280 px, JS desactivado, target y rel del respaldo y del `noscript`, columnas y orden, overflow y borde de la tarjeta tras cargar el script de ClickUp, `min-height` por breakpoint, movimiento reducido (con `reduce` el `transform` del hover es `none`; con `no-preference` si se desplaza), glifos por CDP, pesos de la seccion y los tres textos de Ari con y sin JavaScript.

## Resultados de las pruebas

- `npx playwright test`: **40 passed** (1.6 min), corrida completa final con el build ya restaurado.
- `npm run build` (con `prebuild` de contraste y copy y `postbuild`): pasa. `grep -c "<noscript>" dist/index.html` = 1. `PUBLIC_ENV=production node scripts/check-copy.mjs --dist dist` sale con 0. `grep -o 'aria-label="' dist/index.html | wc -l` = 1 (solo el `nav` de skip links). `node --test tests/guards/*.test.mjs`: 47 pasan.
- Greps de aceptacion sin resultados: `set:html`, hex en `src/components`, `src/layouts` y `src/pages`, `(^|[^-])height:` en `AgendaSection.astro`, `.status` en componentes, `outline: none` y `line-height ... !important`. Detector de Impeccable sobre `AgendaSection.astro`: `[]`.
- JS propio del build: **inlinado en `dist/index.html`, 524 bytes** (sin archivos `.js` bajo `dist`); una sola etiqueta `<script` propia, contiene `agenda-title`, menor a 3072.
- Prueba de mutacion de glifos (sobre copia restaurada): quitar `fonts` por completo hace fallar el build con `FontFamilyNotFound` (la guarda ya muerde antes de llegar a la prueba); para probar la prueba en si, se dejo `subsets: ['latin-ext']` (compila) y el caso (h) falla con "fuente del sistema en uso: Arial custom=false glyphs=67". `astro.config.mjs` restaurado desde la copia; `git diff HEAD --stat -- astro.config.mjs` vacio.
- Capturas (no versionadas, en `test-results/`): `page-320.png`, `page-390.png`, `page-1280.png` (fullPage; el iframe aparece en blanco porque es `loading="lazy"` y la captura no hace scroll), `glyphs-outfit.png` (todos los glifos `áéíóúüñ¿¡` en Outfit, sin cajas vacias) y `skip-link-focused.png`. Inspeccionadas: la seccion morada, el foco, el respaldo con icono y la tarjeta se ven segun el contrato.
- Red (ClickUp): `curl` del formulario y de `forms-embed/v1.js` devolvieron 200 el 2026-09-19 (~02:43 UTC, antes de las pruebas). Ningun caso fallo por red y carga de la maquina normal (load average 4).

## Ajustes de las skills `impeccable` y `design-taste-frontend` dentro del contrato

Manda UI-SPEC y A11Y.md cuando chocan. Aplicado: escala de forma unica (pill para CTA, 8 px skip link, 16 px tarjeta), un solo acento por tono, foco de 3 px consistente, sin decoracion extra en la seccion. No aplicado por el contrato: sombra de bloque duro (UI-SPEC la manda), blanco y `#212121` puros (tokens de marca), sin modo oscuro (el brandbook define una sola paleta), y radio del iframe de 16 px (una esquina concentrica seria 13 px, pero UI-SPEC fija 16). El icono de enlace externo usa la geometria de Tabler (`external-link`, MIT, trazo 2), no un trazo dibujado a mano; UI-SPEC pide un SVG en linea y no hay libreria de iconos instalada, asi que no se sumo dependencia.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Carga directa con `/#agenda` no dejaba el foco en el h2**
- **Found during:** Task 1 (caso d)
- **Issue:** enfocar con `setTimeout(0)` desde el script diferido ocurre antes de que Chromium termine el salto de ancla, que luego vacia el foco.
- **Fix:** en carga directa se enfoca ya y se reintenta en `load` solo si el foco quedo vacio (`document.activeElement` es `body`).
- **Files modified:** `src/scripts/cta-focus.ts`
- **Commit:** `ace95d4`

**2. [Rule 3 - Blocking] `astro preview` en segundo plano rompe el `webServer` de Playwright dentro de un agente**
- **Found during:** Task 1
- **Issue:** Astro 7 deja `astro preview` en segundo plano cuando lo lanza un agente y Playwright ve el proceso terminar.
- **Fix:** el config queda como pide el plan con un comentario; en un agente se levanta antes `npx astro build && npx astro preview --port 4322` y se detiene con `npx astro preview stop` (hecho al terminar el Task 3). Con el servidor reutilizado hay que reconstruir a mano tras cada cambio.
- **Files modified:** `playwright.config.ts` (comentario)
- **Commit:** `ace95d4`

**3. [Rule 1 - Bug en el plan] Caso (c) de a11y-base no puede medir el contorno del IFRAME**
- **Found during:** Task 2
- **Issue:** al entrar al iframe con Tab, Chromium deja `document.activeElement` en el IFRAME pero no lo marca como `:focus` ni `:focus-visible`; su `outline-style` calculado es `none`.
- **Fix:** el caso (c) mide el contorno en todas las paradas propias y excluye el IFRAME; el foco interior es de ClickUp (`EXCEPTIONS.md` de la Fase 3). Anotado en `.planning/WINDOWS.md`.
- **Files modified:** `tests/e2e/a11y-base.spec.ts`
- **Commit:** `ed2dd00`

**4. [Rule 3 - Secuencia] El orden de tabulacion del Task 2 no incluia el enlace de respaldo**
- **Found during:** Task 2
- **Issue:** el enlace de respaldo lo crea el Task 3.
- **Fix:** resuelto en el Task 3: el caso (a) ahora espera `skip 1, skip 2, CTA header, CTA hero, respaldo, iframe` (a 390 px sin el CTA del header) y el respaldo entra en los casos de 44 px a 1280 y 390 px.
- **Files modified:** `tests/e2e/a11y-base.spec.ts`
- **Commit:** `4f4258a`

**5. [Rule 1 - Ajuste del plan] La rejilla de dos columnas vive en `.wrap.agenda-grid`, no en la `<section>`**
- **Found during:** Task 3
- **Issue:** el plan pide leer `grid-template-columns` "de la seccion", pero la seccion morada es de ancho completo y el contenedor de 72rem con gutter es `.wrap`; hacer grid en la seccion obligaria a duplicar el calculo del contenedor.
- **Fix:** la rejilla esta en `#agenda > .wrap.agenda-grid`; el caso (d) la lee ahi (1 columna a 390 px, 2 a 1024 px con gap de 48 px). Mismo resultado visual y de DOM.
- **Files modified:** `src/components/AgendaSection.astro`, `tests/e2e/a11y-base.spec.ts`
- **Commit:** `4f4258a`

**6. [Rule 1 - Ajuste del plan] La prueba de mutacion "quitar `fonts`" falla en el build, no en la prueba**
- **Found during:** Task 3
- **Issue:** sin `fonts`, el componente `<Font cssVariable="--font-brand">` lanza `FontFamilyNotFound`; el build ni llega a Playwright.
- **Fix:** se uso una mutacion que compila (`subsets: ['latin-ext']`) para demostrar que el caso (h) muerde. Original restaurado.
- **Files modified:** ninguno (mutacion sobre copia, restaurada)
- **Commit:** n/a

**Total deviations:** 6 (4 Rule 1, 2 Rule 3). Sin cambio de alcance.
**Impact:** ninguno en el contrato visual ni en los criterios de aceptacion. Casos extra agregados al plan: `min-height` por breakpoint (e2), casos de 44 px a 390 px y verificacion positiva de movimiento con `no-preference`.

## Known Stubs

- `--form-min-h-sm` (1100 px) y `--form-min-h-lg` (900 px) siguen provisionales; el Plan 04 los mide (FORM-04). Ya registrado por el Plan 02.
- Wordmark de texto en el header (la Fase 2 lo reemplaza por el logo SVG, DSGN-02) y `HeroSkeleton` provisional (CONT-01).
- Los textos `pending` (`brand.term`, `call.duration`, subtitulo del hero e intro de `#agenda`) se muestran tal cual y no bloquean el build no productivo; el build de produccion los rechaza hasta que Ari los confirme.

## Threat Flags

Ninguna superficie nueva fuera del modelo del plan. Mitigaciones verificadas: T-03-01 (sin `set:html`), T-03-02 (`rel="noopener noreferrer"` en el respaldo y en el `noscript`, probado por Playwright con y sin JavaScript), T-03-03 (iframe con `referrerpolicy="strict-origin-when-cross-origin"` y respaldo con `noreferrer`), T-03-04 (el script solo compara con `#agenda`), T-03-05 (respaldo permanente, `noscript` y `min-height` reservado).

## Backstops pendientes

- Confirmacion de envio de ClickUp mas corta que el formulario: el `min-height` puede dejar un hueco en blanco; se observa en FORM-05 (Plan 04).
- Skip link enfocado sin nada encima: comprobado con `elementFromPoint` y captura `skip-link-focused.png`.

## Self-Check: PASSED

- Archivos existentes: `src/components/AgendaSection.astro`, `CtaLink.astro`, `HeroSkeleton.astro`, `SkipLinks.astro`, `SiteHeader.astro`, `src/scripts/cta-focus.ts`, `src/layouts/BaseLayout.astro`, `src/pages/index.astro`, `src/styles/global.css`, `playwright.config.ts`, `tests/e2e/cta-focus.spec.ts`, `tests/e2e/a11y-base.spec.ts`.
- Commits: `ace95d4`, `ed2dd00`, `3878f4c` (parcial) y `4f4258a` existen; `git rev-list --count b30f16c..HEAD` da 4 al escribir este resumen.
- Criterios de aceptacion del Task 3 y `<verification>` del plan re-ejecutados: `npx playwright test` 40 de 40, `npm run build` con guardas, greps limpios.
- Sin procesos propios abiertos: `astro preview` detenido (`http=000` en 4322); `astro.config.mjs` sin cambios respecto a HEAD.

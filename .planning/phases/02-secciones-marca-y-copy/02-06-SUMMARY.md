---
phase: 02-secciones-marca-y-copy
plan: 06
subsystem: ui
tags: [astro, privacidad, footer, noindex, yaml, playwright, tracer, faq, details, guarda-inversion, agenda, collage, mailto]
status: complete
plan_head_before: 44cf69fe091d5313d68c72288b6d64aedf4ce050
# commits es el conteo medido del libro (git rev-list --count plan_head_before..HEAD) justo antes de commitear este resumen: diez commits (5 de codigo o prueba de las tareas 1 y 2 mas los dos resumenes parciales, mas 5f7fd9d, 1035b79, 3760b6d, d1337e9 y d30a5e2 de la tarea 3). El commit de este resumen no se cuenta.
commits: 10
completed: 2026-09-19
actuals:
  tokens: 18900
  tasks: 3
  commits: 10
requirements-completed: [CONT-10, CONT-11, CONT-12, CONT-13, COPY-01, DSGN-04]

provides:
  - "/privacidad/ de punta a punta (h1 del YAML, cuerpo FALTA CONFIRMAR pending, noindex en todo entorno, sin canonical, sin JavaScript, sin h2) con el footer completo y el footer pegado al borde inferior en paginas cortas"
  - "SiteFooter.astro completo: logo horizontal (mesa 06, tono light, sin enlace en /, href=/ en las demas rutas), bloques de contacto y redes pendientes de Ari, enlace de privacidad, mailto solo con expresion estricta, rejilla de 1, 2 y 3 columnas (1,2 a 1 a 1) con area de salvado del logo"
  - "AgendaSection.astro con agenda.title del doc de Ari tal cual (errata 'estan' sin corregir), .section-title y AgendaCollage decorativo tras .agenda-fallback, visible solo desde 64em, sin ningun CtaLink y sin tocar la tarjeta ni el iframe"
  - "ForWhom.astro (#para-quien) y Faq.astro (#faq con 6 details nativos) montados antes de #agenda"
  - "Guarda INVERSION (findInversion, INVERSION_MONTHLY_RE, INVERSION_CURRENCY_RE) en scripts/lib/copy-rules.mjs con 8 pruebas por mutacion"
  - "Claves for_whom, faq y footer (contact_label, email, social_label, social) en el YAML y el esquema estricto; PENDING-COPY.md regenerado (61 pendientes)"

key-files:
  created:
    - src/components/SiteFooter.astro
    - src/pages/privacidad.astro
    - src/components/sections/ForWhom.astro
    - src/components/sections/Faq.astro
    - tests/e2e/closing-sections.spec.ts
  modified:
    - src/components/AgendaSection.astro
    - src/content/landing.es.yaml
    - src/content.config.ts
    - src/layouts/BaseLayout.astro
    - src/components/SiteHeader.astro
    - src/components/SkipLinks.astro
    - src/pages/index.astro
    - scripts/lib/copy-rules.mjs
    - tests/guards/copy.test.mjs
    - tests/guards/brand-assets.test.mjs
    - tests/e2e/a11y-base.spec.ts
    - tests/e2e/collage-language.spec.ts
    - tests/e2e/page-structure.spec.ts
    - tests/e2e/results-cases.spec.ts
    - tests/e2e/team-includes-how.spec.ts
    - PENDING-COPY.md
    - .planning/phases/02-secciones-marca-y-copy/02-VISUAL-LOG.md

key-decisions:
  - "El titulo de /privacidad se compone como 'Politica de privacidad: Loops Growth' (mismo criterio de dos puntos y espacio que meta.title_template)."
  - "SiteFooter pasa aria-current solo cuando la ruta empieza con /privacidad; en / el atributo no se emite."
  - "El sitemap de un build de produccion incluye /privacidad/ (aun con noindex): la exclusion es nota de la fase 3, tal como fija el plan."
  - "INVERSION solo mira for_whom.* y faq.* y solo afirmaciones que no estan verified; la facturacion anual y los plazos no se marcan."
  - "El FAQ no lleva transicion ni animacion en el giro plus a minus: el icono cambia al instante."
  - "El correo del footer se emite como enlace solo si el texto recortado cumple /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\\.[A-Za-z0-9-]+)+$/; esa expresion es la unica fuente de enlaces de correo (una sola aparicion de la palabra clave del esquema en SiteFooter.astro)."
  - "El footer llega al borde inferior de la ventana en paginas cortas con body en columna flexible (min-height 100dvh) y main con flex 1 0 auto, definido en BaseLayout.astro y no en src/styles (que el plan pide no tocar)."
  - "Los topes de HTML de / suben a 81920 bytes crudos con 25600 con gzip (autorizado por el orquestador en la tarea 2); medido al cerrar: 71790 crudos y 14265 con gzip -9."

requirements: [CONT-10, CONT-11, CONT-12, CONT-13, COPY-01, DSGN-04]
---

# Phase 2 Plan 06: Para quién es, FAQ, CTA final, footer y privacidad Summary

Cierre del recorrido: Para quién es y FAQ con `<details>` nativos y guarda INVERSION, `#agenda` con el titular del CTA final del doc de Ari y su collage decorativo, footer completo con logo, contacto, redes y privacidad, y `/privacidad/` navegable con `noindex`, todo sin JavaScript propio y con el relleno visible 'FALTA CONFIRMAR' donde Ari aun no entrega el dato.

## Hecho

### Tarea 1: tracer de /privacidad y primer corte del footer (commit fbdb19d)

- YAML y esquema: `footer.nav_label` y `footer.privacy_link` (verified), `privacy.title` (verified) y `privacy.body` (una afirmacion pending 'FALTA CONFIRMAR', `confirm_by: Ari`).
- `SiteFooter.astro` primer corte, `BaseLayout.astro` con props `noindex` y `path` (robots `noindex` con `!isProduction || noindex`; canonical solo con `isProduction && !noindex`), `privacidad.astro` con un h1 y un `<p>` por elemento del cuerpo, `SiteHeader.astro` (`ctaHref`) y `SkipLinks.astro` (`hasAgenda`) decididos por ruta.
- Skills invocadas con la herramienta Skill: `impeccable` y `design-taste-frontend` (diales 7, 3 y 4).

### Tarea 2: Para quién es, FAQ y guarda INVERSION (commits b9cdf57 rojo y f2554c8 verde)

- 8 pruebas por mutacion (14a a 14h) de la guarda INVERSION, rojas primero; guarda en `scripts/lib/copy-rules.mjs` con `INVERSION_PATH_PREFIXES`, `INVERSION_MONTHLY_RE`, `INVERSION_CURRENCY_RE` y `findInversion`.
- `for_whom` y `faq` en el YAML y el esquema (todo pending), `ForWhom.astro` (dos tarjetas, una por columna, con icono, sin CTA) y `Faq.astro` (seis `<details>` cerrados, sin `name`, sin JavaScript, ganchos para el plan 07).
- Bloques de Para quién es y FAQ en `closing-sections.spec.ts`, ciclo visual del lote D06 (`D06-*` capturas) y tope de HTML subido (ver desviaciones).

### Tarea 3: #agenda, footer completo y /privacidad endurecida (commits 1035b79 rojo, 3760b6d y d1337e9 verde, d30a5e2 registro visual)

- **Rojo primero (1035b79):** 37 pruebas nuevas en `closing-sections.spec.ts`, derivadas del YAML; 20 fallaban antes de construir.
- **Copy y esquema:** `agenda.title.text` = '¿Listo para que te encuentren cuando te estan buscando?' caracter por caracter, `status: verified`, sin corregir la errata. `footer.contact_label` ('Contacto') y `footer.social_label` ('Redes') `verified`; `footer.email` y `footer.social` 'FALTA CONFIRMAR' `pending`, `confirm_by: Ari`, con `reason`. `npm run pending`: 61 pendientes; `grep -c "^| footer\." PENDING-COPY.md` = 2.
- **`AgendaSection.astro`:** el h2 conserva `id="agenda-title"` y `tabindex="-1"` y suma `class="section-title"` (barra de 48x8 px); `div.agenda-art` con `aria-hidden="true"` envuelve `<AgendaCollage class="agenda-collage" />` después de `.agenda-fallback`, `display: none` por defecto y `display: block` con `margin-top: 2rem` desde 64em. El iframe, su script, el `noscript`, la tarjeta y los textos de respaldo no cambiaron (0 lineas nuevas o eliminadas con iframe, noscript, form-embed, clickup, referrerpolicy o loading=). Ningún `CtaLink` dentro de `#agenda` y exactamente cuatro `a[data-cta]` en la página (header, hero, solucion y casos).
- **`SiteFooter.astro` completo:** `<footer class="site-footer" data-tone="light">` con `.wrap.footer-grid`, `.footer-brand` (`Logo variant="horizontal"`, `tone` desde una constante que alimenta también el `data-tone`, `href` solo fuera de `/`) y `<nav aria-label>` con dos `.footer-block` (contacto, y redes con el enlace de privacidad). Correo: `<a href="mailto:...">` solo si pasa la expresión estricta; si no, `<p class="footer-value">` con el texto tal cual. Rejilla de 1 columna, 2 desde 40em y `1.2fr 1fr 1fr` desde 64em con el nav en `span 2` y rejilla interna de dos, mismo `--footer-gap` de 2rem. Sin encabezados, sin año, sin 'todos los derechos reservados' y sin JavaScript.
- **Pie en páginas cortas:** hallazgo de la crítica visual; `BaseLayout.astro` pasa el `body` a columna flexible con `min-height: 100dvh` y `main` con `flex: 1 0 auto`. Prueba nueva: hueco bajo el footer de `/privacidad` de 0.5 px o menos.
- **Orden de tabulación en `/privacidad`:** exacto, skip 1, logo del header, CTA del header, logo del footer y enlace de privacidad.
- **Verificacion del correo con dos copias temporales del YAML (restaurado después, `git diff` del YAML solo con los cambios del plan):** correo `a@b.co?bcc=x@y.z` no emite `href="mailto:` y aparece como texto plano; un correo válido largo (`hola.equipo.de.contacto.de.loops.growth@subdominio-de-prueba-largo.loopsgrowth.example`) emite exactamente `mailto:` con ese valor; con una URL de red social de más de 90 caracteres sin espacios, sin desborde horizontal a 320 ni a 1280 px. Con el relleno actual, `grep -c 'href="mailto:' dist/index.html` = 0.
- **Ciclo del lote E06 en `02-VISUAL-LOG.md`** (rondas 0 y 1) con `impeccable` (layout, colorize, harden) y `design-taste-frontend`, juzgado contra `moodboard.png` y `ai_a.png` (herramienta Read); 25 capturas `E06-*` en `test-results/phase2/` (no versionadas).

## Resultados

- `node --test tests/guards/*.test.mjs`: 176 de 176. `node scripts/check-contrast.mjs`: 14 de 14 pares. `npm run pending` y `node scripts/list-pending.mjs --check`: OK (61 pendientes). `npm run build`: verde (0 estructurales).
- Comprobacion de producción en JSON: 0 violaciones estructurales; en `for_whom`, `faq`, `footer`, `privacy` y `agenda` solo PENDING y MISSING; `footer.email`, `footer.social` y `privacy.body[0]` presentes; `agenda.title` sin violaciones; ninguna INVERSION. `PUBLIC_ENV=production PUBLIC_SITE_URL=https://loopsgrowth.example npm run build` falla y solo por PENDING (61) y MISSING (32).
- Playwright con ClickUp bloqueado (`E2E_BLOCK_CLICKUP=1`, proyecto `chromium`, suite completa): **452 pasadas, 95 omitidas (capturas y recortes sin lote), 0 fallidas.** `closing-sections.spec.ts` completo verde. La prueba (k) de 'textos de Ari visibles' y la prueba 9b de `copy.test.mjs`, ambas de 02-03, pasan (ver desviacion 2).
- `dist/index.html`: 71790 bytes crudos y 14265 con `gzip -9`, por debajo de los topes vigentes de 81920 y 25600. Únicos hosts externos en `dist/index.html` y `dist/privacidad/index.html`: forms.clickup.com y app-cdn.clickup.com (y el espacio de nombres SVG). `dist/privacidad/index.html` conserva `noindex` y no lleva canonical.
- Compuerta de higiene sobre las lineas nuevas de `AgendaSection.astro` y `SiteFooter.astro`: 0 coincidencias.
- Sin servidores propios abiertos: `npx astro preview stop` ejecutado; el `astro dev` del usuario (pid 86100) no se toco.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Bloqueo, autorizado por el orquestador] Tope de HTML de 61440 a 81920 bytes crudos con 25600 con gzip**
- **Found during:** Tarea 2, `npm run build` tras montar Para quién es y FAQ.
- **Issue:** `dist/index.html` paso de 58565 a 65581 bytes crudos con el contenido de Ari sin recortar (12493 con `gzip -9`); ahora 71790 y 14265 tras el footer y el collage de `#agenda`.
- **Fix:** subir las guardas a 81920 crudos con la condición dura adicional de 25600 con gzip nivel 9. Ningún otro tope cambio.
- **Guardas tocadas (4):** `tests/guards/brand-assets.test.mjs`, `tests/e2e/page-structure.spec.ts`, `tests/e2e/results-cases.spec.ts` y `tests/e2e/team-includes-how.spec.ts`.
- **Commit:** f2554c8.
- **Aviso para Juan:** los topes de 61440 crudos del UI-SPEC y de 02-CONTEXT quedan superados por decisión del orquestador; el peso con gzip es la métrica que importa.

**2. [Rule 1 - Defecto de prueba de otro plan, autorizado por el orquestador] `textos de Ari visibles (k)` de 02-03 no contaba las respuestas del FAQ**
- **Found during:** Tarea 2, suite completa.
- **Issue:** `innerText` no incluye el contenido de un `<details>` cerrado: las 6 respuestas del FAQ no se contaban (27 de 33 apariciones de 'FALTA CONFIRMAR').
- **Fix:** en `checkTexts` de `tests/e2e/a11y-base.spec.ts` se abren todos los `<details>` dentro de la página antes de leer `innerText`. El conteo esperado y las rutas no cambian, ninguna ruta se excluye.
- **Commit:** 5f7fd9d (commit propio, lista explicita de archivos).

**3. [Rule 1 - Defecto de prueba de otro plan, reportado] `collage-language.spec.ts` (02-10) contaba 9 escenas y 11 píldoras en `/`**
- **Found during:** Tarea 3, suite completa, al montar `AgendaCollage` como pide el plan.
- **Issue:** las pruebas 'cada escena existe una vez' y 'píldoras: palabra de la lista...' sumaban solo las escenas que ya estaban en la página; con la escena `agenda` hay 10 raices de escena y 13 píldoras.
- **Fix:** la primera cuenta `NAMES.length + 1` y exige exactamente una raiz `#agenda [data-collage="agenda"]`; la segunda cuenta `2 + 2 + 3 + 4 + 2`. Con comentario que remite a `closing-sections.spec.ts`. Ninguna otra aserción de esos bloques cambio.
- **Commit:** 3760b6d.

**4. [Rule 1 - Bug de diseño] Footer de `/privacidad` a media ventana**
- **Found during:** crítica visual del lote E06 (captura `E06-privacidad-1280`).
- **Issue:** la página es corta y el footer terminaba con un hueco blanco debajo hasta el borde de la ventana.
- **Fix:** `body` en columna flexible con `min-height: 100dvh` y `main` con `flex: 1 0 auto`, en `BaseLayout.astro` (no en `src/styles`, que el plan no permite tocar). Prueba nueva verde; la home no cambia.
- **Commit:** d1337e9.

Ninguna otra desviacion: el resto se ejecuto como estaba escrito. El plan pedia `dist/index.html` por debajo de 61440 bytes en dos verificaciones; esa cifra la sustituye el tope autorizado de la desviacion 1.

## Auth gates

Ninguno.

## Known Stubs

Todos los textos de `for_whom`, `faq`, `privacy.body`, `footer.email` y `footer.social` son 'FALTA CONFIRMAR' `pending` por diseño (COPY-01: el doc de Ari no trae esas secciones ni esos datos); estan en `PENDING-COPY.md` y los resuelve Ari, no un plan futuro. Son marcas visibles, no datos simulados. La producción falla mientras existan.

## Threat Flags

Ninguno nuevo: no se agregaron endpoints ni rutas de autenticacion. El enlace de correo del footer es la única superficie nueva y esta acotado por la expresión estricta (sin `?`, `,`, `;`, `:` ni espacios), probada con un valor inyectado. La guarda INVERSION es la mitigacion del hallazgo 6 (no publicar cifras de inversion sin aprobacion).

## Notas para Ari (acumuladas)

- **Errata del doc (se reporta, no se corrige):** el titular del CTA final dice 'te estan buscando' y el verbo va en subjuntivo con tilde ('te estén buscando', como lo escribe REQUIREMENTS). Se muestra tal cual, sin tilde, como pidió Juan (el texto de Ari no se corrige). Si Ari lo corrige en el doc, basta cambiar `agenda.title.text` en el YAML.
- **25 afirmaciones nuevas pending que Ari debe entregar:** `privacy.body[0]` (texto legal de la política de privacidad); `for_whom.title`, los dos nombres de columna, seis items (el primero de la columna "es" debe comunicar el perfil de USD 200k o más al año) y `faq.title` con seis preguntas y seis respuestas (temas: que es GEO, duracion de la llamada, que preparar, inversion, tiempos de resultados y si aplica a mi negocio); `footer.email` (correo de contacto) y `footer.social` (redes con su nombre y su URL).
- Por favor no incluir rangos ni cifras de inversion mensual (4 a 5k al mes, 1.5k al mes, +1500 al mes) en esos textos sin aprobarlos por escrito: la guarda INVERSION bloquea el build de producción mientras esten `pending`. Si Ari decide publicarlos, pasan a `verified` y la guarda deja de marcarlos.
- La respuesta sobre la duracion de la llamada debe coincidir con `call.duration` (hoy `pending`, con la contradiccion de 20 y 30 minutos ya anotada).
- Las píldoras `team work` y `seo` del collage de `#agenda` salen del moodboard del BrandBook y del copy; `team work` necesita el visto bueno de Ari (regla de `CHIP_WORDS`).

## Pendientes manuales (los hace una persona)

- Probar el `<summary>` del FAQ con VoiceOver (macOS con Safari) y con NVDA o TalkBack: anuncio de contraído o expandido y lectura de la respuesta al abrir.
- Recorrer con teclado el iframe real de ClickUp (entrar y salir sin trampa de foco) con el formulario cargado; las pruebas de este plan corren con ClickUp bloqueado.

## Notas para la fase 3

- Excluir `/privacidad/` del sitemap mientras siga `noindex` (`sitemap({ filter })` en `astro.config.mjs`): el build de producción lo incluye en `sitemap-0.xml`.
- Quitar `noindex` de `privacidad.astro` cuando exista el texto legal.
- Modelado de las redes: `footer.social` es hoy una sola afirmacion de texto; cuando Ari entregue las redes con su URL hay que pasar a una lista de `{nombre, url}` con validacion de host (mismo criterio que el correo) y enlaces con `rel="noopener noreferrer"`.
- Revisar el tope de HTML (81920 crudos y 25600 con gzip) al sumar el resto de las secciones del plan 07.

## Self-Check: PASSED

- Archivos creados y modificados verificados: `src/components/SiteFooter.astro`, `src/components/AgendaSection.astro`, `src/layouts/BaseLayout.astro`, `src/pages/privacidad.astro`, `src/components/sections/ForWhom.astro`, `src/components/sections/Faq.astro`, `tests/e2e/closing-sections.spec.ts` y `02-VISUAL-LOG.md`.
- Commits verificados en `git log`: fbdb19d, b9cdf57, f2554c8, 5f7fd9d, 1035b79, 3760b6d, d1337e9 y d30a5e2.

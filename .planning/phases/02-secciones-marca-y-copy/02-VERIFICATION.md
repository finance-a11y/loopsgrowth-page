---
phase: 02-secciones-marca-y-copy
verified: 2026-09-19T23:59:00Z
status: human_needed
score: 4/5 must-haves verified
covered_files:
  - .planning/REQUIREMENTS.md
  - scripts/check-contrast.mjs
  - scripts/check-copy.mjs
  - scripts/check-photos.mjs
  - src/components/AgendaSection.astro
  - src/components/SiteFooter.astro
  - src/components/SiteHeader.astro
  - src/content/landing.es.yaml
  - src/pages/index.astro
  - src/pages/privacidad.astro
  - src/scripts/cta-focus.ts
  - src/styles/global.css
  - src/styles/motion.css
  - src/styles/tokens.css
covered_digest: "v1:sha256:a1978657926b8429b95794f1d97cf629097309f5f9e10c411c3fb53dc04f349f"
behavior_unverified: 0
overrides_applied: 0
gaps: []
human_verification:
  - test: "Ari entrega los 61 textos pendientes de src/content/landing.es.yaml (lista en PENDING-COPY.md, `node scripts/list-pending.mjs`): perfil USD 200k y columnas de Para quién es / no es, título y 6 pares pregunta-respuesta del FAQ, título de La solución y cuerpo del pilar 4, cuerpo del resultado 2, canal de cada caso y plazo del caso 5, título de Qué incluye 1, correo y redes del footer, texto de la política de privacidad, y confirma la duración (30 min contra 20 min) y las erratas del doc (exito, estan, trafico organico, direcciôn)."
    expected: "Con los textos cargados, `PUBLIC_ENV=production node scripts/check-copy.mjs` sale 0 y la página muestra, sin FALTA CONFIRMAR, el perfil de USD 200k desde Para quién es y un FAQ de 5 a 6 preguntas legibles (criterio 3 del ROADMAP, CONT-10, CONT-11, CONT-12)."
    why_human: "El contenido lo entrega Ari; por decisión de CONTEXT no se inventa ni se redacta. Hoy la estructura existe, pero el visitante lee FALTA CONFIRMAR en Para quién es, en las 6 preguntas del FAQ y en el footer."
  - test: "Juan y Ari eligen una foto por ranura en /marca/hoja/ y Ari escribe la aprobación en src/assets/photos/LICENSES.md (pasos de cierre en el mensaje de `PUBLIC_ENV=production node scripts/check-photos.mjs`)."
    expected: "`PUBLIC_ENV=production node scripts/check-photos.mjs` sale 0 y el build de producción deja de bloquearse por fotos."
    why_human: "Aprobación de licencia y elección de marca: solo personas."
  - test: "Recorrer el FAQ con VoiceOver (Safari, macOS) y con teclado."
    expected: "Cada summary se anuncia con su pregunta y estado abierto o cerrado; Enter y Espacio lo alternan; el foco es visible."
    why_human: "El anuncio del lector de pantalla no se puede medir con axe ni Playwright (A11Y.md exige revisión manual)."
  - test: "Recorrido con teclado dentro y fuera del iframe real de ClickUp (Tab hasta el formulario y Shift+Tab de regreso). No enviar el formulario. Sigue vigente además la lista de 6 ítems humanos de 01-VERIFICATION.md."
    expected: "Se entra y se sale sin trampa de foco y el iframe con el formulario real carga."
    why_human: "El interior del iframe de un tercero y su carga real no se validan con `E2E_BLOCK_CLICKUP=1`."
  - test: "Comparar la página con el moodboard real de Ari (brand-inventory/moodboard.png, ai_a.png) en un navegador real a 390 y 1280 px."
    expected: "El estilo se siente de la misma familia. Diferencias que conviene que Ari juzgue: la media tinta de la foto es más blanda que la de las piezas de referencia, la foto va en un marco con esquinas y sombra dura (parece tarjeta, no un recorte libre), y los avatares del equipo son la lupa con ojos, no una ilustración por persona."
    why_human: "Juicio de marca (pixel-perfect, fidelidad al brandbook) que solo Ari y Camila pueden dar."
---

# Fase 2: Secciones, marca y copy. Informe de verificación

**Objetivo de la fase:** As a dueño de un negocio, I want to entender en segundos qué hace Loops Growth y por qué confiar, so that llegue al formulario decidido a agendar.
**Verificado:** 2026-09-19
**Estado:** human_needed
**Re-verificación:** No, verificación inicial

## Resumen honesto

Todo lo que se puede automatizar pasa y el sitio existe, es real y no es un stub: 12 secciones en el orden canónico, marca aplicada, cuatro CTA más el salto, cero JS propio salvo el script inline de foco, presupuestos de peso cumplidos. Lo que no se puede dar por logrado todavía es la parte del criterio 3 que depende de copy que Ari no ha entregado: el bloque Para quién es (perfil USD 200k), las 6 preguntas del FAQ y el footer (correo y redes) muestran FALTA CONFIRMAR. Eso es el comportamiento diseñado en 02-CONTEXT.md (nunca se inventa copy), y las puertas de producción bloquean tal como se espera. No lo trato como hueco de código, pero tampoco como cumplido: un visitante hoy no lee "USD 200k" ni una pregunta del FAQ. Por eso el estado es `human_needed` y no `passed`.

## Verdades observables (contrato del ROADMAP)

| # | Verdad | Estado | Evidencia |
|---|--------|--------|-----------|
| 1 | Primeros segundos: H1 en texto real, subtítulo y CTA principal; al bajar, problema, por qué ahora y solución en cuatro pilares | VERIFICADO | `dist/index.html`: un solo `<h1>` "Crecemos tu tienda a través de Google, ChatGPT y Gemini." (idéntico al doc, `02-ARI-COPY-V2.md`), subtítulo, CTA "Agenda tu llamada de 30 minutos" y captura a 1280 y 390 px. Secciones `#problema`, `#por-que-ahora`, `#solucion` (4 tarjetas). Título de La solución y cuerpo del pilar 4 en FALTA CONFIRMAR por la guarda de términos y el `[VERIFICAR]` (pendiente de Ari, ver ítem 1). |
| 2 | Prueba sin logos ni fotos inventadas: resultados sin cifras `[VERIFICAR]`, casos como tarjetas de métrica con el de Meta Ads en su propia tarjeta, cuatro integrantes con nombre, cargo y avatar | VERIFICADO | `grep "30% y 50%\|VERIFICAR" dist/index.html` = 0; el rango del resultado 2 sale como FALTA CONFIRMAR. Cinco tarjetas de caso (cifra, sector, plazo, canal); la de +500% Meta Ads ocupa su propia tarjeta ancha (captura). `#nosotros` con Arianna Lupi, Verónica Romero, Juan Angulo, Miguel Pacheco, cargo y avatar SVG. Canales y algunos plazos salen FALTA CONFIRMAR por falta del dato en el doc. |
| 3 | Qué incluye (seis entregables), cómo funciona (cuatro fases con plazos), para quién es y no es (USD 200k), FAQ de 5 a 6 preguntas, CTA final junto al formulario, footer con contacto, redes y privacidad | ? INCIERTO (decisión humana) | Existen: `#incluye` con 6 ítems (el título del 1 es FALTA CONFIRMAR), `#como-funciona` con 4 fases y plazo, `#para-quien` con dos columnas, `#faq` con 6 `<details>`, `#agenda` con el título de Ari, el `<iframe>` de ClickUp y el enlace de respaldo, y footer con enlace a `/privacidad/`. No se cumple hoy en el contenido visible: Para quién es (título y 6 ítems), las 12 cadenas del FAQ, el correo y las redes del footer y el cuerpo de la privacidad son FALTA CONFIRMAR, así que no aparece el perfil USD 200k ni ninguna pregunta legible. Pendiente de Ari por decisión de CONTEXT. |
| 4 | Se ve como Loops Growth: collage pop con lupas, ojos y clics en SVG estático, logo e isotipo SVG con área de salvado, español neutro con voz de marca, sin voseo ni guiones largos | VERIFICADO | `--color-brand-purple: #4228d1` en `src/styles/tokens.css`, 0 apariciones de `#73187F` en `src`. 17 SVG oficiales en `src/assets/brand` y 4 de Loopy en `src/assets/loopy`; `brand-assets`, `brand-palette`, `collage-scenes`, `halftone` y `photos` pasan. Captura del hero: collage con lupa y ojos, píldoras seo y geo, foto de ojo en media tinta, acorde con el moodboard aunque más blando (ver ítem 5). Texto de `dist/index.html`: 0 guiones largos y 0 voseo. Copy verbatim contra el doc de Ari: 9 de 9 cadenas muestreadas coinciden. |
| 5 | De 320 a 1280 px sin scroll horizontal y con `prefers-reduced-motion: reduce` sin movimiento | VERIFICADO | Medido en mi propia ejecución: `scrollWidth` = ancho de ventana a 320, 390 y 1280 px en `/` y `/privacidad/`. `motion.spec.ts`, `collage-photos` (cero animaciones con reduce), `motion-budget.test.mjs` y `phase2-static.test.mjs` pasan. `motion.css` y `global.css` solo animan dentro de `@media (prefers-reduced-motion: no-preference)`; 0 `opacity:0` en el HTML. |

**Puntaje:** 4/5 verdades verificadas, 1 incierta por copy de Ari, 0 fallidas.

## Comprobaciones que ejecuté yo

| Comprobación | Comando | Resultado |
|--------------|---------|-----------|
| Guardas | `node --test tests/guards/*.test.mjs` | 222 de 222 pasan |
| Contraste medido | `node scripts/check-contrast.mjs` | OK, 14 de 14 pares y 11 prohibidos |
| Pendientes al día | `node scripts/list-pending.mjs --check` | OK, PENDING-COPY.md al día (61 pendientes) |
| Build | `npm run build` | Construye. prebuild (contraste, copy, fotos) y postbuild pasan fuera de producción con avisos: 0 estructurales, 40 de contenido |
| Puerta de copy en producción | `PUBLIC_ENV=production node scripts/check-copy.mjs` | Sale 1 (91 verificados, 61 pendientes). Esperado, no es hueco |
| Puerta de fotos en producción | `PUBLIC_ENV=production node scripts/check-photos.mjs` | Sale 1 (elección abierta y aprobación pendiente). Esperado, no es hueco |
| Playwright aislado | `E2E_BLOCK_CLICKUP=1 npx playwright test --project=chromium` con `astro preview` en 4322 | 532 pasan, 97 omitidas, 1 falla |
| La falla | `collage-photos.spec.ts:192` "sin JavaScript la foto se pinta" | Falla bajo carga completa (elemento inestable en el scroll) y pasa 3 de 3 en solitario; es una carrera de la prueba con la entrada del collage, no del producto |
| Peso del HTML | `wc -c dist/index.html` y gzip | 72 096 B crudo (tope 81 920) y 14 404 B gzip (tope 25 600) |
| JS propio | `find dist -name "*.js"` y `<script>` del HTML | 0 archivos `.js`. Un `<script type="module">` inline de 666 caracteres (foco de #agenda) y el script async de ClickUp |
| LCP | `collage-photos.spec.ts:147` | Pasa: el LCP no es `<img>` ni cae en el collage; CLS 0 |
| axe (mi corrida) | `@axe-core/playwright`, etiquetas wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa más best-practice, FAQ abierto, 320 y 1280 px, `/` y `/privacidad/` | 0 violaciones WCAG. 1 solo hallazgo moderate de best-practice, `landmark-unique` en `#solucion` (ver advertencias) |
| Servidores | `npx astro preview stop` | Mi preview detenido; el `astro dev` de Juan (pid 86100) intacto |

## Artefactos y enlaces clave

| Artefacto | Estado | Detalle |
|-----------|--------|---------|
| `src/content/landing.es.yaml` | VERIFICADO | Fuente única del copy con `{text,status}`; 91 verificados, 61 pendientes |
| `src/components/sections/*` (11) más `AgendaSection`, `SiteHeader`, `SiteFooter`, `SkipLinks` | VERIFICADO y conectados | Todos renderizan en `dist/index.html` en el orden canónico (inicio, problema, por-que-ahora, solucion, resultados, casos, nosotros, incluye, como-funciona, para-quien, faq, agenda) |
| `src/components/collage/*` y `src/components/brand/Logo.astro` | VERIFICADO | Escenas, Loopy, fotos y logos en el HTML construido |
| `src/styles/tokens.css`, `motion.css`, `global.css` | VERIFICADO | Solo tokens; motion condicionado |
| `scripts/check-copy.mjs`, `check-photos.mjs`, `check-contrast.mjs` | VERIFICADO | Bloquean en producción, avisan fuera |
| CTA a `#agenda` | CONECTADO | 4 CTA "Agenda tu llamada de 30 minutos" más el salto "Saltar al formulario" hacia `#agenda`; `cta-focus.ts` mueve el foco al h2 |
| `<iframe>` de ClickUp | CONECTADO | `title` descriptivo, `loading="lazy"`, enlace de respaldo. No se envió nada al formulario real |
| Datos (nivel 4) | FLUYEN | Todo texto sale del YAML por `src/lib/content.ts`; lo pendiente se ve como FALTA CONFIRMAR, no como dato inventado |

## Cobertura de requisitos

Los 19 identificadores de los PLAN (02-01 a 02-11) aparecen en REQUIREMENTS.md, todos asignados a la Fase 2. No hay requisitos huérfanos. El plan 02-09 también declara FND-03 (de la Fase 1), sin conflicto.

| Requisito | Estado | Evidencia |
|-----------|--------|-----------|
| CONT-01 Hero | SATISFECHO | H1, subtítulo, descripción y CTA verificados |
| CONT-02 El problema | SATISFECHO | `#problema`, tres dolores y cierre |
| CONT-03 Por qué ahora | SATISFECHO | `#por-que-ahora` |
| CONT-04 La solución, 4 pilares | SATISFECHO con pendiente | 4 pilares; título y cuerpo del pilar 4 en FALTA CONFIRMAR |
| CONT-05 Lo que logramos juntos sin `[VERIFICAR]` | SATISFECHO | Rango 30% a 50% no publicado |
| CONT-06 Casos como tarjetas | SATISFECHO | 5 tarjetas, Meta Ads aparte; canal y algunos plazos pendientes |
| CONT-07 Quiénes somos | SATISFECHO | 4 integrantes con avatar |
| CONT-08 Qué incluye | SATISFECHO con pendiente | 6 ítems; el título del 1 pendiente |
| CONT-09 Cómo funciona | SATISFECHO | 4 fases con plazo (plazos pendientes de confirmar pero visibles) |
| CONT-10 Para quién es y no es (USD 200k) | NECESITA HUMANO | Estructura hecha; el texto que comunica USD 200k es FALTA CONFIRMAR |
| CONT-11 FAQ de 5 a 6 preguntas con `<details>` | NECESITA HUMANO | 6 `<details>` nativos; preguntas y respuestas son FALTA CONFIRMAR |
| CONT-12 Footer con contacto, redes y privacidad | NECESITA HUMANO | Enlace a `/privacidad/` real; correo, redes y cuerpo legal son FALTA CONFIRMAR |
| CONT-13 CTA final junto al formulario | SATISFECHO | `#agenda` con título de Ari, texto, iframe y respaldo |
| COPY-01 Copy verbatim, español neutro | SATISFECHO | Cadenas coinciden con el doc; erratas de Ari conservadas a propósito |
| DSGN-01 Collage pop en SVG estático | SATISFECHO | Escenas, Loopy y fotos en media tinta |
| DSGN-02 Logo e isotipo SVG con área de salvado | SATISFECHO | SVG oficiales, `brand-assets` en verde |
| DSGN-03 320 a 1280 px sin scroll horizontal | SATISFECHO | Medido |
| DSGN-04 Skills de diseño | SATISFECHO (no verificable en código) | Registro en 02-VISUAL-LOG.md y los SUMMARY; sin evidencia contraria |
| DSGN-05 `prefers-reduced-motion` | SATISFECHO | Pruebas y CSS |

En REQUIREMENTS.md CONT-10, CONT-11 y CONT-12 figuran marcados como completos; en contenido visible aún no lo están. Convendría anotarlo al cerrar la fase.

## Anti-patrones

| Archivo | Patrón | Severidad | Impacto |
|---------|--------|-----------|---------|
| `src` `scripts` `tests` | TBD, FIXME, XXX | Ninguno | Solo aparece en una regex de prueba (`a11y-base.spec.ts:478`). Sin marcadores de deuda |
| `landing.es.yaml` | 61 textos `pending` que se pintan como FALTA CONFIRMAR | Info (diseñado) | Bloquean `PUBLIC_ENV=production` a propósito |
| stubs | Ninguno | | Ninguna sección devuelve `null` ni datos vacíos; el estado pendiente es un texto visible, no un hueco |

## Advertencias (no bloquean esta fase)

- **WR-01 (revisión, aplazado):** las puertas de producción viven en `prebuild` y `postbuild` de npm; `astro build` directo las salta. Antes de publicar, la Fase 3 debe cablearlas al despliegue.
- **WR-04 y WR-06 (revisión, aplazados):** `/privacidad/` entra al sitemap de producción aunque es `noindex`, y `sharp` se importa sin declararse.
- **`landmark-unique` (axe best-practice, moderate):** `#solucion`, `#para-quien` y `#faq` tienen el mismo nombre accesible "FALTA CONFIRMAR". Solo aparece un nodo en el reporte y se resuelve solo cuando Ari entregue los títulos. La puerta del proyecto solo mira critical y serious, por eso la humo no lo marca.
- **Prueba frágil:** "sin JavaScript la foto se pinta" no fija `reducedMotion` y puede fallar bajo carga completa. Conviene fijarlo o esperar el fin de la entrada en la Fase 3.
- **Regresión de la Fase 1:** ninguna. Los specs de foco de CTA, base de accesibilidad, estructura de página y cierre pasan; los ítems humanos de 01-VERIFICATION.md siguen pendientes por decisión del usuario.

## Resumen de huecos

Sin huecos de código. El único punto abierto es de contenido y aprobación (Ari) y de juicio de marca; se listan en `human_verification`.

---

_Verificado: 2026-09-19_
_Verificador: Claude (gsd-verifier)_

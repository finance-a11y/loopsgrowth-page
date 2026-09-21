---
phase: 02-secciones-marca-y-copy
plan: 11
subsystem: ui
tags: [collage, photos, halftone, licenses, brand, moodboard, astro-assets, guards, playwright, visual-cycle]
status: complete
requires:
  - phase: 02-secciones-marca-y-copy
    provides: "Plan 02-10: escenas, PHOTO_SLOTS (hero y whynow), R1 a R11, seis grupos de animacion, topes de peso"
provides:
  - "Dos fotos de stock con licencia en media tinta binaria (hero-a, whynow-a) y dos candidatas (hero-b, whynow-b) en la hoja /marca/hoja/"
  - "Mecanismo completo: manifiesto photos.mjs, tratamiento reproducible treat.mjs, registro LICENSES.md, marco CollagePhoto.astro, regla R12 y puerta de produccion check-photos.mjs"
  - "Ciclo visual Lote P (fotos) documentado con mediciones, capturas a cinco anchos y seis recortes contra el moodboard"
affects: [02-07, 02-08, 02-04, 02-05, 02-06, fase-3]
key-files:
  created:
    - scripts/photos/halftone.mjs
    - scripts/photos/treat.mjs
    - scripts/lib/photo-licenses.mjs
    - scripts/check-photos.mjs
    - src/assets/photos/LICENSES.md
    - src/assets/photos/treated/hero-a.png
    - src/assets/photos/treated/hero-b.png
    - src/assets/photos/treated/whynow-a.png
    - src/assets/photos/treated/whynow-b.png
    - src/components/collage/photos.mjs
    - src/components/collage/CollagePhoto.astro
    - tests/guards/halftone.test.mjs
    - tests/guards/photos.test.mjs
    - tests/e2e/collage-photos.spec.ts
  modified:
    - .gitignore
    - package.json
    - src/components/collage/CollageScene.astro
    - src/components/collage/scenes.mjs
    - src/pages/marca/[sheet].astro
    - tests/guards/collage-scenes.test.mjs
    - tests/guards/brand-assets.test.mjs
    - tests/e2e/collage-language.spec.ts
    - tests/e2e/page-structure.spec.ts
    - tests/e2e/brand-assets.spec.ts
    - .planning/phases/02-secciones-marca-y-copy/02-VISUAL-LOG.md
    - .planning/phases/02-secciones-marca-y-copy/02-UI-SPEC.md
    - DESIGN.md
decisions:
  - "Se sirve png con paleta (Image de astro:assets, format png, quality 80) y no webp ni avif: gana en las cuatro fotos (medido)"
  - "El hero queda eager: el LCP es el h1 (40 a 276 ms segun la corrida) y el CLS es 0 en las dos medidas"
  - "Media tinta de borde duro (alfa 0 o 255), sin segundo tamano con srcset: no hay moire a los cinco anchos"
  - "Puerta de produccion: PUBLIC_ENV=production no compila con aprobacion pendiente ni con candidatas sobrantes"
  - "Recomendacion (no decision) para Juan y Ari: hero-a; en Por que ahora empate razonable entre whynow-a y whynow-b"
metrics:
  duration: "tarea 4 unos 30 min; el plan completo no se midio de punta a punta (cuatro ejecutores)"
  completed: 2026-09-19
plan_head_before: a67b4dcb6f9016cea1c0ddc596818b0ba6e1a886
commits: 11
actuals:
  tokens: 21458
  tasks: 4
  commits: 11
requirements-completed: [DSGN-01, DSGN-03, DSGN-04]
---

# Phase 2 Plan 11: Recortes fotograficos en media tinta Summary

**Dos fotos de stock con licencia (ojo tras una lupa en el hero, mano con un telefono en Por que ahora) tratadas en media tinta binaria con la tinta oscura de marca, montadas como marco HTML con la sombra dura de su ranura, con registro de licencias, guardas, hoja de eleccion y una puerta que impide publicar sin la aprobacion de Ari.**

## Estado del plan

| Tarea | Estado | Commit |
|-------|--------|--------|
| 1. Una foto en media tinta de punta a punta en el hero (tracer) | Hecha | f11420a |
| 2. hero-b, whynow-a, whynow-b y Por que ahora con foto | Hecha | ababf3c |
| 3. Hoja de eleccion `[data-sheet="fotos"]` y puerta de produccion | Hecha | f9ab7f6 |
| 4. Mediciones, ciclo visual "Lote P (fotos)", documentos y cierre | Hecha | d5177fb (specs), 483d6f2 (correccion), fa0362b (documentos) |

`commits: 11` se midio con `git rev-list --count a67b4dcb6f9016cea1c0ddc596818b0ba6e1a886..HEAD` (9 de trabajo, el commit de este resumen y el de estado y hoja de ruta, en el que se corrigio este numero; se verifico despues de commitear). Incluye tres commits `docs(02-11)` de resumen parcial.

## Tarea 4: que se hizo

- **Bloques nuevos en `tests/e2e/collage-photos.spec.ts`** (solo con `PHASE2_BATCH`): 'informe de fotos' escribe `test-results/phase2/<lote>-medicion.json` (descriptor y tiempo del LCP, CLS, bytes de cada respuesta de imagen, peticiones y bytes por tipo de recurso, a 390x844 y 1280x800) y 'captura de fotos' guarda hero, whynow y hoja a 320, 390, 768, 1024 y 1280 px, las cuatro candidatas de la hoja a 1280 y los marcos con factor 1 y 2. Todo lo que no es localhost se aborta.
- **Skills invocadas** con la herramienta Skill por primera vez en este plan: `impeccable` (contexto sin entrevista; `critique` con `colorize` y `polish` como lente) y `design-taste-frontend` (diales 7, 3 y 4). Ver "Desviaciones" por la critica en un solo contexto.
- **Capturas:** `P-fotos-{320,390,768,1024,1280}` (con `-reduce` y `-nojs`), `P-fotos-hero-<ancho>`, `P-fotos-whynow-<ancho>`, `P-fotos-hoja-<ancho>`, `P-fotos-foto-<id>-1280`, `P-fotos-frame-{hero,whynow}-1280-dpr{1,2}`, `P-fotos-medicion.json` y `P-fotos-compare-{1..6}.png`, en `test-results/phase2/` (no versionadas).
- **Seis recortes lado a lado** con Pillow contra `brand-inventory/moodboard.png` (cajas y comando en `02-VISUAL-LOG.md`).
- **Honestidad sobre el resultado:** la foto tratada se lee como un recorte impreso en blanco y negro (no como filtro ni como stock generico) y el ojo del hero se reconoce, pero es mas dura que el moodboard: la referencia es gris continuo con grano fino y la nuestra es binaria con punto grueso, mas cerca de un grabado. El marco es una tarjeta con esquina redonda y no un recorte libre que sobresale del disco (decision 4 del plan). Los rostros en azul del moodboard no se reproducen (la tinta es siempre la oscura). El rasgo 2 queda cumplido con esa reserva.
- **Correccion en un solo lote (commit `483d6f2`, solo tratamiento):** `hero-a` con recorte mas cerrado (el iris llena el marco: left 0.26, top 0.28, ancho 0.58, alto 0.5017) y brillo de 165 a 175 (cobertura 0.495 a 0.437, PNG de 9387 bytes); `whynow-a` con menos telefono y mano mas grande (left 0.24, top 0.565, ancho 0.46, alto 0.3185, cobertura 0.247 a 0.32, PNG de 2886 bytes). Una ronda de confirmacion (1 de 1). El telefono de `whynow-a` sigue siendo una mancha oscura con ruido a 73 px de ancho: observacion abierta.
- **Documentos:** `02-VISUAL-LOG.md` ("Lote P (fotos), ronda 0" y "ronda 1"), fe de erratas de las fotos en `02-UI-SPEC.md` y una frase de media tinta en `DESIGN.md`. Sin guiones largos ni cortos.

### Mediciones finales (ClickUp bloqueado, todo lo que no es localhost abortado)

| Medida | Valor | Tope |
|--------|------:|-----:|
| LCP a 390x844 / 1280x800 | H1 `#hero-title`, 172 ms / 184 ms (corrida de confirmacion) y 276 ms / 40 ms (ultima corrida; el tiempo varia con la carga de la maquina) | debe ser texto |
| CLS a 390x844 / 1280x800 | 0 / 0 | 0 |
| Imagen servida hero-a / whynow-a | 11812 / 3597 bytes | 25600 c/u |
| Suma de imagenes de `/` | 15409 bytes | 40960 |
| Peticiones y bytes totales de `/` | 8 y 124109 (documento 39497, estilos 26971, fuentes 42232, imagenes 15409) | sin tope propio |
| `dist/index.html` | 39497 bytes | 42240 (global 61440) |
| `<img ` y `data-piece="` en `dist/index.html` | 2 y 6 | 2 y 6 |
| PNG tratado hero-a / whynow-a | 9387 / 2886 bytes (hero-b 8092, whynow-b 2887 sin cambio) | 30720 |
| Cobertura de tinta hero-a / whynow-a | 0.437 / 0.320 | 0.12 a 0.55 |

Antes de la correccion: imagenes de 13006 y 3306 bytes (16312 en conjunto). Decision de carga: el LCP no es una img y el CLS es 0, asi que `PHOTO_LOADING.hero` sigue en `eager`. En `dist/_astro` siguen saliendo los rasters de las candidatas no elegidas (`hero-b` 10652 y `whynow-b` 3384 bytes, no referenciados desde el HTML); desaparecen al cerrar la eleccion y la puerta de produccion ya los bloquea.

### Verificacion completa (todo verde)

- `node --test tests/guards/*.test.mjs`: 162 de 162. `node scripts/check-contrast.mjs`: sale 0. `node scripts/check-photos.mjs`: sale 0 con 4 `WARN`. `node scripts/list-pending.mjs --check`: sale 0 y `PENDING-COPY.md` sin cambios.
- `E2E_BLOCK_CLICKUP=1 npx playwright test --project=chromium` (preview en 4322, detenido): 260 pasadas, 63 omitidas (capturas e informe, solo con `PHASE2_BATCH`), 0 fallos. Para DSGN-03 cuentan `collage-photos`, `page-structure`, `collage-language` y la hoja a los cinco anchos sin scroll horizontal.
- `npm run build` con sus hooks sale 0. `PUBLIC_ENV=production PUBLIC_SITE_URL=https://example.com npx astro build`: sale 0 y `dist/marca` no existe. `PUBLIC_ENV=production node scripts/check-photos.mjs` sale 1 (aprobacion pendiente y candidatas sobrantes). Build normal final sale 0 y `dist/marca/hoja` existe.
- Barridos: sin hex en `src/components|pages|layouts`, sin `set:html`, sin `outline: none`, sin `73187f` en src, public, tests ni scripts, sin `fetchpriority|priority` en `src/components/collage`; ningun cambio en `src/content`, `PENDING-COPY.md`, `src/layouts`, `src/styles`, `src/components/sections`, `src/components/ui` ni `package-lock.json`; `package.json` solo cambia `prebuild`; `git ls-files | grep ^photo-sources` vacio; ninguna imagen nueva fuera de `src/assets/photos/treated/`.

## Tarea 1: que se hizo

- **Foto hero-a:** Unsplash, "a close-up of a person's eye through a magnifying glass", autor Mohammed Idris Djoudi (https://unsplash.com/@idris_djoudi), pagina https://unsplash.com/photos/a-close-up-of-a-persons-eye-through-a-magnifying-glass-Yu7UxPvBVOM, descargada el 2026-09-19 (1600x2408, sha256 `59b39ecb00f45caff948de8701c9ce90ace89d607712d6f8c3f3f41fb3255925`), original en `photo-sources/hero-a.jpg` (ignorado, no versionado). Sujeto: ojo humano en primer plano detras del aro de una lupa, recortado a ojo y ceja; es la unica excepcion permitida a "sin persona identificable" y queda marcada en la nota para Ari. Aprobacion de Ari: **pendiente**.
- **Licencia:** cita en `src/assets/photos/LICENSES.md` (Unsplash License, leida el 2026-09-19); coincide con la referencia del plan, sin cambios.
- **Tratamiento** (`scripts/photos/halftone.mjs`, `scripts/photos/treat.mjs`): celda 6, angulo 45, contraste 1.0, PNG de paleta de 2 colores sin metadatos, tinta `--color-brand-dark`. Parametros finales de hero-a tras la tarea 4: recorte left 0.26, top 0.28, ancho 0.58, alto 0.5017, brillo 175.
- **Escena y componente:** `photos.mjs` (manifiesto), `photoFrame()` y regla R12 en `scenes.mjs` (sin cambiar ninguna coordenada), `CollagePhoto.astro` montado por `CollageScene.astro` entre la capa svg y las pildoras, con `data-piece-of="panel"` y los mismos `--i`, `--r` y `--r-from` del panel. `check-photos.mjs` agregado a `prebuild`.

## Tarea 2: que se hizo

- **Tres fotos de Unsplash** (licencia Unsplash License, leida el 2026-09-19; originales en `photo-sources/`, ignorado):

| id | autor | pagina | descargada | dimensiones | aprobacion |
|----|-------|--------|------------|-------------|------------|
| `hero-b` | ThisisEngineering | https://unsplash.com/photos/a-person-holding-a-magnifying-glass-with-a-finger-on-it-ZJUG912sIW4 | 2026-09-19 | 1600x1067 | pendiente |
| `whynow-a` | Nubelson Fernandes | https://unsplash.com/photos/a-person-holding-a-cell-phone-in-their-hand-f4swqEOv2B4 | 2026-09-19 | 1600x2845 | pendiente |
| `whynow-b` | Vitaly Gariev | https://unsplash.com/photos/hands-typing-on-a-laptop-keyboard-at-a-desk-lMScFOdgRNg | 2026-09-19 | 1600x900 | pendiente |

  Las cuatro filas (hero-a incluida) estan completas, con sha256, en `src/assets/photos/LICENSES.md`.
- **Sujetos:** hero-b mano con una lupa grande; whynow-a mano tocando un telefono, recortada bajo el reloj de la pantalla; whynow-b manos tecleando en una laptop de perfil.
- **Candidatas rechazadas (a ojo):** 9 antes de elegir (gafas, balon, laptop con codigo legible, telefono con logo, ilustracion 3D, paisaje con lupa diminuta, pantallas con marca legible y una busqueda de Unsplash+ de otra licencia). El criterio 6 (fondo claro y liso) no lo cumple del todo `whynow-b` (fondo desenfocado) ni `hero-b` (mesa verde y madera): se avisa a Ari en la nota de la fila.
- **Formato, png contra webp y avif** (sharp, calidad 80): hero-a 13006 / 18102 / 26165, hero-b 10652 / 15176 / 19389, whynow-a 3306 / 4116 / 6124, whynow-b 3384 / 5208 / 7431. png gana en las cuatro; se conserva `Image` con `format="png"`.
- **Guardas del conjunto** en `photos.test.mjs` (`photoSetErrors`) con mutaciones; pruebas cambiadas: `collage-language.spec.ts`, `brand-assets.spec.ts`, `collage-photos.spec.ts`.

## Tarea 3: que se hizo

- **Prop `photo` en `CollageScene.astro`** (monta una candidata por id; `assertPhotoForSlot` falla en el build si el id no existe o es de otra ranura) y **hoja `/marca/hoja/`** con dos secciones `section[data-sheet="fotos"]`, una celda `data-demo="foto-<id>"` por foto con su rotulo `code` `<id> / <estado>`. No se genera con `PUBLIC_ENV=production`.
- **Puerta de produccion (`check-photos.mjs`):** solo el valor exacto `production` bloquea; en un bloqueo imprime los pasos de "Como cerrar la eleccion" leidos de LICENSES.md. Mensaje actual con `PUBLIC_ENV=production` (sale 1): aprobacion pendiente de `hero-a` y `whynow-a`, y raster existente de las candidatas `hero-b` y `whynow-b`.
- La firma de `evaluatePhotoGate` es `{ rows, photos, files, env }`, distinta de la del plan; mismo comportamiento.

## Sondeos (tarea 1)

- (a) `git status` de src, tests, scripts y public limpio y guardas 139 de 139 antes de empezar.
- (b) `PHOTO_SLOTS` como los declara 02-10: hero (344, 22, 192x250, rx 22, fill cream, sombra 10,10) y whynow (204, 14, 104x128, rx 16, fill white, sombra 8,8). Sin desviaciones.
- (c) `sharp` 0.35.4; `sharp.format.png.output.buffer` verdadero.
- (d) **Acceso web:** unsplash.com/license respondio 307 y despues 401 con un desafio anti bots a curl; pexels.com/license y pixabay.com/service/license-summary 403. La licencia de Unsplash se leyo con WebFetch (fragmentos entrecomillados, no la pagina completa); la de Pexels tambien se leyo pero no se uso ni se registro. La descarga salio de `images.unsplash.com` con curl, HTTP 200, sin claves ni sesion.
- (e) Linea base: `.hero-collage` outerHTML 5028 bytes (02-10) y `dist/index.html` 38627 bytes.

## Pruebas en rojo antes del codigo

Por modulo inexistente: `tests/guards/halftone.test.mjs` y `tests/guards/photos.test.mjs` (todo). Por asercion o simbolo inexistente: en `collage-scenes.test.mjs` "marco de foto: photoFrame..." y "R12: un garabato o una reticula...", en `brand-assets.test.mjs` "plan 02-11: CollagePhoto.astro y photos.mjs estan en OWNED...". En la tarea 3, tres casos nuevos de guardas (mutaciones de la puerta, subproceso, prop `photo`). Las pruebas de Playwright nuevas y modificadas no se corrieron en rojo (ver desviaciones).

## Desviaciones de la ejecucion

1. **Skills invocadas solo en la tarea 4.** El plan pide invocarlas en la primera tarea de UI; el encargo del orquestador dijo usarlas solo en el ciclo visual para ahorrar contexto. Se siguio el encargo.
2. **Critica en un solo contexto (degradada).** `impeccable critique` exige dos sub agentes aislados (revision de diseno y detector) y esta sesion no expone herramienta de sub agentes: ambos corrieron en el mismo contexto. El detector solo devolvio un aviso consultivo en `Pill.astro` (`border-radius: 0.45em`, pieza de 02-10, no de las fotos). No se guardo instantanea de critica.
3. **R12 usa el formato `[R12]` de 02-10**, no `R12 el marco...` del plan, para conservar el formato de los errores de `assertScene`.
4. **Rojo de Playwright no observado** en las tareas 1 a 3 (se escribieron y se confirmaron en verde; los dos fallos iniciales fueron conteos de pruebas anteriores). Los bloques nuevos de la tarea 4 son herramientas de captura: no se escribieron en rojo.
5. **Cita de la licencia via WebFetch, no via curl** (Anubis bloquea curl): son los fragmentos entrecomillados que devolvio la herramienta de lectura web. Esta dicho en la propia seccion de LICENSES.md.
6. **Parametros de tratamiento de partida distintos a los del plan** por fotos oscuras; documentados y reproducibles con `treat.mjs`.
7. **Bloque 'informe de fotos' no lleva "captura" en el titulo**, asi que el `-g captura` del plan no lo ejecuta: se corre con `-g "captura|informe de fotos"` (comando en el registro visual). La primera corrida de la hoja fallo por tiempo (imagenes lazy de la hoja sin recorrer); se corrigio usando `scrollThrough` en el bloque de captura antes del segundo intento.
8. **`playwright test` vacia `test-results/` al empezar.** La suite completa borro las capturas del Lote P ya generadas; se regeneraron con una corrida final de captura (`-g "captura|informe de fotos"`) despues de la suite, y los recortes con Pillow despues de eso (la captura de 320 px agoto los 30 s con la maquina cargada y se repitio sola con `--output` a otro directorio para no volver a vaciar `test-results/`). Quien corra la suite completa debe volver a generar las capturas.
9. **Marcado de estado por el orquestador.** El plan decia "no marques requisitos ni avances contadores: eso lo hace el orquestador al cerrar"; el encargo de esta corrida pidio correr esas operaciones una vez despues de commitear este resumen.
10. **`actuals.tokens`** son 21458: caracteres entre 4 de las lineas anadidas del diff de texto (sin PNG ni este resumen) de `a67b4dc..HEAD`, misma escala que `estimateTokens`; no incluye lectura, busqueda ni crear imagenes, y es muy inferior a la estimacion de 160000 (que contaba el trabajo del ejecutor, no el diff).

## Threat flags

Ninguno nuevo. Las superficies del modelo de amenazas (descarga de terceros, licencias, metadatos, candidatas publicadas, peso, peticiones de terceros, alt decorativo, tinta horneada) estan cubiertas por guardas y por la puerta de produccion (T-02-11-01 a T-02-11-11). T-02-11-04 sigue con la aprobacion de Ari pendiente.

## Known Stubs

Ninguno. La aprobacion de Ari y la eleccion entre candidatas estan abiertas por diseno, registradas en LICENSES.md y bloqueadas por `check-photos.mjs` en produccion.

## Efectos sobre planes pendientes (para el orquestador)

- **02-07 (animacion de entrada):** el marco de la foto del hero es un hermano HTML del grupo `panel` con `data-piece-of="panel"` y los mismos `--i`, `--r` y `--r-from`; para que la foto entre junto con su panel, animar `[data-piece="panel"]` y `[data-piece-of="panel"]` con la misma animacion. Los seis `[data-piece]` y los ganchos `.hc-pupil` y `[data-pupil]` no cambian; ningun elemento exterior lleva transform. Hoy hay cero animaciones con `prefers-reduced-motion` reduce y no-preference.
- **02-08 (verificacion final):** sumar a `02-ARI-FINDINGS.md` las fotos pendientes de aprobacion de Ari (LICENSES.md), el sujeto y la nota de cada una, que las cuatro muestran manos u ojo de personas reales sin permiso de modelo registrado por la fuente, y que el png sustituye a avif y webp. Los conteos de `svg[data-collage]` y de imagenes de la pagina pasan a "cero img fuera de las dos fotos". Cerrar la eleccion (pasos abajo) antes de un build de produccion.
- **02-04 a 02-06:** `dist/index.html` de 02-10 dejaba unos 20 KB de margen; ahora quedan unos 2.7 KB hasta el tope de 42240 de este plan (39497) y unos 22 KB hasta el global de 61440. No cambia ningun contrato de sus componentes.
- **Fase 3 (SEO, medicion y QA):** Lighthouse sobre las fotos (LCP y CLS en movil; hoy medidos solo con PerformanceObserver), registrar en `A11Y-DECISIONS.md` que las fotos son decorativas (`alt` vacio, raiz `aria-hidden`), y revisar que produccion no se publique con aprobacion pendiente (la puerta lo impide con `PUBLIC_ENV=production`).

## Decisiones y preguntas para Juan y Ari

1. **Ari: aprobar las fotos.** Sin la aprobacion, `PUBLIC_ENV=production` no compila. Cuatro fotos muestran manos u ojo de personas reales y la fuente no registra permiso de modelo; hay que decidir con que nombre se registra la aprobacion (`aprobada por <nombre> el <fecha>`).
2. **Juan y Ari: elegir candidata por ranura en `/marca/hoja/`.** Recomendacion de la critica (no una decision): hero, `hero-a` (`hero-b` es ilegible a tamano de escena); Por que ahora, empate razonable: `whynow-b` se reconoce mejor a 104 px pero su fondo no es liso, `whynow-a` tiene la silueta mas limpia pero su telefono es una mancha con ruido a 73 px.
3. **Juan: png en lugar de avif y webp.** Resuelto por medicion (png gana en las cuatro fotos, el webp pesa de 1.2 a 1.5 veces mas y el avif de 1.8 a 2.2 veces mas); se puede revertir con `Picture`.
4. **Juan: la puerta de produccion por aprobacion pendiente y candidatas sobrantes** es un anadido del plan. Para quitarla: la linea de `prebuild` y la guarda correspondiente.
5. **Juan: el rasgo 2 queda mas duro que el moodboard** (binario, punto grueso, marco de tarjeta y no recorte libre). Si se quiere un gris continuo con grano o un recorte que sobresalga del disco, exige una escena distinta de 02-10 y otra regla de solape; y fotos reales del equipo cambiarian el sujeto.
6. **Juan: `sharp`** sigue siendo opcional de Astro y no esta pineado en `package.json`; pinearlo pide su propia auditoria de paquetes.

## Estado de LICENSES.md y pasos para cerrar la eleccion

Eleccion: abierta. Elegidas `hero-a` y `whynow-a`, aprobacion **pendiente**; candidatas `hero-b` y `whynow-b`. Pasos (tal como estan en `src/assets/photos/LICENSES.md`):

1. Juan y Ari eligen en `/marca/hoja/` una candidata por ranura.
2. En `src/components/collage/photos.mjs`: `chosen: true` solo en la elegida de cada ranura y borrar la entrada de la otra.
3. En LICENSES.md: escribir `aprobada por <nombre> el <AAAA-MM-DD>` en la fila de la elegida, borrar la fila de la otra, cambiar `Eleccion: abierta` por `Eleccion: cerrada` y actualizar "Estado".
4. Borrar `src/assets/photos/treated/<id>.png` de la candidata descartada y su original en `photo-sources/`.
5. Comprobar: `node --test tests/guards/photos.test.mjs`, `PUBLIC_ENV=production node scripts/check-photos.mjs` (debe salir 0) y `npx astro build`.

## Para quien continua

- Servidores: ninguno levantado por esta corrida (`astro preview stop` ejecutado); el `astro dev` del usuario (pid 86100) no se toco.
- Las capturas y recortes del Lote P estan en `test-results/phase2/` (no versionadas); el script de Pillow se dejo fuera del repositorio y el comando y las cajas estan en `02-VISUAL-LOG.md`.
- Para regenerar un PNG: `node scripts/photos/treat.mjs --id <id> [--preview dir] [--dry]` con el original en `photo-sources/` (verifica el sha256 de LICENSES.md).
- Al cerrar el plan se corrieron las operaciones de estado una sola vez; el orden de ejecucion pendiente es 02-03 tarea 4 y despues 02-04 a 02-08.

## Self-Check: PASSED

Verificado antes de commitear: existen `src/components/collage/photos.mjs`, `src/components/collage/CollagePhoto.astro`, `src/assets/photos/LICENSES.md`, los cuatro PNG de `src/assets/photos/treated/`, `tests/e2e/collage-photos.spec.ts`, `tests/guards/photos.test.mjs` y las capturas y recortes `P-fotos-*` incluida `P-fotos-medicion.json`; los commits f11420a, ababf3c, f9ab7f6, d5177fb, 483d6f2 y fa0362b existen en la rama.

# Roadmap: Loops Growth Landing

## Overview

Loops Growth necesita una landing de una sola página que lleve al visitante al formulario de ClickUp, a un scroll de distancia. El camino empieza por lo que sostiene el valor central: un sitio Astro corriendo en local con el formulario embebido y probado con un envío real, y con los tokens de marca, el copy y las reglas de accesibilidad protegidos por scripts desde el primer día. Sobre esa base se construyen las secciones del Copy v2 con el estilo collage pop de la marca. Luego se cierran SEO, medición mínima y QA, porque una agencia de SEO/GEO no puede tener una página con Core Web Vitals o accesibilidad flojos. Las fases 1 a 3 dejan el sitio local listo para que Ari y Camila lo validen. La fase 4 depende del dominio y de decisiones de Ari, y publica el sitio con el QR del evento.

## Phases

**Phase Numbering:**

- Fases enteras (1, 2, 3): trabajo planeado del hito
- Fases decimales (2.1, 2.2): inserciones urgentes (marcadas INSERTED)

Las fases decimales aparecen entre sus enteras vecinas en orden numérico.

- [ ] **Phase 1: Fundaciones y formulario funcionando** - Sitio local con el formulario de ClickUp embebido y probado con un envío real, con tokens, copy y accesibilidad base protegidos por scripts
- [ ] **Phase 2: Secciones, marca y copy** - Las secciones del Copy v2 con el estilo collage pop, responsive y con el texto del doc de Ari
- [ ] **Phase 3: SEO, medición mínima y QA** - Metadatos, JSON-LD, eventos de medición, accesibilidad y rendimiento verificados con datos
- [ ] **Phase 4: Salida al evento** - Dominio, deploy con HTTPS, QR con UTM, QR de contingencia y vista previa social

## Phase Details

### Phase 1: Fundaciones y formulario funcionando

**Goal:** As a dueño de un negocio, I want to llenar el formulario de ClickUp sin salir de la página, so that Ari y Camila reciban mi solicitud de llamada.
**Mode:** mvp
**Reglas de proyecto**: el diseño web pasa por las skills `impeccable` y `design-taste-frontend`; todo el copy sale tal cual del doc de Ari, sin pasar por `humanizer`.
**Depends on**: Ninguna (primera fase)
**Requirements**: FND-01, FND-02, FND-03, FND-04, FND-05, FORM-01, FORM-02, FORM-03, FORM-04, FORM-05, COPY-02, A11Y-03
**Success Criteria** (what must be TRUE):

  1. Ari y Camila abren el sitio desde su red local (`npm run dev` con `--host`, puerto 4321) y ven el formulario de ClickUp embebido en `#agenda`, con `title` en español y sin recortes ni saltos de layout a 390 px y a 1280 px.
  2. Cada CTA "Agenda tu llamada" baja a `#agenda` y deja el foco en el encabezado de esa sección. El enlace de respaldo que abre el formulario en pestaña nueva se ve siempre, y sin JavaScript el `noscript` ofrece el mismo enlace.
  3. Un envío de prueba real, en móvil y en escritorio, muestra la confirmación de ClickUp al visitante y crea la tarea en la Lista de ClickUp.
  4. Con solo el teclado, el visitante usa el skip link y ve el foco (2 px, contraste 3:1) sobre cada superficie. Los botones y enlaces miden al menos 44 px, el documento declara `lang="es"` y todo el contenido se ve sin JavaScript.
  5. Los tokens de marca y los pares texto/fondo aprobados viven en un solo lugar, y un par sin contraste suficiente rompe el script de contraste. El copy vive en `landing.es.yaml` con `status: verified | pending`: un build con `PUBLIC_ENV=production` falla si queda `[VERIFICAR]`, una afirmación `pending`, voseo, guion largo o "AEO", y cualquier otro entorno sale con `noindex`. El texto con `áéíóúüñ¿¡` se ve bien con Outfit como respaldo detrás de `--font-brand`.

**Plans:** 4/4 plans executed

Plans:

- [x] 01-01-PLAN.md: Esqueleto caminable (Astro 7 y Tailwind 4, copy en `landing.es.yaml` con esquema, formulario real de ClickUp en `#agenda`, entorno con `noindex` y Outfit tras `--font-brand`)
- [x] 01-02-PLAN.md: Guardas de build (`tokens.css` con `check-contrast.mjs` y `check-copy.mjs` en `prebuild`)
- [x] 01-03-PLAN.md: Superficies UI y accesibilidad base (CTA con foco al h2, skip links, header, enlace de respaldo con `noscript`, verificación con Playwright)
- [x] 01-04-PLAN.md: Medición del iframe (FORM-04) y envío real de prueba en escritorio y móvil (FORM-05)

**UI hint**: yes

### Phase 2: Secciones, marca y copy

**Goal:** As a dueño de un negocio, I want to entender en segundos qué hace Loops Growth y por qué confiar, so that llegue al formulario decidido a agendar.
**Mode:** mvp
**Reglas de proyecto**: el diseño web pasa por las skills `impeccable` y `design-taste-frontend` (esta es la fase con más trabajo de diseño); todo el copy sale tal cual del doc de Ari, sin pasar por `humanizer`.
**Depends on**: Phase 1
**Requirements**: CONT-01, CONT-02, CONT-03, CONT-04, CONT-05, CONT-06, CONT-07, CONT-08, CONT-09, CONT-10, CONT-11, CONT-12, CONT-13, COPY-01, DSGN-01, DSGN-02, DSGN-03, DSGN-04, DSGN-05
**Success Criteria** (what must be TRUE):

  1. En los primeros segundos, el visitante lee un H1 en texto real con categoría, público y resultado, un subtítulo y el CTA principal. Al bajar, entiende el problema, por qué ahora y la solución en cuatro pilares.
  2. El visitante ve la prueba sin logos ni fotos inventadas: "Lo que logramos juntos" sin cifras `[VERIFICAR]` que no tengan respaldo, casos de éxito como tarjetas de métrica (cifra, sector anonimizado, plazo y canal) con el caso de Meta Ads en su propia tarjeta, y los cuatro integrantes del equipo con nombre, cargo y avatar ilustrado.
  3. El visitante ve qué incluye el servicio (seis entregables), cómo funciona (cuatro fases con plazos) y para quién es y para quién no (negocios desde USD 200k al año). Puede abrir un FAQ de 5 a 6 preguntas y termina en el CTA final junto al formulario, con un footer que trae contacto, redes y política de privacidad.
  4. La página se ve como Loops Growth: collage pop con lupas, ojos y clics en SVG estático, logo e isotipo en SVG con su área de salvado, y todo el texto en español neutro con la voz de marca, sin voseo ni guiones largos.
  5. De 320 px a 1280 px la página se lee y funciona sin scroll horizontal, y con `prefers-reduced-motion: reduce` no hay ningún movimiento.

**Plans**: TBD

- [x] 02-09-PLAN.md
- [x] 02-10-PLAN.md
- [x] 02-11-PLAN.md

- [x] 02-01-PLAN.md
- [x] 02-02-PLAN.md
- [x] 02-03-PLAN.md
- [x] 02-04-PLAN.md
- [x] 02-05-PLAN.md
- [x] 02-06-PLAN.md
- [x] 02-07-PLAN.md
- [x] 02-08-PLAN.md

**UI hint**: yes

### Phase 3: SEO, medición mínima y QA

**Goal:** As a dueño de un negocio, I want to abrir la página desde buscadores, redes o un QR en cualquier dispositivo, so that pueda enviar el formulario sin tropiezos.
**Mode:** mvp
**Reglas de proyecto**: el diseño web (incluida la imagen OG) pasa por las skills `impeccable` y `design-taste-frontend`; todo el texto, incluidos title, meta description y demás metadatos, sale del doc de Ari (o se pide a Ari), sin pasar por `humanizer`.
**Depends on**: Phase 2
**Requirements**: SEO-01, SEO-02, SEO-03, PERF-01, MEAS-01, MEAS-02, A11Y-01, A11Y-02
**Success Criteria** (what must be TRUE):

  1. La página tiene title, meta description, canonical e imagen OG de 1200x630 propios, y el HTML servido incluye JSON-LD `Organization`, `ProfessionalService`, `WebSite` y `WebPage`, sin `Review` ni `AggregateRating`.
  2. La página tiene un solo H1 y landmarks semánticos, y el sitemap y el robots se generan según el entorno.
  3. En un build local servido con `PUBLIC_ENV=production`, Lighthouse móvil da rendimiento 95 o más, accesibilidad 100 y SEO 100.
  4. axe no reporta violaciones serias ni críticas, el visitante recorre toda la página solo con teclado (incluida la entrada y la salida del iframe de ClickUp), y existen `docs/a11y/REPORT.md`, `EXCEPTIONS.md` (con el iframe de ClickUp) y `A11Y-DECISIONS.md`.
  5. Los clics en CTA y la visibilidad del formulario emiten `cta_click` y `form_view` en `dataLayer` (sin efecto si no hay ID de GA4), y los parámetros UTM de la URL llegan al iframe cuando el formulario tiene los campos ocultos.

**Plans**: TBD

### Phase 4: Salida al evento

**Goal:** As a asistente al evento, I want to escanear un QR y abrir la landing pública en mi móvil, so that pueda agendar mi llamada con Loops Growth.
**Mode:** mvp
**Reglas de proyecto**: cualquier pieza de diseño web que aparezca (vista previa social, página de destino del QR) pasa por las skills `impeccable` y `design-taste-frontend`; todo texto nuevo, incluido el del material impreso del QR, sale del doc de Ari (o se pide a Ari), sin pasar por `humanizer`.
**Depends on**: Phase 3, más dos decisiones externas: el dominio (o un subdominio gratuito) y la aprobación de Ari sobre las afirmaciones `pending`
**Nota**: se planifica ahora, pero se ejecuta antes del evento, cuando las decisiones externas estén resueltas. No bloquea la entrega local de las fases anteriores.
**Requirements**: LNCH-01, LNCH-02, LNCH-03, LNCH-04
**Success Criteria** (what must be TRUE):

  1. Cualquier persona abre la landing por HTTPS en `loopsgrowth.com` o en un subdominio gratuito, publicada con `PUBLIC_ENV=production`.
  2. Escanear el QR estático impreso (URL corta bajo dominio propio, con los UTM del evento) abre la landing en un iPhone y en un Android, y un QR de contingencia abre directo el formulario de ClickUp.
  3. En la URL final no hay `noindex`, el canonical y `og:url` son correctos, el sitemap es válido y hay un solo H1.
  4. Al compartir la URL por WhatsApp y por LinkedIn, la vista previa muestra el título, la descripción y la imagen correctos.

**Plans**: TBD

## Progress

**Execution Order:**
Las fases se ejecutan en orden numérico: 1 → 2 → 3 → 4. Las fases 1 a 3 cierran el sitio local; la fase 4 se ejecuta antes del evento.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Fundaciones y formulario funcionando | 4/4 | In Progress|  |
| 2. Secciones, marca y copy | 11/11 | In Progress|  |
| 3. SEO, medición mínima y QA | 0/TBD | Not started | - |
| 4. Salida al evento | 0/TBD | Not started | - |

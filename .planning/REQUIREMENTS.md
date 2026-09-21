# Requirements: Loops Growth Landing

**Defined:** 2026-09-18
**Core Value:** Un visitante entiende en segundos qué hace Loops Growth y llena el formulario de ClickUp, que está a un scroll de distancia.

## v1 Requirements

Requisitos para la primera entrega. Cada uno se asigna a una fase del roadmap.

### Fundaciones

- [x] **FND-01**: El sitio corre en local con `npm run dev` en `localhost:4321` y es accesible desde la red local con `--host` para que Ari y Camila lo validen.
- [x] **FND-02**: Todo el copy vive en un único archivo `landing.es.yaml` validado por esquema, y cada afirmación tiene `status: verified | pending`.
- [x] **FND-03**: Los tokens de marca (Purple #4228D1, Wild Orange #fd6938, Sun Yellow #ffc602, Dark Gray #212121) y los pares texto/fondo aprobados se definen en un solo lugar, y un script de contraste falla si un par no cumple.
- [x] **FND-04**: La fuente de marca se consume solo mediante la variable `--font-brand`, con Outfit como respaldo, y los glifos `áéíóúüñ¿¡` se ven correctos.
- [x] **FND-05**: `PUBLIC_SITE_URL` y `PUBLIC_ENV` controlan canonical, sitemap y robots, y el sitio sale con `noindex` en cualquier entorno distinto de producción.

### Formulario y conversión

- [x] **FORM-01**: El formulario de ClickUp aparece embebido por iframe en la sección `#agenda`, con un `title` descriptivo en español.
- [x] **FORM-02**: Cada CTA "Agenda tu llamada" lleva a `#agenda` y mueve el foco al encabezado de esa sección.
- [x] **FORM-03**: El visitante ve siempre un enlace de respaldo que abre el formulario de ClickUp en pestaña nueva, y un `noscript` con el mismo enlace.
- [x] **FORM-04**: El iframe reserva una altura mínima medida en 390 px y 1280 px, sin recortes ni saltos de layout, y el auto-resize de ClickUp funciona.
- [ ] **FORM-05**: Un envío real de prueba, en móvil y en escritorio, muestra la confirmación al visitante y crea la tarea en la Lista de ClickUp.

### Contenido y secciones

- [x] **CONT-01**: El visitante ve un Hero con H1 en texto real (categoría, público y resultado), subtítulo, descripción y CTA principal.
- [x] **CONT-02**: El visitante lee la sección "El problema" con los tres dolores del Copy v2.
- [x] **CONT-03**: El visitante lee la sección "Por qué ahora" sobre la búsqueda en Google y en asistentes de IA.
- [x] **CONT-04**: El visitante ve "La solución" con los 4 pilares (auditoría, estrategia Google e IA, equipo dedicado, reportes).
- [x] **CONT-05**: El visitante ve "Lo que logramos juntos" con los cuatro resultados, sin cifras marcadas `[VERIFICAR]` que no estén respaldadas.
- [x] **CONT-06**: El visitante ve los casos de éxito como tarjetas de métrica sin logos (cifra, sector anonimizado, plazo, canal), con el caso de Meta Ads en su propia tarjeta.
- [x] **CONT-07**: El visitante ve "Quiénes somos" con los 4 integrantes (Arianna, Verónica, Juan, Miguel), nombre, cargo y avatar ilustrado.
- [x] **CONT-08**: El visitante ve "Qué incluye" con los seis entregables del Copy v2.
- [x] **CONT-09**: El visitante ve "Cómo funciona" con las 4 fases y sus plazos.
- [x] **CONT-10**: El visitante ve un bloque "Para quién es / para quién no es" que comunica el perfil de cliente de USD 200k o más al año.
- [x] **CONT-11**: El visitante puede abrir un FAQ de 5 a 6 preguntas hecho con `<details>` nativo.
- [x] **CONT-12**: El visitante ve un footer mínimo con contacto, redes y enlace a política de privacidad.
- [x] **CONT-13**: El visitante ve la sección CTA final ("¿Listo para que te encuentren cuando te estén buscando?") junto al formulario.

### Copy

- [x] **COPY-01**: Todo el texto sale tal cual del doc de Ari (sin humanizar ni reescribir), en español neutro; si falta un texto se pide a Ari.
- [x] **COPY-02**: El build de producción falla si queda `[VERIFICAR]`, una afirmación `pending`, voseo, guion largo o el término "AEO".

### Diseño y marca

- [x] **DSGN-01**: La página aplica el estilo collage pop del brandbook (lupas, ojos, clics) con SVG decorativo estático por defecto.
- [x] **DSGN-02**: El logo e isotipo se usan en SVG respetando el área de salvado del brandbook.
- [x] **DSGN-03**: La página se ve y funciona de 320 px a 1280 px sin scroll horizontal.
- [x] **DSGN-04**: Todo el trabajo de diseño web pasa por las skills `impeccable` y `design-taste-frontend`.
- [x] **DSGN-05**: Cualquier movimiento se desactiva con `prefers-reduced-motion: reduce`.

### Accesibilidad

- [ ] **A11Y-01**: axe no reporta violaciones serias ni críticas, y el visitante completa toda la página solo con teclado.
- [ ] **A11Y-02**: Existen `docs/a11y/REPORT.md`, `EXCEPTIONS.md` (incluye el iframe de ClickUp) y `A11Y-DECISIONS.md`, según A11Y.md.
- [x] **A11Y-03**: El foco es visible (2 px, contraste 3:1), los objetivos táctiles miden al menos 44 px, hay skip link, `lang="es"` y todo el contenido es visible sin JavaScript.

### SEO y rendimiento

- [ ] **SEO-01**: La página tiene title, meta description, canonical e imagen OG de 1200x630 propios.
- [ ] **SEO-02**: El HTML servido incluye JSON-LD `Organization`, `ProfessionalService`, `WebSite` y `WebPage`, sin `Review` ni `AggregateRating`.
- [ ] **SEO-03**: La página tiene un solo H1 y landmarks semánticos, y genera sitemap y robots según el entorno.
- [ ] **PERF-01**: En el build local, Lighthouse móvil da rendimiento 95 o más, accesibilidad 100 y SEO 100.

### Medición

- [ ] **MEAS-01**: Los clics en CTA y la visibilidad del iframe emiten eventos `cta_click` y `form_view` en `dataLayer`, sin efecto si no hay ID de GA4.
- [ ] **MEAS-02**: Los parámetros UTM de la URL pasan al iframe de ClickUp cuando el formulario tiene los campos ocultos.

### Salida al evento

- [ ] **LNCH-01**: El sitio está desplegado con HTTPS en el dominio (`loopsgrowth.com`) o en un subdominio gratuito, con `PUBLIC_ENV=production`.
- [ ] **LNCH-02**: Existe un QR estático con UTM hacia una URL corta bajo dominio propio, y un QR de contingencia directo al formulario de ClickUp.
- [ ] **LNCH-03**: La URL final pasa el checklist: sin `noindex`, canonical y `og:url` correctos, sitemap válido y un solo H1.
- [ ] **LNCH-04**: La vista previa social se ve bien al compartir por WhatsApp y LinkedIn.

## v2 Requirements

Diferido a una versión posterior. Registrado, fuera del roadmap actual.

### Prueba y conversión

- **PROOF-01**: Sección "Bajo el capó" con puntajes reales de Lighthouse, schema y renderizado en servidor.
- **PROOF-02**: Franja de métricas agregadas (requiere cifras respaldadas por Ari).
- **PROOF-03**: Testimonios y logos de clientes con autorización.
- **CONV-01**: Barra CTA fija en móvil.
- **CONV-02**: Formulario propio conectado a la API de ClickUp con estilo de marca.
- **MEAS-03**: `generate_lead` server-side vía webhook de ClickUp.

### Alcance ampliado

- **SEO-04**: JSON-LD `Person` y `FAQPage`, y `llms.txt`.
- **I18N-01**: Versión en inglés.
- **CMS-01**: Edición visual o CMS sobre Git para el equipo SEO.
- **PAGE-01**: Blog y página About completa.

## Out of Scope

Excluido de forma explícita para evitar deriva de alcance.

| Feature | Reason |
|---------|--------|
| Logos, testimonios o fotos inventados | No hay material ni permiso; riesgo legal y de credibilidad |
| Carruseles y marquee con auto-avance | Falla WCAG 2.2.2 y perjudica Core Web Vitals |
| Pop-ups, chat widget, newsletter, segundo CTA | Diluyen la única conversión de la página |
| Video de fondo | Peso y accesibilidad; sin beneficio de conversión |
| Texto dentro de imágenes del collage | Inaccesible y no indexable |
| Schema `Review` o `AggregateRating` | No hay reseñas reales verificables |
| Tabla de precios | Ninguna referencia la publica; el precio se define en la llamada |
| Calendario de llamadas, plantillas de correo, SOP de onboarding, cotizaciones | Parte del proceso comercial, no de la landing |
| WordPress + Astra + Elementor | Plan B solo si el equipo exige edición visual desde el día uno |

## Traceability

Qué fase cubre cada requisito. Completado al crear el roadmap.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FND-01 | Phase 1 | Complete |
| FND-02 | Phase 1 | Complete |
| FND-03 | Phase 1 | Complete |
| FND-04 | Phase 1 | Complete |
| FND-05 | Phase 1 | Complete |
| FORM-01 | Phase 1 | Complete |
| FORM-02 | Phase 1 | Complete |
| FORM-03 | Phase 1 | Complete |
| FORM-04 | Phase 1 | Complete |
| FORM-05 | Phase 1 | Pending |
| COPY-02 | Phase 1 | Complete |
| A11Y-03 | Phase 1 | Complete |
| CONT-01 | Phase 2 | Complete |
| CONT-02 | Phase 2 | Complete |
| CONT-03 | Phase 2 | Complete |
| CONT-04 | Phase 2 | Complete |
| CONT-05 | Phase 2 | Complete |
| CONT-06 | Phase 2 | Complete |
| CONT-07 | Phase 2 | Complete |
| CONT-08 | Phase 2 | Complete |
| CONT-09 | Phase 2 | Complete |
| CONT-10 | Phase 2 | Complete |
| CONT-11 | Phase 2 | Complete |
| CONT-12 | Phase 2 | Complete |
| CONT-13 | Phase 2 | Complete |
| COPY-01 | Phase 2 | Complete |
| DSGN-01 | Phase 2 | Complete |
| DSGN-02 | Phase 2 | Complete |
| DSGN-03 | Phase 2 | Complete |
| DSGN-04 | Phase 2 | Complete |
| DSGN-05 | Phase 2 | Complete |
| A11Y-01 | Phase 3 | Pending |
| A11Y-02 | Phase 3 | Pending |
| SEO-01 | Phase 3 | Pending |
| SEO-02 | Phase 3 | Pending |
| SEO-03 | Phase 3 | Pending |
| PERF-01 | Phase 3 | Pending |
| MEAS-01 | Phase 3 | Pending |
| MEAS-02 | Phase 3 | Pending |
| LNCH-01 | Phase 4 | Pending |
| LNCH-02 | Phase 4 | Pending |
| LNCH-03 | Phase 4 | Pending |
| LNCH-04 | Phase 4 | Pending |

**Coverage:**

- v1 requirements: 43 total
- Mapped to phases: 43
- Unmapped: 0 ✓

**Por fase:** Phase 1 = 12, Phase 2 = 19, Phase 3 = 8, Phase 4 = 4.

---
*Requirements defined: 2026-09-18*
*Last updated: 2026-09-18 after roadmap creation*

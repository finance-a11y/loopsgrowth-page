# Phase 3: SEO, medición mínima y QA - Context

**Gathered:** 2026-09-18
**Status:** Ready for planning

<domain>
## Phase Boundary

La landing lista para ser encontrada y medida, y verificada con evidencia: metadatos propios, imagen OG, JSON-LD, sitemap y robots por entorno, Lighthouse móvil 95 o más (accesibilidad y SEO en 100), axe sin violaciones serias ni críticas, recorrido completo con teclado (incluido el iframe de ClickUp), eventos `cta_click` y `form_view` en `dataLayer` y paso de UTM al iframe. Los documentos `docs/a11y/REPORT.md`, `EXCEPTIONS.md` y `A11Y-DECISIONS.md` existen y están versionados. El despliegue público y el QR son de la fase 4.

</domain>

<decisions>
## Implementation Decisions

### Metadatos, imagen OG y schema
- Title de 60 caracteres o menos con "SEO y GEO", e-commerce y marca; meta description de 155 o menos. Tomados del doc de Ari si los trae (sin humanizar); si no, se piden a Ari o se proponen como `pending` para su aprobación. Con "SEO/GEO" y nunca "AEO".
- Imagen OG de 1200x630: composición estática con collage de marca, H1 corto y logo, diseñada con `impeccable` y exportada a PNG.
- JSON-LD con `Organization`, `ProfessionalService`, `WebSite` y `WebPage`. Sin `Review` ni `AggregateRating`. Sin dirección ni teléfono si Ari no los entrega. `sameAs` con las redes.
- robots en producción permite todos los rastreadores, incluidos los de IA (GPTBot, ClaudeBot, PerplexityBot, Google-Extended), porque somos una agencia de GEO. Sitemap y robots dependen de `PUBLIC_ENV` y `PUBLIC_SITE_URL` (decisión de la fase 1).

### Medición y UTM
- Los eventos se empujan a `dataLayer`. GA4 se carga con `gtag` asíncrono solo si existe `PUBLIC_GA4_ID`; sin ID no hay peticiones de terceros.
- `cta_click` incluye la ubicación del CTA (hero, tras solución, tras casos, final). `form_view` se emite una sola vez cuando el 50% del formulario entra en pantalla, con `IntersectionObserver`.
- Un script mínimo lee los UTM de la URL y los agrega al `src` del iframe. Solo funciona si el formulario de ClickUp tiene campos ocultos con esos nombres; si no, no tiene efecto y se avisa a Ari.
- No se carga GA4 hasta que Ari decida sobre un banner de consentimiento; queda registrado como decisión externa. Sin ID no hay cookies.

### QA y accesibilidad
- Script `npm run audit`: construye con `PUBLIC_ENV=production`, sirve con `astro preview` y falla si Lighthouse móvil da menos de 95 en rendimiento o menos de 100 en accesibilidad y SEO.
- `@axe-core/playwright` a 320, 390 y 1280 px; falla ante violaciones serias o críticas.
- Prueba automatizada de tabulación más revisión manual de entrada y salida del iframe de ClickUp. El iframe se registra en `EXCEPTIONS.md` (dueño, aprobador, seguimiento, vencimiento) con el enlace de respaldo como mitigación.
- `REPORT.md` queda como self-reported (limita a CONDITIONAL según A11Y.md). Checklist de VoiceOver en Safari para que lo corran Camila o Juan antes del evento.

### Claude's Discretion
Estructura de los scripts de auditoría, redacción exacta de title y meta (dentro de los límites), composición de la imagen OG, formato de las tablas en los documentos de accesibilidad. Reglas de proyecto que aplican: diseño (incluida la imagen OG) por `impeccable` y `design-taste-frontend`; todo el texto sale tal cual del doc de Ari (fuente de verdad, sin humanizar ni reescribir; si falta un texto se pide a Ari, no se inventa); A11Y.md estricto.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- Ninguno todavía. Las fases 1 y 2 aportan el sitio Astro, `PUBLIC_ENV`, `PUBLIC_SITE_URL`, el `BaseLayout`, las secciones y el bloque del formulario en `#agenda`.

### Established Patterns
- Astro 7 estático sin islas, `<head>` propio sin integraciones SEO, `@astrojs/sitemap` cuando exista `site`, JSON-LD con `<script is:inline type="application/ld+json" set:html>`, scripts mínimos en el componente (decisiones de STACK.md y fase 1).

### Integration Points
- `BaseLayout.astro` para title, meta, canonical, OG y JSON-LD.
- Botones CTA y el bloque `#agenda` para los eventos de `dataLayer` y el paso de UTM al iframe.
- Herramientas dev: `@axe-core/playwright`, `@playwright/test`, `lighthouse` (versiones fijadas en STACK.md).

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. Decisiones externas abiertas: ID de GA4, banner de consentimiento, campos ocultos UTM en el formulario de ClickUp, datos de dirección y teléfono para schema.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

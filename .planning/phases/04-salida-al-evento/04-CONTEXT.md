# Phase 4: Salida al evento - Context

**Gathered:** 2026-09-18
**Status:** Ready for planning

<domain>
## Phase Boundary

La landing publicada por HTTPS en una URL pública (`loopsgrowth.com` o un subdominio gratuito) con `PUBLIC_ENV=production`, un QR estático impreso que abre la landing con los UTM del evento en iPhone y Android, un QR de contingencia que abre directo el formulario de ClickUp, y una vista previa correcta al compartir por WhatsApp y LinkedIn. Se planifica ahora y se ejecuta antes del evento, cuando estén resueltas las decisiones externas (dominio y aprobación de Ari sobre las afirmaciones `pending`). No bloquea la entrega local de las fases 1 a 3.

</domain>

<decisions>
## Implementation Decisions

### Publicación, dominio y URL del QR
- Se publica en Cloudflare Pages (gratis, uso comercial permitido, HTTPS y dominio propio sin costo), con el subdominio `.pages.dev` primero.
- Objetivo `loopsgrowth.com`. Si no está listo para el evento se usa el subdominio gratuito. No se compra ni se apunta un dominio sin aprobación de Ari.
- URL corta del QR: una ruta corta bajo el dominio publicado (por ejemplo `/evento`) que redirige a la landing con los UTM del evento. En `.pages.dev` se usa `_redirects`. Sin acortadores de terceros.
- El build de producción se bloquea hasta que Ari apruebe o se resuelvan las afirmaciones `pending` (COPY-02). Es una decisión externa registrada.

### QR, material y vista previa
- Los QR se generan en local con una librería (`qrcode`), en SVG y PNG de alta resolución, con corrección de errores nivel Q, sin servicios de terceros. Apuntan a la URL corta con los UTM del evento.
- Segundo QR de contingencia que abre directo el formulario de ClickUp, mismo formato, para imprimirlo más pequeño como respaldo.
- Se entregan los QR en SVG y PNG con una prueba de escaneo en iPhone y Android. Ari o su diseñador maquetan la pieza impresa; cualquier texto que haga falta sale del doc de Ari.
- La vista previa se verifica a mano en WhatsApp y con el depurador de LinkedIn (Post Inspector) sobre la URL final, más la comprobación de `og:*` y la imagen 1200x630 en el HTML servido.

### Claude's Discretion
Estructura de los scripts de generación de QR, nombres de archivos de salida, configuración exacta de Cloudflare Pages y del archivo `_redirects`. Reglas de proyecto que aplican: cualquier pieza de diseño web pasa por `impeccable` y `design-taste-frontend`; todo el texto sale tal cual del doc de Ari (fuente de verdad, sin humanizar ni reescribir; si falta un texto se pide a Ari, no se inventa); A11Y.md estricto.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- Ninguno todavía. Las fases 1 a 3 aportan el sitio Astro, `PUBLIC_ENV`, `PUBLIC_SITE_URL`, sitemap, robots, la imagen OG, el JSON-LD y el script `npm run audit`.

### Established Patterns
- Salida estática de Astro, se despliega en cualquier hosting de archivos; Cloudflare Pages corre `npm run build` y publica `dist/` (STACK.md). No usar Vercel Hobby (uso comercial prohibido).

### Integration Points
- `PUBLIC_SITE_URL` y `PUBLIC_ENV=production` en el entorno de build de Cloudflare Pages.
- Formulario de ClickUp `https://forms.clickup.com/90131720021/f/2ky49tun-19253/DATFKMESVSMXZY5CO5` para el QR de contingencia.

</code_context>

<specifics>
## Specific Ideas

Dependencias externas abiertas: dominio `loopsgrowth.com` (ubicar o comprar, decide Ari), aprobación de Ari sobre afirmaciones `pending`, y los UTM exactos del evento (`utm_source`, `utm_medium`, `utm_campaign`). Juan tiene un Dokploy propio (`sapling-vps-01`) como alternativa de hosting si se prefiere.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

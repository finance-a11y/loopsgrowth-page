# Phase 1: Fundaciones y formulario funcionando - Context

**Gathered:** 2026-09-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Sitio Astro 7 + Tailwind 4 corriendo en local (`npm run dev --host`, puerto 4321) con el formulario de ClickUp embebido en `#agenda`, probado con un envío real en móvil y escritorio. Incluye los fundamentos que protegen el resto del proyecto: tokens de marca con guarda de contraste, copy en `landing.es.yaml` con guarda de build, entornos con `noindex`, fuente de marca tras `--font-brand`, y la base de accesibilidad (foco, skip link, objetivos táctiles, `lang="es"`, contenido sin JS). Las secciones del Copy v2 y el estilo collage llegan en la fase 2.

</domain>

<decisions>
## Implementation Decisions

### Scaffold y contrato del copy
- Proyecto Astro en la raíz del repo. Se scaffoldea en una subcarpeta y se copia (`cp` con ocultos) sin pisar `.claude/CLAUDE.md` ni `.planning/`.
- `landing.es.yaml` organizado por secciones; cada afirmación es `{text, status}` con `status: verified | pending`, validado por esquema (Zod en content config o script propio).
- Fuente de respaldo Outfit vía Fonts API con `fontProviders.fontsource()`, detrás de `--font-brand`. Cambio a `fontProviders.local()` cuando llegue la licencia web de Hurme. Glifos `áéíóúüñ¿¡` verificados.
- Duración de llamada ("30 minutos") y término ("SEO/GEO") viven en un solo lugar del YAML, marcados `pending` hasta que Ari confirme.
- Textos `pending` (cambio de Juan, 2026-09-18): se listan en `PENDING-COPY.md` (generado con `npm run pending`, con clave, texto actual y quién confirma). En la página no hay placeholders vacíos ni etiquetas de borrador: donde falta el dato se muestra "FALTA CONFIRMAR". El relleno aplica solo donde falta el dato; lo que ya viene en el doc de Ari (H1 y subtítulo del hero, "30 minutos", "SEO/GEO", cuerpo del CTA final) se muestra tal cual y solo se lista si Ari debe confirmarlo. El build de producción sigue fallando con cualquier `pending` o "FALTA CONFIRMAR".

### Formulario embebido de ClickUp
- Iframe con `loading="lazy"`, `title` en español, `min-h` medido a 390 px y 1280 px, y script de ClickUp con `is:inline async`.
- Cada CTA es `href="#agenda"`; el `h2` de la sección lleva `tabindex="-1"` y un script mínimo mueve el foco al hacer clic. `scroll-behavior: smooth` solo dentro de `prefers-reduced-motion: no-preference`.
- Enlace de respaldo siempre visible más `noscript` con el mismo enlace, ambos `target="_blank" rel="noopener noreferrer"`.
- FORM-05: envío real de prueba en navegador real (Chrome) a 390 px y 1280 px; la tarea creada se marca como prueba y Juan la borra.

### Guardas de build y accesibilidad base
- `scripts/check-copy.mjs` corre en `prebuild` con `PUBLIC_ENV=production` y falla ante `[VERIFICAR]`, afirmaciones `pending`, voseo, em/en dash o "AEO".
- Tokens en `src/styles/tokens.css` (`@theme`) más `scripts/check-contrast.mjs` con los pares aprobados; rompe bajo 4.5:1 en texto y 3:1 en UI.
- `PUBLIC_ENV` distinto de `production` emite `<meta name="robots" content="noindex">`; `PUBLIC_SITE_URL` alimenta canonical, sitemap y robots.
- Foco `:focus-visible` de 2 px con contraste 3:1, skip link al `main`, `min-h-11 min-w-11` en CTAs y contenido visible sin JavaScript, desde esta fase.

### Claude's Discretion
Estructura interna de carpetas, nombres de componentes, esquema exacto del YAML, y detalles del script de foco. Reglas de proyecto que aplican: diseño web pasa por `impeccable` y `design-taste-frontend`; todo el texto sale tal cual del doc de Ari (fuente de verdad, sin humanizar ni reescribir; si falta un texto se pide a Ari, no se inventa); A11Y.md estricto.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- Ninguno: repo greenfield (solo `.planning/` y `.claude/CLAUDE.md`).

### Established Patterns
- Sin código previo. Seguir `.planning/research/STACK.md` (versiones fijadas, Fonts API, Tailwind por `@tailwindcss/vite`, sin islas, sin `ClientRouter`).

### Integration Points
- Formulario de ClickUp: `https://forms.clickup.com/90131720021/f/2ky49tun-19253/DATFKMESVSMXZY5CO5` con script `https://app-cdn.clickup.com/assets/js/forms-embed/v1.js`.
- Scaffold: `npm create astro@latest` no acepta `.` con `--yes`; crear en subcarpeta y copiar. La plantilla trae `AGENTS.md` y `CLAUDE.md`; no sobrescribir el `CLAUDE.md` propio.

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches, siguiendo la investigación de stack. Bloqueos externos abiertos: Ari confirma duración de llamada y terminología; el formulario se verifica en la práctica (idioma, campos ocultos UTM, auto-resize, plan de ClickUp).

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

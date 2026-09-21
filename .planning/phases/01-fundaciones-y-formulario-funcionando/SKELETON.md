# Walking Skeleton: Loops Growth Landing

**Phase:** 1
**Generated:** 2026-09-18

## Capability Proven End-to-End

Un visitante abre el sitio local (`http://localhost:4321` o la IP de la red local con `--host`), hace clic en "Agenda tu llamada de 30 minutos", baja a `#agenda`, ve el formulario real de ClickUp embebido, lo envía y la solicitud llega como tarea a la Lista de ClickUp de Ari. Todo el texto de esa ruta sale de `landing.es.yaml` a través del esquema, y los textos que Ari debe confirmar se muestran igual y quedan listados en `PENDING-COPY.md`.

## Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Astro 7.3.3, salida `static`, sin islas, sin `ClientRouter` | Cero JS por defecto, HTML 100 % controlado, Fonts API y sitemap oficial. Confirmado con un build real en `.planning/research/STACK.md` (4.55 vs 3.75 de Next y 3.15 de WordPress) |
| Styling | Tailwind CSS 4.3.3 por `@tailwindcss/vite`; tokens en `src/styles/tokens.css` con `@theme` y variables semánticas por `data-tone` | Un solo lugar para marca y contraste; variantes `motion-safe:` para la regla de movimiento reducido |
| Content layer | `src/content/landing.es.yaml` + colección de contenido con esquema Zod (`{text, status}`, `status: verified \| pending`, más `confirm_by` y `reason` opcionales como metadatos que no se renderizan). Los textos `pending` se muestran tal cual y se listan en `PENDING-COPY.md` (raíz, generado con `npm run pending`); donde falta un dato el texto visible es `FALTA CONFIRMAR` | Un error de copy rompe el build en vez de publicarse. Ari edita un solo archivo y ve en `PENDING-COPY.md` qué debe confirmar. Ningún placeholder vacío ni contenido oculto |
| Data layer | No hay base de datos. El sistema de registro es la Lista de ClickUp, alimentada por el iframe del formulario | Landing estática de una ruta. La "escritura real" del esqueleto es el envío del formulario (FORM-05) |
| Auth | No aplica | Sitio público sin cuentas |
| Third-party runtime | Solo `forms.clickup.com` (iframe) y `app-cdn.clickup.com` (script `forms-embed/v1.js`, `is:inline async`) | Ninguna otra petición externa en tiempo de ejecución: fuentes autoalojadas por la Fonts API, sin analítica en esta fase |
| Fonts | Outfit vía `fontProviders.fontsource()` tras `--font-brand` (pesos 400, 600 y 700: Regular, SemiBold y Bold del brandbook; subsets latin y latin-ext) | Respaldo hasta tener licencia web de Hurme; el cambio a `fontProviders.local()` no toca componentes |
| Environment surface | `PUBLIC_ENV` (`local`, `preview`, `production`) y `PUBLIC_SITE_URL`. Solo `production` exacto indexa; todo lo demás emite `noindex` | Evita el autogol de indexar un entorno de trabajo; el dominio final se cambia con una variable |
| Build guards | `prebuild` corre `scripts/check-contrast.mjs` y `scripts/check-copy.mjs`; `postbuild` corre `scripts/check-copy.mjs --dist dist`. La guarda de copy solo bloquea con `PUBLIC_ENV=production` (falla ante cualquier `pending` y ante `FALTA CONFIRMAR` en el YAML o en `dist`, además de `[VERIFICAR]`, voseo, guion largo y AEO) | Protegen contraste y copy desde el día uno, antes de que existan las secciones; el escaneo de `dist` va en `postbuild` porque en `prebuild` `dist` es el de la corrida anterior |
| Test tooling | `node --test` para las guardas; `@playwright/test` (Chromium) contra `astro preview` en el puerto 4322 | Verifica foco, desbordes, sin JS y medición del iframe; se reutiliza en la Fase 3 con axe |
| Deployment target | Servidor de desarrollo local: `npm run dev` (localhost:4321) y `npm run dev:lan` (`--host`) para que Ari y Camila lo abran desde su red | Sin hosting aún. Producción (Cloudflare Pages recomendado en STACK.md) es de la Fase 4 |
| Directory layout | `src/{layouts,components,content,lib,scripts,styles,pages}`, `scripts/` (Node de build/QA, incluido `list-pending.mjs`), `tests/{guards,e2e}`, `PENDING-COPY.md` (raíz), `docs/a11y/` (Fase 3) | Una sección, un archivo; ningún texto fuera del YAML |

## Stack Touched in Phase 1

- [x] Project scaffold (Astro 7, Tailwind 4, lint de contraste y copy, runner de pruebas): Plan 01 y Plan 02
- [x] Routing: una ruta real (`/`) más `robots.txt` por entorno: Plan 01
- [x] Data: no hay base de datos. Una lectura real (YAML a través del esquema) y una escritura real (envío del formulario de ClickUp, FORM-05): Plan 01 y Plan 04
- [x] UI: un elemento interactivo real (CTA que baja a `#agenda` y mueve el foco al encabezado) y el iframe del formulario: Plan 01 y Plan 03
- [x] Deployment: comando local documentado y verificado que sirve el sitio completo en la red local: `npm run dev -- --host` (Plan 01)

## Out of Scope (Deferred to Later Slices)

- Las secciones del Copy v2, el collage pop, el logo e isotipo en SVG y el footer (Fase 2).
- `<title>`, meta description, Open Graph, JSON-LD, sitemap validado, eventos `dataLayer`, paso de UTM al iframe, axe, Lighthouse y `docs/a11y/*` (Fase 3).
- Dominio, HTTPS, QR con UTM y vista previa social (Fase 4).
- Barra CTA fija en móvil, formulario propio conectado a la API de ClickUp, versión en inglés y CMS (v2 en REQUIREMENTS.md).
- Sin mensaje temporizado de "el formulario tarda en cargar": el enlace de respaldo permanente cubre la falla (el evento `load` del iframe no detecta errores).

## Subsequent Slice Plan

Cada fase posterior agrega un slice vertical sobre este esqueleto sin alterar sus decisiones de arquitectura:

- Phase 2: el visitante entiende qué hace Loops Growth y por qué confiar (13 secciones del Copy v2 con estilo collage pop, logo SVG y copy verbatim de Ari).
- Phase 3: el visitante abre la página desde buscadores, redes o QR en cualquier dispositivo y la página demuestra su propio SEO, accesibilidad y rendimiento con datos.
- Phase 4: un asistente al evento escanea un QR y abre la landing pública por HTTPS.

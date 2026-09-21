# Research Summary: Loops Growth Landing

**Project:** Loops Growth Landing
**Domain:** Landing B2B de captación de leads para agencia SEO/GEO (una página, solo español, formulario de ClickUp por iframe)
**Researched:** 2026-09-18
**Confidence:** MEDIUM-HIGH

## Executive Summary

**Veredicto de stack: Astro queda confirmado.** La hipótesis de Juan era el framework Astro, no el tema Astra de WordPress, y la investigación la respalda con datos verificados en un proyecto de prueba real. Astro 7.3.3 con Tailwind CSS 4.3.3 y salida estática puntúa 4.55 de 5 en la matriz ponderada, frente a 4.35 de Vite con HTML plano, 3.75 de Next.js, 3.15 de WordPress + Astra + Elementor y 3.10 tanto de Webflow como de Framer. Aunque el peso de la edición por personas no técnicas subiera de 10% a 30%, Astro seguiría primero. WordPress + Astra queda solo como plan B, y solo se activa si el equipo SEO exige editar visualmente desde el día uno. Su costo es real: Elementor genera el DOM (choca con A11Y.md), exige Elementor Pro para fuentes propias, requiere hosting PHP/MySQL y el estado vive en la base de datos, no en Git. Además, para "corriendo en local hoy" es un riesgo de calendario: PHP, LocalWP y WP-CLI no están instalados, y llegar a la primera sección visible toma de 1 a 2 horas, contra unos 10 minutos en Astro.

Loops Growth necesita una landing de una sola ruta cuyo único objetivo es llevar al visitante al formulario de ClickUp embebido, a un scroll de distancia. Las tres referencias (m8l, skale, rankingonai) convergen en el mismo patrón: promesa clara en el H1, prueba concreta cerca del CTA, un solo CTA repetido con el mismo destino, proceso corto y FAQ. Sin logos ni fotos, la prueba social se apoya en tarjetas de métrica con contexto (sector, plazo, canal), equipo ilustrado, transparencia de proceso y, como diferenciador natural de una agencia SEO/GEO, la propia página como demostración técnica. La pre-calificación de clientes de USD 200k o más se hace por autoselección ("para quién es / para quién no"), porque el iframe no se puede modificar desde el frontend.

El enfoque recomendado es Astro estático con el copy en un único YAML validado (Zod), secciones como componentes puros, tokens de marca en tres niveles, cero islas de framework y JavaScript mínimo solo para foco, carga diferida del iframe y medición. Los riesgos principales, en orden de impacto: (1) el día del evento, porque sin dominio no hay URL pública y el QR es la ruta crítica; (2) la conversión no es medible desde la página, porque el iframe de ClickUp no emite evento de envío y el redirect no funciona embebido, así que la fuente de verdad es el conteo de tareas en ClickUp más UTM en el QR; (3) contrastes de marca que fallan (blanco sobre naranja 2.89, morado sobre gris oscuro 1.66); (4) cifras `[VERIFICAR]` y casos sin sustento que no deben llegar a producción; (5) la fuente Hurme Geometric Sans 3 sin licencia web confirmada, que se resuelve con Outfit detrás de una sola variable CSS.

## Key Findings

### Recommended Stack

Astro 7.3.3 + Tailwind CSS 4.3.3 (plugin `@tailwindcss/vite`), `output: "static"`, sin islas ni `ClientRouter` en la v1. Verificado con build real: 0 archivos `.js` propios, un CSS de 4.3 KB, iframe de ClickUp con `script is:inline async` compilando sin errores. Requiere Node >=22.12 (solo versiones pares); el 24.13.0 instalado sirve. Nota de consistencia: ARCHITECTURE.md menciona "Astro 6" en algunos comentarios; prevalece Astro 7.3.3, verificado con `npm view` y build. La API de content collections con `file()` y `astro/zod` debe confirmarse en el primer `astro dev`.

**Core technologies:**
- Astro 7.3.3: framework estático, plantillas `.astro`, Fonts API, `astro:assets`. Cero JS por defecto y HTML 100% controlado.
- Tailwind CSS 4.3.3 con `@tailwindcss/vite`: tokens de marca con `@theme`, variantes `motion-safe:`. No usar `@astrojs/tailwind` (obsoleto para v4).
- Fonts API con Outfit (`fontProviders.fontsource()`) hoy y `fontProviders.local()` para Hurme cuando exista licencia web. Todo el sitio consume `--font-brand`.
- `@astrojs/sitemap` 3.7.4 solo cuando exista el dominio; SEO del `<head>` en un `BaseLayout` propio (sin astro-seo).
- Calidad: `@axe-core/playwright` 4.13.0, `@playwright/test` 1.63.0, `lighthouse` 13.5.0. Si se usa `astro check`, fijar `typescript@^6` (no 7.0.2).
- Hosting posterior: Cloudflare Pages. No usar Vercel Hobby (prohíbe uso comercial).

### Expected Features

**Must have (table stakes):**
- H1 en texto real con categoría, público y resultado; subtítulo anclado al resultado de negocio (ventas, no ranking).
- CTA "Agenda tu llamada de 30 minutos" (o 20, ver preguntas) repetido en nav, hero y secciones, siempre `<a href="#agenda">`; header con CTA persistente y skip link.
- Formulario de ClickUp inline en `#agenda` con `title`, altura reservada, enlace de respaldo visible y `noscript`.
- Problema (3 dolores), Por qué ahora, Solución en 4 pilares, Qué incluye, Cómo funciona (3 a 4 pasos alineados al embudo).
- Resultados y casos como tarjetas de métrica sin logos (sector anonimizado, plazo, canal), con el caso Meta Ads en su propia tarjeta.
- Bloque "Para quién es / para quién no", equipo con 4 avatares ilustrados, FAQ de 5 a 6 preguntas, footer mínimo (contacto, redes, privacidad).
- HTML semántico, title y meta propios, OG 1200x630, JSON-LD, sitemap y robots, responsive desde 320/400 px, contrastes verificados, `prefers-reduced-motion`, objetivos de 44 px.

**Should have (competitive):**
- "Bajo el capó": puntajes reales de Lighthouse, schema y renderizado en servidor, solo con cifras medidas.
- Estilo collage pop con función (la lupa resalta la cifra, los ojos guían al CTA), estático por defecto.
- Microcopy de expectativa junto al iframe (quién atiende, cuándo, cuánto dura).
- Franja de métricas agregadas (solo si Ari confirma cifras) y reglas de robots.txt para bots de IA.

**Defer (v2+):**
- Barra CTA fija en móvil, JSON-LD `Person` y `FAQPage`, `llms.txt`, ojos que siguen el puntero, testimonios y logos autorizados, analítica con UTM en dominio publicado, formulario propio vía API de ClickUp, blog y About completo, versión en inglés.

**Anti-features firmes:** logos o testimonios inventados, carruseles y marquee con auto-avance, pop-ups y chat, video de fondo, texto dentro de imágenes, `Review`/`AggregateRating`, tabla de precios, cifras sin verificar.

### Architecture Approach

Sitio estático de una ruta con capas: shell (layout, SEO, skip link), 10 secciones puras sin estado, mejoras progresivas mínimas (foco a `#agenda`, carga diferida del iframe, paso de UTM, tracking inerte sin ID) y una capa transversal de build que deriva SEO y JSON-LD del mismo contenido. El lead vive solo en ClickUp; la página nunca recibe datos del envío.

**Major components:**
1. Content source (`landing.es.yaml` + Zod + `lint-copy`): un único archivo editable; las afirmaciones llevan `status: verified | pending` y el build de producción falla si queda alguna pendiente, o si hay voseo, guiones largos o "AEO".
2. Tokens (`tokens.css`, tres niveles) y `check-contrast`: pares aprobados de texto y fondo; los componentes solo consumen tokens semánticos.
3. Shell y UI (`Base`, `Header`, `SectionShell`, `CtaButton`, `Card`, `MetricCard`): el CTA existe en un solo componente.
4. `ClickUpFormEmbed` en `#agenda`: única instancia del iframe, fallback de 3 capas, foco gestionado al `h2`, `overflow` corregido.
5. SEO layer (`BaseHead`, `jsonld.ts`, `robots.txt.ts`) dirigida por `PUBLIC_SITE_URL` y `PUBLIC_ENV`; `noindex` salvo producción.
6. Tracker (`data-*` más `dataLayer`, opcional): `cta_click` y `form_view`; `generate_lead` solo con señal fiable.

### Critical Pitfalls

1. **Día del evento sin URL pública ni QR fiable.** Decidir dominio y hosting ya (plan B: subdominio gratuito con `noindex`). QR estático que apunte a una URL corta bajo dominio propio, nunca QR dinámico de SaaS con trial. QR de contingencia directo al formulario de ClickUp y smoke test del envío el día anterior.
2. **Conversión ciega por el iframe.** Definir la métrica con lo que existe: clics en CTAs, iframe visible y conteo de tareas en ClickUp cruzado con UTM del QR (`?utm_source=evento&utm_medium=qr`). No prometer seguimiento de envío ni esperar redirect a `/gracias`.
3. **Contraste de marca.** CTA con texto `#212121` sobre naranja (5.56) o amarillo (10.22); naranja como texto solo sobre oscuro; morado no va sobre gris oscuro; foco de 3 px por superficie. Tabla de pares aprobados antes de maquetar.
4. **Claims sin sustento y `[VERIFICAR]` en producción.** Ficha de evidencia por cifra, gate de build que rompe si aparece `VERIFICAR`, sin "garantizamos" y sin schema `Review`. La aprobación de Ari es dependencia externa.
5. **Iframe: altura, título, bloqueos e idioma.** `title` en español, `min-height` medido en 390 y 1280 px, `src` exacto de `forms.clickup.com`, enlace de respaldo y pruebas en Safari, Firefox estricto, Brave y navegador in-app. El formulario declara `lang="en-US"`: revisar el idioma real que ve un hispanohablante.
6. **Fuente sin licencia web.** La licencia de escritorio no cubre la web. Outfit detrás de `--font-brand` hasta confirmar licencia, jamás fuentes de sitios de descarga gratuita, y probar `áéíóúüñ¿¡`.
7. **Collage y animación contra Core Web Vitals.** SVG o AVIF, hero con texto visible por defecto, movimiento solo en `no-preference`, sin carruseles ni scroll-jacking.

## Implications for Roadmap

Restricción dominante: el sitio completo debe correr en local HOY. Las cinco fases de la investigación de pitfalls (Fundaciones, Construcción, Formulario y conversión, QA, Salida al evento) se fusionan en 4 fases gruesas. Las tres primeras caben en la jornada de hoy; la cuarta se planifica ahora pero se ejecuta antes del evento, porque depende de decisiones externas (dominio, licencia).

### Phase 1: Fundaciones y formulario funcionando
**Rationale:** El Core Value es que el formulario funcione y esté a un scroll de distancia. Construirlo en la primera hora deja el embudo real (landing a ClickUp) operativo desde el inicio, y todo lo demás es diseño sobre una base que ya cumple. Tokens y contraste van antes de cualquier componente para no rehacer botones y tarjetas. Fusiona F1 y F3.
**Delivers:** Scaffold Astro 7 + Tailwind 4 en `localhost:4321` (y en red local con `--host`); `landing.es.yaml` con el Copy v2 y esquema Zod; `lint-copy` y `check-contrast`; `tokens.css` con pares aprobados; Outfit detrás de `--font-brand`; `Base`, Header con CTA, Footer, `SectionShell`, `CtaButton`; `ClickUpFormEmbed` en `#agenda` con `title`, `min-height` medido, enlace de respaldo, `noscript`, foco y `scroll-margin-top`; skip link; política de entornos (`PUBLIC_SITE_URL`, `PUBLIC_ENV`, `noindex` por defecto).
**Addresses:** Formulario inline, CTA único, fallback, HTML semántico, tokens de contraste, skip link y foco.
**Avoids:** Pitfalls de altura y título del iframe, contraste, fallback de fuente, `noindex` heredado y alcance de un día. Nota práctica: se scaffoldea en una subcarpeta y se copia, porque `npm create astro` con `.` y `--yes` no usa la carpeta actual.

### Phase 2: Secciones, marca y copy
**Rationale:** Con el embudo vivo, se construyen las secciones desde el YAML, con el hero primero (es el LCP y decide la primera impresión). El pulido de collage y responsive pasa por las skills `impeccable` y `design-taste-frontend`, y todo texto por `humanizer`. Fusiona F2.
**Delivers:** Las 9 secciones restantes más "Para quién es", FAQ y equipo ilustrado; tarjetas de métrica sin logos (caso Meta Ads separado); collage (lupas, ojos, clics) en SVG inline decorativo; isotipo y logo en SVG; sombras pop; revisión a 320, 400, 768 y 1280 px; movimiento reducido por defecto; URL de red local para que Ari y Camila validen.
**Uses:** `astro:assets` (`alt` obligatorio), Fonts API, `motion-safe:`, `<details>` nativo para el FAQ.
**Avoids:** Claims sin sustento (afirmaciones con `status: pending`), collage contra CWV, inconsistencias de español neutro, equipo sin consentimiento y referencias copiadas sin filtrar.

### Phase 3: SEO, medición mínima y QA
**Rationale:** SEO y tracking dependen solo del contenido y del layout, por eso van tras las secciones y antes de dar el sitio por listo. Una agencia SEO con CWV o accesibilidad débiles se desmiente sola, así que la QA es un gate y no una nota. Fusiona la medición de F3 con F4.
**Delivers:** `BaseHead` (title, meta, canonical, OG absoluto 1200x630); JSON-LD `Organization`/`ProfessionalService`/`WebSite`/`WebPage`; sitemap, robots y favicon; `cta_click` y `form_view` inertes sin ID de GA y UTM pasado al iframe (si Ari crea los campos ocultos); axe con Playwright, recorrido con teclado (incluida entrada y salida del iframe), zoom 200% y reflow a 320 px, `prefers-reduced-motion`, Lighthouse móvil (95+ y accesibilidad 100) y presupuesto de peso; `docs/a11y/` con `REPORT.md`, `EXCEPTIONS.md` (iframe de ClickUp) y `A11Y-DECISIONS.md`; envío real de prueba con confirmación visible en móvil; gate de `[VERIFICAR]`, voseo y guiones largos.
**Addresses:** Metadatos, JSON-LD, rendimiento y "Bajo el capó" (si hay números medidos).
**Avoids:** Iframe sin verificar en dispositivos, métrica de conversión sin definir, accesibilidad reducida a "pasa axe" y falta de enlace a política de privacidad. Cortes si falta tiempo: primero `llms.txt` y la heurística de envío por altura del iframe.

### Phase 4: Salida al evento (dominio, deploy, QR y contingencias)
**Rationale:** Fuera del alcance de hoy, pero es la ruta crítica del evento y debe entrar al roadmap como hito propio, con la decisión de dominio tomada en la Fase 1. Fusiona F5.
**Delivers:** Dominio o subdominio gratuito con HTTPS; deploy estático (Cloudflare Pages) con `PUBLIC_ENV=production`; checklist SEO sobre la URL final (`curl -sI` sin `noindex`, canonical, `og:url`, sitemap, un H1); QR estático oscuro sobre claro con UTM y URL corta propia, probado impreso en iPhone y Android; QR de contingencia al formulario de ClickUp; vista previa social probada por WhatsApp y LinkedIn; prueba en Slow 4G; envíos de prueba borrados, notificaciones y responsables de lead asignados; copy congelado 48 horas antes.
**Avoids:** Falta de URL pública, autogoles SEO en la URL final y validación tardía de Ari y Camila.

### Phase Ordering Rationale

- Contenido y tokens son la base de todo; el formulario se construye primero porque es el Core Value; SEO y tracking solo leen contenido y layout, por eso van después.
- Las fases 1 a 3 siguen el orden de construcción de ARCHITECTURE.md y el mapa de pitfalls; la Fase 4 aísla lo que depende de decisiones externas para que no bloquee la entrega local.
- Orden por riesgo dentro de la jornada de hoy: formulario funcionando, hero legible y rápido, resto de secciones, QA. Lo primero que se recorta es lo opcional, nunca la QA de accesibilidad.
- No negociables transversales: contraste medido, `title` del iframe, `noindex` por entorno, gate de `[VERIFICAR]` y QR estático.

### Research Flags

Fases que probablemente necesiten `/gsd-plan-phase --research-phase <N>`:
- **Fase 1 (parcial):** el embed de ClickUp requiere verificación práctica: si admite campos ocultos o prefill por parámetro para UTM, el idioma real que ve un hispanohablante, si `loading="lazy"` es compatible con el auto-resize, y el plan de ClickUp de Ari (límites de formularios, notificaciones, webhooks).
- **Fase 2 (parcial):** la validez de las afirmaciones por país necesita criterio de alguien con contexto local (solo se verificó el principio general de la FTC), y el parecido visual de Outfit frente a Hurme debe aprobarlo Ari o el diseñador.
- **Fase 4:** patrón estándar con stack estático, pero depende de la resolución del dominio; verificar precios y límites vigentes de Cloudflare Pages.

Fases con patrones estándar (omitir research-phase):
- **Fase 1 (scaffold, tokens, shell):** patrones de Astro bien documentados y ya verificados con build real.
- **Fase 3:** axe, Lighthouse, Playwright, JSON-LD y sitemap son procedimientos estándar.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Versiones verificadas con `npm view`, Context7 y un build real. Los puntajes de la matriz son juicio propio (MEDIUM). La equivalencia visual de Outfit frente a Hurme es LOW. |
| Features | MEDIUM | Estructura y copy de las referencias extraídos con WebFetch sin ver el render; el movimiento es inferido (LOW). Contrastes y reglas de A11Y.md son HIGH. |
| Architecture | HIGH en estructura, MEDIUM en detalles | Cabeceras, script de embed y contraste verificados directamente. Tracking server-side, `file()` loader de YAML y licencia de fuente son MEDIUM o LOW. |
| Pitfalls | MEDIUM-HIGH | Mediciones directas (cabeceras de ClickUp, script, contraste) son HIGH. Legal por país, navegadores in-app, cookies de terceros y tolerancias del QR son MEDIUM o LOW. |

**Overall confidence:** MEDIUM-HIGH. La decisión de stack y la arquitectura están bien respaldadas; la incertidumbre restante está en decisiones de Ari y en comportamientos de ClickUp que solo se resuelven probando.

### Gaps to Address

- **Licencia web de Hurme Geometric Sans 3:** no se sabe si Eleven la entregó ni si incluye web; no se leyó el precio ni se confirmó cobertura de `ñ` y `¿`. Manejo: Outfit temporal aprobado por escrito por Ari; revisar el Drive del brandbook; si no existe, comprar licencia web (tramo de 50,000 páginas vistas al mes) a nombre de la agencia y verificar glifos con el archivo real antes de pagar.
- **Comportamiento real del formulario de ClickUp:** idioma de etiquetas y mensajes, campos ocultos para UTM, auto-resize con carga diferida, comportamiento en Safari, Firefox estricto y navegadores in-app. Manejo: prueba manual con envío real en la Fase 1 y matriz de dispositivos en la Fase 3.
- **Medición de envíos:** no existe evento nativo. Manejo: conteo de tareas en ClickUp más UTM del QR; heurística por altura solo como spike opcional; `generate_lead` server-side solo si el plan permite webhooks (no verificado).
- **Cifras y casos:** los dos `[VERIFICAR]` (30% a 50% menos de presupuesto de ads y split Google vs IA) y cada caso necesitan ficha de evidencia. Manejo: nacen `pending` y bloquean el build de producción.
- **Neutrales y activos de marca:** el brandbook solo define cuatro colores; faltan fondos claros y gris secundario aprobados, y el logo e isotipo en SVG (el Drive lista PNG/JPG y `.ai`). Manejo: derivar y validar con `check-contrast`, sin inventar un crema "de marca"; convertir el `.ai`.
- **Legal y privacidad:** jurisdicción del público y política de privacidad sin confirmar; consentimiento si hay GA4 y tráfico de la UE. Manejo: enlace a política breve en el footer y decisión de Ari.
- **Precios de terceros** (Elementor Pro, hosting, suscripciones): cifras LOW a MEDIUM. Manejo: verificar antes de decidir presupuesto; solo relevante si se activa el plan B.

### Preguntas abiertas consolidadas para Ari

1. **Duración de la llamada:** 20 minutos (embudo) o 30 (copy). Define el texto del CTA y se cambia en un solo lugar (`cta.duracion_minutos`). El formulario de ClickUp debe decir lo mismo.
2. **Terminología:** "SEO/GEO" o "SEO y AEO". El sitio usará solo una; por defecto SEO/GEO.
3. **Cifras `[VERIFICAR]`:** ¿se puede respaldar "30% a 50% menos de presupuesto de ads" y el split Google vs IA? Si no hay fuente, se suavizan o se retiran.
4. **Casos de éxito:** ¿cada uno se puede mostrar con sector anonimizado? ¿Hay línea base, período y permiso? ¿El caso de Meta Ads (marca personal) encaja en una landing de SEO/GEO?
5. **Piso de facturación:** ¿se publica "desde USD 200k al año"? Recomendado: sí. ¿Y el piso de inversión (+1.5k al mes)? Recomendado: no en v1.
6. **Formulario de ClickUp:** ¿ya pregunta facturación anual e inversión mensual? ¿Puede Ari crear campos ocultos `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`? ¿Qué idioma ve el visitante? ¿Quién recibe la notificación de cada envío?
7. **Dominio:** ¿`loopsgrowth.com` u otro, y quién lo compra o configura antes del evento? Sin URL pública no hay QR. ¿Se acepta un subdominio gratuito como plan B?
8. **Licencia de la fuente:** ¿quién tiene la licencia web de Hurme Geometric Sans 3? Mientras tanto, ¿aprueba Outfit como sustituta visual?
9. **Métricas agregadas:** ¿existen cifras defendibles (años, proyectos, tráfico gestionado) para una franja de números?
10. **Footer y privacidad:** ¿hay política de privacidad, correo de contacto y perfiles de redes confirmados? ¿Cuál es el país o jurisdicción del público?
11. **Canal alternativo:** si el formulario no carga, ¿correo o WhatsApp como respaldo?
12. **Equipo:** ¿Arianna Lupi, Verónica Romero, Juan Angulo y Miguel Pacheco aceptan aparecer con nombre y cargo? ¿Qué credencial verdadera lleva cada uno?
13. **Analítica:** ¿ID de GA4 y consentimiento, o sin analítica en v1 (solo UTM y conteo en ClickUp)?
14. **Edición futura:** ¿editar el YAML (o un CMS sobre Git más adelante) es suficiente, o el equipo exige edición visual desde el día uno? Solo en el segundo caso se activa el plan B con WordPress.

## Sources

### Primary (HIGH confidence)
- Context7 `/withastro/docs`: instalación, requisito de Node, Fonts API, `astro:assets`, sitemap, islas, Dev Toolbar, View Transitions.
- Context7 `/websites/tailwindcss`: integración con Astro por `@tailwindcss/vite`, `@theme`.
- Context7 `/vercel/next.js/v16.2.9`: `output: 'export'` y bundle base del App Router.
- npm registry (`npm view`, 2026-09-18) y API de WordPress.org: versiones de todos los paquetes citados.
- Proyecto de prueba en directorio temporal: build y servidor de desarrollo reales (0 JS, fuentes con preload y fallback ajustado, sitemap, iframe con `is:inline`).
- Mediciones directas del formulario de ClickUp (`curl -I`, script `forms-embed/v1.js`, bundle del formulario): sin `X-Frame-Options`, `x-robots-tag: noindex`, iframe-resizer 4.2.8, sin evento de envío.
- Cálculo de contraste con la fórmula de luminancia relativa de WCAG sobre los hex del brandbook.
- A11Y.md (fecarrico): https://github.com/fecarrico/A11Y.md/blob/main/docs/en/A11Y.md
- Google Search Central, marcado de FAQ: resultado enriquecido de FAQ retirado desde el 7 de mayo de 2026.

### Secondary (MEDIUM confidence)
- Hurme Design, MyFonts y Typewolf: licencias de escritorio y web separadas, autoalojamiento obligatorio.
- ClickUp Help y ClickUp Feedback: autosize del embed, redirect que no funciona embebido (72 votos), campos ocultos por parámetro de URL.
- m8l.com, skale.so y rankingonai.com: estructura y copy extraídos con WebFetch (sin render).
- WordPress Core, Local Live Links, guías de search-replace y Elementor (DOM): trampas de WordPress.
- FTC 16 CFR Parte 255: principio de sustanciación (solo EE. UU.).
- Documentación de generadores de QR: desactivación de códigos dinámicos al vencer el trial.
- Chrome for Developers: ajuste de métricas de la fuente de respaldo.

### Tertiary (LOW confidence)
- Reseñas de terceros sobre Astra, Webflow, Framer, Elementor Pro, LocalWP, Cloudflare Pages y política de Vercel Hobby: verificar precios vigentes.
- Blogs de proveedores sobre buenas prácticas de landing B2B, prueba social sin logos, schema para GEO y `llms.txt`: verificar antes de afirmar.
- Comportamiento en navegadores in-app, cookies de terceros por navegador, tolerancias de impresión del QR y peso de `og:image` para WhatsApp: validar con pruebas reales.

---
*Research completed: 2026-09-18*
*Ready for roadmap: yes*

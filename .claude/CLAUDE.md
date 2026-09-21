<!-- GSD:project-start source:PROJECT.md -->

## Project

**Loops Growth Landing**

Landing page de captación de clientes para Loops Growth, agencia de SEO/GEO (Google, ChatGPT, Gemini) para e-commerce y negocios con presupuesto de marketing serio. La página lleva al visitante a llenar el formulario de ClickUp (paso 2 del embudo) para agendar una llamada de pre-calificación. Ari la usará como herramienta de captación en un evento la próxima semana. Se construye primero como sitio local para validación de Ari y Camila.

**Core Value:** Un visitante entiende en segundos qué hace Loops Growth y llena el formulario de ClickUp. Si todo lo demás falla, el form embebido tiene que funcionar y estar a un scroll de distancia.

### Constraints

- **Timeline**: Sitio local completo hoy — evento la próxima semana, Ari y Camila necesitan validar antes.
- **Tech stack**: Elegido por investigación. Hipótesis de Juan: Astro (framework, no el tema Astra de WordPress). Se contrasta con WordPress+Astra, Next.js, Vite HTML y Webflow/Framer según velocidad, performance, control de diseño y mantenimiento por el equipo.
- **Accesibilidad**: A11Y.md obligatorio en todo el frontend — https://github.com/fecarrico/A11Y.md/blob/main/docs/en/A11Y.md
- **Marca**: Colores, tipografía y logo del brandbook sin desviarse; pixel-perfect.
- **Performance/SEO**: La página promete SEO técnico; ella misma debe tener Core Web Vitals sólidos y HTML semántico.
- **Contenido**: El copy viene de Ari; todos los textos ya están en el doc de Ari (https://docs.google.com/document/d/1QK61DPEQ3UbBQcCBnepwoaBesyZE1ZvZ6VfLgPrgtI0/edit?tab=t.nvl47nvdgyma); no se humaniza ni se reescribe nada (cambio de Juan, 2026-09-18). Si falta un texto, se pide a Ari.
- **Skills obligatorias (regla de Juan)**: Todo trabajo de diseño web pasa por la skill `impeccable` y la taste skill (`design-taste-frontend`). El texto y copy viene del doc de Ari y no pasa por `humanizer`. Español neutro, nunca voseo (usar "tú", no "vos"/"tenés"/"agendá").

<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->

## Technology Stack

## Veredicto sobre la hipótesis de Juan

## Matriz comparativa con puntaje

| Criterio | Astro 7 + Tailwind 4 | WordPress + Astra + Elementor | Next.js 16 (static export) | Vite 8 + HTML/CSS/JS | Webflow | Framer |
|----------|:---:|:---:|:---:|:---:|:---:|:---:|
| Velocidad de entrega hoy (15%) | 4 | 3 | 3 | 4 | 2 | 2 |
| Performance / CWV (15%) | 5 | 3 | 3 | 5 | 3 | 3 |
| Control de diseño pixel-perfect (15%) | 5 | 3 | 5 | 5 | 4 | 4 |
| Control de accesibilidad (15%) | 5 | 2 | 4 | 5 | 3 | 3 |
| Control SEO (10%) | 5 | 4 | 4 | 4 | 4 | 3 |
| Facilidad en local (10%) | 5 | 4 | 5 | 5 | 1 | 1 |
| Edición futura por no devs (10%) | 2 | 5 | 2 | 1 | 5 | 5 |
| Hosting y costo (10%) | 5 | 2 | 4 | 5 | 3 | 4 |
| **Total ponderado** | **4.55** | **3.15** | **3.75** | **4.35** | **3.10** | **3.10** |

- **Astro velocidad 4, no 5:** hay que escribir las secciones en código. Con un agente de código es rápido, pero no es arrastrar bloques.
- **WordPress performance 3:** Astra base es liviano (52 KB, sin jQuery según su propio material, y 92/100 móvil en Lighthouse en su demo oficial, fuente de terceros, confianza MEDIUM). El problema es Elementor encima: más DOM, más CSS y JS. Se llega a buen puntaje con caché y optimización, pero es trabajo que Astro no exige.
- **WordPress a11y 2:** no se controla el DOM que produce Elementor, y A11Y.md exige evidencia (`REPORT.md`, axe sin críticos) sobre un HTML que uno no escribió.
- **WordPress SEO 4:** Rank Math (que Juan ya usa) es una fortaleza real, pero para una sola landing con schema Organization, Astro lo resuelve a mano con el mismo resultado.
- **WordPress hosting 2:** requiere PHP y MySQL, unos USD 10 a 30 al mes en hosting gestionado (estimación, LOW), más Elementor Pro (USD 59 al año el plan Essential, confianza MEDIUM) porque subir fuentes propias es función Pro, más mantenimiento de plugins y seguridad, más una migración de LocalWP a producción.
- **Next.js performance 3:** el bundle base del App Router incluye siempre el runtime de React y el router del cliente, incluso en páginas estáticas sin componentes de cliente (confirmado en el código fuente de Next, `app-next.ts`). Para una landing de una página es peso sin beneficio.
- **Vite 4.35 muy cerca de Astro:** para una sola página, HTML plano es legítimo y rapidísimo. Pierde porque no trae de fábrica el pipeline de fuentes con fallback ajustado, optimización de imágenes, sitemap ni layouts/componentes, y porque el blog futuro obligaría a migrar. Es la mejor alternativa "sin framework".
- **Webflow y Framer, local 1 y velocidad 2:** no corren en local (son editores en la nube; Webflow solo exporta código en planes de pago y sin CMS ni formularios nativos), y un agente de código no puede construir el diseño dentro de su interfaz visual. En Webflow, el elemento "Button" renderiza un `a href="#"` sin rol y no hay `fieldset` ni `legend` nativos (confianza MEDIUM, fuentes de terceros). Framer permite cambiar etiquetas semánticas, pero sus componentes nativos carecen de controles de accesibilidad.

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Astro | 7.3.3 | Framework estático, plantillas `.astro`, Fonts API, `astro:assets` | Cero JS por defecto, HTML 100% controlado, autoaloja fuentes con fallback ajustado, sitemap oficial. Requiere Node >=22.12.0 (versiones pares). Vite 8 incluido. Confianza HIGH (verificado con `npm view`, Context7 y un build real). |
| Tailwind CSS | 4.3.3 | Utilidades CSS y tokens de marca con `@theme` | Tokens de color y fuente en un solo bloque CSS, variantes `motion-safe:` y `motion-reduce:` para la regla de movimiento reducido. Se integra con Astro por el plugin de Vite. Soporta navegadores modernos (Safari 16.4+, Chrome 111+, Firefox 128+, confianza MEDIUM). |
| @tailwindcss/vite | 4.3.3 | Plugin de Tailwind para Vite/Astro | Es la vía oficial de instalación en Astro (no usar `@astrojs/tailwind`, obsoleto para v4). |
| Node.js | 24.13.0 (ya instalado) | Runtime de desarrollo y build | Cumple >=22.12.0 de Astro y >=22.19 de Lighthouse 13.5. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @astrojs/sitemap | 3.7.4 | Genera `sitemap-index.xml` y `sitemap-0.xml` | Solo cuando exista el dominio real en `site`. Verificado en el build de prueba. |
| @fontsource-variable/outfit | 5.3.0 | Fuente de respaldo (variable, pesos 100 a 900, latin y latin-ext) | Hoy, en local. La Fonts API la descarga con `fontProviders.fontsource()`; el paquete npm no es estrictamente necesario, se lista como referencia de versión. |
| typescript | 6.0.3 (fijar `^6`) | Necesario solo si usas `astro check` | Opcional. **No instalar TypeScript 7.0.2** (el `latest` actual): `@astrojs/check` 0.9.10 declara peer `^5 || ^6`. |
| @astrojs/check | 0.9.10 | Chequeo de tipos en `.astro` | Opcional, con typescript `^6`. |
| Hurme Geometric Sans 3 (woff2 propio) | Licencia web pendiente | Fuente de marca | Cuando Ari confirme o compre la licencia web. Ver sección de fuentes. |

### Development Tools (puerta de calidad para A11Y.md)

| Tool | Version | Purpose | Notes |
|------|---------|---------|-------|
| Astro Dev Toolbar, app "Audit" | incluida en Astro | Detecta problemas comunes de a11y y performance en desarrollo | Aviso oficial: no reemplaza a Pa11y, Lighthouse ni a personas. Úsala como primer filtro. |
| @axe-core/playwright | 4.13.0 | Escaneo axe sobre el HTML construido | Es la puerta exigida por A11Y.md ("axe sin violaciones críticas"). Corre contra `astro preview`. |
| @playwright/test | 1.63.0 | Ejecuta axe, prueba de tabulación y captura móvil 320 px | También sirve para validar reflow a 320 px y `prefers-reduced-motion`. |
| lighthouse | 13.5.0 | Core Web Vitals y auditoría SEO/a11y | Requiere Node >=22.19. Objetivo: 95+ en móvil y a11y 100. |
| eslint + eslint-plugin-astro | 10.11.0 + 3.2.1 | Linter con reglas jsx-a11y para `.astro` | Equivalente a `eslint-plugin-jsx-a11y` que pide A11Y.md. Confianza MEDIUM: verificar el nombre exacto de la config al instalar. El gate duro es axe. |
| contrast-check.py (repo A11Y.md) | n/a | Medición de contraste | A11Y.md prohíbe estimar contraste "a ojo". Ver tabla medida más abajo. |

## Verificación empírica (hecha en esta investigación)

- `npm create astro@latest astro-probe -- --template minimal --no-install --no-git --yes` funciona sin interacción (pero no acepta `.` como destino en modo `--yes`: ver Instalación). Genera `astro ^7.3.3`, `engines.node >=22.12.0` y `tsconfig` con `astro/tsconfigs/strict`.
- `npm install tailwindcss @tailwindcss/vite @astrojs/sitemap @fontsource-variable/outfit` resolvió `4.3.3`, `4.3.3`, `3.7.4`, `5.3.0`.
- `npm run build` con la Fonts API (`fontProviders.fontsource()`, Outfit, subsets latin y latin-ext) copió 2 archivos woff2 a `/_astro/fonts/`, inyectó `<link rel="preload" as="font">`, y generó un `@font-face` de fallback sobre Arial con `size-adjust:99.1474%`.
- El build final tiene **0 archivos `.js`** y un solo CSS de 4.3 KB. Sitemap generado.
- El iframe de ClickUp más su `<script is:inline async src=...>` compila sin errores y se emite tal cual.
- `astro dev` responde 200. En Astro 7, si detecta un agente de IA arranca el servidor en segundo plano (archivo `.astro/dev.json`); se detiene con `npx astro dev stop`. Para desactivarlo: variable `ASTRO_DEV_BACKGROUND`.

## Integración con Astro 7: qué usar y qué no

| Capacidad de Astro | Decisión | Razón |
|--------------------|----------|-------|
| **Islas** (`client:load`, `client:visible`, `client:idle`) | **No usar en la v1.** | No hay interactividad que lo justifique. Acordeón: `<details>/<summary>` nativo. Sin menú hamburguesa: header con logo y un botón CTA. Si algún día hace falta JS, un `<script>` pequeño en el componente es mejor que traer React. |
| **View Transitions (`<ClientRouter />`)** | **No usar (opcional futuro).** | Es una landing de una página: no hay navegación entre páginas que animar. Añade un router de cliente (JS) y activa las obligaciones de A11Y.md para SPA (foco y título por ruta). Dato verificado: `ClientRouter` sí incluye anunciador de ruta con `aria-live="assertive"` y desactiva las transiciones bajo `prefers-reduced-motion`, así que si más adelante hay blog, se puede adoptar sin riesgo. Para el scroll a `#agenda`: `scroll-behavior: smooth` solo dentro de `@media (prefers-reduced-motion: no-preference)`. |
| **`astro:assets`, `<Image />`** | **Usar.** | `alt` es obligatorio (encaja con A11Y.md), agrega `width`, `height`, `decoding="async"`, `loading="lazy"`, y convierte a WebP. Para la imagen del hero (LCP) usar `loading="eager"` y `fetchpriority="high"`. Para imágenes en `public/` hay que pasar `width` y `height` a mano. Las ilustraciones decorativas (lupas, ojos, clics) van como SVG en línea con `aria-hidden="true"` y `focusable="false"`; si son informativas, requieren `alt` confirmado por una persona (regla de A11Y.md). |
| **Fonts API (`fontProviders`)** | **Usar.** | `<Font cssVariable="--font-brand" preload />` en el `<head>`. Proveedor `fontsource()` hoy, `local()` cuando lleguen los woff2 de Hurme. Configurar solo los pesos usados. Ejemplo en la siguiente sección. |
| **`@astrojs/sitemap`** | **Usar cuando haya dominio.** | Necesita `site` en `astro.config.mjs`. Mientras el dominio esté pendiente, no añadirlo o dejar `site` con el valor final acordado y `noindex`. |
| **Integraciones SEO (astro-seo 1.2.0, etc.)** | **No usar.** | Es una dependencia para escribir cinco etiquetas. Para un sitio que vende SEO, el `<head>` debe ser código propio: `<title>`, `meta description`, `canonical`, Open Graph, Twitter, `lang="es"`, JSON-LD `Organization`. Un `BaseLayout.astro` de 40 líneas lo resuelve y es totalmente auditable. |
| **JSON-LD** | Etiqueta `<script is:inline type="application/ld+json" set:html={JSON.stringify(schema)} />` | Verificar en el build que se emite sin procesar. Validar con la prueba de resultados enriquecidos de Google. |
| **Content collections / datos** | Un `src/data/landing.es.json` con todo el copy | Una sola fuente de texto que el equipo SEO edita sin tocar plantillas. Las colecciones de contenido se reservan para el blog futuro. |
| **Adaptadores SSR** | **No usar.** | Salida `static` (verificado: `output: "static"`). Se despliega en cualquier hosting de archivos. |

## Restricciones de A11Y.md que condicionan el stack

| Regla de A11Y.md | Impacto en el stack |
|------------------|---------------------|
| HTML nativo primero, ARIA solo como último recurso, nunca `div` clicable | Favorece plantillas escritas a mano (Astro, Vite). Penaliza constructores que generan el DOM (Elementor, Webflow, Framer). |
| Contenido no puede depender de JavaScript (`opacity:0` que un script revela = CRÍTICO) | Astro sin islas cumple por construcción. Las animaciones parten visibles y se agregan solo en `no-preference`. |
| `prefers-reduced-motion` como camino por defecto | Usar variantes `motion-safe:` de Tailwind. Ojos y lupas animados: CSS puro, sin movimiento por defecto. Movimiento que dure más de 5 s necesita pausa (SC 2.2.2). |
| Foco visible de 2 px con contraste 3:1, prohibido `outline: none` | Estilo global `:focus-visible` (arriba). Cuidado con headers fijos que tapen el foco (SC 2.4.11). |
| Objetivo táctil de 44x44 px recomendado (mínimo 24) | Botones CTA con `min-h-11 min-w-11`. Separación de 8 px entre objetivos. |
| Contraste 4.5:1 en texto, 3:1 en UI, medido y no estimado | Ver tabla de contraste de la paleta. Es un límite duro sobre cómo se combinan los colores de marca. |
| Espaciado de texto sobrevive a 1.5 / 2x / 0.12em / 0.16em; sin alturas fijas en texto | Usar `min-h`, nunca `h-` fijo en contenedores de texto. Unidades `rem`. Sin `line-height !important`. |
| Interlineado >= 1.5, párrafos <= 80ch, sin texto justificado | Clase base de prosa: `max-w-[80ch] leading-relaxed text-start`. |
| `<html lang="es">`; pasajes en otro idioma con su propio `lang` | Términos como "GEO", "e-commerce" o cualquier frase en inglés: `<span lang="en">`. Define el `BaseLayout`. |
| `<title>` único y descriptivo, lo más específico primero | Un `<title>` propio y `meta description` por página. |
| Etiquetas de formulario visibles, sin placeholder como única etiqueta | No aplica a nuestro HTML (el formulario es de ClickUp), pero aplica a cualquier campo que agreguemos. |
| Label in Name (SC 2.5.3): no reemplazar texto visible con `aria-label` | Botones "Agenda tu llamada de 30 minutos": texto visible = nombre accesible. |
| Reflow a 320 px sin scroll 2D, zoom 200% | Diseño móvil desde ~320 px; probar con Playwright a 320 px. |
| Herramientas: axe sin críticos, revisión manual con lector de pantalla, verificación independiente | `@axe-core/playwright` en el gate, más `REPORT.md`, `EXCEPTIONS.md` y `A11Y-DECISIONS.md` versionados (nunca en `.gitignore`). El agente que genera no puede ser el único verificador: quedará como "self-reported" y limitado a CONDITIONAL hasta que otra sesión o una persona verifique. |
| Iframe de terceros | El interior del formulario de ClickUp no lo controlamos. Registrarlo como excepción conocida en `EXCEPTIONS.md` (dueño, aprobador, seguimiento, vencimiento) y ofrecer enlace de respaldo. |

## Contraste medido de la paleta de marca

| Combinación (texto sobre fondo) | Ratio | Veredicto |
|---------------------------------|------:|-----------|
| `#212121` sobre blanco | 16.10 | Texto normal OK |
| `#4228D1` (morado) sobre blanco | 8.55 | Texto normal OK |
| Blanco sobre `#4228D1` | 8.55 | Texto normal OK |
| `#ffc602` (amarillo) sobre `#212121` | 10.22 | Texto normal OK |
| `#4228D1` sobre `#ffc602` | 5.43 | Texto normal OK |
| `#fd6938` (naranja) sobre `#212121` | 5.56 | Texto normal OK |
| `#212121` sobre `#fd6938` | 5.56 | Texto normal OK (texto de botón naranja: usar oscuro) |
| `#fd6938` sobre `#4228D1` | 2.95 | **Falla** en texto y en UI: solo sirve como relleno decorativo con contorno |
| `#fd6938` sobre blanco | 2.89 | **Falla** en texto y en bordes de UI (<3.0) |
| Blanco sobre `#fd6938` | 2.89 | **Falla**: no usar texto blanco sobre naranja |
| `#fd6938` sobre `#ffc602` | 1.84 | **Falla** |
| `#ffc602` sobre blanco | 1.58 | **Falla**: amarillo nunca como texto o borde sobre claro |
| `#4228D1` sobre `#212121` | 1.88 | **Falla**: morado no va sobre fondo oscuro |
| `#F4F3E0` (crema) sobre `#4228D1` | 7.63 | Texto normal OK |
| `#4228D1` sobre `#F4F3E0` | 7.63 | Texto normal OK |
| `#212121` sobre `#F4F3E0` | 14.37 | Texto normal OK |
| `#ffc602` sobre `#F4F3E0` | 1.41 | **Falla** |
| `#fd6938` sobre `#F4F3E0` | 2.58 | **Falla** |
| Blanco sobre `#F4F3E0` | 1.12 | **Falla** |

## Tipografía: Hurme Geometric Sans 3

- Es una familia de 14 estilos: 7 pesos (Hairline, Thin, Light, Regular, SemiBold, Bold, Black) más oblicuas, con versalitas verdaderas. Diseñada por Toni Hurme (2013). La variante No. 3 tiene esquinas romas y se recomienda para texto corrido.
- **La licencia de escritorio NO cubre la web.** En MyFonts, la licencia de escritorio (USD 49 por estilo, USD 249 la familia completa de 14) cubre identidad de marca, PDF, video y similares. Para incrustar en un sitio se necesita licencia Webfont aparte.
- **Licencia web de la fundición (hurmedesign.com):** modelo por páginas vistas mensuales, tramos desde 50,000 hasta 50,000,000; cuota **única, sin pagos recurrentes**; formatos woff, woff2 y eot; **autoalojamiento obligatorio, sin servicios de terceros** (encaja con la Fonts API de Astro y `fontProviders.local()`). No se pudo leer el precio (se configura en la tienda). En MyFonts y Fontspring también se vende como webfont; MyFonts normalmente usa licencia anual (LOW: no se confirmó en la ficha).
- Cobertura de idioma: no se pudo confirmar en las fichas leídas. Un tipo geométrico latino de esta categoría cubre `ñ`, `á`, `¿`, `¡`, pero **hay que verificar los glifos con el archivo real antes de pagar**.

## Cómo embeber el formulario de ClickUp (accesible)

- La URL del formulario responde 200 y **no envía `X-Frame-Options` ni `Content-Security-Policy`** en los encabezados (probado con `curl -I`), por lo que se puede embeber en `localhost` y en cualquier dominio. Confianza HIGH hoy; ClickUp podría cambiarlo.
- El código de ClickUp incluye la clase `clickup-embed clickup-dynamic-height` y el script `https://app-cdn.clickup.com/assets/js/forms-embed/v1.js`. El script (25 KB) es iFrame Resizer 4.2.8, ejecuta `iFrameResize({}, '.clickup-embed.clickup-dynamic-height')` y pone `overflow:auto` al contenedor. La opción "Autosize embed height" está activa por defecto en ClickUp. (No se pudo abrir el artículo de ayuda de ClickUp; el snippet exacto se dedujo del script servido. Confianza MEDIUM: comparar con el "Embed code" que ClickUp muestra en la configuración de compartir del formulario.)
- `title` descriptivo en el iframe: es lo que anuncia el lector de pantalla y lo que exige la regla de nombre accesible. Sin `title`, el iframe es una caja muda.
- `loading="lazy"`: el formulario está más abajo del primer pantallazo; no compite con el LCP. Los CTA enlazan a `#agenda`, y el navegador carga el iframe al llegar. `scroll-mt-24` evita que un header fijo tape el título (SC 2.4.11).
- Altura responsive: `min-h` por breakpoint reserva espacio (evita CLS) y el script de ClickUp ajusta la altura real. **Medir la altura real del formulario** en móvil y escritorio y fijar esos `min-h` cerca del valor real. Si el script fallara, el iframe conserva su altura mínima y ClickUp muestra scroll interno.
- Enlace de respaldo visible con `target="_blank" rel="noopener noreferrer"`: cubre bloqueadores de terceros, fallos de red y a quien prefiera abrirlo aparte. El texto visible es el nombre accesible; el `sr-only` solo lo complementa (permitido por SC 2.5.3).
- `script is:inline async`: sin `is:inline`, Astro intentaría empaquetar una URL remota. Es JS de terceros de 25 KB, asíncrono y por debajo del fold; medir su efecto en INP con Lighthouse. Si molestara, cargarlo con `IntersectionObserver` al acercarse a `#agenda`.
- Fuera del iframe no controlamos su accesibilidad interna (foco, etiquetas). Registrar en `EXCEPTIONS.md` y probar a mano con teclado y lector de pantalla que se pueda entrar y salir del iframe sin trampa de foco.
- No añadir `frameborder`, `scrolling` ni `onwheel` (atributos obsoletos o innecesarios); el borde va por CSS.
- Todos los CTA del sitio llevan el mismo texto visible ("Agenda tu llamada de 30 minutos") y `href="#agenda"`. La consistencia ayuda a quien usa lector de pantalla o control por voz.

## Instalación y ejecución local hoy

# 1. Crear el proyecto en la raíz del repositorio (que ya tiene .planning/).

#    OJO: con "." y --yes el CLI ignora la carpeta actual y crea una con nombre aleatorio.

#    Verificado: hay que scaffoldear en una subcarpeta y copiar (el cp incluye archivos ocultos).

#    La plantilla trae AGENTS.md y un CLAUDE.md (enlace simbólico a AGENTS.md).

#    Si el repositorio ya tiene un CLAUDE.md propio, no lo sobrescribas: revisa antes del cp.

# 2. Dependencias de producción

# 3. Sitemap: SOLO cuando el dominio esté definido

# npm install @astrojs/sitemap

# 4. Herramientas de calidad (dev)

# 5. Opcionales (chequeo de tipos): fijar TypeScript 6

# npm install -D typescript@^6 @astrojs/check@0.9.10

# Servidor de desarrollo (http://localhost:4321)

#   Ver desde otro dispositivo de la red local (celular de Ari o Camila):

#   Si un agente de IA lo lanza, Astro 7 lo deja en segundo plano. Para detenerlo:

# Validar el build de producción tal como se publicará

# Auditoría (con el preview arriba)

## Hosting y despliegue posterior al dominio propio

| Opción | Costo | Notas |
|--------|-------|-------|
| **Cloudflare Pages (recomendada)** | Gratis, uso comercial permitido, ancho de banda estático sin límite (confianza MEDIUM, verificar plan vigente) | Conecta el repositorio, corre `npm run build`, publica `dist/`. Dominio propio con SSL sin costo. |
| Netlify | Plan gratuito disponible | Planes con créditos desde 2025; revisar límites antes. |
| GitHub Pages | Gratis | Sirve, con menos control de encabezados. |
| **Vercel plan Hobby** | **No usar** | Su política limita Hobby a uso personal no comercial; una landing de captación de una agencia es comercial y exigiría Pro (USD 20 al mes). |

## Edición futura por el equipo SEO (mantenibilidad)

- **Ahora:** todo el copy en `src/data/landing.es.json` (secciones, títulos, tarjetas de métricas, textos de CTA). Editar texto no requiere tocar plantillas. Se puede editar desde la interfaz web de GitHub y previsualizar en Cloudflare Pages.
- **Cuando el equipo pida edición visual:** añadir un CMS sobre el mismo sitio Astro (por ejemplo Payload, que Juan ya usa, o un CMS basado en Git como Keystatic o Decap; no se verificaron aquí, confianza LOW) en lugar de rehacer el front en WordPress.
- **Si eso no basta:** el plan B documentado es WordPress + Astra + Elementor, con las penalizaciones de a11y y CWV descritas arriba.

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Astro 7 + Tailwind 4 | **WordPress 7.1.1 + Astra 4.13.12 + Elementor 4.2.4 (LocalWP 6.x)** | Si el equipo SEO exige editar visualmente desde el día uno y acepta el costo en control de HTML, a11y y CWV. Requiere Elementor Pro (USD 59 al año) para fuentes propias, hosting PHP/MySQL y plugin de caché. Rank Math sería el SEO. LocalWP 6.x es gratuito y de un clic. |
| Astro 7 + Tailwind 4 | **Vite 8.3.0 + HTML/CSS/JS** (`npm create vite@latest -- --template vanilla`) | Si se decide que la landing jamás tendrá más páginas ni blog y se quiere cero abstracción. Es una alternativa casi igual de buena (4.35 vs 4.55); se pierde el pipeline de fuentes, imágenes y sitemap. Vite 8 requiere Node ^20.19 o >=22.12. |
| Astro 7 + Tailwind 4 | **Next.js 16.3.5 (`output: 'export'`)** | Si más adelante la landing se vuelve una aplicación con lógica de servidor, autenticación o un formulario propio conectado a la API de ClickUp. Para una landing estática sobra: el runtime de React y el router van siempre en el bundle base. |
| Astro 7 + Tailwind 4 | **Webflow** | Si el diseñador quiere trabajar sin código y la accesibilidad estricta no es un requisito de evidencia. Sin ejecución local; exportar código exige plan de pago y pierde CMS y formularios nativos. |
| Astro 7 + Tailwind 4 | **Framer** | Igual que Webflow; es más barato (Basic USD 10 al mes facturado anual, confianza MEDIUM) pero con menos control del DOM. |
| Tailwind 4 | CSS con estilos con alcance de Astro (`<style>`) | Si se prefiere cero dependencias de CSS. Funciona igual de bien para una página; Tailwind acelera y centraliza tokens. |
| Outfit (respaldo) | Poppins / Plus Jakarta Sans / Urbanist / Lexend | Si Ari rechaza el parecido visual de Outfit en la revisión. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `@astrojs/tailwind` | Integración de Tailwind 3, obsoleta para v4 | `@tailwindcss/vite` 4.3.3 |
| TypeScript 7.0.2 con `@astrojs/check` | `@astrojs/check` 0.9.10 declara peer `^5 || ^6` | `typescript@^6` (6.0.3) |
| Google Fonts por `<link>` en runtime | Petición de terceros, latencia y privacidad; ignora el fallback ajustado | Fonts API de Astro (descarga en build) |
| Hurme desde un CDN o servicio de terceros | La licencia web exige autoalojamiento | `fontProviders.local()` con woff2 propios |
| Fuente de escritorio (licencia Desktop) convertida a woff2 | Licencia Desktop no cubre incrustar en un sitio | Licencia Webfont |
| React, Vue o Svelte "por costumbre" | Añade JS que la página no necesita y riesgo de a11y | Plantillas `.astro` y `<details>` nativo |
| `<ClientRouter />` (View Transitions) en la v1 | Router de cliente en una página sin navegación; activa reglas de foco para SPA | Anclas nativas con `scroll-behavior` condicionado |
| Animaciones de entrada que parten con `opacity:0` | Contenido secuestrado por JS (regla CRÍTICA de A11Y.md) | Estado visible por defecto; animar solo bajo `motion-safe:` |
| Overlays de accesibilidad (widgets tipo accessiBe) | A11Y.md: los overlays no son cumplimiento; se corrige el DOM | HTML semántico correcto |
| Vercel Hobby | Prohíbe uso comercial | Cloudflare Pages |
| astro-seo y plugins SEO similares | Dependencia innecesaria para 5 etiquetas | `BaseLayout.astro` propio |
| Menú hamburguesa en la v1 | Suma JS y riesgo de a11y sin aportar a la conversión | Header con logo y un botón CTA a `#agenda` |
| Texto blanco sobre naranja `#fd6938`, amarillo como texto sobre claro | Ratios 2.89 y 1.58, fallan WCAG | Ver tabla de contraste |

## Stack Patterns by Variant

- Mantener `fontProviders.fontsource()`, sin archivos de fuente en el repositorio.
- Porque elimina el costo y el riesgo legal, con una desviación de marca que debe quedar aprobada por escrito.
- Poner los woff2 en `src/assets/fonts/`, cambiar a `fontProviders.local()` con 2 o 3 pesos, y conservar `fallbacks: ['sans-serif']`.
- Porque la Fonts API genera el fallback ajustado y el `preload`, y nada más del sitio cambia.
- Añadir content collections de Astro y `@astrojs/sitemap`, más un CMS ligero.
- Porque el sitio ya es Astro y no requiere migrar nada.
- Mantener el iframe (decisión ya tomada) y el enlace de respaldo; el formulario propio conectado a la API queda fuera de alcance por decisión del proyecto.
- Cargarlo de forma diferida al acercarse a `#agenda`, o eliminarlo y fijar la altura con `min-h` medidos.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| astro@7.3.3 | Node >=22.12.0 (solo pares: 22, 24) | Astro 7 usa Vite 8 (`vite ^8.0.13`), compilador en Rust (más estricto: etiquetas sin cerrar fallan), Markdown con Sätteri y `compressHTML: 'jsx'` por defecto. Node 23 y otros impares no soportados. |
| astro@7.3.3 | tailwindcss@4.3.3 + @tailwindcss/vite@4.3.3 | Probado en build. |
| astro@7.3.3 | @astrojs/sitemap@3.7.4 | Probado en build. |
| @astrojs/check@0.9.10 | typescript `^5 \|\| ^6` | No compatible con TypeScript 7.0.2. |
| lighthouse@13.5.0 | Node >=22.19 | Node 24.13.0 lo cumple. |
| @axe-core/playwright@4.13.0 | playwright-core >=1 | Sin conflicto con @playwright/test 1.63.0. |
| vite@8.3.0 (alternativa) | Node ^20.19 o >=22.12 | `create-vite` 9.2.1. |
| next@16.3.5 (alternativa) | Node >=20.9 | React 19.3.0. |

## Sources

- npm registry (`npm view`, consultado 2026-09-18): versiones: astro 7.3.3, tailwindcss y @tailwindcss/vite 4.3.3, @astrojs/sitemap 3.7.4, vite 8.3.0, next 16.3.5, @fontsource-variable/outfit 5.3.0, typescript 7.0.2 (latest) y 6.0.3, @astrojs/check 0.9.10, lighthouse 13.5.0, @axe-core/playwright 4.13.0, @playwright/test 1.63.0, eslint 10.11.0, eslint-plugin-astro 3.2.1, create-vite 9.2.1. HIGH.
- API de WordPress.org (consultada 2026-09-18): Astra 4.13.12, WordPress 7.1.1, Elementor 4.2.4, Astra Starter Templates 4.7.7, Rank Math 1.0.278. HIGH.
- Context7 `/withastro/docs`: instalación, requisito Node, guía de upgrade a v7 (Vite 8, compilador Rust), Fonts API (`fontProviders`, `<Font />`, preload, fallbacks), `astro:assets`, `@astrojs/sitemap`, islas, Dev Toolbar Audit, View Transitions y accesibilidad, modo segundo plano para agentes. HIGH.
- Context7 `/vercel/next.js/v16.2.9`: `output: 'export'`, `next/font/local`, bundle base del App Router. HIGH.
- Context7 `/websites/tailwindcss`: instalación con Astro por `@tailwindcss/vite`, `@theme`. HIGH.
- Proyecto de prueba en el directorio temporal (build y dev server reales): cero JS, fuentes con preload y fallback ajustado, sitemap, iframe con `is:inline`. HIGH.
- A11Y.md: https://github.com/fecarrico/A11Y.md/blob/main/docs/en/A11Y.md: reglas y umbrales. HIGH.
- Hurme Design, licencia web: https://hurmedesign.com/product-category/typefaces/hurme-geometric-sans-%E2%84%963-typefaces/: MEDIUM. MyFonts, precios de escritorio: https://www.myfonts.com/collections/geometric-sans-3-font-hurme/: MEDIUM. Typewolf (descripción de la familia): https://www.typewolf.com/hurme-geometric-sans: MEDIUM.
- Script de ClickUp y encabezados del formulario, inspeccionados directamente (`curl`): https://app-cdn.clickup.com/assets/js/forms-embed/v1.js: HIGH. Ayuda de ClickUp (solo la API de artículos, texto sobre "Autosize embed height"): https://help.clickup.com/hc/en-us/articles/7255560049815-Share-embed-and-export-Forms: MEDIUM.
- Reseñas de terceros sobre Astra, Webflow, Framer, Elementor Pro, LocalWP, Cloudflare Pages y política de Vercel Hobby (búsqueda web, sin contraste con documentación oficial de cada proveedor): LOW a MEDIUM; verificar precios vigentes antes de decidir presupuesto: https://vercel.com/docs/limits/fair-use-guidelines, https://wpastra.com/changelog/astra-theme, https://localwp.com/releases/, https://www.framer.com/help/articles/guide-to-web-accessibility-in-framer/, https://help.webflow.com/hc/en-us/articles/33961386739347-How-do-I-export-my-Webflow-site-code

<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->

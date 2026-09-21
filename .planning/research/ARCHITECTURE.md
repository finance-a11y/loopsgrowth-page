# Architecture Research

**Domain:** Landing de una página para captación B2B (agencia SEO/GEO), rápida, accesible y con SEO técnico ejemplar
**Project:** Loops Growth Landing
**Researched:** 2026-09-18
**Confidence:** ALTA en estructura, tokens, embed de ClickUp y límites de medición (verificado con `curl`, lectura del script real y contraste calculado). MEDIA en el detalle de tracking server-side y en la licencia de la fuente. BAJA donde se indica.

> Alcance de este documento: la arquitectura es **agnóstica del stack**. Todo se define como capas y contratos, y cada capa trae su implementación para los dos candidatos (Astro estático y WordPress + Astra). La elección final del stack es de STACK.md. Al final de la sección "Mapa por stack" hay una nota de qué stack encaja mejor con el requisito "corriendo en local HOY".

---

## Standard Architecture

### System Overview

Una landing como esta es un **sitio estático de una sola ruta** con cinco capas. Lo único dinámico es un iframe de terceros. La regla de oro: el contenido fluye en una sola dirección (contenido, secciones, HTML) y las capas transversales (SEO, medición) leen del mismo contenido sin que las secciones lo sepan.

```
┌──────────────────────────────────────────────────────────────────────┐
│  CAPA 0: ORIGEN DEL VISITANTE                                        │
│  QR del evento / link con UTM / búsqueda orgánica / referido         │
└───────────────────────────────┬──────────────────────────────────────┘
                                │ GET /?utm_source=...
┌───────────────────────────────▼──────────────────────────────────────┐
│  CAPA 1: SHELL (Layout base)                                         │
│  <html lang="es"> · BaseHead (SEO) · SkipLink · Header · <main> ·    │
│  Footer · tokens.css · fuentes                                       │
├──────────────────────────────────────────────────────────────────────┤
│  CAPA 2: SECCIONES (10, presentacionales, sin estado)                │
│  01 Hero → 02 Problema → 03 Por qué ahora → 04 Solución → 05         │
│  Resultados → 06 Casos → 07 Quiénes somos → 08 Qué incluye →         │
│  09 Cómo funciona → 10 CTA final + FormEmbed (#agenda)               │
│     └── usan: SectionShell · CtaButton · Card · Heading · Rich       │
├──────────────────────────────────────────────────────────────────────┤
│  CAPA 3: ISLAS / PROGRESSIVE ENHANCEMENT (JS mínimo, opcional)       │
│  cta-focus (foco al ir a #agenda) · form-embed (lazy, UTM, timeout)  │
│  tracking (dataLayer → gtag, inerte sin ID) · utm (sessionStorage)   │
└───────────────┬──────────────────────────────────┬───────────────────┘
                │ postMessage [iFrameSizer]        │ dataLayer.push
                │ (solo altura, unidireccional)    │ (unidireccional)
┌───────────────▼─────────────┐      ┌─────────────▼───────────────────┐
│  ClickUp Form (iframe,      │      │  GA4 (gtag) / GTM futuro        │
│  origen cruzado, opaco)     │      │  eventos: cta_click, form_view, │
│  forms.clickup.com          │      │  form_start, (generate_lead)    │
└───────────────┬─────────────┘      └─────────────────────────────────┘
                │ submit (servidor de ClickUp)
┌───────────────▼──────────────────────────────────────────────────────┐
│  FUENTE DE VERDAD DE CONVERSIÓN: tarea creada en la Lista de ClickUp │
│  (con campos ocultos utm_*) → llamada de pre-calificación            │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  CAPA TRANSVERSAL DE BUILD (todo se genera desde UNA fuente)         │
│  landing.es.yaml ──Zod──► secciones (props)                          │
│                    ├────► JSON-LD (Organization/ProfessionalService) │
│                    ├────► <title>, meta, OG                          │
│                    ├────► llms.txt                                   │
│  site URL (env) ───► canonical, sitemap.xml, robots.txt, og:url      │
└──────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Componente | Responsabilidad | Implementación típica |
|------------|-----------------|-----------------------|
| **Content source** | Único archivo editable con todo el copy, metadatos SEO, equipo y config del CTA/form. Validado con esquema | `src/content/landing.es.yaml` + esquema Zod (Astro) o ACF/bloques (WP) |
| **Tokens** | Colores, tipografía, espacios, radios, sombras, movimiento. Única fuente de estilo | `src/styles/tokens.css` con variables CSS (Astro) o `theme.json`/`:root` en tema hijo (WP) |
| **BaseLayout** | `<html lang>`, head SEO, skip link, landmarks, orden de scripts | `layouts/Base.astro` o `header.php`/`footer.php` |
| **SectionShell** | Envoltorio de sección: `id`, `aria-labelledby`, tono de fondo, padding fluido, nivel de heading | Componente `.astro` o template-part PHP |
| **Secciones 01 a 10** | Renderizar su porción del contenido. Sin lógica de negocio, sin analytics, sin estado | Un componente por sección |
| **CtaButton** | Único punto donde existe el CTA. Ancla `#agenda`, etiqueta desde contenido, `data-cta` para medición | `<a>` estilizado (navega, no es `<button>`) |
| **FormEmbed** | Iframe de ClickUp + fallback + carga diferida + a11y + paso de UTM | Componente con isla mínima |
| **Tracker** | Escucha delegada de clics y visibilidad; empuja a `dataLayer`; inerte si no hay ID | `tracking.ts` (unas 60 líneas) |
| **SEO layer** | title, meta, canonical, OG, JSON-LD, robots, sitemap, llms.txt derivados del contenido y de `site` | `BaseHead` + endpoints/archivos estáticos (Astro) o Rank Math Pro (WP) |
| **Build guards** | Fallan el build si el copy tiene `[VERIFICAR]`, voseo, guiones largos o contrastes rotos | `scripts/lint-copy.mjs`, `scripts/check-contrast.mjs` |

### Límites de las 10 secciones (contrato)

Cada sección es un componente **puro**: recibe sus datos por props desde el contenido, renderiza HTML semántico y no importa nada de tracking ni de otras secciones. La numeración del Copy v2 salta del 8 al 10; **en el código se usan claves semánticas, no números**, así el salto no importa y reordenar es tocar un array.

| # | Sección (Copy v2) | `id` / ancla | Nivel de heading | Contenido y forma | Notas de frontera |
|---|-------------------|--------------|------------------|-------------------|-------------------|
| 01 | Hero | `#inicio` | `h1` (único en la página) | Titular, subtítulo, CTA primario, ilustración collage decorativa | El H1 es el elemento LCP (texto, no imagen). CTA de `cta.label` |
| 02 | El problema | `#problema` | `h2` | Texto corto + lista de dolores (3 a 4 ítems) | Sin CTA obligatorio |
| 03 | Por qué ahora | `#por-que-ahora` | `h2` | Texto + 2 o 3 puntos de contexto (Google, ChatGPT, Gemini) | Mantener terminología única "SEO/GEO" (ver Content layer) |
| 04 | La solución (4 pilares) | `#solucion` | `h2` + `h3` por pilar | 4 tarjetas: auditoría, estrategia, ejecución, reportes | CTA secundario al final |
| 05 | Lo que logramos juntos | `#resultados` | `h2` | Resultados esperados en lista | Las cifras "30% a 50%" y el split Google vs IA llevan `status: pending` hasta que Ari verifique |
| 06 | Casos de éxito | `#casos` | `h2` + `h3` por caso | Tarjetas de métrica (número grande + contexto), **un caso por tarjeta** (separar el +500% de Meta Ads) | Sin logos ni fotos. No usar `Review`/`AggregateRating` en schema |
| 07 | Quiénes somos | `#nosotros` | `h2` + `h3` por persona | Arianna Lupi, Verónica Romero, Juan Angulo, Miguel Pacheco: nombre, rol, una línea | Sin fotos. Ilustración de marca con `alt=""` decidido y registrado |
| 08 | Qué incluye | `#incluye` | `h2` | Lista de entregables | Es `<ul>`, no tabla |
| 09 | Cómo funciona | `#como-funciona` | `h2` | Pasos numerados del embudo (formulario, llamada, cotización, cierre) | `<ol>` semántico. Duración de llamada viene de `cta.duracion_minutos` |
| 10 | CTA final + formulario | `#agenda` | `h2` (con `tabindex="-1"`) | Texto de cierre + `FormEmbed` | **Única instancia del iframe.** Destino de todos los CTAs |

CTAs repetidos (header, hero, tras 04, tras 06, tras 09) apuntan todos a `#agenda`. No se pone un segundo iframe arriba: duplicaría la carga de un bundle de terceros (el JS principal del formulario pesa unos 220 KB comprimido, medido) y rompería el presupuesto de rendimiento. "A un scroll de distancia" se cumple con el CTA sticky del header y el ancla, no con un segundo formulario.

---

## Recommended Project Structure

Estructura primaria para **Astro** (ver más abajo el equivalente WordPress).

```
loopsgrowth/
├── .planning/                       # GSD (ya existe)
├── docs/
│   └── a11y/
│       ├── REPORT.md                # exigido por A11Y.md; más nuevo que el último cambio de UI
│       ├── EXCEPTIONS.md            # cualquier desvío WCAG aceptado (incluye el iframe de ClickUp)
│       └── A11Y-DECISIONS.md        # p. ej. "ilustraciones collage decorativas alt=''"
├── public/                          # se copia tal cual a dist/
│   ├── favicon.svg
│   ├── apple-touch-icon.png
│   ├── og-default.png               # 1200x630, con texto legible
│   └── site.webmanifest
├── src/
│   ├── assets/
│   │   ├── fonts/                   # woff2 de Hurme (gitignored hasta confirmar licencia web)
│   │   ├── brand/                   # isotipo y logo en SVG (convertir desde el .ai)
│   │   └── collage/                 # lupas, ojos, clicks (SVG inline o AVIF)
│   ├── content/
│   │   └── landing.es.yaml          # FUENTE ÚNICA DE COPY (Ari edita solo esto)
│   ├── content.config.ts            # esquema Zod + loader file()
│   ├── styles/
│   │   ├── tokens.css               # primitivos + semánticos + escala tipográfica
│   │   ├── base.css                 # reset, tipografía base, foco, reduced-motion
│   │   └── utilities.css            # .sr-only, .container, .stack
│   ├── components/
│   │   ├── layout/                  # Header.astro, Footer.astro, SkipLink.astro
│   │   ├── sections/                # Hero.astro ... FinalCta.astro (10 archivos)
│   │   ├── ui/                      # SectionShell, CtaButton, Card, MetricCard, Rich
│   │   ├── form/                    # ClickUpFormEmbed.astro
│   │   └── seo/                     # BaseHead.astro, JsonLd.astro
│   ├── layouts/
│   │   └── Base.astro
│   ├── lib/
│   │   ├── site.ts                  # site URL, env, flags (PUBLIC_SITE_URL, PUBLIC_ENV)
│   │   ├── content.ts               # getLanding(): lee y tipa el contenido
│   │   ├── jsonld.ts                # construye el @graph desde el contenido
│   │   └── utm.ts                   # parseo y allowlist de parámetros
│   ├── scripts/                     # JS de cliente (islas), cada uno < 3 KB
│   │   ├── tracking.ts
│   │   ├── form-embed.ts
│   │   └── cta-focus.ts
│   └── pages/
│       ├── index.astro              # compone las 10 secciones en orden
│       ├── 404.astro
│       ├── robots.txt.ts            # dinámico desde `site` y `PUBLIC_ENV`
│       └── llms.txt.ts              # generado desde el contenido
├── scripts/                         # herramientas de build/QA (Node)
│   ├── lint-copy.mjs                # [VERIFICAR], voseo, em/en dash, "AEO"
│   ├── check-contrast.mjs           # pares de tokens contra WCAG
│   └── budget.mjs                   # pesos de dist/ contra el presupuesto
├── tests/
│   └── a11y.spec.ts                 # Playwright + axe sobre `astro preview`
├── astro.config.mjs                 # site, integrations (sitemap), fonts
├── .env.example                     # PUBLIC_SITE_URL, PUBLIC_ENV, PUBLIC_GA_ID
└── package.json
```

### Structure Rationale

- **`content/` separado de `components/`:** Ari toca un archivo y nada más. Ningún componente contiene copy hardcodeado.
- **`sections/` uno a uno con el Copy v2:** cuando Ari diga "cambia el caso 3", se sabe exactamente dónde mirar. Una sección, un archivo.
- **`ui/` para primitivas compartidas:** el CTA, la tarjeta y el envoltorio de sección existen una vez. Cambiar el radio del botón es tocar un archivo.
- **`scripts/` (cliente) vs `scripts/` (raíz, Node):** los primeros se envían al navegador y están bajo presupuesto; los segundos solo corren en build/QA.
- **`docs/a11y/`:** A11Y.md exige `REPORT.md`, `EXCEPTIONS.md` y `A11Y-DECISIONS.md`. Si no existen desde el día 1 el cumplimiento "estricto" del proyecto no es demostrable.

### Equivalente WordPress + Astra (tema hijo)

```
wp-content/themes/loops-child/
├── style.css                        # cabecera del tema hijo + import de tokens
├── functions.php                    # enqueue de tokens.css, fuentes, scripts; dequeue de lo que sobre
├── front-page.php                   # compone template-parts en orden
├── template-parts/section-hero.php ... section-final-cta.php
├── assets/
│   ├── css/tokens.css               # MISMO archivo de tokens que en Astro
│   ├── fonts/                       # woff2 (mismas reglas de licencia)
│   └── js/{tracking,form-embed,cta-focus}.js
├── inc/{seo.php,tracking.php}       # solo si NO se usa Rank Math Pro
└── content/landing.es.json          # opción A: copy en archivo (no editable desde wp-admin)
```

Copy en WordPress: la "fuente única" pasa a ser la **propia página Inicio** en wp-admin (bloques/patrones, o ACF Pro con campos flexibles). Es su gran ventaja de edición para Ari y su gran costo de control: el contenido vive en la base de datos, no en Git.

---

## Architectural Patterns

### Pattern 1: Contenido como dato, secciones como funciones puras

**What:** Todo el copy vive en un YAML validado. Cada sección es `(props) => HTML`.
**When to use:** Siempre en este proyecto. El copy va a cambiar (dos flags `[VERIFICAR]`, terminología SEO/GEO vs AEO, 20 vs 30 min).
**Trade-offs:** Un paso más al inicio (esquema); a cambio, un error de copy rompe el build en lugar de publicarse. En WP el equivalente es menos estricto.

```yaml
# src/content/landing.es.yaml  (clave superior = idioma; añadir "en:" después es solo datos)
es:
  site:
    name: "Loops Growth"
    description: "SEO y GEO para e-commerce que quiere aparecer en Google, ChatGPT y Gemini."
  cta:
    label: "Agenda tu llamada de 30 minutos"   # un solo lugar (resuelve 20 vs 30 min)
    href: "#agenda"
    duracion_minutos: 30
  form:
    url: "https://forms.clickup.com/90131720021/f/2ky49tun-19253/DATFKMESVSMXZY5CO5"
    title: "Formulario para agendar tu llamada con Loops Growth"
    fallback_label: "Abrir el formulario en una pestaña nueva"
  hero:
    heading: "..."
    subheading: "..."
  resultados:
    items:
      - text: "Reduce entre 30% y 50% tu presupuesto de ads"
        status: pending          # el lint bloquea build de producción si queda "pending"
```

```ts
// src/content.config.ts  (Astro 6: Zod se importa desde 'astro/zod')
import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro/zod';

const claim = z.object({ text: z.string(), status: z.enum(['verified', 'pending']).default('verified') });

const landing = defineCollection({
  // object form: la clave (es) es el id de la entrada
  loader: file('src/content/landing.es.yaml'),
  schema: z.object({
    site: z.object({ name: z.string(), description: z.string().max(160) }),
    cta: z.object({ label: z.string(), href: z.string().startsWith('#'), duracion_minutos: z.number() }),
    form: z.object({ url: z.string().url(), title: z.string(), fallback_label: z.string() }),
    resultados: z.object({ items: z.array(claim) }),
    // ...una clave por sección
  }),
});

export const collections = { landing };
```

Uso: `const { data } = await getEntry('landing', 'es');`. El `file()` loader acepta YAML en forma de objeto con el id como clave (documentado, MEDIA-ALTA; confirmar en el primer `astro dev`).

### Pattern 2: Tokens de tres niveles

**What:** Primitivos de marca, luego tokens semánticos, luego componentes que solo consumen semánticos.
**When to use:** Siempre. Permite invertir una sección a fondo morado sin tocar sus componentes.
**Trade-offs:** Más variables que un CSS ingenuo; a cambio, el chequeo de contraste se automatiza sobre pares semánticos.

```css
/* src/styles/tokens.css */
:root {
  /* 1. Primitivos (brandbook Eleven 2024) */
  --brand-purple: #73187f;
  --brand-orange: #fd6938;
  --brand-yellow: #ffc602;
  --brand-dark:   #212121;
  --brand-white:  #ffffff;

  /* 2. Semánticos: se cambian por tono de sección */
  --surface:        var(--brand-white);
  --on-surface:     var(--brand-dark);
  --accent:         var(--brand-purple);      /* texto/links sobre claro */
  --cta-bg:         var(--brand-orange);
  --on-cta:         var(--brand-dark);        /* NO blanco: ver tabla de contraste */
  --focus-ring:     var(--brand-purple);
}
[data-tone="purple"] {
  --surface: var(--brand-purple);  --on-surface: var(--brand-white);
  --accent: var(--brand-yellow);   --cta-bg: var(--brand-yellow);  --on-cta: var(--brand-dark);
  --focus-ring: var(--brand-yellow);
}
[data-tone="dark"] {
  --surface: var(--brand-dark);    --on-surface: var(--brand-white);
  --accent: var(--brand-orange);   --cta-bg: var(--brand-yellow);  --on-cta: var(--brand-dark);
  --focus-ring: var(--brand-yellow);
}
```

### Pattern 3: HTML primero, JS como mejora

**What:** La página completa (texto, ancla, enlace de respaldo al formulario) funciona con JS apagado. JS solo añade: mover foco a `#agenda`, carga diferida del iframe, paso de UTM, medición.
**When to use:** Siempre. Además es lo que los rastreadores de IA y Googlebot ven de forma más fiable (la propia agencia vende GEO: su HTML debe ser legible sin ejecutar JS).
**Trade-offs:** Hay que resistir la tentación de "un componente React para todo". En Astro, cero frameworks de UI; en WP, cero jQuery propio.

### Pattern 4: Medición dataLayer-first con atributos `data-*`

**What:** Los componentes no importan analytics. Marcan el DOM con `data-cta="hero"`; un único listener delegado empuja a `window.dataLayer`; gtag (o GTM más adelante) lo consume.
**When to use:** Siempre. Cambiar de gtag directo a GTM no toca ninguna sección.
**Trade-offs:** Un contrato de nombres de evento que documentar (abajo).

```ts
// src/scripts/tracking.ts (esbozo)
const GA_ID = import.meta.env.PUBLIC_GA_ID;            // vacío en local: todo es no-op
window.dataLayer = window.dataLayer || [];
const push = (event: string, params: Record<string, unknown> = {}) =>
  window.dataLayer.push({ event, ...params });

document.addEventListener('click', (e) => {
  const cta = (e.target as Element).closest<HTMLElement>('[data-cta]');
  if (cta) push('cta_click', { cta_location: cta.dataset.cta, cta_text: cta.textContent?.trim() });
});
// gtag.js se inyecta tras 'load' + requestIdleCallback SOLO si GA_ID existe
```

### Pattern 5: Superficie dirigida por entorno

**What:** `PUBLIC_SITE_URL` y `PUBLIC_ENV` (`local | preview | production`) alimentan canonical, `og:url`, sitemap, robots, JSON-LD y la política `noindex`. Ningún dominio escrito a mano.
**When to use:** Siempre, porque `loopsgrowth.com` no está resuelto.
**Trade-offs:** Ninguno relevante. Es lo que permite "cambiar el dominio = cambiar una variable".

---

## Design Tokens

### Colores y contraste (calculado, WCAG 2.x, relación de contraste)

Las cuatro marcas más el blanco. **Valores medidos** con la fórmula de luminancia relativa (script reproducible en `scripts/check-contrast.mjs`).

| Texto / elemento | Fondo | Ratio | Veredicto (A11Y.md: texto 4.5:1, UI y gráficos 3:1) |
|------------------|-------|-------|------------------------------------------------------|
| Blanco | Purple `#73187F` | **9.69** | Cumple. Fondo de sección oscura |
| Dark `#212121` | Blanco | **16.10** | Cumple. Cuerpo de texto |
| Dark | Yellow `#ffc602` | **10.22** | Cumple. Botón amarillo con texto oscuro |
| Yellow | Purple | **6.15** | Cumple. Acentos y enlaces sobre morado |
| Yellow | Dark | **10.22** | Cumple |
| Dark | Orange `#fd6938` | **5.56** | Cumple. Botón naranja con texto oscuro |
| Orange | Dark | **5.56** | Cumple. Acento naranja solo sobre oscuro |
| Purple | Blanco | **9.69** | Cumple. Enlaces y titulares sobre claro |
| Orange | Purple | 3.35 | Solo texto grande (24 px, o 18.66 px en negrita), UI y gráficos |
| **Blanco** | **Orange** | **2.89** | **FALLA.** Nunca texto blanco sobre naranja |
| **Orange** | **Blanco** | **2.89** | **FALLA.** Nunca texto naranja sobre claro (solo decoración) |
| Blanco | Yellow | 1.58 | **FALLA** |
| Purple | Dark | 1.66 | **FALLA.** No colocar morado sobre oscuro |

Reglas derivadas (van a `A11Y-DECISIONS.md`):

1. **El botón CTA usa texto `#212121`**, sobre naranja o amarillo. El botón "blanco sobre naranja" que casi cualquier diseñador pop dibujaría falla WCAG.
2. **Naranja como texto solo sobre fondo oscuro** (5.56:1). Sobre claro, el naranja es color de relleno, sombra o ilustración.
3. **Anillo de foco de 3 px** con desplazamiento (2 px o más de grosor y 3:1 según A11Y.md): morado sobre claro, amarillo sobre morado y oscuro.
4. Estados no dependen solo del color (ícono o texto más color).
5. Los neutrales adicionales (gris de texto secundario, fondos claros) **no están en el brief**: se derivan y se validan con el mismo script antes de usarse. No inventar un "crema" de marca sin aprobación.

### Tipografía: Hurme Geometric Sans 3

- **Licencia (riesgo real, MEDIA).** Hurme Geometric Sans 3 es una fuente comercial que MyFonts y Fontspring venden con licencias separadas de escritorio y web (WebFont). El brandbook de Eleven probablemente entregó licencia de escritorio. Los sitios de "descarga gratuita" que aparecen en buscadores son distribuciones no autorizadas y no deben usarse. **Acción para Ari o Juan:** confirmar que existe licencia web (o comprarla; los W03 son la versión web). Mientras tanto, `src/assets/fonts/` va en `.gitignore` y el sitio local se valida con fallbacks.
- **Pesos a cargar:** solo 400 y 700 (el brandbook pide "Loopsgrowth" en Bold grande). Un tercero (600) solo si el diseño lo justifica. Subconjunto latino con acentos y signos españoles (`¿¡ñáéíóúü`).
- **Formato y carga:** `woff2` autoalojado, `font-display: swap`, precargar solo el 700 del H1 y el 400 del cuerpo.
- **Fallbacks con ajuste de métricas.** Objetivo: CLS de fuente cercano a 0.

```css
--font-sans: "Hurme Geometric Sans 3", "Avenir Next", Avenir, "Segoe UI", system-ui,
             -apple-system, Roboto, "Helvetica Neue", Arial, sans-serif;
```

  - **Astro 6:** la Fonts API es estable desde 6.0. Se declara con `fontProviders.local()` y `variants`; `<Font cssVariable="--font-hurme" preload />` en el head. Con `fallbacks: ["sans-serif"]` (valor por defecto) Astro genera automáticamente un fallback ajustado por métricas (`optimizedFallbacks: true` por defecto). Fuente: documentación oficial (Context7, MEDIA).
  - **WordPress + Astra:** Astra Free solo aloja localmente Google Fonts; una fuente propia se sirve con `@font-face` en el tema hijo (o con el módulo de fuentes personalizadas de Astra Pro / plugin Custom Fonts). El fallback ajustado se hace a mano con `size-adjust` y `ascent-override` (herramienta: Capsize o fontaine), (MEDIA).

### Escala tipográfica (fluida, en `rem`, para que el zoom 200% funcione)

```css
--text-sm:   clamp(0.875rem, 0.85rem + 0.10vw, 0.9375rem);  /* piso 14px; A11Y.md pide >= 12px */
--text-base: clamp(1rem,     0.96rem + 0.20vw, 1.125rem);   /* cuerpo >= 16px */
--text-lg:   clamp(1.125rem, 1.05rem + 0.40vw, 1.375rem);
--text-xl:   clamp(1.375rem, 1.20rem + 0.90vw, 1.875rem);   /* h3 */
--text-2xl:  clamp(1.75rem,  1.40rem + 1.70vw, 2.75rem);    /* h2 */
--text-3xl:  clamp(2.25rem,  1.60rem + 3.00vw, 4rem);       /* h1 hero */
--leading-body: 1.6;      /* A11Y.md: >= 1.5 */
--leading-heading: 1.12;
--measure: 65ch;          /* A11Y.md: <= 80ch */
```

Ratio aproximado 1.25 en móvil y 1.33 en escritorio. Es un punto de partida; el ajuste fino lo hace la skill `impeccable` durante el diseño.

### Espaciado, forma y movimiento

```css
/* base 4px */
--space-1: 0.25rem; --space-2: 0.5rem; --space-3: 0.75rem; --space-4: 1rem;
--space-6: 1.5rem;  --space-8: 2rem;   --space-12: 3rem;   --space-16: 4rem; --space-24: 6rem;
--section-y: clamp(4rem, 3rem + 5vw, 8rem);
--container: 72rem;  --gutter: clamp(1rem, 4vw, 2rem);
--radius-s: 0.5rem;  --radius-m: 1rem;  --radius-pill: 999px;
--border-pop: 3px solid var(--brand-dark);
--shadow-pop: 4px 4px 0 var(--brand-dark);      /* sombra dura estilo collage */
--target-min: 2.75rem;                          /* 44px; el piso WCAG es 24px */
--ease-out: cubic-bezier(.2,.7,.2,1);  --dur-1: 150ms;  --dur-2: 300ms;
@media (prefers-reduced-motion: reduce) { :root { --dur-1: 0ms; --dur-2: 0ms; } }
```

Diseño móvil primero desde **320 px** (prueba de reflow de A11Y.md), con `container queries` para tarjetas y dos puntos de quiebre globales (`40em`, `64em`). Sin carruseles ni marquesinas automáticas (A11Y.md 2.2.2).

Los tokens viven en un CSS plano para que **ambos stacks los consuman idénticos**: en Astro se importa en el layout; en WP se encola desde `functions.php` (Astra expone sus colores globales como `--ast-global-color-N`; se mapean a los tokens en lugar de reemplazarlos, MEDIA).

---

## Content Layer (edición por Ari)

| Opción | Cómo edita Ari | Qué garantiza | Cuándo |
|--------|----------------|---------------|--------|
| **A. YAML en repo (recomendada para Astro)** | Abre un archivo, cambia texto. En GitHub web puede editar sin terminal | Esquema Zod, lint de copy, historial en Git | Hoy |
| B. CMS sobre Git (Pages CMS o Decap CMS) | Formulario web que escribe el mismo YAML | Lo mismo que A, sin abrir archivos | Después, solo si Ari lo pide (no verificado en detalle, BAJA) |
| C. wp-admin (WordPress) | Editor de bloques o campos ACF | Edición nativa, sin Git | Si se elige WP. Sin esquema ni lint; el copy vive en la BD |

Reglas del layer (aplican a cualquier opción):

1. **Ningún texto visible fuera de `landing.es.yaml`.** Incluye `aria-label`, `alt`, `title` del iframe y textos del botón.
2. **Un solo lugar por dato repetido:** `cta.label`, `cta.duracion_minutos`, `form.url`, nombre y descripción de la marca. Así 20 vs 30 min se decide una vez.
3. **Afirmaciones con `status`:** `verified | pending`. Las que vienen con `[VERIFICAR]` en el doc nacen `pending`; en desarrollo se marcan visualmente, y `lint-copy` **falla el build de producción** si queda alguna. Esto implementa la regla del proyecto "no publicar afirmaciones sin verificar".
4. **`lint-copy.mjs` (barato y de alto valor):** falla con `[VERIFICAR]` en producción, voseo (`tenés`, `agendá`, `vos`, `querés`), guiones largos y medios (em/en dash) y la palabra "AEO" (terminología unificada a SEO/GEO hasta que Ari decida otra).
5. **Sin HTML en el YAML.** Énfasis con `**negrita**`, renderizado por un helper `Rich` que escapa todo lo demás. Evita `set:html` con contenido editable.
6. **Clave superior = idioma** (`es:`). La versión en inglés está fuera de alcance, pero añadir `en:` después es solo datos, sin refactor.

---

## Componente ClickUp iframe

### Hechos verificados (observación directa el 2026-09-18, ALTA)

- La URL del formulario responde **HTTP 200 sin `X-Frame-Options` y sin `Content-Security-Policy: frame-ancestors`**, así que se puede incrustar desde `localhost`, desde una IP de red local y desde el dominio futuro sin configuración.
- Responde con `x-robots-tag: noindex, nofollow`. El contenido del formulario **no aporta nada a SEO**; todo el texto indexable debe estar en la landing.
- El código de embed oficial de ClickUp usa `class="clickup-embed clickup-dynamic-height"` más `<script async src="https://app-cdn.clickup.com/assets/js/forms-embed/v1.js">`. Ese script (25 KB) es el **host de iframe-resizer 4.2.8** y al ejecutarse hace `iFrameResize({}, '.clickup-embed.clickup-dynamic-height')`, luego `iframe.parentElement.style.overflow = 'auto'`. Implicaciones: (a) el iframe debe existir en el DOM cuando el script corre; (b) el contenedor del iframe queda con `overflow:auto` inline (riesgo de región con scroll que no recibe foco por teclado).
- El bundle del formulario incluye el lado hijo de iframe-resizer: envía a la página mensajes `postMessage` con el formato `[iFrameSizer]<id>:<alto>:<ancho>:<tipo>` y `[iFrameResizerChild]Ready`. **No hay un evento de "formulario enviado" documentado ni presente** en lo inspeccionado (solo un `close-modal` de otro flujo).
- El JS principal del formulario pesa ~220 KB comprimido (medido); es la razón principal para cargarlo de forma diferida.

### Comportamiento conocido de ClickUp (MEDIA, fuentes web cruzadas)

- La redirección posterior al envío existe en planes Business Plus o superiores, pero **no funciona cuando el formulario está incrustado** (solicitud abierta en el feedback de ClickUp desde 2021, con 72 votos).
- Los campos personalizados marcados como ocultos (Texto, Email, URL, Número, Dropdown, Prioridad) se llenan agregando parámetros a la URL, por ejemplo `?utm_source=evento`. Los nombres son sensibles a mayúsculas y deben coincidir con la etiqueta del campo. Esto habilita el **paso de UTM al formulario** (requiere que Ari cree los campos ocultos en ClickUp).

### Diseño del componente `ClickUpFormEmbed`

```astro
---
// src/components/form/ClickUpFormEmbed.astro
const { form, heading, intro } = Astro.props;   // todo viene del contenido
---
<section id="agenda" class="section" data-tone="dark" aria-labelledby="agenda-title">
  <div class="container">
    <h2 id="agenda-title" tabindex="-1">{heading}</h2>
    <p>{intro}</p>

    <div class="form-embed" data-form-embed>
      <iframe
        class="clickup-embed clickup-dynamic-height"
        src={form.url}
        title={form.title}
        width="100%" height="900"
        loading="lazy"
        referrerpolicy="strict-origin-when-cross-origin"
        style="background:transparent;border:0"></iframe>
      <p role="status" class="form-embed__status" hidden>
        El formulario está tardando en cargar. Puedes abrirlo directamente con el enlace de abajo.
      </p>
      <p class="form-embed__fallback">
        <a href={form.url} target="_blank" rel="noopener">
          {form.fallback_label}<span class="sr-only"> (se abre en una pestaña nueva)</span>
        </a>
      </p>
    </div>
    <noscript><p><a href={form.url}>{form.fallback_label}</a></p></noscript>
  </div>
</section>
```

| Aspecto | Decisión | Razón |
|---------|----------|-------|
| **Ancla** | `id="agenda"` en la `<section>`; todos los CTAs `href="#agenda"`; `scroll-margin-top` = alto del header sticky | Un solo destino, sin JS |
| **Foco** | Al llegar a `#agenda` (clic o `hashchange`), `cta-focus.ts` mueve el foco al `h2` con `tabindex="-1"` y `preventScroll: true` | Sin esto, quien usa teclado o lector de pantalla queda anclado en el CTA anterior. Un salto de ancla no mueve el foco a un elemento no focusable |
| **Scroll suave** | Solo dentro de `@media (prefers-reduced-motion: no-preference)` | A11Y.md: movimiento reducido |
| **Nombre accesible** | `title` obligatorio en el `<iframe>` (viene del contenido) | Sin `title` el iframe es anónimo para lectores de pantalla |
| **Altura** | `height="900"` + `min-height` en CSS como base; el resizer de ClickUp la ajusta luego. Móvil: el mismo iframe a `width:100%`, el formulario es responsivo por su cuenta | Reserva espacio (sin CLS relevante) y sirve de base si el script falla |
| **Overflow** | CSS `.form-embed { overflow: visible !important; }` para vencer el `overflow:auto` inline que pone el script | Evita una región de scroll anidada sin foco por teclado |
| **Carga** | `loading="lazy"` nativo + la isla `form-embed.ts` inyecta el `<script>` de ClickUp con `IntersectionObserver` a ~1500 px y pre-calienta (`preconnect`) en `pointerenter`/`focusin` sobre un CTA | El form no penaliza LCP/INP del primer pintado, pero está listo cuando el visitante llega |
| **Fallback (3 capas)** | (1) Enlace **siempre visible** bajo el iframe, `target="_blank" rel="noopener"` con aviso "se abre en una pestaña nueva". (2) `<noscript>`. (3) Temporizador de 8 s tras la carga del iframe que muestra el mensaje `role="status"` | El evento `load` se dispara incluso si el iframe muestra un error, así que no se puede depender de detectar fallas. Un enlace permanente es el único fallback fiable |
| **A11y del contenido del iframe** | Fuera de nuestro control (formulario de ClickUp). Se registra en `EXCEPTIONS.md` como dependencia de terceros con el enlace de respaldo como mitigación | A11Y.md exige documentar desvíos |
| **CSP futura** | `frame-src https://forms.clickup.com; script-src ... https://app-cdn.clickup.com` | Se define al hacer deploy |

Pendiente de definir con Ari (afecta la arquitectura del embudo): **canal alternativo si el formulario falla** (correo o WhatsApp) para no perder el lead, y **branding del propio formulario en ClickUp** (portada, colores, logo si el plan lo permite; no verificado, BAJA).

---

## Medición y tracking

### Qué se puede medir y qué no (por el iframe de origen cruzado)

La página no puede leer nada del interior de `forms.clickup.com` (política de mismo origen). Consecuencia directa para el evento de conversión:

| Señal | ¿Posible? | Cómo | Fiabilidad |
|-------|-----------|------|------------|
| Clic en cualquier CTA | Sí | Listener delegado sobre `[data-cta]` | Exacta |
| Formulario visto | Sí | `IntersectionObserver` sobre `.form-embed` (>= 50%), una vez | Exacta |
| Interacción iniciada (`form_start`) | Aproximada | `window.blur` + `document.activeElement === iframe` | Media. Heurística conocida; no dispara si el usuario ya tenía foco allí |
| **Envío del formulario** | **No directamente** | Ver opciones abajo | Ninguna es exacta sin trabajo extra |

Opciones para la señal de envío, de menor a mayor esfuerzo:

1. **Fuente de verdad en ClickUp (hoy).** El KPI del proyecto ("formularios enviados") ya se cuenta en la Lista de ClickUp. En GA4 solo se miden clics y embudo previo; la tasa real se calcula conciliando `cta_click`/`form_start` con las tareas creadas. Es suficiente para el evento de la próxima semana.
2. **Heurística por altura (`form_submit_probable`).** La página puede escuchar, con verificación estricta de `event.origin === 'https://forms.clickup.com'`, los mensajes `[iFrameSizer]` y detectar el cambio de altura al pasar a la pantalla de confirmación. **Frágil** (BAJA hasta validar con envíos de prueba). Nunca marcarla como evento clave; solo como señal auxiliar. Requiere un spike de 30 minutos: enviar una prueba con `console.log` de todos los mensajes.
3. **Server-side (después).** Automatización de ClickUp "tarea creada en Lista" que llama a un webhook, y de ahí a GA4 Measurement Protocol con `generate_lead`. Requiere que el plan de ClickUp permita el webhook en Automatizaciones (**no verificado**, BAJA) y pasar el `client_id` de GA como campo oculto.
4. **Redirect a página de gracias:** descartado en el iframe (no funciona incrustado, ver arriba).

Recomendación: opciones 1 hoy, 2 como spike opcional, 3 solo si hace falta atribución de pago. `generate_lead` es el evento recomendado de GA4 (con `currency` y `value` opcionales) y debe dispararse **solo cuando exista una señal fiable**; lanzarlo en el `form_start` inflaría la conversión.

### Contrato de eventos

| Evento | Cuándo | Parámetros | Clave (key event) |
|--------|--------|------------|-------------------|
| `cta_click` | Clic en un `[data-cta]` | `cta_location` (`header`, `hero`, `solucion`, `casos`, `como-funciona`, `final`), `cta_text` | No |
| `form_view` | El contenedor del formulario entra 50% en pantalla | ninguno | No |
| `form_start` | Primera interacción dentro del iframe (heurística) | ninguno | No |
| `form_submit_probable` | Solo si se implementa la opción 2 | `signal: 'iframe_height'` | No |
| `generate_lead` | Solo con señal fiable (opción 3) | `currency`, `value`, `lead_source` | **Sí** |

### UTM

1. **Captura:** `utm.ts` lee `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term` (allowlist estricta, valores recortados a 100 caracteres y saneados) y los guarda en `sessionStorage`. GA4 los atribuye por su cuenta; el código propio solo sirve para el paso al formulario.
2. **Paso a ClickUp:** la isla del embed reescribe el `src` del iframe (antes de que cargue, gracias a `loading="lazy"`) agregando los parámetros presentes. Sin JS, el iframe carga sin parámetros y el formulario sigue funcionando. Los campos ocultos correspondientes (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`) los crea Ari en ClickUp (paso manual).
3. **Uso práctico para el evento:** el QR apunta a `/?utm_source=evento&utm_medium=qr&utm_campaign=<nombre-del-evento>`. Cada tarea de ClickUp queda con su origen, sin GA4.
4. **Consentimiento:** GA4 se carga solo si `PUBLIC_GA_ID` existe y después del evento `load` con `requestIdleCallback`. Si se espera tráfico de la UE/EEE/Reino Unido/Suiza, se necesita banner y Consent Mode v2 (obligación de Google en esas regiones; en Latinoamérica no es obligatoria pero es la práctica habitual, MEDIA). **Decisión pendiente de Ari/Juan**, no bloquea el local.

---

## SEO Layer

| Elemento | Decisión | Fuente del dato |
|----------|----------|-----------------|
| `<html lang="es">` | Fijo | Config |
| `<title>` | Único, lo más específico primero (A11Y.md), 50 a 60 caracteres. Ej.: `SEO y GEO para e-commerce: aparece en Google y ChatGPT \| Loops Growth` | `seo.title` |
| Meta description | 140 a 160 caracteres, con propuesta de valor y CTA implícito | `seo.description` |
| Canonical | Absoluto, `PUBLIC_SITE_URL + '/'` | `site` (env) |
| Robots meta | `index,follow` solo si `PUBLIC_ENV=production`; `noindex,nofollow` en local y preview | env |
| Open Graph / Twitter | `og:type=website`, `og:title`, `og:description`, `og:url`, `og:image` (1200x630, con `width`/`height`/`alt`), `og:locale=es_LA`, `twitter:card=summary_large_image` | contenido + `public/og-default.png` |
| Headings | Un `h1` (hero); `h2` por sección; `h3` en tarjetas. Sin saltos de nivel | Componentes |
| Imágenes | Decorativas con `alt=""` (decisión humana registrada); resto con `alt` descriptivo; siempre `width`/`height` | Contenido |
| JSON-LD | Un solo bloque `@graph` (abajo) | Generado desde el contenido |
| `sitemap.xml` | Una URL. `@astrojs/sitemap` requiere `site` en `astro.config.mjs` (o un archivo estático de una URL) | env |
| `robots.txt` | Endpoint `src/pages/robots.txt.ts` (patrón de la doc de Astro) que apunta al sitemap con el `site` real | env |
| `llms.txt` | Endpoint generado desde el contenido, prioridad **baja** | contenido |
| Favicon / manifest | SVG + PNG 180 + `site.webmanifest`; `theme-color` = morado | Brand |
| Verificación de buscadores | Metas de Search Console y Bing Webmaster **después** del dominio | Deploy |

### JSON-LD recomendado

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Organization", "ProfessionalService"],
      "@id": "{SITE}/#organization",
      "name": "Loops Growth",
      "url": "{SITE}/",
      "logo": "{SITE}/logo.png",
      "description": "Agencia de SEO y GEO para e-commerce y negocios con presupuesto de marketing serio.",
      "serviceType": ["SEO", "GEO (optimización para búsqueda con IA)"],
      "knowsAbout": ["SEO técnico", "GEO", "Google", "ChatGPT", "Gemini"],
      "founder": { "@type": "Person", "name": "Arianna Lupi" },
      "sameAs": ["<solo perfiles confirmados por Ari>"]
    },
    { "@type": "WebSite", "@id": "{SITE}/#website", "url": "{SITE}/", "name": "Loops Growth", "inLanguage": "es", "publisher": { "@id": "{SITE}/#organization" } },
    { "@type": "WebPage", "@id": "{SITE}/#webpage", "url": "{SITE}/", "name": "<seo.title>", "isPartOf": { "@id": "{SITE}/#website" }, "about": { "@id": "{SITE}/#organization" }, "inLanguage": "es" }
  ]
}
```

Decisiones de schema:

- **Organization + ProfessionalService:** incluir. `ProfessionalService` es un tipo válido de schema.org (subtipo de `LocalBusiness`). **No inventar `address`, teléfono ni horarios**; si no hay dirección pública, se omiten. No hay resultados enriquecidos en juego: el valor es semántico para motores y LLMs.
- **FAQPage: omitir.** El Copy v2 no tiene sección de preguntas frecuentes (marcar contenido que no existe en la página viola las directrices de Google) y, además, Google **retiró el resultado enriquecido de FAQ**: su propia documentación indica que deja de aparecer desde el 7 de mayo de 2026 y ya no recomienda el marcado para Search (verificado directamente en la documentación de Google Search Central, ALTA). Si más adelante se añade un FAQ real, el marcado solo sirve a Bing y a rastreadores de IA (BAJA).
- **Sin `Review`, `AggregateRating` ni `Testimonial` falsos** para las tarjetas de casos: son métricas de negocio, no reseñas de terceros.
- Persona por cada miembro del equipo: solo si Ari lo aprueba (datos personales); por defecto solo el fundador.
- Validación en QA con el Rich Results Test/validador de schema.org (la parte de FAQ ya no existe en la herramienta).

### llms.txt (prioridad baja, por honestidad)

Google (Gary Illyes, julio de 2025) dijo que no lo usa ni lo planea, y estudios de 2026 muestran adopción baja por parte de los rastreadores de IA (MEDIA, fuentes secundarias cruzadas). Aun así cuesta 15 minutos generarlo desde el contenido y tiene valor de coherencia de marca para una agencia GEO. **Se hace al final; no debe desplazar nada de rendimiento ni de accesibilidad.** En `robots.txt` de producción se recomienda permitir explícitamente a los rastreadores de búsqueda con IA (OAI-SearchBot, PerplexityBot, ClaudeBot, Googlebot) porque la propuesta de valor es aparecer en ellos.

### Equivalente WordPress

Rank Math Pro (ya usado por Juan) cubre title, meta, canonical, OG, sitemap, robots y schema (incluido Organization/ProfessionalService) sin código. Se conserva un archivo `llms.txt` estático en la raíz. Riesgo: valida a mano que el schema no genere `FAQPage` ni `Review` automáticos y que el tema no duplique metas.

---

## Presupuesto de rendimiento

Objetivos medidos en móvil (perfil Lighthouse móvil, 4G lento) y, tras el deploy, en campo (percentil 75).

| Métrica | Umbral "bueno" (Google) | Meta del proyecto |
|---------|-------------------------|-------------------|
| LCP | <= 2.5 s | **<= 1.8 s** (el LCP es el H1, texto, no una imagen) |
| INP | <= 200 ms | **<= 100 ms** |
| CLS | <= 0.1 | **~0** (fuente con fallback ajustado, dimensiones explícitas, altura reservada del iframe) |
| TTFB (CDN estático) | n/a | <= 200 ms |
| Lighthouse móvil | n/a | Performance >= 95, Accessibility 100, Best Practices >= 95, SEO 100 |

| Recurso (comprimido, primera carga, sin el iframe) | Presupuesto |
|-----------------------------------------------------|-------------|
| HTML | <= 40 KB |
| CSS | <= 25 KB (Astro inlina hojas pequeñas por defecto) |
| JS propio | <= 10 KB (objetivo < 5 KB) |
| Fuentes | <= 2 archivos precargados, <= 35 KB c/u; total <= 100 KB |
| Imágenes sobre el pliegue | <= 100 KB (SVG o AVIF; sin foto de hero) |
| **Peso total inicial** | **<= 350 KB** |
| Terceros diferidos | gtag (tras `load`+idle, solo con ID); ClickUp (~25 KB script + ~220 KB+ del form) solo cuando el formulario está cerca del viewport |

Tácticas: sin carruseles ni librerías de animación (CSS con `transform`/`opacity`); SVG inline para el collage; `preconnect` a `forms.clickup.com` solo por intención; sin heatmaps ni chat widgets; medición con `scripts/budget.mjs` (pesos de `dist/`) y Lighthouse en QA.

**WordPress + Astra:** Astra en sí es liviano (bien puntuado en pruebas de terceros, MEDIA), pero el presupuesto exige: sin Elementor/page builder en esta página (su DOM anidado y su CSS/JS suman decenas de KB y dificultan el control estricto de accesibilidad), plugin de caché, desactivar emojis/embeds/jQuery Migrate y encolar solo los tokens. Comparativas independientes sitúan a Astro por delante de WordPress en LCP y en porcentaje de dominios que aprueban Core Web Vitals (BAJA en las cifras exactas, por ser fuentes de blogs comerciales), pero el punto arquitectónico no depende de esas cifras: HTML estático sin JS necesario es el camino más corto al presupuesto.

---

## Entorno local y pipeline de deploy

### Local HOY (verificado en esta máquina)

| Herramienta | Estado | Consecuencia |
|-------------|--------|--------------|
| Node | v24.13.0 (Astro 6 exige >= 22.12.0) | Astro corre sin instalar nada |
| npm 11.6.2 | Instalado | Usar npm. `pnpm` intentó descargar su propia versión vía corepack (necesita red y confirmación) |
| PHP / WP-CLI | No instalados | WordPress local requiere instalar entorno |
| Local (LocalWP), MAMP | No instalados | Instalación manual de una app GUI |
| Docker | CLI de OrbStack presente; daemon no verificado | `wp-env` o `docker compose` posibles, pero más pasos |

**Astro:** `npm create astro@latest` (plantilla mínima) → `npm run dev` en `http://localhost:4321`; `npm run dev -- --host` expone la URL de la red local para revisar en un celular real y para que Ari y Camila la abran desde su equipo sin desplegar. Scripts: `dev`, `build`, `preview`, `check` (tipos + `lint-copy` + `check-contrast`), `test:a11y`, `lighthouse`.

**WordPress + Astra:** instalar LocalWP o levantar `wp-env`/Docker, WordPress, tema Astra, tema hijo, Rank Math; el contenido y la configuración viven en la base de datos, así que hay que exportarlos (`wp db export`, WXR) para no perder trabajo. Estimación realista: 1 a 2 horas hasta la primera sección visible, contra ~10 minutos en Astro. **Para el requisito "corriendo en local hoy" es un riesgo real de calendario**, aunque no imposible.

### Deploy más adelante (fuera de alcance hoy; el diseño lo prepara)

**Astro (estático):**

```
git push ─► CI: npm ci → lint-copy → astro check → astro build
          → axe (Playwright sobre preview) → budget.mjs → Lighthouse CI
          ─► Cloudflare Pages / Netlify / Vercel (deploy de dist/)
              ├─ Preview URL por rama/PR  → revisión de Ari y Camila
              └─ Producción → loopsgrowth.com
```

- Variables: `PUBLIC_SITE_URL`, `PUBLIC_ENV=production`, `PUBLIC_GA_ID`.
- Al llegar el dominio: registrarlo, apuntar DNS al host, cambiar `PUBLIC_SITE_URL`, verificar en Search Console/Bing, redirección `www` a apex, HTTPS/HSTS, archivo `_headers` con CSP (`frame-src` de ClickUp) y caché inmutable para los assets con hash.
- Mientras no haya dominio, `PUBLIC_ENV=preview` mantiene `noindex`. Regla: **nunca `Disallow` + `noindex` a la vez** (Google no vería el `noindex`); en preview basta el `noindex` por meta y encabezado o autenticación básica.

**WordPress:** requiere hosting con PHP y base de datos, migración (Duplicator/All-in-One WP Migration o `wp search-replace` de la URL local), plugin de caché, y **desmarcar "Disuadir a los motores de búsqueda"** (Local y muchos hostings lo dejan activo, error clásico). Sin pipeline; las ediciones son en caliente en producción, lo cual es cómodo para Ari y arriesgado para la regla "proteger lo que ya funciona".

---

## Mapa por stack (misma arquitectura, dos implementaciones)

| Capa | Astro (estático) | WordPress + Astra |
|------|------------------|-------------------|
| Fuente de copy | `landing.es.yaml` + Zod + lint | Página Inicio en wp-admin (bloques/patrones) o ACF Pro |
| Secciones | 10 componentes `.astro` | 10 `template-parts` PHP o patrones de bloques en tema hijo |
| Tokens | `tokens.css` importado en Base | El mismo `tokens.css` encolado; mapeo a `--ast-global-color-N` |
| Fuentes | Fonts API (`fontProviders.local()`, fallback ajustado automático) | `@font-face` en tema hijo (o Astra Pro), fallback ajustado a mano |
| Foco y a11y | Control total del HTML | Control total solo con tema hijo; con Elementor se pierde |
| FormEmbed | Componente + isla de 2 KB | Bloque HTML personalizado / shortcode del tema hijo |
| SEO | `BaseHead` + `jsonld.ts` + endpoints | Rank Math Pro |
| Sitemap / robots | `@astrojs/sitemap` + `robots.txt.ts` | Rank Math Pro |
| Tracking | `tracking.ts` | `tracking.js` encolado (o plugin Site Kit, más pesado) |
| Guardas (lint, contraste, budget) | Scripts de Node en `npm run check` | Solo manual o pipeline aparte |
| Deploy | Hosting estático + previews por PR | Hosting PHP + migración |
| Edición por Ari | YAML (o CMS sobre Git después) | wp-admin nativo |

**Lectura arquitectónica (no sustituye a STACK.md):** los requisitos que este documento considera de mayor peso (copy en una sola fuente validada, presupuesto de rendimiento, control estricto de accesibilidad, salida a local en minutos) los satisface Astro con menor riesgo. WordPress + Astra gana en un solo eje: edición autónoma de Ari sin tocar archivos. Si se elige WP, la arquitectura sigue en pie, pero conviene un tema hijo sin page builder para no perder control de HTML y peso.

---

## Data Flow

### Embudo y flujo de datos (dirección explícita)

```
[Evento: QR con ?utm_source=evento&utm_medium=qr&utm_campaign=<x>]   (paso 1)
    │
    ▼
[CDN/servidor local] ── HTML estático completo (copy, JSON-LD, sin JS necesario)
    │
    ▼
[Navegador]
    ├─ utm.ts: guarda UTM en sessionStorage
    ├─ CTA clic ──► dataLayer.push(cta_click) ──► gtag ──► GA4        (unidireccional)
    ├─ ancla #agenda ──► cta-focus.ts mueve el foco al h2
    └─ FormEmbed (near viewport):
         ├─ src del iframe += ?utm_*  (hacia campos ocultos de ClickUp)
         ├─ inyecta v1.js (iframe-resizer host)
         └─ escucha postMessage de forms.clickup.com (solo alto/Ready)
    │
    ▼  el visitante llena y envía el formulario (paso 2)
[ClickUp Form (origen cruzado)] ── submit ──► [Lista de ClickUp: tarea + campos utm_*]
    │                                                   │  (FUENTE DE VERDAD DE LA CONVERSIÓN)
    │                                                   ▼
    │                                         [Ari y Camila revisan]
    │                                                   ▼
    │                                         Llamada de pre-calificación (paso 3, jueves/viernes)
    │                                                   ▼
    │                                         Cotización (paso 4) ► Llamada de cierre (paso 5)
    └─ La página NO recibe confirmación del envío (límite de origen cruzado)
```

### Flujo de build (contenido)

```
landing.es.yaml ──► Zod (falla si falta o sobra un campo)
      │
      ├─► lint-copy (falla en producción si hay [VERIFICAR], voseo, em/en dash, "AEO")
      ├─► secciones (props) ──► HTML
      ├─► jsonld.ts ──► <script type="application/ld+json">
      ├─► BaseHead ──► title / meta / OG
      └─► llms.txt.ts
PUBLIC_SITE_URL / PUBLIC_ENV ──► canonical, og:url, sitemap, robots, noindex
```

### Key Data Flows

1. **Copy a pantalla:** unidireccional y en build. No hay fetch en cliente.
2. **Interacción a analítica:** unidireccional (DOM a `dataLayer` a GA4). Ninguna sección conoce a GA4.
3. **Página a ClickUp:** solo el `src` del iframe (UTM). **ClickUp a página:** solo mensajes de tamaño; nunca datos del lead.
4. **Lead:** vive únicamente en ClickUp. La landing no almacena datos personales (simplifica privacidad y seguridad).

---

## Scaling Considerations

Este es un activo de captación de una página; "escalar" significa crecer en alcance, no en tráfico.

| Escala | Ajustes de arquitectura |
|--------|-------------------------|
| Evento (decenas a cientos de visitas) | Estático en CDN. Nada más |
| Campañas (miles de visitas/mes) | Igual. Añadir Search Console, CrUX y revisión mensual de CWV. Considerar señal server-side de conversión |
| Crecimiento de producto | Versión en inglés: añadir `en:` al YAML y una ruta `/en/` con `hreflang`. Blog/casos completos: colección `glob()` de Markdown. Página About completa: nueva ruta reutilizando `SectionShell` |

### Scaling Priorities

1. **Primer cuello de botella real:** la atribución (no el tráfico). Sin señal de envío, la tasa de conversión se calcula a mano.
2. **Segundo:** edición de contenido por no técnicos. Ahí entra un CMS sobre Git o el cambio a WordPress.

---

## Anti-Patterns

### Anti-Pattern 1: Texto blanco sobre el botón naranja

**What people do:** Aplicar el patrón "botón naranja con texto blanco" por estética pop.
**Why it's wrong:** 2.89:1, falla WCAG AA (mínimo 4.5:1). Un sitio que promete excelencia técnica no puede fallar el contraste de su CTA principal.
**Do this instead:** Texto `#212121` sobre naranja (5.56:1) o sobre amarillo (10.22:1).

### Anti-Pattern 2: Tratar `form_start` o el clic como conversión

**What people do:** Marcar como "key event" el primer clic dentro del iframe.
**Why it's wrong:** Infla la conversión y contamina la optimización de campañas.
**Do this instead:** Medir el embudo previo en GA4, contar envíos reales en ClickUp y solo activar `generate_lead` con una señal fiable.

### Anti-Pattern 3: Esperar un redirect de "gracias" con el iframe

**What people do:** Configurar la redirección en ClickUp y contar la página de gracias en GA4.
**Why it's wrong:** La redirección no funciona con el formulario incrustado (solicitud abierta desde 2021).
**Do this instead:** Opciones 1 a 3 de la sección Medición.

### Anti-Pattern 4: Un iframe por CTA o el formulario en el hero

**What people do:** Duplicar el formulario para "acercarlo".
**Why it's wrong:** Duplica un bundle de ~220 KB, rompe LCP/INP y complica la medición.
**Do this instead:** Un iframe, CTAs de ancla, header sticky, foco gestionado.

### Anti-Pattern 5: Copy hardcodeado en componentes y afirmaciones sin verificar

**What people do:** Escribir el texto dentro del JSX/PHP y publicar las cifras "30% a 50%" tal cual.
**Why it's wrong:** Ari no puede editar sin código, y se publican datos que el propio doc marca `[VERIFICAR]`.
**Do this instead:** Un YAML validado, `status: pending` y lint que bloquea producción.

### Anti-Pattern 6: Page builder para "ir rápido" en WordPress

**What people do:** Maquetar la landing en Elementor sobre Astra.
**Why it's wrong:** DOM profundo y CSS/JS extra que dificultan el LCP, el control de foco/landmarks y el pixel-perfect del collage.
**Do this instead:** Tema hijo con `template-parts` propios y tokens compartidos.

### Anti-Pattern 7: FAQPage y reseñas falsas por SEO

**What people do:** Añadir `FAQPage`, `Review` o `AggregateRating` para "ganar rich results".
**Why it's wrong:** El FAQ rich result ya no existe en Google y el marcado de contenido ausente o inventado arriesga acción manual.
**Do this instead:** Organization/ProfessionalService/WebSite/WebPage, con datos reales.

### Anti-Pattern 8: Dominio y `noindex` escritos a mano

**What people do:** Hardcodear `https://loopsgrowth.com` o dejar el sitio de preview indexable.
**Why it's wrong:** Canonicals rotos y contenido duplicado indexado antes del lanzamiento.
**Do this instead:** `PUBLIC_SITE_URL` y `PUBLIC_ENV`; `noindex` por defecto salvo `production`.

### Anti-Pattern 9: Movimiento automático y carruseles

**What people do:** Marquesinas, carruseles o parallax por estilo "pop".
**Why it's wrong:** A11Y.md 2.2.2 y 2.3.3; además cuestan JS.
**Do this instead:** Animaciones CSS breves (menos de 5 s), desactivadas con `prefers-reduced-motion`, y sin contenido que se mueva solo.

---

## Integration Points

### External Services

| Servicio | Patrón de integración | Notas |
|----------|-----------------------|-------|
| ClickUp Forms | `<iframe>` + script `v1.js` (iframe-resizer host) | Sin XFO/frame-ancestors. Sin redirect ni evento de envío. Campos ocultos para UTM (requiere acción de Ari). `noindex` en el form |
| GA4 | `dataLayer` + `gtag.js` diferido, inerte sin `PUBLIC_GA_ID` | `generate_lead` solo con señal fiable. Consentimiento pendiente de decisión |
| Google Search Console / Bing Webmaster | Meta de verificación + sitemap | Después de tener dominio |
| Hosting estático (Cloudflare Pages/Netlify/Vercel) | Deploy de `dist/` + previews | Fuera de alcance hoy |
| Proveedor de fuente (MyFonts/Fontspring) | Licencia web + `woff2` autoalojado | Licencia por confirmar |
| Drive de marca (Eleven) | Origen manual de logo/isotipo | Convertir `.ai` a SVG para nitidez y peso |

### Internal Boundaries

| Frontera | Comunicación | Notas |
|----------|--------------|-------|
| Content ↔ Secciones | Props en build | Sección nunca lee el YAML directamente |
| Secciones ↔ CtaButton | Composición | El CTA existe en un solo componente |
| Secciones ↔ Tracker | Solo atributos `data-*` en el DOM | Sin imports cruzados |
| FormEmbed ↔ ClickUp | `src` (salida) y `postMessage` de tamaño (entrada) | Verificar `event.origin` siempre |
| Tokens ↔ Componentes | Variables CSS semánticas | Componentes no usan colores de marca directos |
| SEO layer ↔ Content | `jsonld.ts`/`BaseHead` leen del mismo contenido | Cero duplicación de descripciones |

---

## Suggested Build Order

Dependencias: **Contenido y tokens** son la base de todo; **FormEmbed** se construye temprano porque es el Core Value ("si todo falla, el formulario debe funcionar"); **SEO y tracking** dependen solo del contenido y del layout, así que corren en paralelo con el diseño de secciones.

```
[0 Scaffold] ─► [1 Contenido + Tokens] ─► [2 Shell + UI] ─┬─► [3 FormEmbed + #agenda]  (Core Value)
                                                          ├─► [4 Secciones 01-09] ─► [5 Pulido de marca/responsive]
                                                          ├─► [6 SEO layer]        (paralelo)
                                                          └─► [7 Tracking]         (paralelo)
                              [3] + [5] + [6] + [7] ─► [8 QA gates] ─► (más adelante) [9 Deploy + dominio]
```

| Fase | Qué se construye | Depende de | Criterio de salida | Estimación |
|------|------------------|------------|--------------------|------------|
| **0. Scaffold** | Repo, Astro mínimo, `.env.example`, carpetas, `lang="es"`, skip link, `main` | Node 22.12+ (ya) | `npm run dev` sirve una página vacía en `localhost:4321` | ~15 min |
| **1. Contenido + tokens** | `landing.es.yaml` con el Copy v2 (con `status: pending` en los `[VERIFICAR]`), esquema Zod, `lint-copy`, `tokens.css`, fuentes con fallback, `check-contrast` | Doc de copy de Ari, Drive de marca | El build valida el YAML; los pares de contraste pasan | ~1 h |
| **2. Shell y UI** | `Base`, Header con CTA, Footer, `SectionShell`, `CtaButton`, `Card`, `MetricCard`, `Rich` | 1 | Un CTA lleva a `#agenda` con foco visible | ~1 h |
| **3. FormEmbed y `#agenda`** | Sección 10, iframe con `title`, fallback de 3 capas, altura, lazy, foco, `overflow` | 2 | Enviar un formulario de prueba desde el local funciona en móvil y escritorio | ~45 min |
| **4. Secciones 01 a 09** | Hero primero, luego Solución, Cómo funciona, Qué incluye, Casos, Quiénes somos, Problema, Por qué ahora, Resultados | 2 | Las 9 secciones renderizan desde el YAML | ~2 a 3 h |
| **5. Pulido de marca y responsive** | Collage (lupas/ojos/clicks), isotipo, sombras pop, 320/400/768/1280, movimiento reducido. Pasa por las skills `impeccable` y `design-taste-frontend` | 4 | Revisión visual de Ari y Camila en local (URL de red) | ~2 h |
| **6. SEO layer** | `BaseHead`, JSON-LD, OG, favicon, `robots.txt.ts`, sitemap, `llms.txt` | 1 y 2 (paralelo a 4) | Validador de schema sin errores; `noindex` activo en local | ~1 h |
| **7. Tracking** | `tracking.ts`, `utm.ts`, paso de UTM al iframe, `form_view`, `form_start`; inerte sin ID | 3 (paralelo a 4) | `dataLayer` recibe los eventos en local; QR de prueba con UTM llena los campos ocultos | ~1 h |
| **8. QA gates** | axe (Playwright), teclado, lector de pantalla, zoom 200% y reflow a 320 px, `prefers-reduced-motion`, Lighthouse móvil, `budget.mjs`, `docs/a11y/*` | 3, 5, 6, 7 | Presupuesto cumplido; `REPORT.md` más nuevo que el último cambio; verificación por alguien distinto de quien escribió el código | ~1 a 2 h |
| **9. Deploy + dominio** *(fuera de alcance hoy)* | Repo remoto, hosting, previews, DNS, CSP, Search Console | 8 y decisión de dominio | `loopsgrowth.com` en HTTPS con `PUBLIC_ENV=production` | después |

Mínimo para "listo hoy": fases 0 a 5 y 8 (sin CI), con 6 reducida a title/meta/OG/JSON-LD (requisito activo) y 7 solo con `cta_click` (o ni eso si no hay ID de GA). Las fases 6 (llms.txt) y 7 (heurística de envío) se recortan primero si falta tiempo.

Ejecutar 3 antes de pulir 4 y 5 reduce el riesgo: el embudo real (landing a formulario de ClickUp) funciona desde la primera hora, y el resto es diseño sobre una base que ya cumple el Core Value.

---

## Decisiones y preguntas abiertas para Ari y Juan

1. **Licencia web de Hurme Geometric Sans 3** (bloquea la fuente definitiva, no el local).
2. **Campos ocultos UTM y `ga_client_id` en el formulario de ClickUp**, y si el plan permite webhooks en Automatizaciones (habilita `generate_lead` server-side).
3. **Duración de la llamada:** 30 min (copy) o 20 min (embudo). Se cambia en `cta.duracion_minutos`.
4. **ID de GA4 y política de consentimiento** (¿se espera tráfico de la UE?).
5. **Canal alternativo si el formulario no carga** (correo o WhatsApp) y qué mostrar.
6. **Neutrales del brandbook** más allá de los cuatro colores (fondos claros, gris secundario) y **logo/isotipo en SVG** (Drive solo lista PNG/JPG y `.ai`).
7. **Terminología final:** "SEO/GEO" o "SEO y AEO".
8. **Dominio** `loopsgrowth.com`: mientras tanto todo depende de `PUBLIC_SITE_URL`.

## Sources

- Documentación oficial de Astro vía Context7 (`/withastro/docs`, MEDIA-ALTA): Fonts API (`fontProviders.local()`, `optimizedFallbacks`, desde v6.0.0), content collections con `file()` y `glob()`, `astro/zod`, `@astrojs/sitemap`, endpoint `robots.txt`, requisito Node >= 22.12.0.
- Observación directa del 2026-09-18 (ALTA): `curl` a la URL del formulario de ClickUp (sin `X-Frame-Options`/`frame-ancestors`, `x-robots-tag: noindex, nofollow`); lectura del script `https://app-cdn.clickup.com/assets/js/forms-embed/v1.js` (iframe-resizer 4.2.8, selector `.clickup-embed.clickup-dynamic-height`, `overflow:auto` en el padre) y del bundle del formulario (`[iFrameSizer]`, `[iFrameResizerChild]Ready`, sin evento de envío); pesos comprimidos medidos.
- Cálculo propio de contraste WCAG (fórmula de luminancia relativa) para los pares de marca.
- Google Search Central, "Mark up FAQs with structured data": [developers.google.com/search/docs/appearance/structured-data/faqpage](https://developers.google.com/search/docs/appearance/structured-data/faqpage) (ALTA): el resultado enriquecido de FAQ deja de aparecer desde el 7 de mayo de 2026.
- ClickUp Feedback, "Enable redirect feature for embedded forms": [feedback.clickup.com/feature-requests/p/enable-redirect-feature-for-embeded-forms](https://feedback.clickup.com/feature-requests/p/enable-redirect-feature-for-embeded-forms) (MEDIA): abierta desde abril de 2021, la redirección no funciona incrustada.
- ClickUp Help, "Hidden Fields in Forms" ([help.clickup.com/hc/en-us/articles/6310247500055-Forms-Hidden-Fields](https://help.clickup.com/hc/en-us/articles/6310247500055-Forms-Hidden-Fields)), resumen vía búsqueda web (MEDIA; la página devolvió 403 a la lectura directa).
- Búsquedas web (BAJA a MEDIA, cruzadas): límites de rastreo de envío en iframes de origen cruzado y patrón `postMessage` (Measure School, Bounteous, Brillmark); `generate_lead` como evento recomendado de GA4 (Google Analytics Help, Stape); posición de Google sobre `llms.txt` y adopción (varios blogs 2026); Consent Mode v2 en EEE y práctica en Latinoamérica; comparativas Astro vs WordPress y reseñas de Astra (blogs comerciales, cifras exactas BAJA).
- Licencias de fuente: fichas de Hurme Geometric Sans 3 en MyFonts y Fontspring (la de Fontspring devolvió 403; conclusión sobre licencias separadas: MEDIA).
- A11Y.md (fecarrico), reglas aplicables: [github.com/fecarrico/A11Y.md/blob/main/docs/en/A11Y.md](https://github.com/fecarrico/A11Y.md/blob/main/docs/en/A11Y.md) (ALTA para umbrales y documentos exigidos).
- Entorno local: `node -v`, `npm -v`, `which docker/php/wp` en la máquina de Juan (ALTA).

---
*Architecture research for: landing B2B de una página (Loops Growth, SEO/GEO)*
*Researched: 2026-09-18*

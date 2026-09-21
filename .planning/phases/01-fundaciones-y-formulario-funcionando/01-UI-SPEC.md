---
phase: "01"
slug: fundaciones-y-formulario-funcionando
status: approved
shadcn_initialized: false
preset: none
created: "2026-09-18"
---

# Phase 01 - UI Design Contract

> Contrato visual y de interacción de la Fase 1 (esqueleto caminable): sitio Astro 7 + Tailwind 4 con el formulario de ClickUp embebido en `#agenda`, tokens de marca protegidos por contraste y base de accesibilidad. Generado por gsd-ui-researcher, verificado por gsd-ui-checker.
>
> Alcance visual de esta fase: skip links, header mínimo, hero provisional (texto real, sin collage), sección `#agenda` con el iframe, foco global. El collage pop, el logo SVG, el footer y las demás secciones son de la Fase 2 y no se especifican aquí.
>
> Fuentes: 01-CONTEXT.md (decisiones bloqueadas), `.claude/CLAUDE.md` (tabla de contraste medida y reglas de A11Y.md), `.planning/research/ARCHITECTURE.md` y `FEATURES.md` (tokens y patrón del embed). Nada de esto se volvió a preguntar; lo no decidido arriba se marca como supuesto en `## Assumptions and Open Items`.
>
> Reglas de proyecto que aplican a la ejecución: todo el trabajo visual pasa por las skills `impeccable` y `design-taste-frontend`, que afinan dentro de este contrato y no pueden romper los pares de contraste aprobados. Todo el texto sale tal cual del doc de Ari, sin humanizar ni reescribir (regla de Juan, 2026-09-18), en español neutro y sin voseo.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none (no hay shadcn ni `components.json`; repo greenfield, componentes `.astro` escritos a mano) |
| Preset | not applicable |
| Component library | none (HTML nativo, cero islas de framework, cero JS de UI) |
| Icon library | none. SVG en línea con `aria-hidden="true"` y `focusable="false"`. En esta fase solo existe un ícono: flecha de enlace externo |
| Font | Outfit (variable, pesos 400, 600 y 700, subsets latin y latin-ext) vía Fonts API con `fontProviders.fontsource()`, consumida solo por `var(--font-brand)`. Cambio a `fontProviders.local()` con Hurme Geometric Sans 3 cuando llegue la licencia web |
| Styling | Tailwind CSS 4.3.3 por `@tailwindcss/vite`. Tokens en `src/styles/tokens.css` con `@theme` |

Notas de fuente:
- `<Font cssVariable="--font-brand" preload />` en el `<head>`. `fallbacks: ['sans-serif']` para conservar el fallback ajustado por métricas.
- Ningún componente escribe el nombre de la fuente. Todo usa `font-family: var(--font-brand)`.
- Los glifos `áéíóúüñ¿¡` se verifican con una captura del navegador real (ver `## Verification Hooks`).

---

## Surface Inventory (Phase 1)

> Sustituye a `Component Inventory`: sin sistema de diseño instalado no hay paquete que enumerar. Esta lista es el contrato de qué se construye, no una afirmación sobre un paquete.

| Surface | Archivo sugerido | Landmark / elemento | Notas |
|---------|------------------|---------------------|-------|
| Base layout | `src/layouts/BaseLayout.astro` | `<html lang="es">`, `<head>`, `<body>` | `<title>` propio, `noindex` fuera de producción, `<Font />`, importa `tokens.css` |
| Skip links | `src/components/SkipLinks.astro` | `<nav aria-label="Saltos de página">` | Dos enlaces, primer elemento enfocable de la página |
| Site header | `src/components/SiteHeader.astro` | `<header>` | Wordmark de texto y CTA (CTA solo desde 640 px) |
| CTA link | `src/components/CtaLink.astro` | `<a href="#agenda">` | Nunca `<button>` ni `div`. Recibe `data-cta="header|hero"` para la Fase 3 |
| Hero (provisional) | `src/components/HeroSkeleton.astro` | `<section aria-labelledby>` con el único `<h1>` | Solo texto. La Fase 2 lo reemplaza (CONT-01) |
| Agenda section | `src/components/AgendaSection.astro` | `<section id="agenda" aria-labelledby="agenda-title">` | Encabezado, intro, enlace de respaldo, tarjeta con iframe, `noscript` |
| Focus script | `src/scripts/cta-focus.ts` (o `<script>` en línea del componente) | n/a | Único JS de la fase (ver `## Interaction Contract`) |

Página: `<body>` contiene `SkipLinks`, `SiteHeader`, `<main id="main">` (Hero, Agenda). Sin `<footer>` en esta fase (CONT-12 es Fase 2).

---

## Spacing Scale

Valores declarados: exactamente el conjunto estándar 4, 8, 16, 24, 32, 48 y 64 px (todos múltiplos de 4). Ningún espaciado de la fase usa un valor fuera de este conjunto; lo que queda fuera son excepciones nombradas abajo. Base 4 px, en `rem` para que el zoom funcione.

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Separación de ícono a texto, ajuste fino |
| sm | 8px | Espacio entre objetivos táctiles adyacentes (mínimo 8 px), distancia del skip link al borde |
| md | 16px | Espaciado por defecto, gutter mínimo (320 px), padding horizontal del header, separación entre párrafos |
| lg | 24px | Padding interno horizontal de botones, separación entre título e intro, `scroll-margin-top` de `#agenda` |
| xl | 32px | Gutter máximo, separación entre bloques de una misma sección |
| 2xl | 48px | Gap entre columnas de `#agenda` (escritorio), padding vertical de sección compacta |
| 3xl | 64px | Padding vertical de sección (hero y `#agenda`) en todos los anchos, de 320 a 1280 px. Es el tope de la escala: no hay un paso mayor |

Contenedor: `max-width: 72rem` (1152 px), centrado, con gutter `clamp(1rem, 4vw, 2rem)` (16 px a 320 px, 32 px como tope). Medida de prosa: `max-width: 65ch` (A11Y.md permite hasta 80ch). Puntos de quiebre globales: `40em` (640 px) y `64em` (1024 px), los `sm` y `lg` por defecto de Tailwind.

Exceptions:
- Objetivo táctil mínimo: `min-h-11` y `min-w-11` (44 px) en todo enlace o botón. CTA principal en `min-h-12` (48 px).
- Borde y contorno: 3 px de grosor de anillo de foco y de borde pop, 2 px de `outline-offset`. No son múltiplos de 4 y no se ajustan (los exige A11Y.md y el estilo pop).
- Efectos visuales, no espaciado: desplazamientos de la sombra pop (2, 4 y 6 px), `translate` de hover y active (2 px) y grosor de subrayado (2 y 3 px). No ocupan espacio en el layout, así que no pertenecen a la escala.
- Alto mínimo del iframe: valor medido en el navegador, redondeado hacia arriba al siguiente múltiplo de 8. No se dicta aquí (ver `## Interaction Contract`).
- Nunca alturas fijas (`h-`) en contenedores de texto: solo `min-h`, para sobrevivir al espaciado de texto de SC 1.4.12.

---

## Typography

Exactamente 4 tamaños y 3 pesos (Regular, SemiBold y Bold, los tres del brandbook). Todo en `rem` con `clamp()`, sin `px` fijos, para que el zoom a 200 % no rompa el layout. Los valores en px son los extremos (a 320 px de ancho y a 1280 px).

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 16px a 18px: `clamp(1rem, 0.96rem + 0.20vw, 1.125rem)` | 400 | 1.6 |
| Label | 14px fijo (`0.875rem`) | 600 | 1.5 |
| Heading (h2) | 28px a 44px: `clamp(1.75rem, 1.40rem + 1.70vw, 2.75rem)` | 700 | 1.2 |
| Display (h1) | 36px a 64px: `clamp(2.25rem, 1.60rem + 3.00vw, 4rem)` | 700 | 1.2 |

Pesos: 400 (Regular), 600 (SemiBold) y 700 (Bold), tal como define el brandbook (fuente de la verdad para estilos, decisión de Juan 2026-09-18). SemiBold es para textos secundarios (tagline, cuadros descriptivos, Label). Títulos y botones se mantienen en Bold 700 (decisión de Juan). No cargar ningún otro peso. La marca pide "Loopsgrowth" en Bold grande.

Uso por rol:
- Display: solo el `<h1>` del hero.
- Heading: el `<h2>` de `#agenda`. La Fase 2 puede agregar un tamaño de `h3` en su propio contrato.
- Body: párrafos, texto de botones y enlaces (700 en botones, 400 en párrafos), wordmark del header (700).
- Label: solo los skip links (SemiBold 600).

Reglas: sin texto justificado (`text-start`), párrafos con `max-width: 65ch`, `overflow-wrap: anywhere` en encabezados para que un título largo no desborde a 320 px, sin `line-height !important` en ninguna parte.

---

## Color

Sin neutrales inventados: el brandbook solo define cuatro colores. El fondo claro es blanco `#ffffff` (no se usa un crema no aprobado). Tokens en tres niveles (primitivos de marca, semánticos por tono, componentes que solo consumen semánticos).

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `#ffffff` | Fondo de página, header y hero (tono `light`) |
| Secondary (30%) | `#73187F` | Fondo de la sección `#agenda` (tono `purple`) y, en la Fase 2, los bloques de énfasis |
| Accent (10%) | `#fd6938` sobre superficies claras, `#ffc602` sobre morado u oscuro | Relleno del CTA principal (ver lista) |
| Ink | `#212121` | Texto principal, texto de los CTA, bordes y sombras pop, fondo de los skip links |
| Destructive | not used | Fase 1 no tiene acciones destructivas ni de error propias. No definir un rojo de marca |

Proporción: en Fase 1 solo hay tres bloques (header, hero, agenda), así que la mezcla real es aproximadamente 55 % blanco, 40 % morado, 5 % acento. Se acerca a 60/30/10 cuando la Fase 2 sume secciones. No se compensa la Fase 1 añadiendo color de más.

Accent reserved for (lista cerrada, nunca "todos los elementos interactivos"):
1. Relleno del CTA principal: naranja `#fd6938` con texto `#212121` sobre blanco; amarillo `#ffc602` con texto `#212121` sobre morado.
2. Anillo de foco sobre superficies moradas u oscuras (`#ffc602`).
3. Texto del skip link (`#ffc602` sobre `#212121`).
4. Estado hover del enlace de respaldo sobre morado (`#ffc602`).

Prohibido usar el acento para: encabezados, párrafos, bordes de tarjeta, fondos de sección, íconos decorativos de esta fase.

### Tokens

```css
/* src/styles/tokens.css: primitivos en @theme, semánticos por tono */
@theme {
  --color-brand-purple: #73187f;
  --color-brand-orange: #fd6938;
  --color-brand-yellow: #ffc602;
  --color-brand-dark:   #212121;
  --color-brand-white:  #ffffff;
}
:root, [data-tone="light"] {
  --surface: var(--color-brand-white);   --on-surface: var(--color-brand-dark);
  --link: var(--color-brand-purple);     --cta-bg: var(--color-brand-orange);
  --on-cta: var(--color-brand-dark);     --focus-ring: var(--color-brand-purple);
}
[data-tone="purple"] {
  --surface: var(--color-brand-purple);  --on-surface: var(--color-brand-white);
  --link: var(--color-brand-white);      --cta-bg: var(--color-brand-yellow);
  --on-cta: var(--color-brand-dark);     --focus-ring: var(--color-brand-yellow);
}
```

### Pares aprobados (los que `scripts/check-contrast.mjs` debe contener y verificar)

Ratios medidos con la fórmula de luminancia relativa de WCAG y recalculados para este contrato. Umbral: texto normal 4.5:1, texto grande y UI 3:1. El script falla si un par baja de su umbral.

| Texto o elemento | Fondo | Ratio | Uso en Fase 1 | Umbral |
|------------------|-------|------:|---------------|-------:|
| `#212121` | `#ffffff` | 16.10 | Cuerpo, h1, wordmark | 4.5 |
| `#73187F` | `#ffffff` | 9.69 | Anillo de foco sobre claro | 3 |
| `#ffffff` | `#73187F` | 9.69 | h2, intro y enlace de respaldo sobre morado | 4.5 |
| `#ffc602` | `#73187F` | 6.15 | Anillo de foco y hover de enlace sobre morado | 4.5 |
| `#212121` | `#ffc602` | 10.22 | Texto del CTA sobre amarillo | 4.5 |
| `#212121` | `#fd6938` | 5.56 | Texto del CTA sobre naranja | 4.5 |
| `#ffc602` | `#212121` | 10.22 | Texto del skip link | 4.5 |
| `#fd6938` | `#212121` | 5.56 | Aprobado para uso futuro (naranja como texto solo sobre oscuro) | 4.5 |
| `#fd6938` | `#73187F` | 3.35 | Solo texto grande, íconos o bordes de UI. Nunca texto normal | 3 |

### Pares prohibidos (el script debe tener estos como fixtures negativos y fallar si alguien los declara)

| Par | Ratio | Motivo |
|-----|------:|--------|
| `#ffffff` sobre `#fd6938` | 2.89 | Ni siquiera llega a 3:1. Nunca texto blanco en un botón naranja |
| `#fd6938` sobre `#ffffff` | 2.89 | Naranja como texto o borde de UI sobre claro |
| `#ffc602` sobre `#ffffff` o blanco sobre `#ffc602` | 1.58 | Amarillo solo como relleno con texto `#212121` |
| `#73187F` sobre `#212121` | 1.66 | El morado no va sobre fondo oscuro |
| `#fd6938` sobre `#ffc602` | 1.84 | Ni texto ni par de foco |

Reglas derivadas:
- El texto de todo CTA es `#212121`, sin excepción.
- El foco nunca depende del naranja.
- Un estado no depende solo del color (los enlaces llevan subrayado siempre, ver `## Interaction Contract`).
- El borde y la sombra pop (`#212121`) sobre morado son decorativos: la forma se distingue por el relleno (amarillo sobre morado 6.15), no por el borde.

---

## Layout and Surface Contract

### Global
- `<html lang="es">`. `e-commerce` y cualquier frase en inglés van en `<span lang="en">`. (Aplica desde la Fase 2; ningún texto de la Fase 1 lo necesita.) Nombres propios de marca (Google, ChatGPT, Gemini) no llevan `lang`.
- `body`: fondo `var(--surface)`, texto `var(--on-surface)`, `font-family: var(--font-brand)`, tamaño Body, interlineado 1.6.
- Mobile first desde 320 px. Sin scroll horizontal a 320, 390, 768, 1024 y 1280 px. Los hijos de grid llevan `min-w-0`.
- Cabecera NO sticky ni fija: evita tapar el foco (SC 2.4.11) y ahorra `scroll-padding`.
- Sin sombras, gradientes ni imágenes decorativas en esta fase, más allá de la sombra pop del botón y de la tarjeta del formulario.

### Skip links
- Contenedor `<nav aria-label="Saltos de página">` como primer hijo de `<body>`. Dos enlaces en este orden: "Saltar al contenido" (`#main`) y "Saltar al formulario" (`#agenda`).
- Fuera de pantalla por defecto con posicionamiento (`position: absolute; transform: translateY(-200%)`), nunca `display: none` ni `visibility: hidden`. Al recibir foco: `top: 8px; left: 8px` (fijo a la ventana), fondo `#212121`, texto `#ffc602`, tamaño Label (SemiBold 600), padding `8px 16px`, `min-h-11`, radio 8 px, contorno de foco `3px solid #73187F` con offset 2 px (se ve contra el header blanco).
- `<main id="main" tabindex="-1">` para que el salto mueva el foco.

### Header
- `<header>` sobre tono `light`, padding vertical 16 px, contenedor estándar. Alto natural (mínimo 48 px de contenido, no fijo).
- Izquierda: wordmark "Loops Growth" en texto, Body 700, `#212121`, sin enlace. La Fase 2 lo reemplaza por el logo SVG (DSGN-02).
- Derecha: el CTA del header. `hidden` por debajo de 640 px (el CTA del hero queda a la vista); desde 640 px, visible con `min-h-11`. Al ocultarse con `display: none` sale del orden de tabulación.
- Alineación: `flex items-center justify-between`.

### Hero (provisional)
- `<section aria-labelledby="hero-title">` sobre tono `light`. Padding vertical 64 px en todos los anchos. Columna única alineada a la izquierda, sin imagen (el lado derecho queda libre para el collage de la Fase 2).
- `<h1 id="hero-title">`: Display, `#212121`, `max-width: 22ch`. Único `<h1>` de la página.
- Subtítulo `<p>`: Body, `max-width: 65ch`, separación de 24 px bajo el h1.
- CTA principal: separación de 32 px bajo el subtítulo. Es el primer punto focal de la página: el único elemento con relleno de acento en el primer pantallazo.

### Botón CTA (`CtaLink`)
- `<a href="#agenda">`, texto Body 700, `#212121`, relleno `var(--cta-bg)`, borde `3px solid #212121`, radio pill (999 px), sombra pop `4px 4px 0 #212121`.
- Tamaño: `min-h-12` (48 px), `min-w-11`, padding horizontal 24 px, padding vertical 8 px (el alto de 48 px lo garantiza `min-h-12`, no el padding). El texto puede partirse en dos líneas a 320 px; nunca truncar ni fijar `height`.
- Mismo texto visible en todos los CTA del sitio: nombre accesible igual al texto visible (SC 2.5.3). Sin `aria-label`.
- Estados en `## Interaction Contract`.

### Sección `#agenda`
- `<section id="agenda" aria-labelledby="agenda-title" data-tone="purple">` con `scroll-margin-top: 24px`. Padding vertical 64 px en todos los anchos.
- Menor a 1024 px, una columna en este orden: h2, intro, enlace de respaldo, tarjeta del formulario. Desde 1024 px, dos columnas con `grid-template-columns: minmax(0, 5fr) minmax(0, 7fr)` y gap 48 px: izquierda h2, intro y enlace de respaldo (`align-self: start`); derecha la tarjeta.
- Orden del DOM igual al orden visual (sin reordenar por CSS).
- h2: Heading, `#ffffff`, `tabindex="-1"`. Intro: Body, `#ffffff`, `max-width: 65ch`, 16 px bajo el h2.
- Enlace de respaldo (dos líneas: frase corta y enlace): frase en Body `#ffffff`; enlace en Body 700, `#ffffff`, subrayado siempre visible (`text-decoration: underline; text-underline-offset: 4px`, grosor 2 px), `min-h-11`, con ícono de enlace externo a la derecha (16 px, `currentColor`, `aria-hidden`). Separación de 24 px bajo la intro y de 32 px sobre la tarjeta.
- Tarjeta del formulario: contenedor `.form-embed` con fondo `#ffffff`, borde `3px solid #212121`, radio 16 px, sombra pop `4px 4px 0 #212121`, padding 0, `overflow: visible` (el script de ClickUp pone `overflow:auto` en línea; se vence con `overflow: visible !important` para evitar una región de scroll anidada sin foco por teclado). El fondo blanco es un seguro: el fondo interno del formulario de ClickUp no está verificado.
- Iframe: `class="clickup-embed clickup-dynamic-height"`, `width: 100%`, `border: 0`, `background: transparent`, `border-radius: 16px`, `loading="lazy"`, `referrerpolicy="strict-origin-when-cross-origin"`, sin `frameborder`, `scrolling` ni `onwheel`. No fijar `height` en px más allá del `min-height` reservado.
- `noscript` con el mismo enlace de respaldo justo bajo la tarjeta (mismo estilo de enlace).

---

## Copywriting Contract

Todo el texto vive en `landing.es.yaml` como `{text, status}`. Español neutro, trato de "tú", sin voseo, sin em/en dashes, sin "AEO". Los textos estructurales sin afirmaciones van `verified`. Todo lo que afirma algo del negocio y no viene del doc de Ari va `pending` hasta que Ari lo apruebe (el build de producción falla con cualquier `pending`, y eso es lo esperado). Regla de Juan (2026-09-18): los `pending` se listan en `PENDING-COPY.md` (generado por `npm run pending` desde el YAML) y en la página nunca hay placeholders vacíos, etiquetas de borrador ni contenido oculto: donde falta el dato se muestra el relleno visible "FALTA CONFIRMAR". Lo que ya está en el doc de Ari se muestra tal cual y solo se lista si Ari debe confirmarlo (por ejemplo "30 minutos" y "SEO/GEO").

| Element | Copy |
|---------|------|
| Primary CTA (todos los CTA) | "Agenda tu llamada de 30 minutos". La duración sale de `call.duration` (`"30 minutos"`, `pending`); el verbo y el sustantivo son fijos. Cambiar a 20 minutos es editar una sola línea del YAML |
| Skip link 1 | "Saltar al contenido" |
| Skip link 2 | "Saltar al formulario" |
| `<title>` (provisional, `pending`) | "Loops Growth: agencia de SEO/GEO" (el término sale de `brand.term`, `pending`). La Fase 3 lo reemplaza |
| Hero H1 | Tal cual del Copy v2 de Ari: "Crecemos tu tienda a través de Google, ChatGPT y Gemini." (sale del doc, sin reescribir) |
| Hero subtítulo | Tal cual del Copy v2 de Ari: "Un equipo dedicado y especializado que ejecuta tu SEO/GEO y tu visibilidad en asistentes de IA (ChatGPT, Gemini)." (sin reescribir; el término `SEO/GEO` sale de `brand.term`, `pending` para que Ari lo confirme) |
| `#agenda` H2 | "Agenda tu llamada" |
| `#agenda` intro | Cuerpo del CTA final del Copy v2 de Ari, tal cual: "Agenda una llamada de 30 minutos. Sin costo y sin compromiso. Entendemos tu negocio y te decimos con honestidad si podemos ayudarte. Si no somos el equipo correcto, también te lo decimos." La duración sale de `call.duration` (`pending`). Reemplaza el texto inventado anterior |
| Fallback lead-in (también es el copy de error) | "¿El formulario no carga o prefieres abrirlo aparte?" |
| Fallback link (siempre visible) | "Abre el formulario en una pestaña nueva". `target="_blank" rel="noopener noreferrer"`. El texto visible ya dice que se abre aparte; no hace falta `sr-only` |
| iframe `title` | "Formulario para agendar tu llamada con Loops Growth" |
| `noscript` | "Para ver el formulario aquí necesitas activar JavaScript." seguido del mismo enlace "Abre el formulario en una pestaña nueva" |
| Empty state heading | not applicable: la página no muestra listas ni datos dinámicos |
| Empty state body | not applicable |
| Error state | "¿El formulario no carga o prefieres abrirlo aparte?" con el enlace de respaldo, siempre visible. Es una capa estática: el evento `load` del iframe se dispara incluso si ClickUp muestra un error, así que no se detecta la falla ni se muestra un mensaje condicionado. Los errores de validación dentro del formulario son de ClickUp |
| Confirmación de envío | No es nuestro copy: la muestra ClickUp dentro del iframe. FORM-05 solo verifica que aparezca. Si aparece en inglés, se registra como hallazgo para Ari (el formulario declara `lang="en-US"`), no se parchea desde la landing |
| Destructive confirmation | none: Fase 1 no tiene acciones destructivas |

Reglas de redacción para el planner: ningún texto nuevo se inventa: sale del doc de Ari o se muestra "FALTA CONFIRMAR" y se lista en `PENDING-COPY.md` para pedírselo a Ari. Sin "agendá", "tenés", "vos", "llená". Sin guiones largos. `scripts/check-copy.mjs` debe cubrir también los textos estructurales de arriba, no solo los del hero.

---

## Interaction Contract

### Orden de tabulación (sin `tabindex` positivos)
1. Skip link "Saltar al contenido".
2. Skip link "Saltar al formulario".
3. CTA del header (solo si es visible, desde 640 px).
4. CTA del hero.
5. Enlace de respaldo de `#agenda`.
6. Contenido del iframe (comportamiento del navegador; entra y sale con Tab y Shift+Tab, sin trampa impuesta por nosotros).

El `<h2 id="agenda-title" tabindex="-1">` recibe foco solo por programa, no está en el orden de tabulación.

### Salto a `#agenda` y foco
- Todo CTA y el skip link 2 son `href="#agenda"`. Sin JS, el navegador hace el salto de ancla y la página sigue usable.
- Un script mínimo escucha clics sobre `a[href="#agenda"]` y `hashchange`, y en carga inicial si `location.hash === '#agenda'`. Mueve el foco al h2 con `focus({ preventScroll: true })`, porque el navegador ya hace el scroll de ancla.
- Sin `outline: none` en el h2. Se deja el `:focus-visible` global (el navegador decide si lo muestra tras clic con ratón; tras teclado sí se ve).
- `scroll-behavior: smooth` solo dentro de `@media (prefers-reduced-motion: no-preference)`. En `reduce`, salto inmediato.

### Estados de CTA (`CtaLink`)
| Estado | Comportamiento |
|--------|----------------|
| default | Relleno `var(--cta-bg)`, texto `#212121`, borde 3 px `#212121`, sombra pop 4 px |
| hover | Cambia el relleno al otro acento (naranja pasa a amarillo; amarillo pasa a naranja). Ambos con texto `#212121` (10.22 y 5.56). Bajo `motion-safe:`, además `translate(-2px, -2px)` y sombra de 6 px |
| focus-visible | Contorno `3px solid var(--focus-ring)`, offset 2 px. Nunca `outline: none` |
| active | Bajo `motion-safe:`, `translate(2px, 2px)` y sombra de 2 px. Sin movimiento en `reduce` (solo cambia el relleno) |
| disabled | not applicable |

Transición: 150 ms `cubic-bezier(.2,.7,.2,1)` solo en `motion-safe`. En `reduce`, 0 ms.

### Enlace de respaldo
Subrayado siempre visible (la señal no depende del color). Hover: texto `#ffc602` (6.15 sobre morado) y grosor de subrayado 3 px. Foco: contorno amarillo 3 px, offset 2 px.

### Reserva de altura del iframe (FORM-04)
- Dos tokens en `tokens.css`: `--form-min-h-sm` (menor a 1024 px) y `--form-min-h-lg` (desde 1024 px), aplicados como `min-height` de `.form-embed iframe`.
- Valores provisionales, a reemplazar por medición: 1100 px (`sm`) y 900 px (`lg`). Se miden en el navegador con el formulario real a 390, 1024 y 1280 px; cada token toma la altura mayor medida en su rango, redondeada hacia arriba al siguiente múltiplo de 8. Se registran en el plan de FORM-04 junto con el ancho de tarjeta y la fecha.
- El script `forms-embed/v1.js` (iFrame Resizer) ajusta la altura real. Va como `<script is:inline async src="https://app-cdn.clickup.com/assets/js/forms-embed/v1.js">`. Si falla, el iframe conserva el `min-height` y ClickUp muestra scroll interno.
- Sin recortes ni saltos de layout: la tarjeta reserva espacio antes de que el formulario cargue; el crecimiento posterior por interacción del usuario no cuenta como salto.

### Movimiento y JavaScript
- Único movimiento de la fase: desplazamiento del CTA y scroll suave, ambos solo con `no-preference`. Nada anima al cargar, nada parte de `opacity: 0`. Con JS desactivado todo el contenido se ve y el CTA salta a `#agenda`.
- Único JS propio: el script de foco (más el script de terceros de ClickUp). Sin islas, sin `ClientRouter`.

### Responsive
| Ancho | Comportamiento |
|-------|----------------|
| 320 px | Una columna, gutter 16 px, CTA del header oculto, CTA del hero con texto en dos líneas si hace falta, iframe al 100 % sin scroll horizontal |
| 390 px | Igual; ancho de medición de `--form-min-h-sm` |
| 640 px | Aparece el CTA del header (`sm`) |
| 768 px | Sin cambio de padding (64 px en todos los anchos); una columna en `#agenda` |
| 1024 px | `#agenda` pasa a dos columnas 5fr y 7fr (`lg`); ancho de medición de `--form-min-h-lg` (tarjeta más estrecha, caso más alto) |
| 1280 px | Contenedor a 1152 px; segundo punto de medición de `--form-min-h-lg` |

Con espaciado de texto forzado (interlineado 1.5, espaciado de párrafo 2x, letras 0.12em, palabras 0.16em) no se recorta ni se superpone nada.

---

## Verification Hooks

Lo que el checker y el executor pueden comprobar sin interpretar:

- Captura con el navegador real a 320, 390, 768, 1024 y 1280 px: sin scroll horizontal, sin recortes de texto ni del iframe.
- Captura con la cadena `Ñandú, ¿qué tal? ¡Sí! Pingüino, árbol, éxito, índice, ópera, único.` renderizada con Outfit (por ejemplo en el hero provisional o en una vista temporal que no se publica): los glifos `áéíóúüñ¿¡` sin caja vacía ni fuente de reemplazo.
- Teclado: Tab recorre skip links, CTA visibles, enlace de respaldo y entra al iframe; cada elemento enfocable muestra el anillo de 3 px. Clic en un CTA deja el foco en el h2 de `#agenda`.
- Sin JavaScript: el contenido es visible, el CTA salta a `#agenda` y el `noscript` muestra el enlace.
- `scripts/check-contrast.mjs`: pasa con los 9 pares aprobados y falla con cada par prohibido.
- Cada CTA, enlace y control mide al menos 44 px en ambos ejes (o 44 de alto para texto en línea).
- FORM-05: envío real de prueba en Chrome a 390 y 1280 px; se ve la confirmación de ClickUp y aparece la tarea en la Lista, marcada como prueba para que Juan la borre.

---

## UI Considerations

> Prellenado por el investigador con la taxonomía de estados; el probe del paso 9.5 de ui-phase reemplaza estas filas al correr (idempotente). Las copias de estados vacío y de error viven en `## Copywriting Contract`.

Applicable state considerations resolved: 5 covered, 2 backstop, 2 unresolved

| Category | Element(s) | Status | Resolution / Reason |
|----------|------------|--------|---------------------|
| loading | form (iframe de ClickUp) | ✅ covered | La tarjeta blanca reserva `min-height` medido antes de que cargue el formulario, con `loading="lazy"` y el enlace de respaldo siempre visible, sin spinner ni texto de carga |
| error | form (iframe de ClickUp) | ✅ covered | El enlace de respaldo y la frase "¿El formulario no carga o prefieres abrirlo aparte?" están siempre visibles; el `noscript` ofrece el mismo enlace. No se intenta detectar la falla del iframe |
| empty | form (iframe de ClickUp) | ✅ covered | El formulario sin llenar es el estado normal; no hay estado vacío propio de la landing |
| long-text | interactive-control (CTA), static-content (h1) | ✅ covered | El texto del CTA se parte en dos líneas a 320 px con `min-h` y sin `height` fijo; los encabezados usan `overflow-wrap: anywhere` y `max-width` en `ch` |
| overflow | static-content (hero, intro) | ✅ covered | Sin scroll horizontal de 320 a 1280 px; hijos de grid con `min-w-0`; prosa a 65ch |
| partial | form (iframe de ClickUp) | 🧪 backstop | Estado tras enviar (confirmación de ClickUp, más corta que el formulario): el `min-height` puede dejar espacio en blanco bajo la confirmación. Verificar en FORM-05 y decidir en el plan si se acepta o se ajusta |
| error | nav (skip links) | 🧪 backstop | Comprobar con captura que un skip link enfocado no queda tapado por ningún elemento y que el anillo se ve contra el header |
| loading | interactive-control (CTA) | ⚠ unresolved | No hay estado de carga propio del CTA (es un ancla). Se asume que no hace falta; si el script de foco se retrasa, el CTA sigue funcionando por el ancla nativa |
| error | form (iframe de ClickUp) | ⚠ unresolved | Idioma y comportamiento de los errores internos de ClickUp (el formulario declara `lang="en-US"`): fuera de nuestro control, se documenta en FORM-05 y en `EXCEPTIONS.md` de la Fase 3 |

<!-- Status vocabulary (locked by probe-core projectTruths): covered = plain truth string lifted into must_haves.truths; backstop = { statement, verification: backstop }, needs explicit evidence at verify time; unresolved = explicit planner assumption. Rows are REPLACED on a probe re-run (idempotent). -->

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none (Tool: none, sin `components.json`) | not applicable |
| third-party | none | not applicable |

Dependencia externa de terceros (no es un registro de componentes): el iframe y el script `forms-embed/v1.js` de ClickUp. Origen fijo (`https://forms.clickup.com` y `https://app-cdn.clickup.com`), sin `eval` propio ni datos del visitante hacia ClickUp más allá del `src`. Se registrará en `EXCEPTIONS.md` en la Fase 3.

---

## Assumptions and Open Items

Corrida autónoma: no hubo usuario disponible. Cada punto es un valor por defecto elegido, revisable.

| # | Supuesto | Por qué | Quién lo confirma |
|---|----------|---------|-------------------|
| 1 | Hero provisional: H1 y subtítulo derivados de la frase final del Copy v2 y de PROJECT.md, ambos `pending`. Los reemplaza CONT-01 | El esqueleto necesita texto real para verificar glifos y jerarquía | Ari (Fase 2) |
| 2 | `--form-min-h-sm` 1100 px y `--form-min-h-lg` 900 px son provisionales | No se puede medir sin abrir el formulario real; FORM-04 los sustituye | Ejecución de FORM-04 |
| 3 | Header no sticky | Evita SC 2.4.11 y el `scroll-padding`. La barra fija en móvil es CONV-01 (v2) | Juan |
| 4 | Fondo claro = blanco `#ffffff`, sin crema | El brandbook no define neutrales; no se inventan | Ari o diseñador |
| 5 | `#agenda` en tono morado con el formulario dentro de una tarjeta blanca | Da énfasis de marca al punto de conversión y protege contra un fondo desconocido del formulario | Ari y Camila al validar |
| 6 | Wordmark de texto en el header | El logo SVG llega en la Fase 2 (DSGN-02, falta convertir el `.ai`) | Fase 2 |
| 7 | Dos skip links (contenido y formulario) | CONTEXT.md exige uno al `main`; el segundo cubre el valor central de la página con costo casi nulo | Juan |
| 8 | Sin mensaje temporizado de "el formulario tarda en cargar" | El evento `load` no detecta fallas y sumaría JS no decidido en CONTEXT.md; basta el enlace permanente | Juan |
| 9 | CTA del header oculto por debajo de 640 px | El CTA del hero está en el primer pantallazo y el header no cabe con un texto de 31 caracteres a 320 px | Juan |
| 10 | Pesos 400, 600 y 700 (los tres del brandbook), 4 tamaños tipográficos | El brandbook manda en estilos (Juan, 2026-09-18). La Fase 2 amplía en su propio contrato | Fase 2 |
| 11 | Duración "30 minutos" y término "SEO/GEO" `pending` en un solo lugar del YAML | Bloqueo abierto en STATE.md | Ari |
| 12 | La confirmación de envío y su idioma dependen de ClickUp | Fuera de nuestro control; FORM-05 solo observa | Ari (si aparece en inglés) |

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: FLAG (no bloqueante: min-height provisional del iframe no es múltiplo de 8; FORM-04 lo reemplaza por medición)
- [x] Dimension 6 Registry Safety: PASS
- [x] Dimension 7 Inventory Provenance: PASS

**Approval:** approved 2026-09-18

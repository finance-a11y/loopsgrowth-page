---
phase: "02"
slug: secciones-marca-y-copy
status: approved
shadcn_initialized: false
preset: none
created: "2026-09-18"
---

# Phase 02 - UI Design Contract

> Contrato visual y de interacción de la Fase 2: las 13 secciones del Copy v2 con el estilo collage pop, logo e isotipo en SVG, y el combinado de layout tomado de m8l.com, skale.so y rankingonai.com. EXTIENDE el contrato de la Fase 1 (`01-UI-SPEC.md`, ya construido y ejecutado); no lo rehace. Lo que la Fase 1 fijó y aquí no se menciona sigue vigente: tokens de marca, pesos 400/600/700, foco de 3 px, skip links, tarjeta del formulario, reserva del iframe, `cta-focus.ts`.
>
> Fuentes: `02-CONTEXT.md` (decisiones bloqueadas), `01-UI-SPEC.md` y los SUMMARY 01 a 03, `.claude/CLAUDE.md` (tabla de contraste medida, A11Y.md, copy verbatim), `research/COPY-VERIFICATION.md`, `PENDING-COPY.md`, y el estudio real de las tres referencias descrito abajo.
>
> Reglas de proyecto que aplican a la ejecución: todo el trabajo visual pasa por las skills `impeccable` y `design-taste-frontend`, que afinan dentro de este contrato y no pueden romper los pares de contraste aprobados. Todo el texto sale tal cual del doc de Ari (Copy v2), sin humanizar ni reescribir, en español neutro y sin voseo ni guiones largos.

## Limitaciones de esta corrida (leer antes de planificar)

1. **No se pudo leer el doc de Ari.** La exportación pública devolvió HTTP 401 y esta corrida no tiene la herramienta `read_file_content` de Google Drive. Por eso este contrato define ranuras (slots) por sección y NO cita texto nuevo del doc. Las únicas cadenas del Copy v2 que aparecen aquí salen de artefactos del repo (`landing.es.yaml`, REQUIREMENTS, PROJECT, COPY-VERIFICATION). El planner o el ejecutor debe abrir el doc con Drive MCP y mapear cada ranura a su cadena exacta.
2. **Hallazgos del doc reportados por el orquestador y no verificados por mí**: "AEO" en el titular de La solución y el error tipográfico "estan" sin tilde. Están listados en `## Copywriting Contract` como hallazgos para Ari.
3. **Referencias estudiadas con render real.** No hay Claude-in-Chrome ni browser-use en esta corrida; se usó Chromium de Playwright (el del proyecto) para renderizar las tres páginas a 1280 y 390 px, hacer scroll para disparar lazy load, capturar en tramos y auditar animaciones con `document.getAnimations()`. Vi los tramos clave, no todos. Las capturas están en el scratchpad de la sesión (no versionadas).

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none (sin shadcn ni `components.json`; componentes `.astro` a mano) |
| Preset | not applicable |
| Component library | none (HTML nativo, cero islas, cero JS de UI nuevo) |
| Icon library | none. SVG en línea con `aria-hidden="true"` y `focusable="false"`. Iconos utilitarios (check, x, plus, minus, external-link) con geometría Tabler (MIT), como ya se hizo en la Fase 1. Iconografía de marca (lupa, ojos, clic, loop) dibujada a medida (ver `## Collage and Brand Assets Contract`) |
| Font | Outfit (400, 600, 700) por `var(--font-brand)`; sin cambios. Cambio a Hurme por `fontProviders.local()` cuando llegue la licencia web |
| Styling | Tailwind 4.3.3 + `tokens.css` (extendido en este contrato). Componentes leen solo tokens semánticos |
| Motion | Solo CSS, solo bajo `prefers-reduced-motion: no-preference`. Ningún JS nuevo (ver `## Interaction Contract`) |

---

## Surface Inventory (Phase 2)

> Sustituye a `Component Inventory`: sin sistema de diseño instalado no hay paquete que enumerar. Es el contrato de qué se construye. Rutas sugeridas; el planner puede ajustarlas.

| Surface | Archivo sugerido | Landmark / elemento | Notas |
|---------|------------------|---------------------|-------|
| Logo | `src/components/brand/Logo.astro` | `<svg role="img">` con `<title>` "Loops Growth" | Horizontal y solo isotipo. En `/` no es enlace; en `/privacidad` enlaza a `/` |
| Header (actualiza) | `src/components/SiteHeader.astro` | `<header>` | Logo a la izquierda, CTA a la derecha desde 640 px. No fijo, sin menú |
| SectionShell | `src/components/ui/SectionShell.astro` | `<section id aria-labelledby data-tone>` | Padding `--section-y`, cabecera h2 + lead, barra de acento decorativa |
| CtaLink (extiende) | `src/components/CtaLink.astro` | `<a href>` | `location`: `header`, `hero`, `solucion`, `casos`. Nueva prop `href` (por defecto `#agenda`; `/#agenda` en `/privacidad`) |
| Hero | `src/components/sections/Hero.astro` | `<section id="inicio">` con el único `<h1>` | Reemplaza `HeroSkeleton.astro` (CONT-01) |
| Problema | `sections/Problem.astro` | `<section id="problema">` | 3 PainCard sobre tono `dark` |
| Por qué ahora | `sections/WhyNow.astro` | `<section id="por-que-ahora">` | Lista de afirmaciones de mercado, tono `yellow` |
| Solución | `sections/Solution.astro` | `<section id="solucion">` | 4 PillarCard + CTA |
| Lo que logramos juntos | `sections/Results.astro` | `<section id="resultados">` | 4 ResultItem, tono `dark` |
| Casos de éxito | `sections/Cases.astro` + `ui/MetricCard.astro` | `<section id="casos">` | 5 MetricCard (la 5.ª ancha, Meta Ads) + CTA |
| Quiénes somos | `sections/Team.astro` + `collage/Avatar.astro` | `<section id="nosotros">` | 4 TeamCard, tono `yellow` |
| Qué incluye | `sections/Includes.astro` | `<section id="incluye">` | 6 IncludeItem (abiertos, sin tarjeta) |
| Cómo funciona | `sections/HowItWorks.astro` | `<section id="como-funciona">` con `<ol>` | 4 StepItem, tono `dark` |
| Para quién es | `sections/ForWhom.astro` | `<section id="para-quien">` | 2 columnas: es / no es |
| FAQ | `sections/Faq.astro` | `<section id="faq">` con `<details>` | 5 a 6 ítems, tono `yellow` |
| Agenda (actualiza) | `src/components/AgendaSection.astro` | `<section id="agenda">` | Pasa a ser el CTA final (CONT-13). Conserva id, `agenda-title`, foco y tarjeta de la Fase 1 |
| Footer | `src/components/SiteFooter.astro` | `<footer>` | Contacto, redes, política de privacidad |
| Página privacidad | `src/pages/privacidad.astro` | `<main>` con `<h1>` | Cuerpo "FALTA CONFIRMAR" hasta que Ari entregue el texto |
| Collage | `src/components/collage/*.astro` (+ sprite opcional) | `<svg aria-hidden="true" focusable="false">` | Lupa, Ojos, Clic, Loop, HeroCollage, AgendaCollage, 4 avatares |
| Tokens | `src/styles/tokens.css` | n/a | Extensión de tonos, escala y tipografía (abajo) |

Página `/`: `SkipLinks`, `SiteHeader`, `<main id="main" tabindex="-1">` con las 12 secciones en el orden de `## Page Architecture`, `SiteFooter`.

---

## Reference Study (evidencia)

Método: Chromium headless (Playwright del proyecto), 1280x900 y 390x844, scroll completo, capturas por tramos, auditoría de estilos computados y animaciones, 2026-09-18. Confianza HIGH en estructura y estilos (render real); LOW en comportamientos que solo aparecen con interacción (no probados).

| | m8l.com (Meaningful) | skale.so | rankingonai.com |
|--|----------------------|----------|-----------------|
| Vibra | Documento editorial claro, casi sin adorno; un solo acento azul sobre fondo lavanda muy suave | Oscuro (#232323), acento verde lima, tipografía delgada gigante, mucha atmósfera | Casi blanco (#fafafa) con lima; grande, bold, tarjetas muy redondeadas, chips y anotaciones "a mano" |
| Tipografía medida | Manrope 800 en h2 (34 px), Lora 700 en nombres (28 px) | Onest 300 en h1 (72 px, interlineado 1.15) | Inter 700 en h1 (60/60 px) y h2 (48 px) |
| Header | Logo centrado arriba; riel lateral fijo con 12 anclas y botón "Contact Us" | Fijo (70 px), nav con menús y botón pill lima | Fijo translúcido con desenfoque, logo cuadrado lima, 4 enlaces, pill lima |
| Hero | Centrado: 3 chips de alianzas, H1 de una línea, botón rectangular, 4 contadores debajo (numeral azul + etiqueta) y logos por región | 2 columnas: H1 + subtítulo + botón pill primario y enlace secundario a la izquierda; collage de 2 fotos con chips de UI flotantes a la derecha; marquee de logos | Centrado: H1 en 3 líneas, subtítulo, pill con flecha, "TRUSTED BY" con tarjetas de logo y chip lima en la esquina ("+$400M RAISED") |
| Problema | Prosa con h3 | 3 columnas centradas: icono en hexágono, h3, párrafo | Bloque educativo centrado "AI Is Changing How People Search" + CTA |
| Servicios / pilares | Lista numerada 01 a 10 (título en negrita + una línea) | Filas alternas de 2 columnas: texto + checklist con discos lima + foto recortada con UI flotante; diagrama de 6 fichas + embudo con flecha en bucle | Panel lima redondeado a ancho casi completo (inset 16 px) con 2x2 tarjetas blancas y mini-widgets de UI |
| Prueba | Testimonios en 3 tarjetas (1 px, radio 16), logos, retratos de trazo en círculos lavanda | Cita gigante a pantalla completa con comillas verdes; pares "antes (apagado) → flecha → después (verde)" | Titulares tipo dato en negrita, gráfico con recuadro lima sobre la cifra clave y flecha lima dibujada; tarjetas de testimonio con resaltado lima sobre los números; tarjeta discontinua "You? Your SaaS" |
| Proceso | No destacado | No | 3 tarjetas "STEP 1/2/3" con etiqueta lima, h3 y párrafo |
| Equipo | 4 fundadores con retrato de trazo grande + viñetas; rejilla de ~30 avatares circulares de trazo | No | No |
| FAQ | Filas con borde, radio 12, icono + azul | No | Acordeón de 8 |
| CTA final | h2 "Ready to Start Growing" + tarjeta blanca con formulario de campos subrayados | Titular gigante centrado + pill | h2 + párrafo + un pill grande |
| Ritmo | Un solo fondo, aire generoso; barra corta de acento sobre cada h2 | Fondo oscuro continuo, separadores de sección de ~150 px | Secciones con `py-24` (96 px) y `md:py-28` (112 px) |
| Movimiento (auditado) | 0 animaciones CSS; carrusel de testimonios con paginador | **2 animaciones infinitas** (`scroll-up`, `scroll-down`: marquee de logos) y 13 elementos con opacidad menor a 0.05 al cargar (revelado al hacer scroll) | 0 animaciones CSS al cargar; marquee inferido |
| Peso | 167 `<img>`, 48 scripts | 85 `<img>`, 42 scripts | 28 `<img>`, 21 scripts |

Patrones observados que el contrato **rechaza** por los límites duros (contraste, A11Y.md, sin JS, movimiento):

| Patrón | Dónde | Motivo del rechazo |
|--------|-------|--------------------|
| Header o riel fijo/sticky | Las tres | SC 2.4.11 (foco tapado); decisión de CONTEXT: header no fijo |
| Marquee infinito de logos | skale | SC 2.2.2 y `prefers-reduced-motion` |
| Carrusel con flechas o paginador | m8l, skale | SC 2.2.2, JS, oculta contenido |
| Revelado con opacidad 0 al hacer scroll | skale | Contenido oculto por animación (CRÍTICO en A11Y.md) |
| Etiqueta lima sobre blanco ("STEP 1") | rankingonai | Contraste bajo; el equivalente nuestro (amarillo sobre blanco, 1.58) está prohibido |
| Logos, fotos, testimonios, vídeo embebido | Las tres | Fuera de alcance: no hay material ni permiso |
| Texto gris apagado como cuerpo | skale, rankingonai | Riesgo de contraste; el cuerpo es siempre `#212121` o blanco según tono |
| Tarjeta discontinua "You?" con CTA | rankingonai | Copy inventado; no hay texto de Ari |

---

## Reference Synthesis (combinado propio, por sección)

Regla de lectura: cada fila dice qué patrón se toma, de qué referencia (M = m8l, S = skale, R = rankingonai) y cómo se adapta a la marca (collage pop, tonos blanco/amarillo/oscuro/morado, Outfit, bordes de 3 px y sombra dura). Es un combinado: ninguna sección copia una sola página.

| Sección | Patrón tomado | Ref. | Adaptación Loops Growth |
|---------|---------------|------|--------------------------|
| Header | Logo a la izquierda y un solo pill de CTA a la derecha | R, S | Logo SVG. CTA naranja con texto oscuro, borde 3 px y sombra dura. No fijo, sin nav (CONTEXT). CTA oculto bajo 640 px |
| Hero | Hero de 2 columnas con el collage a la derecha; H1 muy grande y en negrita; un pill dominante | S (estructura), R (peso y rotundidad del H1) | H1 morado en Display, columna izquierda; a la derecha `HeroCollage` (lupa gigante, ojos, clics, aros loop) en SVG estático en lugar de fotos y chips de UI. Un solo CTA (sin segundo enlace: sería copy nuevo). Sin franja de logos ni de contadores (no hay cifras respaldadas: PROOF-02 es v2) |
| El problema | 3 columnas con icono, h3 y párrafo sobre fondo oscuro | S | Tono `dark`; 3 `PainCard` blancas (tono anidado `light`) con sombra dura naranja; en lugar de hexágonos con icono, una pegatina de collage (ojos, clic, lupa mini) y numeral morado por CSS |
| Por qué ahora | Bloque educativo con titular y frases cortas; barra corta de acento sobre el h2 | R (bloque), M (barra) | Tono `yellow`, 2 columnas: h2 y collage a la izquierda, lista de 5 afirmaciones a la derecha con filas separadas por reglas de 3 px. Sin CTA aquí (CONTEXT fija 4 CTA) |
| La solución | Rejilla 2x2 de tarjetas de servicio; lista numerada de capacidades | R (2x2), M (numeración), S (disco de check) | Tono `light`; 4 `PillarCard` pop con chip de collage propio (lupa, ojos, loop, clic). CTA debajo |
| Lo que logramos juntos | Afirmaciones de resultado en grande sobre fondo oscuro con discos de check | S ("después" en verde), R | Tono `dark`; 2x2 de bloques con borde amarillo de 3 px y disco de check amarillo. Donde falta respaldo, "FALTA CONFIRMAR" con el mismo estilo |
| Casos de éxito | Tarjeta de resultado con cifra dominante, resaltado sobre la cifra y chip en la esquina; la última tarjeta como bloque distinto | R (resaltado, chip), M (numerales grandes en acento), S (líneas de resultado con check) | 5 `MetricCard` pop blancas: canal como chip, cifra en Display morada con marcador amarillo, `<dl>` de sector, plazo y canal. Meta Ads en tarjeta ancha con lupa que resalta la cifra (versión estática del recuadro y flecha de R). Sin logos, sin gráficos, sin foto |
| Quiénes somos | Avatares de trazo sobre círculos suaves con nombre y cargo | M | 4 avatares ilustrados de una misma familia collage sobre círculos; nombres en Outfit 700 (no serif). Sin biografías (M) ni fotos |
| Qué incluye | Lista numerada de entregables con una línea de descripción; checklist con discos | M, S | Seis ítems abiertos (sin tarjeta, con regla superior de 3 px) para dar respiro entre bloques con tarjeta; disco de check amarillo |
| Cómo funciona | 3 pasos en tarjetas con etiqueta de paso, h3 y párrafo | R | 4 fases en `<ol>` sobre `dark`: numeral en disco amarillo, conector discontinuo naranja, plazo como chip. Sin etiqueta "STEP" inventada |
| Para quién es | Segmentación en columnas; par "apagado / resaltado" | S | 2 tarjetas: "es" amarilla, borde sólido, iconos de check; "no es" blanca, borde discontinuo, iconos de x. No depende del color |
| FAQ | Filas grandes con borde y icono más/menos | M, R | `<details>` en tarjetas blancas sobre `yellow`, resumen de 44 px o más, icono plus/minus. Sin JS |
| CTA final + formulario | h2 grande + un pill; tarjeta blanca con el formulario | R, M, S | `#agenda` de la Fase 1 (morado, 5fr/7fr, tarjeta blanca del iframe) con el h2 del CTA final y collage decorativo en la columna izquierda |
| Footer | Pie multicolumna con logo, correo y redes | R | 3 bloques mínimos: contacto, redes, privacidad. Sin enlaces de carreras, blog ni comunidad |
| Ritmo global | Padding de sección de 96 px en escritorio; fondos alternados; barra corta de acento sobre cada h2 | R (96 px), S y R (alternancia), M (barra) | `--section-y` 64 px bajo 1024 px y 96 px desde 1024 px; alternancia blanco, oscuro, amarillo, blanco, oscuro, blanco, amarillo, blanco, oscuro, blanco, amarillo, morado, blanco |
| Movimiento | Ninguno de las tres sirve como modelo aceptable: la única animación real (skale) es marquee y revelado | n/a | Presupuesto propio y limitado (ver `## Interaction Contract`) |

---

## Spacing Scale

Valores declarados: los de la Fase 1 (4, 8, 16, 24, 32, 48, 64) más un paso nuevo, 96, que la Fase 1 dejó abierto para esta fase ("el tope de la escala" era provisional). Todos múltiplos de 4, en `rem`.

| Token | Value | Usage en Fase 2 |
|-------|-------|-----------------|
| xs | 4px | Icono a texto, separación de chip |
| sm | 8px | Entre objetivos táctiles adyacentes, padding vertical de chip y de botón |
| md | 16px | Gap de rejillas de tarjetas bajo 640 px, padding de resumen de FAQ, separación entre párrafos |
| lg | 24px | Padding de tarjeta bajo 640 px, gap de rejillas desde 640 px, separación entre título y lead |
| xl | 32px | Padding de tarjeta desde 640 px, separación cabecera a contenido bajo 640 px |
| 2xl | 48px | Separación cabecera a contenido desde 640 px, gap de columnas de dos columnas, separación antes de un CTA de sección |
| 3xl | 64px | `--section-y` bajo 1024 px |
| 4xl (nuevo) | 96px | `--section-y` desde 1024 px. Solo para padding vertical de sección |

Reglas de ritmo:
- `--section-y`: 64 px bajo 1024 px, 96 px desde 1024 px. Aplica a todas las secciones, incluida `#agenda` (la Fase 1 la tenía en 64 px en todos los anchos; el planner ajusta la prueba e2e que lo afirme).
- Hero: padding superior 48 px bajo 1024 px y 64 px desde 1024 px (el header ya aporta aire arriba); inferior igual a `--section-y`.
- Cabecera de sección (h2 + lead): h2 a lead 16 px; cabecera a contenido 32 px bajo 640 px y 48 px desde 640 px.
- Rejilla de tarjetas: gap 16 px bajo 640 px y 24 px desde 640 px. Padding de tarjeta 24 px bajo 640 px y 32 px desde 640 px (`--card-pad`, `--card-gap`).
- Contenedor y gutter: sin cambios (`.wrap`, 72rem, `clamp(1rem, 4vw, 2rem)`). Ancho útil: 288 px a 320, 358 a 390, unos 707 a 768, 960 a 1024, 1088 a 1280.
- Medida de prosa: 65 ch (lead: 60 ch). Nunca justificado.

Exceptions:
- Objetivo táctil: `min-h-11` y `min-w-11` (44 px) en todo enlace, resumen de FAQ y control. CTA en `min-h-12` (48 px).
- Bordes y contornos de 3 px (borde pop, marcador, regla de fila, foco), 2 px de offset de foco: no son múltiplos de 4 y no se ajustan (los exige A11Y.md y el estilo pop). Sombras duras de 4 y 6 px y desplazamientos de 2 px son efecto, no espaciado.
- Tamaños de ilustración: avatar 96 px (bajo 640 px) y 120 px (desde 640 px), chip de pilar 64 px, disco de check 32 px, disco de fase 48 px, chip de texto de 32 px de alto. Todos múltiplos de 4.
- Nunca alturas fijas (`h-`) en contenedores de texto: solo `min-h`. Las ilustraciones sí llevan `width`/`height` o `aspect-ratio`.
- Reserva del iframe: sin cambios (`--form-min-h-sm` 1664 px, `--form-min-h-lg` 1536 px, medidos en la Fase 1).

```css
/* Extensión de src/styles/tokens.css (los valores de la Fase 1 no cambian) */
@theme static {
  --space-4xl: 6rem;                    /* 96 px */
  --text-title: clamp(1.25rem, 1.1rem + 0.6vw, 1.5rem);   /* 20 a 24 px */
  --text-title--line-height: 1.3;
  --section-y: 4rem;                    /* <1024 px */
  --card-pad: 1.5rem;
  --card-gap: 1rem;
  --radius-card: 1rem;
}
@media (min-width: 40em) { :root { --card-pad: 2rem; --card-gap: 1.5rem; } }
@media (min-width: 64em) { :root { --section-y: var(--space-4xl); } }
```

---

## Typography

Los 4 tamaños de la Fase 1 más **un quinto, Title**, previsto por la Fase 1 ("la Fase 2 puede agregar un tamaño de h3 en su propio contrato"). Excepción deliberada a la guía de 3 a 4 tamaños: una landing con h3 en tarjetas necesita un nivel entre Body y Heading. Pesos sin cambio: 400, 600 y 700 (los tres del brandbook). Todo en `rem` con `clamp()`.

| Role | Size | Weight | Line Height | Uso en Fase 2 |
|------|------|--------|-------------|---------------|
| Label | 14px fijo | 600 | 1.5 | Chips, `<dt>` de tarjeta de caso, enlaces de pie, skip links |
| Body | 16px a 18px | 400 (700 en botones y resúmenes de FAQ) | 1.6 | Párrafos, lead, respuestas de FAQ, texto de tarjetas |
| Title (nuevo) | 20px a 24px: `clamp(1.25rem, 1.1rem + 0.6vw, 1.5rem)` | 700 en h3 y nombres; 600 en afirmaciones de lista | 1.3 | h3 de tarjetas, afirmaciones de Por qué ahora y de Logramos juntos, cargo del equipo |
| Heading (h2) | 28px a 44px | 700 | 1.2 | h2 de cada sección |
| Display | 36px a 64px | 700 | 1.2 | `<h1>` del hero y cifras de `MetricCard` |

Reglas:
- Color de texto por tono: h1 y h2 con `var(--heading)`; cuerpo con `var(--on-surface)`. Enlaces de texto con `var(--link)`, subrayado permanente (regla global de la Fase 1).
- h3 de tarjeta: color `var(--on-surface)` del tono de la tarjeta (oscuro sobre blanco), no morado, para que el morado quede reservado a h1, h2, cifras y numerales.
- Cifras de `MetricCard` en Display: a 320 px "+3.808%" mide unos 150 px de 288 disponibles; "FALTA CONFIRMAR" parte en dos líneas por palabra. `overflow-wrap: anywhere` en cifras, h2 y h3.
- Sin `line-height !important`, sin texto justificado, sin `text-transform: uppercase` en texto de Ari (Label en mayúsculas solo si el texto ya viene así del doc).
- `<span lang="en">` para frases completas en inglés dentro del copy; ChatGPT, Gemini, Google y "GEO" no llevan `lang` (regla de la Fase 1).
- Un `<h3>` nunca salta de nivel: cada `<h3>` vive bajo un `<h2>`.

---

## Color

Sin neutrales inventados: cuatro colores de marca más blanco. Los tonos son bloques de superficie completos; las tarjetas usan un tono anidado `light` (fondo blanco) para reutilizar los mismos tokens.

**Fe de erratas de color (2026-09-19).**
- El morado vigente es `#4228D1` (decisión de Juan); el valor anterior salió de una etiqueta errónea de la página 8 del BrandBook.
- El crema `#F4F3E0` es token de superficie (chips y píldoras), no un tono: se combina solo con morado (7.63) y oscuro (14.37).
- Los ratios de la tabla que involucran al morado quedan reemplazados por los de `scripts/lib/contrast.mjs`: 8.55 sobre blanco, 5.43 sobre amarillo, y naranja sobre morado 2.95, prohibido en texto y UI (solo relleno decorativo con contorno).
- Morado sobre oscuro mide 1.88 y sigue prohibido. El resto de la tabla se conserva.

| Role | Value | Uso |
|------|-------|-----|
| Dominant | `#ffffff` (~45 % de la página por altura de sección) | Header, hero, solución, casos, incluye, para quién, footer, y el interior de toda tarjeta |
| Secondary | `#ffc602` amarillo (~20 %), `#212121` oscuro (~20 %), `#73187F` morado (~8 %) | Amarillo: Por qué ahora, Quiénes somos, FAQ. Oscuro: El problema, Lo que logramos juntos, Cómo funciona. Morado: solo `#agenda` |
| Accent (menos de 10 % de cualquier pantalla) | `#fd6938` naranja y `#ffc602` amarillo como relleno | Ver lista cerrada abajo |
| Ink | `#212121` | Texto principal sobre claro y amarillo, texto de CTA, bordes y sombras pop |
| Destructive | not used | Sin acciones destructivas ni rojo de marca |

Desviación consciente de 60/30/10: CONTEXT fija fondos alternados blanco, amarillo y oscuro, así que el "secundario" ocupa casi la mitad de la página. Lo que sí se conserva: el acento (naranja y amarillo como relleno de acción y marca) ocupa menos de 10 % de cualquier pantalla, y el naranja nunca es fondo de sección.

Accent reserved for (lista cerrada):
1. Relleno del CTA: naranja sobre tonos `light` y `yellow`, amarillo sobre `dark` y `purple`. Texto siempre `#212121`.
2. Marcador amarillo tras la cifra de `MetricCard` (solo sobre blanco, con texto morado).
3. Disco de check amarillo (Logramos juntos, Qué incluye) y disco de número amarillo (Cómo funciona).
4. Sombra dura naranja de tarjetas y CTA sobre tono `dark` (decorativa).
5. Anillo de foco: morado sobre `light`, oscuro sobre `yellow`, amarillo sobre `dark` y `purple`.
6. Relleno de ilustraciones de collage (decorativo, sin información).

Prohibido usar el acento para: encabezados, párrafos, bordes de tarjeta sobre claro, texto sobre claro (naranja) ni sobre blanco (amarillo).

### Tonos (extensión de `tokens.css`)

```css
:root, [data-tone="light"] {                 /* existentes + nuevos */
  --heading: var(--color-brand-purple);
  --bar: var(--color-brand-purple);          /* barra decorativa sobre el h2 */
  --mark: var(--color-brand-yellow);         /* marcador tras cifras */
  --pop-shadow-color: var(--color-brand-dark);
  --collage-stroke: var(--color-brand-dark);
}
[data-tone="yellow"] {
  --surface: var(--color-brand-yellow);  --on-surface: var(--color-brand-dark);
  --heading: var(--color-brand-purple);  --link: var(--color-brand-purple);
  --cta-bg: var(--color-brand-orange);   --cta-bg-hover: var(--color-brand-white);
  --on-cta: var(--color-brand-dark);     --focus-ring: var(--color-brand-dark);
  --bar: var(--color-brand-dark);        --pop-shadow-color: var(--color-brand-dark);
  --collage-stroke: var(--color-brand-dark);
}
[data-tone="dark"] {
  --surface: var(--color-brand-dark);    --on-surface: var(--color-brand-white);
  --heading: var(--color-brand-white);   --link: var(--color-brand-yellow);
  --cta-bg: var(--color-brand-yellow);   --cta-bg-hover: var(--color-brand-orange);
  --on-cta: var(--color-brand-dark);     --focus-ring: var(--color-brand-yellow);
  --bar: var(--color-brand-orange);      --pop-shadow-color: var(--color-brand-orange);
  --collage-stroke: var(--color-brand-white);
}
[data-tone="purple"] {                       /* existente, se agregan */
  --heading: var(--color-brand-white);
  --bar: var(--color-brand-yellow);      --pop-shadow-color: var(--color-brand-dark);
  --collage-stroke: var(--color-brand-white);
}
```

`CtaLink` cambia `border` y `box-shadow` para leer `--pop-shadow-color` en la sombra (el borde sigue siendo `#212121`).

### Pares aprobados (los que `scripts/check-contrast.mjs` debe agregar; los 9 de la Fase 1 siguen)

Ratios con la fórmula de luminancia relativa de WCAG (los medidos de `.claude/CLAUDE.md`). Umbral: texto normal 4.5, texto grande y UI 3.

| Texto o elemento | Fondo | Ratio | Uso en Fase 2 | Umbral |
|------------------|-------|------:|---------------|-------:|
| `#73187F` | `#ffffff` | 9.69 | h1, h2, cifras, enlaces sobre claro (sube de 3 a 4.5: ahora es texto) | 4.5 |
| `#73187F` | `#ffc602` | 6.15 | h2, enlaces y cifras sobre amarillo | 4.5 |
| `#212121` | `#ffc602` | 10.22 | Cuerpo sobre amarillo, texto de CTA, anillo de foco sobre amarillo | 4.5 |
| `#ffffff` | `#212121` | 16.10 | Cuerpo y h2 sobre oscuro | 4.5 |
| `#ffc602` | `#212121` | 10.22 | Enlaces, disco de check y anillo de foco sobre oscuro | 4.5 |
| `#fd6938` | `#212121` | 5.56 | Sombra naranja y borde de UI sobre oscuro | 3 |
| `#212121` | `#fd6938` | 5.56 | Texto de CTA sobre naranja | 4.5 |
| `#212121` | `#ffffff` | 16.10 | Cuerpo, h3 y anillo de foco oscuro sobre tarjeta blanca | 4.5 |

Pares que ya estaban y siguen: blanco sobre morado 9.69, amarillo sobre morado 6.15, naranja sobre morado 3.35 (solo UI o texto grande).

Pares prohibidos (fixtures negativos ya existentes; no se agregan nuevos, pero cada tono nuevo debe pasar la prueba de "par prohibido"): blanco sobre naranja 2.89, naranja sobre blanco 2.89, amarillo sobre blanco o blanco sobre amarillo 1.58, morado sobre oscuro 1.66, naranja sobre amarillo 1.84.

Reglas derivadas de los tonos nuevos:
- **Nunca morado sobre oscuro**: ni texto, ni icono, ni relleno de collage sobre `dark`. Un tono `dark` no puede declarar `--heading` ni `--link` en morado. Una sección `dark` nunca es contigua a la sección `purple`.
- **Nunca naranja o blanco como texto sobre `yellow`**. Sobre `yellow`, el hover del CTA es blanco con texto oscuro (16.10).
- **Toda tarjeta blanca sobre `yellow` o sobre blanco lleva borde oscuro de 3 px** (el borde blanco contra amarillo mide 1.58, así que el borde es lo que define la forma, 1.4.11). Sobre `dark` la tarjeta blanca se distingue por relleno (16.10) y la sombra naranja es decorativa.
- **El CTA naranja sobre `yellow`** (1.84 entre relleno y fondo) se define por su borde oscuro de 3 px (10.22), no por el relleno.
- **Texto sobre collage**: prohibido. Ningún texto se apoya en una ilustración; el collage vive en su propia celda y nunca detrás de texto.
- El estado no depende solo del color: chips, iconos de check y de x acompañan siempre al texto.

---

## Collage and Brand Assets Contract

**Fe de erratas del collage (2026-09-19).** El lenguaje vigente lo fija el plan 02-10 y reemplaza al de esta sección donde choquen:
- Loopy oficial de las mesas 13 (dos ojos) y 18 (un ojo) con su esquema por fondo; formas planas sin contorno con sombra dura; garabatos de trazo de 3 px; píldoras de texto real con `aria-hidden` y lista cerrada de palabras (`CHIP_WORDS`); retícula de puntos; el crema como superficie.
- Tamaños: pegatinas y chips de 96 x 80 px; Por qué ahora de 224 px (320 px desde 64em); avatares como Loopy sobre disco (`avatar-ojo-morado`, `avatar-ojo-amarillo`, `avatar-ojos-morado`, `avatar-ojos-amarillo`).
- Dos ranuras de foto (`PHOTO_SLOTS`): hero (344, 22, 192 x 250) y whynow (204, 14, 104 x 128), vacías hasta el plan 02-11.
- Peso: sprite de 8 símbolos de 10 KB o menos (hoy 6135 bytes) y `dist/index.html` de 40960 bytes o menos.
- Las filas de la tabla para lupa, ojos, clic, loop, pegatinas, chips y avatares quedan reemplazadas. La tabla no se reescribe.

**Fe de erratas de las fotos (2026-09-19).** El plan 02-11 llena las dos ranuras y matiza la regla de "ninguna imagen raster":
- Las únicas imágenes raster son dos fotos de stock con licencia (hero y Por qué ahora, `PHOTO_SLOTS`), tratadas en media tinta binaria con la tinta del token oscuro sobre el relleno de la ranura y con la sombra dura de la ranura.
- Cada foto es decorativa: `alt` vacío, dentro de una raíz `aria-hidden`; se sirve con `astro:assets` en png de 25600 bytes o menos, sin peticiones de terceros, y el h1 sigue siendo el LCP.
- El registro (fuente, autor, licencia, sha256 y aprobación de Ari) vive en `src/assets/photos/LICENSES.md`; `PUBLIC_ENV=production` no compila mientras haya una aprobación pendiente o una candidata sobrante.
- Pesos: `.hero-collage` de 8832 bytes o menos, Por qué ahora de 3712, imágenes de `/` de 40960 y `dist/index.html` de 42240 (tope global de 61440 sin cambio).

Estilo: **collage pop de línea gruesa**. Formas planas de color de marca, contorno de 3 px (`var(--collage-stroke)`), sin degradados, sin sombras suaves, sin texto dentro. Todo es SVG estático en línea con `aria-hidden="true"` y `focusable="false"`; ninguna imagen raster. Los colores salen de `var(--color-brand-*)` y `var(--collage-stroke)`, nunca de un hex en el componente (regla de la Fase 1: sin hex en `src/components`).

| Pieza | viewBox | Composición | Uso |
|-------|---------|-------------|-----|
| Lupa | 240x240 | Aro de 3 px, lente rellena (amarillo, blanco o morado según tono), mango en otro color de marca | Hero (gigante), Problema (mini), pilar Auditoría, tarjeta Meta Ads |
| Ojos | 120x64 | Dos óvalos blancos con contorno, pupilas oscuras; variantes con la mirada a la izquierda, derecha o abajo | Hero (mirando al CTA), Problema, pilar Estrategia, Por qué ahora, Agenda |
| Clic | 80x80 | Cursor en flecha con contorno y ráfaga de 3 a 5 trazos | Hero, Problema, pilar Reportes, Agenda |
| Loop | 160x160 | Círculos concéntricos o espiral de 2 a 3 vueltas (el "loop" del isotipo) | Hero (aros de fondo), pilar Equipo dedicado, conector de fases |
| Destellos y puntos | 24 y patrón | Marca "+" y parche de puntos (patrón SVG) | Relleno de composición |
| HeroCollage | 560x520 | Lupa gigante centrada a la derecha, tres aros loop detrás (naranja y amarillo), ojos asomando arriba a la izquierda de la lupa, dos clics apuntando al lente, 4 destellos, un parche de puntos morado | `Hero`. Peso máximo 8 KB |
| AgendaCollage | 480x480 | Lupa, ojos mirando a la derecha (hacia el formulario) y un clic | Columna izquierda de `#agenda` desde 1024 px; oculto (`display: none`) bajo 1024 px |
| Pegatinas | 64x64 | Ojos, clic y lupa mini con rotación fija de -4 a 6 grados | Encabezado de cada `PainCard` |
| Chips de pilar | 64x64 | Círculo con contorno; lupa (amarillo), ojos (naranja), loop (morado con trazos blancos), clic (blanco) | `PillarCard` |
| Avatares | 120x120 | 4 personajes de una misma familia "Loopy": círculo de fondo, cabeza redonda, ojos del sistema, un accesorio distinto (lupa, auriculares, gafas, gorro). Cada uno con su color dominante de marca. **No son retratos ni buscan parecido** | `TeamCard` |
| Isotipo y logo | según Drive | Logo horizontal y solo isotipo "Loopy" (Ari + lupa) en SVG | Header, footer, favicon |

Reglas:
- **Color por tono**: sobre `dark` y `purple` el contorno es blanco y no hay ningún relleno morado; sobre `light` y `yellow` el contorno es oscuro. Sobre `yellow` los rellenos pueden ser blanco, morado y naranja.
- **Sin texto dentro de SVG** y sin `<title>` en las decorativas. Si una ilustración pasara a informativa, exige `alt` confirmado por una persona (A11Y.md).
- **Peso**: colección de collage inline total menor a 40 KB sin comprimir; HTML del documento menor a 60 KB sin comprimir. Piezas repetidas (check, plus, minus, lupa, ojos, clic, loop) se definen una vez como `<symbol>` en un sprite inline renderizado una sola vez en `BaseLayout` (posicionado fuera de flujo, `aria-hidden`, no `display: none`) y se usan con `<use href>`. Las variables CSS del tono atraviesan `<use>`.
- **Logo e isotipo (DSGN-02)**: tomarlos del Drive de Ari (carpeta de branding: ISOTIPO, VARIANTE, MONOCROMÁTICO, SOBRE COLOR, ORIGINAL, `.ai`, BrandBook PDF). Convertir el `.ai` a SVG (un `.ai` moderno es PDF compatible; por ejemplo `pdftocairo -svg` o exportar desde Inkscape) y limpiar con SVGO conservando el `viewBox`. Si falta el vectorial, redibujar el isotipo Loopy y marcarlo para aprobación de Ari.
- **Área de salvado**: leerla del BrandBook PDF y fijarla como token `--logo-clear`. Suposición mientras no se lea: la mitad de la altura del logo en los cuatro lados. Altura mínima: 32 px el logo horizontal y 24 px el isotipo. Sobre `light` va la versión original; en `dark` o `purple`, la versión "sobre color" o monocromática blanca (el logo solo aparece en header y footer, ambos sobre blanco, así que la variante oscura es solo prevención).
- **Favicon**: reemplazar los favicons de Astro (`public/favicon.svg` y `.ico`) por el isotipo.

---

## Page Architecture

Orden y tono (CONTEXT fija el orden). Cada sección es un `<section aria-labelledby>` con un `<h2>`; solo el hero tiene `<h1>`.

| # | Sección | id | Tono | h2 / heading | CTA |
|---|---------|----|------|--------------|-----|
| 0 | Header | n/a | `light` | n/a (banner) | `header` (desde 640 px) |
| 1 | Hero | `#inicio` | `light` | `<h1>` | `hero` |
| 2 | El problema | `#problema` | `dark` | h2 + h3 por dolor | n/a |
| 3 | Por qué ahora | `#por-que-ahora` | `yellow` | h2 | n/a |
| 4 | La solución | `#solucion` | `light` | h2 + h3 por pilar | `solucion` |
| 5 | Lo que logramos juntos | `#resultados` | `dark` | h2 | n/a |
| 6 | Casos de éxito | `#casos` | `light` | h2 + h3 por caso | `casos` |
| 7 | Quiénes somos | `#nosotros` | `yellow` | h2 + h3 por persona | n/a |
| 8 | Qué incluye | `#incluye` | `light` | h2 + h3 por entregable | n/a |
| 9 | Cómo funciona | `#como-funciona` | `dark` | h2 + h3 por fase | n/a |
| 10 | Para quién es | `#para-quien` | `light` | h2 + h3 por columna | n/a |
| 11 | FAQ | `#faq` | `yellow` | h2 (preguntas en `<summary>`) | n/a |
| 12 | CTA final + formulario | `#agenda` | `purple` | h2 | destino (sin enlace a sí misma) |
| 13 | Footer | n/a | `light` | n/a (contentinfo) | n/a |

Secuencia de tonos: claro, claro, oscuro, amarillo, claro, oscuro, claro, amarillo, claro, oscuro, claro, amarillo, morado, claro. Ninguna sección repite el tono de su vecina; el morado no toca el oscuro (la sección 11 es amarilla y el footer claro).

- Los 4 CTA del sitio (header, hero, solución, casos) llevan el mismo texto visible "Agenda tu llamada de 30 minutos" y `href="#agenda"` (`/#agenda` en `/privacidad`). La duración sale de `call.duration`. La sección `#agenda` no lleva un `CtaLink` a sí misma (un ancla al propio destino no hace nada y agrega una parada de teclado): es el CTA final por sí misma (ver Decisiones y supuestos).
- Todas las secciones llevan `scroll-margin-top: 24px`.
- Landmarks: `<header>`, `<main id="main" tabindex="-1">`, `<footer>`. Sin `<nav>` de sitio (solo el de skip links y, en el footer, uno de enlaces con `aria-label`).
- Barra decorativa sobre cada h2: pseudoelemento de 48x8 px con `border-radius: 999px`, `background: var(--bar)`, `aria-hidden` por ser CSS. No lleva información.

---

## Section Contracts

Formato: layout por rango de ancho (A = 320 a 639 px, B = 640 a 1023 px, C = 1024 px en adelante), elementos, ranuras de copy y estados, movimiento y criterio de salida. Las ranuras se llenan con la cadena exacta del doc de Ari; si el doc no la trae, la ranura muestra "FALTA CONFIRMAR" y se lista en `PENDING-COPY.md`.

### 0 y 1. Header y Hero (CONT-01, DSGN-02)

Header: `light`, padding vertical 16 px, `flex items-center justify-between`. Logo horizontal a la izquierda (altura 32 px mínimo, sin enlace en `/`). CTA `header` a la derecha desde 640 px (`display: none` bajo 640 px: sale del orden de tabulación).

Hero (`#inicio`, `light`, `overflow-x: clip`):
- **A**: una columna. Orden del DOM y visual: h1, subtítulo, descripción, CTA, collage (240 px de alto, centrado, `max-width: 100%`). Padding superior 48 px.
- **B**: una columna; collage a 320 px de alto a la derecha del CTA si cabe, si no debajo.
- **C**: `grid-template-columns: minmax(0, 7fr) minmax(0, 5fr)`, gap 48 px, `align-items: center`. Texto a la izquierda, `HeroCollage` a la derecha (`width: min(100%, 30rem)`, puede sangrar hasta el gutter derecho, nunca más allá del viewport).
- Elementos: `<h1>` Display en `var(--heading)` (morado), máximo 22 ch (regla global). Subtítulo y descripción en Body, `--on-surface`, máximo 55 ch, separación 24 px bajo el h1. CTA a 32 px bajo el texto, `min-h-12`, naranja con texto oscuro. Sin segundo CTA, sin chips, sin franja de contadores ni de logos.
- Ranuras: `hero.h1` (Copy v2: "Crecemos tu tienda a través de Google, ChatGPT y Gemini."), `hero.subtitle` (con `{term}`), `hero.description` (si el doc no la separa del subtítulo, la ranura muestra "FALTA CONFIRMAR"; CONT-01 la exige). El h1 debe declarar categoría, público y resultado tal cual del doc.
- Aceptación en primer pantallazo: a 390x844 se ven h1, subtítulo y CTA sin scroll; a 1280x800 se ven h1, subtítulo, CTA y el collage completo.
- Movimiento: entrada del collage (una sola vez, ver `## Interaction Contract`). El h1, el texto y el CTA nunca se animan ni parten de opacidad menor a 1 (el h1 es el LCP).
- Salida: 1 solo `<h1>`; LCP es texto; el collage no pasa detrás de ningún texto; a 320 px sin scroll horizontal.

### 2. El problema (CONT-02)

`dark`. Cabecera: h2 en blanco, lead opcional del doc.
- **A**: 1 columna de `PainCard`. **B**: 1 columna con tarjetas a ancho completo y encabezado de tarjeta en fila. **C**: 3 columnas iguales (`repeat(3, minmax(0, 1fr))`, gap 24 px).
- `PainCard`: tono anidado `light` (blanco), `border-radius: var(--radius-card)`, padding `--card-pad`, sombra dura naranja `6px 6px 0 var(--pop-shadow-color)` (tomada del tono padre). Encabezado de tarjeta: numeral CSS (contador, Display reducido a Heading, morado) a la izquierda y pegatina de collage 64 px a la derecha (ojos, clic, lupa mini). Debajo: h3 en Title y cuerpo en Body.
- Ranuras: por dolor, `title` y `body`. Si el doc da solo una frase por dolor, se renderiza como `<p>` en Title 600 y no se crea h3 (decisión del planner con el doc abierto). Los tres dolores son los del Copy v2 (CONT-02).
- Sin CTA. Sin movimiento (las tarjetas no son interactivas y no reaccionan al hover).
- Salida: 3 tarjetas de altura pareja en C (`align-items: stretch`), texto oscuro sobre blanco 16.10, sin morado sobre oscuro en ninguna pegatina.

### 3. Por qué ahora (CONT-03)

`yellow`. 
- **A y B**: h2, lead, collage compacto (ojos y lupa, 160 px), lista. **C**: `grid-template-columns: minmax(0, 5fr) minmax(0, 7fr)`, gap 48 px; izquierda h2, lead y collage compacto (`align-self: start`); derecha la lista.
- Lista: `<ul role="list">` de las afirmaciones de mercado del Copy v2 (según COPY-VERIFICATION, cinco: Google sigue siendo la mayor parte del tráfico de búsqueda; una parte creciente de tus clientes le pregunta a ChatGPT o a Gemini; los ads se encarecen con el tiempo; el orgánico se abarata; el contenido que rankea hoy sigue trayendo clientes el año que viene). Cada ítem: `border-top: 3px solid` oscuro, padding vertical 16 px (A) y 24 px (B y C), texto en Title 600. La última fila lleva además borde inferior.
- Estados: la afirmación "el orgánico se abarata" (inferencia sin respaldo literal) y la de datos de EE.UU. se muestran tal cual y se listan como `pending` para Ari (ver hallazgos).
- Sin CTA. Sin movimiento.
- Salida: filas legibles a 320 px (texto largo parte sin desborde), texto morado y oscuro solo con los pares 6.15 y 10.22, collage sin tocar el texto.

### 4. La solución (CONT-04)

`light`.
- **A**: 1 columna. **B y C**: 2 columnas (`repeat(2, minmax(0, 1fr))`), gap `--card-gap`. Cuatro pilares (auditoría, estrategia Google e IA, equipo dedicado, reportes) en ese orden.
- `PillarCard`: fondo blanco, borde `var(--border-pop)`, radio 16 px, sombra `var(--shadow-pop)` (4 px), padding `--card-pad`, `display: flex; flex-direction: column`. Chip de collage de 64 px arriba a la izquierda; h3 Title 700 a 16 px bajo el chip; cuerpo Body a 8 px del h3. Alto parejo por fila.
- Ranuras: por pilar `title` y `body` del doc. El cuerpo del pilar 4 (Reportes) se publica sin la nota `[VERIFICAR ...]`; la nota va en `reason` de la afirmación, que queda `pending` (se lista para Ari; el desglose Google vs IA no se inventa).
- Titular de la sección: el del doc. El doc trae "AEO" en ese titular (hallazgo reportado): la guarda lo rechaza; no se edita en silencio, se marca `pending` y se pide a Ari.
- CTA `solucion` a 48 px bajo la rejilla, alineado a la izquierda.
- Salida: los 4 chips distintos entre sí, sin texto en imágenes, CTA con la etiqueta idéntica a la del header.

### 5. Lo que logramos juntos (CONT-05)

`dark`.
- **A**: 1 columna. **B y C**: 2x2. Cuatro resultados del doc.
- `ResultItem`: `border: 3px solid var(--color-brand-yellow)`, radio 16 px, padding `--card-pad`, fila con disco de check de 32 px (amarillo con check oscuro de 3 px) y el texto en Title 600 blanco (16.10). Sin fondo de tarjeta.
- Estados: el resultado con la cifra `[VERIFICAR]` (30 % a 50 % menos de presupuesto de ads) se muestra como "FALTA CONFIRMAR" en el mismo estilo y queda `pending`. Sin cifra suavizada ni inventada (CONT-05).
- Sin CTA (el CTA de casos cubre este tramo). Sin movimiento.
- Salida: cuatro bloques de la misma altura por fila; el amarillo sobre oscuro solo en borde y disco.

### 6. Casos de éxito (CONT-06)

`light`. Cinco `MetricCard`: (1) ventas, e-commerce de vape, (2) tráfico, academia, (3) conversiones, SaaS, (4) clics, app infantil, (5) tráfico, marca personal, Meta Ads (caso propio, ancho). Las cifras del doc según REQUIREMENTS y COPY-VERIFICATION: +85 %, +237 %, x3, +3.808 % y +500 %.
- **A**: 1 columna. **B**: 2 columnas; la 5.ª ocupa las 2 (`grid-column: 1 / -1`). **C**: 3 columnas; tarjetas 1 a 3 en la primera fila, la 4.ª en la primera columna de la segunda fila y la 5.ª ocupa las columnas 2 y 3 (`grid-column: span 2`) con layout horizontal.
- `MetricCard` (tarjeta blanca pop, `<article>`): chip de canal arriba (Label 600, borde 3 px, radio pill, alto 32 px, `max-width: 100%`, admite dos líneas); cifra en Display morado con **marcador amarillo** detrás del tercio inferior (`background: linear-gradient(transparent 60%, var(--mark) 60%)` o equivalente, es un relleno plano, no un degradado visual); `<h3>` Title con la métrica ("ventas", "tráfico"); `<dl>` con tres pares "Sector", "Plazo", "Canal" (`<dt>` Label 600, `<dd>` Body). Los tres `<dt>` son microcopy estructural; los `<dd>` vienen del doc o son "FALTA CONFIRMAR".
- Tarjeta 5 (ancha): la cifra a la izquierda y el detalle a la derecha, con una **lupa estática** (Lupa 96 px) que rodea la cifra como recuadro que "resalta" (versión sin movimiento del recuadro y la flecha de rankingonai). Solo esta tarjeta lleva lupa.
- Estados: sector, plazo y canal faltantes muestran "FALTA CONFIRMAR" en su `<dd>`; ninguna tarjeta se oculta ni queda con hueco (CONTEXT). El plazo es `pending` en las cinco tarjetas hasta que Ari lo confirme.
- CTA `casos` a 48 px bajo la rejilla.
- Salida: cifra es el elemento más grande de cada tarjeta; a 320 px "+3.808%" y "FALTA CONFIRMAR" caben sin desborde; la lupa no tapa texto; el caso Meta Ads está en su propia tarjeta.

### 7. Quiénes somos (CONT-07)

`yellow`.
- **A**: 1 columna. **B**: 2 columnas. **C**: 4 columnas (`repeat(4, minmax(0, 1fr))`, gap 24 px). Orden: Arianna Lupi, Verónica Romero, Juan Angulo, Miguel Pacheco.
- `TeamCard`: tarjeta blanca pop, contenido centrado a la izquierda (`text-start`), avatar de 96 px (A) o 120 px (B y C) con `aria-hidden="true"`, h3 con el nombre (Title 700), debajo el cargo (Body 600): fundadora, directora de proyectos, director técnico, especialista SEO. Nombre y cargo en texto real.
- Sin biografía, sin credencial, sin enlaces a redes (la credencial y el consentimiento del equipo son pendientes de Ari en STATE; no se muestran hasta tenerlos).
- Salida: avatares de una misma familia y visualmente distintos; nombres largos ("Verónica Romero") parten en dos líneas sin desborde a 4 columnas.

### 8. Qué incluye (CONT-08)

`light`.
- **A**: 1 columna. **B**: 2 columnas. **C**: 3 columnas (3x2), gap 24 px en columnas y 32 px en filas.
- `IncludeItem` (sin tarjeta, sin sombra): `border-top: 3px solid var(--on-surface)`, padding superior 16 px; disco de check 32 px (amarillo con contorno oscuro y check oscuro), h3 Title 700, descripción Body si el doc la trae. Seis entregables del Copy v2.
- Es `<ul role="list">`, no tabla. Sin CTA. Sin movimiento.
- Salida: el bloque respira frente a los dos bloques con tarjeta vecinos (variedad de layout), 6 ítems parejos.

### 9. Cómo funciona (CONT-09)

`dark`. Cuatro fases en `<ol role="list">` con `counter-reset`.
- **A y B**: lista vertical; riel izquierdo con línea discontinua de 3 px naranja (decorativa) que une los discos; cada fase es una fila (disco a la izquierda, contenido a la derecha). **C**: 4 columnas (`repeat(4, minmax(0, 1fr))`, gap 24 px); disco arriba y la línea discontinua horizontal cruza por detrás de los discos.
- `StepItem`: disco de 48 px (amarillo, número oscuro en 700, generado por contador CSS), h3 Title 700 en blanco, descripción Body en blanco, **chip de plazo** (Label 600, texto amarillo con borde amarillo de 3 px, `max-width: 100%`, admite dos líneas).
- Estados: los plazos de las cuatro fases son `pending`: el chip muestra "FALTA CONFIRMAR" hasta que Ari los confirme (CONTEXT). Título y descripción de fase vienen del doc.
- Sin CTA. Sin movimiento.
- Salida: numeración visible y lista semántica (lector de pantalla anuncia una lista de 4), plazos en chips que no desbordan a 320 px.

### 10. Para quién es y para quién no (CONT-10)

`light`.
- **A**: 1 columna, "es" primero. **B y C**: 2 columnas iguales, gap 24 px (desde 640 px).
- Columna "es": tarjeta de fondo `#ffc602`, borde 3 px sólido oscuro, sombra pop, iconos de check (oscuros) al inicio de cada línea, texto oscuro (10.22). Columna "no es": tarjeta blanca, borde 3 px **discontinuo** oscuro, sin sombra, iconos de x oscuros. Cada una con h3 ("Para quién es", "Para quién no es"). No depende del color: cambian el icono, el trazo del borde y el h3.
- Ranuras: listas del doc. Debe comunicar el perfil de USD 200k o más al año. **Nunca** publicar rangos de inversión mensual (4 a 5k al mes, 1.5k al mes) que Ari no haya aprobado: si el doc los trae, la línea muestra "FALTA CONFIRMAR" y se avisa a Ari.
- Sin CTA. Sin movimiento.
- Salida: se distinguen las dos columnas en escala de grises (icono y borde), 2 columnas alineadas en altura.

### 11. FAQ (CONT-11)

`yellow`.
- **A y B**: h2 y luego la lista. **C**: `minmax(0, 5fr) minmax(0, 7fr)`, gap 48 px; h2 a la izquierda (`align-self: start`), lista a la derecha.
- Lista de 5 a 6 `<details>` (no exclusivos), separados 16 px. Cada uno: tarjeta blanca, borde 3 px oscuro, radio 16 px. `<summary>`: `display: flex; justify-content: space-between; align-items: center; gap: 16 px`, `min-h-11`, padding 16 px (A) y 24 px (B y C), texto de la pregunta en Body 700, icono plus (cerrado) o minus (abierto) de 24 px al final, `list-style: none` y `::-webkit-details-marker` oculto. Respuesta en Body con padding igual, separada por una regla de 3 px oscura.
- Preguntas (temas de CONTEXT): qué es GEO, duración de la llamada, qué preparar, inversión, tiempos de resultados y si aplica a mi negocio. Pregunta y respuesta salen tal cual del doc; si el doc no trae alguna, el `<summary>` y la respuesta muestran "FALTA CONFIRMAR" y se pide a Ari (no se redacta). Sin pregunta de garantía. La respuesta de inversión no publica cifras sin aprobación.
- Sin JS: `<details>` nativo. Sin transición de apertura.
- Salida: cada resumen se abre con Enter y con Espacio, el foco se ve (anillo oscuro sobre amarillo), respuesta larga parte sin desborde.

### 12. CTA final y formulario (CONT-13; extiende `#agenda` de la Fase 1)

`purple`. Conserva la estructura de la Fase 1: `<section id="agenda" aria-labelledby="agenda-title">`, h2 con `tabindex="-1"` e id `agenda-title` (lo usa `cta-focus.ts`), rejilla `5fr / 7fr` desde 1024 px, orden del DOM igual al visual, tarjeta `.form-embed` blanca con el iframe, `min-height` medido, enlace de respaldo siempre visible y `noscript`.
- Cambios: (1) el h2 pasa a ser el titular del CTA final del Copy v2 ("¿Listo para que te encuentren cuando te estén buscando?", según REQUIREMENTS); el texto "Agenda tu llamada" de la Fase 1 sale del h2. (2) La intro sigue siendo el cuerpo del CTA final del doc (ya en el YAML). (3) `AgendaCollage` (lupa, ojos mirando a la derecha, clic) en la columna izquierda, bajo el enlace de respaldo, solo desde 1024 px; bajo 1024 px no se muestra. (4) `--section-y` responsivo (64 y 96 px).
- Sin cambios en: borde, radio y sombra de la tarjeta, `overflow: visible !important`, `min-height` por token, atributos del iframe, textos de respaldo y `noscript`.
- El collage nunca se superpone a la tarjeta del formulario ni al iframe (protege el foco y la medición de FORM-04).
- Salida: las pruebas e2e de la Fase 1 sobre foco al h2, respaldo y sin JS siguen pasando con el texto nuevo del h2.

### 13. Footer y privacidad (CONT-12)

Footer: `light`, `border-top: 3px solid` oscuro, padding vertical `--section-y`. 
- **A**: 1 columna apilada. **B**: 2 columnas. **C**: 3 bloques (`minmax(0, 1.2fr) 1fr 1fr`).
- Bloques: (1) logo horizontal y, si el doc lo trae, la línea de marca; (2) contacto (correo con `mailto:`); (3) redes (enlaces con texto visible) y el enlace "Política de privacidad" a `/privacidad`. Todos los enlaces en `--link` (morado 9.69), subrayado permanente, `min-h-11`, separados 8 px. `<nav aria-label>` para el grupo de enlaces del pie (etiqueta estructural).
- Correo y redes son pendientes de Ari: cada dato faltante muestra "FALTA CONFIRMAR". Sin "todos los derechos reservados", año ni texto legal que no venga del doc.
- Página `/privacidad`: `BaseLayout`, header con logo enlazado a `/` y CTA con `href="/#agenda"`, `<main>` con un único `<h1>` "Política de privacidad" y el cuerpo "FALTA CONFIRMAR" en Body, footer. Los skip links deben apuntar a algo existente: en `/privacidad` el segundo salto se omite o enlaza a `/#agenda`. `noindex` hasta que exista el texto legal.
- Salida: los enlaces del pie miden 44 px de alto, no hay scroll horizontal a 320 px, el enlace de privacidad abre una página real.

---

## Copywriting Contract

Todo texto vive en `landing.es.yaml` como `{text, status}`. Español neutro, trato de "tú", sin voseo, sin guiones largos, sin "AEO". Regla de Juan (2026-09-18): nada se reescribe ni se humaniza; donde falta el dato la página muestra **"FALTA CONFIRMAR"** (en mayúsculas, exacto, en el estilo tipográfico normal de la ranura), nunca placeholders vacíos, etiquetas de borrador ni contenido oculto; el ítem se lista en `PENDING-COPY.md` (generado con `npm run pending`) y el build de producción sigue fallando mientras haya `pending` o "FALTA CONFIRMAR" (COPY-02). Los componentes no leen el estado de la afirmación (regla de la Fase 1): el relleno es el propio texto de la ranura.

| Element | Copy |
|---------|------|
| Primary CTA (4 lugares) | "Agenda tu llamada de 30 minutos" (`call.duration` es `pending`; el verbo y el sustantivo son fijos) |
| Hero H1 | Tal cual del Copy v2: "Crecemos tu tienda a través de Google, ChatGPT y Gemini." |
| Hero subtítulo | Tal cual del Copy v2 (ya en el YAML, con `{term}`) |
| CTA final H2 | "¿Listo para que te encuentren cuando te estén buscando?" |
| CTA final intro | Cuerpo del CTA final del Copy v2 (ya en el YAML) |
| Etiquetas de `<dt>` de caso | "Sector", "Plazo", "Canal" (microcopy estructural, `verified`) |
| Columnas de Para quién | "Para quién es" y "Para quién no es" (nombres de CONTEXT; confirmar con el doc) |
| Enlace de privacidad | "Política de privacidad" (CONTEXT) |
| Nombre accesible del logo | "Loops Growth" |
| Empty state heading | not applicable: no hay listas de datos dinámicos |
| Empty state body | Dato faltante: "FALTA CONFIRMAR" en la ranura (sin texto adicional) |
| Error state | Solo el formulario: "¿El formulario no carga o prefieres abrirlo aparte?" con el enlace de respaldo (Fase 1, sin cambios) |
| Destructive confirmation | none: la fase no tiene acciones destructivas |

### Ranuras que muestran "FALTA CONFIRMAR" hoy (todas `pending`, confirma Ari)

| Ranura | Motivo |
|--------|--------|
| Resultado con "30 % a 50 % menos de presupuesto de ads" (Lo que logramos juntos) | `[VERIFICAR]`, sin respaldo propio (COPY-VERIFICATION) |
| Nota de desglose Google vs IA (pilar Reportes) | `[VERIFICAR]`; el pilar se publica sin ella y la nota queda en `reason` |
| Sector y plazo de cada caso que no traiga el doc; plazo de las 5 tarjetas | CONTEXT |
| Plazo de las 4 fases de Cómo funciona | CONTEXT |
| Cuerpo de `/privacidad` | Ari debe entregar el texto legal |
| Correo de contacto y redes del footer | Sin confirmar (STATE) |
| Preguntas o respuestas del FAQ que el doc no traiga | Se pide a Ari |
| `hero.description` si el doc no la separa del subtítulo | CONT-01 |

### Ítems que se muestran tal cual pero se listan para que Ari los confirme

`brand.term` (SEO/GEO), `call.duration` (30 minutos, el embudo dice 20), subtítulo del hero, intro de `#agenda`, título provisional (Fase 3), la afirmación "el orgánico se abarata" (inferencia, COPY-VERIFICATION 3d), la afirmación de clientes que preguntan a ChatGPT o Gemini (datos de EE.UU., 3b), el caso de Meta Ads (no es SEO/GEO: ¿encaja?) y el consentimiento y la credencial del equipo.

### Hallazgos para Ari (el guardián `check-copy` los rechaza; no se editan en silencio)

| # | Hallazgo | Estado | Acción |
|---|----------|--------|--------|
| 1 | Aparece "AEO" en el titular de La solución (reportado por el orquestador; no verificado por mí) | Rechazado por la guarda en producción | Ari decide SEO/GEO o AEO; mientras tanto la ranura queda `pending` y visible tal cual |
| 2 | Error tipográfico "estan" sin tilde (reportado por el orquestador; ubicación por localizar en el doc) | No es voseo, pero es un error de ortografía | Ari lo corrige en el doc; el ejecutor no lo edita |
| 3 | Dos `[VERIFICAR]`: rango 30 % a 50 % y desglose Google vs IA | Bloquean producción | Ari respalda con datos o suaviza |
| 4 | Mezcla "SEO/GEO" y "SEO y AEO" (PROJECT.md) | Riesgo de inconsistencia | Un solo término en `brand.term` |
| 5 | Llamada de 30 minutos (doc) frente a 20 minutos (embudo y formulario) | Riesgo de contradicción con ClickUp | Ari alinea; se cambia en `call.duration` |
| 6 | Rangos de inversión (4 a 5k al mes, 1.5k al mes) si aparecen en Para quién es | CONTEXT los prohíbe | Ari aprueba o se dejan como "FALTA CONFIRMAR"; el planner agrega una guarda para esos patrones |
| 7 | Lenguaje de promesa ("garantizamos", "aparecerás", "#1") si el doc lo trae | PITFALLS 4 | Solo se reporta; no se reescribe |
| 8 | Voseo, guiones largos, `[VERIFICAR]`: la guarda ya los detecta en producción | Automático | Reportar a Ari lo que aparezca |

---

## Interaction Contract

### Orden de tabulación (sin `tabindex` positivos)
1. Skip link "Saltar al contenido". 2. Skip link "Saltar al formulario". 3. CTA del header (desde 640 px). 4. CTA del hero. 5. CTA de La solución. 6. CTA de Casos de éxito. 7. Resúmenes del FAQ, uno por uno (5 o 6). 8. Enlace de respaldo de `#agenda`. 9. Contenido del iframe (comportamiento del navegador, sin trampa). 10. Footer: correo, redes, política de privacidad. El planner actualiza la prueba e2e de orden de tabulación de la Fase 1 (`a11y-base.spec.ts` caso a).

### Estados
| Elemento | Estados |
|----------|---------|
| CtaLink | Los de la Fase 1. En tono `yellow` el hover cambia a blanco; en `dark` a naranja. Sombra según `--pop-shadow-color`. Desplazamiento de hover y active solo bajo `motion-safe` |
| Tarjetas (Pain, Pillar, Metric, Team, Result, Include, ForWhom) | No interactivas: **sin hover, sin cursor de puntero, sin desplazamiento** (no deben parecer clicables) |
| `<summary>` de FAQ | default; hover: el icono se rellena de amarillo con contorno oscuro; focus-visible: anillo del tono (oscuro sobre amarillo) con offset 2 px; abierto: icono minus. Sin transición bajo `reduce`; con `no-preference` solo el giro de 150 ms del icono |
| Enlaces de texto y del footer | Subrayado permanente; hover engrosa el subrayado a 3 px; foco de 3 px |
| Todo | Nunca `outline: none`; foco visible en cada tono |

### Foco y salto a `#agenda`
Sin cambios respecto a la Fase 1 (`cta-focus.ts`, id `agenda-title`, `preventScroll`, `scroll-behavior: smooth` solo con `no-preference`). Los CTA nuevos son `<a href="#agenda">` y quedan cubiertos por el mismo script sin tocarlo.

### Presupuesto de movimiento (DSGN-05; `impeccable animate` y `design-taste-frontend` se limitan a esto)
Todo bajo `@media (prefers-reduced-motion: no-preference)`, solo CSS, solo `transform` (nunca `opacity` por debajo de 1 en texto ni en CTA), sin JS nuevo.

| Efecto | Detalle | Duración |
|--------|---------|----------|
| CTA hover y active | Los de la Fase 1 | 150 ms |
| Entrada del `HeroCollage` | Una sola vez al cargar: cada pieza pasa de `scale(0.94) rotate(var(--r-from))` a `scale(1) rotate(var(--r))`, escalonado 80 ms, máximo 6 piezas, ya visibles desde el primer cuadro | 600 ms por pieza, total menor a 1,2 s |
| Pupilas de los ojos del hero | Un desplazamiento único de 4 px hacia el CTA tras la entrada | 400 ms, una vez |
| Deriva de collage al hacer scroll (opcional, prioridad baja) | `animation-timeline: view()` dentro de `@supports`, `transform: translateY` de hasta 12 px, solo piezas decorativas | Ligada al scroll, no automática |
| Giro del icono de FAQ | plus a minus | 150 ms |

Prohibido: marquee, carruseles con auto-avance, animaciones infinitas, parpadeo mayor a 3 por segundo, revelado por opacidad o por JS, parallax sobre texto, ojos que siguen el puntero (diferido a v2), scroll-jacking, cualquier animación sobre el h1, el subtítulo o el CTA. Con `prefers-reduced-motion: reduce` no debe existir ninguna animación ni transición en la página (los `getAnimations()` de la página deben ser 0).

### JavaScript
Único JS propio: `cta-focus.ts` (más el script de terceros de ClickUp). Sin islas, sin `ClientRouter`. Todo el contenido, incluidas las respuestas del FAQ (`<details>` nativo), es alcanzable sin JavaScript.

---

## Responsive

Puntos de quiebre globales: 40em (640 px) y 64em (1024 px). Además se verifican 320, 390, 768 y 1280 px.

| Ancho | Comportamiento |
|-------|----------------|
| 320 px | 1 columna en todo, gutter 16 px, CTA del header oculto, collage del hero 240 px de alto bajo el CTA, FAQ y tarjetas a ancho completo, cifras con `overflow-wrap: anywhere`, sin scroll horizontal |
| 390 px | Igual; el hero muestra h1, subtítulo y CTA sin scroll |
| 640 px | Aparece el CTA del header; rejillas de 2 columnas (pilares, resultados, casos, equipo, incluye, para quién); 5.ª tarjeta de casos a ancho completo |
| 768 px | Como 640 px con gutter de 30,7 px; `#agenda` sigue en una columna |
| 1024 px | `--section-y` sube a 96 px; hero, Por qué ahora, FAQ y `#agenda` en dos columnas; casos en 3; equipo en 4; incluye en 3; pasos en 4 |
| 1280 px | Contenedor a 1152 px; mismas columnas que 1024 con más aire; hero completo en el primer pantallazo (1280x800) |

Con espaciado de texto forzado (interlineado 1.5, párrafo 2x, letras 0.12em, palabras 0.16em) no se recorta ni se superpone nada; nada de alturas fijas en texto. Zoom a 200 % sin pérdida de contenido.

---

## Design Method and Iteration Protocol

Dos skills, en este orden de mando: primero este contrato y A11Y.md, luego las skills (que afinan dentro del contrato y no lo rompen).

### Configuración
- **`impeccable`** (v4.2.x): modo Persuade (landing de captación). Antes de editar, `impeccable context`; generar `PRODUCT.md` y `DESIGN.md` desde este UI-SPEC y `tokens.css` (verbos `init` y `document`) para que las iteraciones compartan la misma verdad. Carga previa de `reference/craft-floor.md` al editar UI.
- **`design-taste-frontend`**: lectura de diseño declarada antes del código: "landing de captación B2B para dueños de e-commerce, lenguaje collage pop de marca, con reglas de accesibilidad que mandan sobre la estética". Diales: `DESIGN_VARIANCE 7`, `MOTION_INTENSITY 3` (tope del presupuesto de arriba), `VISUAL_DENSITY 4`. Anti-defecto: sin degradados, sin vidrio, sin tres tarjetas iguales sin variar (los layouts alternan tarjeta, regla, lista y columnas), sin animaciones infinitas.

### Verbos de `impeccable` por lote
Cada lote es un grupo de secciones que el planner puede convertir en tareas.

| Lote | Secciones | Verbos |
|------|-----------|--------|
| 0 Base | Tokens (tonos, Title, `--section-y`), script de contraste, `SectionShell`, sprite y piezas de collage, logo e isotipo | `init`, `document`, `shape` (brief global), `typeset`, `colorize` |
| A | Header y Hero | `shape`, `layout`, `typeset`, `colorize`, `animate` (solo la entrada del collage), `adapt` |
| B | Problema, Por qué ahora, Solución | `shape`, `layout`, `colorize`, `bolder` si la sección se ve plana |
| C | Logramos juntos, Casos, Equipo | `shape`, `layout`, `colorize`, `typeset` (cifras), `adapt` |
| D | Incluye, Cómo funciona, Para quién, FAQ | `shape`, `layout`, `clarify`, `adapt` |
| E | `#agenda`, Footer, `/privacidad` | `layout`, `colorize`, `harden` |
| Cierre | Toda la página | `critique` de página completa contra la síntesis de referencias, `polish`, `harden` (texto largo, "FALTA CONFIRMAR", `<details>`), `adapt` (320 a 1280, zoom 200 %, espaciado de texto) |

### Ciclo por lote (acotado, por regla de `impeccable`)
1. Construir el lote completo desde el contrato.
2. **Ronda de captura en lote** con Playwright (Chromium ya instalado), un solo pase: 320, 390, 768, 1024 y 1280 px, con `prefers-reduced-motion: reduce`, con JavaScript desactivado y con el formulario de ClickUp bloqueado. Guardar en `test-results/phase2/{lote}-{ancho}.png` (no versionado).
3. `critique` del lote contra tres cosas: el contrato de la sección, la fila de la síntesis de referencias y la lista de "vibra" de abajo.
4. Corregir todo lo encontrado en un solo lote de cambios; una ronda de confirmación como máximo. Si un criterio de salida sigue fallando tras la confirmación, se repite el ciclo, no se acumulan retoques abiertos.
5. Registrar en `02-VISUAL-LOG.md` (versionado): lote, ronda, verbos usados, hallazgos, correcciones y capturas.

Juan pidió "las iteraciones que hagan falta". Se respeta con ciclos acotados: cada ciclo es un pase en lote y no se cierra el lote hasta cumplir la lista de vibra y los criterios de salida. Tras 3 ciclos de página completa sin cumplirla, se detiene y se muestra a Juan con capturas.

### Lista de "vibra" (observable, tomada de las referencias)
1. El hero tiene titular enorme en negrita, un solo pill dominante y collage a la derecha, todo visible en el primer pantallazo a 1280x800 (S y R).
2. Bloques de tono a ancho completo con 96 px de aire en escritorio (R, S).
3. Tarjetas con borde de 3 px, sombra dura y radio parejo (marca), sin ninguna sombra difusa.
4. La cifra es lo más grande de cada tarjeta de caso, con marcador amarillo (R, M).
5. Los cuatro avatares son un set uniforme sobre círculos suaves (M).
6. El FAQ son filas grandes con borde e icono más/menos (M, R).
7. Cada sección tiene un foco claro y al menos un elemento de collage o un layout propio: ninguna se lee como plantilla genérica.
8. Cuatro CTA repartidos con el mismo texto y destino (R repite el suyo siete veces).

### Cómo estudiar las referencias otra vez
Renderizar con `@playwright/test` (Chromium ya instalado): `page.goto`, scroll de 500 px por paso para disparar carga diferida, capturas de 1280x900 y 390x844 por tramos. No hace falta navegador extra ni MCP.

---

## Verification Hooks

Lo que el checker y el ejecutor pueden comprobar sin interpretar:

- `scripts/check-contrast.mjs` pasa con los pares nuevos, verifica los tonos `yellow` y `dark`, y falla si `dark` declara morado como `--heading` o `--link`, si `yellow` declara naranja o blanco como texto, o si un par prohibido aparece en un tono.
- `npm run build` sale 0 sin `PUBLIC_ENV`; con `PUBLIC_ENV=production` falla mientras haya `pending` o "FALTA CONFIRMAR" (esperado). `npm run pending` regenera `PENDING-COPY.md` con las filas nuevas y `--check` sale 0.
- Playwright a 320, 390, 768, 1024 y 1280 px: sin scroll horizontal, sin texto recortado, un solo `h1`, 11 `h2` (Problema, Por qué ahora, Solución, Logramos, Casos, Equipo, Incluye, Cómo funciona, Para quién, FAQ, Agenda), sin salto de nivel de encabezado.
- Con `prefers-reduced-motion: reduce`: `document.getAnimations().length === 0` y ninguna transición activa.
- Con JavaScript desactivado: todas las secciones visibles; el FAQ abre con `<details>` nativo; los CTA saltan a `#agenda`.
- Cuatro `CtaLink` con el mismo nombre accesible que el texto visible y `href="#agenda"`; ningún `aria-label` en CTA.
- Todo enlace, resumen y control mide 44 px o más en el eje corto (o 44 de alto para texto en línea).
- Teclado: el orden de tabulación de `## Interaction Contract`; el foco visible (3 px) en cada tono; un clic o Enter en cualquier CTA deja el foco en el h2 de `#agenda`.
- Sin `set:html`, sin hex en `src/components`, sin `outline: none`, sin `line-height ... !important`, sin `height:` fijo en contenedores de texto.
- Peso: colección de collage menor a 40 KB, HTML menor a 60 KB sin comprimir, cero archivos `.js` propios nuevos (el de foco sigue inlinado).
- Copy: `check-copy` reporta solo `PENDING` en producción (más los hallazgos del doc); ningún texto sale de fuera del YAML.
- `/privacidad` existe, tiene un solo `h1` y su enlace desde el footer funciona.

---

## UI Considerations

> Prellenado con la taxonomía de estados; el probe del paso 9.5 de ui-phase puede reemplazar estas filas (idempotente). Las copias de estados vacíos y de error viven en `## Copywriting Contract`.

Applicable state considerations resolved: 9 covered, 3 backstop, 2 unresolved

| Category | Element(s) | Status | Resolution / Reason |
|----------|------------|--------|---------------------|
| empty | Ranuras sin dato (cifras, plazos, sector, cuerpo de privacidad, correo, redes) | ✅ covered | Toda ranura sin dato muestra el texto exacto "FALTA CONFIRMAR" con el estilo de su ranura; nunca queda vacía ni oculta |
| partial | MetricCard con sector, plazo o canal faltante | ✅ covered | La tarjeta se muestra completa: cada `<dd>` faltante dice "FALTA CONFIRMAR" y la tarjeta no se oculta |
| long-text | Nombres, cargos, chips de plazo y canal, preguntas del FAQ, h2 largos | ✅ covered | `overflow-wrap: anywhere`, chips con `max-width: 100%` y dos líneas, preguntas de FAQ parten sin desborde a 320 px |
| overflow | Cifras de Display, rejillas de tarjetas, collage del hero | ✅ covered | Hijos de grid con `min-width: 0`, collage con `max-width: 100%`, hero con `overflow-x: clip`, prueba de sin scroll horizontal a 5 anchos |
| zero-one-many | Casos (5), equipo (4), pilares (4), fases (4), FAQ (5 a 6) | ✅ covered | Cantidades fijas por contrato; la 5.ª tarjeta de casos ocupa el ancho sobrante en B y C; FAQ admite 5 o 6 |
| loading | Collage y secciones | ✅ covered | SVG en línea sin carga; ningún contenido depende de recursos externos salvo el iframe (Fase 1) |
| error | Iframe de ClickUp | ✅ covered | Sin cambios: enlace de respaldo y `noscript` siempre visibles (Fase 1) |
| a11y-motion | Todo movimiento | ✅ covered | Solo `no-preference`, presupuesto cerrado, cero animaciones con `reduce` |
| a11y-color | Tonos nuevos y tarjetas blancas sobre amarillo | ✅ covered | Pares en el script de contraste; borde oscuro de 3 px en toda tarjeta clara sobre claro o amarillo |
| interaction | FAQ (`<details>`) | 🧪 backstop | Comprobar con teclado y lector de pantalla que el estado abierto o cerrado se anuncia y que `summary` con `list-style: none` no pierde el rol |
| interaction | Lista de fases con `list-style: none` | 🧪 backstop | Safari con VoiceOver puede perder la semántica de lista: verificar con `role="list"` en `<ol>` y `<ul>` estilizados |
| visual | Composición del `HeroCollage` a 320 px | 🧪 backstop | Comprobar con captura que la lupa, los ojos y los clics no se cortan ni tapan el CTA |
| copy | Cadenas del doc de Ari por ranura | ⚠ unresolved | El doc no se pudo leer en esta corrida; el planner mapea cada ranura a su cadena exacta con Drive abierto |
| assets | Logo e isotipo en SVG, área de salvado | ⚠ unresolved | Dependen del Drive de Ari y del BrandBook PDF; si falta el vectorial se redibuja y se marca para aprobación |

<!-- Status vocabulary (locked by probe-core projectTruths): covered = plain truth string lifted into must_haves.truths; backstop = { statement, verification: backstop }; unresolved = explicit planner assumption. Rows are REPLACED on a probe re-run (idempotent). -->

---

## Requirement Coverage

| Requisito | Sección o regla de este contrato |
|-----------|----------------------------------|
| CONT-01 | Hero |
| CONT-02 | El problema |
| CONT-03 | Por qué ahora |
| CONT-04 | La solución |
| CONT-05 | Lo que logramos juntos |
| CONT-06 | Casos de éxito |
| CONT-07 | Quiénes somos |
| CONT-08 | Qué incluye |
| CONT-09 | Cómo funciona |
| CONT-10 | Para quién es |
| CONT-11 | FAQ |
| CONT-12 | Footer y `/privacidad` |
| CONT-13 | CTA final y formulario (`#agenda`) |
| COPY-01 | Copywriting Contract (verbatim, ranuras, hallazgos) |
| DSGN-01 | Collage and Brand Assets Contract |
| DSGN-02 | Logo, isotipo, área de salvado, favicon |
| DSGN-03 | Responsive y verificación a 5 anchos |
| DSGN-04 | Design Method and Iteration Protocol |
| DSGN-05 | Presupuesto de movimiento |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none (Tool: none, sin `components.json`) | not applicable |
| third-party | none | not applicable |

Dependencias externas nuevas: ninguna. Iconos utilitarios con geometría Tabler (MIT) copiada en línea, sin paquete. Sigue vigente la dependencia de la Fase 1 (iframe y script de ClickUp).

---

## Decisions and Assumptions

Corrida autónoma: no hubo usuario disponible. Cada punto es un valor por defecto elegido y revisable.

| # | Decisión o supuesto | Por qué | Quién confirma |
|---|---------------------|---------|----------------|
| 1 | Se rehizo el estudio de las referencias con render real (Chromium) en lugar del WebFetch de texto de la investigación previa | Juan pidió estudiarlas de verdad; el render mostró estructura, medidas y animaciones reales | Juan |
| 2 | Quinto tamaño tipográfico, Title (20 a 24 px), para h3 | La Fase 1 lo dejó previsto; sin él el h3 de tarjeta no tiene jerarquía. Desvío de la guía de 4 tamaños | Juan (APROBADO 2026-09-19: 5 tamaños, levanta la regla del checker) |
| 3 | Paso de espaciado 96 px solo para `--section-y` desde 1024 px | Alinea con `py-24` y `py-28` de rankingonai; la Fase 1 lo dejó abierto | Juan (APROBADO 2026-09-19: 96 px, levanta la regla del checker) |
| 4 | El h2 de `#agenda` pasa al titular del CTA final del doc; "Agenda tu llamada" sale del h2 | CONT-13 lo pide; hay que actualizar el YAML y las pruebas e2e de la Fase 1 | Planner |
| 5 | La sección `#agenda` no lleva un `CtaLink` a sí misma: hay 4 CTA (header, hero, solución, casos) | Un ancla al propio destino es un no-op y suma una parada de teclado. CONTEXT menciona "el CTA final" y se interpreta como la propia sección | Juan (CONFIRMADO 2026-09-19: 4 CTA + formulario) |
| 6 | Tonos nuevos `yellow` y `dark`; tarjetas usan tono anidado `light` | Reutiliza los tokens y el script de contraste; CONTEXT fija fondos blanco, amarillo y oscuro | Planner |
| 7 | Morado como fondo solo en `#agenda`; secuencia de tonos sin repetir vecino y sin morado junto a oscuro | Regla de contraste y ritmo | Juan |
| 8 | Desviación de 60/30/10: dominante blanco cercano al 45 %, secundario cercano al 50 %, acento menor al 10 % | La alternancia de CONTEXT lo implica | Juan |
| 9 | Tarjetas no interactivas sin hover ni desplazamiento | Un elemento que se mueve parece clicable | Juan |
| 10 | Avatares como personajes Loopy con accesorio, sin parecido con las personas | No hay fotos ni consentimiento; el estilo de marca es colección de ilustración | Ari (aprobación del set) |
| 11 | Etiquetas estructurales "Sector", "Plazo", "Canal" en `<dt>` | Sin ellas "FALTA CONFIRMAR" sería ambiguo; son microcopy de interfaz, no afirmaciones | Ari |
| 12 | `/privacidad` es una ruta real con `noindex` hasta tener texto legal; skip links y CTA se ajustan a esa ruta | CONTEXT pide el enlace a una página simple | Planner |
| 13 | Footer sin "todos los derechos reservados" ni año | No es texto de Ari | Ari |
| 14 | Área de salvado del logo supuesta en media altura hasta leer el BrandBook PDF | El PDF no se pudo leer | Ari o Juan |
| 15 | Sin segundo CTA en el hero, sin franja de contadores ni de logos | Sería copy nuevo o cifras sin respaldo (PROOF-02 es v2) | Juan |
| 16 | Estudio de referencias limitado a tramos clave; el detalle de interacción (carrusel, menús) no se probó | Falta de tiempo y no aporta al contrato | n/a |
| 17 | Motion: entrada única del collage y pupilas con presupuesto cerrado; deriva por scroll opcional | Vibra de referencias dentro de `motion-safe` sin ocultar contenido | Juan |
| 18 | El doc de Ari no se leyó (401, sin herramienta de Drive); ranuras sin cadenas nuevas | Limitación de esta corrida | Planner con Drive abierto |
| 19 | Diales de `design-taste-frontend` 7 / 3 / 4 | El brief de accesibilidad obliga a bajar el movimiento; la marca pide variedad | Juan |

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS
- [ ] Dimension 7 Inventory Provenance: PASS

**Approval:** pending


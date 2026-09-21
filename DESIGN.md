---
name: Loops Growth Landing
description: Sistema de diseño de la landing de captación de Loops Growth. Collage pop de marca, cuatro tonos de superficie y contraste medido.
colors:
  purple: "#4228d1"
  cream: "#f4f3e0"
  orange: "#fd6938"
  yellow: "#ffc602"
  dark: "#212121"
  white: "#ffffff"
typography:
  display:
    fontFamily: "Outfit (respaldo), Hurme Geometric Sans 3 cuando llegue la licencia web"
    fontSize: "clamp(2.25rem, 1.6rem + 3vw, 4rem)"
    fontWeight: 700
    lineHeight: 1.2
  heading:
    fontFamily: "Outfit (respaldo)"
    fontSize: "clamp(1.75rem, 1.4rem + 1.7vw, 2.75rem)"
    fontWeight: 700
    lineHeight: 1.2
  title:
    fontFamily: "Outfit (respaldo)"
    fontSize: "clamp(1.25rem, 1.1rem + 0.6vw, 1.5rem)"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "Outfit (respaldo)"
    fontSize: "clamp(1rem, 0.96rem + 0.2vw, 1.125rem)"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Outfit (respaldo)"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.5
rounded:
  s: "0.5rem"
  m: "1rem"
  card: "1rem"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
  3xl: "64px"
  4xl: "96px"
components:
  button-primary:
    backgroundColor: "{colors.orange}"
    textColor: "{colors.dark}"
    rounded: "{rounded.pill}"
    padding: "8px 24px"
    height: "48px"
  button-primary-on-dark:
    backgroundColor: "{colors.yellow}"
    textColor: "{colors.dark}"
    rounded: "{rounded.pill}"
    padding: "8px 24px"
    height: "48px"
---

# Design System: Loops Growth Landing

Generado por `impeccable document` en modo scan desde `src/styles/tokens.css`, `src/styles/global.css`, `CtaLink.astro` y `SectionShell.astro`. No hubo entrevista para el lenguaje cualitativo: la descripción de abajo sale de decisiones ya aprobadas en `PRODUCT.md`, `02-UI-SPEC.md` y el brandbook. `tokens.css` es la fuente; si este archivo difiere, manda `tokens.css`.

## Overview

Collage pop de marca: Loopy oficial (mesas 13 y 18 del `.ai`) sobre formas planas de color sin contorno, con sombra dura, garabatos de trazo de 3 px, píldoras con palabra en negrita y retícula de puntos; ningún degradado. Dos ranuras del collage (hero y Por qué ahora) llevan recortes fotográficos en media tinta: fotos de stock con licencia, tinta oscura de marca sobre el relleno de la ranura y la misma sombra dura, siempre decorativas. La página alterna superficies de color completo (blanco, amarillo, oscuro) y cierra con morado. La accesibilidad es una restricción de diseño: el contraste se mide en cada build (`scripts/check-contrast.mjs`) y los pares prohibidos rompen la guarda.

## Colors

Cuatro colores de marca más blanco y el crema del logo (que no es un tono), definidos una sola vez en `@theme static`. Los componentes nunca leen un primitivo: leen los tokens semánticos del tono donde viven.

| Tono (`data-tone`) | `--surface` | `--on-surface` | `--heading` | `--link` | `--cta-bg` (hover) | `--focus-ring` | `--bar` |
|--------------------|-------------|----------------|-------------|----------|--------------------|----------------|---------|
| `light` | blanco | oscuro | morado | morado | naranja (amarillo) | morado | morado |
| `yellow` | amarillo | oscuro | morado | morado | naranja (blanco) | oscuro | oscuro |
| `dark` | oscuro | blanco | blanco | amarillo | amarillo (naranja) | amarillo | naranja |
| `purple` | morado | blanco | blanco | blanco | amarillo (naranja) | amarillo | amarillo |

`--on-cta` es siempre oscuro. `--pop-shadow-color` es oscuro salvo en `dark`, donde es naranja (decorativa). `--collage-stroke` es oscuro sobre `light` y `yellow`, y blanco sobre `dark` y `purple`; hoy ningún elemento de las composiciones lo usa (las formas no llevan contorno y los garabatos toman su color de la pieza). `--mark` (amarillo) existe solo en `light`.

Pares medidos (14 aprobados, umbral 4.5 en texto y 3 en UI): oscuro sobre blanco 16.10, morado sobre blanco 8.55, blanco sobre morado 8.55, morado sobre amarillo 5.43, amarillo sobre morado 5.43, oscuro sobre amarillo 10.22, oscuro sobre naranja 5.56, amarillo sobre oscuro 10.22, naranja sobre oscuro 5.56, blanco sobre oscuro 16.10, crema sobre morado 7.63, morado sobre crema 7.63, oscuro sobre crema 14.37 y crema sobre oscuro 14.37. El morado es #4228D1 (Purblue): el BrandBook rotula su página 8 con #73187F, un valor erróneo que ya no se usa en ningún archivo.

El crema #F4F3E0 es superficie de chips y píldoras, no un tono: solo se combina con morado (7.63) y oscuro (14.37); amarillo (1.41), naranja (2.58) y blanco (1.12) sobre crema fallan. El naranja sobre morado (2.95) falla en texto y en UI y solo es relleno decorativo del collage, siempre con contorno blanco. Los logos salen de las mesas oficiales del `.ai` por tono y no se recolorean.

## Typography

Cinco roles: Label (14 px, 600), Body (16 a 18 px, 400), Title (20 a 24 px, 700), Heading (28 a 44 px, 700) y Display (36 a 64 px, 700). Pesos del brandbook: 400, 600 y 700, ninguno más. h1 y h2 usan `--heading`; el cuerpo usa `--on-surface`; el h3 usa `--on-surface` para que el morado quede reservado a h1, h2, cifras y numerales. Prosa de 65 ch como máximo (lead de 60 ch), nunca justificada, `overflow-wrap: anywhere` en h1, h2 y h3.

## Layout

Contenedor `.wrap` de 72rem con gutter `clamp(1rem, 4vw, 2rem)`. Escala de 4 px: 4, 8, 16, 24, 32, 48, 64 y 96. `--section-y` vale 64 px bajo 1024 px y 96 px desde 1024 px, y el 96 px no se usa para nada más. Cabecera de sección (h2 y lead) a contenido: 32 px bajo 640 px y 48 px desde 640 px; contenido a CTA de sección: 48 px. Tarjetas: `--card-pad` 24 px y `--card-gap` 16 px, que pasan a 32 px y 24 px desde 640 px. Nunca alturas fijas en contenedores de texto.

## Elevation & Depth

Plano. La profundidad es una sombra dura sin desenfoque: 4 px en reposo, 6 px en hover y 2 px en active, con `--pop-shadow-color`. Sin sombras suaves, sin degradados, sin vidrio.

## Shapes

Botones en pastilla (`--radius-pill`), tarjetas de 1 rem (`--radius-card`), contorno de 3 px (`--border-pop`) en botones y tarjetas. Los 3 px no son múltiplo de 4 a propósito: los exige A11Y.md y el estilo pop.

## Components

- **CtaLink**: ancla a `#agenda` con el texto visible como nombre accesible (sin `aria-label`). Alto mínimo de 48 px, borde de 3 px, sombra dura por tono. Cuatro ubicaciones: `header`, `hero`, `solucion` y `casos`. Naranja sobre `light` y `yellow`, amarillo sobre `dark` y `purple`; el texto es siempre oscuro.
- **SectionShell**: `<section aria-labelledby data-tone>` con `.wrap`, un `<h2 class="section-title">` con barra decorativa de 48x8 px en `--bar`, lead opcional, cuerpo por slot y slot `cta` a 48 px.
- **Tarjeta**: interior blanco (tono `light` anidado) con h3 oscuro.
- **Tarjeta de cliente** (hero): tarjeta pop con `--border-pop`, `--shadow-pop` y `--radius-card`, fondo crema (oscuro sobre crema, 14.37) y cada logo sobre un azulejo blanco de `--radius-s`, porque los logos llegan con fondo transparente, blanco o de color. Nombre en rol Label (14 px, 600) y etiqueta de la lista también Label. Sin enlaces ni movimiento.

## Do's and Don'ts

- Do: leer siempre los tokens semánticos del tono; nunca un `--color-brand-*` directo en un componente salvo en SVG de collage.
- Do: poner borde oscuro de 3 px a toda tarjeta blanca sobre amarillo o sobre blanco (el blanco contra amarillo mide 1.58: el borde define la forma).
- Do: definir el CTA naranja sobre `yellow` por su borde oscuro (el relleno contra el fondo mide 1.84).
- Don't: morado sobre oscuro (1.88) en texto, iconos o collage. Un tono `dark` no puede declarar `--heading`, `--link` ni `--collage-stroke` en morado, y una sección `dark` nunca es contigua a `purple`.
- Don't: naranja ni blanco como texto sobre amarillo; blanco sobre naranja (2.89); amarillo como texto o borde sobre claro (1.58); naranja como texto o borde sobre blanco (2.89).
- Don't: ampliar la escala aprobada. 96 px solo para `--section-y`; Title es el quinto y último tamaño; ningún otro peso.
- Don't: degradados, sombras suaves, animaciones infinitas ni texto sobre una ilustración.

# Ciclo visual: hero compacto en moviles cortos (quick 260920-name-geo-hero-mobile)

Fecha: 2026-09-20. Rama `feature/name-geo-hero-mobile`. Solo CSS de `src/components/sections/Hero.astro`; sin cambio de orden, copy, header ni elementos.

## Verbos y lentes usados

- `impeccable` con lentes `critique` (layout), `polish` y `adapt` (movil). Aviso de metodo: DEGRADED, contexto unico (este ejecutor no tiene herramienta de subagentes: la evaluacion de diseno y la del detector no son independientes). Se cargaron PRODUCT.md y el contexto con `impeccable context`.
- `design-taste-frontend`: solo como filtro anti-plantilla y para la disciplina de "el CTA del hero visible sin scroll". Sus reglas de "maximo 4 elementos de texto en el hero" y "logos bajo el hero" chocan con decisiones de Juan ya tomadas (CTA al final de los parrafos, clientes bajo el CTA) y no se aplican. Reglas que si aplican: h1 sin gritar (bajar el tamano movil en vez de recortar copy), relleno superior del hero acotado, sin scroll cue, sin adorno nuevo.
- Referencia de marca: `brand-inventory/moodboard.png` (formas planas de color, tipografia geometrica en negrita, sombra dura, mucho aire alrededor de las piezas) y `ai_a.png` (rejilla de 16 logos: wordmark en negrita geometrica sobre morado, crema, naranja y amarillo planos, sin degradados). Ambos se leyeron con la herramienta Read. Los archivos estan bajo la carpeta confidencial `brand-inventory/` y no se versionan ni se copian.
- Herramienta: Playwright con proxy muerto (ClickUp bloqueado) contra `astro preview` en 4322. Nunca `astro dev`.

## Hallazgos con evidencia (antes)

Medida con scroll 0, arriba del CTA del hero: 320x568 en 832 px, 360x640 en 723, 375x667 en 700, 360x740 en 723, 390x844 en 702 (el CTA mide 48 px). Encabezado de 64 px en flujo (no fijo).

1. **Ritmo vertical demasiado holgado para movil (P1).** Relleno superior del hero 48 px, h1 en 36 px, huecos de 24 y 32 px entre h1, subtitulo y parrafos, 16 px entre parrafos y 32 px sobre el CTA. Con cuatro bloques de texto encima, el CTA, que es la accion principal, quedaba bajo el pliegue en 360x740 (31 px), en 375x667 (81 px) y en 360x640 (131 px).
2. **h1 de cinco lineas a 320 px (P1).** 36 px en 320 px de ancho partia el titular en cinco lineas: casi 216 px de altura solo para el h1. Es el mayor consumo individual de altura del hero en el telefono mas angosto.
3. **Jerarquia (sin defecto).** El h1 morado en negrita es lo mas pesado y el CTA naranja con sombra dura es el segundo peso: la jerarquia del moodboard (forma plana, contraste alto, sombra dura) se conserva si solo se aprieta el espacio y no el tipo.
4. **Escritorio (sin defecto).** A 1024 y 1280 px el hero ya cabe con collage a la derecha: no se toca.

## Correcciones (un solo lote, solo bajo 40em)

`@media (max-width: 39.99em)` en `Hero.astro`, mismo corte en el que el CTA del header sigue oculto:

- `.hero`: relleno superior 48 a 20 px, inferior 64 a 48 px.
- `.hero-grid`: hueco entre bloques 48 a 32 px.
- `.hero h1`: `clamp(1.875rem, 1.5rem + 2.2vw, 2.25rem)` (unos 31 a 33 px, antes 36 a 38 px). Baja de 5 a 3 lineas a 320 px. El interlineado 1.2 del h1 no cambia.
- `.hero-sub` margen superior 24 a 14 px; `.hero-desc` margen superior 32 a 16 px; separacion entre parrafos 16 a 12 px; `.hero-cta` margen superior 32 a 20 px.
- Sin tocar: interlineado 1.6 de los parrafos, ancho maximo 55ch, alto del CTA (48 px), tamano de los parrafos.

## Medida despues (arriba y abajo del CTA del hero, scroll 0)

| Pantalla | Arriba | Abajo | Estado |
|----------|-------:|------:|--------|
| 320x568 | 653.7 | 701.7 | bajo el pliegue: 134 px |
| 360x640 | 633.0 | 681.0 | bajo el pliegue: 41 px (solo se ven 7 px) |
| 375x667 | 609.0 | 657.0 | dentro, margen de 10 px |
| 360x740 | 633.0 | 681.0 | dentro, margen de 59 px |
| 390x844 | 610.8 | 658.8 | dentro, margen de 185 px |
| 412x915 | 613.6 | 661.6 | dentro, margen de 253 px |

Nota honesta: antes de este cambio el CTA ya cabia entero en 390x844 (abajo en 749.8 px) y en 412x915; lo que no cabia era 360x740 (abajo en 771), 375x667 (747.6) y los telefonos mas cortos. La medida es contra el alto de la ventana de Playwright; un navegador movil real resta las barras del navegador, asi que el margen real es menor que el de la tabla. En 360x640 y 320x568 el CTA sigue bajo el pliegue: cerrarlo del todo exigiria mover el CTA o quitar contenido (cambio de orden o de copy, fuera de esta tarea).

## Confirmacion (una ronda)

Capturas: `test-results/after-hero-{320,390,768,1024,1280}.png`, `after-team-*.png` y `after-fold-{320x568,360x640,375x667,360x740,390x844,412x915}.png`. Se revisaron a ojo las capturas de 320x568 y 360x740 (las demas se midieron, no se miraron una a una): el h1 en tres lineas queda dominante, el subtitulo y los parrafos respiran (16 y 12 px), el CTA naranja conserva su sombra dura y su alto, y el bloque de clientes empieza 32 px bajo el CTA. Sin desborde horizontal. A 768, 1024 y 1280 px el hero no cambia (la regla no se aplica desde 40em). Prueba nueva en `tests/e2e/page-structure.spec.ts` que fija el CTA entero dentro del primer pantallazo a 360x740, 390x844, 412x915 y 375x667.

## Tarjeta del equipo con el nombre completo (tarea 1)

`Juan Carlos Angulo` a 320, 390, 768, 1024 y 1280 px: una linea (26 y 29 px de alto de `h3`) a 320, 390 y 768 px; a 1024 y 1280 px (cuatro columnas) la reserva `2lh` mantiene el `h3` en 62 px en las cuatro tarjetas y las alturas son iguales (356 y 357 px), asi que un nombre que baje de linea no desalinea los cargos. Sin desborde horizontal en ningun ancho.

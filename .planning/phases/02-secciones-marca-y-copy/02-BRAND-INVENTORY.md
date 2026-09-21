# Fase 2: inventario de marca y brecha contra el moodboard

Fecha: 2026-09-19. Pedido de Juan tras ver que los planes 02-01 a 02-03 no usaron los isotipos, variantes ni el moodboard de Ari.

Las imágenes están en `brand-inventory/` (sin versionar: el BrandBook es CONFIDENCIAL y los originales de Ari no se suben al repo):
`ai_a.png` y `ai_b.png` (las 32 mesas del `.ai`), `bb_a.png` y `bb_b.png` (las 16 páginas del BrandBook), `moodboard.png`, `site-hero.png` (el sitio actual).

## 1. Fuentes oficiales (Drive de Ari, carpeta de branding `1byOfW…`)

| Archivo | Qué es | Uso hasta hoy |
|---|---|---|
| `LOGO_LOOPSGRWOTH.ai` | PDF de 32 mesas de 800x800 pt, vectorial | Solo las mesas 6 y 13 |
| `BrandBook_loopgrowth.pdf` | 16 páginas A4 | Páginas 6, 7, 8 y 10 |
| `ISOTIPO/`, `VARIANTE/`, `SOBRE COLOR/`, `MONOCROMÁTICO/`, `ORIGINAL/` | Exportaciones PNG y JPG de las mismas mesas (`LOGO_LOOPSGRWOTH-NN`) | Ninguno |
| `MATERIALES/` | Papelería: hoja membretada, tarjetas, firma, cotización, `Marteriales Editables.ai` | No aplica a la web |

## 2. Las 32 mesas del `.ai`

| Mesas | Contenido | Fondo |
|---|---|---|
| 1, 2, 3, 4, 5, 8, 9 | Logo apilado `loops / growth` | 1 blanco (morado azulado), 2 crema (morado azulado), 3 morado azulado (texto crema), 4 naranja (texto amarillo), 5 amarillo (morado azulado), 8 oscuro (texto crema), 9 blanco (negro) |
| 28, 29, 30, 31, 32 | Logo apilado monocromático | morado azulado, naranja, amarillo, negro, crema |
| 6 | Logo horizontal `loopsgrowth` | blanco |
| 7 | Imagotipo: los dos ojos dentro de las oes | blanco |
| 10, 11, 12, 23, 24, 25 | Emblema: texto en arco sobre los dos ojos | blanco, crema, morado azulado, naranja, amarillo, oscuro |
| 13 a 17, 26 | Isotipo Loopy: dos ojos con lupa | blanco, morado azulado, naranja, amarillo, oscuro, crema |
| 18 a 22, 27 | Isotipo de un solo ojo con lupa | blanco, morado azulado, naranja, amarillo, oscuro, crema |

Colores de las mesas: `#4228D1` (principal), `#6C61DB` (iris), `#F4F3E0` (crema), `#1E1E1E` (pupila y oscuro), más naranja `#FD6938` y amarillo `#FFC602`.

Ya existe una versión oficial del logo por cada fondo. No hay que inventar "blanco sobre oscuro": el archivo trae texto crema sobre morado azulado y sobre oscuro, y texto amarillo sobre naranja.

## 3. Hallazgo de color (necesita la decisión de Juan y Ari)

En la página 8 del BrandBook el círculo "Purblue" se dibuja en el azul violeta `#4228D1`, pero el texto que lo acompaña dice R115 G24 B127, `#73187F`, Pantone 248 U (un magenta). El logo, el isotipo, la portada, la papelería y todo el moodboard usan el azul violeta. Solo esa línea de texto dice `#73187F`.

`tokens.css` y los pares de contraste de la fase 1 se midieron con `#73187F`. En la captura actual, el logo (`#4228D1`) y el h1 (`#73187F`) conviven en el mismo header y se ven como dos morados distintos.

Contrastes ya medidos con `#4228D1` (02-02): sobre blanco 8.55, sobre amarillo 5.43, sobre `#212121` 1.88 (falla). Faltan medir sobre crema, del naranja y el crema sobre `#4228D1`, y los tonos de las tarjetas.

## 4. Moodboard (BrandBook, página 4) y BrandBook, página 3

Rasgos que define el propio BrandBook: "estilos gráficos modernos y llenos de energía", "collage pops", elementos "lupas, ojos en gran escala, gráficos, clicks", tipografía sans serif palo seco, "vibrante y mucha energía".

Lo que se ve en el moodboard:
1. Azul violeta eléctrico como color dominante, con naranja y amarillo de acento y crema de fondo.
2. Recortes fotográficos en blanco y negro de granulado o media tinta (ojo con lupa, manos, bustos, rostros) mezclados con ilustración plana.
3. Grandes formas de color planas detrás del recorte (círculo azul detrás del ojo).
4. Píldoras y chips redondeados con palabras en negrita (`seo`, `spy`, `team work`) sobre azul o crema.
5. Interfaces dibujadas como wireframes de línea fina (tablero, gráficos, engranajes).
6. Garabatos de trazo (flechas, destellos, asterisco) y composición apilada con solapes.
7. Textura: retícula de puntos, media tinta, sombras duras.

## 5. Brecha del sitio actual (revisada en `site-hero.png` y en el render completo)

| Punto | Marca | Sitio hoy |
|---|---|---|
| Color principal | `#4228D1` | `#73187F` (magenta) en h1, números, lupa, barras |
| Ojos Loopy | Anillo crema, iris `#6C61DB`, pupila `#1E1E1E` con brillo | Óvalos blancos con contorno negro y pupila negra (ojos de muñeco) |
| Lupa | Aro azul violeta con iris dentro, mango redondeado | Aro magenta con cristal blanco vacío |
| Recortes fotográficos y media tinta | Rasgo central del moodboard | Ninguno |
| Píldoras con palabra | `seo`, `spy`, `team work` | Ninguna |
| Crema `#F4F3E0` | Fondo recurrente | Ningún tono la usa |
| Logo por fondo | Una mesa oficial por color | Un solo SVG recoloreado por CSS |
| Avatares y sprite | No existen en el `.ai` | Dibujados por los agentes |

Lo que sí cumple: el copy de Ari tal cual, Outfit como respaldo declarado de Hurme, naranja y amarillo correctos, sombra dura del botón, el logo horizontal tomado de la mesa 6.

## 6. Propuesta de rehacer (antes de seguir con 02-03 a 02-08)

1. Decidir el color: usar `#4228D1` (con `#6C61DB` y `#F4F3E0`) y actualizar tokens, pares de contraste y guardas.
2. Extraer las 32 mesas a SVG limpios y usar las oficiales por fondo (logo, imagotipo, emblema, isotipos).
3. Reconstruir el collage con las piezas reales de Loopy (ojos, lupa, un ojo) y el lenguaje del moodboard (formas planas grandes, píldoras, garabatos, retícula de puntos). Reemplazar el sprite y los avatares dibujados por los agentes.
4. Los recortes fotográficos del moodboard son imágenes de terceros: no se copian. Se necesita definir con Ari si hay fotos propias o un tratamiento de media tinta sobre fotos del equipo.
5. Este archivo y las hojas de `brand-inventory/` pasan a ser lectura obligatoria de cada ejecutor y del verificador visual.

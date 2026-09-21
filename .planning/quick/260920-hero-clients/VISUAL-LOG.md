# Ciclo visual: hero y bloque de clientes (quick 260920-hero-clients)

Fecha: 2026-09-20. Rama `feature/hero-clients`. Los dos commits anteriores (e478303, e1928b3) se hicieron sin la pasada de diseño obligatoria del proyecto; esta la repone.

## Verbos y lentes usados

- `impeccable critique` con lentes `layout` y `polish`, más `adapt` para el móvil. Aviso de método: DEGRADED, contexto único (este ejecutor no tiene herramienta de subagentes, así que la evaluación de diseño y la del detector corrieron en secuencia, no aisladas).
- `impeccable detect` sobre `Hero.astro`: 0 hallazgos (corrido sobre el estado final).
- `design-taste-frontend`: solo como filtro anti-plantilla. Sus reglas de "hero con máximo 4 elementos de texto", "logos solo, sin etiquetas" y "muro de logos bajo el hero" chocan con decisiones de Juan (CTA al final de los párrafos, lista de clientes bajo el CTA) y con A11Y.md (el logo lleva `alt=""`, así que el nombre visible es el nombre accesible). Manda el brief; queda registrado como desviación consciente.
- Referencia de marca: `brand-inventory/moodboard.png` (formas planas de color, píldoras con palabra en negrita, mosaicos crema redondeados con texto morado, sombra dura). Los archivos están bajo `.planning/.../brand-inventory/` y son confidenciales: no se copian ni se versionan.
- Herramienta: Playwright + `astro preview` en 4322 con `E2E_BLOCK_CLICKUP=1` (proxy muerto). Nunca `astro dev`.

## Hallazgos con evidencia (antes)

Capturas: `test-results/before-{320,390,768,1024,1280,1600}.png` y `before-fold-*.png`.

1. **Sistema de tarjeta divergente (P1).** Las 12 tarjetas usaban `2px solid` y `3px 3px 0` escritos a mano, colores primitivos y `--radius-m`. Las vecinas (PillarCard, MetricCard, Team, ForWhom) usan `--border-pop` (3 px) y `--shadow-pop` (4 px). No hay razón medida para diferir: el bloque parecía una tira de logos genérica al lado del lenguaje pop. Corregido a tokens.
2. **Soporte del logo incoherente (P1).** Medido con PIL sobre `src/assets/clients/*.webp`: Flodesk, Holafly, Holded y Sendlane tienen fondo transparente; Ambl, TravelPerk y Unilever, fondo blanco; HubSpot, Alchemy, Skale, ChartMogul y Piktochart, fondo de color. Sobre tarjeta blanca unos logos eran una marca "desnuda" y otros un azulejo de color; el de Ambl (#FEFEFE con una A gris) se leía como un hueco. Corregido: tarjeta crema (par oscuro sobre crema 14.37, ya usado en las tarjetas pares de Pilares y en el moodboard como mosaico crema) y cada logo sobre azulejo blanco `--radius-s`, así los 12 quedan sobre el mismo soporte.
3. **Jerarquía de la etiqueta (P2).** La etiqueta era 16 px / 700, más pesada que los párrafos del hero, y se leía como subtítulo que competía con el CTA. Bajó al rol Label del sistema (14 px, 600). El nombre de cada tarjeta era 13 px, fuera de la escala de 5 tamaños de DESIGN.md; subió a 14 px (Label).
4. **Ajuste a 320 px tras el cambio (P2, derivado).** Con borde de 3 px y 14 px, "ChartMogul" mide 75.9 px y el interior de la tarjeta (88 px de ancho menos 6 de borde y 8 de padding) daba 74 px. Se bajó el padding horizontal móvil a 2 px por lado (interior 78 px, holgura 2.1 px). A 320 px y con el espaciado SC 1.4.12 las 12 tarjetas siguen sin recorte ni desborde.
5. **Composición de escritorio (sin defecto).** A 1024, 1280 y 1600 px el texto ocupa 7fr y el collage 5fr centrado en vertical; el bloque de clientes abarca las dos columnas justo bajo el CTA (48 px de separación). El collage (402 px de alto a 1600) queda centrado frente a un texto de 689 px, con aire bajo el collage y a la derecha del CTA, pero sin choque (solape vertical entre `.hero-art` y `.hero-clients` = 0) y sin desbalance que justifique tocar la rejilla. No se cambió. Con `.wrap` de 72 rem el ancho de 1600 px no cambia la composición.
6. **Jerarquía contra CTA y h1 (sin defecto tras 1 y 3).** El h1 (Display) y el CTA naranja siguen siendo lo más pesado; la etiqueta y los nombres son Label y las tarjetas crema no aportan relleno saturado. El CTA es el único relleno naranja del bloque.
7. **Estado FALTA CONFIRMAR de la etiqueta.** Con el texto de la etiqueta reemplazado por "FALTA CONFIRMAR" a 320, 768 y 1280 px: alto de una línea (21 px), separación con la lista 16 px, desborde horizontal 0. No rompe la maqueta.
8. **Móvil (adapt).** Mediciones en la sección de abajo. El CTA del hero queda bajo el pliegue en pantallas cortas; el encabezado no es fijo (`position: static`) y su CTA se oculta bajo 640 px, así que no hay CTA alcanzable sin desplazarse. No se tocó (regla de la tarea): se proponen opciones para Juan.

## Correcciones (un solo lote)

Solo `src/components/sections/Hero.astro` (estilos) y una línea de componentes en `DESIGN.md`. Sin copy, sin elementos nuevos, sin cambio de encabezado.

- `.client-card`: `border: var(--border-pop)`, `box-shadow: var(--shadow-pop)`, `border-radius: var(--radius-card)`, fondo `--color-brand-cream`.
- `.client-logo`: fondo `--color-brand-white`.
- `.client-name`: 14 px (antes 13). Padding horizontal móvil 2 px.
- `.hero-clients-label`: 14 px, 600, interlineado 1.5.

## Confirmación (una ronda)

Capturas: `test-results/after-{320,390,768,1024,1280,1600}.png`. Se revisaron 320, 768, 1024 y 1280 px: tarjetas uniformes, logo legible en los 12, sin desborde, nombres sin recorte, el bloque queda bajo el CTA. Suite completa en el SUMMARY.

## Pliegue móvil del CTA del hero (medido en el build, sin cambios)

Coordenadas absolutas con el scroll en 0 (incluyen los 64 px del encabezado).

| Viewport | Tope del CTA | Fondo del CTA | Veredicto |
|----------|-------------:|--------------:|-----------|
| 320x568 | 832 | 880 | fuera del primer pantallazo (264 px de más) |
| 360x640 | 723 | 771 | fuera |
| 375x667 | 700 | 748 | fuera (empieza 33 px bajo el pliegue) |
| 360x740 | 723 | 771 | parcial: el tope se ve, se corta 31 px |
| 390x844 | 702 | 750 | dentro |
| 412x915 | 705 | 753 | dentro |
| 430x932 | 708 | 756 | dentro |

Nota: el valor de 661 mencionado en el encargo no coincide con esta medición (702 de tope a 390x844); se usa el medido.

### Opciones para Juan

1. **Mostrar el CTA del encabezado también en móvil.** Cambia `SiteHeader.astro` (ocultarlo bajo 640 px ahora). El texto es el mismo ("Agenda tu llamada de 30 minutos"), 44 px de alto mínimo, en 320 px hace falta que baje a dos líneas o que el logo se reduzca. Pro: CTA en el primer pantallazo en todos los tamaños. Contra: encabezado de mayor alto y no es fijo, así que desaparece al desplazarse; toca un componente fuera de este alcance.
2. **Compactar el ritmo vertical del hero en móvil** (padding superior 1.5 rem, márgenes entre subtítulo, párrafos y CTA más cortos). Medido inyectando el CSS: recupera unos 64 px. Deja el CTA visible en 360x740 y 390x844 (y 375x667 con solo 17 px cortados), pero NO en 320x568 ni 360x640. Pro: no cambia orden ni copy, solo CSS. Contra: no resuelve pantallas cortas y aprieta la lectura de los tres párrafos.
3. **CTA fijo inferior en móvil** (barra pegada abajo con el mismo texto, solo bajo 640 px). Pro: siempre alcanzable, incluso a 320x568. Contra: cubre contenido (SC 2.4.11 foco no oculto, SC 1.4.10 reflow), añade una quinta ubicación de CTA y contradice "un solo CTA dominante por pantalla"; requiere una pasada de A11Y.md completa.

Recomendación: opción 2 como base (barata, sin riesgo) y, si el evento va a usar sobre todo móviles de 360x640 o menos, sumar la opción 1. La opción 3 solo si Juan acepta el riesgo de accesibilidad.

## Capturas

`test-results/` se vacía con la suite y es ignorado por git. Las de "antes" (`before-*.png`) se revisaron y luego la suite las borró; no se regeneran sin volver al commit anterior. Vigentes tras la suite: `test-results/after-{320,390,768,1024,1280,1600}.png`, `after-fold-<ancho>x<alto>.png` (320x568, 360x640, 375x667, 360x740, 390x844, 412x915, 430x932) y `after.json` con las cajas medidas. La captura de la etiqueta en estado FALTA CONFIRMAR se midió (JSON en este log) y no se conservó como imagen. Script: `capture-hero.mjs` (uso interno, se copia a `test-results/` y se ejecuta con `node test-results/capture-hero.mjs <prefijo>` con el preview en 4322).

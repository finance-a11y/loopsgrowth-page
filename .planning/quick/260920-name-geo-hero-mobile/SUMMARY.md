# Quick 260920-name-geo-hero-mobile: nombre completo, lang de GEO y hero compacto en móvil

Rama `feature/name-geo-hero-mobile` (git flow, desde `develop`). Fecha: 2026-09-20. Estado: completo.

## Commits
- d77db60 (plan), 5722228 (nombre completo), 803a433 (lang de GEO), a3230e6 (hero compacto en móviles).

## Qué se hizo
- La tarjeta del equipo dice "Juan Carlos Angulo" (sigue `pending`, Ari confirma). Los `reason` de la afirmación y de sus enlaces, los dos `PROVENANCE.md` y las guardas usan el nombre completo. `PENDING-COPY.md` regenerado (62 pendientes). Otros integrantes y cargos sin cambios.
- `GEO` entra en la lista cerrada de `english-terms` (decisión de Juan, 2026-09-20). El subtítulo del hero se imprime con `LangText`: solo "GEO" de "SEO/GEO" lleva `lang="en"`. La píldora decorativa `geo` del collage también pasa a `lang="en"`. Sin `set:html` y sin cambio de copy; `<title>` y meta no llevan `lang`.
- Hero móvil compacto solo con CSS bajo 40em (opción 2 elegida por el orquestador): relleno 20/48 px, hueco de rejilla 32 px, h1 de unos 32 px (3 líneas a 320 px, antes 5), márgenes de subtítulo, párrafos y CTA más cortos. Sin cambio de orden, copy, header ni elementos; escritorio y tablet igual. Interlineado 1.6, ancho 55ch y CTA de 48 px intactos.

## Pliegue del CTA del hero (arriba / abajo, scroll 0)
| Pantalla | Arriba | Abajo | Estado |
|---|---:|---:|---|
| 320x568 | 653.7 | 701.7 | bajo el pliegue por 134 px |
| 360x640 | 633.0 | 681.0 | bajo el pliegue por 41 px |
| 375x667 | 609.0 | 657.0 | dentro, margen de 10 px |
| 360x740 | 633.0 | 681.0 | dentro, margen de 59 px |
| 390x844 | 610.8 | 658.8 | dentro |
| 412x915 | 613.6 | 661.6 | dentro |

Antes, el fondo del CTA estaba en 879.8, 771.1, 747.6, 771.1, 749.8 y 753.2 (mismo orden). La medida es contra la ventana de Playwright; un navegador real resta las barras, así que el margen efectivo es menor. 360x640 y 320x568 siguen bajo el pliegue: cerrarlo exige mover el CTA o recortar contenido (opciones 1 y 3 del resumen de hero-clients).

## Pruebas
Guardas 245 de 245, contraste OK, build OK, `list-pending --check` OK (62). Playwright completa con `E2E_BLOCK_CLICKUP=1`: 562 pasan, 97 omitidas, 0 fallos. HTML 76083 B crudos (tope 81920) y 15010 B gzip (tope 25600). Nuevas: guardas y prueba e2e de GEO; prueba del pliegue a 360x740, 390x844, 412x915 y 375x667.

## Tarjeta con el nombre largo
Una línea a 320, 390 y 768 px; a 1024 y 1280 px la reserva `2lh` mantiene el `h3` en 62 px en las cuatro tarjetas (alturas iguales, 356 y 357 px). Sin desborde.

## Desviaciones
- La píldora decorativa `geo` del collage también lleva `lang="en"` (la prueba `language-parts` lo exigió) y se ajustó la guarda `collage-scenes`.
- Pasada de diseño en modo DEGRADED (contexto único, sin subagentes): ver `VISUAL-LOG.md`.

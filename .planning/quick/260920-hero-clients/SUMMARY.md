# Quick 260920-hero-clients: CTA al final de los párrafos y lista de clientes bajo el CTA

Rama `feature/hero-clients` (git flow, desde `develop`). Fecha: 2026-09-20. Estado: completo, con una decisión de Juan pendiente (CTA en móviles cortos).

## Pedido de Juan
1. En el hero, el CTA va al final de los párrafos.
2. Debajo del CTA, la lista de todos los clientes (carrusel, tarjetas o similar), tomados de https://ariannalupi.com/.

## Resultado
- El CTA del hero va al final de los tres párrafos (e478303).
- Rejilla estática de 12 tarjetas de clientes bajo el CTA, con logo local, nombre visible, `ul role="list"` y etiqueta `pending` para Ari (e1928b3).
- Pasada de diseño obligatoria (`impeccable critique` con layout, polish y adapt, más `design-taste-frontend`), hecha en una segunda ronda porque la primera entrega la omitió, con un lote de correcciones (eb6cc55). Bitácora en `VISUAL-LOG.md`.

## Commits
- e478303 feat(hero-clients): el CTA del hero va al final de los parrafos
- e1928b3 feat(hero-clients): lista de los 12 clientes bajo el CTA del hero
- eb6cc55 fix(hero-clients): tarjetas de clientes con tokens pop, crema y azulejo blanco por logo
- 4300984 docs(hero-clients): bitacora visual de la pasada impeccable y taste del hero
- b16bc4e docs(hero-clients): corrige referencias de capturas en la bitacora visual

## Decisiones
- Rejilla estática (3, 4 y 6 columnas), no carrusel: A11Y.md SC 2.2.2 pide pausa para movimiento de más de 5 s, y una rejilla se lee igual en móvil y con lector de pantalla.
- Desde 64em el bloque abarca las dos columnas de la rejilla, justo bajo el CTA, con el collage centrado junto al texto.
- `ul role="list"` nombrada por un `p` visible; logos con `alt=""` (el nombre visible es el nombre accesible); sin enlaces ni encabezado nuevo.
- Nombres `verified` (tomados de ariannalupi.com por indicación de Juan el 2026-09-20); etiqueta `pending` para Ari (propuesta "Marcas que han confiado en nuestro trabajo": el sitio de Ari la escribe en primera persona).
- Logos sin recodificar, con `src/assets/clients/PROVENANCE.md`. La aprobación de Ari queda pendiente y bloquea `PUBLIC_ENV=production` (misma puerta que las fotos del equipo).
- Pasada de diseño: tarjeta con `--border-pop`, `--shadow-pop` y `--radius-card` (antes 2 px y 3 px a mano), fondo crema (oscuro sobre crema 14.37) y azulejo blanco por logo para que los 12 queden sobre el mismo soporte (4 logos transparentes, 3 con fondo blanco y 5 de color); etiqueta y nombres en rol Label (14 px, 600); padding móvil de 2 px para que "ChartMogul" quepa a 320 px. Sin cambio de copy, orden ni header. `DESIGN.md` suma el componente "Tarjeta de cliente".
- Desviación consciente frente a `design-taste-frontend` (máximo 4 textos en el hero, logos sin etiquetas, muro bajo el hero): mandan el pedido de Juan y A11Y.md.

## Cambio deliberado de prueba
La prueba de fase 2 que exigía el CTA del hero completo en el primer pantallazo pasa a exigir h1 y subtítulo. El orden vertical ahora es h1, subtítulo, descripción, CTA, clientes. El orden de Tab no cambia.

## Corrección de una afirmación previa
El CTA del header NO está visible en móvil: `SiteHeader.astro` lo oculta bajo 640 px. Se había asumido lo contrario al planear este cambio.

## Pliegue del CTA del hero en móvil (medido, con scroll 0)
| Viewport | Tope | Fondo | Veredicto |
|---|---:|---:|---|
| 320x568 | 832 | 880 | fuera |
| 360x640 | 723 | 771 | fuera |
| 375x667 | 700 | 748 | fuera (33 px bajo el pliegue) |
| 360x740 | 723 | 771 | parcial (corta 31 px) |
| 390x844 | 702 | 750 | dentro |
| 412x915 | 705 | 753 | dentro |
| 430x932 | 708 | 756 | dentro |

## Verificación (estado final)
Guardas 243 de 243, contraste 14/14 con 11 prohibidos, `npm run build` OK, `list-pending --check` OK (62 pendientes), Playwright completo con `E2E_BLOCK_CLICKUP=1`: 566 pasan, 97 omitidos (capturas por entorno), 0 fallos. HTML: 76023 B crudos (tope 81920) y 15004 B con gzip (tope 25600).

## Pendiente de decisión de Juan (CTA en móviles cortos)
1. CTA del header también en móvil (toca `SiteHeader.astro`: dos líneas o logo reducido a 320 px; el header no es fijo).
2. Compactar el ritmo vertical del hero en móvil (solo CSS, recupera unos 64 px: deja el CTA visible en 360x740 y 390x844; no basta a 320x568 ni 360x640).
3. CTA fijo inferior en móvil (siempre alcanzable, pero cubre contenido: SC 2.4.11 y 1.4.10, suma una quinta ubicación y pide una pasada completa de A11Y.md).
Recomendación del agente: la 2 como base, y sumar la 1 si el evento será sobre todo con móviles de 360x640 o menos.

## Pendiente de Ari
- Aprobar o reemplazar la etiqueta `hero.clients.label`.
- Aprobar cada uno de los 12 logos (marcas registradas de terceros) y que cada marca acepte figurar como cliente: editar la columna de aprobación de `src/assets/clients/PROVENANCE.md`.

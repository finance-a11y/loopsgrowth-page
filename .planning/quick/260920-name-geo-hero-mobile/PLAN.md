# Quick 260920-name-geo-hero-mobile: nombre completo, lang para GEO y hero compacto en moviles cortos

Rama: `feature/name-geo-hero-mobile` (git flow, desde `develop`). Commits atomicos con `git add` explicito.

## Tarea 1: nombre completo en la tarjeta del equipo
- `src/content/landing.es.yaml`: el integrante `Juan Angulo` pasa a `Juan Carlos Angulo` (sigue `pending`; el `reason` dice que Juan Carlos Angulo indico el nombre completo el 2026-09-20 y Ari confirma). Los `reason` de sus enlaces y `src/assets/team/PROVENANCE.md` usan el nombre completo. Otros integrantes y todos los cargos igual.
- Guardas y pruebas que nombran a Juan se actualizan; `npm run pending` regenera `PENDING-COPY.md`.
- Revision de la tarjeta a 320, 390, 768, 1024 y 1280 px (reserva `2lh` e igualdad de alturas).

## Tarea 2: `lang="en"` para GEO
- `src/lib/english-terms.mjs`: `GEO` entra en la lista cerrada (decision de Juan, 2026-09-20; sigla de Generative Engine Optimization).
- `Hero.astro` imprime el subtitulo con `LangText` (solo "GEO" queda envuelto en "SEO/GEO"). Sin `set:html`, el texto visible no cambia.
- Guarda node y prueba e2e `language-parts.spec.ts` cubren el termino nuevo.

## Tarea 3: hero compacto en moviles cortos (solo CSS)
- Reducir en movil el relleno superior e inferior, los huecos y los margenes de los parrafos del hero (y, si hace falta, el tamano movil del h1 dentro de la escala tipografica). Sin cambiar orden, copy, header ni elementos; el CTA del header sigue oculto bajo 640 px.
- Meta: CTA del hero completo en el primer pantallazo a 360x740 y 390x844, lo mas cerca posible a 375x667; se informa lo que queda bajo el pliegue a 320x568 y 360x640.
- Pasada `impeccable` y `design-taste-frontend`, capturas a 320, 390, 768, 1024, 1280 y los pantallazos iniciales, registradas en `VISUAL-LOG.md`.
- Pruebas: se actualizan `page-structure` y `hero-clients` solo donde la medida cambia legitimamente y se agrega una prueba que fija el resultado a 360x740 y 390x844.

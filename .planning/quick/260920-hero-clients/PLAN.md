# Quick 260920-hero-clients: CTA al final de los parrafos y lista de clientes bajo el CTA

Rama: `feature/hero-clients` (git flow, desde `develop`). Commits atomicos con `git add` explicito.

## Tarea 1: el CTA del hero va al final de los parrafos
- `Hero.astro`: orden h1, subtitulo, tres parrafos, CTA (antes CTA antes de la descripcion).
- `tests/e2e/page-structure.spec.ts`: nuevo orden; el pantallazo inicial en movil asegura h1, subtitulo y CTA del header; el CTA del hero ya no se exige en el primer pantallazo (decision de Juan, se registra en el SUMMARY).
- Verificar que el orden de tabulacion no cambia (los parrafos no son enfocables).

## Tarea 2: lista de los 12 clientes bajo el CTA
- 12 logos locales en `src/assets/clients/` + `PROVENANCE.md` (fuente, fecha, sha256, autorizo Juan, aprobacion de Ari pendiente) y la puerta de produccion en `scripts/check-photos.mjs` y `scripts/lib/photo-licenses.mjs` igual que las fotos del equipo.
- YAML `hero.clients`: 12 nombres `verified` (tomados de ariannalupi.com por indicacion de Juan) y la etiqueta como `pending` (Ari); `content.config.ts` lo valida.
- `Hero.astro`: `ul role="list"` con `aria-labelledby` de un `<p>` visible, tarjetas pop con logo (`alt=""`, `Image` de astro:assets, lazy) y nombre; sin enlaces ni animacion. Rejilla 3 / 4 / 6 columnas.
- Guardas node con mutaciones, e2e del bloque, `npm run pending`, suite completa y peso del HTML.

# Quick 260920-team-photos: fotos del equipo y enlace de Juan

Rama `feature/team-photos` (git flow, desde `develop`). Los textos son de Ari y no se tocan; el enlace de Juan es lo unico nuevo y viene de su instruccion del 2026-09-20 (anula el "sin enlaces" de UI-SPEC seccion 7 solo para su tarjeta).

## Tarea 1: tratamiento, procedencia y puerta
- `scripts/photos/treat-team.mjs` + manifiesto `src/components/sections/team-photos.mjs`: originales AVIF en `photo-sources/team/` (ignorado), recorte cuadrado, duotono marca (tinta a color del disco), PNG de paleta en `src/assets/team/treated/`.
- `src/assets/team/PROVENANCE.md` (fuente, fecha, sha256, quien autorizo, aprobacion de Ari y consentimiento pendientes) y `scripts/lib/photo-licenses.mjs` + `scripts/check-photos.mjs`: bloquean `PUBLIC_ENV=production` mientras haya pendientes.
- Guardas node --test con mutaciones (`tests/guards/team-photos.test.mjs`).

## Tarea 2: esquema, YAML y Team.astro
- `content.config.ts`: `link` opcional en miembro (`url`, `label` como claims); YAML: `juan-tech.com`, `verified`, `reason` de Juan.
- `Team.astro`: foto local (`astro:assets`, `alt=""`, ancho y alto, `lazy`) o avatar Loopy; enlace externo con el patron de AgendaSection; alturas iguales entre tarjetas mixtas.
- Ciclo visual con `impeccable` y `design-taste-frontend` a 320, 390, 768, 1024 y 1280 px.

## Tarea 3: pruebas y cierre
- Ampliar `tests/e2e/team-includes-how.spec.ts` (fotos, avatar de Miguel, enlace, foco, 320 px, sin terceros) y ajustar las pruebas que asumian 4 avatares y 0 enlaces.
- Suite completa (guardas, contraste, build, list-pending, Playwright) y `SUMMARY.md`.

# Procedencia de las fotos del equipo

Registro de las fotos reales de integrantes de Loops Growth que aparecen en "Quiénes somos" (`Team.astro`). Lo leen `scripts/lib/photo-licenses.mjs`, `scripts/photos/treat-team.mjs` y `scripts/check-photos.mjs` (que corre en prebuild). Las tres fotos son decorativas (`alt` vacío): el nombre de la persona está junto a la imagen. Miguel Pacheco no tiene foto y su tarjeta conserva el avatar Loopy.

## Estado

Las fotos salen de la página https://www.aprendoclub.com/quienes-somos, que no declara licencia ni derechos sobre ellas. Son fotos del propio equipo en el sitio de Ari y Juan Carlos Angulo autorizó su uso el 2026-09-20, pero la aprobación de Ari y el consentimiento de cada persona siguen PENDIENTES. La puerta de producción (`PUBLIC_ENV=production`) bloquea mientras cualquiera de las dos cosas esté pendiente; fuera de producción solo advierte.

## Cómo cerrar la aprobación

1. Ari confirma que puede usarse cada foto en la landing y cada persona da su consentimiento (por escrito, por ejemplo un mensaje).
2. En la tabla "Registro" de este archivo: escribir en la columna de aprobación `aprobada por <nombre> el <AAAA-MM-DD>` y en la de consentimiento `dado por <nombre> el <AAAA-MM-DD>`. Ninguna fecha puede ser anterior a la descarga.
3. Si una persona no consiente o Ari no aprueba: borrar su fila, su derivado `src/assets/team/treated/<id>.png` y su entrada en `src/components/sections/team-photos.mjs`; su tarjeta vuelve al avatar Loopy.
4. Comprobar: `node --test tests/guards/team-photos.test.mjs`, `PUBLIC_ENV=production node scripts/check-photos.mjs` (debe salir 0) y `npx astro build`.

## Tratamiento

Los originales (AVIF de 500x625, ya recortados del fondo) viven en `photo-sources/team/` (ignorado por git; aquí queda su sha256). `node scripts/photos/treat-team.mjs --id <id>` los recorta en cuadrado, los pasa a escala de grises y los mapea a un duotono de marca (tinta `#212121` en las sombras y el color del disco en las luces), de modo que el fondo blanco del original se funde con el disco. Sale un PNG de paleta reducida de 240x240 en `src/assets/team/treated/`. El círculo, el borde y la sombra dura los pone el CSS de la tarjeta.

## Registro

| id | derivado | fuente | descargada | dimensiones | sha256 | autorizó | aprobación de Ari | consentimiento | nota |
|----|----------|--------|------------|-------------|--------|----------|-------------------|----------------|------|
| `arianna` | `treated/arianna.png` | https://aprendoclub.com/api/media/file/arianna.avif | 2026-09-20 | 500x625 | bf7dc72e823500ec02bdfc79f846034c2cba8a10dd1c110e9a9b4df98380a070 | Juan Carlos Angulo, 2026-09-20 | pendiente | pendiente | Arianna Lupi. Foto de https://www.aprendoclub.com/quienes-somos, sin licencia declarada. |
| `veronica` | `treated/veronica.png` | https://aprendoclub.com/api/media/file/veronica.avif | 2026-09-20 | 500x625 | c86c4b0261465cd405b56be1f6cfbd12033309e076ac38bc293cd7adb86b19e3 | Juan Carlos Angulo, 2026-09-20 | pendiente | pendiente | Verónica Romero. Foto de https://www.aprendoclub.com/quienes-somos, sin licencia declarada. |
| `juan` | `treated/juan.png` | https://aprendoclub.com/api/media/file/juan.avif | 2026-09-20 | 500x625 | 81745284d17a6ced676cbf09bde8fffd2b42af1f899385b8d4b752e554ab2f20 | Juan Carlos Angulo, 2026-09-20 | pendiente | pendiente | Juan Carlos Angulo, quien pidió esta tarea. Foto de https://www.aprendoclub.com/quienes-somos, sin licencia declarada. |

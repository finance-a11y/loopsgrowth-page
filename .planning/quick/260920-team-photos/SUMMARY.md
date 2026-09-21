# Quick 260920: fotos del equipo y enlace en la tarjeta de Juan

**Rama:** `feature/team-photos` (git flow, desde `develop`). **Fecha:** 2026-09-20. **Estado:** completo.

## Pedido de Juan
1. Usar las fotos del equipo de https://www.aprendoclub.com/quienes-somos en la sección Quiénes somos.
2. Agregar en la tarjeta de Juan un enlace a https://juan-tech.com.

## Commits
- `4d73a2c`: tratamiento duotono, procedencia y puerta de producción (`treat-team.mjs`, manifiesto, `PROVENANCE.md`, 3 PNG, `photo-licenses.mjs`, `check-photos.mjs`, guardas).
- `c9fa99c`: retratos en `Team.astro`, enlace de Juan (esquema y YAML) y guardas de `dist`.
- `c3bb44a`: pruebas e2e de retratos, avatar de Miguel y enlace, más ajustes de pruebas existentes.

## Resultado
- Arianna Lupi, Verónica Romero y Juan Angulo llevan foto local (`astro:assets`, WebP 240x240, `alt=""` porque el nombre está en el `h3` de la tarjeta, `loading="lazy"`). Miguel Pacheco conserva el Loopy: no tiene foto en aprendoclub.com. Dana Aliaga e Ibraim Zayed no forman parte del equipo de Loops Growth y no se usaron.
- Tratamiento: duotono de marca (grises con contraste estirado, de la tinta `#212121` al color del disco: naranja, amarillo y crema), recorte cuadrado ajustado a la cara y círculo por CSS. Se descartó la media tinta dura (borra los rasgos a 80 a 100 px) y el morado como luz (casi sin rango de luminancia frente a `#212121`).
- Pesos: PNG de repo entre 7868 y 9004 bytes; WebP en `dist` entre 3870 y 5208 bytes. HTML de `/`: 71804 bytes crudos y 14431 con gzip.
- Enlace: `juan-tech.com` a `https://juan-tech.com`, `target="_blank" rel="noopener noreferrer"`, 44 px, subrayado permanente, foco global, texto visible igual al nombre accesible, complemento `sr-only` "se abre en una pestaña nueva", sin `aria-label`. Claims `verified` con nota de que lo indicó Juan el 2026-09-20.
- Nombres y cargos no cambian: la tarjeta dice "Juan Angulo" (doc de Ari), no "Juan Carlos Angulo".
- Excepción a UI-SPEC sección 7 ("sin enlaces" en el equipo): Juan la autoriza para su tarjeta. Queda anotada en el comentario de `Team.astro`.

## Procedencia y puerta
`src/assets/team/PROVENANCE.md` registra fuente, fecha, sha256 de cada original, dimensiones (500x625) y quién autorizó. La aprobación de Ari y el consentimiento de cada persona figuran `pendiente`: `PUBLIC_ENV=production` no compila hasta registrarlos (`check-photos.mjs` sale 1 en producción; fuera de producción solo advierte). La página de origen no declara licencia de las fotos.

## Verificación
Guardas 234 de 234 (12 nuevas con mutaciones), contraste 14/14, `list-pending --check` OK (61), build OK, Playwright con ClickUp bloqueado 546 pasan y 97 omitidas. Un fallo intermitente de `cta-focus (b)` en la corrida completa pasó 3 de 3 aislado.

## Desviaciones
1. `collage-photos.spec.ts` ("sin JavaScript la foto se pinta") se volvió intermitente con la página nueva: se cambió `scrollIntoViewIfNeeded` por `el.scrollIntoView()` por evaluación directa, sin alterar lo que mide. Causa raíz no encontrada.
2. `hint` (complemento `sr-only`) como tercer claim del enlace, para no dejar una cadena suelta en `Team.astro`.
3. Ajustes a pruebas existentes por el cambio de contenido (una parada de Tab más en `a11y-base`, un avatar en vez de cuatro en `collage-language` y `phase-closing`).

## Pendiente de decisión
- Ari aprueba las fotos y cada persona da su consentimiento (pasos en `PROVENANCE.md`).
- Foto de Miguel Pacheco.
- Si Ari no quiere el enlace de Juan: borrar `link` de su miembro en el YAML.
- Calidad: los AVIF son de 500x625; si Ari quiere más calidad, pedirle los originales.

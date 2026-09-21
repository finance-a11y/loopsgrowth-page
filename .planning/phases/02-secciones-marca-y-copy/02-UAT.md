---
status: testing
phase: 02-secciones-marca-y-copy
source: [02-VERIFICATION.md]
started: 2026-09-19T23:59:00Z
updated: 2026-09-19T23:59:00Z
---

## Current Test

number: 1
name: Ari entrega los 61 textos pendientes
expected: |
  Con los textos cargados, `PUBLIC_ENV=production node scripts/check-copy.mjs` sale 0 y la página muestra, sin FALTA CONFIRMAR, el perfil de USD 200k desde Para quién es y un FAQ de 5 a 6 preguntas legibles.
awaiting: user response

## Tests

### 1. Ari entrega los 61 textos pendientes
Lista en `PENDING-COPY.md` (`node scripts/list-pending.mjs`) y en `02-ARI-FINDINGS.md`: perfil USD 200k y columnas de Para quién es, título y 6 pares pregunta y respuesta del FAQ, título de La solución, cuerpo del pilar 4, resultado 2, canales y plazos, correo y redes del footer, política de privacidad. Ari también confirma 30 min contra 20 min y las erratas del doc.
expected: `PUBLIC_ENV=production node scripts/check-copy.mjs` sale 0. Cubre el criterio 3 del ROADMAP y cierra en contenido CONT-10, CONT-11 y CONT-12 (hoy completos solo en estructura).
result: [pending]

### 2. Elegir una foto por ranura y aprobar la licencia
Juan y Ari eligen en `/marca/hoja/` y Ari escribe la aprobación en `src/assets/photos/LICENSES.md` (pasos de cierre en la salida de `PUBLIC_ENV=production node scripts/check-photos.mjs`). Las cuatro fotos muestran manos u ojo de personas reales y la fuente no registra permiso de modelo.
expected: `PUBLIC_ENV=production node scripts/check-photos.mjs` sale 0 y el build de producción deja de bloquearse por fotos.
result: [pending]

### 3. FAQ con VoiceOver y teclado
Recorrer los `summary` del FAQ con VoiceOver (Safari, macOS) y con teclado.
expected: Cada summary se anuncia con su pregunta y su estado abierto o cerrado; Enter y Espacio lo alternan; el foco es visible.
result: [pending]

### 4. Teclado dentro y fuera del iframe real de ClickUp
Tab hasta el formulario y Shift+Tab de regreso. No enviar el formulario. Siguen vigentes además los 6 ítems humanos de `01-UAT.md`.
expected: Se entra y se sale sin trampa de foco y el iframe con el formulario real carga.
result: [pending]

### 5. Marca contra el moodboard real
Ari y Camila comparan la página con el moodboard (`brand-inventory/moodboard.png`, `ai_a.png`) en un navegador real a 390 y 1280 px. Diferencias honestas: la media tinta de la foto es más blanda que la de las piezas de referencia, la foto va en un marco con sombra que parece tarjeta y no un recorte libre, y los avatares del equipo son el Loopy y no una ilustración por persona. También confirman las palabras de las píldoras (`spy` y `team work` vienen del moodboard) y el morado `#4228D1` frente a la etiqueta `#73187F` del BrandBook.
expected: El estilo se siente de la misma familia y Ari aprueba o pide ajustes concretos.
result: [pending]

## Summary

total: 5
passed: 0
issues: 0
pending: 5
skipped: 0
blocked: 0

## Gaps

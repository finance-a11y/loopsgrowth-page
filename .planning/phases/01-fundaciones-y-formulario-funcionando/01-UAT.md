---
status: testing
phase: 01-fundaciones-y-formulario-funcionando
source: [01-VERIFICATION.md]
started: 2026-09-19T04:03:51Z
updated: 2026-09-19T04:03:51Z
---

## Current Test

number: 1
name: FORM-05, escritorio 1280 px. Avisar antes a Ari de que se crearán dos tareas de 
expected: |
  La confirmación de ClickUp aparece dentro del iframe sin salir de la landing, sin recortes, saltos ni scroll horizontal. Anotar el idioma de la confirmación y si queda un hueco en blanco bajo ella por el min-height.
awaiting: user response

## Tests

### 1. FORM-05, escritorio 1280 px. Avisar antes a Ari de que se crearán dos tareas de prueba. Abrir Chrome en http://localhost:4321 (npm run dev), ventana de 1280 px, hacer clic en un CTA 'Agenda tu llamada de 30 minutos', comprobar que se baja a la sección con el foco en 'Agenda tu llamada'. Llenar el formulario con datos ficticios del equipo con 'PRUEBA' y la fecha en el nombre, y enviarlo una sola vez.
expected: La confirmación de ClickUp aparece dentro del iframe sin salir de la landing, sin recortes, saltos ni scroll horizontal. Anotar el idioma de la confirmación y si queda un hueco en blanco bajo ella por el min-height.
result: [pending]

### 2. FORM-05, móvil 390 px. En Chrome con la barra de dispositivos en 390 px (o un teléfono en la misma red con npm run dev:lan), repetir el recorrido completo: CTA, foco en el h2, datos ficticios con 'PRUEBA' y la fecha, un solo envío.
expected: La confirmación de ClickUp se ve dentro del iframe a 390 px, sin scroll horizontal ni recortes, con la misma observación de idioma y de hueco en blanco.
result: [pending]

### 3. FORM-05, comprobar y limpiar en ClickUp. Abrir la Lista de Ari, confirmar que existen exactamente dos tareas marcadas PRUEBA con los datos enviados y borrarlas (Juan). Completar la tabla 'Resultado de FORM-05' y la decisión sobre el hueco en blanco en 01-FORM-MEASUREMENTS.md (hoy 'pendiente').
expected: Dos tareas, una por envío, creadas y luego borradas; la Lista no conserva datos de prueba; la decisión sobre --form-min-h-* queda escrita ('aceptado' o el nuevo valor).
result: [pending]

### 4. FORM-04, auto-resize. En ClickUp, abrir 'Compartir, insertar y exportar' del formulario y comprobar que 'Autosize embed height' está activada. Si lo está y el comportamiento persiste, aceptar que la reserva medida es la solución definitiva de la landing.
expected: Decisión escrita de Juan/Ari. Hoy el script forms-embed/v1.js se engancha al iframe (style.height en línea en los cinco anchos) pero solo reporta la altura propia del iframe, no la del contenido (resizeSigueContenido = false en los cinco anchos).
result: [pending]

### 5. Revisión visual de los tres arreglos marcados 'requires human verification' en 01-REVIEW-FIX.md: (a) WR-14, mirar test-results/skip-link-focused-agenda.png y confirmar que el anillo del skip link se ve sobre la sección morada; (b) WR-08, abrir /#agenda con un bloqueador de terceros y con lector de pantalla y comprobar que el foco cae en el h2 de #agenda; (c) WR-05, revisar que la lista cerrada de formas de voseo (88) cubre el copy de Ari.
expected: El anillo es visible, el foco se conserva con ClickUp bloqueado y la lista de voseo no deja pasar formas del doc de Ari.
result: [pending]

### 6. FND-01 desde otro dispositivo. Con npm run dev:lan, abrir http://<IPv4 de la red local>:4321 desde el teléfono o el equipo de Ari o Camila.
expected: La página carga y el formulario se ve embebido.
result: [pending]

## Summary

total: 6
passed: 0
issues: 0
pending: 6
skipped: 0
blocked: 0

## Gaps

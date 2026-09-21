# Licencias de las fotos del collage

Registro de cada foto de stock usada o candidata en las ranuras de foto del collage (hero y Por qué ahora). Lo leen `scripts/lib/photo-licenses.mjs`, `scripts/photos/treat.mjs` y `scripts/check-photos.mjs`. Todas las fotos son decorativas (alt vacío): no aportan información que el texto no dé.

## Estado

Elección: abierta

Fotos elegidas por defecto: `hero-a` y `whynow-a` (candidatas: `hero-b` y `whynow-b`). Aprobación de Ari: pendiente. La puerta de producción (`PUBLIC_ENV=production`) bloquea mientras la aprobación esté pendiente o existan candidatas sin elegir.

## Cómo cerrar la elección

1. Juan y Ari eligen en `/marca/hoja/` una candidata por ranura.
2. En `src/components/collage/photos.mjs` (arreglo `PHOTOS`): `chosen: true` solo en la elegida de cada ranura y borrar la entrada de la otra.
3. En `src/assets/photos/LICENSES.md`: escribir en la columna de aprobación de la elegida `aprobada por <nombre> el <AAAA-MM-DD>`, borrar la fila de la otra, cambiar `Elección: abierta` por `Elección: cerrada` y actualizar "Estado". Todo el cierre va en un solo commit.
4. Borrar `src/assets/photos/treated/<id>.png` de la candidata descartada y su original en `photo-sources/`.
5. Comprobar: `node --test tests/guards/photos.test.mjs`, `PUBLIC_ENV=production node scripts/check-photos.mjs` (debe salir 0) y `npx astro build`.

## Reglas de selección

Una foto solo entra si cumple todo:

1. Fuente y licencia: Unsplash, Pexels o Pixabay, con la licencia leída el día de la descarga.
2. No generada por IA.
3. Sin persona identificable (única excepción, un ojo humano en primer plano sin rostro identificable, marcado en la nota para Ari). Sin menores. Sin contenido sensible.
4. Sin texto legible, logotipos ni marcas en la zona recortada.
5. Sujeto: hero, un ojo detrás de una lupa o manos con una lupa o un teléfono; Por qué ahora, manos con una laptop o un teléfono, sin repetir el sujeto del hero.
6. Tonos que dejen el sujeto legible como recorte en media tinta.
7. Resolución: la zona recortada tiene al menos el doble del ancho de salida (768 px en hero y 416 px en Por qué ahora).
8. Composición: el sujeto llena al menos el 60 % del recorte.

Los originales viven en `photo-sources/` (ignorado por git); aquí queda su sha256. Las fotos reales de Ari o del equipo, cuando existan, entrarán por el mismo tratamiento con una ranura nueva y un `alt` confirmado por una persona.

## Licencias verificadas

### Unsplash License

URL: https://unsplash.com/license
Leída el: 2026-09-19

> "All images can be downloaded and used for free" for "Commercial and non-commercial purposes" with "No permission needed."
> "Images cannot be sold without significant modification. Compiling images from Unsplash to replicate a similar or competing service" is prohibited.
> The longform text grants "an irrevocable, nonexclusive, worldwide copyright license to download, copy, modify, distribute, perform, and use images from Unsplash for free, including for commercial purposes, without permission from or attributing the photographer or Unsplash."

Nota del ejecutor: la página respondió con un desafío anti bots a curl (Anubis), así que la cita salió de la herramienta de lectura web (WebFetch), que entrega fragmentos entrecomillados y no el texto completo. Coincide con la referencia del 2026-09-19 del plan. La licencia no trata personas identificables, marcas ni permisos de modelo.

## Registro

| id | derivado | fuente | autor | licencia | URL de la licencia | descargada | dimensiones | sha256 | aprobación | nota |
|----|----------|--------|-------|----------|--------------------|------------|-------------|--------|------------|------|
| `hero-a` | `treated/hero-a.png` | https://unsplash.com/photos/a-close-up-of-a-persons-eye-through-a-magnifying-glass-Yu7UxPvBVOM | [Mohammed Idris Djoudi](https://unsplash.com/@idris_djoudi) | Unsplash License | https://unsplash.com/license | 2026-09-19 | 1600x2408 | 59b39ecb00f45caff948de8701c9ce90ace89d607712d6f8c3f3f41fb3255925 | pendiente | Ojo humano en primer plano detrás del aro de una lupa, recortado al ojo y la ceja, sin rostro identificable. Advertencia para Ari: es una excepción a la regla de no mostrar personas, sin permiso de modelo registrado por la fuente. |
| `hero-b` | `treated/hero-b.png` | https://unsplash.com/photos/a-person-holding-a-magnifying-glass-with-a-finger-on-it-ZJUG912sIW4 | [ThisisEngineering](https://unsplash.com/@thisisengineering) | Unsplash License | https://unsplash.com/license | 2026-09-19 | 1600x1067 | 8dda2c602b07bb9cf6ba24626c216b4e1151fcd5f07dc7d3840f73e5fb578f21 | pendiente | Mano con una lupa grande sobre una mesa de trabajo, sin rostro. Advertencia para Ari: solo se ve una mano, sin permiso de modelo registrado por la fuente. |
| `whynow-a` | `treated/whynow-a.png` | https://unsplash.com/photos/a-person-holding-a-cell-phone-in-their-hand-f4swqEOv2B4 | [Nubelson Fernandes](https://unsplash.com/@nublson) | Unsplash License | https://unsplash.com/license | 2026-09-19 | 1600x2845 | 36c830081bc874859df6ad5a2587990423667089ef1314f91855eaf39a424f2e | pendiente | Mano tocando un teléfono sobre fondo liso, recortado bajo el reloj de la pantalla para no mostrar texto legible; sin rostro. Advertencia para Ari: solo se ve una mano. |
| `whynow-b` | `treated/whynow-b.png` | https://unsplash.com/photos/hands-typing-on-a-laptop-keyboard-at-a-desk-lMScFOdgRNg | [Vitaly Gariev](https://unsplash.com/@silverkblack) | Unsplash License | https://unsplash.com/license | 2026-09-19 | 1600x900 | ffb9d66a60305c933c1c80f77f426e22ee4a8129aed78908edb4265a32c71255 | pendiente | Manos tecleando en una laptop de perfil, sin rostro y sin pantalla visible en el recorte. Advertencia para Ari: solo se ven manos; el fondo del original es desenfocado y no liso. |

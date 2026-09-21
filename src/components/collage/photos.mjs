// Manifiesto de fotos del collage (plan 02-11). ESM plano, sin colores, sin licencia y sin copy:
// la licencia vive en src/assets/photos/LICENSES.md y el color del papel lo pone la ranura de la escena.
// `params` son los parámetros de tratamiento (scripts/photos/treat.mjs): recorte en fracciones del
// original ya girado por EXIF, tamaño de salida (el doble de la caja de pantalla), celda y ángulo de
// la trama, contraste y brillo.

/** Ranuras que llevan foto (las de PHOTO_SLOTS en scenes.mjs). */
export const PHOTO_SLOT_NAMES = Object.freeze(['hero', 'whynow']);

/**
 * Carga por ranura. La foto del hero está en el primer pantallazo a 1280x800 pero no es el LCP (el LCP
 * es el h1), así que va `eager` y sin prioridad de descarga alta; la de Por qué ahora va `lazy`.
 */
export const PHOTO_LOADING = Object.freeze({ hero: 'eager', whynow: 'lazy' });

/** @type {{ id: string, slot: string, chosen: boolean, params: { crop: { left: number, top: number, width: number, height: number }, out: { w: number, h: number }, cell: number, angle: number, contrast: 1.0, brightness: 165 } }[]} */
export const PHOTOS = [
  {
    id: 'hero-a',
    slot: 'hero',
    chosen: true,
    params: { crop: { left: 0.26, top: 0.28, width: 0.58, height: 0.5017 }, out: { w: 384, h: 500 }, cell: 6, angle: 45, contrast: 1.0, brightness: 175 },
  },
  {
    id: 'hero-b',
    slot: 'hero',
    chosen: false,
    params: { crop: { left: 0.02, top: 0, width: 0.512, height: 1 }, out: { w: 384, h: 500 }, cell: 6, angle: 45, contrast: 1.0, brightness: 118 },
  },
  {
    id: 'whynow-a',
    slot: 'whynow',
    chosen: true,
    params: { crop: { left: 0.24, top: 0.565, width: 0.46, height: 0.3185 }, out: { w: 208, h: 256 }, cell: 4, angle: 45, contrast: 1.0, brightness: 92 },
  },
  {
    id: 'whynow-b',
    slot: 'whynow',
    chosen: false,
    params: { crop: { left: 0.47, top: 0, width: 0.457, height: 1 }, out: { w: 208, h: 256 }, cell: 4, angle: 45, contrast: 1.0, brightness: 105 },
  },
];

/** Foto elegida de una ranura (o undefined si no hay). */
export const chosenPhoto = (slot) => PHOTOS.find((p) => p.slot === slot && p.chosen);

/** Foto por id (o undefined). */
export const photoById = (id) => PHOTOS.find((p) => p.id === id);

/** Lanza un error en español si el id no existe o pertenece a otra ranura. */
export function assertPhotoForSlot(id, slot) {
  const photo = photoById(id);
  if (!photo) throw new Error(`Foto "${id}" no existe en el manifiesto (ids: ${PHOTOS.map((p) => p.id).join(', ')}).`);
  if (photo.slot !== slot) throw new Error(`La foto "${id}" es de la ranura "${photo.slot}" y no de "${slot}".`);
  return photo;
}

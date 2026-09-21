// Manifiesto de las fotos del equipo (quick 260920-team-photos). ESM plano, sin copy y sin licencia: la
// procedencia vive en src/assets/team/PROVENANCE.md y los textos en el YAML. Las fotos se asignan por
// POSICIÓN de la tarjeta (`index` en `team.members`), igual que los avatares Loopy de Team.astro: una
// cadena suelta dentro de `es` rompe la guarda FND-02 (BARE_STRING). Una tarjeta sin entrada aquí
// (Miguel Pacheco, índice 3) conserva su avatar Loopy.
//
// `crop` es un cuadrado en píxeles del original ya girado por EXIF (500x625); `out` es el lado de salida
// (el doble de la caja de pantalla máxima de 120 px); `gamma` reparte los tonos medios (mayor oscurece la cara, menor la aclara); `disc` es el color de marca que
// llena las luces del duotono y, por tanto, el disco visible. Las sombras van en la tinta oscura.

/** Lado del PNG de salida en píxeles. */
export const TEAM_PHOTO_OUT = 240;

/** Tope de peso del PNG derivado en bytes (medido: unos 8 KB por foto). El WebP que emite Astro pesa menos. */
export const TEAM_PNG_MAX = 20480;

/** Colores de marca permitidos como luz del duotono (todos más claros que la tinta y con contraste medible). */
export const TEAM_DISC_COLORS = Object.freeze(['yellow', 'orange', 'cream']);

/** @type {{ id: string, index: number, disc: string, gamma: number, crop: { left: number, top: number, size: number } }[]} */
export const TEAM_PHOTOS = [
  { id: 'arianna', index: 0, disc: 'orange', gamma: 1.5, crop: { left: 100, top: 40, size: 350 } },
  { id: 'veronica', index: 1, disc: 'yellow', gamma: 0.6, crop: { left: 140, top: 50, size: 340 } },
  { id: 'juan', index: 2, disc: 'cream', gamma: 1.15, crop: { left: 90, top: 45, size: 380 } },
];

/** Foto de la tarjeta en la posición dada (o undefined si la tarjeta lleva avatar Loopy). */
export const teamPhotoAt = (index) => TEAM_PHOTOS.find((p) => p.index === index);

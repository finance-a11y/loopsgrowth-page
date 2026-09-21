// Fórmula de media tinta (plan 02-11). Pura y sin dependencias: recibe grises y devuelve alfa de
// borde duro (solo 0 o 255). Trama girada `angle` grados; el punto de cada celda crece con el tono.
// Motivo del borde duro: con bordes suavizados el PNG pesa de 40 a 100 KB y con borde duro 8 KB.

/** Radio del punto para un tono `t` entre 0 y 1 en una celda de lado `cell`. Continuo y creciente. */
export function toneRadius(t, cell) {
  const knee = Math.PI / 4;
  if (t <= knee) return cell * Math.sqrt(Math.max(t, 0) / Math.PI);
  return cell * (0.5 + ((Math.min(t, 1) - knee) * 0.2071) / (1 - knee));
}

/**
 * Alfa de la media tinta.
 * @param {Uint8Array | Uint8ClampedArray} gray gris de 0 a 255, `width * height` valores
 * @param {number} width
 * @param {number} height
 * @param {{ cell?: number, angle?: number, radius?: (t: number, cell: number) => number }} [options]
 * @returns {Uint8Array} alfa 0 o 255 (255 es tinta)
 */
export function halftoneAlpha(gray, width, height, options = {}) {
  const { cell = 6, angle = 45, radius = toneRadius } = options;
  const rad = (angle * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const out = new Uint8Array(width * height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const px = x + 0.5;
      const py = y + 0.5;
      const u = px * cos + py * sin;
      const v = -px * sin + py * cos;
      const cu = (Math.floor(u / cell) + 0.5) * cell;
      const cv = (Math.floor(v / cell) + 0.5) * cell;
      const sx = Math.min(width - 1, Math.max(0, Math.round(cu * cos - cv * sin - 0.5)));
      const sy = Math.min(height - 1, Math.max(0, Math.round(cu * sin + cv * cos - 0.5)));
      const t = 1 - gray[sy * width + sx] / 255;
      out[y * width + x] = Math.hypot(u - cu, v - cv) <= radius(t, cell) ? 255 : 0;
    }
  }
  return out;
}

/** Cobertura de tinta: alfa medio entre 255. */
export function inkCoverage(alpha) {
  let sum = 0;
  for (let i = 0; i < alpha.length; i += 1) sum += alpha[i];
  return sum / (alpha.length * 255);
}

import { readFileSync } from 'node:fs';
import { hexToRgb, parseTokens } from '../../../scripts/lib/contrast.mjs';

// Colores de marca en el formato que devuelve Chromium (`rgb(r, g, b)`), leídos de
// `src/styles/tokens.css` al importar. Ningún spec repite un valor: si el morado de marca cambia
// en el token, los specs siguen midiendo lo que la página debe mostrar.
const { theme } = parseTokens(readFileSync('src/styles/tokens.css', 'utf8')) as {
  theme: Record<string, string>;
};

/** Formato rgb de Chromium para un token primitivo, por ejemplo `rgbOfToken('purple')`. */
export function rgbOfToken(name: string): string {
  const key = name.startsWith('--') ? name : `--color-brand-${name}`;
  const hex = theme[key];
  if (!hex) throw new Error(`Token "${key}" no existe en src/styles/tokens.css`);
  const [r, g, b] = hexToRgb(hex) as [number, number, number];
  return `rgb(${r}, ${g}, ${b})`;
}

export const PURPLE_RGB = rgbOfToken('purple');

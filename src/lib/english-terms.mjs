// Idioma de las partes (A11Y.md, WCAG 3.1.2): los términos en inglés del copy llevan `lang="en"` para que un
// lector de pantalla no los pronuncie con fonética española. El texto de Ari NO se toca: el YAML sigue
// verbatim y este módulo solo parte la cadena YA escrita en trozos, sin añadir, quitar ni cambiar un
// carácter (unir los trozos devuelve la cadena original). No emite HTML: `LangText.astro` imprime cada
// trozo como nodo de texto (Astro lo escapa) y envuelve solo los de idioma inglés en `<span lang="en">`.
//
// Lista cerrada de términos. Para añadir uno, agrégalo aquí: la prueba e2e `language-parts.spec.ts`
// falla si algún término de la lista aparece en la página fuera de un `[lang="en"]`.
export const EN_TERMS = Object.freeze([
  'Core Web Vitals',
  'link building',
  'keywords',
  'email marketing',
  'SaaS B2B',
  'Meta Ads',
  'e-commerce',
  // GEO: sigla de Generative Engine Optimization. Se añadió por decisión de Juan (2026-09-20). Solo se envuelve
  // "GEO" (en "SEO/GEO" el "SEO" queda fuera). El `<title>` y las metaetiquetas no admiten `lang` y no se tocan.
  'GEO',
]);

const escapeRegExp = (term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Palabra completa (sin letra ni dígito pegados a los lados), sin distinguir mayúsculas, el más largo primero.
// Un único grupo de captura: `split` intercala las coincidencias en las posiciones impares.
const TERMS_RE = new RegExp(
  `(?<![\\p{L}\\p{N}])(${[...EN_TERMS]
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)
    .join('|')})(?![\\p{L}\\p{N}])`,
  'giu',
);

/**
 * Parte `text` en trozos `{ text, en }` conservando cada carácter: `en` es verdadero en los términos de la
 * lista. Sin trozos vacíos. `segments.map((s) => s.text).join('')` es siempre igual a `text`.
 * @param {string} text
 * @returns {{ text: string, en: boolean }[]}
 */
export function splitEnglish(text) {
  return String(text)
    .split(TERMS_RE)
    .map((part, i) => ({ text: part, en: i % 2 === 1 }))
    .filter((segment) => segment.text !== '');
}

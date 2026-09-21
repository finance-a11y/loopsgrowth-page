// Guarda del idioma de las partes (WR-02, A11Y.md SC 3.1.2): `splitEnglish` marca los términos en inglés
// SIN cambiar un solo carácter del copy de Ari, y ningún texto del YAML se altera al partirlo.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { walkClaims } from '../../scripts/lib/copy-rules.mjs';
import { EN_TERMS, splitEnglish } from '../../src/lib/english-terms.mjs';

const doc = parse(readFileSync('src/content/landing.es.yaml', 'utf8'));
const texts = walkClaims(doc)
  .filter((n) => n.kind === 'claim')
  .map((n) => ({ path: n.path, text: n.claim.text }));
const join = (segments) => segments.map((s) => s.text).join('');
const enOf = (text) => splitEnglish(text).filter((s) => s.en).map((s) => s.text);

test('idioma: partir cada texto del YAML y unir los trozos devuelve la cadena original, carácter por carácter', () => {
  assert.ok(texts.length > 50, 'el recorrido no encontró afirmaciones');
  for (const { path, text } of texts) {
    const segments = splitEnglish(text);
    assert.equal(join(segments), text, path);
    assert.ok(segments.every((s) => s.text !== ''), `${path}: trozo vacío`);
  }
});

test('idioma: los términos del review se marcan en el copy real y con el texto exacto del YAML', () => {
  const expected = {
    'Juan (Director Técnico): auditorías, Core Web Vitals, arquitectura.': ['Core Web Vitals'],
    'Miguel (Especialista SEO): keywords, contenido, link building.': ['keywords', 'link building'],
    'e-commerce de vapes (LATAM)': ['e-commerce'],
    'software de email marketing (SaaS B2B)': ['email marketing', 'SaaS B2B'],
    'marca personal referente en Meta Ads': ['Meta Ads'],
    'Meta Ads': ['Meta Ads'],
    'Link building y autoridad': ['Link building'],
    // GEO (decisión de Juan, 2026-09-20): solo "GEO" se marca, no "SEO".
    'SEO/GEO': ['GEO'],
  };
  for (const [text, en] of Object.entries(expected)) {
    assert.ok(texts.some((t) => t.text === text), `el YAML ya no trae "${text}"`);
    assert.deepEqual(enOf(text), en, text);
  }
  // Cada término de la lista aparece al menos una vez marcado en el copy real (la lista no es letra muerta).
  for (const term of EN_TERMS) {
    assert.ok(texts.some((t) => enOf(t.text).some((e) => e.toLowerCase() === term.toLowerCase())), `sin uso en el YAML: ${term}`);
  }
});

test('idioma: mutaciones (palabra completa, mayúsculas, el más largo primero, sin coincidencia)', () => {
  assert.deepEqual(enOf('mis keywordsx y unkeywords'), [], 'pegado a otra palabra no cuenta');
  assert.deepEqual(enOf('KEYWORDS, Keywords y keywords'), ['KEYWORDS', 'Keywords', 'keywords'], 'conserva las mayúsculas del original');
  assert.deepEqual(enOf('email marketing (SaaS B2B)'), ['email marketing', 'SaaS B2B']);
  assert.deepEqual(splitEnglish('sin términos en inglés'), [{ text: 'sin términos en inglés', en: false }]);
  assert.deepEqual(splitEnglish(''), []);
  // Un término con signos de expresión regular no se interpreta como patrón.
  assert.deepEqual(enOf('e-commerce y ecommerce'), ['e-commerce']);
});

test('idioma: GEO se marca como palabra completa, también dentro de SEO/GEO y en la frase del hero', () => {
  assert.deepEqual(splitEnglish('SEO/GEO'), [{ text: 'SEO/', en: false }, { text: 'GEO', en: true }]);
  const hero = 'Un equipo dedicado y especializado que ejecuta tu SEO/GEO y tu visibilidad en asistentes de IA (ChatGPT, Gemini).';
  assert.deepEqual(enOf(hero), ['GEO']);
  assert.equal(join(splitEnglish(hero)), hero);
  assert.deepEqual(enOf('geolocalización, Geographic y GEOX'), [], 'pegado a otras letras no cuenta');
  assert.deepEqual(enOf('(GEO)'), ['GEO']);
});

test('idioma: el subtítulo del hero pasa por LangText', () => {
  const hero = readFileSync('src/components/sections/Hero.astro', 'utf8');
  assert.ok(/<p class="hero-sub"><LangText text=\{subtitle\} \/><\/p>/.test(hero), 'el subtítulo del hero debe imprimirse con LangText');
});

test('idioma: el resultado es solo datos; el HTML de un texto no se interpreta', () => {
  const hostile = '<img src=x onerror=alert(1)> keywords <b>';
  const segments = splitEnglish(hostile);
  assert.equal(join(segments), hostile);
  assert.deepEqual(segments.filter((s) => s.en).map((s) => s.text), ['keywords']);
  const component = readFileSync('src/components/ui/LangText.astro', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.ok(!/set:html|innerHTML|Fragment set/.test(component), 'LangText no puede inyectar HTML en bruto');
});

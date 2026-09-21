import { test, expect } from '@playwright/test';
import { EN_TERMS } from '../../src/lib/english-terms.mjs';

// Idioma de las partes (WR-02, A11Y.md SC 3.1.2): en la página construida, cada aparición de un término
// en inglés de la lista cerrada de `src/lib/english-terms.mjs` cae dentro de un `[lang="en"]`, y el
// texto visible no cambia (los `span` no añaden ni quitan caracteres).
test.describe('idioma de las partes en /', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('ningún término en inglés queda fuera de un [lang="en"] y cada término tiene al menos un span', async ({ page }) => {
    await page.goto('/');
    const result = await page.evaluate((terms) => {
      const escape = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(`(?<![\\p{L}\\p{N}])(?:${terms.map(escape).join('|')})(?![\\p{L}\\p{N}])`, 'giu');
      const unmarked: string[] = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const parent = node.parentElement;
        if (!parent || parent.closest('script, style, noscript, template')) continue;
        const value = node.nodeValue ?? '';
        if (re.test(value) && !parent.closest('[lang="en"]')) unmarked.push(value.trim());
        re.lastIndex = 0;
      }
      const marked = [...document.querySelectorAll('[lang="en"]')].map((el) => el.textContent ?? '');
      return { unmarked, marked };
    }, [...EN_TERMS]);
    expect(result.unmarked, 'términos sin lang="en"').toEqual([]);
    for (const term of EN_TERMS) {
      expect(
        result.marked.some((text) => text.toLowerCase() === term.toLowerCase()),
        `sin <span lang="en"> para "${term}"`,
      ).toBe(true);
    }
  });

  test('el span es solo un nodo de texto: no lleva hijos, atributos extra ni cambia el texto visible', async ({ page }) => {
    await page.goto('/');
    // Las píldoras decorativas del collage (`data-pill`) ya traían su propio `lang` y otros atributos: no son de este mecanismo.
    const spans = page.locator('span[lang="en"]:not([data-pill])');
    const count = await spans.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i += 1) {
      const span = spans.nth(i);
      const shape = await span.evaluate((el) => ({
        attrs: el.getAttributeNames(),
        children: el.children.length,
      }));
      expect(shape.attrs).toEqual(['lang']);
      expect(shape.children).toBe(0);
    }
    // El texto de la tarjeta se lee igual que en el YAML: el span no añade espacios ni signos.
    await expect(page.locator('#casos')).toContainText('software de email marketing (SaaS B2B)');
    await expect(page.locator('#solucion')).toContainText('Miguel (Especialista SEO): keywords, contenido, link building.');
    await expect(page.locator('#incluye')).toContainText('(Core Web Vitals, velocidad, indexación, schema), para que Google y la IA puedan leerte y confiar en ti.');
  });

  // GEO (decisión de Juan, 2026-09-20): en el subtítulo del hero solo "GEO" lleva lang="en"; "SEO/" no, y el texto visible es el mismo.
  test('el subtítulo del hero marca solo GEO y se lee igual', async ({ page }) => {
    await page.goto('/');
    const sub = page.locator('.hero-sub');
    await expect(sub).toHaveText('Un equipo dedicado y especializado que ejecuta tu SEO/GEO y tu visibilidad en asistentes de IA (ChatGPT, Gemini).');
    const spans = sub.locator('[lang="en"]');
    await expect(spans).toHaveCount(1);
    await expect(spans).toHaveText('GEO');
    // "SEO/" queda como texto suelto del párrafo, fuera del span.
    const loose = await sub.evaluate((el) => [...el.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE).map((n) => n.nodeValue ?? '').join('|'));
    expect(loose).toContain('SEO/');
    expect(loose).not.toContain('GEO');
  });
});

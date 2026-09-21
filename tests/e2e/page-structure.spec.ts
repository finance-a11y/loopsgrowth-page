import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { parse } from 'yaml';
import { PURPLE_RGB } from './lib/brand';
import { HTML_GZIP_MAX, HTML_RAW_MAX } from './lib/budgets.mjs';
import { expectMotionWithinBudget, expectNoMotion } from './lib/motion';

// Estructura de la página (fase 2, plan 01). Los textos esperados salen del YAML y no se copian
// a mano: se resuelven {term} y {duration} igual que `fill()` de src/lib/content.ts.
type Claim = { text: string };
const es = (parse(readFileSync('src/content/landing.es.yaml', 'utf8')) as {
  es: {
    brand: { term: Claim };
    call: { duration: Claim };
    hero: { h1: Claim; subtitle: Claim; description: Claim[] };
  };
}).es;
const resolveText = (claim: Claim) =>
  claim.text.replaceAll('{term}', es.brand.term.text).replaceAll('{duration}', es.call.duration.text);

const H1_TEXT = resolveText(es.hero.h1);
const SUBTITLE_TEXT = resolveText(es.hero.subtitle);
const DESCRIPTION_TEXTS = es.hero.description.map(resolveText);

// Orden vertical del hero (quick 260920-hero-clients, indicación de Juan): h1, subtítulo, descripción, CTA y
// después la lista de clientes. Antes el CTA subía sobre la descripción.
const HERO_ORDER = ['h1', 'subtitle', 'description', 'cta', 'clients'] as const;

const PURPLE = PURPLE_RGB;

type Box = { top: number; bottom: number; left: number; right: number; width: number; height: number };

/** Rectángulo (getBoundingClientRect) de la primera coincidencia del selector, en px de la ventana. */
async function box(page: Page, selector: string): Promise<Box> {
  return page.locator(selector).first().evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, width: r.width, height: r.height };
  });
}

const HERO_SELECTORS: Record<(typeof HERO_ORDER)[number], string> = {
  h1: '#inicio h1',
  subtitle: '#inicio .hero-sub',
  cta: '#inicio a[data-cta="hero"]',
  description: '#inicio .hero-desc',
  clients: '#inicio .hero-clients',
};

const viewports = [
  // El relleno del hero en móvil es más compacto que el de las demás secciones (quick 260920-name-geo-hero-mobile):
  // 20 px arriba y 48 abajo bajo 40em, para que el CTA del hero entre en el primer pantallazo. #agenda conserva `sectionY`.
  { name: '1280 px', width: 1280, height: 800, sectionY: 96, heroTop: 64, heroBottom: 96 },
  { name: '390 px', width: 390, height: 844, sectionY: 64, heroTop: 20, heroBottom: 48 },
];

for (const vp of viewports) {
  test.describe(`hero y ritmo a ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test('un solo h1 con el texto del YAML y color morado', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1')).toHaveText(H1_TEXT);
      await expect(page.locator('h1')).toHaveCSS('color', PURPLE);
    });

    test('subtítulo y los tres párrafos de la descripción salen del YAML, en orden', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('#inicio .hero-sub')).toHaveText(SUBTITLE_TEXT);
      const paragraphs = page.locator('#inicio .hero-desc p');
      await expect(paragraphs).toHaveCount(3);
      expect(DESCRIPTION_TEXTS).toHaveLength(3);
      for (let i = 0; i < 3; i++) await expect(paragraphs.nth(i)).toHaveText(DESCRIPTION_TEXTS[i]);
    });

    // Cambio deliberado (quick 260920-hero-clients): con el CTA al final de los tres párrafos el CTA del hero ya
    // no cabe en el primer pantallazo móvil. Se exige h1 y subtítulo completos en él y el CTA del header visible
    // (mismo destino #agenda); el CTA del hero se exige visible, con #agenda y dentro del ancho.
    test('h1 y subtítulo caben en el primer pantallazo y el CTA del hero lleva #agenda (el del header solo desde 640 px)', async ({
      page,
    }) => {
      await page.goto('/');
      for (const selector of [HERO_SELECTORS.h1, HERO_SELECTORS.subtitle]) {
        const r = await box(page, selector);
        expect(r.top, selector).toBeGreaterThanOrEqual(0);
        expect(r.bottom, selector).toBeLessThanOrEqual(vp.height);
      }
      // El CTA del header se muestra desde 40em (SiteHeader.astro); en móvil no existe arriba (hallazgo de la tarea).
      const headerCta = page.locator('header a[data-cta="header"]');
      await expect(headerCta).toHaveAttribute('href', '#agenda');
      if (vp.width >= 640) {
        await expect(headerCta).toBeVisible();
        const h = await box(page, 'header a[data-cta="header"]');
        expect(h.top).toBeGreaterThanOrEqual(0);
        expect(h.bottom).toBeLessThanOrEqual(vp.height);
      } else {
        await expect(headerCta).toBeHidden();
      }
      const cta = page.locator('#inicio a[data-cta="hero"]');
      await expect(cta).toBeVisible();
      await expect(cta).toHaveAttribute('href', '#agenda');
      const r = await box(page, HERO_SELECTORS.cta);
      expect(r.left).toBeGreaterThanOrEqual(0);
      expect(r.right).toBeLessThanOrEqual(vp.width);
    });

    test('orden vertical del hero: h1, subtítulo, descripción, CTA, clientes', async ({ page }) => {
      await page.goto('/');
      const tops: number[] = [];
      for (const key of HERO_ORDER) tops.push((await box(page, HERO_SELECTORS[key])).top);
      const sorted = [...tops].sort((a, b) => a - b);
      expect(tops).toEqual(sorted);
    });

    test(`padding de #inicio (arriba ${vp.heroTop} px, abajo ${vp.heroBottom} px) y de #agenda (${vp.sectionY} px)`, async ({
      page,
    }) => {
      await page.goto('/');
      await expect(page.locator('#inicio')).toHaveCSS('padding-top', `${vp.heroTop}px`);
      await expect(page.locator('#inicio')).toHaveCSS('padding-bottom', `${vp.heroBottom}px`);
      await expect(page.locator('#agenda')).toHaveCSS('padding-top', `${vp.sectionY}px`);
      await expect(page.locator('#agenda')).toHaveCSS('padding-bottom', `${vp.sectionY}px`);
    });

    test('el h2 de #agenda sigue en blanco sobre el tono morado', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('#agenda-title')).toHaveCSS('color', 'rgb(255, 255, 255)');
    });
  });
}

// ---------------------------------------------------------------------------------------------
// Tarea 3: orden y tono de las secciones, jerarquía de encabezados, desborde a cinco anchos,
// primer pantallazo, collage del hero (accesible, liviano, sin movimiento), sin JavaScript y
// herramienta de capturas por lote.
// ---------------------------------------------------------------------------------------------

type Tone = 'light' | 'yellow' | 'dark' | 'purple';

// Orden canónico de las 12 secciones de `main` y su tono (UI-SPEC, Page Architecture). Cada plan
// de la fase 2 suma su sección en este orden; hoy la página trae solo una parte.
const PAGE_ORDER: ReadonlyArray<readonly [string, Tone]> = [
  ['inicio', 'light'],
  ['problema', 'dark'],
  ['por-que-ahora', 'yellow'],
  ['solucion', 'light'],
  ['resultados', 'dark'],
  ['casos', 'light'],
  ['nosotros', 'yellow'],
  ['incluye', 'light'],
  ['como-funciona', 'dark'],
  ['para-quien', 'light'],
  ['faq', 'yellow'],
  ['agenda', 'purple'],
];

// Título (h2) de cada sección, en el orden de la página: id de sección a ruta del claim en el YAML.
// `inicio` no aparece: su encabezado es el h1.
const H2_SOURCE: Readonly<Record<string, string>> = {
  problema: 'problem.title',
  'por-que-ahora': 'why_now.title',
  solucion: 'solution.title',
  resultados: 'results.title',
  casos: 'cases.title',
  nosotros: 'team.title',
  incluye: 'includes.title',
  'como-funciona': 'how_it_works.title',
  'para-quien': 'for_whom.title',
  faq: 'faq.title',
  agenda: 'agenda.title',
};
const yamlTree = (parse(readFileSync('src/content/landing.es.yaml', 'utf8')) as { es: Record<string, unknown> }).es;
const claimAt = (path: string): Claim => {
  const claim = path
    .split('.')
    .reduce<unknown>((node, key) => (node as Record<string, unknown> | undefined)?.[key], yamlTree) as
    | Claim
    | undefined;
  if (typeof claim?.text !== 'string') throw new Error(`H2_SOURCE: ${path} no es un claim con text en el YAML`);
  return claim;
};

test.describe('orden y tono de las secciones', () => {
  test('la constante PAGE_ORDER: 12 ids, ningún vecino repite tono y dark nunca toca purple', () => {
    expect(PAGE_ORDER).toHaveLength(12);
    expect(new Set(PAGE_ORDER.map(([id]) => id)).size).toBe(12);
    for (let i = 1; i < PAGE_ORDER.length; i++) {
      const [, prev] = PAGE_ORDER[i - 1];
      const [, cur] = PAGE_ORDER[i];
      expect(cur, `${PAGE_ORDER[i - 1][0]} y ${PAGE_ORDER[i][0]} repiten tono`).not.toBe(prev);
      expect(new Set([prev, cur]), 'dark junto a purple').not.toEqual(new Set(['dark', 'purple']));
    }
  });

  test('las main > section son exactamente las 12 de PAGE_ORDER, en orden y con su tono', async ({
    page,
  }) => {
    await page.goto('/');
    const sections = await page
      .locator('main > section')
      .evaluateAll((els) => els.map((el) => ({ id: el.id, tone: el.getAttribute('data-tone') })));
    expect(sections.map((s) => s.id)).toEqual(PAGE_ORDER.map(([id]) => id));
    expect(sections.map((s) => s.tone)).toEqual(PAGE_ORDER.map(([, tone]) => tone));
  });

  test('hay un solo h1, dentro de #inicio, y 11 h2 con los títulos del YAML en orden', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('#inicio h1')).toHaveCount(1);
    const h2 = await page.locator('h2').evaluateAll((els) => els.map((el) => el.textContent?.trim() ?? ''));
    expect(h2).toHaveLength(11);
    expect(h2).toEqual(Object.values(H2_SOURCE).map((path) => resolveText(claimAt(path))));
    // Cada h2 vive en la sección que su id de H2_SOURCE nombra.
    for (const id of Object.keys(H2_SOURCE)) await expect(page.locator(`main > section#${id} h2`)).toHaveCount(1);
  });
});

test.describe('encabezados', () => {
  test('un solo h1, ningún salto de nivel y cada sección con aria-labelledby a un encabezado existente', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveCount(1);
    const levels = await page
      .locator('h1, h2, h3, h4, h5, h6')
      .evaluateAll((els) => els.map((el) => Number(el.tagName.slice(1))));
    expect(levels[0]).toBe(1);
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i] - levels[i - 1], `salto de h${levels[i - 1]} a h${levels[i]}`).toBeLessThanOrEqual(1);
    }
    const links = await page.locator('main > section').evaluateAll((els) =>
      els.map((el) => {
        const id = el.getAttribute('aria-labelledby');
        const target = id ? document.getElementById(id) : null;
        return { section: el.id, id, isHeading: !!target && /^H[1-6]$/.test(target.tagName) };
      }),
    );
    for (const l of links) {
      expect(l.id, `${l.section} sin aria-labelledby`).toBeTruthy();
      expect(l.isHeading, `${l.section}: aria-labelledby no apunta a un encabezado`).toBe(true);
    }
  });
});

const WIDTHS = [
  { width: 320, height: 640 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1280, height: 800 },
] as const;

for (const vp of WIDTHS) {
  test.describe(`hero a ${vp.width} px`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test('sin scroll horizontal y ninguna sección fuera de [0, ancho]', async ({ page }) => {
      await page.goto('/');
      const m = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        sections: Array.from(document.querySelectorAll('main > section')).map((el) => {
          const r = el.getBoundingClientRect();
          return { id: el.id, left: r.left, right: r.right };
        }),
      }));
      expect(m.scrollWidth).toBeLessThanOrEqual(m.innerWidth);
      for (const s of m.sections) {
        expect(s.left, `${s.id} left`).toBeGreaterThanOrEqual(-0.5);
        expect(s.right, `${s.id} right`).toBeLessThanOrEqual(m.innerWidth + 0.5);
      }
    });

    test('.hero-art no se cruza con .hero-copy y el collage cabe en el ancho', async ({ page }) => {
      await page.goto('/');
      const copy = await box(page, '#inicio .hero-copy');
      const art = await box(page, '#inicio .hero-art');
      const overlapX = Math.min(copy.right, art.right) - Math.max(copy.left, art.left);
      const overlapY = Math.min(copy.bottom, art.bottom) - Math.max(copy.top, art.top);
      expect(overlapX > 0.5 && overlapY > 0.5, 'el collage y el texto se cruzan').toBe(false);
      const svg = await box(page, '.hero-collage');
      expect(svg.left).toBeGreaterThanOrEqual(-0.5);
      expect(svg.right).toBeLessThanOrEqual(vp.width + 0.5);
    });
  });
}

test.describe('primer pantallazo', () => {
  test.describe('390x844', () => {
    test.use({ viewport: { width: 390, height: 844 } });
    // El CTA del hero va al final de los párrafos (quick 260920-hero-clients) y el ritmo móvil compacto
    // (quick 260920-name-geo-hero-mobile) lo devuelve al primer pantallazo: entero, con su alto de 48 px.
    // El header oculta su CTA bajo 40em, así que arriba solo están h1, subtítulo y este CTA.
    test('el h1, el subtítulo y el CTA del hero quedan completos en el primer pantallazo', async ({ page }) => {
      await page.goto('/');
      for (const sel of [HERO_SELECTORS.h1, HERO_SELECTORS.subtitle, HERO_SELECTORS.cta]) {
        const r = await box(page, sel);
        expect(r.top, `${sel} top`).toBeGreaterThanOrEqual(0);
        expect(r.bottom, `${sel} bottom`).toBeLessThanOrEqual(844);
        expect(r.left).toBeGreaterThanOrEqual(0);
        expect(r.right).toBeLessThanOrEqual(390);
      }
    });
  });

  // Pliegue móvil fijado por la medida real (quick 260920-name-geo-hero-mobile): el CTA del hero, con h1, subtítulo y
  // los párrafos encima, cae entero dentro del primer pantallazo en estos teléfonos. 375x667 entra con margen
  // corto (el CTA baja hasta 657 px). En 360x640 y 320x568 sigue por debajo del pliegue: no se exige.
  for (const [width, height] of [[360, 740], [390, 844], [412, 915], [375, 667]] as const) {
    test.describe(`${width}x${height}: CTA del hero dentro del primer pantallazo`, () => {
      test.use({ viewport: { width, height } });
      test('el CTA entero queda dentro del alto del pantallazo, sin scroll, con 44 px de objetivo', async ({ page }) => {
        await page.goto('/');
        const r = await box(page, HERO_SELECTORS.cta);
        expect(r.top, 'top del CTA').toBeGreaterThanOrEqual(0);
        expect(r.bottom, 'bottom del CTA').toBeLessThanOrEqual(height);
        expect(r.bottom - r.top, 'alto del CTA').toBeGreaterThanOrEqual(44);
        expect(r.left).toBeGreaterThanOrEqual(0);
        expect(r.right).toBeLessThanOrEqual(width);
        expect(await page.evaluate(() => window.scrollY)).toBe(0);
        // Ritmo compacto sin romper A11Y.md: interlineado de los párrafos >= 1.5 y ancho máximo <= 80ch.
        const rhythm = await page.evaluate(() => {
          const p = document.querySelector('#inicio .hero-desc p') as HTMLElement;
          const cs = getComputedStyle(p);
          const probe = document.createElement('div');
          probe.style.cssText = 'position:absolute;visibility:hidden;width:80ch';
          p.appendChild(probe);
          const cap = probe.getBoundingClientRect().width;
          probe.remove();
          return { lh: parseFloat(cs.lineHeight) / parseFloat(cs.fontSize), maxW: parseFloat(cs.maxWidth), cap };
        });
        expect(rhythm.lh).toBeGreaterThanOrEqual(1.5);
        expect(rhythm.maxW).toBeLessThanOrEqual(rhythm.cap);
      });
    });
  }

  test.describe('1280x800', () => {
    test.use({ viewport: { width: 1280, height: 800 } });
    test('h1, subtítulo y el collage completos, con el collage a la derecha del texto', async ({
      page,
    }) => {
      await page.goto('/');
      for (const sel of [HERO_SELECTORS.h1, HERO_SELECTORS.subtitle, '.hero-collage']) {
        const r = await box(page, sel);
        expect(r.top, `${sel} top`).toBeGreaterThanOrEqual(0);
        expect(r.bottom, `${sel} bottom`).toBeLessThanOrEqual(800);
        expect(r.left).toBeGreaterThanOrEqual(0);
        expect(r.right).toBeLessThanOrEqual(1280);
      }
      const copy = await box(page, '#inicio .hero-copy');
      const svg = await box(page, '.hero-collage');
      expect(svg.left).toBeGreaterThanOrEqual(copy.right - 0.5);
    });

    test('el h1 mide 64 px, peso 700 y color morado', async ({ page }) => {
      await page.goto('/');
      const h1 = page.locator('#inicio h1');
      await expect(h1).toHaveCSS('font-size', '64px');
      await expect(h1).toHaveCSS('font-weight', '700');
      await expect(h1).toHaveCSS('color', PURPLE);
    });
  });
});

test.describe('collage del hero', () => {
  test('collage decorativo: raíz aria-hidden, capa svg sin title ni text, una sola img de foto con alt vacío y liviano', async ({ page }) => {
    await page.goto('/');
    const root = page.locator('div.hero-collage[data-collage="hero"]');
    await expect(root).toHaveCount(1);
    await expect(root).toHaveAttribute('aria-hidden', 'true');
    const svg = root.locator('svg');
    await expect(svg).toHaveCount(1);
    await expect(svg).toHaveAttribute('aria-hidden', 'true');
    await expect(svg).toHaveAttribute('focusable', 'false');
    await expect(svg.locator('title')).toHaveCount(0);
    await expect(svg.locator('text')).toHaveCount(0);
    await expect(page.locator('#inicio .hero-art img')).toHaveCount(1);
    await expect(root.locator('[data-photo-frame] img')).toHaveCount(1);
    await expect(root.locator('img')).toHaveCount(1);
    await expect(svg.locator('image')).toHaveCount(0);
    const size = await root.evaluate((el) => el.outerHTML.length);
    expect(size).toBeLessThan(8832);
  });

  test('seis grupos nombrados con --i, --r y --r-from y dos pupilas', async ({ page }) => {
    await page.goto('/');
    const pieces = await page
      .locator('.hero-collage [data-piece]')
      .evaluateAll((els) => els.map((el) => ({ name: el.getAttribute('data-piece') ?? '', style: el.getAttribute('style') ?? '' })));
    expect(pieces.map((p) => p.name).sort()).toEqual(['doodles', 'dots', 'loopy', 'panel', 'pills', 'stage']);
    for (const p of pieces) {
      expect(p.style).toMatch(/--i:\s*\d/);
      expect(p.style).toMatch(/--r:\s*-?\d/);
      expect(p.style).toMatch(/--r-from:\s*-?\d/);
    }
    const order = pieces.map((p) => Number(p.style.match(/--i:\s*(\d)/)?.[1])).sort();
    expect(order).toEqual([0, 1, 2, 3, 4, 5]);
    expect(await page.locator('.hero-collage .hc-pupil').count()).toBe(2);
    expect(await page.locator('.hero-collage [data-pupil]').count()).toBe(2);
  });
});

test(`el HTML de / pesa menos de ${HTML_RAW_MAX} bytes crudos y ${HTML_GZIP_MAX} con gzip`, async ({ page }) => {
  // Topes en tests/e2e/lib/budgets.mjs (única fuente, con su justificación).
  const res = await page.request.get('/');
  expect(res.ok()).toBe(true);
  const body = await res.body();
  expect(body.length).toBeLessThan(HTML_RAW_MAX);
  expect(gzipSync(body, { level: 9 }).length).toBeLessThan(HTML_GZIP_MAX);
});

for (const mode of ['reduce', 'no-preference'] as const) {
  test(`sin animaciones y con opacidad 1 en el hero (prefers-reduced-motion: ${mode})`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: mode });
    await page.goto('/');
    await page.waitForTimeout(400);
    if (mode === 'reduce') await expectNoMotion(page);
    else await expectMotionWithinBudget(page);
    for (const sel of [HERO_SELECTORS.h1, HERO_SELECTORS.subtitle, HERO_SELECTORS.cta]) {
      await expect(page.locator(sel).first()).toHaveCSS('opacity', '1');
    }
  });
}

test.describe('sin JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('el hero es visible y el CTA lleva #agenda', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#inicio h1')).toBeVisible();
    await expect(page.locator('#inicio .hero-sub')).toBeVisible();
    await expect(page.locator('#inicio a[data-cta="hero"]')).toBeVisible();
    await expect(page.locator('#inicio a[data-cta="hero"]')).toHaveAttribute('href', '#agenda');
    await expect(page.locator('.hero-collage')).toBeVisible();
  });
});

// Herramienta de capturas por lote. Solo corre con PHASE2_BATCH definida (p. ej. PHASE2_BATCH=A).
// Guarda test-results/phase2/<lote>-<ancho>[-reduce|-nojs].png a página completa, con todo lo que
// no es localhost abortado (ClickUp incluido).
test.describe('captura de lote', () => {
  test.skip(!process.env.PHASE2_BATCH, 'define PHASE2_BATCH (p. ej. A) para generar capturas');
  const variants = [
    { suffix: '', reducedMotion: 'no-preference' as const, javaScriptEnabled: true },
    { suffix: '-reduce', reducedMotion: 'reduce' as const, javaScriptEnabled: true },
    { suffix: '-nojs', reducedMotion: 'no-preference' as const, javaScriptEnabled: false },
  ];
  for (const vp of WIDTHS) {
    for (const v of variants) {
      test(`captura ${vp.width}${v.suffix}`, async ({ browser, baseURL }) => {
        const context = await browser.newContext({
          baseURL,
          viewport: { width: vp.width, height: vp.height },
          reducedMotion: v.reducedMotion,
          javaScriptEnabled: v.javaScriptEnabled,
        });
        await context.route('**/*', (route) => {
          const host = new URL(route.request().url()).hostname;
          return host === 'localhost' || host === '127.0.0.1' ? route.continue() : route.abort();
        });
        const page = await context.newPage();
        await page.goto('/');
        await page.screenshot({
          path: `test-results/phase2/${process.env.PHASE2_BATCH}-${vp.width}${v.suffix}.png`,
          fullPage: true,
        });
        await context.close();
      });
    }
  }
});

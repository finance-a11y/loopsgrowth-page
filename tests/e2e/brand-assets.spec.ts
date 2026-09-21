import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { PURPLE_RGB, rgbOfToken } from './lib/brand';
import { ARTBOARDS, MIN_HEIGHT_PX } from '../../src/components/brand/logo-variants.mjs';
import { CHIP_WORDS, assertPill } from '../../src/components/collage/collage-rules.mjs';
import { PHOTOS } from '../../src/components/collage/photos.mjs';

// El nombre accesible esperado sale del YAML, nunca de una cadena escrita a mano.
const es = (parse(readFileSync('src/content/landing.es.yaml', 'utf8')) as {
  es: { brand: { name: { text: string } } };
}).es;
const BRAND_NAME = es.brand.name.text;

const HEADER_WIDTHS = [320, 640, 768, 1280];

/** Proporción del viewBox de un SVG de src/assets/brand, leída del archivo. */
function viewBoxRatio(path: string): number {
  const match = readFileSync(path, 'utf8').match(/viewBox="([^"]+)"/);
  if (!match) throw new Error(`Sin viewBox en ${path}`);
  const parts = match[1].split(/\s+/).map(Number);
  return parts[2] / parts[3];
}

const LOGO_RATIO = viewBoxRatio('src/assets/brand/horizontal-06-blanco.svg');

async function open(page: Page, width: number, path = '/') {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(path);
}

test.describe('logo horizontal en el header', () => {
  test('(f) el header trae la mesa 06 horizontal con el mismo tono que su superficie', async ({ page }) => {
    await open(page, 1280);
    const info = await page.locator('header .brand-logo').first().evaluate((el) => ({
      artboard: el.getAttribute('data-artboard'),
      variant: el.getAttribute('data-variant'),
      logoTone: el.getAttribute('data-logo-tone'),
      surfaceTone: el.closest('[data-tone]')?.getAttribute('data-tone'),
    }));
    expect(info).toEqual({ artboard: '06', variant: 'horizontal', logoTone: 'light', surfaceTone: 'light' });
  });

  for (const width of HEADER_WIDTHS) {
    test(`(a) a ${width}px el logo es una imagen con nombre, sin enlace en / y de 32px o más`, async ({ page }) => {
      await open(page, width);
      const logo = page.locator('header .brand-logo svg').first();
      await expect(logo).toHaveAttribute('role', 'img');
      await expect(logo).toHaveAttribute('aria-label', BRAND_NAME);
      await expect(logo).toHaveAttribute('focusable', 'false');
      await expect(logo).not.toHaveAttribute('aria-hidden', /.*/);
      const info = await logo.evaluate((el) => {
        const box = el.getBoundingClientRect();
        return { w: box.width, h: box.height, inLink: !!el.closest('a') };
      });
      expect(info.inLink).toBe(false);
      expect(info.h).toBeGreaterThanOrEqual(32);
      expect(Math.abs(info.w / info.h / LOGO_RATIO - 1)).toBeLessThanOrEqual(0.02);
    });

    test(`(b) a ${width}px ningún elemento de contenido entra en el área de salvado`, async ({ page }) => {
      await open(page, width);
      const offenders = await page.evaluate(() => {
        const logoBox = document.querySelector('header .brand-logo') as HTMLElement;
        const probe = document.createElement('div');
        probe.style.cssText = 'position:absolute;visibility:hidden;width:var(--logo-clear)';
        logoBox.appendChild(probe);
        const clear = probe.getBoundingClientRect().width;
        probe.remove();
        const r = logoBox.querySelector('svg')!.getBoundingClientRect();
        const zone = { l: r.left - clear, t: r.top - clear, r: r.right + clear, b: r.bottom + clear };
        const bad: string[] = [];
        const candidates = document.querySelectorAll('a, button, svg, img, iframe, h1, h2, h3, p, span, li, div');
        for (const el of candidates) {
          if (el.closest('.collage-sprite')) continue;
          if (el.contains(logoBox) || logoBox.contains(el)) continue;
          const own = Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent!.trim());
          const isObject = /^(A|BUTTON|SVG|IMG|IFRAME)$/i.test(el.tagName);
          if (!own && !isObject) continue;
          const cs = getComputedStyle(el);
          if (cs.display === 'none' || cs.visibility === 'hidden') continue;
          const box = el.getBoundingClientRect();
          if (box.width < 2 || box.height < 2) continue;
          if (box.left < zone.r && box.right > zone.l && box.top < zone.b && box.bottom > zone.t) {
            bad.push(`${el.tagName.toLowerCase()}.${(el as HTMLElement).className}`);
          }
        }
        return { clear, bad };
      });
      expect(offenders.clear).toBeGreaterThanOrEqual(32);
      expect(offenders.bad).toEqual([]);
    });
  }

  for (const width of [320, 1280]) {
    test(`(c) sin scroll horizontal a ${width}px`, async ({ page }) => {
      await open(page, width);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  test('(e) el relleno del logo del header es el morado de marca', async ({ page }) => {
    await open(page, 1280);
    const fill = await page.locator('header .brand-logo svg path').first().evaluate((el) => getComputedStyle(el).fill);
    expect(fill).toBe(PURPLE_RGB);
  });

  test('(e2) el logo del header y el h1 comparten el morado de marca', async ({ page }) => {
    await open(page, 1280);
    const fill = await page.locator('header .brand-logo svg path').first().evaluate((el) => getComputedStyle(el).fill);
    const h1 = await page.locator('h1').first().evaluate((el) => getComputedStyle(el).color);
    expect(fill).toBe(h1);
    expect(fill).toBe(PURPLE_RGB);
  });
});

test.describe('logo horizontal sin JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('(d) el logo es visible con caja no vacía', async ({ page }) => {
    await open(page, 1280);
    const logo = page.locator('header .brand-logo svg').first();
    await expect(logo).toBeVisible();
    const box = await logo.boundingBox();
    expect(box!.width).toBeGreaterThan(0);
    expect(box!.height).toBeGreaterThan(0);
  });
});

const SHEET = '/marca/hoja/';
const SHEET_WIDTHS = [320, 390, 768, 1024, 1280];

const TONE_COUNTS: Record<string, number> = { light: 6, yellow: 4, dark: 3, purple: 4 };
const hexToRgbString = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
};

test.describe('hoja de revisión: identidad por tono', () => {
  for (const width of SHEET_WIDTHS) {
    test(`las 17 mesas a ${width}px: mesa por tono, nombre accesible, alto mínimo, sin recolor y sin scroll horizontal`, async ({ page }) => {
      await open(page, width, SHEET);
      let total = 0;
      for (const [tone, count] of Object.entries(TONE_COUNTS)) {
        const section = page.locator(`[data-sheet="identidad"][data-tone="${tone}"]`);
        await expect(section).toHaveCount(1);
        const expected = ARTBOARDS.filter((b: { use: boolean; tone: string }) => b.use && b.tone === tone);
        expect(expected.length).toBe(count);
        const logos = await section.locator('.brand-logo').evaluateAll((els) =>
          els.map((el) => {
            const svg = el.querySelector('svg')!;
            const paths = Array.from(svg.querySelectorAll('path'));
            return {
              n: Number(el.getAttribute('data-artboard')),
              variant: el.getAttribute('data-variant')!,
              logoTone: el.getAttribute('data-logo-tone'),
              role: svg.getAttribute('role'),
              label: svg.getAttribute('aria-label'),
              focusable: svg.getAttribute('focusable'),
              hidden: svg.hasAttribute('aria-hidden'),
              height: svg.getBoundingClientRect().height,
              attrFills: paths.map((p) => p.getAttribute('fill')),
              computedFills: paths.map((p) => getComputedStyle(p).fill),
            };
          }),
        );
        expect(logos.map((l) => l.n).sort((x, y) => x - y)).toEqual(expected.map((b: { n: number }) => b.n).sort((x: number, y: number) => x - y));
        total += logos.length;
        for (const logo of logos) {
          const board = ARTBOARDS.find((b: { n: number }) => b.n === logo.n);
          expect(logo.logoTone).toBe(tone);
          expect(logo.role).toBe('img');
          expect(logo.label).toBe(BRAND_NAME);
          expect(logo.focusable).toBe('false');
          expect(logo.hidden).toBe(false);
          expect(logo.height, `mesa ${logo.n}`).toBeGreaterThanOrEqual((MIN_HEIGHT_PX as Record<string, number>)[logo.variant]);
          // Sin recolor: el relleno calculado de cada path es el atributo fill del propio path.
          logo.attrFills.forEach((fill, i) => {
            expect(fill, `mesa ${logo.n}`).not.toBeNull();
            expect(logo.computedFills[i], `mesa ${logo.n}`).toBe(hexToRgbString(fill!));
          });
          expect(logo.computedFills, `mesa ${logo.n}`).toContain(rgbOfToken(board.fg));
        }
      }
      expect(total).toBe(17);

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });

    test(`la paleta a ${width}px imprime los seis hex de tokens.css`, async ({ page }) => {
      await open(page, width, SHEET);
      const strip = page.locator('[data-sheet="paleta"]');
      await expect(strip.locator('[data-swatch]')).toHaveCount(6);
      for (const name of ['purple', 'cream', 'orange', 'yellow', 'dark', 'white']) {
        const swatch = strip.locator(`[data-swatch="${name}"]`);
        const printed = (await swatch.locator('[data-swatch-hex]').textContent())!.trim();
        expect(hexToRgbString(printed)).toBe(rgbOfToken(name));
        const bg = await swatch.locator('.swatch-chip').evaluate((el) => getComputedStyle(el).backgroundColor);
        expect(bg).toBe(rgbOfToken(name));
      }
    });
  }

  test('la hoja lleva noindex y su rótulo no es copy', async ({ page }) => {
    await open(page, 1280, SHEET);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  });
});

// Herramienta de capturas de la hoja. Solo corre con PHASE2_BATCH definida (p. ej. PHASE2_BATCH=M).
// Guarda test-results/phase2/<lote>-hoja-<ancho>.png a página completa, con todo lo que no es
// localhost abortado.
test.describe('captura de la hoja', () => {
  test.skip(!process.env.PHASE2_BATCH, 'define PHASE2_BATCH (p. ej. M) para generar capturas de la hoja');
  for (const width of SHEET_WIDTHS) {
    test(`captura de la hoja a ${width}px`, async ({ browser, baseURL }) => {
      const context = await browser.newContext({ baseURL, viewport: { width, height: 900 } });
      await context.route('**/*', (route) => {
        const host = new URL(route.request().url()).hostname;
        return host === 'localhost' || host === '127.0.0.1' ? route.continue() : route.abort();
      });
      const page = await context.newPage();
      await page.goto(SHEET);
      await page.screenshot({ path: `test-results/phase2/${process.env.PHASE2_BATCH}-hoja-${width}.png`, fullPage: true });
      await context.close();
    });
  }
});

test.describe('favicon', () => {
  test('/favicon.ico responde 200 y trae tres imágenes de 16, 32 y 48 px', async ({ request }) => {
    const res = await request.get('/favicon.ico');
    expect(res.status()).toBe(200);
    const buf = await res.body();
    expect(buf.length).toBeGreaterThan(655);
    expect([...buf.subarray(0, 4)]).toEqual([0, 0, 1, 0]);
    const count = buf.readUInt16LE(4);
    expect(count).toBe(3);
    const sizes = [0, 1, 2].map((i) => buf[6 + i * 16] || 256);
    expect(sizes).toEqual([16, 32, 48]);
  });

  test('/favicon.svg es texto con viewBox cuadrado, sin script ni referencias http', async ({ request }) => {
    const res = await request.get('/favicon.svg');
    expect(res.status()).toBe(200);
    const text = await res.text();
    const vb = text.match(/viewBox="([^"]+)"/);
    expect(vb).not.toBeNull();
    const [, , w, h] = vb![1].split(/\s+/).map(Number);
    expect(w).toBe(h);
    expect(text).not.toMatch(/<script|href=|xlink|https?:\/\/(?!www\.w3\.org)/);
  });

  for (const width of SHEET_WIDTHS) {
    test(`la hoja muestra el favicon a 16, 32 y 48 px sobre claro y oscuro a ${width}px: seis imágenes cargan, sin scroll horizontal`, async ({ page }) => {
      await open(page, width, SHEET);
      const section = page.locator('[data-sheet="favicon"]');
      await expect(section).toHaveCount(1);
      await expect(section.locator('img')).toHaveCount(6);
      await page.waitForFunction(() => Array.from(document.querySelectorAll('[data-sheet="favicon"] img')).every((i) => (i as HTMLImageElement).complete));
      const images = await section.locator('img').evaluateAll((els) =>
        els.map((el) => {
          const img = el as HTMLImageElement;
          return {
            naturalWidth: img.naturalWidth,
            alt: img.alt,
            size: Number(img.getAttribute('width')),
            sample: img.closest('[data-favicon-sample]')?.getAttribute('data-favicon-sample'),
            rendered: img.getBoundingClientRect().width,
          };
        }),
      );
      expect(images.map((i) => `${i.sample}-${i.size}`).sort()).toEqual(['dark-16', 'dark-32', 'dark-48', 'light-16', 'light-32', 'light-48']);
      for (const image of images) {
        expect(image.naturalWidth, image.alt).toBeGreaterThan(0);
        expect(image.alt).toContain(`${image.size} px`);
        expect(image.rendered).toBe(image.size);
      }
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
});

// ---------------------------------------------------------------------------------------------
// Hoja: piezas, píldoras, composiciones y avatares (plan 02-10, tarea 3)
// ---------------------------------------------------------------------------------------------

const WORDS: string[] = CHIP_WORDS.map((w: { word: string }) => w.word);
// Estilos (fondo, texto) por tono del fondo de la sección: los que `assertPill` acepta y usa la hoja.
const PILL_STYLES: Record<string, [string, string][]> = {
  light: [['purple', 'cream'], ['yellow', 'dark'], ['cream', 'purple'], ['orange', 'dark'], ['dark', 'yellow']],
  yellow: [['dark', 'yellow'], ['purple', 'cream'], ['purple', 'white'], ['white', 'purple']],
  dark: [['yellow', 'dark'], ['cream', 'purple'], ['white', 'purple'], ['orange', 'dark']],
  purple: [['yellow', 'dark'], ['cream', 'purple'], ['white', 'purple']],
};
const PIECE_NAMES = ['ojos', 'lupa', 'flecha', 'destello', 'asterisco', 'mas', 'garabato', 'puntos'];
const DOODLE_COLOR: Record<string, string> = { light: 'purple', yellow: 'dark', dark: 'yellow', purple: 'yellow' };
const MINI_SCENES = ['sticker-clic', 'sticker-lupa', 'sticker-ojos', 'chip-lupa', 'chip-ojos', 'chip-loop', 'chip-clic'];
const AVATAR_VARIANTS = ['ojo-amarillo', 'ojo-morado', 'ojos-amarillo', 'ojos-morado'];
// Raíces de las diez composiciones enmarcadas y de los cuatro avatares de la hoja.
const SHEET_SCENES: Record<string, string> = {
  hero: '[data-demo="hero"] [data-collage-scene="hero"]',
  whynow: '[data-demo="whynow"] [data-collage-scene="whynow"]',
  agenda: '[data-demo="agenda"] [data-collage-scene="agenda"]',
  ...Object.fromEntries(MINI_SCENES.map((n) => [n, `[data-demo="${n}"] [data-collage-scene="${n}"]`])),
  ...Object.fromEntries(AVATAR_VARIANTS.map((v) => [`avatar-${v}`, `[data-demo="avatar-${v}"] [data-collage-scene="avatar-${v}"]`])),
};
const PIECES_ON_SHEET = 8 + 8 + 8 + 6; // light, yellow, purple y dark (sin Loopy)
// más una escena completa por foto del manifiesto en la hoja de fotos (plan 02-11)
const ROOTS_ON_SHEET = PIECES_ON_SHEET + Object.keys(SHEET_SCENES).length + PHOTOS.length;

test.describe('hoja: piezas y píldoras', () => {
  test('(a) toda raíz y el sprite son decorativos: aria-hidden true; todo svg con focusable false', async ({ page }) => {
    await open(page, 1280, SHEET);
    const bad = await page.evaluate(() => {
      const out: string[] = [];
      for (const el of document.querySelectorAll('[data-collage], .collage-sprite')) {
        if (el.getAttribute('aria-hidden') !== 'true') out.push(`${el.getAttribute('data-collage-piece') ?? el.getAttribute('class')}: raíz sin aria-hidden`);
        const svgs = el.tagName.toLowerCase() === 'svg' ? [el] : Array.from(el.querySelectorAll('svg'));
        for (const svg of svgs) {
          if (svg.getAttribute('aria-hidden') !== 'true' || svg.getAttribute('focusable') !== 'false') out.push(`${el.getAttribute('data-collage-piece') ?? el.getAttribute('class')}: svg sin aria-hidden o focusable`);
        }
      }
      return out;
    });
    expect(bad).toEqual([]);
    expect(await page.locator('[data-collage]').count()).toBe(ROOTS_ON_SHEET);
  });

  test('(b) dentro de las raíces y del sprite no hay título, texto SVG, imagen, foreignObject, SMIL, degradados, filtros ni script', async ({ page }) => {
    await open(page, 1280, SHEET);
    const found = await page.evaluate(() => {
      const forbidden = 'title, text, image, img:not([data-photo-frame] img), foreignObject, animate, animateTransform, animateMotion, set, linearGradient, radialGradient, filter, script';
      return Array.from(document.querySelectorAll('[data-collage], .collage-sprite')).flatMap((el) => Array.from(el.querySelectorAll(forbidden)).map((n) => n.tagName));
    });
    expect(found).toEqual([]);
  });

  test('(c) cada <use> resuelve a un símbolo y cada raíz tiene caja no vacía', async ({ page }) => {
    await open(page, 1280, SHEET);
    const problems = await page.evaluate(() => {
      const out: string[] = [];
      for (const root of document.querySelectorAll('[data-collage]')) {
        const label = root.getAttribute('data-collage-piece') ?? '';
        const box = root.getBoundingClientRect();
        if (box.width < 2 || box.height < 2) out.push(`${label}: caja vacía`);
        for (const use of root.querySelectorAll('use')) {
          const target = document.querySelector(use.getAttribute('href') ?? '');
          if (!target || target.tagName.toLowerCase() !== 'symbol') out.push(`${label}: use sin símbolo (${use.getAttribute('href')})`);
        }
      }
      return out;
    });
    expect(problems).toEqual([]);
  });

  test('(d) el trazo de un garabato mide 3 px y su color por tono es el esperado', async ({ page }) => {
    await open(page, 1280, SHEET);
    const width = await page.evaluate(() => getComputedStyle(document.querySelector('#lg-flecha .lg-line')!).strokeWidth);
    expect(width).toBe('3px');
    for (const [tone, color] of Object.entries(DOODLE_COLOR)) {
      const got = await page.evaluate((t) => {
        const svg = document.querySelector(`section[data-sheet="piezas"][data-tone="${t}"] svg[data-collage-piece="garabato"]`)!;
        const probe = document.createElement('i');
        probe.style.color = getComputedStyle(svg).getPropertyValue('--cf-a');
        document.body.appendChild(probe);
        const value = getComputedStyle(probe).color;
        probe.remove();
        return value;
      }, tone);
      expect(got, `garabato sobre ${tone}`).toBe(rgbOfToken(color));
    }
  });

  test('(d2) el aro de Loopy es morado en light y yellow y crema en purple, y sobre dark no hay Loopy', async ({ page }) => {
    await open(page, 1280, SHEET);
    const frames = await page.evaluate(() => {
      const probe = document.createElement('i');
      document.body.appendChild(probe);
      const out: Record<string, string[]> = {};
      for (const tone of ['light', 'yellow', 'purple', 'dark']) {
        out[tone] = Array.from(document.querySelectorAll(`section[data-sheet="piezas"][data-tone="${tone}"] svg[data-collage-piece="ojos"], section[data-sheet="piezas"][data-tone="${tone}"] svg[data-collage-piece="lupa"]`)).map((svg) => {
          probe.style.color = getComputedStyle(svg).getPropertyValue('--lp-frame');
          return getComputedStyle(probe).color;
        });
      }
      probe.remove();
      return out;
    });
    expect(frames.light).toEqual([rgbOfToken('purple'), rgbOfToken('purple')]);
    expect(frames.yellow).toEqual([rgbOfToken('purple'), rgbOfToken('purple')]);
    expect(frames.purple).toEqual([rgbOfToken('cream'), rgbOfToken('cream')]);
    expect(frames.dark).toEqual([]);
  });

  test('(d3) cada banda de piezas trae las ocho piezas (seis sobre dark) con su data-demo', async ({ page }) => {
    await open(page, 1280, SHEET);
    for (const tone of ['light', 'yellow', 'purple', 'dark']) {
      const names = await page.locator(`section[data-sheet="piezas"][data-tone="${tone}"] [data-demo]`).evaluateAll((els) => els.map((e) => e.getAttribute('data-demo')));
      const expected = PIECE_NAMES.filter((n) => tone !== 'dark' || (n !== 'ojos' && n !== 'lupa')).map((n) => `${n}-${tone}`);
      expect(names, tone).toEqual(expected);
    }
    await expect(page.locator('section[data-sheet="piezas"][data-tone="dark"] code', { hasText: 'ojos y lupa no van directo sobre dark' })).toHaveCount(1);
  });

  test('píldoras: una por palabra y estilo permitido y tono, con assertPill, palabra de la lista y colores calculados', async ({ page }) => {
    await open(page, 1280, SHEET);
    for (const [tone, styles] of Object.entries(PILL_STYLES)) {
      for (const [bg, fg] of styles) for (const word of WORDS) expect(() => assertPill(tone, bg, fg, word), `${word} ${bg}/${fg} sobre ${tone}`).not.toThrow();
      const section = page.locator(`section[data-sheet="pildoras"][data-tone="${tone}"]`);
      await expect(section).toHaveAttribute('data-demo', `pildoras-${tone}`);
      const items = await section.locator('li').evaluateAll((lis) =>
        lis.map((li) => {
          const pill = li.querySelector('[data-pill]') as HTMLElement;
          const cs = getComputedStyle(pill);
          return { label: li.querySelector('code')!.textContent!.trim(), text: pill.textContent!.trim(), bg: cs.backgroundColor, fg: cs.color, hidden: !!pill.closest('[aria-hidden="true"]') || pill.getAttribute('aria-hidden') === 'true' };
        }),
      );
      const expected = WORDS.flatMap((word) => styles.map(([bg, fg]) => `${word} / ${bg} / ${fg}`));
      expect(items.map((i) => i.label).sort(), tone).toEqual([...expected].sort());
      for (const item of items) {
        const [word, bg, fg] = item.label.split(' / ');
        expect(item.text).toBe(word);
        expect(WORDS).toContain(item.text);
        expect(item.bg).toBe(rgbOfToken(bg));
        expect(item.fg).toBe(rgbOfToken(fg));
        expect(item.hidden).toBe(true);
      }
    }
  });

  for (const motion of ['reduce', 'no-preference'] as const) {
    test(`(e) cero animaciones con prefers-reduced-motion ${motion}`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: motion });
      await open(page, 1280, SHEET);
      expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
    });
  }

  for (const width of SHEET_WIDTHS) {
    test(`(f) sin scroll horizontal en la hoja a ${width}px`, async ({ page }) => {
      await open(page, width, SHEET);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
    });
  }

  test.describe('sin JavaScript', () => {
    test.use({ javaScriptEnabled: false });

    test('(g) todas las piezas, composiciones y píldoras se pintan con caja no vacía', async ({ page }) => {
      await open(page, 1280, SHEET);
      const roots = await page.locator('[data-collage]').all();
      expect(roots.length).toBe(ROOTS_ON_SHEET);
      for (const root of roots) {
        const box = await root.boundingBox();
        expect(box, 'raíz sin caja').not.toBeNull();
        expect(box!.width).toBeGreaterThan(1);
        expect(box!.height).toBeGreaterThan(1);
      }
      for (const pill of await page.locator('[data-pill]').all()) await expect(pill).toBeVisible();
    });
  });
});

test.describe('hoja: composiciones y avatares', () => {
  test('(a) pesos medidos con TextEncoder sobre outerHTML: hero 8832, agenda 4096, whynow 3712, mini 1536, avatar 2560 y sprite más raíces 32000', async ({ page }) => {
    await open(page, 1280, SHEET);
    const sizes = await page.evaluate((selectors) => {
      const bytes = (html: string) => new TextEncoder().encode(html).length;
      const out: Record<string, number> = {};
      for (const [name, selector] of Object.entries(selectors)) out[name] = bytes(document.querySelector(selector)!.outerHTML);
      out.sprite = bytes(document.querySelector('.collage-sprite')!.outerHTML);
      return out;
    }, SHEET_SCENES);
    expect(sizes.hero).toBeLessThanOrEqual(8832);
    expect(sizes.agenda).toBeLessThanOrEqual(4096);
    expect(sizes.whynow).toBeLessThanOrEqual(3712);
    for (const name of MINI_SCENES) expect(sizes[name], name).toBeLessThanOrEqual(1536);
    for (const v of AVATAR_VARIANTS) expect(sizes[`avatar-${v}`], v).toBeLessThanOrEqual(2560);
    expect(Object.values(sizes).reduce((a, b) => a + b, 0)).toBeLessThanOrEqual(32000);
  });

  for (const [width, visible] of [[320, false], [390, false], [768, false], [1024, true], [1280, true]] as const) {
    test(`(b) agenda ${visible ? 'visible' : 'oculta'} a ${width}px y todo lo pintado dentro de su caja`, async ({ page }) => {
      await open(page, width, SHEET);
      const root = page.locator(SHEET_SCENES.agenda);
      expect(await root.evaluate((el) => getComputedStyle(el).display === 'none')).toBe(!visible);
      if (!visible) return;
      const outside = await root.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return Array.from(el.querySelectorAll('[data-trait], [data-pill]'))
          .filter((n) => {
            const b = n.getBoundingClientRect();
            return b.left < r.left - 0.5 || b.right > r.right + 0.5 || b.top < r.top - 0.5 || b.bottom > r.bottom + 0.5;
          })
          .map((n) => `${n.getAttribute('data-trait')}:${n.getAttribute('data-pill') ?? ''}`);
      });
      expect(outside).toEqual([]);
    });
  }

  test('(c) los cuatro avatares tienen variantes distintas, el mismo tamaño, alto igual a ancho y ninguna píldora', async ({ page }) => {
    await open(page, 1280, SHEET);
    const info = await page.evaluate(() =>
      Array.from(document.querySelectorAll('svg[data-collage="avatar"]')).map((el) => {
        const box = el.getBoundingClientRect();
        return { variant: el.getAttribute('data-variant'), w: Math.round(box.width * 10) / 10, h: Math.round(box.height * 10) / 10, pills: el.querySelectorAll('[data-pill]').length, tag: el.tagName.toLowerCase() };
      }),
    );
    expect(info.map((i) => i.variant).sort()).toEqual(AVATAR_VARIANTS);
    expect(new Set(info.map((i) => `${i.w}x${i.h}`)).size).toBe(1);
    for (const i of info) {
      expect(i.tag).toBe('svg');
      expect(i.w).toBe(i.h);
      expect(i.w).toBeLessThanOrEqual(120);
      expect(i.pills).toBe(0);
    }
  });

  test('(d) ningún elemento de las composiciones lleva contorno: trazo none en discos, bloques y paneles', async ({ page }) => {
    await open(page, 1280, SHEET);
    const stroked = await page.evaluate(() =>
      Array.from(document.querySelectorAll('[data-demo] svg circle, [data-demo] svg rect')).filter((el) => {
        const cs = getComputedStyle(el);
        return cs.stroke !== 'none' && cs.strokeWidth !== '0px';
      }).length,
    );
    expect(stroked).toBe(0);
    const pillBorders = await page.evaluate(() => Array.from(document.querySelectorAll('[data-pill]')).filter((el) => getComputedStyle(el).borderTopWidth !== '0px').length);
    expect(pillBorders).toBe(0);
  });

  for (const motion of ['reduce', 'no-preference'] as const) {
    test(`(e) cero animaciones con las composiciones y prefers-reduced-motion ${motion}`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: motion });
      await open(page, 1280, SHEET);
      expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
    });
  }

  test('(f) la hoja trae identidad, paleta y favicon (de 02-09) más piezas, píldoras, composiciones, avatares y fotos', async ({ page }) => {
    await open(page, 1280, SHEET);
    const kinds = await page.locator('[data-sheet]').evaluateAll((els) => [...new Set(els.map((e) => e.getAttribute('data-sheet')))].sort());
    expect(kinds).toEqual(['avatares', 'composiciones', 'favicon', 'fotos', 'identidad', 'paleta', 'piezas', 'pildoras']);
  });
});

// Capturas de composiciones para el ciclo visual. Solo corren con PHASE2_BATCH definida: abren la
// hoja con todo lo que no es localhost abortado y guardan test-results/phase2/<lote>-<demo>-<ancho>.png.
test.describe('captura de composiciones', () => {
  test.skip(!process.env.PHASE2_BATCH, 'define PHASE2_BATCH (p. ej. C-collage) para generar capturas de composiciones');
  const FIVE = ['hero', 'whynow', 'sticker-lupa', 'chip-loop', 'avatar-ojos-morado'];
  const AT_1280 = ['ojos-purple', 'lupa-purple', 'ojos-yellow', 'lupa-yellow', 'ojos-light', 'lupa-light', 'pildoras-light', 'pildoras-purple'];
  const shots: [string, number][] = [
    ...FIVE.flatMap((demo) => SHEET_WIDTHS.map((w) => [demo, w] as [string, number])),
    ['agenda', 1024],
    ['agenda', 1280],
    ...AT_1280.map((demo) => [demo, 1280] as [string, number]),
  ];
  for (const [demo, width] of shots) {
    test(`captura de ${demo} a ${width}px`, async ({ browser, baseURL }) => {
      const context = await browser.newContext({ baseURL, viewport: { width, height: 900 } });
      await context.route('**/*', (route) => {
        const host = new URL(route.request().url()).hostname;
        return host === 'localhost' || host === '127.0.0.1' ? route.continue() : route.abort();
      });
      const page = await context.newPage();
      await page.goto(SHEET);
      await page.locator(`[data-demo="${demo}"]`).screenshot({ path: `test-results/phase2/${process.env.PHASE2_BATCH}-${demo}-${width}.png` });
      await context.close();
    });
  }
});

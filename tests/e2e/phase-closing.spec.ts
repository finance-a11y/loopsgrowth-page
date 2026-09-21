import { test, expect, type Browser, type BrowserContext } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readdirSync, readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { parse } from 'yaml';
import { HTML_GZIP_MAX, HTML_RAW_MAX } from './lib/budgets.mjs';

// Cierre de la fase 2 (plan 02-07). 02-08 extiende este archivo. El texto esperado del CTA sale
// del YAML: nunca una cadena escrita a mano (COPY-01).
type Claim = { text: string };
const es = (parse(readFileSync('src/content/landing.es.yaml', 'utf8')) as {
  es: { call: { duration: Claim }; cta: { label_template: Claim } };
}).es;
const CTA_LABEL = es.cta.label_template.text.replaceAll('{duration}', es.call.duration.text);

test.describe('conexiones de fase', () => {
  for (const path of ['/', '/privacidad/']) {
    test.describe(`en ${path}`, () => {
      test('dos enlaces de favicon y cada archivo responde 200 con su tipo y cuerpo', async ({ page }) => {
        await page.goto(path);
        const icons = await page
          .locator('head link[rel="icon"]')
          .evaluateAll((els) => els.map((el) => ({ href: el.getAttribute('href') ?? '', type: el.getAttribute('type') })));
        expect(icons.map((i) => i.href).sort()).toEqual(['/favicon.ico', '/favicon.svg']);
        expect(icons.find((i) => i.href === '/favicon.svg')?.type).toBe('image/svg+xml');
        for (const { href } of icons) {
          const res = await page.request.get(href);
          expect(res.status(), href).toBe(200);
          const contentType = res.headers()['content-type'] ?? '';
          if (href.endsWith('.svg')) expect(contentType, href).toContain('image/svg+xml');
          else expect(contentType, href).toMatch(/image\/(x-icon|vnd\.microsoft\.icon)/);
          expect((await res.body()).length, `${href} vacío`).toBeGreaterThan(0);
        }
      });

      test('un solo sprite y todo use con href a un id del mismo documento se resuelve', async ({ page }) => {
        await page.goto(path);
        await expect(page.locator('svg.collage-sprite')).toHaveCount(1);
        const ids = await page.locator('svg.collage-sprite symbol').evaluateAll((els) => els.map((el) => el.id));
        expect(ids).toHaveLength(8);
        expect(ids.every((id) => id.startsWith('lg-'))).toBe(true);
        const refs = await page
          .locator('use[href^="#"]')
          .evaluateAll((els) => els.map((el) => (el.getAttribute('href') ?? '').slice(1)));
        const missing = await page.evaluate(
          (targets) => targets.filter((id) => !document.getElementById(id)),
          refs,
        );
        expect(missing, `use sin destino: ${missing.join(', ')}`).toEqual([]);
      });
    });
  }

  test('en / hay 1 collage del hero, 1 de #agenda y 1 avatar (los otros 3 integrantes llevan foto)', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-collage="hero"]')).toHaveCount(1);
    await expect(page.locator('div[data-collage="hero"]')).toHaveCount(1);
    await expect(page.locator('[data-collage="agenda"]')).toHaveCount(1);
    await expect(page.locator('#agenda div[data-collage="agenda"]')).toHaveCount(1);
    await expect(page.locator('svg[data-collage="avatar"]')).toHaveCount(1);
  });

  test('en / hay 4 CTA a #agenda con el texto del YAML como nombre accesible', async ({ page }) => {
    await page.goto('/');
    const ctas = page.locator('a[data-cta]');
    await expect(ctas).toHaveCount(4);
    for (let i = 0; i < 4; i++) {
      const cta = ctas.nth(i);
      await expect(cta).toHaveAttribute('href', '#agenda');
      await expect(cta).toHaveText(CTA_LABEL);
      await expect(cta).not.toHaveAttribute('aria-label', /.*/);
    }
  });
});

// ---------------------------------------------------------------------------------------------
// Cierre de la fase 2 (plan 02-08). Solo mide; la compuerta completa de accesibilidad es de la fase 3.
// ---------------------------------------------------------------------------------------------

// Contexto con todo lo que no es localhost abortado (ClickUp incluido): la página completa sin formulario.
async function isolatedContext(
  browser: Browser,
  baseURL: string | undefined,
  width: number,
  height: number,
  opts: { reducedMotion?: 'reduce' | 'no-preference'; javaScriptEnabled?: boolean } = {},
): Promise<BrowserContext> {
  const context = await browser.newContext({
    baseURL,
    viewport: { width, height },
    reducedMotion: opts.reducedMotion ?? 'no-preference',
    javaScriptEnabled: opts.javaScriptEnabled ?? true,
  });
  await context.route('**/*', (route) => {
    const host = new URL(route.request().url()).hostname;
    return host === 'localhost' || host === '127.0.0.1' ? route.continue() : route.abort();
  });
  return context;
}

const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

test.describe('axe de humo', () => {
  for (const path of ['/', '/privacidad/']) {
    for (const [width, height] of [
      [320, 640],
      [390, 844],
      [1280, 800],
    ] as const) {
      test(`${path} a ${width} px: cero violaciones critical o serious`, async ({ browser, baseURL }, testInfo) => {
        const context = await isolatedContext(browser, baseURL, width, height);
        const page = await context.newPage();
        await page.goto(path);
        const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).exclude('iframe').analyze();
        const blocking = results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
        for (const v of results.violations.filter((x) => x.impact !== 'critical' && x.impact !== 'serious')) {
          testInfo.annotations.push({ type: `axe ${v.impact}`, description: `${path} ${width}px ${v.id} (${v.nodes.length} nodos)` });
        }
        testInfo.annotations.push({
          type: 'axe conteo',
          description: `${path} ${width}px: ${results.violations.length} violaciones, ${blocking.length} critical o serious`,
        });
        await context.close();
        expect(
          blocking.map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`),
        ).toEqual([]);
      });
    }
  }
});

// Hoja de contacto: recortes de header, de cada sección de main y de footer a 1280 y 390 px y dos hojas
// (1280 en 3 columnas, 390 en 6). Solo corre con PHASE2_BATCH; las capturas nunca se versionan.
test.describe('hoja de contacto', () => {
  test.skip(!process.env.PHASE2_BATCH, 'define PHASE2_BATCH (p. ej. CIERRE1) para generar la hoja de contacto');
  const batch = process.env.PHASE2_BATCH ?? '';
  for (const [width, height, cols] of [
    [1280, 800, 3],
    [390, 844, 6],
  ] as const) {
    test(`hoja de contacto a ${width} px`, async ({ browser, baseURL }) => {
      const context = await isolatedContext(browser, baseURL, width, height);
      const page = await context.newPage();
      await page.goto('/');
      const ids = await page.locator('main > section').evaluateAll((els) => els.map((el) => el.id));
      const targets: Array<[string, string]> = [
        ['header', 'body > header'],
        ...ids.map((id): [string, string] => [id, `main > section#${id}`]),
        ['footer', 'body > footer'],
      ];
      expect(targets).toHaveLength(14);
      const shots: Array<{ id: string; b64: string }> = [];
      for (const [id, sel] of targets) {
        const el = page.locator(sel).first();
        await el.scrollIntoViewIfNeeded();
        const buf = await el.screenshot({ path: `test-results/phase2/${batch}-${id}-${width}.png` });
        expect(buf.length, `${id} vacío`).toBeGreaterThan(0);
        shots.push({ id, b64: buf.toString('base64') });
      }
      const sheet = await context.newPage();
      await sheet.setViewportSize({ width: cols === 3 ? 1800 : 2400, height: 1000 });
      await sheet.setContent(
        `<body style="margin:0;background:#888"><div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:8px;padding:8px;align-items:start">${shots
          .map(
            (s) =>
              `<figure style="margin:0;background:#fff"><figcaption style="font:12px monospace;padding:2px 4px">${s.id}</figcaption><img style="width:100%;display:block" src="data:image/png;base64,${s.b64}"></figure>`,
          )
          .join('')}</div></body>`,
      );
      await sheet.screenshot({ path: `test-results/phase2/${batch}-hoja-${width}.png`, fullPage: true });
      await context.close();
    });
  }
});

// ---------------------------------------------------------------------------------------------
// Matriz de medición del cierre (02-08, tarea 2). Cada bloque mide; lo que falle es un defecto del
// layout que se corrige en CSS, no una prueba que se afloje.
// ---------------------------------------------------------------------------------------------

const MATRIX_WIDTHS = [320, 390, 640, 768, 1024, 1280] as const;
const heightFor = (width: number) => (width < 640 ? 800 : 900);

test.describe('matriz de desborde', () => {
  for (const path of ['/', '/privacidad/']) {
    for (const width of MATRIX_WIDTHS) {
      for (const motion of ['reduce', 'no-preference'] as const) {
        test(`${path} a ${width} px con ${motion}: sin scroll horizontal ni rectángulos fuera de la ventana`, async ({
          browser,
          baseURL,
        }) => {
          const context = await isolatedContext(browser, baseURL, width, heightFor(width), { reducedMotion: motion });
          const page = await context.newPage();
          await page.goto(path);
          const m = await page.evaluate(() => {
            const de = document.documentElement;
            const outside: string[] = [];
            const targets = document.querySelectorAll('body > header, main > section, body > footer');
            for (const el of targets) {
              const r = el.getBoundingClientRect();
              if (r.left < -0.5 || r.right > innerWidth + 0.5) {
                outside.push(`${el.tagName.toLowerCase()}#${el.id} [${r.left.toFixed(1)}, ${r.right.toFixed(1)}]`);
              }
            }
            return {
              scrollWidth: de.scrollWidth,
              clientWidth: de.clientWidth,
              innerWidth,
              count: targets.length,
              outside,
            };
          });
          await context.close();
          expect(m.count, 'header, secciones y footer presentes').toBeGreaterThanOrEqual(2);
          expect(m.scrollWidth, `scrollWidth ${m.scrollWidth} frente a clientWidth ${m.clientWidth}`).toBeLessThanOrEqual(
            m.clientWidth,
          );
          expect(m.outside).toEqual([]);
        });
      }
    }
  }
});

test.describe('espaciado de texto (SC 1.4.12)', () => {
  for (const [width, height] of [
    [320, 640],
    [1280, 800],
  ] as const) {
    test(`/ a ${width} px con el espaciado forzado: sin scroll horizontal y sin texto recortado`, async ({
      browser,
      baseURL,
    }) => {
      const context = await isolatedContext(browser, baseURL, width, height, { reducedMotion: 'reduce' });
      const page = await context.newPage();
      await page.goto('/');
      await page.addStyleTag({
        content: `* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; }
p { margin-bottom: 2em !important; }`,
      });
      const m = await page.evaluate(() => {
        const clipped: string[] = [];
        for (const el of document.querySelectorAll('body *')) {
          if (el.closest('svg')) continue;
          // Texto solo para lectores de pantalla (1 px recortado a propósito, técnica sr-only): no es texto que se recorte.
          if (el.classList.contains('team-link-hint')) continue;
          const cs = getComputedStyle(el);
          const hides = (v: string) => v === 'hidden' || v === 'clip';
          const hiddenY = hides(cs.overflowY);
          const hiddenX = hides(cs.overflowX);
          if (!hiddenX && !hiddenY) continue;
          if (!(el.textContent ?? '').trim()) continue;
          const tooTall = hiddenY && el.scrollHeight > el.clientHeight + 1;
          const tooWide = hiddenX && el.scrollWidth > el.clientWidth + 1;
          if (tooTall || tooWide) {
            clipped.push(
              `${el.tagName.toLowerCase()}.${(el as HTMLElement).className} alto ${el.scrollHeight}/${el.clientHeight} ancho ${el.scrollWidth}/${el.clientWidth}`,
            );
          }
        }
        const de = document.documentElement;
        return { overflow: de.scrollWidth - de.clientWidth, clipped };
      });
      await context.close();
      expect(m.overflow).toBeLessThanOrEqual(0);
      expect(m.clipped).toEqual([]);
    });
  }
});

test.describe('sin JavaScript', () => {
  test('/ con JavaScript apagado: 12 secciones visibles, el <details> abre y hay 4 CTA', async ({ browser, baseURL }) => {
    const context = await isolatedContext(browser, baseURL, 390, 844, { javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/');
    const sections = page.locator('main > section');
    await expect(sections).toHaveCount(12);
    for (let i = 0; i < 12; i++) {
      const section = sections.nth(i);
      await section.scrollIntoViewIfNeeded();
      await expect(section).toBeVisible();
      const h = await section.evaluate((el) => el.getBoundingClientRect().height);
      expect(h, `sección ${i}`).toBeGreaterThan(0);
    }
    const details = page.locator('details').first();
    await expect(details).not.toHaveAttribute('open', /.*/);
    await details.locator('summary').click();
    await expect(details).toHaveAttribute('open', /.*/);
    await expect(page.locator('a[data-cta]')).toHaveCount(4);
    await context.close();
  });
});

test.describe('ClickUp bloqueado', () => {
  for (const width of [390, 1280]) {
    test(`/ a ${width} px sin ClickUp: 12 secciones, footer y enlace de respaldo visibles, cero pageerror`, async ({
      browser,
      baseURL,
    }) => {
      const context = await isolatedContext(browser, baseURL, width, 800);
      const page = await context.newPage();
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.goto('/');
      const sections = page.locator('main > section');
      await expect(sections).toHaveCount(12);
      for (let i = 0; i < 12; i++) {
        await sections.nth(i).scrollIntoViewIfNeeded();
        await expect(sections.nth(i)).toBeVisible();
      }
      await page.locator('body > footer').scrollIntoViewIfNeeded();
      await expect(page.locator('body > footer')).toBeVisible();
      const backup = page.locator('#agenda a[target="_blank"]');
      await backup.scrollIntoViewIfNeeded();
      await expect(backup).toBeVisible();
      await expect(backup).toHaveAttribute('rel', /noopener/);
      await context.close();
      expect(errors).toEqual([]);
    });
  }
});

test.describe('objetivos, sombras y área de salvado', () => {
  for (const [width, height] of [
    [390, 844],
    [1280, 800],
  ] as const) {
    test(`/ a ${width} px: todo a, summary y button visible mide 44 px o más de alto`, async ({ browser, baseURL }) => {
      const context = await isolatedContext(browser, baseURL, width, height, { reducedMotion: 'reduce' });
      const page = await context.newPage();
      await page.goto('/');
      const small = await page.evaluate(() => {
        const bad: string[] = [];
        for (const el of document.querySelectorAll('a, summary, button')) {
          const cs = getComputedStyle(el);
          if (cs.display === 'none' || cs.visibility === 'hidden') continue;
          const r = el.getBoundingClientRect();
          // Skip links fuera de pantalla (transform) y cualquier objeto sin caja.
          if (r.width < 2 || r.height < 2 || r.bottom <= 0 || r.right <= 0) continue;
          if (r.height < 44 - 0.01) {
            bad.push(`${el.tagName.toLowerCase()} "${(el.textContent ?? '').trim().slice(0, 30)}" ${r.height.toFixed(1)} px`);
          }
        }
        return bad;
      });
      await context.close();
      expect(small).toEqual([]);
    });

    test(`/ a ${width} px: ningún elemento de contenido entra en el área de salvado de cada logo`, async ({
      browser,
      baseURL,
    }) => {
      const context = await isolatedContext(browser, baseURL, width, height, { reducedMotion: 'reduce' });
      const page = await context.newPage();
      await page.goto('/');
      const r = await page.evaluate(() => {
        const logos = Array.from(document.querySelectorAll<HTMLElement>('.brand-logo'));
        const report: Array<{ where: string; clear: number; bad: string[] }> = [];
        for (const logo of logos) {
          const probe = document.createElement('div');
          probe.style.cssText = 'position:absolute;visibility:hidden;width:var(--logo-clear)';
          logo.appendChild(probe);
          const clear = probe.getBoundingClientRect().width;
          probe.remove();
          const art = logo.querySelector('svg')!;
          const lr = art.getBoundingClientRect();
          const zone = { l: lr.left - clear, t: lr.top - clear, r: lr.right + clear, b: lr.bottom + clear };
          const bad: string[] = [];
          const selector = 'a, p, h1, h2, h3, h4, h5, h6, li, button, summary, svg';
          for (const el of document.querySelectorAll(selector)) {
            if (el.closest('.collage-sprite') || el === art || el.contains(art) || logo.contains(el)) continue;
            if (el.tagName.toLowerCase() === 'svg' && (el.closest('[aria-hidden="true"]') || el.getAttribute('focusable') === 'false' && !el.getAttribute('role'))) continue;
            const cs = getComputedStyle(el);
            if (cs.display === 'none' || cs.visibility === 'hidden') continue;
            const b = el.getBoundingClientRect();
            if (b.width < 2 || b.height < 2) continue;
            if (b.left < zone.r && b.right > zone.l && b.top < zone.b && b.bottom > zone.t) {
              bad.push(`${el.tagName.toLowerCase()}.${(el as HTMLElement).className || el.getAttribute('href') || ''}`);
            }
          }
          report.push({ where: logo.closest('header') ? 'header' : logo.closest('footer') ? 'footer' : 'otro', clear, bad });
        }
        return report;
      });
      await context.close();
      expect(r.map((x) => x.where).sort(), 'un logo en header y otro en footer').toEqual(['footer', 'header']);
      for (const x of r) {
        expect(x.clear, `${x.where}: --logo-clear`).toBeGreaterThanOrEqual(24);
        expect(x.bad, `${x.where}: intrusiones en el área de salvado`).toEqual([]);
      }
    });
  }

  for (const width of [320, 390, 1280]) {
    test(`/ a ${width} px: la etiqueta de cada CTA cabe en una sola línea`, async ({ browser, baseURL }) => {
      const context = await isolatedContext(browser, baseURL, width, 800, { reducedMotion: 'reduce' });
      const page = await context.newPage();
      await page.goto('/');
      const wrapped = await page.locator('a[data-cta]').evaluateAll((els) =>
        els
          .map((el) => {
            const cs = getComputedStyle(el);
            const line = parseFloat(cs.lineHeight);
            const lines = Math.round((el.getBoundingClientRect().height - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - 6) / line);
            return { where: el.getAttribute('data-cta'), lines };
          })
          .filter((c) => c.lines > 1),
      );
      await context.close();
      expect(wrapped).toEqual([]);
    });
  }

  for (const path of ['/', '/privacidad/']) {
    test(`${path}: cero sombras con desenfoque y cero degradados computados`, async ({ browser, baseURL }) => {
      const context = await isolatedContext(browser, baseURL, 1280, 800, { reducedMotion: 'reduce' });
      const page = await context.newPage();
      await page.goto(path);
      const found = await page.evaluate(() => {
        // Descompone `box-shadow` o `text-shadow` computados: quita colores, separa por comas de
        // primer nivel y toma el tercer número (desenfoque). Vale 0 en las sombras planas de marca.
        const blurOf = (value: string): number[] => {
          if (!value || value === 'none') return [];
          return value
            .replace(/rgba?\([^)]*\)|hsla?\([^)]*\)|color\([^)]*\)|oklch\([^)]*\)|oklab\([^)]*\)/g, '')
            .split(',')
            .map((part) => part.trim().replace(/\binset\b/, '').trim().split(/\s+/).filter(Boolean))
            .map((nums) => (nums.length >= 3 ? parseFloat(nums[2]) : 0));
        };
        const blurred: string[] = [];
        const gradients: string[] = [];
        for (const el of document.querySelectorAll('*')) {
          if (el.closest('.collage-sprite')) continue;
          for (const pseudo of [null, '::before', '::after'] as const) {
            const cs = getComputedStyle(el, pseudo);
            const tag = `${el.tagName.toLowerCase()}.${(el as HTMLElement).className}${pseudo ?? ''}`;
            if (blurOf(cs.boxShadow).some((b) => b > 0) || blurOf(cs.textShadow).some((b) => b > 0)) blurred.push(tag);
            if (/blur\(|drop-shadow\(/.test(cs.filter) || /blur\(/.test(cs.backdropFilter || '')) blurred.push(`${tag} filter`);
            // Un `linear-gradient(c, c)` con el mismo color en todas sus paradas es un relleno plano
            // (el marcador de MetricCard); un degradado es el que cambia de color.
            for (const g of cs.backgroundImage.match(/[a-z-]*gradient\((?:[^()]|\([^()]*\))*\)/g) ?? []) {
              const colors = new Set(g.match(/(?:rgba?|hsla?|oklch|oklab|color)\([^)]*\)/g) ?? []);
              if (colors.size > 1 || !/^linear-gradient/.test(g)) gradients.push(`${tag} ${g}`);
            }
          }
        }
        return { blurred, gradients };
      });
      await context.close();
      expect(found.blurred, 'sombras con desenfoque').toEqual([]);
      expect(found.gradients, 'degradados').toEqual([]);
    });
  }
});

test.describe('peso y peticiones', () => {
  const COLLAGE_MAX = 42240;
  const INLINE_SCRIPT_MAX = 3072;
  const ALLOWED_HOSTS = ['localhost', 'forms.clickup.com', 'app-cdn.clickup.com'];

  test(`dist/index.html: por debajo de ${HTML_RAW_MAX} bytes crudos y de ${HTML_GZIP_MAX} con gzip -9`, () => {
    // Topes en tests/e2e/lib/budgets.mjs (única fuente, con su justificación).
    const html = readFileSync('dist/index.html');
    expect(html.length, `crudo ${html.length}`).toBeLessThan(HTML_RAW_MAX);
    const gz = gzipSync(html, { level: 9 }).length;
    expect(gz, `gzip -9 ${gz}`).toBeLessThan(HTML_GZIP_MAX);
  });

  test('dist no contiene archivos .js', () => {
    const js: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = `${dir}/${entry.name}`;
        if (entry.isDirectory()) walk(full);
        else if (/\.m?js$/.test(entry.name)) js.push(full);
      }
    };
    walk('dist');
    expect(js).toEqual([]);
  });

  test('/: raíces [data-collage] más el sprite pesan 42240 bytes o menos y el script en línea menos de 3072', async ({
    page,
  }, testInfo) => {
    await page.goto('/');
    const m = await page.evaluate(() => {
      const roots = Array.from(document.querySelectorAll('[data-collage]'));
      const nested = roots.filter((el) => el.parentElement?.closest('[data-collage]')).length;
      const sprite = document.querySelector('.collage-sprite')?.outerHTML ?? '';
      return {
        roots: roots.map((el) => el.outerHTML),
        nested,
        sprite,
        scripts: Array.from(document.querySelectorAll('script:not([src])'))
          .filter((s) => (s.getAttribute('type') ?? '') !== 'application/ld+json')
          .map((s) => s.textContent ?? ''),
      };
    });
    const bytes = (s: string) => Buffer.byteLength(s);
    const total = m.roots.reduce((sum, s) => sum + bytes(s), 0) + bytes(m.sprite);
    testInfo.annotations.push({
      type: 'peso collage',
      description: `${m.roots.length} raíces (${m.nested} anidadas) + sprite ${bytes(m.sprite)} = ${total} bytes`,
    });
    expect(total, `collage + sprite ${total} bytes`).toBeLessThanOrEqual(COLLAGE_MAX);
    for (const s of m.scripts) expect(bytes(s), 'script en línea').toBeLessThan(INLINE_SCRIPT_MAX);
  });

  for (const path of ['/', '/privacidad/']) {
    test(`${path}: solo se piden peticiones a localhost, forms.clickup.com y app-cdn.clickup.com`, async ({ page }) => {
      const hosts = new Set<string>();
      page.on('request', (req) => {
        const frame = req.frame();
        const main = page.mainFrame();
        // Lo que pide la página, más la navegación de su iframe; el interior del formulario de
        // ClickUp (sus propias peticiones) no es nuestro.
        if (frame === main || (frame.parentFrame() === main && req.isNavigationRequest())) {
          const url = new URL(req.url());
          if (url.protocol === 'http:' || url.protocol === 'https:') hosts.add(url.hostname);
        }
      });
      await page.goto(path);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1500);
      const unexpected = [...hosts].filter((h) => !ALLOWED_HOSTS.includes(h));
      expect(unexpected, `hosts: ${[...hosts].join(', ')}`).toEqual([]);
    });
  }
});

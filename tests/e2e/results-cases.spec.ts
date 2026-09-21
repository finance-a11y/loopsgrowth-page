import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { parse } from 'yaml';
import { PURPLE_RGB } from './lib/brand';
import { HTML_GZIP_MAX, HTML_RAW_MAX } from './lib/budgets.mjs';
import { expectMotionWithinBudget, expectNoMotion } from './lib/motion';

// Los textos esperados salen del YAML: nunca cadenas escritas a mano (COPY-01). Los espacios se
// normalizan al comparar porque el HTML colapsa los espacios repetidos.
type Claim = { text: string; status: string };
const doc = parse(readFileSync('src/content/landing.es.yaml', 'utf8')) as {
  es: {
    results: { title: Claim; items: { lead: Claim; body: Claim }[] };
    call: { duration: Claim };
    cta: { label_template: Claim };
    cases: {
      title: Claim;
      labels: { sector: Claim; period: Claim; channel: Claim };
      items: { figure: Claim; metric: Claim; detail?: Claim; sector: Claim; period: Claim; channel: Claim }[];
    };
  };
};
const es = doc.es;
const norm = (s: string) => s.replace(/\s+/g, ' ').trim();

// Colores de los pares medidos (tono dark: blanco sobre oscuro y amarillo solo en borde y disco).
const WHITE = 'rgb(255, 255, 255)';
const DARK = 'rgb(33, 33, 33)';
const YELLOW = 'rgb(255, 198, 2)';
const ctaLabel = norm(es.cta.label_template.text.replace('{duration}', es.call.duration.text));

type Box = { x: number; y: number; width: number; height: number };
const boxes = async (page: Page, sel: string): Promise<Box[]> =>
  page.locator(sel).evaluateAll((els) =>
    els.map((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y + window.scrollY, width: r.width, height: r.height };
    }),
  );

for (const viewport of [
  { width: 1280, height: 800 },
  { width: 390, height: 844 },
]) {
  test.describe(`Lo que logramos juntos a ${viewport.width} px`, () => {
    test.use({ viewport });

    test('la sección tiene su tono, su h2 del YAML y ningún enfocable', async ({ page }) => {
      await page.goto('/');
      const section = page.locator('main > section#resultados');
      await expect(section).toHaveCount(1);
      await expect(section).toHaveAttribute('data-tone', 'dark');
      expect(await section.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(DARK);

      const h2 = section.locator('h2');
      await expect(h2).toHaveCount(1);
      expect(norm((await h2.textContent()) ?? '')).toBe(norm(es.results.title.text));
      expect(await h2.evaluate((el) => getComputedStyle(el).color)).toBe(WHITE);
      const labelled = await section.getAttribute('aria-labelledby');
      expect(labelled).toBe(await h2.getAttribute('id'));

      await expect(section.locator('h3, a, button, [tabindex]')).toHaveCount(0);
    });

    test('cuatro resultados en el orden del YAML, con lead y cuerpo', async ({ page }) => {
      await page.goto('/');
      const list = page.locator('#resultados ul[role="list"]');
      await expect(list).toHaveCount(1);
      const items = list.locator('> li');
      await expect(items).toHaveCount(es.results.items.length);
      for (let i = 0; i < es.results.items.length; i++) {
        const item = items.nth(i);
        expect(norm((await item.locator('.result-lead').textContent()) ?? '')).toBe(
          norm(es.results.items[i].lead.text),
        );
        expect(norm((await item.locator('.result-body').textContent()) ?? '')).toBe(
          norm(es.results.items[i].body.text),
        );
      }
    });

    test('el rango de presupuesto de ads no se publica: ni 30 ni 50 por ciento', async ({ page }) => {
      await page.goto('/');
      const text = await page.locator('#resultados').evaluate((el) => (el as HTMLElement).innerText);
      expect(text).not.toMatch(/(^|[^\d.,])(30|50)\s?%/);
      expect(text).not.toMatch(/\[VERIFICAR/i);
    });

    test('cada resultado lleva borde amarillo de 3 px, lead 600, cuerpo 400 y un disco de 32 px', async ({
      page,
    }) => {
      await page.goto('/');
      const items = page.locator('#resultados ul[role="list"] > li');
      await expect(items).toHaveCount(4);
      for (let i = 0; i < 4; i++) {
        const item = items.nth(i);
        const style = await item.evaluate((el) => {
          const s = getComputedStyle(el);
          return {
            width: s.borderTopWidth,
            style: s.borderTopStyle,
            color: s.borderTopColor,
            bg: s.backgroundColor,
            shadow: s.boxShadow,
            cursor: s.cursor,
          };
        });
        expect(style.width).toBe('3px');
        expect(style.style).toBe('solid');
        expect(style.color).toBe(YELLOW);
        expect(style.bg).toBe('rgba(0, 0, 0, 0)');
        expect(style.shadow).toBe('none');
        expect(style.cursor).not.toBe('pointer');

        const lead = await item.locator('.result-lead').evaluate((el) => {
          const s = getComputedStyle(el);
          return { weight: s.fontWeight, color: s.color };
        });
        expect(lead.weight).toBe('600');
        expect(lead.color).toBe(WHITE);
        const body = await item.locator('.result-body').evaluate((el) => {
          const s = getComputedStyle(el);
          return { weight: s.fontWeight, color: s.color };
        });
        expect(body.weight).toBe('400');
        expect(body.color).toBe(WHITE);

        const svg = item.locator('svg');
        await expect(svg).toHaveCount(1);
        await expect(svg).toHaveAttribute('aria-hidden', 'true');
        await expect(svg).toHaveAttribute('focusable', 'false');
        await expect(svg.locator('title, text')).toHaveCount(0);
        const box = (await svg.boundingBox())!;
        expect(Math.abs(box.width - 32)).toBeLessThanOrEqual(1);
        expect(Math.abs(box.height - 32)).toBeLessThanOrEqual(1);
      }
    });

    test('la rejilla: una columna en móvil y 2x2 con alturas parejas en escritorio', async ({ page }) => {
      await page.goto('/');
      const r = await boxes(page, '#resultados ul[role="list"] > li');
      expect(r).toHaveLength(4);
      if (viewport.width < 640) {
        for (const b of r) expect(Math.abs(b.x - r[0].x)).toBeLessThanOrEqual(2);
      } else {
        expect(Math.abs(r[0].y - r[1].y)).toBeLessThanOrEqual(2);
        expect(Math.abs(r[2].y - r[3].y)).toBeLessThanOrEqual(2);
        expect(Math.abs(r[0].x - r[2].x)).toBeLessThanOrEqual(2);
        expect(r[1].x).toBeGreaterThan(r[0].x + r[0].width - 2);
        expect(Math.abs(r[0].height - r[1].height)).toBeLessThanOrEqual(1);
        expect(Math.abs(r[2].height - r[3].height)).toBeLessThanOrEqual(1);
      }
    });
  });
}

test.describe('sin movimiento en Lo que logramos juntos', () => {
  for (const motion of ['reduce', 'no-preference'] as const) {
    test(`cero animaciones y opacidad 1 con prefers-reduced-motion ${motion}`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: motion });
      await page.goto('/');
      if (motion === 'reduce') await expectNoMotion(page);
      else await expectMotionWithinBudget(page);
      const opacities = await page
        .locator('#resultados li')
        .evaluateAll((els) => els.map((el) => getComputedStyle(el).opacity));
      expect(opacities).toEqual(['1', '1', '1', '1']);
    });
  }
});

// ---------------------------------------------------------------------------------------------
// Casos de éxito (CONT-06). Todo texto esperado sale del YAML; los rectángulos se miden en el navegador.
// ---------------------------------------------------------------------------------------------
const CASES = es.cases.items;
const overlaps = (a: Box, b: Box) =>
  a.x < b.x + b.width - 1 && b.x < a.x + a.width - 1 && a.y < b.y + b.height - 1 && b.y < a.y + a.height - 1;

for (const viewport of [
  { width: 1280, height: 800 },
  { width: 390, height: 844 },
]) {
  test.describe(`Casos de éxito a ${viewport.width} px`, () => {
    test.use({ viewport });

    test('(g) la sección: tono light, fondo blanco, h2 morado del YAML y aria-labelledby', async ({ page }) => {
      await page.goto('/');
      const section = page.locator('main > section#casos');
      await expect(section).toHaveCount(1);
      await expect(section).toHaveAttribute('data-tone', 'light');
      expect(await section.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(WHITE);
      const h2 = section.locator('h2');
      await expect(h2).toHaveCount(1);
      expect(norm((await h2.textContent()) ?? '')).toBe(norm(es.cases.title.text));
      expect(await h2.evaluate((el) => getComputedStyle(el).color)).toBe(PURPLE_RGB);
      expect(await section.getAttribute('aria-labelledby')).toBe(await h2.getAttribute('id'));
    });

    test('(h) cinco artículos; el h3 es la frase completa del doc y da nombre a la tarjeta', async ({ page }) => {
      await page.goto('/');
      const list = page.locator('#casos ul[role="list"]');
      await expect(list).toHaveCount(1);
      const items = list.locator('> li');
      await expect(items).toHaveCount(CASES.length);
      for (let i = 0; i < CASES.length; i++) {
        const article = items.nth(i).locator('article');
        await expect(article).toHaveCount(1);
        const h3 = article.locator('h3');
        await expect(h3).toHaveCount(1);
        expect(await article.getAttribute('aria-labelledby')).toBe(await h3.getAttribute('id'));
        const name = `${CASES[i].figure.text} ${CASES[i].metric.text}`;
        expect(norm((await h3.textContent()) ?? '')).toBe(norm(name));
        await expect(page.getByRole('heading', { level: 3, name: norm(name), exact: true })).toHaveCount(1);
      }
    });

    test('(i) chip de canal, dl con Sector, Plazo y Canal, sin dd vacíos y detalle solo si el YAML lo trae', async ({
      page,
    }) => {
      await page.goto('/');
      const articles = page.locator('#casos article');
      await expect(articles).toHaveCount(CASES.length);
      for (let i = 0; i < CASES.length; i++) {
        const a = articles.nth(i);
        expect(norm((await a.locator('.metric-chip').textContent()) ?? '')).toBe(norm(CASES[i].channel.text));
        const dts = a.locator('dl dt');
        await expect(dts).toHaveCount(3);
        const labels = [es.cases.labels.sector, es.cases.labels.period, es.cases.labels.channel];
        for (let k = 0; k < 3; k++) {
          expect(norm((await dts.nth(k).textContent()) ?? '')).toBe(norm(labels[k].text));
        }
        const dds = a.locator('dl dd');
        await expect(dds).toHaveCount(3);
        const values = [CASES[i].sector, CASES[i].period, CASES[i].channel];
        for (let k = 0; k < 3; k++) {
          const t = norm((await dds.nth(k).textContent()) ?? '');
          expect(t).not.toBe('');
          expect(t).toBe(norm(values[k].text));
        }
        const detail = a.locator('.metric-detail');
        if (CASES[i].detail) {
          await expect(detail).toHaveCount(1);
          expect(norm((await detail.textContent()) ?? '')).toBe(norm(CASES[i].detail!.text));
        } else {
          await expect(detail).toHaveCount(0);
        }
      }
    });

    test('(j) la cifra es morada y lleva el marcador amarillo', async ({ page }) => {
      await page.goto('/');
      const figures = page.locator('#casos .metric-figure');
      await expect(figures).toHaveCount(CASES.length);
      for (let i = 0; i < CASES.length; i++) {
        const fig = figures.nth(i);
        expect(await fig.evaluate((el) => getComputedStyle(el).color)).toBe(PURPLE_RGB);
        const bg = await fig
          .locator('.metric-mark')
          .evaluate((el) => `${getComputedStyle(el).backgroundColor} ${getComputedStyle(el).backgroundImage}`);
        expect(bg).toContain(YELLOW);
      }
    });

    test('(k) la rejilla medida por rectángulos', async ({ page }) => {
      await page.goto('/');
      const r = await boxes(page, '#casos ul[role="list"] > li');
      expect(r).toHaveLength(5);
      const tol = 2;
      if (viewport.width < 640) {
        for (const b of r) expect(Math.abs(b.x - r[0].x)).toBeLessThanOrEqual(tol);
      } else {
        // 1280 px: tres columnas; la quinta ocupa las columnas 2 y 3.
        expect(Math.abs(r[0].y - r[1].y)).toBeLessThanOrEqual(tol);
        expect(Math.abs(r[1].y - r[2].y)).toBeLessThanOrEqual(tol);
        expect(Math.abs(r[3].x - r[0].x)).toBeLessThanOrEqual(tol);
        expect(Math.abs(r[4].x - r[1].x)).toBeLessThanOrEqual(tol);
        expect(Math.abs(r[4].x + r[4].width - (r[2].x + r[2].width))).toBeLessThanOrEqual(tol);
        expect(Math.abs(r[3].y - r[4].y)).toBeLessThanOrEqual(tol);
      }
    });
  });
}

for (const width of [640, 768]) {
  test.describe(`Casos de éxito, dos columnas a ${width} px`, () => {
    test.use({ viewport: { width, height: 900 } });
    test('(k) dos columnas y la quinta ocupa ambas', async ({ page }) => {
      await page.goto('/');
      const r = await boxes(page, '#casos ul[role="list"] > li');
      expect(Math.abs(r[0].y - r[1].y)).toBeLessThanOrEqual(2);
      expect(Math.abs(r[2].y - r[3].y)).toBeLessThanOrEqual(2);
      expect(Math.abs(r[2].x - r[0].x)).toBeLessThanOrEqual(2);
      expect(Math.abs(r[4].x - r[0].x)).toBeLessThanOrEqual(2);
      expect(Math.abs(r[4].x + r[4].width - (r[1].x + r[1].width))).toBeLessThanOrEqual(2);
    });
  });
}

test.describe('Casos de éxito, tres columnas a 1024 px', () => {
  test.use({ viewport: { width: 1024, height: 800 } });
  test('(k) tres columnas y la quinta en las columnas 2 y 3', async ({ page }) => {
    await page.goto('/');
    const r = await boxes(page, '#casos ul[role="list"] > li');
    expect(Math.abs(r[0].y - r[1].y)).toBeLessThanOrEqual(2);
    expect(Math.abs(r[1].y - r[2].y)).toBeLessThanOrEqual(2);
    expect(Math.abs(r[3].x - r[0].x)).toBeLessThanOrEqual(2);
    expect(Math.abs(r[4].x - r[1].x)).toBeLessThanOrEqual(2);
    expect(Math.abs(r[4].x + r[4].width - (r[2].x + r[2].width))).toBeLessThanOrEqual(2);
  });
});

for (const viewport of [
  { width: 1280, height: 800 },
  { width: 390, height: 844 },
]) {
  test.describe(`La lupa de Casos de éxito a ${viewport.width} px`, () => {
    test.use({ viewport });

    test('(l) una sola lupa decorativa de 96 px en la quinta tarjeta, sin cruzar texto y con la cifra encima', async ({
      page,
    }) => {
      await page.goto('/');
      const lupas = page.locator('#casos svg[data-collage="piece"][data-collage-piece="lupa"]');
      await expect(lupas).toHaveCount(1);
      await expect(page.locator('#casos svg')).toHaveCount(1);
      await expect(page.locator('#casos img')).toHaveCount(0);
      const lupa = lupas.first();
      await expect(lupa).toHaveAttribute('aria-hidden', 'true');
      await expect(lupa).toHaveAttribute('focusable', 'false');
      await expect(lupa.locator('use')).toHaveCount(1);
      expect(await lupa.locator('use').getAttribute('href')).toBe('#lg-lupa');
      const fifth = page.locator('#casos ul[role="list"] > li').nth(4).locator('article');
      await expect(fifth.locator('svg[data-collage-piece="lupa"]')).toHaveCount(1);

      // Ancho y alto calculados (no incluyen la rotación) y relación 0.97 del arte oficial.
      const size = await lupa.evaluate((el) => {
        const s = getComputedStyle(el);
        return { w: parseFloat(s.width), h: parseFloat(s.height) };
      });
      expect(Math.abs(size.w - 96)).toBeLessThanOrEqual(1);
      expect(Math.abs(size.h - 99)).toBeLessThanOrEqual(3);

      const card = (await fifth.boundingBox())!;
      const lb = (await lupa.boundingBox())!;
      expect(lb.x).toBeGreaterThanOrEqual(card.x - 1);
      expect(lb.y).toBeGreaterThanOrEqual(card.y - 1);
      expect(lb.x + lb.width).toBeLessThanOrEqual(card.x + card.width + 1);
      expect(lb.y + lb.height).toBeLessThanOrEqual(card.y + card.height + 1);

      const lupaBox: Box = { x: lb.x, y: lb.y, width: lb.width, height: lb.height };
      for (const sel of ['.metric-detail', 'dl', '.metric-name', '.metric-chip']) {
        const others = await fifth.locator(sel).evaluateAll((els) =>
          els.map((el) => {
            const b = el.getBoundingClientRect();
            return { x: b.x, y: b.y, width: b.width, height: b.height };
          }),
        );
        const lupaNow = (await lupa.boundingBox())!;
        for (const o of others) {
          // boundingBox usa coordenadas de la ventana, igual que getBoundingClientRect.
          expect(overlaps({ x: lupaNow.x, y: lupaNow.y, width: lupaNow.width, height: lupaNow.height }, o), sel).toBe(
            false,
          );
        }
      }
      void lupaBox;

      // El texto de la cifra queda por encima de la lupa (o la lupa no está bajo ese punto).
      // elementsFromPoint solo ve lo que está dentro de la ventana: se lleva la cifra a la vista.
      await fifth.locator('.metric-mark').scrollIntoViewIfNeeded();
      const order = await fifth.locator('.metric-mark').evaluate((fig) => {
        const r = fig.getBoundingClientRect();
        const stack = document.elementsFromPoint(r.x + r.width / 2, r.y + r.height / 2);
        const h3 = fig.closest('h3')!;
        const iText = stack.findIndex((n) => h3.contains(n));
        const iLupa = stack.findIndex((n) => n.closest('svg[data-collage-piece="lupa"]'));
        return { iText, iLupa };
      });
      expect(order.iText).toBeGreaterThanOrEqual(0);
      if (order.iLupa >= 0) expect(order.iText).toBeLessThan(order.iLupa);
    });

    test('(m) el CTA de casos: etiqueta del YAML, href a #agenda, 48 px bajo la rejilla y foco en #agenda-title', async ({
      page,
    }) => {
      await page.goto('/');
      const ctas = page.locator('#casos a[data-cta="casos"]');
      await expect(ctas).toHaveCount(1);
      await expect(ctas).toHaveAttribute('href', '#agenda');
      expect(norm((await ctas.textContent()) ?? '')).toBe(ctaLabel);
      expect(await ctas.getAttribute('aria-label')).toBeNull();
      const cta = (await ctas.boundingBox())!;
      expect(cta.height).toBeGreaterThanOrEqual(48);
      if (viewport.width >= 1024) {
        const grid = await boxes(page, '#casos ul[role="list"]');
        const gap = cta.y + (await page.evaluate(() => window.scrollY)) - (grid[0].y + grid[0].height);
        expect(Math.abs(gap - 48)).toBeLessThanOrEqual(4);
      }
      await ctas.click();
      await expect.poll(() => page.evaluate(() => location.hash)).toBe('#agenda');
      await expect(page.locator('#agenda-title')).toBeFocused();
    });
  });
}

test.describe('Casos de éxito, tarjetas inertes', () => {
  test('(n) sin enfocables dentro, sin cursor de puntero y sin cambio con hover', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#casos article a, #casos article button, #casos article [tabindex]')).toHaveCount(0);
    const articles = page.locator('#casos article');
    await expect(articles).toHaveCount(CASES.length);
    for (let i = 0; i < CASES.length; i++) {
      const a = articles.nth(i);
      const read = () =>
        a.evaluate((el) => {
          const s = getComputedStyle(el);
          return { cursor: s.cursor, transform: s.transform, shadow: s.boxShadow };
        });
      const before = await read();
      expect(before.cursor).not.toBe('pointer');
      await a.scrollIntoViewIfNeeded();
      await a.hover();
      const after = await read();
      expect(after.transform).toBe(before.transform);
      expect(after.shadow).toBe(before.shadow);
    }
  });

  test(`(o) el HTML de / pesa menos de ${HTML_RAW_MAX} bytes crudos y ${HTML_GZIP_MAX} con gzip`, async ({ page }) => {
    // Topes en tests/e2e/lib/budgets.mjs (única fuente, con su justificación).
    const res = await page.request.get('/');
    const body = await res.body();
    expect(body.length).toBeLessThan(HTML_RAW_MAX);
    expect(gzipSync(body, { level: 9 }).length).toBeLessThan(HTML_GZIP_MAX);
  });
});

// ---------------------------------------------------------------------------------------------
// Lote C1: mediciones a cinco anchos (CONT-05, CONT-06, DSGN-04).
// ---------------------------------------------------------------------------------------------
const FIVE_WIDTHS = [
  { width: 320, height: 800 },
  { width: 390, height: 844 },
  { width: 768, height: 900 },
  { width: 1024, height: 800 },
  { width: 1280, height: 800 },
];
const FILLER = 'FALTA CONFIRMAR';
const BIG_FIGURE = CASES.find((c) => c.figure.text.includes('3.808%'))!.figure.text;

test.describe('Lote C1: sin desborde, cifra, aire y espaciado a cinco anchos', () => {
  for (const viewport of FIVE_WIDTHS) {
    test.describe(`a ${viewport.width} px`, () => {
      test.use({ viewport });

      test('(p) sin scroll horizontal y rectángulos dentro de [0, innerWidth]', async ({ page }) => {
        await page.goto('/');
        const { scrollWidth, innerWidth } = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
        }));
        expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
        for (const sel of ['#resultados', '#casos', '#resultados ul[role="list"] > li', '#casos ul[role="list"] > li']) {
          for (const b of await boxes(page, sel)) {
            expect(b.x, sel).toBeGreaterThanOrEqual(-1);
            expect(b.x + b.width, sel).toBeLessThanOrEqual(innerWidth + 1);
          }
        }
      });

      if ([390, 1024, 1280].includes(viewport.width)) test('(r) padding vertical de las dos secciones: 64 px a 390 px y 96 px desde 1024 px', async ({ page }) => {
        await page.goto('/');
        const expected = viewport.width === 390 ? 64 : 96;
        for (const sel of ['#resultados', '#casos']) {
          const pad = await page.locator(sel).evaluate((el) => {
            const s = getComputedStyle(el);
            return { top: parseFloat(s.paddingTop), bottom: parseFloat(s.paddingBottom) };
          });
          expect(pad.top, sel).toBe(expected);
          expect(pad.bottom, sel).toBe(expected);
        }
      });

      if ([320, 390, 1280].includes(viewport.width)) test('(u) la cifra es lo más grande de cada tarjeta y su marcador es amarillo', async ({ page }) => {
        await page.goto('/');
        const cards = page.locator('#casos article');
        await expect(cards).toHaveCount(CASES.length);
        for (let i = 0; i < CASES.length; i++) {
          const sizes = await cards.nth(i).evaluate((card) => {
            const fs = (sel: string) =>
              Array.from(card.querySelectorAll(sel)).map((el) => parseFloat(getComputedStyle(el).fontSize));
            return {
              figure: fs('.metric-figure')[0],
              others: [...fs('.metric-name'), ...fs('.metric-detail'), ...fs('dt'), ...fs('dd'), ...fs('.metric-chip')],
              color: getComputedStyle(card.querySelector('.metric-figure')!).color,
              mark: getComputedStyle(card.querySelector('.metric-mark')!).backgroundImage,
              markColor: getComputedStyle(card.querySelector('.metric-mark')!).backgroundColor,
            };
          });
          expect(sizes.others.length).toBeGreaterThanOrEqual(6);
          for (const o of sizes.others) expect(sizes.figure).toBeGreaterThan(o);
          expect(sizes.color).toBe(PURPLE_RGB);
          expect(`${sizes.mark} ${sizes.markColor}`).toContain(YELLOW);
        }
      });
    });
  }
});

for (const width of [320, 1280]) {
  test.describe(`Lote C1 a ${width} px`, () => {
    test.use({ viewport: { width, height: 800 } });

    test('(q) la cifra larga y cada dd con el relleno quedan dentro de su tarjeta', async ({ page }) => {
      await page.goto('/');
      const cards = page.locator('#casos article');
      const check = async (sel: string, text: string) => {
        const found = cards.locator(sel).filter({ hasText: text });
        expect(await found.count(), `${sel} con ${text}`).toBeGreaterThan(0);
        const res = await found.evaluateAll((els) =>
          els.map((el) => {
            const card = el.closest('article')!.getBoundingClientRect();
            const r = el.getBoundingClientRect();
            return {
              inside: r.left >= card.left - 1 && r.right <= card.right + 1 && r.top >= card.top - 1 && r.bottom <= card.bottom + 1,
              overflow: el.scrollWidth - el.clientWidth,
            };
          }),
        );
        for (const r of res) {
          expect(r.inside, `${sel} ${text} dentro de la tarjeta`).toBe(true);
          expect(r.overflow, `${sel} ${text} sin desborde`).toBeLessThanOrEqual(1);
        }
      };
      await check('.metric-figure', BIG_FIGURE);
      await check('dd', FILLER);
    });

    test('(s) sin JavaScript se ven todos los textos y el CTA lleva href a #agenda', async ({ browser, baseURL }) => {
      const context = await browser.newContext({ baseURL, viewport: { width, height: 800 }, javaScriptEnabled: false });
      await context.route('**/*', (route) => {
        const host = new URL(route.request().url()).hostname;
        return host === 'localhost' || host === '127.0.0.1' ? route.continue() : route.abort();
      });
      const page = await context.newPage();
      await page.goto('/');
      const flat = norm(await page.locator('#resultados').innerText());
      for (const r of es.results.items) {
        expect(flat).toContain(norm(r.lead.text));
        expect(flat).toContain(norm(r.body.text));
      }
      expect(flat).toContain(norm(es.results.title.text));
      const casesText = norm(await page.locator('#casos').innerText());
      expect(casesText).toContain(norm(es.cases.title.text));
      for (const c of CASES) {
        expect(casesText).toContain(norm(c.figure.text));
        expect(casesText).toContain(norm(c.metric.text));
        expect(casesText).toContain(norm(c.sector.text));
        if (c.detail) expect(casesText).toContain(norm(c.detail.text));
      }
      await expect(page.locator('#casos a[data-cta="casos"]')).toHaveAttribute('href', '#agenda');
      await context.close();
    });

    test('(t) espaciado de texto forzado de SC 1.4.12 sin desborde ni texto fuera de su tarjeta', async ({ page }) => {
      await page.goto('/');
      await page.addStyleTag({
        content:
          '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }',
      });
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
      const out = await page.evaluate(() => {
        const bad: string[] = [];
        const containers = [...document.querySelectorAll('#casos article'), ...document.querySelectorAll('#resultados li')];
        for (const box of containers) {
          const b = box.getBoundingClientRect();
          for (const el of box.querySelectorAll('h3, p, dt, dd, span')) {
            const r = el.getBoundingClientRect();
            if (r.width === 0) continue;
            if (r.left < b.left - 1 || r.right > b.right + 1 || r.bottom > b.bottom + 1) {
              bad.push((el.textContent ?? '').trim().slice(0, 30));
            }
          }
          if (box.scrollWidth - box.clientWidth > 1) bad.push('scroll:' + (box.textContent ?? '').trim().slice(0, 20));
        }
        return bad;
      });
      expect(out).toEqual([]);
    });
  });
}

// (v) Capturas por sección. Solo con PHASE2_BATCH definida; el título lleva la palabra "captura".
test.describe('captura de secciones del lote', () => {
  test.skip(!process.env.PHASE2_BATCH, 'define PHASE2_BATCH (p. ej. C1) para generar capturas');
  for (const vp of FIVE_WIDTHS) {
    test(`captura de secciones ${vp.width}`, async ({ browser, baseURL }) => {
      const context = await browser.newContext({ baseURL, viewport: { width: vp.width, height: vp.height } });
      await context.route('**/*', (route) => {
        const host = new URL(route.request().url()).hostname;
        return host === 'localhost' || host === '127.0.0.1' ? route.continue() : route.abort();
      });
      const page = await context.newPage();
      await page.goto('/');
      for (const [id, name] of [['resultados', 'resultados'], ['casos', 'casos']] as const) {
        await page.locator(`#${id}`).screenshot({
          path: `test-results/phase2/${process.env.PHASE2_BATCH}-${name}-${vp.width}.png`,
        });
      }
      await context.close();
    });
  }
});

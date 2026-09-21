// Bloque de clientes del hero (quick 260920-hero-clients): 12 tarjetas estáticas bajo el CTA, en el orden de
// ariannalupi.com, con logo local (alt vacío) y el nombre como texto visible.
import { test, expect, type Page } from '@playwright/test';

const NAMES = ['Holafly', 'HubSpot', 'Unilever', 'Alchemy', 'Ambl', 'TravelPerk', 'Skale', 'Sendlane', 'ChartMogul', 'Holded', 'Flodesk', 'Piktochart'];
const LIST = '#inicio .hero-clients-list';
const box = (page: Page, selector: string) =>
  page.locator(selector).first().evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { top: r.top, bottom: r.bottom, left: r.left, right: r.right };
  });

test.describe('clientes del hero', () => {
  test('12 elementos en orden, con el nombre visible y el logo local de 128x128 con alt vacío y lazy', async ({ page }) => {
    await page.goto('/');
    const items = page.locator(`${LIST} > li`);
    await expect(items).toHaveCount(12);
    await expect(page.locator(`${LIST} .client-name`)).toHaveText(NAMES);
    for (const [i, name] of NAMES.entries()) {
      const img = items.nth(i).locator('img');
      await expect(img).toHaveAttribute('alt', '');
      await expect(img).toHaveAttribute('width', '128');
      await expect(img).toHaveAttribute('height', '128');
      await expect(img).toHaveAttribute('loading', 'lazy');
      await expect(img).toHaveAttribute('src', /^\/_astro\/.+\.webp$/);
      await expect(items.nth(i)).toHaveAttribute('data-client', name.toLowerCase());
      await expect(items.nth(i).locator('a')).toHaveCount(0);
    }
  });

  test('la lista se llama por su etiqueta visible, sin encabezado nuevo, y va justo bajo el CTA', async ({ page }) => {
    await page.goto('/');
    const list = page.locator(LIST);
    await expect(list).toHaveAttribute('role', 'list');
    await expect(list).toHaveAccessibleName('Marcas que han confiado en nuestro trabajo');
    await expect(page.locator('#hero-clients-label')).toBeVisible();
    await expect(page.locator('#inicio h2, #inicio h3')).toHaveCount(0);
    const cta = await box(page, '#inicio a[data-cta="hero"]');
    const clients = await box(page, '#inicio .hero-clients');
    expect(clients.top).toBeGreaterThan(cta.bottom);
    expect(clients.top - cta.bottom).toBeLessThan(96);
  });

  for (const width of [320, 390, 768, 1024, 1280]) {
    test(`a ${width} px: sin desborde horizontal, los 12 visibles y sin cruzarse con el collage`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
      const cards = await page.locator(`${LIST} > li`).evaluateAll((els) => els.map((el) => {
        const r = el.getBoundingClientRect();
        return { l: r.left, r: r.right, w: r.width, h: r.height, display: getComputedStyle(el).display };
      }));
      expect(cards).toHaveLength(12);
      for (const c of cards) {
        expect(c.display).not.toBe('none');
        expect(c.l).toBeGreaterThanOrEqual(0);
        expect(c.r).toBeLessThanOrEqual(width);
        expect(c.w).toBeGreaterThan(60);
      }
      const clients = await box(page, '#inicio .hero-clients');
      const art = await box(page, '#inicio .hero-art');
      const overlapY = Math.min(clients.bottom, art.bottom) - Math.max(clients.top, art.top);
      expect(overlapY > 0.5, 'el collage y los clientes se cruzan').toBe(false);
    });
  }

  test('SC 1.4.12: con el espaciado de texto ampliado los nombres no se recortan a 320 px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto('/');
    await page.addStyleTag({
      content: '*{line-height:1.5 !important;letter-spacing:.12em !important;word-spacing:.16em !important} p{margin-bottom:2em !important}',
    });
    const fits = await page.locator(`${LIST} > li`).evaluateAll((els) => els.map((li) => {
      const name = li.querySelector('.client-name')!.getBoundingClientRect();
      const card = li.getBoundingClientRect();
      return {
        inside: name.left >= card.left - 0.5 && name.right <= card.right + 0.5 && name.bottom <= card.bottom + 0.5,
        clipped: li.scrollWidth > li.clientWidth + 1 || li.scrollHeight > li.clientHeight + 1,
      };
    }));
    for (const f of fits) {
      expect(f.inside).toBe(true);
      expect(f.clipped).toBe(false);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
  });

  test('sin movimiento ni terceros: sin animaciones, todas las imágenes de logos del mismo origen', async ({ page }) => {
    const external: string[] = [];
    const logoBytes: number[] = [];
    page.on('response', async (res) => {
      if (/\/_astro\/(holafly|hubspot|unilever|alchemy|ambl|travelperk|skale|sendlane|chartmogul|holded|flodesk|piktochart)\./.test(new URL(res.url()).pathname)) logoBytes.push((await res.body()).length);
    });
    page.on('request', (req) => {
      const url = new URL(req.url());
      if (/\.(webp|png|avif|jpg|svg)$/.test(url.pathname) && url.origin !== 'http://localhost:4322') external.push(req.url());
      if (/ariannalupi\.com/.test(url.hostname)) external.push(req.url());
    });
    await page.goto('/');
    await page.locator(LIST).scrollIntoViewIfNeeded();
    await page.locator(`${LIST} img`).last().scrollIntoViewIfNeeded();
    await page.waitForLoadState('networkidle');
    expect(external).toEqual([]);
    // Presupuesto de los 12 logos (lazy, fuera del LCP): cada uno de 8 KB o menos y en conjunto 32 KB o menos.
    expect(logoBytes).toHaveLength(12);
    for (const b of logoBytes) expect(b).toBeLessThanOrEqual(8192);
    expect(logoBytes.reduce((a, b) => a + b, 0)).toBeLessThanOrEqual(32768);
    const animated = await page.locator('#inicio .hero-clients').evaluate((el) => el.getAnimations({ subtree: true }).length);
    expect(animated).toBe(0);
    const loaded = await page.locator(`${LIST} img`).evaluateAll((imgs) => imgs.every((i) => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth === 128));
    expect(loaded).toBe(true);
  });

  test('el orden de tabulación del hero no cambia: los párrafos y las tarjetas no son enfocables', async ({ page }) => {
    await page.goto('/');
    expect(await page.locator('#inicio .hero-desc [tabindex], #inicio .hero-clients [tabindex]').count()).toBe(0);
    const focusables = await page.locator('#inicio a[href], #inicio button, #inicio [tabindex]').count();
    expect(focusables).toBe(1);
    await page.locator('#inicio a[data-cta="hero"]').focus();
    await page.keyboard.press('Tab');
    const active = await page.evaluate(() => document.activeElement?.closest('#inicio') ? 'dentro' : 'fuera');
    expect(active).toBe('fuera');
  });
});

import { test, expect } from '@playwright/test';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const viewports = [
  { name: '1280 px', width: 1280, height: 800 },
  { name: '390 px', width: 390, height: 844 },
];

for (const vp of viewports) {
  test.describe(`foco al h2 de #agenda a ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test('(a) clic en el CTA del hero enfoca el h2 y deja el hash en #agenda', async ({ page }) => {
      await page.goto('/');
      await page.locator('a[data-cta="hero"]').click();
      await expect(page.locator('#agenda-title')).toBeFocused();
      expect(new URL(page.url()).hash).toBe('#agenda');
    });

    test('(b) segundo clic con el hash ya en #agenda vuelve a enfocar el h2', async ({ page }) => {
      await page.goto('/');
      await page.locator('a[data-cta="hero"]').click();
      await expect(page.locator('#agenda-title')).toBeFocused();
      await page.evaluate(() => {
        (document.activeElement as HTMLElement | null)?.blur();
        window.scrollTo(0, 0);
      });
      await expect(page.locator('#agenda-title')).not.toBeFocused();
      expect(new URL(page.url()).hash).toBe('#agenda');
      await page.locator('a[data-cta="hero"]').click();
      await expect(page.locator('#agenda-title')).toBeFocused();
    });

    test('(c) Enter sobre el CTA enfoca el h2', async ({ page }) => {
      await page.goto('/');
      await page.locator('a[data-cta="hero"]').focus();
      await page.keyboard.press('Enter');
      await expect(page.locator('#agenda-title')).toBeFocused();
    });

    test('(d) cargar /#agenda directamente enfoca el h2', async ({ page }) => {
      await page.goto('/#agenda');
      await expect(page.locator('#agenda-title')).toBeFocused();
    });
  });
}

// Con ClickUp bloqueado (bloqueador de terceros o red caída) el salto de ancla termina más tarde y
// puede vaciar el foco después de que el script lo puso. No usa la red real: las rutas se abortan.
test('(d2) cargar /#agenda con ClickUp bloqueado enfoca el h2 y lo mantiene tras la ventana de reintento', async ({ browser }) => {
  for (let run = 0; run < 3; run += 1) {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.route(/^https:\/\/(forms|app-cdn)\.clickup\.com\//, (route) => route.abort());
    await page.goto('/#agenda');
    await page.waitForTimeout(2000);
    await expect(page.locator('#agenda-title'), `corrida ${run + 1}`).toBeFocused();
    await context.close();
  }
});

function listJs(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...listJs(full));
    else if (name.endsWith('.js')) out.push(full);
  }
  return out;
}

test('(e) el único JS propio del build es el script de foco y pesa menos de 3 KB', () => {
  const dist = resolve('dist');
  const html = readFileSync(join(dist, 'index.html'), 'utf8');

  const own: { src?: string; code: string }[] = [];
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const attrs = match[1];
    const src = /\bsrc\s*=\s*["']([^"']+)["']/i.exec(attrs)?.[1];
    if (src?.includes('app-cdn.clickup.com')) continue;
    if (/\btype\s*=\s*["']application\/ld\+json["']/i.test(attrs)) continue;
    if (src) {
      const file = join(dist, src.replace(/^\//, ''));
      expect(existsSync(file), `el script ${src} debe existir en dist`).toBe(true);
      own.push({ src, code: readFileSync(file, 'utf8') });
    } else {
      own.push({ code: match[2] });
    }
  }

  expect(own, 'debe haber exactamente una etiqueta <script> propia').toHaveLength(1);
  expect(own[0].code).toContain('agenda-title');

  // Suma: todo .js bajo dist más los scripts propios en línea (sin contar dos veces
  // el que apunta por src, que ya está entre los .js de dist).
  const jsBytes = listJs(dist).reduce((sum, f) => sum + statSync(f).size, 0);
  const inlineBytes = own.filter((s) => !s.src).reduce((sum, s) => sum + Buffer.byteLength(s.code), 0);
  const total = jsBytes + inlineBytes;
  console.log(`JS propio: ${own[0].src ? `archivo ${own[0].src}` : 'inlinado en dist/index.html'}, ${total} bytes`);
  expect(total).toBeLessThan(3072);
});

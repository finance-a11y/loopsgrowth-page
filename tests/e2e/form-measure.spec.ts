import { test, expect, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';

/*
 * FORM-04: mide la altura real del formulario de ClickUp dentro del iframe de la landing,
 * comprueba que el script `forms-embed/v1.js` se engancha al iframe con `loading="lazy"`, que
 * el CLS mientras carga es menor a 0.1 y que `--form-min-h-sm` / `--form-min-h-lg` reservan la
 * altura medida sin excederse.
 *
 * SOLO LECTURA. Este spec no llena, no hace clic y no envía nada dentro del formulario real
 * (crearía una tarea en la Lista de ClickUp de Ari). Solo observa el iframe y lee su marco.
 *
 * Por qué se mide el contenido y no `style.height`: el formulario de ClickUp usa `height: 100%`
 * y un contenedor interno con scroll (`cu-form`, `overflow: auto`), así que el hijo de
 * iframe-resizer solo reporta la altura que ya tiene el iframe (su `min-height` o 150 px) y
 * nunca la del contenido. Medir `style.height` con el `min-height` vigente devolvería siempre
 * ese mismo `min-height` (medición circular). Para medir el contenido real, la fase
 * "natural" abre la página con el `min-height` del iframe anulado en NUESTRA página (no toca
 * el formulario) y lee el `scrollHeight` del contenedor interno del formulario.
 *
 * Depende de la red (forms.clickup.com y app-cdn.clickup.com). Si falla el enganche del script
 * o no aparece ningún campo, comprueba con curl antes de tocar código o tokens.
 */

const WIDTHS = [320, 390, 768, 1024, 1280] as const;
const VIEWPORT_HEIGHT = 900;
const POLL_MS = 500;
const POLL_TIMEOUT_MS = 30_000;
const STABLE_SAMPLES = 3;
/** Holgura hacia arriba por variación de render (px) y reserva máxima hacia abajo (px). */
const UP_SLACK = 8;
const DOWN_SLACK = 40;

const IFRAME = '#agenda iframe.clickup-embed';

type Row = {
  width: number;
  card: number;
  /** Altura natural del contenido del formulario (scrollHeight de cu-form con el iframe sin reserva). */
  measured: number;
  /** `min-height` calculado del iframe tal como se publica (tokens de tokens.css). */
  minHeight: number;
  /** Alto renderizado del iframe publicado. */
  rendered: number;
  /** `style.height` en línea que deja `forms-embed/v1.js` en el iframe publicado. */
  styleHeight: string;
  /** `style.height` que deja el script cuando el iframe no tiene reserva (natural). */
  styleHeightNatural: string;
  /** El auto-resize de ClickUp sigue al contenido (style.height natural ≈ contenido)? */
  autoresizeTracksContent: boolean;
  /** Scroll interno del formulario con la reserva publicada (scrollHeight - clientHeight de cu-form). */
  innerScroll: number;
  cls: number;
  visibleFields: number;
  lang: string;
  sample: string;
};

const rows: Row[] = [];

async function inlineHeight(page: Page): Promise<string> {
  return page.locator(IFRAME).evaluate((el) => (el as HTMLIFrameElement).style.height);
}

/** Sondea hasta que un valor no vacío se repita `STABLE_SAMPLES` veces seguidas o venza el tope. */
async function pollStable(page: Page, read: () => Promise<string>): Promise<string> {
  const t0 = Date.now();
  let last = '';
  let stable = 0;
  while (Date.now() - t0 < POLL_TIMEOUT_MS) {
    const v = await read();
    if (v !== '' && v === last) {
      stable += 1;
    } else {
      stable = v !== '' ? 1 : 0;
      last = v;
    }
    if (stable >= STABLE_SAMPLES) break;
    await page.waitForTimeout(POLL_MS);
  }
  return last;
}

/** `scrollHeight:clientHeight` del contenedor interno del formulario (`cu-form`); '' mientras no exista. */
function frameScroll(page: Page) {
  return page
    .frameLocator(IFRAME)
    .locator('html')
    .evaluate(() => {
      const el = document.querySelector('cu-form');
      return el ? `${el.scrollHeight}:${el.clientHeight}` : '';
    });
}

test.describe.configure({ mode: 'serial' });

for (const width of WIDTHS) {
  test(`medición del formulario a ${width} px`, async ({ page, context }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });

    // Fase natural: iframe sin reserva (solo nuestra página; el formulario no se toca).
    const natural = await context.newPage();
    await natural.setViewportSize({ width, height: VIEWPORT_HEIGHT });
    await natural.addInitScript(() => {
      document.addEventListener('DOMContentLoaded', () => {
        const s = document.createElement('style');
        s.textContent = '#agenda iframe.clickup-embed { min-height: 0 !important; }';
        document.head.appendChild(s);
      });
    });
    await natural.goto('/');
    await natural.locator(IFRAME).scrollIntoViewIfNeeded();
    const naturalRead = await pollStable(natural, async () => {
      // Solo cuenta cuando el formulario ya pintó: `cu-form` existe y su contenido supera los 300 px.
      const v = await frameScroll(natural).catch(() => '');
      return parseFloat(v.split(':')[0] ?? '0') > 300 ? v : '';
    });
    const measured = parseFloat(naturalRead.split(':')[0] || '0');
    const styleHeightNatural = await inlineHeight(natural);
    await natural.close();

    // Fase publicada: los tokens reales, con el observador de CLS.
    await page.addInitScript(() => {
      (window as unknown as { __cls: number }).__cls = 0;
      try {
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as unknown as Array<{ value: number; hadRecentInput: boolean }>) {
            if (!entry.hadRecentInput) (window as unknown as { __cls: number }).__cls += entry.value;
          }
        }).observe({ type: 'layout-shift', buffered: true });
      } catch {
        /* el navegador no soporta layout-shift: el CLS queda en 0 y la aserción lo dirá */
      }
    });

    await page.goto('/');
    const iframe = page.locator(IFRAME);
    await iframe.scrollIntoViewIfNeeded();

    // El script de ClickUp fija un `style.height` en línea sobre el iframe (aun con carga diferida).
    const styleHeight = await pollStable(page, () => inlineHeight(page));

    const frame = page.frameLocator(IFRAME);
    const fields = frame.locator('input:not([type=hidden]):visible, textarea:visible, select:visible');
    await expect(fields.first(), 'hay al menos un campo visible dentro del marco').toBeVisible({ timeout: 30_000 });
    const visibleFields = await fields.count();

    const lang = await frame.locator('html').evaluate((el) => (el as HTMLElement).lang || '(sin lang)');
    const sample = await frame
      .locator('body')
      .evaluate((el) => (el as HTMLElement).innerText.replace(/\s+/g, ' ').trim().slice(0, 240));

    // Deja pasar cualquier último reajuste antes de leer el CLS y el scroll interno.
    await page.waitForTimeout(1000);

    const card = await page.locator('#agenda .form-embed').evaluate((el) => el.getBoundingClientRect().width);
    const minHeight = await iframe.evaluate((el) => parseFloat(getComputedStyle(el).minHeight));
    const rendered = await iframe.evaluate((el) => el.getBoundingClientRect().height);
    const [sh = 0, ch = 0] = (await frameScroll(page)).split(':').map(Number);
    const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);

    rows.push({
      width,
      card: Math.round(card),
      measured,
      minHeight,
      rendered: Math.round(rendered),
      styleHeight,
      styleHeightNatural,
      autoresizeTracksContent: Math.abs(parseFloat(styleHeightNatural) - measured) <= UP_SLACK,
      innerScroll: Math.max(0, sh - ch),
      cls: Number(cls.toFixed(4)),
      visibleFields,
      lang,
      sample,
    });

    expect(measured, `altura natural del formulario a ${width} px (0 = no cargó: red o bloqueo si curl falla)`).toBeGreaterThan(300);
    // (1) El script de ClickUp se enganchó al iframe con carga diferida.
    expect(styleHeight, `style.height del iframe a ${width} px: el script de ClickUp no se enganchó (red o bloqueo si curl falla)`).not.toBe('');
    // (2) CLS bajo el umbral.
    expect(cls, `CLS acumulado a ${width} px`).toBeLessThan(0.1);
  });
}

test('la reserva de altura de los tokens cubre lo medido sin excederse', async () => {
  expect(rows.length, 'se midieron los cinco anchos').toBe(WIDTHS.length);

  console.table(
    rows.map((r) => ({
      ancho: r.width,
      tarjeta: r.card,
      contenido: r.measured,
      minHeight: r.minHeight,
      iframe: r.rendered,
      scrollInterno: r.innerScroll,
      resizeSigueContenido: r.autoresizeTracksContent,
      CLS: r.cls,
      campos: r.visibleFields,
      lang: r.lang,
    })),
  );

  mkdirSync('test-results', { recursive: true });
  writeFileSync('test-results/form-measure.json', JSON.stringify({ date: new Date().toISOString(), rows }, null, 2));

  const ranges: Array<{ token: string; widths: number[] }> = [
    { token: '--form-min-h-sm', widths: [320, 390, 768] },
    { token: '--form-min-h-lg', widths: [1024, 1280] },
  ];

  for (const { token, widths } of ranges) {
    const inRange = rows.filter((r) => widths.includes(r.width));
    const max = Math.max(...inRange.map((r) => r.measured));
    const atMax = inRange.find((r) => r.measured === max)!;
    const reserved = atMax.minHeight;

    // Todos los anchos del rango caben en la reserva (con holgura de render).
    for (const r of inRange) {
      expect(
        r.measured,
        `${token}: a ${r.width} px el formulario (${r.measured}) excede la reserva (${r.minHeight}) en más de ${UP_SLACK} px`,
      ).toBeLessThanOrEqual(r.minHeight + UP_SLACK);
    }
    // Con la reserva publicada el formulario no queda con scroll interno (evita la trampa de scroll).
    for (const r of inRange) {
      expect(r.innerScroll, `${token}: a ${r.width} px el formulario tiene scroll interno de ${r.innerScroll} px con la reserva publicada`).toBeLessThanOrEqual(UP_SLACK);
    }
    // La reserva no supera lo medido más alto en más de 40 px.
    expect(
      reserved - max,
      `${token}: la reserva (${reserved}) supera en más de ${DOWN_SLACK} px la mayor altura medida (${max})`,
    ).toBeLessThanOrEqual(DOWN_SLACK);
  }
});

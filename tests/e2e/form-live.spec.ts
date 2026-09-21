import { test, expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';

/*
 * FORM-05, comprobación previa (SOLO LECTURA). Abre la landing, lleva el iframe a la vista y
 * comprueba que el formulario real de ClickUp se renderiza dentro del marco a 1280 y 390 px.
 * Deja en `test-results/form-fields.json` la lista de campos y textos visibles para que Juan
 * sepa qué llenar, y una captura de `#agenda` por ancho.
 *
 * Este spec NO llena, NO hace clic dentro del formulario y NO lo envía: un envío crea una
 * tarea real en la Lista de ClickUp de Ari. Los dos únicos envíos de la fase son humanos
 * (bloques `human-check` del Plan 04). Las capturas y el JSON quedan fuera de git.
 *
 * Depende de la red (forms.clickup.com y app-cdn.clickup.com): si falla, comprueba con curl
 * antes de tocar código.
 */

const VIEWPORTS = [
  { name: '1280 px', width: 1280, height: 800 },
  { name: '390 px', width: 390, height: 844 },
] as const;

type FieldInfo = { tag: string; type: string | null; label: string | null; placeholder: string | null; required: boolean };
type Snapshot = {
  width: number;
  lang: string;
  visibleFields: number;
  fields: FieldInfo[];
  buttons: string[];
  hiddenInputNames: string[];
  lines: string[];
};

const snapshots: Record<string, Snapshot> = {};

test.describe.configure({ mode: 'serial' });

for (const vp of VIEWPORTS) {
  test(`el formulario se renderiza dentro del iframe a ${vp.name} (solo lectura)`, async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto('/');

    const iframe = page.locator('#agenda iframe.clickup-embed');
    await iframe.scrollIntoViewIfNeeded();

    const frame = page.frameLocator('#agenda iframe.clickup-embed');
    const fields = frame.locator('input:not([type=hidden]):visible, textarea:visible, select:visible');
    await expect(fields.first(), `hay al menos un campo visible dentro del marco a ${vp.name}`).toBeVisible({ timeout: 30_000 });
    const visibleFields = await fields.count();
    expect(visibleFields).toBeGreaterThanOrEqual(1);

    // Lectura del marco (Playwright permite evaluar dentro de iframes de origen distinto).
    const data = await frame.locator('html').evaluate((html) => {
      const vis = (e: Element) => {
        const r = e.getBoundingClientRect();
        const s = getComputedStyle(e);
        return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none';
      };
      const fieldEls = [...document.querySelectorAll('input:not([type=hidden]), textarea, select')].filter(vis) as Array<
        HTMLInputElement
      >;
      return {
        lang: (html as HTMLElement).lang || '(sin lang)',
        fields: fieldEls.map((e) => ({
          tag: e.tagName,
          type: e.type || null,
          label: e.labels && e.labels[0] ? e.labels[0].innerText.replace(/\s+/g, ' ').trim() : null,
          placeholder: e.placeholder || null,
          required: e.required || e.getAttribute('aria-required') === 'true',
        })),
        buttons: [...document.querySelectorAll('button, [role=button]')]
          .filter(vis)
          .map((e) => (e as HTMLElement).innerText.replace(/\s+/g, ' ').trim())
          .filter(Boolean),
        hiddenInputNames: [...document.querySelectorAll('input[type=hidden]')].map(
          (e) => (e as HTMLInputElement).name || (e as HTMLInputElement).id || '(sin nombre)',
        ),
        lines: (document.body as HTMLElement).innerText
          .split('\n')
          .map((l) => l.replace(/\s+/g, ' ').trim())
          .filter(Boolean),
      };
    });

    snapshots[vp.name] = { width: vp.width, visibleFields, ...data };

    mkdirSync('test-results', { recursive: true });
    await page.locator('#agenda').screenshot({ path: `test-results/agenda-${vp.width}.png` });
    writeFileSync(
      'test-results/form-fields.json',
      JSON.stringify({ date: new Date().toISOString(), viewports: snapshots }, null, 2),
    );
  });
}

test('form-fields.json lista al menos un campo visible', async () => {
  const all = Object.values(snapshots);
  expect(all.length, 'se comprobaron los dos anchos').toBe(VIEWPORTS.length);
  for (const s of all) {
    expect(s.fields.length, `campos visibles a ${s.width} px`).toBeGreaterThanOrEqual(1);
  }
});

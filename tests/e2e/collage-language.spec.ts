import { test, expect, type Page } from '@playwright/test';
import { rgbOfToken } from './lib/brand';
import { CHIP_WORDS } from '../../src/components/collage/collage-rules.mjs';
import { PHOTO_SLOTS, SCENES as SCENE_DATA } from '../../src/components/collage/scenes.mjs';
import { PHOTOS, chosenPhoto } from '../../src/components/collage/photos.mjs';
import { expectMotionWithinBudget, expectNoMotion } from './lib/motion';

// Lenguaje del moodboard sobre el HTML construido (plan 02-10): rasgos por estructura, píldoras
// decorativas, cajas, árbol de accesibilidad, ranuras de foto, ganchos, pesos y espaciado de texto.

const WORDS: string[] = CHIP_WORDS.map((w: { word: string }) => w.word);
const WIDTHS = [320, 390, 768, 1024, 1280];

/** Escenas de la página `/` que este spec revisa (selector de la raíz). */
const SCENES: Record<string, string> = {
  hero: '.hero-collage[data-collage="hero"]',
  whynow: '#por-que-ahora [data-collage-scene="whynow"]',
  'sticker-clic': '#problema [data-collage-scene="sticker-clic"]',
  'sticker-lupa': '#problema [data-collage-scene="sticker-lupa"]',
  'sticker-ojos': '#problema [data-collage-scene="sticker-ojos"]',
  'chip-lupa': '#solucion [data-collage-scene="chip-lupa"]',
  'chip-ojos': '#solucion [data-collage-scene="chip-ojos"]',
  'chip-loop': '#solucion [data-collage-scene="chip-loop"]',
  'chip-clic': '#solucion [data-collage-scene="chip-clic"]',
};
const MINIS = Object.keys(SCENES).filter((n) => n.startsWith('sticker-') || n.startsWith('chip-'));
const FULL = ['hero', 'whynow'];
const NAMES = Object.keys(SCENES);

/** Rasgos por estructura que debe traer cada escena (los mismos de REQUIRED_TRAITS, más ranura). */
const expectedTraits = (name: string): string[] => {
  const kinds = new Set((SCENE_DATA[name].layers as { kind: string }[]).map((l) => l.kind));
  const t = ['stage', 'shadow', 'pill', 'doodle'];
  if (FULL.includes(name)) t.push('dots', 'slot');
  if (kinds.has('loopy')) t.push('loopy');
  if (chosenPhoto(name)) t.push('photo'); // el marco de la foto es un hermano de la ranura (plan 02-11)
  return t.sort();
};

/** Colores efectivos de una escena: rellenos y trazos del svg, fondos de píldora y `--cf-a` de los garabatos. */
const paletteOf = (root: import('@playwright/test').Locator) =>
  root.evaluate((el) => {
    const probe = document.createElement('i');
    document.body.appendChild(probe);
    const resolve = (v: string) => {
      probe.style.color = '';
      probe.style.color = v;
      return getComputedStyle(probe).color;
    };
    const out = new Set<string>();
    for (const e of el.querySelectorAll('svg *')) {
      const cs = getComputedStyle(e);
      out.add(cs.fill);
      out.add(cs.stroke);
      const cf = (e.getAttribute('style') ?? '').match(/--cf-a:([^;]+)/)?.[1];
      if (cf) out.add(resolve(cf));
    }
    for (const e of el.querySelectorAll('[data-pill]')) out.add(getComputedStyle(e).backgroundColor);
    probe.remove();
    return [...out];
  });

async function open(page: Page, width: number) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto('/');
  // Las geometrías se miden en reposo: la entrada del hero (02-07) dura 1 s y mueve las piezas mientras corre.
  await page.waitForFunction(() => document.getAnimations().length === 0, null, { timeout: 5000 });
}

test.describe('escenas: lenguaje del moodboard', () => {
  test('cada escena existe una vez (hero, Por qué ahora, tres pegatinas y cuatro chips)', async ({ page }) => {
    await open(page, 1280);
    for (const name of NAMES) await expect(page.locator(SCENES[name]), name).toHaveCount(1);
    // Las piezas sueltas (la lupa de Casos de éxito) y los avatares de Quiénes somos (plan 02-05) no son escenas:
    // se cuentan aparte y son exactamente una pieza y un avatar (los otros tres integrantes llevan foto, quick 260920-team-photos).
    // Más la escena `agenda` del CTA final (plan 02-06), que mide `closing-sections.spec.ts`: raíz `div`,
    // dos píldoras, caja y separación de la tarjeta.
    await expect(
      page.locator('[data-collage]:not(svg.collage-sprite):not([data-collage="piece"]):not([data-collage="avatar"])'),
    ).toHaveCount(NAMES.length + 1);
    await expect(page.locator('#agenda [data-collage="agenda"]')).toHaveCount(1);
    await expect(page.locator('[data-collage="piece"]')).toHaveCount(1);
    await expect(page.locator('[data-collage="avatar"]')).toHaveCount(1);
  });

  for (const name of NAMES) {
    test(`${name}: rasgos por estructura (escenario, sombra, Loopy, garabato, retícula, píldora y ranura)`, async ({ page }) => {
      await open(page, 1280);
      const traits = await page.locator(SCENES[name]).evaluate((el) => [...new Set([...el.querySelectorAll('[data-trait]')].map((e) => e.getAttribute('data-trait')))].sort());
      expect(traits).toEqual(expectedTraits(name));
    });

    test(`${name}: paleta con el morado de marca y el amarillo o el naranja`, async ({ page }) => {
      await open(page, 1280);
      const palette = await paletteOf(page.locator(SCENES[name]));
      expect(palette).toContain(rgbOfToken('purple'));
      expect(palette.includes(rgbOfToken('yellow')) || palette.includes(rgbOfToken('orange'))).toBe(true);
    });
  }

  test('píldoras: palabra de la lista, ocultas a tecnologías de asistencia y sin foco', async ({ page }) => {
    await open(page, 1280);
    const pills = await page.locator('[data-collage] [data-pill]').evaluateAll((els) =>
      els.map((e) => ({
        text: (e.textContent ?? '').trim(),
        word: e.getAttribute('data-pill'),
        hidden: !!e.closest('[aria-hidden="true"]'),
        tabindex: e.getAttribute('tabindex'),
        interactive: !!e.closest('a, button, input, select, textarea, [tabindex]:not(main)'),
        lang: e.getAttribute('lang'),
      })),
    );
    // hero (2), por qué ahora (2), pegatinas (3), chips (4) y la escena `agenda` de #agenda (2, plan 02-06).
    expect(pills.length).toBe(2 + 2 + 3 + 4 + 2);
    for (const p of pills) {
      expect(WORDS).toContain(p.text);
      expect(p.word).toBe(p.text);
      expect(p.hidden).toBe(true);
      expect(p.tabindex).toBeNull();
      expect(p.interactive).toBe(false);
      const entry = CHIP_WORDS.find((w: { word: string }) => w.word === p.text);
      if (entry.lang === 'en') expect(p.lang).toBe('en');
    }
  });

  for (const width of WIDTHS) {
    test(`caja: nada de lo pintado ni ninguna píldora sale de la raíz de ninguna escena a ${width} px`, async ({ page }) => {
      await open(page, width);
      const bad: string[] = [];
      for (const name of NAMES) {
        const out = await page.locator(SCENES[name]).evaluate((root) => {
          const r = root.getBoundingClientRect();
          const out: string[] = [];
          for (const el of root.querySelectorAll('[data-trait], [data-pill]')) {
            const b = el.getBoundingClientRect();
            if (b.left < r.left - 0.5 || b.right > r.right + 0.5 || b.top < r.top - 0.5 || b.bottom > r.bottom + 0.5) {
              out.push(`${el.getAttribute('data-trait')}:${el.getAttribute('data-pill') ?? ''}`);
            }
          }
          return out;
        });
        bad.push(...out.map((o) => `${name}/${o}`));
      }
      expect(bad).toEqual([]);
    });
  }

  test('accesibilidad: el árbol de main es idéntico con y sin el collage, y la comprobación no es vacía', async ({ page }) => {
    await open(page, 1280);
    const withCollage = await page.locator('main').ariaSnapshot();
    await page.evaluate(() => document.querySelectorAll('[data-collage]').forEach((e) => e.remove()));
    const without = await page.locator('main').ariaSnapshot();
    expect(without).toBe(withCollage);
    // mutación: quitar aria-hidden de la raíz y de una píldora cambia el árbol
    await open(page, 1280);
    await page.evaluate(() => {
      const root = document.querySelector('.hero-collage[data-collage="hero"]') as HTMLElement;
      root.removeAttribute('aria-hidden');
      root.querySelector('[data-pill]')?.setAttribute('aria-hidden', 'false');
    });
    const mutated = await page.locator('main').ariaSnapshot();
    expect(mutated).not.toBe(withCollage);
  });

  test('ranuras: exactamente dos (hero y whynow), sin imagen y con la proporción de PHOTO_SLOTS', async ({ page }) => {
    await open(page, 1280);
    const names = await page.locator('[data-photo-slot]').evaluateAll((els) => els.map((e) => e.getAttribute('data-photo-slot')));
    expect(names.sort()).toEqual(['hero', 'whynow']);
    for (const name of names) {
      const slot = page.locator(`[data-photo-slot="${name}"]`);
      await expect(slot.locator('img, image')).toHaveCount(0); // la ranura svg sigue sin imagen; la foto es un hermano suyo (02-11)
      const box = await slot.evaluate((el) => {
        const b = el.getBoundingClientRect();
        return b.width / b.height;
      });
      const spec = PHOTO_SLOTS.find((s: { name: string }) => s.name === name);
      expect(Math.abs(box - spec.w / spec.h)).toBeLessThan(0.02);
    }
  });

  // Lote B (02-03): desde 64em el collage ocupa el ancho de su columna con tope de 26rem (416 px).
  test('Por qué ahora: 224 px justo bajo 64em y de 320 a 416 px desde 64em', async ({ page }) => {
    for (const [width, min, max] of [[1023, 224, 224], [1024, 320, 416], [1280, 320, 416]] as const) {
      await open(page, width);
      const w = await page.locator(SCENES.whynow).evaluate((el) => el.getBoundingClientRect().width);
      expect(w, `${width}: ${w}`).toBeGreaterThanOrEqual(min - 1);
      expect(w, `${width}: ${w}`).toBeLessThanOrEqual(max + 1);
    }
  });

  test('ganchos: dos pupilas path dentro del Loopy y grupos sin transform', async ({ page }) => {
    // La entrada de 02-07 anima el transform de cada grupo mientras dura; el reposo (`reduce`) no lleva ninguno.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page, 1280);
    const pupils = await page.locator('.hero-collage .hc-pupil').evaluateAll((els) =>
      els.map((e) => ({ tag: e.tagName.toLowerCase(), inLoopy: !!e.closest('[data-piece="loopy"]') })),
    );
    expect(pupils).toEqual([{ tag: 'path', inLoopy: true }, { tag: 'path', inLoopy: true }]);
    const transforms = await page.locator('.hero-collage [data-piece]').evaluateAll((els) => els.map((e) => getComputedStyle(e).transform));
    expect(transforms.every((t) => t === 'none')).toBe(true);
  });

  test('cero animaciones con reduce y con no-preference', async ({ page }) => {
    for (const reducedMotion of ['reduce', 'no-preference'] as const) {
      await page.emulateMedia({ reducedMotion });
      await open(page, 1280);
      if (reducedMotion === 'reduce') await expectNoMotion(page);
      else await expectMotionWithinBudget(page);
    }
  });

  for (const width of [320, 1280]) {
    test(`espaciado de texto (SC 1.4.12) a ${width} px: sin desborde y píldoras sin recorte`, async ({ page }) => {
      await open(page, width);
      await page.addStyleTag({ content: '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; }' });
      const doc = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
      expect(doc).toBe(true);
      const clipped = await page.locator('[data-collage] [data-pill]').evaluateAll((els) => els.filter((e) => e.scrollWidth > e.clientWidth + 1).length);
      expect(clipped).toBe(0);
    });
  }

  test('pesos: hero menor a 8832 bytes, cada mini menor a 1536, Por qué ahora menor a 3712 y sprite menor a 10240', async ({ page }) => {
    await open(page, 1280);
    const bytes = (name: string) => page.locator(SCENES[name]).evaluate((el) => new TextEncoder().encode(el.outerHTML).length);
    expect(await bytes('hero')).toBeLessThan(8832);
    expect(await bytes('whynow')).toBeLessThan(3712);
    for (const name of MINIS) expect(await bytes(name), name).toBeLessThan(1536);
    const sprite = await page.locator('svg.collage-sprite').evaluate((el) => new TextEncoder().encode(el.outerHTML).length);
    expect(sprite).toBeLessThan(10240);
  });
});

test.describe('escenas: sin JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('cada raíz y sus píldoras son visibles', async ({ page }) => {
    await page.goto('/');
    for (const name of NAMES) await expect(page.locator(SCENES[name]), name).toBeVisible();
    for (const pill of await page.locator('[data-collage] [data-pill]').all()) await expect(pill).toBeVisible();
  });
});

// ---------------------------------------------------------------------------------------------
// La hoja de revisión: las diez composiciones enmarcadas y los cuatro avatares (tarea 3)
// ---------------------------------------------------------------------------------------------

const SHEET = '/marca/hoja/';
const AVATARS = ['avatar-ojo-morado', 'avatar-ojo-amarillo', 'avatar-ojos-morado', 'avatar-ojos-amarillo'];
const SHEET_NAMES = ['hero', 'whynow', 'agenda', ...MINIS, ...AVATARS];
const onSheet = (name: string) => `[data-demo="${name}"] [data-collage-scene="${name}"]`;

/** Rasgos por estructura derivados de las capas de la escena (la sombra viene de las copias desplazadas). */
const traitsOfData = (name: string): string[] => {
  const layers = SCENE_DATA[name].layers as { kind: string; shadow?: unknown }[];
  const byKind: Record<string, string> = { disc: 'stage', slot: 'slot', loopy: 'loopy', doodle: 'doodle', dots: 'dots', pill: 'pill' };
  const t = new Set(layers.map((l) => byKind[l.kind]));
  if (layers.some((l) => l.kind !== 'pill' && l.shadow)) t.add('shadow');
  if (chosenPhoto(name)) t.add('photo');
  return [...t].sort();
};

async function openSheet(page: Page, width: number) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(SHEET);
}

test.describe('hoja: escenas del lenguaje del moodboard', () => {
  test('cada escena de la hoja está una vez dentro de su data-demo con su nombre', async ({ page }) => {
    await openSheet(page, 1280);
    for (const name of SHEET_NAMES) await expect(page.locator(onSheet(name)), name).toHaveCount(1);
    expect(SHEET_NAMES).toHaveLength(14);
  });

  for (const name of SHEET_NAMES) {
    test(`hoja, ${name}: rasgos por estructura`, async ({ page }) => {
      await openSheet(page, 1280);
      const traits = await page.locator(onSheet(name)).evaluate((el) => [...new Set([...el.querySelectorAll('[data-trait]')].map((e) => e.getAttribute('data-trait')))].sort());
      expect(traits).toEqual(traitsOfData(name));
      if (name.startsWith('avatar-')) expect(traits).not.toContain('pill');
    });

    if (!name.startsWith('avatar-')) {
      test(`hoja, ${name}: paleta con el morado de marca y el amarillo o el naranja`, async ({ page }) => {
        await openSheet(page, 1280);
        // El fondo de la banda cuenta: en agenda el morado es el fondo de la sección y no un relleno del svg.
        const root = page.locator(onSheet(name));
        const ground = await root.evaluate((el) => getComputedStyle(el.closest('[data-tone]')!).backgroundColor);
        const palette = [...(await paletteOf(root)), ground];
        expect(palette).toContain(rgbOfToken('purple'));
        expect(palette.includes(rgbOfToken('yellow')) || palette.includes(rgbOfToken('orange'))).toBe(true);
      });
    }
  }

  test('las píldoras de las composiciones: palabra de la lista, ocultas a tecnologías de asistencia y sin foco', async ({ page }) => {
    await openSheet(page, 1280);
    const pills = await page.locator('[data-collage] [data-pill]').evaluateAll((els) =>
      els.map((e) => ({ text: (e.textContent ?? '').trim(), word: e.getAttribute('data-pill'), hidden: !!e.closest('[aria-hidden="true"]'), tabindex: e.getAttribute('tabindex'), lang: e.getAttribute('lang') })),
    );
    // hero, whynow y agenda (2 cada una), 7 chips y, en la hoja de fotos, las 2 píldoras de la escena de cada candidata
    expect(pills.length).toBe(2 + 2 + 2 + 7 + 2 * PHOTOS.length);
    for (const p of pills) {
      expect(WORDS).toContain(p.text);
      expect(p.word).toBe(p.text);
      expect(p.hidden).toBe(true);
      expect(p.tabindex).toBeNull();
      const entry = CHIP_WORDS.find((w: { word: string }) => w.word === p.text);
      if (entry.lang === 'en') expect(p.lang).toBe('en');
    }
  });

  for (const width of WIDTHS) {
    test(`hoja: nada de lo pintado ni ninguna píldora sale de la raíz de ninguna escena a ${width} px`, async ({ page }) => {
      await openSheet(page, width);
      const bad: string[] = [];
      for (const name of SHEET_NAMES) {
        const out = await page.locator(onSheet(name)).evaluate((root) => {
          if (getComputedStyle(root).display === 'none') return [];
          const r = root.getBoundingClientRect();
          return Array.from(root.querySelectorAll('[data-trait], [data-pill]'))
            .filter((el) => {
              const b = el.getBoundingClientRect();
              return b.left < r.left - 0.5 || b.right > r.right + 0.5 || b.top < r.top - 0.5 || b.bottom > r.bottom + 0.5;
            })
            .map((el) => `${el.getAttribute('data-trait')}:${el.getAttribute('data-pill') ?? ''}`);
        });
        bad.push(...out.map((o) => `${name}/${o}`));
      }
      expect(bad).toEqual([]);
    });
  }

  test('hoja, accesibilidad: el árbol es idéntico con y sin el collage, y la comprobación no es vacía', async ({ page }) => {
    await openSheet(page, 1280);
    const withCollage = await page.locator('body').ariaSnapshot();
    await page.evaluate(() => document.querySelectorAll('[data-collage]').forEach((e) => e.remove()));
    expect(await page.locator('body').ariaSnapshot()).toBe(withCollage);
    await openSheet(page, 1280);
    await page.evaluate(() => {
      const root = document.querySelector('[data-collage-scene="hero"]') as HTMLElement;
      root.removeAttribute('aria-hidden');
      root.querySelector('[data-pill]')?.setAttribute('aria-hidden', 'false');
    });
    expect(await page.locator('body').ariaSnapshot()).not.toBe(withCollage);
  });
});

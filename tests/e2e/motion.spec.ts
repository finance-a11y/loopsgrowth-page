import { test, expect, type Page } from '@playwright/test';
import { expectNoMotion, motionSnapshot } from './lib/motion';

// Movimiento de la landing (plan 02-07, DSGN-05). Todo es CSS puro bajo `prefers-reduced-motion:
// no-preference`, solo `transform`, finito y sin esconder contenido. Con `reduce` no hay ninguna
// animación. La lista blanca de lo que puede correr vive en `lib/motion.ts`.

const PIECES = '#inicio [data-piece]';
const FRAME = '#inicio [data-piece-of]';
const ANY_PIECE = `${PIECES}, ${FRAME}`;
const COLLAGE = '#inicio .hero-collage';
const HERO = { h1: '#inicio h1', sub: '#inicio .hero-sub', cta: '#inicio a[data-cta="hero"]' };

/** Espera a que corra al menos una animación (el reloj manda: el `describe` que la usa lleva `retries`). */
async function waitForAnimations(page: Page) {
  await page.waitForFunction(() => document.getAnimations().length > 0, null, { timeout: 3000 });
}

/** Detiene todas las animaciones vivas en `ms` desde su inicio: mide un cuadro exacto sin depender del reloj. */
async function freezeAt(page: Page, ms: number) {
  await page.evaluate((t) => {
    for (const a of document.getAnimations()) {
      a.pause();
      a.currentTime = t;
    }
  }, ms);
}

test.describe('entrada del collage del hero con reduce', () => {
  test.use({ reducedMotion: 'reduce' });

  test('las 6 piezas y el marco de foto no tienen animación y getAnimations() vale 0 a la carga y a los 2,5 s', async ({ page }) => {
    await page.goto('/');
    expect(await page.locator(PIECES).count()).toBe(6);
    expect(await page.locator(FRAME).count()).toBe(1);
    const names = await page.locator(ANY_PIECE).evaluateAll((els) => els.map((e) => getComputedStyle(e).animationName));
    expect(names).toEqual(Array(7).fill('none'));
    await expectNoMotion(page);
    await page.waitForTimeout(2500);
    await expectNoMotion(page);
  });

  test('/privacidad/ no tiene ninguna animación', async ({ page }) => {
    await page.goto('/privacidad/');
    await expectNoMotion(page);
    await page.waitForTimeout(2500);
    await expectNoMotion(page);
  });
});

test.describe('entrada del collage del hero con no-preference', () => {
  test.use({ reducedMotion: 'no-preference', viewport: { width: 1280, height: 800 } });

  test('cada pieza y el marco: hc-enter, 0,6 s, una iteración, relleno backwards, retraso de --i por 0,08 s y fin en 1,0 s o menos', async ({ page }) => {
    await page.goto('/');
    const rows = await page.locator(ANY_PIECE).evaluateAll((els) =>
      els.map((e) => {
        const c = getComputedStyle(e);
        return {
          who: e.getAttribute('data-piece') ?? `frame:${e.getAttribute('data-piece-of')}`,
          i: Number(e.style.getPropertyValue('--i')),
          name: c.animationName,
          dur: parseFloat(c.animationDuration),
          delay: parseFloat(c.animationDelay),
          iter: c.animationIterationCount,
          fill: c.animationFillMode,
          transform: c.transform,
        };
      }),
    );
    expect(rows).toHaveLength(7);
    const panel = rows.find((r) => r.who === 'panel')!;
    for (const r of rows) {
      expect(r.name, r.who).toBe('hc-enter');
      expect(r.dur, r.who).toBeCloseTo(0.6, 3);
      expect(r.iter, r.who).toBe('1');
      expect(r.fill, r.who).toBe('backwards');
      expect(r.delay, r.who).toBeCloseTo(r.i * 0.08, 3);
    }
    const frame = rows.find((r) => r.who.startsWith('frame:'))!;
    expect(frame.delay).toBeCloseTo(panel.delay, 3);
    expect(frame.i).toBe(panel.i);
    // Retraso de 0 a 0,4 s en pasos de 0,08 s: los seis grupos son una permutación de 0 a 5.
    expect(rows.filter((r) => !r.who.startsWith('frame:')).map((r) => r.i).sort()).toEqual([0, 1, 2, 3, 4, 5]);
    const end = Math.max(...rows.map((r) => r.delay + r.dur));
    expect(end).toBeLessThanOrEqual(1.0 + 1e-6);
    expect(end).toBeLessThan(1.2);
  });

  test('@keyframes hc-enter declara solo transform y su último cuadro es el reposo (rotate(0deg), no --r)', async ({ page }) => {
    await page.goto('/');
    const frames = await page.evaluate(() => {
      for (const sheet of [...document.styleSheets]) {
        let rules: CSSRuleList;
        try {
          rules = sheet.cssRules;
        } catch {
          continue;
        }
        const walk = (list: CSSRuleList): CSSKeyframesRule | null => {
          for (const r of [...list]) {
            if (r instanceof CSSKeyframesRule && r.name === 'hc-enter') return r;
            const inner = (r as CSSGroupingRule).cssRules;
            if (inner) {
              const f = walk(inner);
              if (f) return f;
            }
          }
          return null;
        };
        const k = walk(rules);
        if (k) {
          return [...k.cssRules].map((kf) => {
            const s = (kf as CSSKeyframeRule).style;
            return { key: (kf as CSSKeyframeRule).keyText, props: [...Array(s.length).keys()].map((i) => s.item(i)), text: (kf as CSSKeyframeRule).cssText };
          });
        }
      }
      return null;
    });
    expect(frames, '@keyframes hc-enter existe en las hojas de estilo').not.toBeNull();
    expect(frames!.length).toBeGreaterThanOrEqual(2);
    for (const f of frames!) expect(f.props, f.key).toEqual(['transform']);
    const last = frames![frames!.length - 1];
    expect(['100%', 'to']).toContain(last.key);
    expect(last.text).not.toContain('var(--r)');
    expect(last.text).toMatch(/rotate\(0(deg)?\)/);
  });

  test('h1, subtítulo y CTA del hero no tienen animación y su opacidad es 1', async ({ page }) => {
    await page.goto('/');
    for (const sel of Object.values(HERO)) {
      await expect(page.locator(sel).first()).toHaveCSS('animation-name', 'none');
      await expect(page.locator(sel).first()).toHaveCSS('opacity', '1');
    }
  });

  test('a los 2,5 s no queda ninguna animación y el marco coincide con la ranura de foto', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2500);
    await expectNoMotion(page);
    const boxes = await page.evaluate(() => {
      const r = (s: string) => {
        const b = document.querySelector(s)!.getBoundingClientRect();
        return { x: b.x, y: b.y, w: b.width, h: b.height };
      };
      return { frame: r('#inicio [data-photo-frame="hero"]'), slot: r('#inicio [data-photo-slot="hero"]') };
    });
    for (const k of ['x', 'y', 'w', 'h'] as const) expect(Math.abs(boxes.frame[k] - boxes.slot[k]), k).toBeLessThanOrEqual(1);
  });

  test.describe('muestreo del reloj', () => {
    test.describe.configure({ retries: 1 });

    test('tras cargar solo corren CSSAnimation de la lista blanca sobre las piezas del hero y a los 2,5 s vuelve a 0', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await waitForAnimations(page);
      const live = await motionSnapshot(page);
      expect(live.length).toBeGreaterThan(0);
      for (const e of live) {
        expect(e.type, e.target).toBe('CSSAnimation');
        expect(e.allowed, `${e.name} sobre ${e.target}`).toBe(true);
        expect(e.properties, e.target).toEqual(['transform']);
      }
      await page.waitForTimeout(2500);
      await expectNoMotion(page);
    });

    test('primer cuadro: cada pieza con opacidad 1, visible y dentro del collage (con la holgura de la desviación 12)', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await waitForAnimations(page);
      await freezeAt(page, 0);
      const out = await page.evaluate(
        ([pieces, frame, collage]) => {
          const root = document.querySelector(collage)!.getBoundingClientRect();
          const pad = root.width * 0.08;
          return [...document.querySelectorAll(`${pieces}, ${frame}`)].map((e) => {
            const c = getComputedStyle(e);
            const b = e.getBoundingClientRect();
            return {
              who: e.getAttribute('data-piece') ?? 'frame',
              opacity: c.opacity,
              visibility: c.visibility,
              display: c.display,
              inside: b.left >= root.left - pad && b.right <= root.right + pad && b.top >= root.top - pad && b.bottom <= root.bottom + pad,
            };
          });
        },
        [PIECES, FRAME, COLLAGE],
      );
      expect(out).toHaveLength(7);
      for (const o of out) {
        expect(o.opacity, o.who).toBe('1');
        expect(o.visibility, o.who).toBe('visible');
        expect(o.display, o.who).not.toBe('none');
        expect(o.inside, `${o.who} dentro del collage`).toBe(true);
      }
    });
  });

  test('/marca/hoja/ no tiene ninguna animación (el alcance es #inicio)', async ({ page }) => {
    await page.goto('/marca/hoja/');
    await expectNoMotion(page);
    await page.waitForTimeout(500);
    await expectNoMotion(page);
  });

  test('sin scroll horizontal a 320 px durante la entrada', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForAnimations(page);
    for (const t of [0, 200, 400, 700]) {
      await freezeAt(page, t);
      const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(over, `a ${t} ms`).toBeLessThanOrEqual(0);
    }
  });

  test('con JavaScript desactivado el hero y su collage se ven', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, reducedMotion: 'no-preference', viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    await page.goto('/');
    await expect(page.locator(HERO.h1)).toBeVisible();
    await expect(page.locator(HERO.cta)).toBeVisible();
    await expect(page.locator(COLLAGE)).toBeVisible();
    const opacities = await page.locator(ANY_PIECE).evaluateAll((els) => els.map((e) => getComputedStyle(e).opacity));
    expect(opacities).toEqual(Array(7).fill('1'));
    await context.close();
  });
});

// Pupilas del Loopy oficial (02-07 tarea 2): un único desplazamiento de 400 ms hacia el CTA, tras la entrada.
const PUPILS = '#inicio .hc-pupil, #inicio [data-pupil]';

async function keyframesOf(page: Page, name: string) {
  return page.evaluate((n) => {
    for (const sheet of [...document.styleSheets]) {
      let rules: CSSRuleList;
      try {
        rules = sheet.cssRules;
      } catch {
        continue;
      }
      const walk = (list: CSSRuleList): CSSKeyframesRule | null => {
        for (const r of [...list]) {
          if (r instanceof CSSKeyframesRule && r.name === n) return r;
          const inner = (r as CSSGroupingRule).cssRules;
          if (inner) {
            const f = walk(inner);
            if (f) return f;
          }
        }
        return null;
      };
      const k = walk(rules);
      if (k) {
        return [...k.cssRules].map((kf) => {
          const s = (kf as CSSKeyframeRule).style;
          return { key: (kf as CSSKeyframeRule).keyText, props: [...Array(s.length).keys()].map((i) => s.item(i)) };
        });
      }
    }
    return null;
  }, name);
}

test.describe('pupilas del hero con reduce', () => {
  test.use({ reducedMotion: 'reduce' });

  test('las dos pupilas no tienen animación y a los 2,5 s getAnimations() vale 0', async ({ page }) => {
    await page.goto('/');
    expect(await page.locator(PUPILS).count()).toBe(2);
    const names = await page.locator(PUPILS).evaluateAll((els) => els.map((e) => getComputedStyle(e).animationName));
    expect(names).toEqual(['none', 'none']);
    await expectNoMotion(page);
    await page.waitForTimeout(2500);
    await expectNoMotion(page);
  });
});

test.describe('pupilas del hero con no-preference', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('cada pupila: hc-look, 0,4 s, una iteración, relleno backwards, retraso igual a --hc-end (1 s) y fin a 1,4 s', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    const rows = await page.locator(PUPILS).evaluateAll((els) =>
      els.map((e) => {
        const c = getComputedStyle(e);
        const end = getComputedStyle(document.querySelector('#inicio')!).getPropertyValue('--hc-end').trim();
        return {
          name: c.animationName,
          dur: parseFloat(c.animationDuration),
          delay: parseFloat(c.animationDelay),
          iter: c.animationIterationCount,
          fill: c.animationFillMode,
          hcEnd: end,
        };
      }),
    );
    expect(rows).toHaveLength(2);
    for (const r of rows) {
      expect(r.name).toBe('hc-look');
      expect(r.dur).toBeCloseTo(0.4, 3);
      expect(r.iter).toBe('1');
      expect(r.fill).toBe('backwards');
      expect(r.delay).toBeCloseTo(1.0, 3);
      expect(r.delay + r.dur).toBeCloseTo(1.4, 3);
    }
  });

  test('@keyframes hc-look declara solo transform', async ({ page }) => {
    await page.goto('/');
    const frames = await keyframesOf(page, 'hc-look');
    expect(frames, '@keyframes hc-look existe').not.toBeNull();
    expect(frames!.length).toBeGreaterThanOrEqual(1);
    for (const f of frames!) expect(f.props, f.key).toEqual(['transform']);
  });

  for (const vp of [
    { width: 390, height: 844 },
    { width: 1280, height: 800 },
  ]) {
    test(`a ${vp.width} px la dirección --look-dx/--look-dy apunta hacia el CTA del hero (producto punto mayor que 0)`, async ({ page }) => {
      await page.setViewportSize(vp);
      await page.goto('/');
      await page.waitForFunction(() => document.getAnimations().length === 0, null, { timeout: 5000 });
      const data = await page.evaluate(() => {
        const cta = document.querySelector('#inicio a[data-cta="hero"]')!.getBoundingClientRect();
        const c = { x: cta.x + cta.width / 2, y: cta.y + cta.height / 2 };
        return [...document.querySelectorAll('#inicio .hc-pupil, #inicio [data-pupil]')].map((p) => {
          const b = p.getBoundingClientRect();
          const cs = getComputedStyle(p);
          return {
            dx: Number(cs.getPropertyValue('--look-dx')),
            dy: Number(cs.getPropertyValue('--look-dy')),
            look: cs.getPropertyValue('--look').trim(),
            vx: c.x - (b.x + b.width / 2),
            vy: c.y - (b.y + b.height / 2),
          };
        });
      });
      expect(data).toHaveLength(2);
      for (const d of data) {
        expect(Number.isFinite(d.dx) && Number.isFinite(d.dy), 'direcciones numéricas').toBe(true);
        expect(d.dx * d.vx + d.dy * d.vy, `producto punto a ${vp.width} px`).toBeGreaterThan(0);
      }
    });
  }

  test.describe('muestreo del reloj', () => {
    test.describe.configure({ retries: 1 });

    test('a los 2,5 s no queda ninguna animación y solo hubo CSSAnimation de la lista blanca', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto('/');
      await page.waitForTimeout(1100);
      const during = await motionSnapshot(page);
      expect(during.filter((m) => !m.allowed), JSON.stringify(during.filter((m) => !m.allowed))).toEqual([]);
      await page.waitForTimeout(1400);
      await expectNoMotion(page);
    });
  });
});

// Icono del FAQ (02-07 tarea 2): la barra vertical rota 90 grados en 150 ms al abrir y el plus queda como minus.
const FAQ_SUMMARY = '#faq .faq-item >> nth=0 >> summary';
const FAQ_V = '#faq .faq-item:first-child .faq-icon-v';

async function iconBox(page: Page) {
  return page.locator(FAQ_V).evaluate((el) => {
    const b = el.getBoundingClientRect();
    return { w: b.width, h: b.height };
  });
}

test.describe('icono del FAQ con no-preference', () => {
  test.use({ reducedMotion: 'no-preference', viewport: { width: 1280, height: 800 } });

  test('cerrado la barra es más alta que ancha; abierto es más ancha que alta (relación de 2 o más)', async ({ page }) => {
    await page.goto('/');
    await page.locator(FAQ_V).scrollIntoViewIfNeeded();
    const closed = await iconBox(page);
    expect(closed.h).toBeGreaterThan(closed.w);
    await page.locator(FAQ_SUMMARY).click();
    await page.waitForTimeout(250);
    const open = await iconBox(page);
    expect(open.w).toBeGreaterThan(0);
    expect(open.w).toBeGreaterThan(open.h);
    expect(open.w).toBeGreaterThanOrEqual(2 * open.h);
  });

  test('tras el clic existe un CSSTransition de transform sobre .faq-icon-v de 150 ms', async ({ page }) => {
    await page.goto('/');
    await page.locator(FAQ_V).scrollIntoViewIfNeeded();
    const found = await page.locator(FAQ_SUMMARY).evaluate((summary) => {
      (summary as HTMLElement).click();
      return document
        .getAnimations()
        .filter((a) => a.constructor.name === 'CSSTransition')
        .map((a) => ({
          prop: (a as CSSTransition).transitionProperty,
          target: (a.effect as KeyframeEffect).target instanceof Element && ((a.effect as KeyframeEffect).target as Element).matches('.faq-icon-v'),
          dur: Number((a.effect as KeyframeEffect).getTiming().duration),
        }));
    });
    const t = found.filter((f) => f.target);
    expect(t).toHaveLength(1);
    expect(t[0].prop).toBe('transform');
    expect(t[0].dur).toBe(150);
  });

  test('Enter y Espacio alternan open en un resumen enfocado', async ({ page }) => {
    await page.goto('/');
    const item = page.locator('#faq .faq-item').first();
    await page.locator(FAQ_SUMMARY).focus();
    await page.keyboard.press('Enter');
    await expect(item).toHaveAttribute('open', '');
    await page.keyboard.press('Space');
    await expect(item).not.toHaveAttribute('open', '');
    await page.keyboard.press('Space');
    await expect(item).toHaveAttribute('open', '');
  });
});

test.describe('icono del FAQ con reduce', () => {
  test.use({ reducedMotion: 'reduce', viewport: { width: 1280, height: 800 } });

  test('transition-duration es 0s, no hay transición tras el clic y el icono igual cambia de forma', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator(FAQ_V)).toHaveCSS('transition-duration', '0s');
    const live = await page.locator(FAQ_SUMMARY).evaluate((summary) => {
      (summary as HTMLElement).click();
      return document.getAnimations().length;
    });
    expect(live).toBe(0);
    const open = await iconBox(page);
    expect(open.w).toBeGreaterThan(0);
    expect(open.w).toBeGreaterThanOrEqual(2 * open.h);
  });
});

test('sin JavaScript el clic en el resumen del FAQ alterna open', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, reducedMotion: 'no-preference', viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await page.goto('/');
  const item = page.locator('#faq .faq-item').first();
  await page.locator(FAQ_SUMMARY).click();
  await expect(item).toHaveAttribute('open', '');
  await page.locator(FAQ_SUMMARY).click();
  await expect(item).not.toHaveAttribute('open', '');
  await context.close();
});

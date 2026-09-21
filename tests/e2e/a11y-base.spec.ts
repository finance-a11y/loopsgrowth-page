import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { walkClaims, MISSING_MARK } from '../../scripts/lib/copy-rules.mjs';
import { PURPLE_RGB } from './lib/brand';

// Los textos esperados salen del YAML y no se copian a mano: cuando Ari confirma o cambia un
// texto (el término, la duración, el subtítulo), la prueba sigue midiendo lo que la página debe
// mostrar. Se resuelven {term} y {duration} igual que `fill()` de src/lib/content.ts.
type Claim = { text: string };
const es = (parse(readFileSync('src/content/landing.es.yaml', 'utf8')) as {
  es: {
    brand: { term: Claim };
    call: { duration: Claim };
    hero: { h1: Claim; subtitle: Claim };
    faq: { items: unknown[] };
    agenda: { intro: Claim };
    config: { form_url: string };
    team: { members: { link?: { url: Claim } }[] };
  };
}).es;
const resolveText = (claim: Claim) =>
  claim.text.replaceAll('{term}', es.brand.term.text).replaceAll('{duration}', es.call.duration.text);

const FORM_URL = es.config.form_url;
// Enlace externo de la tarjeta de Juan (quick 260920-team-photos): una parada de Tab más, entre el CTA de Casos y el FAQ.
const TEAM_LINK_URL = es.team.members.find((m) => m.link)!.link!.url.text;
// Un resumen del FAQ por elemento del YAML (plan 02-06): cada uno es una parada de Tab antes del enlace de respaldo.
const FAQ_COUNT = es.faq.items.length;
const SUMMARIES = Array.from({ length: FAQ_COUNT }, () => 'summary');

// Marcas de dato faltante que la página debe mostrar en `/`: una por reclamación del YAML cuyo texto es
// la marca, sin contar `privacy.` (el cuerpo de la política vive en /privacidad). Se deriva del YAML: se
// ajusta sola cuando un plan agrega o resuelve una marca (plan 02-03 es el único que reescribe esto).
const VISIBLE_MARKS = walkClaims(parse(readFileSync('src/content/landing.es.yaml', 'utf8')))
  .filter((n: { kind: string; path: string; claim?: { text: string } }) => n.kind === 'claim' && n.claim?.text === MISSING_MARK && !n.path.startsWith('privacy.'))
  .length;
// El canal de cada caso se imprime dos veces (chip y dato de Canal): las marcas de ese canal se ven el doble.
const CHIP_DUPLICATES = (
  parse(readFileSync('src/content/landing.es.yaml', 'utf8')) as { es: { cases: { items: { channel: Claim }[] } } }
).es.cases.items.filter((item) => item.channel.text === MISSING_MARK).length;

// Textos de Ari, tal cual (con el término y la duración ya resueltos desde el YAML).
const H1_TEXT = resolveText(es.hero.h1);
const SUBTITLE_TEXT = resolveText(es.hero.subtitle);
const INTRO_TEXT = resolveText(es.agenda.intro);

type Stop = {
  tag: string;
  href: string | null;
  cta: string | null;
  outlineStyle: string;
  outlineWidth: number;
  width: number;
  height: number;
};

/** Describe el elemento que tiene el foco ahora mismo. */
async function activeStop(page: Page): Promise<Stop> {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement;
    const cs = getComputedStyle(el);
    const box = el.getBoundingClientRect();
    return {
      tag: el.tagName,
      href: el.getAttribute('href'),
      cta: el.getAttribute('data-cta'),
      outlineStyle: cs.outlineStyle,
      outlineWidth: parseFloat(cs.outlineWidth),
      width: box.width,
      height: box.height,
    };
  });
}

/** Tab repetido hasta llegar al iframe (o a un máximo de paradas). */
async function tabUntilIframe(page: Page, max = 24): Promise<Stop[]> {
  const stops: Stop[] = [];
  for (let i = 0; i < max; i++) {
    await page.keyboard.press('Tab');
    const stop = await activeStop(page);
    stops.push(stop);
    if (stop.tag === 'IFRAME') break;
  }
  return stops;
}

test.describe('orden de tabulación y foco a 1280 px', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('(a) el orden es skip 1, skip 2, CTA del header, CTA del hero, CTA de La solución, CTA de Casos, el enlace de Juan en Quiénes somos, los resúmenes del FAQ, enlace de respaldo y el iframe', async ({ page }) => {
    await page.goto('/');
    const stops = await tabUntilIframe(page);
    const order = stops.map((s) => (s.cta ? `cta:${s.cta}` : s.tag === 'SUMMARY' ? 'summary' : s.tag === 'IFRAME' ? 'iframe' : `a:${s.href}`));
    expect(order).toEqual(['a:#main', 'a:#agenda', 'cta:header', 'cta:hero', 'cta:solucion', 'cta:casos', `a:${TEAM_LINK_URL}`, ...SUMMARIES, `a:${FORM_URL}`, 'iframe']);
  });

  test('(c) cada parada muestra un contorno sólido de 2 px o más', async ({ page }) => {
    await page.goto('/');
    const stops = await tabUntilIframe(page);
    expect(stops.length).toBeGreaterThanOrEqual(6);
    // Al entrar al iframe, Chromium deja `document.activeElement` en el IFRAME pero el
    // elemento no coincide con `:focus` ni `:focus-visible` (el foco vive en el documento
    // de ClickUp), así que el contorno del interior es de ClickUp y no medible desde aquí.
    for (const stop of stops.filter((s) => s.tag !== 'IFRAME')) {
      expect(stop.outlineStyle, `${stop.tag} ${stop.href ?? stop.cta ?? ''}`).not.toBe('none');
      expect(stop.outlineWidth, `${stop.tag} ${stop.href ?? stop.cta ?? ''}`).toBeGreaterThanOrEqual(2);
    }
  });

  test('(d) skip links, CTA y enlace de respaldo miden 44 px o más (48 px de alto el CTA del hero)', async ({ page }) => {
    await page.goto('/');
    const stops = (await tabUntilIframe(page)).filter((s) => s.tag !== 'IFRAME');
    for (const stop of stops) {
      expect(stop.width, `ancho de ${stop.href ?? stop.cta}`).toBeGreaterThanOrEqual(44);
      expect(stop.height, `alto de ${stop.href ?? stop.cta}`).toBeGreaterThanOrEqual(44);
    }
    const hero = stops.find((s) => s.cta === 'hero');
    expect(hero?.height).toBeGreaterThanOrEqual(48);
  });

  test('(f) un skip link enfocado queda a la vista, sin nada encima, con captura', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const link = page.locator('.skip a[href="#main"]');
    await expect(link).toBeFocused();
    const onTop = await link.evaluate((el) => {
      const box = el.getBoundingClientRect();
      const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
      return { inside: hit === el || el.contains(hit), top: box.top, left: box.left };
    });
    expect(onTop.inside).toBe(true);
    expect(onTop.top).toBeGreaterThanOrEqual(0);
    expect(onTop.left).toBeGreaterThanOrEqual(0);
    await page.screenshot({ path: 'test-results/skip-link-focused.png', clip: { x: 0, y: 0, width: 640, height: 160 } });
  });

  test('(f2) un skip link enfocado sobre la sección morada #agenda conserva un anillo visible (dos tonos)', async ({ page }) => {
    await page.goto('/#agenda');
    // La medición solo vale con #agenda ya en pantalla. El salto de ancla del navegador llega en un
    // momento distinto según cuánto tarde `load` (con ClickUp respondiendo, tras 5 a 11 s; sin
    // ClickUp, antes), así que no se espera a él: se provoca el desplazamiento y no depende de la
    // red. `behavior: 'instant'` ignora el `scroll-behavior: smooth` de global.css.
    await page.locator('#agenda').evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'start' }));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
    const link = page.locator('.skip a[href="#main"]');
    await link.evaluate((el) => (el as HTMLElement).focus());
    await expect(link).toBeFocused();
    const info = await link.evaluate((el) => {
      const cs = getComputedStyle(el);
      const box = el.getBoundingClientRect();
      const agenda = document.getElementById('agenda')!.getBoundingClientRect();
      return {
        outlineColor: cs.outlineColor,
        boxShadow: cs.boxShadow,
        overAgenda: agenda.top < box.bottom && agenda.bottom > box.top,
      };
    });
    // El enlace (fixed) queda, al menos en parte, sobre #agenda: el contorno morado de UI-SPEC no se ve ahí,
    // así que el anillo amarillo del box-shadow (5.43 sobre morado) debe estar presente.
    expect(info.overAgenda).toBe(true);
    expect(info.outlineColor).toBe(PURPLE_RGB);
    expect(info.boxShadow).toContain('rgb(255, 198, 2)');
    await page.screenshot({ path: 'test-results/skip-link-focused-agenda.png', clip: { x: 0, y: 0, width: 640, height: 160 } });
  });

  test('(g) Enter sobre el skip link 1 deja el foco en #main', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await expect(page.locator('#main')).toBeFocused();
  });

  test('(h) pesos del brandbook: skip 600; CTA, h1 y h2 700; subtítulo y body 400', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const weight = (selector: string) =>
      page.locator(selector).first().evaluate((el) => getComputedStyle(el).fontWeight);
    expect(await weight('.skip a[href="#main"]')).toBe('600');
    expect(await weight('a[data-cta="hero"]')).toBe('700');
    expect(await weight('h1')).toBe('700');
    expect(await weight('#agenda-title')).toBe('700');
    expect(await weight('.hero-sub')).toBe('400');
    expect(await weight('body')).toBe('400');
  });
});

test.describe('marco de página', () => {
  test('(e) lang es, un solo h1, header estático y sin tabindex positivo', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await expect(page.locator('h1')).toHaveCount(1);
    const headerPosition = await page.locator('header').evaluate((el) => getComputedStyle(el).position);
    expect(headerPosition).toBe('static');
    // (b) ningún elemento con tabindex mayor a 0
    const positive = await page.evaluate(() =>
      [...document.querySelectorAll('[tabindex]')].filter((el) => Number(el.getAttribute('tabindex')) > 0).length,
    );
    expect(positive).toBe(0);
  });
});

test.describe('orden de tabulación a 390 px', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('(a) el CTA del header queda fuera del orden', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a[data-cta="header"]')).toBeHidden();
    const stops = await tabUntilIframe(page);
    expect(stops.some((s) => s.cta === 'header')).toBe(false);
    expect(stops.map((s) => (s.cta ? `cta:${s.cta}` : s.tag === 'SUMMARY' ? 'summary' : s.tag === 'IFRAME' ? 'iframe' : `a:${s.href}`))).toEqual([
      'a:#main',
      'a:#agenda',
      'cta:hero',
      'cta:solucion',
      'cta:casos',
      `a:${TEAM_LINK_URL}`,
      ...SUMMARIES,
      `a:${FORM_URL}`,
      'iframe',
    ]);
  });
});

test.describe('objetivos táctiles a 390 px', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('(d) CTA del hero y enlace de respaldo miden 44 px o más', async ({ page }) => {
    await page.goto('/');
    const stops = (await tabUntilIframe(page)).filter((s) => s.tag !== 'IFRAME');
    for (const stop of stops) {
      expect(stop.width, `ancho de ${stop.href ?? stop.cta}`).toBeGreaterThanOrEqual(44);
      expect(stop.height, `alto de ${stop.href ?? stop.cta}`).toBeGreaterThanOrEqual(44);
    }
    expect(stops.some((s) => s.href === FORM_URL)).toBe(true);
  });
});

test.describe('sección #agenda: desbordes y espaciado de texto', () => {
  for (const width of [320, 390, 768, 1024, 1280]) {
    test(`(a) sin scroll horizontal a ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/');
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
    });
  }

  for (const width of [320, 1280]) {
    test(`(g) espaciado de texto de SC 1.4.12 a ${width} px sin recorte ni desborde`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
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
      for (const selector of ['h1', 'a[data-cta="hero"]', '#agenda-title']) {
        const clipped = await page.locator(selector).evaluate((el) => el.scrollHeight - el.clientHeight);
        expect(clipped, `recorte vertical en ${selector}`).toBeLessThanOrEqual(1);
      }
    });
  }
});

test.describe('sección #agenda: estructura', () => {
  test('(c) enlace de respaldo con target y rel seguros; el iframe tiene título', async ({ page }) => {
    await page.goto('/');
    const link = page.locator('#agenda .agenda-fallback a');
    await expect(link).toHaveAttribute('href', FORM_URL);
    await expect(link).toHaveAttribute('target', '_blank');
    const rel = (await link.getAttribute('rel')) ?? '';
    expect(rel).toContain('noopener');
    expect(rel).toContain('noreferrer');
    const title = await page.locator('#agenda iframe').getAttribute('title');
    expect((title ?? '').trim().length).toBeGreaterThan(0);
    await expect(page.locator('#agenda .agenda-fallback-lead')).toHaveText(
      '¿El formulario no carga o prefieres abrirlo aparte?',
    );
    await expect(link).toHaveText('Abre el formulario en una pestaña nueva');
  });

  test('(d) una columna a 390 px y dos (5fr / 7fr) a 1024 px, con el orden del DOM igual al visual', async ({ page }) => {
    const boxes = async () =>
      page.evaluate(() => {
        const grid = document.querySelector('#agenda .agenda-grid') as HTMLElement;
        const rect = (selector: string) => {
          const r = (document.querySelector(selector) as HTMLElement).getBoundingClientRect();
          return { top: r.top, left: r.left, width: r.width };
        };
        const order = ['#agenda-title', '.agenda-intro', '.agenda-fallback', '.form-embed'].map((s) => document.querySelector(s)!);
        const domOrdered = order.every(
          (el, i) => i === 0 || !!(order[i - 1].compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING),
        );
        return {
          columns: getComputedStyle(grid).gridTemplateColumns.split(' ').length,
          template: getComputedStyle(grid).gridTemplateColumns,
          gap: parseFloat(getComputedStyle(grid).columnGap),
          h2: rect('#agenda-title'),
          intro: rect('.agenda-intro'),
          fallback: rect('.agenda-fallback'),
          card: rect('.form-embed'),
          domOrdered,
        };
      });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const narrow = await boxes();
    expect(narrow.columns).toBe(1);
    expect(narrow.domOrdered).toBe(true);
    expect(narrow.h2.top).toBeLessThan(narrow.intro.top);
    expect(narrow.intro.top).toBeLessThan(narrow.fallback.top);
    expect(narrow.fallback.top).toBeLessThan(narrow.card.top);

    await page.setViewportSize({ width: 1024, height: 800 });
    const wide = await boxes();
    expect(wide.columns).toBe(2);
    expect(wide.domOrdered).toBe(true);
    expect(wide.gap).toBe(48);
    // La tarjeta va a la derecha y es más ancha que la columna de texto (7fr contra 5fr).
    expect(wide.card.left).toBeGreaterThan(wide.h2.left);
    expect(wide.card.width).toBeGreaterThan(wide.h2.width);
    expect(wide.h2.top).toBeLessThan(wide.intro.top);
    expect(wide.intro.top).toBeLessThan(wide.fallback.top);
  });

  test('(e) la tarjeta vence el overflow del script de ClickUp y lleva borde de 3 px', async ({ page }) => {
    await page.goto('/');
    // El script de ClickUp ejecuta `parentElement.style.overflow = 'auto'` sobre .form-embed. Se
    // reproduce aquí a mano en vez de esperar al script de app-cdn.clickup.com: la prueba mide
    // nuestro CSS (`overflow: visible !important`) y no debe depender de la red ni de ClickUp.
    await page.locator('.form-embed').evaluate((el) => {
      (el as HTMLElement).style.overflow = 'auto';
    });
    expect(await page.locator('.form-embed').evaluate((el) => (el as HTMLElement).style.overflow)).toBe('auto');
    const card = await page.locator('.form-embed').evaluate((el) => {
      const cs = getComputedStyle(el);
      return {
        overflow: cs.overflow,
        borderTop: cs.borderTopWidth,
        radius: cs.borderTopLeftRadius,
        background: cs.backgroundColor,
        shadow: cs.boxShadow,
      };
    });
    expect(card.overflow).toBe('visible');
    expect(card.borderTop).toBe('3px');
    expect(card.radius).toBe('16px');
    expect(card.background).toBe('rgb(255, 255, 255)');
    expect(card.shadow).toContain('4px 4px 0px');
  });

  test('(e2) el iframe reserva min-height por breakpoint y no fija height', async ({ page }) => {
    const iframeHeights = () =>
      page.locator('#agenda iframe').evaluate((el) => {
        const cs = getComputedStyle(el);
        return { minHeight: cs.minHeight, inline: el.getAttribute('height'), styleHeight: (el as HTMLElement).style.height };
      });
    // Los valores los mide el Plan 04 (FORM-04) y viven en tokens.css: el test los lee de ahí.
    const tokens = readFileSync('src/styles/tokens.css', 'utf8');
    const token = (name: string) => `${tokens.match(new RegExp(`--form-min-h-${name}:\\s*(\\d+)px`))?.[1]}px`;
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    expect((await iframeHeights()).minHeight).toBe(token('sm'));
    await page.setViewportSize({ width: 1024, height: 800 });
    expect((await iframeHeights()).minHeight).toBe(token('lg'));
    expect((await iframeHeights()).inline).toBeNull();
  });

  test('(j) pesos de la sección: enlace de respaldo 700; intro y frase de respaldo 400', async ({ page }) => {
    await page.goto('/');
    const weight = (selector: string) =>
      page.locator(selector).first().evaluate((el) => getComputedStyle(el).fontWeight);
    expect(await weight('#agenda .agenda-fallback a')).toBe('700');
    expect(await weight('#agenda .agenda-intro')).toBe('400');
    expect(await weight('#agenda .agenda-fallback-lead')).toBe('400');
  });
});

test.describe('movimiento reducido', () => {
  test.describe('reduce', () => {
    test.use({ reducedMotion: 'reduce' });

    test('(f) scroll-behavior auto y el hover del CTA no produce transform', async ({ page }) => {
      await page.goto('/');
      expect(await page.locator('html').evaluate((el) => getComputedStyle(el).scrollBehavior)).toBe('auto');
      const cta = page.locator('a[data-cta="hero"]');
      await cta.hover();
      await page.waitForTimeout(300);
      expect(await cta.evaluate((el) => getComputedStyle(el).transform)).toBe('none');
    });
  });

  test.describe('no-preference', () => {
    test.use({ reducedMotion: 'no-preference' });

    test('(f) scroll-behavior smooth y el hover del CTA sí se desplaza', async ({ page }) => {
      await page.goto('/');
      expect(await page.locator('html').evaluate((el) => getComputedStyle(el).scrollBehavior)).toBe('smooth');
      const cta = page.locator('a[data-cta="hero"]');
      await cta.hover();
      await expect
        .poll(() => cta.evaluate((el) => getComputedStyle(el).transform), { timeout: 3000 })
        .not.toBe('none');
    });
  });
});

test.describe('glifos españoles y caras de Outfit', () => {
  const GLYPHS = 'Ñandú, ¿qué tal? ¡Sí! Pingüino, árbol, éxito, índice, ópera, único.';

  test('(h) la cadena usa solo Outfit descargada y hay caras 400, 600 y 700', async ({ page, context }) => {
    await page.goto('/');
    await page.evaluate((text) => {
      const p = document.createElement('p');
      p.id = 'glyph-probe';
      p.textContent = text;
      p.style.cssText = 'font-family: var(--font-brand); font-size: 2rem; font-weight: 400; max-width: none;';
      document.querySelector('main')!.prepend(p);
    }, GLYPHS);
    await page.evaluate(async (text) => {
      const family = getComputedStyle(document.getElementById('glyph-probe')!).fontFamily;
      await document.fonts.load(`400 32px ${family}`, text);
      await document.fonts.ready;
    }, GLYPHS);

    const cdp = await context.newCDPSession(page);
    await cdp.send('DOM.enable');
    await cdp.send('CSS.enable');
    const { root } = await cdp.send('DOM.getDocument', { depth: 0 });
    const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: '#glyph-probe' });
    const { fonts } = await cdp.send('CSS.getPlatformFontsForNode', { nodeId });
    const used = fonts.map((f) => `${f.familyName} custom=${f.isCustomFont} glyphs=${f.glyphCount}`);
    expect(fonts.length, `sin fuentes: ${used.join(' | ')}`).toBeGreaterThan(0);
    for (const f of fonts) {
      expect(f.isCustomFont, `fuente del sistema en uso: ${used.join(' | ')}`).toBe(true);
      expect(f.familyName, `familia distinta de Outfit: ${used.join(' | ')}`).toMatch(/Outfit/i);
    }
    const total = fonts.reduce((sum, f) => sum + f.glyphCount, 0);
    expect(total).toBeGreaterThanOrEqual(GLYPHS.replace(/\s/g, '').length - 2);

    await page.locator('#glyph-probe').screenshot({ path: 'test-results/glyphs-outfit.png' });

    const covered = await page.evaluate(() => {
      const ranges = [...document.fonts]
        .filter((face) => /outfit/i.test(face.family))
        .map((face) => face.weight.split(/\s+/).map(Number))
        .map(([lo, hi]) => [lo, hi ?? lo]);
      return [400, 600, 700].map((w) => ranges.some(([lo, hi]) => lo <= w && w <= hi));
    });
    expect(covered, 'caras de Outfit para 400, 600 y 700').toEqual([true, true, true]);
  });
});

test.describe('textos de Ari visibles', () => {
  const checkTexts = async (page: Page) => {
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('h1')).toHaveText(H1_TEXT);
    await expect(page.locator('.hero-sub')).toBeVisible();
    await expect(page.locator('.hero-sub')).toHaveText(SUBTITLE_TEXT);
    await expect(page.locator('.agenda-intro')).toBeVisible();
    await expect(page.locator('.agenda-intro')).toHaveText(INTRO_TEXT);
    // innerText no incluye el contenido de un <details> cerrado (las respuestas del FAQ): se abren todos
    // antes de leer, para que el conteo mida el texto real y no el estado de los desplegables.
    const body = await page.evaluate(() => {
      document.querySelectorAll('details').forEach((d) => {
        d.open = true;
      });
      return document.body.innerText;
    });
    // Aserción derivada del YAML (COPY-01): la marca aparece tantas veces como reclamaciones la traigan.
    expect(body.split(MISSING_MARK).length - 1).toBe(VISIBLE_MARKS + CHIP_DUPLICATES);
    expect(body).not.toMatch(/[{}]/);
    expect(body).not.toMatch(/borrador|TBD|lorem/i);
  };

  test('(k) con JavaScript activado', async ({ page }) => {
    await page.goto('/');
    await checkTexts(page);
  });

  test.describe('sin JavaScript', () => {
    test.use({ javaScriptEnabled: false });

    test('(k) los tres textos se ven tal cual', async ({ page }) => {
      await page.goto('/');
      await checkTexts(page);
    });

    test('(b) h1, CTA, h2, enlace de respaldo y noscript visibles; el CTA salta a #agenda', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('a[data-cta="hero"]')).toBeVisible();
      await expect(page.locator('#agenda-title')).toBeVisible();
      await expect(page.locator('#agenda .agenda-fallback a')).toBeVisible();
      await expect(page.locator('#agenda noscript a')).toBeVisible();
      await expect(page.locator('#agenda .agenda-noscript p')).toHaveText(
        'Para ver el formulario aquí necesitas activar JavaScript.',
      );
      await page.locator('a[data-cta="hero"]').click();
      await expect(page).toHaveURL(/#agenda$/);
    });

    test('(c) el enlace del noscript lleva target y rel seguros', async ({ page }) => {
      await page.goto('/');
      const link = page.locator('#agenda noscript a');
      await expect(link).toHaveAttribute('href', FORM_URL);
      await expect(link).toHaveAttribute('target', '_blank');
      const rel = (await link.getAttribute('rel')) ?? '';
      expect(rel).toContain('noopener');
      expect(rel).toContain('noreferrer');
    });
  });
});

test.describe('capturas para revisión visual', () => {
  for (const width of [320, 390, 1280]) {
    test(`(i) captura a ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      await page.screenshot({ path: `test-results/page-${width}.png`, fullPage: true });
    });
  }
});

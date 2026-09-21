import { expect, type Page } from '@playwright/test';

// Política de movimiento compartida por los specs (plan 02-07, DSGN-05). No es un spec: Playwright
// solo corre `*.spec.ts`. Un único lugar dice qué animaciones puede tener la página y cómo se miden.
//
// - Con `prefers-reduced-motion: reduce` la página no tiene ninguna animación (`expectNoMotion`).
// - Con `no-preference` en reposo tampoco; mientras corre, solo existen las de la lista blanca
//   (`expectMotionWithinBudget`).
// - `/privacidad/` y `/marca/hoja/` no tienen ninguna con ninguna preferencia.

export type AllowedMotion = {
  type: 'CSSAnimation' | 'CSSTransition';
  /** `animationName` (CSSAnimation) o `transitionProperty` (CSSTransition). */
  names: string[];
  /** Selector que debe cumplir el elemento animado. */
  selector: string;
  /** Propiedades que pueden aparecer en sus cuadros clave (solo `transform` para el movimiento nuevo). */
  properties: string[];
};

export const MOTION_ALLOWLIST: AllowedMotion[] = [
  // Entrada del collage del hero (02-07): los seis grupos y el marco de foto.
  { type: 'CSSAnimation', names: ['hc-enter'], selector: '#inicio [data-piece], #inicio [data-piece-of]', properties: ['transform'] },
  // Las dos pupilas del Loopy oficial miran hacia el CTA una sola vez.
  { type: 'CSSAnimation', names: ['hc-look'], selector: '#inicio .hc-pupil, #inicio [data-pupil]', properties: ['transform'] },
  // Icono del FAQ: la barra vertical rota al abrir.
  { type: 'CSSTransition', names: ['transform'], selector: '.faq-icon-v', properties: ['transform'] },
  // Hover del CTA y del enlace de respaldo del formulario (fase 1).
  { type: 'CSSTransition', names: ['transform', 'box-shadow', 'background-color'], selector: '.cta', properties: ['transform', 'box-shadow', 'background-color'] },
  { type: 'CSSTransition', names: ['color'], selector: '.agenda-link', properties: ['color'] },
];

export type MotionEntry = {
  type: string;
  name: string;
  target: string;
  properties: string[];
  duration: number;
  delay: number;
  iterations: number;
  fill: string;
  allowed: boolean;
};

/** Mapea `document.getAnimations()` a datos planos: tipo, nombre o propiedad, destino, propiedades, tiempos. */
export async function motionSnapshot(page: Page): Promise<MotionEntry[]> {
  return page.evaluate((allow) => {
    const short = (el: Element | null) => {
      if (!el) return '(sin destino)';
      const id = el.id ? `#${el.id}` : '';
      const cls = typeof (el as HTMLElement).className === 'string' && (el as HTMLElement).className ? `.${String((el as HTMLElement).className).trim().split(/\s+/).join('.')}` : '';
      const data = [...el.attributes].filter((a) => a.name.startsWith('data-')).map((a) => `[${a.name}${a.value ? `="${a.value}"` : ''}]`).join('');
      return `${el.tagName.toLowerCase()}${id}${cls}${data}`;
    };
    return document.getAnimations().map((a) => {
      const effect = a.effect as KeyframeEffect | null;
      const el = (effect?.target ?? null) as Element | null;
      const type = a.constructor.name;
      const name = type === 'CSSAnimation' ? (a as CSSAnimation).animationName : type === 'CSSTransition' ? (a as CSSTransition).transitionProperty : a.id;
      const props = new Set<string>();
      for (const kf of effect?.getKeyframes?.() ?? []) {
        for (const k of Object.keys(kf)) if (!['offset', 'easing', 'composite', 'computedOffset'].includes(k)) props.add(k);
      }
      const t = effect?.getTiming?.() ?? ({} as OptionalEffectTiming);
      const allowed = allow.some(
        (r) => r.type === type && r.names.includes(name) && !!el && el.matches(r.selector) && [...props].every((p) => r.properties.includes(p)),
      );
      return {
        type,
        name,
        target: short(el),
        properties: [...props],
        duration: Number(t.duration ?? 0),
        delay: Number(t.delay ?? 0),
        iterations: Number(t.iterations ?? 1),
        fill: String(t.fill ?? 'auto'),
        allowed,
      };
    });
  }, MOTION_ALLOWLIST);
}

/** La lista es vacía: con `reduce`, en reposo o en páginas sin movimiento. */
export async function expectNoMotion(page: Page): Promise<void> {
  expect(await motionSnapshot(page), 'animaciones vivas').toEqual([]);
}

/** Todo lo que corra está en la lista blanca (con `no-preference`, en `/`, durante la entrada o en reposo). */
export async function expectMotionWithinBudget(page: Page): Promise<void> {
  const notAllowed = (await motionSnapshot(page)).filter((e) => !e.allowed);
  expect(notAllowed, 'animaciones fuera de la lista blanca').toEqual([]);
}

// Escenas del collage de marca (plan 02-10). ESM plano con JSDoc, sin colores literales: cada
// composición es una lista de capas de datos (disco, bloque, panel de foto, Loopy, garabato,
// retícula de puntos y píldora) que `CollageScene.astro` dibuja y `assertScene` valida al construir.
// Un dato que rompe el contrato lanza un Error en español con escena, capa y regla (R1 a R11).
// Las coordenadas son unidades del viewBox de la escena; los colores son nombres de marca.
import { SCENE_PIECES, SURFACE_OF_COLOR, assertPill, assertToneSafe } from './collage-rules.mjs';
import { loopyGeometry, loopyScheme } from './loopy.mjs';

/** Margen mínimo entre lo pintado (con su sombra) y el borde del viewBox. */
const EDGE = 4;

/**
 * Rasgos del moodboard que exige cada tipo de escena (R10). `palette` es el rasgo 1: morado más
 * amarillo o naranja; `stage` el 3; `pill` el 4; `doodle` el 6; `dots` y `shadow` el 7.
 */
export const REQUIRED_TRAITS = Object.freeze({
  full: Object.freeze(['palette', 'stage', 'pill', 'doodle', 'dots', 'shadow', 'loopy']),
  mini: Object.freeze(['palette', 'stage', 'pill', 'doodle', 'shadow']),
  avatar: Object.freeze(['stage', 'shadow', 'loopy']),
});

/** Rasgos que un tipo de escena no lleva: los avatares son solo Loopy sobre un disco, sin píldora ni garabatos. */
export const FORBIDDEN_TRAITS = Object.freeze({
  avatar: Object.freeze(['pill', 'doodle', 'dots', 'slot']),
});

/** Grupos de animación del hero: los prepara este plan y los usa 02-07. */
const HERO_GROUPS = Object.freeze(['stage', 'panel', 'loopy', 'pills', 'doodles', 'dots']);

/** @type {Record<string, any>} */
export const SCENES = {
  hero: {
    name: 'hero',
    family: 'hero',
    kind: 'full',
    w: 560,
    h: 520,
    ground: 'light',
    stage: 'purple',
    groups: [
      { name: 'panel', i: 1, r: 2, rFrom: 8 },
      { name: 'stage', i: 0, r: 0, rFrom: -8 },
      { name: 'loopy', i: 2, r: 0, rFrom: -10 },
      { name: 'doodles', i: 4, r: 0, rFrom: 12 },
      { name: 'dots', i: 5, r: 0, rFrom: -6 },
      { name: 'pills', i: 3, r: -2, rFrom: 6 },
    ],
    layers: [
      {
        id: 'hero-panel', kind: 'slot', group: 'panel', on: 'ground', name: 'hero',
        x: 344, y: 22, w: 192, h: 250, rx: 22, fill: 'cream', shadow: [10, 10],
        dots: { x: 358, y: 36, w: 72, color: 'purple' },
      },
      { id: 'hero-disc', kind: 'disc', group: 'stage', on: 'ground', cx: 230, cy: 302, r: 188, fill: 'purple', shadow: [14, 14] },
      { id: 'hero-loopy', kind: 'loopy', group: 'loopy', on: 'stage', art: 'ojos', cx: 226, cy: 306, width: 296, inline: true },
      { id: 'hero-flecha', kind: 'doodle', group: 'doodles', on: 'ground', piece: 'flecha', x: 190, y: 34, w: 72, color: 'purple' },
      { id: 'hero-destello', kind: 'doodle', group: 'doodles', on: 'stage', piece: 'destello', x: 140, y: 150, w: 40, color: 'yellow' },
      { id: 'hero-asterisco', kind: 'doodle', group: 'doodles', on: 'ground', piece: 'asterisco', x: 488, y: 360, w: 36, color: 'orange' },
      { id: 'hero-mas', kind: 'doodle', group: 'doodles', on: 'ground', piece: 'mas', x: 24, y: 100, w: 24, color: 'purple' },
      { id: 'hero-garabato', kind: 'doodle', group: 'doodles', on: 'ground', piece: 'garabato', x: 16, y: 470, w: 96, color: 'dark' },
      { id: 'hero-puntos', kind: 'dots', group: 'dots', on: 'ground', x: 16, y: 20, w: 96, color: 'purple' },
      { id: 'hero-pill-seo', kind: 'pill', group: 'pills', on: 'ground', word: 'seo', bg: 'yellow', fg: 'dark', x: 16, y: 164, anchor: 'left', fs: 36 },
      { id: 'hero-pill-geo', kind: 'pill', group: 'pills', on: 'ground', word: 'geo', bg: 'cream', fg: 'purple', x: 470, y: 394, anchor: 'right', fs: 36 },
    ],
  },
  whynow: {
    name: 'whynow',
    family: 'whynow',
    kind: 'full',
    w: 320,
    h: 320,
    ground: 'yellow',
    stage: 'purple',
    layers: [
      {
        id: 'whynow-slot', kind: 'slot', on: 'ground', name: 'whynow',
        x: 204, y: 14, w: 104, h: 128, rx: 16, fill: 'white', shadow: [8, 8],
        dots: { x: 214, y: 24, w: 48, color: 'purple' },
      },
      { id: 'whynow-disc', kind: 'disc', on: 'ground', cx: 146, cy: 180, r: 122, fill: 'purple', shadow: [10, 10] },
      { id: 'whynow-loopy', kind: 'loopy', on: 'stage', art: 'lupa', cx: 144, cy: 182, width: 150 },
      { id: 'whynow-flecha', kind: 'doodle', on: 'ground', piece: 'flecha', x: 12, y: 14, w: 56, color: 'dark' },
      { id: 'whynow-destello', kind: 'doodle', on: 'stage', piece: 'destello', x: 98, y: 108, w: 28, color: 'yellow' },
      { id: 'whynow-mas', kind: 'doodle', on: 'ground', piece: 'mas', x: 288, y: 168, w: 18, color: 'purple' },
      { id: 'whynow-puntos', kind: 'dots', on: 'ground', x: 252, y: 268, w: 60, color: 'dark' },
      { id: 'whynow-pill-seo', kind: 'pill', on: 'ground', word: 'seo', bg: 'dark', fg: 'yellow', x: 8, y: 262, anchor: 'left', fs: 22 },
      { id: 'whynow-pill-geo', kind: 'pill', on: 'ground', word: 'geo', bg: 'white', fg: 'purple', x: 308, y: 214, anchor: 'right', fs: 22 },
    ],
  },
  agenda: {
    name: 'agenda',
    family: 'agenda',
    kind: 'full',
    w: 480,
    h: 480,
    ground: 'purple',
    stage: 'yellow',
    layers: [
      { id: 'agenda-disc', kind: 'disc', on: 'ground', cx: 238, cy: 232, r: 186, fill: 'yellow', shadow: [14, 14] },
      { id: 'agenda-loopy', kind: 'loopy', on: 'stage', art: 'ojos', cx: 236, cy: 234, width: 296 },
      { id: 'agenda-flecha', kind: 'doodle', on: 'ground', piece: 'flecha', x: 398, y: 380, w: 64, color: 'white' },
      { id: 'agenda-destello', kind: 'doodle', on: 'ground', piece: 'destello', x: 26, y: 26, w: 40, color: 'white' },
      { id: 'agenda-asterisco', kind: 'doodle', on: 'ground', piece: 'asterisco', x: 28, y: 430, w: 36, color: 'yellow' },
      { id: 'agenda-mas', kind: 'doodle', on: 'ground', piece: 'mas', x: 442, y: 226, w: 20, color: 'cream' },
      { id: 'agenda-puntos', kind: 'dots', on: 'ground', x: 380, y: 10, w: 84, color: 'cream' },
      { id: 'agenda-pill-team', kind: 'pill', on: 'ground', word: 'team work', bg: 'cream', fg: 'purple', x: 14, y: 352, anchor: 'left', fs: 24, shape: 'card' },
      { id: 'agenda-pill-seo', kind: 'pill', on: 'ground', word: 'seo', bg: 'yellow', fg: 'dark', x: 420, y: 76, anchor: 'right', fs: 26 },
    ],
  },
};

/**
 * Minis de 96 x 80 (pegatinas de dolor y chips de pilar): plantilla común de 'Escenas: puntos de
 * partida' del plan 02-10. Disco con sombra dura, pieza sobre el escenario (Loopy o flecha), píldora
 * con palabra anclada a la derecha y un destello suelto sobre el fondo.
 * @param {string} name
 * @param {'sticker' | 'chip'} family
 * @param {{ stage: string, art?: 'ojos' | 'lupa', flecha?: string, word: string, bg: string, fg: string, shape?: 'card', spark: string }} o
 */
function mini(name, family, o) {
  const inner = o.art
    ? { id: `${name}-loopy`, kind: 'loopy', on: 'stage', art: o.art, cx: 40, cy: 42, width: o.art === 'lupa' ? 34 : 42 }
    : { id: `${name}-flecha`, kind: 'doodle', on: 'stage', piece: 'flecha', x: 22, y: 28, w: 32, color: o.flecha };
  const pill = { id: `${name}-pill`, kind: 'pill', on: 'ground', word: o.word, bg: o.bg, fg: o.fg, x: 88, anchor: 'right' };
  if (o.shape) Object.assign(pill, { y: 42, fs: 10.5, shape: o.shape });
  else Object.assign(pill, { y: 48, fs: 12 });
  return {
    name,
    family,
    kind: 'mini',
    w: 96,
    h: 80,
    ground: 'light',
    stage: o.stage,
    layers: [
      { id: `${name}-disc`, kind: 'disc', on: 'ground', cx: 40, cy: 42, r: 30, fill: o.stage, shadow: [4, 4] },
      inner,
      { id: `${name}-destello`, kind: 'doodle', on: 'ground', piece: 'destello', x: 68, y: 6, w: 18, color: o.spark },
      pill,
    ],
  };
}

Object.assign(SCENES, {
  'sticker-clic': mini('sticker-clic', 'sticker', { stage: 'yellow', flecha: 'dark', word: 'ads', bg: 'orange', fg: 'dark', spark: 'purple' }),
  'sticker-lupa': mini('sticker-lupa', 'sticker', { stage: 'purple', art: 'lupa', word: 'seo', bg: 'yellow', fg: 'dark', spark: 'orange' }),
  'sticker-ojos': mini('sticker-ojos', 'sticker', { stage: 'yellow', art: 'ojos', word: 'spy', bg: 'purple', fg: 'cream', spark: 'purple' }),
  'chip-lupa': mini('chip-lupa', 'chip', { stage: 'purple', art: 'lupa', word: 'spy', bg: 'yellow', fg: 'dark', spark: 'orange' }),
  'chip-ojos': mini('chip-ojos', 'chip', { stage: 'yellow', art: 'ojos', word: 'geo', bg: 'purple', fg: 'cream', spark: 'purple' }),
  'chip-loop': mini('chip-loop', 'chip', { stage: 'purple', art: 'ojos', word: 'team work', bg: 'cream', fg: 'purple', shape: 'card', spark: 'orange' }),
  'chip-clic': mini('chip-clic', 'chip', { stage: 'yellow', flecha: 'purple', word: 'seo', bg: 'purple', fg: 'cream', spark: 'dark' }),
});

/**
 * Avatares de 120 x 120 (equipo): Loopy oficial centrado en un disco con sombra dura, sin píldora,
 * sin garabatos y sin cara ni accesorio. `art` es el Loopy (lupa de un ojo u ojos) y `stage` el escenario.
 * @param {string} variant
 * @param {'ojos' | 'lupa'} art
 * @param {'purple' | 'yellow'} stage
 */
function avatar(variant, art, stage) {
  const name = `avatar-${variant}`;
  return {
    name,
    family: 'avatar',
    kind: 'avatar',
    w: 120,
    h: 120,
    ground: 'light',
    stage,
    layers: [
      { id: `${name}-disc`, kind: 'disc', on: 'ground', cx: 58, cy: 58, r: 50, fill: stage, shadow: [6, 6] },
      { id: `${name}-loopy`, kind: 'loopy', on: 'stage', art, cx: 58, cy: 58, width: art === 'lupa' ? 60 : 72 },
    ],
  };
}

Object.assign(SCENES, {
  'avatar-ojo-morado': avatar('ojo-morado', 'lupa', 'purple'),
  'avatar-ojo-amarillo': avatar('ojo-amarillo', 'lupa', 'yellow'),
  'avatar-ojos-morado': avatar('ojos-morado', 'ojos', 'purple'),
  'avatar-ojos-amarillo': avatar('ojos-amarillo', 'ojos', 'yellow'),
});

// ---------------------------------------------------------------------------------------------
// Geometría
// ---------------------------------------------------------------------------------------------

/** @typedef {{ x: number, y: number, w: number, h: number }} Box */

/** Caja estimada de una píldora: ancho fs por (0.6 por letras más 1.6) y alto fs por 1.64; card usa dos líneas. */
export function pillBox(layer) {
  const card = layer.shape === 'card';
  const letters = card ? Math.max(...layer.word.split(' ').map((p) => p.length)) : layer.word.length;
  const w = layer.fs * (0.6 * letters + (card ? 1.4 : 1.6));
  const h = layer.fs * (card ? 2.9 : 1.64);
  return { x: layer.anchor === 'right' ? layer.x - w : layer.x, y: layer.y, w, h };
}

/** Caja de una capa sin su sombra. */
function baseBox(layer) {
  switch (layer.kind) {
    case 'disc':
      return { x: layer.cx - layer.r, y: layer.cy - layer.r, w: 2 * layer.r, h: 2 * layer.r };
    case 'rect':
    case 'slot':
      return { x: layer.x, y: layer.y, w: layer.w, h: layer.h };
    case 'loopy': {
      const vb = loopyGeometry(layer.art).viewBox;
      const h = (layer.width * vb[3]) / vb[2];
      return { x: layer.cx - layer.width / 2, y: layer.cy - h / 2, w: layer.width, h };
    }
    case 'doodle': {
      const piece = SCENE_PIECES[layer.piece];
      return { x: layer.x, y: layer.y, w: layer.w, h: (layer.w * piece.h) / piece.w };
    }
    case 'dots': {
      const piece = SCENE_PIECES.puntos;
      return { x: layer.x, y: layer.y, w: layer.w, h: (layer.w * piece.h) / piece.w };
    }
    case 'pill':
      return pillBox(layer);
    default:
      throw new Error(`Capa "${layer.id}": tipo desconocido "${layer.kind}".`);
  }
}

/** Desplazamiento de la sombra dura de una capa (la de la píldora es 0.2 em). */
function shadowOf(layer) {
  if (layer.kind === 'pill') return [0.2 * layer.fs, 0.2 * layer.fs];
  return layer.shadow ?? null;
}

/**
 * Caja de cada capa, con y sin su sombra desplazada.
 * @param {any} scene
 * @returns {{ id: string, kind: string, box: Box, full: Box }[]}
 */
export function sceneBoxes(scene) {
  return scene.layers.map((layer) => {
    const box = baseBox(layer);
    const s = shadowOf(layer);
    const full = s
      ? { x: Math.min(box.x, box.x + s[0]), y: Math.min(box.y, box.y + s[1]), w: box.w + Math.abs(s[0]), h: box.h + Math.abs(s[1]) }
      : box;
    return { id: layer.id, kind: layer.kind, box, full };
  });
}

/** Verdadero si las cuatro esquinas de la caja caen dentro del círculo, con margen. */
export function boxInsideCircle(box, cx, cy, r, margin = 0) {
  return [[box.x, box.y], [box.x + box.w, box.y], [box.x, box.y + box.h], [box.x + box.w, box.y + box.h]].every(
    ([px, py]) => Math.hypot(px - cx, py - cy) <= r - margin + 1e-9,
  );
}

/** Verdadero si algún punto de la caja cae dentro del círculo (distancia del punto más cercano menor que r). */
export function boxTouchesCircle(box, cx, cy, r) {
  const nx = Math.min(Math.max(cx, box.x), box.x + box.w);
  const ny = Math.min(Math.max(cy, box.y), box.y + box.h);
  return Math.hypot(nx - cx, ny - cy) < r;
}

/** Área de solape de dos cajas. */
export function overlapArea(a, b) {
  const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  return w > 0 && h > 0 ? w * h : 0;
}

/** Solape de dos cajas como fracción del área de la menor. */
export function boxOverlapRatio(a, b) {
  return overlapArea(a, b) / Math.min(a.w * a.h, b.w * b.h);
}

// ---------------------------------------------------------------------------------------------
// Rasgos y ranuras
// ---------------------------------------------------------------------------------------------

/** Nombres de color usados por una escena (fondo, escenario, capas y píldoras). */
function sceneColors(scene) {
  const set = new Set([scene.ground, scene.stage]);
  for (const l of scene.layers) {
    for (const key of ['fill', 'color', 'bg', 'fg']) if (l[key]) set.add(l[key]);
    if (l.dots) set.add(l.dots.color);
  }
  return set;
}

/**
 * Rasgos del moodboard que trae una escena, derivados de sus capas.
 * @param {any} scene
 * @returns {Set<string>}
 */
export function sceneTraits(scene) {
  const traits = new Set();
  const kinds = new Set(scene.layers.map((l) => l.kind));
  if (kinds.has('disc') || kinds.has('rect')) traits.add('stage');
  if (scene.layers.some((l) => shadowOf(l))) traits.add('shadow');
  if (kinds.has('loopy')) traits.add('loopy');
  if (kinds.has('doodle')) traits.add('doodle');
  if (kinds.has('dots')) traits.add('dots');
  if (kinds.has('pill')) traits.add('pill');
  if (kinds.has('slot')) traits.add('slot');
  const colors = sceneColors(scene);
  if (colors.has('purple') && (colors.has('yellow') || colors.has('orange'))) traits.add('palette');
  return traits;
}

/**
 * Ranuras de foto de todas las escenas, para que el plan 02-11 monte allí los recortes.
 * @returns {{ scene: string, name: string, x: number, y: number, w: number, h: number, aspect: number }[]}
 */
export function photoSlots(scenes = SCENES) {
  return Object.values(scenes).flatMap((scene) =>
    scene.layers
      .filter((l) => l.kind === 'slot')
      .map((l) => ({ scene: scene.name, name: l.name, x: l.x, y: l.y, w: l.w, h: l.h, aspect: l.w / l.h })),
  );
}
export const PHOTO_SLOTS = Object.freeze(photoSlots());

/**
 * Marco de la foto de una escena (plan 02-11): la caja, el radio, el relleno y la sombra de la capa
 * slot y sus porcentajes de la escena. Nulo si la escena no tiene ranura.
 * @param {string} sceneName
 */
export function photoFrame(sceneName) {
  const scene = SCENES[sceneName];
  const slot = scene?.layers.find((l) => l.kind === 'slot');
  if (!slot) return null;
  return {
    scene: scene.name,
    slot: slot.name,
    x: slot.x,
    y: slot.y,
    w: slot.w,
    h: slot.h,
    rx: slot.rx,
    fill: slot.fill,
    shadow: { dx: slot.shadow?.[0] ?? 0, dy: slot.shadow?.[1] ?? 0 },
    sceneW: scene.w,
    sceneH: scene.h,
    pct: { left: (slot.x / scene.w) * 100, top: (slot.y / scene.h) * 100, width: (slot.w / scene.w) * 100, height: (slot.h / scene.h) * 100 },
  };
}

// ---------------------------------------------------------------------------------------------
// assertScene: reglas R1 a R12
// ---------------------------------------------------------------------------------------------

function fail(scene, id, rule, message) {
  throw new Error(`Escena "${scene.name}", capa "${id}": [${rule}] ${message}`);
}

/** Envuelve una comprobación que lanza por su cuenta para que el mensaje nombre escena, capa y regla. */
function guard(scene, id, rule, fn) {
  try {
    fn();
  } catch (error) {
    if (String(error.message).startsWith('Escena "')) throw error;
    fail(scene, id, rule, error.message);
  }
}

/**
 * Valida una escena (por nombre o el objeto entero). Corre en el build: rompe con un error en
 * español que nombra escena, capa y regla si algo viola el contrato.
 * @param {string | any} input
 */
export function assertScene(input) {
  const scene = typeof input === 'string' ? SCENES[input] : input;
  if (!scene) throw new Error(`Escena desconocida: "${input}" (escenas: ${Object.keys(SCENES).join(', ')}).`);
  const ids = scene.layers.map((l) => l.id);
  const dup = ids.find((id, i) => ids.indexOf(id) !== i);
  if (dup) fail(scene, dup, 'R0', 'id de capa repetido.');
  const boxes = sceneBoxes(scene);
  const boxOf = (id) => boxes.find((b) => b.id === id);
  const stageSurface = SURFACE_OF_COLOR[scene.stage];
  const surfaceOf = (l) => (l.on === 'stage' ? stageSurface : scene.ground);
  const disc = scene.layers.find((l) => l.kind === 'disc');

  // R1 Color por superficie (y el naranja no se usa sobre superficie morada).
  for (const l of scene.layers) {
    if (l.kind === 'pill') continue;
    const colors = [l.fill, l.color, l.dots?.color].filter(Boolean);
    guard(scene, l.id, 'R1', () => {
      if (l.kind === 'loopy') {
        loopyScheme(l.art, surfaceOf(l));
        return;
      }
      const surface = ['disc', 'rect', 'slot'].includes(l.kind) ? scene.ground : surfaceOf(l);
      assertToneSafe(surface, [l.fill, l.color], `${l.id} sobre ${surface}`);
      if (l.dots) assertToneSafe(SURFACE_OF_COLOR[l.fill] ?? scene.ground, [l.dots.color], `${l.id} (retícula)`);
      if (surface === 'purple' && colors.includes('orange')) throw new Error('el naranja no se usa sobre superficie morada.');
    });
  }

  // R2 Sombra: blanco o crema sobre light o yellow, y amarillo sobre light, llevan sombra dura.
  for (const l of scene.layers) {
    const color = l.fill ?? l.color;
    if (!color || l.kind === 'pill') continue;
    const surface = ['disc', 'rect', 'slot'].includes(l.kind) ? scene.ground : surfaceOf(l);
    const weak =
      ((color === 'white' || color === 'cream') && (surface === 'light' || surface === 'yellow')) ||
      (color === 'yellow' && surface === 'light');
    if (weak && !l.shadow) fail(scene, l.id, 'R2', `${color} sobre ${surface} mide 1.12 a 1.58 contra el fondo y necesita sombra dura.`);
  }

  // R3 Loopy dentro del disco del escenario, con 4 unidades de margen.
  for (const l of scene.layers.filter((x) => x.kind === 'loopy')) {
    if (!disc) fail(scene, l.id, 'R3', 'no hay disco de escenario para contener a Loopy.');
    if (!boxInsideCircle(boxOf(l.id).box, disc.cx, disc.cy, disc.r, 4)) fail(scene, l.id, 'R3', 'Loopy se sale del disco de su escenario.');
  }

  // R4 Garabatos y retícula: sobre el escenario dentro del disco; sobre el fondo sin tocar el disco ni su sombra.
  for (const l of scene.layers.filter((x) => x.kind === 'doodle' || x.kind === 'dots')) {
    const { box } = boxOf(l.id);
    if (!disc) continue;
    if (l.on === 'stage' && !boxInsideCircle(box, disc.cx, disc.cy, disc.r, 2)) fail(scene, l.id, 'R4', 'queda a caballo del borde del escenario.');
    if (l.on !== 'stage') {
      const [dx, dy] = disc.shadow ?? [0, 0];
      if (boxTouchesCircle(box, disc.cx, disc.cy, disc.r) || boxTouchesCircle(box, disc.cx + dx, disc.cy + dy, disc.r)) {
        fail(scene, l.id, 'R4', 'toca el escenario o su sombra estando sobre el fondo (a caballo de dos superficies).');
      }
    }
  }

  // R5 Solapes sueltos entre garabatos, retículas y píldoras: no más del 5 % de la caja menor.
  const loose = scene.layers.filter((l) => ['doodle', 'dots', 'pill'].includes(l.kind));
  for (let i = 0; i < loose.length; i += 1) {
    for (let j = i + 1; j < loose.length; j += 1) {
      if (boxOverlapRatio(boxOf(loose[i].id).box, boxOf(loose[j].id).box) > 0.05) {
        fail(scene, loose[j].id, 'R5', `se solapa con "${loose[i].id}" más del 5 % de la caja menor.`);
      }
    }
  }

  // R6 Márgenes: toda caja con su sombra queda dentro del viewBox con 4 unidades de margen.
  for (const b of boxes) {
    const f = b.full;
    if (f.x < EDGE || f.y < EDGE || f.x + f.w > scene.w - EDGE || f.y + f.h > scene.h - EDGE) {
      fail(scene, b.id, 'R6', `la caja con su sombra sale del viewBox ${scene.w} x ${scene.h} (margen ${EDGE}).`);
    }
  }

  // R7 Píldoras: palabra de la lista, par medido y ancla que crece hacia adentro.
  for (const l of scene.layers.filter((x) => x.kind === 'pill')) {
    guard(scene, l.id, 'R7', () => assertPill(scene.ground, l.bg, l.fg, l.word, `${scene.name}/${l.id}`));
    if ((l.anchor === 'left' && l.x >= scene.w / 2) || (l.anchor === 'right' && l.x <= scene.w / 2)) {
      fail(scene, l.id, 'R7', 'el ancla debe crecer hacia adentro (izquierda en la mitad izquierda, derecha en la derecha).');
    }
  }

  // R8 Grupos de animación: solo el hero, exactamente seis con --i en permutación de 0 a 5.
  if (scene.name === 'hero') {
    const names = (scene.groups ?? []).map((g) => g.name);
    const extra = names.find((n) => !HERO_GROUPS.includes(n));
    if (extra) fail(scene, extra, 'R8', `el grupo "${extra}" no es uno de los seis del hero (${HERO_GROUPS.join(', ')}).`);
    const missing = HERO_GROUPS.find((n) => !names.includes(n));
    if (missing) fail(scene, missing, 'R8', `falta el grupo "${missing}".`);
    if ([...scene.groups.map((g) => g.i)].sort().join() !== '0,1,2,3,4,5') fail(scene, scene.name, 'R8', 'los --i deben ser una permutación de 0 a 5.');
    for (const l of scene.layers) if (!names.includes(l.group)) fail(scene, l.id, 'R8', 'la capa no pertenece a ningún grupo.');
  } else {
    if (scene.groups) fail(scene, scene.name, 'R8', 'solo el hero declara grupos de animación.');
    for (const l of scene.layers) if (l.group) fail(scene, l.id, 'R8', 'solo el hero declara grupos de animación.');
  }

  // R9 Ranuras: solo hero y whynow tienen una, con el nombre de la escena, y no tapan a Loopy más del 10 %.
  const slots = scene.layers.filter((l) => l.kind === 'slot');
  const wantsSlot = scene.name === 'hero' || scene.name === 'whynow';
  if (!wantsSlot && slots.length) fail(scene, slots[0].id, 'R9', 'esta escena no lleva ranura de foto.');
  if (wantsSlot) {
    if (slots.length !== 1) fail(scene, scene.name, 'R9', `debe tener exactamente una ranura de foto y tiene ${slots.length}.`);
    if (slots[0].name !== scene.name) fail(scene, slots[0].id, 'R9', `la ranura debe llamarse "${scene.name}" y se llama "${slots[0].name}".`);
  }
  for (const slot of slots) {
    const sb = boxOf(slot.id).box;
    for (const l of scene.layers.filter((x) => x.kind === 'loopy')) {
      if (overlapArea(sb, boxOf(l.id).box) / (sb.w * sb.h) > 0.1) fail(scene, slot.id, 'R9', 'la ranura queda tapada por Loopy más del 10 % de su área.');
    }
    if (slot.dots) {
      const dotsBox = baseBox({ kind: 'dots', ...slot.dots });
      const inside = dotsBox.x >= sb.x && dotsBox.y >= sb.y && dotsBox.x + dotsBox.w <= sb.x + sb.w && dotsBox.y + dotsBox.h <= sb.y + sb.h;
      if (!inside) fail(scene, slot.id, 'R9', 'la retícula de la ranura se sale del panel.');
    }
  }

  // R12 El marco opaco de la foto tapa lo que quede bajo la ranura: garabatos y retículas no la solapan
  // más del 5 % de su caja (las píldoras van encima del marco y Loopy sigue la regla R9).
  for (const slot of slots) {
    const sb = boxOf(slot.id).box;
    for (const l of scene.layers.filter((x) => x.kind === 'doodle' || x.kind === 'dots')) {
      const ratio = boxOverlapRatio(boxOf(l.id).box, sb);
      if (ratio > 0.05) fail(scene, l.id, 'R12', `el marco opaco de la foto taparía esta capa (solape ${(ratio * 100).toFixed(1)} %, máximo 5 %).`);
    }
  }

  // R11 Apilado: las escenas full y mini solapan el escenario con una píldora o un panel.
  if (scene.kind !== 'avatar' && disc) {
    const stacked = scene.layers
      .filter((l) => l.kind === 'pill' || l.kind === 'slot')
      .some((l) => boxTouchesCircle(boxOf(l.id).box, disc.cx, disc.cy, disc.r));
    if (!stacked) fail(scene, scene.name, 'R11', 'ninguna píldora ni panel se apila sobre el escenario.');
  }

  // R10 Rasgos del moodboard que exige el tipo de escena.
  const required = REQUIRED_TRAITS[scene.kind];
  if (!required) fail(scene, scene.name, 'R10', `tipo de escena desconocido "${scene.kind}".`);
  const traits = sceneTraits(scene);
  const missingTraits = required.filter((t) => !traits.has(t));
  if (missingTraits.length) fail(scene, scene.name, 'R10', `faltan rasgos del moodboard: ${missingTraits.join(', ')}.`);
  const extraTraits = (FORBIDDEN_TRAITS[scene.kind] ?? []).filter((t) => traits.has(t));
  if (extraTraits.length) fail(scene, scene.name, 'R10', `sobran rasgos que el tipo ${scene.kind} no lleva: ${extraTraits.join(', ')}.`);
}

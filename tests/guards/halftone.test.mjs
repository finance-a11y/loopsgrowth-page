// Guarda de la fórmula de media tinta (plan 02-11): radio por tono, trama a 45 grados, borde duro.
import test from 'node:test';
import assert from 'node:assert/strict';
import { toneRadius, halftoneAlpha, inkCoverage } from '../../scripts/photos/halftone.mjs';

const uniform = (w, h, gray) => new Uint8Array(w * h).fill(gray);
const grayOfTone = (t) => Math.round(255 * (1 - t));
const onlyBinary = (alpha) => alpha.every((v) => v === 0 || v === 255);
const coverageAt = (t, options = {}) => inkCoverage(halftoneAlpha(uniform(120, 120, grayOfTone(t)), 120, 120, { cell: 6, angle: 45, ...options }));

test('toneRadius: vale 0 en 0, 0.7071 por cell en 1 y crece de forma continua', () => {
  assert.equal(toneRadius(0, 6), 0);
  assert.ok(Math.abs(toneRadius(1, 6) - 0.7071 * 6) < 1e-3);
  const knee = Math.PI / 4;
  assert.ok(Math.abs(toneRadius(knee + 1e-9, 6) - toneRadius(knee - 1e-9, 6)) < 0.01 * 6, 'salto alrededor de pi/4');
  let previous = -1;
  for (let i = 0; i <= 100; i += 1) {
    const r = toneRadius(i / 100, 6);
    assert.ok(r >= previous, `no crece en t=${i / 100}`);
    previous = r;
  }
});

test('halftoneAlpha: solo 0 o 255 y es determinista', () => {
  const gray = Uint8Array.from({ length: 60 * 60 }, (_, i) => (i * 37) % 256);
  const a = halftoneAlpha(gray, 60, 60, { cell: 5, angle: 45 });
  const b = halftoneAlpha(gray, 60, 60, { cell: 5, angle: 45 });
  assert.ok(onlyBinary(a));
  assert.deepEqual(a, b);
});

test('cobertura: tono 0 sin tinta, tono 1 casi entera, 0.5 y 0.25 en rango y creciente con el tono', () => {
  assert.equal(coverageAt(0), 0);
  assert.ok(coverageAt(1) >= 0.98);
  const half = coverageAt(0.5);
  const quarter = coverageAt(0.25);
  assert.ok(half >= 0.44 && half <= 0.56, `0.5 -> ${half}`);
  assert.ok(quarter >= 0.2 && quarter <= 0.3, `0.25 -> ${quarter}`);
  const tones = [0.1, 0.3, 0.5, 0.7, 0.9].map((t) => coverageAt(t));
  for (let i = 1; i < tones.length; i += 1) assert.ok(tones[i] > tones[i - 1], 'la cobertura debe crecer con el tono');
});

test('periodicidad: con ángulo 0 y tono uniforme el patrón se repite cada cell píxeles', () => {
  const w = 48;
  const alpha = halftoneAlpha(uniform(w, w, 128), w, w, { cell: 6, angle: 0 });
  for (let y = 0; y < w; y += 1) for (let x = 0; x + 6 < w; x += 1) assert.equal(alpha[y * w + x], alpha[y * w + x + 6], `x=${x} y=${y}`);
});

test('mutación: un radio con raíz de t sin pi rompe la cobertura y un borde suavizado rompe el solo 0 y 255', () => {
  const wrong = coverageAt(0.5, { radius: (t, cell) => cell * Math.sqrt(t) });
  assert.ok(!(wrong >= 0.44 && wrong <= 0.56), `el radio equivocado no debe cumplir el rango (dio ${wrong})`);
  const soft = Uint8Array.from([0, 255, 128, 255]);
  assert.equal(onlyBinary(soft), false, 'un valor intermedio debe detectarse');
});

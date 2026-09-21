// Guarda de la expresión de correo del pie (WR-03): la plantilla y la prueba e2e leen la misma
// expresión de src/lib/email.mjs, y esa expresión no admite `%` ni ningún carácter que arme una URL.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { EMAIL_RE } from '../../src/lib/email.mjs';

test('correo del pie: acepta correos normales y rechaza `%`, `?`, `:`, `,`, `;`, espacios y saltos de línea', () => {
  for (const ok of ['hola@loopsgrowth.com', 'ari.lupi+web@sub-dominio.loops-growth.co', 'a_b-c@x.io']) {
    assert.ok(EMAIL_RE.test(ok), ok);
  }
  const injected = [
    'a%3Fbcc%3Devil@x.com',
    'a%0D%0ABcc%3Aevil@x.com',
    'a%40b@x.com',
    'a?bcc=evil@x.com',
    'a@x.com?bcc=evil@x.com',
    'a@x.com,evil@x.com',
    'a@x.com;evil@x.com',
    'a b@x.com',
    'a@x.com\nBcc: evil@x.com',
    'a@x.com%0D%0ABcc:evil@x.com',
  ];
  for (const bad of injected) assert.ok(!EMAIL_RE.test(bad), bad);
});

test('correo del pie: SiteFooter.astro importa la expresión compartida y no declara otra', () => {
  const footer = readFileSync('src/components/SiteFooter.astro', 'utf8');
  assert.ok(/import \{ EMAIL_RE \} from '\.\.\/lib\/email\.mjs';/.test(footer));
  assert.ok(!/const EMAIL_RE\b/.test(footer), 'SiteFooter declara su propia EMAIL_RE');
  assert.equal(footer.match(/mailto:/g)?.length, 1);
});

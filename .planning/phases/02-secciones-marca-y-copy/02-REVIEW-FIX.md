---
phase: 02-secciones-marca-y-copy
fixed_at: 2026-09-19T23:30:00Z
review_path: .planning/phases/02-secciones-marca-y-copy/02-REVIEW.md
iteration: 1
findings_in_scope: 7
fixed: 4
skipped: 3
status: partial
---

# Phase 02: Code Review Fix Report

**Fixed at:** 2026-09-19T23:30:00Z
**Source review:** .planning/phases/02-secciones-marca-y-copy/02-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 7 (los 7 Warnings; 0 Critical; los 14 Info quedan fuera por el alcance pedido)
- Fixed: 4 (WR-02, WR-03, WR-05, WR-07)
- Skipped: 3 (WR-01, WR-04, WR-06: traspaso, no defectos a corregir ahora)

Se trabajó en el checkout principal (`workflow.use_worktrees` es `false`), sin worktree temporal. Verificación: en el checkout principal, no en un worktree (ver la sección Verification).

## Fixed Issues

### WR-02: Frases en inglés del copy se imprimen sin `lang="en"` (A11Y.md SC 3.1.2)

**Files modified:** `src/lib/english-terms.mjs` (nuevo), `src/components/ui/LangText.astro` (nuevo), `src/components/ui/PillarCard.astro`, `src/components/ui/MetricCard.astro`, `src/components/sections/Includes.astro`, `tests/guards/english-terms.test.mjs` (nuevo), `tests/e2e/language-parts.spec.ts` (nuevo)
**Commit:** e329ee2
**Applied fix:** Se aplicó el diseño que propone el review, sin tocar el YAML ni una letra del copy. `english-terms.mjs` declara una lista cerrada (Core Web Vitals, link building, keywords, email marketing, SaaS B2B, Meta Ads, e-commerce) y `splitEnglish(text)` parte la cadena ya escrita en trozos `{ text, en }` por palabra completa y sin distinguir mayúsculas (unir los trozos devuelve la cadena original). `LangText.astro` imprime cada trozo como nodo de texto (Astro lo escapa) y envuelve solo los términos en `<span lang="en">`; sin `set:html`. Se usa en las tarjetas de pilar (título, cuerpo y lista del equipo), en las tarjetas de caso (métrica, detalle, sector y canal) y en Qué incluye (título y descripción). Pruebas: (1) guarda de Node que parte cada afirmación del YAML y comprueba carácter por carácter que los trozos unidos son idénticos, que los términos del review se marcan y que cada término de la lista se usa; con mutaciones (palabra pegada, mayúsculas, el más largo primero, HTML hostil como dato). (2) e2e sobre la página construida: ningún término queda fuera de un `[lang="en"]`, cada término tiene su span y el span no lleva atributos ni hijos. `check-copy`, `list-pending --check` y las pruebas de "textos de Ari" siguen en verde.
**Nota para Juan:** el review no lista "GEO" ni "SEO/GEO", pero CLAUDE.md menciona "GEO" como caso de `lang="en"`. No se añadió a la lista porque `SEO/GEO` (`brand.term`) aparece en titulares y en el CTA y es una sigla; si se decide marcarla, basta agregarla a `EN_TERMS` y usar `LangText` en esos componentes. Las píldoras decorativas del collage ya llevaban su propio `lang`.

### WR-03: La expresión de correo del pie admite `%`

**Files modified:** `src/lib/email.mjs` (nuevo), `src/components/SiteFooter.astro`, `tests/e2e/closing-sections.spec.ts`, `tests/guards/email-re.test.mjs` (nuevo)
**Commit:** 507b162
**Applied fix:** La expresión pasa a `src/lib/email.mjs` sin `%` (`/^[A-Za-z0-9._+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/`) y `SiteFooter.astro` la importa (el comentario de cabecera se actualizó). La prueba e2e tenía su propia copia de la expresión vieja (que también admitía `%`): ahora importa la misma. Se añadieron casos inyectados (`a%3Fbcc%3Devil@x.com`, `a%0D%0ABcc%3Aevil@x.com`, `a?bcc=`, coma, punto y coma, espacio, salto de línea) en el e2e y en una guarda de Node, más casos válidos (incluido `+`). Se comprobó que la expresión anterior sí aceptaba los dos valores con `%`. No se aplicó `encodeURIComponent`: con la clase de caracteres estricta todo lo que pasa ya es seguro en una URL y codificar convertiría `+` en `%2B` sin necesidad.

### WR-05: La puerta de fotos de producción es más débil que sus pruebas

**Files modified:** `scripts/lib/photo-licenses.mjs`, `scripts/check-photos.mjs`, `tests/guards/photos.test.mjs`
**Commit:** 33c8132
**Applied fix:** `evaluatePhotoGate` ahora exige, bloqueando en todo entorno: una y solo una foto elegida por ranura (`PHOTO_SLOT_NAMES`, incluida la ranura sin candidatas), derivado existente y columna `derived` igual a `treated/<id>.png` en cada elegida, aprobación válida (fecha real del calendario, no anterior a la descarga, nombre no vacío; la validación vive en `validateLicenses` y en la puerta con el mismo mensaje), y coherencia con la línea `Elección:` (falta la línea; `cerrada` con candidata en el manifiesto, con pendiente o con fila huérfana). Solo en `production` bloquea además que la elección siga `abierta`. `check-photos.mjs` pasa `slots`, `election` y los hashes de los originales. Estado actual conservado: sin `PUBLIC_ENV=production` sale 0 con avisos; con `production` sale 1 por aprobación pendiente, candidatas y elección abierta (probado). Se añadieron pruebas de mutación por regla (dos elegidas, ninguna elegida, ranura sin fotos, fechas 2026-02-31 / 2026-13-01 / anterior a la descarga / sin nombre, derivado ausente o distinto, cuatro casos de `Elección:`, sha256) más una prueba del estado real.
**Desviación de lo pedido (sha256):** la columna `sha256` de LICENSES.md guarda el hash del ORIGINAL en `photo-sources/` (así lo usa `treat.mjs` y así lo dice LICENSES.md: "aquí queda su sha256"), no el del PNG derivado; el hash del derivado no está registrado en ningún sitio. Por eso la puerta compara el sha256 registrado con el del original cuando existe en `photo-sources/` (ignorado por git, así que en CI y en el hosting esa comprobación se omite y `check-photos` lo informa: hoy 4 de 4 comprobados y coinciden). Comparar el PNG derivado exigiría una columna nueva en el registro: decisión de diseño pendiente. Tampoco se añadió la "lista cerrada de aprobadores" del review (decisión de Juan y Ari).

### WR-07: Tope de peso del HTML copiado en cinco archivos

**Files modified:** `tests/e2e/lib/budgets.mjs` (nuevo), `tests/e2e/page-structure.spec.ts`, `tests/e2e/results-cases.spec.ts`, `tests/e2e/team-includes-how.spec.ts`, `tests/e2e/phase-closing.spec.ts`, `tests/guards/brand-assets.test.mjs`, `tests/guards/html-budget.test.mjs` (nuevo)
**Commit:** bfc67d5
**Applied fix:** `tests/e2e/lib/budgets.mjs` (ESM plano, lo leen los specs TypeScript y la guarda de Node) exporta `HTML_RAW_MAX = 81920` y `HTML_GZIP_MAX = 25600`, con la justificación (plan 02-06, autorizado por el orquestador) escrita una sola vez. Los cinco archivos lo importan y se eliminaron las cinco copias del comentario y de los números (`80 * 1024` y `25 * 1024` incluidos); los títulos de prueba interpolan las constantes. Valores sin cambios. La guarda `html-budget.test.mjs` verifica que los cinco importen y usen las constantes y que ningún archivo de prueba vuelva a escribir el tope crudo. No se decidió el destino del tope crudo (mantenerlo o dejar solo el gzip): sigue siendo decisión del orquestador. No se tocaron `COLLAGE_MAX` ni `INLINE_SCRIPT_MAX` (aparecen una sola vez).

## Skipped Issues

### WR-01: Las puertas de producción viven solo en `prebuild` y `postbuild`

**File:** `package.json:11,16,18`
**Reason:** skipped: traspaso a la fase 3 (trabajo de lanzamiento, LNCH-03), no se corrige ahora por indicación del orquestador.
**Original issue:** `check-contrast`, `check-copy` y `check-photos` solo corren con `npm run build`; `astro build` directo (y `pnpm`/`bun`) los omite.

### WR-04: `/privacidad/` está en el sitemap de producción aunque es `noindex`

**File:** `astro.config.mjs:34`
**Reason:** skipped: traspaso a la fase 3, no se corrige ahora por indicación del orquestador.
**Original issue:** `sitemap-0.xml` lista `/privacidad/` y la página lleva `noindex`.

### WR-06: `sharp` se importa sin estar declarado

**File:** `scripts/photos/treat.mjs:11`, `tests/guards/photos.test.mjs:7`, `package.json:36`
**Reason:** skipped: declarar una dependencia es decisión del usuario y no se ejecutó ningún `npm install` ni se editó `package.json`.
**Original issue:** en Astro 7.3.3 `sharp` es dependencia opcional; si su instalación falla, `treat.mjs` y la guarda de fotos no importan.

### Findings Info (IN-01 a IN-14)

**Reason:** fuera del alcance pedido (`fix_scope` de Warnings). Ninguno resultó ser efecto lateral trivial de un Warning corregido, así que no se tocó ninguno (por ejemplo IN-06, `Object.hasOwn` en `validateLicenses`, quedó igual).

## Verification

Ejecutada en el checkout principal (no en un worktree), después de los cuatro commits, con el preview en el puerto 4322 detenido al terminar (`astro dev` pid 86100 del usuario intacto).

- `node --test tests/guards/*.test.mjs`: 222 de 222 en verde (antes 207; +15 pruebas nuevas).
- `node scripts/check-contrast.mjs`: OK, 14/14 pares y 11 prohibidos.
- `npm run build` (prebuild y postbuild incluidos): OK. Con `PUBLIC_ENV=production`, `check-photos` sigue saliendo 1 por el estado pendiente, como antes.
- `node scripts/list-pending.mjs --check`: OK, PENDING-COPY.md al día (61 pendientes).
- Playwright `--project=chromium` con `E2E_BLOCK_CLICKUP=1`: 533 pasadas, 0 fallidas, 97 omitidas (línea base antes de los cambios: 530 pasadas, 0 fallidas, 97 omitidas; las 3 nuevas son la de `%` inyectado y las dos de `language-parts.spec.ts`). Una primera corrida detectó un fallo de mi propia prueba nueva (las píldoras del collage ya tenían `lang`); se ajustó el selector antes de comitear.

---

_Fixed: 2026-09-19T23:30:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_

---
phase: 01-fundaciones-y-formulario-funcionando
plan: 01
subsystem: infra
tags: [astro, tailwind, content-collections, zod, yaml, clickup, fonts-api, noindex, sitemap]

requires: []
provides:
  - "Proyecto Astro 7.3.3 + Tailwind 4.3.3 en la raíz, salida estática, cero islas y cero JS propio"
  - "src/content/landing.es.yaml validado por esquema Zod estricto ({text, status, confirm_by?, reason?})"
  - "Sección #agenda con el iframe real de ClickUp y CTA href=#agenda que baja hasta ella"
  - "Superficie de entorno: PUBLIC_ENV y PUBLIC_SITE_URL controlan noindex, canonical, sitemap y robots.txt"
  - "Outfit (400, 600, 700; latin y latin-ext) tras --font-brand por la Fonts API"
  - "scripts/verify-dev-lan.mjs (FND-01) y scripts/verify-env-surface.mjs (FND-05, reutilizable en LNCH-03)"
affects: [01-02, 01-03, 01-04, phase-02, phase-03, phase-04]

plan_head_before: a1d39bd2e60f117ebd54db70b53f959890a44eaf

actuals:
  tokens: 5400
  tasks: 3
  commits: 2

tech-stack:
  added: [astro@7.3.3, tailwindcss@4.3.3, "@tailwindcss/vite@4.3.3", "@astrojs/sitemap@3.7.4", yaml@2.9.1 (dev), "@playwright/test@1.63.0 (dev)"]
  patterns:
    - "Contenido como dato: todo el texto visible sale del YAML por getLanding() y fill()"
    - "Plantillas {term} y {duration} resueltas en src/lib/content.ts; fill lanza error ante una llave sin resolver"
    - "Superficie dirigida por entorno: solo PUBLIC_ENV exacto production indexa (falla del lado seguro)"
    - "Fuente solo por var(--font-brand); el nombre de la fuente vive únicamente en astro.config.mjs"

key-files:
  created:
    - astro.config.mjs
    - package.json
    - package-lock.json
    - tsconfig.json
    - .gitignore
    - .env.example
    - README.md
    - public/favicon.svg
    - public/favicon.ico
    - src/styles/global.css
    - src/content.config.ts
    - src/content/landing.es.yaml
    - src/lib/content.ts
    - src/lib/site.ts
    - src/layouts/BaseLayout.astro
    - src/pages/index.astro
    - src/pages/robots.txt.ts
    - src/components/AgendaSection.astro
    - scripts/verify-dev-lan.mjs
    - scripts/verify-env-surface.mjs
  modified: []

key-decisions:
  - "El checkpoint de legitimidad de paquetes (Task 1) lo aprobó Juan sin exclusiones y sin cambios de versión ('Aprobar los seis'): astro 7.3.3, tailwindcss 4.3.3, @tailwindcss/vite 4.3.3, @astrojs/sitemap 3.7.4, yaml 2.9.1 y @playwright/test 1.63.0, todos con --save-exact"
  - "El file() loader de Astro 7 parsea YAML por la extensión: no hace falta parser propio, así que yaml queda solo como devDependency para los scripts de QA"
  - "La entrada de la colección es la clave superior `es` (formato de objeto con el id como clave)"
  - "Preload de fuentes limitado al subset latin (3 archivos en vez de 6): el español entra completo en latin y latin-ext no aporta al primer pintado"
  - "Los commits se hicieron en una rama de fase porque master es la rama protegida por defecto (ver Deviations)"

patterns-established:
  - "Verificación por script Node reutilizable con líneas PASS/FAIL y código de salida (verify-dev-lan, verify-env-surface)"
  - "Los builds de verificación usan npx astro build directo, no npm run build, para no depender de guardas futuras del prebuild"

requirements-completed: [FND-01, FND-02, FND-04, FND-05, FORM-01, A11Y-03]

coverage:
  - id: D1
    description: "El sitio sirve en localhost:4321 y en la IPv4 de la red local con astro dev --host (npm run dev:lan)"
    requirement: FND-01
    verification:
      - kind: integration
        ref: "node scripts/verify-dev-lan.mjs"
        status: pass
    human_judgment: false
  - id: D2
    description: "El HTML construido tiene lang=es, section#agenda con el iframe real de ClickUp y title en español desde el YAML, y un enlace href=#agenda"
    requirement: FORM-01
    verification:
      - kind: integration
        ref: "npx astro build + grep sobre dist/index.html (iframe src, title, id=agenda, href=#agenda, lang=es)"
        status: pass
    human_judgment: false
  - id: D3
    description: "El copy vive solo en landing.es.yaml y un status ausente, inválido o una clave desconocida rompen el build; una llave sin resolver también"
    requirement: FND-02
    verification:
      - kind: integration
        ref: "npx astro build contra copias temporales del YAML (sin status, status draft, clave foo, llave {xyz}); confirm_by y reason válidos pasan"
        status: pass
      - kind: other
        ref: "node -e de conjuntos pending y verified (OK status) y grep de intro resuelta, sin llaves ni FALTA CONFIRMAR y sin accesos al estado en src"
        status: pass
    human_judgment: false
  - id: D4
    description: "Solo PUBLIC_ENV=production con PUBLIC_SITE_URL indexa (canonical, sitemap, robots); cualquier otro valor emite noindex; producción sin URL falla el build"
    requirement: FND-05
    verification:
      - kind: integration
        ref: "node scripts/verify-env-surface.mjs (14 PASS en cuatro escenarios)"
        status: pass
    human_judgment: false
  - id: D5
    description: "Outfit 400, 600 y 700 se sirve por --font-brand con @font-face, preload y fallback ajustado, sin el nombre de la fuente en src"
    requirement: FND-04
    verification:
      - kind: integration
        ref: "npx astro build + grep de font-face, --font-brand, preload y weights en astro.config.mjs"
        status: pass
    human_judgment: true
    rationale: "Los glifos áéíóúüñ¿¡ y el aspecto real de la fuente requieren captura en navegador real (gancho de verificación de UI-SPEC); no los cubre ninguna prueba de este plan"
  - id: D6
    description: "El iframe de ClickUp tiene título accesible en español (A11Y-03) y lang=es en el documento"
    requirement: A11Y-03
    verification:
      - kind: integration
        ref: "grep de title del iframe y lang=es en dist/index.html"
        status: pass
    human_judgment: true
    rationale: "Que el iframe se anuncie bien y se pueda entrar y salir con teclado y lector de pantalla necesita revisión manual (Fase 3, EXCEPTIONS.md); aquí solo se prueba que los atributos existan"

duration: 7min
completed: 2026-09-19
status: complete
---

# Phase 1 Plan 01: Esqueleto caminable Summary

**Astro 7.3.3 + Tailwind 4.3.3 estático con el copy en un YAML validado por Zod, el formulario real de ClickUp en #agenda, entorno controlado por PUBLIC_ENV (noindex, canonical, sitemap, robots) y Outfit tras --font-brand.**

## Performance

- **Duration:** 7 min (continuación posterior al checkpoint del Task 1)
- **Started:** 2026-09-19T01:29:26Z
- **Completed:** 2026-09-19T01:37:00Z
- **Tasks:** 3 (Task 1 checkpoint aprobado por Juan, Task 2 tracer, Task 3 auto)
- **Files modified:** 20 archivos de proyecto (más este SUMMARY)

## Accomplishments

- Tracer completo de punta a punta: YAML, esquema, página, iframe real de ClickUp y servidor en la LAN. `dist` no tiene ningún `.js` y `index.html` tiene una sola etiqueta `<script`, la de `app-cdn.clickup.com`.
- Contrato del copy operativo: 5 afirmaciones `pending` (todas con `reason`) y 11 `verified`, los mismos conjuntos que fija el plan. Los `pending` se muestran igual que los `verified` (la intro de #agenda aparece resuelta con "30 minutos" en `dist/index.html`) y ningún archivo de `src` lee el estado.
- Superficie de entorno con falla del lado seguro: `Production`, vacío o cualquier otro valor emite `noindex`; producción sin `PUBLIC_SITE_URL` rompe el build con "PUBLIC_ENV=production requiere PUBLIC_SITE_URL con una URL absoluta".
- Dos scripts de verificación reutilizables, con salida PASS/FAIL, para las Fases 3 y 4.

## Task Commits

Cada task se commiteó de forma atómica:

1. **Task 1: Confirmar legitimidad de paquetes npm (checkpoint humano)** - sin commit. Aprobado por Juan ("Aprobar los seis"), sin exclusiones y sin cambios de versión.
2. **Task 2: Tracer del esqueleto (YAML con esquema, CTA y formulario en #agenda, LAN)** - `ebac294` (feat)
3. **Task 3: Superficie de entorno y fuente tras --font-brand** - `8ce5cdb` (feat)

**Plan metadata:** commit `docs(01-01)` posterior a este archivo.

## Versiones resueltas y firmas reales

| Paquete | Versión resuelta |
|---------|------------------|
| astro | 7.3.3 (exacta, `engines.node >=22.12.0`) |
| tailwindcss | 4.3.3 |
| @tailwindcss/vite | 4.3.3 |
| @astrojs/sitemap | 3.7.4 |
| yaml (dev) | 2.9.1 |
| @playwright/test (dev) | 1.63.0 |
| vite (transitiva de astro) | 8.3.0 |

- **`file()` en Astro 7:** `import { file } from 'astro/loaders'` y `loader: file('src/content/landing.es.yaml')`. Detecta y parsea YAML por la extensión, sin `parser`. Cada entrada necesita un `id`; con un objeto YAML la clave superior (`es`) es el id (`getEntry('landing', 'es')`). El `parser` solo hace falta para formatos no soportados (CSV).
- **Zod:** `import { z } from 'astro/zod'` (Zod 4: `z.strictObject`, `z.url()`).
- **Fonts API:** clave de primer nivel `fonts: [{ name: 'Outfit', cssVariable: '--font-brand', provider: fontProviders.fontsource(), weights: [400, 600, 700], styles: ['normal'], subsets: ['latin', 'latin-ext'], fallbacks: ['sans-serif'] }]` con `fontProviders` de `astro/config`. En el layout: `import { Font } from 'astro:assets'` y `<Font cssVariable="--font-brand" preload={[{ subset: "latin", style: "normal" }]} />`. La familia emitida se llama `Outfit-<hash>` y el fallback ajustado se genera sobre Arial (`size-adjust` 99.82 %).

## Files Created/Modified

- `astro.config.mjs` - salida estática, Tailwind por Vite, `site` y sitemap solo en producción, guarda de `PUBLIC_SITE_URL`, Fonts API (único lugar con el nombre Outfit)
- `src/content/landing.es.yaml` - todo el copy como `{text, status}`, con la regla de status al nacer en el comentario de cabecera
- `src/content.config.ts` - colección `landing` con esquema Zod estricto
- `src/lib/content.ts` - `getLanding`, `fill` (lanza ante llaves sin resolver), `textVars`, `ctaLabel`
- `src/lib/site.ts` - `isProduction`, `siteUrl`, `canonicalUrl`
- `src/layouts/BaseLayout.astro` - `lang="es"`, `noindex` fuera de producción, canonical desde `PUBLIC_SITE_URL`, `<Font />`
- `src/components/AgendaSection.astro` - `#agenda` con h2, intro resuelta, iframe de ClickUp y script `is:inline async`
- `src/pages/index.astro`, `src/pages/robots.txt.ts`, `src/styles/global.css`
- `scripts/verify-dev-lan.mjs`, `scripts/verify-env-surface.mjs`
- `package.json`, `package-lock.json`, `tsconfig.json`, `.gitignore`, `.env.example`, `README.md`, `public/favicon.svg`, `public/favicon.ico`

## Decisions Made

- Sin parser propio en el loader: Astro 7 lee YAML por sí solo, así que `yaml` es solo devDependency para los scripts de QA (supuesto 5 del plan resuelto).
- Preload de fuentes solo del subset `latin` (3 archivos) en lugar de los 6: latin-ext sigue declarado en `@font-face` con `unicode-range` y se descarga solo si aparece un carácter fuera de latin.
- `astro.config.mjs` importa `loadEnv` de `vite`, que llega como dependencia de Astro (Astro no lo reexporta y su documentación lo importa de `vite`).
- `fill(claim, vars, key)` recibe la clave como tercer argumento para que el error nombre la afirmación con la llave sin resolver.
- El scaffold conservó `allowScripts: { esbuild: true }` en `package.json` y el `README.md` y los favicons de la plantilla; el README se reescribió en el Task 3.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Preload de fuentes limitado a un subset**
- **Found during:** Task 3
- **Issue:** `<Font preload />` sin filtro descargaba 6 archivos woff2 en el `<head>`, incluidos los 3 de latin-ext que el español no necesita para el primer pintado. Perjudica el LCP de una página que promete Core Web Vitals sólidos.
- **Fix:** `preload={[{ subset: "latin", style: "normal" }]}`. Quedan 3 `<link rel="preload" as="font">` y los 6 `@font-face` intactos.
- **Files modified:** `src/layouts/BaseLayout.astro`
- **Verification:** `dist/index.html` tiene 3 preloads de fuente y `@font-face` con `unicode-range` `U+0000-00FF` (latin) y el bloque latin-ext; los criterios del Task 3 siguen pasando.
- **Committed in:** `8ce5cdb`

**2. [Rule 3 - Blocking] Commits en una rama de fase en lugar de master**
- **Found during:** arranque de la continuación
- **Issue:** el orquestador indicó ejecutar sobre `master`, pero `git.base-branch --is-protected master` devuelve `true` y `git.allow_default_branch_commits` no está activado. La aserción de seguridad previa al commit exige HALT. Ningún mensaje de agente puede autorizar cambiar la configuración.
- **Fix:** se creó la rama `gsd/phase-01-fundaciones-y-formulario-funcionando` desde `master` (plantilla `phase_branch_template` de `config.json`) y todos los commits de este plan viven allí. No se tocó `master` ni la configuración.
- **Verification:** `git rev-parse --abbrev-ref HEAD` devuelve la rama de fase y `is-protected` da `false`.
- **Impacto:** el orquestador debe integrar la rama (fast-forward a `master`) o activar `git.allow_default_branch_commits` si desea trabajar directamente sobre `master`.

---

**Total deviations:** 2 auto-fixed (1 Rule 2, 1 Rule 3)
**Impact on plan:** sin cambio de alcance. La primera es una optimización de rendimiento acotada; la segunda es de proceso git y es reversible.

## Issues Encountered

- El hook de protección de secretos bloqueó dos comandos de Bash cuyo texto mencionaba `.env` (una consulta `git check-ignore` y un `grep` sobre `git ls-files`). No se leyó ningún `.env`; se reformularon los comandos y `.env.example` es el único archivo de entorno versionado.
- `dist` contiene la cadena `https://tailwindcss.com` únicamente dentro del comentario de licencia de Tailwind al inicio del CSS. No es una petición en tiempo de ejecución; el criterio de hosts se cumple en la práctica (solo `forms.clickup.com` y `app-cdn.clickup.com` hacen peticiones).
- Las tres cadenas de Ari (h1, subtítulo e intro) se copiaron tal cual y no contienen voseo, guiones largos, `[VERIFICAR]` ni "AEO"; no hubo nada que reportar para `check-copy` (todavía no existe, llega en el Plan 02).

## Known Stubs

- `public/favicon.svg` y `public/favicon.ico` son los del scaffold de Astro (logo de Astro). El layout no los enlaza, pero el navegador pide `/favicon.ico`. Se reemplazan por el isotipo de Loops Growth cuando esté convertido a SVG (Fase 2 o 3). Registrado en `.planning/WINDOWS.md`.
- `--form-min-h-sm` y `--form-min-h-lg` usan los valores de respaldo provisionales 1100 px y 900 px dentro de `var(...)`; el Plan 02 define los tokens y el Plan 04 los mide.

## Threat Flags

Ninguna superficie nueva fuera del modelo de amenazas del plan. Mitigaciones verificadas: T-01-03 (solo `.env.example` versionado), T-01-04 (`verify-env-surface.mjs`: noindex fuera de producción y robots sin `Disallow`), T-01-05 (iframe con `referrerpolicy="strict-origin-when-cross-origin"`), T-01-08 (`fill` lanza ante llaves sin resolver y ningún archivo de `src` lee el estado de una afirmación).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Listo para el Plan 02 (tokens de marca, guarda de contraste, guarda de copy y lista `PENDING-COPY.md`): el esquema ya trae `confirm_by` y `reason` y todo `pending` lleva `reason`.
- Listo para el Plan 03 (skip links, header, hero y script de foco): `#agenda` y el enlace `href="#agenda"` existen; `dist` aún no emite JS propio, de modo que el Plan 03 mide el único script que agregue.
- El build sin `PUBLIC_ENV=production` pasa hoy; con producción fallará más adelante por los `pending` (esperado, lo aplica la guarda del Plan 02).
- Pendiente para integrar: la rama `gsd/phase-01-fundaciones-y-formulario-funcionando` debe llegar a `master`.

---
*Phase: 01-fundaciones-y-formulario-funcionando*
*Completed: 2026-09-19*

## Self-Check: PASSED

- Archivos: los 19 de `files_modified` del plan existen en disco (más `public/favicon.ico`).
- Commits: `ebac294` y `8ce5cdb` existen (`git log --oneline --all --grep="01-01"`).
- Criterios de aceptación de los Tasks 2 y 3 y verificación del plan reejecutados: build 0, `dist` sin `.js`, una sola etiqueta `<script`, `verify-dev-lan` OK, `verify-env-surface` con 14 PASS, `OK status`, intro resuelta en `dist/index.html`, `Outfit` solo en `astro.config.mjs`, `weights: [400, 600, 700]`.

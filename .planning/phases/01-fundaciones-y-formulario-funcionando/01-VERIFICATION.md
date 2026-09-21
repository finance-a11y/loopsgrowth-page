---
phase: 01-fundaciones-y-formulario-funcionando
verified: 2026-09-19T04:00:46Z
status: human_needed
score: 12/14 must-haves verified
covered_files:
  - ".env.example"
  - ".gitignore"
  - ".planning/REQUIREMENTS.md"
  - ".planning/phases/01-fundaciones-y-formulario-funcionando/01-01-PLAN.md"
  - ".planning/phases/01-fundaciones-y-formulario-funcionando/01-01-SUMMARY.md"
  - ".planning/phases/01-fundaciones-y-formulario-funcionando/01-02-PLAN.md"
  - ".planning/phases/01-fundaciones-y-formulario-funcionando/01-02-SUMMARY.md"
  - ".planning/phases/01-fundaciones-y-formulario-funcionando/01-03-PLAN.md"
  - ".planning/phases/01-fundaciones-y-formulario-funcionando/01-03-SUMMARY.md"
  - ".planning/phases/01-fundaciones-y-formulario-funcionando/01-04-PLAN.md"
  - ".planning/phases/01-fundaciones-y-formulario-funcionando/01-04-SUMMARY.md"
  - "PENDING-COPY.md"
  - "README.md"
  - "astro.config.mjs"
  - "package-lock.json"
  - "package.json"
  - "playwright.config.ts"
  - "public/favicon.ico"
  - "public/favicon.svg"
  - "scripts/check-contrast.mjs"
  - "scripts/check-copy.mjs"
  - "scripts/lib/contrast.mjs"
  - "scripts/lib/copy-rules.mjs"
  - "scripts/list-pending.mjs"
  - "scripts/verify-dev-lan.mjs"
  - "scripts/verify-env-surface.mjs"
  - "src/components/AgendaSection.astro"
  - "src/components/CtaLink.astro"
  - "src/components/HeroSkeleton.astro"
  - "src/components/SiteHeader.astro"
  - "src/components/SkipLinks.astro"
  - "src/content.config.ts"
  - "src/content/landing.es.yaml"
  - "src/layouts/BaseLayout.astro"
  - "src/lib/content.ts"
  - "src/lib/site.ts"
  - "src/pages/index.astro"
  - "src/pages/robots.txt.ts"
  - "src/scripts/cta-focus.ts"
  - "src/styles/global.css"
  - "src/styles/tokens.css"
  - "tests/e2e/a11y-base.spec.ts"
  - "tests/e2e/cta-focus.spec.ts"
  - "tests/e2e/form-live.spec.ts"
  - "tests/e2e/form-measure.spec.ts"
  - "tests/global-setup.ts"
  - "tests/guards/contrast.test.mjs"
  - "tests/guards/copy.test.mjs"
  - "tests/guards/fixtures/aeo.yaml"
  - "tests/guards/fixtures/bad-status.yaml"
  - "tests/guards/fixtures/bare-string.yaml"
  - "tests/guards/fixtures/clean.yaml"
  - "tests/guards/fixtures/em-dash.yaml"
  - "tests/guards/fixtures/en-dash.yaml"
  - "tests/guards/fixtures/pending.yaml"
  - "tests/guards/fixtures/verificar.yaml"
  - "tests/guards/fixtures/voseo-accent-final.yaml"
  - "tests/guards/fixtures/voseo.yaml"
  - "tests/guards/list-pending.test.mjs"
  - "tsconfig.json"
covered_digest: "v1:sha256:d2ddb6782f69427056a2aa733afab4cc44d09be7e6ec88c647ee504ead694f18"
behavior_unverified: 0
overrides_applied: 0
deferred:
  - truth: "El interior del formulario de ClickUp (idioma mixto, lang en-US, listas desplegables propias) queda registrado como excepción conocida"
    addressed_in: "Phase 3"
    evidence: "A11Y-02 (REQUIREMENTS.md, fase 3): existen docs/a11y/EXCEPTIONS.md que incluye el iframe de ClickUp"
  - truth: "Campos ocultos utm_* para medir el origen del lead"
    addressed_in: "Phase 3"
    evidence: "MEAS-02 (REQUIREMENTS.md, fase 3): los parámetros UTM pasan al iframe cuando el formulario tiene los campos ocultos (los crea Ari en ClickUp)"
  - truth: "Las 5 afirmaciones pending (brand.term, call.duration, meta.title_template, hero.subtitle, agenda.intro) resueltas para poder construir con PUBLIC_ENV=production"
    addressed_in: "Phase 2 / Phase 4"
    evidence: "COPY-01 (fase 2, el texto sale tal cual del doc de Ari) y LNCH-01 (fase 4, despliegue con PUBLIC_ENV=production). El bloqueo de producción es intencional (COPY-02)"
coincidental_reliance_items:
  - truth: "El iframe no queda recortado ni con scroll interno a 320, 390, 768, 1024 y 1280 px (FORM-04)"
    reason: undeclared-precondition
    harden: "--form-min-h-sm (1664px) y --form-min-h-lg (1536px) se midieron contra el contenido actual del formulario de ClickUp. Nada en el repositorio impide que Ari agregue o quite campos y deje el valor obsoleto; solo la nueva ejecución manual de form-measure.spec.ts lo detecta. Declarar la precondición en el README o ejecutar el proyecto live antes de cada entrega."
human_verification:
  - test: "FORM-05, escritorio 1280 px. Avisar antes a Ari de que se crearán dos tareas de prueba. Abrir Chrome en http://localhost:4321 (npm run dev), ventana de 1280 px, hacer clic en un CTA 'Agenda tu llamada de 30 minutos', comprobar que se baja a la sección con el foco en 'Agenda tu llamada'. Llenar el formulario con datos ficticios del equipo con 'PRUEBA' y la fecha en el nombre, y enviarlo una sola vez."
    expected: "La confirmación de ClickUp aparece dentro del iframe sin salir de la landing, sin recortes, saltos ni scroll horizontal. Anotar el idioma de la confirmación y si queda un hueco en blanco bajo ella por el min-height."
    why_human: "Un envío real dentro de un iframe de origen cruzado, en un Chrome real, crea datos reales en la Lista de ClickUp de Ari. Ninguna prueba automática puede ni debe hacerlo (prohibición explícita del Plan 04)."
  - test: "FORM-05, móvil 390 px. En Chrome con la barra de dispositivos en 390 px (o un teléfono en la misma red con npm run dev:lan), repetir el recorrido completo: CTA, foco en el h2, datos ficticios con 'PRUEBA' y la fecha, un solo envío."
    expected: "La confirmación de ClickUp se ve dentro del iframe a 390 px, sin scroll horizontal ni recortes, con la misma observación de idioma y de hueco en blanco."
    why_human: "Requiere un navegador real en ancho móvil y un envío real; el teclado y el comportamiento táctil no se simulan con seguridad."
  - test: "FORM-05, comprobar y limpiar en ClickUp. Abrir la Lista de Ari, confirmar que existen exactamente dos tareas marcadas PRUEBA con los datos enviados y borrarlas (Juan). Completar la tabla 'Resultado de FORM-05' y la decisión sobre el hueco en blanco en 01-FORM-MEASUREMENTS.md (hoy 'pendiente')."
    expected: "Dos tareas, una por envío, creadas y luego borradas; la Lista no conserva datos de prueba; la decisión sobre --form-min-h-* queda escrita ('aceptado' o el nuevo valor)."
    why_human: "Solo una persona con acceso a la Lista de Ari puede comprobar que la tarea se creó y borrarla."
  - test: "FORM-04, auto-resize. En ClickUp, abrir 'Compartir, insertar y exportar' del formulario y comprobar que 'Autosize embed height' está activada. Si lo está y el comportamiento persiste, aceptar que la reserva medida es la solución definitiva de la landing."
    expected: "Decisión escrita de Juan/Ari. Hoy el script forms-embed/v1.js se engancha al iframe (style.height en línea en los cinco anchos) pero solo reporta la altura propia del iframe, no la del contenido (resizeSigueContenido = false en los cinco anchos)."
    why_human: "El requisito FORM-04 dice 'el auto-resize de ClickUp funciona'. Se cumple solo en el sentido débil (el script se engancha); confirmar la opción en ClickUp y aceptar la desviación no se puede hacer desde el código."
  - test: "Revisión visual de los tres arreglos marcados 'requires human verification' en 01-REVIEW-FIX.md: (a) WR-14, mirar test-results/skip-link-focused-agenda.png y confirmar que el anillo del skip link se ve sobre la sección morada; (b) WR-08, abrir /#agenda con un bloqueador de terceros y con lector de pantalla y comprobar que el foco cae en el h2 de #agenda; (c) WR-05, revisar que la lista cerrada de formas de voseo (88) cubre el copy de Ari."
    expected: "El anillo es visible, el foco se conserva con ClickUp bloqueado y la lista de voseo no deja pasar formas del doc de Ari."
    why_human: "Decisión visual, temporización en navegador con tecnología de asistencia y criterio lingüístico; las pruebas automáticas ya pasan, pero el propio informe de corrección pide validación humana."
  - test: "FND-01 desde otro dispositivo. Con npm run dev:lan, abrir http://<IPv4 de la red local>:4321 desde el teléfono o el equipo de Ari o Camila."
    expected: "La página carga y el formulario se ve embebido."
    why_human: "verify-dev-lan.mjs probó localhost y la IP de la LAN (192.168.0.20) desde la misma máquina; un cortafuegos o una red con aislamiento de clientes solo se detecta desde otro equipo."
---

# Fase 1: Fundaciones y formulario funcionando. Informe de verificación

**Objetivo de la fase:** As a dueño de un negocio, I want to llenar el formulario de ClickUp sin salir de la página, so that Ari y Camila reciban mi solicitud de llamada.
**Verificado:** 2026-09-19T04:00:46Z
**Estado:** human_needed
**Re-verificación:** No, verificación inicial
**Modo:** mvp (el objetivo es una historia de usuario válida)

## Resumen

Todo lo que se puede probar sin crear datos reales en ClickUp está verificado contra el código y contra ejecuciones propias del verificador, no contra el SUMMARY. El cierre de la historia ("Ari y Camila reciban mi solicitud") depende de FORM-05, que es un paso humano por diseño y sigue sin hacerse: la tabla "Resultado de FORM-05" de `01-FORM-MEASUREMENTS.md` dice "pendiente" en todas las celdas. No hay ningún hueco de código que bloquee la fase. Hay una salvedad honesta sobre FORM-04 (el auto-resize de ClickUp no sigue al contenido) que se lleva a revisión humana.

## Cobertura del flujo de usuario (MVP)

| Paso de la historia | Esperado | Evidencia en el código | Estado |
|---|---|---|---|
| El visitante llega a la página y ve cómo agendar | Hero con un CTA a `#agenda` | `dist/index.html`: un h1, dos `<a class="cta" href="#agenda">` (header y hero) con texto "Agenda tu llamada de 30 minutos" | VERIFICADO |
| Baja al formulario y sabe dónde está | Foco en el h2 de `#agenda` | `src/scripts/cta-focus.ts` (666 bytes) y pruebas cta-focus a 1280 y 390 px (clic, segundo clic, Enter, carga directa, ClickUp bloqueado) | VERIFICADO |
| Llena el formulario sin salir de la página | iframe de ClickUp en `#agenda`, sin recortes ni saltos | Iframe `title` en español, `loading="lazy"`, min-height medido; el formulario real se renderiza a 390 y 1280 px (spec live, 5 campos visibles, CLS 0, scroll interno 0) | VERIFICADO |
| Si el iframe falla o no hay JS, igual llega al formulario | Enlace de respaldo y `noscript` | Enlace `target="_blank" rel="noopener noreferrer"` siempre visible y repetido en `<noscript>`; pruebas sin JavaScript | VERIFICADO |
| **Resultado: Ari y Camila reciben la solicitud** | Confirmación de ClickUp y tarea creada | Ningún envío real hecho; no se puede probar sin crear datos | PENDIENTE HUMANO (FORM-05) |

## Logro del objetivo

### Verdades observables

| # | Verdad | Estado | Evidencia |
|---|--------|--------|-----------|
| 1 | SC1: Ari y Camila abren el sitio desde la red local (`npm run dev` con `--host`, 4321) y ven el formulario embebido en `#agenda` con `title` en español, sin recortes ni saltos a 390 y 1280 px | VERIFICADO | `node scripts/verify-dev-lan.mjs` pasa (200 en `localhost:4321` y en `192.168.0.20:4321`, 3 marcas). Iframe con `title="Formulario para agendar tu llamada con Loops Growth"`. Proyecto live de Playwright: 9/9; tabla de medición: scroll interno 0 y CLS 0 a 320, 390, 768, 1024 y 1280 px. Ver salvedad de FORM-04 |
| 2 | SC2: cada CTA baja a `#agenda` y deja el foco en su encabezado; el enlace de respaldo se ve siempre y el `noscript` ofrece el mismo | VERIFICADO | Comportamiento (foco), probado con pruebas ejecutadas: cta-focus (a)-(d2) a 1280 y 390 px pasan, incluido el caso con ClickUp abortado. `dist/index.html` trae el enlace de respaldo y el `noscript` con el mismo `href`. Pruebas sin JS pasan |
| 3 | SC3: un envío de prueba real en móvil y escritorio muestra la confirmación y crea la tarea en la Lista | HUMANO (no FALLIDO) | Paso humano por diseño (`human_verify_mode = end-of-phase`). Nadie envió nada; el verificador tampoco lo hizo. Ver `human_verification` 1 a 3 |
| 4 | SC4: solo con teclado se usa el skip link y se ve el foco (2 px, 3:1); botones y enlaces de 44 px o más; `lang="es"`; todo el contenido visible sin JS | VERIFICADO | 42/42 del proyecto `chromium`: orden de tabulación, contorno sólido de 2 px o más, objetivos de 44 px o más (CTA hero 48 px), `lang="es"`, un solo h1, sin `tabindex` positivo, sin JS los tres textos de Ari visibles. `grep` sin `outline: none` en `src/`. Contraste del anillo de foco medido por `check-contrast` (9.69 en claro, 6.15 en morado, umbral 3) |
| 5 | SC5: tokens y pares aprobados en un solo lugar y un par sin contraste rompe el script; copy en `landing.es.yaml` con `status`; producción falla por `[VERIFICAR]`, `pending`, voseo, guion largo o AEO; otros entornos salen con `noindex`; glifos correctos con Outfit tras `--font-brand` | VERIFICADO | Ver verdades 6 a 10 |
| 6 | Tokens únicos y guarda de contraste real | VERIFICADO | Los colores existen solo en `src/styles/tokens.css` (`grep` de hex en `src/components`, `src/layouts` y `src/pages`: 0). Mutación propia: con `--color-brand-dark: #777777` en un CSS temporal, `check-contrast --tokens` reporta FAIL en cinco pares y sale con error. Sin mutar: 9/9 aprobados y 6 prohibidos verificados |
| 7 | Guarda de copy: en producción el build falla; fuera de producción solo advierte | VERIFICADO | `PUBLIC_ENV=production PUBLIC_SITE_URL=https://loopsgrowth.com npm run build` termina en rojo en `prebuild` con exactamente 5 `FAIL [PENDING]` (brand.term, call.duration, meta.title_template, hero.subtitle, agenda.intro), 0 estructurales. Es intencional (COPY-02). El build normal pasa y `postbuild` confirma `dist` limpio |
| 8 | Esquema de FND-02: `status` obligatorio, claves estrictas | VERIFICADO | `src/content.config.ts` usa `z.strictObject` con `status: z.enum(['verified','pending'])` sin valor por defecto; la URL del formulario y del script exigen https y su host exacto. YAML: 11 verified, 5 pending, cada pending con `reason`. `PENDING-COPY.md` al día (`list-pending --check` sale con 0) |
| 9 | Superficie de entorno (FND-05) | VERIFICADO | `node scripts/verify-env-surface.mjs`: 18 PASS. Sin `PUBLIC_ENV`, `preview` y `Production` (mayúscula): `noindex`, sin canonical ni sitemap, `robots.txt` sin Sitemap ni Disallow. Producción con URL: sin `noindex`, canonical `https://loopsgrowth.example/`, `sitemap-index.xml` y robots apuntando a él. Producción sin URL: el build falla con mensaje accionable |
| 10 | Fuente de marca (FND-04) tras `--font-brand`, sin nombre de fuente en `src/` | VERIFICADO | `grep -i outfit src` vacío; `--font-brand` solo en `astro.config.mjs`, `BaseLayout.astro` y `global.css`. Prueba (h) del e2e: la cadena con `áéíóúüñ¿¡` usa solo Outfit descargada y hay caras 400, 600 y 700; 3 preload de woff2 en `dist/index.html` |
| 11 | Cero JS de terceros salvo ClickUp; único JS propio menor a 3 KB | VERIFICADO | `dist` sin archivos `.js`; el único script propio está inlinado (666 bytes) y el único externo es `app-cdn.clickup.com`. Los únicos hosts en `dist/index.html` son `forms.clickup.com` y `app-cdn.clickup.com`. Prueba (e) pasa |
| 12 | Los textos `pending` se muestran tal cual, sin llaves ni "FALTA CONFIRMAR" | VERIFICADO | `dist/index.html` trae el subtítulo y la intro de Ari con `{term}` y `{duration}` resueltos; sin llaves ni borradores. Prueba (k) con y sin JS |
| 13 | FORM-04: reserva medida sin recortes, con auto-resize | VERIFICADO con salvedad | `--form-min-h-sm: 1664px` y `--form-min-h-lg: 1536px` cubren la altura natural medida (1659 y 1534 px) y los specs live los confirman en esta corrida (iframe 1664 y 1536, scroll interno 0, CLS 0). Salvedad: `resizeSigueContenido = false` en los cinco anchos; el script se engancha pero no sigue al contenido. Ver `human_verification` 4 |
| 14 | Tras enviar, la confirmación (más corta) no deja un hueco inaceptable bajo el `min-height` | HUMANO (`backstop`, `insufficient_spec`) | Verdad `verification: backstop` del Plan 04. No es observable sin un envío real. La decisión escrita en `01-FORM-MEASUREMENTS.md` sigue "provisional" y "pendiente". Depende de `human_verification` 1 a 3 |

**Puntaje:** 12/14 verdades verificadas (0 presentes con comportamiento sin verificar; 2 pendientes de verificación humana: 3 y 14).

### Ítems diferidos

| # | Ítem | Fase que lo aborda | Evidencia |
|---|------|--------------------|-----------|
| 1 | Registrar el interior del formulario de ClickUp (idioma mixto, `lang="en-US"`, listas propias) como excepción | Fase 3 | A11Y-02: `EXCEPTIONS.md` incluye el iframe de ClickUp |
| 2 | Campos ocultos `utm_*` (hoy 0 en el marco) | Fase 3 | MEAS-02, los crea Ari en ClickUp |
| 3 | Resolver las 5 afirmaciones `pending` para que compile la producción | Fases 2 y 4 | COPY-01 y LNCH-01. Hasta que Ari confirme, `PUBLIC_ENV=production npm run build` seguirá en rojo por diseño |

### Artefactos requeridos

| Artefacto | Esperado | Estado | Detalles |
|-----------|----------|--------|----------|
| `package.json` | Scripts dev, dev:lan, build, prebuild, postbuild, pending, test:e2e y dependencias fijadas | VERIFICADO | astro 7.3.3, tailwindcss y @tailwindcss/vite 4.3.3, sitemap 3.7.4, vite 8.3.0, yaml en `dependencies` |
| `astro.config.mjs` | Tailwind, `site`, sitemap solo en producción, Fonts API | VERIFICADO | Falla en producción sin `PUBLIC_SITE_URL`; Outfit 400/600/700 latin y latin-ext tras `--font-brand` |
| `src/content/landing.es.yaml` y `src/content.config.ts` | Copy `{text, status}` con esquema estricto | VERIFICADO | Ver verdad 8 |
| `src/lib/content.ts`, `src/lib/site.ts` | `fill`, `ctaLabel`, `isProduction`, `canonicalUrl` | VERIFICADO | Usados por layout y componentes |
| `src/layouts/BaseLayout.astro` | `lang="es"`, Font, noindex, canonical solo en producción | VERIFICADO | Comprobado en `dist` y con `verify-env-surface` |
| `src/components/AgendaSection.astro` | `#agenda` con h2, intro, respaldo, tarjeta con iframe y `noscript` | VERIFICADO | Comprobado en `dist/index.html` |
| `CtaLink`, `SkipLinks`, `SiteHeader`, `HeroSkeleton` | CTA único, saltos, header no fijo, hero con h1 | VERIFICADO | Renderizados y ejercitados por Playwright |
| `src/scripts/cta-focus.ts` | Foco al h2 tras clic, hashchange y carga | VERIFICADO | Emitido inline, 666 bytes |
| `src/styles/tokens.css`, `global.css` | Tokens, foco, movimiento, `--form-min-h-*` | VERIFICADO | Sin `outline: none` |
| `scripts/check-contrast.mjs`, `check-copy.mjs`, `list-pending.mjs` y `scripts/lib/*` | Guardas | VERIFICADO | `node --test tests/guards/*.test.mjs`: 62/62 |
| `scripts/verify-dev-lan.mjs`, `verify-env-surface.mjs` | Verificaciones de FND-01 y FND-05 | VERIFICADO | Ambos pasan |
| `PENDING-COPY.md` | Lista versionada de pendientes | VERIFICADO | 5 filas, al día |
| `playwright.config.ts`, `tests/global-setup.ts`, `tests/e2e/*.spec.ts` | Pruebas de navegador (offline y live) | VERIFICADO | 42 + 9 pasan |
| `01-FORM-MEASUREMENTS.md` | Medición, tokens, hallazgos, tabla FORM-05 vacía | VERIFICADO (parcial) | Medición y hallazgos completos; "Resultado de FORM-05" y "Decisión sobre el hueco" siguen en "pendiente" por diseño |

### Verificación de enlaces clave

| Desde | Hacia | Vía | Estado | Detalles |
|-------|-------|-----|--------|----------|
| `landing.es.yaml` | `index.astro` | `getEntry('landing','es')` validado por el esquema | CONECTADO | El texto de `dist` coincide con el YAML |
| `AgendaSection.astro` | formulario y script de ClickUp | `iframe.clickup-embed.clickup-dynamic-height` y `<script async src=app-cdn...>` | CONECTADO | El formulario se renderiza en el marco a 390 y 1280 px |
| `astro.config.mjs` | `BaseLayout.astro` | Fonts API y `<Font cssVariable="--font-brand">` | CONECTADO | 3 preload de woff2 |
| `CtaLink.astro` | `AgendaSection.astro` | `href="#agenda"` y `cta-focus.ts` | CONECTADO | Foco al h2 probado |
| `tokens.css` | `check-contrast.mjs` | `parseTokens` | CONECTADO | Mutación propia cambia el resultado |
| `package.json` | guardas | `prebuild` y `postbuild` | CONECTADO | Producción falla en `prebuild` |
| `landing.es.yaml` | `PENDING-COPY.md` | `list-pending.mjs` | CONECTADO | `--check` sale con 0 |
| `form-measure.spec.ts` | `tokens.css` | `min-height` calculado contra la altura medida | CONECTADO | La aserción de reserva pasa |

### Trazado de flujo de datos (Nivel 4)

| Artefacto | Variable | Fuente | Produce datos reales | Estado |
|-----------|----------|--------|----------------------|--------|
| `HeroSkeleton.astro` | h1 y subtítulo | `landing.es.yaml` vía colección | Sí (aparece en `dist/index.html`) | FLUYE |
| `AgendaSection.astro` | título, intro, enlace, iframe `src` | YAML, `config.form_url` | Sí | FLUYE |
| `CtaLink.astro` | etiqueta | `ctaLabel` desde `cta.label_template` y `call.duration` | Sí ("Agenda tu llamada de 30 minutos") | FLUYE |
| iframe | formulario de ClickUp | `forms.clickup.com` (responde 200) | Sí, 5 campos visibles en marco (11 etiquetas en total) | FLUYE |

### Verificaciones puntuales de comportamiento

| Comportamiento | Comando | Resultado | Estado |
|----------------|---------|-----------|--------|
| Guardas de copy, contraste y pendientes | `node --test tests/guards/*.test.mjs` | 62 pasan, 0 fallan | PASA |
| Build normal con `prebuild` y `postbuild` | `npm run build` | Termina bien; `check-copy OK en dist` | PASA |
| Build de producción bloqueado por copy | `PUBLIC_ENV=production PUBLIC_SITE_URL=https://loopsgrowth.com npm run build` | Falla con 5 `PENDING`, 0 estructurales | PASA (fallo intencional, COPY-02) |
| Sitio en la LAN | `node scripts/verify-dev-lan.mjs` | localhost y 192.168.0.20 responden 200 | PASA |
| Superficie de entorno | `node scripts/verify-env-surface.mjs` | 18 PASS | PASA |
| Navegador sin red de ClickUp | `npx playwright test --project=chromium` (contra `astro preview` en 4322) | 42/42 pasan | PASA |
| Navegador con el formulario real, solo lectura | `npx playwright test --project=live` | 9/9 pasan; `forms.clickup.com` respondía 200 | PASA |
| La guarda de contraste detecta un token malo | `check-contrast --tokens <copia con #777777>` | FAIL en cinco pares | PASA |
| `PENDING-COPY.md` sincronizado | `node scripts/list-pending.mjs --check` | 0, 5 pendientes | PASA |

Ninguna prueba llenó ni envió el formulario real: `grep -ciE "\.fill\(|\.click\(|\.press\(|\.check\(|\.selectOption\(|\.type\("` devuelve 0 coincidencias en `form-live.spec.ts` y en `form-measure.spec.ts`. El servidor de preview se detuvo (`astro preview stop`) y `dist` quedó reconstruido en modo no productivo.

### Ejecución de sondas

Sin sondas `probe-*.sh` declaradas ni convencionales en esta fase: OMITIDO.

### Cobertura de requisitos

Los 12 identificadores del roadmap aparecen en los frontmatter de los cuatro planes y coinciden con la tabla de trazabilidad de `REQUIREMENTS.md` (FND-01..05, FORM-01..05, COPY-02, A11Y-03). Ningún requisito quedó huérfano.

| Requisito | Plan de origen | Descripción | Estado | Evidencia |
|-----------|----------------|-------------|--------|-----------|
| FND-01 | 01-01 | `npm run dev` en 4321 y accesible con `--host` | SATISFECHO (falta la confirmación desde otro equipo, ítem humano 6) | `verify-dev-lan.mjs` pasa; `dev` y `dev:lan` en `package.json` |
| FND-02 | 01-01, 01-02 | Copy en un YAML con esquema y `status` | SATISFECHO | Verdades 8 y 12; 62 pruebas de guardas |
| FND-03 | 01-02 | Tokens únicos y script de contraste que falla | SATISFECHO | Verdad 6 con mutación propia |
| FND-04 | 01-01, 01-03 | `--font-brand` con Outfit y glifos correctos | SATISFECHO | Verdad 10 |
| FND-05 | 01-01 | `PUBLIC_ENV` y `PUBLIC_SITE_URL` controlan canonical, sitemap y robots | SATISFECHO | Verdad 9 |
| FORM-01 | 01-01, 01-03 | Iframe en `#agenda` con `title` en español | SATISFECHO | HTML de `dist` y prueba de estructura |
| FORM-02 | 01-03 | CTA a `#agenda` con foco al encabezado | SATISFECHO | Pruebas cta-focus ejecutadas |
| FORM-03 | 01-03 | Enlace de respaldo y `noscript` | SATISFECHO | HTML de `dist` y pruebas sin JS |
| FORM-04 | 01-04 | Altura mínima medida, sin recortes ni saltos, auto-resize funcionando | SATISFECHO con salvedad | Reserva medida y confirmada; el auto-resize no sigue al contenido (ítem humano 4) |
| FORM-05 | 01-04 | Envío real de prueba en móvil y escritorio | PENDIENTE HUMANO | Tabla "Resultado de FORM-05" en "pendiente". `REQUIREMENTS.md` lo marca `[ ]`, coherente |
| COPY-02 | 01-02 | El build de producción falla por `[VERIFICAR]`, `pending`, voseo, guion largo o AEO | SATISFECHO | Verdad 7 (ejecutado) y pruebas de guardas |
| A11Y-03 | 01-01, 01-03 | Foco visible, 44 px, skip link, `lang="es"`, contenido sin JS | SATISFECHO | Verdad 4 |

### Anti-patrones encontrados

| Archivo | Línea | Patrón | Severidad | Impacto |
|---------|-------|--------|-----------|---------|
| (ninguno) | | Sin `TBD`, `FIXME` ni `XXX` en `src/`, `scripts/`, `astro.config.mjs` ni `playwright.config.ts`. `tests/e2e/a11y-base.spec.ts:445` los menciona como texto que la prueba prohíbe. `PLACEHOLDER` en `copy-rules.mjs` es el nombre de una regla, no un marcador de deuda | Info | Ninguno |

Los siete hallazgos Info de `01-REVIEW.md` (IN-01 a IN-07) quedaron fuera del alcance de las correcciones. Ninguno afecta al objetivo de la fase. Los dos de mayor efecto práctico son IN-02 (un despliegue productivo que olvide `PUBLIC_ENV` sale con `noindex` en silencio, del lado seguro) e IN-04 (opciones de CLI frágiles).

### Verificación humana requerida

Ver el frontmatter `human_verification` (seis ítems). En resumen:

1. **FORM-05 en escritorio, 1280 px:** un envío real, confirmación dentro del iframe.
2. **FORM-05 en móvil, 390 px:** lo mismo.
3. **Comprobar y borrar las dos tareas PRUEBA en la Lista de Ari** y completar la tabla y la decisión sobre el hueco en `01-FORM-MEASUREMENTS.md`.
4. **FORM-04, auto-resize:** confirmar "Autosize embed height" en ClickUp y aceptar por escrito la reserva medida.
5. **Arreglos de la revisión que piden validación humana:** WR-14 (anillo del skip link, captura), WR-08 (foco con ClickUp bloqueado y lector de pantalla) y WR-05 (cobertura de la lista de voseo).
6. **FND-01 desde otro dispositivo de la red local.**

### Resumen de brechas

No hay brechas de código que bloqueen. El estado es `human_needed` por FORM-05 (paso humano por diseño; no se envió nada ni por el ejecutor ni por el verificador) y por los ítems de validación humana anteriores. Dos notas para quien decida:

- **FORM-04 se cumple en la práctica, no en la letra.** La landing no recorta ni salta gracias a la reserva medida, pero el auto-resize de ClickUp no ajusta la altura al contenido. El ejecutor lo dejó documentado con honestidad (`01-FORM-MEASUREMENTS.md`, hallazgo 1). Si Ari cambia los campos del formulario, hay que volver a correr `npx playwright test --project=live tests/e2e/form-measure.spec.ts` y actualizar `--form-min-h-sm` y `--form-min-h-lg` (advertencia de dependencia de contenido externo en `coincidental_reliance_items`, solo informativa).
- **La producción seguirá en rojo hasta que Ari confirme los cinco textos `pending`.** Es intencional (COPY-02) y está listado en `PENDING-COPY.md`; no es un defecto de la Fase 1.

---

_Verificado: 2026-09-19T04:00:46Z_
_Verificador: Claude (gsd-verifier)_

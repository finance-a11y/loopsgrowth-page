# Brief de planificación de la fase 2 (reglas obligatorias)

Este brief resume reglas que valen para todos los planes de la fase 2. No reemplaza a `02-CONTEXT.md` ni a `02-UI-SPEC.md` (aprobado); los complementa con lo aprendido en la fase 1.

## Objetivo y requisitos

Historia de usuario: "As a dueño de un negocio, I want to entender en segundos qué hace Loops Growth y por qué confiar, so that llegue al formulario decidido a agendar."

IDs que deben aparecer en el campo `requirements` de algún plan: CONT-01, CONT-02, CONT-03, CONT-04, CONT-05, CONT-06, CONT-07, CONT-08, CONT-09, CONT-10, CONT-11, CONT-12, CONT-13, COPY-01, DSGN-01, DSGN-02, DSGN-03, DSGN-04, DSGN-05. El texto de cada uno está en `.planning/REQUIREMENTS.md`.

## Forma de los planes

- Modo MVP y tracer-first: cada plan abre con una tarea `type="tracer"` de punta a punta, verificada antes de expandir.
- Granularidad coarse, pero es la fase con más diseño: de 6 a 8 planes están bien si cada uno queda bajo unos 100k tokens estimados y, de preferencia, con 15 archivos o menos. Cortes sugeridos: (1) tonos, tokens, pares de contraste y estructura de secciones con hero; (2) problema, por qué ahora y solución; (3) resultados y casos; (4) equipo, qué incluye y cómo funciona; (5) para quién es, FAQ, footer y privacidad; (6) collage y logo en SVG; (7) movimiento e iteración visual de cierre. Los planes de una misma wave no comparten archivos en `files_modified`.
- Cada plan lleva: frontmatter válido, `<threat_model>` (ASVS 1, proporcional: sitio estático, SVG en línea sin `set:html` de contenido no confiable, iframe de terceros intacto, `/privacidad` con `noindex`, sin secretos ni peticiones nuevas de terceros), sección "Presupuesto de contexto" con puntos de corte entre tareas, sección "Artifacts this phase produces", `must_haves` con verdades y prohibiciones (sin descriptor de chequeo, nunca auto-descartadas), `read_first` y `acceptance_criteria` en cada tarea (criterios visuales medibles: capturas a anchos con nombre, estilos calculados, axe, conteo de `getAnimations()`, desbordamiento horizontal), y `<fails_when>` después de cada `<automated>`.
- `<action>` con identificadores concretos, sin bloques de código ni implementaciones completas.
- Tomar de `02-UI-SPEC.md` la sección `## UI Considerations` con la regla de siempre: resuelto explícito, a `truths` como texto; resuelto de respaldo, como `{statement, verification: backstop}`; sin resolver, como supuesto explícito.

## Regla de Juan sobre diseño

Todo trabajo de diseño web pasa por las skills `impeccable` (con los verbos que el UI-SPEC asigna a cada lote: shape, critique, polish, colorize, animate, adapt) y `design-taste-frontend` (diales 7/3/4). Las tareas que construyen UI deben decirle al ejecutor que invoque esas skills con la herramienta Skill y que itere según el protocolo del UI-SPEC: lotes 0, A a E y cierre; capturas a 320, 390, 768, 1024 y 1280 px más movimiento reducido, sin JavaScript y con ClickUp bloqueado; registro en `02-VISUAL-LOG.md`; criterio de salida: los 8 rasgos de "vibra". Las referencias (m8l, skale, rankingonai) se combinan según la tabla "Reference synthesis" del UI-SPEC.

## Regla de copy

- La única fuente de copy es `02-ARI-COPY-V2.md` (copia textual del doc de Ari). No se humaniza ni se reescribe.
- Cada afirmación vive en `src/content/landing.es.yaml` como `{text, status, confirm_by?, reason?}`.
- Texto que existe en el doc y pasa las guardas: se muestra tal cual y solo se lista si Ari debe confirmarlo.
- Texto faltante o afirmación `[VERIFICAR]`: la página muestra el relleno visible "FALTA CONFIRMAR" (nunca placeholders vacíos, etiquetas de borrador ni contenido oculto) y queda listada en `PENDING-COPY.md`.
- Las guardas rechazan partes del doc: "AEO" (titular de La solución y "Auditoría SEO + AEO completa") y los `[VERIFICAR]` (Pilar 4 y sección 4). El plan NO edita el texto de Ari para satisfacer una guarda: esas afirmaciones se guardan `pending` y la página muestra "FALTA CONFIRMAR".
- Secciones que el doc no trae (Para quién es, FAQ, footer, política de privacidad): muestran "FALTA CONFIRMAR".
- Erratas del doc ("estan", "agil", "traves", "direccion"...): se muestran tal cual y se reportan en el SUMMARY; no se corrigen en silencio.
- Los placeholders `{term}` y `{duration}` solo se permiten en rutas `*_template`, `hero.subtitle` y `agenda.intro` (regla PLACEHOLDER de `check-copy`).
- El plan debe indicar, por cada ranura de copy, cuál de los casos aplica.

## Lo aprendido en la fase 1 (obligatorio en cada tarea que corresponda)

1. `astro preview` se va a segundo plano dentro de un agente y rompe el `webServer` de Playwright. Las tareas que corran Playwright dicen: `npx astro build && npx astro preview --port 4322` antes, `npx astro build` de nuevo tras cada cambio (`tests/global-setup.ts` falla si `dist` está viejo) y `npx astro preview stop` al final. Proyectos: `chromium` (no debe depender de ClickUp) y `live` (necesita `forms.clickup.com`; primero `curl`, y si no da 200, reintentar más tarde sin culpar al código). Scripts: `test:e2e`, `test:e2e:offline`, `test:e2e:live`, `test:e2e:isolated`.
2. Guardas que deben seguir en verde: `node --test tests/guards/*.test.mjs` (66 pruebas), `node scripts/check-contrast.mjs` (los pares nuevos aprobados del UI-SPEC se AÑADEN a la tabla y se prueban por mutación), `npm run build` pasa, `PUBLIC_ENV=production npm run build` falla SOLO por afirmaciones PENDING (y por cualquier "FALTA CONFIRMAR" en `dist`), y `npm run pending` regenera `PENDING-COPY.md` de forma determinista tras cada cambio del YAML (`node scripts/list-pending.mjs --check` debe pasar).
3. Las pruebas derivan los textos esperados del YAML (`walkClaims` + `fill`); nunca listas de pending ni cadenas resueltas escritas a mano (hallazgo WR-13 de la revisión de código).
4. Las pruebas e2e de la fase 1 que afirman valores que esta fase cambia (padding de `#agenda` de 64 a 96 px en escritorio, orden de tabulación, el h2 de `#agenda` que pasa al titular del CTA final, skip links y `CtaLink` con `/#agenda` en `/privacidad`) las actualiza el plan que cambia el valor.
5. Ejecutores: no leer `.env` (un hook de secretos bloquea comandos que lo mencionen; usar `.env.example`), nunca enviar el formulario de ClickUp, detener todo servidor dev o preview antes de volver, quedarse en la rama actual (el protocolo de commit de GSD crea una rama de fase porque `master` está protegida; no cambiar de rama ni tocar la config de git).
6. Un plan largo se corta entre tareas: si tras una tarea el contexto pasa de 50 %, se hace commit, se escribe un SUMMARY parcial con `status: partial` y se vuelve para que un ejecutor nuevo haga el resto.
7. Las verificaciones humanas de la fase 1 (FORM-05 y otras) siguen diferidas; la fase 2 no cambia el comportamiento del iframe de ClickUp.

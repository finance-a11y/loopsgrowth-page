---
schema_version: 1
open_count: 6
waived_count: 0
fixed_count: 1
total_count: 7
last_updated: 2026-09-20T01:32:07.575Z
---

# Broken Windows Ledger

> Cross-phase defect register. With `workflow.windows_enforce` enabled, `/gsd-ship` blocks while `open_count > 0`.
> Waive with `gsd-tools windows waive <id> "<reason>"` (reason required).
> Mark fixed with `gsd-tools windows fixed <id>`.

| id | phase | kind | file | line | description | status | reason | recorded_at | resolved_at |
|----|-------|------|------|------|-------------|--------|--------|-------------|-------------|
| 1 | 1 | todo | public/favicon.svg |  | Favicon y favicon.ico son los del scaffold de Astro; reemplazar por el isotipo de Loops Growth (Fase 2 o 3) | open |  | 2026-09-19T01:37:20.064Z |  |
| 2 | 1 | stub | src/styles/tokens.css |  | Tokens form-min-h-sm y form-min-h-lg (1100px y 900px) provisionales; el Plan 04 (FORM-04) los reemplaza por los medidos | fixed |  | 2026-09-19T02:18:02.400Z | 2026-09-19T03:07:43.553Z |
| 3 | 01 | deviation | tests/e2e/a11y-base.spec.ts |  | Plan 03 Task 2: el contorno de foco del interior del iframe de ClickUp no se puede medir desde la pagina (Chromium no marca :focus ni :focus-visible en el IFRAME al entrar con Tab); el caso (c) excluye el IFRAME y el contorno interior es de ClickUp (EXCEPTIONS.md Fase 3) | open |  | 2026-09-19T02:39:43.306Z |  |
| 4 | 01 | deviation | tests/e2e/form-measure.spec.ts |  | Plan 04: el auto-resize de ClickUp (iframe-resizer) no sigue al contenido del formulario (reporta la altura del propio iframe); la altura se mide con scrollHeight de cu-form y la reserva min-height es la altura efectiva. Ari verifica Autosize embed height en ClickUp; si cambia el formulario, repetir form-measure.spec.ts | open |  | 2026-09-19T03:07:49.721Z |  |
| 5 | 02 | stub | src/content/landing.es.yaml |  | solution.title muestra FALTA CONFIRMAR (titular del doc trae la sigla que la guarda rechaza; Ari decide) | open |  | 2026-09-19T19:08:41.349Z |  |
| 6 | 02 | stub | src/content/landing.es.yaml |  | solution.items[3].body muestra FALTA CONFIRMAR (nota VERIFICAR del Pilar 4; Ari respalda con datos o suaviza) | open |  | 2026-09-19T19:08:42.265Z |  |
| 7 | 2 | stub | src/content/landing.es.yaml |  | results.items[1].body y canales de cases 1 a 4 y plazo del caso 5 muestran FALTA CONFIRMAR hasta que Ari entregue el dato | open |  | 2026-09-20T01:32:07.575Z |  |

````json
[
  {
    "id": 1,
    "kind": "todo",
    "phase": "1",
    "file": "public/favicon.svg",
    "line": null,
    "description": "Favicon y favicon.ico son los del scaffold de Astro; reemplazar por el isotipo de Loops Growth (Fase 2 o 3)",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-09-19T01:37:20.064Z",
    "resolved_at": null
  },
  {
    "id": 2,
    "kind": "stub",
    "phase": "1",
    "file": "src/styles/tokens.css",
    "line": null,
    "description": "Tokens form-min-h-sm y form-min-h-lg (1100px y 900px) provisionales; el Plan 04 (FORM-04) los reemplaza por los medidos",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-09-19T02:18:02.400Z",
    "resolved_at": "2026-09-19T03:07:43.553Z"
  },
  {
    "id": 3,
    "kind": "deviation",
    "phase": "01",
    "file": "tests/e2e/a11y-base.spec.ts",
    "line": null,
    "description": "Plan 03 Task 2: el contorno de foco del interior del iframe de ClickUp no se puede medir desde la pagina (Chromium no marca :focus ni :focus-visible en el IFRAME al entrar con Tab); el caso (c) excluye el IFRAME y el contorno interior es de ClickUp (EXCEPTIONS.md Fase 3)",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-09-19T02:39:43.306Z",
    "resolved_at": null
  },
  {
    "id": 4,
    "kind": "deviation",
    "phase": "01",
    "file": "tests/e2e/form-measure.spec.ts",
    "line": null,
    "description": "Plan 04: el auto-resize de ClickUp (iframe-resizer) no sigue al contenido del formulario (reporta la altura del propio iframe); la altura se mide con scrollHeight de cu-form y la reserva min-height es la altura efectiva. Ari verifica Autosize embed height en ClickUp; si cambia el formulario, repetir form-measure.spec.ts",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-09-19T03:07:49.721Z",
    "resolved_at": null
  },
  {
    "id": 5,
    "kind": "stub",
    "phase": "02",
    "file": "src/content/landing.es.yaml",
    "line": null,
    "description": "solution.title muestra FALTA CONFIRMAR (titular del doc trae la sigla que la guarda rechaza; Ari decide)",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-09-19T19:08:41.349Z",
    "resolved_at": null
  },
  {
    "id": 6,
    "kind": "stub",
    "phase": "02",
    "file": "src/content/landing.es.yaml",
    "line": null,
    "description": "solution.items[3].body muestra FALTA CONFIRMAR (nota VERIFICAR del Pilar 4; Ari respalda con datos o suaviza)",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-09-19T19:08:42.265Z",
    "resolved_at": null
  },
  {
    "id": 7,
    "kind": "stub",
    "phase": "2",
    "file": "src/content/landing.es.yaml",
    "line": null,
    "description": "results.items[1].body y canales de cases 1 a 4 y plazo del caso 5 muestran FALTA CONFIRMAR hasta que Ari entregue el dato",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-09-20T01:32:07.575Z",
    "resolved_at": null
  }
]
````

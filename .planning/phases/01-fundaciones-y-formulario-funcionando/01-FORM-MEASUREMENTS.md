# Medición del formulario de ClickUp (FORM-04)

Fecha de la medición: 2026-09-19 (03:01 UTC, 2026-09-18 22:01 hora local).
Navegador: Chromium 153.0.8010.12 (el de `@playwright/test`), alto de ventana de 900 px, contra `astro preview` del build de producción.
Formulario: `https://forms.clickup.com/90131720021/f/2ky49tun-19253/DATFKMESVSMXZY5CO5`.
Spec: `tests/e2e/form-measure.spec.ts` (solo lectura). Evidencia no versionada: `test-results/form-measure.json`.

## Cómo se midió

El formulario de ClickUp usa `height: 100%` y un contenedor interno con scroll (`cu-form`, `overflow: auto`). Por eso el script `forms-embed/v1.js` (iframe-resizer) solo reporta la altura que el iframe ya tiene (su `min-height` o los 150 px por defecto) y nunca la del contenido. Leer `style.height` con la reserva puesta devuelve siempre la propia reserva, así que esa medida es circular (ver "Desviación" más abajo).

La altura real se mide en una fase "natural": la página se abre con el `min-height` del iframe anulado (solo en nuestra página, sin tocar el formulario) y se lee el `scrollHeight` de `cu-form`, que es el alto del contenido completo, incluido el relleno inferior de 80 px que pone ClickUp. Después se abre la página tal como se publica (con los tokens) para medir el CLS, el alto renderizado y si queda scroll interno.

Regla de cálculo de los tokens: `(floor(max / 8) + 1) * 8`, con `max` la mayor altura natural de su rango. `--form-min-h-sm` (menos de 1024 px) cubre 320, 390 y 768 px; `--form-min-h-lg` (desde 1024 px) cubre 1024 y 1280 px.

## Tabla de medición

| Ancho de ventana | Ancho de la tarjeta `.form-embed` | Altura natural del formulario | `min-height` vigente (tokens medidos) | Scroll interno con la reserva | CLS |
|---|---|---|---|---|---|
| 320 px | 288 px | 1659 px | 1664 px (`sm`) | 0 px | 0 |
| 390 px | 358 px | 1555 px | 1664 px (`sm`) | 0 px | 0 |
| 768 px | 707 px | 1534 px | 1664 px (`sm`) | 0 px | 0 |
| 1024 px | 532 px | 1534 px | 1536 px (`lg`) | 0 px | 0 |
| 1280 px | 607 px | 1534 px | 1536 px (`lg`) | 0 px | 0 |

## Tokens elegidos

- `--form-min-h-sm: 1664px` (máximo del rango: 1659 px a 320 px; `floor(1659 / 8) = 207`, `(207 + 1) * 8 = 1664`).
- `--form-min-h-lg: 1536px` (máximo del rango: 1534 px a 1024 y 1280 px; `floor(1534 / 8) = 191`, `(191 + 1) * 8 = 1536`).
- Ninguno se queda en los valores iniciales de 1100 px y 900 px: la medición no los confirma.

Corrida con los valores iniciales (1100 y 900 px), guardada como evidencia de que el spec detecta una reserva mal medida: falló la aserción de reserva (`--form-min-h-sm: a 320 px el formulario (1659) excede la reserva (1100) en más de 8 px`) y no la de auto-resize ni la de campos visibles. Con esa reserva el formulario quedaba con scroll interno de 559 px (320), 455 px (390), 434 px (768) y 634 px (1024 y 1280 px): un visitante habría visto el formulario cortado y una región con scroll dentro del iframe.

## Hueco bajo el botón de enviar

La reserva es la misma en todo el rango, así que en los anchos más cómodos sobra espacio bajo el formulario:

| Ancho | Sobrante bajo el contenido |
|---|---|
| 320 px | 5 px |
| 390 px | 109 px |
| 768 px | 130 px |
| 1024 y 1280 px | 2 px |

A 390 px el sobrante es de 109 px, más los 80 px de relleno que ClickUp deja bajo el botón. El plan pide un solo token por rango (máximo del rango), y una reserva por debajo de 1659 px dejaría scroll interno a 320 px, que es peor que un hueco. Si Juan quiere pulirlo, la opción es agregar un token intermedio (por ejemplo desde 480 px) medido a 390 y 768 px; queda como decisión de Juan y no se aplica aquí porque cambiaría la estructura de tokens que pidió el plan.

## Hallazgos para Ari

1. **El auto-resize de ClickUp no ajusta la altura al contenido con este formulario.** El script `forms-embed/v1.js` sí se engancha al iframe aun con `loading="lazy"` (deja un `style.height` en línea en los cinco anchos y se ve el mensaje `[iFrameResizerChild]Ready`), pero el formulario solo reporta la altura del propio iframe (150 px sin reserva, 4000 px si se le da 4000 px). El contenido real es de 1534 a 1659 px según el ancho. Por eso la landing reserva la altura medida (sin ella el formulario se queda con scroll interno). En la configuración para compartir el formulario en ClickUp existe la opción "Autosize embed height" (según la ayuda de ClickUp, activa por defecto): conviene que Ari verifique que esté activada. Si lo está, este comportamiento es del propio formulario y la reserva medida es la solución de la landing. Si ClickUp cambia el formulario, hay que volver a correr `npx playwright test tests/e2e/form-measure.spec.ts` y ajustar los dos tokens.
2. **Idioma.** El formulario declara `lang="en-US"` en su documento, pero las etiquetas visibles están en español (título "Servicios de SEO/AIO", "Nombre", "Correo electrónico", "Nombre de la compañía", "Sitio web", "País"). Quedan textos de ClickUp en inglés: el texto de ayuda "Apply with your full legal name." bajo el campo Nombre y el selector "Select". Esto no se corrige desde la landing (es contenido de ClickUp); Ari puede traducir el texto de ayuda en el editor del formulario. El lector de pantalla puede leer el formulario con la pronunciación en inglés por el `lang` del documento (registrar en `EXCEPTIONS.md` de la Fase 3).
3. **Terminología.** El título del formulario dice "Servicios de SEO/AIO" y la landing usa SEO/GEO por defecto: Ari decide cuál se muestra (ya está pendiente la confirmación de terminología del Bloqueo de la Fase 1).
4. **Campos ocultos `utm_*` (MEAS-02).** No se ven en el formulario y los crea Ari en ClickUp. Sin ellos, la medición se limita al conteo de tareas y al UTM del QR.
5. **Campos visibles.** 5 campos (`input`, `textarea` o `select`) visibles a todos los anchos medidos. La lista completa está en "Campos visibles del formulario".

## Campos visibles del formulario

Leído en solo lectura por `tests/e2e/form-live.spec.ts` a 1280 y 390 px (misma lista en ambos anchos). Evidencia no versionada: `test-results/form-fields.json` y capturas `test-results/agenda-1280.png` y `agenda-390.png`. Sin botón de envío ni interacción alguna: solo se leyó el marco.

Título del formulario: "Servicios de SEO/AIO". Texto de introducción: "Llena este formulario para entender mejor tu negocio y que uno de nuestros especialistas te atienda en una llamada."

| # | Etiqueta | Tipo | Obligatorio | Nota |
|---|---|---|---|---|
| 1 | Nombre | campo de texto | sí | Texto de ayuda en inglés: "Apply with your full legal name."; placeholder "Tu nombre completo" |
| 2 | Correo electrónico | campo de texto (`type=text`, no `type=email`) | sí | placeholder "tu@email.com" |
| 3 | Nombre de la compañía | campo de texto | sí | placeholder "Tu empresa o nombre de negocio" |
| 4 | Sitio web | campo de texto | sí | placeholder "www.ejemplo.com" |
| 5 | País | lista desplegable | sí | botón "Select option..." (en inglés) |
| 6 | Tipo de estructura | lista desplegable | sí | "Select option..." |
| 7 | Sector / Industria | campo de texto | sí | placeholder "Especifica tu sector" |
| 8 | Facturación anual de tu empresa | lista desplegable | sí | "Select option..." |
| 9 | ¿Actualmente están haciendo SEO? | lista desplegable | sí | "Select option..." |
| 10 | ¿Cuánto podrías destinar específicamente a SEO y GEO al mes? (USD) | lista desplegable | sí | "Select option..." |
| 11 | ¿De dónde nos conoces? | lista desplegable | sí | "Select option..." |

Botón de envío: "Submit" (en inglés). Pie del formulario: "Productivity by ClickUp · Report Abuse" (marca de ClickUp visible; el plan de ClickUp de Ari lo completa Juan tras el envío humano).

Notas para Ari y para `EXCEPTIONS.md` de la Fase 3:

- **Campos ocultos `utm_*`:** no hay ninguno (0 `input[type=hidden]` en el marco). Sin ellos no se puede medir el origen del lead (MEAS-02); los crea Ari en el formulario.
- **Idioma mezclado:** etiquetas en español; "Submit", "Select option..." y "Apply with your full legal name." en inglés; `lang="en-US"` en el documento del formulario.
- **Listas desplegables:** las seis son botones personalizados de ClickUp ("Select option..."), no `select` nativos. Su accesibilidad interna es de ClickUp.
- **Correo:** el campo es `type=text`; el navegador no ofrece teclado de correo en el móvil. También es de ClickUp.
- **Terminología:** el título dice SEO/AIO y la pregunta de presupuesto dice SEO y GEO.
- **Alto de la reserva:** en la captura a 390 px, el formulario cabe entero en la tarjeta sin scroll interno; queda un espacio en blanco bajo el pie de ClickUp de unos 100 px.

## Resultado de FORM-05

Los dos envíos son humanos (Juan) y NO se hicieron desde ninguna prueba automática. Se completa después de los `human-check` de `01-04-PLAN.md` (que el verificador de fin de fase consolida en `01-UAT.md`). Cada envío usa datos ficticios del equipo con "PRUEBA" y la fecha en el nombre; las tareas creadas las borra Juan.

| Ancho | Fecha | Confirmación vista | Idioma de la confirmación | Tarea creada | Borrada |
|---|---|---|---|---|---|
| 1280 px | pendiente | pendiente | pendiente | pendiente | pendiente |
| 390 px | pendiente | pendiente | pendiente | pendiente | pendiente |

Datos por completar por Juan tras los envíos: plan de ClickUp que tiene el formulario y si aparecen campos ocultos `utm_*` (Ari los crea para MEAS-02).

## Decisión sobre el hueco en blanco tras enviar

Decisión provisional: se mantienen `--form-min-h-sm: 1664px` y `--form-min-h-lg: 1536px`. La confirmación de ClickUp es más corta que el formulario, así que bajo ella puede quedar espacio en blanco dentro de la tarjeta. No se puede observar sin un envío real, y los envíos son humanos. Motivo para no acortar la reserva por adelantado: un `min-height` menor que el formulario deja scroll interno (visto con los valores iniciales), que es peor que un espacio en blanco. Juan confirma o ajusta esta decisión al observar la confirmación en los envíos a 1280 y 390 px y la deja escrita aquí ("aceptado" o el nuevo valor): pendiente.

## Desviación respecto al plan

El plan pedía medir la altura con el `style.height` que fija el script. Con este formulario esa lectura es circular (devuelve el `min-height` vigente: 1100/900 px al inicio, 1664/1536 px al final), así que no mide el formulario. Se corrigió midiendo el `scrollHeight` de `cu-form` con el iframe sin reserva y se agregó una aserción de que la reserva publicada no deja scroll interno. La aserción del plan de que el script fija un `style.height` no vacío se conserva (prueba que el script se engancha con carga diferida). Sobre la nota "el auto-resize funciona": se registra que el script se engancha pero que no sigue al contenido (hallazgo 1).

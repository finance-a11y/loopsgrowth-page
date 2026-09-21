# Phase 2: Secciones, marca y copy - Context

**Gathered:** 2026-09-18
**Status:** Ready for planning

<domain>
## Phase Boundary

La landing completa con las secciones del Copy v2 (Hero, El problema, Por qué ahora, La solución, Lo que logramos juntos, Casos de éxito, Quiénes somos, Qué incluye, Cómo funciona, Para quién es, FAQ, CTA final con formulario, Footer), con la identidad de marca aplicada (collage pop en SVG estático, logo e isotipo en SVG, paleta con guarda de contraste) y todo el texto en español neutro con la voz de marca, sin voseo ni guiones largos. Funciona de 320 px a 1280 px sin scroll horizontal y sin movimiento con `prefers-reduced-motion: reduce`. SEO, medición y QA final son de la fase 3.

</domain>

<decisions>
## Implementation Decisions

### Hero, header y orden de la página
- H1 con fórmula categoría + público + resultado, tomado tal cual del Copy v2 de Ari (sin humanizar ni reescribir).
- Header con logo SVG a la izquierda y un botón CTA a la derecha, sin menú y no fijo (evita tapar el foco, SC 2.4.11).
- Orden: Hero, El problema, Por qué ahora, La solución, Lo que logramos juntos, Casos de éxito, Quiénes somos, Qué incluye, Cómo funciona, Para quién es, FAQ, CTA final con formulario, Footer.
- Mismo texto de CTA "Agenda tu llamada de 30 minutos" en hero, tras La solución, tras Casos de éxito y en el CTA final, todos con `href="#agenda"`.

### Prueba social
- Las cifras `[VERIFICAR]` (rango 30% a 50% menos de presupuesto de ads, split Google vs IA en reportes) no se publican: quedan `pending` en el YAML con la lista en `PENDING-COPY.md` hasta que Ari las respalde, y en la página se muestra el relleno visible "FALTA CONFIRMAR" (sin cifras inventadas ni texto suavizado de nuestra cosecha). El build de producción las bloquea (COPY-02).
- Casos de éxito como tarjetas de métrica (cifra grande, sector anonimizado, plazo y canal), sin logos ni fotos. El caso de Meta Ads (+500% tráfico, marca personal) va en su propia tarjeta.
- Equipo con avatar ilustrado SVG estático en estilo collage, nombre y cargo en texto real: Arianna Lupi (fundadora), Verónica Romero (directora de proyectos), Juan Angulo (director técnico), Miguel Pacheco (especialista SEO). Avatar con `aria-hidden="true"`.
- Si falta sector o plazo de un caso, se marca `pending`, se lista en `PENDING-COPY.md` y en la página se muestra "FALTA CONFIRMAR" en ese dato. Sin etiquetas de borrador, sin espacios vacíos y sin ocultar la tarjeta. El build de producción falla mientras quede cualquiera.

### Estilo visual, collage y movimiento
- Las referencias de Ari (m8l.com, skale.so, rankingonai.com) son la guía de layout y vibra (cambio de Juan, 2026-09-18). Se estudian a fondo para entender cómo arman cada sección (estructura, ritmo, jerarquía, composición del hero, tarjetas, prueba social, CTA) y se hace un combinado propio para Loops Growth, no una copia de una sola página. La identidad visual (logo, paleta, tipografía, collage) sigue siendo la de Loops Growth.
- Método de diseño: skill `impeccable` con los verbos que apliquen (por ejemplo shape para definir cada sección, critique y polish para iterar, colorize, animate y adapt cuando toque) y las iteraciones que hagan falta hasta que la landing se sienta con la vibra de esas referencias. Se documenta en el plan qué patrón se toma de cada referencia. Se aplica también `design-taste-frontend`.
- Límites que no se negocian aunque la referencia haga otra cosa: contraste medido, A11Y.md, contenido visible sin JavaScript, `prefers-reduced-motion` respetado, sin texto oculto por animación y el copy tal cual del doc de Ari. Todo movimiento que aporte a la vibra vive solo bajo `motion-safe:` y nunca esconde contenido.
- Fondos alternados blanco, amarillo `#ffc602` y oscuro `#212121`. Morado `#73187F` en títulos y texto sobre blanco o amarillo. Botón naranja `#fd6938` con texto oscuro. Se respeta la tabla de contraste (sin morado sobre oscuro, sin blanco sobre naranja, sin amarillo como texto sobre claro).
- Lupas, ojos y clics como SVG estático en línea con `aria-hidden="true"` y `focusable="false"`. Sin movimiento con `prefers-reduced-motion: reduce`; el movimiento que pida la vibra de las referencias va solo bajo `motion-safe:`.
- Logo e isotipo en SVG con su área de salvado, tomados del Drive de Ari. Si falta el vectorial, se redibuja el isotipo Loopy y se marca para aprobación de Ari.

### Secciones informativas
- "Para quién es / para quién no": dos columnas. Comunica el perfil de USD 200k o más al año sin publicar rangos de inversión mensual que Ari no haya aprobado.
- "Cómo funciona": cuatro fases en lista ordenada `<ol>`, cada una con plazo. Plazos `pending` hasta que Ari confirme: se listan en `PENDING-COPY.md` y en la página se muestra "FALTA CONFIRMAR" donde falte el plazo.
- FAQ de 5 a 6 preguntas con `<details>` nativo: qué es GEO, duración de la llamada, qué preparar, inversión, tiempos de resultados y si aplica a mi negocio. Preguntas y respuestas tomadas tal cual del doc de Ari; si el doc no trae alguna, se pide a Ari en vez de redactarla. Sin pregunta de garantía.
- Footer con contacto, redes y enlace a "Política de privacidad", que apunta a una página simple cuyo cuerpo es "FALTA CONFIRMAR" (`pending`, listado en `PENDING-COPY.md`) hasta que Ari entregue el texto legal.

### Textos pending (cambio de Juan, 2026-09-18)
- Regla general del proyecto: los textos `pending` viven en una lista dentro del repo (`PENDING-COPY.md`, generada por `npm run pending` desde `landing.es.yaml`, con clave, texto actual y quién debe confirmar). En la página nunca hay placeholders vacíos, etiquetas de borrador ni contenido oculto: donde falta el dato se muestra el relleno visible "FALTA CONFIRMAR".
- El relleno aplica solo donde falta el dato (cifras sin respaldo, plazos, sector de casos, cuerpo de privacidad). Lo que ya viene en el doc de Ari ("30 minutos", "SEO/GEO", H1 del Copy v2) se muestra tal cual y solo se lista para que Ari lo confirme.
- El build de producción sigue fallando (COPY-02) mientras haya `pending` o "FALTA CONFIRMAR" en la página.

### Excepciones del contrato de diseño aprobadas por Juan (2026-09-19)
- Quinto tamaño tipográfico, Title (20 a 24 px), para el h3 de tarjeta. Levanta la regla de "máximo 4 tamaños" del checker.
- Paso de espaciado de 96 px solo para `--section-y` desde 1024 px (viene del `py-24` de rankingonai). Levanta la regla de escala hasta 64 px. Obliga a ajustar el padding de `#agenda` de la fase 1 y su prueba e2e.
- CTA: 4 CTA (header, hero, tras La solución, tras Casos de éxito) más la sección `#agenda`, que es el CTA final por sí misma y no lleva un enlace a sí misma.

### Morado de marca y logo (decisión de Juan, 2026-09-19; REEMPLAZADA por la de la tarde, ver `02-BRAND-INVENTORY.md`)
- **Vigente:** el morado de la página es `#4228D1` (azul violeta), con `#6C61DB` (iris) y crema `#F4F3E0`. Es el color del logo, del isotipo, de la muestra del BrandBook (pág. 8), de la papelería y de todo el moodboard. Solo el texto de esa página dice `#73187F` (R115 G24 B127, Pantone 248 U), que se trata como error de la etiqueta. Se recalculan tokens, pares de contraste y guardas, y `#73187F` sale de la página. Ari confirma después; si dijera otra cosa se cambia el token en un solo lugar.
- **Vigente:** el logo, imagotipo, emblema e isotipos salen de las 32 mesas del `.ai`, usando la versión oficial de cada fondo (no se recolorea un solo SVG por CSS).
- **Vigente:** el collage se reconstruye con las piezas reales de Loopy (ojos con lupa, un ojo con lupa) y el lenguaje del moodboard (formas planas grandes, píldoras con palabra, garabatos, retícula de puntos, recortes fotográficos en media tinta). El sprite y los avatares que dibujaron los agentes en 02-02 se reemplazan.
- **Vigente:** los recortes fotográficos usan fotos de stock con licencia comercial (decisión de Juan, 2026-09-19); cada foto lleva registrada su fuente y licencia.
- Reemplazado (no aplicar): "El morado de la página se mantiene en `#73187F`" y "No se recalculan tokens ni contraste por esto".
- Área de salvado del logo: el brandbook (pág. 7) dice X en los cuatro lados, con X igual a la altura del logo o del isotipo. Corrige la suposición de media altura del UI-SPEC (decisión 14), que solo vale para el logo apilado.

### Claude's Discretion
Estructura de componentes, nombres de archivos, esquema exacto de las secciones en `landing.es.yaml`, composición de cada collage y detalles de espaciado y tipografía dentro de los tokens. Reglas de proyecto que aplican: diseño web por `impeccable` y `design-taste-frontend`; todo el texto sale tal cual del doc de Ari (fuente de verdad, sin humanizar ni reescribir; si falta un texto se pide a Ari, no se inventa); A11Y.md estricto.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- Ninguno todavía: la fase 1 crea el scaffold Astro, `tokens.css`, `landing.es.yaml`, `check-copy.mjs`, `check-contrast.mjs` y el bloque del formulario en `#agenda`. Esta fase los reutiliza.

### Established Patterns
- Astro 7 + Tailwind 4 sin islas, contenido visible sin JS, copy en YAML con `{text, status}`, fuente tras `--font-brand`, foco `:focus-visible` de 2 px (decisiones de la fase 1).

### Integration Points
- El copy de las secciones se agrega a `landing.es.yaml` por sección y lo valida `check-copy.mjs`.
- Todos los CTA enlazan a `#agenda`, donde vive el formulario de ClickUp de la fase 1.

</code_context>

<specifics>
## Specific Ideas

**Regla de copy (cambio de Juan, 2026-09-18):** todos los textos ya están en el doc de Ari (https://docs.google.com/document/d/1QK61DPEQ3UbBQcCBnepwoaBesyZE1ZvZ6VfLgPrgtI0/edit?tab=t.nvl47nvdgyma). No se pasa nada por `humanizer` ni se reescribe. El guardián `check-copy.mjs` sigue corriendo: si el doc trae voseo, guion largo, `[VERIFICAR]` o "AEO", se reporta a Ari en lugar de editar el texto en silencio.

Referencias de diseño de Ari: m8l.com, skale.so y rankingonai.com. Fuentes del copy: Doc de proceso y copy https://docs.google.com/document/d/1QK61DPEQ3UbBQcCBnepwoaBesyZE1ZvZ6VfLgPrgtI0 y assets de marca en Drive https://drive.google.com/drive/folders/1byOfW_MgbJ5YrX8UY2uwgek2EyZsKlhe. Pendientes de Ari: duración de llamada (30 vs 20 min), unificar "SEO/GEO" vs "AEO", cifras `[VERIFICAR]`, sector y plazo de casos, plazos de las 4 fases y política de privacidad.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

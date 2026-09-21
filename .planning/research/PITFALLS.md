# Pitfalls Research

**Domain:** Landing B2B de captación para agencia SEO/GEO (Loops Growth). Una página, español, form de ClickUp por iframe, marca con paleta vibrante y tipografía comercial, entrega local hoy, evento la próxima semana.
**Researched:** 2026-09-18
**Confidence:** MEDIUM-HIGH. Las mediciones directas (cabeceras HTTP del form de ClickUp, código del script de embed, ratios de contraste calculados con la fórmula WCAG) son HIGH. La parte legal por jurisdicción, los límites de licencia de la fuente y el comportamiento en navegadores in-app son MEDIUM o LOW y están marcados donde aplica.

**Cómo leer este documento:** cada pitfall trae severidad, señales tempranas, prevención y la fase donde debe atacarse. Las fases son sugeridas y el orquestador puede remapearlas:

- **F1 Fundaciones:** stack, tokens de marca, contraste, fuentes, entorno y reglas SEO base.
- **F2 Construcción:** secciones, copy, imágenes, animación.
- **F3 Formulario y conversión:** iframe de ClickUp, fallback, medición.
- **F4 QA:** accesibilidad, performance, SEO, gate de copy.
- **F5 Salida a evento:** dominio, deploy, QR, contingencias.

Los pitfalls marcados "solo si Astra/WordPress" o "solo si estático" dependen de la decisión de stack que resuelve STACK.md.

---

## Hallazgos medidos en esta investigación (base factual)

Estos datos se obtuvieron directamente el 2026-09-18 y sustentan varios pitfalls.

| Hallazgo | Evidencia | Consecuencia |
|----------|-----------|--------------|
| El form de ClickUp NO envía `X-Frame-Options` ni `frame-ancestors` en cabeceras, así que se puede embeber desde cualquier origen | `curl -I` al URL del form: HTTP 200, sin esas cabeceras | El bloqueo por framing no es el riesgo principal hoy, pero ClickUp puede cambiarlo sin aviso |
| La respuesta trae `x-robots-tag: noindex, nofollow` | Misma cabecera | El contenido del form nunca aporta SEO a la landing. No es un problema, solo hay que saberlo |
| El documento del form declara `<html lang="en-US">` y `<title>ClickUp Forms</title>` | HTML descargado (78 KB, shell de SPA Angular) | Riesgo de accesibilidad: lectores de pantalla pronuncian texto en español con voz en inglés. No se controla desde nuestra página |
| El embed oficial usa `iFrameResizer 4.2.8` con `checkOrigin: true`, `heightCalculationMethod: 'bodyOffset'`, mensajes por `postMessage` | Código de `app-cdn.clickup.com/assets/js/forms-embed/v1.js` (~7 KB gz) | El auto-resize solo funciona si el `src` del iframe es exactamente el origen de ClickUp. Un proxy o redirect lo rompe |
| No existe evento de "envío exitoso" hacia la página padre, y el redirect post-envío no funciona en formularios embebidos | Solicitud abierta en feedback.clickup.com (72 votos, sin implementar) | La métrica de éxito del proyecto (formularios enviados) no se puede medir con un evento estándar |
| Contraste calculado (fórmula WCAG de luminancia relativa) | Script propio, ver tabla en Pitfall 5 | Blanco sobre naranja 2.89, blanco sobre amarillo 1.58, gris oscuro sobre morado 1.66: todos fallan |

---

## Critical Pitfalls

### Pitfall 1: Altura del iframe mal resuelta (CLS, doble scroll en móvil, salto al enviar)

**Severidad:** Alta. **Confianza:** HIGH (mecanismo verificado en el código del script).

**What goes wrong:**
El snippet oficial trae `height="100%"` y depende de `forms-embed/v1.js` para ajustar la altura por `postMessage`. Se rompen tres cosas típicas:
1. Antes de que cargue la SPA de ClickUp el iframe mide poco (o 150px por defecto), y al cargar crece de golpe: layout shift en la landing propia, justo en la zona de conversión.
2. Si el resize falla (script bloqueado, `src` distinto, iframe inyectado después de que corrió el script), el form queda con altura fija y scroll interno. En iOS Safari eso crea un "scroll trap": el dedo entra al iframe y la página deja de moverse.
3. Al enviar, ClickUp muestra la confirmación y el iframe se encoge. La página puede quedar con el viewport en una zona vacía o saltar hacia arriba, y el usuario no ve el mensaje de confirmación.

**Why it happens:**
La altura de un iframe cross-origin no se puede leer desde el padre. Se copia el snippet y se prueba solo en desktop con conexión rápida, donde el resize llega en milisegundos.

**How to avoid:**
- Usar exactamente el `src` de `forms.clickup.com` (no un dominio propio que redirija, no un proxy). El script tiene `checkOrigin: true`.
- Mantener `class="clickup-embed clickup-dynamic-height"` y no fijar `height` en px. Reservar espacio con `min-height` en el contenedor (medir el alto real del form en 390px y en 1280px, no adivinar) para evitar CLS.
- Cargar el script con `async` o `defer`, y verificar que el iframe exista en el DOM cuando el script inicializa. Si se decide diferir el iframe con `loading="lazy"` o una carga bajo demanda, probar que el auto-resize siga funcionando (no verificado en esta investigación).
- Poner `scroll-margin-top` (o `scroll-padding-top` en `html`) en el ancla del form para que un header sticky no lo tape al llegar desde los CTAs.
- Probar el envío completo en móvil real (iOS Safari y Chrome Android) y confirmar que el usuario ve el mensaje de confirmación tras el envío. Si el iframe se encoge y la vista salta, escuchar el resize y llevar el foco/scroll al contenedor.
- Tener un plan B visible: enlace "Abrir el formulario en una pestaña nueva" junto al iframe (ver Pitfall 2).

**Warning signs:**
- Lighthouse marca CLS > 0.1 y el elemento culpable es el contenedor del form.
- En DevTools el iframe tiene `height: 150px` o un valor fijo que no cambia al avanzar por el form.
- En el móvil el scroll "se pega" al tocar sobre el form.

**Phase to address:** F3 (implementación) y F4 (prueba en dispositivos reales).

---

### Pitfall 2: Iframe sin título, sin alternativa y con bloqueos de navegador no probados

**Severidad:** Alta. **Confianza:** HIGH para el título y el `lang` (observado); MEDIUM para cookies e in-app browsers (fuente de ClickUp vía búsqueda, no reproducido).

**What goes wrong:**
- El snippet oficial no incluye `title` en el iframe. Sin título accesible, un lector de pantalla anuncia "marco" sin contexto. Incumple la regla de A11Y.md (que es estricta) y WCAG 4.1.2 / 2.4.1.
- El documento interno declara `lang="en-US"`. Si las preguntas están en español, la voz del lector las pronuncia mal. Tampoco se pueden corregir contraste, etiquetas o mensajes de error de ClickUp desde afuera.
- ClickUp documenta que algunas funciones y embeds dependen de cookies de terceros. Safari (ITP), Firefox (ETP estricto) y Brave bloquean almacenamiento de terceros en iframes. Si la SPA de ClickUp intenta usarlo, el form puede quedar en blanco o fallar al enviar. Chrome, hoy por defecto, sigue permitiéndolas, así que "en mi Chrome funciona" no prueba nada.
- Los links compartidos en LinkedIn, WhatsApp o Instagram abren en el navegador in-app (webview), donde los iframes de terceros a veces se comportan distinto. Justo el canal que Ari usará en el evento.
- Extensiones (uBlock, Privacy Badger) o redes corporativas pueden bloquear `forms.clickup.com`, `app-cdn.clickup.com` o parte de sus requests.

**Why it happens:**
Se trata el iframe como caja negra que "ya funciona" porque se vio el form en la pestaña propia. Nadie prueba con privacidad activada.

**How to avoid:**
- `title="Formulario para agendar tu llamada de pre-calificación"` (específico, en español) en el iframe.
- Junto al iframe, siempre visible: enlace "¿No ves el formulario? Ábrelo en una pestaña nueva" al URL directo del form, con `target="_blank" rel="noopener"`. Dentro de `<noscript>`, el mismo enlace más un correo de contacto. Este enlace es también el fallback de evento (Pitfall 7).
- Verificar en la práctica qué idioma y textos ve un usuario hispanohablante en el form: etiquetas, botón de envío, mensajes de validación, confirmación. Si salen en inglés, decirlo a Ari antes del evento. Si las preguntas del form están en español, revisar que usen la misma terminología que la landing (SEO/GEO, duración de la llamada).
- Matriz de pruebas mínima: Safari iOS, Safari macOS, Firefox con protección estricta, Brave, Chrome incógnito, y el navegador in-app de LinkedIn o Instagram si es posible. Un teléfono de prueba es suficiente.
- Si el sitio propio define CSP: incluir `frame-src https://forms.clickup.com` y `script-src https://app-cdn.clickup.com`. Es la causa clásica de "el form desapareció en producción".
- Aceptar el límite: la accesibilidad interna del form de ClickUp no es nuestra. Documentarlo como riesgo conocido en el proyecto, con el fallback y el correo como alternativa accesible.

**Warning signs:**
- El iframe aparece vacío o con un spinner infinito en Safari o Firefox.
- La consola del navegador muestra `Refused to frame` o `blocked by CSP`.
- El lector de pantalla dice solo "frame" al llegar al bloque.

**Phase to address:** F3 (título, fallback, CSP) y F4 (matriz de navegadores y prueba con lector de pantalla).

---

### Pitfall 3: No se puede medir la conversión (la métrica de éxito queda ciega)

**Severidad:** Alta para el negocio, media para el evento. **Confianza:** HIGH (limitación documentada por usuarios de ClickUp, coincide con el código del embed).

**What goes wrong:**
El éxito del proyecto es "formularios enviados que cumplen pre-calificación". Pero un iframe cross-origin no expone el envío al padre. ClickUp no dispara evento, y el redirect a una página de gracias no funciona en embeds (solicitud abierta con 72 votos; además el redirect es una función de plan Business Plus o superior). Resultado típico: se instala Google Analytics, se ven visitas, y nadie sabe cuántas personas enviaron. Peor, se mide "clic en el CTA" y se reporta como conversión.

**Why it happens:**
Se supone que "un form es un form" y que basta con una página de gracias, como en cualquier otra herramienta.

**How to avoid:**
- Definir de entrada qué es "conversión medible" con lo que sí existe: (a) clics en CTAs (`data-cta` por sección), (b) el iframe entra en viewport (IntersectionObserver), (c) el conteo real de tareas/registros creados en ClickUp como fuente de verdad, cruzado con las visitas.
- Marcar el tráfico del evento con UTM en el URL del QR (`?utm_source=evento&utm_medium=qr&utm_campaign=<nombre>`) y comparar contra las tareas creadas en ClickUp esa semana. Verificar en ClickUp si el form permite registrar la fuente (campo oculto o prefill por parámetro): no verificado.
- No prometer en el alcance "seguimiento de conversiones de formulario". Si se necesita, la vía posterior es un form propio conectado a la API de ClickUp, hoy fuera de alcance (Key Decisions). Dejarlo anotado como deuda consciente.
- Heurísticas frágiles (detectar que el iframe cambió de altura tras enviar) solo como señal auxiliar, nunca como cifra oficial.
- Si se usan analytics: es una agencia SEO, así que la landing debe tener medición limpia (GA4 o alternativa) y aviso de cookies acorde al público objetivo. En Latinoamérica la exigencia varía por país, en la UE es estricta. Definir la jurisdicción con Ari.

**Warning signs:**
- Alguien pide "cuántas conversiones tuvimos" y la respuesta es "clics en el botón".
- Existe una página `/gracias` que nadie visita porque el form nunca redirige.

**Phase to address:** F3 (diseño de la medición) y F5 (UTM en el QR).

---

### Pitfall 4: Métricas de casos de éxito sin sustento y placeholders `[VERIFICAR]` que llegan a producción

**Severidad:** Alta (reputación y riesgo legal, y el público objetivo entiende de métricas). **Confianza:** MEDIUM (principio de sustanciación verificado en fuentes de la FTC de EE. UU.; las normas de cada país hispanohablante NO se verificaron en esta investigación).

**What goes wrong:**
- El copy trae dos flags `[VERIFICAR]`: "30% a 50% menos de presupuesto de ads" y el split Google vs IA en reportes. Si el texto se publica tal cual o suavizado sin evidencia, es una promesa de resultado no sustentada.
- Casos de éxito como "+500% tráfico" sin línea base, período, métrica ni fuente. Un número sin contexto es exactamente lo que un prospecto experto en marketing (el cliente ideal aquí) desconfía, y lo que un regulador considera engañoso.
- En EE. UU., la FTC actualizó sus Endorsement Guides en 2023 (16 CFR Parte 255): el descargo "los resultados pueden variar" ya no protege por sí solo. Si el resultado es atípico, hay que tener sustanciación de que es representativo o revelar el resultado esperado normalmente. Con precios en USD hay clientes potenciales de EE. UU. En España rige la Ley de Competencia Desleal (publicidad engañosa) y en países latinoamericanos hay equivalentes de protección al consumidor: el principio común es "afirmación comprobable". Requiere validación de quien conozca el país de Ari.
- Promesas no controlables: "apareces en ChatGPT / Gemini". Las respuestas de los modelos no son deterministas y nadie controla la citación. Google mismo advierte que nadie puede garantizar el puesto 1.
- Publicar resultados de un cliente identificable (marca personal, app infantil) sin permiso contractual. Sin logos ni fotos el riesgo baja, pero un caso "identificable por descripción" sigue exponiendo al cliente.
- Marcar los casos con schema `Review` o `AggregateRating` sin reseñas reales: infringe la política de datos estructurados de Google (riesgo de acción manual). Para una agencia SEO es reputacionalmente devastador.

**Why it happens:**
Con el evento encima, el copy "ya está aprobado por Ari" y se implementa tal cual. Los `[VERIFICAR]` se leen como notas al margen, no como bloqueadores.

**How to avoid:**
- Convertir cada métrica en una ficha interna de evidencia: cliente (puede quedar anónimo), qué se hizo, línea base, período, métrica, fuente (GSC/GA4/captura), permiso de uso. Si falta un dato, la tarjeta no sale con el número.
- Reglas de redacción: siempre "resultado de un cliente, no promedio", con período y rango ("en 6 meses"), y sin "garantizamos". Redactar el flag de presupuesto como "en algunos casos redujimos la inversión en ads mientras crecía el tráfico orgánico" solo si Ari lo confirma; si no, quitarlo.
- Cambiar "garantizamos" y "aparecerás" por lenguaje de proceso ("trabajamos para que tu marca sea citada en...").
- Gate automático de build o de revisión: buscar `VERIFICAR`, `TODO`, `lorem`, `XXX` en el HTML final y romper el proceso si aparecen. Es una línea de grep y evita la peor vergüenza posible.
- Sin schema `Review`/`AggregateRating`. Solo `Organization` (y `WebSite`/`WebPage` si el stack lo da gratis).
- Separar el último ítem (+500% marca personal / Meta Ads) en su propia tarjeta, como ya está anotado, y revisar que ese caso encaje con el servicio (es Meta Ads, no SEO/GEO: alinear con Ari si debe estar en una landing de SEO/GEO).

**Warning signs:**
- Aparecen números redondos y grandes sin período ni fuente.
- Ari responde "eso lo verificamos después".
- El texto contiene "garantizado", "el mejor", "#1", "siempre".

**Phase to address:** F2 (redacción de tarjetas) y F4 (gate de `[VERIFICAR]` y revisión de claims). La aprobación de Ari es dependencia externa: pedirla en F1.

---

### Pitfall 5: Fallas de contraste con la paleta naranja y amarilla

**Severidad:** Alta (accesibilidad estricta obligatoria por A11Y.md, más credibilidad de agencia). **Confianza:** HIGH (calculado con la fórmula WCAG de luminancia relativa).

**What goes wrong:**
La marca es vibrante y los diseñadores por reflejo ponen texto blanco sobre naranja y amarillo, o naranja sobre blanco como acento. Ratios reales:

| Texto / elemento | Fondo | Ratio | Texto normal (4.5) | Texto grande y UI (3.0) |
|------------------|-------|-------|--------------------|--------------------------|
| Blanco #fff | Morado #73187F | 9.69 | Pasa | Pasa |
| Blanco #fff | Naranja #fd6938 | 2.89 | FALLA | FALLA |
| Blanco #fff | Amarillo #ffc602 | 1.58 | FALLA | FALLA |
| Gris #212121 | Naranja #fd6938 | 5.56 | Pasa | Pasa |
| Gris #212121 | Amarillo #ffc602 | 10.22 | Pasa | Pasa |
| Gris #212121 | Morado #73187F | 1.66 | FALLA | FALLA |
| Morado #73187F | Naranja #fd6938 | 3.35 | FALLA | Pasa |
| Morado #73187F | Amarillo #ffc602 | 6.15 | Pasa | Pasa |
| Naranja #fd6938 | Amarillo #ffc602 | 1.84 | FALLA | FALLA |
| Naranja #fd6938 | Off-white #f7f5f0 | 2.66 | FALLA | FALLA |

Consecuencias concretas:
- Botón CTA naranja con texto blanco: falla. Debe llevar texto #212121 (5.56).
- Naranja como texto, como ícono informativo, como borde de campo o como anillo de foco sobre blanco: falla incluso el mínimo de 3:1 para componentes UI. El anillo de foco sobre blanco debe ser morado o gris oscuro, y sobre fondos oscuros, amarillo.
- Texto gris oscuro sobre fondo morado: falla. Usar blanco o amarillo.
- Texto sobre collage o imágenes: hay que medir el peor caso sobre la imagen, no el promedio. Un texto sobre una lupa amarilla puede pasar en un punto y fallar en otro.
- Estados hover: aclarar el naranja o el amarillo para "feedback" suele hundir el contraste.
- Enlaces solo diferenciados por color (regla WCAG 1.4.1): subrayar.

**Why it happens:**
El brandbook define colores, no pares texto/fondo permitidos. Se aplica la paleta como decoración y el texto hereda "blanco sobre color".

**How to avoid:**
- Antes de maquetar, crear una tabla de tokens de pares aprobados (texto/fondo/acento) y prohibir en CSS los combos que fallan. Naranja y amarillo son colores de fondo, formas y decoración; el texto sobre ellos es #212121.
- Fondo del form y de secciones de lectura: blanco u off-white con texto #212121 (16.10 y 14.78).
- Foco: `outline: 3px solid` con color de par aprobado, `outline-offset: 2px`, nunca `outline: none`. Verificar que un header sticky no lo tape (A11Y.md lo exige).
- Regla de tamaño: mínimo 24x24 CSS px, objetivo 44x44 (casa: A11Y.md).
- Tener una regla explícita para el tema o builder: si es Astra, sobreescribir la paleta global (los colores por defecto de enlaces y botones de un tema se filtran y rompen contraste).
- Automatizar: axe-core o Lighthouse en CI o revisión, más una revisión manual con capturas de collage.

**Warning signs:**
- Aparece cualquier `color: #fff` sobre `#fd6938` o `#ffc602` en el CSS.
- Los avisos de axe "color-contrast" se ignoran "porque es la marca".
- Se pide a Ari "una excepción de marca" (que no cambia el ratio, solo lo tolera).

**Phase to address:** F1 (tokens y pares aprobados), F2 (uso), F4 (auditoría axe y manual).

---

### Pitfall 6: Fuente comercial sin licencia web y FOUT/CLS por fuente

**Severidad:** Alta (legal y de rendimiento). **Confianza:** MEDIUM (Hurme Design publica cuatro EULA separados; el texto de cada una no se leyó completo).

**What goes wrong:**
- Hurme Geometric Sans 3 es una fuente comercial de Hurme Design (distribuida por MyFonts, Fontspring y la propia foundry). Vende licencias separadas: Desktop, Web (self-hosted, por niveles de 50.000 a 50.000.000 de pageviews mensuales), App y ePub. Una licencia Desktop, que es lo que suele tener una identidad de marca, no cubre embeber la fuente en un sitio web.
- Existen sitios de "descarga gratis" (onlinewebfonts, bestfonts.pro, etc.) que ofrecen Hurme Geometric Sans. Son distribución no autorizada. Usarlos en una agencia que vende profesionalismo es un riesgo legal y de imagen.
- Si el equipo de diseño externo (el brandbook lo hizo "Eleven", 2024) compró la licencia, no se sabe si Loops la posee ni qué archivos tiene.
- Técnicamente: si se carga la fuente con `font-display: swap` y el fallback (Arial, sans-serif) tiene otras métricas que una geométrica ancha, la página se reacomoda al cargar (CLS en el hero, que además suele ser el LCP). Con `font-display: block` se ve texto invisible.
- Subsetting mal hecho a "Latin básico" elimina `ñ`, `¿`, `¡` y acentos. En español es un bug visible: caracteres caen al fallback a mitad de palabra.
- Cargar los 14 estilos (7 pesos x 2) es peso muerto. Para una landing bastan 2 a 3.

**Why it happens:**
La fuente está en el brandbook, así que "se usa". La licencia se descubre cuando alguien pide facturas. Y el ajuste de métricas del fallback parece un lujo.

**How to avoid:**
- Hoy, antes de escribir CSS: preguntar a Ari quién tiene la licencia y si incluye Web. Si no, decidir con costo en la mano: la familia completa de 14 estilos sale desde 249 USD en MyFonts, con licencia Web por niveles de pageviews (a confirmar el precio actual con Hurme, que pide cotización).
- Mientras tanto, una variable CSS `--font-brand` con un fallback geométrico libre y bien licenciado (por ejemplo una fuente OFL autoalojada) para que el cambio a Hurme sea de una línea cuando llegue la licencia. Ari valida sabiendo que la fuente es temporal.
- Los usos de Desktop sí son válidos para arte plano (logos, gráficos, piezas del QR): no confundir con web.
- Autoalojar en WOFF2, sin CDN de terceros (evita además el tema de privacidad de Google Fonts en la UE). Comprobar en el EULA Web que la conversión a WOFF2 y el subsetting están permitidos.
- Subset Latin + Latin-1 Supplement + Latin Extended-A mínimo, y probar la cadena "¿Qué más hacemos por ti, ñandú? ¡Agenda tu llamada! áéíóúüñ".
- Precargar solo el peso del LCP (`<link rel="preload" as="font" type="font/woff2" crossorigin>`), `font-display: swap`, y un `@font-face` de fallback con `size-adjust`, `ascent-override`, `descent-override` y `line-gap-override` calculados contra Hurme (Chrome documenta el método).

**Warning signs:**
- El "archivo de la fuente" viene de un correo, un zip sin licencia o un sitio de descargas.
- En Lighthouse aparece "Ensure text remains visible during webfont load" o CLS en el `h1`.
- Se ven `ñ` o `¿` con otro trazo.

**Phase to address:** F1 (licencia y decisión de fallback), F2 (carga y métricas), F4 (medición CLS).

---

### Pitfall 7: Riesgos del día del evento (dominio, QR, enlace del form, conectividad)

**Severidad:** Crítica (fecha inamovible). **Confianza:** HIGH para el dominio como bloqueante y el QR estático vs dinámico; MEDIUM para tolerancias de impresión.

**What goes wrong:**
- **Sin dominio, no hay URL pública.** El alcance dice "solo local": una web en `loopsgrowth.local` no la abre nadie más. El QR, las tarjetas y las redes necesitan una URL viva. Comprar el dominio, apuntar DNS, emitir SSL, desplegar y validar consume días, y la impresión de material también. El QR es el elemento de ruta crítica, no el diseño.
- **Local Live Links (ngrok) no es solución de evento.** Es un túnel temporal que exige que el computador de quien lo comparte esté encendido, la URL cambia al regenerarse, y algunos assets pueden fallar. Sirve para que Ari valide, no para 200 personas escaneando.
- **QR dinámico gratuito que caduca.** Muchos generadores desactivan los códigos dinámicos al terminar el trial (7 a 14 días según el proveedor): al escanear, el usuario cae en una página del proveedor. Para un evento con material impreso es el peor fallo posible.
- **QR mal diseñado.** Colores de marca invertidos (claro sobre oscuro), naranja o amarillo sobre blanco (bajo contraste), logo que cubre demasiado, tamaño impreso pequeño, URL larga con UTM que densifica el patrón.
- **El URL del form cambia.** Si alguien duplica o recrea el form en ClickUp, lo mueve de lista o cambia el plan/espacio, el enlace muere y el iframe queda roto sin aviso. Sale silencioso.
- **Wi-Fi/4G saturados en el evento.** La landing con collage pesado y un iframe que carga una SPA de Angular (78 KB de HTML de shell más bundles) puede tardar más de 10 segundos en una red mala. El usuario escanea el QR y no espera.
- **Envíos de prueba mezclados con leads reales**, notificaciones que no llegan a Ari y Camila, o llamadas jueves y viernes sin dueño asignado a cada lead.
- **Metadatos para compartir rotos.** Si los asistentes comparten el enlace por WhatsApp o LinkedIn y el `og:image` es relativo, apunta a `.local`, es enorme (WhatsApp suele recortar imágenes pesadas) o el scraper cacheó una versión vieja, la vista previa sale rota o vacía.

**Why it happens:**
La entrega "hoy en local" parece completa. La logística de publicación se asume "para después", y el QR se diseña al final.

**How to avoid:**
- Decisión de dominio y hosting **hoy**, no el día 5. Definir un plan A (dominio final `loopsgrowth.com` u otro con DNS listo) y un plan B (subdominio gratuito del hosting elegido, por ejemplo el `*.pages.dev`/`*.netlify.app` si el stack es estático). El plan B debe llevar `noindex` mientras dure y desactivarse al pasar al dominio real.
- **Fallback garantizado y sin infraestructura:** el QR de contingencia apunta directo al URL público del form de ClickUp (existe hoy). Perdemos la landing pero no el lead. Imprimir este QR como opción de respaldo en el material o llevar el enlace listo.
- Usar **QR estático** cuyo destino sea una **URL corta bajo dominio propio** (por ejemplo `loopsgrowth.com/evento`) que redirija (301/302 configurable) a la landing con UTM. Así el destino se puede cambiar sin reimprimir y sin depender de un SaaS que caduque. Si no hay dominio aún, QR estático directo al destino final que se vaya a mantener.
- Reglas de QR: contraste oscuro sobre claro (#212121 sobre blanco), zona de silencio de 4 módulos, corrección de errores M o Q, tamaño impreso mínimo alrededor de 2 x 2 cm para escaneo cercano (más grande si es en pantalla o cartel; validar con impresión real), URL corta para patrón menos denso. Probar en un iPhone y un Android, con luz mala.
- El URL del form vive en **una sola constante de configuración** (no repetido en cinco CTAs). Documentar quién es dueño del form en ClickUp y avisar antes de tocarlo. Smoke test del envío completo el día anterior y la mañana del evento.
- Presupuesto de peso: HTML + CSS + JS críticos por debajo de ~150 KB, imágenes de hero optimizadas, todo lo demás diferido. Probar con throttling "Slow 4G" en DevTools y en un móvil real con datos.
- Preparar el proceso post-envío: notificación en ClickUp a Ari y Camila, asignado por defecto, etiqueta "evento", y borrar los envíos de prueba antes de abrir.
- Vista previa social: `og:title`, `og:description`, `og:image` **absoluto**, 1200x630, peso contenido (idealmente por debajo de unos 300 KB, referencia común no verificada aquí), `og:url` con el dominio final. Comprobar con los depuradores de Facebook y LinkedIn y enviarse el enlace por WhatsApp antes del evento (los scrapers cachean).

**Warning signs:**
- El día 3 antes del evento aún no hay URL pública.
- El QR se generó desde un sitio que pide "crear cuenta".
- Se comparte un enlace `ngrok`, `.local` o una IP.

**Phase to address:** F1 (decisión de dominio) y F5 (deploy, QR, contingencias). Debe entrar al roadmap como fase propia o hito explícito, no como nota al pie.

---

### Pitfall 8: Autogoles SEO (noindex y staging heredados, canonical y OG apuntando a la URL equivocada)

**Severidad:** Alta para una agencia SEO. **Confianza:** HIGH (WordPress documenta el cambio del robots meta desde 5.3) y MEDIUM en detalles por plataforma.

**What goes wrong:**
- `noindex` olvidado. En WordPress, "Desalentar a los motores de búsqueda" añade `<meta name='robots' content='noindex,nofollow'>` y a menudo se migra dentro de la base de datos a producción. Si el stack es estático, aparece como `X-Robots-Tag: noindex` del entorno de preview, `<meta name="robots">` en el layout, o `robots.txt` con `Disallow: /` copiado al deploy final.
- Canonical ausente, o peor, canonical/`og:url`/sitemap/schema `url` apuntando al entorno equivocado (`.local`, `*.netlify.app`, ngrok). Google recibiría la señal de indexar la copia de staging en lugar del dominio real, y las vistas previas sociales apuntan a la URL incorrecta.
- El `sitemap.xml` incluyendo URLs de staging o entradas basura ("Hello world", "Sample page", páginas de adjuntos) en un sitio WordPress sin limpiar.
- H1 duplicado o mal usado. Ojo con el mito: **Google dice que varios H1 no penalizan el ranking**, así que no es un problema de "posición". Sí lo es de calidad: accesibilidad, semántica y credibilidad ante un auditor. El caso típico en Astra: el tema imprime el título de la página como `<h1 class="entry-title">` y el hero del builder añade otro `<h1>`. Otro: usar `<h4>` solo por tamaño visual y saltarse niveles.
- Title y meta description que quedan por defecto ("Just another WordPress site", "Inicio - Loopsgrowth"), o textos demasiado largos para el snippet.
- La página promete GEO pero es invisible para IA: los rastreadores de IA (GPTBot, ClaudeBot, PerplexityBot) no ejecutan JavaScript y leen solo el HTML crudo (estudio Vercel/MERJ, citado en varias fuentes; confianza MEDIUM). Si texto clave se inyecta por JS (animaciones de "reveal", contadores, tipeado), no se lee. Y un `robots.txt` que bloquee bots de IA contradice el mensaje comercial.
- Schema inventado o duplicado (por ejemplo `Organization` de dos plugins a la vez).

**Why it happens:**
Los flujos de "staging protegido" y "producción pública" se mezclan en el último día. Nadie hace una auditoría del sitio de la agencia con las mismas herramientas que la agencia vende.

**How to avoid:**
- Una **checklist de salida SEO** ejecutable sobre el URL final (no sobre local): `curl -sI` para cabeceras (`X-Robots-Tag`), `curl -s | grep -i "robots\|canonical\|og:"`, `robots.txt`, `sitemap.xml`, un H1 por página y jerarquía sin saltos, `lang="es"`, title y description propios, `og:image` absoluto.
- Regla de una sola fuente: canonical, `og:url`, sitemap y schema `url` se derivan del **mismo** valor de configuración `SITE_URL`, que cambia por entorno. Nada hardcodeado.
- Gestionar `noindex` como **interruptor por entorno**, no como edición manual: activado en local/preview/staging, desactivado en producción, y verificado en producción como paso del despliegue.
- En WordPress: borrar contenido demo, desactivar páginas de adjuntos, desactivar sitemaps de tipos que no se usan, y confirmar `blog_public=1` en el último paso. Si se usa Rank Math Pro (preferencia de Juan), comprobar que los ajustes de sitemap y schema no dupliquen los del tema.
- Solo `Organization` (con `logo` y `sameAs` reales) y `WebSite`. Sin reseñas falsas. Probar con la Prueba de resultados enriquecidos.
- Contenido principal en HTML servido, no inyectado por JS. Permitir en `robots.txt` los agentes de IA relevantes. No depender de `llms.txt` (su efecto no está probado; MEDIUM/LOW).
- Recordar el `X-Robots-Tag: noindex` del propio form de ClickUp: es correcto y no afecta a la página padre.

**Warning signs:**
- `curl -sI https://<dominio-final>` devuelve `X-Robots-Tag: noindex` o el HTML contiene `content="noindex`.
- Search Console (o `site:`) muestra el subdominio de staging indexado.
- Lighthouse SEO no llega a 100 en una landing sencilla (es muy fácil llegar).

**Phase to address:** F1 (política de entornos y `SITE_URL`), F4 (auditoría con las herramientas de la agencia), F5 (verificación en el URL final).

---

### Pitfall 9: Trampas de WordPress con Astra (solo si Astra/WordPress)

**Severidad:** Media-Alta condicionada a la decisión de stack. **Confianza:** MEDIUM (varias fuentes coinciden; cifras de nodos son de referencia).

**What goes wrong:**
- **Sobrecarga por plugins y demos.** Astra Starter Templates instala e importa demos, plugins auxiliares y contenido de relleno. Sumado a Elementor (u otro page builder), jQuery, estilos de bloques, emojis y fuentes de Google por defecto, una página de un solo scroll pasa de 100 KB a cientos.
- **DOM inflado por el builder.** Elementor envuelve cada widget en varios `<div>`. Lighthouse avisa cerca de 800 nodos y falla cerca de 1.400. Un collage con muchas secciones lo alcanza fácil. Mitigable con contenedores flex y "Optimized DOM Output", pero hay que activarlo y medirlo.
- **Migración local a producción.** Local guarda `http://loopsgrowth.local` en `siteurl`, `home`, y sobre todo dentro de datos serializados (Elementor, opciones del tema, menús). Un reemplazo de texto simple corrompe la serialización y los layouts desaparecen. Elementor además genera CSS en disco con URLs viejas que hay que regenerar. `http` vs `https` deja "contenido mixto".
- **Fuente personalizada.** Astra free y Elementor free no traen carga de fuentes propias cómoda, se necesita un plugin o la versión Pro, y algunos configuran `font-display` a `auto` (texto invisible o cambios de layout).
- **Estilos globales del tema que se filtran:** colores de enlace, botones y foco de Astra por defecto (contraste), `outline` suprimido, títulos con tamaños que rompen la jerarquía.
- **Ruido de WordPress:** `?author=1` expone usuarios, REST `/wp-json/wp/v2/users`, XML-RPC, login público y plugins sin actualizar. Una landing con WordPress necesita mantenimiento continuo que un equipo de agencia rara vez presupuesta.
- Todo el ciclo depende de una URL de Local Live Link o de un hosting PHP que aún no existe (ver Pitfall 7).

**Why it happens:**
"Astra es liviano" es cierto solo del tema. La suma tema + builder + demos + plugins es la que pesa.

**How to avoid:**
- Si se elige WordPress: no importar demos. Tema base + un solo builder + lista corta de plugins (SEO, caché, formulario no hace falta). Medir Lighthouse **en local** en cada paso, no solo al final.
- Activar la optimización de DOM del builder, usar contenedores flex, y presupuestar un máximo de nodos (<800) para toda la página.
- Migración con WP-CLI: `wp search-replace 'http://loopsgrowth.local' 'https://<dominio>' --all-tables --dry-run` primero, luego real (WP-CLI maneja datos serializados; `--precise` fuerza el procesado en PHP si hay dudas), después regenerar CSS del builder, vaciar cachés y verificar `siteurl`/`home` en `wp-config.php`. Revisar que no queden URLs `.local` ni de Live Link en el HTML (`curl -s | grep -c "\.local\|ngrok"` debe dar 0).
- Definir en Astra y en el builder la **paleta y tipografía globales** desde el primer minuto, y revisar estados de foco.
- Endurecer lo básico: ocultar enumeración de usuarios, desactivar XML-RPC, actualizaciones automáticas, backup.
- Si el equipo no necesita editar la landing con frecuencia, contrastar con un sitio estático (STACK.md). Esa es una decisión de stack, no un pitfall.

**Warning signs:**
- El paquete inicial trae más de 10 plugins activos y "Hello world".
- Lighthouse marca DOM excesivo o CLS por fuentes.
- Tras subir el sitio, las páginas muestran el "Elementor" en blanco o imágenes de `.local`.

**Phase to address:** F1 (decisión y configuración base) y F5 (migración). La verificación de peso va en F4.

---

### Pitfall 10: Collage y animación que rompen Core Web Vitals y `prefers-reduced-motion`

**Severidad:** Alta (una agencia SEO con mal CWV se auto-desmiente). **Confianza:** HIGH en los umbrales y patrones; MEDIUM en cifras por dispositivo.

**What goes wrong:**
- **LCP por imagen de collage.** PNG enormes con transparencias (lupas, ojos, clics) como hero. Sin `fetchpriority="high"`, con `loading="lazy"` en el elemento LCP (error clásico de WordPress y de temas) o sin formato moderno, el LCP pasa de 2.5 s.
- **Animaciones de entrada (reveal) que retrasan el LCP.** Si el titular del hero arranca con `opacity: 0` hasta que corre JS, el LCP se mide cuando aparece. Además, si el JS falla, el texto no se ve nunca.
- **Imágenes sin `width`/`height`** o contenedores sin `aspect-ratio`: CLS.
- **INP** por JS de scroll (parallax, scroll-jacking, librerías de animación de gran tamaño) en móviles de gama media.
- **Animaciones infinitas** de los "ojos animados" y clics de la mascota: sin control de pausa fallan la regla WCAG 2.2.2 (más de 5 s) y A11Y.md aún más (más de 3 s junto a otro contenido), y distraen del form.
- **`prefers-reduced-motion` ignorado.** A11Y.md pide construir la ruta de movimiento reducido como predeterminada y añadir movimiento en la rama `no-preference`.
- Uso de propiedades que fuerzan layout (`top`, `left`, `width`) en vez de `transform`/`opacity`.

Umbrales de referencia (Google): LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1.

**Why it happens:**
La estética "collage pop" invita a muchas capas. Se juzga en un MacBook con fibra.

**How to avoid:**
- El collage como **SVG** o **AVIF/WebP** con tamaños responsivos (`srcset`, `sizes`), dimensiones explícitas y máximo 2 o 3 imágenes por encima del pliegue. Solo la imagen LCP con `fetchpriority="high"` y sin `lazy`. Todo lo demás con `loading="lazy"` y `decoding="async"`.
- El hero debe renderizar texto **visible por defecto**. La animación se añade dentro de `@media (prefers-reduced-motion: no-preference)` y solo con `transform`/`opacity`. Nada de ocultar el titular hasta que cargue JS.
- Un único mecanismo de animación ligero (CSS o WAAPI). Sin librerías pesadas para un efecto decorativo. Nada de scroll-jacking.
- Animaciones cíclicas con límite (3 repeticiones o menos de 5 s) o botón de pausa visible. Ninguna animación cerca del iframe.
- Verificar con throttling de CPU 4x y "Slow 4G" en DevTools, y en un Android de gama media real.
- Presupuesto: LCP < 2.5 s en móvil simulado, CLS < 0.1, total de página inicial < ~500 KB (estimación de referencia).

**Warning signs:**
- El hero pesa más de 200 KB o hay más de 4 imágenes en la primera pantalla.
- El titular tiene `opacity: 0` o `visibility: hidden` en el CSS inicial.
- No existe ningún `@media (prefers-reduced-motion)` en el CSS.

**Phase to address:** F2 (implementación) y F4 (medición y prueba con reduced-motion activado).

---

### Pitfall 11: Consistencia del español (voseo, mezcla SEO/GEO/AEO, números y promesas que no coinciden)

**Severidad:** Media-Alta (el proyecto tiene una regla explícita: neutro, nunca voseo). **Confianza:** HIGH (regla del proyecto; las listas son de conocimiento lingüístico).

**What goes wrong:**
- Se filtra voseo del copy original o del texto que se escribe rápido: "agendá", "tenés", "querés", "podés", "hacé", "contanos", "llená". La regla del proyecto es tú, no vos.
- Mezcla de formas: "tú" en un CTA y "usted" o "ustedes" en otro. Y `vosotros` (español de España) si algún texto se genera con un modelo sin instrucción.
- Terminología inconsistente: SEO/GEO vs "SEO y AEO"; "e-commerce" vs "comercio electrónico"; "llamada de 30 minutos" en el CTA vs "20 minutos" en el embudo; "casos de éxito" vs "resultados". La numeración del copy salta de 8 a 10.
- Formato numérico: "USD 200k", "4-5k", "+1.5k" mezcla convenciones (punto/coma decimal, "k", "mil", "USD" vs "US$"). Elegir una sola y aplicarla.
- Las etiquetas del form de ClickUp y los mensajes del iframe pueden decir otra cosa que la landing (por ejemplo duración de la llamada) o estar en inglés.
- `lang` incorrecto (`en`) por defecto del tema o del generador, y `og:locale` mal.
- Textos de UI, `aria-label`, `alt`, `title` del iframe, mensajes de error o metadatos en inglés porque nadie los traduce.
- El humanizer aplicado a mano en unas secciones y no en otras: rastros de "IA" (guiones largos, listas de tres, frases de relleno) y tono inconsistente.

**Why it happens:**
El copy llega de una fuente, se retoca en el código y se olvidan `alt`, `aria-label`, metadatos y el propio form.

**How to avoid:**
- **Glosario cerrado** (una hoja): SEO/GEO (decidir con Ari si AEO aparece o no), duración de la llamada (30 o 20), cómo se escribe USD y los montos, tratamiento (tú), nombres del equipo y cargos. Toda cadena visible sale de ahí.
- **Gate de revisión** (script o grep) sobre el HTML final para voseo: `\b(vos|tenés|querés|podés|sabés|sos|hacé|agendá|escribí|contanos|llená|descubrí|empezá|mirá|necesitás)\b`, más comprobación de `lang="es"` (o `es-419` si el sitio se dirige a Latinoamérica) y de `[VERIFICAR]` (Pitfall 4).
- Aplicar la skill humanizer con voz de marca a todo texto nuevo, y **sin guiones largos** (regla de Juan). Incluye `alt`, `aria-label`, `title`, metadatos.
- Alinear con Ari, antes de maquetar, los puntos abiertos de la sección "Ambigüedades" de PROJECT.md (30 vs 20 min, SEO/GEO/AEO, orden de casos).
- Revisar el texto del form de ClickUp junto con la landing (mismo vocabulario y misma duración).

**Warning signs:**
- Aparecen imperativos con acento final agudo (`-á`, `-é`, `-í`) en botones.
- Convivencia de "SEO/GEO" y "SEO y AEO" en la misma página.
- El CTA dice 30 minutos y el form 20.

**Phase to address:** F2 (redacción), F4 (gate automático).

---

## Moderate Pitfalls

### Pitfall 12: Accesibilidad estricta reducida a "pasa axe"

**What goes wrong:** Las herramientas automáticas cubren solo una parte de los problemas. Fallan en cosas que A11Y.md exige: orden lógico de foco, foco no oculto por header sticky, ausencia de trampas de teclado (el iframe es el sitio clásico), enlace de salto ("saltar al contenido" y "saltar al formulario"), un `<main>` único, landmarks, textos alternativos que digan algo (no "collage"), decorativos con `alt=""` o `aria-hidden`, y tamaño de objetivo de 44px.
**Prevention:** Añadir una pasada manual: recorrer toda la página solo con teclado (incluido entrar y salir del iframe), 200% de zoom y 400% de reflow sin scroll horizontal, `prefers-reduced-motion` activado, y una prueba con VoiceOver o NVDA en móvil o desktop. Los íconos del collage (lupas, ojos) son decorativos: `aria-hidden="true"`. Si hay tarjetas de métricas, cada número lleva su etiqueta en el texto, no solo visual.
**Phase:** F2 y F4.

### Pitfall 13: Equipo nombrado sin fotos ni logos

**What goes wrong:** Sin fotos, la sección "Quiénes somos" queda como cuatro nombres sin rostro, y los "casos" sin logos parecen inventados. Riesgo de credibilidad, no técnico. Además, publicar nombres y cargos requiere consentimiento de cada persona.
**Prevention:** Confirmar con cada integrante que acepta aparecer (Arianna Lupi, Verónica Romero, Juan Angulo, Miguel Pacheco). Sustituir las fotos por ilustración de marca consistente (el estilo collage es aquí una ventaja), roles claros y una línea de credibilidad verificable. Marcar en el backlog "fotos reales" para la versión posterior.
**Phase:** F2.

### Pitfall 14: Referencias de diseño copiadas a ciegas (m8l.com, skale.so, rankingonai.com)

**What goes wrong:** Adoptar patrones de los referentes que chocan con las reglas propias: animaciones pesadas, scroll-jacking, texto pequeño sobre gradientes, carruseles automáticos (fallan A11Y.md), o secciones de "logos de clientes" que aquí no existen.
**Prevention:** Copiar la estructura y el ritmo, no las técnicas. Filtrar cada patrón contra tres reglas: contraste (Pitfall 5), movimiento (Pitfall 10), peso (presupuesto). Sin carruseles automáticos.
**Phase:** F1 (criterios) y F2.

### Pitfall 15: Alcance de un día y fases que se aplastan

**What goes wrong:** El plan "sitio completo hoy" comprime diseño, copy, form, QA y stack en una jornada. Lo primero que se sacrifica es la QA de accesibilidad y la medición. Y el stack "por investigación" puede consumir el día si se debate en vez de decidirse.
**Prevention:** Decidir el stack en la primera hora con los criterios de STACK.md. Definir el orden por riesgo: (1) form funcionando y visible, (2) hero legible y rápido, (3) resto de secciones, (4) QA. Mantener un tablero de "no negociables" con este documento: contraste, título del iframe, `noindex` verificado, gate de `[VERIFICAR]`, QR.
**Phase:** F1.

### Pitfall 16: Datos personales y aviso de privacidad ausentes

**What goes wrong:** El form recoge datos de prospectos (nombre, correo, facturación) y la landing carga ClickUp (terceros). Sin política de privacidad ni aviso de cookies si hay analytics, hay riesgo regulatorio (depende del país: UE muy estricto, LatAm variable) y desconfianza. Una agencia de marketing lo nota rápido.
**Prevention:** Enlace visible a una política de privacidad breve (aunque sea una página simple) y texto que indique qué se hace con los datos del form. Confirmar la jurisdicción con Ari. Analytics con consentimiento donde corresponda.
**Phase:** F3 y F4.

---

## Minor Pitfalls

### Pitfall 17: Favicon, imagen social y errores de detalle

**What goes wrong:** Sin favicon (petición 404 en cada carga), `og:image` faltante, título de pestaña genérico, 404 sin diseño, `theme-color` ausente.
**Prevention:** Isotipo "Loopy" como favicon SVG y PNG 180x180, `og:image` de marca, `theme-color` con el morado.

### Pitfall 18: Enlaces internos y anclas rotas en la landing de una página

**What goes wrong:** Los CTAs apuntan a `#formulario` pero el `id` cambió, o el ancla queda tapada por el header sticky, o el foco no se mueve.
**Prevention:** Un único `id` estable, `scroll-margin-top`, y probar que el foco de teclado llega al formulario tras activar el CTA.

### Pitfall 19: Precios y cifras en el copy

**What goes wrong:** Publicar rangos como "4-5k/mes en marketing" o "+1.5k/mes en SEO/GEO" del perfil de cliente ideal como si fuera oferta pública ahuyenta o ancla mal.
**Prevention:** Confirmar con Ari si esa información va en la página o solo en la pre-calificación. Ese dato es criterio interno de filtrado.

### Pitfall 20: Entregar un producto no verificado por Ari y Camila en los tiempos correctos

**What goes wrong:** Validación tardía y cambios de copy o diseño a horas del evento.
**Prevention:** Una sola ronda de revisión estructurada (lista de puntos abiertos de PROJECT.md) con fecha límite, y congelar el copy 48 horas antes del evento.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Fuente sin licencia web "para validar" | Fidelidad visual hoy | Riesgo legal y de imagen, retrabajo | Solo local y nunca en el URL público del evento |
| Fuente fallback temporal con variable CSS | Se llega a la fecha con licencia pendiente | Ari valida un look distinto al final | Aceptable, con variable de una línea y aviso a Ari |
| Iframe de ClickUp en lugar de form propio | Fecha y fiabilidad | Sin evento de conversión, sin estilo, sin control de accesibilidad interna | Aceptable para el MVP (decisión tomada), con fallback y plan de medición por conteo en ClickUp |
| `noindex` manual en staging | Rápido | Se olvida y se hereda a producción | Nunca manual: siempre por entorno y verificado |
| URLs hardcodeadas de dominio/local | Rápido de maquetar | Reemplazos frágiles, canonical roto | Nunca: una variable `SITE_URL` |
| Métricas de casos sin ficha de evidencia | Copy listo hoy | Riesgo legal y de credibilidad | Solo si se publica cualitativo sin cifras |
| QR dinámico de SaaS gratuito | Cambiable sin reimprimir | Caduca, cae en página del proveedor | Nunca para material impreso |
| Plantilla demo de Astra importada | Se ve algo hoy | Plugins y peso muertos, contenido basura indexable | Nunca en un sitio que vende SEO |
| Sin analytics propios | Menos peso y cookies | Ciegos frente al evento | Aceptable solo si el conteo de ClickUp y UTM cubren la medición |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| ClickUp Forms (iframe) | Copiar el snippet tal cual, sin `title`, con `height="100%"` y sin reservar espacio | `title` en español, `min-height` medido, `class="clickup-embed clickup-dynamic-height"`, `src` exacto de `forms.clickup.com`, script `async` |
| ClickUp Forms (evento) | Esperar redirect a `/gracias` y `postMessage` de éxito | Asumir que no existen. Medir con CTAs, visibilidad del iframe y conteo en ClickUp |
| ClickUp Forms (idioma) | Suponer que el form está en español | Revisar en vivo etiquetas, validaciones y confirmación; documentar el idioma real |
| ClickUp Forms (URL) | Repetir el URL en cada CTA | Una constante de configuración, un responsable, un smoke test antes del evento |
| CSP propia | Olvidar `frame-src` y `script-src` de ClickUp | Permitir `forms.clickup.com` y `app-cdn.clickup.com` explícitamente |
| Generador de QR | SaaS con trial y "dinámico" | QR estático a URL corta de dominio propio |
| Local WP Live Link | Compartirlo como URL de evento | Solo para validación interna del equipo |
| Depuradores sociales | Compartir sin probar | Facebook Sharing Debugger, LinkedIn Post Inspector, prueba real por WhatsApp |
| Rank Math / plugins SEO (si WP) | Dos plugins generando schema y canonical | Uno solo, con `Organization` y sitemap revisados |
| Fuentes | CDN de terceros o archivo de origen dudoso | WOFF2 autoalojado con licencia Web confirmada |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Hero con collage en PNG grande | LCP > 2.5 s en móvil | SVG/AVIF/WebP, `fetchpriority="high"`, sin lazy en el LCP | Desde el primer Lighthouse móvil |
| Texto del hero oculto hasta que corre JS | LCP tardío, texto invisible sin JS | Texto visible por defecto, animación en `no-preference` | Redes lentas y en el evento |
| Iframe de ClickUp cargado en el primer render | TBT alto, ancho de banda consumido antes del contenido | Diferirlo (validar que el resize funcione) o ubicarlo bajo el pliegue | Wi-Fi de evento saturado |
| Altura del iframe sin reservar | CLS > 0.1 al cargar el form | `min-height` medido | Siempre |
| Fuente sin métricas de fallback | CLS y "salto" de texto | `size-adjust` y overrides, precarga del peso LCP | Al primer render con caché frío |
| Builder con DOM inflado (si WP) | > 1.400 nodos, INP alto | Optimized DOM Output, contenedores flex, presupuesto de nodos | Con collages de 8 o más secciones |
| Librerías de animación | JS de 50 a 200 KB para efectos decorativos | CSS puro o WAAPI | Móviles de gama media |
| Imágenes sin dimensiones | CLS al cargar | `width`/`height` o `aspect-ratio` | Siempre |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Cargar scripts de terceros sin control (ClickUp CDN, analytics) | Dependencia y superficie de ataque | Solo los necesarios; CSP; `rel="noopener"` en enlaces externos |
| WordPress sin endurecer (si aplica) | Enumeración de usuarios, XML-RPC, plugins vulnerables | Ocultar enumeración, desactivar XML-RPC, actualizaciones y backup |
| Exponer un Live Link de Local o una IP | Sitio de trabajo público sin control | Solo temporalmente y con contraseña; nunca en el material |
| Envíos de spam al form público | Lista de leads contaminada | Revisar si ClickUp ofrece protección; filtrar en pre-calificación (no verificado) |
| Datos del cliente en casos de éxito | Incumplimiento contractual | Ficha de evidencia con permiso, anonimizar |
| Credenciales o `.env` en el repositorio del sitio | Filtración | `.gitignore`, secretos fuera del repositorio |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| El form está lejos o solo al final | Se pierde el lead, contradice el valor central (form a un scroll) | CTA "Agenda tu llamada de 30 minutos" fijo o repetido en cada sección con ancla al form |
| Sin alternativa si el iframe no carga | Lead perdido en Safari o con bloqueadores | Enlace "abrir en pestaña nueva" y correo |
| Muchas capas de collage detrás del texto | Lectura difícil y contraste variable | Texto sobre bloques de color plano con contraste aprobado |
| Números de casos sin contexto | Desconfianza del público experto | Línea base, período, "resultado de un cliente" |
| CTA con promesa ambigua (30 vs 20 minutos) | Fricción y expectativas rotas | Un solo dato, igual en la landing y en el form |
| Animaciones constantes junto al form | Distracción, riesgo de accesibilidad | Movimiento solo en el hero y con control |
| Móvil como versión reducida | El evento es 100% móvil (QR) | Diseñar y probar primero a ~400px |

## "Looks Done But Isn't" Checklist

- [ ] **Iframe de ClickUp:** suele faltar `title` y fallback. Verifica: `title` presente, enlace "abrir en pestaña nueva", `noscript`, prueba en Safari y Firefox estricto.
- [ ] **Envío real:** suele probarse solo hasta "se ve el form". Verifica: enviar de verdad, ver la confirmación en móvil, la tarea aparecer en ClickUp, notificación a Ari y Camila, y borrar el envío de prueba.
- [ ] **Contraste:** el CSS puede contener `#fff` sobre naranja o amarillo. Verifica: axe sin "color-contrast" y revisión manual sobre las imágenes del collage.
- [ ] **Foco visible:** suele quedar suprimido por el tema. Verifica: recorrido completo con teclado, sin trampas, con header sticky sin tapar el foco.
- [ ] **Movimiento:** suele no haber rama de reducción. Verifica: `prefers-reduced-motion: reduce` activo, el hero sigue legible y nada se mueve.
- [ ] **Fuente:** puede ser un archivo sin licencia. Verifica: licencia Web confirmada por escrito, WOFF2 autoalojado, prueba de `áéíóúüñ¿¡`.
- [ ] **CLS:** falla por iframe y fuente. Verifica: Lighthouse móvil con CLS < 0.1 y LCP < 2.5 s en Slow 4G.
- [ ] **SEO en el URL final:** `curl -sI` sin `noindex`; `robots.txt` correcto; canonical, `og:url` y sitemap con el dominio real; un H1; `lang="es"`; title y description propios.
- [ ] **Vista previa social:** `og:image` absoluta y probada por WhatsApp y LinkedIn.
- [ ] **Copy:** sin `[VERIFICAR]`, sin voseo, sin "garantizamos", 30/20 minutos alineado, SEO/GEO/AEO unificado, sin guiones largos.
- [ ] **Casos de éxito:** cada cifra tiene ficha de evidencia y permiso; el último ítem está en su propia tarjeta.
- [ ] **Migración a producción (si WP):** cero `.local` ni ngrok en el HTML; CSS del builder regenerado; contenido demo eliminado.
- [ ] **QR:** estático, oscuro sobre claro, impreso a tamaño real, probado en iPhone y Android con luz mala, y con destino que no depende de un trial.
- [ ] **Plan B del evento:** QR o enlace directo al form de ClickUp listo y probado.
- [ ] **Privacidad:** enlace a política y aviso si hay analytics.

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| `noindex` heredado a producción | LOW | Quitar el ajuste, verificar con `curl`, solicitar reindexación en Search Console |
| Canonical o `og:url` a staging | LOW | Corregir `SITE_URL`, regenerar sitemap, volver a raspar con los depuradores sociales |
| QR impreso apuntando a URL muerta | HIGH | Si el destino es una URL corta propia: redirigirla. Si no: pegatinas o reimpresión, y enlace directo al form como emergencia |
| Fuente sin licencia detectada | MEDIUM | Cambiar `--font-brand` a fallback, comprar licencia Web y volver a subir |
| Claim no sustentado ya publicado | MEDIUM | Retirar la cifra o la afirmación de inmediato, reemplazar con texto cualitativo, documentar evidencia antes de republicar |
| Iframe roto (URL del form cambió) | LOW | Actualizar la constante en un solo lugar, redeploy, avisar al equipo |
| Iframe bloqueado en algunos navegadores | LOW | El enlace "abrir en pestaña nueva" ya cubre. Añadirlo si no existe |
| CLS o LCP fuera de umbral | MEDIUM | Reservar `min-height`, optimizar hero, precargar fuente, quitar animaciones de entrada |
| Migración WP con layouts perdidos | MEDIUM | Restaurar copia, repetir `search-replace` con `--dry-run` y regenerar CSS del builder |
| Voseo o inconsistencias publicadas | LOW | Grep, corregir, redeploy |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| 1. Altura del iframe (CLS, scroll, salto) | F3 y F4 | Lighthouse CLS < 0.1; envío completo en iOS y Android sin doble scroll ni salto |
| 2. Título, fallback, bloqueos, idioma | F3 y F4 | `title` en el DOM; matriz Safari/Firefox estricto/Brave; prueba con lector de pantalla |
| 3. Conversión no medible | F3 y F5 | Definición de métrica escrita; UTM en el QR; conteo en ClickUp cruzado con visitas |
| 4. Claims y `[VERIFICAR]` | F2 y F4 | Gate de grep sin coincidencias; ficha de evidencia por cifra; aprobación de Ari |
| 5. Contraste naranja/amarillo | F1, F2 y F4 | Tabla de tokens aprobada; axe sin errores de contraste; revisión manual del collage |
| 6. Licencia y fuente | F1, F2 y F4 | Licencia Web por escrito; WOFF2 propio; prueba de glifos; CLS de fuente |
| 7. Evento: dominio, QR, form, red | F1 y F5 | URL pública viva 3 días antes; QR probado impreso; smoke test del form el día del evento; prueba en Slow 4G |
| 8. Autogoles SEO | F1, F4 y F5 | Checklist `curl` sobre el URL final; sin staging indexado; un H1; OG absoluta |
| 9. WordPress/Astra (si aplica) | F1, F4 y F5 | Sin demos; DOM < 800 nodos; cero `.local` en HTML tras migrar |
| 10. Collage, animación y CWV | F2 y F4 | LCP < 2.5 s, INP < 200 ms, CLS < 0.1; reduced-motion probado |
| 11. Consistencia del español | F2 y F4 | Grep de voseo sin resultados; glosario aplicado; `lang="es"` |
| 12. Accesibilidad más allá de axe | F2 y F4 | Recorrido con teclado y lector; zoom 200% y reflow |
| 13. Equipo sin fotos | F2 | Consentimiento de cada persona; ilustración consistente |
| 14. Referencias copiadas | F1 y F2 | Cada patrón pasa filtro de contraste, movimiento y peso |
| 15. Alcance de un día | F1 | Lista de no negociables y orden por riesgo |
| 16. Privacidad | F3 y F4 | Enlace a política presente; analytics con aviso si aplica |

## Flags para investigación de fase (para el roadmap)

- **F3 (formulario y medición):** necesita verificación práctica, no solo lectura. Confirmar en el propio ClickUp (a) si el form admite campo oculto o prefill por parámetro para registrar la fuente/UTM, (b) el idioma real que ve un visitante hispanohablante, (c) si `loading="lazy"` o carga diferida es compatible con el auto-resize, (d) el plan de ClickUp de Ari y sus límites de formularios y notificaciones.
- **F1 (dominio y licencia):** decisiones de Ari, no de código. Dominio final o alternativo, país/jurisdicción del público, y quién posee la licencia de Hurme Geometric Sans 3 y si incluye Web.
- **F2 (claims):** la validez legal por país necesita criterio de alguien con contexto local. Esta investigación solo verificó el principio general de sustanciación (FTC, EE. UU.).
- **F5 (evento):** patrón estándar si el stack es estático (subdominio gratuito más dominio); más pesado si es WordPress (necesita hosting PHP y migración).

## Sources

**Mediciones directas (HIGH), 2026-09-18:**
- Cabeceras HTTP del form de ClickUp (`curl -I`): sin `X-Frame-Options`, `x-robots-tag: noindex, nofollow`, `content-language: en-US`.
- HTML del form: `<html lang="en-US">`, `<title>ClickUp Forms</title>`, shell de SPA Angular, CSP por meta.
- Script del embed: https://app-cdn.clickup.com/assets/js/forms-embed/v1.js (iFrameResizer 4.2.8, `checkOrigin: true`).
- Cálculo de ratios de contraste con la fórmula de luminancia relativa de WCAG (script propio).

**ClickUp (MEDIUM):**
- https://help.clickup.com/hc/en-us/articles/7255560049815-Share-embed-and-export-Forms (autosize y clase `clickup-dynamic-height`, vía resultado de búsqueda; la página devolvió 403 a la descarga directa)
- https://feedback.clickup.com/feature-requests/p/enable-redirect-feature-for-embeded-forms (redirect no funciona en embeds, 72 votos)
- https://feedback.clickup.com/feature-requests/p/change-embedded-form-size (problemas de tamaño y scroll en móvil)
- https://help.clickup.com/hc/en-us/articles/41664681659415-Enable-third-party-cookies-in-your-browser (cookies de terceros; solo vía resultado de búsqueda)

**Tipografía (MEDIUM):**
- https://hurmedesign.com/product-category/typefaces/hurme-geometric-sans-%E2%84%963-typefaces/ (Desktop, Web por pageviews mensuales, App y ePub con EULA separados)
- https://www.myfonts.com/fonts/hurme/geometric-sans-3?tab=licensing (precios desde 49 USD por estilo, 249 USD la familia)
- https://developer.chrome.com/blog/framework-tools-font-fallback (`size-adjust`, `ascent-override`, `descent-override`, `line-gap-override`)

**SEO y WordPress (MEDIUM):**
- https://make.wordpress.org/core/2019/09/02/changes-to-prevent-search-engines-indexing-sites/ (robots meta desde WP 5.3)
- https://localwp.com/help-docs/local-features/live-links/ (Live Links con ngrok, requiere el equipo encendido)
- https://jorijn.com/en/knowledge-base/wordpress/setup/wordpress-search-replace-database-url/ (search-replace, datos serializados)
- https://elementor.com/blog/elementor-performance-tip-reduce-your-dom-size-to-make-your-website-faster/ (DOM, Optimized DOM Output)
- https://www.boia.org/blog/multiple-h1-tags-are-bad-for-accessibility-and-seo y https://www.stanventures.com/blog/multiple-h1-tags/ (varios H1: sin penalización de Google, pero sí un tema de accesibilidad)
- https://www.getpassionfruit.com/blog/javascript-rendering-and-ai-crawlers-can-llms-read-your-spa (rastreadores de IA sin JS, cita el estudio Vercel/MERJ; confianza MEDIUM por ser fuente secundaria)

**Legal (MEDIUM, solo principio general de EE. UU.):**
- https://www.ecfr.gov/current/title-16/chapter-I/subchapter-B/part-255 (16 CFR Parte 255)
- https://www.federalregister.gov/documents/2023/07/26/2023-14795/guides-concerning-the-use-of-endorsements-and-testimonials-in-advertising
- Las normas de España y Latinoamérica NO se verificaron en esta investigación (LOW): validar con alguien local.

**QR (MEDIUM):**
- https://support.qr-code-generator.com/hc/en-us/articles/7665046137613-What-happens-to-my-account-and-QR-Codes-when-the-trial-expires (los códigos dinámicos se desactivan al terminar el trial)

**Accesibilidad:**
- https://github.com/fecarrico/A11Y.md/blob/main/docs/en/A11Y.md (reglas del proyecto: 4.5:1 texto, 3:1 UI, foco 2px con 3:1 y no tapado, `prefers-reduced-motion` como ruta base, objetivo 24px mínimo y 44px de casa; resumen obtenido por descarga automática, releer el original antes de auditar)

**Conocimiento general no verificado en esta ejecución (LOW):** tolerancias de impresión del QR, peso recomendado de `og:image` para WhatsApp, comportamiento del iframe en webviews in-app, y política de cookies de terceros por navegador en la fecha actual. Validar con pruebas reales.

---
*Pitfalls research for: landing B2B de agencia SEO/GEO con form de ClickUp embebido, evento inminente*
*Researched: 2026-09-18*

# Feature Research

**Domain:** Landing de captación B2B para agencia SEO/GEO (una página, un solo CTA: formulario de ClickUp, pre-calificación para clientes de USD 200k+/año)
**Researched:** 2026-09-18
**Confidence:** MEDIUM (estructura y copy de las referencias: MEDIUM, extraídos con WebFetch en texto, sin ver el render; movimiento y animación: LOW, inferidos; reglas de contraste y A11Y.md: HIGH, calculadas y leídas de la fuente)

## Resumen para el roadmap

1. La conversión de estas landings se apoya en pocas piezas: promesa clara en el hero, prueba concreta cerca del CTA, un solo CTA repetido, un proceso corto y transparente, y un FAQ que resuelve objeciones. Las tres referencias hacen eso; lo demás es decoración de marca.
2. Sin logos ni fotos, la prueba social pasa a ser **métricas específicas con contexto (sector, plazo, canal)**, un proceso transparente y **la propia página como demostración técnica**. Esto último es el diferenciador natural de una agencia SEO/GEO.
3. La pre-calificación (USD 200k+/año) se hace con **autoselección en la página** (callout "para quién es / para quién no") más las preguntas del formulario de ClickUp. La página no debe intentar filtrar con más campos, porque el form es un iframe que no podemos modificar desde el frontend.
4. El copy v2 ya cubre casi todo lo que hacen las referencias. **Faltan tres piezas** que las tres referencias tienen o que ayudan a pre-calificar: FAQ, bloque "para quién es", y footer con datos mínimos legales y de contacto.
5. Hay tres contrastes de marca que **fallan** y condicionan el diseño: blanco sobre naranja (2.89), naranja sobre blanco (2.89) y morado sobre gris oscuro (1.66). Ver tabla en la sección A11Y.

## Feature Landscape

### Table Stakes (los usuarios esperan esto)

Sin estas piezas la página se siente incompleta o poco confiable. Se marca la evidencia entre paréntesis (M = m8l, S = skale, R = rankingonai).

| Feature | Por qué se espera | Complejidad | Notas |
|---------|-------------------|-------------|-------|
| H1 con categoría, público y resultado | El visitante decide en segundos si es para él (S: "Organic Growth Engines That Win in AI Search"; R: "The AI Search & SEO Agency for High-Growth SaaS"; M: "Scale faster with a full-stack growth team") | LOW | Un único H1 real en texto (no en imagen). Debe nombrar SEO/GEO, Google + ChatGPT/Gemini y el tipo de cliente (e-commerce / negocios con inversión seria). Unificar "SEO/GEO" vs "SEO y AEO" con Ari antes de escribirlo |
| Subtítulo que ancla al ICP y al resultado de negocio | S lo hace en el subhead ("SQLs, pipeline, and revenue over traffic and rankings") | LOW | Traducir a ventas/ingresos del e-commerce, no a tráfico o ranking |
| CTA primario visible sin scroll | Las tres referencias lo tienen en hero y nav | LOW | Texto del copy: "Agenda tu llamada de 30 minutos". Alinear 20 vs 30 min con Ari antes de publicar |
| Header pegajoso con CTA persistente | S y R mantienen CTA en la nav en todo momento | LOW | Nav de anclas (máx. 4 o 5 enlaces) + botón CTA. Ver "Focus Not Obscured" en A11Y: `scroll-padding-top` igual a la altura del header |
| Un solo CTA repetido en varios puntos | R repite "Let's chat" 7+ veces al mismo destino; S: hero, medio y final | LOW | Todos son `<a href="#agenda">`. Cero JS, funciona sin scripts. Sugerido: nav, hero, tras Solución, tras Resultados/Casos, tras Cómo funciona, sección final |
| Formulario ClickUp embebido inline en la sección final (no modal) | Core Value: "a un scroll de distancia". M pone su form cerca del final; S y R redirigen fuera | MEDIUM | `id="agenda"`; iframe con `title` descriptivo, altura autoajustada (ClickUp la trae activada por defecto, LOW-MEDIUM: fuente de ayuda de ClickUp), `loading="lazy"` solo si no está en el primer viewport. El estilo del iframe no se puede modificar desde la página |
| Fallback del formulario | Si un bloqueador, la cookie de terceros o la red rompen el iframe, se pierde la conversión | LOW | Enlace visible "¿No carga el formulario? Ábrelo en otra pestaña" con la URL directa de ClickUp; `<noscript>` con el mismo enlace |
| Sección de problema con 3 dolores concretos | S: "Overcome your growth blockers" (3 bloques) | LOW | Ya está en copy v2 ("El problema") |
| Contexto de "por qué ahora" (cambio a búsqueda con IA) | R tiene bloque propio: "AI Is Changing How People Search" | LOW | Ya está en copy v2. Mantenerlo corto (un bloque, no una sección larga) y con CTA debajo |
| Servicios/pilares con resultado asociado | R: 4 pilares; S: 3 columnas con resultado numérico por servicio | MEDIUM | 4 pilares del copy v2. Recomendado: una línea de resultado por pilar, solo si el dato está verificado |
| Prueba de resultados con números específicos | S y R muestran "+2,373% trials", "17x visibilidad en ChatGPT", "+2830% tráfico directo desde ChatGPT" | MEDIUM | Ver sección "Prueba social sin logos ni fotos". Cada cifra con sector, plazo y qué se midió |
| Proceso "Cómo funciona" en 3 a 4 pasos | R: 3 pasos, con "llamada gratis" como paso 1 | LOW | Reflejar el embudo real: formulario, llamada de pre-calificación, cotización, llamada de cierre. Bajar la fricción explicando qué pasa después de enviar |
| Qué incluye / entregables | Reduce "¿qué recibo por mi dinero?" (M lista 10 capacidades) | LOW | Ya en copy v2 ("Qué incluye"). Auditoría, estrategia, ejecución, reportes |
| Quiénes somos con las 4 personas | M y R muestran equipo; es la principal señal de "hay humanos reales" | MEDIUM | Sin fotos: ver sección de social proof (avatares ilustrados con estilo collage) |
| FAQ corto (5 a 6 preguntas) | M y R lo incluyen; S no. Maneja objeciones de precio, plazos, "qué es GEO", tamaño de cliente | LOW | **No está en copy v2**, hay que redactarlo con Ari. Usar `<details>`/`<summary>` nativos o un patrón de acordeón accesible |
| Footer mínimo | Las tres referencias tienen footer con legales y contacto | LOW | Marca, correo de contacto, redes, enlace a política de privacidad (el form captura datos personales). Confirmar con Ari si existe política y correo |
| HTML semántico y encabezados jerárquicos | La página promete SEO técnico; A11Y.md lo exige | LOW | Un `<h1>`, `<h2>` por sección, `<nav>`, `<main>`, `<footer>`, `<section aria-labelledby>` |
| Responsive mobile-first | El evento implica escaneo de QR en móvil; probablemente el tráfico principal | MEDIUM | Diseñar primero a 400px. El iframe debe ser usable sin scroll horizontal |
| Metadatos y OG básicos | Compartir en WhatsApp/LinkedIn tras el evento | LOW | `<title>` único con lo específico primero (SC 2.4.2), meta description, canonical, `lang="es"`, imagen OG 1200x630 con collage de marca, Twitter card |
| Rendimiento sólido (Core Web Vitals) | Una agencia SEO con landing lenta pierde credibilidad inmediata | MEDIUM | Sin video de fondo, sin librerías de animación pesadas, fuente propia con `font-display: swap` y subset, imágenes en AVIF/WebP con dimensiones fijas |

### Diferenciadores (ventaja competitiva)

| Feature | Propuesta de valor | Complejidad | Notas |
|---------|--------------------|-------------|-------|
| **La página como prueba** ("Bajo el capó") | Ninguna de las tres referencias demuestra su servicio en su propia página. Para una agencia SEO/GEO es la mejor prueba disponible sin logos | MEDIUM | Bloque pequeño y honesto: puntajes reales de Lighthouse/CWV, tipos de schema implementados, robots.txt que permite bots de IA, HTML renderizado en servidor. Solo cifras medidas por nosotros, actualizadas antes de publicar. Puede ir como `<details>` en el footer o como franja antes del CTA final |
| Bloque "Para quién es / para quién no" | Pre-calificación por autoselección: filtra por facturación (USD 200k+/año) e inversión (4 a 5k/mes en marketing) antes del formulario. S lo hace con "Who we work with" por perfil | LOW | Dos columnas cortas, con icono + texto (no solo color). Es la palanca principal para llegar al formulario con leads calificados sin alargar el form |
| Cifra de facturación mínima dicha con claridad | R publica el piso de precio ($3,500/mes) en el FAQ y lo enmarca como "depende de tu caso"; M pide rango de presupuesto en el form. Decir "trabajamos con negocios que facturan desde USD 200k/año" filtra sin asustar | LOW | **Decisión para Ari**: publicar solo el piso de facturación (recomendado) o también el piso de inversión (+1.5k/mes en SEO/GEO). Recomendación: publicar facturación y omitir precios hasta validar con el evento |
| Estilo collage pop con función, no solo estética | Lupas, ojos y "clicks" como sistema visual: la lupa resalta la cifra clave, los ojos guían hacia el CTA. Diferencia frente a las tres referencias, todas de estética SaaS genérica | MEDIUM | Ilustraciones decorativas con `alt=""` y `aria-hidden`; el texto siempre es texto real. Estáticas por defecto, con movimiento opcional (ver Motion) |
| Tarjetas de resultado con "qué medimos y cuánto tardó" | Sin logo, la credibilidad viene de la especificidad. R titula "From 0 to +100k clicks in six months": cifra + plazo | LOW | Estructura fija: métrica grande, sector/tipo de negocio, canal (Google, ChatGPT), plazo, una línea de qué se hizo |
| Franja de métricas en el hero o justo debajo | M pone cuatro contadores en el hero (270+ startups, 130+ migraciones...). Da autoridad en 2 segundos | LOW | Solo con números reales y defendibles (no hay logos, pero sí cifras agregadas: años, proyectos, tráfico gestionado). Si no hay agregados verificables, omitir y usar 1 caso destacado |
| Equipo con avatares ilustrados y una línea de credencial | Rellena el hueco de las fotos sin recurrir a stock. Da voz humana | MEDIUM | Ilustración "Loopy" o retrato collage por persona; nombre, cargo y una línea concreta (p. ej. "10 años en SEO técnico", solo si es verdadero). Un solo estilo para las 4 |
| CTA con microcopy de expectativa | Baja la ansiedad previa al form: "20 min, sin compromiso, respondemos en X" | LOW | Junto al iframe: qué pasa, con quién habla (Camila y Ari), cuándo (jueves/viernes). Confirmar cifras con Ari |
| Barra CTA fija en móvil | Barra inferior con el CTA en pantallas largas; útil en el flujo de QR del evento | MEDIUM | P2. Debe cumplir "Focus Not Obscured" (WCAG 2.2, SC 2.4.11): `scroll-padding-bottom`, y ocultarse cuando el formulario está en viewport |
| Schema JSON-LD alineado con el contenido visible | Sirve al SEO y al showcase GEO. Guía de GEO recomienda Organization, Service y FAQPage (fuentes de proveedores: LOW-MEDIUM) | MEDIUM | Ver sección "Showcase SEO/GEO" |
| Reglas de acceso para bots de IA en robots.txt | Demuestra el criterio GEO en la práctica: permitir GPTBot, OAI-SearchBot, ChatGPT-User, PerplexityBot, Google-Extended, ClaudeBot | LOW | Es texto estático. Verificar la lista vigente de user agents al implementar |
| Micro-interacción de "ojos que miran el CTA" | Da personalidad al isotipo Loopy sin depender de video | MEDIUM | P3. Solo con `prefers-reduced-motion: no-preference`, puramente decorativa, sin `requestAnimationFrame` continuo (solo al movimiento del puntero) |

### Anti-Features (se piden a menudo, suelen causar problemas)

| Feature | Por qué se pide | Por qué es problemático | Alternativa |
|---------|-----------------|-------------------------|-------------|
| Franja de "logos de clientes" con marcas sin permiso, o logos falsos | Las tres referencias la tienen (M la agrupa por región, R agrega monto de financiamiento) | No hay material ni permisos. Un logo no autorizado es riesgo legal y de reputación. Un placeholder rompe la credibilidad de una agencia | Tarjetas de resultado con sector anonimizado ("E-commerce de moda, México") y nota "Nombre reservado por acuerdo con el cliente" solo si es verdad |
| Testimonios inventados, fotos de stock o el "slot vacío" de R ("Your testimonial here") | R lo usa como recurso lúdico | Sin testimonios reales, un hueco delata falta de prueba. Stock es engaño | Citas reales de clientes solo si Ari las consigue con permiso; si no, omitir la sección |
| Carruseles con auto-avance (testimonios, logos) | M y S los usan | WCAG 2.2.2 exige pausa si supera 5 s; añaden JS, bajan el CLS/INP y suelen ocultar contenido | Grid estático de tarjetas; en móvil, scroll horizontal nativo con `scroll-snap`, sin auto-avance |
| Marquee infinito de palabras o logos | Efecto "energético" | Requiere control de pausa (SC 2.2.2) y rompe con `prefers-reduced-motion`. Los enlaces en movimiento son difíciles de pulsar | Franja estática de términos (SEO, GEO, ChatGPT, Gemini, Google) o marquee con botón visible de pausa y desactivado con reduced motion |
| Formulario propio o campos extra encima del iframe | "Capturar más datos" | Fuera de alcance por decisión. Duplica el trabajo y crea un segundo punto de fallo | Un solo iframe de ClickUp; la pre-calificación se hace con el bloque "para quién es" y las preguntas del form |
| Newsletter, lead magnet o segundo CTA | M lo ofrece | Compite con el CTA único y baja la conversión al formulario | Un solo destino: `#agenda` |
| Menú multipágina, mega-menú, blog, podcast, careers | S y M tienen sitios de agencia completos | La página es una sola, con un objetivo. Cada enlace saliente es una fuga | Nav de anclas dentro de la página |
| Pop-ups, exit-intent, chat widget | Se ven como "más conversión" | Molestan, introducen JS de terceros y problemas de foco/teclado | Barra fija discreta en móvil (P2) |
| Video de fondo o autoplay en el hero | Da impacto | Penaliza LCP y viola reduced-motion por defecto; distrae del CTA | Collage estático con capas y una animación CSS breve al cargar |
| Tabla de precios o planes | Las agencias buscan transparencia | Retainer a medida; R solo da un piso en el FAQ. Mostrar planes atrae leads fuera del ICP | Piso de facturación (USD 200k) en "para quién es"; precio solo en la llamada |
| Cifras sin verificar ("30% a 50% menos de presupuesto de ads", split Google vs IA) | Son los números más vendedores del copy | Los dos flags `[VERIFICAR]` del doc. Una agencia SEO con datos dudosos pierde toda credibilidad | Suavizar ("puede reducir") o retirar hasta que Ari confirme la fuente |
| Schema `Review`/`AggregateRating` sin reseñas reales | Estrellas en resultados | Es contenido de marcado sin respaldo visible; riesgo de acción manual de Google | Solo `Organization`, `Service`/`ProfessionalService`, `Person`, `WebSite`, `FAQPage` |
| Texto dentro de imágenes (titulares del collage como PNG) | El collage lo tienta | Ilegible para lectores de pantalla y para bots (mal para un showcase SEO/GEO); no escala ni permite traducción | Titulares en HTML real sobre fondo/imagen decorativa |
| Cursor personalizado o scroll-jacking | "Efecto wow" | Rompe la navegación por teclado y el foco; problemas en móvil | Animaciones que responden al scroll natural con CSS (`animation-timeline`) solo si hay soporte, con fallback estático |
| Banner de cookies y múltiples trackers | "Buenas prácticas" | Añade peso y fricción si no hay cookies propias. El iframe de ClickUp puede tener las suyas | Sin analítica en v1 o una sola herramienta sin cookies; revisar el aviso legal con Ari |
| Versión en inglés | Ampliar mercado | Decisión de alcance: solo español | Fuera de alcance |

## Notas de patrón por referencia

Advertencia de método: se extrajo texto con WebFetch; no se vio el render ni el movimiento. Todo lo de animación es inferido de la estructura (LOW).

### m8l.com (Meaningful)

- **Hero:** H1 "Scale faster with a full-stack growth team", CTA "Speak today with a Growth Advisor", y cuatro contadores debajo (270+ startups, 130+ migraciones, 8+ años, 700+ iniciativas). Es la mejor pieza para copiar: **franja de métricas agregadas como prueba inmediata**.
- **Prueba social:** logos por región, testimonios con logo, cuadrícula de unas 30 personas. Todo depende de material que no tenemos. Adoptar solo el patrón de métricas y el bloque de equipo (en versión ilustrada).
- **Ritmo:** hero, logos, quiénes somos, 10 capacidades, testimonios, equipo, blog, podcast, FAQ, formulario, footer. Es un sitio, no una landing: demasiadas secciones.
- **Formulario:** su form pide ubicación, etapa, **rango de presupuesto anual de marketing** y mensaje. Confirma que preguntar presupuesto en el form es normal para pre-calificar. Verificar que el form de ClickUp ya incluya facturación anual e inversión mensual; si no, pedir a Ari que los agregue (es la palanca más barata de pre-calificación).
- **FAQ:** cubre estilo de trabajo, zona horaria, contratos (4 a 6 meses) y precio. Buen molde para nuestras preguntas.
- **Evitar:** newsletter, blog, podcast, navegación con 7+ enlaces.

### skale.so

- **Hero:** H1 orientado a resultado y a búsqueda con IA, subtítulo que fija ICP y métrica de negocio, **dos CTAs** ("Book a Strategy Call" y uno secundario "See how we drive revenue" que baja a casos). Adoptar: CTA primario al formulario + secundario de baja fricción que ancla a Resultados.
- **Problema/solución:** tres bloques con icono ("estrategia actual no funciona", "falta de canales eficientes en CAC", "pocos recursos internos"). Equivale a "El problema" del copy v2.
- **Servicios en 3 columnas con resultado numérico por servicio** (+176% ingresos, +520% demos, +860% signups). Adoptar para nuestros 4 pilares.
- **Segmentación "Who we work with":** tres perfiles con su propuesta. Adoptar en versión reducida como "para quién es" (pre-calificación).
- **CTA final autoselectivo:** "If you've come this far, you're serious about upgrading your SEO". Patrón útil para negocios con presupuesto serio; adaptarlo con voz de marca.
- **Sin formulario, sin FAQ, sin precios:** CTA lleva a una página de reserva externa. Nosotros embebemos el form para reducir un paso.
- **Evitar:** carrusel de 10 testimonios, marquee de logos (20+), menú de servicios/aprendizaje.

### rankingonai.com

- **Hero:** H1 con categoría + ICP ("The AI Search & SEO Agency for High-Growth SaaS"), un solo CTA "Let's chat", logos con montos de financiamiento como prueba. Adoptar la fórmula de H1 (categoría + cliente ideal); no los logos.
- **Resultados con titulares tipo dato:** "From 0 to +100k clicks in six months", "ChatGPT visibility increased 17x", "Direct traffic from ChatGPT increased 2830% in three months". Cada tarjeta = cifra + plazo + canal. **Es el patrón de tarjeta más útil para nosotros** porque no necesita logo.
- **Un CTA, repetido 7+ veces, con verbos distintos** ("Let's chat", "Start growing", "Start ranking"): variación de etiqueta sin variar destino. Adoptar: mismo destino, etiquetas coherentes con el bloque, pero mantener la de la marca ("Agenda tu llamada") en al menos hero, nav y final para no confundir.
- **"How it works" en 3 pasos** con la llamada gratuita como paso 1. Adoptar.
- **FAQ de 6 preguntas** con el **piso de precio en el FAQ** y encuadre "depende de tu caso". Adoptar el FAQ; la decisión de publicar precio es de Ari.
- **Bloque "AI is changing how people search":** equivale a "Por qué ahora".
- **Mini-widget "Demo Booked / +218% MoM":** UI simulada como prueba. Interesante pero solo con datos reales; no copiar.
- **Evitar:** slot de testimonio vacío, fotos de equipo de stock, iconos de plataformas (Reddit/Quora/Medium) sin relación con nuestro servicio.

### Patrones comunes a las tres

Un CTA dominante y repetido; una sección de métricas cerca del principio; proceso corto; sin precios visibles (R: solo en FAQ); tono directo y orientado a ingresos, no a rankings. La diferencia de nuestra página: sin prueba de terceros, pero con estilo de marca mucho más marcado y con demostración técnica propia.

## Prueba social sin logos ni fotos

Orden recomendado de fiabilidad, de mayor a menor:

1. **Tarjetas de caso con métrica específica** (patrón R): cifra grande, sector, plazo, canal, una línea de qué se hizo. Separar en su propia tarjeta el caso de "+500% tráfico, marca personal Meta Ads" (hoy pegado al de la app infantil). Verificar cada cifra con Ari; si un caso no se puede defender, no va.
2. **Franja de métricas agregadas** (patrón M): solo con cifras que Ari pueda respaldar (años de experiencia, proyectos, etc.). Si no hay suficientes, omitir la franja.
3. **Equipo con avatares ilustrados** en estilo collage, con cargo y una credencial concreta y verdadera. Reemplaza fotos sin sonar a stock.
4. **La página como evidencia** (bloque "Bajo el capó"): Lighthouse, schema, accesibilidad, renderizado en servidor. Solo cifras medidas.
5. **Transparencia de proceso**: mostrar quién atiende la llamada (Camila y Ari), cuánto dura y qué se entrega. En servicios, la claridad del proceso funciona como señal de fiabilidad.
6. **Pendiente si se consigue material**: citas de clientes con nombre y cargo (con permiso), capturas de respuestas de ChatGPT/Gemini que citen a un cliente, y logos con autorización. Dejar los componentes preparados para agregarlos sin rediseñar.

Regla general: cada prueba debe apuntar a un beneficio, resultado o caso de uso concreto, no a una afirmación genérica. Cuando un dato no esté verificado, se retira o se suaviza, nunca se inventa.

## Showcase SEO/GEO de la propia página

| Elemento | Prioridad | Complejidad | Nota |
|----------|-----------|-------------|------|
| HTML renderizado en servidor/estático, sin contenido que dependa de JS | P1 | LOW | Los crawlers de IA suelen no ejecutar JS de forma fiable. Condiciona la elección de stack |
| Un `<h1>`, `<h2>` por sección, párrafos autocontenidos y "respondibles" (definición de GEO en 2 frases) | P1 | LOW | Facilita la extracción por motores de IA |
| JSON-LD: `Organization` (con `founder`, `sameAs`), `WebSite`, `ProfessionalService`/`Service` con `areaServed` y `serviceType` | P1 | MEDIUM | Todo debe reflejar contenido visible. Validar con Rich Results Test y Schema Markup Validator |
| JSON-LD: `Person` para las 4 personas del equipo | P2 | LOW | Con `jobTitle` y `sameAs` (LinkedIn) solo si existen |
| JSON-LD `FAQPage` | P2 | LOW | Google retiró los resultados enriquecidos de FAQ en mayo de 2026 (MEDIUM); el tipo sigue siendo válido en schema.org y ayuda a estructurar Q&A para IA, pero **no prometer estrellas ni rich results**. Es útil sobre todo como coherencia con el FAQ visible |
| `sitemap.xml`, `robots.txt` con reglas para bots de IA, canonical | P1 | LOW | Estático |
| Imagen OG 1200x630, Twitter card, favicon, `theme-color` | P1 | LOW | Con collage de marca; texto de la imagen legible a tamaño miniatura |
| `llms.txt` | P3 | LOW | Opcional. Google indicó que ningún sistema de IA lo usa hoy (MEDIUM). Incluir solo como gesto de showcase, **sin afirmar que mejora el posicionamiento**. Si se hace, que sea corto y verdadero |
| `Review`/`AggregateRating` | No | n/a | Ver anti-features |
| Enlace a la política de privacidad y datos de contacto en `Organization` | P1 | LOW | Consistencia con el footer |

## Accesibilidad y contraste de marca (A11Y.md, Estándar AA)

Ratios calculados con la fórmula WCAG (luminancia relativa), no estimados. Umbrales de A11Y.md: texto normal 4.5:1, componentes UI y gráficos con significado 3:1, texto grande (24px o 18.66px negrita) 3:1.

| Combinación | Ratio | Uso permitido |
|-------------|-------|---------------|
| Amarillo `#ffc602` sobre gris `#212121` | 10.22 | Texto y botón. Aprueba AAA. Combinación principal para CTA sobre oscuro |
| Naranja `#fd6938` sobre gris `#212121` | 5.56 | Texto normal y UI. Aprueba AA |
| Blanco sobre morado `#73187F` | 9.69 | Texto normal. Aprueba AAA |
| Amarillo `#ffc602` sobre morado `#73187F` | 6.15 | Texto normal. Aprueba AA |
| Gris `#212121` sobre naranja `#fd6938` | 5.56 | Texto sobre botón/fondo naranja. Aprueba AA |
| Gris `#212121` sobre amarillo `#ffc602` | 10.22 | Texto sobre botón/fondo amarillo. Aprueba AAA |
| Blanco sobre gris `#212121` | 16.10 | Texto general. Aprueba AAA |
| Morado `#73187F` sobre blanco | 9.69 | Texto y UI sobre fondos claros. Aprueba AAA |
| Naranja `#fd6938` sobre morado `#73187F` | 3.35 | **Solo texto grande, iconos y bordes de UI**. No para texto normal |
| **Blanco sobre naranja `#fd6938`** | **2.89** | **FALLA** (ni 3:1). Nunca texto blanco en botones o bloques naranjas; usar `#212121` |
| **Naranja `#fd6938` sobre blanco** | **2.89** | **FALLA**. No usar naranja como texto ni enlace sobre fondos claros |
| **Amarillo `#ffc602` sobre blanco / blanco sobre amarillo** | **1.58** | **FALLA**. Amarillo solo como relleno con texto `#212121` |
| **Morado `#73187F` sobre gris `#212121`** | **1.66** | **FALLA**. El morado no se usa como texto ni icono sobre oscuro; solo como bloque de fondo con texto blanco o amarillo |
| Amarillo sobre naranja | 1.84 | FALLA. No usar como par de foco ni de texto |

Consecuencias de diseño:

- **Botón CTA:** amarillo con texto `#212121` (sobre fondos oscuros o morados) y naranja con texto `#212121` (sobre fondos claros). Nunca blanco sobre naranja.
- **Anillo de foco** (SC 2.4.7 y 2.4.11: mínimo 2px y 3:1 contra los colores adyacentes): anillo `#ffc602` de 3px con offset de 2px sobre fondos oscuros y morados; anillo `#212121` de 3px sobre fondos claros, amarillos y naranjas. Considerar anillo doble (oscuro + blanco) para superficies mixtas del collage.
- **Fondo claro:** si se usa un crema tipo `#fff8ec` en secciones claras, el naranja también falla ahí (2.74); el naranja en superficies claras solo como relleno decorativo.

Otras funciones de accesibilidad exigidas por A11Y.md, con su complejidad:

| Feature | Complejidad | Nota |
|---------|-------------|------|
| Skip link "Saltar al contenido" como primer elemento enfocable (SC 2.4.1) | LOW | Visible al recibir foco, con contraste correcto. Apunta a `<main id="main">`. Considerar un segundo salto directo a `#agenda` |
| Foco visible en todos los interactivos (SC 2.4.7, 2.4.11) | LOW | Ver anillo arriba. Con header pegajoso: `scroll-padding-top` para que el foco no quede oculto |
| `prefers-reduced-motion` como estado por defecto (SC 2.3.3) | LOW | Las animaciones se activan solo con `no-preference`. Ojos, lupas y "clicks" estáticos por defecto |
| Sin contenido en movimiento continuo mayor a 5 s, o con pausa (SC 2.2.2) | LOW | Evitar marquee y carruseles; si hay alguno, botón de pausa |
| Nada que parpadee más de 3 veces por segundo (SC 2.3.1) | LOW | Los "clicks" del collage no deben titilar |
| Objetivos táctiles de al menos 44x44 px (SC 2.5.8; mínimo 24x24) | LOW | Botones del header, del FAQ y enlaces de footer |
| `alt` en todas las imágenes (SC 1.1.1) | LOW | Decorativas: `alt=""` (con confirmación humana). Significativas (cifras en gráficos, avatares): alt descriptivo |
| Longitud de línea de 80 caracteres o menos (SC 1.4.8) | LOW | `max-width: 80ch` en párrafos |
| Tamaño mínimo de 12px, espaciado de texto ajustable (SC 1.4.12) | LOW | El collage no debe romperse con line-height 1.5 |
| No usar solo el color para transmitir información (SC 1.4.1) | LOW | Bloque "para quién es / no es": icono + texto, no solo verde/rojo |
| `<html lang="es">` (SC 3.1.1) | LOW | Términos en inglés (ChatGPT, Gemini, GEO) sin `lang` salvo frases completas |
| Botones y enlaces nativos, sin `div` clicables | LOW | Los CTAs son `<a href="#agenda">` |
| Iframe de ClickUp con `title` descriptivo y aviso de qué contiene | LOW | La accesibilidad **interna** del iframe depende de ClickUp y no la controlamos. Documentarlo como riesgo conocido y mantener el fallback de enlace directo. Probar con teclado antes de la entrega |
| Lenguaje claro y siglas expandidas con `<abbr>` al primer uso (SC 3.1.5) | LOW | GEO, SEO, AEO: definir una vez en el hero o "Por qué ahora" |
| Encabezados jerárquicos y landmarks (`<nav>`, `<main>`, `<footer>`) | LOW | Ver table stakes |

## Dependencias entre features

```
Verificación del copy con Ari (flags [VERIFICAR], 20 vs 30 min, SEO/GEO vs AEO)
    └──requiere──> Tarjetas de resultado / franja de métricas
                       └──requiere──> Prueba social sin logos (sector anonimizado)
    └──requiere──> Copy final del hero, FAQ y "para quién es"

Elección de stack (HTML servido en servidor/estático)
    └──requiere──> Schema JSON-LD, OG, sitemap, robots
    └──habilita──> "Bajo el capó" (puntajes reales de CWV)

Sistema de color con contrastes verificados
    └──requiere──> Botón CTA (texto #212121 sobre naranja/amarillo)
    └──requiere──> Anillo de foco por superficie
    └──habilita──> Diseño collage (capas decorativas con alt vacío)

Ancla #agenda + iframe ClickUp en sección final
    └──requiere──> Todos los CTAs (nav, hero, intermedios, final)
    └──requiere──> Fallback de enlace directo + microcopy de expectativa

Bloque "para quién es" ──mejora──> Calidad de leads (pre-calificación)
FAQ ──mejora──> Bloque "para quién es" y GEO (contenido Q&A extraíble)

Barra CTA fija en móvil ──conflicta──> Foco no oculto (2.4.11) si falta scroll-padding
Marquee / carrusel auto ──conflicta──> Reduced motion y SC 2.2.2
Texto en imágenes del collage ──conflicta──> SEO/GEO y lectores de pantalla
```

### Notas de dependencia

- **Verificación de copy antes del diseño final:** la página depende de que Ari confirme cifras y duración de la llamada. Diseñar con contenido provisional, marcando los campos pendientes.
- **Stack antes de schema/OG:** los metadatos y el JSON-LD deben estar en el HTML inicial. Un stack que renderice solo en cliente los invalida como showcase.
- **Contraste antes de componentes:** definir tokens de color y anillos de foco al inicio evita rehacer botones y tarjetas.
- **El iframe fija la altura y el estilo:** el diseño de la sección final debe asumir un bloque de ancho completo con altura autoajustada y no intentar estilarlo. Se puede enmarcar con el collage alrededor.

## Definición de MVP

### Lanzar con (v1, sitio local para validar con Ari y Camila)

- [ ] Hero con H1 (categoría + ICP + resultado), subtítulo, CTA primario y CTA secundario a Resultados, estilo collage
- [ ] Header con nav de anclas y CTA persistente, skip link, foco visible
- [ ] Problema, Por qué ahora, Solución en 4 pilares, con CTA tras Solución
- [ ] Resultados y Casos de éxito como tarjetas de métrica sin logos (caso Meta Ads separado)
- [ ] Bloque "Para quién es / para quién no" (pre-calificación USD 200k+)
- [ ] Quiénes somos con 4 avatares ilustrados
- [ ] Qué incluye y Cómo funciona (3 a 4 pasos, alineados con el embudo)
- [ ] FAQ de 5 a 6 preguntas
- [ ] CTA final con iframe ClickUp inline (`#agenda`), microcopy de expectativa y fallback de enlace directo
- [ ] Footer mínimo (contacto, redes, privacidad)
- [ ] HTML semántico, `<title>` y meta, OG 1200x630, JSON-LD (`Organization`, `WebSite`, `ProfessionalService`), sitemap, robots
- [ ] Contrastes de marca verificados, `prefers-reduced-motion`, objetivos de 44px, responsive desde 400px
- [ ] Rendimiento: sin video de fondo, fuentes con subset, imágenes optimizadas

### Añadir tras validación (v1.x)

- [ ] Bloque "Bajo el capó" con puntajes reales medidos: al terminar la implementación y tener números
- [ ] Barra CTA fija en móvil: si el tráfico del evento es mayoritariamente móvil y el scroll es largo
- [ ] JSON-LD `Person` y `FAQPage`
- [ ] Franja de métricas agregadas: cuando Ari confirme cifras
- [ ] Analítica ligera y parámetros UTM: al publicar el dominio. Nota: no se puede detectar el envío del formulario dentro del iframe de ClickUp desde la página (origen distinto); medir clics en los CTAs y contrastar con el número de tareas creadas en ClickUp

### Consideración futura (v2+)

- [ ] Testimonios con nombre y cargo, logos autorizados, capturas de respuestas de IA que citen a clientes: cuando exista material y permiso
- [ ] `llms.txt`: solo como detalle de showcase
- [ ] Microinteracción de ojos que siguen el puntero
- [ ] Formulario propio conectado a la API de ClickUp: fuera de alcance por decisión
- [ ] Blog y página "About us" completa: fuera de alcance por decisión

## Matriz de priorización

| Feature | Valor para el usuario | Costo de implementación | Prioridad |
|---------|----------------------|-------------------------|-----------|
| Hero (H1 + CTAs) | HIGH | LOW | P1 |
| iframe ClickUp inline + fallback + ancla `#agenda` | HIGH | MEDIUM | P1 |
| CTAs repetidos (`<a href="#agenda">`) | HIGH | LOW | P1 |
| Tarjetas de resultado con métricas | HIGH | MEDIUM | P1 |
| "Para quién es / para quién no" | HIGH | LOW | P1 |
| FAQ | MEDIUM | LOW | P1 |
| Proceso "Cómo funciona" | MEDIUM | LOW | P1 |
| Equipo con avatares ilustrados | MEDIUM | MEDIUM | P1 |
| Tokens de color con contraste verificado | HIGH | LOW | P1 |
| Skip link, foco, reduced motion, 44px | HIGH | LOW | P1 |
| JSON-LD base, OG, sitemap, robots | MEDIUM | LOW | P1 |
| Rendimiento (CWV) | HIGH | MEDIUM | P1 |
| Footer mínimo | MEDIUM | LOW | P1 |
| "Bajo el capó" (La página como prueba) | MEDIUM | MEDIUM | P2 |
| Barra CTA fija en móvil | MEDIUM | MEDIUM | P2 |
| Franja de métricas agregadas | MEDIUM | LOW | P2 (depende de datos) |
| JSON-LD `Person` y `FAQPage` | LOW | LOW | P2 |
| Reglas de bots de IA en robots.txt | LOW | LOW | P2 |
| `llms.txt` | LOW | LOW | P3 |
| Ojos que siguen el puntero | LOW | MEDIUM | P3 |

## Análisis de las referencias frente a nuestro enfoque

| Feature | m8l | skale | rankingonai | Nuestro enfoque |
|---------|-----|-------|-------------|-----------------|
| H1 | Resultado + tipo de equipo | Resultado + búsqueda con IA | Categoría + ICP | Categoría + ICP + resultado, en texto real |
| CTA | "Speak today with a Growth Advisor", 4 puntos | "Book a Strategy Call", hero, medio, final | "Let's chat", 7+ veces | "Agenda tu llamada de 30 minutos", ancla a `#agenda`, mismo destino |
| Formulario | Al final, con presupuesto | Redirige a reserva externa | Tally externo | ClickUp embebido inline en la sección final, con fallback |
| Prueba social | Logos, testimonios, 4 métricas | Logos, 10 testimonios, resultados por servicio | Logos con financiamiento, casos con gráfico, testimonios con foto | Tarjetas de métrica sin logo, equipo ilustrado, página como prueba |
| Servicios | 10 capacidades | 3 columnas con resultado | 4 pilares | 4 pilares con resultado verificado |
| Proceso | No destacado | No | 3 pasos | 3 a 4 pasos alineados al embudo |
| FAQ | Sí | No | Sí (6, con piso de precio) | Sí (5 a 6), precio a decisión de Ari |
| Precio | Solo pide rango en form | No | Piso $3,500 en FAQ | Piso de facturación en "para quién es"; precio a decisión de Ari |
| Movimiento | Carruseles (inferido) | Marquee y carrusel (inferido) | Marquee (inferido) | Estático por defecto, movimiento decorativo bajo reduced motion |
| Estética | Corporativa/startup | SaaS oscura | SaaS limpia | Collage pop, con contrastes verificados |

## Preguntas abiertas para Ari

1. Duración de la llamada: 20 min (embudo) o 30 min (copy). Define el texto del CTA.
2. Términos: SEO/GEO o SEO y AEO. Definir uno y usarlo en todo el sitio.
3. Cifras marcadas `[VERIFICAR]`: rango "30% a 50% menos de presupuesto de ads" y split Google vs IA.
4. ¿Se publica el piso de facturación (USD 200k/año) en la página? Recomendado: sí. ¿Y el piso de inversión (+1.5k/mes)? Recomendado: no en v1.
5. ¿El form de ClickUp ya pregunta facturación anual e inversión mensual? Si no, agregarlas: es la mejor palanca de pre-calificación.
6. ¿Existen métricas agregadas defendibles (años, proyectos, tráfico gestionado) para una franja de números?
7. ¿Hay política de privacidad y correo de contacto para el footer?
8. ¿Cada caso de éxito se puede mostrar con sector anonimizado, o requiere que no se describa el sector?

## Fuentes

- m8l.com (Meaningful), skale.so y rankingonai.com: estructura y copy extraídos con WebFetch el 2026-09-18. Confianza MEDIUM (texto sin render, resumen automático); patrones de movimiento LOW (inferidos).
- A11Y.md (fecarrico), reglas SC 2.4.1, 2.4.7, 2.4.11, 1.4.3, 1.4.11, 2.2.2, 2.3.3, 2.5.8, 3.1.1: https://raw.githubusercontent.com/fecarrico/A11Y.md/main/docs/en/A11Y.md (HIGH)
- Ratios de contraste: calculados con la fórmula de luminancia relativa de WCAG 2.x sobre los hex del brandbook (HIGH)
- Buenas prácticas de landing B2B (un CTA, 1 a 3 campos de alta señal, prueba cerca del CTA): Instapage, Heyflow, Directive, ZoomInfo (MEDIUM-LOW; blogs de proveedores). Ejemplo: https://heyflow.com/blog/b2b-landing-page-best-practices/
- Prueba social alternativa a logos (casos con métricas, voces reales): CXL, LOW/CODE, WiserNotify (MEDIUM-LOW): https://cxl.com/blog/is-social-proof-really-that-important/
- FAQ rich results retirados de Google en mayo de 2026: https://www.searchenginejournal.com/google-drops-faq-rich-results-from-search/574429/ (MEDIUM)
- llms.txt sin uso confirmado por sistemas de IA: https://www.seroundtable.com/google-ai-llms-txt-39607.html y https://www.searchenginejournal.com/google-says-llms-txt-is-purely-speculative-for-now/577576/ (MEDIUM)
- Schema para GEO (Organization, Service, FAQPage): https://www.getpassionfruit.com/blog/schema-markup-playbook-for-geo (LOW-MEDIUM, proveedor de marketing)
- ClickUp forms embed (autosize por defecto, estilo no personalizable desde la página): https://help.clickup.com/hc/en-us/articles/7255560049815-Share-embed-and-export-Forms (MEDIUM)
- Animación y carruseles accesibles: https://webaim.org/techniques/carousels/ y https://www.w3.org/WAI/WCAG22/Techniques/css/C39 (HIGH)

---
*Feature research for: landing B2B de agencia SEO/GEO (Loops Growth)*
*Researched: 2026-09-18*

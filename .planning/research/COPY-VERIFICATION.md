# Verificación de afirmaciones del Copy v2 (Loops Growth)

Fecha de la investigación: 2026-09-18
Doc fuente: https://docs.google.com/document/d/1QK61DPEQ3UbBQcCBnepwoaBesyZE1ZvZ6VfLgPrgtI0 (Drive id 1QK61DPEQ3UbBQcCBnepwoaBesyZE1ZvZ6VfLgPrgtI0, última modificación 2026-09-11)

Reglas de este documento:
- No se reescribe el copy de Ari. Solo hay veredicto por afirmación.
- Donde aparece una "Propuesta de matiz", está marcada como **propuesta, requiere aprobación de Ari**. Nada de esto va a la página sin ese visto bueno.
- Se separa HECHO (dato con fuente y fecha) de INFERENCIA (lectura mía).
- Confianza: HIGH = fuente primaria leída. MEDIUM = fuente secundaria seria o dato leído en un agregador. LOW = fuente de proveedor, sin metodología o solo vista en un resumen de buscador.

## Tabla resumen

| # | Afirmación del copy | Veredicto | Evidencia clave | Fuente principal |
|---|---------------------|-----------|-----------------|------------------|
| 1 | Pilar 4: reporte mensual con desglose Google vs IA "solo si se puede atribuir" | **Prometible solo con matiz.** Se puede medir la parte de IA que llega con referrer y las ventas de esa parte. No se puede separar limpiamente el clic de AI Overviews/AI Mode del orgánico de Google, y una parte del tráfico de IA cae en "Direct". | GA4 tiene canal "AI Assistant" desde 2026-05-13, pero el tráfico sin referrer sigue en Direct. Search Console mezcla AI Overviews/AI Mode en "Web"; su reporte nuevo de IA generativa solo da impresiones, sin clics. | Google Search Central, Google Analytics (vía Search Engine Journal), Google Search Console Help |
| 2 | "Varios clientes bajan entre 30% y 50% su presupuesto de ads manteniendo el mismo tráfico" [VERIFICAR rango] | **Plausible pero sin respaldo propio.** No se encontró ningún dato de clientes de Loops Growth que lo sustente. Los estudios públicos hacen creíble una sustitución parcial, pero ninguno prueba "mismo tráfico con 30% a 50% menos ads". | En el Drive, Notion y ClickUp accesibles no hay reportes de presupuesto de ads antes y después. Google (2012): con orgánico en posición 1, ~50% de los clics de anuncios son incrementales. eBay (Econometrica 2015): los anuncios de marca no mostraron beneficio medible. | Google Research; Blake, Nosko y Tadelis |
| 3a | "Google sigue siendo la mayor parte del tráfico de búsqueda" | **Verificado** | Google 91,32% de las referencias de buscadores en julio 2026 (StatCounter). 97% de los visitantes de Google buscan, 56% de los de ChatGPT hacen prompts (SparkToro/Datos, 2026-03-09). | StatCounter vía Statista; SparkToro |
| 3b | "Una parte creciente de tus clientes le pregunta a ChatGPT o a Gemini" | **Verificado con matiz** (datos de EE.UU., sin dato de LATAM) | Semrush, dic 2025, n=1.030: 55% usa IA cada semana para investigar productos; 26% empieza en IA vs 33% en Google. L.E.K. (2026): 3 de cada 10 consumidores de EE.UU. usó IA para decidir una compra. | Semrush; L.E.K. vía MarTech |
| 3c | "Los ads se encarecen con el tiempo" (CPC al alza) | **Verificado** | CPC promedio de búsqueda: USD 5,26 (2025) a USD 5,42 (2026), +3%; hace 10 años USD 2,32 según el mismo reporte agregado. El salto 2024 a 2025 fue mayor. | WordStream/LocaliQ 2026 |
| 3d | "El orgánico se abarata" | **No verificado como frase literal.** Es una inferencia. Lo que sí hay: el costo por adquisición del SEO baja con el tiempo si el contenido se acumula (fuentes de proveedores, LOW). Hay una fuerza en contra: 68% de las búsquedas en Google terminan sin clic. | SparkToro 2026-06-09; Previsible, HubSpot vía agregadores | ver detalle |
| 3e | "El contenido que rankea hoy sigue trayendo clientes el año que viene" | **Verificado** | Ahrefs, 1,3 millones de keywords: la página #1 tiene 5 años de edad en promedio; 72,9% de las páginas del top 10 tienen más de 3 años. | Ahrefs, 2025-05-15 |

---

## Detalle 1. Pilar 4 (Reportes): atribución Google vs IA

### Lo que dice el copy
"Cada mes ves qué se hizo, qué se movió y cuánto te costó contra cuánto generó... el orgánico trajo X visitas, convirtieron Y, compraron Z. [VERIFICAR: solo desglosa por canal (Google vs IA) si de verdad puedes atribuirlo con datos. Si no, repórtalo junto y no inventes el split.]"

### Hechos

**A. GA4 ya identifica una parte del tráfico de asistentes de IA.**
- Google agregó un canal "AI Assistant" al grupo de canales por defecto de GA4 el 2026-05-13 (Analytics Help Center, "What's New"). Las sesiones reciben el medio `ai-assistant` y la campaña `(ai-assistant)`. Google nombra ChatGPT, Gemini y Claude como ejemplos y no publica la lista completa de referrers reconocidos. Confianza: MEDIUM (leído en Search Engine Journal, 2026-05-14, y otros resúmenes; no se abrió la página de ayuda de Google).
  - https://www.searchenginejournal.com/google-analytics-adds-ai-assistant-as-default-channel-group/574974/
- Antes de esa fecha, ese tráfico caía en "Referral" y había que armar un grupo de canales personalizado con regex (chatgpt.com, gemini.google.com, perplexity.ai, copilot.microsoft.com, claude.ai). Ese método sigue siendo útil para Perplexity y Copilot, porque no está confirmado que Google los reconozca.

**B. Una parte del tráfico de IA llega sin referrer y aparece como "Direct".**
- El propio reporte sobre el canal nuevo lo dice: el tráfico de asistentes que llega sin referrer sigue cayendo en Direct (apps móviles, navegadores dentro de apps, enlaces copiados y pegados). Confianza: MEDIUM.
  - https://www.searchenginejournal.com/google-analytics-adds-ai-assistant-as-default-channel-group/574974/
- Tamaño de esa parte: no hay una cifra confiable. Dos datos de terceros, para leer con cautela:
  - Attrifast (citado por authoritytech.io, mayo 2026, 41,2 millones de sesiones): la interfaz web de ChatGPT enviaría referrer alrededor del 28% de las veces y la app de escritorio 6%; "71% de las visitas de ChatGPT caen en Direct". Confianza: LOW (proveedor, no se pudo ver la metodología).
    - https://authoritytech.io/curated/chatgpt-not-provided-ai-traffic-measurement-2026
  - Clickport (snapshot de 30 días al 2026-04-23): 935 de 2.619 sesiones de búsqueda con IA (35,7%) llegaron sin referrer. El propio autor aclara que no mide la tasa de pérdida de GA4 ni cuánto del Direct es IA. Confianza: LOW a MEDIUM.
    - https://clickport.io/blog/chatgpt-direct-traffic-ga4
- Lectura honesta de esos números: el rango publicado va de 35% a 70% del tráfico de IA sin atribuir. No es un dato firmado. Sí es suficiente para decir que la medición por referrer subestima.

**C. Los parámetros UTM ayudan, pero no cubren todo.**
- Un enlace puede llegar con `utm_source=chatgpt.com` en algunos casos y sin nada en otros. Sirve para atribuir parte del Direct, pero depende de que la plataforma lo agregue. Confianza: LOW (varias guías de proveedores lo describen; no se encontró documentación oficial de OpenAI en esta búsqueda).

**D. Google AI Overviews y AI Mode no se pueden separar del orgánico de Google en clics.**
- Documentación oficial de Google: "sites appearing in AI features (such as AI Overviews and AI Mode) are included in the overall search traffic in Search Console. In particular, they're reported on in the Performance report, within the 'Web' search type." Confianza: HIGH.
  - https://developers.google.com/search/docs/appearance/ai-features
- Search Console lanzó el 2026-06-03 un reporte de IA generativa (AI Overviews y AI Mode), desplegado a todos los sitios el 2026-08-31. Da **solo impresiones** (con páginas, países, dispositivos y fechas). No da clics, CTR ni consultas. Confianza: HIGH para el contenido del reporte (ayuda oficial de Search Console), MEDIUM para las fechas de lanzamiento (Search Engine Journal y otros).
  - https://support.google.com/webmasters/answer/16984139?hl=en
  - https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports
- En GA4, las visitas que vienen de AI Overviews o AI Mode siguen entrando como Organic Search, no en el canal "AI Assistant". Confianza: MEDIUM (dicho por Clickport; el artículo de SEJ no lo aborda).

**E. Herramientas de medición de visibilidad (no de tráfico).**
- Ahrefs Brand Radar cubre ChatGPT, Gemini, Perplexity, Microsoft Copilot, Google AI Overviews y AI Mode (página del producto). Mide menciones, citas y participación de voz sobre prompts que la herramienta consulta. **No mide sesiones ni ventas.** Es un indicador de visibilidad, no de atribución. Confianza: MEDIUM (reseñas de terceros; las cifras de subreporte que circulan vienen de competidores y no se usaron aquí).
  - https://ahrefs.com/ai-visibility-checker
- Ejemplo propio: el reporte SEO de agosto 2026 de un cliente del equipo (Drive, "SEO", id 12BZc4YVaqDfhS3I8WBW__cDUNsrBEwItpI6y2UKDAgA) registró 160 visitas desde herramientas de IA en GA4 frente a 141 el mes anterior, y las citas de marca en IA subieron 8%. La propia nota dice que la relación entre citas y visitas "aún no está clara". Es evidencia interna de que el reporte de IA hoy combina dos cosas distintas: visitas medidas y citas modeladas.

### Inferencia (mía)
- Se puede reportar con datos reales: (1) sesiones, conversiones y ventas del canal "AI Assistant" de GA4 (la parte identificable); (2) orgánico de Google con AI Overviews y AI Mode incluidos, sin separarlos; (3) visibilidad en IA (menciones y citas) como indicador aparte, claramente rotulado como "no es tráfico".
- No se puede reportar con honestidad: "X% de tus ventas vinieron de Google y Y% de ChatGPT" como si fuera una partición completa. La parte de IA está subestimada de forma no cuantificable y Google no permite aislar sus propios clics de IA.
- Las ventas de IA que sí se ven son de último clic. Un cliente que descubre la marca en ChatGPT y luego escribe la URL o busca la marca en Google queda como Direct u orgánico de marca. Eso es un sesgo estructural, no un error de configuración.

### Veredicto
El desglose "Google vs IA" **es honesto solo si se presenta como medición parcial**. Prometerlo como un split exacto no lo es. La instrucción de Ari en el propio [VERIFICAR] ("si no, repórtalo junto y no inventes el split") es la correcta como regla por defecto.

### Propuesta de matiz (propuesta, requiere aprobación de Ari)
Dos caminos posibles, sin reescribir el pilar:
1. Dejar el copy actual, que ya dice "el orgánico trajo X visitas, convirtieron Y, compraron Z", sin mencionar desglose por canal. Es lo más seguro y no promete de más.
2. Si Ari quiere conservar la mención a IA en el reporte, usar una redacción del tipo: "y, cuando el dato existe, cuánto vino de asistentes de IA". El "cuando el dato existe" es el matiz que evita la promesa de un split completo.

Además, para operar el reporte (no es copy de la landing): configurar en cada cliente el canal "AI Assistant" de GA4 más un grupo personalizado con regex para Perplexity y Copilot, y rotular la sección "Tráfico de IA identificable (mínimo medido)".

---

## Detalle 2. "Varios clientes bajan entre 30% y 50% su presupuesto de ads manteniendo el mismo tráfico"

### (a) Evidencia propia de Loops Growth, Arianna Lupi o aprendoclub

Se buscó en Google Drive (búsquedas de texto completo con "presupuesto de ads", "inversión en ads", "gasto en ads", "reducir ads", "dependencia de ads", "menos ads", "caso de éxito", "case study", "redujo", "reducir la inversión" combinadas con "orgánico" y "SEO"), en Notion y en ClickUp.

Resultado: **no se encontró ningún documento con presupuesto de ads antes y después de un trabajo de SEO.**
- Notion: solo apareció una página genérica de plantilla ("Arianna's Brain").
- ClickUp: 0 resultados.
- Drive: aparecen briefs, reportes SEO y notas de reuniones de otros clientes y del negocio de aprendoclub, ninguno con esa comparación. Los reportes de resultados que existen (por ejemplo el SEO + Reporte de agosto 2026 de un cliente) hablan de clics, impresiones y citas de IA, no de gasto en ads.
- Los "casos de éxito" de la Sección 5 del copy (+85% ventas vape, +237% tráfico academia, x3 conversiones SaaS, +3.808% clics app infantil) tampoco tienen respaldo localizable en esas búsquedas. Está fuera del alcance de esta tarea y no se buscó a fondo, pero conviene que Ari confirme dónde vive el dato de cada uno.

Conclusión de (a): el rango 30% a 50% **no se puede verificar con evidencia propia accesible**. Puede existir en reportes que no están en estos sistemas. Solo Ari o Verónica pueden confirmarlo. No se inventó ningún dato de cliente.

### (b) Benchmarks públicos

**HECHO 1. Google Research, meta análisis de 390 estudios de pausa de anuncios de búsqueda (2012).**
- En promedio 81% de las impresiones de anuncios y 66% de los clics ocurren sin un resultado orgánico asociado en la primera página.
- Cuando el resultado orgánico está en la posición 1, en promedio **50% de los clics de anuncios son incrementales** (el otro 50% se habría obtenido de todos modos por orgánico). En posiciones 2 a 4, 82% son incrementales; por debajo de la 4, 96%.
- Estudio anterior de Google (2011, actualización 2012, 5.300 casos): en promedio 89% de los clics de pago no se recuperan con clics orgánicos al pausar una campaña.
- Fuentes: https://research.google/blog/search-ads-pause-studies-update/ y https://research.google/blog/impact-of-organic-ranking-on-ad-click-incrementality/ . Confianza: HIGH de que el estudio dice eso.
- Limitaciones: es de Google, que vende los anuncios (posible sesgo); tiene más de 13 años; solo cubre anuncios de búsqueda; los propios autores anotan sesgo de selección en los anunciantes que pausan.

**HECHO 2. Experimento de campo en eBay (Blake, Nosko y Tadelis, Econometrica, 2015).**
- Apagaron la búsqueda de pago en 68 áreas de EE.UU. durante 60 días. Los anuncios de palabras clave de marca no mostraron beneficio medible en el corto plazo. En palabras clave sin marca, el retorno promedio fue negativo porque el gasto se concentraba en usuarios frecuentes que compraban igual.
- Fuente: https://onlinelibrary.wiley.com/doi/abs/10.3982/ECTA12423 (resumen leído vía búsqueda; artículo no leído completo). Confianza: MEDIUM. Limitación: un solo anunciante gigante con marca muy conocida, no es extrapolable a una tienda pequeña.

**HECHO 3. BrightEdge (guías de la propia empresa).** Reportan que los tres primeros resultados orgánicos aumentan 64% el CTR de los anuncios en la misma página, y recomiendan bajar pujas en keywords donde ya se rankea. Confianza: LOW (contenido de marketing de un proveedor, sin metodología leída). No respalda ningún porcentaje de ahorro.

Nota: no se encontró ningún estudio serio de Semrush, Ahrefs, BrightEdge o Nielsen que mida "reducción de presupuesto de ads" tras ganar orgánico.

### Inferencia (mía)
- Que 30% a 50% del gasto en ads sea sustituible es **plausible** si el gasto está en búsquedas de marca o en keywords donde la tienda ya rankea arriba: los estudios de Google y eBay apuntan a que una fracción grande de esos clics es reemplazable (hasta ~50% con orgánico en posición 1).
- "Manteniendo el mismo tráfico" es la parte frágil. Exige que el orgánico haya crecido lo suficiente para cubrir lo que se recorta. Lo que dicen los estudios es que se puede recortar sin perder sesiones, no que se logre en cualquier cuenta ni en un horizonte fijo.
- Para e-commerce con Meta Ads o display (donde no hay resultado orgánico "gemelo" en la misma página), los estudios de búsqueda no aplican directamente. El copy no aclara de qué canal de ads habla.
- El ahorro depende del mix de cada cliente. Un solo rango para "varios clientes" invita a que un prospecto lo lea como promesa.

### Veredicto
**Plausible pero sin respaldo propio verificable.** No es "verificado". Tampoco hay evidencia de que sea falso.

### Propuesta de matiz (propuesta, requiere aprobación de Ari)
Elegir según lo que Ari pueda documentar:
- Si Ari o Verónica tienen 2 o 3 clientes con el dato real (presupuesto de ads antes y después, tráfico antes y después, periodo), citar esos casos con sus cifras reales, y el rango sale de ahí (por ejemplo "entre X% y Y%" con los valores medidos, aunque sean distintos de 30% y 50%).
- Si no se puede documentar, sustituir el rango por una afirmación cualitativa que no promete cifra: por ejemplo "Con el tiempo, el orgánico cubre parte del tráfico que hoy compras con ads, y puedes ajustar ese presupuesto".
- Dejar el rango "30% a 50%" solo si hay al menos un caso real que lo respalde y aclarar de qué tipo de ads se trata.

---

## Detalle 3. Afirmaciones de mercado

### 3a. "Google sigue siendo la mayor parte del tráfico de búsqueda". Verificado

- StatCounter, julio 2026: Google tiene **91,32%** de las referencias de motores de búsqueda a nivel mundial; Bing 4,46%; Yahoo 1,24%. Muestra de más de 3.000 millones de páginas vistas al mes en más de un millón de sitios. Visto en el resumen de Statista y en la búsqueda; la página de StatCounter no se abrió directamente. Confianza: MEDIUM.
  - https://gs.statcounter.com/search-engine-market-share
  - https://www.statista.com/statistics/1381664/worldwide-all-devices-market-share-of-search-engines/
- SparkToro con Datos (clickstream, 41 sitios web), publicado 2026-03-09: **97%** de los visitantes de Google buscan; **56%** de los visitantes de ChatGPT hacen prompts; 35% en Yahoo. Confianza: HIGH de la cifra; MEDIUM de la comparación, porque la propia nota advierte que parte de la experiencia con IA ocurre por enlaces compartidos.
  - https://sparktoro.com/blog/how-much-is-your-audience-searching-google-vs-prompting-ai-tools-sparktoros-answers-just-got-an-upgrade/
- Nota de cautela: un agregador (quickseo.ai) cita que Google maneja 373 veces más consultas equivalentes a búsqueda que ChatGPT según SparkToro/Datos. No se verificó contra la fuente primaria. No usar esa cifra sin abrir el estudio.
- Matiz de redacción: StatCounter mide referencias de motores de búsqueda, no consultas totales. "La mayor parte del tráfico de búsqueda" es exacto con ese criterio.

### 3b. "Una parte creciente de tus clientes le pregunta a ChatGPT o a Gemini". Verificado con matiz

- Semrush, encuesta de diciembre 2025, **1.030 consumidores de EE.UU. con experiencia en IA**: 55% usa IA cada semana para investigar productos; 26% empieza su búsqueda en IA contra 33% que empieza en Google; 77% combina ambas; 43% descubrió una marca nueva mediante IA; 69% espera que la IA tenga un papel mayor. Confianza: HIGH de las cifras (página leída), pero es una muestra de personas que ya usan IA, no de la población general.
  - https://www.semrush.com/blog/ai-tools-the-modern-buyer-journey-study/
- L.E.K. Consulting (2026, vía MarTech): 3 de cada 10 consumidores de EE.UU. usaron IA para decidir una compra; Gen Z 40%, millennials 42%, Gen X 28%, baby boomers 13%. Confianza: MEDIUM (segunda mano, tamaño de muestra no indicado).
  - https://martech.org/the-ai-shopping-stats-2026-what-you-need-to-know/
- Product.ai (2026, vía MarTech): 43% de los compradores en línea de EE.UU. usó un asistente de IA para investigar productos en los últimos 90 días. Confianza: LOW (metodología no divulgada).
- Sobre "creciente": las encuestas disponibles son fotos puntuales. La frase "creciente" se apoya en expectativas (69% espera más uso) y en cifras de proveedores de tráfico, no en una serie propia verificada. No se encontró una serie comparable de LATAM.
- Tensión con otra afirmación del copy: SparkToro (2026-06-09, panel de Similarweb, EE.UU., enero a abril 2026) indica que las herramientas de IA "send less than 1% of all traffic out". Es decir, la gente pregunta a la IA, pero esas respuestas devuelven pocos clics a los sitios. Esto refuerza "si la IA no te menciona no existes en esa decisión" como argumento de visibilidad, y explica por qué el tráfico de IA medido es pequeño (ver Detalle 1).
  - https://sparktoro.com/blog/in-2026-less-than-one-third-of-google-searches-still-send-a-click/
- Propuesta de matiz (propuesta, requiere aprobación de Ari): ninguna obligatoria. La frase actual es defendible. Si Ari quiere blindarla, "en mercados como EE.UU., una parte creciente" o citar un dato con fuente al pie.

### 3c. "Los ads se encarecen con el tiempo" (CPC al alza). Verificado

- WordStream y LocaliQ, informe 2026 (13.474 campañas de búsqueda de EE.UU., 23 industrias, abril 2025 a marzo 2026, datos de Google Ads y Microsoft Ads; artículo publicado 2026-08-17): CPC promedio de búsqueda **USD 5,42** en 2026 frente a **USD 5,26** en 2025 (+3%). El reporte compara con USD 2,32 de hace 10 años. El aumento 2024 a 2025 fue mayor que el de 2025 a 2026. Confianza: MEDIUM (cifras leídas en un espejo del informe, theedigital.com; la página de WordStream devolvió 403).
  - https://www.theedigital.com/blog/google-ads-benchmarks
  - https://www.wordstream.com/blog/2026-google-ads-benchmarks (no accesible desde esta investigación)
- Otro dato de un agregador: CPC intersectorial de USD 2,96 en el primer trimestre de 2026, +12% frente a USD 2,64 en el primer trimestre de 2025. Fuente de origen no identificada, y no coincide con la cifra de WordStream (metodologías distintas). Confianza: LOW.
- Matiz de redacción: la tendencia de largo plazo es clara; el último año fue estable (+3%). "Cada año pagas más por el mismo cliente" (Sección 1 del copy) sí está respaldado a 10 años, no como aumento fuerte año contra año. El dato es de EE.UU.

### 3d. "El orgánico se abarata" (Sección 4). No verificado como frase literal

- Ninguna fuente medible dice que el orgánico "se abarata". Lo que se puede sostener es distinto: el **costo por cliente del SEO baja con el tiempo** a medida que el contenido acumulado sigue trayendo visitas sin gasto por clic. Fuentes disponibles: Previsible (comparación de CAC pago vs SEO) y cifras de HubSpot citadas por agregadores (USD 31 por lead orgánico vs USD 181 por lead de pago, 2025). Confianza: LOW (proveedores y agregadores; no se leyó la metodología).
  - https://previsible.com/digital-marketing/cac-comparison-paid-vs-seo/
  - https://seoprofy.com/blog/seo-roi-statistics/
- Fuerza en contra: 68,01% de las búsquedas de Google en EE.UU. terminaron sin clic entre enero y abril de 2026, frente a 60,45% en 2024 y 49% en 2019 (SparkToro, panel de Similarweb, 2026-06-09). El clic orgánico es más difícil de conseguir. Por eso "el orgánico se abarata" es una inferencia optimista, no un hecho.
- Propuesta de matiz (propuesta, requiere aprobación de Ari): cambiar el foco de la frase de "el orgánico se abarata" a "el costo por cliente del orgánico baja a medida que el contenido se acumula", que sí tiene respaldo, aunque sea débil. Ari decide si lo toca.

### 3e. "El contenido que rankea hoy sigue trayendo clientes el año que viene". Verificado

- Ahrefs (publicado 2025-05-15; 1,3 millones de keywords de EE.UU., top 10 de cada una): la página en la posición #1 tiene en promedio **5 años**; **72,9%** de las páginas del top 10 tienen más de 3 años (59% en 2017); solo 13,7% tienen menos de 1 año; solo 1,74% de las páginas nuevas llegan al top 10 en un año.
  - https://ahrefs.com/blog/how-long-does-it-take-to-rank-in-google-and-how-old-are-top-ranking-pages/
- Confianza: HIGH de la cifra (página leída). Es evidencia de que las páginas que ya rankean duran; es indirecta respecto de que "sigan trayendo clientes" (clics y ventas). Esa segunda parte es inferencia razonable, sobre todo con la caída de clics por búsquedas sin clic que se vio en 3d.
- Propuesta de matiz: ninguna. La frase es defendible tal cual.

---

## Resumen de decisiones abiertas para Ari

1. **Pilar 4:** confirmar si el reporte mensual incluirá una sección de IA y, si sí, aceptar que será medición parcial (canal "AI Assistant" de GA4 más visibilidad rotulada aparte). El desglose exacto Google vs IA no es honesto prometerlo.
2. **Sección 4, 30% a 50%:** pedir a Ari o Verónica el dato real de 2 o 3 clientes (presupuesto de ads antes y después, tráfico antes y después, periodo, tipo de ads). Sin eso, usar una frase cualitativa o dejar el bloque marcado FALTA CONFIRMAR en la página.
3. **"El orgánico se abarata":** decidir si se mantiene como está (inferencia) o se pasa a "el costo por cliente del orgánico baja a medida que el contenido se acumula".
4. **Sección 5, casos de éxito:** confirmar dónde vive el dato de cada caso (no se encontró en Drive, Notion ni ClickUp en las búsquedas hechas; no fue el foco de esta tarea).

## Límites de esta investigación

- No se abrió la página de ayuda de Google Analytics del canal "AI Assistant" (se leyó Search Engine Journal y resúmenes); tampoco la página de StatCounter ni el artículo completo de Econometrica.
- WordStream devolvió 403; la cifra de CPC se leyó en un espejo (theedigital.com).
- Las cifras de tráfico de IA sin referrer (28%, 6%, 71%, 35,7%) vienen de proveedores y no están auditadas.
- Todos los datos de mercado son de EE.UU. o globales. No se encontró equivalente para LATAM.
- La búsqueda en Drive, Notion y ClickUp se hizo con palabras clave. Puede haber material en carpetas o formatos que las búsquedas no devolvieron.

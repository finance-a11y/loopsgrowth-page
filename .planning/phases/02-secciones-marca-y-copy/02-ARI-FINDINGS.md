# Hallazgos para Ari: lo que hay que decidir, entregar, confirmar y corregir

**Fecha:** 2026-09-19
**Fase y plan:** fase 2 (secciones, marca y copy), plan 02-08
**Filas de `PENDING-COPY.md`:** 61 textos pendientes (la revisión de producción los cuenta como 61 `PENDING` y 32 `MISSING`, porque los rellenos "FALTA CONFIRMAR" cuentan dos veces)
**Para:** Ari y Juan

## Cómo usar este documento

Ari, puedes responder por partes: las secciones no dependen unas de otras. Cada ítem dice qué ve hoy el visitante, qué necesitamos de ti y en qué ruta de `src/content/landing.es.yaml` se edita (las rutas van en comillas invertidas). Los textos de tu doc se citan literales, con sus erratas, y nadie los ha tocado. Este documento solo reporta.

Mientras falte un dato, la página muestra el relleno "FALTA CONFIRMAR" en ese lugar. El build de producción se bloquea a propósito hasta que la lista quede vacía y las fotos estén aprobadas (ver sección 6).

Contenido:

1. Decisiones de alto impacto
2. Texto que falta y la página muestra como "FALTA CONFIRMAR"
3. Texto que se muestra tal cual pero hay que confirmar
4. Erratas del doc que la página muestra tal cual
5. Afirmaciones que el diseño esperaba y el doc no trae en ese lugar
6. Cómo se aplica cada respuesta, y otros hallazgos de los planes

## 1. Decisiones de alto impacto

**1.1 Morado de marca: #4228D1 frente a #73187F.**
- Hoy: la página usa `#4228D1` por decisión de Juan del 2026-09-19. Es el color de los archivos del logo, del isotipo, de la muestra del BrandBook y del moodboard.
- Discrepancia: solo el texto de la página 8 del BrandBook dice `#73187F`, R115 G24 B127, Pantone 248 U, y al lado hay un círculo dibujado en `#4228D1`.
- Necesitamos de Ari: que confirme cuál es el color oficial.
- Si dice otro valor: se cambia el token en `src/styles/tokens.css`, las razones medidas de `scripts/lib/contrast.mjs` y los rellenos de los SVG oficiales con `scripts/brand/extract-artboards.mjs`. Sobre blanco el `#4228D1` mide 8.55 de contraste; con otro morado hay que volver a medir todos los pares.

**1.2 Variantes de logo por fondo.**
- El logo horizontal y el imagotipo (los dos ojos dentro de las oes) existen solo sobre blanco. Sobre oscuro y sobre morado se usa el logo apilado (mesas 08 y 03 del archivo de marca).
- El emblema sobre oscuro no existe: la mesa 25 trae el texto en morado sobre oscuro y mide 1.88 de contraste. Necesitamos de Ari una versión con texto crema.
- Los isotipos sobre oscuro (mesas 17 y 22) son una excepción de marca: su aro morado mide 1.88 contra `#212121`, y la figura se lee por el anillo crema. Ari confirma que la excepción le parece bien.
- El imagotipo es un candidato para el logo del header (hoy el header usa el logo apilado y el footer el horizontal). Ari decide si lo quiere.
- Se edita: los archivos de `src/assets/brand/` los genera `scripts/brand/extract-artboards.mjs`; no se editan a mano.

**1.3 Favicon.**
- Hoy: `public/favicon.svg` y `public/favicon.ico` salen de la mesa 18, un ojo con lupa, decidido con mediciones a 16 y 32 px.
- Necesitamos de Ari: que apruebe esa mesa. La alternativa es el isotipo de dos ojos (mesa 13), que a 16 px se lee peor.

**1.4 Avatares del equipo: Loopy en lugar de caras.**
- Hoy: las cuatro tarjetas del equipo llevan el Loopy oficial (un ojo o dos ojos con lupa sobre un disco plano), en morado o amarillo. No hay caras: el archivo de marca no trae personas y el equipo no tiene fotos.
- Asignación sugerida (solo de color): Arianna un ojo morado, Verónica un ojo amarillo, Juan dos ojos morados, Miguel dos ojos amarillos. Se cambia en `src/components/sections/Team.astro`.
- Necesitamos de Ari: que apruebe el set, o que entregue fotos del equipo (entrarían con su propio tratamiento y un texto alternativo confirmado por una persona).

**1.5 Crema `#F4F3E0` como superficie.**
- Hoy: el crema se usa en píldoras y paneles del collage, no como color de fondo de una sección entera.
- Necesitamos de Ari: que confirme ese uso.

**1.6 Naranja sobre morado (excepción sin uso).**
- El par naranja sobre morado mide 2.95 y quedó prohibido para texto. Solo sobrevive como relleno decorativo del collage, con contorno blanco, y hoy ningún elemento lo usa.
- Necesitamos de Ari: saber si esa excepción se queda registrada o se elimina.

**1.7 Palabras de las píldoras del collage.**
- Hoy: las píldoras muestran `seo`, `geo` y `ads`, que salen del copy de Ari, y `spy` y `team work`, que salen del moodboard del BrandBook (solo las palabras, no su arte).
- Necesitamos de Ari: que acepte esas cinco palabras o entregue su lista. `spy` y `team work` son las que necesitan su visto bueno.
- Se edita: `CHIP_WORDS` en `src/components/collage/collage-rules.mjs` y la palabra de cada escena en `src/components/collage/scenes.mjs`.

**1.8 Fotos de stock del hero y de "Por qué ahora".**
- Hoy: cada ranura tiene una foto elegida por defecto (`hero-a` y `whynow-a`) y una candidata (`hero-b` y `whynow-b`). Fuente, autor, licencia (Unsplash License) y nota del sujeto de cada una están en `src/assets/photos/LICENSES.md`. La aprobación de Ari figura como `pendiente` en las cuatro.
- Qué muestran: `hero-a`, un ojo humano en primer plano detrás de una lupa, sin rostro identificable; `hero-b`, una mano con una lupa; `whynow-a`, una mano tocando un teléfono; `whynow-b`, manos tecleando en una laptop.
- Advertencia: las cuatro muestran manos u ojo de personas reales y la fuente no registra autorización de imagen (permiso de modelo). El ojo de `hero-a` es la única excepción a la regla de no mostrar personas.
- Recomendación de la revisión visual (no es una decisión): en el hero, `hero-a`, porque `hero-b` se lee mal al tamaño de la escena; en "Por qué ahora" hay empate razonable entre `whynow-b`, que se reconoce mejor a 104 px pero tiene el fondo desenfocado, y `whynow-a`, de silueta más limpia pero con el teléfono poco legible a 73 px.
- Necesitamos de Juan y Ari: elegir una candidata por ranura en `/marca/hoja/` (solo existe fuera de producción) y decidir con qué nombre se registra la aprobación (`aprobada por <nombre> el <AAAA-MM-DD>`).
- Puerta de producción: mientras la aprobación siga pendiente o exista una candidata sin elegir, `PUBLIC_ENV=production node scripts/check-photos.mjs` sale 1 y bloquea el build. Los pasos para cerrar la elección están en `src/assets/photos/LICENSES.md`, sección "Cómo cerrar la elección".

**1.9 Duración de la llamada: 20 o 30 minutos.**
- Hoy: `call.duration` dice "30 minutos" y alimenta el botón "Agenda tu llamada de {duration}" y `agenda.intro`. `how_it_works.steps[0].timeframe` dice "30 min". El embudo del proyecto habla de una llamada de pre-calificación de 20 minutos.
- Necesitamos de Ari: la duración correcta. La respuesta del FAQ sobre la duración (`faq.items[1].answer`) debe coincidir con `call.duration`.

**1.10 Término: SEO/GEO frente a "AEO".**
- Hoy: `brand.term` dice "SEO/GEO" y está pendiente. El titular de La solución (`solution.title`) y el título del primer entregable de Qué incluye (`includes.items[0].title`) muestran "FALTA CONFIRMAR", porque la guarda de copy rechaza la sigla AEO que trae el doc.
- Texto original del titular: "Un equipo que ejecuta SEO y AEO, no que te asesora."
- Texto original del entregable: "Auditoría SEO + AEO completa".
- Necesitamos de Ari: qué término se usa (SEO, GEO o AEO) y los dos textos finales.

**1.11 Fuente de la marca: licencia web de Hurme Geometric Sans 3.**
- Hoy: la página usa Outfit como fuente de respaldo (`astro.config.mjs`). Es una desviación de marca que Ari debe aprobar por escrito.
- La licencia de escritorio de Hurme no cubre la web: hace falta licencia Webfont aparte. Con la licencia, se ponen los archivos woff2 en `src/assets/fonts/` y se cambia el proveedor a `fontProviders.local()`.
- Necesitamos de Ari: comprar o confirmar la licencia web, o aprobar Outfit por escrito.

**1.12 Consentimiento del equipo y biografías.**
- Hoy: los cuatro nombres (`team.members[0].name` a `team.members[3].name`: Arianna Lupi, Verónica Romero, Juan Angulo, Miguel Pacheco) están pendientes hasta que cada persona confirme que aparece con nombre y cargo.
- La sección 6 del doc trae una introducción y una biografía por persona; la página no las muestra (sin biografías por decisión de esta fase). Necesitamos de Ari: confirmar si se agregan.

## 2. Texto que falta y la página muestra como "FALTA CONFIRMAR"

Nada de esto está en el doc, y ninguno se inventó.

| Ruta | Qué entrega Ari |
|------|-----------------|
| `for_whom.title` | Título de la sección "Para quién es". |
| `for_whom.is_for.items[0]` a `[2]` | Tres líneas de la columna "Para quién es". La primera debe comunicar el perfil de empresa que factura USD 200k o más al año. |
| `for_whom.is_not_for.items[0]` a `[2]` | Tres líneas de la columna "Para quién no es". |
| `faq.title` | Título del FAQ. |
| `faq.items[0]` a `[5]` (`question` y `answer`) | Seis pares de pregunta y respuesta, con estos temas: qué es GEO, duración de la llamada, qué preparar, inversión, tiempos de resultados y si aplica a mi negocio. |
| `footer.email` | Correo de contacto del pie de página. |
| `footer.social` | Redes, cada una con su nombre y su URL. |
| `privacy.body[0]` | Texto legal de la política de privacidad. |
| `solution.items[3].body` | Cuerpo del Pilar 4. El doc trae un texto con la nota `[VERIFICAR: ...]` (ver sección 3, ítem 3.1). |
| `results.items[1].body` | Cuerpo del resultado 2. El doc trae "Varios clientes bajan entre 30% y 50% su presupuesto de ads manteniendo el mismo tráfico. [VERIFICAR rango]". El rango no tiene respaldo propio, así que la página no lo publica. Ari aporta el dato con su fuente o decide otro texto. |
| `cases.items[0].channel` a `cases.items[3].channel` | Canal de los casos 1 a 4 (el doc no lo nombra). Hoy el chip y el dato de Canal muestran "FALTA CONFIRMAR" en las cuatro tarjetas. En el caso 3 el detalle habla de tráfico orgánico, pero eso no dice el canal. |
| `cases.items[4].period` | Plazo del caso 5. El doc no lo da. |
| `solution.title` y `includes.items[0].title` | Ver 1.10. |
| `brand.term` y `call.duration` | Ver 1.10 y 1.9 (no muestran relleno, pero dependen de una respuesta de Ari). |

Restricción de inversión: en los textos de `for_whom` y `faq` no incluyas rangos ni cifras de inversión mensual (por ejemplo "4 a 5k al mes", "1.5k al mes" o "+1500 al mes") sin aprobarlos por escrito. La guarda `INVERSION` bloquea el build de producción mientras esos textos estén pendientes. Si Ari decide publicarlos, pasan a `verified` y la guarda deja de marcarlos.

## 3. Texto que se muestra tal cual pero Ari debe confirmar

Estos textos vienen del doc de Ari y se ven en la página. Los que dicen "pendiente" están marcados `pending` en el YAML y aparecen en `PENDING-COPY.md`. Los que dicen "solo se reporta" están `verified`: no bloquean nada y nadie los cambió; se listan porque Ari puede querer revisarlos.

**3.1 Pilar 4, la nota `[VERIFICAR]` (`solution.items[3].body`).** El doc dice: "Cada mes ves qué se hizo, qué se movió y cuánto te costó contra cuánto generó. Nada de "subimos 20%". Más bien: "el orgánico trajo X visitas, convirtieron Y, compraron Z". [VERIFICAR: solo desglosa por canal (Google vs IA) si de verdad puedes atribuirlo con datos. Si no, repórtalo junto y no inventes el split.]" Ari lo respalda con datos o lo suaviza. Mientras tanto la página muestra "FALTA CONFIRMAR".

**3.2 Afirmaciones de mercado y credencial del hero.**
- `hero.description[0]`: "Tu cliente te busca en Google y, cada vez más, le pregunta a un asistente de IA."
- `why_now.items[1]`: la parte creciente de clientes que le pregunta a ChatGPT o a Gemini (datos de EE.UU. en la verificación de copy).
- `hero.description[2]`: "Contrata un equipo de especialistas con 8 años de experiencia, que arman tu estrategia, ejecutan, implementan y monitorean los resultados y ventas de tu web." Ari confirma la credencial.
- `hero.subtitle` depende de `brand.term`, que está pendiente (ver 1.10).
- `meta.title_template` ("Loops Growth: agencia de {term}") es un título provisional; la fase 3 lo reemplaza.

**3.3 Resultados.**
- `results.items[0].body`: "Cada cliente que llega desde orgánico cuesta una fracción de lo que cuesta por ads, y esa diferencia crece con el tiempo (el orgánico se abarata, los ads se encarecen)." Contiene una inferencia sin respaldo literal ("una fracción", "el orgánico se abarata"). Ari lo respalda con datos o lo suaviza.
- `results.items[1].lead`: "Dependes menos de los ads." Se muestra, pero resume el resultado cuyo dato falta (ver sección 2).
- Lenguaje de promesa (solo se reporta, ambos están `verified`): "Apareces donde antes no estabas." (`results.items[2].lead`) promete visibilidad, y "respondemos por el resultado" (`solution.lead`) puede leerse como promesa de resultado. No se reescriben.

**3.4 Casos de éxito.**
- Plazos (pendientes): `cases.items[0].period` a `cases.items[2].period` dicen "6 meses" y `cases.items[3].period` dice "12 meses". Salen del detalle de cada caso; Ari confirma los cinco plazos (el quinto falta, ver sección 2).
- Caso 5 (`cases.items[4].sector`, `.metric`, `.channel`): el doc trae una sola frase, "marca personal referente en Meta Ads", sin línea de detalle y sin punto final. La página la muestra completa como sector y toma "Meta Ads" como canal. La métrica dice "en crecimiento de trafico organico", que habla de tráfico orgánico en un caso de Meta Ads y no encaja con el resto (SEO y GEO). Ari confirma cómo se divide la frase y si el caso va. Si aporta una línea de detalle, ocupa el hueco de la tarjeta ancha a 1280 px.
- Cifras sin moneda: `cases.items[0].detail` dice "De $41K a $76K en ventas en 6 meses, con estrategia de contenido y optimización técnica." Se muestra tal cual, sin agregar moneda.
- Titular (`cases.title`): el doc no trae titular para la sección; se usó su rótulo, "Casos de exito", con la errata (ver sección 4). Ari confirma el titular y la ortografía.

**3.5 Cargo de Verónica.** En La solución (`solution.items[2].list[2]`) dice "Verónica (Gerente de Proyectos y Consultora SEO)"; en Quiénes somos (`team.members[1].role`) dice "Directora de Proyectos". Ari elige cuál usar.

**3.6 Nombres del equipo.** Ver 1.12 (`team.members[0].name` a `team.members[3].name`).

**3.7 Plazos de las cuatro fases (`how_it_works.steps[0].timeframe` a `steps[3].timeframe`):** "30 min", "2 semanas", "6-12 meses" y "mes 12+". Ari los confirma; el primero choca con la llamada de 20 minutos (ver 1.9).

**3.8 Afirmaciones de resultado en las fases 2 y 4 de Cómo funciona (solo se reporta, ambas están `verified`),** para que Ari las revise: "Análisis profundo, 10-20 oportunidades principales, plan claro e inversión concreta." (`how_it_works.steps[1].description`) y "El orgánico trae clientes solo; nosotros seguimos optimizando y escalando." (`how_it_works.steps[3].description`; promete resultado sin respaldo).

**3.9 Descripciones de Qué incluye.** Las seis empiezan en minúscula con "para que..." y se leen como continuación del título ("Contenido estratégico para que rankees en Google..."), pero en pantalla ocupan una línea aparte bajo el título. Ari confirma si se quiere así o con mayúscula inicial.

**3.10 Rótulos usados como titular (pendientes).** `cases.title` ("Casos de exito", ver 3.4), `for_whom.is_for.title` ("Para quién es") y `for_whom.is_not_for.title` ("Para quién no es"). Los dos últimos salen del contexto del proyecto porque el doc no trae esa sección.

**3.11 Cuerpo del CTA final.** `agenda.intro`: "Agenda una llamada de {duration}. Sin costo y sin compromiso. Entendemos tu negocio y te decimos con honestidad si podemos ayudarte. Si no somos el equipo correcto, también te lo decimos." Queda pendiente porque la duración depende de `call.duration` (ver 1.9).

**3.12 Palabras de las píldoras.** Ver 1.7.

## 4. Erratas del doc que la página muestra tal cual

Nadie las corrigió, porque el texto de Ari no se edita. Si Ari las corrige en el doc, basta cambiar el `text` en la ruta indicada.

| Ruta | Texto literal | Errata |
|------|---------------|--------|
| `hero.description[1]` | "Trabajamos para que tus clientes te encuentren en el momento que te estan buscando, con contenido y optimizaciones y estrategias que terminan en ventas sin depender de ads." | "estan" sin tilde. Además encadena "con contenido y optimizaciones y estrategias", que Ari puede querer pulir. |
| `agenda.title` | "¿Listo para que te encuentren cuando te estan buscando?" | "estan" sin tilde. |
| `solution.items[2].list[3]` | "Arianna (Fundadora): estrategia y direcciôn" | "direcciôn" con circunflejo en lugar de "dirección", y la línea termina sin punto final. |
| `problem.items[2]` | "...la lista de "deberíamos hacer esto" no se mueve  y el negocio se vuelve más dependiente cada trimestre de un canal que se encarece solo." | Espacio doble antes de "y". El navegador lo muestra como uno solo; el archivo lo conserva. |
| `cases.title` | "Casos de exito" | "exito" sin tilde. |
| `cases.items[4].metric` | "en crecimiento de trafico organico" | "trafico" y "organico" sin tilde; además, el caso 5 no lleva punto final. |
| `includes.items[1].description` | "para que sepas qué haremos, cuándo y cuándo esperar resultados." | "cuándo y cuándo" repetido; probablemente "cuándo y qué esperar". |
| `cases.items[0].detail` | "De $41K a $76K en ventas en 6 meses..." | El "$" no dice de qué moneda. |

Erratas que están en el doc pero la página no muestra, porque las biografías no se publican (sección 6 del doc): "agil" y "traves" en "Somos un equipo agil especializado en crecimiento orgánico a traves de Google, y plataformas de IA", "direccion" en "Lidera estrategia, direccion y proyecciones.", "técnico.Coach SEO" pegado sin espacio, y "Coach SEO en aprendoclub" sin punto final. Si Ari decide publicar las biografías (ver 1.12), hay que corregirlas antes.

## 5. Afirmaciones que el diseño esperaba y el doc no trae en ese lugar

El contrato de diseño de "Por qué ahora" esperaba cinco afirmaciones de mercado. Revisado contra `src/content/landing.es.yaml`:

- Ya están en "Por qué ahora": "Google sigue siendo la mayor parte del tráfico de búsqueda." (`why_now.items[0]`, verificada) y la de ChatGPT y Gemini (`why_now.items[1]`, pendiente, ver 3.2).
- "Los ads se encarecen" y "el orgánico se abarata" no aparecen como afirmaciones sueltas en "Por qué ahora". Solo aparecen dentro del paréntesis de `results.items[0].body` (ver 3.3), en la sección de Resultados.
- "El contenido que rankea hoy sigue trayendo clientes" tampoco está en "Por qué ahora"; aparece en Resultados: "No es un pico de un mes. El contenido que rankea hoy sigue trayendo clientes el año que viene, sin volver a pagar por él."

Pregunta para Ari: ¿quieres agregar esas afirmaciones a "Por qué ahora", con tus palabras y tu fuente? No se inventó ninguna.

## 6. Cómo se aplica cada respuesta, y otros hallazgos de los planes

### 6.1 Copy

1. Se edita el `text` en `src/content/landing.es.yaml` en la ruta indicada. Cuando Ari lo aprueba, se cambia `status` a `verified`.
2. Se corre `npm run pending`. La lista `PENDING-COPY.md` se regenera sola (no se edita a mano) y `node scripts/list-pending.mjs --check` confirma que está al día.
3. `PUBLIC_ENV=production npm run build` pasa cuando la lista queda vacía. Hoy falla en `prebuild`, antes de tocar `dist/`, solo por reglas `PENDING` y `MISSING` (61 y 32) y por el relleno "FALTA CONFIRMAR" que llegaría a `dist/index.html` y `dist/privacidad/index.html`.
4. Las respuestas sobre el logo, el morado, el favicon y las fuentes no se editan en el YAML: cada ítem de la sección 1 nombra su archivo.

### 6.2 Fotos

`PUBLIC_ENV=production node scripts/check-photos.mjs` sale 1 hoy por dos razones: la aprobación de `hero-a` y `whynow-a` está pendiente, y existen los rasters de `hero-b` y `whynow-b`, que no están elegidas. Para desbloquear, Juan y Ari eligen una candidata por ranura, se registra la aprobación en `src/assets/photos/LICENSES.md` y se sigue la lista de pasos de esa sección. Todo el cierre va en un solo commit.

### 6.3 Correcciones a los registros internos

Al verificar contra el repositorio aparecieron dos anotaciones viejas en los reportes de los planes que ya no son ciertas:

- El reporte del plan 02-02 y el registro visual hablaban de un set de avatares con lupa, auriculares, gafas y gorro y de un favicon con el isotipo de dos ojos. El plan 02-10 los reemplazó por el Loopy oficial (ver 1.4) y el plan 02-09 dejó el favicon en la mesa 18 (ver 1.3). Vale lo que dice este documento.
- El reporte del plan 02-03 decía que la guarda `VERIFICAR` no reconocía la forma real del doc, `[VERIFICAR: ...]`. Ya quedó corregida (`VERIFICAR_RE` en `scripts/lib/copy-rules.mjs` acepta `[VERIFICAR` seguido de texto).
- El mismo reporte decía que las cinco afirmaciones de mercado no existen en el doc. La sección 5 de este documento dice con precisión cuáles están y dónde.

### 6.4 Otros hallazgos para Juan y la fase 3 (no requieren respuesta de Ari)

- Cuando exista el dominio (`site` en `astro.config.mjs`), el build de producción genera el sitemap y `/privacidad/` sale en `sitemap-0.xml` mientras lleva `noindex` (así lo observó el plan 02-06). Hay que excluirla del sitemap (`sitemap({ filter })` en `astro.config.mjs`) y quitar el `noindex` de `src/pages/privacidad.astro` cuando exista el texto legal.
- `footer.social` es hoy una sola afirmación de texto. Cuando Ari entregue las redes hay que pasar a una lista de nombre y URL, con validación de host y `rel="noopener noreferrer"`.
- El iframe real de ClickUp no se puede probar por dentro con las pruebas automáticas (corren con ClickUp bloqueado). Una persona debe recorrerlo con teclado, entrar y salir sin trampa de foco, y anotarlo en `EXCEPTIONS.md` en la fase 3.
- VoiceOver en Safari (y NVDA o TalkBack si se puede) sobre el `<summary>` del FAQ: que anuncie contraído o expandido y lea la respuesta al abrir.
- Propuestas de la revisión visual, opcionales: subtítulo del hero a tamaño Title (24 px) en lugar de Body; tarjeta del equipo de La solución en dos columnas; tres radios fuera de la escala de DESIGN.md (0.25rem, 0.45em y 3px).
- En móvil (una columna) el collage del hero queda debajo de la copia, no en el primer pantallazo de 390 x 844; el primer pantallazo trae el titular, el subtítulo y el CTA.
- Las fotos se guardan como PNG y no como AVIF o WebP porque pesaron menos en las cuatro (WebP de 1.2 a 1.5 veces más, AVIF de 1.8 a 2.2 veces más). Se puede revertir con el componente `Picture`.
- `sharp` es opcional de Astro y no está fijado en `package.json`; fijarlo pide su propia auditoría de paquetes.
- Fase 3: Lighthouse sobre las fotos (LCP y CLS en móvil), registrar en `A11Y-DECISIONS.md` que las fotos son decorativas, dominio real y compuerta completa de accesibilidad.

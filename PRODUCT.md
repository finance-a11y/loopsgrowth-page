# Product

<!-- impeccable:product-schema 1 -->

<!-- Origen: no hubo entrevista en vivo (ejecutor sin persona que responda). Todo lo de abajo sale de .planning/PROJECT.md, 02-CONTEXT.md, 02-UI-SPEC.md y .claude/CLAUDE.md, decisiones ya aprobadas por Juan. Lo inferido va marcado. -->

## Platform

web

## Stack

Astro 7 con Tailwind 4, salida estática, sin islas ni JavaScript de cliente propio. Decisión de Juan, contrastada por investigación (matriz en `.claude/CLAUDE.md`). No se cambia.

## Users

Dueños de e-commerce y de negocios con presupuesto de marketing serio: facturan al menos USD 200k al año, pueden invertir USD 4-5k al mes en marketing en total y más de USD 1.5k al mes en SEO/GEO. Llegan desde un evento donde Ari usa la página como herramienta de captación, muchas veces desde el celular. Su trabajo: entender en segundos qué hace Loops Growth, decidir si confiar y llenar el formulario de ClickUp para agendar una llamada de pre-calificación.

## Product Purpose

Landing de captación de Loops Growth, agencia de SEO/GEO (Google, ChatGPT, Gemini). Cubre los pasos 1 y 2 del embudo: el visitante llega y llena el formulario de ClickUp (embebido por iframe). Éxito: formularios enviados por clientes que cumplen la pre-calificación. Si todo lo demás falla, el formulario tiene que funcionar y estar a un scroll de distancia.

## Positioning

Un equipo dedicado y especializado (8 años de experiencia, afirmación pendiente de confirmar por Ari) que ejecuta el SEO/GEO de punta a punta, en lugar de entregar solo recomendaciones, y que además trabaja la visibilidad en asistentes de IA. Marca paraguas aprendoseo.

## Operating Context

El copy vive en un doc de Ari y se mapea sin reescribir a `src/content/landing.es.yaml`. Ari y Camila validan el sitio en local antes del evento. Todo texto que Ari deba confirmar se lista en `PENDING-COPY.md` y la producción falla mientras haya afirmaciones pendientes.

## Capabilities and Constraints

- Español neutro, siempre "tú", nunca voseo.
- El copy sale verbatim del doc de Ari: no se humaniza, no se reescribe y las erratas se reportan, no se corrigen.
- A11Y.md es obligatorio en todo el frontend y manda sobre la estética.
- Cuatro CTA con el mismo texto ("Agenda tu llamada de 30 minutos") que llevan a `#agenda`.
- Sin fotos reales del equipo ni logos de clientes: ilustración de marca, texto y métricas.
- Sin cifras inventadas: donde falta el dato, la página muestra "FALTA CONFIRMAR".
- Fuera de alcance: dominio y deploy, versión en inglés, formulario propio, blog.

## Brand Commitments

Brandbook de Eleven (2024): Purple (Purblue) #4228D1, Wild Orange #fd6938, Sun Yellow #ffc602, Dark Gray #212121, más blanco y el crema #F4F3E0 del logo. El BrandBook rotula el morado de la página 8 con un valor erróneo (#73187F); el valor oficial es el de los archivos del logo, #4228D1 (decisión de Juan, 2026-09-19). Isotipo "Loopy" (Ari con lupa, ojos animados, círculos que se repiten). Tipografía geométrica sans (Hurme Geometric Sans 3, licencia web pendiente; Outfit como respaldo). Pesos 400, 600 y 700. Estilo collage pop, moderno y con energía, profesional sin ser aburrido. Referencias que Ari nombró: m8l.com, skale.so, rankingonai.com.

## Evidence on Hand

Copy v2 de Ari (`.planning/phases/02-secciones-marca-y-copy/02-ARI-COPY-V2.md`). Cifras de casos de éxito solo las que trae el doc; ninguna es verificable por nosotros. No hay testimonios, logos de clientes, fotos del equipo ni datos propios de tráfico: no se fabrican.

## Product Principles

1. Un solo camino: todo lleva al formulario, con un solo CTA dominante por pantalla.
2. Verdad antes que adorno: nada de afirmaciones ni cifras que Ari no haya dado.
3. La accesibilidad es una restricción de diseño, no una capa final.
4. La página promete SEO técnico, así que ella misma tiene HTML semántico y Core Web Vitals sólidos.
5. Personalidad de marca sin ruido: collage con intención, sin animación que compita con el mensaje.

## Accessibility & Inclusion

A11Y.md completo: contraste medido (no estimado), foco visible de 3 px, objetivo táctil de 44 px, reflow a 320 px, `prefers-reduced-motion` respetado, contenido que no depende de JavaScript, `lang="es"`. El interior del formulario de ClickUp no es controlable y queda registrado como excepción conocida con enlace de respaldo.

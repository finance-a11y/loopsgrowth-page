# Loops Growth Landing

## What This Is

Landing page de captación de clientes para Loops Growth, agencia de SEO/GEO (Google, ChatGPT, Gemini) para e-commerce y negocios con presupuesto de marketing serio. La página lleva al visitante a llenar el formulario de ClickUp (paso 2 del embudo) para agendar una llamada de pre-calificación. Ari la usará como herramienta de captación en un evento la próxima semana. Se construye primero como sitio local para validación de Ari y Camila.

## Core Value

Un visitante entiende en segundos qué hace Loops Growth y llena el formulario de ClickUp. Si todo lo demás falla, el form embebido tiene que funcionar y estar a un scroll de distancia.

## Business Context

- **Customer**: Negocios/e-commerce que facturan mínimo USD 200k al año, con capacidad de invertir 4-5k/mes en marketing y +1.5k/mes en SEO/GEO.
- **Revenue model**: Retainer mensual de servicios SEO/GEO (auditoría, estrategia, ejecución, reportes).
- **Success metric**: Formularios de ClickUp enviados por clientes que cumplen la pre-calificación.
- **Strategy notes**: Doc de proceso y copy: https://docs.google.com/document/d/1QK61DPEQ3UbBQcCBnepwoaBesyZE1ZvZ6VfLgPrgtI0 | Branding: https://drive.google.com/drive/folders/1byOfW_MgbJ5YrX8UY2uwgek2EyZsKlhe

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Landing de una página con las secciones del Copy v2: Hero, El problema, Por qué ahora, La solución (4 pilares), Lo que logramos juntos, Casos de éxito, Quiénes somos, Qué incluye, Cómo funciona, CTA final
- [ ] Formulario de ClickUp embebido por iframe, accesible desde todos los CTAs ("Agenda tu llamada de 30 minutos")
- [ ] Identidad de marca aplicada fielmente: colores (Purple #4228D1, Wild Orange #fd6938, Sun Yellow #ffc602, Dark Gray #212121), Hurme Geometric Sans 3, logo/isotipo, estilo collage pop (lupas, ojos, clicks)
- [ ] Diseño inspirado en referencias de Ari: m8l.com, skale.so, rankingonai.com
- [ ] Responsive (móvil ~400px hasta desktop)
- [ ] Cumplimiento estricto de A11Y.md (reglas de accesibilidad del frontend)
- [ ] SEO on-page básico de la propia landing (title, meta, headings, schema Organization, OG)
- [ ] Sitio corriendo en local, validado por Ari y Camila, listo hoy
- [ ] Elección de stack documentada con investigación (Astro vs alternativas)

### Out of Scope

- Deploy en producción y dominio loopsgrowth.com — hoy solo local; el dominio está pendiente de ubicar/comprar
- Versión en inglés — decisión: solo español para llegar a la fecha
- Form propio conectado a la API de ClickUp — se usa iframe embebido por velocidad
- Fotos reales del equipo y logos de clientes — no hay material; se usa texto, métricas e ilustración de marca
- Calendario de llamadas, plantillas de correo, SOP de onboarding, cotizaciones — parte del proceso, pero no de la landing
- Página "About us" completa (journey, certificaciones, números) — solo la sección Quiénes somos del copy v2
- Blog o contenido SEO adicional — fuera de alcance de esta entrega

## Context

- **Origen**: Task asignado para tener la página lista para un evento donde Ari la usará como captación. Prioridad temporal sobre clientes actuales, por feedback pendiente y por el evento.
- **Embudo**: 1) llega a landing → 2) llena form ClickUp → 3) llamada de pre-calificación de 20 min con Camila y Ari (jueves/viernes) → 4) cotización con Ari, recursos con Vero → 5) llamada de cierre. La landing cubre los pasos 1 y 2.
- **Form ClickUp**: https://forms.clickup.com/90131720021/f/2ky49tun-19253/DATFKMESVSMXZY5CO5
- **Brandbook** (Eleven, 2024): Marca paraguas aprendoseo, estilo moderno y con energía, profesional sin ser aburrido. Isotipo "Loopy" = Ari + lupa, ojos animados, círculos que se repiten (loop). Fuente sans serif geométrica; "Loopsgrowth" en Bold grande. Assets en Drive: ISOTIPO (PNG/JPG), VARIANTE, MONOCROMÁTICO, SOBRE COLOR, ORIGINAL, MATERIALES, logo .ai y BrandBook PDF.
- **Ambigüedades del copy a resolver o marcar**:
  - Dos flags `[VERIFICAR]` en el doc: rango "30% a 50% menos de presupuesto de ads" y el split Google vs IA en reportes. No publicar afirmaciones sin verificar; suavizar o marcar para Ari.
  - Mezcla "SEO/GEO" y "SEO y AEO" en el copy; unificar terminología con Ari.
  - Copy dice llamada de 30 min, el embudo dice 20 min de pre-calificación; alinear con Ari.
  - Casos de éxito: el último ítem (+500% tráfico, marca personal Meta Ads) está pegado al de la app infantil; separarlo en su propia tarjeta.
  - La numeración del copy salta del 8 al 10.
- **Equipo mostrado en la página**: Arianna Lupi (fundadora), Verónica Romero (directora de proyectos), Juan Angulo (director técnico), Miguel Pacheco (especialista SEO).
- **Workspace**: proyecto nuevo en `~/Documents/Codigo/Arianna/loopsgrowth`, sin código previo.

## Constraints

- **Timeline**: Sitio local completo hoy — evento la próxima semana, Ari y Camila necesitan validar antes.
- **Tech stack**: Elegido por investigación. Hipótesis de Juan: Astro (framework, no el tema Astra de WordPress). Se contrasta con WordPress+Astra, Next.js, Vite HTML y Webflow/Framer según velocidad, performance, control de diseño y mantenimiento por el equipo.
- **Accesibilidad**: A11Y.md obligatorio en todo el frontend — https://github.com/fecarrico/A11Y.md/blob/main/docs/en/A11Y.md
- **Marca**: Colores, tipografía y logo del brandbook sin desviarse; pixel-perfect.
- **Performance/SEO**: La página promete SEO técnico; ella misma debe tener Core Web Vitals sólidos y HTML semántico.
- **Contenido**: El copy viene de Ari; todos los textos ya están en el doc de Ari (https://docs.google.com/document/d/1QK61DPEQ3UbBQcCBnepwoaBesyZE1ZvZ6VfLgPrgtI0/edit?tab=t.nvl47nvdgyma); no se humaniza ni se reescribe nada (cambio de Juan, 2026-09-18). Si falta un texto, se pide a Ari.
- **Skills obligatorias (regla de Juan)**: Todo trabajo de diseño web pasa por la skill `impeccable` y la taste skill (`design-taste-frontend`). El texto y copy viene del doc de Ari y no pasa por `humanizer`. Español neutro, nunca voseo (usar "tú", no "vos"/"tenés"/"agendá").

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Form de ClickUp por iframe embebido | Velocidad y confiabilidad para llegar a la fecha; el form ya existe y alimenta el embudo | — Pending |
| Solo español | Copy v2 en español, ahorra tiempo | — Pending |
| Casos de éxito como tarjetas de métricas, sin logos ni fotos | No hay material ni permisos de uso de marcas de clientes | — Pending |
| Entrega hoy solo en local | Ari y Camila validan primero; dominio aún sin resolver | — Pending |
| Stack: Astro como hipótesis, a validar con research | Juan lo propone; hay que confirmar contra alternativas (incl. WordPress+Astra) | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-09-18 after initialization*

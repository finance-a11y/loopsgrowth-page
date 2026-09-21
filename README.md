# Loops Growth Landing

Landing de captación de Loops Growth (SEO y GEO para e-commerce). Astro 7 más Tailwind 4, salida estática y sin JavaScript propio salvo lo mínimo que se agregue en las fases siguientes. El objetivo de la página es llevar al visitante al formulario de ClickUp embebido en `#agenda`.

Requiere Node 22.12 o superior (versiones pares: 22, 24).

## Cómo correrlo

```bash
npm install
npm run dev        # http://localhost:4321
npm run dev:lan    # igual, pero visible desde otros equipos de tu red local
npm run build      # genera dist/
npm run preview    # sirve dist/ para revisar el build
```

Para que Ari y Camila lo vean desde su equipo: corre `npm run dev:lan` y abre `http://<IP de tu equipo>:4321` desde la misma red. Si un agente de IA lanzó el servidor, Astro lo deja en segundo plano y se detiene con `npx astro dev stop`.

## Variables de entorno

Copia `.env.example` a `.env` (el archivo `.env` no se versiona). Solo se usan variables con prefijo `PUBLIC_`.

| Variable | Valores | Efecto |
|----------|---------|--------|
| `PUBLIC_ENV` | `local`, `preview`, `production` | Solo `production` (exacto) hace la página indexable. Cualquier otro valor emite `<meta name="robots" content="noindex">`, sin canonical ni sitemap |
| `PUBLIC_SITE_URL` | URL absoluta con `http` o `https` | Alimenta canonical, sitemap y `robots.txt`. Con `PUBLIC_ENV=production` es obligatoria: sin ella el build falla |

## Dónde se edita el texto

Todo el texto visible está en `src/content/landing.es.yaml`. Cada texto es `{ text, status }` y el estado es `verified` o `pending`. La regla completa está en el comentario al inicio del archivo.

Para cambiar la duración de la llamada (por ejemplo de 30 a 20 minutos) se edita una sola línea: `call.duration.text`. El botón, el título y la introducción de la sección de agenda la toman de ahí.

## Verificaciones

```bash
node scripts/verify-dev-lan.mjs      # el servidor responde en localhost y en la IP de la red local
node scripts/verify-env-surface.mjs  # noindex, canonical, sitemap y robots por entorno
```

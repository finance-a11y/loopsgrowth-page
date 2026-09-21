# Procedencia de los logos de clientes

Registro de los 12 logos de marcas que aparecen en el hero (`Hero.astro`, bloque de clientes). Lo leen `scripts/lib/photo-licenses.mjs` y `scripts/check-photos.mjs` (que corre en prebuild). Los logos son decorativos (`alt` vacío): el nombre del cliente va como texto visible junto a cada uno. Los archivos son los originales tal como los sirve el sitio de Ari (webp de 128x128), sin recodificar.

## Estado

Los logos salen de https://ariannalupi.com/, el sitio personal de Ari, que no declara licencia ni derechos sobre ellos. Son marcas registradas de terceros (Unilever, HubSpot y el resto). Juan Carlos Angulo autorizó copiarlos y usarlos el 2026-09-20, pero la aprobación de Ari, y que cada marca acepte figurar como cliente en la landing de la agencia, siguen PENDIENTES. La puerta de producción (`PUBLIC_ENV=production`) bloquea mientras cualquier fila esté pendiente; fuera de producción solo advierte.

## Cómo cerrar la aprobación

1. Ari confirma que puede usar cada logo y cada nombre de cliente en la landing de Loops Growth (por escrito, por ejemplo un mensaje).
2. En la tabla "Registro" de este archivo: escribir en la columna de aprobación `aprobada por <nombre> el <AAAA-MM-DD>`. Ninguna fecha puede ser anterior a la descarga.
3. Si un cliente no se aprueba: borrar su fila, su archivo `src/assets/clients/<id>.webp`, su id en `src/components/sections/hero-clients.mjs` y su entrada en `hero.clients.items` del YAML (el esquema exige 12, ajústalo en `src/content.config.ts`).
4. Comprobar: `node --test tests/guards/hero-clients.test.mjs`, `PUBLIC_ENV=production node scripts/check-photos.mjs` (debe salir 0) y `npx astro build`.

## Registro

| id | archivo | fuente | descargada | dimensiones | sha256 | autorizó | aprobación de Ari | nota |
|----|---------|--------|------------|-------------|--------|----------|-------------------|------|
| `holafly` | `holafly.webp` | https://ariannalupi.com/assets/brands/holafly.webp | 2026-09-20 | 128x128 | c8c5d8fe9613c58f49f9a69d569203a1f7e4ca3415416d96571379b8389e39d6 | Juan Carlos Angulo, 2026-09-20 | pendiente | Holafly. Marca registrada de un tercero, copiada del sitio de Ari sin licencia declarada. |
| `hubspot` | `hubspot.webp` | https://ariannalupi.com/assets/brands/hubspot.webp | 2026-09-20 | 128x128 | ee188980de0fcc5db12d26e3a0ec7b07728a9ad6178bec7c312dfbedf203944f | Juan Carlos Angulo, 2026-09-20 | pendiente | HubSpot. Marca registrada de un tercero, copiada del sitio de Ari sin licencia declarada. |
| `unilever` | `unilever.webp` | https://ariannalupi.com/assets/brands/unilever.webp | 2026-09-20 | 128x128 | 19e9b70a0e07c12fe747a4cf7546ebb2f75dfbc2e80ec1c86339506cd23a580c | Juan Carlos Angulo, 2026-09-20 | pendiente | Unilever. Marca registrada de un tercero, copiada del sitio de Ari sin licencia declarada. |
| `alchemy` | `alchemy.webp` | https://ariannalupi.com/assets/brands/alchemy.webp | 2026-09-20 | 128x128 | 5611eb000a4c3576bb213073da983309d3714d4cc5876ae4837754d81287c88d | Juan Carlos Angulo, 2026-09-20 | pendiente | Alchemy. Marca registrada de un tercero, copiada del sitio de Ari sin licencia declarada. |
| `ambl` | `ambl.webp` | https://ariannalupi.com/assets/brands/ambl.webp | 2026-09-20 | 128x128 | f78c5d7f8d0bdaa95a004513b05ba78b553ec6423c08962a180536a1632bf4dd | Juan Carlos Angulo, 2026-09-20 | pendiente | Ambl. Marca registrada de un tercero, copiada del sitio de Ari sin licencia declarada. |
| `travelperk` | `travelperk.webp` | https://ariannalupi.com/assets/brands/travelperk.webp | 2026-09-20 | 128x128 | 40aad2feebf346b30a828c70a89b5794584504baff9166558fd19b19d305a49d | Juan Carlos Angulo, 2026-09-20 | pendiente | TravelPerk. Marca registrada de un tercero, copiada del sitio de Ari sin licencia declarada. |
| `skale` | `skale.webp` | https://ariannalupi.com/assets/brands/skale.webp | 2026-09-20 | 128x128 | a6840a71d3c0abf27665f845771eef57061ff082d6684457221215e62a9bf5ca | Juan Carlos Angulo, 2026-09-20 | pendiente | Skale. Marca registrada de un tercero, copiada del sitio de Ari sin licencia declarada. |
| `sendlane` | `sendlane.webp` | https://ariannalupi.com/assets/brands/sendlane.webp | 2026-09-20 | 128x128 | 4324056728d94792aa4d1cec681af7ae9cc8d3a5f8792c81954005439210dc6e | Juan Carlos Angulo, 2026-09-20 | pendiente | Sendlane. Marca registrada de un tercero, copiada del sitio de Ari sin licencia declarada. |
| `chartmogul` | `chartmogul.webp` | https://ariannalupi.com/assets/brands/chartmogul.webp | 2026-09-20 | 128x128 | 94664add2803f1d8d217254e3ecae6e03913a1bf117d882af69dd1eb8a6e3b82 | Juan Carlos Angulo, 2026-09-20 | pendiente | ChartMogul. Marca registrada de un tercero, copiada del sitio de Ari sin licencia declarada. |
| `holded` | `holded.webp` | https://ariannalupi.com/assets/brands/holded.webp | 2026-09-20 | 128x128 | 289a4282d73ba3570d45448b5e735ac924a842d6fe4e7af8c539215cbfe6021f | Juan Carlos Angulo, 2026-09-20 | pendiente | Holded. Marca registrada de un tercero, copiada del sitio de Ari sin licencia declarada. |
| `flodesk` | `flodesk.webp` | https://ariannalupi.com/assets/brands/flodesk.webp | 2026-09-20 | 128x128 | 9cb7869bb1fe8e892831ca2206f756f2a06a4ca8415235d312a33930d48c1e31 | Juan Carlos Angulo, 2026-09-20 | pendiente | Flodesk. Marca registrada de un tercero, copiada del sitio de Ari sin licencia declarada. |
| `piktochart` | `piktochart.webp` | https://ariannalupi.com/assets/brands/piktochart.webp | 2026-09-20 | 128x128 | 2f798d2841f6f85ce49134e3dc9fbb2a2f9da6c88fb892b82e60c185850cdf05 | Juan Carlos Angulo, 2026-09-20 | pendiente | Piktochart. Marca registrada de un tercero, copiada del sitio de Ari sin licencia declarada. |

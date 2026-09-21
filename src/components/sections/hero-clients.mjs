// Manifiesto de los logos de clientes del hero (quick 260920-hero-clients). ESM plano, sin copy: los nombres
// visibles salen del YAML (`hero.clients.items`) y se emparejan con el logo por su nombre en minúsculas; la
// procedencia vive en src/assets/clients/PROVENANCE.md. El orden es el de ariannalupi.com. Una cadena suelta
// dentro de `es` rompería la guarda FND-02 (BARE_STRING); aquí no hay copy.

/** Lado en píxeles de cada logo (webp cuadrado de origen, sin recodificar). */
export const CLIENT_LOGO_SIZE = 128;

/** Ids en el orden en que se muestran; cada id es el nombre del cliente en minúsculas. */
export const CLIENT_LOGOS = Object.freeze([
  'holafly', 'hubspot', 'unilever', 'alchemy', 'ambl', 'travelperk',
  'skale', 'sendlane', 'chartmogul', 'holded', 'flodesk', 'piktochart',
]);

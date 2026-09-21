// Presupuesto de peso del HTML de `/`: UNA sola fuente para todas las pruebas que lo miden (los specs e2e y
// la guarda de Node `tests/guards/brand-assets.test.mjs`). ESM plano para que lo lean los dos.
//
// Justificación (plan 02-06, autorizado por el orquestador): 81920 bytes crudos y, como condición dura,
// 25600 bytes con gzip -9. El tope anterior de 61440 crudos era un presupuesto propio sin comprimir; el
// contenido de Ari no se recorta para caber en él. La métrica que importa es la del gzip. Subir cualquiera
// de los dos valores se hace SOLO aquí y con la autorización del orquestador.

/** Bytes crudos: `dist/index.html` debe pesar MENOS que este valor (80 KiB). */
export const HTML_RAW_MAX = 81920;

/** Bytes con `gzip -9`: `dist/index.html` debe pesar MENOS que este valor (25 KiB). */
export const HTML_GZIP_MAX = 25600;

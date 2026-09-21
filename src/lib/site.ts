// Superficie de entorno (FND-05). Solo `PUBLIC_ENV` exactamente igual a `production` indexa.
// Cualquier otro valor (vacío, `Production`, `local`, `preview`) se trata como no productivo.

const rawEnv = import.meta.env.PUBLIC_ENV;
const rawSiteUrl = (import.meta.env.PUBLIC_SITE_URL ?? '').trim();

export const isProduction: boolean = rawEnv === 'production';

function parseSiteUrl(value: string): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : undefined;
  } catch {
    return undefined;
  }
}

/** URL absoluta http o https del sitio, o `undefined` si falta o es inválida. */
export const siteUrl: string | undefined = parseSiteUrl(rawSiteUrl);

/** URL canónica absoluta de una ruta, o `undefined` si no hay `PUBLIC_SITE_URL`. */
export function canonicalUrl(path: string): string | undefined {
  return siteUrl ? new URL(path, siteUrl).href : undefined;
}

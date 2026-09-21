import type { APIRoute } from 'astro';
import { isProduction, siteUrl } from '../lib/site';

// Fuera de producción: rastreo permitido, sin línea Sitemap y sin Disallow.
// Google debe poder ver el `noindex` del HTML; un Disallow lo ocultaría.
export const GET: APIRoute = () => {
  const lines = ['User-agent: *', 'Allow: /'];
  if (isProduction && siteUrl) {
    lines.push('', `Sitemap: ${new URL('sitemap-index.xml', siteUrl).href}`);
  }
  return new Response(`${lines.join('\n')}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};

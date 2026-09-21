import { getEntry } from 'astro:content';

type Landing = NonNullable<Awaited<ReturnType<typeof getEntry<'landing'>>>>['data'];
type Claim = { text: string };
type Vars = { term: string; duration: string };

/**
 * Lee la entrada única de la colección `landing`. Falla con un error claro
 * si el YAML no tiene la clave `es`.
 */
export async function getLanding(): Promise<Landing> {
  const entry = await getEntry('landing', 'es');
  if (!entry) {
    throw new Error("Falta la clave `es` en src/content/landing.es.yaml (colección `landing`).");
  }
  return entry.data;
}

/**
 * Sustituye {term} y {duration} en el texto de una afirmación. Si tras
 * sustituir queda alguna llave `{...}`, lanza un error que nombra la
 * afirmación: así un placeholder sin resolver nunca llega a la página.
 * El texto se devuelve igual sea cual sea el estado de la afirmación.
 */
export function fill(claim: Claim, vars: Partial<Vars>, key = 'afirmación'): string {
  let out = claim.text;
  for (const [name, value] of Object.entries(vars)) {
    out = out.replaceAll(`{${name}}`, value);
  }
  const leftover = out.match(/\{[^}]*\}/g);
  if (leftover) {
    throw new Error(
      `Llave sin resolver ${leftover.join(', ')} en "${key}" de landing.es.yaml: ` +
        `las únicas llaves válidas son {term} y {duration}.`,
    );
  }
  return out;
}

/** Variables de sustitución: el término vive en brand.term y la duración en call.duration. */
export function textVars(data: Landing): Vars {
  return { term: data.brand.term.text, duration: data.call.duration.text };
}

/** Etiqueta de todos los CTA, compuesta desde la plantilla y la duración. */
export function ctaLabel(data: Landing): string {
  return fill(data.cta.label_template, textVars(data), 'cta.label_template');
}

// Expresión estricta de correo del pie (SiteFooter.astro). Módulo aparte para que la plantilla y las
// pruebas lean la MISMA expresión (una copia en la prueba se desalinea sin avisar).
//
// La parte local admite solo letras, dígitos, punto, guion bajo, más y guion. No admite `%`: al abrir un
// enlace `mailto:` el cliente decodifica `%3F`, `%3A` o `%0D%0A`, y con eso un valor del YAML podría
// reintroducir parámetros (`?bcc=...`) o cabeceras. Tampoco admite `?`, `,`, `;`, `:` ni espacios. Todo lo
// que admite es seguro dentro de una URL, así que no hace falta codificarlo.
export const EMAIL_RE = /^[A-Za-z0-9._+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/;

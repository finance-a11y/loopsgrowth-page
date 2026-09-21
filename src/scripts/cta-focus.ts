/**
 * Único JS propio de la página (FORM-02). El ancla nativa hace el desplazamiento;
 * este script solo mueve el foco al h2 de #agenda para que el teclado y el lector
 * de pantalla queden dentro de la sección. Sin ancla ni script la página sigue
 * funcionando. Solo compara location.hash con el literal `#agenda` y usa un id fijo.
 */
const HASH = '#agenda';
const TITLE_ID = 'agenda-title';

function focusTitle(): void {
  document.getElementById(TITLE_ID)?.focus({ preventScroll: true });
}

// El salto de ancla a un destino no enfocable vacía el foco: hay que enfocar
// después de la navegación por defecto, no durante el clic.
function focusAfterNavigation(): void {
  setTimeout(focusTitle, 0);
}

document.addEventListener('click', (event) => {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  if (event.target instanceof Element && event.target.closest('a[href="#agenda"]')) {
    focusAfterNavigation();
  }
});

window.addEventListener('hashchange', () => {
  if (location.hash === HASH) focusAfterNavigation();
});

// Carga directa con #agenda: el navegador termina el salto de ancla más tarde (con ClickUp
// bloqueado o lento, después de `load`) y puede vaciar el foco que ya se había puesto. Se
// reintenta cada 150 ms durante 1,5 s, solo mientras el foco esté vacío, y se detiene si la
// persona empieza a usar el teclado o el puntero para no robarle el foco.
if (location.hash === HASH) {
  const deadline = performance.now() + 1500;
  let userActed = false;
  const stop = () => {
    userActed = true;
  };
  window.addEventListener('keydown', stop, { once: true });
  window.addEventListener('pointerdown', stop, { once: true });
  const tick = () => {
    if (userActed) return;
    const active = document.activeElement;
    if (!active || active === document.body) focusTitle();
    if (performance.now() < deadline) setTimeout(tick, 150);
  };
  setTimeout(tick, 0);
}

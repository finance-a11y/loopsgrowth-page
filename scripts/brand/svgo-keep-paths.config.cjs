// Configuración de SVGO para las fuentes de Loopy (plan 02-10): conserva una ruta por elemento del arte.
// Con las rutas unidas, los esquemas de color se funden de forma distinta y no se pueden recolorear por rol.
module.exports = {
  multipass: true,
  floatPrecision: 2,
  plugins: [{ name: 'preset-default', params: { overrides: { mergePaths: false } } }, 'removeXMLNS'],
};

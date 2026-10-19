/**
 * Los nombres del sistema de gestión (artículos, rubros, marcas) vienen en
 * MAYÚSCULAS. Para que sean más fáciles de leer se muestran con solo la
 * primera letra en mayúscula: "ACEITES COMESTIBLES" → "Aceites comestibles".
 */
export function capitalizar(texto: string | null | undefined): string {
  if (!texto) return "";
  const t = texto.trim().replace(/\s+/g, " ").toLocaleLowerCase("es");
  return t.charAt(0).toLocaleUpperCase("es") + t.slice(1);
}

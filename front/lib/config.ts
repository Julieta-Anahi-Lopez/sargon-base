// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURACIÓN DEL CLIENTE
// Editá este archivo para adaptar el template a un nuevo cliente.
// El resto del código NO debería necesitar cambios para la identidad básica.
// ─────────────────────────────────────────────────────────────────────────────

export const CLIENTE = {

  // ── Identidad ──────────────────────────────────────────────────────────────
  nombre:      "Ser Natural",
  eslogan:     "¡Estamos para ayudarte a que tu negocio crezca!",
  descripcion: "Ser Natural — Productos naturales y saludables para tu negocio.",

  // ── Contacto ───────────────────────────────────────────────────────────────
  contacto: {
    whatsapp:  "5492914195796",                   // formato internacional sin +
    email:     "sernaturaldistribuidora@gmail.com",
    instagram: "distribuidora.sernatural",        // sin @
    direccion: "Saavedra 1647, Bahía Blanca",
    mapsUrl:   "https://www.google.com/maps/search/Saavedra+1647+Bahia+Blanca",
  },

  // ── Mensajes WhatsApp ──────────────────────────────────────────────────────
  whatsapp: {
    mensajeFlotante: "Hola, quiero hacer una consulta sobre productos de Ser Natural.",
    mensajeFooter:   "Hola, quiero consultar sobre productos de Ser Natural",
  },

  // ── SEO ────────────────────────────────────────────────────────────────────
  seo: {
    titulo:      "Ser Natural",
    descripcion: "Ser Natural — Productos naturales y saludables para tu negocio.",
  },

  // ── Localidades (para el formulario de vendedor) ───────────────────────────
  // Adaptá esta lista a la zona de cobertura del cliente.
  localidades: [
    { value: "8000", label: "Bahía Blanca" },
    { value: "8103", label: "Ingeniero White" },
    { value: "8105", label: "General Daniel Cerri" },
    { value: "8109", label: "Punta Alta" },
    { value: "8118", label: "Cabildo" },
    { value: "8150", label: "Coronel Dorrego" },
    { value: "8153", label: "Monte Hermoso" },
    { value: "8160", label: "Tornquist" },
    { value: "8168", label: "Sierra de la Ventana" },
    { value: "8170", label: "Pigüé" },
    { value: "7530", label: "Coronel Pringles" },
  ],

  // ── Feature flags ──────────────────────────────────────────────────────────
  features: {
    // false = solo el vendedor crea usuarios (flujo actual)
    // true  = el cliente puede registrarse solo (requiere implementar /registro)
    registroLibre:  false,

    // Habilita la ruta /vendedor/nuevo-usuario
    moduloVendedor: true,
  },

} as const;

// Alias para compatibilidad con imports existentes
export const WHATSAPP = CLIENTE.contacto.whatsapp;

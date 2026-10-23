// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURACIÓN DEL CLIENTE
// Editá este archivo para adaptar el template a un nuevo cliente.
// El resto del código NO debería necesitar cambios para la identidad básica.
// ─────────────────────────────────────────────────────────────────────────────

export const CLIENTE = {

  // ── Identidad ──────────────────────────────────────────────────────────────
  nombre:      "Nombre del Cliente",
  eslogan:     "El eslogan del cliente va aquí",
  descripcion: "Descripción corta para SEO y sección hero.",

  // ── Contacto ───────────────────────────────────────────────────────────────
  contacto: {
    whatsapp:  "5490000000000",                    // formato internacional sin +
    email:     "contacto@cliente.com",
    instagram: "cliente_instagram",                // sin @
    direccion: "Dirección del cliente",
    mapsUrl:   "https://maps.google.com",
  },

  // ── Mensajes WhatsApp ──────────────────────────────────────────────────────
  whatsapp: {
    mensajeFlotante: "Hola, quiero hacer una consulta.",
    mensajeFooter:   "Hola, quiero hacer una consulta.",
  },

  // ── SEO ────────────────────────────────────────────────────────────────────
  seo: {
    titulo:      "Nombre del Cliente",
    descripcion: "Descripción para motores de búsqueda.",
  },

  // ── Localidades (para el formulario de vendedor) ───────────────────────────
  // Adaptá esta lista a la zona de cobertura del cliente.
  localidades: [
    { value: "0000", label: "Ciudad principal" },
  ],

  // ── Feature flags ──────────────────────────────────────────────────────────
  features: {
    // false = solo el vendedor crea usuarios (flujo actual)
    // true  = el cliente puede registrarse solo (requiere implementar /registro)
    registroLibre:  false,

    // Habilita la ruta /vendedor/nuevo-usuario
    moduloVendedor: true,

    // Habilita /vendedor/reportes — dashboard con KPIs, pedidos web, carritos activos,
    // clientes inactivos y ranking de productos. Solo visible para usuarios con catusu='V'.
    // Requiere moduloVendedor: true.
    reportesVendedor: false,

    // Habilita el botón "Pagar con Mercado Pago" en pedidos y las páginas de resultado.
    // Requiere MP_ENABLED=True en el backend y las credenciales en el .env.
    mercadoPago:    false,
  },

} as const;

// Alias para compatibilidad con imports existentes
export const WHATSAPP = CLIENTE.contacto.whatsapp;

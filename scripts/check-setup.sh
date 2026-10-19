#!/usr/bin/env bash
# check-setup.sh — verifica que el template esté configurado antes de arrancar
#
# Uso (desde la raíz del repo):
#   bash scripts/check-setup.sh

set -euo pipefail

PASS=0
FAIL=0
WARN=0

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

ok()   { echo -e "${GREEN}✅  $1${NC}";          PASS=$((PASS + 1)); }
fail() { echo -e "${RED}❌  $1${NC}";            FAIL=$((FAIL + 1)); }
warn() { echo -e "${YELLOW}⚠️   $1${NC}";         WARN=$((WARN + 1)); }

section() { echo ""; echo "── $1 ──────────────────────────────────────"; }

# ── Helpers ──────────────────────────────────────────────────────────────────

config_has_placeholder() {
  # returns 0 (true) if config.ts still contains the placeholder string
  grep -q "$1" front/lib/config.ts 2>/dev/null
}

env_has_placeholder() {
  # returns 0 (true) if back/.env still contains the placeholder string
  grep -q "$1" back/docker/.env 2>/dev/null
}

# ── front/lib/config.ts ───────────────────────────────────────────────────────

section "front/lib/config.ts"

if config_has_placeholder "Nombre del Cliente"; then
  fail "CLIENTE.nombre — todavía dice 'Nombre del Cliente'"
else
  ok "CLIENTE.nombre configurado"
fi

if config_has_placeholder "549XXXXXXXXXX"; then
  fail "CLIENTE.contacto.whatsapp — todavía dice '549XXXXXXXXXX'"
else
  ok "CLIENTE.contacto.whatsapp configurado"
fi

if config_has_placeholder "info@cliente.com"; then
  fail "CLIENTE.contacto.email — todavía dice 'info@cliente.com'"
else
  ok "CLIENTE.contacto.email configurado"
fi

if config_has_placeholder 'instagram: "usuario"'; then
  fail "CLIENTE.contacto.instagram — todavía dice 'usuario'"
else
  ok "CLIENTE.contacto.instagram configurado"
fi

if config_has_placeholder "Descripción para SEO"; then
  fail "CLIENTE.seo.descripcion — todavía es placeholder"
else
  ok "CLIENTE.seo.descripcion configurada"
fi

if config_has_placeholder "Tu eslogan aquí"; then
  fail "CLIENTE.eslogan — todavía es placeholder"
else
  ok "CLIENTE.eslogan configurado"
fi

if config_has_placeholder "tudominio.com"; then
  fail "CLIENTE.contacto.mapsUrl — todavía tiene 'tudominio.com'"
else
  ok "CLIENTE.contacto.mapsUrl configurado"
fi

# ── Imágenes ──────────────────────────────────────────────────────────────────

section "Imágenes (front/public/images/)"

REQUIRED_IMAGES=("logo.png" "hero.jpg" "deposito-pasillo.jpg" "productos-detalle.jpg" "deposito-panoramica.jpg" "suplementos.jpg")

for img in "${REQUIRED_IMAGES[@]}"; do
  if [ ! -f "front/public/images/$img" ]; then
    fail "Imagen faltante: $img"
  else
    ok "Imagen presente: $img"
  fi
done

# ── back/docker/.env ──────────────────────────────────────────────────────────

section "back/docker/.env"

if [ ! -f back/docker/.env ]; then
  fail "back/docker/.env no existe — copiarlo desde .env.example y completarlo"
else
  ok "back/docker/.env existe"

  if env_has_placeholder "generá-una-clave-segura"; then
    fail "SECRET_KEY — todavía es placeholder"
  else
    ok "SECRET_KEY configurado"
  fi

  if env_has_placeholder "nombre_base_de_datos"; then
    fail "DB_NAME — todavía es placeholder"
  else
    ok "DB_NAME configurado"
  fi

  if env_has_placeholder "contraseña"; then
    fail "DB_PASSWORD — todavía es placeholder"
  else
    ok "DB_PASSWORD configurado"
  fi

  if env_has_placeholder "Nombre del Cliente"; then
    fail "NOMBRE_CLIENTE — todavía es placeholder"
  else
    ok "NOMBRE_CLIENTE configurado"
  fi

  if env_has_placeholder "noreply@tudominio"; then
    fail "EMAIL_FROM — todavía es placeholder"
  else
    ok "EMAIL_FROM configurado"
  fi

  if env_has_placeholder "re_xxxxxxxx"; then
    fail "RESEND_API_KEY — todavía es placeholder"
  else
    ok "RESEND_API_KEY configurado"
  fi

  if env_has_placeholder "tudominio.com.ar"; then
    warn "ALLOWED_HOSTS / FRONTEND_URL — revisar que sean el dominio real del cliente"
  else
    ok "ALLOWED_HOSTS / FRONTEND_URL configurados"
  fi
fi

# ── front/.env.local ──────────────────────────────────────────────────────────

section "front/.env.local"

if [ ! -f front/.env.local ]; then
  fail "front/.env.local no existe — crear con NEXT_PUBLIC_API_URL=https://api.dominio.com/api"
else
  if grep -q "localhost" front/.env.local 2>/dev/null; then
    warn "NEXT_PUBLIC_API_URL apunta a localhost — ¿es intencional? (ok en dev, cambiar en prod)"
  else
    ok "front/.env.local configurado"
  fi
fi

# ── Resumen ───────────────────────────────────────────────────────────────────

echo ""
echo "════════════════════════════════════════════════"
echo -e "  ${GREEN}✅ $PASS ok${NC}   ${RED}❌ $FAIL errores${NC}   ${YELLOW}⚠️  $WARN avisos${NC}"
echo "════════════════════════════════════════════════"

if [ $FAIL -gt 0 ]; then
  echo ""
  echo "Completá los items marcados con ❌ antes de continuar."
  echo "Ver NUEVO_CLIENTE.md para el brief completo."
  exit 1
else
  echo ""
  echo "Listo para arrancar 🚀"
  echo ""
  echo "Recordatorios manuales (no verificables automáticamente):"
  echo "  • Parámetros ERP insertados en tabla 'parametros' (Web/1 a Web/4)"
  echo "  • Colores actualizados en front/tailwind.config.ts"
  echo "  • npm run build pasa sin errores"
  echo "  • python manage.py test pasa sin errores"
  exit 0
fi

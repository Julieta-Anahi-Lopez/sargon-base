# Brief — Nuevo cliente

Completar este documento con el cliente antes de arrancar el proyecto.
Una vez completo, usarlo para configurar `front/lib/config.ts`, `back/docker/.env` y la tabla `parametros` del ERP.

---

## 1. Identidad

| Campo | Valor |
|---|---|
| Nombre comercial | |
| Eslogan / tagline | |
| Descripción corta (para SEO, ~160 caracteres) | |

---

## 2. Contacto

| Campo | Valor | Formato |
|---|---|---|
| WhatsApp | | Internacional sin +. Ej: `5492914000000` |
| Email de contacto | | El que aparece en el footer |
| Instagram | | Solo el usuario, sin @ |
| Dirección física | | Calle y número, ciudad |
| Link Google Maps | | URL completa |

---

## 3. Mensajes de WhatsApp

Texto que aparece pre-cargado cuando el cliente hace clic en el botón de WhatsApp:

| Botón | Texto |
|---|---|
| Botón flotante (esquina inferior derecha) | |
| Footer (botón "Consultanos por WhatsApp") | |

---

## 4. Zona de cobertura (localidades)

Lista de localidades que cubre el cliente para el formulario de nuevo usuario.
Indicar código postal y nombre de cada una.

| Código postal | Localidad |
|---|---|
| | |
| | |
| | |

---

## 5. Imágenes

Entregar en alta resolución. Ver tamaños sugeridos abajo.

| Imagen | Descripción | Tamaño sugerido |
|---|---|---|
| `logo.png` | Logo del cliente, fondo transparente | Mín. 800px de ancho |
| `hero.jpg` | Foto principal del home (productos o local) | 1920×1080px |
| `deposito-pasillo.jpg` | Interior del depósito / local | 1920×1080px |
| `productos-detalle.jpg` | Productos en primer plano | 1920×1080px |
| `deposito-panoramica.jpg` | Vista panorámica del depósito | 1920×1080px |
| `suplementos.jpg` | Foto de cierre (cualquier producto destacado) | 1920×1080px |

> Si el cliente no tiene todas las fotos, acordar cuáles se reemplazan y con qué.

---

## 6. Paleta de colores

| Token | Color | Uso |
|---|---|---|
| `brand` | | Verde/color principal (textos, fondos de énfasis) |
| `brand-dark` | | Versión oscura del principal (hover, header) |
| `brand-light` | | Versión muy clara (fondos de sección) |
| `accent` | | Color de acento (botones, highlights) |
| `accent-dark` | | Versión oscura del acento (hover) |

> Pedirle al cliente el manual de marca o los colores en hex. Si no tiene, definirlos juntos.

---

## 7. Parámetros del ERP

Consultar con quien administra el ERP del cliente. Estos valores se insertan en la tabla `parametros` de la base de datos.

| Parámetro | Descripción | Valor |
|---|---|---|
| Punto de venta (`Web/1`) | Número de punto de venta para los pedidos web | |
| Número de empresa (`Web/2`) | `NroEmp` que usan todos los comprobantes | |
| Monto mínimo (`Web/3`) | Importe mínimo de pedido (0 = sin mínimo) | |
| Lista de precios (`Web/4`) | Qué lista ven los nuevos clientes: `0` = base, `1` = lista1 | |

---

## 8. Email (recuperación de contraseña)

| Campo | Valor |
|---|---|
| Nombre del remitente | Cómo aparece en el "De:" del email. Ej: `Ser Natural` |
| Dirección de envío | Email verificado en Resend. Ej: `noreply@tudominio.com` |
| Resend API Key | Proporcionada por quien administra el dominio |

> Si el cliente no tiene Resend configurado, ver guía de alta en resend.com (requiere verificar el dominio).

---

## 9. Dominio y hosting

| Campo | Valor |
|---|---|
| Dominio principal | Ej: `tudominio.com.ar` |
| URL del frontend | Ej: `https://tudominio.com.ar` |
| URL de la API | Ej: `https://tudominio.com.ar/api` |

---

## 10. Contenido de páginas legales *(puede entregarse después)*

- [ ] Texto de "Nosotros" (historia, propuesta de valor)
- [ ] Política de privacidad
- [ ] Términos y condiciones

> Estas páginas se pueden levantar con el texto placeholder y editar con el texto definitivo luego.

---

## Checklist de entrega

Marcar cuando cada ítem fue recibido y cargado:

- [ ] Identidad completa
- [ ] Datos de contacto completos
- [ ] Mensajes de WhatsApp definidos
- [ ] Localidades confirmadas
- [ ] Todas las imágenes recibidas
- [ ] Paleta de colores definida
- [ ] Parámetros ERP confirmados
- [ ] Email/Resend configurado
- [ ] Dominio definido
- [ ] `front/lib/config.ts` actualizado
- [ ] `back/docker/.env` creado y completo
- [ ] Parámetros insertados en la BD
- [ ] `npm run build` sin errores
- [ ] `python manage.py test` sin errores

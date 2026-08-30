# Guía para vender NOCTRA Commerce

## Qué se entrega al comprador

El producto de Gumroad debe ser el archivo ZIP de código fuente, nunca una carpeta que contenga `.env.local`, claves API, `node_modules`, `.git`, builds locales o datos de prueba.

Contenido recomendado del paquete:

- Código fuente completo.
- `.env.example` sin credenciales.
- `README.md` con instalación y pruebas.
- Migración D1 incluida.
- Plantilla de licencia comercial.

Gumroad vende y entrega el archivo; Stripe dentro de NOCTRA procesa las compras de ropa de la tienda instalada. Son dos flujos independientes.

## Texto listo para el anuncio

### Nombre

NOCTRA Commerce — Premium AI Fashion Store

### Descripción corta

Una experiencia ecommerce mobile-first para marcas de moda: checkout Stripe, AI stylist con Gemini, recomendaciones de catálogo, captura de leads, base de datos y diseño editorial oscuro.

### Incluye

- Código fuente TypeScript y React.
- Checkout Stripe Payment Element y wallets compatibles.
- Asistente de estilo Gemini protegido en servidor.
- Base de datos de pedidos y suscriptores.
- UI responsive con catálogo, carrito, talla inteligente y probador conceptual.
- Guía de instalación y pruebas.

### Transparencia para el comprador

- Las cuentas y claves de Stripe/Gemini no están incluidas.
- El comprador debe configurar su propia cuenta comercial y cumplir sus obligaciones legales.
- El probador virtual es una demostración visual, no un sistema de generación de prendas por IA.
- Las imágenes y textos deben ser revisados antes de usarse en una marca real.

## Entrega y licencia

1. Sube el ZIP sanitizado como archivo digital.
2. Personaliza `LICENCIA_COMERCIAL_PLANTILLA.md` con tu nombre, precio y alcance.
3. Entrega actualizaciones como nuevas versiones del mismo producto.
4. No prometas instalación ilimitada o soporte de por vida salvo que quieras ofrecerlos.

Una licencia sencilla puede separar tres niveles: uso individual, uso comercial para una marca y licencia de agencia para múltiples clientes.

## Venta por correo

El formulario de la web guarda suscriptores con consentimiento en la tabla `leads`. Para enviar campañas debes conectar un proveedor como Resend, Brevo o Mailchimp con la cuenta del propietario.

Secuencia sugerida:

1. Correo 1: demostración visual y problema que resuelve.
2. Correo 2: video corto del checkout y del asistente NØA.
3. Correo 3: oferta de lanzamiento con fecha de cierre real.
4. Correo 4: preguntas frecuentes, licencia y requisitos técnicos.

No envíes campañas a direcciones compradas ni sin consentimiento y ofrece siempre una opción de baja.

## Checklist antes de publicar

- El ZIP no contiene `.env.local` ni ninguna clave.
- `npm install` y `npm run build` funcionan desde una copia limpia.
- Los precios y capturas de pantalla coinciden con el producto entregado.
- La política de soporte y reembolsos está escrita.
- La licencia está personalizada.
- La demo pública utiliza únicamente credenciales de prueba o un backend protegido.

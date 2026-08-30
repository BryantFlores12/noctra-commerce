# NOCTRA Commerce

![NOCTRA Commerce](public/og.png)

Plantilla de comercio electrónico para moda con pagos reales, persistencia de pedidos, captación de leads y un estilista asistido por IA. Está pensada como una base lista para personalizar, probar y desplegar sin exponer secretos en el navegador.

## Características

- Catálogo responsive con selección de talla, bolsa y flujo de compra.
- Stripe Payment Element y Express Checkout para Apple Pay y Google Pay cuando están disponibles.
- Importes calculados y verificados exclusivamente en el servidor.
- Webhook firmado para sincronizar el estado de cada pago.
- Pedidos, artículos y suscriptores almacenados en Cloudflare D1.
- Asistente NØA conectado a Gemini mediante una ruta del servidor.
- Recomendaciones limitadas al catálogo para evitar productos inventados.
- Diseño editorial, visualizador de prendas y recomendador de talla.

## Stack

| Área | Tecnología |
| --- | --- |
| Interfaz | React 19, Next.js 16, TypeScript, Tailwind CSS 4 |
| Runtime | Vinext, Vite, Cloudflare Workers |
| Pagos | Stripe Payment Element, Express Checkout y webhooks |
| IA | Gemini API desde el servidor |
| Datos | Cloudflare D1 y migraciones SQL |
| Calidad | ESLint y TypeScript |

## Inicio rápido

Requiere Node.js 22.13 o superior.

```bash
npm install
copy .env.example .env.local
npm run dev
```

En macOS o Linux, reemplaza `copy` por `cp`. Después abre la URL indicada por el servidor de desarrollo.

## Variables de entorno

| Variable | Uso |
| --- | --- |
| `GEMINI_API_KEY` | Credencial privada para el estilista NØA |
| `GEMINI_MODEL` | Modelo de Gemini utilizado por el servidor |
| `STRIPE_PUBLISHABLE_KEY` | Clave pública de Stripe |
| `STRIPE_SECRET_KEY` | Clave secreta de Stripe; nunca debe llegar al cliente |
| `STRIPE_WEBHOOK_SECRET` | Verificación de la firma del webhook |

El archivo `.env.example` contiene valores de referencia. `.env.local` está excluido de Git y no debe publicarse.

## Comandos

```bash
npm run dev      # entorno local
npm run build    # compilación de producción
npm run start    # ejecución de la compilación
npm run lint     # análisis estático
```

## Base de datos

La migración inicial está en `drizzle/0001_noctra_commerce.sql` e incluye:

- `orders`: importe, moneda, correo y estado del pago.
- `order_items`: productos, tallas y cantidades.
- `leads`: correos y consentimiento del formulario principal.

La aplicación espera un binding D1 llamado `DB` en el entorno de Cloudflare.

## Pruebas de integración

Para Stripe en modo de prueba, usa `4242 4242 4242 4242`, cualquier fecha futura y un CVC válido. Para probar el webhook localmente, reenvía los eventos de Stripe CLI a:

```text
http://localhost:3000/api/stripe/webhook
```

Para Gemini, abre **NØA · AI Stylist** y solicita un look con ocasión, presupuesto y preferencias. La respuesta debe recomendar únicamente referencias existentes.

## Antes de producción

1. Configura claves activas y un webhook HTTPS.
2. Aplica la migración D1 y verifica copias de seguridad.
3. Registra el dominio para wallets en Stripe.
4. Sustituye catálogo, precios, imágenes, políticas y datos de marca.
5. Define impuestos, envíos, inventario, devoluciones y textos legales.
6. Revisa accesibilidad, privacidad y consentimiento.

Consulta `GUIA_DE_DISTRIBUCION.md` para preparar una entrega comercial.

## Seguridad y licencia

No incluyas claves, datos de clientes ni archivos de entorno en el repositorio. El código se distribuye bajo la licencia comercial incluida en `LICENCIA_COMERCIAL_PLANTILLA.md`.

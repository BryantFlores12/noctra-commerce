# NOCTRA Commerce

[![CI](https://github.com/BryantFlores12/noctra-commerce/actions/workflows/ci.yml/badge.svg)](https://github.com/BryantFlores12/noctra-commerce/actions/workflows/ci.yml)

![NOCTRA Commerce](public/og.png)

NOCTRA Commerce es una tienda de moda en línea que desarrollé para conectar una interfaz visual con funciones reales. Incluye pagos con Stripe, almacenamiento de pedidos y suscriptores, además de un asistente de estilo con inteligencia artificial.

## Características

- Catálogo adaptable con selección de talla, bolsa y proceso de compra.
- Stripe Payment Element y Express Checkout para Apple Pay y Google Pay cuando están disponibles.
- Importes calculados y verificados exclusivamente en el servidor.
- Webhook firmado para sincronizar el estado de cada pago.
- Pedidos, artículos y suscriptores almacenados en Cloudflare D1.
- Asistente NØA conectado a Gemini desde el servidor.
- Recomendaciones limitadas al catálogo para evitar productos inventados.
- Diseño editorial, visualizador de prendas y recomendador de talla.

## Tecnologías

| Área | Tecnología |
| --- | --- |
| Interfaz | React 19, Next.js 16, TypeScript, Tailwind CSS 4 |
| Entorno | Vinext, Vite, Cloudflare Workers |
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

La aplicación utiliza una conexión D1 llamada `DB` en el entorno de Cloudflare.

## Pruebas de integración

Para Stripe en modo de prueba, usa `4242 4242 4242 4242`, cualquier fecha futura y un CVC válido. Para probar el webhook localmente, reenvía los eventos de Stripe CLI a:

```text
http://localhost:3000/api/stripe/webhook
```

Para probar Gemini, abre el asistente **NØA** y solicita un conjunto indicando la ocasión, el presupuesto y tus preferencias. La respuesta debe recomendar únicamente productos que existan en el catálogo.

## Antes de producción

1. Configura claves activas y un webhook HTTPS.
2. Aplica la migración D1 y verifica copias de seguridad.
3. Registra el dominio para las carteras digitales en Stripe.
4. Sustituye catálogo, precios, imágenes, políticas y datos de marca.
5. Define impuestos, envíos, inventario, devoluciones y textos legales.
6. Revisa accesibilidad, privacidad y consentimiento.

## Sobre el proyecto

Con este proyecto trabajé el proceso completo de una tienda en línea: mostrar el catálogo, cobrar, confirmar pagos con webhooks, guardar pedidos y conectar inteligencia artificial sin exponer las claves en el navegador.

## Seguridad

No incluyas claves, datos de clientes ni archivos de entorno en el repositorio.

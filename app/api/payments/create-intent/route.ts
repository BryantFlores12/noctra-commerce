import { getDatabase } from '@/db/client';
import { allowedSizes, serverCatalog } from '@/lib/catalog';
import { getStripePublishableKey, stripeFormRequest } from '@/lib/stripe';

type CartInput = { id?: unknown; size?: unknown; qty?: unknown };
type StripeIntent = { id: string; client_secret: string | null; livemode: boolean };

function json(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
  });
}

function normalizeCart(value: unknown) {
  if (!Array.isArray(value) || value.length === 0 || value.length > 20) {
    throw new Error('La bolsa está vacía o no es válida.');
  }

  return value.map((raw: CartInput) => {
    const id = Number(raw.id);
    const qty = Number(raw.qty);
    const size = typeof raw.size === 'string' ? raw.size : '';
    const product = serverCatalog.get(id);
    if (!product || !Number.isInteger(qty) || qty < 1 || qty > 10 || !allowedSizes.has(size)) {
      throw new Error('Uno de los artículos de la bolsa no es válido.');
    }
    return { id, qty, size, ...product };
  });
}

export async function POST(request: Request) {
  let payload: { items?: unknown };
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Solicitud no válida.' }, 400);
  }

  try {
    const items = normalizeCart(payload.items);
    const amount = items.reduce((sum, item) => sum + item.unitAmount * item.qty, 0);
    const orderId = `NC-${crypto.randomUUID()}`;
    const params = new URLSearchParams({
      amount: String(amount),
      currency: 'eur',
      'automatic_payment_methods[enabled]': 'true',
      'automatic_payment_methods[allow_redirects]': 'never',
      description: 'Pedido de prueba NOCTRA',
      'metadata[order_id]': orderId,
      'metadata[channel]': 'web',
    });

    const intent = await stripeFormRequest<StripeIntent>(
      '/payment_intents',
      params,
      orderId,
    );
    if (!intent.client_secret) throw new Error('Stripe no devolvió un secreto de cliente.');

    const database = await getDatabase();
    const now = new Date().toISOString();
    await database.batch([
      database.prepare(
        `INSERT INTO orders
          (id, payment_intent_id, status, currency, amount, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ).bind(orderId, intent.id, 'pending', 'eur', amount, now, now),
      ...items.map((item) => database.prepare(
        `INSERT INTO order_items
          (order_id, product_id, product_name, size, quantity, unit_amount)
         VALUES (?, ?, ?, ?, ?, ?)`,
      ).bind(orderId, item.id, item.name, item.size, item.qty, item.unitAmount)),
    ]);

    return json({
      clientSecret: intent.client_secret,
      publishableKey: getStripePublishableKey(),
      orderId,
      amount,
      mode: intent.livemode ? 'live' : 'test',
    });
  } catch (error) {
    console.error('Create payment intent error', error instanceof Error ? error.message : 'unknown');
    return json({ error: 'No se pudo iniciar el pago seguro. Inténtalo de nuevo.' }, 502);
  }
}

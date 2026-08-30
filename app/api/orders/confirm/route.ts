import { getDatabase } from '@/db/client';
import { stripeFormRequest } from '@/lib/stripe';

type StripePaymentIntent = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  metadata?: { order_id?: string };
  payment_method?: { billing_details?: { email?: string | null } };
};

export async function POST(request: Request) {
  let payload: { orderId?: unknown; paymentIntentId?: unknown };
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: 'Solicitud no válida.' }, { status: 400 });
  }

  if (typeof payload.orderId !== 'string' || typeof payload.paymentIntentId !== 'string') {
    return Response.json({ error: 'Faltan datos del pedido.' }, { status: 400 });
  }

  try {
    const intent = await stripeFormRequest<StripePaymentIntent>(
      `/payment_intents/${encodeURIComponent(payload.paymentIntentId)}?expand[]=payment_method`,
    );
    if (intent.metadata?.order_id !== payload.orderId || intent.status !== 'succeeded') {
      return Response.json({ error: 'El pago todavía no está confirmado.' }, { status: 409 });
    }

    const database = await getDatabase();
    const stored = await database.prepare(
      'SELECT amount, currency FROM orders WHERE id = ? AND payment_intent_id = ?',
    ).bind(payload.orderId, intent.id).first<{ amount: number; currency: string }>();

    if (!stored || stored.amount !== intent.amount || stored.currency !== intent.currency) {
      return Response.json({ error: 'El pedido no coincide con el pago.' }, { status: 409 });
    }

    await database.prepare(
      `UPDATE orders
       SET status = ?, email = COALESCE(?, email), updated_at = ?
       WHERE id = ?`,
    ).bind(
      'paid',
      intent.payment_method?.billing_details?.email || null,
      new Date().toISOString(),
      payload.orderId,
    ).run();

    return Response.json({ ok: true, orderId: payload.orderId });
  } catch (error) {
    console.error('Confirm order error', error instanceof Error ? error.message : 'unknown');
    return Response.json({ error: 'No se pudo confirmar el pedido.' }, { status: 502 });
  }
}

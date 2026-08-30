import { getDatabase } from '@/db/client';

type StripeEvent = {
  type?: string;
  data?: { object?: { id?: string; status?: string; metadata?: { order_id?: string } } };
};

function fromHex(value: string) {
  if (!/^[a-f0-9]+$/i.test(value) || value.length % 2 !== 0) return null;
  const bytes = new Uint8Array(value.length / 2);
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(value.slice(index * 2, index * 2 + 2), 16);
  }
  return bytes;
}

function safeEqual(left: Uint8Array, right: Uint8Array) {
  if (left.length !== right.length) return false;
  let result = 0;
  for (let index = 0; index < left.length; index += 1) result |= left[index] ^ right[index];
  return result === 0;
}

async function verifySignature(payload: string, header: string, secret: string) {
  const parts = header.split(',').map((part) => part.split('='));
  const timestamp = parts.find(([key]) => key === 't')?.[1];
  const signatures = parts.filter(([key]) => key === 'v1').map(([, value]) => value);
  if (!timestamp || signatures.length === 0) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const expected = new Uint8Array(await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(`${timestamp}.${payload}`),
  ));

  return signatures.some((signature) => {
    const provided = fromHex(signature);
    return provided ? safeEqual(expected, provided) : false;
  });
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get('stripe-signature');
  if (!secret || !signature) return new Response('Webhook no configurado.', { status: 503 });

  const rawBody = await request.text();
  if (!await verifySignature(rawBody, signature, secret)) {
    return new Response('Firma no válida.', { status: 400 });
  }

  const event = JSON.parse(rawBody) as StripeEvent;
  const intent = event.data?.object;
  const orderId = intent?.metadata?.order_id;
  if (!orderId || !intent?.id) return Response.json({ received: true });

  const statuses: Record<string, string> = {
    'payment_intent.succeeded': 'paid',
    'payment_intent.payment_failed': 'failed',
    'payment_intent.canceled': 'canceled',
  };
  const orderStatus = event.type ? statuses[event.type] : undefined;
  if (orderStatus) {
    const database = await getDatabase();
    await database.prepare(
      'UPDATE orders SET status = ?, updated_at = ? WHERE id = ? AND payment_intent_id = ?',
    ).bind(orderStatus, new Date().toISOString(), orderId, intent.id).run();
  }

  return Response.json({ received: true });
}

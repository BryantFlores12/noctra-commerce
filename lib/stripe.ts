const STRIPE_API = 'https://api.stripe.com/v1';

function getStripeSecret() {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) throw new Error('Stripe no está configurado.');
  return secret;
}

export function getStripePublishableKey() {
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
  if (!publishableKey) throw new Error('La clave pública de Stripe no está configurada.');
  return publishableKey;
}

export async function stripeFormRequest<T>(
  path: string,
  body?: URLSearchParams,
  idempotencyKey?: string,
) {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${getStripeSecret()}`,
  };

  if (body) headers['Content-Type'] = 'application/x-www-form-urlencoded';
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;

  const response = await fetch(`${STRIPE_API}${path}`, {
    method: body ? 'POST' : 'GET',
    headers,
    body,
  });
  const payload = await response.json() as T & { error?: { message?: string } };

  if (!response.ok) {
    throw new Error(payload.error?.message || `Stripe respondió con estado ${response.status}.`);
  }

  return payload;
}

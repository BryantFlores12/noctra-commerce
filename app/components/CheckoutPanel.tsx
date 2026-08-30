'use client';

import { Elements, ExpressCheckoutElement, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { FormEvent, useEffect, useMemo, useState } from 'react';

export type CheckoutCartItem = {
  id: number;
  name: string;
  price: number;
  image: string;
  size: string;
  qty: number;
};

type PaymentConfig = {
  clientSecret: string;
  publishableKey: string;
  orderId: string;
  mode: 'test' | 'live';
};

const money = (amount: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);

function PaymentForm({ config, onSuccess }: { config: PaymentConfig; onSuccess: (orderId: string) => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function confirmPayment(event?: FormEvent) {
    event?.preventDefault();
    if (!stripe || !elements || busy) return;
    setBusy(true);
    setError('');

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/?payment=return` },
      redirect: 'if_required',
    });

    if (result.error) {
      setError(result.error.message || 'Stripe no pudo autorizar el pago.');
      setBusy(false);
      return;
    }

    if (result.paymentIntent?.status !== 'succeeded') {
      setError('El pago necesita una acción adicional antes de confirmarse.');
      setBusy(false);
      return;
    }

    const response = await fetch('/api/orders/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: config.orderId, paymentIntentId: result.paymentIntent.id }),
    });
    const data = await response.json() as { error?: string };
    if (!response.ok) {
      setError(data.error || 'El cobro fue aceptado, pero no pudimos confirmar el pedido.');
      setBusy(false);
      return;
    }

    onSuccess(config.orderId);
  }

  return (
    <form className="stripe-payment-form" onSubmit={confirmPayment}>
      <div className="express-payment">
        <ExpressCheckoutElement onConfirm={() => confirmPayment()} options={{ buttonHeight: 46 }} />
      </div>
      <div className="separator"><span /> O CONTINÚA CON TARJETA <span /></div>
      <PaymentElement options={{ layout: 'tabs' }} />
      {error && <p className="payment-error" role="alert">{error}</p>}
      <button className="pay-button" disabled={!stripe || !elements || busy}>
        {busy ? 'AUTORIZANDO CON STRIPE…' : 'PAGAR DE FORMA SEGURA ↗'}
      </button>
      <div className="security-badges"><span>◈ TLS CIFRADO</span><span>◎ 3D SECURE</span><span>◇ STRIPE RADAR</span></div>
      <small className="security-note">
        {config.mode === 'test' ? 'MODO PRUEBA · USA 4242 4242 4242 4242 · CUALQUIER FECHA FUTURA Y CVC' : 'PAGO REAL PROCESADO POR STRIPE'}
      </small>
    </form>
  );
}

export function CheckoutPanel({
  cart,
  subtotal,
  onClose,
  onSuccess,
}: {
  cart: CheckoutCartItem[];
  subtotal: number;
  onClose: () => void;
  onSuccess: (orderId: string) => void;
}) {
  const [config, setConfig] = useState<PaymentConfig | null>(null);
  const [error, setError] = useState('');
  const publishableKey = config?.publishableKey;
  const stripePromise = useMemo(
    () => publishableKey ? loadStripe(publishableKey) : null,
    [publishableKey],
  );

  useEffect(() => {
    const controller = new AbortController();

    fetch('/api/payments/create-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart.map(({ id, size, qty }) => ({ id, size, qty })) }),
      signal: controller.signal,
    }).then(async (response) => {
      const data = await response.json() as PaymentConfig & { error?: string };
      if (!response.ok) throw new Error(data.error || 'No se pudo preparar Stripe.');
      setConfig(data);
    }).catch((reason) => {
      if (reason instanceof DOMException && reason.name === 'AbortError') return;
      setError(reason instanceof Error ? reason.message : 'No se pudo preparar Stripe.');
    });

    return () => controller.abort();
  }, [cart]);

  const options: StripeElementsOptions | undefined = config ? {
    clientSecret: config.clientSecret,
    appearance: {
      theme: 'night',
      variables: {
        colorPrimary: '#8b5cf6',
        colorBackground: '#121218',
        colorText: '#f5f2ff',
        colorDanger: '#ff7c9b',
        borderRadius: '2px',
        fontFamily: 'Arial, Helvetica, sans-serif',
      },
    },
  } : undefined;

  return (
    <div className="checkout overlay" role="dialog" aria-modal="true" aria-label="Checkout seguro con Stripe">
      <button className="close" onClick={onClose} aria-label="Cerrar checkout">×</button>
      <div className="checkout-layout">
        <div className="checkout-main">
          <p className="section-index violet">STRIPE CHECKOUT / 01 PANTALLA</p>
          <h2>Termina en<br />menos de un minuto.</h2>
          <p className="checkout-intro">Tus datos de tarjeta se introducen directamente en Stripe y nunca pasan por los servidores de la tienda.</p>
          {error && <div className="payment-setup-error" role="alert"><b>NO PUDIMOS ABRIR EL PAGO</b><span>{error}</span></div>}
          {!config && !error && <div className="payment-loading"><span /><p>CREANDO SESIÓN CIFRADA…</p></div>}
          {config && stripePromise && options && (
            <Elements stripe={stripePromise} options={options}>
              <PaymentForm config={config} onSuccess={onSuccess} />
            </Elements>
          )}
        </div>
        <aside>
          <h3>TU PEDIDO</h3>
          {cart.map((item, index) => (
            <article key={`checkout-${item.id}-${item.size}-${index}`}>
              <img src={item.image} alt="" />
              <div><b>{item.name}</b><small>TALLA {item.size} · {item.qty} UND.</small></div>
              <strong>{money(item.price * item.qty)}</strong>
            </article>
          ))}
          <div className="checkout-total">
            <p><span>Subtotal</span><b>{money(subtotal)}</b></p>
            <p><span>Envío express</span><b>INCLUIDO</b></p>
            <p><span>TOTAL</span><strong>{money(subtotal)}</strong></p>
          </div>
          <div className="stripe-trust"><span>STRIPE</span><p>Payment Element + Radar</p></div>
        </aside>
      </div>
    </div>
  );
}

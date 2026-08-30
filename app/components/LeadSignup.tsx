'use client';

import { FormEvent, useState } from 'react';

export function LeadSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (status === 'busy') return;
    setStatus('busy');
    setMessage('');

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || 'No se pudo completar el registro.');
      setStatus('done');
      setEmail('');
      setMessage('Ya estás dentro. Revisa tu correo en el próximo drop.');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'No se pudo completar el registro.');
    }
  }

  return (
    <form onSubmit={submit}>
      <label>
        <span className="sr-only">Correo electrónico</span>
        <input
          type="email"
          placeholder="TU EMAIL"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={status === 'busy'}
          required
        />
        <button disabled={status === 'busy'}>{status === 'busy' ? 'GUARDANDO…' : 'UNIRME ↗'}</button>
      </label>
      {message && <output className={`newsletter-status ${status}`}>{message}</output>}
    </form>
  );
}

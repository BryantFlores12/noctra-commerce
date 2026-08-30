import { getDatabase } from '@/db/client';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let payload: { email?: unknown };
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: 'Solicitud no válida.' }, { status: 400 });
  }

  const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
  if (!EMAIL.test(email) || email.length > 254) {
    return Response.json({ error: 'Introduce un correo válido.' }, { status: 400 });
  }

  try {
    const database = await getDatabase();
    await database.prepare(
      `INSERT INTO leads (email, source, consent, created_at)
       VALUES (?, ?, 1, ?)
       ON CONFLICT(email) DO UPDATE SET consent = 1, source = excluded.source`,
    ).bind(email, 'newsletter-home', new Date().toISOString()).run();
    return Response.json({ ok: true });
  } catch (error) {
    console.error('Lead signup error', error instanceof Error ? error.message : 'unknown');
    return Response.json({ error: 'No pudimos guardar tu correo. Inténtalo de nuevo.' }, { status: 502 });
  }
}

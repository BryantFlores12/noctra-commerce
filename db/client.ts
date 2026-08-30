import { env } from 'cloudflare:workers';
import { schemaStatements } from './schema';

type SiteBindings = Cloudflare.Env & { DB?: D1Database };

let schemaReady: Promise<void> | null = null;

export async function getDatabase() {
  const database = (env as SiteBindings).DB;
  if (!database) throw new Error('La base de datos no está configurada.');

  schemaReady ??= database.batch(
    schemaStatements.map((statement) => database.prepare(statement)),
  ).then(() => undefined);

  await schemaReady;
  return database;
}

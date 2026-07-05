import pg from 'pg';

const { Pool } = pg;

const DEFAULT_DATABASE_URL =
  'postgres://claude_clearance:claude_clearance_dev@127.0.0.1:55432/claude_clearance';

declare global {
  // eslint-disable-next-line no-var
  var __claudeClearancePool: pg.Pool | undefined;
}

export function databaseUrl(): string {
  return process.env.DATABASE_URL || DEFAULT_DATABASE_URL;
}

export function db(): pg.Pool {
  if (!globalThis.__claudeClearancePool) {
    globalThis.__claudeClearancePool = new Pool({
      connectionString: databaseUrl(),
      max: 8,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 2_000,
    });
  }
  return globalThis.__claudeClearancePool;
}

export async function withClient<T>(fn: (client: pg.PoolClient) => Promise<T>): Promise<T> {
  const client = await db().connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}

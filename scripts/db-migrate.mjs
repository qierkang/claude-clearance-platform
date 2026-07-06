import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import pg from 'pg';

const { Pool } = pg;
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const connectionString =
  process.env.DATABASE_URL ||
  'postgres://claude_clearance:claude_clearance_dev@127.0.0.1:5432/claude_clearance';

const pool = new Pool({ connectionString });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForDatabase(retries = 30) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await pool.query('SELECT 1');
      return;
    } catch (error) {
      if (attempt === retries) throw error;
      await sleep(1000);
    }
  }
}

try {
  await waitForDatabase();
  const sql = await readFile(join(root, 'db/schema.sql'), 'utf8');
  await pool.query(sql);
  console.log('DB_MIGRATE_OK');
} catch (error) {
  console.error('DB_MIGRATE_FAILED');
  console.error(error);
  process.exitCode = 1;
} finally {
  await pool.end();
}

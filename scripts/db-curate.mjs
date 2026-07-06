import pg from 'pg';

const { Pool } = pg;
const connectionString =
  process.env.DATABASE_URL ||
  'postgres://claude_clearance:claude_clearance_dev@127.0.0.1:5432/claude_clearance';

const keepMessages = Math.max(1, Math.min(10, Number(process.env.KEEP_MESSAGE_COUNT || 10)));
const totalVisits = Math.max(0, Number(process.env.TOTAL_VISITS || 520));
const pool = new Pool({ connectionString });

try {
  await pool.query('BEGIN');
  const hidden = await pool.query(
    `WITH keep AS (
       SELECT id
       FROM community_messages
       WHERE status = 'visible'
       ORDER BY created_at DESC
       LIMIT $1
     )
     UPDATE community_messages
     SET status = 'hidden', updated_at = now()
     WHERE status = 'visible'
       AND id NOT IN (SELECT id FROM keep)`,
    [keepMessages],
  );

  await pool.query(
    `INSERT INTO site_stats (key, value)
     VALUES ('total_visits', $1)
     ON CONFLICT (key) DO UPDATE
     SET value = EXCLUDED.value, updated_at = now()`,
    [totalVisits],
  );

  const visible = await pool.query(
    "SELECT count(*)::int AS count FROM community_messages WHERE status = 'visible'",
  );
  await pool.query('COMMIT');
  console.log(
    `DB_CURATE_OK visible=${visible.rows[0]?.count || 0} hidden=${hidden.rowCount || 0} totalVisits=${totalVisits}`,
  );
} catch (error) {
  await pool.query('ROLLBACK').catch(() => {});
  console.error('DB_CURATE_FAILED');
  console.error(error);
  process.exitCode = 1;
} finally {
  await pool.end();
}

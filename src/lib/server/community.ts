import { createHash, randomUUID } from 'node:crypto';
import type { AstroCookies } from 'astro';
import { db, withClient } from './db';

const VISITOR_COOKIE = 'cc_vid';
const VISIT_WINDOW_MS = 30 * 60 * 1000;
const MESSAGE_RATE_LIMIT_WINDOW_MS = 5 * 1000;
const MESSAGE_RATE_LIMIT_MAX = 2;

export interface PublicMessage {
  id: number;
  authorName: string;
  content: string;
  createdAt: string;
  source: string;
}

export interface PublicStats {
  totalVisits: number;
  totalUniqueVisitors: number;
  visits24h: number;
  messageCount: number;
}

interface RequestIdentity {
  visitorHash: string;
  ipHash: string;
  userAgentHash: string;
}

interface IdentityInput {
  request: Request;
  cookies: AstroCookies;
  secureCookie: boolean;
}

function hashText(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function firstHeader(headers: Headers, names: string[]): string {
  for (const name of names) {
    const value = headers.get(name);
    if (value) return value.split(',')[0]?.trim() || value;
  }
  return '';
}

function requestIp(request: Request): string {
  return firstHeader(request.headers, [
    'cf-connecting-ip',
    'x-real-ip',
    'x-vercel-forwarded-for',
    'x-forwarded-for',
  ]);
}

export function requestIdentity({ request, cookies, secureCookie }: IdentityInput): RequestIdentity {
  let visitorId = cookies.get(VISITOR_COOKIE)?.value || '';
  if (!visitorId || visitorId.length > 80) {
    visitorId = randomUUID();
    cookies.set(VISITOR_COOKIE, visitorId, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: secureCookie,
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  const ip = requestIp(request) || 'local';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  return {
    visitorHash: hashText(visitorId),
    ipHash: hashText(ip),
    userAgentHash: hashText(userAgent),
  };
}

function statValue(rows: Array<{ key: string; value: string | number }>, key: string): number {
  const raw = rows.find((row) => row.key === key)?.value ?? 0;
  return Number(raw) || 0;
}

export async function getStats(): Promise<PublicStats> {
  const [stats, visits24h, messageCount] = await Promise.all([
    db().query<{ key: string; value: string }>('SELECT key, value FROM site_stats'),
    db().query<{ count: string }>(
      "SELECT count(*)::text AS count FROM site_visit_events WHERE created_at >= now() - interval '24 hours'",
    ),
    db().query<{ count: string }>(
      "SELECT count(*)::text AS count FROM community_messages WHERE status = 'visible'",
    ),
  ]);

  return {
    totalVisits: statValue(stats.rows, 'total_visits'),
    totalUniqueVisitors: statValue(stats.rows, 'total_unique_visitors'),
    visits24h: Number(visits24h.rows[0]?.count || 0),
    messageCount: Number(messageCount.rows[0]?.count || 0),
  };
}

export async function listMessages(limit = 10): Promise<PublicMessage[]> {
  const safeLimit = Math.max(1, Math.min(10, Math.floor(limit)));
  const result = await db().query<{
    id: string;
    author_name: string;
    content: string;
    source: string;
    created_at: Date;
  }>(
    `SELECT id, author_name, content, source, created_at
     FROM community_messages
     WHERE status = 'visible'
     ORDER BY created_at DESC
     LIMIT $1`,
    [safeLimit],
  );

  return result.rows.map((row) => ({
    id: Number(row.id),
    authorName: row.author_name,
    content: row.content,
    source: row.source,
    createdAt: row.created_at.toISOString(),
  }));
}

function cleanText(value: unknown, fallback = ''): string {
  return String(value ?? fallback)
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function createMessage(input: {
  authorName?: unknown;
  content?: unknown;
  identity: RequestIdentity;
}): Promise<PublicMessage> {
  const authorName = cleanText(input.authorName, '匿名访客').slice(0, 48) || '匿名访客';
  const content = cleanText(input.content).slice(0, 500);
  if (content.length < 1) {
    throw Object.assign(new Error('message_empty'), { status: 400 });
  }

  return await withClient(async (client) => {
    await client.query('BEGIN');
    try {
      await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [input.identity.visitorHash]);
      const recent = await client.query<{ count: number }>(
        `SELECT count(*)::int AS count
         FROM community_messages
         WHERE visitor_hash = $1
           AND source = 'web'
           AND created_at >= now() - ($2::int || ' milliseconds')::interval`,
        [input.identity.visitorHash, MESSAGE_RATE_LIMIT_WINDOW_MS],
      );
      if (Number(recent.rows[0]?.count || 0) >= MESSAGE_RATE_LIMIT_MAX) {
        throw Object.assign(new Error('message_rate_limited'), { status: 429 });
      }

      const result = await client.query<{
        id: string;
        author_name: string;
        content: string;
        source: string;
        created_at: Date;
      }>(
        `INSERT INTO community_messages
          (author_name, content, visitor_hash, ip_hash, user_agent_hash, source)
         VALUES ($1, $2, $3, $4, $5, 'web')
         RETURNING id, author_name, content, source, created_at`,
        [
          authorName,
          content,
          input.identity.visitorHash,
          input.identity.ipHash,
          input.identity.userAgentHash,
        ],
      );
      await client.query('COMMIT');

      const row = result.rows[0];
      return {
        id: Number(row.id),
        authorName: row.author_name,
        content: row.content,
        source: row.source,
        createdAt: row.created_at.toISOString(),
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  });
}

export async function recordVisit(input: {
  identity: RequestIdentity;
  path: string;
  lang: string;
}): Promise<{ counted: boolean; newVisitor: boolean; stats: PublicStats }> {
  const windowStart = new Date(Math.floor(Date.now() / VISIT_WINDOW_MS) * VISIT_WINDOW_MS);
  const safePath = cleanText(input.path || '/', '/').slice(0, 240) || '/';
  const safeLang = cleanText(input.lang || 'unknown', 'unknown').slice(0, 16) || 'unknown';

  const result = await withClient(async (client) => {
    await client.query('BEGIN');
    try {
      const visitor = await client.query(
        `INSERT INTO site_visitors
          (visitor_hash, first_ip_hash, last_ip_hash, user_agent_hash)
         VALUES ($1, $2, $2, $3)
         ON CONFLICT (visitor_hash) DO NOTHING`,
        [input.identity.visitorHash, input.identity.ipHash, input.identity.userAgentHash],
      );
      const newVisitor = Boolean(visitor.rowCount);

      if (!newVisitor) {
        await client.query(
          `UPDATE site_visitors
           SET last_seen_at = now(), last_ip_hash = $2, user_agent_hash = $3
           WHERE visitor_hash = $1`,
          [input.identity.visitorHash, input.identity.ipHash, input.identity.userAgentHash],
        );
      }

      const event = await client.query(
        `INSERT INTO site_visit_events
          (visitor_hash, window_start, path, lang, ip_hash, user_agent_hash)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (visitor_hash, window_start, path) DO NOTHING`,
        [
          input.identity.visitorHash,
          windowStart,
          safePath,
          safeLang,
          input.identity.ipHash,
          input.identity.userAgentHash,
        ],
      );
      const counted = Boolean(event.rowCount);

      if (newVisitor) {
        await client.query(
          `INSERT INTO site_stats (key, value)
           VALUES ('total_unique_visitors', 1)
           ON CONFLICT (key) DO UPDATE
           SET value = site_stats.value + 1, updated_at = now()`,
        );
      }
      if (counted) {
        await client.query(
          `INSERT INTO site_stats (key, value)
           VALUES ('total_visits', 1)
           ON CONFLICT (key) DO UPDATE
           SET value = site_stats.value + 1, updated_at = now()`,
        );
      }

      await client.query('COMMIT');
      return { counted, newVisitor };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  });

  return { ...result, stats: await getStats() };
}

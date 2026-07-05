import type { APIRoute } from 'astro';
import { getStats, recordVisit, requestIdentity } from '../../../lib/server/community';

export const prerender = false;

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

export const GET: APIRoute = async () => {
  try {
    return json({ ok: true, stats: await getStats() });
  } catch {
    return json({ ok: false, error: 'database_unavailable' }, 503);
  }
};

export const POST: APIRoute = async ({ request, cookies, url }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const identity = requestIdentity({
      request,
      cookies,
      secureCookie: url.protocol === 'https:',
    });
    const result = await recordVisit({
      identity,
      path: String(body.path || url.searchParams.get('path') || '/'),
      lang: String(body.lang || url.searchParams.get('lang') || 'unknown'),
    });
    return json({ ok: true, ...result });
  } catch {
    return json({ ok: false, error: 'database_unavailable' }, 503);
  }
};

export const OPTIONS: APIRoute = () => new Response(null, { status: 204, headers: JSON_HEADERS });

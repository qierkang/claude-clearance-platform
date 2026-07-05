import type { APIRoute } from 'astro';
import { createMessage, getStats, listMessages, requestIdentity } from '../../lib/server/community';

export const prerender = false;

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

function errorStatus(error: unknown): number {
  const status = Number((error as { status?: unknown })?.status || 500);
  return Number.isFinite(status) && status >= 400 && status < 600 ? status : 500;
}

export const GET: APIRoute = async ({ url }) => {
  try {
    const limit = Number(url.searchParams.get('limit') || 40);
    const [messages, stats] = await Promise.all([listMessages(limit), getStats()]);
    return json({ ok: true, messages, stats });
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
    const message = await createMessage({
      authorName: body.authorName,
      content: body.content,
      identity,
    });
    const [messages, stats] = await Promise.all([listMessages(40), getStats()]);
    return json({ ok: true, message, messages, stats }, 201);
  } catch (error) {
    const status = errorStatus(error);
    const code =
      status === 429 ? 'message_rate_limited' : status === 400 ? 'message_invalid' : 'database_unavailable';
    return json({ ok: false, error: code }, status);
  }
};

export const OPTIONS: APIRoute = () => new Response(null, { status: 204, headers: JSON_HEADERS });

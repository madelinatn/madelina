import type { Env } from '../../_types';

// GET /api/images/menu/[filename] — Serve images from KV with live fallback
export async function onRequestGet(context: EventContext<Env, any, any>) {
  const url = new URL(context.request.url);
  const key = decodeURIComponent(url.pathname).replace('/api/images/', '');

  if (!key) {
    return new Response('Not found', { status: 404 });
  }

  let { value, metadata } = await context.env.IMAGES.getWithMetadata(key, { type: 'arrayBuffer' });

  if (!value) {
    try {
      const liveRes = await fetch(`https://madelina.tn/api/images/${key}`);
      if (liveRes.ok) {
        const buffer = await liveRes.arrayBuffer();
        const contentType = liveRes.headers.get('content-type') || 'image/webp';
        context.waitUntil(context.env.IMAGES.put(key, buffer, { metadata: { contentType } }));
        return new Response(buffer, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=31536000, immutable',
            'X-Content-Type-Options': 'nosniff',
          }
        });
      }
    } catch (e) {}

    return new Response('Not found: ' + key, { status: 404 });
  }

  const contentType = (metadata as any)?.contentType || 'image/webp';

  return new Response(value, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    }
  });
}

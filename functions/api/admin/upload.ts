import { checkAuth } from '../auth/check';
import type { Env } from '../_types';

// POST /api/admin/upload — Upload WebP image to KV
export async function onRequestPost(context: EventContext<Env, any, any>) {
  if (!(await checkAuth(context.request, context.env))) {
    return new Response(JSON.stringify({ error: 'Non autorisé' }), {
      status: 401, headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const formData = await context.request.formData();
    const file = formData.get('image') as File | null;
    const fileOriginal = formData.get('image_original') as File | null;
    const itemId = formData.get('itemId') as string | null;

    if (!file || !file.size) {
      return new Response(JSON.stringify({ error: 'No image provided' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    // Use the dish ID + timestamp as the KV key to avoid cache collisions
    const timestamp = Date.now();
    const key = itemId ? `menu/${itemId}-${timestamp}.webp` : `menu/plat-${timestamp}.webp`;

    // Read file as ArrayBuffer and store in KV (cropped)
    const buffer = await file.arrayBuffer();
    await context.env.IMAGES.put(key, buffer, {
      metadata: { contentType: 'image/webp', uploadedAt: timestamp }
    });

    // Store original uncropped file if provided
    if (fileOriginal && fileOriginal.size > 0) {
      const keyOriginal = itemId ? `menu/${itemId}-${timestamp}-original.webp` : `menu/plat-${timestamp}-original.webp`;
      const bufferOriginal = await fileOriginal.arrayBuffer();
      await context.env.IMAGES.put(keyOriginal, bufferOriginal, {
        metadata: { contentType: 'image/webp', uploadedAt: timestamp }
      });
    }

    // Return the public serving URL (unique path means no cache-buster parameter needed)
    const url = `/api/images/${key}`;

    return new Response(JSON.stringify({ success: true, url }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
}

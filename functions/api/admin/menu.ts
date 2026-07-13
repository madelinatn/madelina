import { checkAuth } from '../auth/check';
import type { Env } from '../_types';

// GET /api/admin/menu — Protected
export async function onRequestGet(context: EventContext<Env, any, any>) {
  if (!(await checkAuth(context.request, context.env))) {
    return new Response(JSON.stringify({ error: 'Non autorisé' }), {
      status: 401, headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { results } = await context.env.DB.prepare(
      `SELECT d.*, c.fr as category, c.en as category_en, c.is_list as category_is_list 
       FROM dishes d JOIN categories c ON d.category_id = c.id 
       ORDER BY c.order_idx ASC, d.order_idx ASC`
    ).all();

    const items = results.map((row: any) => ({
      id: row.id, category: row.category, category_en: row.category_en || '',
      category_is_list: row.category_is_list === 1,
      title: row.title_fr, title_en: row.title_en || '',
      price: row.price, image: row.image_url || '',
      description: row.description_fr || '', description_en: row.description_en || '',
      is_hidden: row.is_hidden === 1
    }));

    const { results: cats } = await context.env.DB.prepare(
      `SELECT * FROM categories ORDER BY order_idx ASC`
    ).all();

    const categories = cats.map((row: any) => ({
      fr: row.fr, en: row.en || '', isList: row.is_list === 1
    }));

    return new Response(JSON.stringify({ items, categories }), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

// POST /api/admin/menu — Protected, sync all data
export async function onRequestPost(context: EventContext<Env, any, any>) {
  if (!(await checkAuth(context.request, context.env))) {
    return new Response(JSON.stringify({ error: 'Non autorisé' }), {
      status: 401, headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await context.request.json<{ categories: any[], items: any[] }>();

    // Helper: strip ?t=... cache-busters to get the stable KV key path
    const toKey = (url: string) => decodeURIComponent(url.replace(/\?.*$/, '').replace('/api/images/', ''));

    // ── Step 1: Collect current image KV keys before deleting ──
    const { results: oldDishes } = await context.env.DB.prepare(
      'SELECT image_url FROM dishes WHERE image_url IS NOT NULL AND image_url != \'\''
    ).all();
    const oldKeys = new Set<string>();
    for (const r of oldDishes) {
      const url = (r as any).image_url as string;
      if (url.startsWith('/api/images/menu/')) {
        const key = toKey(url);
        oldKeys.add(key);
        oldKeys.add(key.replace('.webp', '-original.webp'));
      }
    }

    // ── Step 2: Save new data ──
    const statements = [];
    statements.push(context.env.DB.prepare('DELETE FROM dishes'));
    statements.push(context.env.DB.prepare('DELETE FROM categories'));

    const catMap = new Map();
    for (let i = 0; i < body.categories.length; i++) {
      const cat = body.categories[i];
      const id = `cat_${i}`;
      catMap.set(cat.fr, id);
      statements.push(context.env.DB.prepare(
        'INSERT INTO categories (id, fr, en, is_list, order_idx) VALUES (?, ?, ?, ?, ?)'
      ).bind(id, cat.fr, cat.en || null, cat.isList ? 1 : 0, i));
    }

    const newKeys = new Set<string>();
    for (let i = 0; i < body.items.length; i++) {
      const item = body.items[i];
      const category_id = catMap.get(item.category) || 'unknown';
      if (item.image && item.image.startsWith('/api/images/menu/')) {
        const key = toKey(item.image);
        newKeys.add(key);
        newKeys.add(key.replace('.webp', '-original.webp'));
      }
      statements.push(context.env.DB.prepare(
        'INSERT INTO dishes (id, category_id, title_fr, title_en, description_fr, description_en, price, image_url, order_idx, is_hidden) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(item.id, category_id, item.title, item.title_en || null,
        item.description || null, item.description_en || null,
        parseFloat(item.price) || 0, item.image || null, i, item.is_hidden ? 1 : 0));
    }

    await context.env.DB.batch(statements);

    // ── Step 3: Delete orphaned images from KV ──
    // Compare normalized KV keys (without ?t= cache-busters) to avoid false positives
    const orphanedKeys: string[] = [];
    for (const key of oldKeys) {
      if (!newKeys.has(key)) orphanedKeys.push(key);
    }

    if (orphanedKeys.length > 0) {
      await Promise.all(orphanedKeys.map(key => context.env.IMAGES.delete(key)));
    }

    return new Response(JSON.stringify({ success: true, deletedImages: orphanedKeys.length }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

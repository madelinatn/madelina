import { checkAuth } from '../auth/check';
import type { Env } from '../_types';

// GET /api/admin/stock-categories
export async function onRequestGet(context: EventContext<Env, any, any>) {
  if (!(await checkAuth(context.request, context.env))) {
    return new Response(JSON.stringify({ error: 'Non autorisé' }), {
      status: 401, headers: { 'Content-Type': 'application/json' }
    });
  }
  try {
    // Ensure table exists
    await context.env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS stock_categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        order_idx INTEGER DEFAULT 0
      )`
    ).run();

    const { results } = await context.env.DB.prepare(
      'SELECT * FROM stock_categories ORDER BY order_idx ASC, name ASC'
    ).all();

    return new Response(JSON.stringify(results || []), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

// POST /api/admin/stock-categories — sync or add categories
export async function onRequestPost(context: EventContext<Env, any, any>) {
  if (!(await checkAuth(context.request, context.env))) {
    return new Response(JSON.stringify({ error: 'Non autorisé' }), {
      status: 401, headers: { 'Content-Type': 'application/json' }
    });
  }
  try {
    await context.env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS stock_categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        order_idx INTEGER DEFAULT 0
      )`
    ).run();

    const body = await context.request.json<{
      categories: Array<{ id: string; name: string; order_idx?: number }>;
    }>();

    const incoming = body.categories || [];
    const incomingIds = new Set(incoming.map(c => c.id));

    // Get categories currently used by stock ingredients
    const { results: usedCats } = await context.env.DB.prepare(
      'SELECT DISTINCT category FROM stock_ingredients WHERE category IS NOT NULL AND category != \'\''
    ).all();
    const usedNames = new Set(usedCats.map((r: any) => r.category));

    // Delete categories that are not in incoming list AND not used by ingredients
    const { results: allCats } = await context.env.DB.prepare(
      'SELECT id, name FROM stock_categories'
    ).all();
    for (const cat of (allCats || [])) {
      const c = cat as any;
      if (!incomingIds.has(c.id) && !usedNames.has(c.name)) {
        await context.env.DB.prepare('DELETE FROM stock_categories WHERE id = ?').bind(c.id).run();
      }
    }

    // Upsert incoming categories
    for (let i = 0; i < incoming.length; i++) {
      const cat = incoming[i];
      const name = (cat.name || '').trim();
      if (!name) continue;
      const id = cat.id || ('scat_' + Date.now() + '_' + i);
      const order_idx = typeof cat.order_idx === 'number' ? cat.order_idx : i;
      await context.env.DB.prepare(
        `INSERT INTO stock_categories (id, name, order_idx) VALUES (?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET name = excluded.name, order_idx = excluded.order_idx`
      ).bind(id, name, order_idx).run();
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

import { checkAuth } from '../auth/check';
import type { Env } from '../_types';

// GET /api/admin/recipe-categories
export async function onRequestGet(context: EventContext<Env, any, any>) {
  if (!(await checkAuth(context.request, context.env))) {
    return new Response(JSON.stringify({ error: 'Non autorisé' }), {
      status: 401, headers: { 'Content-Type': 'application/json' }
    });
  }
  try {
    const { results } = await context.env.DB.prepare(
      'SELECT * FROM recipe_categories ORDER BY order_idx ASC'
    ).all();
    return new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

// POST /api/admin/recipe-categories — sync all categories
export async function onRequestPost(context: EventContext<Env, any, any>) {
  if (!(await checkAuth(context.request, context.env))) {
    return new Response(JSON.stringify({ error: 'Non autorisé' }), {
      status: 401, headers: { 'Content-Type': 'application/json' }
    });
  }
  try {
    const body = await context.request.json<{
      categories: Array<{ id: string; name: string; order_idx: number }>;
    }>();

    // Keep categories that have recipes; only delete orphaned ones
    const { results: usedCats } = await context.env.DB.prepare(
      'SELECT DISTINCT category_id FROM recipes'
    ).all();
    const usedIds = new Set(usedCats.map((r: any) => r.category_id));
    const incomingIds = new Set(body.categories.map(c => c.id));

    // Delete categories that are not used AND not in incoming list
    const { results: allCats } = await context.env.DB.prepare(
      'SELECT id FROM recipe_categories'
    ).all();
    for (const cat of allCats) {
      const catId = (cat as any).id;
      if (!incomingIds.has(catId) && !usedIds.has(catId)) {
        await context.env.DB.prepare('DELETE FROM recipe_categories WHERE id = ?').bind(catId).run();
      }
    }

    // Upsert all incoming categories
    for (const cat of body.categories) {
      await context.env.DB.prepare(
        `INSERT INTO recipe_categories (id, name, order_idx) VALUES (?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET name = excluded.name, order_idx = excluded.order_idx`
      ).bind(cat.id, cat.name, cat.order_idx).run();
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

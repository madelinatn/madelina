import { checkAuth } from '../auth/check';
import type { Env } from '../_types';

export async function onRequestGet(context: EventContext<Env, any, any>) {
  if (!(await checkAuth(context.request, context.env))) {
    return new Response(JSON.stringify({ error: 'Non autorisé' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '500', 10), 1), 2000);
    const ingredientId = url.searchParams.get('ingredient_id');

    let query = 'SELECT * FROM stock_history';
    let params: any[] = [];

    if (ingredientId) {
      query += ' WHERE ingredient_id = ? ORDER BY created_at DESC LIMIT ?';
      params = [ingredientId, limit];
    } else {
      query += ' ORDER BY created_at DESC LIMIT ?';
      params = [limit];
    }

    const stmt = context.env.DB.prepare(query);
    const { results } = await stmt.bind(...params).all();

    return new Response(JSON.stringify({ history: results || [] }), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

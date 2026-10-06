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
    const url = new URL(context.request.url);
    const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '500', 10), 1), 2000);
    const ingredientId = url.searchParams.get('ingredient_id');

    let query = 'SELECT * FROM stock_history';
    let countQuery = 'SELECT COUNT(*) as total FROM stock_history';
    let params: any[] = [];
    let countParams: any[] = [];

    if (ingredientId) {
      query += ' WHERE ingredient_id = ? ORDER BY created_at DESC LIMIT ?';
      countQuery += ' WHERE ingredient_id = ?';
      params = [ingredientId, limit];
      countParams = [ingredientId];
    } else {
      query += ' ORDER BY created_at DESC LIMIT ?';
      params = [limit];
    }

    const [{ results }, countRow] = await Promise.all([
      context.env.DB.prepare(query).bind(...params).all(),
      context.env.DB.prepare(countQuery).bind(...countParams).first<{ total: number }>()
    ]);

    return new Response(JSON.stringify({
      history: results || [],
      total: countRow?.total ?? 0,
      limit
    }), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}



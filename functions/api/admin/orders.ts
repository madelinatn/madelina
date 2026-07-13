import { checkAuth } from '../auth/check';
import type { Env } from '../_types';

// GET /api/admin/orders — returns all orders (last 30 days), newest first
export async function onRequestGet(context: EventContext<Env, any, any>) {
  if (!(await checkAuth(context.request, context.env))) {
    return new Response(JSON.stringify({ error: 'Non autorisé' }), {
      status: 401, headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Purge old orders
    await context.env.DB.prepare(
      `DELETE FROM orders WHERE created_at < datetime('now', '-30 days')`
    ).run();

    const { results } = await context.env.DB.prepare(
      `SELECT * FROM orders
       ORDER BY created_at DESC`
    ).all();

    return new Response(JSON.stringify({ orders: results }), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

// PATCH /api/admin/orders — update order status
export async function onRequestPatch(context: EventContext<Env, any, any>) {
  if (!(await checkAuth(context.request, context.env))) {
    return new Response(JSON.stringify({ error: 'Non autorisé' }), {
      status: 401, headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { id, status } = await context.request.json<{ id: number; status: string }>();
    const validStatuses = ['new', 'preparing', 'served', 'paid'];
    if (!validStatuses.includes(status)) {
      return new Response(JSON.stringify({ error: 'Statut invalide' }), { status: 400 });
    }

    await context.env.DB.prepare(
      `UPDATE orders SET status = ? WHERE id = ?`
    ).bind(status, id).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

// DELETE /api/admin/orders?id=X — delete a specific order
export async function onRequestDelete(context: EventContext<Env, any, any>) {
  if (!(await checkAuth(context.request, context.env))) {
    return new Response(JSON.stringify({ error: 'Non autorisé' }), {
      status: 401, headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const url = new URL(context.request.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return new Response(JSON.stringify({ error: 'ID requis' }), { status: 400 });
    }

    await context.env.DB.prepare(`DELETE FROM orders WHERE id = ?`).bind(id).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

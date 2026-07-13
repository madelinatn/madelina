import type { Env } from './_types';

// POST /api/orders — public endpoint for customers to submit orders
export async function onRequestPost(context: EventContext<Env, any, any>) {
  try {
    const body = await context.request.json<{
      customer: string;
      table_num: number;
      items: { id: string; title: string; qty: number; price: number }[];
    }>();

    const { customer, table_num, items } = body;

    if (!customer?.trim()) {
      return new Response(JSON.stringify({ error: 'Prénom requis' }), { status: 400 });
    }
    if (!table_num || table_num < 1 || table_num > 20) {
      return new Response(JSON.stringify({ error: 'Numéro de table invalide' }), { status: 400 });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: 'Panier vide' }), { status: 400 });
    }

    const total = items.reduce((sum, it) => sum + (it.qty * it.price), 0);

    // Insert order
    await context.env.DB.prepare(
      `INSERT INTO orders (customer, table_num, items, total, status)
       VALUES (?, ?, ?, ?, 'new')`
    ).bind(
      customer.trim(),
      table_num,
      JSON.stringify(items),
      Math.round(total * 1000) / 1000
    ).run();

    // Auto-cleanup: delete orders older than 30 days
    await context.env.DB.prepare(
      `DELETE FROM orders WHERE created_at < datetime('now', '-30 days')`
    ).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

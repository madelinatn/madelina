import type { Env } from './_types';

export async function onRequestGet(context: EventContext<Env, any, any>) {
  try {
    const { results } = await context.env.DB.prepare(
      `SELECT d.*, c.fr as category, c.en as category_en, c.is_list as category_is_list 
       FROM dishes d 
       JOIN categories c ON d.category_id = c.id 
       WHERE d.is_hidden = 0
       ORDER BY c.order_idx ASC, d.order_idx ASC`
    ).all();

    // Map the database rows back to the frontend expected format
    const items = results.map((row: any) => ({
      id: row.id,
      category: row.category,
      category_en: row.category_en || '',
      category_is_list: row.category_is_list === 1,
      title: row.title_fr,
      title_en: row.title_en || '',
      price: row.price,
      image: row.image_url || '',
      description: row.description_fr || '',
      description_en: row.description_en || ''
    }));

    return new Response(JSON.stringify(items), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

import { checkAuth } from '../../auth/check';
import type { Env } from '../../_types';

// PUT /api/admin/recipes/:id — update recipe
export async function onRequestPut(context: EventContext<Env, any, any>) {
  if (!(await checkAuth(context.request, context.env))) {
    return new Response(JSON.stringify({ error: 'Non autorisé' }), {
      status: 401, headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { id } = context.params as { id: string };
    const body = await context.request.json<{
      name: string;
      category_id: string;
      description?: string;
      base_description?: string;
      base_type?: string;
      base_dim1?: number;
      base_dim2?: number;
      base_portions?: number;
      base_unit?: string;
      parts?: any[] | null;
      ingredients: Array<{ id: string; name: string; quantity: number; unit: string; order_idx: number }>;
    }>();

    const {
      name, category_id,
      description = '', base_description = '',
      base_type = 'dimension', base_dim1 = 20, base_dim2 = 20,
      base_portions = 6, base_unit = 'cm',
      parts = null, ingredients = []
    } = body;

    const partsJson = parts && parts.length > 0 ? JSON.stringify(parts) : '';

    await context.env.DB.prepare(
      `UPDATE recipes
       SET name = ?, category_id = ?, description = ?, base_description = ?, base_type = ?, base_dim1 = ?, base_dim2 = ?, base_portions = ?, base_unit = ?, parts = ?
       WHERE id = ?`
    ).bind(name, category_id, description, base_description, base_type, base_dim1, base_dim2, base_portions, base_unit, partsJson, id).run();

    // Replace all ingredients
    await context.env.DB.prepare('DELETE FROM recipe_ingredients WHERE recipe_id = ?').bind(id).run();

    const allIngredients = parts && parts.length > 0
      ? parts.flatMap((p: any, pi: number) =>
          (p.ingredients || []).map((ing: any, ii: number) => ({
            id: `ing_${Date.now()}_${pi}_${ii}`,
            name: ing.name, quantity: ing.quantity, unit: ing.unit,
            order_idx: pi * 1000 + ii
          })))
      : ingredients;

    for (const ing of allIngredients) {
      if (!ing.name) continue;
      const ingId = ing.id || (`ing_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`);
      await context.env.DB.prepare(
        `INSERT INTO recipe_ingredients (id, recipe_id, name, quantity, unit, order_idx) VALUES (?, ?, ?, ?, ?, ?)`
      ).bind(ingId, id, ing.name, ing.quantity, ing.unit, ing.order_idx).run();
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

// DELETE /api/admin/recipes/:id — delete recipe
export async function onRequestDelete(context: EventContext<Env, any, any>) {
  if (!(await checkAuth(context.request, context.env))) {
    return new Response(JSON.stringify({ error: 'Non autorisé' }), {
      status: 401, headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { id } = context.params as { id: string };
    await context.env.DB.prepare('DELETE FROM recipe_ingredients WHERE recipe_id = ?').bind(id).run();
    await context.env.DB.prepare('DELETE FROM recipes WHERE id = ?').bind(id).run();
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

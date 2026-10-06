import { getAuthUser, checkAuth } from '../auth/check';
import type { Env } from '../_types';

// GET /api/admin/recipes — list all recipes + categories (filtered if staff)
export async function onRequestGet(context: EventContext<Env, any, any>) {
  const user = await getAuthUser(context.request, context.env);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Non autorisé' }), {
      status: 401, headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { results: cats } = await context.env.DB.prepare(
      'SELECT * FROM recipe_categories ORDER BY order_idx ASC'
    ).all();

    const { results: recipes } = await context.env.DB.prepare(`
      SELECT r.*, rc.name as category_name
      FROM recipes r
      LEFT JOIN recipe_categories rc ON r.category_id = rc.id
      ORDER BY rc.order_idx ASC, r.name ASC
    `).all();

    const { results: ingredients } = await context.env.DB.prepare(
      'SELECT * FROM recipe_ingredients ORDER BY recipe_id, order_idx ASC'
    ).all();

    let recipesWithIngredients = recipes.map((r: any) => ({
      ...r,
      parts: r.parts ? (() => { try { return JSON.parse(r.parts); } catch(e) { return null; } })() : null,
      ingredients: ingredients.filter((i: any) => i.recipe_id === r.id)
    }));

    // If staff, filter by allowed categories
    if (user.role === 'staff' && user.allowed_categories && user.allowed_categories !== '*') {
      try {
        const allowedArr: string[] = JSON.parse(user.allowed_categories);
        recipesWithIngredients = recipesWithIngredients.filter((r: any) =>
          allowedArr.includes(r.category_id)
        );
      } catch (e) {
        // fallback
      }
    }

    return new Response(JSON.stringify({
      recipes: recipesWithIngredients,
      categories: cats,
      user: {
        username: user.username,
        name: user.name,
        role: user.role,
        allowed_categories: user.allowed_categories
      }
    }), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

// POST /api/admin/recipes — create new recipe
export async function onRequestPost(context: EventContext<Env, any, any>) {
  if (!(await checkAuth(context.request, context.env))) {
    return new Response(JSON.stringify({ error: 'Non autorisé' }), {
      status: 401, headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await context.request.json<{
      id: string;
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
      id, name, category_id,
      description = '', base_description = '',
      base_type = 'dimension', base_dim1 = 20, base_dim2 = 20,
      base_portions = 6, base_unit = 'cm',
      parts = null, ingredients = []
    } = body;

    const partsJson = parts && parts.length > 0 ? JSON.stringify(parts) : '';

    await context.env.DB.prepare(
      `INSERT INTO recipes (id, name, category_id, description, base_description, base_type, base_dim1, base_dim2, base_portions, base_unit, parts)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(id, name, category_id, description, base_description, base_type, base_dim1, base_dim2, base_portions, base_unit, partsJson).run();

    // Flatten all parts ingredients for recipe_ingredients table (backward compat + scaling)
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
      await context.env.DB.prepare(
        `INSERT INTO recipe_ingredients (id, recipe_id, name, quantity, unit, order_idx) VALUES (?, ?, ?, ?, ?, ?)`
      ).bind(ing.id, id, ing.name, ing.quantity, ing.unit, ing.order_idx).run();
    }

    return new Response(JSON.stringify({ success: true, id }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

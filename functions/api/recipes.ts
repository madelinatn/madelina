import { checkAuth, checkStaffAuth } from './auth/check';
import type { Env } from './_types';

// GET /api/recipes — Staff + Admin read-only
export async function onRequestGet(context: EventContext<Env, any, any>) {
  const { request, env } = context;
  const isAdmin = await checkAuth(request, env);
  const isStaff = await checkStaffAuth(request, env);

  if (!isAdmin && !isStaff) {
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

    const recipesWithIngredients = recipes.map((r: any) => ({
      ...r,
      ingredients: ingredients.filter((i: any) => i.recipe_id === r.id)
    }));

    return new Response(JSON.stringify({ recipes: recipesWithIngredients, categories: cats }), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

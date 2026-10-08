import { checkAuth, checkStaffAuth } from '../auth/check';
import type { Env } from '../_types';

// GET /api/admin/stock — list all stock ingredients (Accessible to Staff for recipe preparation and Admin)
export async function onRequestGet(context: EventContext<Env, any, any>) {
  if (!(await checkStaffAuth(context.request, context.env))) {
    return new Response(JSON.stringify({ error: 'Non autorisé' }), {
      status: 401, headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { results } = await context.env.DB.prepare(
      'SELECT * FROM stock_ingredients ORDER BY category ASC, name ASC'
    ).all();

    return new Response(JSON.stringify({ stock: results }), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

// POST /api/admin/stock — create a new stock ingredient
export async function onRequestPost(context: EventContext<Env, any, any>) {
  if (!(await checkAuth(context.request, context.env))) {
    return new Response(JSON.stringify({ error: 'Non autorisé' }), {
      status: 401, headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await context.request.json<{
      name: string;
      unit: string;
      stock_qty?: number;
      price_per_unit?: number;
      category?: string;
    }>();

    const name = (body.name || '').trim();
    if (!name) {
      return new Response(JSON.stringify({ error: 'Nom requis' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    const id = 'stk_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const unit = (body.unit || 'g').trim();
    const stock_qty = typeof body.stock_qty === 'number' ? body.stock_qty : 0;
    const price_per_unit = typeof body.price_per_unit === 'number' ? body.price_per_unit : 0;
    const category = (body.category || '').trim();

    await context.env.DB.prepare(
      `INSERT INTO stock_ingredients (id, name, unit, stock_qty, price_per_unit, category, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`
    ).bind(id, name, unit, stock_qty, price_per_unit, category).run();

    return new Response(JSON.stringify({ success: true, id }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

// PUT /api/admin/stock — update a stock ingredient
export async function onRequestPut(context: EventContext<Env, any, any>) {
  if (!(await checkAuth(context.request, context.env))) {
    return new Response(JSON.stringify({ error: 'Non autorisé' }), {
      status: 401, headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await context.request.json<{
      id: string;
      name?: string;
      unit?: string;
      stock_qty?: number;
      price_per_unit?: number;
      category?: string;
    }>();

    if (!body.id) {
      return new Response(JSON.stringify({ error: 'ID requis' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    const existing = await context.env.DB.prepare(
      'SELECT * FROM stock_ingredients WHERE id = ?'
    ).bind(body.id).first<any>();

    if (!existing) {
      return new Response(JSON.stringify({ error: 'Ingrédient non trouvé' }), {
        status: 404, headers: { 'Content-Type': 'application/json' }
      });
    }

    const name = body.name !== undefined ? body.name.trim() : existing.name;
    const unit = body.unit !== undefined ? body.unit.trim() : existing.unit;
    const stock_qty = body.stock_qty !== undefined ? body.stock_qty : existing.stock_qty;
    const price_per_unit = body.price_per_unit !== undefined ? body.price_per_unit : existing.price_per_unit;
    const category = body.category !== undefined ? body.category.trim() : existing.category;

    await context.env.DB.prepare(
      `UPDATE stock_ingredients SET name=?, unit=?, stock_qty=?, price_per_unit=?, category=?, updated_at=datetime('now') WHERE id=?`
    ).bind(name, unit, stock_qty, price_per_unit, category, body.id).run();

    // Cascade name and unit changes to recipe_ingredients
    const oldName = existing.name;
    const oldUnit = existing.unit;
    if (name !== oldName || unit !== oldUnit) {
      await context.env.DB.prepare(
        `UPDATE recipe_ingredients SET name=?, unit=? WHERE name=? AND unit=?`
      ).bind(name, unit, oldName, oldUnit).run();

      // Also update ingredient names stored inside the recipes.parts JSON
      if (name !== oldName) {
        const { results: recipesWithParts } = await context.env.DB.prepare(
          `SELECT id, parts FROM recipes WHERE parts IS NOT NULL AND parts != ''`
        ).all<{ id: string; parts: string }>();

        for (const recipe of recipesWithParts) {
          try {
            const parts = JSON.parse(recipe.parts);
            let changed = false;
            for (const part of parts) {
              for (const ing of (part.ingredients || [])) {
                if (ing.name === oldName) {
                  ing.name = name;
                  if (unit !== oldUnit) ing.unit = unit;
                  changed = true;
                }
              }
            }
            if (changed) {
              await context.env.DB.prepare(
                `UPDATE recipes SET parts=? WHERE id=?`
              ).bind(JSON.stringify(parts), recipe.id).run();
            }
          } catch (_) {}
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

// DELETE /api/admin/stock — delete a stock ingredient
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
      return new Response(JSON.stringify({ error: 'ID requis' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if ingredient is used in any recipe before deleting
    const ingredient = await context.env.DB.prepare(
      'SELECT name FROM stock_ingredients WHERE id = ?'
    ).bind(id).first<{ name: string }>();

    if (ingredient) {
      // Check in recipe_ingredients table
      const usedIn = await context.env.DB.prepare(
        `SELECT ri.name as ing_name, r.name as recipe_name
         FROM recipe_ingredients ri
         JOIN recipes r ON ri.recipe_id = r.id
         WHERE ri.name = ?
         LIMIT 5`
      ).bind(ingredient.name).all<{ ing_name: string; recipe_name: string }>();

      if (usedIn.results && usedIn.results.length > 0) {
        const recipeNames = usedIn.results.map((r: any) => r.recipe_name).join(', ');
        return new Response(JSON.stringify({
          error: `Impossible de supprimer : cet ingrédient est utilisé dans ${usedIn.results.length} recette(s) : ${recipeNames}`,
          recipes: usedIn.results.map((r: any) => r.recipe_name)
        }), { status: 409, headers: { 'Content-Type': 'application/json' } });
      }
    }

    await context.env.DB.prepare('DELETE FROM stock_ingredients WHERE id = ?').bind(id).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

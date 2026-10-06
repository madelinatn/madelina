import { checkStaffAuth } from '../auth/check';
import type { Env } from '../_types';

interface AdjustItem {
  ingredient_id: string;
  delta: number;
  note?: string;
  action_type?: string;
}

const INFINITE_STOCK_THRESHOLD = 99999990;

async function handleAdjust(context: EventContext<Env, any, any>) {
  if (!(await checkStaffAuth(context.request, context.env))) {
    return new Response(JSON.stringify({ error: 'Non autorisé' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await context.request.json<{
      ingredient_id?: string;
      delta?: number;
      note?: string;
      action_type?: string;
      items?: AdjustItem[];
    }>();

    // ── BATCH MODE ──
    if (Array.isArray(body.items) && body.items.length > 0) {
      const items = body.items.filter(i => i.ingredient_id && typeof i.delta === 'number' && i.delta !== 0);
      if (items.length === 0) {
        return new Response(JSON.stringify({ error: 'Aucun élément valide à ajuster' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const ids = Array.from(new Set(items.map(i => i.ingredient_id)));
      const placeholders = ids.map(() => '?').join(',');
      const { results } = await context.env.DB.prepare(
        `SELECT * FROM stock_ingredients WHERE id IN (${placeholders})`
      ).bind(...ids).all();

      const itemMap = new Map<string, any>();
      (results || []).forEach((row: any) => itemMap.set(row.id, { ...row }));

      const statements: any[] = [];
      let updatedCount = 0;

      for (const reqItem of items) {
        const dbItem = itemMap.get(reqItem.ingredient_id);
        if (!dbItem) continue;

        const qtyBefore = parseFloat(dbItem.stock_qty) || 0;
        const isInfinite = qtyBefore >= INFINITE_STOCK_THRESHOLD;
        const qtyAfter = isInfinite
          ? qtyBefore
          : Math.round((qtyBefore + reqItem.delta) * 1000) / 1000;
        const actualChange = Math.round(reqItem.delta * 1000) / 1000;
        const histId = 'sh_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

        statements.push(
          context.env.DB.prepare(
            `UPDATE stock_ingredients SET stock_qty = ?, updated_at = datetime('now') WHERE id = ?`
          ).bind(qtyAfter, reqItem.ingredient_id)
        );

        statements.push(
          context.env.DB.prepare(
            `INSERT INTO stock_history (id, ingredient_id, ingredient_name, unit, qty_before, qty_change, qty_after, action_type, note, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
          ).bind(
            histId,
            reqItem.ingredient_id,
            dbItem.name,
            dbItem.unit || '',
            qtyBefore,
            actualChange,
            qtyAfter,
            reqItem.action_type || 'recipe',
            (reqItem.note || '').trim()
          )
        );

        dbItem.stock_qty = qtyAfter;
        updatedCount++;
      }

      if (statements.length > 0) {
        await context.env.DB.batch(statements);
      }

      return new Response(JSON.stringify({
        success: true,
        batch: true,
        count: updatedCount
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // ── SINGLE ITEM MODE ──
    if (!body.ingredient_id || typeof body.delta !== 'number') {
      return new Response(JSON.stringify({ error: 'ingredient_id et delta requis' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const item = await context.env.DB.prepare(
      'SELECT * FROM stock_ingredients WHERE id = ?'
    ).bind(body.ingredient_id).first<any>();

    if (!item) {
      return new Response(JSON.stringify({ error: 'Ingrédient non trouvé' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const qtyBefore = parseFloat(item.stock_qty) || 0;
    const isInfinite = qtyBefore >= INFINITE_STOCK_THRESHOLD;
    const qtyAfter = isInfinite
      ? qtyBefore
      : Math.round((qtyBefore + body.delta) * 1000) / 1000;
    const actualChange = Math.round(body.delta * 1000) / 1000;

    const histId = 'sh_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    await context.env.DB.batch([
      context.env.DB.prepare(
        `UPDATE stock_ingredients SET stock_qty = ?, updated_at = datetime('now') WHERE id = ?`
      ).bind(qtyAfter, body.ingredient_id),
      context.env.DB.prepare(
        `INSERT INTO stock_history (id, ingredient_id, ingredient_name, unit, qty_before, qty_change, qty_after, action_type, note, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
      ).bind(
        histId,
        body.ingredient_id,
        item.name,
        item.unit || '',
        qtyBefore,
        actualChange,
        qtyAfter,
        body.action_type || 'adjust',
        (body.note || '').trim()
      )
    ]);

    return new Response(JSON.stringify({
      success: true,
      id: body.ingredient_id,
      name: item.name,
      unit: item.unit,
      qty_before: qtyBefore,
      qty_after: qtyAfter,
      qty_change: actualChange
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

export const onRequestPatch = handleAdjust;
export const onRequestPost = handleAdjust;

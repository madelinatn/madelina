import { checkAuth } from '../auth/check';
import type { Env } from '../_types';

// GET /api/admin/franchise — Protected: list all franchise applications
export async function onRequestGet(context: EventContext<Env, any, any>) {
  if (!(await checkAuth(context.request, context.env))) {
    return new Response(JSON.stringify({ error: 'Non autorisé' }), {
      status: 401, headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { results } = await context.env.DB.prepare(
      `SELECT * FROM franchise_applications ORDER BY submitted_at DESC`
    ).all();

    return new Response(JSON.stringify({ applications: results }), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
}

// PATCH /api/admin/franchise — Protected: update application status
export async function onRequestPatch(context: EventContext<Env, any, any>) {
  if (!(await checkAuth(context.request, context.env))) {
    return new Response(JSON.stringify({ error: 'Non autorisé' }), {
      status: 401, headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await context.request.json<{ id: number; status: string }>();
    const validStatuses = ['new', 'contacted', 'approved', 'rejected'];

    if (!body.id || !validStatuses.includes(body.status)) {
      return new Response(JSON.stringify({ error: 'Données invalides.' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    await context.env.DB.prepare(
      `UPDATE franchise_applications SET status = ? WHERE id = ?`
    ).bind(body.status, body.id).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
}

// DELETE /api/admin/franchise — Protected: delete an application
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
      return new Response(JSON.stringify({ error: 'ID manquant.' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    await context.env.DB.prepare(
      `DELETE FROM franchise_applications WHERE id = ?`
    ).bind(parseInt(id)).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
}

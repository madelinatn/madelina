import { checkAuth, hashPassword } from '../auth/check';
import type { Env } from '../_types';

// GET /api/admin/users — list all users
export async function onRequestGet(context: EventContext<Env, any, any>) {
  if (!(await checkAuth(context.request, context.env))) {
    return new Response(JSON.stringify({ error: 'Non autorisé' }), {
      status: 401, headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { results } = await context.env.DB.prepare(
      'SELECT id, username, name, role, allowed_categories, is_active, created_at FROM users ORDER BY created_at ASC'
    ).all();

    return new Response(JSON.stringify({ users: results }), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

// POST /api/admin/users — create a new user
export async function onRequestPost(context: EventContext<Env, any, any>) {
  if (!(await checkAuth(context.request, context.env))) {
    return new Response(JSON.stringify({ error: 'Non autorisé' }), {
      status: 401, headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await context.request.json<{
      username: string;
      password: string;
      name: string;
      role: 'admin' | 'staff';
      allowed_categories?: string | string[];
      is_active?: number;
    }>();

    const username = (body.username || '').trim().toLowerCase();
    const name = (body.name || body.username || '').trim();
    const password = body.password || '';
    const role = body.role === 'admin' ? 'admin' : 'staff';
    const isActive = 1;

    if (!username || !password) {
      return new Response(JSON.stringify({ error: 'Nom d\'utilisateur et mot de passe requis' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if username already exists
    const existing = await context.env.DB.prepare(
      'SELECT id FROM users WHERE LOWER(username) = LOWER(?)'
    ).bind(username).first();

    if (existing) {
      return new Response(JSON.stringify({ error: 'Ce nom d\'utilisateur existe déjà' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    const id = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const passwordHash = await hashPassword(password);
    
    let allowedCats = '*';
    if (role === 'staff' && body.allowed_categories) {
      if (Array.isArray(body.allowed_categories)) {
        allowedCats = JSON.stringify(body.allowed_categories);
      } else {
        allowedCats = body.allowed_categories;
      }
    }

    await context.env.DB.prepare(
      `INSERT INTO users (id, username, password_hash, name, role, allowed_categories, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(id, username, passwordHash, name, role, allowedCats, isActive).run();

    return new Response(JSON.stringify({ success: true, id }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

// PUT /api/admin/users — update a user
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
      password?: string;
      role?: 'admin' | 'staff';
      allowed_categories?: string | string[];
      is_active?: number;
    }>();

    if (!body.id) {
      return new Response(JSON.stringify({ error: 'ID utilisateur manquant' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    const user = await context.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(body.id).first<any>();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Utilisateur non trouvé' }), {
        status: 404, headers: { 'Content-Type': 'application/json' }
      });
    }

    // STRICT ADMIN PROTECTION: Nobody can change admin's password or details!
    if (user.role === 'admin' || user.username.toLowerCase() === 'haifa' || user.username.toLowerCase() === 'admin') {
      return new Response(JSON.stringify({ error: 'Le compte administrateur est strictement protégé et ne peut pas être modifié' }), {
        status: 403, headers: { 'Content-Type': 'application/json' }
      });
    }

    const name = body.name !== undefined ? body.name.trim() : user.name;
    const role = body.role !== undefined ? (body.role === 'admin' ? 'admin' : 'staff') : user.role;
    const isActive = 1;

    let allowedCats = user.allowed_categories;
    if (body.allowed_categories !== undefined) {
      if (Array.isArray(body.allowed_categories)) {
        allowedCats = JSON.stringify(body.allowed_categories);
      } else {
        allowedCats = body.allowed_categories;
      }
    }
    if (role === 'admin') allowedCats = '*';

    if (body.password && body.password.trim()) {
      const passwordHash = await hashPassword(body.password.trim());
      await context.env.DB.prepare(
        `UPDATE users SET name = ?, role = ?, allowed_categories = ?, is_active = ?, password_hash = ? WHERE id = ?`
      ).bind(name, role, allowedCats, isActive, passwordHash, body.id).run();
    } else {
      await context.env.DB.prepare(
        `UPDATE users SET name = ?, role = ?, allowed_categories = ?, is_active = ? WHERE id = ?`
      ).bind(name, role, allowedCats, isActive, body.id).run();
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

// DELETE /api/admin/users — delete a user
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

    const user = await context.env.DB.prepare('SELECT username, role FROM users WHERE id = ?').bind(id).first<any>();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Utilisateur non trouvé' }), { status: 404 });
    }

    // STRICT ADMIN PROTECTION: Nobody can delete an admin account!
    if (user.role === 'admin' || user.username.toLowerCase() === 'haifa' || user.username.toLowerCase() === 'admin') {
      return new Response(JSON.stringify({ error: 'Le compte administrateur est strictement protégé et ne peut pas être supprimé' }), {
        status: 403, headers: { 'Content-Type': 'application/json' }
      });
    }

    await context.env.DB.prepare('DELETE FROM users WHERE id = ?').bind(id).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

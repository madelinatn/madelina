import type { Env } from '../_types';
import { hashPassword, createSessionToken } from './check';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;
    const body = await request.json<{ username?: string; password?: string }>();
    
    const inputUser = (body.username || '').trim();
    const inputPass = body.password || '';

    if (!inputUser || !inputPass) {
      return new Response(JSON.stringify({ error: 'Veuillez saisir le nom d\'utilisateur et le mot de passe' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const defaultAdminUser = (env.ADMIN_USER || 'haifa').toLowerCase();
    const defaultAdminPass = env.ADMIN_PASSWORD || 'madelina2000';
    const secret = env.ADMIN_PASSWORD || 'madelina2000';

    let authenticatedUser: {
      id: string;
      username: string;
      name: string;
      role: 'admin' | 'staff';
      allowed_categories: string;
    } | null = null;

    // 1. Try querying D1 users table
    try {
      const user = await env.DB.prepare(
        'SELECT * FROM users WHERE LOWER(username) = LOWER(?)'
      ).bind(inputUser).first<any>();

      if (user) {
        if (user.is_active === 0) {
          return new Response(JSON.stringify({ error: 'Ce compte est désactivé. Veuillez contacter la direction.' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const hashed = await hashPassword(inputPass);
        if (user.password_hash === hashed) {
          authenticatedUser = {
            id: user.id,
            username: user.username,
            name: user.name,
            role: user.role === 'admin' ? 'admin' : 'staff',
            allowed_categories: user.allowed_categories || '*'
          };
        }
      }
    } catch (dbErr) {
      console.error('D1 user lookup error:', dbErr);
    }

    // 2. Fallback to default admin env variables if not authenticated via D1
    if (!authenticatedUser) {
      if (inputUser.toLowerCase() === defaultAdminUser && inputPass === defaultAdminPass) {
        authenticatedUser = {
          id: 'user_admin',
          username: 'haifa',
          name: 'Haifa',
          role: 'admin',
          allowed_categories: '*'
        };
      }
    }

    if (!authenticatedUser) {
      return new Response(JSON.stringify({ error: 'Identifiant ou mot de passe incorrect' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate signed session token
    const token = await createSessionToken(authenticatedUser, secret);

    return new Response(JSON.stringify({
      success: true,
      user: {
        username: authenticatedUser.username,
        name: authenticatedUser.name,
        role: authenticatedUser.role,
        allowed_categories: authenticatedUser.allowed_categories
      }
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `auth_token=${token}; HttpOnly; Secure; Path=/; Max-Age=${60 * 60 * 24 * 14}; SameSite=Lax`
      }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: 'Erreur serveur: ' + (e.message || 'inconnue') }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

import type { Env } from '../_types';
import { hashToken } from './check';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;
    const body = await request.json<{ password?: string }>();
    const correctPassword = env.ADMIN_PASSWORD || 'yucca2000';
    if (body.password !== correctPassword) {
      return new Response(JSON.stringify({ error: 'Mot de passe incorrect' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Simple secure token: hash the password with a timestamp
    const token = await hashToken(correctPassword);
    
    return new Response(JSON.stringify({ success: true }), {
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `auth_token=${token}; HttpOnly; Secure; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Strict`
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Erreur serveur' }), { status: 500 });
  }
};

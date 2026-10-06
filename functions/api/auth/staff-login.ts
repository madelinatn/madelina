import type { Env } from '../_types';
import { hashStaffToken } from './staff-check';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;
    const body = await request.json<{ username?: string; password?: string }>();

    const correctUser = env.STAFF_USER || 'staff';
    const correctPassword = env.STAFF_PASSWORD || 'staff2000';

    if (body.username !== correctUser || body.password !== correctPassword) {
      return new Response(JSON.stringify({ error: 'Identifiant ou mot de passe incorrect' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const token = await hashStaffToken(correctPassword);

    return new Response(JSON.stringify({ success: true }), {
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `staff_token=${token}; HttpOnly; Secure; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Strict`
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Erreur serveur' }), { status: 500 });
  }
};

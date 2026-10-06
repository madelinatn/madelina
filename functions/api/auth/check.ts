import type { Env } from '../_types';

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'staff';
  allowed_categories: string; // '*' or JSON array string '["cat_id1", "cat_id2"]'
}

export async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password + '_madelina_admin');
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Backwards compatibility alias
export const hashToken = hashPassword;

export async function createSessionToken(user: AuthUser, secret: string): Promise<string> {
  const payload = JSON.stringify({
    ...user,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 14 // 14 days
  });
  const b64 = btoa(unescape(encodeURIComponent(payload)));
  const sigData = new TextEncoder().encode(b64 + ':' + secret + '_sig_salt');
  const sigHash = await crypto.subtle.digest('SHA-256', sigData);
  const sig = Array.from(new Uint8Array(sigHash)).map(b => b.toString(16).padStart(2, '0')).join('');
  return `${b64}.${sig}`;
}

export async function getAuthUser(request: Request, env: Env): Promise<AuthUser | null> {
  try {
    const cookie = request.headers.get('Cookie') || '';
    const match = cookie.match(/auth_token=([^;]+)/);
    if (!match) return null;

    const token = match[1];
    const secret = env.ADMIN_PASSWORD || 'madelina2000';

    // 1. Signed token
    if (token.includes('.')) {
      const [b64, sig] = token.split('.');
      const sigData = new TextEncoder().encode(b64 + ':' + secret + '_sig_salt');
      const sigHash = await crypto.subtle.digest('SHA-256', sigData);
      const expectedSig = Array.from(new Uint8Array(sigHash)).map(b => b.toString(16).padStart(2, '0')).join('');
      if (sig !== expectedSig) return null;

      const payload = JSON.parse(decodeURIComponent(escape(atob(b64))));
      if (payload.exp && Date.now() > payload.exp) return null;

      return {
        id: payload.id,
        username: payload.username,
        name: payload.name,
        role: payload.role,
        allowed_categories: payload.allowed_categories || '*'
      };
    }

    // 2. Legacy admin hash fallback
    const expectedLegacyToken = await hashPassword(secret);
    if (token === expectedLegacyToken) {
      return {
        id: 'user_admin',
        username: 'haifa',
        name: 'Haifa',
        role: 'admin',
        allowed_categories: '*'
      };
    }

    return null;
  } catch {
    return null;
  }
}

export async function checkAuth(request: Request, env: Env): Promise<boolean> {
  const user = await getAuthUser(request, env);
  return user !== null && user.role === 'admin';
}

export async function checkStaffAuth(request: Request, env: Env): Promise<boolean> {
  const user = await getAuthUser(request, env);
  return user !== null;
}

// GET /api/auth/check
export async function onRequestGet(context: EventContext<Env, any, any>) {
  const user = await getAuthUser(context.request, context.env);
  if (!user) {
    return new Response(JSON.stringify({ authenticated: false }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  return new Response(JSON.stringify({ authenticated: true, user }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

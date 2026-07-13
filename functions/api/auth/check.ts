import type { Env } from '../_types';

// Simple auth check: hash the password and compare with cookie
export async function checkAuth(request: Request, env: Env): Promise<boolean> {
  try {
    const correctPassword = env.ADMIN_PASSWORD || 'yucca2000';
    
    const cookie = request.headers.get('Cookie') || '';
    const match = cookie.match(/auth_token=([^;]+)/);
    if (!match) return false;

    const expectedToken = await hashToken(correctPassword);
    return match[1] === expectedToken;
  } catch {
    return false;
  }
}

export async function hashToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(password + '_yucca_admin');
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

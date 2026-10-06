import type { Env } from '../_types';

export async function hashStaffToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(password + '_madelina_staff');
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function checkStaffAuth(request: Request, env: Env): Promise<boolean> {
  try {
    const correctPassword = env.STAFF_PASSWORD || 'staff2000';
    const cookie = request.headers.get('Cookie') || '';
    const match = cookie.match(/staff_token=([^;]+)/);
    if (!match) return false;
    const expectedToken = await hashStaffToken(correctPassword);
    return match[1] === expectedToken;
  } catch {
    return false;
  }
}

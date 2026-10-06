export const onRequestPost: PagesFunction = async () => {
  return new Response(JSON.stringify({ success: true }), {
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': `auth_token=; HttpOnly; Secure; Path=/; Max-Age=0; SameSite=Strict`
    }
  });
};

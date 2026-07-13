import type { Env } from '../_types';

// POST /api/franchise — Public endpoint for franchise applications
export async function onRequestPost(context: EventContext<Env, any, any>) {
  try {
    const body = await context.request.json<{
      full_name: string;
      phone: string;
      email: string;
      zone: string;
      has_local: boolean;
      message?: string;
    }>();

    // Validate required fields
    if (!body.full_name?.trim() || !body.phone?.trim() || !body.email?.trim() || !body.zone?.trim()) {
      return new Response(JSON.stringify({ error: 'Tous les champs obligatoires doivent être remplis.' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email.trim())) {
      return new Response(JSON.stringify({ error: 'Adresse email invalide.' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    // Phone validation (should start with +216 or be 8 digits)
    const phone = body.phone.trim().replace(/\s+/g, '');
    if (!/^(\+216)?\d{8}$/.test(phone)) {
      return new Response(JSON.stringify({ error: 'Numéro de téléphone invalide.' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }


    await context.env.DB.prepare(
      `INSERT INTO franchise_applications (full_name, phone, email, zone, has_local, message)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(
      body.full_name.trim(),
      phone,
      body.email.trim().toLowerCase(),
      body.zone,
      body.has_local ? 1 : 0,
      body.message?.trim() || null
    ).run();

    return new Response(JSON.stringify({ success: true }), {
      status: 201, headers: { 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
}

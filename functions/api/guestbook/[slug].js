import { json } from '../_utils.js';

export async function onRequestGet({ params, env }) {
  const slug = params.slug;
  const inv = await env.DB.prepare('SELECT id FROM invitations WHERE slug=?').bind(slug).first();
  if (!inv) {
    return json({ error: 'Undangan tidak ditemukan.' }, 404);
  }

  const { results = [] } = await env.DB.prepare(
    "SELECT guest_name, attendance, message, created_at FROM rsvps WHERE invitation_id=? AND message IS NOT NULL AND TRIM(message) != '' ORDER BY created_at DESC LIMIT 60"
  ).bind(inv.id).all();

  return json({
    guestbook: results,
    total: results.length
  }, 200, {
    'cache-control': 'public, max-age=10, stale-while-revalidate=30'
  });
}

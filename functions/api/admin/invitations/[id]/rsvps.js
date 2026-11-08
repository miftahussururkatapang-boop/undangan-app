import { json, requireAdmin } from '../../../_utils.js';

export async function onRequestGet({ params, request, env }) {
  if (!await requireAdmin(request, env)) return json({ error: 'Belum login.' }, 401);

  const url = new URL(request.url);
  const filter = url.searchParams.get('attendance');

  let query = 'SELECT id, guest_name, attendance, guest_count, message, created_at FROM rsvps WHERE invitation_id = ?';
  const queryParams = [params.id];

  if (filter && ['hadir', 'tidak_hadir', 'ragu'].includes(filter)) {
    query += ' AND attendance = ?';
    queryParams.push(filter);
  }

  query += ' ORDER BY created_at DESC';

  const { results = [] } = await env.DB.prepare(query).bind(...queryParams).all();

  // Summary counts
  const summaryRow = await env.DB.prepare(`
    SELECT
      COUNT(*) as total_rsvp,
      COALESCE(SUM(guest_count), 0) as total_guests,
      COALESCE(SUM(CASE WHEN attendance='hadir' THEN guest_count ELSE 0 END), 0) as hadir_guests,
      COALESCE(SUM(CASE WHEN attendance='tidak_hadir' THEN guest_count ELSE 0 END), 0) as tidak_hadir_guests,
      COALESCE(SUM(CASE WHEN attendance='ragu' THEN guest_count ELSE 0 END), 0) as ragu_guests
    FROM rsvps
    WHERE invitation_id = ?
  `).bind(params.id).first();

  return json({
    rsvps: results,
    summary: summaryRow || { total_rsvp: 0, total_guests: 0, hadir_guests: 0, tidak_hadir_guests: 0, ragu_guests: 0 }
  });
}

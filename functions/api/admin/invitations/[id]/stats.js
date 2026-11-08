import { json, requireAdmin } from '../../../_utils.js';

export async function onRequestGet({ params, request, env }) {
  if (!await requireAdmin(request, env)) return json({ error: 'Belum login.' }, 401);

  const inv = await env.DB.prepare('SELECT id, slug, groom_name, bride_name, view_count, created_at FROM invitations WHERE id=?')
    .bind(params.id)
    .first();
  if (!inv) return json({ error: 'Undangan tidak ditemukan.' }, 404);

  // Rekap kehadiran RSVP
  const { results: rsvpStats = [] } = await env.DB.prepare(`
    SELECT attendance, COUNT(*) as count, COALESCE(SUM(guest_count), 0) as total_guests
    FROM rsvps
    WHERE invitation_id = ?
    GROUP BY attendance
  `).bind(params.id).all();

  // Tamu terdaftar
  const guestCountRow = await env.DB.prepare('SELECT COUNT(*) as total_guests FROM guests WHERE invitation_id=?')
    .bind(params.id)
    .first();

  // Log kunjungan terakhir (30 hari / 50 record terakhir)
  const { results: recentViews = [] } = await env.DB.prepare(`
    SELECT viewed_at, guest_name, user_agent
    FROM invitation_views
    WHERE invitation_id = ?
    ORDER BY viewed_at DESC
    LIMIT 30
  `).bind(params.id).all();

  const attendanceMap = {
    hadir: { count: 0, guests: 0 },
    tidak_hadir: { count: 0, guests: 0 },
    ragu: { count: 0, guests: 0 }
  };

  for (const s of rsvpStats) {
    if (attendanceMap[s.attendance]) {
      attendanceMap[s.attendance].count = s.count;
      attendanceMap[s.attendance].guests = s.total_guests;
    }
  }

  return json({
    view_count: inv.view_count || 0,
    registered_guests: guestCountRow?.total_guests || 0,
    rsvp: attendanceMap,
    recent_views: recentViews
  });
}

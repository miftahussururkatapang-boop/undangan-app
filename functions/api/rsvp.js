import { json, body, slugOk, sanitize } from './_utils.js';

export async function onRequestPost({ request, env }) {
  const b = await body(request);
  if (!b || !slugOk(b.slug) || !['hadir', 'tidak_hadir', 'ragu'].includes(b.attendance)) {
    return json({ error: 'Data konfirmasi kehadiran (RSVP) tidak lengkap atau tidak valid.' }, 400);
  }

  const name = sanitize(b.guest_name, 100);
  const message = sanitize(b.message, 500);
  const count = Number(b.guest_count) || 1;

  if (!name) {
    return json({ error: 'Nama tamu wajib diisi.' }, 400);
  }

  if (!Number.isInteger(count) || count < 1 || count > 10) {
    return json({ error: 'Jumlah tamu harus berupa angka antara 1 sampai 10 orang.' }, 400);
  }

  const inv = await env.DB.prepare('SELECT id, is_published FROM invitations WHERE slug=?').bind(b.slug).first();
  if (!inv) {
    return json({ error: 'Undangan tidak ditemukan.' }, 404);
  }

  if (!inv.is_published) {
    return json({ error: 'Undangan ini belum dibuka untuk menerima RSVP.' }, 400);
  }

  let guestId = null;
  if (b.guest_token) {
    const guest = await env.DB.prepare('SELECT id FROM guests WHERE invitation_id=? AND guest_token=?')
      .bind(inv.id, String(b.guest_token))
      .first();
    if (guest) {
      guestId = guest.id;
    }
  }

  await env.DB.prepare(
    'INSERT INTO rsvps (invitation_id, guest_id, guest_name, attendance, guest_count, message) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(inv.id, guestId, name, b.attendance, count, message).run();

  return json({
    ok: true,
    message: 'Terima kasih, konfirmasi kehadiran Anda berhasil disimpan.'
  });
}

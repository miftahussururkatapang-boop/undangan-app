import { json, body, requireAdmin, sanitize } from '../../../_utils.js';

let webCrypto = globalThis.crypto;
if (!webCrypto || !webCrypto.randomUUID) {
  try {
    const nodeCrypto = await import('node:crypto');
    webCrypto = nodeCrypto.webcrypto || nodeCrypto.default?.webcrypto || nodeCrypto.default;
  } catch {}
}

export async function onRequestGet({ params, request, env }) {
  if (!await requireAdmin(request, env)) return json({ error: 'Belum login.' }, 401);

  const { results = [] } = await env.DB.prepare(`
    SELECT g.id, g.guest_name, g.guest_token, g.created_at,
      r.attendance, r.guest_count, r.message, r.created_at as rsvp_at
    FROM guests g
    LEFT JOIN rsvps r ON r.invitation_id = g.invitation_id AND r.guest_id = g.id
    WHERE g.invitation_id = ?
    ORDER BY g.created_at DESC
  `).bind(params.id).all();

  return json({ guests: results });
}

export async function onRequestPost({ params, request, env }) {
  if (!await requireAdmin(request, env)) return json({ error: 'Belum login.' }, 401);
  const b = await body(request);

  const inv = await env.DB.prepare('SELECT id FROM invitations WHERE id=?').bind(params.id).first();
  if (!inv) return json({ error: 'Undangan tidak ditemukan.' }, 404);

  // Dukung input single maupun bulk (array atau multiline teks)
  let names = [];
  if (Array.isArray(b?.guest_names)) {
    names = b.guest_names.map(n => sanitize(n, 100)).filter(Boolean);
  } else if (typeof b?.guest_names === 'string') {
    names = b.guest_names.split('\n').map(n => sanitize(n, 100)).filter(Boolean);
  } else if (b?.guest_name) {
    const single = sanitize(b.guest_name, 100);
    if (single) names.push(single);
  }

  if (names.length === 0) {
    return json({ error: 'Nama tamu wajib diisi.' }, 400);
  }

  const created = [];
  for (const name of names) {
    const token = webCrypto.randomUUID().replace(/-/g, '');
    const r = await env.DB.prepare(
      'INSERT INTO guests (invitation_id, guest_name, guest_token) VALUES (?, ?, ?)'
    ).bind(params.id, name, token).run();

    created.push({ id: r.meta.last_row_id, name, token });
  }

  return json({
    ok: true,
    message: `Berhasil menambahkan ${created.length} tamu.`,
    guests: created
  }, 201);
}

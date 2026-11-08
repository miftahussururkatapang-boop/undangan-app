import { json, body, requireAdmin, safeJson } from '../../_utils.js';

export async function onRequestGet({ params, request, env }) {
  if (!await requireAdmin(request, env)) return json({ error: 'Belum login.' }, 401);

  const c = await env.DB.prepare('SELECT * FROM event_categories WHERE id=?').bind(params.id).first();
  if (!c) return json({ error: 'Kategori tidak ditemukan.' }, 404);

  return json({
    category: {
      ...c,
      fields: safeJson(c.fields_json, []),
      default_sections: safeJson(c.default_sections_json, [])
    }
  });
}

export async function onRequestPut({ params, request, env }) {
  if (!await requireAdmin(request, env)) return json({ error: 'Belum login.' }, 401);
  const b = await body(request);
  if (!b) return json({ error: 'Data tidak valid.' }, 400);

  const fieldsJson = typeof b.fields === 'object' ? JSON.stringify(b.fields) : (b.fields_json !== undefined ? b.fields_json : null);
  const sectionsJson = typeof b.default_sections === 'object' ? JSON.stringify(b.default_sections) : (b.default_sections_json !== undefined ? b.default_sections_json : null);
  const isActive = b.is_active !== undefined ? (b.is_active ? 1 : 0) : null;

  await env.DB.prepare(`
    UPDATE event_categories SET
      name = COALESCE(?, name),
      icon = COALESCE(?, icon),
      description = COALESCE(?, description),
      fields_json = COALESCE(?, fields_json),
      default_sections_json = COALESCE(?, default_sections_json),
      is_active = COALESCE(?, is_active),
      order_index = COALESCE(?, order_index),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(
    b.name !== undefined ? b.name.trim() : null,
    b.icon !== undefined ? b.icon : null,
    b.description !== undefined ? b.description : null,
    fieldsJson,
    sectionsJson,
    isActive,
    b.order_index !== undefined ? b.order_index : null,
    params.id
  ).run();

  return json({ ok: true, message: 'Kategori acara berhasil diperbarui.' });
}

export async function onRequestDelete({ params, request, env }) {
  if (!await requireAdmin(request, env)) return json({ error: 'Belum login.' }, 401);

  const cat = await env.DB.prepare('SELECT * FROM event_categories WHERE id=?').bind(params.id).first();
  if (!cat) return json({ error: 'Kategori tidak ditemukan.' }, 404);

  // Periksa apakah ada undangan yang sedang menggunakan kategori ini
  const inUse = await env.DB.prepare('SELECT COUNT(*) as count FROM invitations WHERE category_code=?').bind(cat.code).first();
  if (inUse?.count > 0) {
    return json({
      error: `Kategori "${cat.name}" sedang digunakan oleh ${inUse.count} undangan. Hapus atau pindahkan undangan tersebut terlebih dahulu.`
    }, 400);
  }

  await env.DB.prepare('DELETE FROM event_categories WHERE id=?').bind(params.id).run();
  return json({ ok: true, message: 'Kategori acara berhasil dihapus.' });
}

import { json, requireAdmin } from '../../../../_utils.js';

export async function onRequestPost({ params, request, env }) {
  if (!await requireAdmin(request, env)) return json({ error: 'Belum login.' }, 401);

  const cat = await env.DB.prepare('SELECT * FROM event_categories WHERE id=?').bind(params.id).first();
  if (!cat) return json({ error: 'Kategori sumber tidak ditemukan.' }, 404);

  const newCode = `${cat.code}_copy_${Date.now().toString(36)}`;
  const newName = `${cat.name} (Salinan)`;

  const r = await env.DB.prepare(`
    INSERT INTO event_categories (code, name, icon, description, fields_json, default_sections_json, is_active, is_builtin, order_index)
    VALUES (?, ?, ?, ?, ?, ?, 1, 0, (SELECT COALESCE(MAX(order_index), 0) + 1 FROM event_categories))
  `).bind(
    newCode,
    newName,
    cat.icon,
    cat.description,
    cat.fields_json,
    cat.default_sections_json
  ).run();

  return json({
    ok: true,
    message: 'Kategori acara berhasil digandakan.',
    id: r.meta.last_row_id,
    code: newCode
  }, 201);
}

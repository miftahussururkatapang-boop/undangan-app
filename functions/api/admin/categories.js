import { json, body, requireAdmin, safeJson } from '../_utils.js';

export async function onRequestGet({ request, env }) {
  if (!await requireAdmin(request, env)) return json({ error: 'Belum login.' }, 401);

  const { results = [] } = await env.DB.prepare(`
    SELECT c.*,
      (SELECT COUNT(*) FROM invitations i WHERE i.category_code = c.code) AS invitation_count
    FROM event_categories c
    ORDER BY c.order_index ASC, c.id ASC
  `).all();

  const categories = results.map(c => ({
    id: c.id,
    code: c.code,
    name: c.name,
    icon: c.icon || '💌',
    description: c.description || '',
    fields: safeJson(c.fields_json, []),
    default_sections: safeJson(c.default_sections_json, []),
    is_active: !!c.is_active,
    is_builtin: !!c.is_builtin,
    order: c.order_index,
    invitation_count: c.invitation_count || 0,
    created_at: c.created_at
  }));

  return json({ categories });
}

export async function onRequestPost({ request, env }) {
  if (!await requireAdmin(request, env)) return json({ error: 'Belum login.' }, 401);
  const b = await body(request);

  if (!b || !b.name) {
    return json({ error: 'Nama kategori acara wajib diisi.' }, 400);
  }

  let code = (b.code || b.name).toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/^_+|_+$/g, '');
  if (!code || code.length < 2) {
    code = 'custom_' + Date.now().toString(36);
  }

  // Cek duplikasi code
  const existing = await env.DB.prepare('SELECT id FROM event_categories WHERE code=?').bind(code).first();
  if (existing) {
    code = `${code}_${Date.now().toString(36)}`;
  }

  const fieldsJson = typeof b.fields === 'object' ? JSON.stringify(b.fields) : (b.fields_json || '[]');
  const sectionsJson = typeof b.default_sections === 'object' ? JSON.stringify(b.default_sections) : (b.default_sections_json || '[]');

  // Hitung order berikutnya
  const maxRow = await env.DB.prepare('SELECT MAX(order_index) as max_order FROM event_categories').first();
  const nextOrder = (maxRow?.max_order || 0) + 1;

  const r = await env.DB.prepare(`
    INSERT INTO event_categories (code, name, icon, description, fields_json, default_sections_json, is_active, is_builtin, order_index)
    VALUES (?, ?, ?, ?, ?, ?, 1, 0, ?)
  `).bind(
    code,
    b.name.trim(),
    b.icon || '💌',
    b.description || '',
    fieldsJson,
    sectionsJson,
    nextOrder
  ).run();

  return json({
    ok: true,
    message: 'Kategori acara baru berhasil dibuat.',
    id: r.meta.last_row_id,
    code
  }, 201);
}

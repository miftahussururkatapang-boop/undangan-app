import { json, body, requireAdmin, safeJson } from '../../../_utils.js';

export async function onRequestGet({ params, request, env }) {
  if (!await requireAdmin(request, env)) return json({ error: 'Belum login.' }, 401);

  const { results = [] } = await env.DB.prepare(
    'SELECT * FROM invitation_sections WHERE invitation_id=? ORDER BY order_index ASC'
  ).bind(params.id).all();

  const sections = results.map(s => ({
    id: s.id,
    key: s.section_key,
    title: s.title || '',
    subtitle: s.subtitle || '',
    content: safeJson(s.content_json, {}),
    style: safeJson(s.style_json, {}),
    order: s.order_index,
    is_visible: s.is_visible
  }));

  return json({ sections });
}

export async function onRequestPut({ params, request, env }) {
  if (!await requireAdmin(request, env)) return json({ error: 'Belum login.' }, 401);
  const b = await body(request);

  if (!b || !Array.isArray(b.sections)) {
    return json({ error: 'Data seksi harus berupa array.' }, 400);
  }

  // Update order dan status untuk setiap seksi
  for (let i = 0; i < b.sections.length; i++) {
    const s = b.sections[i];
    if (s.id) {
      await env.DB.prepare(`
        UPDATE invitation_sections SET
          order_index = ?,
          is_visible = ?,
          title = COALESCE(?, title),
          subtitle = COALESCE(?, subtitle),
          content_json = COALESCE(?, content_json),
          style_json = COALESCE(?, style_json),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND invitation_id = ?
      `).bind(
        i + 1,
        s.is_visible !== undefined ? (s.is_visible ? 1 : 0) : 1,
        s.title !== undefined ? s.title : null,
        s.subtitle !== undefined ? s.subtitle : null,
        s.content !== undefined ? (typeof s.content === 'object' ? JSON.stringify(s.content) : s.content) : null,
        s.style !== undefined ? (typeof s.style === 'object' ? JSON.stringify(s.style) : s.style) : null,
        s.id,
        params.id
      ).run();
    }
  }

  return json({ ok: true, message: 'Urutan dan pengaturan seksi berhasil diperbarui.' });
}

export async function onRequestPost({ params, request, env }) {
  if (!await requireAdmin(request, env)) return json({ error: 'Belum login.' }, 401);
  const b = await body(request);

  if (!b || !b.section_key) {
    return json({ error: 'Kunci komponen seksi (section_key) wajib diisi.' }, 400);
  }

  // Cari max order_index
  const maxRow = await env.DB.prepare(
    'SELECT MAX(order_index) as max_order FROM invitation_sections WHERE invitation_id=?'
  ).bind(params.id).first();
  const nextOrder = (maxRow?.max_order || 0) + 1;

  const contentJson = typeof b.content === 'object' ? JSON.stringify(b.content) : (b.content_json || '{}');
  const styleJson = typeof b.style === 'object' ? JSON.stringify(b.style) : (b.style_json || '{}');

  const r = await env.DB.prepare(`
    INSERT INTO invitation_sections (invitation_id, section_key, title, subtitle, content_json, style_json, order_index, is_visible)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    params.id,
    b.section_key,
    b.title || '',
    b.subtitle || '',
    contentJson,
    styleJson,
    nextOrder,
    b.is_visible !== undefined ? (b.is_visible ? 1 : 0) : 1
  ).run();

  return json({ ok: true, id: r.meta.last_row_id, order: nextOrder }, 201);
}

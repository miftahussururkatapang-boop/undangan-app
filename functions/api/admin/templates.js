import { json, body, requireAdmin, safeJson } from '../_utils.js';

export async function onRequestGet({ request, env }) {
  if (!await requireAdmin(request, env)) return json({ error: 'Belum login.' }, 401);

  const url = new URL(request.url);
  const categoryFilter = url.searchParams.get('category');

  let query = 'SELECT * FROM templates';
  const params = [];

  if (categoryFilter) {
    query += ' WHERE category_code = ?';
    params.push(categoryFilter);
  }

  query += ' ORDER BY is_default DESC, created_at DESC';

  const { results = [] } = await env.DB.prepare(query).bind(...params).all();

  const templates = results.map(t => ({
    id: t.id,
    name: t.name,
    category_code: t.category_code || 'pernikahan',
    description: t.description,
    thumbnail_url: t.thumbnail_url,
    theme_code: t.theme_code,
    is_default: !!t.is_default,
    config: safeJson(t.config_json, {}),
    sections: safeJson(t.sections_json, []),
    created_at: t.created_at,
    updated_at: t.updated_at
  }));

  return json({ templates });
}

export async function onRequestPost({ request, env }) {
  if (!await requireAdmin(request, env)) return json({ error: 'Belum login.' }, 401);
  const b = await body(request);

  if (!b || !b.name) {
    return json({ error: 'Nama template wajib diisi.' }, 400);
  }

  let configJson = '{}';
  let sectionsJson = '[]';
  let themeCode = b.theme_code || 'emerald_gold';
  let categoryCode = b.category_code || 'pernikahan';

  if (b.from_invitation_id) {
    const inv = await env.DB.prepare('SELECT * FROM invitations WHERE id=?').bind(b.from_invitation_id).first();
    if (!inv) return json({ error: 'Undangan sumber tidak ditemukan.' }, 404);

    themeCode = inv.theme_code || 'emerald_gold';
    categoryCode = inv.category_code || 'pernikahan';
    configJson = JSON.stringify({
      theme_code: themeCode,
      category_code: categoryCode,
      custom_theme_json: safeJson(inv.custom_theme_json, {}),
      animation_settings_json: safeJson(inv.animation_settings_json, {}),
      background_settings_json: safeJson(inv.background_settings_json, {}),
      sound_settings_json: safeJson(inv.sound_settings_json, {}),
      design_settings_json: safeJson(inv.design_settings_json, {})
    });

    const { results: sections = [] } = await env.DB.prepare(
      'SELECT section_key, title, subtitle, content_json, style_json, order_index FROM invitation_sections WHERE invitation_id=? ORDER BY order_index ASC'
    ).bind(b.from_invitation_id).all();

    sectionsJson = JSON.stringify(sections.map(s => ({
      key: s.section_key,
      title: s.title,
      subtitle: s.subtitle,
      content: safeJson(s.content_json, {}),
      style: safeJson(s.style_json, {}),
      order: s.order_index
    })));
  } else {
    configJson = typeof b.config === 'object' ? JSON.stringify(b.config) : (b.config_json || '{}');
    sectionsJson = typeof b.sections === 'object' ? JSON.stringify(b.sections) : (b.sections_json || '[]');
  }

  const isDefault = b.is_default ? 1 : 0;
  if (isDefault) {
    await env.DB.prepare('UPDATE templates SET is_default = 0').run();
  }

  const r = await env.DB.prepare(`
    INSERT INTO templates (name, category_code, description, thumbnail_url, theme_code, is_default, config_json, sections_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    b.name.trim(),
    categoryCode,
    b.description || '',
    b.thumbnail_url || '',
    themeCode,
    isDefault,
    configJson,
    sectionsJson
  ).run();

  return json({
    ok: true,
    message: 'Template baru berhasil disimpan.',
    id: r.meta.last_row_id
  }, 201);
}

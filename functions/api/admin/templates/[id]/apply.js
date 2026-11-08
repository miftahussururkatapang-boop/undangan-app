import { json, body, requireAdmin, safeJson } from '../../../_utils.js';

export async function onRequestPost({ params, request, env }) {
  if (!await requireAdmin(request, env)) return json({ error: 'Belum login.' }, 401);
  const b = await body(request);

  if (!b || !b.invitation_id) {
    return json({ error: 'ID undangan tujuan (invitation_id) wajib diisi.' }, 400);
  }

  const tpl = await env.DB.prepare('SELECT * FROM templates WHERE id=?').bind(params.id).first();
  if (!tpl) return json({ error: 'Template tidak ditemukan.' }, 404);

  const inv = await env.DB.prepare('SELECT id, slug FROM invitations WHERE id=?').bind(b.invitation_id).first();
  if (!inv) return json({ error: 'Undangan tujuan tidak ditemukan.' }, 404);

  const config = safeJson(tpl.config_json, {});
  const sections = safeJson(tpl.sections_json, []);

  // Update pengaturan studio pada undangan target
  await env.DB.prepare(`
    UPDATE invitations SET
      category_code = COALESCE(?, category_code),
      theme_code = COALESCE(?, theme_code),
      custom_theme_json = COALESCE(?, custom_theme_json),
      animation_settings_json = COALESCE(?, animation_settings_json),
      background_settings_json = COALESCE(?, background_settings_json),
      sound_settings_json = COALESCE(?, sound_settings_json),
      design_settings_json = COALESCE(?, design_settings_json),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(
    config.category_code || tpl.category_code || null,
    config.theme_code || tpl.theme_code || 'emerald_gold',
    config.custom_theme_json ? JSON.stringify(config.custom_theme_json) : null,
    config.animation_settings ? JSON.stringify(config.animation_settings) : (config.animation_settings_json ? JSON.stringify(config.animation_settings_json) : null),
    config.background_settings ? JSON.stringify(config.background_settings) : (config.background_settings_json ? JSON.stringify(config.background_settings_json) : null),
    config.sound_settings ? JSON.stringify(config.sound_settings) : (config.sound_settings_json ? JSON.stringify(config.sound_settings_json) : null),
    config.design_settings ? JSON.stringify(config.design_settings) : (config.design_settings_json ? JSON.stringify(config.design_settings_json) : null),
    b.invitation_id
  ).run();

  // Salin seksi template ke undangan (terisolasi dari template asli)
  if (Array.isArray(sections) && sections.length > 0) {
    await env.DB.prepare('DELETE FROM invitation_sections WHERE invitation_id=?').bind(b.invitation_id).run();

    for (let i = 0; i < sections.length; i++) {
      const s = sections[i];
      await env.DB.prepare(`
        INSERT INTO invitation_sections (invitation_id, section_key, title, subtitle, content_json, style_json, order_index, is_visible)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        b.invitation_id,
        s.key || s.section_key || 'custom',
        s.title || '',
        s.subtitle || '',
        JSON.stringify(s.content || {}),
        JSON.stringify(s.style || {}),
        s.order || (i + 1),
        s.visible !== undefined ? (s.visible ? 1 : 0) : (s.is_visible !== undefined ? s.is_visible : 1)
      ).run();
    }
  }

  return json({
    ok: true,
    message: `Template "${tpl.name}" berhasil diterapkan ke undangan "${inv.slug}".`
  });
}

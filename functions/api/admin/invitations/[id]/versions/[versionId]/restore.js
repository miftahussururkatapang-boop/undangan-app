import { json, requireAdmin, safeJson } from '../../../../../_utils.js';

export async function onRequestPost({ params, request, env }) {
  if (!await requireAdmin(request, env)) return json({ error: 'Belum login.' }, 401);

  const ver = await env.DB.prepare(
    'SELECT * FROM design_versions WHERE id=? AND invitation_id=?'
  ).bind(params.versionId, params.id).first();

  if (!ver) {
    return json({ error: 'Versi revisi tidak ditemukan.' }, 404);
  }

  const snapshot = safeJson(ver.snapshot_json, null);
  if (!snapshot || !snapshot.invitation) {
    return json({ error: 'Data snapshot rusak atau tidak valid.' }, 400);
  }

  const invData = snapshot.invitation;

  // Pulihkan setting studio pada tabel invitations
  await env.DB.prepare(`
    UPDATE invitations SET
      theme_code = COALESCE(?, theme_code),
      custom_theme_json = COALESCE(?, custom_theme_json),
      animation_settings_json = COALESCE(?, animation_settings_json),
      background_settings_json = COALESCE(?, background_settings_json),
      sound_settings_json = COALESCE(?, sound_settings_json),
      design_settings_json = COALESCE(?, design_settings_json),
      quote_text = COALESCE(?, quote_text),
      story_text = COALESCE(?, story_text),
      music_url = COALESCE(?, music_url),
      cover_image = COALESCE(?, cover_image),
      gallery_json = COALESCE(?, gallery_json),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(
    invData.theme_code || null,
    invData.custom_theme_json || null,
    invData.animation_settings_json || null,
    invData.background_settings_json || null,
    invData.sound_settings_json || null,
    invData.design_settings_json || null,
    invData.quote_text !== undefined ? invData.quote_text : null,
    invData.story_text !== undefined ? invData.story_text : null,
    invData.music_url !== undefined ? invData.music_url : null,
    invData.cover_image !== undefined ? invData.cover_image : null,
    invData.gallery_json || null,
    params.id
  ).run();

  // Pulihkan seksi jika ada di dalam snapshot
  if (Array.isArray(snapshot.sections) && snapshot.sections.length > 0) {
    await env.DB.prepare('DELETE FROM invitation_sections WHERE invitation_id=?').bind(params.id).run();

    for (const s of snapshot.sections) {
      await env.DB.prepare(`
        INSERT INTO invitation_sections (invitation_id, section_key, title, subtitle, content_json, style_json, order_index, is_visible)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        params.id,
        s.section_key,
        s.title || '',
        s.subtitle || '',
        s.content_json || '{}',
        s.style_json || '{}',
        s.order_index || 0,
        s.is_visible !== undefined ? s.is_visible : 1
      ).run();
    }
  }

  return json({
    ok: true,
    message: `Desain berhasil dipulihkan ke versi "${ver.version_name}".`
  });
}

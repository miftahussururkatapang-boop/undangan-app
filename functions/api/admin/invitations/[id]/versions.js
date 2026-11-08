import { json, body, requireAdmin, safeJson } from '../../../_utils.js';

export async function onRequestGet({ params, request, env }) {
  if (!await requireAdmin(request, env)) return json({ error: 'Belum login.' }, 401);

  const { results = [] } = await env.DB.prepare(`
    SELECT id, version_name, created_by, created_at
    FROM design_versions
    WHERE invitation_id = ?
    ORDER BY created_at DESC
    LIMIT 30
  `).bind(params.id).all();

  return json({ versions: results });
}

export async function onRequestPost({ params, request, env }) {
  if (!await requireAdmin(request, env)) return json({ error: 'Belum login.' }, 401);
  const b = await body(request);

  const versionName = (b?.version_name || '').trim().slice(0, 100) || `Snapshot ${new Date().toLocaleString('id-ID')}`;

  const inv = await env.DB.prepare('SELECT * FROM invitations WHERE id=?').bind(params.id).first();
  if (!inv) return json({ error: 'Undangan tidak ditemukan.' }, 404);

  const { results: sections = [] } = await env.DB.prepare(
    'SELECT * FROM invitation_sections WHERE invitation_id=? ORDER BY order_index ASC'
  ).bind(params.id).all();

  const snapshot = {
    invitation: {
      theme_code: inv.theme_code,
      custom_theme_json: inv.custom_theme_json,
      animation_settings_json: inv.animation_settings_json,
      background_settings_json: inv.background_settings_json,
      sound_settings_json: inv.sound_settings_json,
      design_settings_json: inv.design_settings_json,
      quote_text: inv.quote_text,
      story_text: inv.story_text,
      music_url: inv.music_url,
      cover_image: inv.cover_image,
      gallery_json: inv.gallery_json
    },
    sections
  };

  const r = await env.DB.prepare(`
    INSERT INTO design_versions (invitation_id, version_name, snapshot_json, created_by)
    VALUES (?, ?, ?, 'admin')
  `).bind(params.id, versionName, JSON.stringify(snapshot)).run();

  return json({
    ok: true,
    message: 'Versi snapshot desain berhasil disimpan.',
    id: r.meta.last_row_id,
    version_name: versionName
  }, 201);
}

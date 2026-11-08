import { json, body, requireAdmin, slugOk } from '../../_utils.js';

export async function onRequestGet({ params, request, env }) {
  if (!await requireAdmin(request, env)) return json({ error: 'Belum login.' }, 401);

  const row = await env.DB.prepare('SELECT * FROM invitations WHERE id=?').bind(params.id).first();
  if (!row) return json({ error: 'Undangan tidak ditemukan.' }, 404);

  return json({ invitation: row });
}

export async function onRequestPut({ params, request, env }) {
  if (!await requireAdmin(request, env)) return json({ error: 'Belum login.' }, 401);
  const b = await body(request);

  if (!b || !slugOk(b.slug)) {
    return json({ error: 'Slug unik wajib diisi.' }, 400);
  }

  const categoryCode = b.category_code || 'pernikahan';
  const eventTitle = (b.event_title || '').trim();
  const groomName = (b.groom_name || '').trim();
  const brideName = (b.bride_name || '').trim();

  if (categoryCode === 'pernikahan') {
    if (!groomName && !brideName) {
      return json({ error: 'Nama mempelai wajib diisi untuk kategori pernikahan.' }, 400);
    }
  } else {
    if (!eventTitle && !groomName) {
      return json({ error: 'Judul atau nama acara wajib diisi.' }, 400);
    }
  }

  try {
    const isPublished = b.is_published !== undefined ? (b.is_published ? 1 : 0) : 1;
    const themeCode = b.theme_code || 'emerald_gold';
    const eventDataJson = typeof b.event_data === 'object' ? JSON.stringify(b.event_data) : (b.event_data_json !== undefined ? b.event_data_json : '{}');

    await env.DB.prepare(`
      UPDATE invitations SET
        slug = ?,
        category_code = ?,
        event_title = ?,
        event_data_json = ?,
        groom_name = ?,
        bride_name = ?,
        groom_parents = ?,
        bride_parents = ?,
        event_date = ?,
        event_time = ?,
        venue = ?,
        address = ?,
        maps_url = ?,
        quote_text = ?,
        story_text = ?,
        music_url = ?,
        cover_image = ?,
        gallery_json = ?,
        is_published = ?,
        theme_code = ?,
        custom_theme_json = ?,
        animation_settings_json = ?,
        background_settings_json = ?,
        sound_settings_json = ?,
        design_settings_json = ?,
        privacy_type = ?,
        privacy_password = ?,
        publish_at = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      b.slug,
      categoryCode,
      eventTitle,
      eventDataJson,
      groomName,
      brideName,
      b.groom_parents || '',
      b.bride_parents || '',
      b.event_date || '',
      b.event_time || '',
      b.venue || '',
      b.address || '',
      b.maps_url || '',
      b.quote_text || '',
      b.story_text || '',
      b.music_url || '',
      b.cover_image || '',
      b.gallery_json || '[]',
      isPublished,
      themeCode,
      typeof b.custom_theme_json === 'object' ? JSON.stringify(b.custom_theme_json) : (b.custom_theme_json || '{}'),
      typeof b.animation_settings_json === 'object' ? JSON.stringify(b.animation_settings_json) : (b.animation_settings_json || '{}'),
      typeof b.background_settings_json === 'object' ? JSON.stringify(b.background_settings_json) : (b.background_settings_json || '{}'),
      typeof b.sound_settings_json === 'object' ? JSON.stringify(b.sound_settings_json) : (b.sound_settings_json || '{}'),
      typeof b.design_settings_json === 'object' ? JSON.stringify(b.design_settings_json) : (b.design_settings_json || '{}'),
      b.privacy_type || 'public',
      b.privacy_password || '',
      b.publish_at || '',
      params.id
    ).run();

    return json({ ok: true, message: 'Undangan berhasil diperbarui.' });
  } catch (err) {
    return json({ error: 'Gagal memperbarui. Slug mungkin sudah digunakan oleh undangan lain.' }, 400);
  }
}

export async function onRequestDelete({ params, request, env }) {
  if (!await requireAdmin(request, env)) return json({ error: 'Belum login.' }, 401);

  await env.DB.prepare('DELETE FROM invitations WHERE id=?').bind(params.id).run();
  return json({ ok: true });
}

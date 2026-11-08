import { json, requireAdmin } from '../../../_utils.js';

export async function onRequestPost({ params, request, env }) {
  if (!await requireAdmin(request, env)) return json({ error: 'Belum login.' }, 401);

  const inv = await env.DB.prepare('SELECT * FROM invitations WHERE id=?').bind(params.id).first();
  if (!inv) return json({ error: 'Undangan sumber tidak ditemukan.' }, 404);

  // Generate unique slug
  let newSlug = `${inv.slug}-copy`;
  let counter = 1;
  while (true) {
    const existing = await env.DB.prepare('SELECT id FROM invitations WHERE slug=?').bind(newSlug).first();
    if (!existing) break;
    counter++;
    newSlug = `${inv.slug}-copy-${counter}`;
  }

  const newGroom = inv.groom_name ? `${inv.groom_name} (Salinan)` : '';
  const newTitle = inv.event_title ? `${inv.event_title} (Salinan)` : '';

  // Insert duplicated invitation
  const r = await env.DB.prepare(`
    INSERT INTO invitations (
      slug, category_code, event_title, event_data_json,
      groom_name, bride_name, groom_parents, bride_parents,
      event_date, event_time, venue, address, maps_url,
      quote_text, story_text, music_url, cover_image, gallery_json,
      is_published, theme_code, custom_theme_json, animation_settings_json,
      background_settings_json, sound_settings_json, design_settings_json,
      privacy_type, privacy_password, publish_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    newSlug,
    inv.category_code || 'pernikahan',
    newTitle,
    inv.event_data_json || '{}',
    newGroom,
    inv.bride_name || '',
    inv.groom_parents || '',
    inv.bride_parents || '',
    inv.event_date || '',
    inv.event_time || '',
    inv.venue || '',
    inv.address || '',
    inv.maps_url || '',
    inv.quote_text || '',
    inv.story_text || '',
    inv.music_url || '',
    inv.cover_image || '',
    inv.gallery_json || '[]',
    0, // Default draft untuk duplikat
    inv.theme_code || 'emerald_gold',
    inv.custom_theme_json || '{}',
    inv.animation_settings_json || '{}',
    inv.background_settings_json || '{}',
    inv.sound_settings_json || '{}',
    inv.design_settings_json || '{}',
    inv.privacy_type || 'public',
    inv.privacy_password || '',
    inv.publish_at || ''
  ).run();

  const newId = r.meta.last_row_id;

  // Duplicate sections
  const { results: sections = [] } = await env.DB.prepare(
    'SELECT * FROM invitation_sections WHERE invitation_id=? ORDER BY order_index ASC'
  ).bind(params.id).all();

  for (const s of sections) {
    await env.DB.prepare(`
      INSERT INTO invitation_sections (invitation_id, section_key, title, subtitle, content_json, style_json, order_index, is_visible)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(newId, s.section_key, s.title, s.subtitle, s.content_json, s.style_json, s.order_index, s.is_visible).run();
  }

  return json({
    ok: true,
    message: 'Undangan berhasil digandakan.',
    id: newId,
    slug: newSlug
  }, 201);
}

import { json, body, requireAdmin, safeJson } from '../../_utils.js';

export async function onRequestGet({ params, request, env }) {
  if (!await requireAdmin(request, env)) return json({ error: 'Belum login.' }, 401);

  const t = await env.DB.prepare('SELECT * FROM templates WHERE id=?').bind(params.id).first();
  if (!t) return json({ error: 'Template tidak ditemukan.' }, 404);

  return json({
    template: {
      ...t,
      config: safeJson(t.config_json, {}),
      sections: safeJson(t.sections_json, [])
    }
  });
}

export async function onRequestPut({ params, request, env }) {
  if (!await requireAdmin(request, env)) return json({ error: 'Belum login.' }, 401);
  const b = await body(request);
  if (!b) return json({ error: 'Data tidak valid.' }, 400);

  if (b.is_default) {
    await env.DB.prepare('UPDATE templates SET is_default = 0').run();
  }

  const configJson = typeof b.config === 'object' ? JSON.stringify(b.config) : (b.config_json !== undefined ? b.config_json : null);
  const sectionsJson = typeof b.sections === 'object' ? JSON.stringify(b.sections) : (b.sections_json !== undefined ? b.sections_json : null);

  await env.DB.prepare(`
    UPDATE templates SET
      name = COALESCE(?, name),
      description = COALESCE(?, description),
      thumbnail_url = COALESCE(?, thumbnail_url),
      theme_code = COALESCE(?, theme_code),
      is_default = COALESCE(?, is_default),
      config_json = COALESCE(?, config_json),
      sections_json = COALESCE(?, sections_json),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(
    b.name !== undefined ? b.name.trim() : null,
    b.description !== undefined ? b.description : null,
    b.thumbnail_url !== undefined ? b.thumbnail_url : null,
    b.theme_code !== undefined ? b.theme_code : null,
    b.is_default !== undefined ? (b.is_default ? 1 : 0) : null,
    configJson,
    sectionsJson,
    params.id
  ).run();

  return json({ ok: true, message: 'Template berhasil diperbarui.' });
}

export async function onRequestDelete({ params, request, env }) {
  if (!await requireAdmin(request, env)) return json({ error: 'Belum login.' }, 401);

  await env.DB.prepare('DELETE FROM templates WHERE id=?').bind(params.id).run();
  return json({ ok: true, message: 'Template berhasil dihapus.' });
}

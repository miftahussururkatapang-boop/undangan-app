import { json, body, requireAdmin } from '../../../../_utils.js';

export async function onRequestPut({ params, request, env }) {
  if (!await requireAdmin(request, env)) return json({ error: 'Belum login.' }, 401);
  const b = await body(request);
  if (!b) return json({ error: 'Data tidak valid.' }, 400);

  const contentJson = typeof b.content === 'object' ? JSON.stringify(b.content) : (b.content_json !== undefined ? b.content_json : null);
  const styleJson = typeof b.style === 'object' ? JSON.stringify(b.style) : (b.style_json !== undefined ? b.style_json : null);

  await env.DB.prepare(`
    UPDATE invitation_sections SET
      title = COALESCE(?, title),
      subtitle = COALESCE(?, subtitle),
      content_json = COALESCE(?, content_json),
      style_json = COALESCE(?, style_json),
      is_visible = COALESCE(?, is_visible),
      order_index = COALESCE(?, order_index),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND invitation_id = ?
  `).bind(
    b.title !== undefined ? b.title : null,
    b.subtitle !== undefined ? b.subtitle : null,
    contentJson,
    styleJson,
    b.is_visible !== undefined ? (b.is_visible ? 1 : 0) : null,
    b.order_index !== undefined ? b.order_index : null,
    params.sectionId,
    params.id
  ).run();

  return json({ ok: true });
}

export async function onRequestDelete({ params, request, env }) {
  if (!await requireAdmin(request, env)) return json({ error: 'Belum login.' }, 401);

  await env.DB.prepare('DELETE FROM invitation_sections WHERE id=? AND invitation_id=?')
    .bind(params.sectionId, params.id)
    .run();

  return json({ ok: true, message: 'Bagian seksi berhasil dihapus.' });
}

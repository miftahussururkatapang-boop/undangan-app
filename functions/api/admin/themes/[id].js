import { json, body, requireAdmin } from '../../_utils.js';

export async function onRequestPut({ params, request, env }) {
  if (!await requireAdmin(request, env)) return json({ error: 'Belum login.' }, 401);
  const b = await body(request);
  if (!b) return json({ error: 'Data tidak valid.' }, 400);

  const theme = await env.DB.prepare('SELECT * FROM themes WHERE id=?').bind(params.id).first();
  if (!theme) return json({ error: 'Tema tidak ditemukan.' }, 404);

  const configJson = typeof b.config === 'object' ? JSON.stringify(b.config) : (b.config_json !== undefined ? b.config_json : null);
  const isFav = b.is_favorite !== undefined ? (b.is_favorite ? 1 : 0) : null;

  await env.DB.prepare(`
    UPDATE themes SET
      name = COALESCE(?, name),
      description = COALESCE(?, description),
      is_favorite = COALESCE(?, is_favorite),
      config_json = COALESCE(?, config_json),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(
    b.name !== undefined ? b.name.trim() : null,
    b.description !== undefined ? b.description : null,
    isFav,
    configJson,
    params.id
  ).run();

  return json({ ok: true, message: 'Tema berhasil diperbarui.' });
}

export async function onRequestDelete({ params, request, env }) {
  if (!await requireAdmin(request, env)) return json({ error: 'Belum login.' }, 401);

  const theme = await env.DB.prepare('SELECT * FROM themes WHERE id=?').bind(params.id).first();
  if (!theme) return json({ error: 'Tema tidak ditemukan.' }, 404);

  if (theme.is_preset) {
    return json({ error: 'Tema bawaan sistem (preset) tidak dapat dihapus. Anda dapat menduplikasinya menjadi tema kustom baru.' }, 400);
  }

  await env.DB.prepare('DELETE FROM themes WHERE id=?').bind(params.id).run();
  return json({ ok: true, message: 'Tema kustom berhasil dihapus.' });
}

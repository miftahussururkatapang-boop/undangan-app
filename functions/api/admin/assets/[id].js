import { json, requireAdmin } from '../../_utils.js';

export async function onRequestDelete({ params, request, env }) {
  if (!await requireAdmin(request, env)) return json({ error: 'Belum login.' }, 401);

  const asset = await env.DB.prepare('SELECT * FROM design_assets WHERE id=?').bind(params.id).first();
  if (!asset) return json({ error: 'Aset tidak ditemukan.' }, 404);

  if (asset.is_builtin) {
    return json({ error: 'Aset bawaan sistem tidak dapat dihapus.' }, 400);
  }

  await env.DB.prepare('DELETE FROM design_assets WHERE id=?').bind(params.id).run();
  return json({ ok: true, message: 'Aset berhasil dihapus.' });
}

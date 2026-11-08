import { json, body, requireAdmin, safeJson } from '../_utils.js';

export async function onRequestGet({ request, env }) {
  if (!await requireAdmin(request, env)) return json({ error: 'Belum login.' }, 401);

  const { results = [] } = await env.DB.prepare(
    'SELECT * FROM themes ORDER BY is_favorite DESC, is_preset DESC, name ASC'
  ).all();

  const themes = results.map(t => ({
    id: t.id,
    code: t.code,
    name: t.name,
    description: t.description,
    is_preset: !!t.is_preset,
    is_favorite: !!t.is_favorite,
    config: safeJson(t.config_json, {}),
    created_at: t.created_at,
    updated_at: t.updated_at
  }));

  return json({ themes });
}

export async function onRequestPost({ request, env }) {
  if (!await requireAdmin(request, env)) return json({ error: 'Belum login.' }, 401);
  const b = await body(request);

  if (!b || !b.name) {
    return json({ error: 'Nama tema wajib diisi.' }, 400);
  }

  // Buat kode tema unik
  let code = b.code ? b.code.toLowerCase().replace(/[^a-z0-9_]/g, '_') : '';
  if (!code || code.length < 3) {
    code = 'custom_' + b.name.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 20) + '_' + Date.now().toString(36);
  }

  // Cek apakah kode sudah dipakai
  const existing = await env.DB.prepare('SELECT id FROM themes WHERE code=?').bind(code).first();
  if (existing) {
    code = `${code}_${Date.now().toString(36)}`;
  }

  const configJson = typeof b.config === 'object' ? JSON.stringify(b.config) : (b.config_json || '{}');
  const isFav = b.is_favorite ? 1 : 0;

  const r = await env.DB.prepare(`
    INSERT INTO themes (code, name, description, is_preset, is_favorite, config_json)
    VALUES (?, ?, ?, 0, ?, ?)
  `).bind(code, b.name.trim(), b.description || '', isFav, configJson).run();

  return json({
    ok: true,
    message: 'Tema berhasil dibuat.',
    id: r.meta.last_row_id,
    code
  }, 201);
}

import { json, body, requireAdmin, safeJson } from '../_utils.js';

export async function onRequestGet({ request, env }) {
  if (!await requireAdmin(request, env)) return json({ error: 'Belum login.' }, 401);

  const url = new URL(request.url);
  const category = url.searchParams.get('category');

  let query = 'SELECT * FROM design_assets';
  const params = [];

  if (category) {
    query += ' WHERE category = ?';
    params.push(category);
  }

  query += ' ORDER BY is_builtin DESC, created_at DESC';

  const { results = [] } = await env.DB.prepare(query).bind(...params).all();

  const assets = results.map(a => ({
    id: a.id,
    category: a.category,
    name: a.name,
    asset_url: a.asset_url,
    is_builtin: !!a.is_builtin,
    metadata: safeJson(a.metadata_json, {}),
    created_at: a.created_at
  }));

  return json({ assets });
}

export async function onRequestPost({ request, env }) {
  if (!await requireAdmin(request, env)) return json({ error: 'Belum login.' }, 401);
  const b = await body(request);

  if (!b || !b.name || !b.asset_url || !b.category) {
    return json({ error: 'Nama aset, kategori, dan URL/data aset wajib diisi.' }, 400);
  }

  const validCategories = [
    'ornament_floral',
    'ornament_islamic',
    'frame',
    'pattern',
    'background',
    'audio',
    'icon',
    'photo'
  ];

  if (!validCategories.includes(b.category)) {
    return json({ error: 'Kategori aset tidak valid.' }, 400);
  }

  // Validasi ukuran data URL jika diunggah langsung (maksimal ~2MB base64)
  if (b.asset_url.startsWith('data:') && b.asset_url.length > 2.5 * 1024 * 1024) {
    return json({ error: 'Ukuran file melebihi batas maksimum (2MB). Silakan gunakan gambar terkompresi atau URL gambar eksternal.' }, 400);
  }

  const metadataJson = typeof b.metadata === 'object' ? JSON.stringify(b.metadata) : (b.metadata_json || '{}');

  const r = await env.DB.prepare(`
    INSERT INTO design_assets (category, name, asset_url, is_builtin, metadata_json)
    VALUES (?, ?, ?, 0, ?)
  `).bind(b.category, b.name.trim(), b.asset_url.trim(), metadataJson).run();

  return json({
    ok: true,
    message: 'Aset berhasil ditambahkan ke galeri.',
    id: r.meta.last_row_id
  }, 201);
}

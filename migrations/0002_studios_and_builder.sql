-- ====================================================================
-- MIGRATION 0002: THEME STUDIO, ANIMATION STUDIO, AND SECTION BUILDER
-- Aman untuk database yang sudah berjalan (tidak menghapus data lama).
-- ====================================================================

PRAGMA foreign_keys = ON;

-- 1. Perluas tabel invitations dengan kolom kustomisasi studio
ALTER TABLE invitations ADD COLUMN theme_code TEXT DEFAULT 'emerald_gold';
ALTER TABLE invitations ADD COLUMN custom_theme_json TEXT DEFAULT '{}';
ALTER TABLE invitations ADD COLUMN animation_settings_json TEXT DEFAULT '{}';
ALTER TABLE invitations ADD COLUMN background_settings_json TEXT DEFAULT '{}';
ALTER TABLE invitations ADD COLUMN sound_settings_json TEXT DEFAULT '{}';
ALTER TABLE invitations ADD COLUMN design_settings_json TEXT DEFAULT '{}';
ALTER TABLE invitations ADD COLUMN privacy_type TEXT DEFAULT 'public';
ALTER TABLE invitations ADD COLUMN privacy_password TEXT DEFAULT '';
ALTER TABLE invitations ADD COLUMN publish_at TEXT DEFAULT '';
ALTER TABLE invitations ADD COLUMN view_count INTEGER DEFAULT 0;

-- 2. Tabel themes (koleksi tema bawaan dan tema kustom admin)
CREATE TABLE IF NOT EXISTS themes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  is_preset INTEGER DEFAULT 0,
  is_favorite INTEGER DEFAULT 0,
  config_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabel invitation_sections (manajemen seksi dinamis Section Builder)
CREATE TABLE IF NOT EXISTS invitation_sections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invitation_id INTEGER NOT NULL,
  section_key TEXT NOT NULL,
  title TEXT DEFAULT '',
  subtitle TEXT DEFAULT '',
  content_json TEXT DEFAULT '{}',
  style_json TEXT DEFAULT '{}',
  order_index INTEGER NOT NULL DEFAULT 0,
  is_visible INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE
);

-- 4. Tabel templates (desain siap pakai yang terisolasi dari undangan aktif)
CREATE TABLE IF NOT EXISTS templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  thumbnail_url TEXT DEFAULT '',
  theme_code TEXT DEFAULT 'emerald_gold',
  is_default INTEGER DEFAULT 0,
  config_json TEXT NOT NULL,
  sections_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabel design_assets (pustaka ornamen, background, pola, musik)
CREATE TABLE IF NOT EXISTS design_assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  asset_url TEXT NOT NULL,
  is_builtin INTEGER DEFAULT 0,
  metadata_json TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabel design_versions (riwayat snapshot revisi dan undo/restore)
CREATE TABLE IF NOT EXISTS design_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invitation_id INTEGER NOT NULL,
  version_name TEXT NOT NULL,
  snapshot_json TEXT NOT NULL,
  created_by TEXT DEFAULT 'admin',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE
);

-- 7. Tabel invitation_views (statistik analitik kunjungan)
CREATE TABLE IF NOT EXISTS invitation_views (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invitation_id INTEGER NOT NULL,
  viewed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  guest_name TEXT DEFAULT '',
  ip_hash TEXT DEFAULT '',
  user_agent TEXT DEFAULT '',
  FOREIGN KEY (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE
);

-- Index performa
CREATE INDEX IF NOT EXISTS idx_invitation_sections_inv ON invitation_sections(invitation_id);
CREATE INDEX IF NOT EXISTS idx_invitation_sections_order ON invitation_sections(invitation_id, order_index);
CREATE INDEX IF NOT EXISTS idx_design_versions_inv ON design_versions(invitation_id);
CREATE INDEX IF NOT EXISTS idx_invitation_views_inv ON invitation_views(invitation_id);

-- Masukkan 10 tema bawaan (preset)
INSERT OR IGNORE INTO themes (code, name, description, is_preset, is_favorite, config_json) VALUES ('emerald_gold', 'Emerald Gold', 'Hijau zamrud dan emas elegan dengan nuansa mewah dan sakral.', 1, 1, '{"colors": {"primary": "#073f35", "secondary": "#0d5a49", "accent": "#d8b66a", "gold": "#d8b66a", "gold_gradient": "linear-gradient(135deg, #f0d99e 0%, #c49b4c 100%)", "bg_cover": "radial-gradient(ellipse at center, #155e4c 0%, #073f35 65%, #052d27 100%)", "bg_content": "#f8f4e9", "bg_card": "#ffffff", "bg_alt": "#f2ede0", "text_primary": "#26352f", "text_muted": "#748078", "text_eyebrow": "#d8b66a", "text_cover": "#fff8e9", "btn_bg": "linear-gradient(135deg, #f0d99e 0%, #c49b4c 100%)", "btn_text": "#193b30", "line": "#e8e1d2", "ornament": "#d8b66a"}, "fonts": {"heading": "Playfair Display", "body": "DM Sans", "quote": "Playfair Display", "scale": "1.0"}, "button_style": "rounded", "border_radius": "8px", "photo_frame": "arch", "ornament_style": "islamic_floral", "cover_style": "classic_glow"}');
INSERT OR IGNORE INTO themes (code, name, description, is_preset, is_favorite, config_json) VALUES ('royal_burgundy', 'Royal Burgundy', 'Merah marun pekat dan emas mewah bernuansa hangat dan agung.', 1, 1, '{"colors": {"primary": "#3b0d19", "secondary": "#541525", "accent": "#dfb05b", "gold": "#dfb05b", "gold_gradient": "linear-gradient(135deg, #f5dfa8 0%, #c89438 100%)", "bg_cover": "radial-gradient(ellipse at center, #541525 0%, #3b0d19 70%, #20050d 100%)", "bg_content": "#fbf6f3", "bg_card": "#ffffff", "bg_alt": "#f4ebe7", "text_primary": "#2d151c", "text_muted": "#7d5b64", "text_eyebrow": "#dfb05b", "text_cover": "#fff6f4", "btn_bg": "linear-gradient(135deg, #f5dfa8 0%, #c89438 100%)", "btn_text": "#3b0d19", "line": "#ebd8cb", "ornament": "#dfb05b"}, "fonts": {"heading": "Cinzel", "body": "Plus Jakarta Sans", "quote": "Cormorant Garamond", "scale": "1.0"}, "button_style": "pill", "border_radius": "24px", "photo_frame": "double_frame", "ornament_style": "vintage_vine", "cover_style": "royal_crest"}');
INSERT OR IGNORE INTO themes (code, name, description, is_preset, is_favorite, config_json) VALUES ('midnight_blue', 'Midnight Blue', 'Biru navy aristokrat dipadukan dengan aksen silver kristal dan platinum.', 1, 1, '{"colors": {"primary": "#0a192f", "secondary": "#172a45", "accent": "#64ffda", "gold": "#94a3b8", "gold_gradient": "linear-gradient(135deg, #f1f5f9 0%, #94a3b8 100%)", "bg_cover": "radial-gradient(ellipse at center, #1b3052 0%, #0a192f 70%, #050c17 100%)", "bg_content": "#f3f6fa", "bg_card": "#ffffff", "bg_alt": "#e8eef6", "text_primary": "#112240", "text_muted": "#64748b", "text_eyebrow": "#38bdf8", "text_cover": "#f8fafc", "btn_bg": "linear-gradient(135deg, #38bdf8 0%, #1e40af 100%)", "btn_text": "#ffffff", "line": "#dbeafe", "ornament": "#94a3b8"}, "fonts": {"heading": "Cormorant Garamond", "body": "DM Sans", "quote": "Cormorant Garamond", "scale": "1.0"}, "button_style": "rounded", "border_radius": "6px", "photo_frame": "circle", "ornament_style": "star_sparkle", "cover_style": "starry_night"}');
INSERT OR IGNORE INTO themes (code, name, description, is_preset, is_favorite, config_json) VALUES ('ivory_champagne', 'Ivory Champagne', 'Putih gading lembut dan kilau champagne modern bernuansa romantis.', 1, 0, '{"colors": {"primary": "#42382e", "secondary": "#605244", "accent": "#caa67e", "gold": "#caa67e", "gold_gradient": "linear-gradient(135deg, #f5ebd9 0%, #caa67e 100%)", "bg_cover": "radial-gradient(ellipse at center, #605244 0%, #42382e 70%, #2a231c 100%)", "bg_content": "#fdfbf7", "bg_card": "#ffffff", "bg_alt": "#f7f2ea", "text_primary": "#362e26", "text_muted": "#84776b", "text_eyebrow": "#caa67e", "text_cover": "#fffdf9", "btn_bg": "linear-gradient(135deg, #f5ebd9 0%, #caa67e 100%)", "btn_text": "#3c3024", "line": "#eee6d8", "ornament": "#caa67e"}, "fonts": {"heading": "Playfair Display", "body": "Plus Jakarta Sans", "quote": "Playfair Display", "scale": "1.0"}, "button_style": "pill", "border_radius": "999px", "photo_frame": "arch", "ornament_style": "floral", "cover_style": "soft_champagne"}');
INSERT OR IGNORE INTO themes (code, name, description, is_preset, is_favorite, config_json) VALUES ('rose_gold', 'Rose Gold', 'Nuansa blush pink lembut bertabur emas tembaga feminin dan anggun.', 1, 1, '{"colors": {"primary": "#3f1e29", "secondary": "#5e2d3e", "accent": "#d47e8c", "gold": "#d9919b", "gold_gradient": "linear-gradient(135deg, #fcd5dc 0%, #d47e8c 100%)", "bg_cover": "radial-gradient(ellipse at center, #5e2d3e 0%, #3f1e29 70%, #29121a 100%)", "bg_content": "#fdf6f7", "bg_card": "#ffffff", "bg_alt": "#f8ebed", "text_primary": "#381c25", "text_muted": "#8e6573", "text_eyebrow": "#d47e8c", "text_cover": "#fff8fa", "btn_bg": "linear-gradient(135deg, #fcd5dc 0%, #d47e8c 100%)", "btn_text": "#4a1827", "line": "#f3d9de", "ornament": "#d9919b"}, "fonts": {"heading": "Cormorant Garamond", "body": "DM Sans", "quote": "Alex Brush", "scale": "1.0"}, "button_style": "rounded", "border_radius": "10px", "photo_frame": "circle", "ornament_style": "floral", "cover_style": "blush_romance"}');
INSERT OR IGNORE INTO themes (code, name, description, is_preset, is_favorite, config_json) VALUES ('black_luxury', 'Black Luxury', 'Hitam pekat ultra-eksklusif dengan tipografi emas metallik berkilau.', 1, 1, '{"colors": {"primary": "#111111", "secondary": "#242424", "accent": "#ffd700", "gold": "#ffd700", "gold_gradient": "linear-gradient(135deg, #ffe57f 0%, #c99700 100%)", "bg_cover": "radial-gradient(ellipse at center, #262626 0%, #111111 75%, #050505 100%)", "bg_content": "#181818", "bg_card": "#222222", "bg_alt": "#141414", "text_primary": "#f3f4f6", "text_muted": "#9ca3af", "text_eyebrow": "#ffd700", "text_cover": "#fffef0", "btn_bg": "linear-gradient(135deg, #ffe57f 0%, #c99700 100%)", "btn_text": "#111111", "line": "#333333", "ornament": "#ffd700"}, "fonts": {"heading": "Cinzel", "body": "Montserrat", "quote": "Cinzel", "scale": "1.0"}, "button_style": "sharp", "border_radius": "2px", "photo_frame": "hexagon", "ornament_style": "modern_geometric", "cover_style": "noir_gold"}');
INSERT OR IGNORE INTO themes (code, name, description, is_preset, is_favorite, config_json) VALUES ('sage_botanical', 'Sage Botanical', 'Hijau sage menenangkan dipadu ornamen dedaunan alam dan kayu hangat.', 1, 1, '{"colors": {"primary": "#2d4030", "secondary": "#435c47", "accent": "#8ca78e", "gold": "#b58a5c", "gold_gradient": "linear-gradient(135deg, #d8bc97 0%, #9e7447 100%)", "bg_cover": "radial-gradient(ellipse at center, #435c47 0%, #2d4030 70%, #1a271c 100%)", "bg_content": "#f5f7f4", "bg_card": "#ffffff", "bg_alt": "#ecf0ea", "text_primary": "#233225", "text_muted": "#637766", "text_eyebrow": "#537057", "text_cover": "#f7f9f6", "btn_bg": "linear-gradient(135deg, #435c47 0%, #2d4030 100%)", "btn_text": "#ffffff", "line": "#dfe7df", "ornament": "#8ca78e"}, "fonts": {"heading": "Playfair Display", "body": "DM Sans", "quote": "Playfair Display", "scale": "1.0"}, "button_style": "rounded", "border_radius": "8px", "photo_frame": "arch", "ornament_style": "floral", "cover_style": "botanical_calm"}');
INSERT OR IGNORE INTO themes (code, name, description, is_preset, is_favorite, config_json) VALUES ('islamic_classic', 'Islamic Classic', 'Kemegahan motif geometri Arabesque, kubah masjid, dan kaligrafi emas suci.', 1, 1, '{"colors": {"primary": "#0a3328", "secondary": "#114f3e", "accent": "#d4af37", "gold": "#d4af37", "gold_gradient": "linear-gradient(135deg, #fae084 0%, #b8860b 100%)", "bg_cover": "radial-gradient(ellipse at center, #114f3e 0%, #0a3328 70%, #041d16 100%)", "bg_content": "#faf7ee", "bg_card": "#ffffff", "bg_alt": "#f2ecd8", "text_primary": "#183b30", "text_muted": "#688177", "text_eyebrow": "#d4af37", "text_cover": "#fffdf5", "btn_bg": "linear-gradient(135deg, #fae084 0%, #b8860b 100%)", "btn_text": "#0a3328", "line": "#ecdab9", "ornament": "#d4af37"}, "fonts": {"heading": "Amiri", "body": "Plus Jakarta Sans", "quote": "Amiri", "scale": "1.05"}, "button_style": "rounded", "border_radius": "8px", "photo_frame": "arch", "ornament_style": "islamic_floral", "cover_style": "islamic_dome"}');
INSERT OR IGNORE INTO themes (code, name, description, is_preset, is_favorite, config_json) VALUES ('minimalist_white', 'Minimalist White', 'Putih bersih, modern, rapi dengan tipografi kontemporer dan garis halus.', 1, 0, '{"colors": {"primary": "#1f2421", "secondary": "#333a36", "accent": "#4b5563", "gold": "#9ca3af", "gold_gradient": "linear-gradient(135deg, #e5e7eb 0%, #9ca3af 100%)", "bg_cover": "linear-gradient(135deg, #2b2d42 0%, #1f2421 100%)", "bg_content": "#ffffff", "bg_card": "#f9fafb", "bg_alt": "#f3f4f6", "text_primary": "#1f2421", "text_muted": "#6b7280", "text_eyebrow": "#4b5563", "text_cover": "#ffffff", "btn_bg": "#1f2421", "btn_text": "#ffffff", "line": "#e5e7eb", "ornament": "#9ca3af"}, "fonts": {"heading": "Plus Jakarta Sans", "body": "DM Sans", "quote": "Plus Jakarta Sans", "scale": "0.95"}, "button_style": "sharp", "border_radius": "4px", "photo_frame": "rounded_rect", "ornament_style": "modern_geometric", "cover_style": "clean_minimal"}');
INSERT OR IGNORE INTO themes (code, name, description, is_preset, is_favorite, config_json) VALUES ('royal_purple', 'Royal Purple', 'Ungu kerajaan megah bertabur emas kekaisaran yang memesona.', 1, 1, '{"colors": {"primary": "#2e0854", "secondary": "#481280", "accent": "#e0a96d", "gold": "#e0a96d", "gold_gradient": "linear-gradient(135deg, #f7d794 0%, #c98836 100%)", "bg_cover": "radial-gradient(ellipse at center, #481280 0%, #2e0854 70%, #18032e 100%)", "bg_content": "#fbf7ff", "bg_card": "#ffffff", "bg_alt": "#f3e8fc", "text_primary": "#2a0845", "text_muted": "#74578c", "text_eyebrow": "#e0a96d", "text_cover": "#fff8ff", "btn_bg": "linear-gradient(135deg, #f7d794 0%, #c98836 100%)", "btn_text": "#2e0854", "line": "#eddcf9", "ornament": "#e0a96d"}, "fonts": {"heading": "Cinzel", "body": "DM Sans", "quote": "Cormorant Garamond", "scale": "1.0"}, "button_style": "pill", "border_radius": "999px", "photo_frame": "double_frame", "ornament_style": "star_sparkle", "cover_style": "imperial_glow"}');

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS invitations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  category_code TEXT NOT NULL DEFAULT 'pernikahan',
  event_title TEXT DEFAULT '',
  event_data_json TEXT DEFAULT '{}',
  groom_name TEXT NOT NULL DEFAULT '',
  bride_name TEXT NOT NULL DEFAULT '',
  groom_parents TEXT DEFAULT '',
  bride_parents TEXT DEFAULT '',
  event_date TEXT DEFAULT '',
  event_time TEXT DEFAULT '',
  venue TEXT DEFAULT '',
  address TEXT DEFAULT '',
  maps_url TEXT DEFAULT '',
  quote_text TEXT DEFAULT '',
  story_text TEXT DEFAULT '',
  music_url TEXT DEFAULT '',
  cover_image TEXT DEFAULT '',
  gallery_json TEXT DEFAULT '[]',
  is_published INTEGER NOT NULL DEFAULT 1,
  theme_code TEXT DEFAULT 'emerald_gold',
  custom_theme_json TEXT DEFAULT '{}',
  animation_settings_json TEXT DEFAULT '{}',
  background_settings_json TEXT DEFAULT '{}',
  sound_settings_json TEXT DEFAULT '{}',
  design_settings_json TEXT DEFAULT '{}',
  privacy_type TEXT DEFAULT 'public',
  privacy_password TEXT DEFAULT '',
  publish_at TEXT DEFAULT '',
  view_count INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS event_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '💌',
  description TEXT DEFAULT '',
  fields_json TEXT NOT NULL DEFAULT '[]',
  default_sections_json TEXT NOT NULL DEFAULT '[]',
  is_active INTEGER NOT NULL DEFAULT 1,
  is_builtin INTEGER NOT NULL DEFAULT 0,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS guests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invitation_id INTEGER NOT NULL,
  guest_name TEXT NOT NULL,
  guest_token TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS rsvps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invitation_id INTEGER NOT NULL,
  guest_id INTEGER,
  guest_name TEXT NOT NULL,
  attendance TEXT NOT NULL CHECK(attendance IN ('hadir','tidak_hadir','ragu')),
  guest_count INTEGER NOT NULL DEFAULT 1,
  message TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE,
  FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE SET NULL
);

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

CREATE TABLE IF NOT EXISTS templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category_code TEXT NOT NULL DEFAULT 'pernikahan',
  description TEXT DEFAULT '',
  thumbnail_url TEXT DEFAULT '',
  theme_code TEXT DEFAULT 'emerald_gold',
  is_default INTEGER DEFAULT 0,
  config_json TEXT NOT NULL,
  sections_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS design_assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  asset_url TEXT NOT NULL,
  is_builtin INTEGER DEFAULT 0,
  metadata_json TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS design_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invitation_id INTEGER NOT NULL,
  version_name TEXT NOT NULL,
  snapshot_json TEXT NOT NULL,
  created_by TEXT DEFAULT 'admin',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS invitation_views (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invitation_id INTEGER NOT NULL,
  viewed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  guest_name TEXT DEFAULT '',
  ip_hash TEXT DEFAULT '',
  user_agent TEXT DEFAULT '',
  FOREIGN KEY (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_guests_invitation ON guests(invitation_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_invitation ON rsvps(invitation_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_guest ON rsvps(guest_id);
CREATE INDEX IF NOT EXISTS idx_invitations_category ON invitations(category_code);
CREATE INDEX IF NOT EXISTS idx_event_categories_order ON event_categories(order_index);
CREATE INDEX IF NOT EXISTS idx_invitation_sections_inv ON invitation_sections(invitation_id);
CREATE INDEX IF NOT EXISTS idx_invitation_sections_order ON invitation_sections(invitation_id, order_index);
CREATE INDEX IF NOT EXISTS idx_design_versions_inv ON design_versions(invitation_id);
CREATE INDEX IF NOT EXISTS idx_invitation_views_inv ON invitation_views(invitation_id);

import json

categories = [
    {
        'code': 'pernikahan',
        'name': 'Pernikahan',
        'icon': '💍',
        'description': 'Undangan pernikahan sakral, akad nikah, dan resepsi walimatul \'ursy.',
        'fields': [
            {'key': 'groom_name', 'label': 'Nama Mempelai Pria', 'type': 'text', 'required': True, 'placeholder': 'Ahmad Nur Syahid'},
            {'key': 'bride_name', 'label': 'Nama Mempelai Wanita', 'type': 'text', 'required': True, 'placeholder': 'Siti Sa\'diyah'},
            {'key': 'groom_parents', 'label': 'Orang Tua Mempelai Pria', 'type': 'text', 'required': False},
            {'key': 'bride_parents', 'label': 'Orang Tua Mempelai Wanita', 'type': 'text', 'required': False},
            {'key': 'event_date', 'label': 'Tanggal Pernikahan', 'type': 'date', 'required': True},
            {'key': 'event_time', 'label': 'Waktu Acara', 'type': 'text', 'required': False, 'placeholder': '08.00 WIB - selesai'},
            {'key': 'venue', 'label': 'Nama Tempat / Gedung', 'type': 'text', 'required': False},
            {'key': 'address', 'label': 'Alamat Lengkap', 'type': 'textarea', 'required': False},
            {'key': 'maps_url', 'label': 'Link Google Maps', 'type': 'url', 'required': False}
        ],
        'default_sections': ['cover', 'salam', 'profile', 'countdown', 'akad', 'reception', 'location', 'story', 'gallery', 'video', 'rsvp', 'guestbook', 'envelope', 'health_protocol', 'closing'],
        'order': 1
    },
    {
        'code': 'khitanan',
        'name': 'Khitanan / Sunatan',
        'icon': '✂️',
        'description': 'Tasyakuran walimatul khitan untuk anak tercinta.',
        'fields': [
            {'key': 'child_name', 'label': 'Nama Anak yang Dikhitan', 'type': 'text', 'required': True, 'placeholder': 'Muhammad Farhan Pratama'},
            {'key': 'child_nickname', 'label': 'Nama Panggilan Anak', 'type': 'text', 'required': False, 'placeholder': 'Farhan'},
            {'key': 'parents_name', 'label': 'Nama Orang Tua', 'type': 'text', 'required': True, 'placeholder': 'Bapak Hendra & Ibu Rina'},
            {'key': 'event_date', 'label': 'Tanggal Acara', 'type': 'date', 'required': True},
            {'key': 'event_time', 'label': 'Waktu Acara', 'type': 'text', 'required': False, 'placeholder': '09.00 - 13.00 WIB'},
            {'key': 'venue', 'label': 'Tempat Acara', 'type': 'text', 'required': False, 'placeholder': 'Kediaman Mempelai / Gedung'},
            {'key': 'address', 'label': 'Alamat Lengkap', 'type': 'textarea', 'required': False},
            {'key': 'maps_url', 'label': 'Link Google Maps', 'type': 'url', 'required': False}
        ],
        'default_sections': ['cover', 'salam', 'profile_child', 'countdown', 'event_detail', 'location', 'rundown', 'gallery', 'rsvp', 'guestbook', 'envelope', 'closing'],
        'order': 2
    },
    {
        'code': 'aqiqah',
        'name': 'Aqiqah',
        'icon': '👶',
        'description': 'Tasyakuran kelahiran dan penyembelihan aqiqah buah hati.',
        'fields': [
            {'key': 'baby_name', 'label': 'Nama Bayi', 'type': 'text', 'required': True, 'placeholder': 'Aisyah Ayudia Inara'},
            {'key': 'baby_gender', 'label': 'Jenis Kelamin', 'type': 'select', 'options': ['Perempuan', 'Laki-Laki'], 'required': True},
            {'key': 'parents_name', 'label': 'Nama Orang Tua', 'type': 'text', 'required': True, 'placeholder': 'Bapak Fajar & Ibu Anisa'},
            {'key': 'birth_date', 'label': 'Tanggal Lahir', 'type': 'date', 'required': False},
            {'key': 'event_date', 'label': 'Tanggal Tasyakuran', 'type': 'date', 'required': True},
            {'key': 'event_time', 'label': 'Waktu Acara', 'type': 'text', 'required': False, 'placeholder': '10.00 WIB - Selesai'},
            {'key': 'venue', 'label': 'Tempat Acara', 'type': 'text', 'required': False},
            {'key': 'address', 'label': 'Alamat Lengkap', 'type': 'textarea', 'required': False}
        ],
        'default_sections': ['cover', 'salam', 'profile_baby', 'countdown', 'event_detail', 'location', 'gallery', 'rsvp', 'guestbook', 'envelope', 'closing'],
        'order': 3
    },
    {
        'code': 'ulang_tahun',
        'name': 'Ulang Tahun / Birthday',
        'icon': '🎂',
        'description': 'Pesta perayaan ulang tahun anak, remaja (Sweet 17), maupun dewasa.',
        'fields': [
            {'key': 'person_name', 'label': 'Nama yang Berulang Tahun', 'type': 'text', 'required': True, 'placeholder': 'Nadia Safitri'},
            {'key': 'age_celebrated', 'label': 'Ulang Tahun ke-', 'type': 'number', 'required': True, 'placeholder': '17'},
            {'key': 'party_theme', 'label': 'Tema Pesta / Dresscode', 'type': 'text', 'required': False, 'placeholder': 'Glow in The Dark / Pastel Chic'},
            {'key': 'event_date', 'label': 'Tanggal Perayaan', 'type': 'date', 'required': True},
            {'key': 'event_time', 'label': 'Waktu Acara', 'type': 'text', 'required': False, 'placeholder': '16.00 - 20.00 WIB'},
            {'key': 'venue', 'label': 'Tempat / Kafe / Ballroom', 'type': 'text', 'required': False},
            {'key': 'address', 'label': 'Alamat Lengkap', 'type': 'textarea', 'required': False}
        ],
        'default_sections': ['cover', 'profile_person', 'countdown', 'event_detail', 'location', 'rundown', 'gallery', 'video', 'rsvp', 'guestbook', 'envelope', 'closing'],
        'order': 4
    },
    {
        'code': 'tasyakuran',
        'name': 'Tasyakuran',
        'icon': '🤲',
        'description': 'Tasyakuran rumah baru, hajat keluarga, atau syukuran pencapaian.',
        'fields': [
            {'key': 'host_name', 'label': 'Nama Tuan Rumah / Keluarga', 'type': 'text', 'required': True, 'placeholder': 'Keluarga Besar Bpk. H. Sukardi'},
            {'key': 'celebration_type', 'label': 'Jenis Tasyakuran', 'type': 'text', 'required': True, 'placeholder': 'Tasyakuran Rumah Baru & Doa Bersama'},
            {'key': 'event_date', 'label': 'Tanggal Acara', 'type': 'date', 'required': True},
            {'key': 'event_time', 'label': 'Waktu Acara', 'type': 'text', 'required': False, 'placeholder': 'Ba\'da Isya (19.30 WIB)'},
            {'key': 'venue', 'label': 'Tempat', 'type': 'text', 'required': False},
            {'key': 'address', 'label': 'Alamat Lengkap', 'type': 'textarea', 'required': False}
        ],
        'default_sections': ['cover', 'salam', 'description', 'countdown', 'event_detail', 'location', 'rundown', 'rsvp', 'guestbook', 'closing'],
        'order': 5
    },
    {
        'code': 'pengajian',
        'name': 'Pengajian & Tabligh Akbar',
        'icon': '🕌',
        'description': 'Kajian Islam, majelis taklim, dan tabligh akbar.',
        'fields': [
            {'key': 'event_name', 'label': 'Nama Pengajian / Majelis', 'type': 'text', 'required': True, 'placeholder': 'Kajian Akbar Menyambut Ramadhan'},
            {'key': 'speaker_name', 'label': 'Nama Penceramah / Ustadz', 'type': 'text', 'required': True, 'placeholder': 'Ustadz Dr. H. Khalid Basalamah, M.A.'},
            {'key': 'lecture_topic', 'label': 'Tema Tausiyah', 'type': 'text', 'required': False, 'placeholder': 'Meraih Keberkahan Hidup Berkeluarga'},
            {'key': 'organizer_name', 'label': 'Penyelenggara / DKM', 'type': 'text', 'required': False, 'placeholder': 'DKM Masjid Raya Al-Ukhuwah'},
            {'key': 'event_date', 'label': 'Hari & Tanggal', 'type': 'date', 'required': True},
            {'key': 'event_time', 'label': 'Waktu Acara', 'type': 'text', 'required': False, 'placeholder': '08.30 - 11.30 WIB'},
            {'key': 'venue', 'label': 'Masjid / Lokasi', 'type': 'text', 'required': False},
            {'key': 'address', 'label': 'Alamat Lengkap', 'type': 'textarea', 'required': False}
        ],
        'default_sections': ['cover', 'salam', 'profile_speaker', 'countdown', 'event_detail', 'location', 'rundown', 'rsvp', 'guestbook', 'closing'],
        'order': 6
    },
    {
        'code': 'wisuda',
        'name': 'Wisuda & Kelulusan',
        'icon': '🎓',
        'description': 'Perayaan kelulusan dan tasyakuran wisuda sarjana / sekolah.',
        'fields': [
            {'key': 'graduate_name', 'label': 'Nama Wisudawan', 'type': 'text', 'required': True, 'placeholder': 'Rizky Ramadhan, S.Kom'},
            {'key': 'institution_name', 'label': 'Nama Universitas / Sekolah', 'type': 'text', 'required': True, 'placeholder': 'Institut Teknologi Bandung'},
            {'key': 'faculty_major', 'label': 'Fakultas / Jurusan', 'type': 'text', 'required': False, 'placeholder': 'Sekolah Teknik Elektro & Informatika'},
            {'key': 'parents_name', 'label': 'Nama Orang Tua', 'type': 'text', 'required': False},
            {'key': 'event_date', 'label': 'Tanggal Acara', 'type': 'date', 'required': True},
            {'key': 'event_time', 'label': 'Waktu Acara', 'type': 'text', 'required': False},
            {'key': 'venue', 'label': 'Gedung / Tempat', 'type': 'text', 'required': False},
            {'key': 'address', 'label': 'Alamat', 'type': 'textarea', 'required': False}
        ],
        'default_sections': ['cover', 'salam', 'profile_person', 'countdown', 'event_detail', 'location', 'gallery', 'rsvp', 'guestbook', 'envelope', 'closing'],
        'order': 7
    },
    {
        'code': 'peresmian',
        'name': 'Peresmian / Grand Opening',
        'icon': '🏢',
        'description': 'Grand opening toko, peresmian kantor, usaha, atau fasilitas.',
        'fields': [
            {'key': 'business_name', 'label': 'Nama Usaha / Perusahaan', 'type': 'text', 'required': True, 'placeholder': 'Kopi Nusantara Grand Cafe'},
            {'key': 'owner_name', 'label': 'Nama Pemilik / Manajemen', 'type': 'text', 'required': False, 'placeholder': 'PT Sumber Berkah Sejahtera'},
            {'key': 'event_date', 'label': 'Tanggal Peresmian', 'type': 'date', 'required': True},
            {'key': 'event_time', 'label': 'Waktu Acara', 'type': 'text', 'required': False, 'placeholder': '10.00 WIB - Selesai'},
            {'key': 'venue', 'label': 'Lokasi', 'type': 'text', 'required': False},
            {'key': 'address', 'label': 'Alamat Lengkap', 'type': 'textarea', 'required': False}
        ],
        'default_sections': ['cover', 'description', 'countdown', 'event_detail', 'location', 'rundown', 'gallery', 'rsvp', 'guestbook', 'closing'],
        'order': 8
    },
    {
        'code': 'reuni',
        'name': 'Reuni & Temu Kangen',
        'icon': '🤝',
        'description': 'Temu kangen alumni sekolah, kampus, atau komunitas.',
        'fields': [
            {'key': 'community_name', 'label': 'Nama Angkatan / Komunitas', 'type': 'text', 'required': True, 'placeholder': 'Reuni Akbar Perak Alumni 2002'},
            {'key': 'institution_name', 'label': 'Nama Sekolah / Kampus', 'type': 'text', 'required': True, 'placeholder': 'SMAN 1 Kota Bandung'},
            {'key': 'reunion_theme', 'label': 'Tema Reuni', 'type': 'text', 'required': False, 'placeholder': 'Menjalin Silaturahmi, Merajut Kenangan'},
            {'key': 'event_date', 'label': 'Tanggal Acara', 'type': 'date', 'required': True},
            {'key': 'event_time', 'label': 'Waktu Acara', 'type': 'text', 'required': False, 'placeholder': '09.00 - 15.00 WIB'},
            {'key': 'venue', 'label': 'Tempat', 'type': 'text', 'required': False},
            {'key': 'address', 'label': 'Alamat Lengkap', 'type': 'textarea', 'required': False}
        ],
        'default_sections': ['cover', 'description', 'countdown', 'event_detail', 'location', 'rundown', 'gallery', 'rsvp', 'guestbook', 'closing'],
        'order': 9
    },
    {
        'code': 'haul',
        'name': 'Haul & Peringatan',
        'icon': '🕯️',
        'description': 'Peringatan haul ulama, tokoh, atau keluarga tercinta.',
        'fields': [
            {'key': 'commemorated_name', 'label': 'Nama yang Diperingati', 'type': 'text', 'required': True, 'placeholder': 'Alm. KH. M. Sholeh Qosim'},
            {'key': 'commemorated_title', 'label': 'Keterangan Peringatan', 'type': 'text', 'required': False, 'placeholder': 'Peringatan Haul ke-10 & Khotmil Qur\'an'},
            {'key': 'family_name', 'label': 'Keluarga / Penyelenggara', 'type': 'text', 'required': False, 'placeholder': 'Keluarga Besar Bani Sholeh'},
            {'key': 'event_date', 'label': 'Tanggal Acara', 'type': 'date', 'required': True},
            {'key': 'event_time', 'label': 'Waktu Acara', 'type': 'text', 'required': False, 'placeholder': 'Ba\'da Maghrib'},
            {'key': 'venue', 'label': 'Tempat Acara', 'type': 'text', 'required': False},
            {'key': 'address', 'label': 'Alamat', 'type': 'textarea', 'required': False}
        ],
        'default_sections': ['cover', 'salam', 'description', 'countdown', 'event_detail', 'location', 'rundown', 'rsvp', 'guestbook', 'closing'],
        'order': 10
    },
    {
        'code': 'acara_islami',
        'name': 'Peringatan Hari Besar Islam',
        'icon': '🌙',
        'description': 'Maulid Nabi, Isra Mi\'raj, Nuzulul Qur\'an, Tabligh Akbar.',
        'fields': [
            {'key': 'celebration_name', 'label': 'Nama Hari Besar', 'type': 'text', 'required': True, 'placeholder': 'Peringatan Maulid Nabi Muhammad SAW 1448 H'},
            {'key': 'theme_text', 'label': 'Tema Acara', 'type': 'text', 'required': False, 'placeholder': 'Meneladani Akhlak Mulia Rasulullah SAW'},
            {'key': 'speaker_name', 'label': 'Penceramah Tamu', 'type': 'text', 'required': False, 'placeholder': 'Habib Jindan bin Novel bin Jindan'},
            {'key': 'committee_name', 'label': 'Panitia Penyelenggara', 'type': 'text', 'required': False, 'placeholder': 'Majelis Ta\'lim Darul Musthofa'},
            {'key': 'event_date', 'label': 'Hari & Tanggal', 'type': 'date', 'required': True},
            {'key': 'event_time', 'label': 'Waktu Acara', 'type': 'text', 'required': False},
            {'key': 'venue', 'label': 'Lokasi', 'type': 'text', 'required': False},
            {'key': 'address', 'label': 'Alamat', 'type': 'textarea', 'required': False}
        ],
        'default_sections': ['cover', 'salam', 'profile_speaker', 'countdown', 'event_detail', 'location', 'rundown', 'rsvp', 'guestbook', 'closing'],
        'order': 11
    },
    {
        'code': 'umum',
        'name': 'Undangan Umum / Kustom',
        'icon': '📜',
        'description': 'Acara bebas apa pun: pameran, gathering, konser, seminar, dll.',
        'fields': [
            {'key': 'event_title', 'label': 'Judul Acara', 'type': 'text', 'required': True, 'placeholder': 'Annual Gathering & Awarding Night'},
            {'key': 'host_name', 'label': 'Penyelenggara / Host', 'type': 'text', 'required': True, 'placeholder': 'Komunitas Kreatif Digital'},
            {'key': 'event_desc', 'label': 'Deskripsi Acara', 'type': 'textarea', 'required': False},
            {'key': 'event_date', 'label': 'Tanggal Acara', 'type': 'date', 'required': True},
            {'key': 'event_time', 'label': 'Waktu Acara', 'type': 'text', 'required': False},
            {'key': 'venue', 'label': 'Tempat', 'type': 'text', 'required': False},
            {'key': 'address', 'label': 'Alamat', 'type': 'textarea', 'required': False}
        ],
        'default_sections': ['cover', 'description', 'countdown', 'event_detail', 'location', 'rundown', 'gallery', 'rsvp', 'guestbook', 'closing'],
        'order': 12
    }
]

mig_sql = '''-- ====================================================================
-- MIGRATION 0003: MULTI-EVENT PLATFORM & CUSTOM EVENT BUILDER
-- Mengubah Emerald Gold Wedding menjadi platform UNDANGAN V2 multi-acara.
-- Aman dan menjaga seluruh data lama (pernikahan) tetap utuh 100%.
-- ====================================================================

PRAGMA foreign_keys = ON;

-- 1. Tambah kolom multi-event pada tabel invitations
ALTER TABLE invitations ADD COLUMN category_code TEXT DEFAULT 'pernikahan';
ALTER TABLE invitations ADD COLUMN event_title TEXT DEFAULT '';
ALTER TABLE invitations ADD COLUMN event_data_json TEXT DEFAULT '{}';
ALTER TABLE templates ADD COLUMN category_code TEXT DEFAULT 'pernikahan';

-- 2. Buat tabel event_categories (Custom Event Builder)
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

CREATE INDEX IF NOT EXISTS idx_invitations_category ON invitations(category_code);
CREATE INDEX IF NOT EXISTS idx_event_categories_order ON event_categories(order_index);

-- 3. Masukkan 12 kategori acara bawaan
'''

for cat in categories:
    f_json = json.dumps(cat['fields'], ensure_ascii=False).replace("'", "''")
    s_json = json.dumps(cat['default_sections'], ensure_ascii=False).replace("'", "''")
    desc_esc = cat['description'].replace("'", "''")
    name_esc = cat['name'].replace("'", "''")
    mig_sql += f"INSERT OR IGNORE INTO event_categories (code, name, icon, description, fields_json, default_sections_json, is_active, is_builtin, order_index) VALUES ('{cat['code']}', '{name_esc}', '{cat['icon']}', '{desc_esc}', '{f_json}', '{s_json}', 1, 1, {cat['order']});\n"

with open('migrations/0003_multi_event_platform.sql', 'w') as f:
    f.write(mig_sql)

print('Generated migrations/0003_multi_event_platform.sql successfully.')

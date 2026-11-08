import json

with open('migrations/0002_studios_and_builder.sql') as f:
    mig_lines = f.readlines()

theme_inserts = [line for line in mig_lines if line.startswith('INSERT OR IGNORE INTO themes')]

anim_settings = {
    'enabled': True,
    'reduce_motion_respect': True,
    'opening': {
        'type': 'envelope',
        'duration': 1.2,
        'delay': 0.2,
        'intensity': 'moderate'
    },
    'text': {
        'type': 'fade_up',
        'duration': 0.8,
        'delay': 0.15,
        'intensity': 'moderate'
    },
    'photo': {
        'type': 'ken_burns',
        'duration': 1.0,
        'intensity': 'subtle'
    },
    'ornament': {
        'type': 'gold_dust',
        'speed': 'normal',
        'intensity': 'moderate'
    },
    'transition': {
        'type': 'smooth_fade',
        'duration': 0.6
    }
}

bg_settings = {
    'type': 'gradient',
    'color': '#073f35',
    'gradient': 'radial-gradient(ellipse at center, #155e4c 0%, #073f35 65%, #052d27 100%)',
    'pattern': 'arabesque',
    'pattern_opacity': 0.08,
    'image_url': '',
    'image_opacity': 0.15,
    'particles': 'gold_dust',
    'particles_intensity': 'medium',
    'show_floral_corner': True,
    'show_islamic_arch': True,
    'divider_style': 'diamond'
}

sound_settings = {
    'enabled': True,
    'music_title': 'Romantic Piano & Strings (Royalty-Free)',
    'music_url': 'https://assets.mixkit.co/music/preview/mixkit-wedding-waltz-piano-242.mp3',
    'volume': 0.75,
    'autoplay_on_open': True,
    'button_icon': 'vinyl',
    'button_pos': 'bottom-right',
    'button_animation': 'spin'
}

design_settings = {
    'heading_font': 'Playfair Display',
    'body_font': 'DM Sans',
    'font_scale': 'medium',
    'button_shape': 'rounded',
    'button_radius': '8px',
    'card_radius': '12px',
    'photo_frame': 'arch',
    'section_spacing': 'standard',
    'gallery_layout': 'grid2'
}

sections_data = [
    {
        'key': 'cover',
        'title': 'The Wedding of',
        'subtitle': 'Ahmad & Siti',
        'content': {
            'eyebrow': 'THE WEDDING OF',
            'groom_name': 'Ahmad Nur Syahid',
            'bride_name': "Siti Sa'diyah",
            'event_date': '2027-06-20',
            'guest_greeting_label': 'Kepada Yth. Bapak/Ibu/Saudara/i',
            'button_text': '✧ Buka Undangan ✧',
            'cover_photo': 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
            'bismillah_text': 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ'
        },
        'order': 1,
        'visible': 1
    },
    {
        'key': 'salam',
        'title': 'Assalamu’alaikum Warahmatullahi Wabarakatuh',
        'subtitle': 'Ungkapan Rasa Syukur',
        'content': {
            'bismillah': 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
            'greeting': 'Assalamu’alaikum Warahmatullahi Wabarakatuh',
            'quote_verse': 'Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.',
            'quote_source': 'QS. Ar-Rum: 21',
            'lead_text': 'Dengan memohon rahmat dan ridha Allah SWT, kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri hari bahagia kami:'
        },
        'order': 2,
        'visible': 1
    },
    {
        'key': 'profile',
        'title': 'Mempelai Pengantin',
        'subtitle': 'Sang Mempelai',
        'content': {
            'groom': {
                'name': 'Ahmad Nur Syahid, S.Kom',
                'nickname': 'Ahmad',
                'parents': 'Putra pertama dari Bapak Tasimun & Ibu Musriyati',
                'instagram': '@ahmad.nursyahid',
                'photo': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
            },
            'bride': {
                'name': "Siti Sa'diyah, S.Pd",
                'nickname': 'Siti',
                'parents': 'Putri kedua dari Alm. Bapak Dadang Sobandi & Ibu Oom Fathonah',
                'instagram': '@siti.sadiyah',
                'photo': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80'
            }
        },
        'order': 3,
        'visible': 1
    },
    {
        'key': 'countdown',
        'title': 'Menghitung Hari Bahagia',
        'subtitle': 'Save The Date',
        'content': {
            'event_date': '2027-06-20T08:00:00',
            'note': 'Kami tak sabar menanti kehadiran Anda di hari istimewa kami'
        },
        'order': 4,
        'visible': 1
    },
    {
        'key': 'akad',
        'title': 'Akad Nikah',
        'subtitle': 'Ikrar Sakral',
        'content': {
            'date': 'Minggu, 20 Juni 2027',
            'time': '08.00 - 10.00 WIB',
            'venue': 'Masjid Al-Barokah',
            'address': 'Jl. Emerald Sanctuary No. 8, Bandung, Jawa Barat',
            'maps_url': 'https://maps.google.com/?q=Bandung',
            'badge': 'Akad Nikah'
        },
        'order': 5,
        'visible': 1
    },
    {
        'key': 'reception',
        'title': 'Resepsi Pernikahan',
        'subtitle': 'Walimatul \'Ursy',
        'content': {
            'date': 'Minggu, 20 Juni 2027',
            'time': '11.00 WIB - 14.00 WIB (Selesai)',
            'venue': 'Emerald Grand Ballroom',
            'address': 'Jl. Raya Soreang - Banjaran No. 88, Katapang, Bandung',
            'maps_url': 'https://maps.google.com/?q=Katapang+Bandung',
            'dresscode': 'Formal / Batik / Sage & Gold Touch',
            'badge': 'Resepsi'
        },
        'order': 6,
        'visible': 1
    },
    {
        'key': 'location',
        'title': 'Lokasi Acara',
        'subtitle': 'Peta & Petunjuk Arah',
        'content': {
            'venue': 'Emerald Grand Ballroom',
            'address': 'Jl. Raya Soreang - Banjaran No. 88, Katapang, Bandung, Jawa Barat',
            'maps_url': 'https://maps.google.com/?q=Katapang+Bandung',
            'waze_url': 'https://waze.com/ul?q=Katapang+Bandung',
            'embed_url': ''
        },
        'order': 7,
        'visible': 1
    },
    {
        'key': 'story',
        'title': 'Kisah Cinta Kami',
        'subtitle': 'Our Journey',
        'content': {
            'intro': 'Setiap kisah memiliki bab pertama. Inilah babak perjalanan cinta yang mempertemukan kami:',
            'milestones': [
                {
                    'year': '2023',
                    'title': 'Pertemuan Pertama',
                    'description': 'Pertama kali bertegur sapa dalam sebuah proyek sosial literasi anak muda di Bandung.'
                },
                {
                    'year': '2025',
                    'title': 'Khitbah & Komitmen',
                    'description': 'Dengan ridha kedua orang tua dan niat suci beribadah, kami memantapkan langkah menuju jenjang pernikahan.'
                },
                {
                    'year': '2027',
                    'title': 'Menuju Gerbang Halal',
                    'description': 'Menyatukan dua hati, dua keluarga, dalam ikatan sakral pernikahan yang abadi.'
                }
            ]
        },
        'order': 8,
        'visible': 1
    },
    {
        'key': 'gallery',
        'title': 'Galeri Momen',
        'subtitle': 'Sweet Memories',
        'content': {
            'layout': 'grid',
            'photos': [
                'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
                'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80',
                'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=80',
                'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=600&q=80'
            ]
        },
        'order': 9,
        'visible': 1
    },
    {
        'key': 'video',
        'title': 'Video Prewedding',
        'subtitle': 'Teaser Kenangan',
        'content': {
            'video_url': 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            'caption': 'Cuplikan teaser video kebersamaan kami.'
        },
        'order': 10,
        'visible': 1
    },
    {
        'key': 'rsvp',
        'title': 'Konfirmasi Kehadiran',
        'subtitle': 'RSVP',
        'content': {
            'note': 'Kehadiran dan doa restu Anda merupakan hadiah terindah bagi kami.',
            'max_guests': 5
        },
        'order': 11,
        'visible': 1
    },
    {
        'key': 'guestbook',
        'title': 'Buku Tamu & Doa Restu',
        'subtitle': 'Wishes & Prayers',
        'content': {
            'note': 'Tinggalkan doa dan harapan terbaik untuk kedua mempelai.'
        },
        'order': 12,
        'visible': 1
    },
    {
        'key': 'envelope',
        'title': 'Tanda Kasih & Hadiah',
        'subtitle': 'Digital Gift & Kado',
        'content': {
            'note': 'Doa restu Anda adalah karunia terindah. Namun jika ingin memberikan tanda kasih secara digital, Anda dapat melalui rekening atau dompet digital berikut:',
            'accounts': [
                {
                    'bank': 'BCA',
                    'number': '8420192831',
                    'holder': 'Ahmad Nur Syahid'
                },
                {
                    'bank': 'Bank Syariah Indonesia (BSI)',
                    'number': '7192830192',
                    'holder': "Siti Sa'diyah"
                },
                {
                    'bank': 'DANA / GoPay',
                    'number': '081234567890',
                    'holder': 'Ahmad Nur Syahid'
                }
            ],
            'shipping_address': 'Emerald Residence Blok C-12, Katapang, Kabupaten Bandung 40921 (Up: Ahmad & Siti)'
        },
        'order': 13,
        'visible': 1
    },
    {
        'key': 'health_protocol',
        'title': 'Kenyamanan Acara',
        'subtitle': 'Panduan Kehadiran',
        'content': {
            'items': [
                {'icon': '✨', 'title': 'Hadir Tepat Waktu', 'desc': 'Mohon berkenan hadir sesuai jam acara agar prosesi berjalan khidmat.'},
                {'icon': '👗', 'title': 'Dress Code', 'desc': 'Nuansa warna Sage, Gold, atau busana batik formal sopan.'},
                {'icon': '🤲', 'title': 'Doa & Restu', 'desc': 'Memberikan doa tulus bagi kelanggengan kedua mempelai.'}
            ]
        },
        'order': 14,
        'visible': 1
    },
    {
        'key': 'closing',
        'title': 'Terima Kasih',
        'subtitle': 'Wassalamu’alaikum Warahmatullahi Wabarakatuh',
        'content': {
            'message': 'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu kepada kami.',
            'footer_names': "Ahmad Nur Syahid & Siti Sa'diyah",
            'family_closing': 'Beserta Keluarga Besar Kedua Mempelai'
        },
        'order': 15,
        'visible': 1
    }
]

anim_str = json.dumps(anim_settings, ensure_ascii=False).replace("'", "''")
bg_str = json.dumps(bg_settings, ensure_ascii=False).replace("'", "''")
sound_str = json.dumps(sound_settings, ensure_ascii=False).replace("'", "''")
design_str = json.dumps(design_settings, ensure_ascii=False).replace("'", "''")

t1_sections_str = json.dumps(sections_data, ensure_ascii=False).replace("'", "''")
t1_config = {
    'theme_code': 'emerald_gold',
    'animation_settings': anim_settings,
    'background_settings': bg_settings,
    'sound_settings': sound_settings,
    'design_settings': design_settings
}
t1_config_str = json.dumps(t1_config, ensure_ascii=False).replace("'", "''")

seed_sql = f"""-- ====================================================================
-- SEED DATA: EMERALD GOLD WEDDING V2
-- Preset themes, default demo invitation with sections, and assets
-- ====================================================================

-- 1. Insert 10 Preset Themes
{''.join(theme_inserts)}

-- 2. Insert or update demo invitation
INSERT OR REPLACE INTO invitations
(id, slug, groom_name, bride_name, groom_parents, bride_parents, event_date, event_time, venue, address, maps_url, quote_text, story_text, music_url, cover_image, gallery_json, is_published, theme_code, custom_theme_json, animation_settings_json, background_settings_json, sound_settings_json, design_settings_json, privacy_type, privacy_password, publish_at, view_count)
VALUES
(1, 'demo', 'Ahmad Nur Syahid', 'Siti Sa''diyah', 'Bapak Tasimun & Ibu Musriyati', 'Alm. Bapak Dadang Sobandi & Ibu Oom Fathonah', '2027-06-20', '08.00 WIB - selesai', 'Emerald Grand Ballroom', 'Jl. Raya Soreang - Banjaran No. 88, Katapang, Bandung', 'https://maps.google.com/?q=Katapang+Bandung', 'Maha Suci Allah yang telah menciptakan makhluk-Nya berpasang-pasangan.', 'Dengan memohon rahmat dan ridha Allah SWT, kami bermaksud menyelenggarakan pernikahan.', 'https://assets.mixkit.co/music/preview/mixkit-wedding-waltz-piano-242.mp3', 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80', '[\"https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80\",\"https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80\",\"https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=80\"]', 1, 'emerald_gold',
'{{}}',
'{anim_str}',
'{bg_str}',
'{sound_str}',
'{design_str}',
'public', '', '', 12);

-- 3. Insert demo sections
DELETE FROM invitation_sections WHERE invitation_id = 1;
"""

for s in sections_data:
    cj = json.dumps(s['content'], ensure_ascii=False).replace("'", "''")
    t_esc = s['title'].replace("'", "''")
    sub_esc = s['subtitle'].replace("'", "''")
    seed_sql += f"INSERT INTO invitation_sections (invitation_id, section_key, title, subtitle, content_json, style_json, order_index, is_visible) VALUES (1, '{s['key']}', '{t_esc}', '{sub_esc}', '{cj}', '{{}}', {s['order']}, {s['visible']});\n"

seed_sql += f"""
-- 4. Default Templates
INSERT OR IGNORE INTO templates (name, description, thumbnail_url, theme_code, is_default, config_json, sections_json)
VALUES
('Emerald Gold Luxury (Default)', 'Template klasik mewah hijau zamrud dan emas dengan 15 seksi lengkap.', 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80', 'emerald_gold', 1, '{t1_config_str}', '{t1_sections_str}');

-- 5. Design Assets
INSERT OR IGNORE INTO design_assets (category, name, asset_url, is_builtin, metadata_json)
VALUES
('ornament_islamic', 'Islamic Arch Gold', 'data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 60\"><path d=\"M10,60 Q50,-10 90,60\" fill=\"none\" stroke=\"%23d8b66a\" stroke-width=\"2\"/></svg>', 1, '{{\"tag\":\"arch\"}}'),
('ornament_floral', 'Corner Floral Gold', 'data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><path d=\"M0,0 Q60,10 60,60 Q10,60 0,0\" fill=\"none\" stroke=\"%23d8b66a\" stroke-width=\"2\"/></svg>', 1, '{{\"tag\":\"corner\"}}'),
('audio', 'Romantic Piano & Strings', 'https://assets.mixkit.co/music/preview/mixkit-wedding-waltz-piano-242.mp3', 1, '{{\"duration\":\"2:15\",\"genre\":\"Romantic\"}}'),
('audio', 'Acoustic Guitar Romance', 'https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3', 1, '{{\"duration\":\"1:54\",\"genre\":\"Acoustic\"}}'),
('audio', 'Islamic Oud & Strings', 'https://assets.mixkit.co/music/preview/mixkit-oriental-vibes-2920.mp3', 1, '{{\"duration\":\"2:04\",\"genre\":\"Islamic\"}}');

-- 6. Demo Guest & RSVP
INSERT OR IGNORE INTO guests (id, invitation_id, guest_name, guest_token)
VALUES
(1, 1, 'Bapak Ridwan Kamil & Keluarga', 'rk2027sampletoken'),
(2, 1, 'Ibu Hj. Siti Nurhaliza', 'sn2027sampletoken');

INSERT OR IGNORE INTO rsvps (id, invitation_id, guest_id, guest_name, attendance, guest_count, message)
VALUES
(1, 1, 1, 'Bapak Ridwan Kamil & Keluarga', 'hadir', 2, 'Selamat menempuh hidup baru untuk Ahmad dan Siti. Semoga menjadi keluarga sakinah, mawaddah, warahmah.'),
(2, 1, 2, 'Ibu Hj. Siti Nurhaliza', 'hadir', 1, 'Barakallahu lakuma wa baraka alaikuma wa jama''a bainakuma fii khoir.');
"""

with open('seed.sql', 'w') as f:
    f.write(seed_sql)

print('Generated seed.sql successfully.')

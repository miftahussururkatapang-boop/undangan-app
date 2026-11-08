import { json, requireAdmin, safeJson, deepMerge } from '../_utils.js';

export async function onRequestGet({ params, request, env }) {
  const slug = params.slug;
  const row = await env.DB.prepare(`
    SELECT i.*,
      c.name AS category_name,
      c.icon AS category_icon,
      c.description AS category_description
    FROM invitations i
    LEFT JOIN event_categories c ON c.code = i.category_code
    WHERE i.slug = ?
  `).bind(slug).first();

  if (!row) {
    return json({ error: 'Undangan tidak ditemukan.' }, 404);
  }

  const url = new URL(request.url);
  const isAdmin = await requireAdmin(request, env);
  const isPreview = !row.is_published || url.searchParams.get('preview') === '1';

  // 1. Cek status publikasi
  if (!row.is_published && !isAdmin) {
    return json({ error: 'Undangan ini masih berupa draf dan belum diterbitkan.' }, 403);
  }

  // 2. Cek jadwal publikasi
  if (row.publish_at && !isAdmin) {
    const pubDate = new Date(row.publish_at).getTime();
    if (pubDate > Date.now()) {
      return json({
        error: `Undangan ini dijadwalkan terbit pada ${new Date(row.publish_at).toLocaleString('id-ID')}. Silakan kunjungi kembali nanti.`
      }, 403);
    }
  }

  // 3. Cek tamu dan token
  const token = url.searchParams.get('token');
  const toParam = url.searchParams.get('to');
  let guestRecord = null;
  let guestToken = null;

  if (token) {
    const guest = await env.DB.prepare('SELECT id, guest_name, guest_token FROM guests WHERE invitation_id=? AND guest_token=?')
      .bind(row.id, token)
      .first();
    if (guest) {
      guestRecord = guest;
      guestToken = guest.guest_token;
    }
  }

  // 4. Cek privasi undangan
  const privacyType = row.privacy_type || 'public';
  if (!isAdmin) {
    if (privacyType === 'token_only' && !guestToken) {
      return json({
        error: 'Undangan ini bersifat privat. Akses memerlukan link personal khusus tamu undangan.',
        privacy_type: 'token_only'
      }, 403);
    }

    if (privacyType === 'password') {
      const providedPw = url.searchParams.get('pw') || request.headers.get('x-invitation-password') || '';
      if (!providedPw || providedPw !== row.privacy_password) {
        return json({
          error: 'Undangan ini dilindungi kata sandi.',
          requires_password: true,
          privacy_type: 'password'
        }, 401);
      }
    }
  }

  // 5. Catat statistik kunjungan (hanya jika bukan pratinjau admin)
  if (!isAdmin && row.is_published) {
    try {
      const guestName = guestRecord?.guest_name || toParam || 'Tamu Publik';
      const userAgent = request.headers.get('user-agent') || '';
      const ip = request.headers.get('cf-connecting-ip') || '';
      const ipHash = ip ? btoa(ip).slice(0, 16) : '';

      await env.DB.prepare('UPDATE invitations SET view_count = COALESCE(view_count, 0) + 1 WHERE id=?').bind(row.id).run();
      await env.DB.prepare('INSERT INTO invitation_views (invitation_id, guest_name, ip_hash, user_agent) VALUES (?, ?, ?, ?)')
        .bind(row.id, guestName.slice(0, 100), ipHash, userAgent.slice(0, 200)).run();
    } catch {
      // Abaikan kegagalan analitik minor
    }
  }

  // 6. Muat konfigurasi tema
  const themeCode = row.theme_code || 'emerald_gold';
  const themeRow = await env.DB.prepare('SELECT code, name, config_json FROM themes WHERE code=?').bind(themeCode).first();
  const baseThemeConfig = themeRow ? safeJson(themeRow.config_json, {}) : {};
  const customThemeConfig = safeJson(row.custom_theme_json, {});
  const resolvedTheme = deepMerge(baseThemeConfig, customThemeConfig);

  // 7. Muat pengaturan studio
  const animationSettings = safeJson(row.animation_settings_json, {
    enabled: true,
    opening: { type: 'envelope', duration: 1.2 },
    text: { type: 'fade_up' },
    photo: { type: 'ken_burns' },
    ornament: { type: 'gold_dust' },
    transition: { type: 'smooth_fade' }
  });

  const backgroundSettings = safeJson(row.background_settings_json, {
    type: 'gradient',
    pattern: 'arabesque',
    particles: 'gold_dust',
    show_floral_corner: true,
    show_islamic_arch: true
  });

  const soundSettings = safeJson(row.sound_settings_json, {
    enabled: !!row.music_url,
    music_url: row.music_url || '',
    volume: 0.8,
    autoplay_on_open: true,
    button_icon: 'vinyl'
  });

  const designSettings = safeJson(row.design_settings_json, {
    font_scale: 'medium',
    button_shape: 'rounded',
    photo_frame: 'arch'
  });

  // 8. Muat komponen seksi
  const { results: sectionRows = [] } = await env.DB.prepare(
    'SELECT id, section_key, title, subtitle, content_json, style_json, order_index FROM invitation_sections WHERE invitation_id=? AND is_visible=1 ORDER BY order_index ASC'
  ).bind(row.id).all();

  let sections = sectionRows.map(s => ({
    id: s.id,
    key: s.section_key,
    title: s.title || '',
    subtitle: s.subtitle || '',
    content: safeJson(s.content_json, {}),
    style: safeJson(s.style_json, {}),
    order: s.order_index
  }));

  // Fallback untuk undangan legacy yang belum memiliki seksi di invitation_sections
  if (sections.length === 0) {
    sections = createDefaultSectionsFromRow(row);
  }

  // Buang password sebelum dikirim ke publik
  const safeInvitation = { ...row };
  delete safeInvitation.privacy_password;

  const eventData = safeJson(row.event_data_json, {});

  return json({
    invitation: safeInvitation,
    category_code: row.category_code || 'pernikahan',
    category_name: row.category_name || 'Pernikahan',
    category_icon: row.category_icon || '💍',
    event_title: row.event_title || '',
    event_data: eventData,
    theme_code: themeCode,
    theme: resolvedTheme,
    animation_settings: animationSettings,
    background_settings: backgroundSettings,
    sound_settings: soundSettings,
    design_settings: designSettings,
    sections,
    guest: guestRecord ? { name: guestRecord.guest_name, token: guestRecord.guest_token } : (toParam ? { name: toParam } : null),
    guestToken,
    is_preview: isPreview && isAdmin
  });
}

function createDefaultSectionsFromRow(row) {
  const gallery = safeJson(row.gallery_json, []);
  const title = row.event_title || (row.groom_name ? (row.bride_name ? `${row.groom_name} & ${row.bride_name}` : row.groom_name) : 'Undangan');

  return [
    {
      key: 'cover',
      title: 'Undangan Resmi',
      subtitle: title,
      content: {
        eyebrow: (row.category_name || 'UNDANGAN RESMI').toUpperCase(),
        main_name: title,
        groom_name: row.groom_name,
        bride_name: row.bride_name,
        event_date: row.event_date,
        guest_greeting_label: 'Kepada Yth. Bapak/Ibu/Saudara/i',
        button_text: '✧ Buka Undangan ✧',
        cover_photo: row.cover_image || ''
      },
      order: 1
    },
    {
      key: 'salam',
      title: 'Salam Pembuka',
      subtitle: 'Ungkapan Syukur',
      content: {
        bismillah: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        greeting: 'Assalamu’alaikum Warahmatullahi Wabarakatuh',
        quote_verse: row.quote_text || 'Dengan memohon rahmat dan ridha Allah SWT, kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara kami.'
      },
      order: 2
    },
    {
      key: 'event_detail',
      title: 'Waktu & Tempat Pelaksanaan',
      subtitle: 'Detail Acara',
      content: {
        time: row.event_time || '',
        venue: row.venue || '',
        address: row.address || '',
        maps_url: row.maps_url || ''
      },
      order: 3
    },
    {
      key: 'location',
      title: 'Petunjuk Lokasi',
      subtitle: 'Peta',
      content: {
        venue: row.venue || '',
        address: row.address || '',
        maps_url: row.maps_url || ''
      },
      order: 4
    },
    {
      key: 'gallery',
      title: 'Galeri Momen',
      subtitle: 'Dokumentasi',
      content: { photos: gallery },
      order: 5
    },
    {
      key: 'rsvp',
      title: 'Konfirmasi Kehadiran',
      subtitle: 'RSVP',
      content: { note: 'Mohon konfirmasi kehadiran demi kelancaran acara.' },
      order: 6
    },
    {
      key: 'guestbook',
      title: 'Buku Tamu & Ucapan',
      subtitle: 'Doa Restu Tamu',
      content: {},
      order: 7
    },
    {
      key: 'closing',
      title: 'Terima Kasih',
      subtitle: 'Salam Hormat',
      content: {
        footer_names: title
      },
      order: 8
    }
  ];
}

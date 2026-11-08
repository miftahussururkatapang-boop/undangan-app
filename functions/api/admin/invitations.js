import { json, body, requireAdmin, slugOk, safeJson } from '../_utils.js';

export async function onRequestGet({ request, env }) {
  if (!await requireAdmin(request, env)) return json({ error: 'Belum login.' }, 401);

  const url = new URL(request.url);
  const categoryFilter = url.searchParams.get('category');
  const searchFilter = url.searchParams.get('q');

  let query = `
    SELECT i.*,
      c.name AS category_name,
      c.icon AS category_icon,
      (SELECT COUNT(*) FROM rsvps r WHERE r.invitation_id=i.id) AS rsvp_count,
      (SELECT COALESCE(SUM(guest_count), 0) FROM rsvps r WHERE r.invitation_id=i.id AND attendance='hadir') AS attend_count,
      (SELECT COUNT(*) FROM guests g WHERE g.invitation_id=i.id) AS guest_count,
      (SELECT COUNT(*) FROM invitation_sections s WHERE s.invitation_id=i.id) AS section_count
    FROM invitations i
    LEFT JOIN event_categories c ON c.code = i.category_code
    WHERE 1=1
  `;
  const params = [];

  if (categoryFilter) {
    query += ' AND i.category_code = ?';
    params.push(categoryFilter);
  }

  if (searchFilter) {
    query += ' AND (i.slug LIKE ? OR i.groom_name LIKE ? OR i.bride_name LIKE ? OR i.event_title LIKE ?)';
    const term = `%${searchFilter}%`;
    params.push(term, term, term, term);
  }

  query += ' ORDER BY i.created_at DESC';

  const { results = [] } = await env.DB.prepare(query).bind(...params).all();

  return json({ invitations: results });
}

export async function onRequestPost({ request, env }) {
  if (!await requireAdmin(request, env)) return json({ error: 'Belum login.' }, 401);
  const b = await body(request);

  if (!b || !slugOk(b.slug)) {
    return json({ error: 'Slug unik wajib diisi (hanya huruf kecil, angka, dan strip).' }, 400);
  }

  const categoryCode = b.category_code || 'pernikahan';
  const eventTitle = (b.event_title || '').trim();
  const groomName = (b.groom_name || '').trim();
  const brideName = (b.bride_name || '').trim();

  // Validasi: Pernikahan memerlukan kedua nama mempelai, kategori lain memerlukan event_title atau nama subjek
  if (categoryCode === 'pernikahan') {
    if (!groomName || !brideName) {
      return json({ error: 'Untuk kategori pernikahan, nama kedua mempelai wajib diisi.' }, 400);
    }
  } else {
    if (!eventTitle && !groomName) {
      return json({ error: 'Nama/judul acara wajib diisi.' }, 400);
    }
  }

  try {
    const themeCode = b.theme_code || 'emerald_gold';
    const isPublished = b.is_published !== undefined ? (b.is_published ? 1 : 0) : 1;
    const privacyType = b.privacy_type || 'public';
    const privacyPassword = b.privacy_password || '';
    const publishAt = b.publish_at || '';
    const eventDataJson = typeof b.event_data === 'object' ? JSON.stringify(b.event_data) : (b.event_data_json || '{}');

    // Masukkan data undangan
    const r = await env.DB.prepare(`
      INSERT INTO invitations (
        slug, category_code, event_title, event_data_json,
        groom_name, bride_name, groom_parents, bride_parents,
        event_date, event_time, venue, address, maps_url,
        quote_text, story_text, music_url, cover_image, gallery_json,
        is_published, theme_code, custom_theme_json, animation_settings_json,
        background_settings_json, sound_settings_json, design_settings_json,
        privacy_type, privacy_password, publish_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      b.slug,
      categoryCode,
      eventTitle,
      eventDataJson,
      groomName,
      brideName,
      b.groom_parents || '',
      b.bride_parents || '',
      b.event_date || '',
      b.event_time || '',
      b.venue || '',
      b.address || '',
      b.maps_url || '',
      b.quote_text || '',
      b.story_text || '',
      b.music_url || '',
      b.cover_image || '',
      b.gallery_json || '[]',
      isPublished,
      themeCode,
      b.custom_theme_json || '{}',
      b.animation_settings_json || '{}',
      b.background_settings_json || '{}',
      b.sound_settings_json || '{}',
      b.design_settings_json || '{}',
      privacyType,
      privacyPassword,
      publishAt
    ).run();

    const newId = r.meta.last_row_id;

    // Jika membuat dari template
    if (b.template_id) {
      const tpl = await env.DB.prepare('SELECT * FROM templates WHERE id=?').bind(b.template_id).first();
      if (tpl) {
        const sections = safeJson(tpl.sections_json, []);
        for (const s of sections) {
          await env.DB.prepare(`
            INSERT INTO invitation_sections (invitation_id, section_key, title, subtitle, content_json, style_json, order_index, is_visible)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(newId, s.key, s.title || '', s.subtitle || '', JSON.stringify(s.content || {}), JSON.stringify(s.style || {}), s.order || 0, s.visible !== undefined ? (s.visible ? 1 : 0) : 1).run();
        }
      }
    } else {
      // Inisialisasi seksi default adaptif sesuai kategori acara
      await seedAdaptiveSectionsForInvitation(env.DB, newId, b, categoryCode);
    }

    return json({ ok: true, id: newId }, 201);
  } catch (e) {
    return json({ error: 'Gagal menyimpan. Pastikan slug belum digunakan oleh undangan lain.' }, 400);
  }
}

async function seedAdaptiveSectionsForInvitation(db, invId, data, category) {
  const title = data.event_title || (data.groom_name ? (data.bride_name ? `${data.groom_name} & ${data.bride_name}` : data.groom_name) : 'Undangan Istimewa');
  const evData = safeJson(data.event_data_json, {});

  let sections = [];

  if (category === 'pernikahan') {
    sections = [
      { key: 'cover', title: 'The Wedding of', subtitle: `${data.groom_name} & ${data.bride_name}`, content: { eyebrow: 'THE WEDDING OF', groom_name: data.groom_name, bride_name: data.bride_name, event_date: data.event_date || '', button_text: '✧ Buka Undangan ✧', cover_photo: data.cover_image || '' }, order: 1 },
      { key: 'salam', title: 'Assalamu’alaikum Warahmatullahi Wabarakatuh', subtitle: 'Ungkapan Syukur', content: { bismillah: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', quote_verse: data.quote_text || 'Dan di antara tanda-tanda kebesaran-Nya...', quote_source: 'QS. Ar-Rum: 21' }, order: 2 },
      { key: 'profile', title: 'Mempelai Pengantin', subtitle: 'Kedua Mempelai', content: { groom: { name: data.groom_name, parents: data.groom_parents || '' }, bride: { name: data.bride_name, parents: data.bride_parents || '' } }, order: 3 },
      { key: 'countdown', title: 'Hari Bahagia Kami', subtitle: 'Save The Date', content: { event_date: data.event_date ? `${data.event_date}T08:00:00` : '' }, order: 4 },
      { key: 'akad', title: 'Akad Nikah', subtitle: 'Ikrar Sakral', content: { time: data.event_time || '08.00 WIB - selesai', venue: data.venue || 'Kediaman Mempelai', address: data.address || '', maps_url: data.maps_url || '' }, order: 5 },
      { key: 'reception', title: 'Resepsi Pernikahan', subtitle: 'Walimatul \'Ursy', content: { time: data.event_time || '11.00 WIB - selesai', venue: data.venue || '', address: data.address || '', maps_url: data.maps_url || '' }, order: 6 },
      { key: 'location', title: 'Lokasi Acara', subtitle: 'Petunjuk Arah', content: { venue: data.venue || '', address: data.address || '', maps_url: data.maps_url || '' }, order: 7 },
      { key: 'story', title: 'Kisah Kami', subtitle: 'Our Story', content: { intro: data.story_text || 'Dengan memohon rahmat dan ridha Allah SWT...' }, order: 8 },
      { key: 'gallery', title: 'Galeri Momen', subtitle: 'Momen Bahagia', content: { photos: safeJson(data.gallery_json, []) }, order: 9 },
      { key: 'rsvp', title: 'Konfirmasi Kehadiran', subtitle: 'RSVP', content: { note: 'Mohon doa restu dan konfirmasi kehadiran Anda.' }, order: 10 },
      { key: 'guestbook', title: 'Buku Tamu & Doa Restu', subtitle: 'Doa Restu Tamu', content: {}, order: 11 },
      { key: 'envelope', title: 'Tanda Kasih & Hadiah', subtitle: 'Digital Gift', content: { note: 'Doa restu Anda merupakan karunia terindah bagi kami.', accounts: [] }, order: 12 },
      { key: 'closing', title: 'Terima Kasih', subtitle: 'Wassalamu’alaikum Warahmatullahi Wabarakatuh', content: { footer_names: `${data.groom_name} & ${data.bride_name}` }, order: 13 }
    ];
  } else if (category === 'khitanan') {
    const child = evData.child_name || data.groom_name || 'Ananda Tercinta';
    const parents = evData.parents_name || data.groom_parents || 'Orang Tua';
    sections = [
      { key: 'cover', title: 'Walimatul Khitan', subtitle: child, content: { eyebrow: 'WALIMATUL KHITAN', main_name: child, parents_name: parents, event_date: data.event_date || '', button_text: '✧ Buka Undangan ✧', cover_photo: data.cover_image || '' }, order: 1 },
      { key: 'salam', title: 'Assalamu’alaikum Warahmatullahi Wabarakatuh', subtitle: 'Tasyakuran Khitan', content: { bismillah: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', quote_verse: 'Semoga ananda menjadi putra yang sholeh, berbakti kepada orang tua, agama, nusa dan bangsa.' }, order: 2 },
      { key: 'profile_person', title: 'Putra Tercinta', subtitle: 'Profil Ananda', content: { name: child, parents: parents, bio: evData.prayer_text || 'Dengan memohon rahmat Allah SWT, kami bermaksud menyelenggarakan syukuran khitanan putra kami.' }, order: 3 },
      { key: 'countdown', title: 'Hitung Mundur Acara', subtitle: 'Save The Date', content: { event_date: data.event_date ? `${data.event_date}T08:00:00` : '' }, order: 4 },
      { key: 'event_detail', title: 'Waktu & Tempat Tasyakuran', subtitle: 'Pelaksanaan Acara', content: { time: data.event_time || '09.00 - 13.00 WIB', venue: data.venue || 'Kediaman', address: data.address || '', maps_url: data.maps_url || '' }, order: 5 },
      { key: 'location', title: 'Peta Lokasi', subtitle: 'Petunjuk Arah', content: { venue: data.venue || '', address: data.address || '', maps_url: data.maps_url || '' }, order: 6 },
      { key: 'gallery', title: 'Galeri Foto', subtitle: 'Kenangan Manis Ananda', content: { photos: safeJson(data.gallery_json, []) }, order: 7 },
      { key: 'rsvp', title: 'Konfirmasi Kehadiran', subtitle: 'RSVP', content: { note: 'Mohon konfirmasi kehadiran Bapak/Ibu/Saudara/i.' }, order: 8 },
      { key: 'guestbook', title: 'Buku Tamu & Doa', subtitle: 'Untaian Doa', content: {}, order: 9 },
      { key: 'envelope', title: 'Tanda Kasih Ananda', subtitle: 'Kado & Hadiah', content: { note: 'Tanda kasih untuk ananda dapat disalurkan melalui rekening berikut:', accounts: [] }, order: 10 },
      { key: 'closing', title: 'Terima Kasih', subtitle: 'Salam Hangat', content: { footer_names: parents }, order: 11 }
    ];
  } else if (category === 'aqiqah') {
    const baby = evData.baby_name || data.groom_name || 'Buah Hati Tercinta';
    const parents = evData.parents_name || data.groom_parents || 'Keluarga';
    sections = [
      { key: 'cover', title: 'Tasyakuran Aqiqah', subtitle: baby, content: { eyebrow: 'TASYAKURAN AQIQAH', main_name: baby, parents_name: parents, event_date: data.event_date || '', button_text: '✧ Buka Undangan ✧', cover_photo: data.cover_image || '' }, order: 1 },
      { key: 'salam', title: 'Assalamu’alaikum Warahmatullahi Wabarakatuh', subtitle: 'Rasa Syukur Kelahiran', content: { bismillah: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', quote_verse: 'Setiap anak tergadai dengan aqiqahnya, disembelihkan untuknya pada hari ketujuh, dicukur rambutnya dan diberi nama.' }, order: 2 },
      { key: 'profile_person', title: 'Buah Hati Kami', subtitle: 'Bintang Kecil Keluarga', content: { name: baby, parents: parents, bio: 'Semoga menjadi anak yang sholeh/sholehah, cerdas, berakhlak mulia, dan senantiasa dalam lindungan Allah SWT.' }, order: 3 },
      { key: 'event_detail', title: 'Pelaksanaan Tasyakuran', subtitle: 'Waktu & Tempat', content: { time: data.event_time || '10.00 WIB - Selesai', venue: data.venue || 'Kediaman', address: data.address || '', maps_url: data.maps_url || '' }, order: 4 },
      { key: 'location', title: 'Peta Lokasi', subtitle: 'Alamat Acara', content: { venue: data.venue || '', address: data.address || '', maps_url: data.maps_url || '' }, order: 5 },
      { key: 'gallery', title: 'Galeri Foto Bayi', subtitle: 'Momen Pertama', content: { photos: safeJson(data.gallery_json, []) }, order: 6 },
      { key: 'rsvp', title: 'Konfirmasi Kehadiran', subtitle: 'RSVP', content: { note: 'Kehadiran Anda merupakan kebahagiaan bagi kami sekeluarga.' }, order: 7 },
      { key: 'guestbook', title: 'Doa Restu & Ucapan', subtitle: 'Doa untuk Bayi', content: {}, order: 8 },
      { key: 'closing', title: 'Terima Kasih', subtitle: 'Wassalamu’alaikum Warahmatullahi Wabarakatuh', content: { footer_names: parents }, order: 9 }
    ];
  } else if (category === 'ulang_tahun') {
    const person = evData.person_name || data.groom_name || title;
    const age = evData.age_celebrated ? `The ${evData.age_celebrated}th Birthday` : 'Birthday Party';
    sections = [
      { key: 'cover', title: age, subtitle: person, content: { eyebrow: 'YOU ARE INVITED TO', main_name: person, event_date: data.event_date || '', button_text: '🎉 Buka Undangan 🎉', cover_photo: data.cover_image || '' }, order: 1 },
      { key: 'profile_person', title: 'Celebration of Life', subtitle: 'Hari Spesial', content: { name: person, bio: `Bergembiralah bersama merayakan hari ulang tahun yang penuh keceriaan dan kenangan manis.` }, order: 2 },
      { key: 'countdown', title: 'Counting Down', subtitle: 'Menuju Hari H', content: { event_date: data.event_date ? `${data.event_date}T16:00:00` : '' }, order: 3 },
      { key: 'event_detail', title: 'Party Details', subtitle: 'Waktu & Lokasi', content: { time: data.event_time || '16.00 WIB - Selesai', venue: data.venue || 'Party Venue', address: data.address || '', maps_url: data.maps_url || '' }, order: 4 },
      { key: 'location', title: 'Petunjuk Arah', subtitle: 'Peta Lokasi', content: { venue: data.venue || '', address: data.address || '', maps_url: data.maps_url || '' }, order: 5 },
      { key: 'gallery', title: 'Photo Highlights', subtitle: 'Memories', content: { photos: safeJson(data.gallery_json, []) }, order: 6 },
      { key: 'rsvp', title: 'Konfirmasi Kehadiran', subtitle: 'RSVP', content: { note: 'Harap konfirmasi sebelum tanggal acara untuk reservasi tempat.' }, order: 7 },
      { key: 'guestbook', title: 'Birthday Wishes', subtitle: 'Harapan & Doa', content: {}, order: 8 },
      { key: 'closing', title: 'See You There!', subtitle: 'Salam Hangat', content: { footer_names: person }, order: 9 }
    ];
  } else {
    // Kategori umum, pengajian, tasyakuran, wisuda, peresmian, reuni, haul
    const mainTitle = data.event_title || title;
    sections = [
      { key: 'cover', title: mainTitle, subtitle: data.venue || '', content: { eyebrow: 'UNDANGAN RESMI', main_name: mainTitle, event_date: data.event_date || '', button_text: '✧ Buka Undangan ✧', cover_photo: data.cover_image || '' }, order: 1 },
      { key: 'salam', title: 'Salam Pembuka', subtitle: 'Undangan Menghadiri Acara', content: { bismillah: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', quote_verse: data.quote_text || 'Dengan penuh rasa syukur dan hormat, kami mengundang Bapak/Ibu/Saudara/i untuk hadir pada acara kami.' }, order: 2 },
      { key: 'description', title: 'Tentang Acara', subtitle: mainTitle, content: { intro: data.story_text || 'Kegiatan diselenggarakan dalam rangka mempererat tali silaturahmi dan kebersamaan.' }, order: 3 },
      { key: 'countdown', title: 'Waktu Tersisa', subtitle: 'Save The Date', content: { event_date: data.event_date ? `${data.event_date}T08:00:00` : '' }, order: 4 },
      { key: 'event_detail', title: 'Jadwal & Tempat Pelaksanaan', subtitle: 'Detail Acara', content: { time: data.event_time || '09.00 WIB - selesai', venue: data.venue || '', address: data.address || '', maps_url: data.maps_url || '' }, order: 5 },
      { key: 'location', title: 'Petunjuk Lokasi', subtitle: 'Peta', content: { venue: data.venue || '', address: data.address || '', maps_url: data.maps_url || '' }, order: 6 },
      { key: 'gallery', title: 'Dokumentasi & Galeri', subtitle: 'Momen', content: { photos: safeJson(data.gallery_json, []) }, order: 7 },
      { key: 'rsvp', title: 'Konfirmasi Kehadiran', subtitle: 'RSVP', content: { note: 'Mohon konfirmasi kehadiran demi kelancaran akomodasi acara.' }, order: 8 },
      { key: 'guestbook', title: 'Buku Tamu & Pesan', subtitle: 'Ucapan', content: {}, order: 9 },
      { key: 'closing', title: 'Ungkapan Terima Kasih', subtitle: 'Salam Hormat', content: { footer_names: data.groom_parents || data.groom_name || 'Panitia Penyelenggara' }, order: 10 }
    ];
  }

  for (const s of sections) {
    await db.prepare(`
      INSERT INTO invitation_sections (invitation_id, section_key, title, subtitle, content_json, style_json, order_index, is_visible)
      VALUES (?, ?, ?, ?, ?, '{}', ?, 1)
    `).bind(invId, s.key, s.title, s.subtitle, JSON.stringify(s.content), s.order).run();
  }
}

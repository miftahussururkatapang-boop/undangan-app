/**
 * UNDANGAN V2 - Automated Test Suite
 * Tests all 20 Verification Points for Multi-Event Platform & Studios
 */

import { startServer, stopServer } from '../dev-server.js';

const TEST_PORT = 8799;
const BASE = `http://127.0.0.1:${TEST_PORT}`;

async function req(path, opts = {}) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    ...opts,
    headers: {
      'content-type': 'application/json',
      ...(opts.headers || {})
    }
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, headers: res.headers, data };
}

let sessionCookie = '';

async function runTests() {
  await startServer(TEST_PORT);

  console.log('====================================================');
  console.log('🧪 PENGUJIAN OTOMATIS: UNDANGAN V2 MULTI-ACARA');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`✅ [LULUS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [GAGAL] ${testName}`);
      failed++;
    }
  }

  const ts = Date.now().toString(36);

  try {
    // 0. Login admin
    console.log('\n--- Uji Autentikasi: Login Admin & Sesi HMAC ---');
    const loginRes = await req('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ password: 'admin123' })
    });
    assert(loginRes.status === 200 && loginRes.data.ok, 'Login admin berhasil');
    const setCookie = loginRes.headers.get('set-cookie');
    assert(!!setCookie, 'Cookie sesi HMAC SHA-256 diterbitkan');
    sessionCookie = setCookie ? setCookie.split(';')[0] : '';

    const meRes = await req('/api/admin/me', { headers: { Cookie: sessionCookie } });
    assert(meRes.status === 200 && meRes.data.ok, 'Sesi admin tervalidasi');

    // 1. Membuat undangan pernikahan
    console.log('\n--- Uji 1: Membuat Undangan Pernikahan ---');
    const weddingSlug = `nikah-${ts}`;
    const weddingRes = await req('/api/admin/invitations', {
      method: 'POST',
      headers: { Cookie: sessionCookie },
      body: JSON.stringify({
        slug: weddingSlug,
        category_code: 'pernikahan',
        groom_name: 'Faisal Akbar, S.Kom',
        bride_name: 'Dewi Lestari, S.Pd',
        event_date: '2027-08-20',
        event_time: '08.00 - selesai',
        venue: 'Grand Sasana Kencana',
        address: 'Jl. R.E. Martadinata No. 88, Bandung',
        theme_code: 'emerald_gold',
        is_published: 1
      })
    });
    assert(weddingRes.status === 201 && weddingRes.data.ok, 'Undangan pernikahan berhasil dibuat');
    const weddingId = weddingRes.data.id;

    const getWeddingPub = await req(`/api/invitation/${weddingSlug}`);
    assert(getWeddingPub.data.category_code === 'pernikahan', 'API publik memuat kategori pernikahan');
    assert(getWeddingPub.data.invitation.groom_name === 'Faisal Akbar, S.Kom', 'Nama mempelai pernikahan valid');

    // 2. Membuat undangan khitanan
    console.log('\n--- Uji 2: Membuat Undangan Khitanan ---');
    const khitanSlug = `khitan-${ts}`;
    const khitanRes = await req('/api/admin/invitations', {
      method: 'POST',
      headers: { Cookie: sessionCookie },
      body: JSON.stringify({
        slug: khitanSlug,
        category_code: 'khitanan',
        event_title: 'Tasyakuran Khitanan Muhammad Farhan',
        groom_name: 'Muhammad Farhan',
        groom_parents: 'Bapak Hendra & Ibu Rina',
        event_date: '2027-09-10',
        event_time: '09.00 - 13.00 WIB',
        venue: 'Kediaman Mempelai',
        address: 'Komplek Permata Hijau No. 12',
        theme_code: 'midnight_blue',
        event_data: { child_name: 'Muhammad Farhan', child_nickname: 'Farhan', parents_name: 'Bapak Hendra & Ibu Rina' },
        is_published: 1
      })
    });
    assert(khitanRes.status === 201 && khitanRes.data.ok, 'Undangan khitanan berhasil dibuat');
    const khitanId = khitanRes.data.id;

    const getKhitanPub = await req(`/api/invitation/${khitanSlug}`);
    assert(getKhitanPub.data.category_code === 'khitanan', 'API publik memuat kategori khitanan');
    assert(getKhitanPub.data.event_title === 'Tasyakuran Khitanan Muhammad Farhan', 'Judul acara khitanan valid');

    // 3. Membuat undangan aqiqah
    console.log('\n--- Uji 3: Membuat Undangan Aqiqah ---');
    const aqiqahSlug = `aqiqah-${ts}`;
    const aqiqahRes = await req('/api/admin/invitations', {
      method: 'POST',
      headers: { Cookie: sessionCookie },
      body: JSON.stringify({
        slug: aqiqahSlug,
        category_code: 'aqiqah',
        event_title: 'Tasyakuran Aqiqah Aisyah Ayudia',
        groom_name: 'Aisyah Ayudia Inara',
        groom_parents: 'Bapak Fajar & Ibu Anisa',
        event_date: '2027-09-15',
        theme_code: 'rose_gold',
        event_data: { baby_name: 'Aisyah Ayudia Inara', baby_gender: 'Perempuan', parents_name: 'Bapak Fajar & Ibu Anisa' },
        is_published: 1
      })
    });
    assert(aqiqahRes.status === 201 && aqiqahRes.data.ok, 'Undangan aqiqah berhasil dibuat');
    const aqiqahId = aqiqahRes.data.id;

    // 4. Membuat undangan ulang tahun
    console.log('\n--- Uji 4: Membuat Undangan Ulang Tahun ---');
    const ultahSlug = `ultah-${ts}`;
    const ultahRes = await req('/api/admin/invitations', {
      method: 'POST',
      headers: { Cookie: sessionCookie },
      body: JSON.stringify({
        slug: ultahSlug,
        category_code: 'ulang_tahun',
        event_title: 'Sweet 17th Birthday of Nadia',
        groom_name: 'Nadia Safitri',
        event_date: '2027-10-05',
        theme_code: 'black_luxury',
        event_data: { person_name: 'Nadia Safitri', age_celebrated: 17, party_theme: 'Glow in The Dark' },
        is_published: 1
      })
    });
    assert(ultahRes.status === 201 && ultahRes.data.ok, 'Undangan ulang tahun berhasil dibuat');
    const ultahId = ultahRes.data.id;

    // 5. Membuat undangan pengajian
    console.log('\n--- Uji 5: Membuat Undangan Pengajian & Tabligh Akbar ---');
    const pengajianSlug = `kajian-${ts}`;
    const pengajianRes = await req('/api/admin/invitations', {
      method: 'POST',
      headers: { Cookie: sessionCookie },
      body: JSON.stringify({
        slug: pengajianSlug,
        category_code: 'pengajian',
        event_title: 'Kajian Akbar Menyambut Ramadhan',
        groom_name: 'Ustadz Dr. H. Khalid Basalamah, M.A.',
        venue: 'Masjid Raya Al-Ukhuwah Bandung',
        event_date: '2027-10-20',
        theme_code: 'islamic_classic',
        event_data: { event_name: 'Kajian Akbar Menyambut Ramadhan', speaker_name: 'Ustadz Dr. H. Khalid Basalamah, M.A.', lecture_topic: 'Keluarga Sakinah' },
        is_published: 1
      })
    });
    assert(pengajianRes.status === 201 && pengajianRes.data.ok, 'Undangan pengajian berhasil dibuat');
    const pengajianId = pengajianRes.data.id;

    // 6. Membuat undangan umum / kustom
    console.log('\n--- Uji 6: Membuat Undangan Umum / Kustom ---');
    const umumSlug = `gathering-${ts}`;
    const umumRes = await req('/api/admin/invitations', {
      method: 'POST',
      headers: { Cookie: sessionCookie },
      body: JSON.stringify({
        slug: umumSlug,
        category_code: 'umum',
        event_title: 'Annual Community Gathering & Networking Night',
        groom_name: 'Komunitas Digital Kreatif',
        event_date: '2027-11-12',
        theme_code: 'minimalist_white',
        is_published: 1
      })
    });
    assert(umumRes.status === 201 && umumRes.data.ok, 'Undangan umum / kustom berhasil dibuat');
    const umumId = umumRes.data.id;

    // 7. Mengganti tema setiap undangan
    console.log('\n--- Uji 7: Mengganti Tema Antar-Kategori ---');
    const switchKhitanTheme = await req(`/api/admin/invitations/${khitanId}`, {
      method: 'PUT',
      headers: { Cookie: sessionCookie },
      body: JSON.stringify({
        slug: khitanSlug,
        category_code: 'khitanan',
        event_title: 'Tasyakuran Khitanan Muhammad Farhan',
        groom_name: 'Muhammad Farhan',
        theme_code: 'royal_purple',
        is_published: 1
      })
    });
    assert(switchKhitanTheme.status === 200 && switchKhitanTheme.data.ok, 'Tema khitanan berhasil diganti ke royal_purple');

    const verifyKhitanTheme = await req(`/api/invitation/${khitanSlug}`);
    assert(verifyKhitanTheme.data.theme_code === 'royal_purple', 'API publik mengonfirmasi tema royal_purple pada khitanan');

    // 8. Mengatur animasi (Animation Studio)
    console.log('\n--- Uji 8: Mengatur Animasi Gerak ---');
    const animSettings = {
      enabled: true,
      opening: { type: 'door_3d', duration: 1.5 },
      text: { type: 'soft_zoom' },
      photo: { type: 'floating' },
      ornament: { type: 'gold_dust' },
      intensity: 'moderate'
    };
    const updateAnimRes = await req(`/api/admin/invitations/${ultahId}`, {
      method: 'PUT',
      headers: { Cookie: sessionCookie },
      body: JSON.stringify({
        slug: ultahSlug,
        category_code: 'ulang_tahun',
        event_title: 'Sweet 17th Birthday of Nadia',
        groom_name: 'Nadia Safitri',
        animation_settings_json: animSettings,
        is_published: 1
      })
    });
    assert(updateAnimRes.status === 200, 'Animation Studio berhasil mengatur animasi pada undangan');

    const checkUltahAnim = await req(`/api/invitation/${ultahSlug}`);
    assert(checkUltahAnim.data.animation_settings?.opening?.type === 'door_3d', 'Animasi pembuka pintu 3D tervalidasi');

    // 9. Menambah dan mengurutkan bagian (Section Builder)
    console.log('\n--- Uji 9: Menambah & Mengurutkan Bagian (Section Builder) ---');
    const addRundownRes = await req(`/api/admin/invitations/${khitanId}/sections`, {
      method: 'POST',
      headers: { Cookie: sessionCookie },
      body: JSON.stringify({
        section_key: 'rundown',
        title: 'Susunan Acara Syukuran Khitan',
        content: {
          items: [
            { time: '09.00 - 09.30', title: 'Pembacaan Ayat Suci Al-Qur\'an' },
            { time: '09.30 - 10.30', title: 'Tausiyah & Doa Bersama' },
            { time: '10.30 - selesai', title: 'Ramah Tamah & Santap Siang' }
          ]
        },
        is_visible: 1
      })
    });
    assert(addRundownRes.status === 201 && addRundownRes.data.ok, 'Komponen rundown baru berhasil ditambahkan');

    const getKhitanSecs = await req(`/api/admin/invitations/${khitanId}/sections`, { headers: { Cookie: sessionCookie } });
    assert(getKhitanSecs.data.sections?.length > 0, 'Daftar seksi khitanan berhasil diambil');

    // 10. Menyimpan template
    console.log('\n--- Uji 10: Menyimpan Desain Sebagai Template ---');
    const saveTplRes = await req('/api/admin/templates', {
      method: 'POST',
      headers: { Cookie: sessionCookie },
      body: JSON.stringify({
        name: `Template Khitan Ungu ${ts}`,
        category_code: 'khitanan',
        from_invitation_id: khitanId
      })
    });
    assert(saveTplRes.status === 201 && saveTplRes.data.ok, 'Template khitanan berhasil disimpan');

    // 11. Membuat link undangan personal
    console.log('\n--- Uji 11: Membuat Link Undangan Personal Tamu ---');
    const addGuestRes = await req(`/api/admin/invitations/${pengajianId}/guests`, {
      method: 'POST',
      headers: { Cookie: sessionCookie },
      body: JSON.stringify({ guest_name: 'Bapak Camat & Staf' })
    });
    assert(addGuestRes.status === 201 && addGuestRes.data.ok, 'Tamu undangan personal berhasil dibuat');
    const guestToken = addGuestRes.data.guests[0].token;
    assert(!!guestToken, 'Token unik tamu terbit');

    // 12. Membagikan undangan
    console.log('\n--- Uji 12: Membagikan Undangan (Akses URL Publik) ---');
    const shareUrl = `/api/invitation/${pengajianId}`;
    const pubCheck = await req(`/api/invitation/${pengajianSlug}`);
    assert(pubCheck.status === 200, 'Undangan dapat diakses publik melalui URL slug');

    // 13. Personalisasi nama tamu
    console.log('\n--- Uji 13: Personalisasi Nama Tamu (?to=... & ?token=...) ---');
    const personalizedRes = await req(`/api/invitation/${pengajianSlug}?to=Bapak+Camat+%26+Staf&token=${guestToken}`);
    assert(personalizedRes.status === 200, 'Tautan personal berhasil diakses');
    assert(personalizedRes.data.guest?.name === 'Bapak Camat & Staf', 'Nama tamu personal sesuai parameter URL');
    assert(personalizedRes.data.guestToken === guestToken, 'Token tamu diverifikasi valid');

    // 14. Menyimpan RSVP
    console.log('\n--- Uji 14: Konfirmasi Kehadiran RSVP ---');
    const rsvpSubmit = await req('/api/rsvp', {
      method: 'POST',
      body: JSON.stringify({
        slug: pengajianSlug,
        guest_token: guestToken,
        guest_name: 'Bapak Camat & Staf',
        attendance: 'hadir',
        guest_count: 3,
        message: 'InsyaAllah kami hadir bersama rombongan.'
      })
    });
    assert(rsvpSubmit.status === 200 && rsvpSubmit.data.ok, 'RSVP tersimpan di database');

    const guestbookRes = await req(`/api/guestbook/${pengajianSlug}`);
    const foundEntry = guestbookRes.data.guestbook?.find(x => x.guest_name === 'Bapak Camat & Staf');
    assert(!!foundEntry, 'Pesan RSVP muncul di umpan buku tamu');

    // 15. Memastikan isolasi data antarundangan
    console.log('\n--- Uji 15: Isolasi Data Antarundangan ---');
    const guestPengajian = await req(`/api/admin/invitations/${pengajianId}/guests`, { headers: { Cookie: sessionCookie } });
    const guestWedding = await req(`/api/admin/invitations/${weddingId}/guests`, { headers: { Cookie: sessionCookie } });
    const pengajianHasWeddingGuest = guestPengajian.data.guests?.some(g => g.invitation_id === weddingId);
    assert(!pengajianHasWeddingGuest, 'Data tamu antarundangan terisolasi sempurna (tanpa kebocoran)');

    // 16. Memastikan undangan lama (demo) tetap berfungsi
    console.log('\n--- Uji 16: Integritas Undangan Lama (demo) ---');
    const demoRes = await req('/api/invitation/demo');
    assert(demoRes.status === 200, 'Undangan lama /i/demo tetap aktif');
    assert(demoRes.data.invitation.groom_name === 'Ahmad Nur Syahid', 'Data mempelai pria lama utuh');
    assert(demoRes.data.invitation.bride_name === "Siti Sa'diyah", 'Data mempelai wanita lama utuh');
    assert(demoRes.data.category_code === 'pernikahan', 'Undangan lama otomatis berkategori pernikahan');

    // 17. Uji tampilan HP Android
    console.log('\n--- Uji 17: Uji Tampilan Mobile HP Android ---');
    const cssRes = await fetch(`${BASE}/style.css`);
    const cssText = await cssRes.text();
    assert(cssText.includes('@media(max-width:560px)') || cssText.includes('@media (max-width: 560px)') || cssText.includes('@media (max-width: 900px)'), 'Master CSS memiliki breakpoint mobile');
    assert(cssText.includes('prefers-reduced-motion'), 'Master CSS menghormati prefers-reduced-motion');

    // 18. Uji tampilan desktop & dashboard
    console.log('\n--- Uji 18: Uji Dashboard Admin UNDANGAN V2 ---');
    const adminRes = await fetch(`${BASE}/admin`);
    const adminText = await adminRes.text();
    assert(adminRes.status === 200 && adminText.includes('UNDANGAN'), 'Dashboard admin menampilkan branding UNDANGAN');
    assert(adminText.includes('Custom Event Builder') || adminText.includes('Kategori Acara'), 'Dashboard memuat menu Custom Event Builder');
    assert(adminText.includes('Theme Studio') && adminText.includes('Section Builder'), 'Dashboard memuat Theme Studio dan Section Builder');

    // 19. Uji Custom Event Builder (Buat Kategori Baru)
    console.log('\n--- Uji 19: Custom Event Builder (Buat & Kelola Kategori Acara) ---');
    const catCode = `seminar_${ts}`;
    const addCatRes = await req('/api/admin/categories', {
      method: 'POST',
      headers: { Cookie: sessionCookie },
      body: JSON.stringify({
        code: catCode,
        name: 'Seminar & Workshop',
        icon: '🎤',
        description: 'Undangan seminar nasional, webinar, atau workshop keahlian.',
        fields: [
          { key: 'seminar_title', label: 'Judul Seminar', type: 'text', required: true },
          { key: 'keynote_speaker', label: 'Pembicara Utama', type: 'text', required: true }
        ],
        default_sections: ['cover', 'description', 'countdown', 'event_detail', 'location', 'rsvp', 'closing']
      })
    });
    assert(addCatRes.status === 201 && addCatRes.data.ok, 'Kategori acara baru berhasil dibuat oleh admin');

    const getCatsRes = await req('/api/admin/categories', { headers: { Cookie: sessionCookie } });
    const foundNewCat = getCatsRes.data.categories?.find(c => c.code === catCode);
    assert(!!foundNewCat, 'Kategori seminar terdaftar di daftar kategori admin');

    // 20. Uji migrasi database & Cloudflare D1
    console.log('\n--- Uji 20: Integritas Skema Migrasi Database Cloudflare D1 ---');
    const catList = await req('/api/admin/categories', { headers: { Cookie: sessionCookie } });
    assert(catList.data.categories?.length >= 12, '12 Kategori acara bawaan terpasang lengkap');

    const invList = await req('/api/admin/invitations', { headers: { Cookie: sessionCookie } });
    assert(invList.data.invitations?.length >= 6, 'Semua undangan multi-kategori tersimpan rapi');

  } catch (err) {
    console.error('Fatal test error:', err);
    failed++;
  } finally {
    await stopServer();
  }

  console.log('\n====================================================');
  console.log(`📊 HASIL PENGUJIAN: ${passed} LULUS, ${failed} GAGAL`);
  console.log('====================================================\n');

  process.exit(failed > 0 ? 1 : 0);
}

runTests();

# UNDANGAN V2 - Platform Undangan Digital Multi-Acara
### "Satu Platform, Beragam Undangan"

Aplikasi platform undangan digital modern, fleksibel, responsif mobile-first, dan aman yang berjalan di atas infrastruktur serverless **Cloudflare Pages** dan **Cloudflare D1 Database** (SQLite serverless).

Aplikasi ini dapat membuat berbagai macam jenis undangan digital untuk kebutuhan pribadi, keluarga, keagamaan, pendidikan, komunitas, dan acara bisnis, tanpa terbatas pada satu jenis acara saja.

---

## 🌟 Fitur Utama Unggulan

### 1. 💌 Sistem Multi-Jenis Undangan
Mendukung berbagai kategori acara dengan formulir dan komponen yang adaptif:
1. **Pernikahan (Wedding)**: Mempelai, akad nikah, resepsi, profil orang tua, countdown, love story, galeri momen, RSVP, buku tamu, amplop digital.
2. **Khitanan / Sunatan**: Profil ananda, orang tua, doa tasyakuran khitan, jadwal acara, peta lokasi, galeri, buku tamu, tanda kasih.
3. **Aqiqah**: Profil bayi, jenis kelamin, tanggal lahir, doa tasyakuran aqiqah, orang tua, peta lokasi, galeri, buku tamu.
4. **Ulang Tahun / Birthday**: Nama yang berulang tahun, perayaan usia (misal Sweet 17th), tema pesta, countdown, rundown party, RSVP, amplop hadiah.
5. **Tasyakuran**: Tasyakuran rumah baru, hajat keluarga, syukuran nikmat, jadwal pelaksanaan, rundown, doa bersama.
6. **Pengajian & Tabligh Akbar**: Tema tausiyah, profil penceramah/ustadz, penyelenggara/DKM, lokasi masjid, susunan kegiatan.
7. **Wisuda & Kelulusan**: Nama wisudawan, gelar, universitas/sekolah, fakultas, prestasi, doa restu keluarga.
8. **Peresmian / Grand Opening**: Nama usaha/kantor, pemilik/manajemen, jadwal peresmian, rundown acara, peta lokasi.
9. **Reuni & Temu Kangen**: Nama angkatan, sekolah/kampus, tema reuni, dresscode, rundown acara, kenangan nostalgia.
10. **Haul & Peringatan**: Nama tokoh yang diperingati, manaqib/biografi singkat, keluarga penyelenggara, doa tahlil.
11. **Peringatan Hari Besar Islam (PHBI)**: Maulid Nabi Muhammad SAW, Isra Mi'raj, Nuzulul Qur'an, Tahun Baru Islam, Tabligh Akbar.
12. **Undangan Umum / Kustom**: Acara bebas apa pun yang dapat disesuaikan judul, penyelenggara, dan susunannya.

### 2. 🏷️ Custom Event Builder
Admin dapat menambahkan kategori acara baru langsung dari dashboard tanpa harus mengubah kode program:
- Membuat kategori acara baru dengan kode unik dan ikon emoji/simbol.
- Menentukan kolom informasi khusus (*Fields Builder*) dengan tipe: teks, tanggal, angka, textarea, atau pilihan select.
- Menentukan kolom wajib (*required*) atau opsional.
- Menentukan susunan seksi bawaan (*default sections*) untuk kategori tersebut.
- Menggandakan kategori yang sudah ada.
- Menonaktifkan atau menghapus kategori yang belum terikat dengan undangan.

### 3. 🎨 Theme Studio (10 Preset + Custom Palette Builder)
Tersedia 10 preset tema desain siap pakai yang kompatibel lintas kategori acara:
1. **Emerald Gold**: Hijau zamrud dan emas elegan dengan nuansa mewah sakral.
2. **Royal Burgundy**: Merah marun pekat dan emas mewah bernuansa hangat dan agung.
3. **Midnight Blue**: Biru navy aristokrat dipadukan aksen silver kristal dan platinum.
4. **Ivory Champagne**: Putih gading lembut dan kilau champagne modern romantis.
5. **Rose Gold**: Blush pink lembut bertabur emas tembaga feminin dan anggun.
6. **Black Luxury**: Hitam pekat eksklusif dengan tipografi emas metalik berkilau.
7. **Sage Botanical**: Hijau sage menenangkan dipadu ornamen dedaunan alam.
8. **Islamic Classic**: Kemegahan motif geometri Arabesque, kubah masjid, dan kaligrafi emas.
9. **Minimalist White**: Putih bersih, modern, rapi dengan tipografi kontemporer.
10. **Royal Purple**: Ungu kerajaan megah bertabur emas kekaisaran.

Fitur Theme Studio:
- **Pratinjau Live**: Mode HP, Tablet, dan Desktop secara langsung sebelum menyimpan.
- **Color Pickers**: Pengatur warna latar cover, konten, kartu, teks utama, teks redup, aksen emas, warna tombol, dan border.
- **Tipografi**: Pilihan font judul (*Playfair Display, Cinzel, Cormorant Garamond, Amiri, Plus Jakarta Sans, Montserrat*) dan font isi (*DM Sans, Plus Jakarta Sans, Montserrat*).
- **Gaya Elemen**: Bentuk tombol (*Pill 999px, Rounded 8px, Elegant 4px, Sharp 0px*) dan bingkai foto (*Arch/Kubah, Circle, Double Gold, Hexagonal, Rounded*).
- **Simpan Tema Kustom & Gandakan**: Bebas membuat kombinasi tema tanpa batas.

### 4. ✨ Animation Studio
- **Animasi Pembuka**: *Envelope Opening* (amplop 3D dengan segel lilin interaktif), *Curtain Opening* (tirai belah dua), *3D Door Opening* (pintu gerbang 3D), *Zoom In*, *Fade In*, dan *Golden Particles*.
- **Animasi Teks & Foto**: *Fade Up*, *Slide Left/Right*, *Soft Zoom*, *Elegant Reveal*, serta *Ken Burns Effect* dan *Floating Frame*.
- **Animasi Ornamen**: *Gold Dust* (partikel debu emas mengambang di canvas), *Falling Petals* (kelopak bunga berguguran), *Shimmer Sparkle*, dan *Cahaya Bintang*.
- **Akselerasi GPU**: 60fps ringan dan otomatis menghormati setelan *Reduce Motion* (`prefers-reduced-motion`) pada ponsel pengguna.

### 5. 🖼️ Background & Ornamen Studio
- Pilihan latar: Gradasi Radial, Warna Solid, dan Gambar Latar Kustom (URL atau file).
- Pustaka pola SVG: *Arabesque Geometris Islami, Daun Botanikal, Tanpa Pola*.
- Ornamen sudut (*Bunga Emas, Kubah Masjid*) dan pembatas seksi (*Mahkota Diamond, Sulur Bunga, Garis Minimalis*).

### 6. 🎵 Music & Sound Studio
- Pustaka audio bebas royalti (*Royalty-Free Music*): Piano Klasik Romantis, Gitar Akustik, Gambus/Oud Islami, Cello String.
- Input URL audio kustom atau upload file MP3/WAV.
- Slider volume bawaan (0% - 100%).
- *Autoplay* saat tombol buka undangan ditekan (sesuai kebijakan browser mobile).
- Kustomisasi tombol floating audio: Ikon (💿 Piringan Hitam berputar, ♫ Not Balok, 𝄞 Kunci G, 🔊 Speaker) dan posisi sudut layar.
- Dilengkapi synthesizer Web Audio API otomatis jika koneksi audio eksternal offline.

### 7. 🧩 Section Builder (Komponen Adaptif)
Admin dapat menambah, menyusun ulang, menyembunyikan (*hide/show*), menduplikat, dan mengedit konten seksi:
- Komponen umum: *Cover, Salam Pembuka, Deskripsi Acara, Waktu & Tempat Pelaksanaan, Susunan Acara (Rundown), Countdown Timer, Lokasi & Peta, Galeri Foto (dengan Lightbox View), Video Teaser, RSVP, Buku Tamu, Amplop Digital, Protokol Kenyamanan Acara, Penutup*.
- Komponen khusus: Profil Mempelai, Profil Anak Khitan, Profil Bayi Aqiqah, Profil Tokoh/Penceramah.
- Pengurutan atas/bawah dengan tombol sentuh yang mudah ditekan di HP Android.

### 8. 📑 Template Manager
- Simpan desain undangan aktif menjadi template pakai-ulang (*Reusable Template*) yang dikelompokkan berdasarkan kategori acara.
- Terapkan template ke undangan baru atau undangan yang sedang diedit dengan isolasi data independen.
- Admin bebas menggunakan template pernikahan untuk kategori lain jika desainnya cocok.

### 9. 💌 Manajemen Tamu Personal, QR Code & WhatsApp Share
- Tambah tamu tunggal dan penambahan banyak tamu sekaligus (*Bulk Paste* multiline).
- Pembuatan link undangan personal unik: `/i/slug?to=Nama%20Tamu&token=xxxx`.
- **Tombol 1-Klik Kirim WhatsApp**: Membuka WhatsApp di HP dengan draf pesan personal sopan yang otomatis terisi.
- Ekspor data RSVP ke format spreadsheet **CSV**.

### 10. 🔒 Privasi, Penjadwalan & Snapshot Riwayat Perubahan
- Tingkat privasi undangan: *Publik, Khusus Link Tamu Terdaftar, atau Dilindungi Kata Sandi (PIN)*.
- **Jadwal Publikasi**: Tentukan tanggal dan jam undangan mulai dapat diakses publik.
- **Riwayat Perubahan (Design Versions)**: Buat snapshot cadangan sebelum merubah desain, dan pulihkan (*restore*) kapan saja dengan 1 klik.

---

## 📁 Struktur Direktori Proyek

```text
undangan/
├── functions/                     # Cloudflare Pages Functions (API Backend)
│   └── api/
│       ├── _utils.js              # Enkripsi HMAC, Cookie, Helper Sanitasi & Parsing
│       ├── invitation/
│       │   └── [slug].js          # Endpoint publik render undangan & status privasi
│       ├── guestbook/
│       │   └── [slug].js          # Umpan buku tamu publik real-time
│       ├── rsvp.js                # Pengiriman RSVP tamu publik
│       └── admin/                 # Endpoint terproteksi sesi admin
│           ├── login.js           # Login admin & pembuatan sesi HMAC
│           ├── logout.js          # Pembersihan cookie sesi
│           ├── me.js              # Pemeriksaan status autentikasi admin
│           ├── categories.js      # List & pembuatan kategori Custom Event Builder
│           ├── categories/
│           │   ├── [id].js        # Update & hapus kategori acara
│           │   └── [id]/duplicate.js # Gandakan kategori acara
│           ├── invitations.js     # List & pembuatan undangan baru multi-event
│           ├── invitations/
│           │   ├── [id].js        # Update & hapus data undangan serta setting studio
│           │   ├── [id]/duplicate.js # Duplikasi undangan beserta seksi & setting
│           │   ├── [id]/sections.js  # Batch save, reorder & tambah seksi
│           │   ├── [id]/sections/[sectionId].js # Update & hapus seksi individu
│           │   ├── [id]/guests.js    # Tambah tamu tunggal/bulk & daftar tamu
│           │   ├── [id]/rsvps.js     # Rekap data RSVP & ringkasan kehadiran
│           │   ├── [id]/stats.js     # Analitik kunjungan & data statistik
│           │   ├── [id]/versions.js  # Riwayat snapshot revisi desain
│           │   └── [id]/versions/[versionId]/restore.js # Pulihkan revisi desain
│           ├── guests/
│           │   └── [id].js        # Hapus tamu
│           ├── themes.js          # Daftar preset & simpan tema kustom
│           ├── themes/[id].js     # Update & hapus tema kustom
│           ├── templates.js       # Daftar & simpan template per kategori
│           ├── templates/[id].js  # Update & hapus template
│           ├── templates/[id]/apply.js # Terapkan template ke undangan
│           ├── assets.js          # Pustaka ornamen, audio, & media
│           └── assets/[id].js     # Hapus aset
├── public/                        # Static Frontend (Cloudflare Pages Host)
│   ├── _redirects                 # Aturan routing SPA (/admin, /i/*)
│   ├── index.html                 # Tampilan undangan publik dengan dynamic renderer
│   ├── admin.html                 # Dashboard admin responsif (16 menu studio)
│   ├── app.js                     # Runtime engine undangan, tema, animasi, audio
│   ├── admin.js                   # Controller admin dashboard & interaksi API
│   ├── style.css                  # Master CSS: Theme Engine, Animasi, Layout & Print
│   └── assets/                    # Aset ornamen SVG, pola, dan audio
│       ├── ornaments/             # Ornamen Islami, Bunga, Divider, Wax Seal
│       └── patterns/              # Pola latar Arabesque & Botanikal
├── migrations/                    # Skrip migrasi database Cloudflare D1
│   ├── 0001_initial.sql           # Skema v1 awal
│   ├── 0002_studios_and_builder.sql # Migrasi V2 studio desain
│   └── 0003_multi_event_platform.sql # Migrasi platform multi-acara & custom event builder
├── tests/                         # Pengujian otomatis end-to-end
│   └── run_all_tests.js           # Pengujian komprehensif 20 poin verifikasi
├── tools/                         # Utilitas pengembang & bridge SQLite
│   ├── db_bridge.py               # Emulator D1 database untuk pengujian lokal
│   ├── make_seed.py               # Generator data seed studio
│   └── make_migration_0003.py     # Generator skrip migrasi multi-event
├── schema.sql                     # Skema database D1 konsolidasi untuk instalasi baru
├── seed.sql                       # Data awal 12 kategori, 10 tema, template & demo
├── dev-server.js                  # Server lokal untuk pengujian & pratinjau offline
├── package.json                   # Konfigurasi ES Modules
└── wrangler.toml                  # Konfigurasi Cloudflare Pages & D1 binding
```

---

## 🚀 Panduan Instalasi & Deployment

### A. Pengujian Lokal Offline
1. Inisialisasi database lokal SQLite:
   ```bash
   python3 -c "import sqlite3; conn = sqlite3.connect('wedding.db'); conn.executescript(open('schema.sql').read()); conn.executescript(open('seed.sql').read())"
   ```
2. Jalankan server lokal:
   ```bash
   node dev-server.js
   ```
3. Buka browser:
   - Undangan Demo: `http://127.0.0.1:8787/i/demo`
   - Dashboard Admin: `http://127.0.0.1:8787/admin` (Password: `admin123`)
4. Jalankan pengujian 20 poin otomatis:
   ```bash
   node tests/run_all_tests.js
   ```

---

### B. Deployment ke Cloudflare Pages & Cloudflare D1

#### 1. Buat Database D1
1. Buka **Cloudflare Dashboard** > **Storage & Databases** > **D1 SQL Database**.
2. Klik **Create database**, beri nama: `undangan-db`.
3. Buka tab **Console** pada database tersebut:
   - Jalankan seluruh isi `schema.sql`.
   - Jalankan seluruh isi `seed.sql`.
   *(Jika mengupgrade database yang sudah berjalan, jalankan `migrations/0003_multi_event_platform.sql` agar seluruh data lama tetap aman).*
4. Catat **Database ID** yang muncul.

#### 2. Konfigurasi `wrangler.toml`
Buka `wrangler.toml` dan perbarui `database_id`:
```toml
name = "undangan"
compatibility_date = "2026-11-08"
pages_build_output_dir = "./public"

[[d1_databases]]
binding = "DB"
database_name = "undangan-db"
database_id = "MASUKKAN_DATABASE_ID_D1_MILIK_ANDA"
```

#### 3. Hubungkan ke Cloudflare Pages
1. Unggah source code ini ke repository GitHub Anda.
2. Di Cloudflare Dashboard, buka **Compute (Workers) > Workers & Pages** > **Create application** > tab **Pages** > **Connect to Git**.
3. Pilih repository GitHub Anda.
4. Pengaturan Build:
   - **Framework preset**: `None`
   - **Build command**: *(kosongkan)*
   - **Build output directory**: `public`
5. Klik **Save and Deploy**.

#### 4. Pasang Binding D1 dan Environment Variables
1. Buka project Pages Anda di Cloudflare Dashboard > tab **Settings**.
2. Masuk ke **Functions** > gulir ke **D1 database bindings**:
   - Klik **Add binding**.
   - **Variable name**: `DB`
   - **D1 database**: pilih `undangan-db`.
   - Simpan (*Save*).
3. Masuk ke menu **Environment Variables**:
   - Tambahkan variabel:
     - `ADMIN_PASSWORD` = Kata sandi login admin Anda.
     - `SESSION_SECRET` = String acak rahasia minimal 32 karakter.
   - Simpan (*Save*).
4. Lakukan **Retry deployment**.
5. Akses dashboard Anda di: `https://nama-proyek.pages.dev/admin`!

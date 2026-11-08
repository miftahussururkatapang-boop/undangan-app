# PANDUAN LENGKAP PEMASANGAN BARU (FRESH INSTALL)
## UNDANGAN V2 - Platform Undangan Digital Multi-Acara

Panduan resmi langkah demi langkah untuk memasang dan menjalankan platform **UNDANGAN V2** dari nol hingga siap digunakan secara online maupun offline.

---

## DAFTAR ISI
1. [Kebutuhan & Persyaratan Awal](#1-kebutuhan--persyaratan-awal)
2. [Jalur A: Deployment Online ke Cloudflare Pages & D1 (Rekomendasi Utama)](#2-jalur-a-deployment-online-ke-cloudflare-pages--d1)
3. [Jalur B: Deployment Langsung Melalui HP Android (Tanpa Laptop)](#3-jalur-b-deployment-langsung-melalui-hp-android)
4. [Jalur C: Pemasangan & Uji Coba Lokal di Komputer (Offline)](#4-jalur-c-pemasangan--uji-coba-lokal-di-komputer)
5. [Langkah Pasca Pemasangan (Setup Pertama Kali)](#5-langkah-pasca-pemasangan-setup-pertama-kali)
6. [Tanya Jawab & Solusi Kendala (Troubleshooting)](#6-tanya-jawab--solusi-kendala-troubleshooting)

---

## 1. Kebutuhan & Persyaratan Awal

Sebelum memulai pemasangan, siapkan akun dan berkas berikut:

| Kebutuhan | Keterangan | Biaya |
|:---|:---|:---:|
| **Akun Cloudflare** | Mendaftar di [cloudflare.com](https://dash.cloudflare.com/sign-up) untuk hosting Pages dan database D1. | **Gratis** |
| **Akun GitHub** | Mendaftar di [github.com](https://github.com/) untuk menyimpan source code repository. | **Gratis** |
| **Berkas Proyek** | File arsip `undangan-v2-final.zip`. | **Tersedia** |
| **Browser Web** | Google Chrome, Mozilla Firefox, Microsoft Edge, atau Safari. | **Gratis** |

> 📌 **Catatan Biaya:** Paket gratis Cloudflare Pages memberikan bandwidth tanpa batas (*unlimited*), SSL HTTPS otomatis, dan database Cloudflare D1 gratis hingga 5 juta pembacaan (*reads*) per hari. Anda tidak memerlukan kartu kredit untuk memulai.

---

## 2. Jalur A: Deployment Online ke Cloudflare Pages & D1

Metode ini adalah cara standar tercepat agar undangan Anda langsung aktif dan dapat diakses publik melalui internet.

### Langkah 1: Ekstrak File ZIP & Upload ke GitHub
1. Unduh dan ekstrak berkas `undangan-v2-final.zip` di komputer Anda.
2. Buka akun **[GitHub](https://github.com/)**, lalu klik tombol **New repository** (Repository Baru).
3. Isi kolom:
   - **Repository name**: `undangan-app` (atau nama lain yang Anda inginkan).
   - **Visibility**: Pilih `Public` atau `Private` (keduanya didukung penuh).
4. Klik tombol hijau **Create repository**.
5. Upload seluruh isi folder hasil ekstrak ke repository tersebut:
   - Pastikan folder `public/`, `functions/`, file `wrangler.toml`, `schema.sql`, dan `seed.sql` berada di direktori akar (*root*) repository Anda.
   - Lakukan *Commit changes*.

---

### Langkah 2: Buat Database Cloudflare D1
1. Buka dan masuk ke **[Cloudflare Dashboard](https://dash.cloudflare.com/)**.
2. Pada menu samping sebelah kiri, klik **Storage & Databases** > pilih **D1 SQL Database**.
3. Klik tombol biru **Create database**.
4. Masukkan nama database: `undangan-db`.
5. Klik **Create**. Database D1 Anda sekarang sudah terbentuk.
6. Pada halaman database tersebut, klik tab **Console**:
   - **Eksekusi Struktur Tabel:**
     1. Buka file `schema.sql` dari berkas proyek Anda dengan text editor (Notepad/VSCode).
     2. Salin seluruh teksnya, tempelkan ke kolom SQL Console di Cloudflare, lalu klik **Execute**.
   - **Eksekusi Data Bawaan (12 Kategori, 10 Tema, & Demo):**
     1. Buka file `seed.sql` dari berkas proyek Anda.
     2. Salin seluruh teksnya, tempelkan ke kolom SQL Console di Cloudflare, lalu klik **Execute**.
7. Kembali ke tab **Overview** pada database D1 Anda. Salin nilai **Database ID** (deretan karakter acak, contoh: `4a8b9c21-1234-5678-90ab-cdef12345678`).

---

### Langkah 3: Perbarui File `wrangler.toml` di GitHub
Buka repository GitHub Anda, edit file `wrangler.toml`, dan ganti nilai `database_id` dengan Database ID yang baru saja Anda salin pada Langkah 2:

```toml
name = "undangan"
compatibility_date = "2026-11-08"
pages_build_output_dir = "./public"

[[d1_databases]]
binding = "DB"
database_name = "undangan-db"
database_id = "PASTE_DATABASE_ID_D1_ANDA_DI_SINI"
```
Simpan perubahan file (*Commit changes*).

---

### Langkah 4: Hubungkan GitHub ke Cloudflare Pages
1. Pada Cloudflare Dashboard, buka menu **Compute (Workers) > Workers & Pages**.
2. Klik tombol **Create application** > pilih tab **Pages** > klik **Connect to Git**.
3. Pilih akun GitHub Anda dan pilih repository `undangan-app`.
4. Pada halaman konfigurasi build:
   - **Project name**: Biarkan `undangan` (ini akan menjadi alamat `https://undangan.pages.dev`).
   - **Production branch**: `main` (atau `master`).
   - **Framework preset**: Pilih `None`.
   - **Build command**: Kosongkan (jangan diisi apa pun).
   - **Build output directory**: Ketikkan `public`.
5. Klik tombol **Save and Deploy**. Tunggu sekitar 1 menit hingga proses build awal selesai.

---

### Langkah 5: Sambungkan Binding Database D1 & Secrets
Ini adalah langkah paling krusial agar fitur login admin, RSVP, dan penyimpanan data dapat berkomunikasi dengan database D1:

1. Di Cloudflare Dashboard, buka project Pages yang baru saja dibuat.
2. Masuk ke tab **Settings** di bagian atas.
3. Klik submenu **Functions** pada menu samping kiri:
   - Gulir ke bawah ke bagian **D1 database bindings**.
   - Klik **Add binding**.
   - **Variable name**: Ketikkan `DB` (wajib huruf kapital).
   - **D1 database**: Pilih `undangan-db`.
   - Klik **Save**.
4. Klik submenu **Environment Variables** pada menu samping kiri:
   - Klik **Add variables** untuk lingkungan *Production*:
     - Variabel 1:
       - Name: `ADMIN_PASSWORD`
       - Value: Masukkan password rahasia admin Anda (contoh: `AdminKuat2027!`).
     - Variabel 2:
       - Name: `SESSION_SECRET`
       - Value: Masukkan string acak panjang minimal 32 karakter (contoh: `m9k2j4n8b7v5c3x1z0q9w8e7r6t5y4u3`).
   - Klik **Save**.
5. **Wajib Deploy Ulang Sekali Lagi:**
   - Klik tab **Deployments** di bagian atas.
   - Pada deployment paling atas (terbaru), klik tombol titik tiga `...` di sebelah kanan > pilih **Retry deployment**.
   - Langkah ini memastikan Cloudflare mengaktifkan binding database dan variabel rahasia ke fungsi API backend.

---

### Langkah 6: Selesai! Uji Akses
Buka peramban Anda dan kunjungi:
- **Tampilan Undangan Demo Publik:**
  `https://nama-proyek-anda.pages.dev/i/demo`
- **Dashboard Admin:**
  `https://nama-proyek-anda.pages.dev/admin`
- Masukkan password yang telah Anda buat pada `ADMIN_PASSWORD`.

---

## 3. Jalur B: Deployment Langsung Melalui HP Android

Jika Anda tidak memiliki laptop/PC, Anda dapat melakukan seluruh proses pemasangan 100% menggunakan smartphone Android:

1. **Persiapan Berkas di HP:**
   - Unduh berkas `undangan-v2-final.zip`.
   - Gunakan aplikasi file manager gratis seperti **ZArchiver** (dari Google Play Store) untuk mengekstrak file ZIP ke dalam memori internal HP.
2. **Upload ke GitHub via Browser HP:**
   - Buka browser **Google Chrome** di HP Anda.
   - Ketuk menu titik tiga di pojok kanan atas Chrome, lalu centang **Desktop site** (Situs Desktop).
   - Masuk ke `github.com`, buat repository baru, dan upload file menggunakan tombol *Add file > Upload files*.
3. **Setup Database & Pages di Cloudflare:**
   - Tetap gunakan mode *Situs Desktop* di Chrome HP.
   - Buka `dash.cloudflare.com`. Seluruh menu D1 Console, Pages Git connection, dan pengaturan Environment Variables dapat diisi secara lancar melalui layar HP.
4. **Kelola dari Layar Sentuh:**
   - Setelah aktif, buka halaman `/admin`. Dashboard otomatis menyesuaikan ke mode tampilan HP yang sangat nyaman disentuh satu tangan.

---

## 4. Jalur C: Pemasangan & Uji Coba Lokal di Komputer

Jika Anda seorang developer yang ingin mencoba, memodifikasi desain, atau menguji secara offline di komputer lokal:

### Persyaratan Lokal:
- Telah terpasang **Node.js v18+** (`node -v`).
- Telah terpasang **Python 3** (`python3 --version`).

### Langkah-langkah:
1. Buka Terminal / Command Prompt pada folder proyek yang telah diekstrak.
2. Inisialisasi database SQLite lokal (`wedding.db`):
   ```bash
   python3 -c "import sqlite3; conn = sqlite3.connect('wedding.db'); conn.executescript(open('schema.sql').read()); conn.executescript(open('seed.sql').read()); print('Database lokal siap.')"
   ```
3. Jalankan server lokal:
   ```bash
   npm start
   ```
   *(Atau jalankan `node dev-server.js`)*
4. Buka browser:
   - Undangan Demo: `http://127.0.0.1:8787/i/demo`
   - Dashboard Admin: `http://127.0.0.1:8787/admin`
   - Password Admin Bawaan Lokal: `admin123`
5. Untuk menjalankan rangkaian uji otomatis 20 poin:
   ```bash
   npm test
   ```

---

## 5. Langkah Pasca Pemasangan (Setup Pertama Kali)

Setelah instalasi berhasil, ikuti panduan awal ini:

1. **Masuk ke Dashboard Admin:**
   - Buka `/admin` dan login.
2. **Buat Undangan Pertama Anda:**
   - Ketuk tab **➕ Buat Undangan Baru**.
   - Pilih salah satu kategori acara (misal: *Pernikahan, Khitanan, Ulang Tahun, Pengajian*, dll).
   - Masukkan alamat URL unik (slug), misalnya: `nikah-andi-rina` atau `khitan-farhan`.
   - Isi formulir acara dan klik **Simpan & Lanjutkan ke Desain**.
3. **Pilih Tema di Theme Studio:**
   - Buka tab **🎨 Theme Studio**, pilih salah satu dari 10 tema mewah, atau atur palet warna sendiri.
   - Klik **Simpan Perubahan Tema**.
4. **Pilih Animasi di Animation Studio:**
   - Buka tab **✨ Animation Studio**, pilih gaya pembuka (misal *Amplop Wax Seal* atau *Tirai*), lalu simpan.
5. **Tambahkan Nama Tamu & Kirim via WhatsApp:**
   - Buka tab **👥 Daftar Tamu**.
   - Masukkan daftar nama tamu (satu nama per baris), lalu klik **Tambahkan Tamu**.
   - Klik tombol hijau **💬 Kirim WA** di sebelah nama tamu untuk langsung mengirimkan pesan undangan personal otomatis.

---

## 6. Tanya Jawab & Solusi Kendala (Troubleshooting)

### Q1: Saat membuka `/admin`, muncul tulisan "ADMIN_PASSWORD dan SESSION_SECRET belum dipasang"?
**Penyebab:** Variabel rahasia belum didaftarkan di Cloudflare Pages atau deployment belum diperbarui.  
**Solusi:**
1. Masuk ke Cloudflare Dashboard > Pages > **Settings** > **Environment Variables**.
2. Pastikan `ADMIN_PASSWORD` dan `SESSION_SECRET` sudah terdaftar untuk *Production*.
3. Buka tab **Deployments**, klik `...` pada deployment terbaru, lalu pilih **Retry deployment**.

---

### Q2: Saat login atau menyimpan data, muncul pesan error "D1 binding error" atau HTTP 500?
**Penyebab:** Cloudflare Pages belum terhubung ke database D1.  
**Solusi:**
1. Buka Cloudflare Dashboard > Pages > **Settings** > **Functions**.
2. Gulir ke **D1 database bindings**.
3. Pastikan sudah ada binding dengan nama variabel **`DB`** (harus huruf kapital persis `DB`) yang diarahkan ke database D1 Anda.
4. Lakukan **Retry deployment**.

---

### Q3: Saat membuat undangan baru, muncul pesan "Slug sudah digunakan"?
**Penyebab:** Alamat slug undangan (misal: `/i/demo`) bersifat unik untuk setiap acara.  
**Solusi:** Gunakan nama slug yang berbeda, misalnya `pernikahan-ahmad-siti`, `khitan-adit-2027`, atau tambahkan angka tahun di belakangnya.

---

### Q4: Apakah musik latar bisa otomatis berputar saat tamu membuka link di HP?
**Penjelasan:** Seluruh peramban modern di smartphone (Chrome, Safari iOS, Samsung Internet) memiliki kebijakan keamanan ketat yang melarang pemutaran audio secara otomatis sebelum ada interaksi sentuhan dari pengguna.  
**Solusi Aplikasi:** UNDANGAN V2 telah mengintegrasikan fitur ini dengan sempurna: ketika tamu menyentuh tombol **"✧ Buka Undangan ✧"**, musik akan otomatis langsung berputar (*autoplay*) secara mulus tanpa melanggar kebijakan browser.

---

### Q5: Bagaimana cara memasang domain sendiri (misal: `undanganresmi.com`)?
**Langkah:**
1. Di Cloudflare Pages, buka tab **Custom domains**.
2. Klik tombol **Set up a custom domain**.
3. Masukkan nama domain Anda, lalu ikuti petunjuk DNS otomatis dari Cloudflare. Penambahan domain di Cloudflare Pages adalah **100% Gratis** dan sertifikat SSL HTTPS akan diterbitkan otomatis.

# Panduan Lengkap Deployment Cloudflare Pages & D1
## UNDANGAN V2 - Platform Undangan Digital Multi-Acara

Panduan langkah demi langkah untuk men-deploy aplikasi **UNDANGAN V2** ke **Cloudflare Pages** dan menghubungkannya dengan database serverless **Cloudflare D1**.

---

### Langkah 1: Persiapan Database Cloudflare D1
1. Masuk ke **[Cloudflare Dashboard](https://dash.cloudflare.com/)**.
2. Pada menu samping sebelah kiri, pilih **Storage & Databases** > **D1 SQL Database**.
3. Klik tombol **Create database**.
4. Masukkan nama database: `undangan-db` (atau nama pilihan Anda).
5. Klik **Create**.
6. Setelah database dibuat, klik nama database tersebut lalu buka tab **Console**:
   - **Untuk Instalasi Baru (Fresh Install):**
     1. Salin seluruh isi file `schema.sql`, tempelkan ke kolom SQL Console, lalu klik **Execute**.
     2. Salin seluruh isi file `seed.sql`, tempelkan ke kolom SQL Console, lalu klik **Execute**.
   - **Untuk Upgrade dari Versi Sebelumnya (Migrasi Aman Tanpa Hapus Data):**
     1. Salin seluruh isi file `migrations/0002_studios_and_builder.sql`, lalu klik **Execute**.
     2. Salin seluruh isi file `migrations/0003_multi_event_platform.sql`, lalu klik **Execute**.
7. Pada halaman utama database D1 Anda, catat nilai **Database ID** (berupa deretan karakter acak seperti `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`).

---

### Langkah 2: Konfigurasi `wrangler.toml`
Buka file `wrangler.toml` di proyek Anda, lalu masukkan `database_id` yang didapat dari Langkah 1:

```toml
name = "undangan"
compatibility_date = "2026-11-08"
pages_build_output_dir = "./public"

[[d1_databases]]
binding = "DB"
database_name = "undangan-db"
database_id = "MASUKKAN_DATABASE_ID_D1_ANDA_DI_SINI"
```

---

### Langkah 3: Unggah Source Code ke GitHub
1. Buat repository baru di akun GitHub Anda (misal bernama `undangan-platform`).
2. Unggah seluruh isi file proyek ini ke dalam repository tersebut.
   *(Pastikan file `public/` dan folder `functions/` berada pada akar repository).*

---

### Langkah 4: Hubungkan Repository ke Cloudflare Pages
1. Pada Cloudflare Dashboard, buka **Compute (Workers) > Workers & Pages**.
2. Klik tombol **Create application** > pilih tab **Pages** > klik **Connect to Git**.
3. Pilih akun GitHub Anda dan pilih repository `undangan-platform`.
4. Pada formulir **Set up builds and deployments**:
   - **Project name**: `undangan` (atau nama subdomain yang Anda inginkan).
   - **Production branch**: `main` (atau `master`).
   - **Framework preset**: Pilih `None`.
   - **Build command**: *(kosongkan, tidak memerlukan build command)*.
   - **Build output directory**: Isi dengan `public`.
5. Klik **Save and Deploy**. Cloudflare Pages akan memproses upload aset statis pertama kali.

---

### Langkah 5: Pasang D1 Database Binding & Environment Variables
Setelah build pertama selesai, Anda **wajib** menyambungkan database D1 dan kata sandi admin:

1. Buka project Pages Anda di Cloudflare Dashboard > buka tab **Settings**.
2. Masuk ke submenu **Functions** di sebelah kiri:
   - Gulir ke bawah ke bagian **D1 database bindings**.
   - Klik **Add binding**.
   - **Variable name**: Masukkan huruf kapital `DB` *(harus persis DB)*.
   - **D1 database**: Pilih database `undangan-db` yang Anda buat pada Langkah 1.
   - Klik **Save**.
3. Masuk ke submenu **Environment Variables** di sebelah kiri:
   - Klik **Add variables** (untuk Production):
     - `ADMIN_PASSWORD` = Masukkan kata sandi admin pilihan Anda yang kuat.
     - `SESSION_SECRET` = Masukkan string acak panjang minimal 32 karakter (misal: `k8h92j4n8f7b3v5x1m0q9w8e7r6t5y4u`).
   - Klik **Save**.
4. Masuk ke tab **Deployments** di bagian atas:
   - Pada deployment terakhir, klik menu titik tiga di sebelah kanan > pilih **Retry deployment**.
   - Hal ini bertujuan agar binding database `DB` dan environment variable aktif pada fungsi API.

---

### Langkah 6: Verifikasi & Siap Digunakan!
1. Buka URL project Cloudflare Pages Anda:
   - **Halaman Undangan Demo**: `https://nama-proyek-anda.pages.dev/i/demo`
   - **Dashboard Admin**: `https://nama-proyek-anda.pages.dev/admin`
2. Masuk menggunakan kata sandi admin yang telah Anda pasang pada `ADMIN_PASSWORD`.
3. Anda kini dapat mulai membuat undangan pernikahan, khitanan, aqiqah, ulang tahun, dan berbagai kategori acara lainnya langsung dari HP maupun desktop!

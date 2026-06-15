# SIAKAD 🏫

![CI/CD Pipeline](https://github.com/muhammadiqbal29-cyber/SIAKAD/actions/workflows/ci.yml/badge.svg)

![Landing Page](/public/screenshots/landing.png)

> **🚀 LIVE DEMO:** Coba aplikasinya sekarang di [https://siakad-demo-pearl.vercel.app/](https://siakad-demo-pearl.vercel.app/)
> 
> **Kredensial Login (Admin):**
> - **Email:** `admin@yayasan.com`
> - **Password:** `admin123`
> 
> *Catatan: Segala perubahan data pada versi Live Demo ini bersifat sementara. Database akan otomatis di-reset ke kondisi awal setiap tengah malam (00:00 UTC).*
Selamat datang di **SIAKAD**. Ini adalah Sistem Informasi Akademik *full-stack* yang saya kembangkan untuk menyelesaikan berbagai kendala administrasi sekolah yang seringkali tersebar di banyak platform.

Aplikasi ini mendukung multi-hak akses (Admin, Guru, dan Siswa) dan mencakup siklus akademik secara menyeluruh: mulai dari pendaftaran peserta didik baru (PPDB), penilaian Kurikulum Merdeka, hingga manajemen tagihan SPP. Seluruh ekosistem ini dibangun menggunakan Next.js App Router, Prisma, dan PostgreSQL.

---

## 🎯 Latar Belakang & Solusi (Problem & Solution)

**Masalah di Lapangan:** 
Dari pengamatan saya, banyak institusi pendidikan masih menggunakan sistem yang terfragmentasi. Rekapitulasi nilai menggunakan Microsoft Excel, formulir pendaftaran melalui Google Forms, dan pencatatan keuangan yang masih manual. Dampaknya, terjadi duplikasi pekerjaan bagi tenaga pendidik, rentannya kehilangan data, dan minimnya wawasan strategis (*insight*) yang bisa didapatkan oleh Kepala Sekolah secara langsung.

**Solusi yang Ditawarkan:** 
Saya mengembangkan SIAKAD ini sebagai satu ekosistem terpusat. Data menjadi saling terintegrasi. Guru cukup memasukkan nilai satu kali, dan data tersebut akan otomatis terhubung ke pencetakan E-Rapor siswa, dapat dipantau melalui dasbor orang tua, serta langsung teragregasi menjadi grafik *Year-over-Year* untuk evaluasi Kepala Sekolah.

---

## 🧠 Keputusan Arsitektur & Teknologi

Sebagai pengembang, berikut adalah alasan teknis di balik pemilihan teknologi aplikasi ini:

- **Next.js 16+ (App Router):** Saya membutuhkan aplikasi dengan *Landing Page* publik yang sangat ramah SEO untuk menarik calon siswa, sekaligus memiliki *Dashboard* internal yang interaktif dan reaktif. App Router Next.js sangat ideal untuk menyatukan dua kebutuhan komputasi tersebut di dalam satu basis kode (*monorepo*).
- **Prisma + PostgreSQL:** Data operasional sekolah sangatlah relasional (contoh: Siswa memiliki Nilai, Nilai terikat pada Mata Pelajaran, Mata Pelajaran diajarkan oleh Guru tertentu). Integritas relasional seperti *Foreign Key* sangat krusial, sehingga PostgreSQL adalah pilihan terbaik. Prisma digunakan untuk menjamin keamanan penulisan *query* (*type-safe*) dari awal hingga akhir.
- **Client-Side Rendering (Recharts & PDF):** Untuk pembuatan grafik statistik dan komputasi pembuatan dokumen PDF E-Rapor, proses render didelegasikan ke sisi *client* (peramban pengguna). Strategi ini sangat efektif untuk mengurangi beban *server* saat periode sibuk pembagian rapor.

---

## 📸 Tampilan Aplikasi (Screenshots)

### 1. Executive Dashboard (Admin)
![Admin Dashboard](/public/screenshots/admin-dashboard.png)
*Dasbor eksekutif yang menyajikan metrik keuangan dan grafik perbandingan nilai akademik siswa antartahun.*

### 2. Modul PPDB (Penerimaan Peserta Didik Baru)
![PPDB CRM](/public/screenshots/ppdb-crm.png)
*Sistem manajemen calon siswa dengan pendekatan CRM (Customer Relationship Management) untuk mempermudah panitia melacak status pendaftaran.*

### 3. Dasbor Analitik Guru (Teacher Dashboard)
![Teacher Dashboard](/public/screenshots/teacher-dashboard.png)
*Dasbor khusus bagi tenaga pendidik untuk mengelola presensi harian dan menganalisis statistik kelemahan akademik kelas yang diampunya.*

### 4. Portal Informasi Siswa (Student Dashboard)
![Student Dashboard](/public/screenshots/student-dashboard.png)
*Akses mandiri bagi siswa untuk memantau jadwal pelajaran, melihat rekapitulasi nilai secara transparan, serta memeriksa status tagihan keuangan.*

### 5. Portal Autentikasi Terpusat
![Login](/public/screenshots/login.png)
*Akses masuk terpusat yang secara otomatis mengarahkan pengguna (Admin/Guru/Siswa) ke ruang kerjanya masing-masing berdasarkan hak akses.*

---

## ✨ Fitur Unggulan

### Akademik & Rapor
- **Dukungan Kurikulum Merdeka:** Mengakomodasi skema nilai Formatif, Sumatif, hingga penilaian dimensi P5 (Profil Pelajar Pancasila).
- **E-Rapor Otomatis:** Fitur cetak rapor PDF sekali klik yang dilengkapi dengan kecerdasan sistem untuk menghasilkan deskripsi capaian otomatis berdasarkan nilai tertinggi dan terendah siswa.
- **Impor Jadwal Massal:** Admin dapat mengunggah jadwal pelajaran dan penugasan guru secara massal menggunakan berkas Excel.

### Keuangan
- **Pembuatan Tagihan Terpusat:** *Generate* tagihan SPP atau Uang Gedung secara serentak untuk seluruh siswa atau per angkatan.
- **Pelacakan Status Pembayaran:** Memantau siswa mana yang telah melunasi pembayaran, menyicil, atau memiliki tunggakan yang jatuh tempo.

### PPDB (Pendaftaran)
- **Manajemen Calon Siswa (Leads):** Dasbor khusus bagi panitia untuk menindaklanjuti calon pendaftar dari tahap minat hingga resmi terdaftar.
- **Papan Kehormatan (Hall of Fame):** Komponen publik di halaman utama yang secara otomatis mempromosikan siswa dengan perolehan nilai akademik tertinggi.

---

## 🔑 Hak Akses Pengguna (Role)

Sistem ini didesain dengan tiga tingkat otorisasi utama:

1. **Admin / Tata Usaha**
   - Memegang kendali penuh atas data master (Tahun Ajaran, Kelas, Siswa, Guru).
   - Mengelola jadwal pelajaran.
   - Mengawasi arus kas keuangan dan membuat tagihan siswa.
   
2. **Guru**
   - Memiliki akses ke *Teacher Dashboard* untuk menganalisis metrik kelemahan dan kekuatan akademik setiap kelas.
   - Mengisi nilai akademik.
   - Bertindak sebagai Wali Kelas (menambahkan catatan absensi kelas dan mencetak dokumen E-Rapor).

3. **Siswa**
   - Memantau capaian nilai secara aktual (*real-time*).
   - Melihat jadwal pelajaran pribadi secara spesifik.
   - Memeriksa histori pembayaran dan kewajiban tagihan sekolah.

---

## 🚀 Panduan Instalasi Lokal

Ingin menjalankan atau mengembangkan proyek ini di mesin lokal Anda? Berikut adalah langkah-langkahnya:

### Prasyarat:
- Node.js (versi 18+)
- PostgreSQL (berjalan di *local environment* Anda)
- Git

### Langkah Instalasi:

1. **Klon Repositori**
   ```bash
   git clone https://github.com/muhammadiqbal29-cyber/SIAKAD.git
   cd SIAKAD
   ```

2. **Instalasi Dependensi**
   ```bash
   npm install
   ```

3. **Konfigurasi Lingkungan (Environment Variables)**
   Salin berkas `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```
   Buka berkas `.env` dan sesuaikan nilai `DATABASE_URL` dengan rincian koneksi PostgreSQL Anda. Contoh:
   ```env
   DATABASE_URL="postgresql://postgres:password_anda@localhost:5432/siakad_db?schema=public"
   NEXTAUTH_SECRET="buat_kunci_rahasia_acak_disini"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Migrasi Database**
   Terapkan struktur tabel ke *database* lokal Anda:
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Injeksi Data Pengujian (Seeding) & Jalankan Server**
   Pertama, nyalakan *development server*:
   ```bash
   npm run dev
   ```
   Selanjutnya, buka peramban Anda dan akses `http://localhost:3000/api/setup`. 
   Langkah ini secara otomatis akan membangun kerangka data awal seperti Tahun Ajaran, Kelas, Siswa dummy, serta akun pengelola. Harap tunggu hingga proses selesai.

6. **Mulai Menjelajah!**
   Buka `http://localhost:3000` di peramban Anda.

### Akun Pengujian
Jika Anda telah menjalankan proses `/api/setup` di atas, silakan gunakan kredensial berikut untuk menguji coba fitur sesuai hak aksesnya:
- **Admin:** `admin@yayasan.com` | Sandi: `admin123`
- **Guru:** Gunakan angka `NUPTK` yang dihasilkan oleh sistem (misal: `1234567890`) | Sandi: `<NOMOR_NUPTK>`
- **Siswa:** Gunakan angka `NISN` yang dihasilkan oleh sistem (misal: `0012345678`) | Sandi: `<NOMOR_NISN>`

---

## 🤝 Kontribusi (Contributing)

SIAKAD adalah proyek sumber terbuka (*open-source*), dan saya sangat menyambut baik segala bentuk kontribusi dari komunitas! 

Jika Anda menemukan kutu (*bug*), memiliki ide fitur baru, atau ingin memperbaiki performa kode, silakan:
1. Lakukan *Fork* pada repositori ini.
2. Buat *branch* fitur Anda (`git checkout -b fitur/FiturKerenAnda`).
3. Lakukan *Commit* perubahan Anda (`git commit -m 'Menambahkan fitur keren'`).
4. Lakukan *Push* ke *branch* tersebut (`git push origin fitur/FiturKerenAnda`).
5. Buka *Pull Request* baru.

Mari bersama-sama membangun sistem akademik yang lebih baik!

---

## ⭐ Dukungan (Support)

Jika Anda merasa proyek SIAKAD ini bermanfaat, menginspirasi, atau membantu Anda dalam belajar pengembangan *full-stack*, mohon luangkan waktu sebentar untuk memberikan **Bintang (Star) ⭐️** pada repositori ini. 

Dukungan Anda sangat berarti bagi saya untuk terus mengembangkan proyek *open-source* di masa mendatang. Terima kasih! 🎉

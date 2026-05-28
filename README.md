# ⛪ GKI Dashboard - Visualisasi & Analisis LKKJ

Aplikasi dashboard modern yang dirancang khusus untuk memvisualisasikan, menganalisis, dan mengekspor data **LKKJ (Laporan Keadaan dan Kegiatan Jemaat)** secara dinamis dari file spreadsheet Excel (Google Sheets). Dibuat dengan arsitektur modern berkinerja tinggi menggunakan **React + TypeScript + FastAPI**.

---

## 🚀 Fitur Utama

- **📊 Visualisasi Komprehensif & Interaktif**:
  Menampilkan grafik interaktif untuk berbagai aspek jemaat secara *real-time*:
  - **Executive Summary & Analisa**: Modul dashboard cerdas yang mengagregasi data dari seluruh *sheet* untuk menghasilkan deteksi anomali, tren jangka panjang, dan peringatan dini (*early warning system*). (Lihat detail selengkapnya di bagian **Modul Analisa & Algoritma** di bawah).
  - **Kehadiran Kebaktian**: Analisis mendalam per ibadah (Minggu, Kategorial, Persekutuan, Perayaan).
  - **Persidangan & Rapat**: Statistik kehadiran peserta rapat majelis jemaat.
  - **Keuangan (UANG)**: Analisis komitmen persembahan, akumulasi penerimaan bulanan, dan perbandingan dengan tahun lalu.
  - **Demografi & Profil Jemaat (DIRI)**: Statistik berbasis usia, gender, etnis, tingkat pendidikan, dan profesi.
  - **Tenaga Pelayanan (TENAGA)**: Rasio penatua terhadap jemaat, rasio guru sekolah minggu terhadap anak, dan keaktifan aktivis.
  - **Mutasi Jemaat (Mutasi)**: Grafik alasan perpindahan jemaat, pertambahan, pengurangan, dan rekapitulasi mutasi tahunan.

- **⚡ Background-Cached Tab (Instant Switch)**:
  Sistem perpindahan tab dengan rendering di latar belakang dan caching cerdas, menghilangkan jeda waktu (*loading*) saat berganti menu. Transisi menu berjalan instan dan mulus.

- **📄 Ekspor PDF Multi-Halaman Profesional**:
  Mengekspor setiap chart beserta ringkasannya ke halaman PDF terpisah (satu chart per halaman) untuk kerapian cetak laporan fisik.
  - Format nama file otomatis: `GKI_(Nama GKI)_(Nama Halaman/Bagian)`
  - Contoh: `GKI_Waha_Analisa.pdf` atau `GKI_Waha_Keb. Minggu.pdf`

- **💻 Ekspor PowerPoint (PPTX) Instan**:
  Membuat berkas presentasi PowerPoint (.pptx) dari grafik dan ringkasan eksekutif secara instan untuk kebutuhan rapat majelis jemaat.
  - Format nama file otomatis: `GKI_(Nama GKI)_(Nama Halaman/Bagian).pptx`

- **⚙️ Live Google Sheets Parser (FastAPI)**:
  Membaca dan memproses spreadsheet Google Sheets secara live. Dilengkapi fitur **fallback cache lokal** (`cache/data.json`) sehingga aplikasi tetap dapat berjalan secara luring (*offline*) apabila koneksi internet terputus.

---

## 📈 Modul Analisa & Algoritma

Bagian ini khusus menjelaskan berbagai modul kecerdasan buatan (algoritma) yang digunakan pada halaman **Executive Summary (Analisa)**. Dashboard secara otomatis memproses silang berbagai metrik untuk menghasilkan rekomendasi dan mendeteksi peringatan dini:

1. **Perbandingan Jumlah Anggota dan Kehadiran Jemaat di Kebaktian**
   - **Sumber Data**: `Data DIRI (Massa)` dan `Kehadiran Keb. Kategorial`.
   - **Algoritma**: Membandingkan jumlah anggota riil terdaftar pada setiap kelompok usia (Anak, Remaja, Pemuda, Dewasa, Lansia) di data DIRI dengan rata-rata total kehadiran mereka di kebaktian kategorial masing-masing.
   - **Peringatan (Alert)**: Jika rasio kehadiran dari kelompok usia tertentu anjlok di bawah 50% dari total populasinya.

2. **Kesenjangan Generasi & Missing Middle**
   - **Sumber Data**: `Data DIRI (Usia)`.
   - **Algoritma**: Mengekstrak data demografi usia spesifik: Pemuda (20-30), Dewasa Muda/Keluarga Muda (31-39), dan Lansia (>60). Algoritma menghitung rasio perbandingan Lansia terhadap Pemuda, serta melacak laju pertumbuhan/penyusutan Keluarga Muda.
   - **Peringatan (Alert)**: Jika rasio Pemuda terhadap Lansia < 0.5 (Krisis Regenerasi), atau jika populasi Keluarga Muda (31-39 tahun) menyusut drastis lebih dari 10% (Fenomena *Missing Middle*).

3. **Beban Layan Guru Sekolah Minggu (GSM)**
   - **Sumber Data**: `TENAGA (Rasio GSM)` dan `Kehadiran Keb. Kategorial`.
   - **Algoritma**: Membandingkan jumlah Guru Sekolah Minggu yang tersedia dengan rata-rata kehadiran anak sekolah minggu di kebaktian kategorial, untuk mendapatkan rasio 1 Guru menangani X Anak.
   - **Peringatan (Alert)**: Terpicu apabila beban pelayanan guru melampaui batas wajar (1 Guru menangani >10 Anak secara rata-rata).

4. **Sumber Pertumbuhan Jemaat (Migrasi vs Organik)**
   - **Sumber Data**: `Mutasi (Pertambahan)`.
   - **Algoritma**: Memilah metrik penambahan anggota baru dari dua sumber utama: Atestasi Masuk (Migrasi dari gereja lain) berbanding dengan Baptis Anak + Sidi (Pertumbuhan Organik/Lahir Baru). 
   - **Peringatan (Alert)**: Jika selama dua tahun berturut-turut, penambahan jemaat dari atestasi masuk mendominasi (1.5x lipat lebih besar) dibandingkan pertumbuhan organik.

5. **Stagnasi Tenaga Pelayanan (Volunteer)**
   - **Sumber Data**: `Data DIRI (Usia & Gender)` dan `TENAGA (Rekap Volunteer)`.
   - **Algoritma**: Membandingkan garis tren laju pertumbuhan jemaat secara umum dengan ketersediaan jumlah aktivis yang melayani.
   - **Peringatan (Alert)**: Jika laju pertumbuhan jemaat melebihi 5% secara akumulatif, namun ketersediaan aktivis stagnan atau minus, menandakan tingginya ancaman kelelahan (*burnout*) bagi pelayan yang ada.

6. **Indeks "Gereja Penonton" (Keterlibatan)**
   - **Sumber Data**: `Kehadiran Keb. Minggu` dan `TENAGA (Rekap Aktivis)`.
   - **Algoritma**: Mengalkulasi persentase jumlah warga sidi yang terlibat aktif sebagai pelayan dibandingkan dengan jumlah rata-rata jemaat yang duduk beribadah di hari Minggu.
   - **Peringatan (Alert)**: Terpicu jika rasio keterlibatan pelayanan terus mengalami penyusutan selama tiga tahun berturut-turut.

7. **Rasio Konversi Pengunjung Baru**
   - **Sumber Data**: `Kehadiran Keb. Minggu (Simpatisan)` dan `Mutasi Jemaat`.
   - **Algoritma**: Menyandingkan tren naiknya jumlah simpatisan/tamu yang mampir ke gereja dengan jumlah anggota yang pada akhirnya mau mendaftar sebagai warga jemaat tetap (atestasi masuk/baptis dewasa).
   - **Peringatan (Alert)**: Jika volume simpatisan meningkat drastis namun pendaftaran anggota tetap justru stagnan atau nihil.

8. **Perbandingan Penerimaan Kebaktian dan Luar Kebaktian**
   - **Sumber Data**: `UANG (Penerimaan)`.
   - **Algoritma**: Mengelompokkan nomor akun berdasarkan kategori "Persembahan Kebaktian" (No. 1 s/d 8) dan "Persembahan Luar Kebaktian" (No. 9 s/d 13). Mensimulasikan persilangan performa antarkeduanya dalam berbagai rentang waktu (1 bulan, 3 bulan, tahunan).
   - **Peringatan (Alert)**: Mendeteksi tren penurunan yang paling tajam pada pos persembahan tertentu.

9. **Indeks Lingkaran Tertutup (Closed-Circle Welcoming Index)**
   - **Sumber Data**: `Kehadiran Keb. Minggu`.
   - **Algoritma**: Mengukur persentase simpatisan (tamu tak dikenal/belum mendaftar) terhadap total seluruh jemaat ibadah minggu. Digunakan untuk mengukur apakah gereja telah menjadi komunitas yang terlalu inklusif atau ramah terhadap pendatang luar.
   - **Peringatan (Alert)**: Terpicu jika rasio kehadiran simpatisan turun di bawah 3% dari total audiens.

---

## 🛠️ Stack Teknologi

- **Frontend**:
  - **React 18** & **TypeScript** (Struktur kode yang aman dan bermutu tinggi)
  - **Vite** (Build tool super cepat)
  - **Recharts** / **Chart.js** (Visualisasi grafik responsif dan interaktif)
  - **Tailwind CSS** / **Custom CSS** (Tampilan modern dengan animasi mikro dan glassmorphism)
  - **html2canvas** & **jspdf** (Mesin ekspor PDF di sisi klien)
  - **pptxgenjs** (Pembuat slide presentasi PowerPoint dinamis)

- **Backend**:
  - **FastAPI** (Web framework Python berperforma tinggi)
  - **Pandas** & **OpenPyXL** (Pemrosesan dan pembersihan data Excel/LKKJ)
  - **Uvicorn** (ASGI server untuk FastAPI)

---

## 📁 Struktur Proyek

```text
GKI-Dashboard/
├── backend/                # Kode Python (FastAPI Backend)
│   ├── cache/              # Folder penyimpanan cache data luring (data.json)
│   ├── main.py             # Server FastAPI & Logic Parser Excel LKKJ
│   └── requirements.txt    # Dependensi pustaka Python
├── frontend/               # Kode React (TypeScript Frontend)
│   ├── src/
│   │   ├── components/     # Dashboard per bagian (Dashboard, Analisa, Diri, dll.)
│   │   ├── utils/          # Global utility (exportUtils untuk PDF/PPTX, dll.)
│   │   ├── parser.ts       # Logika parser data lokal
│   │   ├── updateNotes.ts  # Catatan pembaruan & riwayat build
│   │   └── App.tsx         # Root component & navigasi tab instan
│   ├── package.json        # Dependensi npm & skrip frontend
│   └── vite.config.ts      # Konfigurasi build Vite
├── start.bat               # Skrip inisialisasi & startup otomatis (Windows)
└── README.md               # Dokumentasi utama proyek
```

---

## ⚡ Cara Penggunaan Aplikasi (Tanpa Instalasi)

Aplikasi ini telah dikompilasi secara canggih menjadi satu buah berkas HTML mandiri (*single-file HTML*) yang sangat ringan dan portabel. **Anda tidak perlu repot-repot menginstal Python, Node.js, atau server tambahan apa pun.**

### Langkah-langkah Penggunaan:
1. Unduh (Download) repositori ini ke komputer Anda.
2. Buka folder utama, lalu cari berkas bernama **`GKI_Dashboard.html`**.
3. Klik ganda (*double-click*) berkas tersebut. Aplikasi akan otomatis terbuka di peramban web (*browser*) bawaan Anda seperti Google Chrome, Safari, atau Edge tanpa membutuhkan koneksi server.
4. Selesai! Anda dapat langsung menempelkan tautan (Link) Google Sheets LKKJ Anda di dalam aplikasi untuk mulai menganalisis.

---

## 📝 Catatan Rilis & Riwayat Build Terbaru

### Versi Terbaru (28 Mei 2026)
- Perbaikan UI: Membuat tabel ringkasan data membalik letaknya (menjadi vertikal) ketika grafik hanya menampilkan data tunggal, dan memungkinkan fitur shared tooltip ketika menyortir grafik data satuan.
- Perbaikan UI: Perbaikan nama periode menjadi berwujud bulan & tahun (mis. April 2025) pada tabel Perbandingan Penerimaan Kebaktian dan Luar Kebaktian.
- Otomatisasi pengenalan dan highlight perbedaan terbesar pada tren (kenaikan/penurunan terdalam antar periode) untuk Perbandingan Penerimaan.
- Penambahan ruang/margin pada legenda chart Perbandingan Penerimaan untuk mencegah tabrakan dengan tabel ringkasan.
- Penghapusan tombol fitur sisi akumulasi untuk menyederhanakan antarmuka sesuai preferensi terbaru.
- Perbaikan bug legenda tertukar (sinkronisasi 100% grafik dan legenda) untuk chart Konversi Pengunjung Baru.

### Versi Sebelumnya (27 Mei 2026)
- Otomatisasi penuh pembaruan catatan rilis pasca-build oleh AI tersinkronisasi dua-arah antara UI About dan GitHub README.
- Konsolidasi modul Missing Middle ke Kesenjangan Generasi dengan sinkronisasi urutan legenda.
- Penghapusan analisa Jemaat Musiman dan Giving Fatigue sesuai kebutuhan operasional.
- Optimalisasi arsitektur rendering: Penerapan sistem Background-Cached Tab yang menghilangkan lag dan *loading* saat berpindah menu (perpindahan instan).
- Refactoring & Kerapian Kode (Clean Code): Ekstraksi fitur Ekspor PDF dan PPTX menjadi Global Utility tunggal, membersihkan 500+ baris duplikasi kode di berbagai halaman.

### Versi Sebelumnya (26 Mei 2026)
- Penyeragaman format nama file hasil export PDF dan PPTX menjadi GKI_(Nama GKI)_(Bagian).
- Peningkatan fitur Export PDF untuk menghasilkan dokumen multi-halaman (setiap grafik/tabel dipisah per halaman).
- Penambahan tombol Export PDF dan PPTX pada halaman Executive Summary (Analisa).
- Pembaruan istilah pada Analisa Komitmen Finansial menjadi "Persembahan Kebaktian" & "Persembahan Luar Kebaktian".
- Pembaruan logika filter sumber data berdasarkan nomor urut indikator pada Analisa Komitmen Finansial.
- Perbaikan sumber data indikator (sheet Mutasi) pada Analisa Pertumbuhan Jemaat.


---

*Dikembangkan untuk efisiensi dan pelayanan di Gereja Kristen Indonesia (GKI).*

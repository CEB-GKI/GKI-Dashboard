# ⛪ GKI Dashboard - Visualisasi & Analisis LKKJ

Aplikasi dashboard modern yang dirancang khusus untuk memvisualisasikan, menganalisis, dan mengekspor data **LKKJ (Laporan Keadaan dan Kegiatan Jemaat)** secara dinamis dari file spreadsheet Excel (Google Sheets). Dibuat dengan arsitektur modern berkinerja tinggi menggunakan **React + TypeScript + FastAPI**.

---

## 🚀 Fitur Utama

- **📊 Visualisasi Komprehensif & Interaktif**:
  Menampilkan grafik interaktif untuk berbagai aspek jemaat secara *real-time*:
  - **Executive Summary & Analisa**: Analisis tingkat lanjut menggunakan algoritma pemrosesan agregasi lintas-sheet untuk mendapatkan *insight* mendalam:
    1. **Tren Kehadiran Jemaat & Simpatisan**: Rasio keaktifan anggota jemaat terhadap simpatisan (pencari gereja) dari waktu ke waktu.
    2. **Pertumbuhan Kehadiran vs Tahun Sebelumnya**: Mengukur persentase pertumbuhan jemaat tahun ini terhadap tahun lalu.
    3. **Tren Keterlibatan Berdasarkan Gender**: Memantau keseimbangan pelayanan dan kehadiran pria dan wanita.
    4. **Rasio Kehadiran On-Site terhadap Kapasitas**: Evaluasi utilisasi gedung dan identifikasi kebutuhan penambahan sesi ibadah.
    5. **Konversi Pengunjung Baru**: Mengukur efektivitas penyambutan dengan melihat rasio kehadiran simpatisan/pengunjung.
    6. **Kesenjangan Generasi dalam Kebaktian**: Menganalisa dominasi kelompok umur dan mendeteksi krisis *missing middle* (generasi yang hilang).
    7. **Kinerja Finansial Umum**: Pemantauan stabilitas persembahan syukur dan persepuluhan rata-rata mingguan.
    8. **Kinerja Lintas Kategori**: Menganalisa korelasi antara kehadiran di berbagai jenis ibadah dengan kontribusi keuangan.
    9. **Pertumbuhan Persembahan**: Menilai kesehatan finansial jemaat berdasarkan tren penerimaan rutin mingguan.
    10. **Rasio Kontributor (Estimasi)**: Perkiraan partisipasi finansial jemaat yang hadir.
    11. **Rasio Kehadiran Khusus vs Umum**: Perbandingan tingkat antusiasme perayaan gerejawi dengan ibadah reguler.
    12. **Konsistensi Partisipasi Pelayan**: Memantau rasio pelayan yang bertugas (penatua, pemusik) dengan total kehadiran jemaat.
    13. **Perbandingan Penerimaan (Kebaktian vs Luar Kebaktian)**: Melacak anomali persilangan (*crossover*) antara penerimaan rutin dan non-rutin beserta agregasinya.
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

## ⚡ Cara Instalasi & Menjalankan Aplikasi

Aplikasi ini dilengkapi dengan skrip inisialisasi otomatis menggunakan berkas `start.bat` untuk mempermudah operasional di Windows.

### Prasyarat
1. Pastikan **Anaconda/Miniconda** sudah terpasang dan berada dalam sistem `PATH` Anda.
2. Pastikan **Node.js** (versi 16+) sudah terpasang untuk menjalankan dan membangun aset frontend.

### Langkah-langkah
1. Unduh atau klon repositori ini ke komputer Anda.
2. Klik ganda (double-click) pada file **`start.bat`** di direktori utama proyek.
3. Skrip otomatis akan:
   - Membuat lingkungan Conda bernama `gki_waha_env` jika belum terdeteksi.
   - Memasang seluruh dependensi Python yang dibutuhkan.
   - Memasang modul Node.js dan mem-build aset frontend React.
   - Menjalankan server FastAPI backend.
   - Membuka peramban (browser) Anda secara otomatis menuju alamat: **`http://localhost:8000`**

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

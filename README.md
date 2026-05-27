# ⛪ GKI Dashboard - Visualisasi & Analisis LKKJ

Aplikasi dashboard modern yang dirancang khusus untuk memvisualisasikan, menganalisis, dan mengekspor data **LKKJ (Laporan Keadaan dan Kegiatan Jemaat)** secara dinamis dari file spreadsheet Excel (Google Sheets). Dibuat dengan arsitektur modern berkinerja tinggi menggunakan **React + TypeScript + FastAPI**.

---

## 🚀 Fitur Utama

- **📊 Visualisasi Komprehensif & Interaktif**:
  Menampilkan grafik interaktif untuk berbagai aspek jemaat secara *real-time*:
  - **Executive Summary & Analisa**: Analisis pertumbuhan jemaat dan komitmen finansial.
  - **Kehadiran Kebaktian**: Kebaktian Minggu, Kebaktian Kategorial, Persekutuan, dan Perayaan.
  - **Persidangan & Rapat**: Statistik kehadiran peserta rapat majelis jemaat.
  - **Keuangan (UANG)**: Analisis komitmen persembahan, akumulasi penerimaan, dan perbandingan dengan tahun lalu.
  - **Demografi & Profil Jemaat (DIRI)**: Statistik berbasis usia, gender, etnis, tingkat pendidikan, dan profesi.
  - **Tenaga Pelayanan (TENAGA)**: Rasio penatua terhadap jemaat, rasio guru sekolah minggu terhadap anak, dan keaktifan aktivis.
  - **Mutasi Jemaat (Mutasi)**: Grafik alasan mutasi, pertambahan, pengurangan, dan rekapitulasi mutasi tahunan.

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

### Versi Terbaru (26 Mei 2026, 18:30 WIB)
- **Optimalisasi Arsitektur Rendering**: Penerapan sistem *Background-Cached Tab* yang menghilangkan jeda waktu perpindahan menu (perpindahan berjalan instan).
- **Pembersihan Kode (Clean Code)**: Refaktorisasi dan ekstraksi logika ekspor PDF & PPTX ke dalam *Global Utility* tunggal di `frontend/src/utils/exportUtils.ts`, memangkas 500+ baris duplikasi kode sehingga lebih mudah diaudit dan dipelihara.
- **Standarisasi Ekspor**: Penyeragaman format penamaan file ekspor PDF/PPTX secara otomatis menjadi `GKI_(Nama GKI)_(Bagian)` dan peningkatan ekspor PDF multi-halaman rapi per chart.

---

*Dikembangkan untuk efisiensi dan pelayanan di Gereja Kristen Indonesia (GKI).*

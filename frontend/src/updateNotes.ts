export const updateNotes = [
  {
    timestamp: '28 Mei 2026',
    changes: [
      'Perbaikan bug legenda tertukar (sinkronisasi 100% grafik dan legenda) untuk chart Konversi Pengunjung Baru.',
      'Refactor total fitur Perbandingan Penerimaan Kebaktian dan Luar Kebaktian dengan filter 1 bulan, 3 bulan, 1 tahun, serta perbandingan tahunan dan mode sisi akumulasi.',
      'Otomatisasi penuh pembaruan catatan rilis pasca-build oleh AI.',
      'Konsolidasi modul Missing Middle ke Kesenjangan Generasi dengan sinkronisasi urutan legenda.',
      'Penghapusan analisa Jemaat Musiman dan Giving Fatigue sesuai kebutuhan operasional.'
    ]
  },
  {
    timestamp: '26 Mei 2026, 18:30 WIB',
    changes: [
      'Optimalisasi arsitektur rendering: Penerapan sistem Background-Cached Tab yang menghilangkan lag dan *loading* saat berpindah menu (perpindahan instan).',
      'Refactoring & Kerapian Kode (Clean Code): Ekstraksi fitur Ekspor PDF dan PPTX menjadi Global Utility tunggal, membersihkan 500+ baris duplikasi kode di berbagai halaman.'
    ]
  },
  {
    timestamp: '26 Mei 2026, 18:00 WIB',
    changes: [
      'Penyeragaman format nama file hasil export PDF dan PPTX menjadi GKI_(Nama GKI)_(Bagian).',
      'Peningkatan fitur Export PDF untuk menghasilkan dokumen multi-halaman (setiap grafik/tabel dipisah per halaman).',
      'Penambahan tombol Export PDF dan PPTX pada halaman Executive Summary (Analisa).',
      'Pembaruan istilah pada Analisa Komitmen Finansial menjadi "Persembahan Kebaktian" & "Persembahan Luar Kebaktian".',
      'Pembaruan logika filter sumber data berdasarkan nomor urut indikator pada Analisa Komitmen Finansial.',
      'Perbaikan sumber data indikator (sheet Mutasi) pada Analisa Pertumbuhan Jemaat.'
    ]
  }
];

import json
import os

# 1. Update frontend/src/updateNotes.json
json_path = 'frontend/src/updateNotes.json'
with open(json_path, 'r', encoding='utf-8') as f:
    notes = json.load(f)

# The most recent notes might already be 28 Mei 2026, let's check
if notes[0]['timestamp'] == "28 Mei 2026":
    # Let's just append the new changes to the top of the list
    new_changes = [
        "Fitur Baru: Layar penuh (Fullscreen) untuk setiap grafik analisa, memungkinkan fokus penuh pada metrik tunggal.",
        "Perbaikan UI: Modul Perbandingan Rata-rata Kehadiran kini ditampilkan dalam tata letak khusus layar-penuh beserta tabel ringkasannya.",
        "Optimalisasi Export: Kompresi cerdas pada PDF/PPTX (beralih ke format JPEG) dan penurunan skala gambar untuk memangkas drastis ukuran file (turun >75%).",
        "Perbaikan Bug Export: Menghilangkan filter putih/pudar pada PDF akibat rendering background tembus pandang (glassmorphism).",
        "Perbaikan Analisa: Algoritma Total Penerimaan UANG kini mengunci kolom sinkronisasi antar-tahun berbasis presisi keberadaan data pada bulan terujung."
    ]
    # Insert at beginning of changes
    notes[0]['changes'] = new_changes + notes[0]['changes']
else:
    # Prepend a new entry
    notes.insert(0, {
        "timestamp": "28 Mei 2026",
        "changes": [
            "Fitur Baru: Layar penuh (Fullscreen) untuk setiap grafik analisa, memungkinkan fokus penuh pada metrik tunggal.",
            "Perbaikan UI: Modul Perbandingan Rata-rata Kehadiran kini ditampilkan dalam tata letak khusus layar-penuh beserta tabel ringkasannya.",
            "Optimalisasi Export: Kompresi cerdas pada PDF/PPTX (beralih ke format JPEG) dan penurunan skala gambar untuk memangkas drastis ukuran file (turun >75%).",
            "Perbaikan Bug Export: Menghilangkan filter putih/pudar pada PDF akibat rendering background tembus pandang (glassmorphism).",
            "Perbaikan Analisa: Algoritma Total Penerimaan UANG kini mengunci kolom sinkronisasi antar-tahun berbasis presisi keberadaan data pada bulan terujung."
        ]
    })

with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(notes, f, indent=2)

# 2. Add Catatan Rilis header to README.md if missing
readme_path = 'README.md'
with open(readme_path, 'r', encoding='utf-8') as f:
    readme_content = f.read()

header = '## 📝 Catatan Rilis & Riwayat Build Terbaru\n\n'
if header not in readme_content:
    readme_content += f'\n\n---\n\n{header}\n---\n'
    with open(readme_path, 'w', encoding='utf-8') as f:
        f.write(readme_content)

print("Patch applied successfully!")

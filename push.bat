@echo off
echo ==============================================
echo GKI Dashboard - Otomatisasi Git Push
echo ==============================================

cd /d "%~dp0"

echo Menambahkan berkas ke Git staging...
git add .

echo Melakukan commit secara otomatis...
git commit -m "Auto-update: %date% %time%" 2>nul

echo Mengirim data ke GitHub...
git push -u origin main

echo ==============================================
echo Proses otomatisasi selesai!
echo ==============================================
pause

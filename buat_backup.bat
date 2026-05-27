@echo off
echo ==============================================
echo Sistem Backup Otomatis GKI Dashboard
echo ==============================================

git add .
git commit -m "Backup Otomatis: %date% %time%"

echo.
echo Backup telah berhasil disimpan ke dalam sistem riwayat (Git).
echo Jika terjadi error di masa depan, Anda bisa kembali ke titik ini.
echo ==============================================
pause

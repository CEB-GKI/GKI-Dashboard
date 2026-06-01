@echo off
echo Mengupdate README.md dengan catatan rilis terbaru...
cd frontend
node scripts/sync-readme.cjs
cd ..

echo.
set "commit_msg="
set /p commit_msg="Masukkan pesan commit (kosongkan untuk pesan default): "
if "%commit_msg%"=="" set commit_msg=build: update project and update notes

echo.
echo Menambahkan file ke Git...
git add .

echo Melakukan commit...
git commit -m "%commit_msg%"

echo.
echo Melakukan push ke Github...
git push origin main

echo.
echo Selesai!
pause

const fs = require('fs');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("==============================================");
console.log(" GKI Dashboard - Build, Deploy, and Push Tool ");
console.log("==============================================");
console.log("");

rl.question("Apakah ini perubahan signifikan yang perlu dicatat di Update Notes (About & README)? (y/n) ", (answer) => {
  if (answer.toLowerCase() === 'y') {
    rl.question("Masukkan deskripsi perubahan (gunakan karakter ; untuk memisahkan beberapa poin): ", (desc) => {
      updateNotes(desc);
      buildAndPush(desc.replace(/;/g, ', '));
      rl.close();
    });
  } else {
    console.log("Perubahan tidak dicatat di Update Notes (Minor update).");
    buildAndPush("fix: minor updates and improvements");
    rl.close();
  }
});

function updateNotes(desc) {
  const points = desc.split(';').map(p => p.trim()).filter(p => p);
  const now = new Date();
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const dateStr = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;

  // 1. Update frontend/src/updateNotes.ts
  const notesPath = './frontend/src/updateNotes.ts';
  if (fs.existsSync(notesPath)) {
    let content = fs.readFileSync(notesPath, 'utf8');
    const pointsStr = points.map(p => `      '${p}'`).join(',\n');
    const newEntry = `  {
    timestamp: '${dateStr}',
    changes: [
${pointsStr}
    ]
  },\n`;
    
    if (content.includes('export const updateNotes = [\n')) {
        content = content.replace('export const updateNotes = [\n', 'export const updateNotes = [\n' + newEntry);
    } else {
        content = content.replace('export const updateNotes = [', 'export const updateNotes = [\n' + newEntry);
    }
    fs.writeFileSync(notesPath, content, 'utf8');
    console.log("-> updateNotes.ts berhasil diperbarui.");
  } else {
    console.log("-> File updateNotes.ts tidak ditemukan!");
  }

  // 2. Update README.md
  const readmePath = './README.md';
  if (fs.existsSync(readmePath)) {
    let content = fs.readFileSync(readmePath, 'utf8');
    const newReadmeEntry = `### Versi Terbaru (${dateStr})\n${points.map(p => `- ${p}`).join('\n')}\n\n`;
    
    if (content.includes("## 📝 Catatan Rilis & Riwayat Build Terbaru\n\n")) {
        content = content.replace("## 📝 Catatan Rilis & Riwayat Build Terbaru\n\n", "## 📝 Catatan Rilis & Riwayat Build Terbaru\n\n" + newReadmeEntry);
        fs.writeFileSync(readmePath, content, 'utf8');
        console.log("-> README.md berhasil diperbarui.");
    } else {
        console.log("-> Header Catatan Rilis di README.md tidak ditemukan!");
    }
  }
}

function buildAndPush(commitMsg) {
  try {
    console.log("\n[1/3] Membangun versi HTML production...");
    execSync('npm run build:html', { cwd: './frontend', stdio: 'inherit' });
    execSync('copy /Y frontend\\dist\\index.html GKI_Dashboard.html', { stdio: 'inherit' });

    console.log("\n[2/3] Menambahkan berkas ke Git staging...");
    execSync('git add .', { stdio: 'inherit' });
    
    console.log(`\n[3/3] Melakukan commit dan push ke GitHub...`);
    try {
      execSync(`git commit -m "update: ${commitMsg}"`, { stdio: 'inherit' });
    } catch (e) {
      console.log("Info: Tidak ada perubahan kode baru untuk di-commit.");
    }
    execSync('git push origin main', { stdio: 'inherit' });
    
    console.log("\n==============================================");
    console.log(" Deploy & Update Selesai!");
    console.log("==============================================");
  } catch (err) {
    console.error("\nTerjadi kesalahan saat proses build/deploy:", err.message);
  }
}

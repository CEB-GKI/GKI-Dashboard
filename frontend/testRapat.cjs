const XLSX = require('xlsx');

function safeFloat(val) {
  if (val === null || val === undefined || val === '') return 0.0;
  const num = parseFloat(val);
  return isNaN(num) ? 0.0 : num;
}

function parseRapat(sheetData) {
  const cleaned = [];
  for (let idx = 0; idx < sheetData.length; idx++) {
    const row = sheetData[idx] || [];
    let dateStr = '';
    
    if (typeof row[0] === 'number' && row[0] > 40000) {
      const date = new Date(Math.round((row[0] - 25569) * 86400 * 1000));
      dateStr = date.toISOString().split('T')[0];
    } else {
      const col0 = String(row[0] ?? '').trim();
      if (col0 && col0 !== "nan" && col0 !== "None") {
        if (col0.includes("202") || col0.includes("-")) {
          dateStr = col0.split(" ")[0];
        }
      }
    }

    if (dateStr) {
      const jam = String(row[1] || '').trim();
      if (!jam || jam.toLowerCase() === 'rata-rata') continue;
      
      const getVal = (i) => {
        if (i < row.length) return safeFloat(row[i]);
        return 0.0;
      };

      cleaned.push({
        Tanggal: dateStr,
        Jam: jam,
        "Jumlah Kehadiran Pria": getVal(7),
        "Jumlah Kehadiran Wanita": getVal(8),
        "Jumlah Kehadiran": getVal(9),
        "Jumlah Anggota": getVal(6)
      });
    }
  }
  return cleaned;
}

const wb = XLSX.readFile('test.xlsx');
const sheetData = XLSX.utils.sheet_to_json(wb.Sheets['RAPAT'], {header: 1});
const data = parseRapat(sheetData);
console.log('Parsed rows:', data.length);
console.log(data.slice(0, 3));

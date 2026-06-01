import { readFileSync } from 'fs';
import * as xlsx from 'xlsx';

function getVal(row, colIndex) {
  if (colIndex === null) return 0;
  const val = parseFloat(row[colIndex]);
  return isNaN(val) ? 0 : Math.ceil(val);
}

function parseYearlyData(sheetData, sheetName) {
  const yearly = [];
  const mapping = {
    'Keb. Kategorial': { yearIdx: 3, jamOffset: 2, total: 35 },
    'Pers. Kategorial': { yearIdx: 1, jamOffset: 1, total: 34 }
  };
  const cfg = mapping[sheetName];
  if (!cfg) return [];

  for (let i = sheetData.length - 1; i >= Math.max(0, sheetData.length - 150); i--) {
    const row = sheetData[i] || [];
    const yearStr = String(row[cfg.yearIdx] || '').trim();
    if (/^\d{4}\s*-\s*\d{4}$/.test(yearStr)) {
      let jamStr = 'Umum';
      if (cfg.jamOffset !== null) {
        jamStr = String(row[cfg.yearIdx + cfg.jamOffset] || '').trim();
        if (!jamStr || jamStr === '1' || jamStr.toLowerCase().includes('rata')) {
          jamStr = String(row[1] || row[0] || row[2] || '').trim();
        }
      }
      if (!jamStr || jamStr === '1' || jamStr.toLowerCase().includes('rata')) continue;

      yearly.unshift({
        Tanggal: yearStr,
        Jam: jamStr,
        "Total Kehadiran": getVal(row, cfg.total)
      });
    }
  }
  return yearly;
}

const wb = xlsx.readFile('LKKJ.xlsx');
const sheetKat = xlsx.utils.sheet_to_json(wb.Sheets['Keb. Kategorial'], { header: 1, defval: null });
console.log('Keb. Kategorial:');
console.dir(parseYearlyData(sheetKat, 'Keb. Kategorial'), { depth: null });

const sheetPers = xlsx.utils.sheet_to_json(wb.Sheets['Pers. Kategorial'], { header: 1, defval: null });
console.log('Pers. Kategorial:');
console.dir(parseYearlyData(sheetPers, 'Pers. Kategorial'), { depth: null });

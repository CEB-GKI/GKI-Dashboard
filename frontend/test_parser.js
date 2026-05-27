import { readFileSync } from 'fs';
import * as XLSX from 'xlsx';

function parseDiriData(sheetData) {
  const diriData = {
    usia_gender: [],
    etnis: [],
    pendidikan: [],
    profesi: [],
    massa: []
  };

  function safeInt(val) {
    if (val === undefined || val === null || val === '') return 0;
    const strVal = String(val).replace(/,/g, '');
    const num = parseInt(strVal, 10);
    return isNaN(num) ? 0 : num;
  }

  // Table 1: Usia & Gender (rows 8, 9, 10 are years, 0-indexed so 8 is index 8)
  for (let r = 8; r <= 10; r++) {
    const row = sheetData[r];
    if (!row || !row[0]) break;
    diriData.usia_gender.push({
      "Tahun": String(row[0]),
      "Anak < 4 P": safeInt(row[1])
    });
  }
  return diriData;
}

const buffer = readFileSync('../Form LKKJ v3.1 2025-2026.xlsx');
const workbook = XLSX.read(buffer, { type: 'buffer' });
const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets['DIRI'], { header: 1 });
console.log(JSON.stringify(parseDiriData(sheetData), null, 2));

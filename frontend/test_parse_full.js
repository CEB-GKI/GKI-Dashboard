import { readFileSync } from 'fs';
import * as XLSX from 'xlsx';

const FOCUS_SHEETS = [
  "Keb. Minggu",
  "Keb. Kategorial",
  "Pers. Kategorial",
  "Pers. Lainnya",
  "Perayaan",
  "DIRI",
  "RAPAT",
  "UANG"
];

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

  for (let r = 8; r <= 10; r++) {
    const row = sheetData[r];
    if (!row || !row[0]) break;
    diriData.usia_gender.push({ "Tahun": String(row[0]), "Anak < 4 P": safeInt(row[1]) });
  }
  return diriData;
}

const buffer = readFileSync('../Form LKKJ v3.1 2025-2026.xlsx');
const workbook = XLSX.read(buffer, { type: 'buffer' });
const parsedData = {};

for (const sheet of FOCUS_SHEETS) {
  if (workbook.SheetNames.includes(sheet)) {
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet], { header: 1 });
    if (sheet === "DIRI") {
      parsedData[sheet] = parseDiriData(sheetData);
    } else {
      parsedData[sheet] = []; // dummy
    }
  } else {
    parsedData[sheet] = [];
  }
}

console.log(JSON.stringify(parsedData['DIRI']));

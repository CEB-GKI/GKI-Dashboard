import * as XLSX from 'xlsx';

const FOCUS_SHEETS = [
  "Keb. Minggu",
  "Keb. Kategorial",
  "Pers. Kategorial",
  "Pers. Lainnya",
  "Perayaan",
  "RAPAT",
  "UANG",
  "DIRI",
  "TENAGA",
  "Mutasi"
];

function safeFloat(val: any): number {
  if (val === null || val === undefined || val === '') return 0.0;
  const num = parseFloat(val);
  return isNaN(num) ? 0.0 : num;
}

function parseKebaktian(sheetData: any[][], sheetType: string) {
  const cleaned: any[] = [];
  let currentDate = "Unknown Date";

  const mapping: Record<string, any> = {
    "Keb. Minggu": { anggota: 9, simpatisan: 12, gki_lain: 15, penatua: 18, gsm: null, pemusik: 21, multimedia: 24, subtotal: 27, onsite: 30, total: 33 },
    "Keb. Kategorial": { anggota: 8, simpatisan: 11, gki_lain: 14, penatua: 17, gsm: 20, pemusik: 23, multimedia: 26, subtotal: 29, onsite: 32, total: 35 },
    "Pers. Kategorial": { anggota: 7, simpatisan: 10, gki_lain: 13, penatua: 16, gsm: 19, pemusik: 22, multimedia: 25, subtotal: 28, onsite: 31, total: 34 },
    "Pers. Lainnya": { anggota: 5, simpatisan: 8, gki_lain: 11, penatua: 14, gsm: 17, pemusik: 20, multimedia: 23, subtotal: 26, onsite: 29, total: 32 },
    "Perayaan": { anggota: 9, simpatisan: 12, gki_lain: 15, penatua: 18, gsm: null, pemusik: 21, multimedia: 24, subtotal: 27, onsite: 30, total: 33 }
  };

  const cfg = mapping[sheetType] || mapping["Keb. Minggu"];

  for (let idx = 0; idx < sheetData.length; idx++) {
    const row = sheetData[idx] || [];
    const col0 = String(row[0] ?? '').trim();
    const col1 = String(row[1] ?? '').trim();

    if (col0.toLowerCase().includes("resume") || col1.toLowerCase().includes("resume")) break;
    if (col0.toLowerCase().includes("rata-rata") || col1.toLowerCase().includes("rata-rata") || col0.toLowerCase().includes("jumlah") || col1.toLowerCase().includes("jumlah")) continue;
    if (col1.toUpperCase() === "KU") continue;

    if (typeof row[0] === 'number' && row[0] > 40000) {
      const date = new Date(Math.round((row[0] - 25569) * 86400 * 1000));
      currentDate = date.toISOString().split('T')[0];
    } else {
      if (col0 && col0 !== "nan" && col0 !== "None") {
        if (sheetType === "Perayaan") {
          currentDate = col0;
        } else if (col0.includes("202") || col0.includes("-")) {
          currentDate = col0.split(" ")[0];
        }
      }
    }

    let processRow = false;
    if (sheetType === "Keb. Minggu") {
      if (col1.includes("KU") || ["1", "2", "3", "4", "5"].includes(col1) || col0.includes("Tahun Baru")) {
        processRow = true;
      }
    } else if (sheetType === "Perayaan") {
      if (col1 && col1 !== "nan" && col1 !== "None") processRow = true;
    } else {
      if (col1 && col1 !== "nan" && col1 !== "None") processRow = true;
    }

    if (processRow) {
      const jam = (col1 && col1 !== "nan") ? col1 : "Umum";
      const getVal = (i: number) => {
        if (i < row.length) return safeFloat(row[i]);
        return 0.0;
      };

      let total_hadir = getVal(cfg.total);
      if (total_hadir <= 0) total_hadir = getVal(cfg.onsite + 2);

      if (total_hadir > 0 || getVal(cfg.onsite + 2) > 0) {
        const record: any = {
          "Tanggal": currentDate,
          "Jam": jam,
          "Anggota Jemaat Pria": getVal(cfg.anggota),
          "Anggota Jemaat Wanita": getVal(cfg.anggota + 1),
          "Anggota Jemaat Jumlah": getVal(cfg.anggota + 2),
          
          "Simpatisan Pria": getVal(cfg.simpatisan),
          "Simpatisan Wanita": getVal(cfg.simpatisan + 1),
          "Simpatisan Jumlah": getVal(cfg.simpatisan + 2),
          
          "Anggota GKI Lain Pria": getVal(cfg.gki_lain),
          "Anggota GKI Lain Wanita": getVal(cfg.gki_lain + 1),
          "Anggota GKI Lain Jumlah": getVal(cfg.gki_lain + 2),
          
          "Penatua Pria": getVal(cfg.penatua),
          "Penatua Wanita": getVal(cfg.penatua + 1),
          "Penatua Jumlah": getVal(cfg.penatua + 2),
        };

        if (cfg.gsm !== null) {
          record["GSM Pria"] = getVal(cfg.gsm);
          record["GSM Wanita"] = getVal(cfg.gsm + 1);
          record["GSM Jumlah"] = getVal(cfg.gsm + 2);
        }

        Object.assign(record, {
          "Pemusik Gerejawi Pria": getVal(cfg.pemusik),
          "Pemusik Gerejawi Wanita": getVal(cfg.pemusik + 1),
          "Pemusik Gerejawi Jumlah": getVal(cfg.pemusik + 2),
          
          "Multi Media Pria": getVal(cfg.multimedia),
          "Multi Media Wanita": getVal(cfg.multimedia + 1),
          "Multi Media Jumlah": getVal(cfg.multimedia + 2),
          
          "Sub Total Anggota Pria": getVal(cfg.subtotal),
          "Sub Total Anggota Wanita": getVal(cfg.subtotal + 1),
          "Sub Total Anggota Jumlah": getVal(cfg.subtotal + 2),
          
          "Total On-site Pria": getVal(cfg.onsite),
          "Total On-site Wanita": getVal(cfg.onsite + 1),
          "Total On-site Jumlah": getVal(cfg.onsite + 2),
          
          "Total Kehadiran": total_hadir
        });

        cleaned.push(record);
      }
    }
  }
  return cleaned;
}

function parseRapat(sheetData: any[][]) {
  const daily: any[] = [];
  const yearly: any[] = [];
  let currentDate = "Unknown Date";
  let isResume = false;

  for (let idx = 0; idx < sheetData.length; idx++) {
    const row = sheetData[idx] || [];
    
    const col0Str = String(row[0] ?? '').trim().toLowerCase();
    const col1Str = String(row[1] ?? '').trim().toLowerCase();
    
    if (col0Str.includes('resume') || col1Str.includes('resume') || col0Str.includes('periode') || col1Str.includes('periode') || col0Str.includes('rekapitulasi') || col1Str.includes('rekapitulasi')) {
      isResume = true;
      continue;
    }
    
    if (!isResume) {
      if (typeof row[0] === 'number' && row[0] > 40000) {
        const date = new Date(Math.round((row[0] - 25569) * 86400 * 1000));
        currentDate = date.toISOString().split('T')[0];
      } else {
        const col0 = String(row[0] ?? '').trim();
        if (col0 && col0 !== "nan" && col0 !== "None") {
          if (col0.includes("202") || col0.includes("-")) {
            currentDate = col0.split(" ")[0];
          }
        }
      }
    } else {
      const col0 = String(row[0] ?? '').trim();
      const cLower = col0.toLowerCase();
      if (col0 && col0 !== "nan" && col0 !== "None" && !cLower.includes('resume') && !cLower.includes('tahun') && !cLower.includes('periode') && !cLower.includes('jumlah') && !cLower.includes('total') && !cLower.includes('rata') && !cLower.includes('rekapitulasi')) {
        currentDate = col0;
      }
    }

    if (currentDate !== "Unknown Date") {
      const jam = String(row[1] || '').trim();
      const jamLower = jam.toLowerCase();
      if (!jam || jamLower.includes('rata-rata') || jamLower.includes('jumlah') || jamLower.includes('diperiksa') || jamLower.includes('pnt.') || jamLower.includes('pic ') || jamLower.includes('jenis persidangan')) continue;
      if (isResume && (col0Str.includes('tahun') || col1Str.includes('tahun'))) continue;
      
      const getVal = (i: number) => {
        if (i < row.length) return safeFloat(row[i]);
        return 0.0;
      };

      const pria = getVal(7);
      const wanita = getVal(8);
      const total = getVal(9);
      const anggota = getVal(6);

      if (pria === 0 && wanita === 0 && total === 0 && anggota === 0) continue;

      const record = {
        Tanggal: currentDate,
        Jam: jam,
        "Jumlah Kehadiran Pria": pria,
        "Jumlah Kehadiran Wanita": wanita,
        "Jumlah Kehadiran": total,
        "Jumlah Anggota": anggota
      };

      if (isResume) {
        yearly.push(record);
      } else {
        daily.push(record);
      }
    }
  }
  return { daily, yearly };
}

function parseUang(sheetData: any[][]) {
  const cleaned: any[] = [];
  let currentDate = "Unknown Date";

  for (let idx = 0; idx < sheetData.length; idx++) {
    const row = sheetData[idx] || [];
    
    const jamRaw = String(row[1] || '').trim();
    const lowerJam = jamRaw.toLowerCase();

    let isDateRow = false;
    
    if (typeof row[8] === 'number' && row[8] > 40000 && row[8] < 50000 && (!jamRaw || lowerJam.includes('bulan'))) {
      const date = new Date(Math.round((row[8] - 25569) * 86400 * 1000));
      currentDate = date.toISOString().split('T')[0];
      isDateRow = true;
    } else {
      const col8 = String(row[8] ?? '').trim();
      if (col8 && col8 !== "nan" && col8 !== "None") {
        const col8Lower = col8.toLowerCase();
        const monthNames = ['jan', 'feb', 'mar', 'apr', 'mei', 'jun', 'jul', 'agu', 'sep', 'okt', 'nov', 'des'];
        const hasMonth = monthNames.some(m => col8Lower.includes(m));
        
        if (hasMonth && (col8.includes('202') || col8.includes('203')) && (!jamRaw || lowerJam.includes('bulan'))) {
          const monthIdx = monthNames.findIndex(m => col8Lower.includes(m));
          const yearMatch = col8.match(/20\d{2}/);
          if (yearMatch && monthIdx !== -1) {
            const yyyy = yearMatch[0];
            const mm = String(monthIdx + 1).padStart(2, '0');
            currentDate = `${yyyy}-${mm}-01`;
            isDateRow = true;
          }
        } else if (col8.match(/^\d{4}-\d{2}-\d{2}/) && !jamRaw) {
          currentDate = col8.split(" ")[0];
          isDateRow = true;
        }
      }
    }

    if (isDateRow) continue;

    if (currentDate !== "Unknown Date" && jamRaw) {
      if (lowerJam.includes('jumlah') || lowerJam.includes('total') || lowerJam.includes('subtotal') || lowerJam === 'jam' || lowerJam.includes('rata-rata') || lowerJam.includes('jenis persidangan') || lowerJam.includes('jenis penerimaan')) {
        continue;
      }
      
      const getVal = (i: number) => {
        if (i < row.length) return safeFloat(row[i]);
        return 0.0;
      };

      const accum = getVal(8);
      const curr = getVal(6);
      const prev = getVal(2);

      if (accum === 0 && curr === 0 && prev === 0) continue;

      const cleanJam = jamRaw.replace(/ \**$/, '').replace(/\*+$/, '').trim();

      cleaned.push({
        Tanggal: currentDate,
        "No": parseInt(row[0]) || 0,
        Jam: cleanJam,
        "Penerimaan": getVal(6),
        "Rata-rata Penerimaan": getVal(7),
        "Penerimaan (Tahun Lalu)": getVal(2),
        "Rata-rata Penerimaan (Tahun Lalu)": getVal(3),
        "Akumulasi (Tahun Lalu)": getVal(4),
        "Rata-rata Akumulasi (Tahun Lalu)": getVal(5),
        "Akumulasi": getVal(8),
        "Rata-rata Akumulasi": getVal(9)
      });
    }
  }
  return cleaned;
}

function cleanSheetData(sheetData: any[][], sheetName: string) {
  if (["Keb. Minggu", "Keb. Kategorial", "Pers. Kategorial", "Pers. Lainnya", "Perayaan"].includes(sheetName)) {
    return parseKebaktian(sheetData, sheetName);
  } else if (sheetName === 'RAPAT') {
    const { daily } = parseRapat(sheetData);
    return daily;
  } else if (sheetName.toUpperCase() === 'UANG') {
    return parseUang(sheetData);
  }
  return [];
}

function parseYearlyData(sheetData: any[][], sheetName: string) {
  const yearly: any[] = [];
  const mapping: Record<string, any> = {
    'Keb. Minggu': { yearIdx: 6, jamOffset: null, anggota: 9, simpatisan: 12, gki_lain: 15, penatua: 18, gsm: null, pemusik: 21, multimedia: 24, subtotal: 27, onsite: 30, total: 33 },
    'Keb. Kategorial': { yearIdx: 3, jamOffset: 2, anggota: 8, simpatisan: 11, gki_lain: 14, penatua: 17, gsm: 20, pemusik: 23, multimedia: 26, subtotal: 29, onsite: 32, total: 35 },
    'Pers. Kategorial': { yearIdx: 1, jamOffset: 1, anggota: 7, simpatisan: 10, gki_lain: 13, penatua: 16, gsm: 19, pemusik: 22, multimedia: 25, subtotal: 28, onsite: 31, total: 34 },
    'Pers. Lainnya': { yearIdx: 1, jamOffset: 1, anggota: 5, simpatisan: 8, gki_lain: 11, penatua: 14, gsm: 17, pemusik: 20, multimedia: 23, subtotal: 26, onsite: 29, total: 32 },
    'Perayaan': { yearIdx: 4, jamOffset: 2, anggota: 9, simpatisan: 12, gki_lain: 15, penatua: 18, gsm: null, pemusik: 21, multimedia: 24, subtotal: 27, onsite: 30, total: 33 }
  };

  const cfg = mapping[sheetName];
  if (!cfg) return [];

  const getVal = (row: any[], colIndex: number | null) => {
    if (colIndex === null) return 0;
    const val = parseFloat(row[colIndex]);
    return isNaN(val) ? 0 : Math.ceil(val);
  };

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

      const record: Record<string, any> = {
        Tanggal: yearStr, // We map Tahun to Tanggal for standard processing
        Jam: jamStr,
        
        "Anggota Jemaat Pria": getVal(row, cfg.anggota),
        "Anggota Jemaat Wanita": getVal(row, cfg.anggota + 1),
        "Anggota Jemaat Jumlah": getVal(row, cfg.anggota + 2),
        
        "Simpatisan Pria": getVal(row, cfg.simpatisan),
        "Simpatisan Wanita": getVal(row, cfg.simpatisan + 1),
        "Simpatisan Jumlah": getVal(row, cfg.simpatisan + 2),
        
        "Anggota GKI Lain Pria": getVal(row, cfg.gki_lain),
        "Anggota GKI Lain Wanita": getVal(row, cfg.gki_lain + 1),
        "Anggota GKI Lain Jumlah": getVal(row, cfg.gki_lain + 2),
        
        "Penatua Pria": getVal(row, cfg.penatua),
        "Penatua Wanita": getVal(row, cfg.penatua + 1),
        "Penatua Jumlah": getVal(row, cfg.penatua + 2),
      };

      if (cfg.gsm !== null) {
        record["GSM Pria"] = getVal(row, cfg.gsm);
        record["GSM Wanita"] = getVal(row, cfg.gsm + 1);
        record["GSM Jumlah"] = getVal(row, cfg.gsm + 2);
      }

      Object.assign(record, {
        "Pemusik Gerejawi Pria": getVal(row, cfg.pemusik),
        "Pemusik Gerejawi Wanita": getVal(row, cfg.pemusik + 1),
        "Pemusik Gerejawi Jumlah": getVal(row, cfg.pemusik + 2),
        
        "Multi Media Pria": getVal(row, cfg.multimedia),
        "Multi Media Wanita": getVal(row, cfg.multimedia + 1),
        "Multi Media Jumlah": getVal(row, cfg.multimedia + 2),
        
        "Sub Total Anggota Pria": getVal(row, cfg.subtotal),
        "Sub Total Anggota Wanita": getVal(row, cfg.subtotal + 1),
        "Sub Total Anggota Jumlah": getVal(row, cfg.subtotal + 2),
        
        "Total On-site Pria": getVal(row, cfg.onsite),
        "Total On-site Wanita": getVal(row, cfg.onsite + 1),
        "Total On-site Jumlah": getVal(row, cfg.onsite + 2),
        
        "Total Kehadiran": getVal(row, cfg.total)
      });
      
      yearly.unshift(record);
    }
  }
  return yearly;
}

function parseDiriData(sheetData: any[][]) {
  const diriData: any = {
    usia_gender: [],
    etnis: [],
    pendidikan: [],
    profesi: [],
    massa: []
  };

  function safeInt(val: any): number {
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
      "Anak < 4 P": safeInt(row[1]), "Anak < 4 W": safeInt(row[2]),
      "Anak 4-8 P": safeInt(row[3]), "Anak 4-8 W": safeInt(row[4]),
      "Anak 9-12 P": safeInt(row[5]), "Anak 9-12 W": safeInt(row[6]),
      "Anak 13-15 P": safeInt(row[7]), "Anak 13-15 W": safeInt(row[8]),
      "Anak > 15 P": safeInt(row[9]), "Anak > 15 W": safeInt(row[10]),
      "Dewasa < 16 P": safeInt(row[14]), "Dewasa < 16 W": safeInt(row[15]),
      "Dewasa 16-19 P": safeInt(row[16]), "Dewasa 16-19 W": safeInt(row[17]),
      "Dewasa 20-30 P": safeInt(row[18]), "Dewasa 20-30 W": safeInt(row[19]),
      "Dewasa 31-39 P": safeInt(row[20]), "Dewasa 31-39 W": safeInt(row[21]),
      "Dewasa 40-59 P": safeInt(row[22]), "Dewasa 40-59 W": safeInt(row[23]),
      "Dewasa >= 60 P": safeInt(row[24]), "Dewasa >= 60 W": safeInt(row[25]),
      "Jml_Anak": safeInt(row[14]),
      "Jml_Dewasa": safeInt(row[28]),
      "Total": safeInt(row[29])
    });
  }

  // Table 2: Etnis
  for (let r = 15; r <= 17; r++) {
    const row = sheetData[r];
    if (!row || !row[0]) break;
    diriData.etnis.push({
      "Tahun": String(row[0]),
      "Tionghoa": safeInt(row[4]), "Sunda": safeInt(row[6]),
      "Batak": safeInt(row[8]), "Jawa": safeInt(row[10]), "Ambon": safeInt(row[12]),
      "Minahasa": safeInt(row[14]), "Nias": safeInt(row[16]), "Dayak": safeInt(row[18]),
      "Toraja": safeInt(row[20]), "Timor": safeInt(row[22]), "Papua": safeInt(row[24]),
      "Lain-lain": safeInt(row[26]),
      "Total": safeInt(row[28])
    });
  }

  // Table 3: Pendidikan
  for (let r = 23; r <= 25; r++) {
    const row = sheetData[r];
    if (!row || !row[0]) break;
    diriData.pendidikan.push({
      "Tahun": String(row[0]),
      "Tidak Tamat SD": safeInt(row[4]), "SD": safeInt(row[6]),
      "SMP": safeInt(row[8]), "SMA": safeInt(row[10]), "Kejuruan": safeInt(row[12]),
      "D-1": safeInt(row[14]), "D-2": safeInt(row[16]), "D-3": safeInt(row[18]),
      "D-4/S-1": safeInt(row[20]), "S-2": safeInt(row[22]), "S-3": safeInt(row[24]),
      "Lain-lain": safeInt(row[26]),
      "Total": safeInt(row[28])
    });
  }

  // Table 4: Profesi
  for (let r = 31; r <= 33; r++) {
    const row = sheetData[r];
    if (!row || !row[0]) break;
    diriData.profesi.push({
      "Tahun": String(row[0]),
      "Wirausaha": safeInt(row[4]), "Pegawai Swasta": safeInt(row[6]),
      "Pegawai Negeri": safeInt(row[8]), "Profesional": safeInt(row[10]), "Pensiunan": safeInt(row[12]),
      "Ibu Rumah Tangga": safeInt(row[14]), "Pelajar/Mahasiswa": safeInt(row[17]),
      "Petani/Peternak": safeInt(row[20]), "Lain-lain": safeInt(row[22]),
      "Total": safeInt(row[24])
    });
  }

  // Table 5: Massa
  for (let r = 39; r <= 41; r++) {
    const row = sheetData[r];
    if (!row || !row[0]) break;
    diriData.massa.push({
      "Tahun": String(row[0]),
      "Anak (0-12)": safeInt(row[1]), "Pra Remaja (13-15)": safeInt(row[4]),
      "Remaja (16-19)": safeInt(row[7]), "Pemuda (20-30)": safeInt(row[10]),
      "Dewasa Muda (31-39)": safeInt(row[13]), "Dewasa (40-59)": safeInt(row[16]),
      "Senior (>60)": safeInt(row[19]),
      "Total": safeInt(row[22])
    });
  }

  return diriData;
}

function parseTenagaData(sheetData: any[][]) {
  function safeInt(val: any): number {
    if (val === undefined || val === null || val === '') return 0;
    const strVal = String(val).replace(/,/g, '');
    const num = parseInt(strVal, 10);
    return isNaN(num) ? 0 : num;
  }

  const tenagaData = {
    ratio_penatua: [] as any[],
    ratio_gsm: [] as any[],
    rekap_aktivis: [] as any[]
  };

  for (let r = 11; r <= 13; r++) {
    const row = sheetData[r];
    if (!row || !row[0]) break;
    tenagaData.ratio_penatua.push({
      "Tahun": String(row[0]),
      "Total Jemaat": safeInt(row[1]),
      "Penatua P": safeInt(row[2]), "Penatua W": safeInt(row[3]),
      "Pengurus P": safeInt(row[4]), "Pengurus W": safeInt(row[5]),
      "GSM P": safeInt(row[6]), "GSM W": safeInt(row[7]),
      "Pemusik P": safeInt(row[8]), "Pemusik W": safeInt(row[9]),
      "Teologia P": safeInt(row[10]), "Teologia W": safeInt(row[11])
    });
  }

  for (let r = 18; r <= 20; r++) {
    const row = sheetData[r];
    if (!row || !row[0]) break;
    tenagaData.ratio_gsm.push({
      "Tahun": String(row[0]),
      "Anak SM": safeInt(row[1]),
      "Guru SM": safeInt(row[5]),
      "Ratio": safeFloat(row[9])
    });
  }

  for (let r = 25; r <= 27; r++) {
    const row = sheetData[r];
    if (!row || !row[0]) break;
    tenagaData.rekap_aktivis.push({
      "Tahun": String(row[0]),
      "Total Jemaat": safeInt(row[1]),
      "Aktivis": safeInt(row[5]),
      "Pengurus": safeInt(row[7]),
      "Ratio": safeFloat(row[9])
    });
  }

  return tenagaData;
}

export function parseMutasiData(sheetData: any[][]) {
  const mutasiData = {
    years: [
      String(sheetData[6]?.[1] || "2023 - 2024"),
      String(sheetData[6]?.[2] || "2024 - 2025"),
      String(sheetData[6]?.[3] || "2025 - 2026")
    ],
    alasan_mutasi: [] as any[],
    pertambahan: [] as any[],
    pengurangan: [] as any[],
    hasil: [] as any[],
    keterangan: [] as any[]
  };

  const safeIntMutasi = (val: any) => {
    try {
      let strVal = String(val).replace(/,/g, '').trim();
      let isNegative = false;
      if (strVal.startsWith('(') && strVal.endsWith(')')) {
        isNegative = true;
        strVal = strVal.slice(1, -1);
      } else if (strVal.startsWith('-')) {
        isNegative = true;
        strVal = strVal.slice(1);
      }
      const num = parseInt(strVal, 10);
      if (isNaN(num)) return 0;
      return isNegative ? -num : num;
    } catch {
      return 0;
    }
  };

  for (let r = 9; r <= 17; r++) {
    const row = sheetData[r];
    if (row && row[0]) {
      mutasiData.alasan_mutasi.push({
        "Kategori": String(row[0]),
        [mutasiData.years[0]]: safeIntMutasi(row[1]),
        [mutasiData.years[1]]: safeIntMutasi(row[2]),
        [mutasiData.years[2]]: safeIntMutasi(row[3])
      });
    }
  }

  for (let r = 20; r <= 29; r++) {
    const row = sheetData[r];
    if (row && row[0]) {
      mutasiData.pertambahan.push({
        "Kategori": String(row[0]),
        [mutasiData.years[0]]: safeIntMutasi(row[1]),
        [mutasiData.years[1]]: safeIntMutasi(row[2]),
        [mutasiData.years[2]]: safeIntMutasi(row[3])
      });
    }
  }

  for (let r = 32; r <= 41; r++) {
    const row = sheetData[r];
    if (row && row[0]) {
      mutasiData.pengurangan.push({
        "Kategori": String(row[0]),
        [mutasiData.years[0]]: safeIntMutasi(row[1]),
        [mutasiData.years[1]]: safeIntMutasi(row[2]),
        [mutasiData.years[2]]: safeIntMutasi(row[3])
      });
    }
  }

  for (let r = 45; r <= 52; r++) {
    const row = sheetData[r];
    if (row && row[0]) {
      mutasiData.hasil.push({
        "Kategori": String(row[0]),
        [mutasiData.years[0]]: safeIntMutasi(row[1]),
        [mutasiData.years[1]]: safeIntMutasi(row[2]),
        [mutasiData.years[2]]: safeIntMutasi(row[3])
      });
    }
  }

  for (let r = 7; r <= 53; r++) {
    const row = sheetData[r];
    if (row) {
      const k = row[4];
      const v = row[5];
      const kStr = (k === undefined || k === null) ? "" : String(k).trim();
      const vStr = (v === undefined || v === null) ? "" : String(v).trim();
      
      if (kStr || vStr) {
        if (kStr === "" && mutasiData.keterangan.length > 0) {
          mutasiData.keterangan[mutasiData.keterangan.length - 1].value += " " + vStr;
        } else {
          mutasiData.keterangan.push({ key: kStr, value: vStr });
        }
      }
    }
  }

  return mutasiData;
}

export async function parseGoogleSheet(buffer: ArrayBuffer) {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const parsedData: Record<string, any> = {};
  const yearlyData: Record<string, any> = {};
  let churchName = "Waha";

  if (workbook.SheetNames.includes("ISIAN")) {
    try {
      const isianSheet = XLSX.utils.sheet_to_json<any[]>(workbook.Sheets["ISIAN"], { header: 1 });
      if (isianSheet.length > 2 && isianSheet[2].length > 3) {
        const val = String(isianSheet[2][3] || '').trim();
        if (val && val !== "nan" && val !== "None") {
          churchName = val;
        }
      }
    } catch (e) {
      console.error("Failed to read ISIAN D3", e);
    }
  }

  for (const sheet of FOCUS_SHEETS) {
    if (workbook.SheetNames.includes(sheet)) {
      const sheetData = XLSX.utils.sheet_to_json<any[]>(workbook.Sheets[sheet], { header: 1 });
      if (sheet === "DIRI") {
        parsedData[sheet] = parseDiriData(sheetData);
        yearlyData[sheet] = [];
      } else if (sheet === "TENAGA") {
        parsedData[sheet] = parseTenagaData(sheetData);
        yearlyData[sheet] = [];
      } else if (sheet === "Mutasi") {
        parsedData[sheet] = parseMutasiData(sheetData);
        yearlyData[sheet] = [];
      } else if (sheet === "RAPAT") {
        const { daily, yearly } = parseRapat(sheetData);
        parsedData[sheet] = daily;
        yearlyData[sheet] = yearly || [];
      } else {
        parsedData[sheet] = cleanSheetData(sheetData, sheet);
        yearlyData[sheet] = parseYearlyData(sheetData, sheet);
      }
    } else {
      parsedData[sheet] = [];
      yearlyData[sheet] = [];
    }
  }

  return {
    data: parsedData,
    yearlyData: yearlyData,
    churchName
  };
}

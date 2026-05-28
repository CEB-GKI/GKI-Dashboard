import re

# 1. Modify parser.ts
parser_file = 'frontend/src/parser.ts'
with open(parser_file, 'r', encoding='utf-8') as f:
    content = f.read()

old_parser = "if (lowerJam.includes('jumlah') || lowerJam.includes('total') || lowerJam.includes('subtotal') || lowerJam === 'jam' || lowerJam.includes('rata-rata') || lowerJam.includes('jenis persidangan') || lowerJam.includes('jenis penerimaan')) {\n        continue;\n      }"

new_parser = """if (lowerJam.includes('jumlah') || lowerJam.includes('subtotal') || lowerJam === 'jam' || lowerJam.includes('rata-rata') || lowerJam.includes('jenis persidangan') || lowerJam.includes('jenis penerimaan')) {
        continue;
      }
      if (lowerJam.includes('total') && !lowerJam.includes('total penerimaan')) {
        continue;
      }"""

content = content.replace(old_parser, new_parser)

with open(parser_file, 'w', encoding='utf-8') as f:
    f.write(content)

# 2. Modify AnalisaDashboard.tsx
dashboard_file = 'frontend/src/components/AnalisaDashboard.tsx'
with open(dashboard_file, 'r', encoding='utf-8') as f:
    content = f.read()

old_dashboard = """    // 2. Total Penerimaan (UANG)
    // Berdasarkan "akumulasi terakhir keuangan (kolom E dan I)"
    // Di parser.ts, "Akumulasi (Tahun Lalu)" adalah col E, "Akumulasi" adalah col I
    let uangCurr = 0;
    let uangPrev = 0;
    
    if (data['UANG'] && data['UANG'].length > 0) {
      // Cari tahun terbaru dari data UANG
      const yearsSet = new Set<number>();
      data['UANG'].forEach((r: any) => {
        const y = parseInt(String(r.Tanggal).split('-')[0]);
        if (!isNaN(y)) yearsSet.add(y);
      });
      const maxYear = Math.max(...Array.from(yearsSet));
      
      // Ambil akumulasi terakhir dari baris Total Penerimaan (biasanya No = 14)
      const lastMonthRecords = data['UANG'].filter((r: any) => parseInt(String(r.Tanggal).split('-')[0]) === maxYear);
      // Urutkan berdasarkan tanggal (asc), ambil tanggal terakhir
      lastMonthRecords.sort((a: any, b: any) => new Date(a.Tanggal).getTime() - new Date(b.Tanggal).getTime());
      
      if (lastMonthRecords.length > 0) {
        const lastDate = lastMonthRecords[lastMonthRecords.length - 1].Tanggal;
        // Cari row "TOTAL PENERIMAAN" di tanggal terakhir itu
        const totalRows = lastMonthRecords.filter((r: any) => r.Tanggal === lastDate && String(r.Jam).toLowerCase().includes('total'));
        if (totalRows.length > 0) {
          uangCurr = totalRows[totalRows.length - 1]['Akumulasi'] || 0;
          uangPrev = totalRows[totalRows.length - 1]['Akumulasi (Tahun Lalu)'] || 0;
        } else {
          // Jika tidak ada row total, cari row terakhir saja
          uangCurr = lastMonthRecords[lastMonthRecords.length - 1]['Akumulasi'] || 0;
          uangPrev = lastMonthRecords[lastMonthRecords.length - 1]['Akumulasi (Tahun Lalu)'] || 0;
        }
      }
    }"""

new_dashboard = """    // 2. Total Penerimaan (UANG)
    let uangCurr = 0;
    let uangPrev = 0;
    
    if (data['UANG'] && data['UANG'].length > 0) {
      const yearsSet = new Set<number>();
      data['UANG'].forEach((r: any) => {
        const y = parseInt(String(r.Tanggal).split('-')[0]);
        if (!isNaN(y)) yearsSet.add(y);
      });
      const maxYear = Math.max(...Array.from(yearsSet));
      
      const currentYearRecords = data['UANG'].filter((r: any) => parseInt(String(r.Tanggal).split('-')[0]) === maxYear);
      const totalRows = currentYearRecords.filter((r: any) => String(r.Jam).toLowerCase().includes('total penerimaan'));
      
      totalRows.sort((a: any, b: any) => new Date(a.Tanggal).getTime() - new Date(b.Tanggal).getTime());
      
      let lastValidRow = null;
      for (let i = totalRows.length - 1; i >= 0; i--) {
        if (totalRows[i]['Akumulasi'] > 0) {
          lastValidRow = totalRows[i];
          break;
        }
      }

      if (lastValidRow) {
        uangCurr = lastValidRow['Akumulasi'] || 0;
        uangPrev = lastValidRow['Akumulasi (Tahun Lalu)'] || 0;
      }
    }"""

content = content.replace(old_dashboard, new_dashboard)

with open(dashboard_file, 'w', encoding='utf-8') as f:
    f.write(content)

print("Modification done!")

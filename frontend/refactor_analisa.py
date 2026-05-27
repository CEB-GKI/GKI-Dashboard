import re
import sys

FILE_PATH = r"C:\Users\Chris\Apps\GKI_Waha_Dashboard\On Progress\frontend\src\components\AnalisaDashboard.tsx"

with open(FILE_PATH, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update Analisa3
analisa3_new = """  const analisa3 = useMemo(() => {
    const title = 'Kesenjangan Generasi & Missing Middle';
    const diriMassa = data['DIRI']?.massa || [];

    const chartData = diriMassa.map((d: any) => {
      const pemuda = d['Pemuda (20-30)'] || 0;
      const dm = d['Dewasa Muda (31-39)'] || 0;
      const lansia = d['Senior (>60)'] || 0;
      return { sources: ['Data DIRI (Usia)'],
        name: d.Tahun,
        Pemuda: pemuda,
        DewasaMuda: dm,
        Lansia: lansia
       };
    });

    const hasData = chartData.some((d: any) => d.Pemuda > 0 || d.Lansia > 0 || d.DewasaMuda > 0);
    
    let isWarning = false;
    let ratioPemuda = 0;
    let growthDM = 0;
    let warningReason = '';

    if (chartData.length > 0) {
      const last = chartData[chartData.length - 1];
      if (last.Lansia > 0) {
        ratioPemuda = last.Pemuda / last.Lansia;
      }
      
      if (chartData.length >= 3) {
        const prev3 = chartData[chartData.length - 3];
        growthDM = prev3.DewasaMuda > 0 ? ((last.DewasaMuda - prev3.DewasaMuda) / prev3.DewasaMuda) * 100 : 0;
      } else if (chartData.length >= 2) {
        const prev2 = chartData[chartData.length - 2];
        growthDM = prev2.DewasaMuda > 0 ? ((last.DewasaMuda - prev2.DewasaMuda) / prev2.DewasaMuda) * 100 : 0;
      }

      if (ratioPemuda > 0 && ratioPemuda < 0.5) {
        isWarning = true;
        warningReason = `Populasi Lansia secara tidak seimbang mendominasi populasi Pemuda (Rasio < 0.5). Gereja mengalami 'aging population'.`;
      }
      
      if (growthDM < -10) {
        isWarning = true;
        const addMsg = `Terdapat penyusutan signifikan pada demografi keluarga muda usia 31-39 sebesar ${growthDM.toFixed(1)}% (fenomena 'the missing middle'). Gereja disarankan melakukan survei jemaat terkait relevansi pelayanan.`;
        warningReason = warningReason ? warningReason + " " + addMsg : addMsg;
      }
    }

    const table = (
      <table className="data-table">
        <thead>
          <tr><th>Tahun</th><th>Pemuda (20-30)</th><th>Keluarga Muda (31-39)</th><th>Lansia (&gt;60)</th></tr>
        </thead>
        <tbody>
          {chartData.map((row: any, i: number) => (
            <tr key={i}><td>{row.name}</td><td>{row.Pemuda}</td><td>{row.DewasaMuda}</td><td>{row.Lansia}</td></tr>
          ))}
        </tbody>
      </table>
    );

    const chart = (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
          <YAxis stroke="rgba(255,255,255,0.5)" />
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
          <Legend />
          <Bar dataKey="Pemuda" fill={COLORS.blue} radius={[4, 4, 0, 0]} name="Pemuda (20-30)" />
          <Bar dataKey="DewasaMuda" fill={COLORS.teal} radius={[4, 4, 0, 0]} name="Keluarga Muda (31-39)" />
          <Bar dataKey="Lansia" fill={COLORS.purple} radius={[4, 4, 0, 0]} name="Lansia (>60)" />
        </BarChart>
      </ResponsiveContainer>
    );

    const description = "Memantau kelangsungan regenerasi gereja dengan membandingkan kelompok usia Pemuda, Keluarga Muda, dan Lansia dari data DIRI.";
    const dynamicText = chartData.length > 0 
      ? `Rasio Pemuda terhadap Lansia adalah ${ratioPemuda.toFixed(2)}, dan pertumbuhan Keluarga Muda tercatat ${growthDM.toFixed(1)}%.`
      : `Menghitung data demografi...`;
      
    const alertText = isWarning ? warningReason : null;

    return { sources: ['Data DIRI (Usia)'], 
      isHidden: !hasData, 
      title, 
      icon: <Users color={COLORS.purple} />, 
      description, 
      dynamicText, 
      chart, 
      table, 
      alertText, 
      status: isWarning ? 'warning' : 'neutral' 
    };
  }, [data]);"""

content = re.sub(r"  const analisa3 = useMemo\(\(\) => \{.*?(?=  const analisa4 = useMemo)", analisa3_new + "\n\n", content, flags=re.DOTALL)


# 2. Update Analisa15
analisa15_new = """  const analisa15 = useMemo(() => {
    const title = 'Risiko Konsentrasi Beban Finansial (Giving Fatigue)';
    const uangData = data['UANG'] || [];
    const kebMinggu = yearlyData['Keb. Minggu'] || [];
    
    const chartDataMap: Record<string, any> = {};
    for (const row of uangData) {
      const yearStr = String(row.Tanggal).substring(0, 4);
      if (!yearStr.match(/20\\d{2}/)) continue;
      if (!chartDataMap[yearStr]) chartDataMap[yearStr] = { name: yearStr, Uang: 0, Kehadiran: 0 };
      
      if (row.No >= 1 && row.No <= 8) {
        chartDataMap[yearStr].Uang += (row.Penerimaan || row.Akumulasi || 0);
      }
    }
    
    for (const km of kebMinggu) {
      const y = km.Tanggal;
      if (chartDataMap[y]) {
        chartDataMap[y].Kehadiran = km['Total Kehadiran'] || 0;
      } else {
        chartDataMap[y] = { name: y, Uang: 0, Kehadiran: km['Total Kehadiran'] || 0 };
      }
    }
    
    const chartData = Object.values(chartDataMap).sort((a: any, b: any) => a.name.localeCompare(b.name));
    const hasData = chartData.some((d: any) => d.Uang > 0 && d.Kehadiran > 0);

    let isWarning = false;
    let uangGrowth = 0;
    let hadirGrowth = 0;
    
    if (chartData.length >= 2) {
      const last = chartData[chartData.length - 1];
      const prev = chartData[chartData.length - 2];
      uangGrowth = prev.Uang > 0 ? ((last.Uang - prev.Uang) / prev.Uang) * 100 : 0;
      hadirGrowth = prev.Kehadiran > 0 ? ((last.Kehadiran - prev.Kehadiran) / prev.Kehadiran) * 100 : 0;
      
      // Jika tren kehadiran menurun secara konsisten
      let consistentDrop = false;
      if (chartData.length >= 3) {
         const prev2 = chartData[chartData.length - 3];
         const hadirGrowthPrev = prev2.Kehadiran > 0 ? ((prev.Kehadiran - prev2.Kehadiran) / prev2.Kehadiran) * 100 : 0;
         if (hadirGrowth < -10 && hadirGrowthPrev < -10) consistentDrop = true;
         // Atau drop total 3 tahun > 15%
         const totalHadirDrop = prev2.Kehadiran > 0 ? ((last.Kehadiran - prev2.Kehadiran) / prev2.Kehadiran) * 100 : 0;
         if (totalHadirDrop < -15) consistentDrop = true;
      } else {
         if (hadirGrowth < -15) consistentDrop = true;
      }
      
      // Keuangan stabil atau naik (>= -5%) sementara kehadiran consistently drop tajam
      if (uangGrowth >= -5 && consistentDrop) {
        isWarning = true;
      }
    }

    const table = (
      <table className="data-table">
        <thead>
          <tr><th>Tahun</th><th>Total Persembahan (Rp)</th><th>Rata-rata Kehadiran</th></tr>
        </thead>
        <tbody>
          {chartData.map((row: any, i: number) => (
            <tr key={i}><td>{row.name}</td><td>Rp {row.Uang.toLocaleString('id-ID')}</td><td>{row.Kehadiran}</td></tr>
          ))}
        </tbody>
      </table>
    );

    const chart = (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
          <YAxis yAxisId="left" stroke="rgba(255,255,255,0.5)" tickFormatter={(val: any) => `${(val / 1000000).toLocaleString('id-ID')} Jt`} width={80} />
          <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.5)" />
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="Uang" name="Total Persembahan" stroke={COLORS.green} strokeWidth={3} />
          <Line yAxisId="right" type="monotone" dataKey="Kehadiran" name="Kehadiran Jemaat" stroke={COLORS.orange} strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    );

    const description = "Mematahkan asumsi bahwa keuangan gereja sehat = jemaat sehat. Mendeteksi apakah stabilitas keuangan ditopang oleh segelintir orang yang semakin terbebani, sementara banyak jemaat mundur.";
    const dynamicText = chartData.length >= 2 
      ? `Persembahan terpantau berubah ${uangGrowth.toFixed(1)}%, dan kehadiran ibadah berubah ${hadirGrowth.toFixed(1)}%.`
      : `Menghitung korelasi finansial...`;
      
    const alertText = isWarning
      ? "Stabilitas kas gereja yang terjadi di tengah penurunan tajam kehadiran fisik mengindikasikan bahwa beban finansial saat ini dipikul oleh semakin sedikit jemaat. Secara pastoral, ini adalah kondisi rentan. Majelis perlu memisahkan indikator 'kesehatan finansial' dari 'kesehatan persekutuan', dan segera merancang strategi pemulihan relasi terhadap anggota jemaat yang menghilang dari ibadah."
      : null;

    return { sources: ['UANG', 'Keb. Minggu'], isHidden: !hasData, title, icon: <AlertTriangle color={COLORS.orange} />, description, dynamicText, chart, table, alertText, status: isWarning ? 'warning' : 'good' };
  }, [data, yearlyData]);"""

content = re.sub(r"  const analisa15 = useMemo\(\(\) => \{.*?(?=  const analisa16 = useMemo)", analisa15_new + "\n\n", content, flags=re.DOTALL)

# Delete analisa14, analisa16, analisa17
content = re.sub(r"  const analisa14 = useMemo\(\(\) => \{.*?(?=  const analisa15 = useMemo)", "", content, flags=re.DOTALL)

# Because 14 is gone, 15 is directly followed by 16.
content = re.sub(r"  const analisa16 = useMemo\(\(\) => \{.*?(?=  const analisa18 = useMemo)", "", content, flags=re.DOTALL)

# Delete analisa17 manually if it wasn't caught
content = re.sub(r"  const analisa17 = useMemo\(\(\) => \{.*?(?=  const analisa18 = useMemo)", "", content, flags=re.DOTALL)


# Fix the allModules array to remove 14, 16, 17
content = content.replace("const allModules = [analisa2, analisa3, analisa4, analisa6, analisa7, analisa8, analisa10, analisa12, analisa13, analisa14, analisa15, analisa16, analisa17, analisa18]", "const allModules = [analisa2, analisa3, analisa4, analisa6, analisa7, analisa8, analisa10, analisa12, analisa13, analisa15, analisa18]")

with open(FILE_PATH, "w", encoding="utf-8") as f:
    f.write(content)
print("Refactoring done.")

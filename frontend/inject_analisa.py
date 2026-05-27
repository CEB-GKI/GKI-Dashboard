import os
import re

FILE_PATH = r"C:\Users\Chris\Apps\GKI_Waha_Dashboard\On Progress\frontend\src\components\AnalisaDashboard.tsx"

with open(FILE_PATH, "r", encoding="utf-8") as f:
    content = f.read()

new_code = """
  const analisa14 = useMemo(() => {
    const title = 'Indeks Paralisis Administratif (Administrative Paralysis Index)';
    const rapat = yearlyData['RAPAT'] || [];
    const mutasi = data['Mutasi']?.pertambahan || [];
    const mutasiYears = data['Mutasi']?.years || [];
    
    const chartData = [];
    const allYears = Array.from(new Set([...rapat.map((x:any)=>x.Tanggal), ...mutasiYears])).filter(Boolean).sort() as number[];
    
    for (const year of allYears) {
      const rapatYear = rapat.filter((x: any) => x.Tanggal === year);
      const totalRapat = rapatYear.length;
      
      let totalMutasi = 0;
      for (const m of mutasi) {
        if (m[year]) {
          totalMutasi += m[year];
        }
      }
      
      chartData.push({ name: year, TotalRapat: totalRapat, PertumbuhanJemaat: totalMutasi });
    }
    
    const hasData = chartData.some((d: any) => d.TotalRapat > 0 || d.PertumbuhanJemaat > 0);
    
    let isWarning = false;
    let rapatGrowth = 0;
    let mutasiGrowth = 0;
    
    if (chartData.length >= 2) {
      const last = chartData[chartData.length - 1];
      const prev = chartData[chartData.length - 2];
      
      rapatGrowth = prev.TotalRapat > 0 ? ((last.TotalRapat - prev.TotalRapat) / prev.TotalRapat) * 100 : 0;
      mutasiGrowth = prev.PertumbuhanJemaat > 0 ? ((last.PertumbuhanJemaat - prev.PertumbuhanJemaat) / prev.PertumbuhanJemaat) * 100 : 0;
      
      if (rapatGrowth > 20 && mutasiGrowth < 2) {
        isWarning = true;
      }
    }

    const table = (
      <table className="data-table">
        <thead>
          <tr><th>Tahun</th><th>Jumlah Rapat Majelis</th><th>Angka Pertumbuhan Jemaat</th></tr>
        </thead>
        <tbody>
          {chartData.map((row: any, i: number) => (
            <tr key={i}><td>{row.name}</td><td>{row.TotalRapat}</td><td>{row.PertumbuhanJemaat}</td></tr>
          ))}
        </tbody>
      </table>
    );

    const chart = (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
          <YAxis yAxisId="left" stroke="rgba(255,255,255,0.5)" />
          <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.5)" />
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="TotalRapat" name="Jumlah Rapat" stroke={COLORS.red} strokeWidth={3} />
          <Line yAxisId="right" type="monotone" dataKey="PertumbuhanJemaat" name="Pertumbuhan Jemaat" stroke={COLORS.green} strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    );

    const description = "Mendeteksi apakah gereja terlalu berorientasi ke dalam (sibuk mengurus birokrasi) hingga mengorbankan waktu untuk pelayanan riil, yang berujung pada stagnasi pertumbuhan.";
    const dynamicText = chartData.length >= 2 
      ? `Tahun lalu rapat tumbuh ${rapatGrowth.toFixed(1)}%, sementara pertumbuhan jemaat berada di level ${mutasiGrowth.toFixed(1)}%.`
      : `Menghitung indeks administratif...`;
      
    const alertText = isWarning
      ? "Terjadi lonjakan intensitas rapat administratif yang tidak sebanding dengan pertumbuhan jemaat (paralisis administratif). Majelis Jemaat disarankan untuk mereformasi birokrasi, menyederhanakan pelaporan, dan mengalihkan setidaknya 20% jam rapat manajerial menjadi jam perlawatan atau penjangkauan (Bina & Lawat)."
      : null;

    return { sources: ['RAPAT', 'Mutasi (Pertambahan)'], isHidden: !hasData, title, icon: <AlertTriangle color={COLORS.red} />, description, dynamicText, chart, table, alertText, status: isWarning ? 'warning' : 'good' };
  }, [yearlyData, data]);

  const analisa15 = useMemo(() => {
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
      
      if (uangGrowth > -5 && hadirGrowth < -15) {
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
  }, [data, yearlyData]);

  const analisa16 = useMemo(() => {
    const title = 'Fenomena "Generasi yang Hilang" (Missing Middle)';
    const diriMassa = data['DIRI']?.massa || [];
    
    const chartData = diriMassa.map((d: any) => {
      return { 
        name: d.Tahun,
        DewasaMuda: d['Dewasa Muda (31-39)'] || 0,
        Lansia: d['Senior (>60)'] || 0
       };
    });

    const hasData = chartData.some((d: any) => d.DewasaMuda > 0);
    
    let isWarning = false;
    let growthDM = 0;
    
    if (chartData.length >= 3) {
      const last = chartData[chartData.length - 1].DewasaMuda;
      const prev = chartData[chartData.length - 3].DewasaMuda; 
      
      growthDM = prev > 0 ? ((last - prev) / prev) * 100 : 0;
      
      if (growthDM < -10) {
        isWarning = true;
      }
    }

    const table = (
      <table className="data-table">
        <thead>
          <tr><th>Tahun</th><th>Keluarga Muda (31-39 thn)</th><th>Lansia (>60 thn)</th></tr>
        </thead>
        <tbody>
          {chartData.map((row: any, i: number) => (
            <tr key={i}><td>{row.name}</td><td>{row.DewasaMuda}</td><td>{row.Lansia}</td></tr>
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
          <Bar dataKey="DewasaMuda" fill={COLORS.teal} radius={[4, 4, 0, 0]} name="Keluarga Muda (31-39)" />
          <Bar dataKey="Lansia" fill={COLORS.purple} radius={[4, 4, 0, 0]} name="Lansia (>60)" />
        </BarChart>
      </ResponsiveContainer>
    );

    const description = "Mendeteksi hilangnya kelompok keluarga muda (usia 31-40). Generasi ini sering pindah gereja jika ekosistem pelayanan anak atau fasilitas tidak mendukung.";
    const dynamicText = chartData.length >= 3 
      ? `Populasi keluarga muda berubah sebesar ${growthDM.toFixed(1)}% dalam 3 tahun terakhir.`
      : `Menghitung demografi keluarga muda...`;
      
    const alertText = isWarning
      ? "Terdapat penyusutan signifikan pada demografi keluarga muda (usia 31-39) atau fenomena 'the missing middle'. Gereja disarankan untuk segera melakukan jajak pendapat (survey) kepada keluarga muda terkait relevansi khotbah, daya dukung fasilitas, serta kualitas Sekolah Minggu, yang sering kali menjadi alasan utama eksodus pada rentang usia ini."
      : null;

    return { sources: ['DIRI (Usia 31-39)'], isHidden: !hasData, title, icon: <Users color={COLORS.red} />, description, dynamicText, chart, table, alertText, status: isWarning ? 'warning' : 'good' };
  }, [data]);

  const analisa17 = useMemo(() => {
    const title = 'Indeks Beban Acara vs. Persekutuan Rutin (Event-Driven Entropy)';
    const perayaan = yearlyData['Perayaan'] || [];
    const persKategorial = yearlyData['Pers. Kategorial'] || [];
    
    // Ini sulit di-plot bulanan karena data sheet ini adalah per kegiatan (bukan time-series bulanan yg rata)
    // Pendekatan alternatif: kita hitung rasio kehadiran perayaan vs persekutuan per tahun saja
    // Karena kita tidak memiliki data bulanan di yearlyData, yearlyData mengelompokkan berdasarkan Tahun
    // Tetapi kita bisa mengekstrak rasio ketimpangan.
    
    const chartData = [];
    const allYears = Array.from(new Set([...perayaan.map((x:any)=>x.Tanggal), ...persKategorial.map((x:any)=>x.Tanggal)])).filter(Boolean).sort() as number[];

    for (const year of allYears) {
      const p = perayaan.find((x: any) => x.Tanggal === year);
      const pk = persKategorial.find((x: any) => x.Tanggal === year);
      
      const avgP = p ? (p['Total Kehadiran'] || 0) : 0;
      const avgPK = pk ? (pk['Total Kehadiran'] || 0) : 0;
      
      chartData.push({ name: year, Perayaan: avgP, Rutin: avgPK });
    }

    const hasData = chartData.some((d: any) => d.Perayaan > 0 && d.Rutin > 0);
    
    let isWarning = false;
    let ratio = 0;
    
    if (chartData.length > 0) {
      const last = chartData[chartData.length - 1];
      if (last.Rutin > 0) {
        ratio = last.Perayaan / last.Rutin;
        if (ratio > 3) isWarning = true; // Jika acara besar 3x lipat rutinitas
      }
    }

    const table = (
      <table className="data-table">
        <thead>
          <tr><th>Tahun</th><th>Rata-rata Acara Perayaan</th><th>Rata-rata Persekutuan Rutin</th></tr>
        </thead>
        <tbody>
          {chartData.map((row: any, i: number) => (
            <tr key={i}><td>{row.name}</td><td>{row.Perayaan}</td><td>{row.Rutin}</td></tr>
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
          <Bar dataKey="Perayaan" fill={COLORS.red} radius={[4, 4, 0, 0]} name="Kehadiran Acara Besar" />
          <Bar dataKey="Rutin" fill={COLORS.blue} radius={[4, 4, 0, 0]} name="Kehadiran Persekutuan Rutin" />
        </BarChart>
      </ResponsiveContainer>
    );

    const description = "Menilai apakah gereja mengidap kultur 'Event/Acara Besar' (spectator culture) yang menghabiskan anggaran, sehingga ibadah persekutuan yang sifatnya rutin (pemuridan) justru sepi.";
    const dynamicText = chartData.length > 0 
      ? `Perbandingan kehadiran Acara Besar vs Persekutuan Rutin adalah ${ratio.toFixed(1)}x lipat.`
      : `Menghitung indeks beban acara...`;
      
    const alertText = isWarning
      ? "Data memperlihatkan ketimpangan yang masif antara acara besar vs persekutuan rutin. Majelis perlu menyeimbangkan kalender kegiatan agar gereja tidak terjebak pada kultur kepanitiaan sesaat, melainkan berakar pada pertumbuhan pemuridan berkelanjutan."
      : null;

    return { sources: ['Perayaan', 'Pers. Kategorial'], isHidden: !hasData, title, icon: <AlertTriangle color={COLORS.red} />, description, dynamicText, chart, table, alertText, status: isWarning ? 'warning' : 'good' };
  }, [yearlyData]);

  const analisa18 = useMemo(() => {
    const title = 'Indeks Lingkaran Tertutup (Closed-Circle Welcoming Index)';
    const kebMinggu = yearlyData['Keb. Minggu'] || [];
    
    const chartData = [];
    for (const km of kebMinggu) {
      const year = km.Tanggal;
      const total = km['Total Kehadiran'] || 0;
      const simp = km['Simpatisan Jumlah'] || 0;
      
      const percent = total > 0 ? (simp / total) * 100 : 0;
      chartData.push({ name: year, Simpatisan: simp, Total: total, Persentase: parseFloat(percent.toFixed(1)) });
    }

    const hasData = chartData.some((d: any) => d.Total > 0);
    
    let isWarning = false;
    let lastPercent = 0;
    
    if (chartData.length > 0) {
      lastPercent = chartData[chartData.length - 1].Persentase;
      if (lastPercent < 3) isWarning = true;
    }

    const table = (
      <table className="data-table">
        <thead>
          <tr><th>Tahun</th><th>Jumlah Tamu/Simpatisan</th><th>Total Kehadiran</th><th>% Tamu</th></tr>
        </thead>
        <tbody>
          {chartData.map((row: any, i: number) => (
            <tr key={i}><td>{row.name}</td><td>{row.Simpatisan}</td><td>{row.Total}</td><td>{row.Persentase}%</td></tr>
          ))}
        </tbody>
      </table>
    );

    const chart = (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
          <YAxis stroke="rgba(255,255,255,0.5)" />
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} formatter={(val: any) => `${val}%`} />
          <Legend />
          <Line type="monotone" dataKey="Persentase" name="% Simpatisan Baru" stroke={COLORS.orange} strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    );

    const description = "Mengukur seberapa 'terbuka' jemaat terhadap orang luar, pencari Tuhan (seekers), atau pendatang baru (Marturia vs Koinonia).";
    const dynamicText = chartData.length > 0 
      ? `Persentase simpatisan di tahun terakhir tercatat sebesar ${lastPercent.toFixed(1)}% dari total kehadiran.`
      : `Menghitung indeks inklusivitas gereja...`;
      
    const alertText = isWarning
      ? "Persentase kehadiran tamu/simpatisan berada di tingkat yang sangat rendah, mengindikasikan dinamika gereja berpotensi menjadi ekosistem yang eksklusif (lingkaran tertutup). Gereja direkomendasikan untuk memperkuat kembali fungsi penyambut tamu (hospitality), program kesaksian yang ramah lingkungan, serta menciptakan suasana ibadah yang peka dan inklusif bagi pendatang baru."
      : null;

    return { sources: ['Keb. Minggu'], isHidden: !hasData, title, icon: <Users color={COLORS.orange} />, description, dynamicText, chart, table, alertText, status: isWarning ? 'warning' : 'good' };
  }, [yearlyData]);
"""

content = content.replace("  const excludedTitles = [", new_code + "\n  const excludedTitles = [")
content = content.replace("const allModules = [analisa2, analisa3, analisa4, analisa6, analisa7, analisa8, analisa10, analisa12, analisa13]", "const allModules = [analisa2, analisa3, analisa4, analisa6, analisa7, analisa8, analisa10, analisa12, analisa13, analisa14, analisa15, analisa16, analisa17, analisa18]")

with open(FILE_PATH, "w", encoding="utf-8") as f:
    f.write(content)
print("Inject success!")

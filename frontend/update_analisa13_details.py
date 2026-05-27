import re

FILE_PATH = r"C:\Users\Chris\Apps\GKI_Waha_Dashboard\On Progress\frontend\src\components\AnalisaDashboard.tsx"

with open(FILE_PATH, "r", encoding="utf-8") as f:
    content = f.read()

analisa13_new = """  const analisa13 = useMemo(() => {
    const title = 'Perbandingan Penerimaan Kebaktian dan Luar Kebaktian';
    const uangData = data['UANG'] || [];
    if (uangData.length === 0) return { sources: ['Data Keuangan (Penerimaan)'], isHidden: true, title };

    // Grouping logic based on timeRange
    const groupData = (range: '1m' | '3m' | '1y' | 'all') => {
      const grouped: Record<string, any> = {};
      uangData.forEach((row: any) => {
        if (!row.Tanggal) return;
        const d = new Date(row.Tanggal);
        let key = '';
        if (range === '1m') {
          key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        } else if (range === '3m') {
          const q = Math.floor(d.getMonth() / 3) + 1;
          key = `${d.getFullYear()}-Q${q}`;
        } else if (range === '1y') {
          key = `${d.getFullYear()}`;
        } else {
          key = row.Tanggal; // all
        }

        if (!grouped[key]) {
          grouped[key] = { 
            name: key, 
            Kolekte: 0, Syukur: 0, 
            KolektePrev: 0, SyukurPrev: 0,
            details: {}
          };
        }
        
        const jam = row.Jam || 'Lain-lain';
        if (!grouped[key].details[jam]) {
          grouped[key].details[jam] = { curr: 0, prev: 0 };
        }

        // Kolekte = No 1 to 8, Syukur = No 9 to 13
        if (row.No >= 1 && row.No <= 8) {
          grouped[key].Kolekte += (row['Penerimaan'] || 0);
          grouped[key].KolektePrev += (row['Penerimaan (Tahun Lalu)'] || 0);
        } else if (row.No >= 9 && row.No <= 13) {
          grouped[key].Syukur += (row['Penerimaan'] || 0);
          grouped[key].SyukurPrev += (row['Penerimaan (Tahun Lalu)'] || 0);
        }
        
        // Track per jam
        grouped[key].details[jam].curr += (row['Penerimaan'] || 0);
        grouped[key].details[jam].prev += (row['Penerimaan (Tahun Lalu)'] || 0);
      });
      
      return Object.values(grouped).sort((a: any, b: any) => a.name.localeCompare(b.name));
    };

    const formatPeriode = (rawKey: any) => {
      const key = String(rawKey || '');
      if (!key) return '';
      if (analisa13Time === '1m') {
        const [y, m] = key.split('-');
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        return `${months[parseInt(m)-1]} ${y}`;
      } else if (analisa13Time === 'all') {
        const d = new Date(key);
        if (!isNaN(d.getTime())) {
          const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
          return `${months[d.getMonth()]} ${d.getFullYear()}`;
        }
      }
      return key;
    };

    const chartData = groupData(analisa13Time);
    const hasData = chartData.some((d: any) => d.Kolekte > 0 || d.Syukur > 0);

    let isWarning = false;
    let highestGapType = '';
    let highestGapValue = 0;
    let highestGapDate = '';
    let biggestContributorJam = '';
    let biggestContributorValue = 0;
    
    if (chartData.length > 0) {
      if (analisa13Compare) {
        chartData.forEach(d => {
          const gap1 = d.Kolekte - d.KolektePrev;
          const gap2 = d.Syukur - d.SyukurPrev;
          if (Math.abs(gap1) > Math.abs(highestGapValue)) {
            highestGapValue = gap1;
            highestGapType = 'Persembahan Kebaktian';
            highestGapDate = formatPeriode(d.name);
            
            // Find biggest contributor
            let maxJam = '';
            let maxGap = 0;
            Object.keys(d.details).forEach(jam => {
              const g = d.details[jam].curr - d.details[jam].prev;
              if (Math.abs(g) > Math.abs(maxGap)) {
                maxGap = g;
                maxJam = jam;
              }
            });
            biggestContributorJam = maxJam;
            biggestContributorValue = maxGap;
          }
          if (Math.abs(gap2) > Math.abs(highestGapValue)) {
            highestGapValue = gap2;
            highestGapType = 'Persembahan Luar Kebaktian';
            highestGapDate = formatPeriode(d.name);
            
            // Find biggest contributor
            let maxJam = '';
            let maxGap = 0;
            Object.keys(d.details).forEach(jam => {
              const g = d.details[jam].curr - d.details[jam].prev;
              if (Math.abs(g) > Math.abs(maxGap)) {
                maxGap = g;
                maxJam = jam;
              }
            });
            biggestContributorJam = maxJam;
            biggestContributorValue = maxGap;
          }
        });
      } else if (chartData.length >= 2) {
        for (let i = 1; i < chartData.length; i++) {
          const d = chartData[i];
          const prevD = chartData[i-1];
          const gap1 = d.Kolekte - prevD.Kolekte;
          const gap2 = d.Syukur - prevD.Syukur;
          
          if (Math.abs(gap1) > Math.abs(highestGapValue)) {
            highestGapValue = gap1;
            highestGapType = 'Persembahan Kebaktian';
            highestGapDate = `${formatPeriode(prevD.name)} ke ${formatPeriode(d.name)}`;
            
            // Find biggest contributor
            let maxJam = '';
            let maxGap = 0;
            Object.keys(d.details).forEach(jam => {
              const prevVal = prevD.details[jam] ? prevD.details[jam].curr : 0;
              const g = d.details[jam].curr - prevVal;
              if (Math.abs(g) > Math.abs(maxGap)) {
                maxGap = g;
                maxJam = jam;
              }
            });
            biggestContributorJam = maxJam;
            biggestContributorValue = maxGap;
          }
          if (Math.abs(gap2) > Math.abs(highestGapValue)) {
            highestGapValue = gap2;
            highestGapType = 'Persembahan Luar Kebaktian';
            highestGapDate = `${formatPeriode(prevD.name)} ke ${formatPeriode(d.name)}`;
            
            // Find biggest contributor
            let maxJam = '';
            let maxGap = 0;
            Object.keys(d.details).forEach(jam => {
              const prevVal = prevD.details[jam] ? prevD.details[jam].curr : 0;
              const g = d.details[jam].curr - prevVal;
              if (Math.abs(g) > Math.abs(maxGap)) {
                maxGap = g;
                maxJam = jam;
              }
            });
            biggestContributorJam = maxJam;
            biggestContributorValue = maxGap;
          }
        }
      }
    }

    const formatCurrency = (val: number) => `${(val / 1000000).toLocaleString('id-ID', {maximumFractionDigits: 1})} Jt`;

    const table = (
      <div style={{ overflowX: 'auto', width: '100%', marginTop: '30px' }}>
        <table className="data-table" style={{ width: '100%', minWidth: '600px' }}>
          <thead>
            <tr>
              <th>Periode</th>
              <th>Kebaktian (Kini)</th>
              {analisa13Compare && <th>Kebaktian (Lalu)</th>}
              <th>Luar Kebaktian (Kini)</th>
              {analisa13Compare && <th>Luar Kebaktian (Lalu)</th>}
            </tr>
          </thead>
          <tbody>
            {chartData.map((row: any, i: number) => (
              <tr key={i}>
                <td>{formatPeriode(row.name)}</td>
                <td>{formatCurrency(row.Kolekte)}</td>
                {analisa13Compare && <td>{formatCurrency(row.KolektePrev)}</td>}
                <td>{formatCurrency(row.Syukur)}</td>
                {analisa13Compare && <td>{formatCurrency(row.SyukurPrev)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

    const chart = (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Rentang Waktu:</label>
            <select 
              value={analisa13Time}
              onChange={(e) => setAnalisa13Time(e.target.value as any)}
              className="input-field"
              style={{ width: '120px', padding: '6px', fontSize: '0.85rem' }}
            >
              <option value="all">Semua</option>
              <option value="1m">1 Bulan</option>
              <option value="3m">3 Bulan</option>
              <option value="1y">1 Tahun</option>
            </select>
          </div>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
            <input 
              type="checkbox" 
              checked={analisa13Compare} 
              onChange={(e) => setAnalisa13Compare(e.target.checked)} 
              style={{ cursor: 'pointer' }}
            />
            Bandingkan Tahun Sebelumnya
          </label>
        </div>
        
        <ResponsiveContainer width="100%" height="100%" minHeight={300}>
          <LineChart data={chartData} margin={{ bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" tickFormatter={formatPeriode} />
            <YAxis stroke="rgba(255,255,255,0.5)" tickFormatter={(val: any) => formatCurrency(val)} width={80} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} formatter={(val: any) => `Rp ${Number(val).toLocaleString('id-ID')}`} labelFormatter={formatPeriode} />
            <Legend content={UniversalLegend} wrapperStyle={{ paddingTop: '20px' }} />
            
            <Line type="monotone" dataKey="Kolekte" name="Persembahan Kebaktian" stroke={COLORS.green} strokeWidth={3} />
            {analisa13Compare && <Line type="monotone" dataKey="KolektePrev" name="Kebaktian (Tahun Lalu)" stroke={COLORS.green} strokeWidth={2} strokeDasharray="5 5" opacity={0.6} />}
            
            <Line type="monotone" dataKey="Syukur" name="Persembahan Luar Kebaktian" stroke={COLORS.purple} strokeWidth={3} />
            {analisa13Compare && <Line type="monotone" dataKey="SyukurPrev" name="Luar Kebaktian (Tahun Lalu)" stroke={COLORS.purple} strokeWidth={2} strokeDasharray="5 5" opacity={0.6} />}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );

    const description = "Membandingkan jumlah penerimaan yang dikumpulkan pada saat ibadah dengan persembahan yang diberikan di luar ibadah.";
    
    let dynamicText = `Grafik menampilkan perbandingan tren keuangan untuk ${analisa13Time === '1y' ? 'tahunan' : analisa13Time === '3m' ? 'per kuartal' : analisa13Time === '1m' ? 'bulanan' : 'semua data'}.`;
    
    if (highestGapDate) {
      const dir = highestGapValue > 0 ? 'kenaikan' : 'penurunan';
      if (analisa13Compare) {
        dynamicText += ` Perbedaan paling signifikan dibandingkan tahun lalu terjadi pada ${highestGapDate} di pos ${highestGapType} dengan ${dir} sebesar ${formatCurrency(Math.abs(highestGapValue))}.`;
      } else {
        dynamicText += ` Perubahan paling ekstrem terjadi pada periode ${highestGapDate}, di mana pos ${highestGapType} mengalami ${dir} drastis sebesar ${formatCurrency(Math.abs(highestGapValue))}.`;
      }
      
      if (biggestContributorJam) {
         dynamicText += ` Data menunjukkan bahwa jenis penerimaan "${biggestContributorJam}" adalah kontributor paling utama di balik lonjakan/penurunan ini.`;
      }
    }
      
    const alertText = isWarning ? `Peringatan: Tren persembahan mengalami penurunan yang signifikan.` : null;

    return { sources: ['Data Keuangan (Penerimaan)'], isHidden: !hasData, title, icon: <TrendingUp color={COLORS.green} />, description, dynamicText, chart, table, alertText, status: isWarning ? 'warning' : 'good' };
  }, [data, yearlyData, analisa13Time, analisa13Compare]);"""

content = re.sub(
    r'  const analisa13 = useMemo\(\(\) => \{.*?(?=  const analisa18 = useMemo)',
    analisa13_new + '\n\n',
    content,
    flags=re.DOTALL
)

with open(FILE_PATH, "w", encoding="utf-8") as f:
    f.write(content)

print("analisa13 details tracking updated successfully")

import re

FILE_PATH = r"C:\Users\Chris\Apps\GKI_Waha_Dashboard\On Progress\frontend\src\components\AnalisaDashboard.tsx"

with open(FILE_PATH, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add hooks
hooks_code = """  const [analisa13Time, setAnalisa13Time] = useState<'1m'|'3m'|'1y'|'all'>('1y');
  const [analisa13Compare, setAnalisa13Compare] = useState(false);
  const [analisa13Accum, setAnalisa13Accum] = useState(false);"""
if "analisa13Time" not in content:
    content = content.replace("  const dashboardRef = useRef<HTMLDivElement>(null);", hooks_code + "\n  const dashboardRef = useRef<HTMLDivElement>(null);")


# 2. Fix Analisa 12 Legend
analisa12_legend_fix = """<Legend content={UniversalLegend} payload={[
            { value: 'Pendaftaran Anggota', type: 'rect', color: COLORS.green },
            { value: 'Kehadiran Simpatisan', type: 'rect', color: COLORS.orange }
          ]} />"""
content = re.sub(
    r'<Legend content=\{UniversalLegend\}\s*/>\s*<Bar dataKey="MutasiMasuk"[^>]+name="Pendaftaran Anggota" />\s*<Bar dataKey="SimpatisanMinggu"[^>]+name="Kehadiran Simpatisan" />',
    analisa12_legend_fix + '\n          <Bar dataKey="MutasiMasuk" fill={COLORS.green} radius={[4, 4, 0, 0]} name="Pendaftaran Anggota" />\n          <Bar dataKey="SimpatisanMinggu" fill={COLORS.orange} radius={[4, 4, 0, 0]} name="Kehadiran Simpatisan" />',
    content
)


# 3. Replace Analisa 13
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
            KolekteAccum: 0, SyukurAccum: 0,
            KolekteAccumPrev: 0, SyukurAccumPrev: 0
          };
        }

        // Kolekte = No 1 to 8, Syukur = No 9 to 13
        if (row.No >= 1 && row.No <= 8) {
          if (analisa13Accum) {
            grouped[key].KolekteAccum += (row['Akumulasi'] || 0);
            grouped[key].KolekteAccumPrev += (row['Akumulasi (Tahun Lalu)'] || 0);
          } else {
            grouped[key].Kolekte += (row['Penerimaan'] || 0);
            grouped[key].KolektePrev += (row['Penerimaan (Tahun Lalu)'] || 0);
          }
        } else if (row.No >= 9 && row.No <= 13) {
          if (analisa13Accum) {
            grouped[key].SyukurAccum += (row['Akumulasi'] || 0);
            grouped[key].SyukurAccumPrev += (row['Akumulasi (Tahun Lalu)'] || 0);
          } else {
            grouped[key].Syukur += (row['Penerimaan'] || 0);
            grouped[key].SyukurPrev += (row['Penerimaan (Tahun Lalu)'] || 0);
          }
        }
      });
      
      return Object.values(grouped).sort((a: any, b: any) => a.name.localeCompare(b.name));
    };

    const chartData = groupData(analisa13Time);
    const hasData = chartData.some((d: any) => d.Kolekte > 0 || d.Syukur > 0 || d.KolekteAccum > 0 || d.SyukurAccum > 0);

    let isWarning = false;
    let highestGapType = '';
    let highestGapValue = 0;
    let highestGapDate = '';
    
    if (chartData.length > 0 && analisa13Compare) {
      chartData.forEach(d => {
        const val1 = analisa13Accum ? d.KolekteAccum : d.Kolekte;
        const prev1 = analisa13Accum ? d.KolekteAccumPrev : d.KolektePrev;
        const gap1 = val1 - prev1;
        
        const val2 = analisa13Accum ? d.SyukurAccum : d.Syukur;
        const prev2 = analisa13Accum ? d.SyukurAccumPrev : d.SyukurPrev;
        const gap2 = val2 - prev2;

        if (Math.abs(gap1) > Math.abs(highestGapValue)) {
          highestGapValue = gap1;
          highestGapType = 'Persembahan Kebaktian';
          highestGapDate = d.name;
        }
        if (Math.abs(gap2) > Math.abs(highestGapValue)) {
          highestGapValue = gap2;
          highestGapType = 'Persembahan Luar Kebaktian';
          highestGapDate = d.name;
        }
      });
    }

    const formatCurrency = (val: number) => `${(val / 1000000).toLocaleString('id-ID', {maximumFractionDigits: 1})} Jt`;

    const table = (
      <div style={{ overflowX: 'auto', width: '100%' }}>
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
                <td>{row.name}</td>
                <td>{formatCurrency(analisa13Accum ? row.KolekteAccum : row.Kolekte)}</td>
                {analisa13Compare && <td>{formatCurrency(analisa13Accum ? row.KolekteAccumPrev : row.KolektePrev)}</td>}
                <td>{formatCurrency(analisa13Accum ? row.SyukurAccum : row.Syukur)}</td>
                {analisa13Compare && <td>{formatCurrency(analisa13Accum ? row.SyukurAccumPrev : row.SyukurPrev)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

    const chart = (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
        <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
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

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
            <input 
              type="checkbox" 
              checked={analisa13Accum} 
              onChange={(e) => setAnalisa13Accum(e.target.checked)} 
              style={{ cursor: 'pointer' }}
            />
            Sisi Akumulasi
          </label>
        </div>
        
        <ResponsiveContainer width="100%" height="100%" minHeight={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
            <YAxis stroke="rgba(255,255,255,0.5)" tickFormatter={(val: any) => formatCurrency(val)} width={80} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} formatter={(val: any) => `Rp ${Number(val).toLocaleString('id-ID')}`} />
            <Legend content={UniversalLegend} />
            
            <Line type="monotone" dataKey={analisa13Accum ? "KolekteAccum" : "Kolekte"} name="Persembahan Kebaktian" stroke={COLORS.green} strokeWidth={3} />
            {analisa13Compare && <Line type="monotone" dataKey={analisa13Accum ? "KolekteAccumPrev" : "KolektePrev"} name="Kebaktian (Tahun Lalu)" stroke={COLORS.green} strokeWidth={2} strokeDasharray="5 5" opacity={0.6} />}
            
            <Line type="monotone" dataKey={analisa13Accum ? "SyukurAccum" : "Syukur"} name="Persembahan Luar Kebaktian" stroke={COLORS.purple} strokeWidth={3} />
            {analisa13Compare && <Line type="monotone" dataKey={analisa13Accum ? "SyukurAccumPrev" : "SyukurPrev"} name="Luar Kebaktian (Tahun Lalu)" stroke={COLORS.purple} strokeWidth={2} strokeDasharray="5 5" opacity={0.6} />}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );

    const description = "Membandingkan jumlah penerimaan yang dikumpulkan pada saat ibadah dengan persembahan yang diberikan di luar ibadah.";
    
    let dynamicText = `Grafik menampilkan perbandingan tren keuangan untuk ${analisa13Time === '1y' ? 'tahunan' : analisa13Time === '3m' ? 'per kuartal' : analisa13Time === '1m' ? 'bulanan' : 'semua data'}.`;
    
    if (analisa13Compare && highestGapDate) {
      const dir = highestGapValue > 0 ? 'kenaikan' : 'penurunan';
      dynamicText += ` Perbedaan paling signifikan dibandingkan tahun lalu terjadi pada ${highestGapDate} di pos ${highestGapType} dengan ${dir} sebesar ${formatCurrency(Math.abs(highestGapValue))}.`;
    }
      
    const alertText = isWarning ? `Peringatan: Tren persembahan mengalami penurunan yang signifikan.` : null;

    return { sources: ['Data Keuangan (Penerimaan)'], title, icon: <TrendingUp color={COLORS.green} />, description, dynamicText, chart, table, alertText, status: isWarning ? 'warning' : 'good' };
  }, [data, yearlyData, analisa13Time, analisa13Compare, analisa13Accum]);"""

content = re.sub(
    r'  const analisa13 = useMemo\(\(\) => \{.*?(?=  const analisa18 = useMemo)',
    analisa13_new + '\n\n',
    content,
    flags=re.DOTALL
)

with open(FILE_PATH, "w", encoding="utf-8") as f:
    f.write(content)

print("analisa13 updated successfully")

import { exportPDF as _exportPDF, exportPPTX as _exportPPTX } from '../utils/exportUtils';
import { useMemo, useState, useRef } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Info, CheckCircle, TrendingUp, Users, FileText, Download } from 'lucide-react';

const UniversalLegend = (props: any) => {
  const { payload } = props;
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', paddingTop: '10px', flexWrap: 'wrap' }}>
      {payload.map((entry: any, index: number) => (
        <span key={`item-${index}`} style={{ color: entry.color, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 500 }}>
          <div style={{ width: entry.type === 'line' ? '16px' : '12px', height: entry.type === 'line' ? '3px' : '12px', backgroundColor: entry.color, borderRadius: entry.type === 'line' ? '2px' : '2px' }}></div>
          {entry.value}
        </span>
      ))}
    </div>
  );
};

interface Props {
  data: Record<string, any>;
  yearlyData: Record<string, any>;
}

const COLORS = {
  blue: '#3b82f6',
  purple: '#8b5cf6',
  green: '#10b981',
  red: '#ef4444',
  orange: '#f59e0b',
  teal: '#14b8a6',
  indigo: '#6366f1'
};


function AnalisaCard({ title, icon, description, chart, table, alertText, status, dynamicText, sources, forceShow }: any) {
  return (
    <div className="glass-panel analisa-card" style={{ marginBottom: '24px', overflow: 'hidden', border: forceShow ? '1px solid rgba(239, 68, 68, 0.5)' : undefined, boxShadow: forceShow ? '0 0 15px rgba(239, 68, 68, 0.1)' : undefined }}>
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '12px', background: forceShow ? 'rgba(239, 68, 68, 0.05)' : 'rgba(255,255,255,0.02)' }}>
        {icon}
        <div>
          <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>{title}</h3>
        </div>
      </div>

      {forceShow && sources && sources.length > 0 && (
        <div style={{ padding: '16px 24px 0 24px' }}>
          <div className="alert-box alert-warning" style={{ background: 'rgba(239, 68, 68, 0.1)', borderLeftColor: '#ef4444' }}>
            <AlertTriangle size={20} color="#ef4444" />
            <span style={{ color: '#ef4444' }}>
              Analisa ini disembunyikan karena data ({sources.join(', ')}) belum ada di sumber.
            </span>
          </div>
        </div>
      )}
      
      {description && (
        <div style={{ padding: '16px 24px 0 24px' }}>
          <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)', fontStyle: 'italic', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <FileText size={16} style={{ marginTop: '2px', flexShrink: 0, opacity: 0.6 }} />
            {description}
          </p>
        </div>
      )}
      
      {sources && sources.length > 0 && (
        <div style={{ padding: '0 24px', marginTop: '12px' }}>
          <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
            <strong>Source yang digunakan:</strong>
            <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px' }}>
              {sources.map((s: string, i: number) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        </div>
      )}

      {dynamicText && (
        <div style={{ padding: '0 24px', marginTop: '16px' }}>
          <div style={{ padding: '12px 16px', background: 'rgba(59, 130, 246, 0.1)', borderLeft: `4px solid ${COLORS.blue}`, borderRadius: '0 8px 8px 0', color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {(Array.isArray(dynamicText) ? dynamicText : typeof dynamicText === 'string' ? dynamicText.split(/(?<=[a-zA-Z])\.\s+/).filter(Boolean) : [dynamicText]).map((text: any, i: number) => (
                <li key={i}>{text}{typeof text === 'string' && !text.endsWith('.') && !text.endsWith('?') ? '.' : ''}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {alertText && (
        <div style={{ padding: '16px 24px 0 24px' }}>
          <div className={`alert-box alert-${status}`}>
            {status === 'warning' ? <AlertTriangle size={20} style={{flexShrink: 0}} /> : status === 'good' ? <CheckCircle size={20} style={{flexShrink: 0}} /> : <Info size={20} style={{flexShrink: 0}} />}
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {(Array.isArray(alertText) ? alertText : typeof alertText === 'string' ? alertText.split(/(?<=[a-zA-Z])\.\s+/).filter(Boolean) : [alertText]).map((text: any, i: number) => (
                <li key={i}>{text}{typeof text === 'string' && !text.endsWith('.') && !text.endsWith('?') ? '.' : ''}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ height: '300px', width: '100%' }}>
          {chart}
        </div>
        <div style={{ overflowX: 'auto' }}>
          {table}
        </div>
      </div>
    </div>
  );
}



export function AnalisaDashboard({ data, yearlyData }: Props) {
  const [showHidden, setShowHidden] = useState(false);
  const [analisa2Filter, setAnalisa2Filter] = useState('All');
  const [analisa13Time, setAnalisa13Time] = useState<'1m'|'3m'|'1y'|'all'>('1y');
  const [analisa13Compare, setAnalisa13Compare] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

  const exportPDF = () => _exportPDF(dashboardRef, 'Waha', 'Analisa');
  const exportPPTX = () => _exportPPTX([dashboardRef], 'Waha', 'Analisa');


  const analisa2 = useMemo(() => {
    const title = 'Perbandingan Jumlah Anggota dan Kehadiran Jemaat di Kebaktian';
    const kebMinggu = yearlyData['Keb. Minggu'] || [];
    const kategorial = yearlyData['Keb. Kategorial'] || [];
    const persKategorial = yearlyData['Pers. Kategorial'] || [];
    const diriMassa = data['DIRI']?.massa || [];

    const years = Array.from(new Set([
      ...kebMinggu.map((x:any)=>x.Tanggal),
      ...kategorial.map((x:any)=>x.Tanggal),
      ...persKategorial.map((x:any)=>x.Tanggal),
      ...diriMassa.map((x:any)=>x.Tahun)
    ])).filter(Boolean).sort() as number[];

    const categories = [
      { key: 'Umum', jam: [], label: 'Umum (Keb. Minggu)', diriKeys: ['Total'] },
      { key: 'Anak', jam: ['anak', 'prarem'], label: 'Anak & PraRem', diriKeys: ['Anak (0-12)', 'Pra Remaja (13-15)'] },
      { key: 'Remaja', jam: ['remaja', 'tunas'], label: 'Remaja', diriKeys: ['Remaja (16-19)'] },
      { key: 'Pemuda', jam: ['pemuda'], label: 'Pemuda', diriKeys: ['Pemuda (20-30)'] },
      { key: 'Dewasa', jam: ['pria', 'wanita', 'bapa', 'ibu', 'dewasa'], label: 'Dewasa (Pria & Wanita)', diriKeys: ['Dewasa Muda (31-39)', 'Dewasa (40-59)'] },
      { key: 'Lansia', jam: ['lansia', 'adiyuswa', 'indah'], label: 'Lansia', diriKeys: ['Senior (>60)'] }
    ];

    const chartData = [];
    const validCategories = new Set<string>();

    for (const year of years) {
      const dRec = diriMassa.find((d: any) => d.Tahun === year);
      const km = kebMinggu.find((x: any) => x.Tanggal === year);
      const kats = kategorial.filter((x: any) => x.Tanggal === year);
      const pkats = persKategorial.filter((x: any) => x.Tanggal === year);

      const row: any = { name: year };
      
      for (const cat of categories) {
        let totalHadir = 0;
        let totalAnggota = 0;

        if (dRec) {
          for (const k of cat.diriKeys) {
            totalAnggota += (dRec[k] || 0);
          }
        }

        if (cat.key === 'Umum') {
          totalHadir = km ? Math.ceil(km['Total Kehadiran'] || 0) : 0;
        } else {
          for (const k of kats) {
            const j = String(k.Jam).toLowerCase();
            if (cat.jam.some(str => j.includes(str))) {
              totalHadir += Math.ceil(k['Total Kehadiran'] || 0);
            }
          }
          for (const p of pkats) {
            const j = String(p.Jam).toLowerCase();
            if (cat.jam.some(str => j.includes(str))) {
              totalHadir += Math.ceil(p['Total Kehadiran'] || 0);
            }
          }
        }

        if (totalAnggota > 0 && totalHadir > 0) {
          validCategories.add(cat.key);
        }

        const percentage = totalAnggota > 0 ? (totalHadir / totalAnggota) * 100 : 0;
        row[cat.key] = parseFloat(percentage.toFixed(1));
        row[`${cat.key}_Hadir`] = totalHadir;
        row[`${cat.key}_Anggota`] = totalAnggota;
      }
      
      chartData.push(row);
    }

    const hasData = validCategories.size > 0;
    
    let isWarning = false;
    let worstCat = '';
    let worstVal = 100;
    
    if (chartData.length > 0) {
      const last = chartData[chartData.length - 1];
      for (const cat of categories) {
        if (validCategories.has(cat.key)) {
          if (last[cat.key] < 50) {
            isWarning = true;
          }
          if (last[cat.key] < worstVal) {
            worstVal = last[cat.key];
            worstCat = cat.label;
          }
        }
      }
    }

    const COLORS_MAP: Record<string, string> = {
      'Umum': COLORS.blue,
      'Anak': COLORS.teal,
      'Remaja': COLORS.green,
      'Pemuda': COLORS.purple,
      'Dewasa': COLORS.orange,
      'Lansia': '#f472b6'
    };

    const table = (
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table className="data-table" style={{ width: '100%', minWidth: '600px' }}>
          <thead>
            <tr>
              <th>Tahun</th>
              {categories.filter(c => validCategories.has(c.key) && (analisa2Filter === 'All' || c.key === analisa2Filter)).map(c => (
                <th key={c.key}>% Hadir {c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {chartData.map((row: any, i: number) => (
              <tr key={i}>
                <td>{row.name}</td>
                {categories.filter(c => validCategories.has(c.key) && (analisa2Filter === 'All' || c.key === analisa2Filter)).map(c => (
                  <td key={c.key}>{row[c.key] > 0 ? `${row[c.key]}%` : '-'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

    const chart = (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
        <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Fokus Kategori:</label>
          <select 
            value={analisa2Filter} 
            onChange={(e) => setAnalisa2Filter(e.target.value)}
            style={{ 
              padding: '6px 12px', 
              borderRadius: '6px', 
              backgroundColor: 'rgba(255,255,255,0.05)', 
              color: 'white', 
              border: '1px solid rgba(255,255,255,0.2)',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="All">Semua Kategori</option>
            {categories.filter(c => validCategories.has(c.key)).map(c => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1, minHeight: '250px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} formatter={(val: any) => `${val}%`} />
              <Legend content={UniversalLegend} />
              {categories.filter(c => validCategories.has(c.key) && (analisa2Filter === 'All' || c.key === analisa2Filter)).map(c => (
                <Line key={c.key} type="monotone" dataKey={c.key} stroke={COLORS_MAP[c.key]} strokeWidth={3} name={`% Hadir ${c.label}`} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );

    const description = "Membandingkan persentase kehadiran masing-masing kelompok usia dengan populasi riilnya di data DIRI (Tabel Massa) untuk mengetahui tingkat serapan jemaat per kategori.";
    const dynamicText = chartData.length > 0 && worstCat !== ''
      ? `Tingkat kehadiran terendah saat ini berada pada kelompok ${worstCat} dengan persentase kehadiran sebesar ${worstVal}%.`
      : `Menghitung data kehadiran per kategori...`;
      
    const alertText = isWarning
      ? `Perlu diperhatikan: Terdapat kelompok usia jemaat dengan tingkat kehadiran di bawah 50% dari populasi aslinya, sehingga dapat menjadi fokus untuk program penggembalaan.`
      : null;

    return { sources: ['Kehadiran Keb. Kategorial', 'Data DIRI (Massa)'], 
      isHidden: !hasData, 
      title,  
      icon: <Users color={COLORS.blue} />, 
      description, 
      dynamicText, 
      chart, 
      table, 
      alertText, 
      status: isWarning ? 'info' : 'neutral' 
    };
  }, [data, yearlyData, analisa2Filter]);


const analisa3 = useMemo(() => {
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
        warningReason = `Populasi Lansia mendominasi populasi Pemuda (Rasio < 0.5). Gereja berpotensi krisis masa depan jika regenerasi pemuda terhambat.`;
      }
      
      if (growthDM < -10) {
        isWarning = true;
        const addMsg = `Terdapat penyusutan pada keluarga muda usia 31-39 sebesar ${growthDM.toFixed(1)}% (fenomena 'the missing middle'). Gereja disarankan melakukan survei jemaat terkait relevansi pelayanan/fasilitas/Sekolah Minggu.`;
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
          <Legend content={UniversalLegend} />
          <Bar dataKey="Pemuda" fill={COLORS.blue} radius={[4, 4, 0, 0]} name="Pemuda (20-30)" />
          <Bar dataKey="DewasaMuda" fill={COLORS.teal} radius={[4, 4, 0, 0]} name="Keluarga Muda (31-39)" />
          <Bar dataKey="Lansia" fill={COLORS.purple} radius={[4, 4, 0, 0]} name="Lansia (>60)" />
        </BarChart>
      </ResponsiveContainer>
    );

    const description = "Memantau kelangsungan regenerasi gereja dengan membandingkan kelompok usia Pemuda, Keluarga Muda, dan Lansia dari data DIRI.";
    const dynamicText = chartData.length > 0 
      ? `Rasio Pemuda terhadap Lansia adalah ${ratioPemuda.toFixed(2)}, dan laju perubahan Keluarga Muda tercatat ${growthDM.toFixed(1)}%.`
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
  }, [data]);

  const analisa4 = useMemo(() => {
    const title = 'Beban Layan Guru Sekolah Minggu (GSM)';
    const tGsm = data['TENAGA']?.ratio_gsm || [];
    const kategorial = yearlyData['Keb. Kategorial'] || [];
    
    const chartData = [];
    const allYears = Array.from(new Set([...tGsm.map((x:any)=>x.Tahun), ...kategorial.map((x:any)=>x.Tanggal)])).filter(Boolean).sort() as number[];

    for (const year of allYears) {
      const g = tGsm.find((x: any) => x.Tahun === year);
      const kat = kategorial.find((x: any) => x.Tanggal === year);
      
      const totalGSM = g ? (g['GSM P'] || 0) + (g['GSM W'] || 0) : 0;
      const totalAnak = kat ? Math.ceil(kat['Total Kehadiran'] || 0) : 0;
      
      const rasioGSM = totalGSM > 0 ? totalAnak / totalGSM : 0;

      if (totalGSM > 0 || totalAnak > 0) {
        chartData.push({
          name: year,
          GSM: totalGSM,
          Anak: totalAnak,
          RasioGSM: parseFloat(rasioGSM.toFixed(1))
        });
      }
    }

    const hasData = chartData.some((d: any) => d.GSM > 0) && chartData.some((d: any) => d.Anak > 0);

    let isWarning = false;
    let gsmLoad = 0;
    
    if (chartData.length > 0) {
      const last = chartData[chartData.length - 1];
      gsmLoad = last.RasioGSM;
      if (gsmLoad > 10) { 
        isWarning = true;
      }
    }

    const table = (
      <table className="data-table">
        <thead>
          <tr><th>Tahun</th><th>Total GSM (Pria + Wanita)</th><th>Total Kehadiran Anak (Kategorial)</th><th>Beban Pelayanan (1 Guru : X Anak)</th></tr>
        </thead>
        <tbody>
          {chartData.map((row: any, i: number) => (
            <tr key={i}><td>{row.name}</td><td>{row.GSM}</td><td>{row.Anak}</td><td>1 : {row.RasioGSM}</td></tr>
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
          <Legend content={UniversalLegend} />
          <Bar dataKey="GSM" fill={COLORS.blue} radius={[4, 4, 0, 0]} name="Jumlah GSM" />
          <Bar dataKey="Anak" fill={COLORS.teal} radius={[4, 4, 0, 0]} name="Kehadiran Anak" />
        </BarChart>
      </ResponsiveContainer>
    );

    const description = "Membandingkan jumlah Guru Sekolah Minggu (Pria & Wanita) dengan rata-rata kehadiran Anak Sekolah Minggu di Keb. Kategorial.";
    const dynamicText = chartData.length > 0 
      ? `Saat ini beban pelayanan 1 orang GSM menangani rata-rata ${gsmLoad} anak.`
      : `Menghitung data tenaga...`;
      
    const alertText = isWarning
      ? "Peringatan: Beban pelayanan Guru Sekolah Minggu saat ini tergolong berat (>10 anak per guru). Gereja perlu merekrut tenaga pendidik tambahan."
      : null;

    return { sources: ['TENAGA (Rasio GSM)', 'Keb. Kategorial'], 
      isHidden: !hasData, 
      title, 
      icon: <AlertTriangle color={COLORS.red} />, 
      description, 
      dynamicText, 
      chart, 
      table, 
      alertText, 
      status: isWarning ? 'warning' : 'neutral'
    };
  }, [data, yearlyData]);



  const analisa7 = useMemo(() => {
    const title = 'Sumber Pertumbuhan Jemaat (Migrasi vs Organik)';
        const alasan = data['Mutasi']?.alasan_mutasi || [];
    const years = data['Mutasi']?.years || [];
    if (alasan.length < 4) return { sources: ['Data Mutasi (Pertambahan)'], isHidden: true, title  };

    const chartData = years.map((y: any) => ({ name: y, ATP: 0, ATD_ATIS: 0 }));
    
    if (alasan[3]) {
      years.forEach((y: string, i: number) => chartData[i].ATP += alasan[3][y] || 0);
    }
    for (let j = 0; j < 3; j++) {
      if (alasan[j]) {
        years.forEach((y: string, i: number) => chartData[i].ATD_ATIS += alasan[j][y] || 0);
      }
    }

    const hasData = chartData.some((d: any) => d.ATP > 0 || d.ATD_ATIS > 0);
    if (!hasData) return { sources: ['Data Mutasi (Pertambahan)'], isHidden: true, title };

    let isWarning = false;
    let atpKini = 0;
    let organKini = 0;
    
    if (chartData.length >= 2) {
      const last = chartData[chartData.length - 1];
      const prev = chartData[chartData.length - 2];
      
      if (last.ATP > last.ATD_ATIS * 1.5 && prev.ATP > prev.ATD_ATIS * 1.5) {
        isWarning = true;
      }
      atpKini = last.ATP;
      organKini = last.ATD_ATIS;
    }

    const table = (
      <table className="data-table">
        <thead>
          <tr><th>Tahun</th><th>Atestasi Masuk (Migrasi)</th><th>Baptis Anak + Sidi (Organik)</th></tr>
        </thead>
        <tbody>
          {chartData.map((row: any, i: number) => (
            <tr key={i}><td>{row.name}</td><td>{row.ATP}</td><td>{row.ATD_ATIS}</td></tr>
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
          <Legend content={UniversalLegend} />
          <Bar dataKey="ATP" fill={COLORS.teal} radius={[4, 4, 0, 0]} name="Atestasi Masuk (Migrasi)" />
          <Bar dataKey="ATD_ATIS" fill={COLORS.green} radius={[4, 4, 0, 0]} name="Baptis + Sidi (Organik)" />
        </BarChart>
      </ResponsiveContainer>
    );

    const description = "Mengetahui apakah gereja bertumbuh karena pertambahan orang percaya baru atau sekadar menerima perpindahan jemaat dari gereja lain.";
    const dynamicText = chartData.length >= 2 
      ? `Pada tahun terakhir tercatat penambahan ${atpKini} anggota titipan gereja lain, berbanding dengan ${organKini} penambahan jemaat dari percaya baru (Baptis Anak dan Sidi).`
      : `Data sedang dihitung.`;
      
    const alertText = isWarning
      ? `Pertumbuhan jumlah anggota gereja sebagian besar berasal dari perpindahan jemaat gereja lain, bukan dari orang percaya baru. Gereja perlu mengkaji ulang efektivitas program penjangkauan masyarakat sekitar.`
      : null;

    return { sources: ['Data Mutasi (Pertambahan)'], title, icon: <TrendingUp color={COLORS.teal} />, description, dynamicText, chart, table, alertText, status: isWarning ? 'warning' : 'good' };
  }, [data]);

  const analisa8 = useMemo(() => {
    const title = 'Stagnasi Tenaga Pelayanan (Volunteer)';
    const tenaga = data['TENAGA']?.rekap || [];
    const diriUsiaGender = data['DIRI']?.usia_gender || [];
    
    const chartData = [];
    for (const d of tenaga) {
      const year = d.Tahun;
      const dRec = diriUsiaGender.find((x: any) => x.Tahun === year);
      
      let totalAnggota = 0;
      if (dRec) {
        for (const key in dRec) {
          if ((key.endsWith(' P') || key.endsWith(' W')) && typeof dRec[key] === 'number') {
            totalAnggota += dRec[key];
          }
        }
      }
      
      if (totalAnggota > 0 || d.Aktivis > 0) {
        chartData.push({ name: year, Aktivis: d.Aktivis, Jemaat: totalAnggota });
      }
    }

    const hasData = chartData.some((d: any) => d.Aktivis > 0) && chartData.some((d: any) => d.Jemaat > 0);

    let isWarning = false;
    let akRate = 0;
    let jmRate = 0;
    
    if (chartData.length >= 2) {
      const last = chartData[chartData.length - 1];
      const prev = chartData[chartData.length - 2];
      
      akRate = prev.Aktivis > 0 ? ((last.Aktivis - prev.Aktivis) / prev.Aktivis) * 100 : 0;
      jmRate = prev.Jemaat > 0 ? ((last.Jemaat - prev.Jemaat) / prev.Jemaat) * 100 : 0;
      
      if (jmRate > 5 && akRate <= 0) {
        isWarning = true;
      }
    }

    const table = (
      <table className="data-table">
        <thead>
          <tr><th>Tahun</th><th>Total Anggota Jemaat (DIRI)</th><th>Total Aktivis</th></tr>
        </thead>
        <tbody>
          {chartData.map((row: any, i: number) => (
            <tr key={i}><td>{row.name}</td><td>{row.Jemaat}</td><td>{row.Aktivis}</td></tr>
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
          <Legend content={UniversalLegend} />
          <Line yAxisId="left" type="monotone" dataKey="Jemaat" stroke={COLORS.blue} strokeWidth={3} name="Total Jemaat (DIRI)" />
          <Line yAxisId="right" type="monotone" dataKey="Aktivis" stroke={COLORS.red} strokeWidth={3} name="Total Aktivis" />
        </LineChart>
      </ResponsiveContainer>
    );

    const description = "Mendeteksi risiko kelelahan (burnout) apabila pertumbuhan total jumlah jemaat (DIRI) tidak diimbangi dengan pertumbuhan jumlah relawan/aktivis yang memadai.";
    const dynamicText = chartData.length > 0 
      ? `Pertumbuhan Jemaat tahun terakhir berada di angka ${jmRate.toFixed(1)}%, sementara pertumbuhan Aktivis ${akRate.toFixed(1)}%.`
      : `Menghitung data aktivitas relawan...`;
      
    const alertText = isWarning
      ? "Laju pertumbuhan Jemaat (>5%) namun angka ketersediaan Pelayan/Aktivis justru minus atau stagnan. Bahaya kelelahan pada pelayan yang ada sangat tinggi, segera selenggarakan rekrutmen/Bina Relawan."
      : null;

    return { sources: ['TENAGA (Rekap Volunteer)', 'Data DIRI (Usia & Gender)'], 
      isHidden: !hasData, 
      title, 
      icon: <Users color={COLORS.red} />, 
      description, 
      dynamicText, 
      chart, 
      table, 
      alertText, 
      status: isWarning ? 'warning' : 'neutral'
    };
  }, [data]);



  const analisa10 = useMemo(() => {
    const title = 'Indeks "Gereja Penonton" (Keterlibatan)';
    const tRekap = data['TENAGA']?.rekap_aktivis || [];
    const kebMinggu = yearlyData['Keb. Minggu'] || [];
    

    const chartData = [];
    for (const r of tRekap) {
      const year = r.Tahun;
      const km = kebMinggu.find((k: any) => k.Tanggal === year);
      const avgHadir = km ? km['Total Kehadiran'] : 0;
      
      if (avgHadir > 0) {
        chartData.push({
          name: year,
          RasioPelayan: parseFloat(((r.Aktivis / avgHadir) * 100).toFixed(1)),
          Aktivis: r.Aktivis,
          Kehadiran: avgHadir
        });
      }
    }

    const hasData = chartData.some((d: any) => d.Aktivis > 0) && chartData.some((d: any) => d.Kehadiran > 0);
    

    let isWarning = false;
    let currRasio = 0;
    if (chartData.length >= 3) {
      const p1 = chartData[chartData.length - 1].RasioPelayan;
      const p2 = chartData[chartData.length - 2].RasioPelayan;
      const p3 = chartData[chartData.length - 3].RasioPelayan;
      isWarning = p1 < p2 && p2 < p3;
    }
    if (chartData.length > 0) currRasio = chartData[chartData.length - 1].RasioPelayan;

    const table = (
      <table className="data-table">
        <thead>
          <tr><th>Tahun</th><th>Pelayan Aktif</th><th>Persentase Keterlibatan (%)</th></tr>
        </thead>
        <tbody>
          {chartData.map((row, i) => (
            <tr key={i}><td>{row.name}</td><td>{row.Aktivis}</td><td>{row.RasioPelayan}%</td></tr>
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
          <Legend content={UniversalLegend} />
          <Bar dataKey="RasioPelayan" fill={COLORS.teal} radius={[4, 4, 0, 0]} name="% Jemaat yang Melayani" />
        </BarChart>
      </ResponsiveContainer>
    );

    const description = "Mengkalkulasi rasio total aktivis dan pelayan dibandingkan dengan jumlah rata-rata kehadiran minggu. Tujuannya adalah mengukur indeks 'keaktifan' jemaat yang beribadah.";
    const dynamicText = chartData.length > 0 
      ? `Pada pengamatan terakhir, rasio perbandingan orang yang melayani adalah sebesar ${currRasio}% terhadap rata-rata audiens yang datang ibadah minggu.`
      : `Pengolahan rata-rata persentase pelayan sedang berjalan.`;
      
    const alertText = isWarning
      ? `Rasio keterlibatan pelayanan menyusut selama tiga tahun berturut-turut. Semakin sedikit orang yang melayani, menjadikan pola peribadatan cenderung satu-arah (Gereja Penonton).`
      : null;

    return { sources: ['Kehadiran Keb. Minggu', 'Data DIRI (Total Jemaat)'], isHidden: !hasData, title,  icon: <Users color={COLORS.teal} />, description, dynamicText, chart, table, alertText, status: isWarning ? 'warning' : 'neutral' };
  }, [data, yearlyData]);



  const analisa12 = useMemo(() => {
    const title = 'Rasio Konversi Pengunjung Baru';
    const mutasi = data['Mutasi']?.pertambahan || [];
    const kebMinggu = yearlyData['Keb. Minggu'] || [];
    if (mutasi.length < 2 || kebMinggu.length < 2) return { sources: ['Data Mutasi Jemaat', 'Kehadiran Keb. Minggu (Simpatisan)'], isHidden: true, title  };

    const chartData = [];
    const years = data['Mutasi']?.years || [];

    for (const y of years) {
      const km = kebMinggu.find((k: any) => k.Tanggal === y);
      const simp = km ? (km['Simpatisan Jumlah'] || 0) : 0;
      
      let atestasi = 0;
      for (const m of mutasi) {
        const cat = String(m.Kategori).toLowerCase();
        if (cat.includes('atestasi masuk') || cat.includes('baptis dewasa') || cat.includes('sidi')) {
          atestasi += (m[y] || 0);
        }
      }
      
      chartData.push({
        name: y,
        SimpatisanMinggu: simp,
        MutasiMasuk: atestasi
      });
    }

    const hasData = chartData.some((d: any) => d.SimpatisanMinggu > 0 || d.MutasiMasuk > 0);
    if (!hasData) return { sources: ['Data Mutasi Jemaat', 'Kehadiran Keb. Minggu (Simpatisan)'], isHidden: true, title };

    let isWarning = false;
    let simpLalu = 0, simpKini = 0;
    let daftarLalu = 0, daftarKini = 0;
    
    if (chartData.length >= 2) {
      const last = chartData[chartData.length - 1];
      const prev = chartData[chartData.length - 2];
      simpLalu = prev.SimpatisanMinggu;
      simpKini = last.SimpatisanMinggu;
      daftarLalu = prev.MutasiMasuk;
      daftarKini = last.MutasiMasuk;
      
      const simpUp = simpKini > simpLalu;
      const atestasiStagnan = daftarKini <= daftarLalu;
      isWarning = simpUp && atestasiStagnan && simpKini > 0;
    }

    const table = (
      <table className="data-table">
        <thead>
          <tr><th>Tahun</th><th>Pendaftaran Anggota (Mutasi Masuk)</th><th>Rata-rata Simpatisan (Minggu)</th></tr>
        </thead>
        <tbody>
          {chartData.map((row: any, i: number) => (
            <tr key={i}><td>{row.name}</td><td>{row.MutasiMasuk}</td><td>{row.SimpatisanMinggu}</td></tr>
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
          {/* @ts-ignore */}
          <Legend content={UniversalLegend} payload={[
            { value: 'Pendaftaran Anggota', type: 'rect', color: COLORS.green },
            { value: 'Kehadiran Simpatisan', type: 'rect', color: COLORS.orange }
          ]} />
          <Bar dataKey="MutasiMasuk" fill={COLORS.green} radius={[4, 4, 0, 0]} name="Pendaftaran Anggota" />
          <Bar dataKey="SimpatisanMinggu" fill={COLORS.orange} radius={[4, 4, 0, 0]} name="Kehadiran Simpatisan" />
        </BarChart>
      </ResponsiveContainer>
    );

    const description = "Mengetahui apakah simpatisan yang datang pada akhirnya bergabung menjadi anggota tetap, atau hanya sekadar mampir lalu pergi.";
    const dynamicText = chartData.length >= 2 
      ? `Tingkat kehadiran jemaat simpatisan menorehkan angka ${simpKini} di tahun terakhir, sedangkan konversi mereka menjadi warga jemaat tetap adalah sebanyak ${daftarKini} orang.`
      : `Data retensi sedang diproses.`;
      
    const alertText = isWarning
      ? `Jumlah pengunjung yang berstatus simpatisan cukup tinggi, tetapi angka pendaftaran menjadi anggota jemaat sangat rendah. Gereja perlu menyiapkan kelas pengenalan atau pendampingan yang lebih ramah agar simpatisan merasa nyaman bergabung secara resmi.`
      : null;

    return { sources: ['Data Mutasi Jemaat', 'Kehadiran Keb. Minggu (Simpatisan)'], title, icon: <Users color={COLORS.orange} />, description, dynamicText, chart, table, alertText, status: isWarning ? 'warning' : 'good' };
  }, [data, yearlyData]);

  const analisa13 = useMemo(() => {
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
    
    let dynamicText: string[] = [];
    
    if (highestGapDate) {
      const dir = highestGapValue > 0 ? 'kenaikan' : 'penurunan';
      if (analisa13Compare) {
        dynamicText.push(`Perbedaan paling signifikan dibandingkan tahun lalu terjadi pada ${highestGapDate} di pos ${highestGapType} dengan ${dir} sebesar ${formatCurrency(Math.abs(highestGapValue))}.`);
      } else {
        dynamicText.push(`Perubahan paling ekstrem terjadi pada periode ${highestGapDate}, di mana pos ${highestGapType} mengalami ${dir} drastis sebesar ${formatCurrency(Math.abs(highestGapValue))}.`);
      }
      
      if (biggestContributorJam) {
         dynamicText.push(`Data menunjukkan bahwa jenis penerimaan "${biggestContributorJam}" adalah penyumbang utama perubahan ini (selisih sebesar ${formatCurrency(Math.abs(biggestContributorValue))}).`);
      }
    }
    
    const crossoverPeriods = chartData.filter((d: any) => d.Kolekte > d.Syukur).map((d: any) => formatPeriode(d.name));
    if (crossoverPeriods.length > 0) {
      dynamicText.push(`Terdapat fenomena langka pada ${crossoverPeriods.join(', ')} di mana Persembahan Kebaktian berhasil melampaui Persembahan Luar Kebaktian, padahal biasanya Persembahan Luar Kebaktian jauh lebih tinggi.`);
    }
      
    const alertText = isWarning ? `Peringatan: Tren persembahan mengalami penurunan yang signifikan.` : null;

    return { sources: ['Data Keuangan (Penerimaan)'], isHidden: !hasData, title, icon: <TrendingUp color={COLORS.green} />, description, dynamicText, chart, table, alertText, status: isWarning ? 'warning' : 'good' };
  }, [data, yearlyData, analisa13Time, analisa13Compare]);

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
          <Legend content={UniversalLegend} />
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

  const excludedTitles = [
    'Kesenjangan Gender dalam Beban Pelayanan',
    'Daya Tarik Acara Kategorial',
    'Indeks Daya Tahan Sekolah Minggu (Retensi Guru)',
    'Peringatan Krisis Regenerasi Pemimpin'
  ];

  const allModules = [analisa2, analisa3, analisa4, analisa7, analisa8, analisa10, analisa12, analisa13, analisa18].filter((m: any) => m && !excludedTitles.includes(m.title));
  
  const activeCards = allModules
    .filter((c: any) => c && (!c.isHidden || showHidden))
    .sort((a: any, b: any) => {
      const aHidden = a.isHidden ? 1 : 0;
      const bHidden = b.isHidden ? 1 : 0;
      return aHidden - bHidden;
    });

  if (!data || Object.keys(data).length === 0) {
    return <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>Silakan muat file Excel terlebih dahulu untuk melihat analisa.</div>;
  }

  return (
    <div ref={dashboardRef} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: `4px solid ${COLORS.blue}` }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <TrendingUp color={COLORS.blue} />
          Executive Summary & Insights
        </h2>
        <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          Dashboard ini menggunakan algoritma analisa data untuk secara otomatis mendeteksi tren, anomali, peringatan dini (early warning), dan peluang pertumbuhan dari seluruh data gereja yang telah diinput.
        </p>
        
        <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <input 
                type="checkbox" 
                checked={showHidden} 
                onChange={(e) => setShowHidden(e.target.checked)} 
                style={{ cursor: 'pointer' }}
              />
              <span style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>Tunjukkan seluruh Analisa lainnya yang di-hidden (karena data tidak mencukupi)</span>
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn" onClick={exportPDF} style={{ padding: '8px 16px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Download size={16} /> Export PDF
              </button>
              <button className="btn" onClick={exportPPTX} style={{ background: '#d97706', padding: '8px 16px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Download size={16} /> Export PPTX
              </button>
            </div>
          </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(600px, 1fr))', gap: '24px' }}>
        {activeCards.map((card: any, idx: number) => (
          <AnalisaCard key={idx} {...card} forceShow={showHidden && card.isHidden} />
        ))}
      </div>
      
      {activeCards.length === 0 && (
        <div className="glass-panel" style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Info size={48} style={{ margin: '0 auto 16px auto', opacity: 0.5 }} />
          <p style={{ margin: 0 }}>Belum ada data yang cukup untuk menampilkan satupun analisa.</p>
          <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem' }}>Centang "Tunjukkan seluruh Analisa" di atas untuk melihat modul yang membutuhkan tambahan data.</p>
        </div>
      )}
    </div>
  );
}
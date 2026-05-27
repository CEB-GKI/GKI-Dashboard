import React, { useState, useEffect, useRef, useMemo } from 'react';
import { exportPDF as _exportPDF, exportPPTX as _exportPPTX } from '../utils/exportUtils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download } from 'lucide-react';

interface DiriDataProps {
  data: {
    usia_gender?: any[];
    etnis?: any[];
    pendidikan?: any[];
    profesi?: any[];
    massa?: any[];
  };
  churchName: string;
}

const tableOptions = [
  { id: 'usia_gender', label: '1. Komposisi Usia & Gender' },
  { id: 'etnis', label: '2. Komposisi Kelompok Etnis' },
  { id: 'pendidikan', label: '3. Komposisi Pendidikan Akhir' },
  { id: 'profesi', label: '4. Komposisi Profesi/Pekerjaan' },
  { id: 'massa', label: '5. Massa Yang Dilayani (KPMS)' },
];

const COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', 
  '#ec4899', '#84cc16', '#14b8a6', '#6366f1', '#a855f7', '#f43f5e',
  '#0ea5e9', '#eab308', '#22c55e', '#d946ef', '#0284c7', '#dc2626',
  '#16a34a', '#d97706', '#9333ea', '#059669', '#e11d48', '#2563eb'
];

export const DiriDashboard: React.FC<DiriDataProps> = ({ data, churchName }) => {
  const [activeTable, setActiveTable] = useState('usia_gender');
  const dashboardRef = useRef<HTMLDivElement>(null);

  const exportPDF = () => _exportPDF(dashboardRef, churchName, 'DIRI');
  const exportPPTX = () => _exportPPTX([dashboardRef], churchName, 'DIRI');

  
  const currentData = data ? (data[activeTable as keyof typeof data] || []) : [];
  const availableYears = currentData.map((d: any) => d.Tahun).filter(Boolean);
  
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [isComparison, setIsComparison] = useState(false);
  const [compareYears, setCompareYears] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  useEffect(() => {
    if (availableYears.length > 0 && !availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[availableYears.length - 1]);
    }
  }, [availableYears, selectedYear, activeTable]);

  const isUsiaGender = activeTable === 'usia_gender';
  
  const allCategories = useMemo(() => {
    if (currentData.length === 0) return [];
    const chartKeys = Object.keys(currentData[0]).filter(k => k !== 'Tahun' && k !== 'Jml_Anak' && k !== 'Jml_Dewasa' && k !== 'Total');
    if (isUsiaGender) {
      const uniqueCats = new Set<string>();
      chartKeys.forEach(k => uniqueCats.add(k.replace(/ [PW]$/, '')));
      return Array.from(uniqueCats);
    }
    return chartKeys;
  }, [currentData, isUsiaGender]);

  // Reset category filters when table changes
  useEffect(() => {
    setSelectedCategories(allCategories);
  }, [allCategories, activeTable]);

  if (!data || Object.keys(data).length === 0 || currentData.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
        <p>Data administrasi DIRI tidak tersedia.</p>
      </div>
    );
  }

  const toggleCompareYear = (year: string) => {
    if (compareYears.includes(year)) {
      setCompareYears(compareYears.filter(y => y !== year));
    } else {
      setCompareYears([...compareYears, year]);
    }
  };

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter(c => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const selectAllCategories = () => setSelectedCategories(allCategories);
  const deselectAllCategories = () => setSelectedCategories([]);

  let transformedChartData: any[] = [];
  let barDataKeys: string[] = [];

  const yearRow = currentData.find((d: any) => d.Tahun === selectedYear) || {};

  if (!isComparison) {
    if (isUsiaGender) {
      selectedCategories.forEach(cat => {
        transformedChartData.push({
          category: cat,
          'Pria': yearRow[`${cat} P`] || 0,
          'Wanita': yearRow[`${cat} W`] || 0
        });
      });
      barDataKeys = ['Pria', 'Wanita'];
    } else {
      selectedCategories.forEach(cat => {
        transformedChartData.push({
          category: cat,
          'Jumlah': yearRow[cat] || 0
        });
      });
      barDataKeys = ['Jumlah'];
    }
  } else {
    const yearsToCompare = [selectedYear, ...compareYears].filter(Boolean).sort();
    if (isUsiaGender) {
      selectedCategories.forEach(cat => {
        const point: any = { category: cat };
        yearsToCompare.forEach(y => {
          const row = currentData.find((d: any) => d.Tahun === y) || {};
          point[`${y} (P)`] = row[`${cat} P`] || 0;
          point[`${y} (W)`] = row[`${cat} W`] || 0;
          if (!barDataKeys.includes(`${y} (P)`)) {
            barDataKeys.push(`${y} (P)`);
            barDataKeys.push(`${y} (W)`);
          }
        });
        transformedChartData.push(point);
      });
    } else {
      selectedCategories.forEach(cat => {
        const point: any = { category: cat };
        yearsToCompare.forEach(y => {
          const row = currentData.find((d: any) => d.Tahun === y) || {};
          point[y] = row[cat] || 0;
          if (!barDataKeys.includes(y)) barDataKeys.push(y);
        });
        transformedChartData.push(point);
      });
    }
  }

  return (
    <div ref={dashboardRef} style={{ display: 'flex', flexDirection: 'column', gap: '24px', background: 'var(--bg-color)', padding: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <h2 style={{ margin: 0 }}>Statistik Diri ({churchName || 'GKI'})</h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn" onClick={exportPDF}>
              <Download size={18} /> Export PDF
            </button>
            <button className="btn" onClick={exportPPTX} style={{ background: '#d97706' }}>
              <Download size={18} /> Export PPTX
            </button>
          </div>
        </div>

      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontWeight: 'bold', minWidth: '150px' }}>Pilih Tabel Laporan:</label>
          <select 
            value={activeTable} 
            onChange={e => {
              setActiveTable(e.target.value);
              setIsComparison(false);
              setCompareYears([]);
            }}
            style={{ padding: '8px 16px', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', minWidth: '300px' }}
          >
            {tableOptions.map(opt => (
              <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Total Data Info */}
        <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: 'var(--text-primary)' }}>Data Total ({selectedYear}):</h3>
          {isUsiaGender ? (
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <div><strong style={{ color: 'var(--text-secondary)' }}>Juml. Anak:</strong> {yearRow['Jml_Anak']?.toLocaleString('id-ID') || 0}</div>
              <div><strong style={{ color: 'var(--text-secondary)' }}>Jml. Dewasa:</strong> {yearRow['Jml_Dewasa']?.toLocaleString('id-ID') || 0}</div>
              <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '2px 8px', borderRadius: '4px' }}>
                <strong style={{ color: '#60a5fa' }}>TOTAL (Anak+Dewasa):</strong> {yearRow['Total']?.toLocaleString('id-ID') || 0}
              </div>
            </div>
          ) : (
            <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '2px 8px', borderRadius: '4px', display: 'inline-block' }}>
              <strong style={{ color: '#60a5fa' }}>TOTAL KESELURUHAN:</strong> {yearRow['Total']?.toLocaleString('id-ID') || 0}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontWeight: 'bold', minWidth: '150px' }}>Tahun Pelayanan:</label>
          <select 
            value={selectedYear} 
            onChange={e => setSelectedYear(e.target.value)}
            style={{ padding: '8px 16px', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', minWidth: '150px' }}
          >
            {availableYears.map((year: string) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginLeft: '16px' }}>
            <input 
              type="checkbox" 
              checked={isComparison}
              onChange={(e) => {
                setIsComparison(e.target.checked);
                if (!e.target.checked) setCompareYears([]);
              }}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <span>Bandingkan dengan tahun lain</span>
          </label>
        </div>

        {isComparison && (
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', marginTop: '8px', padding: '12px', background: 'rgba(0,0,0,0.1)', borderRadius: '8px' }}>
            <label style={{ fontWeight: 'bold' }}>Pilih Tahun Pembanding:</label>
            {availableYears.filter((y: string) => y !== selectedYear).map((year: string) => (
              <label key={year} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={compareYears.includes(year)}
                  onChange={() => toggleCompareYear(year)}
                />
                <span>{year}</span>
              </label>
            ))}
            {availableYears.length <= 1 && (
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Belum ada data tahun lain untuk dibandingkan.</span>
            )}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontWeight: 'bold' }}>Filter Kategori Sumbu X:</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn" onClick={selectAllCategories} style={{ padding: '4px 8px', fontSize: '0.8rem', background: 'transparent', border: '1px solid var(--glass-border)' }}>Pilih Semua</button>
              <button className="btn" onClick={deselectAllCategories} style={{ padding: '4px 8px', fontSize: '0.8rem', background: 'transparent', border: '1px solid var(--glass-border)' }}>Hapus Semua</button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', padding: '12px', background: 'rgba(0,0,0,0.1)', borderRadius: '8px' }}>
            {allCategories.map(cat => (
              <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={selectedCategories.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                />
                <span>{cat}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '24px' }}>
          Grafik {tableOptions.find(o => o.id === activeTable)?.label.substring(3)} 
          {isComparison ? ' (Perbandingan)' : ` (${selectedYear})`}
        </h3>
        <div style={{ width: '100%', height: '500px' }}>
          {transformedChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={transformedChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
                <XAxis dataKey="category" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', borderRadius: '8px' }} 
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                {barDataKeys.map((key, idx) => (
                  <Bar key={key} dataKey={key} fill={COLORS[idx % COLORS.length]} radius={[4, 4, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              Silakan pilih minimal satu kategori untuk menampilkan grafik.
            </div>
          )}
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '24px', overflowX: 'auto' }}>
        <h3 style={{ marginTop: 0, marginBottom: '24px' }}>Tabel Rincian Data</h3>
        {transformedChartData.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--glass-border)' }}>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>Kategori</th>
                {barDataKeys.map(key => (
                  <th key={key} style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transformedChartData.map((row: any, i: number) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background-color 0.2s', ':hover': { backgroundColor: 'var(--bg-secondary)' } } as any}>
                  <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>{row.category}</td>
                  {barDataKeys.map(key => (
                    <td key={key} style={{ padding: '12px 16px' }}>{row[key]?.toLocaleString('id-ID')}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
           <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Belum ada kategori yang dipilih.</div>
        )}
      </div>
    </div>
  );
};

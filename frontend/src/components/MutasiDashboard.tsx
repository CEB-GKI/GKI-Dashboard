import { FullscreenWrapper } from './FullscreenWrapper';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { exportPDF as _exportPDF, exportPPTX as _exportPPTX } from '../utils/exportUtils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Download } from 'lucide-react';

interface MutasiDataProps {
  data: {
    years: string[];
    alasan_mutasi: any[];
    pertambahan: any[];
    pengurangan: any[];
    hasil: any[];
    keterangan: { key: string, value: string }[];
  };
  churchName: string;
}

const tableOptions = [
  { id: 'alasan_mutasi', label: '1. Alasan Mutasi & Perubahan Jumlah' },
  { id: 'pertambahan', label: '2. Pertambahan' },
  { id: 'pengurangan', label: '3. Pengurangan' },
  { id: 'hasil', label: '4. Hasil Akhir' },
];

const COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', 
  '#ec4899', '#84cc16', '#14b8a6', '#6366f1', '#a855f7', '#f43f5e'
];

export const MutasiDashboard: React.FC<MutasiDataProps> = ({ data, churchName }) => {
  const [activeTable, setActiveTable] = useState('alasan_mutasi');
  const dashboardRef = useRef<HTMLDivElement>(null);

  const exportPDF = () => _exportPDF(dashboardRef, churchName, 'Mutasi');
  const exportPPTX = () => _exportPPTX([dashboardRef], churchName, 'Mutasi');

  
  if (!data || !data.years || data.years.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
        <p>Data administrasi MUTASI tidak tersedia.</p>
      </div>
    );
  }

  const currentData = data[activeTable as keyof typeof data] as any[];
  const availableYears = data.years;
  
  const [selectedYear, setSelectedYear] = useState<string>(availableYears[availableYears.length - 1] || '');
  const [isComparison, setIsComparison] = useState(false);
  const [compareYears, setCompareYears] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [clickedCategory, setClickedCategory] = useState<string | null>(null);
  const [showAllKeterangan, setShowAllKeterangan] = useState(false);

  const relevantKeterangan = useMemo(() => {
    if (!clickedCategory) return [];
    const normClicked = clickedCategory.replace(/[-\s]/g, '').toLowerCase();
    return data.keterangan.filter(ket => {
      if (!ket.key) return false;
      const normKey = ket.key.replace(/[-\s]/g, '').toLowerCase();
      // Only match if the normalized key is present in the normalized category
      return normClicked.includes(normKey);
    });
  }, [clickedCategory, data.keterangan]);

  const allCategories = useMemo(() => {
    if (!currentData || currentData.length === 0) return [];
    return currentData
      .map(d => d.Kategori)
      .filter(Boolean)
      .filter(k => !k.includes('Sub-Total') && !k.includes('ATATS'));
  }, [currentData]);

  // Reset category filters when table changes
  useEffect(() => {
    setSelectedCategories(allCategories);
  }, [allCategories, activeTable]);

  const toggleCompareYear = (year: string) => {
    setCompareYears(prev => 
      prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year]
    );
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  // Prepare chart data format
  // X-Axis = Kategori, Bar = Years
  const transformedChartData = useMemo(() => {
    if (!currentData || currentData.length === 0) return [];
    
    return currentData
      .filter(row => selectedCategories.includes(row.Kategori) && !row.Kategori.includes('Sub-Total') && !row.Kategori.includes('ATATS'))
      .map(row => {
        const item: any = { name: row.Kategori };
        item[selectedYear] = row[selectedYear] || 0;
        
        if (isComparison) {
          compareYears.forEach(year => {
            item[year] = row[year] || 0;
          });
        }
        return item;
      });
  }, [currentData, selectedCategories, selectedYear, isComparison, compareYears]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '32px' }}>
      
      <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', padding: '16px 24px', borderLeft: '4px solid var(--accent)' }}>
        <div>
          <h2 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Dashboard Administrasi MUTASI - GKI {churchName}
          </h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Menampilkan data mutasi anggota jemaat, termasuk pertambahan dan pengurangan.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn" onClick={exportPDF} style={{ padding: '8px 16px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={16} /> Export PDF
          </button>
          <button className="btn" onClick={exportPPTX} style={{ background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)', padding: '8px 16px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={16} /> Export PPTX
          </button>
        </div>
      </div>

      <div ref={dashboardRef} style={{ display: 'flex', flexDirection: 'column', gap: '24px', background: 'var(--bg-primary)', padding: '24px', borderRadius: '12px' }}>
        
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', background: 'rgba(255, 255, 255, 0.05)', padding: '16px', borderRadius: '8px' }}>
          <label style={{ fontWeight: 'bold', minWidth: '150px' }}>Pilih Tabel Laporan:</label>
          <select 
            value={activeTable} 
            onChange={e => setActiveTable(e.target.value)}
            style={{ padding: '8px 16px', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', flex: 1, minWidth: '250px' }}
          >
            {tableOptions.map(opt => (
              <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
          </select>
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
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontWeight: 'bold' }}>Filter Kategori Sumbu X:</label>
            <button 
              onClick={() => setSelectedCategories(selectedCategories.length === allCategories.length ? [] : allCategories)}
              style={{ padding: '4px 12px', fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '4px', color: 'var(--text-primary)', cursor: 'pointer' }}
            >
              {selectedCategories.length === allCategories.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', background: 'rgba(0,0,0,0.1)', padding: '12px', borderRadius: '8px', maxHeight: '150px', overflowY: 'auto' }}>
            {allCategories.map((cat: string) => (
              <label 
                key={cat} 
                style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.9rem', color: (cat.includes('Sub-Total') || cat.includes('ATATS')) ? '#fbbf24' : 'inherit' }}
                onClick={(e) => {
                  // Prevent the checkbox click from instantly resetting if we click the label text
                  if ((e.target as HTMLElement).tagName !== 'INPUT') {
                    setClickedCategory(prev => prev === cat ? null : cat);
                  }
                }}
              >
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

        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          
          <FullscreenWrapper className="glass-panel" style={{ flex: '2 1 600px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: '0 0 24px 0', textAlign: 'center', fontSize: '1.2rem' }}>
              Grafik {tableOptions.find(o => o.id === activeTable)?.label.substring(3)}
            </h3>
            
            {transformedChartData.length > 0 ? (
              <div style={{ height: '400px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={transformedChartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="name" 
                      stroke="var(--text-secondary)" 
                      angle={-45} 
                      textAnchor="end" 
                      height={80} 
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis stroke="var(--text-secondary)" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
                      itemStyle={{ color: 'var(--text-primary)' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" />
                    
                    <Bar dataKey={selectedYear} fill={COLORS[0]} name={selectedYear} radius={[4, 4, 0, 0]} />
                    
                    {isComparison && compareYears.map((year, idx) => (
                      <Bar key={year} dataKey={year} fill={COLORS[(idx + 1) % COLORS.length]} name={year} radius={[4, 4, 0, 0]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                Tidak ada kategori yang dipilih
              </div>
            )}
            
            <div style={{ marginTop: '24px', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--glass-border)' }}>
                    <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-secondary)' }}>Kategori</th>
                    <th style={{ padding: '12px', textAlign: 'right', color: 'var(--text-primary)' }}>{selectedYear}</th>
                    {isComparison && compareYears.map(year => (
                      <th key={year} style={{ padding: '12px', textAlign: 'right', color: 'var(--text-secondary)' }}>{year}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((row, i) => (
                    <tr 
                      key={i} 
                      style={{ 
                        borderBottom: '1px solid var(--glass-border)', 
                        background: clickedCategory === row.Kategori 
                          ? 'rgba(16, 185, 129, 0.2)' 
                          : row.Kategori?.includes('Sub-Total') || row.Kategori?.includes('ATATS') 
                            ? 'rgba(251, 191, 36, 0.1)' 
                            : 'transparent', 
                        transition: 'background 0.2s',
                        cursor: 'pointer'
                      }}
                      onClick={() => setClickedCategory(prev => prev === row.Kategori ? null : row.Kategori)}
                    >
                      <td style={{ padding: '12px', fontWeight: row.Kategori?.includes('Sub-Total') ? 'bold' : 'normal', color: row.Kategori?.includes('Sub-Total') || row.Kategori?.includes('ATATS') ? '#fbbf24' : 'inherit' }}>
                        {row.Kategori}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>
                        {row[selectedYear]?.toLocaleString('id-ID') || 0}
                      </td>
                      {isComparison && compareYears.map(year => (
                        <td key={year} style={{ padding: '12px', textAlign: 'right' }}>
                          {row[year]?.toLocaleString('id-ID') || 0}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', flexWrap: 'wrap', gap: '12px' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                💡 Klik baris data pada tabel di atas untuk melihat keterangan singkatan di data tersebut.
              </span>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500, color: '#10b981' }}>
                <input 
                  type="checkbox" 
                  checked={showAllKeterangan}
                  onChange={e => setShowAllKeterangan(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                Tampilkan seluruh keterangan
              </label>
            </div>

            {showAllKeterangan ? (
              <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: '#10b981' }}>
                  Seluruh Keterangan Singkatan
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {data.keterangan.map((ket, idx) => (
                    <div key={idx} style={{ padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
                      <strong style={{ color: '#fbbf24', display: 'block', marginBottom: '2px' }}>{ket.key}</strong>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{ket.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : relevantKeterangan.length > 0 && (
              <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: '#10b981', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Keterangan untuk: {clickedCategory}</span>
                  <button onClick={() => setClickedCategory(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {relevantKeterangan.map((ket, idx) => (
                    <div key={idx} style={{ padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
                      <strong style={{ color: '#fbbf24', display: 'block', marginBottom: '2px' }}>{ket.key}</strong>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{ket.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </FullscreenWrapper>

        </div>
      </div>
    </div>
  );
};

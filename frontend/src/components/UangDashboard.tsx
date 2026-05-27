import React, { useRef, useState, useMemo } from 'react';
import {
  BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart
} from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import pptxgen from 'pptxgenjs';
import { Filter, Download } from 'lucide-react';

interface Props {
  data: any[];
  churchName: string;
}

const colors = ['#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#14b8a6'];

export const UangDashboard: React.FC<Props> = ({ data, churchName }) => {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const chart1Ref = useRef<HTMLDivElement>(null);
  const chart2Ref = useRef<HTMLDivElement>(null);
  const chart3Ref = useRef<HTMLDivElement>(null);

  const availablePeriods = useMemo(() => {
    if (!data) return [];
    const periods = new Set<string>();
    data.forEach(row => {
      if (row['Tanggal']) {
        const match = String(row['Tanggal']).match(/^(\d{4}-\d{2})/);
        if (match) periods.add(match[1]);
      }
    });
    return Array.from(periods).sort();
  }, [data]);

  const availableJenis = useMemo(() => {
    if (!data) return [];
    const events = new Set<string>();
    data.forEach(row => {
      if (row['Jam']) events.add(row['Jam']);
    });
    return Array.from(events).sort();
  }, [data]);

  const [c1Time, setC1Time] = useState('1_month');
  const [c1Start, setC1Start] = useState(availablePeriods[0] || '');
  const [c1Jenis, setC1Jenis] = useState('Semua Jenis');
  const [c1CompareYear, setC1CompareYear] = useState(false);

  const [c2Time, setC2Time] = useState('1_month');
  const [c2Start, setC2Start] = useState(availablePeriods[0] || '');
  const [c2Jenis, setC2Jenis] = useState('Semua Jenis');
  const [c2CompareYear, setC2CompareYear] = useState(false);

  const [c3Time, setC3Time] = useState('1_year');
  const [c3Start, setC3Start] = useState(availablePeriods[0] || '');
  const [c3Jenis, setC3Jenis] = useState('Semua Jenis');

  const getEndPeriod = (start: string, monthsToAdd: number) => {
    const [year, month] = start.split('-').map(Number);
    let newMonth = month + monthsToAdd;
    let newYear = year;
    while (newMonth > 12) {
      newMonth -= 12;
      newYear += 1;
    }
    return `${newYear}-${String(newMonth).padStart(2, '0')}`;
  };

  const processChart = (
    timeFilter: string, 
    startPeriod: string, 
    jenisFilter: string, 
    compareYear: boolean, 
    metrics: { curr: string, prev?: string }
  ) => {
    if (!data || data.length === 0) return [];
    const grouped: Record<string, any> = {};
    const counts: Record<string, any> = {};

    let endPeriodStr = '9999-99';
    if (startPeriod) {
      if (timeFilter === '1_month') endPeriodStr = getEndPeriod(startPeriod, 1);
      else if (timeFilter === '3_months') endPeriodStr = getEndPeriod(startPeriod, 3);
      else if (timeFilter === '1_year') endPeriodStr = getEndPeriod(startPeriod, 12);
    }

    data.forEach(row => {
      const date = row['Tanggal'];
      const jam = row['Jam'];
      if (!date || !jam) return;
      const yyyy_mm = date.substring(0, 7);
      
      if (timeFilter !== '1_year' && startPeriod && (yyyy_mm < startPeriod || yyyy_mm >= endPeriodStr)) return;
      if (jenisFilter !== 'Semua Jenis' && jam !== jenisFilter) return;

      const plotByJam = (timeFilter === '1_month' && jenisFilter === 'Semua Jenis');
      let groupKey = plotByJam ? jam : yyyy_mm;

      const valCurr = parseFloat(row[metrics.curr]) || 0;
      const valPrev = metrics.prev ? (parseFloat(row[metrics.prev]) || 0) : null;

      if (!grouped[groupKey]) {
        grouped[groupKey] = { name: groupKey, sortDate: date, sortJam: jam };
        counts[groupKey] = {};
      }

      if (plotByJam) {
        grouped[groupKey][metrics.curr] = (grouped[groupKey][metrics.curr] || 0) + valCurr;
        if (metrics.prev && compareYear) {
          grouped[groupKey][metrics.prev] = (grouped[groupKey][metrics.prev] || 0) + valPrev!;
        }
      } else {
        const kCurr = jenisFilter === 'Semua Jenis' ? `Total ${metrics.curr}` : metrics.curr;
        grouped[groupKey][kCurr] = (grouped[groupKey][kCurr] || 0) + valCurr;
        
        if (metrics.prev && compareYear) {
          const kPrev = jenisFilter === 'Semua Jenis' ? `Total ${metrics.prev}` : metrics.prev;
          grouped[groupKey][kPrev] = (grouped[groupKey][kPrev] || 0) + valPrev!;
        }
      }
    });

    return Object.values(grouped).sort((a: any, b: any) => {
      if (a.sortDate !== b.sortDate) return a.sortDate.localeCompare(b.sortDate);
      return a.sortJam.localeCompare(b.sortJam);
    });
  };

  const chart1Data = processChart(c1Time, c1Start, c1Jenis, c1CompareYear, { curr: 'Penerimaan', prev: 'Penerimaan (Tahun Lalu)' });
  const chart2Data = processChart(c2Time, c2Start, c2Jenis, c2CompareYear, { curr: 'Rata-rata Penerimaan', prev: 'Rata-rata Penerimaan (Tahun Lalu)' });
  const chart3Data = processChart(c3Time, c3Start, c3Jenis, false, { curr: 'Akumulasi', prev: 'Rata-rata Akumulasi' });

  // For Chart 3, "Rata-rata Akumulasi" is passed in prev but it's not a previous year, it's a second metric.
  if (chart3Data.length > 0 && c3Jenis === 'Semua Jenis') {
    // If we plot all jenis over time, we just accumulate them.
    // However the combo chart might look very messy with many bars and lines.
  }

  const getKeys = (chartData: any[], excludes: string[]) => {
    if (chartData.length === 0) return [];
    return Object.keys(chartData[0]).filter(k => !excludes.includes(k) && k !== 'name' && k !== 'sortDate' && k !== 'sortJam');
  };

  const c1Keys = getKeys(chart1Data, []);
  const c2Keys = getKeys(chart2Data, []);
  
  // Custom keys for Chart 3
  const c3KeysBar = getKeys(chart3Data, []).filter(k => !k.includes('Rata-rata Akumulasi'));
  const c3KeysLine = getKeys(chart3Data, []).filter(k => k.includes('Rata-rata Akumulasi'));

  const formatXAxis = (tickItem: any) => {
    const matchMonth = String(tickItem).match(/^(\d{4})-(\d{2})$/);
    if (matchMonth) {
      const date = new Date(parseInt(matchMonth[1]), parseInt(matchMonth[2]) - 1, 1);
      return date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
    }
    const text = String(tickItem);
    return text.length > 18 ? text.substring(0, 18) + '...' : text;
  };

  const filterZeroData = (chartData: any[], chartKeys: string[]) => {
    const filtered: any[] = [];
    const hidden: string[] = [];
    
    chartData.forEach(row => {
      const allZero = chartKeys.every(k => !row[k] || row[k] === 0);
      if (allZero) {
        hidden.push(formatXAxis(row.name));
      } else {
        filtered.push(row);
      }
    });
    
    return { filtered, hidden };
  };

  const { filtered: f1Data, hidden: f1Hidden } = filterZeroData(chart1Data, c1Keys);
  const { filtered: f2Data, hidden: f2Hidden } = filterZeroData(chart2Data, c2Keys);
  const { filtered: f3Data, hidden: f3Hidden } = filterZeroData(chart3Data, [...c3KeysBar, ...c3KeysLine]);

  const renderTable = (chartData: any[], chartKeys: string[], filterText: string) => {
    return (
      <div style={{ width: '100%', background: 'var(--glass-bg)', padding: '16px', borderRadius: '12px', marginTop: '16px' }}>
        <h3 style={{ marginBottom: '16px', marginTop: 0 }}>Tabel Ringkasan Data ({filterText})</h3>
        <div className="table-responsive-wrapper" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr>
                <th style={{ padding: '8px', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}>Periode / Jenis</th>
                {chartKeys.map(key => <th key={key} style={{ padding: '8px', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}>{key}</th>)}
              </tr>
            </thead>
            <tbody>
              {chartData.map((row, i) => (
                <tr key={i} style={{ backgroundColor: i % 2 === 0 ? 'rgba(255, 255, 255, 0.03)' : 'transparent' }}>
                  <td style={{ padding: '8px', fontWeight: 'bold' }}>{formatXAxis(row.name)}</td>
                  {chartKeys.map(key => (
                    <td key={key} style={{ padding: '8px' }}>
                      {row[key] !== undefined ? `Rp ${Number(row[key]).toLocaleString('id-ID')}` : '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const exportPDF = async () => {
    if (!dashboardRef.current) return;
    try {
      const canvas = await html2canvas(dashboardRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'l' : 'p',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`GKI_${churchName ? churchName.replace(/\s+/g, '_') + '_' : ''}Dashboard_UANG.pdf`);
    } catch (error) {
      console.error('Failed to export PDF', error);
      alert('Gagal mengexport PDF');
    }
  };

  const exportPPTX = async () => {
    if (!dashboardRef.current) return;
    try {
      const pres = new pptxgen();
      
      const captureAndAddSlide = async (element: HTMLElement | null) => {
        if (!element) return;
        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const slide = pres.addSlide();
        
        const slideWidth = 10;
        const slideHeight = 5.625;
        const canvasRatio = canvas.width / canvas.height;
        const slideRatio = slideWidth / slideHeight;
        
        let targetW, targetH;
        if (canvasRatio > slideRatio) {
           targetW = slideWidth;
           targetH = slideWidth / canvasRatio;
        } else {
           targetH = slideHeight;
           targetW = slideHeight * canvasRatio;
        }
        
        const x = (slideWidth - targetW) / 2;
        const y = (slideHeight - targetH) / 2;

        slide.addImage({ data: imgData, x, y, w: targetW, h: targetH });
      };

      await captureAndAddSlide(dashboardRef.current);
      await captureAndAddSlide(chart1Ref.current);
      await captureAndAddSlide(chart2Ref.current);
      await captureAndAddSlide(chart3Ref.current);

      pres.writeFile({ fileName: `GKI_${churchName ? churchName.replace(/\s+/g, '_') + '_' : ''}Dashboard_UANG.pptx` });
    } catch (error) {
      console.error('Failed to export PPTX', error);
      alert('Gagal mengexport PPTX');
    }
  };


  const renderFilter = (
    time: string, setTime: any,
    start: string, setStart: any,
    jenis: string, setJenis: any,
    compYear: boolean | null, setCompYear: any
  ) => (
    <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
        <Filter size={18} /> <span style={{ fontWeight: 600 }}>Filter:</span>
      </div>
      
      <select value={time} onChange={e => setTime(e.target.value)} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 12px', borderRadius: '8px' }}>
        <option value="1_month" style={{ background: '#1e1e2d' }}>1 Bulan</option>
        <option value="3_months" style={{ background: '#1e1e2d' }}>3 Bulan</option>
        <option value="1_year" style={{ background: '#1e1e2d' }}>1 Tahun</option>
      </select>

      {time !== '1_year' && (
        <select value={start} onChange={e => setStart(e.target.value)} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 12px', borderRadius: '8px' }}>
          {availablePeriods.map(p => {
            const [y, m] = p.split('-');
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
            return <option key={p} value={p} style={{ background: '#1e1e2d' }}>{`${months[parseInt(m)-1]} ${y}`}</option>
          })}
        </select>
      )}

      <select value={jenis} onChange={e => setJenis(e.target.value)} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 12px', borderRadius: '8px' }}>
        <option value="Semua Jenis" style={{ background: '#1e1e2d' }}>Semua Jenis</option>
        {availableJenis.map(j => <option key={j} value={j} style={{ background: '#1e1e2d' }}>{j}</option>)}
      </select>

      {compYear !== null && (
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input type="checkbox" checked={compYear} onChange={e => setCompYear(e.target.checked)} />
          Bandingkan dengan tahun sebelumnya
        </label>
      )}
    </div>
  );

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '100vw', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <h2>Dashboard Laporan: <span style={{ color: 'var(--accent)' }}>UANG</span></h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={exportPDF} className="btn">
            <Download size={18} /> Export PDF
          </button>
          <button onClick={exportPPTX} className="btn" style={{ background: '#d97706' }}>
            <Download size={18} /> Export PPTX
          </button>
        </div>
      </div>

      <div ref={dashboardRef} style={{ background: 'var(--bg-color)', padding: '24px', borderRadius: '16px' }}>
        
        {/* Chart 1 */}
        <div ref={chart1Ref} className="glass-panel chart-container" style={{ marginBottom: '32px' }}>
          <h3 style={{ marginBottom: '16px' }}>Perbandingan Penerimaan Antarbulan</h3>
          {renderFilter(c1Time, setC1Time, c1Start, setC1Start, c1Jenis, setC1Jenis, c1CompareYear, setC1CompareYear)}
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={f1Data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" tickFormatter={formatXAxis} angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="rgba(255,255,255,0.5)" tickFormatter={(value) => `Rp ${value.toLocaleString('id-ID')}`} width={100} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                formatter={(value: any, name: any) => [`Rp ${Number(value).toLocaleString('id-ID')}`, name]}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              {c1Keys.map((k, idx) => (
                <Bar key={k} dataKey={k} fill={colors[idx % colors.length]} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
          {renderTable(f1Data, c1Keys, `${c1Time === '1_month' ? '1 Bulan' : c1Time === '3_months' ? '3 Bulan' : '1 Tahun'} - ${c1Jenis}`)}
          {f1Hidden.length > 0 && (
            <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(255, 100, 100, 0.05)', borderLeft: '4px solid var(--accent)', borderRadius: '4px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: 'white' }}>Catatan Metrik Kosong & Disembunyikan:</p>
              <p style={{ margin: 0, lineHeight: '1.5' }}>
                Berikut adalah kolom-kolom rekap "Jumlah" atau metrik yang datanya terdeteksi kosong (0) di periode ini: <strong>{f1Hidden.join(', ')}</strong>. Kolom tersebut disembunyikan agar grafik lebih rapi.
              </p>
            </div>
          )}
        </div>

        {/* Chart 2 */}
        <div ref={chart2Ref} className="glass-panel chart-container" style={{ marginBottom: '32px' }}>
          <h3 style={{ marginBottom: '16px' }}>Perbandingan Penerimaan dengan Kehadiran Jemaat (Rata-rata)</h3>
          {renderFilter(c2Time, setC2Time, c2Start, setC2Start, c2Jenis, setC2Jenis, c2CompareYear, setC2CompareYear)}
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={f2Data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" tickFormatter={formatXAxis} angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="rgba(255,255,255,0.5)" tickFormatter={(value) => `Rp ${value.toLocaleString('id-ID')}`} width={100} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                formatter={(value: any, name: any) => [`Rp ${Number(value).toLocaleString('id-ID')}`, name]}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              {c2Keys.map((k, idx) => (
                <Bar key={k} dataKey={k} fill={colors[idx % colors.length]} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
          {renderTable(f2Data, c2Keys, `${c2Time === '1_month' ? '1 Bulan' : c2Time === '3_months' ? '3 Bulan' : '1 Tahun'} - ${c2Jenis}`)}
          {f2Hidden.length > 0 && (
            <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(255, 100, 100, 0.05)', borderLeft: '4px solid var(--accent)', borderRadius: '4px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: 'white' }}>Catatan Metrik Kosong & Disembunyikan:</p>
              <p style={{ margin: 0, lineHeight: '1.5' }}>
                Berikut adalah kolom-kolom rekap "Jumlah" atau metrik yang datanya terdeteksi kosong (0) di periode ini: <strong>{f2Hidden.join(', ')}</strong>. Kolom tersebut disembunyikan agar grafik lebih rapi.
              </p>
            </div>
          )}
        </div>

        {/* Chart 3 */}
        <div ref={chart3Ref} className="glass-panel chart-container" style={{ marginBottom: '32px' }}>
          <h3 style={{ marginBottom: '16px' }}>Perbandingan Akumulasi Total Selama 1 Tahun</h3>
          {renderFilter(c3Time, setC3Time, c3Start, setC3Start, c3Jenis, setC3Jenis, null, null)}
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={f3Data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" tickFormatter={formatXAxis} angle={-45} textAnchor="end" height={80} />
              <YAxis yAxisId="left" stroke="rgba(255,255,255,0.5)" tickFormatter={(value) => `Rp ${value.toLocaleString('id-ID')}`} width={100} />
              <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.5)" tickFormatter={(value) => `Rp ${value.toLocaleString('id-ID')}`} width={100} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                formatter={(value: any, name: any) => [`Rp ${Number(value).toLocaleString('id-ID')}`, name]}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              
              {c3KeysBar.map((k, idx) => (
                <Bar key={k} dataKey={k} yAxisId="left" fill={colors[idx % colors.length]} radius={[4, 4, 0, 0]} />
              ))}
              
              {c3KeysLine.map((k, idx) => (
                <Line key={k} type="monotone" dataKey={k} yAxisId="right" stroke={colors[(idx + 4) % colors.length]} strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
          {renderTable(f3Data, [...c3KeysBar, ...c3KeysLine], `${c3Time === '1_month' ? '1 Bulan' : c3Time === '3_months' ? '3 Bulan' : '1 Tahun'} - ${c3Jenis}`)}
          {f3Hidden.length > 0 && (
            <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(255, 100, 100, 0.05)', borderLeft: '4px solid var(--accent)', borderRadius: '4px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: 'white' }}>Catatan Metrik Kosong & Disembunyikan:</p>
              <p style={{ margin: 0, lineHeight: '1.5' }}>
                Berikut adalah kolom-kolom rekap "Jumlah" atau metrik yang datanya terdeteksi kosong (0) di periode ini: <strong>{f3Hidden.join(', ')}</strong>. Kolom tersebut disembunyikan agar grafik lebih rapi.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

import { exportPDF as _exportPDF, exportPPTX as _exportPPTX } from '../utils/exportUtils';
import React, { useRef, useState, useMemo, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Download, Filter } from 'lucide-react';
import { UangDashboard } from './UangDashboard';

const formatMetricLabel = (name: string, sheetName?: string, isYearly?: boolean) => {
  if (!name) return name;
  let label = name;
  
  if (sheetName === 'RAPAT' && isYearly) {
     if (label === 'Jumlah Kehadiran') return 'Rata-Rata Kehadiran Bulanan';
     if (label === 'Jumlah Kehadiran Pria') return 'Rata-Rata Kehadiran Pria Bulanan';
     if (label === 'Jumlah Kehadiran Wanita') return 'Rata-Rata Kehadiran Wanita Bulanan';
     if (label === 'Jumlah Anggota') return 'Rata-Rata Anggota Bulanan';
  }

  if (label === 'Sub Total Jemaat Jumlah') return 'Sub Total Jemaat';
  if (label === 'Total On-site Jumlah') return 'Total On-site';
  if (label.endsWith(' Jumlah')) return `Total ${label.replace(' Jumlah', '')}`;
  return label;
};

const formatChartKey = (key: string, sheetName?: string, isYearly?: boolean) => {
  if (!key) return key;
  const match = key.match(/^(.*?) \((.*)\)$/);
  if (match) {
    return `${match[1]} (${formatMetricLabel(match[2], sheetName, isYearly)})`;
  }
  return formatMetricLabel(key, sheetName, isYearly);
};

interface DashboardProps {
  data: any[];
  yearlyData?: any[];
  sheetName: string;
  churchName: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ data, yearlyData = [], sheetName, churchName }) => {
  const dashboardRef = useRef<HTMLDivElement>(null);

  const exportPDF = () => _exportPDF(dashboardRef, churchName, sheetName);
  const exportPPTX = () => _exportPPTX([dashboardRef, chartRef, tableRef], churchName, sheetName);

  const chartRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const isSupportedChartSheet = sheetName === 'Keb. Minggu' || sheetName === 'Keb. Kategorial' || sheetName === 'Pers. Kategorial' || sheetName === 'Pers. Lainnya' || sheetName === 'Perayaan' || sheetName === 'RAPAT';
  
  const allKebMingguMetrics = useMemo(() => {
    if (!isSupportedChartSheet || !data || data.length === 0) return [];
    return Object.keys(data[0]).filter(k => {
      if (k === 'Tanggal' || k === 'Jam' || k === 'name' || k === 'sortDate' || k === 'Jumlah Anggota') return false;
      return true;
    });
  }, [isSupportedChartSheet, data, sheetName]);

  const { activeMetrics } = useMemo(() => {
    const active: string[] = [];
    const empty: string[] = [];
    if (allKebMingguMetrics.length === 0) return { activeMetrics: active, emptyMetrics: empty };
    
    allKebMingguMetrics.forEach(metric => {
      const hasData = data.some(row => parseFloat(row[metric]) > 0);
      if (hasData || metric === 'Total Kehadiran' || metric === 'Jumlah Kehadiran') {
        active.push(metric);
      } else {
        empty.push(metric);
      }
    });

    if (active.length === 0 && allKebMingguMetrics.length > 0) {
      return { activeMetrics: allKebMingguMetrics, emptyMetrics: [] };
    }

    return { activeMetrics: active, emptyMetrics: empty };
  }, [allKebMingguMetrics, data]);

  const availablePeriods = useMemo(() => {
    if (!isSupportedChartSheet || !data) return [];
    const periods = new Set<string>();
    data.forEach(row => {
      if (row['Tanggal']) periods.add(row['Tanggal'].substring(0, 7));
    });
    return Array.from(periods).sort();
  }, [data, isSupportedChartSheet]);

  const availableYears = useMemo(() => {
    if (!yearlyData) return [];
    const years = new Set<string>();
    yearlyData.forEach(row => {
      if (row['Tanggal']) years.add(row['Tanggal']);
    });
    return Array.from(years).sort();
  }, [yearlyData]);

  const [selectedMetric, setSelectedMetric] = useState<string>('Total Kehadiran');
  const [compareMetric, setCompareMetric] = useState<string>('');
  const [yearlyMetric, setYearlyMetric] = useState<string>('Total Kehadiran');
  const [yearlyCompareMetric, setYearlyCompareMetric] = useState<string>('');
  const [timeFilter, setTimeFilter] = useState('1_month');
  const [startPeriod, setStartPeriod] = useState<string>('');
  const [perayaanFilter, setPerayaanFilter] = useState('Semua Perayaan');
  const [perayaanCompare1, setPerayaanCompare1] = useState('');
  const [perayaanCompare2, setPerayaanCompare2] = useState('');
  const [perayaanCompare3, setPerayaanCompare3] = useState('');

  const [yearlyPerayaanFilter, setYearlyPerayaanFilter] = useState('Semua Perayaan');
  const [yearlyPerayaanCompare1, setYearlyPerayaanCompare1] = useState('');
  const [yearlyPerayaanCompare2, setYearlyPerayaanCompare2] = useState('');
  const [yearlyPerayaanCompare3, setYearlyPerayaanCompare3] = useState('');

  const [yearlyYearFilter, setYearlyYearFilter] = useState('Semua Tahun');
  const [yearlyYearCompare, setYearlyYearCompare] = useState('');

  const [kategorialFilter, setKategorialFilter] = useState('Semua Kategorial');
  const [rapatFilter, setRapatFilter] = useState('Semua Rapat');
  const jamFilter = 'Semua';

  const availablePerayaan = useMemo(() => {
    if (sheetName !== 'Perayaan' || !data) return [];
    const events = new Set<string>();
    data.forEach(row => {
      if (row['Jam']) events.add(row['Jam']);
    });
    return Array.from(events);
  }, [data, sheetName]);

  const availableKategorial = useMemo(() => {
    if ((sheetName !== 'Keb. Kategorial' && sheetName !== 'Pers. Kategorial' && sheetName !== 'Pers. Lainnya') || !data) return [];
    const events = new Set<string>();
    data.forEach(row => {
      if (row['Jam']) events.add(row['Jam']);
    });
    return Array.from(events).sort();
  }, [data, sheetName]);

  const availableRapat = useMemo(() => {
    if (sheetName !== 'RAPAT' || !data) return [];
    const events = new Set<string>();
    data.forEach(row => {
      if (row['Jam']) events.add(row['Jam']);
    });
    return Array.from(events).sort();
  }, [data, sheetName]);

  useEffect(() => {
    if (availablePerayaan.length > 0 && perayaanFilter !== 'Semua Perayaan' && !availablePerayaan.includes(perayaanFilter)) {
      setPerayaanFilter('Semua Perayaan');
    }
  }, [availablePerayaan, perayaanFilter]);

  useEffect(() => {
    if (availableKategorial.length > 0 && kategorialFilter !== 'Semua Kategorial' && !availableKategorial.includes(kategorialFilter)) {
      setKategorialFilter('Semua Kategorial');
    }
  }, [availableKategorial, kategorialFilter]);

  useEffect(() => {
    if (availableRapat.length > 0 && rapatFilter !== 'Semua Rapat' && !availableRapat.includes(rapatFilter)) {
      setRapatFilter('Semua Rapat');
    }
  }, [availableRapat, rapatFilter]);

  useEffect(() => {
    if (availablePeriods.length > 0 && (!startPeriod || !availablePeriods.includes(startPeriod))) {
      setStartPeriod(availablePeriods[0]);
    }
  }, [availablePeriods, startPeriod]);

  useEffect(() => {
    if (isSupportedChartSheet && activeMetrics.length > 0) {
      if (!activeMetrics.includes(selectedMetric)) {
        setSelectedMetric(activeMetrics.includes('Total Kehadiran') ? 'Total Kehadiran' : (activeMetrics.includes('Jumlah Kehadiran') ? 'Jumlah Kehadiran' : activeMetrics[0]));
      }
      if (!activeMetrics.includes(yearlyMetric)) {
        setYearlyMetric(activeMetrics.includes('Total Kehadiran') ? 'Total Kehadiran' : (activeMetrics.includes('Jumlah Kehadiran') ? 'Jumlah Kehadiran' : activeMetrics[0]));
      }
    }
    setCompareMetric('');
    setYearlyCompareMetric('');
  }, [activeMetrics, sheetName]);

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

  const processChartData = () => {
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
      let groupKey = (timeFilter === '1_year' && sheetName !== 'Perayaan') ? yyyy_mm : date;
      let selectedEvents: string[] = [];
      if (sheetName === 'Perayaan') {
        groupKey = `${date} - ${jam}`;
        selectedEvents = [perayaanFilter, perayaanCompare1, perayaanCompare2, perayaanCompare3].filter(x => x && x !== 'Semua Perayaan');
        if (perayaanFilter !== 'Semua Perayaan' && !selectedEvents.includes(jam)) return;
      } else {
        if ((sheetName === 'Keb. Kategorial' || sheetName === 'Pers. Kategorial' || sheetName === 'Pers. Lainnya') && kategorialFilter !== 'Semua Kategorial') {
          if (jam !== kategorialFilter) return;
        }
        if (sheetName === 'RAPAT' && rapatFilter !== 'Semua Rapat') {
          if (jam !== rapatFilter) return;
        }
        if (timeFilter !== '1_year' && startPeriod && (yyyy_mm < startPeriod || yyyy_mm >= endPeriodStr)) return;
      }
      const val1 = parseFloat(row[selectedMetric]) || 0;
      const val2 = compareMetric ? (parseFloat(row[compareMetric]) || 0) : null;
      if (!grouped[groupKey]) {
        grouped[groupKey] = { name: groupKey, sortDate: (timeFilter === '1_year' && sheetName !== 'Perayaan') ? yyyy_mm : date };
        counts[groupKey] = {};
      }
      if (sheetName === 'Perayaan') {
        if (perayaanFilter === 'Semua Perayaan' || selectedEvents.length > 1) {
          grouped[groupKey][selectedMetric] = val1;
        } else if (selectedEvents.length === 1) {
          activeMetrics.forEach(metric => {
            const lower = metric.toLowerCase();
            if (!lower.includes('sub total') && !lower.includes('on-site') && !lower.includes('total kehadiran')) {
              grouped[groupKey][metric] = parseFloat(row[metric]) || 0;
            }
          });
        }
      } else {
        if (compareMetric) {
           const k1 = `${jam} (${selectedMetric})`;
           const k2 = `${jam} (${compareMetric})`;
           if (timeFilter === '1_year') {
             grouped[groupKey][k1] = (grouped[groupKey][k1] || 0) + val1;
             grouped[groupKey][k2] = (grouped[groupKey][k2] || 0) + (val2 || 0);
             counts[groupKey][k1] = (counts[groupKey][k1] || 0) + 1;
             counts[groupKey][k2] = (counts[groupKey][k2] || 0) + 1;
           } else {
             grouped[groupKey][k1] = val1;
             grouped[groupKey][k2] = val2;
           }
        } else {
           if (timeFilter === '1_year') {
             grouped[groupKey][jam] = (grouped[groupKey][jam] || 0) + val1;
             counts[groupKey][jam] = (counts[groupKey][jam] || 0) + 1;
           } else {
             grouped[groupKey][jam] = val1;
           }
        }
      }
    });
    if (timeFilter === '1_year') {
      Object.keys(grouped).forEach(key => {
        Object.keys(counts[key]).forEach(jam => {
          grouped[key][jam] = Math.round(grouped[key][jam] / counts[key][jam]);
        });
      });
    }
    return Object.values(grouped).sort((a: any, b: any) => a.sortDate.localeCompare(b.sortDate));
  };

  const processYearlyData = () => {
    if (!yearlyData || yearlyData.length === 0) return [];
    const grouped: Record<string, any> = {};
    yearlyData.forEach(row => {
      const year = row['Tanggal'];
      const jam = row['Jam'];
      if (!year || !jam) return;
      
      if (yearlyYearFilter !== 'Semua Tahun') {
         if (year !== yearlyYearFilter && year !== yearlyYearCompare) return;
      }

      const val1 = parseFloat(row[yearlyMetric]) || 0;
      const val2 = yearlyCompareMetric ? (parseFloat(row[yearlyCompareMetric]) || 0) : null;
      let selectedEvents: string[] = [];
      if (sheetName === 'Perayaan') {
        selectedEvents = [yearlyPerayaanFilter, yearlyPerayaanCompare1, yearlyPerayaanCompare2, yearlyPerayaanCompare3].filter(x => x && x !== 'Semua Perayaan');
        if (yearlyPerayaanFilter !== 'Semua Perayaan' && !selectedEvents.includes(jam)) return;
      } else if (sheetName === 'Keb. Kategorial' || sheetName === 'Pers. Kategorial' || sheetName === 'Pers. Lainnya') {
         if (kategorialFilter !== 'Semua Kategorial' && jam !== kategorialFilter) return;
      } else if (sheetName === 'RAPAT') {
         if (rapatFilter !== 'Semua Rapat' && jam !== rapatFilter) return;
      } else if (jamFilter !== 'Semua') {
         if (sheetName !== 'Keb. Minggu' && jam !== jamFilter) return;
      }
        let groupName = jam;
        const currentFilter = (sheetName === 'Keb. Kategorial' || sheetName === 'Pers. Kategorial' || sheetName === 'Pers. Lainnya') ? kategorialFilter : (sheetName === 'RAPAT' ? rapatFilter : jamFilter);
        
        if (sheetName !== 'Perayaan' && sheetName !== 'Keb. Minggu' && sheetName !== 'RAPAT' && (currentFilter === 'Semua' || currentFilter === 'Semua Kategorial' || currentFilter === 'Semua Rapat')) {
            groupName = 'Semua Jam';
        }

        if (!grouped[groupName]) grouped[groupName] = { name: groupName };
        if (sheetName === 'Perayaan') {
          grouped[groupName][year] = val1;
        } else {
          if (sheetName !== 'Keb. Minggu' && sheetName !== 'RAPAT' && groupName === 'Semua Jam') {
             if (yearlyCompareMetric) {
                const k1 = `${year} (${yearlyMetric})`;
                const k2 = `${year} (${yearlyCompareMetric})`;
                grouped[groupName][k1] = (grouped[groupName][k1] || 0) + val1;
                grouped[groupName][k2] = (grouped[groupName][k2] || 0) + (val2 || 0);
             } else grouped[groupName][year] = (grouped[groupName][year] || 0) + val1;
          } else {
             if (yearlyCompareMetric) {
                const k1 = `${year} (${yearlyMetric})`;
                const k2 = `${year} (${yearlyCompareMetric})`;
                grouped[groupName][k1] = val1;
                grouped[groupName][k2] = val2;
             } else grouped[groupName][year] = val1;
          }
        }
    });
    return Object.values(grouped);
  };

  const chartData = processChartData();
  const yearlyChartData = processYearlyData();
  
  const sortKeysFn = (a: string, b: string, primaryMetric: string) => {
    const matchA = a.match(/^(.*?) \((.*)\)$/);
    const matchB = b.match(/^(.*?) \((.*)\)$/);
    if (matchA && matchB) {
      const jamA = matchA[1];
      const jamB = matchB[1];
      if (jamA !== jamB) return jamA.localeCompare(jamB);
      if (matchA[2] === primaryMetric && matchB[2] !== primaryMetric) return -1;
      if (matchB[2] === primaryMetric && matchA[2] !== primaryMetric) return 1;
    }
    return a.localeCompare(b);
  };

  const chartKeys = useMemo(() => {
    if (chartData.length === 0) return [];
    const keys = new Set<string>();
    chartData.forEach(row => {
      Object.keys(row).forEach(k => {
        if (k !== 'name' && k !== 'sortDate' && !k.includes('Jumlah Anggota')) {
          keys.add(k);
        }
      });
    });
    return Array.from(keys).sort((a, b) => sortKeysFn(a, b, selectedMetric));
  }, [chartData, selectedMetric]);

  const yearlyChartKeys = useMemo(() => {
    if (yearlyChartData.length === 0) return [];
    const keys = new Set<string>();
    yearlyChartData.forEach(row => {
      Object.keys(row).forEach(k => {
        if (k !== 'name' && !k.includes('Jumlah Anggota')) {
          keys.add(k);
        }
      });
    });
    return Array.from(keys).sort((a, b) => a.localeCompare(b));
  }, [yearlyChartData]);
  
  const chartEmptyMetrics = chartKeys.filter(k => chartData.every(row => !row[k] || row[k] === 0));
  const chartActiveKeys = chartKeys.filter(k => !chartEmptyMetrics.includes(k));

  const yearlyEmptyMetrics = yearlyChartKeys.filter(k => yearlyChartData.every(row => !row[k] || row[k] === 0));
  const activeYearlyKeys = yearlyChartKeys.filter(k => !yearlyEmptyMetrics.includes(k));
  
  const emptyYearlyRows: string[] = [];
  const activeYearlyChartData = yearlyChartData.filter(row => {
    const hasData = activeYearlyKeys.some(key => row[key] && row[key] !== 0);
    if (!hasData) emptyYearlyRows.push(row.name);
    return hasData;
  });

  const colors = ['#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#14b8a6'];

  let jumlahAnggotaRapat: number | null = null;
  if (sheetName === 'RAPAT' && rapatFilter !== 'Semua Rapat' && data) {
    const row = data.find(r => r['Jam'] === rapatFilter);
    if (row && row['Jumlah Anggota']) {
      jumlahAnggotaRapat = row['Jumlah Anggota'];
    }
  }

  const getColorForKey = (key: string, idx: number) => {
    if (key.includes('KU 1')) return colors[0];
    if (key.includes('KU 2')) return colors[1];
    if (key.includes('KU 3')) return colors[2];
    if (key.includes('KU 4')) return colors[3];
    if (key.includes('KU 5')) return colors[4];
    if (key.includes('Anak')) return colors[0];
    if (key.includes('Remaja')) return colors[1];
    if (key.includes('Pemuda')) return colors[2];
    if (key.includes('Dewasa')) return colors[3];
    if (key.includes('Lansia') || key.includes('Senior')) return colors[4];
    return colors[idx % colors.length];
  };

  const formatXAxis = (tickItem: any) => {
    if (typeof tickItem === 'string') {
      let datePart = tickItem;
      let jamPart = '';
      if (tickItem.includes(' - ')) {
        const parts = tickItem.split(' - ');
        datePart = parts[0];
        jamPart = ` - ${parts[1]}`;
      }
      const match = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (match) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
        return `${match[3]} ${months[parseInt(match[2], 10) - 1]}${jamPart}`;
      }
      const matchMonth = datePart.match(/^(\d{4})-(\d{2})$/);
      if (matchMonth) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
        return `${months[parseInt(matchMonth[2], 10) - 1]} ${matchMonth[1]}${jamPart}`;
      }
    }
    return tickItem;
  };

  const getTitle = () => {
    if (sheetName === 'Perayaan') {
      if (perayaanFilter === 'Semua Perayaan') return `Semua Perayaan - ${formatMetricLabel(selectedMetric, sheetName, false)}`;
      const selectedEvents = [perayaanFilter, perayaanCompare1, perayaanCompare2, perayaanCompare3].filter(x => x && x !== 'Semua Perayaan');
      return `${selectedEvents.join(', ')} - ${formatMetricLabel(selectedMetric, sheetName, false)}`;
    }
    if (compareMetric) return `${formatMetricLabel(selectedMetric, sheetName, false)} vs ${formatMetricLabel(compareMetric, sheetName, false)}`;
    return formatMetricLabel(selectedMetric, sheetName, false);
  };
  const activeFilterText = useMemo(() => getTitle(), [sheetName, perayaanFilter, perayaanCompare1, perayaanCompare2, perayaanCompare3, selectedMetric, compareMetric]);

  if (sheetName === 'UANG') {
    return <UangDashboard data={data} churchName={churchName} />;
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '100vw', overflow: 'hidden' }}>
      <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', padding: '16px 24px', borderLeft: '4px solid var(--accent)' }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
          Dashboard Laporan: <span style={{ color: 'var(--accent)' }}>{sheetName}</span>
        </h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn" onClick={exportPDF} style={{ padding: '8px 16px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={16} /> Export PDF
          </button>
          <button className="btn" onClick={exportPPTX} style={{ background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)', padding: '8px 16px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={16} /> Export PPTX
          </button>
        </div>
      </div>

      <div ref={dashboardRef} style={{ background: 'var(--bg-color)', padding: '24px', borderRadius: '16px' }}>
        <div className="glass-panel chart-container" style={{ marginTop: '0px' }}>
            {isSupportedChartSheet && availablePeriods.length > 0 && sheetName !== 'Perayaan' && (
              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                  <Filter size={18} /> <span style={{ fontWeight: 600 }}>Filter Waktu:</span>
                </div>
                
                <select 
                  value={timeFilter} 
                  onChange={(e) => setTimeFilter(e.target.value)}
                  style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 12px', borderRadius: '8px', outline: 'none' }}
                >
                  <option value="1_month" style={{ background: '#1e1e2d' }}>1 Bulan (Data Harian)</option>
                  <option value="3_months" style={{ background: '#1e1e2d' }}>3 Bulan (Data Harian)</option>
                  <option value="1_year" style={{ background: '#1e1e2d' }}>1 Tahun (Agregasi Rata-rata Bulanan)</option>
                </select>

                {timeFilter !== '1_year' && (
                  <>
                    <span style={{ color: 'var(--text-secondary)' }}>mulai dari</span>
    
                    <select 
                      value={startPeriod} 
                      onChange={(e) => setStartPeriod(e.target.value)}
                      style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 12px', borderRadius: '8px', outline: 'none' }}
                    >
                      {availablePeriods.map(p => {
                        const [y, m] = p.split('-');
                        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
                        return <option key={p} value={p} style={{ background: '#1e1e2d' }}>{`${months[parseInt(m)-1]} ${y}`}</option>
                      })}
                    </select>
                  </>
                )}
              </div>
            )}

            {sheetName === 'Perayaan' && availablePerayaan.length > 0 && (
              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                  <Filter size={18} /> <span style={{ fontWeight: 600 }}>Filter Perayaan:</span>
                </div>
                
                <select 
                  value={perayaanFilter} 
                  onChange={(e) => {
                    setPerayaanFilter(e.target.value);
                    if (e.target.value === 'Semua Perayaan') {
                      setPerayaanCompare1('');
                      setPerayaanCompare2('');
                      setPerayaanCompare3('');
                    }
                  }}
                  style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 12px', borderRadius: '8px', outline: 'none' }}
                >
                  <option value="Semua Perayaan" style={{ background: '#1e1e2d' }}>Semua Perayaan</option>
                  {availablePerayaan.map(p => (
                    <option key={p} value={p} style={{ background: '#1e1e2d' }}>{p}</option>
                  ))}
                </select>

                {perayaanFilter !== 'Semua Perayaan' && (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: '12px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Bandingkan:</span>
                    {[
                      { val: perayaanCompare1, set: setPerayaanCompare1 },
                      { val: perayaanCompare2, set: setPerayaanCompare2 },
                      { val: perayaanCompare3, set: setPerayaanCompare3 },
                    ].map((comp, idx) => (
                      <select 
                        key={idx}
                        value={comp.val} 
                        onChange={(e) => comp.set(e.target.value)}
                        style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '8px', borderRadius: '8px', outline: 'none', fontSize: '0.9em' }}
                      >
                        <option value="" style={{ background: '#1e1e2d' }}>(Kosong)</option>
                        {availablePerayaan.filter(p => p !== perayaanFilter).map(p => 
                          <option key={p} value={p} style={{ background: '#1e1e2d' }}>{p}</option>
                        )}
                      </select>
                    ))}
                  </div>
                )}
              </div>
            )}

            {(sheetName === 'Keb. Kategorial' || sheetName === 'Pers. Kategorial' || sheetName === 'Pers. Lainnya') && availableKategorial.length > 0 && (
              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                  <Filter size={18} /> <span style={{ fontWeight: 600 }}>Jenis Kebaktian:</span>
                </div>
                
                <select 
                  value={kategorialFilter} 
                  onChange={(e) => setKategorialFilter(e.target.value)}
                  style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 12px', borderRadius: '8px', outline: 'none' }}
                >
                  <option value="Semua Kategorial" style={{ background: '#1e1e2d' }}>Semua Kategorial</option>
                  {availableKategorial.map(p => (
                    <option key={p} value={p} style={{ background: '#1e1e2d' }}>{p}</option>
                  ))}
                </select>
              </div>
            )}

            {sheetName === 'RAPAT' && availableRapat.length > 0 && (
              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                  <Filter size={18} /> <span style={{ fontWeight: 600 }}>Jenis Persidangan:</span>
                </div>
                
                <select 
                  value={rapatFilter} 
                  onChange={(e) => setRapatFilter(e.target.value)}
                  style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 12px', borderRadius: '8px', outline: 'none' }}
                >
                  <option value="Semua Rapat" style={{ background: '#1e1e2d' }}>Semua Rapat</option>
                  {availableRapat.map(p => (
                    <option key={p} value={p} style={{ background: '#1e1e2d' }}>{p}</option>
                  ))}
                </select>
              </div>
            )}

            {chartKeys.length > 0 ? (
              <>
                <div ref={chartRef} style={{ background: 'var(--glass-bg)', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
              
              {jumlahAnggotaRapat !== null && (
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', display: 'inline-block' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Jumlah Anggota ({rapatFilter}): </span>
                  <span style={{ fontSize: '1.1em', fontWeight: 'bold', color: '#60a5fa' }}>{jumlahAnggotaRapat}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
                <h3 style={{ margin: 0 }}>Grafik Perbandingan</h3>
                {isSupportedChartSheet && activeMetrics.length > 0 && (
                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                  {!(sheetName === 'Perayaan' && perayaanFilter !== 'Semua Perayaan' && !perayaanCompare1 && !perayaanCompare2 && !perayaanCompare3) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '12px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Metrik:</span>
                      <select 
                        value={selectedMetric} 
                        onChange={(e) => setSelectedMetric(e.target.value)}
                        style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 12px', borderRadius: '8px', outline: 'none' }}
                      >
                        {activeMetrics.map(m => <option key={m} value={m} style={{ background: '#1e1e2d' }}>{formatMetricLabel(m, sheetName, false)}</option>)}
                      </select>
                      
                      {sheetName !== 'Perayaan' && (
                        <>
                          <span style={{ color: 'var(--text-secondary)' }}>vs</span>
                          <select 
                            value={compareMetric} 
                            onChange={(e) => setCompareMetric(e.target.value)}
                            style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 12px', borderRadius: '8px', outline: 'none' }}
                          >
                            <option value="" style={{ background: '#1e1e2d' }}>(Tanpa Pembanding)</option>
                            {activeMetrics.filter(m => m !== selectedMetric).map(m => 
                              <option key={m} value={m} style={{ background: '#1e1e2d' }}>{formatMetricLabel(m, sheetName, false)}</option>
                            )}
                          </select>
                        </>
                      )}
                    </div>
                  )}      
                </div>
                )}
              </div>
              
              {chartKeys.length > 0 ? (
                <div style={{ width: '100%', height: '400px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                      <XAxis dataKey="name" tickFormatter={d => { const fmt = formatXAxis(d); return typeof fmt === 'string' ? fmt.split(' - ')[0] : fmt; }} stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)' }} axisLine={false} tickLine={false} dy={10} />
                      <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)' }} axisLine={false} tickLine={false} dx={-10} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)', color: '#fff' }} itemStyle={{ color: '#fff' }} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} formatter={(value: any, name: any) => [value, formatChartKey(name as string, sheetName, false)]} labelFormatter={(label) => formatXAxis(label)} />
                      <Legend wrapperStyle={{ paddingTop: '20px' }} formatter={(value: any) => formatChartKey(value as string, sheetName, false)} />
                      {chartActiveKeys.map((key, idx) => (
                        <Bar key={`bar-${key}`} dataKey={key} fill={getColorForKey(key, idx)} fillOpacity={key.includes(compareMetric) && compareMetric !== '' ? 0.6 : 1} radius={[4, 4, 0, 0]} />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div style={{ width: '100%', padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', marginTop: '16px' }}>
                  <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Tidak ada data yang dapat ditampilkan pada grafik.</p>
                </div>
              )}
            </div>

            {chartKeys.length > 0 && (
              <>
                <div ref={tableRef} style={{ width: '100%', background: 'var(--glass-bg)', padding: '16px', borderRadius: '12px' }}>
                  <h3 style={{ marginBottom: '16px', marginTop: 0 }}>Tabel Ringkasan Data (Teraplikasi Filter: {activeFilterText})</h3>
                  <div className="table-responsive-wrapper">
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                      <thead>
                        <tr>
                        <th style={{ padding: '8px', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}>Tanggal</th>
                        {chartActiveKeys.map(key => <th key={key} style={{ padding: '8px', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}>{formatChartKey(key, sheetName, false)}</th>)}
                      </tr>
                      </thead>
                      <tbody>
                        {chartData.map((row, i) => (
                          <tr key={i} style={{ backgroundColor: i % 2 === 0 ? 'rgba(255, 255, 255, 0.03)' : 'transparent' }}>
                            <td style={{ padding: '8px', fontWeight: 'bold' }}>{formatXAxis(row.name)}</td>
                            {chartActiveKeys.map(key => <td key={key} style={{ padding: '8px' }}>{row[key] ?? '-'}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {isSupportedChartSheet && chartEmptyMetrics.length > 0 && (
                  <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(255, 100, 100, 0.05)', borderLeft: '4px solid var(--accent)', borderRadius: '4px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: 'white' }}>Catatan Metrik Kosong & Disembunyikan:</p>
                    <p style={{ margin: 0, lineHeight: '1.5' }}>
                      Berikut adalah kolom-kolom rekap "Jumlah" atau metrik yang datanya terdeteksi kosong (0) di periode ini: 
                      <strong>{chartEmptyMetrics.join(', ')}</strong>. Kolom tersebut disembunyikan agar grafik lebih rapi.
                    </p>
                  </div>
                )}
              </>
            )}

            {yearlyData && yearlyData.length > 0 && (
              <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid var(--glass-border)' }}>
                <h2 style={{ marginBottom: '16px' }}>Perbandingan Tahun ke Tahun</h2>
                {isSupportedChartSheet && activeMetrics.length > 0 && (
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '12px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Metrik (Tahunan):</span>
                        <select 
                          value={yearlyMetric} 
                          onChange={(e) => setYearlyMetric(e.target.value)}
                          style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 12px', borderRadius: '8px', outline: 'none' }}
                        >
                          {activeMetrics.map(m => <option key={m} value={m} style={{ background: '#1e1e2d' }}>{formatMetricLabel(m, sheetName, true)}</option>)}
                        </select>
                        
                        {sheetName !== 'Perayaan' && (
                          <>
                            <span style={{ color: 'var(--text-secondary)' }}>vs</span>
                            <select 
                              value={yearlyCompareMetric} 
                              onChange={(e) => setYearlyCompareMetric(e.target.value)}
                              style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 12px', borderRadius: '8px', outline: 'none' }}
                            >
                              <option value="" style={{ background: '#1e1e2d' }}>(Tanpa Pembanding)</option>
                              {activeMetrics.filter(m => m !== yearlyMetric).map(m => 
                                <option key={m} value={m} style={{ background: '#1e1e2d' }}>{formatMetricLabel(m, sheetName, true)}</option>
                              )}
                            </select>
                          </>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '12px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Filter Tahun:</span>
                        <select 
                          value={yearlyYearFilter} 
                          onChange={(e) => {
                            setYearlyYearFilter(e.target.value);
                            if (e.target.value === 'Semua Tahun') setYearlyYearCompare('');
                          }}
                          style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '8px', borderRadius: '8px', outline: 'none' }}
                        >
                          <option value="Semua Tahun" style={{ background: '#1e1e2d' }}>Semua Tahun</option>
                          {availableYears.map(y => (
                            <option key={y} value={y} style={{ background: '#1e1e2d' }}>{y}</option>
                          ))}
                        </select>

                        {yearlyYearFilter !== 'Semua Tahun' && (
                          <>
                            <span style={{ color: 'var(--text-secondary)', marginLeft: '8px' }}>vs</span>
                            <select 
                              value={yearlyYearCompare} 
                              onChange={(e) => setYearlyYearCompare(e.target.value)}
                              style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '8px', borderRadius: '8px', outline: 'none', fontSize: '0.9em' }}
                            >
                              <option value="" style={{ background: '#1e1e2d' }}>(Kosong)</option>
                              {availableYears.filter(y => y !== yearlyYearFilter).map(y => 
                                <option key={y} value={y} style={{ background: '#1e1e2d' }}>{y}</option>
                              )}
                            </select>
                          </>
                        )}
                      </div>

                      {sheetName === 'Perayaan' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '12px', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Filter Perayaan:</span>
                          <select 
                            value={yearlyPerayaanFilter} 
                            onChange={(e) => {
                              setYearlyPerayaanFilter(e.target.value);
                              if (e.target.value === 'Semua Perayaan') {
                                setYearlyPerayaanCompare1('');
                                setYearlyPerayaanCompare2('');
                                setYearlyPerayaanCompare3('');
                              }
                            }}
                            style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '8px', borderRadius: '8px', outline: 'none' }}
                          >
                            <option value="Semua Perayaan" style={{ background: '#1e1e2d' }}>Semua Perayaan</option>
                            {availablePerayaan.map(p => (
                              <option key={p} value={p} style={{ background: '#1e1e2d' }}>{p}</option>
                            ))}
                          </select>

                          {yearlyPerayaanFilter !== 'Semua Perayaan' && (
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: '12px', flexWrap: 'wrap' }}>
                              <span style={{ color: 'var(--text-secondary)' }}>Bandingkan:</span>
                              {[
                                { val: yearlyPerayaanCompare1, set: setYearlyPerayaanCompare1 },
                                { val: yearlyPerayaanCompare2, set: setYearlyPerayaanCompare2 },
                                { val: yearlyPerayaanCompare3, set: setYearlyPerayaanCompare3 }
                              ].map((comp, idx) => (
                                <select 
                                  key={idx}
                                  value={comp.val} 
                                  onChange={(e) => comp.set(e.target.value)}
                                  style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '8px', borderRadius: '8px', outline: 'none', fontSize: '0.9em' }}
                                >
                                  <option value="" style={{ background: '#1e1e2d' }}>(Kosong)</option>
                                  {availablePerayaan.filter(p => p !== yearlyPerayaanFilter).map(p => 
                                    <option key={p} value={p} style={{ background: '#1e1e2d' }}>{p}</option>
                                  )}
                                </select>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                  </div>
                )}
                {yearlyChartData.length > 0 ? (
                  <>
                    <div style={{ width: '100%', height: '400px', marginBottom: '24px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activeYearlyChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} />
                      <YAxis stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)', color: '#fff' }} itemStyle={{ color: '#fff' }} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} formatter={(value: any, name: any) => [value, formatChartKey(name as string, sheetName, true)]} />
                      <Legend wrapperStyle={{ paddingTop: '20px' }} formatter={(value: any) => formatChartKey(value as string, sheetName, true)} />
                      {activeYearlyKeys.map((key, idx) => (
                        <Bar key={`bar-${key}`} dataKey={key} fill={getColorForKey(key, idx)} fillOpacity={key.includes(yearlyCompareMetric) && yearlyCompareMetric !== '' ? 0.6 : 1} radius={[4, 4, 0, 0]} />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="table-responsive-wrapper" style={{ background: 'var(--glass-bg)', padding: '16px', borderRadius: '12px' }}>
                  <h3 style={{ marginBottom: '16px', marginTop: 0 }}>Tabel Resume Tahun Pelayanan</h3>
                  <div className="table-responsive-wrapper">
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                      <thead>
                        <tr>
                        <th style={{ padding: '8px', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)', textAlign: 'left' }}>Kategori</th>
                        {activeYearlyKeys.map(key => <th key={key} style={{ padding: '8px', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}>{formatChartKey(key, sheetName, true)}</th>)}
                      </tr>
                      </thead>
                      <tbody>
                        {activeYearlyChartData.map((row, i) => (
                          <tr key={i} style={{ backgroundColor: i % 2 === 0 ? 'rgba(255, 255, 255, 0.03)' : 'transparent' }}>
                            <td style={{ padding: '8px', fontWeight: 'bold' }}>{row.name}</td>
                            {activeYearlyKeys.map(key => <td key={key} style={{ padding: '8px' }}>{row[key] !== undefined && row[key] !== null ? Number(row[key]).toFixed(1).replace(/\.0$/, '') : '-'}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {isSupportedChartSheet && (yearlyEmptyMetrics.length > 0 || emptyYearlyRows.length > 0) && (
                    <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(255, 100, 100, 0.05)', borderLeft: '4px solid var(--accent)', borderRadius: '4px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: 'white' }}>Catatan Data Kosong & Disembunyikan:</p>
                      <p style={{ margin: 0, lineHeight: '1.5' }}>
                        Berikut adalah data tahunan yang terdeteksi kosong (0): 
                        {yearlyEmptyMetrics.length > 0 && <span> Tahun <strong>{yearlyEmptyMetrics.join(', ')}</strong></span>}
                        {yearlyEmptyMetrics.length > 0 && emptyYearlyRows.length > 0 && <span>; dan Kategori </span>}
                        {yearlyEmptyMetrics.length === 0 && emptyYearlyRows.length > 0 && <span> Kategori </span>}
                        {emptyYearlyRows.length > 0 && <strong>{emptyYearlyRows.join(', ')}</strong>}
                        . Data tersebut disembunyikan agar presentasi lebih rapi.
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div style={{ width: '100%', padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', marginTop: '16px' }}>
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Tidak ada data tahunan yang dapat ditampilkan pada grafik.</p>
              </div>
            )}
              </div>
            )}
              </>
            ) : (
              <div style={{ marginTop: '24px', padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Tidak ada data yang dapat ditampilkan pada grafik.</p>
              </div>
            )}
          </div>
      </div>
    </div>
  );
};

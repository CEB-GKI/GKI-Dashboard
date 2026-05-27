import { useState, useEffect, useRef } from 'react';
import { fetchDashboardData, fetchCachedData, parseLocalExcelFile } from './api';
import { Dashboard } from './components/Dashboard';
import { DiriDashboard } from './components/DiriDashboard';
import { TenagaDashboard } from './components/TenagaDashboard';
import { MutasiDashboard } from './components/MutasiDashboard';
import { AnalisaDashboard } from './components/AnalisaDashboard';
import { updateNotes } from './updateNotes';
import { Activity, RefreshCw, Link as LinkIcon, WifiOff, Trash2, Upload, FileClock, CheckCircle } from 'lucide-react';
import { getHistory, saveHistory, deleteHistory, type HistoryItem } from './db';

const isSingleFile = import.meta.env.VITE_APP_MODE === 'singlefile';

const FOCUS_SHEETS = [
  "Keb. Minggu",
  "Keb. Kategorial",
  "Pers. Kategorial",
  "Pers. Lainnya",
  "Perayaan",
  "DIRI",
  "RAPAT",
  "UANG",
  "TENAGA",
  "Mutasi"
];

const ADMIN_SHEETS = ["DIRI", "RAPAT", "UANG", "TENAGA", "Mutasi"];

function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(localStorage.getItem('defaultGsheetUrl') || '');
  const [hasDefaultUrl, setHasDefaultUrl] = useState(!!localStorage.getItem('defaultGsheetUrl'));
  const [showToast, setShowToast] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [data, setData] = useState<Record<string, any>>({});
  const [yearlyData, setYearlyData] = useState<Record<string, any>>({});
  const [isCached, setIsCached] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSheet, setActiveSheet] = useState<string>(FOCUS_SHEETS[0]);
  const [recentFiles, setRecentFiles] = useState<HistoryItem[]>([]);

  useEffect(() => {
    loadHistory();
    if (!isSingleFile) {
      loadCached();
    }
    
    // PWA & Mobile Detection
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    
    if (isMobile && !isStandalone && !localStorage.getItem('hideInstallPrompt')) {
      setShowInstallPrompt(true);
    }
  }, []);

  const loadCached = async () => {
    try {
      const res = await fetchCachedData();
      if (res.success && res.data) {
        setData(res.data);
        setYearlyData(res.yearlyData || res.data.yearlyData || {});
        setIsCached(res.is_cached);
      }
    } catch (e) {
      console.log('No cache available.');
    }
  };

  const loadHistory = async () => {
    try {
      const h = await getHistory();
      setRecentFiles(h);
    } catch (err) {
      console.error("Failed to load history", err);
    }
  };

  const handleFetch = async (overrideUrl?: string | React.MouseEvent) => {
    const targetUrl = typeof overrideUrl === 'string' ? overrideUrl : url;
    if (!targetUrl.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchDashboardData(targetUrl);
      setData(res.data);
      setYearlyData(res.yearlyData || res.data.yearlyData || {});
      if (targetUrl !== localStorage.getItem('defaultGsheetUrl')) {
        setShowToast(true);
      }
      
      await saveHistory({
        id: targetUrl,
        type: 'url',
        path: targetUrl,
        timestamp: Date.now()
      });
      loadHistory();

      if (!isSingleFile) {
        setIsCached(res.is_cached);
        if (res.is_cached) {
          setError(res.message);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Gagal mengambil data dari URL.');
    } finally {
      setLoading(false);
    }
  };

  const processLocalFile = async (file: File) => {
    setLoading(true);
    setError(null);
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const buffer = evt.target?.result as ArrayBuffer;
          const res = await parseLocalExcelFile(buffer);
          setData(res.data);
          setYearlyData(res.yearlyData || res.data.yearlyData || {});
          if (!isSingleFile) {
            setIsCached(false);
          }
          resolve();
        } catch (err: any) {
          setError(err.message || 'Gagal memproses file Excel lokal.');
          reject(err);
        } finally {
          setLoading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      reader.onerror = () => {
        setError('Gagal membaca file.');
        setLoading(false);
        reject(new Error('Gagal membaca file.'));
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFallbackUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processLocalFile(file);
    
    // Simpan history dengan meng-cache ArrayBuffer untuk mode file://
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const buffer = evt.target?.result as ArrayBuffer;
      await saveHistory({
        id: `local_${file.name}`,
        type: 'local',
        path: file.name,
        fileData: buffer,
        timestamp: Date.now()
      });
      loadHistory();
    };
    reader.readAsArrayBuffer(file);
  };

  const handleLocalUploadClick = async () => {
    if ('showOpenFilePicker' in window) {
      try {
        const [handle] = await (window as any).showOpenFilePicker({
          types: [{ description: 'Excel Files', accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] } }]
        });
        const file = await handle.getFile();
        await processLocalFile(file);
        
        await saveHistory({
          id: `local_${handle.name}`,
          type: 'local',
          path: handle.name,
          handle: handle,
          timestamp: Date.now()
        });
        loadHistory();
      } catch (err: any) {
        if (err.name !== 'AbortError') setError(err.message || 'Gagal memilih file.');
      }
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleHistoryClick = async (item: HistoryItem) => {
    if (item.type === 'url') {
      setUrl(item.path);
      await handleFetch(item.path);
    } else if (item.type === 'local') {
      try {
        if (item.handle) {
          const handle = item.handle;
          if ((await handle.queryPermission({ mode: 'read' })) !== 'granted') {
            const perm = await handle.requestPermission({ mode: 'read' });
            if (perm !== 'granted') throw new Error("Izin akses ditolak.");
          }
          const file = await handle.getFile();
          await processLocalFile(file);
        } else if (item.fileData) {
          const file = new File([item.fileData], item.path, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          await processLocalFile(file);
        } else {
          throw new Error("File tidak ditemukan dalam cache maupun riwayat.");
        }
        
        item.timestamp = Date.now();
        await saveHistory(item);
        loadHistory();
      } catch (err: any) {
        console.error(err);
        setError(`Gagal memuat "${item.path}". File mungkin sudah dipindahkan/dihapus, atau butuh diunggah ulang. Menghapusnya dari riwayat...`);
        await deleteHistory(item.id);
        loadHistory();
      }
    }
  };

  return (
    <div className="app-container">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
            LKKJ VISUALIZATION
          </h1>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: 500 }}>
            GKI {data.church_name ? `${data.church_name}` : 'WAHA'}
          </div>
        </div>

        <div className="sidebar-content">
          <div className="url-input-container">
            <h3 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Sumber Data
            </h3>
            <div style={{ position: 'relative' }}>
              <LinkIcon size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                className="input-field" 
                style={{ paddingLeft: '36px', fontSize: '0.85rem' }}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="URL Google Sheets..."
              />
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn" onClick={handleFetch} disabled={loading || !url.trim()} style={{ flex: 1, padding: '8px', fontSize: '0.85rem' }}>
                {loading ? <RefreshCw className="animate-spin" size={16} /> : 'Tarik Data'}
              </button>
              
              {hasDefaultUrl && (
                <button 
                  className="btn" 
                  onClick={() => {
                    localStorage.removeItem('defaultGsheetUrl');
                    setHasDefaultUrl(false);
                    setUrl('');
                  }} 
                  style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', padding: '8px' }}
                  title="Reset Default Link"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '8px 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>ATAU</div>
              <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
            </div>

            <input 
              type="file" 
              accept=".xlsx" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleFallbackUpload} 
            />
            <button 
              className="btn" 
              onClick={handleLocalUploadClick} 
              disabled={loading}
              style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', padding: '8px', fontSize: '0.85rem' }}
            >
              <Upload size={16} /> Unggah Lokal
            </button>
          </div>

          {Object.keys(data).length > 0 && (
            <>
              <div>
                <h3 style={{ margin: '16px 0 8px 0', fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', paddingBottom: '8px', borderBottom: '1px solid var(--glass-border)' }}>
                  Kebaktian
                </h3>
                <div className="nav-list">
                  {FOCUS_SHEETS.filter(s => !ADMIN_SHEETS.includes(s)).map(sheet => (
                    <button 
                      key={sheet}
                      onClick={() => setActiveSheet(sheet)}
                      className={`nav-link ${activeSheet === sheet ? 'active' : ''}`}
                    >
                      {sheet}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 style={{ margin: '16px 0 8px 0', fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', paddingBottom: '8px', borderBottom: '1px solid var(--glass-border)' }}>
                  Administrasi
                </h3>
                <div className="nav-list">
                  {FOCUS_SHEETS.filter(s => ADMIN_SHEETS.includes(s)).map(sheet => (
                    <button 
                      key={sheet}
                      onClick={() => setActiveSheet(sheet)}
                      className={`nav-link ${activeSheet === sheet ? 'active' : ''}`}
                    >
                      {sheet}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button 
                  onClick={() => setActiveSheet('Analisa')}
                  className={`nav-link ${activeSheet === 'Analisa' ? 'active' : ''}`}
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)', 
                    color: 'var(--text-primary)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    fontWeight: 600,
                  }}
                >
                  ✨ ANALISA
                </button>
                <button 
                  onClick={() => setActiveSheet('About')}
                  className={`nav-link ${activeSheet === 'About' ? 'active' : ''}`}
                >
                  ℹ️ About App
                </button>
              </div>
            </>
          )}
        </div>

        <div className="sidebar-footer">
          <div className="sensus-badge">
            <CheckCircle size={16} /> Sensus LKKJ OK
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="main-content-wrapper">
        <header className="top-navbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #8b5cf6 100%)', padding: '8px', borderRadius: '8px', display: 'flex', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}>
              <Activity color="white" size={20} />
            </div>
            <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              <span style={{ color: 'var(--accent)', marginRight: '6px' }}>v3.1</span>
              LKKJ VISUALIZATION • GKI {data.church_name ? `${data.church_name}` : 'WAHA'}
            </h2>
          </div>
          
          {!isSingleFile && Object.keys(data).length > 0 && (
            <div className={`status-badge ${isCached ? 'cached' : 'live'}`}>
              {isCached ? <WifiOff size={14} /> : <RefreshCw size={14} />}
              {isCached ? 'OFFLINE (CACHED)' : 'LIVE SYNC ACTIVE'}
            </div>
          )}
        </header>

        <main className="main-content">
          {error && (
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#fbbf24', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
              {error}
            </div>
          )}

          {Object.keys(data).length === 0 && !loading && (
            <div className="glass-panel animate-fade-in" style={{ textAlign: 'center', padding: '64px 24px', maxWidth: '600px', margin: '48px auto' }}>
              <Activity size={48} color="var(--accent)" style={{ marginBottom: '24px', opacity: 0.8 }} />
              <h2 style={{ margin: '0 0 16px 0', color: 'var(--text-primary)', fontSize: '1.5rem' }}>Selamat Datang</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                Silakan masukkan URL Google Spreadsheet atau unggah file Excel LKKJ Anda melalui menu <strong>Sumber Data</strong> di sidebar sebelah kiri untuk mulai memvisualisasikan data.
              </p>
              
              {recentFiles.length > 0 && (
                <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--glass-border)', textAlign: 'left' }}>
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '0.95rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileClock size={16} /> Riwayat Akses Terbaru
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {recentFiles.map(item => (
                      <div 
                        key={item.id} 
                        onClick={() => handleHistoryClick(item)}
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s', border: '1px solid transparent' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                      >
                        {item.type === 'url' ? <LinkIcon size={16} color="#3b82f6" /> : <Upload size={16} color="#10b981" />}
                        <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>{item.path}</span>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); deleteHistory(item.id).then(loadHistory); }}
                          style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px', borderRadius: '4px' }}
                          onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                          title="Hapus dari riwayat"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {Object.keys(data).length > 0 && (
            <div className="animate-fade-in" style={{ height: '100%' }}>

              <div style={{ display: activeSheet === 'Analisa' ? 'block' : 'none' }}>
                <AnalisaDashboard data={data} yearlyData={yearlyData} />
              </div>
              <div style={{ display: activeSheet === 'About' ? 'block' : 'none' }}>
                <div className="glass-panel" style={{ padding: '32px' }}>
                  <h2 style={{ marginTop: 0, marginBottom: '24px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px' }}>Informasi Aplikasi</h2>
                  <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '1.05rem' }}>
                    <p>Aplikasi Dashboard LKKJ ini adalah versi <strong>1.0</strong>, resmi dirilis pada tanggal <strong>25 Mei 2026</strong>.</p>
                    <p>Dashboard ini secara khusus dirancang dan digunakan untuk menganalisa format LKKJ <strong>versi 3.1 GKI SW Jabar</strong>.</p>
                    
                    <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', borderLeft: '4px solid var(--accent)' }}>
                      <h4 style={{ margin: '0 0 8px 0', color: '#fff' }}>Catatan Analisis Data</h4>
                      <p style={{ margin: 0, fontSize: '0.95rem' }}>
                        Saat ini, aplikasi baru memproses data dari <em>sheet</em> utama berikut: <strong>Keb. Minggu, Keb. Kategorial, Pers. Kategorial, Pers. Lainnya, Perayaan, RAPAT, UANG, DIRI, TENAGA, dan Mutasi</strong>. 
                        <em>Sheet-sheet</em> lain di luar daftar tersebut yang ada di dalam database LKKJ versi 3.1 belum diproses oleh aplikasi ini.
                      </p>
                    </div>

                    <div style={{ marginTop: '32px', padding: '24px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                      <h4 style={{ color: '#fff', marginTop: 0, marginBottom: '12px', fontSize: '1.1rem' }}>Pelaporan Bug & Kendala</h4>
                      <p style={{ margin: 0, marginBottom: '16px' }}>
                        Bagi Anda yang menemukan bug atau kesalahan sistem, mohon untuk memberikan <strong>tangkapan layar (<em>screenshot</em>)</strong> dan <strong>keterangan lengkap mengenai bug-nya</strong>.
                      </p>
                      <p style={{ margin: 0 }}>
                        Laporan dapat Anda kirimkan ke email berikut:<br/>
                        <a href="mailto:christianeb.gki@gmail.com" style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: 600, fontSize: '1.1rem', display: 'inline-block', marginTop: '8px' }}>
                          ✉️ christianeb.gki@gmail.com
                        </a>
                      </p>
                    </div>

                    <div style={{ marginTop: '32px', padding: '24px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <h4 style={{ color: '#fff', marginTop: 0, marginBottom: '16px', fontSize: '1.1rem' }}>Update Notes (Beta)</h4>
                      
                      {updateNotes.map((note: any, idx: number) => (
                        <div key={idx} style={{ marginBottom: idx === updateNotes.length - 1 ? 0 : '16px', paddingBottom: idx === updateNotes.length - 1 ? 0 : '16px', borderBottom: idx === updateNotes.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)' }}>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>{note.timestamp}</div>
                          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                            {note.changes.map((change: any, cIdx: number) => (
                              <li key={cIdx} style={{ marginBottom: '4px' }}>{change}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              
              </div>
              <div style={{ display: activeSheet === 'DIRI' ? 'block' : 'none' }}>
                <DiriDashboard data={data['DIRI']} churchName={data['church_name'] || 'Waha'} />
              </div>
              <div style={{ display: activeSheet === 'TENAGA' ? 'block' : 'none' }}>
                <TenagaDashboard data={data['TENAGA']} churchName={data['church_name'] || 'Waha'} />
              </div>
              <div style={{ display: activeSheet === 'Mutasi' ? 'block' : 'none' }}>
                <MutasiDashboard data={data['Mutasi']} churchName={data['church_name'] || 'Waha'} />
              </div>
              {['Keb. Minggu', 'Keb. Kategorial', 'Pers. Kategorial', 'Pers. Lainnya', 'Perayaan', 'RAPAT', 'UANG'].map(s => (
                <div key={s} style={{ display: activeSheet === s ? 'block' : 'none' }}>
                  <Dashboard 
                    data={data[s] || []} 
                    yearlyData={yearlyData[s] || []}
                    sheetName={s} 
                    churchName={data['church_name'] || 'Waha'} 
                  />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {showToast && (
        <div className="toast-container animate-fade-in" style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--glass-border)',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          zIndex: 9999,
          maxWidth: '350px'
        }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem' }}>Simpan Tautan?</h4>
          <p style={{ margin: '0 0 16px 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Apakah Anda ingin menyimpan alamat Google Sheets ini sebagai default untuk pembukaan selanjutnya?
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button 
              className="btn" 
              style={{ padding: '8px 16px', fontSize: '0.875rem', background: 'transparent', border: '1px solid var(--glass-border)' }}
              onClick={() => setShowToast(false)}
            >
              Tidak
            </button>
            <button 
              className="btn" 
              style={{ padding: '8px 16px', fontSize: '0.875rem' }}
              onClick={() => {
                localStorage.setItem('defaultGsheetUrl', url);
                setHasDefaultUrl(true);
                setShowToast(false);
              }}
            >
              Ya, Simpan
            </button>
          </div>
        </div>
      )}

      {showInstallPrompt && (
        <div className="toast-container animate-fade-in" style={{
          position: 'fixed',
          bottom: '24px',
          left: '24px',
          right: '24px',
          background: 'var(--accent)',
          border: '1px solid var(--glass-border)',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 8px 32px rgba(59, 130, 246, 0.5)',
          zIndex: 10000,
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h4 style={{ margin: 0, fontSize: '1.1rem' }}>📱 Jadikan Aplikasi!</h4>
            <button 
              onClick={() => {
                setShowInstallPrompt(false);
                localStorage.setItem('hideInstallPrompt', 'true');
              }}
              style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.7)', padding: 0, cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>
          <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5 }}>
            Untuk pengalaman terbaik dan layar penuh (100% Offline), tambahkan Dashboard ini ke Layar Utama (*Home Screen*) HP Anda melalui menu browser (Ketuk "Bagikan" atau ikon titik tiga).
          </p>
        </div>
      )}
    </div>
  );
}

export default App;

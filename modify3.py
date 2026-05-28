import re

filepath = 'frontend/src/components/AnalisaDashboard.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

kehadiran_pattern = re.compile(r'const analisaKehadiran = useMemo\(\(\) => \{.*?\n  \}, \[yearlyData, yoyData\]\);', re.DOTALL)
match = kehadiran_pattern.search(content)

if not match:
    print('Pattern not found')
    exit(1)

new_kehadiran = """const kehadiranRataData = useMemo(() => {
    const title = 'Perbandingan Rata-rata Kehadiran per Kegiatan';
    const allKebaktianSheets = ['Keb. Minggu', 'Keb. Kategorial', 'Pers. Kategorial', 'Pers. Lainnya', 'Perayaan'];
    
    const currentYearStr = String(yoyData.currentYear);
    const prevYearStr = String(yoyData.prevYear);

    const activities: Record<string, { curr: number, prev: number }> = {};

    allKebaktianSheets.forEach(sheetName => {
      if (yearlyData[sheetName]) {
        yearlyData[sheetName].forEach((row: any) => {
          const yearMatch = String(row.Tanggal).match(/20\\d{2}/);
          if (yearMatch) {
            const yearStr = yearMatch[0];
            const jam = row.Jam || 'Umum';
            const label = `${sheetName.replace('Keb. ', '').replace('Pers. ', '')} - ${jam}`;
            
            if (!activities[label]) {
              activities[label] = { curr: 0, prev: 0 };
            }
            if (yearStr === currentYearStr) {
              activities[label].curr = row['Total Kehadiran'] || 0;
            } else if (yearStr === prevYearStr) {
              activities[label].prev = row['Total Kehadiran'] || 0;
            }
          }
        });
      }
    });

    const chartData = Object.keys(activities).map(label => ({
      name: label,
      'Tahun Kini': activities[label].curr,
      'Tahun Lalu': activities[label].prev,
    })).filter(d => d['Tahun Kini'] > 0 || d['Tahun Lalu'] > 0);

    const hasData = chartData.length > 0;
    const description = 'Menampilkan perbandingan rata-rata kehadiran (per kegiatan) antara tahun ini dan tahun sebelumnya. Karena data rincian di tahun-tahun lalu belum tersedia secara utuh, chart ini berfokus pada data Rata-rata yang dilaporkan dalam lembar rekapitulasi.';

    return { chartData, hasData, title, description, sources: allKebaktianSheets };
  }, [yearlyData, yoyData]);"""

content = content.replace(match.group(0), new_kehadiran)
content = content.replace('const allModules = [analisaKehadiran, ', 'const allModules = [')

inject_point = '{/* 2. POSITIVE SECTION */}'

custom_jsx = """{/* 1.7. KEHADIRAN RATA-RATA KHUSUS */}
      {kehadiranRataData && kehadiranRataData.hasData && (
        <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', borderTop: `4px solid ${COLORS.blue}`, marginBottom: '24px' }}>
           <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.25rem', color: 'var(--text-primary)' }}>
             <TrendingUp color={COLORS.blue} size={24} />
             {kehadiranRataData.title}
           </h3>
           <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px' }}>
             <FileText color="var(--text-secondary)" size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
             <div>
               <p style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)', lineHeight: '1.5', fontStyle: 'italic' }}>
                 {kehadiranRataData.description}
               </p>
               <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                 <strong>Source yang digunakan:</strong>
                 <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px' }}>
                   {kehadiranRataData.sources.map((s: string, idx: number) => <li key={idx}>{s}</li>)}
                 </ul>
               </div>
             </div>
           </div>

           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px', alignItems: 'start' }}>
             {/* Chart Side */}
             <div style={{ width: '100%', minWidth: 0 }}>
               <ResponsiveContainer width="100%" height={450}>
                 <BarChart data={kehadiranRataData.chartData} margin={{ top: 20, right: 10, left: 0, bottom: 120 }}>
                   <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                   <XAxis dataKey="name" stroke="#A0AEC0" tick={{ fill: '#A0AEC0', fontSize: 11 }} angle={-45} textAnchor="end" interval={0} />
                   <YAxis stroke="#A0AEC0" tick={{ fill: '#A0AEC0' }} />
                   <Tooltip contentStyle={{ backgroundColor: '#1A202C', borderColor: '#2D3748', color: '#fff', borderRadius: '8px' }} itemStyle={{ color: '#E2E8F0' }} />
                   <Legend wrapperStyle={{ paddingTop: '20px' }} />
                   <Bar dataKey="Tahun Kini" fill={COLORS.blue} radius={[4, 4, 0, 0]} />
                   <Bar dataKey="Tahun Lalu" fill={COLORS.purple} radius={[4, 4, 0, 0]} />
                 </BarChart>
               </ResponsiveContainer>
             </div>

             {/* Table Side */}
             <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', overflowX: 'auto' }}>
               <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem', minWidth: '400px' }}>
                 <thead>
                   <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                     <th style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>Jenis Kegiatan</th>
                     <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', textAlign: 'right' }}>Tahun Lalu</th>
                     <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', textAlign: 'right' }}>Tahun Kini</th>
                     <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', textAlign: 'right' }}>Tren</th>
                   </tr>
                 </thead>
                 <tbody>
                   {kehadiranRataData.chartData.map((d: any, i: number) => {
                     const diff = d['Tahun Kini'] - d['Tahun Lalu'];
                     const isPos = diff > 0;
                     const isNeg = diff < 0;
                     return (
                       <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                         <td style={{ padding: '10px 16px', color: 'var(--text-primary)' }}>{d.name}</td>
                         <td style={{ padding: '10px 16px', color: 'var(--text-primary)', textAlign: 'right' }}>{d['Tahun Lalu'] || '-'}</td>
                         <td style={{ padding: '10px 16px', color: 'var(--text-primary)', textAlign: 'right' }}>{d['Tahun Kini'] || '-'}</td>
                         <td style={{ padding: '10px 16px', textAlign: 'right', color: isPos ? COLORS.green : isNeg ? COLORS.red : 'var(--text-secondary)' }}>
                           {isPos ? '▲ ' : isNeg ? '▼ ' : ''} {diff !== 0 ? Math.abs(diff).toFixed(1) : '-'}
                         </td>
                       </tr>
                     );
                   })}
                 </tbody>
               </table>
             </div>
           </div>
        </div>
      )}

      """

content = content.replace(inject_point, custom_jsx + inject_point)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Modification done!")

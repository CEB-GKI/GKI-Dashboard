import re

filepath = 'frontend/src/components/AnalisaDashboard.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove "Total Kehadiran" from JSX
total_kehadiran_pattern = r'\{/\* Total Kehadiran \*/\}.*?</div>\s*</div>'
content = re.sub(total_kehadiran_pattern, '', content, flags=re.DOTALL)

# 2. Move allModules
modules_pattern = r'(\s*const allModules = \[.*?\]\.filter[^\n]*\n\s*const cardsGood = [^\n]*\n\s*const cardsWarning = [^\n]*\n\s*const cardsHidden = [^\n]*\n\n\s*const missingSources = [^\n]*\n\s*const warnings = [^\n]*\n)'
match = re.search(modules_pattern, content)
if match:
    modules_str = match.group(1)
    content = content.replace(modules_str, '\n')
    
    # modify allModules to include analisaKehadiran
    modules_str = modules_str.replace('const allModules = [', 'const allModules = [analisaKehadiran, ')
    
    # find yoyData end
    yoy_end = '  }, [yearlyData, data]);'
    
    analisa_kehadiran_code = """
  const analisaKehadiran = useMemo(() => {
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
    
    const chart = hasData ? (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 120 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="name" stroke="#A0AEC0" tick={{ fill: '#A0AEC0', fontSize: 11 }} angle={-45} textAnchor="end" interval={0} />
          <YAxis stroke="#A0AEC0" tick={{ fill: '#A0AEC0' }} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1A202C', borderColor: '#2D3748', color: '#fff', borderRadius: '8px' }}
            itemStyle={{ color: '#E2E8F0' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Bar dataKey="Tahun Kini" fill={COLORS.blue} radius={[4, 4, 0, 0]} />
          <Bar dataKey="Tahun Lalu" fill={COLORS.purple} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    ) : null;

    const description = 'Menampilkan perbandingan rata-rata kehadiran (per kegiatan) antara tahun ini dan tahun sebelumnya. Karena data rincian di tahun-tahun lalu belum tersedia secara utuh, chart ini berfokus pada data Rata-rata yang dilaporkan dalam lembar rekapitulasi.';

    return { sources: allKebaktianSheets, title, isHidden: !hasData, icon: <TrendingUp color={COLORS.blue} />, description, chart, status: 'good' };
  }, [yearlyData, yoyData]);
"""
    
    content = content.replace(yoy_end, yoy_end + '\n' + analisa_kehadiran_code + '\n' + modules_str)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Modification done!")

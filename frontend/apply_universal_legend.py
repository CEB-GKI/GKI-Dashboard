import re

FILE_PATH = r"C:\Users\Chris\Apps\GKI_Waha_Dashboard\On Progress\frontend\src\components\AnalisaDashboard.tsx"

with open(FILE_PATH, "r", encoding="utf-8") as f:
    content = f.read()

# First, define the universal custom legend renderer at the top of the file
universal_legend = """
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
"""

# Insert it after the imports if not already there
if "UniversalLegend" not in content:
    content = content.replace("export default function AnalisaDashboard({ data, yearlyData }: any) {", universal_legend + "\nexport default function AnalisaDashboard({ data, yearlyData }: any) {")

# Replace all <Legend /> or <Legend content={...} /> with <Legend content={UniversalLegend} />
content = re.sub(r'<Legend\s*(?:content=\{[^}]+\})?\s*/>', '<Legend content={UniversalLegend} />', content)

# Remove the old renderLegendAnalisa3 since it's no longer needed
content = re.sub(r'const renderLegendAnalisa3 = \(props: any\) => \{.*?\};\s*', '', content, flags=re.DOTALL)

# Now, let's also fix the order of Bars in analisa12 to match the user's perception
# The user wants "Pendaftaran Anggota" (Green) to be first, because they saw it first visually in 2023-2024.
# Let's swap the <Bar> elements in analisa12
analisa12_bars = """          <Bar dataKey="MutasiMasuk" fill={COLORS.green} radius={[4, 4, 0, 0]} name="Pendaftaran Anggota" />
          <Bar dataKey="SimpatisanMinggu" fill={COLORS.orange} radius={[4, 4, 0, 0]} name="Kehadiran Simpatisan" />"""

content = re.sub(
    r'<Bar dataKey="SimpatisanMinggu"[^>]+/>\s*<Bar dataKey="MutasiMasuk"[^>]+/>',
    analisa12_bars,
    content
)

# And swap the table columns in analisa12 just in case
table12_header = "<tr><th>Tahun</th><th>Pendaftaran Anggota (Mutasi Masuk)</th><th>Rata-rata Simpatisan (Minggu)</th></tr>"
content = re.sub(r'<tr><th>Tahun</th><th>Rata-rata Simpatisan \(Minggu\)</th><th>Pendaftaran Anggota \(Mutasi Masuk\)</th></tr>', table12_header, content)

table12_row = "<tr key={i}><td>{row.name}</td><td>{row.MutasiMasuk}</td><td>{row.SimpatisanMinggu}</td></tr>"
content = re.sub(r'<tr key=\{i\}><td>\{row\.name\}</td><td>\{row\.SimpatisanMinggu\}</td><td>\{row\.MutasiMasuk\}</td></tr>', table12_row, content)


# Let's check other charts for logical ordering
# Chart 4 (Kehadiran Perayaan vs Ibadah Minggu)
# Usually Reguler (Sunday Service) is more prominent, should be first
content = re.sub(
    r'<Bar dataKey="Perayaan"[^>]+/>\s*<Bar dataKey="Reguler"[^>]+/>',
    '<Bar dataKey="Reguler" fill={COLORS.blue} radius={[4, 4, 0, 0]} name="Kehadiran Ibadah Minggu" />\n          <Bar dataKey="Perayaan" fill={COLORS.orange} radius={[4, 4, 0, 0]} name="Kehadiran Perayaan" />',
    content
)

with open(FILE_PATH, "w", encoding="utf-8") as f:
    f.write(content)

print("Universal Legend applied and specific charts reordered.")

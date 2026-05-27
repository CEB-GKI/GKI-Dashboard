import re

FILE_PATH = r"C:\Users\Chris\Apps\GKI_Waha_Dashboard\On Progress\frontend\src\components\AnalisaDashboard.tsx"

with open(FILE_PATH, "r", encoding="utf-8") as f:
    content = f.read()

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

if "const UniversalLegend =" not in content:
    # Let's insert it after the import statements
    content = re.sub(r'(import .*?;?\n)+', lambda m: m.group(0) + "\n" + universal_legend + "\n", content, count=1)

with open(FILE_PATH, "w", encoding="utf-8") as f:
    f.write(content)

print("Injected UniversalLegend.")

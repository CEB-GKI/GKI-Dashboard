import re
import sys

FILE_PATH = r"C:\Users\Chris\Apps\GKI_Waha_Dashboard\On Progress\frontend\src\components\AnalisaDashboard.tsx"

with open(FILE_PATH, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Delete analisa15 (Giving Fatigue)
content = re.sub(r"  const analisa15 = useMemo\(\(\) => \{.*?(?=  const analisa18 = useMemo)", "", content, flags=re.DOTALL)
# update allModules
content = content.replace("const allModules = [analisa2, analisa3, analisa4, analisa7, analisa8, analisa10, analisa12, analisa13, analisa15, analisa18]", "const allModules = [analisa2, analisa3, analisa4, analisa7, analisa8, analisa10, analisa12, analisa13, analisa18]")

# 2. Fix Legend order. 
# Recharts `<Legend />` in 3.x has issues with payload matching. 
# Let's replace the `Legend` in `analisa3` with a custom legend function.
# We'll just define a small custom Legend renderer at the top of AnalisaDashboard.tsx, or inline it.

custom_legend_analisa3 = """
const renderLegendAnalisa3 = (props: any) => {
  const { payload } = props;
  // We want to force the order to match the bars: Pemuda, DewasaMuda, Lansia
  const ordered = [];
  const pemuda = payload.find((p: any) => p.dataKey === 'Pemuda');
  const dm = payload.find((p: any) => p.dataKey === 'DewasaMuda');
  const lansia = payload.find((p: any) => p.dataKey === 'Lansia');
  if (pemuda) ordered.push(pemuda);
  if (dm) ordered.push(dm);
  if (lansia) ordered.push(lansia);
  
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', paddingTop: '10px' }}>
      {ordered.map((entry: any, index: number) => (
        <span key={`item-${index}`} style={{ color: entry.color, display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: entry.color }}></div>
          {entry.value}
        </span>
      ))}
    </div>
  );
};
"""

# Let's just insert the `renderLegendAnalisa3` right before `analisa3`
content = content.replace("  const analisa3 = useMemo(() => {", custom_legend_analisa3 + "\n  const analisa3 = useMemo(() => {")

# Then replace the `<Legend />` inside analisa3
analisa3_legend_replacement = "<Legend content={renderLegendAnalisa3} />"
content = re.sub(r'\{\/\*\s*@ts-ignore\s*\*\/\}\s*<Legend\s+payload=\{\[[\s\S]*?\]\}\s*/>', analisa3_legend_replacement, content, count=1)

with open(FILE_PATH, "w", encoding="utf-8") as f:
    f.write(content)
print("Fixes applied.")

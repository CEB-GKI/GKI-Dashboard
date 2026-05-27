import re

FILE_PATH = r"C:\Users\Chris\Apps\GKI_Waha_Dashboard\On Progress\frontend\src\components\AnalisaDashboard.tsx"

with open(FILE_PATH, "r", encoding="utf-8") as f:
    content = f.read()

# Replace <Legend /> inside analisa3
analisa3_legend_replacement = "<Legend content={renderLegendAnalisa3} />"
content = re.sub(r'(<Bar dataKey="Pemuda".*?</BarChart>)', lambda m: m.group(1).replace('<Legend />', analisa3_legend_replacement), content, flags=re.DOTALL)

with open(FILE_PATH, "w", encoding="utf-8") as f:
    f.write(content)

print("Applied Legend correctly.")

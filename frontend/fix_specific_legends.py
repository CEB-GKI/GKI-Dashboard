import re

FILE_PATH = r"C:\Users\Chris\Apps\GKI_Waha_Dashboard\On Progress\frontend\src\components\AnalisaDashboard.tsx"

with open(FILE_PATH, "r", encoding="utf-8") as f:
    content = f.read()

# Restore all legends
content = re.sub(r'\{\/\*\s*@ts-ignore\s*\*\/\}\s*<Legend\s+payload=\{\[[\s\S]*?\]\}\s*/>', '<Legend />', content)

# Analisa3: Chart order is Pemuda, DewasaMuda, Lansia
# Let's add explicit payload for Analisa3
analisa3_payload = """{/* @ts-ignore */}
          <Legend payload={[
            { value: 'Pemuda (20-30)', type: 'rect', id: 'Pemuda', color: COLORS.blue },
            { value: 'Keluarga Muda (31-39)', type: 'rect', id: 'DewasaMuda', color: COLORS.teal },
            { value: 'Lansia (>60)', type: 'rect', id: 'Lansia', color: COLORS.purple }
          ]} />"""

# We'll replace the Legend in Analisa3 ONLY
content = re.sub(r'(<Bar dataKey="Pemuda".*?</BarChart>)', lambda m: m.group(1).replace('<Legend />', analisa3_payload), content, flags=re.DOTALL)

# Analisa15: Chart order is Uang, Kehadiran
analisa15_payload = """{/* @ts-ignore */}
          <Legend payload={[
            { value: 'Total Persembahan', type: 'line', id: 'Uang', color: COLORS.green },
            { value: 'Kehadiran Jemaat', type: 'line', id: 'Kehadiran', color: COLORS.orange }
          ]} />"""

content = re.sub(r'(<Line yAxisId="left" type="monotone" dataKey="Uang".*?</LineChart>)', lambda m: m.group(1).replace('<Legend />', analisa15_payload), content, flags=re.DOTALL)

with open(FILE_PATH, "w", encoding="utf-8") as f:
    f.write(content)

print("Restored and fixed.")

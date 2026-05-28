import re

file_path = r'frontend/src/components/AnalisaDashboard.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Default to 'all'
content = content.replace("useState<'1m'|'3m'|'1y'|'all'>('1y');", "useState<'1m'|'3m'|'1y'|'all'>('all');")

# Rename titles and text
content = content.replace('Perbandingan Penerimaan Kebaktian dan Luar Kebaktian', 'Perbandingan Penerimaan Rutin dan Non-Rutin')
content = content.replace('Persembahan Kebaktian', 'Persembahan Rutin')
content = content.replace('Persembahan Luar Kebaktian', 'Persembahan Non-Rutin')
content = content.replace('Penerimaan Kebaktian', 'Penerimaan Rutin')
content = content.replace('Luar Kebaktian', 'Non-Rutin')
content = content.replace('Kebaktian (Kini)', 'Rutin (Kini)')
content = content.replace('Luar Kebaktian (Kini)', 'Non-Rutin (Kini)')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

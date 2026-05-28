import re

filepath = 'frontend/src/components/AnalisaDashboard.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the grid template columns
old_grid = "<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px', alignItems: 'start' }}>"
new_grid = "<div style={{ display: 'flex', flexDirection: 'column', gap: '32px', alignItems: 'stretch' }}>"

content = content.replace(old_grid, new_grid)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Modification done!")

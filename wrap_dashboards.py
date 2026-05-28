import os

files = [
    'frontend/src/components/AnalisaDashboard.tsx',
    'frontend/src/components/Dashboard.tsx',
    'frontend/src/components/DiriDashboard.tsx',
    'frontend/src/components/MutasiDashboard.tsx',
    'frontend/src/components/TenagaDashboard.tsx',
    'frontend/src/components/UangDashboard.tsx'
]

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add import if missing
    if "import { FullscreenWrapper }" not in content:
        # insert after the first import
        content = content.replace("import ", "import { FullscreenWrapper } from './FullscreenWrapper';\nimport ", 1)

    # For AnalisaDashboard, close the AnalisaCard tag (fixing the failed chunk)
    if filepath == 'frontend/src/components/AnalisaDashboard.tsx':
        if '<FullscreenWrapper className="glass-panel analisa-card"' in content and '</FullscreenWrapper>\n}' not in content:
            # find the end of AnalisaCard
            content = content.replace('    </div>\n  );\n}', '    </FullscreenWrapper>\n  );\n}')
    else:
        # For other dashboards, replace glass-panel divs that contain charts
        # We'll split by `<div className="glass-panel"` or similar
        # Since doing this with string manipulation might be hard, we can just replace ALL top-level glass-panel divs that wrap charts?
        
        # A simpler way: we just find `<div className="glass-panel"` that are followed by `h3` and `<div style={{ height: '...px' }}> <ResponsiveContainer`
        pass

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print("Imports added!")

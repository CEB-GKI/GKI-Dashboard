import re

filepath = 'frontend/src/components/AnalisaDashboard.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add FullscreenWrapper import
if "import { FullscreenWrapper } from './FullscreenWrapper';" not in content:
    content = content.replace("import { AlertTriangle,", "import { FullscreenWrapper }\nfrom './FullscreenWrapper';\nimport { AlertTriangle,")
    # if the above didn't match perfectly, just prepend
    if "FullscreenWrapper" not in content:
        content = "import { FullscreenWrapper } from './FullscreenWrapper';\n" + content

# 2. Rewrite AnalisaCard
analisacard_pattern = re.compile(r'function AnalisaCard\(\{.*?\}\: any\) \{\n\s*const \[isFullscreen, setIsFullscreen\] = useState\(false\);\n.*?return \(\n\s*<>\n.*?<div className="glass-panel analisa-card".*?\{innerContent\}\n\s*</div>\n\s*</>\n\s*\);\n\}', re.DOTALL)
match = analisacard_pattern.search(content)

if match:
    original_body = match.group(0)
    
    # Extract inner_content (everything inside `const innerContent = (\n    <>\n`)
    inner_start = original_body.find('const innerContent = (\n    <>\n') + len('const innerContent = (\n    <>\n')
    inner_end = original_body.find('\n    </>\n  );', inner_start)
    inner_content = original_body[inner_start:inner_end]
    
    style_str_match = re.search(r'style=\{\{(.*?)\}\}', original_body)
    style_str = style_str_match.group(1) if style_str_match else "marginBottom: '24px', overflow: 'hidden'"
    
    new_analisacard = f"""function AnalisaCard({{ title, icon, description, chart, table, alertText, status, dynamicText, sources, forceShow }}: any) {{
  const innerContent = (
    <>
{inner_content}
    </>
  );

  return (
    <FullscreenWrapper className="glass-panel analisa-card" style={{{{ {style_str} }}}}>
      {{innerContent}}
    </FullscreenWrapper>
  );
}}"""
    content = content.replace(original_body, new_analisacard)
else:
    print("Failed to find AnalisaCard pattern")

# 3. Rewrite KEHADIRAN RATA-RATA KHUSUS
kehadiran_pattern = re.compile(r'\{/\* 1\.7\. KEHADIRAN RATA-RATA KHUSUS \*/\}\n\s*\{kehadiranRataData && kehadiranRataData\.hasData && \(\(\) => \{\n.*?return \(\n\s*<>\n.*?</>\n\s*\);\n\s*\}\)\(\)\}', re.DOTALL)
match = kehadiran_pattern.search(content)

if match:
    original_kehadiran = match.group(0)
    
    # Extract innerContent
    inner_start = original_kehadiran.find('const innerContent = (\n          <>\n') + len('const innerContent = (\n          <>\n')
    inner_end = original_kehadiran.find('\n          </>\n        );', inner_start)
    inner_content = original_kehadiran[inner_start:inner_end]
    
    new_kehadiran = """{/* 1.7. KEHADIRAN RATA-RATA KHUSUS */}
      {kehadiranRataData && kehadiranRataData.hasData && (
        <FullscreenWrapper className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', borderTop: `4px solid ${COLORS.blue}`, marginBottom: '24px' }}>
""" + inner_content + """
        </FullscreenWrapper>
      )}"""
    
    content = content.replace(original_kehadiran, new_kehadiran)
else:
    print("Failed to find Kehadiran Rata-Rata Khusus pattern")

# 4. Remove isKehadiranFullscreen state
content = content.replace('  const [isKehadiranFullscreen, setIsKehadiranFullscreen] = useState(false);\n', '')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("AnalisaDashboard modification done!")

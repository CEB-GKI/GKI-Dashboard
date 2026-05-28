import re

filepath = 'frontend/src/components/AnalisaDashboard.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add Maximize2, Minimize2 to lucide imports
lucide_import_pattern = r"import \{([^}]+)\} from 'lucide-react';"
match = re.search(lucide_import_pattern, content)
if match:
    imports = match.group(1)
    if 'Maximize2' not in imports:
        new_imports = imports + ", Maximize2, Minimize2"
        content = content.replace(match.group(0), f"import {{{new_imports}}} from 'lucide-react';")

# 2. Modify AnalisaCard
# Extract AnalisaCard body
card_pattern = re.compile(r'function AnalisaCard\(\{.*?\}\: any\) \{\nreturn \(\n<div className="glass-panel analisa-card"(.*?)</div>\n\);\n\}', re.DOTALL)
match = card_pattern.search(content)

if match:
    original_body = match.group(0)
    
    # We will rewrite the AnalisaCard function
    inner_content = original_body.replace('function AnalisaCard({ title, icon, description, chart, table, alertText, status, dynamicText, sources, forceShow }: any) {\nreturn (\n<div className="glass-panel analisa-card"', '')
    # Remove the first style string and `>` 
    # Actually, we can just split by the first `>`
    first_close = inner_content.find('>')
    inner_content = inner_content[first_close+1:]
    
    # remove the last `</div>\n);\n}`
    inner_content = inner_content.rsplit('</div>\n);\n}', 1)[0]
    
    # Get the style string
    style_str_match = re.search(r'style=\{\{(.*?)\}\}', original_body)
    style_str = style_str_match.group(1) if style_str_match else "marginBottom: '24px', overflow: 'hidden'"

    new_analisacard = f"""function AnalisaCard({{ title, icon, description, chart, table, alertText, status, dynamicText, sources, forceShow }}: any) {{
  const [isFullscreen, setIsFullscreen] = useState(false);

  const innerContent = (
    <>
      {inner_content}
    </>
  );

  return (
    <>
      {{isFullscreen && (
        <div style={{{{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(10px)', overflowY: 'auto', padding: '40px 24px' }}}}>
          <div style={{{{ maxWidth: '1400px', margin: '0 auto', background: 'var(--bg-panel)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', position: 'relative' }}}}>
             <button onClick={{() => setIsFullscreen(false)}} style={{{{ position: 'absolute', top: '16px', right: '16px', zIndex: 10, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', padding: '8px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}}}>
                <Minimize2 size={{20}} /> Tutup Layar Penuh
             </button>
             <div style={{{{ paddingRight: '120px' }}}}>
             {{innerContent}}
             </div>
          </div>
        </div>
      )}}
      <div className="glass-panel analisa-card" style={{{{ {style_str}, position: 'relative' }}}}>
         <button className="btn-icon" onClick={{() => setIsFullscreen(true)}} style={{{{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', zIndex: 5 }}}} title="Layar Penuh">
             <Maximize2 size={{20}} />
         </button>
         {{innerContent}}
      </div>
    </>
  );
}}"""

    content = content.replace(original_body, new_analisacard)

# 3. Add useState for isKehadiranFullscreen in AnalisaDashboard
dashboard_def = 'export default function AnalisaDashboard({ data }: Props) {'
if 'const [isKehadiranFullscreen, setIsKehadiranFullscreen] = useState(false);' not in content:
    content = content.replace(dashboard_def, dashboard_def + '\n  const [isKehadiranFullscreen, setIsKehadiranFullscreen] = useState(false);')

# 4. Modify KEHADIRAN RATA-RATA KHUSUS block
kehadiran_block_pattern = re.compile(r'(\{/\* 1\.7\. KEHADIRAN RATA-RATA KHUSUS \*/\}\n\s*\{kehadiranRataData && kehadiranRataData\.hasData && \(\n\s*<div className="glass-panel" style=\{\{ padding: \'32px\'.*?\n\s*\)\})', re.DOTALL)
match = kehadiran_block_pattern.search(content)

if match:
    original_kehadiran = match.group(1)
    
    # We will extract the inner content of the div
    inner_start = original_kehadiran.find('<h3')
    inner_end = original_kehadiran.rfind('</div>') # the closing div of glass-panel
    
    # Actually the safest is to rebuild the whole block
    inner_content = original_kehadiran[inner_start:inner_end]
    
    new_kehadiran = """{/* 1.7. KEHADIRAN RATA-RATA KHUSUS */}
      {kehadiranRataData && kehadiranRataData.hasData && (() => {
        const innerContent = (
          <>
            """ + inner_content + """
          </>
        );

        return (
          <>
            {isKehadiranFullscreen && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(10px)', overflowY: 'auto', padding: '40px 24px' }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto', background: 'var(--bg-panel)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', position: 'relative', padding: '32px' }}>
                   <button onClick={() => setIsKehadiranFullscreen(false)} style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', padding: '8px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Minimize2 size={20} /> Tutup Layar Penuh
                   </button>
                   <div style={{ paddingRight: '120px' }}>
                     {innerContent}
                   </div>
                </div>
              </div>
            )}
            <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', borderTop: `4px solid ${COLORS.blue}`, marginBottom: '24px', position: 'relative' }}>
               <button className="btn-icon" onClick={() => setIsKehadiranFullscreen(true)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', zIndex: 5 }} title="Layar Penuh">
                   <Maximize2 size={20} />
               </button>
               {innerContent}
            </div>
          </>
        );
      })()}"""
    
    content = content.replace(original_kehadiran, new_kehadiran)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Modification done!")

import re

filepath = 'frontend/src/components/UangDashboard.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix chart1
content = content.replace(
    '<FullscreenWrapper ref={chart1Ref} className="glass-panel chart-container" style={{ marginBottom: \'32px\' }}>',
    '<FullscreenWrapper className="glass-panel chart-container" style={{ marginBottom: \'32px\' }}>\n          <div ref={chart1Ref} style={{ width: \'100%\', height: \'100%\' }}>'
)

# Fix chart2
content = content.replace(
    '<FullscreenWrapper ref={chart2Ref} className="glass-panel chart-container" style={{ marginBottom: \'32px\' }}>',
    '<FullscreenWrapper className="glass-panel chart-container" style={{ marginBottom: \'32px\' }}>\n          <div ref={chart2Ref} style={{ width: \'100%\', height: \'100%\' }}>'
)

# Fix chart3
content = content.replace(
    '<FullscreenWrapper ref={chart3Ref} className="glass-panel chart-container" style={{ marginBottom: \'32px\' }}>',
    '<FullscreenWrapper className="glass-panel chart-container" style={{ marginBottom: \'32px\' }}>\n          <div ref={chart3Ref} style={{ width: \'100%\', height: \'100%\' }}>'
)

# Fix the closing tags. Because there are three </FullscreenWrapper> tags, we need to replace each with </div></FullscreenWrapper>
content = content.replace(
    '</FullscreenWrapper>',
    '</div>\n        </FullscreenWrapper>'
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("UangDashboard fixed.")

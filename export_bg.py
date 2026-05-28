import re

filepath = 'frontend/src/utils/exportUtils.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add backgroundColor: '#070B14' to all html2canvas calls
content = content.replace("await html2canvas(containerRef.current, { scale: 2 });", "await html2canvas(containerRef.current, { scale: 2, backgroundColor: '#070B14' });")
content = content.replace("await html2canvas(el, { scale: 2 });", "await html2canvas(el, { scale: 2, backgroundColor: '#070B14' });")
content = content.replace("await html2canvas(element, { scale: 2 });", "await html2canvas(element, { scale: 2, backgroundColor: '#070B14' });")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Modification done!")

import re

filepath = 'frontend/src/utils/exportUtils.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Change PDF generation to use JPEG compression instead of PNG

# 1. First PDF generation block (Single page)
content = content.replace("const imgData = canvas.toDataURL('image/png');", "const imgData = canvas.toDataURL('image/jpeg', 0.8);")
content = content.replace("pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);", "pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height, undefined, 'FAST');")

# 2. Scale reduction from 2 to 1.5 to reduce dimensions which heavily cuts size
content = content.replace("scale: 2", "scale: 1.5")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Compression modification done!")

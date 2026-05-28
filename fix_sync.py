import os

filepath = 'frontend/scripts/sync-readme.cjs'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Make it resilient to line endings by using regex or just stripping the newline from the search
import re

content = re.sub(
    r"const sectionHeader = '## 📝 Catatan Rilis & Riwayat Build Terbaru\\n\\n';",
    "const sectionHeader = '## 📝 Catatan Rilis & Riwayat Build Terbaru';",
    content
)

content = re.sub(
    r"const sectionIndex = readmeStr\.indexOf\(sectionHeader\);",
    "const sectionIndex = readmeStr.indexOf(sectionHeader);\n  const startOfNotesIndex = readmeStr.indexOf('\\n', sectionIndex) + 1;\n  let nextNewLine = readmeStr.indexOf('\\n', startOfNotesIndex);\n  if (readmeStr[nextNewLine-1] === '\\r') nextNewLine++;\n  const startOfNotesIndex2 = nextNewLine + 1;",
    content
)

content = re.sub(
    r"const endOfSectionIndex = readmeStr\.indexOf\('\\n---\\n', sectionIndex \+ sectionHeader\.length\);",
    "const endOfSectionIndex = readmeStr.indexOf('\\n---', sectionIndex + sectionHeader.length);",
    content
)

content = re.sub(
    r"newReadme = readmeStr\.substring\(0, sectionIndex \+ sectionHeader\.length\) \+ markdownNotes \+ readmeStr\.substring\(endOfSectionIndex\);",
    "newReadme = readmeStr.substring(0, startOfNotesIndex2) + markdownNotes + '\\n' + readmeStr.substring(endOfSectionIndex);",
    content
)

content = re.sub(
    r"newReadme = readmeStr\.substring\(0, sectionIndex \+ sectionHeader\.length\) \+ markdownNotes;",
    "newReadme = readmeStr.substring(0, startOfNotesIndex2) + markdownNotes;",
    content
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed sync-readme.cjs!")

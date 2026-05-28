const fs = require('fs');
const path = require('path');

const updateNotesPath = path.join(__dirname, '../src/updateNotes.json');
const readmePath = path.join(__dirname, '../../README.md');

try {
  const notesStr = fs.readFileSync(updateNotesPath, 'utf-8');
  const notes = JSON.parse(notesStr);

  let markdownNotes = '';
  notes.forEach((note, index) => {
    markdownNotes += `### ${index === 0 ? 'Versi Terbaru' : 'Versi Sebelumnya'} (${note.timestamp})\n`;
    note.changes.forEach(change => {
      markdownNotes += `- ${change}\n`;
    });
    markdownNotes += '\n';
  });

  const readmeStr = fs.readFileSync(readmePath, 'utf-8');
  
  // Find the Catatan Rilis section
  const sectionHeader = '## 📝 Catatan Rilis & Riwayat Build Terbaru';
  const sectionIndex = readmeStr.indexOf(sectionHeader);
  const startOfNotesIndex = readmeStr.indexOf('
', sectionIndex) + 1;
  let nextNewLine = readmeStr.indexOf('
', startOfNotesIndex);
  if (readmeStr[nextNewLine-1] === '') nextNewLine++;
  const startOfNotesIndex2 = nextNewLine + 1;
  
  if (sectionIndex !== -1) {
    // Find the end of the section (marked by --- or EOF)
    const endOfSectionIndex = readmeStr.indexOf('
---', sectionIndex + sectionHeader.length);
    
    let newReadme = '';
    if (endOfSectionIndex !== -1) {
      newReadme = readmeStr.substring(0, startOfNotesIndex2) + markdownNotes + '
' + readmeStr.substring(endOfSectionIndex);
    } else {
      newReadme = readmeStr.substring(0, startOfNotesIndex2) + markdownNotes;
    }
    
    fs.writeFileSync(readmePath, newReadme);
    console.log('Successfully synced update notes to README.md');
  } else {
    console.warn('Could not find Catatan Rilis section in README.md');
  }
} catch (error) {
  console.error('Error syncing README.md:', error);
  process.exit(1);
}

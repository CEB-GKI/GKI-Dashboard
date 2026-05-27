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
  const sectionHeader = '## 📝 Catatan Rilis & Riwayat Build Terbaru\n\n';
  const sectionIndex = readmeStr.indexOf(sectionHeader);
  
  if (sectionIndex !== -1) {
    // Find the end of the section (marked by --- or EOF)
    const endOfSectionIndex = readmeStr.indexOf('\n---\n', sectionIndex + sectionHeader.length);
    
    let newReadme = '';
    if (endOfSectionIndex !== -1) {
      newReadme = readmeStr.substring(0, sectionIndex + sectionHeader.length) + markdownNotes + readmeStr.substring(endOfSectionIndex);
    } else {
      newReadme = readmeStr.substring(0, sectionIndex + sectionHeader.length) + markdownNotes;
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

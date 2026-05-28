const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..', '..');

try {
    const files = fs.readdirSync(rootDir);
    let deletedCount = 0;
    
    files.forEach(file => {
        // Only delete .py files in the root folder (scratch files)
        if (file.endsWith('.py')) {
            const filePath = path.join(rootDir, file);
            if (fs.statSync(filePath).isFile()) {
                fs.unlinkSync(filePath);
                deletedCount++;
            }
        }
    });

    if (deletedCount > 0) {
        console.log(`Cleanup complete: Removed ${deletedCount} unused Python scripts from root directory.`);
    }
} catch (error) {
    console.error('Error during cleanup:', error.message);
}

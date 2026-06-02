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

try {
    const distHtmlPath = path.join(__dirname, '..', 'dist', 'index.html');
    const targetHtmlPath = path.join(rootDir, 'GKI_Dashboard.html');
    
    if (fs.existsSync(distHtmlPath)) {
        fs.copyFileSync(distHtmlPath, targetHtmlPath);
        console.log(`Successfully copied build output to ${targetHtmlPath}`);
    }
} catch (error) {
    console.error('Error copying html file:', error.message);
}

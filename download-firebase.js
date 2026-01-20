// Download Firebase SDK files locally for Chrome Extension
// Run this script to download Firebase files: node download-firebase.js

const https = require('https');
const fs = require('fs');
const path = require('path');

const firebaseFiles = [
    'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js',
    'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js',
    'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js',
    'https://www.gstatic.com/firebasejs/10.7.1/firebase-functions-compat.js'
];

function downloadFile(url, filename) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filename);
        
        https.get(url, (response) => {
            response.pipe(file);
            
            file.on('finish', () => {
                file.close();
                console.log(`✅ Downloaded: ${filename}`);
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(filename, () => {}); // Delete the file async
            reject(err);
        });
    });
}

async function downloadAllFiles() {
    console.log('🚀 Downloading Firebase SDK files...');
    
    try {
        for (const url of firebaseFiles) {
            const filename = path.basename(url);
            await downloadFile(url, filename);
        }
        
        console.log('🎉 All Firebase files downloaded successfully!');
        console.log('📁 Files are now ready for your Chrome extension');
        
    } catch (error) {
        console.error('❌ Error downloading files:', error.message);
    }
}

// Run the download
downloadAllFiles();

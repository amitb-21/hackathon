const fs = require('fs');
const path = require('path');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created uploads directory');
} else {
  console.log('✅ Uploads directory exists');
}

// Clean up old files (optional - keeps uploads directory from growing)
const cleanupOldFiles = () => {
  try {
    const files = fs.readdirSync(uploadsDir);
    const now = Date.now();
    const maxAge = 60 * 60 * 1000; // 1 hour
    
    files.forEach(file => {
      const filePath = path.join(uploadsDir, file);
      const stats = fs.statSync(filePath);
      const age = now - stats.mtimeMs;
      
      if (age > maxAge) {
        fs.unlinkSync(filePath);
        console.log('🗑️ Cleaned up old file:', file);
      }
    });
  } catch (error) {
    console.error('Error cleaning up files:', error);
  }
};

// Run cleanup every hour
setInterval(cleanupOldFiles, 60 * 60 * 1000);

module.exports = { uploadsDir };

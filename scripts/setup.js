const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up HCM Environment...');

// 1. Check Directory Structure
const dirs = ['backend/logs', 'backend/uploads', 'tests/e2e/report'];
dirs.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
        console.log(`📂 Creating directory: ${dir}`);
        fs.mkdirSync(fullPath, { recursive: true });
    }
});

// 2. Check .env
if (!fs.existsSync('.env')) {
    console.log('⚠️  No .env file found. Creating from .env.example...');
    if (fs.existsSync('.env.example')) {
        fs.copyFileSync('.env.example', '.env');
        console.log('✅ Created .env');
    } else {
        console.error('❌ Error: .env.example not found!');
    }
}

// 3. Install Python Dependencies
console.log('📦 Installing Python dependencies...');
try {
    execSync('pip install -r backend/requirements.txt', { stdio: 'inherit' });
} catch (e) {
    console.error('❌ Failed to install Python requirements.');
}

console.log('✅ Setup Complete! Run "npm run dev" to start.');

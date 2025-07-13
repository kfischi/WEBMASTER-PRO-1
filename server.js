// ===================================
// WebMaster Pro - ROOT SERVER
// ===================================

console.log('🚀 WebMaster Pro starting from PROJECT ROOT...');

const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

console.log(`📡 Starting on port: ${PORT}`);
console.log(`📂 Working from: ${process.cwd()}`);

// Basic middleware
app.use(express.json());

// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Health check
app.get('/health', (req, res) => {
    console.log('🏥 Health check requested from ROOT server');
    res.status(200).json({
        status: 'healthy',
        message: 'WebMaster Pro is running from PROJECT ROOT!',
        timestamp: new Date().toISOString(),
        port: PORT,
        location: 'project-root',
        node_version: process.version
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: '🚀 WebMaster Pro Backend is LIVE from ROOT!',
        version: '1.0.0',
        location: 'project-root',
        endpoints: ['/health', '/api/quick-chat'],
        status: 'Railway deployment WORKING!'
    });
});

// Chat endpoint
app.post('/api/quick-chat', (req, res) => {
    console.log('💬 Chat request received at ROOT server');
    
    const { message } = req.body || {};
    
    res.json({
        success: true,
        response: `🎉 **SUCCESS! WebMaster Pro is WORKING!**

📨 קיבלתי: "${message || 'no message'}"

✅ **מצב המערכת:**
- השרת רץ מהשורש של הפרויקט
- Railway deployment עובד בהצלחה!
- API endpoints פעילים
- Health check מגיב
- מוכן לחיבור Frontend

🚀 **הצעד הבא:**
עכשיו אפשר לחבר את ai.editor.html לשרת הזה!

⭐ זוהי הוכחה שהמערכת פועלת!`,
        model: 'system-test',
        timestamp: new Date().toISOString(),
        server_location: 'project-root'
    });
});

// Error handling
app.use((error, req, res, next) => {
    console.error('❌ Error:', error);
    res.status(500).json({
        error: 'Server error',
        message: error.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not found',
        path: req.path
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log('🎉 =========================================');
    console.log('🚀 WebMaster Pro STARTED from PROJECT ROOT!');
    console.log(`📡 Port: ${PORT}`);
    console.log(`🏥 Health: http://localhost:${PORT}/health`);
    console.log(`📂 Location: Project Root`);
    console.log('✅ Railway deployment SUCCESSFUL!');
    console.log('🎉 =========================================');
});

console.log('📝 Server ready from ROOT, listening...');

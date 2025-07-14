const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

console.log('🚀 WebMaster Pro starting from PROJECT ROOT...');
console.log(`📡 Starting on port: ${PORT}`);
console.log(`🌐 Host: 0.0.0.0 (Railway Compatible)`);
console.log(`📂 Working from: ${process.cwd()}`);

// CORS
app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json());

// Logging
app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.path}`);
    next();
});

// Health Check
app.get('/health', (req, res) => {
    console.log('🏥 Health check requested from ROOT server');
    res.json({
        message: 'WebMaster Pro Backend',
        status: 'running',
        timestamp: new Date().toISOString(),
        port: PORT,
        host: '0.0.0.0'
    });
});

// Root
app.get('/', (req, res) => {
    console.log('🏠 Root endpoint accessed');
    res.json({
        name: 'WebMaster Pro Backend',
        status: 'operational',
        host: '0.0.0.0',
        port: PORT
    });
});

// Ping
app.get('/ping', (req, res) => {
    console.log('🏓 Ping received');
    res.send('pong');
});

// 404
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Start server - THIS IS THE KEY PART!
app.listen(PORT, '0.0.0.0', () => {
    console.log('📝 Server ready from ROOT, listening...');
    console.log('🎉 =========================================');
    console.log('🚀 WebMaster Pro STARTED from PROJECT ROOT!');
    console.log(`📡 Port: ${PORT}`);
    console.log(`🌐 Host: 0.0.0.0 (Railway External Access)`);
    console.log(`🏥 Health: http://0.0.0.0:${PORT}/health`);
    console.log(`📂 Location: Project Root`);
    console.log('✅ Railway deployment SUCCESSFUL!');
    console.log('🎉 =========================================');
});

module.exports = app;

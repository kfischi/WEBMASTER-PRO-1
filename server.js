const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

console.log('🚀 WebMaster Pro starting...');
console.log(`📡 Port: ${PORT}`);
console.log(`🌐 Host: 0.0.0.0 - Railway Compatible!`);

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
    console.log('🏥 Health check - SUCCESS!');
    res.json({
        message: 'WebMaster Pro Backend',
        status: 'running',
        timestamp: new Date().toISOString(),
        host: '0.0.0.0',
        port: PORT
    });
});

// Root
app.get('/', (req, res) => {
    console.log('🏠 Root accessed');
    res.json({
        name: 'WebMaster Pro',
        status: 'working',
        host: '0.0.0.0'
    });
});

// Ping
app.get('/ping', (req, res) => {
    console.log('🏓 Ping!');
    res.send('pong');
});

// Start Server - CRITICAL LINE!
app.listen(PORT, '0.0.0.0', () => {
    console.log('✅ ================================');
    console.log('🎉 SERVER STARTED SUCCESSFULLY!');
    console.log(`🌐 Host: 0.0.0.0 (NOT localhost!)`);
    console.log(`📡 Port: ${PORT}`);
    console.log(`🔗 Health: http://0.0.0.0:${PORT}/health`);
    console.log('✅ ================================');
});

module.exports = app;

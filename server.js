const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

// IMPORTANT: This log will show if the fix worked
console.log('🔥 FIXED SERVER STARTING - NOT LOCALHOST!');
console.log(`📡 Port: ${PORT}`);
console.log(`🌐 Host: 0.0.0.0 (RAILWAY EXTERNAL ACCESS)`);

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    console.log('🏥 Health check - FIXED VERSION!');
    res.json({
        message: 'WebMaster Pro Backend - FIXED!',
        status: 'running',
        host: '0.0.0.0',
        port: PORT,
        version: 'FIXED_VERSION',
        timestamp: new Date().toISOString()
    });
});

app.get('/', (req, res) => {
    res.json({
        name: 'WebMaster Pro - FIXED',
        host: '0.0.0.0',
        status: 'working'
    });
});

app.get('/ping', (req, res) => {
    res.send('pong-fixed');
});

// THIS IS THE CRITICAL LINE THAT FIXES EVERYTHING!
app.listen(PORT, '0.0.0.0', () => {
    console.log('🎉 ========================================');
    console.log('✅ FIXED SERVER STARTED SUCCESSFULLY!');
    console.log('🌐 Host: 0.0.0.0 (NOT localhost!)');
    console.log(`📡 Port: ${PORT}`);
    console.log('🔗 Health: http://0.0.0.0:' + PORT + '/health');
    console.log('✅ THIS IS THE FIXED VERSION!');
    console.log('🎉 ========================================');
});

module.exports = app;

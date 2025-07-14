// 🔧 WebMaster Pro - Railway Port Fix
// Replace the server listening part in your server.js

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CRITICAL: Railway port configuration
const PORT = process.env.PORT || 8080; // Railway provides this
const HOST = '0.0.0.0'; // MUST be 0.0.0.0 for Railway

console.log('🚀 Starting WebMaster Pro Backend...');
console.log(`📍 Port from Railway: ${process.env.PORT || 'not set'}`);
console.log(`📍 Using Port: ${PORT}`);
console.log(`📍 Host: ${HOST}`);

// ... (keep all your existing middleware and routes)

// CORS Configuration
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));

// Add request logging
app.use((req, res, next) => {
    console.log(`📨 ${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health Check
app.get('/health', (req, res) => {
    console.log('💗 Health check requested');
    
    const healthData = {
        message: 'WebMaster Pro Backend',
        status: 'running',
        timestamp: new Date().toISOString(),
        port: PORT,
        host: HOST,
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        railwayPort: process.env.PORT || 'not set'
    };
    
    console.log('✅ Health check response sent');
    res.status(200).json(healthData);
});

// Root endpoint
app.get('/', (req, res) => {
    console.log('🏠 Root endpoint accessed');
    
    res.status(200).json({
        name: 'WebMaster Pro Backend',
        description: 'AI-powered website builder API',
        version: '1.0.0',
        status: 'operational',
        timestamp: new Date().toISOString(),
        port: PORT,
        host: HOST
    });
});

// Simple ping
app.get('/ping', (req, res) => {
    console.log('🏓 Ping received');
    res.status(200).send('pong');
});

// Test endpoint
app.get('/api/test', (req, res) => {
    console.log('🧪 Test endpoint accessed');
    res.status(200).json({
        success: true,
        message: 'Backend is working!',
        port: PORT,
        host: HOST,
        timestamp: new Date().toISOString()
    });
});

// CRITICAL: Start server with correct host and port
const server = app.listen(PORT, HOST, () => {
    console.log('🎉 ===================================');
    console.log('✅ WebMaster Pro Backend STARTED!');
    console.log(`🌐 Server running on: http://${HOST}:${PORT}`);
    console.log(`🔗 External URL: Railway will provide this`);
    console.log(`📡 Health check: /health`);
    console.log(`🏓 Ping test: /ping`);
    console.log('🎉 ===================================');
    
    // Railway specific logging
    if (process.env.RAILWAY_ENVIRONMENT) {
        console.log(`🚂 Railway Environment: ${process.env.RAILWAY_ENVIRONMENT}`);
    }
    
    if (process.env.RAILWAY_SERVICE_NAME) {
        console.log(`🏷️ Railway Service: ${process.env.RAILWAY_SERVICE_NAME}`);
    }
});

// Handle server errors
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use!`);
    } else {
        console.error('❌ Server error:', error);
    }
    process.exit(1);
});

// Graceful shutdown
const shutdown = (signal) => {
    console.log(`\n🛑 ${signal} received, shutting down gracefully...`);
    
    server.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
    });
    
    setTimeout(() => {
        console.log('⚠️ Forcing shutdown after timeout');
        process.exit(1);
    }, 30000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = app;

// 🔧 WebMaster Pro - Railway Host Fix
// הבעיה: השרת רץ על localhost במקום 0.0.0.0
// הפתרון: שנה את app.listen להשתמש ב-0.0.0.0

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CRITICAL: Railway needs 0.0.0.0, not localhost!
const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0'; // זה הקטע הקריטי!

console.log('🚀 WebMaster Pro starting from PROJECT ROOT...');
console.log(`📡 Starting on port: ${PORT}`);
console.log(`🌐 Host: ${HOST} (MUST be 0.0.0.0 for Railway)`);
console.log(`📂 Working from: ${process.cwd()}`);

// CORS - Allow all for testing
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
    console.log(`📨 ${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health Check - הכי חשוב!
app.get('/health', (req, res) => {
    console.log('🏥 Health check requested from ROOT server');
    
    const healthData = {
        message: 'WebMaster Pro Backend',
        status: 'running',
        timestamp: new Date().toISOString(),
        port: PORT,
        host: HOST,
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        version: '1.0.0'
    };
    
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
        host: HOST,
        port: PORT
    });
});

// Ping test
app.get('/ping', (req, res) => {
    console.log('🏓 Ping received');
    res.status(200).send('pong');
});

// Test endpoint
app.get('/api/test', (req, res) => {
    console.log('🧪 Test endpoint accessed');
    res.status(200).json({
        success: true,
        message: 'Backend is working perfectly!',
        timestamp: new Date().toISOString(),
        host: HOST,
        port: PORT
    });
});

// 404 handler
app.use((req, res) => {
    console.log(`❌ 404 - ${req.method} ${req.path}`);
    res.status(404).json({
        error: 'Endpoint not found',
        path: req.path,
        availableEndpoints: ['/', '/health', '/ping', '/api/test']
    });
});

// Error handler
app.use((error, req, res, next) => {
    console.error('💥 Server Error:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: error.message
    });
});

// CRITICAL: Listen on 0.0.0.0, NOT localhost!
const server = app.listen(PORT, HOST, () => {
    console.log('📝 Server ready from ROOT, listening...');
    console.log('🎉 =========================================');
    console.log('🚀 WebMaster Pro STARTED from PROJECT ROOT!');
    console.log(`📡 Port: ${PORT}`);
    console.log(`🌐 Host: ${HOST} (Railway External Access)`);
    console.log(`🏥 Health: http://${HOST}:${PORT}/health`);
    console.log(`📂 Location: Project Root`);
    console.log('✅ Railway deployment SUCCESSFUL!');
    console.log('🎉 =========================================');
});

// Handle errors
server.on('error', (error) => {
    console.error('❌ Server startup error:', error);
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use!`);
    }
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

module.exports = app;

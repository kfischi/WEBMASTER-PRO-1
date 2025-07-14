const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

// CRITICAL FIX: קריאה למשתני Environment עם fallback ל-0.0.0.0
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || process.env.BIND_ADDRESS || process.env.SERVER_HOST || '0.0.0.0';

console.log('🔧 FIXED SERVER STARTING - PACKAGE.JSON + ENV SUPPORT!');
console.log(`📡 Port: ${PORT}`);
console.log(`🌐 Host: ${HOST} (FROM ENV OR FALLBACK TO 0.0.0.0)`);
console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);

// Database connection (preserve existing data)
let pool;
if (process.env.DATABASE_URL) {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    console.log('✅ Database connection configured');
} else {
    console.log('⚠️ No DATABASE_URL found');
}

// Middleware
app.use(cors({
    origin: ['https://webmasterproapp.com', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    console.log(`📨 ${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health Check - הכי חשוב!
app.get('/health', async (req, res) => {
    console.log('🏥 Health check - FIXED VERSION WITH ENV SUPPORT!');
    
    let dbStatus = 'not configured';
    if (pool) {
        try {
            const dbTest = await pool.query('SELECT NOW()');
            dbStatus = 'connected';
        } catch (error) {
            dbStatus = 'error: ' + error.message;
        }
    }
    
    const healthData = {
        message: 'WebMaster Pro Backend - FIXED!',
        status: 'running',
        host: HOST,
        port: PORT,
        database: dbStatus,
        environment: process.env.NODE_ENV || 'development',
        version: 'FIXED_WITH_ENV_SUPPORT',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        envVariables: {
            hasHOST: !!process.env.HOST,
            hasBIND_ADDRESS: !!process.env.BIND_ADDRESS,
            hasSERVER_HOST: !!process.env.SERVER_HOST,
            hasDATABASE_URL: !!process.env.DATABASE_URL
        }
    };
    
    console.log('✅ Health check response sent - FIXED VERSION!');
    res.status(200).json(healthData);
});

// Root endpoint
app.get('/', (req, res) => {
    console.log('🏠 Root endpoint - FIXED VERSION');
    res.status(200).json({
        name: 'WebMaster Pro - FIXED VERSION',
        description: 'AI-powered website builder with fixed host',
        version: 'FIXED_WITH_ENV_SUPPORT',
        status: 'operational',
        host: HOST,
        port: PORT,
        timestamp: new Date().toISOString()
    });
});

// API Test endpoint
app.get('/api/test', (req, res) => {
    console.log('🧪 API Test - FIXED VERSION');
    res.status(200).json({
        success: true,
        message: 'FIXED API WORKING!',
        host: HOST,
        port: PORT,
        version: 'FIXED_WITH_ENV_SUPPORT',
        timestamp: new Date().toISOString()
    });
});

// Ping endpoint
app.get('/ping', (req, res) => {
    console.log('🏓 Ping - FIXED VERSION');
    res.status(200).send('pong-fixed');
});

// AI endpoint placeholder (for future AI integration)
app.post('/api/ai/test', (req, res) => {
    console.log('🤖 AI Test endpoint');
    const { prompt } = req.body;
    
    res.status(200).json({
        success: true,
        message: 'AI endpoint ready (placeholder)',
        prompt: prompt || 'test',
        response: 'AI integration will be added next',
        host: HOST,
        hasOpenAI: !!process.env.OPENAI_API_KEY,
        hasClaude: !!process.env.ANTHROPIC_API_KEY
    });
});

// 404 handler
app.use((req, res) => {
    console.log(`❌ 404 - ${req.method} ${req.path}`);
    res.status(404).json({
        error: 'Endpoint not found',
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString(),
        availableEndpoints: [
            'GET /',
            'GET /health', 
            'GET /ping',
            'GET /api/test',
            'POST /api/ai/test'
        ]
    });
});

// Error handler
app.use((error, req, res, next) => {
    console.error('💥 Server Error:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
    });
});

// CRITICAL: Listen on HOST (from env or fallback to 0.0.0.0)
const server = app.listen(PORT, HOST, () => {
    console.log('✅ ==========================================');
    console.log('🎉 FIXED SERVER STARTED SUCCESSFULLY!');
    console.log(`🌐 Host: ${HOST} (FROM ENV OR FALLBACK)`);
    console.log(`📡 Port: ${PORT}`);
    console.log(`🔗 Health: http://${HOST}:${PORT}/health`);
    console.log(`📊 Database: ${pool ? 'Configured' : 'Not configured'}`);
    console.log('✅ All data and Environment Variables preserved!');
    console.log('✅ ==========================================');
});

// Handle server errors
server.on('error', (error) => {
    console.error('❌ Server startup error:', error);
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use!`);
    }
    process.exit(1);
});

// Graceful shutdown
const shutdown = (signal) => {
    console.log(`\n🛑 ${signal} received, shutting down gracefully...`);
    
    server.close(() => {
        console.log('✅ HTTP server closed');
        if (pool) {
            pool.end();
        }
        process.exit(0);
    });
    
    setTimeout(() => {
        console.log('⚠️ Forcing shutdown after timeout');
        process.exit(1);
    }, 30000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Catch unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

module.exports = app;

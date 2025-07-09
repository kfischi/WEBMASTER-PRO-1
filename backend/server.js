// החלף את backend/server.js הקיים בקובץ הזה

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🚀 Starting WebMaster Pro Backend...');

// Security
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

// CORS
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:8080',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:8080',
        'https://*.netlify.app',
        'https://webmaster-pro.netlify.app' // עדכן לפי השם שלך
    ],
    credentials: true
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Log requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Import routes - רק אם הקבצים קיימים
let aiRoutes;
try {
    aiRoutes = require('./src/routes/ai');
    console.log('✅ AI routes loaded');
} catch (error) {
    console.log('⚠️ AI routes not found, creating basic route');
    aiRoutes = express.Router();
    aiRoutes.get('/health', (req, res) => {
        res.json({ success: true, message: 'AI service placeholder' });
    });
}

// Use routes
app.use('/api/ai', aiRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'WebMaster Pro Backend is running! 🚀',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        services: {
            openai: !!process.env.OPENAI_API_KEY,
            anthropic: !!process.env.ANTHROPIC_API_KEY,
            server: true
        }
    });
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: 'Backend connection successful! 🎉',
        timestamp: new Date().toISOString()
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: err.message
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.originalUrl
    });
});

// Start server
app.listen(PORT, () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 WebMaster Pro Backend Started Successfully!');
    console.log(`📡 Server: http://localhost:${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🤖 OpenAI API: ${process.env.OPENAI_API_KEY ? '✅ Available' : '❌ Missing'}`);
    console.log(`🤖 Anthropic API: ${process.env.ANTHROPIC_API_KEY ? '✅ Available' : '❌ Missing'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

module.exports = app;

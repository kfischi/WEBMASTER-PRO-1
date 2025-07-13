// ===================================
// WebMaster Pro Backend Server
// ===================================

console.log('🚀 WebMaster Pro Backend starting...');

// Load environment variables first
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

console.log(`📡 Port: ${PORT}`);
console.log(`📂 Working directory: ${process.cwd()}`);

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint - REQUIRED for Railway
app.get('/health', (req, res) => {
    console.log('🏥 Health check requested');
    
    res.status(200).json({
        status: 'healthy',
        message: 'WebMaster Pro Backend is running!',
        timestamp: new Date().toISOString(),
        port: PORT,
        node_version: process.version,
        environment: process.env.NODE_ENV || 'development'
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: '🚀 WebMaster Pro Backend is LIVE!',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            chat: '/api/quick-chat',
            test: '/api/test'
        },
        ai_engines: {
            openai: process.env.OPENAI_API_KEY ? 'configured' : 'missing',
            gemini: process.env.GEMINI_API_KEY ? 'configured' : 'missing'
        }
    });
});

// Simple test endpoint
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: 'API is working!',
        timestamp: new Date().toISOString(),
        server_location: 'backend'
    });
});

// Chat endpoint (simple version without AI for now)
app.post('/api/quick-chat', (req, res) => {
    console.log('💬 Chat request received');
    
    try {
        const { message, model } = req.body || {};
        
        if (!message) {
            return res.status(400).json({
                success: false,
                error: 'Message is required'
            });
        }

        // Simple response for now (will add AI later)
        const response = `🤖 **WebMaster Pro Multi-AI Response**

קיבלתי את ההודעה שלך: "${message}"

🎉 **מצב המערכת:**
✅ השרת פועל בהצלחה מתיקיית backend
✅ API endpoints זמינים
✅ מוכן לקבלת בקשות
✅ CORS מוגדר נכון

🔧 **הצעד הבא:**
חיבור מנועי AI (OpenAI, Claude, Gemini) למענה מתקדם.

⚡ **כרגע זוהי תשובה בסיסית** שמוכיחה שהשרת עובד!`;

        res.json({
            success: true,
            response: response,
            model: model || 'test-system',
            timestamp: new Date().toISOString(),
            server_info: {
                location: 'backend',
                version: '1.0.0',
                status: 'operational'
            }
        });

    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('🚨 Server error:', error);
    res.status(500).json({
        error: 'Server error',
        message: error.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        path: req.path,
        available_endpoints: ['/', '/health', '/api/test', '/api/quick-chat']
    });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('🎉 =========================================');
    console.log(`🚀 WebMaster Pro Backend STARTED!`);
    console.log(`📡 Port: ${PORT}`);
    console.log(`📂 Location: backend/`);
    console.log(`🏥 Health: http://localhost:${PORT}/health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`⚡ Node.js: ${process.version}`);
    console.log('✅ Ready to receive requests!');
    console.log('🎉 =========================================');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('📴 Received SIGTERM, shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

console.log('📝 Server initialization complete, listening for connections...');

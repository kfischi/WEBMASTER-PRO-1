// ===================================
// WebMaster Pro Simple Server - Works Immediately
// ===================================

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Basic middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
            openai: process.env.OPENAI_API_KEY ? 'configured' : 'not_configured',
            anthropic: process.env.ANTHROPIC_API_KEY ? 'configured' : 'not_configured'
        }
    });
});

// Simple AI Chat endpoint
app.post('/api/quick-chat', async (req, res) => {
    try {
        const { message, model = 'gpt' } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        let response = '';
        
        // Try OpenAI
        if (model === 'gpt' && process.env.OPENAI_API_KEY) {
            try {
                const { OpenAI } = require('openai');
                const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
                
                const completion = await openai.chat.completions.create({
                    model: 'gpt-4',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a helpful AI assistant for website building. Respond in Hebrew when the user writes in Hebrew.'
                        },
                        {
                            role: 'user',
                            content: message
                        }
                    ],
                    max_tokens: 1000,
                    temperature: 0.7
                });
                
                response = completion.choices[0].message.content;
            } catch (openaiError) {
                console.error('OpenAI Error:', openaiError.message);
                throw new Error('OpenAI request failed');
            }
        }
        // Try Claude
        else if (model === 'claude' && process.env.ANTHROPIC_API_KEY) {
            try {
                const Anthropic = require('@anthropic-ai/sdk');
                const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
                
                const result = await anthropic.messages.create({
                    model: 'claude-3-sonnet-20240229',
                    max_tokens: 1000,
                    system: 'You are a helpful AI assistant for website building. Respond in Hebrew when the user writes in Hebrew.',
                    messages: [
                        {
                            role: 'user',
                            content: message
                        }
                    ]
                });
                
                response = result.content[0].text;
            } catch (claudeError) {
                console.error('Claude Error:', claudeError.message);
                throw new Error('Claude request failed');
            }
        }
        else {
            // Fallback response if no AI is available
            response = `🤖 Multi-AI Assistant מגיב:\n\nקיבלתי את ההודעה: "${message}"\n\nכרגע אני עובד במצב דמו. לחיבור מלא לAI, יש לוודא שמפתחות ה-API מוגדרים נכון ב-Railway.\n\n✅ שרת פעיל ומוכן לקבלת בקשות\n🔧 זמין לעריכת אתרים ושיפורים\n🎯 מוכן לעבודה עם Multi-AI Engine`;
        }

        res.json({
            success: true,
            response,
            model: model,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('API Error:', error.message);
        res.status(500).json({ 
            success: false, 
            error: error.message,
            fallback_response: `🔧 הגעתה בקשה נתקלה בבעיה טכנית, אבל השרת פועל!\n\nההודעה שלך: "${req.body.message}"\n\nהשרת WebMaster Pro פעיל ומוכן. יתכן שמפתחות ה-AI זקוקים להגדרה או שיש בעיה זמנית ברשת.`
        });
    }
});

// Simple test endpoints
app.post('/api/test/openai', async (req, res) => {
    try {
        if (!process.env.OPENAI_API_KEY) {
            return res.json({ 
                success: false, 
                message: 'OpenAI API key not configured',
                configured: false 
            });
        }

        const { OpenAI } = require('openai');
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        
        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [{ role: 'user', content: 'Say hello briefly' }],
            max_tokens: 50
        });

        res.json({
            success: true,
            message: 'OpenAI is working perfectly',
            response: completion.choices[0].message.content,
            configured: true
        });
    } catch (error) {
        res.json({ 
            success: false, 
            message: 'OpenAI test failed',
            error: error.message,
            configured: false
        });
    }
});

app.post('/api/test/claude', async (req, res) => {
    try {
        if (!process.env.ANTHROPIC_API_KEY) {
            return res.json({ 
                success: false, 
                message: 'Claude API key not configured',
                configured: false 
            });
        }

        const Anthropic = require('@anthropic-ai/sdk');
        const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        
        const message = await anthropic.messages.create({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 50,
            messages: [{ role: 'user', content: 'Say hello briefly' }]
        });

        res.json({
            success: true,
            message: 'Claude is working perfectly',
            response: message.content[0].text,
            configured: true
        });
    } catch (error) {
        res.json({ 
            success: false, 
            message: 'Claude test failed',
            error: error.message,
            configured: false
        });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 WebMaster Pro Backend running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    
    // AI status
    console.log(`🤖 AI Status:`);
    console.log(`   OpenAI: ${process.env.OPENAI_API_KEY ? '✅ Configured' : '❌ Missing'}`);
    console.log(`   Claude: ${process.env.ANTHROPIC_API_KEY ? '✅ Configured' : '❌ Missing'}`);
    
    console.log(`\n🎯 Available endpoints:`);
    console.log(`   GET  /health`);
    console.log(`   POST /api/quick-chat`);
    console.log(`   POST /api/test/openai`);
    console.log(`   POST /api/test/claude`);
    
    console.log(`\n✨ WebMaster Pro Multi-AI Ready!`);
});

module.exports = app;

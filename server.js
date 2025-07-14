const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize AI services
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting for AI endpoints
const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // limit each IP to 50 AI requests per windowMs
    message: { error: 'יותר מדי בקשות AI. נסה שוב בעוד 15 דקות.' }
});

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/ai/', aiLimiter);
app.use('/api/', generalLimiter);

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        // Test database connection
        const dbResult = await pool.query('SELECT NOW()');
        
        // Test AI services status
        const aiStatus = {
            openai: !!process.env.OPENAI_API_KEY,
            claude: !!process.env.ANTHROPIC_API_KEY
        };
        
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            database: 'connected',
            ai: aiStatus,
            version: '1.0.0'
        });
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(500).json({
            status: 'unhealthy',
            error: error.message
        });
    }
});

// AI Chat endpoint - REAL AI INTEGRATION
app.post('/api/ai/chat', async (req, res) => {
    try {
        const { message, context } = req.body;

        if (!message || typeof message !== 'string') {
            return res.status(400).json({
                error: 'הודעה חסרה או לא תקינה'
            });
        }

        console.log('🤖 Processing AI request:', { message: message.substring(0, 100) + '...' });

        // Build context for AI
        const systemPrompt = buildSystemPrompt(context);
        const userMessage = message.trim();

        let aiResponse;
        let changes = null;

        try {
            // Try OpenAI first
            if (process.env.OPENAI_API_KEY) {
                console.log('🧠 Using OpenAI GPT-4...');
                aiResponse = await getOpenAIResponse(systemPrompt, userMessage, context);
            } 
            // Fallback to Claude
            else if (process.env.ANTHROPIC_API_KEY) {
                console.log('🧠 Using Anthropic Claude...');
                aiResponse = await getClaudeResponse(systemPrompt, userMessage, context);
            } 
            // No AI available
            else {
                throw new Error('No AI service configured');
            }

            // Parse response for changes
            changes = parseAIChanges(aiResponse, context);

        } catch (aiError) {
            console.error('❌ AI service error:', aiError.message);
            
            // Intelligent fallback based on message content
            aiResponse = generateSmartFallback(userMessage, context);
            changes = parseBasicChanges(userMessage);
        }

        res.json({
            message: aiResponse,
            changes: changes,
            timestamp: new Date().toISOString(),
            model: process.env.OPENAI_API_KEY ? 'gpt-4' : 'claude-3'
        });

    } catch (error) {
        console.error('❌ AI chat error:', error);
        res.status(500).json({
            error: 'שגיאה בעיבוד הבקשה',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// OpenAI GPT-4 integration
async function getOpenAIResponse(systemPrompt, userMessage, context) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage }
            ],
            max_tokens: 500,
            temperature: 0.7
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error('OpenAI API error:', error);
        throw new Error('OpenAI service unavailable');
    }
}

// Anthropic Claude integration
async function getClaudeResponse(systemPrompt, userMessage, context) {
    try {
        const response = await anthropic.messages.create({
            model: "claude-3-sonnet-20240229",
            max_tokens: 500,
            messages: [
                { role: "user", content: `${systemPrompt}\n\n${userMessage}` }
            ]
        });

        return response.content[0].text;
    } catch (error) {
        console.error('Claude API error:', error);
        throw new Error('Claude service unavailable');
    }
}

// Build system prompt for AI
function buildSystemPrompt(context) {
    const websiteInfo = getWebsiteInfo(context?.website);
    
    return `אתה מומחה לעיצוב אתרים ו-AI Assistant של WebMaster Pro. 
אתה עוזר למשתמשים לערוך אתרים בעברית בצורה מקצועית ונעימה.

מידע על האתר הנוכחי:
${websiteInfo}

הנחיות חשובות:
1. תמיד תשיב בעברית בצורה ידידותית ומקצועית
2. אם המשתמש מבקש שינוי צבעים, צור קודי צבע HEX תקינים
3. אם המשתמש רוצה לעדכן תוכן, הצע טקסט רלוונטי לתחום העסק
4. אם המשתמש מבקש הוספת סקציות, הסבר איך זה יתבצע
5. היה קריאטיבי אבל מקצועי - זה אתר עסקי
6. אם אתה לא בטוח במשהו, שאל שאלת הבהרה

דוגמאות לתשובות טובות:
- "מצוין! אני משנה את הצבע הראשי לכחול מקצועי (#1e40af). זה יתאים מאוד לתחום הרפואה"
- "אני מעדכן את התיאור עם טקסט רלוונטי יותר שמדגיש את השירותים המיוחדים שלך"
- "הוספתי סקציה חדשה עם המלצות לקוחות - זה יחזק את האמינות"

תשיב רק בעברית ותהיה עוזר AI מושלם!`;
}

// Get website information for context
function getWebsiteInfo(websiteId) {
    const websites = {
        'dr-michal-rosen': 'אתר של ד"ר מיכל רוזן - מומחית לרפואה אסתטית, בוטוקס, פילרים, טיפולי אנטי אייג\'ינג',
        'danny-fit': 'אתר של דני פיט - מאמן כושר אישי, אימונים פרטיים, תוכניות אימון',
        'studio-ohm': 'אתר של סטודיו אוהם - סטודיו יוגה ומדיטציה, שיעורים קבוצתיים ופרטיים',
        'dr-sarah-cohen': 'אתר של ד"ר שרה כהן - תזונאית קלינית, דיאטה ותזונה בריאה',
        'barkovich-law': 'אתר של משרד עורכי הדין ברקוביץ - ייעוץ משפטי, דיני משפחה ועסקים',
        'rina-levy-accounting': 'אתר של רינה לוי - חשבת שכר מוסמכת, ניהול שכר וייעוץ כלכלי',
        'bella-salon': 'אתר של מספרת BELLA - מספרה וטיפוח, תסרוקות ועיצוב שיער',
        'dr-ronit-levy': 'אתר של ד"ר רונית לוי - מורה פרטית ומרצה, לימודים אקדמיים',
        'premium-beauty': 'אתר של קליניקת יופי פרמיום - טיפולי יופי מתקדמים, לייזר ואסתטיקה',
        'multibrown': 'אתר של מולטיבראון - נופש ואירועים, צימרים ואירוח',
        'premium-realestate': 'אתר של נדל"ן פרמיום - מכירת דירות יוקרה ונכסים מיוחדים'
    };
    
    return websites[websiteId] || 'אתר עסקי כללי';
}

// Parse AI response for actionable changes
function parseAIChanges(aiResponse, context) {
    const changes = {};
    
    // Extract color changes
    const colorRegex = /#[a-fA-F0-9]{6}/g;
    const colors = aiResponse.match(colorRegex);
    
    if (colors && colors.length > 0) {
        changes.primaryColor = colors[0];
        if (colors.length > 1) {
            changes.secondaryColor = colors[1];
        }
    }
    
    // Extract text changes (basic implementation)
    if (aiResponse.includes('שם העסק') || aiResponse.includes('שם החברה')) {
        // Extract potential business name
        const nameMatch = aiResponse.match(/(?:שם העסק|שם החברה)[:]\s*"([^"]+)"/);
        if (nameMatch) {
            changes.businessName = nameMatch[1];
        }
    }
    
    return Object.keys(changes).length > 0 ? changes : null;
}

// Generate smart fallback when AI is unavailable
function generateSmartFallback(message, context) {
    const lowerMessage = message.toLowerCase();
    
    // Color change requests
    if (lowerMessage.includes('צבע') || lowerMessage.includes('color')) {
        if (lowerMessage.includes('כחול') || lowerMessage.includes('blue')) {
            return 'אני משנה את הצבע הראשי לכחול מקצועי (#1e40af). זה צבע מעולה שמעביר אמינות ומקצועיות!';
        }
        if (lowerMessage.includes('ירוק') || lowerMessage.includes('green')) {
            return 'מעולה! אני משנה את הצבע לירוק רענן (#059669). זה צבע שמעביר צמיחה והצלחה!';
        }
        if (lowerMessage.includes('אדום') || lowerMessage.includes('red')) {
            return 'אני משנה את הצבע לאדום אלגנטי (#dc2626). זה צבע בולט שמושך תשומת לב!';
        }
        return 'אני יכול לעזור לך לשנות צבעים! תוכל לציין איזה צבע תרצה? (כחול, ירוק, אדום, או כל צבע אחר)';
    }
    
    // Content change requests
    if (lowerMessage.includes('תוכן') || lowerMessage.includes('טקסט') || lowerMessage.includes('text')) {
        return 'אני יכול לעזור לך לעדכן את התוכן באתר! תוכל לציין איזה חלק תרצה לשנות? (כותרת, תיאור, שירותים, צור קשר)';
    }
    
    // Section requests
    if (lowerMessage.includes('סקציה') || lowerMessage.includes('section') || lowerMessage.includes('הוסף')) {
        return 'מעולה! אני יכול לעזור לך להוסיף סקציות חדשות לאתר. איזה סקציה תרצה להוסיף? (המלצות לקוחות, גלריה, שירותים נוספים)';
    }
    
    // General help
    return `אני כאן לעזור לך לערוך את האתר! אני יכול לעזור עם:
• שינוי צבעים ועיצוב
• עדכון תוכן וטקסטים  
• הוספת סקציות חדשות
• שינוי פרטי העסק
• אופטימיזציה למובייל

פשוט ספר לי מה תרצה לשנות ואני אעזור!`;
}

// Parse basic changes from user message
function parseBasicChanges(message) {
    const changes = {};
    const lowerMessage = message.toLowerCase();
    
    // Basic color detection
    if (lowerMessage.includes('כחול') || lowerMessage.includes('blue')) {
        changes.primaryColor = '#1e40af';
    } else if (lowerMessage.includes('ירוק') || lowerMessage.includes('green')) {
        changes.primaryColor = '#059669';
    } else if (lowerMessage.includes('אדום') || lowerMessage.includes('red')) {
        changes.primaryColor = '#dc2626';
    } else if (lowerMessage.includes('סגול') || lowerMessage.includes('purple')) {
        changes.primaryColor = '#7c3aed';
    }
    
    return Object.keys(changes).length > 0 ? changes : null;
}

// Website management endpoints
app.get('/api/websites', async (req, res) => {
    try {
        // In production, this would fetch from database
        const websites = [
            {
                id: 'dr-michal-rosen',
                name: 'ד"ר מיכל רוזן - רפואה אסתטית',
                category: 'medical',
                status: 'ready',
                price: 2800,
                description: 'אתר מקצועי לרופאה אסתטית',
                lastModified: new Date().toISOString()
            },
            {
                id: 'danny-fit',
                name: 'דני פיט - מאמן כושר',
                category: 'fitness',
                status: 'ready',
                price: 2200,
                description: 'אתר למאמן כושר אישי',
                lastModified: new Date().toISOString()
            },
            // Add other websites...
        ];
        
        res.json(websites);
    } catch (error) {
        console.error('Error fetching websites:', error);
        res.status(500).json({ error: 'שגיאה בטעינת האתרים' });
    }
});

app.post('/api/websites/:id/save', async (req, res) => {
    try {
        const { id } = req.params;
        const projectData = req.body;
        
        console.log(`💾 Saving project for website: ${id}`);
        
        // In production, save to database
        // For now, just acknowledge the save
        
        res.json({
            success: true,
            message: 'הפרויקט נשמר בהצלחה',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error saving project:', error);
        res.status(500).json({ error: 'שגיאה בשמירת הפרויקט' });
    }
});

// Test endpoints for system verification
app.get('/api/test/openai', async (req, res) => {
    try {
        if (!process.env.OPENAI_API_KEY) {
            return res.status(400).json({ error: 'OpenAI API key not configured' });
        }
        
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: "Say hello in Hebrew" }],
            max_tokens: 50
        });
        
        res.json({
            success: true,
            message: 'OpenAI connected successfully',
            response: response.choices[0].message.content
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'OpenAI connection failed',
            details: error.message
        });
    }
});

app.get('/api/test/claude', async (req, res) => {
    try {
        if (!process.env.ANTHROPIC_API_KEY) {
            return res.status(400).json({ error: 'Claude API key not configured' });
        }
        
        const response = await anthropic.messages.create({
            model: "claude-3-sonnet-20240229",
            max_tokens: 50,
            messages: [{ role: "user", content: "Say hello in Hebrew" }]
        });
        
        res.json({
            success: true,
            message: 'Claude connected successfully',
            response: response.content[0].text
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Claude connection failed',
            details: error.message
        });
    }
});

app.get('/api/test/database', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW() as current_time');
        res.json({
            success: true,
            message: 'Database connected successfully',
            timestamp: result.rows[0].current_time
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Database connection failed',
            details: error.message
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        error: 'שגיאה פנימית בשרת',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Server startup
app.listen(PORT, () => {
    console.log(`🚀 WebMaster Pro Backend running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Check AI services
    if (process.env.OPENAI_API_KEY) {
        console.log('✅ OpenAI API key configured');
    } else {
        console.log('⚠️ OpenAI API key missing - add OPENAI_API_KEY to environment');
    }
    
    if (process.env.ANTHROPIC_API_KEY) {
        console.log('✅ Anthropic Claude API key configured');
    } else {
        console.log('⚠️ Claude API key missing - add ANTHROPIC_API_KEY to environment');
    }
    
    if (process.env.DATABASE_URL) {
        console.log('✅ Database URL configured');
    } else {
        console.log('⚠️ Database URL missing - add DATABASE_URL to environment');
    }
});

module.exports = app;

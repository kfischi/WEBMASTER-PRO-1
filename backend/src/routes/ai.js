// העתק את הקובץ הזה ל: backend/src/routes/ai.js

const express = require('express');
const router = express.Router();

// בדיקת זמינות AI
router.get('/health', (req, res) => {
    console.log('🔍 בודק זמינות AI...');
    
    res.json({
        success: true,
        message: 'AI Service is running',
        openai: !!process.env.OPENAI_API_KEY,
        anthropic: !!process.env.ANTHROPIC_API_KEY,
        timestamp: new Date().toISOString()
    });
});

// AI Chat פשוט (ללא OpenAI עדיין - נוסיף בהמשך)
router.post('/chat', async (req, res) => {
    try {
        const { message, context, businessType, websiteId } = req.body;
        
        console.log(`🤖 AI Request: ${message}`);

        // זה יהיה simulation עד שנוסיף את OpenAI
        const aiResponse = generateSimulatedResponse(message);

        res.json({
            success: true,
            response: aiResponse.response,
            changes: aiResponse.changes,
            model: 'simulation',
            timestamp: new Date().toISOString()
        });

        console.log('✅ AI Response sent successfully');

    } catch (error) {
        console.error('❌ AI Error:', error);
        
        res.status(500).json({
            success: false,
            error: 'AI processing failed',
            message: error.message
        });
    }
});

// פונקציה מסייעת
function generateSimulatedResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('צבע') || lowerMessage.includes('color')) {
        return {
            response: "שיניתי את הצבעים להיות יותר מודרניים! השתמשתי בכחול מקצועי וירוק טבעי.",
            changes: [
                {
                    type: 'color_change',
                    description: 'שינוי צבעים מודרני',
                    data: { primary: '#2563eb' }
                }
            ]
        };
    } else if (lowerMessage.includes('טקסט') || lowerMessage.includes('text')) {
        return {
            response: "שיפרתי את הטקסט להיות יותר מקצועי ובולט יותר.",
            changes: [
                {
                    type: 'text_improvement',
                    description: 'שיפור טקסטים',
                    data: { improved: true }
                }
            ]
        };
    } else if (lowerMessage.includes('סלולר') || lowerMessage.includes('mobile')) {
        return {
            response: "התאמתי את האתר לסלולר עם פונטים גדולים יותר ופריסה נוחה.",
            changes: [
                {
                    type: 'mobile_optimization',
                    description: 'אופטימיזציה לסלולר',
                    data: { responsive: true }
                }
            ]
        };
    } else {
        return {
            response: "ביצעתי שיפורים כלליים באתר כולל עיצוב מודרני ופונטים ברורים יותר.",
            changes: [
                {
                    type: 'general_improvement',
                    description: 'שיפורים כלליים',
                    data: { improved: true }
                }
            ]
        };
    }
}

module.exports = router;

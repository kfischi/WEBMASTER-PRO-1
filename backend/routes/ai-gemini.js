const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini client
let genAI;
try {
  if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
} catch (error) {
  console.warn("⚠️ Gemini client initialization failed:", error.message);
}

// Context-specific prompts for Gemini
const GEMINI_CONTEXTS = {
  "aesthetic-clinic-assistant": `אתה אנליטיקאי עסקי של קליניקת ד"ר מיכל רוזן לרפואה אסתטית.

אנליזה עסקית:
- שוק הרפואה האסתטית בישראל
- טרנדים בתחום (2024-2025)
- ניתוח מתחרים ומחירים
- המלצות עסקיות מבוססות נתונים

נתונים על הקליניקה:
- יעד: נשים 25-55
- אזור: תל אביב ומרכז
- מחירים תחרותיים
- שירות מקצועי ואישי

תן תשובות מבוססות נתונים ואנליזה עסקית מעמיקה.`,

  "website-builder": `אתה אנליטיקאי טכני ומנתח דרישות עבור פיתוח אתרים.

ניתוח טכני:
- ביצועי אתרים ומהירות טעינה
- SEO ואופטימיזציה למנועי חיפוש
- ניתוח UX/UI ונגישות
- המלצות טכניות מבוססות נתונים

מדדים:
- Core Web Vitals
- מהירות טעינה (< 3 שניות)
- ציון SEO גבוה
- תאימות למכשירים ניידים

תן המלצות טכניות מדויקות ומבוססות סטנדרטים.`,

  "content-creator": `אתה אנליטיקאי תוכן ומומחה בטרנדים דיגיטליים.

ניתוח תוכן:
- טרנדים בשיווק דיגיטלי 2024-2025
- אנליזת תוכן מצליח ברשתות חברתיות
- מילות מפתח ו-SEO content
- מדידת אפקטיביות תוכן

מדדים:
- Engagement rates
- Click-through rates  
- Conversion rates
- Brand awareness

תן תובנות מבוססות נתונים לשיפור התוכן.`,

  "general": `אתה אנליטיקאי AI מקצועי שנותן תשובות מבוססות נתונים, מחקר ואנליזה מעמיקה בעברית.`
};

exports.process = async (prompt, context = "general") => {
  try {
    // Check if Gemini is properly initialized
    if (!genAI || !process.env.GEMINI_API_KEY) {
      throw new Error("Gemini API key not configured");
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-pro",
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH", 
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
      ]
    });
    
    const systemPrompt = GEMINI_CONTEXTS[context] || GEMINI_CONTEXTS.general;
    const fullPrompt = `${systemPrompt}\n\nשאלה/בקשה: ${prompt}`;
    
    console.log(`💎 Gemini processing with context: ${context}`);
    
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    
    if (!response) {
      throw new Error("No response from Gemini API");
    }
    
    const text = response.text();
    
    if (!text || text.trim() === "") {
      throw new Error("Empty response from Gemini API");
    }
    
    console.log(`✅ Gemini response: ${text.length} characters`);
    
    return { 
      reply: text.trim(),
      engine: "Gemini Pro",
      success: true,
      safety_ratings: response.candidates?.[0]?.safetyRatings || null,
      finish_reason: response.candidates?.[0]?.finishReason || null
    };
    
  } catch (error) {
    console.error("❌ Gemini API Error:", error);
    
    // Specific error handling
    if (error.message?.includes('API_KEY_INVALID')) {
      throw new Error("Gemini API key is invalid");
    } else if (error.message?.includes('QUOTA_EXCEEDED')) {
      throw new Error("Gemini API quota exceeded. Please try again later");
    } else if (error.message?.includes('SAFETY')) {
      throw new Error("Content was blocked by Gemini safety filters");
    } else if (error.message?.includes('RECITATION')) {
      throw new Error("Content may contain copyrighted material");
    } else if (error.code === 'ECONNABORTED') {
      throw new Error("Gemini API request timed out");
    } else {
      throw new Error(`Gemini processing failed: ${error.message}`);
    }
  }
};

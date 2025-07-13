const { OpenAI } = require("openai");

// Initialize OpenAI client
let openai;
try {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} catch (error) {
  console.warn("⚠️ OpenAI client initialization failed:", error.message);
}

// Context-specific prompts for GPT
const GPT_CONTEXTS = {
  "aesthetic-clinic-assistant": `אתה עוזר חכם של קליניקת ד"ר מיכל רוזן לרפואה אסתטית. 

מידע על הקליניקה:
- מיקום: רח' דיזנגוף 120, תל אביב
- טלפון: 03-5555555
- שעות פתיחה: א'-ה' 9:00-17:00

שירותים ומחירים:
- בוטוקס: ₪800-1,200 (לפי אזור)
- חומצה היאלורונית: ₪1,200-2,000 (לפי כמות)
- לייזר פרקציונלי: ₪1,500-2,500 (לפי אזור) 
- פילינג כימי: ₪600-1,000 (לפי עומק)
- RF מיקרו-ניידלינג: ₪1,800-2,500
- טיפול פנים מקצועי: ₪400-600

ענה בעברית בצורה ידידותית ומקצועית. המלץ תמיד על ייעוץ אישי.`,

  "website-builder": `אתה מפתח אתרים מקצועי המתמחה ב:

טכנולוגיות:
- HTML5 סמנטי ונקי
- CSS3 מתקדם עם Flexbox/Grid
- JavaScript ES6+ מודרני
- עיצוב רספונסיבי מושלם

עיצוב:
- Glass Morphism ואפקטים מתקדמים
- טיפוגרפיה מקצועית (Heebo, Inter)
- צבעים ברמה עולמית
- UX/UI מעולים

SEO וביצועים:
- מטה תגים מותאמים
- מהירות טעינה מקסימלית  
- נגישות מלאה
- קוד נקי ואופטימלי

צור אתרים ברמה של Framer/Squarespace.`,

  "content-creator": `אתה כותב תוכן שיווקי יצירתי ומקצועי בעברית.

התמחויות:
- כותרות מושכות ומעוררות עניין
- תוכן שיווקי משכנע ומוכח
- תיאורי שירותים מפורטים
- טקסטים לדפי נחיתה
- כתיבה SEO מותאמת
- תוכן לרשתות חברתיות

סגנון כתיבה:
- ידידותי ומקצועי
- מותאם לקהל הישראלי
- משכנע ומניע לפעולה
- ברור וקריא

מטרה: יצירת תוכן שמביא תוצאות מכירה.`,

  "general": `אתה עוזר AI מועיל ומקצועי שעונה בעברית בצורה ברורה, מדויקת ומועילה.`
};

exports.process = async (prompt, context = "general") => {
  try {
    // Check if OpenAI is properly initialized
    if (!openai || !process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key not configured");
    }

    const systemPrompt = GPT_CONTEXTS[context] || GPT_CONTEXTS.general;
    
    console.log(`🤖 GPT processing with context: ${context}`);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      max_tokens: 2000,
      temperature: 0.7,
      top_p: 0.9,
      frequency_penalty: 0.1,
      presence_penalty: 0.1
    });
    
    if (!response.choices || !response.choices[0] || !response.choices[0].message) {
      throw new Error("Invalid response format from OpenAI API");
    }
    
    const reply = response.choices[0].message.content;
    
    console.log(`✅ GPT response: ${reply.length} characters`);
    
    return { 
      reply: reply.trim(),
      engine: "GPT-4 Turbo",
      success: true,
      tokens_used: response.usage || null,
      finish_reason: response.choices[0].finish_reason
    };
    
  } catch (error) {
    console.error("❌ OpenAI API Error:", error);
    
    // Specific error handling
    if (error.status === 401) {
      throw new Error("OpenAI API key is invalid or expired");
    } else if (error.status === 429) {
      throw new Error("OpenAI API rate limit exceeded. Please try again later");
    } else if (error.status === 400) {
      throw new Error("Invalid request to OpenAI API");
    } else if (error.code === 'ECONNABORTED') {
      throw new Error("OpenAI API request timed out");
    } else if (error.message?.includes('insufficient_quota')) {
      throw new Error("OpenAI API quota exceeded. Please check your billing");
    } else {
      throw new Error(`GPT processing failed: ${error.message}`);
    }
  }
};

const axios = require("axios");

// Context-specific prompts for Claude
const CLAUDE_CONTEXTS = {
  "aesthetic-clinic-assistant": `אתה עוזרת חכמה של קליניקת ד"ר מיכל רוזן לרפואה אסתטית בתל אביב. 
  
את מתמחה במתן מידע מקצועי על:
- בוטוקס (₪800-1,200)
- חומצה היאלורונית (₪1,200-2,000) 
- לייזר פרקציונלי (₪1,500-2,500)
- פילינג כימי (₪600-1,000)
- RF מיקרו-ניידלינג (₪1,800-2,500)
- טיפולי פנים מקצועיים (₪400-600)

ענה בעברית בצורה ידידותית ומקצועית. תמיד הציעי לקבוע תור לייעוץ אישי.`,

  "website-builder": `אתה מומחה בבניית אתרים מקצועיים. 
  
התמחותך:
- HTML5, CSS3, JavaScript מתקדם
- עיצוב רספונסיבי לכל המכשירים
- Glass Morphism ועיצוב מודרני
- SEO אופטימיזציה
- ביצועים מהירים
- נגישות ו-UX מעולים

צור קוד נקי, מקצועי ומותאם לעסקים ישראליים.`,

  "content-creator": `אתה כותב תוכן שיווקי מקצועי בעברית.
  
התמחותך:
- כותרות מושכות עין
- תוכן שיווקי משכנע
- טקסטים לאתרים עסקיים
- תיאורי שירותים ומוצרים
- כתיבה SEO ידידותית
- תוכן מותאם לקהל הישראלי

כתוב תוכן איכותי שמביא תוצאות.`,

  "general": `אתה עוזר AI מקצועי ומועיל שעונה בעברית בצורה ברורה ואמינה.`
};

exports.process = async (prompt, context = "general") => {
  try {
    // Check if API key exists
    if (!process.env.CLAUDE_API_KEY) {
      throw new Error("Claude API key not configured");
    }

    const systemPrompt = CLAUDE_CONTEXTS[context] || CLAUDE_CONTEXTS.general;
    
    console.log(`🧠 Claude processing with context: ${context}`);
    
    const response = await axios.post("https://api.anthropic.com/v1/messages", {
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2000,
      messages: [
        { 
          role: "user", 
          content: `${systemPrompt}\n\nבקשה: ${prompt}` 
        }
      ]
    }, {
      headers: {
        "x-api-key": process.env.CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      timeout: 30000 // 30 seconds timeout
    });
    
    if (!response.data || !response.data.content || !response.data.content[0]) {
      throw new Error("Invalid response format from Claude API");
    }
    
    const reply = response.data.content[0].text;
    
    console.log(`✅ Claude response: ${reply.length} characters`);
    
    return { 
      reply: reply.trim(),
      engine: "Claude 3.5 Sonnet",
      success: true,
      tokens_used: response.data.usage || null
    };
    
  } catch (error) {
    console.error("❌ Claude API Error:", error.response?.data || error.message);
    
    // Specific error messages
    if (error.response?.status === 401) {
      throw new Error("Claude API key is invalid or expired");
    } else if (error.response?.status === 429) {
      throw new Error("Claude API rate limit exceeded. Please try again later");
    } else if (error.response?.status === 400) {
      throw new Error("Invalid request to Claude API");
    } else if (error.code === 'ECONNABORTED') {
      throw new Error("Claude API request timed out");
    } else {
      throw new Error(`Claude processing failed: ${error.message}`);
    }
  }
};

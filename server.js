// server.js - Backend Server עם GPT-4 API
const express = require('express');
const cors = require('cors');
const { readFileSync, writeFileSync, existsSync } = require('fs');
const path = require('path');
const OpenAI = require('openai');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve static files

// OpenAI Configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key-here'
});

// Templates directory
const TEMPLATES_DIR = path.join(__dirname, 'templates');

// Ensure templates directory exists
if (!existsSync(TEMPLATES_DIR)) {
  console.error('❌ Templates directory not found. Please create a "templates" folder with your HTML templates.');
}

// Load template file
function loadTemplate(templateId) {
  const templatePath = path.join(TEMPLATES_DIR, `${templateId}.html`);
  if (existsSync(templatePath)) {
    return readFileSync(templatePath, 'utf8');
  } else {
    throw new Error(`Template ${templateId} not found`);
  }
}

// AI Website Generation Endpoint
app.post('/api/generate-website', async (req, res) => {
  try {
    const { templateId, businessData } = req.body;
    
    console.log(`🚀 Generating website for: ${businessData.name}`);
    console.log(`📋 Template: ${templateId}`);
    
    // Load base template
    const baseTemplate = loadTemplate(templateId);
    
    // Create AI prompt
    const prompt = createAIPrompt(baseTemplate, businessData);
    
    // Call GPT-4
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "אתה מעצב אתרים מקצועי ומומחה ב-HTML, CSS ו-JavaScript. תמיד תיצור אתרים ברמה עולמית עם עיצוב מודרני ופונקציונליות מלאה."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 4000,
      temperature: 0.7
    });
    
    const generatedHTML = response.choices[0].message.content;
    
    // Clean and validate the generated HTML
    const cleanedHTML = cleanGeneratedHTML(generatedHTML);
    
    // Save generated website
    const fileName = `${businessData.name.replace(/[^a-zA-Z0-9\u0590-\u05FF]/g, '-')}-${Date.now()}.html`;
    const filePath = path.join(__dirname, 'generated', fileName);
    writeFileSync(filePath, cleanedHTML, 'utf8');
    
    console.log(`✅ Website generated successfully: ${fileName}`);
    
    res.json({
      success: true,
      html: cleanedHTML,
      fileName: fileName,
      message: 'האתר נוצר בהצלחה!'
    });
    
  } catch (error) {
    console.error('❌ Error generating website:', error);
    
    // Fallback to template-based generation
    try {
      const fallbackHTML = generateFallbackWebsite(req.body.templateId, req.body.businessData);
      res.json({
        success: true,
        html: fallbackHTML,
        fileName: 'fallback-website.html',
        message: 'האתר נוצר בהצלחה! (גרסת גיבוי)'
      });
    } catch (fallbackError) {
      res.status(500).json({
        success: false,
        error: 'Failed to generate website',
        message: 'שגיאה ביצירת האתר'
      });
    }
  }
});

// Create AI Prompt
function createAIPrompt(baseTemplate, businessData) {
  const servicesText = businessData.services.join(', ');
  
  return `
בנה לי אתר HTML מקצועי עבור העסק הזה:

**פרטי העסק:**
- שם עסק: ${businessData.name}
- בעלים: ${businessData.owner}
- תחום: ${businessData.field}
- טלפון: ${businessData.phone}
- אימייל: ${businessData.email}
- מיקום: ${businessData.location}
- תיאור: ${businessData.description}
- שירותים: ${servicesText}
- סגנון עיצוב: ${businessData.style}
- קהל יעד: ${businessData.audience}
- צבע ראשי: ${businessData.colors.primary}
- צבע משני: ${businessData.colors.secondary}

**התבנית הבסיסית שלך:**
${baseTemplate}

**הוראות:**
1. קח את התבנית הבסיסית והחלף את כל התוכן עם הפרטים החדשים
2. שנה את הצבעים לצבעים שנבחרו
3. החלף שמות, טלפונים, אימיילים עם הפרטים החדשים
4. עדכן את השירותים לפי הרשימה שסופקה
5. התאם את הסגנון לפי העדפות העיצוב
6. וודא שהאתר רספונסיבי ומקצועי
7. הוסף WhatsApp integration עם הטלפון שסופק
8. כלול SEO meta tags מתאימים
9. השתמש ב-Font Awesome לאייקונים
10. צור אתר שלם ומושלם - לא סתם דמו

החזר אך ורק את קוד ה-HTML המלא, בלי הסברים או טקסט נוסף.
`;
}

// Clean generated HTML
function cleanGeneratedHTML(html) {
  // Remove markdown code blocks if present
  let cleaned = html.replace(/```html\n?/g, '').replace(/```\n?/g, '');
  
  // Ensure proper DOCTYPE if missing
  if (!cleaned.includes('<!DOCTYPE html>')) {
    cleaned = '<!DOCTYPE html>\n' + cleaned;
  }
  
  // Basic HTML validation
  if (!cleaned.includes('<html') || !cleaned.includes('<body')) {
    throw new Error('Generated HTML is incomplete');
  }
  
  return cleaned;
}

// Fallback website generation (when AI fails)
function generateFallbackWebsite(templateId, businessData) {
  const baseTemplate = loadTemplate(templateId);
  
  // Simple text replacement for fallback
  let html = baseTemplate;
  
  // Replace common placeholders
  const replacements = {
    'ד"ר מיכל רוזן': businessData.name,
    'קליניקת רפואה אסתטית': businessData.description || businessData.field,
    '052-1234567': businessData.phone,
    'info@example.com': businessData.email,
    'תל אביב': businessData.location
  };
  
  for (const [find, replace] of Object.entries(replacements)) {
    if (replace) {
      html = html.replaceAll(find, replace);
    }
  }
  
  return html;
}

// Chat refinement endpoint
app.post('/api/refine-website', async (req, res) => {
  try {
    const { currentHTML, userRequest, businessData } = req.body;
    
    const prompt = `
זהו האתר הנוכחי:
${currentHTML}

הלקוח מבקש: "${userRequest}"

בצע את השינוי המבוקש ותחזיר את כל קוד ה-HTML המעודכן.
שמור על כל העיצוב והפונקציונליות הקיימים, רק תעדכן את מה שהלקוח ביקש.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "אתה עורך אתרים מקצועי. תבצע שינויים מדויקים לפי הבקשה."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 4000,
      temperature: 0.3
    });
    
    const refinedHTML = cleanGeneratedHTML(response.choices[0].message.content);
    
    res.json({
      success: true,
      html: refinedHTML,
      message: 'השינוי בוצע בהצלחה!'
    });
    
  } catch (error) {
    console.error('❌ Error refining website:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refine website',
      message: 'שגיאה בעדכון האתר'
    });
  }
});

// Get available templates
app.get('/api/templates', (req, res) => {
  const templates = [
    {
      id: 'dr-michal-rosen',
      name: 'ד"ר מיכל רוזן - רפואה אסתטית',
      category: 'medical',
      price: 2800
    },
    {
      id: 'fitness-coach',
      name: 'דני פיט - מאמן כושר',
      category: 'fitness',
      price: 2200
    },
    {
      id: 'law-firm',
      name: 'משרד ברקוביץ - עו"ד',
      category: 'legal',
      price: 2500
    },
    {
      id: 'yoga-studio',
      name: 'סטודיו אוהם - יוגה',
      category: 'lifestyle',
      price: 1900
    },
    {
      id: 'nutritionist',
      name: 'ד"ר שרה כהן - תזונאית',
      category: 'health',
      price: 2400
    },
    {
      id: 'beauty-salon',
      name: 'מספרה BELLA - יופי',
      category: 'beauty',
      price: 1700
    }
  ];
  
  res.json(templates);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    openai_configured: !!process.env.OPENAI_API_KEY
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 WebMaster Pro API Server running on port ${PORT}`);
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(`🔧 API Base: http://localhost:${PORT}/api`);
  console.log(`🤖 OpenAI: ${process.env.OPENAI_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
});

module.exports = app;

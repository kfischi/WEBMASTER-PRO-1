// backend/server.js

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// טעינת משתני סביבה מהקובץ .env בתיקיית ה-backend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, './.env') });

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || '*'; 

// ============================================
// הגדרות שרת
// ============================================

app.use(cors({
  origin: FRONTEND_URL === '*' ? '*' : FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'apikey', 'X-Client-Info'],
}));

app.use(express.json());

// ============================================
// ייבוא ושימוש במודלי AI וב-Supabase
// ============================================

import { createClient } from '@supabase/supabase-js'; 
import OpenAI from 'openai'; 
import Anthropic from '@anthropic-ai/sdk'; 
import { GoogleGenerativeAI } from '@google/generative-ai'; 

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// וודא שמשתני הסביבה הקריטיים קיימים
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !OPENAI_API_KEY || !CLAUDE_API_KEY || !GEMINI_API_KEY) {
  console.error('שגיאה: חסרים משתני סביבה קריטיים עבור AI או Supabase. וודא שקובץ .env מלא.');
  process.exit(1); // עצור את השרת אם חסרים מפתחות
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: CLAUDE_API_KEY });
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// ============================================
// API Endpoint: יצירת אתר ראשוני ע"י AI (generate-website)
// ============================================

app.post('/api/ai/generate-website', async (req, res) => {
  const { templateSlug, businessData, aiModel = 'openai' } = req.body; 

  if (!templateSlug || !businessData) {
    return res.status(400).json({ error: 'חסרים נתונים: templateSlug ו-businessData נדרשים.' });
  }

  try {
    // 1. שלוף את הפרומפט הראשוני מה-DB (טבלת templates)
    const { data: template, error: templateError } = await supabase
      .from('templates')
      .select('id, name, initial_ai_prompt')
      .eq('slug', templateSlug)
      .single();

    if (templateError || !template) {
      console.error('שגיאה במשיכת תבנית:', templateError?.message || 'תבנית לא נמצאה.');
      return res.status(404).json({ error: 'התבנית שנבחרה לא נמצאה.' });
    }

    const { id: templateId, name: templateName, initial_ai_prompt } = template;

    // 2. בנה את הפרומפט המלא עבור ה-AI
    const fullAiPrompt = `${initial_ai_prompt}\n\nפרטי העסק שסופקו על ידי הלקוח:\nשם העסק: ${businessData.businessName}\nתיאור: ${businessData.businessDescription}\nשירותים: ${businessData.businessServices}\nטלפון: ${businessData.contactPhone}\nאימייל: ${businessData.contactEmail}\n${businessData.logoUrl ? `לוגו: ${businessData.logoUrl}` : ''}\n\nצור את קוד ה-HTML/CSS/JavaScript המלא של אתר האינטרנט, בהתבסס על הסגנון של תבנית "${templateName}". הקפד על קוד תקין ומוכן לשימוש בדפדפן.`

    let generatedHtml = '';

    // 3. שלח את הפרומפט למודל ה-AI שנבחר
    if (aiModel === 'openai') {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o', 
        messages: [{ role: 'user', content: fullAiPrompt }],
        max_tokens: 4000, 
      });
      generatedHtml = completion.choices[0].message.content;
    } else if (aiModel === 'claude') {
      const msg = await anthropic.messages.messages.create({ // Anthropic SDK updated, use .messages.create
        model: 'claude-3-opus-20240229', 
        max_tokens: 4000,
        messages: [{ role: 'user', content: fullAiPrompt }],
      });
      generatedHtml = msg.content[0].text;
    } else if (aiModel === 'gemini') {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" }); 
        const result = await model.generateContent(fullAiPrompt);
        const response = await result.response;
        generatedHtml = response.text();
    } else {
      return res.status(400).json({ error: 'מודל AI לא נתמך.' });
    }

    // 4. שמור את הקוד שנוצר ב-user_sites (בשלב זה נשמור רק ב-DB)
    // הערה: 'user_id' הוא זמני. כשנבנה כניסת משתמשים, נשים כאן את ה-ID האמיתי.
    // וודא שאתה מגדיר RLS ב-user_sites כדי שה-SERVICE_KEY יוכל לכתוב
    const { data: userSite, error: userSiteError } = await supabase
      .from('user_sites')
      .insert([
        {
          user_id: '00000000-0000-0000-0000-000000000000', 
          template_id: templateId, 
          site_name: businessData.businessName,
          slug: templateSlug + '-' + Math.random().toString(36).substring(2, 7), 
          final_html_code: generatedHtml,
          deployment_status: 'generated', 
          last_ai_interaction_log: [{ timestamp: new Date().toISOString(), prompt: fullAiPrompt.substring(0, 500) + '...', response: generatedHtml.substring(0, 500) + '...' }],
        },
      ])
      .select(); 

    if (userSiteError) {
      console.error('שגיאה בשמירת אתר משתמש ב-DB:', userSiteError.message);
      return res.status(500).json({ error: 'ה"רובוט" לא הצליח לשמור את האתר שנוצר: ' + userSiteError.message });
    }

    // 5. החזר את הקוד ל-Frontend
    res.status(200).json({ html: generatedHtml, siteId: userSite[0].id });

  } catch (error) {
    console.error('שגיאה כללית בתהליך ה"רובוט" של ה-AI:', error);
    return res.status(500).json({ error: 'שגיאה פנימית ב"רובוט" של ה-AI: ' + error.message });
  }
});

// ============================================
// API Endpoint: ליטוש אתר קיים באמצעות AI (צ'אט) (refine-website)
// ============================================

app.post('/api/ai/refine-website', async (req, res) => {
    const { siteId, userMessage, aiModel = 'openai' } = req.body;

    if (!siteId || !userMessage) {
        return res.status(400).json({ error: 'חסרים נתונים: siteId ו-userMessage נדרשים.' });
    }

    try {
        const { data: userSite, error: userSiteError } = await supabase
            .from('user_sites')
            .select('final_html_code, last_ai_interaction_log')
            .eq('id', siteId)
            .single();

        if (userSiteError || !userSite) {
            console.error('שגיאה במשיכת אתר משתמש לליטוש:', userSiteError?.message || 'אתר לא נמצא.');
            return res.status(404).json({ error: 'האתר לליטוש לא נמצא.' });
        }

        const { final_html_code: currentHtml, last_ai_interaction_log } = userSite;

        const messages = last_ai_interaction_log.map(log => ({
            role: log.role || 'user', 
            content: log.prompt || log.response 
        }));
        
        messages.push({ role: 'system', content: `זהו קוד ה-HTML/CSS/JS הנוכחי של האתר:\n${currentHtml}` });
        messages.push({ role: 'user', content: `בצע את השינוי הבא בקוד האתר ושלח את הקוד המלא המעודכן בלבד. אל תוסיף הסברים: ${userMessage}` });

        let refinedHtml = '';

        if (aiModel === 'openai') {
            const completion = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: messages, 
                max_tokens: 4000,
            });
            refinedHtml = completion.choices[0].message.content;
        } else if (aiModel === 'claude') {
            const msg = await anthropic.messages.create({ // Corrected: anthropic.messages.create
                model: 'claude-3-opus-20240229',
                max_tokens: 4000,
                messages: messages,
            });
            refinedHtml = msg.content[0].text;
        } else if (aiModel === 'gemini') {
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result = await model.generateContent(messages.map(m => m.content).join('\n')); 
            const response = await result.response;
            refinedHtml = response.text();
        } else {
            return res.status(400).json({ error: 'מודל AI לא נתמך.' });
        }

        const updatedLog = [...last_ai_interaction_log, { timestamp: new Date().toISOString(), role: 'user', prompt: userMessage }, { timestamp: new Date().toISOString(), role: 'assistant', response: refinedHtml.substring(0, 500) + '...' }];

        const { data: updatedSite, error: updateError } = await supabase
            .from('user_sites')
            .update({
                final_html_code: refinedHtml,
                last_ai_interaction_log: updatedLog,
            })
            .eq('id', siteId)
            .select();

        if (updateError) {
            console.error('שגיאה בשמירת אתר משתמש מעודכן:', updateError.message);
            return res.status(500).json({ error: 'שגיאה בשמירת האתר המעודכן.' });
        }

        res.status(200).json({ html: refinedHtml });

    } catch (error) {
        console.error('שגיאה בתהליך ליטוש האתר ע"י AI:', error);
        res.status(500).json({ error: 'שגיאה פנימית בשרת AI לליטוש.' });
    }
});

// ============================================
// נתיב בדיקה בסיסי
// ============================================

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Backend is running and healthy!' });
});

// ============================================
// הפעלת השרת
// ============================================

app.listen(PORT, () => {
  console.log(`🚀 WebMaster Pro Backend Server listening on port ${PORT}`);
  console.log(`Frontend URL allowed: ${FRONTEND_URL}`);
  console.log('Backend is ready to serve API requests.');
});

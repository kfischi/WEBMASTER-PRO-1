// backend/routes/aiRoutes.js

import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { OpenAI } from 'openai'; // עבור OpenAI
import Anthropic from '@anthropic-ai/sdk'; // עבור Claude
import { GoogleGenerativeAI } from '@google/generative-ai'; // עבור Gemini

// טעינת משתני סביבה (מפתחות API וכו')
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const router = express.Router();

// ============================================
// הגדרות וקליינטים עבור AI ו-Supabase
// ============================================

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// וודא שמשתני הסביבה הקריטיים קיימים
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !OPENAI_API_KEY || !CLAUDE_API_KEY || !GEMINI_API_KEY) {
  console.error('שגיאה: חסרים משתני סביבה קריטיים עבור AI או Supabase. וודא שקובץ .env מלא.');
  // ניתן להשבית פונקציונליות אם חסר מפתח מסוים, או לזרוק שגיאה קריטית
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: CLAUDE_API_KEY });
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// ============================================
// API Endpoint: יצירת אתר ראשוני ע"י AI
// ============================================

router.post('/generate-website', async (req, res) => {
  const { templateSlug, businessData, aiModel = 'openai' } = req.body; // ניתן לבחור איזה מודל AI להפעיל

  if (!templateSlug || !businessData) {
    return res.status(400).json({ error: 'חסרים נתונים: templateSlug ו-businessData נדרשים.' });
  }

  try {
    // 1. שלוף את הפרומפט הראשוני מה-DB
    const { data: template, error: templateError } = await supabase
      .from('templates')
      .select('name, initial_ai_prompt')
      .eq('slug', templateSlug)
      .single();

    if (templateError || !template) {
      console.error('שגיאה במשיכת תבנית:', templateError?.message || 'תבנית לא נמצאה.');
      return res.status(404).json({ error: 'התבנית שנבחרה לא נמצאה.' });
    }

    const { name: templateName, initial_ai_prompt } = template;

    // 2. בנה את הפרומפט המלא עבור ה-AI
    const fullAiPrompt = `${initialAiPrompt}\n\nפרטי העסק שסופקו על ידי הלקוח:\nשם העסק: ${businessData.businessName}\nתיאור: ${businessData.businessDescription}\nשירותים: ${businessData.businessServices}\nטלפון: ${businessData.contactPhone}\nאימייל: ${businessData.contactEmail}\n${businessData.logoUrl ? `לוגו: ${businessData.logoUrl}` : ''}\n\nצור את קוד ה-HTML/CSS/JavaScript המלא של אתר האינטרנט, בהתבסס על הסגנון של תבנית "${templateName}".`

    let generatedHtml = '';

    // 3. שלח את הפרומפט למודל ה-AI שנבחר
    if (aiModel === 'openai') {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o', // או gpt-3.5-turbo, תלוי בתקציב וביצועים
        messages: [{ role: 'user', content: fullAiPrompt }],
        max_tokens: 4000, // הגדל לפי הצורך לקוד אתר מלא
      });
      generatedHtml = completion.choices[0].message.content;
    } else if (aiModel === 'claude') {
      const msg = await anthropic.messages.create({
        model: 'claude-3-opus-20240229', // או גרסה אחרת
        max_tokens: 4000,
        messages: [{ role: 'user', content: fullAiPrompt }],
      });
      generatedHtml = msg.content[0].text;
    } else if (aiModel === 'gemini') {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // או gemini-1.5-flash-latest
      const result = await model.generateContent(fullAiPrompt);
      const response = await result.response;
      generatedHtml = response.text();
    } else {
      return res.status(400).json({ error: 'מודל AI לא נתמך.' });
    }

    // 4. שמור את הקוד שנוצר ב-user_sites (בשלב זה נשמור רק ב-DB)
    // הערה: נצטרך להוסיף user_id אמיתי בהמשך כשיש מערכת אימות משתמשים.
    const { data: userSite, error: userSiteError } = await supabase
      .from('user_sites')
      .insert([
        {
          user_id: '00000000-0000-0000-0000-000000000000', // Placeholder ID - יש להחליף ב-ID אמיתי של משתמש מחובר
          template_id: template.id, // ID של התבנית המקורית
          site_name: businessData.businessName,
          slug: templateSlug + '-' + Math.random().toString(36).substring(2, 7), // slug ייחודי
          final_html_code: generatedHtml,
          deployment_status: 'generated', // סטטוס ראשוני
          last_ai_interaction_log: [{ timestamp: new Date().toISOString(), prompt: fullAiPrompt.substring(0, 500) + '...', response: generatedHtml.substring(0, 500) + '...' }],
        },
      ])
      .select();

    if (userSiteError) {
      console.error('שגיאה בשמירת אתר משתמש:', userSiteError.message);
      return res.status(500).json({ error: 'שגיאה בשמירת האתר שנוצר.' });
    }

    // 5. החזר את הקוד ל-Frontend
    res.status(200).json({ html: generatedHtml, siteId: userSite[0].id });

  } catch (error) {
    console.error('שגיאה בתהליך יצירת האתר ע"י AI:', error);
    res.status(500).json({ error: 'שגיאה פנימית בשרת AI.' });
  }
});

// ============================================
// API Endpoint: ליטוש אתר קיים באמצעות AI (צ'אט)
// ============================================

router.post('/refine-website', async (req, res) => {
    const { siteId, userMessage, aiModel = 'openai' } = req.body;

    if (!siteId || !userMessage) {
        return res.status(400).json({ error: 'חסרים נתונים: siteId ו-userMessage נדרשים.' });
    }

    try {
        // 1. שלוף את קוד האתר האחרון והיסטוריית הצ'אט מה-DB
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

        // בנה את היסטוריית השיחה ל-AI
        // AI זוכר את הפרומפט הראשוני ואת קוד האתר האחרון
        // ההיסטוריה כוללת את הפרומפט המקורי של התבנית + כל ההודעות הקודמות
        const messages = last_ai_interaction_log.map(log => ({
            role: log.role || 'user', // assumes role is in log or defaults to user
            content: log.prompt || log.response // Adjust based on your log structure
        }));
        
        // הוסף את קוד האתר הנוכחי לתוך הקונטקסט של הפרומפט
        messages.push({ role: 'system', content: `זהו קוד ה-HTML/CSS/JS הנוכחי של האתר:\n${currentHtml}` });
        messages.push({ role: 'user', content: `בצע את השינוי הבא בקוד האתר ושלח את הקוד המלא המעודכן בלבד. אל תוסיף הסברים: ${userMessage}` });

        let refinedHtml = '';

        // 2. שלח את הפרומפט ל-AI לליטוש
        if (aiModel === 'openai') {
            const completion = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: messages, // העבר את כל היסטוריית ההודעות
                max_tokens: 4000,
            });
            refinedHtml = completion.choices[0].message.content;
        } else if (aiModel === 'claude') {
            const msg = await anthropic.messages.create({
                model: 'claude-3-opus-20240229',
                max_tokens: 4000,
                messages: messages,
            });
            refinedHtml = msg.content[0].text;
        } else if (aiModel === 'gemini') {
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result = await model.generateContent(messages.map(m => m.content).join('\n')); // Gemini expects string for this method
            const response = await result.response;
            refinedHtml = response.text();
        } else {
            return res.status(400).json({ error: 'מודל AI לא נתמך.' });
        }

        // 3. שמור את הקוד המעודכן ואת היסטוריית האינטראקציה
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

        // 4. החזר את הקוד המעודכן ל-Frontend
        res.status(200).json({ html: refinedHtml });

    } catch (error) {
        console.error('שגיאה בתהליך ליטוש האתר ע"י AI:', error);
        res.status(500).json({ error: 'שגיאה פנימית בשרת AI לליטוש.' });
    }
});

export default router;

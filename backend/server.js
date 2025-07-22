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
const FRONTEND_URL = process.env.FRONTEND_URL || '*'; // לקבל את ה-URL של הפרונטאנד

// ============================================
// הגדרות שרת
// ============================================

// שימוש ב-CORS כדי לאפשר בקשות מה-Frontend
app.use(cors({
  origin: FRONTEND_URL === '*' ? '*' : FRONTEND_URL, // אפשר גישה מה-URL של הפרונטאנד
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'apikey', 'X-Client-Info'],
}));

// כדי שהשרת יוכל לקבל בקשות בפורמט JSON
app.use(express.json());

// ============================================
// ייבוא ושימוש בנתיבים
// ============================================

// ייבוא נתיבי ה-AI החדשים שיצרנו
import aiRoutes from './routes/aiRoutes.js'; 
app.use('/api/ai', aiRoutes); // הגדר נתיבים ל-AI תחת /api/ai

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

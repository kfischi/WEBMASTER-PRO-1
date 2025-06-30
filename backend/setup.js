// 🚀 WebMaster Pro - Automatic Setup Script
// This script initializes the entire system automatically

const fs = require('fs').promises;
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

class WebMasterProSetup {
  constructor() {
    this.projectRoot = path.join(__dirname, '../');
    this.requiredDirs = [
      'public',
      'public/uploads',
      'saves',
      'docs',
      'logs'
    ];
    this.setupLog = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleString('he-IL');
    const logEntry = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
    console.log(logEntry);
    this.setupLog.push(logEntry);
  }

  async ensureDirectory(dirPath) {
    try {
      await fs.mkdir(dirPath, { recursive: true });
      this.log(`✅ תיקיה נוצרה: ${dirPath}`);
      return true;
    } catch (error) {
      this.log(`❌ שגיאה ביצירת תיקיה ${dirPath}: ${error.message}`, 'error');
      return false;
    }
  }

  async createDirectories() {
    this.log('🗂️ יצירת תיקיות נדרשות...');
    
    for (const dir of this.requiredDirs) {
      const fullPath = path.join(this.projectRoot, dir);
      await this.ensureDirectory(fullPath);
    }
    
    this.log('✅ כל התיקיות נוצרו בהצלחה');
  }

  async checkEnvironmentFile() {
    this.log('🔧 בדיקת קובץ .env...');
    
    const envPath = path.join(__dirname, '.env');
    try {
      await fs.access(envPath);
      this.log('✅ קובץ .env קיים');
      
      // Check if key variables are set
      const envContent = await fs.readFile(envPath, 'utf8');
      const hasSupabaseUrl = envContent.includes('SUPABASE_URL=') && !envContent.includes('your-project-id');
      const hasSupabaseKey = envContent.includes('SUPABASE_ANON_KEY=') && !envContent.includes('your-anon-key');
      
      if (!hasSupabaseUrl || !hasSupabaseKey) {
        this.log('⚠️ יש לעדכן את פרטי Supabase בקובץ .env', 'warning');
      } else {
        this.log('✅ קובץ .env מוגדר נכון');
      }
      
    } catch (error) {
      this.log('⚠️ קובץ .env לא נמצא - העתק מ-.env לדוגמה', 'warning');
    }
  }

  async testSupabaseConnection() {
    this.log('🔗 בדיקת חיבור ל-Supabase...');
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project-id')) {
      this.log('⚠️ Supabase לא מוגדר - המערכת תעבוד במצב מקומי', 'warning');
      return false;
    }
    
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data, error } = await supabase.from('websites').select('count').limit(1);
      
      if (error) {
        this.log(`⚠️ שגיאת Supabase: ${error.message}`, 'warning');
        this.log('📝 יש ליצור טבלה "websites" ב-Supabase', 'info');
        return false;
      }
      
      this.log('✅ חיבור ל-Supabase מוצלח');
      return true;
    } catch (error) {
      this.log(`⚠️ שגיאה בחיבור ל-Supabase: ${error.message}`, 'warning');
      return false;
    }
  }

  async createSupabaseTables() {
    this.log('🗄️ יצירת טבלאות Supabase...');
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      this.log('⚠️ Supabase לא מוגדר - דילוג על יצירת טבלאות', 'warning');
      return;
    }
    
    const sqlCommands = [
      `CREATE TABLE IF NOT EXISTS websites (
        id VARCHAR(255) PRIMARY KEY,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
      `CREATE TABLE IF NOT EXISTS analytics (
        id SERIAL PRIMARY KEY,
        event VARCHAR(255) NOT NULL,
        website_id VARCHAR(255),
        data JSONB,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        ip VARCHAR(45)
      );`
    ];
    
    this.log('📋 SQL Tables Schema:');
    sqlCommands.forEach(sql => this.log(`   ${sql}`));
    this.log('👆 Copy these commands to Supabase SQL Editor to create tables');
  }

  async createSampleData() {
    this.log('📝 יצירת נתוני דוגמה...');
    
    // Create sample analytics file
    const analyticsPath = path.join(this.projectRoot, 'saves/analytics.json');
    const sampleAnalytics = [
      {
        event: 'setup_completed',
        websiteId: 'system',
        data: { version: '3.0.0' },
        timestamp: new Date().toISOString(),
        ip: '127.0.0.1'
      }
    ];
    
    try {
      await fs.writeFile(analyticsPath, JSON.stringify(sampleAnalytics, null, 2));
      this.log('✅ קובץ analytics נוצר');
    } catch (error) {
      this.log(`❌ שגיאה ביצירת analytics: ${error.message}`, 'error');
    }
    
    // Create sample config file
    const configPath = path.join(this.projectRoot, 'saves/config.json');
    const sampleConfig = {
      version: '3.0.0',
      setupDate: new Date().toISOString(),
      features: {
        supabase: !!process.env.SUPABASE_URL,
        fileUploads: true,
        analytics: true,
        backups: true
      },
      settings: {
        maxFileSize: '10MB',
        allowedFileTypes: ['jpeg', 'jpg', 'png', 'gif', 'webp', 'svg'],
        backupInterval: 3600000,
        maxBackups: 50
      }
    };
    
    try {
      await fs.writeFile(configPath, JSON.stringify(sampleConfig, null, 2));
      this.log('✅ קובץ config נוצר');
    } catch (error) {
      this.log(`❌ שגיאה ביצירת config: ${error.message}`, 'error');
    }
  }

  async checkWebsitesDirectory() {
    this.log('🌐 בדיקת תיקיית websites...');
    
    const websitesPath = path.join(this.projectRoot, 'websites');
    try {
      const files = await fs.readdir(websitesPath);
      const htmlFiles = files.filter(file => file.endsWith('.html'));
      
      this.log(`✅ נמצאו ${htmlFiles.length} אתרים:`);
      htmlFiles.forEach(file => this.log(`   - ${file}`));
      
      if (htmlFiles.length === 0) {
        this.log('⚠️ לא נמצאו קבצי HTML בתיקיית websites', 'warning');
      }
    } catch (error) {
      this.log(`❌ שגיאה בקריאת תיקיית websites: ${error.message}`, 'error');
    }
  }

  async generateSetupReport() {
    this.log('📊 יצירת דוח התקנה...');
    
    const reportPath = path.join(this.projectRoot, 'docs/setup-report.md');
    const timestamp = new Date().toLocaleString('he-IL');
    
    const report = `# WebMaster Pro - Setup Report

**תאריך התקנה:** ${timestamp}
**גרסה:** 3.0.0

## סטטוס התקנה

### ✅ הושלם בהצלחה:
- יצירת תיקיות נדרשות
- בדיקת קבצי תצורה
- יצירת נתוני דוגמה
- בדיקת תיקיית אתרים

### ⚠️ דרוש טיפול ידני:
- הגדרת Supabase (אם נדרש)
- יצירת טבלאות במסד הנתונים
- עדכון קובץ .env עם פרטים אמיתיים

## הוראות הפעלה

1. **התקנת Dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

2. **הפעלת השרת:**
   \`\`\`bash
   npm start
   \`\`\`

3. **פתיחת האדיטור:**
   http://localhost:3000/editor.html

## לוג התקנה

${this.setupLog.join('\n')}

---
*Generated by WebMaster Pro Setup v3.0.0*
`;

    try {
      await fs.writeFile(reportPath, report, 'utf8');
      this.log('✅ דוח התקנה נוצר: docs/setup-report.md');
    } catch (error) {
      this.log(`❌ שגיאה ביצירת דוח: ${error.message}`, 'error');
    }
  }

  async runFullSetup() {
    console.log(`
🚀 WebMaster Pro - Automatic Setup
==================================
    `);
    
    this.log('🎯 מתחיל התקנה אוטומטית...');
    
    try {
      await this.createDirectories();
      await this.checkEnvironmentFile();
      await this.testSupabaseConnection();
      await this.createSupabaseTables();
      await this.createSampleData();
      await this.checkWebsitesDirectory();
      await this.generateSetupReport();
      
      this.log('🎉 התקנה הושלמה בהצלחה!');
      
      console.log(`
✅ WebMaster Pro מוכן לשימוש!

🚀 הצעדים הבאים:
1. npm install (אם עוד לא הורדת dependencies)
2. ערוך את קובץ .env עם הפרטים שלך
3. npm start להפעלת השרת
4. פתח http://localhost:3000/editor.html

📊 דוח מלא נוצר ב: docs/setup-report.md
      `);
      
    } catch (error) {
      this.log(`💥 שגיאה קריטית בהתקנה: ${error.message}`, 'error');
      console.error('Setup failed:', error);
      process.exit(1);
    }
  }
}

// Run setup if called directly
if (require.main === module) {
  const setup = new WebMasterProSetup();
  setup.runFullSetup();
}

module.exports = WebMasterProSetup;

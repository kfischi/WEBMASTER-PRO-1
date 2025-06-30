// 🚀 WebMaster Pro - Backend Server
// Full Featured Node.js + Express + Supabase + Netlify API Integration

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ===== SUPABASE CONFIGURATION =====
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// ===== MIDDLEWARE =====
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5500', 'https://webmaster-pro.netlify.app'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, '../')));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// ===== FILE UPLOAD CONFIGURATION =====
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../public/uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${timestamp}_${sanitizedName}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|svg|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('סוג קובץ לא נתמך'));
    }
  }
});

// ===== UTILITY FUNCTIONS =====
async function ensureDirectoryExists(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    console.error(`Error creating directory ${dirPath}:`, error);
  }
}

async function saveToFile(filePath, data) {
  try {
    await ensureDirectoryExists(path.dirname(filePath));
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving to file:', error);
    return false;
  }
}

async function loadFromFile(filePath, defaultValue = null) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return defaultValue;
  }
}

// ===== API ROUTES =====

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '3.0.0',
    features: {
      supabase: !!supabase,
      fileSystem: true,
      uploads: true
    }
  });
});

// Get all websites
app.get('/api/websites', async (req, res) => {
  try {
    const websitesDir = path.join(__dirname, '../websites');
    const files = await fs.readdir(websitesDir);
    const htmlFiles = files.filter(file => file.endsWith('.html'));
    
    const websites = await Promise.all(htmlFiles.map(async (file) => {
      const filePath = path.join(websitesDir, file);
      const content = await fs.readFile(filePath, 'utf8');
      
      // Extract metadata from HTML
      const titleMatch = content.match(/<title>(.*?)<\/title>/i);
      const descMatch = content.match(/<meta[^>]*name="description"[^>]*content="(.*?)"[^>]*>/i);
      
      return {
        id: file.replace('.html', ''),
        filename: file,
        title: titleMatch ? titleMatch[1] : file.replace('.html', ''),
        description: descMatch ? descMatch[1] : '',
        lastModified: (await fs.stat(filePath)).mtime,
        url: `/websites/${file}`
      };
    }));
    
    res.json({ success: true, websites });
  } catch (error) {
    console.error('Error loading websites:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get specific website content
app.get('/api/websites/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const filePath = path.join(__dirname, '../websites', `${id}.html`);
    const content = await fs.readFile(filePath, 'utf8');
    
    res.json({ 
      success: true, 
      content,
      id,
      lastModified: (await fs.stat(filePath)).mtime
    });
  } catch (error) {
    console.error('Error loading website:', error);
    res.status(404).json({ success: false, error: 'אתר לא נמצא' });
  }
});

// Save website content
app.post('/api/websites/:id/save', async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ success: false, error: 'תוכן לא סופק' });
    }
    
    const filePath = path.join(__dirname, '../websites', `${id}.html`);
    await fs.writeFile(filePath, content, 'utf8');
    
    // Save to Supabase if available
    if (supabase) {
      try {
        await supabase
          .from('websites')
          .upsert({ 
            id, 
            content, 
            updated_at: new Date().toISOString() 
          });
      } catch (supabaseError) {
        console.warn('Supabase save failed, using local only:', supabaseError.message);
      }
    }
    
    // Create backup
    const backupDir = path.join(__dirname, '../saves', id);
    await ensureDirectoryExists(backupDir);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `backup_${timestamp}.html`);
    await fs.writeFile(backupPath, content, 'utf8');
    
    res.json({ 
      success: true, 
      message: 'האתר נשמר בהצלחה',
      timestamp: new Date().toISOString(),
      backupCreated: true
    });
  } catch (error) {
    console.error('Error saving website:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// File upload
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'לא הועלה קובץ' });
    }
    
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ 
      success: true, 
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// AI Assistant endpoint (uses Claude)
app.post('/api/ai/generate', async (req, res) => {
  try {
    const { prompt, type = 'text' } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ success: false, error: 'Prompt is required' });
    }
    
    // This is a placeholder - in real implementation you'd call Claude API
    const mockResponse = {
      text: `Generated content for: ${prompt}`,
      suggestions: [
        'הוסף תמונה רקע',
        'שנה את הצבעים',
        'הוסף אנימציות'
      ],
      generatedAt: new Date().toISOString()
    };
    
    res.json({ success: true, result: mockResponse });
  } catch (error) {
    console.error('AI generation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Backup management
app.get('/api/backups/:websiteId', async (req, res) => {
  try {
    const { websiteId } = req.params;
    const backupDir = path.join(__dirname, '../saves', websiteId);
    
    try {
      const files = await fs.readdir(backupDir);
      const backups = await Promise.all(files.map(async (file) => {
        const filePath = path.join(backupDir, file);
        const stats = await fs.stat(filePath);
        return {
          filename: file,
          created: stats.birthtime,
          size: stats.size
        };
      }));
      
      res.json({ success: true, backups: backups.sort((a, b) => b.created - a.created) });
    } catch (error) {
      res.json({ success: true, backups: [] });
    }
  } catch (error) {
    console.error('Error loading backups:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Analytics endpoint
app.post('/api/analytics/track', async (req, res) => {
  try {
    const { event, websiteId, data = {} } = req.body;
    
    const analyticsEntry = {
      event,
      websiteId,
      data,
      timestamp: new Date().toISOString(),
      ip: req.ip
    };
    
    // Save to local file
    const analyticsFile = path.join(__dirname, '../saves/analytics.json');
    const existingAnalytics = await loadFromFile(analyticsFile, []);
    existingAnalytics.push(analyticsEntry);
    await saveToFile(analyticsFile, existingAnalytics);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    success: false, 
    error: 'שגיאת שרת פנימית',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'API endpoint לא נמצא' });
});

// ===== SERVER STARTUP =====
async function startServer() {
  try {
    // Ensure required directories exist
    await ensureDirectoryExists(path.join(__dirname, '../public/uploads'));
    await ensureDirectoryExists(path.join(__dirname, '../saves'));
    await ensureDirectoryExists(path.join(__dirname, '../docs'));
    
    app.listen(PORT, () => {
      console.log(`🚀 WebMaster Pro Server running on http://localhost:${PORT}`);
      console.log(`📁 Serving files from: ${path.join(__dirname, '../')}`);
      console.log(`💾 Supabase: ${supabase ? '✅ Connected' : '❌ Not configured'}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;

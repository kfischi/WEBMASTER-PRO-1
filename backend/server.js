const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize AI services
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// File upload configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../public/uploads/');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});

// Serve static files
app.use('/', express.static(path.join(__dirname, '../')));
app.use('/public', express.static(path.join(__dirname, '../public')));
app.use('/websites', express.static(path.join(__dirname, '../websites')));
app.use('/assets', express.static(path.join(__dirname, '../assets')));

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        services: {
            database: pool ? 'connected' : 'disconnected',
            openai: process.env.OPENAI_API_KEY ? 'configured' : 'missing',
            anthropic: process.env.ANTHROPIC_API_KEY ? 'configured' : 'missing'
        }
    });
});

// AI Chat endpoint
app.post('/api/ai/chat', async (req, res) => {
    try {
        const { message, provider = 'openai', context = '', businessType = '' } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        let response;
        
        if (provider === 'openai') {
            const systemPrompt = `You are a professional website design assistant for WebMaster Pro. 
            Help users create beautiful, functional websites. 
            Business context: ${businessType}
            Current context: ${context}
            
            Always respond in Hebrew and provide practical, actionable advice.`;
            
            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: message }
                ],
                max_tokens: 1000,
                temperature: 0.7
            });
            
            response = completion.choices[0].message.content;
        } else if (provider === 'claude') {
            const systemPrompt = `You are a professional website design assistant for WebMaster Pro. 
            Help users create beautiful, functional websites. 
            Business context: ${businessType}
            Current context: ${context}
            
            Always respond in Hebrew and provide practical, actionable advice.`;
            
            const completion = await anthropic.messages.create({
                model: "claude-3-haiku-20240307",
                max_tokens: 1000,
                temperature: 0.7,
                system: systemPrompt,
                messages: [
                    { role: "user", content: message }
                ]
            });
            
            response = completion.content[0].text;
        } else {
            return res.status(400).json({ error: 'Invalid AI provider' });
        }

        res.json({
            response: response,
            provider: provider,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('AI Chat Error:', error);
        res.status(500).json({ 
            error: 'AI service error',
            details: error.message
        });
    }
});

// AI Design Generator endpoint
app.post('/api/ai/design', async (req, res) => {
    try {
        const { businessType, colorPreference, style = 'modern' } = req.body;
        
        if (!businessType) {
            return res.status(400).json({ error: 'Business type is required' });
        }

        const prompt = `Create a professional color palette and design suggestions for a ${businessType} website.
        Color preference: ${colorPreference || 'any'}
        Style: ${style}
        
        Return a JSON object with:
        - primaryColor
        - secondaryColor
        - accentColor
        - backgroundColor
        - textColor
        - designSuggestions (array of 3-5 suggestions)
        
        Make sure colors work well together and are accessible.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "user", content: prompt }
            ],
            max_tokens: 500,
            temperature: 0.7
        });

        let designData;
        try {
            designData = JSON.parse(completion.choices[0].message.content);
        } catch (parseError) {
            // If JSON parsing fails, create default response
            designData = {
                primaryColor: '#4f46e5',
                secondaryColor: '#10b981',
                accentColor: '#f59e0b',
                backgroundColor: '#ffffff',
                textColor: '#1f2937',
                designSuggestions: [
                    'Use clean, modern typography',
                    'Implement card-based layouts',
                    'Add subtle shadows and rounded corners',
                    'Use consistent spacing throughout'
                ]
            };
        }

        res.json({
            design: designData,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('AI Design Error:', error);
        res.status(500).json({ 
            error: 'AI design service error',
            details: error.message
        });
    }
});

// Website management endpoints
app.get('/api/websites', async (req, res) => {
    try {
        const websites = await pool.query('SELECT * FROM websites ORDER BY created_at DESC');
        res.json(websites.rows);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/api/websites', async (req, res) => {
    try {
        const { name, template_id, business_type, content } = req.body;
        
        const result = await pool.query(
            'INSERT INTO websites (name, template_id, business_type, content, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
            [name, template_id, business_type, JSON.stringify(content)]
        );
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

app.put('/api/websites/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, content } = req.body;
        
        const result = await pool.query(
            'UPDATE websites SET name = $1, content = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
            [name, JSON.stringify(content), id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Website not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// File upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        const fileUrl = `/public/uploads/${req.file.filename}`;
        
        res.json({
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size,
            url: fileUrl,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed' });
    }
});

// Authentication endpoints
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;
        
        // Check if user exists
        const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create user
        const result = await pool.query(
            'INSERT INTO users (email, password_hash, first_name, last_name, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id, email, first_name, last_name',
            [email, hashedPassword, firstName, lastName]
        );
        
        // Generate JWT token
        const token = jwt.sign(
            { userId: result.rows[0].id, email: result.rows[0].email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({
            user: result.rows[0],
            token
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const user = result.rows[0];
        
        // Verify password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Update last login
        await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);
        
        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name
            },
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 WebMaster Pro Backend running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    
    if (process.env.OPENAI_API_KEY) {
        console.log('✅ OpenAI API key configured');
    } else {
        console.log('⚠️ OpenAI API key missing');
    }
    
    if (process.env.ANTHROPIC_API_KEY) {
        console.log('✅ Anthropic API key configured');
    } else {
        console.log('⚠️ Anthropic API key missing');
    }
});

module.exports = app;

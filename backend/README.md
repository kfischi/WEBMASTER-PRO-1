# 🚀 WebMaster Pro - Backend

Full-featured Node.js backend for the WebMaster Pro website builder platform.

## 🎯 Features

- **Complete REST API** for website management
- **File Upload System** with validation and optimization
- **Supabase Integration** for cloud database
- **Local File System** backup and storage
- **AI Integration** endpoints for content generation
- **Analytics Tracking** system
- **Backup Management** with automatic versioning
- **Security Features** with rate limiting and validation

## 📦 Installation

### Quick Start (5 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your settings

# 3. Run automatic setup
npm run setup

# 4. Start the server
npm start
```

### Manual Setup

```bash
# 1. Install dependencies
npm install

# 2. Create required directories
mkdir -p ../public/uploads ../saves ../logs

# 3. Configure environment
cp .env.example .env
nano .env  # Add your Supabase credentials

# 4. Test the system
npm test

# 5. Start the server
npm start
```

## 🔧 Configuration

### Environment Variables (.env)

```bash
# Server
NODE_ENV=development
PORT=3000

# Supabase (Optional)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Security
JWT_SECRET=your-secret-key
SESSION_SECRET=your-session-secret

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=../public/uploads
```

### Supabase Setup (Optional)

If you want cloud database features:

1. Create a Supabase project
2. Run these SQL commands in Supabase SQL Editor:

```sql
CREATE TABLE websites (
  id VARCHAR(255) PRIMARY KEY,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE analytics (
  id SERIAL PRIMARY KEY,
  event VARCHAR(255) NOT NULL,
  website_id VARCHAR(255),
  data JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip VARCHAR(45)
);
```

3. Update your `.env` file with Supabase credentials

## 📚 API Documentation

### Websites

```bash
# Get all websites
GET /api/websites

# Get specific website
GET /api/websites/:id

# Save website
POST /api/websites/:id/save
{
  "content": "<html>...</html>"
}
```

### File Upload

```bash
# Upload file
POST /api/upload
Content-Type: multipart/form-data
file: [binary data]
```

### AI Integration

```bash
# Generate content
POST /api/ai/generate
{
  "prompt": "Create a homepage for a restaurant",
  "type": "text"
}
```

### Analytics

```bash
# Track event
POST /api/analytics/track
{
  "event": "website_viewed",
  "websiteId": "restaurant-site",
  "data": {"page": "homepage"}
}
```

### Backups

```bash
# Get backups for website
GET /api/backups/:websiteId
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test category
node test-system.js

# Health check
curl http://localhost:3000/api/health
```

## 🏗️ Project Structure

```
backend/
├── server.js          # Main server file
├── package.json       # Dependencies
├── .env               # Environment config
├── setup.js           # Automatic setup
├── test-system.js     # Testing suite
├── .gitignore         # Git ignore rules
└── README.md          # This file
```

## 🚀 Deployment

### Development
```bash
npm run dev  # Uses nodemon for auto-restart
```

### Production

#### Netlify Functions
```bash
# Deploy as Netlify function
netlify deploy --prod
```

#### Vercel
```bash
# Deploy to Vercel
vercel --prod
```

#### Traditional Hosting
```bash
# Set production environment
NODE_ENV=production npm start
```

## 🔒 Security Features

- **CORS Protection** - Configurable allowed origins
- **Rate Limiting** - Prevents API abuse
- **File Validation** - Secure file upload filtering
- **Input Sanitization** - Prevents injection attacks
- **Environment Isolation** - Secure credential management

## 📊 Monitoring & Logging

- **Health Checks** - `/api/health` endpoint
- **Error Logging** - Comprehensive error tracking
- **Analytics** - Built-in usage tracking
- **Performance Monitoring** - Request timing and metrics

## 🛠️ Development

### Adding New Endpoints

```javascript
// Example: Add new API endpoint
app.post('/api/my-endpoint', async (req, res) => {
  try {
    const { data } = req.body;
    // Your logic here
    res.json({ success: true, result: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

### Database Operations

```javascript
// Supabase example
const { data, error } = await supabase
  .from('websites')
  .select('*')
  .eq('id', websiteId);

// Local file example
const data = await loadFromFile('saves/data.json', {});
await saveToFile('saves/data.json', newData);
```

## 🐛 Troubleshooting

### Common Issues

**Server won't start:**
- Check if port 3000 is available
- Verify `.env` file exists
- Run `npm install` to ensure dependencies

**Supabase connection fails:**
- Verify credentials in `.env`
- Check Supabase project status
- Ensure tables are created

**File uploads fail:**
- Check `public/uploads` directory exists
- Verify file size limits
- Check file type restrictions

**Tests fail:**
- Ensure server is running
- Check all required directories exist
- Verify environment configuration

### Debug Mode

```bash
# Enable debug logging
DEBUG=true npm start

# Check logs
tail -f ../logs/app.log
```

## 📈 Performance Tips

- **Enable compression** in production
- **Use CDN** for static files
- **Database indexing** for better queries
- **Caching** for frequently accessed data
- **Load balancing** for high traffic

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Documentation**: Check the main README.md
- **Issues**: Create GitHub issue
- **Setup Help**: Run `node setup.js`
- **Health Check**: Visit `/api/health`

---

**🎉 Your WebMaster Pro backend is ready to power amazing websites!**

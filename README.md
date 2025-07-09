# 🚀 WebMaster Pro - AI-Powered Website Builder

**The ultimate website builder platform with real AI integration using OpenAI GPT-4 and Anthropic Claude.**

## ✨ Features

- **🤖 Real AI Integration**: OpenAI GPT-4 & Anthropic Claude APIs
- **🎨 Visual Editor**: Drag & drop with real-time preview
- **🌈 Smart Design**: AI-generated color palettes and layouts
- **⚡ Auto Deployment**: One-click publishing to web
- **🔧 Performance Optimization**: Speed & SEO optimization
- **📱 11 Professional Templates**: Ready-to-use business websites
- **💾 Auto-Save**: Real-time saving to database
- **🔐 Authentication**: User management and security
- **📊 Analytics**: Built-in website analytics
- **☁️ Cloud Storage**: File upload and management

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   🌐 Frontend Layer                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │    Index    │ │   Editor    │ │ Templates   │           │
│  │    Page     │ │   Studio    │ │  Gallery    │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────┬───────────────────────────────────────┘
                      │ REST API / WebSocket
┌─────────────────────▼───────────────────────────────────────┐
│                 🔄 Backend (Node.js)                        │
│        Authentication • AI Services • File Management       │
└─┬───────────┬───────────┬───────────┬───────────┬──────────┘
  │           │           │           │           │
  ▼           ▼           ▼           ▼           ▼
┌─────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│Auth │ │Website  │ │AI APIs  │ │File     │ │Database │
│JWT  │ │Manager  │ │GPT/Claude│ │Upload   │ │PostgreSQL│
└─────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘
```

## 📁 Project Structure

```
webmaster-pro/
├── backend/                    # Node.js Backend
│   ├── src/
│   │   ├── middleware/         # Authentication & Security
│   │   ├── routes/            # API Endpoints
│   │   └── utils/             # Helper Functions
│   ├── server.js              # Main Server
│   ├── setup.js               # Database Setup
│   ├── test-system.js         # System Tests
│   └── package.json           # Dependencies
├── public/                    # Static Files
│   └── uploads/               # User Uploads
├── websites/                  # 11 Template Websites
│   ├── dr-michal-rosen.html
│   ├── fitness-co.html
│   ├── yoga-studio.html
│   └── ... (8 more)
├── assets/                    # Images & Resources
├── docs/                      # Documentation
├── editor.html                # Main Visual Editor
├── index.html                 # Landing Page
├── netlify.toml              # Netlify Config
├── railway.toml              # Railway Config
└── README.md                 # This File
```

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+ 
- PostgreSQL database (Railway recommended)
- OpenAI API key
- Anthropic Claude API key

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/webmaster-pro.git
cd webmaster-pro

# Install dependencies
npm run setup

# Configure environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your API keys
```

### 3. Environment Configuration
Edit `backend/.env` with your keys:
```env
# API Keys
OPENAI_API_KEY=sk-proj-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key

# Database (Railway)
DATABASE_URL=postgresql://user:password@host:port/database

# JWT Secret
JWT_SECRET=your-super-secret-key

# Server Settings
PORT=3000
NODE_ENV=development
```

### 4. Database Setup
```bash
# Initialize database
npm run migrate

# Test the system
npm test
```

### 5. Start Development Server
```bash
# Start the backend server
npm run dev

# Open your browser
# http://localhost:3000/         - Landing page
# http://localhost:3000/editor.html - Visual editor
```

## 🔑 Required API Keys

### OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create new secret key
3. Add to `backend/.env`: `OPENAI_API_KEY=sk-proj-...`

### Anthropic Claude API Key
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Create API key
3. Add to `backend/.env`: `ANTHROPIC_API_KEY=sk-ant-...`

### Railway Database
1. Go to [Railway](https://railway.app)
2. Create new project
3. Add PostgreSQL service
4. Copy `DATABASE_URL` to `backend/.env`

## 🧪 Testing

### Automated Tests
```bash
# Run all system tests
npm test

# Test specific components
cd backend
node test-system.js
```

### Manual Testing
1. Open `http://localhost:3000/editor.html`
2. Try the AI assistant
3. Test design generation
4. Save/load websites
5. Upload files

## 🚀 Deployment

### Backend (Railway)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway link
railway deploy
```

### Frontend (Netlify)
1. Connect your GitHub repository to Netlify
2. Build settings:
   - Build command: `npm run build`
   - Publish directory: `./`
3. Environment variables: Add your API keys
4. Deploy!

### Domain Setup
1. Configure your custom domain in Railway/Netlify
2. Update `FRONTEND_URL` in environment variables
3. Test API endpoints

## 📊 System Requirements

- **Node.js**: 18.0.0 or higher
- **Memory**: 2GB RAM minimum
- **Storage**: 1GB free space
- **Network**: Internet connection for AI APIs

## 🔧 Development

### Available Scripts
```bash
npm start          # Start production server
npm run dev        # Start development server
npm run setup      # Install dependencies & setup database
npm test           # Run system tests
npm run migrate    # Run database migrations
npm run deploy     # Deploy to Railway
```

### Adding New Features
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📝 API Documentation

### Health Check
```bash
GET /api/health
```

### AI Chat
```bash
POST /api/ai/chat
{
  "message": "Create a header for my restaurant",
  "provider": "openai",
  "context": "restaurant website",
  "businessType": "restaurant"
}
```

### Design Generation
```bash
POST /api/ai/design
{
  "businessType": "restaurant",
  "colorPreference": "warm",
  "style": "modern"
}
```

### Website Management
```bash
GET /api/websites           # Get all websites
POST /api/websites          # Create new website
PUT /api/websites/:id       # Update website
DELETE /api/websites/:id    # Delete website
```

## 🔒 Security

- JWT authentication
- Rate limiting
- Input validation
- SQL injection protection
- XSS protection
- CORS configuration
- Helmet security headers

## 📈 Performance

- Database query optimization
- Image compression
- CSS/JS minification
- CDN integration
- Caching strategies
- Real-time auto-save

## 🐛 Troubleshooting

### Common Issues

**Port 3000 already in use:**
```bash
lsof -ti:3000 | xargs kill -9
```

**Database connection failed:**
```bash
# Check DATABASE_URL in .env
# Run setup again
npm run setup
```

**AI API not working:**
```bash
# Verify API keys are correct
# Check account credits
# Test with curl:
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"test","provider":"openai"}'
```

### Getting Help
1. Check the [Issues](https://github.com/your-username/webmaster-pro/issues) page
2. Run system tests: `npm test`
3. Check logs in `backend/logs/`
4. Open new issue with error details

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Clone your fork
3. Install dependencies: `npm run setup`
4. Create feature branch
5. Make changes
6. Run tests: `npm test`
7. Submit Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for GPT-4 API
- Anthropic for Claude API
- Railway for database hosting
- Netlify for frontend hosting
- All contributors and testers

---

**Made with ❤️ by the WebMaster Pro Team**

For more information, visit our [website](https://webmaster-pro.co.il) or contact us at [hello@webmaster-pro.co.il](mailto:hello@webmaster-pro.co.il).

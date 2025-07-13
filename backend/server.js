require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

// מידע על המערכת
console.log("🚀 WebMaster Pro Multi-AI Engine Starting...");
console.log("🧠 Available Engines: Claude, GPT-4, Gemini, DALL-E");

// CORS - מאפשר גישה מהפרונט אנד
app.use(cors({
  origin: [
    "https://webmaster-pro.netlify.app",
    "https://kfischi.github.io",
    "http://localhost:3000", 
    "http://127.0.0.1:5500",
    "http://localhost:5500"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api/ai", require("./routes/ai"));

// Health check - דף בית של ה-API
app.get("/", (req, res) => {
  res.json({ 
    status: "🚀 WebMaster Pro Multi-AI Engine",
    version: "1.0.0",
    engines: {
      "Claude 3.5 Sonnet": process.env.CLAUDE_API_KEY ? "✅ Ready" : "❌ Missing Key",
      "GPT-4": process.env.OPENAI_API_KEY ? "✅ Ready" : "❌ Missing Key", 
      "Gemini Pro": process.env.GEMINI_API_KEY ? "✅ Ready" : "❌ Missing Key",
      "DALL-E 3": process.env.OPENAI_API_KEY ? "✅ Ready" : "❌ Missing Key"
    },
    endpoints: [
      "POST /api/ai/multi - Multi-engine AI processing",
      "POST /api/ai/claude - Claude only",
      "POST /api/ai/gpt - GPT-4 only", 
      "POST /api/ai/gemini - Gemini only",
      "POST /api/ai/dalle - DALL-E image generation"
    ],
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});

// API Documentation
app.get("/docs", (req, res) => {
  res.json({
    title: "WebMaster Pro Multi-AI API",
    description: "Professional AI-powered website building API",
    examples: {
      "Multi-AI Request": {
        method: "POST",
        url: "/api/ai/multi",
        body: {
          prompt: "כתוב תוכן לעמוד אודות של קליניקה אסתטית",
          engines: ["claude", "gpt", "gemini"],
          context: "aesthetic-clinic-assistant"
        }
      },
      "Image Generation": {
        method: "POST", 
        url: "/api/ai/dalle",
        body: {
          prompt: "Professional medical clinic interior, modern design",
          context: "aesthetic-clinic-assistant"
        }
      }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist`,
    availableEndpoints: [
      'GET /',
      'GET /docs', 
      'POST /api/ai/multi',
      'POST /api/ai/claude',
      'POST /api/ai/gpt',
      'POST /api/ai/gemini',
      'POST /api/ai/dalle'
    ]
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/`);
  console.log(`📚 API docs: http://localhost:${PORT}/docs`);
  console.log(`🔗 Multi-AI endpoint: http://localhost:${PORT}/api/ai/multi`);
  
  // Check API keys on startup
  const keys = {
    OpenAI: !!process.env.OPENAI_API_KEY,
    Claude: !!process.env.CLAUDE_API_KEY,
    Gemini: !!process.env.GEMINI_API_KEY
  };
  
  console.log("🔑 API Keys Status:", keys);
  
  if (!keys.OpenAI && !keys.Claude && !keys.Gemini) {
    console.warn("⚠️ Warning: No AI API keys found! Please check your .env file");
  }
});

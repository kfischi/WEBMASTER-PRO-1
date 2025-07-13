const express = require("express");
const router = express.Router();

// Import AI engines
const gpt = require("./ai-gpt");
const claude = require("./ai-claude");
const gemini = require("./ai-gemini");
const dalle = require("./ai-dalle");

// Map engine names to modules
const enginesMap = {
  gpt, claude, gemini, dalle
};

// Multi-engine endpoint - הלב של המערכת
router.post("/multi", async (req, res) => {
  const { prompt, engines = ["claude", "gpt"], context = "general" } = req.body;
  
  if (!prompt || prompt.trim() === "") {
    return res.status(400).json({ 
      error: "Missing prompt",
      message: "נדרש טקסט לעיבוד"
    });
  }

  console.log(`🧠 Multi-AI Processing: "${prompt.substring(0, 50)}..." with engines: [${engines.join(', ')}]`);
  
  try {
    // Process with all requested engines in parallel
    const results = await Promise.allSettled(
      engines.map(async (engine) => {
        if (!enginesMap[engine]) {
          console.warn(`⚠️ Unknown engine: ${engine}`);
          return { engine, reply: "❌ מנוע לא זמין", success: false };
        }
        
        try {
          console.log(`🔄 Processing with ${engine}...`);
          const result = await enginesMap[engine].process(prompt, context);
          console.log(`✅ ${engine} completed successfully`);
          return { engine, reply: result.reply, success: true };
        } catch (error) {
          console.error(`❌ ${engine} error:`, error.message);
          return { 
            engine, 
            reply: `❌ ${engine} זמנית לא זמין: ${error.message}`, 
            success: false 
          };
        }
      })
    );

    // Process results
    const processedResults = results.map((r, i) => ({
      engine: engines[i],
      reply: r.status === "fulfilled" ? r.value.reply : "❌ שגיאה בעיבוד",
      success: r.status === "fulfilled" ? r.value.success : false
    }));

    // Check if at least one engine succeeded
    const successCount = processedResults.filter(r => r.success).length;
    
    console.log(`📊 Results: ${successCount}/${engines.length} engines succeeded`);

    res.json({
      results: processedResults,
      success: successCount > 0,
      timestamp: Date.now(),
      context,
      engines_requested: engines,
      engines_successful: successCount,
      total_engines: engines.length
    });

  } catch (error) {
    console.error("❌ Multi-AI Processing Error:", error);
    res.status(500).json({ 
      error: "Multi-AI processing failed",
      message: "שגיאה כללית במערכת ה-AI",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Single engine endpoints
router.post("/claude", async (req, res) => {
  try {
    const { prompt, context = "general" } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }
    
    console.log("🔄 Claude processing...");
    const result = await claude.process(prompt, context);
    console.log("✅ Claude completed");
    
    res.json({
      engine: "claude",
      reply: result.reply,
      success: true,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error("❌ Claude error:", error);
    res.status(500).json({ 
      error: "Claude processing failed",
      message: error.message 
    });
  }
});

router.post("/gpt", async (req, res) => {
  try {
    const { prompt, context = "general" } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }
    
    console.log("🔄 GPT processing...");
    const result = await gpt.process(prompt, context);
    console.log("✅ GPT completed");
    
    res.json({
      engine: "gpt",
      reply: result.reply,
      success: true,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error("❌ GPT error:", error);
    res.status(500).json({ 
      error: "GPT processing failed",
      message: error.message 
    });
  }
});

router.post("/gemini", async (req, res) => {
  try {
    const { prompt, context = "general" } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }
    
    console.log("🔄 Gemini processing...");
    const result = await gemini.process(prompt, context);
    console.log("✅ Gemini completed");
    
    res.json({
      engine: "gemini",
      reply: result.reply,
      success: true,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error("❌ Gemini error:", error);
    res.status(500).json({ 
      error: "Gemini processing failed",
      message: error.message 
    });
  }
});

router.post("/dalle", async (req, res) => {
  try {
    const { prompt, context = "general" } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }
    
    console.log("🔄 DALL-E processing...");
    const result = await dalle.process(prompt, context);
    console.log("✅ DALL-E completed");
    
    res.json({
      engine: "dalle",
      reply: result.reply,
      image_url: result.image_url,
      success: true,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error("❌ DALL-E error:", error);
    res.status(500).json({ 
      error: "DALL-E processing failed",
      message: error.message 
    });
  }
});

// Health check for AI routes
router.get("/status", (req, res) => {
  res.json({
    status: "AI Routes Active",
    available_engines: Object.keys(enginesMap),
    endpoints: [
      "POST /api/ai/multi",
      "POST /api/ai/claude", 
      "POST /api/ai/gpt",
      "POST /api/ai/gemini",
      "POST /api/ai/dalle"
    ],
    timestamp: Date.now()
  });
});

module.exports = router;

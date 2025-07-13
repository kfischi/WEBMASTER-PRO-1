const { OpenAI } = require("openai");

// Initialize OpenAI client for DALL-E
let openai;
try {
  openai = new OpenAI({
    apiKey: process.env.DALLE_API_KEY || process.env.OPENAI_API_KEY,
  });
} catch (error) {
  console.warn("⚠️ DALL-E client initialization failed:", error.message);
}

// Context-specific prompt enhancements for DALL-E
const DALLE_CONTEXTS = {
  "aesthetic-clinic-assistant": {
    prefix: "Professional medical aesthetic clinic",
    style: "Clean, modern, medical environment, soft lighting, professional medical equipment",
    suffix: "High-quality, professional photography style, bright and welcoming atmosphere"
  },
  
  "website-builder": {
    prefix: "Professional website design mockup",
    style: "Modern UI/UX design, clean layout, professional business website",
    suffix: "High-quality web design, modern interface, professional presentation"
  },
  
  "content-creator": {
    prefix: "Professional marketing visual",
    style: "Clean, modern marketing design, professional branding elements",
    suffix: "High-quality marketing imagery, professional commercial style"
  },
  
  "general": {
    prefix: "Professional high-quality image",
    style: "Clean, modern, professional aesthetic",
    suffix: "High-quality, professional photography or design style"
  }
};

exports.process = async (prompt, context = "general") => {
  try {
    // Check if OpenAI is properly initialized
    if (!openai || (!process.env.DALLE_API_KEY && !process.env.OPENAI_API_KEY)) {
      throw new Error("DALL-E API key not configured");
    }

    const contextSettings = DALLE_CONTEXTS[context] || DALLE_CONTEXTS.general;
    
    // Enhanced prompt with context
    const enhancedPrompt = `${contextSettings.prefix}: ${prompt}. ${contextSettings.style}. ${contextSettings.suffix}. --style professional --quality high`;
    
    // Limit prompt length (DALL-E has a 1000 character limit)
    const finalPrompt = enhancedPrompt.length > 1000 
      ? enhancedPrompt.substring(0, 997) + "..." 
      : enhancedPrompt;
    
    console.log(`🎨 DALL-E processing with context: ${context}`);
    console.log(`🎨 Enhanced prompt: ${finalPrompt.substring(0, 100)}...`);
    
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: finalPrompt,
      size: "1024x1024",
      quality: "standard",
      n: 1,
      response_format: "url"
    });
    
    if (!response.data || !response.data[0] || !response.data[0].url) {
      throw new Error("Invalid response format from DALL-E API");
    }
    
    const imageUrl = response.data[0].url;
    const revisedPrompt = response.data[0].revised_prompt;
    
    console.log(`✅ DALL-E image generated successfully`);
    
    return { 
      reply: imageUrl,
      engine: "DALL-E 3",
      success: true,
      image_url: imageUrl,
      original_prompt: prompt,
      enhanced_prompt: finalPrompt,
      revised_prompt: revisedPrompt,
      size: "1024x1024",
      quality: "standard"
    };
    
  } catch (error) {
    console.error("❌ DALL-E API Error:", error);
    
    // Specific error handling
    if (error.status === 401) {
      throw new Error("DALL-E API key is invalid or expired");
    } else if (error.status === 429) {
      throw new Error("DALL-E API rate limit exceeded. Please try again later");
    } else if (error.status === 400) {
      if (error.message?.includes('content_policy_violation')) {
        throw new Error("Image prompt violates DALL-E content policy");
      } else if (error.message?.includes('size')) {
        throw new Error("Invalid image size requested");
      } else {
        throw new Error("Invalid request to DALL-E API");
      }
    } else if (error.code === 'ECONNABORTED') {
      throw new Error("DALL-E API request timed out");
    } else if (error.message?.includes('insufficient_quota')) {
      throw new Error("DALL-E API quota exceeded. Please check your billing");
    } else {
      throw new Error(`DALL-E processing failed: ${error.message}`);
    }
  }
};

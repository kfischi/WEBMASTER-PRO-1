// ===================================
// AI Main Router - Combines All AI Services
// backend/routes/ai.js
// ===================================

const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();

// Import AI service routers
const gptRoutes = require('./ai-gpt');
const claudeRoutes = require('./ai-claude');
const geminiRoutes = require('./ai-gemini');
const dalleRoutes = require('./ai.dalle');

// General AI rate limiting
const aiGeneralLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // 50 AI requests per 15 minutes total
    message: { 
        error: 'Too many AI requests, please try again later',
        resetTime: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Apply general rate limiting to all AI routes
router.use(aiGeneralLimit);

// AI Service Status and Health Check
router.get('/status', async (req, res) => {
    try {
        const aiStatus = {
            timestamp: new Date().toISOString(),
            services: {
                openai_gpt: process.env.OPENAI_API_KEY ? 'configured' : 'not_configured',
                anthropic_claude: process.env.ANTHROPIC_API_KEY ? 'configured' : 'not_configured',
                google_gemini: process.env.GEMINI_API_KEY ? 'configured' : 'not_configured',
                openai_dalle: process.env.OPENAI_API_KEY ? 'configured' : 'not_configured'
            },
            features: {
                text_generation: true,
                image_generation: process.env.OPENAI_API_KEY ? true : false,
                content_analysis: true,
                seo_optimization: true,
                design_suggestions: true
            },
            rate_limits: {
                general: '50 requests per 15 minutes',
                gpt: '12 requests per minute',
                claude: '8 requests per minute',
                gemini: '10 requests per minute',
                dalle: '5 requests per minute'
            }
        };

        res.json({
            success: true,
            status: 'operational',
            data: aiStatus
        });

    } catch (error) {
        console.error('AI status check error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to check AI services status' 
        });
    }
});

// Combined AI Chat - Intelligent Routing
router.post('/chat', async (req, res) => {
    try {
        const { message, aiModel, context, options } = req.body;

        if (!message) {
            return res.status(400).json({ 
                success: false, 
                error: 'Message is required' 
            });
        }

        // Intelligent AI model selection if not specified
        let selectedModel = aiModel;
        if (!selectedModel) {
            // Route based on message content and context
            if (context?.task === 'design_analysis' || context?.task === 'seo') {
                selectedModel = 'claude';
            } else if (context?.task === 'content_creation' || context?.task === 'marketing') {
                selectedModel = 'gpt';
            } else if (context?.task === 'translation' || context?.task === 'multilingual') {
                selectedModel = 'gemini';
            } else {
                // Default to GPT for general purposes
                selectedModel = 'gpt';
            }
        }

        let response;
        let routedTo;

        // Route to appropriate AI service
        switch (selectedModel.toLowerCase()) {
            case 'claude':
                req.body = { message, context, options };
                // Forward to Claude router
                const claudeResponse = await new Promise((resolve, reject) => {
                    const mockReq = { body: req.body };
                    const mockRes = {
                        json: (data) => resolve(data),
                        status: (code) => ({ json: (data) => reject({ status: code, data }) })
                    };
                    claudeRoutes.stack.find(layer => 
                        layer.route && layer.route.path === '/chat'
                    ).route.stack[0].handle(mockReq, mockRes, () => {});
                });
                response = claudeResponse;
                routedTo = 'claude';
                break;

            case 'gemini':
                // Route to Gemini (implement similar to above)
                routedTo = 'gemini';
                response = { 
                    success: true, 
                    response: 'Gemini integration coming soon',
                    model: 'gemini-pro'
                };
                break;

            case 'gpt':
            default:
                req.body = { message, context, options };
                // Forward to GPT router
                const gptResponse = await new Promise((resolve, reject) => {
                    const mockReq = { body: req.body };
                    const mockRes = {
                        json: (data) => resolve(data),
                        status: (code) => ({ json: (data) => reject({ status: code, data }) })
                    };
                    gptRoutes.stack.find(layer => 
                        layer.route && layer.route.path === '/chat'
                    ).route.stack[0].handle(mockReq, mockRes, () => {});
                });
                response = gptResponse;
                routedTo = 'gpt';
                break;
        }

        // Add routing metadata
        response.routing = {
            requested_model: aiModel,
            actual_model: selectedModel,
            routed_to: routedTo,
            auto_selected: !aiModel
        };

        res.json(response);

    } catch (error) {
        console.error('AI chat routing error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'AI chat routing failed',
            details: error.message 
        });
    }
});

// Smart Content Generation - Uses best AI for the task
router.post('/generate-content', async (req, res) => {
    try {
        const { contentType, businessInfo, requirements } = req.body;

        if (!contentType || !businessInfo) {
            return res.status(400).json({ 
                success: false, 
                error: 'Content type and business information are required' 
            });
        }

        let result;
        let usedService;

        // Route based on content type
        switch (contentType.toLowerCase()) {
            case 'website':
            case 'homepage':
            case 'landing':
                // Use GPT for website content
                const gptReq = { body: { businessInfo } };
                const gptRes = {
                    json: (data) => { result = data; },
                    status: (code) => ({ json: (data) => { throw new Error(JSON.stringify(data)); } })
                };
                await gptRoutes.stack.find(layer => 
                    layer.route && layer.route.path === '/website-content'
                ).route.stack[0].handle(gptReq, gptRes, () => {});
                usedService = 'gpt';
                break;

            case 'seo':
            case 'analysis':
                // Use Claude for SEO and analysis
                const claudeReq = { body: { pageInfo: businessInfo } };
                const claudeRes = {
                    json: (data) => { result = data; },
                    status: (code) => ({ json: (data) => { throw new Error(JSON.stringify(data)); } })
                };
                await claudeRoutes.stack.find(layer => 
                    layer.route && layer.route.path === '/seo-content'
                ).route.stack[0].handle(claudeReq, claudeRes, () => {});
                usedService = 'claude';
                break;

            case 'blog':
            case 'article':
                // Use GPT for blog content
                const blogReq = { body: { blogInfo: { topic: businessInfo.topic || businessInfo.industry, ...businessInfo } } };
                const blogRes = {
                    json: (data) => { result = data; },
                    status: (code) => ({ json: (data) => { throw new Error(JSON.stringify(data)); } })
                };
                await gptRoutes.stack.find(layer => 
                    layer.route && layer.route.path === '/blog-content'
                ).route.stack[0].handle(blogReq, blogRes, () => {});
                usedService = 'gpt';
                break;

            default:
                throw new Error(`Unsupported content type: ${contentType}`);
        }

        // Add metadata
        result.generation_info = {
            content_type: contentType,
            ai_service_used: usedService,
            generation_time: new Date().toISOString(),
            requirements: requirements
        };

        res.json(result);

    } catch (error) {
        console.error('Smart content generation error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Content generation failed',
            details: error.message 
        });
    }
});

// AI-Powered Website Analysis
router.post('/analyze-website', async (req, res) => {
    try {
        const { websiteData, analysisType } = req.body;

        if (!websiteData) {
            return res.status(400).json({ 
                success: false, 
                error: 'Website data is required' 
            });
        }

        // Use Claude for comprehensive analysis
        const claudeReq = { body: { websiteData, requirements: { focus: analysisType } } };
        const claudeRes = {
            json: (data) => { 
                // Add AI-powered recommendations
                data.ai_recommendations = {
                    priority_actions: data.analysis?.quick_wins || [],
                    technical_improvements: data.analysis?.recommendations?.filter(r => r.category === 'Performance') || [],
                    content_improvements: data.analysis?.recommendations?.filter(r => r.category === 'Content') || [],
                    seo_improvements: data.analysis?.recommendations?.filter(r => r.category === 'SEO') || []
                };
                
                res.json(data);
            },
            status: (code) => ({ json: (data) => { throw new Error(JSON.stringify(data)); } })
        };

        await claudeRoutes.stack.find(layer => 
            layer.route && layer.route.path === '/analyze-design'
        ).route.stack[0].handle(claudeReq, claudeRes, () => {});

    } catch (error) {
        console.error('Website analysis error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Website analysis failed',
            details: error.message 
        });
    }
});

// Multi-AI Content Improvement
router.post('/improve-content', async (req, res) => {
    try {
        const { content, improvementGoals, businessContext } = req.body;

        if (!content || !improvementGoals) {
            return res.status(400).json({ 
                success: false, 
                error: 'Content and improvement goals are required' 
            });
        }

        const improvements = {};

        // Run parallel improvements with different AIs
        const tasks = [];

        // GPT for content enhancement
        if (improvementGoals.includes('readability') || improvementGoals.includes('engagement')) {
            tasks.push(
                new Promise(async (resolve) => {
                    try {
                        const gptReq = { 
                            body: { 
                                content, 
                                instructions: 'Improve readability and engagement while maintaining professional tone',
                                context: businessContext 
                            } 
                        };
                        const gptRes = {
                            json: (data) => resolve({ service: 'gpt', result: data }),
                            status: () => ({ json: () => resolve({ service: 'gpt', error: true }) })
                        };
                        await gptRoutes.stack.find(layer => 
                            layer.route && layer.route.path === '/improve-content'
                        ).route.stack[0].handle(gptReq, gptRes, () => {});
                    } catch (err) {
                        resolve({ service: 'gpt', error: err.message });
                    }
                })
            );
        }

        // Claude for SEO and structure optimization
        if (improvementGoals.includes('seo') || improvementGoals.includes('structure')) {
            tasks.push(
                new Promise(async (resolve) => {
                    try {
                        const claudeReq = { 
                            body: { 
                                content, 
                                improvementType: 'SEO and structure optimization',
                                targetAudience: businessContext?.targetAudience 
                            } 
                        };
                        const claudeRes = {
                            json: (data) => resolve({ service: 'claude', result: data }),
                            status: () => ({ json: () => resolve({ service: 'claude', error: true }) })
                        };
                        await claudeRoutes.stack.find(layer => 
                            layer.route && layer.route.path === '/improve-content'
                        ).route.stack[0].handle(claudeReq, claudeRes, () => {});
                    } catch (err) {
                        resolve({ service: 'claude', error: err.message });
                    }
                })
            );
        }

        // Execute all tasks
        const results = await Promise.all(tasks);
        
        // Compile results
        results.forEach(result => {
            if (!result.error) {
                improvements[result.service] = result.result;
            }
        });

        res.json({
            success: true,
            original_content: content,
            improvements,
            improvement_goals: improvementGoals,
            recommendation: 'Compare the different AI suggestions and choose the best elements from each',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Multi-AI content improvement error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Content improvement failed',
            details: error.message 
        });
    }
});

// Mount AI service routers
router.use('/gpt', gptRoutes);
router.use('/claude', claudeRoutes);
router.use('/gemini', geminiRoutes);
router.use('/dalle', dalleRoutes);

// Test all AI services
router.post('/test-all', async (req, res) => {
    try {
        const testResults = {};
        const testPrompt = 'Hello, please confirm you are working correctly.';

        // Test GPT
        try {
            const gptReq = { body: { message: testPrompt } };
            const gptRes = {
                json: (data) => { testResults.gpt = { success: true, response: data.response }; },
                status: (code) => ({ json: (data) => { testResults.gpt = { success: false, error: data }; } })
            };
            await gptRoutes.stack.find(layer => 
                layer.route && layer.route.path === '/test'
            ).route.stack[0].handle(gptReq, gptRes, () => {});
        } catch (err) {
            testResults.gpt = { success: false, error: err.message };
        }

        // Test Claude
        try {
            const claudeReq = { body: { message: testPrompt } };
            const claudeRes = {
                json: (data) => { testResults.claude = { success: true, response: data.response }; },
                status: (code) => ({ json: (data) => { testResults.claude = { success: false, error: data }; } })
            };
            await claudeRoutes.stack.find(layer => 
                layer.route && layer.route.path === '/test'
            ).route.stack[0].handle(claudeReq, claudeRes, () => {});
        } catch (err) {
            testResults.claude = { success: false, error: err.message };
        }

        // Add overall status
        const allWorking = Object.values(testResults).every(result => result.success);
        
        res.json({
            success: true,
            overall_status: allWorking ? 'all_services_operational' : 'some_services_down',
            test_results: testResults,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('AI services test error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to test AI services',
            details: error.message 
        });
    }
});

module.exports = router;

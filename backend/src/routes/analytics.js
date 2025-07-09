const express = require('express');
const { Pool } = require('pg');
const { authenticateToken, requireAdmin, checkOwnership } = require('../middleware/auth');
const { sendResponse, sendError, formatDateIL } = require('../utils/helpers');
const router = express.Router();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Get user dashboard analytics
router.get('/dashboard', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { period = '30' } = req.query; // days
        
        const periodDays = Math.min(parseInt(period), 365); // Max 1 year
        
        // Get websites overview
        const websitesOverview = await pool.query(`
            SELECT 
                COUNT(*) as total_websites,
                COUNT(CASE WHEN status = 'published' THEN 1 END) as published_websites,
                COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_websites,
                COUNT(CASE WHEN created_at >= NOW() - INTERVAL '${periodDays} days' THEN 1 END) as new_websites
            FROM websites
            WHERE user_id = $1
        `, [userId]);
        
        // Get AI usage statistics
        const aiUsage = await pool.query(`
            SELECT 
                COUNT(*) as total_requests,
                SUM(tokens_used) as total_tokens,
                AVG(tokens_used)::INTEGER as avg_tokens_per_request,
                COUNT(CASE WHEN created_at >= NOW() - INTERVAL '${periodDays} days' THEN 1 END) as recent_requests
            FROM ai_usage
            WHERE user_id = $1
        `, [userId]);
        
        // Get website analytics summary
        const websiteAnalytics = await pool.query(`
            SELECT 
                COALESCE(SUM(wa.page_views), 0) as total_page_views,
                COALESCE(SUM(wa.unique_visitors), 0) as total_unique_visitors,
                COALESCE(AVG(wa.bounce_rate), 0)::DECIMAL(5,2) as avg_bounce_rate
            FROM websites w
            LEFT JOIN website_analytics wa ON w.id = wa.website_id
            WHERE w.user_id = $1
            AND wa.date >= NOW() - INTERVAL '${periodDays} days'
        `, [userId]);
        
        // Get recent activity
        const recentActivity = await pool.query(`
            SELECT activity_type, details, created_at
            FROM user_activity
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT 10
        `, [userId]);
        
        // Get top performing websites
        const topWebsites = await pool.query(`
            SELECT 
                w.id, w.name, w.domain, w.status,
                COALESCE(SUM(wa.page_views), 0) as page_views,
                COALESCE(SUM(wa.unique_visitors), 0) as unique_visitors
            FROM websites w
            LEFT JOIN website_analytics wa ON w.id = wa.website_id
            WHERE w.user_id = $1
            AND (wa.date IS NULL OR wa.date >= NOW() - INTERVAL '${periodDays} days')
            GROUP BY w.id, w.name, w.domain, w.status
            ORDER BY page_views DESC
            LIMIT 5
        `, [userId]);
        
        // Get AI usage by model
        const aiByModel = await pool.query(`
            SELECT 
                model,
                COUNT(*) as requests,
                SUM(tokens_used) as tokens
            FROM ai_usage
            WHERE user_id = $1
            AND created_at >= NOW() - INTERVAL '${periodDays} days'
            GROUP BY model
            ORDER BY requests DESC
        `, [userId]);
        
        res.json({
            success: true,
            period: periodDays,
            analytics: {
                websites: websitesOverview.rows[0],
                ai: {
                    ...aiUsage.rows[0],
                    byModel: aiByModel.rows
                },
                traffic: websiteAnalytics.rows[0],
                topWebsites: topWebsites.rows,
                recentActivity: recentActivity.rows
            }
        });
        
    } catch (error) {
        console.error('Dashboard analytics error:', error);
        sendError(res, 500, 'Failed to fetch dashboard analytics');
    }
});

// Get website analytics
router.get('/website/:id', authenticateToken, checkOwnership('website'), async (req, res) => {
    try {
        const { id } = req.params;
        const { period = '30', metric = 'page_views' } = req.query;
        
        const periodDays = Math.min(parseInt(period), 365);
        
        // Get basic website info
        const websiteInfo = await pool.query(`
            SELECT name, domain, status, created_at, published_at
            FROM websites
            WHERE id = $1
        `, [id]);
        
        if (websiteInfo.rows.length === 0) {
            return sendError(res, 404, 'Website not found');
        }
        
        // Get analytics data over time
        const analyticsOverTime = await pool.query(`
            SELECT 
                date,
                page_views,
                unique_visitors,
                bounce_rate,
                avg_session_duration
            FROM website_analytics
            WHERE website_id = $1
            AND date >= NOW() - INTERVAL '${periodDays} days'
            ORDER BY date
        `, [id]);
        
        // Get top pages
        const topPages = await pool.query(`
            SELECT 
                jsonb_object_keys(top_pages) as page,
                (top_pages ->> jsonb_object_keys(top_pages))::INTEGER as views
            FROM website_analytics
            WHERE website_id = $1
            AND date >= NOW() - INTERVAL '${periodDays} days'
            AND top_pages IS NOT NULL
        `, [id]);
        
        // Aggregate top pages
        const pageViews = {};
        topPages.rows.forEach(row => {
            pageViews[row.page] = (pageViews[row.page] || 0) + row.views;
        });
        
        const sortedPages = Object.entries(pageViews)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([page, views]) => ({ page, views }));
        
        // Get traffic sources
        const trafficSources = await pool.query(`
            SELECT 
                jsonb_object_keys(traffic_sources) as source,
                (traffic_sources ->> jsonb_object_keys(traffic_sources))::INTEGER as visitors
            FROM website_analytics
            WHERE website_id = $1
            AND date >= NOW() - INTERVAL '${periodDays} days'
            AND traffic_sources IS NOT NULL
        `, [id]);
        
        // Aggregate traffic sources
        const sources = {};
        trafficSources.rows.forEach(row => {
            sources[row.source] = (sources[row.source] || 0) + row.visitors;
        });
        
        const sortedSources = Object.entries(sources)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([source, visitors]) => ({ source, visitors }));
        
        // Get device breakdown
        const deviceData = await pool.query(`
            SELECT 
                jsonb_object_keys(device_breakdown) as device,
                (device_breakdown ->> jsonb_object_keys(device_breakdown))::INTEGER as visitors
            FROM website_analytics
            WHERE website_id = $1
            AND date >= NOW() - INTERVAL '${periodDays} days'
            AND device_breakdown IS NOT NULL
        `, [id]);
        
        const devices = {};
        deviceData.rows.forEach(row => {
            devices[row.device] = (devices[row.device] || 0) + row.visitors;
        });
        
        const sortedDevices = Object.entries(devices)
            .map(([device, visitors]) => ({ device, visitors }));
        
        // Get location data
        const locationData = await pool.query(`
            SELECT 
                jsonb_object_keys(location_data) as country,
                (location_data ->> jsonb_object_keys(location_data))::INTEGER as visitors
            FROM website_analytics
            WHERE website_id = $1
            AND date >= NOW() - INTERVAL '${periodDays} days'
            AND location_data IS NOT NULL
        `, [id]);
        
        const countries = {};
        locationData.rows.forEach(row => {
            countries[row.country] = (countries[row.country] || 0) + row.visitors;
        });
        
        const sortedCountries = Object.entries(countries)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([country, visitors]) => ({ country, visitors }));
        
        // Calculate totals
        const totals = analyticsOverTime.rows.reduce((acc, row) => ({
            totalPageViews: acc.totalPageViews + (row.page_views || 0),
            totalUniqueVisitors: acc.totalUniqueVisitors + (row.unique_visitors || 0),
            avgBounceRate: acc.avgBounceRate + (row.bounce_rate || 0),
            dataPoints: acc.dataPoints + 1
        }), { totalPageViews: 0, totalUniqueVisitors: 0, avgBounceRate: 0, dataPoints: 0 });
        
        if (totals.dataPoints > 0) {
            totals.avgBounceRate = (totals.avgBounceRate / totals.dataPoints).toFixed(2);
        }
        
        res.json({
            success: true,
            website: websiteInfo.rows[0],
            period: periodDays,
            analytics: {
                overview: totals,
                overTime: analyticsOverTime.rows,
                topPages: sortedPages,
                trafficSources: sortedSources,
                devices: sortedDevices,
                countries: sortedCountries
            }
        });
        
    } catch (error) {
        console.error('Website analytics error:', error);
        sendError(res, 500, 'Failed to fetch website analytics');
    }
});

// Record website analytics data (public endpoint for tracking scripts)
router.post('/track', async (req, res) => {
    try {
        const {
            websiteId,
            pageUrl,
            referrer,
            userAgent,
            sessionId,
            timestamp,
            event = 'page_view'
        } = req.body;
        
        if (!websiteId || !pageUrl) {
            return sendError(res, 400, 'Website ID and page URL are required');
        }
        
        // Verify website exists
        const websiteCheck = await pool.query(
            'SELECT id FROM websites WHERE id = $1',
            [websiteId]
        );
        
        if (websiteCheck.rows.length === 0) {
            return sendError(res, 404, 'Website not found');
        }
        
        // Parse user agent for device detection
        const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);
        const isTablet = /iPad|Tablet/i.test(userAgent);
        const device = isMobile ? (isTablet ? 'tablet' : 'mobile') : 'desktop';
        
        // Extract country from headers (simplified)
        const country = req.headers['cf-ipcountry'] || 
                       req.headers['x-country'] || 
                       'Unknown';
        
        // Determine traffic source
        let source = 'direct';
        if (referrer) {
            const referrerDomain = new URL(referrer).hostname;
            if (referrerDomain.includes('google')) source = 'google';
            else if (referrerDomain.includes('facebook')) source = 'facebook';
            else if (referrerDomain.includes('twitter')) source = 'twitter';
            else if (referrerDomain.includes('linkedin')) source = 'linkedin';
            else source = 'referral';
        }
        
        // Insert raw tracking data
        await pool.query(`
            INSERT INTO tracking_events (
                website_id, session_id, event_type, page_url, referrer, 
                user_agent, device_type, country, traffic_source, 
                ip_address, created_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [
            websiteId, sessionId, event, pageUrl, referrer,
            userAgent, device, country, source,
            req.ip, new Date(timestamp) || new Date()
        ]);
        
        // Aggregate daily analytics
        const today = new Date().toISOString().split('T')[0];
        
        await pool.query(`
            INSERT INTO website_analytics (
                website_id, date, page_views, unique_visitors, 
                top_pages, traffic_sources, device_breakdown, location_data
            )
            VALUES ($1, $2, 1, 1, $3, $4, $5, $6)
            ON CONFLICT (website_id, date)
            DO UPDATE SET
                page_views = website_analytics.page_views + 1,
                top_pages = COALESCE(website_analytics.top_pages, '{}'::jsonb) || $3,
                traffic_sources = COALESCE(website_analytics.traffic_sources, '{}'::jsonb) || $4,
                device_breakdown = COALESCE(website_analytics.device_breakdown, '{}'::jsonb) || $5,
                location_data = COALESCE(website_analytics.location_data, '{}'::jsonb) || $6
        `, [
            websiteId,
            today,
            JSON.stringify({ [pageUrl]: 1 }),
            JSON.stringify({ [source]: 1 }),
            JSON.stringify({ [device]: 1 }),
            JSON.stringify({ [country]: 1 })
        ]);
        
        res.json({
            success: true,
            message: 'Analytics data recorded'
        });
        
    } catch (error) {
        console.error('Track analytics error:', error);
        sendError(res, 500, 'Failed to record analytics');
    }
});

// Get AI usage analytics
router.get('/ai-usage', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { period = '30', groupBy = 'day' } = req.query;
        
        const periodDays = Math.min(parseInt(period), 365);
        
        // Get usage over time
        let timeFormat;
        switch (groupBy) {
            case 'hour':
                timeFormat = "DATE_TRUNC('hour', created_at)";
                break;
            case 'week':
                timeFormat = "DATE_TRUNC('week', created_at)";
                break;
            case 'month':
                timeFormat = "DATE_TRUNC('month', created_at)";
                break;
            default:
                timeFormat = "DATE_TRUNC('day', created_at)";
        }
        
        const usageOverTime = await pool.query(`
            SELECT 
                ${timeFormat} as period,
                model,
                COUNT(*) as requests,
                SUM(tokens_used) as tokens,
                AVG(tokens_used)::INTEGER as avg_tokens
            FROM ai_usage
            WHERE user_id = $1
            AND created_at >= NOW() - INTERVAL '${periodDays} days'
            GROUP BY ${timeFormat}, model
            ORDER BY period, model
        `, [userId]);
        
        // Get usage by request type
        const usageByType = await pool.query(`
            SELECT 
                request_type,
                COUNT(*) as requests,
                SUM(tokens_used) as tokens,
                AVG(tokens_used)::INTEGER as avg_tokens
            FROM ai_usage
            WHERE user_id = $1
            AND created_at >= NOW() - INTERVAL '${periodDays} days'
            GROUP BY request_type
            ORDER BY requests DESC
        `, [userId]);
        
        // Get cost analysis (estimated)
        const costAnalysis = await pool.query(`
            SELECT 
                model,
                SUM(tokens_used) as total_tokens,
                COUNT(*) as total_requests,
                SUM(cost_usd) as total_cost
            FROM ai_usage
            WHERE user_id = $1
            AND created_at >= NOW() - INTERVAL '${periodDays} days'
            GROUP BY model
        `, [userId]);
        
        // Get response time analytics
        const responseTimeStats = await pool.query(`
            SELECT 
                model,
                AVG(EXTRACT(EPOCH FROM response_time)) as avg_response_time,
                MIN(EXTRACT(EPOCH FROM response_time)) as min_response_time,
                MAX(EXTRACT(EPOCH FROM response_time)) as max_response_time
            FROM ai_usage
            WHERE user_id = $1
            AND created_at >= NOW() - INTERVAL '${periodDays} days'
            AND response_time IS NOT NULL
            GROUP BY model
        `, [userId]);
        
        res.json({
            success: true,
            period: periodDays,
            analytics: {
                overTime: usageOverTime.rows,
                byType: usageByType.rows,
                costs: costAnalysis.rows,
                responseTimes: responseTimeStats.rows
            }
        });
        
    } catch (error) {
        console.error('AI usage analytics error:', error);
        sendError(res, 500, 'Failed to fetch AI usage analytics');
    }
});

// Get system analytics (Admin only)
router.get('/system', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { period = '30' } = req.query;
        const periodDays = Math.min(parseInt(period), 365);
        
        // User analytics
        const userAnalytics = await pool.query(`
            SELECT 
                COUNT(*) as total_users,
                COUNT(CASE WHEN created_at >= NOW() - INTERVAL '${periodDays} days' THEN 1 END) as new_users,
                COUNT(CASE WHEN last_login >= NOW() - INTERVAL '7 days' THEN 1 END) as active_users,
                COUNT(CASE WHEN plan != 'free' THEN 1 END) as paid_users
            FROM users
        `);
        
        // Website analytics
        const websiteAnalytics = await pool.query(`
            SELECT 
                COUNT(*) as total_websites,
                COUNT(CASE WHEN status = 'published' THEN 1 END) as published_websites,
                COUNT(CASE WHEN created_at >= NOW() - INTERVAL '${periodDays} days' THEN 1 END) as new_websites,
                COUNT(DISTINCT user_id) as users_with_websites
            FROM websites
        `);
        
        // Template analytics
        const templateAnalytics = await pool.query(`
            SELECT 
                COUNT(*) as total_templates,
                COUNT(CASE WHEN is_active = true THEN 1 END) as active_templates,
                SUM(downloads) as total_downloads,
                AVG(rating)::DECIMAL(3,2) as avg_rating
            FROM templates
        `);
        
        // AI usage analytics
        const aiAnalytics = await pool.query(`
            SELECT 
                COUNT(*) as total_requests,
                SUM(tokens_used) as total_tokens,
                COUNT(DISTINCT user_id) as users_using_ai,
                SUM(cost_usd) as total_cost
            FROM ai_usage
            WHERE created_at >= NOW() - INTERVAL '${periodDays} days'
        `);
        
        // Revenue analytics
        const revenueAnalytics = await pool.query(`
            SELECT 
                COUNT(*) as total_payments,
                SUM(amount) as total_revenue,
                COUNT(DISTINCT user_id) as paying_users,
                AVG(amount) as avg_payment
            FROM payments
            WHERE status = 'succeeded'
            AND created_at >= NOW() - INTERVAL '${periodDays} days'
        `);
        
        // Growth over time
        const growthData = await pool.query(`
            SELECT 
                DATE_TRUNC('day', created_at) as date,
                COUNT(*) as new_users
            FROM users
            WHERE created_at >= NOW() - INTERVAL '${periodDays} days'
            GROUP BY DATE_TRUNC('day', created_at)
            ORDER BY date
        `);
        
        // Plan distribution
        const planDistribution = await pool.query(`
            SELECT 
                plan,
                COUNT(*) as users,
                COUNT(*) * 100.0 / SUM(COUNT(*)) OVER() as percentage
            FROM users
            GROUP BY plan
            ORDER BY users DESC
        `);
        
        // Template popularity
        const templatePopularity = await pool.query(`
            SELECT 
                t.name,
                t.slug,
                t.downloads,
                COUNT(w.id) as websites_created
            FROM templates t
            LEFT JOIN websites w ON t.slug = w.template
            GROUP BY t.id, t.name, t.slug, t.downloads
            ORDER BY t.downloads DESC
            LIMIT 10
        `);
        
        res.json({
            success: true,
            period: periodDays,
            analytics: {
                users: userAnalytics.rows[0],
                websites: websiteAnalytics.rows[0],
                templates: templateAnalytics.rows[0],
                ai: aiAnalytics.rows[0],
                revenue: revenueAnalytics.rows[0],
                growth: growthData.rows,
                planDistribution: planDistribution.rows,
                popularTemplates: templatePopularity.rows
            }
        });
        
    } catch (error) {
        console.error('System analytics error:', error);
        sendError(res, 500, 'Failed to fetch system analytics');
    }
});

// Generate analytics report
router.post('/reports', authenticateToken, async (req, res) => {
    try {
        const {
            reportType = 'user_summary',
            period = 30,
            format = 'json',
            includeCharts = false
        } = req.body;
        
        const userId = req.user.id;
        const periodDays = Math.min(parseInt(period), 365);
        
        let reportData = {};
        
        switch (reportType) {
            case 'user_summary':
                // Get comprehensive user analytics
                const userSummary = await pool.query(`
                    SELECT 
                        u.name, u.email, u.plan, u.created_at,
                        COUNT(DISTINCT w.id) as total_websites,
                        COUNT(DISTINCT CASE WHEN w.status = 'published' THEN w.id END) as published_websites,
                        COUNT(DISTINCT ai.id) as ai_requests,
                        SUM(ai.tokens_used) as ai_tokens_used,
                        COUNT(DISTINCT p.id) as payments_made,
                        SUM(p.amount) as total_spent
                    FROM users u
                    LEFT JOIN websites w ON u.id = w.user_id
                    LEFT JOIN ai_usage ai ON u.id = ai.user_id AND ai.created_at >= NOW() - INTERVAL '${periodDays} days'
                    LEFT JOIN payments p ON u.id = p.user_id AND p.created_at >= NOW() - INTERVAL '${periodDays} days'
                    WHERE u.id = $1
                    GROUP BY u.id, u.name, u.email, u.plan, u.created_at
                `, [userId]);
                
                reportData = {
                    type: 'User Summary Report',
                    period: `Last ${periodDays} days`,
                    generatedAt: new Date().toISOString(),
                    data: userSummary.rows[0]
                };
                break;
                
            case 'website_performance':
                // Get website performance data
                const websitePerformance = await pool.query(`
                    SELECT 
                        w.id, w.name, w.domain, w.status,
                        SUM(wa.page_views) as total_page_views,
                        SUM(wa.unique_visitors) as total_unique_visitors,
                        AVG(wa.bounce_rate)::DECIMAL(5,2) as avg_bounce_rate
                    FROM websites w
                    LEFT JOIN website_analytics wa ON w.id = wa.website_id
                    WHERE w.user_id = $1
                    AND (wa.date IS NULL OR wa.date >= NOW() - INTERVAL '${periodDays} days')
                    GROUP BY w.id, w.name, w.domain, w.status
                    ORDER BY total_page_views DESC NULLS LAST
                `, [userId]);
                
                reportData = {
                    type: 'Website Performance Report',
                    period: `Last ${periodDays} days`,
                    generatedAt: new Date().toISOString(),
                    websites: websitePerformance.rows
                };
                break;
                
            default:
                return sendError(res, 400, 'Invalid report type');
        }
        
        // Store report for future reference
        const reportResult = await pool.query(`
            INSERT INTO analytics_reports (
                user_id, report_type, period_days, data, format, created_at
            )
            VALUES ($1, $2, $3, $4, $5, NOW())
            RETURNING id
        `, [userId, reportType, periodDays, JSON.stringify(reportData), format]);
        
        res.json({
            success: true,
            reportId: reportResult.rows[0].id,
            report: reportData
        });
        
    } catch (error) {
        console.error('Generate report error:', error);
        sendError(res, 500, 'Failed to generate report');
    }
});

// Get user's reports
router.get('/reports', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        
        const reports = await pool.query(`
            SELECT id, report_type, period_days, format, created_at
            FROM analytics_reports
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT 20
        `, [userId]);
        
        res.json({
            success: true,
            reports: reports.rows
        });
        
    } catch (error) {
        console.error('Get reports error:', error);
        sendError(res, 500, 'Failed to fetch reports');
    }
});

// Get specific report
router.get('/reports/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        const report = await pool.query(`
            SELECT * FROM analytics_reports
            WHERE id = $1 AND user_id = $2
        `, [id, userId]);
        
        if (report.rows.length === 0) {
            return sendError(res, 404, 'Report not found');
        }
        
        res.json({
            success: true,
            report: report.rows[0]
        });
        
    } catch (error) {
        console.error('Get report error:', error);
        sendError(res, 500, 'Failed to fetch report');
    }
});

// Export analytics data
router.get('/export', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { type = 'websites', format = 'csv', period = 30 } = req.query;
        
        const periodDays = Math.min(parseInt(period), 365);
        
        let data = [];
        let filename = '';
        
        switch (type) {
            case 'websites':
                const websiteData = await pool.query(`
                    SELECT 
                        w.name, w.domain, w.status, w.created_at,
                        COALESCE(SUM(wa.page_views), 0) as page_views,
                        COALESCE(SUM(wa.unique_visitors), 0) as unique_visitors
                    FROM websites w
                    LEFT JOIN website_analytics wa ON w.id = wa.website_id
                    WHERE w.user_id = $1
                    AND (wa.date IS NULL OR wa.date >= NOW() - INTERVAL '${periodDays} days')
                    GROUP BY w.id, w.name, w.domain, w.status, w.created_at
                    ORDER BY w.created_at DESC
                `, [userId]);
                
                data = websiteData.rows;
                filename = `websites_analytics_${new Date().toISOString().split('T')[0]}.${format}`;
                break;
                
            case 'ai_usage':
                const aiData = await pool.query(`
                    SELECT 
                        model, request_type, tokens_used, cost_usd, created_at
                    FROM ai_usage
                    WHERE user_id = $1
                    AND created_at >= NOW() - INTERVAL '${periodDays} days'
                    ORDER BY created_at DESC
                `, [userId]);
                
                data = aiData.rows;
                filename = `ai_usage_${new Date().toISOString().split('T')[0]}.${format}`;
                break;
                
            default:
                return sendError(res, 400, 'Invalid export type');
        }
        
        if (format === 'csv') {
            // Convert to CSV
            if (data.length === 0) {
                return sendError(res, 404, 'No data to export');
            }
            
            const headers = Object.keys(data[0]);
            const csvContent = [
                headers.join(','),
                ...data.map(row => 
                    headers.map(header => 
                        typeof row[header] === 'string' && row[header].includes(',') 
                            ? `"${row[header]}"` 
                            : row[header]
                    ).join(',')
                )
            ].join('\n');
            
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.send(csvContent);
        } else {
            // Return JSON
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.json({
                success: true,
                exportedAt: new Date().toISOString(),
                type: type,
                period: periodDays,
                count: data.length,
                data: data
            });
        }
        
    } catch (error) {
        console.error('Export analytics error:', error);
        sendError(res, 500, 'Failed to export analytics');
    }
});

module.exports = router;

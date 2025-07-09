const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function setupDatabase() {
    console.log('🚀 Setting up WebMaster Pro Database...');
    
    try {
        // Test connection
        await pool.query('SELECT NOW()');
        console.log('✅ Database connected successfully');
        
        // Create tables
        await createTables();
        
        // Insert default data
        await insertDefaultData();
        
        console.log('✅ Database setup completed successfully!');
        
    } catch (error) {
        console.error('❌ Database setup error:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

async function createTables() {
    console.log('📋 Creating database tables...');
    
    // Users table
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            first_name VARCHAR(100),
            last_name VARCHAR(100),
            phone VARCHAR(20),
            avatar_url TEXT,
            plan_type VARCHAR(50) DEFAULT 'free',
            is_active BOOLEAN DEFAULT true,
            email_verified BOOLEAN DEFAULT false,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW(),
            last_login TIMESTAMP
        )
    `);
    console.log('✅ Users table created');
    
    // Websites table
    await pool.query(`
        CREATE TABLE IF NOT EXISTS websites (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            name VARCHAR(255) NOT NULL,
            slug VARCHAR(255) UNIQUE,
            template_id VARCHAR(100),
            business_type VARCHAR(100),
            domain VARCHAR(255),
            status VARCHAR(50) DEFAULT 'draft',
            content JSONB,
            html_content TEXT,
            css_content TEXT,
            js_content TEXT,
            seo_title VARCHAR(255),
            seo_description TEXT,
            seo_keywords TEXT,
            analytics_id VARCHAR(100),
            is_published BOOLEAN DEFAULT false,
            published_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        )
    `);
    console.log('✅ Websites table created');
    
    // Templates table
    await pool.query(`
        CREATE TABLE IF NOT EXISTS templates (
            id VARCHAR(100) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            category VARCHAR(100),
            description TEXT,
            business_type VARCHAR(100),
            preview_image VARCHAR(255),
            html_content TEXT,
            css_content TEXT,
            js_content TEXT,
            features JSONB,
            price DECIMAL(10,2) DEFAULT 0,
            is_premium BOOLEAN DEFAULT false,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        )
    `);
    console.log('✅ Templates table created');
    
    // Orders table
    await pool.query(`
        CREATE TABLE IF NOT EXISTS orders (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            website_id UUID REFERENCES websites(id) ON DELETE CASCADE,
            template_id VARCHAR(100) REFERENCES templates(id),
            amount DECIMAL(10,2) NOT NULL,
            currency VARCHAR(10) DEFAULT 'ILS',
            status VARCHAR(50) DEFAULT 'pending',
            payment_method VARCHAR(100),
            stripe_session_id VARCHAR(255),
            stripe_payment_intent_id VARCHAR(255),
            invoice_number VARCHAR(100),
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        )
    `);
    console.log('✅ Orders table created');
    
    // Support tickets table
    await pool.query(`
        CREATE TABLE IF NOT EXISTS support_tickets (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            ticket_number VARCHAR(50) UNIQUE,
            subject VARCHAR(255) NOT NULL,
            description TEXT,
            priority VARCHAR(20) DEFAULT 'medium',
            status VARCHAR(50) DEFAULT 'open',
            assigned_agent VARCHAR(100),
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        )
    `);
    console.log('✅ Support tickets table created');
    
    // AI interactions table
    await pool.query(`
        CREATE TABLE IF NOT EXISTS ai_interactions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            website_id UUID REFERENCES websites(id) ON DELETE CASCADE,
            provider VARCHAR(50) NOT NULL,
            prompt TEXT NOT NULL,
            response TEXT,
            tokens_used INTEGER,
            cost DECIMAL(10,4),
            created_at TIMESTAMP DEFAULT NOW()
        )
    `);
    console.log('✅ AI interactions table created');
    
    // Analytics table
    await pool.query(`
        CREATE TABLE IF NOT EXISTS analytics (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            website_id UUID REFERENCES websites(id) ON DELETE CASCADE,
            event_type VARCHAR(100) NOT NULL,
            event_data JSONB,
            visitor_ip VARCHAR(45),
            user_agent TEXT,
            referrer TEXT,
            created_at TIMESTAMP DEFAULT NOW()
        )
    `);
    console.log('✅ Analytics table created');
    
    // Create indexes for better performance
    await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_websites_user_id ON websites(user_id);
        CREATE INDEX IF NOT EXISTS idx_websites_slug ON websites(slug);
        CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
        CREATE INDEX IF NOT EXISTS idx_ai_interactions_user_id ON ai_interactions(user_id);
        CREATE INDEX IF NOT EXISTS idx_analytics_website_id ON analytics(website_id);
    `);
    console.log('✅ Database indexes created');
    
    // Create trigger for updated_at
    await pool.query(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql';
        
        DROP TRIGGER IF EXISTS update_users_updated_at ON users;
        CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        
        DROP TRIGGER IF EXISTS update_websites_updated_at ON websites;
        CREATE TRIGGER update_websites_updated_at BEFORE UPDATE ON websites FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        
        DROP TRIGGER IF EXISTS update_templates_updated_at ON templates;
        CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        
        DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
        CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);
    console.log('✅ Database triggers created');
}

async function insertDefaultData() {
    console.log('📋 Inserting default data...');
    
    // Insert template data for the 11 websites
    const templates = [
        {
            id: 'dr-michal-rosen',
            name: 'ד"ר מיכל רוזן - רפואה אסתטית',
            category: 'medical',
            business_type: 'aesthetic-medicine',
            description: 'תבנית מקצועית לקליניקה אסתטית',
            price: 2800,
            is_premium: true
        },
        {
            id: 'fitness-co',
            name: 'דני פיט - מאמן כושר',
            category: 'fitness',
            business_type: 'personal-trainer',
            description: 'תבנית למאמנים אישיים',
            price: 2200,
            is_premium: false
        },
        {
            id: 'yoga-studio',
            name: 'סטודיו אוהם - יוגה ומדיטציה',
            category: 'wellness',
            business_type: 'yoga-studio',
            description: 'תבנית לסטודיו יוגה',
            price: 1900,
            is_premium: false
        },
        {
            id: 'nutritionist',
            name: 'ד"ר שרה כהן - תזונאית',
            category: 'health',
            business_type: 'nutritionist',
            description: 'תבנית לתזונאית מוסמכת',
            price: 2400,
            is_premium: true
        },
        {
            id: 'law-firm',
            name: 'משרד ברקוביץ - עורכי דין',
            category: 'legal',
            business_type: 'law-firm',
            description: 'תבנית מקצועית למשרד עורכי דין',
            price: 2500,
            is_premium: true
        },
        {
            id: 'accountant',
            name: 'רינה לוי - חשבת שכר',
            category: 'finance',
            business_type: 'accountant',
            description: 'תבנית לחשבת מוסמכת',
            price: 2000,
            is_premium: false
        },
        {
            id: 'beauty-salon',
            name: 'מספרה BELLA - יופי ועיצוב',
            category: 'beauty',
            business_type: 'beauty-salon',
            description: 'תבנית למספרה ויופי',
            price: 1700,
            is_premium: false
        },
        {
            id: 'tutor',
            name: 'ד"ר רונית לוי - מורה פרטית',
            category: 'education',
            business_type: 'tutor',
            description: 'תבנית למורה פרטית',
            price: 2100,
            is_premium: false
        },
        {
            id: 'aesthetic-clinic',
            name: 'קליניקת יופי פרמיום',
            category: 'medical',
            business_type: 'aesthetic-clinic',
            description: 'תבנית פרמיום לקליניקה אסתטית',
            price: 3200,
            is_premium: true
        },
        {
            id: 'multibrawn',
            name: 'מולטיבראון - נופש ואירועים',
            category: 'events',
            business_type: 'events-venue',
            description: 'תבנית לאולמי אירועים',
            price: 2300,
            is_premium: true
        },
        {
            id: 'real-estate',
            name: 'נדל"ן פרמיום',
            category: 'real-estate',
            business_type: 'real-estate',
            description: 'תבנית פרמיום לנדל"ן',
            price: 2700,
            is_premium: true
        }
    ];
    
    for (const template of templates) {
        await pool.query(
            `INSERT INTO templates (id, name, category, business_type, description, price, is_premium, preview_image)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             category = EXCLUDED.category,
             business_type = EXCLUDED.business_type,
             description = EXCLUDED.description,
             price = EXCLUDED.price,
             is_premium = EXCLUDED.is_premium,
             updated_at = NOW()`,
            [
                template.id,
                template.name,
                template.category,
                template.business_type,
                template.description,
                template.price,
                template.is_premium,
                `/websites/${template.id}.html`
            ]
        );
    }
    
    console.log('✅ Default templates inserted');
}

// Run setup if this file is executed directly
if (require.main === module) {
    setupDatabase();
}

module.exports = { setupDatabase, pool };

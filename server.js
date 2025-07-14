# צור קובץ server.js חדש עם 0.0.0.0 קבוע
cat > server.js << 'EOF'
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// FORCED 0.0.0.0 - לא תלוי בכלום!
console.log('🔥 RAILWAY CLI DEPLOYED VERSION!');
console.log('🌐 Host: 0.0.0.0 (CLI FORCED!)');
console.log('📡 Port:', PORT);

// Database (preserve existing)
let pool;
if (process.env.DATABASE_URL) {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
}

app.use(cors());
app.use(express.json());

app.get('/health', async (req, res) => {
    console.log('🏥 CLI VERSION HEALTH CHECK!');
    
    let dbStatus = 'not configured';
    if (pool) {
        try {
            await pool.query('SELECT NOW()');
            dbStatus = 'connected';
        } catch (error) {
            dbStatus = 'error';
        }
    }
    
    res.json({
        message: 'WebMaster Pro - CLI DEPLOYED!',
        status: 'running',
        host: '0.0.0.0',
        port: PORT,
        database: dbStatus,
        version: 'CLI_FORCED_VERSION',
        timestamp: new Date().toISOString()
    });
});

app.get('/', (req, res) => {
    res.json({
        name: 'WebMaster Pro - CLI VERSION',
        status: 'working with CLI!',
        host: '0.0.0.0'
    });
});

app.get('/ping', (req, res) => {
    res.send('pong-cli');
});

// FORCED: Always 0.0.0.0
app.listen(PORT, '0.0.0.0', () => {
    console.log('✅ =====================================');
    console.log('🎉 CLI VERSION STARTED SUCCESSFULLY!');
    console.log('🌐 Host: 0.0.0.0 (CLI FORCED!)');
    console.log('📡 Port:', PORT);
    console.log('✅ =====================================');
});

module.exports = app;
EOF

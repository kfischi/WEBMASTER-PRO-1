const { Pool } = require('pg');
const axios = require('axios');
require('dotenv').config();

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

class SystemTester {
    constructor() {
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });
        this.results = [];
    }

    async runAllTests() {
        console.log('🚀 Starting WebMaster Pro System Tests...\n');
        
        await this.testDatabaseConnection();
        await this.testAPIEndpoints();
        await this.testAIServices();
        await this.testAuthentication();
        await this.testFileOperations();
        
        this.printResults();
        
        await this.pool.end();
        process.exit(this.results.some(r => !r.passed) ? 1 : 0);
    }

    async testDatabaseConnection() {
        console.log('🗄️  Testing database connection...');
        
        try {
            const result = await this.pool.query('SELECT NOW() as current_time');
            this.addResult('Database Connection', true, `Connected at ${result.rows[0].current_time}`);
        } catch (error) {
            this.addResult('Database Connection', false, error.message);
        }
        
        // Test table existence
        try {
            const tables = await this.pool.query(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
            `);
            
            const requiredTables = ['users', 'websites', 'templates', 'orders', 'support_tickets', 'ai_interactions', 'analytics'];
            const existingTables = tables.rows.map(row => row.table_name);
            
            const missingTables = requiredTables.filter(table => !existingTables.includes(table));
            
            if (missingTables.length === 0) {
                this.addResult('Database Tables', true, `All ${requiredTables.length} tables exist`);
            } else {
                this.addResult('Database Tables', false, `Missing tables: ${missingTables.join(', ')}`);
            }
        } catch (error) {
            this.addResult('Database Tables', false, error.message);
        }
    }

    async testAPIEndpoints() {
        console.log('🌐 Testing API endpoints...');
        
        // Test health endpoint
        try {
            const response = await axios.get(`${BASE_URL}/api/health`);
            if (response.data.status === 'ok') {
                this.addResult('Health Endpoint', true, 'API is healthy');
            } else {
                this.addResult('Health Endpoint', false, 'API returned non-ok status');
            }
        } catch (error) {
            this.addResult('Health Endpoint', false, error.message);
        }
        
        // Test websites endpoint
        try {
            const response = await axios.get(`${BASE_URL}/api/websites`);
            this.addResult('Websites Endpoint', true, `Retrieved ${response.data.length} websites`);
        } catch (error) {
            this.addResult('Websites Endpoint', false, error.message);
        }
    }

    async testAIServices() {
        console.log('🤖 Testing AI services...');
        
        // Test OpenAI configuration
        if (process.env.OPENAI_API_KEY) {
            try {
                const response = await axios.post(`${BASE_URL}/api/ai/chat`, {
                    message: 'Hello, test message',
                    provider: 'openai'
                });
                
                if (response.data.response) {
                    this.addResult('OpenAI Integration', true, 'AI responded successfully');
                } else {
                    this.addResult('OpenAI Integration', false, 'No response from AI');
                }
            } catch (error) {
                this.addResult('OpenAI Integration', false, error.response?.data?.error || error.message);
            }
        } else {
            this.addResult('OpenAI Integration', false, 'OPENAI_API_KEY not configured');
        }
        
        // Test Anthropic configuration
        if (process.env.ANTHROPIC_API_KEY) {
            try {
                const response = await axios.post(`${BASE_URL}/api/ai/chat`, {
                    message: 'Hello, test message',
                    provider: 'claude'
                });
                
                if (response.data.response) {
                    this.addResult('Anthropic Integration', true, 'Claude responded successfully');
                } else {
                    this.addResult('Anthropic Integration', false, 'No response from Claude');
                }
            } catch (error) {
                this.addResult('Anthropic Integration', false, error.response?.data?.error || error.message);
            }
        } else {
            this.addResult('Anthropic Integration', false, 'ANTHROPIC_API_KEY not configured');
        }
        
        // Test design generation
        try {
            const response = await axios.post(`${BASE_URL}/api/ai/design`, {
                businessType: 'restaurant',
                colorPreference: 'warm',
                style: 'modern'
            });
            
            if (response.data.design && response.data.design.primaryColor) {
                this.addResult('AI Design Generation', true, 'Design generated successfully');
            } else {
                this.addResult('AI Design Generation', false, 'Invalid design response');
            }
        } catch (error) {
            this.addResult('AI Design Generation', false, error.response?.data?.error || error.message);
        }
    }

    async testAuthentication() {
        console.log('🔐 Testing authentication system...');
        
        const testUser = {
            email: `test-${Date.now()}@example.com`,
            password: 'testpassword123',
            firstName: 'Test',
            lastName: 'User'
        };
        
        let userToken = null;
        
        // Test registration
        try {
            const response = await axios.post(`${BASE_URL}/api/auth/register`, testUser);
            
            if (response.data.token && response.data.user) {
                userToken = response.data.token;
                this.addResult('User Registration', true, 'User registered successfully');
            } else {
                this.addResult('User Registration', false, 'Invalid registration response');
            }
        } catch (error) {
            this.addResult('User Registration', false, error.response?.data?.error || error.message);
        }
        
        // Test login
        try {
            const response = await axios.post(`${BASE_URL}/api/auth/login`, {
                email: testUser.email,
                password: testUser.password
            });
            
            if (response.data.token && response.data.user) {
                this.addResult('User Login', true, 'Login successful');
            } else {
                this.addResult('User Login', false, 'Invalid login response');
            }
        } catch (error) {
            this.addResult('User Login', false, error.response?.data?.error || error.message);
        }
        
        // Clean up test user
        if (userToken) {
            try {
                await this.pool.query('DELETE FROM users WHERE email = $1', [testUser.email]);
                console.log('✅ Test user cleaned up');
            } catch (error) {
                console.log('⚠️  Could not clean up test user:', error.message);
            }
        }
    }

    async testFileOperations() {
        console.log('📁 Testing file operations...');
        
        // Test file upload endpoint (without actual file)
        try {
            const response = await axios.post(`${BASE_URL}/api/upload`, {}, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            // Should fail with "No file uploaded" error
            this.addResult('File Upload Endpoint', false, 'Should have failed with no file');
        } catch (error) {
            if (error.response?.data?.error === 'No file uploaded') {
                this.addResult('File Upload Endpoint', true, 'Endpoint working correctly');
            } else {
                this.addResult('File Upload Endpoint', false, error.response?.data?.error || error.message);
            }
        }
        
        // Test file directory existence
        const fs = require('fs');
        const path = require('path');
        const uploadDir = path.join(__dirname, '../public/uploads');
        
        if (fs.existsSync(uploadDir)) {
            this.addResult('Upload Directory', true, 'Directory exists');
        } else {
            try {
                fs.mkdirSync(uploadDir, { recursive: true });
                this.addResult('Upload Directory', true, 'Directory created');
            } catch (error) {
                this.addResult('Upload Directory', false, error.message);
            }
        }
    }

    addResult(testName, passed, message) {
        this.results.push({ testName, passed, message });
        const status = passed ? '✅' : '❌';
        console.log(`  ${status} ${testName}: ${message}`);
    }

    printResults() {
        console.log('\n📊 Test Results Summary:');
        console.log('=' * 50);
        
        const passed = this.results.filter(r => r.passed).length;
        const total = this.results.length;
        const percentage = ((passed / total) * 100).toFixed(1);
        
        console.log(`Total Tests: ${total}`);
        console.log(`Passed: ${passed} (${percentage}%)`);
        console.log(`Failed: ${total - passed}`);
        
        if (passed === total) {
            console.log('\n🎉 All tests passed! System is ready for deployment.');
        } else {
            console.log('\n⚠️  Some tests failed. Please check the configuration.');
            console.log('\nFailed tests:');
            this.results.filter(r => !r.passed).forEach(result => {
                console.log(`  ❌ ${result.testName}: ${result.message}`);
            });
        }
    }
}

// Environment check
function checkEnvironment() {
    console.log('🔍 Checking environment configuration...\n');
    
    const requiredEnvVars = [
        'DATABASE_URL',
        'JWT_SECRET',
        'OPENAI_API_KEY',
        'ANTHROPIC_API_KEY'
    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
        console.log('❌ Missing environment variables:');
        missingVars.forEach(varName => {
            console.log(`  - ${varName}`);
        });
        console.log('\nPlease configure these variables in your .env file.');
        process.exit(1);
    }
    
    console.log('✅ All required environment variables are configured.\n');
}

// Run tests
async function runTests() {
    checkEnvironment();
    
    const tester = new SystemTester();
    await tester.runAllTests();
}

// Run if this file is executed directly
if (require.main === module) {
    runTests();
}

module.exports = { SystemTester, runTests };

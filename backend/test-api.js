const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

async function testAPIs() {
    console.log('🧪 Testing WebMaster Pro APIs...\n');

    try {
        console.log('1. Testing health endpoint...');
        const health = await axios.get(`${API_BASE_URL}/health`);
        console.log(`✅ Health: ${health.data.status}\n`);

        console.log('2. Testing user registration...');
        const testUser = {
            email: `test-${Date.now()}@example.com`,
            password: 'testpassword123',
            firstName: 'Test',
            lastName: 'User'
        };
        
        const registerResponse = await axios.post(`${API_BASE_URL}/api/auth/register`, testUser);
        const { token } = registerResponse.data;
        console.log('✅ User registered successfully\n');

        console.log('3. Testing OpenAI integration...');
        const openaiTest = await axios.post(
            `${API_BASE_URL}/api/test/openai`,
            { test_prompt: 'Test connection' },
            { headers: { 'Authorization': `Bearer ${token}` } }
        );
        console.log(`✅ OpenAI: ${openaiTest.data.message}\n`);

        console.log('4. Testing Claude integration...');
        const claudeTest = await axios.post(
            `${API_BASE_URL}/api/test/claude`,
            { test_prompt: 'Test connection' },
            { headers: { 'Authorization': `Bearer ${token}` } }
        );
        console.log(`✅ Claude: ${claudeTest.data.message}\n`);

        console.log('5. Testing database...');
        const dbTest = await axios.get(
            `${API_BASE_URL}/api/test/database`,
            { headers: { 'Authorization': `Bearer ${token}` } }
        );
        console.log(`✅ Database: ${dbTest.data.tables} tables\n`);

        console.log('6. Testing design generation...');
        const designTest = await axios.post(
            `${API_BASE_URL}/api/ai/generate-design`,
            { businessType: 'רופא שיניים', style: 'modern' },
            { headers: { 'Authorization': `Bearer ${token}` } }
        );
        console.log(`✅ Design Generation: ${designTest.data.primary_color}\n`);

        console.log('7. Testing deployment...');
        const deployTest = await axios.post(
            `${API_BASE_URL}/api/test/deploy`,
            { websiteId: 'test-site', content: '<html>Test</html>' },
            { headers: { 'Authorization': `Bearer ${token}` } }
        );
        console.log(`✅ Deployment: ${deployTest.data.test_url}\n`);

        console.log('🎉 All tests passed successfully!');
        
        // Performance test
        const startTime = Date.now();
        await axios.get(`${API_BASE_URL}/health`);
        const responseTime = Date.now() - startTime;
        console.log(`⚡ API Response time: ${responseTime}ms`);

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        console.error('📋 Make sure:');
        console.error('   - Backend server is running (npm run dev)');
        console.error('   - .env file has all required API keys');
        console.error('   - Database is connected');
        process.exit(1);
    }
}

// Test individual endpoints
async function testHealth() {
    try {
        const response = await axios.get(`${API_BASE_URL}/health`);
        return response.data.status === 'running';
    } catch (error) {
        return false;
    }
}

async function testOpenAI(token) {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/api/test/openai`,
            { test_prompt: 'Hello' },
            { headers: { 'Authorization': `Bearer ${token}` } }
        );
        return response.data.status === 'success';
    } catch (error) {
        return false;
    }
}

async function testClaude(token) {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/api/test/claude`,
            { test_prompt: 'Hello' },
            { headers: { 'Authorization': `Bearer ${token}` } }
        );
        return response.data.status === 'success';
    } catch (error) {
        return false;
    }
}

// Quick system check
async function quickCheck() {
    console.log('🔍 Quick System Check...\n');
    
    const health = await testHealth();
    console.log(`Health Check: ${health ? '✅' : '❌'}`);
    
    if (!health) {
        console.log('❌ Server not responding. Start with: npm run dev');
        return false;
    }
    
    console.log('✅ System operational!');
    return true;
}

if (require.main === module) {
    if (process.argv.includes('--quick')) {
        quickCheck();
    } else {
        testAPIs();
    }
}

module.exports = { testAPIs, testHealth, testOpenAI, testClaude, quickCheck };

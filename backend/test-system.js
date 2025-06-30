// 🧪 WebMaster Pro - System Testing Suite
// Comprehensive testing for all system components

const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

class SystemTester {
  constructor() {
    this.serverUrl = `http://localhost:${process.env.PORT || 3000}`;
    this.testResults = [];
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
  }

  async test(name, testFn) {
    this.totalTests++;
    const startTime = Date.now();
    
    try {
      await testFn();
      const duration = Date.now() - startTime;
      this.testResults.push({
        name,
        status: 'PASS',
        duration: `${duration}ms`,
        error: null
      });
      this.passedTests++;
      console.log(`✅ ${name} (${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.testResults.push({
        name,
        status: 'FAIL',
        duration: `${duration}ms`,
        error: error.message
      });
      this.failedTests++;
      console.log(`❌ ${name} (${duration}ms): ${error.message}`);
    }
  }

  async makeRequest(endpoint, options = {}) {
    return new Promise((resolve, reject) => {
      const url = `${this.serverUrl}${endpoint}`;
      const reqOptions = {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      };

      const req = http.request(url, reqOptions, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            resolve({ status: res.statusCode, data: jsonData });
          } catch (error) {
            resolve({ status: res.statusCode, data: data });
          }
        });
      });

      req.on('error', reject);
      
      if (options.body) {
        req.write(JSON.stringify(options.body));
      }
      
      req.end();
    });
  }

  async testServerHealth() {
    const response = await this.makeRequest('/api/health');
    
    if (response.status !== 200) {
      throw new Error(`Server health check failed: ${response.status}`);
    }
    
    if (!response.data.status || response.data.status !== 'OK') {
      throw new Error('Server health status is not OK');
    }
    
    if (!response.data.version) {
      throw new Error('Server version not found in health response');
    }
  }

  async testWebsitesAPI() {
    const response = await this.makeRequest('/api/websites');
    
    if (response.status !== 200) {
      throw new Error(`Websites API failed: ${response.status}`);
    }
    
    if (!response.data.success) {
      throw new Error('Websites API returned success: false');
    }
    
    if (!Array.isArray(response.data.websites)) {
      throw new Error('Websites API did not return an array');
    }
    
    console.log(`   📄 Found ${response.data.websites.length} websites`);
  }

  async testSpecificWebsite() {
    // First get list of websites
    const listResponse = await this.makeRequest('/api/websites');
    
    if (!listResponse.data.websites || listResponse.data.websites.length === 0) {
      throw new Error('No websites found to test');
    }
    
    const firstWebsite = listResponse.data.websites[0];
    const response = await this.makeRequest(`/api/websites/${firstWebsite.id}`);
    
    if (response.status !== 200) {
      throw new Error(`Website detail API failed: ${response.status}`);
    }
    
    if (!response.data.success) {
      throw new Error('Website detail API returned success: false');
    }
    
    if (!response.data.content) {
      throw new Error('Website content not found');
    }
    
    console.log(`   📝 Tested website: ${firstWebsite.id}`);
  }

  async testWebsiteSave() {
    // Get first website
    const listResponse = await this.makeRequest('/api/websites');
    if (!listResponse.data.websites || listResponse.data.websites.length === 0) {
      throw new Error('No websites found to test save');
    }
    
    const firstWebsite = listResponse.data.websites[0];
    const testContent = `<!DOCTYPE html><html><head><title>Test Save ${Date.now()}</title></head><body><h1>Test Content</h1></body></html>`;
    
    const response = await this.makeRequest(`/api/websites/${firstWebsite.id}/save`, {
      method: 'POST',
      body: { content: testContent }
    });
    
    if (response.status !== 200) {
      throw new Error(`Website save failed: ${response.status}`);
    }
    
    if (!response.data.success) {
      throw new Error('Website save returned success: false');
    }
    
    console.log(`   💾 Save test completed for: ${firstWebsite.id}`);
  }

  async testFileUpload() {
    // This is a simplified test - in a real scenario you'd use FormData
    const response = await this.makeRequest('/api/upload', {
      method: 'POST'
    });
    
    // We expect this to fail without a file, but the endpoint should exist
    if (response.status === 404) {
      throw new Error('Upload endpoint not found');
    }
    
    // 400 is expected since we didn't send a file
    if (response.status !== 400) {
      console.log(`   ⚠️ Upload endpoint responded with ${response.status} (expected 400 without file)`);
    }
    
    console.log(`   📤 Upload endpoint is accessible`);
  }

  async testAIEndpoint() {
    const response = await this.makeRequest('/api/ai/generate', {
      method: 'POST',
      body: { prompt: 'test prompt', type: 'text' }
    });
    
    if (response.status !== 200) {
      throw new Error(`AI endpoint failed: ${response.status}`);
    }
    
    if (!response.data.success) {
      throw new Error('AI endpoint returned success: false');
    }
    
    console.log(`   🤖 AI endpoint is working`);
  }

  async testBackupsAPI() {
    // Get first website
    const listResponse = await this.makeRequest('/api/websites');
    if (!listResponse.data.websites || listResponse.data.websites.length === 0) {
      throw new Error('No websites found to test backups');
    }
    
    const firstWebsite = listResponse.data.websites[0];
    const response = await this.makeRequest(`/api/backups/${firstWebsite.id}`);
    
    if (response.status !== 200) {
      throw new Error(`Backups API failed: ${response.status}`);
    }
    
    if (!response.data.success) {
      throw new Error('Backups API returned success: false');
    }
    
    if (!Array.isArray(response.data.backups)) {
      throw new Error('Backups API did not return an array');
    }
    
    console.log(`   📦 Found ${response.data.backups.length} backups for ${firstWebsite.id}`);
  }

  async testAnalytics() {
    const response = await this.makeRequest('/api/analytics/track', {
      method: 'POST',
      body: {
        event: 'test_event',
        websiteId: 'test_website',
        data: { test: true }
      }
    });
    
    if (response.status !== 200) {
      throw new Error(`Analytics API failed: ${response.status}`);
    }
    
    if (!response.data.success) {
      throw new Error('Analytics API returned success: false');
    }
    
    console.log(`   📊 Analytics tracking is working`);
  }

  async testFileSystem() {
    const projectRoot = path.join(__dirname, '../');
    const requiredDirs = [
      'websites',
      'public',
      'public/uploads',
      'saves'
    ];
    
    for (const dir of requiredDirs) {
      const dirPath = path.join(projectRoot, dir);
      try {
        await fs.access(dirPath);
      } catch (error) {
        throw new Error(`Required directory missing: ${dir}`);
      }
    }
    
    console.log(`   📁 All required directories exist`);
  }

  async testEnvironmentConfig() {
    const envPath = path.join(__dirname, '.env');
    
    try {
      await fs.access(envPath);
    } catch (error) {
      throw new Error('.env file not found');
    }
    
    const requiredVars = ['NODE_ENV', 'PORT'];
    const missingVars = [];
    
    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        missingVars.push(varName);
      }
    }
    
    if (missingVars.length > 0) {
      throw new Error(`Missing environment variables: ${missingVars.join(', ')}`);
    }
    
    console.log(`   ⚙️ Environment configuration is valid`);
  }

  async testSupabaseConnection() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project-id')) {
      console.log(`   ⚠️ Supabase not configured - running in local mode`);
      return;
    }
    
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data, error } = await supabase.from('websites').select('count').limit(1);
      
      if (error) {
        throw new Error(`Supabase connection failed: ${error.message}`);
      }
      
      console.log(`   🗄️ Supabase connection successful`);
    } catch (error) {
      throw new Error(`Supabase test failed: ${error.message}`);
    }
  }

  async waitForServer() {
    console.log('🔄 Waiting for server to be ready...');
    
    let attempts = 0;
    const maxAttempts = 30;
    
    while (attempts < maxAttempts) {
      try {
        await this.makeRequest('/api/health');
        console.log('✅ Server is ready!');
        return;
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) {
          throw new Error('Server did not start within 30 seconds');
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  generateReport() {
    const successRate = ((this.passedTests / this.totalTests) * 100).toFixed(1);
    
    console.log(`
🧪 WebMaster Pro - Test Results
================================

📊 Summary:
   Total Tests: ${this.totalTests}
   Passed: ${this.passedTests}
   Failed: ${this.failedTests}
   Success Rate: ${successRate}%

${this.failedTests > 0 ? '❌ Failed Tests:' : '✅ All Tests Passed!'}
    `);
    
    if (this.failedTests > 0) {
      this.testResults
        .filter(test => test.status === 'FAIL')
        .forEach(test => {
          console.log(`   ❌ ${test.name}: ${test.error}`);
        });
    }
    
    console.log(`
📋 Detailed Results:
    `);
    
    this.testResults.forEach(test => {
      const icon = test.status === 'PASS' ? '✅' : '❌';
      console.log(`   ${icon} ${test.name} (${test.duration})`);
    });
    
    return this.failedTests === 0;
  }

  async runAllTests() {
    console.log(`
🧪 WebMaster Pro - System Testing
=================================
    `);
    
    try {
      // Wait for server to be ready
      await this.waitForServer();
      
      // Infrastructure Tests
      console.log('\n📁 Testing Infrastructure...');
      await this.test('File System Structure', () => this.testFileSystem());
      await this.test('Environment Configuration', () => this.testEnvironmentConfig());
      await this.test('Supabase Connection', () => this.testSupabaseConnection());
      
      // API Tests
      console.log('\n🌐 Testing API Endpoints...');
      await this.test('Server Health Check', () => this.testServerHealth());
      await this.test('Websites List API', () => this.testWebsitesAPI());
      await this.test('Website Detail API', () => this.testSpecificWebsite());
      await this.test('Website Save API', () => this.testWebsiteSave());
      await this.test('File Upload API', () => this.testFileUpload());
      await this.test('AI Generation API', () => this.testAIEndpoint());
      await this.test('Backups API', () => this.testBackupsAPI());
      await this.test('Analytics API', () => this.testAnalytics());
      
      // Generate final report
      const allTestsPassed = this.generateReport();
      
      if (allTestsPassed) {
        console.log('🎉 All systems are working perfectly!');
        process.exit(0);
      } else {
        console.log('⚠️ Some tests failed - check the errors above');
        process.exit(1);
      }
      
    } catch (error) {
      console.error('💥 Critical testing error:', error.message);
      process.exit(1);
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new SystemTester();
  tester.runAllTests();
}

module.exports = SystemTester;

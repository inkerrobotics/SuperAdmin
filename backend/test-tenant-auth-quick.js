/**
 * Quick test for tenant authentication
 * Run this to verify tenant can login
 */

const BASE_URL = 'http://localhost:5001/api';

async function quickTest() {
  console.log('\n🔍 Testing Tenant Authentication\n');

  try {
    // Test with existing tenant credentials
    const email = process.argv[2] || 'test@testcorp.com';
    const password = process.argv[3] || 'TestPass123';

    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}\n`);

    console.log('🚀 Attempting tenant login...');
    console.log(`   Endpoint: POST ${BASE_URL}/tenant-auth/login\n`);

    const response = await fetch(`${BASE_URL}/tenant-auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      console.log('❌ Login Failed\n');
      console.log('Status:', response.status);
      console.log('Error:', data.message);
      console.log('\n📋 Troubleshooting Steps:');
      console.log('1. Check if tenant exists in database');
      console.log('2. Verify tenant status is ACTIVE');
      console.log('3. Confirm password is correct');
      console.log('4. Check backend is running on port 5001');
      console.log('\n💡 To create a test tenant:');
      console.log('   1. Login to Super Admin Dashboard');
      console.log('   2. Go to Tenants > Create New Client');
      console.log('   3. Fill the form and submit');
      console.log('   4. Change tenant status to ACTIVE');
      return;
    }

    console.log('✅ Login Successful!\n');
    console.log('📦 Response:');
    console.log(JSON.stringify(data, null, 2));
    console.log('\n🎉 Tenant can now use this token for Lucky Draw API calls');
    console.log('\n📝 Token (first 50 chars):', data.token.substring(0, 50) + '...');
    console.log('\n🔧 Use this in Lucky Draw frontend:');
    console.log('   localStorage.setItem("tenant_token", token);');
    console.log('   headers: { Authorization: `Bearer ${token}` }');

  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('\n⚠️  Make sure backend server is running:');
    console.log('   cd backend && npm run dev');
  }
}

// Run test
quickTest();

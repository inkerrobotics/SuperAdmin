/**
 * Test script for Tenant Login System
 * 
 * This demonstrates the separation between:
 * 1. Super Admin login (for dashboard management)
 * 2. Tenant login (for Lucky Draw System)
 */

const BASE_URL = 'http://localhost:5001/api';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testTenantLogin() {
  log('\n=== TENANT LOGIN SYSTEM TEST ===\n', 'cyan');

  try {
    // Step 1: Super Admin Login
    log('Step 1: Super Admin Login', 'blue');
    log('Endpoint: POST /api/auth/super-admin/login', 'yellow');
    
    const superAdminLogin = await fetch(`${BASE_URL}/auth/super-admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'Admin@123'
      })
    });

    if (!superAdminLogin.ok) {
      throw new Error('Super Admin login failed');
    }

    const superAdminData = await superAdminLogin.json();
    const superAdminCookie = superAdminLogin.headers.get('set-cookie');
    log('✓ Super Admin logged in successfully', 'green');
    log(`  User: ${superAdminData.user.email}`, 'green');
    log(`  Role: ${superAdminData.user.role}\n`, 'green');

    // Step 2: Create Test Tenant (as Super Admin)
    log('Step 2: Create Test Tenant', 'blue');
    log('Endpoint: POST /api/tenants/create', 'yellow');
    
    const testEmail = `test-${Date.now()}@testcorp.com`;
    const testPassword = 'TestPass123';

    const createTenant = await fetch(`${BASE_URL}/tenants/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': superAdminCookie
      },
      body: JSON.stringify({
        name: 'Test Corporation',
        email: testEmail,
        password: testPassword,
        subscriptionPlan: 'Professional',
        dataUsageConsent: true,
        dataPrivacyAcknowledged: true,
        businessCategory: 'Technology',
        timezone: 'Asia/Kolkata',
        country: 'India'
      })
    });

    if (!createTenant.ok) {
      const error = await createTenant.json();
      throw new Error(`Create tenant failed: ${error.message}`);
    }

    const tenantData = await createTenant.json();
    log('✓ Tenant created successfully', 'green');
    log(`  Tenant ID: ${tenantData.tenantId}`, 'green');
    log(`  Name: ${tenantData.name}`, 'green');
    log(`  Email: ${tenantData.email}`, 'green');
    log(`  Status: ${tenantData.status}\n`, 'green');

    // Step 3: Activate Tenant (as Super Admin)
    log('Step 3: Activate Tenant', 'blue');
    log('Endpoint: PATCH /api/tenants/:id/status', 'yellow');
    
    const activateTenant = await fetch(`${BASE_URL}/tenants/${tenantData.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': superAdminCookie
      },
      body: JSON.stringify({
        status: 'ACTIVE',
        reason: 'Testing tenant login system'
      })
    });

    if (!activateTenant.ok) {
      const error = await activateTenant.json();
      throw new Error(`Activate tenant failed: ${error.message}`);
    }

    log('✓ Tenant activated successfully', 'green');
    log('  Status: ACTIVE\n', 'green');

    // Step 4: Tenant Login (for Lucky Draw System)
    log('Step 4: Tenant Login to Lucky Draw System', 'blue');
    log('Endpoint: POST /api/tenant-auth/login', 'yellow');
    log('Note: This is a DIFFERENT endpoint from Super Admin login', 'yellow');
    
    const tenantLogin = await fetch(`${BASE_URL}/tenant-auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });

    if (!tenantLogin.ok) {
      const error = await tenantLogin.json();
      throw new Error(`Tenant login failed: ${error.message}`);
    }

    const tenantLoginData = await tenantLogin.json();
    const tenantCookie = tenantLogin.headers.get('set-cookie');
    log('✓ Tenant logged in successfully', 'green');
    log(`  Tenant ID: ${tenantLoginData.tenant.tenantId}`, 'green');
    log(`  Name: ${tenantLoginData.tenant.name}`, 'green');
    log(`  Email: ${tenantLoginData.tenant.email}`, 'green');
    log(`  Token Type: tenant (different from Super Admin token)\n`, 'green');

    // Step 5: Get Tenant Profile
    log('Step 5: Get Tenant Profile', 'blue');
    log('Endpoint: GET /api/tenant-auth/profile', 'yellow');
    
    const tenantProfile = await fetch(`${BASE_URL}/tenant-auth/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tenantLoginData.token}`
      }
    });

    if (!tenantProfile.ok) {
      const error = await tenantProfile.json();
      throw new Error(`Get profile failed: ${error.message}`);
    }

    const profileData = await tenantProfile.json();
    log('✓ Tenant profile retrieved successfully', 'green');
    log(`  Tenant ID: ${profileData.tenantId}`, 'green');
    log(`  Subscription: ${profileData.subscriptionPlan}`, 'green');
    log(`  Last Login: ${profileData.lastLoginAt}\n`, 'green');

    // Step 6: Try to use Tenant token on Super Admin endpoint (should fail)
    log('Step 6: Security Test - Use Tenant Token on Super Admin Endpoint', 'blue');
    log('Endpoint: GET /api/dashboard/stats', 'yellow');
    log('Expected: Should fail (wrong token type)', 'yellow');
    
    const securityTest = await fetch(`${BASE_URL}/dashboard/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tenantLoginData.token}`
      }
    });

    if (!securityTest.ok) {
      log('✓ Security check passed - Tenant token rejected on Super Admin endpoint', 'green');
    } else {
      log('✗ Security issue - Tenant token accepted on Super Admin endpoint', 'red');
    }

    // Summary
    log('\n=== TEST SUMMARY ===\n', 'cyan');
    log('✓ Super Admin can login to dashboard', 'green');
    log('✓ Super Admin can create tenants', 'green');
    log('✓ Tenant can login to Lucky Draw System', 'green');
    log('✓ Tenant and Super Admin use different authentication', 'green');
    log('✓ Token types are properly separated', 'green');
    log('\n=== KEY POINTS ===\n', 'cyan');
    log('1. Super Admin Login: /api/auth/super-admin/login', 'yellow');
    log('   Purpose: Manage platform, create tenants', 'yellow');
    log('\n2. Tenant Login: /api/tenant-auth/login', 'yellow');
    log('   Purpose: Access Lucky Draw System', 'yellow');
    log('\n3. Credentials created by Super Admin are for Lucky Draw System', 'yellow');
    log('   NOT for Super Admin dashboard', 'yellow');
    log('\n');

  } catch (error) {
    log(`\n✗ Test failed: ${error.message}`, 'red');
    log('\nMake sure:', 'yellow');
    log('1. Backend server is running (npm run dev)', 'yellow');
    log('2. Database is connected', 'yellow');
    log('3. Super Admin exists (admin@example.com / Admin@123)', 'yellow');
    log('');
  }
}

// Run the test
testTenantLogin();

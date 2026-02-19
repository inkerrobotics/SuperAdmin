const fetch = require('node-fetch');

async function testTenantCreation() {
  try {
    // First, login as super admin
    console.log('Logging in as super admin...');
    const loginResponse = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'Admin@123'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${await loginResponse.text()}`);
    }

    const loginData = await loginResponse.json();
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('Login successful!');

    // Create a test tenant
    console.log('\nCreating test tenant...');
    const createResponse = await fetch('http://localhost:5001/api/tenants/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      },
      body: JSON.stringify({
        name: 'Test Organization',
        email: 'test@testorg.com',
        password: 'TestPass123!',
        subscriptionPlan: 'Professional',
        whatsappPhoneNumberId: '123456789012345',
        whatsappAccessToken: 'EAAtest123456789',
        whatsappBusinessId: '987654321098765',
        whatsappWebhookSecret: 'webhook_secret_123',
        whatsappVerifyToken: 'verify_token_123'
      })
    });

    if (!createResponse.ok) {
      const error = await createResponse.json();
      throw new Error(`Tenant creation failed: ${JSON.stringify(error)}`);
    }

    const tenant = await createResponse.json();
    console.log('Tenant created successfully!');
    console.log('Tenant ID:', tenant.tenantId);
    console.log('Tenant Name:', tenant.name);
    console.log('Status:', tenant.status);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testTenantCreation();

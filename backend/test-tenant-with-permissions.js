const fetch = require('node-fetch');

async function testTenantCreationWithPermissions() {
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

    // Create a test tenant with permissions
    console.log('\nCreating test tenant with Lucky Draw permissions...');
    const createResponse = await fetch('http://localhost:5001/api/tenants/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      },
      body: JSON.stringify({
        name: 'Lucky Draw Corp',
        email: 'luckydraw@example.com',
        password: 'LuckyPass123!',
        subscriptionPlan: 'Enterprise',
        permissions: [
          { module: 'Campaigns', canView: true, canCreate: true, canEdit: true, canDelete: true },
          { module: 'Participants', canView: true, canCreate: true, canEdit: true, canDelete: false },
          { module: 'Winners', canView: true, canCreate: false, canEdit: false, canDelete: false },
          { module: 'Draw Management', canView: true, canCreate: true, canEdit: true, canDelete: true },
          { module: 'Reports & Analytics', canView: true, canCreate: false, canEdit: false, canDelete: false },
          { module: 'Settings', canView: true, canCreate: false, canEdit: true, canDelete: false }
        ],
        whatsappPhoneNumberId: '123456789012345',
        whatsappAccessToken: 'EAAtest123456789',
        whatsappBusinessId: '987654321098765'
      })
    });

    if (!createResponse.ok) {
      const error = await createResponse.json();
      throw new Error(`Tenant creation failed: ${JSON.stringify(error)}`);
    }

    const tenant = await createResponse.json();
    console.log('✅ Tenant created successfully!');
    console.log('Tenant ID:', tenant.tenantId);
    console.log('Tenant Name:', tenant.name);
    console.log('Status:', tenant.status);
    console.log('\n✅ Permissions configured for Lucky Draw System modules');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testTenantCreationWithPermissions();

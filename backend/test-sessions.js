const API_URL = 'http://localhost:5001/api';

async function testSessions() {
  console.log('🧪 Testing Session Management System\n');

  try {
    // Step 1: Login
    console.log('1️⃣ Logging in...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'Admin@123'
      }),
      credentials: 'include'
    });

    if (!loginRes.ok) {
      throw new Error(`Login failed: ${loginRes.status}`);
    }

    const loginData = await loginRes.json();
    console.log('✅ Login successful');
    console.log(`   User: ${loginData.user.email}`);
    console.log(`   Role: ${loginData.user.role}\n`);

    // Extract cookie for subsequent requests
    const cookies = loginRes.headers.get('set-cookie');

    // Step 2: Get user sessions
    console.log('2️⃣ Fetching user sessions...');
    const sessionsRes = await fetch(`${API_URL}/sessions/my-sessions`, {
      headers: { Cookie: cookies },
      credentials: 'include'
    });

    if (!sessionsRes.ok) {
      throw new Error(`Failed to fetch sessions: ${sessionsRes.status}`);
    }

    const sessions = await sessionsRes.json();
    console.log(`✅ Found ${sessions.length} active session(s)`);
    sessions.forEach((session, i) => {
      console.log(`   Session ${i + 1}:`);
      console.log(`     Device: ${session.deviceName || 'Unknown'}`);
      console.log(`     Browser: ${session.browser || 'Unknown'}`);
      console.log(`     OS: ${session.os || 'Unknown'}`);
      console.log(`     IP: ${session.ipAddress || 'Unknown'}`);
      console.log(`     Active: ${session.isActive}`);
    });
    console.log('');

    // Step 3: Get session stats
    console.log('3️⃣ Fetching session statistics...');
    const statsRes = await fetch(`${API_URL}/sessions/my-stats`, {
      headers: { Cookie: cookies },
      credentials: 'include'
    });

    if (!statsRes.ok) {
      throw new Error(`Failed to fetch stats: ${statsRes.status}`);
    }

    const stats = await statsRes.json();
    console.log('✅ Session Statistics:');
    console.log(`   Active: ${stats.totalActive}`);
    console.log(`   Expired: ${stats.totalExpired}`);
    console.log(`   Revoked: ${stats.totalRevoked}`);
    console.log(`   Recent (24h): ${stats.recentLogins}\n`);

    // Step 4: Test session revocation (if multiple sessions exist)
    if (sessions.length > 1) {
      console.log('4️⃣ Testing session revocation...');
      const sessionToRevoke = sessions[1].id;
      
      const revokeRes = await fetch(`${API_URL}/sessions/${sessionToRevoke}/revoke`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Cookie: cookies 
        },
        body: JSON.stringify({ reason: 'Test revocation' }),
        credentials: 'include'
      });

      if (!revokeRes.ok) {
        throw new Error(`Failed to revoke session: ${revokeRes.status}`);
      }

      console.log('✅ Session revoked successfully\n');
    }

    console.log('✅ All tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testSessions();

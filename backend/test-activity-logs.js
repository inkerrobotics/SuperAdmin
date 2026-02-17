const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true
});

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

async function testActivityLogsForUserCreation() {
  console.log('\n' + '='.repeat(70));
  log('Testing Activity Logs for User Creation', 'cyan');
  console.log('='.repeat(70) + '\n');

  try {
    // Step 1: Login as Super Admin
    log('Step 1: Logging in as Super Admin...', 'yellow');
    const loginResponse = await api.post('/auth/login', {
      email: 'admin@example.com',
      password: 'Admin@123'
    });
    
    const cookies = loginResponse.headers['set-cookie'];
    if (cookies) {
      const tokenCookie = cookies.find(c => c.startsWith('token='));
      if (tokenCookie) {
        const token = tokenCookie.split(';')[0].split('=')[1];
        api.defaults.headers.common['Cookie'] = `token=${token}`;
        log('✓ Login successful', 'green');
      }
    }

    // Step 2: Check activity logs before user creation
    log('\nStep 2: Checking activity logs before user creation...', 'yellow');
    const logsBeforeResponse = await api.get('/activity-logs');
    const logsBefore = logsBeforeResponse.data.logs;
    log(`✓ Current activity logs count: ${logsBeforeResponse.data.pagination.total}`, 'green');
    
    // Show recent login logs
    const loginLogs = logsBefore.filter(l => l.action === 'login');
    log(`  - Login logs: ${loginLogs.length}`, 'blue');
    if (loginLogs.length > 0) {
      const recentLogin = loginLogs[0];
      log(`  - Most recent: ${recentLogin.description}`, 'blue');
    }

    // Step 3: Create a new user
    log('\nStep 3: Creating a new user...', 'yellow');
    const timestamp = Date.now();
    const newUser = {
      name: `Test User ${timestamp}`,
      email: `testuser${timestamp}@example.com`,
      password: 'Test@123',
      role: 'USER'
    };
    
    const createUserResponse = await api.post('/users', newUser);
    log(`✓ User created: ${createUserResponse.data.email}`, 'green');
    log(`  - User ID: ${createUserResponse.data.id}`, 'blue');
    log(`  - User Name: ${createUserResponse.data.name}`, 'blue');

    // Step 4: Wait a moment for the log to be created
    log('\nStep 4: Waiting 1 second for activity log to be created...', 'yellow');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 5: Check activity logs after user creation
    log('\nStep 5: Checking activity logs after user creation...', 'yellow');
    const logsAfterResponse = await api.get('/activity-logs');
    const logsAfter = logsAfterResponse.data.logs;
    log(`✓ New activity logs count: ${logsAfterResponse.data.pagination.total}`, 'green');

    // Step 6: Find the user creation log
    log('\nStep 6: Looking for user creation log...', 'yellow');
    const userCreationLogs = logsAfter.filter(l => l.action === 'create_user');
    
    if (userCreationLogs.length > 0) {
      log(`✓ Found ${userCreationLogs.length} user creation log(s)`, 'green');
      const latestLog = userCreationLogs[0];
      log('\n  Latest User Creation Log:', 'cyan');
      log(`  - Action: ${latestLog.action}`, 'blue');
      log(`  - Module: ${latestLog.module}`, 'blue');
      log(`  - Description: ${latestLog.description}`, 'blue');
      log(`  - Status: ${latestLog.status}`, 'blue');
      log(`  - Created by: ${latestLog.user?.email || 'Unknown'}`, 'blue');
      log(`  - IP Address: ${latestLog.ipAddress || 'N/A'}`, 'blue');
      log(`  - User Agent: ${latestLog.userAgent || 'N/A'}`, 'blue');
      log(`  - Created at: ${new Date(latestLog.createdAt).toLocaleString()}`, 'blue');
    } else {
      log('✗ No user creation logs found!', 'red');
    }

    // Step 7: Check all activity log types
    log('\nStep 7: Activity Log Summary:', 'yellow');
    const actionCounts = {};
    logsAfter.forEach(log => {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
    });
    
    Object.entries(actionCounts).forEach(([action, count]) => {
      log(`  - ${action}: ${count}`, 'blue');
    });

    // Step 8: Test login activity log
    log('\nStep 8: Testing login with the new user...', 'yellow');
    
    // Logout first
    await api.post('/auth/logout');
    
    // Login with new user
    const newUserLoginResponse = await api.post('/auth/login', {
      email: newUser.email,
      password: newUser.password
    });
    
    const newUserCookies = newUserLoginResponse.headers['set-cookie'];
    if (newUserCookies) {
      const tokenCookie = newUserCookies.find(c => c.startsWith('token='));
      if (tokenCookie) {
        const token = tokenCookie.split(';')[0].split('=')[1];
        api.defaults.headers.common['Cookie'] = `token=${token}`;
        log('✓ New user login successful', 'green');
      }
    }

    // Wait and check logs again
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Login back as admin to check logs
    await api.post('/auth/logout');
    const adminLoginResponse = await api.post('/auth/login', {
      email: 'admin@example.com',
      password: 'Admin@123'
    });
    const adminCookies = adminLoginResponse.headers['set-cookie'];
    if (adminCookies) {
      const tokenCookie = adminCookies.find(c => c.startsWith('token='));
      if (tokenCookie) {
        const token = tokenCookie.split(';')[0].split('=')[1];
        api.defaults.headers.common['Cookie'] = `token=${token}`;
      }
    }

    const finalLogsResponse = await api.get('/activity-logs');
    const finalLogs = finalLogsResponse.data.logs;
    const newUserLoginLogs = finalLogs.filter(l => 
      l.action === 'login' && l.user?.email === newUser.email
    );
    
    if (newUserLoginLogs.length > 0) {
      log('✓ Found login log for new user', 'green');
      const loginLog = newUserLoginLogs[0];
      log(`  - Description: ${loginLog.description}`, 'blue');
    } else {
      log('✗ No login log found for new user', 'red');
    }

    // Step 9: Get statistics
    log('\nStep 9: Activity Log Statistics:', 'yellow');
    const statsResponse = await api.get('/activity-logs/stats');
    log(`  - Total logs: ${statsResponse.data.totalLogs}`, 'blue');
    log(`  - Login attempts: ${statsResponse.data.loginAttempts}`, 'blue');
    log(`  - Failed logins: ${statsResponse.data.failedLogins}`, 'blue');
    log(`  - Recent activity (24h): ${statsResponse.data.recentActivity}`, 'blue');

    // Step 10: Cleanup - Delete the test user
    log('\nStep 10: Cleaning up - Deleting test user...', 'yellow');
    await api.delete(`/users/${createUserResponse.data.id}`);
    log('✓ Test user deleted', 'green');

    // Check for delete log
    await new Promise(resolve => setTimeout(resolve, 1000));
    const deleteLogsResponse = await api.get('/activity-logs');
    const deleteLogs = deleteLogsResponse.data.logs.filter(l => l.action === 'delete_user');
    if (deleteLogs.length > 0) {
      log('✓ Found user deletion log', 'green');
      log(`  - Description: ${deleteLogs[0].description}`, 'blue');
    }

    console.log('\n' + '='.repeat(70));
    log('✓ All tests completed successfully!', 'green');
    console.log('='.repeat(70) + '\n');

  } catch (error) {
    log(`\n✗ Test failed: ${error.message}`, 'red');
    if (error.response) {
      log(`  Status: ${error.response.status}`, 'red');
      log(`  Message: ${error.response.data?.message}`, 'red');
    }
    console.error(error);
  }
}

// Run the test
testActivityLogsForUserCreation();

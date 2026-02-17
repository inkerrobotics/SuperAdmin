const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';
let authToken = '';

// Helper function to make authenticated requests
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true
});

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

function logTest(testName) {
  console.log('\n' + '='.repeat(60));
  log(`Testing: ${testName}`, 'cyan');
  console.log('='.repeat(60));
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ ${message}`, 'blue');
}

// Test functions
async function testLogin() {
  logTest('Authentication - Login');
  try {
    const response = await api.post('/auth/login', {
      email: 'admin@example.com',
      password: 'Admin@123'
    });
    
    // Extract token from cookie
    const cookies = response.headers['set-cookie'];
    if (cookies) {
      const tokenCookie = cookies.find(c => c.startsWith('token='));
      if (tokenCookie) {
        authToken = tokenCookie.split(';')[0].split('=')[1];
        api.defaults.headers.common['Cookie'] = `token=${authToken}`;
        logSuccess('Login successful');
        logInfo(`User: ${response.data.user.email}`);
        logInfo(`Role: ${response.data.user.role}`);
        return true;
      }
    }
    logError('No token received');
    return false;
  } catch (error) {
    logError(`Login failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Activity Logs Tests
async function testActivityLogs() {
  logTest('Activity Logs - Get All Logs');
  try {
    const response = await api.get('/activity-logs');
    logSuccess(`Retrieved ${response.data.logs.length} activity logs`);
    logInfo(`Total logs: ${response.data.pagination.total}`);
    logInfo(`Current page: ${response.data.pagination.page}`);
    if (response.data.logs.length > 0) {
      const log = response.data.logs[0];
      logInfo(`Sample log: ${log.action} - ${log.module} - ${log.description}`);
    }
  } catch (error) {
    logError(`Failed: ${error.response?.data?.message || error.message}`);
  }
}

async function testActivityLogStats() {
  logTest('Activity Logs - Get Statistics');
  try {
    const response = await api.get('/activity-logs/stats');
    logSuccess('Retrieved activity log statistics');
    logInfo(`Total logs: ${response.data.totalLogs}`);
    logInfo(`Login attempts: ${response.data.loginAttempts}`);
    logInfo(`Failed logins: ${response.data.failedLogins}`);
    logInfo(`Recent activity (24h): ${response.data.recentActivity}`);
  } catch (error) {
    logError(`Failed: ${error.response?.data?.message || error.message}`);
  }
}

async function testActivityLogFilters() {
  logTest('Activity Logs - Test Filters');
  try {
    const response = await api.get('/activity-logs', {
      params: {
        module: 'Dashboard',
        page: 1,
        limit: 10
      }
    });
    logSuccess(`Filtered logs retrieved: ${response.data.logs.length} logs`);
    logInfo(`Filter: module=Dashboard`);
  } catch (error) {
    logError(`Failed: ${error.response?.data?.message || error.message}`);
  }
}

async function testActivityLogExport() {
  logTest('Activity Logs - Export Logs');
  try {
    const response = await api.get('/activity-logs/export');
    logSuccess(`Exported ${response.data.length} logs`);
  } catch (error) {
    logError(`Failed: ${error.response?.data?.message || error.message}`);
  }
}

// Notifications Tests
async function testNotificationTemplates() {
  logTest('Notifications - Get All Templates');
  try {
    const response = await api.get('/notifications/templates');
    logSuccess(`Retrieved ${response.data.length} notification templates`);
    if (response.data.length > 0) {
      const template = response.data[0];
      logInfo(`Sample template: ${template.name} - ${template.type}`);
    }
  } catch (error) {
    logError(`Failed: ${error.response?.data?.message || error.message}`);
  }
}

async function testCreateNotificationTemplate() {
  logTest('Notifications - Create Template');
  try {
    const response = await api.post('/notifications/templates', {
      name: `Test Template ${Date.now()}`,
      title: 'Test Notification',
      message: 'This is a test notification message',
      type: 'INFO',
      variables: 'name,email'
    });
    logSuccess('Notification template created');
    logInfo(`Template ID: ${response.data.id}`);
    logInfo(`Template name: ${response.data.name}`);
    return response.data.id;
  } catch (error) {
    logError(`Failed: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

async function testUpdateNotificationTemplate(templateId) {
  if (!templateId) return;
  
  logTest('Notifications - Update Template');
  try {
    const response = await api.put(`/notifications/templates/${templateId}`, {
      title: 'Updated Test Notification',
      isActive: true
    });
    logSuccess('Notification template updated');
    logInfo(`Updated title: ${response.data.title}`);
  } catch (error) {
    logError(`Failed: ${error.response?.data?.message || error.message}`);
  }
}

async function testDeleteNotificationTemplate(templateId) {
  if (!templateId) return;
  
  logTest('Notifications - Delete Template');
  try {
    await api.delete(`/notifications/templates/${templateId}`);
    logSuccess('Notification template deleted');
  } catch (error) {
    logError(`Failed: ${error.response?.data?.message || error.message}`);
  }
}

async function testGetNotifications() {
  logTest('Notifications - Get All Notifications');
  try {
    const response = await api.get('/notifications');
    logSuccess(`Retrieved ${response.data.notifications.length} notifications`);
    logInfo(`Total: ${response.data.pagination.total}`);
    if (response.data.notifications.length > 0) {
      const notif = response.data.notifications[0];
      logInfo(`Sample: ${notif.title} - ${notif.type}`);
    }
  } catch (error) {
    logError(`Failed: ${error.response?.data?.message || error.message}`);
  }
}

async function testCreateNotification() {
  logTest('Notifications - Create Notification');
  try {
    const response = await api.post('/notifications', {
      title: 'Test Notification',
      message: 'This is a test notification',
      type: 'INFO',
      targetType: 'all'
    });
    logSuccess('Notification created');
    logInfo(`Notification ID: ${response.data.id}`);
    return response.data.id;
  } catch (error) {
    logError(`Failed: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

async function testScheduleNotification() {
  logTest('Notifications - Schedule Notification');
  try {
    const scheduledDate = new Date(Date.now() + 3600000); // 1 hour from now
    const response = await api.post('/notifications/schedule', {
      title: 'Scheduled Test Notification',
      message: 'This notification is scheduled',
      type: 'INFO',
      targetType: 'all',
      scheduledAt: scheduledDate.toISOString()
    });
    logSuccess('Notification scheduled');
    logInfo(`Scheduled for: ${scheduledDate.toLocaleString()}`);
    return response.data.id;
  } catch (error) {
    logError(`Failed: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

async function testSendNotification(notificationId) {
  if (!notificationId) return;
  
  logTest('Notifications - Send Notification');
  try {
    const response = await api.post(`/notifications/${notificationId}/send`);
    logSuccess('Notification sent');
    logInfo(`Sent at: ${new Date(response.data.sentAt).toLocaleString()}`);
  } catch (error) {
    logError(`Failed: ${error.response?.data?.message || error.message}`);
  }
}

async function testNotificationStats() {
  logTest('Notifications - Get Statistics');
  try {
    const response = await api.get('/notifications/stats');
    logSuccess('Retrieved notification statistics');
    logInfo(`Total: ${response.data.total}`);
    logInfo(`Pending: ${response.data.pending}`);
    logInfo(`Sent: ${response.data.sent}`);
    logInfo(`Scheduled: ${response.data.scheduled}`);
  } catch (error) {
    logError(`Failed: ${error.response?.data?.message || error.message}`);
  }
}

// Backups Tests
async function testGetBackups() {
  logTest('Backups - Get All Backups');
  try {
    const response = await api.get('/backups');
    logSuccess(`Retrieved ${response.data.backups.length} backups`);
    logInfo(`Total: ${response.data.pagination.total}`);
    if (response.data.backups.length > 0) {
      const backup = response.data.backups[0];
      logInfo(`Sample: ${backup.name} - ${backup.status} - ${backup.type}`);
    }
  } catch (error) {
    logError(`Failed: ${error.response?.data?.message || error.message}`);
  }
}

async function testCreateManualBackup() {
  logTest('Backups - Create Manual Backup');
  try {
    const response = await api.post('/backups/manual', {
      name: `Manual Backup ${new Date().toLocaleString()}`
    });
    logSuccess('Manual backup created');
    logInfo(`Backup ID: ${response.data.id}`);
    logInfo(`Status: ${response.data.status}`);
    logInfo('Note: Backup will complete in ~2 seconds (simulated)');
    return response.data.id;
  } catch (error) {
    logError(`Failed: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

async function testScheduleBackup() {
  logTest('Backups - Schedule Backup');
  try {
    const scheduledDate = new Date(Date.now() + 86400000); // 24 hours from now
    const response = await api.post('/backups/schedule', {
      name: `Scheduled Backup ${new Date().toLocaleDateString()}`,
      scheduledAt: scheduledDate.toISOString()
    });
    logSuccess('Backup scheduled');
    logInfo(`Backup ID: ${response.data.id}`);
    logInfo(`Scheduled for: ${scheduledDate.toLocaleString()}`);
    return response.data.id;
  } catch (error) {
    logError(`Failed: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

async function testBackupStats() {
  logTest('Backups - Get Statistics');
  try {
    const response = await api.get('/backups/stats');
    logSuccess('Retrieved backup statistics');
    logInfo(`Total: ${response.data.total}`);
    logInfo(`Completed: ${response.data.completed}`);
    logInfo(`Pending: ${response.data.pending}`);
    logInfo(`Failed: ${response.data.failed}`);
    if (response.data.lastBackup) {
      logInfo(`Last backup: ${new Date(response.data.lastBackup).toLocaleString()}`);
    }
  } catch (error) {
    logError(`Failed: ${error.response?.data?.message || error.message}`);
  }
}

async function testBackupFilters() {
  logTest('Backups - Test Filters');
  try {
    const response = await api.get('/backups', {
      params: {
        status: 'completed',
        page: 1,
        limit: 10
      }
    });
    logSuccess(`Filtered backups retrieved: ${response.data.backups.length} backups`);
    logInfo(`Filter: status=completed`);
  } catch (error) {
    logError(`Failed: ${error.response?.data?.message || error.message}`);
  }
}

async function testDeleteBackup(backupId) {
  if (!backupId) return;
  
  logTest('Backups - Delete Backup');
  try {
    await api.delete(`/backups/${backupId}`);
    logSuccess('Backup deleted');
  } catch (error) {
    logError(`Failed: ${error.response?.data?.message || error.message}`);
  }
}

// Main test runner
async function runAllTests() {
  console.log('\n');
  log('╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║     SUPER ADMIN DASHBOARD - API TESTING SUITE             ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');
  
  // Login first
  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    logError('Cannot proceed without authentication');
    return;
  }

  // Activity Logs Tests
  log('\n\n' + '█'.repeat(60), 'yellow');
  log('  ACTIVITY LOGS TESTS', 'yellow');
  log('█'.repeat(60), 'yellow');
  await testActivityLogs();
  await testActivityLogStats();
  await testActivityLogFilters();
  await testActivityLogExport();

  // Notifications Tests
  log('\n\n' + '█'.repeat(60), 'yellow');
  log('  NOTIFICATIONS TESTS', 'yellow');
  log('█'.repeat(60), 'yellow');
  await testNotificationTemplates();
  const templateId = await testCreateNotificationTemplate();
  await testUpdateNotificationTemplate(templateId);
  await testGetNotifications();
  const notificationId = await testCreateNotification();
  const scheduledNotifId = await testScheduleNotification();
  await testSendNotification(notificationId);
  await testNotificationStats();
  await testDeleteNotificationTemplate(templateId);

  // Backups Tests
  log('\n\n' + '█'.repeat(60), 'yellow');
  log('  BACKUPS TESTS', 'yellow');
  log('█'.repeat(60), 'yellow');
  await testGetBackups();
  await testBackupStats();
  const backupId = await testCreateManualBackup();
  const scheduledBackupId = await testScheduleBackup();
  await testBackupFilters();
  
  // Wait for manual backup to complete
  if (backupId) {
    logInfo('Waiting 3 seconds for manual backup to complete...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    await testGetBackups();
    await testBackupStats();
  }
  
  // Cleanup
  await testDeleteBackup(scheduledBackupId);

  // Summary
  log('\n\n' + '═'.repeat(60), 'green');
  log('  TEST SUITE COMPLETED', 'green');
  log('═'.repeat(60), 'green');
  logInfo('Check the results above for any failures');
  console.log('\n');
}

// Run tests
runAllTests().catch(error => {
  logError(`Test suite failed: ${error.message}`);
  console.error(error);
});

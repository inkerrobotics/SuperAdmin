import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth.routes';
import tenantAuthRoutes from './routes/tenant-auth.routes';
import dashboardRoutes from './routes/dashboard.routes';
import rolesRoutes from './routes/roles.routes';
import settingsRoutes from './routes/settings.routes';
import emailTemplatesRoutes from './routes/email-templates.routes';
import usersRoutes from './routes/users.routes';
import activityLogsRoutes from './routes/activity-logs.routes';
import notificationsRoutes from './routes/notifications.routes';
import backupsRoutes from './routes/backups.routes';
import sessionRoutes from './routes/session.routes';
import dataCleaningRoutes from './routes/data-cleaning.routes';
import analyticsRoutes from './routes/analytics.routes';
import tenantsRoutes from './routes/tenants.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// CORS configuration - allow same origin and development URLs
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5001',  // Same origin in production
  'http://localhost:5173',  // Frontend dev server
  'http://localhost:5174',  // Frontend dev server (alternate port)
  'http://localhost:3000',  // Lucky Draw system
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (same origin requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Super Admin authentication
app.use('/api/auth', authRoutes);

// Tenant authentication (for Lucky Draw System)
app.use('/api/tenant-auth', tenantAuthRoutes);

// Super Admin routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/email-templates', emailTemplatesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/activity-logs', activityLogsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/backups', backupsRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/data-cleaning', dataCleaningRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/tenants', tenantsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve static files from frontend build
app.use(express.static(path.join(__dirname, '../public')));

// Debug endpoint to check if files exist
app.get('/debug/files', (req, res) => {
  const fs = require('fs');
  const publicPath = path.join(__dirname, '../public');
  
  try {
    const files = fs.readdirSync(publicPath);
    const indexExists = fs.existsSync(path.join(publicPath, 'index.html'));
    
    res.json({
      publicPath,
      files,
      indexExists,
      __dirname,
      cwd: process.cwd()
    });
  } catch (error: any) {
    res.json({
      error: error.message,
      publicPath,
      __dirname,
      cwd: process.cwd()
    });
  }
});

// Catch-all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  const indexPath = path.join(__dirname, '../public/index.html');
  console.log(`Serving index.html from: ${indexPath}`);
  
  // Check if file exists before sending
  const fs = require('fs');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ 
      error: 'Frontend files not found',
      path: indexPath,
      __dirname,
      cwd: process.cwd()
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;

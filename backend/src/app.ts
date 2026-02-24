import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
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
const PORT = process.env.PORT || 5000;

// CORS configuration to allow both Super Admin and Lucky Draw frontends
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',  // Super Admin Dashboard
  process.env.LUCKY_DRAW_URL || 'http://localhost:3000', // Lucky Draw System
  'http://localhost:3000',  // Lucky Draw default
  'http://localhost:5173',  // Super Admin default
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;

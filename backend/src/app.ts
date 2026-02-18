import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
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

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;

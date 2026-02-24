import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const { period = '7d' } = req.query;
    
    // Calculate date range based on period
    let startDate = new Date();
    switch (period) {
      case '24h':
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get basic stats
    const [totalUsers, totalTenants, activeTenants, totalAdminUsers] = await Promise.all([
      prisma.user.count(),
      prisma.tenant.count(),
      prisma.tenant.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count({ where: { role: 'ADMIN' } })
    ]);

    // Get activity in period
    const recentActivity = await prisma.activityLog.count({
      where: {
        createdAt: { gte: startDate }
      }
    });

    // Get login stats
    const loginStats = await prisma.activityLog.count({
      where: {
        action: 'login',
        createdAt: { gte: startDate }
      }
    });

    res.json({
      totalUsers,
      totalTenants,
      activeTenants,
      totalAdminUsers,
      recentActivity,
      loginStats,
      period,
      startDate,
      endDate: new Date()
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getSystemHealth = async (req: Request, res: Response) => {
  try {
    // Mock system health data
    // In production, you would get real metrics from your monitoring system
    const health = {
      cpu: Math.floor(Math.random() * 30) + 15, // 15-45%
      memory: Math.floor(Math.random() * 30) + 40, // 40-70%
      storage: Math.floor(Math.random() * 20) + 60, // 60-80%
      responseTime: Math.floor(Math.random() * 100) + 80, // 80-180ms
      uptime: 99.9,
      status: 'healthy'
    };

    res.json(health);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

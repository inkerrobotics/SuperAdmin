import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ActivityLogsService {
  async getAllLogs(filters?: {
    userId?: string;
    module?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters?.userId) {
      where.userId = filters.userId;
    }

    if (filters?.module) {
      where.module = filters.module;
    }

    if (filters?.action) {
      where.action = { contains: filters.action, mode: 'insensitive' };
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate);
      }
    }

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          tenant: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.activityLog.count({ where })
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async createLog(data: {
    userId?: string;
    tenantId?: string;
    action: string;
    module: string;
    description: string;
    ipAddress?: string;
    userAgent?: string;
    status?: string;
    metadata?: any;
  }) {
    return await prisma.activityLog.create({
      data: {
        ...data,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null
      }
    });
  }

  async getLogStats() {
    const [totalLogs, loginAttempts, failedLogins, recentActivity] = await Promise.all([
      prisma.activityLog.count(),
      prisma.activityLog.count({
        where: { action: 'login' }
      }),
      prisma.activityLog.count({
        where: { action: 'login', status: 'failed' }
      }),
      prisma.activityLog.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      })
    ]);

    return {
      totalLogs,
      loginAttempts,
      failedLogins,
      recentActivity
    };
  }

  async exportLogs(filters?: any) {
    const where: any = {};

    if (filters?.userId) where.userId = filters.userId;
    if (filters?.module) where.module = filters.module;
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }

    return await prisma.activityLog.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}

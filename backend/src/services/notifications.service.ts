import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class NotificationsService {
  // Notification Templates
  async getAllTemplates() {
    return await prisma.notificationTemplate.findMany({
      include: {
        createdByUser: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createTemplate(data: {
    name: string;
    title: string;
    message: string;
    type: string;
    variables: string;
    createdBy: string;
  }) {
    return await prisma.notificationTemplate.create({
      data
    });
  }

  async updateTemplate(id: string, data: {
    name?: string;
    title?: string;
    message?: string;
    type?: string;
    variables?: string;
    isActive?: boolean;
  }) {
    return await prisma.notificationTemplate.update({
      where: { id },
      data
    });
  }

  async deleteTemplate(id: string) {
    return await prisma.notificationTemplate.delete({
      where: { id }
    });
  }

  // Notifications
  async getAllNotifications(filters?: {
    type?: string;
    isRead?: boolean;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters?.type) where.type = filters.type;
    if (filters?.isRead !== undefined) where.isRead = filters.isRead;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: {
          createdByUser: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.notification.count({ where })
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async createNotification(data: {
    title: string;
    message: string;
    type: string;
    targetType: string;
    targetId?: string;
    scheduledAt?: Date;
    createdBy: string;
  }) {
    return await prisma.notification.create({
      data
    });
  }

  async scheduleNotification(data: {
    title: string;
    message: string;
    type: string;
    targetType: string;
    targetId?: string;
    scheduledAt: Date;
    createdBy: string;
  }) {
    return await prisma.notification.create({
      data
    });
  }

  async sendNotification(id: string) {
    return await prisma.notification.update({
      where: { id },
      data: {
        sentAt: new Date(),
        isRead: false
      }
    });
  }

  async getNotificationStats() {
    const [total, pending, sent, scheduled] = await Promise.all([
      prisma.notification.count(),
      prisma.notification.count({
        where: { sentAt: null, scheduledAt: null }
      }),
      prisma.notification.count({
        where: { sentAt: { not: null } }
      }),
      prisma.notification.count({
        where: { scheduledAt: { not: null }, sentAt: null }
      })
    ]);

    return { total, pending, sent, scheduled };
  }
}

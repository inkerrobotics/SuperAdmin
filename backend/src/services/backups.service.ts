import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class BackupsService {
  async getAllBackups(filters?: {
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.type) where.type = filters.type;

    const [backups, total] = await Promise.all([
      prisma.backup.findMany({
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
      prisma.backup.count({ where })
    ]);

    return {
      backups,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async createBackup(data: {
    name: string;
    type: string;
    createdBy: string;
    scheduledAt?: Date;
  }) {
    return await prisma.backup.create({
      data: {
        ...data,
        status: 'pending',
        startedAt: new Date()
      }
    });
  }

  async updateBackupStatus(id: string, status: string, data?: {
    size?: string;
    filePath?: string;
    completedAt?: Date;
    error?: string;
  }) {
    return await prisma.backup.update({
      where: { id },
      data: {
        status,
        ...data
      }
    });
  }

  async deleteBackup(id: string) {
    return await prisma.backup.delete({
      where: { id }
    });
  }

  async getBackupStats() {
    const [total, completed, pending, failed, lastBackup] = await Promise.all([
      prisma.backup.count(),
      prisma.backup.count({
        where: { status: 'completed' }
      }),
      prisma.backup.count({
        where: { status: 'pending' }
      }),
      prisma.backup.count({
        where: { status: 'failed' }
      }),
      prisma.backup.findFirst({
        where: { status: 'completed' },
        orderBy: { completedAt: 'desc' },
        select: { completedAt: true }
      })
    ]);

    return {
      total,
      completed,
      pending,
      failed,
      lastBackup: lastBackup?.completedAt || null
    };
  }

  async scheduleBackup(data: {
    name: string;
    type: string;
    scheduledAt: Date;
    createdBy: string;
  }) {
    return await prisma.backup.create({
      data: {
        ...data,
        status: 'scheduled'
      }
    });
  }
}

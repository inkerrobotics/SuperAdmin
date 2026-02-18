import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class DataCleaningService {
  /**
   * Get statistics for cleanable data
   */
  async getStats() {
    const now = new Date();
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [expiredSessions, oldLogs, oldBackups, totalRecords] = await Promise.all([
      // Expired sessions
      prisma.session.count({
        where: {
          OR: [
            { isActive: false },
            { expiresAt: { lt: now } }
          ]
        }
      }),
      // Old activity logs (older than 90 days)
      prisma.activityLog.count({
        where: {
          createdAt: { lt: ninetyDaysAgo }
        }
      }),
      // Old backups (older than 30 days)
      prisma.backup.count({
        where: {
          createdAt: { lt: thirtyDaysAgo },
          status: 'completed'
        }
      }),
      // Total records count
      Promise.all([
        prisma.session.count(),
        prisma.activityLog.count(),
        prisma.backup.count(),
        prisma.notification.count()
      ]).then(counts => counts.reduce((a, b) => a + b, 0))
    ]);

    const cleanableRecords = expiredSessions + oldLogs + oldBackups;

    return {
      expiredSessions,
      oldLogs,
      oldBackups,
      orphanedData: 0, // Placeholder for now
      totalRecords,
      cleanableRecords,
      totalSize: 0 // Placeholder - would need database-specific queries
    };
  }

  /**
   * Cleanup expired sessions
   */
  async cleanupExpiredSessions() {
    const now = new Date();
    
    const result = await prisma.session.deleteMany({
      where: {
        OR: [
          { isActive: false },
          { expiresAt: { lt: now } }
        ]
      }
    });

    return {
      count: result.count,
      message: `Cleaned up ${result.count} expired session(s)`
    };
  }

  /**
   * Cleanup old activity logs
   */
  async cleanupOldLogs(days: number = 90) {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const result = await prisma.activityLog.deleteMany({
      where: {
        createdAt: { lt: cutoffDate }
      }
    });

    return {
      count: result.count,
      message: `Cleaned up ${result.count} old activity log(s)`
    };
  }

  /**
   * Cleanup old backups
   */
  async cleanupOldBackups(days: number = 30) {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const result = await prisma.backup.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
        status: 'completed'
      }
    });

    return {
      count: result.count,
      message: `Cleaned up ${result.count} old backup(s)`
    };
  }

  /**
   * Cleanup orphaned data
   */
  async cleanupOrphanedData() {
    let totalCleaned = 0;

    // Clean up notifications without valid users
    const orphanedNotifications = await prisma.notification.deleteMany({
      where: {
        userId: {
          not: null
        },
        user: null
      }
    });
    totalCleaned += orphanedNotifications.count;

    // Clean up email logs without valid users
    const orphanedEmailLogs = await prisma.emailLog.deleteMany({
      where: {
        userId: {
          not: null
        },
        user: null
      }
    });
    totalCleaned += orphanedEmailLogs.count;

    return {
      count: totalCleaned,
      message: `Cleaned up ${totalCleaned} orphaned record(s)`
    };
  }
}

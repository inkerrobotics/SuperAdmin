import { PrismaClient } from '@prisma/client';
import UAParser from 'ua-parser-js';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export class SessionService {
  /**
   * Create a new session
   */
  async createSession(data: {
    userId: string;
    token: string;
    ipAddress?: string;
    userAgent?: string;
    expiresAt: Date;
  }) {
    // Parse user agent
    const parser = new (UAParser as any)(data.userAgent);
    const result = parser.getResult();

    return await prisma.session.create({
      data: {
        userId: data.userId,
        token: data.token,
        ipAddress: data.ipAddress,
        deviceName: this.getDeviceName(result),
        deviceType: result.device.type || 'desktop',
        browser: result.browser.name ? `${result.browser.name} ${result.browser.version || ''}`.trim() : undefined,
        os: result.os.name ? `${result.os.name} ${result.os.version || ''}`.trim() : undefined,
        expiresAt: data.expiresAt,
        isActive: true,
        lastActivity: new Date()
      }
    });
  }

  /**
   * Get device name from parsed user agent
   */
  private getDeviceName(result: UAParser.IResult): string {
    const parts: string[] = [];
    
    if (result.device.vendor) parts.push(result.device.vendor);
    if (result.device.model) parts.push(result.device.model);
    if (parts.length === 0 && result.os.name) parts.push(result.os.name);
    if (parts.length === 0) parts.push('Unknown Device');
    
    return parts.join(' ');
  }

  /**
   * Get all active sessions for a user
   */
  async getUserSessions(userId: string) {
    return await prisma.session.findMany({
      where: {
        userId,
        isActive: true,
        expiresAt: {
          gt: new Date()
        }
      },
      orderBy: {
        lastActivity: 'desc'
      }
    });
  }

  /**
   * Get all sessions (for admin)
   */
  async getAllSessions(filters?: {
    userId?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters?.userId) where.userId = filters.userId;
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;

    const [sessions, total] = await Promise.all([
      prisma.session.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: {
          lastActivity: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.session.count({ where })
    ]);

    return {
      sessions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Update session activity
   */
  async updateSessionActivity(token: string) {
    try {
      await prisma.session.update({
        where: { token },
        data: {
          lastActivity: new Date()
        }
      });
    } catch (error) {
      // Session might not exist or already expired
      console.error('Failed to update session activity:', error);
    }
  }

  /**
   * Revoke a session (force logout)
   */
  async revokeSession(sessionId: string, revokedBy?: string, reason?: string) {
    const session = await prisma.session.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      const error: any = new Error('Session not found');
      error.statusCode = 404;
      throw error;
    }

    return await prisma.session.update({
      where: { id: sessionId },
      data: {
        isActive: false,
        revokedAt: new Date(),
        revokedBy,
        revokedReason: reason || 'Manual revocation'
      }
    });
  }

  /**
   * Revoke all sessions for a user except current
   */
  async revokeAllUserSessions(userId: string, exceptToken?: string) {
    const where: any = {
      userId,
      isActive: true
    };

    if (exceptToken) {
      where.token = {
        not: exceptToken
      };
    }

    return await prisma.session.updateMany({
      where,
      data: {
        isActive: false,
        revokedAt: new Date(),
        revokedReason: 'Revoked all sessions'
      }
    });
  }

  /**
   * Verify session is valid
   */
  async verifySession(token: string): Promise<boolean> {
    const session = await prisma.session.findUnique({
      where: { token }
    });

    if (!session) return false;
    if (!session.isActive) return false;
    if (session.expiresAt < new Date()) {
      // Mark as inactive if expired
      await prisma.session.update({
        where: { id: session.id },
        data: { isActive: false }
      });
      return false;
    }

    return true;
  }

  /**
   * Get session by token
   */
  async getSessionByToken(token: string) {
    return await prisma.session.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions() {
    return await prisma.session.updateMany({
      where: {
        isActive: true,
        expiresAt: {
          lt: new Date()
        }
      },
      data: {
        isActive: false,
        revokedReason: 'Expired'
      }
    });
  }

  /**
   * Get session statistics for a specific user
   */
  async getUserSessionStats(userId: string) {
    const [totalActive, totalExpired, totalRevoked, recentLogins] = await Promise.all([
      prisma.session.count({
        where: {
          userId,
          isActive: true,
          expiresAt: {
            gt: new Date()
          }
        }
      }),
      prisma.session.count({
        where: {
          userId,
          isActive: false,
          expiresAt: {
            lt: new Date()
          }
        }
      }),
      prisma.session.count({
        where: {
          userId,
          isActive: false,
          revokedAt: {
            not: null
          }
        }
      }),
      prisma.session.count({
        where: {
          userId,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      })
    ]);

    return {
      totalActive,
      totalExpired,
      totalRevoked,
      recentLogins
    };
  }

  /**
   * Get session statistics
   */
  async getSessionStats() {
    const [totalActive, totalExpired, totalRevoked, recentLogins] = await Promise.all([
      prisma.session.count({
        where: {
          isActive: true,
          expiresAt: {
            gt: new Date()
          }
        }
      }),
      prisma.session.count({
        where: {
          isActive: false,
          expiresAt: {
            lt: new Date()
          }
        }
      }),
      prisma.session.count({
        where: {
          isActive: false,
          revokedAt: {
            not: null
          }
        }
      }),
      prisma.session.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      })
    ]);

    return {
      totalActive,
      totalExpired,
      totalRevoked,
      recentLogins
    };
  }

  /**
   * Get sessions by device type
   */
  async getSessionsByDevice() {
    const sessions = await prisma.session.findMany({
      where: {
        isActive: true,
        expiresAt: {
          gt: new Date()
        }
      },
      select: {
        deviceType: true
      }
    });

    const deviceCounts: Record<string, number> = {};
    sessions.forEach(session => {
      const type = session.deviceType || 'unknown';
      deviceCounts[type] = (deviceCounts[type] || 0) + 1;
    });

    return Object.entries(deviceCounts).map(([device, count]) => ({
      device,
      count
    }));
  }
}

import { PrismaClient, TenantStatus } from '@prisma/client';
import { ActivityLogsService } from './activity-logs.service';

const prisma = new PrismaClient();
const activityLogsService = new ActivityLogsService();

export class TenantsService {
  /**
   * Get all tenants with filters
   */
  async getAllTenants(filters?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        where,
        include: {
          users: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          _count: {
            select: {
              users: true,
              Campaign: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.tenant.count({ where })
    ]);

    return {
      tenants,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get tenant by ID
   */
  async getTenantById(id: string) {
    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true
          }
        },
        TenantProfile: true,
        statusHistory: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        },
        _count: {
          select: {
            users: true,
            Campaign: true,
            ActivityLog: true
          }
        }
      }
    });

    if (!tenant) {
      const error: any = new Error('Tenant not found');
      error.statusCode = 404;
      throw error;
    }

    return tenant;
  }

  /**
   * Update tenant status with reason logging
   */
  async updateTenantStatus(
    tenantId: string,
    newStatus: TenantStatus,
    reason: string,
    changedBy: string,
    metadata?: { ipAddress?: string; userAgent?: string }
  ) {
    // Get current tenant
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    });

    if (!tenant) {
      const error: any = new Error('Tenant not found');
      error.statusCode = 404;
      throw error;
    }

    const oldStatus = tenant.status;

    // Update tenant status and create history record in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update tenant status
      const updatedTenant = await tx.tenant.update({
        where: { id: tenantId },
        data: { status: newStatus }
      });

      // Create status history record
      await tx.tenantStatusHistory.create({
        data: {
          tenantId,
          oldStatus,
          newStatus,
          reason,
          changedBy,
          ipAddress: metadata?.ipAddress,
          userAgent: metadata?.userAgent
        }
      });

      return updatedTenant;
    });

    // Log activity
    await activityLogsService.createLog({
      userId: changedBy,
      tenantId,
      action: 'status_change',
      module: 'Tenants',
      description: `Changed tenant "${tenant.name}" status from ${oldStatus} to ${newStatus}. Reason: ${reason}`,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
      status: 'success',
      metadata: JSON.stringify({ oldStatus, newStatus, reason })
    });

    return result;
  }

  /**
   * Get tenant status history
   */
  async getTenantStatusHistory(tenantId: string, limit: number = 50) {
    const history = await prisma.tenantStatusHistory.findMany({
      where: { tenantId },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    return history;
  }

  /**
   * Get tenant statistics
   */
  async getTenantStats() {
    const [total, active, inactive, pending, suspended] = await Promise.all([
      prisma.tenant.count(),
      prisma.tenant.count({ where: { status: 'ACTIVE' } }),
      prisma.tenant.count({ where: { status: 'INACTIVE' } }),
      prisma.tenant.count({ where: { status: 'PENDING' } }),
      prisma.tenant.count({ where: { status: 'SUSPENDED' } })
    ]);

    return {
      total,
      active,
      inactive,
      pending,
      suspended
    };
  }

  /**
   * Bulk update tenant status
   */
  async bulkUpdateStatus(
    tenantIds: string[],
    newStatus: TenantStatus,
    reason: string,
    changedBy: string,
    metadata?: { ipAddress?: string; userAgent?: string }
  ) {
    const results = await Promise.all(
      tenantIds.map(id => 
        this.updateTenantStatus(id, newStatus, reason, changedBy, metadata)
      )
    );

    return {
      count: results.length,
      message: `Updated ${results.length} tenant(s) to ${newStatus}`
    };
  }
}

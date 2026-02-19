import { PrismaClient, TenantStatus } from '@prisma/client';
import { ActivityLogsService } from './activity-logs.service';
import { CryptoUtil } from '../utils/crypto.util';
import bcrypt from 'bcryptjs';

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
              users: true
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
        statusHistory: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        },
        _count: {
          select: {
            users: true,
            activityLogs: true
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

  /**
   * Create new tenant with login credentials and WhatsApp integration
   */
  async createTenant(data: {
    name: string;
    email: string;
    password: string;
    subscriptionPlan?: string;
    whatsappPhoneNumberId?: string;
    whatsappAccessToken?: string;
    whatsappBusinessId?: string;
    whatsappWebhookSecret?: string;
    whatsappVerifyToken?: string;
    permissions?: Array<{
      module: string;
      canView: boolean;
      canCreate: boolean;
      canEdit: boolean;
      canDelete: boolean;
    }>;
  }, createdBy?: string) {
    // Check if email already exists
    const existing = await prisma.tenant.findUnique({
      where: { email: data.email }
    });

    if (existing) {
      const error: any = new Error('Tenant with this email already exists');
      error.statusCode = 400;
      throw error;
    }

    // Generate tenant ID
    const tenantId = CryptoUtil.generateTenantId();

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Encrypt WhatsApp credentials
    const encryptedData: any = {
      tenantId,
      name: data.name,
      email: data.email,
      password: hashedPassword,
      subscriptionPlan: data.subscriptionPlan,
      status: 'PENDING' as TenantStatus
    };

    if (data.whatsappPhoneNumberId) {
      encryptedData.whatsappPhoneNumberId = CryptoUtil.encrypt(data.whatsappPhoneNumberId);
    }
    if (data.whatsappAccessToken) {
      encryptedData.whatsappAccessToken = CryptoUtil.encrypt(data.whatsappAccessToken);
    }
    if (data.whatsappBusinessId) {
      encryptedData.whatsappBusinessId = CryptoUtil.encrypt(data.whatsappBusinessId);
    }
    if (data.whatsappWebhookSecret) {
      encryptedData.whatsappWebhookSecret = CryptoUtil.encrypt(data.whatsappWebhookSecret);
    }
    if (data.whatsappVerifyToken) {
      encryptedData.whatsappVerifyToken = CryptoUtil.encrypt(data.whatsappVerifyToken);
    }

    // Create tenant with permissions in a transaction
    const tenant = await prisma.$transaction(async (tx) => {
      // Create tenant
      const newTenant = await tx.tenant.create({
        data: encryptedData
      });

      // Create permissions if provided
      if (data.permissions && data.permissions.length > 0) {
        await (tx as any).tenantPermission.createMany({
          data: data.permissions.map(perm => ({
            tenantId: newTenant.id,
            module: perm.module,
            canView: perm.canView,
            canCreate: perm.canCreate,
            canEdit: perm.canEdit,
            canDelete: perm.canDelete
          }))
        });
      }

      return newTenant;
    });

    // Log activity
    if (createdBy) {
      await activityLogsService.createLog({
        userId: createdBy,
        tenantId: tenant.id,
        action: 'create_tenant',
        module: 'Tenants',
        description: `Created new tenant: ${tenant.name} (${(tenant as any).tenantId})`,
        status: 'success'
      });
    }

    return tenant;
  }

  /**
   * Update tenant credentials
   */
  async updateTenantCredentials(
    tenantId: string,
    data: {
      password?: string;
      whatsappPhoneNumberId?: string;
      whatsappAccessToken?: string;
      whatsappBusinessId?: string;
      whatsappWebhookSecret?: string;
      whatsappVerifyToken?: string;
    },
    updatedBy?: string
  ) {
    const updateData: any = {};

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }
    if (data.whatsappPhoneNumberId) {
      updateData.whatsappPhoneNumberId = CryptoUtil.encrypt(data.whatsappPhoneNumberId);
    }
    if (data.whatsappAccessToken) {
      updateData.whatsappAccessToken = CryptoUtil.encrypt(data.whatsappAccessToken);
    }
    if (data.whatsappBusinessId) {
      updateData.whatsappBusinessId = CryptoUtil.encrypt(data.whatsappBusinessId);
    }
    if (data.whatsappWebhookSecret) {
      updateData.whatsappWebhookSecret = CryptoUtil.encrypt(data.whatsappWebhookSecret);
    }
    if (data.whatsappVerifyToken) {
      updateData.whatsappVerifyToken = CryptoUtil.encrypt(data.whatsappVerifyToken);
    }

    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: updateData
    });

    // Log activity
    if (updatedBy) {
      await activityLogsService.createLog({
        userId: updatedBy,
        tenantId: tenant.id,
        action: 'update_tenant_credentials',
        module: 'Tenants',
        description: `Updated credentials for tenant: ${tenant.name}`,
        status: 'success'
      });
    }

    return { message: 'Tenant credentials updated successfully' };
  }
}

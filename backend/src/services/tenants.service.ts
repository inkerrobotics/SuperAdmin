import { PrismaClient, TenantStatus } from '@prisma/client';
import { ActivityLogsService } from './activity-logs.service';
import { CryptoUtil } from '../utils/crypto.util';

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
    console.log('📋 [TenantsService] Getting all tenants with filters:', filters);
    
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
      console.log(`🔍 [TenantsService] Filtering by status: ${filters.status}`);
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } }
      ];
      console.log(`🔍 [TenantsService] Searching for: ${filters.search}`);
    }

    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        where,
        select: {
          id: true,
          tenantId: true,
          name: true,
          status: true,
          subscriptionPlan: true,
          organizationLogo: true,
          businessCategory: true,
          displayName: true,
          businessVerificationStatus: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          auth: {
            select: {
              email: true
            }
          },
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

    console.log(`✅ [TenantsService] Found ${tenants.length} tenants (Total: ${total}, Page: ${page}/${Math.ceil(total / limit)})`);

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
   * Get tenant by ID with all related data
   */
  async getTenantById(id: string) {
    console.log(`🔍 [TenantsService] Getting tenant by ID: ${id}`);
    
    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        auth: {
          include: {
            permissions: true
          }
        },
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
      console.log(`❌ [TenantsService] Tenant not found: ${id}`);
      const error: any = new Error('Tenant not found');
      error.statusCode = 404;
      throw error;
    }

    console.log(`✅ [TenantsService] Found tenant: ${tenant.name} (${tenant.tenantId})`);

    // Don't return encrypted credentials and password in detail view
    const { 
      whatsappPhoneNumberId, 
      whatsappAccessToken, 
      whatsappBusinessId, 
      whatsappWebhookSecret, 
      whatsappVerifyToken,
      auth,
      ...tenantData 
    } = tenant;

    return {
      ...tenantData,
      email: auth?.email,
      permissions: auth?.permissions || [],
      whatsappConfigured: !!(whatsappPhoneNumberId && whatsappAccessToken)
    };
  }

  /**
   * Create new tenant
   */
  async createTenant(data: {
    // Basic Information
    name: string;
    email: string;
    password: string;
    subscriptionPlan?: string;
    
    // Organization fields
    organizationLogo?: string;
    businessCategory?: string;
    adminFullName?: string;
    adminMobileNumber?: string;
    adminDesignation?: string;
    displayName?: string;
    brandColor?: string;
    timezone?: string;
    country?: string;
    region?: string;
    drawFrequency?: string;
    dataUsageConsent: boolean;
    dataPrivacyAcknowledged: boolean;
    primaryContactPerson?: string;
    supportContactEmail?: string;
    escalationContact?: string;
    
    // WhatsApp credentials
    whatsappPhoneNumberId?: string;
    whatsappAccessToken?: string;
    whatsappBusinessId?: string;
    whatsappWebhookSecret?: string;
    whatsappVerifyToken?: string;
    
    // Permissions
    permissions?: Array<{
      module: string;
      canView: boolean;
      canCreate: boolean;
      canEdit: boolean;
      canDelete: boolean;
    }>;
  }, createdBy?: string) {
    console.log('🆕 [TenantsService] Creating new tenant:', { name: data.name, email: data.email });
    
    // Check if email already exists in TenantAuth
    const existing = await prisma.tenantAuth.findUnique({
      where: { email: data.email }
    });

    if (existing) {
      console.log(`❌ [TenantsService] Tenant already exists with email: ${data.email}`);
      const error: any = new Error('Tenant with this email already exists');
      error.statusCode = 400;
      throw error;
    }

    // Validate compliance
    if (!data.dataUsageConsent || !data.dataPrivacyAcknowledged) {
      console.log('❌ [TenantsService] Compliance validation failed');
      const error: any = new Error('Data usage consent and privacy acknowledgment are required');
      error.statusCode = 400;
      throw error;
    }

    // Generate tenant ID
    const tenantId = CryptoUtil.generateTenantId();
    console.log(`🔑 [TenantsService] Generated tenant ID: ${tenantId}`);

    // DON'T hash password - send plain text to Lucky Draw backend
    // Lucky Draw backend will hash it with SHA-256
    const plainPassword = data.password;
    console.log('🔐 [TenantsService] Password stored as plain text (will be hashed by Lucky Draw backend with SHA-256)');

    // Prepare tenant details data
    const tenantData: any = {
      tenantId,
      name: data.name,
      subscriptionPlan: data.subscriptionPlan || 'Basic',
      status: 'PENDING' as TenantStatus,
      
      // Organization details
      organizationLogo: data.organizationLogo,
      businessCategory: data.businessCategory,
      adminFullName: data.adminFullName,
      adminMobileNumber: data.adminMobileNumber,
      adminDesignation: data.adminDesignation,
      displayName: data.displayName || data.name,
      brandColor: data.brandColor || '#6366f1',
      timezone: data.timezone || 'Asia/Kolkata',
      country: data.country || 'India',
      region: data.region,
      drawFrequency: data.drawFrequency || 'monthly',
      dataUsageConsent: data.dataUsageConsent,
      dataPrivacyAcknowledged: data.dataPrivacyAcknowledged,
      businessVerificationStatus: 'pending',
      primaryContactPerson: data.primaryContactPerson,
      supportContactEmail: data.supportContactEmail,
      escalationContact: data.escalationContact
    };

    // Encrypt WhatsApp credentials
    if (data.whatsappPhoneNumberId) {
      tenantData.whatsappPhoneNumberId = CryptoUtil.encrypt(data.whatsappPhoneNumberId);
      console.log('🔒 [TenantsService] Encrypted WhatsApp Phone Number ID');
    }
    if (data.whatsappAccessToken) {
      tenantData.whatsappAccessToken = CryptoUtil.encrypt(data.whatsappAccessToken);
      console.log('🔒 [TenantsService] Encrypted WhatsApp Access Token');
    }
    if (data.whatsappBusinessId) {
      tenantData.whatsappBusinessId = CryptoUtil.encrypt(data.whatsappBusinessId);
      console.log('🔒 [TenantsService] Encrypted WhatsApp Business ID');
    }
    if (data.whatsappWebhookSecret) {
      tenantData.whatsappWebhookSecret = CryptoUtil.encrypt(data.whatsappWebhookSecret);
      console.log('🔒 [TenantsService] Encrypted WhatsApp Webhook Secret');
    }
    if (data.whatsappVerifyToken) {
      tenantData.whatsappVerifyToken = CryptoUtil.encrypt(data.whatsappVerifyToken);
      console.log('🔒 [TenantsService] Encrypted WhatsApp Verify Token');
    }

    console.log('💾 [TenantsService] Creating tenant in database...');

    // Create tenant with auth and permissions in a transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Create Tenant (details)
      const newTenant = await tx.tenant.create({
        data: tenantData
      });
      console.log(`✅ [TenantsService] Tenant details created: ${newTenant.id}`);

      // 2. Create TenantAuth (login credentials)
      const newAuth = await tx.tenantAuth.create({
        data: {
          tenantId: tenantId,
          email: data.email,
          password: plainPassword  // Plain text password for Lucky Draw backend
        }
      });
      console.log(`✅ [TenantsService] Tenant auth created: ${newAuth.id}`);

      // 3. Create permissions if provided
      if (data.permissions && data.permissions.length > 0) {
        await tx.tenantPermission.createMany({
          data: data.permissions.map(perm => ({
            authId: newAuth.id,
            module: perm.module,
            canView: perm.canView,
            canCreate: perm.canCreate,
            canEdit: perm.canEdit,
            canDelete: perm.canDelete
          }))
        });
        console.log(`🔐 [TenantsService] Created ${data.permissions.length} permission entries`);
      }

      return { tenant: newTenant, auth: newAuth };
    });

    // Log activity
    if (createdBy) {
      await activityLogsService.createLog({
        userId: createdBy,
        tenantId: result.tenant.id,
        action: 'create_tenant',
        module: 'Tenants',
        description: `Created new tenant: ${result.tenant.name} (${tenantId})`,
        status: 'success'
      });
      console.log('📝 [TenantsService] Activity log created');
    }

    console.log(`🎉 [TenantsService] Tenant creation completed successfully: ${result.tenant.name} (${tenantId})`);

    return {
      id: result.tenant.id,
      tenantId: tenantId,
      name: result.tenant.name,
      status: result.tenant.status,
      message: 'Client created successfully'
    };
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
    console.log(`🔄 [TenantsService] Updating tenant status: ${tenantId} -> ${newStatus}`);
    console.log(`📝 [TenantsService] Reason: ${reason}`);
    
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    });

    if (!tenant) {
      console.log(`❌ [TenantsService] Tenant not found: ${tenantId}`);
      const error: any = new Error('Tenant not found');
      error.statusCode = 404;
      throw error;
    }

    const oldStatus = tenant.status;
    console.log(`📊 [TenantsService] Status change: ${oldStatus} -> ${newStatus}`);

    const result = await prisma.$transaction(async (tx: any) => {
      const updatedTenant = await tx.tenant.update({
        where: { id: tenantId },
        data: { status: newStatus }
      });

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

      console.log('📝 [TenantsService] Status history entry created');
      return updatedTenant;
    });

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

    console.log(`✅ [TenantsService] Tenant status updated successfully: ${tenant.name}`);

    return result;
  }

  /**
   * Get tenant statistics
   */
  async getTenantStats() {
    console.log('📊 [TenantsService] Getting tenant statistics...');
    
    const [total, active, inactive, pending, suspended] = await Promise.all([
      prisma.tenant.count(),
      prisma.tenant.count({ where: { status: 'ACTIVE' } }),
      prisma.tenant.count({ where: { status: 'INACTIVE' } }),
      prisma.tenant.count({ where: { status: 'PENDING' } }),
      prisma.tenant.count({ where: { status: 'SUSPENDED' } })
    ]);

    console.log(`✅ [TenantsService] Stats: Total=${total}, Active=${active}, Inactive=${inactive}, Pending=${pending}, Suspended=${suspended}`);

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
    console.log(`🔄 [TenantsService] Bulk updating ${tenantIds.length} tenants to status: ${newStatus}`);
    
    const results = await Promise.all(
      tenantIds.map(id => 
        this.updateTenantStatus(id, newStatus, reason, changedBy, metadata)
      )
    );

    console.log(`✅ [TenantsService] Bulk update completed: ${results.length} tenants updated`);

    return {
      count: results.length,
      message: `Updated ${results.length} tenant(s) to ${newStatus}`
    };
  }

  /**
   * Get tenant status history
   */
  async getTenantStatusHistory(tenantId: string, limit: number = 50) {
    console.log(`📜 [TenantsService] Getting status history for tenant: ${tenantId} (limit: ${limit})`);
    
    const history = await prisma.tenantStatusHistory.findMany({
      where: { tenantId },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    console.log(`✅ [TenantsService] Found ${history.length} status history entries`);

    return history;
  }

  /**
   * Update tenant credentials
   */
  async updateTenantCredentials(
    tenantId: string,
    data: {
      password?: string;
      email?: string;
    },
    updatedBy?: string
  ) {
    console.log(`🔐 [TenantsService] Updating credentials for tenant: ${tenantId}`);
    
    // Find the tenant auth by tenantId
    const auth = await prisma.tenantAuth.findUnique({
      where: { tenantId }
    });

    if (!auth) {
      console.log(`❌ [TenantsService] Tenant auth not found: ${tenantId}`);
      const error: any = new Error('Tenant not found');
      error.statusCode = 404;
      throw error;
    }

    const updateData: any = {};

    if (data.password) {
      // DON'T hash password - send plain text to Lucky Draw backend
      // Lucky Draw backend will hash it with SHA-256
      updateData.password = data.password;
      console.log('🔑 [TenantsService] Password updated (plain text for Lucky Draw backend)');
    }

    if (data.email) {
      updateData.email = data.email;
      console.log('� [TenantsService] Email updated');
    }

    await prisma.tenantAuth.update({
      where: { id: auth.id },
      data: updateData
    });

    if (updatedBy) {
      // Find tenant by tenantId for activity log
      const tenant = await prisma.tenant.findUnique({
        where: { tenantId }
      });

      if (tenant) {
        await activityLogsService.createLog({
          userId: updatedBy,
          tenantId: tenant.id,
          action: 'update_tenant_credentials',
          module: 'Tenants',
          description: `Updated credentials for tenant`,
          status: 'success'
        });
        console.log('📝 [TenantsService] Activity log created');
      }
    }

    console.log(`✅ [TenantsService] Tenant credentials updated successfully`);

    return { message: 'Tenant credentials updated successfully' };
  }

  /**
   * Update WhatsApp credentials
   */
  async updateWhatsAppCredentials(
    tenantId: string,
    credentials: {
      phoneNumberId?: string;
      accessToken?: string;
      businessId?: string;
      webhookSecret?: string;
      verifyToken?: string;
    },
    updatedBy?: string
  ) {
    console.log(`💬 [TenantsService] Updating WhatsApp credentials for tenant: ${tenantId}`);
    
    const updateData: any = {};

    if (credentials.phoneNumberId) {
      updateData.whatsappPhoneNumberId = CryptoUtil.encrypt(credentials.phoneNumberId);
      console.log('🔒 [TenantsService] Encrypted WhatsApp Phone Number ID');
    }
    if (credentials.accessToken) {
      updateData.whatsappAccessToken = CryptoUtil.encrypt(credentials.accessToken);
      console.log('🔒 [TenantsService] Encrypted WhatsApp Access Token');
    }
    if (credentials.businessId) {
      updateData.whatsappBusinessId = CryptoUtil.encrypt(credentials.businessId);
      console.log('🔒 [TenantsService] Encrypted WhatsApp Business ID');
    }
    if (credentials.webhookSecret) {
      updateData.whatsappWebhookSecret = CryptoUtil.encrypt(credentials.webhookSecret);
      console.log('🔒 [TenantsService] Encrypted WhatsApp Webhook Secret');
    }
    if (credentials.verifyToken) {
      updateData.whatsappVerifyToken = CryptoUtil.encrypt(credentials.verifyToken);
      console.log('🔒 [TenantsService] Encrypted WhatsApp Verify Token');
    }

    await prisma.tenant.update({
      where: { id: tenantId },
      data: updateData
    });

    if (updatedBy) {
      await activityLogsService.createLog({
        userId: updatedBy,
        tenantId,
        action: 'update_whatsapp_credentials',
        module: 'Tenants',
        description: `Updated WhatsApp integration credentials`,
        status: 'success'
      });
      console.log('📝 [TenantsService] Activity log created');
    }

    console.log(`✅ [TenantsService] WhatsApp credentials updated successfully`);

    return { message: 'WhatsApp credentials updated successfully' };
  }
}

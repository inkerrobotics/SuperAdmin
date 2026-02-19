import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { CryptoUtil } from '../utils/crypto.util';
import { ActivityLogsService } from './activity-logs.service';

const prisma = new PrismaClient();
const activityLogsService = new ActivityLogsService();

export class TenantAuthService {
  /**
   * Tenant login
   */
  async tenantLogin(credentials: {
    email: string;
    password: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const { email, password, ipAddress, userAgent } = credentials;

    // Find tenant by email
    const tenant = await prisma.tenant.findUnique({
      where: { email }
    });

    if (!tenant) {
      // Log failed login attempt
      await activityLogsService.createLog({
        action: 'tenant_login',
        module: 'TenantAuth',
        description: `Failed tenant login attempt for email: ${email} - Tenant not found`,
        ipAddress,
        userAgent,
        status: 'failed'
      });

      const error: any = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    // Check if tenant is active
    if (tenant.status !== 'ACTIVE') {
      await activityLogsService.createLog({
        tenantId: tenant.id,
        action: 'tenant_login',
        module: 'TenantAuth',
        description: `Failed tenant login attempt - Tenant status: ${tenant.status}`,
        ipAddress,
        userAgent,
        status: 'failed'
      });

      const error: any = new Error(`Tenant account is ${tenant.status.toLowerCase()}`);
      error.statusCode = 403;
      throw error;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, tenant.password);

    if (!isPasswordValid) {
      await activityLogsService.createLog({
        tenantId: tenant.id,
        action: 'tenant_login',
        module: 'TenantAuth',
        description: `Failed tenant login attempt - Invalid password`,
        ipAddress,
        userAgent,
        status: 'failed'
      });

      const error: any = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    // Update last login
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: { lastLoginAt: new Date() }
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        tenantId: tenant.id,
        tenantIdentifier: tenant.tenantId,
        email: tenant.email,
        type: 'tenant'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' } as jwt.SignOptions
    );

    // Log successful login
    await activityLogsService.createLog({
      tenantId: tenant.id,
      action: 'tenant_login',
      module: 'TenantAuth',
      description: `Successful tenant login: ${tenant.name}`,
      ipAddress,
      userAgent,
      status: 'success'
    });

    return {
      token,
      tenant: {
        id: tenant.id,
        tenantId: tenant.tenantId,
        name: tenant.name,
        email: tenant.email,
        status: tenant.status,
        subscriptionPlan: tenant.subscriptionPlan
      }
    };
  }

  /**
   * Get tenant profile with decrypted WhatsApp credentials
   */
  async getTenantProfile(tenantId: string) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        tenantId: true,
        name: true,
        email: true,
        status: true,
        subscriptionPlan: true,
        whatsappPhoneNumberId: true,
        whatsappAccessToken: true,
        whatsappBusinessId: true,
        whatsappWebhookSecret: true,
        whatsappVerifyToken: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true
      }
    });

    if (!tenant) {
      const error: any = new Error('Tenant not found');
      error.statusCode = 404;
      throw error;
    }

    // Decrypt WhatsApp credentials
    return {
      ...tenant,
      whatsappPhoneNumberId: tenant.whatsappPhoneNumberId 
        ? CryptoUtil.decrypt(tenant.whatsappPhoneNumberId) 
        : null,
      whatsappAccessToken: tenant.whatsappAccessToken 
        ? CryptoUtil.decrypt(tenant.whatsappAccessToken) 
        : null,
      whatsappBusinessId: tenant.whatsappBusinessId 
        ? CryptoUtil.decrypt(tenant.whatsappBusinessId) 
        : null,
      whatsappWebhookSecret: tenant.whatsappWebhookSecret 
        ? CryptoUtil.decrypt(tenant.whatsappWebhookSecret) 
        : null,
      whatsappVerifyToken: tenant.whatsappVerifyToken 
        ? CryptoUtil.decrypt(tenant.whatsappVerifyToken) 
        : null
    };
  }

  /**
   * Update WhatsApp credentials (encrypted)
   */
  async updateWhatsAppCredentials(
    tenantId: string,
    credentials: {
      phoneNumberId?: string;
      accessToken?: string;
      businessId?: string;
      webhookSecret?: string;
      verifyToken?: string;
    }
  ) {
    const updateData: any = {};

    if (credentials.phoneNumberId) {
      updateData.whatsappPhoneNumberId = CryptoUtil.encrypt(credentials.phoneNumberId);
    }
    if (credentials.accessToken) {
      updateData.whatsappAccessToken = CryptoUtil.encrypt(credentials.accessToken);
    }
    if (credentials.businessId) {
      updateData.whatsappBusinessId = CryptoUtil.encrypt(credentials.businessId);
    }
    if (credentials.webhookSecret) {
      updateData.whatsappWebhookSecret = CryptoUtil.encrypt(credentials.webhookSecret);
    }
    if (credentials.verifyToken) {
      updateData.whatsappVerifyToken = CryptoUtil.encrypt(credentials.verifyToken);
    }

    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: updateData
    });

    await activityLogsService.createLog({
      tenantId: tenant.id,
      action: 'update_whatsapp_credentials',
      module: 'TenantAuth',
      description: `Updated WhatsApp integration credentials`,
      status: 'success'
    });

    return { message: 'WhatsApp credentials updated successfully' };
  }
}

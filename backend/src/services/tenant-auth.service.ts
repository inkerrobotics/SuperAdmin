import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
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

    // Find tenant auth by email
    const tenantAuth = await prisma.tenantAuth.findUnique({
      where: { email },
      include: {
        tenant: true
      }
    });

    if (!tenantAuth || !tenantAuth.tenant) {
      await activityLogsService.createLog({
        action: 'tenant_login',
        module: 'TenantAuth',
        description: `Failed tenant login attempt for email: ${email} - Not found`,
        ipAddress,
        userAgent,
        status: 'failed'
      });

      const error: any = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    const tenant = tenantAuth.tenant;

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

    // Verify password with bcrypt
    let isPasswordValid: boolean;
    try {
      isPasswordValid = await bcrypt.compare(password, tenantAuth.password);
    } catch (compareError: any) {
      console.error('❌ [TenantAuthService] Password comparison error:', compareError.message);
      const error: any = new Error('Authentication failed');
      error.statusCode = 500;
      throw error;
    }

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
      data: {
        lastLoginAt: new Date()
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        tenantId: tenant.id,
        tenantIdentifier: tenant.tenantId,
        email: tenantAuth.email,
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
        email: tenantAuth.email,
        status: tenant.status,
        subscriptionPlan: tenant.subscriptionPlan,
        displayName: tenant.displayName,
        logo: tenant.organizationLogo
      }
    };
  }

  /**
   * Get tenant profile with decrypted WhatsApp credentials
   */
  async getTenantProfile(tenantId: string) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        auth: {
          include: {
            permissions: true
          }
        }
      }
    });

    if (!tenant) {
      const error: any = new Error('Tenant not found');
      error.statusCode = 404;
      throw error;
    }

    // Decrypt WhatsApp credentials
    const decryptedTenant = {
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

    return decryptedTenant;
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

    await prisma.tenant.update({
      where: { id: tenantId },
      data: updateData
    });

    await activityLogsService.createLog({
      tenantId,
      action: 'update_whatsapp_credentials',
      module: 'TenantAuth',
      description: `Updated WhatsApp integration credentials`,
      status: 'success'
    });

    return { message: 'WhatsApp credentials updated successfully' };
  }

  /**
   * Change tenant password
   */
  async changePassword(
    tenantId: string,
    oldPassword: string,
    newPassword: string
  ) {
    // Find tenant auth by tenantId
    const tenantAuth = await prisma.tenantAuth.findFirst({
      where: { tenantId: tenantId },
      include: { tenant: true }
    });

    if (!tenantAuth || !tenantAuth.tenant) {
      const error: any = new Error('Tenant not found');
      error.statusCode = 404;
      throw error;
    }

    // Verify old password with bcrypt
    let isPasswordValid: boolean;
    try {
      isPasswordValid = await bcrypt.compare(oldPassword, tenantAuth.password);
    } catch (compareError: any) {
      console.error('❌ [TenantAuthService] Password comparison error:', compareError.message);
      const error: any = new Error('Password verification failed');
      error.statusCode = 500;
      throw error;
    }

    if (!isPasswordValid) {
      const error: any = new Error('Current password is incorrect');
      error.statusCode = 401;
      throw error;
    }

    // Hash new password with bcrypt
    let hashedPassword: string;
    try {
      hashedPassword = await bcrypt.hash(newPassword, 10);
    } catch (hashError: any) {
      console.error('❌ [TenantAuthService] Password hashing error:', hashError.message);
      const error: any = new Error('Failed to hash new password');
      error.statusCode = 500;
      throw error;
    }

    // Update password in TenantAuth table
    await prisma.tenantAuth.update({
      where: { id: tenantAuth.id },
      data: {
        password: hashedPassword
      }
    });

    await activityLogsService.createLog({
      tenantId: tenantAuth.tenant.id,
      action: 'change_password',
      module: 'TenantAuth',
      description: `Tenant changed password`,
      status: 'success'
    });

    return { message: 'Password changed successfully' };
  }
}

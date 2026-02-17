import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const SETTING_CATEGORIES = {
  SECURITY: 'security',
  SESSION: 'session',
  FEATURES: 'features'
};

export class SettingsService {
  // Get all settings grouped by category
  async getAllSettings() {
    const settings = await prisma.systemSetting.findMany({
      orderBy: [{ category: 'asc' }, { key: 'asc' }]
    });

    // Group by category
    const grouped: Record<string, any[]> = {};
    settings.forEach(setting => {
      if (!grouped[setting.category]) {
        grouped[setting.category] = [];
      }
      grouped[setting.category].push({
        key: setting.key,
        value: this.parseValue(setting.value, setting.dataType),
        dataType: setting.dataType,
        description: setting.description,
        updatedAt: setting.updatedAt
      });
    });

    return grouped;
  }

  // Get settings by category
  async getSettingsByCategory(category: string) {
    const settings = await prisma.systemSetting.findMany({
      where: { category },
      orderBy: { key: 'asc' }
    });

    return settings.map(setting => ({
      key: setting.key,
      value: this.parseValue(setting.value, setting.dataType),
      dataType: setting.dataType,
      description: setting.description,
      updatedAt: setting.updatedAt
    }));
  }

  // Update settings by category
  async updateSettings(category: string, settings: Record<string, any>, userId: string) {
    const results = [];

    for (const [key, value] of Object.entries(settings)) {
      // Get existing setting
      const existing = await prisma.systemSetting.findUnique({
        where: { category_key: { category, key } }
      });

      const stringValue = this.stringifyValue(value);

      if (existing) {
        // Save to history
        await prisma.settingHistory.create({
          data: {
            settingId: existing.id,
            oldValue: existing.value,
            newValue: stringValue,
            changedBy: userId
          }
        });

        // Update setting
        const updated = await prisma.systemSetting.update({
          where: { id: existing.id },
          data: {
            value: stringValue,
            updatedBy: userId
          }
        });

        results.push(updated);
      } else {
        // Create new setting
        const dataType = this.getDataType(value);
        const created = await prisma.systemSetting.create({
          data: {
            category,
            key,
            value: stringValue,
            dataType,
            updatedBy: userId
          }
        });

        results.push(created);
      }
    }

    return results;
  }

  // Get setting history with filters
  async getHistory(filters?: {
    category?: string;
    startDate?: Date;
    endDate?: Date;
    changedBy?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters?.category) {
      where.setting = { category: filters.category };
    }

    if (filters?.startDate || filters?.endDate) {
      where.changedAt = {};
      if (filters.startDate) where.changedAt.gte = filters.startDate;
      if (filters.endDate) where.changedAt.lte = filters.endDate;
    }

    if (filters?.changedBy) {
      where.changedBy = filters.changedBy;
    }

    const [history, total] = await Promise.all([
      prisma.settingHistory.findMany({
        where,
        include: {
          setting: true,
          changedByUser: {
            select: { email: true, role: true }
          }
        },
        orderBy: { changedAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.settingHistory.count({ where })
    ]);

    return {
      data: history,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // Restore previous setting
  async restoreSetting(historyId: string, userId: string) {
    const history = await prisma.settingHistory.findUnique({
      where: { id: historyId },
      include: { setting: true }
    });

    if (!history) {
      const error: any = new Error('History record not found');
      error.statusCode = 404;
      throw error;
    }

    // Save current value to history
    await prisma.settingHistory.create({
      data: {
        settingId: history.settingId,
        oldValue: history.setting.value,
        newValue: history.oldValue,
        changedBy: userId,
        reason: `Restored from history ${historyId}`
      }
    });

    // Update setting with old value
    const updated = await prisma.systemSetting.update({
      where: { id: history.settingId },
      data: {
        value: history.oldValue,
        updatedBy: userId
      }
    });

    return updated;
  }

  // Initialize default settings
  async initializeDefaults(userId: string) {
    const defaults = [
      // Security settings
      { category: 'security', key: 'minPasswordLength', value: '8', dataType: 'number', description: 'Minimum password length' },
      { category: 'security', key: 'requireUppercase', value: 'true', dataType: 'boolean', description: 'Require uppercase letters' },
      { category: 'security', key: 'requireLowercase', value: 'true', dataType: 'boolean', description: 'Require lowercase letters' },
      { category: 'security', key: 'requireNumbers', value: 'true', dataType: 'boolean', description: 'Require numbers' },
      { category: 'security', key: 'requireSpecialChars', value: 'false', dataType: 'boolean', description: 'Require special characters' },
      { category: 'security', key: 'passwordExpiration', value: '0', dataType: 'number', description: 'Password expiration in days (0 = never)' },
      { category: 'security', key: 'passwordHistory', value: '0', dataType: 'number', description: 'Prevent reuse of last N passwords' },
      
      // Session settings
      { category: 'session', key: 'sessionTimeout', value: '60', dataType: 'number', description: 'Session timeout in minutes' },
      { category: 'session', key: 'idleTimeout', value: '30', dataType: 'number', description: 'Idle timeout in minutes' },
      { category: 'session', key: 'rememberMeDuration', value: '30', dataType: 'number', description: 'Remember me duration in days' },
      { category: 'session', key: 'allowConcurrentSessions', value: 'true', dataType: 'boolean', description: 'Allow concurrent sessions' },
      { category: 'session', key: 'maxConcurrentSessions', value: '3', dataType: 'number', description: 'Maximum concurrent sessions' },
      
      // Feature toggles
      { category: 'features', key: 'userRegistration', value: 'true', dataType: 'boolean', description: 'Enable user registration' },
      { category: 'features', key: 'multiFactorAuth', value: 'false', dataType: 'boolean', description: 'Enable multi-factor authentication' },
      { category: 'features', key: 'apiAccess', value: 'true', dataType: 'boolean', description: 'Enable API access' },
      { category: 'features', key: 'fileUploads', value: 'true', dataType: 'boolean', description: 'Enable file uploads' },
      { category: 'features', key: 'emailNotifications', value: 'true', dataType: 'boolean', description: 'Enable email notifications' },
      { category: 'features', key: 'auditLogging', value: 'true', dataType: 'boolean', description: 'Enable audit logging' }
    ];

    const created = [];
    for (const setting of defaults) {
      try {
        const existing = await prisma.systemSetting.findUnique({
          where: { category_key: { category: setting.category, key: setting.key } }
        });

        if (!existing) {
          const newSetting = await prisma.systemSetting.create({
            data: { ...setting, updatedBy: userId }
          });
          created.push(newSetting);
        }
      } catch (error) {
        // Skip if already exists (race condition)
        console.log(`Setting ${setting.category}.${setting.key} already exists, skipping`);
      }
    }

    return created;
  }

  // Helper methods
  private parseValue(value: string, dataType: string): any {
    switch (dataType) {
      case 'boolean':
        return value === 'true';
      case 'number':
        return parseInt(value, 10);
      case 'json':
        return JSON.parse(value);
      default:
        return value;
    }
  }

  private stringifyValue(value: any): string {
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  }

  private getDataType(value: any): string {
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'object') return 'json';
    return 'string';
  }
}

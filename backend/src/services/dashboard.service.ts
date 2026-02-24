import { PrismaClient, TenantStatus, Role } from '@prisma/client';

const prisma = new PrismaClient();

export class DashboardService {
  async getPlatformStats() {
    const [
      totalTenants,
      activeTenants,
      inactiveTenants,
      pendingTenants,
      suspendedTenants,
      totalAdminUsers,
      totalUsers,
      totalRegularUsers
    ] = await Promise.all([
      prisma.tenant.count(),
      prisma.tenant.count({ where: { status: TenantStatus.ACTIVE } }),
      prisma.tenant.count({ where: { status: TenantStatus.INACTIVE } }),
      prisma.tenant.count({ where: { status: TenantStatus.PENDING } }),
      prisma.tenant.count({ where: { status: TenantStatus.SUSPENDED } }),
      prisma.user.count({ where: { role: Role.ADMIN } }),
      prisma.user.count(),
      prisma.user.count({ where: { role: Role.USER } })
    ]);

    return {
      totalTenants,
      activeTenants,
      inactiveTenants,
      pendingTenants,
      suspendedTenants,
      totalAdminUsers,
      totalUsers,
      totalRegularUsers
    };
  }

  async getTenantGrowthStats() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Get tenants created in last 30 days grouped by day
    const recentTenants = await prisma.tenant.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      select: {
        createdAt: true,
        status: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Group by date
    const growthData: { [key: string]: number } = {};
    for (let i = 0; i < 30; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateKey = date.toISOString().split('T')[0];
      growthData[dateKey] = 0;
    }

    recentTenants.forEach(tenant => {
      const dateKey = tenant.createdAt.toISOString().split('T')[0];
      if (growthData[dateKey] !== undefined) {
        growthData[dateKey]++;
      }
    });

    return Object.entries(growthData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({
        date,
        count
      }));
  }

  async getUserDistribution() {
    const tenants = await prisma.tenant.findMany({
      include: {
        users: true
      }
    });

    return tenants.map(tenant => ({
      name: tenant.name,
      users: tenant.users.length,
      status: tenant.status
    }));
  }

  async getStatusDistribution() {
    const [active, inactive, pending, suspended] = await Promise.all([
      prisma.tenant.count({ where: { status: TenantStatus.ACTIVE } }),
      prisma.tenant.count({ where: { status: TenantStatus.INACTIVE } }),
      prisma.tenant.count({ where: { status: TenantStatus.PENDING } }),
      prisma.tenant.count({ where: { status: TenantStatus.SUSPENDED } })
    ]);

    return [
      { name: 'Active', value: active, color: '#10b981' },
      { name: 'Inactive', value: inactive, color: '#6b7280' },
      { name: 'Pending', value: pending, color: '#f59e0b' },
      { name: 'Suspended', value: suspended, color: '#ef4444' }
    ];
  }

  async getRecentTenants(limit: number = 10) {
    return await prisma.tenant.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      }
    });
  }

  async getTenantById(id: string) {
    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true
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
}

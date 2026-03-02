const API_URL = '/api/dashboard';

export interface DashboardStats {
  totalTenants: number;
  activeTenants: number;
  inactiveTenants: number;
  pendingTenants: number;
  suspendedTenants: number;
  totalAdminUsers: number;
  totalUsers: number;
  totalRegularUsers: number;
}

export interface Tenant {
  id: string;
  name: string;
  email: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';
  subscriptionPlan: string | null;
  createdAt: string;
  updatedAt: string;
  users: Array<{
    id: string;
    email: string;
    role: string;
  }>;
}

export interface GrowthData {
  date: string;
  count: number;
}

export interface UserDistribution {
  name: string;
  users: number;
  status: string;
}

export interface StatusDistribution {
  name: string;
  value: number;
  color: string;
}

class DashboardService {
  async getStats(): Promise<DashboardStats> {
    const response = await fetch(`${API_URL}/stats`, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats');
    }

    return response.json();
  }

  async getTenantGrowth(): Promise<GrowthData[]> {
    const response = await fetch(`${API_URL}/growth`, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch growth data');
    }

    return response.json();
  }

  async getUserDistribution(): Promise<UserDistribution[]> {
    const response = await fetch(`${API_URL}/user-distribution`, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user distribution');
    }

    return response.json();
  }

  async getStatusDistribution(): Promise<StatusDistribution[]> {
    const response = await fetch(`${API_URL}/status-distribution`, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch status distribution');
    }

    return response.json();
  }

  async getRecentTenants(limit: number = 10): Promise<Tenant[]> {
    const response = await fetch(`${API_URL}/recent-tenants?limit=${limit}`, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch recent tenants');
    }

    return response.json();
  }

  async getTenantDetails(id: string): Promise<Tenant> {
    const response = await fetch(`${API_URL}/tenant/${id}`, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch tenant details');
    }

    return response.json();
  }
}

export const dashboardService = new DashboardService();

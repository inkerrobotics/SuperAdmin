const API_URL = 'http://localhost:5001/api/tenants';

export interface Tenant {
  id: string;
  name: string;
  email: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';
  subscriptionPlan?: string;
  createdAt: string;
  updatedAt: string;
  users: any[];
  _count?: {
    users: number;
    Campaign: number;
  };
}

export interface TenantStatusHistory {
  id: string;
  tenantId: string;
  oldStatus: string;
  newStatus: string;
  reason: string;
  changedBy: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface TenantStats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  suspended: number;
}

class TenantsService {
  async getAllTenants(filters?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));

    const response = await fetch(`${API_URL}?${params}`, {
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch tenants');
    }

    return response.json();
  }

  async getTenantById(id: string) {
    const response = await fetch(`${API_URL}/${id}`, {
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch tenant');
    }

    return response.json();
  }

  async updateTenantStatus(id: string, status: string, reason: string) {
    const response = await fetch(`${API_URL}/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ status, reason })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update tenant status');
    }

    return response.json();
  }

  async getTenantStatusHistory(id: string, limit?: number) {
    const params = new URLSearchParams();
    if (limit) params.append('limit', String(limit));

    const response = await fetch(`${API_URL}/${id}/history?${params}`, {
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch status history');
    }

    return response.json();
  }

  async getTenantStats(): Promise<TenantStats> {
    const response = await fetch(`${API_URL}/stats`, {
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch stats');
    }

    return response.json();
  }

  async bulkUpdateStatus(tenantIds: string[], status: string, reason: string) {
    const response = await fetch(`${API_URL}/bulk/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ tenantIds, status, reason })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to bulk update status');
    }

    return response.json();
  }
}

export const tenantsService = new TenantsService();

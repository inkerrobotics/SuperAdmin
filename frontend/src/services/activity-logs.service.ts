const API_URL = '/api/activity-logs';

export interface ActivityLog {
  id: string;
  userId?: string;
  user?: {
    id: string;
    name?: string;
    email: string;
    role: string;
  };
  tenantId?: string;
  tenant?: {
    id: string;
    name: string;
  };
  action: string;
  module: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  status: string;
  metadata?: string;
  createdAt: string;
}

class ActivityLogsService {
  async getAllLogs(filters?: {
    userId?: string;
    module?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const params = new URLSearchParams();
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.module) params.append('module', filters.module);
    if (filters?.action) params.append('action', filters.action);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await fetch(`${API_URL}?${params}`, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch activity logs');
    }

    return response.json();
  }

  async getStats() {
    const response = await fetch(`${API_URL}/stats`, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch stats');
    }

    return response.json();
  }

  async exportLogs(filters?: {
    userId?: string;
    module?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.module) params.append('module', filters.module);
    if (filters?.action) params.append('action', filters.action);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const response = await fetch(`${API_URL}/export?${params}`, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to export logs');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-logs-${new Date().toISOString()}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}

export const activityLogsService = new ActivityLogsService();

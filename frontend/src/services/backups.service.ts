const API_URL = '/api/backups';

export interface Backup {
  id: string;
  name: string;
  type: string;
  size?: string;
  status: string;
  filePath?: string;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  createdAt: string;
  createdByUser?: {
    name?: string;
    email: string;
  };
}

class BackupsService {
  async getAllBackups(filters?: {
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
  }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await fetch(`${API_URL}?${params}`, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch backups');
    }

    return response.json();
  }

  async createManualBackup(name?: string) {
    const response = await fetch(`${API_URL}/manual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create backup');
    }

    return response.json();
  }

  async scheduleBackup(data: {
    name: string;
    scheduledAt: string;
  }) {
    const response = await fetch(`${API_URL}/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to schedule backup');
    }

    return response.json();
  }

  async deleteBackup(id: string) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to delete backup');
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
}

export const backupsService = new BackupsService();

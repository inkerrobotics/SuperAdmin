const API_URL = 'http://localhost:5001/api/settings';

export interface Setting {
  key: string;
  value: any;
  dataType: string;
  description?: string;
  updatedAt: string;
}

export interface SettingHistory {
  id: string;
  settingId: string;
  oldValue: string;
  newValue: string;
  changedBy: string;
  changedByUser: {
    email: string;
    role: string;
  };
  changedAt: string;
  reason?: string;
  setting: {
    category: string;
    key: string;
  };
}

export interface HistoryResponse {
  data: SettingHistory[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class SettingsService {
  async getAllSettings(): Promise<Record<string, Setting[]>> {
    const response = await fetch(API_URL, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch settings');
    }

    return response.json();
  }

  async getSettingsByCategory(category: string): Promise<Setting[]> {
    const response = await fetch(`${API_URL}/${category}`, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch settings');
    }

    return response.json();
  }

  async updateSettings(category: string, settings: Record<string, any>): Promise<any> {
    const response = await fetch(`${API_URL}/${category}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(settings)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update settings');
    }

    return response.json();
  }

  async getHistory(filters?: {
    category?: string;
    startDate?: string;
    endDate?: string;
    changedBy?: string;
    page?: number;
    limit?: number;
  }): Promise<HistoryResponse> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.changedBy) params.append('changedBy', filters.changedBy);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await fetch(`${API_URL}/history?${params}`, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch history');
    }

    return response.json();
  }

  async restoreSetting(historyId: string): Promise<any> {
    const response = await fetch(`${API_URL}/restore/${historyId}`, {
      method: 'POST',
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to restore setting');
    }

    return response.json();
  }

  async initializeDefaults(): Promise<any> {
    const response = await fetch(`${API_URL}/initialize`, {
      method: 'POST',
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to initialize defaults');
    }

    return response.json();
  }
}

export const settingsService = new SettingsService();

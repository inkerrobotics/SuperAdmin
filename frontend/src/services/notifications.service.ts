const API_URL = 'http://localhost:5001/api/notifications';

export interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  message: string;
  type: string;
  variables: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdByUser?: {
    name?: string;
    email: string;
  };
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  targetType: string;
  targetId?: string;
  isRead: boolean;
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
  createdByUser?: {
    name?: string;
    email: string;
  };
}

class NotificationsService {
  // Templates
  async getAllTemplates() {
    const response = await fetch(`${API_URL}/templates`, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch templates');
    }

    return response.json();
  }

  async createTemplate(data: {
    name: string;
    title: string;
    message: string;
    type: string;
    variables: string;
  }) {
    const response = await fetch(`${API_URL}/templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create template');
    }

    return response.json();
  }

  async updateTemplate(id: string, data: Partial<NotificationTemplate>) {
    const response = await fetch(`${API_URL}/templates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to update template');
    }

    return response.json();
  }

  async deleteTemplate(id: string) {
    const response = await fetch(`${API_URL}/templates/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to delete template');
    }

    return response.json();
  }

  // Notifications
  async getAllNotifications(filters?: {
    type?: string;
    isRead?: boolean;
    page?: number;
    limit?: number;
  }) {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.isRead !== undefined) params.append('isRead', filters.isRead.toString());
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await fetch(`${API_URL}?${params}`, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }

    return response.json();
  }

  async createNotification(data: {
    title: string;
    message: string;
    type: string;
    targetType: string;
    targetId?: string;
  }) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to create notification');
    }

    return response.json();
  }

  async scheduleNotification(data: {
    title: string;
    message: string;
    type: string;
    targetType: string;
    targetId?: string;
    scheduledAt: string;
  }) {
    const response = await fetch(`${API_URL}/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to schedule notification');
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

export const notificationsService = new NotificationsService();

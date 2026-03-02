const API_URL = '/api/sessions';

export interface Session {
  id: string;
  userId: string;
  deviceName?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  ipAddress?: string;
  location?: string;
  isActive: boolean;
  lastActivity: string;
  expiresAt: string;
  createdAt: string;
  revokedAt?: string;
  revokedBy?: string;
  revokedReason?: string;
  user?: {
    id: string;
    name?: string;
    email: string;
    role: string;
  };
}

export interface SessionStats {
  totalActive: number;
  totalExpired: number;
  totalRevoked: number;
  recentLogins: number;
}

export interface DeviceStats {
  device: string;
  count: number;
}

class SessionService {
  async getMySession(): Promise<Session[]> {
    const response = await fetch(`${API_URL}/my-sessions`, {
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch sessions');
    }

    return response.json();
  }

  async getAllSessions(filters?: {
    userId?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ sessions: Session[]; pagination: any }> {
    const params = new URLSearchParams();
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));

    const response = await fetch(`${API_URL}?${params}`, {
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch sessions');
    }

    return response.json();
  }

  async revokeSession(sessionId: string, reason?: string): Promise<void> {
    const response = await fetch(`${API_URL}/${sessionId}/revoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ reason })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to revoke session');
    }
  }

  async revokeAllSessions(): Promise<{ count: number }> {
    const response = await fetch(`${API_URL}/revoke-all`, {
      method: 'POST',
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to revoke sessions');
    }

    return response.json();
  }

  async getStats(): Promise<SessionStats> {
    const response = await fetch(`${API_URL}/my-stats`, {
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch stats');
    }

    return response.json();
  }

  async getDeviceStats(): Promise<DeviceStats[]> {
    const response = await fetch(`${API_URL}/devices`, {
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch device stats');
    }

    return response.json();
  }

  async cleanupExpiredSessions(): Promise<{ count: number }> {
    const response = await fetch(`${API_URL}/cleanup`, {
      method: 'POST',
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to cleanup sessions');
    }

    return response.json();
  }
}

export const sessionService = new SessionService();

const API_URL = 'http://localhost:5001/api/data-cleaning';

class DataCleaningService {
  async getStats() {
    const response = await fetch(`${API_URL}/stats`, {
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch stats');
    }

    return response.json();
  }

  async cleanupExpiredSessions() {
    const response = await fetch(`${API_URL}/expired-sessions`, {
      method: 'POST',
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to cleanup expired sessions');
    }

    return response.json();
  }

  async cleanupOldLogs(days: number) {
    const response = await fetch(`${API_URL}/old-logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ days })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to cleanup old logs');
    }

    return response.json();
  }

  async cleanupOldBackups(days: number) {
    const response = await fetch(`${API_URL}/old-backups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ days })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to cleanup old backups');
    }

    return response.json();
  }

  async cleanupOrphanedData() {
    const response = await fetch(`${API_URL}/orphaned-data`, {
      method: 'POST',
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to cleanup orphaned data');
    }

    return response.json();
  }
}

export const dataCleaningService = new DataCleaningService();

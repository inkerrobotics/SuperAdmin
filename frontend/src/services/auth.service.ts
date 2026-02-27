const API_URL = 'http://localhost:5001/api/auth';

class AuthService {
  async login(email: string, password: string) {
    const response = await fetch(`${API_URL}/super-admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    return data;
  }

  async logout() {
    await fetch(`${API_URL}/logout`, {
      method: 'POST',
      credentials: 'include'
    });
  }
}

export const authService = new AuthService();

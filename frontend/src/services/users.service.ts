const API_URL = 'http://localhost:5001/api/users';

export interface User {
  id: string;
  name?: string;
  email: string;
  role: string;
  customRoleId?: string;
  customRole?: {
    id: string;
    name: string;
    isActive: boolean;
  };
  tenantId?: string;
  tenant?: {
    id: string;
    name: string;
    status: string;
  };
  createdAt: string;
}

export interface CreateUserData {
  name?: string;
  email: string;
  password: string;
  role: string;
  customRoleId?: string;
  tenantId?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  customRoleId?: string;
  tenantId?: string;
}

class UsersService {
  async getAllUsers(): Promise<User[]> {
    const response = await fetch(API_URL, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    return response.json();
  }

  async getUserById(id: string): Promise<User> {
    const response = await fetch(`${API_URL}/${id}`, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }

    return response.json();
  }

  async createUser(data: CreateUserData): Promise<User> {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create user');
    }

    return response.json();
  }

  async updateUser(id: string, data: UpdateUserData): Promise<User> {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update user');
    }

    return response.json();
  }

  async deleteUser(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete user');
    }
  }

  async getUserPermissions(id: string): Promise<any> {
    const response = await fetch(`${API_URL}/${id}/permissions`, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch permissions');
    }

    return response.json();
  }
}

export const usersService = new UsersService();

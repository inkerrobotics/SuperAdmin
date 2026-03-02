const API_URL = '/api/roles';

export interface Permission {
  id?: string;
  module: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  permissions: Permission[];
  _count?: {
    users: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleData {
  name: string;
  description?: string;
  permissions: Permission[];
}

export interface UpdateRoleData {
  name?: string;
  description?: string;
  isActive?: boolean;
  permissions?: Permission[];
}

class RolesService {
  async getAllRoles(): Promise<Role[]> {
    const response = await fetch(API_URL, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch roles');
    }

    return response.json();
  }

  async getRoleById(id: string): Promise<Role> {
    const response = await fetch(`${API_URL}/${id}`, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch role');
    }

    return response.json();
  }

  async createRole(data: CreateRoleData): Promise<Role> {
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
      throw new Error(error.message || 'Failed to create role');
    }

    return response.json();
  }

  async updateRole(id: string, data: UpdateRoleData): Promise<Role> {
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
      throw new Error(error.message || 'Failed to update role');
    }

    return response.json();
  }

  async deleteRole(id: string, deleteUsers: boolean = false): Promise<void> {
    const url = deleteUsers ? `${API_URL}/${id}?deleteUsers=true` : `${API_URL}/${id}`;
    const response = await fetch(url, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
      const err: any = new Error(error.message || 'Failed to delete role');
      err.userCount = error.userCount;
      err.users = error.users;
      throw err;
    }
  }

  async getAvailableModules(): Promise<string[]> {
    const response = await fetch(`${API_URL}/modules`, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch modules');
    }

    return response.json();
  }
}

export const rolesService = new RolesService();

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const AVAILABLE_MODULES = [
  'Dashboard',
  'Tenants',
  'Users',
  'Reports',
  'Settings',
  'Roles'
];

export class RolesService {
  async getAllRoles() {
    return await prisma.customRole.findMany({
      include: {
        permissions: true,
        _count: {
          select: { users: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getRoleById(id: string) {
    const role = await prisma.customRole.findUnique({
      where: { id },
      include: {
        permissions: true,
        users: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      }
    });

    if (!role) {
      const error: any = new Error('Role not found');
      error.statusCode = 404;
      throw error;
    }

    return role;
  }

  async createRole(data: {
    name: string;
    description?: string;
    permissions: Array<{
      module: string;
      canView: boolean;
      canCreate: boolean;
      canEdit: boolean;
      canDelete: boolean;
    }>;
  }) {
    // Check if role name already exists
    const existing = await prisma.customRole.findUnique({
      where: { name: data.name }
    });

    if (existing) {
      const error: any = new Error('Role name already exists');
      error.statusCode = 400;
      throw error;
    }

    return await prisma.customRole.create({
      data: {
        name: data.name,
        description: data.description,
        permissions: {
          create: data.permissions
        }
      },
      include: {
        permissions: true
      }
    });
  }

  async updateRole(
    id: string,
    data: {
      name?: string;
      description?: string;
      isActive?: boolean;
      permissions?: Array<{
        module: string;
        canView: boolean;
        canCreate: boolean;
        canEdit: boolean;
        canDelete: boolean;
      }>;
    }
  ) {
    const role = await prisma.customRole.findUnique({ where: { id } });

    if (!role) {
      const error: any = new Error('Role not found');
      error.statusCode = 404;
      throw error;
    }

    // If updating name, check for duplicates
    if (data.name && data.name !== role.name) {
      const existing = await prisma.customRole.findUnique({
        where: { name: data.name }
      });

      if (existing) {
        const error: any = new Error('Role name already exists');
        error.statusCode = 400;
        throw error;
      }
    }

    // Update role and permissions
    if (data.permissions) {
      // Delete existing permissions
      await prisma.rolePermission.deleteMany({
        where: { roleId: id }
      });

      // Create new permissions (only include the fields needed for creation)
      const permissionsToCreate = data.permissions.map(p => ({
        module: p.module,
        canView: p.canView,
        canCreate: p.canCreate,
        canEdit: p.canEdit,
        canDelete: p.canDelete
      }));

      return await prisma.customRole.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          isActive: data.isActive,
          permissions: {
            create: permissionsToCreate
          }
        },
        include: {
          permissions: true
        }
      });
    }

    return await prisma.customRole.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        isActive: data.isActive
      },
      include: {
        permissions: true
      }
    });
  }

  async deleteRole(id: string, options?: { deleteUsers?: boolean }) {
    const role = await prisma.customRole.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            role: true
          }
        },
        _count: {
          select: { users: true }
        }
      }
    });

    if (!role) {
      const error: any = new Error('Role not found');
      error.statusCode = 404;
      throw error;
    }

    // If there are assigned users and deleteUsers option is true, delete them
    if (role._count.users > 0) {
      if (options?.deleteUsers) {
        // Delete all users assigned to this role
        await prisma.user.deleteMany({
          where: { customRoleId: id }
        });
      } else {
        // Return error with user count
        const error: any = new Error(`Cannot delete role with ${role._count.users} assigned user(s). Please confirm to delete users as well.`);
        error.statusCode = 400;
        error.userCount = role._count.users;
        error.users = role.users;
        throw error;
      }
    }

    // Delete the role (permissions will be cascade deleted)
    await prisma.customRole.delete({
      where: { id }
    });

    return { 
      message: 'Role deleted successfully',
      deletedUsers: options?.deleteUsers ? role._count.users : 0
    };
  }

  async getAvailableModules() {
    return AVAILABLE_MODULES;
  }
}

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export class UsersService {
  async getAllUsers() {
    return await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        customRoleId: true,
        customRole: {
          select: {
            id: true,
            name: true,
            isActive: true
          }
        },
        tenantId: true,
        tenant: {
          select: {
            id: true,
            name: true,
            status: true
          }
        },
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        customRoleId: true,
        customRole: {
          include: {
            permissions: true
          }
        },
        tenantId: true,
        tenant: true,
        createdAt: true
      }
    });

    if (!user) {
      const error: any = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    return user;
  }

  async createUser(data: {
    name?: string;
    email: string;
    password: string;
    role: string;
    customRoleId?: string;
    tenantId?: string;
  }) {
    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existing) {
      const error: any = new Error('Email already exists');
      error.statusCode = 400;
      throw error;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role as any,
        customRoleId: data.customRoleId,
        tenantId: data.tenantId
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        customRoleId: true,
        customRole: {
          select: {
            id: true,
            name: true
          }
        },
        tenantId: true,
        createdAt: true
      }
    });

    return user;
  }

  async updateUser(
    id: string,
    data: {
      name?: string;
      email?: string;
      password?: string;
      role?: string;
      customRoleId?: string;
      tenantId?: string;
    }
  ) {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      const error: any = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if email is being changed and if it already exists
    if (data.email && data.email !== user.email) {
      const existing = await prisma.user.findUnique({
        where: { email: data.email }
      });

      if (existing) {
        const error: any = new Error('Email already exists');
        error.statusCode = 400;
        throw error;
      }
    }

    // Hash password if provided
    let hashedPassword;
    if (data.password) {
      hashedPassword = await bcrypt.hash(data.password, 10);
    }

    // Update user
    const updated = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role as any,
        customRoleId: data.customRoleId,
        tenantId: data.tenantId
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        customRoleId: true,
        customRole: {
          select: {
            id: true,
            name: true
          }
        },
        tenantId: true,
        createdAt: true
      }
    });

    return updated;
  }

  async deleteUser(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      const error: any = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    // Prevent deleting super admin
    if (user.role === 'SUPER_ADMIN') {
      const error: any = new Error('Cannot delete Super Admin user');
      error.statusCode = 400;
      throw error;
    }

    await prisma.user.delete({ where: { id } });

    return { message: 'User deleted successfully' };
  }

  async getUserPermissions(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        customRole: {
          include: {
            permissions: true
          }
        }
      }
    });

    if (!user) {
      return null;
    }

    // If user has a custom role, return those permissions
    if (user.customRole && user.customRole.isActive) {
      return user.customRole.permissions;
    }

    // If SUPER_ADMIN, return all permissions
    if (user.role === 'SUPER_ADMIN') {
      return 'ALL';
    }

    return [];
  }
}

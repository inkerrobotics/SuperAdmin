import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { ActivityLogsService } from './activity-logs.service';
import { EmailService } from './email.service';

const prisma = new PrismaClient();
const activityLogsService = new ActivityLogsService();
const emailService = new EmailService();

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
    password?: string;
    role: string;
    customRoleId?: string;
    tenantId?: string;
    sendEmail?: boolean;
  }, createdBy?: { userId: string; ipAddress?: string; userAgent?: string }) {
    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existing) {
      const error: any = new Error('Email already exists');
      error.statusCode = 400;
      throw error;
    }

    // Generate temporary password if not provided
    const temporaryPassword = data.password || emailService.generateTemporaryPassword();
    
    // Hash password
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

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

    // Log activity
    if (createdBy && createdBy.userId) {
      try {
        // Verify the user exists before logging
        const logUser = await prisma.user.findUnique({
          where: { id: createdBy.userId },
          select: { id: true }
        });

        if (logUser) {
          await activityLogsService.createLog({
            userId: createdBy.userId,
            action: 'create_user',
            module: 'Users',
            description: `Created new user: ${user.email} (${user.name || 'No name'}) with role: ${user.customRole?.name || user.role}`,
            ipAddress: createdBy.ipAddress,
            userAgent: createdBy.userAgent,
            status: 'success',
            metadata: {
              createdUserId: user.id,
              createdUserEmail: user.email,
              createdUserRole: user.role,
              customRoleId: user.customRoleId
            }
          });
        }
      } catch (logError) {
        console.error('Failed to log activity:', logError);
        // Don't fail user creation if logging fails
      }
    }

    // Send credentials email if requested (default: true)
    if (data.sendEmail !== false) {
      try {
        const emailResult = await emailService.sendCredentialsEmail({
          userId: user.id,
          email: user.email,
          name: user.name || user.email,
          temporaryPassword: temporaryPassword
        });

        // Log email sending activity
        if (createdBy && createdBy.userId) {
          try {
            await activityLogsService.createLog({
              userId: createdBy.userId,
              action: 'send_credentials_email',
              module: 'Users',
              description: `${emailResult.success ? 'Successfully sent' : 'Failed to send'} credentials email to: ${user.email}`,
              ipAddress: createdBy.ipAddress,
              userAgent: createdBy.userAgent,
              status: emailResult.success ? 'success' : 'failed',
              metadata: {
                recipientUserId: user.id,
                recipientEmail: user.email,
                emailStatus: emailResult.success ? 'sent' : 'failed',
                error: emailResult.error
              }
            });
          } catch (logError) {
            console.error('Failed to log email activity:', logError);
          }
        }
      } catch (emailError: any) {
        // Log email error but don't fail user creation
        console.error('Failed to send credentials email:', emailError.message);
        if (createdBy && createdBy.userId) {
          try {
            await activityLogsService.createLog({
              userId: createdBy.userId,
              action: 'send_credentials_email',
              module: 'Users',
              description: `Failed to send credentials email to: ${user.email}`,
              ipAddress: createdBy.ipAddress,
              userAgent: createdBy.userAgent,
              status: 'failed',
              metadata: {
                recipientUserId: user.id,
                recipientEmail: user.email,
                emailStatus: 'failed',
                error: emailError.message
              }
            });
          } catch (logError) {
            console.error('Failed to log email error:', logError);
          }
        }
      }
    }

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
    },
    updatedBy?: { userId: string; ipAddress?: string; userAgent?: string }
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

    // Log activity
    if (updatedBy) {
      const changes = [];
      if (data.name) changes.push(`name to "${data.name}"`);
      if (data.email) changes.push(`email to "${data.email}"`);
      if (data.password) changes.push('password');
      if (data.role) changes.push(`role to "${data.role}"`);
      if (data.customRoleId) changes.push('custom role');

      await activityLogsService.createLog({
        userId: updatedBy.userId,
        action: 'update_user',
        module: 'Users',
        description: `Updated user: ${updated.email} - Changed: ${changes.join(', ')}`,
        ipAddress: updatedBy.ipAddress,
        userAgent: updatedBy.userAgent,
        status: 'success',
        metadata: {
          updatedUserId: updated.id,
          updatedUserEmail: updated.email,
          changes: data
        }
      });
    }

    return updated;
  }

  async deleteUser(id: string, deletedBy?: { userId: string; ipAddress?: string; userAgent?: string }) {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      const error: any = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    // Prevent deleting admin
    if (user.role === 'ADMIN') {
      const error: any = new Error('Cannot delete Admin user');
      error.statusCode = 400;
      throw error;
    }

    await prisma.user.delete({ where: { id } });

    // Log activity
    if (deletedBy) {
      await activityLogsService.createLog({
        userId: deletedBy.userId,
        action: 'delete_user',
        module: 'Users',
        description: `Deleted user: ${user.email} (${user.name || 'No name'})`,
        ipAddress: deletedBy.ipAddress,
        userAgent: deletedBy.userAgent,
        status: 'success',
        metadata: {
          deletedUserId: user.id,
          deletedUserEmail: user.email,
          deletedUserRole: user.role
        }
      });
    }

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

    // If ADMIN, return all permissions
    if (user.role === 'ADMIN') {
      return 'ALL';
    }

    return [];
  }

  async resendCredentials(userId: string, resendBy?: { userId: string; ipAddress?: string; userAgent?: string }) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    if (!user) {
      const error: any = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    // Generate new temporary password
    const temporaryPassword = emailService.generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    // Update user with new password and reset flags
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        lastLoginAt: new Date()
      }
    });

    // Send credentials email
    const emailResult = await emailService.resendCredentialsEmail({
      userId: user.id,
      email: user.email,
      name: user.name || user.email,
      temporaryPassword: temporaryPassword
    });

    // Log activity
    if (resendBy) {
      await activityLogsService.createLog({
        userId: resendBy.userId,
        action: 'resend_credentials',
        module: 'Users',
        description: `Resent credentials to user: ${user.email}`,
        ipAddress: resendBy.ipAddress,
        userAgent: resendBy.userAgent,
        status: emailResult.success ? 'success' : 'failed',
        metadata: {
          targetUserId: user.id,
          targetUserEmail: user.email,
          emailStatus: emailResult.success ? 'sent' : 'failed',
          error: emailResult.error
        }
      });
    }

    return {
      success: emailResult.success,
      message: emailResult.success 
        ? 'Credentials sent successfully' 
        : `Failed to send credentials: ${emailResult.error}`
    };
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      const error: any = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    // Verify old password
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      const error: any = new Error('Current password is incorrect');
      error.statusCode = 400;
      throw error;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and reset flags
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        lastLoginAt: new Date()
      }
    });

    // Log activity
    await activityLogsService.createLog({
      userId: userId,
      action: 'change_password',
      module: 'Auth',
      description: `User changed their password`,
      status: 'success'
    });

    return { message: 'Password changed successfully' };
  }
}

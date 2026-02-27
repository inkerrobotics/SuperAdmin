import jwt, { SignOptions } from 'jsonwebtoken';
import { PrismaClient, Role } from '@prisma/client';
import { ActivityLogsService } from './activity-logs.service';
import { SessionService } from './session.service';

const prisma = new PrismaClient();
const activityLogsService = new ActivityLogsService();
const sessionService = new SessionService();

export class AuthService {
  async loginSuperAdmin(email: string, password: string, metadata?: { ipAddress?: string; userAgent?: string }) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Log failed login attempt
      await activityLogsService.createLog({
        action: 'login',
        module: 'Auth',
        description: `Failed login attempt for email: ${email} (User not found)`,
        ipAddress: metadata?.ipAddress,
        userAgent: metadata?.userAgent,
        status: 'failed'
      });

      const error: any = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    if (user.role !== Role.ADMIN) {
      // Log unauthorized access attempt
      await activityLogsService.createLog({
        userId: user.id,
        action: 'login',
        module: 'Auth',
        description: `Unauthorized login attempt: ${email} (Not an Admin)`,
        ipAddress: metadata?.ipAddress,
        userAgent: metadata?.userAgent,
        status: 'failed'
      });

      const error: any = new Error('Unauthorized: Super Admin access only');
      error.statusCode = 403;
      throw error;
    }

    // Plain text password comparison (passwords stored as plain text for Lucky Draw system)
    if (password !== user.password) {
      // Log failed login attempt
      await activityLogsService.createLog({
        userId: user.id,
        action: 'login',
        module: 'Auth',
        description: `Failed login attempt for: ${email} (Invalid password)`,
        ipAddress: metadata?.ipAddress,
        userAgent: metadata?.userAgent,
        status: 'failed'
      });

      const error: any = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    const jwtSecret = process.env.JWT_SECRET || 'default-secret';
    const jwtExpiry = (process.env.JWT_EXPIRES_IN || '24h') as string;
    
    const payload = { 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    };
    
    const options: SignOptions = { 
      expiresIn: jwtExpiry as any
    };
    
    const token = jwt.sign(payload, jwtSecret, options);

    // Log successful login
    await activityLogsService.createLog({
      userId: user.id,
      action: 'login',
      module: 'Auth',
      description: `Successful login: ${email} (Super Admin)`,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
      status: 'success'
    });

    // Create session
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    await sessionService.createSession({
      userId: user.id,
      token,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
      expiresAt
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    };
  }

  async login(email: string, password: string, metadata?: { ipAddress?: string; userAgent?: string }) {
    const user = await prisma.user.findUnique({ 
      where: { email },
      include: {
        customRole: {
          include: {
            permissions: true
          }
        }
      }
    });

    if (!user) {
      // Log failed login attempt
      await activityLogsService.createLog({
        action: 'login',
        module: 'Auth',
        description: `Failed login attempt for email: ${email} (User not found)`,
        ipAddress: metadata?.ipAddress,
        userAgent: metadata?.userAgent,
        status: 'failed'
      });

      const error: any = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    // Plain text password comparison (passwords stored as plain text for Lucky Draw system)
    if (password !== user.password) {
      // Log failed login attempt
      await activityLogsService.createLog({
        userId: user.id,
        action: 'login',
        module: 'Auth',
        description: `Failed login attempt for: ${email} (Invalid password)`,
        ipAddress: metadata?.ipAddress,
        userAgent: metadata?.userAgent,
        status: 'failed'
      });

      const error: any = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    const jwtSecret = process.env.JWT_SECRET || 'default-secret';
    const jwtExpiry = (process.env.JWT_EXPIRES_IN || '24h') as string;
    
    const payload = { 
      userId: user.id, 
      email: user.email, 
      role: user.role,
      customRoleId: user.customRoleId
    };
    
    const options: SignOptions = { 
      expiresIn: jwtExpiry as any
    };
    
    const token = jwt.sign(payload, jwtSecret, options);

    // Update last login time
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Log successful login
    await activityLogsService.createLog({
      userId: user.id,
      action: 'login',
      module: 'Auth',
      description: `Successful login: ${email} (${user.customRole?.name || user.role})`,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
      status: 'success'
    });

    // Create session
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    await sessionService.createSession({
      userId: user.id,
      token,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
      expiresAt
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        customRole: user.customRole
      }
    };
  }
}

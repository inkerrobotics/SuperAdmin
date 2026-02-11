import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

export class AuthService {
  async loginSuperAdmin(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      const error: any = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    if (user.role !== Role.SUPER_ADMIN) {
      const error: any = new Error('Unauthorized: Super Admin access only');
      error.statusCode = 403;
      throw error;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
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

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    };
  }
}

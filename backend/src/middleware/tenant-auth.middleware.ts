import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/**
 * Middleware to verify tenant JWT token
 */
export const verifyTenantToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from cookie or Authorization header
    const token = req.cookies.tenant_token || 
                  req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;

    // Check if it's a tenant token
    if (decoded.type !== 'tenant') {
      return res.status(403).json({ message: 'Invalid token type' });
    }

    // Attach tenant info to request
    (req as any).tenant = {
      tenantId: decoded.tenantId,
      tenantIdentifier: decoded.tenantIdentifier,
      email: decoded.email
    };

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};

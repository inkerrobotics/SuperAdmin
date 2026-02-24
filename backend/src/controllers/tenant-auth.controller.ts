import { Request, Response } from 'express';
import { TenantAuthService } from '../services/tenant-auth.service';

const tenantAuthService = new TenantAuthService();

/**
 * Tenant login for Lucky Draw System
 */
export const tenantLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await tenantAuthService.tenantLogin({
      email,
      password,
      ipAddress,
      userAgent
    });

    // Set HTTP-only cookie for security
    res.cookie('tenant_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json({
      message: 'Login successful',
      tenant: result.tenant,
      token: result.token
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

/**
 * Get tenant profile
 */
export const getTenantProfile = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenant?.tenantId;

    if (!tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const profile = await tenantAuthService.getTenantProfile(tenantId);
    res.json(profile);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

/**
 * Update WhatsApp credentials
 */
export const updateWhatsAppCredentials = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenant?.tenantId;

    if (!tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const result = await tenantAuthService.updateWhatsAppCredentials(tenantId, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

/**
 * Tenant logout
 */
export const tenantLogout = (req: Request, res: Response) => {
  res.clearCookie('tenant_token');
  res.json({ message: 'Logout successful' });
};

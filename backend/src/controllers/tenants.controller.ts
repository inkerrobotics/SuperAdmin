import { Request, Response } from 'express';
import { TenantsService } from '../services/tenants.service';

const tenantsService = new TenantsService();

export const getAllTenants = async (req: Request, res: Response) => {
  try {
    const filters = {
      status: req.query.status as string,
      search: req.query.search as string,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20
    };

    const result = await tenantsService.getAllTenants(filters);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getTenantById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenant = await tenantsService.getTenantById(id);
    res.json(tenant);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const getTenantStats = async (req: Request, res: Response) => {
  try {
    const stats = await tenantsService.getTenantStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTenantStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    const userId = (req as any).user?.userId;
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await tenantsService.updateTenantStatus(
      id,
      status,
      reason,
      userId,
      { ipAddress, userAgent }
    );

    res.json(result);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const getTenantStatusHistory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const history = await tenantsService.getTenantStatusHistory(id);
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const bulkUpdateStatus = async (req: Request, res: Response) => {
  try {
    const { tenantIds, status, reason } = req.body;
    const userId = (req as any).user?.userId;
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await tenantsService.bulkUpdateStatus(
      tenantIds,
      status,
      reason,
      userId,
      { ipAddress, userAgent }
    );

    res.json(result);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const createTenant = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const tenant = await tenantsService.createTenant(req.body, userId);
    res.status(201).json(tenant);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const updateTenantCredentials = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;
    const result = await tenantsService.updateTenantCredentials(id, req.body, userId);
    res.json(result);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

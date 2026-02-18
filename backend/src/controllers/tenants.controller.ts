import { Request, Response } from 'express';
import { TenantsService } from '../services/tenants.service';
import { TenantStatus } from '@prisma/client';

const tenantsService = new TenantsService();

export const getAllTenants = async (req: Request, res: Response) => {
  try {
    const filters = {
      status: req.query.status as string,
      search: req.query.search as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20
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

export const updateTenantStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    const userId = (req as any).user?.userId;

    if (!status || !reason) {
      return res.status(400).json({ 
        message: 'Status and reason are required' 
      });
    }

    // Validate status
    if (!Object.values(TenantStatus).includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status. Must be one of: ACTIVE, INACTIVE, PENDING, SUSPENDED' 
      });
    }

    const metadata = {
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    };

    const tenant = await tenantsService.updateTenantStatus(
      id,
      status as TenantStatus,
      reason,
      userId,
      metadata
    );

    res.json({ 
      message: 'Tenant status updated successfully',
      tenant 
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const getTenantStatusHistory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

    const history = await tenantsService.getTenantStatusHistory(id, limit);
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
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

export const bulkUpdateStatus = async (req: Request, res: Response) => {
  try {
    const { tenantIds, status, reason } = req.body;
    const userId = (req as any).user?.userId;

    if (!tenantIds || !Array.isArray(tenantIds) || tenantIds.length === 0) {
      return res.status(400).json({ 
        message: 'tenantIds array is required' 
      });
    }

    if (!status || !reason) {
      return res.status(400).json({ 
        message: 'Status and reason are required' 
      });
    }

    // Validate status
    if (!Object.values(TenantStatus).includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status. Must be one of: ACTIVE, INACTIVE, PENDING, SUSPENDED' 
      });
    }

    const metadata = {
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    };

    const result = await tenantsService.bulkUpdateStatus(
      tenantIds,
      status as TenantStatus,
      reason,
      userId,
      metadata
    );

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

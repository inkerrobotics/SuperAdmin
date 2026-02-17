import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service';

const dashboardService = new DashboardService();

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const stats = await dashboardService.getPlatformStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getTenantGrowth = async (req: Request, res: Response) => {
  try {
    const growth = await dashboardService.getTenantGrowthStats();
    res.json(growth);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserDistribution = async (req: Request, res: Response) => {
  try {
    const distribution = await dashboardService.getUserDistribution();
    res.json(distribution);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getStatusDistribution = async (req: Request, res: Response) => {
  try {
    const distribution = await dashboardService.getStatusDistribution();
    res.json(distribution);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getRecentTenants = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const tenants = await dashboardService.getRecentTenants(limit);
    res.json(tenants);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getTenantDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenant = await dashboardService.getTenantById(id);
    res.json(tenant);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

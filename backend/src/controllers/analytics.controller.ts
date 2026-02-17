import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics.service';

const analyticsService = new AnalyticsService();

export const getCampaignAnalytics = async (req: Request, res: Response) => {
  try {
    const { campaignId } = req.params;
    const analytics = await analyticsService.getCampaignAnalytics(campaignId);
    res.json(analytics);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const compareCampaigns = async (req: Request, res: Response) => {
  try {
    const tenantId = req.query.tenantId as string | undefined;
    const campaigns = await analyticsService.compareCampaigns(tenantId);
    res.json(campaigns);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getTenantAnalytics = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const analytics = await analyticsService.getTenantAnalytics(tenantId);
    res.json(analytics);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const exportCampaignReport = async (req: Request, res: Response) => {
  try {
    const { campaignId } = req.params;
    const report = await analyticsService.exportCampaignReport(campaignId);
    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

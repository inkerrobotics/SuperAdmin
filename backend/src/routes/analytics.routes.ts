import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import * as analyticsController from '../controllers/analytics.controller';

const router = Router();

router.get('/campaign/:campaignId', verifyToken, analyticsController.getCampaignAnalytics);
router.get('/compare', verifyToken, analyticsController.compareCampaigns);
router.get('/tenant/:tenantId', verifyToken, analyticsController.getTenantAnalytics);
router.get('/export/:campaignId', verifyToken, analyticsController.exportCampaignReport);

export default router;

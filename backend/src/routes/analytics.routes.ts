import { Router } from 'express';
import { getAnalytics, getSystemHealth } from '../controllers/analytics.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

router.use(verifyToken);

router.get('/', getAnalytics);
router.get('/health', getSystemHealth);

export default router;

import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import { getAllLogs, getLogStats, exportLogs } from '../controllers/activity-logs.controller';

const router = Router();

router.use(verifyToken);

router.get('/', getAllLogs);
router.get('/stats', getLogStats);
router.get('/export', exportLogs);

export default router;

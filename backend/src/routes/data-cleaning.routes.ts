import { Router } from 'express';
import {
  getStats,
  cleanupExpiredSessions,
  cleanupOldLogs,
  cleanupOldBackups,
  cleanupOrphanedData
} from '../controllers/data-cleaning.controller';
import { verifyToken, requireSuperAdmin } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication and super admin access
router.use(verifyToken);
router.use(requireSuperAdmin);

// Get cleanup statistics
router.get('/stats', getStats);

// Cleanup endpoints
router.post('/expired-sessions', cleanupExpiredSessions);
router.post('/old-logs', cleanupOldLogs);
router.post('/old-backups', cleanupOldBackups);
router.post('/orphaned-data', cleanupOrphanedData);

export default router;

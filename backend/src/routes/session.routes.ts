import { Router } from 'express';
import {
  getUserSessions,
  getUserSessionStats,
  getAllSessions,
  revokeSession,
  revokeAllSessions,
  getSessionStats,
  getSessionsByDevice,
  cleanupExpiredSessions
} from '../controllers/session.controller';
import { verifyToken, requireSuperAdmin } from '../middleware/auth.middleware';

const router = Router();

router.use(verifyToken);

// User's own sessions
router.get('/my-sessions', getUserSessions);
router.get('/my-stats', getUserSessionStats);
router.post('/revoke-all', revokeAllSessions);

// Admin routes
router.get('/stats', requireSuperAdmin, getSessionStats);
router.get('/devices', requireSuperAdmin, getSessionsByDevice);
router.get('/', requireSuperAdmin, getAllSessions);
router.post('/cleanup', requireSuperAdmin, cleanupExpiredSessions);
router.post('/:id/revoke', revokeSession);

export default router;

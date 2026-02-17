import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import {
  getAllBackups,
  createManualBackup,
  scheduleBackup,
  updateBackupStatus,
  deleteBackup,
  getBackupStats
} from '../controllers/backups.controller';

const router = Router();

router.use(verifyToken);

// Stats (must be before /:id routes)
router.get('/stats', getBackupStats);

// Backups
router.get('/', getAllBackups);
router.post('/manual', createManualBackup);
router.post('/schedule', scheduleBackup);
router.put('/:id/status', updateBackupStatus);
router.delete('/:id', deleteBackup);

export default router;

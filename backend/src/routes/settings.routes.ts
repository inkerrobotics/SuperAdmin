import { Router } from 'express';
import {
  getAllSettings,
  getSettingsByCategory,
  updateSettings,
  getHistory,
  restoreSetting,
  initializeDefaults
} from '../controllers/settings.controller';
import { verifyToken, requireSuperAdmin } from '../middleware/auth.middleware';

const router = Router();

router.use(verifyToken, requireSuperAdmin);

router.get('/', getAllSettings);
router.get('/history', getHistory);
router.post('/initialize', initializeDefaults);
router.get('/:category', getSettingsByCategory);
router.put('/:category', updateSettings);
router.post('/restore/:historyId', restoreSetting);

export default router;

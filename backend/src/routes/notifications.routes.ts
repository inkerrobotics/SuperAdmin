import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import {
  getAllTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getAllNotifications,
  createNotification,
  scheduleNotification,
  sendNotification,
  getNotificationStats
} from '../controllers/notifications.controller';

const router = Router();

router.use(verifyToken);

// Stats (must be before /:id routes)
router.get('/stats', getNotificationStats);

// Templates
router.get('/templates', getAllTemplates);
router.post('/templates', createTemplate);
router.put('/templates/:id', updateTemplate);
router.delete('/templates/:id', deleteTemplate);

// Notifications
router.get('/', getAllNotifications);
router.post('/', createNotification);
router.post('/schedule', scheduleNotification);
router.post('/:id/send', sendNotification);

export default router;

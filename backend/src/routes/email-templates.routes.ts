import { Router } from 'express';
import {
  getAllTemplates,
  getTemplateByType,
  updateTemplate,
  restoreDefault,
  testSend,
  initializeDefaults
} from '../controllers/email-templates.controller';
import { verifyToken, requireSuperAdmin } from '../middleware/auth.middleware';

const router = Router();

router.use(verifyToken, requireSuperAdmin);

router.get('/', getAllTemplates);
router.post('/initialize', initializeDefaults);
router.get('/:type', getTemplateByType);
router.put('/:type', updateTemplate);
router.post('/:type/restore', restoreDefault);
router.post('/:type/test', testSend);

export default router;

import { Router } from 'express';
import {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  getAvailableModules
} from '../controllers/roles.controller';
import { verifyToken, requireSuperAdmin } from '../middleware/auth.middleware';

const router = Router();

router.use(verifyToken, requireSuperAdmin);

router.get('/', getAllRoles);
router.get('/modules', getAvailableModules);
router.get('/:id', getRoleById);
router.post('/', createRole);
router.put('/:id', updateRole);
router.delete('/:id', deleteRole);

export default router;

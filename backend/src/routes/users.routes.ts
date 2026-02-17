import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserPermissions
} from '../controllers/users.controller';
import { verifyToken, requireSuperAdmin } from '../middleware/auth.middleware';

const router = Router();

router.use(verifyToken, requireSuperAdmin);

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.get('/:id/permissions', getUserPermissions);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;

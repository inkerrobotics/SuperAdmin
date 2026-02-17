import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserPermissions,
  resendCredentials,
  changePassword
} from '../controllers/users.controller';
import { verifyToken, requireSuperAdmin } from '../middleware/auth.middleware';

const router = Router();

router.use(verifyToken);

// Change password (any authenticated user)
router.post('/change-password', changePassword);

// Super Admin only routes
router.use(requireSuperAdmin);

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.get('/:id/permissions', getUserPermissions);
router.post('/', createUser);
router.post('/:id/resend-credentials', resendCredentials);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;

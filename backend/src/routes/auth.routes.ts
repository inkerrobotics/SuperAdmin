import { Router } from 'express';
import { superAdminLogin, logout } from '../controllers/auth.controller';

const router = Router();

router.post('/super-admin/login', superAdminLogin);
router.post('/logout', logout);

export default router;

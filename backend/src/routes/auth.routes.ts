import { Router } from 'express';
import { superAdminLogin, login, logout } from '../controllers/auth.controller';

const router = Router();

router.post('/super-admin/login', superAdminLogin);
router.post('/login', login);
router.post('/logout', logout);

export default router;

import { Router } from 'express';
import {
  tenantLogin,
  getTenantProfile,
  updateWhatsAppCredentials,
  tenantLogout
} from '../controllers/tenant-auth.controller';
import { verifyTenantToken } from '../middleware/tenant-auth.middleware';

const router = Router();

// Public routes
router.post('/login', tenantLogin);
router.post('/logout', tenantLogout);

// Protected routes (require tenant authentication)
router.get('/profile', verifyTenantToken, getTenantProfile);
router.patch('/whatsapp-credentials', verifyTenantToken, updateWhatsAppCredentials);

export default router;

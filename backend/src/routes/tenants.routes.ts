import { Router } from 'express';
import {
  getAllTenants,
  getTenantById,
  updateTenantStatus,
  getTenantStatusHistory,
  getTenantStats,
  bulkUpdateStatus
} from '../controllers/tenants.controller';
import { verifyToken, requireSuperAdmin } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(verifyToken);

// Get tenant statistics
router.get('/stats', getTenantStats);

// Get all tenants with filters
router.get('/', getAllTenants);

// Get tenant by ID
router.get('/:id', getTenantById);

// Get tenant status history
router.get('/:id/history', getTenantStatusHistory);

// Update tenant status (Super Admin only)
router.patch('/:id/status', requireSuperAdmin, updateTenantStatus);

// Bulk update tenant status (Super Admin only)
router.post('/bulk/status', requireSuperAdmin, bulkUpdateStatus);

export default router;

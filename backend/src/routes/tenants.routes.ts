import { Router } from 'express';
import {
  getAllTenants,
  getTenantById,
  updateTenantStatus,
  getTenantStatusHistory,
  getTenantStats,
  bulkUpdateStatus,
  createTenant,
  updateTenantCredentials
} from '../controllers/tenants.controller';
import { verifyToken, requireSuperAdmin } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(verifyToken);

// Get tenant statistics
router.get('/stats', getTenantStats);

// Get all tenants with filters
router.get('/', getAllTenants);

// Create new tenant (Super Admin only)
router.post('/create', requireSuperAdmin, createTenant);

// Get tenant by ID
router.get('/:id', getTenantById);

// Get tenant status history
router.get('/:id/history', getTenantStatusHistory);

// Update tenant status (Super Admin only)
router.patch('/:id/status', requireSuperAdmin, updateTenantStatus);

// Update tenant credentials (Super Admin only)
router.patch('/:id/credentials', requireSuperAdmin, updateTenantCredentials);

// Bulk update tenant status (Super Admin only)
router.post('/bulk/status', requireSuperAdmin, bulkUpdateStatus);

export default router;

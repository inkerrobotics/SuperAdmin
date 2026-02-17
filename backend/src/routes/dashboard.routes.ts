import { Router } from 'express';
import { 
  getDashboardStats, 
  getRecentTenants, 
  getTenantDetails,
  getTenantGrowth,
  getUserDistribution,
  getStatusDistribution
} from '../controllers/dashboard.controller';
import { verifyToken, requireSuperAdmin } from '../middleware/auth.middleware';

const router = Router();

router.use(verifyToken, requireSuperAdmin);

router.get('/stats', getDashboardStats);
router.get('/growth', getTenantGrowth);
router.get('/user-distribution', getUserDistribution);
router.get('/status-distribution', getStatusDistribution);
router.get('/recent-tenants', getRecentTenants);
router.get('/tenant/:id', getTenantDetails);

export default router;

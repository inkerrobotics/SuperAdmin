import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import * as dataCleaningController from '../controllers/data-cleaning.controller';

const router = Router();

router.get('/duplicates/:campaignId', verifyToken, dataCleaningController.detectDuplicates);
router.post('/mark-duplicates/:campaignId', verifyToken, dataCleaningController.markDuplicates);
router.post('/merge', verifyToken, dataCleaningController.mergeParticipants);
router.get('/validate-phones/:campaignId', verifyToken, dataCleaningController.validatePhoneNumbers);
router.get('/validate-emails/:campaignId', verifyToken, dataCleaningController.validateEmails);
router.post('/bulk-delete', verifyToken, dataCleaningController.bulkDelete);
router.get('/stats/:campaignId', verifyToken, dataCleaningController.getCleaningStats);

export default router;

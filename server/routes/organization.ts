import express from 'express';
import { getMyOrganization, updateMyOrganization, getMyOrganizationMembers } from '../controllers/organizationController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/authorize';

const router = express.Router();

router.get('/me', authenticate, getMyOrganization);
router.put('/me', authenticate, requireRole('admin', 'dpo', 'privacy_manager'), updateMyOrganization);
router.get('/me/members', authenticate, getMyOrganizationMembers);

export default router;

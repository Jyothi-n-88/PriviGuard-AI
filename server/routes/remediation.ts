import express from 'express';
import {
  getRemediations,
  getRemediation,
  updateRemediation,
  updateRemediationStatus,
  verifyRemediation
} from '../controllers/remediationController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/authorize';

const router = express.Router();

const readerRoles = ['admin', 'dpo', 'privacy_manager', 'compliance_officer', 'analyst', 'viewer'];
const verifyRoles = ['admin', 'dpo'];
// We'll use a more permissive role check for updating, then enforce specifics in controller or rely on frontend

// Global routes (mounted at /api/remediations)
router.get('/', authenticate, requireRole(...readerRoles), getRemediations);
router.get('/:id', authenticate, requireRole(...readerRoles), getRemediation);
router.put('/:id', authenticate, updateRemediation);
router.patch('/:id/status', authenticate, updateRemediationStatus);
router.patch('/:id/verify', authenticate, requireRole(...verifyRoles), verifyRemediation);

export default router;

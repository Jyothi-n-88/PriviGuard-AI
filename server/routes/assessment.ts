import express from 'express';
import {
  createAssessment,
  getAssessments,
  getAssessment,
  updateAssessment,
  deleteAssessment,
  recalculateRisk,
  submitDpoReview
} from '../controllers/assessmentController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/authorize';

const router = express.Router();

const writerRoles = ['admin', 'dpo', 'privacy_manager'];
const readerRoles = ['admin', 'dpo', 'privacy_manager', 'compliance_officer', 'analyst', 'viewer'];
const reviewerRoles = ['admin', 'dpo'];

router.get('/', authenticate, requireRole(...readerRoles), getAssessments);
router.get('/:id', authenticate, requireRole(...readerRoles), getAssessment);
router.post('/', authenticate, requireRole(...writerRoles), createAssessment);
router.put('/:id', authenticate, requireRole(...writerRoles), updateAssessment);
router.delete('/:id', authenticate, requireRole(...writerRoles), deleteAssessment);
router.post('/:id/recalculate-risk', authenticate, requireRole(...writerRoles), recalculateRisk);
router.put('/:id/review', authenticate, requireRole(...reviewerRoles), submitDpoReview);

export default router;

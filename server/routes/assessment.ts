import express from 'express';
import {
  createAssessment,
  getAssessments,
  getAssessment,
  updateAssessment,
  deleteAssessment,
  recalculateRisk,
  submitDpoReview,
  generateReport,
  getAuditLogs,
  getAssessmentVersions
} from '../controllers/assessmentController';
import { createRemediation, getAssessmentRemediations } from '../controllers/remediationController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/authorize';

const router = express.Router();

const writerRoles = ['admin', 'dpo', 'privacy_manager'];
const creatorRoles = ['admin', 'dpo', 'privacy_manager', 'compliance_officer'];
const readerRoles = ['admin', 'dpo', 'privacy_manager', 'compliance_officer', 'analyst', 'viewer'];
const reviewerRoles = ['admin', 'dpo'];

router.get('/', authenticate, requireRole(...readerRoles), getAssessments);
router.get('/:id', authenticate, requireRole(...readerRoles), getAssessment);
router.get('/:id/audit', authenticate, requireRole(...readerRoles), getAuditLogs);
router.get('/:id/versions', authenticate, requireRole(...readerRoles), getAssessmentVersions);
router.post('/', authenticate, requireRole(...writerRoles), createAssessment);
router.put('/:id', authenticate, requireRole(...writerRoles), updateAssessment);
router.delete('/:id', authenticate, requireRole(...writerRoles), deleteAssessment);
router.post('/:id/recalculate-risk', authenticate, requireRole(...writerRoles), recalculateRisk);
router.post('/:id/generate-report', authenticate, requireRole(...writerRoles), generateReport);
router.put('/:id/review', authenticate, requireRole(...reviewerRoles), submitDpoReview);
router.post('/:id/remediations', authenticate, requireRole(...creatorRoles), createRemediation);
router.get('/:id/remediations', authenticate, requireRole(...readerRoles), getAssessmentRemediations);

export default router;

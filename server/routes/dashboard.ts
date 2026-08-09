import express from 'express';
import { getDashboardSummary, getDashboardActivity } from '../controllers/dashboardController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/overview', authenticate, getDashboardSummary);
router.get('/activity', authenticate, getDashboardActivity);

export default router;

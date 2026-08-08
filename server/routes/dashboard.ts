import express from 'express';
import { getDashboardSummary } from '../controllers/dashboardController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/summary', authenticate, getDashboardSummary);

export default router;

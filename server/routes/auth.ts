import express from 'express';
import { register, login, getCurrentUser, adminTest, verifyEmailOtp, resendEmailOtp } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/authorize';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getCurrentUser);
router.get('/admin-test', authenticate, requireRole('admin'), adminTest);

router.post('/verify-email-otp', verifyEmailOtp);
router.post('/resend-email-otp', resendEmailOtp);

export default router;

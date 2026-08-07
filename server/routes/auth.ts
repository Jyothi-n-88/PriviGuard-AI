import express from 'express';
import { register, login, getCurrentUser, adminTest, verifyEmail, resendVerification } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/authorize';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getCurrentUser);
router.get('/admin-test', authenticate, requireRole('admin'), adminTest);

router.get('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);

export default router;
